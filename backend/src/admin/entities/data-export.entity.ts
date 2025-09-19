import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum DataExportType {
  USER_DATA = 'user_data',
  PROPERTY_DATA = 'property_data',
  BOOKING_DATA = 'booking_data',
  FINANCIAL_DATA = 'financial_data',
  COMMUNICATION_DATA = 'communication_data',
  FULL_EXPORT = 'full_export',
}

export enum DataExportStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  EXPIRED = 'expired',
}

export enum DataExportFormat {
  JSON = 'json',
  CSV = 'csv',
  PDF = 'pdf',
  XML = 'xml',
}

@Entity('data_exports')
@Index(['requestedBy', 'createdAt'])
@Index(['status', 'createdAt'])
@Index(['expiresAt'])
export class DataExport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
  })
  type: DataExportType;

  @Column({
    type: 'varchar',
    default: DataExportStatus.PENDING,
  })
  status: DataExportStatus;

  @Column({
    type: 'varchar',
    default: DataExportFormat.JSON,
  })
  format: DataExportFormat;

  @Column({ name: 'requested_by' })
  requestedBy: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'requested_by' })
  requestedByUser: User;

  @Column({ name: 'subject_user_id', nullable: true })
  subjectUserId: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'subject_user_id' })
  subjectUser: User;

  @Column('text', { nullable: true })
  filters: Record<string, any>;

  @Column({ name: 'file_path', nullable: true })
  filePath: string;

  @Column({ name: 'file_size', nullable: true })
  fileSize: number;

  @Column({ name: 'download_count', default: 0 })
  downloadCount: number;

  @Column({ name: 'max_downloads', default: 3 })
  maxDownloads: number;

  @Column({ name: 'expires_at' })
  expiresAt: Date;

  @Column({ name: 'processed_at', nullable: true })
  processedAt: Date;

  @Column({ name: 'last_downloaded_at', nullable: true })
  lastDownloadedAt: Date;

  @Column('text', { nullable: true })
  errorMessage: string;

  @Column('text', { nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ default: false })
  archived: boolean;

  @Column('text', { nullable: true })
  notes: string;
}
