import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThan, LessThan } from 'typeorm';
import { Landlord, LandlordStatus } from './entities/landlord.entity';
import { LandlordProperty, PropertyStatus } from './entities/landlord-property.entity';
import { TenancyAgreement, TenancyStatus } from './entities/tenancy-agreement.entity';
import { RentPayment, PaymentStatus } from './entities/rent-payment.entity';
import { MaintenanceRequest, MaintenanceStatus, MaintenancePriority } from './entities/maintenance-request.entity';
import { PropertyInspection, InspectionStatus, InspectionType } from './entities/property-inspection.entity';
import { FinancialReport, ReportType, ReportStatus } from './entities/financial-report.entity';
import { LandlordDocument, DocumentStatus, DocumentType } from './entities/landlord-document.entity';
import { CreateLandlordDto } from './dto/create-landlord.dto';
import { UpdateLandlordDto } from './dto/update-landlord.dto';
import { CreatePropertyDto } from './dto/create-property.dto';
import { CreateTenancyDto } from './dto/create-tenancy.dto';
import { CreateMaintenanceRequestDto } from './dto/create-maintenance-request.dto';
import { ScheduleInspectionDto } from './dto/schedule-inspection.dto';
// import { GenerateReportDto } from './dto/generate-report.dto';
// import { UploadDocumentDto } from './dto/upload-document.dto';

@Injectable()
export class LandlordsService {
  constructor(
    @InjectRepository(Landlord)
    private landlordRepository: Repository<Landlord>,
    @InjectRepository(LandlordProperty)
    private propertyRepository: Repository<LandlordProperty>,
    @InjectRepository(TenancyAgreement)
    private tenancyRepository: Repository<TenancyAgreement>,
    @InjectRepository(RentPayment)
    private rentPaymentRepository: Repository<RentPayment>,
    @InjectRepository(MaintenanceRequest)
    private maintenanceRepository: Repository<MaintenanceRequest>,
    @InjectRepository(PropertyInspection)
    private inspectionRepository: Repository<PropertyInspection>,
    @InjectRepository(FinancialReport)
    private reportRepository: Repository<FinancialReport>,
    @InjectRepository(LandlordDocument)
    private documentRepository: Repository<LandlordDocument>,
  ) {}

  // Landlord Management
  async findAll(filters?: any): Promise<Landlord[]> {
    return this.findAllLandlords();
  }

  async findByUserId(userId: string): Promise<Landlord[]> {
    return this.landlordRepository.find({
      where: { userId, isActive: true },
      relations: ['properties', 'tenancyAgreements', 'rentPayments'],
    });
  }

  async findOne(id: string, user?: any): Promise<Landlord> {
    return this.findLandlordById(id);
  }

  async update(id: string, updateLandlordDto: UpdateLandlordDto, user?: any): Promise<Landlord> {
    return this.updateLandlord(id, updateLandlordDto);
  }

  async remove(id: string): Promise<void> {
    return this.removeLandlord(id);
  }

  async create(createLandlordDto: CreateLandlordDto, userId: string): Promise<Landlord> {
    const landlordData = {
      ...createLandlordDto,
      userId,
    };
    return this.createLandlord(landlordData);
  }

  async createLandlord(createLandlordDto: CreateLandlordDto): Promise<Landlord> {
    const landlord = this.landlordRepository.create({
      ...createLandlordDto,
      status: LandlordStatus.ACTIVE,
      registrationDate: new Date(),
    } as any);

    return this.landlordRepository.save(landlord) as unknown as Landlord;
  }

  async findAllLandlords(): Promise<Landlord[]> {
    return this.landlordRepository.find({
      relations: ['properties', 'tenancyAgreements', 'rentPayments'],
      where: { isActive: true },
    });
  }

  async findLandlordById(id: string): Promise<Landlord> {
    const landlord = await this.landlordRepository.findOne({
      where: { id, isActive: true },
      relations: [
        'properties',
        'tenancyAgreements',
        'rentPayments',
        'maintenanceRequests',
        'propertyInspections',
        'financialReports',
        'documents',
      ],
    });

    if (!landlord) {
      throw new NotFoundException(`Landlord with ID ${id} not found`);
    }

    return landlord;
  }

  async updateLandlord(id: string, updateLandlordDto: UpdateLandlordDto): Promise<Landlord> {
    const landlord = await this.findLandlordById(id);
    Object.assign(landlord, updateLandlordDto);
    return this.landlordRepository.save(landlord);
  }

  async removeLandlord(id: string): Promise<void> {
    const landlord = await this.findLandlordById(id);
    landlord.isActive = false;
    landlord.status = LandlordStatus.INACTIVE;
    await this.landlordRepository.save(landlord);
  }

