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
import { Property } from '../../properties/entities/property.entity';
import { User } from '../../users/entities/user.entity';
import { Payment } from '../../payments/entities/payment.entity';
import { MaintenanceRequest } from '../../maintenance/entities/maintenance-request.entity';
import { Message } from '../../communication/entities/message.entity';

export enum BookingType {
  VIEWING = 'viewing',
  INSPECTION = 'inspection',
  MAINTENANCE = 'maintenance',
  CLEANING = 'cleaning',
  PHOTOGRAPHY = 'photography',
  VALUATION = 'valuation',
  CHECK_IN = 'check_in',
  CHECK_OUT = 'check_out',
  EMERGENCY = 'emergency',
  MEETING = 'meeting',
  OTHER = 'other',
}

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
  RESCHEDULED = 'rescheduled',
}

export enum BookingPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
  EMERGENCY = 'emergency',
}

export enum BookingRecurrenceType {
  NONE = 'none',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
  CUSTOM = 'custom',
}

export enum BookingAccessType {
  ACCOMPANIED = 'accompanied',
  UNACCOMPANIED = 'unaccompanied',
  KEY_COLLECTION = 'key_collection',
  LOCKBOX = 'lockbox',
  SMART_LOCK = 'smart_lock',
  CONCIERGE = 'concierge',
}

@Entity('bookings')
@Index(['tenantOrganizationId', 'propertyId'])
@Index(['tenantOrganizationId', 'bookedById'])
@Index(['tenantOrganizationId', 'assignedToId'])
@Index(['tenantOrganizationId', 'type'])
@Index(['tenantOrganizationId', 'status'])
@Index(['tenantOrganizationId', 'startDateTime'])
@Index(['tenantOrganizationId', 'endDateTime'])
@Index(['tenantOrganizationId', 'isRecurring'])
@Index(['tenantOrganizationId', 'isActive'])
@Index(['tenantOrganizationId', 'isEmergency'])
export class Booking {
  @ApiProperty({ description: 'Unique identifier for the booking' })
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
  @ApiProperty({ description: 'Booking reference number' })
  @Column({ length: 50, unique: true })
  @Index()
  referenceNumber: string;

  @ApiProperty({ description: 'Booking title' })
  @Column({ length: 255 })
  title: string;

  @ApiProperty({ description: 'Booking description', required: false })
  @Column('text', { nullable: true })
  description?: string;

  @ApiProperty({ enum: BookingType, description: 'Type of booking' })
  @Column({
    type: 'varchar',
    default: BookingType.VIEWING,
  })
  type: BookingType;

  @ApiProperty({ enum: BookingStatus, description: 'Current status of the booking' })
  @Column({
    type: 'varchar',
    default: BookingStatus.PENDING,
  })
  status: BookingStatus;

  @ApiProperty({ enum: BookingPriority, description: 'Priority level of the booking' })
  @Column({
    type: 'varchar',
    default: BookingPriority.MEDIUM,
  })
  priority: BookingPriority;

  // Relationships
  @ApiProperty({ description: 'Property ID' })
  @Column('uuid')
  propertyId: string;

