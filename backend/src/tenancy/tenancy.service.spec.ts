import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { TenancyService } from './tenancy.service';
import { Tenancy } from './entities/tenancy.entity';
import { RentPayment } from './entities/rent-payment.entity';
import { LeaseAgreement } from './entities/lease-agreement.entity';
import { CreateTenancyDto } from './dto/create-tenancy.dto';
import { UpdateTenancyDto } from './dto/update-tenancy.dto';
import { CreateRentPaymentDto } from './dto/create-rent-payment.dto';
import { UpdateRentPaymentDto } from './dto/update-rent-payment.dto';
import { CreateLeaseAgreementDto } from './dto/create-lease-agreement.dto';
import { UpdateLeaseAgreementDto } from './dto/update-lease-agreement.dto';

describe('TenancyService', () => {
  let service: TenancyService;
  let tenancyRepository: Repository<Tenancy>;
  let rentPaymentRepository: Repository<RentPayment>;
  let leaseAgreementRepository: Repository<LeaseAgreement>;

  const mockTenancy = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    propertyId: '123e4567-e89b-12d3-a456-426614174000',
    tenantId: '987fcdeb-51a2-43d1-9c4f-123456789abc',
    landlordId: '456e7890-e12b-34c5-d678-901234567def',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    rentAmount: 1200.00,
    depositAmount: 1800.00,
    status: 'active',
    paymentFrequency: 'monthly',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const mockRentPayment = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    tenancyId: '123e4567-e89b-12d3-a456-426614174000',
    amount: 1200.00,
    paymentDate: new Date('2024-01-01'),
    dueDate: new Date('2024-01-01'),
    status: 'completed',
    paymentMethod: 'bank_transfer',
    reference: 'RENT-JAN-2024',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const mockLeaseAgreement = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    tenancyId: '123e4567-e89b-12d3-a456-426614174000',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    rentAmount: 1200.00,
    depositAmount: 1800.00,
    terms: 'Standard residential tenancy terms',
    status: 'active',
    signedByTenant: true,
    signedByLandlord: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const mockTenancyRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getMany: jest.fn(),
      getOne: jest.fn(),
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      getRawOne: jest.fn()
    }))
  };

  const mockRentPaymentRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getMany: jest.fn(),
      getOne: jest.fn()
    }))
  };

  const mockLeaseAgreementRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getMany: jest.fn(),
      getOne: jest.fn()
    }))
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenancyService,
        {
          provide: getRepositoryToken(Tenancy),
          useValue: mockTenancyRepository
        },
        {
          provide: getRepositoryToken(RentPayment),
          useValue: mockRentPaymentRepository
        },
        {
          provide: getRepositoryToken(LeaseAgreement),
          useValue: mockLeaseAgreementRepository
        }
      ]
    }).compile();

    service = module.get<TenancyService>(TenancyService);
    tenancyRepository = module.get<Repository<Tenancy>>(getRepositoryToken(Tenancy));
    rentPaymentRepository = module.get<Repository<RentPayment>>(getRepositoryToken(RentPayment));
    leaseAgreementRepository = module.get<Repository<LeaseAgreement>>(getRepositoryToken(LeaseAgreement));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createTenancy', () => {
    const createTenancyDto: CreateTenancyDto = {
      propertyId: '123e4567-e89b-12d3-a456-426614174000',
      tenantId: '987fcdeb-51a2-43d1-9c4f-123456789abc',
      landlordId: '456e7890-e12b-34c5-d678-901234567def',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      rentAmount: 1200.00,
      depositAmount: 1800.00,
      paymentFrequency: 'monthly'
    };

    it('should create a new tenancy successfully', async () => {
      mockTenancyRepository.create.mockReturnValue(mockTenancy);
      mockTenancyRepository.save.mockResolvedValue(mockTenancy);

      const result = await service.createTenancy(createTenancyDto);

      expect(mockTenancyRepository.create).toHaveBeenCalledWith(createTenancyDto);
      expect(mockTenancyRepository.save).toHaveBeenCalledWith(mockTenancy);
      expect(result).toEqual(mockTenancy);
    });

    it('should throw BadRequestException when save fails', async () => {
      mockTenancyRepository.create.mockReturnValue(mockTenancy);
      mockTenancyRepository.save.mockRejectedValue(new Error('Database error'));

      await expect(service.createTenancy(createTenancyDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAllTenancies', () => {
    it('should return all tenancies with relations', async () => {
      const tenancies = [mockTenancy];
      mockTenancyRepository.find.mockResolvedValue(tenancies);

      const result = await service.findAllTenancies();

      expect(mockTenancyRepository.find).toHaveBeenCalledWith({
        relations: ['property', 'tenant', 'landlord', 'rentPayments', 'leaseAgreements']
      });
      expect(result).toEqual(tenancies);
    });
  });

  describe('findTenancyById', () => {
    it('should return tenancy when found', async () => {
      mockTenancyRepository.findOne.mockResolvedValue(mockTenancy);

      const result = await service.findTenancyById('123e4567-e89b-12d3-a456-426614174000');

      expect(mockTenancyRepository.findOne).toHaveBeenCalledWith({
        where: { id: '123e4567-e89b-12d3-a456-426614174000' },
        relations: ['property', 'tenant', 'landlord', 'rentPayments', 'leaseAgreements']
      });
      expect(result).toEqual(mockTenancy);
    });

    it('should throw NotFoundException when tenancy not found', async () => {
      mockTenancyRepository.findOne.mockResolvedValue(null);

      await expect(service.findTenancyById('nonexistent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateTenancy', () => {
    const updateTenancyDto: UpdateTenancyDto = {
      rentAmount: 1300.00,
      status: 'active'
    };

    it('should update tenancy successfully', async () => {
      const updatedTenancy = { ...mockTenancy, ...updateTenancyDto };
      mockTenancyRepository.findOneBy.mockResolvedValue(mockTenancy);
      mockTenancyRepository.save.mockResolvedValue(updatedTenancy);

      const result = await service.updateTenancy('123e4567-e89b-12d3-a456-426614174000', updateTenancyDto);

      expect(mockTenancyRepository.findOneBy).toHaveBeenCalledWith({ id: '123e4567-e89b-12d3-a456-426614174000' });
      expect(mockTenancyRepository.save).toHaveBeenCalledWith({ ...mockTenancy, ...updateTenancyDto });
      expect(result).toEqual(updatedTenancy);
    });

    it('should throw NotFoundException when tenancy not found', async () => {
      mockTenancyRepository.findOneBy.mockResolvedValue(null);

      await expect(service.updateTenancy('nonexistent-id', updateTenancyDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('removeTenancy', () => {
    it('should remove tenancy successfully', async () => {
      mockTenancyRepository.findOneBy.mockResolvedValue(mockTenancy);
      mockTenancyRepository.delete.mockResolvedValue({ affected: 1 });

      await service.removeTenancy('123e4567-e89b-12d3-a456-426614174000');

      expect(mockTenancyRepository.findOneBy).toHaveBeenCalledWith({ id: '123e4567-e89b-12d3-a456-426614174000' });
      expect(mockTenancyRepository.delete).toHaveBeenCalledWith('123e4567-e89b-12d3-a456-426614174000');
    });

    it('should throw NotFoundException when tenancy not found', async () => {
      mockTenancyRepository.findOneBy.mockResolvedValue(null);

      await expect(service.removeTenancy('nonexistent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findTenanciesByProperty', () => {
    it('should return tenancies for a property', async () => {
      const tenancies = [mockTenancy];
      mockTenancyRepository.find.mockResolvedValue(tenancies);

      const result = await service.findTenanciesByProperty('123e4567-e89b-12d3-a456-426614174000');

      expect(mockTenancyRepository.find).toHaveBeenCalledWith({
        where: { propertyId: '123e4567-e89b-12d3-a456-426614174000' },
        relations: ['tenant', 'landlord', 'rentPayments', 'leaseAgreements'],
        order: { startDate: 'DESC' }
      });
      expect(result).toEqual(tenancies);
    });
  });

  describe('findTenanciesByTenant', () => {
    it('should return tenancies for a tenant', async () => {
      const tenancies = [mockTenancy];
      mockTenancyRepository.find.mockResolvedValue(tenancies);

      const result = await service.findTenanciesByTenant('987fcdeb-51a2-43d1-9c4f-123456789abc');

      expect(mockTenancyRepository.find).toHaveBeenCalledWith({
        where: { tenantId: '987fcdeb-51a2-43d1-9c4f-123456789abc' },
        relations: ['property', 'landlord', 'rentPayments', 'leaseAgreements'],
        order: { startDate: 'DESC' }
      });
      expect(result).toEqual(tenancies);
    });
  });

  describe('findTenanciesByLandlord', () => {
    it('should return tenancies for a landlord', async () => {
      const tenancies = [mockTenancy];
      mockTenancyRepository.find.mockResolvedValue(tenancies);

      const result = await service.findTenanciesByLandlord('456e7890-e12b-34c5-d678-901234567def');

      expect(mockTenancyRepository.find).toHaveBeenCalledWith({
        where: { landlordId: '456e7890-e12b-34c5-d678-901234567def' },
        relations: ['property', 'tenant', 'rentPayments', 'leaseAgreements'],
        order: { startDate: 'DESC' }
      });
      expect(result).toEqual(tenancies);
    });
  });

  describe('findActiveTenancies', () => {
    it('should return active tenancies', async () => {
      const queryBuilder = mockTenancyRepository.createQueryBuilder();
      queryBuilder.getMany.mockResolvedValue([mockTenancy]);

      const result = await service.findActiveTenancies();

      expect(mockTenancyRepository.createQueryBuilder).toHaveBeenCalledWith('tenancy');
      expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('tenancy.property', 'property');
      expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('tenancy.tenant', 'tenant');
      expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('tenancy.landlord', 'landlord');
      expect(queryBuilder.where).toHaveBeenCalledWith('tenancy.status = :status', { status: 'active' });
      expect(result).toEqual([mockTenancy]);
    });
  });

  describe('getTenancyFinancialSummary', () => {
    it('should return financial summary for a tenancy', async () => {
      const mockSummary = {
        totalRentDue: '14400.00',
        totalPaid: '12000.00',
        outstandingAmount: '2400.00',
        paymentCount: '12'
      };
      
      mockTenancyRepository.findOneBy.mockResolvedValue(mockTenancy);
      const queryBuilder = mockTenancyRepository.createQueryBuilder();
      queryBuilder.getRawOne.mockResolvedValue(mockSummary);

      const result = await service.getTenancyFinancialSummary('123e4567-e89b-12d3-a456-426614174000');

      expect(mockTenancyRepository.findOneBy).toHaveBeenCalledWith({ id: '123e4567-e89b-12d3-a456-426614174000' });
      expect(result).toEqual({
        tenancyId: '123e4567-e89b-12d3-a456-426614174000',
        totalRentDue: 14400.00,
        totalPaid: 12000.00,
        outstandingAmount: 2400.00,
        paymentCount: 12
      });
    });

    it('should throw NotFoundException when tenancy not found', async () => {
      mockTenancyRepository.findOneBy.mockResolvedValue(null);

      await expect(service.getTenancyFinancialSummary('nonexistent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('generateRentPayments', () => {
    it('should generate rent payments for a tenancy', async () => {
      mockTenancyRepository.findOneBy.mockResolvedValue(mockTenancy);
      mockRentPaymentRepository.create.mockReturnValue(mockRentPayment);
      mockRentPaymentRepository.save.mockResolvedValue([mockRentPayment]);

      const result = await service.generateRentPayments('123e4567-e89b-12d3-a456-426614174000');

      expect(mockTenancyRepository.findOneBy).toHaveBeenCalledWith({ id: '123e4567-e89b-12d3-a456-426614174000' });
      expect(result).toEqual([mockRentPayment]);
    });

    it('should throw NotFoundException when tenancy not found', async () => {
      mockTenancyRepository.findOneBy.mockResolvedValue(null);

      await expect(service.generateRentPayments('nonexistent-id')).rejects.toThrow(NotFoundException);
    });
  });

  // Rent Payment Tests
  describe('createRentPayment', () => {
    const createRentPaymentDto: CreateRentPaymentDto = {
      tenancyId: '123e4567-e89b-12d3-a456-426614174000',
      amount: 1200.00,
      paymentDate: new Date('2024-01-01'),
      paymentMethod: 'bank_transfer',
      reference: 'RENT-JAN-2024'
    };

    it('should create a new rent payment successfully', async () => {
      mockRentPaymentRepository.create.mockReturnValue(mockRentPayment);
      mockRentPaymentRepository.save.mockResolvedValue(mockRentPayment);

      const result = await service.createRentPayment(createRentPaymentDto);

      expect(mockRentPaymentRepository.create).toHaveBeenCalledWith(createRentPaymentDto);
      expect(mockRentPaymentRepository.save).toHaveBeenCalledWith(mockRentPayment);
      expect(result).toEqual(mockRentPayment);
    });
  });

  describe('findAllRentPayments', () => {
    it('should return all rent payments with relations', async () => {
      const payments = [mockRentPayment];
      mockRentPaymentRepository.find.mockResolvedValue(payments);

      const result = await service.findAllRentPayments();

      expect(mockRentPaymentRepository.find).toHaveBeenCalledWith({
        relations: ['tenancy', 'tenancy.property', 'tenancy.tenant'],
        order: { paymentDate: 'DESC' }
      });
      expect(result).toEqual(payments);
    });
  });

  describe('findRentPaymentById', () => {
    it('should return rent payment when found', async () => {
      mockRentPaymentRepository.findOne.mockResolvedValue(mockRentPayment);

      const result = await service.findRentPaymentById('123e4567-e89b-12d3-a456-426614174000');

      expect(mockRentPaymentRepository.findOne).toHaveBeenCalledWith({
        where: { id: '123e4567-e89b-12d3-a456-426614174000' },
        relations: ['tenancy', 'tenancy.property', 'tenancy.tenant']
      });
      expect(result).toEqual(mockRentPayment);
    });

    it('should throw NotFoundException when payment not found', async () => {
      mockRentPaymentRepository.findOne.mockResolvedValue(null);

      await expect(service.findRentPaymentById('nonexistent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateRentPayment', () => {
    const updateRentPaymentDto: UpdateRentPaymentDto = {
      status: 'completed',
      notes: 'Payment confirmed'
    };

    it('should update rent payment successfully', async () => {
      const updatedPayment = { ...mockRentPayment, ...updateRentPaymentDto };
      mockRentPaymentRepository.findOneBy.mockResolvedValue(mockRentPayment);
      mockRentPaymentRepository.save.mockResolvedValue(updatedPayment);

      const result = await service.updateRentPayment('123e4567-e89b-12d3-a456-426614174000', updateRentPaymentDto);

      expect(mockRentPaymentRepository.findOneBy).toHaveBeenCalledWith({ id: '123e4567-e89b-12d3-a456-426614174000' });
      expect(result).toEqual(updatedPayment);
    });

    it('should throw NotFoundException when payment not found', async () => {
      mockRentPaymentRepository.findOneBy.mockResolvedValue(null);

      await expect(service.updateRentPayment('nonexistent-id', updateRentPaymentDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('removeRentPayment', () => {
    it('should remove rent payment successfully', async () => {
      mockRentPaymentRepository.findOneBy.mockResolvedValue(mockRentPayment);
      mockRentPaymentRepository.delete.mockResolvedValue({ affected: 1 });

      await service.removeRentPayment('123e4567-e89b-12d3-a456-426614174000');

      expect(mockRentPaymentRepository.findOneBy).toHaveBeenCalledWith({ id: '123e4567-e89b-12d3-a456-426614174000' });
      expect(mockRentPaymentRepository.delete).toHaveBeenCalledWith('123e4567-e89b-12d3-a456-426614174000');
    });

    it('should throw NotFoundException when payment not found', async () => {
      mockRentPaymentRepository.findOneBy.mockResolvedValue(null);

      await expect(service.removeRentPayment('nonexistent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findRentPaymentsByTenancy', () => {
    it('should return rent payments for a tenancy', async () => {
      const payments = [mockRentPayment];
      mockRentPaymentRepository.find.mockResolvedValue(payments);

      const result = await service.findRentPaymentsByTenancy('123e4567-e89b-12d3-a456-426614174000');

      expect(mockRentPaymentRepository.find).toHaveBeenCalledWith({
        where: { tenancyId: '123e4567-e89b-12d3-a456-426614174000' },
        relations: ['tenancy'],
        order: { paymentDate: 'DESC' }
      });
      expect(result).toEqual(payments);
    });
  });

  describe('findOverduePayments', () => {
    it('should return overdue payments', async () => {
      const queryBuilder = mockRentPaymentRepository.createQueryBuilder();
      queryBuilder.getMany.mockResolvedValue([mockRentPayment]);

      const result = await service.findOverduePayments();

      expect(mockRentPaymentRepository.createQueryBuilder).toHaveBeenCalledWith('payment');
      expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('payment.tenancy', 'tenancy');
      expect(queryBuilder.where).toHaveBeenCalledWith('payment.dueDate < :currentDate', { currentDate: expect.any(Date) });
      expect(result).toEqual([mockRentPayment]);
    });
  });

  // Lease Agreement Tests
  describe('createLeaseAgreement', () => {
    const createLeaseAgreementDto: CreateLeaseAgreementDto = {
      tenancyId: '123e4567-e89b-12d3-a456-426614174000',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      rentAmount: 1200.00,
      depositAmount: 1800.00,
      terms: 'Standard residential tenancy terms'
    };

    it('should create a new lease agreement successfully', async () => {
      mockLeaseAgreementRepository.create.mockReturnValue(mockLeaseAgreement);
      mockLeaseAgreementRepository.save.mockResolvedValue(mockLeaseAgreement);

      const result = await service.createLeaseAgreement(createLeaseAgreementDto);

      expect(mockLeaseAgreementRepository.create).toHaveBeenCalledWith(createLeaseAgreementDto);
      expect(mockLeaseAgreementRepository.save).toHaveBeenCalledWith(mockLeaseAgreement);
      expect(result).toEqual(mockLeaseAgreement);
    });
  });

  describe('findAllLeaseAgreements', () => {
    it('should return all lease agreements with relations', async () => {
      const agreements = [mockLeaseAgreement];
      mockLeaseAgreementRepository.find.mockResolvedValue(agreements);

      const result = await service.findAllLeaseAgreements();

      expect(mockLeaseAgreementRepository.find).toHaveBeenCalledWith({
        relations: ['tenancy', 'tenancy.property', 'tenancy.tenant', 'tenancy.landlord'],
        order: { createdAt: 'DESC' }
      });
      expect(result).toEqual(agreements);
    });
  });

  describe('findLeaseAgreementById', () => {
    it('should return lease agreement when found', async () => {
      mockLeaseAgreementRepository.findOne.mockResolvedValue(mockLeaseAgreement);

      const result = await service.findLeaseAgreementById('123e4567-e89b-12d3-a456-426614174000');

      expect(mockLeaseAgreementRepository.findOne).toHaveBeenCalledWith({
        where: { id: '123e4567-e89b-12d3-a456-426614174000' },
        relations: ['tenancy', 'tenancy.property', 'tenancy.tenant', 'tenancy.landlord']
      });
      expect(result).toEqual(mockLeaseAgreement);
    });

    it('should throw NotFoundException when agreement not found', async () => {
      mockLeaseAgreementRepository.findOne.mockResolvedValue(null);

      await expect(service.findLeaseAgreementById('nonexistent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateLeaseAgreement', () => {
    const updateLeaseAgreementDto: UpdateLeaseAgreementDto = {
      status: 'active',
      signedByTenant: true
    };

    it('should update lease agreement successfully', async () => {
      const updatedAgreement = { ...mockLeaseAgreement, ...updateLeaseAgreementDto };
      mockLeaseAgreementRepository.findOneBy.mockResolvedValue(mockLeaseAgreement);
      mockLeaseAgreementRepository.save.mockResolvedValue(updatedAgreement);

      const result = await service.updateLeaseAgreement('123e4567-e89b-12d3-a456-426614174000', updateLeaseAgreementDto);

      expect(mockLeaseAgreementRepository.findOneBy).toHaveBeenCalledWith({ id: '123e4567-e89b-12d3-a456-426614174000' });
      expect(result).toEqual(updatedAgreement);
    });

    it('should throw NotFoundException when agreement not found', async () => {
      mockLeaseAgreementRepository.findOneBy.mockResolvedValue(null);

      await expect(service.updateLeaseAgreement('nonexistent-id', updateLeaseAgreementDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('removeLeaseAgreement', () => {
    it('should remove lease agreement successfully', async () => {
      mockLeaseAgreementRepository.findOneBy.mockResolvedValue(mockLeaseAgreement);
      mockLeaseAgreementRepository.delete.mockResolvedValue({ affected: 1 });

      await service.removeLeaseAgreement('123e4567-e89b-12d3-a456-426614174000');

      expect(mockLeaseAgreementRepository.findOneBy).toHaveBeenCalledWith({ id: '123e4567-e89b-12d3-a456-426614174000' });
      expect(mockLeaseAgreementRepository.delete).toHaveBeenCalledWith('123e4567-e89b-12d3-a456-426614174000');
    });

    it('should throw NotFoundException when agreement not found', async () => {
      mockLeaseAgreementRepository.findOneBy.mockResolvedValue(null);

      await expect(service.removeLeaseAgreement('nonexistent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findLeaseAgreementsByTenancy', () => {
    it('should return lease agreements for a tenancy', async () => {
      const agreements = [mockLeaseAgreement];
      mockLeaseAgreementRepository.find.mockResolvedValue(agreements);

      const result = await service.findLeaseAgreementsByTenancy('123e4567-e89b-12d3-a456-426614174000');

      expect(mockLeaseAgreementRepository.find).toHaveBeenCalledWith({
        where: { tenancyId: '123e4567-e89b-12d3-a456-426614174000' },
        relations: ['tenancy'],
        order: { createdAt: 'DESC' }
      });
      expect(result).toEqual(agreements);
    });
  });

  describe('findActiveLeaseAgreements', () => {
    it('should return active lease agreements', async () => {
      const queryBuilder = mockLeaseAgreementRepository.createQueryBuilder();
      queryBuilder.getMany.mockResolvedValue([mockLeaseAgreement]);

      const result = await service.findActiveLeaseAgreements();

      expect(mockLeaseAgreementRepository.createQueryBuilder).toHaveBeenCalledWith('agreement');
      expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('agreement.tenancy', 'tenancy');
      expect(queryBuilder.where).toHaveBeenCalledWith('agreement.status = :status', { status: 'active' });
      expect(result).toEqual([mockLeaseAgreement]);
    });
  });
});
