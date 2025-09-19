import { IsString, IsOptional, IsEnum, IsNumber, IsBoolean, IsArray, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SearchType } from '../entities/property-search.entity';
import { PropertyType } from '../../properties/entities/property.entity';

export class CreateSearchDto {
  @ApiProperty({ enum: SearchType })
  @IsEnum(SearchType)
  type: SearchType;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  minPrice: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxPrice: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  minBedrooms: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  maxBedrooms: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  minBathrooms: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  maxBathrooms: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsEnum(PropertyType, { each: true })
  propertyTypes: PropertyType[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  locations: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  postcodes: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  radius: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  centerLatitude: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  centerLongitude: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  amenities: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  newBuildOnly: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  chainFreeOnly: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  gardenRequired: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  parkingRequired: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  petFriendly: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  furnishedOnly: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  alertFrequency: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  searchCriteria: string;
}