  // Property Management
  async addProperty(landlordId: string, createPropertyDto: CreatePropertyDto, user?: any): Promise<LandlordProperty> {
    const landlord = await this.findLandlordById(landlordId);
    
    const property = this.propertyRepository.create({
      ...createPropertyDto,
      landlordId,
      status: PropertyStatus.AVAILABLE,
      acquisitionDate: new Date(),
      isActive: true,
    } as any);

    const savedProperty = await this.propertyRepository.save(property) as unknown as LandlordProperty;
    
    // Update landlord statistics
    landlord.totalProperties = (landlord.totalProperties || 0) + 1;
    // landlord.portfolioValue = (landlord.portfolioValue || 0) + (createPropertyDto.purchasePrice || 0);
    await this.landlordRepository.save(landlord);

    return savedProperty;
  }

  async getLandlordProperties(landlordId: string): Promise<LandlordProperty[]> {
    return this.propertyRepository.find({
      where: { landlordId, isActive: true },
      relations: ['tenancyAgreements', 'maintenanceRequests', 'propertyInspections'],
    });
  }

  async updateProperty(landlordId: string, propertyId: string, updateData: any, user?: any): Promise<LandlordProperty> {
    const property = await this.propertyRepository.findOne({
      where: { id: propertyId, isActive: true },
    });

    if (!property) {
      throw new NotFoundException(`Property with ID ${propertyId} not found`);
    }

    Object.assign(property, updateData);
    return this.propertyRepository.save(property);
  }

  // Tenancy Management
  async createTenancy(landlordId: string, createTenancyDto: CreateTenancyDto, user?: any): Promise<TenancyAgreement> {
    const property = await this.propertyRepository.findOne({
      where: { id: createTenancyDto.propertyId, isActive: true },
    });

    if (!property) {
      throw new NotFoundException(`Property with ID ${createTenancyDto.propertyId} not found`);
    }

    const tenancy = this.tenancyRepository.create({
      ...createTenancyDto,
      status: TenancyStatus.ACTIVE,
      createdDate: new Date(),
    } as any);

    const savedTenancy = await this.tenancyRepository.save(tenancy) as unknown as TenancyAgreement;

    // Update property status
    property.status = PropertyStatus.OCCUPIED;
    property.currentTenantId = (savedTenancy as any).tenantId;
    await this.propertyRepository.save(property);

    return savedTenancy;
  }

  async getLandlordTenancies(landlordId: string): Promise<TenancyAgreement[]> {
    return this.tenancyRepository.find({
      where: { landlordId, isActive: true },
      relations: ['property', 'rentPayments'],
      order: { startDate: 'DESC' },
    });
  }

  async getTenancies(landlordId: string, user?: any, filters?: any): Promise<TenancyAgreement[]> {
    return this.getLandlordTenancies(landlordId);
  }

  async endTenancy(landlordId: string, tenancyId: string, endData: any, user?: any): Promise<TenancyAgreement> {
    const tenancy = await this.tenancyRepository.findOne({
      where: { id: tenancyId, isActive: true },
      relations: ['property'],
    });

    if (!tenancy) {
      throw new NotFoundException(`Tenancy with ID ${tenancyId} not found`);
    }

    tenancy.actualEndDate = new Date(endData.endDate);
    tenancy.status = TenancyStatus.ENDED;
    tenancy.terminationReason = endData.reason || 'Not specified';

    // Update property status
    if (tenancy.property) {
      tenancy.property.status = PropertyStatus.AVAILABLE;
      tenancy.property.currentTenantId = null;
      await this.propertyRepository.save(tenancy.property);
    }

    return this.tenancyRepository.save(tenancy);
  }

  // Rent Payment Management
  async recordRentPayment(landlordId: string, recordRentPaymentDto: any, user?: any): Promise<RentPayment> {
    const tenancyId = recordRentPaymentDto.tenancyId;
    const paymentData = recordRentPaymentDto;
    const tenancy = await this.tenancyRepository.findOne({
      where: { id: tenancyId, isActive: true },
    });

    if (!tenancy) {
      throw new NotFoundException(`Tenancy with ID ${tenancyId} not found`);
    }

    const payment = this.rentPaymentRepository.create({
      ...paymentData,
      tenancyAgreementId: tenancyId,
      landlordId: tenancy.landlordId,
      status: PaymentStatus.COMPLETED,
      processedDate: new Date(),
    });

    return this.rentPaymentRepository.save(payment) as unknown as RentPayment;
  }

