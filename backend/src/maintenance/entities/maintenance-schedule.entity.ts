import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { Property } from '../../properties/entities/property.entity';
import { TenantOrganization } from '../../common/entities/tenant-organization.entity';
import { MaintenanceRequest } from './maintenance-request.entity';

export enum MaintenanceScheduleType {
  PREVENTIVE = 'preventive',
  INSPECTION = 'inspection',
  CLEANING = 'cleaning',
  SERVICING = 'servicing',
  SAFETY_CHECK = 'safety_check',
  COMPLIANCE = 'compliance',
  WARRANTY = 'warranty',
  SEASONAL = 'seasonal',
}

export enum MaintenanceScheduleStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}

export enum MaintenanceScheduleFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  SEMI_ANNUALLY = 'semi_annually',
  ANNUALLY = 'annually',
  CUSTOM = 'custom',
}

export enum MaintenanceSchedulePriority {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

@Entity('maintenance_schedules')
@Index(['tenantOrganizationId', 'status'])
@Index(['tenantOrganizationId', 'type'])
@Index(['tenantOrganizationId', 'frequency'])
@Index(['tenantOrganizationId', 'propertyId'])
@Index(['tenantOrganizationId', 'nextDueDate'])
@Index(['tenantOrganizationId', 'isActive'])
export class MaintenanceSchedule {
  @ApiProperty({ description: 'Unique identifier for the maintenance schedule' })
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

  // Basic Information
  @ApiProperty({ description: 'Schedule name/title' })
  @Column()
  name: string;

  @ApiProperty({ description: 'Detailed description of the maintenance schedule' })
  @Column('text')
  description: string;

  @ApiProperty({ enum: MaintenanceScheduleType, description: 'Type of maintenance schedule' })
  @Column({
    type: 'enum',
    enum: MaintenanceScheduleType,
  })
  @Index()
  type: MaintenanceScheduleType;

  @ApiProperty({ enum: MaintenanceScheduleStatus, description: 'Current status of the schedule' })
  @Column({
    type: 'enum',
    enum: MaintenanceScheduleStatus,
    default: MaintenanceScheduleStatus.ACTIVE,
  })
  @Index()
  status: MaintenanceScheduleStatus;

  @ApiProperty({ enum: MaintenanceSchedulePriority, description: 'Priority level of the schedule' })
  @Column({
    type: 'enum',
    enum: MaintenanceSchedulePriority,
    default: MaintenanceSchedulePriority.MEDIUM,
  })
  priority: MaintenanceSchedulePriority;

  // Relationships
  @ApiProperty({ description: 'Property for which maintenance is scheduled' })
  @Column('uuid')
  @Index()
  propertyId: string;

  @ManyToOne(() => Property, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'propertyId' })
  property: Property;

  @ApiProperty({ description: 'User who created the schedule' })
  @Column('uuid')
  createdById: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @ApiProperty({ description: 'User assigned to handle the maintenance', required: false })
  @Column('uuid', { nullable: true })
  assignedToId?: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assignedToId' })
  assignedTo?: User;

  // Scheduling Information
  @ApiProperty({ enum: MaintenanceScheduleFrequency, description: 'Frequency of the maintenance' })
  @Column({
    type: 'enum',
    enum: MaintenanceScheduleFrequency,
  })
  @Index()
  frequency: MaintenanceScheduleFrequency;

  @ApiProperty({ description: 'Interval for custom frequency (e.g., every 2 weeks)', required: false })
  @Column({ nullable: true })
  customInterval?: number;

  @ApiProperty({ description: 'Custom frequency unit (days, weeks, months)', required: false })
  @Column({ nullable: true })
  customFrequencyUnit?: string;

  @ApiProperty({ description: 'Start date for the schedule' })
  @Column({ type: 'timestamp' })
  startDate: Date;

  @ApiProperty({ description: 'End date for the schedule', required: false })
  @Column({ type: 'timestamp', nullable: true })
  endDate?: Date;

  @ApiProperty({ description: 'Next due date for maintenance' })
  @Column({ type: 'timestamp' })
  @Index()
  nextDueDate: Date;

  @ApiProperty({ description: 'Last completed date', required: false })
  @Column({ type: 'timestamp', nullable: true })
  lastCompletedDate?: Date;

  @ApiProperty({ description: 'Number of days before due date to create request', required: false })
  @Column({ default: 7 })
  advanceNoticeDays: number;

  @ApiProperty({ description: 'Time of day for maintenance (HH:MM)', required: false })
  @Column({ nullable: true })
  preferredTime?: string;

  @ApiProperty({ description: 'Preferred days of week for maintenance', required: false })
  @Column('simple-array', { nullable: true })
  preferredDaysOfWeek?: string[];

  @ApiProperty({ description: 'Duration in hours for the maintenance', required: false })
  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  estimatedDuration?: number;

