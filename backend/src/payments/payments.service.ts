import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentStatus, PaymentType } from './entities/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
  ) {}

  async create(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    const payment = this.paymentRepository.create({
      ...createPaymentDto,
      paymentReference: this.generatePaymentReference(),
      netAmount: createPaymentDto.amount - (createPaymentDto.feeAmount || 0),
    });
    return this.paymentRepository.save(payment);
  }

  async findAll(filters?: any): Promise<Payment[]> {
    const queryBuilder = this.paymentRepository.createQueryBuilder('payment')
      .leftJoinAndSelect('payment.payer', 'payer')
      .leftJoinAndSelect('payment.payee', 'payee')
      .leftJoinAndSelect('payment.property', 'property')
      .leftJoinAndSelect('payment.tenant', 'tenant');

    if (filters?.payerId) {
      queryBuilder.andWhere('payment.payerId = :payerId', { payerId: filters.payerId });
    }

    if (filters?.payeeId) {
      queryBuilder.andWhere('payment.payeeId = :payeeId', { payeeId: filters.payeeId });
    }

    if (filters?.propertyId) {
      queryBuilder.andWhere('payment.propertyId = :propertyId', { propertyId: filters.propertyId });
    }

    if (filters?.status) {
      queryBuilder.andWhere('payment.status = :status', { status: filters.status });
    }

    if (filters?.type) {
      queryBuilder.andWhere('payment.type = :type', { type: filters.type });
    }

    if (filters?.dateFrom) {
      queryBuilder.andWhere('payment.createdAt >= :dateFrom', { dateFrom: filters.dateFrom });
    }

    if (filters?.dateTo) {
      queryBuilder.andWhere('payment.createdAt <= :dateTo', { dateTo: filters.dateTo });
    }

    return queryBuilder
      .orderBy('payment.createdAt', 'DESC')
      .getMany();
  }

  async findOne(id: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id },
      relations: ['payer', 'payee', 'property', 'tenant'],
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    return payment;
  }

  async findByReference(reference: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { paymentReference: reference },
      relations: ['payer', 'payee', 'property', 'tenant'],
    });

    if (!payment) {
      throw new NotFoundException(`Payment with reference ${reference} not found`);
    }

    return payment;
  }

  async update(id: string, updatePaymentDto: UpdatePaymentDto): Promise<Payment> {
    const payment = await this.findOne(id);
    
    // Recalculate net amount if amount or fee changes
    if (updatePaymentDto.amount !== undefined || updatePaymentDto.feeAmount !== undefined) {
      const amount = updatePaymentDto.amount ?? payment.amount;
      const feeAmount = updatePaymentDto.feeAmount ?? payment.feeAmount;
      updatePaymentDto.netAmount = amount - feeAmount;
    }

    Object.assign(payment, updatePaymentDto);
    return this.paymentRepository.save(payment);
  }

  async updateStatus(id: string, status: PaymentStatus, metadata?: any): Promise<Payment> {
    const payment = await this.findOne(id);
    payment.status = status;
    
    if (metadata) {
      payment.metadata = { ...payment.metadata, ...metadata };
    }

    if (status === PaymentStatus.COMPLETED && !payment.paidDate) {
      payment.paidDate = new Date();
      payment.processedDate = new Date();
    }

    return this.paymentRepository.save(payment);
  }

  async processRefund(id: string, refundAmount: number, reason?: string): Promise<Payment> {
    const payment = await this.findOne(id);
    
    if (payment.status !== PaymentStatus.COMPLETED) {
      throw new Error('Can only refund completed payments');
    }

    if (refundAmount > payment.amount - payment.refundedAmount) {
      throw new Error('Refund amount exceeds available amount');
    }

    payment.refundedAmount += refundAmount;
    payment.refundedDate = new Date();
    payment.refundReason = reason;
    
    if (payment.refundedAmount >= payment.amount) {
      payment.status = PaymentStatus.REFUNDED;
    } else {
      payment.status = PaymentStatus.PARTIALLY_REFUNDED;
    }

    return this.paymentRepository.save(payment);
  }

  async getPaymentSummary(filters?: any): Promise<any> {
    const queryBuilder = this.paymentRepository.createQueryBuilder('payment');

    if (filters?.payerId) {
      queryBuilder.andWhere('payment.payerId = :payerId', { payerId: filters.payerId });
    }

    if (filters?.payeeId) {
      queryBuilder.andWhere('payment.payeeId = :payeeId', { payeeId: filters.payeeId });
    }

    if (filters?.propertyId) {
      queryBuilder.andWhere('payment.propertyId = :propertyId', { propertyId: filters.propertyId });
    }

    if (filters?.dateFrom) {
      queryBuilder.andWhere('payment.createdAt >= :dateFrom', { dateFrom: filters.dateFrom });
    }

    if (filters?.dateTo) {
      queryBuilder.andWhere('payment.createdAt <= :dateTo', { dateTo: filters.dateTo });
    }

    const result = await queryBuilder
      .select([
        'COUNT(*) as totalPayments',
        'SUM(CASE WHEN status = \'completed\' THEN amount ELSE 0 END) as totalCompleted',
        'SUM(CASE WHEN status = \'pending\' THEN amount ELSE 0 END) as totalPending',
        'SUM(CASE WHEN status = \'failed\' THEN amount ELSE 0 END) as totalFailed',
        'SUM(CASE WHEN type = \'rent\' AND status = \'completed\' THEN amount ELSE 0 END) as totalRent',
        'SUM(CASE WHEN type = \'deposit\' AND status = \'completed\' THEN amount ELSE 0 END) as totalDeposits',
        'AVG(CASE WHEN status = \'completed\' THEN amount END) as averagePayment',
      ])
      .getRawOne();

    return {
      totalPayments: parseInt(result.totalPayments),
      totalCompleted: parseFloat(result.totalCompleted) || 0,
      totalPending: parseFloat(result.totalPending) || 0,
      totalFailed: parseFloat(result.totalFailed) || 0,
      totalRent: parseFloat(result.totalRent) || 0,
      totalDeposits: parseFloat(result.totalDeposits) || 0,
      averagePayment: parseFloat(result.averagePayment) || 0,
    };
  }

  async remove(id: string): Promise<void> {
    const payment = await this.findOne(id);
    await this.paymentRepository.remove(payment);
  }

  private generatePaymentReference(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `PAY-${timestamp}-${random}`;
  }
}