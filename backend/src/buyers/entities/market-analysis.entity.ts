import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum AnalysisType {
  AREA_ANALYSIS = 'area_analysis',
  PRICE_TREND = 'price_trend',
  MARKET_FORECAST = 'market_forecast',
  COMPARABLE_SALES = 'comparable_sales',
  RENTAL_YIELD = 'rental_yield',
  INVESTMENT_ANALYSIS = 'investment_analysis',
}

export enum MarketTrend {
  RISING = 'rising',
  FALLING = 'falling',
  STABLE = 'stable',
  VOLATILE = 'volatile',
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

  @ApiProperty()
  @Column()
  area: string;

  @ApiProperty()
  @Column()
  postcode: string;

  @ApiProperty()
  @Column('decimal', { precision: 10, scale: 8, nullable: true })
  latitude: number;

  @ApiProperty()
  @Column('decimal', { precision: 11, scale: 8, nullable: true })
  longitude: number;

  @ApiProperty()
  @Column({ nullable: true })
  radius: number;

  @ApiProperty()
  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  averagePrice: number;

  @ApiProperty()
  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  medianPrice: number;

  @ApiProperty()
  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  pricePerSqFt: number;

  @ApiProperty({ enum: MarketTrend })
  @Column({
    type: 'varchar',
    
    nullable: true,
  })
  trend: MarketTrend;

  @ApiProperty()
  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  priceChangePercent: number;

  @ApiProperty()
  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  priceChange3Month: number;

  @ApiProperty()
  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  priceChange6Month: number;

  @ApiProperty()
  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  priceChange12Month: number;

  @ApiProperty()
  @Column({ nullable: true })
  averageDaysOnMarket: number;

  @ApiProperty()
  @Column({ nullable: true })
  salesVolume: number;

  @ApiProperty()
  @Column({ nullable: true })
  activeListings: number;

  @ApiProperty()
  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  saleToListRatio: number;

  @ApiProperty()
  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  averageRentalYield: number;

  @ApiProperty()
  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  averageRent: number;

  @ApiProperty()
  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  rentalGrowthRate: number;

  @ApiProperty()
  @Column({ nullable: true })
  schoolRating: number;

  @ApiProperty()
  @Column({ nullable: true })
  crimeRating: number;

  @ApiProperty()
  @Column({ nullable: true })
  transportScore: number;

  @ApiProperty()
  @Column({ nullable: true })
  amenityScore: number;

  @ApiProperty()
  @Column('text', { nullable: true })
  demographicData: string; // JSON string

  @ApiProperty()
  @Column('text', { nullable: true })
  economicIndicators: string; // JSON string

  @ApiProperty()
  @Column('text', { nullable: true })
  developmentPlans: string; // JSON string

  @ApiProperty()
  @Column('text', { nullable: true })
  marketInsights: string;

  @ApiProperty()
  @Column('text', { nullable: true })
  investmentRecommendation: string;

  @ApiProperty()
  @Column('text', { nullable: true })
  riskFactors: string;

  @ApiProperty()
  @Column('text', { nullable: true })
  opportunities: string;

  @ApiProperty()
  @Column({ nullable: true })
  dataSource: string;

  @ApiProperty()
  @Column({ type: 'datetime', nullable: true })
  analysisDate: Date;

  @ApiProperty()
  @Column({ type: 'datetime', nullable: true })
  validUntil: Date;

  @ApiProperty()
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
