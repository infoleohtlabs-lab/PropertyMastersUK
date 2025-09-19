import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export type ImportJobStatus = 
  | 'uploaded'
  | 'validating'
  | 'validated'
  | 'validation_failed'
  | 'processing'
  | 'completed'
  | 'processing_failed'
  | 'cancelled';

@Entity('import_jobs')
export class ImportJob {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  filename: string;

  @Column({ type: 'text' })
  filepath: string;

  @Column({ type: 'bigint' })
  fileSize: number;

  @Column({
    type: 'varchar',
    default: 'uploaded',
  })
  status: ImportJobStatus;

  @Column({ type: 'uuid' })
  uploadedBy: string;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'uploadedBy' })
  uploadedByUser: User;

  @Column({ type: 'text', nullable: true })
  metadata: {
    originalName?: string;
    mimeType?: string;
    uploadTimestamp?: number;
    [key: string]: any;
  };

  @Column({ type: 'text', nullable: true })
  validationResults: any[];

  @Column({ type: 'text', nullable: true })
  stats: {
    totalRows?: number;
    validRows?: number;
    invalidRows?: number;
    processedRows?: number;
    duplicates?: number;
    errors?: number;
  };

  @Column({ type: 'text', array: true, nullable: true })
  processingErrors: string[];

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @Column({ type: 'datetime', nullable: true })
  validationStartedAt: Date;

  @Column({ type: 'datetime', nullable: true })
  validationCompletedAt: Date;

  @Column({ type: 'datetime', nullable: true })
  processingStartedAt: Date;

  @Column({ type: 'datetime', nullable: true })
  processingCompletedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Helper methods
  get duration(): number | null {
    if (this.processingCompletedAt && this.processingStartedAt) {
      return this.processingCompletedAt.getTime() - this.processingStartedAt.getTime();
    }
    return null;
  }

  get validationDuration(): number | null {
    if (this.validationCompletedAt && this.validationStartedAt) {
      return this.validationCompletedAt.getTime() - this.validationStartedAt.getTime();
    }
    return null;
  }

  get isCompleted(): boolean {
    return this.status === 'completed';
  }

  get isFailed(): boolean {
    return this.status === 'validation_failed' || this.status === 'processing_failed';
  }

  get isProcessing(): boolean {
    return this.status === 'validating' || this.status === 'processing';
  }

  get successRate(): number {
    if (!this.stats || !this.stats.totalRows || this.stats.totalRows === 0) {
      return 0;
    }
    return (this.stats.processedRows || 0) / this.stats.totalRows * 100;
  }

  get fileSizeFormatted(): string {
    const bytes = this.fileSize;
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
