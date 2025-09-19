import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document, DocumentStatus, DocumentType, DocumentCategory } from './entities/document.entity';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import * as crypto from 'crypto';
import * as path from 'path';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,
  ) {}

  async create(createDocumentDto: CreateDocumentDto, file?: Express.Multer.File): Promise<Document> {
    let document = this.documentRepository.create(createDocumentDto);

    if (file) {
      document.originalFileName = file.originalname;
      document.fileName = this.generateFileName(file.originalname);
      document.mimeType = file.mimetype;
      document.fileSize = file.size;
      document.checksum = this.calculateChecksum(file.buffer);
      document.filePath = this.generateFilePath(document.fileName);
    }

    return this.documentRepository.save(document);
  }

  async findAll(filters?: any): Promise<Document[]> {
    const queryBuilder = this.documentRepository.createQueryBuilder('document')
      .leftJoinAndSelect('document.uploadedBy', 'uploadedBy')
      .leftJoinAndSelect('document.property', 'property')
      .leftJoinAndSelect('document.tenant', 'tenant')
      .leftJoinAndSelect('document.landlord', 'landlord');

    if (filters?.uploadedById) {
      queryBuilder.andWhere('document.uploadedById = :uploadedById', { uploadedById: filters.uploadedById });
    }

    if (filters?.propertyId) {
      queryBuilder.andWhere('document.propertyId = :propertyId', { propertyId: filters.propertyId });
    }

    if (filters?.tenantId) {
      queryBuilder.andWhere('document.tenantId = :tenantId', { tenantId: filters.tenantId });
    }

    if (filters?.landlordId) {
      queryBuilder.andWhere('document.landlordId = :landlordId', { landlordId: filters.landlordId });
    }

    if (filters?.type) {
      queryBuilder.andWhere('document.type = :type', { type: filters.type });
    }

    if (filters?.category) {
      queryBuilder.andWhere('document.category = :category', { category: filters.category });
    }

    if (filters?.status) {
      queryBuilder.andWhere('document.status = :status', { status: filters.status });
    }

    if (filters?.isConfidential !== undefined) {
      queryBuilder.andWhere('document.isConfidential = :isConfidential', { isConfidential: filters.isConfidential });
    }

    if (filters?.isVerified !== undefined) {
      queryBuilder.andWhere('document.isVerified = :isVerified', { isVerified: filters.isVerified });
    }

    if (filters?.tags && filters.tags.length > 0) {
      queryBuilder.andWhere('document.tags && :tags', { tags: filters.tags });
    }

    if (filters?.search) {
      queryBuilder.andWhere(
        '(document.name ILIKE :search OR document.description ILIKE :search OR document.originalFileName ILIKE :search)',
        { search: `%${filters.search}%` }
      );
    }

    if (filters?.expiringBefore) {
      queryBuilder.andWhere('document.expiryDate <= :expiringBefore', { expiringBefore: filters.expiringBefore });
    }

    return queryBuilder
      .orderBy('document.createdAt', 'DESC')
      .getMany();
  }

  async findOne(id: string): Promise<Document> {
    const document = await this.documentRepository.findOne({
      where: { id },
      relations: ['uploadedBy', 'property', 'tenant', 'landlord'],
    });

    if (!document) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }

    // Update access tracking
    document.downloadCount += 1;
    document.lastAccessedAt = new Date();
    await this.documentRepository.save(document);

    return document;
  }

  async findByProperty(propertyId: string): Promise<Document[]> {
    return this.documentRepository.find({
      where: { propertyId },
      relations: ['uploadedBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByTenant(tenantId: string): Promise<Document[]> {
    return this.documentRepository.find({
      where: { tenantId },
      relations: ['uploadedBy', 'property'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByLandlord(landlordId: string): Promise<Document[]> {
    return this.documentRepository.find({
      where: { landlordId },
      relations: ['uploadedBy', 'property'],
      order: { createdAt: 'DESC' },
    });
  }

  async findExpiringDocuments(days: number = 30): Promise<Document[]> {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + days);

    return this.documentRepository.find({
      where: {
        expiryDate: expiryDate,
        status: DocumentStatus.ACTIVE,
      },
      relations: ['uploadedBy', 'property', 'tenant', 'landlord'],
      order: { expiryDate: 'ASC' },
    });
  }

  async update(id: string, updateDocumentDto: UpdateDocumentDto): Promise<Document> {
    const document = await this.findOne(id);
    Object.assign(document, updateDocumentDto);
    return this.documentRepository.save(document);
  }

  async updateStatus(id: string, status: DocumentStatus): Promise<Document> {
    const document = await this.findOne(id);
    document.status = status;
    return this.documentRepository.save(document);
  }

  async verifyDocument(id: string, verifiedBy: string): Promise<Document> {
    const document = await this.findOne(id);
    document.isVerified = true;
    document.verifiedBy = verifiedBy;
    document.verifiedAt = new Date();
    return this.documentRepository.save(document);
  }

  async addVersion(parentId: string, createDocumentDto: CreateDocumentDto, file?: Express.Multer.File): Promise<Document> {
    const parentDocument = await this.findOne(parentId);
    
    // Create new version
    const newVersion = await this.create({
      ...createDocumentDto,
      parentDocumentId: parentId,
      version: this.generateNextVersion(parentDocument.version),
    }, file);

    // Archive the old version
    parentDocument.status = DocumentStatus.ARCHIVED;
    await this.documentRepository.save(parentDocument);

    return newVersion;
  }

  async getDocumentVersions(documentId: string): Promise<Document[]> {
    return this.documentRepository.find({
      where: [{ id: documentId }, { parentDocumentId: documentId }],
      order: { createdAt: 'DESC' },
    });
  }

  async getDocumentStats(filters?: any): Promise<any> {
    const queryBuilder = this.documentRepository.createQueryBuilder('document');

    if (filters?.propertyId) {
      queryBuilder.andWhere('document.propertyId = :propertyId', { propertyId: filters.propertyId });
    }

    if (filters?.landlordId) {
      queryBuilder.andWhere('document.landlordId = :landlordId', { landlordId: filters.landlordId });
    }

    const result = await queryBuilder
      .select([
        'COUNT(*) as totalDocuments',
        'COUNT(CASE WHEN status = \'active\' THEN 1 END) as activeDocuments',
        'COUNT(CASE WHEN status = \'expired\' THEN 1 END) as expiredDocuments',
        'COUNT(CASE WHEN isVerified = true THEN 1 END) as verifiedDocuments',
        'COUNT(CASE WHEN isConfidential = true THEN 1 END) as confidentialDocuments',
        'SUM(fileSize) as totalFileSize',
        'AVG(downloadCount) as averageDownloads',
      ])
      .getRawOne();

    return {
      totalDocuments: parseInt(result.totalDocuments),
      activeDocuments: parseInt(result.activeDocuments),
      expiredDocuments: parseInt(result.expiredDocuments),
      verifiedDocuments: parseInt(result.verifiedDocuments),
      confidentialDocuments: parseInt(result.confidentialDocuments),
      totalFileSize: parseInt(result.totalFileSize) || 0,
      averageDownloads: parseFloat(result.averageDownloads) || 0,
    };
  }

  async remove(id: string): Promise<void> {
    const document = await this.findOne(id);
    document.status = DocumentStatus.DELETED;
    await this.documentRepository.save(document);
  }

  async permanentDelete(id: string): Promise<void> {
    const document = await this.findOne(id);
    await this.documentRepository.remove(document);
  }

  private generateFileName(originalName: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const extension = path.extname(originalName);
    return `${timestamp}-${random}${extension}`;
  }

  private generateFilePath(fileName: string): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `documents/${year}/${month}/${fileName}`;
  }

  private calculateChecksum(buffer: Buffer): string {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }

  private generateNextVersion(currentVersion?: string): string {
    if (!currentVersion) {
      return '1.0';
    }

    const parts = currentVersion.split('.');
    const major = parseInt(parts[0]) || 1;
    const minor = parseInt(parts[1]) || 0;
    
    return `${major}.${minor + 1}`;
  }
}
