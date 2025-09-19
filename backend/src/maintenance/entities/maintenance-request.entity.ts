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
import { WorkOrder } from './work-order.entity';

export enum MaintenanceRequestType {
  EMERGENCY = 'emergency',
  URGENT = 'urgent',
  ROUTINE = 'routine',
  PREVENTIVE = 'preventive',
  COSMETIC = 'cosmetic',
  INSPECTION = 'inspection',
  REPAIR = 'repair',
  REPLACEMENT = 'replacement',
  INSTALLATION = 'installation',
  CLEANING = 'cleaning',
}

export enum MaintenanceRequestStatus {
  SUBMITTED = 'submitted',
  ACKNOWLEDGED = 'acknowledged',
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in_progress',
  ON_HOLD = 'on_hold',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  REJECTED = 'rejected',
  REQUIRES_APPROVAL = 'requires_approval',
  AWAITING_PARTS = 'awaiting_parts',
  AWAITING_ACCESS = 'awaiting_access',
  APPROVED = 'approved',
  PENDING = 'pending',
}

export enum MaintenanceRequestPriority {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

export enum MaintenanceRequestCategory {
  PLUMBING = 'plumbing',
  ELECTRICAL = 'electrical',
  HEATING = 'heating',
  COOLING = 'cooling',
  APPLIANCES = 'appliances',
  FLOORING = 'flooring',
  WALLS = 'walls',
  WINDOWS = 'windows',
  DOORS = 'doors',
  ROOF = 'roof',
  EXTERIOR = 'exterior',
  SECURITY = 'security',
  PEST_CONTROL = 'pest_control',
  CLEANING = 'cleaning',
  LANDSCAPING = 'landscaping',
  OTHER = 'other',
}

export enum MaintenanceRequestSource {
  TENANT_PORTAL = 'tenant_portal',
  PROPERTY_MANAGER = 'property_manager',
  INSPECTION = 'inspection',
  PREVENTIVE_SCHEDULE = 'preventive_schedule',
  EMERGENCY_CALL = 'emergency_call',
  EMAIL = 'email',
  PHONE = 'phone',
  MOBILE_APP = 'mobile_app',
  WALK_IN = 'walk_in',
}

@Entity('maintenance_requests')
@Index(['tenantOrganizationId', 'status'])
@Index(['tenantOrganizationId', 'priority'])
@Index(['tenantOrganizationId', 'category'])
@Index(['tenantOrganizationId', 'propertyId'])
@Index(['tenantOrganizationId', 'assignedToId'])
@Index(['tenantOrganizationId', 'requestedById'])
@Index(['tenantOrganizationId', 'dueDate'])
@Index(['tenantOrganizationId', 'createdAt'])
export class MaintenanceRequest {
  @ApiProperty({ description: 'Unique identifier for the maintenance request' })
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
  @ApiProperty({ description: 'Request reference number' })
  @Column({ unique: true })
  @Index()
  referenceNumber: string;

  @ApiProperty({ description: 'Title/summary of the maintenance request' })
  @Column()
  title: string;

  @ApiProperty({ description: 'Detailed description of the issue' })
  @Column('text')
  description: string;

  @ApiProperty({ enum: MaintenanceRequestType, description: 'Type of maintenance request' })
  @Column({
    type: 'varchar',
    default: MaintenanceRequestType.ROUTINE,
  })
  type: MaintenanceRequestType;

  @ApiProperty({ enum: MaintenanceRequestStatus, description: 'Current status of the request' })
  @Column({
    type: 'varchar',
    default: MaintenanceRequestStatus.SUBMITTED,
  })
  @Index()
  status: MaintenanceRequestStatus;

  @ApiProperty({ enum: MaintenanceRequestPriority, description: 'Priority level of the request' })
  @Column({
    type: 'varchar',
    default: MaintenanceRequestPriority.MEDIUM,
  })
  @Index()
  priority: MaintenanceRequestPriority;

  @ApiProperty({ enum: MaintenanceRequestCategory, description: 'Category of maintenance' })
  @Column({
    type: 'varchar',
  })
  @Index()
  category: MaintenanceRequestCategory;

  @ApiProperty({ enum: MaintenanceRequestSource, description: 'Source of the request' })
  @Column({
    type: 'varchar',
    default: MaintenanceRequestSource.TENANT_PORTAL,
  })
  source: MaintenanceRequestSource;

  // Relationships
  @ApiProperty({ description: 'Property where maintenance is needed' })
  @Column('uuid')
  @Index()
  propertyId: string;

  @ManyToOne(() => Property, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'propertyId' })
  property: Property;

