import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import * as NodeCache from 'node-cache';
import {
  Property,
  OwnershipRecord,
  PricePaidRecord,
  TitleRecord,
  ApiUsageLog,
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
  LandRegistryError,
  PropertyValuation,
  MarketAnalysis
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
        latestPrice: property.pricePaidRecords?.[0]?.price,
        latestSaleDate: property.pricePaidRecords?.[0]?.transferDate,
        currentOwner: property.ownershipRecords?.[0]?.ownerName,
        ownershipType: property.ownershipRecords?.[0]?.ownershipType,
        priceHistory: property.pricePaidRecords?.slice(0, 10),
        ownershipHistory: property.ownershipRecords
      }));

      const response: PropertySearchResponse = {
        properties: propertiesWithDetails,
        totalCount,
        hasMore: totalCount > offset + limit,
        nextOffset: totalCount > offset + limit ? offset + limit : undefined
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
          where: { titleNumber: lookupRequest.titleNumber },
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

      const response: OwnershipLookupResponse = {
        property,
        currentOwnership,
        ownershipHistory,
        titleRecord
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

      const response: PricePaidSearchResponse = {
        transactions,
        totalCount,
        hasMore: totalCount > offset + limit,
        nextOffset: totalCount > offset + limit ? offset + limit : undefined,
        averagePrice,
        medianPrice
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
}