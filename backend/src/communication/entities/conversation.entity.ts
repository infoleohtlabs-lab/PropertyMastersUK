import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinTable,
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
import { Message, ConversationType } from './message.entity';

export enum ConversationStatus {
  ACTIVE = 'active',
  ARCHIVED = 'archived',
  CLOSED = 'closed',
  MUTED = 'muted',
  BLOCKED = 'blocked',
}

export enum ConversationPrivacy {
  PUBLIC = 'public',
  PRIVATE = 'private',
  RESTRICTED = 'restricted',
}

@Entity('conversations')
@Index(['tenantOrganizationId', 'type', 'status'])
@Index(['tenantOrganizationId', 'createdById', 'createdAt'])
@Index(['tenantOrganizationId', 'isActive', 'updatedAt'])
@Index(['tenantOrganizationId', 'privacy', 'createdAt'])
export class Conversation {
  @ApiProperty({ description: 'Conversation ID' })
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
  @ApiProperty({ description: 'Conversation title' })
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @ApiProperty({ description: 'Conversation description', required: false })
  @Column('text', { nullable: true })
  description?: string;

  @ApiProperty({ enum: ConversationType, description: 'Conversation type' })
  @Column({
    type: 'varchar',
    default: ConversationType.DIRECT,
  })
  type: ConversationType;

  @ApiProperty({ enum: ConversationStatus, description: 'Conversation status' })
  @Column({
    type: 'varchar',
    default: ConversationStatus.ACTIVE,
  })
  status: ConversationStatus;

  @ApiProperty({ enum: ConversationPrivacy, description: 'Conversation privacy' })
  @Column({
    type: 'varchar',
    default: ConversationPrivacy.PRIVATE,
  })
  privacy: ConversationPrivacy;

