import { PartialType } from '@nestjs/mapped-types';
import {
  IsOptional,
  IsEnum,
  IsString,
  IsDateString,
  IsUUID,
} from 'class-validator';
import { CreateBookingDto } from './create-booking.dto';

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
  RESCHEDULED = 'rescheduled',
  NO_SHOW = 'no_show',
}

export class UpdateBookingDto extends PartialType(CreateBookingDto) {
  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;

  @IsOptional()
  @IsString()
  cancellationReason?: string;

  @IsOptional()
  @IsString()
  rescheduleReason?: string;

  @IsOptional()
  @IsDateString()
  actualStartTime?: string;

  @IsOptional()
  @IsDateString()
  actualEndTime?: string;

  @IsOptional()
  @IsString()
  completionNotes?: string;

  @IsOptional()
  @IsUUID()
  confirmedByAgentId?: string;

  @IsOptional()
  feedback?: Record<string, any>;

  @IsOptional()
  rating?: number;

  @IsOptional()
  @IsString()
  followUpRequired?: string;

  @IsOptional()
  @IsDateString()
  followUpDate?: string;
}
