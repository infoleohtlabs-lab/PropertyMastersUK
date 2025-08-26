import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { LandlordProperty } from './landlord-property.entity';
import { TenancyAgreement } from './tenancy-agreement.entity';
import { RentPayment } from './rent-payment.entity';
import { MaintenanceRequest } from './maintenance-request.entity';
import { PropertyInspection } from './property-inspection.entity';
import { FinancialReport } from './financial-report.entity';
import { LandlordDocument } from './landlord-document.entity';

export enum LandlordType {
  INDIVIDUAL = 'individual',
  COMPANY = 'company',
  TRUST = 'trust',
  PARTNERSHIP = 'partnership',
}

export enum LandlordStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING_VERIFICATION = 'pending_verification',
}

export enum PortfolioSize {
  SMALL = 'small', // 1-5 properties
  MEDIUM = 'medium', // 6-20 properties
  LARGE = 'large', // 21-50 properties
  ENTERPRISE = 'enterprise', // 50+ properties
}

@Entity('landlords')
export class Landlord {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column('uuid')
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ApiProperty({ enum: LandlordType })
  @Column({
    type: 'varchar',
    
    default: LandlordType.INDIVIDUAL,
  })
  type: LandlordType;

  @ApiProperty({ enum: LandlordStatus })
  @Column({
    type: 'varchar',
    
    default: LandlordStatus.PENDING_VERIFICATION,
  })
  status: LandlordStatus;

  @ApiProperty({ enum: PortfolioSize })
  @Column({
    type: 'varchar',
    
    nullable: true,
  })
  portfolioSize: PortfolioSize;

  // Company/Business Details
  @ApiProperty()
  @Column({ nullable: true })
  companyName: string;

  @ApiProperty()
  @Column({ nullable: true })
  companyNumber: string;

  @ApiProperty()
  @Column({ nullable: true })
  vatNumber: string;

  @ApiProperty()
  @Column({ nullable: true })
  businessAddress: string;

  @ApiProperty()
  @Column({ nullable: true })
  businessPostcode: string;

  @ApiProperty()
  @Column({ nullable: true })
  businessCity: string;

  @ApiProperty()
  @Column({ nullable: true })
  businessCounty: string;

  // Contact Information
  @ApiProperty()
  @Column({ nullable: true })
  emergencyContact: string;

  @ApiProperty()
  @Column({ nullable: true })
  emergencyPhone: string;

  @ApiProperty()
  @Column({ nullable: true })
  preferredContactMethod: string;

  // Financial Information
  @ApiProperty()
  @Column({ nullable: true })
  bankName: string;

  @ApiProperty()
  @Column({ nullable: true })
  accountNumber: string;

  @ApiProperty()
  @Column({ nullable: true })
  sortCode: string;

  @ApiProperty()
  @Column({ nullable: true })
  accountHolderName: string;

  @ApiProperty()
  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  totalPortfolioValue: number;

  @ApiProperty()
  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  monthlyRentalIncome: number;

  @ApiProperty()
  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  annualRentalIncome: number;

  @ApiProperty()
  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  totalMortgageDebt: number;

  @ApiProperty()
  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  netWorth: number;

  // Insurance Information
  @ApiProperty()
  @Column({ nullable: true })
  insuranceProvider: string;

  @ApiProperty()
  @Column({ nullable: true })
  insurancePolicyNumber: string;

  @ApiProperty()
  @Column({ nullable: true })
  insuranceExpiryDate: Date;

  @ApiProperty()
  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  insuranceCoverage: number;

  // Legal and Compliance
  @ApiProperty()
  @Column({ nullable: true })
  licenseNumber: string;

  @ApiProperty()
  @Column({ nullable: true })
  licenseExpiryDate: Date;

  @ApiProperty()
  @Column({ default: false })
  hasSelectiveLicensing: boolean;

  @ApiProperty()
  @Column({ default: false })
  hasHMOLicense: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  hmoLicenseNumber: string;

  @ApiProperty()
  @Column({ nullable: true })
  hmoLicenseExpiry: Date;

  @ApiProperty()
  @Column({ default: false })
  isAccreditedLandlord: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  accreditationScheme: string;

  @ApiProperty()
  @Column({ nullable: true })
  accreditationExpiry: Date;

  // Property Management
  @ApiProperty()
  @Column({ default: false })
  usePropertyManager: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  propertyManagerName: string;

  @ApiProperty()
  @Column({ nullable: true })
  propertyManagerContact: string;

  @ApiProperty()
  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  managementFeePercentage: number;

  // Preferences and Settings
  @ApiProperty()
  @Column({ default: true })
  allowOnlineApplications: boolean;

  @ApiProperty()
  @Column({ default: true })
  requireReferences: boolean;

  @ApiProperty()
  @Column({ default: true })
  requireCreditCheck: boolean;

  @ApiProperty()
  @Column({ default: false })
  allowPets: boolean;

  @ApiProperty()
  @Column({ default: false })
  allowSmoking: boolean;

  @ApiProperty()
  @Column({ default: 1 })
  minimumTenancyMonths: number;

  @ApiProperty()
  @Column({ default: 12 })
  maximumTenancyMonths: number;

  @ApiProperty()
  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  depositPercentage: number;

  @ApiProperty()
  @Column({ nullable: true })
  preferredTenantType: string;

  // Notifications and Communication
  @ApiProperty()
  @Column({ default: true })
  emailNotifications: boolean;

  @ApiProperty()
  @Column({ default: true })
  smsNotifications: boolean;

  @ApiProperty()
  @Column({ default: true })
  maintenanceAlerts: boolean;

  @ApiProperty()
  @Column({ default: true })
  rentPaymentAlerts: boolean;

  @ApiProperty()
  @Column({ default: true })
  tenancyExpiryAlerts: boolean;

  @ApiProperty()
  @Column({ default: true })
  inspectionReminders: boolean;

  // Statistics and Metrics
  @ApiProperty()
  @Column({ default: 0 })
  totalProperties: number;

  @ApiProperty()
  @Column({ default: 0 })
  occupiedProperties: number;

  @ApiProperty()
  @Column({ default: 0 })
  vacantProperties: number;

  @ApiProperty()
  @Column({ default: 0 })
  totalTenants: number;

  @ApiProperty()
  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  occupancyRate: number;

  @ApiProperty()
  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  averageRentYield: number;

  @ApiProperty()
  @Column({ nullable: true })
  lastLoginDate: Date;

  @ApiProperty()
  @Column({ nullable: true })
  lastPropertyUpdate: Date;

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
  @OneToMany(() => LandlordProperty, property => property.landlord)
  properties: LandlordProperty[];

  @OneToMany(() => TenancyAgreement, agreement => agreement.landlord)
  tenancyAgreements: TenancyAgreement[];

  @OneToMany(() => RentPayment, payment => payment.landlord)
  rentPayments: RentPayment[];

  @OneToMany(() => MaintenanceRequest, request => request.landlord)
  maintenanceRequests: MaintenanceRequest[];

  @OneToMany(() => PropertyInspection, inspection => inspection.landlord)
  inspections: PropertyInspection[];

  @OneToMany(() => FinancialReport, report => report.landlord)
  financialReports: FinancialReport[];

  @OneToMany(() => LandlordDocument, document => document.landlord)
  documents: LandlordDocument[];
}
