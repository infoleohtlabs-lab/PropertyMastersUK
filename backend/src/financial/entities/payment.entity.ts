import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { Property } from '../../properties/entities/property.entity';
import { TenantOrganization } from '../../common/entities/tenant-organization.entity';

export enum PaymentType {
  RENT = 'rent',
  DEPOSIT = 'deposit',
  SERVICE_CHARGE = 'service_charge',
  GROUND_RENT = 'ground_rent',
  MAINTENANCE_FEE = 'maintenance_fee',
  LATE_FEE = 'late_fee',
  ADMIN_FEE = 'admin_fee',
  COMMISSION = 'commission',
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
  @Column('decimal', { precision: 12, scale: 2 })
  amount: number;

  @ApiProperty()
  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  feeAmount: number;

  @ApiProperty()
  @Column('decimal', { precision: 12, scale: 2 })
  netAmount: number;

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
  paidAt: Date;

  @ApiProperty()
  @Column({ nullable: true })
  stripePaymentIntentId: string;

  @ApiProperty()
  @Column({ nullable: true })
  stripeChargeId: string;

  @ApiProperty()
  @Column({ nullable: true })
  bankTransactionId: string;

  @ApiProperty()
  @Column('text', { nullable: true })
  failureReason: string;

  @ApiProperty()
  @Column('text', { nullable: true })
  notes: string;

  @ApiProperty()
  @Column({ nullable: true })
  receiptUrl: string;

  @ApiProperty()
  @Column({ nullable: true })
  invoiceNumber: string;

  @ApiProperty()
  @Column({ default: false })
  isRecurring: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  recurringFrequency: string; // monthly, quarterly, annually

  @ApiProperty()
  @Column({ nullable: true })
  nextPaymentDate: Date;

  // Relationships
  @ApiProperty()
  @Column({ nullable: true })
  tenantOrganizationId: string;

  @ManyToOne(() => TenantOrganization)
  @JoinColumn({ name: 'tenantOrganizationId' })
  tenantOrganization: TenantOrganization;

  @ApiProperty()
  @Column('uuid')
  payerId: string; // User making the payment

  @ManyToOne(() => User)
  @JoinColumn({ name: 'payerId' })
  payer: User;

  @ApiProperty()
  @Column('uuid', { nullable: true })
  recipientId: string; // User receiving the payment

  @ManyToOne(() => User)
  @JoinColumn({ name: 'recipientId' })
  recipient: User;

  @ApiProperty()
  @Column('uuid', { nullable: true })
  propertyId: string;

  @ManyToOne(() => Property)
  @JoinColumn({ name: 'propertyId' })
  property: Property;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}