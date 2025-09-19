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
  HttpStatus,
  HttpCode,
  ParseUUIDPipe,
  ValidationPipe,
  UsePipes,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiProperty ,
  getSchemaPath,} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';
import {
  MaintenanceService,
  CreateMaintenanceRequestDto,
  UpdateMaintenanceRequestDto,
  CreateMaintenanceScheduleDto,
  UpdateMaintenanceScheduleDto,
  MaintenanceRequestFilters,
  MaintenanceScheduleFilters,
  PaginationOptions,
} from '../services/maintenance.service';
import {
  MaintenanceRequest,
  MaintenanceRequestType,
  MaintenanceRequestStatus,
  MaintenanceRequestPriority,
  MaintenanceRequestCategory,
  MaintenanceRequestSource,
} from '../entities/maintenance-request.entity';
import {
  MaintenanceSchedule,
  MaintenanceScheduleType,
  MaintenanceScheduleStatus,
  MaintenanceScheduleFrequency,
  MaintenanceSchedulePriority,
} from '../entities/maintenance-schedule.entity';
import { IsString, IsOptional, IsNumber, IsEnum, IsBoolean, IsDateString, IsObject, IsArray, Min, Max } from 'class-validator';
import { Type, Transform } from 'class-transformer';

// Request DTOs
class CreateMaintenanceRequestRequestDto {
  @IsString()
  @ApiProperty({ description: 'Maintenance request title' })
  title: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Detailed description of the issue', required: false })
  description?: string;

  @IsEnum(MaintenanceRequestType)
  @ApiProperty({ enum: MaintenanceRequestType, description: 'Type of maintenance' })
  type: MaintenanceRequestType;

  @IsEnum(MaintenanceRequestCategory)
  @ApiProperty({ enum: MaintenanceRequestCategory, description: 'Maintenance category' })
  category: MaintenanceRequestCategory;

  @IsEnum(MaintenanceRequestPriority)
  @ApiProperty({ enum: MaintenanceRequestPriority, description: 'Priority level' })
  priority: MaintenanceRequestPriority;

  @IsString()
  @ApiProperty({ description: 'Property ID' })
  propertyId: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Unit/room identifier', required: false })
  unitId?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Tenant who reported the issue', required: false })
  reportedBy?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Assigned contractor/technician', required: false })
  assignedTo?: string;

  @IsOptional()
  @IsDateString()
  @ApiProperty({ description: 'Preferred start date', required: false })
  preferredStartDate?: string;

  @IsOptional()
  @IsDateString()
  @ApiProperty({ description: 'Preferred completion date', required: false })
  preferredCompletionDate?: string;

  @IsOptional()
  @IsDateString()
  @ApiProperty({ description: 'Scheduled start date', required: false })
  scheduledDate?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @ApiProperty({ description: 'Estimated cost in pence', required: false })
  estimatedCost?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @ApiProperty({ description: 'Actual cost in pence', required: false })
  actualCost?: number;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Location within property', required: false })
  location?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Contact name', required: false })
  contactName?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Contact phone', required: false })
  contactPhone?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Contact email', required: false })
  contactEmail?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Access instructions', required: false })
  accessInstructions?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Special requirements', required: false })
  specialRequirements?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ApiProperty({ description: 'Photo URLs', required: false })
  photos?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ApiProperty({ description: 'Document URLs', required: false })
  documents?: string[];

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Internal notes', required: false })
  internalNotes?: string;

  @IsOptional()
  @IsObject()
  @ApiProperty({ description: 'Additional metadata', required: false })
  metadata?: Record<string, any>;

  @IsOptional()
  @IsObject()
  @ApiProperty({ description: 'Custom fields', required: false })
  customFields?: Record<string, any>;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ApiProperty({ description: 'Tags', required: false })
  tags?: string[];
}

class UpdateMaintenanceRequestRequestDto {
  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Maintenance request title', required: false })
  title?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Detailed description of the issue', required: false })
  description?: string;

  @IsOptional()
  @IsEnum(MaintenanceRequestType)
  @ApiProperty({ enum: MaintenanceRequestType, description: 'Type of maintenance', required: false })
  type?: MaintenanceRequestType;

  @IsOptional()
  @IsEnum(MaintenanceRequestCategory)
  @ApiProperty({ enum: MaintenanceRequestCategory, description: 'Maintenance category', required: false })
  category?: MaintenanceRequestCategory;

