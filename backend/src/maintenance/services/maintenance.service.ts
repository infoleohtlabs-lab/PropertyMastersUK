import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThan, MoreThan, In, Like } from 'typeorm';
import {
  MaintenanceRequest,
  MaintenanceRequestStatus,
  MaintenanceRequestPriority,
  MaintenanceRequestType,
  MaintenanceRequestCategory,
} from '../entities/maintenance-request.entity';
import {
  MaintenanceSchedule,
  MaintenanceScheduleStatus,
  MaintenanceScheduleFrequency,
  MaintenanceScheduleType,
  MaintenanceSchedulePriority,
} from '../entities/maintenance-schedule.entity';

// DTOs
export interface CreateMaintenanceRequestDto {
  tenantOrganizationId: string;
  title: string;
  description: string;
  type: MaintenanceRequestType;
  priority: MaintenanceRequestPriority;
  category: MaintenanceRequestCategory;
  propertyId: string;
  requestedById: string;
  location?: string;
  unitNumber?: string;
  room?: string;
  floor?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  bestTimeToContact?: string;
  dueDate?: Date;
  preferredStartDate?: Date;
  preferredCompletionDate?: Date;
  requiresAccess?: boolean;
  accessInstructions?: string;
  keyLocation?: string;
  tenantPresent?: boolean;
  petInformation?: string;
  estimatedCost?: number;
  requiresApproval?: boolean;
  approvalThreshold?: number;
  isEmergency?: boolean;
  safetyConcerns?: string;
  requiresUtilityShutoff?: boolean;
  utilityShutoffDetails?: string;
  beforePhotos?: string[];
  attachments?: string[];
  notificationPreferences?: string[];
  metadata?: Record<string, any>;
  tags?: string[];
  customFields?: Record<string, any>;
}

export interface UpdateMaintenanceRequestDto {
  title?: string;
  description?: string;
  type?: MaintenanceRequestType;
  priority?: MaintenanceRequestPriority;
  category?: MaintenanceRequestCategory;
  status?: MaintenanceRequestStatus;
  assignedToId?: string;
  location?: string;
  unitNumber?: string;
  room?: string;
  floor?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  bestTimeToContact?: string;
  dueDate?: Date;
  preferredStartDate?: Date;
  preferredCompletionDate?: Date;
  scheduledStartDate?: Date;
  scheduledCompletionDate?: Date;
  actualStartDate?: Date;
  actualCompletionDate?: Date;
  requiresAccess?: boolean;
  accessInstructions?: string;
  keyLocation?: string;
  tenantPresent?: boolean;
  petInformation?: string;
  estimatedCost?: number;
  actualCost?: number;
  requiresApproval?: boolean;
  approvalThreshold?: number;
  isApproved?: boolean;
  approvedById?: string;
  approvalNotes?: string;
  workPerformed?: string;
  materialsUsed?: string;
  partsReplaced?: string;
  laborHours?: number;
  numberOfWorkers?: number;
  contractorCompany?: string;
  contractorContact?: string;
  contractorPhone?: string;
  contractorEmail?: string;
  contractorLicense?: string;
  contractorInsurance?: string;
  qualityRating?: number;
  satisfactionRating?: number;
  tenantFeedback?: string;
  managerNotes?: string;
  requiresFollowUp?: boolean;
  followUpDate?: Date;
  followUpNotes?: string;
  warrantyDays?: number;
  warrantyDetails?: string;
  beforePhotos?: string[];
  afterPhotos?: string[];
  attachments?: string[];
  invoiceAttachments?: string[];
  isEmergency?: boolean;
  safetyConcerns?: string;
  safetyMeasures?: string;
  requiresUtilityShutoff?: boolean;
  utilityShutoffDetails?: string;
  tenantNotified?: boolean;
  notificationPreferences?: string[];
  isOnHold?: boolean;
  holdReason?: string;
  isCancelled?: boolean;
  cancellationReason?: string;
  cancelledById?: string;
  metadata?: Record<string, any>;
  tags?: string[];
  customFields?: Record<string, any>;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface CreateMaintenanceScheduleDto {
  tenantOrganizationId: string;
  name: string;
  description: string;
  type: MaintenanceScheduleType;
  priority: MaintenanceSchedulePriority;
  propertyId: string;
  createdById: string;
  assignedToId?: string;
  frequency: MaintenanceScheduleFrequency;
  customInterval?: number;
  customFrequencyUnit?: string;
  startDate: Date;
  endDate?: Date;
  advanceNoticeDays?: number;
  preferredTime?: string;
  preferredDaysOfWeek?: string[];
  estimatedDuration?: number;
  location?: string;
  unitNumber?: string;
  room?: string;
  floor?: string;
  equipment?: string;
  taskInstructions: string;
  requiredTools?: string[];
  requiredMaterials?: string[];
  safetyRequirements?: string;
  checklist?: Array<{ item: string; required: boolean; description?: string }>;
  estimatedCost?: number;
  budgetAllocated?: number;
  requiresApproval?: boolean;
  approvalThreshold?: number;
  preferredContractor?: string;
  contractorInfo?: {
    company?: string;
    contact?: string;
    phone?: string;
    email?: string;
    license?: string;
  };
  canBeHandledInternally?: boolean;
  requiresAccess?: boolean;
  accessInstructions?: string;
  requiresTenantNotification?: boolean;
  tenantNotificationDays?: number;
  requiresUtilityShutoff?: boolean;
  utilityShutoffDetails?: string;
  regulatoryRequirements?: string[];
  complianceStandards?: string[];
  certificationRequirements?: string[];
  documentationRequirements?: string[];
  notificationSettings?: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
    reminderDays: number[];
    escalationDays: number;
  };
  notifyUsers?: string[];
  notifyEmails?: string[];
  seasonalConsiderations?: string[];
  weatherDependencies?: string[];
  temperatureRange?: { min?: number; max?: number; unit: string };
  qualityStandards?: string;
  performanceMetrics?: string[];
  successCriteria?: string;
  escalationRules?: {
    overdueDays: number;
    escalateTo: string;
    escalationMessage: string;
  };
  dependencies?: string[];
  autoCreateRequests?: boolean;
  autoAssignRequests?: boolean;
  integrationSettings?: {
    externalSystemId?: string;
    syncEnabled: boolean;
  };
  metadata?: Record<string, any>;
  tags?: string[];
  customFields?: Record<string, any>;
}

