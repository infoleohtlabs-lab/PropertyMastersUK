import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Tenancy, TenancyStatus } from './entities/tenancy.entity';
import { RentPayment } from './entities/rent-payment.entity';
import { LeaseAgreement, AgreementStatus } from './entities/lease-agreement.entity';
import { PaymentStatus } from './entities/rent-payment.entity';
import { CreateTenancyDto, UpdateTenancyDto } from './dto';
import { CreateRentPaymentDto, UpdateRentPaymentDto } from './dto';
import { CreateLeaseAgreementDto, UpdateLeaseAgreementDto } from './dto';

@Injectable()
export class TenancyService {
  constructor(
    @InjectRepository(Tenancy)
    private tenancyRepository: Repository<Tenancy>,
    @InjectRepository(RentPayment)
    private rentPaymentRepository: Repository<RentPayment>,
    @InjectRepository(LeaseAgreement)
    private leaseAgreementRepository: Repository<LeaseAgreement>,
  ) {}

  // Tenancy CRUD operations
  async createTenancy(createTenancyDto: CreateTenancyDto): Promise<Tenancy> {
    const tenancy = this.tenancyRepository.create({
      propertyId: createTenancyDto.propertyId,
      tenantId: createTenancyDto.tenantId,
      landlordId: createTenancyDto.landlordId,
      agentId: createTenancyDto.agentId,
      status: createTenancyDto.status || TenancyStatus.PENDING,
      type: createTenancyDto.tenancyType,
      startDate: new Date(createTenancyDto.startDate),
      endDate: new Date(createTenancyDto.endDate),
      monthlyRent: createTenancyDto.rentAmount,
      deposit: createTenancyDto.depositAmount,
      rentDueDay: createTenancyDto.rentDueDay,
      specialConditions: createTenancyDto.specialTerms,
    });
    return this.tenancyRepository.save(tenancy);
  }

  async findAllTenancies(): Promise<Tenancy[]> {
    return this.tenancyRepository.find({
      relations: ['property', 'tenant', 'landlord', 'agent', 'rentPayments', 'leaseAgreements'],
      order: { createdAt: 'DESC' },
    });
  }

  async findTenancyById(id: string): Promise<Tenancy> {
    const tenancy = await this.tenancyRepository.findOne({
      where: { id },
      relations: ['property', 'tenant', 'landlord', 'agent', 'rentPayments', 'leaseAgreements'],
    });

    if (!tenancy) {
      throw new NotFoundException('Tenancy not found');
    }

    return tenancy;
  }

  async updateTenancy(id: string, updateTenancyDto: UpdateTenancyDto): Promise<Tenancy> {
    const updateData: any = {};
    
    // Map DTO fields to entity fields
    if (updateTenancyDto.propertyId) {
      updateData.propertyId = updateTenancyDto.propertyId;
    }
    if (updateTenancyDto.tenantId) {
      updateData.tenantId = updateTenancyDto.tenantId;
    }
    if (updateTenancyDto.landlordId) {
      updateData.landlordId = updateTenancyDto.landlordId;
    }
    if (updateTenancyDto.agentId) {
      updateData.agentId = updateTenancyDto.agentId;
    }
    if (updateTenancyDto.status) {
      updateData.status = updateTenancyDto.status;
    }
    if (updateTenancyDto.tenancyType) {
      updateData.type = updateTenancyDto.tenancyType;
    }
    if (updateTenancyDto.startDate) {
      updateData.startDate = new Date(updateTenancyDto.startDate);
    }
    if (updateTenancyDto.endDate) {
      updateData.endDate = new Date(updateTenancyDto.endDate);
    }
    if (updateTenancyDto.rentAmount !== undefined) {
      updateData.monthlyRent = updateTenancyDto.rentAmount;
    }
    if (updateTenancyDto.depositAmount !== undefined) {
      updateData.deposit = updateTenancyDto.depositAmount;
    }
    if (updateTenancyDto.rentDueDay !== undefined) {
      updateData.rentDueDay = updateTenancyDto.rentDueDay;
    }
    if (updateTenancyDto.specialTerms) {
      updateData.specialConditions = updateTenancyDto.specialTerms;
    }

    await this.tenancyRepository.update(id, updateData);
    return this.findTenancyById(id);
  }