  @ApiProperty({ description: 'User who requested the maintenance' })
  @Column('uuid')
  @Index()
  requestedById: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'requestedById' })
  requestedBy: User;

  @ApiProperty({ description: 'User assigned to handle the request', required: false })
  @Column('uuid', { nullable: true })
  @Index()
  assignedToId?: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assignedToId' })
  assignedTo?: User;

  // Location Details
  @ApiProperty({ description: 'Specific location within the property', required: false })
  @Column({ nullable: true })
  location?: string;

  @ApiProperty({ description: 'Unit number if applicable', required: false })
  @Column({ nullable: true })
  unitNumber?: string;

  @ApiProperty({ description: 'Room or area where maintenance is needed', required: false })
  @Column({ nullable: true })
  room?: string;

  @ApiProperty({ description: 'Floor number', required: false })
  @Column({ nullable: true })
  floor?: string;

  // Contact Information
  @ApiProperty({ description: 'Contact name for access', required: false })
  @Column({ nullable: true })
  contactName?: string;

  @ApiProperty({ description: 'Contact phone number', required: false })
  @Column({ nullable: true })
  contactPhone?: string;

  @ApiProperty({ description: 'Contact email', required: false })
  @Column({ nullable: true })
  contactEmail?: string;

  @ApiProperty({ description: 'Best time to contact', required: false })
  @Column({ nullable: true })
  bestTimeToContact?: string;

  // Scheduling
  @ApiProperty({ description: 'Due date for completion', required: false })
  @Column({ type: 'datetime', nullable: true })
  @Index()
  dueDate?: Date;

  @ApiProperty({ description: 'Preferred start date', required: false })
  @Column({ type: 'datetime', nullable: true })
  preferredStartDate?: Date;

  @ApiProperty({ description: 'Preferred completion date', required: false })
  @Column({ type: 'datetime', nullable: true })
  preferredCompletionDate?: Date;

  @ApiProperty({ description: 'Scheduled start date', required: false })
  @Column({ type: 'datetime', nullable: true })
  scheduledStartDate?: Date;

  @ApiProperty({ description: 'Scheduled completion date', required: false })
  @Column({ type: 'datetime', nullable: true })
  scheduledCompletionDate?: Date;

  @ApiProperty({ description: 'Actual start date', required: false })
  @Column({ type: 'datetime', nullable: true })
  actualStartDate?: Date;

  @ApiProperty({ description: 'Actual completion date', required: false })
  @Column({ type: 'datetime', nullable: true })
  actualCompletionDate?: Date;

  // Access Information
  @ApiProperty({ description: 'Whether access is required', required: false })
  @Column({ default: true })
  requiresAccess: boolean;

  @ApiProperty({ description: 'Access instructions', required: false })
  @Column('text', { nullable: true })
  accessInstructions?: string;

  @ApiProperty({ description: 'Key/access code location', required: false })
  @Column({ nullable: true })
  keyLocation?: string;

  @ApiProperty({ description: 'Whether tenant will be present', required: false })
  @Column({ nullable: true })
  tenantPresent?: boolean;

  @ApiProperty({ description: 'Pet information/warnings', required: false })
  @Column('text', { nullable: true })
  petInformation?: string;

  // Cost and Approval
  @ApiProperty({ description: 'Estimated cost', required: false })
  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  estimatedCost?: number;

  @ApiProperty({ description: 'Actual cost', required: false })
  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  actualCost?: number;

  @ApiProperty({ description: 'Currency code', required: false })
  @Column({ default: 'GBP' })
  currency: string;

  @ApiProperty({ description: 'Whether approval is required for cost', required: false })
  @Column({ default: false })
  requiresApproval: boolean;

  @ApiProperty({ description: 'Approval threshold amount', required: false })
  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  approvalThreshold?: number;

  @ApiProperty({ description: 'Whether request is approved', required: false })
  @Column({ nullable: true })
  isApproved?: boolean;

  @ApiProperty({ description: 'User who approved the request', required: false })
  @Column('uuid', { nullable: true })
  approvedById?: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'approvedById' })
  approvedBy?: User;

  @ApiProperty({ description: 'Approval date', required: false })
  @Column({ type: 'datetime', nullable: true })
  approvedAt?: Date;

  @ApiProperty({ description: 'Approval notes', required: false })
  @Column('text', { nullable: true })
  approvalNotes?: string;

  // Work Details
  @ApiProperty({ description: 'Work performed description', required: false })
  @Column('text', { nullable: true })
  workPerformed?: string;

  @ApiProperty({ description: 'Materials used', required: false })
  @Column('text', { nullable: true })
  materialsUsed?: string;

  @ApiProperty({ description: 'Parts replaced', required: false })
  @Column('text', { nullable: true })
  partsReplaced?: string;

  @ApiProperty({ description: 'Labor hours', required: false })
  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  laborHours?: number;

  @ApiProperty({ description: 'Number of workers', required: false })
  @Column({ nullable: true })
  numberOfWorkers?: number;

  // Contractor Information
  @ApiProperty({ description: 'Contractor company name', required: false })
  @Column({ nullable: true })
  contractorCompany?: string;

  @ApiProperty({ description: 'Contractor contact name', required: false })
  @Column({ nullable: true })
  contractorContact?: string;

  @ApiProperty({ description: 'Contractor phone', required: false })
  @Column({ nullable: true })
  contractorPhone?: string;

  @ApiProperty({ description: 'Contractor email', required: false })
  @Column({ nullable: true })
  contractorEmail?: string;

  @ApiProperty({ description: 'Contractor license number', required: false })
  @Column({ nullable: true })
  contractorLicense?: string;

  @ApiProperty({ description: 'Contractor insurance info', required: false })
  @Column('text', { nullable: true })
  contractorInsurance?: string;

  // Quality and Satisfaction
  @ApiProperty({ description: 'Quality rating (1-5)', required: false })
  @Column({ nullable: true })
  qualityRating?: number;

  @ApiProperty({ description: 'Tenant satisfaction rating (1-5)', required: false })
  @Column({ nullable: true })
  satisfactionRating?: number;

  @ApiProperty({ description: 'Tenant feedback', required: false })
  @Column('text', { nullable: true })
  tenantFeedback?: string;

  @ApiProperty({ description: 'Manager notes', required: false })
  @Column('text', { nullable: true })
  managerNotes?: string;

  // Follow-up and Warranty
  @ApiProperty({ description: 'Whether follow-up is required', required: false })
  @Column({ default: false })
  requiresFollowUp: boolean;

  @ApiProperty({ description: 'Follow-up date', required: false })
  @Column({ type: 'datetime', nullable: true })
  followUpDate?: Date;

  @ApiProperty({ description: 'Follow-up notes', required: false })
  @Column('text', { nullable: true })
  followUpNotes?: string;

  @ApiProperty({ description: 'Warranty period in days', required: false })
  @Column({ nullable: true })
  warrantyDays?: number;

  @ApiProperty({ description: 'Warranty expiration date', required: false })
  @Column({ type: 'datetime', nullable: true })
  warrantyExpiresAt?: Date;

  @ApiProperty({ description: 'Warranty details', required: false })
  @Column('text', { nullable: true })
  warrantyDetails?: string;

  // Attachments and Documentation
  @ApiProperty({ description: 'Before photos/documents', required: false })
  @Column('simple-array', { nullable: true })
  beforePhotos?: string[];

  @ApiProperty({ description: 'After photos/documents', required: false })
  @Column('simple-array', { nullable: true })
  afterPhotos?: string[];

  @ApiProperty({ description: 'Additional attachments', required: false })
  @Column('simple-array', { nullable: true })
  attachments?: string[];

  @ApiProperty({ description: 'Invoice/receipt attachments', required: false })
  @Column('simple-array', { nullable: true })
  invoiceAttachments?: string[];

  // Emergency and Safety
  @ApiProperty({ description: 'Whether this is an emergency', required: false })
  @Column({ default: false })
  isEmergency: boolean;

  @ApiProperty({ description: 'Safety concerns', required: false })
  @Column('text', { nullable: true })
  safetyConcerns?: string;

  @ApiProperty({ description: 'Safety measures taken', required: false })
  @Column('text', { nullable: true })
  safetyMeasures?: string;

  @ApiProperty({ description: 'Whether utilities need to be shut off', required: false })
  @Column({ default: false })
  requiresUtilityShutoff: boolean;

  @ApiProperty({ description: 'Utility shutoff details', required: false })
  @Column('text', { nullable: true })
  utilityShutoffDetails?: string;

  // Communication and Notifications
  @ApiProperty({ description: 'Communication log', required: false })
  @Column('text', { nullable: true })
  communicationLog?: Array<{
    timestamp: Date;
    type: string;
    from: string;
    to: string;
    message: string;
    method: string;
  }>;

  @ApiProperty({ description: 'Whether tenant was notified', required: false })
  @Column({ default: false })
  tenantNotified: boolean;

  @ApiProperty({ description: 'Tenant notification date', required: false })
  @Column({ type: 'datetime', nullable: true })
  tenantNotifiedAt?: Date;

  @ApiProperty({ description: 'Notification preferences', required: false })
  @Column('simple-array', { nullable: true })
  notificationPreferences?: string[];

  // Recurring and Preventive
  @ApiProperty({ description: 'Whether this is part of preventive maintenance', required: false })
  @Column({ default: false })
  isPreventive: boolean;

  @ApiProperty({ description: 'Preventive maintenance schedule ID', required: false })
  @Column('uuid', { nullable: true })
  preventiveScheduleId?: string;

  @ApiProperty({ description: 'Whether this is a recurring request', required: false })
  @Column({ default: false })
  isRecurring: boolean;

  @ApiProperty({ description: 'Recurrence pattern', required: false })
  @Column('text', { nullable: true })
  recurrencePattern?: {
    frequency: string;
    interval: number;
    endDate?: Date;
    maxOccurrences?: number;
  };

  @ApiProperty({ description: 'Parent request ID for recurring requests', required: false })
  @Column('uuid', { nullable: true })
  parentRequestId?: string;

  @ManyToOne(() => MaintenanceRequest, { nullable: true })
  @JoinColumn({ name: 'parentRequestId' })
  parentRequest?: MaintenanceRequest;

  @OneToMany(() => MaintenanceRequest, (request) => request.parentRequest)
  childRequests: MaintenanceRequest[];

  @OneToMany(() => WorkOrder, (workOrder) => workOrder.maintenanceRequest)
  workOrders: WorkOrder[];

  // Status Tracking
  @ApiProperty({ description: 'Status history', required: false })
  @Column('text', { nullable: true })
  statusHistory?: Array<{
    status: MaintenanceRequestStatus;
    timestamp: Date;
    changedBy: string;
    notes?: string;
  }>;

  @ApiProperty({ description: 'Assignment history', required: false })
  @Column('text', { nullable: true })
  assignmentHistory?: Array<{
    assignedTo: string;
    assignedBy: string;
    timestamp: Date;
    notes?: string;
  }>;

  // Integration and External References
  @ApiProperty({ description: 'External system reference', required: false })
  @Column({ nullable: true })
  externalReference?: string;

  @ApiProperty({ description: 'Integration metadata', required: false })
  @Column('text', { nullable: true })
  integrationMetadata?: Record<string, any>;

  // Flags and Settings
  @ApiProperty({ description: 'Whether request is urgent', required: false })
  @Column({ default: false })
  isUrgent: boolean;

  @ApiProperty({ description: 'Whether request is on hold', required: false })
  @Column({ default: false })
  isOnHold: boolean;

  @ApiProperty({ description: 'Hold reason', required: false })
  @Column('text', { nullable: true })
  holdReason?: string;

  @ApiProperty({ description: 'Whether request is cancelled', required: false })
  @Column({ default: false })
  isCancelled: boolean;

  @ApiProperty({ description: 'Cancellation reason', required: false })
  @Column('text', { nullable: true })
  cancellationReason?: string;

  @ApiProperty({ description: 'Cancelled by user ID', required: false })
  @Column('uuid', { nullable: true })
  cancelledById?: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'cancelledById' })
  cancelledBy?: User;

  @ApiProperty({ description: 'Cancellation date', required: false })
  @Column({ type: 'datetime', nullable: true })
  cancelledAt?: Date;

  // Additional Metadata
  @ApiProperty({ description: 'Additional metadata', required: false })
  @Column('text', { nullable: true })
  metadata?: Record<string, any>;

  @ApiProperty({ description: 'Tags for categorization', required: false })
  @Column('simple-array', { nullable: true })
  tags?: string[];

  @ApiProperty({ description: 'Custom fields', required: false })
  @Column('text', { nullable: true })
  customFields?: Record<string, any>;

  // Timestamps
  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn()
  @Index()
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty({ description: 'Acknowledgment timestamp', required: false })
  @Column({ type: 'datetime', nullable: true })
  acknowledgedAt?: Date;

  @ApiProperty({ description: 'Assignment timestamp', required: false })
  @Column({ type: 'datetime', nullable: true })
  assignedAt?: Date;

  @ApiProperty({ description: 'Work start timestamp', required: false })
  @Column({ type: 'datetime', nullable: true })
  workStartedAt?: Date;

  @ApiProperty({ description: 'Completion timestamp', required: false })
  @Column({ type: 'datetime', nullable: true })
  completedAt?: Date;

  @ApiProperty({ description: 'Closed timestamp', required: false })
  @Column({ type: 'datetime', nullable: true })
  closedAt?: Date;
}