export interface UpdateMaintenanceScheduleDto {
  name?: string;
  description?: string;
  type?: MaintenanceScheduleType;
  priority?: MaintenanceSchedulePriority;
  status?: MaintenanceScheduleStatus;
  assignedToId?: string;
  frequency?: MaintenanceScheduleFrequency;
  customInterval?: number;
  customFrequencyUnit?: string;
  startDate?: Date;
  endDate?: Date;
  nextDueDate?: Date;
  nextScheduledDate?: Date;
  advanceNoticeDays?: number;
  preferredTime?: string;
  preferredDaysOfWeek?: string[];
  estimatedDuration?: number;
  location?: string;
  unitNumber?: string;
  room?: string;
  floor?: string;
  equipment?: string;
  taskInstructions?: string;
  requiredTools?: string[];
  requiredMaterials?: string[];
  safetyRequirements?: string;
  checklist?: Array<{ item: string; required: boolean; description?: string }>;
  estimatedCost?: number;
  budgetAllocated?: number;
  requiresApproval?: boolean;
  approvalThreshold?: number;
  preferredContractor?: string;
  contractorInfo?: {
    company?: string;
    contact?: string;
    phone?: string;
    email?: string;
    license?: string;
  };
  canBeHandledInternally?: boolean;
  requiresAccess?: boolean;
  accessInstructions?: string;
  requiresTenantNotification?: boolean;
  tenantNotificationDays?: number;
  requiresUtilityShutoff?: boolean;
  utilityShutoffDetails?: string;
  regulatoryRequirements?: string[];
  complianceStandards?: string[];
  certificationRequirements?: string[];
  documentationRequirements?: string[];
  notificationSettings?: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
    reminderDays: number[];
    escalationDays: number;
  };
  notifyUsers?: string[];
  notifyEmails?: string[];
  seasonalConsiderations?: string[];
  weatherDependencies?: string[];
  temperatureRange?: { min?: number; max?: number; unit: string };
  qualityStandards?: string;
  performanceMetrics?: string[];
  successCriteria?: string;
  escalationRules?: {
    overdueDays: number;
    escalateTo: string;
    escalationMessage: string;
  };
  dependencies?: string[];
  autoCreateRequests?: boolean;
  autoAssignRequests?: boolean;
  integrationSettings?: {
    externalSystemId?: string;
    syncEnabled: boolean;
  };
  isActive?: boolean;
  isPaused?: boolean;
  pauseReason?: string;
  pausedById?: string;
  metadata?: Record<string, any>;
  tags?: string[];
  customFields?: Record<string, any>;
}

