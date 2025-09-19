import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThan, LessThan } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as fs from 'fs';
import * as path from 'path';
import * as csv from 'csv-parser';
import { Readable } from 'stream';

import { MarketData } from './entities/market-data.entity';
import { ImportHistory, ImportStatus } from './entities/import-history.entity';
import { MarketDataSource } from './dto/market-analysis.dto';



// Market Analysis DTOs and Interfaces
export interface MarketDataImportDto {
  file?: Express.Multer.File;
  dataType: 'property_prices' | 'rental_yields' | 'market_trends' | 'demographic_data';
  region?: string;
  source: string;
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
  overwriteExisting?: boolean;
}

export interface MarketDataExportDto {
  dataType: 'property_prices' | 'rental_yields' | 'market_trends' | 'demographic_data' | 'all';
  region?: string;
  dateRange?: {
    startDate: Date;
    endDate: Date;
  };
  format: 'csv' | 'json' | 'excel';
  includeMetadata?: boolean;
}

export interface PriceTrendConfigDto {
  analysisType: 'moving_average' | 'linear_regression' | 'seasonal_decomposition' | 'arima';
  timeWindow: number; // in days
  confidenceLevel: number; // 0.90, 0.95, 0.99
  smoothingFactor?: number;
  seasonalPeriods?: number;
  forecastHorizon?: number; // days to forecast
  alertThresholds: {
    priceChangePercent: number;
    volumeChangePercent: number;
    yieldChangePercent: number;
  };
  regions: string[];
  propertyTypes: string[];
  updateFrequency: 'daily' | 'weekly' | 'monthly';
  enableAlerts: boolean;
}

export interface AnalyticsSettingsDto {
  dataRetentionPeriod: number; // in days
  aggregationLevels: ('daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly')[];
  benchmarkIndices: string[];
  correlationAnalysis: {
    enabled: boolean;
    variables: string[];
    updateFrequency: 'daily' | 'weekly' | 'monthly';
  };
  performanceMetrics: {
    enabled: boolean;
    metrics: string[];
    benchmarks: string[];
  };
  reportGeneration: {
    automated: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    recipients: string[];
    format: 'pdf' | 'html' | 'excel';
  };
  dataQuality: {
    validationRules: any[];
    outlierDetection: boolean;
    missingDataHandling: 'ignore' | 'interpolate' | 'flag';
  };
}



export interface ImportProgress {
  id: string;
  status: ImportStatus;
  totalRecords: number;
  processedRecords: number;
  successfulRecords: number;
  failedRecords: number;
  errors: string[];
  startTime: Date;
  endTime?: Date;
  estimatedCompletion?: Date;
}



export interface MarketAnalytics {
  summary: {
    totalRecords: number;
    dataTypes: { [key: string]: number };
    regions: { [key: string]: number };
    dateRange: { startDate: Date; endDate: Date };
    lastUpdated: Date;
  };
  trends: {
    priceChanges: { [region: string]: number };
    volumeChanges: { [region: string]: number };
    yieldChanges: { [region: string]: number };
  };
  forecasts: {
    [region: string]: {
      prices: { date: Date; value: number; confidence: number }[];
      yields: { date: Date; value: number; confidence: number }[];
    };
  };
  alerts: {
    id: string;
    type: string;
    region: string;
    message: string;
    severity: 'low' | 'medium' | 'high';
    createdAt: Date;
  }[];
}

@Injectable()
export class MarketAnalysisService {
  private importProgressMap = new Map<string, ImportProgress>();

  constructor(
    @InjectRepository(MarketData)
    private marketDataRepository: Repository<MarketData>,
    @InjectRepository(ImportHistory)
    private importHistoryRepository: Repository<ImportHistory>,
    private eventEmitter: EventEmitter2,
  ) {}

