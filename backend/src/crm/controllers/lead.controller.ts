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
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';
import { LeadService } from '../services/lead.service';
import { Lead, LeadStatus, LeadSource, LeadType, LeadPriority } from '../entities/lead.entity';

@ApiTags('Lead Management')
@Controller('api/crm/leads')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class LeadController {
  constructor(private readonly leadService: LeadService) {}

  @Get()
  @Roles(UserRole.AGENT, UserRole.ADMIN, UserRole.LANDLORD)
  @ApiOperation({ summary: 'Get all leads with filtering and pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: LeadStatus })
  @ApiQuery({ name: 'source', required: false, enum: LeadSource })
  @ApiQuery({ name: 'type', required: false, enum: LeadType })
  @ApiQuery({ name: 'priority', required: false, enum: LeadPriority })
  @ApiQuery({ name: 'assignedTo', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'dateFrom', required: false, type: String })
  @ApiQuery({ name: 'dateTo', required: false, type: String })
  @ApiResponse({ status: HttpStatus.OK, description: 'Leads retrieved successfully' })
  async getLeads(@Request() req, @Query() query: any) {
    const options = {
      page: parseInt(query.page) || 1,
      limit: parseInt(query.limit) || 20,
      status: query.status,
      source: query.source,
      type: query.type,
      priority: query.priority,
      assignedTo: query.assignedTo,
      search: query.search,
      dateFrom: query.dateFrom,
      dateTo: query.dateTo,
    };

    return this.leadService.getLeads(req.user.id, options);
  }

  @Get('analytics')
  @Roles(UserRole.AGENT, UserRole.ADMIN, UserRole.LANDLORD)
  @ApiOperation({ summary: 'Get lead analytics and statistics' })
  @ApiQuery({ name: 'period', required: false, type: String, description: 'week, month, quarter, year' })
  @ApiQuery({ name: 'dateFrom', required: false, type: String })
  @ApiQuery({ name: 'dateTo', required: false, type: String })
  @ApiResponse({ status: HttpStatus.OK, description: 'Lead analytics retrieved successfully' })
  async getLeadAnalytics(@Request() req, @Query() query: any) {
    return this.leadService.getLeadAnalytics(req.user.id, query.period);
  }

  @Get('dashboard')
  @Roles(UserRole.AGENT, UserRole.ADMIN, UserRole.LANDLORD)
  @ApiOperation({ summary: 'Get lead dashboard data' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Lead dashboard data retrieved successfully' })
  async getLeadDashboard(@Request() req) {
    return this.leadService.getLeadDashboard(req.user.id);
  }

  @Get('sources')
  @Roles(UserRole.AGENT, UserRole.ADMIN, UserRole.LANDLORD)
  @ApiOperation({ summary: 'Get lead sources with statistics' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Lead sources retrieved successfully' })
  async getLeadSources(@Request() req) {
    return this.leadService.getLeadSources(req.user.id);
  }

  @Get('conversion-funnel')
  @Roles(UserRole.AGENT, UserRole.ADMIN, UserRole.LANDLORD)
  @ApiOperation({ summary: 'Get lead conversion funnel data' })
  @ApiQuery({ name: 'period', required: false, type: String })
  @ApiResponse({ status: HttpStatus.OK, description: 'Conversion funnel data retrieved successfully' })
  async getConversionFunnel(@Request() req, @Query() query: any) {
    const options = {
      period: query.period || 'month',
    };

    return this.leadService.getConversionFunnel(req.user.id, options);
  }

  @Get(':id')
  @Roles(UserRole.AGENT, UserRole.ADMIN, UserRole.LANDLORD)
  @ApiOperation({ summary: 'Get lead by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Lead retrieved successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Lead not found' })
  async getLeadById(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req
  ) {
    return this.leadService.getLeadById(id, req.user.id);
  }

  @Get(':id/activities')
  @Roles(UserRole.AGENT, UserRole.ADMIN, UserRole.LANDLORD)
  @ApiOperation({ summary: 'Get lead activities and timeline' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: HttpStatus.OK, description: 'Lead activities retrieved successfully' })
  async getLeadActivities(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req,
    @Query() query: any
  ) {
    const options = {
      page: parseInt(query.page) || 1,
      limit: parseInt(query.limit) || 20,
    };

    return this.leadService.getLeadActivities(id, req.user.id, options);
  }

  @Get(':id/notes')
  @Roles(UserRole.AGENT, UserRole.ADMIN, UserRole.LANDLORD)
  @ApiOperation({ summary: 'Get lead notes' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Lead notes retrieved successfully' })
  async getLeadNotes(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req
  ) {
    return this.leadService.getLeadNotes(id, req.user.id);
  }

  @Get(':id/tasks')
  @Roles(UserRole.AGENT, UserRole.ADMIN, UserRole.LANDLORD)
  @ApiOperation({ summary: 'Get lead tasks' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Lead tasks retrieved successfully' })
  async getLeadTasks(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req
  ) {
    return this.leadService.getLeadTasks(id, req.user.id);
  }

  @Post()
  @Roles(UserRole.AGENT, UserRole.ADMIN, UserRole.LANDLORD)
  @ApiOperation({ summary: 'Create a new lead' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Lead created successfully' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid lead data' })
  async createLead(@Body() leadData: Partial<Lead>, @Request() req) {
    return this.leadService.createLead(leadData, req.user.id);
  }

  @Post('import')
  @Roles(UserRole.AGENT, UserRole.ADMIN, UserRole.LANDLORD)
  @ApiOperation({ summary: 'Import leads from CSV or other sources' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Leads imported successfully' })
  async importLeads(
    @Body() importData: {
      leads: Partial<Lead>[];
      source?: string;
      assignToCurrentUser?: boolean;
    },
    @Request() req
  ) {
    return this.leadService.importLeads(importData.leads, req.user.id);
  }

  @Post(':id/notes')
  @Roles(UserRole.AGENT, UserRole.ADMIN, UserRole.LANDLORD)
  @ApiOperation({ summary: 'Add note to lead' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Note added successfully' })
  async addLeadNote(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() noteData: { title?: string; content: string; type?: string; isImportant?: boolean },
    @Request() req
  ) {
    return this.leadService.addLeadNote(id, noteData, req.user.id);
  }

  @Post(':id/tasks')
  @Roles(UserRole.AGENT, UserRole.ADMIN, UserRole.LANDLORD)
  @ApiOperation({ summary: 'Create task for lead' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Task created successfully' })
  async createLeadTask(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() taskData: {
      title: string;
      description?: string;
      type: string;
      priority: string;
      dueDate?: Date;
      assignedToId?: string;
    },
    @Request() req
  ) {
    return this.leadService.createLeadTask(id, taskData, req.user.id);
  }

  @Post(':id/follow-up')
  @Roles(UserRole.AGENT, UserRole.ADMIN, UserRole.LANDLORD)
  @ApiOperation({ summary: 'Schedule follow-up for lead' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Follow-up scheduled successfully' })
  async scheduleFollowUp(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() followUpData: {
      date: Date;
      type: string;
      notes?: string;
      reminderMinutes?: number;
    },
    @Request() req
  ) {
    return this.leadService.scheduleFollowUp(id, followUpData, req.user.id);
  }

  @Post(':id/activities')
  @Roles(UserRole.AGENT, UserRole.ADMIN, UserRole.LANDLORD)
  @ApiOperation({ summary: 'Track lead activity' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Activity tracked successfully' })
  async trackLeadActivity(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() activityData: {
      type: string;
      direction?: string;
      title: string;
      description?: string;
      details?: any;
      value?: number;
      score?: number;
    },
    @Request() req
  ) {
    return this.leadService.trackLeadActivity(id, activityData, req.user.id);
  }

  @Put(':id')
  @Roles(UserRole.AGENT, UserRole.ADMIN, UserRole.LANDLORD)
  @ApiOperation({ summary: 'Update lead' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Lead updated successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Lead not found' })
  async updateLead(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() leadData: Partial<Lead>,
    @Request() req
  ) {
    return this.leadService.updateLead(id, leadData, req.user.id);
  }

  @Put(':id/status')
  @Roles(UserRole.AGENT, UserRole.ADMIN, UserRole.LANDLORD)
  @ApiOperation({ summary: 'Update lead status' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Lead status updated successfully' })
  async updateLeadStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() statusData: { status: LeadStatus; reason?: string; notes?: string },
    @Request() req
  ) {
    return this.leadService.updateLeadStatus(id, statusData, req.user.id);
  }

  @Put(':id/assign')
  @Roles(UserRole.ADMIN, UserRole.LANDLORD)
  @ApiOperation({ summary: 'Assign lead to agent' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Lead assigned successfully' })
  async assignLead(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() assignData: { assignedToId: string; notes?: string },
    @Request() req
  ) {
    return this.leadService.assignLead(id, assignData.assignedToId, req.user.id, assignData.notes);
  }

  @Put(':id/qualify')
  @Roles(UserRole.AGENT, UserRole.ADMIN, UserRole.LANDLORD)
  @ApiOperation({ summary: 'Qualify lead' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Lead qualified successfully' })
  async qualifyLead(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() qualifyData: {
      isQualified: boolean;
      score?: number;
      notes?: string;
      budget?: number;
      timeline?: string;
      requirements?: any;
    },
    @Request() req
  ) {
    const scoreData = {
      score: qualifyData.score || 0,
      notes: qualifyData.notes,
    };
    return this.leadService.qualifyLead(id, scoreData, req.user.id);
  }

  @Put(':id/convert')
  @Roles(UserRole.AGENT, UserRole.ADMIN, UserRole.LANDLORD)
  @ApiOperation({ summary: 'Convert lead to customer/deal' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Lead converted successfully' })
  async convertLead(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() convertData: {
      dealTitle?: string;
      dealValue?: number;
      dealStage?: string;
      notes?: string;
      createContact?: boolean;
    },
    @Request() req
  ) {
    return this.leadService.convertLead(id, convertData, req.user.id);
  }

  @Put(':id/score')
  @Roles(UserRole.AGENT, UserRole.ADMIN, UserRole.LANDLORD)
  @ApiOperation({ summary: 'Update lead score' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Lead score updated successfully' })
  async updateLeadScore(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() scoreData: { score: number; reason?: string },
    @Request() req
  ) {
    return this.leadService.updateLeadScore(id, scoreData, req.user.id);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.LANDLORD)
  @ApiOperation({ summary: 'Delete lead' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Lead deleted successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Lead not found' })
  async deleteLead(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req
  ) {
    return this.leadService.deleteLead(id, req.user.id);
  }

  @Delete(':id/soft')
  @Roles(UserRole.AGENT, UserRole.ADMIN, UserRole.LANDLORD)
  @ApiOperation({ summary: 'Soft delete lead (archive)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Lead archived successfully' })
  async archiveLead(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() archiveData: { reason?: string },
    @Request() req
  ) {
    return this.leadService.archiveLead(id, req.user.id, archiveData.reason);
  }

  // Bulk operations
  @Post('bulk/assign')
  @Roles(UserRole.ADMIN, UserRole.LANDLORD)
  @ApiOperation({ summary: 'Bulk assign leads to agent' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Leads assigned successfully' })
  async bulkAssignLeads(
    @Body() bulkData: { leadIds: string[]; assignedToId: string; notes?: string },
    @Request() req
  ) {
    const transformedData = {
      leadIds: bulkData.leadIds,
      assignToUserId: bulkData.assignedToId,
    };
    return this.leadService.bulkAssignLeads(transformedData, req.user.id);
  }

  @Put('bulk/status')
  @Roles(UserRole.AGENT, UserRole.ADMIN, UserRole.LANDLORD)
  @ApiOperation({ summary: 'Bulk update lead status' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Lead statuses updated successfully' })
  async bulkUpdateStatus(
    @Body() bulkData: { leadIds: string[]; status: LeadStatus; reason?: string },
    @Request() req
  ) {
    return this.leadService.bulkUpdateStatus(bulkData, req.user.id);
  }

  @Delete('bulk')
  @Roles(UserRole.ADMIN, UserRole.LANDLORD)
  @ApiOperation({ summary: 'Bulk delete leads' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Leads deleted successfully' })
  async bulkDeleteLeads(
    @Body() bulkData: { leadIds: string[]; reason?: string },
    @Request() req
  ) {
    return this.leadService.bulkDeleteLeads(bulkData, req.user.id);
  }
}