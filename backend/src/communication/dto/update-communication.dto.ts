import { PartialType } from '@nestjs/swagger';
import { CreateCommunicationDto } from './create-communication.dto';
import { IsOptional, IsEnum, IsString, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CommunicationStatus } from '../entities/communication.entity';

export class UpdateCommunicationDto extends PartialType(CreateCommunicationDto) {
  @ApiPropertyOptional({ enum: CommunicationStatus })
  @IsOptional()
  @IsEnum(CommunicationStatus)
  status?: CommunicationStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  deliveredAt?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  readAt?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  repliedAt?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  externalId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  errorMessage?: string;
}
