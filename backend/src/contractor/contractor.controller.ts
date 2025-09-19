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
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
  ApiConsumes,
} from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { ContractorService } from './contractor.service';
import {
  UpdateWorkOrderDto,
  CreateInvoiceDto,
  UpdateInvoiceDto,
  ContractorAvailabilityDto,
  WorkOrderQuoteDto,
  ContractorProfileDto,
  TimeTrackingDto,
  ExpenseReportDto,
} from './dto/contractor.dto';

@ApiTags('Contractor')
@Controller('contractor')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ContractorController {
  constructor(private readonly contractorService: ContractorService) {}

  @Get('dashboard')
  @Roles(UserRole.CONTRACTOR, UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.PROPERTY_MANAGER)
  @ApiOperation({
    summary: 'Get contractor dashboard overview',
    description: 'Retrieve comprehensive overview including work orders, schedule, and earnings'
  })
  @ApiResponse({
    status: 200,
    description: 'Contractor dashboard data retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        stats: {
          type: 'object',
          properties: {
            activeWorkOrders: { type: 'number' },
            completedThisMonth: { type: 'number' },
            totalEarnings: { type: 'number' },
            pendingInvoices: { type: 'number' },
            upcomingJobs: { type: 'number' },
            averageRating: { type: 'number' },
          }
        },
        recentWorkOrders: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              title: { type: 'string' },
              status: { type: 'string' },
              priority: { type: 'string' },
              scheduledDate: { type: 'string' },
              property: { type: 'object' },
            }
          }
        },
        upcomingSchedule: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              title: { type: 'string' },
              startTime: { type: 'string' },
              endTime: { type: 'string' },
              location: { type: 'string' },
            }
          }
        }
      }
    }
  })
  async getDashboard(@Request() req: any) {
    return this.contractorService.getDashboardData(req.user.id);
  }

  @Get('work-orders')
  @Roles(UserRole.CONTRACTOR, UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.PROPERTY_MANAGER)
  @ApiOperation({
    summary: 'Get assigned work orders',
    description: 'Retrieve work orders assigned to the contractor'
  })
  @ApiResponse({ status: 200, description: 'Work orders retrieved successfully' })
  @ApiQuery({ name: 'status', required: false, enum: ['pending', 'accepted', 'in_progress', 'completed', 'cancelled'] })
  @ApiQuery({ name: 'priority', required: false, enum: ['low', 'medium', 'high', 'urgent'] })
  @ApiQuery({ name: 'category', required: false, enum: ['plumbing', 'electrical', 'hvac', 'general', 'emergency'] })
  @ApiQuery({ name: 'startDate', required: false, type: 'string' })
  @ApiQuery({ name: 'endDate', required: false, type: 'string' })
  @ApiQuery({ name: 'limit', required: false, type: 'number' })
  @ApiQuery({ name: 'offset', required: false, type: 'number' })
  async getWorkOrders(
    @Request() req: any,
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('category') category?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit: number = 50,
    @Query('offset') offset: number = 0
  ) {
    return this.contractorService.getWorkOrders(req.user.id, {
      status,
      priority,
      category,
      startDate,
      endDate,
      limit,
      offset
    });
  }

  @Get('work-orders/:id')
  @Roles(UserRole.CONTRACTOR, UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.PROPERTY_MANAGER)
  @ApiOperation({
    summary: 'Get work order details',
    description: 'Retrieve detailed information for a specific work order'
  })
  @ApiResponse({ status: 200, description: 'Work order details retrieved successfully' })
  @ApiParam({ name: 'id', description: 'Work order ID' })
  async getWorkOrderDetails(
    @Request() req: any,
    @Param('id') workOrderId: string
  ) {
    return this.contractorService.getWorkOrderDetails(req.user.id, workOrderId);
  }

  @Put('work-orders/:id/accept')
  @Roles(UserRole.CONTRACTOR)
  @ApiOperation({
    summary: 'Accept work order',
    description: 'Accept an assigned work order'
  })
  @ApiResponse({ status: 200, description: 'Work order accepted successfully' })
  @ApiParam({ name: 'id', description: 'Work order ID' })
  async acceptWorkOrder(
    @Request() req: any,
    @Param('id') workOrderId: string,
    @Body() acceptDto: { estimatedStartDate?: string; notes?: string }
  ) {
    return this.contractorService.acceptWorkOrder(req.user.id, workOrderId, acceptDto);
  }

  @Put('work-orders/:id/decline')
  @Roles(UserRole.CONTRACTOR)
  @ApiOperation({
    summary: 'Decline work order',
    description: 'Decline an assigned work order with reason'
  })
  @ApiResponse({ status: 200, description: 'Work order declined successfully' })
  @ApiParam({ name: 'id', description: 'Work order ID' })
  async declineWorkOrder(
    @Request() req: any,
    @Param('id') workOrderId: string,
    @Body() declineDto: { reason: string; notes?: string }
  ) {
    return this.contractorService.declineWorkOrder(req.user.id, workOrderId, declineDto);
  }

  @Put('work-orders/:id')
  @Roles(UserRole.CONTRACTOR, UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.PROPERTY_MANAGER)
  @ApiOperation({
    summary: 'Update work order',
    description: 'Update work order status, progress, or details'
  })
  @ApiResponse({ status: 200, description: 'Work order updated successfully' })
  @ApiParam({ name: 'id', description: 'Work order ID' })
  async updateWorkOrder(
    @Request() req: any,
    @Param('id') workOrderId: string,
    @Body() updateDto: UpdateWorkOrderDto
  ) {
    return this.contractorService.updateWorkOrder(req.user.id, workOrderId, updateDto);
  }

  @Post('work-orders/:id/complete')
  @Roles(UserRole.CONTRACTOR)
  @ApiOperation({
    summary: 'Complete work order',
    description: 'Mark work order as completed with final details'
  })
  @ApiResponse({ status: 200, description: 'Work order completed successfully' })
  @ApiParam({ name: 'id', description: 'Work order ID' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('photos', 10))
  async completeWorkOrder(
    @Request() req: any,
    @Param('id') workOrderId: string,
    @Body() completionDto: {
      completionNotes: string;
      materialsUsed?: string;
      timeSpent?: number;
      additionalCharges?: number;
    },
    @UploadedFiles() photos?: Express.Multer.File[]
  ) {
    return this.contractorService.completeWorkOrder(req.user.id, workOrderId, completionDto, photos);
  }

  @Post('work-orders/:id/quote')
  @Roles(UserRole.CONTRACTOR)
  @ApiOperation({
    summary: 'Submit work order quote',
    description: 'Submit a quote for a work order'
  })
  @ApiResponse({ status: 201, description: 'Quote submitted successfully' })
  @ApiParam({ name: 'id', description: 'Work order ID' })
  async submitQuote(
    @Request() req: any,
    @Param('id') workOrderId: string,
    @Body() quoteDto: WorkOrderQuoteDto
  ) {
    return this.contractorService.submitQuote(req.user.id, workOrderId, quoteDto);
  }

  @Get('schedule')
  @Roles(UserRole.CONTRACTOR, UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.PROPERTY_MANAGER)
  @ApiOperation({
    summary: 'Get contractor schedule',
    description: 'Retrieve contractor schedule including work orders and availability'
  })
  @ApiResponse({ status: 200, description: 'Schedule retrieved successfully' })
  @ApiQuery({ name: 'startDate', required: false, type: 'string' })
  @ApiQuery({ name: 'endDate', required: false, type: 'string' })
  @ApiQuery({ name: 'view', required: false, enum: ['day', 'week', 'month'] })
  async getSchedule(
    @Request() req: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('view') view: string = 'week'
  ) {
    return this.contractorService.getSchedule(req.user.id, { startDate, endDate, view });
  }

  @Post('schedule/availability')
  @Roles(UserRole.CONTRACTOR)
  @ApiOperation({
    summary: 'Set availability',
    description: 'Set contractor availability for scheduling'
  })
  @ApiResponse({ status: 201, description: 'Availability set successfully' })
  async setAvailability(
    @Request() req: any,
    @Body() availabilityDto: ContractorAvailabilityDto
  ) {
    return this.contractorService.setAvailability(req.user.id, availabilityDto);
  }

  @Get('invoices')
  @Roles(UserRole.CONTRACTOR, UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.PROPERTY_MANAGER)
  @ApiOperation({
    summary: 'Get contractor invoices',
    description: 'Retrieve invoices created by the contractor'
  })
  @ApiResponse({ status: 200, description: 'Invoices retrieved successfully' })
  @ApiQuery({ name: 'status', required: false, enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'] })
  @ApiQuery({ name: 'startDate', required: false, type: 'string' })
  @ApiQuery({ name: 'endDate', required: false, type: 'string' })
  @ApiQuery({ name: 'limit', required: false, type: 'number' })
  @ApiQuery({ name: 'offset', required: false, type: 'number' })
  async getInvoices(
    @Request() req: any,
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit: number = 50,
    @Query('offset') offset: number = 0
  ) {
    return this.contractorService.getInvoices(req.user.id, {
      status,
      startDate,
      endDate,
      limit,
      offset
    });
  }

  @Post('invoices')
  @Roles(UserRole.CONTRACTOR)
  @ApiOperation({
    summary: 'Create invoice',
    description: 'Create a new invoice for completed work'
  })
  @ApiResponse({ status: 201, description: 'Invoice created successfully' })
  async createInvoice(
    @Request() req: any,
    @Body() createInvoiceDto: CreateInvoiceDto
  ) {
    return this.contractorService.createInvoice(req.user.id, createInvoiceDto);
  }

  @Put('invoices/:id')
  @Roles(UserRole.CONTRACTOR)
  @ApiOperation({
    summary: 'Update invoice',
    description: 'Update an existing invoice'
  })
  @ApiResponse({ status: 200, description: 'Invoice updated successfully' })
  @ApiParam({ name: 'id', description: 'Invoice ID' })
  async updateInvoice(
    @Request() req: any,
    @Param('id') invoiceId: string,
    @Body() updateInvoiceDto: UpdateInvoiceDto
  ) {
    return this.contractorService.updateInvoice(req.user.id, invoiceId, updateInvoiceDto);
  }

  @Post('invoices/:id/send')
  @Roles(UserRole.CONTRACTOR)
  @ApiOperation({
    summary: 'Send invoice',
    description: 'Send invoice to client'
  })
  @ApiResponse({ status: 200, description: 'Invoice sent successfully' })
  @ApiParam({ name: 'id', description: 'Invoice ID' })
  async sendInvoice(
    @Request() req: any,
    @Param('id') invoiceId: string
  ) {
    return this.contractorService.sendInvoice(req.user.id, invoiceId);
  }

  @Get('earnings')
  @Roles(UserRole.CONTRACTOR, UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get earnings summary',
    description: 'Retrieve contractor earnings summary and analytics'
  })
  @ApiResponse({ status: 200, description: 'Earnings summary retrieved successfully' })
  @ApiQuery({ name: 'period', required: false, enum: ['week', 'month', 'quarter', 'year'] })
  @ApiQuery({ name: 'year', required: false, type: 'number' })
  async getEarnings(
    @Request() req: any,
    @Query('period') period: string = 'month',
    @Query('year') year?: number
  ) {
    return this.contractorService.getEarnings(req.user.id, period, year);
  }

  @Get('profile')
  @Roles(UserRole.CONTRACTOR, UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.PROPERTY_MANAGER)
  @ApiOperation({
    summary: 'Get contractor profile',
    description: 'Retrieve contractor profile information including skills and certifications'
  })
  @ApiResponse({ status: 200, description: 'Contractor profile retrieved successfully' })
  async getProfile(@Request() req: any) {
    return this.contractorService.getProfile(req.user.id);
  }

  @Put('profile')
  @Roles(UserRole.CONTRACTOR)
  @ApiOperation({
    summary: 'Update contractor profile',
    description: 'Update contractor profile information'
  })
  @ApiResponse({ status: 200, description: 'Contractor profile updated successfully' })
  async updateProfile(
    @Request() req: any,
    @Body() profileDto: ContractorProfileDto
  ) {
    return this.contractorService.updateProfile(req.user.id, profileDto);
  }

  @Get('reviews')
  @Roles(UserRole.CONTRACTOR, UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.PROPERTY_MANAGER)
  @ApiOperation({
    summary: 'Get contractor reviews',
    description: 'Retrieve reviews and ratings for the contractor'
  })
  @ApiResponse({ status: 200, description: 'Reviews retrieved successfully' })
  @ApiQuery({ name: 'limit', required: false, type: 'number' })
  @ApiQuery({ name: 'offset', required: false, type: 'number' })
  async getReviews(
    @Request() req: any,
    @Query('limit') limit: number = 20,
    @Query('offset') offset: number = 0
  ) {
    return this.contractorService.getReviews(req.user.id, { limit, offset });
  }

  @Post('time-tracking')
  @Roles(UserRole.CONTRACTOR)
  @ApiOperation({
    summary: 'Track time for work order',
    description: 'Log time spent on a work order'
  })
  @ApiResponse({ status: 201, description: 'Time tracked successfully' })
  async trackTime(
    @Request() req: any,
    @Body() timeTrackingDto: TimeTrackingDto
  ) {
    return this.contractorService.trackTime(req.user.id, timeTrackingDto);
  }

  @Get('time-tracking')
  @Roles(UserRole.CONTRACTOR, UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.PROPERTY_MANAGER)
  @ApiOperation({
    summary: 'Get time tracking records',
    description: 'Retrieve time tracking records for the contractor'
  })
  @ApiResponse({ status: 200, description: 'Time tracking records retrieved successfully' })
  @ApiQuery({ name: 'workOrderId', required: false, type: 'string' })
  @ApiQuery({ name: 'startDate', required: false, type: 'string' })
  @ApiQuery({ name: 'endDate', required: false, type: 'string' })
  @ApiQuery({ name: 'limit', required: false, type: 'number' })
  @ApiQuery({ name: 'offset', required: false, type: 'number' })
  async getTimeTracking(
    @Request() req: any,
    @Query('workOrderId') workOrderId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit: number = 50,
    @Query('offset') offset: number = 0
  ) {
    return this.contractorService.getTimeTracking(req.user.id, {
      workOrderId,
      startDate,
      endDate,
      limit,
      offset
    });
  }

  @Post('expenses')
  @Roles(UserRole.CONTRACTOR)
  @ApiOperation({
    summary: 'Submit expense report',
    description: 'Submit an expense report for reimbursement'
  })
  @ApiResponse({ status: 201, description: 'Expense report submitted successfully' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('receipts', 5))
  async submitExpenseReport(
    @Request() req: any,
    @Body() expenseDto: ExpenseReportDto,
    @UploadedFiles() receipts?: Express.Multer.File[]
  ) {
    return this.contractorService.submitExpenseReport(req.user.id, expenseDto, receipts);
  }

  @Get('expenses')
  @Roles(UserRole.CONTRACTOR, UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.PROPERTY_MANAGER)
  @ApiOperation({
    summary: 'Get expense reports',
    description: 'Retrieve submitted expense reports'
  })
  @ApiResponse({ status: 200, description: 'Expense reports retrieved successfully' })
  @ApiQuery({ name: 'status', required: false, enum: ['pending', 'approved', 'rejected', 'paid'] })
  @ApiQuery({ name: 'startDate', required: false, type: 'string' })
  @ApiQuery({ name: 'endDate', required: false, type: 'string' })
  @ApiQuery({ name: 'limit', required: false, type: 'number' })
  @ApiQuery({ name: 'offset', required: false, type: 'number' })
  async getExpenseReports(
    @Request() req: any,
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit: number = 50,
    @Query('offset') offset: number = 0
  ) {
    return this.contractorService.getExpenseReports(req.user.id, {
      status,
      startDate,
      endDate,
      limit,
      offset
    });
  }

  @Get('analytics/performance')
  @Roles(UserRole.CONTRACTOR, UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.PROPERTY_MANAGER)
  @ApiOperation({
    summary: 'Get performance analytics',
    description: 'Retrieve contractor performance analytics and metrics'
  })
  @ApiResponse({ status: 200, description: 'Performance analytics retrieved successfully' })
  @ApiQuery({ name: 'period', required: false, enum: ['week', 'month', 'quarter', 'year'] })
  async getPerformanceAnalytics(
    @Request() req: any,
    @Query('period') period: string = 'month'
  ) {
    return this.contractorService.getPerformanceAnalytics(req.