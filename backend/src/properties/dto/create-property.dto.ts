import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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

export class PropertyLocation {
  @ApiProperty({ 
    description: 'Full street address including house number and street name',
    example: '123 Main Street'
  })
  @IsString()
  address: string;

  @ApiProperty({ 
    description: 'City or town name',
    example: 'London'
  })
  @IsString()
  city: string;

  @ApiProperty({ 
    description: 'County or state',
    example: 'Greater London'
  })
  @IsString()
  county: string;

  @ApiProperty({ 
    description: 'Postal code or ZIP code',
    example: 'SW1A 1AA'
  })
  @IsString()
  postcode: string;

  @ApiPropertyOptional({ 
    description: 'Country code or name',
    default: 'UK',
    example: 'UK'
  })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiPropertyOptional({ 
    description: 'Latitude coordinate for mapping',
    example: 51.5074,
    minimum: -90,
    maximum: 90
  })
  @IsNumber()
  @IsOptional()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @ApiPropertyOptional({ 
    description: 'Longitude coordinate for mapping',
    example: -0.1278,
    minimum: -180,
    maximum: 180
  })
  @IsNumber()
  @IsOptional()
  @Min(-180)
  @Max(180)
  longitude?: number;
}

export class PropertyFeatures {
  @ApiPropertyOptional({ 
    description: 'Property has a garden or outdoor space',
    example: true
  })
  @IsBoolean()
  @IsOptional()
  garden?: boolean;

  @ApiPropertyOptional({ 
    description: 'Property has parking space available',
    example: true
  })
  @IsBoolean()
  @IsOptional()
  parking?: boolean;

  @ApiPropertyOptional({ 
    description: 'Property has a garage',
    example: false
  })
  @IsBoolean()
  @IsOptional()
  garage?: boolean;

  @ApiPropertyOptional({ 
    description: 'Property has a balcony',
    example: true
  })
  @IsBoolean()
  @IsOptional()
  balcony?: boolean;

  @ApiPropertyOptional({ 
    description: 'Property has a terrace or patio',
    example: false
  })
  @IsBoolean()
  @IsOptional()
  terrace?: boolean;

  @ApiPropertyOptional({ 
    description: 'Property comes furnished',
    example: true
  })
  @IsBoolean()
  @IsOptional()
  furnished?: boolean;

  @ApiPropertyOptional({ 
    description: 'Pets are allowed in the property',
    example: false
  })
  @IsBoolean()
  @IsOptional()
  petFriendly?: boolean;

  @ApiPropertyOptional({ 
    description: 'Property has a fireplace',
    example: true
  })
  @IsBoolean()
  @IsOptional()
  fireplace?: boolean;

  @ApiPropertyOptional({ 
    description: 'Property has access to a swimming pool',
    example: false
  })
  @IsBoolean()
  @IsOptional()
  swimmingPool?: boolean;

  @ApiPropertyOptional({ 
    description: 'Property has access to a gym or fitness center',
    example: false
  })
  @IsBoolean()
  @IsOptional()
  gym?: boolean;
}

export class CreatePropertyDto {
  @ApiProperty({ 
    description: 'Descriptive title for the property listing',
    example: 'Beautiful 3-Bedroom Victorian House in Central London',
    minLength: 10,
    maxLength: 200
  })
  @IsString()
  title: string;

  @ApiProperty({ 
    description: 'Detailed description of the property including key features and amenities',
    example: 'A stunning Victorian terraced house featuring original period details, modern kitchen, spacious living areas, and a private garden. Located in a quiet residential street with excellent transport links.',
    minLength: 50,
    maxLength: 2000
  })
  @IsString()
  description: string;

  @ApiProperty({ 
    description: 'Type of property',
    enum: PropertyType,
    example: PropertyType.HOUSE,
    enumName: 'PropertyType'
  })
  @IsEnum(PropertyType)
  propertyType: PropertyType;

  @ApiProperty({ 
    description: 'Whether the property is for sale or rent',
    enum: ListingType,
    example: ListingType.SALE,
    enumName: 'ListingType'
  })
  @IsEnum(ListingType)
  listingType: ListingType;

  @ApiProperty({ 
    description: 'Property price in GBP (for sale) or monthly rent (for rental)',
    example: 750000,
    minimum: 0,
    maximum: 50000000
  })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ description: 'Monthly rent price', required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  rentPrice?: number;

  @ApiProperty({ 
    description: 'Number of bedrooms in the property',
    example: 3,
    minimum: 0,
    maximum: 20
  })
  @IsNumber()
  @Min(0)
  @Max(20)
  bedrooms: number;

  @ApiProperty({ 
    description: 'Number of bathrooms in the property',
    example: 2,
    minimum: 0,
    maximum: 10
  })
  @IsNumber()
  @Min(0)
  @Max(10)
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

  @ApiProperty({ 
    description: 'Property location details including address and coordinates',
    type: () => PropertyLocation
  })
  @ValidateNested()
  @Type(() => PropertyLocation)
  location: PropertyLocation;

  @ApiPropertyOptional({ 
    description: 'Additional property features and amenities',
    type: () => PropertyFeatures
  })
  @ValidateNested()
  @Type(() => PropertyFeatures)
  @IsOptional()
  features?: PropertyFeatures;

  @ApiPropertyOptional({ 
    description: 'Array of image URLs for the property',
    type: [String],
    example: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
    maxItems: 20
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];

  @ApiPropertyOptional({ 
    description: 'URL for virtual tour or 360-degree view',
    example: 'https://example.com/virtual-tour/property-123',
    format: 'uri'
  })
  @IsString()
  @IsOptional()
  virtualTourUrl?: string;

  @ApiPropertyOptional({ 
    description: 'URL for property video walkthrough',
    example: 'https://youtube.com/watch?v=example',
    format: 'uri'
  })
  @IsString()
  @IsOptional()
  videoUrl?: string;

  @ApiPropertyOptional({ 
    description: 'Energy efficiency rating (A-G scale)',
    example: 'B',
    enum: ['A', 'B', 'C', 'D', 'E', 'F', 'G']
  })
  @IsString()
  @IsOptional()
  energyRating?: string;

  @ApiPropertyOptional({ 
    description: 'Council tax band classification',
    example: 'D',
    enum: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
  })
  @IsString()
  @IsOptional()
  councilTaxBand?: string;

  @ApiPropertyOptional({ 
    description: 'Date when the property becomes available (ISO 8601 format)',
    example: '2024-03-01T00:00:00.000Z',
    format: 'date-time'
  })
  @IsDateString()
  @IsOptional()
  availableFrom?: string;

  @ApiPropertyOptional({ 
    description: 'Whether this property should be featured prominently',
    example: false,
    default: false
  })
  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  @ApiPropertyOptional({ 
    description: 'Current status of the property listing',
    enum: PropertyStatus,
    example: PropertyStatus.AVAILABLE,
    enumName: 'PropertyStatus'
  })
  @IsEnum(PropertyStatus)
  @IsOptional()
  propertyStatus?: PropertyStatus;

  @ApiPropertyOptional({ 
    description: 'Searchable tags for categorizing the property',
    type: [String],
    example: ['modern', 'garden', 'near-station', 'family-friendly'],
    maxItems: 10
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}
