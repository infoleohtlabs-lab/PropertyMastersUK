import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { Property } from './property.entity';

export enum ComparisonStatus {
  ACTIVE = 'active',
  ARCHIVED = 'archived',
  SHARED = 'shared',
  DELETED = 'deleted',
}

@Entity('property_comparisons')
export class PropertyComparison {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column()
  name: string;

  @ApiProperty()
  @Column('text', { nullable: true })
  description: string;

  @ApiProperty({ enum: ComparisonStatus })
  @Column({
    type: 'varchar',
    
    default: ComparisonStatus.ACTIVE,
  })
  status: ComparisonStatus;

  @ApiProperty()
  @Column('simple-array')
  propertyIds: string[]; // Array of property IDs being compared

  @ApiProperty()
  @Column('json', { nullable: true })
  comparisonCriteria: any; // Criteria used for comparison

  @ApiProperty()
  @Column('json', { nullable: true })
  comparisonResults: any; // Calculated comparison results

  @ApiProperty()
  @Column('json', { nullable: true })
  userNotes: any; // User's notes on each property

  @ApiProperty()
  @Column('json', { nullable: true })
  ratings: any; // User ratings for each property

  @ApiProperty()
  @Column('simple-array', { nullable: true })
  favoriteProperties: string[]; // Marked as favorites within comparison

  @ApiProperty()
  @Column({ default: false })
  isShared: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  shareToken: string; // For sharing comparison with others

  @ApiProperty()
  @Column({ nullable: true })
  shareExpiresAt: Date;

  @ApiProperty()
  @Column('simple-array', { nullable: true })
  sharedWithEmails: string[]; // Emails of people comparison is shared with

  @ApiProperty()
  @Column({ default: 0 })
  viewCount: number;

  @ApiProperty()
  @Column({ nullable: true })
  lastViewedAt: Date;

  @ApiProperty()
  @Column('simple-array', { nullable: true })
  tags: string[];

  @ApiProperty()
  @Column('json', { nullable: true })
  filterSettings: any; // Saved filter preferences

  @ApiProperty()
  @Column('json', { nullable: true })
  sortSettings: any; // Saved sort preferences

  @ApiProperty()
  @Column({ default: false })
  isTemplate: boolean; // Can be used as template for future comparisons

  @ApiProperty()
  @Column({ nullable: true })
  templateName: string;

  // Calculated fields (computed from properties)
  @ApiProperty()
  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  averagePrice: number;

  @ApiProperty()
  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  priceRange: number; // max - min

  @ApiProperty()
  @Column('decimal', { precision: 8, scale: 2, nullable: true })
  averagePricePerSqFt: number;

  @ApiProperty()
  @Column({ nullable: true })
  averageBedrooms: number;

  @ApiProperty()
  @Column({ nullable: true })
  averageBathrooms: number;

  @ApiProperty()
  @Column('simple-array', { nullable: true })
  commonAmenities: string[]; // Amenities present in all properties

  @ApiProperty()
  @Column('simple-array', { nullable: true })
  uniqueAmenities: string[]; // Amenities unique to specific properties

  @ApiProperty()
  @Column('json', { nullable: true })
  locationAnalysis: any; // Distance to schools, transport, etc.

  @ApiProperty()
  @Column('json', { nullable: true })
  marketAnalysis: any; // Price trends, market position

  @ApiProperty()
  @Column('json', { nullable: true })
  investmentAnalysis: any; // ROI, rental yield, etc.

  @ApiProperty()
  @Column('json', { nullable: true })
  riskAnalysis: any; // Market risk, flood risk, etc.

  @ApiProperty()
  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  overallScore: number; // Weighted score based on criteria

  @ApiProperty()
  @Column({ nullable: true })
  recommendedPropertyId: string; // System recommendation

  @ApiProperty()
  @Column('text', { nullable: true })
  recommendationReason: string;

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
