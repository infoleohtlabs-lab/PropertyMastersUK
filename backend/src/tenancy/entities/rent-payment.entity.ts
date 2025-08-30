import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Tenancy } from './tenancy.entity';
import { User } from '../../users/entities/user.entity';

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  OVERDUE = 'overdue',
  PARTIAL = 'partial',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export enum PaymentMethod {
  BANK_TRANSFER = 'bank_transfer',
  DIRECT_DEBIT = 'direct_debit',
  STANDING_ORDER = 'standing_order',
  CARD = 'card',
  CASH = 'cash',
  CHEQUE = 'cheque',
  BACS = 'bacs',
}

@Entity('rent_payments')
export class RentPayment {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column('uuid')
  tenancyId: string;

  @ManyToOne(() => Tenancy, tenancy => tenancy.rentPayments)
  @JoinColumn({ name: 'tenancyId' })
  tenancy: Tenancy;

  @ApiProperty()
  @Column('uuid', { nullable: true })
  tenantId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'tenantId' })
  tenant: User;

  @ApiProperty()
  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @ApiProperty()
  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  amountPaid: number;

  @ApiProperty()
  @Column()
  dueDate: Date;

  @ApiProperty()
  @Column({ nullable: true })
  paidDate: Date;

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
  paymentMethod: PaymentMethod;

  @ApiProperty()
  @Column({ nullable: true })
  transactionReference: string;

  @ApiProperty()
  @Column({ nullable: true })
  paymentReference: string;

  @ApiProperty()
  @Column('text', { nullable: true })
  description: string;

  @ApiProperty()
  @Column('text', { nullable: true })
  notes: string;

  @ApiProperty()
  @Column('decimal', { precision: 8, scale: 2, default: 0 })
  lateFee: number;

  @ApiProperty()
  @Column({ default: false })
  isRecurring: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  recurringFrequency: string;

  @ApiProperty()
  @Column({ nullable: true })
  nextDueDate: Date;

  @ApiProperty()
  @Column('uuid', { nullable: true })
  processedBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'processedBy' })
  processor: User;

  @ApiProperty()
  @Column('simple-array', { nullable: true })
  attachments: string[];

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}