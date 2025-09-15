import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import {
  Booking,
  BookingType,
  BookingStatus,
  BookingPriority,
} from '../entities/booking.entity';
import {
  Availability,
  AvailabilityType,
  RecurrenceType,
} from '../entities/availability.entity';
import { QueryOptimizationService } from '../../database/query-optimization.service';

// DTOs
export interface CreateBookingDto {
  type?: BookingType;
  priority?: BookingPriority;
  title: string;
  description?: string;
  scheduledAt: Date;
  durationMinutes?: number;
  propertyId: string;
  assignedToId?: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  attendeeCount?: number;
  specialRequirements?: string;
  internalNotes?: string;
  metadata?: Record<string, any>;
  recurrencePattern?: string;
  recurrenceEndDate?: Date;
}

export interface UpdateBookingDto {
  type?: BookingType;
  status?: BookingStatus;
  priority?: BookingPriority;
  title?: string;
  description?: string;
  scheduledAt?: Date;
  durationMinutes?: number;
  assignedToId?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  attendeeCount?: number;
  specialRequirements?: string;
  internalNotes?: string;
  outcome?: string;
  rating?: number;
  metadata?: Record<string, any>;
}

export interface CreateAvailabilityDto {
  type?: AvailabilityType;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  isAllDay?: boolean;
  userId?: string;
  propertyId?: string;
  recurrenceType?: RecurrenceType;
  recurrenceInterval?: number;
  recurrenceDays?: number[];
  recurrenceEndDate?: Date;
  recurrenceCount?: number;
  minBookingDuration?: number;
  maxBookingDuration?: number;
  slotInterval?: number;
  bufferBefore?: number;
  bufferAfter?: number;
  maxConcurrentBookings?: number;
  minAdvanceHours?: number;
  maxAdvanceDays?: number;
  hourlyRate?: number;
  fixedCost?: number;
  requiresApproval?: boolean;
  isHoliday?: boolean;
  metadata?: Record<string, any>;
  tags?: string[];
  enableNotifications?: boolean;
  notificationTemplate?: string;
}

export interface BookingFilters {
  type?: BookingType;
  status?: BookingStatus;
  priority?: BookingPriority;
  propertyId?: string;
  bookedById?: string;
  assignedToId?: string;
  fromDate?: Date;
  toDate?: Date;
  contactEmail?: string;
  rating?: number;
}

export interface AvailabilityFilters {
  type?: AvailabilityType;
  userId?: string;
  propertyId?: string;
  fromDate?: Date;
  toDate?: Date;
  isActive?: boolean;
  isPublished?: boolean;
  tags?: string[];
}

