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
import { PropertyManagerService } from './property-manager.service';
import {
  CreateStaffMemberDto,
  UpdateStaffMemberDto,
  AssignPropertyDto,
  CreateMaintenanceRequestDto,
  UpdateMaintenanceRequestDto,
  PropertyManagerReportDto,
  StaffScheduleDto,
} from './dto/property-manager.dto';

@ApiTags('Property Manager')
@Controller('property-manager')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PropertyManagerController {
  constructor(private readonly propertyManagerService: PropertyManagerService) {}

  @Get('dashboard')
  @Roles(UserRole.PROPERTY_MANAGER, UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get property manager dashboard overview',
    description: 'Retrieve comprehensive portfolio overview including properties, staff, and operations'
  })
  @ApiResponse({
    status: 200,
    description: 'Property manager dashboard data retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        portfolioStats: {
          type: 'object',
          properties: {
            totalProperties: { type: 'number' },
            occupiedUnits: { type: 'number' },
            vacantUnits: { type: 'number' },
            totalRevenue: { type: 'number' },
            maintenanceRequests: { type: 'number' },
            staffMembers: { type: 'number' },
          }
        },
        recentActivities: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              type: { type: 'string' },
              description: { type: 'string' },
              timestamp: { type: 'string' },
              priority: { type: 'string' },
            }
          }
        },
        upcomingTasks: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              title: { type: 'string' },
              dueDate: { type: 'string' },
              assignee: { type: 'string' },
              priority: { type: 'string' },
            }
          }
        }
      }
    }
  })
  async getDashboard(@Request() req: any) {
    return this.propertyManagerService.getDashboardData(req.user.id);
  }

  @Get('portfolio')
  @Roles(UserRole.PROPERTY_MANAGER, UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get managed properties portfolio',
    description: 'Retrieve all properties managed by the property manager'
  })
  @ApiResponse({ status: 200, description: 'Portfolio retrieved successfully' })
  @ApiQuery({ name: 'status', required: false, enum: ['active', 'inactive', 'maintenance'] })
  @ApiQuery({ name: 'type', required: false, enum: ['residential', 'commercial', 'mixed'] })
  @ApiQuery({ name: 'limit', required: false, type: 'number' })
  @ApiQuery({ name: 'offset', required: false, type: 'number' })
  async getPortfolio(
    @Request() req: any,
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('limit') limit: number = 50,
    @Query('offset') offset: number = 0
  ) {
    return this.propertyManagerService.getPortfolio(req.user.id, { status, type, limit, offset });
  }

  @Get('properties/:id/details')
  @Roles(UserRole.PROPERTY_MANAGER, UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get detailed property information',
    description: 'Retrieve comprehensive details for a specific managed property'
  })
  @ApiResponse({ status: 200, description: 'Property details retrieved successfully' })
  @ApiParam({ name: 'id', description: 'Property ID' })
  async getPropertyDetails(
    @Request() req: any,
    @Param('id') propertyId: string
  ) {
    return this.propertyManagerService.getPropertyDetails(req.user.id, propertyId);
  }

  @Get('staff')
  @Roles(UserRole.PROPERTY_MANAGER, UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get managed staff members',
    description: 'Retrieve all staff members under property manager supervision'
  })
  @ApiResponse({ status: 200, description: 'Staff members retrieved successfully' })
  @ApiQuery({ name: 'role', required: false, enum: ['maintenance', 'security', 'cleaning', 'leasing'] })
  @ApiQuery({ name: 'status', required: false, enum: ['active', 'inactive', 'on_leave'] })
  @ApiQuery({ name: 'limit', required: false, type: 'number' })
  @ApiQuery({ name: 'offset', required: false, type: 'number' })
  async getStaff(
    @Request() req: any,
    @Query('role') role?: string,
    @Query('status') status?: string,
    @Query('limit') limit: number = 50,
    @Query('offset') offset: number = 0
  ) {
    return this.propertyManagerService.getStaff(req.user.id, { role, status, limit, offset });
  }

  @Post('staff')
  @Roles(UserRole.PROPERTY_MANAGER, UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Add new staff member',
    description: 'Add a new staff member to the property management team'
  })
  @ApiResponse({ status: 201, description: 'Staff member added successfully' })
  async addStaffMember(
    @Request() req: any,
    @Body() createStaffDto: CreateStaffMemberDto
  ) {
    return this.propertyManagerService.addStaffMember(req.user.id, createStaffDto);
  }

  @Put('staff/:id')
  @Roles(UserRole.PROPERTY_MANAGER, UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Update staff member',
    description: 'Update information for an existing staff member'
  })
  @ApiResponse({ status: 200, description: 'Staff member updated successfully' })
  @ApiParam({ name: 'id', description: 'Staff member ID' })
  async updateStaffMember(
    @Request() req: any,
    @Param('id') staffId: string,
    @Body() updateStaffDto: UpdateStaffMemberDto
  ) {
    return this.propertyManagerService.updateStaffMember(req.user.id, staffId, updateStaffDto);
  }

  @Delete('staff/:id')
  @Roles(UserRole.PROPERTY_MANAGER, UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Remove staff member',
    description: 'Remove a staff member from the property management team'
  })
  @ApiResponse({ status: 200, description: 'Staff member removed successfully' })
  @ApiParam({ name: 'id', description: 'Staff member ID' })
  async removeStaffMember(
    @Request() req: any,
    @Param('id') staffId: string
  ) {
    return this.propertyManagerService.removeStaffMember(req.user.id, staffId);
  }

  @Post('staff/:id/assign-property')
  @Roles(UserRole.PROPERTY_MANAGER, UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Assign property to staff member',
    description: 'Assign a property or properties to a staff member'
  })
  @ApiResponse({ status: 200, description: 'Property assigned successfully' })
  @ApiParam({ name: 'id', description: 'Staff member ID' })
  async assignPropertyToStaff(
    @Request() req: any,
    @Param('id') staffId: string,
    @Body() assignPropertyDto: AssignPropertyDto
  ) {
    return this.propertyManagerService.assignPropertyToStaff(req.user.id, staffId, assignPropertyDto);
  }

  @Get('maintenance/requests')
  @Roles(UserRole.PROPERTY_MANAGER, UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get maintenance requests',
    description: 'Retrieve maintenance requests for managed properties'
  })
  @ApiResponse({ status: 200, description: 'Maintenance requests retrieved successfully' })
  @ApiQuery({ name: 'status', required: false, enum: ['pending', 'in_progress', 'completed', 'cancelled'] })
  @ApiQuery({ name: 'priority', required: false, enum: ['low', 'medium', 'high', 'urgent'] })
  @ApiQuery({ name: 'propertyId', required: false, type: 'string' })
  @ApiQuery({ name: 'assigneeId', required: false, type: 'string' })
  @ApiQuery({ name: 'limit', required: false, type: 'number' })
  @ApiQuery({ name: 'offset', required: false, type: 'number' })
  async getMaintenanceRequests(
    @Request() req: any,
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('propertyId') propertyId?: string,
    @Query('assigneeId') assigneeId?: string,
    @Query('limit') limit: number = 50,
    @Query('offset') offset: number = 0
  ) {
    return this.propertyManagerService.getMaintenanceRequests(req.user.id, {
      status,
      priority,
      propertyId,
      assigneeId,
      limit,
      offset
    });
  }

  @Post('maintenance/requests')
  @Roles(UserRole.PROPERTY_MANAGER, UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Create maintenance request',
    description: 'Create a new maintenance request for a managed property'
  })
  @ApiResponse({ status: 201, description: 'Maintenance request created successfully' })
  async createMaintenanceRequest(
    @Request() req: any,
    @Body() createRequestDto: CreateMaintenanceRequestDto
  ) {
    return this.propertyManagerService.createMaintenanceRequest(req.user.id, createRequestDto);
  }

  @Put('maintenance/requests/:id')
  @Roles(UserRole.PROPERTY_MANAGER, UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Update maintenance request',
    description: 'Update an existing maintenance request'
  })
  @ApiResponse({ status: 200, description: 'Maintenance request updated successfully' })
  @ApiParam({ name: 'id', description: 'Maintenance request ID' })
  async updateMaintenanceRequest(
    @Request() req: any,
    @Param('id') requestId: string,
    @Body() updateRequestDto: UpdateMaintenanceRequestDto
  ) {
    return this.propertyManagerService.updateMaintenanceRequest(req.user.id, requestId, updateRequestDto);
  }

  @Put('maintenance/requests/:id/assign')
  @Roles(UserRole.PROPERTY_MANAGER, UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Assign maintenance request',
    description: 'Assign a maintenance request to a staff member or contractor'
  })
  @ApiResponse({ status: 200, description: 'Maintenance request assigned successfully' })
  @ApiParam({ name: 'id', description: 'Maintenance request ID' })
  async assignMaintenanceRequest(
    @Request() req: any,
    @Param('id') requestId: string,
    @Body() assignDto: { assigneeId: string; assigneeType: 'staff' | 'contractor'; notes?: string }
  ) {
    return this.propertyManagerService.assignMaintenanceRequest(req.user.id, requestId, assignDto);
  }

  @Get('reports/portfolio')
  @Roles(UserRole.PROPERTY_MANAGER, UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get portfolio reports',
    description: 'Generate comprehensive reports for the managed property portfolio'
  })
  @ApiResponse({ status: 200, description: 'Portfolio reports generated successfully' })
  @ApiQuery({ name: 'period', required: false, enum: ['week', 'month', 'quarter', 'year'] })
  @ApiQuery({ name: 'type', required: false, enum: ['financial', 'occupancy', 'maintenance', 'performance'] })
  async getPortfolioReports(
    @Request() req: any,
    @Query('period') period: string = 'month',
    @Query('type') type?: string
  ) {
    return this.propertyManagerService.getPortfolioReports(req.user.id, period, type);
  }

  @Post('reports/custom')
  @Roles(UserRole.PROPERTY_MANAGER, UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Generate custom report',
    description: 'Generate a custom report based on specified parameters'
  })
  @ApiResponse({ status: 201, description: 'Custom report generated successfully' })
  async generateCustomReport(
    @Request() req: any,
    @Body() reportDto: PropertyManagerReportDto
  ) {
    return this.propertyManagerService.generateCustomReport(req.user.id, reportDto);
  }

  @Get('schedule')
  @Roles(UserRole.PROPERTY_MANAGER, UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get property manager schedule',
    description: 'Retrieve schedule including inspections, meetings, and tasks'
  })
  @ApiResponse({ status: 200, description: 'Schedule retrieved successfully' })
  @ApiQuery({ name: 'startDate', required: false, type: 'string' })
  @ApiQuery({ name: 'endDate', required: false, type: 'string' })
  @ApiQuery({ name: 'type', required: false, enum: ['inspection', 'meeting', 'maintenance', 'all'] })
  async getSchedule(
    @Request() req: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('type') type?: string
  ) {
    return this.propertyManagerService.getSchedule(req.user.id, { startDate, endDate, type });
  }

  @Post('schedule')
  @Roles(UserRole.PROPERTY_MANAGER, UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Add schedule item',
    description: 'Add a new item to the property manager schedule'
  })
  @ApiResponse({ status: 201, description: 'Schedule item added successfully' })
  async addScheduleItem(
    @Request() req: any,
    @Body() scheduleDto: StaffScheduleDto
  ) {
    return this.propertyManagerService.addScheduleItem(req.user.id, scheduleDto);
  }

  @Get('analytics/performance')
  @Roles(UserRole.PROPERTY_MANAGER, UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get performance analytics',
    description: 'Retrieve performance analytics for managed properties and staff'
  })
  @ApiResponse({ status: 200, description: 'Performance analytics retrieved successfully' })
  @ApiQuery({ name: 'metric', required: false, enum: ['occupancy', 'revenue', 'maintenance', 'satisfaction'] })
  @ApiQuery({ name: 'period', required: false, enum: ['week', 'month', 'quarter', 'year'] })
  async getPerformanceAnalytics(
    @Request() req: any,
    @Query('metric') metric?: string,
    @Query('period') period: string = 'month'
  ) {
    return this.propertyManagerService.getPerformanceAnalytics(req.user.id, metric, period);
  }

  @Get('tenants')
  @Roles(UserRole.PROPERTY_MANAGER, UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get managed tenants',
    description: 'Retrieve all tenants in managed properties'
  })
  @ApiResponse({ status: 200, description: 'Tenants retrieved successfully' })
  @ApiQuery({ name: 'propertyId', required: false, type: 'string' })
  @ApiQuery({ name: 'status', required: false, enum: ['active', 'inactive', 'pending'] })
  @ApiQuery({ name: 'limit', required: false, type: 'number' })
  @ApiQuery({ name: 'offset', require