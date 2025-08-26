import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Landlord } from './landlord.entity';
import { LandlordProperty } from './landlord-property.entity';
import { RentPayment } from './rent-payment.entity';
import { User } from '../../users/entities/user.entity';

export enum TenancyType {
  ASSURED_SHORTHOLD = 'assured_shorthold',
  ASSURED = 'assured',
  REGULATED = 'regulated',
  COMPANY_LET = 'company_let',
  STUDENT = 'student',
  HOLIDAY_LET = 'holiday_let',
}

export enum TenancyStatus {
  DRAFT = 'draft',
  PENDING_SIGNATURE = 'pending_signature',
  ACTIVE = 'active',
  EXPIRED = 'expired',
  TERMINATED = 'terminated',
  RENEWED = 'renewed',
  BREACHED = 'breached',
  ENDED = 'ended',
}

export enum RentFrequency {
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  ANNUALLY = 'annually',
}

export enum DepositScheme {
  DPS = 'dps', // Deposit Protection Service
  TDS = 'tds', // Tenancy Deposit Scheme
  MYDEPOSITS = 'mydeposits',
  CUSTODIAL = 'custodial',
  INSURANCE_BASED = 'insurance_based',
}

@Entity('tenancy_agreements')
export class TenancyAgreement {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column('uuid')
  landlordId: string;

  @ManyToOne(() => Landlord, landlord => landlord.tenancyAgreements)
  @JoinColumn({ name: 'landlordId' })
  landlord: Landlord;

  @ApiProperty()
  @Column('uuid')
  propertyId: string;

  @ManyToOne(() => LandlordProperty, property => property.tenancyAgreements)
  @JoinColumn({ name: 'propertyId' })
  property: LandlordProperty;

