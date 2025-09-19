import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { TenantOrganization } from '../../common/entities/tenant-organization.entity';
import { Property } from '../../properties/entities/property.entity';

export enum NotificationType {
  SYSTEM = 'system',
  BOOKING = 'booking',
  PAYMENT = 'payment',
  MAINTENANCE = 'maintenance',
  MESSAGE = 'message',
  PROPERTY = 'property',
  TENANT = 'tenant',
  REMINDER = 'reminder',
  ALERT = 'alert',
  ANNOUNCEMENT = 'announcement',
}

export enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed',
  DISMISSED = 'dismissed',
}

export enum NotificationChannel {
  IN_APP = 'in_app',
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
  WEBHOOK = 'webhook',
}

@Entity('notifications')
@Index(['tenantOrganizationId', 'userId'])
@Index(['type', 'status'])
@Index(['createdAt'])
export class Notification {
  @ApiProperty({ description: 'Unique identifier for the notification' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Tenant organization ID for multi-tenancy' })
  @Column('uuid')
  @Index()
  tenantOrganizationId: string;

  @ApiProperty({ description: 'Tenant organization relationship' })
  @ManyToOne(() => TenantOrganization)
  @JoinColumn({ name: 'tenantOrganizationId' })
  tenantOrganization: TenantOrganization;

  @ApiProperty({ description: 'Notification type', enum: NotificationType })
  @Column({
    type: 'varchar',
    default: NotificationType.SYSTEM,
  })
  type: NotificationType;

  @ApiProperty({ description: 'Notification priority', enum: NotificationPriority })
  @Column({
    type: 'varchar',
    default: NotificationPriority.NORMAL,
  })
  priority: NotificationPriority;

  @ApiProperty({ description: 'Notification status', enum: NotificationStatus })
  @Column({
    type: 'varchar',
    default: NotificationStatus.PENDING,
  })
  status: NotificationStatus;

  @ApiProperty({ description: 'Notification channels', enum: NotificationChannel, isArray: true })
  @Column({
    type: 'simple-array',
    default: 'in_app',
  })
  channels: NotificationChannel[];

  @ApiProperty({ description: 'Recipient user ID' })
  @Column('uuid')
  @Index()
  userId: string;

  @ApiProperty({ description: 'Recipient user relationship' })
  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ApiProperty({ description: 'Notification title' })
  @Column({ length: 255 })
  title: string;

  @ApiProperty({ description: 'Notification message/content' })
  @Column('text')
  message: string;

  @ApiProperty({ description: 'Notification description (optional)' })
  @Column('text', { nullable: true })
  description: string;

  @ApiProperty({ description: 'Notification icon or image URL' })
  @Column({ length: 500, nullable: true })
  iconUrl: string;

  @ApiProperty({ description: 'Action URL or deep link' })
  @Column({ length: 500, nullable: true })
  actionUrl: string;

  @ApiProperty({ description: 'Action button text' })
  @Column({ length: 100, nullable: true })
  actionText: string;

  @ApiProperty({ description: 'Related entity type (property, booking, etc.)' })
  @Column({ length: 50, nullable: true })
  entityType: string;

  @ApiProperty({ description: 'Related entity ID' })
  @Column('uuid', { nullable: true })
  entityId: string;

  @ApiProperty({ description: 'Related property ID (optional)' })
  @Column('uuid', { nullable: true })
  propertyId: string;

  @ApiProperty({ description: 'Related property relationship' })
  @ManyToOne(() => Property, { nullable: true })
  @JoinColumn({ name: 'propertyId' })
  property: Property;

  @ApiProperty({ description: 'Notification metadata and additional data' })
  @Column('text', { nullable: true })
  metadata: Record<string, any>;

  @ApiProperty({ description: 'Notification template ID' })
  @Column({ length: 100, nullable: true })
  templateId: string;

  @ApiProperty({ description: 'Template variables for dynamic content' })
  @Column('text', { nullable: true })
  templateVariables: Record<string, any>;

  @ApiProperty({ description: 'Scheduled send time' })
  @Column({ type: 'datetime', nullable: true })
  @Index()
  scheduledAt: Date;

  @ApiProperty({ description: 'Notification sent timestamp' })
  @Column({ type: 'datetime', nullable: true })
  sentAt: Date;

  @ApiProperty({ description: 'Notification delivered timestamp' })
  @Column({ type: 'datetime', nullable: true })
  deliveredAt: Date;

  @ApiProperty({ description: 'Notification read timestamp' })
  @Column({ type: 'datetime', nullable: true })
  readAt: Date;

  @ApiProperty({ description: 'Notification dismissed timestamp' })
  @Column({ type: 'datetime', nullable: true })
  dismissedAt: Date;

  @ApiProperty({ description: 'Notification expiry timestamp' })
  @Column({ type: 'datetime', nullable: true })
  expiresAt: Date;

  @ApiProperty({ description: 'Number of retry attempts' })
  @Column({ default: 0 })
  retryCount: number;

  @ApiProperty({ description: 'Maximum retry attempts' })
  @Column({ default: 3 })
  maxRetries: number;

  @ApiProperty({ description: 'Last error message if failed' })
  @Column('text', { nullable: true })
  lastError: string;

  @ApiProperty({ description: 'Email delivery status' })
  @Column('text', { nullable: true })
  emailStatus: Record<string, any>;

  @ApiProperty({ description: 'SMS delivery status' })
  @Column('text', { nullable: true })
  smsStatus: Record<string, any>;

  @ApiProperty({ description: 'Push notification delivery status' })
  @Column('text', { nullable: true })
  pushStatus: Record<string, any>;

  @ApiProperty({ description: 'Whether notification is persistent' })
  @Column({ default: false })
  isPersistent: boolean;

  @ApiProperty({ description: 'Whether notification requires action' })
  @Column({ default: false })
  requiresAction: boolean;

  @ApiProperty({ description: 'Whether notification is dismissible' })
  @Column({ default: true })
  isDismissible: boolean;

  @ApiProperty({ description: 'Notification creation timestamp' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Notification last update timestamp' })
  @UpdateDateColumn()
  updatedAt: Date;
}