  async getRentPayments(landlordId: string, user?: any, filters?: {
    propertyId?: string;
    tenancyId?: string;
    startDate?: Date;
    endDate?: Date;
    status?: PaymentStatus;
    fromDate?: Date;
    toDate?: Date;
  }): Promise<RentPayment[]> {
    const query = this.rentPaymentRepository.createQueryBuilder('payment')
      .leftJoinAndSelect('payment.tenancyAgreement', 'tenancy')
      .leftJoinAndSelect('tenancy.property', 'property')
      .where('payment.landlordId = :landlordId', { landlordId });

    if (filters?.propertyId) {
      query.andWhere('tenancy.propertyId = :propertyId', { propertyId: filters.propertyId });
    }

    if (filters?.tenancyId) {
      query.andWhere('payment.tenancyAgreementId = :tenancyId', { tenancyId: filters.tenancyId });
    }

    if (filters?.startDate && filters?.endDate) {
      query.andWhere('payment.paymentDate BETWEEN :startDate AND :endDate', {
        startDate: filters.startDate,
        endDate: filters.endDate,
      });
    } else if (filters?.fromDate && filters?.toDate) {
      query.andWhere('payment.paymentDate BETWEEN :fromDate AND :toDate', {
        fromDate: filters.fromDate,
        toDate: filters.toDate,
      });
    }

    if (filters?.status) {
      query.andWhere('payment.status = :status', { status: filters.status });
    }

    return query.orderBy('payment.paymentDate', 'DESC').getMany();
  }

  // Maintenance Management
  async createMaintenanceRequest(landlordId: string, createMaintenanceDto: CreateMaintenanceRequestDto, user?: any): Promise<MaintenanceRequest> {
    const property = await this.propertyRepository.findOne({
      where: { id: createMaintenanceDto.propertyId, isActive: true },
    });

    if (!property) {
      throw new NotFoundException(`Property with ID ${createMaintenanceDto.propertyId} not found`);
    }

    const request = this.maintenanceRepository.create({
      ...createMaintenanceDto,
      landlordId: property.landlordId,
      status: MaintenanceStatus.SUBMITTED,
      requestNumber: this.generateMaintenanceReference(),
    });

    return this.maintenanceRepository.save(request) as unknown as MaintenanceRequest;
  }

  async getMaintenanceRequests(landlordId: string, user?: any, filters?: {
    propertyId?: string;
    status?: MaintenanceStatus;
    priority?: MaintenancePriority;
    startDate?: Date;
    endDate?: Date;
  }): Promise<MaintenanceRequest[]> {
    const query = this.maintenanceRepository.createQueryBuilder('request')
      .leftJoinAndSelect('request.property', 'property')
      .leftJoinAndSelect('request.reporter', 'reporter')
      .where('request.landlordId = :landlordId', { landlordId });

    if (filters?.propertyId) {
      query.andWhere('request.propertyId = :propertyId', { propertyId: filters.propertyId });
    }

    if (filters?.status) {
      query.andWhere('request.status = :status', { status: filters.status });
    }

    if (filters?.priority) {
      query.andWhere('request.priority = :priority', { priority: filters.priority });
    }

    if (filters?.startDate && filters?.endDate) {
      query.andWhere('request.createdAt BETWEEN :startDate AND :endDate', {
        startDate: filters.startDate,
        endDate: filters.endDate,
      });
    }

    return query.orderBy('request.createdAt', 'DESC').getMany();
  }

  async updateMaintenanceRequest(landlordId: string, requestId: string, updateData: any, user?: any): Promise<MaintenanceRequest> {
    const request = await this.maintenanceRepository.findOne({
      where: { id: requestId },
    });

    if (!request) {
      throw new NotFoundException(`Maintenance request with ID ${requestId} not found`);
    }

    Object.assign(request, updateData);
    return this.maintenanceRepository.save(request) as unknown as MaintenanceRequest;
  }

  // Property Inspection Management
  async scheduleInspection(landlordId: string, scheduleInspectionDto: ScheduleInspectionDto, user?: any): Promise<PropertyInspection> {
    const property = await this.propertyRepository.findOne({
      where: { id: scheduleInspectionDto.propertyId, isActive: true },
    });

    if (!property) {
      throw new NotFoundException(`Property with ID ${scheduleInspectionDto.propertyId} not found`);
    }

    const inspection = this.inspectionRepository.create({
      ...scheduleInspectionDto,
      landlordId: property.landlordId,
      status: InspectionStatus.SCHEDULED,
      inspectionReference: this.generateInspectionReference(),
    });

    return this.inspectionRepository.save(inspection) as unknown as PropertyInspection;
  }

