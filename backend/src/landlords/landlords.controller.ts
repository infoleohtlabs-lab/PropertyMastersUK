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
  UploadedFile,
  UseInterceptors,
  ParseUUIDPipe,
  HttpStatus,
  HttpCode,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { LandlordsService } from './landlords.service';
import { CreateLandlordDto } from './dto/create-landlord.dto';
import { UpdateLandlordDto } from './dto/update-landlord.dto';
import { CreatePropertyDto } from './dto/create-property.dto';
import { CreateTenancyDto } from './dto/create-tenancy.dto';
import { CreateMaintenanceRequestDto } from './dto/create-maintenance-request.dto';
import { ScheduleInspectionDto } from './dto/schedule-inspection.dto';
import { RecordRentPaymentDto } from './dto/record-rent-payment.dto';
import { User } from '../users/entities/user.entity';
import { Landlord } from './entities/landlord.entity';
import { LandlordProperty } from './entities/landlord-property.entity';
import { TenancyAgreement } from './entities/tenancy-agreement.entity';
import { RentPayment } from './entities/rent-payment.entity';
import { MaintenanceRequest } from './entities/maintenance-request.entity';
import { PropertyInspection } from './entities/property-inspection.entity';
import { FinancialReport } from './entities/financial-report.entity';
import { LandlordDocument } from './entities/landlord-document.entity';

