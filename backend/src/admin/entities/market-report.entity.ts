import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { PropertyType, ReportType } from '../dto/market-analysis.dto';

@Entity('market_reports')
@Index(['type'])
@Index(['status'])
@Index(['generatedAt'])
@Index(['location', 'propertyType'])
export class MarketReport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  title: string;

  @Column({
    type: 'varchar',
  })
  type: ReportType;

  @Column({ length: 200, nullable: true })
  location?: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  propertyType?: PropertyType;

  @Column({ length: 50 })
  period: string;

  @Column({ name: 'generated_at' })
  generatedAt: Date;

  @Column({ name: 'file_url', length: 500, nullable: true })
  fileUrl?: string;

  @Column({
    type: 'varchar',
    default: 'generating',
  })
  status: 'generating' | 'completed' | 'failed';

  @Column('text')
  summary: {
    totalProperties: number;
    averagePrice: number;
    priceChange: number;
    keyInsights: string[];
  };

  @Column('text', { nullable: true })
  configuration?: {
    includeCharts: boolean;
    includeComparisons: boolean;
    dataFilters: Record<string, any>;
    customSections: string[];
  };

  @Column('text', { nullable: true })
  metadata?: {
    dataSourcesUsed: string[];
    recordsAnalyzed: number;
    generationTimeMs: number;
    fileSize?: number;
    pageCount?: number;
  };

  @Column('text', { nullable: true })
  description?: string;

  @Column('text', { nullable: true })
  errorMessage?: string;

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'created_by', nullable: true })
  createdBy?: string;

  @Column({ name: 'updated_by', nullable: true })
  updatedBy?: string;

  // Helper methods
  isCompleted(): boolean {
    return this.status === 'completed';
  }

  isFailed(): boolean {
    return this.status === 'failed';
  }

  isGenerating(): boolean {
    return this.status === 'generating';
  }

  getFormattedTitle(): string {
    return this.title
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  getFormattedType(): string {
    return this.type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  getFormattedLocation(): string {
    if (!this.location) return 'All Locations';
    return this.location
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  getFormattedPropertyType(): string {
    if (!this.propertyType) return 'All Property Types';
    return this.propertyType
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  getGenerationDuration(): number {
    if (!this.metadata?.generationTimeMs) return 0;
    return Math.round(this.metadata.generationTimeMs / 1000); // Convert to seconds
  }

  getFileSizeFormatted(): string {
    if (!this.metadata?.fileSize) return 'Unknown';
    const size = this.metadata.fileSize;
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }

  hasCharts(): boolean {
    return this.configuration?.includeCharts || false;
  }

  hasComparisons(): boolean {
    return this.configuration?.includeComparisons || false;
  }

  getKeyInsightsCount(): number {
    return this.summary?.keyInsights?.length || 0;
  }

  getPriceChangeFormatted(): string {
    if (!this.summary?.priceChange) return '0%';
    const change = this.summary.priceChange;
    const sign = change > 0 ? '+' : '';
    return `${sign}${change.toFixed(1)}%`;
  }

  getAveragePriceFormatted(): string {
    if (!this.summary?.averagePrice) return '£0';
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(this.summary.averagePrice);
  }

  isRecent(days: number = 7): boolean {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    return this.generatedAt >= cutoffDate;
  }

  canBeDownloaded(): boolean {
    return this.status === 'completed' && !!this.fileUrl;
  }

  getDownloadFilename(): string {
    const sanitizedTitle = this.title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
    const date = this.generatedAt.toISOString().split('T')[0];
    return `${sanitizedTitle}-${date}.pdf`;
  }
}
