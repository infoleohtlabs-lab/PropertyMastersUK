import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';

export enum FileType {
  IMAGE = 'image',
  DOCUMENT = 'document',
  VIDEO = 'video',
  AUDIO = 'audio',
  OTHER = 'other',
}

export enum FileStatus {
  UPLOADING = 'uploading',
  UPLOADED = 'uploaded',
  PROCESSING = 'processing',
  PROCESSED = 'processed',
  FAILED = 'failed',
  DELETED = 'deleted',
}

@Entity('file_uploads')
export class FileUpload {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column('varchar', { length: 255 })
  fileName: string;

  @ApiProperty()
  @Column('varchar', { length: 255 })
  originalName: string;

  @ApiProperty()
  @Column('text')
  filePath: string;

  @ApiProperty()
  @Column('text', { nullable: true })
  fileUrl: string;

  @ApiProperty()
  @Column('text', { nullable: true })
  thumbnailUrl: string;

  @ApiProperty({ enum: FileType })
  @Column({
    type: 'varchar',
    
  })
  fileType: FileType;

  @ApiProperty()
  @Column('varchar', { length: 100 })
  mimeType: string;

  @ApiProperty()
  @Column('bigint')
  fileSize: number;

  @ApiProperty({ enum: FileStatus })
  @Column({
    type: 'varchar',
    
    default: FileStatus.UPLOADED,
  })
  status: FileStatus;

  @ApiProperty()
  @Column('uuid')
  uploadedById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'uploadedById' })
  uploadedBy: User;

  @ApiProperty()
  @Column('varchar', { length: 100, nullable: true })
  entityType: string; // Type of entity this file belongs to (property, user, etc.)

  @ApiProperty()
  @Column('uuid', { nullable: true })
  entityId: string; // ID of the entity this file belongs to

  @ApiProperty()
  @Column('text', { nullable: true })
  description: string;

  @ApiProperty()
  @Column('varchar', { length: 255, nullable: true })
  altText: string; // Alt text for images

  @ApiProperty()
  @Column('json', { nullable: true })
  metadata: any; // Additional metadata (dimensions, duration, etc.)

  @ApiProperty()
  @Column('simple-array', { nullable: true })
  tags: string[]; // Tags for categorization

  @ApiProperty()
  @Column({ default: true })
  isPublic: boolean;

  @ApiProperty()
  @Column({ default: false })
  isTemporary: boolean; // For temporary uploads that should be cleaned up

  @ApiProperty()
  @Column('datetime', { nullable: true })
  expiresAt: Date; // When temporary files expire

  @ApiProperty()
  @Column('int', { default: 0 })
  downloadCount: number;

  @ApiProperty()
  @Column('datetime', { nullable: true })
  lastAccessedAt: Date;

  @ApiProperty()
  @Column('text', { nullable: true })
  checksum: string; // File checksum for integrity verification

  @ApiProperty()
  @Column('json', { nullable: true })
  processingResults: any; // Results from file processing (OCR, analysis, etc.)

  @ApiProperty()
  @Column('datetime')
  uploadedAt: Date;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
