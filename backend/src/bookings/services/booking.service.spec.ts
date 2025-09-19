import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { BookingService } from './booking.service';
import { Booking, BookingStatus, BookingType } from '../entities/booking.entity';
import { Availability, AvailabilityStatus, AvailabilityType } from '../entities/availability.entity';
import { User, UserRole } from '../../users/entities/user.entity';
import { Property } from '../../properties/entities/property.entity';
import { TenantOrganization } from '../../tenant-organizations/entities/tenant-organization.entity';

describe('BookingService', () => {
  let service: BookingService;
  let bookingRepository: jest.Mocked<Repository<Booking>>;
  let availabilityRepository: jest.Mocked<Repository<Availability>>;
  let userRepository: jest.Mocked<Repository<User>>;
  let propertyRepository: jest.Mocked<Repository<Property>>;
  let tenantOrganizationRepository: jest.Mocked<Repository<TenantOrganization>>;

  const mockTenantOrganization = {
    id: 'tenant-1',
    name: 'Test Tenant',
    isActive: true,
  };

  const mockProperty = {
    id: 'property-1',
    name: 'Test Property',
    tenantOrganizationId: 'tenant-1',
  };

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    role: UserRole.TENANT,
    tenantOrganizationId: 'tenant-1',
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

  beforeEach(async () => {
    const mockBookingRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        offset: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        getOne: jest.fn(),
        getMany: jest.fn(),
        getRawMany: jest.fn(),
        getManyAndCount: jest.fn(),
      })),
    };

    const mockAvailabilityRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        offset: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        getOne: jest.fn(),
        getMany: jest.fn(),
        getManyAndCount: jest.fn(),
      })),
    };

    const mockUserRepository = {
      findOne: jest.fn(),
    };

    const mockPropertyRepository = {
      findOne: jest.fn(),
    };

    const mockTenantOrganizationRepository = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingService,
        {
          provide: getRepositoryToken(Booking),
          useValue: mockBookingRepository,
        },
        {
          provide: getRepositoryToken(Availability),
          useValue: mockAvailabilityRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(Property),
          useValue: mockPropertyRepository,
        },
        {
          provide: getRepositoryToken(TenantOrganization),
          useValue: mockTenantOrganizationRepository,
        },
      ],
    }).compile();

    service = module.get<BookingService>(BookingService);
    bookingRepository = module.get(getRepositoryToken(Booking));
    availabilityRepository = module.get(getRepositoryToken(Availability));
    userRepository = module.get(getRepositoryToken(User));
    propertyRepository = module.get(getRepositoryToken(Property));
    tenantOrganizationRepository = module.get(getRepositoryToken(TenantOrganization));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
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
      tenantOrganizationRepository.findOne.mockResolvedValue(mockTenantOrganization as any);
      propertyRepository.findOne.mockResolvedValue(mockProperty as any);
      availabilityRepository.findOne.mockResolvedValue(mockAvailability as any);
      bookingRepository.createQueryBuilder().getOne.mockResolvedValue(null);
      bookingRepository.createQueryBuilder().getOne.mockResolvedValueOnce(null); // For reference generation
      bookingRepository.create.mockReturnValue(mockBooking as any);
      bookingRepository.save.mockResolvedValue(mockBooking as any);

      const result = await service.createBooking(createBookingDto, 'user-1');

      expect(result).toEqual(mockBooking);
      expect(tenantOrganizationRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'tenant-1', isActive: true },
      });
      expect(propertyRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'property-1', tenantOrganizationId: 'tenant-1' },
      });
      expect(bookingRepository.create).toHaveBeenCalled();
      expect(bookingRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when tenant organization not found', async () => {
      tenantOrganizationRepository.findOne.mockResolvedValue(null);

      await expect(service.createBooking(createBookingDto, 'user-1'))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when property not found', async () => {
      tenantOrganizationRepository.findOne.mockResolvedValue(mockTenantOrganization as any);
      propertyRepository.findOne.mockResolvedValue(null);

      await expect(service.createBooking(createBookingDto, 'user-1'))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when booking conflict exists', async () => {
      tenantOrganizationRepository.findOne.mockResolvedValue(mockTenantOrganization as any);
      propertyRepository.findOne.mockResolvedValue(mockProperty as any);
      availabilityRepository.findOne.mockResolvedValue(mockAvailability as any);
      bookingRepository.createQueryBuilder().getOne.mockResolvedValue(mockBooking as any);

      await expect(service.createBooking(createBookingDto, 'user-1'))
        .rejects.toThrow(ConflictException);
    });
  });

  describe('findBookingById', () => {
    it('should return booking by id', async () => {
      bookingRepository.findOne.mockResolvedValue(mockBooking as any);

      const result = await service.findBookingById('booking-1', 'tenant-1');

      expect(result).toEqual(mockBooking);
      expect(bookingRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'booking-1', tenantOrganizationId: 'tenant-1' },
        relations: ['property', 'user', 'guestUser', 'availability'],
      });
    });

    it('should throw NotFoundException when booking not found', async () => {
      bookingRepository.findOne.mockResolvedValue(null);

      await expect(service.findBookingById('booking-1', 'tenant-1'))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('findBookings', () => {
    const filters = {
      tenantOrganizationId: 'tenant-1',
      status: BookingStatus.PENDING,
    };
    const pagination = {
      page: 1,
      limit: 10,
      sortBy: 'createdAt',
      sortOrder: 'DESC' as const,
    };

    it('should return paginated bookings', async () => {
      const mockQueryBuilder = bookingRepository.createQueryBuilder();
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[mockBooking], 1]);

      const result = await service.findBookings(filters, pagination);

      expect(result).toEqual({
        bookings: [mockBooking],
        total: 1,
        page: 1,
        limit: 10,
      });
      expect(mockQueryBuilder.where).toHaveBeenCalled();
      expect(mockQueryBuilder.orderBy).toHaveBeenCalled();
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
    });
  });

  describe('updateBooking', () => {
    const updateDto = {
      title: 'Updated Booking',
      description: 'Updated description',
    };

    it('should update booking successfully', async () => {
      const updatedBooking = { ...mockBooking, ...updateDto };
      bookingRepository.findOne.mockResolvedValue(mockBooking as any);
      bookingRepository.createQueryBuilder().getOne.mockResolvedValue(null); // No conflicts
      bookingRepository.save.mockResolvedValue(updatedBooking as any);

      const result = await service.updateBooking('booking-1', 'tenant-1', updateDto, 'user-1');

      expect(result).toEqual(updatedBooking);
      expect(bookingRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when booking not found', async () => {
      bookingRepository.findOne.mockResolvedValue(null);

      await expect(service.updateBooking('booking-1', 'tenant-1', updateDto, 'user-1'))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteBooking', () => {
    it('should delete booking successfully', async () => {
      bookingRepository.findOne.mockResolvedValue(mockBooking as any);
      bookingRepository.update.mockResolvedValue({ affected: 1 } as any);

      await service.deleteBooking('booking-1', 'tenant-1', 'user-1');

      expect(bookingRepository.update).toHaveBeenCalledWith(
        { id: 'booking-1', tenantOrganizationId: 'tenant-1' },
        { deletedAt: expect.any(Date), deletedBy: 'user-1' }
      );
    });

    it('should throw NotFoundException when booking not found', async () => {
      bookingRepository.findOne.mockResolvedValue(null);

      await expect(service.deleteBooking('booking-1', 'tenant-1', 'user-1'))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('confirmBooking', () => {
    it('should confirm booking successfully', async () => {
      const pendingBooking = { ...mockBooking, status: BookingStatus.PENDING };
      const confirmedBooking = { ...pendingBooking, status: BookingStatus.CONFIRMED };
      bookingRepository.findOne.mockResolvedValue(pendingBooking as any);
      bookingRepository.save.mockResolvedValue(confirmedBooking as any);

      const result = await service.confirmBooking('booking-1', 'tenant-1', 'user-1');

      expect(result.status).toBe(BookingStatus.CONFIRMED);
      expect(bookingRepository.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException when booking is not pending', async () => {
      const confirmedBooking = { ...mockBooking, status: BookingStatus.CONFIRMED };
      bookingRepository.findOne.mockResolvedValue(confirmedBooking as any);

      await expect(service.confirmBooking('booking-1', 'tenant-1', 'user-1'))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('cancelBooking', () => {
    it('should cancel booking successfully', async () => {
      const pendingBooking = { ...mockBooking, status: BookingStatus.PENDING };
      const cancelledBooking = { ...pendingBooking, status: BookingStatus.CANCELLED };
      bookingRepository.findOne.mockResolvedValue(pendingBooking as any);
      bookingRepository.save.mockResolvedValue(cancelledBooking as any);

      const result = await service.cancelBooking('booking-1', 'tenant-1', 'Test reason', 'user-1');

      expect(result.status).toBe(BookingStatus.CANCELLED);
      expect(result.cancellationReason).toBe('Test reason');
      expect(bookingRepository.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException when booking cannot be cancelled', async () => {
      const completedBooking = { ...mockBooking, status: BookingStatus.COMPLETED };
      bookingRepository.findOne.mockResolvedValue(completedBooking as any);

      await expect(service.cancelBooking('booking-1', 'tenant-1', 'Test reason', 'user-1'))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('checkInBooking', () => {
    it('should check in booking successfully', async () => {
      const confirmedBooking = { ...mockBooking, status: BookingStatus.CONFIRMED };
      const checkedInBooking = { ...confirmedBooking, status: BookingStatus.CHECKED_IN };
      bookingRepository.findOne.mockResolvedValue(confirmedBooking as any);
      bookingRepository.save.mockResolvedValue(checkedInBooking as any);

      const result = await service.checkInBooking('booking-1', 'tenant-1', 'user-1');

      expect(result.status).toBe(BookingStatus.CHECKED_IN);
      expect(result.actualCheckInTime).toBeDefined();
      expect(bookingRepository.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException when booking is not confirmed', async () => {
      const pendingBooking = { ...mockBooking, status: BookingStatus.PENDING };
      bookingRepository.findOne.mockResolvedValue(pendingBooking as any);

      await expect(service.checkInBooking('booking-1', 'tenant-1', 'user-1'))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('checkOutBooking', () => {
    it('should check out booking successfully', async () => {
      const checkedInBooking = { ...mockBooking, status: BookingStatus.CHECKED_IN };
      const completedBooking = { ...checkedInBooking, status: BookingStatus.COMPLETED };
      bookingRepository.findOne.mockResolvedValue(checkedInBooking as any);
      bookingRepository.save.mockResolvedValue(completedBooking as any);

      const result = await service.checkOutBooking('booking-1', 'tenant-1', 'user-1');

      expect(result.status).toBe(BookingStatus.COMPLETED);
      expect(result.actualCheckOutTime).toBeDefined();
      expect(bookingRepository.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException when booking is not checked in', async () => {
      const confirmedBooking = { ...mockBooking, status: BookingStatus.CONFIRMED };
      bookingRepository.findOne.mockResolvedValue(confirmedBooking as any);

      await expect(service.checkOutBooking('booking-1', 'tenant-1', 'user-1'))
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
      tenantOrganizationRepository.findOne.mockResolvedValue(mockTenantOrganization as any);
      propertyRepository.findOne.mockResolvedValue(mockProperty as any);
      availabilityRepository.create.mockReturnValue(mockAvailability as any);
      availabilityRepository.save.mockResolvedValue(mockAvailability as any);

      const result = await service.createAvailability(createAvailabilityDto, 'user-1');

      expect(result).toEqual(mockAvailability);
      expect(availabilityRepository.create).toHaveBeenCalled();
      expect(availabilityRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when tenant organization not found', async () => {
      tenantOrganizationRepository.findOne.mockResolvedValue(null);

      await expect(service.createAvailability(createAvailabilityDto, 'user-1'))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('findAvailabilityById', () => {
    it('should return availability by id', async () => {
      availabilityRepository.findOne.mockResolvedValue(mockAvailability as any);

      const result = await service.findAvailabilityById('availability-1', 'tenant-1');

      expect(result).toEqual(mockAvailability);
      expect(availabilityRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'availability-1', tenantOrganizationId: 'tenant-1' },
        relations: ['property', 'user'],
      });
    });

    it('should throw NotFoundException when availability not found', async () => {
      availabilityRepository.findOne.mockResolvedValue(null);

      await expect(service.findAvailabilityById('availability-1', 'tenant-1'))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('updateAvailability', () => {
    const updateDto = {
      title: 'Updated Availability',
      maxBookings: 10,
    };

    it('should update availability successfully', async () => {
      const updatedAvailability = { ...mockAvailability, ...updateDto };
      availabilityRepository.findOne.mockResolvedValue(mockAvailability as any);
      availabilityRepository.save.mockResolvedValue(updatedAvailability as any);

      const result = await service.updateAvailability('availability-1', 'tenant-1', updateDto, 'user-1');

      expect(result).toEqual(updatedAvailability);
      expect(availabilityRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when availability not found', async () => {
      availabilityRepository.findOne.mockResolvedValue(null);

      await expect(service.updateAvailability('availability-1', 'tenant-1', updateDto, 'user-1'))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteAvailability', () => {
    it('should delete availability successfully', async () => {
      availabilityRepository.findOne.mockResolvedValue(mockAvailability as any);
      bookingRepository.count.mockResolvedValue(0); // No active bookings
      availabilityRepository.update.mockResolvedValue({ affected: 1 } as any);

      await service.deleteAvailability('availability-1', 'tenant-1', 'user-1');

      expect(availabilityRepository.update).toHaveBeenCalledWith(
        { id: 'availability-1', tenantOrganizationId: 'tenant-1' },
        { deletedAt: expect.any(Date), deletedBy: 'user-1' }
      );
    });

    it('should throw BadRequestException when availability has active bookings', async () => {
      availabilityRepository.findOne.mockResolvedValue(mockAvailability as any);
      bookingRepository.count.mockResolvedValue(2); // Has active bookings

      await expect(service.deleteAvailability('availability-1', 'tenant-1', 'user-1'))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('getBookingDashboardStats', () => {
    it('should return dashboard statistics', async () => {
      const mockStats = {
        totalBookings: 100,
        activeBookings: 20,
        completedBookings: 70,
        cancelledBookings: 10,
        totalRevenue: 50000,
        averageBookingValue: 500,
        occupancyRate: 75,
        recentBookings: [],
        upcomingBookings: [],
      };

      // Mock all the query builder calls for dashboard stats
      const mockQueryBuilder = bookingRepository.createQueryBuilder();
      mockQueryBuilder.getRawOne
        .mockResolvedValueOnce({ count: '100' }) // totalBookings
        .mockResolvedValueOnce({ count: '20' })  // activeBookings
        .mockResolvedValueOnce({ count: '70' })  // completedBookings
        .mockResolvedValueOnce({ count: '10' })  // cancelledBookings
        .mockResolvedValueOnce({ sum: '50000' }) // totalRevenue
        .mockResolvedValueOnce({ avg: '60' });   // averageBookingDuration

      mockQueryBuilder.getRawMany
        .mockResolvedValueOnce([{ hour: '14', count: '5' }]) // popularTimeSlots
        .mockResolvedValueOnce([{ day: 'Monday', count: '10' }]) // popularDays
        .mockResolvedValueOnce([{ type: 'PROPERTY_VIEWING', count: '50' }]) // bookingsByType
        .mockResolvedValueOnce([{ propertyId: 'property-1', propertyName: 'Test Property', count: '25' }]); // bookingsByProperty

      bookingRepository.find
        .mockResolvedValueOnce([]) // recentBookings
        .mockResolvedValueOnce([]); // upcomingBookings

      const result = await service.getBookingDashboardStats('tenant-1');

      expect(result).toBeDefined();
      expect(result.totalBookings).toBe(100);
      expect(result.activeBookings).toBe(20);
      expect(result.completedBookings).toBe(70);
      expect(result.cancelledBookings).toBe(10);
    });
  });
});