  @ManyToOne(() => Property, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'propertyId' })
  property: Property;

  @ApiProperty({ description: 'User who booked the appointment' })
  @Column('uuid')
  bookedById: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'bookedById' })
  bookedBy: User;

  @ApiProperty({ description: 'User assigned to handle the booking', required: false })
  @Column('uuid', { nullable: true })
  assignedToId?: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assignedToId' })
  assignedTo?: User;

  @ApiProperty({ description: 'Related maintenance request ID', required: false })
  @Column('uuid', { nullable: true })
  maintenanceRequestId?: string;

  @ManyToOne(() => MaintenanceRequest, { nullable: true })
  @JoinColumn({ name: 'maintenanceRequestId' })
  maintenanceRequest?: MaintenanceRequest;

  // Scheduling
  @ApiProperty({ description: 'Start date and time of the booking' })
  @Column('datetime')
  startDateTime: Date;

  @ApiProperty({ description: 'End date and time of the booking' })
  @Column('datetime')
  endDateTime: Date;

  @ApiProperty({ description: 'Duration in minutes' })
  @Column('integer')
  durationMinutes: number;

  @ApiProperty({ description: 'Timezone for the booking' })
  @Column({ length: 50, default: 'Europe/London' })
  timezone: string;

  @ApiProperty({ description: 'All day booking flag' })
  @Column('boolean', { default: false })
  isAllDay: boolean;

  // Recurrence
  @ApiProperty({ description: 'Is this a recurring booking' })
  @Column('boolean', { default: false })
  isRecurring: boolean;

  @ApiProperty({ enum: BookingRecurrenceType, description: 'Recurrence pattern' })
  @Column({
    type: 'varchar',
    default: BookingRecurrenceType.NONE,
  })
  recurrenceType: BookingRecurrenceType;

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
  @Column('datetime', { nullable: true })
  recurrenceEndDate?: Date;

  @ApiProperty({ description: 'Maximum number of occurrences', required: false })
  @Column('integer', { nullable: true })
  recurrenceMaxOccurrences?: number;

  @ApiProperty({ description: 'Parent booking ID for recurring series', required: false })
  @Column('uuid', { nullable: true })
  parentBookingId?: string;

  @ManyToOne(() => Booking, { nullable: true })
  @JoinColumn({ name: 'parentBookingId' })
  parentBooking?: Booking;

  @OneToMany(() => Booking, booking => booking.parentBooking)
  childBookings: Booking[];

  // Contact Information
  @ApiProperty({ description: 'Contact person name' })
  @Column({ length: 255 })
  contactName: string;

  @ApiProperty({ description: 'Contact person email' })
  @Column({ length: 255 })
  contactEmail: string;

  @ApiProperty({ description: 'Contact person phone' })
  @Column({ length: 50 })
  contactPhone: string;

  @ApiProperty({ description: 'Alternative contact phone', required: false })
  @Column({ length: 50, nullable: true })
  alternativeContactPhone?: string;

  @ApiProperty({ description: 'Emergency contact name', required: false })
  @Column({ length: 255, nullable: true })
  emergencyContactName?: string;

  @ApiProperty({ description: 'Emergency contact phone', required: false })
  @Column({ length: 50, nullable: true })
  emergencyContactPhone?: string;

  // Access and Security
  @ApiProperty({ enum: BookingAccessType, description: 'Type of property access' })
  @Column({
    type: 'varchar',
    default: BookingAccessType.ACCOMPANIED,
  })
  accessType: BookingAccessType;

  @ApiProperty({ description: 'Key collection location', required: false })
  @Column({ length: 500, nullable: true })
  keyCollectionLocation?: string;

  @ApiProperty({ description: 'Access instructions', required: false })
  @Column('text', { nullable: true })
  accessInstructions?: string;

  @ApiProperty({ description: 'Security code or lockbox code', required: false })
  @Column({ length: 100, nullable: true })
  securityCode?: string;

  @ApiProperty({ description: 'Parking instructions', required: false })
  @Column('text', { nullable: true })
  parkingInstructions?: string;

  // Requirements and Preferences
  @ApiProperty({ description: 'Special requirements', required: false })
  @Column('text', { nullable: true })
  specialRequirements?: string;

  @ApiProperty({ description: 'Equipment needed', type: [String], required: false })
  @Column('simple-array', { nullable: true })
  equipmentNeeded?: string[];

  @ApiProperty({ description: 'Number of attendees expected' })
  @Column('integer', { default: 1 })
  expectedAttendees: number;

  @ApiProperty({ description: 'Accessibility requirements', required: false })
  @Column('text', { nullable: true })
  accessibilityRequirements?: string;

  @ApiProperty({ description: 'Language preferences', type: [String], required: false })
  @Column('simple-array', { nullable: true })
  languagePreferences?: string[];

  // Confirmation and Reminders
  @ApiProperty({ description: 'Booking confirmed date', required: false })
  @Column('datetime', { nullable: true })
  confirmedAt?: Date;

  @ApiProperty({ description: 'User who confirmed the booking', required: false })
  @Column('uuid', { nullable: true })
  confirmedById?: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'confirmedById' })
  confirmedBy?: User;

  @ApiProperty({ description: 'Confirmation method used', required: false })
  @Column({ length: 50, nullable: true })
  confirmationMethod?: string;

  @ApiProperty({ description: 'Send reminder notifications' })
  @Column('boolean', { default: true })
  sendReminders: boolean;

  @ApiProperty({ description: 'Reminder intervals in minutes', type: [Number], required: false })
  @Column('simple-array', { nullable: true })
  reminderIntervals?: number[];

  @ApiProperty({ description: 'Last reminder sent date', required: false })
  @Column('datetime', { nullable: true })
  lastReminderSentAt?: Date;

  // Check-in/Check-out
  @ApiProperty({ description: 'Actual check-in time', required: false })
  @Column('datetime', { nullable: true })
  actualStartTime?: Date;

  @ApiProperty({ description: 'Actual check-out time', required: false })
  @Column('datetime', { nullable: true })
  actualEndTime?: Date;

  @ApiProperty({ description: 'Check-in notes', required: false })
  @Column('text', { nullable: true })
  checkInNotes?: string;

  @ApiProperty({ description: 'Check-out notes', required: false })
  @Column('text', { nullable: true })
  checkOutNotes?: string;

  @ApiProperty({ description: 'No-show reason', required: false })
  @Column('text', { nullable: true })
  noShowReason?: string;

  // Feedback and Rating
  @ApiProperty({ description: 'Customer feedback', required: false })
  @Column('text', { nullable: true })
  customerFeedback?: string;

  @ApiProperty({ description: 'Customer rating (1-5)', required: false })
  @Column('decimal', { precision: 2, scale: 1, nullable: true })
  customerRating?: number;

  @ApiProperty({ description: 'Staff feedback', required: false })
  @Column('text', { nullable: true })
  staffFeedback?: string;

  @ApiProperty({ description: 'Staff rating (1-5)', required: false })
  @Column('decimal', { precision: 2, scale: 1, nullable: true })
  staffRating?: number;

  // Cost and Billing
  @ApiProperty({ description: 'Booking fee amount', required: false })
  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  bookingFee?: number;

  @ApiProperty({ description: 'Additional charges', required: false })
  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  additionalCharges?: number;

  @ApiProperty({ description: 'Total cost', required: false })
  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  totalCost?: number;

  @ApiProperty({ description: 'Currency code' })
  @Column({ length: 3, default: 'GBP' })
  currency: string;

  @ApiProperty({ description: 'Payment required flag' })
  @Column('boolean', { default: false })
  paymentRequired: boolean;

  @ApiProperty({ description: 'Payment status', required: false })
  @Column({ length: 50, nullable: true })
  paymentStatus?: string;

  // Documents and Attachments
  @ApiProperty({ description: 'Attached documents', type: [String], required: false })
  @Column('simple-array', { nullable: true })
  attachments?: string[];

  @ApiProperty({ description: 'Photos taken during booking', type: [String], required: false })
  @Column('simple-array', { nullable: true })
  photos?: string[];

  @ApiProperty({ description: 'Digital signatures', type: [String], required: false })
  @Column('simple-array', { nullable: true })
  signatures?: string[];

  @ApiProperty({ description: 'Generated reports', type: [String], required: false })
  @Column('simple-array', { nullable: true })
  reports?: string[];

  // Status Tracking
  @ApiProperty({ description: 'Status history', required: false })
  @Column('text', { nullable: true })
  statusHistory?: Array<{
    status: BookingStatus;
    changedAt: Date;
    changedBy: string;
    reason?: string;
    notes?: string;
  }>;

  @ApiProperty({ description: 'Assignment history', required: false })
  @Column('text', { nullable: true })
  assignmentHistory?: Array<{
    assignedTo: string;
    assignedBy: string;
    assignedAt: Date;
    reason?: string;
  }>;

  // Integration and External References
  @ApiProperty({ description: 'External calendar event ID', required: false })
  @Column({ length: 255, nullable: true })
  externalCalendarEventId?: string;

  @ApiProperty({ description: 'External system reference', required: false })
  @Column({ length: 255, nullable: true })
  externalReference?: string;

  @ApiProperty({ description: 'Integration metadata', required: false })
  @Column('text', { nullable: true })
  integrationMetadata?: Record<string, any>;

  // Flags and Settings
  @ApiProperty({ description: 'Is emergency booking' })
  @Column('boolean', { default: false })
  isEmergency: boolean;

  @ApiProperty({ description: 'Is active booking' })
  @Column('boolean', { default: true })
  isActive: boolean;

  @ApiProperty({ description: 'Is private booking' })
  @Column('boolean', { default: false })
  isPrivate: boolean;

  @ApiProperty({ description: 'Allow rescheduling' })
  @Column('boolean', { default: true })
  allowRescheduling: boolean;

  @ApiProperty({ description: 'Allow cancellation' })
  @Column('boolean', { default: true })
  allowCancellation: boolean;

  @ApiProperty({ description: 'Require confirmation' })
  @Column('boolean', { default: true })
  requireConfirmation: boolean;

  @ApiProperty({ description: 'Auto-confirm booking' })
  @Column('boolean', { default: false })
  autoConfirm: boolean;

  // Metadata and Custom Fields
  @ApiProperty({ description: 'Booking tags', type: [String], required: false })
  @Column('simple-array', { nullable: true })
  tags?: string[];

  @ApiProperty({ description: 'Custom fields', required: false })
  @Column('text', { nullable: true })
  customFields?: Record<string, any>;

  @ApiProperty({ description: 'Additional metadata', required: false })
  @Column('text', { nullable: true })
  metadata?: Record<string, any>;

  // Audit Fields
  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty({ description: 'User who created the booking' })
  @Column('uuid')
  createdBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdBy' })
  creator: User;

  @ApiProperty({ description: 'User who last updated the booking', required: false })
  @Column('uuid', { nullable: true })
  updatedBy?: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'updatedBy' })
  updater?: User;

  @ApiProperty({ description: 'Soft delete timestamp', required: false })
  @Column('datetime', { nullable: true })
  deletedAt?: Date;

  @ApiProperty({ description: 'User who deleted the booking', required: false })
  @Column('uuid', { nullable: true })
  deletedBy?: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'deletedBy' })
  deleter?: User;

  // IP and User Agent for Audit
  @ApiProperty({ description: 'IP address of the user who created the booking', required: false })
  @Column({ length: 45, nullable: true })
  createdFromIp?: string;

  @ApiProperty({ description: 'User agent of the user who created the booking', required: false })
  @Column('text', { nullable: true })
  createdFromUserAgent?: string;

  // Relationships
  @OneToMany(() => Payment, payment => payment.booking)
  payments: Payment[];

  @OneToMany(() => Message, message => message.booking)
  messages: Message[];
}
