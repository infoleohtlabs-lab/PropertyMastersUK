import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Property } from './property.entity';

export enum AnalyticsType {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
}

export enum MetricType {
  VIEWS = 'views',
  INQUIRIES = 'inquiries',
  BOOKINGS = 'bookings',
  APPLICATIONS = 'applications',
  OFFERS = 'offers',
  CONVERSIONS = 'conversions',
}

@Entity('property_analytics')
export class PropertyAnalytics {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ enum: AnalyticsType })
  @Column({
    type: 'varchar',
    
  })
  type: AnalyticsType;

  @ApiProperty()
  @Column()
  periodStart: Date;

  @ApiProperty()
  @Column()
  periodEnd: Date;

  // View Metrics
  @ApiProperty()
  @Column({ default: 0 })
  totalViews: number;

  @ApiProperty()
  @Column({ default: 0 })
  uniqueViews: number;

  @ApiProperty()
  @Column({ default: 0 })
  mobileViews: number;

  @ApiProperty()
  @Column({ default: 0 })
  desktopViews: number;

  @ApiProperty()
  @Column({ default: 0 })
  tabletViews: number;

  // Engagement Metrics
  @ApiProperty()
  @Column({ default: 0 })
  totalInquiries: number;

  @ApiProperty()
  @Column({ default: 0 })
  phoneInquiries: number;

  @ApiProperty()
  @Column({ default: 0 })
  emailInquiries: number;

  @ApiProperty()
  @Column({ default: 0 })
  formInquiries: number;

  @ApiProperty()
  @Column({ default: 0 })
  totalBookings: number;

  @ApiProperty()
  @Column({ default: 0 })
  viewingBookings: number;

  @ApiProperty()
  @Column({ default: 0 })
  virtualViewings: number;

  @ApiProperty()
  @Column({ default: 0 })
  completedViewings: number;

  @ApiProperty()
  @Column({ default: 0 })
  cancelledViewings: number;

  // Application Metrics
  @ApiProperty()
  @Column({ default: 0 })
  totalApplications: number;

  @ApiProperty()
  @Column({ default: 0 })
  approvedApplications: number;

  @ApiProperty()
  @Column({ default: 0 })
  rejectedApplications: number;

  @ApiProperty()
  @Column({ default: 0 })
  pendingApplications: number;

  // Offer Metrics (for sales)
  @ApiProperty()
  @Column({ default: 0 })
  totalOffers: number;

  @ApiProperty()
  @Column({ default: 0 })
  acceptedOffers: number;

  @ApiProperty()
  @Column({ default: 0 })
  rejectedOffers: number;

  @ApiProperty()
  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  averageOfferAmount: number;

  @ApiProperty()
  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  highestOffer: number;

  @ApiProperty()
  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  lowestOffer: number;

  // Time Metrics
  @ApiProperty()
  @Column({ nullable: true })
  averageTimeOnSite: number; // in seconds

  @ApiProperty()
  @Column({ nullable: true })
  averageViewingDuration: number; // in minutes

  @ApiProperty()
  @Column({ nullable: true })
  averageResponseTime: number; // in hours

  // Conversion Metrics
  @ApiProperty()
  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  viewToInquiryRate: number; // percentage

  @ApiProperty()
  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  inquiryToBookingRate: number; // percentage

  @ApiProperty()
  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  bookingToApplicationRate: number; // percentage

  @ApiProperty()
  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  applicationToOfferRate: number; // percentage

  @ApiProperty()
  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  offerAcceptanceRate: number; // percentage

  // Geographic Data
  @ApiProperty()
  @Column('json', { nullable: true })
  viewerLocations: any; // Country/city breakdown

  @ApiProperty()
  @Column('json', { nullable: true })
  trafficSources: any; // Direct, search, social, etc.

  // Search Keywords
  @ApiProperty()
  @Column('simple-array', { nullable: true })
  topSearchKeywords: string[];

  // Performance Scores
  @ApiProperty()
  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  performanceScore: number; // 0-100

  @ApiProperty()
  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  marketPositionScore: number; // vs similar properties

  @ApiProperty()
  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  priceCompetitivenessScore: number;

  // Social Media Metrics
  @ApiProperty()
  @Column({ default: 0 })
  socialShares: number;

  @ApiProperty()
  @Column({ default: 0 })
  socialLikes: number;

  @ApiProperty()
  @Column({ default: 0 })
  socialComments: number;

  // Email Marketing
  @ApiProperty()
  @Column({ default: 0 })
  emailOpens: number;

  @ApiProperty()
  @Column({ default: 0 })
  emailClicks: number;

  @ApiProperty()
  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  emailOpenRate: number;

  @ApiProperty()
  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  emailClickRate: number;

  // Additional Metrics
  @ApiProperty()
  @Column({ default: 0 })
  favoriteCount: number;

  @ApiProperty()
  @Column({ default: 0 })
  shareCount: number;

  @ApiProperty()
  @Column({ default: 0 })
  printCount: number;

  @ApiProperty()
  @Column('json', { nullable: true })
  customMetrics: any; // For future extensibility

  // Relationships
  @ApiProperty()
  @Column('uuid')
  propertyId: string;

  @ManyToOne(() => Property)
  @JoinColumn({ name: 'propertyId' })
  property: Property;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
