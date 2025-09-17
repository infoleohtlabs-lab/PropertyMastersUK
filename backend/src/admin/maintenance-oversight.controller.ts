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
  HttpStatus,
  HttpCode,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { MaintenanceOversightService } from './maintenance-oversight.service';
import {
  MaintenanceTaskDto,
  MaintenanceTaskResponseDto,
  MaintenanceScheduleDto,
  MaintenanceScheduleResponseDto,
  SystemHealthDto,
  SystemHealthResponseDto,
  BackupConfigDto,
  BackupConfigResponseDto,
  PerformanceMetricsResponseDto,
  SystemMonitoringResponseDto,
  MaintenanceQueryDto,
  MaintenanceReportResponseDto,
  MaintenanceAlertDto,
  MaintenanceAlertResponseDto,
  SystemUpdateDto,
  SystemUpdateResponseDto,
  ResourceUsageResponseDto,
  MaintenanceDashboardResponseDto,
} from './dto/maintenance-oversight.dto';

@ApiTags('Maintenance Oversight')
@Controller('admin/maintenance')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class MaintenanceOversightController {
  constructor(
    private readonly maintenanceOversightService: MaintenanceOversightService,
  ) {}

  // Dashboard
  @Get('dashboard')
  @Roles('admin', 'maintenance_manager')
  @ApiOperation({ summary: 'Get maintenance dashboard overview' })
  @ApiResponse({
    status: 200,
    description: 'Maintenance dashboard data retrieved successfully',
    type: MaintenanceDashboardResponseDto,
  })
  async getDashboard(): Promise<MaintenanceDashboardResponseDto> {
    return this.maintenanceOversightService.getDashboard();
  }

  // Maintenance Tasks
  @Get('tasks')
  @Roles('admin', 'maintenance_manager', 'technician')
  @ApiOperation({ summary: 'Get maintenance tasks' })
  @ApiResponse({
    status: 200,
    description: 'Maintenance tasks retrieved successfully',
    type: [MaintenanceTaskResponseDto],
  })
  async getMaintenanceTasks(
    @Query() query: MaintenanceQueryDto,
  ): Promise<MaintenanceTaskResponseDto[]> {
    return this.maintenanceOversightService.getMaintenanceTasks(query);
  }

  @Post('tasks')
  @Roles('admin', 'maintenance_manager')
  @ApiOperation({ summary: 'Create maintenance task' })
  @ApiResponse({
    status: 201,
    description: 'Maintenance task created successfully',
    type: MaintenanceTaskResponseDto,
  })
  @HttpCode(HttpStatus.CREATED)
  async createMaintenanceTask(
    @Body() taskDto: MaintenanceTaskDto,
  ): Promise<MaintenanceTaskResponseDto> {
    return this.maintenanceOversightService.createMaintenanceTask(taskDto);
  }

  @Get('tasks/:id')
  @Roles('admin', 'maintenance_manager', 'technician')
  @ApiOperation({ summary: 'Get maintenance task by ID' })
  @ApiResponse({
    status: 200,
    description: 'Maintenance task retrieved successfully',
    type: MaintenanceTaskResponseDto,
  })
  async getMaintenanceTask(
    @Param('id') id: string,
  ): Promise<MaintenanceTaskResponseDto> {
    return this.maintenanceOversightService.getMaintenanceTask(id);
  }

  @Put('tasks/:id')
  @Roles('admin', 'maintenance_manager', 'technician')
  @ApiOperation({ summary: 'Update maintenance task' })
  @ApiResponse({
    status: 200,
    description: 'Maintenance task updated successfully',
    type: MaintenanceTaskResponseDto,
  })
  async updateMaintenanceTask(
    @Param('id') id: string,
    @Body() taskDto: Partial<MaintenanceTaskDto>,
  ): Promise<MaintenanceTaskResponseDto> {
    return this.maintenanceOversightService.updateMaintenanceTask(id, taskDto);
  }

  @Delete('tasks/:id')
  @Roles('admin', 'maintenance_manager')
  @ApiOperation({ summary: 'Delete maintenance task' })
  @ApiResponse({
    status: 204,
    description: 'Maintenance task deleted successfully',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteMaintenanceTask(@Param('id') id: string): Promise<void> {
    return this.maintenanceOversightService.deleteMaintenanceTask(id);
  }

  // Maintenance Schedules
  @Get('schedules')
  @Roles('admin', 'maintenance_manager')
  @ApiOperation({ summary: 'Get maintenance schedules' })
  @ApiResponse({
    status: 200,
    description: 'Maintenance schedules retrieved successfully',
    type: [MaintenanceScheduleResponseDto],
  })
  async getMaintenanceSchedules(
    @Query() query: MaintenanceQueryDto,
  ): Promise<MaintenanceScheduleResponseDto[]> {
    return this.maintenanceOversightService.getMaintenanceSchedules(query);
  }

  @Post('schedules')
  @Roles('admin', 'maintenance_manager')
  @ApiOperation({ summary: 'Create maintenance schedule' })
  @ApiResponse({
    status: 201,
    description: 'Maintenance schedule created successfully',
    type: MaintenanceScheduleResponseDto,
  })
  @HttpCode(HttpStatus.CREATED)
  async createMaintenanceSchedule(
    @Body() scheduleDto: MaintenanceScheduleDto,
  ): Promise<MaintenanceScheduleResponseDto> {
    return this.maintenanceOversightService.createMaintenanceSchedule(
      scheduleDto,
    );
  }

  @Put('schedules/:id')
  @Roles('admin', 'maintenance_manager')
  @ApiOperation({ summary: 'Update maintenance schedule' })
  @ApiResponse({
    status: 200,
    description: 'Maintenance schedule updated successfully',
    type: MaintenanceScheduleResponseDto,
  })
  async updateMaintenanceSchedule(
    @Param('id') id: string,
    @Body() scheduleDto: Partial<MaintenanceScheduleDto>,
  ): Promise<MaintenanceScheduleResponseDto> {
    return this.maintenanceOversightService.updateMaintenanceSchedule(
      id,
      scheduleDto,
    );
  }

  @Delete('schedules/:id')
  @Roles('admin', 'maintenance_manager')
  @ApiOperation({ summary: 'Delete maintenance schedule' })
  @ApiResponse({
    status: 204,
    description: 'Maintenance schedule deleted successfully',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteMaintenanceSchedule(@Param('id') id: string): Promise<void> {
    return this.maintenanceOversightService.deleteMaintenanceSchedule(id);
  }

  // System Health
  @Get('system-health')
  @Roles('admin', 'maintenance_manager', 'technician')
  @ApiOperation({ summary: 'Get system health status' })
  @ApiResponse({
    status: 200,
    description: 'System health status retrieved successfully',
    type: [SystemHealthResponseDto],
  })
  async getSystemHealth(): Promise<SystemHealthResponseDto[]> {
    return this.maintenanceOversightService.getSystemHealth();
  }

  @Post('system-health')
  @Roles('admin', 'maintenance_manager')
  @ApiOperation({ summary: 'Create system health check' })
  @ApiResponse({
    status: 201,
    description: 'System health check created successfully',
    type: SystemHealthResponseDto,
  })
  @HttpCode(HttpStatus.CREATED)
  async createSystemHealthCheck(
    @Body() healthDto: SystemHealthDto,
  ): Promise<SystemHealthResponseDto> {
    return this.maintenanceOversightService.createSystemHealthCheck(healthDto);
  }

  @Get('system-health/:id')
  @Roles('admin', 'maintenance_manager', 'technician')
  @ApiOperation({ summary: 'Get system health check by ID' })
  @ApiResponse({
    status: 200,
    description: 'System health check retrieved successfully',
    type: SystemHealthResponseDto,
  })
  async getSystemHealthCheck(
    @Param('id') id: string,
  ): Promise<SystemHealthResponseDto> {
    return this.maintenanceOversightService.getSystemHealthCheck(id);
  }

  // Performance Metrics
  @Get('performance-metrics')
  @Roles('admin', 'maintenance_manager')
  @ApiOperation({ summary: 'Get performance metrics' })
  @ApiResponse({
    status: 200,
    description: 'Performance metrics retrieved successfully',
    type: PerformanceMetricsResponseDto,
  })
  async getPerformanceMetrics(
    @Query() query: MaintenanceQueryDto,
  ): Promise<PerformanceMetricsResponseDto> {
    return this.maintenanceOversightService.getPerformanceMetrics(query);
  }

  // System Monitoring
  @Get('system-monitoring')
  @Roles('admin', 'maintenance_manager')
  @ApiOperation({ summary: 'Get system monitoring data' })
  @ApiResponse({
    status: 200,
    description: 'System monitoring data retrieved successfully',
    type: SystemMonitoringResponseDto,
  })
  async getSystemMonitoring(): Promise<SystemMonitoringResponseDto> {
    return this.maintenanceOversightService.getSystemMonitoring();
  }

  // Resource Usage
  @Get('resource-usage')
  @Roles('admin', 'maintenance_manager')
  @ApiOperation({ summary: 'Get resource usage statistics' })
  @ApiResponse({
    status: 200,
    description: 'Resource usage statistics retrieved successfully',
    type: ResourceUsageResponseDto,
  })
  async getResourceUsage(
    @Query() query: MaintenanceQueryDto,
  ): Promise<ResourceUsageResponseDto> {
    return this.maintenanceOversightService.getResourceUsage(query);
  }

  // Backup Configuration
  @Get('backup-config')
  @Roles('admin', 'maintenance_manager')
  @ApiOperation({ summary: 'Get backup configuration' })
  @ApiResponse({
    status: 200,
    description: 'Backup configuration retrieved successfully',
    type: BackupConfigResponseDto,
  })
  async getBackupConfig(): Promise<BackupConfigResponseDto> {
    return this.maintenanceOversightService.getBackupConfig();
  }

  @Put('backup-config')
  @Roles('admin')
  @ApiOperation({ summary: 'Update backup configuration' })
  @ApiResponse({
    status: 200,
    description: 'Backup configuration updated successfully',
    type: BackupConfigResponseDto,
  })
  async updateBackupConfig(
    @Body() configDto: BackupConfigDto,
  ): Promise<BackupConfigResponseDto> {
    return this.maintenanceOversightService.updateBackupConfig(configDto);
  }

  @Post('backup/trigger')
  @Roles('admin', 'maintenance_manager')
  @ApiOperation({ summary: 'Trigger manual backup' })
  @ApiResponse({
    status: 200,
    description: 'Backup triggered successfully',
  })
  async triggerBackup(): Promise<{ message: string; backupId: string }> {
    return this.maintenanceOversightService.triggerBackup();
  }

  // System Updates
  @Get('system-updates')
  @Roles('admin', 'maintenance_manager')
  @ApiOperation({ summary: 'Get system updates' })
  @ApiResponse({
    status: 200,
    description: 'System updates retrieved successfully',
    type: [SystemUpdateResponseDto],
  })
  async getSystemUpdates(
    @Query() query: MaintenanceQueryDto,
  ): Promise<SystemUpdateResponseDto[]> {
    return this.maintenanceOversightService.getSystemUpdates(query);
  }

  @Post('system-updates')
  @Roles('admin')
  @ApiOperation({ summary: 'Schedule system update' })
  @ApiResponse({
    status: 201,
    description: 'System update scheduled successfully',
    type: SystemUpdateResponseDto,
  })
  @HttpCode(HttpStatus.CREATED)
  async scheduleSystemUpdate(
    @Body() updateDto: SystemUpdateDto,
  ): Promise<SystemUpdateResponseDto> {
    return this.maintenanceOversightService.scheduleSystemUpdate(updateDto);
  }

  @Put('system-updates/:id/apply')
  @Roles('admin')
  @ApiOperation({ summary: 'Apply system update' })
  @ApiResponse({
    status: 200,
    description: 'System update applied successfully',
    type: SystemUpdateResponseDto,
  })
  async applySystemUpdate(
    @Param('id') id: string,
  ): Promise<SystemUpdateResponseDto> {
    return this.maintenanceOversightService.applySystemUpdate(id);
  }

  // Maintenance Alerts
  @Get('alerts')
  @Roles('admin', 'maintenance_manager', 'technician')
  @ApiOperation({ summary: 'Get maintenance alerts' })
  @ApiResponse({
    status: 200,
    description: 'Maintenance alerts retrieved successfully',
    type: [MaintenanceAlertResponseDto],
  })
  async getMaintenanceAlerts(
    @Query() query: MaintenanceQueryDto,
  ): Promise<MaintenanceAlertResponseDto[]> {
    return this.maintenanceOversightService.getMaintenanceAlerts(query);
  }

  @Post('alerts')
  @Roles('admin', 'maintenance_manager')
  @ApiOperation({ summary: 'Create maintenance alert' })
  @ApiResponse({
    status: 201,
    description: 'Maintenance alert created successfully',
    type: MaintenanceAlertResponseDto,
  })
  @HttpCode(HttpStatus.CREATED)
  async createMaintenanceAlert(
    @Body() alertDto: MaintenanceAlertDto,
  ): Promise<MaintenanceAlertResponseDto> {
    return this.maintenanceOversightService.createMaintenanceAlert(alertDto);
  }

  @Put('alerts/:id/acknowledge')
  @Roles('admin', 'maintenance_manager', 'technician')
  @ApiOperation({ summary: 'Acknowledge maintenance alert' })
  @ApiResponse({
    status: 200,
    description: 'Maintenance alert acknowledged successfully',
    type: MaintenanceAlertResponseDto,
  })
  async acknowledgeMaintenanceAlert(
    @Param('id') id: string,
  ): Promise<MaintenanceAlertResponseDto> {
    return this.maintenanceOversightService.acknowledgeMaintenanceAlert(id);
  }

  @Put('alerts/:id/resolve')
  @Roles('admin', 'maintenance_manager', 'technician')
  @ApiOperation({ summary: 'Resolve maintenance alert' })
  @ApiResponse({
    status: 200,
    description: 'Maintenance alert resolved successfully',
    type: MaintenanceAlertResponseDto,
  })
  async resolveMaintenanceAlert(
    @Param('id') id: string,
  ): Promise<MaintenanceAlertResponseDto> {
    return this.maintenanceOversightService.resolveMaintenanceAlert(id);
  }

  // Reports
  @Get('reports')
  @Roles('admin', 'maintenance_manager')
  @ApiOperation({ summary: 'Get maintenance reports' })
  @ApiResponse({
    status: 200,
    description: 'Maintenance reports retrieved successfully',
    type: [MaintenanceReportResponseDto],
  })
  async getMaintenanceReports(
    @Query() query: MaintenanceQueryDto,
  ): Promise<MaintenanceReportResponseDto[]> {
    return this.maintenanceOversightService.getMaintenanceReports(query);
  }

  @Post('reports/generate')
  @Roles('admin', 'maintenance_manager')
  @ApiOperation({ summary: 'Generate maintenance report' })
  @ApiResponse({
    status: 201,
    description: 'Maintenance report generated successfully',
    type: MaintenanceReportResponseDto,
  })
  @HttpCode(HttpStatus.CREATED)
  async generateMaintenanceReport(
    @Body() query: MaintenanceQueryDto,
  ): Promise<MaintenanceReportResponseDto> {
    return this.maintenanceOversightService.generateMaintenanceReport(query);
  }

  @Get('reports/:id/export')
  @Roles('admin', 'maintenance_manager')
  @ApiOperation({ summary: 'Export maintenance report' })
  @ApiResponse({
    status: 200,
    description: 'Maintenance report exported successfully',
  })
  async exportMaintenanceReport(
    @Param('id') id: string,
    @Query('format') format: string = 'pdf',
  ): Promise<{ downloadUrl: string }> {
    return this.maintenanceOversightService.exportMaintenanceReport(
      id,
      format,
    );
  }

  // File Upload for Maintenance Documentation
  @Post('upload-documentation')
  @Roles('admin', 'maintenance_manager', 'technician')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload maintenance documentation',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        taskId: {
          type: 'string',
        },
        description: {
          type: 'string',
        },
      },
    },
  })
  @ApiOperation({ summary: 'Upload maintenance documentation' })
  @ApiResponse({
    status: 201,
    description: 'Documentation uploaded successfully',
  })
  @HttpCode(HttpStatus.CREATED)
  async uploadDocumentation(
    @UploadedFile() file: Express.Multer.File,
    @Body('taskId') taskId: string,
    @Body('description') description?: string,
  ): Promise<{ message: string; fileId: string; url: string }> {
    return this.maintenanceOversightService.uploadDocumentation(
      file,
      taskId,
      description,
    );
  }

  // Maintenance Statistics
  @Get('statistics')
  @Roles('admin', 'maintenance_manager')
  @ApiOperation({ summary: 'Get maintenance statistics' })
  @ApiResponse({
    status: 200,
    description: 'Maintenance statistics retrieved successfully',
  })
  async getMaintenanceStatistics(
    @Query() query: MaintenanceQueryDto,
  ): Promise<any> {
    return this.maintenanceOversightService.getMaintenanceStatistics(query);
  }

  // Configuration
  @Get('configuration')
  @Roles('admin', 'maintenance_manager')
  @ApiOperation({ summary: 'Get maintenance configuration' })
  @ApiResponse({
    status: 200,
    description: 'Maintenance configuration retrieved successfully',
  })
  async getMaintenanceConfiguration(): Promise<any> {
    return this.maintenanceOversightService.getMaintenanceConfiguration();
  }

  @Put('configuration')
  @Roles('admin')
  @ApiOperation({ summary: 'Update maintenance configuration' })
  @ApiResponse({
    status: 200,
    description: 'Maintenance configuration updated successfully',
  })
  async updateMaintenanceConfiguration(
    @Body() config: any,
  ): Promise<any> {
    return this.maintenanceOversightService.updateMaintenanceConfiguration(
      config,
    );
  }
}