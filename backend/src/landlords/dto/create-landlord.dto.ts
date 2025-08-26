import { IsString, IsEmail, IsOptional, IsEnum, IsNumber, IsBoolean, IsArray, IsDateString, ValidateNested, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LandlordType, PortfolioSize } from '../entities/landlord.entity';

export class CreateLandlordDto {
  @ApiProperty({ description: 'First name of the landlord' })
  @IsString()
  firstName: string;

  @ApiProperty({ description: 'Last name of the landlord' })
  @IsString()
  lastName: string;

  @ApiProperty({ description: 'Email address' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ description: 'Phone number' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'Mobile number' })
  @IsOptional()
  @IsString()
  mobile?: string;

  @ApiPropertyOptional({ description: 'Date of birth' })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiPropertyOptional({ description: 'National Insurance number' })
  @IsOptional()
  @IsString()
  nationalInsuranceNumber?: string;

  // Address Information
  @ApiPropertyOptional({ description: 'Address line 1' })
  @IsOptional()
  @IsString()
  addressLine1?: string;

  @ApiPropertyOptional({ description: 'Address line 2' })
  @IsOptional()
  @IsString()
  addressLine2?: string;

  @ApiPropertyOptional({ description: 'City' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ description: 'County' })
  @IsOptional()
  @IsString()
  county?: string;

  @ApiPropertyOptional({ description: 'Postcode' })
  @IsOptional()
  @IsString()
  postcode?: string;

  @ApiPropertyOptional({ description: 'Country' })
  @IsOptional()
  @IsString()
  country?: string;

  // Business Information
  @ApiPropertyOptional({ enum: LandlordType, description: 'Type of landlord' })
  @IsOptional()
  @IsEnum(LandlordType)
  landlordType?: LandlordType;

  @ApiPropertyOptional({ description: 'Company name (for corporate landlords)' })
  @IsOptional()
  @IsString()
  companyName?: string;

  @ApiPropertyOptional({ description: 'Company registration number' })
  @IsOptional()
  @IsString()
  companyRegistrationNumber?: string;

  @ApiPropertyOptional({ description: 'VAT number' })
  @IsOptional()
  @IsString()
  vatNumber?: string;

  @ApiPropertyOptional({ description: 'UTR (Unique Taxpayer Reference)' })
  @IsOptional()
  @IsString()
  utr?: string;

  @ApiPropertyOptional({ enum: PortfolioSize, description: 'Size of property portfolio' })
  @IsOptional()
  @IsEnum(PortfolioSize)
  portfolioSize?: PortfolioSize;

