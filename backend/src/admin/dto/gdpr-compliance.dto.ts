import { IsString, IsEmail, IsArray, IsOptional, IsEnum, IsNumber, IsDate, IsBoolean, ValidateNested, Min, Max } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// Enums
export enum DataSubjectRequestType {
  ACCESS = 'access',
  RECTIFICATION = 'rectification',
  ERASURE = 'erasure',
  PORTABILITY = 'portability',
  RESTRICTION = 'restriction',
  OBJECTION = 'objection',
}

export enum DataSubjectRequestStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}

export enum DataSubjectRequestPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum ConsentStatus {
  ACTIVE = 'active',
  WITHDRAWN = 'withdrawn',
  EXPIRED = 'expired',
  PENDING = 'pending',
}

export enum ConsentType {
  MARKETING = 'marketing',
  ANALYTICS = 'analytics',
  FUNCTIONAL = 'functional',
  PERSONALIZATION = 'personalization',
  THIRD_PARTY = 'third_party',
}

export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum AssessmentStatus {
  DRAFT = 'draft',
  IN_REVIEW = 'in_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  COMPLETED = 'completed',
}

export enum BreachSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum BreachStatus {
  REPORTED = 'reported',
  INVESTIGATING = 'investigating',
  CONTAINED = 'contained',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

export enum AuditType {
  INTERNAL = 'internal',
  EXTERNAL = 'external',
  REGULATORY = 'regulatory',
  THIRD_PARTY = 'third_party',
}

export enum AuditStatus {
  PLANNED = 'planned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum PolicyStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DRAFT = 'draft',
  ARCHIVED = 'archived',
}

export enum ReportType {
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  ANNUAL = 'annual',
  CUSTOM = 'custom',
  INCIDENT = 'incident',
}

export enum LegalBasis {
  CONSENT = 'consent',
  CONTRACT = 'contract',
  LEGAL_OBLIGATION = 'legal_obligation',
  VITAL_INTERESTS = 'vital_interests',
  PUBLIC_TASK = 'public_task',
  LEGITIMATE_INTERESTS = 'legitimate_interests',
}

// Base Query DTO
export class GdprQueryDto {
  @ApiPropertyOptional({ description: 'Page number for pagination' })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Number of items per page' })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Search term' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Status filter' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'Start date for filtering' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startDate?: Date;

