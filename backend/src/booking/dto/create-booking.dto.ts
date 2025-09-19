import {
  IsString,
  IsDateString,
  IsOptional,
  IsEnum,
  IsUUID,
  IsNumber,
  Min,
  Max,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { BookingType, BookingPriority } from '../entities/booking.entity';

class ContactInfoDto {
  @IsString()
  name: string;

  @IsString()
  email: string;

  @IsString()
  phone: string;
}

class PreferencesDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preferredTimes?: string[];

  @IsOptional()
  @IsString()
  specialRequirements?: string;

  @IsOptional()
  @IsString()
  accessInstructions?: string;
}

export class CreateBookingDto {
  @IsUUID()
  propertyId: string;

  @IsEnum(BookingType)
  type: BookingType;

  @IsDateString()
  scheduledDateTime: string;

  @IsNumber()
  @Min(15)
  @Max(480)
  duration: number; // in minutes

  @IsOptional()
  @IsEnum(BookingPriority)
  priority?: BookingPriority = BookingPriority.MEDIUM;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  purpose?: string;

  @ValidateNested()
  @Type(() => ContactInfoDto)
  contactInfo: ContactInfoDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => PreferencesDto)
  preferences?: PreferencesDto;

  @IsOptional()
  @IsUUID()
  assignedAgentId?: string;



  @IsOptional()
  @IsString()
  meetingLocation?: string;

  @IsOptional()
  @IsString()
  reminderPreference?: string; // '24h', '2h', '30m', etc.
}
