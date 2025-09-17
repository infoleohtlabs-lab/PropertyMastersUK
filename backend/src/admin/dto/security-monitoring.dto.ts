import { IsString, IsEnum, IsOptional, IsNumber, IsBoolean, IsArray, IsDate, IsObject, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

// Enums
export enum ThreatType {
  MALWARE = 'malware',
  PHISHING = 'phishing',
  BRUTE_FORCE = 'brute_force',
  DDOS = 'ddos',
  SQL_INJECTION = 'sql_injection',
  XSS = 'xss',
  CSRF = 'csrf',
  UNAUTHORIZED_ACCESS = 'unauthorized_access',
  DATA_BREACH = 'data_breach',
  INSIDER_THREAT = 'insider_threat',
  OTHER = 'other',
}

export enum ThreatSeverity {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  INFO = 'info',
}

export enum ThreatStatus {
  ACTIVE = 'active',
  INVESTIGATING = 'investigating',
  MITIGATED = 'mitigated',
  RESOLVED = 'resolved',
  FALSE_POSITIVE = 'false_positive',
}

export enum AccessType {
  LOGIN = 'login',
  LOGOUT = 'logout',
  API = 'api',
  FILE_ACCESS = 'file_access',
  DATABASE = 'database',
  ADMIN_PANEL = 'admin_panel',
  SYSTEM = 'system',
}

export enum AccessResult {
  SUCCESS = 'success',
  DENIED = 'denied',
  FAILED = 'failed',
  BLOCKED = 'blocked',
}

export enum VulnerabilitySeverity {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  INFO = 'info',
}

export enum VulnerabilityStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  PATCHED = 'patched',
  VERIFIED = 'verified',
  CLOSED = 'closed',
  WONT_FIX = 'wont_fix',
}

export enum AlertSeverity {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  INFO = 'info',
}

export enum AlertStatus {
  ACTIVE = 'active',
  ACKNOWLEDGED = 'acknowledged',
  RESOLVED = 'resolved',
  DISMISSED = 'dismissed',
}

export enum IncidentSeverity {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

export enum IncidentStatus {
  OPEN = 'open',
  INVESTIGATING = 'investigating',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

export enum ScanType {
  VULNERABILITY = 'vulnerability',
  MALWARE = 'malware',
  COMPLIANCE = 'compliance',
  PENETRATION = 'penetration',
  CONFIGURATION = 'configuration',
}

export enum ScanStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  STOPPED = 'stopped',
}

// DTOs
export class SecurityThreatDto {
  @ApiProperty({ enum: ThreatType, description: 'Type of security threat' })
  @IsEnum(ThreatType)
  type: ThreatType;

  @ApiProperty({ enum: ThreatSeverity, description: 'Severity level of the threat' })
  @IsEnum(ThreatSeverity)
  severity: ThreatSeverity;

  @ApiProperty({ description: 'Title of the threat' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Detailed description of the threat' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Source that detected the threat' })
  @IsString()
  source: string;

  @ApiPropertyOptional({ description: 'Target system affected by the threat' })
  @IsOptional()
  @IsString()
  targetSystem?: string;

  @ApiProperty({ description: 'Risk score (0-100)', minimum: 0, maximum: 100 })
  @IsNumber()
  @Min(0)
  @Max(100)
  riskScore: number;

