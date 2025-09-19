import {
  IsString,
  IsBoolean,
  IsOptional,
  IsEnum,
  IsNumber,
  IsDateString,
  IsArray,
  ValidateNested,
  Min,
  Max,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// Enums
export enum BackupType {
  FULL = 'full',
  INCREMENTAL = 'incremental',
  DIFFERENTIAL = 'differential',
}

export enum BackupStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum BackupFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  CUSTOM = 'custom',
}

export enum StorageLocation {
  LOCAL = 'local',
  AWS_S3 = 'aws_s3',
  AZURE_BLOB = 'azure_blob',
  GOOGLE_CLOUD = 'google_cloud',
}

// Create Backup DTO
export class CreateBackupDto {
  @ApiProperty({ description: 'Backup name' })
  @IsString()
  name: string;

  @ApiProperty({ enum: BackupType, description: 'Type of backup' })
  @IsEnum(BackupType)
  type: BackupType;

  @ApiPropertyOptional({ description: 'Backup description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Include user data', default: true })
  @IsOptional()
  @IsBoolean()
  includeUserData?: boolean;

  @ApiPropertyOptional({ description: 'Include system configuration', default: true })
  @IsOptional()
  @IsBoolean()
  includeSystemConfig?: boolean;

  @ApiPropertyOptional({ description: 'Include uploaded files', default: true })
  @IsOptional()
  @IsBoolean()
  includeFiles?: boolean;

  @ApiPropertyOptional({ description: 'Compress backup', default: true })
  @IsOptional()
  @IsBoolean()
  compress?: boolean;

  @ApiPropertyOptional({ description: 'Encrypt backup', default: true })
  @IsOptional()
  @IsBoolean()
  encrypt?: boolean;

  @ApiPropertyOptional({ enum: StorageLocation, description: 'Storage location' })
  @IsOptional()
  @IsEnum(StorageLocation)
  storageLocation?: StorageLocation;
}

// Update Backup Configuration DTO
export class UpdateBackupConfigDto {
  @ApiPropertyOptional({ description: 'Enable automatic backups', default: true })
  @IsOptional()
  @IsBoolean()
  autoBackupEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Backup retention days', minimum: 1, maximum: 365 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(365)
  retentionDays?: number;

