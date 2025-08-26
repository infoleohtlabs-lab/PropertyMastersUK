import { IsString, IsEnum, IsOptional, IsBoolean, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CommunicationType, Priority } from '../entities/communication.entity';

export class CreateCommunicationDto {
  @ApiProperty({ enum: CommunicationType })
  @IsEnum(CommunicationType)
  type: CommunicationType;

  @ApiProperty()
  @IsUUID()
  senderId: string;

  @ApiProperty()
  @IsUUID()
  recipientId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  propertyId?: string;

  @ApiProperty()
  @IsString()
  subject: string;

  @ApiProperty()
  @IsString()
  message: string;

  @ApiPropertyOptional({ enum: Priority })
  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @ApiPropertyOptional()
  @IsOptional()
  attachments?: any;

  @ApiPropertyOptional()
  @IsOptional()
  metadata?: any;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  templateId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  templateVariables?: any;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isAutomated?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  automationTrigger?: string;
}