  @IsOptional()
  @IsEnum(MaintenanceRequestPriority)
  @ApiProperty({ enum: MaintenanceRequestPriority, description: 'Priority level', required: false })
  priority?: MaintenanceRequestPriority;

  @IsOptional()
  @IsEnum(MaintenanceRequestStatus)
  @ApiProperty({ enum: MaintenanceRequestStatus, description: 'Request status', required: false })
  status?: MaintenanceRequestStatus;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Assigned contractor/technician', required: false })
  assignedTo?: string;

  @IsOptional()
  @IsDateString()
  @ApiProperty({ description: 'Preferred start date', required: false })
  preferredStartDate?: string;

  @IsOptional()
  @IsDateString()
  @ApiProperty({ description: 'Preferred completion date', required: false })
  preferredCompletionDate?: string;

  @IsOptional()
  @IsDateString()
  @ApiProperty({ description: 'Scheduled start date', required: false })
  scheduledDate?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @ApiProperty({ description: 'Estimated cost in pence', required: false })
  estimatedCost?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @ApiProperty({ description: 'Actual cost in pence', required: false })
  actualCost?: number;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Location within property', required: false })
  location?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Contact name', required: false })
  contactName?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Contact phone', required: false })
  contactPhone?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Contact email', required: false })
  contactEmail?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Access instructions', required: false })
  accessInstructions?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Special requirements', required: false })
  specialRequirements?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ApiProperty({ description: 'Photo URLs', required: false })
  photos?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ApiProperty({ description: 'Document URLs', required: false })
  documents?: string[];

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Internal notes', required: false })
  internalNotes?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Completion notes', required: false })
  completionNotes?: string;

  @IsOptional()
  @IsObject()
  @ApiProperty({ description: 'Additional metadata', required: false })
  metadata?: Record<string, any>;

  @IsOptional()
  @IsObject()
  @ApiProperty({ description: 'Custom fields', required: false })
  customFields?: Record<string, any>;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ApiProperty({ description: 'Tags', required: false })
  tags?: string[];
}

class CreateMaintenanceScheduleRequestDto {
  @IsString()
  @ApiProperty({ description: 'Schedule title' })
  title: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Schedule description', required: false })
  description?: string;

  @IsEnum(MaintenanceScheduleType)
  @ApiProperty({ enum: MaintenanceScheduleType, description: 'Type of maintenance' })
  type: MaintenanceScheduleType;

  @IsEnum(MaintenanceRequestCategory)
  @ApiProperty({ enum: MaintenanceRequestCategory, description: 'Maintenance category' })
  category: MaintenanceRequestCategory;

  @IsEnum(MaintenanceSchedulePriority)
  @ApiProperty({ enum: MaintenanceSchedulePriority, description: 'Priority level' })
  priority: MaintenanceSchedulePriority;

  @IsEnum(MaintenanceScheduleFrequency)
  @ApiProperty({ enum: MaintenanceScheduleFrequency, description: 'Schedule frequency' })
  frequency: MaintenanceScheduleFrequency;

  @IsString()
  @ApiProperty({ description: 'Property ID' })
  propertyId: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Unit/room identifier', required: false })
  unitId?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Assigned contractor/technician', required: false })
  assignedTo?: string;

  @IsDateString()
  @ApiProperty({ description: 'Schedule start date' })
  startDate: string;

  @IsOptional()
  @IsDateString()
  @ApiProperty({ description: 'Schedule end date', required: false })
  endDate?: string;

  @IsOptional()
  @IsDateString()
  @ApiProperty({ description: 'Next scheduled date', required: false })
  nextScheduledDate?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @ApiProperty({ description: 'Estimated cost per occurrence in pence', required: false })
  estimatedCost?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @ApiProperty({ description: 'Estimated duration in minutes', required: false })
  estimatedDuration?: number;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Location within property', required: false })
  location?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Special requirements', required: false })
  specialRequirements?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ApiProperty({ description: 'Required materials/tools', required: false })
  requiredMaterials?: string[];

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Instructions for maintenance', required: false })
  instructions?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Internal notes', required: false })
  internalNotes?: string;

  @IsOptional()
  @IsObject()
  @ApiProperty({ description: 'Additional metadata', required: false })
  metadata?: Record<string, any>;

