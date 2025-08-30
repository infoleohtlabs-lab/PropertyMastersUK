import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { MaintenanceRequest } from './maintenance-request.entity';
import { Contractor } from './contractor.entity';

export enum WorkOrderStatus {
  DRAFT = 'draft',
  ASSIGNED = 'assigned',
  ACCEPTED = 'accepted',
  IN_PROGRESS = 'in_progress',
  ON_HOLD = 'on_hold',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  REJECTED = 'rejected',
}

export enum WorkOrderPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
  EMERGENCY = 'emergency',
}

@Entity('work_orders')
export class WorkOrder {
  @ApiProperty({ description: 'Unique identifier for the work order' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Work order number for tracking' })
  @Column({ unique: true })
  orderNumber: string;

  @ApiProperty({ description: 'Title of the work order' })
  @Column()
  title: string;

  @ApiProperty({ description: 'Detailed description of work to be done' })
  @Column('text')
  description: string;

  @ApiProperty({ description: 'Current status', enum: WorkOrderStatus })
  @Column({ type: 'varchar', enum: WorkOrderStatus, default: WorkOrderStatus.DRAFT })
  status: WorkOrderStatus;

  @ApiProperty({ description: 'Priority level', enum: WorkOrderPriority })
  @Column({ type: 'varchar', enum: WorkOrderPriority, default: WorkOrderPriority.MEDIUM })
  priority: WorkOrderPriority;

  @ApiProperty({ description: 'Estimated cost for the work' })
  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  estimatedCost: number;

  @ApiProperty({ description: 'Quoted cost from contractor' })
  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  quotedCost: number;

  @ApiProperty({ description: 'Final cost of the work' })
  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  finalCost: number;

  @ApiProperty({ description: 'Estimated hours to complete' })
  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  estimatedHours: number;

  @ApiProperty({ description: 'Actual hours worked' })
  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  actualHours: number;

  @ApiProperty({ description: 'Scheduled start date and time' })
  @Column({ type: 'datetime', nullable: true })
  scheduledStartDate: Date;

  @ApiProperty({ description: 'Scheduled completion date and time' })
  @Column({ type: 'datetime', nullable: true })
  scheduledEndDate: Date;

  @ApiProperty({ description: 'Actual start date and time' })
  @Column({ type: 'datetime', nullable: true })
  actualStartDate: Date;

  @ApiProperty({ description: 'Actual completion date and time' })
  @Column({ type: 'datetime', nullable: true })
  actualEndDate: Date;

  @ApiProperty({ description: 'Date when work order was assigned' })
  @Column({ type: 'datetime', nullable: true })
  assignedAt: Date;

  @ApiProperty({ description: 'Date when contractor accepted the work order' })
  @Column({ type: 'datetime', nullable: true })
  acceptedAt: Date;

  @ApiProperty({ description: 'Date when work order was cancelled' })
  @Column({ type: 'datetime', nullable: true })
  cancelledAt: Date;

  @ApiProperty({ description: 'Reason for cancellation or rejection' })
  @Column('text', { nullable: true })
  cancellationReason: string;

  @ApiProperty({ description: 'Materials required for the work' })
  @Column('json', { nullable: true })
  materials: {
    name: string;
    quantity: number;
    unit: string;
    unitCost: number;
    totalCost: number;
    supplier: string;
  }[];

  @ApiProperty({ description: 'Tools required for the work' })
  @Column('json', { nullable: true })
  toolsRequired: string[];

  @ApiProperty({ description: 'Safety requirements and precautions' })
  @Column('json', { nullable: true })
  safetyRequirements: string[];

  @ApiProperty({ description: 'Special instructions for the contractor' })
  @Column('text', { nullable: true })
  specialInstructions: string;

  @ApiProperty({ description: 'Access instructions for the property' })
  @Column('text', { nullable: true })
  accessInstructions: string;

  @ApiProperty({ description: 'Work completion notes' })
  @Column('text', { nullable: true })
  completionNotes: string;

  @ApiProperty({ description: 'Quality check notes' })
  @Column('text', { nullable: true })
  qualityCheckNotes: string;

  @ApiProperty({ description: 'Whether quality check passed' })
  @Column({ nullable: true })
  qualityCheckPassed: boolean;

  @ApiProperty({ description: 'Images before work started' })
  @Column('json', { nullable: true })
  beforeImages: string[];

  @ApiProperty({ description: 'Images after work completed' })
  @Column('json', { nullable: true })
  afterImages: string[];

  @ApiProperty({ description: 'Work progress images' })
  @Column('json', { nullable: true })
  progressImages: string[];

  @ApiProperty({ description: 'Documents related to the work order' })
  @Column('json', { nullable: true })
  documents: string[];

  @ApiProperty({ description: 'Warranty period in months' })
  @Column({ nullable: true })
  warrantyPeriod: number;

  @ApiProperty({ description: 'Warranty details' })
  @Column('text', { nullable: true })
  warrantyDetails: string;

  @ApiProperty({ description: 'Customer satisfaction rating (1-5)' })
  @Column({ type: 'int', nullable: true })
  satisfactionRating: number;

  @ApiProperty({ description: 'Customer feedback' })
  @Column('text', { nullable: true })
  customerFeedback: string;

  @ApiProperty({ description: 'Contractor rating for this job (1-5)' })
  @Column({ type: 'int', nullable: true })
  contractorRating: number;

  @ApiProperty({ description: 'Notes about contractor performance' })
  @Column('text', { nullable: true })
  contractorNotes: string;

  @ApiProperty({ description: 'Whether follow-up is required' })
  @Column({ default: false })
  followUpRequired: boolean;

  @ApiProperty({ description: 'Follow-up date' })
  @Column({ type: 'date', nullable: true })
  followUpDate: Date;

  @ApiProperty({ description: 'Follow-up notes' })
  @Column('text', { nullable: true })
  followUpNotes: string;

  @ApiProperty({ description: 'Additional metadata' })
  @Column('json', { nullable: true })
  metadata: any;

  // Relationships
  @ApiProperty({ description: 'ID of the maintenance request' })
  @Column('uuid')
  maintenanceRequestId: string;

  @ManyToOne(() => MaintenanceRequest, (request) => request.workOrders, { eager: true })
  @JoinColumn({ name: 'maintenanceRequestId' })
  maintenanceRequest: MaintenanceRequest;

  @ApiProperty({ description: 'ID of the assigned contractor' })
  @Column('uuid', { nullable: true })
  contractorId: string;

  @ManyToOne(() => Contractor, (contractor) => contractor.workOrders, { eager: true })
  @JoinColumn({ name: 'contractorId' })
  contractor: Contractor;

  @ApiProperty({ description: 'ID of the user who created the work order' })
  @Column('uuid')
  createdBy: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'createdBy' })
  creator: User;

  @ApiProperty({ description: 'ID of the user who approved the work order' })
  @Column('uuid', { nullable: true })
  approvedBy: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'approvedBy' })
  approver: User;

  @ApiProperty({ description: 'Date when the work order was created' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Date when the work order was last updated' })
  @UpdateDateColumn()
  updatedAt: Date;
}