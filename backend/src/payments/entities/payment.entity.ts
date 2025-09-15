import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { Property } from '../../properties/entities/property.entity';
import { Booking } from '../../booking/entities/booking.entity';
import { Tenancy } from '../../tenancy/entities/tenancy.entity';
import { MaintenanceRequest } from '../../maintenance/entities/maintenance-request.entity';

export enum PaymentType {
  RENT = 'rent',
  DEPOSIT = 'deposit',
  SECURITY_DEPOSIT = 'security_deposit',
  CLEANING_FEE = 'cleaning_fee',
  DAMAGE_FEE = 'damage_fee',
  LATE_FEE = 'late_fee',
  ADMIN_FEE = 'admin_fee',
  BOOKING_FEE = 'booking_fee',
  MAINTENANCE_FEE = 'maintenance_fee',
  UTILITY_BILL = 'utility_bill',
  SERVICE_CHARGE = 'service_charge',
  GROUND_RENT = 'ground_rent',
  INSURANCE = 'insurance',
  REFUND = 'refund',
  COMPENSATION = 'compensation',
  OTHER = 'other',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded',
  DISPUTED = 'disputed',
  CHARGEBACK = 'chargeback',
  EXPIRED = 'expired',
}

export enum PaymentMethod {
  CARD = 'card',
  BANK_TRANSFER = 'bank_transfer',
  DIRECT_DEBIT = 'direct_debit',
  STANDING_ORDER = 'standing_order',
  CASH = 'cash',
  CHEQUE = 'cheque',
  PAYPAL = 'paypal',
  APPLE_PAY = 'apple_pay',
  GOOGLE_PAY = 'google_pay',
  BACS = 'bacs',
  FASTER_PAYMENTS = 'faster_payments',
  CHAPS = 'chaps',
  OTHER = 'other',
}

export enum PaymentFrequency {
  ONE_TIME = 'one_time',
  WEEKLY = 'weekly',
  FORTNIGHTLY = 'fortnightly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  ANNUALLY = 'annually',
}

export enum PaymentPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
  CRITICAL = 'critical',
}

export enum RefundStatus {
  NOT_REFUNDED = 'not_refunded',
  PARTIAL_REFUND = 'partial_refund',
  FULL_REFUND = 'full_refund',
  REFUND_PENDING = 'refund_pending',
  REFUND_FAILED = 'refund_failed',
}

@Entity('payments')
@Index(['status'])
@Index(['type'])
@Index(['payerId'])
@Index(['propertyId'])
@Index(['dueDate'])
@Index(['createdAt'])
@Index(['stripePaymentIntentId'], { unique: true, where: 'stripe_payment_intent_id IS NOT NULL' })
@Index(['reference'], { unique: true })
export class Payment {
  @ApiProperty({ description: 'Payment ID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Basic Information
  @ApiProperty({ description: 'Payment reference number' })
  @Column({ unique: true })
  reference: string;

  @ApiProperty({ description: 'Payment title' })
  @Column()
  title: string;

  @ApiProperty({ description: 'Payment description', required: false })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({ enum: PaymentType, description: 'Payment type' })
  @Column({ type: 'enum', enum: PaymentType })
  type: PaymentType;

  @ApiProperty({ enum: PaymentStatus, description: 'Payment status' })
  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @ApiProperty({ enum: PaymentPriority, description: 'Payment priority' })
  @Column({ type: 'enum', enum: PaymentPriority, default: PaymentPriority.MEDIUM })
  priority: PaymentPriority;

  // Relationships
  @ApiProperty({ description: 'Payer user ID', required: false })
  @Column('uuid', { nullable: true })
  payerId?: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'payer_id' })
  payer?: User;

