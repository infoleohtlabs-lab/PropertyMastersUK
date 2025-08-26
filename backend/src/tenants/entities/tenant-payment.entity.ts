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
import { Tenant } from './tenant.entity';

export enum PaymentType {
  RENT = 'rent',
  DEPOSIT = 'deposit',
  APPLICATION_FEE = 'application_fee',
  ADMIN_FEE = 'admin_fee',
  UTILITIES = 'utilities',
  MAINTENANCE = 'maintenance',
  LATE_FEE = 'late_fee',
  OTHER = 'other',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  DISPUTED = 'disputed',
}

export enum PaymentMethod {
  BANK_TRANSFER = 'bank_transfer',
  DIRECT_DEBIT = 'direct_debit',
  CARD = 'card',
  CASH = 'cash',
  CHEQUE = 'cheque',
  STANDING_ORDER = 'standing_order',
  OTHER = 'other',
}

@Entity('tenant_payments')
@Index(['tenantId'])
@Index(['paymentType'])
@Index(['status'])
@Index(['paymentDate'])
export class TenantPayment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @ManyToOne(() => Tenant, (tenant) => tenant.payments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({
    type: 'varchar',
    
  })
  paymentType: PaymentType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({
    type: 'varchar',
    
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Column({
    type: 'varchar',
    
  })
  paymentMethod: PaymentMethod;

  @Column({ type: 'datetime' })
  paymentDate: Date;

  @Column({ type: 'date' })
  periodStartDate: Date;

  @Column({ type: 'date' })
  periodEndDate: Date;

  @Column({ type: 'date', nullable: true })
  dueDate?: Date;

  @Column({ length: 255, nullable: true })
  transactionReference?: string;

  @Column({ length: 1000, nullable: true })
  notes?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
