import { Test, TestingModule } from '@nestjs/testing';
import { BookingController } from './booking.controller';
import { BookingService } from '../services/booking.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { BookingStatus, BookingType } from '../entities/booking.entity';
import { AvailabilityStatus, AvailabilityType } from '../entities/availability.entity';
import { UserRole } from '../../users/entities/user.entity';
import { NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';

describe('BookingController', () => {
  let controller: BookingController;
  let bookingService: jest.Mocked<BookingService>;

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    role: UserRole.TENANT,
    tenantOrganizationId: 'tenant-1',
  };

  const mockBooking = {
    id: 'booking-1',
    referenceNumber: 'BK20240115001',
    title: 'Test Booking',
    type: BookingType.PROPERTY_VIEWING,
    status: BookingStatus.PENDING,
    startDateTime: new Date('2024-01-15T14:00:00Z'),
    endDateTime: new Date('2024-01-15T15:00:00Z'),
    tenantOrganizationId: 'tenant-1',
    propertyId: 'property-1',
    userId: 'user-1',
    availabilityId: 'availability-1',
    contactEmail: 'test@example.com',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockAvailability = {
    id: 'availability-1',
    title: 'Test Availability',
    type: AvailabilityType.PROPERTY_VIEWING,
    startDateTime: new Date('2024-01-15T10:00:00Z'),
    endDateTime: new Date('2024-01-15T18:00:00Z'),
    maxBookings: 5,
    currentBookings: 2,
    tenantOrganizationId: 'tenant-1',
    propertyId: 'property-1',
    status: AvailabilityStatus.ACTIVE,
  };

  const mockDashboardStats = {
    totalBookings: 100,
    activeBookings: 20,
    completedBookings: 70,
    cancelledBookings: 10,
    totalRevenue: 50000,
    averageBookingValue: 500,
    occupancyRate: 75,
    popularTimeSlots: [{ hour: '14', count: 5 }],
    popularDays: [{ day: 'Monday', count: 10 }],
    bookingsByType: [{ type: 'PROPERTY_VIEWING', count: 50 }],
    bookingsByProperty: [{ propertyId: 'property-1', propertyName: 'Test Property', count: 25 }],
    recentBookings: [],
    upcomingBookings: [],
  };

  beforeEach(async () => {
    const mockBookingService = {
      createBooking: jest.fn(),
      findBookingById: jest.fn(),
      findBookings: jest.fn(),
      updateBooking: jest.fn(),
      deleteBooking: jest.fn(),
      confirmBooking: jest.fn(),
      cancelBooking: jest.fn(),
      checkInBooking: jest.fn(),
      checkOutBooking: jest.fn(),
      createAvailability: jest.fn(),
      findAvailabilityById: jest.fn(),
      findAvailabilities: jest.fn(),
      updateAvailability: jest.fn(),
      deleteAvailability: jest.fn(),
      getBookingDashboardStats: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookingController],
      providers: [
        {
          provide: BookingService,
          useValue: mockBookingService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<BookingController>(BookingController);
    bookingService = module.get(BookingService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createBooking', () => {
    const createBookingDto = {
      tenantOrganizationId: 'tenant-1',
      propertyId: 'property-1',
      availabilityId: 'availability-1',
      type: BookingType.PROPERTY_VIEWING,
      title: 'Test Booking',
      startDateTime: new Date('2024-01-15T14:00:00Z'),
      endDateTime: new Date('2024-01-15T15:00:00Z'),
      contactEmail: 'test@example.com',
    };

    it('should create a booking successfully', async () => {
      bookingService.createBooking.mockResolvedValue(mockBooking as any);

      const result = await controller.createBooking(createBookingDto, mockUser as any);

      expect(result).toEqual(mockBooking);
      expect(bookingService.createBooking).toHaveBeenCalledWith(createBookingDto, mockUser.id);
    });

    it('should handle service errors', async () => {
      bookingService.createBooking.mockRejectedValue(new ConflictException('Booking conflict'));

      await expect(controller.createBooking(createBookingDto, mockUser as any))
        .rejects.toThrow(ConflictException);
    });
  });

  describe('getBookingById', () => {
    it('should return booking by id', async () => {
      bookingService.findBookingById.mockResolvedValue(mockBooking as any);

      const result = await controller.getBookingById('booking-1', mockUser as any);

      expect(result).toEqual(mockBooking);
      expect(bookingService.findBookingById).toHaveBeenCalledWith('booking-1', mockUser.tenantOrganizationId);
    });

    it('should handle not found error', async () => {
      bookingService.findBookingById.mockRejectedValue(new NotFoundException('Booking not found'));

      await expect(controller.getBookingById('booking-1', mockUser as any))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('getBookings', () => {
    const queryDto = {
      page: 1,
      limit: 10,
      sortBy: 'createdAt',
      sortOrder: 'DESC' as const,
      status: BookingStatus.PENDING,
    };

    it('should return paginated bookings', async () => {
      const mockResult = {
        bookings: [mockBooking],
        total: 1,
        page: 1,
        limit: 10,
      };
      bookingService.findBookings.mockResolvedValue(mockResult as any);

      const result = await controller.getBookings(queryDto, mockUser as any);

      expect(result).toEqual(mockResult);
      expect(bookingService.findBookings).toHaveBeenCalledWith(
        expect.objectContaining({
          tenantOrganizationId: mockUser.tenantOrganizationId,
          status: BookingStatus.PENDING,
        }),
        expect.objectContaining({
          page: 1,
          limit: 10,
          sortBy: 'createdAt',
          sortOrder: 'DESC',
        })
      );
    });

    it('should handle empty results', async () => {
      const mockResult = {
        bookings: [],
        total: 0,
        page: 1,
        limit: 10,
      };
      bookingService.findBookings.mockResolvedValue(mockResult as any);

      const result = await controller.getBookings(queryDto, mockUser as any);

      expect(result).toEqual(mockResult);
      expect(result.bookings).toHaveLength(0);
    });
  });

  describe('updateBooking', () => {
    const updateDto = {
      title: 'Updated Booking',
      description: 'Updated description',
    };

    it('should update booking successfully', async () => {
      const updatedBooking = { ...mockBooking, ...updateDto };
      bookingService.updateBooking.mockResolvedValue(updatedBooking as any);

      const result = await controller.updateBooking('booking-1', updateDto, mockUser as any);

      expect(result).toEqual(updatedBooking);
      expect(bookingService.updateBooking).toHaveBeenCalledWith(
        'booking-1',
        mockUser.tenantOrganizationId,
        updateDto,
        mockUser.id
      );
    });

    it('should handle not found error', async () => {
      bookingService.updateBooking.mockRejectedValue(new NotFoundException('Booking not found'));

      await expect(controller.updateBooking('booking-1', updateDto, mockUser as any))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteBooking', () => {
    it('should delete booking successfully', async () => {
      bookingService.deleteBooking.mockResolvedValue(undefined);

      await controller.deleteBooking('booking-1', mockUser as any);

      expect(bookingService.deleteBooking).toHaveBeenCalledWith(
        'booking-1',
        mockUser.tenantOrganizationId,
        mockUser.id
      );
    });

    it('should handle not found error', async () => {
      bookingService.deleteBooking.mockRejectedValue(new NotFoundException('Booking not found'));

      await expect(controller.deleteBooking('booking-1', mockUser as any))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('confirmBooking', () => {
    it('should confirm booking successfully', async () => {
      const confirmedBooking = { ...mockBooking, status: BookingStatus.CONFIRMED };
      bookingService.confirmBooking.mockResolvedValue(confirmedBooking as any);

      const result = await controller.confirmBooking('booking-1', mockUser as any);

      expect(result).toEqual(confirmedBooking);
      expect(bookingService.confirmBooking).toHaveBeenCalledWith(
        'booking-1',
        mockUser.tenantOrganizationId,
        mockUser.id
      );
    });

    it('should handle bad request error', async () => {
      bookingService.confirmBooking.mockRejectedValue(new BadRequestException('Cannot confirm booking'));

      await expect(controller.confirmBooking('booking-1', mockUser as any))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('cancelBooking', () => {
    const cancelDto = {
      cancellationReason: 'Test cancellation reason',
    };

    it('should cancel booking successfully', async () => {
      const cancelledBooking = { ...mockBooking, status: BookingStatus.CANCELLED };
      bookingService.cancelBooking.mockResolvedValue(cancelledBooking as any);

      const result = await controller.cancelBooking('booking-1', cancelDto, mockUser as any);

      expect(result).toEqual(cancelledBooking);
      expect(bookingService.cancelBooking).toHaveBeenCalledWith(
        'booking-1',
        mockUser.tenantOrganizationId,
        cancelDto.cancellationReason,
        mockUser.id
      );
    });

    it('should handle bad request error', async () => {
      bookingService.cancelBooking.mockRejectedValue(new BadRequestException('Cannot cancel booking'));

      await expect(controller.cancelBooking('booking-1', cancelDto, mockUser as any))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('checkInBooking', () => {
    it('should check in booking successfully', async () => {
      const checkedInBooking = { ...mockBooking, status: BookingStatus.CHECKED_IN };
      bookingService.checkInBooking.mockResolvedValue(checkedInBooking as any);

      const result = await controller.checkInBooking('booking-1', mockUser as any);

      expect(result).toEqual(checkedInBooking);
      expect(bookingService.checkInBooking).toHaveBeenCalledWith(
        'booking-1',
        mockUser.tenantOrganizationId,
        mockUser.id
      );
    });

    it('should handle bad request error', async () => {
      bookingService.checkInBooking.mockRejectedValue(new BadRequestException('Cannot check in booking'));

      await expect(controller.checkInBooking('booking-1', mockUser as any))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('checkOutBooking', () => {
    it('should check out booking successfully', async () => {
      const completedBooking = { ...mockBooking, status: BookingStatus.COMPLETED };
      bookingService.checkOutBooking.mockResolvedValue(completedBooking as any);

      const result = await controller.checkOutBooking('booking-1', mockUser as any);

      expect(result).toEqual(completedBooking);
      expect(bookingService.checkOutBooking).toHaveBeenCalledWith(
        'booking-1',
        mockUser.tenantOrganizationId,
        mockUser.id
      );
    });

    it('should handle bad request error', async () => {
      bookingService.checkOutBooking.mockRejectedValue(new BadRequestException('Cannot check out booking'));

      await expect(controller.checkOutBooking('booking-1', mockUser as any))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('createAvailability', () => {
    const createAvailabilityDto = {
      tenantOrganizationId: 'tenant-1',
      propertyId: 'property-1',
      title: 'Test Availability',
      type: AvailabilityType.PROPERTY_VIEWING,
      startDateTime: new Date('2024-01-15T10:00:00Z'),
      endDateTime: new Date('2024-01-15T18:00:00Z'),
      maxBookings: 5,
    };

    it('should create availability successfully', async () => {
      bookingService.createAvailability.mockResolvedValue(mockAvailability as any);

      const result = await controller.createAvailability(createAvailabilityDto, mockUser as any);

      expect(result).toEqual(mockAvailability);
      expect(bookingService.createAvailability).toHaveBeenCalledWith(createAvailabilityDto, mockUser.id);
    });

    it('should handle service errors', async () => {
      bookingService.createAvailability.mockRejectedValue(new NotFoundException('Property not found'));

      await expect(controller.createAvailability(createAvailabilityDto, mockUser as any))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('getAvailabilityById', () => {
    it('should return availability by id', async () => {
      bookingService.findAvailabilityById.mockResolvedValue(mockAvailability as any);

      const result = await controller.getAvailabilityById('availability-1', mockUser as any);

      expect(result).toEqual(mockAvailability);
      expect(bookingService.findAvailabilityById).toHaveBeenCalledWith('availability-1', mockUser.tenantOrganizationId);
    });

    it('should handle not found error', async () => {
      bookingService.findAvailabilityById.mockRejectedValue(new NotFoundException('Availability not found'));

      await expect(controller.getAvailabilityById('availability-1', mockUser as any))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('getAvailabilities', () => {
    const queryDto = {
      page: 1,
      limit: 10,
      sortBy: 'startDateTime',
      sortOrder: 'ASC' as const,
      type: AvailabilityType.PROPERTY_VIEWING,
    };

    it('should return paginated availabilities', async () => {
      const mockResult = {
        availabilities: [mockAvailability],
        total: 1,
        page: 1,
        limit: 10,
      };
      bookingService.findAvailabilities.mockResolvedValue(mockResult as any);

      const result = await controller.getAvailabilities(queryDto, mockUser as any);

      expect(result).toEqual(mockResult);
      expect(bookingService.findAvailabilities).toHaveBeenCalledWith(
        expect.objectContaining({
          tenantOrganizationId: mockUser.tenantOrganizationId,
          type: AvailabilityType.PROPERTY_VIEWING,
        }),
        expect.objectContaining({
          page: 1,
          limit: 10,
          sortBy: 'startDateTime',
          sortOrder: 'ASC',
        })
      );
    });
  });

  describe('updateAvailability', () => {
    const updateDto = {
      title: 'Updated Availability',
      maxBookings: 10,
    };

    it('should update availability successfully', async () => {
      const updatedAvailability = { ...mockAvailability, ...updateDto };
      bookingService.updateAvailability.mockResolvedValue(updatedAvailability as any);

      const result = await controller.updateAvailability('availability-1', updateDto, mockUser as any);

      expect(result).toEqual(updatedAvailability);
      expect(bookingService.updateAvailability).toHaveBeenCalledWith(
        'availability-1',
        mockUser.tenantOrganizationId,
        updateDto,
        mockUser.id
      );
    });

    it('should handle not found error', async () => {
      bookingService.updateAvailability.mockRejectedValue(new NotFoundException('Availability not found'));

      await expect(controller.updateAvailability('availability-1', updateDto, mockUser as any))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteAvailability', () => {
    it('should delete availability successfully', async () => {
      bookingService.deleteAvailability.mockResolvedValue(undefined);

      await controller.deleteAvailability('availability-1', mockUser as any);

      expect(bookingService.deleteAvailability).toHaveBeenCalledWith(
        'availability-1',
        mockUser.tenantOrganizationId,
        mockUser.id
      );
    });

    it('should handle bad request error', async () => {
      bookingService.deleteAvailability.mockRejectedValue(new BadRequestException('Cannot delete availability with active bookings'));

      await expect(controller.deleteAvailability('availability-1', mockUser as any))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('getBookingDashboardStats', () => {
    it('should return dashboard statistics', async () => {
      bookingService.getBookingDashboardStats.mockResolvedValue(mockDashboardStats as any);

      const result = await controller.getBookingDashboardStats(mockUser as any);

      expect(result).toEqual(mockDashboardStats);
      expect(bookingService.getBookingDashboardStats).toHaveBeenCalledWith(mockUser.tenantOrganizationId);
    });

    it('should handle service errors', async () => {
      bookingService.getBookingDashboardStats.mockRejectedValue(new Error('Database error'));

      await expect(controller.getBookingDashboardStats(mockUser as any))
        .rejects.toThrow('Database error');
    });
  });
});
