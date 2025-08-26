import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Buyer } from './buyer.entity';
import { PropertyType } from '../../properties/entities/property.entity';

export enum SearchType {
  QUICK_SEARCH = 'quick_search',
  SAVED_SEARCH = 'saved_search',
  ALERT_SEARCH = 'alert_search',
  MARKET_ANALYSIS = 'market_analysis',
}

export enum SearchStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  EXPIRED = 'expired',
}

@Entity('property_searches')
export class PropertySearch {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column('uuid')
  buyerId: string;

  @ManyToOne(() => Buyer, buyer => buyer.searches)
  @JoinColumn({ name: 'buyerId' })
  buyer: Buyer;

  @ApiProperty({ enum: SearchType })
  @Column({
    type: 'varchar',
    
    default: SearchType.QUICK_SEARCH,
  })
  type: SearchType;

  @ApiProperty({ enum: SearchStatus })
  @Column({
    type: 'varchar',
    
    default: SearchStatus.ACTIVE,
  })
  status: SearchStatus;

  @ApiProperty()
  @Column()
  name: string;

  @ApiProperty()
  @Column('text', { nullable: true })
  description: string;

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
  propertyTypes: PropertyType[];

  @ApiProperty()
  @Column('simple-array', { nullable: true })
  locations: string[];

  @ApiProperty()
  @Column('simple-array', { nullable: true })
  postcodes: string[];

  @ApiProperty()
  @Column({ nullable: true })
  radius: number;

  @ApiProperty()
  @Column('decimal', { precision: 10, scale: 8, nullable: true })
  centerLatitude: number;

  @ApiProperty()
  @Column('decimal', { precision: 11, scale: 8, nullable: true })
  centerLongitude: number;

  @ApiProperty()
  @Column('simple-array', { nullable: true })
  features: string[];

  @ApiProperty()
  @Column('simple-array', { nullable: true })
  amenities: string[];

  @ApiProperty()
  @Column({ nullable: true })
  newBuildOnly: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  chainFreeOnly: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  gardenRequired: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  parkingRequired: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  petFriendly: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  furnishedOnly: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  alertFrequency: string; // daily, weekly, monthly

  @ApiProperty()
  @Column({ nullable: true })
  lastAlertSent: Date;

  @ApiProperty()
  @Column({ default: 0 })
  resultsCount: number;

  @ApiProperty()
  @Column({ default: 0 })
  newResultsCount: number;

  @ApiProperty()
  @Column({ nullable: true })
  lastSearchDate: Date;

  @ApiProperty()
  @Column('text', { nullable: true })
  searchCriteria: string; // JSON string of full search criteria

  @ApiProperty()
  @Column('text', { nullable: true })
  savedResults: string; // JSON string of property IDs

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
