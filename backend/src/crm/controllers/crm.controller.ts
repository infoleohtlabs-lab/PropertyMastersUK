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
  HttpException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
  ApiBody,
  getSchemaPath,
} from '@nestjs/swagger';
import { ApiSuccessResponse } from '../../common/dto/api-response.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';
import { CrmService } from '../services/crm.service';
import { LeadService } from '../services/lead.service';
import { CrmContact } from '../entities/crm-contact.entity';
import { CrmDeal } from '../entities/crm-deal.entity';
import { CrmTask } from '../entities/crm-task.entity';
import { CrmNote } from '../entities/crm-note.entity';
import { Lead } from '../entities/lead.entity';

@ApiTags('CRM')
@Controller('crm')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CrmController {
  constructor(
    private readonly crmService: CrmService,
    private readonly leadService: LeadService,
  ) {}

  // Dashboard and Analytics
  @Get('dashboard')
  @ApiOperation({ 
    summary: 'Get CRM dashboard data',
    description: 'Retrieve comprehensive dashboard metrics including leads, deals, tasks, and performance analytics for the authenticated user'
  })
  @ApiQuery({
    name: 'period',
    required: false,
    description: 'Time period for dashboard data',
    enum: ['today', 'week', 'month', 'quarter', 'year'],
    example: 'month'
  })
  @ApiResponse({
    status: 200,
    description: 'Dashboard data retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        totalLeads: { type: 'number', example: 45 },
        totalDeals: { type: 'number', example: 12 },
        totalTasks: { type: 'number', example: 23 },
        conversionRate: { type: 'number', example: 26.7 },
        revenue: { type: 'number', example: 125000 }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized access' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @Roles(UserRole.AGENT, UserRole.ADMIN, UserRole.LANDLORD)
  async getDashboard(@Request() req, @Query('period') period?: string) {
    return this.crmService.getDashboardData(req.user.id, period);
  }

  @Get('analytics')
  @ApiOperation({ 
    summary: 'Get CRM analytics',
    description: 'Retrieve detailed analytics and performance metrics with customizable date ranges and analysis types'
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Start date for analytics period (ISO 8601 format)',
    example: '2024-01-01T00:00:00Z'
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'End date for analytics period (ISO 8601 format)',
    example: '2024-12-31T23:59:59Z'
  })
  @ApiQuery({
    name: 'type',
    required: false,
    description: 'Type of analytics to retrieve',
    enum: ['leads', 'deals', 'tasks', 'revenue', 'performance'],
    example: 'deals'
  })
  @ApiResponse({
    status: 200,
    description: 'Analytics data retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        period: { type: 'object' },
        metrics: { type: 'object' },
        trends: { type: 'array' },
        comparisons: { type: 'object' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized access' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 400, description: 'Invalid date range or parameters' })
  @Roles(UserRole.AGENT, UserRole.ADMIN)
  async getAnalytics(
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('type') type?: string,
  ) {
    return this.crmService.getAnalytics(req.user.id, {
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      type,
    });
  }

  // Contacts Management
  @Get('contacts')
  @ApiOperation({ 
    summary: 'Get all contacts',
    description: 'Retrieve paginated list of CRM contacts with optional filtering by search term, type, and status'
  })
  @ApiQuery({ 
    name: 'page', 
    required: false, 
    type: Number, 
    description: 'Page number for pagination',
    example: 1
  })
  @ApiQuery({ 
    name: 'limit', 
    required: false, 
    type: Number, 
    description: 'Number of contacts per page',
    example: 10
  })
  @ApiQuery({ 
    name: 'search', 
    required: false, 
    type: String, 
    description: 'Search term for contact name, email, or phone',
    example: 'john doe'
  })
  @ApiQuery({ 
    name: 'type', 
    required: false, 
    type: String, 
    description: 'Contact type filter',
    enum: ['lead', 'client', 'prospect', 'vendor'],
    example: 'client'
  })
  @ApiQuery({ 
    name: 'status', 
    required: false, 
    type: String, 
    description: 'Contact status filter',
    enum: ['active', 'inactive', 'archived'],
    example: 'active'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Contacts retrieved successfully', 
    type: [CrmContact] 
  })
  @ApiResponse({ status: 401, description: 'Unauthorized access' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 400, description: 'Invalid query parameters' })
  @Roles(UserRole.AGENT, UserRole.ADMIN, UserRole.LANDLORD)
  async getContacts(
    @Request() req,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search?: string,
    @Query('type') type?: string,
    @Query('status') status?: string,
  ) {
    return this.crmService.getContacts(req.user.id, {
      page,
      limit,
      search,
      type,
      status,
    });
  }

  @Get('contacts/:id')
  @ApiOperation({ 
    summary: 'Get contact by ID',
    description: 'Retrieve detailed information for a specific contact by their unique identifier'
  })
  @ApiParam({ 
    name: 'id', 
    type: 'string', 
    description: 'Unique identifier of the contact',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Contact retrieved successfully', 
    type: CrmContact 
  })
  @ApiResponse({ status: 401, description: 'Unauthorized access' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Contact not found' })
  @Roles(UserRole.AGENT, UserRole.ADMIN, UserRole.LANDLORD)
  async getContact(@Param('id') id: string, @Request() req) {
    return this.crmService.getContactById(id, req.user.id);
  }

  @Post('contacts')
  @ApiOperation({ 
    summary: 'Create new contact',
    description: 'Create a new CRM contact with provided information including personal details and contact preferences'
  })
  @ApiBody({
    description: 'Contact creation data',
    schema: {
      type: 'object',
      properties: {
        firstName: { type: 'string', example: 'John' },
        lastName: { type: 'string', example: 'Doe' },
        email: { type: 'string', example: 'john.doe@example.com' },
        phone: { type: 'string', example: '+44 7123 456789' },
        type: { type: 'string', enum: ['lead', 'client', 'prospect', 'vendor'], example: 'prospect' },
        status: { type: 'string', enum: ['active', 'inactive'], example: 'active' },
        notes: { type: 'string', example: 'Interested in 2-bedroom properties' }
      },
      required: ['firstName', 'lastName', 'email']
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Contact created successfully', 
    type: CrmContact 
  })
  @ApiResponse({ status: 400, description: 'Invalid contact data provided' })
  @ApiResponse({ status: 401, description: 'Unauthorized access' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 409, description: 'Contact with this email already exists' })
  @Roles(UserRole.AGENT, UserRole.ADMIN, UserRole.LANDLORD)
  async createContact(@Body() contactData: Partial<CrmContact>, @Request() req) {
    return this.crmService.createContact(contactData, req.user.id);
  }

  @Put('contacts/:id')
  @ApiOperation({ summary: 'Update contact' })
  @ApiResponse({ status: 200, description: 'Contact updated successfully', type: CrmContact })
  @ApiParam({ name: 'id', type: 'string' })
  @Roles(UserRole.AGENT, UserRole.ADMIN, UserRole.LANDLORD)
  async updateContact(
    @Param('id') id: string,
    @Body() contactData: Partial<CrmContact>,
    @Request() req,
  ) {
    return this.crmService.updateContact(id, contactData, req.user.id);
  }

  @Delete('contacts/:id')
  @ApiOperation({ summary: 'Delete contact' })
  @ApiResponse({ status: 200, description: 'Contact deleted successfully' })
  @ApiParam({ name: 'id', type: 'string' })
  @Roles(UserRole.AGENT, UserRole.ADMIN)
  async deleteContact(@Param('id') id: string, @Request() req) {
    return this.crmService.deleteContact(id, req.user.id);
  }

  // Deals Management
  @Get('deals')
  @ApiOperation({ summary: 'Get all deals' })
  @ApiResponse({ status: 200, description: 'Deals retrieved successfully', type: [CrmDeal] })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'stage', required: false, type: String })
  @ApiQuery({ name: 'type', required: false, type: String })
  @Roles(UserRole.AGENT, UserRole.ADMIN, UserRole.LANDLORD)
  async getDeals(
    @Request() req,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('stage') stage?: string,
    @Query('type') type?: string,
  ) {
    return this.crmService.getDeals(req.user.id, {
      page,
      limit,
      stage,
      type,
    });
  }

  @Get('deals/:id')
  @ApiOperation({ summary: 'Get deal by ID' })
  @ApiResponse({ status: 200, description: 'Deal retrieved successfully', type: CrmDeal })
  @ApiParam({ name: 'id', type: 'string' })
  @Roles(UserRole.AGENT, UserRole.ADMIN, UserRole.LANDLORD)
  async getDeal(@Param('id') id: string, @Request() req) {
    return this.crmService.getDealById(id, req.user.id);
  }

  @Post('deals')
  @ApiOperation({ summary: 'Create new deal' })
  @ApiResponse({ status: 201, description: 'Deal created successfully', type: CrmDeal })
  @Roles(UserRole.AGENT, UserRole.ADMIN, UserRole.LANDLORD)
  async createDeal(@Body() dealData: Partial<CrmDeal>, @Request() req) {
    return this.crmService.createDeal(dealData, req.user.id);
  }

  @Put('deals/:id')
  @ApiOperation({ summary: 'Update deal' })
  @ApiResponse({ status: 200, description: 'Deal updated successfully', type: CrmDeal })
  @ApiParam({ name: 'id', type: 'string' })
  @Roles(UserRole.AGENT, UserRole.ADMIN, UserRole.LANDLORD)
  async updateDeal(
    @Param('id') id: string,
    @Body() dealData: Partial<CrmDeal>,
    @Request() req,
  ) {
    return this.crmService.updateDeal(id, dealData, req.user.id);
  }

  @Put('deals/:id/stage')
  @ApiOperation({ summary: 'Update deal stage' })
  @ApiResponse({ status: 200, description: 'Deal stage updated successfully' })
  @ApiParam({ name: 'id', type: 'string' })
  @Roles(UserRole.AGENT, UserRole.ADMIN, UserRole.LANDLORD)
  async updateDealStage(
    @Param('id') id: string,
    @Body() stageData: { stage: string; notes?: string },
    @Request() req,
  ) {
    return this.crmService.updateDealStage(id, stageData.stage, stageData.notes, req.user.id);
  }

  // Tasks Management
  @Get('tasks')
  @ApiOperation({ summary: 'Get all tasks' })
  @ApiResponse({ status: 200, description: 'Tasks retrieved successfully', type: [CrmTask] })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'type', required: false, type: String })
  @ApiQuery({ name: 'dueDate', required: false, type: String })
  @Roles(UserRole.AGENT, UserRole.ADMIN, UserRole.LANDLORD)
  async getTasks(
    @Request() req,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('dueDate') dueDate?: string,
  ) {
    return this.crmService.getTasks(req.user.id, {
      page,
      limit,
      status,
      type,
      dueDate: dueDate ? new Date(dueDate) : undefined,
    });
  }

  @Post('tasks')
  @ApiOperation({ summary: 'Create new task' })
  @ApiResponse({ status: 201, description: 'Task created successfully', type: CrmTask })
  @Roles(UserRole.AGENT, UserRole.ADMIN, UserRole.LANDLORD)
  async createTask(@Body() taskData: Partial<CrmTask>, @Request() req) {
    return this.crmService.createTask(taskData, req.user.id);
  }

  @Put('tasks/:id')
  @ApiOperation({ summary: 'Update task' })
  @ApiResponse({ status: 200, description: 'Task updated successfully', type: CrmTask })
  @ApiParam({ name: 'id', type: 'string' })
  @Roles(UserRole.AGENT, UserRole.ADMIN, UserRole.LANDLORD)
  async updateTask(
    @Param('id') id: string,
    @Body() taskData: Partial<CrmTask>,
    @Request() req,
  ) {
    return this.crmService.updateTask(id, taskData, req.user.id);
  }

  @Put('tasks/:id/complete')
  @ApiOperation({ summary: 'Mark task as completed' })
  @ApiResponse({ status: 200, description: 'Task marked as completed' })
  @ApiParam({ name: 'id', type: 'string' })
  @Roles(UserRole.AGENT, UserRole.ADMIN, UserRole.LANDLORD)
  async completeTask(
    @Param('id') id: string,
    @Body() completionData: { outcome?: any; notes?: string },
    @Request() req,
  ) {
    return this.crmService.completeTask(id, completionData, req.user.id);
  }

  // Notes Management
  @Get('notes')
  @ApiOperation({ summary: 'Get all notes' })
  @ApiResponse({ status: 200, description: 'Notes retrieved successfully', type: [CrmNote] })
  @ApiQuery({ name: 'entityType', required: false, type: String })
  @ApiQuery({ name: 'entityId', required: false, type: String })
  @Roles(UserRole.AGENT, UserRole.ADMIN, UserRole.LANDLORD)
  async getNotes(
    @Request() req,
    @Query('entityType') entityType?: string,
    @Query('entityId') entityId?: string,
  ) {
    return this.crmService.getNotes(req.user.id, { entityType, entityId });
  }

  @Post('notes')
  @ApiOperation({ summary: 'Create new note' })
  @ApiResponse({ status: 201, description: 'Note created successfully', type: CrmNote })
  @Roles(UserRole.AGENT, UserRole.ADMIN, UserRole.LANDLORD)
  async createNote(@Body() noteData: Partial<CrmNote>, @Request() req) {
    return this.crmService.createNote(noteData, req.user.id);
  }

  @Put('notes/:id')
  @ApiOperation({ summary: 'Update note' })
  @ApiResponse({ status: 200, description: 'Note updated successfully', type: CrmNote })
  @ApiParam({ name: 'id', type: 'string' })
  @Roles(UserRole.AGENT, UserRole.ADMIN, UserRole.LANDLORD)
  async updateNote(
    @Param('id') id: string,
    @Body() noteData: Partial<CrmNote>,
    @Request() req,
  ) {
    return this.crmService.updateNote(id, noteData, req.user.id);
  }

  // Lead Management
  @Get('leads')
  @ApiOperation({ summary: 'Get all leads' })
  @ApiResponse({ status: 200, description: 'Leads retrieved successfully', type: [Lead] })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'source', required: false, type: String })
  @Roles(UserRole.AGENT, UserRole.ADMIN, UserRole.LANDLORD)
  async getLeads(
    @Request() req,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('status') status?: string,
    @Query('source') source?: string,
  ) {
    return this.leadService.getLeads(req.user.id, {
      page,
      limit,
      status,
      source,
    });
  }

  @Post('leads')
  @ApiOperation({ summary: 'Create new lead' })
  @ApiResponse({ status: 201, description: 'Lead created successfully', type: Lead })
  @Roles(UserRole.AGENT, UserRole.ADMIN, UserRole.LANDLORD)
  async createLead(@Body() leadData: Partial<Lead>, @Request() req) {
    return this.leadService.createLead(leadData, req.user.id);
  }

  @Put('leads/:id/qualify')
  @ApiOperation({ summary: 'Qualify lead' })
  @ApiResponse({ status: 200, description: 'Lead qualified successfully' })
  @ApiParam({ name: 'id', type: 'string' })
  @Roles(UserRole.AGENT, UserRole.ADMIN, UserRole.LANDLORD)
  async qualifyLead(
    @Param('id') id: string,
    @Body() qualificationData: { score: number; notes?: string },
    @Request() req,
  ) {
    return this.leadService.qualifyLead(id, qualificationData, req.user.id);
  }

  @Put('leads/:id/convert')
  @ApiOperation({ summary: 'Convert lead to contact/deal' })
  @ApiResponse({ status: 200, description: 'Lead converted successfully' })
  @ApiParam({ name: 'id', type: 'string' })
  @Roles(UserRole.AGENT, UserRole.ADMIN, UserRole.LANDLORD)
  async convertLead(
    @Param('id') id: string,
    @Body() conversionData: { createContact?: boolean; createDeal?: boolean; dealData?: any },
    @Request() req,
  ) {
    return this.leadService.convertLead(id, conversionData, req.user.id);
  }
}
