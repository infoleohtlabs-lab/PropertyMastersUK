import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PropertyType } from './create-property.dto';

class ValuationLocation {
  @ApiProperty({ description: 'Street address' })
  @IsString()
  address: string;

  @ApiProperty({ description: 'City' })
  @IsString()
  city: string;

  @ApiProperty({ description: 'Postal code' })
  @IsString()
  postcode: string;

  @ApiProperty({ description: 'Latitude coordinate', required: false })
  @IsNumber()
  @IsOptional()
  latitude?: number;

  @ApiProperty({ description: 'Longitude coordinate', required: false })
  @IsNumber()
  @IsOptional()
  longitude?: number;
}

export class PropertyValuationDto {
  @ApiProperty({ enum: PropertyType, description: 'Type of property' })
  @IsEnum(PropertyType)
  propertyType: PropertyType;

  @ApiProperty({ description: 'Number of bedrooms' })
  @IsNumber()
  bedrooms: number;

  @ApiProperty({ description: 'Number of bathrooms' })
  @IsNumber()
  bathrooms: number;

  @ApiProperty({ description: 'Property size in square feet', required: false })
  @IsNumber()
  @IsOptional()
  squareFeet?: number;

  @ApiProperty({ description: 'Year built', required: false })
  @IsNumber()
  @IsOptional()
  yearBuilt?: number;

  @ApiProperty({ type: ValuationLocation, description: 'Property location' })
  @ValidateNested()
  @Type(() => ValuationLocation)
  location: ValuationLocation;

  @ApiProperty({ description: 'Property condition (1-5 scale)', required: false })
  @IsNumber()
  @IsOptional()
  condition?: number;

  @ApiProperty({ description: 'Has garden', required: false })
  @IsOptional()
  hasGarden?: boolean;

  @ApiProperty({ description: 'Has parking', required: false })
  @IsOptional()
  hasParking?: boolean;

  @ApiProperty({ description: 'Has garage', required: false })
  @IsOptional()
  hasGarage?: boolean;

  @ApiProperty({ description: 'Recent renovations', required: false })
  @IsOptional()
  recentRenovations?: boolean;

  @ApiProperty({ description: 'Energy rating (A-G)', required: false })
  @IsString()
  @IsOptional()
  energyRating?: string;

  @ApiProperty({ description: 'Additional notes for valuation', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}