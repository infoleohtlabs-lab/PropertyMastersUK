import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.entity';

export enum SearchFrequency {
  INSTANT = 'instant',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  NEVER = 'never',
}

export enum PropertyType {
  HOUSE = 'house',
  FLAT = 'flat',
  BUNGALOW = 'bungalow',
  MAISONETTE = 'maisonette',
  TERRACED = 'terraced',
  SEMI_DETACHED = 'semi_detached',
  DETACHED = 'detached',
  STUDIO = 'studio',
  LAND = 'land',
  COMMERCIAL = 'commercial',
}

export enum ListingType {
  SALE = 'sale',
  RENT = 'rent',
  BOTH = 'both',
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

  // Search Criteria
  @ApiProperty({ enum: ListingType })
  @Column({
    type: 'varchar',
    
    default: ListingType.SALE,
  })
  listingType: ListingType;

  @ApiProperty()
  @Column('simple-array', { nullable: true })
  propertyTypes: PropertyType[];

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
  @Column({ nullable: true })
  minReceptionRooms: number;

  @ApiProperty()
  @Column({ nullable: true })
  maxReceptionRooms: number;

  @ApiProperty()
  @Column({ nullable: true })
  minSquareFeet: number;

  @ApiProperty()
  @Column({ nullable: true })
  maxSquareFeet: number;

  // Location Criteria
  @ApiProperty()
  @Column('simple-array', { nullable: true })
  postcodes: string[];

  @ApiProperty()
  @Column('simple-array', { nullable: true })
  areas: string[];

  @ApiProperty()
  @Column('simple-array', { nullable: true })
  cities: string[];

  @ApiProperty()
  @Column('simple-array', { nullable: true })
  counties: string[];

  @ApiProperty()
  @Column('decimal', { precision: 10, scale: 8, nullable: true })
  latitude: number;

  @ApiProperty()
  @Column('decimal', { precision: 11, scale: 8, nullable: true })
  longitude: number;

  @ApiProperty()
  @Column({ nullable: true })
  radiusMiles: number;

  // Additional Filters
  @ApiProperty()
  @Column('simple-array', { nullable: true })
  amenities: string[];

  @ApiProperty()
  @Column('simple-array', { nullable: true })
  councilTaxBands: string[];

  @ApiProperty()
  @Column('simple-array', { nullable: true })
  epcRatings: string[];

  @ApiProperty()
  @Column('simple-array', { nullable: true })
  tenures: string[];

  @ApiProperty()
  @Column({ nullable: true })
  furnishingType: string;

  @ApiProperty()
  @Column({ default: false })
  petsAllowed: boolean;

  @ApiProperty()
  @Column({ default: false })
  smokingAllowed: boolean;

  @ApiProperty()
  @Column({ default: false })
  studentsAllowed: boolean;

  @ApiProperty()
  @Column({ default: false })
  dssAccepted: boolean;

  @ApiProperty()
  @Column({ default: false })
  hasGarden: boolean;

  @ApiProperty()
  @Column({ default: false })
  hasParking: boolean;

  @ApiProperty()
  @Column({ default: false })
  hasBalcony: boolean;

  @ApiProperty()
  @Column({ default: false })
  newBuild: boolean;

  @ApiProperty()
  @Column({ default: false })
  retirement: boolean;

  @ApiProperty()
  @Column({ default: false })
  sharedOwnership: boolean;

  // Date Filters
  @ApiProperty()
  @Column({ nullable: true })
  addedSince: Date;

  @ApiProperty()
  @Column({ nullable: true })
  availableFrom: Date;

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
  @Column({ default: false })
  pushNotifications: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  lastAlertSent: Date;

  @ApiProperty()
  @Column({ default: 0 })
  alertsSentCount: number;

  @ApiProperty()
  @Column({ nullable: true })
  lastMatchCount: number;

  // Search Metadata
  @ApiProperty()
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty()
  @Column({ default: false })
  isFavorite: boolean;

  @ApiProperty()
  @Column({ default: 0 })
  searchCount: number;

  @ApiProperty()
  @Column({ nullable: true })
  lastSearched: Date;

  @ApiProperty()
  @Column('json', { nullable: true })
  searchResults: any; // Cache recent results

  @ApiProperty()
  @Column('simple-array', { nullable: true })
  tags: string[];

  @ApiProperty()
  @Column('text', { nullable: true })
  notes: string;

  // Relationships
  @ApiProperty()
  @Column('uuid')
  userId: string;

  @ManyToOne(() => User, user => user.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
