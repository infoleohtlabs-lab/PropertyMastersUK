import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Property } from './property.entity';
import { User } from '../../users/entities/user.entity';
import { Booking } from '../../booking/entities/booking.entity';

export enum ViewingType {
  PHYSICAL = 'physical',
  VIRTUAL = 'virtual',
  VIDEO_CALL = 'video_call',
  SELF_GUIDED = 'self_guided',
}

export enum ViewingStatus {
  SCHEDULED = 'scheduled',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
  RESCHEDULED = 'rescheduled',
}

@Entity('property_viewings')
export class PropertyViewing {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column()
  viewingNumber: string; // Auto-generated unique number

  @ApiProperty({ enum: ViewingType })
  @Column({
    type: 'varchar',
    
    default: ViewingType.PHYSICAL,
  })
  type: ViewingType;

  @ApiProperty({ enum: ViewingStatus })
  @Column({
    type: 'varchar',
    
    default: ViewingStatus.SCHEDULED,
  })
  status: ViewingStatus;

  @ApiProperty()
  @Column()
  scheduledDate: Date;

  @ApiProperty()
  @Column('time')
  scheduledTime: string;

  @ApiProperty()
  @Column({ default: 30 }) // in minutes
  duration: number;

  @ApiProperty()
  @Column({ nullable: true })
  actualStartTime: Date;

  @ApiProperty()
  @Column({ nullable: true })
  actualEndTime: Date;

  @ApiProperty()
  @Column('text', { nullable: true })
  notes: string;

  @ApiProperty()
  @Column('text', { nullable: true })
  specialRequirements: string;

  @ApiProperty()
  @Column({ nullable: true })
  contactPhone: string;

  @ApiProperty()
  @Column({ nullable: true })
  contactEmail: string;

  @ApiProperty()
  @Column({ default: false })
  reminderSent: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  reminderSentAt: Date;

  @ApiProperty()
  @Column({ default: false })
  confirmationSent: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  confirmationSentAt: Date;

  @ApiProperty()
  @Column({ nullable: true })
  confirmedAt: Date;

  @ApiProperty()
  @Column({ nullable: true })
  completedAt: Date;

  @ApiProperty()
  @Column({ nullable: true })
  cancelledAt: Date;

  @ApiProperty()
  @Column('text', { nullable: true })
  cancellationReason: string;

  @ApiProperty()
  @Column({ nullable: true })
  rescheduledAt: Date;

  @ApiProperty()
  @Column('uuid', { nullable: true })
  rescheduledFromId: string;

  // Virtual Viewing Specific
  @ApiProperty()
  @Column({ nullable: true })
  virtualTourUrl: string;

  @ApiProperty()
  @Column({ nullable: true })
  meetingLink: string;

  @ApiProperty()
  @Column({ nullable: true })
  meetingId: string;

  @ApiProperty()
  @Column({ nullable: true })
  meetingPassword: string;

  @ApiProperty()
  @Column({ default: false })
  recordingEnabled: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  recordingUrl: string;

  // Feedback
  @ApiProperty()
  @Column('text', { nullable: true })
  viewerFeedback: string;

  @ApiProperty()
  @Column({ nullable: true })
  viewerRating: number; // 1-5

  @ApiProperty()
  @Column('text', { nullable: true })
  agentNotes: string;

  @ApiProperty()
  @Column({ nullable: true })
  agentRating: number; // 1-5

  @ApiProperty()
  @Column({ default: false })
  interestExpressed: boolean;

  @ApiProperty()
  @Column('text', { nullable: true })
  interestLevel: string; // high, medium, low

  @ApiProperty()
  @Column({ default: false })
  followUpRequired: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  followUpDate: Date;

  @ApiProperty()
  @Column('text', { nullable: true })
  followUpNotes: string;

  // Attendees
  @ApiProperty()
  @Column('simple-array', { nullable: true })
  attendeeNames: string[];

  @ApiProperty()
  @Column('simple-array', { nullable: true })
  attendeeEmails: string[];

  @ApiProperty()
  @Column('simple-array', { nullable: true })
  attendeePhones: string[];

  @ApiProperty()
  @Column({ nullable: true })
  numberOfAttendees: number;

  // Access Details
  @ApiProperty()
  @Column('text', { nullable: true })
  accessInstructions: string;

  @ApiProperty()
  @Column({ nullable: true })
  keyLocation: string;

  @ApiProperty()
  @Column({ nullable: true })
  accessCode: string;

  @ApiProperty()
  @Column({ default: false })
  escortRequired: boolean;

  // Marketing
  @ApiProperty()
  @Column('simple-array', { nullable: true })
  marketingSource: string[]; // website, rightmove, zoopla, etc.

  @ApiProperty()
  @Column({ nullable: true })
  referralSource: string;

  // Relationships
  @ApiProperty()
  @Column('uuid')
  propertyId: string;

  @ManyToOne(() => Property, property => property.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'propertyId' })
  property: Property;

  @ApiProperty()
  @Column('uuid')
  viewerId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'viewerId' })
  viewer: User;

  @ApiProperty()
  @Column('uuid')
  agentId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'agentId' })
  agent: User;

  @ApiProperty()
  @Column('uuid', { nullable: true })
  bookingId: string;

  @ManyToOne(() => Booking)
  @JoinColumn({ name: 'bookingId' })
  booking: Booking;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
