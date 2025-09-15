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
import { TenantOrganization } from '../../common/entities/tenant-organization.entity';

export enum RequestType {
  ACCESS = 'access', // Article 15 - Right of access
  RECTIFICATION = 'rectification', // Article 16 - Right to rectification
  ERASURE = 'erasure', // Article 17 - Right to erasure (right to be forgotten)
  RESTRICT_PROCESSING = 'restrict_processing', // Article 18 - Right to restriction of processing
  DATA_PORTABILITY = 'data_portability', // Article 20 - Right to data portability
  OBJECT_PROCESSING = 'object_processing', // Article 21 - Right to object
  OBJECT_AUTOMATED_DECISION = 'object_automated_decision', // Article 22 - Automated decision-making
  WITHDRAW_CONSENT = 'withdraw_consent', // Withdraw consent
  COMPLAINT = 'complaint', // General complaint
  INFORMATION = 'information', // Request for information
}

export enum RequestStatus {
  SUBMITTED = 'submitted',
  ACKNOWLEDGED = 'acknowledged',
  IN_PROGRESS = 'in_progress',
  UNDER_REVIEW = 'under_review',
  PENDING_VERIFICATION = 'pending_verification',
  COMPLETED = 'completed',
  REJECTED = 'rejected',
  PARTIALLY_FULFILLED = 'partially_fulfilled',
  ESCALATED = 'escalated',
  CANCELLED = 'cancelled',
}

export enum RequestPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum VerificationMethod {
  EMAIL = 'email',
  PHONE = 'phone',
  POSTAL = 'postal',
  IN_PERSON = 'in_person',
  DIGITAL_SIGNATURE = 'digital_signature',
  TWO_FACTOR = 'two_factor',
}

export enum RejectionReason {
  IDENTITY_NOT_VERIFIED = 'identity_not_verified',
  REQUEST_UNFOUNDED = 'request_unfounded',
  REQUEST_EXCESSIVE = 'request_excessive',
  LEGAL_EXEMPTION = 'legal_exemption',
  THIRD_PARTY_RIGHTS = 'third_party_rights',
  DISPROPORTIONATE_EFFORT = 'disproportionate_effort',
  ALREADY_PUBLIC = 'already_public',
  FREEDOM_OF_EXPRESSION = 'freedom_of_expression',
  COMPLIANCE_LEGAL_OBLIGATION = 'compliance_legal_obligation',
}

@Entity('data_subject_requests')
@Index(['tenantOrganizationId', 'status'])
@Index(['tenantOrganizationId', 'type'])
@Index(['requesterId'])
@Index(['dueDate'])
@Index(['referenceNumber'])
export class DataSubjectRequest {
  @ApiProperty({ description: 'Unique identifier for the data subject request' })
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

  // Request identification
  @ApiProperty({ description: 'Unique reference number for tracking' })
  @Column('varchar', { length: 50, unique: true })
  referenceNumber: string;

  @ApiProperty({ description: 'Type of data subject request', enum: RequestType })
  @Column({
    type: 'enum',
    enum: RequestType,
  })
  type: RequestType;

  @ApiProperty({ description: 'Current status of the request', enum: RequestStatus })
  @Column({
    type: 'enum',
    enum: RequestStatus,
    default: RequestStatus.SUBMITTED,
  })
  status: RequestStatus;

  @ApiProperty({ description: 'Priority level of the request', enum: RequestPriority })
  @Column({
    type: 'enum',
    enum: RequestPriority,
    default: RequestPriority.MEDIUM,
  })
  priority: RequestPriority;

