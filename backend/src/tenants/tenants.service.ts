import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Like, In } from 'typeorm';
import { Tenant, TenantStatus } from './entities/tenant.entity';
import { TenantApplication, ApplicationStatus } from './entities/tenant-application.entity';
import { TenantDocument, DocumentStatus } from './entities/tenant-document.entity';
import { TenantPayment, PaymentStatus } from './entities/tenant-payment.entity';
import { TenantComplaint, ComplaintStatus } from './entities/tenant-complaint.entity';
import { TenantNotification, NotificationStatus } from './entities/tenant-notification.entity';
import { TenantPreference } from './entities/tenant-preference.entity';
import { TenantReference, ReferenceStatus } from './entities/tenant-reference.entity';
import { TenantEmergencyContact } from './entities/tenant-emergency-contact.entity';
import { TenantCommunication, CommunicationStatus, CommunicationDirection } from './entities/tenant-communication.entity';
import { User } from '../users/entities/user.entity';
import { Express } from 'express';
import 'multer';

@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
    @InjectRepository(TenantApplication)
    private applicationRepository: Repository<TenantApplication>,
    @InjectRepository(TenantDocument)
    private documentRepository: Repository<TenantDocument>,
    @InjectRepository(TenantPayment)
    private paymentRepository: Repository<TenantPayment>,
    @InjectRepository(TenantComplaint)
    private complaintRepository: Repository<TenantComplaint>,
    @InjectRepository(TenantNotification)
    private notificationRepository: Repository<TenantNotification>,
    @InjectRepository(TenantPreference)
    private preferenceRepository: Repository<TenantPreference>,
    @InjectRepository(TenantReference)
    private referenceRepository: Repository<TenantReference>,
    @InjectRepository(TenantEmergencyContact)
    private emergencyContactRepository: Repository<TenantEmergencyContact>,
    @InjectRepository(TenantCommunication)
    private communicationRepository: Repository<TenantCommunication>,
  ) {}

  // Tenant Management
  async create(createTenantDto: any, userId: string): Promise<Tenant> {
    const existingTenant = await this.tenantRepository.findOne({
      where: { userId },
    });

    if (existingTenant) {
      throw new ConflictException('Tenant profile already exists for this user');
    }

    const tenant = this.tenantRepository.create({
      ...createTenantDto,
      userId,
      status: TenantStatus.PENDING,
    }) as unknown as Tenant;

    return this.tenantRepository.save(tenant);
  }

  async findAll(options: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    type?: string;
  }) {
    const { page = 1, limit = 10, search, status, type } = options;
    const skip = (page - 1) * limit;

    const queryBuilder = this.tenantRepository.createQueryBuilder('tenant')
      .leftJoinAndSelect('tenant.user', 'user');

    if (search) {
      queryBuilder.andWhere(
        '(user.firstName ILIKE :search OR user.lastName ILIKE :search OR user.email ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (status) {
      queryBuilder.andWhere('tenant.status = :status', { status });
    }

    if (type) {
      queryBuilder.andWhere('tenant.tenancyType = :type', { type });
    }

    const [tenants, total] = await queryBuilder
      .orderBy('tenant.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data: tenants,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findAllTenants(filters?: any): Promise<Tenant[]> {
    const { search, status, propertyId, landlordId, type } = filters || {};
    
    const queryBuilder = this.tenantRepository.createQueryBuilder('tenant')
      .leftJoinAndSelect('tenant.user', 'user')
      .leftJoinAndSelect('tenant.property', 'property')
      .leftJoinAndSelect('tenant.landlord', 'landlord');

    if (search) {
      queryBuilder.andWhere(
        '(user.firstName ILIKE :search OR user.lastName ILIKE :search OR user.email ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (status) {
      queryBuilder.andWhere('tenant.status = :status', { status });
    }

    if (propertyId) {
      queryBuilder.andWhere('tenant.propertyId = :propertyId', { propertyId });
    }

    if (landlordId) {
      queryBuilder.andWhere('tenant.landlordId = :landlordId', { landlordId });
    }

    if (type) {
      queryBuilder.andWhere('tenant.tenancyType = :type', { type });
    }

    return queryBuilder
      .orderBy('tenant.createdAt', 'DESC')
      .getMany();
  }

  async findOne(id: string, user: User): Promise<Tenant> {
    const tenant = await this.tenantRepository.findOne({
      where: { id },
      relations: ['user', 'applications', 'documents', 'payments', 'preferences'],
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    // Check if user has permission to view this tenant
    if (user.role !== 'admin' && tenant.userId !== user.id) {
      throw new ForbiddenException('Access denied');
    }

    return tenant;
  }

  async findByUserId(userId: string): Promise<Tenant> {
    const tenant = await this.tenantRepository.findOne({
      where: { userId },
      relations: ['user', 'applications', 'documents', 'payments', 'preferences'],
    });

    if (!tenant) {
      throw new NotFoundException('Tenant profile not found');
    }

    return tenant;
  }

  async update(id: string, updateTenantDto: any, user: User): Promise<Tenant> {
    const tenant = await this.findOne(id, user);

    Object.assign(tenant, updateTenantDto);
    tenant.updatedBy = user.id;

    return this.tenantRepository.save(tenant);
  }

  async remove(id: string): Promise<void> {
    const tenant = await this.tenantRepository.findOne({ where: { id } });
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    await this.tenantRepository.remove(tenant);
  }

  // Application Management
  async createApplication(tenantId: string, applicationData: any, user: User): Promise<TenantApplication> {
    const tenant = await this.findOne(tenantId, user);

    const application = this.applicationRepository.create({
      ...applicationData,
      tenantId,
      status: ApplicationStatus.DRAFT,
      createdBy: user.id,
    }) as unknown as TenantApplication;

    const savedApplication = await this.applicationRepository.save(application);

    // Update tenant statistics
    tenant.totalApplications += 1;
    tenant.lastApplicationDate = new Date();
    await this.tenantRepository.save(tenant);

    return savedApplication;
  }

  async getApplications(tenantId: string, user: User, filters?: any): Promise<TenantApplication[]> {
    await this.findOne(tenantId, user);

    const where: FindOptionsWhere<TenantApplication> = { tenantId };

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.propertyId) {
      where.propertyId = filters.propertyId;
    }

    return this.applicationRepository.find({
      where,
      relations: ['property'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateApplication(tenantId: string, applicationId: string, updateData: any, user: User): Promise<TenantApplication> {
    await this.findOne(tenantId, user);

    const application = await this.applicationRepository.findOne({
      where: { id: applicationId, tenantId },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    Object.assign(application, updateData);
    application.updatedBy = user.id;

    return this.applicationRepository.save(application);
  }

  async submitApplication(tenantId: string, applicationId: string, user: User): Promise<TenantApplication> {
    const application = await this.updateApplication(tenantId, applicationId, {
      status: ApplicationStatus.SUBMITTED,
      submittedDate: new Date(),
    }, user);

    // Send notification to landlord/agent
    // Implementation depends on notification service

    return application;
  }

  // Document Management
  async uploadDocument(tenantId: string, file: Express.Multer.File, documentData: any, user: User): Promise<TenantDocument> {
    await this.findOne(tenantId, user);

    const document = this.documentRepository.create({
      ...documentData,
      tenantId,
      fileName: file.originalname,
      filePath: file.path,
      mimeType: file.mimetype,
      fileSize: file.size,
      status: DocumentStatus.UPLOADED,
    }) as unknown as TenantDocument;

    return this.documentRepository.save(document);
  }

  async getDocuments(tenantId: string, user: User, filters?: any): Promise<TenantDocument[]> {
    await this.findOne(tenantId, user);

    const where: FindOptionsWhere<TenantDocument> = { tenantId };

    if (filters?.type) {
      where.documentType = filters.type;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    return this.documentRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async verifyDocument(tenantId: string, documentId: string, user: User): Promise<TenantDocument> {
    await this.findOne(tenantId, user);

    const document = await this.documentRepository.findOne({
      where: { id: documentId, tenantId },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    document.status = DocumentStatus.VERIFIED;
    document.isVerified = true;
    document.verifiedDate = new Date();
    document.verifiedBy = user.id;

    return this.documentRepository.save(document);
  }

  async updateDocumentStatus(documentId: string, status: DocumentStatus, verificationNotes?: string): Promise<TenantDocument> {
    const document = await this.documentRepository.findOne({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    document.status = status;
    if (verificationNotes) {
      document.notes = verificationNotes;
    }

    if (status === DocumentStatus.VERIFIED) {
      document.isVerified = true;
      document.verifiedDate = new Date();
    }

    return this.documentRepository.save(document);
  }

  async deleteDocument(documentId: string): Promise<void> {
    const document = await this.documentRepository.findOne({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    await this.documentRepository.remove(document);
  }

  // Payment Management
  async recordPayment(tenantId: string, paymentData: any, user: User): Promise<TenantPayment> {
    await this.findOne(tenantId, user);

    const payment = this.paymentRepository.create({
      ...paymentData,
      tenantId,
      status: PaymentStatus.COMPLETED,
    }) as unknown as TenantPayment;

    return this.paymentRepository.save(payment);
  }

  async getPayments(tenantId: string, user: User, filters?: any): Promise<TenantPayment[]> {
    await this.findOne(tenantId, user);

    const where: FindOptionsWhere<TenantPayment> = { tenantId };

    if (filters?.type) {
      where.paymentType = filters.type;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    return this.paymentRepository.find({
      where,
      order: { paymentDate: 'DESC' },
    });
  }

  // Complaint Management
  async createComplaint(tenantId: string, complaintData: any, user: User): Promise<TenantComplaint> {
    await this.findOne(tenantId, user);

    const complaint = this.complaintRepository.create({
      ...complaintData,
      tenantId,
      status: ComplaintStatus.OPEN,
    }) as unknown as TenantComplaint;

    const savedComplaint = await this.complaintRepository.save(complaint);

    // Update tenant statistics
    const tenant = await this.tenantRepository.findOne({ where: { id: tenantId } });
    if (tenant) {
      tenant.complaintCount += 1;
      await this.tenantRepository.save(tenant);
    }

    return savedComplaint;
  }

  async getComplaints(tenantId: string, user: User, filters?: any): Promise<TenantComplaint[]> {
    await this.findOne(tenantId, user);

    const where: FindOptionsWhere<TenantComplaint> = { tenantId };

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.category) {
      where.category = filters.category;
    }

    return this.complaintRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async updateComplaint(tenantId: string, complaintId: string, updateData: any, user: User): Promise<TenantComplaint> {
    await this.findOne(tenantId, user);

    const complaint = await this.complaintRepository.findOne({
      where: { id: complaintId, tenantId },
    });

    if (!complaint) {
      throw new NotFoundException('Complaint not found');
    }

    Object.assign(complaint, updateData);

    if (updateData.status === ComplaintStatus.RESOLVED) {
      complaint.resolvedDate = new Date();
    }

    return this.complaintRepository.save(complaint);
  }

  // Notification Management
  async createNotification(tenantId: string, notificationData: any): Promise<TenantNotification> {
    const notification = this.notificationRepository.create({
      ...notificationData,
      tenantId,
      status: NotificationStatus.PENDING,
    }) as unknown as TenantNotification;

    return this.notificationRepository.save(notification);
  }

  async getNotifications(tenantId: string, user: User, filters?: any): Promise<TenantNotification[]> {
    await this.findOne(tenantId, user);

    const where: FindOptionsWhere<TenantNotification> = { tenantId };

    if (filters?.type) {
      where.type = filters.type;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    return this.notificationRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async markNotificationAsRead(tenantId: string, notificationId: string, user: User): Promise<TenantNotification> {
    await this.findOne(tenantId, user);

    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId, tenantId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    notification.status = NotificationStatus.READ;
    notification.readDate = new Date();

    return this.notificationRepository.save(notification);
  }

  // Preference Management
  async updatePreferences(tenantId: string, preferencesData: any, user: User): Promise<TenantPreference> {
    await this.findOne(tenantId, user);

    let preferences = await this.preferenceRepository.findOne({
      where: { tenantId },
    });

    if (!preferences) {
      preferences = this.preferenceRepository.create({
        tenantId,
        ...preferencesData,
      }) as unknown as TenantPreference;
    } else {
      Object.assign(preferences, preferencesData);
    }

    return this.preferenceRepository.save(preferences);
  }

  async getPreferences(tenantId: string, user: User): Promise<TenantPreference> {
    await this.findOne(tenantId, user);

    const preferences = await this.preferenceRepository.findOne({
      where: { tenantId },
    });

    if (!preferences) {
      throw new NotFoundException('Preferences not found');
    }

    return preferences;
  }

  // Reference Management
  async addReference(tenantId: string, referenceData: any, user: User): Promise<TenantReference> {
    await this.findOne(tenantId, user);

    const reference = this.referenceRepository.create({
      ...referenceData,
      tenantId,
      status: ReferenceStatus.PENDING,
    }) as unknown as TenantReference;

    return this.referenceRepository.save(reference);
  }

  async getReferences(tenantId: string, user: User): Promise<TenantReference[]> {
    await this.findOne(tenantId, user);

    return this.referenceRepository.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
    });
  }

  async requestReference(referenceId: string): Promise<TenantReference> {
    const reference = await this.referenceRepository.findOne({
      where: { id: referenceId },
    });

    if (!reference) {
      throw new NotFoundException('Reference not found');
    }

    reference.status = ReferenceStatus.REQUESTED;
    reference.requestedDate = new Date();

    // Send reference request email
    // Implementation depends on email service

    return this.referenceRepository.save(reference);
  }

  async updateReferenceStatus(referenceId: string, status: ReferenceStatus): Promise<TenantReference> {
    const reference = await this.referenceRepository.findOne({
      where: { id: referenceId },
    });

    if (!reference) {
      throw new NotFoundException('Reference not found');
    }

    reference.status = status;
    if (status === ReferenceStatus.VERIFIED) {
      reference.verifiedDate = new Date();
    } else if (status === ReferenceStatus.RECEIVED) {
      reference.receivedDate = new Date();
    }

    return this.referenceRepository.save(reference);
  }

  // Emergency Contact Management
  async addEmergencyContact(tenantId: string, contactData: any, user: User): Promise<TenantEmergencyContact> {
    await this.findOne(tenantId, user);

    const contact = this.emergencyContactRepository.create({
      ...contactData,
      tenantId,
    }) as unknown as TenantEmergencyContact;

    return this.emergencyContactRepository.save(contact);
  }

  async getEmergencyContacts(tenantId: string, user: User): Promise<TenantEmergencyContact[]> {
    await this.findOne(tenantId, user);

    return this.emergencyContactRepository.find({
      where: { tenantId, isActive: true },
      order: { isPrimary: 'DESC', createdAt: 'DESC' },
    });
  }

  // Communication Management
  async createCommunication(tenantId: string, communicationData: any, user: User): Promise<TenantCommunication> {
    await this.findOne(tenantId, user);

    const communication = this.communicationRepository.create({
      ...communicationData,
      tenantId,
      status: CommunicationStatus.SENT,
      sentDate: new Date(),
    }) as unknown as TenantCommunication;

    return this.communicationRepository.save(communication);
  }

  async getCommunications(tenantId: string, user: User, filters?: any): Promise<TenantCommunication[]> {
    await this.findOne(tenantId, user);

    const where: FindOptionsWhere<TenantCommunication> = { tenantId };

    if (filters?.type) {
      where.type = filters.type;
    }

    if (filters?.direction) {
      where.direction = filters.direction;
    }

    return this.communicationRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  // Application Status Management
  async updateApplicationStatus(tenantId: string, status: TenantStatus): Promise<Tenant> {
    const tenant = await this.tenantRepository.findOne({ where: { id: tenantId } });
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    tenant.status = status;
    tenant.updatedAt = new Date();

    return this.tenantRepository.save(tenant);
  }

  async getApplicationProgress(tenantId: string): Promise<any> {
    const tenant = await this.tenantRepository.findOne({ where: { id: tenantId } });
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    const applications = await this.applicationRepository.count({ where: { tenantId } });
    const documents = await this.documentRepository.count({ where: { tenantId } });
    const verifiedDocuments = await this.documentRepository.count({ 
      where: { tenantId, status: DocumentStatus.VERIFIED } 
    });

    return {
      totalApplications: applications,
      totalDocuments: documents,
      verifiedDocuments,
      status: tenant.status,
      completionPercentage: Math.round((verifiedDocuments / Math.max(documents, 1)) * 100)
    };
  }

  // Background Checks
  async performCreditCheck(tenantId: string): Promise<Tenant> {
    const tenant = await this.tenantRepository.findOne({ where: { id: tenantId } });
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    // Simulate credit check process
    tenant.creditCheckPassed = true;
    tenant.creditCheckedDate = new Date();
    tenant.creditScore = Math.floor(Math.random() * 400) + 400; // Random score between 400-800

    return this.tenantRepository.save(tenant);
  }

  async performDWPCheck(tenantId: string): Promise<Tenant> {
    const tenant = await this.tenantRepository.findOne({ where: { id: tenantId } });
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    // Simulate DWP check process
    tenant.isIncomeVerified = true;
    tenant.incomeVerifiedDate = new Date();

    return this.tenantRepository.save(tenant);
  }

  async performEmploymentCheck(tenantId: string): Promise<Tenant> {
    const tenant = await this.tenantRepository.findOne({ where: { id: tenantId } });
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    // Simulate employment verification
    tenant.isEmploymentVerified = true;
    tenant.employmentVerifiedDate = new Date();

    return this.tenantRepository.save(tenant);
  }

  async updateConsent(tenantId: string, consentDto: any): Promise<Tenant> {
    const tenant = await this.tenantRepository.findOne({ where: { id: tenantId } });
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    // Update consent preferences
    Object.assign(tenant, consentDto);
    tenant.updatedAt = new Date();

    return this.tenantRepository.save(tenant);
  }

  // Dashboard Statistics
  async getDashboardStats(tenantId: string, user: User): Promise<any> {
    await this.findOne(tenantId, user);

    const [applications, documents, payments, complaints] = await Promise.all([
      this.applicationRepository.count({ where: { tenantId } }),
      this.documentRepository.count({ where: { tenantId } }),
      this.paymentRepository.count({ where: { tenantId } }),
      this.complaintRepository.count({ where: { tenantId } }),
    ]);

    return {
      totalApplications: applications,
      totalDocuments: documents,
      totalPayments: payments,
      totalComplaints: complaints,
    };
  }
}
