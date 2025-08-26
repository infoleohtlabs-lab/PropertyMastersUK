import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Landlord } from './landlord.entity';
import { TenancyAgreement } from './tenancy-agreement.entity';
import { User } from '../../users/entities/user.entity';

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
  OVERDUE = 'overdue',
}

export enum PaymentMethod {
  BANK_TRANSFER = 'bank_transfer',
  DIRECT_DEBIT = 'direct_debit',
  STANDING_ORDER = 'standing_order',
  CARD_PAYMENT = 'card_payment',
  CASH = 'cash',
  CHEQUE = 'cheque',
  ONLINE_PAYMENT = 'online_payment',
}

export enum PaymentType {
  RENT = 'rent',
  DEPOSIT = 'deposit',
  LATE_FEE = 'late_fee',
  ADMIN_FEE = 'admin_fee',
  UTILITIES = 'utilities',
  MAINTENANCE = 'maintenance',
  OTHER = 'other',
}

@Entity('rent_payments')
export class RentPayment {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column('uuid')
  landlordId: string;

  @ManyToOne(() => Landlord, landlord => landlord.rentPayments)
  @JoinColumn({ name: 'landlordId' })
  landlord: Landlord;

  @ApiProperty()
  @Column('uuid')
  tenancyAgreementId: string;

  @ManyToOne(() => TenancyAgreement, agreement => agreement.rentPayments)
  @JoinColumn({ name: 'tenancyAgreementId' })
  tenancyAgreement: TenancyAgreement;

  @ApiProperty()
  @Column('uuid')
  tenantId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'tenantId' })
  tenant: User;

  @ApiProperty()
  @Column({ nullable: true })
  paymentReference: string;

  @ApiProperty({ enum: PaymentType })
  @Column({
    type: 'varchar',
    
    default: PaymentType.RENT,
  })
  type: PaymentType;

  @ApiProperty({ enum: PaymentStatus })
  @Column({
    type: 'varchar',
    
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @ApiProperty({ enum: PaymentMethod })
  @Column({
    type: 'varchar',
    
    nullable: true,
  })
  method: PaymentMethod;

  // Payment Amounts
  @ApiProperty()
  @Column('decimal', { precision: 12, scale: 2 })
  amount: number;

  @ApiProperty()
  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  lateFee: number;

  @ApiProperty()
  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  adminFee: number;

  @ApiProperty()
  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  totalAmount: number;

  @ApiProperty()
  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  paidAmount: number;

  @ApiProperty()
  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  outstandingAmount: number;

  // Payment Dates
  @ApiProperty()
  @Column()
  dueDate: Date;

  @ApiProperty()
  @Column({ nullable: true })
  paidDate: Date;

  @ApiProperty()
  @Column({ nullable: true })
  processedDate: Date;

  @ApiProperty()
  @Column({ nullable: true })
  clearedDate: Date;

  // Period Information
  @ApiProperty()
  @Column()
  periodStart: Date;

  @ApiProperty()
  @Column()
  periodEnd: Date;

  @ApiProperty()
  @Column({ nullable: true })
  rentMonth: string; // e.g., "2024-01" for January 2024

  @ApiProperty()
  @Column({ nullable: true })
  rentYear: number;

  // Payment Processing
  @ApiProperty()
  @Column({ nullable: true })
  transactionId: string;

  @ApiProperty()
  @Column({ nullable: true })
  paymentGateway: string;

  @ApiProperty()
  @Column({ nullable: true })
  gatewayTransactionId: string;

  @ApiProperty()
  @Column({ nullable: true })
  bankReference: string;

  @ApiProperty()
  @Column({ nullable: true })
  chequeNumber: string;

  // Late Payment Information
  @ApiProperty()
  @Column({ default: false })
  isLate: boolean;

  @ApiProperty()
  @Column({ default: 0 })
  daysLate: number;

  @ApiProperty()
  @Column({ nullable: true })
  lateNoticeDate: Date;

  @ApiProperty()
  @Column({ default: 0 })
  lateNoticesSent: number;

  @ApiProperty()
  @Column({ nullable: true })
  lastLateNoticeDate: Date;

  // Partial Payments
  @ApiProperty()
  @Column({ default: false })
  isPartialPayment: boolean;

  @ApiProperty()
  @Column({ default: 0 })
  partialPaymentCount: number;

  @ApiProperty()
  @Column('simple-array', { nullable: true })
  partialPaymentIds: string[];

  @ApiProperty()
  @Column({ nullable: true })
  parentPaymentId: string; // For partial payments

  // Recurring Payment Information
  @ApiProperty()
  @Column({ default: false })
  isRecurring: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  recurringPaymentId: string;

  @ApiProperty()
  @Column({ nullable: true })
  directDebitMandateId: string;

  @ApiProperty()
  @Column({ nullable: true })
  standingOrderReference: string;

  // Refund Information
  @ApiProperty()
  @Column({ default: false })
  isRefunded: boolean;

  @ApiProperty()
  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  refundAmount: number;

  @ApiProperty()
  @Column({ nullable: true })
  refundDate: Date;

  @ApiProperty()
  @Column({ nullable: true })
  refundReason: string;

  @ApiProperty()
  @Column({ nullable: true })
  refundReference: string;

  // Communication
  @ApiProperty()
  @Column({ default: false })
  reminderSent: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  reminderSentDate: Date;

  @ApiProperty()
  @Column({ default: 0 })
  reminderCount: number;

  @ApiProperty()
  @Column({ default: false })
  receiptSent: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  receiptSentDate: Date;

  // Dispute Information
  @ApiProperty()
  @Column({ default: false })
  isDisputed: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  disputeDate: Date;

  @ApiProperty()
  @Column({ nullable: true })
  disputeReason: string;

  @ApiProperty()
  @Column({ nullable: true })
  disputeResolutionDate: Date;

  @ApiProperty()
  @Column({ nullable: true })
  disputeResolution: string;

  // Fees and Charges
  @ApiProperty()
  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  processingFee: number;

  @ApiProperty()
  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  bankCharges: number;

  @ApiProperty()
  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  gatewayFees: number;

  // Allocation (for overpayments)
  @ApiProperty()
  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  allocatedToRent: number;

  @ApiProperty()
  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  allocatedToFees: number;

  @ApiProperty()
  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  allocatedToArrears: number;

  @ApiProperty()
  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  creditBalance: number;

  // Metadata
  @ApiProperty()
  @Column('text', { nullable: true })
  paymentDetails: string; // JSON string for additional payment details

  @ApiProperty()
  @Column('text', { nullable: true })
  notes: string;

  @ApiProperty()
  @Column({ nullable: true })
  receiptUrl: string;

  @ApiProperty()
  @Column({ nullable: true })
  invoiceUrl: string;

  @ApiProperty()
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