export interface MaintenanceRequestFilters {
  tenantOrganizationId: string;
  status?: MaintenanceRequestStatus[];
  priority?: MaintenanceRequestPriority[];
  type?: MaintenanceRequestType[];
  category?: MaintenanceRequestCategory[];
  propertyId?: string;
  assignedToId?: string;
  requestedById?: string;
  isEmergency?: boolean;
  isOverdue?: boolean;
  dueDateFrom?: Date;
  dueDateTo?: Date;
  createdFrom?: Date;
  createdTo?: Date;
  tags?: string[];
  search?: string;
}

export interface MaintenanceScheduleFilters {
  tenantOrganizationId: string;
  status?: MaintenanceScheduleStatus[];
  type?: MaintenanceScheduleType[];
  frequency?: MaintenanceScheduleFrequency[];
  propertyId?: string;
  assignedToId?: string;
  isActive?: boolean;
  isPaused?: boolean;
  isOverdue?: boolean;
  nextDueDateFrom?: Date;
  nextDueDateTo?: Date;
  tags?: string[];
  search?: string;
}

export interface MaintenanceDashboardStats {
  totalRequests: number;
  pendingRequests: number;
  inProgressRequests: number;
  completedRequests: number;
  overdueRequests: number;
  emergencyRequests: number;
  totalSchedules: number;
  activeSchedules: number;
  overdueSchedules: number;
  upcomingSchedules: number;
  averageCompletionTime: number;
  averageCost: number;
  satisfactionRating: number;
  requestsByCategory: Record<string, number>;
  requestsByPriority: Record<string, number>;
  requestsByStatus: Record<string, number>;
  schedulesByType: Record<string, number>;
  schedulesByFrequency: Record<string, number>;
  monthlyTrends: Array<{
    month: string;
    requests: number;
    completed: number;
    cost: number;
  }>;
}

@Injectable()
export class MaintenanceService {
  constructor(
    @InjectRepository(MaintenanceRequest)
    private maintenanceRequestRepository: Repository<MaintenanceRequest>,
    @InjectRepository(MaintenanceSchedule)
    private maintenanceScheduleRepository: Repository<MaintenanceSchedule>,
  ) {}

  // Maintenance Request Methods
  async createMaintenanceRequest(dto: CreateMaintenanceRequestDto): Promise<MaintenanceRequest> {
    const referenceNumber = await this.generateReferenceNumber(dto.tenantOrganizationId);
    
    const request = this.maintenanceRequestRepository.create({
      ...dto,
      referenceNumber,
      status: MaintenanceRequestStatus.SUBMITTED,
    });

    const savedRequest = await this.maintenanceRequestRepository.save(request);
    
    // Add to status history
    await this.addStatusHistory(savedRequest.id, MaintenanceRequestStatus.SUBMITTED, dto.requestedById);
    
    return savedRequest;
  }

  async getMaintenanceRequestById(id: string, tenantOrganizationId: string): Promise<MaintenanceRequest> {
    const request = await this.maintenanceRequestRepository.findOne({
      where: { id, tenantOrganizationId },
      relations: [
        'property',
        'requestedBy',
        'assignedTo',
        'approvedBy',
        'cancelledBy',
        'parentRequest',
        'childRequests',
      ],
    });

    if (!request) {
      throw new NotFoundException('Maintenance request not found');
    }

    return request;
  }

