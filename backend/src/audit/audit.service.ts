import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { AuditLog, AuditAction, AuditEntityType, AuditSeverity } from './entities/audit-log.entity';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { UpdateAuditLogDto } from './dto/update-audit-log.dto';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  async create(createAuditLogDto: CreateAuditLogDto): Promise<AuditLog> {
    const auditLog = this.auditLogRepository.create({
      ...createAuditLogDto,
      correlationId: createAuditLogDto.correlationId || this.generateCorrelationId(),
    });
    return this.auditLogRepository.save(auditLog);
  }

  async logAction(
    action: AuditAction,
    entityType: AuditEntityType,
    entityId: string,
    actorId: string,
    description: string,
    additionalData?: any
  ): Promise<AuditLog> {
    const auditLog = this.auditLogRepository.create({
      action,
      entityType,
      entityId,
      actorId,
      description,
      severity: this.determineSeverity(action),
      metadata: additionalData,
      correlationId: this.generateCorrelationId(),
      isSystemGenerated: false,
    });
    return this.auditLogRepository.save(auditLog);
  }

  async logSystemAction(
    action: AuditAction,
    entityType: AuditEntityType,
    entityId: string,
    description: string,
    additionalData?: any
  ): Promise<AuditLog> {
    const auditLog = this.auditLogRepository.create({
      action,
      entityType,
      entityId,
      description,
      severity: AuditSeverity.LOW,
      metadata: additionalData,
      correlationId: this.generateCorrelationId(),
      isSystemGenerated: true,
    });
    return this.auditLogRepository.save(auditLog);
  }

  async logSecurityEvent(
    action: AuditAction,
    actorId: string,
    description: string,
    ipAddress?: string,
    userAgent?: string,
    additionalData?: any
  ): Promise<AuditLog> {
    const auditLog = this.auditLogRepository.create({
      action,
      entityType: AuditEntityType.USER,
      entityId: actorId,
      actorId,
      description,
      severity: AuditSeverity.HIGH,
      ipAddress,
      userAgent,
      metadata: additionalData,
      correlationId: this.generateCorrelationId(),
      isSecurityEvent: true,
      riskScore: this.calculateRiskScore(action),
    });
    return this.auditLogRepository.save(auditLog);
  }

  async findAll(filters?: any): Promise<AuditLog[]> {
    const queryBuilder = this.auditLogRepository.createQueryBuilder('audit')
      .leftJoinAndSelect('audit.user', 'user')
      .leftJoinAndSelect('audit.impersonatedBy', 'impersonatedBy');

    if (filters?.actorId) {
      queryBuilder.andWhere('audit.actorId = :actorId', { actorId: filters.actorId });
    }

    if (filters?.entityType) {
      queryBuilder.andWhere('audit.entityType = :entityType', { entityType: filters.entityType });
    }

    if (filters?.entityId) {
      queryBuilder.andWhere('audit.entityId = :entityId', { entityId: filters.entityId });
    }

    if (filters?.action) {
      queryBuilder.andWhere('audit.action = :action', { action: filters.action });
    }

    if (filters?.severity) {
      queryBuilder.andWhere('audit.severity = :severity', { severity: filters.severity });
    }

    if (filters?.isSecurityEvent !== undefined) {
      queryBuilder.andWhere('audit.isSecurityEvent = :isSecurityEvent', { isSecurityEvent: filters.isSecurityEvent });
    }

    if (filters?.isSystemGenerated !== undefined) {
      queryBuilder.andWhere('audit.isSystemGenerated = :isSystemGenerated', { isSystemGenerated: filters.isSystemGenerated });
    }

    if (filters?.businessProcess) {
      queryBuilder.andWhere('audit.businessProcess = :businessProcess', { businessProcess: filters.businessProcess });
    }

    if (filters?.correlationId) {
      queryBuilder.andWhere('audit.correlationId = :correlationId', { correlationId: filters.correlationId });
    }

    if (filters?.ipAddress) {
      queryBuilder.andWhere('audit.ipAddress = :ipAddress', { ipAddress: filters.ipAddress });
    }

    if (filters?.startDate && filters?.endDate) {
      queryBuilder.andWhere('audit.createdAt BETWEEN :startDate AND :endDate', {
        startDate: new Date(filters.startDate),
        endDate: new Date(filters.endDate),
      });
    }

    if (filters?.search) {
      queryBuilder.andWhere(
        '(audit.description ILIKE :search OR audit.endpoint ILIKE :search)',
        { search: `%${filters.search}%` }
      );
    }

    if (filters?.riskScoreMin !== undefined) {
      queryBuilder.andWhere('audit.riskScore >= :riskScoreMin', { riskScoreMin: filters.riskScoreMin });
    }

    if (filters?.riskScoreMax !== undefined) {
      queryBuilder.andWhere('audit.riskScore <= :riskScoreMax', { riskScoreMax: filters.riskScoreMax });
    }

    return queryBuilder
      .orderBy('audit.createdAt', 'DESC')
      .limit(filters?.limit || 100)
      .offset(filters?.offset || 0)
      .getMany();
  }

  async findOne(id: string): Promise<AuditLog> {
    const auditLog = await this.auditLogRepository.findOne({
      where: { id },
      relations: ['user', 'impersonatedBy'],
    });

    if (!auditLog) {
      throw new NotFoundException(`Audit log with ID ${id} not found`);
    }

    return auditLog;
  }

  async findByCorrelationId(correlationId: string): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: { correlationId },
      relations: ['user', 'impersonatedBy'],
      order: { createdAt: 'ASC' },
    });
  }

  async findByEntity(entityType: AuditEntityType, entityId: string): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: { entityType, entityId },
      relations: ['user', 'impersonatedBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async findSecurityEvents(filters?: any): Promise<AuditLog[]> {
    return this.findAll({ ...filters, isSecurityEvent: true });
  }

  async findHighRiskEvents(riskThreshold: number = 7): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: {
        riskScore: riskThreshold,
      },
      relations: ['user', 'impersonatedBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async getAuditStats(filters?: any): Promise<any> {
    const queryBuilder = this.auditLogRepository.createQueryBuilder('audit');

    if (filters?.startDate && filters?.endDate) {
      queryBuilder.andWhere('audit.createdAt BETWEEN :startDate AND :endDate', {
        startDate: new Date(filters.startDate),
        endDate: new Date(filters.endDate),
      });
    }

    if (filters?.actorId) {
      queryBuilder.andWhere('audit.actorId = :actorId', { actorId: filters.actorId });
    }

    const result = await queryBuilder
      .select([
        'COUNT(*) as totalEvents',
        'COUNT(CASE WHEN isSecurityEvent = true THEN 1 END) as securityEvents',
        'COUNT(CASE WHEN severity = \'high\' THEN 1 END) as highSeverityEvents',
        'COUNT(CASE WHEN severity = \'critical\' THEN 1 END) as criticalEvents',
        'COUNT(CASE WHEN isSystemGenerated = true THEN 1 END) as systemGeneratedEvents',
        'COUNT(CASE WHEN riskScore >= 7 THEN 1 END) as highRiskEvents',
        'AVG(riskScore) as averageRiskScore',
        'AVG(responseTime) as averageResponseTime',
      ])
      .getRawOne();

    return {
      totalEvents: parseInt(result.totalEvents),
      securityEvents: parseInt(result.securityEvents),
      highSeverityEvents: parseInt(result.highSeverityEvents),
      criticalEvents: parseInt(result.criticalEvents),
      systemGeneratedEvents: parseInt(result.systemGeneratedEvents),
      highRiskEvents: parseInt(result.highRiskEvents),
      averageRiskScore: parseFloat(result.averageRiskScore) || 0,
      averageResponseTime: parseFloat(result.averageResponseTime) || 0,
    };
  }

  async getActivityTimeline(entityType: AuditEntityType, entityId: string): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: { entityType, entityId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  async update(id: string, updateAuditLogDto: UpdateAuditLogDto): Promise<AuditLog> {
    const auditLog = await this.findOne(id);
    Object.assign(auditLog, updateAuditLogDto);
    return this.auditLogRepository.save(auditLog);
  }

  async markForReview(id: string, reviewedBy: string): Promise<AuditLog> {
    const auditLog = await this.findOne(id);
    auditLog.requiresReview = false;
    auditLog.reviewedById = reviewedBy;
    auditLog.reviewedAt = new Date();
    return this.auditLogRepository.save(auditLog);
  }

  async archiveOldLogs(retentionDays: number = 365): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const result = await this.auditLogRepository
      .createQueryBuilder()
      .update(AuditLog)
      .set({ isArchived: true })
      .where('createdAt < :cutoffDate AND isArchived = false', { cutoffDate })
      .execute();

    return result.affected || 0;
  }

  async deleteArchivedLogs(archiveDays: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - archiveDays);

    const result = await this.auditLogRepository
      .createQueryBuilder()
      .delete()
      .from(AuditLog)
      .where('isArchived = true AND updatedAt < :cutoffDate', { cutoffDate })
      .execute();

    return result.affected || 0;
  }

  private generateCorrelationId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  }

  private determineSeverity(action: AuditAction): AuditSeverity {
    const highSeverityActions = [
      AuditAction.DELETE,
      AuditAction.LOGIN_FAILED,
      AuditAction.PERMISSION_DENIED,
      AuditAction.PASSWORD_CHANGED,
      AuditAction.ROLE_CHANGED,
    ];

    const criticalActions = [
      AuditAction.ACCOUNT_LOCKED,
      AuditAction.SECURITY_BREACH,
      AuditAction.DATA_EXPORT,
    ];

    if (criticalActions.includes(action)) {
      return AuditSeverity.CRITICAL;
    }

    if (highSeverityActions.includes(action)) {
      return AuditSeverity.HIGH;
    }

    return AuditSeverity.MEDIUM;
  }

  private calculateRiskScore(action: AuditAction): number {
    const riskScores = {
      [AuditAction.LOGIN_FAILED]: 8,
      [AuditAction.ACCOUNT_LOCKED]: 9,
      [AuditAction.SECURITY_BREACH]: 10,
      [AuditAction.PERMISSION_DENIED]: 7,
      [AuditAction.PASSWORD_CHANGED]: 6,
      [AuditAction.ROLE_CHANGED]: 8,
      [AuditAction.DATA_EXPORT]: 9,
      [AuditAction.DELETE]: 7,
      [AuditAction.UPDATE]: 4,
      [AuditAction.CREATE]: 3,
      [AuditAction.READ]: 1,
      [AuditAction.LOGIN]: 2,
      [AuditAction.LOGOUT]: 1,
    };

    return riskScores[action] || 3;
  }
}
