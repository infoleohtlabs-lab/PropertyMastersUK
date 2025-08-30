import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { Property } from '../../properties/entities/property.entity';
import { WorkOrder } from './work-order.entity';

export enum MaintenanceRequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  REJECTED = 'rejected',
}

export enum MaintenanceRequestPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
  EMERGENCY = 'emergency',
}

export enum MaintenanceRequestCategory {
  PLUMBING = 'plumbing',
  ELECTRICAL = 'electrical',
  HEATING = 'heating',
  COOLING = 'cooling',
  APPLIANCES = 'appliances',
  STRUCTURAL = 'structural',
  PAINTING = 'painting',
  FLOORING = 'flooring',
  ROOFING = 'roofing',
  WINDOWS = 'windows',
  DOORS = 'doors',
  SECURITY = 'security',
  LANDSCAPING = 'landscaping',
  CLEANING = 'cleaning',
  PEST_CONTROL = 'pest_control',
  OTHER = 'other',
}

@Entity('maintenance_requests')
export class MaintenanceRequest {
  @ApiProperty({ description: 'Unique identifier for the maintenance request' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Request number for tracking' })
  @Column({ unique: true })
  requestNumber: string;

  @ApiProperty({ description: 'Title of the maintenance request' })
  @Column()
  title: string;

  @ApiProperty({ description: 'Detailed description of the issue' })
  @Column('text')
  description: string;

  @ApiProperty({ description: 'Category of maintenance', enum: MaintenanceRequestCategory })
  @Column({ type: 'varchar', enum: MaintenanceRequestCategory })
  category: MaintenanceRequestCategory;

  @ApiProperty({ description: 'Priority level', enum: MaintenanceRequestPriority })
  @Column({ type: 'varchar', enum: MaintenanceRequestPriority, default: MaintenanceRequestPriority.MEDIUM })
  priority: MaintenanceRequestPriority;

  @ApiProperty({ description: 'Current status', enum: MaintenanceRequestStatus })
  @Column({ type: 'varchar', enum: MaintenanceRequestStatus, default: MaintenanceRequestStatus.PENDING })
  status: MaintenanceRequestStatus;

  @ApiProperty({ description: 'Location within the property' })
  @Column({ nullable: true })
  location: string;

  @ApiProperty({ description: 'Estimated cost for the repair' })
  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  estimatedCost: number;

  @ApiProperty({ description: 'Actual cost of the repair' })
  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  actualCost: number;

  @ApiProperty({ description: 'Preferred date for completion' })
  @Column({ type: 'date', nullable: true })
  preferredDate: Date;

  @ApiProperty({ description: 'Date when request was acknowledged' })
  @Column({ type: 'datetime', nullable: true })
  acknowledgedAt: Date;

  @ApiProperty({ description: 'Date when work was started' })
  @Column({ type: 'datetime', nullable: true })
  startedAt: Date;

  @ApiProperty({ description: 'Date when work was completed' })
  @Column({ type: 'datetime', nullable: true })
  completedAt: Date;

  @ApiProperty({ description: 'Date when request was cancelled' })
  @Column({ type: 'datetime', nullable: true })
  cancelledAt: Date;

  @ApiProperty({ description: 'Reason for cancellation or rejection' })
  @Column('text', { nullable: true })
  cancellationReason: string;

  @ApiProperty({ description: 'Images related to the request' })
  @Column('json', { nullable: true })
  images: string[];

  @ApiProperty({ description: 'Documents related to the request' })
  @Column('json', { nullable: true })
  documents: string[];

  @ApiProperty({ description: 'Notes from tenant or landlord' })
  @Column('text', { nullable: true })
  notes: string;

  @ApiProperty({ description: 'Internal notes for staff' })
  @Column('text', { nullable: true })
  internalNotes: string;

  @ApiProperty({ description: 'Tenant satisfaction rating (1-5)' })
  @Column({ type: 'int', nullable: true })
  satisfactionRating: number;

  @ApiProperty({ description: 'Tenant feedback' })
  @Column('text', { nullable: true })
  tenantFeedback: string;

  @ApiProperty({ description: 'Whether tenant access is required' })
  @Column({ default: true })
  requiresTenantAccess: boolean;

  @ApiProperty({ description: 'Emergency contact information' })
  @Column('json', { nullable: true })
  emergencyContact: any;

  @ApiProperty({ description: 'Additional metadata' })
  @Column('json', { nullable: true })
  metadata: any;

  // Relationships
  @ApiProperty({ description: 'ID of the user who created the request' })
  @Column('uuid')
  createdBy: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'createdBy' })
  creator: User;

  @ApiProperty({ description: 'ID of the user assigned to handle the request' })
  @Column('uuid', { nullable: true })
  assignedTo: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assignedTo' })
  assignee: User;

  @ApiProperty({ description: 'ID of the property' })
  @Column('uuid')
  propertyId: string;

  @ManyToOne(() => Property, { eager: true })
  @JoinColumn({ name: 'propertyId' })
  property: Property;

  @OneToMany(() => WorkOrder, (workOrder) => workOrder.maintenanceRequest)
  workOrders: WorkOrder[];

  @ApiProperty({ description: 'Date when the request was created' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Date when the request was last updated' })
  @UpdateDateColumn()
  updatedAt: Date;
}