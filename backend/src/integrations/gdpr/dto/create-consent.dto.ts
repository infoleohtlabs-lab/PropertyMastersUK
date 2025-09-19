import { IsString, IsEnum, IsOptional, IsBoolean, IsUUID, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ConsentType } from '../entities/data-consent.entity';

export class CreateConsentDto {
  @ApiProperty()
  @IsUUID()
  userId: string;

  @ApiProperty({ enum: ConsentType })
  @IsEnum(ConsentType)
  consentType: ConsentType;

  @ApiProperty()
  @IsBoolean()
  granted: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  expiryDate?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  consentMethod?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ipAddress?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  userAgent?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  consentVersion?: string;

  @ApiPropertyOptional()
  @IsOptional()
  metadata?: any;
}