  @ApiPropertyOptional({ description: 'Maximum backup storage size in GB', minimum: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxStorageSize?: number;

  @ApiPropertyOptional({ description: 'Enable backup compression', default: true })
  @IsOptional()
  @IsBoolean()
  compressionEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Enable backup encryption', default: true })
  @IsOptional()
  @IsBoolean()
  encryptionEnabled?: boolean;

  @ApiPropertyOptional({ enum: StorageLocation, description: 'Default storage location' })
  @IsOptional()
  @IsEnum(StorageLocation)
  defaultStorageLocation?: StorageLocation;

  @ApiPropertyOptional({ description: 'Notification email for backup events' })
  @IsOptional()
  @IsString()
  notificationEmail?: string;

  @ApiPropertyOptional({ description: 'Enable backup verification', default: true })
  @IsOptional()
  @IsBoolean()
  verificationEnabled?: boolean;
}

// Backup Configuration Response DTO
export class BackupConfigResponseDto {
  @ApiProperty({ description: 'Configuration ID' })
  id: string;

  @ApiProperty({ description: 'Enable automatic backups' })
  autoBackupEnabled: boolean;

  @ApiProperty({ description: 'Backup retention days' })
  retentionDays: number;

  @ApiProperty({ description: 'Maximum backup storage size in GB' })
  maxStorageSize: number;

  @ApiProperty({ description: 'Enable backup compression' })
  compressionEnabled: boolean;

  @ApiProperty({ description: 'Enable backup encryption' })
  encryptionEnabled: boolean;

  @ApiProperty({ enum: StorageLocation, description: 'Default storage location' })
  defaultStorageLocation: StorageLocation;

  @ApiPropertyOptional({ description: 'Notification email for backup events' })
  notificationEmail?: string;

  @ApiProperty({ description: 'Enable backup verification' })
  verificationEnabled: boolean;

  @ApiProperty({ description: 'Configuration created date' })
  createdAt: Date;

  @ApiProperty({ description: 'Configuration updated date' })
  updatedAt: Date;
}

// Backup Job Response DTO
export class BackupJobResponseDto {
  @ApiProperty({ description: 'Backup job ID' })
  id: string;

  @ApiProperty({ description: 'Backup name' })
  name: string;

  @ApiProperty({ enum: BackupType, description: 'Type of backup' })
  type: BackupType;

  @ApiProperty({ enum: BackupStatus, description: 'Backup status' })
  status: BackupStatus;

  @ApiPropertyOptional({ description: 'Backup description' })
  description?: string;

  @ApiProperty({ description: 'Backup file path' })
  filePath: string;

  @ApiProperty({ description: 'Backup file size in bytes' })
  fileSize: number;

  @ApiProperty({ description: 'Backup start time' })
  startedAt: Date;

  @ApiPropertyOptional({ description: 'Backup completion time' })
  completedAt?: Date;

  @ApiPropertyOptional({ description: 'Error message if backup failed' })
  errorMessage?: string;

  @ApiProperty({ description: 'Backup progress percentage' })
  progress: number;

  @ApiProperty({ description: 'Include user data' })
  includeUserData: boolean;

  @ApiProperty({ description: 'Include system configuration' })
  includeSystemConfig: boolean;

  @ApiProperty({ description: 'Include uploaded files' })
  includeFiles: boolean;

  @ApiProperty({ description: 'Backup compressed' })
  compressed: boolean;

  @ApiProperty({ description: 'Backup encrypted' })
  encrypted: boolean;

  @ApiProperty({ enum: StorageLocation, description: 'Storage location' })
  storageLocation: StorageLocation;

  @ApiProperty({ description: 'Backup created by user ID' })
  createdBy: string;

  @ApiProperty({ description: 'Backup created date' })
  createdAt: Date;
}

// Restore Backup DTO
export class RestoreBackupDto {
  @ApiProperty({ description: 'Backup ID to restore from' })
  @IsString()
  backupId: string;

  @ApiPropertyOptional({ description: 'Restore user data', default: true })
  @IsOptional()
  @IsBoolean()
  restoreUserData?: boolean;

  @ApiPropertyOptional({ description: 'Restore system configuration', default: true })
  @IsOptional()
  @IsBoolean()
  restoreSystemConfig?: boolean;

  @ApiPropertyOptional({ description: 'Restore uploaded files', default: true })
  @IsOptional()
  @IsBoolean()
  restoreFiles?: boolean;

  @ApiPropertyOptional({ description: 'Create backup before restore', default: true })
  @IsOptional()
  @IsBoolean()
  createBackupBeforeRestore?: boolean;

  @ApiPropertyOptional({ description: 'Force restore even if validation fails' })
  @IsOptional()
  @IsBoolean()
  forceRestore?: boolean;
}

// Backup Query DTO
export class BackupQueryDto {
  @ApiPropertyOptional({ description: 'Filter by backup status' })
  @IsOptional()
  @IsEnum(BackupStatus)
  status?: BackupStatus;

  @ApiPropertyOptional({ description: 'Filter by backup type' })
  @IsOptional()
  @IsEnum(BackupType)
  type?: BackupType;

  @ApiPropertyOptional({ description: 'Filter by storage location' })
  @IsOptional()
  @IsEnum(StorageLocation)
  storageLocation?: StorageLocation;

  @ApiPropertyOptional({ description: 'Filter by date from' })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({ description: 'Filter by date to' })
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @ApiPropertyOptional({ description: 'Page number', minimum: 1, default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page', minimum: 1, maximum: 100, default: 20 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({ description: 'Sort by field', default: 'createdAt' })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({ description: 'Sort order', enum: ['asc', 'desc'], default: 'desc' })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
}

// Backup Schedule DTO
export class BackupScheduleDto {
  @ApiPropertyOptional({ description: 'Schedule ID (for updates)' })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({ description: 'Schedule name' })
  @IsString()
  name: string;

  @ApiProperty({ enum: BackupType, description: 'Type of backup' })
  @IsEnum(BackupType)
  type: BackupType;

  @ApiProperty({ enum: BackupFrequency, description: 'Backup frequency' })
  @IsEnum(BackupFrequency)
  frequency: BackupFrequency;

  @ApiPropertyOptional({ description: 'Cron expression for custom frequency' })
  @IsOptional()
  @IsString()
  cronExpression?: string;

  @ApiPropertyOptional({ description: 'Schedule enabled', default: true })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiPropertyOptional({ description: 'Include user data', default: true })
  @IsOptional()
  @IsBoolean()
  includeUserData?: boolean;

  @ApiPropertyOptional({ description: 'Include system configuration', default: true })
  @IsOptional()
  @IsBoolean()
  includeSystemConfig?: boolean;

  @ApiPropertyOptional({ description: 'Include uploaded files', default: true })
  @IsOptional()
  @IsBoolean()
  includeFiles?: boolean;

  @ApiPropertyOptional({ description: 'Compress backup', default: true })
  @IsOptional()
  @IsBoolean()
  compress?: boolean;

  @ApiPropertyOptional({ description: 'Encrypt backup', default: true })
  @IsOptional()
  @IsBoolean()
  encrypt?: boolean;

  @ApiPropertyOptional({ enum: StorageLocation, description: 'Storage location' })
  @IsOptional()
  @IsEnum(StorageLocation)
  storageLocation?: StorageLocation;

  @ApiPropertyOptional({ description: 'Next execution time' })
  @IsOptional()
  @IsDateString()
  nextExecution?: string;

  @ApiPropertyOptional({ description: 'Last execution time' })
  @IsOptional()
  @IsDateString()
  lastExecution?: string;
}

// Backup Validation DTO
export class BackupValidationDto {
  @ApiProperty({ description: 'Backup ID' })
  id: string;

  @ApiProperty({ description: 'Validation status' })
  isValid: boolean;

  @ApiProperty({ description: 'File integrity check passed' })
  fileIntegrityValid: boolean;

  @ApiProperty({ description: 'Backup structure valid' })
  structureValid: boolean;

  @ApiProperty({ description: 'Data consistency check passed' })
  dataConsistencyValid: boolean;

  @ApiPropertyOptional({ description: 'Validation errors' })
  errors?: string[];

  @ApiPropertyOptional({ description: 'Validation warnings' })
  warnings?: string[];

  @ApiProperty({ description: 'Validation performed at' })
  validatedAt: Date;

  @ApiProperty({ description: 'Validation duration in milliseconds' })
  validationDuration: number;
}

// Backup Metrics DTO
export class BackupMetricsDto {
  @ApiProperty({ description: 'Total number of backups' })
  totalBackups: number;

  @ApiProperty({ description: 'Successful backups count' })
  successfulBackups: number;

  @ApiProperty({ description: 'Failed backups count' })
  failedBackups: number;

  @ApiProperty({ description: 'Total storage used in bytes' })
  totalStorageUsed: number;

  @ApiProperty({ description: 'Average backup size in bytes' })
  averageBackupSize: number;

  @ApiProperty({ description: 'Average backup duration in milliseconds' })
  averageBackupDuration: number;

  @ApiProperty({ description: 'Last successful backup date' })
  lastSuccessfulBackup: Date;

  @ApiProperty({ description: 'Next scheduled backup date' })
  nextScheduledBackup: Date;

  @ApiProperty({ description: 'Backup success rate percentage' })
  successRate: number;

  @ApiProperty({ description: 'Storage usage by type' })
  storageByType: {
    full: number;
    incremental: number;
    differential: number;
  };

  @ApiProperty({ description: 'Backup count by status' })
  backupsByStatus: {
    pending: number;
    running: number;
    completed: number;
    failed: number;
    cancelled: number;
  };

  @ApiProperty({ description: 'Recent backup activity (last 30 days)' })
  recentActivity: {
    date: string;
    count: number;
    totalSize: number;
  }[];
}
