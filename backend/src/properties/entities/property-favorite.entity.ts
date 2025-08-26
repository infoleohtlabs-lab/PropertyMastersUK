import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { Property } from './property.entity';

export enum FavoriteStatus {
  ACTIVE = 'active',
  ARCHIVED = 'archived',
  REMOVED = 'removed',
}

export enum FavoriteType {
  WISHLIST = 'wishlist',
  SHORTLIST = 'shortlist',
  WATCHING = 'watching',
  COMPARISON = 'comparison',
  INVESTMENT = 'investment',
}

@Entity('property_favorites')
@Unique(['userId', 'propertyId']) // Prevent duplicate favorites
export class PropertyFavorite {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ enum: FavoriteStatus })
  @Column({
    type: 'varchar',
    
    default: FavoriteStatus.ACTIVE,
  })
  status: FavoriteStatus;

  @ApiProperty({ enum: FavoriteType })
  @Column({
    type: 'varchar',
    
    default: FavoriteType.WISHLIST,
  })
  type: FavoriteType;

  @ApiProperty()
  @Column('text', { nullable: true })
  notes: string; // User's personal notes about the property

  @ApiProperty()
  @Column({ nullable: true })
  rating: number; // User's rating 1-5 stars

  @ApiProperty()
  @Column('simple-array', { nullable: true })
  tags: string[]; // Custom tags by user

  @ApiProperty()
  @Column({ nullable: true })
  reminderDate: Date; // When to remind user about this property

  @ApiProperty()
  @Column({ default: false })
  reminderSent: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  priceWhenFavorited: number; // Price when user favorited it

  @ApiProperty()
  @Column({ nullable: true })
  currentPrice: number; // Current price (updated periodically)

  @ApiProperty()
  @Column('decimal', { precision: 8, scale: 2, nullable: true })
  priceChange: number; // Difference from when favorited

  @ApiProperty()
  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  priceChangePercentage: number;

  @ApiProperty()
  @Column({ default: false })
  priceAlerts: boolean; // Alert on price changes

  @ApiProperty()
  @Column({ default: false })
  statusAlerts: boolean; // Alert on status changes

  @ApiProperty()
  @Column({ default: false })
  availabilityAlerts: boolean; // Alert when becomes available

  @ApiProperty()
  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  priceAlertThreshold: number; // Alert if price changes by this %

  @ApiProperty()
  @Column({ default: 0 })
  viewCount: number; // How many times user viewed this property

  @ApiProperty()
  @Column({ nullable: true })
  lastViewedAt: Date;

  @ApiProperty()
  @Column({ default: 0 })
  shareCount: number; // How many times user shared this property

  @ApiProperty()
  @Column({ nullable: true })
  lastSharedAt: Date;

  @ApiProperty()
  @Column({ default: false })
  hasInquired: boolean; // Has user inquired about this property

  @ApiProperty()
  @Column({ nullable: true })
  inquiredAt: Date;

  @ApiProperty()
  @Column({ default: false })
  hasBooked: boolean; // Has user booked viewing

  @ApiProperty()
  @Column({ nullable: true })
  bookedAt: Date;

  @ApiProperty()
  @Column({ default: false })
  hasApplied: boolean; // Has user applied for this property

  @ApiProperty()
  @Column({ nullable: true })
  appliedAt: Date;

  @ApiProperty()
  @Column('json', { nullable: true })
  searchCriteria: any; // Search that led to this favorite

  @ApiProperty()
  @Column({ nullable: true })
  source: string; // How user found this property

  @ApiProperty()
  @Column('json', { nullable: true })
  comparisonData: any; // Data for property comparison

  @ApiProperty()
  @Column({ nullable: true })
  priority: number; // User's priority ranking (1-10)

  @ApiProperty()
  @Column('json', { nullable: true })
  customFields: any; // User-defined custom data

  @ApiProperty()
  @Column({ nullable: true })
  folder: string; // User-defined folder/category

  @ApiProperty()
  @Column({ default: false })
  isPrivate: boolean; // Private favorite (not shared)

  @ApiProperty()
  @Column({ default: false })
  isShared: boolean; // Shared with others

  @ApiProperty()
  @Column('simple-array', { nullable: true })
  sharedWith: string[]; // Email addresses shared with

  @ApiProperty()
  @Column({ nullable: true })
  shareToken: string; // Token for sharing

  @ApiProperty()
  @Column({ nullable: true })
  shareExpiresAt: Date;

  // Analytics
  @ApiProperty()
  @Column({ default: 0 })
  engagementScore: number; // Calculated engagement score

  @ApiProperty()
  @Column({ nullable: true })
  lastEngagementAt: Date;

  @ApiProperty()
  @Column('json', { nullable: true })
  activityHistory: any; // History of user actions

  // Machine Learning
  @ApiProperty()
  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  relevanceScore: number; // ML-calculated relevance

  @ApiProperty()
  @Column('json', { nullable: true })
  similarProperties: any; // AI-suggested similar properties

  @ApiProperty()
  @Column('simple-array', { nullable: true })
  recommendedActions: string[]; // AI-suggested next actions

  // Relationships
  @ApiProperty()
  @Column('uuid')
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

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
