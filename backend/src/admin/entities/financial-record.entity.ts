import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Property } from '../../properties/entities/property.entity';

export enum FinancialRecordType {
  INCOME = 'income',
  EXPENSE = 'expense',
  COMMISSION = 'commission',
  FEE = 'fee',
  REFUND = 'refund',
  PENALTY = 'penalty',
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
}

export enum FinancialRecordStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export enum FinancialRecordCategory {
  RENT = 'rent',
  MAINTENANCE = 'maintenance',
  UTILITIES = 'utilities',
  INSURANCE = 'insurance',
  TAXES = 'taxes',
  LEGAL = 'legal',
  MARKETING = 'marketing',
  MANAGEMENT = 'management',
  OTHER = 'other',
}

@Entity('financial_records')
@Index(['type', 'createdAt'])
@Index(['status', 'createdAt'])
@Index(['userId', 'createdAt'])
@Index(['propertyId', 'createdAt'])
export class FinancialRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
  })
  type: FinancialRecordType;

  @Column({
    type: 'varchar',
    default: FinancialRecordStatus.PENDING,
  })
  status: FinancialRecordStatus;

  @Column({
    type: 'varchar',
  })
  category: FinancialRecordCategory;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column({ length: 3, default: 'GBP' })
  currency: string;

  @Column({ length: 200 })
  description: string;

  @Column('text', { nullable: true })
  notes: string;

  @Column({ name: 'user_id', nullable: true })
  userId: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'property_id', nullable: true })
  propertyId: string;

  @ManyToOne(() => Property, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'property_id' })
  property: Property;

  @Column({ name: 'transaction_id', nullable: true })
  transactionId: string;

  @Column({ name: 'reference_number', length: 100, nullable: true })
  referenceNumber: string;

  @Column({ name: 'payment_method', length: 50, nullable: true })
  paymentMethod: string;

  @Column({ name: 'processed_at', nullable: true })
  processedAt: Date;

  @Column({ name: 'due_date', nullable: true })
  dueDate: Date;

  @Column({ name: 'paid_date', nullable: true })
  paidDate: Date;

  @Column('text', { nullable: true })
  metadata: Record<string, any>;

  @Column({ name: 'tax_rate', type: 'decimal', precision: 5, scale: 2, nullable: true })
  taxRate: number;

  @Column({ name: 'tax_amount', type: 'decimal', precision: 10, scale: 2, nullable: true })
  taxAmount: number;

  @Column({ name: 'net_amount', type: 'decimal', precision: 10, scale: 2, nullable: true })
  netAmount: number;

  @Column({ name: 'invoice_number', length: 100, nullable: true })
  invoiceNumber: string;

  @Column({ name: 'receipt_url', length: 500, nullable: true })
  receiptUrl: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ default: false })
  archived: boolean;

  @Column({ name: 'created_by', nullable: true })
  createdBy: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by' })
  createdByUser: User;
}
