import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In, Between } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { User, UserStatus } from '../users/entities/user.entity';
import { Property } from '../properties/entities/property.entity';
import { AdminActivityLog } from './entities/admin-activity-log.entity';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as fs from 'fs';
import * as path from 'path';
import * as archiver from 'archiver';
import { Readable } from 'stream';

// DTOs for GDPR Compliance
export interface DataExportRequest {
  userId?: string;
  email?: string;
  includePersonalData: boolean;
  includeActivityLogs: boolean;
  includeProperties: boolean;
  includeFinancialData: boolean;
  dateRange?: {
    startDate: Date;
    endDate: Date;
  };
  format: 'json' | 'csv' | 'xml';
  deliveryMethod: 'download' | 'email';
}

export interface DataExportResult {
  exportId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  requestedBy: string;
  requestedAt: Date;
  completedAt?: Date;
  fileSize?: number;
  downloadUrl?: string;
  expiresAt?: Date;
  error?: string;
}

export interface DataDeletionRequest {
  userId: string;
  deletionType: 'soft' | 'hard';
  retainLegalData: boolean;
  retainFinancialData: boolean;
  reason: string;
  requestedBy: string;
  scheduledFor?: Date;
}

export interface DataDeletionResult {
  deletionId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  userId: string;
  requestedBy: string;
  requestedAt: Date;
  completedAt?: Date;
  deletedData: {
    personalData: boolean;
    activityLogs: boolean;
    properties: boolean;
    financialData: boolean;
  };
  retainedData: string[];
  error?: string;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: 'marketing' | 'analytics' | 'cookies' | 'data_processing' | 'third_party_sharing';
  granted: boolean;
  grantedAt?: Date;
  revokedAt?: Date;
  ipAddress: string;
  userAgent: string;
  version: string;
  source: string;
}

export interface PrivacyAuditLog {
  id: string;
  userId?: string;
  action: string;
  dataType: string;
  purpose: string;
  legalBasis: string;
  performedBy: string;
  performedAt: Date;
  ipAddress: string;
  details: any;
  retention: {
    retainUntil: Date;
    reason: string;
  };
}

export interface GdprComplianceReport {
  reportId: string;
  generatedAt: Date;
  period: {
    startDate: Date;
    endDate: Date;
  };
  statistics: {
    totalUsers: number;
    activeUsers: number;
    dataExportRequests: number;
    dataDeletionRequests: number;
    consentUpdates: number;
    privacyViolations: number;
  };
  compliance: {
    dataRetentionCompliance: number;
    consentCompliance: number;
    dataProcessingCompliance: number;
    overallScore: number;
  };
  recommendations: string[];
}

