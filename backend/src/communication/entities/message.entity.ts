import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { TenantOrganization } from '../../common/entities/tenant-organization.entity';
import { User } from '../../users/entities/user.entity';
import { Property } from '../../properties/entities/property.entity';
import { MaintenanceRequest } from '../../maintenance/entities/maintenance-request.entity';
import { Booking } from '../../booking/entities/booking.entity';

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  FILE = 'file',
  SYSTEM = 'system',
  NOTIFICATION = 'notification',
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
}

export enum MessageStatus {
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed',
  PENDING = 'pending',
}

export enum MessagePriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum ConversationType {
  DIRECT = 'direct',
  GROUP = 'group',
  PROPERTY = 'property',
  MAINTENANCE = 'maintenance',
  BOOKING = 'booking',
  SUPPORT = 'support',
  ANNOUNCEMENT = 'announcement',
}

@Entity('messages')
@Index(['tenantOrganizationId', 'conversationId', 'createdAt'])
@Index(['tenantOrganizationId', 'senderId', 'createdAt'])
@Index(['tenantOrganizationId', 'recipientId', 'createdAt'])
@Index(['tenantOrganizationId', 'status', 'createdAt'])
@Index(['tenantOrganizationId', 'type', 'createdAt'])
@Index(['tenantOrganizationId', 'priority', 'createdAt'])
@Index(['tenantOrganizationId', 'isRead', 'createdAt'])
@Index(['tenantOrganizationId', 'isArchived', 'createdAt'])
export class Message {
  @ApiProperty({ description: 'Message ID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Multi-tenancy
  @ApiProperty({ description: 'Tenant organization ID' })
  @Column('uuid')
  @Index()
  tenantOrganizationId: string;

  @ManyToOne(() => TenantOrganization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenantOrganizationId' })
  tenantOrganization: TenantOrganization;

  // Basic Information
  @ApiProperty({ description: 'Conversation ID' })
  @Column('uuid')
  @Index()
  conversationId: string;

  @ApiProperty({ enum: ConversationType, description: 'Conversation type' })
  @Column({
    type: 'enum',
    enum: ConversationType,
    default: ConversationType.DIRECT,
  })
  conversationType: ConversationType;

  @ApiProperty({ description: 'Message subject', required: false })
  @Column({ type: 'varchar', length: 500, nullable: true })
  subject?: string;

  @ApiProperty({ description: 'Message content' })
  @Column('text')
  content: string;

  @ApiProperty({ enum: MessageType, description: 'Message type' })
  @Column({
    type: 'enum',
    enum: MessageType,
    default: MessageType.TEXT,
  })
  type: MessageType;

  @ApiProperty({ enum: MessageStatus, description: 'Message status' })
  @Column({
    type: 'enum',
    enum: MessageStatus,
    default: MessageStatus.SENT,
  })
  status: MessageStatus;

  @ApiProperty({ enum: MessagePriority, description: 'Message priority' })
  @Column({
    type: 'enum',
    enum: MessagePriority,
    default: MessagePriority.NORMAL,
  })
  priority: MessagePriority;

  // Participants
  @ApiProperty({ description: 'Sender user ID' })
  @Column('uuid')
  @Index()
  senderId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'senderId' })
  sender: User;

  @ApiProperty({ description: 'Recipient user ID', required: false })
  @Column('uuid', { nullable: true })
  @Index()
  recipientId?: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'recipientId' })
  recipient?: User;

  @ApiProperty({ description: 'Recipient user IDs for group messages', type: [String], required: false })
  @Column('simple-array', { nullable: true })
  recipientIds?: string[];

  // Related Entities
  @ApiProperty({ description: 'Related property ID', required: false })
  @Column('uuid', { nullable: true })
  propertyId?: string;

  @ManyToOne(() => Property, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'propertyId' })
  property?: Property;

  @ApiProperty({ description: 'Related maintenance request ID', required: false })
  @Column('uuid', { nullable: true })
  maintenanceRequestId?: string;

  @ManyToOne(() => MaintenanceRequest, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'maintenanceRequestId' })
  maintenanceRequest?: MaintenanceRequest;

  @ApiProperty({ description: 'Related booking ID', required: false })
  @Column('uuid', { nullable: true })
  bookingId?: string;

  @ManyToOne(() => Booking, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'bookingId' })
  booking?: Booking;

  // Message Threading
  @ApiProperty({ description: 'Parent message ID for replies', required: false })
  @Column('uuid', { nullable: true })
  parentMessageId?: string;

  @ManyToOne(() => Message, (message) => message.replies, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parentMessageId' })
  parentMessage?: Message;

  @OneToMany(() => Message, (message) => message.parentMessage)
  replies: Message[];

  @ApiProperty({ description: 'Thread ID for message threading', required: false })
  @Column('uuid', { nullable: true })
  threadId?: string;

  // Attachments and Media
  @ApiProperty({ description: 'File attachments', type: [String], required: false })
  @Column('simple-json', { nullable: true })
  attachments?: {
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
    mimeType: string;
  }[];

  @ApiProperty({ description: 'Image URLs', type: [String], required: false })
  @Column('simple-array', { nullable: true })
  imageUrls?: string[];

  @ApiProperty({ description: 'File URLs', type: [String], required: false })
  @Column('simple-array', { nullable: true })
  fileUrls?: string[];

  // Email Integration
  @ApiProperty({ description: 'Email message ID', required: false })
  @Column({ type: 'varchar', length: 255, nullable: true })
  emailMessageId?: string;

  @ApiProperty({ description: 'Email thread ID', required: false })
  @Column({ type: 'varchar', length: 255, nullable: true })
  emailThreadId?: string;

  @ApiProperty({ description: 'Email headers', required: false })
  @Column('simple-json', { nullable: true })
  emailHeaders?: Record<string, string>;

  @ApiProperty({ description: 'Email from address', required: false })
  @Column({ type: 'varchar', length: 255, nullable: true })
  emailFrom?: string;

  @ApiProperty({ description: 'Email to addresses', type: [String], required: false })
  @Column('simple-array', { nullable: true })
  emailTo?: string[];

  @ApiProperty({ description: 'Email CC addresses', type: [String], required: false })
  @Column('simple-array', { nullable: true })
  emailCc?: string[];

  @ApiProperty({ description: 'Email BCC addresses', type: [String], required: false })
  @Column('simple-array', { nullable: true })
  emailBcc?: string[];

  // SMS Integration
  @ApiProperty({ description: 'SMS message ID', required: false })
  @Column({ type: 'varchar', length: 255, nullable: true })
  smsMessageId?: string;

  @ApiProperty({ description: 'SMS from number', required: false })
  @Column({ type: 'varchar', length: 50, nullable: true })
  smsFrom?: string;

  @ApiProperty({ description: 'SMS to number', required: false })
  @Column({ type: 'varchar', length: 50, nullable: true })
  smsTo?: string;

  @ApiProperty({ description: 'SMS status', required: false })
  @Column({ type: 'varchar', length: 50, nullable: true })
  smsStatus?: string;

  // Push Notification
  @ApiProperty({ description: 'Push notification ID', required: false })
  @Column({ type: 'varchar', length: 255, nullable: true })
  pushNotificationId?: string;

  @ApiProperty({ description: 'Push notification title', required: false })
  @Column({ type: 'varchar', length: 255, nullable: true })
  pushTitle?: string;

  @ApiProperty({ description: 'Push notification body', required: false })
  @Column('text', { nullable: true })
  pushBody?: string;

  @ApiProperty({ description: 'Push notification data', required: false })
  @Column('simple-json', { nullable: true })
  pushData?: Record<string, any>;

  // Read Status and Tracking
  @ApiProperty({ description: 'Is message read' })
  @Column({ type: 'boolean', default: false })
  @Index()
  isRead: boolean;

  @ApiProperty({ description: 'Read at timestamp', required: false })
  @Column({ type: 'timestamp', nullable: true })
  readAt?: Date;

  @ApiProperty({ description: 'Read by user IDs', type: [String], required: false })
  @Column('simple-array', { nullable: true })
  readByUserIds?: string[];

  @ApiProperty({ description: 'Delivered at timestamp', required: false })
  @Column({ type: 'timestamp', nullable: true })
  deliveredAt?: Date;

  @ApiProperty({ description: 'Failed at timestamp', required: false })
  @Column({ type: 'timestamp', nullable: true })
  failedAt?: Date;

  @ApiProperty({ description: 'Failure reason', required: false })
  @Column('text', { nullable: true })
  failureReason?: string;

  // Scheduling
  @ApiProperty({ description: 'Scheduled send time', required: false })
  @Column({ type: 'timestamp', nullable: true })
  scheduledAt?: Date;

  @ApiProperty({ description: 'Is scheduled message' })
  @Column({ type: 'boolean', default: false })
  isScheduled: boolean;

  // Flags and Status
  @ApiProperty({ description: 'Is message archived' })
  @Column({ type: 'boolean', default: false })
  @Index()
  isArchived: boolean;

  @ApiProperty({ description: 'Is message deleted' })
  @Column({ type: 'boolean', default: false })
  isDeleted: boolean;

  @ApiProperty({ description: 'Is message pinned' })
  @Column({ type: 'boolean', default: false })
  isPinned: boolean;

  @ApiProperty({ description: 'Is message starred' })
  @Column({ type: 'boolean', default: false })
  isStarred: boolean;

  @ApiProperty({ description: 'Is message flagged' })
  @Column({ type: 'boolean', default: false })
  isFlagged: boolean;

  @ApiProperty({ description: 'Is system message' })
  @Column({ type: 'boolean', default: false })
  isSystem: boolean;

  @ApiProperty({ description: 'Is automated message' })
  @Column({ type: 'boolean', default: false })
  isAutomated: boolean;

  // Notification Settings
  @ApiProperty({ description: 'Send email notification' })
  @Column({ type: 'boolean', default: true })
  sendEmailNotification: boolean;

  @ApiProperty({ description: 'Send SMS notification' })
  @Column({ type: 'boolean', default: false })
  sendSmsNotification: boolean;

  @ApiProperty({ description: 'Send push notification' })
  @Column({ type: 'boolean', default: true })
  sendPushNotification: boolean;

  // Metadata and Custom Fields
  @ApiProperty({ description: 'Message metadata', required: false })
  @Column('simple-json', { nullable: true })
  metadata?: Record<string, any>;

  @ApiProperty({ description: 'Message tags', type: [String], required: false })
  @Column('simple-array', { nullable: true })
  tags?: string[];

  @ApiProperty({ description: 'Custom fields', required: false })
  @Column('simple-json', { nullable: true })
  customFields?: Record<string, any>;

  // Analytics and Tracking
  @ApiProperty({ description: 'Message source', required: false })
  @Column({ type: 'varchar', length: 100, nullable: true })
  source?: string;

  @ApiProperty({ description: 'Message campaign ID', required: false })
  @Column('uuid', { nullable: true })
  campaignId?: string;

  @ApiProperty({ description: 'Message template ID', required: false })
  @Column('uuid', { nullable: true })
  templateId?: string;

  @ApiProperty({ description: 'Message variables', required: false })
  @Column('simple-json', { nullable: true })
  templateVariables?: Record<string, any>;

  // Audit Fields
  @ApiProperty({ description: 'Created at timestamp' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Updated at timestamp' })
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty({ description: 'Deleted at timestamp', required: false })
  @Column({ type: 'timestamp', nullable: true })
  deletedAt?: Date;

  @ApiProperty({ description: 'Archived at timestamp', required: false })
  @Column({ type: 'timestamp', nullable: true })
  archivedAt?: Date;

  // IP and User Agent for Security
  @ApiProperty({ description: 'IP address', required: false })
  @Column({ type: 'varchar', length: 45, nullable: true })
  ipAddress?: string;

  @ApiProperty({ description: 'User agent', required: false })
  @Column({ type: 'varchar', length: 500, nullable: true })
  userAgent?: string;

  // Encryption and Security
  @ApiProperty({ description: 'Is message encrypted' })
  @Column({ type: 'boolean', default: false })
  isEncrypted: boolean;

  @ApiProperty({ description: 'Encryption key ID', required: false })
  @Column({ type: 'varchar', length: 255, nullable: true })
  encryptionKeyId?: string;

  @ApiProperty({ description: 'Message hash for integrity', required: false })
  @Column({ type: 'varchar', length: 255, nullable: true })
  messageHash?: string;
}