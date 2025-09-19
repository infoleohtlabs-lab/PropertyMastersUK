import { IsString, IsNumber, IsOptional, IsBoolean, IsEnum, IsDateString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export enum PropertyType {
  DETACHED = 'detached',
  SEMI_DETACHED = 'semi_detached',
  TERRACED = 'terraced',
  FLAT = 'flat',
  BUNGALOW = 'bungalow',
  OTHER = 'other',
}

export enum MarketDataSource {
  LAND_REGISTRY = 'land_registry',
  RIGHTMOVE = 'rightmove',
  ZOOPLA = 'zoopla',
  MANUAL = 'manual',
  API = 'api',
}

export enum TrendPeriod {
  ONE_MONTH = '1m',
  THREE_MONTHS = '3m',
  SIX_MONTHS = '6m',
  TWELVE_MONTHS = '12m',
  TWO_YEARS = '2y',
  FIVE_YEARS = '5y',
}

export enum ReportType {
  MARKET_OVERVIEW = 'market_overview',
  PRICE_ANALYSIS = 'price_analysis',
  TREND_REPORT = 'trend_report',
  COMPARATIVE_ANALYSIS = 'comparative_analysis',
  CUSTOM = 'custom',
}

// Market Data DTOs
export class CreateMarketDataDto {
  @IsString()
  location: string;

  @IsEnum(PropertyType)
  propertyType: PropertyType;

  @IsNumber()
  averagePrice: number;

  @IsNumber()
  medianPrice: number;

  @IsNumber()
  salesVolume: number;

  @IsNumber()
  @IsOptional()
  averageDaysOnMarket?: number;

  @IsNumber()
  @IsOptional()
  pricePerSqFt?: number;

  @IsDateString()
  recordDate: string;

  @IsEnum(MarketDataSource)
  @IsOptional()
  source?: MarketDataSource;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateMarketDataDto {
  @IsString()
  @IsOptional()
  location?: string;

  @IsEnum(PropertyType)
  @IsOptional()
  propertyType?: PropertyType;

  @IsNumber()
  @IsOptional()
  averagePrice?: number;

  @IsNumber()
  @IsOptional()
  medianPrice?: number;

  @IsNumber()
  @IsOptional()
  salesVolume?: number;

  @IsNumber()
  @IsOptional()
  averageDaysOnMarket?: number;

  @IsNumber()
  @IsOptional()
  pricePerSqFt?: number;

  @IsDateString()
  @IsOptional()
  recordDate?: string;

  @IsEnum(MarketDataSource)
  @IsOptional()
  source?: MarketDataSource;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class MarketDataResponseDto {
  id: string;
  location: string;
  propertyType: PropertyType;
  averagePrice: number;
  medianPrice: number;
  salesVolume: number;
  averageDaysOnMarket?: number;
  pricePerSqFt?: number;
  recordDate: Date;
  source: MarketDataSource;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Import/Export DTOs
export class MarketDataImportDto {
  @IsEnum(MarketDataSource)
  source: MarketDataSource;

  @IsBoolean()
  @IsOptional()
  overwriteExisting?: boolean;

  @IsBoolean()
  @IsOptional()
  validateData?: boolean;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class MarketDataExportDto {
  @IsString()
  @IsOptional()
  location?: string;

  @IsEnum(PropertyType)
  @IsOptional()
  propertyType?: PropertyType;

  @IsDateString()
  @IsOptional()
  dateFrom?: string;

  @IsDateString()
  @IsOptional()
  dateTo?: string;

  @IsEnum(MarketDataSource)
  @IsOptional()
  source?: MarketDataSource;

  @IsString()
  @IsOptional()
  format?: string; // 'xlsx' | 'csv'

  @IsString()
  @IsOptional()
  dataType?: string;

  @IsString()
  @IsOptional()
  region?: string;

  @IsOptional()
  dateRange?: {
    startDate: Date;
    endDate: Date;
  };

  @IsBoolean()
  @IsOptional()
  includeMetadata?: boolean;
}

// Analytics Configuration DTOs
export class MarketAnalysisConfigDto {
  @IsBoolean()
  @IsOptional()
  enableAutomaticDataSync?: boolean;

  @IsNumber()
  @IsOptional()
  dataSyncIntervalHours?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  enabledDataSources?: string[];

  @IsBoolean()
  @IsOptional()
  enablePriceAlerts?: boolean;

  @IsNumber()
  @IsOptional()
  priceChangeThreshold?: number;

  @IsBoolean()
  @IsOptional()
  enableVolumeAlerts?: boolean;

  @IsNumber()
  @IsOptional()
  volumeChangeThreshold?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  defaultLocations?: string[];

  @IsArray()
  @IsEnum(PropertyType, { each: true })
  @IsOptional()
  defaultPropertyTypes?: PropertyType[];

  @IsEnum(TrendPeriod)
  @IsOptional()
  defaultTrendPeriod?: TrendPeriod;

  @IsBoolean()
  @IsOptional()
  enableReportGeneration?: boolean;

  @IsString()
  @IsOptional()
  reportEmailRecipients?: string;
}

// Market Trends DTOs
export class MarketTrendDto {
  location: string;
  propertyType: PropertyType;
  period: string;
  priceChange: number;
  priceChangePercent: number;
  volumeChange: number;
  volumeChangePercent: number;
  averagePrice: number;
  medianPrice: number;
  salesVolume: number;
  trendDirection: 'up' | 'down' | 'stable';
  confidence: number;
  dataPoints: {
    date: Date;
    averagePrice: number;
    salesVolume: number;
  }[];
}

// Market Reports DTOs
export class MarketReportDto {
  id: string;
  title: string;
  type: ReportType;
  location?: string;
  propertyType?: PropertyType;
  period: string;
  generatedAt: Date;
  fileUrl?: string;
  status: 'generating' | 'completed' | 'failed';
  summary: {
    totalProperties: number;
    averagePrice: number;
    priceChange: number;
    keyInsights: string[];
  };
}

// Query DTOs
export class MarketDataQueryDto {
  @IsNumber()
  @IsOptional()
  page?: number;

  @IsNumber()
  @IsOptional()
  limit?: number;

  @IsString()
  @IsOptional()
  location?: string;

  @IsEnum(PropertyType)
  @IsOptional()
  propertyType?: PropertyType;

  @IsOptional()
  dateFrom?: Date;

  @IsOptional()
  dateTo?: Date;

  @IsEnum(MarketDataSource)
  @IsOptional()
  source?: MarketDataSource;
}

export class MarketTrendQueryDto {
  @IsString()
  @IsOptional()
  location?: string;

  @IsEnum(PropertyType)
  @IsOptional()
  propertyType?: PropertyType;

  @IsEnum(TrendPeriod)
  @IsOptional()
  period?: TrendPeriod;
}

export class MarketSummaryQueryDto {
  @IsString()
  @IsOptional()
  location?: string;

  @IsEnum(PropertyType)
  @IsOptional()
  propertyType?: PropertyType;
}

export class MarketReportQueryDto {
  @IsNumber()
  @IsOptional()
  page?: number;

  @IsNumber()
  @IsOptional()
  limit?: number;

  @IsEnum(ReportType)
  @IsOptional()
  type?: ReportType;

  @IsString()
  @IsOptional()
  location?: string;
}
