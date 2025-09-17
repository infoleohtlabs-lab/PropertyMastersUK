import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsBoolean, IsArray, IsEnum, IsDateString, Min, Max } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { PropertyType, ExportFormat, TenureType } from '../../../shared/types/land-registry.types';

export class PropertySearchDto {
  @ApiProperty({ description: 'Property postcode', required: false, example: 'SW1A 1AA' })
  @IsOptional()
  @IsString()
  postcode?: string;

  @ApiProperty({ description: 'Property address', required: false, example: '10 Downing Street' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ description: 'Unique Property Reference Number', required: false, example: '123456789012' })
  @IsOptional()
  @IsString()
  uprn?: string;

  @ApiProperty({ description: 'Land Registry title number', required: false, example: 'NGL123456' })
  @IsOptional()
  @IsString()
  titleNumber?: string;

  @ApiProperty({ 
    description: 'Property types', 
    required: false, 
    enum: PropertyType,
    isArray: true,
    example: ['D', 'S']
  })
  @IsOptional()
  @IsArray()
  @IsEnum(PropertyType, { each: true })
  @Transform(({ value }) => Array.isArray(value) ? value : [value])
  propertyTypes?: PropertyType[];

  @ApiProperty({ description: 'Number of results to return (max 100)', required: false, minimum: 1, maximum: 100, default: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiProperty({ description: 'Number of results to skip', required: false, minimum: 0, default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  offset?: number;
}

export class OwnershipLookupDto {
  @ApiProperty({ description: 'Land Registry title number', required: false, example: 'NGL123456' })
  @IsOptional()
  @IsString()
  titleNumber?: string;

  @ApiProperty({ description: 'Unique Property Reference Number', required: false, example: '123456789012' })
  @IsOptional()
  @IsString()
  uprn?: string;

  @ApiProperty({ description: 'Property postcode', required: false, example: 'SW1A 1AA' })
  @IsOptional()
  @IsString()
  postcode?: string;

  @ApiProperty({ description: 'Property address', required: false, example: '10 Downing Street' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ description: 'Include ownership history', required: false, default: false })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  includeHistory?: boolean;
}

export class PricePaidSearchDto {
  @ApiProperty({ description: 'Property postcode', required: false, example: 'SW1A 1AA' })
  @IsOptional()
  @IsString()
  postcode?: string;

  @ApiProperty({ description: 'Property address', required: false, example: '10 Downing Street' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ description: 'Unique Property Reference Number', required: false, example: '123456789012' })
  @IsOptional()
  @IsString()
  uprn?: string;

  @ApiProperty({ description: 'Minimum price', required: false, minimum: 0, example: 100000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiProperty({ description: 'Maximum price', required: false, minimum: 0, example: 1000000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiProperty({ description: 'Start date (YYYY-MM-DD)', required: false, example: '2020-01-01' })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiProperty({ description: 'End date (YYYY-MM-DD)', required: false, example: '2023-12-31' })
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @ApiProperty({ 
    description: 'Property types', 
    required: false, 
    enum: PropertyType,
    isArray: true,
    example: ['D', 'S']
  })
  @IsOptional()
  @IsArray()
  @IsEnum(PropertyType, { each: true })
  @Transform(({ value }) => Array.isArray(value) ? value : [value])
  propertyTypes?: PropertyType[];

  @ApiProperty({ description: 'New build properties only', required: false, default: false })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  newBuildOnly?: boolean;

  @ApiProperty({ description: 'Number of results to return (max 100)', required: false, minimum: 1, maximum: 100, default: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiProperty({ description: 'Number of results to skip', required: false, minimum: 0, default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  offset?: number;
}

export class BulkExportSearchCriteriaDto {
  @ApiProperty({ description: 'Property postcode', required: false, example: 'SW1A' })
  @IsOptional()
  @IsString()
  postcode?: string;

  @ApiProperty({ description: 'Property address', required: false, example: 'Downing Street' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ 
    description: 'Property types', 
    required: false, 
    enum: PropertyType,
    isArray: true,
    example: ['D', 'S']
  })
  @IsOptional()
  @IsArray()
  @IsEnum(PropertyType, { each: true })
  propertyTypes?: PropertyType[];

  @ApiProperty({ description: 'Minimum price', required: false, minimum: 0, example: 100000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiProperty({ description: 'Maximum price', required: false, minimum: 0, example: 1000000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiProperty({ description: 'Start date (YYYY-MM-DD)', required: false, example: '2020-01-01' })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiProperty({ description: 'End date (YYYY-MM-DD)', required: false, example: '2023-12-31' })
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @ApiProperty({ 
    description: 'Tenure types', 
    required: false, 
    enum: TenureType,
    isArray: true,
    example: ['F', 'L']
  })
  @IsOptional()
  @IsArray()
  @IsEnum(TenureType, { each: true })
  tenureTypes?: TenureType[];

  @ApiProperty({ description: 'New build properties only', required: false, default: false })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  newBuildOnly?: boolean;

  @ApiProperty({ description: 'Maximum number of records to export', required: false, minimum: 1, maximum: 10000, default: 1000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(10000)
  maxRecords?: number;
}

export class BulkExportDto {
  @ApiProperty({ description: 'Search criteria for bulk export', type: BulkExportSearchCriteriaDto })
  @Type(() => BulkExportSearchCriteriaDto)
  searchCriteria: BulkExportSearchCriteriaDto;

  @ApiProperty({ 
    description: 'Export format', 
    enum: ExportFormat,
    example: 'csv',
    default: 'csv'
  })
  @IsEnum(ExportFormat)
  format: ExportFormat;

  @ApiProperty({ 
    description: 'Fields to include in export', 
    required: false,
    isArray: true,
    example: ['address', 'price', 'transferDate', 'propertyType']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  includeFields?: string[];
}

export class PropertyValuationDto {
  @ApiProperty({ description: 'Unique Property Reference Number', example: '123456789012' })
  @IsString()
  uprn: string;

  @ApiProperty({ description: 'Include comparable properties', required: false, default: true })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  includeComparables?: boolean;

  @ApiProperty({ description: 'Include market analysis', required: false, default: true })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  includeMarketAnalysis?: boolean;

  @ApiProperty({ description: 'Radius for comparable search in meters', required: false, minimum: 100, maximum: 5000, default: 1000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(100)
  @Max(5000)
  searchRadius?: number;
}

export class SyncPropertyDataDto {
  @ApiProperty({ description: 'Unique Property Reference Number to sync', required: false, example: '123456789012' })
  @IsOptional()
  @IsString()
  uprn?: string;

  @ApiProperty({ description: 'Force sync even if recently updated', required: false, default: false })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  forceSync?: boolean;

  @ApiProperty({ description: 'Sync ownership data', required: false, default: true })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  syncOwnership?: boolean;

  @ApiProperty({ description: 'Sync price paid data', required: false, default: true })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  syncPricePaid?: boolean;

  @ApiProperty({ description: 'Sync title records', required: false, default: true })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  syncTitleRecords?: boolean;
}

export class ClearCacheDto {
  @ApiProperty({ description: 'Cache key pattern to clear', required: false, example: 'property_search_*' })
  @IsOptional()
  @IsString()
  pattern?: string;

  @ApiProperty({ description: 'Clear all cache', required: false, default: false })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  clearAll?: boolean;
}

// Response DTOs for Swagger documentation
export class ApiResponseDto<T> {
  @ApiProperty({ description: 'Success status' })
  success: boolean;

  @ApiProperty({ description: 'Response data' })
  data: T;

  @ApiProperty({ description: 'Response metadata' })
  metadata: {
    requestId: string;
    timestamp: string;
    processingTime?: number;
  };
}

export class ErrorResponseDto {
  @ApiProperty({ description: 'Error code' })
  code: string;

  @ApiProperty({ description: 'Error message' })
  message: string;

  @ApiProperty({ description: 'Error details', required: false })
  details?: any;

  @ApiProperty({ description: 'Timestamp' })
  timestamp: string;
}

export class HealthCheckResponseDto {
  @ApiProperty({ description: 'Service status', enum: ['healthy', 'unhealthy'] })
  status: string;

  @ApiProperty({ description: 'Health check details' })
  details: {
    database?: string;
    cache?: any;
    rateLimitRemaining?: number;
    lastSync?: string;
    error?: string;
  };
}

export class SyncResponseDto {
  @ApiProperty({ description: 'Success status' })
  success: boolean;

  @ApiProperty({ description: 'Sync message' })
  message: string;

  @ApiProperty({ description: 'Sync details', required: false })
  details?: {
    recordsProcessed?: number;
    recordsUpdated?: number;
    recordsCreated?: number;
    errors?: string[];
  };
}

export class CacheResponseDto {
  @ApiProperty({ description: 'Success status' })
  success: boolean;

  @ApiProperty({ description: 'Cache operation message' })
  message: string;

  @ApiProperty({ description: 'Cache statistics', required: false })
  stats?: {
    keysCleared?: number;
    totalKeys?: number;
    cacheSize?: number;
  };
}