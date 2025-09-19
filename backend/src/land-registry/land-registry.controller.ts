import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  Param,
  UseGuards,
  Request,
  HttpStatus,
  HttpCode,
  ValidationPipe,
  UsePipes,
  Logger,
  BadRequestException,
  HttpException,
  UseInterceptors,
  Delete,
  Put,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator
} from '@nestjs/common';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth ,
  getSchemaPath,} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { LandRegistryService } from './land-registry.service';
import {
  PropertySearchRequest,
  OwnershipLookupRequest,
  PricePaidSearchRequest,
  BulkExportRequest,
  LandRegistryApiResponse
} from '../shared/types/land-registry.types';
import { BulkExport } from './entities/bulk-export.entity';
import { BulkExportResponse } from './entities/bulk-export-response.entity';
import { PropertyStatistics } from './entities/property-statistics.entity';
import { PropertySearchResponse } from './entities/property-search-response.entity';
import { OwnershipLookupResponse } from './entities/ownership-lookup-response.entity';
import { PricePaidSearchResponse } from './entities/price-paid-search-response.entity';
import {
  PropertySearchDto,
  OwnershipLookupDto,
  PricePaidSearchDto,
  BulkExportDto,
  PropertyValuationDto,
  SyncPropertyDataDto,
  ClearCacheDto,
  CsvImportDto,
  CsvImportResponseDto,
  CsvImportStatusDto,
  ApiResponseDto,
  ErrorResponseDto,
  HealthCheckResponseDto,
  SyncResponseDto,
  CacheResponseDto
} from './dto/land-registry.dto';

@ApiTags('Land Registry')
@Controller('api/land-registry')
export class LandRegistryController {
  private readonly logger = new Logger(LandRegistryController.name);

  constructor(private readonly landRegistryService: LandRegistryService) {}

