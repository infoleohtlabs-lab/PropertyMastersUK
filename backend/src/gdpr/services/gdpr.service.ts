import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import {
  Consent,
  ConsentType,
  ConsentStatus,
  ConsentMethod,
} from '../entities/consent.entity';
import {
  DataProcessingActivity,
  ProcessingPurpose,
  DataCategory,
  ProcessingActivity,
} from '../entities/data-processing-activity.entity';
import {
  DataSubjectRequest,
  RequestType,
  RequestStatus,
  RequestPriority,
  VerificationMethod,
  RejectionReason,
} from '../entities/data-subject-request.entity';

// DTOs
export interface CreateConsentDto {
  userId: string;
  type: ConsentType;
  status: ConsentStatus;
  method: ConsentMethod;
  purpose: string;
  description?: string;
  legalBasis?: string;
  expiresAt?: Date;
  ipAddress?: string;
  userAgent?: string;
  source?: string;
  policyVersion?: string;
  language?: string;
  dataCategories?: string[];
  thirdParties?: string[];
  transferCountries?: string[];
  requiresRenewal?: boolean;
  renewalIntervalDays?: number;
  permissions?: Record<string, boolean>;
  metadata?: Record<string, any>;
  parentConsentId?: string;
  isRequired?: boolean;
  canWithdraw?: boolean;
  hasImpact?: boolean;
  impactDescription?: string;
}

export interface UpdateConsentDto {
  status?: ConsentStatus;
  withdrawalReason?: string;
  permissions?: Record<string, boolean>;
  metadata?: Record<string, any>;
}

export interface CreateDataProcessingActivityDto {
  name: string;
  description: string;
  purpose: ProcessingPurpose;
  legalBasis: string;
  legalBasisDetails?: string;
  dataSubjectCategories: string[];
  dataSubjectDescription?: string;
  estimatedDataSubjects?: number;
  dataCategories: DataCategory[];
  dataFields?: string[];
  includesSpecialCategory?: boolean;
  specialCategoryDetails?: string;
  includesCriminalData?: boolean;
  activities: ProcessingActivity[];
  activitiesDescription?: string;
  dataSources?: string[];
  directCollection?: boolean;
  thirdPartySources?: string[];
  recipientCategories?: string[];
  recipients?: string[];
  internationalTransfer?: boolean;
  transferCountries?: string[];
  transferSafeguards?: string;
  transferMechanism?: string;
  retentionPeriodMonths?: number;
  retentionCriteria?: string;
  deletionProcedures?: string;
  securityDescription?: string;
  riskLevel?: number;
  riskAssessment?: string;
  dpiaRequired?: boolean;
  dpiaReference?: string;
  dataController?: string;
  dataProcessor?: string;
  jointControllers?: string[];
  dpoContact?: string;
  reviewFrequencyMonths?: number;
  processingStartDate?: Date;
  metadata?: Record<string, any>;
}

export interface UpdateDataProcessingActivityDto {
  name?: string;
  description?: string;
  purpose?: ProcessingPurpose;
  legalBasis?: string;
  legalBasisDetails?: string;
  dataSubjectCategories?: string[];
  dataSubjectDescription?: string;
  estimatedDataSubjects?: number;
  dataCategories?: DataCategory[];
  dataFields?: string[];
  includesSpecialCategory?: boolean;
  specialCategoryDetails?: string;
  includesCriminalData?: boolean;
  activities?: ProcessingActivity[];
  activitiesDescription?: string;
  dataSources?: string[];
  directCollection?: boolean;
  thirdPartySources?: string[];
  recipientCategories?: string[];
  recipients?: string[];
  internationalTransfer?: boolean;
  transferCountries?: string[];
  transferSafeguards?: string;
  transferMechanism?: string;
  retentionPeriodMonths?: number;
  retentionCriteria?: string;
  deletionProcedures?: string;
  securityDescription?: string;
  riskLevel?: number;
  riskAssessment?: string;
  dpiaRequired?: boolean;
  dpiaReference?: string;
  dataController?: string;
  dataProcessor?: string;
  jointControllers?: string[];
  dpoContact?: string;
  reviewFrequencyMonths?: number;
  processingStartDate?: Date;
  processingEndDate?: Date;
  isActive?: boolean;
  reviewNotes?: string;
  metadata?: Record<string, any>;
}

