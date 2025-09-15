import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { TenantOrganization } from '../../common/entities/tenant-organization.entity';
import { Property } from '../../properties/entities/property.entity';
import { User } from '../../users/entities/user.entity';

export enum AvailabilityType {
  AVAILABLE = 'available',
  UNAVAILABLE = 'unavailable',
  BLOCKED = 'blocked',
  MAINTENANCE = 'maintenance',
  RESERVED = 'reserved',
  HOLIDAY = 'holiday',
  PERSONAL = 'personal',
}

export enum AvailabilityRecurrenceType {
  NONE = 'none',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
  CUSTOM = 'custom',
}

export enum AvailabilityStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

@Entity('availability')
@Index(['tenantOrganizationId', 'propertyId'])
@Index(['tenantOrganizationId', 'userId'])
@Index(['tenantOrganizationId', 'type'])
@Index(['tenantOrganizationId', 'status'])
@Index(['tenantOrganizationId', 'startDateTime'])
@Index(['tenantOrganizationId', 'endDateTime'])
@Index(['tenantOrganizationId', 'isRecurring'])
@Index(['tenantOrganizationId', 'isActive'])
export class Availability {
  @ApiProperty({ description: 'Unique identifier for the availability slot' })
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
  @ApiProperty({ description: 'Availability title' })
  @Column({ length: 255 })
  title: string;

  @ApiProperty({ description: 'Availability description', required: false })
  @Column('text', { nullable: true })
  description?: string;

  @ApiProperty({ enum: AvailabilityType, description: 'Type of availability' })
  @Column({
    type: 'enum',
    enum: AvailabilityType,
    default: AvailabilityType.AVAILABLE,
  })
  type: AvailabilityType;

  @ApiProperty({ enum: AvailabilityStatus, description: 'Current status of the availability' })
  @Column({
    type: 'enum',
    enum: AvailabilityStatus,
    default: AvailabilityStatus.ACTIVE,
  })
  status: AvailabilityStatus;

  // Relationships
  @ApiProperty({ description: 'Property ID', required: false })
  @Column('uuid', { nullable: true })
  propertyId?: string;

