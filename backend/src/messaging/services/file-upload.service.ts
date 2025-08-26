import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MessageAttachment, AttachmentType } from '../entities/message-attachment.entity';
import * as multer from 'multer';
import * as path from 'path';
import * as fs from 'fs/promises';
import * as crypto from 'crypto';
import * as sharp from 'sharp';

interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

interface ProcessedFile {
  fileName: string;
  originalName: string;
  type: AttachmentType;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

@Injectable()
export class FileUploadService {
  private readonly uploadDir = path.join(process.cwd(), 'uploads', 'messages');
  private readonly maxFileSize = 50 * 1024 * 1024; // 50MB
  private readonly allowedMimeTypes = [
    // Images
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    // Documents
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv',
    // Audio
    'audio/mpeg',
    'audio/wav',
    'audio/ogg',
    'audio/mp4',
    // Video
    'video/mp4',
    'video/mpeg',
    'video/quicktime',
    'video/webm',
    // Archives
    'application/zip',
    'application/x-rar-compressed',
    'application/x-7z-compressed',
  ];

  constructor(
    @InjectRepository(MessageAttachment)
    private attachmentRepository: Repository<MessageAttachment>,
  ) {
    this.ensureUploadDirectory();
  }

  private async ensureUploadDirectory(): Promise<void> {
    try {
      await fs.access(this.uploadDir);
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true });
    }
  }

  async uploadFiles(files: UploadedFile[]): Promise<MessageAttachment[]> {
    const processedFiles: ProcessedFile[] = [];

    for (const file of files) {
      this.validateFile(file);
      const processedFile = await this.processFile(file);
      processedFiles.push(processedFile);
    }

    // Save to database
    const attachments = processedFiles.map(file =>
      this.attachmentRepository.create({
        fileName: file.fileName,
        originalName: file.originalName,
        type: file.type,
        mimeType: file.mimeType,
        size: file.size,
        url: file.url,
        thumbnailUrl: file.thumbnailUrl,
        width: file.width,
        height: file.height,
        duration: file.duration,
        metadata: file.metadata,
      }),
    );

    return this.attachmentRepository.save(attachments);
  }

  private validateFile(file: UploadedFile): void {
    if (file.size > this.maxFileSize) {
      throw new BadRequestException(
        `File size exceeds maximum allowed size of ${this.maxFileSize / (1024 * 1024)}MB`,
      );
    }

    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `File type ${file.mimetype} is not allowed`,
      );
    }
  }

  private async processFile(file: UploadedFile): Promise<ProcessedFile> {
    const fileExtension = path.extname(file.originalname);
    const fileName = `${crypto.randomUUID()}${fileExtension}`;
    const filePath = path.join(this.uploadDir, fileName);
    const url = `/uploads/messages/${fileName}`;

    try {
      // Save original file
      await fs.writeFile(filePath, file.buffer);

      const processedFile: ProcessedFile = {
        fileName,
        originalName: file.originalname,
        type: this.getAttachmentType(file.mimetype),
        mimeType: file.mimetype,
        size: file.size,
        url,
      };

      // Process based on file type
      if (file.mimetype.startsWith('image/')) {
        await this.processImage(file, processedFile, filePath);
      } else if (file.mimetype.startsWith('video/')) {
        await this.processVideo(file, processedFile);
      } else if (file.mimetype.startsWith('audio/')) {
        await this.processAudio(file, processedFile);
      }

      return processedFile;
    } catch (error) {
      // Clean up file if processing failed
      try {
        await fs.unlink(filePath);
      } catch {}
      
      throw new InternalServerErrorException(
        `Failed to process file: ${error.message}`,
      );
    }
  }

  private async processImage(
    file: UploadedFile,
    processedFile: ProcessedFile,
    filePath: string,
  ): Promise<void> {
    try {
      const image = sharp(file.buffer);
      const metadata = await image.metadata();

      processedFile.width = metadata.width;
      processedFile.height = metadata.height;
      processedFile.metadata = {
        format: metadata.format,
        colorSpace: metadata.space,
        hasAlpha: metadata.hasAlpha,
      };

      // Generate thumbnail for images
      if (metadata.width && metadata.height) {
        const thumbnailFileName = `thumb_${processedFile.fileName}`;
        const thumbnailPath = path.join(this.uploadDir, thumbnailFileName);
        
        await image
          .resize(300, 300, {
            fit: 'inside',
            withoutEnlargement: true,
          })
          .jpeg({ quality: 80 })
          .toFile(thumbnailPath);

        processedFile.thumbnailUrl = `/uploads/messages/${thumbnailFileName}`;
      }
    } catch (error) {
      console.warn('Failed to process image metadata:', error.message);
    }
  }

  private async processVideo(
    file: UploadedFile,
    processedFile: ProcessedFile,
  ): Promise<void> {
    // For video processing, you might want to use ffmpeg
    // This is a placeholder implementation
    processedFile.metadata = {
      processed: false,
      note: 'Video processing requires ffmpeg integration',
    };
  }

  private async processAudio(
    file: UploadedFile,
    processedFile: ProcessedFile,
  ): Promise<void> {
    // For audio processing, you might want to use ffmpeg
    // This is a placeholder implementation
    processedFile.metadata = {
      processed: false,
      note: 'Audio processing requires ffmpeg integration',
    };
  }

  private getAttachmentType(mimeType: string): AttachmentType {
    if (mimeType.startsWith('image/')) {
      return AttachmentType.IMAGE;
    } else if (mimeType.startsWith('video/')) {
      return AttachmentType.VIDEO;
    } else if (mimeType.startsWith('audio/')) {
      return AttachmentType.AUDIO;
    } else if (
      mimeType === 'application/pdf' ||
      mimeType.includes('document') ||
      mimeType.includes('sheet') ||
      mimeType.includes('presentation') ||
      mimeType === 'text/plain' ||
      mimeType === 'text/csv'
    ) {
      return AttachmentType.DOCUMENT;
    } else if (
      mimeType === 'application/zip' ||
      mimeType.includes('rar') ||
      mimeType.includes('7z')
    ) {
      return AttachmentType.ARCHIVE;
    } else {
      return AttachmentType.OTHER;
    }
  }

  async deleteFile(attachmentId: string): Promise<void> {
    const attachment = await this.attachmentRepository.findOne({
      where: { id: attachmentId },
    });

    if (!attachment) {
      throw new BadRequestException('Attachment not found');
    }

    try {
      // Delete main file
      const filePath = path.join(this.uploadDir, attachment.fileName);
      await fs.unlink(filePath);

      // Delete thumbnail if exists
      if (attachment.thumbnailUrl) {
        const thumbnailFileName = path.basename(attachment.thumbnailUrl);
        const thumbnailPath = path.join(this.uploadDir, thumbnailFileName);
        try {
          await fs.unlink(thumbnailPath);
        } catch {}
      }

      // Remove from database
      await this.attachmentRepository.remove(attachment);
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to delete file: ${error.message}`,
      );
    }
  }

  async getFileInfo(attachmentId: string): Promise<MessageAttachment> {
    const attachment = await this.attachmentRepository.findOne({
      where: { id: attachmentId },
    });

    if (!attachment) {
      throw new BadRequestException('Attachment not found');
    }

    return attachment;
  }

  getMulterConfig(): multer.Options {
    return {
      storage: multer.memoryStorage(),
      limits: {
        fileSize: this.maxFileSize,
        files: 10, // Maximum 10 files per upload
      },
      fileFilter: (req, file, callback) => {
        if (this.allowedMimeTypes.includes(file.mimetype)) {
          callback(null, true);
        } else {
          callback(
            new Error(
              `File type ${file.mimetype} is not allowed`,
            )
          );
        }
      },
    };
  }

  async getUploadStats(): Promise<{
    totalFiles: number;
    totalSize: number;
    typeBreakdown: Record<AttachmentType, number>;
  }> {
    const attachments = await this.attachmentRepository.find();
    
    const stats = {
      totalFiles: attachments.length,
      totalSize: attachments.reduce((sum, att) => sum + att.size, 0),
      typeBreakdown: {} as Record<AttachmentType, number>,
    };

    // Initialize type breakdown
    Object.values(AttachmentType).forEach(type => {
      stats.typeBreakdown[type] = 0;
    });

    // Count by type
    attachments.forEach(att => {
      stats.typeBreakdown[att.type]++;
    });

    return stats;
  }

  async cleanupOrphanedFiles(): Promise<{ deletedCount: number }> {
    try {
      const files = await fs.readdir(this.uploadDir);
      const dbFiles = await this.attachmentRepository.find({
        select: ['fileName'],
      });
      
      const dbFileNames = new Set(dbFiles.map(f => f.fileName));
      const orphanedFiles = files.filter(file => !dbFileNames.has(file) && !file.startsWith('thumb_'));
      
      let deletedCount = 0;
      for (const file of orphanedFiles) {
        try {
          await fs.unlink(path.join(this.uploadDir, file));
          deletedCount++;
        } catch (error) {
          console.warn(`Failed to delete orphaned file ${file}:`, error.message);
        }
      }
      
      return { deletedCount };
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to cleanup orphaned files: ${error.message}`,
      );
    }
  }
}