import { IsString, IsEnum, IsOptional, IsArray, IsBoolean, IsInt, IsDateString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BookingType, Priority } from '../entities/booking.entity';

export class CreateBookingDto {
  @ApiProperty({ enum: BookingType })
  @IsEnum(BookingType)
  type: BookingType;

  @ApiProperty()
  @IsUUID()
  propertyId: string;

  @ApiProperty()
  @IsUUID()
  agentId: string;

  @ApiProperty()
  @IsUUID()
  clientId: string;

  @ApiProperty()
  @IsDateString()
  scheduledDate: Date;

  @ApiProperty()
  @IsString()
  scheduledTime: string;

  @ApiProperty()
  @IsInt()
  duration: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requirements?: string[];

  @ApiPropertyOptional({ enum: Priority })
  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @ApiPropertyOptional()
  @IsOptional()
  reminders?: any;

  @ApiPropertyOptional()
  @IsOptional()
  virtualMeeting?: any;

  @ApiPropertyOptional()
  @IsOptional()
  location?: any;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  followUpRequired?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  attendees?: any;

  @ApiPropertyOptional()
  @IsOptional()
  documents?: any;

  @ApiPropertyOptional()
  @IsOptional()
  checklist?: any;
}
