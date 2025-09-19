import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import {
  MaintenanceRequest,
  MaintenanceRequestStatus,
  MaintenanceRequestPriority,
  MaintenanceRequestCategory,
} from './entities/maintenance-request.entity';
import {
  Contractor,
  ContractorStatus,
  ContractorType,
} from './entities/contractor.entity';
import {
  WorkOrder,
  WorkOrderStatus,
  WorkOrderPriority,
} from './entities/work-order.entity';
import {
  CreateMaintenanceRequestDto,
  UpdateMaintenanceRequestDto,
  CreateContractorDto,
  UpdateContractorDto,
  CreateWorkOrderDto,
  UpdateWorkOrderDto,
} from './dto';

@Injectable()
export class MaintenanceService {
  constructor(
    @InjectRepository(MaintenanceRequest)
    private maintenanceRequestRepository: Repository<MaintenanceRequest>,
    @InjectRepository(Contractor)
    private contractorRepository: Repository<Contractor>,
    @InjectRepository(WorkOrder)
    private workOrderRepository: Repository<WorkOrder>,
  ) {}

  // Maintenance Request Methods
  async createMaintenanceRequest(
    createMaintenanceRequestDto: CreateMaintenanceRequestDto,
    requestedById: string,
  ): Promise<MaintenanceRequest> {
    const { assignedTo, ...restDto } = createMaintenanceRequestDto;
    const maintenanceRequest = this.maintenanceRequestRepository.create({
      ...restDto,
      requestedById,
      assignedToId: assignedTo,
    });
    return this.maintenanceRequestRepository.save(maintenanceRequest);
  }

  async findAllMaintenanceRequests(): Promise<MaintenanceRequest[]> {
    return this.maintenanceRequestRepository.find({
      relations: ['requestedBy', 'assignedTo', 'property', 'workOrders'],
      order: { createdAt: 'DESC' },
    });
  }

  async findMaintenanceRequestById(id: string): Promise<MaintenanceRequest> {
    const maintenanceRequest = await this.maintenanceRequestRepository.findOne({
      where: { id },
      relations: ['requestedBy', 'assignedTo', 'property', 'workOrders'],
    });
    if (!maintenanceRequest) {
      throw new NotFoundException(`Maintenance request with ID ${id} not found`);
    }
    return maintenanceRequest;
  }

  async updateMaintenanceRequest(
    id: string,
    updateMaintenanceRequestDto: UpdateMaintenanceRequestDto,
  ): Promise<MaintenanceRequest> {
    const maintenanceRequest = await this.findMaintenanceRequestById(id);
    Object.assign(maintenanceRequest, updateMaintenanceRequestDto);
    return this.maintenanceRequestRepository.save(maintenanceRequest);
  }