  // Location Details
  @ApiProperty({ description: 'Specific location within the property', required: false })
  @Column({ nullable: true })
  location?: string;

  @ApiProperty({ description: 'Unit number if applicable', required: false })
  @Column({ nullable: true })
  unitNumber?: string;

  @ApiProperty({ description: 'Room or area for maintenance', required: false })
  @Column({ nullable: true })
  room?: string;

  @ApiProperty({ description: 'Floor number', required: false })
  @Column({ nullable: true })
  floor?: string;

  @ApiProperty({ description: 'Equipment or system to maintain', required: false })
  @Column({ nullable: true })
  equipment?: string;

  // Task Details
  @ApiProperty({ description: 'Detailed task instructions' })
  @Column('text')
  taskInstructions: string;

  @ApiProperty({ description: 'Required tools and equipment', required: false })
  @Column('simple-array', { nullable: true })
  requiredTools?: string[];

  @ApiProperty({ description: 'Required materials and parts', required: false })
  @Column('simple-array', { nullable: true })
  requiredMaterials?: string[];

  @ApiProperty({ description: 'Safety requirements and precautions', required: false })
  @Column('text', { nullable: true })
  safetyRequirements?: string;

  @ApiProperty({ description: 'Checklist items for the maintenance', required: false })
  @Column('jsonb', { nullable: true })
  checklist?: Array<{
    item: string;
    required: boolean;
    description?: string;
  }>;

  // Cost and Budget
  @ApiProperty({ description: 'Estimated cost per occurrence', required: false })
  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  estimatedCost?: number;

  @ApiProperty({ description: 'Budget allocated for this schedule', required: false })
  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  budgetAllocated?: number;

  @ApiProperty({ description: 'Currency code', required: false })
  @Column({ default: 'GBP' })
  currency: string;

  @ApiProperty({ description: 'Whether approval is required for cost', required: false })
  @Column({ default: false })
  requiresApproval: boolean;

  @ApiProperty({ description: 'Approval threshold amount', required: false })
  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  approvalThreshold?: number;

  // Contractor Information
  @ApiProperty({ description: 'Preferred contractor company', required: false })
  @Column({ nullable: true })
  preferredContractor?: string;

  @ApiProperty({ description: 'Contractor contact information', required: false })
  @Column('jsonb', { nullable: true })
  contractorInfo?: {
    company?: string;
    contact?: string;
    phone?: string;
    email?: string;
    license?: string;
  };

  @ApiProperty({ description: 'Whether internal staff can handle this', required: false })
  @Column({ default: true })
  canBeHandledInternally: boolean;

  // Access and Coordination
  @ApiProperty({ description: 'Whether access is required', required: false })
  @Column({ default: true })
  requiresAccess: boolean;

  @ApiProperty({ description: 'Access instructions', required: false })
  @Column('text', { nullable: true })
  accessInstructions?: string;

  @ApiProperty({ description: 'Whether tenant notification is required', required: false })
  @Column({ default: true })
  requiresTenantNotification: boolean;

  @ApiProperty({ description: 'Notice period for tenant notification (days)', required: false })
  @Column({ default: 3 })
  tenantNotificationDays: number;

  @ApiProperty({ description: 'Whether utilities need to be shut off', required: false })
  @Column({ default: false })
  requiresUtilityShutoff: boolean;

  @ApiProperty({ description: 'Utility shutoff details', required: false })
  @Column('text', { nullable: true })
  utilityShutoffDetails?: string;

  // Compliance and Regulations
  @ApiProperty({ description: 'Regulatory requirements', required: false })
  @Column('simple-array', { nullable: true })
  regulatoryRequirements?: string[];

  @ApiProperty({ description: 'Compliance standards', required: false })
  @Column('simple-array', { nullable: true })
  complianceStandards?: string[];

  @ApiProperty({ description: 'Certification requirements', required: false })
  @Column('simple-array', { nullable: true })
  certificationRequirements?: string[];

  @ApiProperty({ description: 'Documentation requirements', required: false })
  @Column('simple-array', { nullable: true })
  documentationRequirements?: string[];

  // Tracking and History
  @ApiProperty({ description: 'Number of times completed' })
  @Column({ default: 0 })
  completionCount: number;

  @ApiProperty({ description: 'Number of times skipped' })
  @Column({ default: 0 })
  skipCount: number;

  @ApiProperty({ description: 'Average completion time in hours', required: false })
  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  averageCompletionTime?: number;

  @ApiProperty({ description: 'Average cost per completion', required: false })
  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  averageCost?: number;

  @ApiProperty({ description: 'Last maintenance request ID', required: false })
  @Column('uuid', { nullable: true })
  lastMaintenanceRequestId?: string;

  @ManyToOne(() => MaintenanceRequest, { nullable: true })
  @JoinColumn({ name: 'lastMaintenanceRequestId' })
  lastMaintenanceRequest?: MaintenanceRequest;

