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

export enum BookingType {
  VIEWING = 'viewing',
  INSPECTION = 'inspection',
  MAINTENANCE = 'maintenance',
  MEETING = 'meeting',
  CHECKOUT = 'checkout',
  CHECKIN = 'checkin',
  VALUATION = 'valuation',
  PHOTOGRAPHY = 'photography',
}

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
  NO_SHOW = 'no_show',
  RESCHEDULED = 'rescheduled',
}

export enum BookingPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

@Entity('bookings')
@Index(['tenantOrganizationId', 'status'])
@Index(['tenantOrganizationId', 'type'])
@Index(['tenantOrganizationId', 'scheduledAt'])
@Index(['propertyId', 'scheduledAt'])
@Index(['bookedById', 'scheduledAt'])
export class Booking {
  @ApiProperty({ description: 'Unique identifier for the booking' })
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

  // Booking Details
  @ApiProperty({ description: 'Type of booking', enum: BookingType })
  @Column({
    type: 'enum',
    enum: BookingType,
    default: BookingType.VIEWING,
  })
  type: BookingType;

  @ApiProperty({ description: 'Current status of the booking', enum: BookingStatus })
  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.PENDING,
  })
  status: BookingStatus;

  @ApiProperty({ description: 'Priority level of the booking', enum: BookingPriority })
  @Column({
    type: 'enum',
    enum: BookingPriority,
    default: BookingPriority.MEDIUM,
  })
  priority: BookingPriority;

  @ApiProperty({ description: 'Title or subject of the booking' })
  @Column({ length: 255 })
  title: string;

  @ApiProperty({ description: 'Detailed description of the booking', required: false })
  @Column('text', { nullable: true })
  description?: string;

  // Scheduling
  @ApiProperty({ description: 'Scheduled date and time for the booking' })
  @Column('timestamp with time zone')
  scheduledAt: Date;

  @ApiProperty({ description: 'Expected duration in minutes' })
  @Column('int', { default: 60 })
  durationMinutes: number;

  @ApiProperty({ description: 'End time calculated from scheduledAt + duration' })
  @Column('timestamp with time zone', { nullable: true })
  endTime?: Date;

  // Relationships
  @ApiProperty({ description: 'ID of the user who made the booking' })
  @Column('uuid')
  bookedById: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'bookedById' })
  bookedBy: User;

  @ApiProperty({ description: 'ID of the property being booked' })
  @Column('uuid')
  propertyId: string;

  @ManyToOne(() => Property, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'propertyId' })
  property: Property;

  @ApiProperty({ description: 'ID of the assigned agent/staff member', required: false })
  @Column('uuid', { nullable: true })
  assignedToId?: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'assignedToId' })
  assignedTo?: User;

  // Contact Information
  @ApiProperty({ description: 'Contact name for the booking' })
  @Column({ length: 255 })
  contactName: string;

  @ApiProperty({ description: 'Contact email for the booking' })
  @Column({ length: 255 })
  contactEmail: string;

  @ApiProperty({ description: 'Contact phone number for the booking' })
  @Column({ length: 50 })
  contactPhone: string;

  // Additional Details
  @ApiProperty({ description: 'Number of attendees expected' })
  @Column('int', { default: 1 })
  attendeeCount: number;

  @ApiProperty({ description: 'Special requirements or notes', required: false })
  @Column('text', { nullable: true })
  specialRequirements?: string;

  @ApiProperty({ description: 'Internal notes for staff', required: false })
  @Column('text', { nullable: true })
  internalNotes?: string;

  // Confirmation and Communication
  @ApiProperty({ description: 'Whether confirmation email was sent' })
  @Column('boolean', { default: false })
  confirmationSent: boolean;

  @ApiProperty({ description: 'Whether reminder was sent' })
  @Column('boolean', { default: false })
  reminderSent: boolean;

  @ApiProperty({ description: 'Confirmation code for the booking', required: false })
  @Column({ length: 50, nullable: true })
  confirmationCode?: string;

  // Cancellation
  @ApiProperty({ description: 'Reason for cancellation', required: false })
  @Column('text', { nullable: true })
  cancellationReason?: string;

  @ApiProperty({ description: 'When the booking was cancelled', required: false })
  @Column('timestamp with time zone', { nullable: true })
  cancelledAt?: Date;

  @ApiProperty({ description: 'Who cancelled the booking', required: false })
  @Column('uuid', { nullable: true })
  cancelledById?: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'cancelledById' })
  cancelledBy?: User;

  // Completion
  @ApiProperty({ description: 'When the booking was completed', required: false })
  @Column('timestamp with time zone', { nullable: true })
  completedAt?: Date;

  @ApiProperty({ description: 'Feedback or outcome notes', required: false })
  @Column('text', { nullable: true })
  outcome?: string;

  @ApiProperty({ description: 'Rating given for the booking (1-5)', required: false })
  @Column('int', { nullable: true })
  rating?: number;

  // Metadata
  @ApiProperty({ description: 'Additional metadata as JSON', required: false })
  @Column('jsonb', { nullable: true })
  metadata?: Record<string, any>;

  // Recurring Booking
  @ApiProperty({ description: 'Parent booking ID for recurring bookings', required: false })
  @Column('uuid', { nullable: true })
  parentBookingId?: string;

  @ManyToOne(() => Booking, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parentBookingId' })
  parentBooking?: Booking;

  @ApiProperty({ description: 'Recurrence pattern (daily, weekly, monthly)', required: false })
  @Column({ length: 50, nullable: true })
  recurrencePattern?: string;

  @ApiProperty({ description: 'End date for recurring bookings', required: false })
  @Column('timestamp with time zone', { nullable: true })
  recurrenceEndDate?: Date;

  // Timestamps
  @ApiProperty({ description: 'When the booking was created' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'When the booking was last updated' })
  @UpdateDateColumn()
  updatedAt: Date;
}
