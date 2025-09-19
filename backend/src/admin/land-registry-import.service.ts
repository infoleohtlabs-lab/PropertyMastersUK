import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Between } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as csv from 'csv-parser';
import * as fs from 'fs';
import * as path from 'path';
import { Readable } from 'stream';
import {
  CsvUploadDto,
  ImportJobDto,
  ImportJobQueryDto,
  ValidationRuleDto,
  DataMappingDto,
  ImportConfigurationDto,
  ImportJobResponseDto,
  ValidationResultDto,
  ImportProgressDto,
  ImportStatisticsDto,
  ErrorReportDto,
  DataPreviewDto,
  ImportTemplateDto,
  ImportJobStatus,
  ValidationSeverity,
  ImportJobType,
  ValidationRuleType,
  DataTransformationType,
} from './dto/land-registry-import.dto';

// Interfaces
interface CsvRow {
  [key: string]: string;
}

interface ValidationError {
  row: number;
  column: string;
  value: string;
  message: string;
  severity: ValidationSeverity;
  rule: string;
}

interface ProcessingResult {
  success: boolean;
  processedRows: number;
  errors: ValidationError[];
  warnings: ValidationError[];
}

interface ImportJob {
  id: string;
  filename: string;
  originalName: string;
  fileSize: number;
  status: ImportJobStatus;
  type: ImportJobType;
  totalRows: number;
  processedRows: number;
  validRows: number;
  errorRows: number;
  warningRows: number;
  startTime: Date;
  endTime?: Date;
  userId: string;
  configuration: any;
  metadata: any;
  createdAt: Date;
  updatedAt: Date;
}