  @ApiProperty({ description: 'Recipient user ID', required: false })
  @Column('uuid', { nullable: true })
  recipientId?: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'recipient_id' })
  recipient?: User;

  @ApiProperty({ description: 'Property ID', required: false })
  @Column('uuid', { nullable: true })
  propertyId?: string;

  @ManyToOne(() => Property, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'property_id' })
  property?: Property;

  @ApiProperty({ description: 'Booking ID', required: false })
  @Column('uuid', { nullable: true })
  bookingId?: string;

  @ManyToOne(() => Booking, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'booking_id' })
  booking?: Booking;

  @ApiProperty({ description: 'Tenancy ID', required: false })
  @Column('uuid', { nullable: true })
  tenancyId?: string;

  @ManyToOne(() => Tenancy, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'tenancy_id' })
  tenancy?: Tenancy;

  @ApiProperty({ description: 'Maintenance request ID', required: false })
  @Column('uuid', { nullable: true })
  maintenanceRequestId?: string;

  @ManyToOne(() => MaintenanceRequest, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'maintenance_request_id' })
  maintenanceRequest?: MaintenanceRequest;

  // Financial Details
  @ApiProperty({ description: 'Payment amount in pence/cents' })
  @Column('bigint')
  amount: number;

  @ApiProperty({ description: 'Currency code (ISO 4217)' })
  @Column({ length: 3, default: 'GBP' })
  currency: string;

  @ApiProperty({ description: 'Net amount after fees in pence/cents', required: false })
  @Column('bigint', { nullable: true })
  netAmount?: number;

  @ApiProperty({ description: 'Fee amount in pence/cents', required: false })
  @Column('bigint', { nullable: true })
  feeAmount?: number;

  @ApiProperty({ description: 'Tax amount in pence/cents', required: false })
  @Column('bigint', { nullable: true })
  taxAmount?: number;

  @ApiProperty({ description: 'Tax rate percentage', required: false })
  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  taxRate?: number;

  @ApiProperty({ description: 'Discount amount in pence/cents', required: false })
  @Column('bigint', { nullable: true })
  discountAmount?: number;

  @ApiProperty({ description: 'Discount percentage', required: false })
  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  discountPercentage?: number;

  // Payment Method and Processing
  @ApiProperty({ enum: PaymentMethod, description: 'Payment method' })
  @Column({ type: 'enum', enum: PaymentMethod })
  paymentMethod: PaymentMethod;

  @ApiProperty({ enum: PaymentFrequency, description: 'Payment frequency' })
  @Column({ type: 'enum', enum: PaymentFrequency, default: PaymentFrequency.ONE_TIME })
  frequency: PaymentFrequency;

  @ApiProperty({ description: 'Payment processor (e.g., stripe, paypal)', required: false })
  @Column({ nullable: true })
  processor?: string;

  @ApiProperty({ description: 'External transaction ID', required: false })
  @Column({ nullable: true })
  externalTransactionId?: string;

  @ApiProperty({ description: 'Payment gateway response', required: false })
  @Column({ type: 'jsonb', nullable: true })
  gatewayResponse?: any;

  // Stripe Integration
  @ApiProperty({ description: 'Stripe payment intent ID', required: false })
  @Column({ nullable: true })
  stripePaymentIntentId?: string;

  @ApiProperty({ description: 'Stripe charge ID', required: false })
  @Column({ nullable: true })
  stripeChargeId?: string;

  @ApiProperty({ description: 'Stripe customer ID', required: false })
  @Column({ nullable: true })
  stripeCustomerId?: string;

  @ApiProperty({ description: 'Stripe payment method ID', required: false })
  @Column({ nullable: true })
  stripePaymentMethodId?: string;

  @ApiProperty({ description: 'Stripe invoice ID', required: false })
  @Column({ nullable: true })
  stripeInvoiceId?: string;

  @ApiProperty({ description: 'Stripe subscription ID', required: false })
  @Column({ nullable: true })
  stripeSubscriptionId?: string;

  // Dates and Scheduling
  @ApiProperty({ description: 'Payment due date', required: false })
  @Column({ type: 'timestamp', nullable: true })
  dueDate?: Date;

  @ApiProperty({ description: 'Payment processed date', required: false })
  @Column({ type: 'timestamp', nullable: true })
  processedAt?: Date;

  @ApiProperty({ description: 'Payment authorized date', required: false })
  @Column({ type: 'timestamp', nullable: true })
  authorizedAt?: Date;

  @ApiProperty({ description: 'Payment captured date', required: false })
  @Column({ type: 'timestamp', nullable: true })
  capturedAt?: Date;

  @ApiProperty({ description: 'Payment settled date', required: false })
  @Column({ type: 'timestamp', nullable: true })
  settledAt?: Date;

  @ApiProperty({ description: 'Payment failed date', required: false })
  @Column({ type: 'timestamp', nullable: true })
  failedAt?: Date;

  @ApiProperty({ description: 'Payment cancelled date', required: false })
  @Column({ type: 'timestamp', nullable: true })
  cancelledAt?: Date;

  @ApiProperty({ description: 'Payment expires at', required: false })
  @Column({ type: 'timestamp', nullable: true })
  expiresAt?: Date;

  // Refunds and Disputes
  @ApiProperty({ enum: RefundStatus, description: 'Refund status' })
  @Column({ type: 'enum', enum: RefundStatus, default: RefundStatus.NOT_REFUNDED })
  refundStatus: RefundStatus;

  @ApiProperty({ description: 'Refunded amount in pence/cents', required: false })
  @Column('bigint', { nullable: true })
  refundedAmount?: number;

  @ApiProperty({ description: 'Refund reason', required: false })
  @Column({ type: 'text', nullable: true })
  refundReason?: string;

  @ApiProperty({ description: 'Refund date', required: false })
  @Column({ type: 'timestamp', nullable: true })
  refundedAt?: Date;

  @ApiProperty({ description: 'Dispute status', required: false })
  @Column({ nullable: true })
  disputeStatus?: string;

  @ApiProperty({ description: 'Dispute reason', required: false })
  @Column({ type: 'text', nullable: true })
  disputeReason?: string;

  @ApiProperty({ description: 'Dispute date', required: false })
  @Column({ type: 'timestamp', nullable: true })
  disputedAt?: Date;

  // Recurring Payments
  @ApiProperty({ description: 'Parent payment ID for recurring payments', required: false })
  @Column('uuid', { nullable: true })
  parentPaymentId?: string;

  @ManyToOne(() => Payment, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'parent_payment_id' })
  parentPayment?: Payment;

  @OneToMany(() => Payment, payment => payment.parentPayment)
  childPayments: Payment[];

  @ApiProperty({ description: 'Is recurring payment', required: false })
  @Column({ default: false })
  isRecurring: boolean;

  @ApiProperty({ description: 'Next payment date for recurring payments', required: false })
  @Column({ type: 'timestamp', nullable: true })
  nextPaymentDate?: Date;

  @ApiProperty({ description: 'Recurring payment end date', required: false })
  @Column({ type: 'timestamp', nullable: true })
  recurringEndDate?: Date;

  @ApiProperty({ description: 'Number of recurring payments remaining', required: false })
  @Column({ nullable: true })
  remainingPayments?: number;

  // Notifications and Reminders
  @ApiProperty({ description: 'Send payment reminders', required: false })
  @Column({ default: true })
  sendReminders: boolean;

  @ApiProperty({ description: 'Reminder sent dates', required: false })
  @Column({ type: 'jsonb', nullable: true })
  remindersSent?: Date[];

  @ApiProperty({ description: 'Last reminder sent date', required: false })
  @Column({ type: 'timestamp', nullable: true })
  lastReminderSent?: Date;

  @ApiProperty({ description: 'Payment confirmation sent', required: false })
  @Column({ default: false })
  confirmationSent: boolean;

  @ApiProperty({ description: 'Receipt sent', required: false })
  @Column({ default: false })
  receiptSent: boolean;

  // Contact and Billing Information
  @ApiProperty({ description: 'Billing name', required: false })
  @Column({ nullable: true })
  billingName?: string;

  @ApiProperty({ description: 'Billing email', required: false })
  @Column({ nullable: true })
  billingEmail?: string;

  @ApiProperty({ description: 'Billing phone', required: false })
  @Column({ nullable: true })
  billingPhone?: string;

  @ApiProperty({ description: 'Billing address', required: false })
  @Column({ type: 'jsonb', nullable: true })
  billingAddress?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };

  // Payment Instructions and Notes
  @ApiProperty({ description: 'Payment instructions', required: false })
  @Column({ type: 'text', nullable: true })
  paymentInstructions?: string;

  @ApiProperty({ description: 'Internal notes', required: false })
  @Column({ type: 'text', nullable: true })
  internalNotes?: string;

  @ApiProperty({ description: 'Customer notes', required: false })
  @Column({ type: 'text', nullable: true })
  customerNotes?: string;

  @ApiProperty({ description: 'Failure reason', required: false })
  @Column({ type: 'text', nullable: true })
  failureReason?: string;

  @ApiProperty({ description: 'Cancellation reason', required: false })
  @Column({ type: 'text', nullable: true })
  cancellationReason?: string;

  // Documents and Attachments
  @ApiProperty({ description: 'Receipt URL', required: false })
  @Column({ nullable: true })
  receiptUrl?: string;

  @ApiProperty({ description: 'Invoice URL', required: false })
  @Column({ nullable: true })
  invoiceUrl?: string;

  @ApiProperty({ description: 'Attachment URLs', required: false })
  @Column({ type: 'jsonb', nullable: true })
  attachmentUrls?: string[];

  @ApiProperty({ description: 'Document references', required: false })
  @Column({ type: 'jsonb', nullable: true })
  documentReferences?: {
    invoiceNumber?: string;
    receiptNumber?: string;
    referenceNumber?: string;
    purchaseOrderNumber?: string;
  };

  // Compliance and Audit
  @ApiProperty({ description: 'Requires manual review', required: false })
  @Column({ default: false })
  requiresReview: boolean;

  @ApiProperty({ description: 'Reviewed by user ID', required: false })
  @Column('uuid', { nullable: true })
  reviewedBy?: string;

  @ApiProperty({ description: 'Review date', required: false })
  @Column({ type: 'timestamp', nullable: true })
  reviewedAt?: Date;

  @ApiProperty({ description: 'Review notes', required: false })
  @Column({ type: 'text', nullable: true })
  reviewNotes?: string;

  @ApiProperty({ description: 'Compliance flags', required: false })
  @Column({ type: 'jsonb', nullable: true })
  complianceFlags?: {
    amlCheck?: boolean;
    fraudCheck?: boolean;
    sanctionsCheck?: boolean;
    pciCompliant?: boolean;
  };

  // Integration and External References
  @ApiProperty({ description: 'External system references', required: false })
  @Column({ type: 'jsonb', nullable: true })
  externalReferences?: {
    accountingSystemId?: string;
    bankTransactionId?: string;
    payrollSystemId?: string;
    crmSystemId?: string;
  };

  @ApiProperty({ description: 'Webhook URLs for notifications', required: false })
  @Column({ type: 'jsonb', nullable: true })
  webhookUrls?: string[];

  @ApiProperty({ description: 'API callback URL', required: false })
  @Column({ nullable: true })
  callbackUrl?: string;

  // Flags and Settings
  @ApiProperty({ description: 'Is test payment', required: false })
  @Column({ default: false })
  isTest: boolean;

  @ApiProperty({ description: 'Is manual payment', required: false })
  @Column({ default: false })
  isManual: boolean;

  @ApiProperty({ description: 'Is partial payment allowed', required: false })
  @Column({ default: false })
  allowPartialPayment: boolean;

  @ApiProperty({ description: 'Is overpayment allowed', required: false })
  @Column({ default: false })
  allowOverpayment: boolean;

  @ApiProperty({ description: 'Auto capture payment', required: false })
  @Column({ default: true })
  autoCapture: boolean;

  @ApiProperty({ description: 'Save payment method for future use', required: false })
  @Column({ default: false })
  savePaymentMethod: boolean;

  // Analytics and Tracking
  @ApiProperty({ description: 'Payment source/channel', required: false })
  @Column({ nullable: true })
  source?: string;

  @ApiProperty({ description: 'Campaign ID for tracking', required: false })
  @Column({ nullable: true })
  campaignId?: string;

  @ApiProperty({ description: 'UTM parameters', required: false })
  @Column({ type: 'jsonb', nullable: true })
  utmParameters?: {
    source?: string;
    medium?: string;
    campaign?: string;
    term?: string;
    content?: string;
  };

  @ApiProperty({ description: 'Payment analytics data', required: false })
  @Column({ type: 'jsonb', nullable: true })
  analyticsData?: {
    conversionTime?: number;
    abandonmentCount?: number;
    retryCount?: number;
    deviceType?: string;
    browserType?: string;
    location?: string;
  };

  // Metadata and Custom Fields
  @ApiProperty({ description: 'Custom metadata', required: false })
  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @ApiProperty({ description: 'Custom fields', required: false })
  @Column({ type: 'jsonb', nullable: true })
  customFields?: Record<string, any>;

  @ApiProperty({ description: 'Tags for categorization', required: false })
  @Column({ type: 'jsonb', nullable: true })
  tags?: string[];

  // Audit Fields
  @ApiProperty({ description: 'Created by user ID' })
  @Column('uuid')
  createdBy: string;

  @ApiProperty({ description: 'Updated by user ID', required: false })
  @Column('uuid', { nullable: true })
  updatedBy?: string;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty({ description: 'Soft delete timestamp', required: false })
  @Column({ type: 'timestamp', nullable: true })
  deletedAt?: Date;

  // IP and User Agent for Audit
  @ApiProperty({ description: 'IP address of the request', required: false })
  @Column({ nullable: true })
  ipAddress?: string;

  @ApiProperty({ description: 'User agent of the request', required: false })
  @Column({ type: 'text', nullable: true })
  userAgent?: string;
}