import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DataConsent, ConsentStatus } from './entities/data-consent.entity';
import { GdprRequest, GdprRequestStatus } from './entities/gdpr-request.entity';
import { CreateConsentDto } from './dto/create-consent.dto';
import { UpdateConsentDto } from './dto/update-consent.dto';
import { CreateGdprRequestDto } from './dto/create-gdpr-request.dto';

@Injectable()
export class GdprService {
  constructor(
    @InjectRepository(DataConsent)
    private dataConsentRepository: Repository<DataConsent>,
    @InjectRepository(GdprRequest)
    private gdprRequestRepository: Repository<GdprRequest>,
  ) {}

  // Data Consent Methods
  async createConsent(createConsentDto: CreateConsentDto): Promise<DataConsent> {
    const consent = this.dataConsentRepository.create(createConsentDto);
    return this.dataConsentRepository.save(consent);
  }

  async findAllConsents(): Promise<DataConsent[]> {
    return this.dataConsentRepository.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findConsentById(id: string): Promise<DataConsent> {
    const consent = await this.dataConsentRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!consent) {
      throw new NotFoundException(`Data consent with ID ${id} not found`);
    }
    return consent;
  }

  async findConsentsByUser(userId: string): Promise<DataConsent[]> {
    return this.dataConsentRepository.find({
      where: { userId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateConsent(id: string, updateConsentDto: UpdateConsentDto): Promise<DataConsent> {
    const consent = await this.findConsentById(id);
    
    // If withdrawing consent, set withdrawal date
    if (updateConsentDto.granted === false && consent.granted === true) {
      updateConsentDto.withdrawalDate = new Date();
      updateConsentDto.consentStatus = ConsentStatus.WITHDRAWN;
    }
    
    Object.assign(consent, updateConsentDto);
    return this.dataConsentRepository.save(consent);
  }

  async removeConsent(id: string): Promise<void> {
    const consent = await this.findConsentById(id);
    await this.dataConsentRepository.remove(consent);
  }

  async withdrawConsent(id: string, withdrawalReason?: string): Promise<DataConsent> {
    return this.updateConsent(id, {
      granted: false,
      consentStatus: ConsentStatus.WITHDRAWN,
      withdrawalDate: new Date(),
      withdrawalReason,
    });
  }

  // GDPR Request Methods
  async createGdprRequest(createGdprRequestDto: CreateGdprRequestDto): Promise<GdprRequest> {
    const request = this.gdprRequestRepository.create(createGdprRequestDto);
    return this.gdprRequestRepository.save(request);
  }

  async findAllGdprRequests(): Promise<GdprRequest[]> {
    return this.gdprRequestRepository.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findGdprRequestById(id: string): Promise<GdprRequest> {
    const request = await this.gdprRequestRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!request) {
      throw new NotFoundException(`GDPR request with ID ${id} not found`);
    }
    return request;
  }

  async findGdprRequestsByUser(userId: string): Promise<GdprRequest[]> {
    return this.gdprRequestRepository.find({
      where: { userId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async processGdprRequest(id: string): Promise<GdprRequest> {
    const request = await this.findGdprRequestById(id);
    request.status = GdprRequestStatus.IN_PROGRESS;
    request.processedAt = new Date();
    return this.gdprRequestRepository.save(request);
  }

  async completeGdprRequest(id: string, responseData?: Record<string, any>): Promise<GdprRequest> {
    const request = await this.findGdprRequestById(id);
    request.status = GdprRequestStatus.COMPLETED;
    request.completedAt = new Date();
    if (responseData) {
      request.responseData = responseData;
    }
    return this.gdprRequestRepository.save(request);
  }

  async rejectGdprRequest(id: string, rejectionReason: string): Promise<GdprRequest> {
    const request = await this.findGdprRequestById(id);
    request.status = GdprRequestStatus.REJECTED;
    request.rejectedAt = new Date();
    request.rejectionReason = rejectionReason;
    return this.gdprRequestRepository.save(request);
  }

  async withdrawGdprRequest(id: string, withdrawalReason?: string): Promise<GdprRequest> {
    const request = await this.findGdprRequestById(id);
    request.status = GdprRequestStatus.WITHDRAWN;
    request.withdrawnAt = new Date();
    if (withdrawalReason) {
      request.withdrawalReason = withdrawalReason;
    }
    return this.gdprRequestRepository.save(request);
  }

  async updateGdprRequest(id: string, updateData: Partial<GdprRequest>): Promise<GdprRequest> {
    const request = await this.findGdprRequestById(id);
    Object.assign(request, updateData);
    return this.gdprRequestRepository.save(request);
  }

  async removeGdprRequest(id: string): Promise<void> {
    const request = await this.findGdprRequestById(id);
    await this.gdprRequestRepository.remove(request);
  }

  // Analytics and Reporting
  async getConsentStatistics(userId?: string): Promise<any> {
    const queryBuilder = this.dataConsentRepository.createQueryBuilder('consent');
    
    if (userId) {
      queryBuilder.where('consent.userId = :userId', { userId });
    }

    const [total, granted, withdrawn, expired] = await Promise.all([
      queryBuilder.getCount(),
      queryBuilder.clone().andWhere('consent.granted = :granted', { granted: true }).getCount(),
      queryBuilder.clone().andWhere('consent.consentStatus = :status', { status: ConsentStatus.WITHDRAWN }).getCount(),
      queryBuilder.clone().andWhere('consent.consentStatus = :status', { status: ConsentStatus.EXPIRED }).getCount(),
    ]);

    return {
      total,
      granted,
      withdrawn,
      expired,
      pending: total - granted - withdrawn - expired,
    };
  }

  async getGdprRequestStatistics(userId?: string): Promise<any> {
    const queryBuilder = this.gdprRequestRepository.createQueryBuilder('request');
    
    if (userId) {
      queryBuilder.where('request.userId = :userId', { userId });
    }

    const [total, pending, inProgress, completed, rejected, withdrawn] = await Promise.all([
      queryBuilder.getCount(),
      queryBuilder.clone().andWhere('request.status = :status', { status: GdprRequestStatus.PENDING }).getCount(),
      queryBuilder.clone().andWhere('request.status = :status', { status: GdprRequestStatus.IN_PROGRESS }).getCount(),
      queryBuilder.clone().andWhere('request.status = :status', { status: GdprRequestStatus.COMPLETED }).getCount(),
      queryBuilder.clone().andWhere('request.status = :status', { status: GdprRequestStatus.REJECTED }).getCount(),
      queryBuilder.clone().andWhere('request.status = :status', { status: GdprRequestStatus.WITHDRAWN }).getCount(),
    ]);

    return {
      total,
      pending,
      inProgress,
      completed,
      rejected,
      withdrawn,
    };
  }
}