  async getMaintenanceRequests(
    filters: MaintenanceRequestFilters,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ requests: MaintenanceRequest[]; total: number }> {
    const queryBuilder = this.maintenanceRequestRepository
      .createQueryBuilder('request')
      .leftJoinAndSelect('request.property', 'property')
      .leftJoinAndSelect('request.requestedBy', 'requestedBy')
      .leftJoinAndSelect('request.assignedTo', 'assignedTo')
      .where('request.tenantOrganizationId = :tenantOrganizationId', {
        tenantOrganizationId: filters.tenantOrganizationId,
      });

    if (filters.status?.length) {
      queryBuilder.andWhere('request.status IN (:...status)', { status: filters.status });
    }

    if (filters.priority?.length) {
      queryBuilder.andWhere('request.priority IN (:...priority)', { priority: filters.priority });
    }

    if (filters.type?.length) {
      queryBuilder.andWhere('request.type IN (:...type)', { type: filters.type });
    }

    if (filters.category?.length) {
      queryBuilder.andWhere('request.category IN (:...category)', { category: filters.category });
    }

    if (filters.propertyId) {
      queryBuilder.andWhere('request.propertyId = :propertyId', { propertyId: filters.propertyId });
    }

    if (filters.assignedToId) {
      queryBuilder.andWhere('request.assignedToId = :assignedToId', { assignedToId: filters.assignedToId });
    }

    if (filters.requestedById) {
      queryBuilder.andWhere('request.requestedById = :requestedById', { requestedById: filters.requestedById });
    }

    if (filters.isEmergency !== undefined) {
      queryBuilder.andWhere('request.isEmergency = :isEmergency', { isEmergency: filters.isEmergency });
    }

    if (filters.isOverdue !== undefined) {
      const now = new Date();
      if (filters.isOverdue) {
        queryBuilder.andWhere('request.dueDate < :now AND request.status NOT IN (:...completedStatuses)', {
          now,
          completedStatuses: [MaintenanceRequestStatus.COMPLETED, MaintenanceRequestStatus.CANCELLED],
        });
      } else {
        queryBuilder.andWhere('(request.dueDate >= :now OR request.status IN (:...completedStatuses))', {
          now,
          completedStatuses: [MaintenanceRequestStatus.COMPLETED, MaintenanceRequestStatus.CANCELLED],
        });
      }
    }

    if (filters.dueDateFrom) {
      queryBuilder.andWhere('request.dueDate >= :dueDateFrom', { dueDateFrom: filters.dueDateFrom });
    }

    if (filters.dueDateTo) {
      queryBuilder.andWhere('request.dueDate <= :dueDateTo', { dueDateTo: filters.dueDateTo });
    }

    if (filters.createdFrom) {
      queryBuilder.andWhere('request.createdAt >= :createdFrom', { createdFrom: filters.createdFrom });
    }

    if (filters.createdTo) {
      queryBuilder.andWhere('request.createdAt <= :createdTo', { createdTo: filters.createdTo });
    }

    if (filters.tags?.length) {
      queryBuilder.andWhere('request.tags && :tags', { tags: filters.tags });
    }

    if (filters.search) {
      queryBuilder.andWhere(
        '(request.title ILIKE :search OR request.description ILIKE :search OR request.referenceNumber ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    queryBuilder.orderBy('request.createdAt', 'DESC');

    const total = await queryBuilder.getCount();
    const requests = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { requests, total };
  }

  async updateMaintenanceRequest(
    id: string,
    tenantOrganizationId: string,
    dto: UpdateMaintenanceRequestDto,
    updatedById: string,
  ): Promise<MaintenanceRequest> {
    const request = await this.getMaintenanceRequestById(id, tenantOrganizationId);
    
    const oldStatus = request.status;
    const oldAssignedTo = request.assignedToId;

    Object.assign(request, dto);
    
    // Handle status change
    if (dto.status && dto.status !== oldStatus) {
      await this.addStatusHistory(id, dto.status, updatedById);
      
      // Update timestamps based on status
      switch (dto.status) {
        case MaintenanceRequestStatus.ACKNOWLEDGED:
          request.acknowledgedAt = new Date();
          break;
        case MaintenanceRequestStatus.ASSIGNED:
          request.assignedAt = new Date();
          break;
        case MaintenanceRequestStatus.IN_PROGRESS:
          request.workStartedAt = new Date();
          if (!request.actualStartDate) {
            request.actualStartDate = new Date();
          }
          break;
        case MaintenanceRequestStatus.COMPLETED:
          request.completedAt = new Date();
          if (!request.actualCompletionDate) {
            request.actualCompletionDate = new Date();
          }
          break;
        case MaintenanceRequestStatus.CANCELLED:
          request.cancelledAt = new Date();
          if (dto.cancelledById) {
            request.cancelledById = dto.cancelledById;
          }
          break;
      }
    }

    // Handle assignment change
    if (dto.assignedToId && dto.assignedToId !== oldAssignedTo) {
      await this.addAssignmentHistory(id, dto.assignedToId, updatedById);
    }

    // Handle approval
    if (dto.isApproved !== undefined) {
      request.approvedAt = dto.isApproved ? new Date() : null;
      if (dto.approvedById) {
        request.approvedById = dto.approvedById;
      }
    }

    // Calculate warranty expiration
    if (dto.warrantyDays && request.completedAt) {
      const warrantyExpires = new Date(request.completedAt);
      warrantyExpires.setDate(warrantyExpires.getDate() + dto.warrantyDays);
      request.warrantyExpiresAt = warrantyExpires;
    }

    return await this.maintenanceRequestRepository.save(request);
  }

  async deleteMaintenanceRequest(id: string, tenantOrganizationId: string): Promise<void> {
    const request = await this.getMaintenanceRequestById(id, tenantOrganizationId);
    await this.maintenanceRequestRepository.remove(request);
  }

  async assignMaintenanceRequest(
    id: string,
    tenantOrganizationId: string,
    assignedToId: string,
    assignedById: string,
  ): Promise<MaintenanceRequest> {
    return await this.updateMaintenanceRequest(
      id,
      tenantOrganizationId,
      {
        assignedToId,
        status: MaintenanceRequestStatus.ASSIGNED,
      },
      assignedById,
    );
  }

  async completeMaintenanceRequest(
    id: string,
    tenantOrganizationId: string,
    completionData: {
      workPerformed: string;
      materialsUsed?: string;
      partsReplaced?: string;
      laborHours?: number;
      actualCost?: number;
      afterPhotos?: string[];
      invoiceAttachments?: string[];
      warrantyDays?: number;
      warrantyDetails?: string;
    },
    completedById: string,
  ): Promise<MaintenanceRequest> {
    return await this.updateMaintenanceRequest(
      id,
      tenantOrganizationId,
      {
        ...completionData,
        status: MaintenanceRequestStatus.COMPLETED,
        actualCompletionDate: new Date(),
      },
      completedById,
    );
  }

  // Maintenance Schedule Methods
  async createMaintenanceSchedule(dto: CreateMaintenanceScheduleDto): Promise<MaintenanceSchedule> {
    const nextDueDate = this.calculateNextDueDate(dto.startDate, dto.frequency, dto.customInterval, dto.customFrequencyUnit);
    
    const schedule = this.maintenanceScheduleRepository.create({
      ...dto,
      nextDueDate,
      status: MaintenanceScheduleStatus.ACTIVE,
      isActive: true,
    });

    return await this.maintenanceScheduleRepository.save(schedule);
  }

  async getMaintenanceScheduleById(id: string, tenantOrganizationId: string): Promise<MaintenanceSchedule> {
    const schedule = await this.maintenanceScheduleRepository.findOne({
      where: { id, tenantOrganizationId },
      relations: [
        'property',
        'createdBy',
        'assignedTo',
        'pausedBy',
        'lastMaintenanceRequest',
        'maintenanceRequests',
      ],
    });

    if (!schedule) {
      throw new NotFoundException('Maintenance schedule not found');
    }

    return schedule;
  }

  async getMaintenanceSchedules(
    filters: MaintenanceScheduleFilters,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ schedules: MaintenanceSchedule[]; total: number }> {
    const queryBuilder = this.maintenanceScheduleRepository
      .createQueryBuilder('schedule')
      .leftJoinAndSelect('schedule.property', 'property')
      .leftJoinAndSelect('schedule.createdBy', 'createdBy')
      .leftJoinAndSelect('schedule.assignedTo', 'assignedTo')
      .where('schedule.tenantOrganizationId = :tenantOrganizationId', {
        tenantOrganizationId: filters.tenantOrganizationId,
      });

    if (filters.status?.length) {
      queryBuilder.andWhere('schedule.status IN (:...status)', { status: filters.status });
    }

    if (filters.type?.length) {
      queryBuilder.andWhere('schedule.type IN (:...type)', { type: filters.type });
    }

    if (filters.frequency?.length) {
      queryBuilder.andWhere('schedule.frequency IN (:...frequency)', { frequency: filters.frequency });
    }

    if (filters.propertyId) {
      queryBuilder.andWhere('schedule.propertyId = :propertyId', { propertyId: filters.propertyId });
    }

    if (filters.assignedToId) {
      queryBuilder.andWhere('schedule.assignedToId = :assignedToId', { assignedToId: filters.assignedToId });
    }

    if (filters.isActive !== undefined) {
      queryBuilder.andWhere('schedule.isActive = :isActive', { isActive: filters.isActive });
    }

    if (filters.isPaused !== undefined) {
      queryBuilder.andWhere('schedule.isPaused = :isPaused', { isPaused: filters.isPaused });
    }

    if (filters.isOverdue !== undefined) {
      const now = new Date();
      if (filters.isOverdue) {
        queryBuilder.andWhere('schedule.nextDueDate < :now AND schedule.isActive = true', { now });
      } else {
        queryBuilder.andWhere('(schedule.nextDueDate >= :now OR schedule.isActive = false)', { now });
      }
    }

    if (filters.nextDueDateFrom) {
      queryBuilder.andWhere('schedule.nextDueDate >= :nextDueDateFrom', { nextDueDateFrom: filters.nextDueDateFrom });
    }

    if (filters.nextDueDateTo) {
      queryBuilder.andWhere('schedule.nextDueDate <= :nextDueDateTo', { nextDueDateTo: filters.nextDueDateTo });
    }

    if (filters.tags?.length) {
      queryBuilder.andWhere('schedule.tags && :tags', { tags: filters.tags });
    }

    if (filters.search) {
      queryBuilder.andWhere(
        '(schedule.name ILIKE :search OR schedule.description ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    queryBuilder.orderBy('schedule.nextDueDate', 'ASC');

    const total = await queryBuilder.getCount();
    const schedules = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { schedules, total };
  }

  async updateMaintenanceSchedule(
    id: string,
    tenantOrganizationId: string,
    dto: UpdateMaintenanceScheduleDto,
  ): Promise<MaintenanceSchedule> {
    const schedule = await this.getMaintenanceScheduleById(id, tenantOrganizationId);
    
    Object.assign(schedule, dto);
    
    // Recalculate next due date if frequency or start date changed
    if (dto.frequency || dto.startDate || dto.customInterval || dto.customFrequencyUnit) {
      schedule.nextDueDate = this.calculateNextDueDate(
        schedule.startDate,
        schedule.frequency,
        schedule.customInterval,
        schedule.customFrequencyUnit,
      );
    }

    // Handle pause/resume
    if (dto.isPaused !== undefined) {
      if (dto.isPaused) {
        schedule.pausedAt = new Date();
        if (dto.pausedById) {
          schedule.pausedById = dto.pausedById;
        }
      } else {
        schedule.pausedAt = null;
        schedule.pausedById = null;
        schedule.pauseReason = null;
      }
    }

    return await this.maintenanceScheduleRepository.save(schedule);
  }

  async deleteMaintenanceSchedule(id: string, tenantOrganizationId: string): Promise<void> {
    const schedule = await this.getMaintenanceScheduleById(id, tenantOrganizationId);
    await this.maintenanceScheduleRepository.remove(schedule);
  }

  async pauseMaintenanceSchedule(
    id: string,
    tenantOrganizationId: string,
    pauseReason: string,
    pausedById: string,
  ): Promise<MaintenanceSchedule> {
    return await this.updateMaintenanceSchedule(id, tenantOrganizationId, {
      isPaused: true,
      pauseReason,
      pausedById,
    });
  }

  async resumeMaintenanceSchedule(
    id: string,
    tenantOrganizationId: string,
  ): Promise<MaintenanceSchedule> {
    return await this.updateMaintenanceSchedule(id, tenantOrganizationId, {
      isPaused: false,
      pauseReason: null,
      pausedById: null,
    });
  }

  // Dashboard and Analytics
  async getMaintenanceDashboard(tenantOrganizationId: string): Promise<MaintenanceDashboardStats> {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get request counts
    const totalRequests = await this.maintenanceRequestRepository.count({
      where: { tenantOrganizationId },
    });

    const pendingRequests = await this.maintenanceRequestRepository.count({
      where: {
        tenantOrganizationId,
        status: In([MaintenanceRequestStatus.SUBMITTED, MaintenanceRequestStatus.ACKNOWLEDGED]),
      },
    });

    const inProgressRequests = await this.maintenanceRequestRepository.count({
      where: {
        tenantOrganizationId,
        status: In([MaintenanceRequestStatus.ASSIGNED, MaintenanceRequestStatus.IN_PROGRESS]),
      },
    });

    const completedRequests = await this.maintenanceRequestRepository.count({
      where: {
        tenantOrganizationId,
        status: MaintenanceRequestStatus.COMPLETED,
      },
    });

    const overdueRequests = await this.maintenanceRequestRepository.count({
      where: {
        tenantOrganizationId,
        dueDate: LessThan(now),
        status: In([
          MaintenanceRequestStatus.SUBMITTED,
          MaintenanceRequestStatus.ACKNOWLEDGED,
          MaintenanceRequestStatus.ASSIGNED,
          MaintenanceRequestStatus.IN_PROGRESS,
        ]),
      },
    });

    const emergencyRequests = await this.maintenanceRequestRepository.count({
      where: {
        tenantOrganizationId,
        isEmergency: true,
        status: In([
          MaintenanceRequestStatus.SUBMITTED,
          MaintenanceRequestStatus.ACKNOWLEDGED,
          MaintenanceRequestStatus.ASSIGNED,
          MaintenanceRequestStatus.IN_PROGRESS,
        ]),
      },
    });

    // Get schedule counts
    const totalSchedules = await this.maintenanceScheduleRepository.count({
      where: { tenantOrganizationId },
    });

    const activeSchedules = await this.maintenanceScheduleRepository.count({
      where: {
        tenantOrganizationId,
        isActive: true,
        status: MaintenanceScheduleStatus.ACTIVE,
      },
    });

    const overdueSchedules = await this.maintenanceScheduleRepository.count({
      where: {
        tenantOrganizationId,
        nextDueDate: LessThan(now),
        isActive: true,
      },
    });

    const upcomingSchedules = await this.maintenanceScheduleRepository.count({
      where: {
        tenantOrganizationId,
        nextDueDate: Between(now, new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)),
        isActive: true,
      },
    });

    // Calculate averages
    const completedRequestsWithData = await this.maintenanceRequestRepository.find({
      where: {
        tenantOrganizationId,
        status: MaintenanceRequestStatus.COMPLETED,
        actualStartDate: MoreThan(new Date(0)),
        actualCompletionDate: MoreThan(new Date(0)),
      },
      select: ['actualStartDate', 'actualCompletionDate', 'actualCost', 'satisfactionRating'],
    });

    let averageCompletionTime = 0;
    let averageCost = 0;
    let satisfactionRating = 0;

    if (completedRequestsWithData.length > 0) {
      const totalCompletionTime = completedRequestsWithData.reduce((sum, request) => {
        if (request.actualStartDate && request.actualCompletionDate) {
          return sum + (request.actualCompletionDate.getTime() - request.actualStartDate.getTime());
        }
        return sum;
      }, 0);
      averageCompletionTime = totalCompletionTime / completedRequestsWithData.length / (1000 * 60 * 60); // Convert to hours

      const totalCost = completedRequestsWithData.reduce((sum, request) => sum + (request.actualCost || 0), 0);
      averageCost = totalCost / completedRequestsWithData.length;

      const totalSatisfaction = completedRequestsWithData.reduce((sum, request) => sum + (request.satisfactionRating || 0), 0);
      satisfactionRating = totalSatisfaction / completedRequestsWithData.length;
    }

    // Get category breakdown
    const requestsByCategory = await this.getRequestCountsByField(tenantOrganizationId, 'category');
    const requestsByPriority = await this.getRequestCountsByField(tenantOrganizationId, 'priority');
    const requestsByStatus = await this.getRequestCountsByField(tenantOrganizationId, 'status');
    const schedulesByType = await this.getScheduleCountsByField(tenantOrganizationId, 'type');
    const schedulesByFrequency = await this.getScheduleCountsByField(tenantOrganizationId, 'frequency');

    // Get monthly trends (placeholder - would need more complex query)
    const monthlyTrends = [];

    return {
      totalRequests,
      pendingRequests,
      inProgressRequests,
      completedRequests,
      overdueRequests,
      emergencyRequests,
      totalSchedules,
      activeSchedules,
      overdueSchedules,
      upcomingSchedules,
      averageCompletionTime,
      averageCost,
      satisfactionRating,
      requestsByCategory,
      requestsByPriority,
      requestsByStatus,
      schedulesByType,
      schedulesByFrequency,
      monthlyTrends,
    };
  }

  // Helper Methods
  private async generateReferenceNumber(tenantOrganizationId: string): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    
    const prefix = `MR-${year}${month}${day}`;
    
    const count = await this.maintenanceRequestRepository.count({
      where: {
        tenantOrganizationId,
        referenceNumber: Like(`${prefix}%`),
      },
    });
    
    const sequence = String(count + 1).padStart(4, '0');
    return `${prefix}-${sequence}`;
  }

  private async addStatusHistory(
    requestId: string,
    status: MaintenanceRequestStatus,
    changedById: string,
    notes?: string,
  ): Promise<void> {
    const request = await this.maintenanceRequestRepository.findOne({
      where: { id: requestId },
      select: ['statusHistory'],
    });

    if (request) {
      const statusHistory = request.statusHistory || [];
      statusHistory.push({
        status,
        timestamp: new Date(),
        changedBy: changedById,
        notes,
      });

      await this.maintenanceRequestRepository.update(requestId, { statusHistory });
    }
  }

  private async addAssignmentHistory(
    requestId: string,
    assignedToId: string,
    assignedById: string,
    notes?: string,
  ): Promise<void> {
    const request = await this.maintenanceRequestRepository.findOne({
      where: { id: requestId },
      select: ['assignmentHistory'],
    });

    if (request) {
      const assignmentHistory = request.assignmentHistory || [];
      assignmentHistory.push({
        assignedTo: assignedToId,
        assignedBy: assignedById,
        timestamp: new Date(),
        notes,
      });

      await this.maintenanceRequestRepository.update(requestId, { assignmentHistory });
    }
  }

  private calculateNextDueDate(
    startDate: Date,
    frequency: MaintenanceScheduleFrequency,
    customInterval?: number,
    customFrequencyUnit?: string,
  ): Date {
    const nextDate = new Date(startDate);

    switch (frequency) {
      case MaintenanceScheduleFrequency.DAILY:
        nextDate.setDate(nextDate.getDate() + 1);
        break;
      case MaintenanceScheduleFrequency.WEEKLY:
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case MaintenanceScheduleFrequency.MONTHLY:
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      case MaintenanceScheduleFrequency.QUARTERLY:
        nextDate.setMonth(nextDate.getMonth() + 3);
        break;
      case MaintenanceScheduleFrequency.SEMI_ANNUALLY:
        nextDate.setMonth(nextDate.getMonth() + 6);
        break;
      case MaintenanceScheduleFrequency.ANNUALLY:
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        break;
      case MaintenanceScheduleFrequency.CUSTOM:
        if (customInterval && customFrequencyUnit) {
          switch (customFrequencyUnit.toLowerCase()) {
            case 'days':
              nextDate.setDate(nextDate.getDate() + customInterval);
              break;
            case 'weeks':
              nextDate.setDate(nextDate.getDate() + customInterval * 7);
              break;
            case 'months':
              nextDate.setMonth(nextDate.getMonth() + customInterval);
              break;
            case 'years':
              nextDate.setFullYear(nextDate.getFullYear() + customInterval);
              break;
          }
        }
        break;
    }

    return nextDate;
  }

  private async getRequestCountsByField(
    tenantOrganizationId: string,
    field: string,
  ): Promise<Record<string, number>> {
    const results = await this.maintenanceRequestRepository
      .createQueryBuilder('request')
      .select(`request.${field}`, 'value')
      .addSelect('COUNT(*)', 'count')
      .where('request.tenantOrganizationId = :tenantOrganizationId', { tenantOrganizationId })
      .groupBy(`request.${field}`)
      .getRawMany();

    return results.reduce((acc, result) => {
      acc[result.value] = parseInt(result.count);
      return acc;
    }, {});
  }

  private async getScheduleCountsByField(
    tenantOrganizationId: string,
    field: string,
  ): Promise<Record<string, number>> {
    const results = await this.maintenanceScheduleRepository
      .createQueryBuilder('schedule')
      .select(`schedule.${field}`, 'value')
      .addSelect('COUNT(*)', 'count')
      .where('schedule.tenantOrganizationId = :tenantOrganizationId', { tenantOrganizationId })
      .groupBy(`schedule.${field}`)
      .getRawMany();

    return results.reduce((acc, result) => {
      acc[result.value] = parseInt(result.count);
      return acc;
    }, {});
  }
}