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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { GdprComplianceService } from './gdpr-compliance.service';
import {
  DataProcessingActivityDto,
  DataSubjectRequestDto,
  ConsentManagementDto,
  PrivacyImpactAssessmentDto,
  DataBreachReportDto,
  ComplianceAuditDto,
  DataRetentionPolicyDto,
  DataMappingDto,
  ConsentRecordDto,
  DataExportRequestDto,
  DataDeletionRequestDto,
  ComplianceReportDto,
  GdprQueryDto,
  DataProcessingActivityResponseDto,
  DataSubjectRequestResponseDto,
  ConsentManagementResponseDto,
  PrivacyImpactAssessmentResponseDto,
  DataBreachReportResponseDto,
  ComplianceAuditResponseDto,
  DataRetentionPolicyResponseDto,
  DataMappingResponseDto,
  ConsentRecordResponseDto,
  ComplianceReportResponseDto,
} from './dto/gdpr-compliance.dto';

@ApiTags('GDPR Compliance')
@Controller('admin/gdpr-compliance')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class GdprComplianceController {
  constructor(private readonly gdprComplianceService: GdprComplianceService) {}

  // Data Processing Activities
  @Get('data-processing-activities')
  @Roles('admin', 'compliance_officer')
  @ApiOperation({ summary: 'Get all data processing activities' })
  @ApiResponse({
    status: 200,
    description: 'Data processing activities retrieved successfully',
    type: [DataProcessingActivityResponseDto],
  })
  async getDataProcessingActivities(
    @Query() query: GdprQueryDto,
  ): Promise<DataProcessingActivityResponseDto[]> {
    return this.gdprComplianceService.getDataProcessingActivities(query);
  }

  @Post('data-processing-activities')
  @Roles('admin', 'compliance_officer')
  @ApiOperation({ summary: 'Create new data processing activity' })
  @ApiResponse({
    status: 201,
    description: 'Data processing activity created successfully',
    type: DataProcessingActivityResponseDto,
  })
  async createDataProcessingActivity(
    @Body() createDto: DataProcessingActivityDto,
  ): Promise<DataProcessingActivityResponseDto> {
    return this.gdprComplianceService.createDataProcessingActivity(createDto);
  }

  @Put('data-processing-activities/:id')
  @Roles('admin', 'compliance_officer')
  @ApiOperation({ summary: 'Update data processing activity' })
  @ApiResponse({
    status: 200,
    description: 'Data processing activity updated successfully',
    type: DataProcessingActivityResponseDto,
  })
  async updateDataProcessingActivity(
    @Param('id') id: string,
    @Body() updateDto: DataProcessingActivityDto,
  ): Promise<DataProcessingActivityResponseDto> {
    return this.gdprComplianceService.updateDataProcessingActivity(id, updateDto);
  }

  @Delete('data-processing-activities/:id')
  @Roles('admin', 'compliance_officer')
  @ApiOperation({ summary: 'Delete data processing activity' })
  @ApiResponse({ status: 204, description: 'Data processing activity deleted successfully' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteDataProcessingActivity(@Param('id') id: string): Promise<void> {
    return this.gdprComplianceService.deleteDataProcessingActivity(id);
  }

  // Data Subject Requests
  @Get('data-subject-requests')
  @Roles('admin', 'compliance_officer')
  @ApiOperation({ summary: 'Get all data subject requests' })
  @ApiResponse({
    status: 200,
    description: 'Data subject requests retrieved successfully',
    type: [DataSubjectRequestResponseDto],
  })
  async getDataSubjectRequests(
    @Query() query: GdprQueryDto,
  ): Promise<DataSubjectRequestResponseDto[]> {
    return this.gdprComplianceService.getDataSubjectRequests(query);
  }

  @Post('data-subject-requests')
  @Roles('admin', 'compliance_officer')
  @ApiOperation({ summary: 'Create new data subject request' })
  @ApiResponse({
    status: 201,
    description: 'Data subject request created successfully',
    type: DataSubjectRequestResponseDto,
  })
  async createDataSubjectRequest(
    @Body() createDto: DataSubjectRequestDto,
  ): Promise<DataSubjectRequestResponseDto> {
    return this.gdprComplianceService.createDataSubjectRequest(createDto);
  }

  @Put('data-subject-requests/:id/status')
  @Roles('admin', 'compliance_officer')
  @ApiOperation({ summary: 'Update data subject request status' })
  @ApiResponse({
    status: 200,
    description: 'Data subject request status updated successfully',
    type: DataSubjectRequestResponseDto,
  })
  async updateDataSubjectRequestStatus(
    @Param('id') id: string,
    @Body() statusUpdate: { status: string; notes?: string },
  ): Promise<DataSubjectRequestResponseDto> {
    return this.gdprComplianceService.updateDataSubjectRequestStatus(id, statusUpdate);
  }

  // Consent Management
  @Get('consent-management')
  @Roles('admin', 'compliance_officer')
  @ApiOperation({ summary: 'Get consent management overview' })
  @ApiResponse({
    status: 200,
    description: 'Consent management data retrieved successfully',
    type: ConsentManagementResponseDto,
  })
  async getConsentManagement(
    @Query() query: GdprQueryDto,
  ): Promise<ConsentManagementResponseDto> {
    return this.gdprComplianceService.getConsentManagement(query);
  }

  @Post('consent-management')
  @Roles('admin', 'compliance_officer')
  @ApiOperation({ summary: 'Create consent management configuration' })
  @ApiResponse({
    status: 201,
    description: 'Consent management configuration created successfully',
    type: ConsentManagementResponseDto,
  })
  async createConsentManagement(
    @Body() createDto: ConsentManagementDto,
  ): Promise<ConsentManagementResponseDto> {
    return this.gdprComplianceService.createConsentManagement(createDto);
  }

  @Get('consent-records')
  @Roles('admin', 'compliance_officer')
  @ApiOperation({ summary: 'Get consent records' })
  @ApiResponse({
    status: 200,
    description: 'Consent records retrieved successfully',
    type: [ConsentRecordResponseDto],
  })
  async getConsentRecords(
    @Query() query: GdprQueryDto,
  ): Promise<ConsentRecordResponseDto[]> {
    return this.gdprComplianceService.getConsentRecords(query);
  }

  // Privacy Impact Assessments
  @Get('privacy-impact-assessments')
  @Roles('admin', 'compliance_officer')
  @ApiOperation({ summary: 'Get all privacy impact assessments' })
  @ApiResponse({
    status: 200,
    description: 'Privacy impact assessments retrieved successfully',
    type: [PrivacyImpactAssessmentResponseDto],
  })
  async getPrivacyImpactAssessments(
    @Query() query: GdprQueryDto,
  ): Promise<PrivacyImpactAssessmentResponseDto[]> {
    return this.gdprComplianceService.getPrivacyImpactAssessments(query);
  }

  @Post('privacy-impact-assessments')
  @Roles('admin', 'compliance_officer')
  @ApiOperation({ summary: 'Create new privacy impact assessment' })
  @ApiResponse({
    status: 201,
    description: 'Privacy impact assessment created successfully',
    type: PrivacyImpactAssessmentResponseDto,
  })
  async createPrivacyImpactAssessment(
    @Body() createDto: PrivacyImpactAssessmentDto,
  ): Promise<PrivacyImpactAssessmentResponseDto> {
    return this.gdprComplianceService.createPrivacyImpactAssessment(createDto);
  }

  @Put('privacy-impact-assessments/:id')
  @Roles('admin', 'compliance_officer')
  @ApiOperation({ summary: 'Update privacy impact assessment' })
  @ApiResponse({
    status: 200,
    description: 'Privacy impact assessment updated successfully',
    type: PrivacyImpactAssessmentResponseDto,
  })
  async updatePrivacyImpactAssessment(
    @Param('id') id: string,
    @Body() updateDto: PrivacyImpactAssessmentDto,
  ): Promise<PrivacyImpactAssessmentResponseDto> {
    return this.gdprComplianceService.updatePrivacyImpactAssessment(id, updateDto);
  }

  // Data Breach Reports
  @Get('data-breach-reports')
  @Roles('admin', 'compliance_officer')
  @ApiOperation({ summary: 'Get all data breach reports' })
  @ApiResponse({
    status: 200,
    description: 'Data breach reports retrieved successfully',
    type: [DataBreachReportResponseDto],
  })
  async getDataBreachReports(
    @Query() query: GdprQueryDto,
  ): Promise<DataBreachReportResponseDto[]> {
    return this.gdprComplianceService.getDataBreachReports(query);
  }

  @Post('data-breach-reports')
  @Roles('admin', 'compliance_officer')
  @ApiOperation({ summary: 'Create new data breach report' })
  @ApiResponse({
    status: 201,
    description: 'Data breach report created successfully',
    type: DataBreachReportResponseDto,
  })
  async createDataBreachReport(
    @Body() createDto: DataBreachReportDto,
  ): Promise<DataBreachReportResponseDto> {
    return this.gdprComplianceService.createDataBreachReport(createDto);
  }

  @Put('data-breach-reports/:id')
  @Roles('admin', 'compliance_officer')
  @ApiOperation({ summary: 'Update data breach report' })
  @ApiResponse({
    status: 200,
    description: 'Data breach report updated successfully',
    type: DataBreachReportResponseDto,
  })
  async updateDataBreachReport(
    @Param('id') id: string,
    @Body() updateDto: DataBreachReportDto,
  ): Promise<DataBreachReportResponseDto> {
    return this.gdprComplianceService.updateDataBreachReport(id, updateDto);
  }

  // Compliance Audits
  @Get('compliance-audits')
  @Roles('admin', 'compliance_officer')
  @ApiOperation({ summary: 'Get all compliance audits' })
  @ApiResponse({
    status: 200,
    description: 'Compliance audits retrieved successfully',
    type: [ComplianceAuditResponseDto],
  })
  async getComplianceAudits(
    @Query() query: GdprQueryDto,
  ): Promise<ComplianceAuditResponseDto[]> {
    return this.gdprComplianceService.getComplianceAudits(query);
  }

  @Post('compliance-audits')
  @Roles('admin', 'compliance_officer')
  @ApiOperation({ summary: 'Create new compliance audit' })
  @ApiResponse({
    status: 201,
    description: 'Compliance audit created successfully',
    type: ComplianceAuditResponseDto,
  })
  async createComplianceAudit(
    @Body() createDto: ComplianceAuditDto,
  ): Promise<ComplianceAuditResponseDto> {
    return this.gdprComplianceService.createComplianceAudit(createDto);
  }

  // Data Retention Policies
  @Get('data-retention-policies')
  @Roles('admin', 'compliance_officer')
  @ApiOperation({ summary: 'Get all data retention policies' })
  @ApiResponse({
    status: 200,
    description: 'Data retention policies retrieved successfully',
    type: [DataRetentionPolicyResponseDto],
  })
  async getDataRetentionPolicies(
    @Query() query: GdprQueryDto,
  ): Promise<DataRetentionPolicyResponseDto[]> {
    return this.gdprComplianceService.getDataRetentionPolicies(query);
  }

  @Post('data-retention-policies')
  @Roles('admin', 'compliance_officer')
  @ApiOperation({ summary: 'Create new data retention policy' })
  @ApiResponse({
    status: 201,
    description: 'Data retention policy created successfully',
    type: DataRetentionPolicyResponseDto,
  })
  async createDataRetentionPolicy(
    @Body() createDto: DataRetentionPolicyDto,
  ): Promise<DataRetentionPolicyResponseDto> {
    return this.gdprComplianceService.createDataRetentionPolicy(createDto);
  }

  // Data Mapping
  @Get('data-mapping')
  @Roles('admin', 'compliance_officer')
  @ApiOperation({ summary: 'Get data mapping overview' })
  @ApiResponse({
    status: 200,
    description: 'Data mapping retrieved successfully',
    type: [DataMappingResponseDto],
  })
  async getDataMapping(
    @Query() query: GdprQueryDto,
  ): Promise<DataMappingResponseDto[]> {
    return this.gdprComplianceService.getDataMapping(query);
  }

  @Post('data-mapping')
  @Roles('admin', 'compliance_officer')
  @ApiOperation({ summary: 'Create data mapping entry' })
  @ApiResponse({
    status: 201,
    description: 'Data mapping entry created successfully',
    type: DataMappingResponseDto,
  })
  async createDataMapping(
    @Body() createDto: DataMappingDto,
  ): Promise<DataMappingResponseDto> {
    return this.gdprComplianceService.createDataMapping(createDto);
  }

  // Data Export Requests
  @Post('data-export-requests')
  @Roles('admin', 'compliance_officer')
  @ApiOperation({ summary: 'Process data export request' })
  @ApiResponse({
    status: 200,
    description: 'Data export request processed successfully',
  })
  async processDataExportRequest(
    @Body() exportRequest: DataExportRequestDto,
  ): Promise<{ downloadUrl: string; expiresAt: Date }> {
    return this.gdprComplianceService.processDataExportRequest(exportRequest);
  }

  // Data Deletion Requests
  @Post('data-deletion-requests')
  @Roles('admin', 'compliance_officer')
  @ApiOperation({ summary: 'Process data deletion request' })
  @ApiResponse({
    status: 200,
    description: 'Data deletion request processed successfully',
  })
  async processDataDeletionRequest(
    @Body() deletionRequest: DataDeletionRequestDto,
  ): Promise<{ deletedRecords: number; affectedSystems: string[] }> {
    return this.gdprComplianceService.processDataDeletionRequest(deletionRequest);
  }

  // Compliance Reports
  @Get('compliance-reports')
  @Roles('admin', 'compliance_officer')
  @ApiOperation({ summary: 'Get compliance reports' })
  @ApiResponse({
    status: 200,
    description: 'Compliance reports retrieved successfully',
    type: [ComplianceReportResponseDto],
  })
  async getComplianceReports(
    @Query() query: GdprQueryDto,
  ): Promise<ComplianceReportResponseDto[]> {
    return this.gdprComplianceService.getComplianceReports(query);
  }

  @Post('compliance-reports')
  @Roles('admin', 'compliance_officer')
  @ApiOperation({ summary: 'Generate compliance report' })
  @ApiResponse({
    status: 201,
    description: 'Compliance report generated successfully',
    type: ComplianceReportResponseDto,
  })
  async generateComplianceReport(
    @Body() reportDto: ComplianceReportDto,
  ): Promise<ComplianceReportResponseDto> {
    return this.gdprComplianceService.generateComplianceReport(reportDto);
  }

  // Dashboard and Statistics
  @Get('dashboard')
  @Roles('admin', 'compliance_officer')
  @ApiOperation({ summary: 'Get GDPR compliance dashboard data' })
  @ApiResponse({
    status: 200,
    description: 'GDPR compliance dashboard data retrieved successfully',
  })
  async getComplianceDashboard(): Promise<{
    totalDataSubjects: number;
    activeConsents: number;
    pendingRequests: number;
    completedAudits: number;
    dataBreaches: number;
    complianceScore: number;
    recentActivities: any[];
  }> {
    return this.gdprComplianceService.getComplianceDashboard();
  }

  @Get('compliance-status')
  @Roles('admin', 'compliance_officer')
  @ApiOperation({ summary: 'Get overall compliance status' })
  @ApiResponse({
    status: 200,
    description: 'Compliance status retrieved successfully',
  })
  async getComplianceStatus(): Promise<{
    overallScore: number;
    categories: {
      dataProcessing: number;
      consentManagement: number;
      dataSubjectRights: number;
      securityMeasures: number;
      documentation: number;
    };
    recommendations: string[];
    lastAuditDate: Date;
    nextAuditDue: Date;
  }> {
    return this.gdprComplianceService.getComplianceStatus();
  }
}