  @OneToMany(() => MaintenanceRequest, (request) => request.preventiveScheduleId)
  maintenanceRequests: MaintenanceRequest[];

  // Notifications and Alerts
  @ApiProperty({ description: 'Notification settings', required: false })
  @Column('jsonb', { nullable: true })
  notificationSettings?: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
    reminderDays: number[];
    escalationDays: number;
  };

  @ApiProperty({ description: 'Users to notify', required: false })
  @Column('simple-array', { nullable: true })
  notifyUsers?: string[];

  @ApiProperty({ description: 'Email addresses to notify', required: false })
  @Column('simple-array', { nullable: true })
  notifyEmails?: string[];

  // Seasonal and Weather Considerations
  @ApiProperty({ description: 'Seasonal considerations', required: false })
  @Column('simple-array', { nullable: true })
  seasonalConsiderations?: string[];

  @ApiProperty({ description: 'Weather dependencies', required: false })
  @Column('simple-array', { nullable: true })
  weatherDependencies?: string[];

  @ApiProperty({ description: 'Temperature range requirements', required: false })
  @Column('jsonb', { nullable: true })
  temperatureRange?: {
    min?: number;
    max?: number;
    unit: string;
  };

  // Quality and Performance
  @ApiProperty({ description: 'Quality standards', required: false })
  @Column('text', { nullable: true })
  qualityStandards?: string;

  @ApiProperty({ description: 'Performance metrics to track', required: false })
  @Column('simple-array', { nullable: true })
  performanceMetrics?: string[];

  @ApiProperty({ description: 'Success criteria', required: false })
  @Column('text', { nullable: true })
  successCriteria?: string;

  @ApiProperty({ description: 'Average quality rating', required: false })
  @Column('decimal', { precision: 3, scale: 2, nullable: true })
  averageQualityRating?: number;

  // Escalation and Dependencies
  @ApiProperty({ description: 'Escalation rules', required: false })
  @Column('jsonb', { nullable: true })
  escalationRules?: {
    overdueDays: number;
    escalateTo: string;
    escalationMessage: string;
  };

  @ApiProperty({ description: 'Dependencies on other schedules', required: false })
  @Column('simple-array', { nullable: true })
  dependencies?: string[];

  @ApiProperty({ description: 'Schedules that depend on this one', required: false })
  @Column('simple-array', { nullable: true })
  dependents?: string[];

  // Automation and Integration
  @ApiProperty({ description: 'Whether to auto-create maintenance requests', required: false })
  @Column({ default: true })
  autoCreateRequests: boolean;

  @ApiProperty({ description: 'Whether to auto-assign requests', required: false })
  @Column({ default: false })
  autoAssignRequests: boolean;

  @ApiProperty({ description: 'Integration settings', required: false })
  @Column('jsonb', { nullable: true })
  integrationSettings?: {
    externalSystemId?: string;
    syncEnabled: boolean;
    lastSyncAt?: Date;
    syncErrors?: string[];
  };

  // Flags and Status
  @ApiProperty({ description: 'Whether schedule is active' })
  @Column({ default: true })
  @Index()
  isActive: boolean;

  @ApiProperty({ description: 'Whether schedule is paused' })
  @Column({ default: false })
  isPaused: boolean;

  @ApiProperty({ description: 'Pause reason', required: false })
  @Column('text', { nullable: true })
  pauseReason?: string;

  @ApiProperty({ description: 'Paused by user ID', required: false })
  @Column('uuid', { nullable: true })
  pausedById?: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'pausedById' })
  pausedBy?: User;

  @ApiProperty({ description: 'Pause date', required: false })
  @Column({ type: 'timestamp', nullable: true })
  pausedAt?: Date;

  @ApiProperty({ description: 'Whether schedule is overdue' })
  @Column({ default: false })
  isOverdue: boolean;

  @ApiProperty({ description: 'Days overdue', required: false })
  @Column({ nullable: true })
  daysOverdue?: number;

  // Additional Metadata
  @ApiProperty({ description: 'Additional metadata', required: false })
  @Column('jsonb', { nullable: true })
  metadata?: Record<string, any>;

  @ApiProperty({ description: 'Tags for categorization', required: false })
  @Column('simple-array', { nullable: true })
  tags?: string[];

  @ApiProperty({ description: 'Custom fields', required: false })
  @Column('jsonb', { nullable: true })
  customFields?: Record<string, any>;

  // Timestamps
  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty({ description: 'Last execution timestamp', required: false })
  @Column({ type: 'timestamp', nullable: true })
  lastExecutedAt?: Date;

  @ApiProperty({ description: 'Next execution timestamp', required: false })
  @Column({ type: 'timestamp', nullable: true })
  nextExecutionAt?: Date;
}