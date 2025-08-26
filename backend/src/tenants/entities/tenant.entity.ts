import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { Property } from '../../properties/entities/property.entity';
import { TenantNotification } from './tenant-notification.entity';
import { TenantPayment } from './tenant-payment.entity';
import { TenantPreference } from './tenant-preference.entity';
import { TenantReference } from './tenant-reference.entity';
import { TenantApplication } from './tenant-application.entity';
import { TenantCommunication } from './tenant-communication.entity';
import { TenantComplaint } from './tenant-complaint.entity';
import { TenantEmergencyContact } from './tenant-emergency-contact.entity';

export enum TenantStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  TERMINATED = 'terminated',
  EVICTED = 'evicted',
}

export enum TenancyType {
  ASSURED_SHORTHOLD = 'assured_shorthold',
  ASSURED = 'assured',
  REGULATED = 'regulated',
  COMPANY_LET = 'company_let',
  STUDENT = 'student',
  HOLIDAY_LET = 'holiday_let',
}

export enum PaymentFrequency {
  WEEKLY = 'weekly',
  FORTNIGHTLY = 'fortnightly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
}

export enum EmploymentStatus {
  EMPLOYED = 'employed',
  UNEMPLOYED = 'unemployed',
  SELF_EMPLOYED = 'self_employed',
  STUDENT = 'student',
  RETIRED = 'retired',
  OTHER = 'other',
}

@Entity('tenants')
export class Tenant {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ enum: TenantStatus })
  @Column({
    type: 'varchar',
    
    default: TenantStatus.PENDING,
  })
  status: TenantStatus;

  @ApiProperty({ enum: TenancyType })
  @Column({
    type: 'varchar',
    
    default: TenancyType.ASSURED_SHORTHOLD,
  })
  tenancyType: TenancyType;

  // Tenancy Details
  @ApiProperty()
  @Column()
  tenancyStartDate: Date;

  @ApiProperty()
  @Column({ nullable: true })
  tenancyEndDate: Date;

  @ApiProperty()
  @Column('decimal', { precision: 8, scale: 2 })
  monthlyRent: number;

  @ApiProperty()
  @Column('decimal', { precision: 8, scale: 2 })
  deposit: number;

  @ApiProperty({ enum: PaymentFrequency })
  @Column({
    type: 'varchar',
    
    default: PaymentFrequency.MONTHLY,
  })
  paymentFrequency: PaymentFrequency;

  @ApiProperty()
  @Column()
  paymentDueDate: number; // Day of month (1-31)

  @ApiProperty()
  @Column({ nullable: true })
  lastPaymentDate: Date;

  @ApiProperty()
  @Column('decimal', { precision: 8, scale: 2, default: 0 })
  outstandingBalance: number;

  // Emergency Contact
  @ApiProperty()
  @Column({ nullable: true })
  emergencyContactName: string;

  @ApiProperty()
  @Column({ nullable: true })
  emergencyContactPhone: string;

  @ApiProperty()
  @Column({ nullable: true })
  emergencyContactRelationship: string;

  // Employment Details
  @ApiProperty()
  @Column({ nullable: true })
  employerName: string;

  @ApiProperty()
  @Column({ nullable: true })
  employerAddress: string;

  @ApiProperty()
  @Column({ nullable: true })
  employerPhone: string;

  @ApiProperty()
  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  annualIncome: number;

  @ApiProperty()
  @Column({ nullable: true })
  jobTitle: string;

  @ApiProperty()
  @Column({ nullable: true })
  employmentStartDate: Date;

  // Previous Address
  @ApiProperty()
  @Column({ nullable: true })
  previousAddress: string;

  @ApiProperty()
  @Column({ nullable: true })
  previousLandlordName: string;

  @ApiProperty()
  @Column({ nullable: true })
  previousLandlordPhone: string;

  @ApiProperty()
  @Column({ nullable: true })
  reasonForLeaving: string;

  // References
  @ApiProperty()
  @Column({ default: false })
  referencesChecked: boolean;

  @ApiProperty()
  @Column({ default: false })
  creditCheckPassed: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  creditCheckedDate: Date;

  @ApiProperty()
  @Column({ nullable: true })
  creditScore: number;

  @ApiProperty()
  @Column({ default: false })
  rightToRentChecked: boolean;

  @ApiProperty()
  @Column({ default: false })
  isIncomeVerified: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  incomeVerifiedDate: Date;

  @ApiProperty()
  @Column({ default: false })
  isEmploymentVerified: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  employmentVerifiedDate: Date;

  // Application tracking
  @ApiProperty()
  @Column({ default: 0 })
  totalApplications: number;

  @ApiProperty()
  @Column({ nullable: true })
  lastApplicationDate: Date;

  // Complaint tracking
  @ApiProperty()
  @Column({ default: 0 })
  complaintCount: number;

  // Audit fields
  @ApiProperty()
  @Column({ nullable: true })
  updatedBy: string;

  // Documents
  @ApiProperty()
  @Column('simple-array', { nullable: true })
  documents: string[]; // File paths/URLs

  @ApiProperty()
  @Column('text', { nullable: true })
  notes: string;

  @ApiProperty()
  @Column({ default: false })
  hasGuarantor: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  guarantorName: string;

  @ApiProperty()
  @Column({ nullable: true })
  guarantorPhone: string;

  @ApiProperty()
  @Column({ nullable: true })
  guarantorEmail: string;

  @ApiProperty()
  @Column({ nullable: true })
  guarantorAddress: string;

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
  @Column('uuid')
  landlordId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'landlordId' })
  landlord: User;

  // One-to-many relationships
  @OneToMany(() => TenantNotification, (notification) => notification.tenant)
  notifications: TenantNotification[];

  @OneToMany(() => TenantPayment, (payment) => payment.tenant)
  payments: TenantPayment[];

  @OneToMany(() => TenantPreference, (preference) => preference.tenant)
  preferences: TenantPreference[];

  @OneToMany(() => TenantReference, (reference) => reference.tenant)
  references: TenantReference[];

  @OneToMany(() => TenantApplication, (application) => application.tenant)
  applications: TenantApplication[];

  @OneToMany(() => TenantCommunication, (communication) => communication.tenant)
  communications: TenantCommunication[];

  @OneToMany(() => TenantComplaint, (complaint) => complaint.tenant)
  complaints: TenantComplaint[];

  @OneToMany(() => TenantEmergencyContact, (emergencyContact) => emergencyContact.tenant)
  emergencyContacts: TenantEmergencyContact[];

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
