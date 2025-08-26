import { IsEnum, IsOptional, IsString, IsBoolean, IsDateString, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ConsentType } from '../entities/data-consent.entity';

export class CreateConsentDto {
  @ApiProperty({ description: 'User ID' })
  @IsString()
  userId: string;

  @ApiProperty({ enum: ConsentType, description: 'Type of consent' })
  @IsEnum(ConsentType)
  consentType: ConsentType;

  @ApiProperty({ description: 'Whether consent is granted' })
  @IsBoolean()
  granted: boolean;

  @ApiPropertyOptional({ description: 'Date when consent was granted' })
  @IsOptional()
  @IsDateString()
  grantedDate?: Date;

  @ApiPropertyOptional({ description: 'Purpose of data processing' })
  @IsOptional()
  @IsString()
  purpose?: string;

  @ApiPropertyOptional({ description: 'Description of consent' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({ description: 'IP address when consent was given' })
  @IsOptional()
  @IsString()
  ipAddress?: string;

  @ApiPropertyOptional({ description: 'User agent when consent was given' })
  @IsOptional()
  @IsString()
  userAgent?: string;

  @ApiPropertyOptional({ description: 'Expiry date for consent' })
  @IsOptional()
  @IsDateString()
  expiryDate?: Date;
}