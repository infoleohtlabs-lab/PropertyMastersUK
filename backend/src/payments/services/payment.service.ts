import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, Between, In } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { Payment, PaymentStatus, PaymentType, PaymentMethod, PaymentFrequency, RefundStatus } from '../entities/payment.entity';

// DTOs
export interface CreatePaymentDto {
  payerId?: string;
  recipientId?: string;
  propertyId?: string;
  bookingId?: string;
  tenancyId?: string;
  maintenanceRequestId?: string;
  title: string;
  description?: string;
  type: PaymentType;
  amount: number;
  currency?: string;
  paymentMethod: PaymentMethod;
  frequency?: PaymentFrequency;
  dueDate?: Date;
  isRecurring?: boolean;
  nextPaymentDate?: Date;
  recurringEndDate?: Date;
  remainingPayments?: number;
  billingName?: string;
  billingEmail?: string;
  billingPhone?: string;
  billingAddress?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  paymentInstructions?: string;
  customerNotes?: string;
  metadata?: Record<string, any>;
  customFields?: Record<string, any>;
  tags?: string[];
}

export interface UpdatePaymentDto {
  title?: string;
  description?: string;
  amount?: number;
  dueDate?: Date;
  paymentInstructions?: string;
  customerNotes?: string;
  internalNotes?: string;
  metadata?: Record<string, any>;
  customFields?: Record<string, any>;
  tags?: string[];
}

export interface PaymentFilters {
  payerId?: string;
  recipientId?: string;
  propertyId?: string;
  bookingId?: string;
  tenancyId?: string;
  maintenanceRequestId?: string;
  type?: PaymentType;
  status?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  frequency?: PaymentFrequency;
  refundStatus?: RefundStatus;
  startDate?: Date;
  endDate?: Date;
  dueDateStart?: Date;
  dueDateEnd?: Date;
  minAmount?: number;
  maxAmount?: number;
  currency?: string;
  isRecurring?: boolean;
  isTest?: boolean;
  isManual?: boolean;
  requiresReview?: boolean;
  billingEmail?: string;
  search?: string;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaymentDashboardStats {
  totalPayments: number;
  totalAmount: number;
  pendingPayments: number;
  pendingAmount: number;
  completedPayments: number;
  completedAmount: number;
  failedPayments: number;
  failedAmount: number;
  refundedPayments: number;
  refundedAmount: number;
  averagePaymentAmount: number;
  paymentsByType: Record<PaymentType, { count: number; amount: number }>;
  paymentsByMethod: Record<PaymentMethod, { count: number; amount: number }>;
  paymentsByStatus: Record<PaymentStatus, { count: number; amount: number }>;
  monthlyTrends: {
    month: string;
    totalPayments: number;
    totalAmount: number;
    completedPayments: number;
    completedAmount: number;
  }[];
  topProperties: {
    propertyId: string;
    propertyName: string;
    totalPayments: number;
    totalAmount: number;
  }[];
  recentPayments: Payment[];
}

export interface StripePaymentIntentDto {
  amount: number;
  currency: string;
  paymentMethodTypes?: string[];
  customerId?: string;
  paymentMethodId?: string;
  description?: string;
  metadata?: Record<string, any>;
  automaticPaymentMethods?: {
    enabled: boolean;
  };
}

export interface ProcessPaymentDto {
  paymentId: string;
  paymentMethodId?: string;
  stripePaymentIntentId?: string;
  confirmPayment?: boolean;
}

export interface RefundPaymentDto {
  paymentId: string;
  amount?: number;
  reason?: string;
  refundApplicationFee?: boolean;
  reverseTransfer?: boolean;
}

@Injectable()
export class PaymentService {
  private stripe: Stripe;

  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    private configService: ConfigService,
  ) {
    const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (stripeSecretKey) {
      this.stripe = new Stripe(stripeSecretKey, {
        apiVersion: '2023-10-16',
      });
    }
  }

