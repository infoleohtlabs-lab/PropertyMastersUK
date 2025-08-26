import { IsString, IsOptional, IsEnum, IsNumber, IsBoolean, IsArray, IsDateString, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InspectionType } from '../entities/property-inspection.entity';

export class ScheduleInspectionDto {
  @ApiProperty({ description: 'Property ID to be inspected' })
  @IsString()
  propertyId: string;

  @ApiPropertyOptional({ description: 'Inspector user ID' })
  @IsOptional()
  @IsString()
  inspectorId?: string;

  @ApiProperty({ enum: InspectionType, description: 'Type of inspection' })
  @IsEnum(InspectionType)
  inspectionType: InspectionType;

  @ApiProperty({ description: 'Scheduled date for the inspection' })
  @IsDateString()
  scheduledDate: string;

  @ApiPropertyOptional({ description: 'Scheduled time (HH:MM format)' })
  @IsOptional()
  @IsString()
  scheduledTime?: string;

  // Inspector Information
  @ApiPropertyOptional({ description: 'Inspector name' })
  @IsOptional()
  @IsString()
  inspectorName?: string;

  @ApiPropertyOptional({ description: 'Inspector company' })
  @IsOptional()
  @IsString()
  inspectorCompany?: string;

  @ApiPropertyOptional({ description: 'Inspector phone number' })
  @IsOptional()
  @IsString()
  inspectorPhone?: string;

  @ApiPropertyOptional({ description: 'Inspector email' })
  @IsOptional()
  @IsString()
  inspectorEmail?: string;

  @ApiPropertyOptional({ description: 'Whether using external inspector' })
  @IsOptional()
  @IsBoolean()
  isExternalInspector?: boolean;

  // Access and Attendance
  @ApiPropertyOptional({ description: 'Whether tenant will be present' })
  @IsOptional()
  @IsBoolean()
  tenantPresent?: boolean;

  @ApiPropertyOptional({ description: 'Names of people who will attend', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attendees?: string[];

  @ApiPropertyOptional({ description: 'Method of access (key, tenant let in, etc.)' })
  @IsOptional()
  @IsString()
  accessMethod?: string;

  @ApiPropertyOptional({ description: 'Access notes or special instructions' })
  @IsOptional()
  @IsString()
  accessNotes?: string;

  // Inspection Focus Areas
  @ApiPropertyOptional({ description: 'Specific areas to focus on during inspection', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  focusAreas?: string[];

  @ApiPropertyOptional({ description: 'Known issues to check', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  knownIssues?: string[];

  @ApiPropertyOptional({ description: 'Previous inspection findings to follow up', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  followUpItems?: string[];

  // Safety and Compliance Checks
  @ApiPropertyOptional({ description: 'Whether to perform safety checks' })
  @IsOptional()
  @IsBoolean()
  includeSafetyChecks?: boolean;

  @ApiPropertyOptional({ description: 'Whether to check appliances' })
  @IsOptional()
  @IsBoolean()
  includeApplianceChecks?: boolean;

  @ApiPropertyOptional({ description: 'Whether to check utilities' })
  @IsOptional()
  @IsBoolean()
  includeUtilityChecks?: boolean;

  @ApiPropertyOptional({ description: 'Whether to perform inventory check' })
  @IsOptional()
  @IsBoolean()
  includeInventoryCheck?: boolean;

  @ApiPropertyOptional({ description: 'Whether to assess damage' })
  @IsOptional()
  @IsBoolean()
  includeDamageAssessment?: boolean;

  // Documentation Requirements
  @ApiPropertyOptional({ description: 'Whether photos are required' })
  @IsOptional()
  @IsBoolean()
  requirePhotos?: boolean;

  @ApiPropertyOptional({ description: 'Whether detailed report is required' })
  @IsOptional()
  @IsBoolean()
  requireDetailedReport?: boolean;

  @ApiPropertyOptional({ description: 'Whether certificate is required' })
  @IsOptional()
  @IsBoolean()
  requireCertificate?: boolean;

  // Cost and Billing
  @ApiPropertyOptional({ description: 'Inspection cost', minimum: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  inspectionCost?: number;

  @ApiPropertyOptional({ description: 'Whether cost is chargeable to tenant' })
  @IsOptional()
  @IsBoolean()
  chargeableTenant?: boolean;

  // Scheduling Preferences
  @ApiPropertyOptional({ description: 'Preferred time slots', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preferredTimeSlots?: string[];

  @ApiPropertyOptional({ description: 'Days to avoid', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  daysToAvoid?: string[];

  @ApiPropertyOptional({ description: 'Special scheduling requirements' })
  @IsOptional()
  @IsString()
  specialRequirements?: string;

  // Weather Considerations
  @ApiPropertyOptional({ description: 'Whether inspection is weather dependent' })
  @IsOptional()
  @IsBoolean()
  weatherDependent?: boolean;

  @ApiPropertyOptional({ description: 'Minimum temperature required', minimum: -50, maximum: 50 })
  @IsOptional()
  @IsNumber()
  @Min(-50)
  @Max(50)
  minimumTemperature?: number;

  // Follow-up and Actions
  @ApiPropertyOptional({ description: 'Whether follow-up inspection may be required' })
  @IsOptional()
  @IsBoolean()
  mayRequireFollowUp?: boolean;

  @ApiPropertyOptional({ description: 'Expected follow-up date' })
  @IsOptional()
  @IsDateString()
  expectedFollowUpDate?: string;

  @ApiPropertyOptional({ description: 'Whether action plan should be created' })
  @IsOptional()
  @IsBoolean()
  createActionPlan?: boolean;

  // Communication
  @ApiPropertyOptional({ description: 'Whether to notify tenant' })
  @IsOptional()
  @IsBoolean()
  notifyTenant?: boolean;

  @ApiPropertyOptional({ description: 'Whether to notify landlord' })
  @IsOptional()
  @IsBoolean()
  notifyLandlord?: boolean;

  @ApiPropertyOptional({ description: 'Whether to share report with tenant' })
  @IsOptional()
  @IsBoolean()
  shareReportWithTenant?: boolean;

  @ApiPropertyOptional({ description: 'Additional notification recipients', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  additionalNotificationRecipients?: string[];

  // Legal and Compliance
  @ApiPropertyOptional({ description: 'Whether this is a statutory inspection' })
  @IsOptional()
  @IsBoolean()
  isStatutoryInspection?: boolean;

  @ApiPropertyOptional({ description: 'Legal requirement reference' })
  @IsOptional()
  @IsString()
  legalRequirementReference?: string;

  @ApiPropertyOptional({ description: 'Compliance deadline' })
  @IsOptional()
  @IsDateString()
  complianceDeadline?: string;

  @ApiPropertyOptional({ description: 'Whether authorities need to be notified of results' })
  @IsOptional()
  @IsBoolean()
  notifyAuthorities?: boolean;

  // Quality and Satisfaction
  @ApiPropertyOptional({ description: 'Whether tenant satisfaction survey is required' })
  @IsOptional()
  @IsBoolean()
  requireTenantSatisfactionSurvey?: boolean;

  @ApiPropertyOptional({ description: 'Whether landlord satisfaction survey is required' })
  @IsOptional()
  @IsBoolean()
  requireLandlordSatisfactionSurvey?: boolean;

  @ApiPropertyOptional({ description: 'Quality standards to meet', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  qualityStandards?: string[];

  @ApiPropertyOptional({ description: 'Special instructions for the inspection' })
  @IsOptional()
  @IsString()
  specialInstructions?: string;

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}