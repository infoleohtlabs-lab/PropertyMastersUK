import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Booking } from './entities/booking.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { BookingStatus, BookingType } from './entities/booking.entity';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
  ) {}

  async create(createBookingDto: CreateBookingDto): Promise<Booking> {
    // Check for scheduling conflicts
    await this.checkSchedulingConflict(
      createBookingDto.agentId,
      createBookingDto.scheduledDate,
      createBookingDto.scheduledTime,
      createBookingDto.duration
    );

    try {
      const booking = this.bookingRepository.create({
        ...createBookingDto,
        status: BookingStatus.PENDING,
      });
      return await this.bookingRepository.save(booking);
    } catch (error) {
      throw new BadRequestException('Failed to create booking');
    }
  }

  async findAll(): Promise<Booking[]> {
    return await this.bookingRepository.find({
      relations: ['property', 'agent', 'client'],
      order: { scheduledDate: 'ASC', scheduledTime: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { id },
      relations: ['property', 'agent', 'client'],
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return booking;
  }

  async findByAgent(agentId: string, startDate?: Date, endDate?: Date): Promise<Booking[]> {
    const whereCondition: any = { agentId };
    
    if (startDate && endDate) {
      whereCondition.scheduledDate = Between(startDate, endDate);
    }

    return await this.bookingRepository.find({
      where: whereCondition,
      relations: ['property', 'client'],
      order: { scheduledDate: 'ASC', scheduledTime: 'ASC' },
    });
  }

  async findByClient(clientId: string): Promise<Booking[]> {
    return await this.bookingRepository.find({
      where: { clientId },
      relations: ['property', 'agent'],
      order: { scheduledDate: 'ASC', scheduledTime: 'ASC' },
    });
  }

  async findByProperty(propertyId: string): Promise<Booking[]> {
    return await this.bookingRepository.find({
      where: { propertyId },
      relations: ['agent', 'client'],
      order: { scheduledDate: 'ASC', scheduledTime: 'ASC' },
    });
  }

  async update(id: string, updateBookingDto: UpdateBookingDto): Promise<Booking> {
    const booking = await this.findOne(id);
    
    // Check for scheduling conflicts if date/time is being updated
    if (updateBookingDto.scheduledDate || updateBookingDto.scheduledTime || updateBookingDto.duration) {
      await this.checkSchedulingConflict(
        updateBookingDto.agentId || booking.agentId,
        updateBookingDto.scheduledDate || booking.scheduledDate,
        updateBookingDto.scheduledTime || booking.scheduledTime,
        updateBookingDto.duration || booking.duration,
        id // Exclude current booking from conflict check
      );
    }
    
    Object.assign(booking, updateBookingDto);
    
    try {
      return await this.bookingRepository.save(booking);
    } catch (error) {
      throw new BadRequestException('Failed to update booking');
    }
  }

  async cancel(id: string, cancelReason?: string): Promise<Booking> {
    const booking = await this.findOne(id);
    
    booking.status = BookingStatus.CANCELLED;
    booking.cancelledAt = new Date();
    booking.cancelReason = cancelReason;
    
    return await this.bookingRepository.save(booking);
  }

  async confirm(id: string): Promise<Booking> {
    const booking = await this.findOne(id);
    
    booking.status = BookingStatus.CONFIRMED;
    
    return await this.bookingRepository.save(booking);
  }

  async complete(id: string, feedback?: any): Promise<Booking> {
    const booking = await this.findOne(id);
    
    booking.status = BookingStatus.COMPLETED;
    booking.feedback = feedback;
    
    return await this.bookingRepository.save(booking);
  }

  async reschedule(id: string, newDate: Date, newTime: string, duration?: number): Promise<Booking> {
    const booking = await this.findOne(id);
    
    // Check for scheduling conflicts
    await this.checkSchedulingConflict(
      booking.agentId,
      newDate,
      newTime,
      duration || booking.duration,
      id
    );
    
    booking.rescheduledFrom = `${booking.scheduledDate} ${booking.scheduledTime}`;
    booking.scheduledDate = newDate;
    booking.scheduledTime = newTime;
    if (duration) booking.duration = duration;
    
    return await this.bookingRepository.save(booking);
  }

  async getUpcomingBookings(agentId: string, days: number = 7): Promise<Booking[]> {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + days);

    return await this.bookingRepository.find({
      where: {
        agentId,
        scheduledDate: Between(startDate, endDate),
        status: BookingStatus.CONFIRMED,
      },
      relations: ['property', 'client'],
      order: { scheduledDate: 'ASC', scheduledTime: 'ASC' },
    });
  }

  async getBookingStats(agentId?: string): Promise<any> {
    const whereCondition = agentId ? { agentId } : {};
    
    const totalBookings = await this.bookingRepository.count({ where: whereCondition });
    const pendingBookings = await this.bookingRepository.count({ 
      where: { ...whereCondition, status: BookingStatus.PENDING } 
    });
    const confirmedBookings = await this.bookingRepository.count({ 
      where: { ...whereCondition, status: BookingStatus.CONFIRMED } 
    });
    const completedBookings = await this.bookingRepository.count({ 
      where: { ...whereCondition, status: BookingStatus.COMPLETED } 
    });
    const cancelledBookings = await this.bookingRepository.count({ 
      where: { ...whereCondition, status: BookingStatus.CANCELLED } 
    });

    return {
      totalBookings,
      pendingBookings,
      confirmedBookings,
      completedBookings,
      cancelledBookings,
      completionRate: totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 0,
      cancellationRate: totalBookings > 0 ? (cancelledBookings / totalBookings) * 100 : 0,
    };
  }

  private async checkSchedulingConflict(
    agentId: string,
    scheduledDate: Date,
    scheduledTime: string,
    duration: number,
    excludeBookingId?: string
  ): Promise<void> {
    const whereCondition: any = {
      agentId,
      scheduledDate,
      status: BookingStatus.CONFIRMED,
    };

    if (excludeBookingId) {
      whereCondition.id = { $ne: excludeBookingId };
    }

    const existingBookings = await this.bookingRepository.find({
      where: whereCondition,
    });

    // Check for time conflicts
    const [newHour, newMinute] = scheduledTime.split(':').map(Number);
    const newStartMinutes = newHour * 60 + newMinute;
    const newEndMinutes = newStartMinutes + duration;

    for (const booking of existingBookings) {
      const [existingHour, existingMinute] = booking.scheduledTime.split(':').map(Number);
      const existingStartMinutes = existingHour * 60 + existingMinute;
      const existingEndMinutes = existingStartMinutes + booking.duration;

      // Check for overlap
      if (
        (newStartMinutes < existingEndMinutes && newEndMinutes > existingStartMinutes)
      ) {
        throw new ConflictException('Scheduling conflict detected');
      }
    }
  }
}
