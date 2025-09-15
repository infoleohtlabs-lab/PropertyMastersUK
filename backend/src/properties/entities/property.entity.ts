import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { TenantOrganization } from '../../common/entities/tenant-organization.entity';

export enum PropertyType {
  HOUSE = 'house',
  FLAT = 'flat',
  APARTMENT = 'apartment',
  BUNGALOW = 'bungalow',
  MAISONETTE = 'maisonette',
  TERRACED = 'terraced',
  SEMI_DETACHED = 'semi_detached',
  DETACHED = 'detached',
  STUDIO = 'studio',
  PENTHOUSE = 'penthouse',
  LAND = 'land',
  COMMERCIAL = 'commercial',
  OFFICE = 'office',
  RETAIL = 'retail',
  WAREHOUSE = 'warehouse',
  INDUSTRIAL = 'industrial',
}

export enum ListingType {
  SALE = 'sale',
  RENT = 'rent',
  BOTH = 'both',
}

export enum PropertyStatus {
  AVAILABLE = 'available',
  UNDER_OFFER = 'under_offer',
  SOLD = 'sold',
  LET = 'let',
  WITHDRAWN = 'withdrawn',
  MAINTENANCE = 'maintenance',
  DRAFT = 'draft',
}

@Entity('properties')
export class Property {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ nullable: true })
  title: string;

  @ApiProperty()
  @Column('text', { nullable: true })
  description: string;

  @ApiProperty({ enum: PropertyType })
  @Column({
    type: 'varchar',
    nullable: true,
  })
  type: PropertyType;

  @ApiProperty({ enum: ListingType })
  @Column({
    type: 'varchar',
    
    default: ListingType.RENT,
  })
  listingType: ListingType;

  @ApiProperty({ enum: PropertyStatus })
  @Column({
    type: 'varchar',
    
    default: PropertyStatus.AVAILABLE,
  })
  status: PropertyStatus;

  @ApiProperty()
  @Column('decimal', { precision: 12, scale: 2 })
  price: number;

  @ApiProperty()
  @Column({ nullable: true })
  bedrooms: number;

  @ApiProperty()
  @Column({ nullable: true })
  bathrooms: number;

  @ApiProperty()
  @Column({ nullable: true })
  receptionRooms: number;

  @ApiProperty()
  @Column({ nullable: true })
  squareFeet: number;

  @ApiProperty()
  @Column({ nullable: true })
  addressLine1: string;

  @ApiProperty()
  @Column({ nullable: true })
  addressLine2: string;

  @ApiProperty()
  @Column({ nullable: true })
  postcode: string;

  @ApiProperty()
  @Column({ nullable: true })
  city: string;

  @ApiProperty()
  @Column({ nullable: true })
  county: string;

  @ApiProperty()
  @Column('decimal', { precision: 10, scale: 8, nullable: true })
  latitude: number;

  @ApiProperty()
  @Column('decimal', { precision: 11, scale: 8, nullable: true })
  longitude: number;

  @ApiProperty()
  @Column('simple-array', { nullable: true })
  images: string[];

  @ApiProperty()
  @Column('simple-array', { nullable: true })
  amenities: string[];

  @ApiProperty()
  @Column({ nullable: true })
  councilTaxBand: string;

  @ApiProperty()
  @Column('decimal', { precision: 8, scale: 2, nullable: true })
  councilTaxAmount: number;

  @ApiProperty()
  @Column({ nullable: true })
  epcRating: string;

  @ApiProperty()
  @Column({ nullable: true })
  epcScore: number;

  @ApiProperty()
  @Column({ nullable: true })
  tenure: string;

  @ApiProperty()
  @Column({ nullable: true })
  leaseholdYearsRemaining: number;

  @ApiProperty()
  @Column('decimal', { precision: 8, scale: 2, nullable: true })
  serviceCharge: number;

  @ApiProperty()
  @Column('decimal', { precision: 8, scale: 2, nullable: true })
  groundRent: number;

  @ApiProperty()
  @Column({ nullable: true })
  availableFrom: Date;

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
  @Column('decimal', { precision: 8, scale: 2, nullable: true })
  deposit: number;

  @ApiProperty()
  @Column({ nullable: true })
  minimumTenancyLength: number;

  @ApiProperty()
  @Column({ nullable: true })
  maximumTenancyLength: number;

  @ApiProperty()
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty()
  @Column({ default: false })
  isFeatured: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  tenantOrganizationId: string;

  @ManyToOne(() => TenantOrganization)
  @JoinColumn({ name: 'tenantOrganizationId' })
  tenantOrganization: TenantOrganization;

  @ApiProperty()
  @Column({ nullable: true })
  uprn: string; // Unique Property Reference Number

  @ApiProperty()
  @Column({ nullable: true })
  landRegistryTitleNumber: string;

  @ApiProperty()
  @Column({ nullable: true })
  propertyAge: string;

  @ApiProperty()
  @Column({ nullable: true })
  constructionType: string;

  @ApiProperty()
  @Column({ nullable: true })
  heatingType: string;

  @ApiProperty()
  @Column({ nullable: true })
  parkingSpaces: number;

  @ApiProperty()
  @Column({ default: false })
  hasGarden: boolean;

  @ApiProperty()
  @Column({ default: false })
  hasBalcony: boolean;

  @ApiProperty()
  @Column({ default: false })
  hasGarage: boolean;

  @ApiProperty()
  @Column('simple-array', { nullable: true })
  nearbySchools: string[];

  @ApiProperty()
  @Column('simple-array', { nullable: true })
  transportLinks: string[];

  @ApiProperty()
  @Column({ nullable: true })
  floorPlan: string;

  @ApiProperty()
  @Column({ nullable: true })
  virtualTourUrl: string;

  @ApiProperty()
  @Column({ nullable: true })
  videoTourUrl: string;

  @ApiProperty()
  @Column('simple-array', { nullable: true })
  documents: string[];

  @ApiProperty()
  @Column({ nullable: true })
  lastInspectionDate: Date;

  @ApiProperty()
  @Column({ nullable: true })
  nextInspectionDate: Date;

  @ApiProperty()
  @Column('uuid', { nullable: true })
  agentId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'agentId' })
  agent: User;

  @ApiProperty()
  @Column('uuid', { nullable: true })
  landlordId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'landlordId' })
  landlord: User;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
