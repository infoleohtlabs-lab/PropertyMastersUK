import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsDateString, IsOptional, IsString, IsNumber, IsEnum, Min, Max } from 'class-validator';
import { ViewingType } from '../entities/viewing.entity';

export class CreateViewingDto {
  @ApiProperty({ description: 'Property ID for the viewing' })
  @IsUUID()
  propertyId: string;

  @ApiProperty({ description: 'Agent ID handling the viewing', required: false })
  @IsOptional()
  @IsUUID()
  agentId?: string;

  @ApiProperty({ description: 'Scheduled date and time for the viewing' })
  @IsDateString()
  scheduledDate: string;

  @ApiProperty({ description: 'Duration in minutes', required: false, default: 30 })
  @IsOptional()
  @IsNumber()
  @Min(15)
  @Max(180)
  durationMinutes?: number;

  @ApiProperty({ description: 'Type of viewing', enum: ViewingType, default: ViewingType.PHYSICAL })
  @IsOptional()
  @IsEnum(ViewingType)
  viewingType?: ViewingType;

  @ApiProperty({ description: 'Additional notes for the viewing', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'Attendee details as JSON string', required: false })
  @IsOptional()
  @IsString()
  attendees?: string;

  @ApiProperty({ description: 'Special requirements for the viewing', required: false })
  @IsOptional()
  @IsString()
  specialRequirements?: string;

  @ApiProperty({ description: 'Meeting point for the viewing', required: false })
  @IsOptional()
  @IsString()
  meetingPoint?: string;

  @ApiProperty({ description: 'Contact number for the viewing', required: false })
  @IsOptional()
  @IsString()
  contactNumber?: string;
}
