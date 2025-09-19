import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Buyer } from './buyer.entity';


export enum ViewingStatus {
  SCHEDULED = 'scheduled',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
  RESCHEDULED = 'rescheduled'
}

export enum ViewingType {
  PHYSICAL = 'physical',
  VIRTUAL = 'virtual',
  PRIVATE = 'private',
  GROUP = 'group'
}

@Entity('viewings')
export class Viewing {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column('uuid')
  buyerId: string;

  @ApiProperty()
  @Column('uuid')
  propertyId: string;

  @ApiProperty()
  @Column('uuid', { nullable: true })
  agentId: string;

  @ApiProperty()
  @Column({ type: 'datetime' })
  scheduledDate: Date;

  @ApiProperty()
  @Column({ type: 'int', default: 30 })
  durationMinutes: number;

  @ApiProperty({ enum: ViewingStatus })
  @Column({ type: 'varchar', default: ViewingStatus.SCHEDULED })
  status: ViewingStatus;

  @ApiProperty({ enum: ViewingType })
  @Column({ type: 'varchar', default: ViewingType.PHYSICAL })
  viewingType: ViewingType;

  @ApiProperty()
  @Column({ nullable: true })
  notes: string;

  @ApiProperty()
  @Column({ nullable: true })
  feedback: string;

  @ApiProperty()
  @Column({ type: 'int', nullable: true, comment: 'Rating from 1-5' })
  rating: number;

  @ApiProperty()
  @Column({ nullable: true })
  attendees: string; // JSON string for attendee details

  @ApiProperty()
  @Column({ nullable: true })
  specialRequirements: string;

  @ApiProperty()
  @Column({ default: false })
  isInterested: boolean;

  @ApiProperty()
  @Column({ type: 'datetime', nullable: true })
  confirmedAt: Date;

  @ApiProperty()
  @Column({ type: 'datetime', nullable: true })
  cancelledAt: Date;

  @ApiProperty()
  @Column({ type: 'datetime', nullable: true })
  completedAt: Date;

  @ApiProperty()
  @Column({ nullable: true })
  cancellationReason: string;

  @ApiProperty()
  @Column({ nullable: true })
  agentNotes: string;

  @ApiProperty()
  @Column({ nullable: true })
  meetingPoint: string;

  @ApiProperty()
  @Column({ nullable: true })
  contactNumber: string;

  @ApiProperty()
  @Column({ default: false })
  reminderSent: boolean;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Buyer, buyer => buyer.viewings)
  @JoinColumn({ name: 'buyerId' })
  buyer: Buyer;
}
