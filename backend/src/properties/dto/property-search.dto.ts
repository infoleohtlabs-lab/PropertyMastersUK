import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsEnum, IsBoolean, IsArray } from 'class-validator';
import { PropertyType, ListingType } from './create-property.dto';

export class PropertySearchDto {
  @ApiProperty({ description: 'Search query/keywords', required: false })
  @IsString()
  @IsOptional()
  query?: string;

  @ApiProperty({ description: 'Location (city, postcode, area)', required: false })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({ description: 'Minimum price', required: false })
  @IsNumber()
  @IsOptional()
  minPrice?: number;

  @ApiProperty({ description: 'Maximum price', required: false })
  @IsNumber()
  @IsOptional()
  maxPrice?: number;

  @ApiProperty({ enum: PropertyType, description: 'Property type', required: false })
  @IsEnum(PropertyType)
  @IsOptional()
  propertyType?: PropertyType;

  @ApiProperty({ enum: ListingType, description: 'Listing type', required: false })
  @IsEnum(ListingType)
  @IsOptional()
  listingType?: ListingType;

  @ApiProperty({ description: 'Minimum bedrooms', required: false })
  @IsNumber()
  @IsOptional()
  minBedrooms?: number;

  @ApiProperty({ description: 'Maximum bedrooms', required: false })
  @IsNumber()
  @IsOptional()
  maxBedrooms?: number;

  @ApiProperty({ description: 'Minimum bathrooms', required: false })
  @IsNumber()
  @IsOptional()
  minBathrooms?: number;

  @ApiProperty({ description: 'Maximum bathrooms', required: false })
  @IsNumber()
  @IsOptional()
  maxBathrooms?: number;

  @ApiProperty({ description: 'Minimum square feet', required: false })
  @IsNumber()
  @IsOptional()
  minSquareFeet?: number;

  @ApiProperty({ description: 'Maximum square feet', required: false })
  @IsNumber()
  @IsOptional()
  maxSquareFeet?: number;

  @ApiProperty({ description: 'Has garden', required: false })
  @IsBoolean()
  @IsOptional()
  hasGarden?: boolean;

  @ApiProperty({ description: 'Has parking', required: false })
  @IsBoolean()
  @IsOptional()
  hasParking?: boolean;

  @ApiProperty({ description: 'Has garage', required: false })
  @IsBoolean()
  @IsOptional()
  hasGarage?: boolean;

  @ApiProperty({ description: 'Is furnished', required: false })
  @IsBoolean()
  @IsOptional()
  isFurnished?: boolean;

  @ApiProperty({ description: 'Pet friendly', required: false })
  @IsBoolean()
  @IsOptional()
  petFriendly?: boolean;

  @ApiProperty({ description: 'Search radius in kilometers', required: false })
  @IsNumber()
  @IsOptional()
  radius?: number;

  @ApiProperty({ description: 'Sort by field', required: false })
  @IsString()
  @IsOptional()
  sortBy?: string;

  @ApiProperty({ description: 'Sort order (asc/desc)', required: false })
  @IsString()
  @IsOptional()
  sortOrder?: 'asc' | 'desc';

  @ApiProperty({ description: 'Page number', required: false, default: 1 })
  @IsNumber()
  @IsOptional()
  page?: number;

  @ApiProperty({ description: 'Items per page', required: false, default: 20 })
  @IsNumber()
  @IsOptional()
  limit?: number;

  @ApiProperty({ description: 'Search name for saving', required: false })
  @IsString()
  @IsOptional()
  searchName?: string;

  @ApiProperty({ description: 'Enable email alerts for this search', required: false })
  @IsBoolean()
  @IsOptional()
  emailAlerts?: boolean;

  @ApiProperty({ description: 'Property tags to filter by', type: [String], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}