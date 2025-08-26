import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { Property } from './property.entity';

export enum InspectionType {
  ROUTINE = 'routine',
  CHECK_IN = 'check_in',
  CHECK_OUT = 'check_out',
  MID_TERM = 'mid_term',
  MAINTENANCE = 'maintenance',
  SAFETY = 'safety',
  INVENTORY = 'inventory',
  DAMAGE_ASSESSMENT = 'damage_assessment',
}

export enum InspectionStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  RESCHEDULED = 'rescheduled',
}

@Entity('property_inspections')
export class PropertyInspection {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column()
  inspectionNumber: string;

  @ApiProperty({ enum: InspectionType })
  @Column({
    type: 'varchar',
    
  })
  type: InspectionType;

  @ApiProperty({ enum: InspectionStatus })
  @Column({
    type: 'varchar',
    
    default: InspectionStatus.SCHEDULED,
  })
  status: InspectionStatus;

  @ApiProperty()
  @Column()
  scheduledDate: Date;

  @ApiProperty()
  @Column()
  scheduledTime: string;

  @ApiProperty()
  @Column({ nullable: true })
  completedDate: Date;

  @ApiProperty()
  @Column({ nullable: true })
  duration: number; // in minutes

  @ApiProperty()
  @Column('text', { nullable: true })
  purpose: string;

  @ApiProperty()
  @Column('text', { nullable: true })
  notes: string;

  @ApiProperty()
  @Column('text', { nullable: true })
  findings: string;

  @ApiProperty()
  @Column('simple-array', { nullable: true })
  images: string[];

  @ApiProperty()
  @Column('simple-array', { nullable: true })
  documents: string[];

  @ApiProperty()
  @Column('json', { nullable: true })
  checklist: any; // JSON object for inspection checklist

  @ApiProperty()
  @Column('json', { nullable: true })
  roomConditions: any; // JSON object for room-by-room conditions

  @ApiProperty()
  @Column('simple-array', { nullable: true })
  issuesFound: string[];

  @ApiProperty()
  @Column('simple-array', { nullable: true })
  recommendedActions: string[];

  @ApiProperty()
  @Column({ nullable: true })
  overallCondition: string; // Excellent, Good, Fair, Poor

  @ApiProperty()
  @Column({ nullable: true })
  rating: number; // 1-10 scale

  @ApiProperty()
  @Column({ default: false })
  tenantPresent: boolean;

  @ApiProperty()
  @Column({ default: false })
  landlordPresent: boolean;

  @ApiProperty()
  @Column({ default: false })
  agentPresent: boolean;

  @ApiProperty()
  @Column('simple-array', { nullable: true })
  attendees: string[]; // Names of people present

  @ApiProperty()
  @Column({ default: false })
  followUpRequired: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  followUpDate: Date;

  @ApiProperty()
  @Column('text', { nullable: true })
  followUpNotes: string;

  @ApiProperty()
  @Column({ nullable: true })
  nextInspectionDate: Date;

  @ApiProperty()
  @Column({ default: false })
  reportGenerated: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  reportUrl: string;

  @ApiProperty()
  @Column({ nullable: true })
  reportGeneratedAt: Date;

  @ApiProperty()
  @Column({ default: false })
  tenantNotified: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  tenantNotifiedAt: Date;

  @ApiProperty()
  @Column({ default: false })
  landlordNotified: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  landlordNotifiedAt: Date;

  // Relationships
  @ApiProperty()
  @Column('uuid')
  propertyId: string;

  @ManyToOne(() => Property)
  @JoinColumn({ name: 'propertyId' })
  property: Property;

  @ApiProperty()
  @Column('uuid')
  inspectorId: string; // Usually agent or landlord

  @ManyToOne(() => User)
  @JoinColumn({ name: 'inspectorId' })
  inspector: User;

  @ApiProperty()
  @Column('uuid', { nullable: true })
  tenantId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'tenantId' })
  tenant: User;

  @ApiProperty()
  @Column('uuid', { nullable: true })
  landlordId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'landlordId' })
  landlord: User;

  @ApiProperty()
  @Column('uuid', { nullable: true })
  agentId: string;

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