interface ValidationRule {
  id: string;
  name: string;
  description: string;
  field: string;
  type: string;
  parameters: any;
  severity: ValidationSeverity;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface DataMapping {
  id: string;
  name: string;
  description: string;
  sourceField: string;
  targetField: string;
  transformation: string;
  parameters: any;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface ImportConfiguration {
  id: string;
  maxFileSize: number;
  allowedFormats: string[];
  batchSize: number;
  validationRules: string[];
  dataMappings: string[];
  notifications: any;
  retryAttempts: number;
  timeoutMinutes: number;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class LandRegistryImportService {
  private readonly logger = new Logger(LandRegistryImportService.name);
  private readonly uploadPath = process.env.UPLOAD_PATH || './uploads';
  private readonly processingJobs = new Map<string, any>();

  constructor(
    private readonly eventEmitter: EventEmitter2,
  ) {
    // Ensure upload directory exists
    if (!fs.existsSync(this.uploadPath)) {
      fs.mkdirSync(this.uploadPath, { recursive: true });
    }
  }

  async uploadCsvFile(
    file: Express.Multer.File,
    uploadDto: CsvUploadDto,
  ): Promise<ImportJobResponseDto> {
    try {
      this.logger.log(`Uploading CSV file: ${file.originalname}`);

      // Generate unique filename
      const timestamp = Date.now();
      const filename = `${timestamp}_${file.originalname}`;
      const filePath = path.join(this.uploadPath, filename);

      // Save file to disk
      fs.writeFileSync(filePath, file.buffer);

      // Parse CSV to get row count and basic validation
      const { totalRows, headers } = await this.parseCsvHeaders(file.buffer);

      // Create import job record
      const importJob: ImportJob = {
        id: this.generateJobId(),
        filename,
        originalName: file.originalname,
        fileSize: file.size,
        status: ImportJobStatus.UPLOADED,
        type: uploadDto.type || ImportJobType.LAND_REGISTRY,
        totalRows,
        processedRows: 0,
        validRows: 0,
        errorRows: 0,
        warningRows: 0,
        startTime: new Date(),
        userId: uploadDto.userId || 'system',
        configuration: uploadDto.configuration || {},
        metadata: {
          headers,
          uploadDto,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Store job in memory (in real implementation, save to database)
      this.processingJobs.set(importJob.id, importJob);

      // Emit upload event
      this.eventEmitter.emit('import.uploaded', {
        jobId: importJob.id,
        filename: file.originalname,
        totalRows,
      });

      return this.mapToResponseDto(importJob);
    } catch (error) {
      this.logger.error(`Error uploading CSV file: ${error.message}`, error.stack);
      throw new BadRequestException(`Failed to upload CSV file: ${error.message}`);
    }
  }

  async validateCsvData(jobId: string): Promise<ValidationResultDto> {
    const job = this.processingJobs.get(jobId);
    if (!job) {
      throw new NotFoundException('Import job not found');
    }

    try {
      this.logger.log(`Starting validation for job: ${jobId}`);
      
      // Update job status
      job.status = ImportJobStatus.VALIDATING;
      job.updatedAt = new Date();

      const filePath = path.join(this.uploadPath, job.filename);
      const fileBuffer = fs.readFileSync(filePath);
      
      // Parse and validate CSV data
      const validationResult = await this.performValidation(fileBuffer, job.configuration);
      
      // Update job with validation results
      job.validRows = validationResult.validRows;
      job.errorRows = validationResult.errorRows;
      job.warningRows = validationResult.warningRows;
      job.status = validationResult.errors.length > 0 ? ImportJobStatus.VALIDATION_FAILED : ImportJobStatus.VALIDATED;
      job.updatedAt = new Date();

      // Emit validation event
      this.eventEmitter.emit('import.validated', {
        jobId,
        status: job.status,
        validRows: job.validRows,
        errorRows: job.errorRows,
      });

      return {
        jobId,
        status: job.status,
        totalRows: job.totalRows,
        validRows: job.validRows,
        errorRows: job.errorRows,
        warningRows: job.warningRows,
        errors: validationResult.errors,
        warnings: validationResult.warnings,
        summary: {
          validationPassed: job.status === ImportJobStatus.VALIDATED,
          criticalErrors: validationResult.errors.filter(e => e.severity === ValidationSeverity.ERROR).length,
          warnings: validationResult.warnings.length,
        },
      };
    } catch (error) {
      this.logger.error(`Error validating CSV data: ${error.message}`, error.stack);
      job.status = ImportJobStatus.VALIDATION_FAILED;
      job.updatedAt = new Date();
      throw new BadRequestException(`Validation failed: ${error.message}`);
    }
  }

  async processCsvData(jobId: string, processDto: ImportJobDto): Promise<ImportJobResponseDto> {
    const job = this.processingJobs.get(jobId);
    if (!job) {
      throw new NotFoundException('Import job not found');
    }

    if (job.status !== ImportJobStatus.VALIDATED) {
      throw new BadRequestException('Job must be validated before processing');
    }

    try {
      this.logger.log(`Starting processing for job: ${jobId}`);
      
      // Update job status
      job.status = ImportJobStatus.PROCESSING;
      job.updatedAt = new Date();

      // Start async processing
      this.processDataAsync(jobId, processDto);

      return this.mapToResponseDto(job);
    } catch (error) {
      this.logger.error(`Error starting CSV processing: ${error.message}`, error.stack);
      job.status = ImportJobStatus.FAILED;
      job.updatedAt = new Date();
      throw new BadRequestException(`Processing failed: ${error.message}`);
    }
  }

  async getImportJobs(query: ImportJobQueryDto): Promise<{
    data: ImportJobResponseDto[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const offset = (page - 1) * limit;

    // Filter jobs based on query parameters
    let jobs = Array.from(this.processingJobs.values());
    
    if (query.status) {
      jobs = jobs.filter(job => job.status === query.status);
    }
    
    if (query.type) {
      jobs = jobs.filter(job => job.type === query.type);
    }
    
    if (query.userId) {
      jobs = jobs.filter(job => job.userId === query.userId);
    }
    
    if (query.startDate) {
      const startDate = new Date(query.startDate);
      jobs = jobs.filter(job => job.createdAt >= startDate);
    }
    
    if (query.endDate) {
      const endDate = new Date(query.endDate);
      jobs = jobs.filter(job => job.createdAt <= endDate);
    }

    // Sort jobs
    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder || 'desc';
    jobs.sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    // Paginate
    const total = jobs.length;
    const paginatedJobs = jobs.slice(offset, offset + limit);

    return {
      data: paginatedJobs.map(job => this.mapToResponseDto(job)),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getImportJob(jobId: string): Promise<ImportJobResponseDto> {
    const job = this.processingJobs.get(jobId);
    if (!job) {
      throw new NotFoundException('Import job not found');
    }
    return this.mapToResponseDto(job);
  }

  async getImportProgress(jobId: string): Promise<ImportProgressDto> {
    const job = this.processingJobs.get(jobId);
    if (!job) {
      throw new NotFoundException('Import job not found');
    }

    const progressPercentage = job.totalRows > 0 ? (job.processedRows / job.totalRows) * 100 : 0;
    const estimatedTimeRemaining = this.calculateEstimatedTime(job);

    return {
      jobId,
      status: job.status,
      totalRows: job.totalRows,
      processedRows: job.processedRows,
      progressPercentage: Math.round(progressPercentage * 100) / 100,
      estimatedTimeRemaining,
      currentPhase: this.getCurrentPhase(job.status),
      startTime: job.startTime,
      lastUpdate: job.updatedAt,
    };
  }

  async getImportErrors(jobId: string, page?: number, limit?: number): Promise<ErrorReportDto> {
    const job = this.processingJobs.get(jobId);
    if (!job) {
      throw new NotFoundException('Import job not found');
    }

    // In real implementation, fetch from database
    const mockErrors = this.generateMockErrors(job);
    
    const pageNum = page || 1;
    const limitNum = limit || 50;
    const offset = (pageNum - 1) * limitNum;
    
    const paginatedErrors = mockErrors.slice(offset, offset + limitNum);

    return {
      jobId,
      totalErrors: mockErrors.length,
      errors: paginatedErrors,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: mockErrors.length,
        pages: Math.ceil(mockErrors.length / limitNum),
      },
      summary: {
        criticalErrors: mockErrors.filter(e => e.severity === ValidationSeverity.ERROR).length,
        warnings: mockErrors.filter(e => e.severity === ValidationSeverity.WARNING).length,
        mostCommonErrors: this.getMostCommonErrors(mockErrors),
      },
    };
  }

  async previewCsvData(jobId: string, rows?: number): Promise<DataPreviewDto> {
    const job = this.processingJobs.get(jobId);
    if (!job) {
      throw new NotFoundException('Import job not found');
    }

    const filePath = path.join(this.uploadPath, job.filename);
    const fileBuffer = fs.readFileSync(filePath);
    
    const previewRows = rows || 10;
    const { headers, data } = await this.parseCsvPreview(fileBuffer, previewRows);

    return {
      jobId,
      headers,
      data,
      totalRows: job.totalRows,
      previewRows: data.length,
      dataTypes: this.inferDataTypes(data),
    };
  }

  async cancelImportJob(jobId: string): Promise<ImportJobResponseDto> {
    const job = this.processingJobs.get(jobId);
    if (!job) {
      throw new NotFoundException('Import job not found');
    }

    if ([ImportJobStatus.COMPLETED, ImportJobStatus.FAILED, ImportJobStatus.CANCELLED].includes(job.status)) {
      throw new BadRequestException('Cannot cancel completed, failed, or already cancelled job');
    }

    job.status = ImportJobStatus.CANCELLED;
    job.endTime = new Date();
    job.updatedAt = new Date();

    // Emit cancellation event
    this.eventEmitter.emit('import.cancelled', { jobId });

    return this.mapToResponseDto(job);
  }

  async retryImportJob(jobId: string): Promise<ImportJobResponseDto> {
    const job = this.processingJobs.get(jobId);
    if (!job) {
      throw new NotFoundException('Import job not found');
    }

    if (job.status !== ImportJobStatus.FAILED) {
      throw new BadRequestException('Can only retry failed jobs');
    }

    // Reset job status and counters
    job.status = ImportJobStatus.UPLOADED;
    job.processedRows = 0;
    job.validRows = 0;
    job.errorRows = 0;
    job.warningRows = 0;
    job.endTime = undefined;
    job.updatedAt = new Date();

    return this.mapToResponseDto(job);
  }

  async deleteImportJob(jobId: string): Promise<void> {
    const job = this.processingJobs.get(jobId);
    if (!job) {
      throw new NotFoundException('Import job not found');
    }

    if ([ImportJobStatus.PROCESSING, ImportJobStatus.VALIDATING].includes(job.status)) {
      throw new BadRequestException('Cannot delete running job');
    }

    // Delete file
    const filePath = path.join(this.uploadPath, job.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Remove from memory
    this.processingJobs.delete(jobId);

    // Emit deletion event
    this.eventEmitter.emit('import.deleted', { jobId });
  }

  async getImportStatistics(startDate?: string, endDate?: string): Promise<ImportStatisticsDto> {
    const jobs = Array.from(this.processingJobs.values());
    
    let filteredJobs = jobs;
    if (startDate) {
      const start = new Date(startDate);
      filteredJobs = filteredJobs.filter(job => job.createdAt >= start);
    }
    if (endDate) {
      const end = new Date(endDate);
      filteredJobs = filteredJobs.filter(job => job.createdAt <= end);
    }

    const totalJobs = filteredJobs.length;
    const completedJobs = filteredJobs.filter(job => job.status === ImportJobStatus.COMPLETED).length;
    const failedJobs = filteredJobs.filter(job => job.status === ImportJobStatus.FAILED).length;
    const totalRows = filteredJobs.reduce((sum, job) => sum + job.totalRows, 0);
    const processedRows = filteredJobs.reduce((sum, job) => sum + job.processedRows, 0);

    return {
      totalJobs,
      completedJobs,
      failedJobs,
      pendingJobs: totalJobs - completedJobs - failedJobs,
      totalRows,
      processedRows,
      successRate: totalJobs > 0 ? (completedJobs / totalJobs) * 100 : 0,
      averageProcessingTime: this.calculateAverageProcessingTime(filteredJobs),
      statusBreakdown: this.getStatusBreakdown(filteredJobs),
      dailyStats: this.getDailyStats(filteredJobs),
    };
  }

  async getValidationRules(): Promise<ValidationRuleDto[]> {
    // Mock validation rules - in real implementation, fetch from database
    return [
      {
        id: '1',
        name: 'Required Field',
        description: 'Field must not be empty',
        field: '*',
        type: ValidationRuleType.REQUIRED,
        parameters: {},
        severity: ValidationSeverity.ERROR,
        enabled: true,
      },
      {
        id: '2',
        name: 'Postcode Format',
        description: 'UK postcode format validation',
        field: 'postcode',
        type: ValidationRuleType.REGEX,
        parameters: { pattern: '^[A-Z]{1,2}[0-9R][0-9A-Z]? [0-9][A-Z]{2}$' },
        severity: ValidationSeverity.ERROR,
        enabled: true,
      },
      {
        id: '3',
        name: 'Price Range',
        description: 'Property price must be within reasonable range',
        field: 'price',
        type: ValidationRuleType.RANGE,
        parameters: { min: 1000, max: 50000000 },
        severity: ValidationSeverity.WARNING,
        enabled: true,
      },
    ];
  }

  async createValidationRule(ruleDto: ValidationRuleDto): Promise<ValidationRuleDto> {
    // In real implementation, save to database
    const rule = {
      ...ruleDto,
      id: this.generateRuleId(),
    };
    return rule;
  }

  async updateValidationRule(ruleId: string, ruleDto: ValidationRuleDto): Promise<ValidationRuleDto> {
    // In real implementation, update in database
    return { ...ruleDto, id: ruleId };
  }

  async deleteValidationRule(ruleId: string): Promise<void> {
    // In real implementation, delete from database
    this.logger.log(`Validation rule ${ruleId} deleted`);
  }

  async getDataMappings(): Promise<DataMappingDto[]> {
    // Mock data mappings - in real implementation, fetch from database
    return [
      {
        id: '1',
        name: 'Standard Land Registry Mapping',
        description: 'Default mapping for Land Registry CSV format',
        sourceField: 'Price',
        targetField: 'price',
        transformation: DataTransformationType.CURRENCY,
        parameters: { currency: 'GBP' },
        enabled: true,
      },
      {
        id: '2',
        name: 'Address Mapping',
        description: 'Combine address fields',
        sourceField: 'Address',
        targetField: 'full_address',
        transformation: DataTransformationType.CONCATENATE,
        parameters: { separator: ', ' },
        enabled: true,
      },
    ];
  }

  async createDataMapping(mappingDto: DataMappingDto): Promise<DataMappingDto> {
    // In real implementation, save to database
    return { ...mappingDto, id: this.generateMappingId() };
  }

  async updateDataMapping(mappingId: string, mappingDto: DataMappingDto): Promise<DataMappingDto> {
    // In real implementation, update in database
    return { ...mappingDto, id: mappingId };
  }

  async deleteDataMapping(mappingId: string): Promise<void> {
    // In real implementation, delete from database
    this.logger.log(`Data mapping ${mappingId} deleted`);
  }

  async getImportConfiguration(): Promise<ImportConfigurationDto> {
    // Mock configuration - in real implementation, fetch from database
    return {
      maxFileSize: 50 * 1024 * 1024, // 50MB
      allowedFormats: ['csv'],
      batchSize: 1000,
      validationRules: ['1', '2', '3'],
      dataMappings: ['1', '2'],
      notifications: {
        email: true,
        slack: false,
        webhook: false,
      },
      retryAttempts: 3,
      timeoutMinutes: 60,
    };
  }

  async updateImportConfiguration(configDto: ImportConfigurationDto): Promise<ImportConfigurationDto> {
    // In real implementation, update in database
    return configDto;
  }

  async generateImportTemplate(): Promise<ImportTemplateDto> {
    const headers = [
      'Transaction ID',
      'Price',
      'Date of Transfer',
      'Postcode',
      'Property Type',
      'Old/New',
      'Duration',
      'PAON',
      'SAON',
      'Street',
      'Locality',
      'Town/City',
      'District',
      'County',
      'PPD Category Type',
      'Record Status',
    ];

    const sampleData = [
      [
        '{12345678-1234-1234-1234-123456789012}',
        '250000',
        '2023-01-15',
        'SW1A 1AA',
        'D',
        'N',
        'F',
        '10',
        '',
        'DOWNING STREET',
        '',
        'LONDON',
        'CITY OF WESTMINSTER',
        'GREATER LONDON',
        'A',
        'A',
      ],
    ];

    return {
      filename: 'land_registry_template.csv',
      headers,
      sampleData,
      description: 'Template for Land Registry CSV import',
      instructions: [
        'Fill in all required fields',
        'Use the exact column headers provided',
        'Ensure dates are in YYYY-MM-DD format',
        'Property Type: D=Detached, S=Semi-Detached, T=Terraced, F=Flats/Maisonettes, O=Other',
        'Old/New: Y=New Build, N=Established Property',
        'Duration: F=Freehold, L=Leasehold',
      ],
    };
  }

  async exportProcessedData(jobId: string, format: 'csv' | 'json' | 'xlsx'): Promise<any> {
    const job = this.processingJobs.get(jobId);
    if (!job) {
      throw new NotFoundException('Import job not found');
    }

    // In real implementation, export processed data from database
    return {
      jobId,
      format,
      downloadUrl: `/api/admin/land-registry-import/download/${jobId}.${format}`,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    };
  }

  async bulkDeleteImportJobs(jobIds: string[]): Promise<number> {
    let deletedCount = 0;
    
    for (const jobId of jobIds) {
      try {
        await this.deleteImportJob(jobId);
        deletedCount++;
      } catch (error) {
        this.logger.warn(`Failed to delete job ${jobId}: ${error.message}`);
      }
    }
    
    return deletedCount;
  }

  async cleanupOldJobs(olderThanDays: number): Promise<number> {
    const cutoffDate = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);
    const jobs = Array.from(this.processingJobs.values());
    
    let cleanedCount = 0;
    
    for (const job of jobs) {
      if (job.createdAt < cutoffDate && 
          [ImportJobStatus.COMPLETED, ImportJobStatus.FAILED, ImportJobStatus.CANCELLED].includes(job.status)) {
        try {
          await this.deleteImportJob(job.id);
          cleanedCount++;
        } catch (error) {
          this.logger.warn(`Failed to cleanup job ${job.id}: ${error.message}`);
        }
      }
    }
    
    return cleanedCount;
  }

  // Private helper methods
  private async parseCsvHeaders(buffer: Buffer): Promise<{ totalRows: number; headers: string[] }> {
    return new Promise((resolve, reject) => {
      const rows: any[] = [];
      let headers: string[] = [];
      
      const stream = Readable.from(buffer.toString())
        .pipe(csv())
        .on('headers', (headerList) => {
          headers = headerList;
        })
        .on('data', (row) => {
          rows.push(row);
        })
        .on('end', () => {
          resolve({ totalRows: rows.length, headers });
        })
        .on('error', reject);
    });
  }

  private async parseCsvPreview(buffer: Buffer, maxRows: number): Promise<{ headers: string[]; data: any[] }> {
    return new Promise((resolve, reject) => {
      const rows: any[] = [];
      let headers: string[] = [];
      let rowCount = 0;
      
      const stream = Readable.from(buffer.toString())
        .pipe(csv())
        .on('headers', (headerList) => {
          headers = headerList;
        })
        .on('data', (row) => {
          if (rowCount < maxRows) {
            rows.push(row);
            rowCount++;
          } else {
            stream.destroy();
          }
        })
        .on('end', () => {
          resolve({ headers, data: rows });
        })
        .on('error', reject);
    });
  }

  private async performValidation(buffer: Buffer, configuration: any): Promise<{
    validRows: number;
    errorRows: number;
    warningRows: number;
    errors: ValidationError[];
    warnings: ValidationError[];
  }> {
    // Mock validation logic - in real implementation, apply validation rules
    const totalRows = Math.floor(Math.random() * 1000) + 100;
    const errorRate = 0.05; // 5% error rate
    const warningRate = 0.1; // 10% warning rate
    
    const errorRows = Math.floor(totalRows * errorRate);
    const warningRows = Math.floor(totalRows * warningRate);
    const validRows = totalRows - errorRows;
    
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];
    
    // Generate mock errors
    for (let i = 0; i < errorRows; i++) {
      errors.push({
        row: Math.floor(Math.random() * totalRows) + 1,
        column: 'price',
        value: 'invalid_price',
        message: 'Invalid price format',
        severity: ValidationSeverity.ERROR,
        rule: 'price_format',
      });
    }
    
    // Generate mock warnings
    for (let i = 0; i < warningRows; i++) {
      warnings.push({
        row: Math.floor(Math.random() * totalRows) + 1,
        column: 'postcode',
        value: 'SW1A1AA',
        message: 'Postcode format should include space',
        severity: ValidationSeverity.WARNING,
        rule: 'postcode_format',
      });
    }
    
    return {
      validRows,
      errorRows,
      warningRows,
      errors,
      warnings,
    };
  }

  private async processDataAsync(jobId: string, processDto: ImportJobDto): Promise<void> {
    const job = this.processingJobs.get(jobId);
    if (!job) return;

    try {
      // Simulate processing with progress updates
      const batchSize = 100;
      const totalBatches = Math.ceil(job.totalRows / batchSize);
      
      for (let batch = 0; batch < totalBatches; batch++) {
        if (job.status === ImportJobStatus.CANCELLED) {
          break;
        }
        
        // Simulate batch processing
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        job.processedRows = Math.min((batch + 1) * batchSize, job.totalRows);
        job.updatedAt = new Date();
        
        // Emit progress event
        this.eventEmitter.emit('import.progress', {
          jobId,
          processedRows: job.processedRows,
          totalRows: job.totalRows,
          progressPercentage: (job.processedRows / job.totalRows) * 100,
        });
      }
      
      if (job.status !== ImportJobStatus.CANCELLED) {
        job.status = ImportJobStatus.COMPLETED;
        job.endTime = new Date();
        job.updatedAt = new Date();
        
        // Emit completion event
        this.eventEmitter.emit('import.completed', {
          jobId,
          processedRows: job.processedRows,
          duration: job.endTime.getTime() - job.startTime.getTime(),
        });
      }
    } catch (error) {
      this.logger.error(`Error processing job ${jobId}: ${error.message}`, error.stack);
      job.status = ImportJobStatus.FAILED;
      job.endTime = new Date();
      job.updatedAt = new Date();
      
      // Emit failure event
      this.eventEmitter.emit('import.failed', {
        jobId,
        error: error.message,
      });
    }
  }

  private mapToResponseDto(job: ImportJob): ImportJobResponseDto {
    return {
      id: job.id,
      filename: job.originalName,
      fileSize: job.fileSize,
      status: job.status,
      type: job.type,
      totalRows: job.totalRows,
      processedRows: job.processedRows,
      validRows: job.validRows,
      errorRows: job.errorRows,
      warningRows: job.warningRows,
      startTime: job.startTime,
      endTime: job.endTime,
      duration: job.endTime ? job.endTime.getTime() - job.startTime.getTime() : undefined,
      userId: job.userId,
      configuration: job.configuration,
      metadata: job.metadata,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
    };
  }

  private generateJobId(): string {
    return `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateRuleId(): string {
    return `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateMappingId(): string {
    return `mapping_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private calculateEstimatedTime(job: ImportJob): number {
    if (job.processedRows === 0) return 0;
    
    const elapsed = Date.now() - job.startTime.getTime();
    const rate = job.processedRows / elapsed;
    const remaining = job.totalRows - job.processedRows;
    
    return Math.round(remaining / rate);
  }

  private getCurrentPhase(status: ImportJobStatus): string {
    switch (status) {
      case ImportJobStatus.UPLOADED: return 'File uploaded';
      case ImportJobStatus.VALIDATING: return 'Validating data';
      case ImportJobStatus.VALIDATED: return 'Validation complete';
      case ImportJobStatus.PROCESSING: return 'Processing data';
      case ImportJobStatus.COMPLETED: return 'Import complete';
      case ImportJobStatus.FAILED: return 'Import failed';
      case ImportJobStatus.CANCELLED: return 'Import cancelled';
      default: return 'Unknown';
    }
  }

  private generateMockErrors(job: ImportJob): ValidationError[] {
    const errors: ValidationError[] = [];
    const errorCount = Math.min(job.errorRows, 100); // Limit for demo
    
    for (let i = 0; i < errorCount; i++) {
      errors.push({
        row: Math.floor(Math.random() * job.totalRows) + 1,
        column: ['price', 'postcode', 'date'][Math.floor(Math.random() * 3)],
        value: 'invalid_value',
        message: 'Validation error message',
        severity: Math.random() > 0.7 ? ValidationSeverity.ERROR : ValidationSeverity.WARNING,
        rule: 'validation_rule',
      });
    }
    
    return errors;
  }

  private getMostCommonErrors(errors: ValidationError[]): Array<{ message: string; count: number }> {
    const errorCounts = new Map<string, number>();
    
    errors.forEach(error => {
      const count = errorCounts.get(error.message) || 0;
      errorCounts.set(error.message, count + 1);
    });
    
    return Array.from(errorCounts.entries())
      .map(([message, count]) => ({ message, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  private inferDataTypes(data: any[]): Record<string, string> {
    if (data.length === 0) return {};
    
    const types: Record<string, string> = {};
    const firstRow = data[0];
    
    Object.keys(firstRow).forEach(key => {
      const value = firstRow[key];
      if (!isNaN(Number(value))) {
        types[key] = 'number';
      } else if (Date.parse(value)) {
        types[key] = 'date';
      } else {
        types[key] = 'string';
      }
    });
    
    return types;
  }

  private calculateAverageProcessingTime(jobs: ImportJob[]): number {
    const completedJobs = jobs.filter(job => job.endTime && job.startTime);
    if (completedJobs.length === 0) return 0;
    
    const totalTime = completedJobs.reduce((sum, job) => {
      return sum + (job.endTime!.getTime() - job.startTime.getTime());
    }, 0);
    
    return totalTime / completedJobs.length;
  }

  private getStatusBreakdown(jobs: ImportJob[]): Record<string, number> {
    const breakdown: Record<string, number> = {};
    
    jobs.forEach(job => {
      breakdown[job.status] = (breakdown[job.status] || 0) + 1;
    });
    
    return breakdown;
  }

  private getDailyStats(jobs: ImportJob[]): Array<{ date: string; count: number }> {
    const dailyStats = new Map<string, number>();
    
    jobs.forEach(job => {
      const date = job.createdAt.toISOString().split('T')[0];
      dailyStats.set(date, (dailyStats.get(date) || 0) + 1);
    });
    
    return Array.from(dailyStats.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }
}
