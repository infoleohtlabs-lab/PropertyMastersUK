import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { PropertyType, MarketDataSource } from '../dto/market-analysis.dto';

@Entity('market_data')
@Index(['location', 'propertyType', 'recordDate'])
@Index(['recordDate'])
@Index(['source'])
export class MarketData {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  location: string;

  @Column({
    type: 'varchar',
  })
  propertyType: PropertyType;

  @Column('decimal', { precision: 12, scale: 2 })
  averagePrice: number;

  @Column('decimal', { precision: 12, scale: 2 })
  medianPrice: number;

  @Column('int')
  salesVolume: number;

  @Column('int', { nullable: true })
  averageDaysOnMarket?: number;

  @Column('decimal', { precision: 8, scale: 2, nullable: true })
  pricePerSqFt?: number;

  @Column('date')
  recordDate: Date;

  @Column({
    type: 'varchar',
    default: MarketDataSource.MANUAL,
  })
  source: MarketDataSource;

  @Column('text', { nullable: true })
  notes?: string;

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

  // Calculated fields
  getPriceChangePercent(previousPrice: number): number {
    if (!previousPrice) return 0;
    return ((this.averagePrice - previousPrice) / previousPrice) * 100;
  }

  getVolumeChangePercent(previousVolume: number): number {
    if (!previousVolume) return 0;
    return ((this.salesVolume - previousVolume) / previousVolume) * 100;
  }

  isRecent(days: number = 30): boolean {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    return this.recordDate >= cutoffDate;
  }

  getFormattedLocation(): string {
    return this.location
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  getFormattedPropertyType(): string {
    return this.propertyType
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
}
