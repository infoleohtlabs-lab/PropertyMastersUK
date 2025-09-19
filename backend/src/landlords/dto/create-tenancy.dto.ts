import { IsString, IsOptional, IsEnum, IsNumber, IsBoolean, IsArray, IsDateString, IsEmail, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TenancyType, RentFrequency, DepositScheme } from '../entities/tenancy-agreement.entity';

export class CreateTenancyDto {
  @ApiProperty({ description: 'Property ID' })
  @IsString()
  propertyId: string;

  @ApiProperty({ description: 'Landlord ID' })
  @IsString()
  landlordId: string;

  @ApiPropertyOptional({ description: 'Primary tenant user ID' })
  @IsOptional()
  @IsString()
  primaryTenantId?: string;

  @ApiProperty({ description: 'Tenancy reference number' })
  @IsString()
  tenancyReference: string;

  @ApiProperty({ enum: TenancyType, description: 'Type of tenancy agreement' })
  @IsEnum(TenancyType)
  tenancyType: TenancyType;

  // Tenancy Dates
  @ApiProperty({ description: 'Tenancy start date' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ description: 'Tenancy end date' })
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional({ description: 'Actual end date (if different from planned)' })
  @IsOptional()
  @IsDateString()
  actualEndDate?: string;

  @ApiPropertyOptional({ description: 'Notice period in days', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  noticePeriod?: number;

  // Rent Information
  @ApiProperty({ description: 'Monthly rent amount', minimum: 0 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  monthlyRent: number;

  @ApiPropertyOptional({ description: 'Weekly rent amount', minimum: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  weeklyRent?: number;

  @ApiProperty({ enum: RentFrequency, description: 'Rent payment frequency' })
  @IsEnum(RentFrequency)
  rentFrequency: RentFrequency;

  @ApiProperty({ description: 'Rent due day of month', minimum: 1, maximum: 31 })
  @IsNumber()
  @Min(1)
  @Max(31)
  rentDueDay: number;

  @ApiPropertyOptional({ description: 'First rent payment date' })
  @IsOptional()
  @IsDateString()
  firstRentDate?: string;

  @ApiPropertyOptional({ description: 'Last rent payment date' })
  @IsOptional()
  @IsDateString()
  lastRentDate?: string;

  // Deposit Information
  @ApiProperty({ description: 'Security deposit amount', minimum: 0 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  depositAmount: number;

  @ApiProperty({ enum: DepositScheme, description: 'Deposit protection scheme' })
  @IsEnum(DepositScheme)
  depositScheme: DepositScheme;

  @ApiPropertyOptional({ description: 'Deposit scheme certificate number' })
  @IsOptional()
  @IsString()
  depositSchemeCertificate?: string;

  @ApiPropertyOptional({ description: 'Date deposit was protected' })
  @IsOptional()
  @IsDateString()
  depositProtectedDate?: string;

  @ApiPropertyOptional({ description: 'Date deposit was paid' })
  @IsOptional()
  @IsDateString()
  depositPaidDate?: string;

  // Tenant Information
  @ApiProperty({ description: 'Primary tenant full name' })
  @IsString()
  primaryTenantName: string;

  @ApiProperty({ description: 'Primary tenant email' })
  @IsEmail()
  primaryTenantEmail: string;

  @ApiProperty({ description: 'Primary tenant phone' })
  @IsString()
  primaryTenantPhone: string;

  @ApiPropertyOptional({ description: 'Primary tenant date of birth' })
  @IsOptional()
  @IsDateString()
  primaryTenantDateOfBirth?: string;

  @ApiPropertyOptional({ description: 'Primary tenant occupation' })
  @IsOptional()
  @IsString()
  primaryTenantOccupation?: string;

  @ApiPropertyOptional({ description: 'Primary tenant employer' })
  @IsOptional()
  @IsString()
  primaryTenantEmployer?: string;

  @ApiPropertyOptional({ description: 'Primary tenant annual income', minimum: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  primaryTenantIncome?: number;

  @ApiPropertyOptional({ description: 'Additional tenant names', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  additionalTenantNames?: string[];

  @ApiPropertyOptional({ description: 'Additional tenant emails', type: [String] })
  @IsOptional()
  @IsArray()
  @IsEmail({}, { each: true })
  additionalTenantEmails?: string[];

  @ApiPropertyOptional({ description: 'Total number of tenants', minimum: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  totalTenants?: number;

  // Guarantor Information
  @ApiPropertyOptional({ description: 'Whether guarantor is required' })
  @IsOptional()
  @IsBoolean()
  requiresGuarantor?: boolean;

  @ApiPropertyOptional({ description: 'Guarantor name' })
  @IsOptional()
  @IsString()
  guarantorName?: string;

  @ApiPropertyOptional({ description: 'Guarantor email' })
  @IsOptional()
  @IsEmail()
  guarantorEmail?: string;

  @ApiPropertyOptional({ description: 'Guarantor phone' })
  @IsOptional()
  @IsString()
  guarantorPhone?: string;

  @ApiPropertyOptional({ description: 'Guarantor address' })
  @IsOptional()
  @IsString()
  guarantorAddress?: string;

  @ApiPropertyOptional({ description: 'Guarantor relationship to tenant' })
  @IsOptional()
  @IsString()
  guarantorRelationship?: string;

  @ApiPropertyOptional({ description: 'Guarantor annual income', minimum: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  guarantorIncome?: number;

  // Property Condition
  @ApiPropertyOptional({ description: 'Move-in condition report URL' })
  @IsOptional()
  @IsString()
  moveInConditionReport?: string;

  @ApiPropertyOptional({ description: 'Inventory document URL' })
  @IsOptional()
  @IsString()
  inventoryDocument?: string;

  @ApiPropertyOptional({ description: 'Move-in photos', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  moveInPhotos?: string[];

  @ApiPropertyOptional({ description: 'Property condition notes' })
  @IsOptional()
  @IsString()
  conditionNotes?: string;

  // Legal and Compliance
  @ApiPropertyOptional({ description: 'Right to rent check completed' })
  @IsOptional()
  @IsBoolean()
  rightToRentChecked?: boolean;

  @ApiPropertyOptional({ description: 'Right to rent check date' })
  @IsOptional()
  @IsDateString()
  rightToRentCheckDate?: string;

  @ApiPropertyOptional({ description: 'Right to rent documents', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  rightToRentDocuments?: string[];

  @ApiPropertyOptional({ description: 'Reference checks completed' })
  @IsOptional()
  @IsBoolean()
  referenceChecksCompleted?: boolean;

  @ApiPropertyOptional({ description: 'Reference check date' })
  @IsOptional()
  @IsDateString()
  referenceCheckDate?: string;

  @ApiPropertyOptional({ description: 'Credit check completed' })
  @IsOptional()
  @IsBoolean()
  creditCheckCompleted?: boolean;

  @ApiPropertyOptional({ description: 'Credit check score', minimum: 0, maximum: 999 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(999)
  creditCheckScore?: number;

  // Rent Reviews
  @ApiPropertyOptional({ description: 'Whether rent reviews are allowed' })
  @IsOptional()
  @IsBoolean()
  allowRentReviews?: boolean;

  @ApiPropertyOptional({ description: 'Rent review frequency in months', minimum: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  rentReviewFrequency?: number;

  @ApiPropertyOptional({ description: 'Next rent review date' })
  @IsOptional()
  @IsDateString()
  nextRentReviewDate?: string;

  @ApiPropertyOptional({ description: 'Maximum annual rent increase percentage', minimum: 0, maximum: 100 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  maxAnnualRentIncrease?: number;

  // Break Clauses
  @ApiPropertyOptional({ description: 'Whether landlord break clause exists' })
  @IsOptional()
  @IsBoolean()
  hasLandlordBreakClause?: boolean;

  @ApiPropertyOptional({ description: 'Landlord break clause date' })
  @IsOptional()
  @IsDateString()
  landlordBreakClauseDate?: string;

  @ApiPropertyOptional({ description: 'Landlord break notice period in days', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  landlordBreakNoticePeriod?: number;

  @ApiPropertyOptional({ description: 'Whether tenant break clause exists' })
  @IsOptional()
  @IsBoolean()
  hasTenantBreakClause?: boolean;

  @ApiPropertyOptional({ description: 'Tenant break clause date' })
  @IsOptional()
  @IsDateString()
  tenantBreakClauseDate?: string;

  @ApiPropertyOptional({ description: 'Tenant break notice period in days', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  tenantBreakNoticePeriod?: number;

  // Special Terms
  @ApiPropertyOptional({ description: 'Whether pets are allowed' })
  @IsOptional()
  @IsBoolean()
  petsAllowed?: boolean;

  @ApiPropertyOptional({ description: 'Pet deposit amount', minimum: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  petDeposit?: number;

  @ApiPropertyOptional({ description: 'Whether smoking is allowed' })
  @IsOptional()
  @IsBoolean()
  smokingAllowed?: boolean;

  @ApiPropertyOptional({ description: 'Whether subletting is allowed' })
  @IsOptional()
  @IsBoolean()
  sublettingAllowed?: boolean;

  @ApiPropertyOptional({ description: 'Whether alterations are allowed' })
  @IsOptional()
  @IsBoolean()
  alterationsAllowed?: boolean;

  @ApiPropertyOptional({ description: 'Special terms and conditions', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specialTerms?: string[];

  // Documents
  @ApiPropertyOptional({ description: 'Signed tenancy agreement URL' })
  @IsOptional()
  @IsString()
  signedAgreementUrl?: string;

  @ApiPropertyOptional({ description: 'Gas safety certificate URL' })
  @IsOptional()
  @IsString()
  gasSafetyCertificateUrl?: string;

  @ApiPropertyOptional({ description: 'EPC certificate URL' })
  @IsOptional()
  @IsString()
  epcCertificateUrl?: string;

  @ApiPropertyOptional({ description: 'How to rent guide provided' })
  @IsOptional()
  @IsBoolean()
  howToRentGuideProvided?: boolean;

  @ApiPropertyOptional({ description: 'Deposit information provided' })
  @IsOptional()
  @IsBoolean()
  depositInformationProvided?: boolean;

  @ApiPropertyOptional({ description: 'Additional documents', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  additionalDocuments?: string[];

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}