export interface CreateDataSubjectRequestDto {
  type: RequestType;
  priority?: RequestPriority;
  requesterId?: string;
  requesterName: string;
  requesterEmail: string;
  requesterPhone?: string;
  requesterAddress?: string;
  dateOfBirth?: Date;
  identificationInfo?: string;
  description: string;
  dataCategories?: string[];
  timePeriod?: string;
  systemsInvolved?: string[];
  preferredFormat?: string;
  deliveryMethod?: string;
  legalBasis?: string;
  justification?: string;
  receivedVia?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

export interface UpdateDataSubjectRequestDto {
  status?: RequestStatus;
  priority?: RequestPriority;
  assignedToId?: string;
  responsibleDepartment?: string;
  response?: string;
  actionsTaken?: string;
  dataProvided?: string;
  attachments?: string[];
  isRejected?: boolean;
  rejectionReason?: RejectionReason;
  rejectionExplanation?: string;
  feeCharged?: boolean;
  feeAmount?: number;
  feeCurrency?: string;
  feeJustification?: string;
  feePaid?: boolean;
  isEscalated?: boolean;
  escalationReason?: string;
  hasAppeal?: boolean;
  appealDetails?: string;
  complianceNotes?: string;
  riskAssessment?: string;
  businessImpact?: string;
  identityVerified?: boolean;
  verificationMethod?: string;
  verifiedBy?: string;
  verificationNotes?: string;
  metadata?: Record<string, any>;
}

export interface ConsentFilters {
  userId?: string;
  type?: ConsentType;
  status?: ConsentStatus;
  method?: ConsentMethod;
  fromDate?: Date;
  toDate?: Date;
  requiresRenewal?: boolean;
  isRequired?: boolean;
  canWithdraw?: boolean;
}

export interface DataProcessingActivityFilters {
  purpose?: ProcessingPurpose;
  dataCategories?: DataCategory[];
  includesSpecialCategory?: boolean;
  internationalTransfer?: boolean;
  isActive?: boolean;
  riskLevel?: number;
  dpiaRequired?: boolean;
  reviewDue?: boolean;
}

export interface DataSubjectRequestFilters {
  type?: RequestType;
  status?: RequestStatus;
  priority?: RequestPriority;
  requesterId?: string;
  assignedToId?: string;
  requesterEmail?: string;
  fromDate?: Date;
  toDate?: Date;
  isOverdue?: boolean;
  isEscalated?: boolean;
  hasAppeal?: boolean;
}

@Injectable()
export class GdprService {
  constructor(
    @InjectRepository(Consent)
    private consentRepository: Repository<Consent>,
    @InjectRepository(DataProcessingActivity)
    private dataProcessingActivityRepository: Repository<DataProcessingActivity>,
    @InjectRepository(DataSubjectRequest)
    private dataSubjectRequestRepository: Repository<DataSubjectRequest>,
  ) {}

  // Consent Management
  async createConsent(
    tenantOrganizationId: string,
    createConsentDto: CreateConsentDto,
  ): Promise<Consent> {
    const consent = this.consentRepository.create({
      ...createConsentDto,
      tenantOrganizationId,
      consentGivenAt: new Date(),
    });

    return await this.consentRepository.save(consent);
  }

