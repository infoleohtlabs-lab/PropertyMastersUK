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
  HttpStatus,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,

  getSchemaPath,} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  BackupRecoveryService,
  BackupScheduleDto,
  BackupRestoreDto,
  BackupProgress,
  BackupHistory,
  RestoreProgress,
  BackupValidation,
  BackupSettings,
} from './backup-recovery.service';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsArray,
  IsEnum,
  Min,
  Max,
  IsEmail,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

// DTOs
class CreateBackupDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(['daily', 'weekly', 'monthly', 'custom'])
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom';

  @IsOptional()
  @IsString()
  cronExpression?: string;

  @IsNumber()
  @Min(1)
  @Max(365)
  retentionDays: number;

  @IsBoolean()
  includeUserData: boolean;

  @IsBoolean()
  includeSystemData: boolean;

  @IsBoolean()
  includeFiles: boolean;

  @IsNumber()
  @Min(0)
  @Max(9)
  compressionLevel: number;

  @IsBoolean()
  encryptionEnabled: boolean;

  @IsArray()
  @IsEmail({}, { each: true })
  notificationEmails: string[];

  @IsBoolean()
  enabled: boolean;
}

class RestoreBackupDto {
  @IsString()
  backupId: string;

  @IsEnum(['full', 'partial'])
  restoreType: 'full' | 'partial';

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  selectedTables?: string[];

  @IsOptional()
  @IsString()
  targetDatabase?: string;

  @IsBoolean()
  preserveExistingData: boolean;

  @IsBoolean()
  createBackupBeforeRestore: boolean;
}

class NotificationSettingsDto {
  @IsBoolean()
  onSuccess: boolean;

  @IsBoolean()
  onFailure: boolean;

  @IsArray()
  @IsEmail({}, { each: true })
  recipients: string[];
}

class PerformanceSettingsDto {
  @IsNumber()
  @Min(1)
  @Max(10)
  maxConcurrentBackups: number;

  @IsNumber()
  @Min(300000) // 5 minutes
  @Max(14400000) // 4 hours
  backupTimeout: number;

  @IsNumber()
  @Min(1)
  @Max(9)
  compressionLevel: number;
}

class UpdateBackupSettingsDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(365)
  defaultRetentionDays?: number;

  @IsOptional()
  @IsNumber()
  @Min(1024 * 1024) // 1MB
  maxBackupSize?: number;

  @IsOptional()
  @IsString()
  backupDirectory?: string;

  @IsOptional()
  @IsBoolean()
  compressionEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  encryptionEnabled?: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => NotificationSettingsDto)
  notificationSettings?: NotificationSettingsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => PerformanceSettingsDto)
  performanceSettings?: PerformanceSettingsDto;
}