  @Get('properties/search')
  @ApiOperation({ 
    summary: 'Search properties',
    description: 'Search for properties using various criteria including postcode, address, UPRN, or title number'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Properties found successfully', schema: { $ref: getSchemaPath(PropertySearchResponse) } })
  @ApiResponse({ status: 400, description: 'Invalid search parameters' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiQuery({ name: 'postcode', required: false, description: 'Property postcode' })
  @ApiQuery({ name: 'address', required: false, description: 'Property address' })
  @ApiQuery({ name: 'uprn', required: false, description: 'Unique Property Reference Number' })
  @ApiQuery({ name: 'titleNumber', required: false, description: 'Land Registry title number' })
  @ApiQuery({ name: 'propertyTypes', required: false, description: 'Property types (D,S,T,F,O)', type: [String] })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of results to return (max 100)', type: Number })
  @ApiQuery({ name: 'offset', required: false, description: 'Number of results to skip', type: Number })
  @UsePipes(new ValidationPipe({ transform: true }))
  async searchProperties(
    @Query() searchParams: PropertySearchDto,
    @Request() req?: any
  ): Promise<LandRegistryApiResponse<PropertySearchResponse>> {
    try {
      this.logger.log(`Property search request: ${JSON.stringify(searchParams)}`);
      
      // Validate that at least one search parameter is provided
      if (!searchParams.postcode && !searchParams.address && !searchParams.uprn && !searchParams.titleNumber) {
        throw new BadRequestException('At least one search parameter must be provided');
      }

      const searchRequest: PropertySearchRequest = {
        postcode: searchParams.postcode,
        address: searchParams.address,
        uprn: searchParams.uprn,
        titleNumber: searchParams.titleNumber,
        propertyTypes: searchParams.propertyTypes,
        limit: searchParams.limit || 50,
        offset: searchParams.offset || 0
      };

      const userId = req?.user?.id;
      return await this.landRegistryService.searchProperties(searchRequest, userId);
    } catch (error) {
      this.logger.error('Property search failed:', error);
      throw error;
    }
  }

  @Get('ownership/lookup')
  @ApiOperation({ 
    summary: 'Lookup property ownership',
    description: 'Get current and historical ownership information for a property'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Ownership information retrieved successfully', schema: { $ref: getSchemaPath(OwnershipLookupResponse) } })
  @ApiResponse({ status: 404, description: 'Property not found' })
  @ApiResponse({ status: 400, description: 'Invalid lookup parameters' })
  @ApiQuery({ name: 'titleNumber', required: false, description: 'Land Registry title number' })
  @ApiQuery({ name: 'uprn', required: false, description: 'Unique Property Reference Number' })
  @ApiQuery({ name: 'postcode', required: false, description: 'Property postcode' })
  @ApiQuery({ name: 'address', required: false, description: 'Property address' })
  @ApiQuery({ name: 'includeHistory', required: false, description: 'Include ownership history', type: Boolean })
  @UsePipes(new ValidationPipe({ transform: true }))
  async lookupOwnership(
    @Query() lookupParams: OwnershipLookupDto,
    @Request() req?: any
  ): Promise<LandRegistryApiResponse<OwnershipLookupResponse>> {
    try {
      this.logger.log(`Ownership lookup request: ${JSON.stringify(lookupParams)}`);
      
      // Validate that at least one identifier is provided
      if (!lookupParams.titleNumber && !lookupParams.uprn && 
          !(lookupParams.postcode && lookupParams.address)) {
        throw new BadRequestException(
          'Either titleNumber, uprn, or both postcode and address must be provided'
        );
      }

      const lookupRequest: OwnershipLookupRequest = {
        titleNumber: lookupParams.titleNumber,
        uprn: lookupParams.uprn,
        postcode: lookupParams.postcode,
        address: lookupParams.address,
        includeHistory: lookupParams.includeHistory || false
      };

      const userId = req?.user?.id;
      return await this.landRegistryService.lookupOwnership(lookupRequest, userId);
    } catch (error) {
      this.logger.error('Ownership lookup failed:', error);
      throw error;
    }
  }

  @Get('price-paid/search')
  @ApiOperation({ 
    summary: 'Search price paid data',
    description: 'Search for property transaction data with price and date filters'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Price paid data retrieved successfully', schema: { $ref: getSchemaPath(PricePaidSearchResponse) } })
  @ApiResponse({ status: 400, description: 'Invalid search parameters' })
  @ApiQuery({ name: 'postcode', required: false, description: 'Property postcode' })
  @ApiQuery({ name: 'address', required: false, description: 'Property address' })
  @ApiQuery({ name: 'uprn', required: false, description: 'Unique Property Reference Number' })
  @ApiQuery({ name: 'minPrice', required: false, description: 'Minimum price', type: Number })
  @ApiQuery({ name: 'maxPrice', required: false, description: 'Maximum price', type: Number })
  @ApiQuery({ name: 'dateFrom', required: false, description: 'Start date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'dateTo', required: false, description: 'End date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'propertyTypes', required: false, description: 'Property types (D,S,T,F,O)', type: [String] })
  @ApiQuery({ name: 'newBuildOnly', required: false, description: 'New build properties only', type: Boolean })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of results to return (max 100)', type: Number })
  @ApiQuery({ name: 'offset', required: false, description: 'Number of results to skip', type: Number })
  @UsePipes(new ValidationPipe({ transform: true }))
  async searchPricePaidData(
    @Query() searchParams: PricePaidSearchDto,
    @Request() req?: any
  ): Promise<LandRegistryApiResponse<PricePaidSearchResponse>> {
    try {
      this.logger.log(`Price paid search request: ${JSON.stringify(searchParams)}`);
      
      // Validate date range
      if (searchParams.dateFrom && searchParams.dateTo) {
        const fromDate = new Date(searchParams.dateFrom);
        const toDate = new Date(searchParams.dateTo);
        if (fromDate > toDate) {
          throw new BadRequestException('dateFrom must be before dateTo');
        }
      }

      // Validate price range
      if (searchParams.minPrice && searchParams.maxPrice) {
        if (searchParams.minPrice > searchParams.maxPrice) {
          throw new BadRequestException('minPrice must be less than maxPrice');
        }
      }

      const searchRequest: PricePaidSearchRequest = {
        postcode: searchParams.postcode,
        address: searchParams.address,
        uprn: searchParams.uprn,
        minPrice: searchParams.minPrice,
        maxPrice: searchParams.maxPrice,
        dateFrom: searchParams.dateFrom ? new Date(searchParams.dateFrom) : undefined,
        dateTo: searchParams.dateTo ? new Date(searchParams.dateTo) : undefined,
        propertyTypes: searchParams.propertyTypes,
        newBuildOnly: searchParams.newBuildOnly,
        limit: searchParams.limit || 50,
        offset: searchParams.offset || 0
      };

      const userId = req?.user?.id;
      return await this.landRegistryService.searchPricePaidData(searchRequest, userId);
    } catch (error) {
      this.logger.error('Price paid search failed:', error);
      throw error;
    }
  }

  @Post('bulk-export')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Create bulk export',
    description: 'Create a bulk export job for property data'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Bulk export created successfully', schema: { $ref: getSchemaPath(BulkExportResponse) } })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 400, description: 'Invalid export parameters' })
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true }))
  async createBulkExport(
    @Body() exportRequest: BulkExportDto,
    @Request() req: any
  ): Promise<LandRegistryApiResponse<BulkExportResponse>> {
    try {
      this.logger.log(`Bulk export request: ${JSON.stringify(exportRequest)}`);
      
      const bulkExportRequest: BulkExportRequest = {
        searchCriteria: exportRequest.searchCriteria,
        exportFormat: exportRequest.format,
        includeFields: exportRequest.includeFields
      };

      const userId = req.user.id;
      return await this.landRegistryService.createBulkExport(bulkExportRequest, userId);
    } catch (error) {
      this.logger.error('Bulk export creation failed:', error);
      throw error;
    }
  }

  @Get('bulk-export/:exportId/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Get bulk export status',
    description: 'Get the status of a bulk export job'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Export status retrieved successfully', schema: { $ref: getSchemaPath(BulkExport) } })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Export not found' })
  async getBulkExportStatus(
    @Param('exportId') exportId: string,
    @Request() req: any
  ): Promise<LandRegistryApiResponse<BulkExport>> {
    try {
      this.logger.log(`Get bulk export status: ${exportId}`);
      
      const userId = req.user.id;
      return await this.landRegistryService.getBulkExportStatus(exportId, userId);
    } catch (error) {
      this.logger.error('Get bulk export status failed:', error);
      throw error;
    }
  }

  @Get('statistics')
  @ApiOperation({ 
    summary: 'Get property statistics',
    description: 'Get statistical analysis of property data for a given area or criteria'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Statistics retrieved successfully', schema: { $ref: getSchemaPath(PropertyStatistics) } })
  @ApiResponse({ status: 400, description: 'Invalid parameters' })
  @ApiQuery({ name: 'postcode', required: false, description: 'Property postcode' })
  @ApiQuery({ name: 'address', required: false, description: 'Property address' })
  @ApiQuery({ name: 'propertyTypes', required: false, description: 'Property types (D,S,T,F,O)', type: [String] })
  @UsePipes(new ValidationPipe({ transform: true }))
  async getPropertyStatistics(
    @Query() filters: PropertySearchDto
  ): Promise<LandRegistryApiResponse<PropertyStatistics>> {
    try {
      this.logger.log(`Property statistics request: ${JSON.stringify(filters)}`);
      
      const searchRequest: PropertySearchRequest = {
        postcode: filters.postcode,
        address: filters.address,
        propertyTypes: filters.propertyTypes
      };

      return await this.landRegistryService.getPropertyStatistics(searchRequest);
    } catch (error) {
      this.logger.error('Get property statistics failed:', error);
      throw error;
    }
  }

  @Post('sync')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Sync property data',
    description: 'Trigger synchronization of property data from external Land Registry APIs'
  })
  @ApiResponse({ status: 200, description: 'Sync completed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Sync failed' })
  @ApiQuery({ name: 'uprn', required: false, description: 'Sync specific property by UPRN' })
  @HttpCode(HttpStatus.OK)
  async syncPropertyData(
    @Query('uprn') uprn?: string,
    @Request() req?: any
  ): Promise<{ success: boolean; message: string }> {
    try {
      this.logger.log(`Property data sync request${uprn ? ` for UPRN: ${uprn}` : ''}`);
      
      await this.landRegistryService.syncPropertyData(uprn);
      
      return {
        success: true,
        message: uprn 
          ? `Property data sync completed for UPRN: ${uprn}`
          : 'Property data sync completed successfully'
      };
    } catch (error) {
      this.logger.error('Property data sync failed:', error);
      throw error;
    }
  }

  @Post('cache/clear')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Clear cache',
    description: 'Clear cached Land Registry data'
  })
  @ApiResponse({ status: 200, description: 'Cache cleared successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiQuery({ name: 'pattern', required: false, description: 'Cache key pattern to clear' })
  @HttpCode(HttpStatus.OK)
  async clearCache(
    @Query('pattern') pattern?: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      this.logger.log(`Clear cache request${pattern ? ` with pattern: ${pattern}` : ''}`);
      
      this.landRegistryService.clearCache(pattern);
      
      return {
        success: true,
        message: pattern 
          ? `Cache cleared for pattern: ${pattern}`
          : 'All cache cleared successfully'
      };
    } catch (error) {
      this.logger.error('Clear cache failed:', error);
      throw error;
    }
  }

  @Get('health')
  @ApiOperation({ 
    summary: 'Health check',
    description: 'Check the health status of Land Registry service'
  })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  @ApiResponse({ status: 503, description: 'Service is unhealthy' })
  async healthCheck(): Promise<{ status: string; details: any }> {
    try {
      const health = await this.landRegistryService.healthCheck();
      
      if (health.status === 'healthy') {
        return health;
      } else {
        throw new HttpException(health, HttpStatus.SERVICE_UNAVAILABLE);
      }
    } catch (error) {
      this.logger.error('Health check failed:', error);
      throw new HttpException(
        {
          status: 'unhealthy',
          details: { error: error.message }
        },
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }
  }

  // Property valuation endpoint (integration with existing valuation system)
  @Get('properties/:uprn/valuation')
  @ApiOperation({ 
    summary: 'Get property valuation',
    description: 'Get comprehensive property valuation including Land Registry data'
  })
  @ApiResponse({ status: 200, description: 'Valuation retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Property not found' })
  async getPropertyValuation(
    @Param('uprn') uprn: string,
    @Request() req?: any
  ): Promise<any> {
    try {
      this.logger.log(`Property valuation request for UPRN: ${uprn}`);
      
      // Get property ownership data
      const ownershipData = await this.landRegistryService.lookupOwnership(
        { uprn },
        req?.user?.id
      );
      
      // Get price paid history
      const priceHistory = await this.landRegistryService.searchPricePaidData(
        { uprn, limit: 10 },
        req?.user?.id
      );
      
      // Get area statistics for comparison
      const areaStats = await this.landRegistryService.getPropertyStatistics({
        postcode: ownershipData.data.property.postcode
      });
      
      return {
        success: true,
        data: {
          property: ownershipData.data.property,
          ownership: ownershipData.data.currentOwnership,
          priceHistory: priceHistory.data.transactions,
          areaStatistics: areaStats.data,
          valuation: {
            estimatedValue: priceHistory.data.statistics?.averagePrice || 0,
            confidence: 'medium',
            lastUpdated: new Date().toISOString()
          }
        },
        metadata: {
          requestId: `val_${Date.now()}`,
          timestamp: new Date()
        }
      };
    } catch (error) {
      this.logger.error('Property valuation failed:', error);
      throw error;
    }
  }

  @Post('import/csv')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ 
    summary: 'Import Land Registry data from CSV',
    description: 'Upload and import Land Registry property data from CSV file'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'CSV import started successfully', schema: { $ref: getSchemaPath(CsvImportResponseDto) } })
  @ApiResponse({ status: 400, description: 'Invalid file or parameters' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async importCsv(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 50 * 1024 * 1024 }), // 50MB
          new FileTypeValidator({ fileType: 'text/csv' })
        ]
      })
    ) file: Express.Multer.File,
    @Body() importOptions: CsvImportDto,
    @Request() req: any
  ): Promise<CsvImportResponseDto> {
    try {
      this.logger.log(`CSV import request from user: ${req.user.id}, file: ${file.originalname}`);
      
      const userId = req.user.id;
      return await this.landRegistryService.importCsv(file, importOptions, userId);
    } catch (error) {
      this.logger.error('CSV import failed:', error);
      throw error;
    }
  }

  @Get('import/:importId/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Get CSV import status',
    description: 'Check the status and progress of a CSV import job'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Import status retrieved successfully', schema: { $ref: getSchemaPath(CsvImportStatusDto) } })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Import job not found' })
  async getImportStatus(
    @Param('importId') importId: string,
    @Request() req: any
  ): Promise<CsvImportStatusDto> {
    try {
      this.logger.log(`Get import status: ${importId}`);
      
      const userId = req.user.id;
      return await this.landRegistryService.getImportStatus(importId, userId);
    } catch (error) {
      this.logger.error('Get import status failed:', error);
      throw error;
    }
  }

  @Get('import/history')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Get import history',
    description: 'Get list of previous CSV import jobs'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Import history retrieved successfully'
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of records to return', type: Number })
  @ApiQuery({ name: 'offset', required: false, description: 'Number of records to skip', type: Number })
  async getImportHistory(
    @Query('limit') limit: number = 20,
    @Query('offset') offset: number = 0,
    @Request() req: any
  ): Promise<{ imports: CsvImportResponseDto[]; total: number }> {
    try {
      this.logger.log(`Get import history for user: ${req.user.id}`);
      
      const userId = req.user.id;
      return await this.landRegistryService.getImportHistory(userId, limit, offset);
    } catch (error) {
      this.logger.error('Get import history failed:', error);
      throw error;
    }
  }

  @Delete('import/:importId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Cancel CSV import',
    description: 'Cancel a running CSV import job'
  })
  @ApiResponse({ status: 200, description: 'Import cancelled successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Import job not found' })
  async cancelImport(
    @Param('importId') importId: string,
    @Request() req: any
  ): Promise<{ success: boolean; message: string }> {
    try {
      this.logger.log(`Cancel import: ${importId}`);
      
      const userId = req.user.id;
      await this.landRegistryService.cancelImport(importId, userId);
      
      return {
        success: true,
        message: `Import ${importId} cancelled successfully`
      };
    } catch (error) {
      this.logger.error('Cancel import failed:', error);
      throw error;
    }
  }
}
