import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsEnum, IsDateString, IsNumber, IsBoolean } from 'class-validator';
import { ReferenceType } from '../entities/tenant-reference.entity';

export class CreateReferenceDto {
  @ApiProperty({ enum: ReferenceType })
  @IsEnum(ReferenceType)
  type: ReferenceType;

  @ApiProperty()
  @IsString()
  referenceName: string;

  @ApiProperty()
  @IsEmail()
  referenceEmail: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  referencePhone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  referenceAddress?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  relationship?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  companyName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  position?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  monthlySalary?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;
}