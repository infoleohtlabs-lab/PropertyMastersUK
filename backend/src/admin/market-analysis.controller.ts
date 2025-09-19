import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpStatus,
  BadRequestException,
  UseInterceptors,
  UploadedFile,
  Res,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiConsumes,
  ApiProperty,
  getSchemaPath,} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import {
  MarketAnalysisService,
  MarketDataImportDto,
  MarketDataExportDto,
  PriceTrendConfigDto,
  AnalyticsSettingsDto,
  ImportProgress,
  MarketAnalytics,
} from './market-analysis.service';
import { ImportHistory } from './entities/import-history.entity';
import {
  IsOptional,
  IsBoolean,
  IsString,
  IsNumber,
  IsEnum,
  IsDateString,
  IsArray,
  IsObject,
  ValidateNested,
  Min,
  Max,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import * as fs from 'fs';
import * as path from 'path';

// DTOs for Market Data Import
class DateRangeDto {
  @ApiProperty({ description: 'Start date', type: 'string', format: 'date' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ description: 'End date', type: 'string', format: 'date' })
  @IsDateString()
  endDate: string;
}

class MarketDataImportRequestDto {
  @ApiProperty({ 
    description: 'Type of market data', 
    enum: ['property_prices', 'rental_yields', 'market_trends', 'demographic_data'] 
  })
  @IsEnum(['property_prices', 'rental_yields', 'market_trends', 'demographic_data'])
  dataType: 'property_prices' | 'rental_yields' | 'market_trends' | 'demographic_data';

  @ApiProperty({ description: 'Region for the data', required: false })
  @IsOptional()
  @IsString()
  region?: string;

  @ApiProperty({ description: 'Data source' })
  @IsString()
  source: string;

  @ApiProperty({ description: 'Date range for the data', type: DateRangeDto })
  @ValidateNested()
  @Type(() => DateRangeDto)
  dateRange: DateRangeDto;

  @ApiProperty({ description: 'Overwrite existing data', required: false, default: false })
  @IsOptional()
  @IsBoolean()
  overwriteExisting?: boolean;
}

// DTOs for Market Data Export
class MarketDataExportRequestDto {
  @ApiProperty({ 
    description: 'Type of market data to export', 
    enum: ['property_prices', 'rental_yields', 'market_trends', 'demographic_data', 'all'] 
  })
  @IsEnum(['property_prices', 'rental_yields', 'market_trends', 'demographic_data', 'all'])
  dataType: 'property_prices' | 'rental_yields' | 'market_trends' | 'demographic_data' | 'all';

  @ApiProperty({ description: 'Region filter', required: false })
  @IsOptional()
  @IsString()
  region?: string;

  @ApiProperty({ description: 'Date range filter', required: false, type: DateRangeDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => DateRangeDto)
  dateRange?: DateRangeDto;

  @ApiProperty({ description: 'Export format', enum: ['csv', 'json', 'excel'] })
  @IsEnum(['csv', 'json', 'excel'])
  format: 'csv' | 'json' | 'excel';

  @ApiProperty({ description: 'Include metadata in export', required: false, default: false })
  @IsOptional()
  @IsBoolean()
  includeMetadata?: boolean;
}

// DTOs for Price Trend Configuration
class AlertThresholdsDto {
  @ApiProperty({ description: 'Price change percentage threshold' })
  @IsNumber()
  @Min(0)
  @Max(100)
  priceChangePercent: number;

  @ApiProperty({ description: 'Volume change percentage threshold' })
  @IsNumber()
  @Min(0)
  @Max(100)
  volumeChangePercent: number;

  @ApiProperty({ description: 'Yield change percentage threshold' })
  @IsNumber()
  @Min(0)
  @Max(10)
  yieldChangePercent: number;
}

class PriceTrendConfigRequestDto {
  @ApiProperty({ 
    description: 'Analysis type', 
    enum: ['moving_average', 'linear_regression', 'seasonal_decomposition', 'arima'] 
  })
  @IsEnum(['moving_average', 'linear_regression', 'seasonal_decomposition', 'arima'])
  analysisType: 'moving_average' | 'linear_regression' | 'seasonal_decomposition' | 'arima';

  @ApiProperty({ description: 'Time window in days' })
  @IsNumber()
  @Min(1)
  @Max(365)
  timeWindow: number;

  @ApiProperty({ description: 'Confidence level' })
  @IsNumber()
  @Min(0.5)
  @Max(0.99)
  confidenceLevel: number;

  @ApiProperty({ description: 'Smoothing factor', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  smoothingFactor?: number;

  @ApiProperty({ description: 'Seasonal periods', required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  seasonalPeriods?: number;

  @ApiProperty({ description: 'Forecast horizon in days', required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(365)
  forecastHorizon?: number;

  @ApiProperty({ description: 'Alert thresholds', type: AlertThresholdsDto })
  @ValidateNested()
  @Type(() => AlertThresholdsDto)
  alertThresholds: AlertThresholdsDto;

  @ApiProperty({ description: 'Regions to analyze', type: [String] })
  @IsArray()
  @IsString({ each: true })
  regions: string[];

  @ApiProperty({ description: 'Property types to analyze', type: [String] })
  @IsArray()
  @IsString({ each: true })
  propertyTypes: string[];

  @ApiProperty({ description: 'Update frequency', enum: ['daily', 'weekly', 'monthly'] })
  @IsEnum(['daily', 'weekly', 'monthly'])
  updateFrequency: 'daily' | 'weekly' | 'monthly';

  @ApiProperty({ description: 'Enable alerts' })
  @IsBoolean()
  enableAlerts: boolean;
}

// DTOs for Analytics Settings
class CorrelationAnalysisDto {
  @ApiProperty({ description: 'Enable correlation analysis' })
  @IsBoolean()
  enabled: boolean;

  @ApiProperty({ description: 'Variables for correlation analysis', type: [String] })
  @IsArray()
  @IsString({ each: true })
  variables: string[];

  @ApiProperty({ description: 'Update frequency', enum: ['daily', 'weekly', 'monthly'] })
  @IsEnum(['daily', 'weekly', 'monthly'])
  updateFrequency: 'daily' | 'weekly' | 'monthly';
}

class PerformanceMetricsDto {
  @ApiProperty({ description: 'Enable performance metrics' })
  @IsBoolean()
  enabled: boolean;

  @ApiProperty({ description: 'Metrics to calculate', type: [String] })
  @IsArray()
  @IsString({ each: true })
  metrics: string[];

  @ApiProperty({ description: 'Benchmarks to use', type: [String] })
  @IsArray()
  @IsString({ each: true })
  benchmarks: string[];
}

class ReportGenerationDto {
  @ApiProperty({ description: 'Enable automated reports' })
  @IsBoolean()
  automated: boolean;

  @ApiProperty({ description: 'Report frequency', enum: ['daily', 'weekly', 'monthly'] })
  @IsEnum(['daily', 'weekly', 'monthly'])
  frequency: 'daily' | 'weekly' | 'monthly';

  @ApiProperty({ description: 'Report recipients', type: [String] })
  @IsArray()
  @IsString({ each: true })
  recipients: string[];

  @ApiProperty({ description: 'Report format', enum: ['pdf', 'html', 'excel'] })
  @IsEnum(['pdf', 'html', 'excel'])
  format: 'pdf' | 'html' | 'excel';
}

class DataQualityDto {
  @ApiProperty({ description: 'Validation rules', type: [Object] })
  @IsArray()
  validationRules: any[];

  @ApiProperty({ description: 'Enable outlier detection' })
  @IsBoolean()
  outlierDetection: boolean;

  @ApiProperty({ description: 'Missing data handling', enum: ['ignore', 'interpolate', 'flag'] })
  @IsEnum(['ignore', 'interpolate', 'flag'])
  missingDataHandling: 'ignore' | 'interpolate' | 'flag';
}

class AnalyticsSettingsRequestDto {
  @ApiProperty({ description: 'Data retention period in days' })
  @IsNumber()
  @Min(30)
  dataRetentionPeriod: number;

  @ApiProperty({ 
    description: 'Aggregation levels', 
    type: [String],
    enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly']
  })
  @IsArray()
  @IsEnum(['daily', 'weekly', 'monthly', 'quarterly', 'yearly'], { each: true })
  aggregationLevels: ('daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly')[];

  @ApiProperty({ description: 'Benchmark indices', type: [String] })
  @IsArray()
  @IsString({ each: true })
  benchmarkIndices: string[];

  @ApiProperty({ description: 'Correlation analysis settings', type: CorrelationAnalysisDto })
  @ValidateNested()
  @Type(() => CorrelationAnalysisDto)
  correlationAnalysis: CorrelationAnalysisDto;

  @ApiProperty({ description: 'Performance metrics settings', type: PerformanceMetricsDto })
  @ValidateNested()
  @Type(() => PerformanceMetricsDto)
  performanceMetrics: PerformanceMetricsDto;

  @ApiProperty({ description: 'Report generation settings', type: ReportGenerationDto })
  @ValidateNested()
  @Type(() => ReportGenerationDto)
  reportGeneration: ReportGenerationDto;

  @ApiProperty({ description: 'Data quality settings', type: DataQualityDto })
  @ValidateNested()
  @Type(() => DataQualityDto)
  dataQuality: DataQualityDto;
}

@ApiTags('Admin - Market Analysis')
@Controller('admin/market-analysis')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class MarketAnalysisController {
  constructor(
    private readonly marketAnalysisService: MarketAnalysisService,
  ) {}

  // Market Data Import Endpoints
  @Post('import')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Import market data',
    description: 'Import market data from CSV file or API.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'CSV file containing market data',
        },
        dataType: {
          type: 'string',
          enum: ['property_prices', 'rental_yields', 'market_trends', 'demographic_data'],
        },
        region: { type: 'string' },
        source: { type: 'string' },
        dateRange: {
          type: 'object',
          properties: {
            startDate: { type: 'string', format: 'date' },
            endDate: { type: 'string', format: 'date' },
          },
        },
        overwriteExisting: { type: 'boolean' },
      },
      required: ['dataType', 'source', 'dateRange'],
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Market data import started successfully',
    schema: {
      type: 'object',
      properties: {
        importId: { type: 'string' },
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid import data or file format',
  })
  async importMarketData(
    @UploadedFile() file: Express.Multer.File,
    @Body() importData: MarketDataImportRequestDto,
    @Request() req: any,
  ): Promise<{ importId: string; message: string }> {
    const importDto: MarketDataImportDto = {
      file,
      dataType: importData.dataType,
      region: importData.region,
      source: importData.source,
      dateRange: {
        startDate: new Date(importData.dateRange.startDate),
        endDate: new Date(importData.dateRange.endDate),
      },
      overwriteExisting: importData.overwriteExisting,
    };

    return this.marketAnalysisService.importMarketData(importDto, req.user.id);
  }

  @Post('validate-csv')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Validate CSV file',
    description: 'Validate CSV file format and preview data before import.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'CSV file to validate',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'CSV validation result',
    schema: {
      type: 'object',
      properties: {
        valid: { type: 'boolean' },
        errors: { type: 'array', items: { type: 'string' } },
        preview: { type: 'array', items: { type: 'object' } },
      },
    },
  })
  async validateCsvFile(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ valid: boolean; errors: string[]; preview: any[] }> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    return this.marketAnalysisService.validateCsvFile(file);
  }

  @Get('import/:importId/progress')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Get import progress',
    description: 'Get the progress of a market data import operation.',
  })
  @ApiParam({
    name: 'importId',
    description: 'Import operation ID',
    type: 'string',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Import progress information',
    type: Object, // ImportProgress
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Import operation not found',
  })
  async getImportProgress(
    @Param('importId') importId: string,
  ): Promise<ImportProgress> {
    return this.marketAnalysisService.getImportProgress(importId);
  }

  @Delete('import/:importId')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Cancel import',
    description: 'Cancel a running market data import operation.',
  })
  @ApiParam({
    name: 'importId',
    description: 'Import operation ID',
    type: 'string',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Import cancelled successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Import operation not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Cannot cancel completed or failed import',
  })
  async cancelImport(
    @Param('importId') importId: string,
    @Request() req: any,
  ): Promise<{ success: boolean; message: string }> {
    return this.marketAnalysisService.cancelImport(importId, req.user.id);
  }

  @Get('import/history')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Get import history',
    description: 'Get the history of market data import operations.',
  })
  @ApiQuery({
    name: 'page',
    description: 'Page number',
    type: 'number',
    required: false,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    description: 'Items per page',
    type: 'number',
    required: false,
    example: 20,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Import history retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: { type: 'array', items: { type: 'object' } },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
      },
    },
  })
  async getImportHistory(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ): Promise<{
    data: ImportHistory[];
    total: number;
    page: number;
    limit: number;
  }> {
    return this.marketAnalysisService.getImportHistory(page, limit);
  }

  // Market Data Export Endpoints
  @Post('export')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Export market data',
    description: 'Export market data in various formats.',
  })
  @ApiBody({ type: MarketDataExportRequestDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Export initiated successfully',
    schema: {
      type: 'object',
      properties: {
        downloadUrl: { type: 'string' },
        fileName: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid export parameters',
  })
  async exportMarketData(
    @Body() exportData: MarketDataExportRequestDto,
  ): Promise<{ downloadUrl: string; fileName: string }> {
    const exportDto: MarketDataExportDto = {
      dataType: exportData.dataType,
      region: exportData.region,
      dateRange: exportData.dateRange ? {
        startDate: new Date(exportData.dateRange.startDate),
        endDate: new Date(exportData.dateRange.endDate),
      } : undefined,
      format: exportData.format,
      includeMetadata: exportData.includeMetadata,
    };

    return this.marketAnalysisService.exportMarketData(exportDto);
  }

  @Get('download/:fileName')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Download exported file',
    description: 'Download an exported market data file.',
  })
  @ApiParam({
    name: 'fileName',
    description: 'Name of the file to download',
    type: 'string',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'File downloaded successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'File not found',
  })
  async downloadFile(
    @Param('fileName') fileName: string,
    @Res() res: Response,
  ): Promise<void> {
    const filePath = path.join(process.cwd(), 'exports', fileName);
    
    if (!fs.existsSync(filePath)) {
      throw new BadRequestException('File not found');
    }

    res.download(filePath, fileName);
  }

  // Price Trend Configuration Endpoints
  @Get('price-trends/config')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Get price trend configuration',
    description: 'Retrieve current price trend analysis configuration.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Price trend configuration retrieved successfully',
    type: Object, // PriceTrendConfigDto
  })
  async getPriceTrendConfig(): Promise<PriceTrendConfigDto> {
    return this.marketAnalysisService.getPriceTrendConfig();
  }

  @Put('price-trends/config')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Update price trend configuration',
    description: 'Update price trend analysis configuration.',
  })
  @ApiBody({ type: PriceTrendConfigRequestDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Price trend configuration updated successfully',
    type: Object, // PriceTrendConfigDto
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid configuration data',
  })
  async updatePriceTrendConfig(
    @Body() config: PriceTrendConfigRequestDto,
    @Request() req: any,
  ): Promise<PriceTrendConfigDto> {
    return this.marketAnalysisService.updatePriceTrendConfig(config, req.user.id);
  }

  // Analytics Settings Endpoints
  @Get('analytics/settings')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Get analytics settings',
    description: 'Retrieve current analytics configuration settings.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Analytics settings retrieved successfully',
    type: Object, // AnalyticsSettingsDto
  })
  async getAnalyticsSettings(): Promise<AnalyticsSettingsDto> {
    return this.marketAnalysisService.getAnalyticsSettings();
  }

  @Put('analytics/settings')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Update analytics settings',
    description: 'Update analytics configuration settings.',
  })
  @ApiBody({ type: AnalyticsSettingsRequestDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Analytics settings updated successfully',
    type: Object, // AnalyticsSettingsDto
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid settings data',
  })
  async updateAnalyticsSettings(
    @Body() settings: AnalyticsSettingsRequestDto,
    @Request() req: any,
  ): Promise<AnalyticsSettingsDto> {
    return this.marketAnalysisService.updateAnalyticsSettings(settings, req.user.id);
  }

  // Market Analytics Endpoints
  @Get('analytics')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Get market analytics',
    description: 'Get comprehensive market analytics including trends, forecasts, and alerts.',
  })
  @ApiQuery({
    name: 'region',
    description: 'Filter by region',
    type: 'string',
    required: false,
  })
  @ApiQuery({
    name: 'startDate',
    description: 'Start date for analysis',
    type: 'string',
    required: false,
  })
  @ApiQuery({
    name: 'endDate',
    description: 'End date for analysis',
    type: 'string',
    required: false,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Market analytics retrieved successfully',
    type: Object, // MarketAnalytics
  })
  async getMarketAnalytics(
    @Query('region') region?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<MarketAnalytics> {
    const dateRange = startDate && endDate ? {
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    } : undefined;

    return this.marketAnalysisService.getMarketAnalytics(region, dateRange);
  }

  @Get('summary')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Get data summary',
    description: 'Get a summary of available market data.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Data summary retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        totalRecords: { type: 'number' },
        dataTypes: { type: 'object' },
        regions: { type: 'object' },
        dateRange: {
          type: 'object',
          properties: {
            startDate: { type: 'string', format: 'date-time' },
            endDate: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  })
  async getDataSummary(): Promise<{
    totalRecords: number;
    dataTypes: { [key: string]: number };
    regions: { [key: string]: number };
    dateRange: { startDate: Date; endDate: Date };
  }> {
    return this.marketAnalysisService.getDataSummary();
  }

  // Health Check
  @Get('health')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Market analysis service health check',
    description: 'Check the health and status of the market analysis service.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Service health status',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'healthy' },
        timestamp: { type: 'string', format: 'date-time' },
        version: { type: 'string' },
        features: {
          type: 'object',
          properties: {
            dataImport: { type: 'string', example: 'operational' },
            dataExport: { type: 'string', example: 'operational' },
            analytics: { type: 'string', example: 'operational' },
            forecasting: { type: 'string', example: 'operational' },
          },
        },
      },
    },
  })
  async getHealthStatus(): Promise<{
    status: string;
    timestamp: Date;
    version: string;
    features: {
      dataImport: string;
      dataExport: string;
      analytics: string;
      forecasting: string;
    };
  }> {
    return {
      status: 'healthy',
      timestamp: new Date(),
      version: '1.0.0',
      features: {
        dataImport: 'operational',
        dataExport: 'operational',
        analytics: 'operational',
        forecasting: 'operational',
      },
    };
  }
}
