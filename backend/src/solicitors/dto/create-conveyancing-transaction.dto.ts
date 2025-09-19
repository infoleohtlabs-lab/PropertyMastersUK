import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsArray,
  IsNumber,
  IsEnum,
  IsBoolean,
  IsUUID,
  IsDateString,
  MinLength,
  MaxLength,
  Min,
  Max,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  TransactionType,
  PropertyType,
  TenureType,
} from '../entities/conveyancing-transaction.entity';

export class PartyInfoDto {
  @ApiProperty({ description: 'Party name' })
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  name: string;

  @ApiProperty({ description: 'Party address' })
  @IsString()
  @MinLength(10)
  @MaxLength(500)
  address: string;

  @ApiProperty({ description: 'Phone number', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;

  @ApiProperty({ description: 'Email address', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  email?: string;

  @ApiProperty({ description: 'Solicitor information', required: false })
  @IsOptional()
  @IsObject()
  solicitor?: {
    name: string;
    firm: string;
    address: string;
    phone?: string;
    email?: string;
    reference?: string;
  };
}

export class EstateAgentInfoDto {
  @ApiProperty({ description: 'Agent name' })
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  name: string;

  @ApiProperty({ description: 'Firm name' })
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  firm: string;

  @ApiProperty({ description: 'Address' })
  @IsString()
  @MinLength(10)
  @MaxLength(500)
  address: string;

  @ApiProperty({ description: 'Phone number', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;

  @ApiProperty({ description: 'Email address', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  email?: string;

  @ApiProperty({ description: 'Reference number', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  reference?: string;
}

export class MilestoneDto {
  @ApiProperty({ description: 'Milestone name' })
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  name: string;

  @ApiProperty({ description: 'Milestone description', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ description: 'Target date', required: false })
  @IsOptional()
  @IsDateString()
  targetDate?: string;

  @ApiProperty({ description: 'Priority level' })
  @IsEnum(['low', 'medium', 'high'])
  priority: 'low' | 'medium' | 'high';
}

export class EnquiryDto {
  @ApiProperty({ description: 'Enquiry question' })
  @IsString()
  @MinLength(5)
  @MaxLength(1000)
  question: string;

  @ApiProperty({ description: 'Response to enquiry', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  response?: string;

  @ApiProperty({ description: 'Date enquiry was raised' })
  @IsDateString()
  dateRaised: string;

  @ApiProperty({ description: 'Date response was received', required: false })
  @IsOptional()
  @IsDateString()
  dateResponded?: string;

  @ApiProperty({ description: 'Enquiry status' })
  @IsEnum(['pending', 'responded', 'satisfactory', 'requires_follow_up'])
  status: 'pending' | 'responded' | 'satisfactory' | 'requires_follow_up';
}

export class ClientUpdateDto {
  @ApiProperty({ description: 'Update content' })
  @IsString()
  @MinLength(5)
  @MaxLength(1000)
  update: string;

  @ApiProperty({ description: 'Communication method' })
  @IsEnum(['email', 'phone', 'letter', 'meeting'])
  method: 'email' | 'phone' | 'letter' | 'meeting';
}

export class CreateConveyancingTransactionDto {
  @ApiProperty({ description: 'Transaction type', enum: TransactionType })
  @IsEnum(TransactionType)
  transactionType: TransactionType;

  @ApiProperty({ description: 'Client user ID' })
  @IsUUID()
  clientId: string;

  @ApiProperty({ description: 'Assigned solicitor ID' })
  @IsUUID()
  solicitorId: string;

  @ApiProperty({ description: 'Property address' })
  @IsString()
  @MinLength(10)
  @MaxLength(500)
  propertyAddress: string;

  @ApiProperty({ description: 'Property postcode' })
  @IsString()
  @MinLength(5)
  @MaxLength(10)
  propertyPostcode: string;

  @ApiProperty({ description: 'Property type', enum: PropertyType })
  @IsEnum(PropertyType)
  propertyType: PropertyType;

  @ApiProperty({ description: 'Tenure type', enum: TenureType })
  @IsEnum(TenureType)
  tenureType: TenureType;

  @ApiProperty({ description: 'Property value' })
  @IsNumber()
  @Min(1000)
  @Max(50000000)
  propertyValue: number;

  @ApiProperty({ description: 'Land Registry title number', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  titleNumber?: string;

  @ApiProperty({ description: 'Lease expiry date for leasehold properties', required: false })
  @IsOptional()
  @IsDateString()
  leaseExpiryDate?: string;

  @ApiProperty({ description: 'Ground rent amount for leasehold properties', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10000)
  groundRent?: number;

  @ApiProperty({ description: 'Service charge amount for leasehold properties', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(50000)
  serviceCharge?: number;

  @ApiProperty({ description: 'Deposit amount', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  deposit?: number;

  @ApiProperty({ description: 'Mortgage amount', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  mortgageAmount?: number;

  @ApiProperty({ description: 'Mortgage lender name', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  mortgageLender?: string;

  @ApiProperty({ description: 'Mortgage offer date', required: false })
  @IsOptional()
  @IsDateString()
  mortgageOfferDate?: string;

  @ApiProperty({ description: 'Mortgage offer expiry date', required: false })
  @IsOptional()
  @IsDateString()
  mortgageOfferExpiryDate?: string;

  @ApiProperty({ description: 'Stamp duty amount', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  stampDuty?: number;

  @ApiProperty({ description: 'Legal fees', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  legalFees?: number;

  @ApiProperty({ description: 'Search costs', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  searchCosts?: number;

  @ApiProperty({ description: 'Survey fees', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  surveyFees?: number;

  @ApiProperty({ description: 'Other costs', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  otherCosts?: number;

  @ApiProperty({ description: 'Vendor/seller information', type: PartyInfoDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => PartyInfoDto)
  vendor?: PartyInfoDto;

  @ApiProperty({ description: 'Other party information', type: PartyInfoDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => PartyInfoDto)
  otherParty?: PartyInfoDto;

  @ApiProperty({ description: 'Estate agent information', type: EstateAgentInfoDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => EstateAgentInfoDto)
  estateAgent?: EstateAgentInfoDto;

  @ApiProperty({ description: 'Instruction date' })
  @IsDateString()
  instructionDate: string;

  @ApiProperty({ description: 'Target exchange date', required: false })
  @IsOptional()
  @IsDateString()
  targetExchangeDate?: string;

  @ApiProperty({ description: 'Target completion date', required: false })
  @IsOptional()
  @IsDateString()
  targetCompletionDate?: string;

  @ApiProperty({ description: 'Key milestones', type: [MilestoneDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MilestoneDto)
  milestones?: MilestoneDto[];

  @ApiProperty({ description: 'Next action required', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  nextAction?: string;

  @ApiProperty({ description: 'Next action due date', required: false })
  @IsOptional()
  @IsDateString()
  nextActionDueDate?: string;

  @ApiProperty({ description: 'Initial enquiries', type: [EnquiryDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EnquiryDto)
  enquiries?: EnquiryDto[];

  @ApiProperty({ description: 'Internal notes', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;

  @ApiProperty({ description: 'Initial client updates', type: [ClientUpdateDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ClientUpdateDto)
  clientUpdates?: ClientUpdateDto[];

  @ApiProperty({ description: 'Risk factors identified', isArray: true, required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  riskFactors?: string[];

  @ApiProperty({ description: 'AML checks completed', required: false })
  @IsOptional()
  @IsBoolean()
  amlChecksCompleted?: boolean;

  @ApiProperty({ description: 'Source of funds verified', required: false })
  @IsOptional()
  @IsBoolean()
  sourceOfFundsVerified?: boolean;

  @ApiProperty({ description: 'Client ID verified', required: false })
  @IsOptional()
  @IsBoolean()
  clientIdVerified?: boolean;

  @ApiProperty({ description: 'Special instructions', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  specialInstructions?: string;

  @ApiProperty({ description: 'Urgency level', required: false })
  @IsOptional()
  @IsEnum(['standard', 'urgent', 'emergency'])
  urgencyLevel?: 'standard' | 'urgent' | 'emergency';

  @ApiProperty({ description: 'Chain position', required: false })
  @IsOptional()
  @IsEnum(['first_time_buyer', 'chain_free', 'bottom_of_chain', 'middle_of_chain', 'top_of_chain'])
  chainPosition?: 'first_time_buyer' | 'chain_free' | 'bottom_of_chain' | 'middle_of_chain' | 'top_of_chain';

  @ApiProperty({ description: 'Cash buyer', required: false })
  @IsOptional()
  @IsBoolean()
  cashBuyer?: boolean;

  @ApiProperty({ description: 'First time buyer', required: false })
  @IsOptional()
  @IsBoolean()
  firstTimeBuyer?: boolean;

  @ApiProperty({ description: 'Help to Buy scheme', required: false })
  @IsOptional()
  @IsBoolean()
  helpToBuy?: boolean;

  @ApiProperty({ description: 'Shared ownership', required: false })
  @IsOptional()
  @IsBoolean()
  sharedOwnership?: boolean;

  @ApiProperty({ description: 'Right to Buy', required: false })
  @IsOptional()
  @IsBoolean()
  rightToBuy?: boolean;

  @ApiProperty({ description: 'Auction purchase', required: false })
  @IsOptional()
  @IsBoolean()
  auctionPurchase?: boolean;

  @ApiProperty({ description: 'New build property', required: false })
  @IsOptional()
  @IsBoolean()
  newBuild?: boolean;

  @ApiProperty({ description: 'Listed building', required: false })
  @IsOptional()
  @IsBoolean()
  listedBuilding?: boolean;

  @ApiProperty({ description: 'Conservation area', required: false })
  @IsOptional()
  @IsBoolean()
  conservationArea?: boolean;

  @ApiProperty({ description: 'Flying freehold', required: false })
  @IsOptional()
  @IsBoolean()
  flyingFreehold?: boolean;

  @ApiProperty({ description: 'Unregistered land', required: false })
  @IsOptional()
  @IsBoolean()
  unregisteredLand?: boolean;

  @ApiProperty({ description: 'Defective title', required: false })
  @IsOptional()
  @IsBoolean()
  defectiveTitle?: boolean;
}
