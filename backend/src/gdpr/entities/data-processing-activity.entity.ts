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
import { TenantOrganization } from '../../common/entities/tenant-organization.entity';

export enum ProcessingPurpose {
  CONTRACT_PERFORMANCE = 'contract_performance',
  LEGAL_OBLIGATION = 'legal_obligation',
  VITAL_INTERESTS = 'vital_interests',
  PUBLIC_TASK = 'public_task',
  LEGITIMATE_INTERESTS = 'legitimate_interests',
  CONSENT = 'consent',
  MARKETING = 'marketing',
  ANALYTICS = 'analytics',
  SECURITY = 'security',
  CUSTOMER_SERVICE = 'customer_service',
}

export enum DataCategory {
  PERSONAL_DETAILS = 'personal_details',
  CONTACT_INFORMATION = 'contact_information',
  FINANCIAL_DATA = 'financial_data',
  EMPLOYMENT_DATA = 'employment_data',
  LOCATION_DATA = 'location_data',
  BEHAVIORAL_DATA = 'behavioral_data',
  TECHNICAL_DATA = 'technical_data',
  SPECIAL_CATEGORY = 'special_category',
  CRIMINAL_DATA = 'criminal_data',
  BIOMETRIC_DATA = 'biometric_data',
}

export enum ProcessingActivity {
  COLLECTION = 'collection',
  RECORDING = 'recording',
  ORGANIZATION = 'organization',
  STRUCTURING = 'structuring',
  STORAGE = 'storage',
  ADAPTATION = 'adaptation',
  ALTERATION = 'alteration',
  RETRIEVAL = 'retrieval',
  CONSULTATION = 'consultation',
  USE = 'use',
  DISCLOSURE = 'disclosure',
  DISSEMINATION = 'dissemination',
  ALIGNMENT = 'alignment',
  COMBINATION = 'combination',
  RESTRICTION = 'restriction',
  ERASURE = 'erasure',
  DESTRUCTION = 'destruction',
}

export enum RetentionBasis {
  LEGAL_REQUIREMENT = 'legal_requirement',
  BUSINESS_NEED = 'business_need',
  CONSENT_DURATION = 'consent_duration',
  CONTRACT_DURATION = 'contract_duration',
  STATUTORY_LIMITATION = 'statutory_limitation',
  REGULATORY_REQUIREMENT = 'regulatory_requirement',
}

export enum SecurityMeasure {
  ENCRYPTION = 'encryption',
  ACCESS_CONTROL = 'access_control',
  AUDIT_LOGGING = 'audit_logging',
  BACKUP_RECOVERY = 'backup_recovery',
  NETWORK_SECURITY = 'network_security',
  PHYSICAL_SECURITY = 'physical_security',
  STAFF_TRAINING = 'staff_training',
  INCIDENT_RESPONSE = 'incident_response',
  DATA_MINIMIZATION = 'data_minimization',
  PSEUDONYMIZATION = 'pseudonymization',
}

@Entity('data_processing_activities')
@Index(['tenantOrganizationId', 'purpose'])
@Index(['tenantOrganizationId', 'isActive'])
@Index(['reviewDate'])
export class DataProcessingActivity {
  @ApiProperty({ description: 'Unique identifier for the data processing activity' })
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

  // Basic information
  @ApiProperty({ description: 'Name of the processing activity' })
  @Column('varchar', { length: 200 })
  name: string;

  @ApiProperty({ description: 'Detailed description of the processing activity' })
  @Column('text')
  description: string;

  @ApiProperty({ description: 'Purpose of processing', enum: ProcessingPurpose })
  @Column({
    type: 'enum',
    enum: ProcessingPurpose,
  })
  purpose: ProcessingPurpose;

  @ApiProperty({ description: 'Legal basis for processing under GDPR' })
  @Column('varchar', { length: 100 })
  legalBasis: string;

  @ApiProperty({ description: 'Detailed explanation of legal basis' })
  @Column('text', { nullable: true })
  legalBasisDetails?: string;

  // Data subjects
  @ApiProperty({ description: 'Categories of data subjects' })
  @Column('simple-array')
  dataSubjectCategories: string[];

  @ApiProperty({ description: 'Description of data subjects' })
  @Column('text', { nullable: true })
  dataSubjectDescription?: string;

  @ApiProperty({ description: 'Estimated number of data subjects' })
  @Column('integer', { nullable: true })
  estimatedDataSubjects?: number;

  // Personal data
  @ApiProperty({ description: 'Categories of personal data', enum: DataCategory })
  @Column({
    type: 'enum',
    enum: DataCategory,
    array: true,
  })
  dataCategories: DataCategory[];

  @ApiProperty({ description: 'Specific data fields processed' })
  @Column('simple-array', { nullable: true })
  dataFields?: string[];

  @ApiProperty({ description: 'Whether special category data is processed' })
  @Column('boolean', { default: false })
  includesSpecialCategory: boolean;

  @ApiProperty({ description: 'Details of special category data' })
  @Column('text', { nullable: true })
  specialCategoryDetails?: string;

  @ApiProperty({ description: 'Whether criminal conviction data is processed' })
  @Column('boolean', { default: false })
  includesCriminalData: boolean;

  // Processing activities
  @ApiProperty({ description: 'Types of processing activities', enum: ProcessingActivity })
  @Column({
    type: 'enum',
    enum: ProcessingActivity,
    array: true,
  })
  activities: ProcessingActivity[];

