import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Property } from '../../../properties/entities/property.entity';
import { User } from '../../../users/entities/user.entity';

export enum BookingType {
  VIEWING = 'viewing',
  INSPECTION = 'inspection',
  VALUATION = 'valuation',
  SURVEY = 'survey',
  CONSULTATION = 'consultation',
}

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
}

export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

@Entity('integration_bookings')
export class Booking {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ enum: BookingType })
  @Column({
    type: 'varchar',
    
  })
  type: BookingType;

  @ApiProperty({ enum: BookingStatus })
  @Column({
    type: 'varchar',
    
    default: BookingStatus.PENDING,
  })
  status: BookingStatus;

  @ApiProperty()
  @Column('uuid')
  propertyId: string;

  @ManyToOne(() => Property)
  @JoinColumn({ name: 'propertyId' })
  property: Property;

  @ApiProperty()
  @Column('uuid')
  agentId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'agentId' })
  agent: User;

  @ApiProperty()
  @Column('uuid')
  clientId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'clientId' })
  client: User;

  @ApiProperty()
  @Column('date')
  scheduledDate: Date;

  @ApiProperty()
  @Column('time')
  scheduledTime: string;

  @ApiProperty()
  @Column('int')
  duration: number; // Duration in minutes

  @ApiProperty()
  @Column('text', { nullable: true })
  notes: string;

  @ApiProperty()
  @Column('simple-array', { nullable: true })
  requirements: string[];

  @ApiProperty({ enum: Priority })
  @Column({
    type: 'varchar',
    
    default: Priority.MEDIUM,
  })
  priority: Priority;

  @ApiProperty()
  @Column('json', { nullable: true })
  reminders: any; // Reminder settings

  @ApiProperty()
  @Column('json', { nullable: true })
  virtualMeeting: any; // Virtual meeting details

  @ApiProperty()
  @Column('json', { nullable: true })
  location: any; // Location details and access instructions

  @ApiProperty()
  @Column('json', { nullable: true })
  feedback: any; // Post-booking feedback

  @ApiProperty()
  @Column({ default: false })
  followUpRequired: boolean;

  @ApiProperty()
  @Column('datetime', { nullable: true })
  cancelledAt: Date;

  @ApiProperty()
  @Column('text', { nullable: true })
  cancelReason: string;

  @ApiProperty()
  @Column('text', { nullable: true })
  rescheduledFrom: string;

  @ApiProperty()
  @Column('json', { nullable: true })
  attendees: any; // Additional attendees

  @ApiProperty()
  @Column('json', { nullable: true })
  documents: any; // Related documents

  @ApiProperty()
  @Column('json', { nullable: true })
  checklist: any; // Pre/post booking checklist

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
