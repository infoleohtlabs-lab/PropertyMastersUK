import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsOptional, IsString, IsNumber, IsBoolean, IsEnum, IsDateString, IsEmail, IsPhoneNumber } from 'class-validator';
import { EmploymentStatus } from '../entities/tenant.entity';

export class CreateTenantDto {
  @ApiProperty()
  @IsUUID()
  userId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  nationalInsuranceNumber?: string;

  @ApiProperty({ enum: EmploymentStatus, required: false })
  @IsOptional()
  @IsEnum(EmploymentStatus)
  employmentStatus?: EmploymentStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  employerName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  employerAddress?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  employerPhone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  monthlyIncome?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  jobTitle?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  employmentStartDate?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  currentAddress?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  currentPostcode?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  currentLandlordName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  currentLandlordPhone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEmail()
  currentLandlordEmail?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  tenancyStartDate?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  tenancyEndDate?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  currentRent?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  reasonForLeaving?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  hasPets?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  petDetails?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isSmoker?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  emergencyContactName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsPhoneNumber('GB')
  emergencyContactPhone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  emergencyContactRelationship?: string;
}