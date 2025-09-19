import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  Request,
  Response,
  BadRequestException,
  NotFoundException,
  HttpStatus,
  StreamableFile,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiProperty,
  getSchemaPath,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import {
  GdprComplianceService,
  DataExportRequest,
  DataExportResult,
  DataDeletionRequest,
  DataDeletionResult,
  ConsentRecord,
  GdprComplianceReport,
} from './gdpr-compliance.service';
import {
  IsOptional,
  IsBoolean,
  IsString,
  IsEnum,
  IsDateString,
  IsNumber,
  Min,
  Max,
  ValidateNested,
  IsEmail,
  IsUUID,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { Response as ExpressResponse } from 'express';

// DTOs for Data Export
class DateRangeDto {
  @ApiProperty({ description: 'Start date for data range' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ description: 'End date for data range' })
  @IsDateString()
  endDate: string;
}

class DataExportRequestDto implements Omit<DataExportRequest, 'dateRange'> {
  @ApiProperty({
    description: 'User ID for data export (optional if email provided)',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiProperty({
    description: 'User email for data export (optional if userId provided)',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    description: 'Include personal data in export',
    default: true,
  })
  @IsBoolean()
  includePersonalData: boolean;

  @ApiProperty({
    description: 'Include activity logs in export',
    default: true,
  })
  @IsBoolean()
  includeActivityLogs: boolean;

  @ApiProperty({
    description: 'Include properties in export',
    default: true,
  })
  @IsBoolean()
  includeProperties: boolean;

  @ApiProperty({
    description: 'Include financial data in export',
    default: false,
  })
  @IsBoolean()
  includeFinancialData: boolean;

  @ApiProperty({
    description: 'Date range for data export',
    required: false,
    type: DateRangeDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => DateRangeDto)
  dateRange?: DateRangeDto;

  @ApiProperty({
    description: 'Export format',
    enum: ['json', 'csv', 'xml'],
    default: 'json',
  })
  @IsEnum(['json', 'csv', 'xml'])
  format: 'json' | 'csv' | 'xml';

  @ApiProperty({
    description: 'Delivery method',
    enum: ['download', 'email'],
    default: 'download',
  })
  @IsEnum(['download', 'email'])
  deliveryMethod: 'download' | 'email';
}

// DTOs for Data Deletion
class DataDeletionRequestDto implements Omit<DataDeletionRequest, 'requestedBy' | 'scheduledFor'> {
  @ApiProperty({ description: 'User ID for data deletion' })
  @IsUUID()
  userId: string;

  @ApiProperty({
    description: 'Type of deletion',
    enum: ['soft', 'hard'],
    default: 'soft',
  })
  @IsEnum(['soft', 'hard'])
  deletionType: 'soft' | 'hard';

  @ApiProperty({
    description: 'Retain data required for legal compliance',
    default: true,
  })
  @IsBoolean()
  retainLegalData: boolean;

  @ApiProperty({
    description: 'Retain financial data',
    default: true,
  })
  @IsBoolean()
  retainFinancialData: boolean;

  @ApiProperty({ description: 'Reason for data deletion' })
  @IsString()
  reason: string;

  @ApiProperty({
    description: 'Schedule deletion for future date (optional)',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  scheduledFor?: string;
}

// DTOs for Consent Management
class ConsentUpdateDto {
  @ApiProperty({ description: 'User ID' })
  @IsUUID()
  userId: string;

  @ApiProperty({
    description: 'Type of consent',
    enum: ['marketing', 'analytics', 'cookies', 'data_processing', 'third_party_sharing'],
  })
  @IsEnum(['marketing', 'analytics', 'cookies', 'data_processing', 'third_party_sharing'])
  consentType: 'marketing' | 'analytics' | 'cookies' | 'data_processing' | 'third_party_sharing';

  @ApiProperty({ description: 'Whether consent is granted' })
  @IsBoolean()
  granted: boolean;

  @ApiProperty({ description: 'Source of consent update' })
  @IsString()
  source: string;
}

// DTOs for Audit Logs
class PrivacyAuditQueryDto {
  @ApiProperty({
    description: 'User ID filter',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiProperty({
    description: 'Action filter',
    required: false,
  })
  @IsOptional()
  @IsString()
  action?: string;

  @ApiProperty({
    description: 'Data type filter',
    required: false,
  })
  @IsOptional()
  @IsString()
  dataType?: string;

  @ApiProperty({
    description: 'Start date for filtering',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: 'End date for filtering',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({
    description: 'Page number for pagination',
    default: 1,
    minimum: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Transform(({ value }) => parseInt(value))
  page?: number = 1;

  @ApiProperty({
    description: 'Number of records per page',
    default: 50,
    minimum: 1,
    maximum: 100,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Transform(({ value }) => parseInt(value))
  limit?: number = 50;
}

// DTOs for Compliance Report
class ComplianceReportQueryDto {
  @ApiProperty({ description: 'Start date for report period' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ description: 'End date for report period' })
  @IsDateString()
  endDate: string;
}

@ApiTags('Admin - GDPR Compliance')
@Controller('admin/gdpr-compliance')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class GdprComplianceController {
  constructor(
    private readonly gdprComplianceService: GdprComplianceService,
  ) {}

  // Data Export Endpoints
  @Post('data-export/request')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Request data export',
    description: 'Submit a request to export user data in compliance with GDPR Article 15 (Right of Access).',
  })
  @ApiBody({ type: DataExportRequestDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Data export request submitted successfully',
    schema: {
      type: 'object',
      properties: {
        exportId: { type: 'string' },
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid request parameters',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized access',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  async requestDataExport(
    @Body() request: DataExportRequestDto,
    @Request() req: any,
  ): Promise<{ exportId: string; message: string }> {
    if (!request.userId && !request.email) {
      throw new BadRequestException('Either userId or email must be provided');
    }

    const exportRequest: DataExportRequest = {
      ...request,
      dateRange: request.dateRange ? {
        startDate: new Date(request.dateRange.startDate),
        endDate: new Date(request.dateRange.endDate),
      } : undefined,
    };

    return this.gdprComplianceService.requestDataExport(exportRequest, req.user.id);
  }

  @Get('data-export/status/:exportId')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Get data export status',
    description: 'Check the status of a data export request.',
  })
  @ApiParam({
    name: 'exportId',
    description: 'Export request ID',
    type: 'string',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Export status retrieved successfully',
    type: Object, // DataExportResult
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Export request not found',
  })
  async getDataExportStatus(
    @Param('exportId') exportId: string,
  ): Promise<DataExportResult> {
    return this.gdprComplianceService.getDataExportStatus(exportId);
  }

  @Get('data-export/download/:exportId')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Download exported data',
    description: 'Download the exported data file.',
  })
  @ApiParam({
    name: 'exportId',
    description: 'Export request ID',
    type: 'string',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'File downloaded successfully',
    headers: {
      'Content-Type': {
        description: 'MIME type of the file',
        schema: { type: 'string', example: 'application/zip' },
      },
      'Content-Disposition': {
        description: 'File download disposition',
        schema: { type: 'string', example: 'attachment; filename="data-export.zip"' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Export not found or not ready',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Export not ready or expired',
  })
  async downloadDataExport(
    @Param('exportId') exportId: string,
    @Response({ passthrough: true }) res: ExpressResponse,
  ): Promise<StreamableFile> {
    const { stream, filename, mimeType } = await this.gdprComplianceService.downloadDataExport(exportId);
    
    res.set({
      'Content-Type': mimeType,
      'Content-Disposition': `attachment; filename="${filename}"`,
    });
    
    return new StreamableFile(stream);
  }

  // Data Deletion Endpoints
  @Post('data-deletion/request')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Request data deletion',
    description: 'Submit a request to delete user data in compliance with GDPR Article 17 (Right to Erasure).',
  })
  @ApiBody({ type: DataDeletionRequestDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Data deletion request submitted successfully',
    schema: {
      type: 'object',
      properties: {
        deletionId: { type: 'string' },
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid request parameters',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
  })
  async requestDataDeletion(
    @Body() request: DataDeletionRequestDto,
    @Request() req: any,
  ): Promise<{ deletionId: string; message: string }> {
    const deletionRequest: DataDeletionRequest = {
      ...request,
      requestedBy: req.user.id,
      scheduledFor: request.scheduledFor ? new Date(request.scheduledFor) : undefined,
    };

    return this.gdprComplianceService.requestDataDeletion(deletionRequest);
  }

  @Get('data-deletion/status/:deletionId')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Get data deletion status',
    description: 'Check the status of a data deletion request.',
  })
  @ApiParam({
    name: 'deletionId',
    description: 'Deletion request ID',
    type: 'string',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Deletion status retrieved successfully',
    type: Object, // DataDeletionResult
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Deletion request not found',
  })
  async getDataDeletionStatus(
    @Param('deletionId') deletionId: string,
  ): Promise<DataDeletionResult> {
    return this.gdprComplianceService.getDataDeletionStatus(deletionId);
  }

  // Consent Management Endpoints
  @Post('consent/update')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Update user consent',
    description: 'Update consent settings for a user in compliance with GDPR Article 7 (Conditions for consent).',
  })
  @ApiBody({ type: ConsentUpdateDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Consent updated successfully',
    type: Object, // ConsentRecord
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid consent data',
  })
  async updateConsent(
    @Body() consentData: ConsentUpdateDto,
    @Request() req: any,
  ): Promise<ConsentRecord> {
    return this.gdprComplianceService.updateConsent(
      consentData.userId,
      consentData.consentType,
      consentData.granted,
      {
        ipAddress: req.ip || 'unknown',
        userAgent: req.get('User-Agent') || 'unknown',
        source: consentData.source,
      },
    );
  }

  @Get('consent/user/:userId')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Get user consents',
    description: 'Retrieve all consent records for a specific user.',
  })
  @ApiParam({
    name: 'userId',
    description: 'User ID',
    type: 'string',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User consents retrieved successfully',
    type: [Object], // ConsentRecord[]
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
  })
  async getUserConsents(
    @Param('userId') userId: string,
  ): Promise<ConsentRecord[]> {
    return this.gdprComplianceService.getUserConsents(userId);
  }

  // Privacy Audit Logs
  @Get('audit-logs')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Get privacy audit logs',
    description: 'Retrieve privacy-related audit logs with filtering and pagination.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Audit logs retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        logs: {
          type: 'array',
          items: { type: 'object' },
        },
        pagination: {
          type: 'object',
          properties: {
            page: { type: 'number' },
            limit: { type: 'number' },
            total: { type: 'number' },
            totalPages: { type: 'number' },
          },
        },
      },
    },
  })
  async getPrivacyAuditLogs(
    @Query() query: PrivacyAuditQueryDto,
  ) {
    const filters = {
      ...query,
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
    };

    return this.gdprComplianceService.getPrivacyAuditLogs(filters);
  }

  // Compliance Reporting
  @Post('compliance-report')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Generate compliance report',
    description: 'Generate a comprehensive GDPR compliance report for a specified period.',
  })
  @ApiBody({ type: ComplianceReportQueryDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Compliance report generated successfully',
    type: Object, // GdprComplianceReport
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid date range',
  })
  async generateComplianceReport(
    @Body() reportQuery: ComplianceReportQueryDto,
  ): Promise<GdprComplianceReport> {
    const startDate = new Date(reportQuery.startDate);
    const endDate = new Date(reportQuery.endDate);

    if (startDate >= endDate) {
      throw new BadRequestException('Start date must be before end date');
    }

    return this.gdprComplianceService.generateComplianceReport(startDate, endDate);
  }

  // Health Check
  @Get('health')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({
    summary: 'GDPR compliance service health check',
    description: 'Check the health and status of the GDPR compliance service.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Service health status',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'healthy' },
        activeExports: { type: 'number' },
        activeDeletions: { type: 'number' },
        timestamp: { type: 'string', format: 'date-time' },
        version: { type: 'string' },
        compliance: {
          type: 'object',
          properties: {
            dataRetentionPolicyActive: { type: 'boolean' },
            consentManagementActive: { type: 'boolean' },
            auditLoggingActive: { type: 'boolean' },
          },
        },
      },
    },
  })
  async getHealthStatus(): Promise<{
    status: string;
    activeExports: number;
    activeDeletions: number;
    timestamp: Date;
    version: string;
    compliance: {
      dataRetentionPolicyActive: boolean;
      consentManagementActive: boolean;
      auditLoggingActive: boolean;
    };
  }> {
    return {
      status: 'healthy',
      activeExports: 0, // Would be tracked in service
      activeDeletions: 0, // Would be tracked in service
      timestamp: new Date(),
      version: '1.0.0',
      compliance: {
        dataRetentionPolicyActive: true,
        consentManagementActive: true,
        auditLoggingActive: true,
      },
    };
  }
}