@ApiTags('landlords')
@Controller('landlords')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class LandlordsController {
  constructor(private readonly landlordsService: LandlordsService) {}

  // Landlord Management
  @Post()
  @Roles('admin', 'landlord')
  @ApiOperation({ summary: 'Create a new landlord profile' })
  @ApiResponse({ status: 201, description: 'Landlord created successfully', type: Landlord })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Landlord already exists' })
  async create(
    @Body() createLandlordDto: CreateLandlordDto,
    @GetUser() user: User,
  ): Promise<Landlord> {
    return this.landlordsService.create(createLandlordDto, user.id);
  }

  @Get()
  @Roles('admin')
  @ApiOperation({ summary: 'Get all landlords with pagination and filtering' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search term' })
  @ApiQuery({ name: 'status', required: false, type: String, description: 'Landlord status' })
  @ApiQuery({ name: 'type', required: false, type: String, description: 'Landlord type' })
  @ApiResponse({ status: 200, description: 'Landlords retrieved successfully' })
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('type') type?: string,
  ) {
    return this.landlordsService.findAll({
      page: Number(page),
      limit: Number(limit),
      search,
      status,
      type,
    });
  }

  @Get('profile')
  @Roles('landlord')
  @ApiOperation({ summary: 'Get current landlord profile' })
  @ApiResponse({ status: 200, description: 'Landlord profile retrieved successfully', type: Landlord })
  @ApiResponse({ status: 404, description: 'Landlord not found' })
  async getProfile(@GetUser() user: User): Promise<Landlord> {
    const landlords = await this.landlordsService.findByUserId(user.id);
    if (!landlords || landlords.length === 0) {
      throw new NotFoundException('Landlord profile not found');
    }
    return landlords[0];
  }

  @Get(':id')
  @Roles('admin', 'landlord')
  @ApiOperation({ summary: 'Get landlord by ID' })
  @ApiParam({ name: 'id', description: 'Landlord ID' })
  @ApiResponse({ status: 200, description: 'Landlord retrieved successfully', type: Landlord })
  @ApiResponse({ status: 404, description: 'Landlord not found' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: User,
  ): Promise<Landlord> {
    return this.landlordsService.findOne(id, user);
  }

  @Patch(':id')
  @Roles('admin', 'landlord')
  @ApiOperation({ summary: 'Update landlord profile' })
  @ApiParam({ name: 'id', description: 'Landlord ID' })
  @ApiResponse({ status: 200, description: 'Landlord updated successfully', type: Landlord })
  @ApiResponse({ status: 404, description: 'Landlord not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateLandlordDto: UpdateLandlordDto,
    @GetUser() user: User,
  ): Promise<Landlord> {
    return this.landlordsService.update(id, updateLandlordDto, user);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Delete landlord' })
  @ApiParam({ name: 'id', description: 'Landlord ID' })
  @ApiResponse({ status: 204, description: 'Landlord deleted successfully' })
  @ApiResponse({ status: 404, description: 'Landlord not found' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.landlordsService.remove(id);
  }

  // Property Management
  @Post(':id/properties')
  @Roles('admin', 'landlord')
  @ApiOperation({ summary: 'Add property to landlord portfolio' })
  @ApiParam({ name: 'id', description: 'Landlord ID' })
  @ApiResponse({ status: 201, description: 'Property added successfully', type: LandlordProperty })
  @ApiResponse({ status: 404, description: 'Landlord not found' })
  async addProperty(
    @Param('id', ParseUUIDPipe) landlordId: string,
    @Body() createPropertyDto: CreatePropertyDto,
    @GetUser() user: User,
  ): Promise<LandlordProperty> {
    return this.landlordsService.addProperty(landlordId, createPropertyDto, user);
  }

  @Get(':id/properties')
  @Roles('admin', 'landlord')
  @ApiOperation({ summary: 'Get landlord properties' })
  @ApiParam({ name: 'id', description: 'Landlord ID' })
  @ApiQuery({ name: 'status', required: false, type: String, description: 'Property status filter' })
  @ApiResponse({ status: 200, description: 'Properties retrieved successfully' })
  async getProperties(
    @Param('id', ParseUUIDPipe) landlordId: string,
    @GetUser() user: User,
    @Query('status') status?: string,
  ): Promise<LandlordProperty[]> {
    return this.landlordsService.getProperties(landlordId, user, status);
  }

  @Patch(':landlordId/properties/:propertyId')
  @Roles('admin', 'landlord')
  @ApiOperation({ summary: 'Update landlord property' })
  @ApiParam({ name: 'landlordId', description: 'Landlord ID' })
  @ApiParam({ name: 'propertyId', description: 'Property ID' })
  @ApiResponse({ status: 200, description: 'Property updated successfully', type: LandlordProperty })
  async updateProperty(
    @Param('landlordId', ParseUUIDPipe) landlordId: string,
    @Param('propertyId', ParseUUIDPipe) propertyId: string,
    @Body() updateData: Partial<CreatePropertyDto>,
    @GetUser() user: User,
  ): Promise<LandlordProperty> {
    return this.landlordsService.updateProperty(landlordId, propertyId, updateData, user);
  }

  // Tenancy Management
  @Post(':id/tenancies')
  @Roles('admin', 'landlord')
  @ApiOperation({ summary: 'Create new tenancy agreement' })
  @ApiParam({ name: 'id', description: 'Landlord ID' })
  @ApiResponse({ status: 201, description: 'Tenancy created successfully', type: TenancyAgreement })
  async createTenancy(
    @Param('id', ParseUUIDPipe) landlordId: string,
    @Body() createTenancyDto: CreateTenancyDto,
    @GetUser() user: User,
  ): Promise<TenancyAgreement> {
    return this.landlordsService.createTenancy(landlordId, createTenancyDto, user);
  }

  @Get(':id/tenancies')
  @Roles('admin', 'landlord')
  @ApiOperation({ summary: 'Get landlord tenancies' })
  @ApiParam({ name: 'id', description: 'Landlord ID' })
  @ApiQuery({ name: 'status', required: false, type: String, description: 'Tenancy status filter' })
  @ApiQuery({ name: 'propertyId', required: false, type: String, description: 'Property ID filter' })
  @ApiResponse({ status: 200, description: 'Tenancies retrieved successfully' })
  async getTenancies(
    @Param('id', ParseUUIDPipe) landlordId: string,
    @GetUser() user: User,
    @Query('status') status?: string,
    @Query('propertyId') propertyId?: string,
  ): Promise<TenancyAgreement[]> {
    return this.landlordsService.getTenancies(landlordId, user, { status, propertyId });
  }

  @Patch(':landlordId/tenancies/:tenancyId/end')
  @Roles('admin', 'landlord')
  @ApiOperation({ summary: 'End tenancy agreement' })
  @ApiParam({ name: 'landlordId', description: 'Landlord ID' })
  @ApiParam({ name: 'tenancyId', description: 'Tenancy ID' })
  @ApiResponse({ status: 200, description: 'Tenancy ended successfully', type: TenancyAgreement })
  async endTenancy(
    @Param('landlordId', ParseUUIDPipe) landlordId: string,
    @Param('tenancyId', ParseUUIDPipe) tenancyId: string,
    @Body() endData: { endDate: string; reason?: string; deposit?: any },
    @GetUser() user: User,
  ): Promise<TenancyAgreement> {
    return this.landlordsService.endTenancy(landlordId, tenancyId, endData, user);
  }

  // Rent Payment Management
  @Post(':id/rent-payments')
  @Roles('admin', 'landlord')
  @ApiOperation({ summary: 'Record rent payment' })
  @ApiParam({ name: 'id', description: 'Landlord ID' })
  @ApiResponse({ status: 201, description: 'Rent payment recorded successfully', type: RentPayment })
  async recordRentPayment(
    @Param('id', ParseUUIDPipe) landlordId: string,
    @Body() recordRentPaymentDto: RecordRentPaymentDto,
    @GetUser() user: User,
  ): Promise<RentPayment> {
    return this.landlordsService.recordRentPayment(landlordId, recordRentPaymentDto, user);
  }

  @Get(':id/rent-payments')
  @Roles('admin', 'landlord')
  @ApiOperation({ summary: 'Get rent payments' })
  @ApiParam({ name: 'id', description: 'Landlord ID' })
  @ApiQuery({ name: 'tenancyId', required: false, type: String, description: 'Tenancy ID filter' })
  @ApiQuery({ name: 'status', required: false, type: String, description: 'Payment status filter' })
  @ApiQuery({ name: 'fromDate', required: false, type: String, description: 'From date filter' })
  @ApiQuery({ name: 'toDate', required: false, type: String, description: 'To date filter' })
  @ApiResponse({ status: 200, description: 'Rent payments retrieved successfully' })
  async getRentPayments(
    @Param('id', ParseUUIDPipe) landlordId: string,
    @GetUser() user: User,
    @Query('tenancyId') tenancyId?: string,
    @Query('status') status?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ): Promise<RentPayment[]> {
    return this.landlordsService.getRentPayments(landlordId, user, {
      tenancyId,
      status: status as any,
      fromDate: fromDate ? new Date(fromDate) : undefined,
      toDate: toDate ? new Date(toDate) : undefined,
    });
  }

  // Maintenance Management
  @Post(':id/maintenance-requests')
  @Roles('admin', 'landlord', 'tenant')
  @ApiOperation({ summary: 'Create maintenance request' })
  @ApiParam({ name: 'id', description: 'Landlord ID' })
  @ApiResponse({ status: 201, description: 'Maintenance request created successfully', type: MaintenanceRequest })
  async createMaintenanceRequest(
    @Param('id', ParseUUIDPipe) landlordId: string,
    @Body() createMaintenanceRequestDto: CreateMaintenanceRequestDto,
    @GetUser() user: User,
  ): Promise<MaintenanceRequest> {
    return this.landlordsService.createMaintenanceRequest(landlordId, createMaintenanceRequestDto, user);
  }

  @Get(':id/maintenance-requests')
  @Roles('admin', 'landlord')
  @ApiOperation({ summary: 'Get maintenance requests' })
  @ApiParam({ name: 'id', description: 'Landlord ID' })
  @ApiQuery({ name: 'status', required: false, type: String, description: 'Request status filter' })
  @ApiQuery({ name: 'priority', required: false, type: String, description: 'Priority filter' })
  @ApiQuery({ name: 'propertyId', required: false, type: String, description: 'Property ID filter' })
  @ApiResponse({ status: 200, description: 'Maintenance requests retrieved successfully' })
  async getMaintenanceRequests(
    @Param('id', ParseUUIDPipe) landlordId: string,
    @GetUser() user: User,
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('propertyId') propertyId?: string,
  ): Promise<MaintenanceRequest[]> {
    return this.landlordsService.getMaintenanceRequests(landlordId, user, {
      status: status as any,
      priority: priority as any,
      propertyId,
    });
  }

  @Patch(':landlordId/maintenance-requests/:requestId')
  @Roles('admin', 'landlord')
  @ApiOperation({ summary: 'Update maintenance request' })
  @ApiParam({ name: 'landlordId', description: 'Landlord ID' })
  @ApiParam({ name: 'requestId', description: 'Maintenance request ID' })
  @ApiResponse({ status: 200, description: 'Maintenance request updated successfully', type: MaintenanceRequest })
  async updateMaintenanceRequest(
    @Param('landlordId', ParseUUIDPipe) landlordId: string,
    @Param('requestId', ParseUUIDPipe) requestId: string,
    @Body() updateData: any,
    @GetUser() user: User,
  ): Promise<MaintenanceRequest> {
    return this.landlordsService.updateMaintenanceRequest(landlordId, requestId, updateData, user);
  }

  // Property Inspection Management
  @Post(':id/inspections')
  @Roles('admin', 'landlord')
  @ApiOperation({ summary: 'Schedule property inspection' })
  @ApiParam({ name: 'id', description: 'Landlord ID' })
  @ApiResponse({ status: 201, description: 'Inspection scheduled successfully', type: PropertyInspection })
  async scheduleInspection(
    @Param('id', ParseUUIDPipe) landlordId: string,
    @Body() scheduleInspectionDto: ScheduleInspectionDto,
    @GetUser() user: User,
  ): Promise<PropertyInspection> {
    return this.landlordsService.scheduleInspection(landlordId, scheduleInspectionDto, user);
  }

  @Get(':id/inspections')
  @Roles('admin', 'landlord')
  @ApiOperation({ summary: 'Get property inspections' })
  @ApiParam({ name: 'id', description: 'Landlord ID' })
  @ApiQuery({ name: 'status', required: false, type: String, description: 'Inspection status filter' })
  @ApiQuery({ name: 'type', required: false, type: String, description: 'Inspection type filter' })
  @ApiQuery({ name: 'propertyId', required: false, type: String, description: 'Property ID filter' })
  @ApiResponse({ status: 200, description: 'Inspections retrieved successfully' })
  async getInspections(
    @Param('id', ParseUUIDPipe) landlordId: string,
    @GetUser() user: User,
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('propertyId') propertyId?: string,
  ): Promise<PropertyInspection[]> {
    return this.landlordsService.getInspections(landlordId, user, {
      status,
      type,
      propertyId,
    });
  }

  @Patch(':landlordId/inspections/:inspectionId/complete')
  @Roles('admin', 'landlord')
  @ApiOperation({ summary: 'Complete property inspection' })
  @ApiParam({ name: 'landlordId', description: 'Landlord ID' })
  @ApiParam({ name: 'inspectionId', description: 'Inspection ID' })
  @ApiResponse({ status: 200, description: 'Inspection completed successfully', type: PropertyInspection })
  async completeInspection(
    @Param('landlordId', ParseUUIDPipe) landlordId: string,
    @Param('inspectionId', ParseUUIDPipe) inspectionId: string,
    @Body() completionData: any,
    @GetUser() user: User,
  ): Promise<PropertyInspection> {
    return this.landlordsService.completeInspection(landlordId, inspectionId, completionData, user);
  }

  // Financial Reports
  @Post(':id/financial-reports')
  @Roles('admin', 'landlord')
  @ApiOperation({ summary: 'Generate financial report' })
  @ApiParam({ name: 'id', description: 'Landlord ID' })
  @ApiResponse({ status: 201, description: 'Financial report generated successfully', type: FinancialReport })
  async generateFinancialReport(
    @Param('id', ParseUUIDPipe) landlordId: string,
    @Body() reportConfig: any,
    @GetUser() user: User,
  ): Promise<FinancialReport> {
    return this.landlordsService.generateFinancialReport(landlordId, reportConfig, user);
  }

  @Get(':id/financial-reports')
  @Roles('admin', 'landlord')
  @ApiOperation({ summary: 'Get financial reports' })
  @ApiParam({ name: 'id', description: 'Landlord ID' })
  @ApiQuery({ name: 'type', required: false, type: String, description: 'Report type filter' })
  @ApiQuery({ name: 'status', required: false, type: String, description: 'Report status filter' })
  @ApiResponse({ status: 200, description: 'Financial reports retrieved successfully' })
  async getFinancialReports(
    @Param('id', ParseUUIDPipe) landlordId: string,
    @GetUser() user: User,
    @Query('type') type?: string,
    @Query('status') status?: string,
  ): Promise<FinancialReport[]> {
    return this.landlordsService.getFinancialReports(landlordId, user, { type, status });
  }

  @Get(':landlordId/financial-reports/:reportId/download')
  @Roles('admin', 'landlord')
  @ApiOperation({ summary: 'Download financial report' })
  @ApiParam({ name: 'landlordId', description: 'Landlord ID' })
  @ApiParam({ name: 'reportId', description: 'Report ID' })
  @ApiResponse({ status: 200, description: 'Report downloaded successfully' })
  async downloadFinancialReport(
    @Param('landlordId', ParseUUIDPipe) landlordId: string,
    @Param('reportId', ParseUUIDPipe) reportId: string,
    @GetUser() user: User,
  ) {
    return this.landlordsService.downloadFinancialReport(landlordId, reportId, user);
  }

  // Document Management
  @Post(':id/documents')
  @Roles('admin', 'landlord')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload landlord document' })
  @ApiParam({ name: 'id', description: 'Landlord ID' })
  @ApiResponse({ status: 201, description: 'Document uploaded successfully', type: LandlordDocument })
  async uploadDocument(
    @Param('id', ParseUUIDPipe) landlordId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() documentData: any,
    @GetUser() user: User,
  ): Promise<LandlordDocument> {
    return this.landlordsService.uploadDocument(landlordId, file, documentData, user);
  }

  @Get(':id/documents')
  @Roles('admin', 'landlord')
  @ApiOperation({ summary: 'Get landlord documents' })
  @ApiParam({ name: 'id', description: 'Landlord ID' })
  @ApiQuery({ name: 'type', required: false, type: String, description: 'Document type filter' })
  @ApiQuery({ name: 'category', required: false, type: String, description: 'Document category filter' })
  @ApiResponse({ status: 200, description: 'Documents retrieved successfully' })
  async getDocuments(
    @Param('id', ParseUUIDPipe) landlordId: string,
    @GetUser() user: User,
    @Query('type') type?: string,
    @Query('category') category?: string,
  ): Promise<LandlordDocument[]> {
    return this.landlordsService.getDocuments(landlordId, user, { type, category });
  }

  @Get(':landlordId/documents/:documentId/download')
  @Roles('admin', 'landlord')
  @ApiOperation({ summary: 'Download document' })
  @ApiParam({ name: 'landlordId', description: 'Landlord ID' })
  @ApiParam({ name: 'documentId', description: 'Document ID' })
  @ApiResponse({ status: 200, description: 'Document downloaded successfully' })
  async downloadDocument(
    @Param('landlordId', ParseUUIDPipe) landlordId: string,
    @Param('documentId', ParseUUIDPipe) documentId: string,
    @GetUser() user: User,
  ) {
    return this.landlordsService.downloadDocument(landlordId, documentId, user);
  }

  // Dashboard and Analytics
  @Get(':id/dashboard')
  @Roles('admin', 'landlord')
  @ApiOperation({ summary: 'Get landlord dashboard data' })
  @ApiParam({ name: 'id', description: 'Landlord ID' })
  @ApiResponse({ status: 200, description: 'Dashboard data retrieved successfully' })
  async getDashboardData(
    @Param('id', ParseUUIDPipe) landlordId: string,
    @GetUser() user: User,
  ) {
    return this.landlordsService.getDashboardData(landlordId, user);
  }

  @Get(':id/analytics')
  @Roles('admin', 'landlord')
  @ApiOperation({ summary: 'Get landlord analytics' })
  @ApiParam({ name: 'id', description: 'Landlord ID' })
  @ApiQuery({ name: 'period', required: false, type: String, description: 'Analytics period' })
  @ApiQuery({ name: 'metrics', required: false, type: String, description: 'Specific metrics to include' })
  @ApiResponse({ status: 200, description: 'Analytics data retrieved successfully' })
  async getAnalytics(
    @Param('id', ParseUUIDPipe) landlordId: string,
    @GetUser() user: User,
    @Query('period') period?: string,
    @Query('metrics') metrics?: string,
  ) {
    return this.landlordsService.getAnalytics(landlordId, user, { period, metrics });
  }

  @Get(':id/portfolio-summary')
  @Roles('admin', 'landlord')
  @ApiOperation({ summary: 'Get portfolio summary' })
  @ApiParam({ name: 'id', description: 'Landlord ID' })
  @ApiResponse({ status: 200, description: 'Portfolio summary retrieved successfully' })
  async getPortfolioSummary(
    @Param('id', ParseUUIDPipe) landlordId: string,
    @GetUser() user: User,
  ) {
    return this.landlordsService.getPortfolioSummary(landlordId, user);
  }

  @Get(':id/performance-metrics')
  @Roles('admin', 'landlord')
  @ApiOperation({ summary: 'Get performance metrics' })
  @ApiParam({ name: 'id', description: 'Landlord ID' })
  @ApiQuery({ name: 'period', required: false, type: String, description: 'Metrics period' })
  @ApiResponse({ status: 200, description: 'Performance metrics retrieved successfully' })
  async getPerformanceMetrics(
    @Param('id', ParseUUIDPipe) landlordId: string,
    @GetUser() user: User,
    @Query('period') period?: string,
  ) {
    return this.landlordsService.getPerformanceMetrics(landlordId, user, { period });
  }
}