  // Requester information
  @ApiProperty({ description: 'User who made the request (if registered user)' })
  @Column('uuid', { nullable: true })
  requesterId?: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'requesterId' })
  requester?: User;

  @ApiProperty({ description: 'Full name of the data subject' })
  @Column('varchar', { length: 200 })
  requesterName: string;

  @ApiProperty({ description: 'Email address of the data subject' })
  @Column('varchar', { length: 255 })
  requesterEmail: string;

  @ApiProperty({ description: 'Phone number of the data subject' })
  @Column('varchar', { length: 50, nullable: true })
  requesterPhone?: string;

  @ApiProperty({ description: 'Address of the data subject' })
  @Column('text', { nullable: true })
  requesterAddress?: string;

  @ApiProperty({ description: 'Date of birth for verification' })
  @Column('date', { nullable: true })
  dateOfBirth?: Date;

  @ApiProperty({ description: 'Additional identification information' })
  @Column('text', { nullable: true })
  identificationInfo?: string;

  // Request details
  @ApiProperty({ description: 'Detailed description of the request' })
  @Column('text')
  description: string;

  @ApiProperty({ description: 'Specific data categories requested' })
  @Column('simple-array', { nullable: true })
  dataCategories?: string[];

  @ApiProperty({ description: 'Time period for data requested' })
  @Column('varchar', { length: 100, nullable: true })
  timePeriod?: string;

  @ApiProperty({ description: 'Specific systems or databases mentioned' })
  @Column('simple-array', { nullable: true })
  systemsInvolved?: string[];

  @ApiProperty({ description: 'Preferred format for data delivery' })
  @Column('varchar', { length: 100, nullable: true })
  preferredFormat?: string;

  @ApiProperty({ description: 'Preferred delivery method' })
  @Column('varchar', { length: 100, nullable: true })
  deliveryMethod?: string;

  // Legal basis and justification
  @ApiProperty({ description: 'Legal basis cited by requester' })
  @Column('varchar', { length: 200, nullable: true })
  legalBasis?: string;

  @ApiProperty({ description: 'Justification provided by requester' })
  @Column('text', { nullable: true })
  justification?: string;

  @ApiProperty({ description: 'Whether request affects third party rights' })
  @Column('boolean', { default: false })
  affectsThirdParties: boolean;

  @ApiProperty({ description: 'Details of third party impact' })
  @Column('text', { nullable: true })
  thirdPartyImpact?: string;

  // Verification and identity
  @ApiProperty({ description: 'Whether identity has been verified' })
  @Column('boolean', { default: false })
  identityVerified: boolean;

  @ApiProperty({ description: 'Method used for identity verification', enum: VerificationMethod })
  @Column({
    type: 'enum',
    enum: VerificationMethod,
    nullable: true,
  })
  verificationMethod?: VerificationMethod;

  @ApiProperty({ description: 'When identity was verified' })
  @Column('timestamp', { nullable: true })
  verifiedAt?: Date;

  @ApiProperty({ description: 'Who verified the identity' })
  @Column('uuid', { nullable: true })
  verifiedBy?: string;

  @ApiProperty({ description: 'Verification notes' })
  @Column('text', { nullable: true })
  verificationNotes?: string;

  // Processing and timeline
  @ApiProperty({ description: 'When request was acknowledged' })
  @Column('timestamp', { nullable: true })
  acknowledgedAt?: Date;

  @ApiProperty({ description: 'Due date for completion (30 days from receipt)' })
  @Column('timestamp')
  dueDate: Date;

  @ApiProperty({ description: 'Extended due date if extension granted' })
  @Column('timestamp', { nullable: true })
  extendedDueDate?: Date;

  @ApiProperty({ description: 'Reason for extension' })
  @Column('text', { nullable: true })
  extensionReason?: string;

  @ApiProperty({ description: 'When request was completed' })
  @Column('timestamp', { nullable: true })
  completedAt?: Date;

  // Assignment and handling
  @ApiProperty({ description: 'User assigned to handle the request' })
  @Column('uuid', { nullable: true })
  assignedToId?: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assignedToId' })
  assignedTo?: User;

  @ApiProperty({ description: 'When request was assigned' })
  @Column('timestamp', { nullable: true })
  assignedAt?: Date;

  @ApiProperty({ description: 'Department responsible for handling' })
  @Column('varchar', { length: 100, nullable: true })
  responsibleDepartment?: string;

  // Response and outcome
  @ApiProperty({ description: 'Response provided to the data subject' })
  @Column('text', { nullable: true })
  response?: string;

  @ApiProperty({ description: 'Actions taken to fulfill the request' })
  @Column('text', { nullable: true })
  actionsTaken?: string;

  @ApiProperty({ description: 'Data provided (for access requests)' })
  @Column('text', { nullable: true })
  dataProvided?: string;

  @ApiProperty({ description: 'File paths or references to provided data' })
  @Column('simple-array', { nullable: true })
  attachments?: string[];

  // Rejection details
  @ApiProperty({ description: 'Whether request was rejected' })
  @Column('boolean', { default: false })
  isRejected: boolean;

  @ApiProperty({ description: 'Reason for rejection', enum: RejectionReason })
  @Column({
    type: 'enum',
    enum: RejectionReason,
    nullable: true,
  })
  rejectionReason?: RejectionReason;

  @ApiProperty({ description: 'Detailed explanation of rejection' })
  @Column('text', { nullable: true })
  rejectionExplanation?: string;

  @ApiProperty({ description: 'When request was rejected' })
  @Column('timestamp', { nullable: true })
  rejectedAt?: Date;

  // Fees and costs
  @ApiProperty({ description: 'Whether a fee was charged' })
  @Column('boolean', { default: false })
  feeCharged: boolean;

  @ApiProperty({ description: 'Amount of fee charged' })
  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  feeAmount?: number;

  @ApiProperty({ description: 'Currency of fee' })
  @Column('varchar', { length: 3, nullable: true })
  feeCurrency?: string;

  @ApiProperty({ description: 'Justification for charging fee' })
  @Column('text', { nullable: true })
  feeJustification?: string;

  @ApiProperty({ description: 'Whether fee has been paid' })
  @Column('boolean', { default: false })
  feePaid: boolean;

  // Communication log
  @ApiProperty({ description: 'Communication history with data subject' })
  @Column('jsonb', { nullable: true })
  communicationLog?: Array<{
    timestamp: Date;
    type: string;
    message: string;
    sentBy: string;
    method: string;
  }>;

  // Escalation and appeals
  @ApiProperty({ description: 'Whether request has been escalated' })
  @Column('boolean', { default: false })
  isEscalated: boolean;

  @ApiProperty({ description: 'Escalation reason' })
  @Column('text', { nullable: true })
  escalationReason?: string;

  @ApiProperty({ description: 'When request was escalated' })
  @Column('timestamp', { nullable: true })
  escalatedAt?: Date;

  @ApiProperty({ description: 'Who escalated the request' })
  @Column('uuid', { nullable: true })
  escalatedBy?: string;

  @ApiProperty({ description: 'Whether data subject has appealed' })
  @Column('boolean', { default: false })
  hasAppeal: boolean;

  @ApiProperty({ description: 'Appeal details' })
  @Column('text', { nullable: true })
  appealDetails?: string;

  // Compliance and audit
  @ApiProperty({ description: 'Whether request was completed within deadline' })
  @Column('boolean', { nullable: true })
  completedOnTime?: boolean;

  @ApiProperty({ description: 'Number of days taken to complete' })
  @Column('integer', { nullable: true })
  daysTaken?: number;

  @ApiProperty({ description: 'Compliance notes' })
  @Column('text', { nullable: true })
  complianceNotes?: string;

  @ApiProperty({ description: 'Risk assessment for this request' })
  @Column('text', { nullable: true })
  riskAssessment?: string;

  @ApiProperty({ description: 'Impact on business operations' })
  @Column('text', { nullable: true })
  businessImpact?: string;

  // Source and channel
  @ApiProperty({ description: 'How the request was received' })
  @Column('varchar', { length: 100, nullable: true })
  receivedVia?: string;

  @ApiProperty({ description: 'IP address of requester' })
  @Column('varchar', { length: 45, nullable: true })
  ipAddress?: string;

  @ApiProperty({ description: 'User agent of requester' })
  @Column('text', { nullable: true })
  userAgent?: string;

  @ApiProperty({ description: 'Additional metadata' })
  @Column('jsonb', { nullable: true })
  metadata?: Record<string, any>;

  @ApiProperty({ description: 'When the request was created' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'When the request was last updated' })
  @UpdateDateColumn()
  updatedAt: Date;
}