  @ManyToOne(() => Property, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'propertyId' })
  property?: Property;

  @ApiProperty({ description: 'User ID (for staff availability)', required: false })
  @Column('uuid', { nullable: true })
  userId?: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user?: User;

  // Time and Date
  @ApiProperty({ description: 'Start date and time of availability' })
  @Column('timestamp with time zone')
  startDateTime: Date;

  @ApiProperty({ description: 'End date and time of availability' })
  @Column('timestamp with time zone')
  endDateTime: Date;

  @ApiProperty({ description: 'Duration in minutes' })
  @Column('integer')
  durationMinutes: number;

  @ApiProperty({ description: 'Timezone for the availability' })
  @Column({ length: 50, default: 'Europe/London' })
  timezone: string;

  @ApiProperty({ description: 'All day availability flag' })
  @Column('boolean', { default: false })
  isAllDay: boolean;

  // Recurrence
  @ApiProperty({ description: 'Is this a recurring availability' })
  @Column('boolean', { default: false })
  isRecurring: boolean;

  @ApiProperty({ enum: AvailabilityRecurrenceType, description: 'Recurrence pattern' })
  @Column({
    type: 'enum',
    enum: AvailabilityRecurrenceType,
    default: AvailabilityRecurrenceType.NONE,
  })
  recurrenceType: AvailabilityRecurrenceType;

  @ApiProperty({ description: 'Recurrence interval (e.g., every 2 weeks)' })
  @Column('integer', { default: 1 })
  recurrenceInterval: number;

  @ApiProperty({ description: 'Days of week for weekly recurrence', type: [Number], required: false })
  @Column('simple-array', { nullable: true })
  recurrenceDaysOfWeek?: number[];

  @ApiProperty({ description: 'Day of month for monthly recurrence', required: false })
  @Column('integer', { nullable: true })
  recurrenceDayOfMonth?: number;

  @ApiProperty({ description: 'End date for recurrence', required: false })
  @Column('timestamp with time zone', { nullable: true })
  recurrenceEndDate?: Date;

  @ApiProperty({ description: 'Maximum number of occurrences', required: false })
  @Column('integer', { nullable: true })
  recurrenceMaxOccurrences?: number;

  @ApiProperty({ description: 'Parent availability ID for recurring series', required: false })
  @Column('uuid', { nullable: true })
  parentAvailabilityId?: string;

  @ManyToOne(() => Availability, { nullable: true })
  @JoinColumn({ name: 'parentAvailabilityId' })
  parentAvailability?: Availability;

  // Booking Configuration
  @ApiProperty({ description: 'Maximum number of bookings allowed in this slot' })
  @Column('integer', { default: 1 })
  maxBookings: number;

  @ApiProperty({ description: 'Current number of bookings' })
  @Column('integer', { default: 0 })
  currentBookings: number;

  @ApiProperty({ description: 'Minimum booking duration in minutes' })
  @Column('integer', { default: 30 })
  minBookingDuration: number;

  @ApiProperty({ description: 'Maximum booking duration in minutes' })
  @Column('integer', { default: 120 })
  maxBookingDuration: number;

  @ApiProperty({ description: 'Booking slot interval in minutes' })
  @Column('integer', { default: 30 })
  slotInterval: number;

  @ApiProperty({ description: 'Buffer time before booking in minutes' })
  @Column('integer', { default: 0 })
  bufferTimeBefore: number;

  @ApiProperty({ description: 'Buffer time after booking in minutes' })
  @Column('integer', { default: 0 })
  bufferTimeAfter: number;

  // Advance Booking Rules
  @ApiProperty({ description: 'Minimum advance booking time in hours' })
  @Column('integer', { default: 1 })
  minAdvanceBookingHours: number;

  @ApiProperty({ description: 'Maximum advance booking time in days' })
  @Column('integer', { default: 30 })
  maxAdvanceBookingDays: number;

  @ApiProperty({ description: 'Cut-off time for same day bookings (HH:MM)', required: false })
  @Column({ length: 5, nullable: true })
  sameDayCutoffTime?: string;

  // Pricing and Costs
  @ApiProperty({ description: 'Base price for this availability slot', required: false })
  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  basePrice?: number;

  @ApiProperty({ description: 'Price per hour', required: false })
  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  pricePerHour?: number;

  @ApiProperty({ description: 'Additional fees', required: false })
  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  additionalFees?: number;

  @ApiProperty({ description: 'Currency code' })
  @Column({ length: 3, default: 'GBP' })
  currency: string;

  @ApiProperty({ description: 'Pricing rules', required: false })
  @Column('jsonb', { nullable: true })
  pricingRules?: Array<{
    condition: string;
    priceModifier: number;
    modifierType: 'fixed' | 'percentage';
    description?: string;
  }>;

  // Access and Requirements
  @ApiProperty({ description: 'Special access requirements', required: false })
  @Column('text', { nullable: true })
  accessRequirements?: string;

  @ApiProperty({ description: 'Equipment or resources available', type: [String], required: false })
  @Column('simple-array', { nullable: true })
  availableResources?: string[];

  @ApiProperty({ description: 'Required qualifications or permissions', type: [String], required: false })
  @Column('simple-array', { nullable: true })
  requiredQualifications?: string[];

  @ApiProperty({ description: 'Allowed booking types', type: [String], required: false })
  @Column('simple-array', { nullable: true })
  allowedBookingTypes?: string[];

  @ApiProperty({ description: 'Restricted user roles', type: [String], required: false })
  @Column('simple-array', { nullable: true })
  restrictedUserRoles?: string[];

  // Notifications and Reminders
  @ApiProperty({ description: 'Send notifications for bookings in this slot' })
  @Column('boolean', { default: true })
  sendNotifications: boolean;

  @ApiProperty({ description: 'Notification recipients', type: [String], required: false })
  @Column('simple-array', { nullable: true })
  notificationRecipients?: string[];

  @ApiProperty({ description: 'Custom notification message', required: false })
  @Column('text', { nullable: true })
  customNotificationMessage?: string;

  // Approval and Confirmation
  @ApiProperty({ description: 'Require approval for bookings in this slot' })
  @Column('boolean', { default: false })
  requireApproval: boolean;

  @ApiProperty({ description: 'Auto-approve bookings' })
  @Column('boolean', { default: true })
  autoApprove: boolean;

  @ApiProperty({ description: 'Approval workflow ID', required: false })
  @Column('uuid', { nullable: true })
  approvalWorkflowId?: string;

  @ApiProperty({ description: 'Default approver user ID', required: false })
  @Column('uuid', { nullable: true })
  defaultApproverId?: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'defaultApproverId' })
  defaultApprover?: User;

  // Capacity and Limits
  @ApiProperty({ description: 'Maximum attendees per booking' })
  @Column('integer', { default: 1 })
  maxAttendeesPerBooking: number;

  @ApiProperty({ description: 'Total capacity for this slot' })
  @Column('integer', { default: 1 })
  totalCapacity: number;

  @ApiProperty({ description: 'Current utilization count' })
  @Column('integer', { default: 0 })
  currentUtilization: number;

  @ApiProperty({ description: 'Utilization percentage' })
  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  utilizationPercentage: number;

  // Seasonal and Special Conditions
  @ApiProperty({ description: 'Seasonal availability rules', required: false })
  @Column('jsonb', { nullable: true })
  seasonalRules?: Array<{
    startDate: string;
    endDate: string;
    isAvailable: boolean;
    priceModifier?: number;
    description?: string;
  }>;

  @ApiProperty({ description: 'Holiday availability rules', required: false })
  @Column('jsonb', { nullable: true })
  holidayRules?: Array<{
    holidayName: string;
    date: string;
    isAvailable: boolean;
    priceModifier?: number;
    description?: string;
  }>;

  @ApiProperty({ description: 'Weather-dependent availability' })
  @Column('boolean', { default: false })
  isWeatherDependent: boolean;

  @ApiProperty({ description: 'Weather conditions that affect availability', type: [String], required: false })
  @Column('simple-array', { nullable: true })
  weatherConditions?: string[];

  // Integration and Sync
  @ApiProperty({ description: 'External calendar sync enabled' })
  @Column('boolean', { default: false })
  externalCalendarSync: boolean;

  @ApiProperty({ description: 'External calendar ID', required: false })
  @Column({ length: 255, nullable: true })
  externalCalendarId?: string;

  @ApiProperty({ description: 'External system reference', required: false })
  @Column({ length: 255, nullable: true })
  externalReference?: string;

  @ApiProperty({ description: 'Last sync timestamp', required: false })
  @Column('timestamp with time zone', { nullable: true })
  lastSyncAt?: Date;

  @ApiProperty({ description: 'Sync status', required: false })
  @Column({ length: 50, nullable: true })
  syncStatus?: string;

  // Flags and Settings
  @ApiProperty({ description: 'Is active availability' })
  @Column('boolean', { default: true })
  isActive: boolean;

  @ApiProperty({ description: 'Is public availability' })
  @Column('boolean', { default: true })
  isPublic: boolean;

  @ApiProperty({ description: 'Is emergency availability' })
  @Column('boolean', { default: false })
  isEmergency: boolean;

  @ApiProperty({ description: 'Allow overbooking' })
  @Column('boolean', { default: false })
  allowOverbooking: boolean;

  @ApiProperty({ description: 'Allow partial bookings' })
  @Column('boolean', { default: true })
  allowPartialBookings: boolean;

  @ApiProperty({ description: 'Allow back-to-back bookings' })
  @Column('boolean', { default: true })
  allowBackToBackBookings: boolean;

  // Analytics and Tracking
  @ApiProperty({ description: 'Total bookings made in this slot' })
  @Column('integer', { default: 0 })
  totalBookingsMade: number;

  @ApiProperty({ description: 'Total bookings cancelled' })
  @Column('integer', { default: 0 })
  totalBookingsCancelled: number;

  @ApiProperty({ description: 'Total no-shows' })
  @Column('integer', { default: 0 })
  totalNoShows: number;

  @ApiProperty({ description: 'Average booking duration in minutes' })
  @Column('decimal', { precision: 8, scale: 2, default: 0 })
  averageBookingDuration: number;

  @ApiProperty({ description: 'Revenue generated from this slot', required: false })
  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  revenueGenerated?: number;

  @ApiProperty({ description: 'Last booking date', required: false })
  @Column('timestamp with time zone', { nullable: true })
  lastBookingDate?: Date;

  // Metadata and Custom Fields
  @ApiProperty({ description: 'Availability tags', type: [String], required: false })
  @Column('simple-array', { nullable: true })
  tags?: string[];

  @ApiProperty({ description: 'Custom fields', required: false })
  @Column('jsonb', { nullable: true })
  customFields?: Record<string, any>;

  @ApiProperty({ description: 'Additional metadata', required: false })
  @Column('jsonb', { nullable: true })
  metadata?: Record<string, any>;

  // Audit Fields
  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty({ description: 'User who created the availability' })
  @Column('uuid')
  createdBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdBy' })
  creator: User;

  @ApiProperty({ description: 'User who last updated the availability', required: false })
  @Column('uuid', { nullable: true })
  updatedBy?: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'updatedBy' })
  updater?: User;

  @ApiProperty({ description: 'Soft delete timestamp', required: false })
  @Column('timestamp with time zone', { nullable: true })
  deletedAt?: Date;

  @ApiProperty({ description: 'User who deleted the availability', required: false })
  @Column('uuid', { nullable: true })
  deletedBy?: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'deletedBy' })
  deleter?: User;
}