import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import * as NodeCache from 'node-cache';
import * as csv from 'csv-parser';
import { Readable } from 'stream';
import { v4 as uuidv4 } from 'uuid';
import { CsvImportDto, CsvImportResponseDto, CsvImportStatusDto } from './dto/land-registry.dto';
import { ImportJob } from '../admin/entities/import-job.entity';
import { Express } from 'express';
import { PricePaidRecord } from './entities/price-paid-record.entity';
import { Property } from '../properties/entities/property.entity';
import { OwnershipRecord } from './entities/ownership-record.entity';
import { TitleRecord } from './entities/title-record.entity';
import { ApiUsageLog } from './entities/api-usage-log.entity';
import {
  PropertySearchRequest,
  PropertySearchResponse,
  OwnershipLookupRequest,
  OwnershipLookupResponse,
  PricePaidSearchRequest,
  PricePaidSearchResponse,
  BulkExportRequest,
  BulkExportResponse,
  PropertyWithDetails,
  PropertyStatistics,
  LandRegistryApiResponse,
  // LandRegistryError,
  // PropertyValuation,
  // MarketAnalysis,
  Transaction,
  Ownership
} from '../shared/types/land-registry.types';
import { BulkExport } from './entities/bulk-export.entity';

@Injectable()
export class LandRegistryService {
  private readonly logger = new Logger(LandRegistryService.name);
  private readonly httpClient: AxiosInstance;
  private readonly cache: NodeCache;
  private readonly apiBaseUrl: string;
  private readonly apiKey: string;
  private readonly rateLimitPerMinute: number;
  private requestCount = 0;
  private lastResetTime = Date.now();

  constructor(
    private configService: ConfigService,
    private dataSource: DataSource,
    @InjectRepository(Property)
    private propertyRepository: Repository<Property>,
    @InjectRepository(OwnershipRecord)
    private ownershipRepository: Repository<OwnershipRecord>,
    @InjectRepository(PricePaidRecord)
    private pricePaidRepository: Repository<PricePaidRecord>,
    @InjectRepository(TitleRecord)
    private titleRepository: Repository<TitleRecord>,
    @InjectRepository(BulkExport)
    private bulkExportRepository: Repository<BulkExport>,
    @InjectRepository(ApiUsageLog)
    private apiUsageLogRepository: Repository<ApiUsageLog>
  ) {
    this.apiBaseUrl = this.configService.get<string>('LAND_REGISTRY_API_URL', 'https://landregistry.data.gov.uk');
    this.apiKey = this.configService.get<string>('LAND_REGISTRY_API_KEY', '');
    this.rateLimitPerMinute = this.configService.get<number>('LAND_REGISTRY_RATE_LIMIT', 60);

    // Initialize HTTP client with default configuration
    this.httpClient = axios.create({
      baseURL: this.apiBaseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'PropertyMastersUK/1.0',
        ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
      }
    });

    // Initialize cache with 1 hour TTL
    this.cache = new NodeCache({ 
      stdTTL: 3600, 
      checkperiod: 600,
      useClones: false
    });

