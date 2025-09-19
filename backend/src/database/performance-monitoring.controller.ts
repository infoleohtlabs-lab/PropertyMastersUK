import { Controller, Get, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth ,
  getSchemaPath,} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { PerformanceMonitoringService, DatabaseMetrics } from './performance-monitoring.service';

@ApiTags('Database Performance')
@Controller('admin/database')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PerformanceMonitoringController {
  constructor(
    private readonly performanceMonitoringService: PerformanceMonitoringService,
  ) {}

  @Get('metrics')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get database performance metrics' })
  @ApiResponse({
    status: 200,
    description: 'Database performance metrics retrieved successfully',
  })
  async getDatabaseMetrics(): Promise<DatabaseMetrics> {
    return this.performanceMonitoringService.getDatabaseMetrics();
  }

  @Get('health')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get database health status' })
  @ApiResponse({
    status: 200,
    description: 'Database health status',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string' },
        connections: { type: 'object' },
        uptime: { type: 'number' },
      },
    },
  })
  async getDatabaseHealth() {
    return this.performanceMonitoringService.getDatabaseHealth();
  }

  @Get('query-stats')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get query statistics' })
  @ApiResponse({
    status: 200,
    description: 'Query performance statistics',
    schema: {
      type: 'object',
      properties: {
        slowQueries: { type: 'array' },
        queryMetrics: { type: 'object' },
      },
    },
  })
  async getQueryStats() {
    return this.performanceMonitoringService.getQueryStats();
  }

  @Delete('metrics')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Clear query metrics history' })
  @ApiResponse({
    status: 200,
    description: 'Query metrics history cleared successfully',
  })
  async clearMetrics(): Promise<{ message: string }> {
    this.performanceMonitoringService.clearMetrics();
    return { message: 'Query metrics history cleared successfully' };
  }
}
