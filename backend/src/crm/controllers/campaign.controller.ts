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

  getSchemaPath,} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';
import { CampaignService } from '../services/campaign.service';
import { EmailService } from '../services/email.service';
import { Campaign } from '../entities/campaign.entity';
import { EmailTemplate } from '../entities/email-template.entity';
import { CampaignEmail } from '../entities/campaign-email.entity';

@ApiTags('Campaign Management')
@Controller('campaigns')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CampaignController {
  constructor(
    private readonly campaignService: CampaignService,
    private readonly emailService: EmailService,
  ) {}

  // Campaign Management
  @Get()
  @ApiOperation({ summary: 'Get all campaigns' })
  @ApiResponse({ status: 200, description: 'Campaigns retrieved successfully', schema: { type: 'array', items: { $ref: getSchemaPath(Campaign) } } })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'type', required: false, type: String })
  @Roles(UserRole.AGENT, UserRole.ADMIN, UserRole.LANDLORD)
  async getCampaigns(
    @Request() req,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('status') status?: string,
    @Query('type') type?: string,
  ) {
    return this.campaignService.getCampaigns(req.user.id, {
      page,
      limit,
      status,
      type,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get campaign by ID' })
  @ApiResponse({ status: 200, description: 'Campaign retrieved successfully', schema: { $ref: getSchemaPath(Campaign) } })
  @ApiParam({ name: 'id', type: 'string' })
  @Roles(UserRole.AGENT, UserRole.ADMIN, UserRole.LANDLORD)
  async getCampaign(@Param('id') id: string, @Request() req) {
    return this.campaignService.getCampaignById(id, req.user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new campaign' })
  @ApiResponse({ status: 201, description: 'Campaign created successfully', schema: { $ref: getSchemaPath(Campaign) } })
  @Roles(UserRole.AGENT, UserRole.ADMIN, UserRole.LANDLORD)
  async createCampaign(@Body() campaignData: Partial<Campaign>, @Request() req) {
    return this.campaignService.createCampaign(campaignData, req.user.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update campaign' })
  @ApiResponse({ status: 200, description: 'Campaign updated successfully', schema: { $ref: getSchemaPath(Campaign) } })
  @ApiParam({ name: 'id', type: 'string' })
  @Roles(UserRole.AGENT, UserRole.ADMIN, UserRole.LANDLORD)
  async updateCampaign(
    @Param('id') id: string,
    @Body() campaignData: Partial<Campaign>,
    @Request() req,
  ) {
    return this.campaignService.updateCampaign(id, campaignData, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete campaign' })
  @ApiResponse({ status: 200, description: 'Campaign deleted successfully' })
  @ApiParam({ name: 'id', type: 'string' })
  @Roles(UserRole.AGENT, UserRole.ADMIN)
  async deleteCampaign(@Param('id') id: string, @Request() req) {
    return this.campaignService.deleteCampaign(id, req.user.id);
  }

  // Campaign Execution
  @Post(':id/launch')
  @ApiOperation({ summary: 'Launch campaign' })
  @ApiResponse({ status: 200, description: 'Campaign launched successfully' })
  @ApiParam({ name: 'id', type: 'string' })
  @Roles(UserRole.AGENT, UserRole.ADMIN, UserRole.LANDLORD)
  async launchCampaign(@Param('id') id: string, @Request() req) {
    return this.campaignService.launchCampaign(id, req.user.id);
  }

  @Post(':id/pause')
  @ApiOperation({ summary: 'Pause campaign' })
  @ApiResponse({ status: 200, description: 'Campaign paused successfully' })
  @ApiParam({ name: 'id', type: 'string' })
  @Roles(UserRole.AGENT, UserRole.ADMIN, UserRole.LANDLORD)
  async pauseCampaign(@Param('id') id: string, @Request() req) {
    return this.campaignService.pauseCampaign(id, req.user.id);
  }

  @Post(':id/resume')
  @ApiOperation({ summary: 'Resume campaign' })
  @ApiResponse({ status: 200, description: 'Campaign resumed successfully' })
  @ApiParam({ name: 'id', type: 'string' })
  @Roles(UserRole.AGENT, UserRole.ADMIN, UserRole.LANDLORD)
  async resumeCampaign(@Param('id') id: string, @Request() req) {
    return this.campaignService.resumeCampaign(id, req.user.id);
  }

  @Post(':id/stop')
  @ApiOperation({ summary: 'Stop campaign' })
  @ApiResponse({ status: 200, description: 'Campaign stopped successfully' })
  @ApiParam({ name: 'id', type: 'string' })
  @Roles(UserRole.AGENT, UserRole.ADMIN, UserRole.LANDLORD)
  async stopCampaign(@Param('id') id: string, @Request() req) {
    return this.campaignService.stopCampaign(id, req.user.id);
  }

  // Campaign Analytics
  @Get(':id/analytics')
  @ApiOperation({ summary: 'Get campaign analytics' })
  @ApiResponse({ status: 200, description: 'Campaign analytics retrieved successfully' })
  @ApiParam({ name: 'id', type: 'string' })
  @Roles(UserRole.AGENT, UserRole.ADMIN, UserRole.LANDLORD)
  async getCampaignAnalytics(@Param('id') id: string, @Request() req) {
    return this.campaignService.getCampaignAnalytics(id, req.user.id);
  }

  @Get(':id/performance')
  @ApiOperation({ summary: 'Get campaign performance metrics' })
  @ApiResponse({ status: 200, description: 'Campaign performance retrieved successfully' })
  @ApiParam({ name: 'id', type: 'string' })
  @Roles(UserRole.AGENT, UserRole.ADMIN, UserRole.LANDLORD)
  async getCampaignPerformance(@Param('id') id: string, @Request() req) {
    return this.campaignService.getCampaignPerformance(id, req.user.id);
  }

  // Campaign Emails
  @Get(':id/emails')
  @ApiOperation({ summary: 'Get campaign emails' })
  @ApiResponse({ status: 200, description: 'Campaign emails retrieved successfully', schema: { type: 'array', items: { $ref: getSchemaPath(CampaignEmail) } } })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  @Roles(UserRole.AGENT, UserRole.ADMIN, UserRole.LANDLORD)
  async getCampaignEmails(
    @Param('id') id: string,
    @Request() req,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('status') status?: string,
  ) {
    return this.campaignService.getCampaignEmails(id, req.user.id, {
      page,
      limit,
      status,
    });
  }

  @Post(':id/test-email')
  @ApiOperation({ summary: 'Send test email for campaign' })
  @ApiResponse({ status: 200, description: 'Test email sent successfully' })
  @ApiParam({ name: 'id', type: 'string' })
  @Roles(UserRole.AGENT, UserRole.ADMIN, UserRole.LANDLORD)
  async sendTestEmail(
    @Param('id') id: string,
    @Body() testData: { email: string; personalizeData?: any },
    @Request() req,
  ) {
    return this.campaignService.sendTestEmail(id, testData.email, testData.personalizeData, req.user.id);
  }

  // A/B Testing
  @Post(':id/ab-test')
  @ApiOperation({ summary: 'Create A/B test for campaign' })
  @ApiResponse({ status: 200, description: 'A/B test created successfully' })
  @ApiParam({ name: 'id', type: 'string' })
  @Roles(UserRole.AGENT, UserRole.ADMIN, UserRole.LANDLORD)
  async createABTest(
    @Param('id') id: string,
    @Body() abTestData: {
      variants: { name: string; subject: string; content: string; percentage: number }[];
      testDuration: number;
      winnerCriteria: string;
    },
    @Request() req,
  ) {
    return this.campaignService.createABTest(id, abTestData, req.user.id);
  }

  @Get(':id/ab-test/results')
  @ApiOperation({ summary: 'Get A/B test results' })
  @ApiResponse({ status: 200, description: 'A/B test results retrieved successfully' })
  @ApiParam({ name: 'id', type: 'string' })
  @Roles(UserRole.AGENT, UserRole.ADMIN, UserRole.LANDLORD)
  async getABTestResults(@Param('id') id: string, @Request() req) {
    return this.campaignService.getABTestResults(id, req.user.id);
  }

  // Email Templates
  @Get('templates')
  @ApiOperation({ summary: 'Get all email templates' })
  @ApiResponse({ status: 200, description: 'Email templates retrieved successfully', schema: { type: 'array', items: { $ref: getSchemaPath(EmailTemplate) } } })
  @ApiQuery({ name: 'type', required: false, type: String })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @Roles(UserRole.AGENT, UserRole.ADMIN, UserRole.LANDLORD)
  async getEmailTemplates(
    @Request() req,
    @Query('type') type?: string,
    @Query('category') category?: string,
    @Query('status') status?: string,
  ) {
    return this.emailService.getEmailTemplates(req.user.id, {
      category,
    });
  }

  @Get('templates/:id')
  @ApiOperation({ summary: 'Get email template by ID' })
  @ApiResponse({ status: 200, description: 'Email template retrieved successfully', schema: { $ref: getSchemaPath(EmailTemplate) } })
  @ApiParam({ name: 'id', type: 'string' })
  @Roles(UserRole.AGENT, UserRole.ADMIN, UserRole.LANDLORD)
  async getEmailTemplate(@Param('id') id: string, @Request() req) {
    return this.emailService.getEmailTemplateById(id, req.user.id);
  }

  @Post('templates')
  @ApiOperation({ summary: 'Create new email template' })
  @ApiResponse({ status: 201, description: 'Email template created successfully', schema: { $ref: getSchemaPath(EmailTemplate) } })
  @Roles(UserRole.AGENT, UserRole.ADMIN, UserRole.LANDLORD)
  async createEmailTemplate(@Body() templateData: Partial<EmailTemplate>, @Request() req) {
    return this.emailService.createEmailTemplate(templateData, req.user.id);
  }

  @Put('templates/:id')
  @ApiOperation({ summary: 'Update email template' })
  @ApiResponse({ status: 200, description: 'Email template updated successfully', schema: { $ref: getSchemaPath(EmailTemplate) } })
  @ApiParam({ name: 'id', type: 'string' })
  @Roles(UserRole.AGENT, UserRole.ADMIN, UserRole.LANDLORD)
  async updateEmailTemplate(
    @Param('id') id: string,
    @Body() templateData: Partial<EmailTemplate>,
    @Request() req,
  ) {
    return this.emailService.updateEmailTemplate(id, templateData, req.user.id);
  }

  @Delete('templates/:id')
  @ApiOperation({ summary: 'Delete email template' })
  @ApiResponse({ status: 200, description: 'Email template deleted successfully' })
  @ApiParam({ name: 'id', type: 'string' })
  @Roles(UserRole.AGENT, UserRole.ADMIN)
  async deleteEmailTemplate(@Param('id') id: string, @Request() req) {
    return this.emailService.deleteEmailTemplate(id, req.user.id);
  }

  @Post('templates/:id/preview')
  @ApiOperation({ summary: 'Preview email template' })
  @ApiResponse({ status: 200, description: 'Email template preview generated successfully' })
  @ApiParam({ name: 'id', type: 'string' })
  @Roles(UserRole.AGENT, UserRole.ADMIN, UserRole.LANDLORD)
  async previewEmailTemplate(
    @Param('id') id: string,
    @Body() previewData: { personalizeData?: any },
    @Request() req,
  ) {
    return this.emailService.previewEmailTemplate(id, previewData.personalizeData, req.user.id);
  }

  // Automation Rules
  @Get('automation-rules')
  @ApiOperation({ summary: 'Get automation rules' })
  @ApiResponse({ status: 200, description: 'Automation rules retrieved successfully' })
  @Roles(UserRole.AGENT, UserRole.ADMIN, UserRole.LANDLORD)
  async getAutomationRules(@Request() req) {
    return this.campaignService.getAutomationRules(req.user.id);
  }

  @Post('automation-rules')
  @ApiOperation({ summary: 'Create automation rule' })
  @ApiResponse({ status: 201, description: 'Automation rule created successfully' })
  @Roles(UserRole.AGENT, UserRole.ADMIN, UserRole.LANDLORD)
  async createAutomationRule(
    @Body() ruleData: {
      name: string;
      trigger: any;
      conditions: any[];
      actions: any[];
      isActive: boolean;
    },
    @Request() req,
  ) {
    return this.campaignService.createAutomationRule(ruleData, req.user.id);
  }

  // Bulk Operations
  @Post('bulk-email')
  @ApiOperation({ summary: 'Send bulk email' })
  @ApiResponse({ status: 200, description: 'Bulk email sent successfully' })
  @Roles(UserRole.AGENT, UserRole.ADMIN, UserRole.LANDLORD)
  async sendBulkEmail(
    @Body() bulkEmailData: {
      templateId: string;
      recipients: { email: string; personalizeData?: any }[];
      scheduleDate?: Date;
    },
    @Request() req,
  ) {
    return this.emailService.sendBulkEmail(bulkEmailData, req.user.id);
  }

  @Post('import-contacts')
  @ApiOperation({ summary: 'Import contacts for campaign' })
  @ApiResponse({ status: 200, description: 'Contacts imported successfully' })
  @Roles(UserRole.AGENT, UserRole.ADMIN, UserRole.LANDLORD)
  async importContacts(
    @Body() importData: {
      source: 'csv' | 'excel' | 'api';
      data: any[];
      mapping: Record<string, string>;
      campaignId?: string;
    },
    @Request() req,
  ) {
    return this.campaignService.importContacts(importData, req.user.id);
  }
}