  // Creator and Participants
  @ApiProperty({ description: 'Created by user ID' })
  @Column('uuid')
  @Index()
  createdById: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @ApiProperty({ description: 'Conversation participants', type: () => [User] })
  @ManyToMany(() => User, { cascade: true })
  @JoinTable({
    name: 'conversation_participants',
    joinColumn: { name: 'conversationId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'userId', referencedColumnName: 'id' },
  })
  participants: User[];

  @ApiProperty({ description: 'Conversation admins', type: () => [User], required: false })
  @ManyToMany(() => User)
  @JoinTable({
    name: 'conversation_admins',
    joinColumn: { name: 'conversationId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'userId', referencedColumnName: 'id' },
  })
  admins?: User[];

  @ApiProperty({ description: 'Conversation moderators', type: () => [User], required: false })
  @ManyToMany(() => User)
  @JoinTable({
    name: 'conversation_moderators',
    joinColumn: { name: 'conversationId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'userId', referencedColumnName: 'id' },
  })
  moderators?: User[];

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

  // Messages
  @OneToMany(() => Message, (message) => message.conversationId)
  messages: Message[];

  // Conversation Settings
  @ApiProperty({ description: 'Maximum participants allowed', required: false })
  @Column({ type: 'int', nullable: true })
  maxParticipants?: number;

  @ApiProperty({ description: 'Allow participants to add others' })
  @Column({ type: 'boolean', default: false })
  allowParticipantInvites: boolean;

  @ApiProperty({ description: 'Allow participants to leave' })
  @Column({ type: 'boolean', default: true })
  allowParticipantLeave: boolean;

  @ApiProperty({ description: 'Require approval for new participants' })
  @Column({ type: 'boolean', default: false })
  requireApprovalForNewParticipants: boolean;

  @ApiProperty({ description: 'Allow file sharing' })
  @Column({ type: 'boolean', default: true })
  allowFileSharing: boolean;

  @ApiProperty({ description: 'Allow image sharing' })
  @Column({ type: 'boolean', default: true })
  allowImageSharing: boolean;

  @ApiProperty({ description: 'Allow voice messages' })
  @Column({ type: 'boolean', default: true })
  allowVoiceMessages: boolean;

  @ApiProperty({ description: 'Allow video calls' })
  @Column({ type: 'boolean', default: false })
  allowVideoCalls: boolean;

  @ApiProperty({ description: 'Allow screen sharing' })
  @Column({ type: 'boolean', default: false })
  allowScreenSharing: boolean;

  // Message Retention
  @ApiProperty({ description: 'Message retention days', required: false })
  @Column({ type: 'int', nullable: true })
  messageRetentionDays?: number;

  @ApiProperty({ description: 'Auto delete messages' })
  @Column({ type: 'boolean', default: false })
  autoDeleteMessages: boolean;

  @ApiProperty({ description: 'Archive after days of inactivity', required: false })
  @Column({ type: 'int', nullable: true })
  archiveAfterInactiveDays?: number;

  // Notification Settings
  @ApiProperty({ description: 'Send email notifications' })
  @Column({ type: 'boolean', default: true })
  sendEmailNotifications: boolean;

  @ApiProperty({ description: 'Send SMS notifications' })
  @Column({ type: 'boolean', default: false })
  sendSmsNotifications: boolean;

  @ApiProperty({ description: 'Send push notifications' })
  @Column({ type: 'boolean', default: true })
  sendPushNotifications: boolean;

  @ApiProperty({ description: 'Notification frequency in minutes', required: false })
  @Column({ type: 'int', nullable: true })
  notificationFrequencyMinutes?: number;

  @ApiProperty({ description: 'Quiet hours start', required: false })
  @Column({ type: 'time', nullable: true })
  quietHoursStart?: string;

  @ApiProperty({ description: 'Quiet hours end', required: false })
  @Column({ type: 'time', nullable: true })
  quietHoursEnd?: string;

  // Statistics
  @ApiProperty({ description: 'Total message count' })
  @Column({ type: 'int', default: 0 })
  totalMessageCount: number;

  @ApiProperty({ description: 'Total participant count' })
  @Column({ type: 'int', default: 0 })
  totalParticipantCount: number;

  @ApiProperty({ description: 'Active participant count' })
  @Column({ type: 'int', default: 0 })
  activeParticipantCount: number;

  @ApiProperty({ description: 'Last message at timestamp', required: false })
  @Column({ type: 'datetime', nullable: true })
  lastMessageAt?: Date;

  @ApiProperty({ description: 'Last activity at timestamp', required: false })
  @Column({ type: 'datetime', nullable: true })
  lastActivityAt?: Date;

  // Flags and Status
  @ApiProperty({ description: 'Is conversation active' })
  @Column({ type: 'boolean', default: true })
  @Index()
  isActive: boolean;

  @ApiProperty({ description: 'Is conversation archived' })
  @Column({ type: 'boolean', default: false })
  isArchived: boolean;

  @ApiProperty({ description: 'Is conversation deleted' })
  @Column({ type: 'boolean', default: false })
  isDeleted: boolean;

  @ApiProperty({ description: 'Is conversation pinned' })
  @Column({ type: 'boolean', default: false })
  isPinned: boolean;

  @ApiProperty({ description: 'Is conversation muted' })
  @Column({ type: 'boolean', default: false })
  isMuted: boolean;

  @ApiProperty({ description: 'Is conversation read-only' })
  @Column({ type: 'boolean', default: false })
  isReadOnly: boolean;

  @ApiProperty({ description: 'Is conversation encrypted' })
  @Column({ type: 'boolean', default: false })
  isEncrypted: boolean;

  @ApiProperty({ description: 'Is conversation public' })
  @Column({ type: 'boolean', default: false })
  isPublic: boolean;

  // Avatar and Appearance
  @ApiProperty({ description: 'Conversation avatar URL', required: false })
  @Column({ type: 'varchar', length: 500, nullable: true })
  avatarUrl?: string;

  @ApiProperty({ description: 'Conversation color', required: false })
  @Column({ type: 'varchar', length: 7, nullable: true })
  color?: string;

  @ApiProperty({ description: 'Conversation emoji', required: false })
  @Column({ type: 'varchar', length: 10, nullable: true })
  emoji?: string;

  // Integration
  @ApiProperty({ description: 'External conversation ID', required: false })
  @Column({ type: 'varchar', length: 255, nullable: true })
  externalId?: string;

  @ApiProperty({ description: 'Integration source', required: false })
  @Column({ type: 'varchar', length: 100, nullable: true })
  integrationSource?: string;

  @ApiProperty({ description: 'Integration data', required: false })
  @Column('simple-json', { nullable: true })
  integrationData?: Record<string, any>;

  // Webhook and Automation
  @ApiProperty({ description: 'Webhook URL for notifications', required: false })
  @Column({ type: 'varchar', length: 500, nullable: true })
  webhookUrl?: string;

  @ApiProperty({ description: 'Auto-response enabled' })
  @Column({ type: 'boolean', default: false })
  autoResponseEnabled: boolean;

  @ApiProperty({ description: 'Auto-response message', required: false })
  @Column('text', { nullable: true })
  autoResponseMessage?: string;

  @ApiProperty({ description: 'Auto-response delay in minutes', required: false })
  @Column({ type: 'int', nullable: true })
  autoResponseDelayMinutes?: number;

  // Metadata and Custom Fields
  @ApiProperty({ description: 'Conversation metadata', required: false })
  @Column('simple-json', { nullable: true })
  metadata?: Record<string, any>;

  @ApiProperty({ description: 'Conversation tags', type: [String], required: false })
  @Column('simple-array', { nullable: true })
  tags?: string[];

  @ApiProperty({ description: 'Custom fields', required: false })
  @Column('simple-json', { nullable: true })
  customFields?: Record<string, any>;

  // Audit Fields
  @ApiProperty({ description: 'Created at timestamp' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Updated at timestamp' })
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty({ description: 'Deleted at timestamp', required: false })
  @Column({ type: 'datetime', nullable: true })
  deletedAt?: Date;

  @ApiProperty({ description: 'Archived at timestamp', required: false })
  @Column({ type: 'datetime', nullable: true })
  archivedAt?: Date;

  @ApiProperty({ description: 'Closed at timestamp', required: false })
  @Column({ type: 'datetime', nullable: true })
  closedAt?: Date;

  @ApiProperty({ description: 'Closed by user ID', required: false })
  @Column('uuid', { nullable: true })
  closedById?: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'closedById' })
  closedBy?: User;

  @ApiProperty({ description: 'Close reason', required: false })
  @Column('text', { nullable: true })
  closeReason?: string;
}