  async removeTenancy(id: string): Promise<void> {
    const result = await this.tenancyRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Tenancy not found');
    }
  }

  async findTenanciesByProperty(propertyId: string): Promise<Tenancy[]> {
    return this.tenancyRepository.find({
      where: { propertyId },
      relations: ['tenant', 'landlord', 'agent', 'rentPayments', 'leaseAgreements'],
      order: { createdAt: 'DESC' },
    });
  }

  async findTenanciesByTenant(tenantId: string): Promise<Tenancy[]> {
    return this.tenancyRepository.find({
      where: { tenantId },
      relations: ['property', 'landlord', 'agent', 'rentPayments', 'leaseAgreements'],
      order: { createdAt: 'DESC' },
    });
  }

  async findTenanciesByLandlord(landlordId: string): Promise<Tenancy[]> {
    return this.tenancyRepository.find({
      where: { landlordId },
      relations: ['property', 'tenant', 'agent', 'rentPayments', 'leaseAgreements'],
      order: { createdAt: 'DESC' },
    });
  }

  async findActiveTenancies(): Promise<Tenancy[]> {
    const now = new Date();
    return this.tenancyRepository.find({
      where: {
        startDate: LessThanOrEqual(now),
        endDate: MoreThanOrEqual(now),
        status: TenancyStatus.ACTIVE,
      },
      relations: ['property', 'tenant', 'landlord', 'agent'],
      order: { createdAt: 'DESC' },
    });
  }

  async getTenancyFinancialSummary(id: string): Promise<any> {
    const tenancy = await this.findTenancyById(id);
    const rentPayments = await this.findRentPaymentsByTenancy(id);
    
    const totalRentDue = rentPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const totalRentPaid = rentPayments
      .filter(payment => payment.amountPaid > 0)
      .reduce((sum, payment) => sum + payment.amountPaid, 0);
    const outstandingRent = totalRentDue - totalRentPaid;
    
    return {
      tenancyId: id,
      monthlyRent: tenancy.monthlyRent,
      totalRentDue,
      totalRentPaid,
      outstandingRent,
      deposit: tenancy.deposit,
      rentPayments: rentPayments.length,
    };
  }

  async generateRentPayments(id: string): Promise<RentPayment[]> {
    const tenancy = await this.findTenancyById(id);
    const payments: RentPayment[] = [];
    
    const startDate = new Date(tenancy.startDate);
    const endDate = new Date(tenancy.endDate);
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dueDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), tenancy.rentDueDay || 1);
      
      const payment = this.rentPaymentRepository.create({
        tenancyId: id,
        tenantId: tenancy.tenantId,
        amount: tenancy.monthlyRent,
        amountPaid: 0,
        dueDate,
        status: PaymentStatus.PENDING,
        paymentMethod: null,
        description: `Monthly rent for ${currentDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}`,
      });
      
      payments.push(await this.rentPaymentRepository.save(payment));
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    return payments;
  }

  // Rent Payment CRUD operations
  async createRentPayment(createRentPaymentDto: CreateRentPaymentDto): Promise<RentPayment> {
    const rentPayment = this.rentPaymentRepository.create({
      tenancyId: createRentPaymentDto.tenancyId,
      amount: createRentPaymentDto.amount,
      dueDate: new Date(createRentPaymentDto.dueDate),
      paidDate: createRentPaymentDto.paymentDate ? new Date(createRentPaymentDto.paymentDate) : null,
      paymentMethod: createRentPaymentDto.paymentMethod,
      status: createRentPaymentDto.status || PaymentStatus.PENDING,
      paymentReference: createRentPaymentDto.reference,
      lateFee: createRentPaymentDto.lateFee || 0,
      notes: createRentPaymentDto.notes,
      transactionReference: createRentPaymentDto.transactionId,
      amountPaid: 0,
    });
    return this.rentPaymentRepository.save(rentPayment);
  }

  async findAllRentPayments(): Promise<RentPayment[]> {
    return this.rentPaymentRepository.find({
      relations: ['tenancy', 'paidBy'],
      order: { dueDate: 'DESC' },
    });
  }

  async findRentPaymentById(id: string): Promise<RentPayment> {
    const rentPayment = await this.rentPaymentRepository.findOne({
      where: { id },
      relations: ['tenancy', 'paidBy'],
    });

    if (!rentPayment) {
      throw new NotFoundException('Rent payment not found');
    }

    return rentPayment;
  }

  async updateRentPayment(id: string, updateRentPaymentDto: UpdateRentPaymentDto): Promise<RentPayment> {
    const updateData: any = {};
    
    // Map DTO fields to entity fields
    if (updateRentPaymentDto.tenancyId) {
      updateData.tenancyId = updateRentPaymentDto.tenancyId;
    }
    if (updateRentPaymentDto.amount !== undefined) {
      updateData.amount = updateRentPaymentDto.amount;
    }
    if (updateRentPaymentDto.dueDate) {
      updateData.dueDate = new Date(updateRentPaymentDto.dueDate);
    }
    if (updateRentPaymentDto.paymentDate) {
      updateData.paidDate = new Date(updateRentPaymentDto.paymentDate);
    }
    if (updateRentPaymentDto.paymentMethod) {
      updateData.paymentMethod = updateRentPaymentDto.paymentMethod;
    }
    if (updateRentPaymentDto.status) {
      updateData.status = updateRentPaymentDto.status;
    }
    if (updateRentPaymentDto.reference) {
      updateData.paymentReference = updateRentPaymentDto.reference;
    }
    if (updateRentPaymentDto.lateFee !== undefined) {
      updateData.lateFee = updateRentPaymentDto.lateFee;
    }
    if (updateRentPaymentDto.notes) {
      updateData.notes = updateRentPaymentDto.notes;
    }
    if (updateRentPaymentDto.transactionId) {
      updateData.transactionReference = updateRentPaymentDto.transactionId;
    }

    await this.rentPaymentRepository.update(id, updateData);
    return this.findRentPaymentById(id);
  }

  async removeRentPayment(id: string): Promise<void> {
    const result = await this.rentPaymentRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Rent payment not found');
    }
  }

  async findRentPaymentsByTenancy(tenancyId: string): Promise<RentPayment[]> {
    return this.rentPaymentRepository.find({
      where: { tenancyId },
      relations: ['paidBy'],
      order: { dueDate: 'DESC' },
    });
  }

  async findOverduePayments(): Promise<RentPayment[]> {
    const now = new Date();
    return this.rentPaymentRepository.find({
      where: {
        dueDate: LessThanOrEqual(now),
        status: PaymentStatus.PENDING,
      },
      relations: ['tenancy', 'paidBy'],
      order: { dueDate: 'ASC' },
    });
  }

  // Lease Agreement CRUD operations
  async createLeaseAgreement(createLeaseAgreementDto: CreateLeaseAgreementDto): Promise<LeaseAgreement> {
    const leaseAgreement = this.leaseAgreementRepository.create({
      tenancyId: createLeaseAgreementDto.tenancyId,
      agreementNumber: `LA-${Date.now()}`,
      type: createLeaseAgreementDto.agreementType,
      status: createLeaseAgreementDto.status || AgreementStatus.DRAFT,
      terms: createLeaseAgreementDto.content,
      documentUrl: createLeaseAgreementDto.documentUrl,
      version: parseInt(createLeaseAgreementDto.version) || 1,
      notes: createLeaseAgreementDto.notes,
      // Set default dates - these should be provided by frontend or set appropriately
      startDate: new Date(),
      endDate: createLeaseAgreementDto.expiryDate ? new Date(createLeaseAgreementDto.expiryDate) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      rentAmount: 0, // Should be provided by frontend
      depositAmount: 0, // Should be provided by frontend
    });
    return this.leaseAgreementRepository.save(leaseAgreement);
  }

  async findAllLeaseAgreements(): Promise<LeaseAgreement[]> {
    return this.leaseAgreementRepository.find({
      relations: ['tenancy'],
      order: { createdAt: 'DESC' },
    });
  }

  async findLeaseAgreementById(id: string): Promise<LeaseAgreement> {
    const leaseAgreement = await this.leaseAgreementRepository.findOne({
      where: { id },
      relations: ['tenancy'],
    });

    if (!leaseAgreement) {
      throw new NotFoundException('Lease agreement not found');
    }

    return leaseAgreement;
  }

  async updateLeaseAgreement(id: string, updateLeaseAgreementDto: UpdateLeaseAgreementDto): Promise<LeaseAgreement> {
    const updateData: any = {};
    
    // Map DTO fields to entity fields
    if (updateLeaseAgreementDto.tenancyId) {
      updateData.tenancyId = updateLeaseAgreementDto.tenancyId;
    }
    if (updateLeaseAgreementDto.agreementType) {
      updateData.type = updateLeaseAgreementDto.agreementType;
    }
    if (updateLeaseAgreementDto.content) {
      updateData.terms = updateLeaseAgreementDto.content;
    }
    if (updateLeaseAgreementDto.documentUrl) {
      updateData.documentUrl = updateLeaseAgreementDto.documentUrl;
    }
    if (updateLeaseAgreementDto.version) {
      updateData.version = parseInt(updateLeaseAgreementDto.version);
    }
    if (updateLeaseAgreementDto.status) {
      updateData.status = updateLeaseAgreementDto.status;
    }
    if (updateLeaseAgreementDto.notes) {
      updateData.notes = updateLeaseAgreementDto.notes;
    }
    if (updateLeaseAgreementDto.expiryDate) {
      updateData.endDate = new Date(updateLeaseAgreementDto.expiryDate);
    }
    if (updateLeaseAgreementDto.signedDate) {
      updateData.tenantSignedDate = new Date(updateLeaseAgreementDto.signedDate);
      updateData.landlordSignedDate = new Date(updateLeaseAgreementDto.signedDate);
    }

    await this.leaseAgreementRepository.update(id, updateData);
    return this.findLeaseAgreementById(id);
  }

  async removeLeaseAgreement(id: string): Promise<void> {
    const result = await this.leaseAgreementRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Lease agreement not found');
    }
  }

  async findLeaseAgreementsByTenancy(tenancyId: string): Promise<LeaseAgreement[]> {
    return this.leaseAgreementRepository.find({
      where: { tenancyId },
      order: { createdAt: 'DESC' },
    });
  }

  async findActiveLeaseAgreements(): Promise<LeaseAgreement[]> {
    const now = new Date();
    return this.leaseAgreementRepository.find({
      where: {
        status: AgreementStatus.ACTIVE,
        endDate: MoreThanOrEqual(now),
      },
      relations: ['tenancy'],
      order: { createdAt: 'DESC' },
    });
  }
}