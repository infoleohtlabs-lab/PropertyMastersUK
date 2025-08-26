import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { Property } from '../../properties/entities/property.entity';

export enum BookingType {
  VIEWING = 'viewing',
  VIRTUAL_VIEWING = 'virtual_viewing',
  VALUATION = 'valuation',
  INSPECTION = 'inspection',
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
export class Booking {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ enum: BookingType })
  @Column({
    type: 'varchar',
    
    default: BookingType.VIEWING,
  })
  type: BookingType;

  @ApiProperty({ enum: BookingStatus })
  @Column({
    type: 'varchar',
    
    default: BookingStatus.PENDING,
  })
  status: BookingStatus;

  @ApiProperty({ enum: BookingPriority })
  @Column({
    type: 'varchar',
    
    default: BookingPriority.MEDIUM,
  })
  priority: BookingPriority;

  @ApiProperty()
  @Column()
  scheduledDate: Date;

  @ApiProperty()
  @Column()
  scheduledTime: string;

  @ApiProperty()
  @Column({ nullable: true })
  duration: number; // in minutes

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
  @Column({ nullable: true })
  confirmationSentAt: Date;

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
  @Column('text', { nullable: true })
  feedback: string;

  @ApiProperty()
  @Column({ nullable: true })
  rating: number; // 1-5 stars

  @ApiProperty()
  @Column({ nullable: true })
  confirmedAt: Date;

  @ApiProperty()
  @Column({ nullable: true })
  rescheduledAt: Date;

  // Relationships
  @ApiProperty()
  @Column('uuid')
  propertyId: string;

  @ManyToOne(() => Property)
  @JoinColumn({ name: 'propertyId' })
  property: Property;

  @ApiProperty()
  @Column('uuid')
  userId: string; // The person booking

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ApiProperty()
  @Column('uuid', { nullable: true })
  clientId: string; // Alternative client reference

  @ManyToOne(() => User)
  @JoinColumn({ name: 'clientId' })
  client: User;

  @ApiProperty()
  @Column('uuid')
  agentId: string; // The agent handling the booking

  @ManyToOne(() => User)
  @JoinColumn({ name: 'agentId' })
  agent: User;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
