import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsEnum, IsBoolean, IsArray, Min, Max } from 'class-validator';
import { PropertyType, ListingType } from './create-property.dto';

export class PropertySearchDto {
  @ApiPropertyOptional({ 
    description: 'Search keywords for property title, description, or features',
    example: 'Victorian house garden',
    maxLength: 100
  })
  @IsString()
  @IsOptional()
  query?: string;

  @ApiPropertyOptional({ 
    description: 'Location search including city, postcode, area, or street name',
    example: 'London SW1A',
    maxLength: 100
  })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiPropertyOptional({ 
    description: 'Minimum price filter in GBP',
    example: 200000,
    minimum: 0,
    maximum: 50000000
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({ 
    description: 'Maximum price filter in GBP',
    example: 1000000,
    minimum: 0,
    maximum: 50000000
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({ 
    description: 'Filter by specific property type',
    enum: PropertyType,
    example: PropertyType.HOUSE,
    enumName: 'PropertyType'
  })
  @IsEnum(PropertyType)
  @IsOptional()
  propertyType?: PropertyType;

  @ApiPropertyOptional({ 
    description: 'Filter by listing type (sale or rental)',
    enum: ListingType,
    example: ListingType.SALE,
    enumName: 'ListingType'
  })
  @IsEnum(ListingType)
  @IsOptional()
  listingType?: ListingType;

  @ApiPropertyOptional({ 
    description: 'Minimum number of bedrooms required',
    example: 2,
    minimum: 0,
    maximum: 20
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(20)
  minBedrooms?: number;

  @ApiPropertyOptional({ 
    description: 'Maximum number of bedrooms',
    example: 4,
    minimum: 0,
    maximum: 20
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(20)
  maxBedrooms?: number;

  @ApiPropertyOptional({ 
    description: 'Minimum number of bathrooms required',
    example: 1,
    minimum: 0,
    maximum: 10
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(10)
  minBathrooms?: number;

  @ApiPropertyOptional({ 
    description: 'Maximum number of bathrooms',
    example: 3,
    minimum: 0,
    maximum: 10
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(10)
  maxBathrooms?: number;

  @ApiPropertyOptional({ 
    description: 'Minimum property size in square feet',
    example: 800,
    minimum: 0,
    maximum: 50000
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  minSquareFeet?: number;

  @ApiPropertyOptional({ 
    description: 'Maximum property size in square feet',
    example: 2500,
    minimum: 0,
    maximum: 50000
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  maxSquareFeet?: number;

  @ApiPropertyOptional({ 
    description: 'Filter properties that have a garden',
    example: true
  })
  @IsBoolean()
  @IsOptional()
  hasGarden?: boolean;

  @ApiPropertyOptional({ 
    description: 'Filter properties that have parking available',
    example: true
  })
  @IsBoolean()
  @IsOptional()
  hasParking?: boolean;

  @ApiPropertyOptional({ 
    description: 'Filter properties that have a garage',
    example: false
  })
  @IsBoolean()
  @IsOptional()
  hasGarage?: boolean;

  @ApiPropertyOptional({ 
    description: 'Filter properties that come furnished',
    example: true
  })
  @IsBoolean()
  @IsOptional()
  isFurnished?: boolean;

  @ApiPropertyOptional({ 
    description: 'Filter properties that allow pets',
    example: false
  })
  @IsBoolean()
  @IsOptional()
  petFriendly?: boolean;

  @ApiPropertyOptional({ 
    description: 'Search radius from location in kilometers',
    example: 5,
    minimum: 0.1,
    maximum: 100
  })
  @IsNumber()
  @IsOptional()
  @Min(0.1)
  @Max(100)
  radius?: number;

  @ApiPropertyOptional({ 
    description: 'Field to sort results by',
    example: 'price',
    enum: ['price', 'createdAt', 'bedrooms', 'bathrooms', 'title']
  })
  @IsString()
  @IsOptional()
  sortBy?: string;

  @ApiPropertyOptional({ 
    description: 'Sort order for results',
    example: 'asc',
    enum: ['asc', 'desc']
  })
  @IsString()
  @IsOptional()
  sortOrder?: 'asc' | 'desc';

  @ApiPropertyOptional({ 
    description: 'Page number for pagination',
    example: 1,
    default: 1,
    minimum: 1
  })
  @IsNumber()
  @IsOptional()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ 
    description: 'Number of items per page',
    example: 20,
    default: 20,
    minimum: 1,
    maximum: 100
  })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({ 
    description: 'Name for saving this search criteria',
    example: 'London Houses Under 500k',
    maxLength: 100
  })
  @IsString()
  @IsOptional()
  searchName?: string;

  @ApiPropertyOptional({ 
    description: 'Enable email notifications for new properties matching this search',
    example: false,
    default: false
  })
  @IsBoolean()
  @IsOptional()
  emailAlerts?: boolean;

  @ApiPropertyOptional({ 
    description: 'Filter by specific property tags',
    type: [String],
    example: ['modern', 'garden', 'near-station'],
    maxItems: 10
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}