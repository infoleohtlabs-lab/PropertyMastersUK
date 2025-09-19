import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { SuperAdminService } from './super-admin.service';
import {
  CreateSystemConfigDto,
  UpdateSystemConfigDto,
  CreateSecurityEventDto,
  SystemBackupDto,
  GlobalSettingsDto,
  AuditLogQueryDto,
} from './dto/super-admin.dto';

@ApiTags('Super Admin')
@Controller('super-admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SuperAdminController {
  constructor(private readonly superAdminService: SuperAdminService) {}

  @Get('dashboard')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Get super admin dashboard overview',
    description: 'Retrieve comprehensive system overview including global statistics, security monitoring, and system health'
  })
  @ApiResponse({
    status: 200,
    description: 'Super admin dashboard data retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        systemStats: {
          type: 'object',
          properties: {
            totalOrganizations: { type: 'number' },
            totalUsers: { type: 'number' },
            totalProperties: { type: 'number' },
            systemUptime: { type: 'number' },
            activeConnections: { type: 'number' },
            storageUsage: { type: 'number' },
          }
        },
        securityEvents: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              type: { type: 'string' },
              severity: { type: 'string' },
              description: { type: 'string' },
              timestamp: { type: 'string' },
              resolved: { type: 'boolean' },
            }
          }
        },
        systemHealth: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            services: { type: 'array', items: { type: 'object' } },
            performance: { type: 'object' },
          }
        }
      }
    }
  })
  async getDashboard(@Request() req: any) {
    return this.superAdminService.getDashboardData();
  }

  @Get('system/config')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Get system configuration',
    description: 'Retrieve global system configuration settings'
  })
  @ApiResponse({ status: 200, description: 'System configuration retrieved successfully' })
  async getSystemConfig() {
    return this.superAdminService.getSystemConfig();
  }

  @Put('system/config')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Update system configuration',
    description: 'Update global system configuration settings'
  })
  @ApiResponse({ status: 200, description: 'System configuration updated successfully' })
  async updateSystemConfig(@Body() updateConfigDto: UpdateSystemConfigDto) {
    return this.superAdminService.updateSystemConfig(updateConfigDto);
  }

  @Get('security/events')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Get security events',
    description: 'Retrieve security events and alerts across the entire system'
  })
  @ApiResponse({ status: 200, description: 'Security events retrieved successfully' })
  @ApiQuery({ name: 'severity', required: false, enum: ['low', 'medium', 'high', 'critical'] })
  @ApiQuery({ name: 'resolved', required: false, type: 'boolean' })
  @ApiQuery({ name: 'limit', required: false, type: 'number' })
  @ApiQuery({ name: 'offset', required: false, type: 'number' })
  async getSecurityEvents(
    @Query('severity') severity?: string,
    @Query('resolved') resolved?: boolean,
    @Query('limit') limit: number = 50,
    @Query('offset') offset: number = 0
  ) {
    return this.superAdminService.getSecurityEvents({ severity, resolved, limit, offset });
  }

  @Post('security/events')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Create security event',
    description: 'Manually create a security event or alert'
  })
  @ApiResponse({ status: 201, description: 'Security event created successfully' })
  async createSecurityEvent(@Body() createEventDto: CreateSecurityEventDto) {
    return this.superAdminService.createSecurityEvent(createEventDto);
  }

  @Put('security/events/:id/resolve')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Resolve security event',
    description: 'Mark a security event as resolved'
  })
  @ApiResponse({ status: 200, description: 'Security event resolved successfully' })
  @ApiParam({ name: 'id', description: 'Security event ID' })
  async resolveSecurityEvent(@Param('id') id: string) {
    return this.superAdminService.resolveSecurityEvent(id);
  }

  @Get('analytics/global')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Get global analytics',
    description: 'Retrieve comprehensive analytics across all organizations and users'
  })
  @ApiResponse({ status: 200, description: 'Global analytics retrieved successfully' })
  @ApiQuery({ name: 'period', required: false, enum: ['day', 'week', 'month', 'quarter', 'year'] })
  @ApiQuery({ name: 'metric', required: false, enum: ['users', 'properties', 'revenue', 'activity'] })
  async getGlobalAnalytics(
    @Query('period') period: string = 'month',
    @Query('metric') metric?: string
  ) {
    return this.superAdminService.getGlobalAnalytics(period, metric);
  }

  @Get('organizations')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Get all organizations',
    description: 'Retrieve list of all organizations in the system'
  })
  @ApiResponse({ status: 200, description: 'Organizations retrieved successfully' })
  @ApiQuery({ name: 'status', required: false, enum: ['active', 'inactive', 'suspended'] })
  @ApiQuery({ name: 'limit', required: false, type: 'number' })
  @ApiQuery({ name: 'offset', required: false, type: 'number' })
  async getOrganizations(
    @Query('status') status?: string,
    @Query('limit') limit: number = 50,
    @Query('offset') offset: number = 0
  ) {
    return this.superAdminService.getOrganizations({ status, limit, offset });
  }

  @Put('organizations/:id/status')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Update organization status',
    description: 'Update the status of an organization (activate, deactivate, suspend)'
  })
  @ApiResponse({ status: 200, description: 'Organization status updated successfully' })
  @ApiParam({ name: 'id', description: 'Organization ID' })
  async updateOrganizationStatus(
    @Param('id') id: string,
    @Body() statusDto: { status: 'active' | 'inactive' | 'suspended'; reason?: string }
  ) {
    return this.superAdminService.updateOrganizationStatus(id, statusDto);
  }

  @Get('system/backup')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Get system backup status',
    description: 'Retrieve information about system backups and their status'
  })
  @ApiResponse({ status: 200, description: 'Backup status retrieved successfully' })
  async getBackupStatus() {
    return this.superAdminService.getBackupStatus();
  }

  @Post('system/backup')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Create system backup',
    description: 'Initiate a full system backup'
  })
  @ApiResponse({ status: 201, description: 'Backup initiated successfully' })
  async createBackup(@Body() backupDto: SystemBackupDto) {
    return this.superAdminService.createBackup(backupDto);
  }

  @Get('audit/logs')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Get audit logs',
    description: 'Retrieve comprehensive audit logs for all system activities'
  })
  @ApiResponse({ status: 200, description: 'Audit logs retrieved successfully' })
  @ApiQuery({ name: 'action', required: false, type: 'string' })
  @ApiQuery({ name: 'userId', required: false, type: 'string' })
  @ApiQuery({ name: 'startDate', required: false, type: 'string' })
  @ApiQuery({ name: 'endDate', required: false, type: 'string' })
  @ApiQuery({ name: 'limit', required: false, type: 'number' })
  @ApiQuery({ name: 'offset', required: false, type: 'number' })
  async getAuditLogs(@Query() queryDto: AuditLogQueryDto) {
    return this.superAdminService.getAuditLogs(queryDto);
  }

  @Get('system/health')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Get comprehensive system health',
    description: 'Retrieve detailed system health information including all services and dependencies'
  })
  @ApiResponse({ status: 200, description: 'System health retrieved successfully' })
  async getSystemHealth() {
    return this.superAdminService.getSystemHealth();
  }

  @Get('users/global')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Get global user management',
    description: 'Retrieve and manage users across all organizations'
  })
  @ApiResponse({ status: 200, description: 'Global users retrieved successfully' })
  @ApiQuery({ name: 'role', required: false, enum: Object.values(UserRole) })
  @ApiQuery({ name: 'status', required: false, enum: ['active', 'inactive', 'suspended'] })
  @ApiQuery({ name: 'organization', required: false, type: 'string' })
  @ApiQuery({ name: 'limit', required: false, type: 'number' })
  @ApiQuery({ name: 'offset', required: false, type: 'number' })
  async getGlobalUsers(
    @Query('role') role?: UserRole,
    @Query('status') status?: string,
    @Query('organization') organization?: string,
    @Query('limit') limit: number = 50,
    @Query('offset') offset: number = 0
  ) {
    return this.superAdminService.getGlobalUsers({ role, status, organization, limit, offset });
  }

  @Put('users/:id/global-status')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Update user global status',
    description: 'Update user status across the entire system (super admin privilege)'
  })
  @ApiResponse({ status: 200, description: 'User global status updated successfully' })
  @ApiParam({ name: 'id', description: 'User ID' })
  async updateUserGlobalStatus(
    @Param('id') id: string,
    @Body() statusDto: { status: 'active' | 'inactive' | 'suspended'; reason?: string }
  ) {
    return this.superAdminService.updateUserGlobalStatus(id, statusDto);
  }

  @Get('settings/global')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Get global settings',
    description: 'Retrieve global system settings that affect all organizations'
  })
  @ApiResponse({ status: 200, description: 'Global settings retrieved successfully' })
  async getGlobalSettings() {
    return this.superAdminService.getGlobalSettings();
  }

  @Put('settings/global')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Update global settings',
    description: 'Update global system settings that affect all organizations'
  })
  @ApiResponse({ status: 200, description: 'Global settings updated successfully' })
  async updateGlobalSettings(@Body() settingsDto: GlobalSettingsDto) {
    return this.superAdminService.updateGlobalSettings(settingsDto);
  }
}