export interface TimeSlot {
  startTime: Date;
  endTime: Date;
  isAvailable: boolean;
  availabilityId?: string;
  conflictingBookings?: string[];
  cost?: number;
}

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(Availability)
    private readonly availabilityRepository: Repository<Availability>,
    private readonly queryOptimizationService: QueryOptimizationService,
  ) {}

  // Booking Management
  async createBooking(
    tenantOrganizationId: string,
    bookedById: string,
    createBookingDto: CreateBookingDto,
  ): Promise<Booking> {
    // Validate availability
    const isAvailable = await this.checkAvailability(
      tenantOrganizationId,
      createBookingDto.propertyId,
      createBookingDto.scheduledAt,
      createBookingDto.durationMinutes || 60,
      createBookingDto.assignedToId,
    );

    if (!isAvailable) {
      throw new BadRequestException('The requested time slot is not available');
    }

    const endTime = new Date(
      createBookingDto.scheduledAt.getTime() +
        (createBookingDto.durationMinutes || 60) * 60000,
    );

    const booking = this.bookingRepository.create({
      ...createBookingDto,
      tenantOrganizationId,
      bookedById,
      endTime,
      confirmationCode: this.generateConfirmationCode(),
      type: createBookingDto.type || BookingType.VIEWING,
      priority: createBookingDto.priority || BookingPriority.MEDIUM,
      durationMinutes: createBookingDto.durationMinutes || 60,
      attendeeCount: createBookingDto.attendeeCount || 1,
    });

    return await this.bookingRepository.save(booking);
  }

  async getBookings(
    tenantOrganizationId: string,
    filters: BookingFilters = {},
    page: number = 1,
    limit: number = 50,
  ): Promise<{ bookings: Booking[]; total: number; page: number; limit: number }> {
    const queryBuilder = this.bookingRepository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.bookedBy', 'bookedBy')
      .leftJoinAndSelect('booking.property', 'property')
      .leftJoinAndSelect('booking.assignedTo', 'assignedTo')
      .where('booking.tenantOrganizationId = :tenantOrganizationId', {
        tenantOrganizationId,
      });

    if (filters.type) {
      queryBuilder.andWhere('booking.type = :type', { type: filters.type });
    }

    if (filters.status) {
      queryBuilder.andWhere('booking.status = :status', { status: filters.status });
    }

    if (filters.priority) {
      queryBuilder.andWhere('booking.priority = :priority', {
        priority: filters.priority,
      });
    }

    if (filters.propertyId) {
      queryBuilder.andWhere('booking.propertyId = :propertyId', {
        propertyId: filters.propertyId,
      });
    }

    if (filters.bookedById) {
      queryBuilder.andWhere('booking.bookedById = :bookedById', {
        bookedById: filters.bookedById,
      });
    }

    if (filters.assignedToId) {
      queryBuilder.andWhere('booking.assignedToId = :assignedToId', {
        assignedToId: filters.assignedToId,
      });
    }

    if (filters.fromDate) {
      queryBuilder.andWhere('booking.scheduledAt >= :fromDate', {
        fromDate: filters.fromDate,
      });
    }

    if (filters.toDate) {
      queryBuilder.andWhere('booking.scheduledAt <= :toDate', {
        toDate: filters.toDate,
      });
    }

    if (filters.contactEmail) {
      queryBuilder.andWhere('booking.contactEmail ILIKE :contactEmail', {
        contactEmail: `%${filters.contactEmail}%`,
      });
    }

    if (filters.rating !== undefined) {
      queryBuilder.andWhere('booking.rating = :rating', { rating: filters.rating });
    }

    queryBuilder.orderBy('booking.scheduledAt', 'DESC');

    const [bookings, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { bookings, total, page, limit };
  }

  async searchBookingsOptimized(
    tenantOrganizationId: string,
    searchTerm: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ bookings: Booking[]; total: number; page: number; limit: number }> {
    return this.queryOptimizationService.searchBookingsOptimized(
      tenantOrganizationId,
      searchTerm,
      page,
      limit,
    );
  }

  async getBookingById(
    tenantOrganizationId: string,
    bookingId: string,
  ): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId, tenantOrganizationId },
      relations: ['bookedBy', 'property', 'assignedTo', 'cancelledBy'],
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return booking;
  }

  async updateBooking(
    tenantOrganizationId: string,
    bookingId: string,
    updateBookingDto: UpdateBookingDto,
  ): Promise<Booking> {
    const booking = await this.getBookingById(tenantOrganizationId, bookingId);

    // If rescheduling, check availability
    if (updateBookingDto.scheduledAt && updateBookingDto.scheduledAt !== booking.scheduledAt) {
      const isAvailable = await this.checkAvailability(
        tenantOrganizationId,
        booking.propertyId,
        updateBookingDto.scheduledAt,
        updateBookingDto.durationMinutes || booking.durationMinutes,
        booking.assignedToId,
        bookingId, // Exclude current booking from conflict check
      );

      if (!isAvailable) {
        throw new BadRequestException('The requested time slot is not available');
      }

      // Update end time if scheduled time or duration changed
      const endTime = new Date(
        updateBookingDto.scheduledAt.getTime() +
          (updateBookingDto.durationMinutes || booking.durationMinutes) * 60000,
      );
      updateBookingDto['endTime'] = endTime;
    }

    Object.assign(booking, updateBookingDto);
    return await this.bookingRepository.save(booking);
  }

  async cancelBooking(
    tenantOrganizationId: string,
    bookingId: string,
    cancelledById: string,
    cancellationReason?: string,
  ): Promise<Booking> {
    const booking = await this.getBookingById(tenantOrganizationId, bookingId);

    booking.status = BookingStatus.CANCELLED;
    booking.cancellationReason = cancellationReason;
    booking.cancelledAt = new Date();
    booking.cancelledById = cancelledById;

    return await this.bookingRepository.save(booking);
  }

  async confirmBooking(
    tenantOrganizationId: string,
    bookingId: string,
  ): Promise<Booking> {
    const booking = await this.getBookingById(tenantOrganizationId, bookingId);

    booking.status = BookingStatus.CONFIRMED;
    booking.confirmationSent = true;

    return await this.bookingRepository.save(booking);
  }

  async completeBooking(
    tenantOrganizationId: string,
    bookingId: string,
    outcome?: string,
    rating?: number,
  ): Promise<Booking> {
    const booking = await this.getBookingById(tenantOrganizationId, bookingId);

    booking.status = BookingStatus.COMPLETED;
    booking.completedAt = new Date();
    if (outcome) booking.outcome = outcome;
    if (rating) booking.rating = rating;

    return await this.bookingRepository.save(booking);
  }

  // Availability Management
  async createAvailability(
    tenantOrganizationId: string,
    createdById: string,
    createAvailabilityDto: CreateAvailabilityDto,
  ): Promise<Availability> {
    const availability = this.availabilityRepository.create({
      ...createAvailabilityDto,
      tenantOrganizationId,
      createdById,
      type: createAvailabilityDto.type || AvailabilityType.AVAILABLE,
      recurrenceType: createAvailabilityDto.recurrenceType || RecurrenceType.NONE,
      recurrenceInterval: createAvailabilityDto.recurrenceInterval || 1,
      minBookingDuration: createAvailabilityDto.minBookingDuration || 30,
      maxBookingDuration: createAvailabilityDto.maxBookingDuration || 180,
      slotInterval: createAvailabilityDto.slotInterval || 30,
      bufferBefore: createAvailabilityDto.bufferBefore || 0,
      bufferAfter: createAvailabilityDto.bufferAfter || 0,
      maxConcurrentBookings: createAvailabilityDto.maxConcurrentBookings || 1,
      minAdvanceHours: createAvailabilityDto.minAdvanceHours || 24,
      maxAdvanceDays: createAvailabilityDto.maxAdvanceDays || 90,
      requiresApproval: createAvailabilityDto.requiresApproval || false,
      isHoliday: createAvailabilityDto.isHoliday || false,
      enableNotifications: createAvailabilityDto.enableNotifications !== false,
    });

    return await this.availabilityRepository.save(availability);
  }

  async getAvailability(
    tenantOrganizationId: string,
    filters: AvailabilityFilters = {},
    page: number = 1,
    limit: number = 50,
  ): Promise<{ availability: Availability[]; total: number; page: number; limit: number }> {
    const queryBuilder = this.availabilityRepository
      .createQueryBuilder('availability')
      .leftJoinAndSelect('availability.user', 'user')
      .leftJoinAndSelect('availability.property', 'property')
      .leftJoinAndSelect('availability.createdBy', 'createdBy')
      .where('availability.tenantOrganizationId = :tenantOrganizationId', {
        tenantOrganizationId,
      });

    if (filters.type) {
      queryBuilder.andWhere('availability.type = :type', { type: filters.type });
    }

    if (filters.userId) {
      queryBuilder.andWhere('availability.userId = :userId', {
        userId: filters.userId,
      });
    }

    if (filters.propertyId) {
      queryBuilder.andWhere('availability.propertyId = :propertyId', {
        propertyId: filters.propertyId,
      });
    }

    if (filters.fromDate) {
      queryBuilder.andWhere('availability.endTime >= :fromDate', {
        fromDate: filters.fromDate,
      });
    }

    if (filters.toDate) {
      queryBuilder.andWhere('availability.startTime <= :toDate', {
        toDate: filters.toDate,
      });
    }

    if (filters.isActive !== undefined) {
      queryBuilder.andWhere('availability.isActive = :isActive', {
        isActive: filters.isActive,
      });
    }

    if (filters.isPublished !== undefined) {
      queryBuilder.andWhere('availability.isPublished = :isPublished', {
        isPublished: filters.isPublished,
      });
    }

    if (filters.tags && filters.tags.length > 0) {
      queryBuilder.andWhere('availability.tags && :tags', { tags: filters.tags });
    }

    queryBuilder.orderBy('availability.startTime', 'ASC');

    const [availability, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { availability, total, page, limit };
  }

  async checkAvailability(
    tenantOrganizationId: string,
    propertyId: string,
    startTime: Date,
    durationMinutes: number,
    userId?: string,
    excludeBookingId?: string,
  ): Promise<boolean> {
    const endTime = new Date(startTime.getTime() + durationMinutes * 60000);

    // Check for conflicting bookings
    const conflictingBookingsQuery = this.bookingRepository
      .createQueryBuilder('booking')
      .where('booking.tenantOrganizationId = :tenantOrganizationId', {
        tenantOrganizationId,
      })
      .andWhere('booking.propertyId = :propertyId', { propertyId })
      .andWhere('booking.status NOT IN (:...excludedStatuses)', {
        excludedStatuses: [BookingStatus.CANCELLED, BookingStatus.COMPLETED],
      })
      .andWhere(
        '(booking.scheduledAt < :endTime AND booking.endTime > :startTime)',
        { startTime, endTime },
      );

    if (userId) {
      conflictingBookingsQuery.andWhere(
        '(booking.assignedToId = :userId OR booking.bookedById = :userId)',
        { userId },
      );
    }

    if (excludeBookingId) {
      conflictingBookingsQuery.andWhere('booking.id != :excludeBookingId', {
        excludeBookingId,
      });
    }

    const conflictingBookings = await conflictingBookingsQuery.getCount();

    if (conflictingBookings > 0) {
      return false;
    }

    // Check availability slots
    const availabilitySlots = await this.availabilityRepository
      .createQueryBuilder('availability')
      .where('availability.tenantOrganizationId = :tenantOrganizationId', {
        tenantOrganizationId,
      })
      .andWhere('availability.type = :type', { type: AvailabilityType.AVAILABLE })
      .andWhere('availability.isActive = true')
      .andWhere('availability.isPublished = true')
      .andWhere(
        '(availability.startTime <= :startTime AND availability.endTime >= :endTime)',
        { startTime, endTime },
      )
      .andWhere(
        '(availability.propertyId = :propertyId OR availability.propertyId IS NULL)',
        { propertyId },
      )
      .andWhere(
        '(availability.userId = :userId OR availability.userId IS NULL)',
        { userId: userId || null },
      )
      .getCount();

    return availabilitySlots > 0;
  }

  async getAvailableTimeSlots(
    tenantOrganizationId: string,
    propertyId: string,
    date: Date,
    durationMinutes: number = 60,
    userId?: string,
  ): Promise<TimeSlot[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Get availability slots for the day
    const availabilitySlots = await this.availabilityRepository
      .createQueryBuilder('availability')
      .where('availability.tenantOrganizationId = :tenantOrganizationId', {
        tenantOrganizationId,
      })
      .andWhere('availability.type = :type', { type: AvailabilityType.AVAILABLE })
      .andWhere('availability.isActive = true')
      .andWhere('availability.isPublished = true')
      .andWhere(
        '(availability.startTime <= :endOfDay AND availability.endTime >= :startOfDay)',
        { startOfDay, endOfDay },
      )
      .andWhere(
        '(availability.propertyId = :propertyId OR availability.propertyId IS NULL)',
        { propertyId },
      )
      .andWhere(
        '(availability.userId = :userId OR availability.userId IS NULL)',
        { userId: userId || null },
      )
      .getMany();

    const timeSlots: TimeSlot[] = [];

    for (const slot of availabilitySlots) {
      const slotStart = new Date(Math.max(slot.startTime.getTime(), startOfDay.getTime()));
      const slotEnd = new Date(Math.min(slot.endTime.getTime(), endOfDay.getTime()));
      const interval = slot.slotInterval;

      let currentTime = new Date(slotStart);
      while (currentTime.getTime() + durationMinutes * 60000 <= slotEnd.getTime()) {
        const slotEndTime = new Date(currentTime.getTime() + durationMinutes * 60000);

        const isAvailable = await this.checkAvailability(
          tenantOrganizationId,
          propertyId,
          currentTime,
          durationMinutes,
          userId,
        );

        timeSlots.push({
          startTime: new Date(currentTime),
          endTime: slotEndTime,
          isAvailable,
          availabilityId: slot.id,
          cost: slot.hourlyRate ? (slot.hourlyRate * durationMinutes) / 60 : slot.fixedCost,
        });

        currentTime = new Date(currentTime.getTime() + interval * 60000);
      }
    }

    return timeSlots.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  }

  // Helper Methods
  private generateConfirmationCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  async deleteBooking(
    tenantOrganizationId: string,
    bookingId: string,
  ): Promise<void> {
    const booking = await this.getBookingById(tenantOrganizationId, bookingId);
    await this.bookingRepository.remove(booking);
  }

  async deleteAvailability(
    tenantOrganizationId: string,
    availabilityId: string,
  ): Promise<void> {
    const availability = await this.availabilityRepository.findOne({
      where: { id: availabilityId, tenantOrganizationId },
    });

    if (!availability) {
      throw new NotFoundException('Availability slot not found');
    }

    await this.availabilityRepository.remove(availability);
  }
}