import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GdprRequest } from './entities/gdpr-request.entity';
import { DataConsent } from './entities/data-consent.entity';
import { CreateGdprRequestDto } from './dto/create-gdpr-request.dto';
import { CreateConsentDto } from './dto/create-consent.dto';
import { GdprRequestType, GdprRequestStatus } from './entities/gdpr-request.entity';
import { ConsentType, ConsentStatus } from './entities/data-consent.entity';

@Injectable()
export class GdprService {
  constructor(
    @InjectRepository(GdprRequest)
    private gdprRequestRepository: Repository<GdprRequest>,
    @InjectRepository(DataConsent)
    private dataConsentRepository: Repository<DataConsent>,
  ) {}

  // GDPR Request Management
  async createGdprRequest(createGdprRequestDto: CreateGdprRequestDto): Promise<GdprRequest> {
    try {
      const gdprRequest = this.gdprRequestRepository.create({
        ...createGdprRequestDto,
        status: GdprRequestStatus.PENDING,
        requestDate: new Date(),
      });
      return await this.gdprRequestRepository.save(gdprRequest);
    } catch (error) {
      throw new BadRequestException('Failed to create GDPR request');
    }
  }

  async findAllGdprRequests(): Promise<GdprRequest[]> {
    return await this.gdprRequestRepository.find({
      relations: ['user'],
      order: { requestDate: 'DESC' },
    });
  }

  async findGdprRequest(id: string): Promise<GdprRequest> {
    const request = await this.gdprRequestRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!request) {
      throw new NotFoundException('GDPR request not found');
    }

    return request;
  }

  async processGdprRequest(id: string, processingNotes?: string): Promise<GdprRequest> {
    const request = await this.findGdprRequest(id);
    
    request.status = GdprRequestStatus.PROCESSING;
    request.processingDate = new Date();
    request.processingNotes = processingNotes;
    
    return await this.gdprRequestRepository.save(request);
  }

  async completeGdprRequest(id: string, completionNotes?: string): Promise<GdprRequest> {
    const request = await this.findGdprRequest(id);
    
    request.status = GdprRequestStatus.COMPLETED;
    request.completionDate = new Date();
    request.completionNotes = completionNotes;
    
    return await this.gdprRequestRepository.save(request);
  }

  async rejectGdprRequest(id: string, rejectionReason: string): Promise<GdprRequest> {
    const request = await this.findGdprRequest(id);
    
    request.status = GdprRequestStatus.REJECTED;
    request.rejectionReason = rejectionReason;
    request.completionDate = new Date();
    
    return await this.gdprRequestRepository.save(request);
  }

  // Data Consent Management
  async createConsent(createConsentDto: CreateConsentDto): Promise<DataConsent> {
    try {
      const consent = this.dataConsentRepository.create({
        ...createConsentDto,
        status: ConsentStatus.ACTIVE,
        consentDate: new Date(),
      });
      return await this.dataConsentRepository.save(consent);
    } catch (error) {
      throw new BadRequestException('Failed to create consent record');
    }
  }

  async findUserConsents(userId: string): Promise<DataConsent[]> {
    return await this.dataConsentRepository.find({
      where: { userId },
      order: { consentDate: 'DESC' },
    });
  }

  async updateConsent(userId: string, consentType: ConsentType, granted: boolean): Promise<DataConsent> {
    // Find existing consent or create new one
    let consent = await this.dataConsentRepository.findOne({
      where: { userId, consentType },
    });

    if (consent) {
      consent.granted = granted;
      consent.status = granted ? ConsentStatus.ACTIVE : ConsentStatus.WITHDRAWN;
      consent.lastUpdated = new Date();
      if (!granted) {
        consent.withdrawalDate = new Date();
      }
    } else {
      consent = this.dataConsentRepository.create({
        userId,
        consentType,
        granted,
        status: granted ? ConsentStatus.ACTIVE : ConsentStatus.WITHDRAWN,
        consentDate: new Date(),
        lastUpdated: new Date(),
        withdrawalDate: granted ? null : new Date(),
      });
    }

    return await this.dataConsentRepository.save(consent);
  }

  async withdrawConsent(userId: string, consentType: ConsentType): Promise<DataConsent> {
    return await this.updateConsent(userId, consentType, false);
  }

  async checkConsent(userId: string, consentType: ConsentType): Promise<boolean> {
    const consent = await this.dataConsentRepository.findOne({
      where: { userId, consentType, status: ConsentStatus.ACTIVE },
    });

    return consent ? consent.granted : false;
  }

  // Data Export for GDPR compliance
  async exportUserData(userId: string): Promise<any> {
    // This would collect all user data from various tables
    // Implementation would depend on your specific data structure
    const userData = {
      userId,
      exportDate: new Date(),
      // Add other user data collections here
    };

    return userData;
  }

  // Data Deletion for GDPR compliance
  async deleteUserData(userId: string): Promise<void> {
    // This would handle the deletion/anonymization of user data
    // Implementation would depend on your specific requirements
    // Note: Some data might need to be retained for legal reasons
    
    // Example: Mark user as deleted rather than hard delete
    // await this.userRepository.update(userId, { isDeleted: true, deletedAt: new Date() });
  }

  // Audit and Reporting
  async getGdprStats(): Promise<any> {
    const totalRequests = await this.gdprRequestRepository.count();
    const pendingRequests = await this.gdprRequestRepository.count({ 
      where: { status: GdprRequestStatus.PENDING } 
    });
    const processingRequests = await this.gdprRequestRepository.count({ 
      where: { status: GdprRequestStatus.PROCESSING } 
    });
    const completedRequests = await this.gdprRequestRepository.count({ 
      where: { status: GdprRequestStatus.COMPLETED } 
    });
    const rejectedRequests = await this.gdprRequestRepository.count({ 
      where: { status: GdprRequestStatus.REJECTED } 
    });

    const totalConsents = await this.dataConsentRepository.count();
    const activeConsents = await this.dataConsentRepository.count({ 
      where: { status: ConsentStatus.ACTIVE, granted: true } 
    });
    const withdrawnConsents = await this.dataConsentRepository.count({ 
      where: { status: ConsentStatus.WITHDRAWN } 
    });

    return {
      requests: {
        total: totalRequests,
        pending: pendingRequests,
        processing: processingRequests,
        completed: completedRequests,
        rejected: rejectedRequests,
      },
      consents: {
        total: totalConsents,
        active: activeConsents,
        withdrawn: withdrawnConsents,
        consentRate: totalConsents > 0 ? (activeConsents / totalConsents) * 100 : 0,
      },
    };
  }

  async getDataRetentionReport(): Promise<any> {
    // Implementation for data retention reporting
    // This would analyze data age and retention policies
    return {
      // Data retention metrics
    };
  }
}