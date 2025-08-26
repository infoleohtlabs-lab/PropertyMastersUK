import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Property } from '../../properties/entities/property.entity';
import { User } from '../../users/entities/user.entity';

export enum AnalysisType {
  PROPERTY_VALUATION = 'property_valuation',
  MARKET_TRENDS = 'market_trends',
  RENTAL_YIELD = 'rental_yield',
  PRICE_COMPARISON = 'price_comparison',
  INVESTMENT_ANALYSIS = 'investment_analysis',
  AREA_ANALYSIS = 'area_analysis',
}

export enum AnalysisStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  EXPIRED = 'expired',
}

@Entity('market_analysis')
export class MarketAnalysis {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ enum: AnalysisType })
  @Column({
    type: 'varchar',
    
  })
  type: AnalysisType;

  @ApiProperty({ enum: AnalysisStatus })
  @Column({
    type: 'varchar',
    
    default: AnalysisStatus.PENDING,
  })
  status: AnalysisStatus;

  @ApiProperty()
  @Column()
  postcode: string;

  @ApiProperty()
  @Column({ nullable: true })
  area: string;

  @ApiProperty()
  @Column({ nullable: true })
  city: string;

  @ApiProperty()
  @Column({ nullable: true })
  county: string;

  @ApiProperty()
  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  estimatedValue: number;

  @ApiProperty()
  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  lowerEstimate: number;

  @ApiProperty()
  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  upperEstimate: number;

  @ApiProperty()
  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  confidenceScore: number; // 0-100

  @ApiProperty()
  @Column('decimal', { precision: 8, scale: 2, nullable: true })
  averageRent: number;

  @ApiProperty()
  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  rentalYield: number; // percentage

  @ApiProperty()
  @Column('decimal', { precision: 8, scale: 2, nullable: true })
  pricePerSqFt: number;

  @ApiProperty()
  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  priceChange1Year: number; // percentage

  @ApiProperty()
  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  priceChange3Year: number; // percentage

  @ApiProperty()
  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  priceChange5Year: number; // percentage

  @ApiProperty()
  @Column({ nullable: true })
  averageDaysOnMarket: number;

  @ApiProperty()
  @Column({ nullable: true })
  salesVolume: number;

  @ApiProperty()
  @Column({ nullable: true })
  demandScore: number; // 1-10

  @ApiProperty()
  @Column({ nullable: true })
  supplyScore: number; // 1-10

  @ApiProperty()
  @Column('json', { nullable: true })
  comparableProperties: any; // Array of similar properties

  @ApiProperty()
  @Column('json', { nullable: true })
  marketTrends: any; // Historical price data

  @ApiProperty()
  @Column('json', { nullable: true })
  areaStatistics: any; // Local area data

  @ApiProperty()
  @Column('json', { nullable: true })
  investmentMetrics: any; // ROI, cash flow, etc.

  @ApiProperty()
  @Column('simple-array', { nullable: true })
  dataSourcesUsed: string[];

  @ApiProperty()
  @Column({ type: 'datetime', nullable: true })
  lastUpdated: Date;

  @ApiProperty()
  @Column({ type: 'datetime', nullable: true })
  expiryDate: Date;

  @ApiProperty()
  @Column('text', { nullable: true })
  summary: string;

  @ApiProperty()
  @Column('text', { nullable: true })
  recommendations: string;

  @ApiProperty()
  @Column('text', { nullable: true })
  riskFactors: string;

  @ApiProperty()
  @Column('text', { nullable: true })
  marketOutlook: string;

  @ApiProperty()
  @Column('json', { nullable: true })
  rawData: any; // Original API response data

  @ApiProperty()
  @Column('text', { nullable: true })
  errorMessage: string;

  @ApiProperty()
  @Column({ nullable: true })
  processingTime: number; // in milliseconds

  // Relationships
  @ApiProperty()
  @Column('uuid', { nullable: true })
  propertyId: string;

  @ManyToOne(() => Property)
  @JoinColumn({ name: 'propertyId' })
  property: Property;

  @ApiProperty()
  @Column('uuid')
  requestedById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'requestedById' })
  requestedBy: User;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
