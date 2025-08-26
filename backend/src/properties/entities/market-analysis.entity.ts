import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Property } from './property.entity';
import { User } from '../../users/entities/user.entity';

export enum AnalysisType {
  VALUATION = 'valuation',
  RENTAL_YIELD = 'rental_yield',
  MARKET_TRENDS = 'market_trends',
  COMPARATIVE = 'comparative',
  INVESTMENT = 'investment',
}

export enum AnalysisStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  EXPIRED = 'expired',
}

@Entity('market_analysis')
export class MarketAnalysis {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  propertyId: string;

  @ManyToOne(() => Property)
  @JoinColumn({ name: 'propertyId' })
  property: Property;

  @Column('uuid', { nullable: true })
  requestedBy: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'requestedBy' })
  requester: User;

  @Column({
    type: 'varchar',
    
    default: AnalysisType.VALUATION,
  })
  analysisType: AnalysisType;

  @Column({
    type: 'varchar',
    
    default: AnalysisStatus.PENDING,
  })
  status: AnalysisStatus;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  estimatedValue: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  minValue: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  maxValue: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  confidenceScore: number; // 0-100

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  rentalYield: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  monthlyRental: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  marketTrend: number; // percentage change

  @Column({ type: 'json', nullable: true })
  comparableProperties: Record<string, any>[];

  @Column({ type: 'json', nullable: true })
  marketFactors: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  priceHistory: Record<string, any>[];

  @Column({ type: 'json', nullable: true })
  areaStatistics: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  investmentMetrics: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  methodology: string;

  @Column({ type: 'text', nullable: true })
  assumptions: string;

  @Column({ type: 'text', nullable: true })
  limitations: string;

  @Column({ type: 'text', nullable: true })
  recommendations: string;

  @Column({ type: 'json', nullable: true })
  dataSource: Record<string, any>;

  @Column({ type: 'datetime', nullable: true })
  analysisDate: Date;

  @Column({ type: 'datetime', nullable: true })
  expiryDate: Date;

  @Column({ type: 'varchar', length: 50, nullable: true })
  version: string;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
