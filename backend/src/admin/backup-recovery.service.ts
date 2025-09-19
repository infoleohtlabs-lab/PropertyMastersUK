import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BackupRecord } from './entities/backup-record.entity';
import { AdminActivityLog } from './entities/admin-activity-log.entity';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// DTOs and Interfaces
export interface BackupScheduleDto {
  name: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
  cronExpression?: string;
  retentionDays: number;
  includeUserData: boolean;
  includeSystemData: boolean;
  includeFiles: boolean;
  compressionLevel: number;
  encryptionEnabled: boolean;
  notificationEmails: string[];
  enabled: boolean;
}

export interface BackupRestoreDto {
  backupId: string;
  restoreType: 'full' | 'partial';
  selectedTables?: string[];
  targetDatabase?: string;
  preserveExistingData: boolean;
  createBackupBeforeRestore: boolean;
}

export interface BackupProgress {
  backupId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  currentStep: string;
  totalSteps: number;
  startTime: Date;
  estimatedCompletion?: Date;
  errorMessage?: string;
}

export interface BackupHistory {
  id: string;
  name: string;
  type: 'scheduled' | 'manual';
  status: 'completed' | 'failed' | 'partial';
  size: number;
  duration: number;
  createdAt: Date;
  createdBy: string;
  description?: string;
  errorMessage?: string;
}

export interface RestoreProgress {
  restoreId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  currentStep: string;
  totalSteps: number;
  startTime: Date;
  estimatedCompletion?: Date;
  errorMessage?: string;
}

export interface BackupValidation {
  valid: boolean;
  errors: string[];
  warnings: string[];
  metadata: {
    version: string;
    createdAt: Date;
    size: number;
    checksum: string;
    tables: string[];
  };
}

export interface BackupSettings {
  defaultRetentionDays: number;
  maxBackupSize: number;
  backupDirectory: string;
  compressionEnabled: boolean;
  encryptionEnabled: boolean;
  notificationSettings: {
    onSuccess: boolean;
    onFailure: boolean;
    recipients: string[];
  };
  performanceSettings: {
    maxConcurrentBackups: number;
    backupTimeout: number;
    compressionLevel: number;
  };
}

@Injectable()
export class BackupRecoveryService {
  private readonly logger = new Logger(BackupRecoveryService.name);
  private readonly backupProgress = new Map<string, BackupProgress>();
  private readonly restoreProgress = new Map<string, RestoreProgress>();
  private readonly activeBackups = new Set<string>();
  private readonly activeRestores = new Set<string>();

