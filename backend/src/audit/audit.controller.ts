import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiBody,
  getSchemaPath,
} from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { UpdateAuditLogDto } from './dto/update-audit-log.dto';
import { AuditLog, AuditAction, AuditEntityType, AuditSeverity } from './entities/audit-log.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('audit')
@Controller('audit')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new audit log entry' })
  @ApiResponse({ status: 201, description: 'Audit log created successfully', schema: { $ref: getSchemaPath(AuditLog) } })
  @Roles(UserRole.ADMIN)
  async create(@Body() createAuditLogDto: CreateAuditLogDto): Promise<AuditLog> {
    return this.auditService.create(createAuditLogDto);
  }

  @Post('log-action')
  @ApiOperation({ summary: 'Log a user action' })
  @ApiResponse({ status: 201, description: 'Action logged successfully', schema: { $ref: getSchemaPath(AuditLog) } })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        action: { enum: Object.values(AuditAction) },
        entityType: { enum: Object.values(AuditEntityType) },
        entityId: { type: 'string' },
        actorId: { type: 'string' },
        description: { type: 'string' },
        additionalData: { type: 'object' },
      },
      required: ['action', 'entityType', 'entityId', 'actorId', 'description'],
    },
  })
  @Roles(UserRole.ADMIN, UserRole.LANDLORD)
  async logAction(@Body() body: any): Promise<AuditLog> {
    const { action, entityType, entityId, actorId, description, additionalData } = body;
    return this.auditService.logAction(action, entityType, entityId, actorId, description, additionalData);
  }

  @Post('log-security-event')
  @ApiOperation({ summary: 'Log a security event' })
  @ApiResponse({ status: 201, description: 'Security event logged successfully', schema: { $ref: getSchemaPath(AuditLog) } })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        action: { enum: Object.values(AuditAction) },
        actorId: { type: 'string' },
        description: { type: 'string' },
        ipAddress: { type: 'string' },
        userAgent: { type: 'string' },
        additionalData: { type: 'object' },
      },
      required: ['action', 'actorId', 'description'],
    },
  })
  @Roles(UserRole.ADMIN)
  async logSecurityEvent(@Body() body: any): Promise<AuditLog> {
    const { action, actorId, description, ipAddress, userAgent, additionalData } = body;
    return this.auditService.logSecurityEvent(action, actorId, description, ipAddress, userAgent, additionalData);
  }

  @Get()
  @ApiOperation({ summary: 'Get all audit logs with optional filters' })
  @ApiResponse({ status: 200, description: 'Audit logs retrieved successfully', schema: { type: 'array', items: { $ref: getSchemaPath(AuditLog) } } })
  @ApiQuery({ name: 'actorId', required: false, description: 'Filter by actor ID' })
  @ApiQuery({ name: 'entityType', required: false, enum: AuditEntityType, description: 'Filter by entity type' })
  @ApiQuery({ name: 'entityId', required: false, description: 'Filter by entity ID' })
  @ApiQuery({ name: 'action', required: false, enum: AuditAction, description: 'Filter by action' })
  @ApiQuery({ name: 'severity', required: false, enum: AuditSeverity, description: 'Filter by severity' })
  @ApiQuery({ name: 'isSecurityEvent', required: false, type: Boolean, description: 'Filter security events' })
  @ApiQuery({ name: 'isSystemGenerated', required: false, type: Boolean, description: 'Filter system-generated events' })
  @ApiQuery({ name: 'businessProcess', required: false, description: 'Filter by business process' })
  @ApiQuery({ name: 'correlationId', required: false, description: 'Filter by correlation ID' })
  @ApiQuery({ name: 'ipAddress', required: false, description: 'Filter by IP address' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Filter from date (ISO string)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'Filter to date (ISO string)' })
  @ApiQuery({ name: 'search', required: false, description: 'Search in description or endpoint' })
  @ApiQuery({ name: 'riskScoreMin', required: false, type: Number, description: 'Minimum risk score' })
  @ApiQuery({ name: 'riskScoreMax', required: false, type: Number, description: 'Maximum risk score' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Limit results (default: 100)' })
  @ApiQuery({ name: 'offset', required: false, type: Number, description: 'Offset results (default: 0)' })
  @Roles(UserRole.ADMIN, UserRole.LANDLORD)
  async findAll(@Query() query: any): Promise<AuditLog[]> {
    const filters = {
      ...query,
      isSecurityEvent: query.isSecurityEvent ? query.isSecurityEvent === 'true' : undefined,
      isSystemGenerated: query.isSystemGenerated ? query.isSystemGenerated === 'true' : undefined,
      riskScoreMin: query.riskScoreMin ? parseInt(query.riskScoreMin) : undefined,
      riskScoreMax: query.riskScoreMax ? parseInt(query.riskScoreMax) : undefined,
      limit: query.limit ? parseInt(query.limit) : undefined,
      offset: query.offset ? parseInt(query.offset) : undefined,
    };
    return this.auditService.findAll(filters);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get audit statistics' })
  @ApiResponse({ status: 200, description: 'Audit statistics retrieved successfully' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Filter from date (ISO string)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'Filter to date (ISO string)' })
  @ApiQuery({ name: 'actorId', required: false, description: 'Filter by actor ID' })
  @Roles(UserRole.ADMIN)
  async getStats(@Query() query: any): Promise<any> {
    return this.auditService.getAuditStats(query);
  }

  @Get('security-events')
  @ApiOperation({ summary: 'Get security events' })
  @ApiResponse({ status: 200, description: 'Security events retrieved successfully', schema: { type: 'array', items: { $ref: getSchemaPath(AuditLog) } } })
  @ApiQuery({ name: 'startDate', required: false, description: 'Filter from date (ISO string)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'Filter to date (ISO string)' })
  @ApiQuery({ name: 'severity', required: false, enum: AuditSeverity, description: 'Filter by severity' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Limit results (default: 100)' })
  @ApiQuery({ name: 'offset', required: false, type: Number, description: 'Offset results (default: 0)' })
  @Roles(UserRole.ADMIN)
  async getSecurityEvents(@Query() query: any): Promise<AuditLog[]> {
    const filters = {
      ...query,
      limit: query.limit ? parseInt(query.limit) : undefined,
      offset: query.offset ? parseInt(query.offset) : undefined,
    };
    return this.auditService.findSecurityEvents(filters);
  }

  @Get('high-risk')
  @ApiOperation({ summary: 'Get high-risk events' })
  @ApiResponse({ status: 200, description: 'High-risk events retrieved successfully', schema: { type: 'array', items: { $ref: getSchemaPath(AuditLog) } } })
  @ApiQuery({ name: 'threshold', required: false, type: Number, description: 'Risk score threshold (default: 7)' })
  @Roles(UserRole.ADMIN)
  async getHighRiskEvents(@Query('threshold') threshold?: number): Promise<AuditLog[]> {
    return this.auditService.findHighRiskEvents(threshold);
  }

  @Get('correlation/:correlationId')
  @ApiOperation({ summary: 'Get audit logs by correlation ID' })
  @ApiResponse({ status: 200, description: 'Correlated audit logs retrieved successfully', schema: { type: 'array', items: { $ref: getSchemaPath(AuditLog) } } })
  @Roles(UserRole.ADMIN, UserRole.LANDLORD)
  async findByCorrelationId(@Param('correlationId') correlationId: string): Promise<AuditLog[]> {
    return this.auditService.findByCorrelationId(correlationId);
  }

  @Get('entity/:entityType/:entityId')
  @ApiOperation({ summary: 'Get audit logs for a specific entity' })
  @ApiResponse({ status: 200, description: 'Entity audit logs retrieved successfully', schema: { type: 'array', items: { $ref: getSchemaPath(AuditLog) } } })
  @Roles(UserRole.ADMIN, UserRole.LANDLORD)
  async findByEntity(
    @Param('entityType') entityType: AuditEntityType,
    @Param('entityId') entityId: string,
  ): Promise<AuditLog[]> {
    return this.auditService.findByEntity(entityType, entityId);
  }

  @Get('timeline/:entityType/:entityId')
  @ApiOperation({ summary: 'Get activity timeline for a specific entity' })
  @ApiResponse({ status: 200, description: 'Activity timeline retrieved successfully', schema: { type: 'array', items: { $ref: getSchemaPath(AuditLog) } } })
  @Roles(UserRole.ADMIN, UserRole.LANDLORD)
  async getActivityTimeline(
    @Param('entityType') entityType: AuditEntityType,
    @Param('entityId') entityId: string,
  ): Promise<AuditLog[]> {
    return this.auditService.getActivityTimeline(entityType, entityId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get audit log by ID' })
  @ApiResponse({ status: 200, description: 'Audit log retrieved successfully', schema: { $ref: getSchemaPath(AuditLog) } })
  @ApiResponse({ status: 404, description: 'Audit log not found' })
  @Roles(UserRole.ADMIN, UserRole.LANDLORD)
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<AuditLog> {
    return this.auditService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update audit log' })
  @ApiResponse({ status: 200, description: 'Audit log updated successfully', schema: { $ref: getSchemaPath(AuditLog) } })
  @ApiResponse({ status: 404, description: 'Audit log not found' })
  @Roles(UserRole.ADMIN)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAuditLogDto: UpdateAuditLogDto,
  ): Promise<AuditLog> {
    return this.auditService.update(id, updateAuditLogDto);
  }

  @Patch(':id/review')
  @ApiOperation({ summary: 'Mark audit log as reviewed' })
  @ApiResponse({ status: 200, description: 'Audit log marked as reviewed', schema: { $ref: getSchemaPath(AuditLog) } })
  @ApiResponse({ status: 404, description: 'Audit log not found' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        reviewedBy: { type: 'string' },
      },
      required: ['reviewedBy'],
    },
  })
  @Roles(UserRole.ADMIN)
  async markForReview(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('reviewedBy') reviewedBy: string,
  ): Promise<AuditLog> {
    return this.auditService.markForReview(id, reviewedBy);
  }

  @Post('archive-old')
  @ApiOperation({ summary: 'Archive old audit logs' })
  @ApiResponse({ status: 200, description: 'Old audit logs archived successfully' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        retentionDays: { type: 'number', description: 'Number of days to retain (default: 365)' },
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMIN)
  async archiveOldLogs(@Body('retentionDays') retentionDays?: number): Promise<{ archivedCount: number }> {
    const archivedCount = await this.auditService.archiveOldLogs(retentionDays);
    return { archivedCount };
  }

  @Delete('archived')
  @ApiOperation({ summary: 'Delete archived audit logs' })
  @ApiResponse({ status: 200, description: 'Archived audit logs deleted successfully' })
  @ApiQuery({ name: 'archiveDays', required: false, type: Number, description: 'Days since archival (default: 30)' })
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMIN)
  async deleteArchivedLogs(@Query('archiveDays') archiveDays?: number): Promise<{ deletedCount: number }> {
    const deletedCount = await this.auditService.deleteArchivedLogs(archiveDays);
    return { deletedCount };
  }
}
