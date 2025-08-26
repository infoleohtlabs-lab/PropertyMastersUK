import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { Property } from '../../properties/entities/property.entity';
import { Tenant } from '../../tenants/entities/tenant.entity';

export enum PaymentType {
  RENT = 'rent',
  DEPOSIT = 'deposit',
  SERVICE_CHARGE = 'service_charge',
  MAINTENANCE = 'maintenance',
  LATE_FEE = 'late_fee',
  ADMIN_FEE = 'admin_fee',
  REFUND = 'refund',
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
}

export enum PaymentMethod {
  CARD = 'card',
  BANK_TRANSFER = 'bank_transfer',
  DIRECT_DEBIT = 'direct_debit',
  STANDING_ORDER = 'standing_order',
  CASH = 'cash',
  CHEQUE = 'cheque',
  BACS = 'bacs',
  FASTER_PAYMENTS = 'faster_payments',
}

@Entity('payments')
export class Payment {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ unique: true })
  paymentReference: string;

  @ApiProperty({ enum: PaymentType })
  @Column({
    type: 'varchar',
    
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
    
  })
  method: PaymentMethod;

  @ApiProperty()
  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @ApiProperty()
  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  feeAmount: number;

  @ApiProperty()
  @Column('decimal', { precision: 10, scale: 2 })
  netAmount: number; // amount - feeAmount

  @ApiProperty()
  @Column({ length: 3, default: 'GBP' })
  currency: string;

  @ApiProperty()
  @Column('text', { nullable: true })
  description: string;

  @ApiProperty()
  @Column({ nullable: true })
  dueDate: Date;

  @ApiProperty()
  @Column({ nullable: true })
  paidDate: Date;

  @ApiProperty()
  @Column({ nullable: true })
  processedDate: Date;

  @ApiProperty()
  @Column({ nullable: true })
  externalTransactionId: string; // Stripe, bank reference, etc.

  @ApiProperty()
  @Column('json', { nullable: true })
  paymentDetails: any; // Card last 4 digits, bank details, etc.

  @ApiProperty()
  @Column('json', { nullable: true })
  metadata: any; // Additional payment gateway data

  @ApiProperty()
  @Column({ default: false })
  isRecurring: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  recurringSchedule: string; // cron expression or frequency

  @ApiProperty()
  @Column({ nullable: true })
  nextPaymentDate: Date;

  @ApiProperty()
  @Column({ nullable: true })
  failureReason: string;

  @ApiProperty()
  @Column({ default: 0 })
  retryCount: number;

  @ApiProperty()
  @Column({ nullable: true })
  lastRetryDate: Date;

  @ApiProperty()
  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  refundedAmount: number;

  @ApiProperty()
  @Column({ nullable: true })
  refundedDate: Date;

  @ApiProperty()
  @Column({ nullable: true })
  refundReason: string;

  @ApiProperty()
  @Column('simple-array', { nullable: true })
  receipts: string[]; // File paths/URLs to receipts

  @ApiProperty()
  @Column('text', { nullable: true })
  notes: string;

  // Period this payment covers (for rent)
  @ApiProperty()
  @Column({ nullable: true })
  periodStart: Date;

  @ApiProperty()
  @Column({ nullable: true })
  periodEnd: Date;

  // Relationships
  @ApiProperty()
  @Column('uuid')
  payerId: string; // User making the payment

  @ManyToOne(() => User)
  @JoinColumn({ name: 'payerId' })
  payer: User;

  @ApiProperty()
  @Column('uuid')
  payeeId: string; // User receiving the payment (landlord/agent)

  @ManyToOne(() => User)
  @JoinColumn({ name: 'payeeId' })
  payee: User;

  @ApiProperty()
  @Column('uuid', { nullable: true })
  propertyId: string;

  @ManyToOne(() => Property)
  @JoinColumn({ name: 'propertyId' })
  property: Property;

  @ApiProperty()
  @Column('uuid', { nullable: true })
  tenantId: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
