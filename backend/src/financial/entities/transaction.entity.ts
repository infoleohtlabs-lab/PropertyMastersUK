import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { Property } from '../../properties/entities/property.entity';

export enum TransactionType {
  RENT_PAYMENT = 'rent_payment',
  DEPOSIT = 'deposit',
  MAINTENANCE_FEE = 'maintenance_fee',
  COMMISSION = 'commission',
  REFUND = 'refund',
  LATE_FEE = 'late_fee',
  UTILITY_PAYMENT = 'utility_payment',
  INSURANCE_PAYMENT = 'insurance_payment',
  TAX_PAYMENT = 'tax_payment',
  OTHER = 'other'
}

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}

export enum PaymentMethod {
  BANK_TRANSFER = 'bank_transfer',
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  CASH = 'cash',
  CHEQUE = 'cheque',
  DIRECT_DEBIT = 'direct_debit',
  STANDING_ORDER = 'standing_order',
  PAYPAL = 'paypal',
  STRIPE = 'stripe',
  OTHER = 'other'
}

@Entity('transactions')
export class Transaction {
  @ApiProperty({ description: 'Unique identifier for the transaction' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Reference number for the transaction' })
  @Column({ type: 'varchar', length: 100, unique: true })
  reference: string;

  @ApiProperty({ description: 'Type of transaction', enum: TransactionType })
  @Column({ type: 'varchar', length: 50 })
  type: TransactionType;

  @ApiProperty({ description: 'Transaction amount in pence/cents' })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @ApiProperty({ description: 'Currency code (e.g., GBP, EUR)' })
  @Column({ type: 'varchar', length: 3, default: 'GBP' })
  currency: string;

  @ApiProperty({ description: 'Transaction status', enum: TransactionStatus })
  @Column({ type: 'varchar', length: 50, default: TransactionStatus.PENDING })
  status: TransactionStatus;

  @ApiProperty({ description: 'Payment method used', enum: PaymentMethod })
  @Column({ type: 'varchar', length: 50 })
  paymentMethod: PaymentMethod;

  @ApiProperty({ description: 'Description of the transaction' })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({ description: 'Additional notes about the transaction' })
  @Column({ type: 'text', nullable: true })
  notes: string;

  @ApiProperty({ description: 'External transaction ID from payment provider' })
  @Column({ type: 'varchar', length: 255, nullable: true })
  externalTransactionId: string;

  @ApiProperty({ description: 'Date when the transaction was processed' })
  @Column({ type: 'datetime', nullable: true })
  processedAt: Date;

  @ApiProperty({ description: 'Date when the transaction failed (if applicable)' })
  @Column({ type: 'datetime', nullable: true })
  failedAt: Date;

  @ApiProperty({ description: 'Reason for failure (if applicable)' })
  @Column({ type: 'text', nullable: true })
  failureReason: string;

  @ApiProperty({ description: 'Receipt URL or file path' })
  @Column({ type: 'varchar', length: 500, nullable: true })
  receiptUrl: string;

  @ApiProperty({ description: 'User ID who initiated the transaction' })
  @Column({ type: 'uuid', nullable: true })
  userId: string;

  @ApiProperty({ description: 'Property ID associated with the transaction' })
  @Column({ type: 'uuid', nullable: true })
  propertyId: string;

  @ApiProperty({ description: 'Related transaction ID (for refunds, etc.)' })
  @Column({ type: 'uuid', nullable: true })
  relatedTransactionId: string;

  @ApiProperty({ description: 'Metadata as JSON string' })
  @Column({ type: 'text', nullable: true })
  metadata: string;

  @ApiProperty({ description: 'Date when the transaction was created' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Date when the transaction was last updated' })
  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ApiProperty({ description: 'User who initiated the transaction', type: () => User })
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ApiProperty({ description: 'Property associated with the transaction', type: () => Property })
  @ManyToOne(() => Property, { nullable: true })
  @JoinColumn({ name: 'propertyId' })
  property: Property;

  @ApiProperty({ description: 'Related transaction (for refunds, etc.)', type: () => Transaction })
  @ManyToOne(() => Transaction, { nullable: true })
  @JoinColumn({ name: 'relatedTransactionId' })
  relatedTransaction: Transaction;
}