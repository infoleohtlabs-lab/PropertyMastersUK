import { IsString, IsEnum, IsOptional, IsBoolean, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GdprRequestType } from '../entities/gdpr-request.entity';

export class CreateGdprRequestDto {
  @ApiProperty({ enum: GdprRequestType })
  @IsEnum(GdprRequestType)
  requestType: GdprRequestType;

  @ApiProperty()
  @IsUUID()
  userId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  requestDetails?: string;

  @ApiPropertyOptional()
  @IsOptional()
  attachments?: any;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  verificationMethod?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  identityVerified?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  legalBasis?: string;
}
