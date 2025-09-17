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
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { FinancialManagementService } from './financial-management.service';
import {
  FinancialReportDto,
  RevenueAnalyticsDto,
  ExpenseTrackingDto,
  PaymentMethodConfigDto,
  TaxConfigurationDto,
  FinancialAuditDto,
  BudgetPlanningDto,
  CashFlowAnalysisDto,
  FinancialAlertDto,
  FinancialQueryDto,
  FinancialReportResponseDto,
  RevenueAnalyticsResponseDto,
  ExpenseTrackingResponseDto,
  PaymentMethodConfigResponseDto,
  TaxConfigurationResponseDto,
  FinancialAuditResponseDto,
  BudgetPlanningResponseDto,
  CashFlowAnalysisResponseDto,
  FinancialAlertResponseDto,
  FinancialDashboardResponseDto,
} from './dto/financial-management.dto';

@ApiTags('Financial Management')
@Controller('admin/financial')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@Roles('admin', 'financial_manager')
export class FinancialManagementController {
  constructor(
    private readonly financialManagementService: FinancialManagementService,
  ) {}

  // Financial Reports
  @Get('reports')
  @ApiOperation({ summary: 'Get financial reports' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Financial reports retrieved successfully',
    type: [FinancialReportResponseDto],
  })
  @ApiQuery({ name: 'type', required: false, description: 'Report type filter' })
  @ApiQuery({ name: 'period', required: false, description: 'Report period filter' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date filter' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date filter' })
  async getFinancialReports(
    @Query() query: FinancialQueryDto,
  ): Promise<FinancialReportResponseDto[]> {
    return this.financialManagementService.getFinancialReports(query);
  }

  @Post('reports')
  @ApiOperation({ summary: 'Generate financial report' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Financial report generated successfully',
    type: FinancialReportResponseDto,
  })
  async generateFinancialReport(
    @Body() createDto: FinancialReportDto,
  ): Promise<FinancialReportResponseDto> {
    return this.financialManagementService.generateFinancialReport(createDto);
  }

