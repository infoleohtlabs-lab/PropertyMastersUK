import { IsString, IsEnum, IsOptional, IsArray, IsBoolean, IsInt, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VrTourType, VrTourStatus } from '../entities/vr-tour.entity';

export class CreateVrTourDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: VrTourType })
  @IsEnum(VrTourType)
  type: VrTourType;

  @ApiPropertyOptional({ enum: VrTourStatus })
  @IsOptional()
  @IsEnum(VrTourStatus)
  status?: VrTourStatus;

  @ApiProperty()
  @IsString()
  propertyId: string;

  @ApiProperty()
  @IsUrl()
  tourUrl: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  thumbnailUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  scenes?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  hotspots?: any;

  @ApiPropertyOptional()
  @IsOptional()
  rooms?: any;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  duration?: number;

  @ApiPropertyOptional()
  @IsOptional()
  settings?: any;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  embedCode?: string;
}
