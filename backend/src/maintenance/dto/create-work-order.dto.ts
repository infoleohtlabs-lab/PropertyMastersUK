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
  IsObject,
  Min,
  Max,
} from 'class-validator';
import {
  WorkOrderStatus,
  WorkOrderPriority,
} from '../entities/work-order.entity';

export class CreateWorkOrderDto {
  @ApiProperty({ description: 'Work order number for tracking' })
  @IsString()
  orderNumber: string;

  @ApiProperty({ description: 'Title of the work order' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Detailed description of work to be done' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Current status', enum: WorkOrderStatus, required: false })
  @IsOptional()
  @IsEnum(WorkOrderStatus)
  status?: WorkOrderStatus;

  @ApiProperty({ description: 'Priority level', enum: WorkOrderPriority, required: false })
  @IsOptional()
  @IsEnum(WorkOrderPriority)
  priority?: WorkOrderPriority;

  @ApiProperty({ description: 'Estimated cost for the work', required: false })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  estimatedCost?: number;

  @ApiProperty({ description: 'Quoted cost from contractor', required: false })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  quotedCost?: number;

  @ApiProperty({ description: 'Final cost of the work', required: false })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  finalCost?: number;

  @ApiProperty({ description: 'Estimated hours to complete', required: false })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  estimatedHours?: number;

  @ApiProperty({ description: 'Actual hours worked', required: false })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  actualHours?: number;

  @ApiProperty({ description: 'Scheduled start date and time', required: false })
  @IsOptional()
  @IsDateString()
  scheduledStartDate?: string;

  @ApiProperty({ description: 'Scheduled completion date and time', required: false })
  @IsOptional()
  @IsDateString()
  scheduledEndDate?: string;

  @ApiProperty({ description: 'Actual start date and time', required: false })
  @IsOptional()
  @IsDateString()
  actualStartDate?: string;

  @ApiProperty({ description: 'Actual completion date and time', required: false })
  @IsOptional()
  @IsDateString()
  actualEndDate?: string;

  @ApiProperty({ description: 'Date when work order was assigned', required: false })
  @IsOptional()
  @IsDateString()
  assignedAt?: string;

  @ApiProperty({ description: 'Date when contractor accepted the work order', required: false })
  @IsOptional()
  @IsDateString()
  acceptedAt?: string;

  @ApiProperty({ description: 'Date when work order was cancelled', required: false })
  @IsOptional()
  @IsDateString()
  cancelledAt?: string;

  @ApiProperty({ description: 'Reason for cancellation or rejection', required: false })
  @IsOptional()
  @IsString()
  cancellationReason?: string;

  @ApiProperty({ description: 'Materials required for the work', required: false })
  @IsOptional()
  @IsArray()
  materials?: {
    name: string;
    quantity: number;
    unit: string;
    unitCost: number;
    totalCost: number;
    supplier: string;
  }[];

  @ApiProperty({ description: 'Tools required for the work', type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  toolsRequired?: string[];

  @ApiProperty({ description: 'Safety requirements and precautions', type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  safetyRequirements?: string[];

  @ApiProperty({ description: 'Special instructions for the contractor', required: false })
  @IsOptional()
  @IsString()
  specialInstructions?: string;

  @ApiProperty({ description: 'Access instructions for the property', required: false })
  @IsOptional()
  @IsString()
  accessInstructions?: string;

  @ApiProperty({ description: 'Work completion notes', required: false })
  @IsOptional()
  @IsString()
  completionNotes?: string;

  @ApiProperty({ description: 'Quality check notes', required: false })
  @IsOptional()
  @IsString()
  qualityCheckNotes?: string;

  @ApiProperty({ description: 'Whether quality check passed', required: false })
  @IsOptional()
  @IsBoolean()
  qualityCheckPassed?: boolean;

  @ApiProperty({ description: 'Images before work started', type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  beforeImages?: string[];

  @ApiProperty({ description: 'Images after work completed', type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  afterImages?: string[];

  @ApiProperty({ description: 'Work progress images', type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  progressImages?: string[];

  @ApiProperty({ description: 'Documents related to the work order', type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  documents?: string[];

  @ApiProperty({ description: 'Warranty period in months', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  warrantyPeriod?: number;

  @ApiProperty({ description: 'Warranty details', required: false })
  @IsOptional()
  @IsString()
  warrantyDetails?: string;

  @ApiProperty({ description: 'Customer satisfaction rating (1-5)', required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  satisfactionRating?: number;

  @ApiProperty({ description: 'Customer feedback', required: false })
  @IsOptional()
  @IsString()
  customerFeedback?: string;

  @ApiProperty({ description: 'Contractor rating for this job (1-5)', required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  contractorRating?: number;

  @ApiProperty({ description: 'Notes about contractor performance', required: false })
  @IsOptional()
  @IsString()
  contractorNotes?: string;

  @ApiProperty({ description: 'Whether follow-up is required', required: false })
  @IsOptional()
  @IsBoolean()
  followUpRequired?: boolean;

  @ApiProperty({ description: 'Follow-up date', required: false })
  @IsOptional()
  @IsDateString()
  followUpDate?: string;

  @ApiProperty({ description: 'Follow-up notes', required: false })
  @IsOptional()
  @IsString()
  followUpNotes?: string;

  @ApiProperty({ description: 'ID of the maintenance request' })
  @IsUUID()
  maintenanceRequestId: string;

  @ApiProperty({ description: 'ID of the assigned contractor', required: false })
  @IsOptional()
  @IsUUID()
  contractorId?: string;

  @ApiProperty({ description: 'ID of the user who approved the work order', required: false })
  @IsOptional()
  @IsUUID()
  approvedBy?: string;

  @ApiProperty({ description: 'Additional metadata', required: false })
  @IsOptional()
  @IsObject()
  metadata?: any;
}