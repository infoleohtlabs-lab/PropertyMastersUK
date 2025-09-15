import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsEnum, ValidateNested, IsBoolean, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { PropertyType } from './create-property.dto';

export class ValuationLocation {
  @ApiProperty({ 
    description: 'Full street address for the property to be valued',
    example: '123 Main Street'
  })
  @IsString()
  address: string;

  @ApiProperty({ 
    description: 'City or town where the property is located',
    example: 'London'
  })
  @IsString()
  city: string;

  @ApiProperty({ 
    description: 'Postal code for accurate location identification',
    example: 'SW1A 1AA'
  })
  @IsString()
  postcode: string;

  @ApiPropertyOptional({ 
    description: 'Latitude coordinate for precise location mapping',
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
    description: 'Longitude coordinate for precise location mapping',
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

export class PropertyValuationDto {
  @ApiProperty({ 
    description: 'Type of property to be valued',
    enum: PropertyType,
    example: PropertyType.HOUSE,
    enumName: 'PropertyType'
  })
  @IsEnum(PropertyType)
  propertyType: PropertyType;

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

  @ApiPropertyOptional({ 
    description: 'Total floor area in square feet',
    example: 1500,
    minimum: 100,
    maximum: 50000
  })
  @IsNumber()
  @IsOptional()
  @Min(100)
  squareFeet?: number;

  @ApiPropertyOptional({ 
    description: 'Year the property was built',
    example: 1995,
    minimum: 1800,
    maximum: 2024
  })
  @IsNumber()
  @IsOptional()
  @Min(1800)
  @Max(2024)
  yearBuilt?: number;

  @ApiProperty({ 
    description: 'Location details for the property valuation',
    type: () => ValuationLocation
  })
  @ValidateNested()
  @Type(() => ValuationLocation)
  location: ValuationLocation;

  @ApiPropertyOptional({ 
    description: 'Overall condition of the property (1=Poor, 2=Fair, 3=Good, 4=Very Good, 5=Excellent)',
    example: 4,
    minimum: 1,
    maximum: 5
  })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(5)
  condition?: number;

  @ApiPropertyOptional({ 
    description: 'Whether the property has a garden or outdoor space',
    example: true
  })
  @IsBoolean()
  @IsOptional()
  hasGarden?: boolean;

  @ApiPropertyOptional({ 
    description: 'Whether the property has parking facilities',
    example: true
  })
  @IsBoolean()
  @IsOptional()
  hasParking?: boolean;

  @ApiPropertyOptional({ 
    description: 'Whether the property has a garage',
    example: false
  })
  @IsBoolean()
  @IsOptional()
  hasGarage?: boolean;

  @ApiPropertyOptional({ 
    description: 'Whether the property has undergone recent renovations',
    example: true
  })
  @IsBoolean()
  @IsOptional()
  recentRenovations?: boolean;

  @ApiPropertyOptional({ 
    description: 'Energy efficiency rating of the property',
    example: 'B',
    enum: ['A', 'B', 'C', 'D', 'E', 'F', 'G']
  })
  @IsString()
  @IsOptional()
  energyRating?: string;

  @ApiPropertyOptional({ 
    description: 'Additional information or special circumstances affecting the valuation',
    example: 'Recently renovated kitchen and bathroom. Property overlooks park.',
    maxLength: 1000
  })
  @IsString()
  @IsOptional()
  notes?: string;
}