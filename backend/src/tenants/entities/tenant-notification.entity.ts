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

export enum NotificationType {
  RENT_DUE = 'rent_due',
  RENT_OVERDUE = 'rent_overdue',
  MAINTENANCE_UPDATE = 'maintenance_update',
  INSPECTION_SCHEDULED = 'inspection_scheduled',
  LEASE_EXPIRY = 'lease_expiry',
  GENERAL = 'general',
  EMERGENCY = 'emergency',
}

export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed',
}

export enum NotificationChannel {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
  IN_APP = 'in_app',
}

@Entity('tenant_notifications')
@Index(['tenantId'])
@Index(['type'])
@Index(['status'])
export class TenantNotification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @ManyToOne(() => Tenant, (tenant) => tenant.notifications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({
    type: 'varchar',
    
  })
  type: NotificationType;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({
    type: 'varchar',
    
    default: NotificationStatus.PENDING,
  })
  status: NotificationStatus;

  @Column({
    type: 'varchar',
    
  })
  channel: NotificationChannel;

  @Column({ type: 'datetime', nullable: true })
  sentDate?: Date;

  @Column({ type: 'datetime', nullable: true })
  readDate?: Date;

  @Column({ type: 'json', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
