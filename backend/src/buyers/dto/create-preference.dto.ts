import { IsString, IsOptional, IsEnum, IsNumber, IsBoolean, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PreferenceType, PreferencePriority } from '../entities/buyer-preference.entity';

export class CreatePreferenceDto {
  @ApiProperty({ enum: PreferenceType })
  @IsEnum(PreferenceType)
  type: PreferenceType;

  @ApiProperty({ enum: PreferencePriority })
  @IsEnum(PreferencePriority)
  priority: PreferencePriority;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  value: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  numericValue: number;
}