  async getConsents(
    tenantOrganizationId: string,
    filters: ConsentFilters = {},
    page: number = 1,
    limit: number = 50,
  ): Promise<{ consents: Consent[]; total: number; page: number; totalPages: number }> {
    const queryBuilder = this.consentRepository
      .createQueryBuilder('consent')
      .leftJoinAndSelect('consent.user', 'user')
      .leftJoinAndSelect('consent.parentConsent', 'parentConsent')
      .where('consent.tenantOrganizationId = :tenantOrganizationId', {
        tenantOrganizationId,
      });

    if (filters.userId) {
      queryBuilder.andWhere('consent.userId = :userId', {
        userId: filters.userId,
      });
    }

    if (filters.type) {
      queryBuilder.andWhere('consent.type = :type', { type: filters.type });
    }

    if (filters.status) {
      queryBuilder.andWhere('consent.status = :status', {
        status: filters.status,
      });
    }

    if (filters.method) {
      queryBuilder.andWhere('consent.method = :method', {
        method: filters.method,
      });
    }

    if (filters.fromDate && filters.toDate) {
      queryBuilder.andWhere(
        'consent.consentGivenAt BETWEEN :fromDate AND :toDate',
        {
          fromDate: filters.fromDate,
          toDate: filters.toDate,
        },
      );
    }

    if (filters.requiresRenewal !== undefined) {
      queryBuilder.andWhere('consent.requiresRenewal = :requiresRenewal', {
        requiresRenewal: filters.requiresRenewal,
      });
    }

    if (filters.isRequired !== undefined) {
      queryBuilder.andWhere('consent.isRequired = :isRequired', {
        isRequired: filters.isRequired,
      });
    }

    if (filters.canWithdraw !== undefined) {
      queryBuilder.andWhere('consent.canWithdraw = :canWithdraw', {
        canWithdraw: filters.canWithdraw,
      });
    }

    const total = await queryBuilder.getCount();
    const consents = await queryBuilder
      .orderBy('consent.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      consents,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getConsentById(
    tenantOrganizationId: string,
    consentId: string,
  ): Promise<Consent> {
    const consent = await this.consentRepository.findOne({
      where: { id: consentId, tenantOrganizationId },
      relations: ['user', 'parentConsent'],
    });

    if (!consent) {
      throw new NotFoundException('Consent not found');
    }

    return consent;
  }

  async updateConsent(
    tenantOrganizationId: string,
    consentId: string,
    updateConsentDto: UpdateConsentDto,
  ): Promise<Consent> {
    const consent = await this.getConsentById(tenantOrganizationId, consentId);

    if (updateConsentDto.status === ConsentStatus.WITHDRAWN) {
      consent.withdrawnAt = new Date();
    }

    Object.assign(consent, updateConsentDto);
    return await this.consentRepository.save(consent);
  }

  async withdrawConsent(
    tenantOrganizationId: string,
    consentId: string,
    withdrawalReason?: string,
  ): Promise<Consent> {
    return await this.updateConsent(tenantOrganizationId, consentId, {
      status: ConsentStatus.WITHDRAWN,
      withdrawalReason,
    });
  }

  async getUserConsents(
    tenantOrganizationId: string,
    userId: string,
  ): Promise<Consent[]> {
    return await this.consentRepository.find({
      where: { tenantOrganizationId, userId },
      relations: ['parentConsent'],
      order: { createdAt: 'DESC' },
    });
  }

  // Data Processing Activities
  async createDataProcessingActivity(
    tenantOrganizationId: string,
    createDto: CreateDataProcessingActivityDto,
  ): Promise<DataProcessingActivity> {
    const activity = this.dataProcessingActivityRepository.create({
      ...createDto,
      tenantOrganizationId,
      reviewDate: new Date(
        Date.now() + (createDto.reviewFrequencyMonths || 12) * 30 * 24 * 60 * 60 * 1000,
      ),
    });

    return await this.dataProcessingActivityRepository.save(activity);
  }

  async getDataProcessingActivities(
    tenantOrganizationId: string,
    filters: DataProcessingActivityFilters = {},
    page: number = 1,
    limit: number = 50,
  ): Promise<{
    activities: DataProcessingActivity[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const queryBuilder = this.dataProcessingActivityRepository
      .createQueryBuilder('activity')
      .where('activity.tenantOrganizationId = :tenantOrganizationId', {
        tenantOrganizationId,
      });

    if (filters.purpose) {
      queryBuilder.andWhere('activity.purpose = :purpose', {
        purpose: filters.purpose,
      });
    }

    if (filters.dataCategories && filters.dataCategories.length > 0) {
      queryBuilder.andWhere('activity.dataCategories && :dataCategories', {
        dataCategories: filters.dataCategories,
      });
    }

    if (filters.includesSpecialCategory !== undefined) {
      queryBuilder.andWhere(
        'activity.includesSpecialCategory = :includesSpecialCategory',
        {
          includesSpecialCategory: filters.includesSpecialCategory,
        },
      );
    }

    if (filters.internationalTransfer !== undefined) {
      queryBuilder.andWhere(
        'activity.internationalTransfer = :internationalTransfer',
        {
          internationalTransfer: filters.internationalTransfer,
        },
      );
    }

    if (filters.isActive !== undefined) {
      queryBuilder.andWhere('activity.isActive = :isActive', {
        isActive: filters.isActive,
      });
    }

    if (filters.riskLevel) {
      queryBuilder.andWhere('activity.riskLevel >= :riskLevel', {
        riskLevel: filters.riskLevel,
      });
    }

    if (filters.dpiaRequired !== undefined) {
      queryBuilder.andWhere('activity.dpiaRequired = :dpiaRequired', {
        dpiaRequired: filters.dpiaRequired,
      });
    }

    if (filters.reviewDue) {
      queryBuilder.andWhere('activity.reviewDate <= :now', {
        now: new Date(),
      });
    }

    const total = await queryBuilder.getCount();
    const activities = await queryBuilder
      .orderBy('activity.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      activities,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getDataProcessingActivityById(
    tenantOrganizationId: string,
    activityId: string,
  ): Promise<DataProcessingActivity> {
    const activity = await this.dataProcessingActivityRepository.findOne({
      where: { id: activityId, tenantOrganizationId },
    });

    if (!activity) {
      throw new NotFoundException('Data processing activity not found');
    }

    return activity;
  }

  async updateDataProcessingActivity(
    tenantOrganizationId: string,
    activityId: string,
    updateDto: UpdateDataProcessingActivityDto,
  ): Promise<DataProcessingActivity> {
    const activity = await this.getDataProcessingActivityById(
      tenantOrganizationId,
      activityId,
    );

    Object.assign(activity, updateDto);
    activity.lastReviewDate = new Date();
    activity.version += 1;

    return await this.dataProcessingActivityRepository.save(activity);
  }

  async deleteDataProcessingActivity(
    tenantOrganizationId: string,
    activityId: string,
  ): Promise<void> {
    const result = await this.dataProcessingActivityRepository.delete({
      id: activityId,
      tenantOrganizationId,
    });

    if (result.affected === 0) {
      throw new NotFoundException('Data processing activity not found');
    }
  }

  // Data Subject Requests
  async createDataSubjectRequest(
    tenantOrganizationId: string,
    createDto: CreateDataSubjectRequestDto,
  ): Promise<DataSubjectRequest> {
    const referenceNumber = await this.generateRequestReferenceNumber();
    const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

    const request = this.dataSubjectRequestRepository.create({
      ...createDto,
      tenantOrganizationId,
      referenceNumber,
      dueDate,
    });

    return await this.dataSubjectRequestRepository.save(request);
  }

  async getDataSubjectRequests(
    tenantOrganizationId: string,
    filters: DataSubjectRequestFilters = {},
    page: number = 1,
    limit: number = 50,
  ): Promise<{
    requests: DataSubjectRequest[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const queryBuilder = this.dataSubjectRequestRepository
      .createQueryBuilder('request')
      .leftJoinAndSelect('request.requester', 'requester')
      .leftJoinAndSelect('request.assignedTo', 'assignedTo')
      .where('request.tenantOrganizationId = :tenantOrganizationId', {
        tenantOrganizationId,
      });

    if (filters.type) {
      queryBuilder.andWhere('request.type = :type', { type: filters.type });
    }

    if (filters.status) {
      queryBuilder.andWhere('request.status = :status', {
        status: filters.status,
      });
    }

    if (filters.priority) {
      queryBuilder.andWhere('request.priority = :priority', {
        priority: filters.priority,
      });
    }

    if (filters.requesterId) {
      queryBuilder.andWhere('request.requesterId = :requesterId', {
        requesterId: filters.requesterId,
      });
    }

    if (filters.assignedToId) {
      queryBuilder.andWhere('request.assignedToId = :assignedToId', {
        assignedToId: filters.assignedToId,
      });
    }

    if (filters.requesterEmail) {
      queryBuilder.andWhere('request.requesterEmail ILIKE :requesterEmail', {
        requesterEmail: `%${filters.requesterEmail}%`,
      });
    }

    if (filters.fromDate && filters.toDate) {
      queryBuilder.andWhere(
        'request.createdAt BETWEEN :fromDate AND :toDate',
        {
          fromDate: filters.fromDate,
          toDate: filters.toDate,
        },
      );
    }

    if (filters.isOverdue) {
      queryBuilder.andWhere('request.dueDate < :now', { now: new Date() });
      queryBuilder.andWhere('request.status NOT IN (:...completedStatuses)', {
        completedStatuses: [RequestStatus.COMPLETED, RequestStatus.REJECTED],
      });
    }

    if (filters.isEscalated !== undefined) {
      queryBuilder.andWhere('request.isEscalated = :isEscalated', {
        isEscalated: filters.isEscalated,
      });
    }

    if (filters.hasAppeal !== undefined) {
      queryBuilder.andWhere('request.hasAppeal = :hasAppeal', {
        hasAppeal: filters.hasAppeal,
      });
    }

    const total = await queryBuilder.getCount();
    const requests = await queryBuilder
      .orderBy('request.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      requests,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getDataSubjectRequestById(
    tenantOrganizationId: string,
    requestId: string,
  ): Promise<DataSubjectRequest> {
    const request = await this.dataSubjectRequestRepository.findOne({
      where: { id: requestId, tenantOrganizationId },
      relations: ['requester', 'assignedTo'],
    });

    if (!request) {
      throw new NotFoundException('Data subject request not found');
    }

    return request;
  }

  async updateDataSubjectRequest(
    tenantOrganizationId: string,
    requestId: string,
    updateDto: UpdateDataSubjectRequestDto,
  ): Promise<DataSubjectRequest> {
    const request = await this.getDataSubjectRequestById(
      tenantOrganizationId,
      requestId,
    );

    if (updateDto.status === RequestStatus.COMPLETED) {
      request.completedAt = new Date();
      request.completedOnTime = request.dueDate >= new Date();
      request.daysTaken = Math.ceil(
        (new Date().getTime() - request.createdAt.getTime()) /
          (1000 * 60 * 60 * 24),
      );
    }

    if (updateDto.isRejected) {
      request.rejectedAt = new Date();
    }

    if (updateDto.assignedToId && !request.assignedAt) {
      request.assignedAt = new Date();
    }

    if (updateDto.isEscalated && !request.escalatedAt) {
      request.escalatedAt = new Date();
    }

    Object.assign(request, updateDto);
    return await this.dataSubjectRequestRepository.save(request);
  }

  async verifyDataSubjectIdentity(
    tenantOrganizationId: string,
    requestId: string,
    verificationMethod: VerificationMethod,
    verifiedBy: string,
    verificationNotes?: string,
  ): Promise<DataSubjectRequest> {
    return await this.updateDataSubjectRequest(
      tenantOrganizationId,
      requestId,
      {
        identityVerified: true,
        verificationMethod,
        verifiedBy,
        verificationNotes,
      },
    );
  }

  async deleteDataSubjectRequest(
    tenantOrganizationId: string,
    requestId: string,
  ): Promise<void> {
    const result = await this.dataSubjectRequestRepository.delete({
      id: requestId,
      tenantOrganizationId,
    });

    if (result.affected === 0) {
      throw new NotFoundException('Data subject request not found');
    }
  }

  // Helper methods
  private async generateRequestReferenceNumber(): Promise<string> {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `DSR-${timestamp}-${random}`;
  }

  async getGdprDashboardStats(
    tenantOrganizationId: string,
  ): Promise<{
    totalConsents: number;
    activeConsents: number;
    withdrawnConsents: number;
    expiredConsents: number;
    totalDataProcessingActivities: number;
    activeDataProcessingActivities: number;
    highRiskActivities: number;
    activitiesNeedingReview: number;
    totalDataSubjectRequests: number;
    pendingRequests: number;
    overdueRequests: number;
    completedRequests: number;
  }> {
    const [consents, activities, requests] = await Promise.all([
      this.consentRepository.find({
        where: { tenantOrganizationId },
        select: ['status', 'expiresAt'],
      }),
      this.dataProcessingActivityRepository.find({
        where: { tenantOrganizationId },
        select: ['isActive', 'riskLevel', 'reviewDate'],
      }),
      this.dataSubjectRequestRepository.find({
        where: { tenantOrganizationId },
        select: ['status', 'dueDate', 'completedAt'],
      }),
    ]);

    const now = new Date();

    return {
      totalConsents: consents.length,
      activeConsents: consents.filter(
        (c) => c.status === ConsentStatus.GRANTED,
      ).length,
      withdrawnConsents: consents.filter(
        (c) => c.status === ConsentStatus.WITHDRAWN,
      ).length,
      expiredConsents: consents.filter(
        (c) => c.status === ConsentStatus.EXPIRED || (c.expiresAt && c.expiresAt < now),
      ).length,
      totalDataProcessingActivities: activities.length,
      activeDataProcessingActivities: activities.filter((a) => a.isActive)
        .length,
      highRiskActivities: activities.filter(
        (a) => a.riskLevel && a.riskLevel >= 4,
      ).length,
      activitiesNeedingReview: activities.filter(
        (a) => a.reviewDate && a.reviewDate < now,
      ).length,
      totalDataSubjectRequests: requests.length,
      pendingRequests: requests.filter(
        (r) =>
          ![RequestStatus.COMPLETED, RequestStatus.REJECTED].includes(
            r.status,
          ),
      ).length,
      overdueRequests: requests.filter(
        (r) =>
          r.dueDate < now &&
          ![RequestStatus.COMPLETED, RequestStatus.REJECTED].includes(
            r.status,
          ),
      ).length,
      completedRequests: requests.filter(
        (r) => r.status === RequestStatus.COMPLETED,
      ).length,
    };
  }
}
