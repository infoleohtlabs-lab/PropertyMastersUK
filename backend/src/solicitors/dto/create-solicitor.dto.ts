import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsOptional,
  IsArray,
  IsNumber,
  IsEnum,
  IsBoolean,
  IsUUID,
  MinLength,
  MaxLength,
  IsPhoneNumber,
  Min,
  Max,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum SolicitorSpecialization {
  CONVEYANCING = 'conveyancing',
  FAMILY_LAW = 'family_law',
  CRIMINAL_LAW = 'criminal_law',
  COMMERCIAL_LAW = 'commercial_law',
  EMPLOYMENT_LAW = 'employment_law',
  PERSONAL_INJURY = 'personal_injury',
  WILLS_PROBATE = 'wills_probate',
  IMMIGRATION = 'immigration',
  INTELLECTUAL_PROPERTY = 'intellectual_property',
  LITIGATION = 'litigation',
  CORPORATE_LAW = 'corporate_law',
  TAX_LAW = 'tax_law',
}

export class QualificationDto {
  @ApiProperty({ description: 'Qualification name' })
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  name: string;

  @ApiProperty({ description: 'Institution that awarded the qualification' })
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  institution: string;

  @ApiProperty({ description: 'Year qualification was obtained' })
  @IsNumber()
  @Min(1950)
  @Max(new Date().getFullYear())
  year: number;

  @ApiProperty({ description: 'Grade or classification', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  grade?: string;
}

export class ProfessionalMembershipDto {
  @ApiProperty({ description: 'Organization name' })
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  organization: string;

  @ApiProperty({ description: 'Membership number' })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  membershipNumber: string;

  @ApiProperty({ description: 'Membership status' })
  @IsEnum(['active', 'inactive', 'suspended'])
  status: 'active' | 'inactive' | 'suspended';

  @ApiProperty({ description: 'Date membership started' })
  @IsString()
  startDate: string;

  @ApiProperty({ description: 'Date membership expires', required: false })
  @IsOptional()
  @IsString()
  expiryDate?: string;
}

export class CreateSolicitorDto {
  @ApiProperty({ description: 'User ID to associate with this solicitor profile' })
  @IsUUID()
  userId: string;

  @ApiProperty({ description: 'Solicitor registration number' })
  @IsString()
  @MinLength(5)
  @MaxLength(20)
  registrationNumber: string;

  @ApiProperty({ description: 'Law firm name' })
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  firmName: string;

  @ApiProperty({ description: 'Firm address' })
  @IsString()
  @MinLength(10)
  @MaxLength(500)
  firmAddress: string;

  @ApiProperty({ description: 'Firm postcode' })
  @IsString()
  @MinLength(5)
  @MaxLength(10)
  firmPostcode: string;

  @ApiProperty({ description: 'Firm phone number' })
  @IsPhoneNumber('GB')
  firmPhone: string;

  @ApiProperty({ description: 'Firm email address' })
  @IsEmail()
  firmEmail: string;

  @ApiProperty({ description: 'Firm website URL', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  firmWebsite?: string;

  @ApiProperty({ description: 'Job title within the firm' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  jobTitle: string;

  @ApiProperty({ description: 'Department within the firm', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  department?: string;

  @ApiProperty({ description: 'Years of experience' })
  @IsNumber()
  @Min(0)
  @Max(60)
  yearsOfExperience: number;

  @ApiProperty({ 
    description: 'Areas of specialization',
    enum: SolicitorSpecialization,
    isArray: true
  })
  @IsArray()
  @IsEnum(SolicitorSpecialization, { each: true })
  specializations: SolicitorSpecialization[];

  @ApiProperty({ description: 'Languages spoken', isArray: true, required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  languages?: string[];

  @ApiProperty({ 
    description: 'Professional qualifications',
    type: [QualificationDto],
    required: false
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QualificationDto)
  qualifications?: QualificationDto[];

  @ApiProperty({ 
    description: 'Professional memberships',
    type: [ProfessionalMembershipDto],
    required: false
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProfessionalMembershipDto)
  professionalMemberships?: ProfessionalMembershipDto[];

  @ApiProperty({ description: 'Professional biography', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  biography?: string;

  @ApiProperty({ description: 'Hourly rate in GBP', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(2000)
  hourlyRate?: number;

  @ApiProperty({ description: 'Whether currently accepting new clients' })
  @IsBoolean()
  acceptingNewClients: boolean;

  @ApiProperty({ description: 'Maximum number of active cases', required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(500)
  maxActiveCases?: number;

  @ApiProperty({ description: 'Preferred communication methods', isArray: true, required: false })
  @IsOptional()
  @IsArray()
  @IsEnum(['email', 'phone', 'video_call', 'in_person'], { each: true })
  preferredCommunication?: ('email' | 'phone' | 'video_call' | 'in_person')[];

  @ApiProperty({ description: 'Office hours', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  officeHours?: string;

  @ApiProperty({ description: 'Emergency contact availability', required: false })
  @IsOptional()
  @IsBoolean()
  emergencyContact?: boolean;

  @ApiProperty({ description: 'Professional indemnity insurance details', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  insuranceDetails?: string;

  @ApiProperty({ description: 'SRA (Solicitors Regulation Authority) number', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  sraNumber?: string;

  @ApiProperty({ description: 'Additional certifications', isArray: true, required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  certifications?: string[];

  @ApiProperty({ description: 'Areas of expertise beyond specializations', isArray: true, required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  expertiseAreas?: string[];

  @ApiProperty({ description: 'Client testimonials or references', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  testimonials?: string;

  @ApiProperty({ description: 'Awards and recognitions', isArray: true, required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  awards?: string[];

  @ApiProperty({ description: 'Publications and articles', isArray: true, required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  publications?: string[];

  @ApiProperty({ description: 'Speaking engagements and conferences', isArray: true, required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  speakingEngagements?: string[];

  @ApiProperty({ description: 'Pro bono work availability', required: false })
  @IsOptional()
  @IsBoolean()
  proBonoAvailable?: boolean;

  @ApiProperty({ description: 'Continuing professional development hours completed', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(200)
  cpdHours?: number;

  @ApiProperty({ description: 'Last CPD update date', required: false })
  @IsOptional()
  @IsString()
  lastCpdUpdate?: string;
}
