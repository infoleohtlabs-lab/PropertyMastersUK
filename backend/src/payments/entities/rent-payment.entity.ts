import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { Property } from '../../properties/entities/property.entity';
import { TenancyAgreement } from '../../tenants/entities/tenancy-agreement.entity';

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
  CARD = 'card',
  CASH = 'cash',
  CHEQUE = 'cheque',
  STANDING_ORDER = 'standing_order',
}

export enum PaymentType {
  RENT = 'rent',
  DEPOSIT = 'deposit',
  SERVICE_CHARGE = 'service_charge',
  UTILITIES = 'utilities',
  LATE_FEE = 'late_fee',
  DAMAGE_CHARGE = 'damage_charge',
  CLEANING_FEE = 'cleaning_fee',
  OTHER = 'other',
}

@Entity('rent_payments')
export class RentPayment {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column()
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
    
  })
  method: PaymentMethod;

  @ApiProperty()
  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @ApiProperty()
  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  feeAmount: number;

  @ApiProperty()
  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  totalAmount: number;

  @ApiProperty()
  @Column()
  dueDate: Date;

  @ApiProperty()
  @Column({ nullable: true })
  paidDate: Date;

  @ApiProperty()
  @Column({ nullable: true })
  periodStart: Date;

  @ApiProperty()
  @Column({ nullable: true })
  periodEnd: Date;

  @ApiProperty()
  @Column('text', { nullable: true })
  description: string;

  @ApiProperty()
  @Column('text', { nullable: true })
  notes: string;

  @ApiProperty()
  @Column({ nullable: true })
  transactionId: string;

  @ApiProperty()
  @Column({ nullable: true })
  stripePaymentIntentId: string;

  @ApiProperty()
  @Column({ nullable: true })
  bankReference: string;

  @ApiProperty()
  @Column({ default: false })
  isLate: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  lateDays: number;

  @ApiProperty()
  @Column('decimal', { precision: 8, scale: 2, nullable: true })
  lateFee: number;

  @ApiProperty()
  @Column({ default: false })
  isRecurring: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  recurringFrequency: string; // monthly, weekly, etc.

  @ApiProperty()
  @Column({ nullable: true })
  nextPaymentDate: Date;

  @ApiProperty()
  @Column('text', { nullable: true })
  failureReason: string;

  @ApiProperty()
  @Column({ nullable: true })
  refundedAt: Date;

  @ApiProperty()
  @Column('decimal', { precision: 8, scale: 2, nullable: true })
  refundAmount: number;

  @ApiProperty()
  @Column('text', { nullable: true })
  refundReason: string;

  // Relationships
  @ApiProperty()
  @Column('uuid')
  tenantId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'tenantId' })
  tenant: User;

  @ApiProperty()
  @Column('uuid')
  landlordId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'landlordId' })
  landlord: User;

  @ApiProperty()
  @Column('uuid')
  propertyId: string;

  @ManyToOne(() => Property)
  @JoinColumn({ name: 'propertyId' })
  property: Property;

  @ApiProperty()
  @Column('uuid', { nullable: true })
  tenancyAgreementId: string;

  @ManyToOne(() => TenancyAgreement)
  @JoinColumn({ name: 'tenancyAgreementId' })
  tenancyAgreement: TenancyAgreement;

  @ApiProperty()
  @Column('uuid', { nullable: true })
  agentId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'agentId' })
  agent: User;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
