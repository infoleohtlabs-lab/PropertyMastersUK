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

export enum ConsentType {
  DATA_PROCESSING = 'data_processing',
  MARKETING = 'marketing',
  ANALYTICS = 'analytics',
  COOKIES = 'cookies',
  THIRD_PARTY_SHARING = 'third_party_sharing',
  COMMUNICATION = 'communication',
  LOCATION_TRACKING = 'location_tracking',
  PROFILING = 'profiling',
}

export enum ConsentStatus {
  GRANTED = 'granted',
  DENIED = 'denied',
  WITHDRAWN = 'withdrawn',
  EXPIRED = 'expired',
}

export enum ConsentMethod {
  EXPLICIT = 'explicit',
  IMPLIED = 'implied',
  OPT_IN = 'opt_in',
  OPT_OUT = 'opt_out',
  LEGITIMATE_INTEREST = 'legitimate_interest',
}

@Entity('consents')
@Index(['tenantOrganizationId', 'userId', 'type'])
@Index(['tenantOrganizationId', 'status'])
@Index(['expiresAt'])
export class Consent {
  @ApiProperty({ description: 'Unique identifier for the consent record' })
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

  // User relationship
  @ApiProperty({ description: 'User who gave or denied consent' })
  @Column('uuid')
  @Index()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  // Consent details
  @ApiProperty({ description: 'Type of consent', enum: ConsentType })
  @Column({
    type: 'enum',
    enum: ConsentType,
  })
  type: ConsentType;

  @ApiProperty({ description: 'Current status of consent', enum: ConsentStatus })
  @Column({
    type: 'enum',
    enum: ConsentStatus,
  })
  status: ConsentStatus;

  @ApiProperty({ description: 'Method used to obtain consent', enum: ConsentMethod })
  @Column({
    type: 'enum',
    enum: ConsentMethod,
  })
  method: ConsentMethod;

  @ApiProperty({ description: 'Purpose for which consent is requested' })
  @Column('text')
  purpose: string;

  @ApiProperty({ description: 'Detailed description of data processing' })
  @Column('text', { nullable: true })
  description?: string;

  @ApiProperty({ description: 'Legal basis for processing under GDPR' })
  @Column('varchar', { length: 100, nullable: true })
  legalBasis?: string;

  // Consent lifecycle
  @ApiProperty({ description: 'When consent was given or denied' })
  @Column('timestamp')
  consentGivenAt: Date;

  @ApiProperty({ description: 'When consent expires (if applicable)' })
  @Column('timestamp', { nullable: true })
  expiresAt?: Date;

  @ApiProperty({ description: 'When consent was withdrawn (if applicable)' })
  @Column('timestamp', { nullable: true })
  withdrawnAt?: Date;

  @ApiProperty({ description: 'Reason for withdrawal' })
  @Column('text', { nullable: true })
  withdrawalReason?: string;

  // Audit and compliance
  @ApiProperty({ description: 'IP address when consent was given' })
  @Column('varchar', { length: 45, nullable: true })
  ipAddress?: string;

  @ApiProperty({ description: 'User agent when consent was given' })
  @Column('text', { nullable: true })
  userAgent?: string;

  @ApiProperty({ description: 'Source/context where consent was obtained' })
  @Column('varchar', { length: 100, nullable: true })
  source?: string;

  @ApiProperty({ description: 'Version of privacy policy/terms when consent was given' })
  @Column('varchar', { length: 50, nullable: true })
  policyVersion?: string;

  @ApiProperty({ description: 'Language used when obtaining consent' })
  @Column('varchar', { length: 10, nullable: true })
  language?: string;

  // Data categories
  @ApiProperty({ description: 'Categories of personal data covered by this consent' })
  @Column('simple-array', { nullable: true })
  dataCategories?: string[];

  @ApiProperty({ description: 'Third parties data may be shared with' })
  @Column('simple-array', { nullable: true })
  thirdParties?: string[];

  @ApiProperty({ description: 'Countries where data may be transferred' })
  @Column('simple-array', { nullable: true })
  transferCountries?: string[];

  // Renewal and reminders
  @ApiProperty({ description: 'Whether consent needs periodic renewal' })
  @Column('boolean', { default: false })
  requiresRenewal: boolean;

  @ApiProperty({ description: 'Interval in days for consent renewal' })
  @Column('integer', { nullable: true })
  renewalIntervalDays?: number;

  @ApiProperty({ description: 'When last renewal reminder was sent' })
  @Column('timestamp', { nullable: true })
  lastReminderSent?: Date;

  @ApiProperty({ description: 'Number of renewal reminders sent' })
  @Column('integer', { default: 0 })
  reminderCount: number;

  // Granular permissions
  @ApiProperty({ description: 'Specific permissions granted within this consent type' })
  @Column('jsonb', { nullable: true })
  permissions?: Record<string, boolean>;

  @ApiProperty({ description: 'Additional metadata for consent record' })
  @Column('jsonb', { nullable: true })
  metadata?: Record<string, any>;

  // Parent/child consent relationships
  @ApiProperty({ description: 'Parent consent ID for dependent consents' })
  @Column('uuid', { nullable: true })
  parentConsentId?: string;

  @ManyToOne(() => Consent, { nullable: true })
  @JoinColumn({ name: 'parentConsentId' })
  parentConsent?: Consent;

  // Compliance flags
  @ApiProperty({ description: 'Whether this consent is required by law' })
  @Column('boolean', { default: false })
  isRequired: boolean;

  @ApiProperty({ description: 'Whether user can withdraw this consent' })
  @Column('boolean', { default: true })
  canWithdraw: boolean;

  @ApiProperty({ description: 'Whether this consent affects other services' })
  @Column('boolean', { default: false })
  hasImpact: boolean;

  @ApiProperty({ description: 'Impact description if consent is withdrawn' })
  @Column('text', { nullable: true })
  impactDescription?: string;

  // Verification
  @ApiProperty({ description: 'Whether consent has been verified' })
  @Column('boolean', { default: false })
  isVerified: boolean;

  @ApiProperty({ description: 'When consent was verified' })
  @Column('timestamp', { nullable: true })
  verifiedAt?: Date;

  @ApiProperty({ description: 'Who verified the consent' })
  @Column('uuid', { nullable: true })
  verifiedBy?: string;

  @ApiProperty({ description: 'Verification method used' })
  @Column('varchar', { length: 100, nullable: true })
  verificationMethod?: string;

  @ApiProperty({ description: 'When the consent record was created' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'When the consent record was last updated' })
  @UpdateDateColumn()
  updatedAt: Date;
}