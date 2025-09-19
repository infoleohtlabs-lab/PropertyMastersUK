import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { WorkOrder } from './work-order.entity';

export enum ContractorStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING_APPROVAL = 'pending_approval',
}

export enum ContractorType {
  INDIVIDUAL = 'individual',
  COMPANY = 'company',
  AGENCY = 'agency',
}

@Entity('contractors')
export class Contractor {
  @ApiProperty({ description: 'Unique identifier for the contractor' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Contractor name or company name' })
  @Column()
  name: string;

  @ApiProperty({ description: 'Type of contractor', enum: ContractorType })
  @Column({ type: 'varchar', enum: ContractorType, default: ContractorType.INDIVIDUAL })
  type: ContractorType;

  @ApiProperty({ description: 'Current status', enum: ContractorStatus })
  @Column({ type: 'varchar', enum: ContractorStatus, default: ContractorStatus.PENDING_APPROVAL })
  status: ContractorStatus;

  @ApiProperty({ description: 'Primary contact person name' })
  @Column({ nullable: true })
  contactPerson: string;

  @ApiProperty({ description: 'Primary email address' })
  @Column()
  email: string;

  @ApiProperty({ description: 'Primary phone number' })
  @Column()
  phone: string;

  @ApiProperty({ description: 'Secondary phone number' })
  @Column({ nullable: true })
  alternatePhone: string;

  @ApiProperty({ description: 'Business address' })
  @Column('json', { nullable: true })
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };

  @ApiProperty({ description: 'Website URL' })
  @Column({ nullable: true })
  website: string;

  @ApiProperty({ description: 'Business registration number' })
  @Column({ nullable: true })
  registrationNumber: string;

  @ApiProperty({ description: 'Tax identification number' })
  @Column({ nullable: true })
  taxId: string;

  @ApiProperty({ description: 'Insurance policy number' })
  @Column({ nullable: true })
  insurancePolicyNumber: string;

  @ApiProperty({ description: 'Insurance expiry date' })
  @Column({ type: 'date', nullable: true })
  insuranceExpiryDate: Date;

  @ApiProperty({ description: 'List of specialties/services offered' })
  @Column('json')
  specialties: string[];

  @ApiProperty({ description: 'Service areas covered' })
  @Column('json', { nullable: true })
  serviceAreas: string[];

  @ApiProperty({ description: 'Hourly rate' })
  @Column('decimal', { precision: 8, scale: 2, nullable: true })
  hourlyRate: number;

  @ApiProperty({ description: 'Minimum charge amount' })
  @Column('decimal', { precision: 8, scale: 2, nullable: true })
  minimumCharge: number;

  @ApiProperty({ description: 'Emergency call-out rate' })
  @Column('decimal', { precision: 8, scale: 2, nullable: true })
  emergencyRate: number;

  @ApiProperty({ description: 'Overall rating (1-5)' })
  @Column('decimal', { precision: 3, scale: 2, default: 0 })
  rating: number;

  @ApiProperty({ description: 'Total number of ratings' })
  @Column({ default: 0 })
  totalRatings: number;

  @ApiProperty({ description: 'Total number of completed jobs' })
  @Column({ default: 0 })
  completedJobs: number;

  @ApiProperty({ description: 'Average response time in hours' })
  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  averageResponseTime: number;

  @ApiProperty({ description: 'Whether contractor is available for emergency calls' })
  @Column({ default: false })
  emergencyAvailable: boolean;

  @ApiProperty({ description: 'Working hours' })
  @Column('json', { nullable: true })
  workingHours: {
    monday: { start: string; end: string; available: boolean };
    tuesday: { start: string; end: string; available: boolean };
    wednesday: { start: string; end: string; available: boolean };
    thursday: { start: string; end: string; available: boolean };
    friday: { start: string; end: string; available: boolean };
    saturday: { start: string; end: string; available: boolean };
    sunday: { start: string; end: string; available: boolean };
  };

  @ApiProperty({ description: 'Certifications and licenses' })
  @Column('json', { nullable: true })
  certifications: {
    name: string;
    number: string;
    issuedBy: string;
    issuedDate: Date;
    expiryDate: Date;
    documentUrl: string;
  }[];

  @ApiProperty({ description: 'Bank account details for payments' })
  @Column('json', { nullable: true })
  bankDetails: {
    accountName: string;
    accountNumber: string;
    sortCode: string;
    bankName: string;
  };

  @ApiProperty({ description: 'Preferred payment method' })
  @Column({ nullable: true })
  preferredPaymentMethod: string;

  @ApiProperty({ description: 'Payment terms in days' })
  @Column({ default: 30 })
  paymentTerms: number;

  @ApiProperty({ description: 'Notes about the contractor' })
  @Column('text', { nullable: true })
  notes: string;

  @ApiProperty({ description: 'Internal notes for staff' })
  @Column('text', { nullable: true })
  internalNotes: string;

  @ApiProperty({ description: 'Date when contractor was approved' })
  @Column({ type: 'datetime', nullable: true })
  approvedAt: Date;

  @ApiProperty({ description: 'Date when contractor was last contacted' })
  @Column({ type: 'datetime', nullable: true })
  lastContactedAt: Date;

  @ApiProperty({ description: 'Date when contractor was last verified' })
  @Column({ type: 'datetime', nullable: true })
  lastVerifiedAt: Date;

  @ApiProperty({ description: 'Date when contractor was suspended (if applicable)' })
  @Column({ type: 'datetime', nullable: true })
  suspendedAt: Date;

  @ApiProperty({ description: 'Additional metadata' })
  @Column('json', { nullable: true })
  metadata: any;

  // Relationships
  @OneToMany(() => WorkOrder, (workOrder) => workOrder.contractor)
  workOrders: WorkOrder[];

  @ApiProperty({ description: 'Date when the contractor was created' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Date when the contractor was last updated' })
  @UpdateDateColumn()
  updatedAt: Date;
}