  @ApiPropertyOptional({ description: 'List of affected assets', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  affectedAssets?: string[];

  @ApiPropertyOptional({ description: 'Mitigation steps', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mitigationSteps?: string[];

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  @IsObject()
  metadata?: any;
}

export class SecurityThreatResponseDto extends SecurityThreatDto {
  @ApiProperty({ description: 'Unique identifier' })
  id: string;

  @ApiProperty({ enum: ThreatStatus, description: 'Current status of the threat' })
  status: ThreatStatus;

  @ApiProperty({ description: 'When the threat was detected' })
  detectedAt: Date;

  @ApiPropertyOptional({ description: 'When the threat was resolved' })
  resolvedAt?: Date;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}

export class AccessLogDto {
  @ApiProperty({ description: 'User ID' })
  @IsString()
  userId: string;

  @ApiProperty({ description: 'Username' })
  @IsString()
  username: string;

  @ApiProperty({ enum: AccessType, description: 'Type of access' })
  @IsEnum(AccessType)
  accessType: AccessType;

  @ApiProperty({ description: 'Resource being accessed' })
  @IsString()
  resource: string;

  @ApiProperty({ description: 'Action performed' })
  @IsString()
  action: string;

  @ApiProperty({ enum: AccessResult, description: 'Result of the access attempt' })
  @IsEnum(AccessResult)
  result: AccessResult;

  @ApiProperty({ description: 'IP address of the user' })
  @IsString()
  ipAddress: string;

  @ApiPropertyOptional({ description: 'User agent string' })
  @IsOptional()
  @IsString()
  userAgent?: string;

  @ApiPropertyOptional({ description: 'Geographic location' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ description: 'Session ID' })
  @IsOptional()
  @IsString()
  sessionId?: string;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  @IsObject()
  metadata?: any;
}

export class AccessLogResponseDto extends AccessLogDto {
  @ApiProperty({ description: 'Unique identifier' })
  id: string;

  @ApiProperty({ description: 'Timestamp of the access' })
  timestamp: Date;
}

export class VulnerabilityDto {
  @ApiProperty({ description: 'Title of the vulnerability' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Detailed description' })
  @IsString()
  description: string;

  @ApiProperty({ enum: VulnerabilitySeverity, description: 'Severity level' })
  @IsEnum(VulnerabilitySeverity)
  severity: VulnerabilitySeverity;

  @ApiPropertyOptional({ description: 'CVE identifier' })
  @IsOptional()
  @IsString()
  cveId?: string;

  @ApiProperty({ description: 'Affected system or component' })
  @IsString()
  affectedSystem: string;

  @ApiPropertyOptional({ description: 'Affected version' })
  @IsOptional()
  @IsString()
  affectedVersion?: string;

  @ApiProperty({ description: 'Risk score (0-10)', minimum: 0, maximum: 10 })
  @IsNumber()
  @Min(0)
  @Max(10)
  riskScore: number;

  @ApiProperty({ description: 'Exploitability assessment' })
  @IsString()
  exploitability: string;

  @ApiProperty({ description: 'Impact assessment' })
  @IsString()
  impact: string;

  @ApiPropertyOptional({ description: 'Solution or mitigation' })
  @IsOptional()
  @IsString()
  solution?: string;

  @ApiPropertyOptional({ description: 'Reference links', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  references?: string[];

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  @IsObject()
  metadata?: any;
}

export class VulnerabilityResponseDto extends VulnerabilityDto {
  @ApiProperty({ description: 'Unique identifier' })
  id: string;

  @ApiProperty({ enum: VulnerabilityStatus, description: 'Current status' })
  status: VulnerabilityStatus;

  @ApiProperty({ description: 'When the vulnerability was discovered' })
  discoveredAt: Date;

  @ApiPropertyOptional({ description: 'When the vulnerability was patched' })
  patchedAt?: Date;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}

export class SecurityAlertDto {
  @ApiProperty({ description: 'Type of alert' })
  @IsString()
  type: string;

  @ApiProperty({ enum: AlertSeverity, description: 'Severity level' })
  @IsEnum(AlertSeverity)
  severity: AlertSeverity;

  @ApiProperty({ description: 'Alert title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Alert message' })
  @IsString()
  message: string;

  @ApiProperty({ description: 'Source that triggered the alert' })
  @IsString()
  source: string;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  @IsObject()
  metadata?: any;
}

export class SecurityAlertResponseDto extends SecurityAlertDto {
  @ApiProperty({ description: 'Unique identifier' })
  id: string;

  @ApiProperty({ enum: AlertStatus, description: 'Current status' })
  status: AlertStatus;

  @ApiProperty({ description: 'When the alert was triggered' })
  triggeredAt: Date;

  @ApiPropertyOptional({ description: 'When the alert was acknowledged' })
  acknowledgedAt?: Date;

  @ApiPropertyOptional({ description: 'When the alert was resolved' })
  resolvedAt?: Date;

  @ApiPropertyOptional({ description: 'Who acknowledged the alert' })
  acknowledgedBy?: string;

  @ApiPropertyOptional({ description: 'Who resolved the alert' })
  resolvedBy?: string;
}

export class SecurityAuditDto {
  @ApiProperty({ description: 'Audit title' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: 'Audit description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Type of audit' })
  @IsString()
  auditType: string;

  @ApiProperty({ description: 'Audit scope', type: [String] })
  @IsArray()
  @IsString({ each: true })
  scope: string[];

  @ApiProperty({ description: 'Audit start date' })
  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @ApiPropertyOptional({ description: 'Audit end date' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate?: Date;

  @ApiProperty({ description: 'Auditor name' })
  @IsString()
  auditor: string;

  @ApiPropertyOptional({ description: 'Compliance score (0-100)', minimum: 0, maximum: 100 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  complianceScore?: number;
}

export class SecurityAuditResponseDto extends SecurityAuditDto {
  @ApiProperty({ description: 'Unique identifier' })
  id: string;

  @ApiProperty({ description: 'Audit findings' })
  findings: any[];

  @ApiProperty({ description: 'Audit recommendations' })
  recommendations: any[];

  @ApiProperty({ description: 'Risk level assessment' })
  riskLevel: string;

  @ApiProperty({ description: 'Audit status' })
  status: string;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}

export class SecurityIncidentDto {
  @ApiProperty({ description: 'Incident title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Incident description' })
  @IsString()
  description: string;

  @ApiProperty({ enum: IncidentSeverity, description: 'Severity level' })
  @IsEnum(IncidentSeverity)
  severity: IncidentSeverity;

  @ApiProperty({ description: 'Incident category' })
  @IsString()
  category: string;

  @ApiProperty({ description: 'Who reported the incident' })
  @IsString()
  reportedBy: string;

  @ApiPropertyOptional({ description: 'Who is assigned to handle the incident' })
  @IsOptional()
  @IsString()
  assignedTo?: string;

  @ApiProperty({ description: 'Impact description' })
  @IsString()
  impact: string;

  @ApiProperty({ description: 'Affected systems', type: [String] })
  @IsArray()
  @IsString({ each: true })
  affectedSystems: string[];

  @ApiPropertyOptional({ description: 'Root cause analysis' })
  @IsOptional()
  @IsString()
  rootCause?: string;

  @ApiPropertyOptional({ description: 'Resolution description' })
  @IsOptional()
  @IsString()
  resolution?: string;

  @ApiPropertyOptional({ description: 'Lessons learned', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  lessonsLearned?: string[];

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  @IsObject()
  metadata?: any;
}

export class SecurityIncidentResponseDto extends SecurityIncidentDto {
  @ApiProperty({ description: 'Unique identifier' })
  id: string;

  @ApiProperty({ enum: IncidentStatus, description: 'Current status' })
  status: IncidentStatus;

  @ApiProperty({ description: 'When the incident was reported' })
  reportedAt: Date;

  @ApiPropertyOptional({ description: 'When the incident was resolved' })
  resolvedAt?: Date;

  @ApiProperty({ description: 'Incident timeline' })
  timeline: any[];

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}

export class SecurityPolicyDto {
  @ApiProperty({ description: 'Policy name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Policy description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Policy category' })
  @IsString()
  category: string;

  @ApiProperty({ description: 'Effective date' })
  @Type(() => Date)
  @IsDate()
  effectiveDate: Date;

  @ApiPropertyOptional({ description: 'Expiry date' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  expiryDate?: Date;

  @ApiProperty({ description: 'Who approved the policy' })
  @IsString()
  approvedBy: string;

  @ApiProperty({ description: 'Policy content' })
  @IsObject()
  content: any;

  @ApiProperty({ description: 'Compliance frameworks', type: [String] })
  @IsArray()
  @IsString({ each: true })
  compliance: string[];

  @ApiProperty({ description: 'Applicable roles', type: [String] })
  @IsArray()
  @IsString({ each: true })
  applicableRoles: string[];

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  @IsObject()
  metadata?: any;
}

export class SecurityPolicyResponseDto extends SecurityPolicyDto {
  @ApiProperty({ description: 'Unique identifier' })
  id: string;

  @ApiProperty({ description: 'Policy version' })
  version: string;

  @ApiProperty({ description: 'Whether the policy is active' })
  isActive: boolean;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}

export class SecurityScanDto {
  @ApiProperty({ description: 'Scan name' })
  @IsString()
  name: string;

  @ApiProperty({ enum: ScanType, description: 'Type of scan' })
  @IsEnum(ScanType)
  type: ScanType;

  @ApiProperty({ description: 'Scan target' })
  @IsString()
  target: string;

  @ApiProperty({ description: 'Scan configuration' })
  @IsObject()
  scanConfig: any;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  @IsObject()
  metadata?: any;
}

export class SecurityScanResponseDto extends SecurityScanDto {
  @ApiProperty({ description: 'Unique identifier' })
  id: string;

  @ApiProperty({ enum: ScanStatus, description: 'Current status' })
  status: ScanStatus;

  @ApiProperty({ description: 'When the scan started' })
  startedAt: Date;

  @ApiPropertyOptional({ description: 'When the scan completed' })
  completedAt?: Date;

  @ApiPropertyOptional({ description: 'Scan duration in seconds' })
  duration?: number;

  @ApiProperty({ description: 'Scan findings' })
  findings: any[];

  @ApiProperty({ description: 'Number of vulnerabilities found' })
  vulnerabilitiesFound: number;

  @ApiProperty({ description: 'Overall risk score' })
  riskScore: number;

  @ApiProperty({ description: 'Scan results' })
  results: any;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}

export class SecurityConfigDto {
  @ApiProperty({ description: 'Authentication settings' })
  @IsObject()
  authentication: any;

  @ApiProperty({ description: 'Monitoring settings' })
  @IsObject()
  monitoring: any;

  @ApiProperty({ description: 'Scanning settings' })
  @IsObject()
  scanning: any;

  @ApiProperty({ description: 'Compliance settings' })
  @IsObject()
  compliance: any;

  @ApiProperty({ description: 'Encryption settings' })
  @IsObject()
  encryption: any;
}

export class SecurityConfigResponseDto extends SecurityConfigDto {
  @ApiProperty({ description: 'Unique identifier' })
  id: string;

  @ApiProperty({ description: 'Last modification timestamp' })
  lastModified: Date;

  @ApiProperty({ description: 'Who last modified the configuration' })
  modifiedBy: string;
}

export class SecurityQueryDto {
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

  @ApiPropertyOptional({ description: 'Severity filter' })
  @IsOptional()
  @IsString()
  severity?: string;

  @ApiPropertyOptional({ description: 'Status filter' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'Type filter' })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ description: 'Page number for pagination', minimum: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page', minimum: 1, maximum: 100 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({ description: 'Search term' })
  @IsOptional()
  @IsString()
  search?: string;
}

// Dashboard and Metrics DTOs
export class SecurityDashboardResponseDto {
  @ApiProperty({ description: 'Security overview metrics' })
  overview: {
    totalThreats: number;
    activeThreats: number;
    resolvedThreats: number;
    criticalVulnerabilities: number;
    highVulnerabilities: number;
    mediumVulnerabilities: number;
    lowVulnerabilities: number;
    activeIncidents: number;
    securityScore: number;
  };

  @ApiProperty({ description: 'Recent security threats' })
  recentThreats: any[];

  @ApiProperty({ description: 'Recent security alerts' })
  recentAlerts: any[];

  @ApiProperty({ description: 'Vulnerability trends over time' })
  vulnerabilityTrends: {
    critical: number[];
    high: number[];
    medium: number[];
    low: number[];
  };

  @ApiProperty({ description: 'Threat trends over time' })
  threatTrends: {
    malware: number[];
    phishing: number[];
    bruteForce: number[];
    ddos: number[];
  };

  @ApiProperty({ description: 'Compliance status by framework' })
  complianceStatus: {
    [framework: string]: {
      score: number;
      status: string;
    };
  };

  @ApiProperty({ description: 'Last update timestamp' })
  lastUpdated: Date;
}

export class SecurityMetricsResponseDto {
  @ApiProperty({ description: 'Reporting period' })
  period: string;

  @ApiProperty({ description: 'Threat-related metrics' })
  threatMetrics: {
    totalThreats: number;
    threatsBlocked: number;
    threatsResolved: number;
    averageResolutionTime: number;
    threatsByType: { [type: string]: number };
  };

  @ApiProperty({ description: 'Vulnerability-related metrics' })
  vulnerabilityMetrics: {
    totalVulnerabilities: number;
    patchedVulnerabilities: number;
    criticalVulnerabilities: number;
    averagePatchTime: number;
    vulnerabilitiesBySystem: { [system: string]: number };
  };

  @ApiProperty({ description: 'Access-related metrics' })
  accessMetrics: {
    totalLogins: number;
    failedLogins: number;
    suspiciousActivities: number;
    blockedAttempts: number;
    uniqueUsers: number;
  };

  @ApiProperty({ description: 'Incident-related metrics' })
  incidentMetrics: {
    totalIncidents: number;
    resolvedIncidents: number;
    averageResolutionTime: number;
    incidentsByCategory: { [category: string]: number };
  };

  @ApiProperty({ description: 'Compliance metrics' })
  complianceMetrics: {
    overallScore: number;
    gdprScore: number;
    iso27001Score: number;
    soxScore: number;
    pciScore: number;
  };

  @ApiProperty({ description: 'When the metrics were generated' })
  generatedAt: Date;
}

export class SecurityComplianceResponseDto {
  @ApiProperty({ description: 'Overall compliance score' })
  overallScore: number;

  @ApiProperty({ description: 'Compliance status by framework' })
  frameworks: {
    [framework: string]: {
      score: number;
      status: string;
      lastAssessment: Date;
      nextAssessment: Date;
      gaps: Array<{
        control: string;
        description: string;
      }>;
    };
  };

  @ApiProperty({ description: 'Risk areas requiring attention' })
  riskAreas: Array<{
    area: string;
    riskLevel: string;
    description: string;
  }>;

  @ApiProperty({ description: 'Compliance recommendations' })
  recommendations: string[];

  @ApiProperty({ description: 'Last update timestamp' })
  lastUpdated: Date;
}