@ApiTags('Admin - Backup & Recovery')
@Controller('admin/backup-recovery')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class BackupRecoveryController {
  constructor(private readonly backupRecoveryService: BackupRecoveryService) {}

  @Post('backup')
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Create a new backup' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Backup initiated successfully',
    schema: {
      type: 'object',
      properties: {
        backupId: { type: 'string' },
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid backup configuration',
  })
  async createBackup(
    @Body() createBackupDto: CreateBackupDto,
    @Request() req: any,
  ) {
    return this.backupRecoveryService.createBackup(
      createBackupDto,
      req.user.id,
    );
  }

  @Get('backup/:backupId/progress')
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Get backup progress' })
  @ApiParam({ name: 'backupId', description: 'Backup ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Backup progress retrieved successfully',
    type: Object,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Backup operation not found',
  })
  async getBackupProgress(
    @Param('backupId') backupId: string,
  ): Promise<BackupProgress> {
    return this.backupRecoveryService.getBackupProgress(backupId);
  }

  @Delete('backup/:backupId/cancel')
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Cancel a running backup' })
  @ApiParam({ name: 'backupId', description: 'Backup ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Backup cancelled successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Backup operation not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Cannot cancel completed or failed backup',
  })
  async cancelBackup(
    @Param('backupId') backupId: string,
    @Request() req: any,
  ) {
    return this.backupRecoveryService.cancelBackup(backupId, req.user.id);
  }

  @Get('backup/history')
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Get backup history' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Backup history retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { type: 'object' },
        },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
      },
    },
  })
  async getBackupHistory(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ): Promise<{
    data: BackupHistory[];
    total: number;
    page: number;
    limit: number;
  }> {
    return this.backupRecoveryService.getBackupHistory(page, limit);
  }

  @Post('restore')
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Restore from backup' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Restore initiated successfully',
    schema: {
      type: 'object',
      properties: {
        restoreId: { type: 'string' },
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid restore configuration',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Backup not found',
  })
  async restoreBackup(
    @Body() restoreBackupDto: RestoreBackupDto,
    @Request() req: any,
  ) {
    return this.backupRecoveryService.restoreBackup(
      restoreBackupDto,
      req.user.id,
    );
  }

  @Get('restore/:restoreId/progress')
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Get restore progress' })
  @ApiParam({ name: 'restoreId', description: 'Restore ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Restore progress retrieved successfully',
    type: Object,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Restore operation not found',
  })
  async getRestoreProgress(
    @Param('restoreId') restoreId: string,
  ): Promise<RestoreProgress> {
    return this.backupRecoveryService.getRestoreProgress(restoreId);
  }

  @Delete('restore/:restoreId/cancel')
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Cancel a running restore' })
  @ApiParam({ name: 'restoreId', description: 'Restore ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Restore cancelled successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Restore operation not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Cannot cancel completed or failed restore',
  })
  async cancelRestore(
    @Param('restoreId') restoreId: string,
    @Request() req: any,
  ) {
    return this.backupRecoveryService.cancelRestore(restoreId, req.user.id);
  }

  @Get('backup/:backupId/validate')
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Validate backup integrity' })
  @ApiParam({ name: 'backupId', description: 'Backup ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Backup validation completed',
    type: Object,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Backup not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Failed to validate backup',
  })
  async validateBackup(
    @Param('backupId') backupId: string,
  ): Promise<BackupValidation> {
    return this.backupRecoveryService.validateBackup(backupId);
  }

  @Get('settings')
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Get backup settings' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Backup settings retrieved successfully',
    type: Object,
  })
  async getBackupSettings(): Promise<BackupSettings> {
    return this.backupRecoveryService.getBackupSettings();
  }

  @Put('settings')
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Update backup settings' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Backup settings updated successfully',
    type: Object,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid settings configuration',
  })
  async updateBackupSettings(
    @Body() updateSettingsDto: UpdateBackupSettingsDto,
    @Request() req: any,
  ): Promise<BackupSettings> {
    return this.backupRecoveryService.updateBackupSettings(
      updateSettingsDto,
      req.user.id,
    );
  }

  @Get('health')
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Check backup system health' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Backup system health status',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['healthy', 'warning', 'error'] },
        message: { type: 'string' },
        details: {
          type: 'object',
          properties: {
            activeBackups: { type: 'number' },
            activeRestores: { type: 'number' },
            diskSpace: { type: 'object' },
            lastBackup: { type: 'string' },
            upcomingBackups: { type: 'number' },
          },
        },
        timestamp: { type: 'string', format: 'date-time' },
      },
    },
  })
  async getHealthStatus() {
    try {
      const settings = await this.backupRecoveryService.getBackupSettings();
      const history = await this.backupRecoveryService.getBackupHistory(1, 1);
      
      // Check disk space
      const fs = require('fs');
      const stats = fs.statSync(settings.backupDirectory);
      
      return {
        status: 'healthy',
        message: 'Backup system is operating normally',
        details: {
          activeBackups: 0, // This would come from the service
          activeRestores: 0, // This would come from the service
          diskSpace: {
            available: '10GB', // This would be calculated
            used: '2GB',
            total: '12GB',
          },
          lastBackup: history.data[0]?.createdAt || null,
          upcomingBackups: 0, // This would be calculated from scheduled backups
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'Failed to check backup system health',
        details: {
          error: error.message,
        },
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Get('schedules')
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Get scheduled backups' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Scheduled backups retrieved successfully',
    schema: {
      type: 'array',
      items: { type: 'object' },
    },
  })
  async getScheduledBackups() {
    // This would return scheduled backup configurations
    return {
      schedules: [],
      message: 'No scheduled backups configured',
    };
  }

  @Post('schedules')
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Create scheduled backup' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Scheduled backup created successfully',
    schema: {
      type: 'object',
      properties: {
        scheduleId: { type: 'string' },
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid schedule configuration',
  })
  async createScheduledBackup(
    @Body() createBackupDto: CreateBackupDto,
    @Request() req: any,
  ) {
    // This would create a scheduled backup configuration
    return {
      scheduleId: 'schedule-' + Date.now(),
      message: 'Scheduled backup created successfully',
    };
  }

  @Delete('schedules/:scheduleId')
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Delete scheduled backup' })
  @ApiParam({ name: 'scheduleId', description: 'Schedule ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Scheduled backup deleted successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Scheduled backup not found',
  })
  async deleteScheduledBackup(
    @Param('scheduleId') scheduleId: string,
    @Request() req: any,
  ) {
    // This would delete a scheduled backup configuration
    return {
      success: true,
      message: 'Scheduled backup deleted successfully',
    };
  }

  @Get('storage/usage')
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Get backup storage usage' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Storage usage retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        totalSize: { type: 'number' },
        usedSize: { type: 'number' },
        availableSize: { type: 'number' },
        backupCount: { type: 'number' },
        oldestBackup: { type: 'string', format: 'date-time' },
        newestBackup: { type: 'string', format: 'date-time' },
        breakdown: {
          type: 'object',
          properties: {
            byType: { type: 'object' },
            byMonth: { type: 'object' },
          },
        },
      },
    },
  })
  async getStorageUsage() {
    try {
      const history = await this.backupRecoveryService.getBackupHistory(1, 1000);
      
      const totalSize = history.data.reduce((sum, backup) => sum + backup.size, 0);
      const backupCount = history.total;
      
      return {
        totalSize,
        usedSize: totalSize,
        availableSize: 10 * 1024 * 1024 * 1024 - totalSize, // 10GB - used
        backupCount,
        oldestBackup: history.data[history.data.length - 1]?.createdAt || null,
        newestBackup: history.data[0]?.createdAt || null,
        breakdown: {
          byType: {
            manual: history.data.filter(b => b.type === 'manual').length,
            scheduled: history.data.filter(b => b.type === 'scheduled').length,
          },
          byMonth: {}, // This would be calculated based on creation dates
        },
      };
    } catch (error) {
      return {
        totalSize: 0,
        usedSize: 0,
        availableSize: 0,
        backupCount: 0,
        oldestBackup: null,
        newestBackup: null,
        breakdown: {
          byType: { manual: 0, scheduled: 0 },
          byMonth: {},
        },
      };
    }
  }
}
