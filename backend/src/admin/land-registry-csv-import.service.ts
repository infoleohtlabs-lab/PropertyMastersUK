import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, QueryRunner } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as csv from 'csv-parser';
import { Readable } from 'stream';
import { Property } from '../properties/entities/property.entity';
import { AdminActivityLog } from './entities/admin-activity-log.entity';
import { PropertyType, PropertyStatus } from '../properties/entities/property.entity';

// DTOs for Land Registry CSV Import
export interface LandRegistryRecord {
  transactionId: string;
  price: number;
  dateOfTransfer: Date;
  postcode: string;
  propertyType: string;
  oldNew: string;
  duration: string;
  paon: string; // Primary Addressable Object Name
  saon: string; // Secondary Addressable Object Name
  street: string;
  locality: string;
  town: string;
  district: string;
  county: string;
  ppd: string; // PPD Category Type
  recordStatus: string;
}

export interface CsvImportResult {
  success: boolean;
  totalRecords: number;
  processedRecords: number;
  successfulImports: number;
  failedImports: number;
  duplicates: number;
  errors: string[];
  warnings: string[];
  importId: string;
  startTime: Date;
  endTime: Date;
  duration: number;
}

export interface CsvValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  recordCount: number;
  sampleRecords: LandRegistryRecord[];
}

export interface ImportProgress {
  importId: string;
  status: 'validating' | 'processing' | 'completed' | 'failed';
  progress: number;
  currentRecord: number;
  totalRecords: number;
  message: string;
  startTime: Date;
  errors: string[];
}

@Injectable()
export class LandRegistryCsvImportService {
  private readonly logger = new Logger(LandRegistryCsvImportService.name);
  private importProgress = new Map<string, ImportProgress>();

