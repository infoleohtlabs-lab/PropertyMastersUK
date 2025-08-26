import { IsEnum, IsOptional, IsString, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GdprRequestType } from '../entities/gdpr-request.entity';

export class CreateGdprRequestDto {
  @ApiProperty({ description: 'User ID' })
  @IsString()
  userId: string;

  @ApiProperty({ enum: GdprRequestType, description: 'Type of GDPR request' })
  @IsEnum(GdprRequestType)
  requestType: GdprRequestType;

  @ApiPropertyOptional({ description: 'Description of the request' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Additional request data' })
  @IsOptional()
  @IsObject()
  requestData?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Reason for the request' })
  @IsOptional()
  @IsString()
  reason?: string;
}