  constructor(
    @InjectRepository(BackupRecord)
    private readonly backupRecordRepository: Repository<BackupRecord>,
    @InjectRepository(AdminActivityLog)
    private readonly activityLogRepository: Repository<AdminActivityLog>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // Backup Management
  async createBackup(
    scheduleData: BackupScheduleDto,
    userId: string,
  ): Promise<{ backupId: string; message: string }> {
    const backupId = crypto.randomUUID();
    
    try {
      // Initialize backup progress
      this.backupProgress.set(backupId, {
        backupId,
        status: 'pending',
        progress: 0,
        currentStep: 'Initializing backup',
        totalSteps: 6,
        startTime: new Date(),
      });

      // Create backup record
      const backupRecord = this.backupRecordRepository.create({
        id: backupId,
        name: scheduleData.name,
        description: scheduleData.description,
        type: 'manual',
        status: 'pending',
        includeUserData: scheduleData.includeUserData,
        includeSystemData: scheduleData.includeSystemData,
        includeFiles: scheduleData.includeFiles,
        compressionLevel: scheduleData.compressionLevel,
        encryptionEnabled: scheduleData.encryptionEnabled,
        createdBy: userId,
      });

      await this.backupRecordRepository.save(backupRecord);

      // Start backup process asynchronously
      this.performBackup(backupId, scheduleData, userId).catch((error) => {
        this.logger.error(`Backup ${backupId} failed:`, error);
        this.updateBackupProgress(backupId, {
          status: 'failed',
          errorMessage: error.message,
        });
      });

      await this.logActivity(
        'backup_created',
        `Manual backup "${scheduleData.name}" initiated`,
        userId,
        { backupId, scheduleData },
      );

      return {
        backupId,
        message: 'Backup initiated successfully',
      };
    } catch (error) {
      this.logger.error('Failed to create backup:', error);
      throw new BadRequestException('Failed to initiate backup');
    }
  }

  async getBackupProgress(backupId: string): Promise<BackupProgress> {
    const progress = this.backupProgress.get(backupId);
    if (!progress) {
      throw new NotFoundException('Backup operation not found');
    }
    return progress;
  }

  async cancelBackup(
    backupId: string,
    userId: string,
  ): Promise<{ success: boolean; message: string }> {
    const progress = this.backupProgress.get(backupId);
    if (!progress) {
      throw new NotFoundException('Backup operation not found');
    }

    if (progress.status === 'completed' || progress.status === 'failed') {
      throw new BadRequestException('Cannot cancel completed or failed backup');
    }

    // Update progress status
    this.updateBackupProgress(backupId, {
      status: 'cancelled',
      errorMessage: 'Backup cancelled by user',
    });

    // Update database record
    await this.backupRecordRepository.update(backupId, {
      status: 'cancelled',
      errorMessage: 'Backup cancelled by user',
      completedAt: new Date(),
    });

    this.activeBackups.delete(backupId);

    await this.logActivity(
      'backup_cancelled',
      `Backup ${backupId} cancelled`,
      userId,
      { backupId },
    );

    return {
      success: true,
      message: 'Backup cancelled successfully',
    };
  }

  async getBackupHistory(
    page: number = 1,
    limit: number = 20,
  ): Promise<{
    data: BackupHistory[];
    total: number;
    page: number;
    limit: number;
  }> {
    const [records, total] = await this.backupRecordRepository.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const data: BackupHistory[] = records.map((record) => ({
      id: record.id,
      name: record.name,
      type: record.type as 'scheduled' | 'manual',
      status: record.status as 'completed' | 'failed' | 'partial',
      size: record.size || 0,
      duration: record.duration || 0,
      createdAt: record.createdAt,
      createdBy: record.createdBy,
      description: record.description,
      errorMessage: record.errorMessage,
    }));

    return { data, total, page, limit };
  }

  // Restore Management
  async restoreBackup(
    restoreData: BackupRestoreDto,
    userId: string,
  ): Promise<{ restoreId: string; message: string }> {
    const restoreId = crypto.randomUUID();
    
    try {
      // Validate backup exists
      const backup = await this.backupRecordRepository.findOne({
        where: { id: restoreData.backupId },
      });

      if (!backup) {
        throw new NotFoundException('Backup not found');
      }

      if (backup.status !== 'completed') {
        throw new BadRequestException('Cannot restore from incomplete backup');
      }

      // Initialize restore progress
      this.restoreProgress.set(restoreId, {
        restoreId,
        status: 'pending',
        progress: 0,
        currentStep: 'Initializing restore',
        totalSteps: 5,
        startTime: new Date(),
      });

      // Start restore process asynchronously
      this.performRestore(restoreId, restoreData, userId).catch((error) => {
        this.logger.error(`Restore ${restoreId} failed:`, error);
        this.updateRestoreProgress(restoreId, {
          status: 'failed',
          errorMessage: error.message,
        });
      });

      await this.logActivity(
        'restore_initiated',
        `Restore from backup ${restoreData.backupId} initiated`,
        userId,
        { restoreId, restoreData },
      );

      return {
        restoreId,
        message: 'Restore initiated successfully',
      };
    } catch (error) {
      this.logger.error('Failed to initiate restore:', error);
      throw new BadRequestException('Failed to initiate restore');
    }
  }

  async getRestoreProgress(restoreId: string): Promise<RestoreProgress> {
    const progress = this.restoreProgress.get(restoreId);
    if (!progress) {
      throw new NotFoundException('Restore operation not found');
    }
    return progress;
  }

  async cancelRestore(
    restoreId: string,
    userId: string,
  ): Promise<{ success: boolean; message: string }> {
    const progress = this.restoreProgress.get(restoreId);
    if (!progress) {
      throw new NotFoundException('Restore operation not found');
    }

    if (progress.status === 'completed' || progress.status === 'failed') {
      throw new BadRequestException('Cannot cancel completed or failed restore');
    }

    // Update progress status
    this.updateRestoreProgress(restoreId, {
      status: 'cancelled',
      errorMessage: 'Restore cancelled by user',
    });

    this.activeRestores.delete(restoreId);

    await this.logActivity(
      'restore_cancelled',
      `Restore ${restoreId} cancelled`,
      userId,
      { restoreId },
    );

    return {
      success: true,
      message: 'Restore cancelled successfully',
    };
  }

  // Backup Validation
  async validateBackup(backupId: string): Promise<BackupValidation> {
    try {
      const backup = await this.backupRecordRepository.findOne({
        where: { id: backupId },
      });

      if (!backup) {
        throw new NotFoundException('Backup not found');
      }

      const backupPath = this.getBackupPath(backupId);
      if (!fs.existsSync(backupPath)) {
        return {
          valid: false,
          errors: ['Backup file not found'],
          warnings: [],
          metadata: {
            version: '',
            createdAt: backup.createdAt,
            size: 0,
            checksum: '',
            tables: [],
          },
        };
      }

      // Validate file integrity
      const fileStats = fs.statSync(backupPath);
      const fileBuffer = fs.readFileSync(backupPath);
      const checksum = crypto.createHash('sha256').update(fileBuffer).digest('hex');

      const errors: string[] = [];
      const warnings: string[] = [];

      // Check file size
      if (fileStats.size !== backup.size) {
        errors.push('File size mismatch');
      }

      // Check checksum if available
      if (backup.checksum && backup.checksum !== checksum) {
        errors.push('Checksum mismatch - file may be corrupted');
      }

      // Additional validation logic here...

      return {
        valid: errors.length === 0,
        errors,
        warnings,
        metadata: {
          version: backup.version || '1.0.0',
          createdAt: backup.createdAt,
          size: fileStats.size,
          checksum,
          tables: backup.includedTables || [],
        },
      };
    } catch (error) {
      this.logger.error('Failed to validate backup:', error);
      throw new BadRequestException('Failed to validate backup');
    }
  }

  // Settings Management
  async getBackupSettings(): Promise<BackupSettings> {
    // This would typically come from a configuration service or database
    return {
      defaultRetentionDays: 30,
      maxBackupSize: 10 * 1024 * 1024 * 1024, // 10GB
      backupDirectory: path.join(process.cwd(), 'backups'),
      compressionEnabled: true,
      encryptionEnabled: false,
      notificationSettings: {
        onSuccess: true,
        onFailure: true,
        recipients: ['admin@propertymastersuk.com'],
      },
      performanceSettings: {
        maxConcurrentBackups: 2,
        backupTimeout: 3600000, // 1 hour
        compressionLevel: 6,
      },
    };
  }

  async updateBackupSettings(
    settings: Partial<BackupSettings>,
    userId: string,
  ): Promise<BackupSettings> {
    // Update settings in database/configuration
    // This is a simplified implementation
    
    await this.logActivity(
      'backup_settings_updated',
      'Backup settings updated',
      userId,
      { settings },
    );

    return this.getBackupSettings();
  }

  // Scheduled Backup Management
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async performScheduledBackups(): Promise<void> {
    this.logger.log('Starting scheduled backup process');
    
    try {
      // Get all enabled scheduled backups
      const scheduledBackups = await this.getScheduledBackups();
      
      for (const schedule of scheduledBackups) {
        if (this.shouldRunBackup(schedule)) {
          await this.createBackup(schedule, 'system');
        }
      }
    } catch (error) {
      this.logger.error('Scheduled backup process failed:', error);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async cleanupOldBackups(): Promise<void> {
    this.logger.log('Starting backup cleanup process');
    
    try {
      const settings = await this.getBackupSettings();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - settings.defaultRetentionDays);

      const oldBackups = await this.backupRecordRepository.find({
        where: {
          createdAt: { $lt: cutoffDate } as any,
          status: 'completed',
        },
      });

      for (const backup of oldBackups) {
        await this.deleteBackup(backup.id);
      }

      this.logger.log(`Cleaned up ${oldBackups.length} old backups`);
    } catch (error) {
      this.logger.error('Backup cleanup process failed:', error);
    }
  }

  // Private Methods
  private async performBackup(
    backupId: string,
    scheduleData: BackupScheduleDto,
    userId: string,
  ): Promise<void> {
    this.activeBackups.add(backupId);
    
    try {
      this.updateBackupProgress(backupId, {
        status: 'running',
        progress: 10,
        currentStep: 'Creating backup directory',
      });

      // Create backup directory
      const backupDir = this.getBackupDirectory();
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }

      this.updateBackupProgress(backupId, {
        progress: 20,
        currentStep: 'Exporting database',
      });

      // Export database
      const backupPath = await this.exportDatabase(backupId, scheduleData);

      this.updateBackupProgress(backupId, {
        progress: 60,
        currentStep: 'Compressing backup',
      });

      // Compress if enabled
      if (scheduleData.compressionLevel > 0) {
        await this.compressBackup(backupPath, scheduleData.compressionLevel);
      }

      this.updateBackupProgress(backupId, {
        progress: 80,
        currentStep: 'Calculating checksum',
      });

      // Calculate checksum
      const checksum = await this.calculateChecksum(backupPath);
      const fileStats = fs.statSync(backupPath);

      this.updateBackupProgress(backupId, {
        progress: 90,
        currentStep: 'Finalizing backup',
      });

      // Update backup record
      await this.backupRecordRepository.update(backupId, {
        status: 'completed',
        size: fileStats.size,
        checksum,
        filePath: backupPath,
        completedAt: new Date(),
        duration: Date.now() - this.backupProgress.get(backupId)!.startTime.getTime(),
      });

      this.updateBackupProgress(backupId, {
        status: 'completed',
        progress: 100,
        currentStep: 'Backup completed',
      });

      // Emit event
      this.eventEmitter.emit('backup.completed', {
        backupId,
        userId,
        size: fileStats.size,
      });

    } catch (error) {
      await this.backupRecordRepository.update(backupId, {
        status: 'failed',
        errorMessage: error.message,
        completedAt: new Date(),
      });

      this.updateBackupProgress(backupId, {
        status: 'failed',
        errorMessage: error.message,
      });

      throw error;
    } finally {
      this.activeBackups.delete(backupId);
    }
  }

  private async performRestore(
    restoreId: string,
    restoreData: BackupRestoreDto,
    userId: string,
  ): Promise<void> {
    this.activeRestores.add(restoreId);
    
    try {
      this.updateRestoreProgress(restoreId, {
        status: 'running',
        progress: 10,
        currentStep: 'Validating backup',
      });

      // Validate backup
      const validation = await this.validateBackup(restoreData.backupId);
      if (!validation.valid) {
        throw new Error(`Invalid backup: ${validation.errors.join(', ')}`);
      }

      this.updateRestoreProgress(restoreId, {
        progress: 30,
        currentStep: 'Preparing restore',
      });

      // Create backup before restore if requested
      if (restoreData.createBackupBeforeRestore) {
        await this.createPreRestoreBackup(restoreId);
      }

      this.updateRestoreProgress(restoreId, {
        progress: 50,
        currentStep: 'Restoring database',
      });

      // Perform restore
      await this.restoreDatabase(restoreData);

      this.updateRestoreProgress(restoreId, {
        status: 'completed',
        progress: 100,
        currentStep: 'Restore completed',
      });

      // Emit event
      this.eventEmitter.emit('restore.completed', {
        restoreId,
        backupId: restoreData.backupId,
        userId,
      });

    } catch (error) {
      this.updateRestoreProgress(restoreId, {
        status: 'failed',
        errorMessage: error.message,
      });

      throw error;
    } finally {
      this.activeRestores.delete(restoreId);
    }
  }

  private updateBackupProgress(
    backupId: string,
    updates: Partial<BackupProgress>,
  ): void {
    const current = this.backupProgress.get(backupId);
    if (current) {
      this.backupProgress.set(backupId, { ...current, ...updates });
    }
  }

  private updateRestoreProgress(
    restoreId: string,
    updates: Partial<RestoreProgress>,
  ): void {
    const current = this.restoreProgress.get(restoreId);
    if (current) {
      this.restoreProgress.set(restoreId, { ...current, ...updates });
    }
  }

  private getBackupPath(backupId: string): string {
    return path.join(this.getBackupDirectory(), `${backupId}.sql`);
  }

  private getBackupDirectory(): string {
    return path.join(process.cwd(), 'backups');
  }

  private async exportDatabase(
    backupId: string,
    scheduleData: BackupScheduleDto,
  ): Promise<string> {
    const backupPath = this.getBackupPath(backupId);
    
    // This is a simplified implementation
    // In a real application, you would use pg_dump or similar tools
    const command = `pg_dump ${process.env.DATABASE_URL} > ${backupPath}`;
    
    try {
      await execAsync(command);
      return backupPath;
    } catch (error) {
      throw new Error(`Database export failed: ${error.message}`);
    }
  }

  private async compressBackup(
    backupPath: string,
    compressionLevel: number,
  ): Promise<void> {
    // Implement compression logic
    const command = `gzip -${compressionLevel} ${backupPath}`;
    await execAsync(command);
  }

  private async calculateChecksum(filePath: string): Promise<string> {
    const fileBuffer = fs.readFileSync(filePath);
    return crypto.createHash('sha256').update(fileBuffer).digest('hex');
  }

  private async restoreDatabase(restoreData: BackupRestoreDto): Promise<void> {
    // This is a simplified implementation
    // In a real application, you would use psql or similar tools
    const backupPath = this.getBackupPath(restoreData.backupId);
    const command = `psql ${process.env.DATABASE_URL} < ${backupPath}`;
    
    try {
      await execAsync(command);
    } catch (error) {
      throw new Error(`Database restore failed: ${error.message}`);
    }
  }

  private async createPreRestoreBackup(restoreId: string): Promise<void> {
    const backupData: BackupScheduleDto = {
      name: `Pre-restore backup for ${restoreId}`,
      description: 'Automatic backup created before restore operation',
      frequency: 'custom',
      retentionDays: 7,
      includeUserData: true,
      includeSystemData: true,
      includeFiles: false,
      compressionLevel: 6,
      encryptionEnabled: false,
      notificationEmails: [],
      enabled: true,
    };

    await this.createBackup(backupData, 'system');
  }

  private async deleteBackup(backupId: string): Promise<void> {
    const backup = await this.backupRecordRepository.findOne({
      where: { id: backupId },
    });

    if (backup && backup.filePath && fs.existsSync(backup.filePath)) {
      fs.unlinkSync(backup.filePath);
    }

    await this.backupRecordRepository.delete(backupId);
  }

  private async getScheduledBackups(): Promise<BackupScheduleDto[]> {
    // This would typically come from a database table
    // Return empty array for now
    return [];
  }

  private shouldRunBackup(schedule: BackupScheduleDto): boolean {
    // Implement logic to determine if backup should run based on schedule
    return true;
  }

  private async logActivity(
    action: string,
    description: string,
    userId: string,
    metadata?: any,
  ): Promise<void> {
    try {
      const log = this.activityLogRepository.create({
        action,
        details: description,
        userId,
        metadata,
      });
      await this.activityLogRepository.save(log);
    } catch (error) {
      this.logger.error('Failed to log activity:', error);
    }
  }
}