  @Get('reports/:id')
  @ApiOperation({ summary: 'Get financial report by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Financial report retrieved successfully',
    type: FinancialReportResponseDto,
  })
  @ApiParam({ name: 'id', description: 'Report ID' })
  async getFinancialReport(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<FinancialReportResponseDto> {
    return this.financialManagementService.getFinancialReport(id);
  }

  @Put('reports/:id')
  @ApiOperation({ summary: 'Update financial report' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Financial report updated successfully',
    type: FinancialReportResponseDto,
  })
  @ApiParam({ name: 'id', description: 'Report ID' })
  async updateFinancialReport(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: FinancialReportDto,
  ): Promise<FinancialReportResponseDto> {
    return this.financialManagementService.updateFinancialReport(id, updateDto);
  }

  @Delete('reports/:id')
  @ApiOperation({ summary: 'Delete financial report' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Financial report deleted successfully',
  })
  @ApiParam({ name: 'id', description: 'Report ID' })
  async deleteFinancialReport(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    return this.financialManagementService.deleteFinancialReport(id);
  }

  // Revenue Analytics
  @Get('revenue/analytics')
  @ApiOperation({ summary: 'Get revenue analytics' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Revenue analytics retrieved successfully',
    type: [RevenueAnalyticsResponseDto],
  })
  @ApiQuery({ name: 'period', required: false, description: 'Analytics period' })
  @ApiQuery({ name: 'groupBy', required: false, description: 'Group by dimension' })
  async getRevenueAnalytics(
    @Query() query: FinancialQueryDto,
  ): Promise<RevenueAnalyticsResponseDto[]> {
    return this.financialManagementService.getRevenueAnalytics(query);
  }

  @Post('revenue/analytics')
  @ApiOperation({ summary: 'Create revenue analytics configuration' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Revenue analytics configuration created successfully',
    type: RevenueAnalyticsResponseDto,
  })
  async createRevenueAnalytics(
    @Body() createDto: RevenueAnalyticsDto,
  ): Promise<RevenueAnalyticsResponseDto> {
    return this.financialManagementService.createRevenueAnalytics(createDto);
  }

  @Get('revenue/breakdown')
  @ApiOperation({ summary: 'Get revenue breakdown' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Revenue breakdown retrieved successfully',
  })
  @ApiQuery({ name: 'period', required: false, description: 'Breakdown period' })
  @ApiQuery({ name: 'category', required: false, description: 'Revenue category' })
  async getRevenueBreakdown(
    @Query() query: FinancialQueryDto,
  ): Promise<any> {
    return this.financialManagementService.getRevenueBreakdown(query);
  }

  // Expense Tracking
  @Get('expenses')
  @ApiOperation({ summary: 'Get expense tracking data' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Expense tracking data retrieved successfully',
    type: [ExpenseTrackingResponseDto],
  })
  @ApiQuery({ name: 'category', required: false, description: 'Expense category filter' })
  @ApiQuery({ name: 'status', required: false, description: 'Expense status filter' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date filter' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date filter' })
  async getExpenseTracking(
    @Query() query: FinancialQueryDto,
  ): Promise<ExpenseTrackingResponseDto[]> {
    return this.financialManagementService.getExpenseTracking(query);
  }

  @Post('expenses')
  @ApiOperation({ summary: 'Create expense record' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Expense record created successfully',
    type: ExpenseTrackingResponseDto,
  })
  async createExpenseRecord(
    @Body() createDto: ExpenseTrackingDto,
  ): Promise<ExpenseTrackingResponseDto> {
    return this.financialManagementService.createExpenseRecord(createDto);
  }

  @Put('expenses/:id')
  @ApiOperation({ summary: 'Update expense record' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Expense record updated successfully',
    type: ExpenseTrackingResponseDto,
  })
  @ApiParam({ name: 'id', description: 'Expense ID' })
  async updateExpenseRecord(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: ExpenseTrackingDto,
  ): Promise<ExpenseTrackingResponseDto> {
    return this.financialManagementService.updateExpenseRecord(id, updateDto);
  }

  @Delete('expenses/:id')
  @ApiOperation({ summary: 'Delete expense record' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Expense record deleted successfully',
  })
  @ApiParam({ name: 'id', description: 'Expense ID' })
  async deleteExpenseRecord(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    return this.financialManagementService.deleteExpenseRecord(id);
  }

  @Get('expenses/categories')
  @ApiOperation({ summary: 'Get expense categories' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Expense categories retrieved successfully',
  })
  async getExpenseCategories(): Promise<any[]> {
    return this.financialManagementService.getExpenseCategories();
  }

  // Payment Methods
  @Get('payment-methods')
  @ApiOperation({ summary: 'Get payment method configurations' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Payment method configurations retrieved successfully',
    type: [PaymentMethodConfigResponseDto],
  })
  async getPaymentMethods(
    @Query() query: FinancialQueryDto,
  ): Promise<PaymentMethodConfigResponseDto[]> {
    return this.financialManagementService.getPaymentMethods(query);
  }

  @Post('payment-methods')
  @ApiOperation({ summary: 'Configure payment method' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Payment method configured successfully',
    type: PaymentMethodConfigResponseDto,
  })
  async configurePaymentMethod(
    @Body() configDto: PaymentMethodConfigDto,
  ): Promise<PaymentMethodConfigResponseDto> {
    return this.financialManagementService.configurePaymentMethod(configDto);
  }

  @Put('payment-methods/:id')
  @ApiOperation({ summary: 'Update payment method configuration' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Payment method configuration updated successfully',
    type: PaymentMethodConfigResponseDto,
  })
  @ApiParam({ name: 'id', description: 'Payment method ID' })
  async updatePaymentMethod(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: PaymentMethodConfigDto,
  ): Promise<PaymentMethodConfigResponseDto> {
    return this.financialManagementService.updatePaymentMethod(id, updateDto);
  }

  @Delete('payment-methods/:id')
  @ApiOperation({ summary: 'Delete payment method configuration' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Payment method configuration deleted successfully',
  })
  @ApiParam({ name: 'id', description: 'Payment method ID' })
  async deletePaymentMethod(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    return this.financialManagementService.deletePaymentMethod(id);
  }

  // Tax Configuration
  @Get('tax/configuration')
  @ApiOperation({ summary: 'Get tax configurations' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Tax configurations retrieved successfully',
    type: [TaxConfigurationResponseDto],
  })
  async getTaxConfiguration(
    @Query() query: FinancialQueryDto,
  ): Promise<TaxConfigurationResponseDto[]> {
    return this.financialManagementService.getTaxConfiguration(query);
  }

  @Post('tax/configuration')
  @ApiOperation({ summary: 'Create tax configuration' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Tax configuration created successfully',
    type: TaxConfigurationResponseDto,
  })
  async createTaxConfiguration(
    @Body() configDto: TaxConfigurationDto,
  ): Promise<TaxConfigurationResponseDto> {
    return this.financialManagementService.createTaxConfiguration(configDto);
  }

  @Put('tax/configuration/:id')
  @ApiOperation({ summary: 'Update tax configuration' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Tax configuration updated successfully',
    type: TaxConfigurationResponseDto,
  })
  @ApiParam({ name: 'id', description: 'Tax configuration ID' })
  async updateTaxConfiguration(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: TaxConfigurationDto,
  ): Promise<TaxConfigurationResponseDto> {
    return this.financialManagementService.updateTaxConfiguration(id, updateDto);
  }

  // Financial Audits
  @Get('audits')
  @ApiOperation({ summary: 'Get financial audits' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Financial audits retrieved successfully',
    type: [FinancialAuditResponseDto],
  })
  @ApiQuery({ name: 'type', required: false, description: 'Audit type filter' })
  @ApiQuery({ name: 'status', required: false, description: 'Audit status filter' })
  async getFinancialAudits(
    @Query() query: FinancialQueryDto,
  ): Promise<FinancialAuditResponseDto[]> {
    return this.financialManagementService.getFinancialAudits(query);
  }

  @Post('audits')
  @ApiOperation({ summary: 'Create financial audit' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Financial audit created successfully',
    type: FinancialAuditResponseDto,
  })
  async createFinancialAudit(
    @Body() auditDto: FinancialAuditDto,
  ): Promise<FinancialAuditResponseDto> {
    return this.financialManagementService.createFinancialAudit(auditDto);
  }

  @Put('audits/:id')
  @ApiOperation({ summary: 'Update financial audit' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Financial audit updated successfully',
    type: FinancialAuditResponseDto,
  })
  @ApiParam({ name: 'id', description: 'Audit ID' })
  async updateFinancialAudit(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: FinancialAuditDto,
  ): Promise<FinancialAuditResponseDto> {
    return this.financialManagementService.updateFinancialAudit(id, updateDto);
  }

  // Budget Planning
  @Get('budget/planning')
  @ApiOperation({ summary: 'Get budget planning data' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Budget planning data retrieved successfully',
    type: [BudgetPlanningResponseDto],
  })
  @ApiQuery({ name: 'year', required: false, description: 'Budget year filter' })
  @ApiQuery({ name: 'department', required: false, description: 'Department filter' })
  async getBudgetPlanning(
    @Query() query: FinancialQueryDto,
  ): Promise<BudgetPlanningResponseDto[]> {
    return this.financialManagementService.getBudgetPlanning(query);
  }

  @Post('budget/planning')
  @ApiOperation({ summary: 'Create budget plan' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Budget plan created successfully',
    type: BudgetPlanningResponseDto,
  })
  async createBudgetPlan(
    @Body() budgetDto: BudgetPlanningDto,
  ): Promise<BudgetPlanningResponseDto> {
    return this.financialManagementService.createBudgetPlan(budgetDto);
  }

  @Put('budget/planning/:id')
  @ApiOperation({ summary: 'Update budget plan' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Budget plan updated successfully',
    type: BudgetPlanningResponseDto,
  })
  @ApiParam({ name: 'id', description: 'Budget plan ID' })
  async updateBudgetPlan(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: BudgetPlanningDto,
  ): Promise<BudgetPlanningResponseDto> {
    return this.financialManagementService.updateBudgetPlan(id, updateDto);
  }

  // Cash Flow Analysis
  @Get('cashflow/analysis')
  @ApiOperation({ summary: 'Get cash flow analysis' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cash flow analysis retrieved successfully',
    type: [CashFlowAnalysisResponseDto],
  })
  @ApiQuery({ name: 'period', required: false, description: 'Analysis period' })
  @ApiQuery({ name: 'forecast', required: false, description: 'Include forecast' })
  async getCashFlowAnalysis(
    @Query() query: FinancialQueryDto,
  ): Promise<CashFlowAnalysisResponseDto[]> {
    return this.financialManagementService.getCashFlowAnalysis(query);
  }

  @Post('cashflow/analysis')
  @ApiOperation({ summary: 'Generate cash flow analysis' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Cash flow analysis generated successfully',
    type: CashFlowAnalysisResponseDto,
  })
  async generateCashFlowAnalysis(
    @Body() analysisDto: CashFlowAnalysisDto,
  ): Promise<CashFlowAnalysisResponseDto> {
    return this.financialManagementService.generateCashFlowAnalysis(analysisDto);
  }

  // Financial Alerts
  @Get('alerts')
  @ApiOperation({ summary: 'Get financial alerts' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Financial alerts retrieved successfully',
    type: [FinancialAlertResponseDto],
  })
  @ApiQuery({ name: 'severity', required: false, description: 'Alert severity filter' })
  @ApiQuery({ name: 'status', required: false, description: 'Alert status filter' })
  async getFinancialAlerts(
    @Query() query: FinancialQueryDto,
  ): Promise<FinancialAlertResponseDto[]> {
    return this.financialManagementService.getFinancialAlerts(query);
  }

  @Post('alerts')
  @ApiOperation({ summary: 'Create financial alert' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Financial alert created successfully',
    type: FinancialAlertResponseDto,
  })
  async createFinancialAlert(
    @Body() alertDto: FinancialAlertDto,
  ): Promise<FinancialAlertResponseDto> {
    return this.financialManagementService.createFinancialAlert(alertDto);
  }

  @Put('alerts/:id/acknowledge')
  @ApiOperation({ summary: 'Acknowledge financial alert' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Financial alert acknowledged successfully',
    type: FinancialAlertResponseDto,
  })
  @ApiParam({ name: 'id', description: 'Alert ID' })
  async acknowledgeFinancialAlert(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<FinancialAlertResponseDto> {
    return this.financialManagementService.acknowledgeFinancialAlert(id);
  }

  @Delete('alerts/:id')
  @ApiOperation({ summary: 'Delete financial alert' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Financial alert deleted successfully',
  })
  @ApiParam({ name: 'id', description: 'Alert ID' })
  async deleteFinancialAlert(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    return this.financialManagementService.deleteFinancialAlert(id);
  }

  // Dashboard and Metrics
  @Get('dashboard')
  @ApiOperation({ summary: 'Get financial dashboard data' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Financial dashboard data retrieved successfully',
    type: FinancialDashboardResponseDto,
  })
  @ApiQuery({ name: 'period', required: false, description: 'Dashboard period' })
  async getFinancialDashboard(
    @Query() query: FinancialQueryDto,
  ): Promise<FinancialDashboardResponseDto> {
    return this.financialManagementService.getFinancialDashboard(query);
  }

  @Get('metrics')
  @ApiOperation({ summary: 'Get financial metrics' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Financial metrics retrieved successfully',
  })
  @ApiQuery({ name: 'metrics', required: false, description: 'Specific metrics to retrieve' })
  async getFinancialMetrics(
    @Query() query: FinancialQueryDto,
  ): Promise<any> {
    return this.financialManagementService.getFinancialMetrics(query);
  }

  @Get('kpis')
  @ApiOperation({ summary: 'Get financial KPIs' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Financial KPIs retrieved successfully',
  })
  @ApiQuery({ name: 'period', required: false, description: 'KPI period' })
  async getFinancialKPIs(
    @Query() query: FinancialQueryDto,
  ): Promise<any> {
    return this.financialManagementService.getFinancialKPIs(query);
  }

  // Export and Import
  @Get('export')
  @ApiOperation({ summary: 'Export financial data' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Financial data exported successfully',
  })
  @ApiQuery({ name: 'format', required: false, description: 'Export format (csv, xlsx, pdf)' })
  @ApiQuery({ name: 'type', required: false, description: 'Data type to export' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date for export' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date for export' })
  async exportFinancialData(
    @Query() query: FinancialQueryDto,
  ): Promise<{ downloadUrl: string; expiresAt: Date }> {
    return this.financialManagementService.exportFinancialData(query);
  }

  // Configuration
  @Get('configuration')
  @ApiOperation({ summary: 'Get financial configuration' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Financial configuration retrieved successfully',
  })
  async getFinancialConfiguration(): Promise<any> {
    return this.financialManagementService.getFinancialConfiguration();
  }

  @Put('configuration')
  @ApiOperation({ summary: 'Update financial configuration' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Financial configuration updated successfully',
  })
  async updateFinancialConfiguration(
    @Body() configDto: any,
  ): Promise<any> {
    return this.financialManagementService.updateFinancialConfiguration(configDto);
  }
}