import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsArray, IsEnum, IsBoolean, IsDateString, ValidateNested, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export enum PropertyType {
  HOUSE = 'house',
  FLAT = 'flat',
  APARTMENT = 'apartment',
  BUNGALOW = 'bungalow',
  MAISONETTE = 'maisonette',
  TERRACED = 'terraced',
  SEMI_DETACHED = 'semi_detached',
  DETACHED = 'detached',
  STUDIO = 'studio',
  PENTHOUSE = 'penthouse',
  LAND = 'land',
  COMMERCIAL = 'commercial',
  OFFICE = 'office',
  RETAIL = 'retail',
  WAREHOUSE = 'warehouse',
  INDUSTRIAL = 'industrial',
}

export enum PropertyStatus {
  AVAILABLE = 'available',
  UNDER_OFFER = 'under_offer',
  SOLD = 'sold',
  LET = 'let',
  WITHDRAWN = 'withdrawn',
  MAINTENANCE = 'maintenance',
  DRAFT = 'draft',
}

export enum ListingType {
  SALE = 'sale',
  RENT = 'rent',
  BOTH = 'both',
}

class PropertyLocation {
  @ApiProperty({ description: 'Street address' })
  @IsString()
  address: string;

  @ApiProperty({ description: 'City' })
  @IsString()
  city: string;

  @ApiProperty({ description: 'County/State' })
  @IsString()
  county: string;

  @ApiProperty({ description: 'Postal code' })
  @IsString()
  postcode: string;

  @ApiProperty({ description: 'Country', default: 'UK' })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiProperty({ description: 'Latitude coordinate', required: false })
  @IsNumber()
  @IsOptional()
  latitude?: number;

  @ApiProperty({ description: 'Longitude coordinate', required: false })
  @IsNumber()
  @IsOptional()
  longitude?: number;
}

class PropertyFeatures {
  @ApiProperty({ description: 'Has garden', required: false })
  @IsBoolean()
  @IsOptional()
  garden?: boolean;

  @ApiProperty({ description: 'Has parking', required: false })
  @IsBoolean()
  @IsOptional()
  parking?: boolean;

  @ApiProperty({ description: 'Has garage', required: false })
  @IsBoolean()
  @IsOptional()
  garage?: boolean;

  @ApiProperty({ description: 'Has balcony', required: false })
  @IsBoolean()
  @IsOptional()
  balcony?: boolean;

  @ApiProperty({ description: 'Has terrace', required: false })
  @IsBoolean()
  @IsOptional()
  terrace?: boolean;

  @ApiProperty({ description: 'Is furnished', required: false })
  @IsBoolean()
  @IsOptional()
  furnished?: boolean;

  @ApiProperty({ description: 'Pet friendly', required: false })
  @IsBoolean()
  @IsOptional()
  petFriendly?: boolean;

  @ApiProperty({ description: 'Has fireplace', required: false })
  @IsBoolean()
  @IsOptional()
  fireplace?: boolean;

  @ApiProperty({ description: 'Has swimming pool', required: false })
  @IsBoolean()
  @IsOptional()
  swimmingPool?: boolean;

  @ApiProperty({ description: 'Has gym', required: false })
  @IsBoolean()
  @IsOptional()
  gym?: boolean;
}

export class CreatePropertyDto {
  @ApiProperty({ description: 'Property title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Property description' })
  @IsString()
  description: string;

  @ApiProperty({ enum: PropertyType, description: 'Type of property' })
  @IsEnum(PropertyType)
  propertyType: PropertyType;

  @ApiProperty({ enum: ListingType, description: 'Listing type (sale/rent)' })
  @IsEnum(ListingType)
  listingType: ListingType;

  @ApiProperty({ description: 'Property price' })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ description: 'Monthly rent price', required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  rentPrice?: number;

  @ApiProperty({ description: 'Number of bedrooms' })
  @IsNumber()
  @Min(0)
  @Max(20)
  bedrooms: number;

  @ApiProperty({ description: 'Number of bathrooms' })
  @IsNumber()
  @Min(0)
  @Max(20)
  bathrooms: number;

  @ApiProperty({ description: 'Property size in square feet', required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  squareFeet?: number;

  @ApiProperty({ description: 'Year built', required: false })
  @IsNumber()
  @IsOptional()
  @Min(1800)
  @Max(new Date().getFullYear())
  yearBuilt?: number;

  @ApiProperty({ type: PropertyLocation, description: 'Property location' })
  @ValidateNested()
  @Type(() => PropertyLocation)
  location: PropertyLocation;

  @ApiProperty({ type: PropertyFeatures, description: 'Property features', required: false })
  @ValidateNested()
  @Type(() => PropertyFeatures)
  @IsOptional()
  features?: PropertyFeatures;

  @ApiProperty({ description: 'Property images URLs', type: [String], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];

  @ApiProperty({ description: 'Virtual tour URL', required: false })
  @IsString()
  @IsOptional()
  virtualTourUrl?: string;

  @ApiProperty({ description: 'Video URL', required: false })
  @IsString()
  @IsOptional()
  videoUrl?: string;

  @ApiProperty({ description: 'Energy rating (A-G)', required: false })
  @IsString()
  @IsOptional()
  energyRating?: string;

  @ApiProperty({ description: 'Council tax band', required: false })
  @IsString()
  @IsOptional()
  councilTaxBand?: string;

  @ApiProperty({ description: 'Available from date', required: false })
  @IsDateString()
  @IsOptional()
  availableFrom?: string;

  @ApiProperty({ description: 'Is property featured', default: false })
  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  @ApiProperty({ enum: PropertyStatus, description: 'Property status', default: PropertyStatus.AVAILABLE })
  @IsEnum(PropertyStatus)
  @IsOptional()
  status?: PropertyStatus;

  @ApiProperty({ description: 'Additional property tags', type: [String], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}