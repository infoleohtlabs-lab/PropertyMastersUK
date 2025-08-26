import { IsString, IsOptional, IsEnum, IsNumber, IsBoolean, IsArray, IsDateString, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PropertyCondition, FurnishingType } from '../entities/landlord-property.entity';

export class CreatePropertyDto {
  @ApiProperty({ description: 'Property ID from the main properties table' })
  @IsString()
  propertyId: string;

  // Financial Information
  @ApiPropertyOptional({ description: 'Purchase price of the property', minimum: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  purchasePrice?: number;

  @ApiPropertyOptional({ description: 'Current market value', minimum: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  currentMarketValue?: number;

  @ApiPropertyOptional({ description: 'Monthly rental amount', minimum: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  monthlyRent?: number;

  @ApiPropertyOptional({ description: 'Weekly rental amount', minimum: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  weeklyRent?: number;

  @ApiPropertyOptional({ description: 'Annual rental income', minimum: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  annualRentalIncome?: number;

  @ApiPropertyOptional({ description: 'Security deposit amount', minimum: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  depositAmount?: number;

  // Mortgage Information
  @ApiPropertyOptional({ description: 'Outstanding mortgage balance', minimum: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  mortgageBalance?: number;

  @ApiPropertyOptional({ description: 'Monthly mortgage payment', minimum: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  monthlyMortgagePayment?: number;

  @ApiPropertyOptional({ description: 'Mortgage interest rate', minimum: 0, maximum: 100 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  @Max(100)
  mortgageInterestRate?: number;

  @ApiPropertyOptional({ description: 'Mortgage lender name' })
  @IsOptional()
  @IsString()
  mortgageLender?: string;

  @ApiPropertyOptional({ description: 'Mortgage end date' })
  @IsOptional()
  @IsDateString()
  mortgageEndDate?: string;

  @ApiPropertyOptional({ description: 'Whether mortgage is interest only' })
  @IsOptional()
  @IsBoolean()
  isInterestOnly?: boolean;

  // Insurance Information
  @ApiPropertyOptional({ description: 'Annual buildings insurance cost', minimum: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  buildingsInsuranceCost?: number;

  @ApiPropertyOptional({ description: 'Annual contents insurance cost', minimum: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  contentsInsuranceCost?: number;

  @ApiPropertyOptional({ description: 'Annual landlord insurance cost', minimum: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  landlordInsuranceCost?: number;

  @ApiPropertyOptional({ description: 'Buildings insurance provider' })
  @IsOptional()
  @IsString()
  buildingsInsuranceProvider?: string;

  @ApiPropertyOptional({ description: 'Buildings insurance policy number' })
  @IsOptional()
  @IsString()
  buildingsInsurancePolicyNumber?: string;

  @ApiPropertyOptional({ description: 'Buildings insurance renewal date' })
  @IsOptional()
  @IsDateString()
  buildingsInsuranceRenewal?: string;

  // Property Details
  @ApiPropertyOptional({ description: 'Floor area in square feet', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  floorArea?: number;

  @ApiPropertyOptional({ description: 'Year the property was built', minimum: 1800 })
  @IsOptional()
  @IsNumber()
  @Min(1800)
  yearBuilt?: number;

  @ApiPropertyOptional({ enum: PropertyCondition, description: 'Overall condition of the property' })
  @IsOptional()
  @IsEnum(PropertyCondition)
  condition?: PropertyCondition;

  @ApiPropertyOptional({ enum: FurnishingType, description: 'Furnishing type' })
  @IsOptional()
  @IsEnum(FurnishingType)
  furnishingType?: FurnishingType;

  @ApiPropertyOptional({ description: 'Whether property has garden' })
  @IsOptional()
  @IsBoolean()
  hasGarden?: boolean;

  @ApiPropertyOptional({ description: 'Whether property has parking' })
  @IsOptional()
  @IsBoolean()
  hasParking?: boolean;

  @ApiPropertyOptional({ description: 'Whether property has garage' })
  @IsOptional()
  @IsBoolean()
  hasGarage?: boolean;

  @ApiPropertyOptional({ description: 'Number of parking spaces', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  parkingSpaces?: number;

  // Lease Information
  @ApiPropertyOptional({ description: 'Whether property is leasehold' })
  @IsOptional()
  @IsBoolean()
  isLeasehold?: boolean;

  @ApiPropertyOptional({ description: 'Lease expiry date' })
  @IsOptional()
  @IsDateString()
  leaseExpiryDate?: string;

  @ApiPropertyOptional({ description: 'Annual ground rent', minimum: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  groundRent?: number;

  @ApiPropertyOptional({ description: 'Annual service charge', minimum: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  serviceCharge?: number;

  @ApiPropertyOptional({ description: 'Managing agent for leasehold' })
  @IsOptional()
  @IsString()
  managingAgent?: string;

  @ApiPropertyOptional({ description: 'Managing agent contact' })
  @IsOptional()
  @IsString()
  managingAgentContact?: string;

  // Compliance and Certificates
  @ApiPropertyOptional({ description: 'EPC rating' })
  @IsOptional()
  @IsString()
  epcRating?: string;

  @ApiPropertyOptional({ description: 'EPC expiry date' })
  @IsOptional()
  @IsDateString()
  epcExpiryDate?: string;

  @ApiPropertyOptional({ description: 'Gas safety certificate expiry date' })
  @IsOptional()
  @IsDateString()
  gasSafetyCertificateExpiry?: string;

  @ApiPropertyOptional({ description: 'Electrical safety certificate expiry date' })
  @IsOptional()
  @IsDateString()
  electricalSafetyCertificateExpiry?: string;

  @ApiPropertyOptional({ description: 'Whether property requires HMO license' })
  @IsOptional()
  @IsBoolean()
  requiresHmoLicense?: boolean;

  @ApiPropertyOptional({ description: 'HMO license number' })
  @IsOptional()
  @IsString()
  hmoLicenseNumber?: string;

  @ApiPropertyOptional({ description: 'HMO license expiry date' })
  @IsOptional()
  @IsDateString()
  hmoLicenseExpiry?: string;

  @ApiPropertyOptional({ description: 'Whether property requires selective license' })
  @IsOptional()
  @IsBoolean()
  requiresSelectiveLicense?: boolean;

  @ApiPropertyOptional({ description: 'Selective license number' })
  @IsOptional()
  @IsString()
  selectiveLicenseNumber?: string;

  @ApiPropertyOptional({ description: 'Selective license expiry date' })
  @IsOptional()
  @IsDateString()
  selectiveLicenseExpiry?: string;

  // Tenancy Information
  @ApiPropertyOptional({ description: 'Maximum number of tenants allowed', minimum: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxTenants?: number;

  @ApiPropertyOptional({ description: 'Whether pets are allowed' })
  @IsOptional()
  @IsBoolean()
  petsAllowed?: boolean;

  @ApiPropertyOptional({ description: 'Whether smoking is allowed' })
  @IsOptional()
  @IsBoolean()
  smokingAllowed?: boolean;

  @ApiPropertyOptional({ description: 'Whether students are accepted' })
  @IsOptional()
  @IsBoolean()
  studentsAccepted?: boolean;

  @ApiPropertyOptional({ description: 'Whether DSS/benefits tenants are accepted' })
  @IsOptional()
  @IsBoolean()
  dssAccepted?: boolean;

  @ApiPropertyOptional({ description: 'Minimum tenancy length in months', minimum: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  minimumTenancyLength?: number;

  @ApiPropertyOptional({ description: 'Maximum tenancy length in months' })
  @IsOptional()
  @IsNumber()
  maximumTenancyLength?: number;

  // Marketing Information
  @ApiPropertyOptional({ description: 'Whether property is currently marketed' })
  @IsOptional()
  @IsBoolean()
  isMarketed?: boolean;

  @ApiPropertyOptional({ description: 'Marketing start date' })
  @IsOptional()
  @IsDateString()
  marketingStartDate?: string;

  @ApiPropertyOptional({ description: 'Target rent amount', minimum: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  targetRent?: number;

  @ApiPropertyOptional({ description: 'Marketing description' })
  @IsOptional()
  @IsString()
  marketingDescription?: string;

  @ApiPropertyOptional({ description: 'Key selling points', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keySellingPoints?: string[];

  @ApiPropertyOptional({ description: 'Marketing platforms', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  marketingPlatforms?: string[];

  // Performance Metrics
  @ApiPropertyOptional({ description: 'Days on market', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  daysOnMarket?: number;

  @ApiPropertyOptional({ description: 'Number of viewings', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  viewings?: number;

  @ApiPropertyOptional({ description: 'Number of applications', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  applications?: number;

  @ApiPropertyOptional({ description: 'Occupancy rate percentage', minimum: 0, maximum: 100 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  occupancyRate?: number;

  @ApiPropertyOptional({ description: 'Average tenancy length in months', minimum: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 1 })
  @Min(0)
  averageTenancyLength?: number;

  @ApiPropertyOptional({ description: 'Tenant turnover rate percentage', minimum: 0, maximum: 100 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  tenantTurnoverRate?: number;

  // Costs and Expenses
  @ApiPropertyOptional({ description: 'Annual maintenance costs', minimum: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  annualMaintenanceCosts?: number;

  @ApiPropertyOptional({ description: 'Annual management fees', minimum: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  annualManagementFees?: number;

  @ApiPropertyOptional({ description: 'Annual council tax', minimum: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  annualCouncilTax?: number;

  @ApiPropertyOptional({ description: 'Annual utility costs', minimum: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  annualUtilityCosts?: number;

  @ApiPropertyOptional({ description: 'Annual legal costs', minimum: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  annualLegalCosts?: number;

  @ApiPropertyOptional({ description: 'Annual accounting costs', minimum: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  annualAccountingCosts?: number;

  @ApiPropertyOptional({ description: 'Annual other expenses', minimum: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  annualOtherExpenses?: number;

  // Investment Analysis
  @ApiPropertyOptional({ description: 'Gross rental yield percentage', minimum: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  grossRentalYield?: number;

  @ApiPropertyOptional({ description: 'Net rental yield percentage', minimum: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  netRentalYield?: number;

  @ApiPropertyOptional({ description: 'Capital growth percentage', minimum: -100 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(-100)
  capitalGrowth?: number;

  @ApiPropertyOptional({ description: 'Total return on investment percentage' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  totalReturn?: number;

  @ApiPropertyOptional({ description: 'Additional notes about the property' })
  @IsOptional()
  @IsString()
  notes?: string;
}