import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';

export enum SearchFrequency {
  INSTANT = 'instant',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  NEVER = 'never',
}

export enum SearchStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  EXPIRED = 'expired',
  DELETED = 'deleted',
}

@Entity('saved_searches')
export class SavedSearch {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column()
  name: string;

  @ApiProperty()
  @Column('text', { nullable: true })
  description: string;

  @ApiProperty({ enum: SearchStatus })
  @Column({
    type: 'varchar',
    
    default: SearchStatus.ACTIVE,
  })
  status: SearchStatus;

  // Search Criteria
  @ApiProperty()
  @Column('json')
  searchCriteria: any; // Complete search parameters

  @ApiProperty()
  @Column({ nullable: true })
  location: string;

  @ApiProperty()
  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  minPrice: number;

  @ApiProperty()
  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  maxPrice: number;

  @ApiProperty()
  @Column({ nullable: true })
  minBedrooms: number;

  @ApiProperty()
  @Column({ nullable: true })
  maxBedrooms: number;

  @ApiProperty()
  @Column({ nullable: true })
  minBathrooms: number;

  @ApiProperty()
  @Column({ nullable: true })
  maxBathrooms: number;

  @ApiProperty()
  @Column('simple-array', { nullable: true })
  propertyTypes: string[];

  @ApiProperty()
  @Column('simple-array', { nullable: true })
  listingTypes: string[]; // sale, rent, both

  @ApiProperty()
  @Column({ nullable: true })
  radius: number; // Search radius in miles/km

  @ApiProperty()
  @Column('simple-array', { nullable: true })
  amenities: string[];

  @ApiProperty()
  @Column('simple-array', { nullable: true })
  keywords: string[];

  @ApiProperty()
  @Column('simple-array', { nullable: true })
  excludeKeywords: string[];

  // Alert Settings
  @ApiProperty({ enum: SearchFrequency })
  @Column({
    type: 'varchar',
    
    default: SearchFrequency.DAILY,
  })
  alertFrequency: SearchFrequency;

  @ApiProperty()
  @Column({ default: true })
  emailAlerts: boolean;

  @ApiProperty()
  @Column({ default: false })
  smsAlerts: boolean;

  @ApiProperty()
  @Column({ default: true })
  pushNotifications: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  alertEmail: string; // Override user's default email

  @ApiProperty()
  @Column({ nullable: true })
  alertPhone: string; // Override user's default phone

  // Execution History
  @ApiProperty()
  @Column({ nullable: true })
  lastExecuted: Date;

  @ApiProperty()
  @Column({ default: 0 })
  executionCount: number;

  @ApiProperty()
  @Column({ default: 0 })
  totalResultsFound: number;

  @ApiProperty()
  @Column({ default: 0 })
  newResultsLastRun: number;

  @ApiProperty()
  @Column({ nullable: true })
  lastAlertSent: Date;

  @ApiProperty()
  @Column({ default: 0 })
  alertsSentCount: number;

  // Performance Metrics
  @ApiProperty()
  @Column({ nullable: true })
  averageExecutionTime: number; // in milliseconds

  @ApiProperty()
  @Column({ default: 0 })
  clickThroughCount: number; // How many times user clicked on results

  @ApiProperty()
  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  clickThroughRate: number;

  @ApiProperty()
  @Column({ default: 0 })
  bookingsFromSearch: number;

  @ApiProperty()
  @Column({ default: 0 })
  inquiriesFromSearch: number;

  // Configuration
  @ApiProperty()
  @Column({ default: 50 })
  maxResults: number; // Maximum results to return

  @ApiProperty()
  @Column({ default: false })
  includeNewListings: boolean;

  @ApiProperty()
  @Column({ default: false })
  includePriceChanges: boolean;

  @ApiProperty()
  @Column({ default: false })
  includeStatusChanges: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  sortBy: string; // price, date, relevance, etc.

  @ApiProperty()
  @Column({ nullable: true })
  sortOrder: string; // asc, desc

  // Sharing and Collaboration
  @ApiProperty()
  @Column({ default: false })
  isShared: boolean;

  @ApiProperty()
  @Column('simple-array', { nullable: true })
  sharedWithUsers: string[]; // User IDs

  @ApiProperty()
  @Column({ default: false })
  isPublic: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  publicShareToken: string;

  // Expiry and Limits
  @ApiProperty()
  @Column({ nullable: true })
  expiresAt: Date;

  @ApiProperty()
  @Column({ nullable: true })
  maxExecutions: number; // Limit number of executions

  @ApiProperty()
  @Column({ default: false })
  isPremium: boolean; // Premium search features

  // Machine Learning
  @ApiProperty()
  @Column('json', { nullable: true })
  userPreferences: any; // Learned preferences

  @ApiProperty()
  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  relevanceScore: number; // How relevant this search is to user

  @ApiProperty()
  @Column('simple-array', { nullable: true })
  suggestedRefinements: string[]; // AI suggestions to improve search

  // Relationships
  @ApiProperty()
  @Column('uuid')
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