  async getPropertyInspections(landlordId: string, filters?: {
    propertyId?: string;
    inspectionType?: InspectionType;
    status?: InspectionStatus;
    startDate?: Date;
    endDate?: Date;
  }): Promise<PropertyInspection[]> {
    const query = this.inspectionRepository.createQueryBuilder('inspection')
      .leftJoinAndSelect('inspection.property', 'property')
      .leftJoinAndSelect('inspection.inspector', 'inspector')
      .where('inspection.landlordId = :landlordId', { landlordId });

    if (filters?.propertyId) {
      query.andWhere('inspection.propertyId = :propertyId', { propertyId: filters.propertyId });
    }

    if (filters?.inspectionType) {
      query.andWhere('inspection.inspectionType = :inspectionType', { inspectionType: filters.inspectionType });
    }

    if (filters?.status) {
      query.andWhere('inspection.status = :status', { status: filters.status });
    }

    if (filters?.startDate && filters?.endDate) {
      query.andWhere('inspection.scheduledDate BETWEEN :startDate AND :endDate', {
        startDate: filters.startDate,
        endDate: filters.endDate,
      });
    }

    return query.orderBy('inspection.scheduledDate', 'DESC').getMany();
  }

  async completeInspection(landlordId: string, inspectionId: string, completionData: any, user?: any): Promise<PropertyInspection> {
    const inspection = await this.inspectionRepository.findOne({
      where: { id: inspectionId },
    });

    if (!inspection) {
      throw new NotFoundException(`Inspection with ID ${inspectionId} not found`);
    }

    Object.assign(inspection, {
      ...completionData,
      status: InspectionStatus.COMPLETED,
      actualDate: new Date(),
    });

    return this.inspectionRepository.save(inspection) as unknown as PropertyInspection;
  }

  // Financial Reporting
  async generateFinancialReport(landlordId: string, generateReportDto: any, user?: any): Promise<FinancialReport> {
    const landlord = await this.findLandlordById(landlordId);
    
    const report = this.reportRepository.create({
      ...generateReportDto,
      landlordId,
      status: ReportStatus.GENERATING,
      reportReference: this.generateReportReference(),
    }) as unknown as FinancialReport;

    const savedReport = await this.reportRepository.save(report) as unknown as FinancialReport;

    // Generate report data asynchronously
    this.processFinancialReport(savedReport.id);

    return savedReport;
  }

  private async processFinancialReport(reportId: string): Promise<void> {
    try {
      const report = await this.reportRepository.findOne({ where: { id: reportId } });
      if (!report) return;

      // Calculate financial metrics
      const rentPayments = await this.getRentPayments(report.landlordId, {
        startDate: report.periodStart,
        endDate: report.periodEnd,
      });

      const maintenanceRequests = await this.getMaintenanceRequests(report.landlordId, {
        startDate: report.periodStart,
        endDate: report.periodEnd,
      });

      // Calculate totals
      const totalRentalIncome = rentPayments
        .filter(p => p.status === PaymentStatus.COMPLETED)
        .reduce((sum, payment) => sum + payment.amount, 0);

      const totalMaintenanceCosts = maintenanceRequests
        .filter(r => r.status === MaintenanceStatus.COMPLETED && r.actualCost)
        .reduce((sum, request) => sum + request.actualCost, 0);

      // Update report with calculated data
      Object.assign(report, {
        totalRentalIncome,
        totalMaintenanceCosts,
        totalGrossIncome: totalRentalIncome,
        totalExpenses: totalMaintenanceCosts,
        netRentalIncome: totalRentalIncome - totalMaintenanceCosts,
        status: ReportStatus.COMPLETED,
        generatedDate: new Date(),
      });

      await this.reportRepository.save(report);
    } catch (error) {
      // Handle error and update report status
      await this.reportRepository.update(reportId, {
        status: ReportStatus.FAILED,
        errorMessage: error.message,
        errorDate: new Date(),
      });
    }
  }

