import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';

export enum NotificationType {
  BOOKING_CONFIRMATION = 'booking_confirmation',
  BOOKING_REMINDER = 'booking_reminder',
  BOOKING_CANCELLATION = 'booking_cancellation',
  PROPERTY_INQUIRY = 'property_inquiry',
  MAINTENANCE_REQUEST = 'maintenance_request',
  MAINTENANCE_UPDATE = 'maintenance_update',
  RENT_REMINDER = 'rent_reminder',
  RENT_OVERDUE = 'rent_overdue',
  TENANCY_EXPIRY = 'tenancy_expiry',
  DOCUMENT_UPLOAD = 'document_upload',
  SYSTEM_UPDATE = 'system_update',
  MARKETING_UPDATE = 'marketing_update',
  SECURITY_ALERT = 'security_alert',
}

export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed',
}

export enum NotificationChannel {
  IN_APP = 'in_app',
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
}

export enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

@Entity('notifications')
export class Notification {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column()
  title: string;

  @ApiProperty()
  @Column('text')
  message: string;

  @ApiProperty({ enum: NotificationType })
  @Column({
    type: 'varchar',
    
  })
  type: NotificationType;

  @ApiProperty({ enum: NotificationStatus })
  @Column({
    type: 'varchar',
    
    default: NotificationStatus.PENDING,
  })
  status: NotificationStatus;

  @ApiProperty({ enum: NotificationChannel })
  @Column({
    type: 'varchar',
    
    default: NotificationChannel.IN_APP,
  })
  channel: NotificationChannel;

  @ApiProperty({ enum: NotificationPriority })
  @Column({
    type: 'varchar',
    
    default: NotificationPriority.NORMAL,
  })
  priority: NotificationPriority;

  @ApiProperty()
  @Column({ nullable: true })
  actionUrl: string; // URL to navigate when notification is clicked

  @ApiProperty()
  @Column('json', { nullable: true })
  data: any; // Additional data for the notification

  @ApiProperty()
  @Column({ nullable: true })
  readAt: Date;

  @ApiProperty()
  @Column({ nullable: true })
  sentAt: Date;

  @ApiProperty()
  @Column({ nullable: true })
  deliveredAt: Date;

  @ApiProperty()
  @Column({ nullable: true })
  scheduledFor: Date; // For scheduled notifications

  @ApiProperty()
  @Column({ default: false })
  isArchived: boolean;

  @ApiProperty()
  @Column({ default: 0 })
  retryCount: number;

  @ApiProperty()
  @Column({ nullable: true })
  lastRetryAt: Date;

  @ApiProperty()
  @Column('text', { nullable: true })
  errorMessage: string;

  @ApiProperty()
  @Column({ nullable: true })
  expiresAt: Date;

  // Relationships
  @ApiProperty()
  @Column('uuid')
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
