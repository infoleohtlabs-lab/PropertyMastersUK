import { IsString, IsOptional, IsEnum, IsNumber, IsBoolean, IsArray, IsDateString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MaintenanceCategory, MaintenancePriority } from '../entities/maintenance-request.entity';

export class CreateMaintenanceRequestDto {
  @ApiProperty({ description: 'Property ID where maintenance is required' })
  @IsString()
  propertyId: string;

  @ApiPropertyOptional({ description: 'User ID of person reporting the issue' })
  @IsOptional()
  @IsString()
  reportedBy?: string;

  @ApiProperty({ description: 'Title/summary of the maintenance issue' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Detailed description of the issue' })
  @IsString()
  description: string;

  @ApiProperty({ enum: MaintenanceCategory, description: 'Category of maintenance required' })
  @IsEnum(MaintenanceCategory)
  category: MaintenanceCategory;

  @ApiPropertyOptional({ enum: MaintenancePriority, description: 'Priority level of the request' })
  @IsOptional()
  @IsEnum(MaintenancePriority)
  priority?: MaintenancePriority;

  // Location and Access
  @ApiPropertyOptional({ description: 'Specific location within the property' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ description: 'Whether access to property is required' })
  @IsOptional()
  @IsBoolean()
  requiresAccess?: boolean;

  @ApiPropertyOptional({ description: 'Instructions for accessing the property' })
  @IsOptional()
  @IsString()
  accessInstructions?: string;

  @ApiPropertyOptional({ description: 'Whether tenant presence is required' })
  @IsOptional()
  @IsBoolean()
  tenantPresenceRequired?: boolean;

  @ApiPropertyOptional({ description: 'Available time slots for access', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  availableTimeSlots?: string[];

  // Scheduling
  @ApiPropertyOptional({ description: 'Preferred completion date' })
  @IsOptional()
  @IsDateString()
  targetCompletionDate?: string;

  @ApiPropertyOptional({ description: 'Scheduled date for the work' })
  @IsOptional()
  @IsDateString()
  scheduledDate?: string;

  // Contractor Information
  @ApiPropertyOptional({ description: 'Assigned contractor ID' })
  @IsOptional()
  @IsString()
  assignedContractorId?: string;

  @ApiPropertyOptional({ description: 'Contractor name' })
  @IsOptional()
  @IsString()
  contractorName?: string;

  @ApiPropertyOptional({ description: 'Contractor company' })
  @IsOptional()
  @IsString()
  contractorCompany?: string;

  @ApiPropertyOptional({ description: 'Contractor phone number' })
  @IsOptional()
  @IsString()
  contractorPhone?: string;

  @ApiPropertyOptional({ description: 'Contractor email' })
  @IsOptional()
  @IsString()
  contractorEmail?: string;

  @ApiPropertyOptional({ description: 'Type of contractor' })
  @IsOptional()
  @IsString()
  contractorType?: string;

  // Cost Information
  @ApiPropertyOptional({ description: 'Estimated cost of the work', minimum: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  estimatedCost?: number;

  @ApiPropertyOptional({ description: 'Quoted cost from contractor', minimum: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  quotedCost?: number;

  @ApiPropertyOptional({ description: 'Approved budget for the work', minimum: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  approvedBudget?: number;

  @ApiPropertyOptional({ description: 'Whether work requires approval before proceeding' })
  @IsOptional()
  @IsBoolean()
  requiresApproval?: boolean;

  // Emergency and Safety
  @ApiPropertyOptional({ description: 'Whether this is an emergency request' })
  @IsOptional()
  @IsBoolean()
  isEmergency?: boolean;

  @ApiPropertyOptional({ description: 'Whether the issue affects safety' })
  @IsOptional()
  @IsBoolean()
  affectsSafety?: boolean;

  @ApiPropertyOptional({ description: 'Whether the issue affects habitability' })
  @IsOptional()
  @IsBoolean()
  affectsHabitability?: boolean;

  @ApiPropertyOptional({ description: 'Whether evacuation is required' })
  @IsOptional()
  @IsBoolean()
  requiresEvacuation?: boolean;

  @ApiPropertyOptional({ description: 'Emergency response details' })
  @IsOptional()
  @IsString()
  emergencyResponse?: string;

  // Work Details
  @ApiPropertyOptional({ description: 'Detailed description of work to be done' })
  @IsOptional()
  @IsString()
  workDescription?: string;

  @ApiPropertyOptional({ description: 'Materials that will be used', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  materialsUsed?: string[];

  @ApiPropertyOptional({ description: 'Warranty period in days', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  warrantyPeriod?: number;

  // Documentation
  @ApiPropertyOptional({ description: 'Photos taken before work starts', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  beforePhotos?: string[];

  @ApiPropertyOptional({ description: 'Supporting documents', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  documents?: string[];

  // Recurring Maintenance
  @ApiPropertyOptional({ description: 'Whether this is recurring maintenance' })
  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean;

  @ApiPropertyOptional({ description: 'Frequency for recurring maintenance (e.g., monthly, quarterly)' })
  @IsOptional()
  @IsString()
  recurringFrequency?: string;

  @ApiPropertyOptional({ description: 'Next scheduled date for recurring maintenance' })
  @IsOptional()
  @IsDateString()
  nextScheduledDate?: string;

  @ApiPropertyOptional({ description: 'Parent request ID for recurring maintenance' })
  @IsOptional()
  @IsString()
  parentRequestId?: string;

  // Legal and Compliance
  @ApiPropertyOptional({ description: 'Whether this is a statutory requirement' })
  @IsOptional()
  @IsBoolean()
  isStatutoryRequirement?: boolean;

  @ApiPropertyOptional({ description: 'Compliance deadline' })
  @IsOptional()
  @IsDateString()
  complianceDeadline?: string;

  @ApiPropertyOptional({ description: 'Whether this affects insurance' })
  @IsOptional()
  @IsBoolean()
  affectsInsurance?: boolean;

  @ApiPropertyOptional({ description: 'Whether authorities need to be notified' })
  @IsOptional()
  @IsBoolean()
  reportedToAuthorities?: boolean;

  @ApiPropertyOptional({ description: 'Authority reference number' })
  @IsOptional()
  @IsString()
  authorityReference?: string;

  // Notes
  @ApiPropertyOptional({ description: 'Internal notes for landlord/agent use' })
  @IsOptional()
  @IsString()
  internalNotes?: string;

  @ApiPropertyOptional({ description: 'Notes from tenant' })
  @IsOptional()
  @IsString()
  tenantNotes?: string;
}
