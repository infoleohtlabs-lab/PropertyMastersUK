import { IsString, IsOptional, IsNumber, IsEnum, IsBoolean, IsArray, IsObject, IsDateString, Min, Max, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

// Enums
export enum ImportJobStatus {
  UPLOADED = 'uploaded',
  VALIDATING = 'validating',
  VALIDATED = 'validated',
  VALIDATION_FAILED = 'validation_failed',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum ImportJobType {
  LAND_REGISTRY = 'land_registry',
  PROPERTY_DATA = 'property_data',
  MARKET_DATA = 'market_data',
  CUSTOM = 'custom',
}

export enum ValidationSeverity {
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
}

export enum ValidationRuleType {
  REQUIRED = 'required',
  REGEX = 'regex',
  RANGE = 'range',
  LENGTH = 'length',
  FORMAT = 'format',
  CUSTOM = 'custom',
}

export enum DataTransformationType {
  NONE = 'none',
  UPPERCASE = 'uppercase',
  LOWERCASE = 'lowercase',
  TRIM = 'trim',
  CURRENCY = 'currency',
  DATE = 'date',
  CONCATENATE = 'concatenate',
  SPLIT = 'split',
  CUSTOM = 'custom',
}

// DTOs
export class CsvUploadDto {
  @ApiPropertyOptional({ description: 'Import job type', enum: ImportJobType })
  @IsOptional()
  @IsEnum(ImportJobType)
  type?: ImportJobType;

  @ApiPropertyOptional({ description: 'User ID initiating the import' })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({ description: 'Import configuration' })
  @IsOptional()
  @IsObject()
  configuration?: any;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  @IsObject()
  metadata?: any;
}

export class ImportJobDto {
  @ApiProperty({ description: 'Import job ID' })
  @IsString()
  jobId: string;

  @ApiPropertyOptional({ description: 'Processing configuration' })
  @IsOptional()
  @IsObject()
  configuration?: any;

  @ApiPropertyOptional({ description: 'Skip validation errors and process valid rows only' })
  @IsOptional()
  @IsBoolean()
  skipErrors?: boolean;

  @ApiPropertyOptional({ description: 'Batch size for processing' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10000)
  batchSize?: number;

  @ApiPropertyOptional({ description: 'Enable notifications' })
  @IsOptional()
  @IsBoolean()
  enableNotifications?: boolean;
}

export class ImportJobQueryDto {
  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Transform(({ value }) => parseInt(value))
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page', default: 10 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Transform(({ value }) => parseInt(value))
  limit?: number;

  @ApiPropertyOptional({ description: 'Filter by status', enum: ImportJobStatus })
  @IsOptional()
  @IsEnum(ImportJobStatus)
  status?: ImportJobStatus;

  @ApiPropertyOptional({ description: 'Filter by type', enum: ImportJobType })
  @IsOptional()
  @IsEnum(ImportJobType)
  type?: ImportJobType;

  @ApiPropertyOptional({ description: 'Filter by user ID' })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({ description: 'Start date filter (ISO string)' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date filter (ISO string)' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Sort by field', default: 'createdAt' })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({ description: 'Sort order', enum: ['asc', 'desc'], default: 'desc' })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
}

export class ValidationRuleDto {
  @ApiPropertyOptional({ description: 'Rule ID' })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({ description: 'Rule name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Rule description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Target field name' })
  @IsString()
  field: string;

  @ApiProperty({ description: 'Validation rule type', enum: ValidationRuleType })
  @IsEnum(ValidationRuleType)
  type: ValidationRuleType;

  @ApiPropertyOptional({ description: 'Rule parameters' })
  @IsOptional()
  @IsObject()
  parameters?: any;

  @ApiProperty({ description: 'Validation severity', enum: ValidationSeverity })
  @IsEnum(ValidationSeverity)
  severity: ValidationSeverity;

  @ApiPropertyOptional({ description: 'Whether rule is enabled', default: true })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}

export class DataMappingDto {
  @ApiPropertyOptional({ description: 'Mapping ID' })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({ description: 'Mapping name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Mapping description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Source field name' })
  @IsString()
  sourceField: string;

  @ApiProperty({ description: 'Target field name' })
  @IsString()
  targetField: string;

  @ApiProperty({ description: 'Data transformation type', enum: DataTransformationType })
  @IsEnum(DataTransformationType)
  transformation: DataTransformationType;

  @ApiPropertyOptional({ description: 'Transformation parameters' })
  @IsOptional()
  @IsObject()
  parameters?: any;

  @ApiPropertyOptional({ description: 'Whether mapping is enabled', default: true })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}

export class ImportConfigurationDto {
  @ApiProperty({ description: 'Maximum file size in bytes' })
  @IsNumber()
  @Min(1)
  maxFileSize: number;

  @ApiProperty({ description: 'Allowed file formats' })
  @IsArray()
  @IsString({ each: true })
  allowedFormats: string[];

  @ApiProperty({ description: 'Processing batch size' })
  @IsNumber()
  @Min(1)
  @Max(10000)
  batchSize: number;

  @ApiProperty({ description: 'Validation rule IDs to apply' })
  @IsArray()
  @IsString({ each: true })
  validationRules: string[];

  @ApiProperty({ description: 'Data mapping IDs to apply' })
  @IsArray()
  @IsString({ each: true })
  dataMappings: string[];

  @ApiPropertyOptional({ description: 'Notification settings' })
  @IsOptional()
  @IsObject()
  notifications?: {
    email?: boolean;
    slack?: boolean;
    webhook?: boolean;
  };

  @ApiProperty({ description: 'Number of retry attempts for failed jobs' })
  @IsNumber()
  @Min(0)
  @Max(10)
  retryAttempts: number;

  @ApiProperty({ description: 'Job timeout in minutes' })
  @IsNumber()
  @Min(1)
  @Max(1440)
  timeoutMinutes: number;
}

// Response DTOs
export class ImportJobResponseDto {
  @ApiProperty({ description: 'Import job ID' })
  id: string;

  @ApiProperty({ description: 'Original filename' })
  filename: string;

  @ApiProperty({ description: 'File size in bytes' })
  fileSize: number;

  @ApiProperty({ description: 'Job status', enum: ImportJobStatus })
  status: ImportJobStatus;

  @ApiProperty({ description: 'Job type', enum: ImportJobType })
  type: ImportJobType;

  @ApiProperty({ description: 'Total number of rows in file' })
  totalRows: number;

  @ApiProperty({ description: 'Number of processed rows' })
  processedRows: number;

  @ApiProperty({ description: 'Number of valid rows' })
  validRows: number;

  @ApiProperty({ description: 'Number of rows with errors' })
  errorRows: number;

  @ApiProperty({ description: 'Number of rows with warnings' })
  warningRows: number;

  @ApiProperty({ description: 'Job start time' })
  startTime: Date;

  @ApiPropertyOptional({ description: 'Job end time' })
  endTime?: Date;

  @ApiPropertyOptional({ description: 'Job duration in milliseconds' })
  duration?: number;

  @ApiProperty({ description: 'User ID who initiated the job' })
  userId: string;

  @ApiPropertyOptional({ description: 'Job configuration' })
  configuration?: any;

  @ApiPropertyOptional({ description: 'Job metadata' })
  metadata?: any;

  @ApiProperty({ description: 'Job creation time' })
  createdAt: Date;

  @ApiProperty({ description: 'Job last update time' })
  updatedAt: Date;
}

export class ValidationResultDto {
  @ApiProperty({ description: 'Import job ID' })
  jobId: string;

  @ApiProperty({ description: 'Validation status', enum: ImportJobStatus })
  status: ImportJobStatus;

  @ApiProperty({ description: 'Total number of rows' })
  totalRows: number;

  @ApiProperty({ description: 'Number of valid rows' })
  validRows: number;

  @ApiProperty({ description: 'Number of rows with errors' })
  errorRows: number;

  @ApiProperty({ description: 'Number of rows with warnings' })
  warningRows: number;

  @ApiProperty({ description: 'Validation errors' })
  errors: ValidationErrorDto[];

  @ApiProperty({ description: 'Validation warnings' })
  warnings: ValidationErrorDto[];

  @ApiProperty({ description: 'Validation summary' })
  summary: {
    validationPassed: boolean;
    criticalErrors: number;
    warnings: number;
  };
}

export class ValidationErrorDto {
  @ApiProperty({ description: 'Row number (1-indexed)' })
  row: number;

  @ApiProperty({ description: 'Column name' })
  column: string;

  @ApiProperty({ description: 'Invalid value' })
  value: string;

  @ApiProperty({ description: 'Error message' })
  message: string;

  @ApiProperty({ description: 'Error severity', enum: ValidationSeverity })
  severity: ValidationSeverity;

  @ApiProperty({ description: 'Validation rule that failed' })
  rule: string;
}

export class ImportProgressDto {
  @ApiProperty({ description: 'Import job ID' })
  jobId: string;

  @ApiProperty({ description: 'Current job status', enum: ImportJobStatus })
  status: ImportJobStatus;

  @ApiProperty({ description: 'Total number of rows' })
  totalRows: number;

  @ApiProperty({ description: 'Number of processed rows' })
  processedRows: number;

  @ApiProperty({ description: 'Progress percentage (0-100)' })
  progressPercentage: number;

  @ApiProperty({ description: 'Estimated time remaining in milliseconds' })
  estimatedTimeRemaining: number;

  @ApiProperty({ description: 'Current processing phase' })
  currentPhase: string;

  @ApiProperty({ description: 'Job start time' })
  startTime: Date;

  @ApiProperty({ description: 'Last update time' })
  lastUpdate: Date;
}

export class ImportStatisticsDto {
  @ApiProperty({ description: 'Total number of import jobs' })
  totalJobs: number;

  @ApiProperty({ description: 'Number of completed jobs' })
  completedJobs: number;

  @ApiProperty({ description: 'Number of failed jobs' })
  failedJobs: number;

  @ApiProperty({ description: 'Number of pending jobs' })
  pendingJobs: number;

  @ApiProperty({ description: 'Total number of rows processed' })
  totalRows: number;

  @ApiProperty({ description: 'Total number of rows successfully processed' })
  processedRows: number;

  @ApiProperty({ description: 'Success rate percentage' })
  successRate: number;

  @ApiProperty({ description: 'Average processing time in milliseconds' })
  averageProcessingTime: number;

  @ApiProperty({ description: 'Job status breakdown' })
  statusBreakdown: Record<string, number>;

  @ApiProperty({ description: 'Daily statistics' })
  dailyStats: Array<{ date: string; count: number }>;
}

export class ErrorReportDto {
  @ApiProperty({ description: 'Import job ID' })
  jobId: string;

  @ApiProperty({ description: 'Total number of errors' })
  totalErrors: number;

  @ApiProperty({ description: 'List of validation errors' })
  errors: ValidationErrorDto[];

  @ApiProperty({ description: 'Pagination information' })
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };

  @ApiProperty({ description: 'Error summary' })
  summary: {
    criticalErrors: number;
    warnings: number;
    mostCommonErrors: Array<{ message: string; count: number }>;
  };
}

export class DataPreviewDto {
  @ApiProperty({ description: 'Import job ID' })
  jobId: string;

  @ApiProperty({ description: 'CSV column headers' })
  headers: string[];

  @ApiProperty({ description: 'Preview data rows' })
  data: any[];

  @ApiProperty({ description: 'Total number of rows in file' })
  totalRows: number;

  @ApiProperty({ description: 'Number of preview rows returned' })
  previewRows: number;

  @ApiProperty({ description: 'Inferred data types for each column' })
  dataTypes: Record<string, string>;
}

export class ImportTemplateDto {
  @ApiProperty({ description: 'Template filename' })
  filename: string;

  @ApiProperty({ description: 'CSV column headers' })
  headers: string[];

  @ApiProperty({ description: 'Sample data rows' })
  sampleData: string[][];

  @ApiProperty({ description: 'Template description' })
  description: string;

  @ApiProperty({ description: 'Usage instructions' })
  instructions: string[];
}

// Query DTOs
export class ImportJobStatsQueryDto {
  @ApiPropertyOptional({ description: 'Start date for statistics (ISO string)' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date for statistics (ISO string)' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class ErrorReportQueryDto {
  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Transform(({ value }) => parseInt(value))
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page', default: 50 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(1000)
  @Transform(({ value }) => parseInt(value))
  limit?: number;

  @ApiPropertyOptional({ description: 'Filter by severity', enum: ValidationSeverity })
  @IsOptional()
  @IsEnum(ValidationSeverity)
  severity?: ValidationSeverity;

  @ApiPropertyOptional({ description: 'Filter by column name' })
  @IsOptional()
  @IsString()
  column?: string;

  @ApiPropertyOptional({ description: 'Filter by validation rule' })
  @IsOptional()
  @IsString()
  rule?: string;
}

export class DataPreviewQueryDto {
  @ApiPropertyOptional({ description: 'Number of rows to preview', default: 10 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Transform(({ value }) => parseInt(value))
  rows?: number;
}

export class BulkDeleteDto {
  @ApiProperty({ description: 'Array of job IDs to delete' })
  @IsArray()
  @IsString({ each: true })
  jobIds: string[];
}

export class CleanupJobsDto {
  @ApiProperty({ description: 'Delete jobs older than this many days' })
  @IsNumber()
  @Min(1)
  @Max(365)
  olderThanDays: number;

  @ApiPropertyOptional({ description: 'Only delete jobs with these statuses' })
  @IsOptional()
  @IsArray()
  @IsEnum(ImportJobStatus, { each: true })
  statuses?: ImportJobStatus[];
}

export class ExportDataDto {
  @ApiProperty({ description: 'Export format', enum: ['csv', 'json', 'xlsx'] })
  @IsEnum(['csv', 'json', 'xlsx'])
  format: 'csv' | 'json' | 'xlsx';

  @ApiPropertyOptional({ description: 'Include only valid rows' })
  @IsOptional()
  @IsBoolean()
  validRowsOnly?: boolean;

  @ApiPropertyOptional({ description: 'Include error details' })
  @IsOptional()
  @IsBoolean()
  includeErrors?: boolean;
}

// Pagination Response DTO
export class PaginationDto {
  @ApiProperty({ description: 'Current page number' })
  page: number;

  @ApiProperty({ description: 'Items per page' })
  limit: number;

  @ApiProperty({ description: 'Total number of items' })
  total: number;

  @ApiProperty({ description: 'Total number of pages' })
  pages: number;
}

// Generic Response DTO
export class ImportJobListResponseDto {
  @ApiProperty({ description: 'List of import jobs' })
  data: ImportJobResponseDto[];

  @ApiProperty({ description: 'Pagination information' })
  pagination: PaginationDto;
}

// File Upload Response DTO
export class FileUploadResponseDto {
  @ApiProperty({ description: 'Upload success status' })
  success: boolean;

  @ApiProperty({ description: 'Upload message' })
  message: string;

  @ApiProperty({ description: 'Created import job' })
  job: ImportJobResponseDto;
}

// Operation Response DTO
export class OperationResponseDto {
  @ApiProperty({ description: 'Operation success status' })
  success: boolean;

  @ApiProperty({ description: 'Operation message' })
  message: string;

  @ApiPropertyOptional({ description: 'Additional data' })
  data?: any;
}

// Bulk Operation Response DTO
export class BulkOperationResponseDto {
  @ApiProperty({ description: 'Operation success status' })
  success: boolean;

  @ApiProperty({ description: 'Operation message' })
  message: string;

  @ApiProperty({ description: 'Number of items processed' })
  processedCount: number;

  @ApiProperty({ description: 'Number of successful operations' })
  successCount: number;

  @ApiProperty({ description: 'Number of failed operations' })
  failureCount: number;

  @ApiPropertyOptional({ description: 'List of failed item IDs' })
  failedItems?: string[];
}