  @ApiProperty()
  @Column('uuid')
  tenantId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'tenantId' })
  tenant: User;

  @ApiProperty()
  @Column({ nullable: true })
  agreementReference: string;

  @ApiProperty({ enum: TenancyType })
  @Column({
    type: 'varchar',
    
    default: TenancyType.ASSURED_SHORTHOLD,
  })
  type: TenancyType;

  @ApiProperty({ enum: TenancyStatus })
  @Column({
    type: 'varchar',
    
    default: TenancyStatus.DRAFT,
  })
  status: TenancyStatus;

  // Tenancy Dates
  @ApiProperty()
  @Column()
  startDate: Date;

  @ApiProperty()
  @Column()
  endDate: Date;

  @ApiProperty()
  @Column({ nullable: true })
  signedDate: Date;

  @ApiProperty()
  @Column({ nullable: true })
  moveInDate: Date;

  @ApiProperty()
  @Column({ nullable: true })
  moveOutDate: Date;

  @ApiProperty()
  @Column({ nullable: true })
  actualEndDate: Date;

  @ApiProperty()
  @Column({ default: 6 })
  initialTermMonths: number;

  @ApiProperty()
  @Column({ default: false })
  isRollingContract: boolean;

  @ApiProperty()
  @Column({ default: 1 })
  noticePeriodMonths: number;

  // Rent Information
  @ApiProperty()
  @Column('decimal', { precision: 12, scale: 2 })
  rentAmount: number;

  @ApiProperty({ enum: RentFrequency })
  @Column({
    type: 'varchar',
    
    default: RentFrequency.MONTHLY,
  })
  rentFrequency: RentFrequency;

  @ApiProperty()
  @Column({ default: 1 })
  rentDueDay: number; // Day of month rent is due

  @ApiProperty()
  @Column({ nullable: true })
  firstRentDueDate: Date;

  @ApiProperty()
  @Column({ nullable: true })
  lastRentDueDate: Date;

  @ApiProperty()
  @Column({ default: false })
  rentIncludesUtilities: boolean;

  @ApiProperty()
  @Column('simple-array', { nullable: true })
  includedUtilities: string[];

  // Deposit Information
  @ApiProperty()
  @Column('decimal', { precision: 12, scale: 2 })
  depositAmount: number;

  @ApiProperty()
  @Column({ nullable: true })
  depositPaidDate: Date;

  @ApiProperty({ enum: DepositScheme })
  @Column({
    type: 'varchar',
    
    nullable: true,
  })
  depositScheme: DepositScheme;

  @ApiProperty()
  @Column({ nullable: true })
  depositSchemeReference: string;

  @ApiProperty()
  @Column({ nullable: true })
  depositProtectionDate: Date;

  @ApiProperty()
  @Column({ default: false })
  depositReturned: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  depositReturnDate: Date;

  @ApiProperty()
  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  depositReturnAmount: number;

  // Tenant Information
  @ApiProperty()
  @Column('simple-array', { nullable: true })
  additionalTenantIds: string[]; // For joint tenancies

  @ApiProperty()
  @Column({ default: 1 })
  numberOfTenants: number;

  @ApiProperty()
  @Column({ default: 1 })
  maximumOccupants: number;

  @ApiProperty()
  @Column({ default: false })
  allowsSubletting: boolean;

  @ApiProperty()
  @Column({ default: false })
  allowsPets: boolean;

  @ApiProperty()
  @Column({ default: false })
  allowsSmoking: boolean;

  // Guarantor Information
  @ApiProperty()
  @Column({ default: false })
  hasGuarantor: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  guarantorName: string;

  @ApiProperty()
  @Column({ nullable: true })
  guarantorAddress: string;

  @ApiProperty()
  @Column({ nullable: true })
  guarantorPhone: string;

  @ApiProperty()
  @Column({ nullable: true })
  guarantorEmail: string;

  @ApiProperty()
  @Column({ nullable: true })
  guarantorRelationship: string;

  // Property Condition
  @ApiProperty()
  @Column({ nullable: true })
  inventoryDate: Date;

  @ApiProperty()
  @Column({ nullable: true })
  inventoryUrl: string;

  @ApiProperty()
  @Column({ nullable: true })
  checkInDate: Date;

  @ApiProperty()
  @Column({ nullable: true })
  checkInReportUrl: string;

  @ApiProperty()
  @Column({ nullable: true })
  checkOutDate: Date;

  @ApiProperty()
  @Column({ nullable: true })
  checkOutReportUrl: string;

  // Legal and Compliance
  @ApiProperty()
  @Column({ default: false })
  rightToRentChecked: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  rightToRentCheckDate: Date;

  @ApiProperty()
  @Column({ default: false })
  epcProvided: boolean;

  @ApiProperty()
  @Column({ default: false })
  gasSafetyCertificateProvided: boolean;

  @ApiProperty()
  @Column({ default: false })
  electricalCertificateProvided: boolean;

  @ApiProperty()
  @Column({ default: false })
  howToRentGuideProvided: boolean;

  @ApiProperty()
  @Column({ default: false })
  depositInformationProvided: boolean;

  // Rent Reviews and Increases
  @ApiProperty()
  @Column({ nullable: true })
  nextRentReviewDate: Date;

  @ApiProperty()
  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  rentIncreasePercentage: number;

  @ApiProperty()
  @Column({ nullable: true })
  lastRentIncreaseDate: Date;

  @ApiProperty()
  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  previousRentAmount: number;

  // Break Clauses and Termination
  @ApiProperty()
  @Column({ default: false })
  hasBreakClause: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  breakClauseDate: Date;

  @ApiProperty()
  @Column({ default: 2 })
  breakClauseNoticeMonths: number;

  @ApiProperty()
  @Column({ nullable: true })
  terminationNoticeDate: Date;

  @ApiProperty()
  @Column({ nullable: true })
  terminationReason: string;

  @ApiProperty()
  @Column({ nullable: true })
  terminationNoticeUrl: string;

  // Financial Summary
  @ApiProperty()
  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  totalRentDue: number;

  @ApiProperty()
  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  totalRentPaid: number;

  @ApiProperty()
  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  outstandingRent: number;

  @ApiProperty()
  @Column({ default: 0 })
  latePayments: number;

  @ApiProperty()
  @Column({ default: 0 })
  missedPayments: number;

  // Documents and Files
  @ApiProperty()
  @Column({ nullable: true })
  agreementDocumentUrl: string;

  @ApiProperty()
  @Column('simple-array', { nullable: true })
  attachmentUrls: string[];

  @ApiProperty()
  @Column('text', { nullable: true })
  specialTerms: string;

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
  @OneToMany(() => RentPayment, payment => payment.tenancyAgreement)
  rentPayments: RentPayment[];
}
