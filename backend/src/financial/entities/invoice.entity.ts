import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { Property } from '../../properties/entities/property.entity';
import { Transaction } from './transaction.entity';

export enum InvoiceType {
  RENT = 'rent',
  DEPOSIT = 'deposit',
  MAINTENANCE = 'maintenance',
  COMMISSION = 'commission',
  UTILITIES = 'utilities',
  INSURANCE = 'insurance',
  MANAGEMENT_FEE = 'management_fee',
  LATE_FEE = 'late_fee',
  OTHER = 'other'
}

export enum InvoiceStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  VIEWED = 'viewed',
  PAID = 'paid',
  PARTIALLY_PAID = 'partially_paid',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}

@Entity('invoices')
export class Invoice {
  @ApiProperty({ description: 'Unique identifier for the invoice' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Invoice number (human-readable)' })
  @Column({ type: 'varchar', length: 50, unique: true })
  invoiceNumber: string;

  @ApiProperty({ description: 'Type of invoice', enum: InvoiceType })
  @Column({ type: 'varchar', length: 50 })
  type: InvoiceType;

  @ApiProperty({ description: 'Invoice status', enum: InvoiceStatus })
  @Column({ type: 'varchar', length: 50, default: InvoiceStatus.DRAFT })
  status: InvoiceStatus;

  @ApiProperty({ description: 'Invoice title/subject' })
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @ApiProperty({ description: 'Invoice description' })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({ description: 'Subtotal amount before tax' })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number;

  @ApiProperty({ description: 'Tax amount' })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  taxAmount: number;

  @ApiProperty({ description: 'Tax rate as percentage' })
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  taxRate: number;

  @ApiProperty({ description: 'Total amount including tax' })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @ApiProperty({ description: 'Amount already paid' })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  paidAmount: number;

  @ApiProperty({ description: 'Outstanding amount' })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  outstandingAmount: number;

  @ApiProperty({ description: 'Currency code (e.g., GBP, EUR)' })
  @Column({ type: 'varchar', length: 3, default: 'GBP' })
  currency: string;

  @ApiProperty({ description: 'Invoice issue date' })
  @Column({ type: 'date' })
  issueDate: Date;

  @ApiProperty({ description: 'Invoice due date' })
  @Column({ type: 'date' })
  dueDate: Date;

  @ApiProperty({ description: 'Date when invoice was sent' })
  @Column({ type: 'datetime', nullable: true })
  sentAt: Date;

  @ApiProperty({ description: 'Date when invoice was paid' })
  @Column({ type: 'datetime', nullable: true })
  paidAt: Date;

  @ApiProperty({ description: 'Date when invoice was cancelled' })
  @Column({ type: 'datetime', nullable: true })
  cancelledAt: Date;

  @ApiProperty({ description: 'Billing address' })
  @Column({ type: 'text', nullable: true })
  billingAddress: string;

  @ApiProperty({ description: 'Additional notes' })
  @Column({ type: 'text', nullable: true })
  notes: string;

  @ApiProperty({ description: 'Invoice items as JSON string' })
  @Column({ type: 'text', nullable: true })
  items: string;

  @ApiProperty({ description: 'Payment terms' })
  @Column({ type: 'varchar', length: 255, nullable: true })
  paymentTerms: string;

  @ApiProperty({ description: 'Late fee amount' })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  lateFee: number;

  @ApiProperty({ description: 'PDF file URL' })
  @Column({ type: 'varchar', length: 500, nullable: true })
  pdfUrl: string;

  @ApiProperty({ description: 'User ID who created the invoice' })
  @Column({ type: 'uuid' })
  createdBy: string;

  @ApiProperty({ description: 'User ID who the invoice is for' })
  @Column({ type: 'uuid' })
  invoiceTo: string;

  @ApiProperty({ description: 'Property ID associated with the invoice' })
  @Column({ type: 'uuid', nullable: true })
  propertyId: string;

  @ApiProperty({ description: 'Metadata as JSON string' })
  @Column({ type: 'text', nullable: true })
  metadata: string;

  @ApiProperty({ description: 'Date when the invoice was created' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Date when the invoice was last updated' })
  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ApiProperty({ description: 'User who created the invoice', type: () => User })
  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdBy' })
  creator: User;

  @ApiProperty({ description: 'User who the invoice is for', type: () => User })
  @ManyToOne(() => User)
  @JoinColumn({ name: 'invoiceTo' })
  recipient: User;

  @ApiProperty({ description: 'Property associated with the invoice', type: () => Property })
  @ManyToOne(() => Property, { nullable: true })
  @JoinColumn({ name: 'propertyId' })
  property: Property;

  @ApiProperty({ description: 'Transactions related to this invoice', type: () => [Transaction] })
  @OneToMany(() => Transaction, transaction => transaction.property)
  transactions: Transaction[];
}
