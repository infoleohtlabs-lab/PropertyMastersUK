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
  Request,
  ParseUUIDPipe,
  ParseIntPipe,
  HttpStatus,
  HttpCode,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBearerAuth,
  ApiBody,

  getSchemaPath,} from '@nestjs/swagger';
import { SolicitorService } from './solicitor.service';
import { CreateSolicitorDto } from './dto/create-solicitor.dto';
import { UpdateSolicitorDto } from './dto/update-solicitor.dto';
import { CreateLegalCaseDto } from './dto/create-legal-case.dto';
import { UpdateLegalCaseDto } from './dto/update-legal-case.dto';
import { CreateConveyancingTransactionDto } from './dto/create-conveyancing-transaction.dto';
import { UpdateConveyancingTransactionDto } from './dto/update-conveyancing-transaction.dto';
import { CreateLegalContractDto } from './dto/create-legal-contract.dto';
import { UpdateLegalContractDto } from './dto/update-legal-contract.dto';
import { CaseStatus, CasePriority } from './entities/legal-case.entity';
import { TransactionStatus } from './entities/conveyancing-transaction.entity';
import { ContractStatus } from './entities/legal-contract.entity';

@ApiTags('Solicitors')
@Controller('solicitors')
@ApiBearerAuth()
export class SolicitorController {
  constructor(private readonly solicitorService: SolicitorService) {}