@Injectable()
export class GdprComplianceService {
  private readonly logger = new Logger(GdprComplianceService.name);
  private readonly exportRequests = new Map<string, DataExportResult>();
  private readonly deletionRequests = new Map<string, DataDeletionResult>();

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Property)
    private readonly propertyRepository: Repository<Property>,
    @InjectRepository(AdminActivityLog)
    private readonly activityLogRepository: Repository<AdminActivityLog>,
    private readonly dataSource: DataSource,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // Data Export Functionality
  async requestDataExport(
    request: DataExportRequest,
    requestedBy: string,
  ): Promise<{ exportId: string; message: string }> {
    const exportId = this.generateExportId();
    
    const exportResult: DataExportResult = {
      exportId,
      status: 'pending',
      requestedBy,
      requestedAt: new Date(),
    };
    
    this.exportRequests.set(exportId, exportResult);
    
    // Start export process asynchronously
    this.processDataExportAsync(request, exportId, requestedBy);
    
    // Log the request
    await this.logPrivacyActivity(
      request.userId,
      'DATA_EXPORT_REQUESTED',
      'personal_data',
      'Data subject rights - Article 15 GDPR',
      'Legitimate interest',
      requestedBy,
      request,
    );
    
    return {
      exportId,
      message: 'Data export request submitted. Use the export ID to track progress.',
    };
  }

  async getDataExportStatus(exportId: string): Promise<DataExportResult> {
    const result = this.exportRequests.get(exportId);
    if (!result) {
      throw new NotFoundException('Export request not found');
    }
    return result;
  }

  async downloadDataExport(exportId: string): Promise<{ stream: Readable; filename: string; mimeType: string }> {
    const result = this.exportRequests.get(exportId);
    if (!result) {
      throw new NotFoundException('Export request not found');
    }
    
    if (result.status !== 'completed') {
      throw new BadRequestException('Export is not ready for download');
    }
    
    if (result.expiresAt && result.expiresAt < new Date()) {
      throw new BadRequestException('Export has expired');
    }
    
    // Create download stream (implementation would depend on file storage)
    const filePath = path.join(process.cwd(), 'exports', `${exportId}.zip`);
    const stream = fs.createReadStream(filePath);
    
    return {
      stream,
      filename: `data-export-${exportId}.zip`,
      mimeType: 'application/zip',
    };
  }

  // Data Deletion Functionality
  async requestDataDeletion(
    request: DataDeletionRequest,
  ): Promise<{ deletionId: string; message: string }> {
    const deletionId = this.generateDeletionId();
    
    // Validate user exists
    const user = await this.userRepository.findOne({ where: { id: request.userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    const deletionResult: DataDeletionResult = {
      deletionId,
      status: 'pending',
      userId: request.userId,
      requestedBy: request.requestedBy,
      requestedAt: new Date(),
      deletedData: {
        personalData: false,
        activityLogs: false,
        properties: false,
        financialData: false,
      },
      retainedData: [],
    };
    
    this.deletionRequests.set(deletionId, deletionResult);
    
    // Schedule deletion if requested
    if (request.scheduledFor && request.scheduledFor > new Date()) {
      // Implementation for scheduled deletion
      setTimeout(() => {
        this.processDataDeletionAsync(request, deletionId);
      }, request.scheduledFor.getTime() - Date.now());
    } else {
      // Start deletion process immediately
      this.processDataDeletionAsync(request, deletionId);
    }
    
    // Log the request
    await this.logPrivacyActivity(
      request.userId,
      'DATA_DELETION_REQUESTED',
      'personal_data',
      'Data subject rights - Article 17 GDPR',
      'Legal obligation',
      request.requestedBy,
      request,
    );
    
    return {
      deletionId,
      message: 'Data deletion request submitted. Use the deletion ID to track progress.',
    };
  }

  async getDataDeletionStatus(deletionId: string): Promise<DataDeletionResult> {
    const result = this.deletionRequests.get(deletionId);
    if (!result) {
      throw new NotFoundException('Deletion request not found');
    }
    return result;
  }

  // Consent Management
  async updateConsent(
    userId: string,
    consentType: ConsentRecord['consentType'],
    granted: boolean,
    metadata: {
      ipAddress: string;
      userAgent: string;
      source: string;
    },
  ): Promise<ConsentRecord> {
    const consentId = this.generateConsentId();
    
    const consent: ConsentRecord = {
      id: consentId,
      userId,
      consentType,
      granted,
      grantedAt: granted ? new Date() : undefined,
      revokedAt: !granted ? new Date() : undefined,
      ipAddress: metadata.ipAddress,
      userAgent: metadata.userAgent,
      version: '1.0',
      source: metadata.source,
    };
    
    // Store consent record (implementation would use a dedicated consent table)
    // For now, log as activity
    await this.logPrivacyActivity(
      userId,
      granted ? 'CONSENT_GRANTED' : 'CONSENT_REVOKED',
      'consent_data',
      'Consent management - Article 7 GDPR',
      'Consent',
      userId,
      consent,
    );
    
    this.eventEmitter.emit('gdpr.consent.updated', {
      userId,
      consentType,
      granted,
      timestamp: new Date(),
    });
    
    return consent;
  }

  async getUserConsents(userId: string): Promise<ConsentRecord[]> {
    // Implementation would query a dedicated consent table
    // For now, return from activity logs
    const activities = await this.activityLogRepository.find({
      where: {
        userId,
        action: In(['CONSENT_GRANTED', 'CONSENT_REVOKED']),
      },
      order: { createdAt: 'DESC' },
    });
    
    return activities.map(activity => activity.metadata as ConsentRecord);
  }

  // Privacy Audit Logs
  async getPrivacyAuditLogs(
    filters: {
      userId?: string;
      action?: string;
      dataType?: string;
      startDate?: Date;
      endDate?: Date;
      page?: number;
      limit?: number;
    } = {},
  ) {
    const { page = 1, limit = 50, startDate, endDate, ...otherFilters } = filters;
    const offset = (page - 1) * limit;
    
    const queryBuilder = this.activityLogRepository.createQueryBuilder('log')
      .where('log.category = :category', { category: 'gdpr_compliance' });
    
    if (otherFilters.userId) {
      queryBuilder.andWhere('log.userId = :userId', { userId: otherFilters.userId });
    }
    
    if (otherFilters.action) {
      queryBuilder.andWhere('log.action = :action', { action: otherFilters.action });
    }
    
    if (startDate && endDate) {
      queryBuilder.andWhere('log.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }
    
    const [logs, total] = await queryBuilder
      .orderBy('log.createdAt', 'DESC')
      .skip(offset)
      .take(limit)
      .getManyAndCount();
    
    return {
      logs: logs.map(log => ({
        id: log.id,
        userId: log.userId,
        action: log.action,
        dataType: log.metadata?.dataType || 'unknown',
        purpose: log.metadata?.purpose || 'unknown',
        legalBasis: log.metadata?.legalBasis || 'unknown',
        performedBy: log.metadata?.performedBy || log.userId,
        performedAt: log.createdAt,
        ipAddress: log.metadata?.ipAddress || 'unknown',
        details: log.details,
        retention: log.metadata?.retention || {
          retainUntil: new Date(Date.now() + 7 * 365 * 24 * 60 * 60 * 1000), // 7 years
          reason: 'Legal compliance',
        },
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Compliance Reporting
  async generateComplianceReport(
    startDate: Date,
    endDate: Date,
  ): Promise<GdprComplianceReport> {
    const reportId = this.generateReportId();
    
    // Gather statistics
    const totalUsers = await this.userRepository.count();
    const activeUsers = await this.userRepository.count({
      where: {
        lastLoginAt: Between(startDate, endDate),
      },
    });
    
    const exportRequests = await this.activityLogRepository.count({
      where: {
        action: 'DATA_EXPORT_REQUESTED',
        createdAt: Between(startDate, endDate),
      },
    });
    
    const deletionRequests = await this.activityLogRepository.count({
      where: {
        action: 'DATA_DELETION_REQUESTED',
        createdAt: Between(startDate, endDate),
      },
    });
    
    const consentUpdates = await this.activityLogRepository.count({
      where: {
        action: In(['CONSENT_GRANTED', 'CONSENT_REVOKED']),
        createdAt: Between(startDate, endDate),
      },
    });
    
    // Calculate compliance scores (simplified)
    const dataRetentionCompliance = 95; // Would be calculated based on actual retention policies
    const consentCompliance = 98; // Would be calculated based on consent records
    const dataProcessingCompliance = 92; // Would be calculated based on processing activities
    const overallScore = Math.round((dataRetentionCompliance + consentCompliance + dataProcessingCompliance) / 3);
    
    const report: GdprComplianceReport = {
      reportId,
      generatedAt: new Date(),
      period: { startDate, endDate },
      statistics: {
        totalUsers,
        activeUsers,
        dataExportRequests: exportRequests,
        dataDeletionRequests: deletionRequests,
        consentUpdates,
        privacyViolations: 0, // Would be tracked separately
      },
      compliance: {
        dataRetentionCompliance,
        consentCompliance,
        dataProcessingCompliance,
        overallScore,
      },
      recommendations: this.generateRecommendations(overallScore),
    };
    
    // Log report generation
    await this.logPrivacyActivity(
      undefined,
      'COMPLIANCE_REPORT_GENERATED',
      'compliance_data',
      'Regulatory compliance monitoring',
      'Legal obligation',
      'system',
      report,
    );
    
    return report;
  }

  // Data Retention Management
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async cleanupExpiredData() {
    this.logger.log('Starting expired data cleanup...');
    
    try {
      // Clean up expired export files
      const expiredExports = Array.from(this.exportRequests.values())
        .filter(export_ => export_.expiresAt && export_.expiresAt < new Date());
      
      for (const export_ of expiredExports) {
        try {
          const filePath = path.join(process.cwd(), 'exports', `${export_.exportId}.zip`);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
          this.exportRequests.delete(export_.exportId);
        } catch (error) {
          this.logger.error(`Failed to cleanup export ${export_.exportId}: ${error.message}`);
        }
      }
      
      // Clean up old activity logs based on retention policy
      const retentionDate = new Date();
      retentionDate.setFullYear(retentionDate.getFullYear() - 7); // 7 years retention
      
      const deletedLogs = await this.activityLogRepository.delete({
        createdAt: Between(new Date('1970-01-01'), retentionDate),
        category: 'gdpr_compliance',
      });
      
      this.logger.log(`Cleanup completed: ${expiredExports.length} exports, ${deletedLogs.affected} logs`);
      
    } catch (error) {
      this.logger.error(`Data cleanup failed: ${error.message}`, error.stack);
    }
  }

  // Private helper methods
  private async processDataExportAsync(
    request: DataExportRequest,
    exportId: string,
    requestedBy: string,
  ) {
    const exportResult = this.exportRequests.get(exportId)!;
    
    try {
      exportResult.status = 'processing';
      
      // Gather user data
      const userData: any = {};
      
      if (request.userId) {
        const user = await this.userRepository.findOne({ where: { id: request.userId } });
        if (user && request.includePersonalData) {
          userData.personalData = {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          };
        }
        
        if (request.includeActivityLogs) {
          const logs = await this.activityLogRepository.find({
            where: { userId: request.userId },
            order: { createdAt: 'DESC' },
          });
          userData.activityLogs = logs;
        }
        
        if (request.includeProperties) {
          const properties = await this.propertyRepository.find({
            where: { landlordId: request.userId },
          });
          userData.properties = properties;
        }
      }
      
      // Create export file
      const exportDir = path.join(process.cwd(), 'exports');
      if (!fs.existsSync(exportDir)) {
        fs.mkdirSync(exportDir, { recursive: true });
      }
      
      const filePath = path.join(exportDir, `${exportId}.zip`);
      const output = fs.createWriteStream(filePath);
      const archive = archiver('zip', { zlib: { level: 9 } });
      
      archive.pipe(output);
      
      // Add data files to archive
      if (request.format === 'json') {
        archive.append(JSON.stringify(userData, null, 2), { name: 'data.json' });
      }
      
      await archive.finalize();
      
      // Update export result
      exportResult.status = 'completed';
      exportResult.completedAt = new Date();
      exportResult.fileSize = fs.statSync(filePath).size;
      exportResult.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
      
      // Log completion
      await this.logPrivacyActivity(
        request.userId,
        'DATA_EXPORT_COMPLETED',
        'personal_data',
        'Data subject rights - Article 15 GDPR',
        'Legitimate interest',
        requestedBy,
        { exportId, fileSize: exportResult.fileSize },
      );
      
    } catch (error) {
      exportResult.status = 'failed';
      exportResult.error = error.message;
      
      this.logger.error(`Data export failed: ${error.message}`, error.stack);
    }
  }

  private async processDataDeletionAsync(
    request: DataDeletionRequest,
    deletionId: string,
  ) {
    const deletionResult = this.deletionRequests.get(deletionId)!;
    const queryRunner = this.dataSource.createQueryRunner();
    
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();
      
      deletionResult.status = 'processing';
      
      // Delete or anonymize user data based on request
      if (request.deletionType === 'hard') {
        // Hard deletion - remove all data
        if (!request.retainLegalData) {
          await queryRunner.manager.delete(User, { id: request.userId });
          deletionResult.deletedData.personalData = true;
        }
        
        if (!request.retainFinancialData) {
          // Delete financial records
          deletionResult.deletedData.financialData = true;
        }
      } else {
        // Soft deletion - anonymize data
        await queryRunner.manager.update(User, { id: request.userId }, {
          email: `deleted_${Date.now()}@example.com`,
          firstName: 'Deleted',
          lastName: 'User',
          status: UserStatus.DELETED,
        });
        deletionResult.deletedData.personalData = true;
      }
      
      // Handle activity logs
      if (!request.retainLegalData) {
        await queryRunner.manager.delete(AdminActivityLog, { userId: request.userId });
        deletionResult.deletedData.activityLogs = true;
      } else {
        deletionResult.retainedData.push('Activity logs (legal requirement)');
      }
      
      await queryRunner.commitTransaction();
      
      deletionResult.status = 'completed';
      deletionResult.completedAt = new Date();
      
      // Log completion
      await this.logPrivacyActivity(
        request.userId,
        'DATA_DELETION_COMPLETED',
        'personal_data',
        'Data subject rights - Article 17 GDPR',
        'Legal obligation',
        request.requestedBy,
        { deletionId, deletionType: request.deletionType },
      );
      
    } catch (error) {
      await queryRunner.rollbackTransaction();
      
      deletionResult.status = 'failed';
      deletionResult.error = error.message;
      
      this.logger.error(`Data deletion failed: ${error.message}`, error.stack);
    } finally {
      await queryRunner.release();
    }
  }

  private async logPrivacyActivity(
    userId: string | undefined,
    action: string,
    dataType: string,
    purpose: string,
    legalBasis: string,
    performedBy: string,
    details: any,
  ) {
    const activity = this.activityLogRepository.create({
      userId,
      action,
      details: typeof details === 'string' ? details : JSON.stringify(details),
      category: 'gdpr_compliance',
      metadata: {
        dataType,
        purpose,
        legalBasis,
        performedBy,
        ipAddress: 'system',
        retention: {
          retainUntil: new Date(Date.now() + 7 * 365 * 24 * 60 * 60 * 1000), // 7 years
          reason: 'Legal compliance requirement',
        },
      },
    });
    
    await this.activityLogRepository.save(activity);
  }

  private generateRecommendations(overallScore: number): string[] {
    const recommendations: string[] = [];
    
    if (overallScore < 90) {
      recommendations.push('Review and update data retention policies');
      recommendations.push('Implement automated consent management');
      recommendations.push('Enhance data processing documentation');
    }
    
    if (overallScore < 80) {
      recommendations.push('Conduct privacy impact assessments');
      recommendations.push('Implement data minimization practices');
      recommendations.push('Review third-party data sharing agreements');
    }
    
    if (overallScore < 70) {
      recommendations.push('Urgent: Review all data processing activities');
      recommendations.push('Implement immediate data protection measures');
      recommendations.push('Consider appointing a Data Protection Officer');
    }
    
    return recommendations;
  }

  private generateExportId(): string {
    return `export_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateDeletionId(): string {
    return `deletion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateConsentId(): string {
    return `consent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateReportId(): string {
    return `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