  // Payment Management
  async createPayment(createPaymentDto: CreatePaymentDto, createdBy: string): Promise<Payment> {
    const reference = await this.generatePaymentReference();

    const payment = this.paymentRepository.create({
      ...createPaymentDto,
      reference,
      status: PaymentStatus.PENDING,
      currency: createPaymentDto.currency || 'GBP',
      createdBy,
    });

    const savedPayment = await this.paymentRepository.save(payment);

    // Create Stripe payment intent if using card payment
    if (createPaymentDto.paymentMethod === PaymentMethod.CARD && this.stripe) {
      try {
        const paymentIntent = await this.createStripePaymentIntent({
          amount: createPaymentDto.amount,
          currency: createPaymentDto.currency || 'GBP',
          description: `${createPaymentDto.title} - ${reference}`,
          metadata: {
            paymentId: savedPayment.id,
      
            ...createPaymentDto.metadata,
          },
        });

        savedPayment.stripePaymentIntentId = paymentIntent.id;
        savedPayment.status = PaymentStatus.PROCESSING;
        await this.paymentRepository.save(savedPayment);
      } catch (error) {
        console.error('Failed to create Stripe payment intent:', error);
        // Continue without Stripe integration
      }
    }

    return savedPayment;
  }

  async findPaymentById(id: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id },
      relations: [

        'payer',
        'recipient',
        'property',
        'booking',
        'tenancy',
        'maintenanceRequest',
        'parentPayment',
        'childPayments',
      ],
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    return payment;
  }

  async findPayments(
    filters: PaymentFilters,
    pagination: PaginationOptions = {},
  ): Promise<{
    payments: Payment[];
    total: number;
    page: number;
    limit: number;
  }> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = pagination;

    const queryBuilder = this.paymentRepository.createQueryBuilder('payment')
      .leftJoinAndSelect('payment.payer', 'payer')
      .leftJoinAndSelect('payment.recipient', 'recipient')
      .leftJoinAndSelect('payment.property', 'property')
      .leftJoinAndSelect('payment.booking', 'booking')
      .leftJoinAndSelect('payment.tenancy', 'tenancy')
      .leftJoinAndSelect('payment.maintenanceRequest', 'maintenanceRequest');

    // Apply filters
    if (filters.payerId) {
      queryBuilder.andWhere('payment.payerId = :payerId', { payerId: filters.payerId });
    }

    if (filters.recipientId) {
      queryBuilder.andWhere('payment.recipientId = :recipientId', { recipientId: filters.recipientId });
    }

    if (filters.propertyId) {
      queryBuilder.andWhere('payment.propertyId = :propertyId', { propertyId: filters.propertyId });
    }

    if (filters.bookingId) {
      queryBuilder.andWhere('payment.bookingId = :bookingId', { bookingId: filters.bookingId });
    }

    if (filters.tenancyId) {
      queryBuilder.andWhere('payment.tenancyId = :tenancyId', { tenancyId: filters.tenancyId });
    }

    if (filters.maintenanceRequestId) {
      queryBuilder.andWhere('payment.maintenanceRequestId = :maintenanceRequestId', {
        maintenanceRequestId: filters.maintenanceRequestId,
      });
    }

    if (filters.type) {
      queryBuilder.andWhere('payment.type = :type', { type: filters.type });
    }

    if (filters.status) {
      queryBuilder.andWhere('payment.status = :status', { status: filters.status });
    }

    if (filters.paymentMethod) {
      queryBuilder.andWhere('payment.paymentMethod = :paymentMethod', {
        paymentMethod: filters.paymentMethod,
      });
    }

    if (filters.frequency) {
      queryBuilder.andWhere('payment.frequency = :frequency', { frequency: filters.frequency });
    }

    if (filters.refundStatus) {
      queryBuilder.andWhere('payment.refundStatus = :refundStatus', {
        refundStatus: filters.refundStatus,
      });
    }

    if (filters.startDate && filters.endDate) {
      queryBuilder.andWhere('payment.createdAt BETWEEN :startDate AND :endDate', {
        startDate: filters.startDate,
        endDate: filters.endDate,
      });
    }

    if (filters.dueDateStart && filters.dueDateEnd) {
      queryBuilder.andWhere('payment.dueDate BETWEEN :dueDateStart AND :dueDateEnd', {
        dueDateStart: filters.dueDateStart,
        dueDateEnd: filters.dueDateEnd,
      });
    }

    if (filters.minAmount !== undefined) {
      queryBuilder.andWhere('payment.amount >= :minAmount', { minAmount: filters.minAmount });
    }

    if (filters.maxAmount !== undefined) {
      queryBuilder.andWhere('payment.amount <= :maxAmount', { maxAmount: filters.maxAmount });
    }

    if (filters.currency) {
      queryBuilder.andWhere('payment.currency = :currency', { currency: filters.currency });
    }

    if (filters.isRecurring !== undefined) {
      queryBuilder.andWhere('payment.isRecurring = :isRecurring', {
        isRecurring: filters.isRecurring,
      });
    }

    if (filters.isTest !== undefined) {
      queryBuilder.andWhere('payment.isTest = :isTest', { isTest: filters.isTest });
    }

    if (filters.isManual !== undefined) {
      queryBuilder.andWhere('payment.isManual = :isManual', { isManual: filters.isManual });
    }

    if (filters.requiresReview !== undefined) {
      queryBuilder.andWhere('payment.requiresReview = :requiresReview', {
        requiresReview: filters.requiresReview,
      });
    }

    if (filters.billingEmail) {
      queryBuilder.andWhere('payment.billingEmail ILIKE :billingEmail', {
        billingEmail: `%${filters.billingEmail}%`,
      });
    }

    if (filters.search) {
      queryBuilder.andWhere(
        '(payment.title ILIKE :search OR payment.description ILIKE :search OR payment.reference ILIKE :search OR payment.billingName ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    // Apply sorting
    queryBuilder.orderBy(`payment.${sortBy}`, sortOrder);

    // Apply pagination
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    const [payments, total] = await queryBuilder.getManyAndCount();

    return {
      payments,
      total,
      page,
      limit,
    };
  }

  async updatePayment(
    id: string,
    updatePaymentDto: UpdatePaymentDto,
    updatedBy: string,
  ): Promise<Payment> {
    const payment = await this.findPaymentById(id);

    // Prevent updates to completed or failed payments
    if ([PaymentStatus.COMPLETED, PaymentStatus.FAILED, PaymentStatus.REFUNDED].includes(payment.status)) {
      throw new BadRequestException('Cannot update completed, failed, or refunded payments');
    }

    Object.assign(payment, updatePaymentDto, { updatedBy });
    return this.paymentRepository.save(payment);
  }

  async deletePayment(id: string, deletedBy: string): Promise<void> {
    const payment = await this.findPaymentById(id);

    // Prevent deletion of completed payments
    if (payment.status === PaymentStatus.COMPLETED) {
      throw new BadRequestException('Cannot delete completed payments');
    }

    // Cancel Stripe payment intent if exists
    if (payment.stripePaymentIntentId && this.stripe) {
      try {
        await this.stripe.paymentIntents.cancel(payment.stripePaymentIntentId);
      } catch (error) {
        console.error('Failed to cancel Stripe payment intent:', error);
      }
    }

    payment.deletedAt = new Date();
    payment.updatedBy = deletedBy;
    await this.paymentRepository.save(payment);
  }

  // Stripe Integration
  async createStripePaymentIntent(data: StripePaymentIntentDto): Promise<Stripe.PaymentIntent> {
    if (!this.stripe) {
      throw new BadRequestException('Stripe is not configured');
    }

    return this.stripe.paymentIntents.create({
      amount: data.amount,
      currency: data.currency.toLowerCase(),
      payment_method_types: data.paymentMethodTypes || ['card'],
      customer: data.customerId,
      payment_method: data.paymentMethodId,
      description: data.description,
      metadata: data.metadata || {},
      automatic_payment_methods: data.automaticPaymentMethods,
    });
  }

  async processPayment(data: ProcessPaymentDto, processedBy: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id: data.paymentId },
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${data.paymentId} not found`);
    }

    if (payment.status !== PaymentStatus.PENDING && payment.status !== PaymentStatus.PROCESSING) {
      throw new BadRequestException('Payment is not in a processable state');
    }

    try {
      if (data.stripePaymentIntentId && this.stripe) {
        // Confirm Stripe payment intent
        const paymentIntent = await this.stripe.paymentIntents.retrieve(data.stripePaymentIntentId);
        
        if (data.confirmPayment && paymentIntent.status === 'requires_confirmation') {
          await this.stripe.paymentIntents.confirm(data.stripePaymentIntentId, {
            payment_method: data.paymentMethodId,
          });
        }

        // Update payment with Stripe data
        payment.stripePaymentIntentId = paymentIntent.id;
        payment.stripeChargeId = paymentIntent.latest_charge as string;
        payment.gatewayResponse = paymentIntent;
        
        if (paymentIntent.status === 'succeeded') {
          payment.status = PaymentStatus.COMPLETED;
          payment.processedAt = new Date();
          payment.capturedAt = new Date();
        } else if (paymentIntent.status === 'requires_payment_method') {
          payment.status = PaymentStatus.FAILED;
          payment.failedAt = new Date();
          payment.failureReason = 'Payment method required';
        }
      } else {
        // Manual payment processing
        payment.status = PaymentStatus.COMPLETED;
        payment.processedAt = new Date();
        payment.isManual = true;
      }

      payment.updatedBy = processedBy;
      return this.paymentRepository.save(payment);
    } catch (error) {
      payment.status = PaymentStatus.FAILED;
      payment.failedAt = new Date();
      payment.failureReason = error.message;
      payment.updatedBy = processedBy;
      await this.paymentRepository.save(payment);
      throw error;
    }
  }

  async refundPayment(data: RefundPaymentDto, refundedBy: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id: data.paymentId },
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${data.paymentId} not found`);
    }

    if (payment.status !== PaymentStatus.COMPLETED) {
      throw new BadRequestException('Only completed payments can be refunded');
    }

    const refundAmount = data.amount || payment.amount;
    
    if (refundAmount > payment.amount) {
      throw new BadRequestException('Refund amount cannot exceed payment amount');
    }

    try {
      if (payment.stripeChargeId && this.stripe) {
        // Create Stripe refund
        const refund = await this.stripe.refunds.create({
          charge: payment.stripeChargeId,
          amount: refundAmount,
          reason: data.reason as any,
          refund_application_fee: data.refundApplicationFee,
          reverse_transfer: data.reverseTransfer,
          metadata: {
            paymentId: payment.id,
            refundedBy,
          },
        });

        payment.gatewayResponse = { ...payment.gatewayResponse, refund };
      }

      // Update payment refund status
      const currentRefundedAmount = payment.refundedAmount || 0;
      const newRefundedAmount = currentRefundedAmount + refundAmount;
      
      payment.refundedAmount = newRefundedAmount;
      payment.refundReason = data.reason;
      payment.refundedAt = new Date();
      
      if (newRefundedAmount >= payment.amount) {
        payment.refundStatus = RefundStatus.FULL_REFUND;
        payment.status = PaymentStatus.REFUNDED;
      } else {
        payment.refundStatus = RefundStatus.PARTIAL_REFUND;
        payment.status = PaymentStatus.PARTIALLY_REFUNDED;
      }

      payment.updatedBy = refundedBy;
      return this.paymentRepository.save(payment);
    } catch (error) {
      payment.refundStatus = RefundStatus.REFUND_FAILED;
      payment.updatedBy = refundedBy;
      await this.paymentRepository.save(payment);
      throw error;
    }
  }

  // Dashboard and Analytics
  async getPaymentDashboardStats(): Promise<PaymentDashboardStats> {
    const baseQuery = this.paymentRepository.createQueryBuilder('payment');

    // Basic stats
    const totalPayments = await baseQuery.getCount();
    const totalAmountResult = await baseQuery
      .select('SUM(payment.amount)', 'total')
      .getRawOne();
    const totalAmount = parseInt(totalAmountResult?.total || '0');

    // Status-based stats
    const pendingPayments = await baseQuery.clone()
      .andWhere('payment.status = :status', { status: PaymentStatus.PENDING })
      .getCount();
    
    const pendingAmountResult = await baseQuery.clone()
      .andWhere('payment.status = :status', { status: PaymentStatus.PENDING })
      .select('SUM(payment.amount)', 'total')
      .getRawOne();
    const pendingAmount = parseInt(pendingAmountResult?.total || '0');

    const completedPayments = await baseQuery.clone()
      .andWhere('payment.status = :status', { status: PaymentStatus.COMPLETED })
      .getCount();
    
    const completedAmountResult = await baseQuery.clone()
      .andWhere('payment.status = :status', { status: PaymentStatus.COMPLETED })
      .select('SUM(payment.amount)', 'total')
      .getRawOne();
    const completedAmount = parseInt(completedAmountResult?.total || '0');

    const failedPayments = await baseQuery.clone()
      .andWhere('payment.status = :status', { status: PaymentStatus.FAILED })
      .getCount();
    
    const failedAmountResult = await baseQuery.clone()
      .andWhere('payment.status = :status', { status: PaymentStatus.FAILED })
      .select('SUM(payment.amount)', 'total')
      .getRawOne();
    const failedAmount = parseInt(failedAmountResult?.total || '0');

    const refundedPayments = await baseQuery.clone()
      .andWhere('payment.status IN (:...statuses)', {
        statuses: [PaymentStatus.REFUNDED, PaymentStatus.PARTIALLY_REFUNDED],
      })
      .getCount();
    
    const refundedAmountResult = await baseQuery.clone()
      .andWhere('payment.refundedAmount IS NOT NULL')
      .select('SUM(payment.refundedAmount)', 'total')
      .getRawOne();
    const refundedAmount = parseInt(refundedAmountResult?.total || '0');

    const averagePaymentAmount = totalPayments > 0 ? Math.round(totalAmount / totalPayments) : 0;

    // Payments by type
    const paymentsByTypeResult = await baseQuery.clone()
      .select(['payment.type', 'COUNT(*) as count', 'SUM(payment.amount) as amount'])
      .groupBy('payment.type')
      .getRawMany();
    
    const paymentsByType = Object.values(PaymentType).reduce((acc, type) => {
      const result = paymentsByTypeResult.find(r => r.payment_type === type);
      acc[type] = {
        count: parseInt(result?.count || '0'),
        amount: parseInt(result?.amount || '0'),
      };
      return acc;
    }, {} as Record<PaymentType, { count: number; amount: number }>);

    // Payments by method
    const paymentsByMethodResult = await baseQuery.clone()
      .select(['payment.paymentMethod', 'COUNT(*) as count', 'SUM(payment.amount) as amount'])
      .groupBy('payment.paymentMethod')
      .getRawMany();
    
    const paymentsByMethod = Object.values(PaymentMethod).reduce((acc, method) => {
      const result = paymentsByMethodResult.find(r => r.payment_paymentMethod === method);
      acc[method] = {
        count: parseInt(result?.count || '0'),
        amount: parseInt(result?.amount || '0'),
      };
      return acc;
    }, {} as Record<PaymentMethod, { count: number; amount: number }>);

    // Payments by status
    const paymentsByStatusResult = await baseQuery.clone()
      .select(['payment.status', 'COUNT(*) as count', 'SUM(payment.amount) as amount'])
      .groupBy('payment.status')
      .getRawMany();
    
    const paymentsByStatus = Object.values(PaymentStatus).reduce((acc, status) => {
      const result = paymentsByStatusResult.find(r => r.payment_status === status);
      acc[status] = {
        count: parseInt(result?.count || '0'),
        amount: parseInt(result?.amount || '0'),
      };
      return acc;
    }, {} as Record<PaymentStatus, { count: number; amount: number }>);

    // Monthly trends (last 12 months)
    const monthlyTrends = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const monthlyStats = await baseQuery.clone()
        .andWhere('payment.createdAt BETWEEN :start AND :end', {
          start: startOfMonth,
          end: endOfMonth,
        })
        .select([
          'COUNT(*) as totalPayments',
          'SUM(payment.amount) as totalAmount',
          'COUNT(CASE WHEN payment.status = :completedStatus THEN 1 END) as completedPayments',
          'SUM(CASE WHEN payment.status = :completedStatus THEN payment.amount ELSE 0 END) as completedAmount',
        ])
        .setParameter('completedStatus', PaymentStatus.COMPLETED)
        .getRawOne();
      
      monthlyTrends.push({
        month: date.toISOString().substring(0, 7), // YYYY-MM format
        totalPayments: parseInt(monthlyStats?.totalPayments || '0'),
        totalAmount: parseInt(monthlyStats?.totalAmount || '0'),
        completedPayments: parseInt(monthlyStats?.completedPayments || '0'),
        completedAmount: parseInt(monthlyStats?.completedAmount || '0'),
      });
    }

    // Top properties by payment volume
    const topPropertiesResult = await baseQuery.clone()
      .leftJoin('payment.property', 'property')
      .where('payment.propertyId IS NOT NULL')
      .select([
        'payment.propertyId',
        'property.name as propertyName',
        'COUNT(*) as totalPayments',
        'SUM(payment.amount) as totalAmount',
      ])
      .groupBy('payment.propertyId, property.name')
      .orderBy('SUM(payment.amount)', 'DESC')
      .limit(10)
      .getRawMany();
    
    const topProperties = topPropertiesResult.map(result => ({
      propertyId: result.payment_propertyId,
      propertyName: result.propertyName || 'Unknown Property',
      totalPayments: parseInt(result.totalPayments),
      totalAmount: parseInt(result.totalAmount),
    }));

    // Recent payments
    const recentPayments = await baseQuery.clone()
      .leftJoinAndSelect('payment.payer', 'payer')
      .leftJoinAndSelect('payment.property', 'property')
      .orderBy('payment.createdAt', 'DESC')
      .limit(10)
      .getMany();

    return {
      totalPayments,
      totalAmount,
      pendingPayments,
      pendingAmount,
      completedPayments,
      completedAmount,
      failedPayments,
      failedAmount,
      refundedPayments,
      refundedAmount,
      averagePaymentAmount,
      paymentsByType,
      paymentsByMethod,
      paymentsByStatus,
      monthlyTrends,
      topProperties,
      recentPayments,
    };
  }

  // Helper Methods
  private async generatePaymentReference(): Promise<string> {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `PAY-${timestamp}-${random}`;
  }

  async updatePaymentCounts(): Promise<void> {
    // This method can be used to update cached payment counts
    // Implementation depends on specific caching strategy
  }

  async processRecurringPayments(): Promise<void> {
    const now = new Date();
    
    const recurringPayments = await this.paymentRepository.find({
      where: {
        isRecurring: true,
        status: PaymentStatus.COMPLETED,
        nextPaymentDate: Between(new Date(now.getTime() - 24 * 60 * 60 * 1000), now),
      },
    });

    for (const payment of recurringPayments) {
      try {
        // Create next payment in the series
        const nextPayment = this.paymentRepository.create({
          ...payment,
          id: undefined,
          reference: await this.generatePaymentReference(),
          parentPaymentId: payment.id,
          status: PaymentStatus.PENDING,
          dueDate: payment.nextPaymentDate,
          processedAt: null,
          authorizedAt: null,
          capturedAt: null,
          settledAt: null,
          stripePaymentIntentId: null,
          stripeChargeId: null,
          createdAt: undefined,
          updatedAt: undefined,
        });

        await this.paymentRepository.save(nextPayment);

        // Update parent payment's next payment date
        const nextDate = this.calculateNextPaymentDate(payment.nextPaymentDate, payment.frequency);
        payment.nextPaymentDate = nextDate;
        
        if (payment.remainingPayments) {
          payment.remainingPayments -= 1;
          if (payment.remainingPayments <= 0) {
            payment.isRecurring = false;
            payment.nextPaymentDate = null;
          }
        }

        if (payment.recurringEndDate && nextDate > payment.recurringEndDate) {
          payment.isRecurring = false;
          payment.nextPaymentDate = null;
        }

        await this.paymentRepository.save(payment);
      } catch (error) {
        console.error(`Failed to process recurring payment ${payment.id}:`, error);
      }
    }
  }

  private calculateNextPaymentDate(currentDate: Date, frequency: PaymentFrequency): Date {
    const nextDate = new Date(currentDate);
    
    switch (frequency) {
      case PaymentFrequency.WEEKLY:
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case PaymentFrequency.FORTNIGHTLY:
        nextDate.setDate(nextDate.getDate() + 14);
        break;
      case PaymentFrequency.MONTHLY:
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      case PaymentFrequency.QUARTERLY:
        nextDate.setMonth(nextDate.getMonth() + 3);
        break;
      case PaymentFrequency.ANNUALLY:
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        break;
      default:
        // For one-time payments, don't calculate next date
        break;
    }
    
    return nextDate;
  }
}