  constructor(
    @InjectRepository(Property)
    private readonly propertyRepository: Repository<Property>,
    @InjectRepository(AdminActivityLog)
    private readonly activityLogRepository: Repository<AdminActivityLog>,
    private readonly dataSource: DataSource,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // Validate CSV file format and content
  async validateCsvFile(fileBuffer: Buffer, adminId: string): Promise<CsvValidationResult> {
    const importId = this.generateImportId();
    
    try {
      const records: LandRegistryRecord[] = [];
      const errors: string[] = [];
      const warnings: string[] = [];
      let recordCount = 0;

      await new Promise<void>((resolve, reject) => {
        const stream = Readable.from(fileBuffer.toString());
        
        stream
          .pipe(csv({
            headers: [
              'transactionId', 'price', 'dateOfTransfer', 'postcode',
              'propertyType', 'oldNew', 'duration', 'paon', 'saon',
              'street', 'locality', 'town', 'district', 'county',
              'ppd', 'recordStatus'
            ],

          }))
          .on('data', (row) => {
            recordCount++;
            
            // Validate required fields
            const validationErrors = this.validateRecord(row, recordCount);
            if (validationErrors.length > 0) {
              errors.push(...validationErrors);
            } else {
              const parsedRecord = this.parseRecord(row);
              if (records.length < 5) { // Keep first 5 records as samples
                records.push(parsedRecord);
              }
            }
          })
          .on('end', () => {
            resolve();
          })
          .on('error', (error) => {
            reject(error);
          });
      });

      // Check for minimum record count
      if (recordCount === 0) {
        errors.push('CSV file is empty or has no valid records');
      }

      // Check for maximum record count (prevent memory issues)
      if (recordCount > 100000) {
        warnings.push(`Large file detected (${recordCount} records). Consider splitting into smaller files.`);
      }

      const result: CsvValidationResult = {
        isValid: errors.length === 0,
        errors,
        warnings,
        recordCount,
        sampleRecords: records,
      };

      // Log validation activity
      await this.logActivity(
        adminId,
        'CSV_VALIDATION',
        `Validated CSV file: ${recordCount} records, ${errors.length} errors, ${warnings.length} warnings`,
        { importId, recordCount, errors: errors.length, warnings: warnings.length },
      );

      return result;
    } catch (error) {
      this.logger.error(`CSV validation failed: ${error.message}`, error.stack);
      throw new BadRequestException(`CSV validation failed: ${error.message}`);
    }
  }

  // Import CSV file with progress tracking
  async importCsvFile(
    fileBuffer: Buffer,
    adminId: string,
    options: {
      skipDuplicates?: boolean;
      updateExisting?: boolean;
      batchSize?: number;
    } = {},
  ): Promise<{ importId: string; message: string }> {
    const importId = this.generateImportId();
    const { skipDuplicates = true, updateExisting = false, batchSize = 1000 } = options;

    // Initialize progress tracking
    const progress: ImportProgress = {
      importId,
      status: 'validating',
      progress: 0,
      currentRecord: 0,
      totalRecords: 0,
      message: 'Starting import validation...',
      startTime: new Date(),
      errors: [],
    };
    this.importProgress.set(importId, progress);

    // Start import process asynchronously
    this.processImportAsync(fileBuffer, adminId, importId, {
      skipDuplicates,
      updateExisting,
      batchSize,
    });

    return {
      importId,
      message: 'Import started. Use the import ID to track progress.',
    };
  }

  // Get import progress
  getImportProgress(importId: string): ImportProgress | null {
    return this.importProgress.get(importId) || null;
  }

  // Get all active imports
  getAllActiveImports(): ImportProgress[] {
    return Array.from(this.importProgress.values())
      .filter(progress => progress.status === 'validating' || progress.status === 'processing');
  }

  // Cancel import
  async cancelImport(importId: string, adminId: string): Promise<{ success: boolean; message: string }> {
    const progress = this.importProgress.get(importId);
    if (!progress) {
      throw new BadRequestException('Import not found');
    }

    if (progress.status === 'completed' || progress.status === 'failed') {
      throw new BadRequestException('Cannot cancel completed or failed import');
    }

    progress.status = 'failed';
    progress.message = 'Import cancelled by admin';

    await this.logActivity(
      adminId,
      'CSV_IMPORT_CANCELLED',
      `Cancelled CSV import: ${importId}`,
      { importId },
    );

    return {
      success: true,
      message: 'Import cancelled successfully',
    };
  }

  // Get import history
  async getImportHistory(adminId: string, page: number = 1, limit: number = 20) {
    const offset = (page - 1) * limit;
    
    const [activities, total] = await this.activityLogRepository.findAndCount({
      where: {
        action: 'CSV_IMPORT_COMPLETED',
      },
      order: { createdAt: 'DESC' },
      skip: offset,
      take: limit,
    });

    return {
      imports: activities.map(activity => ({
        importId: activity.metadata?.importId,
        adminId: activity.userId,
        startTime: activity.createdAt,
        details: activity.details,
        metadata: activity.metadata,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Private methods
  private async processImportAsync(
    fileBuffer: Buffer,
    adminId: string,
    importId: string,
    options: {
      skipDuplicates: boolean;
      updateExisting: boolean;
      batchSize: number;
    },
  ) {
    const progress = this.importProgress.get(importId)!;
    const queryRunner = this.dataSource.createQueryRunner();
    
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      progress.status = 'processing';
      progress.message = 'Processing CSV records...';

      const records: LandRegistryRecord[] = [];
      let recordCount = 0;

      // Parse CSV
      await new Promise<void>((resolve, reject) => {
        const stream = Readable.from(fileBuffer.toString());
        
        stream
          .pipe(csv({
            headers: [
              'transactionId', 'price', 'dateOfTransfer', 'postcode',
              'propertyType', 'oldNew', 'duration', 'paon', 'saon',
              'street', 'locality', 'town', 'district', 'county',
              'ppd', 'recordStatus'
            ],

          }))
          .on('data', (row) => {
            recordCount++;
            const validationErrors = this.validateRecord(row, recordCount);
            if (validationErrors.length === 0) {
              records.push(this.parseRecord(row));
            } else {
              progress.errors.push(...validationErrors);
            }
          })
          .on('end', () => {
            resolve();
          })
          .on('error', (error) => {
            reject(error);
          });
      });

      progress.totalRecords = records.length;
      progress.message = `Processing ${records.length} valid records...`;

      // Process records in batches
      let processedCount = 0;
      let successCount = 0;
      let duplicateCount = 0;
      let failedCount = 0;

      for (let i = 0; i < records.length; i += options.batchSize) {
        const batch = records.slice(i, i + options.batchSize);
        
        for (const record of batch) {
          try {
            const result = await this.processRecord(record, queryRunner, options);
            
            if (result.isDuplicate) {
              duplicateCount++;
            } else if (result.success) {
              successCount++;
            } else {
              failedCount++;
              progress.errors.push(result.error || 'Unknown error');
            }
            
            processedCount++;
            progress.currentRecord = processedCount;
            progress.progress = Math.round((processedCount / records.length) * 100);
            progress.message = `Processed ${processedCount}/${records.length} records`;
            
          } catch (error) {
            failedCount++;
            progress.errors.push(`Record ${processedCount + 1}: ${error.message}`);
          }
        }
      }

      await queryRunner.commitTransaction();

      // Complete import
      progress.status = 'completed';
      progress.progress = 100;
      progress.message = `Import completed: ${successCount} imported, ${duplicateCount} duplicates, ${failedCount} failed`;

      const result: CsvImportResult = {
        success: true,
        totalRecords: recordCount,
        processedRecords: processedCount,
        successfulImports: successCount,
        failedImports: failedCount,
        duplicates: duplicateCount,
        errors: progress.errors,
        warnings: [],
        importId,
        startTime: progress.startTime,
        endTime: new Date(),
        duration: Date.now() - progress.startTime.getTime(),
      };

      // Log completion
      await this.logActivity(
        adminId,
        'CSV_IMPORT_COMPLETED',
        `CSV import completed: ${successCount} imported, ${duplicateCount} duplicates, ${failedCount} failed`,
        { importId, result },
      );

      // Emit event
      this.eventEmitter.emit('land-registry.import.completed', {
        importId,
        adminId,
        result,
        timestamp: new Date(),
      });

    } catch (error) {
      await queryRunner.rollbackTransaction();
      
      progress.status = 'failed';
      progress.message = `Import failed: ${error.message}`;
      progress.errors.push(error.message);

      this.logger.error(`CSV import failed: ${error.message}`, error.stack);

      await this.logActivity(
        adminId,
        'CSV_IMPORT_FAILED',
        `CSV import failed: ${error.message}`,
        { importId, error: error.message },
      );

    } finally {
      await queryRunner.release();
      
      // Clean up progress after 1 hour
      setTimeout(() => {
        this.importProgress.delete(importId);
      }, 60 * 60 * 1000);
    }
  }

  private validateRecord(row: any, recordNumber: number): string[] {
    const errors: string[] = [];
    const prefix = `Record ${recordNumber}:`;

    // Required fields validation
    if (!row.transactionId) errors.push(`${prefix} Transaction ID is required`);
    if (!row.price || isNaN(parseFloat(row.price))) errors.push(`${prefix} Valid price is required`);
    if (!row.dateOfTransfer) errors.push(`${prefix} Date of transfer is required`);
    if (!row.postcode) errors.push(`${prefix} Postcode is required`);
    if (!row.propertyType) errors.push(`${prefix} Property type is required`);

    // Data format validation
    if (row.price && parseFloat(row.price) <= 0) {
      errors.push(`${prefix} Price must be greater than 0`);
    }

    if (row.dateOfTransfer && !this.isValidDate(row.dateOfTransfer)) {
      errors.push(`${prefix} Invalid date format`);
    }

    if (row.postcode && !this.isValidPostcode(row.postcode)) {
      errors.push(`${prefix} Invalid postcode format`);
    }

    return errors;
  }

  private parseRecord(row: any): LandRegistryRecord {
    return {
      transactionId: row.transactionId?.trim(),
      price: parseFloat(row.price),
      dateOfTransfer: new Date(row.dateOfTransfer),
      postcode: row.postcode?.trim().toUpperCase(),
      propertyType: row.propertyType?.trim(),
      oldNew: row.oldNew?.trim(),
      duration: row.duration?.trim(),
      paon: row.paon?.trim(),
      saon: row.saon?.trim(),
      street: row.street?.trim(),
      locality: row.locality?.trim(),
      town: row.town?.trim(),
      district: row.district?.trim(),
      county: row.county?.trim(),
      ppd: row.ppd?.trim(),
      recordStatus: row.recordStatus?.trim(),
    };
  }

  private async processRecord(
    record: LandRegistryRecord,
    queryRunner: QueryRunner,
    options: { skipDuplicates: boolean; updateExisting: boolean },
  ): Promise<{ success: boolean; isDuplicate: boolean; error?: string }> {
    try {
      // Check for existing property
      const existingProperty = await queryRunner.manager.findOne(Property, {
        where: {
          addressLine1: this.buildAddress(record),
          postcode: record.postcode,
        },
      });

      if (existingProperty) {
        if (options.skipDuplicates) {
          return { success: false, isDuplicate: true };
        }
        
        if (options.updateExisting) {
          // Update existing property
          await queryRunner.manager.update(Property, existingProperty.id, {
            price: record.price,
          });
          return { success: true, isDuplicate: false };
        }
      }

      // Create new property
      const property = queryRunner.manager.create(Property, {
        title: this.generatePropertyTitle(record),
        description: `Property imported from Land Registry data`,
        addressLine1: this.buildAddress(record),
        postcode: record.postcode,
        price: record.price,
        type: this.mapPropertyType(record.propertyType),
        status: PropertyStatus.AVAILABLE,
        bedrooms: 0, // Default values for required fields
        bathrooms: 0,
      });

      await queryRunner.manager.save(Property, property);
      return { success: true, isDuplicate: false };

    } catch (error) {
      return { success: false, isDuplicate: false, error: error.message };
    }
  }

  private buildAddress(record: LandRegistryRecord): string {
    const parts = [
      record.saon,
      record.paon,
      record.street,
      record.locality,
      record.town,
      record.district,
      record.county,
    ].filter(part => part && part.trim());

    return parts.join(', ');
  }

  private generatePropertyTitle(record: LandRegistryRecord): string {
    const parts = [record.paon, record.street, record.town]
      .filter(part => part && part.trim());
    return parts.join(' ') || 'Property';
  }

  private mapPropertyType(landRegistryType: string): PropertyType {
    const type = landRegistryType?.toLowerCase();
    
    if (type?.includes('detached')) return PropertyType.HOUSE;
    if (type?.includes('semi-detached')) return PropertyType.HOUSE;
    if (type?.includes('terraced')) return PropertyType.HOUSE;
    if (type?.includes('flat')) return PropertyType.APARTMENT;
    if (type?.includes('maisonette')) return PropertyType.APARTMENT;
    
    return PropertyType.HOUSE; // Default
  }

  private isValidDate(dateString: string): boolean {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  }

  private isValidPostcode(postcode: string): boolean {
    // UK postcode regex
    const postcodeRegex = /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i;
    return postcodeRegex.test(postcode.trim());
  }

  private generateImportId(): string {
    return `import_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async logActivity(
    userId: string,
    action: string,
    details: string,
    metadata?: any,
  ) {
    const activity = this.activityLogRepository.create({
      userId,
      action,
      details,
      metadata,
      category: 'land_registry_import',
    });

    await this.activityLogRepository.save(activity);
  }
}
