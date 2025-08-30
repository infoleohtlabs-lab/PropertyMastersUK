import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
  IsDateString,
  IsArray,
  IsBoolean,
  IsUUID,
  Min,
  Max,
  IsObject,
} from 'class-validator';
import {
  MaintenanceRequestCategory,
  MaintenanceRequestPriority,
  MaintenanceRequestStatus,
} from '../entities/maintenance-request.entity';

export class CreateMaintenanceRequestDto {
  @ApiProperty({ description: 'Request number for tracking' })
  @IsString()
  requestNumber: string;

  @ApiProperty({ description: 'Title of the maintenance request' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Detailed description of the issue' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Category of maintenance', enum: MaintenanceRequestCategory })
  @IsEnum(MaintenanceRequestCategory)
  category: MaintenanceRequestCategory;

  @ApiProperty({ description: 'Priority level', enum: MaintenanceRequestPriority, required: false })
  @IsOptional()
  @IsEnum(MaintenanceRequestPriority)
  priority?: MaintenanceRequestPriority;

  @ApiProperty({ description: 'Current status', enum: MaintenanceRequestStatus, required: false })
  @IsOptional()
  @IsEnum(MaintenanceRequestStatus)
  status?: MaintenanceRequestStatus;

  @ApiProperty({ description: 'Location within the property', required: false })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ description: 'Estimated cost for the repair', required: false })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  estimatedCost?: number;

  @ApiProperty({ description: 'Actual cost of the repair', required: false })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  actualCost?: number;

  @ApiProperty({ description: 'Preferred date for completion', required: false })
  @IsOptional()
  @IsDateString()
  preferredDate?: string;

  @ApiProperty({ description: 'Date when request was approved', required: false })
  @IsOptional()
  @IsDateString()
  approvedAt?: string;

  @ApiProperty({ description: 'Date when work started', required: false })
  @IsOptional()
  @IsDateString()
  startedAt?: string;

  @ApiProperty({ description: 'Date when work was completed', required: false })
  @IsOptional()
  @IsDateString()
  completedAt?: string;

  @ApiProperty({ description: 'Date when request was cancelled', required: false })
  @IsOptional()
  @IsDateString()
  cancelledAt?: string;

  @ApiProperty({ description: 'Reason for cancellation or rejection', required: false })
  @IsOptional()
  @IsString()
  cancellationReason?: string;

  @ApiProperty({ description: 'Images related to the request', type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiProperty({ description: 'Documents related to the request', type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  documents?: string[];

  @ApiProperty({ description: 'Notes from tenant or landlord', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'Internal notes for staff', required: false })
  @IsOptional()
  @IsString()
  internalNotes?: string;

  @ApiProperty({ description: 'Tenant satisfaction rating (1-5)', required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  satisfactionRating?: number;

  @ApiProperty({ description: 'Tenant feedback', required: false })
  @IsOptional()
  @IsString()
  tenantFeedback?: string;

  @ApiProperty({ description: 'Whether tenant access is required', required: false })
  @IsOptional()
  @IsBoolean()
  requiresTenantAccess?: boolean;

  @ApiProperty({ description: 'Emergency contact information', required: false })
  @IsOptional()
  @IsObject()
  emergencyContact?: any;

  @ApiProperty({ description: 'ID of the user assigned to handle the request', required: false })
  @IsOptional()
  @IsUUID()
  assignedTo?: string;

  @ApiProperty({ description: 'ID of the property' })
  @IsUUID()
  propertyId: string;

  @ApiProperty({ description: 'Additional metadata', required: false })
  @IsOptional()
  @IsObject()
  metadata?: any;
}