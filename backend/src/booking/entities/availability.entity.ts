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
import { Property } from '../../properties/entities/property.entity';
import { TenantOrganization } from '../../common/entities/tenant-organization.entity';

export enum AvailabilityType {
  AVAILABLE = 'available',
  BLOCKED = 'blocked',
  BUSY = 'busy',
  TENTATIVE = 'tentative',
}

export enum RecurrenceType {
  NONE = 'none',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

export enum DayOfWeek {
  SUNDAY = 0,
  MONDAY = 1,
  TUESDAY = 2,
  WEDNESDAY = 3,
  THURSDAY = 4,
  FRIDAY = 5,
  SATURDAY = 6,
}

@Entity('availability')
@Index(['tenantOrganizationId', 'type'])
@Index(['tenantOrganizationId', 'startTime', 'endTime'])
@Index(['propertyId', 'startTime', 'endTime'])
@Index(['userId', 'startTime', 'endTime'])
export class Availability {
  @ApiProperty({ description: 'Unique identifier for the availability slot' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Multi-tenancy
  @ApiProperty({ description: 'Tenant organization ID for multi-tenancy' })
  @Column('uuid')
  @Index()
  tenantOrganizationId: string;

  @ManyToOne(() => TenantOrganization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenantOrganizationId' })
  tenantOrganization: TenantOrganization;

  // Availability Details
  @ApiProperty({ description: 'Type of availability', enum: AvailabilityType })
  @Column({
    type: 'varchar',
    default: AvailabilityType.AVAILABLE,
  })
  type: AvailabilityType;

  @ApiProperty({ description: 'Title or description of the availability slot' })
  @Column({ length: 255 })
  title: string;

  @ApiProperty({ description: 'Detailed description', required: false })
  @Column('text', { nullable: true })
  description?: string;

  // Time Range
  @ApiProperty({ description: 'Start time of the availability slot' })
  @Column('datetime')
  startTime: Date;

  @ApiProperty({ description: 'End time of the availability slot' })
  @Column('datetime')
  endTime: Date;

  @ApiProperty({ description: 'Whether this is an all-day availability' })
  @Column('boolean', { default: false })
  isAllDay: boolean;

  // Relationships
  @ApiProperty({ description: 'ID of the user this availability belongs to', required: false })
  @Column('uuid', { nullable: true })
  userId?: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user?: User;

  @ApiProperty({ description: 'ID of the property this availability is for', required: false })
  @Column('uuid', { nullable: true })
  propertyId?: string;

  @ManyToOne(() => Property, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'propertyId' })
  property?: Property;

  // Recurrence
  @ApiProperty({ description: 'Type of recurrence', enum: RecurrenceType })
  @Column({
    type: 'varchar',
    default: RecurrenceType.NONE,
  })
  recurrenceType: RecurrenceType;

  @ApiProperty({ description: 'Interval for recurrence (e.g., every 2 weeks)' })
  @Column('int', { default: 1 })
  recurrenceInterval: number;

  @ApiProperty({ description: 'Days of week for weekly recurrence', required: false })
  @Column('int', { array: true, nullable: true })
  recurrenceDays?: DayOfWeek[];

  @ApiProperty({ description: 'End date for recurrence', required: false })
  @Column('datetime', { nullable: true })
  recurrenceEndDate?: Date;

  @ApiProperty({ description: 'Maximum number of occurrences', required: false })
  @Column('int', { nullable: true })
  recurrenceCount?: number;

  // Booking Constraints
  @ApiProperty({ description: 'Minimum duration for bookings in minutes' })
  @Column('int', { default: 30 })
  minBookingDuration: number;

  @ApiProperty({ description: 'Maximum duration for bookings in minutes' })
  @Column('int', { default: 180 })
  maxBookingDuration: number;

  @ApiProperty({ description: 'Time slot interval in minutes' })
  @Column('int', { default: 30 })
  slotInterval: number;

  @ApiProperty({ description: 'Buffer time before bookings in minutes' })
  @Column('int', { default: 0 })
  bufferBefore: number;

  @ApiProperty({ description: 'Buffer time after bookings in minutes' })
  @Column('int', { default: 0 })
  bufferAfter: number;

  @ApiProperty({ description: 'Maximum number of concurrent bookings' })
  @Column('int', { default: 1 })
  maxConcurrentBookings: number;

  // Advance Booking Rules
  @ApiProperty({ description: 'Minimum advance notice required in hours' })
  @Column('int', { default: 24 })
  minAdvanceHours: number;

  @ApiProperty({ description: 'Maximum advance booking allowed in days' })
  @Column('int', { default: 90 })
  maxAdvanceDays: number;

  // Pricing (if applicable)
  @ApiProperty({ description: 'Cost per hour for this time slot', required: false })
  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  hourlyRate?: number;

  @ApiProperty({ description: 'Fixed cost for this time slot', required: false })
  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  fixedCost?: number;

  // Status and Flags
  @ApiProperty({ description: 'Whether this availability is currently active' })
  @Column('boolean', { default: true })
  isActive: boolean;

  @ApiProperty({ description: 'Whether this availability is published/visible' })
  @Column('boolean', { default: true })
  isPublished: boolean;

  @ApiProperty({ description: 'Whether bookings require approval' })
  @Column('boolean', { default: false })
  requiresApproval: boolean;

  @ApiProperty({ description: 'Whether this is a holiday or special day' })
  @Column('boolean', { default: false })
  isHoliday: boolean;

  // Override Information
  @ApiProperty({ description: 'Parent availability ID if this is an override', required: false })
  @Column('uuid', { nullable: true })
  parentAvailabilityId?: string;

  @ManyToOne(() => Availability, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parentAvailabilityId' })
  parentAvailability?: Availability;

  @ApiProperty({ description: 'Whether this overrides the parent availability' })
  @Column('boolean', { default: false })
  isOverride: boolean;

  // Metadata
  @ApiProperty({ description: 'Additional metadata as JSON', required: false })
  @Column('text', { nullable: true })
  metadata?: Record<string, any>;

  @ApiProperty({ description: 'Tags for categorization', required: false })
  @Column('text', { array: true, nullable: true })
  tags?: string[];

  // Notifications
  @ApiProperty({ description: 'Whether to send notifications for bookings' })
  @Column('boolean', { default: true })
  enableNotifications: boolean;

  @ApiProperty({ description: 'Email template for notifications', required: false })
  @Column({ length: 100, nullable: true })
  notificationTemplate?: string;

  // Timestamps
  @ApiProperty({ description: 'When the availability was created' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'When the availability was last updated' })
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty({ description: 'Who created this availability' })
  @Column('uuid')
  createdById: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'createdById' })
  createdBy: User;
}