  @IsOptional()
  @IsObject()
  @ApiProperty({ description: 'Custom fields', required: false })
  customFields?: Record<string, any>;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ApiProperty({ description: 'Tags', required: false })
  tags?: string[];
}

class UpdateMaintenanceScheduleRequestDto {
  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Schedule title', required: false })
  title?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Schedule description', required: false })
  description?: string;

  @IsOptional()
  @IsEnum(MaintenanceScheduleType)
  @ApiProperty({ enum: MaintenanceScheduleType, description: 'Type of maintenance', required: false })
  type?: MaintenanceScheduleType;

  @IsOptional()
  @IsEnum(MaintenanceRequestCategory)
  @ApiProperty({ enum: MaintenanceRequestCategory, description: 'Maintenance category', required: false })
  category?: MaintenanceRequestCategory;

  @IsOptional()
  @IsEnum(MaintenanceSchedulePriority)
  @ApiProperty({ enum: MaintenanceSchedulePriority, description: 'Priority level', required: false })
  priority?: MaintenanceSchedulePriority;

  @IsOptional()
  @IsEnum(MaintenanceScheduleStatus)
  @ApiProperty({ enum: MaintenanceScheduleStatus, description: 'Schedule status', required: false })
  status?: MaintenanceScheduleStatus;

  @IsOptional()
  @IsEnum(MaintenanceScheduleFrequency)
  @ApiProperty({ enum: MaintenanceScheduleFrequency, description: 'Schedule frequency', required: false })
  frequency?: MaintenanceScheduleFrequency;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Assigned contractor/technician', required: false })
  assignedTo?: string;

  @IsOptional()
  @IsDateString()
  @ApiProperty({ description: 'Schedule start date', required: false })
  startDate?: string;

  @IsOptional()
  @IsDateString()
  @ApiProperty({ description: 'Schedule end date', required: false })
  endDate?: string;

  @IsOptional()
  @IsDateString()
  @ApiProperty({ description: 'Next scheduled date', required: false })
  nextScheduledDate?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @ApiProperty({ description: 'Estimated cost per occurrence in pence', required: false })
  estimatedCost?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @ApiProperty({ description: 'Estimated duration in minutes', required: false })
  estimatedDuration?: number;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Location within property', required: false })
  location?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Special requirements', required: false })
  specialRequirements?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ApiProperty({ description: 'Required materials/tools', required: false })
  requiredMaterials?: string[];

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Instructions for maintenance', required: false })
  instructions?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Internal notes', required: false })
  internalNotes?: string;

  @IsOptional()
  @IsObject()
  @ApiProperty({ description: 'Additional metadata', required: false })
  metadata?: Record<string, any>;

  @IsOptional()
  @IsObject()
  @ApiProperty({ description: 'Custom fields', required: false })
  customFields?: Record<string, any>;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ApiProperty({ description: 'Tags', required: false })
  tags?: string[];
}

class MaintenanceRequestQueryDto {
  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Property ID filter', required: false })
  propertyId?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Unit ID filter', required: false })
  unitId?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Reported by user ID filter', required: false })
  reportedBy?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Assigned to user ID filter', required: false })
  assignedTo?: string;

  @IsOptional()
  @IsEnum(MaintenanceRequestStatus)
  @ApiProperty({ enum: MaintenanceRequestStatus, description: 'Status filter', required: false })
  status?: MaintenanceRequestStatus;

  @IsOptional()
  @IsEnum(MaintenanceRequestPriority)
  @ApiProperty({ enum: MaintenanceRequestPriority, description: 'Priority filter', required: false })
  priority?: MaintenanceRequestPriority;

  @IsOptional()
  @IsEnum(MaintenanceRequestType)
  @ApiProperty({ enum: MaintenanceRequestType, description: 'Type filter', required: false })
  type?: MaintenanceRequestType;

  @IsOptional()
  @IsEnum(MaintenanceRequestCategory)
  @ApiProperty({ enum: MaintenanceRequestCategory, description: 'Category filter', required: false })
  category?: MaintenanceRequestCategory;

  @IsOptional()
  @IsDateString()
  @ApiProperty({ description: 'Start date filter', required: false })
  startDate?: string;

  @IsOptional()
  @IsDateString()
  @ApiProperty({ description: 'End date filter', required: false })
  endDate?: string;

  @IsOptional()
  @IsDateString()
  @ApiProperty({ description: 'Scheduled date start filter', required: false })
  scheduledDateStart?: string;

