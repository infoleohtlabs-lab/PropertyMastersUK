import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseUUIDPipe,
  ParseEnumPipe,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,

  getSchemaPath,} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FinancialService } from './financial.service';
import {
  CreateTransactionDto,
  UpdateTransactionDto,
  CreateInvoiceDto,
  UpdateInvoiceDto,
  CreateFinancialReportDto,
  UpdateFinancialReportDto,
} from './dto';
import { Transaction, TransactionStatus, TransactionType } from './entities/transaction.entity';
import { Invoice, InvoiceStatus } from './entities/invoice.entity';
import { FinancialReport, ReportType } from './entities/financial-report.entity';

@ApiTags('Financial Management')
@Controller('financial')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FinancialController {
  constructor(private readonly financialService: FinancialService) {}

  // Transaction endpoints
  @Post('transactions')
  @ApiOperation({ summary: 'Create a new transaction' })
  @ApiResponse({ status: 201, description: 'Transaction created successfully', schema: { $ref: getSchemaPath(Transaction) } })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  createTransaction(@Body() createTransactionDto: CreateTransactionDto): Promise<Transaction> {
    return this.financialService.createTransaction(createTransactionDto);
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Get all transactions' })
  @ApiResponse({ status: 200, description: 'Transactions retrieved successfully', schema: { type: 'array', items: { $ref: getSchemaPath(Transaction) } } })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiQuery({ name: 'userId', required: false, description: 'Filter by user ID' })
  @ApiQuery({ name: 'propertyId', required: false, description: 'Filter by property ID' })
  @ApiQuery({ name: 'status', required: false, enum: TransactionStatus, description: 'Filter by status' })
  @ApiQuery({ name: 'type', required: false, enum: TransactionType, description: 'Filter by type' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Filter by start date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'Filter by end date (YYYY-MM-DD)' })
  async findAllTransactions(
    @Query('userId') userId?: string,
    @Query('propertyId') propertyId?: string,
    @Query('status') status?: TransactionStatus,
    @Query('type') type?: TransactionType,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<Transaction[]> {
    if (userId) {
      return this.financialService.findTransactionsByUser(userId);
    }
    if (propertyId) {
      return this.financialService.findTransactionsByProperty(propertyId);
    }
    if (status) {
      return this.financialService.findTransactionsByStatus(status);
    }
    if (type) {
      return this.financialService.findTransactionsByType(type);
    }
    if (startDate && endDate) {
      return this.financialService.findTransactionsByDateRange(new Date(startDate), new Date(endDate));
    }
    return this.financialService.findAllTransactions();
  }

  @Get('transactions/:id')
  @ApiOperation({ summary: 'Get transaction by ID' })
  @ApiResponse({ status: 200, description: 'Transaction retrieved successfully', schema: { $ref: getSchemaPath(Transaction) } })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiParam({ name: 'id', description: 'Transaction ID' })
  findTransactionById(@Param('id', ParseUUIDPipe) id: string): Promise<Transaction> {
    return this.financialService.findTransactionById(id);
  }

  @Patch('transactions/:id')
  @ApiOperation({ summary: 'Update transaction' })
  @ApiResponse({ status: 200, description: 'Transaction updated successfully', schema: { $ref: getSchemaPath(Transaction) } })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiParam({ name: 'id', description: 'Transaction ID' })
  updateTransaction(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTransactionDto: UpdateTransactionDto,
  ): Promise<Transaction> {
    return this.financialService.updateTransaction(id, updateTransactionDto);
  }

  @Delete('transactions/:id')
  @ApiOperation({ summary: 'Delete transaction' })
  @ApiResponse({ status: 200, description: 'Transaction deleted successfully' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiParam({ name: 'id', description: 'Transaction ID' })
  removeTransaction(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.financialService.removeTransaction(id);
  }

  // Invoice endpoints
  @Post('invoices')
  @ApiOperation({ summary: 'Create a new invoice' })
  @ApiResponse({ status: 201, description: 'Invoice created successfully', schema: { $ref: getSchemaPath(Invoice) } })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  createInvoice(@Body() createInvoiceDto: CreateInvoiceDto): Promise<Invoice> {
    return this.financialService.createInvoice(createInvoiceDto);
  }

  @Get('invoices')
  @ApiOperation({ summary: 'Get all invoices' })
  @ApiResponse({ status: 200, description: 'Invoices retrieved successfully', schema: { type: 'array', items: { $ref: getSchemaPath(Invoice) } } })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiQuery({ name: 'createdBy', required: false, description: 'Filter by creator ID' })
  @ApiQuery({ name: 'invoiceTo', required: false, description: 'Filter by recipient ID' })
  @ApiQuery({ name: 'propertyId', required: false, description: 'Filter by property ID' })
  @ApiQuery({ name: 'status', required: false, enum: InvoiceStatus, description: 'Filter by status' })
  @ApiQuery({ name: 'overdue', required: false, type: Boolean, description: 'Get overdue invoices only' })
  async findAllInvoices(
    @Query('createdBy') createdBy?: string,
    @Query('invoiceTo') invoiceTo?: string,
    @Query('propertyId') propertyId?: string,
    @Query('status') status?: InvoiceStatus,
    @Query('overdue') overdue?: boolean,
  ): Promise<Invoice[]> {
    if (overdue) {
      return this.financialService.findOverdueInvoices();
    }
    if (createdBy) {
      return this.financialService.findInvoicesByCreator(createdBy);
    }
    if (invoiceTo) {
      return this.financialService.findInvoicesByRecipient(invoiceTo);
    }
    if (propertyId) {
      return this.financialService.findInvoicesByProperty(propertyId);
    }
    if (status) {
      return this.financialService.findInvoicesByStatus(status);
    }
    return this.financialService.findAllInvoices();
  }

  @Get('invoices/:id')
  @ApiOperation({ summary: 'Get invoice by ID' })
  @ApiResponse({ status: 200, description: 'Invoice retrieved successfully', schema: { $ref: getSchemaPath(Invoice) } })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiParam({ name: 'id', description: 'Invoice ID' })
  findInvoiceById(@Param('id', ParseUUIDPipe) id: string): Promise<Invoice> {
    return this.financialService.findInvoiceById(id);
  }

  @Patch('invoices/:id')
  @ApiOperation({ summary: 'Update invoice' })
  @ApiResponse({ status: 200, description: 'Invoice updated successfully', schema: { $ref: getSchemaPath(Invoice) } })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiParam({ name: 'id', description: 'Invoice ID' })
  updateInvoice(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateInvoiceDto: UpdateInvoiceDto,
  ): Promise<Invoice> {
    return this.financialService.updateInvoice(id, updateInvoiceDto);
  }

  @Delete('invoices/:id')
  @ApiOperation({ summary: 'Delete invoice' })
  @ApiResponse({ status: 200, description: 'Invoice deleted successfully' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiParam({ name: 'id', description: 'Invoice ID' })
  removeInvoice(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.financialService.removeInvoice(id);
  }

  @Post('invoices/:id/mark-paid')
  @ApiOperation({ summary: 'Mark invoice as paid' })
  @ApiResponse({ status: 200, description: 'Invoice marked as paid successfully', schema: { $ref: getSchemaPath(Invoice) } })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiParam({ name: 'id', description: 'Invoice ID' })
  @ApiQuery({ name: 'amount', description: 'Amount paid' })
  markInvoiceAsPaid(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('amount', ParseIntPipe) amount: number,
  ): Promise<Invoice> {
    return this.financialService.markInvoiceAsPaid(id, amount);
  }

  // Financial Report endpoints
  @Post('reports')
  @ApiOperation({ summary: 'Create a new financial report' })
  @ApiResponse({ status: 201, description: 'Financial report created successfully', schema: { $ref: getSchemaPath(FinancialReport) } })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  createFinancialReport(@Body() createFinancialReportDto: CreateFinancialReportDto): Promise<FinancialReport> {
    return this.financialService.createFinancialReport(createFinancialReportDto);
  }

  @Get('reports')
  @ApiOperation({ summary: 'Get all financial reports' })
  @ApiResponse({ status: 200, description: 'Financial reports retrieved successfully', schema: { type: 'array', items: { $ref: getSchemaPath(FinancialReport) } } })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiQuery({ name: 'generatedBy', required: false, description: 'Filter by generator ID' })
  @ApiQuery({ name: 'propertyId', required: false, description: 'Filter by property ID' })
  @ApiQuery({ name: 'type', required: false, enum: ReportType, description: 'Filter by report type' })
  async findAllFinancialReports(
    @Query('generatedBy') generatedBy?: string,
    @Query('propertyId') propertyId?: string,
    @Query('type') type?: ReportType,
  ): Promise<FinancialReport[]> {
    if (generatedBy) {
      return this.financialService.findReportsByGenerator(generatedBy);
    }
    if (propertyId) {
      return this.financialService.findReportsByProperty(propertyId);
    }
    if (type) {
      return this.financialService.findReportsByType(type);
    }
    return this.financialService.findAllFinancialReports();
  }

  @Get('reports/:id')
  @ApiOperation({ summary: 'Get financial report by ID' })
  @ApiResponse({ status: 200, description: 'Financial report retrieved successfully', schema: { $ref: getSchemaPath(FinancialReport) } })
  @ApiResponse({ status: 404, description: 'Financial report not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiParam({ name: 'id', description: 'Financial report ID' })
  findFinancialReportById(@Param('id', ParseUUIDPipe) id: string): Promise<FinancialReport> {
    return this.financialService.findFinancialReportById(id);
  }

  @Patch('reports/:id')
  @ApiOperation({ summary: 'Update financial report' })
  @ApiResponse({ status: 200, description: 'Financial report updated successfully', schema: { $ref: getSchemaPath(FinancialReport) } })
  @ApiResponse({ status: 404, description: 'Financial report not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiParam({ name: 'id', description: 'Financial report ID' })
  updateFinancialReport(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateFinancialReportDto: UpdateFinancialReportDto,
  ): Promise<FinancialReport> {
    return this.financialService.updateFinancialReport(id, updateFinancialReportDto);
  }

  @Delete('reports/:id')
  @ApiOperation({ summary: 'Delete financial report' })
  @ApiResponse({ status: 200, description: 'Financial report deleted successfully' })
  @ApiResponse({ status: 404, description: 'Financial report not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiParam({ name: 'id', description: 'Financial report ID' })
  removeFinancialReport(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.financialService.removeFinancialReport(id);
  }

  // Analytics endpoints
  @Get('analytics/income-statement')
  @ApiOperation({ summary: 'Generate income statement for a property' })
  @ApiResponse({ status: 200, description: 'Income statement generated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiQuery({ name: 'propertyId', description: 'Property ID' })
  @ApiQuery({ name: 'startDate', description: 'Start date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', description: 'End date (YYYY-MM-DD)' })
  generateIncomeStatement(
    @Query('propertyId') propertyId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<any> {
    return this.financialService.generateIncomeStatement(propertyId, new Date(startDate), new Date(endDate));
  }

  @Get('analytics/summary')
  @ApiOperation({ summary: 'Get financial summary' })
  @ApiResponse({ status: 200, description: 'Financial summary retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiQuery({ name: 'propertyId', required: false, description: 'Property ID for property-specific summary' })
  getFinancialSummary(@Query('propertyId') propertyId?: string): Promise<any> {
    return this.financialService.getFinancialSummary(propertyId);
  }
}
