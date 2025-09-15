import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Booking, BookingStatus, BookingType } from './entities/booking.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
  ) {}

  async create(createBookingDto: CreateBookingDto): Promise<Booking> {
    const scheduledDate = new Date(createBookingDto.scheduledDateTime);
    const scheduledTime = scheduledDate.toTimeString().slice(0, 5); // HH:MM format
    
    // Check for scheduling conflicts if agent is assigned
    if (createBookingDto.assignedAgentId) {
      const conflicts = await this.checkSchedulingConflicts(
        createBookingDto.assignedAgentId,
        scheduledDate,
        scheduledTime,
        createBookingDto.duration || 60
      );

      if (conflicts.length > 0) {
        throw new BadRequestException('Scheduling conflict detected. Agent is not available at the requested time.');
      }
    }

    // Map DTO properties to entity properties
    const bookingData = {
      propertyId: createBookingDto.propertyId,
      type: createBookingDto.type,
      scheduledDate,
      scheduledTime,
      duration: createBookingDto.duration,
      priority: createBookingDto.priority,
      notes: createBookingDto.notes,
      agentId: createBookingDto.assignedAgentId,
      contactEmail: createBookingDto.contactInfo.email,
      contactPhone: createBookingDto.contactInfo.phone,
      specialRequirements: createBookingDto.preferences?.specialRequirements,
      status: BookingStatus.PENDING,
    };

    const booking = this.bookingRepository.create(bookingData);
    return await this.bookingRepository.save(booking);
  }

  async findAll(): Promise<Booking[]> {
    return this.bookingRepository.find({
      relations: ['property', 'client', 'agent'],
      order: { scheduledAt: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { id },
      relations: ['property', 'client', 'agent'],
    });
    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }
    return booking;
  }

  async findByProperty(propertyId: string): Promise<Booking[]> {
    return this.bookingRepository.find({
      where: { propertyId },
      relations: ['property', 'client', 'agent'],
      order: { scheduledAt: 'ASC' },
    });
  }

  async findByAgent(agentId: string): Promise<Booking[]> {
    return this.bookingRepository.find({
      where: { assignedToId: agentId },
      relations: ['property', 'client', 'agent'],
      order: { scheduledAt: 'ASC' },
    });
  }

  async findByClient(clientId: string): Promise<Booking[]> {
    return this.bookingRepository.find({
      where: { bookedById: clientId },
      relations: ['property', 'client', 'agent'],
      order: { scheduledAt: 'ASC' },
    });
  }

  async findByUser(userId: string, options?: any): Promise<Booking[]> {
    const queryBuilder = this.bookingRepository.createQueryBuilder('booking')
      .leftJoinAndSelect('booking.property', 'property')
      .leftJoinAndSelect('booking.client', 'client')
      .leftJoinAndSelect('booking.agent', 'agent')
      .where('booking.clientId = :userId OR booking.agentId = :userId', { userId });

    if (options?.status) {
      queryBuilder.andWhere('booking.status = :status', { status: options.status });
    }

    return queryBuilder
      .orderBy('booking.scheduledAt', 'ASC')
      .getMany();
  }

  async findByDateRange(startDate: Date, endDate: Date, agentId?: string): Promise<Booking[]> {
    const queryBuilder = this.bookingRepository.createQueryBuilder('booking')
      .leftJoinAndSelect('booking.property', 'property')
      .leftJoinAndSelect('booking.client', 'client')
      .leftJoinAndSelect('booking.agent', 'agent')
      .where('booking.scheduledAt BETWEEN :startDate AND :endDate', { startDate, endDate });

    if (agentId) {
      queryBuilder.andWhere('booking.assignedToId = :agentId', { agentId });
    }

    return queryBuilder
      .orderBy('booking.scheduledAt', 'ASC')
      .getMany();
  }

  async update(id: string, updateBookingDto: UpdateBookingDto): Promise<Booking> {
    const booking = await this.findOne(id);
    
    // If rescheduling, check for conflicts
    if (updateBookingDto.scheduledDateTime) {
      const newScheduledDate = new Date(updateBookingDto.scheduledDateTime);
      const newScheduledTime = newScheduledDate.toTimeString().slice(0, 5);
      
      const conflicts = await this.checkSchedulingConflicts(
        booking.assignedToId,
        newScheduledDate,
        newScheduledTime,
        updateBookingDto.duration || booking.durationMinutes,
        id // Exclude current booking from conflict check
      );

      if (conflicts.length > 0) {
        throw new BadRequestException('Scheduling conflict detected. Agent is not available at the requested time.');
      }
      
      // Update the booking with new date and time
      booking.scheduledAt = newScheduledDate;
    }

    // Update other properties manually to ensure proper mapping
    if (updateBookingDto.type !== undefined) booking.type = updateBookingDto.type;
    if (updateBookingDto.duration !== undefined) booking.durationMinutes = updateBookingDto.duration;
    if (updateBookingDto.priority !== undefined) booking.priority = updateBookingDto.priority;
    if (updateBookingDto.notes !== undefined) booking.internalNotes = updateBookingDto.notes;
    if (updateBookingDto.purpose !== undefined) booking.specialRequirements = updateBookingDto.purpose;
    if (updateBookingDto.assignedAgentId !== undefined) booking.assignedToId = updateBookingDto.assignedAgentId;
    if (updateBookingDto.status !== undefined) booking.status = updateBookingDto.status;
    if (updateBookingDto.cancellationReason !== undefined) booking.cancellationReason = updateBookingDto.cancellationReason;
    if (updateBookingDto.feedback !== undefined) {
      booking.outcome = typeof updateBookingDto.feedback === 'string' ? updateBookingDto.feedback : JSON.stringify(updateBookingDto.feedback);
    }
    if (updateBookingDto.rating !== undefined) booking.rating = updateBookingDto.rating;
    if (updateBookingDto.contactInfo) {
      if (updateBookingDto.contactInfo.email) booking.contactEmail = updateBookingDto.contactInfo.email;
      if (updateBookingDto.contactInfo.phone) booking.contactPhone = updateBookingDto.contactInfo.phone;
    }
    
    return this.bookingRepository.save(booking);
  }

  async remove(id: string): Promise<void> {
    const booking = await this.findOne(id);
    await this.bookingRepository.remove(booking);
  }

  async confirm(id: string): Promise<Booking> {
    const booking = await this.findOne(id);
    booking.status = BookingStatus.CONFIRMED;
    // No confirmedAt property in entity - status change is sufficient
    return this.bookingRepository.save(booking);
  }

  async cancel(id: string, cancellationReason?: string): Promise<Booking> {
    const booking = await this.findOne(id);
    booking.status = BookingStatus.CANCELLED;
    booking.cancelledAt = new Date();
    if (cancellationReason) {
      booking.cancellationReason = cancellationReason;
    }
    return this.bookingRepository.save(booking);
  }

  async complete(id: string, feedback?: Record<string, any>, rating?: number): Promise<Booking> {
    const booking = await this.findOne(id);
    booking.status = BookingStatus.COMPLETED;
    booking.completedAt = new Date();
    if (feedback) {
      booking.outcome = typeof feedback === 'string' ? feedback : JSON.stringify(feedback);
    }
    if (rating) {
      booking.rating = rating;
    }
    return this.bookingRepository.save(booking);
  }

  async reschedule(id: string, newDate: Date, newTime: string): Promise<Booking> {
    const originalBooking = await this.findOne(id);
    
    // Check for conflicts with new time
    const conflicts = await this.checkSchedulingConflicts(
      originalBooking.assignedToId,
      newDate,
      newTime,
      originalBooking.durationMinutes,
      id
    );

    if (conflicts.length > 0) {
      throw new BadRequestException('Scheduling conflict detected. Agent is not available at the requested time.');
    }

    // Update the booking
    originalBooking.scheduledAt = newDate;
    originalBooking.status = BookingStatus.RESCHEDULED;
    // No rescheduledAt property in entity - status change is sufficient
    
    return this.bookingRepository.save(originalBooking);
  }

  async getUpcoming(agentId?: string, clientId?: string): Promise<Booking[]> {
    const queryBuilder = this.bookingRepository.createQueryBuilder('booking')
      .leftJoinAndSelect('booking.property', 'property')
      .leftJoinAndSelect('booking.client', 'client')
      .leftJoinAndSelect('booking.agent', 'agent')
      .where('booking.scheduledAt >= :today', { today: new Date() })
      .andWhere('booking.status IN (:...statuses)', { 
        statuses: [BookingStatus.PENDING, BookingStatus.CONFIRMED] 
      });

    if (agentId) {
      queryBuilder.andWhere('booking.assignedToId = :agentId', { agentId });
    }

    if (clientId) {
      queryBuilder.andWhere('booking.bookedById = :clientId', { clientId });
    }

    return queryBuilder
      .orderBy('booking.scheduledAt', 'ASC')
      .getMany();
  }

  async getStatistics(agentId?: string): Promise<any> {
    const queryBuilder = this.bookingRepository.createQueryBuilder('booking');
    
    if (agentId) {
      queryBuilder.where('booking.assignedToId = :agentId', { agentId });
    }

    const [total, pending, confirmed, completed, cancelled] = await Promise.all([
      queryBuilder.getCount(),
      queryBuilder.clone().andWhere('booking.status = :status', { status: BookingStatus.PENDING }).getCount(),
      queryBuilder.clone().andWhere('booking.status = :status', { status: BookingStatus.CONFIRMED }).getCount(),
      queryBuilder.clone().andWhere('booking.status = :status', { status: BookingStatus.COMPLETED }).getCount(),
      queryBuilder.clone().andWhere('booking.status = :status', { status: BookingStatus.CANCELLED }).getCount(),
    ]);

    // Calculate average rating
    const ratingResult = await queryBuilder.clone()
      .select('AVG(booking.rating)', 'avgRating')
      .where('booking.rating IS NOT NULL')
      .getRawOne();

    return {
      total,
      pending,
      confirmed,
      completed,
      cancelled,
      noShow: total - pending - confirmed - completed - cancelled,
      averageRating: parseFloat(ratingResult?.avgRating) || 0,
    };
  }

  async getBookingAnalytics(agentId?: string): Promise<any> {
    const queryBuilder = this.bookingRepository.createQueryBuilder('booking');
    
    if (agentId) {
      queryBuilder.where('booking.assignedToId = :agentId', { agentId });
    }

    // Get basic statistics
    const [total, pending, confirmed, completed, cancelled] = await Promise.all([
      queryBuilder.getCount(),
      queryBuilder.clone().andWhere('booking.status = :status', { status: BookingStatus.PENDING }).getCount(),
      queryBuilder.clone().andWhere('booking.status = :status', { status: BookingStatus.CONFIRMED }).getCount(),
      queryBuilder.clone().andWhere('booking.status = :status', { status: BookingStatus.COMPLETED }).getCount(),
      queryBuilder.clone().andWhere('booking.status = :status', { status: BookingStatus.CANCELLED }).getCount(),
    ]);

    // Calculate average rating
    const ratingResult = await queryBuilder.clone()
      .select('AVG(booking.rating)', 'avgRating')
      .where('booking.rating IS NOT NULL')
      .getRawOne();

    // Get monthly booking trends (last 12 months)
    const monthlyTrends = await queryBuilder.clone()
      .select('DATE_FORMAT(booking.scheduledAt, "%Y-%m") as month')
      .addSelect('COUNT(*) as count')
      .where('booking.scheduledAt >= DATE_SUB(NOW(), INTERVAL 12 MONTH)')
      .groupBy('month')
      .orderBy('month', 'ASC')
      .getRawMany();

    // Get booking conversion rate
    const conversionRate = total > 0 ? (completed / total) * 100 : 0;

    return {
      overview: {
        total,
        pending,
        confirmed,
        completed,
        cancelled,
        noShow: total - pending - confirmed - completed - cancelled,
        averageRating: parseFloat(ratingResult?.avgRating) || 0,
        conversionRate: Math.round(conversionRate * 100) / 100,
      },
      trends: {
        monthly: monthlyTrends.map(trend => ({
          month: trend.month,
          bookings: parseInt(trend.count),
        })),
      },
    };
  }

  private async checkSchedulingConflicts(
    agentId: string,
    date: Date,
    time: string,
    duration: number,
    excludeBookingId?: string
  ): Promise<Booking[]> {
    const queryBuilder = this.bookingRepository.createQueryBuilder('booking')
      .where('booking.assignedToId = :agentId', { agentId })
      .andWhere('DATE(booking.scheduledAt) = DATE(:date)', { date })
      .andWhere('booking.status IN (:...statuses)', { 
        statuses: [BookingStatus.PENDING, BookingStatus.CONFIRMED] 
      });

    if (excludeBookingId) {
      queryBuilder.andWhere('booking.id != :excludeBookingId', { excludeBookingId });
    }

    const existingBookings = await queryBuilder.getMany();

    // Check for time conflicts
    const [hours, minutes] = time.split(':').map(Number);
    const requestedStart = hours * 60 + minutes;
    const requestedEnd = requestedStart + duration;

    return existingBookings.filter(booking => {
      const existingDate = new Date(booking.scheduledAt);
      const existingHours = existingDate.getHours();
      const existingMinutes = existingDate.getMinutes();
      const existingStart = existingHours * 60 + existingMinutes;
      const existingEnd = existingStart + booking.durationMinutes;

      // Check if times overlap
      return (requestedStart < existingEnd && requestedEnd > existingStart);
    });
  }
}