  async deleteMaintenanceRequest(id: string): Promise<void> {
    const result = await this.maintenanceRequestRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Maintenance request with ID ${id} not found`);
    }
  }

  async findMaintenanceRequestsByProperty(propertyId: string): Promise<MaintenanceRequest[]> {
    return this.maintenanceRequestRepository.find({
      where: { propertyId },
      relations: ['requestedBy', 'assignedTo', 'property', 'workOrders'],
      order: { createdAt: 'DESC' },
    });
  }

  async findMaintenanceRequestsByUser(userId: string): Promise<MaintenanceRequest[]> {
    return this.maintenanceRequestRepository.find({
      where: [{ requestedById: userId }, { assignedToId: userId }],
      relations: ['requestedBy', 'assignedTo', 'property', 'workOrders'],
      order: { createdAt: 'DESC' },
    });
  }

  async findMaintenanceRequestsByStatus(status: MaintenanceRequestStatus): Promise<MaintenanceRequest[]> {
    return this.maintenanceRequestRepository.find({
      where: { status },
      relations: ['requestedBy', 'assignedTo', 'property', 'workOrders'],
      order: { createdAt: 'DESC' },
    });
  }

  async findMaintenanceRequestsByPriority(priority: MaintenanceRequestPriority): Promise<MaintenanceRequest[]> {
    return this.maintenanceRequestRepository.find({
      where: { priority },
      relations: ['requestedBy', 'assignedTo', 'property', 'workOrders'],
      order: { createdAt: 'DESC' },
    });
  }

  async findMaintenanceRequestsByCategory(category: MaintenanceRequestCategory): Promise<MaintenanceRequest[]> {
    return this.maintenanceRequestRepository.find({
      where: { category },
      relations: ['requestedBy', 'assignedTo', 'property', 'workOrders'],
      order: { createdAt: 'DESC' },
    });
  }

  async findMaintenanceRequestsByDateRange(
    startDate: string,
    endDate: string,
  ): Promise<MaintenanceRequest[]> {
    return this.maintenanceRequestRepository.find({
      where: {
        createdAt: Between(new Date(startDate), new Date(endDate)),
      },
      relations: ['requestedBy', 'assignedTo', 'property', 'workOrders'],
      order: { createdAt: 'DESC' },
    });
  }

  async assignMaintenanceRequest(id: string, assignedToId: string): Promise<MaintenanceRequest> {
    const maintenanceRequest = await this.findMaintenanceRequestById(id);
    maintenanceRequest.assignedToId = assignedToId;
    maintenanceRequest.status = MaintenanceRequestStatus.APPROVED;
    return this.maintenanceRequestRepository.save(maintenanceRequest);
  }

  async approveMaintenanceRequest(id: string): Promise<MaintenanceRequest> {
    const maintenanceRequest = await this.findMaintenanceRequestById(id);
    maintenanceRequest.status = MaintenanceRequestStatus.APPROVED;
    maintenanceRequest.acknowledgedAt = new Date();
    return this.maintenanceRequestRepository.save(maintenanceRequest);
  }

  async completeMaintenanceRequest(id: string): Promise<MaintenanceRequest> {
    const maintenanceRequest = await this.findMaintenanceRequestById(id);
    maintenanceRequest.status = MaintenanceRequestStatus.COMPLETED;
    maintenanceRequest.completedAt = new Date();
    return this.maintenanceRequestRepository.save(maintenanceRequest);
  }

  async cancelMaintenanceRequest(id: string, reason: string): Promise<MaintenanceRequest> {
    const maintenanceRequest = await this.findMaintenanceRequestById(id);
    maintenanceRequest.status = MaintenanceRequestStatus.CANCELLED;
    maintenanceRequest.cancelledAt = new Date();
    maintenanceRequest.cancellationReason = reason;
    return this.maintenanceRequestRepository.save(maintenanceRequest);
  }

  // Contractor Methods
  async createContractor(createContractorDto: CreateContractorDto): Promise<Contractor> {
    const contractor = this.contractorRepository.create(createContractorDto);
    return this.contractorRepository.save(contractor);
  }

  async findAllContractors(): Promise<Contractor[]> {
    return this.contractorRepository.find({
      relations: ['workOrders'],
      order: { name: 'ASC' },
    });
  }

  async findContractorById(id: string): Promise<Contractor> {
    const contractor = await this.contractorRepository.findOne({
      where: { id },
      relations: ['workOrders'],
    });
    if (!contractor) {
      throw new NotFoundException(`Contractor with ID ${id} not found`);
    }
    return contractor;
  }

  async updateContractor(
    id: string,
    updateContractorDto: UpdateContractorDto,
  ): Promise<Contractor> {
    const contractor = await this.findContractorById(id);
    Object.assign(contractor, updateContractorDto);
    return this.contractorRepository.save(contractor);
  }

  async deleteContractor(id: string): Promise<void> {
    const result = await this.contractorRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Contractor with ID ${id} not found`);
    }
  }

  async findContractorsByType(type: ContractorType): Promise<Contractor[]> {
    return this.contractorRepository.find({
      where: { type },
      relations: ['workOrders'],
      order: { name: 'ASC' },
    });
  }

  async findContractorsByStatus(status: ContractorStatus): Promise<Contractor[]> {
    return this.contractorRepository.find({
      where: { status },
      relations: ['workOrders'],
      order: { name: 'ASC' },
    });
  }

  async findContractorsBySpecialty(specialty: string): Promise<Contractor[]> {
    return this.contractorRepository
      .createQueryBuilder('contractor')
      .where(':specialty = ANY(contractor.specialties)', { specialty })
      .leftJoinAndSelect('contractor.workOrders', 'workOrders')
      .orderBy('contractor.name', 'ASC')
      .getMany();
  }

  async findAvailableContractors(): Promise<Contractor[]> {
    return this.contractorRepository.find({
      where: { status: ContractorStatus.ACTIVE },
      relations: ['workOrders'],
      order: { rating: 'DESC' },
    });
  }

  async approveContractor(id: string): Promise<Contractor> {
    const contractor = await this.findContractorById(id);
    contractor.status = ContractorStatus.ACTIVE;
    contractor.approvedAt = new Date();
    return this.contractorRepository.save(contractor);
  }

  async suspendContractor(id: string): Promise<Contractor> {
    const contractor = await this.findContractorById(id);
    contractor.status = ContractorStatus.SUSPENDED;
    return this.contractorRepository.save(contractor);
  }

  async updateContractorRating(id: string, rating: number): Promise<Contractor> {
    const contractor = await this.findContractorById(id);
    const totalRatings = contractor.totalRatings || 0;
    const currentRating = contractor.rating || 0;
    
    const newTotalRatings = totalRatings + 1;
    const newRating = ((currentRating * totalRatings) + rating) / newTotalRatings;
    
    contractor.rating = Math.round(newRating * 100) / 100; // Round to 2 decimal places
    contractor.totalRatings = newTotalRatings;
    
    return this.contractorRepository.save(contractor);
  }

  // Work Order Methods
  async createWorkOrder(
    createWorkOrderDto: CreateWorkOrderDto,
    createdBy: string,
  ): Promise<WorkOrder> {
    const workOrder = this.workOrderRepository.create({
      ...createWorkOrderDto,
      createdBy,
    });
    return this.workOrderRepository.save(workOrder);
  }

  async findAllWorkOrders(): Promise<WorkOrder[]> {
    return this.workOrderRepository.find({
      relations: ['maintenanceRequest', 'contractor', 'creator', 'approver'],
      order: { createdAt: 'DESC' },
    });
  }

  async findWorkOrderById(id: string): Promise<WorkOrder> {
    const workOrder = await this.workOrderRepository.findOne({
      where: { id },
      relations: ['maintenanceRequest', 'contractor', 'creator', 'approver'],
    });
    if (!workOrder) {
      throw new NotFoundException(`Work order with ID ${id} not found`);
    }
    return workOrder;
  }

  async updateWorkOrder(
    id: string,
    updateWorkOrderDto: UpdateWorkOrderDto,
  ): Promise<WorkOrder> {
    const workOrder = await this.findWorkOrderById(id);
    Object.assign(workOrder, updateWorkOrderDto);
    return this.workOrderRepository.save(workOrder);
  }

  async deleteWorkOrder(id: string): Promise<void> {
    const result = await this.workOrderRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Work order with ID ${id} not found`);
    }
  }

  async findWorkOrdersByContractor(contractorId: string): Promise<WorkOrder[]> {
    return this.workOrderRepository.find({
      where: { contractorId },
      relations: ['maintenanceRequest', 'contractor', 'creator', 'approver'],
      order: { createdAt: 'DESC' },
    });
  }

  async findWorkOrdersByMaintenanceRequest(maintenanceRequestId: string): Promise<WorkOrder[]> {
    return this.workOrderRepository.find({
      where: { maintenanceRequestId },
      relations: ['maintenanceRequest', 'contractor', 'creator', 'approver'],
      order: { createdAt: 'DESC' },
    });
  }

  async findWorkOrdersByStatus(status: WorkOrderStatus): Promise<WorkOrder[]> {
    return this.workOrderRepository.find({
      where: { status },
      relations: ['maintenanceRequest', 'contractor', 'creator', 'approver'],
      order: { createdAt: 'DESC' },
    });
  }

  async findWorkOrdersByPriority(priority: WorkOrderPriority): Promise<WorkOrder[]> {
    return this.workOrderRepository.find({
      where: { priority },
      relations: ['maintenanceRequest', 'contractor', 'creator', 'approver'],
      order: { createdAt: 'DESC' },
    });
  }

  async findWorkOrdersByDateRange(
    startDate: string,
    endDate: string,
  ): Promise<WorkOrder[]> {
    return this.workOrderRepository.find({
      where: {
        createdAt: Between(new Date(startDate), new Date(endDate)),
      },
      relations: ['maintenanceRequest', 'contractor', 'creator', 'approver'],
      order: { createdAt: 'DESC' },
    });
  }

  async assignWorkOrder(id: string, contractorId: string): Promise<WorkOrder> {
    const workOrder = await this.findWorkOrderById(id);
    workOrder.contractorId = contractorId;
    workOrder.status = WorkOrderStatus.ASSIGNED;
    workOrder.assignedAt = new Date();
    return this.workOrderRepository.save(workOrder);
  }

  async acceptWorkOrder(id: string): Promise<WorkOrder> {
    const workOrder = await this.findWorkOrderById(id);
    if (workOrder.status !== WorkOrderStatus.ASSIGNED) {
      throw new BadRequestException('Work order must be assigned before it can be accepted');
    }
    workOrder.status = WorkOrderStatus.ACCEPTED;
    workOrder.acceptedAt = new Date();
    return this.workOrderRepository.save(workOrder);
  }

  async startWorkOrder(id: string): Promise<WorkOrder> {
    const workOrder = await this.findWorkOrderById(id);
    if (workOrder.status !== WorkOrderStatus.ACCEPTED) {
      throw new BadRequestException('Work order must be accepted before it can be started');
    }
    workOrder.status = WorkOrderStatus.IN_PROGRESS;
    workOrder.actualStartDate = new Date();
    return this.workOrderRepository.save(workOrder);
  }

  async completeWorkOrder(id: string): Promise<WorkOrder> {
    const workOrder = await this.findWorkOrderById(id);
    if (workOrder.status !== WorkOrderStatus.IN_PROGRESS) {
      throw new BadRequestException('Work order must be in progress before it can be completed');
    }
    workOrder.status = WorkOrderStatus.COMPLETED;
    workOrder.actualEndDate = new Date();
    return this.workOrderRepository.save(workOrder);
  }

  async cancelWorkOrder(id: string, reason: string): Promise<WorkOrder> {
    const workOrder = await this.findWorkOrderById(id);
    workOrder.status = WorkOrderStatus.CANCELLED;
    workOrder.cancelledAt = new Date();
    workOrder.cancellationReason = reason;
    return this.workOrderRepository.save(workOrder);
  }

  // Dashboard and Analytics Methods
  async getMaintenanceDashboard(): Promise<any> {
    const [totalRequests, pendingRequests, inProgressRequests, completedRequests] = await Promise.all([
      this.maintenanceRequestRepository.count(),
      this.maintenanceRequestRepository.count({ where: { status: MaintenanceRequestStatus.PENDING } }),
      this.maintenanceRequestRepository.count({ where: { status: MaintenanceRequestStatus.IN_PROGRESS } }),
      this.maintenanceRequestRepository.count({ where: { status: MaintenanceRequestStatus.COMPLETED } }),
    ]);

    const [totalWorkOrders, activeWorkOrders, completedWorkOrders] = await Promise.all([
      this.workOrderRepository.count(),
      this.workOrderRepository.count({ where: { status: In([WorkOrderStatus.ASSIGNED, WorkOrderStatus.ACCEPTED, WorkOrderStatus.IN_PROGRESS]) } }),
      this.workOrderRepository.count({ where: { status: WorkOrderStatus.COMPLETED } }),
    ]);

    const [totalContractors, activeContractors] = await Promise.all([
      this.contractorRepository.count(),
      this.contractorRepository.count({ where: { status: ContractorStatus.ACTIVE } }),
    ]);

    return {
      maintenanceRequests: {
        total: totalRequests,
        pending: pendingRequests,
        inProgress: inProgressRequests,
        completed: completedRequests,
      },
      workOrders: {
        total: totalWorkOrders,
        active: activeWorkOrders,
        completed: completedWorkOrders,
      },
      contractors: {
        total: totalContractors,
        active: activeContractors,
      },
    };
  }

  async getMaintenanceAnalytics(startDate: string, endDate: string): Promise<any> {
    const dateRange = {
      createdAt: Between(new Date(startDate), new Date(endDate)),
    };

    const requestsByCategory = await this.maintenanceRequestRepository
      .createQueryBuilder('request')
      .select('request.category', 'category')
      .addSelect('COUNT(*)', 'count')
      .where(dateRange)
      .groupBy('request.category')
      .getRawMany();

    const requestsByPriority = await this.maintenanceRequestRepository
      .createQueryBuilder('request')
      .select('request.priority', 'priority')
      .addSelect('COUNT(*)', 'count')
      .where(dateRange)
      .groupBy('request.priority')
      .getRawMany();

    const averageCompletionTime = await this.maintenanceRequestRepository
      .createQueryBuilder('request')
      .select('AVG(EXTRACT(EPOCH FROM (request.completedAt - request.createdAt)))', 'avgTime')
      .where('request.completedAt IS NOT NULL')
      .andWhere(dateRange)
      .getRawOne();

    return {
      requestsByCategory,
      requestsByPriority,
      averageCompletionTimeHours: averageCompletionTime?.avgTime ? Math.round(averageCompletionTime.avgTime / 3600) : 0,
    };
  }
}
