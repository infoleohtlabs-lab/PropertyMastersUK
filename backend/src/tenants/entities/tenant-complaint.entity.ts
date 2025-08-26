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

export enum ComplaintStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
  ESCALATED = 'escalated',
}

export enum ComplaintCategory {
  MAINTENANCE = 'maintenance',
  NOISE = 'noise',
  NEIGHBOR = 'neighbor',
  LANDLORD = 'landlord',
  PROPERTY_CONDITION = 'property_condition',
  BILLING = 'billing',
  SERVICE = 'service',
  OTHER = 'other',
}

export enum ComplaintPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

@Entity('tenant_complaints')
@Index(['tenantId'])
@Index(['status'])
@Index(['category'])
export class TenantComplaint {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @ManyToOne(() => Tenant, (tenant) => tenant.complaints, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'varchar',
    
  })
  category: ComplaintCategory;

  @Column({
    type: 'varchar',
    
    default: ComplaintPriority.MEDIUM,
  })
  priority: ComplaintPriority;

  @Column({
    type: 'varchar',
    
    default: ComplaintStatus.OPEN,
  })
  status: ComplaintStatus;

  @Column({ type: 'datetime', nullable: true })
  resolvedDate?: Date;

  @Column({ length: 100, nullable: true })
  assignedTo?: string;

  @Column({ type: 'text', nullable: true })
  resolution?: string;

  @Column({ length: 1000, nullable: true })
  notes?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
