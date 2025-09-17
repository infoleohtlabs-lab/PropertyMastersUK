import {
  Controller,
  Get,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { AdminService } from './admin.service';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ 
    summary: 'Get admin dashboard overview',
    description: 'Retrieve comprehensive admin dashboard metrics including users, properties, system health, and key performance indicators'
  })
  @ApiResponse({
    status: 200,
    description: 'Admin dashboard data retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        stats: {
          type: 'object',
          properties: {
            totalUsers: { type: 'number' },
            totalProperties: { type: 'number' },
            totalRevenue: { type: 'number' },
            activeUsers: { type: 'number' },
            pendingVerifications: { type: 'number' },
            systemAlerts: { type: 'number' },
          }
        },
        recentActivity: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              action: { type: 'string' },
              user: { type: 'string' },
              timestamp: { type: 'string' },
              details: { type: 'string' },
            }
          }
        },
        systemHealth: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            uptime: { type: 'number' },
            memoryUsage: { type: 'number' },
            cpuUsage: { type: 'number' },
            databaseStatus: { type: 'string' },
          }
        }
      }
    }
  })
  @ApiQuery({
    name: 'period',
    required: false,
    description: 'Time period for dashboard data',
    enum: ['today', 'week', 'month', 'quarter', 'year'],
  })
  async getDashboard(
    @Request() req: any,
    @Query('period') period: string = 'month'
  ) {
    return this.adminService.getDashboardData(period);
  }

  @Get('stats')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ 
    summary: 'Get admin statistics',
    description: 'Retrieve detailed statistics for admin overview including user metrics, property metrics, and financial data'
  })
  @ApiResponse({
    status: 200,
    description: 'Admin statistics retrieved successfully',
  })
  @ApiQuery({
    name: 'period',
    required: false,
    description: 'Time period for statistics',
    enum: ['today', 'week', 'month', 'quarter', 'year'],
  })
  async getStats(
    @Request() req: any,
    @Query('period') period: string = 'month'
  ) {
    return this.adminService.getStatistics(period);
  }

  @Get('activity')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ 
    summary: 'Get recent admin activity',
    description: 'Retrieve recent administrative activities and system events'
  })
  @ApiResponse({
    status: 200,
    description: 'Recent activity retrieved successfully',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of activities to retrieve',
    type: 'number',
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    description: 'Number of activities to skip',
    type: 'number',
  })
  async getRecentActivity(
    @Request() req: any,
    @Query('limit') limit: number = 50,
    @Query('offset') offset: number = 0
  ) {
    return this.adminService.getRecentActivity(limit, offset);
  }

  @Get('alerts')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ 
    summary: 'Get system alerts',
    description: 'Retrieve current system alerts and notifications requiring admin attention'
  })
  @ApiResponse({
    status: 200,
    description: 'System alerts retrieved successfully',
  })
  @ApiQuery({
    name: 'severity',
    required: false,
    description: 'Filter alerts by severity level',
    enum: ['low', 'medium', 'high', 'critical'],
  })
  async getSystemAlerts(
    @Request() req: any,
    @Query('severity') severity?: string
  ) {
    return this.adminService.getSystemAlerts(severity);
  }

  @Get('health')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ 
    summary: 'Get system health status',
    description: 'Retrieve comprehensive system health information including server status, database connectivity, and resource usage'
  })
  @ApiResponse({
    status: 200,
    description: 'System health status retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['healthy', 'warning', 'critical'] },
        uptime: { type: 'number' },
        memory: {
          type: 'object',
          properties: {
            used: { type: 'number' },
            total: { type: 'number' },
            percentage: { type: 'number' },
          }
        },
        cpu: {
          type: 'object',
          properties: {
            usage: { type: 'number' },
            load: { type: 'array', items: { type: 'number' } },
          }
        },
        database: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            connections: { type: 'number' },
            responseTime: { type: 'number' },
          }
        },
        storage: {
          type: 'object',
          properties: {
            used: { type: 'number' },
            total: { type: 'number' },
            percentage: { type: 'number' },
          }
        }
      }
    }
  })
  async getSystemHealth(@Request() req: any) {
    return this.adminService.getSystemHealth();
  }
}