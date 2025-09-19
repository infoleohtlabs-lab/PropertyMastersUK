import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsEnum, IsDateString, IsBoolean, Min, Max } from 'class-validator';
import { ViewingStatus, ViewingType } from '../entities/viewing.entity';

export class UpdateViewingDto {
  @ApiProperty({ description: 'Viewing status', enum: ViewingStatus, required: false })
  @IsOptional()
  @IsEnum(ViewingStatus)
  status?: ViewingStatus;

  @ApiProperty({ description: 'Rescheduled date and time', required: false })
  @IsOptional()
  @IsDateString()
  scheduledDate?: string;

  @ApiProperty({ description: 'Duration in minutes', required: false })
  @IsOptional()
  @IsNumber()
  @Min(15)
  @Max(180)
  durationMinutes?: number;

  @ApiProperty({ description: 'Type of viewing', enum: ViewingType, required: false })
  @IsOptional()
  @IsEnum(ViewingType)
  viewingType?: ViewingType;

  @ApiProperty({ description: 'Updated notes for the viewing', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'Feedback after the viewing', required: false })
  @IsOptional()
  @IsString()
  feedback?: string;

  @ApiProperty({ description: 'Rating from 1-5', required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating?: number;

  @ApiProperty({ description: 'Updated attendee details', required: false })
  @IsOptional()
  @IsString()
  attendees?: string;

  @ApiProperty({ description: 'Special requirements', required: false })
  @IsOptional()
  @IsString()
  specialRequirements?: string;

  @ApiProperty({ description: 'Whether interested in the property', required: false })
  @IsOptional()
  @IsBoolean()
  isInterested?: boolean;

  @ApiProperty({ description: 'Cancellation reason', required: false })
  @IsOptional()
  @IsString()
  cancellationReason?: string;

  @ApiProperty({ description: 'Agent notes', required: false })
  @IsOptional()
  @IsString()
  agentNotes?: string;

  @ApiProperty({ description: 'Meeting point', required: false })
  @IsOptional()
  @IsString()
  meetingPoint?: string;

  @ApiProperty({ description: 'Contact number', required: false })
  @IsOptional()
  @IsString()
  contactNumber?: string;
}