  @IsOptional()
  @IsDateString()
  @ApiProperty({ description: 'Scheduled date end filter', required: false })
  scheduledDateEnd?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseInt(value))
  @ApiProperty({ description: 'Minimum cost filter', required: false })
  minCost?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseInt(value))
  @ApiProperty({ description: 'Maximum cost filter', required: false })
  maxCost?: number;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  @ApiProperty({ description: 'Emergency requests filter', required: false })
  isEmergency?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  @ApiProperty({ description: 'Warranty work filter', required: false })
  isWarrantyWork?: boolean;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Search query', required: false })
  search?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Transform(({ value }) => parseInt(value))
  @ApiProperty({ description: 'Page number', default: 1, required: false })
  page?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Transform(({ value }) => parseInt(value))
  @ApiProperty({ description: 'Items per page', default: 10, required: false })
  limit?: number;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Sort field', default: 'createdAt', required: false })
  sortBy?: string;

  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  @ApiProperty({ enum: ['ASC', 'DESC'], description: 'Sort order', default: 'DESC', required: false })
  sortOrder?: 'ASC' | 'DESC';
}

class MaintenanceScheduleQueryDto {
  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Property ID filter', required: false })
  propertyId?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Unit ID filter', required: false })
  unitId?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Assigned to user ID filter', required: false })
  assignedTo?: string;

  @IsOptional()
  @IsEnum(MaintenanceScheduleStatus)
  @ApiProperty({ enum: MaintenanceScheduleStatus, description: 'Status filter', required: false })
  status?: MaintenanceScheduleStatus;

  @IsOptional()
  @IsEnum(MaintenanceScheduleType)
  @ApiProperty({ enum: MaintenanceScheduleType, description: 'Type filter', required: false })
  type?: MaintenanceScheduleType;

  @IsOptional()
  @IsEnum(MaintenanceRequestCategory)
  @ApiProperty({ enum: MaintenanceRequestCategory, description: 'Category filter', required: false })
  category?: MaintenanceRequestCategory;

  @IsOptional()
  @IsEnum(MaintenanceScheduleFrequency)
  @ApiProperty({ enum: MaintenanceScheduleFrequency, description: 'Frequency filter', required: false })
  frequency?: MaintenanceScheduleFrequency;

  @IsOptional()
  @IsDateString()
  @ApiProperty({ description: 'Start date filter', required: false })
  startDate?: string;

  @IsOptional()
  @IsDateString()
  @ApiProperty({ description: 'End date filter', required: false })
  endDate?: string;

  @IsOptional()
  @IsDateString()
  @ApiProperty({ description: 'Next scheduled date start filter', required: false })
  nextScheduledDateStart?: string;

  @IsOptional()
  @IsDateString()
  @ApiProperty({ description: 'Next scheduled date end filter', required: false })
  nextScheduledDateEnd?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Search query', required: false })
  search?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Transform(({ value }) => parseInt(value))
  @ApiProperty({ description: 'Page number', default: 1, required: false })
  page?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Transform(({ value }) => parseInt(value))
  @ApiProperty({ description: 'Items per page', default: 10, required: false })
  limit?: number;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Sort field', default: 'createdAt', required: false })
  sortBy?: string;

  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  @ApiProperty({ enum: ['ASC', 'DESC'], description: 'Sort order', default: 'DESC', required: false })
  sortOrder?: 'ASC' | 'DESC';
}

class AssignMaintenanceRequestDto {
  @IsString()
  @ApiProperty({ description: 'User ID to assign the request to' })
  assignedTo: string;

  @IsOptional()
  @IsDateString()
  @ApiProperty({ description: 'Scheduled date for the work', required: false })
  scheduledDate?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Assignment notes', required: false })
  notes?: string;
}

class CompleteMaintenanceRequestDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @ApiProperty({ description: 'Actual cost in pence', required: false })
  actualCost?: number;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Completion notes', required: false })
  completionNotes?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ApiProperty({ description: 'Completion photos', required: false })
  completionPhotos?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ApiProperty({ description: 'Completion documents', required: false })
  completionDocuments?: string[];
}

