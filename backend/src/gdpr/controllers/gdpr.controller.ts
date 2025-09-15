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
  ValidationPipe,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';
import {
  GdprService,
  CreateConsentDto,
  UpdateConsentDto,
  CreateDataProcessingActivityDto,
  UpdateDataProcessingActivityDto,
  CreateDataSubjectRequestDto,
  UpdateDataSubjectRequestDto,
  ConsentFilters,
  DataProcessingActivityFilters,
  DataSubjectRequestFilters,
} from '../services/gdpr.service';
import {
  Consent,
  ConsentType,
  ConsentStatus,
  ConsentMethod,
} from '../entities/consent.entity';
import {
  DataProcessingActivity,
  ProcessingPurpose,
  DataCategory,
  ProcessingActivity,
} from '../entities/data-processing-activity.entity';
import {
  DataSubjectRequest,
  RequestType,
  RequestStatus,
  RequestPriority,
  VerificationMethod,
  RejectionReason,
} from '../entities/data-subject-request.entity';
import { IsString, IsOptional, IsEnum, IsBoolean, IsArray, IsNumber, IsDateString, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

// Request DTOs
class CreateConsentRequestDto implements CreateConsentDto {
  @IsString()
  userId: string;

  @IsEnum(ConsentType)
  type: ConsentType;

  @IsEnum(ConsentStatus)
  status: ConsentStatus;

  @IsEnum(ConsentMethod)
  method: ConsentMethod;

  @IsString()
  purpose: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  legalBasis?: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: Date;

  @IsOptional()
  @IsString()
  ipAddress?: string;

  @IsOptional()
  @IsString()
  userAgent?: string;

  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  @IsString()
  policyVersion?: string;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  dataCategories?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  thirdParties?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  transferCountries?: string[];

  @IsOptional()
  @IsBoolean()
  requiresRenewal?: boolean;

  @IsOptional()
  @IsNumber()
  renewalIntervalDays?: number;

  @IsOptional()
  @IsObject()
  permissions?: Record<string, boolean>;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @IsOptional()
  @IsString()
  parentConsentId?: string;

  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;

  @IsOptional()
  @IsBoolean()
  canWithdraw?: boolean;

  @IsOptional()
  @IsBoolean()
  hasImpact?: boolean;

  @IsOptional()
  @IsString()
  impactDescription?: string;
}

class UpdateConsentRequestDto implements UpdateConsentDto {
  @IsOptional()
  @IsEnum(ConsentStatus)
  status?: ConsentStatus;

  @IsOptional()
  @IsString()
  withdrawalReason?: string;

  @IsOptional()
  @IsObject()
  permissions?: Record<string, boolean>;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

class CreateDataProcessingActivityRequestDto implements CreateDataProcessingActivityDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsEnum(ProcessingPurpose)
  purpose: ProcessingPurpose;

  @IsString()
  legalBasis: string;

  @IsOptional()
  @IsString()
  legalBasisDetails?: string;

  @IsArray()
  @IsString({ each: true })
  dataSubjectCategories: string[];

  @IsOptional()
  @IsString()
  dataSubjectDescription?: string;

  @IsOptional()
  @IsNumber()
  estimatedDataSubjects?: number;

  @IsArray()
  @IsEnum(DataCategory, { each: true })
  dataCategories: DataCategory[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  dataFields?: string[];

  @IsOptional()
  @IsBoolean()
  includesSpecialCategory?: boolean;

  @IsOptional()
  @IsString()
  specialCategoryDetails?: string;

  @IsOptional()
  @IsBoolean()
  includesCriminalData?: boolean;

  @IsArray()
  @IsEnum(ProcessingActivity, { each: true })
  activities: ProcessingActivity[];

  @IsOptional()
  @IsString()
  activitiesDescription?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  dataSources?: string[];

  @IsOptional()
  @IsBoolean()
  directCollection?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  thirdPartySources?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  recipientCategories?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  recipients?: string[];

  @IsOptional()
  @IsBoolean()
  internationalTransfer?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  transferCountries?: string[];

  @IsOptional()
  @IsString()
  transferSafeguards?: string;

  @IsOptional()
  @IsString()
  transferMechanism?: string;

  @IsOptional()
  @IsNumber()
  retentionPeriodMonths?: number;

  @IsOptional()
  @IsString()
  retentionCriteria?: string;

  @IsOptional()
  @IsString()
  deletionProcedures?: string;

  @IsOptional()
  @IsString()
  securityDescription?: string;

  @IsOptional()
  @IsNumber()
  riskLevel?: number;

  @IsOptional()
  @IsString()
  riskAssessment?: string;

  @IsOptional()
  @IsBoolean()
  dpiaRequired?: boolean;

  @IsOptional()
  @IsString()
  dpiaReference?: string;

  @IsOptional()
  @IsString()
  dataController?: string;

  @IsOptional()
  @IsString()
  dataProcessor?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  jointControllers?: string[];

  @IsOptional()
  @IsString()
  dpoContact?: string;

  @IsOptional()
  @IsNumber()
  reviewFrequencyMonths?: number;

  @IsOptional()
  @IsDateString()
  processingStartDate?: Date;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

class UpdateDataProcessingActivityRequestDto implements UpdateDataProcessingActivityDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(ProcessingPurpose)
  purpose?: ProcessingPurpose;

  @IsOptional()
  @IsString()
  legalBasis?: string;

  @IsOptional()
  @IsString()
  legalBasisDetails?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  dataSubjectCategories?: string[];

  @IsOptional()
  @IsString()
  dataSubjectDescription?: string;

  @IsOptional()
  @IsNumber()
  estimatedDataSubjects?: number;

  @IsOptional()
  @IsArray()
  @IsEnum(DataCategory, { each: true })
  dataCategories?: DataCategory[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  dataFields?: string[];

  @IsOptional()
  @IsBoolean()
  includesSpecialCategory?: boolean;

  @IsOptional()
  @IsString()
  specialCategoryDetails?: string;

  @IsOptional()
  @IsBoolean()
  includesCriminalData?: boolean;

  @IsOptional()
  @IsArray()
  @IsEnum(ProcessingActivity, { each: true })
  activities?: ProcessingActivity[];

  @IsOptional()
  @IsString()
  activitiesDescription?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  dataSources?: string[];

  @IsOptional()
  @IsBoolean()
  directCollection?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  thirdPartySources?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  recipientCategories?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  recipients?: string[];

  @IsOptional()
  @IsBoolean()
  internationalTransfer?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  transferCountries?: string[];

  @IsOptional()
  @IsString()
  transferSafeguards?: string;

  @IsOptional()
  @IsString()
  transferMechanism?: string;

  @IsOptional()
  @IsNumber()
  retentionPeriodMonths?: number;

  @IsOptional()
  @IsString()
  retentionCriteria?: string;

  @IsOptional()
  @IsString()
  deletionProcedures?: string;

  @IsOptional()
  @IsString()
  securityDescription?: string;

  @IsOptional()
  @IsNumber()
  riskLevel?: number;

  @IsOptional()
  @IsString()
  riskAssessment?: string;

  @IsOptional()
  @IsBoolean()
  dpiaRequired?: boolean;

  @IsOptional()
  @IsString()
  dpiaReference?: string;

  @IsOptional()
  @IsString()
  dataController?: string;

  @IsOptional()
  @IsString()
  dataProcessor?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  jointControllers?: string[];

  @IsOptional()
  @IsString()
  dpoContact?: string;

  @IsOptional()
  @IsNumber()
  reviewFrequencyMonths?: number;

  @IsOptional()
  @IsDateString()
  processingStartDate?: Date;

  @IsOptional()
  @IsDateString()
  processingEndDate?: Date;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  reviewNotes?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

class CreateDataSubjectRequestRequestDto implements CreateDataSubjectRequestDto {
  @IsEnum(RequestType)
  type: RequestType;

  @IsOptional()
  @IsEnum(RequestPriority)
  priority?: RequestPriority;

  @IsOptional()
  @IsString()
  requesterId?: string;

  @IsString()
  requesterName: string;

  @IsString()
  requesterEmail: string;

  @IsOptional()
  @IsString()
  requesterPhone?: string;

  @IsOptional()
  @IsString()
  requesterAddress?: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: Date;

  @IsOptional()
  @IsString()
  identificationInfo?: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  dataCategories?: string[];

  @IsOptional()
  @IsString()
  timePeriod?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  systemsInvolved?: string[];

  @IsOptional()
  @IsString()
  preferredFormat?: string;

  @IsOptional()
  @IsString()
  deliveryMethod?: string;

  @IsOptional()
  @IsString()
  legalBasis?: string;

  @IsOptional()
  @IsString()
  justification?: string;

  @IsOptional()
  @IsString()
  receivedVia?: string;

  @IsOptional()
  @IsString()
  ipAddress?: string;

  @IsOptional()
  @IsString()
  userAgent?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

class UpdateDataSubjectRequestRequestDto implements UpdateDataSubjectRequestDto {
  @IsOptional()
  @IsEnum(RequestStatus)
  status?: RequestStatus;

  @IsOptional()
  @IsEnum(RequestPriority)
  priority?: RequestPriority;

  @IsOptional()
  @IsString()
  assignedToId?: string;

  @IsOptional()
  @IsString()
  responsibleDepartment?: string;

  @IsOptional()
  @IsString()
  response?: string;

  @IsOptional()
  @IsString()
  actionsTaken?: string;

  @IsOptional()
  @IsString()
  dataProvided?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[];

  @IsOptional()
  @IsBoolean()
  isRejected?: boolean;

  @IsOptional()
  @IsEnum(RejectionReason)
  rejectionReason?: RejectionReason;

  @IsOptional()
  @IsString()
  rejectionExplanation?: string;

  @IsOptional()
  @IsBoolean()
  feeCharged?: boolean;

  @IsOptional()
  @IsNumber()
  feeAmount?: number;

  @IsOptional()
  @IsString()
  feeCurrency?: string;

  @IsOptional()
  @IsString()
  feeJustification?: string;

  @IsOptional()
  @IsBoolean()
  feePaid?: boolean;

  @IsOptional()
  @IsBoolean()
  isEscalated?: boolean;

  @IsOptional()
  @IsString()
  escalationReason?: string;

  @IsOptional()
  @IsBoolean()
  hasAppeal?: boolean;

  @IsOptional()
  @IsString()
  appealDetails?: string;

  @IsOptional()
  @IsString()
  complianceNotes?: string;

  @IsOptional()
  @IsString()
  riskAssessment?: string;

  @IsOptional()
  @IsString()
  businessImpact?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

class VerifyIdentityRequestDto {
  @IsEnum(VerificationMethod)
  verificationMethod: VerificationMethod;

  @IsString()
  verifiedBy: string;

  @IsOptional()
  @IsString()
  verificationNotes?: string;
}

@ApiTags('GDPR')
@Controller('gdpr')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class GdprController {
  constructor(private readonly gdprService: GdprService) {}

  // Consent Management Endpoints
  @Post('consents')
  @Roles(UserRole.ADMIN, UserRole.PROPERTY_MANAGER, UserRole.TENANT)
  @ApiOperation({ summary: 'Create a new consent record' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Consent created successfully',
    type: Consent,
  })
  @ApiBody({ type: CreateConsentRequestDto })
  async createConsent(
    @Request() req: any,
    @Body(ValidationPipe) createConsentDto: CreateConsentRequestDto,
  ): Promise<Consent> {
    return await this.gdprService.createConsent(
      req.user.tenantOrganizationId,
      createConsentDto,
    );
  }

  @Get('consents')
  @Roles(UserRole.ADMIN, UserRole.PROPERTY_MANAGER)
  @ApiOperation({ summary: 'Get all consents with filtering and pagination' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Consents retrieved successfully',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'userId', required: false, type: String })
  @ApiQuery({ name: 'type', required: false, enum: ConsentType })
  @ApiQuery({ name: 'status', required: false, enum: ConsentStatus })
  @ApiQuery({ name: 'method', required: false, enum: ConsentMethod })
  async getConsents(
    @Request() req: any,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
    @Query('userId') userId?: string,
    @Query('type') type?: ConsentType,
    @Query('status') status?: ConsentStatus,
    @Query('method') method?: ConsentMethod,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
    @Query('requiresRenewal') requiresRenewal?: boolean,
    @Query('isRequired') isRequired?: boolean,
    @Query('canWithdraw') canWithdraw?: boolean,
  ) {
    const filters: ConsentFilters = {
      userId,
      type,
      status,
      method,
      fromDate: fromDate ? new Date(fromDate) : undefined,
      toDate: toDate ? new Date(toDate) : undefined,
      requiresRenewal,
      isRequired,
      canWithdraw,
    };

    return await this.gdprService.getConsents(
      req.user.tenantOrganizationId,
      filters,
      page,
      limit,
    );
  }

  @Get('consents/:id')
  @Roles(UserRole.ADMIN, UserRole.PROPERTY_MANAGER, UserRole.TENANT)
  @ApiOperation({ summary: 'Get consent by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Consent retrieved successfully',
    type: Consent,
  })
  @ApiParam({ name: 'id', type: 'string' })
  async getConsentById(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<Consent> {
    return await this.gdprService.getConsentById(
      req.user.tenantOrganizationId,
      id,
    );
  }

  @Put('consents/:id')
  @Roles(UserRole.ADMIN, UserRole.PROPERTY_MANAGER, UserRole.TENANT)
  @ApiOperation({ summary: 'Update consent' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Consent updated successfully',
    type: Consent,
  })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBody({ type: UpdateConsentRequestDto })
  async updateConsent(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateConsentDto: UpdateConsentRequestDto,
  ): Promise<Consent> {
    return await this.gdprService.updateConsent(
      req.user.tenantOrganizationId,
      id,
      updateConsentDto,
    );
  }

  @Post('consents/:id/withdraw')
  @Roles(UserRole.ADMIN, UserRole.PROPERTY_MANAGER, UserRole.TENANT)
  @ApiOperation({ summary: 'Withdraw consent' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Consent withdrawn successfully',
    type: Consent,
  })
  @ApiParam({ name: 'id', type: 'string' })
  async withdrawConsent(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body('withdrawalReason') withdrawalReason?: string,
  ): Promise<Consent> {
    return await this.gdprService.withdrawConsent(
      req.user.tenantOrganizationId,
      id,
      withdrawalReason,
    );
  }

  @Get('users/:userId/consents')
  @Roles(UserRole.ADMIN, UserRole.PROPERTY_MANAGER, UserRole.TENANT)
  @ApiOperation({ summary: 'Get all consents for a specific user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User consents retrieved successfully',
    type: [Consent],
  })
  @ApiParam({ name: 'userId', type: 'string' })
  async getUserConsents(
    @Request() req: any,
    @Param('userId', ParseUUIDPipe) userId: string,
  ): Promise<Consent[]> {
    return await this.gdprService.getUserConsents(
      req.user.tenantOrganizationId,
      userId,
    );
  }

  // Data Processing Activities Endpoints
  @Post('data-processing-activities')
  @Roles(UserRole.ADMIN, UserRole.PROPERTY_MANAGER)
  @ApiOperation({ summary: 'Create a new data processing activity' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Data processing activity created successfully',
    type: DataProcessingActivity,
  })
  @ApiBody({ type: CreateDataProcessingActivityRequestDto })
  async createDataProcessingActivity(
    @Request() req: any,
    @Body(ValidationPipe) createDto: CreateDataProcessingActivityRequestDto,
  ): Promise<DataProcessingActivity> {
    return await this.gdprService.createDataProcessingActivity(
      req.user.tenantOrganizationId,
      createDto,
    );
  }

  @Get('data-processing-activities')
  @Roles(UserRole.ADMIN, UserRole.PROPERTY_MANAGER)
  @ApiOperation({ summary: 'Get all data processing activities with filtering and pagination' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Data processing activities retrieved successfully',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'purpose', required: false, enum: ProcessingPurpose })
  @ApiQuery({ name: 'includesSpecialCategory', required: false, type: Boolean })
  @ApiQuery({ name: 'internationalTransfer', required: false, type: Boolean })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'riskLevel', required: false, type: Number })
  @ApiQuery({ name: 'dpiaRequired', required: false, type: Boolean })
  @ApiQuery({ name: 'reviewDue', required: false, type: Boolean })
  async getDataProcessingActivities(
    @Request() req: any,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
    @Query('purpose') purpose?: ProcessingPurpose,
    @Query('includesSpecialCategory') includesSpecialCategory?: boolean,
    @Query('internationalTransfer') internationalTransfer?: boolean,
    @Query('isActive') isActive?: boolean,
    @Query('riskLevel') riskLevel?: number,
    @Query('dpiaRequired') dpiaRequired?: boolean,
    @Query('reviewDue') reviewDue?: boolean,
  ) {
    const filters: DataProcessingActivityFilters = {
      purpose,
      includesSpecialCategory,
      internationalTransfer,
      isActive,
      riskLevel,
      dpiaRequired,
      reviewDue,
    };

    return await this.gdprService.getDataProcessingActivities(
      req.user.tenantOrganizationId,
      filters,
      page,
      limit,
    );
  }

  @Get('data-processing-activities/:id')
  @Roles(UserRole.ADMIN, UserRole.PROPERTY_MANAGER)
  @ApiOperation({ summary: 'Get data processing activity by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Data processing activity retrieved successfully',
    type: DataProcessingActivity,
  })
  @ApiParam({ name: 'id', type: 'string' })
  async getDataProcessingActivityById(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<DataProcessingActivity> {
    return await this.gdprService.getDataProcessingActivityById(
      req.user.tenantOrganizationId,
      id,
    );
  }

  @Put('data-processing-activities/:id')
  @Roles(UserRole.ADMIN, UserRole.PROPERTY_MANAGER)
  @ApiOperation({ summary: 'Update data processing activity' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Data processing activity updated successfully',
    type: DataProcessingActivity,
  })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBody({ type: UpdateDataProcessingActivityRequestDto })
  async updateDataProcessingActivity(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateDto: UpdateDataProcessingActivityRequestDto,
  ): Promise<DataProcessingActivity> {
    return await this.gdprService.updateDataProcessingActivity(
      req.user.tenantOrganizationId,
      id,
      updateDto,
    );
  }

  @Delete('data-processing-activities/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete data processing activity' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Data processing activity deleted successfully',
  })
  @ApiParam({ name: 'id', type: 'string' })
  async deleteDataProcessingActivity(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    return await this.gdprService.deleteDataProcessingActivity(
      req.user.tenantOrganizationId,
      id,
    );
  }

  // Data Subject Requests Endpoints
  @Post('data-subject-requests')
  @Roles(UserRole.ADMIN, UserRole.PROPERTY_MANAGER, UserRole.TENANT)
  @ApiOperation({ summary: 'Create a new data subject request' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Data subject request created successfully',
    type: DataSubjectRequest,
  })
  @ApiBody({ type: CreateDataSubjectRequestRequestDto })
  async createDataSubjectRequest(
    @Request() req: any,
    @Body(ValidationPipe) createDto: CreateDataSubjectRequestRequestDto,
  ): Promise<DataSubjectRequest> {
    return await this.gdprService.createDataSubjectRequest(
      req.user.tenantOrganizationId,
      createDto,
    );
  }

  @Get('data-subject-requests')
  @Roles(UserRole.ADMIN, UserRole.PROPERTY_MANAGER)
  @ApiOperation({ summary: 'Get all data subject requests with filtering and pagination' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Data subject requests retrieved successfully',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'type', required: false, enum: RequestType })
  @ApiQuery({ name: 'status', required: false, enum: RequestStatus })
  @ApiQuery({ name: 'priority', required: false, enum: RequestPriority })
  @ApiQuery({ name: 'requesterId', required: false, type: String })
  @ApiQuery({ name: 'assignedToId', required: false, type: String })
  @ApiQuery({ name: 'requesterEmail', required: false, type: String })
  @ApiQuery({ name: 'isOverdue', required: false, type: Boolean })
  @ApiQuery({ name: 'isEscalated', required: false, type: Boolean })
  @ApiQuery({ name: 'hasAppeal', required: false, type: Boolean })
  async getDataSubjectRequests(
    @Request() req: any,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
    @Query('type') type?: RequestType,
    @Query('status') status?: RequestStatus,
    @Query('priority') priority?: RequestPriority,
    @Query('requesterId') requesterId?: string,
    @Query('assignedToId') assignedToId?: string,
    @Query('requesterEmail') requesterEmail?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
    @Query('isOverdue') isOverdue?: boolean,
    @Query('isEscalated') isEscalated?: boolean,
    @Query('hasAppeal') hasAppeal?: boolean,
  ) {
    const filters: DataSubjectRequestFilters = {
      type,
      status,
      priority,
      requesterId,
      assignedToId,
      requesterEmail,
      fromDate: fromDate ? new Date(fromDate) : undefined,
      toDate: toDate ? new Date(toDate) : undefined,
      isOverdue,
      isEscalated,
      hasAppeal,
    };

    return await this.gdprService.getDataSubjectRequests(
      req.user.tenantOrganizationId,
      filters,
      page,
      limit,
    );
  }

  @Get('data-subject-requests/:id')
  @Roles(UserRole.ADMIN, UserRole.PROPERTY_MANAGER)
  @ApiOperation({ summary: 'Get data subject request by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Data subject request retrieved successfully',
    type: DataSubjectRequest,
  })
  @ApiParam({ name: 'id', type: 'string' })
  async getDataSubjectRequestById(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<DataSubjectRequest> {
    return await this.gdprService.getDataSubjectRequestById(
      req.user.tenantOrganizationId,
      id,
    );
  }

  @Put('data-subject-requests/:id')
  @Roles(UserRole.ADMIN, UserRole.PROPERTY_MANAGER)
  @ApiOperation({ summary: 'Update data subject request' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Data subject request updated successfully',
    type: DataSubjectRequest,
  })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBody({ type: UpdateDataSubjectRequestRequestDto })
  async updateDataSubjectRequest(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateDto: UpdateDataSubjectRequestRequestDto,
  ): Promise<DataSubjectRequest> {
    return await this.gdprService.updateDataSubjectRequest(
      req.user.tenantOrganizationId,
      id,
      updateDto,
    );
  }

  @Post('data-subject-requests/:id/verify-identity')
  @Roles(UserRole.ADMIN, UserRole.PROPERTY_MANAGER)
  @ApiOperation({ summary: 'Verify data subject identity' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Identity verified successfully',
    type: DataSubjectRequest,
  })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBody({ type: VerifyIdentityRequestDto })
  async verifyDataSubjectIdentity(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) verifyDto: VerifyIdentityRequestDto,
  ): Promise<DataSubjectRequest> {
    return await this.gdprService.verifyDataSubjectIdentity(
      req.user.tenantOrganizationId,
      id,
      verifyDto.verificationMethod,
      verifyDto.verifiedBy,
      verifyDto.verificationNotes,
    );
  }

  @Delete('data-subject-requests/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete data subject request' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Data subject request deleted successfully',
  })
  @ApiParam({ name: 'id', type: 'string' })
  async deleteDataSubjectRequest(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    return await this.gdprService.deleteDataSubjectRequest(
      req.user.tenantOrganizationId,
      id,
    );
  }

  // Dashboard and Statistics
  @Get('dashboard/stats')
  @Roles(UserRole.ADMIN, UserRole.PROPERTY_MANAGER)
  @ApiOperation({ summary: 'Get GDPR dashboard statistics' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'GDPR dashboard statistics retrieved successfully',
  })
  async getGdprDashboardStats(@Request() req: any) {
    return await this.gdprService.getGdprDashboardStats(
      req.user.tenantOrganizationId,
    );
  }
}