  // Market Data Import Methods
  async importMarketData(importDto: MarketDataImportDto, userId: string): Promise<{ importId: string; message: string }> {
    const importId = `import_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Initialize import progress
    const progress: ImportProgress = {
      id: importId,
      status: ImportStatus.PENDING,
      totalRecords: 0,
      processedRecords: 0,
      successfulRecords: 0,
      failedRecords: 0,
      errors: [],
      startTime: new Date(),
    };
    
    this.importProgressMap.set(importId, progress);

    // Start async import process
    this.processImportAsync(importDto, importId, userId);

    // Emit import started event
    this.eventEmitter.emit('market.data.import.started', {
      importId,
      dataType: importDto.dataType,
      userId,
      timestamp: new Date(),
    });

    return {
      importId,
      message: 'Market data import started successfully',
    };
  }

  private async processImportAsync(importDto: MarketDataImportDto, importId: string, userId: string): Promise<void> {
    const progress = this.importProgressMap.get(importId);
    if (!progress) return;

    try {
      progress.status = ImportStatus.PROCESSING;
      
      let records: any[] = [];
      
      if (importDto.file) {
        // Parse CSV file
        records = await this.parseCsvFile(importDto.file.buffer);
      }
      
      progress.totalRecords = records.length;
      
      // Process records in batches
      const batchSize = 100;
      for (let i = 0; i < records.length; i += batchSize) {
        const batch = records.slice(i, i + batchSize);
        await this.processBatch(batch, importDto, progress);
        
        // Update progress
        progress.processedRecords = Math.min(i + batchSize, records.length);
        
        // Estimate completion time
        const elapsed = Date.now() - progress.startTime.getTime();
        const rate = progress.processedRecords / elapsed;
        const remaining = progress.totalRecords - progress.processedRecords;
        progress.estimatedCompletion = new Date(Date.now() + (remaining / rate));
      }
      
      progress.status = ImportStatus.COMPLETED;
      progress.endTime = new Date();
      
      // Save import history
      await this.saveImportHistory(importDto, progress, userId);
      
      // Emit completion event
      this.eventEmitter.emit('market.data.import.completed', {
        importId,
        totalRecords: progress.totalRecords,
        successfulRecords: progress.successfulRecords,
        failedRecords: progress.failedRecords,
        userId,
        timestamp: new Date(),
      });
      
    } catch (error) {
      progress.status = ImportStatus.FAILED;
      progress.errors.push(error.message);
      progress.endTime = new Date();
      
      // Emit error event
      this.eventEmitter.emit('market.data.import.failed', {
        importId,
        error: error.message,
        userId,
        timestamp: new Date(),
      });
    }
  }

  private async parseCsvFile(buffer: Buffer): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const records: any[] = [];
      const stream = Readable.from(buffer.toString());
      
      stream
        .pipe(csv())
        .on('data', (data) => records.push(data))
        .on('end', () => resolve(records))
        .on('error', reject);
    });
  }

  private async processBatch(batch: any[], importDto: MarketDataImportDto, progress: ImportProgress): Promise<void> {
    for (const record of batch) {
      try {
        // Validate and transform record
        const marketData = await this.validateAndTransformRecord(record, importDto);
        
        // Check for existing record
        if (importDto.overwriteExisting) {
          await this.marketDataRepository.upsert(marketData, ['location', 'propertyType', 'recordDate']);
        } else {
          await this.marketDataRepository.save(marketData);
        }
        
        progress.successfulRecords++;
      } catch (error) {
        progress.failedRecords++;
        progress.errors.push(`Record ${JSON.stringify(record)}: ${error.message}`);
      }
    }
  }

  private async validateAndTransformRecord(record: any, importDto: MarketDataImportDto): Promise<Partial<MarketData>> {
    // Basic validation
    if (!record.averagePrice || isNaN(parseFloat(record.averagePrice))) {
      throw new Error('Invalid averagePrice field');
    }
    
    if (!record.recordDate || isNaN(Date.parse(record.recordDate))) {
      throw new Error('Invalid recordDate field');
    }
    
    return {
      location: record.location || importDto.region,
      propertyType: record.propertyType,
      averagePrice: parseFloat(record.averagePrice),
      medianPrice: record.medianPrice ? parseFloat(record.medianPrice) : null,
      salesVolume: record.salesVolume ? parseInt(record.salesVolume) : null,
      recordDate: new Date(record.recordDate),
      source: importDto.source as MarketDataSource,
      notes: JSON.stringify({
        originalRecord: record,
        importedAt: new Date(),
      }),
    };
  }

  private async saveImportHistory(importDto: MarketDataImportDto, progress: ImportProgress, userId: string): Promise<void> {
    const history: Partial<ImportHistory> = {
      dataType: importDto.dataType,
      source: importDto.source,
      fileName: importDto.file?.originalname || 'API Import',
      recordsImported: progress.successfulRecords,
      recordsFailed: progress.failedRecords,
      importedBy: userId,
      importedAt: new Date(),
      status: progress.status,
      errors: progress.errors,
    };
    
    await this.importHistoryRepository.save(history);
  }

  // Market Data Export Methods
  async exportMarketData(exportDto: MarketDataExportDto): Promise<{ downloadUrl: string; fileName: string }> {
    const queryBuilder = this.marketDataRepository.createQueryBuilder('data');
    
    // Apply filters
    if (exportDto.dataType !== 'all') {
      queryBuilder.where('data.propertyType = :propertyType', { propertyType: exportDto.dataType });
    }
    
    if (exportDto.region) {
      queryBuilder.andWhere('data.location = :location', { location: exportDto.region });
    }
    
    if (exportDto.dateRange) {
      queryBuilder.andWhere('data.recordDate BETWEEN :startDate AND :endDate', {
        startDate: exportDto.dateRange.startDate,
        endDate: exportDto.dateRange.endDate,
      });
    }
    
    const data = await queryBuilder.getMany();
    
    // Generate export file
    const fileName = `market_data_export_${Date.now()}.${exportDto.format}`;
    const filePath = await this.generateExportFile(data, exportDto, fileName);
    
    return {
      downloadUrl: `/api/admin/market-analysis/download/${fileName}`,
      fileName,
    };
  }

  private async generateExportFile(data: MarketData[], exportDto: MarketDataExportDto, fileName: string): Promise<string> {
    const exportDir = path.join(process.cwd(), 'exports');
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }
    
    const filePath = path.join(exportDir, fileName);
    
    switch (exportDto.format) {
      case 'csv':
        await this.generateCsvFile(data, filePath, exportDto.includeMetadata);
        break;
      case 'json':
        await this.generateJsonFile(data, filePath, exportDto.includeMetadata);
        break;
      case 'excel':
        await this.generateExcelFile(data, filePath, exportDto.includeMetadata);
        break;
    }
    
    return filePath;
  }

  private async generateCsvFile(data: MarketData[], filePath: string, includeMetadata: boolean): Promise<void> {
    const headers = ['id', 'location', 'propertyType', 'averagePrice', 'medianPrice', 'salesVolume', 'recordDate', 'source', 'createdAt', 'updatedAt'];
    if (includeMetadata) headers.push('notes');
    
    const csvContent = [headers.join(',')];
    
    for (const record of data) {
      const row = [
        record.id,
        record.location,
        record.propertyType || '',
        record.averagePrice,
        record.medianPrice,
        record.salesVolume,
        record.recordDate.toISOString(),
        record.source,
        record.createdAt.toISOString(),
        record.updatedAt.toISOString(),
      ];
      
      if (includeMetadata) {
        row.push(JSON.stringify(record.notes || ''));
      }
      
      csvContent.push(row.join(','));
    }
    
    fs.writeFileSync(filePath, csvContent.join('\n'));
  }

  private async generateJsonFile(data: MarketData[], filePath: string, includeMetadata: boolean): Promise<void> {
    let exportData: any[] = data;
    
    if (!includeMetadata) {
      exportData = data.map(({ notes, ...record }) => record);
    }
    
    fs.writeFileSync(filePath, JSON.stringify(exportData, null, 2));
  }

  private async generateExcelFile(data: MarketData[], filePath: string, includeMetadata: boolean): Promise<void> {
    // For now, generate CSV format (Excel implementation would require additional library)
    await this.generateCsvFile(data, filePath.replace('.excel', '.csv'), includeMetadata);
  }

  // Price Trend Configuration Methods
  async getPriceTrendConfig(): Promise<PriceTrendConfigDto> {
    // In a real implementation, this would be stored in database
    return {
      analysisType: 'moving_average',
      timeWindow: 30,
      confidenceLevel: 0.95,
      smoothingFactor: 0.3,
      seasonalPeriods: 12,
      forecastHorizon: 90,
      alertThresholds: {
        priceChangePercent: 5.0,
        volumeChangePercent: 10.0,
        yieldChangePercent: 0.5,
      },
      regions: ['London', 'Manchester', 'Birmingham', 'Leeds', 'Liverpool'],
      propertyTypes: ['flat', 'terraced', 'semi-detached', 'detached'],
      updateFrequency: 'daily',
      enableAlerts: true,
    };
  }

  async updatePriceTrendConfig(config: PriceTrendConfigDto, userId: string): Promise<PriceTrendConfigDto> {
    // Validate configuration
    this.validatePriceTrendConfig(config);
    
    // In a real implementation, save to database
    // await this.configRepository.save({ category: 'price_trends', config, updatedBy: userId });
    
    // Emit configuration updated event
    this.eventEmitter.emit('market.price.trend.config.updated', {
      config,
      userId,
      timestamp: new Date(),
    });
    
    return config;
  }

  private validatePriceTrendConfig(config: PriceTrendConfigDto): void {
    if (config.timeWindow < 1 || config.timeWindow > 365) {
      throw new BadRequestException('Time window must be between 1 and 365 days');
    }
    
    if (config.confidenceLevel < 0.5 || config.confidenceLevel > 0.99) {
      throw new BadRequestException('Confidence level must be between 0.5 and 0.99');
    }
    
    if (config.forecastHorizon && (config.forecastHorizon < 1 || config.forecastHorizon > 365)) {
      throw new BadRequestException('Forecast horizon must be between 1 and 365 days');
    }
  }

  // Analytics Settings Methods
  async getAnalyticsSettings(): Promise<AnalyticsSettingsDto> {
    // In a real implementation, this would be stored in database
    return {
      dataRetentionPeriod: 1825, // 5 years
      aggregationLevels: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'],
      benchmarkIndices: ['UK_HOUSE_PRICE_INDEX', 'LONDON_PROPERTY_INDEX', 'RENTAL_YIELD_INDEX'],
      correlationAnalysis: {
        enabled: true,
        variables: ['interest_rates', 'unemployment', 'gdp_growth', 'inflation'],
        updateFrequency: 'monthly',
      },
      performanceMetrics: {
        enabled: true,
        metrics: ['price_growth', 'yield_performance', 'volatility', 'sharpe_ratio'],
        benchmarks: ['market_average', 'regional_average', 'property_type_average'],
      },
      reportGeneration: {
        automated: true,
        frequency: 'monthly',
        recipients: ['admin@propertymastersuk.com'],
        format: 'pdf',
      },
      dataQuality: {
        validationRules: [
          { field: 'value', rule: 'positive_number' },
          { field: 'date', rule: 'valid_date' },
          { field: 'region', rule: 'known_region' },
        ],
        outlierDetection: true,
        missingDataHandling: 'interpolate',
      },
    };
  }

  async updateAnalyticsSettings(settings: AnalyticsSettingsDto, userId: string): Promise<AnalyticsSettingsDto> {
    // Validate settings
    this.validateAnalyticsSettings(settings);
    
    // In a real implementation, save to database
    // await this.configRepository.save({ category: 'analytics', settings, updatedBy: userId });
    
    // Emit settings updated event
    this.eventEmitter.emit('market.analytics.settings.updated', {
      settings,
      userId,
      timestamp: new Date(),
    });
    
    return settings;
  }

  private validateAnalyticsSettings(settings: AnalyticsSettingsDto): void {
    if (settings.dataRetentionPeriod < 30) {
      throw new BadRequestException('Data retention period must be at least 30 days');
    }
    
    if (!settings.aggregationLevels || settings.aggregationLevels.length === 0) {
      throw new BadRequestException('At least one aggregation level must be specified');
    }
  }

  // Import Progress and History Methods
  async getImportProgress(importId: string): Promise<ImportProgress> {
    const progress = this.importProgressMap.get(importId);
    if (!progress) {
      throw new NotFoundException(`Import with ID ${importId} not found`);
    }
    return progress;
  }

  async cancelImport(importId: string, userId: string): Promise<{ success: boolean; message: string }> {
    const progress = this.importProgressMap.get(importId);
    if (!progress) {
      throw new NotFoundException(`Import with ID ${importId} not found`);
    }
    
    if (progress.status === ImportStatus.COMPLETED || progress.status === ImportStatus.FAILED) {
      throw new BadRequestException('Cannot cancel completed or failed import');
    }
    
    progress.status = ImportStatus.CANCELLED;
    progress.endTime = new Date();
    
    // Emit cancellation event
    this.eventEmitter.emit('market.data.import.cancelled', {
      importId,
      userId,
      timestamp: new Date(),
    });
    
    return {
      success: true,
      message: 'Import cancelled successfully',
    };
  }

  async getImportHistory(page: number = 1, limit: number = 20): Promise<{
    data: ImportHistory[];
    total: number;
    page: number;
    limit: number;
  }> {
    const [data, total] = await this.importHistoryRepository.findAndCount({
      order: { importedAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    
    return { data, total, page, limit };
  }

  // Market Analytics Methods
  async getMarketAnalytics(region?: string, dateRange?: { startDate: Date; endDate: Date }): Promise<MarketAnalytics> {
    const queryBuilder = this.marketDataRepository.createQueryBuilder('data');
    
    if (region) {
      queryBuilder.where('data.region = :region', { region });
    }
    
    if (dateRange) {
      queryBuilder.andWhere('data.date BETWEEN :startDate AND :endDate', dateRange);
    }
    
    const data = await queryBuilder.getMany();
    
    // Calculate analytics
    const summary = await this.calculateSummary(data);
    const trends = await this.calculateTrends(data);
    const forecasts = await this.generateForecasts(data);
    const alerts = await this.getActiveAlerts();
    
    return { summary, trends, forecasts, alerts };
  }

  private async calculateSummary(data: MarketData[]): Promise<MarketAnalytics['summary']> {
    const dataTypes = {};
    const regions = {};
    let minDate = new Date();
    let maxDate = new Date(0);
    
    for (const record of data) {
      dataTypes[record.propertyType] = (dataTypes[record.propertyType] || 0) + 1;
      regions[record.location] = (regions[record.location] || 0) + 1;
      
      if (record.recordDate < minDate) minDate = record.recordDate;
      if (record.recordDate > maxDate) maxDate = record.recordDate;
    }
    
    return {
      totalRecords: data.length,
      dataTypes,
      regions,
      dateRange: { startDate: minDate, endDate: maxDate },
      lastUpdated: new Date(),
    };
  }

  private async calculateTrends(data: MarketData[]): Promise<MarketAnalytics['trends']> {
    // Simplified trend calculation
    const priceChanges = {};
    const volumeChanges = {};
    const yieldChanges = {};
    
    // Group by location and calculate changes
    const locationData = {};
    for (const record of data) {
      if (!locationData[record.location]) {
        locationData[record.location] = [];
      }
      locationData[record.location].push(record);
    }
    
    for (const [location, records] of Object.entries(locationData)) {
      const sortedRecords = (records as MarketData[]).sort((a, b) => a.recordDate.getTime() - b.recordDate.getTime());
      
      if (sortedRecords.length >= 2) {
        const firstValue = sortedRecords[0].averagePrice;
        const lastValue = sortedRecords[sortedRecords.length - 1].averagePrice;
        const change = ((lastValue - firstValue) / firstValue) * 100;
        
        priceChanges[location] = change;
        volumeChanges[location] = Math.random() * 20 - 10; // Mock data
        yieldChanges[location] = Math.random() * 2 - 1; // Mock data
      }
    }
    
    return { priceChanges, volumeChanges, yieldChanges };
  }

  private async generateForecasts(data: MarketData[]): Promise<MarketAnalytics['forecasts']> {
    // Simplified forecast generation (in real implementation, use proper forecasting algorithms)
    const forecasts = {};
    
    const locationData = {};
    for (const record of data) {
      if (!locationData[record.location]) {
        locationData[record.location] = [];
      }
      locationData[record.location].push(record);
    }
    
    for (const [location, records] of Object.entries(locationData)) {
      const sortedRecords = (records as MarketData[]).sort((a, b) => a.recordDate.getTime() - b.recordDate.getTime());
      
      if (sortedRecords.length >= 5) {
        const prices = [];
        const yields = [];
        
        // Generate 30-day forecast
        for (let i = 1; i <= 30; i++) {
          const futureDate = new Date();
          futureDate.setDate(futureDate.getDate() + i);
          
          const lastValue = sortedRecords[sortedRecords.length - 1].averagePrice;
          const trend = Math.random() * 0.02 - 0.01; // Random trend
          const forecastValue = lastValue * (1 + trend * i);
          
          prices.push({
            date: futureDate,
            value: forecastValue,
            confidence: Math.max(0.5, 0.95 - (i * 0.01)),
          });
          
          yields.push({
            date: futureDate,
            value: 4.5 + Math.random() * 2, // Mock yield data
            confidence: Math.max(0.5, 0.95 - (i * 0.01)),
          });
        }
        
        forecasts[location] = { prices, yields };
      }
    }
    
    return forecasts;
  }

  private async getActiveAlerts(): Promise<MarketAnalytics['alerts']> {
    // Mock alerts (in real implementation, fetch from alerts table)
    return [
      {
        id: 'alert_1',
        type: 'price_spike',
        region: 'London',
        message: 'Property prices increased by 8% in the last month',
        severity: 'high',
        createdAt: new Date(),
      },
      {
        id: 'alert_2',
        type: 'yield_drop',
        region: 'Manchester',
        message: 'Rental yields decreased by 0.3% this quarter',
        severity: 'medium',
        createdAt: new Date(),
      },
    ];
  }

  // Utility Methods
  async validateCsvFile(file: Express.Multer.File): Promise<{ valid: boolean; errors: string[]; preview: any[] }> {
    const errors: string[] = [];
    const preview: any[] = [];
    
    try {
      const records = await this.parseCsvFile(file.buffer);
      
      // Take first 5 records for preview
      preview.push(...records.slice(0, 5));
      
      // Validate structure
      if (records.length === 0) {
        errors.push('CSV file is empty');
      }
      
      const requiredFields = ['averagePrice', 'recordDate', 'location'];
      const firstRecord = records[0];
      
      for (const field of requiredFields) {
        if (!firstRecord.hasOwnProperty(field)) {
          errors.push(`Missing required field: ${field}`);
        }
      }
      
      // Validate data types
      for (let i = 0; i < Math.min(records.length, 10); i++) {
        const record = records[i];
        
        if (isNaN(parseFloat(record.averagePrice))) {
          errors.push(`Invalid averagePrice in row ${i + 1}: ${record.averagePrice}`);
        }
        
        if (isNaN(Date.parse(record.recordDate))) {
          errors.push(`Invalid recordDate in row ${i + 1}: ${record.recordDate}`);
        }
      }
      
    } catch (error) {
      errors.push(`Failed to parse CSV: ${error.message}`);
    }
    
    return {
      valid: errors.length === 0,
      errors,
      preview,
    };
  }

  async getDataSummary(): Promise<{
    totalRecords: number;
    dataTypes: { [key: string]: number };
    regions: { [key: string]: number };
    dateRange: { startDate: Date; endDate: Date };
  }> {
    const totalRecords = await this.marketDataRepository.count();
    
    // Get property type distribution
    const propertyTypeQuery = await this.marketDataRepository
      .createQueryBuilder('data')
      .select('data.propertyType', 'propertyType')
      .addSelect('COUNT(*)', 'count')
      .groupBy('data.propertyType')
      .getRawMany();
    
    const dataTypes = {};
    for (const item of propertyTypeQuery) {
      dataTypes[item.propertyType] = parseInt(item.count);
    }
    
    // Get location distribution
    const locationQuery = await this.marketDataRepository
      .createQueryBuilder('data')
      .select('data.location', 'location')
      .addSelect('COUNT(*)', 'count')
      .groupBy('data.location')
      .getRawMany();
    
    const regions = {};
    for (const item of locationQuery) {
      regions[item.location] = parseInt(item.count);
    }
    
    // Get date range
    const dateRangeQuery = await this.marketDataRepository
      .createQueryBuilder('data')
      .select('MIN(data.recordDate)', 'minDate')
      .addSelect('MAX(data.recordDate)', 'maxDate')
      .getRawOne();
    
    return {
      totalRecords,
      dataTypes,
      regions,
      dateRange: {
        startDate: dateRangeQuery.minDate || new Date(),
        endDate: dateRangeQuery.maxDate || new Date(),
      },
    };
  }
}
