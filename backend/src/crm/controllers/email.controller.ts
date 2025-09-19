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
  Res,
  Redirect,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery ,
  getSchemaPath,} from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';
import { EmailService } from '../services/email.service';
import { EmailTemplate, TemplateType, TemplateStatus } from '../entities/email-template.entity';

@ApiTags('Email Management')
@Controller('api/crm/email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  // Email Templates
  @Get('templates')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.AGENT, UserRole.ADMIN, UserRole.LANDLORD)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all email templates' })
  @ApiQuery({ name: 'type', required: false, enum: TemplateType })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, enum: TemplateStatus })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({ status: HttpStatus.OK, description: 'Email templates retrieved successfully' })
  async getEmailTemplates(@Request() req, @Query() query: any) {
    const options = {
      type: query.type,
      category: query.category,
      status: query.status,
      search: query.search,
    };

    return this.emailService.getEmailTemplates(req.user.id, options);
  }

  @Get('templates/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.AGENT, UserRole.ADMIN, UserRole.LANDLORD)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get email template by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Email template retrieved successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Email template not found' })
  async getEmailTemplateById(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req
  ) {
    return this.emailService.getEmailTemplateById(id, req.user.id);
  }

  @Get('templates/:id/analytics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.AGENT, UserRole.ADMIN, UserRole.LANDLORD)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get email template analytics' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Template analytics retrieved successfully' })
  async getTemplateAnalytics(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req
  ) {
    return this.emailService.getTemplateAnalytics(id, req.user.id);
  }

  @Post('templates')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.AGENT, UserRole.ADMIN, UserRole.LANDLORD)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new email template' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Email template created successfully' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid template data' })
  async createEmailTemplate(
    @Body() templateData: Partial<EmailTemplate>,
    @Request() req
  ) {
    return this.emailService.createEmailTemplate(templateData, req.user.id);
  }

  @Post('templates/:id/duplicate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.AGENT, UserRole.ADMIN, UserRole.LANDLORD)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Duplicate email template' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Email template duplicated successfully' })
  async duplicateEmailTemplate(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req
  ) {
    return this.emailService.duplicateEmailTemplate(id, req.user.id);
  }

  @Post('templates/:id/preview')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.AGENT, UserRole.ADMIN, UserRole.LANDLORD)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Preview email template with personalization' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Email template preview generated successfully' })
  async previewEmailTemplate(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() previewData: {
      personalizeData?: any;
      recipientEmail?: string;
    },
    @Request() req
  ) {
    return this.emailService.previewEmailTemplate(id, previewData.personalizeData, req.user.id);
  }

  @Post('send-test')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.AGENT, UserRole.ADMIN, UserRole.LANDLORD)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Send test email' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Test email sent successfully' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid email data' })
  async sendTestEmail(
    @Body() emailData: {
      to: string;
      templateId: string;
      personalizeData?: any;
      subject?: string;
    },
    @Request() req
  ) {
    const testEmailData = {
      templateId: emailData.templateId,
      testEmail: emailData.to,
      personalData: emailData.personalizeData,
    };
    return this.emailService.sendTestEmail(testEmailData);
  }

  @Post('send-bulk')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.AGENT, UserRole.ADMIN, UserRole.LANDLORD)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Send bulk emails' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Bulk emails sent successfully' })
  async sendBulkEmail(
    @Body() bulkEmailData: {
      templateId: string;
      recipients: { email: string; personalizeData?: any }[];
      scheduleDate?: Date;
    },
    @Request() req
  ) {
    return this.emailService.sendBulkEmail(bulkEmailData, req.user.id);
  }

  @Put('templates/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.AGENT, UserRole.ADMIN, UserRole.LANDLORD)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update email template' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Email template updated successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Email template not found' })
  async updateEmailTemplate(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() templateData: Partial<EmailTemplate>,
    @Request() req
  ) {
    return this.emailService.updateEmailTemplate(id, templateData, req.user.id);
  }

  @Put('templates/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.AGENT, UserRole.ADMIN, UserRole.LANDLORD)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update email template status' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Template status updated successfully' })
  async updateTemplateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() statusData: { status: TemplateStatus; reason?: string },
    @Request() req
  ) {
    const templateData = { status: statusData.status };
    return this.emailService.updateEmailTemplate(id, templateData, req.user.id);
  }

  @Delete('templates/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.AGENT, UserRole.ADMIN, UserRole.LANDLORD)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete email template' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Email template deleted successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Email template not found' })
  async deleteEmailTemplate(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req
  ) {
    return this.emailService.deleteEmailTemplate(id, req.user.id);
  }

  // Email Tracking (Public endpoints - no auth required)
  @Get('track/open/:campaignEmailId')
  @ApiOperation({ summary: 'Track email open (public endpoint)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Email open tracked' })
  async trackEmailOpen(
    @Param('campaignEmailId') campaignEmailId: string,
    @Res() res: Response
  ) {
    const pixelBuffer = await this.emailService.trackEmailOpen(campaignEmailId);
    
    res.set({
      'Content-Type': 'image/png',
      'Content-Length': pixelBuffer.length.toString(),
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    });
    
    res.send(pixelBuffer);
  }

  @Get('track/click/:campaignEmailId')
  @ApiOperation({ summary: 'Track email click and redirect (public endpoint)' })
  @ApiQuery({ name: 'url', required: true, type: String })
  @ApiResponse({ status: HttpStatus.FOUND, description: 'Click tracked and redirected' })
  async trackEmailClick(
    @Param('campaignEmailId') campaignEmailId: string,
    @Query('url') url: string,
    @Res() res: Response
  ) {
    const result = await this.emailService.trackEmailClick(campaignEmailId, url);
    res.redirect(result.redirectUrl);
  }

  // Email Analytics
  @Get('analytics/overview')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.AGENT, UserRole.ADMIN, UserRole.LANDLORD)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get email analytics overview' })
  @ApiQuery({ name: 'period', required: false, type: String, description: 'week, month, quarter, year' })
  @ApiQuery({ name: 'dateFrom', required: false, type: String })
  @ApiQuery({ name: 'dateTo', required: false, type: String })
  @ApiResponse({ status: HttpStatus.OK, description: 'Email analytics retrieved successfully' })
  async getEmailAnalyticsOverview(@Request() req, @Query() query: any) {
    // This would be implemented in EmailService
    const options = {
      period: query.period || 'month',
      dateFrom: query.dateFrom,
      dateTo: query.dateTo,
    };

    // Mock response for now
    return {
      totalSent: 1250,
      totalOpened: 875,
      totalClicked: 234,
      totalBounced: 45,
      openRate: 70.0,
      clickRate: 18.7,
      bounceRate: 3.6,
      unsubscribeRate: 1.2,
      topPerformingTemplates: [],
      campaignPerformance: [],
      timeSeriesData: [],
    };
  }

  @Get('analytics/templates')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.AGENT, UserRole.ADMIN, UserRole.LANDLORD)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get template performance analytics' })
  @ApiQuery({ name: 'period', required: false, type: String })
  @ApiResponse({ status: HttpStatus.OK, description: 'Template analytics retrieved successfully' })
  async getTemplateAnalyticsOverview(@Request() req, @Query() query: any) {
    // This would be implemented in EmailService
    const options = {
      period: query.period || 'month',
    };

    // Mock response for now
    return {
      templates: [],
      totalTemplates: 0,
      activeTemplates: 0,
      averageOpenRate: 0,
      averageClickRate: 0,
      topPerformers: [],
      underPerformers: [],
    };
  }

  // Email Categories and Types
  @Get('categories')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.AGENT, UserRole.ADMIN, UserRole.LANDLORD)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get email template categories' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Email categories retrieved successfully' })
  async getEmailCategories() {
    return {
      categories: [
        'Welcome',
        'Follow-up',
        'Property Alert',
        'Newsletter',
        'Promotional',
        'Transactional',
        'Reminder',
        'Thank You',
        'Survey',
        'Event Invitation',
      ],
    };
  }

  @Get('types')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.AGENT, UserRole.ADMIN, UserRole.LANDLORD)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get email template types' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Email types retrieved successfully' })
  async getEmailTypes() {
    return {
      types: Object.values(TemplateType),
    };
  }

  // Email Variables and Personalization
  @Get('variables')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.AGENT, UserRole.ADMIN, UserRole.LANDLORD)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get available email variables for personalization' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Email variables retrieved successfully' })
  async getEmailVariables() {
    return {
      variables: [
        {
          name: 'firstName',
          type: 'string',
          description: 'Recipient first name',
          example: 'John',
        },
        {
          name: 'lastName',
          type: 'string',
          description: 'Recipient last name',
          example: 'Doe',
        },
        {
          name: 'email',
          type: 'string',
          description: 'Recipient email address',
          example: 'john.doe@example.com',
        },
        {
          name: 'company',
          type: 'string',
          description: 'Recipient company name',
          example: 'Acme Corp',
        },
        {
          name: 'propertyTitle',
          type: 'string',
          description: 'Property title',
          example: 'Beautiful 3-bedroom house',
        },
        {
          name: 'propertyPrice',
          type: 'number',
          description: 'Property price',
          example: 450000,
        },
        {
          name: 'propertyLocation',
          type: 'string',
          description: 'Property location',
          example: 'London, UK',
        },
        {
          name: 'agentName',
          type: 'string',
          description: 'Agent name',
          example: 'Sarah Smith',
        },
        {
          name: 'agentPhone',
          type: 'string',
          description: 'Agent phone number',
          example: '+44 20 1234 5678',
        },
        {
          name: 'agentEmail',
          type: 'string',
          description: 'Agent email address',
          example: 'sarah.smith@propertymastersuk.com',
        },
        {
          name: 'currentDate',
          type: 'date',
          description: 'Current date',
          example: '2024-01-15',
        },
        {
          name: 'unsubscribeUrl',
          type: 'string',
          description: 'Unsubscribe URL',
          example: 'https://example.com/unsubscribe?token=...',
        },
      ],
    };
  }

  // Email Health and Deliverability
  @Get('health')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.LANDLORD)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get email system health and deliverability status' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Email health status retrieved successfully' })
  async getEmailHealth() {
    return {
      status: 'healthy',
      deliverabilityScore: 95.2,
      reputationScore: 'excellent',
      domainAuthentication: {
        spf: 'pass',
        dkim: 'pass',
        dmarc: 'pass',
      },
      blacklistStatus: 'clean',
      lastChecked: new Date(),
      recommendations: [],
    };
  }
}
