import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Landlord } from './landlord.entity';
import { Property } from '../../properties/entities/property.entity';
import { TenancyAgreement } from './tenancy-agreement.entity';
import { MaintenanceRequest } from './maintenance-request.entity';
import { PropertyInspection } from './property-inspection.entity';

export enum PropertyStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  MAINTENANCE = 'maintenance',
  RENOVATION = 'renovation',
  SOLD = 'sold',
  WITHDRAWN = 'withdrawn',
}

export enum PropertyCondition {
  EXCELLENT = 'excellent',
  GOOD = 'good',
  FAIR = 'fair',
  POOR = 'poor',
  NEEDS_RENOVATION = 'needs_renovation',
}

export enum FurnishingType {
  UNFURNISHED = 'unfurnished',
  PART_FURNISHED = 'part_furnished',
  FULLY_FURNISHED = 'fully_furnished',
}

@Entity('landlord_properties')
export class LandlordProperty {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column('uuid')
  landlordId: string;

  @ManyToOne(() => Landlord, landlord => landlord.properties)
  @JoinColumn({ name: 'landlordId' })
  landlord: Landlord;

  @ApiProperty()
  @Column('uuid', { nullable: true })
  propertyId: string;

  @ManyToOne(() => Property, { nullable: true })
  @JoinColumn({ name: 'propertyId' })
  property: Property;

  @ApiProperty({ enum: PropertyStatus })
  @Column({
    type: 'varchar',
    
    default: PropertyStatus.AVAILABLE,
  })
  status: PropertyStatus;

  @ApiProperty({ enum: PropertyCondition })
  @Column({
    type: 'varchar',
    
    default: PropertyCondition.GOOD,
  })
  condition: PropertyCondition;

  @ApiProperty({ enum: FurnishingType })
  @Column({
    type: 'varchar',
    
    default: FurnishingType.UNFURNISHED,
  })
  furnishing: FurnishingType;

  // Financial Information
  @ApiProperty()
  @Column('decimal', { precision: 12, scale: 2 })
  purchasePrice: number;

  @ApiProperty()
  @Column({ nullable: true })
  purchaseDate: Date;

  @ApiProperty()
  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  currentValue: number;

  @ApiProperty()
  @Column({ nullable: true })
  lastValuationDate: Date;

  @ApiProperty()
  @Column('decimal', { precision: 12, scale: 2 })
  monthlyRent: number;

  @ApiProperty()
  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  deposit: number;

  @ApiProperty()
  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  rentYield: number;

  // Mortgage Information
  @ApiProperty()
  @Column({ default: false })
  hasMortgage: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  mortgageLender: string;

  @ApiProperty()
  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  mortgageBalance: number;

  @ApiProperty()
  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  monthlyMortgagePayment: number;

  @ApiProperty()
  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  mortgageRate: number;

  @ApiProperty()
  @Column({ nullable: true })
  mortgageEndDate: Date;

  // Insurance Information
  @ApiProperty()
  @Column({ nullable: true })
  insuranceProvider: string;

  @ApiProperty()
  @Column({ nullable: true })
  insurancePolicyNumber: string;

  @ApiProperty()
  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  annualInsuranceCost: number;

  @ApiProperty()
  @Column({ nullable: true })
  insuranceRenewalDate: Date;

  // Expenses and Costs
  @ApiProperty()
  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  annualServiceCharge: number;

  @ApiProperty()
  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  annualGroundRent: number;

  @ApiProperty()
  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  councilTax: number;

  @ApiProperty()
  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  annualMaintenanceCost: number;

  @ApiProperty()
  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  managementFees: number;

  // Property Details
  @ApiProperty()
  @Column({ nullable: true })
  floorArea: number;

  @ApiProperty()
  @Column({ nullable: true })
  yearBuilt: number;

  @ApiProperty()
  @Column({ nullable: true })
  leaseLength: number;

  @ApiProperty()
  @Column({ nullable: true })
  leaseStartDate: Date;

  @ApiProperty()
  @Column({ default: false })
  isLeasehold: boolean;

  @ApiProperty()
  @Column({ default: false })
  hasGarden: boolean;

  @ApiProperty()
  @Column({ default: false })
  hasParking: boolean;

  @ApiProperty()
  @Column({ default: false })
  hasGarage: boolean;

  @ApiProperty()
  @Column({ default: false })
  allowsPets: boolean;

  @ApiProperty()
  @Column({ default: false })
  allowsSmoking: boolean;

  // Energy and Compliance
  @ApiProperty()
  @Column({ nullable: true })
  epcRating: string;

  @ApiProperty()
  @Column({ nullable: true })
  epcExpiryDate: Date;

  @ApiProperty()
  @Column({ nullable: true })
  gasSafetyCertificateExpiry: Date;

  @ApiProperty()
  @Column({ nullable: true })
  electricalCertificateExpiry: Date;

  @ApiProperty()
  @Column({ nullable: true })
  fireSafetyCertificateExpiry: Date;

  @ApiProperty()
  @Column({ default: false })
  hasHMOLicense: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  hmoLicenseExpiry: Date;

  // Tenancy Information
  @ApiProperty()
  @Column({ nullable: true })
  currentTenantId: string;

  @ApiProperty()
  @Column({ nullable: true })
  tenancyStartDate: Date;

  @ApiProperty()
  @Column({ nullable: true })
  tenancyEndDate: Date;

  @ApiProperty()
  @Column({ nullable: true })
  nextRentReviewDate: Date;

  @ApiProperty()
  @Column({ nullable: true })
  lastInspectionDate: Date;

  @ApiProperty()
  @Column({ nullable: true })
  nextInspectionDate: Date;

  // Marketing Information
  @ApiProperty()
  @Column({ default: false })
  isAdvertised: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  advertisedDate: Date;

  @ApiProperty()
  @Column('simple-array', { nullable: true })
  marketingPlatforms: string[];

  @ApiProperty()
  @Column({ default: 0 })
  viewingRequests: number;

  @ApiProperty()
  @Column({ default: 0 })
  applications: number;

  // Performance Metrics
  @ApiProperty()
  @Column({ default: 0 })
  daysVacant: number;

  @ApiProperty()
  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  occupancyRate: number;

  @ApiProperty()
  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  totalRentCollected: number;

  @ApiProperty()
  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  totalExpenses: number;

  @ApiProperty()
  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  netProfit: number;

  @ApiProperty()
  @Column('text', { nullable: true })
  notes: string;

  @ApiProperty()
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @OneToMany(() => TenancyAgreement, agreement => agreement.property)
  tenancyAgreements: TenancyAgreement[];

  @OneToMany(() => MaintenanceRequest, request => request.property)
  maintenanceRequests: MaintenanceRequest[];

  @OneToMany(() => PropertyInspection, inspection => inspection.property)
  inspections: PropertyInspection[];
}