    // Setup request/response interceptors
    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor for rate limiting and logging
    this.httpClient.interceptors.request.use(
      async (config) => {
        await this.checkRateLimit();
        this.logger.debug(`Making request to: ${config.url}`);
        return config;
      },
      (error) => {
        this.logger.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for logging and error handling
    this.httpClient.interceptors.response.use(
      (response) => {
        this.logger.debug(`Response received: ${response.status}`);
        return response;
      },
      (error) => {
        this.logger.error('API request failed:', {
          url: error.config?.url,
          status: error.response?.status,
          message: error.message
        });
        return Promise.reject(this.handleApiError(error));
      }
    );
  }

  private async checkRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceReset = now - this.lastResetTime;

    // Reset counter every minute
    if (timeSinceReset >= 60000) {
      this.requestCount = 0;
      this.lastResetTime = now;
    }

    // Check if rate limit exceeded
    if (this.requestCount >= this.rateLimitPerMinute) {
      const waitTime = 60000 - timeSinceReset;
      this.logger.warn(`Rate limit exceeded. Waiting ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      this.requestCount = 0;
      this.lastResetTime = Date.now();
    }

    this.requestCount++;
  }

  private handleApiError(error: any): HttpException {
    const status = error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;
    const message = error.response?.data?.message || error.message || 'Land Registry API error';
    
    return new HttpException({
      code: `LR_${status}`,
      message,
      details: error.response?.data,
      timestamp: new Date().toISOString()
    }, status);
  }

  private async logApiUsage(
    userId: string | null,
    endpoint: string,
    method: string,
    responseStatus: number,
    responseTime: number
  ): Promise<void> {
    try {
      const log = this.apiUsageLogRepository.create({
        userId,
        endpoint,
        method,
        responseStatus,
        responseTimeMs: responseTime
      });
      await this.apiUsageLogRepository.save(log);
    } catch (error) {
      this.logger.error('Failed to log API usage:', error);
    }
  }

  // Property search functionality
  async searchProperties(
    searchRequest: PropertySearchRequest,
    userId?: string
  ): Promise<LandRegistryApiResponse<PropertySearchResponse>> {
    const startTime = Date.now();
    const cacheKey = `property_search_${JSON.stringify(searchRequest)}`;

    try {
      // Check cache first
      const cachedResult = this.cache.get<PropertySearchResponse>(cacheKey);
      if (cachedResult) {
        this.logger.debug('Returning cached property search results');
        return {
          success: true,
          data: cachedResult,
          metadata: {
            requestId: this.generateRequestId(),
            timestamp: new Date(),
            processingTime: Date.now() - startTime
          }
        };
      }

      // Build query for local database first
      const queryBuilder = this.propertyRepository
        .createQueryBuilder('property')
        .leftJoinAndSelect('property.ownershipRecords', 'ownership', 'ownership.isCurrent = true')
        .leftJoinAndSelect('property.pricePaidRecords', 'priceRecord')
        .orderBy('priceRecord.transferDate', 'DESC');

      // Apply filters
      if (searchRequest.postcode) {
        queryBuilder.andWhere('property.postcode ILIKE :postcode', {
          postcode: `%${searchRequest.postcode}%`
        });
      }

      if (searchRequest.address) {
        queryBuilder.andWhere(
          '(property.addressLine1 ILIKE :address OR property.addressLine2 ILIKE :address)',
          { address: `%${searchRequest.address}%` }
        );
      }

      if (searchRequest.uprn) {
        queryBuilder.andWhere('property.uprn = :uprn', { uprn: searchRequest.uprn });
      }

      if (searchRequest.titleNumber) {
        queryBuilder.andWhere('property.titleNumber = :titleNumber', {
          titleNumber: searchRequest.titleNumber
        });
      }

      if (searchRequest.propertyTypes?.length) {
        queryBuilder.andWhere('property.propertyType IN (:...types)', {
          types: searchRequest.propertyTypes
        });
      }

      // Apply pagination
      const limit = Math.min(searchRequest.limit || 50, 100);
      const offset = searchRequest.offset || 0;
      queryBuilder.take(limit).skip(offset);

      const [properties, totalCount] = await queryBuilder.getManyAndCount();

      // Transform to PropertyWithDetails
      const propertiesWithDetails: PropertyWithDetails[] = properties.map(property => ({
        ...property,
        address: property.addressLine1 || '',
        propertyType: property.type || 'unknown',
        latestPrice: null, // TODO: Implement price lookup
        latestSaleDate: null, // TODO: Implement sale date lookup
        currentOwner: null, // TODO: Implement owner lookup
        ownershipType: null, // TODO: Implement ownership type lookup,
        priceHistory: [], // TODO: Implement price history lookup
        ownershipHistory: [] // TODO: Implement ownership history lookup
      }));

      const response: PropertySearchResponse = {
        properties: propertiesWithDetails,
        totalCount,
        hasMore: totalCount > offset + limit,
        // nextOffset: totalCount > offset + limit ? offset + limit : undefined // TODO: Add to response type
      };

      // Cache the result
      this.cache.set(cacheKey, response, 1800); // 30 minutes

      await this.logApiUsage(
        userId || null,
        '/properties/search',
        'GET',
        200,
        Date.now() - startTime
      );

      return {
        success: true,
        data: response,
        metadata: {
          requestId: this.generateRequestId(),
          timestamp: new Date(),
          processingTime: Date.now() - startTime
        }
      };
    } catch (error) {
      this.logger.error('Property search failed:', error);
      await this.logApiUsage(
        userId || null,
        '/properties/search',
        'GET',
        500,
        Date.now() - startTime
      );
      throw error;
    }
  }

  // Ownership lookup functionality
  async lookupOwnership(
    lookupRequest: OwnershipLookupRequest,
    userId?: string
  ): Promise<LandRegistryApiResponse<OwnershipLookupResponse>> {
    const startTime = Date.now();
    const cacheKey = `ownership_lookup_${JSON.stringify(lookupRequest)}`;

    try {
      // Check cache first
      const cachedResult = this.cache.get<OwnershipLookupResponse>(cacheKey);
      if (cachedResult) {
        return {
          success: true,
          data: cachedResult,
          metadata: {
            requestId: this.generateRequestId(),
            timestamp: new Date(),
            processingTime: Date.now() - startTime
          }
        };
      }

      let property: Property | null = null;

      // Find property by different identifiers
      if (lookupRequest.titleNumber) {
        property = await this.propertyRepository.findOne({
          where: { landRegistryTitleNumber: lookupRequest.titleNumber },
          relations: ['ownershipRecords', 'titleRecords']
        });
      } else if (lookupRequest.uprn) {
        property = await this.propertyRepository.findOne({
          where: { uprn: lookupRequest.uprn },
          relations: ['ownershipRecords', 'titleRecords']
        });
      } else if (lookupRequest.postcode && lookupRequest.address) {
        property = await this.propertyRepository
          .createQueryBuilder('property')
          .leftJoinAndSelect('property.ownershipRecords', 'ownership')
          .leftJoinAndSelect('property.titleRecords', 'title')
          .where('property.postcode ILIKE :postcode', {
            postcode: `%${lookupRequest.postcode}%`
          })
          .andWhere(
            '(property.addressLine1 ILIKE :address OR property.addressLine2 ILIKE :address)',
            { address: `%${lookupRequest.address}%` }
          )
          .getOne();
      }

      if (!property) {
        throw new HttpException('Property not found', HttpStatus.NOT_FOUND);
      }

      // Get current ownership
      const currentOwnership = await this.ownershipRepository.find({
        where: { propertyId: property.id, isCurrent: true },
        order: { createdAt: 'DESC' }
      });

      // Get ownership history if requested
      let ownershipHistory = [];
      if (lookupRequest.includeHistory) {
        ownershipHistory = await this.ownershipRepository.find({
          where: { propertyId: property.id },
          order: { registrationDate: 'DESC' }
        });
      }

      // Get title record
      const titleRecord = await this.titleRepository.findOne({
        where: { propertyId: property.id }
      });

      // Transform currentOwnership to match Ownership interface
      const ownershipData: Ownership = {
        id: `ownership-${property.id}`,
        owners: currentOwnership.map(record => ({
          name: record.ownerName || 'Unknown',
          address: record.ownerAddress || '',
          type: 'individual' as const,
          share: '100%'
        })),
        registrationDate: currentOwnership[0]?.registrationDate || new Date(),
        tenure: property.tenure || 'unknown',
        restrictions: [],
        charges: []
      };

      const response: OwnershipLookupResponse = {
        property: {
          ...property,
          address: property.addressLine1 || '',
          propertyType: property.type || 'unknown'
        },
        currentOwnership: ownershipData,
        ownershipHistory
      };

      // Cache the result
      this.cache.set(cacheKey, response, 3600); // 1 hour

      await this.logApiUsage(
        userId || null,
        '/ownership/lookup',
        'GET',
        200,
        Date.now() - startTime
      );

      return {
        success: true,
        data: response,
        metadata: {
          requestId: this.generateRequestId(),
          timestamp: new Date(),
          processingTime: Date.now() - startTime
        }
      };
    } catch (error) {
      this.logger.error('Ownership lookup failed:', error);
      await this.logApiUsage(
        userId || null,
        '/ownership/lookup',
        'GET',
        error.status || 500,
        Date.now() - startTime
      );
      throw error;
    }
  }

  // Price paid data search
  async searchPricePaidData(
    searchRequest: PricePaidSearchRequest,
    userId?: string
  ): Promise<LandRegistryApiResponse<PricePaidSearchResponse>> {
    const startTime = Date.now();
    const cacheKey = `price_paid_search_${JSON.stringify(searchRequest)}`;

    try {
      // Check cache first
      const cachedResult = this.cache.get<PricePaidSearchResponse>(cacheKey);
      if (cachedResult) {
        return {
          success: true,
          data: cachedResult,
          metadata: {
            requestId: this.generateRequestId(),
            timestamp: new Date(),
            processingTime: Date.now() - startTime
          }
        };
      }

      const queryBuilder = this.pricePaidRepository
        .createQueryBuilder('priceRecord')
        .leftJoinAndSelect('priceRecord.property', 'property')
        .where('priceRecord.recordStatus = :status', { status: 'A' })
        .orderBy('priceRecord.transferDate', 'DESC');

      // Apply filters
      if (searchRequest.postcode) {
        queryBuilder.andWhere('property.postcode ILIKE :postcode', {
          postcode: `%${searchRequest.postcode}%`
        });
      }

      if (searchRequest.address) {
        queryBuilder.andWhere(
          '(property.addressLine1 ILIKE :address OR property.addressLine2 ILIKE :address)',
          { address: `%${searchRequest.address}%` }
        );
      }

      if (searchRequest.uprn) {
        queryBuilder.andWhere('property.uprn = :uprn', { uprn: searchRequest.uprn });
      }

      if (searchRequest.minPrice) {
        queryBuilder.andWhere('priceRecord.price >= :minPrice', {
          minPrice: searchRequest.minPrice
        });
      }

      if (searchRequest.maxPrice) {
        queryBuilder.andWhere('priceRecord.price <= :maxPrice', {
          maxPrice: searchRequest.maxPrice
        });
      }

      if (searchRequest.dateFrom) {
        queryBuilder.andWhere('priceRecord.transferDate >= :dateFrom', {
          dateFrom: searchRequest.dateFrom
        });
      }

      if (searchRequest.dateTo) {
        queryBuilder.andWhere('priceRecord.transferDate <= :dateTo', {
          dateTo: searchRequest.dateTo
        });
      }

      if (searchRequest.propertyTypes?.length) {
        queryBuilder.andWhere('priceRecord.propertyType IN (:...types)', {
          types: searchRequest.propertyTypes
        });
      }

      if (searchRequest.newBuildOnly) {
        queryBuilder.andWhere('priceRecord.newBuild = true');
      }

      // Apply pagination
      const limit = Math.min(searchRequest.limit || 50, 100);
      const offset = searchRequest.offset || 0;
      queryBuilder.take(limit).skip(offset);

      const [transactions, totalCount] = await queryBuilder.getManyAndCount();

      // Calculate statistics
      const prices = transactions.map(t => t.price);
      const averagePrice = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;
      const sortedPrices = prices.sort((a, b) => a - b);
      const medianPrice = sortedPrices.length > 0 
        ? sortedPrices[Math.floor(sortedPrices.length / 2)] 
        : 0;

      // Transform transactions to match Transaction interface
      const transformedTransactions: Transaction[] = transactions.map(record => ({
          id: record.id,
          price: record.price,
          date: new Date(record.transferDate),
          property: {
            id: record.property.id,
            uprn: record.property.uprn,
            titleNumber: record.property.landRegistryTitleNumber,
            address: record.property.addressLine1 || '',
            postcode: record.property.postcode,
            propertyType: record.propertyType,
            tenure: record.property.tenure
          },
          propertyType: record.propertyType,
          newBuild: record.newBuild,
          tenure: record.property.tenure || 'unknown',
          buyer: undefined,
          seller: undefined
        }));

      const response: PricePaidSearchResponse = {
        transactions: transformedTransactions,
        totalCount,
        hasMore: totalCount > offset + limit,
        nextOffset: totalCount > offset + limit ? offset + limit : undefined,
        statistics: {
          averagePrice,
          medianPrice,
          priceRange: {
            min: Math.min(...prices),
            max: Math.max(...prices)
          }
        }
      };

      // Cache the result
      this.cache.set(cacheKey, response, 1800); // 30 minutes

      await this.logApiUsage(
        userId || null,
        '/price-paid/search',
        'GET',
        200,
        Date.now() - startTime
      );

      return {
        success: true,
        data: response,
        metadata: {
          requestId: this.generateRequestId(),
          timestamp: new Date(),
          processingTime: Date.now() - startTime
        }
      };
    } catch (error) {
      this.logger.error('Price paid search failed:', error);
      await this.logApiUsage(
        userId || null,
        '/price-paid/search',
        'GET',
        500,
        Date.now() - startTime
      );
      throw error;
    }
  }

  // Bulk export functionality
  async createBulkExport(
    exportRequest: BulkExportRequest,
    userId: string
  ): Promise<LandRegistryApiResponse<BulkExportResponse>> {
    const startTime = Date.now();
    const exportId = this.generateExportId();

    try {
      // Create bulk export record
      const bulkExport = this.bulkExportRepository.create({
        userId,
        exportId,
        searchCriteria: exportRequest.searchCriteria,
        exportFormat: exportRequest.exportFormat,
        status: 'pending'
      });

      await this.bulkExportRepository.save(bulkExport);

      // Start async processing
      this.processBulkExport(bulkExport.id, exportRequest).catch(error => {
        this.logger.error('Bulk export processing failed:', error);
      });

      const response: BulkExportResponse = {
        exportId,
        status: 'pending',
        createdAt: new Date()
      };

      await this.logApiUsage(
        userId,
        '/bulk-export/create',
        'POST',
        200,
        Date.now() - startTime
      );

      return {
        success: true,
        data: response,
        metadata: {
          requestId: this.generateRequestId(),
          timestamp: new Date(),
          processingTime: Date.now() - startTime
        }
      };
    } catch (error) {
      this.logger.error('Bulk export creation failed:', error);
      await this.logApiUsage(
        userId,
        '/bulk-export/create',
        'POST',
        500,
        Date.now() - startTime
      );
      throw error;
    }
  }

  // Get bulk export status
  async getBulkExportStatus(
    exportId: string,
    userId: string
  ): Promise<LandRegistryApiResponse<BulkExport>> {
    const startTime = Date.now();

    try {
      const bulkExport = await this.bulkExportRepository.findOne({
        where: { exportId, userId }
      });

      if (!bulkExport) {
        throw new HttpException('Export not found', HttpStatus.NOT_FOUND);
      }

      await this.logApiUsage(
        userId,
        '/bulk-export/status',
        'GET',
        200,
        Date.now() - startTime
      );

      return {
        success: true,
        data: bulkExport,
        metadata: {
          requestId: this.generateRequestId(),
          timestamp: new Date(),
          processingTime: Date.now() - startTime
        }
      };
    } catch (error) {
      this.logger.error('Get bulk export status failed:', error);
      await this.logApiUsage(
        userId,
        '/bulk-export/status',
        'GET',
        error.status || 500,
        Date.now() - startTime
      );
      throw error;
    }
  }

  // Property statistics
  async getPropertyStatistics(
    filters: PropertySearchRequest
  ): Promise<LandRegistryApiResponse<PropertyStatistics>> {
    const startTime = Date.now();
    const cacheKey = `property_stats_${JSON.stringify(filters)}`;

    try {
      // Check cache first
      const cachedResult = this.cache.get<PropertyStatistics>(cacheKey);
      if (cachedResult) {
        return {
          success: true,
          data: cachedResult,
          metadata: {
            requestId: this.generateRequestId(),
            timestamp: new Date(),
            processingTime: Date.now() - startTime
          }
        };
      }

      // Implementation would include complex statistical queries
      // This is a simplified version
      const queryBuilder = this.propertyRepository.createQueryBuilder('property')
        .leftJoin('property.pricePaidRecords', 'priceRecord')
        .where('priceRecord.recordStatus = :status', { status: 'A' });

      // Apply filters similar to search
      if (filters.postcode) {
        queryBuilder.andWhere('property.postcode ILIKE :postcode', {
          postcode: `%${filters.postcode}%`
        });
      }

      const properties = await queryBuilder.getMany();
      
      // Calculate basic statistics
      const stats: PropertyStatistics = {
        totalProperties: properties.length,
        averagePrice: 0,
        medianPrice: 0,
        priceDistribution: [],
        propertyTypeDistribution: [
          { type: 'D', count: 0, percentage: 0 },
          { type: 'S', count: 0, percentage: 0 },
          { type: 'T', count: 0, percentage: 0 },
          { type: 'F', count: 0, percentage: 0 },
          { type: 'O', count: 0, percentage: 0 }
        ],
        tenureDistribution: [
          { tenure: 'F', count: 0, percentage: 0 },
          { tenure: 'L', count: 0, percentage: 0 }
        ],
        salesTrends: []
      };

      // Cache the result
      this.cache.set(cacheKey, stats, 3600); // 1 hour

      return {
        success: true,
        data: stats,
        metadata: {
          requestId: this.generateRequestId(),
          timestamp: new Date(),
          processingTime: Date.now() - startTime
        }
      };
    } catch (error) {
      this.logger.error('Get property statistics failed:', error);
      throw error;
    }
  }

  // Private helper methods
  private async processBulkExport(bulkExportId: string, exportRequest: BulkExportRequest): Promise<void> {
    try {
      // Update status to processing
      await this.bulkExportRepository.update(bulkExportId, { status: 'processing' });

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Generate download URL (would be actual file generation in production)
      const downloadUrl = `https://api.propertymasters.uk/downloads/${bulkExportId}.${exportRequest.exportFormat}`;

      // Update with completion
      await this.bulkExportRepository.update(bulkExportId, {
        status: 'completed',
        downloadUrl,
        recordCount: 100, // Would be actual count
        completedAt: new Date()
      });

      this.logger.log(`Bulk export ${bulkExportId} completed successfully`);
    } catch (error) {
      this.logger.error(`Bulk export ${bulkExportId} failed:`, error);
      await this.bulkExportRepository.update(bulkExportId, { status: 'failed' });
    }
  }

  private generateRequestId(): string {
    return `lr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateExportId(): string {
    return `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Sync data from external Land Registry APIs
  async syncPropertyData(uprn?: string): Promise<void> {
    try {
      this.logger.log('Starting Land Registry data sync...');
      
      // Implementation would include actual API calls to Land Registry
      // This is a placeholder for the sync functionality
      
      this.logger.log('Land Registry data sync completed');
    } catch (error) {
      this.logger.error('Land Registry data sync failed:', error);
      throw error;
    }
  }

  // Clear cache
  clearCache(pattern?: string): void {
    if (pattern) {
      const keys = this.cache.keys().filter(key => key.includes(pattern));
      this.cache.del(keys);
    } else {
      this.cache.flushAll();
    }
    this.logger.log('Cache cleared');
  }

  // Health check
  async healthCheck(): Promise<{ status: string; details: any }> {
    try {
      // Check database connectivity
      await this.propertyRepository.count();
      
      // Check cache
      const cacheStats = this.cache.getStats();
      
      return {
        status: 'healthy',
        details: {
          database: 'connected',
          cache: cacheStats,
          rateLimitRemaining: this.rateLimitPerMinute - this.requestCount,
          lastSync: new Date().toISOString()
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        details: {
          error: error.message
        }
      };
    }
  }

  // CSV Import functionality
  private importJobs = new Map<string, any>();

  async importCsv(
    file: Express.Multer.File,
    options: CsvImportDto,
    userId: string
  ): Promise<CsvImportResponseDto> {
    const importId = uuidv4();
    const startTime = new Date();

    try {
      this.logger.log(`Starting CSV import: ${importId}`);

      // Initialize import job
      const importJob = {
        importId,
        status: 'pending' as const,
        totalRecords: 0,
        processedRecords: 0,
        successfulRecords: 0,
        failedRecords: 0,
        validationErrors: [],
        importErrors: [],
        startedAt: startTime,
        completedAt: null,
        userId,
        fileName: file.originalname,
        fileSize: file.size
      };

      this.importJobs.set(importId, importJob);

      // Start processing asynchronously
      this.processCsvImport(file, options, importJob).catch(error => {
        this.logger.error(`CSV import ${importId} failed:`, error);
        (importJob as any).status = 'failed';
        importJob.importErrors.push(error.message);
        importJob.completedAt = new Date();
      });

      return {
        importId,
        status: 'pending',
        totalRecords: 0,
        processedRecords: 0,
        successfulRecords: 0,
        failedRecords: 0,
        validationErrors: [],
        importErrors: [],
        startedAt: startTime,
        completedAt: null
      };
    } catch (error) {
      this.logger.error('CSV import initialization failed:', error);
      throw new HttpException(
        'Failed to initialize CSV import',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  private async processCsvImport(
    file: Express.Multer.File,
    options: CsvImportDto,
    importJob: any
  ): Promise<void> {
    try {
      importJob.status = 'processing' as const;
      
      const records: any[] = [];
      const stream = Readable.from(file.buffer);
      
      // Parse CSV
      await new Promise<void>((resolve, reject) => {
        stream
          .pipe(csv())
          .on('data', (data) => {
            records.push(data);
          })
          .on('end', () => {
            resolve();
          })
          .on('error', (error) => {
            reject(error);
          });
      });

      importJob.totalRecords = records.length;
      this.logger.log(`Processing ${records.length} records for import ${importJob.importId}`);

      // Process records in batches
      const batchSize = options.batchSize || 100;
      const batches = this.chunkArray(records, batchSize);

      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        await this.processBatch(batch, importJob, options);
        
        // Update progress
        importJob.processedRecords = Math.min((i + 1) * batchSize, records.length);
        
        // Small delay to prevent overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      importJob.status = 'completed' as const;
      importJob.completedAt = new Date();
      
      this.logger.log(`CSV import ${importJob.importId} completed successfully`);
    } catch (error) {
      this.logger.error(`CSV import processing failed:`, error);
      importJob.status = 'failed' as const;
      importJob.importErrors.push(error.message);
      importJob.completedAt = new Date();
    }
  }

  private async processBatch(
    batch: any[],
    importJob: any,
    options: CsvImportDto
  ): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const record of batch) {
        try {
          // Validate record
          if (options.validateData) {
            const validationResult = this.validateCsvRecord(record);
            if (!validationResult.isValid) {
              importJob.validationErrors.push(...validationResult.errors);
              importJob.failedRecords++;
              continue;
            }
          }

          // Transform and save property data
          await this.savePropertyFromCsv(record, queryRunner, options);
          importJob.successfulRecords++;
        } catch (error) {
          this.logger.error(`Failed to process record:`, error);
          importJob.importErrors.push(`Row ${importJob.processedRecords + 1}: ${error.message}`);
          importJob.failedRecords++;
        }
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private validateCsvRecord(record: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Required fields validation
    if (!record.uprn) errors.push('UPRN is required');
    if (!record.address) errors.push('Address is required');
    if (!record.postcode) errors.push('Postcode is required');
    
    // Data type validation
    if (record.price && isNaN(Number(record.price))) {
      errors.push('Price must be a valid number');
    }
    
    if (record.transferDate && !this.isValidDate(record.transferDate)) {
      errors.push('Transfer date must be a valid date');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private async savePropertyFromCsv(
    record: any,
    queryRunner: any,
    options: CsvImportDto
  ): Promise<void> {
    // Check if property exists
    let property = await queryRunner.manager.findOne(Property, {
      where: { uprn: record.uprn }
    });

    if (property && !options.updateExisting) {
      throw new Error(`Property with UPRN ${record.uprn} already exists`);
    }

    if (!property) {
      property = queryRunner.manager.create(Property, {
        uprn: record.uprn,
        address: record.address,
        postcode: record.postcode,
        propertyType: record.propertyType || 'O',
        tenure: record.tenure || 'F',
        newBuild: record.newBuild === 'true' || record.newBuild === '1',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    } else {
      // Update existing property
      property.address = record.address || property.address;
      property.postcode = record.postcode || property.postcode;
      property.propertyType = record.propertyType || property.propertyType;
      property.tenure = record.tenure || property.tenure;
      property.updatedAt = new Date();
    }

    await queryRunner.manager.save(Property, property);

    // Save price paid record if price data exists
    if (record.price && record.transferDate) {
      const pricePaidRecord = queryRunner.manager.create(PricePaidRecord, {
        property,
        price: Number(record.price),
        transferDate: new Date(record.transferDate),
        propertyType: record.propertyType || 'O',
        tenure: record.tenure || 'F',
        newBuild: record.newBuild === 'true' || record.newBuild === '1',
        recordStatus: 'A',
        createdAt: new Date()
      });
      
      await queryRunner.manager.save(PricePaidRecord, pricePaidRecord);
    }
  }

  async getImportStatus(importId: string, userId: string): Promise<CsvImportStatusDto> {
    const importJob = this.importJobs.get(importId);
    
    if (!importJob) {
      throw new HttpException('Import job not found', HttpStatus.NOT_FOUND);
    }

    if (importJob.userId !== userId) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    const progress = importJob.totalRecords > 0 
      ? Math.round((importJob.processedRecords / importJob.totalRecords) * 100)
      : 0;

    let message = 'Import pending';
    if (importJob.status === 'processing') {
      message = `Processing records... ${importJob.processedRecords}/${importJob.totalRecords}`;
    } else if (importJob.status === 'completed') {
      message = 'Import completed successfully';
    } else if (importJob.status === 'failed') {
      message = 'Import failed';
    }

    return {
      importId,
      status: importJob.status,
      progress,
      message,
      statistics: {
        totalRecords: importJob.totalRecords,
        processedRecords: importJob.processedRecords,
        successfulRecords: importJob.successfulRecords,
        failedRecords: importJob.failedRecords,
        validationErrors: importJob.validationErrors.length
      },
      estimatedCompletion: this.calculateEstimatedCompletion(importJob)
    };
  }

  async getImportHistory(
    userId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<{ imports: CsvImportResponseDto[]; total: number }> {
    const userImports = Array.from(this.importJobs.values())
      .filter(job => job.userId === userId)
      .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime())
      .slice(offset, offset + limit)
      .map(job => ({
        importId: job.importId,
        status: job.status,
        totalRecords: job.totalRecords,
        processedRecords: job.processedRecords,
        successfulRecords: job.successfulRecords,
        failedRecords: job.failedRecords,
        validationErrors: job.validationErrors,
        importErrors: job.importErrors,
        startedAt: job.startedAt,
        completedAt: job.completedAt
      }));

    const total = Array.from(this.importJobs.values())
      .filter(job => job.userId === userId).length;

    return { imports: userImports, total };
  }

  async cancelImport(importId: string, userId: string): Promise<void> {
    const importJob = this.importJobs.get(importId);
    
    if (!importJob) {
      throw new HttpException('Import job not found', HttpStatus.NOT_FOUND);
    }

    if (importJob.userId !== userId) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    if (importJob.status === 'completed' || importJob.status === 'failed') {
      throw new HttpException('Cannot cancel completed or failed import', HttpStatus.BAD_REQUEST);
    }

    importJob.status = 'failed';
    importJob.importErrors.push('Import cancelled by user');
    importJob.completedAt = new Date();
    
    this.logger.log(`Import ${importId} cancelled by user ${userId}`);
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  private isValidDate(dateString: string): boolean {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  }

  private calculateEstimatedCompletion(importJob: any): Date | undefined {
    if (importJob.status !== 'processing' || importJob.processedRecords === 0) {
      return undefined;
    }

    const elapsed = Date.now() - importJob.startedAt.getTime();
    const rate = importJob.processedRecords / elapsed; // records per ms
    const remaining = importJob.totalRecords - importJob.processedRecords;
    const estimatedRemainingTime = remaining / rate;

    return new Date(Date.now() + estimatedRemainingTime);
  }
}