  @ApiPropertyOptional({ description: 'End date for filtering' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate?: Date;
}

// Data Processing Activity DTOs
export class DataProcessingActivityDto {
  @ApiProperty({ description: 'Name of the data processing activity' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Purpose of the data processing' })
  @IsString()
  purpose: string;

  @ApiProperty({ description: 'Legal basis for processing', enum: LegalBasis })
  @IsEnum(LegalBasis)
  legalBasis: LegalBasis;

  @ApiProperty({ description: 'Categories of personal data', type: [String] })
  @IsArray()
  @IsString({ each: true })
  dataCategories: string[];

  @ApiProperty({ description: 'Categories of data subjects', type: [String] })
  @IsArray()
  @IsString({ each: true })
  dataSubjects: string[];

  @ApiProperty({ description: 'Recipients of personal data', type: [String] })
  @IsArray()
  @IsString({ each: true })
  recipients: string[];

  @ApiProperty({ description: 'Data retention period' })
  @IsString()
  retentionPeriod: string;

  @ApiProperty({ description: 'Security measures in place', type: [String] })
  @IsArray()
  @IsString({ each: true })
  securityMeasures: string[];
}

export class DataProcessingActivityResponseDto extends DataProcessingActivityDto {
  @ApiProperty({ description: 'Unique identifier' })
  id: string;

  @ApiProperty({ description: 'Activity status' })
  status: string;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  updatedAt: Date;
}

// Data Subject Request DTOs
export class DataSubjectRequestDto {
  @ApiProperty({ description: 'Type of request', enum: DataSubjectRequestType })
  @IsEnum(DataSubjectRequestType)
  type: DataSubjectRequestType;

  @ApiProperty({ description: 'Data subject identifier' })
  @IsString()
  dataSubjectId: string;

  @ApiProperty({ description: 'Email address of the data subject' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Description of the request' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Priority level', enum: DataSubjectRequestPriority })
  @IsEnum(DataSubjectRequestPriority)
  priority: DataSubjectRequestPriority;

  @ApiPropertyOptional({ description: 'Assigned staff member' })
  @IsOptional()
  @IsString()
  assignedTo?: string;

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class DataSubjectRequestResponseDto extends DataSubjectRequestDto {
  @ApiProperty({ description: 'Unique identifier' })
  id: string;

  @ApiProperty({ description: 'Request status', enum: DataSubjectRequestStatus })
  status: DataSubjectRequestStatus;

  @ApiProperty({ description: 'Date when request was made' })
  requestDate: Date;

  @ApiProperty({ description: 'Due date for completion' })
  dueDate: Date;

  @ApiPropertyOptional({ description: 'Date when request was completed' })
  completedDate?: Date;

  @ApiProperty({ description: 'Attached files', type: [String] })
  attachments: string[];
}

// Consent Management DTOs
export class ConsentManagementDto {
  @ApiProperty({ description: 'Consent configuration settings' })
  @IsString()
  configuration: string;

  @ApiPropertyOptional({ description: 'Default consent settings' })
  @IsOptional()
  @IsString()
  defaultSettings?: string;

  @ApiPropertyOptional({ description: 'Consent banner configuration' })
  @IsOptional()
  @IsString()
  bannerConfig?: string;
}

export class ConsentManagementResponseDto {
  @ApiProperty({ description: 'Total number of consent records' })
  totalConsents: number;

  @ApiProperty({ description: 'Number of active consents' })
  activeConsents: number;

  @ApiProperty({ description: 'Number of withdrawn consents' })
  withdrawnConsents: number;

  @ApiProperty({ description: 'Consent types breakdown' })
  consentTypes: {
    type: string;
    count: number;
    percentage: number;
  }[];

  @ApiProperty({ description: 'Recent consent activities' })
  recentActivity: {
    id: string;
    action: string;
    email: string;
    consentType: string;
    timestamp: Date;
  }[];
}

export class ConsentRecordDto {
  @ApiProperty({ description: 'Data subject identifier' })
  @IsString()
  dataSubjectId: string;

  @ApiProperty({ description: 'Email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Type of consent', enum: ConsentType })
  @IsEnum(ConsentType)
  consentType: ConsentType;

  @ApiProperty({ description: 'Purpose of consent' })
  @IsString()
  purpose: string;

  @ApiProperty({ description: 'Consent status', enum: ConsentStatus })
  @IsEnum(ConsentStatus)
  status: ConsentStatus;

  @ApiProperty({ description: 'Source of consent' })
  @IsString()
  source: string;

  @ApiProperty({ description: 'IP address when consent was given' })
  @IsString()
  ipAddress: string;

  @ApiProperty({ description: 'User agent when consent was given' })
  @IsString()
  userAgent: string;

  @ApiProperty({ description: 'Consent version' })
  @IsString()
  version: string;
}

export class ConsentRecordResponseDto extends ConsentRecordDto {
  @ApiProperty({ description: 'Unique identifier' })
  id: string;

  @ApiProperty({ description: 'Date when consent was given' })
  consentDate: Date;

  @ApiPropertyOptional({ description: 'Date when consent was withdrawn' })
  withdrawalDate?: Date;
}

// Privacy Impact Assessment DTOs
export class PrivacyImpactAssessmentDto {
  @ApiProperty({ description: 'Title of the assessment' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Description of the assessment' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Related data processing activity' })
  @IsString()
  dataProcessingActivity: string;

  @ApiProperty({ description: 'Risk level', enum: RiskLevel })
  @IsEnum(RiskLevel)
  riskLevel: RiskLevel;

  @ApiProperty({ description: 'Assessor responsible' })
  @IsString()
  assessor: string;
}

export class PrivacyImpactAssessmentResponseDto extends PrivacyImpactAssessmentDto {
  @ApiProperty({ description: 'Unique identifier' })
  id: string;

  @ApiProperty({ description: 'Assessment status', enum: AssessmentStatus })
  status: AssessmentStatus;

  @ApiProperty({ description: 'Date of assessment' })
  assessmentDate: Date;

  @ApiProperty({ description: 'Next review date' })
  reviewDate: Date;

  @ApiProperty({ description: 'Assessment findings', type: [String] })
  findings: string[];

  @ApiProperty({ description: 'Recommendations', type: [String] })
  recommendations: string[];

  @ApiProperty({ description: 'Mitigation measures', type: [String] })
  mitigationMeasures: string[];
}

// Data Breach Report DTOs
export class DataBreachReportDto {
  @ApiProperty({ description: 'Title of the breach report' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Description of the breach' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Severity of the breach', enum: BreachSeverity })
  @IsEnum(BreachSeverity)
  severity: BreachSeverity;

  @ApiProperty({ description: 'Date when breach was discovered' })
  @Type(() => Date)
  @IsDate()
  discoveryDate: Date;

  @ApiProperty({ description: 'Number of affected data subjects' })
  @IsNumber()
  @Min(0)
  affectedDataSubjects: number;

  @ApiProperty({ description: 'Categories of data affected', type: [String] })
  @IsArray()
  @IsString({ each: true })
  dataCategories: string[];

  @ApiProperty({ description: 'Cause of the breach' })
  @IsString()
  cause: string;

  @ApiProperty({ description: 'Containment measures taken', type: [String] })
  @IsArray()
  @IsString({ each: true })
  containmentMeasures: string[];
}

export class DataBreachReportResponseDto extends DataBreachReportDto {
  @ApiProperty({ description: 'Unique identifier' })
  id: string;

  @ApiProperty({ description: 'Breach status', enum: BreachStatus })
  status: BreachStatus;

  @ApiProperty({ description: 'Date when breach was reported' })
  reportDate: Date;

  @ApiProperty({ description: 'Whether notification to regulator is required' })
  notificationRequired: boolean;

  @ApiProperty({ description: 'Whether regulator has been notified' })
  regulatorNotified: boolean;

  @ApiProperty({ description: 'Whether data subjects have been notified' })
  dataSubjectsNotified: boolean;
}

// Compliance Audit DTOs
export class ComplianceAuditDto {
  @ApiProperty({ description: 'Title of the audit' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Type of audit', enum: AuditType })
  @IsEnum(AuditType)
  type: AuditType;

  @ApiProperty({ description: 'Scope of the audit', type: [String] })
  @IsArray()
  @IsString({ each: true })
  scope: string[];

  @ApiProperty({ description: 'Auditor responsible' })
  @IsString()
  auditor: string;
}

export class ComplianceAuditResponseDto extends ComplianceAuditDto {
  @ApiProperty({ description: 'Unique identifier' })
  id: string;

  @ApiProperty({ description: 'Audit status', enum: AuditStatus })
  status: AuditStatus;

  @ApiProperty({ description: 'Start date of audit' })
  startDate: Date;

  @ApiPropertyOptional({ description: 'End date of audit' })
  endDate?: Date;

  @ApiProperty({ description: 'Audit findings' })
  findings: any[];

  @ApiProperty({ description: 'Audit recommendations', type: [String] })
  recommendations: string[];

  @ApiProperty({ description: 'Compliance score' })
  @Min(0)
  @Max(100)
  complianceScore: number;
}

// Data Retention Policy DTOs
export class DataRetentionPolicyDto {
  @ApiProperty({ description: 'Name of the retention policy' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Description of the policy' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Data category covered' })
  @IsString()
  dataCategory: string;

  @ApiProperty({ description: 'Retention period' })
  @IsString()
  retentionPeriod: string;

  @ApiProperty({ description: 'Legal basis for retention', enum: LegalBasis })
  @IsEnum(LegalBasis)
  legalBasis: LegalBasis;

  @ApiProperty({ description: 'Method of disposal' })
  @IsString()
  disposalMethod: string;
}

export class DataRetentionPolicyResponseDto extends DataRetentionPolicyDto {
  @ApiProperty({ description: 'Unique identifier' })
  id: string;

  @ApiProperty({ description: 'Policy status', enum: PolicyStatus })
  status: PolicyStatus;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  updatedAt: Date;
}

// Data Mapping DTOs
export class DataMappingDto {
  @ApiProperty({ description: 'Name of the system' })
  @IsString()
  systemName: string;

  @ApiProperty({ description: 'Category of data' })
  @IsString()
  dataCategory: string;

  @ApiProperty({ description: 'Data fields', type: [String] })
  @IsArray()
  @IsString({ each: true })
  dataFields: string[];

  @ApiProperty({ description: 'Purpose of data processing' })
  @IsString()
  purpose: string;

  @ApiProperty({ description: 'Legal basis', enum: LegalBasis })
  @IsEnum(LegalBasis)
  legalBasis: LegalBasis;

  @ApiProperty({ description: 'Data flow description' })
  @IsString()
  dataFlow: string;

  @ApiProperty({ description: 'Security measures', type: [String] })
  @IsArray()
  @IsString({ each: true })
  securityMeasures: string[];

  @ApiProperty({ description: 'Access controls', type: [String] })
  @IsArray()
  @IsString({ each: true })
  accessControls: string[];

  @ApiProperty({ description: 'Retention period' })
  @IsString()
  retentionPeriod: string;
}

export class DataMappingResponseDto extends DataMappingDto {
  @ApiProperty({ description: 'Unique identifier' })
  id: string;
}

// Data Export and Deletion DTOs
export class DataExportRequestDto {
  @ApiProperty({ description: 'Data subject identifier' })
  @IsString()
  dataSubjectId: string;

  @ApiProperty({ description: 'Email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Data categories to export', type: [String] })
  @IsArray()
  @IsString({ each: true })
  dataCategories: string[];

  @ApiProperty({ description: 'Export format' })
  @IsString()
  format: string;

  @ApiPropertyOptional({ description: 'Date range start' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startDate?: Date;

  @ApiPropertyOptional({ description: 'Date range end' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate?: Date;
}

export class DataDeletionRequestDto {
  @ApiProperty({ description: 'Data subject identifier' })
  @IsString()
  dataSubjectId: string;

  @ApiProperty({ description: 'Email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Data categories to delete', type: [String] })
  @IsArray()
  @IsString({ each: true })
  dataCategories: string[];

  @ApiProperty({ description: 'Reason for deletion' })
  @IsString()
  reason: string;

  @ApiProperty({ description: 'Confirmation of deletion request' })
  @IsBoolean()
  confirmed: boolean;
}

// Compliance Report DTOs
export class ComplianceReportDto {
  @ApiProperty({ description: 'Report title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Report type', enum: ReportType })
  @IsEnum(ReportType)
  type: ReportType;

  @ApiProperty({ description: 'Report period' })
  @ValidateNested()
  @Type(() => ReportPeriodDto)
  period: ReportPeriodDto;

  @ApiPropertyOptional({ description: 'Additional parameters' })
  @IsOptional()
  parameters?: any;
}

export class ReportPeriodDto {
  @ApiProperty({ description: 'Start date of report period' })
  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @ApiProperty({ description: 'End date of report period' })
  @Type(() => Date)
  @IsDate()
  endDate: Date;
}

export class ComplianceReportResponseDto {
  @ApiProperty({ description: 'Unique identifier' })
  id: string;

  @ApiProperty({ description: 'Report title' })
  title: string;

  @ApiProperty({ description: 'Report type' })
  type: string;

  @ApiProperty({ description: 'Report period' })
  period: {
    startDate: Date;
    endDate: Date;
  };

  @ApiProperty({ description: 'Generation date' })
  generatedAt: Date;

  @ApiProperty({ description: 'Generated by' })
  generatedBy: string;

  @ApiProperty({ description: 'Report status' })
  status: string;

  @ApiProperty({ description: 'Report summary' })
  summary: {
    totalDataSubjects: number;
    newDataSubjectRequests: number;
    completedRequests: number;
    pendingRequests: number;
    dataBreaches: number;
    complianceScore: number;
  };

  @ApiPropertyOptional({ description: 'Download URL for the report' })
  downloadUrl?: string;
}

// Status Update DTOs
export class StatusUpdateDto {
  @ApiProperty({ description: 'New status' })
  @IsString()
  status: string;

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

// Dashboard DTOs
export class ComplianceDashboardDto {
  @ApiProperty({ description: 'Total number of data subjects' })
  totalDataSubjects: number;

  @ApiProperty({ description: 'Number of active consents' })
  activeConsents: number;

  @ApiProperty({ description: 'Number of pending requests' })
  pendingRequests: number;

  @ApiProperty({ description: 'Number of completed audits' })
  completedAudits: number;

  @ApiProperty({ description: 'Number of data breaches' })
  dataBreaches: number;

  @ApiProperty({ description: 'Overall compliance score' })
  complianceScore: number;

  @ApiProperty({ description: 'Recent activities' })
  recentActivities: any[];
}

export class ComplianceStatusDto {
  @ApiProperty({ description: 'Overall compliance score' })
  overallScore: number;

  @ApiProperty({ description: 'Category scores' })
  categories: {
    dataProcessing: number;
    consentManagement: number;
    dataSubjectRights: number;
    securityMeasures: number;
    documentation: number;
  };

  @ApiProperty({ description: 'Recommendations for improvement', type: [String] })
  recommendations: string[];

  @ApiProperty({ description: 'Last audit date' })
  lastAuditDate: Date;

  @ApiProperty({ description: 'Next audit due date' })
  nextAuditDue: Date;
}