import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, IsNumber, IsBoolean, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AuditAction, AuditEntityType, AuditSeverity } from '../entities/audit-log.entity';

export class CreateAuditLogDto {
  @ApiProperty({ enum: AuditAction })
  @IsEnum(AuditAction)
  @IsNotEmpty()
  action: AuditAction;

  @ApiProperty({ enum: AuditEntityType })
  @IsEnum(AuditEntityType)
  @IsNotEmpty()
  entityType: AuditEntityType;

  @ApiProperty({ description: 'ID of the entity being audited' })
  @IsString()
  @IsNotEmpty()
  entityId: string;

  @ApiProperty({ description: 'Description of the action performed' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({ enum: AuditSeverity })
  @IsEnum(AuditSeverity)
  @IsOptional()
  severity?: AuditSeverity;

  @ApiPropertyOptional({ description: 'Previous values before the action' })
  @IsObject()
  @IsOptional()
  oldValues?: any;

  @ApiPropertyOptional({ description: 'New values after the action' })
  @IsObject()
  @IsOptional()
  newValues?: any;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsObject()
  @IsOptional()
  metadata?: any;

  @ApiPropertyOptional({ description: 'IP address of the actor' })
  @IsString()
  @IsOptional()
  ipAddress?: string;

  @ApiPropertyOptional({ description: 'User agent of the actor' })
  @IsString()
  @IsOptional()
  userAgent?: string;

  @ApiPropertyOptional({ description: 'Session ID' })
  @IsString()
  @IsOptional()
  sessionId?: string;

  @ApiPropertyOptional({ description: 'Request ID' })
  @IsString()
  @IsOptional()
  requestId?: string;

  @ApiPropertyOptional({ description: 'API endpoint accessed' })
  @IsString()
  @IsOptional()
  endpoint?: string;

  @ApiPropertyOptional({ description: 'HTTP method used' })
  @IsString()
  @IsOptional()
  httpMethod?: string;

  @ApiPropertyOptional({ description: 'HTTP status code' })
  @IsNumber()
  @IsOptional()
  statusCode?: number;

  @ApiPropertyOptional({ description: 'Response time in milliseconds' })
  @IsNumber()
  @IsOptional()
  responseTime?: number;

  @ApiPropertyOptional({ description: 'Error message if any' })
  @IsString()
  @IsOptional()
  errorMessage?: string;

  @ApiPropertyOptional({ description: 'Error stack trace' })
  @IsString()
  @IsOptional()
  errorStack?: string;

  @ApiPropertyOptional({ description: 'Correlation ID for grouping related events' })
  @IsString()
  @IsOptional()
  correlationId?: string;

  @ApiPropertyOptional({ description: 'Business process identifier' })
  @IsString()
  @IsOptional()
  businessProcess?: string;

  @ApiPropertyOptional({ description: 'Risk score (1-10)' })
  @IsNumber()
  @IsOptional()
  riskScore?: number;

  @ApiPropertyOptional({ description: 'Is this a system-generated event?' })
  @IsBoolean()
  @IsOptional()
  isSystemGenerated?: boolean;

  @ApiPropertyOptional({ description: 'Is this a security-related event?' })
  @IsBoolean()
  @IsOptional()
  isSecurityEvent?: boolean;

  @ApiPropertyOptional({ description: 'Is this a compliance-related event?' })
  @IsBoolean()
  @IsOptional()
  isComplianceEvent?: boolean;

  @ApiPropertyOptional({ description: 'Does this event require review?' })
  @IsBoolean()
  @IsOptional()
  requiresReview?: boolean;

  @ApiProperty({ description: 'ID of the user who performed the action' })
  @IsUUID()
  @IsNotEmpty()
  actorId: string;

  @ApiPropertyOptional({ description: 'ID of the user being impersonated (if any)' })
  @IsUUID()
  @IsOptional()
  impersonatorId?: string;
}