  async getFinancialReports(landlordId: string, user?: any, filters?: any): Promise<FinancialReport[]> {
    return this.reportRepository.find({
      where: { landlordId, isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  // Document Management
  async uploadDocument(landlordId: string, file: Express.Multer.File, documentData: any, user?: any): Promise<LandlordDocument> {
    const document = this.documentRepository.create({
      ...documentData,
      landlordId,
      status: DocumentStatus.ACTIVE,
      version: 1,
      isLatestVersion: true,
    }) as unknown as LandlordDocument;

    return this.documentRepository.save(document) as unknown as LandlordDocument;
  }

  async getDocuments(landlordId: string, user?: any, filters?: {
    propertyId?: string;
    documentType?: DocumentType;
    status?: DocumentStatus;
    type?: string;
    category?: string;
  }): Promise<LandlordDocument[]> {
    const query = this.documentRepository.createQueryBuilder('document')
      .where('document.landlordId = :landlordId', { landlordId })
      .andWhere('document.isActive = :isActive', { isActive: true });

    if (filters?.propertyId) {
      query.andWhere('document.propertyId = :propertyId', { propertyId: filters.propertyId });
    }

    if (filters?.documentType) {
      query.andWhere('document.documentType = :documentType', { documentType: filters.documentType });
    }

    if (filters?.status) {
      query.andWhere('document.status = :status', { status: filters.status });
    }

    return query.orderBy('document.createdAt', 'DESC').getMany();
  }

  // Dashboard and Analytics
  async getDashboardData(landlordId: string, user?: any): Promise<any> {
    const landlord = await this.findLandlordById(landlordId);
    const properties = await this.getLandlordProperties(landlordId);
    const tenancies = await this.getLandlordTenancies(landlordId);
    
    const currentDate = new Date();
    const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const thisMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

    const thisMonthPayments = await this.getRentPayments(landlordId, {
      startDate: thisMonth,
      endDate: currentDate,
    });

    const pendingMaintenance = await this.getMaintenanceRequests(landlordId, {
      status: MaintenanceStatus.SUBMITTED,
    });

    const upcomingInspections = await this.getPropertyInspections(landlordId, {
      status: InspectionStatus.SCHEDULED,
      startDate: currentDate,
      endDate: new Date(currentDate.getTime() + 30 * 24 * 60 * 60 * 1000), // Next 30 days
    });

    return {
      overview: {
        totalProperties: properties.length,
        occupiedProperties: properties.filter(p => p.status === PropertyStatus.OCCUPIED).length,
        vacantProperties: properties.filter(p => p.status === PropertyStatus.AVAILABLE).length,
        activeTenancies: tenancies.filter(t => t.status === TenancyStatus.ACTIVE).length,
        portfolioValue: 0, // portfolioValue property doesn't exist in current Landlord entity
      },
      financials: {
        thisMonthIncome: thisMonthPayments
          .filter(p => p.status === PaymentStatus.COMPLETED)
          .reduce((sum, p) => sum + p.amount, 0),
        pendingPayments: thisMonthPayments
          .filter(p => p.status === PaymentStatus.PENDING)
          .reduce((sum, p) => sum + p.amount, 0),
        overduePayments: thisMonthPayments
          .filter(p => p.status === PaymentStatus.OVERDUE)
          .reduce((sum, p) => sum + p.amount, 0),
      },
      maintenance: {
        pendingRequests: pendingMaintenance.length,
        urgentRequests: pendingMaintenance.filter(r => r.priority === MaintenancePriority.URGENT || r.priority === MaintenancePriority.EMERGENCY).length,
      },
      inspections: {
        upcomingInspections: upcomingInspections.length,
      },
      recentActivity: {
        recentPayments: thisMonthPayments.slice(0, 5),
        recentMaintenance: pendingMaintenance.slice(0, 5),
        upcomingInspections: upcomingInspections.slice(0, 5),
      },
    };
  }

  // Property Management
  async getProperties(landlordId: string, user?: any, status?: string): Promise<LandlordProperty[]> {
    return this.getLandlordProperties(landlordId);
  }

  // Utility Methods
  private generateMaintenanceReference(): string {
    return `MNT-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
  }

  private generateInspectionReference(): string {
    return `INS-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
  }

  private generateReportReference(): string {
    return `RPT-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
  }

  // Missing methods from controller
  async getInspections(landlordId: string, user: any, filters: any): Promise<PropertyInspection[]> {
    return this.getPropertyInspections(landlordId, filters);
  }

  async getAnalytics(landlordId: string, user: any, options: any): Promise<any> {
    // Placeholder implementation
    return { message: 'Analytics not implemented yet' };
  }

  async getPortfolioSummary(landlordId: string, user: any): Promise<any> {
    // Placeholder implementation
    return { message: 'Portfolio summary not implemented yet' };
  }

  async getPerformanceMetrics(landlordId: string, user: any, options: any): Promise<any> {
    // Placeholder implementation
    return { message: 'Performance metrics not implemented yet' };
  }

  async downloadFinancialReport(landlordId: string, reportId: string, user: any): Promise<any> {
    // Placeholder implementation
    return { message: 'Download not implemented yet' };
  }

  async downloadDocument(landlordId: string, documentId: string, user: any): Promise<any> {
    // Placeholder implementation
    return { message: 'Download not implemented yet' };
  }
}