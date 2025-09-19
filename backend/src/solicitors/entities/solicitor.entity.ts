import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { LegalCase } from './legal-case.entity';
import { ConveyancingTransaction } from './conveyancing-transaction.entity';
import { LegalContract } from './legal-contract.entity';
import { User } from '../../users/entities/user.entity';

export enum SolicitorSpecialization {
  CONVEYANCING = 'conveyancing',
  FAMILY_LAW = 'family_law',
  CRIMINAL_LAW = 'criminal_law',
  COMMERCIAL_LAW = 'commercial_law',
  EMPLOYMENT_LAW = 'employment_law',
  PERSONAL_INJURY = 'personal_injury',
  PROPERTY_LAW = 'property_law',
  LITIGATION = 'litigation',
  CORPORATE_LAW = 'corporate_law',
  IMMIGRATION_LAW = 'immigration_law',
  WILLS_PROBATE = 'wills_probate',
  IMMIGRATION = 'immigration',
  INTELLECTUAL_PROPERTY = 'intellectual_property',
  TAX_LAW = 'tax_law',
}

export enum SolicitorStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  RETIRED = 'retired',
}

@Entity('solicitors')
export class Solicitor {
  @ApiProperty({ description: 'Unique identifier for the solicitor' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'User ID associated with this solicitor' })
  @Column('uuid')
  userId: string;

  @ApiProperty({ description: 'First name of the solicitor' })
  @Column({ length: 100 })
  firstName: string;

  @ApiProperty({ description: 'Last name of the solicitor' })
  @Column({ length: 100 })
  lastName: string;

  @ApiProperty({ description: 'Email address of the solicitor' })
  @Column({ unique: true, length: 255 })
  email: string;

  @ApiProperty({ description: 'Phone number of the solicitor' })
  @Column({ length: 20, nullable: true })
  phone?: string;

  @ApiProperty({ description: 'Law firm name' })
  @Column({ length: 200 })
  firmName: string;

  @ApiProperty({ description: 'Law firm address' })
  @Column({ type: 'text', nullable: true })
  firmAddress?: string;

  @ApiProperty({ description: 'Solicitor registration number' })
  @Column({ unique: true, length: 50 })
  registrationNumber: string;

  @ApiProperty({ description: 'Solicitor Regulation Authority (SRA) number' })
  @Column({ unique: true, length: 20 })
  sraNumber: string;

  @ApiProperty({ description: 'Years of experience' })
  @Column({ type: 'int', default: 0 })
  yearsOfExperience: number;

  @ApiProperty({ description: 'Specializations of the solicitor', enum: SolicitorSpecialization, isArray: true })
  @Column({ type: 'simple-array' })
  specializations: SolicitorSpecialization[];

  @ApiProperty({ description: 'Professional qualifications' })
  @Column({ type: 'simple-array', nullable: true })
  qualifications?: string[];

  @ApiProperty({ description: 'Languages spoken' })
  @Column({ type: 'simple-array', nullable: true })
  languages?: string[];

  @ApiProperty({ description: 'Current status of the solicitor', enum: SolicitorStatus })
  @Column({ type: 'varchar', default: SolicitorStatus.ACTIVE })
  status: SolicitorStatus;

  @ApiProperty({ description: 'Professional indemnity insurance provider' })
  @Column({ length: 200, nullable: true })
  insuranceProvider?: string;

  @ApiProperty({ description: 'Professional indemnity insurance policy number' })
  @Column({ length: 100, nullable: true })
  insurancePolicyNumber?: string;

  @ApiProperty({ description: 'Insurance expiry date' })
  @Column({ type: 'date', nullable: true })
  insuranceExpiryDate?: Date;

  @ApiProperty({ description: 'Hourly rate in GBP' })
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  hourlyRate?: number;

  @ApiProperty({ description: 'Fixed fee for conveyancing' })
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  conveyancingFee?: number;

  // Performance Metrics
  @ApiProperty({ description: 'Total number of cases handled' })
  @Column({ type: 'int', default: 0 })
  totalCases: number;

  @ApiProperty({ description: 'Number of active cases' })
  @Column({ type: 'int', default: 0 })
  activeCases: number;

  @ApiProperty({ description: 'Number of completed cases' })
  @Column({ type: 'int', default: 0 })
  completedCases: number;

  @ApiProperty({ description: 'Average case completion time in days' })
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  averageCompletionTime: number;

  @ApiProperty({ description: 'Client satisfaction rating (1-5)' })
  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  clientSatisfactionRating: number;

  @ApiProperty({ description: 'Success rate percentage' })
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  successRate: number;

  @ApiProperty({ description: 'Total revenue generated' })
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalRevenue: number;

  @ApiProperty({ description: 'Professional bio or description' })
  @Column({ type: 'text', nullable: true })
  bio?: string;

  @ApiProperty({ description: 'Profile image URL' })
  @Column({ length: 500, nullable: true })
  profileImageUrl?: string;

  @ApiProperty({ description: 'Whether the solicitor is available for new cases' })
  @Column({ default: true })
  isAvailable: boolean;

  @ApiProperty({ description: 'Maximum number of concurrent cases' })
  @Column({ type: 'int', default: 20 })
  maxConcurrentCases: number;

  @ApiProperty({ description: 'Date when the solicitor was created' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Date when the solicitor was last updated' })
  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => LegalCase, (legalCase) => legalCase.solicitor)
  legalCases: LegalCase[];

  @OneToMany(() => ConveyancingTransaction, (transaction) => transaction.solicitor)
  conveyancingTransactions: ConveyancingTransaction[];

  @OneToMany(() => LegalContract, (contract) => contract.solicitor)
  legalContracts: LegalContract[];

  // Virtual properties
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  get caseLoad(): number {
    return this.activeCases;
  }

  get isOverloaded(): boolean {
    return this.activeCases >= this.maxConcurrentCases;
  }

  get experienceLevel(): string {
    if (this.yearsOfExperience < 2) return 'Junior';
    if (this.yearsOfExperience < 5) return 'Mid-level';
    if (this.yearsOfExperience < 10) return 'Senior';
    return 'Partner';
  }
}
