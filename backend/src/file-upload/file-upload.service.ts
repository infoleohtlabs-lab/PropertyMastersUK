import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileUpload } from './entities/file-upload.entity';
import { CreateFileUploadDto } from './dto/create-file-upload.dto';
import { UpdateFileUploadDto } from './dto/update-file-upload.dto';
import * as path from 'path';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FileUploadService {
  private readonly uploadPath = './uploads';
  private readonly maxFileSize = 10 * 1024 * 1024; // 10MB
  private readonly allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  private readonly allowedDocumentTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ];

  constructor(
    @InjectRepository(FileUpload)
    private fileUploadRepository: Repository<FileUpload>,
  ) {
    this.ensureUploadDirectoryExists();
  }

  private ensureUploadDirectoryExists(): void {
    if (!fs.existsSync(this.uploadPath)) {
      fs.mkdirSync(this.uploadPath, { recursive: true });
    }
  }

  async create(createFileUploadDto: CreateFileUploadDto): Promise<FileUpload> {
    const fileUpload = this.fileUploadRepository.create({
      ...createFileUploadDto,
      uploadedAt: new Date(),
    });
    return this.fileUploadRepository.save(fileUpload);
  }

  async findAll(): Promise<FileUpload[]> {
    return this.fileUploadRepository.find({
      relations: ['uploadedBy'],
      order: { uploadedAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<FileUpload> {
    const fileUpload = await this.fileUploadRepository.findOne({
      where: { id },
      relations: ['uploadedBy'],
    });
    if (!fileUpload) {
      throw new NotFoundException(`File upload with ID ${id} not found`);
    }
    return fileUpload;
  }

  async findByUser(userId: string): Promise<FileUpload[]> {
    return this.fileUploadRepository.find({
      where: { uploadedById: userId },
      relations: ['uploadedBy'],
      order: { uploadedAt: 'DESC' },
    });
  }

  async findByEntity(entityType: string, entityId: string): Promise<FileUpload[]> {
    return this.fileUploadRepository.find({
      where: { entityType, entityId },
      relations: ['uploadedBy'],
      order: { uploadedAt: 'DESC' },
    });
  }

  async findByType(fileType: string): Promise<FileUpload[]> {
    return this.fileUploadRepository.find({
      where: { fileType: fileType as any },
      relations: ['uploadedBy'],
      order: { uploadedAt: 'DESC' },
    });
  }

  async update(id: string, updateFileUploadDto: UpdateFileUploadDto): Promise<FileUpload> {
    const fileUpload = await this.findOne(id);
    Object.assign(fileUpload, updateFileUploadDto);
    return this.fileUploadRepository.save(fileUpload);
  }

  async remove(id: string): Promise<void> {
    const fileUpload = await this.findOne(id);
    
    // Delete physical file
    if (fileUpload.filePath && fs.existsSync(fileUpload.filePath)) {
      fs.unlinkSync(fileUpload.filePath);
    }
    
    await this.fileUploadRepository.remove(fileUpload);
  }

  async validateFile(file: Express.Multer.File, fileType: string): Promise<boolean> {
    // Check file size
    if (file.size > this.maxFileSize) {
      throw new BadRequestException('File size exceeds maximum allowed size');
    }

    // Check file type
    const allowedTypes = fileType === 'image' 
      ? this.allowedImageTypes 
      : this.allowedDocumentTypes;
    
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('File type not allowed');
    }

    return true;
  }

  async saveFile(file: Express.Multer.File, uploadDto: CreateFileUploadDto): Promise<FileUpload> {
    await this.validateFile(file, uploadDto.fileType);

    const fileExtension = path.extname(file.originalname);
    const fileName = `${uuidv4()}${fileExtension}`;
    const filePath = path.join(this.uploadPath, fileName);

    // Save file to disk
    fs.writeFileSync(filePath, file.buffer);

    // Create database record
    const fileUpload = await this.create({
      ...uploadDto,
      fileName: file.originalname,
      filePath,
      fileSize: file.size,
      mimeType: file.mimetype,
      fileUrl: `/uploads/${fileName}`,
    });

    return fileUpload;
  }

  async getFileStats(userId?: string): Promise<any> {
    const queryBuilder = this.fileUploadRepository.createQueryBuilder('file');
    
    if (userId) {
      queryBuilder.where('file.uploadedById = :userId', { userId });
    }

    const totalFiles = await queryBuilder.getCount();
    const totalSize = await queryBuilder
      .select('SUM(file.fileSize)', 'totalSize')
      .getRawOne();

    const typeStats = await queryBuilder
      .select('file.fileType', 'type')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(file.fileSize)', 'size')
      .groupBy('file.fileType')
      .getRawMany();

    return {
      totalFiles,
      totalSize: parseInt(totalSize.totalSize) || 0,
      byType: typeStats,
    };
  }

  async cleanupOrphanedFiles(): Promise<void> {
    // Find files that exist on disk but not in database
    const files = fs.readdirSync(this.uploadPath);
    const dbFiles = await this.fileUploadRepository.find();
    const dbFilePaths = dbFiles.map(f => path.basename(f.filePath));

    for (const file of files) {
      if (!dbFilePaths.includes(file)) {
        const filePath = path.join(this.uploadPath, file);
        fs.unlinkSync(filePath);
      }
    }
  }

  async generateThumbnail(fileId: string): Promise<string> {
    // Placeholder for thumbnail generation
    // In a real implementation, you would use a library like sharp or jimp
    const fileUpload = await this.findOne(fileId);
    
    if (!this.allowedImageTypes.includes(fileUpload.mimeType)) {
      throw new BadRequestException('Thumbnails can only be generated for images');
    }

    // Generate thumbnail logic here
    const thumbnailPath = fileUpload.filePath.replace(/\.(\w+)$/, '_thumb.$1');
    
    // Update database with thumbnail path
    await this.update(fileId, { thumbnailUrl: thumbnailPath });
    
    return thumbnailPath;
  }
}
