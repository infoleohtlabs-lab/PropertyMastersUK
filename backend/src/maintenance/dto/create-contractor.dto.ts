import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
  IsDateString,
  IsArray,
  IsBoolean,
  IsEmail,
  IsUrl,
  IsObject,
  Min,
  Max,
} from 'class-validator';
import {
  ContractorStatus,
  ContractorType,
} from '../entities/contractor.entity';

export class CreateContractorDto {
  @ApiProperty({ description: 'Contractor name or company name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Type of contractor', enum: ContractorType, required: false })
  @IsOptional()
  @IsEnum(ContractorType)
  type?: ContractorType;

  @ApiProperty({ description: 'Current status', enum: ContractorStatus, required: false })
  @IsOptional()
  @IsEnum(ContractorStatus)
  status?: ContractorStatus;

  @ApiProperty({ description: 'Primary contact person name', required: false })
  @IsOptional()
  @IsString()
  contactPerson?: string;

  @ApiProperty({ description: 'Primary email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Primary phone number' })
  @IsString()
  phone: string;

  @ApiProperty({ description: 'Secondary phone number', required: false })
  @IsOptional()
  @IsString()
  alternatePhone?: string;

  @ApiProperty({ description: 'Business address', required: false })
  @IsOptional()
  @IsObject()
  address?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };

  @ApiProperty({ description: 'Website URL', required: false })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiProperty({ description: 'Business registration number', required: false })
  @IsOptional()
  @IsString()
  registrationNumber?: string;

  @ApiProperty({ description: 'Tax identification number', required: false })
  @IsOptional()
  @IsString()
  taxId?: string;

  @ApiProperty({ description: 'Insurance policy number', required: false })
  @IsOptional()
  @IsString()
  insurancePolicyNumber?: string;

  @ApiProperty({ description: 'Insurance expiry date', required: false })
  @IsOptional()
  @IsDateString()
  insuranceExpiryDate?: string;

  @ApiProperty({ description: 'List of specialties/services offered', type: [String] })
  @IsArray()
  @IsString({ each: true })
  specialties: string[];

  @ApiProperty({ description: 'Service areas covered', type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  serviceAreas?: string[];

  @ApiProperty({ description: 'Hourly rate', required: false })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  hourlyRate?: number;

  @ApiProperty({ description: 'Minimum charge amount', required: false })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  minimumCharge?: number;

  @ApiProperty({ description: 'Emergency call-out rate', required: false })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  emergencyRate?: number;

  @ApiProperty({ description: 'Overall rating (1-5)', required: false })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(5)
  rating?: number;

  @ApiProperty({ description: 'Total number of ratings', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalRatings?: number;

  @ApiProperty({ description: 'Total number of completed jobs', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  completedJobs?: number;

  @ApiProperty({ description: 'Average response time in hours', required: false })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  averageResponseTime?: number;

  @ApiProperty({ description: 'Whether contractor is available for emergency calls', required: false })
  @IsOptional()
  @IsBoolean()
  emergencyAvailable?: boolean;

  @ApiProperty({ description: 'Working hours', required: false })
  @IsOptional()
  @IsObject()
  workingHours?: {
    monday: { start: string; end: string; available: boolean };
    tuesday: { start: string; end: string; available: boolean };
    wednesday: { start: string; end: string; available: boolean };
    thursday: { start: string; end: string; available: boolean };
    friday: { start: string; end: string; available: boolean };
    saturday: { start: string; end: string; available: boolean };
    sunday: { start: string; end: string; available: boolean };
  };

  @ApiProperty({ description: 'Certifications and licenses', required: false })
  @IsOptional()
  @IsArray()
  certifications?: {
    name: string;
    number: string;
    issuedBy: string;
    issuedDate: Date;
    expiryDate: Date;
    documentUrl: string;
  }[];

  @ApiProperty({ description: 'Bank account details for payments', required: false })
  @IsOptional()
  @IsObject()
  bankDetails?: {
    accountName: string;
    accountNumber: string;
    sortCode: string;
    bankName: string;
  };

  @ApiProperty({ description: 'Preferred payment method', required: false })
  @IsOptional()
  @IsString()
  preferredPaymentMethod?: string;

  @ApiProperty({ description: 'Payment terms in days', required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  paymentTerms?: number;

  @ApiProperty({ description: 'Notes about the contractor', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'Internal notes for staff', required: false })
  @IsOptional()
  @IsString()
  internalNotes?: string;

  @ApiProperty({ description: 'Date when contractor was approved', required: false })
  @IsOptional()
  @IsDateString()
  approvedAt?: string;

  @ApiProperty({ description: 'Date when contractor was last contacted', required: false })
  @IsOptional()
  @IsDateString()
  lastContactedAt?: string;

  @ApiProperty({ description: 'Additional metadata', required: false })
  @IsOptional()
  @IsObject()
  metadata?: any;
}