  // Financial Information
  @ApiPropertyOptional({ description: 'Total portfolio value', minimum: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  portfolioValue?: number;

  @ApiPropertyOptional({ description: 'Annual rental income', minimum: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  annualRentalIncome?: number;

  @ApiPropertyOptional({ description: 'Total mortgage debt', minimum: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  totalMortgageDebt?: number;

  @ApiPropertyOptional({ description: 'Monthly mortgage payments', minimum: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  monthlyMortgagePayments?: number;

  @ApiPropertyOptional({ description: 'Annual insurance costs', minimum: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  annualInsuranceCosts?: number;

  @ApiPropertyOptional({ description: 'Annual maintenance budget', minimum: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  annualMaintenanceBudget?: number;

  // Bank Details
  @ApiPropertyOptional({ description: 'Bank name' })
  @IsOptional()
  @IsString()
  bankName?: string;

  @ApiPropertyOptional({ description: 'Account holder name' })
  @IsOptional()
  @IsString()
  accountHolderName?: string;

  @ApiPropertyOptional({ description: 'Sort code' })
  @IsOptional()
  @IsString()
  sortCode?: string;

  @ApiPropertyOptional({ description: 'Account number' })
  @IsOptional()
  @IsString()
  accountNumber?: string;

  // Insurance Information
  @ApiPropertyOptional({ description: 'Buildings insurance provider' })
  @IsOptional()
  @IsString()
  buildingsInsuranceProvider?: string;

  @ApiPropertyOptional({ description: 'Buildings insurance policy number' })
  @IsOptional()
  @IsString()
  buildingsInsurancePolicyNumber?: string;

  @ApiPropertyOptional({ description: 'Buildings insurance expiry date' })
  @IsOptional()
  @IsDateString()
  buildingsInsuranceExpiry?: string;

  @ApiPropertyOptional({ description: 'Liability insurance provider' })
  @IsOptional()
  @IsString()
  liabilityInsuranceProvider?: string;

  @ApiPropertyOptional({ description: 'Liability insurance policy number' })
  @IsOptional()
  @IsString()
  liabilityInsurancePolicyNumber?: string;

  @ApiPropertyOptional({ description: 'Liability insurance expiry date' })
  @IsOptional()
  @IsDateString()
  liabilityInsuranceExpiry?: string;

  // Legal and Compliance
  @ApiPropertyOptional({ description: 'Solicitor name' })
  @IsOptional()
  @IsString()
  solicitorName?: string;

  @ApiPropertyOptional({ description: 'Solicitor firm' })
  @IsOptional()
  @IsString()
  solicitorFirm?: string;

  @ApiPropertyOptional({ description: 'Solicitor phone' })
  @IsOptional()
  @IsString()
  solicitorPhone?: string;

  @ApiPropertyOptional({ description: 'Solicitor email' })
  @IsOptional()
  @IsEmail()
  solicitorEmail?: string;

  @ApiPropertyOptional({ description: 'Accountant name' })
  @IsOptional()
  @IsString()
  accountantName?: string;

  @ApiPropertyOptional({ description: 'Accountant firm' })
  @IsOptional()
  @IsString()
  accountantFirm?: string;

  @ApiPropertyOptional({ description: 'Accountant phone' })
  @IsOptional()
  @IsString()
  accountantPhone?: string;

  @ApiPropertyOptional({ description: 'Accountant email' })
  @IsOptional()
  @IsEmail()
  accountantEmail?: string;

  @ApiPropertyOptional({ description: 'Whether landlord is registered for self-assessment' })
  @IsOptional()
  @IsBoolean()
  isSelfAssessmentRegistered?: boolean;

  @ApiPropertyOptional({ description: 'Whether landlord is VAT registered' })
  @IsOptional()
  @IsBoolean()
  isVatRegistered?: boolean;

  @ApiPropertyOptional({ description: 'Whether landlord has landlord insurance' })
  @IsOptional()
  @IsBoolean()
  hasLandlordInsurance?: boolean;

  @ApiPropertyOptional({ description: 'Whether landlord has rent guarantee insurance' })
  @IsOptional()
  @IsBoolean()
  hasRentGuaranteeInsurance?: boolean;

  // Property Management Preferences
  @ApiPropertyOptional({ description: 'Whether landlord uses a property management company' })
  @IsOptional()
  @IsBoolean()
  usesPropertyManagement?: boolean;

  @ApiPropertyOptional({ description: 'Property management company name' })
  @IsOptional()
  @IsString()
  propertyManagementCompany?: string;

  @ApiPropertyOptional({ description: 'Property management contact' })
  @IsOptional()
  @IsString()
  propertyManagementContact?: string;

  @ApiPropertyOptional({ description: 'Property management phone' })
  @IsOptional()
  @IsString()
  propertyManagementPhone?: string;

  @ApiPropertyOptional({ description: 'Property management email' })
  @IsOptional()
  @IsEmail()
  propertyManagementEmail?: string;

  @ApiPropertyOptional({ description: 'Property management fee percentage', minimum: 0, maximum: 100 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  managementFeePercentage?: number;

  @ApiPropertyOptional({ description: 'Whether landlord self-manages properties' })
  @IsOptional()
  @IsBoolean()
  isSelfManaged?: boolean;

  // Notification Preferences
  @ApiPropertyOptional({ description: 'Whether to receive email notifications' })
  @IsOptional()
  @IsBoolean()
  emailNotifications?: boolean;

  @ApiPropertyOptional({ description: 'Whether to receive SMS notifications' })
  @IsOptional()
  @IsBoolean()
  smsNotifications?: boolean;

  @ApiPropertyOptional({ description: 'Whether to receive push notifications' })
  @IsOptional()
  @IsBoolean()
  pushNotifications?: boolean;

  @ApiPropertyOptional({ description: 'Whether to receive rent payment notifications' })
  @IsOptional()
  @IsBoolean()
  rentPaymentNotifications?: boolean;

  @ApiPropertyOptional({ description: 'Whether to receive maintenance notifications' })
  @IsOptional()
  @IsBoolean()
  maintenanceNotifications?: boolean;

  @ApiPropertyOptional({ description: 'Whether to receive inspection notifications' })
  @IsOptional()
  @IsBoolean()
  inspectionNotifications?: boolean;

  @ApiPropertyOptional({ description: 'Whether to receive document expiry notifications' })
  @IsOptional()
  @IsBoolean()
  documentExpiryNotifications?: boolean;

  @ApiPropertyOptional({ description: 'Whether to receive tenancy notifications' })
  @IsOptional()
  @IsBoolean()
  tenancyNotifications?: boolean;

  // Experience and Background
  @ApiPropertyOptional({ description: 'Years of experience as a landlord', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  yearsExperience?: number;

  @ApiPropertyOptional({ description: 'Date when started as landlord' })
  @IsOptional()
  @IsDateString()
  startedLandlordDate?: string;

  @ApiPropertyOptional({ description: 'Previous experience in property' })
  @IsOptional()
  @IsString()
  previousExperience?: string;

  @ApiPropertyOptional({ description: 'Investment strategy' })
  @IsOptional()
  @IsString()
  investmentStrategy?: string;

  @ApiPropertyOptional({ description: 'Target tenant types', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targetTenantTypes?: string[];

  @ApiPropertyOptional({ description: 'Preferred property types', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preferredPropertyTypes?: string[];

  @ApiPropertyOptional({ description: 'Target locations', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targetLocations?: string[];

  // Emergency Contact
  @ApiPropertyOptional({ description: 'Emergency contact name' })
  @IsOptional()
  @IsString()
  emergencyContactName?: string;

  @ApiPropertyOptional({ description: 'Emergency contact phone' })
  @IsOptional()
  @IsString()
  emergencyContactPhone?: string;

  @ApiPropertyOptional({ description: 'Emergency contact email' })
  @IsOptional()
  @IsEmail()
  emergencyContactEmail?: string;

  @ApiPropertyOptional({ description: 'Emergency contact relationship' })
  @IsOptional()
  @IsString()
  emergencyContactRelationship?: string;

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}