  // Solicitor Management Endpoints
  @Post()
  @ApiOperation({ summary: 'Create a new solicitor' })
  @ApiResponse({ status: 201, description: 'Solicitor created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createSolicitor(@Body() createSolicitorDto: CreateSolicitorDto) {
    return await this.solicitorService.createSolicitor(createSolicitorDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all solicitors with pagination and search' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10)' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search by firm name' })
  @ApiResponse({ status: 200, description: 'Solicitors retrieved successfully' })
  async findAllSolicitors(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
    @Query('search') search?: string,
  ) {
    return await this.solicitorService.findAllSolicitors(page, limit, search);
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get current solicitor profile' })
  @ApiResponse({ status: 200, description: 'Solicitor profile retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Solicitor not found' })
  async getCurrentSolicitorProfile(@Request() req: any) {
    return await this.solicitorService.findSolicitorByUserId(req.user.id);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get current solicitor statistics' })
  @ApiResponse({ status: 200, description: 'Solicitor statistics retrieved successfully' })
  async getCurrentSolicitorStats(@Request() req: any) {
    const solicitor = await this.solicitorService.findSolicitorByUserId(req.user.id);
    return await this.solicitorService.getSolicitorStats(solicitor.id);
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard statistics for current solicitor' })
  @ApiResponse({ status: 200, description: 'Dashboard statistics retrieved successfully' })
  async getDashboard(@Request() req: any) {
    const solicitor = await this.solicitorService.findSolicitorByUserId(req.user.id);
    return await this.solicitorService.getDashboardStats(solicitor.id);
  }

  @Get('workload-analysis')
  @ApiOperation({ summary: 'Get workload analysis for current solicitor' })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Start date (ISO format)' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'End date (ISO format)' })
  @ApiResponse({ status: 200, description: 'Workload analysis retrieved successfully' })
  async getWorkloadAnalysis(
    @Request() req: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const solicitor = await this.solicitorService.findSolicitorByUserId(req.user.id);
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return await this.solicitorService.getWorkloadAnalysis(solicitor.id, start, end);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get solicitor by ID' })
  @ApiParam({ name: 'id', description: 'Solicitor ID' })
  @ApiResponse({ status: 200, description: 'Solicitor retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Solicitor not found' })
  async findSolicitorById(@Param('id', ParseUUIDPipe) id: string) {
    return await this.solicitorService.findSolicitorById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update solicitor' })
  @ApiParam({ name: 'id', description: 'Solicitor ID' })
  @ApiResponse({ status: 200, description: 'Solicitor updated successfully' })
  @ApiResponse({ status: 404, description: 'Solicitor not found' })
  async updateSolicitor(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSolicitorDto: UpdateSolicitorDto,
    @Request() req: any,
  ) {
    // Ensure solicitor can only update their own profile
    const hasAccess = await this.solicitorService.validateSolicitorAccess(id, req.user.id);
    if (!hasAccess) {
      throw new ForbiddenException('You can only update your own profile');
    }
    
    return await this.solicitorService.updateSolicitor(id, updateSolicitorDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete solicitor' })
  @ApiParam({ name: 'id', description: 'Solicitor ID' })
  @ApiResponse({ status: 204, description: 'Solicitor deleted successfully' })
  @ApiResponse({ status: 404, description: 'Solicitor not found' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteSolicitor(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any,
  ) {
    // Ensure solicitor can only delete their own profile
    const hasAccess = await this.solicitorService.validateSolicitorAccess(id, req.user.id);
    if (!hasAccess) {
      throw new ForbiddenException('You can only delete your own profile');
    }
    
    await this.solicitorService.deleteSolicitor(id);
  }

  // Legal Case Management Endpoints
  @Post('cases')
  @ApiOperation({ summary: 'Create a new legal case' })
  @ApiResponse({ status: 201, description: 'Legal case created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createLegalCase(
    @Body() createLegalCaseDto: CreateLegalCaseDto,
    @Request() req: any,
  ) {
    // Ensure solicitor can only create cases for themselves
    const hasAccess = await this.solicitorService.validateSolicitorAccess(createLegalCaseDto.solicitorId, req.user.id);
    if (!hasAccess) {
      throw new ForbiddenException('You can only create cases for yourself');
    }
    
    return await this.solicitorService.createLegalCase(createLegalCaseDto);
  }

  @Get('cases')
  @ApiOperation({ summary: 'Get all legal cases with filtering and pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10)' })
  @ApiQuery({ name: 'status', required: false, enum: CaseStatus, description: 'Filter by case status' })
  @ApiQuery({ name: 'priority', required: false, enum: CasePriority, description: 'Filter by case priority' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search by case title' })
  @ApiResponse({ status: 200, description: 'Legal cases retrieved successfully' })
  async findAllLegalCases(
    @Request() req: any,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
    @Query('status') status?: CaseStatus,
    @Query('priority') priority?: CasePriority,
    @Query('search') search?: string,
  ) {
    // Get current solicitor's cases only
    const solicitor = await this.solicitorService.findSolicitorByUserId(req.user.id);
    return await this.solicitorService.findAllLegalCases(page, limit, solicitor.id, status, priority, search);
  }

  @Get('cases/:id')
  @ApiOperation({ summary: 'Get legal case by ID' })
  @ApiParam({ name: 'id', description: 'Legal case ID' })
  @ApiResponse({ status: 200, description: 'Legal case retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Legal case not found' })
  async findLegalCaseById(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any,
  ) {
    const solicitor = await this.solicitorService.findSolicitorByUserId(req.user.id);
    const hasAccess = await this.solicitorService.validateCaseAccess(id, solicitor.id);
    if (!hasAccess) {
      throw new ForbiddenException('You can only access your own cases');
    }
    
    return await this.solicitorService.findLegalCaseById(id);
  }

  @Patch('cases/:id')
  @ApiOperation({ summary: 'Update legal case' })
  @ApiParam({ name: 'id', description: 'Legal case ID' })
  @ApiResponse({ status: 200, description: 'Legal case updated successfully' })
  @ApiResponse({ status: 404, description: 'Legal case not found' })
  async updateLegalCase(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateLegalCaseDto: UpdateLegalCaseDto,
    @Request() req: any,
  ) {
    const solicitor = await this.solicitorService.findSolicitorByUserId(req.user.id);
    const hasAccess = await this.solicitorService.validateCaseAccess(id, solicitor.id);
    if (!hasAccess) {
      throw new ForbiddenException('You can only update your own cases');
    }
    
    return await this.solicitorService.updateLegalCase(id, updateLegalCaseDto);
  }

  @Patch('cases/:id/status')
  @ApiOperation({ summary: 'Update legal case status' })
  @ApiParam({ name: 'id', description: 'Legal case ID' })
  @ApiBody({ schema: { type: 'object', properties: { status: { enum: Object.values(CaseStatus) } } } })
  @ApiResponse({ status: 200, description: 'Legal case status updated successfully' })
  async updateCaseStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: CaseStatus,
    @Request() req: any,
  ) {
    const solicitor = await this.solicitorService.findSolicitorByUserId(req.user.id);
    const hasAccess = await this.solicitorService.validateCaseAccess(id, solicitor.id);
    if (!hasAccess) {
      throw new ForbiddenException('You can only update your own cases');
    }
    
    return await this.solicitorService.updateCaseStatus(id, status);
  }

  @Delete('cases/:id')
  @ApiOperation({ summary: 'Delete legal case' })
  @ApiParam({ name: 'id', description: 'Legal case ID' })
  @ApiResponse({ status: 204, description: 'Legal case deleted successfully' })
  @ApiResponse({ status: 404, description: 'Legal case not found' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteLegalCase(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any,
  ) {
    const solicitor = await this.solicitorService.findSolicitorByUserId(req.user.id);
    const hasAccess = await this.solicitorService.validateCaseAccess(id, solicitor.id);
    if (!hasAccess) {
      throw new ForbiddenException('You can only delete your own cases');
    }
    
    await this.solicitorService.deleteLegalCase(id);
  }

  // Conveyancing Transaction Management Endpoints
  @Post('conveyancing')
  @ApiOperation({ summary: 'Create a new conveyancing transaction' })
  @ApiResponse({ status: 201, description: 'Conveyancing transaction created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createConveyancingTransaction(
    @Body() createTransactionDto: CreateConveyancingTransactionDto,
    @Request() req: any,
  ) {
    // Ensure solicitor can only create transactions for themselves
    const hasAccess = await this.solicitorService.validateSolicitorAccess(createTransactionDto.solicitorId, req.user.id);
    if (!hasAccess) {
      throw new ForbiddenException('You can only create transactions for yourself');
    }
    
    return await this.solicitorService.createConveyancingTransaction(createTransactionDto);
  }

  @Get('conveyancing')
  @ApiOperation({ summary: 'Get all conveyancing transactions with filtering and pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10)' })
  @ApiQuery({ name: 'status', required: false, enum: TransactionStatus, description: 'Filter by transaction status' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search by property address' })
  @ApiResponse({ status: 200, description: 'Conveyancing transactions retrieved successfully' })
  async findAllConveyancingTransactions(
    @Request() req: any,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
    @Query('status') status?: TransactionStatus,
    @Query('search') search?: string,
  ) {
    // Get current solicitor's transactions only
    const solicitor = await this.solicitorService.findSolicitorByUserId(req.user.id);
    return await this.solicitorService.findAllConveyancingTransactions(page, limit, solicitor.id, status, search);
  }

  @Get('conveyancing/:id')
  @ApiOperation({ summary: 'Get conveyancing transaction by ID' })
  @ApiParam({ name: 'id', description: 'Conveyancing transaction ID' })
  @ApiResponse({ status: 200, description: 'Conveyancing transaction retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Conveyancing transaction not found' })
  async findConveyancingTransactionById(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any,
  ) {
    const solicitor = await this.solicitorService.findSolicitorByUserId(req.user.id);
    const hasAccess = await this.solicitorService.validateTransactionAccess(id, solicitor.id);
    if (!hasAccess) {
      throw new ForbiddenException('You can only access your own transactions');
    }
    
    return await this.solicitorService.findConveyancingTransactionById(id);
  }

  @Patch('conveyancing/:id')
  @ApiOperation({ summary: 'Update conveyancing transaction' })
  @ApiParam({ name: 'id', description: 'Conveyancing transaction ID' })
  @ApiResponse({ status: 200, description: 'Conveyancing transaction updated successfully' })
  @ApiResponse({ status: 404, description: 'Conveyancing transaction not found' })
  async updateConveyancingTransaction(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTransactionDto: UpdateConveyancingTransactionDto,
    @Request() req: any,
  ) {
    const solicitor = await this.solicitorService.findSolicitorByUserId(req.user.id);
    const hasAccess = await this.solicitorService.validateTransactionAccess(id, solicitor.id);
    if (!hasAccess) {
      throw new ForbiddenException('You can only update your own transactions');
    }
    
    return await this.solicitorService.updateConveyancingTransaction(id, updateTransactionDto);
  }

  @Patch('conveyancing/:id/status')
  @ApiOperation({ summary: 'Update conveyancing transaction status' })
  @ApiParam({ name: 'id', description: 'Conveyancing transaction ID' })
  @ApiBody({ schema: { type: 'object', properties: { status: { enum: Object.values(TransactionStatus) } } } })
  @ApiResponse({ status: 200, description: 'Conveyancing transaction status updated successfully' })
  async updateTransactionStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: TransactionStatus,
    @Request() req: any,
  ) {
    const solicitor = await this.solicitorService.findSolicitorByUserId(req.user.id);
    const hasAccess = await this.solicitorService.validateTransactionAccess(id, solicitor.id);
    if (!hasAccess) {
      throw new ForbiddenException('You can only update your own transactions');
    }
    
    return await this.solicitorService.updateTransactionStatus(id, status);
  }

  @Delete('conveyancing/:id')
  @ApiOperation({ summary: 'Delete conveyancing transaction' })
  @ApiParam({ name: 'id', description: 'Conveyancing transaction ID' })
  @ApiResponse({ status: 204, description: 'Conveyancing transaction deleted successfully' })
  @ApiResponse({ status: 404, description: 'Conveyancing transaction not found' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteConveyancingTransaction(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any,
  ) {
    const solicitor = await this.solicitorService.findSolicitorByUserId(req.user.id);
    const hasAccess = await this.solicitorService.validateTransactionAccess(id, solicitor.id);
    if (!hasAccess) {
      throw new ForbiddenException('You can only delete your own transactions');
    }
    
    await this.solicitorService.deleteConveyancingTransaction(id);
  }

  // Legal Contract Management Endpoints
  @Post('contracts')
  @ApiOperation({ summary: 'Create a new legal contract' })
  @ApiResponse({ status: 201, description: 'Legal contract created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createLegalContract(
    @Body() createContractDto: CreateLegalContractDto,
    @Request() req: any,
  ) {
    // Ensure solicitor can only create contracts for themselves
    const hasAccess = await this.solicitorService.validateSolicitorAccess(createContractDto.solicitorId, req.user.id);
    if (!hasAccess) {
      throw new ForbiddenException('You can only create contracts for yourself');
    }
    
    return await this.solicitorService.createLegalContract(createContractDto);
  }

  @Get('contracts')
  @ApiOperation({ summary: 'Get all legal contracts with filtering and pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10)' })
  @ApiQuery({ name: 'status', required: false, enum: ContractStatus, description: 'Filter by contract status' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search by contract title' })
  @ApiResponse({ status: 200, description: 'Legal contracts retrieved successfully' })
  async findAllLegalContracts(
    @Request() req: any,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
    @Query('status') status?: ContractStatus,
    @Query('search') search?: string,
  ) {
    // Get current solicitor's contracts only
    const solicitor = await this.solicitorService.findSolicitorByUserId(req.user.id);
    return await this.solicitorService.findAllLegalContracts(page, limit, solicitor.id, status, search);
  }

  @Get('contracts/:id')
  @ApiOperation({ summary: 'Get legal contract by ID' })
  @ApiParam({ name: 'id', description: 'Legal contract ID' })
  @ApiResponse({ status: 200, description: 'Legal contract retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Legal contract not found' })
  async findLegalContractById(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any,
  ) {
    const solicitor = await this.solicitorService.findSolicitorByUserId(req.user.id);
    const hasAccess = await this.solicitorService.validateContractAccess(id, solicitor.id);
    if (!hasAccess) {
      throw new ForbiddenException('You can only access your own contracts');
    }
    
    return await this.solicitorService.findLegalContractById(id);
  }

  @Patch('contracts/:id')
  @ApiOperation({ summary: 'Update legal contract' })
  @ApiParam({ name: 'id', description: 'Legal contract ID' })
  @ApiResponse({ status: 200, description: 'Legal contract updated successfully' })
  @ApiResponse({ status: 404, description: 'Legal contract not found' })
  async updateLegalContract(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateContractDto: UpdateLegalContractDto,
    @Request() req: any,
  ) {
    const solicitor = await this.solicitorService.findSolicitorByUserId(req.user.id);
    const hasAccess = await this.solicitorService.validateContractAccess(id, solicitor.id);
    if (!hasAccess) {
      throw new ForbiddenException('You can only update your own contracts');
    }
    
    return await this.solicitorService.updateLegalContract(id, updateContractDto);
  }

  @Patch('contracts/:id/status')
  @ApiOperation({ summary: 'Update legal contract status' })
  @ApiParam({ name: 'id', description: 'Legal contract ID' })
  @ApiBody({ schema: { type: 'object', properties: { status: { enum: Object.values(ContractStatus) } } } })
  @ApiResponse({ status: 200, description: 'Legal contract status updated successfully' })
  async updateContractStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: ContractStatus,
    @Request() req: any,
  ) {
    const solicitor = await this.solicitorService.findSolicitorByUserId(req.user.id);
    const hasAccess = await this.solicitorService.validateContractAccess(id, solicitor.id);
    if (!hasAccess) {
      throw new ForbiddenException('You can only update your own contracts');
    }
    
    return await this.solicitorService.updateContractStatus(id, status);
  }

  @Delete('contracts/:id')
  @ApiOperation({ summary: 'Delete legal contract' })
  @ApiParam({ name: 'id', description: 'Legal contract ID' })
  @ApiResponse({ status: 204, description: 'Legal contract deleted successfully' })
  @ApiResponse({ status: 404, description: 'Legal contract not found' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteLegalContract(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any,
  ) {
    const solicitor = await this.solicitorService.findSolicitorByUserId(req.user.id);
    const hasAccess = await this.solicitorService.validateContractAccess(id, solicitor.id);
    if (!hasAccess) {
      throw new ForbiddenException('You can only delete your own contracts');
    }
    
    await this.solicitorService.deleteLegalContract(id);
  }
}