@ApiTags('Maintenance')
@Controller('maintenance')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  // Maintenance Requests
  @Post('requests')
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.ADMIN, UserRole.PROPERTY_MANAGER, UserRole.LANDLORD, UserRole.TENANT)
  @ApiOperation({ summary: 'Create a new maintenance request' })
  @ApiResponse({ status: 201, description: 'Maintenance request created successfully', schema: { $ref: getSchemaPath(MaintenanceRequest) } })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async createMaintenanceRequest(
    @Body() createRequestDto: CreateMaintenanceRequestRequestDto,
    @Request() req: any,
  ): Promise<{
    success: boolean;
    message: string;
    data: MaintenanceRequest;
  }> {
    const requestData: CreateMaintenanceRequestDto = {
      ...createRequestDto,
      tenantOrganizationId: req.user.tenantOrganizationId,
      requestedById: req.user.id,
      type: MaintenanceRequestType.ROUTINE,
      description: createRequestDto.description || 'No description provided',
      preferredStartDate: createRequestDto.preferredStartDate ? new Date(createRequestDto.preferredStartDate) : undefined,
      preferredCompletionDate: createRequestDto.preferredCompletionDate ? new Date(createRequestDto.preferredCompletionDate) : undefined,
    };

    const maintenanceRequest = await this.maintenanceService.createMaintenanceRequest(requestData);

    return {
      success: true,
      message: 'Maintenance request created successfully',
      data: maintenanceRequest,
    };
  }

  @Get('requests')
  @Roles(UserRole.ADMIN, UserRole.PROPERTY_MANAGER, UserRole.LANDLORD, UserRole.TENANT, UserRole.CONTRACTOR)
  @ApiOperation({ summary: 'Get all maintenance requests with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'Maintenance requests retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async findMaintenanceRequests(
    @Query() query: MaintenanceRequestQueryDto,
    @Request() req: any,
  ): Promise<{
    success: boolean;
    message: string;
    data: {
      requests: MaintenanceRequest[];
      pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };
    };
  }> {
    const filters: MaintenanceRequestFilters = {
      ...query,
      tenantOrganizationId: req.user.tenantOrganizationId,
      createdFrom: query.startDate ? new Date(query.startDate) : undefined,
      createdTo: query.endDate ? new Date(query.endDate) : undefined,
      dueDateFrom: query.scheduledDateStart ? new Date(query.scheduledDateStart) : undefined,
      dueDateTo: query.scheduledDateEnd ? new Date(query.scheduledDateEnd) : undefined,
      status: query.status ? [query.status] : undefined,
      priority: query.priority ? [query.priority] : undefined,
      type: query.type ? [query.type] : undefined,
      category: query.category ? [query.category] : undefined,
    };

    // Restrict tenant users to their own requests
    if (req.user.role === UserRole.TENANT) {
      filters.requestedById = req.user.id;
    }

    // Restrict contractors to assigned requests
    if (req.user.role === UserRole.CONTRACTOR) {
      filters.assignedToId = req.user.id;
    }

    const pagination: PaginationOptions = {
      page: query.page || 1,
      limit: query.limit || 10,
      sortBy: query.sortBy || 'createdAt',
      sortOrder: query.sortOrder || 'DESC',
    };

    const result = await this.maintenanceService.getMaintenanceRequests(filters, pagination.page, pagination.limit);
    const totalPages = Math.ceil(result.total / pagination.limit);

    return {
      success: true,
      message: 'Maintenance requests retrieved successfully',
      data: {
        requests: result.requests,
        pagination: {
          total: result.total,
          page: pagination.page,
          limit: pagination.limit,
          totalPages,
        },
      },
    };
  }

  @Get('requests/:id')
  @Roles(UserRole.ADMIN, UserRole.PROPERTY_MANAGER, UserRole.LANDLORD, UserRole.TENANT, UserRole.CONTRACTOR)
  @ApiOperation({ summary: 'Get maintenance request by ID' })
  @ApiResponse({ status: 200, description: 'Maintenance request retrieved successfully', schema: { $ref: getSchemaPath(MaintenanceRequest) } })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Maintenance request not found' })
  async findMaintenanceRequestById(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any,
  ): Promise<{
    success: boolean;
    message: string;
    data: MaintenanceRequest;
  }> {
    const request = await this.maintenanceService.getMaintenanceRequestById(id, req.user.tenantOrganizationId);

    // Access control based on user role
    if (req.user.role === UserRole.TENANT && request.requestedById !== req.user.id) {
      throw new ForbiddenException('Access denied to this maintenance request');
    }

    if (req.user.role === UserRole.CONTRACTOR && request.assignedTo !== req.user.id) {
      throw new ForbiddenException('Access denied to this maintenance request');
    }

    return {
      success: true,
      message: 'Maintenance request retrieved successfully',
      data: request,
    };
  }

  @Patch('requests/:id')
  @Roles(UserRole.ADMIN, UserRole.PROPERTY_MANAGER, UserRole.LANDLORD, UserRole.CONTRACTOR)
  @ApiOperation({ summary: 'Update maintenance request' })
  @ApiResponse({ status: 200, description: 'Maintenance request updated successfully', schema: { $ref: getSchemaPath(MaintenanceRequest) } })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Maintenance request not found' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateMaintenanceRequest(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateRequestDto: UpdateMaintenanceRequestRequestDto,
    @Request() req: any,
  ): Promise<{
    success: boolean;
    message: string;
    data: MaintenanceRequest;
  }> {
    const requestData: UpdateMaintenanceRequestDto = {
      ...updateRequestDto,
      preferredStartDate: updateRequestDto.preferredStartDate ? new Date(updateRequestDto.preferredStartDate) : undefined,
      preferredCompletionDate: updateRequestDto.preferredCompletionDate ? new Date(updateRequestDto.preferredCompletionDate) : undefined,

    };

    const request = await this.maintenanceService.updateMaintenanceRequest(
      id,
      req.user.tenantOrganizationId,
      requestData,
      req.user.id,
    );

    return {
      success: true,
      message: 'Maintenance request updated successfully',
      data: request,
    };
  }

  @Delete('requests/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.ADMIN, UserRole.PROPERTY_MANAGER, UserRole.LANDLORD)
  @ApiOperation({ summary: 'Delete maintenance request' })
  @ApiResponse({ status: 204, description: 'Maintenance request deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Maintenance request not found' })
  async deleteMaintenanceRequest(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any,
  ): Promise<void> {
    await this.maintenanceService.deleteMaintenanceRequest(id, req.user.tenantOrganizationId);
  }

  @Post('requests/:id/assign')
  @Roles(UserRole.ADMIN, UserRole.PROPERTY_MANAGER, UserRole.LANDLORD)
  @ApiOperation({ summary: 'Assign maintenance request to contractor' })
  @ApiResponse({ status: 200, description: 'Maintenance request assigned successfully', schema: { $ref: getSchemaPath(MaintenanceRequest) } })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Maintenance request not found' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async assignMaintenanceRequest(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() assignDto: AssignMaintenanceRequestDto,
    @Request() req: any,
  ): Promise<{
    success: boolean;
    message: string;
    data: MaintenanceRequest;
  }> {
    const request = await this.maintenanceService.assignMaintenanceRequest(
      id,
      req.user.tenantOrganizationId,
      assignDto.assignedTo,
      req.user.id,
    );

    return {
      success: true,
      message: 'Maintenance request assigned successfully',
      data: request,
    };
  }

  @Post('requests/:id/complete')
  @Roles(UserRole.ADMIN, UserRole.PROPERTY_MANAGER, UserRole.LANDLORD, UserRole.CONTRACTOR)
  @ApiOperation({ summary: 'Complete maintenance request' })
  @ApiResponse({ status: 200, description: 'Maintenance request completed successfully', schema: { $ref: getSchemaPath(MaintenanceRequest) } })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Maintenance request not found' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async completeMaintenanceRequest(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() completeDto: CompleteMaintenanceRequestDto,
    @Request() req: any,
  ): Promise<{
    success: boolean;
    message: string;
    data: MaintenanceRequest;
  }> {
    const request = await this.maintenanceService.completeMaintenanceRequest(
      id,
      req.user.tenantOrganizationId,
      {
        workPerformed: completeDto.completionNotes || '',
        actualCost: completeDto.actualCost,
        afterPhotos: completeDto.completionPhotos,
        invoiceAttachments: completeDto.completionDocuments,
      },
      req.user.id,
    );

    return {
      success: true,
      message: 'Maintenance request completed successfully',
      data: request,
    };
  }

  // Maintenance Schedules
  @Post('schedules')
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.ADMIN, UserRole.PROPERTY_MANAGER, UserRole.LANDLORD)
  @ApiOperation({ summary: 'Create a new maintenance schedule' })
  @ApiResponse({ status: 201, description: 'Maintenance schedule created successfully', schema: { $ref: getSchemaPath(MaintenanceSchedule) } })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async createMaintenanceSchedule(
    @Body() createScheduleDto: CreateMaintenanceScheduleRequestDto,
    @Request() req: any,
  ): Promise<{
    success: boolean;
    message: string;
    data: MaintenanceSchedule;
  }> {
    const scheduleData: CreateMaintenanceScheduleDto = {
      tenantOrganizationId: req.user.tenantOrganizationId,
      name: createScheduleDto.title,
      description: createScheduleDto.description || '',
      type: createScheduleDto.type,
      priority: createScheduleDto.priority,
      propertyId: createScheduleDto.propertyId,
      createdById: req.user.id,
      assignedToId: createScheduleDto.assignedTo,
      frequency: createScheduleDto.frequency,
      startDate: new Date(createScheduleDto.startDate),
      endDate: createScheduleDto.endDate ? new Date(createScheduleDto.endDate) : undefined,
      estimatedDuration: createScheduleDto.estimatedDuration,
      location: createScheduleDto.location,
      taskInstructions: createScheduleDto.instructions || '',
      requiredMaterials: createScheduleDto.requiredMaterials,
      estimatedCost: createScheduleDto.estimatedCost,
      metadata: createScheduleDto.metadata,
      tags: createScheduleDto.tags,
      customFields: createScheduleDto.customFields,
    };

    const schedule = await this.maintenanceService.createMaintenanceSchedule(scheduleData);

    return {
      success: true,
      message: 'Maintenance schedule created successfully',
      data: schedule,
    };
  }

  @Get('schedules')
  @Roles(UserRole.ADMIN, UserRole.PROPERTY_MANAGER, UserRole.LANDLORD, UserRole.CONTRACTOR)
  @ApiOperation({ summary: 'Get all maintenance schedules with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'Maintenance schedules retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async findMaintenanceSchedules(
    @Query() query: MaintenanceScheduleQueryDto,
    @Request() req: any,
  ): Promise<{
    success: boolean;
    message: string;
    data: {
      schedules: MaintenanceSchedule[];
      pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };
    };
  }> {
    const filters: MaintenanceScheduleFilters = {
      tenantOrganizationId: req.user.tenantOrganizationId,
      nextDueDateFrom: query.nextScheduledDateStart ? new Date(query.nextScheduledDateStart) : undefined,
      nextDueDateTo: query.nextScheduledDateEnd ? new Date(query.nextScheduledDateEnd) : undefined,
      propertyId: query.propertyId,
      assignedToId: query.assignedTo,
      status: query.status ? [query.status] : undefined,
      type: query.type ? [query.type] : undefined,
      frequency: query.frequency ? [query.frequency] : undefined,
      search: query.search,
    };

    // Restrict contractors to assigned schedules
    if (req.user.role === UserRole.CONTRACTOR) {
      filters.assignedToId = req.user.id;
    }

    const pagination: PaginationOptions = {
      page: query.page || 1,
      limit: query.limit || 10,
      sortBy: query.sortBy || 'createdAt',
      sortOrder: query.sortOrder || 'DESC',
    };

    const result = await this.maintenanceService.getMaintenanceSchedules(filters, pagination.page, pagination.limit);
    const totalPages = Math.ceil(result.total / pagination.limit);

    return {
      success: true,
      message: 'Maintenance schedules retrieved successfully',
      data: {
        schedules: result.schedules,
        pagination: {
          total: result.total,
          page: pagination.page,
          limit: pagination.limit,
          totalPages,
        },
      },
    };
  }

  @Get('schedules/:id')
  @Roles(UserRole.ADMIN, UserRole.PROPERTY_MANAGER, UserRole.LANDLORD, UserRole.CONTRACTOR)
  @ApiOperation({ summary: 'Get maintenance schedule by ID' })
  @ApiResponse({ status: 200, description: 'Maintenance schedule retrieved successfully', schema: { $ref: getSchemaPath(MaintenanceSchedule) } })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Maintenance schedule not found' })
  async findMaintenanceScheduleById(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any,
  ): Promise<{
    success: boolean;
    message: string;
    data: MaintenanceSchedule;
  }> {
    const schedule = await this.maintenanceService.getMaintenanceScheduleById(id, req.user.tenantOrganizationId);

    // Access control for contractors
    if (req.user.role === UserRole.CONTRACTOR && schedule.assignedToId !== req.user.id) {
      throw new ForbiddenException('Access denied to this maintenance schedule');
    }

    return {
      success: true,
      message: 'Maintenance schedule retrieved successfully',
      data: schedule,
    };
  }

  @Patch('schedules/:id')
  @Roles(UserRole.ADMIN, UserRole.PROPERTY_MANAGER, UserRole.LANDLORD)
  @ApiOperation({ summary: 'Update maintenance schedule' })
  @ApiResponse({ status: 200, description: 'Maintenance schedule updated successfully', schema: { $ref: getSchemaPath(MaintenanceSchedule) } })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Maintenance schedule not found' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateMaintenanceSchedule(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateScheduleDto: UpdateMaintenanceScheduleRequestDto,
    @Request() req: any,
  ): Promise<{
    success: boolean;
    message: string;
    data: MaintenanceSchedule;
  }> {
    const scheduleData: UpdateMaintenanceScheduleDto = {
      ...updateScheduleDto,
      startDate: updateScheduleDto.startDate ? new Date(updateScheduleDto.startDate) : undefined,
      endDate: updateScheduleDto.endDate ? new Date(updateScheduleDto.endDate) : undefined,
      nextScheduledDate: updateScheduleDto.nextScheduledDate ? new Date(updateScheduleDto.nextScheduledDate) : undefined,
    };

    const schedule = await this.maintenanceService.updateMaintenanceSchedule(
      id,
      req.user.tenantOrganizationId,
      scheduleData,
    );

    return {
      success: true,
      message: 'Maintenance schedule updated successfully',
      data: schedule,
    };
  }

  @Delete('schedules/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.ADMIN, UserRole.PROPERTY_MANAGER, UserRole.LANDLORD)
  @ApiOperation({ summary: 'Delete maintenance schedule' })
  @ApiResponse({ status: 204, description: 'Maintenance schedule deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Maintenance schedule not found' })
  async deleteMaintenanceSchedule(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any,
  ): Promise<void> {
    await this.maintenanceService.deleteMaintenanceSchedule(id, req.user.tenantOrganizationId);
  }

  @Post('schedules/:id/pause')
  @Roles(UserRole.ADMIN, UserRole.PROPERTY_MANAGER, UserRole.LANDLORD)
  @ApiOperation({ summary: 'Pause maintenance schedule' })
  @ApiResponse({ status: 200, description: 'Maintenance schedule paused successfully', schema: { $ref: getSchemaPath(MaintenanceSchedule) } })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Maintenance schedule not found' })
  async pauseMaintenanceSchedule(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any,
  ): Promise<{
    success: boolean;
    message: string;
    data: MaintenanceSchedule;
  }> {
    const schedule = await this.maintenanceService.pauseMaintenanceSchedule(
      id,
      req.user.tenantOrganizationId,
      'Paused by user',
      req.user.id,
    );

    return {
      success: true,
      message: 'Maintenance schedule paused successfully',
      data: schedule,
    };
  }

  @Post('schedules/:id/resume')
  @Roles(UserRole.ADMIN, UserRole.PROPERTY_MANAGER, UserRole.LANDLORD)
  @ApiOperation({ summary: 'Resume maintenance schedule' })
  @ApiResponse({ status: 200, description: 'Maintenance schedule resumed successfully', schema: { $ref: getSchemaPath(MaintenanceSchedule) } })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Maintenance schedule not found' })
  async resumeMaintenanceSchedule(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any,
  ): Promise<{
    success: boolean;
    message: string;
    data: MaintenanceSchedule;
  }> {
    const schedule = await this.maintenanceService.resumeMaintenanceSchedule(
      id,
      req.user.tenantOrganizationId,
    );

    return {
      success: true,
      message: 'Maintenance schedule resumed successfully',
      data: schedule,
    };
  }

  // Dashboard
  @Get('dashboard')
  @Roles(UserRole.ADMIN, UserRole.PROPERTY_MANAGER, UserRole.LANDLORD)
  @ApiOperation({ summary: 'Get maintenance dashboard statistics' })
  @ApiResponse({ status: 200, description: 'Dashboard statistics retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getMaintenanceDashboard(
    @Request() req: any,
  ): Promise<{
    success: boolean;
    message: string;
    data: any;
  }> {
    const stats = await this.maintenanceService.getMaintenanceDashboard(req.user.tenantOrganizationId);

    return {
      success: true,
      message: 'Dashboard statistics retrieved successfully',
      data: stats,
    };
  }
}