  @ApiProperty({ description: 'Detailed description of processing activities' })
  @Column('text', { nullable: true })
  activitiesDescription?: string;

  // Data sources
  @ApiProperty({ description: 'Sources of personal data' })
  @Column('simple-array', { nullable: true })
  dataSources?: string[];

  @ApiProperty({ description: 'Whether data is collected directly from data subjects' })
  @Column('boolean', { default: true })
  directCollection: boolean;

  @ApiProperty({ description: 'Third party sources if not directly collected' })
  @Column('simple-array', { nullable: true })
  thirdPartySources?: string[];

  // Recipients and transfers
  @ApiProperty({ description: 'Categories of recipients' })
  @Column('simple-array', { nullable: true })
  recipientCategories?: string[];

  @ApiProperty({ description: 'Specific recipients of personal data' })
  @Column('simple-array', { nullable: true })
  recipients?: string[];

  @ApiProperty({ description: 'Whether data is transferred to third countries' })
  @Column('boolean', { default: false })
  internationalTransfer: boolean;

  @ApiProperty({ description: 'Countries where data is transferred' })
  @Column('simple-array', { nullable: true })
  transferCountries?: string[];

  @ApiProperty({ description: 'Safeguards for international transfers' })
  @Column('text', { nullable: true })
  transferSafeguards?: string;

  @ApiProperty({ description: 'Adequacy decision or other transfer mechanism' })
  @Column('varchar', { length: 200, nullable: true })
  transferMechanism?: string;

  // Retention
  @ApiProperty({ description: 'Retention period in months' })
  @Column('integer', { nullable: true })
  retentionPeriodMonths?: number;

  @ApiProperty({ description: 'Basis for retention period', enum: RetentionBasis })
  @Column({
    type: 'enum',
    enum: RetentionBasis,
    nullable: true,
  })
  retentionBasis?: RetentionBasis;

  @ApiProperty({ description: 'Detailed retention criteria' })
  @Column('text', { nullable: true })
  retentionCriteria?: string;

  @ApiProperty({ description: 'Deletion procedures' })
  @Column('text', { nullable: true })
  deletionProcedures?: string;

  // Security measures
  @ApiProperty({ description: 'Technical security measures', enum: SecurityMeasure })
  @Column({
    type: 'enum',
    enum: SecurityMeasure,
    array: true,
    nullable: true,
  })
  technicalMeasures?: SecurityMeasure[];

  @ApiProperty({ description: 'Organizational security measures', enum: SecurityMeasure })
  @Column({
    type: 'enum',
    enum: SecurityMeasure,
    array: true,
    nullable: true,
  })
  organizationalMeasures?: SecurityMeasure[];

  @ApiProperty({ description: 'Detailed security measures description' })
  @Column('text', { nullable: true })
  securityDescription?: string;

  // Risk assessment
  @ApiProperty({ description: 'Risk level (1-5 scale)' })
  @Column('integer', { nullable: true })
  riskLevel?: number;

  @ApiProperty({ description: 'Risk assessment details' })
  @Column('text', { nullable: true })
  riskAssessment?: string;

  @ApiProperty({ description: 'Whether DPIA is required' })
  @Column('boolean', { default: false })
  dpiaRequired: boolean;

  @ApiProperty({ description: 'DPIA reference or details' })
  @Column('text', { nullable: true })
  dpiaReference?: string;

  // Compliance and governance
  @ApiProperty({ description: 'Data controller details' })
  @Column('text', { nullable: true })
  dataController?: string;

  @ApiProperty({ description: 'Data processor details' })
  @Column('text', { nullable: true })
  dataProcessor?: string;

  @ApiProperty({ description: 'Joint controllers if applicable' })
  @Column('simple-array', { nullable: true })
  jointControllers?: string[];

  @ApiProperty({ description: 'Data Protection Officer contact' })
  @Column('varchar', { length: 200, nullable: true })
  dpoContact?: string;

  // Review and maintenance
  @ApiProperty({ description: 'When this record was last reviewed' })
  @Column('timestamp', { nullable: true })
  lastReviewDate?: Date;

  @ApiProperty({ description: 'When this record should be reviewed next' })
  @Column('timestamp', { nullable: true })
  reviewDate?: Date;

  @ApiProperty({ description: 'Review frequency in months' })
  @Column('integer', { default: 12 })
  reviewFrequencyMonths: number;

  @ApiProperty({ description: 'Who last reviewed this record' })
  @Column('varchar', { length: 200, nullable: true })
  reviewedBy?: string;

  @ApiProperty({ description: 'Review notes' })
  @Column('text', { nullable: true })
  reviewNotes?: string;

  // Status and lifecycle
  @ApiProperty({ description: 'Whether this processing activity is currently active' })
  @Column('boolean', { default: true })
  isActive: boolean;

  @ApiProperty({ description: 'When processing started' })
  @Column('timestamp', { nullable: true })
  processingStartDate?: Date;

  @ApiProperty({ description: 'When processing ended (if applicable)' })
  @Column('timestamp', { nullable: true })
  processingEndDate?: Date;

  @ApiProperty({ description: 'Version of this record' })
  @Column('integer', { default: 1 })
  version: number;

  @ApiProperty({ description: 'Additional metadata' })
  @Column('jsonb', { nullable: true })
  metadata?: Record<string, any>;

  @ApiProperty({ description: 'When the record was created' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'When the record was last updated' })
  @UpdateDateColumn()
  updatedAt: Date;
}