import { Test, TestingModule } from '@nestjs/testing';
import { TenancyController } from './tenancy.controller';
import { TenancyService } from './tenancy.service';
import { CreateTenancyDto } from './dto/create-tenancy.dto';
import { UpdateTenancyDto } from './dto/update-tenancy.dto';
import { CreateRentPaymentDto } from './dto/create-rent-payment.dto';
import { UpdateRentPaymentDto } from './dto/update-rent-payment.dto';
import { CreateLeaseAgreementDto } from './dto/create-lease-agreement.dto';
import { UpdateLeaseAgreementDto } from './dto/update-lease-agreement.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('TenancyController', () => {
  let controller: TenancyController;
  let service: TenancyService;

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

  const mockFinancialSummary = {
    tenancyId: '123e4567-e89b-12d3-a456-426614174000',
    totalRentDue: 14400.00,
    totalPaid: 12000.00,
    outstandingAmount: 2400.00,
    paymentCount: 12
  };

  const mockTenancyService = {
    createTenancy: jest.fn(),
    findAllTenancies: jest.fn(),
    findActiveTenancies: jest.fn(),
    findTenanciesByProperty: jest.fn(),
    findTenanciesByTenant: jest.fn(),
    findTenanciesByLandlord: jest.fn(),
    findTenancyById: jest.fn(),
    updateTenancy: jest.fn(),
    removeTenancy: jest.fn(),
    getTenancyFinancialSummary: jest.fn(),
    generateRentPayments: jest.fn(),
    createRentPayment: jest.fn(),
    findAllRentPayments: jest.fn(),
    findOverduePayments: jest.fn(),
    findRentPaymentsByTenancy: jest.fn(),
    findRentPaymentById: jest.fn(),
    updateRentPayment: jest.fn(),
    removeRentPayment: jest.fn(),
    createLeaseAgreement: jest.fn(),
    findAllLeaseAgreements: jest.fn(),
    findLeaseAgreementsByTenancy: jest.fn(),
    findLeaseAgreementById: jest.fn(),
    updateLeaseAgreement: jest.fn(),
    removeLeaseAgreement: jest.fn(),
    findActiveLeaseAgreements: jest.fn()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TenancyController],
      providers: [
        {
          provide: TenancyService,
          useValue: mockTenancyService
        }
      ]
    }).compile();

    controller = module.get<TenancyController>(TenancyController);
    service = module.get<TenancyService>(TenancyService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
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
      mockTenancyService.createTenancy.mockResolvedValue(mockTenancy);

      const result = await controller.createTenancy(createTenancyDto);

      expect(service.createTenancy).toHaveBeenCalledWith(createTenancyDto);
      expect(result).toEqual(mockTenancy);
    });

    it('should handle service errors', async () => {
      mockTenancyService.createTenancy.mockRejectedValue(new BadRequestException('Invalid data'));

      await expect(controller.createTenancy(createTenancyDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAllTenancies', () => {
    it('should return all tenancies', async () => {
      const tenancies = [mockTenancy];
      mockTenancyService.findAllTenancies.mockResolvedValue(tenancies);

      const result = await controller.findAllTenancies();

      expect(service.findAllTenancies).toHaveBeenCalled();
      expect(result).toEqual(tenancies);
    });
  });

  describe('findActiveTenancies', () => {
    it('should return active tenancies', async () => {
      const tenancies = [mockTenancy];
      mockTenancyService.findActiveTenancies.mockResolvedValue(tenancies);

      const result = await controller.findActiveTenancies();

      expect(service.findActiveTenancies).toHaveBeenCalled();
      expect(result).toEqual(tenancies);
    });
  });

  describe('findTenanciesByProperty', () => {
    it('should return tenancies for a property', async () => {
      const tenancies = [mockTenancy];
      mockTenancyService.findTenanciesByProperty.mockResolvedValue(tenancies);

      const result = await controller.findTenanciesByProperty('123e4567-e89b-12d3-a456-426614174000');

      expect(service.findTenanciesByProperty).toHaveBeenCalledWith('123e4567-e89b-12d3-a456-426614174000');
      expect(result).toEqual(tenancies);
    });
  });

  describe('findTenanciesByTenant', () => {
    it('should return tenancies for a tenant', async () => {
      const tenancies = [mockTenancy];
      mockTenancyService.findTenanciesByTenant.mockResolvedValue(tenancies);

      const result = await controller.findTenanciesByTenant('987fcdeb-51a2-43d1-9c4f-123456789abc');

      expect(service.findTenanciesByTenant).toHaveBeenCalledWith('987fcdeb-51a2-43d1-9c4f-123456789abc');
      expect(result).toEqual(tenancies);
    });
  });

  describe('findTenanciesByLandlord', () => {
    it('should return tenancies for a landlord', async () => {
      const tenancies = [mockTenancy];
      mockTenancyService.findTenanciesByLandlord.mockResolvedValue(tenancies);

      const result = await controller.findTenanciesByLandlord('456e7890-e12b-34c5-d678-901234567def');

      expect(service.findTenanciesByLandlord).toHaveBeenCalledWith('456e7890-e12b-34c5-d678-901234567def');
      expect(result).toEqual(tenancies);
    });
  });

  describe('findTenancyById', () => {
    it('should return tenancy when found', async () => {
      mockTenancyService.findTenancyById.mockResolvedValue(mockTenancy);

      const result = await controller.findTenancyById('123e4567-e89b-12d3-a456-426614174000');

      expect(service.findTenancyById).toHaveBeenCalledWith('123e4567-e89b-12d3-a456-426614174000');
      expect(result).toEqual(mockTenancy);
    });

    it('should handle not found error', async () => {
      mockTenancyService.findTenancyById.mockRejectedValue(new NotFoundException('Tenancy not found'));

      await expect(controller.findTenancyById('nonexistent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateTenancy', () => {
    const updateTenancyDto: UpdateTenancyDto = {
      rentAmount: 1300.00,
      status: 'active'
    };

    it('should update tenancy successfully', async () => {
      const updatedTenancy = { ...mockTenancy, ...updateTenancyDto };
      mockTenancyService.updateTenancy.mockResolvedValue(updatedTenancy);

      const result = await controller.updateTenancy('123e4567-e89b-12d3-a456-426614174000', updateTenancyDto);

      expect(service.updateTenancy).toHaveBeenCalledWith('123e4567-e89b-12d3-a456-426614174000', updateTenancyDto);
      expect(result).toEqual(updatedTenancy);
    });

    it('should handle not found error', async () => {
      mockTenancyService.updateTenancy.mockRejectedValue(new NotFoundException('Tenancy not found'));

      await expect(controller.updateTenancy('nonexistent-id', updateTenancyDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('removeTenancy', () => {
    it('should remove tenancy successfully', async () => {
      mockTenancyService.removeTenancy.mockResolvedValue(undefined);

      await controller.removeTenancy('123e4567-e89b-12d3-a456-426614174000');

      expect(service.removeTenancy).toHaveBeenCalledWith('123e4567-e89b-12d3-a456-426614174000');
    });

    it('should handle not found error', async () => {
      mockTenancyService.removeTenancy.mockRejectedValue(new NotFoundException('Tenancy not found'));

      await expect(controller.removeTenancy('nonexistent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getTenancyFinancialSummary', () => {
    it('should return financial summary', async () => {
      mockTenancyService.getTenancyFinancialSummary.mockResolvedValue(mockFinancialSummary);

      const result = await controller.getTenancyFinancialSummary('123e4567-e89b-12d3-a456-426614174000');

      expect(service.getTenancyFinancialSummary).toHaveBeenCalledWith('123e4567-e89b-12d3-a456-426614174000');
      expect(result).toEqual(mockFinancialSummary);
    });

    it('should handle not found error', async () => {
      mockTenancyService.getTenancyFinancialSummary.mockRejectedValue(new NotFoundException('Tenancy not found'));

      await expect(controller.getTenancyFinancialSummary('nonexistent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('generateRentPayments', () => {
    it('should generate rent payments', async () => {
      const payments = [mockRentPayment];
      mockTenancyService.generateRentPayments.mockResolvedValue(payments);

      const result = await controller.generateRentPayments('123e4567-e89b-12d3-a456-426614174000');

      expect(service.generateRentPayments).toHaveBeenCalledWith('123e4567-e89b-12d3-a456-426614174000');
      expect(result).toEqual(payments);
    });

    it('should handle not found error', async () => {
      mockTenancyService.generateRentPayments.mockRejectedValue(new NotFoundException('Tenancy not found'));

      await expect(controller.generateRentPayments('nonexistent-id')).rejects.toThrow(NotFoundException);
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
      mockTenancyService.createRentPayment.mockResolvedValue(mockRentPayment);

      const result = await controller.createRentPayment(createRentPaymentDto);

      expect(service.createRentPayment).toHaveBeenCalledWith(createRentPaymentDto);
      expect(result).toEqual(mockRentPayment);
    });

    it('should handle service errors', async () => {
      mockTenancyService.createRentPayment.mockRejectedValue(new BadRequestException('Invalid payment data'));

      await expect(controller.createRentPayment(createRentPaymentDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAllRentPayments', () => {
    it('should return all rent payments', async () => {
      const payments = [mockRentPayment];
      mockTenancyService.findAllRentPayments.mockResolvedValue(payments);

      const result = await controller.findAllRentPayments();

      expect(service.findAllRentPayments).toHaveBeenCalled();
      expect(result).toEqual(payments);
    });
  });

  describe('findOverduePayments', () => {
    it('should return overdue payments with default days', async () => {
      const payments = [mockRentPayment];
      mockTenancyService.findOverduePayments.mockResolvedValue(payments);

      const result = await controller.findOverduePayments();

      expect(service.findOverduePayments).toHaveBeenCalledWith(0);
      expect(result).toEqual(payments);
    });

    it('should return overdue payments with specified days', async () => {
      const payments = [mockRentPayment];
      mockTenancyService.findOverduePayments.mockResolvedValue(payments);

      const result = await controller.findOverduePayments(30);

      expect(service.findOverduePayments).toHaveBeenCalledWith(30);
      expect(result).toEqual(payments);
    });
  });

  describe('findRentPaymentsByTenancy', () => {
    it('should return rent payments for a tenancy', async () => {
      const payments = [mockRentPayment];
      mockTenancyService.findRentPaymentsByTenancy.mockResolvedValue(payments);

      const result = await controller.findRentPaymentsByTenancy('123e4567-e89b-12d3-a456-426614174000');

      expect(service.findRentPaymentsByTenancy).toHaveBeenCalledWith('123e4567-e89b-12d3-a456-426614174000');
      expect(result).toEqual(payments);
    });
  });

  describe('findRentPaymentById', () => {
    it('should return rent payment when found', async () => {
      mockTenancyService.findRentPaymentById.mockResolvedValue(mockRentPayment);

      const result = await controller.findRentPaymentById('123e4567-e89b-12d3-a456-426614174000');

      expect(service.findRentPaymentById).toHaveBeenCalledWith('123e4567-e89b-12d3-a456-426614174000');
      expect(result).toEqual(mockRentPayment);
    });

    it('should handle not found error', async () => {
      mockTenancyService.findRentPaymentById.mockRejectedValue(new NotFoundException('Payment not found'));

      await expect(controller.findRentPaymentById('nonexistent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateRentPayment', () => {
    const updateRentPaymentDto: UpdateRentPaymentDto = {
      status: 'completed',
      notes: 'Payment confirmed'
    };

    it('should update rent payment successfully', async () => {
      const updatedPayment = { ...mockRentPayment, ...updateRentPaymentDto };
      mockTenancyService.updateRentPayment.mockResolvedValue(updatedPayment);

      const result = await controller.updateRentPayment('123e4567-e89b-12d3-a456-426614174000', updateRentPaymentDto);

      expect(service.updateRentPayment).toHaveBeenCalledWith('123e4567-e89b-12d3-a456-426614174000', updateRentPaymentDto);
      expect(result).toEqual(updatedPayment);
    });

    it('should handle not found error', async () => {
      mockTenancyService.updateRentPayment.mockRejectedValue(new NotFoundException('Payment not found'));

      await expect(controller.updateRentPayment('nonexistent-id', updateRentPaymentDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('removeRentPayment', () => {
    it('should remove rent payment successfully', async () => {
      mockTenancyService.removeRentPayment.mockResolvedValue(undefined);

      await controller.removeRentPayment('123e4567-e89b-12d3-a456-426614174000');

      expect(service.removeRentPayment).toHaveBeenCalledWith('123e4567-e89b-12d3-a456-426614174000');
    });

    it('should handle not found error', async () => {
      mockTenancyService.removeRentPayment.mockRejectedValue(new NotFoundException('Payment not found'));

      await expect(controller.removeRentPayment('nonexistent-id')).rejects.toThrow(NotFoundException);
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
      mockTenancyService.createLeaseAgreement.mockResolvedValue(mockLeaseAgreement);

      const result = await controller.createLeaseAgreement(createLeaseAgreementDto);

      expect(service.createLeaseAgreement).toHaveBeenCalledWith(createLeaseAgreementDto);
      expect(result).toEqual(mockLeaseAgreement);
    });

    it('should handle service errors', async () => {
      mockTenancyService.createLeaseAgreement.mockRejectedValue(new BadRequestException('Invalid agreement data'));

      await expect(controller.createLeaseAgreement(createLeaseAgreementDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAllLeaseAgreements', () => {
    it('should return all lease agreements', async () => {
      const agreements = [mockLeaseAgreement];
      mockTenancyService.findAllLeaseAgreements.mockResolvedValue(agreements);

      const result = await controller.findAllLeaseAgreements();

      expect(service.findAllLeaseAgreements).toHaveBeenCalled();
      expect(result).toEqual(agreements);
    });
  });

  describe('findLeaseAgreementsByTenancy', () => {
    it('should return lease agreements for a tenancy', async () => {
      const agreements = [mockLeaseAgreement];
      mockTenancyService.findLeaseAgreementsByTenancy.mockResolvedValue(agreements);

      const result = await controller.findLeaseAgreementsByTenancy('123e4567-e89b-12d3-a456-426614174000');

      expect(service.findLeaseAgreementsByTenancy).toHaveBeenCalledWith('123e4567-e89b-12d3-a456-426614174000');
      expect(result).toEqual(agreements);
    });
  });

  describe('findLeaseAgreementById', () => {
    it('should return lease agreement when found', async () => {
      mockTenancyService.findLeaseAgreementById.mockResolvedValue(mockLeaseAgreement);

      const result = await controller.findLeaseAgreementById('123e4567-e89b-12d3-a456-426614174000');

      expect(service.findLeaseAgreementById).toHaveBeenCalledWith('123e4567-e89b-12d3-a456-426614174000');
      expect(result).toEqual(mockLeaseAgreement);
    });

    it('should handle not found error', async () => {
      mockTenancyService.findLeaseAgreementById.mockRejectedValue(new NotFoundException('Agreement not found'));

      await expect(controller.findLeaseAgreementById('nonexistent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateLeaseAgreement', () => {
    const updateLeaseAgreementDto: UpdateLeaseAgreementDto = {
      status: 'active',
      signedByTenant: true
    };

    it('should update lease agreement successfully', async () => {
      const updatedAgreement = { ...mockLeaseAgreement, ...updateLeaseAgreementDto };
      mockTenancyService.updateLeaseAgreement.mockResolvedValue(updatedAgreement);

      const result = await controller.updateLeaseAgreement('123e4567-e89b-12d3-a456-426614174000', updateLeaseAgreementDto);

      expect(service.updateLeaseAgreement).toHaveBeenCalledWith('123e4567-e89b-12d3-a456-426614174000', updateLeaseAgreementDto);
      expect(result).toEqual(updatedAgreement);
    });

    it('should handle not found error', async () => {
      mockTenancyService.updateLeaseAgreement.mockRejectedValue(new NotFoundException('Agreement not found'));

      await expect(controller.updateLeaseAgreement('nonexistent-id', updateLeaseAgreementDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('removeLeaseAgreement', () => {
    it('should remove lease agreement successfully', async () => {
      mockTenancyService.removeLeaseAgreement.mockResolvedValue(undefined);

      await controller.removeLeaseAgreement('123e4567-e89b-12d3-a456-426614174000');

      expect(service.removeLeaseAgreement).toHaveBeenCalledWith('123e4567-e89b-12d3-a456-426614174000');
    });

    it('should handle not found error', async () => {
      mockTenancyService.removeLeaseAgreement.mockRejectedValue(new NotFoundException('Agreement not found'));

      await expect(controller.removeLeaseAgreement('nonexistent-id')).rejects.toThrow(NotFoundException);
    });
  });
});