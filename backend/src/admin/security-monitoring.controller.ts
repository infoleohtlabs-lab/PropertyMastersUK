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
  HttpException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth ,
  getSchemaPath,} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { SecurityMonitoringService } from './security-monitoring.service';
import {
  SecurityThreatDto,
  SecurityThreatResponseDto,
  AccessLogDto,
  AccessLogResponseDto,
  VulnerabilityDto,
  VulnerabilityResponseDto,
  SecurityAlertDto,
  SecurityAlertResponseDto,
  SecurityAuditDto,
  SecurityAuditResponseDto,
  SecurityConfigDto,
  SecurityConfigResponseDto,
  SecurityIncidentDto,
  SecurityIncidentResponseDto,
  SecurityPolicyDto,
  SecurityPolicyResponseDto,
  SecurityScanDto,
  SecurityScanResponseDto,
  SecurityQueryDto,
  SecurityDashboardResponseDto,
  SecurityMetricsResponseDto,
  SecurityComplianceResponseDto,
} from './dto/security-monitoring.dto';

@ApiTags('Security Monitoring')
@Controller('admin/security')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SecurityMonitoringController {
  constructor(private readonly securityService: SecurityMonitoringService) {}

  // Security Dashboard
  @Get('dashboard')
  @Roles('admin', 'security_admin')
  @ApiOperation({ summary: 'Get security dashboard overview' })
  @ApiResponse({
    status: 200,
    description: 'Security dashboard data retrieved successfully',
    type: SecurityDashboardResponseDto,
  })
  async getSecurityDashboard(): Promise<SecurityDashboardResponseDto> {
    try {
      return await this.securityService.getSecurityDashboard();
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve security dashboard',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Security Metrics
  @Get('metrics')
  @Roles('admin', 'security_admin')
  @ApiOperation({ summary: 'Get security metrics and statistics' })
  @ApiResponse({
    status: 200,
    description: 'Security metrics retrieved successfully',
    type: SecurityMetricsResponseDto,
  })
  async getSecurityMetrics(@Query() query: SecurityQueryDto): Promise<SecurityMetricsResponseDto> {
    try {
      return await this.securityService.getSecurityMetrics(query);
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve security metrics',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Threat Detection
  @Get('threats')
  @Roles('admin', 'security_admin')
  @ApiOperation({ summary: 'Get security threats' })
  @ApiResponse({
    status: 200,
    description: 'Security threats retrieved successfully',
    type: [SecurityThreatResponseDto],
  })
  async getSecurityThreats(@Query() query: SecurityQueryDto): Promise<SecurityThreatResponseDto[]> {
    try {
      return await this.securityService.getSecurityThreats(query);
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve security threats',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('threats')
  @Roles('admin', 'security_admin')
  @ApiOperation({ summary: 'Create security threat record' })
  @ApiResponse({
    status: 201,
    description: 'Security threat created successfully',
    type: SecurityThreatResponseDto,
  })
  async createSecurityThreat(@Body() threatDto: SecurityThreatDto): Promise<SecurityThreatResponseDto> {
    try {
      return await this.securityService.createSecurityThreat(threatDto);
    } catch (error) {
      throw new HttpException(
        'Failed to create security threat',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('threats/:id')
  @Roles('admin', 'security_admin')
  @ApiOperation({ summary: 'Get security threat by ID' })
  @ApiResponse({
    status: 200,
    description: 'Security threat retrieved successfully',
    type: SecurityThreatResponseDto,
  })
  async getSecurityThreatById(@Param('id') id: string): Promise<SecurityThreatResponseDto> {
    try {
      return await this.securityService.getSecurityThreatById(id);
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve security threat',
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Put('threats/:id')
  @Roles('admin', 'security_admin')
  @ApiOperation({ summary: 'Update security threat' })
  @ApiResponse({
    status: 200,
    description: 'Security threat updated successfully',
    type: SecurityThreatResponseDto,
  })
  async updateSecurityThreat(
    @Param('id') id: string,
    @Body() threatDto: SecurityThreatDto,
  ): Promise<SecurityThreatResponseDto> {
    try {
      return await this.securityService.updateSecurityThreat(id, threatDto);
    } catch (error) {
      throw new HttpException(
        'Failed to update security threat',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('threats/:id')
  @Roles('admin', 'security_admin')
  @ApiOperation({ summary: 'Delete security threat' })
  @ApiResponse({
    status: 200,
    description: 'Security threat deleted successfully',
  })
  async deleteSecurityThreat(@Param('id') id: string): Promise<{ message: string }> {
    try {
      await this.securityService.deleteSecurityThreat(id);
      return { message: 'Security threat deleted successfully' };
    } catch (error) {
      throw new HttpException(
        'Failed to delete security threat',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Access Monitoring
  @Get('access-logs')
  @Roles('admin', 'security_admin')
  @ApiOperation({ summary: 'Get access logs' })
  @ApiResponse({
    status: 200,
    description: 'Access logs retrieved successfully',
    type: [AccessLogResponseDto],
  })
  async getAccessLogs(@Query() query: SecurityQueryDto): Promise<AccessLogResponseDto[]> {
    try {
      return await this.securityService.getAccessLogs(query);
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve access logs',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('access-logs')
  @Roles('admin', 'security_admin')
  @ApiOperation({ summary: 'Create access log entry' })
  @ApiResponse({
    status: 201,
    description: 'Access log created successfully',
    type: AccessLogResponseDto,
  })
  async createAccessLog(@Body() accessLogDto: AccessLogDto): Promise<AccessLogResponseDto> {
    try {
      return await this.securityService.createAccessLog(accessLogDto);
    } catch (error) {
      throw new HttpException(
        'Failed to create access log',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Vulnerability Management
  @Get('vulnerabilities')
  @Roles('admin', 'security_admin')
  @ApiOperation({ summary: 'Get vulnerabilities' })
  @ApiResponse({
    status: 200,
    description: 'Vulnerabilities retrieved successfully',
    type: [VulnerabilityResponseDto],
  })
  async getVulnerabilities(@Query() query: SecurityQueryDto): Promise<VulnerabilityResponseDto[]> {
    try {
      return await this.securityService.getVulnerabilities(query);
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve vulnerabilities',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('vulnerabilities')
  @Roles('admin', 'security_admin')
  @ApiOperation({ summary: 'Create vulnerability record' })
  @ApiResponse({
    status: 201,
    description: 'Vulnerability created successfully',
    type: VulnerabilityResponseDto,
  })
  async createVulnerability(@Body() vulnerabilityDto: VulnerabilityDto): Promise<VulnerabilityResponseDto> {
    try {
      return await this.securityService.createVulnerability(vulnerabilityDto);
    } catch (error) {
      throw new HttpException(
        'Failed to create vulnerability',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('vulnerabilities/:id')
  @Roles('admin', 'security_admin')
  @ApiOperation({ summary: 'Get vulnerability by ID' })
  @ApiResponse({
    status: 200,
    description: 'Vulnerability retrieved successfully',
    type: VulnerabilityResponseDto,
  })
  async getVulnerabilityById(@Param('id') id: string): Promise<VulnerabilityResponseDto> {
    try {
      return await this.securityService.getVulnerabilityById(id);
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve vulnerability',
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Put('vulnerabilities/:id')
  @Roles('admin', 'security_admin')
  @ApiOperation({ summary: 'Update vulnerability' })
  @ApiResponse({
    status: 200,
    description: 'Vulnerability updated successfully',
    type: VulnerabilityResponseDto,
  })
  async updateVulnerability(
    @Param('id') id: string,
    @Body() vulnerabilityDto: VulnerabilityDto,
  ): Promise<VulnerabilityResponseDto> {
    try {
      return await this.securityService.updateVulnerability(id, vulnerabilityDto);
    } catch (error) {
      throw new HttpException(
        'Failed to update vulnerability',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('vulnerabilities/:id')
  @Roles('admin', 'security_admin')
  @ApiOperation({ summary: 'Delete vulnerability' })
  @ApiResponse({
    status: 200,
    description: 'Vulnerability deleted successfully',
  })
  async deleteVulnerability(@Param('id') id: string): Promise<{ message: string }> {
    try {
      await this.securityService.deleteVulnerability(id);
      return { message: 'Vulnerability deleted successfully' };
    } catch (error) {
      throw new HttpException(
        'Failed to delete vulnerability',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Security Alerts
  @Get('alerts')
  @Roles('admin', 'security_admin')
  @ApiOperation({ summary: 'Get security alerts' })
  @ApiResponse({
    status: 200,
    description: 'Security alerts retrieved successfully',
    type: [SecurityAlertResponseDto],
  })
  async getSecurityAlerts(@Query() query: SecurityQueryDto): Promise<SecurityAlertResponseDto[]> {
    try {
      return await this.securityService.getSecurityAlerts(query);
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve security alerts',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('alerts')
  @Roles('admin', 'security_admin')
  @ApiOperation({ summary: 'Create security alert' })
  @ApiResponse({
    status: 201,
    description: 'Security alert created successfully',
    type: SecurityAlertResponseDto,
  })
  async createSecurityAlert(@Body() alertDto: SecurityAlertDto): Promise<SecurityAlertResponseDto> {
    try {
      return await this.securityService.createSecurityAlert(alertDto);
    } catch (error) {
      throw new HttpException(
        'Failed to create security alert',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put('alerts/:id/acknowledge')
  @Roles('admin', 'security_admin')
  @ApiOperation({ summary: 'Acknowledge security alert' })
  @ApiResponse({
    status: 200,
    description: 'Security alert acknowledged successfully',
    type: SecurityAlertResponseDto,
  })
  async acknowledgeSecurityAlert(@Param('id') id: string): Promise<SecurityAlertResponseDto> {
    try {
      return await this.securityService.acknowledgeSecurityAlert(id);
    } catch (error) {
      throw new HttpException(
        'Failed to acknowledge security alert',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put('alerts/:id/resolve')
  @Roles('admin', 'security_admin')
  @ApiOperation({ summary: 'Resolve security alert' })
  @ApiResponse({
    status: 200,
    description: 'Security alert resolved successfully',
    type: SecurityAlertResponseDto,
  })
  async resolveSecurityAlert(@Param('id') id: string): Promise<SecurityAlertResponseDto> {
    try {
      return await this.securityService.resolveSecurityAlert(id);
    } catch (error) {
      throw new HttpException(
        'Failed to resolve security alert',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Security Audits
  @Get('audits')
  @Roles('admin', 'security_admin')
  @ApiOperation({ summary: 'Get security audits' })
  @ApiResponse({
    status: 200,
    description: 'Security audits retrieved successfully',
    type: [SecurityAuditResponseDto],
  })
  async getSecurityAudits(@Query() query: SecurityQueryDto): Promise<SecurityAuditResponseDto[]> {
    try {
      return await this.securityService.getSecurityAudits(query);
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve security audits',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('audits')
  @Roles('admin', 'security_admin')
  @ApiOperation({ summary: 'Create security audit' })
  @ApiResponse({
    status: 201,
    description: 'Security audit created successfully',
    type: SecurityAuditResponseDto,
  })
  async createSecurityAudit(@Body() auditDto: SecurityAuditDto): Promise<SecurityAuditResponseDto> {
    try {
      return await this.securityService.createSecurityAudit(auditDto);
    } catch (error) {
      throw new HttpException(
        'Failed to create security audit',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('audits/:id')
  @Roles('admin', 'security_admin')
  @ApiOperation({ summary: 'Get security audit by ID' })
  @ApiResponse({
    status: 200,
    description: 'Security audit retrieved successfully',
    type: SecurityAuditResponseDto,
  })
  async getSecurityAuditById(@Param('id') id: string): Promise<SecurityAuditResponseDto> {
    try {
      return await this.securityService.getSecurityAuditById(id);
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve security audit',
        HttpStatus.NOT_FOUND,
      );
    }
  }

  // Security Incidents
  @Get('incidents')
  @Roles('admin', 'security_admin')
  @ApiOperation({ summary: 'Get security incidents' })
  @ApiResponse({
    status: 200,
    description: 'Security incidents retrieved successfully',
    type: [SecurityIncidentResponseDto],
  })
  async getSecurityIncidents(@Query() query: SecurityQueryDto): Promise<SecurityIncidentResponseDto[]> {
    try {
      return await this.securityService.getSecurityIncidents(query);
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve security incidents',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('incidents')
  @Roles('admin', 'security_admin')
  @ApiOperation({ summary: 'Create security incident' })
  @ApiResponse({
    status: 201,
    description: 'Security incident created successfully',
    type: SecurityIncidentResponseDto,
  })
  async createSecurityIncident(@Body() incidentDto: SecurityIncidentDto): Promise<SecurityIncidentResponseDto> {
    try {
      return await this.securityService.createSecurityIncident(incidentDto);
    } catch (error) {
      throw new HttpException(
        'Failed to create security incident',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('incidents/:id')
  @Roles('admin', 'security_admin')
  @ApiOperation({ summary: 'Get security incident by ID' })
  @ApiResponse({
    status: 200,
    description: 'Security incident retrieved successfully',
    type: SecurityIncidentResponseDto,
  })
  async getSecurityIncidentById(@Param('id') id: string): Promise<SecurityIncidentResponseDto> {
    try {
      return await this.securityService.getSecurityIncidentById(id);
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve security incident',
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Put('incidents/:id')
  @Roles('admin', 'security_admin')
  @ApiOperation({ summary: 'Update security incident' })
  @ApiResponse({
    status: 200,
    description: 'Security incident updated successfully',
    type: SecurityIncidentResponseDto,
  })
  async updateSecurityIncident(
    @Param('id') id: string,
    @Body() incidentDto: SecurityIncidentDto,
  ): Promise<SecurityIncidentResponseDto> {
    try {
      return await this.securityService.updateSecurityIncident(id, incidentDto);
    } catch (error) {
      throw new HttpException(
        'Failed to update security incident',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Security Policies
  @Get('policies')
  @Roles('admin', 'security_admin')
  @ApiOperation({ summary: 'Get security policies' })
  @ApiResponse({
    status: 200,
    description: 'Security policies retrieved successfully',
    type: [SecurityPolicyResponseDto],
  })
  async getSecurityPolicies(@Query() query: SecurityQueryDto): Promise<SecurityPolicyResponseDto[]> {
    try {
      return await this.securityService.getSecurityPolicies(query);
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve security policies',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('policies')
  @Roles('admin', 'security_admin')
  @ApiOperation({ summary: 'Create security policy' })
  @ApiResponse({
    status: 201,
    description: 'Security policy created successfully',
    type: SecurityPolicyResponseDto,
  })
  async createSecurityPolicy(@Body() policyDto: SecurityPolicyDto): Promise<SecurityPolicyResponseDto> {
    try {
      return await this.securityService.createSecurityPolicy(policyDto);
    } catch (error) {
      throw new HttpException(
        'Failed to create security policy',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('policies/:id')
  @Roles('admin', 'security_admin')
  @ApiOperation({ summary: 'Get security policy by ID' })
  @ApiResponse({
    status: 200,
    description: 'Security policy retrieved successfully',
    type: SecurityPolicyResponseDto,
  })
  async getSecurityPolicyById(@Param('id') id: string): Promise<SecurityPolicyResponseDto> {
    try {
      return await this.securityService.getSecurityPolicyById(id);
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve security policy',
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Put('policies/:id')
  @Roles('admin', 'security_admin')
  @ApiOperation({ summary: 'Update security policy' })
  @ApiResponse({
    status: 200,
    description: 'Security policy updated successfully',
    type: SecurityPolicyResponseDto,
  })
  async updateSecurityPolicy(
    @Param('id') id: string,
    @Body() policyDto: SecurityPolicyDto,
  ): Promise<SecurityPolicyResponseDto> {
    try {
      return await this.securityService.updateSecurityPolicy(id, policyDto);
    } catch (error) {
      throw new HttpException(
        'Failed to update security policy',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('policies/:id')
  @Roles('admin', 'security_admin')
  @ApiOperation({ summary: 'Delete security policy' })
  @ApiResponse({
    status: 200,
    description: 'Security policy deleted successfully',
  })
  async deleteSecurityPolicy(@Param('id') id: string): Promise<{ message: string }> {
    try {
      await this.securityService.deleteSecurityPolicy(id);
      return { message: 'Security policy deleted successfully' };
    } catch (error) {
      throw new HttpException(
        'Failed to delete security policy',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Security Scans
  @Get('scans')
  @Roles('admin', 'security_admin')
  @ApiOperation({ summary: 'Get security scans' })
  @ApiResponse({
    status: 200,
    description: 'Security scans retrieved successfully',
    type: [SecurityScanResponseDto],
  })
  async getSecurityScans(@Query() query: SecurityQueryDto): Promise<SecurityScanResponseDto[]> {
    try {
      return await this.securityService.getSecurityScans(query);
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve security scans',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('scans')
  @Roles('admin', 'security_admin')
  @ApiOperation({ summary: 'Start security scan' })
  @ApiResponse({
    status: 201,
    description: 'Security scan started successfully',
    type: SecurityScanResponseDto,
  })
  async startSecurityScan(@Body() scanDto: SecurityScanDto): Promise<SecurityScanResponseDto> {
    try {
      return await this.securityService.startSecurityScan(scanDto);
    } catch (error) {
      throw new HttpException(
        'Failed to start security scan',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('scans/:id')
  @Roles('admin', 'security_admin')
  @ApiOperation({ summary: 'Get security scan by ID' })
  @ApiResponse({
    status: 200,
    description: 'Security scan retrieved successfully',
    type: SecurityScanResponseDto,
  })
  async getSecurityScanById(@Param('id') id: string): Promise<SecurityScanResponseDto> {
    try {
      return await this.securityService.getSecurityScanById(id);
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve security scan',
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Put('scans/:id/stop')
  @Roles('admin', 'security_admin')
  @ApiOperation({ summary: 'Stop security scan' })
  @ApiResponse({
    status: 200,
    description: 'Security scan stopped successfully',
    type: SecurityScanResponseDto,
  })
  async stopSecurityScan(@Param('id') id: string): Promise<SecurityScanResponseDto> {
    try {
      return await this.securityService.stopSecurityScan(id);
    } catch (error) {
      throw new HttpException(
        'Failed to stop security scan',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Security Configuration
  @Get('config')
  @Roles('admin', 'security_admin')
  @ApiOperation({ summary: 'Get security configuration' })
  @ApiResponse({
    status: 200,
    description: 'Security configuration retrieved successfully',
    type: SecurityConfigResponseDto,
  })
  async getSecurityConfig(): Promise<SecurityConfigResponseDto> {
    try {
      return await this.securityService.getSecurityConfig();
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve security configuration',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put('config')
  @Roles('admin', 'security_admin')
  @ApiOperation({ summary: 'Update security configuration' })
  @ApiResponse({
    status: 200,
    description: 'Security configuration updated successfully',
    type: SecurityConfigResponseDto,
  })
  async updateSecurityConfig(@Body() configDto: SecurityConfigDto): Promise<SecurityConfigResponseDto> {
    try {
      return await this.securityService.updateSecurityConfig(configDto);
    } catch (error) {
      throw new HttpException(
        'Failed to update security configuration',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Security Compliance
  @Get('compliance')
  @Roles('admin', 'security_admin')
  @ApiOperation({ summary: 'Get security compliance status' })
  @ApiResponse({
    status: 200,
    description: 'Security compliance status retrieved successfully',
    type: SecurityComplianceResponseDto,
  })
  async getSecurityCompliance(): Promise<SecurityComplianceResponseDto> {
    try {
      return await this.securityService.getSecurityCompliance();
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve security compliance status',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Export Security Data
  @Post('export')
  @Roles('admin', 'security_admin')
  @ApiOperation({ summary: 'Export security data' })
  @ApiResponse({
    status: 200,
    description: 'Security data exported successfully',
  })
  async exportSecurityData(@Body() exportOptions: any): Promise<{ downloadUrl: string }> {
    try {
      const downloadUrl = await this.securityService.exportSecurityData(exportOptions);
      return { downloadUrl };
    } catch (error) {
      throw new HttpException(
        'Failed to export security data',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
