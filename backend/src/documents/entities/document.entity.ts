import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { Property } from '../../properties/entities/property.entity';
import { Tenant } from '../../tenants/entities/tenant.entity';

export enum DocumentType {
  // Property Documents
  EPC_CERTIFICATE = 'epc_certificate',
  GAS_SAFETY_CERTIFICATE = 'gas_safety_certificate',
  ELECTRICAL_CERTIFICATE = 'electrical_certificate',
  FIRE_SAFETY_CERTIFICATE = 'fire_safety_certificate',
  PROPERTY_DEED = 'property_deed',
  LEASE_AGREEMENT = 'lease_agreement',
  INVENTORY = 'inventory',
  FLOOR_PLAN = 'floor_plan',
  
  // Tenant Documents
  TENANCY_AGREEMENT = 'tenancy_agreement',
  RIGHT_TO_RENT = 'right_to_rent',
  PASSPORT = 'passport',
  DRIVING_LICENSE = 'driving_license',
  BANK_STATEMENT = 'bank_statement',
  PAYSLIP = 'payslip',
  EMPLOYMENT_LETTER = 'employment_letter',
  REFERENCE_LETTER = 'reference_letter',
  CREDIT_REPORT = 'credit_report',
  
  // Financial Documents
  INVOICE = 'invoice',
  RECEIPT = 'receipt',
  RENT_STATEMENT = 'rent_statement',
  DEPOSIT_CERTIFICATE = 'deposit_certificate',
  
  // Legal Documents
  COURT_ORDER = 'court_order',
  NOTICE_TO_QUIT = 'notice_to_quit',
  SECTION_21_NOTICE = 'section_21_notice',
  SECTION_8_NOTICE = 'section_8_notice',
  
  // Insurance Documents
  INSURANCE_POLICY = 'insurance_policy',
  INSURANCE_CERTIFICATE = 'insurance_certificate',
  
  // Other
  PHOTO = 'photo',
  VIDEO = 'video',
  OTHER = 'other',
}

export enum DocumentStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  PENDING_RENEWAL = 'pending_renewal',
  ARCHIVED = 'archived',
  DELETED = 'deleted',
}

export enum DocumentCategory {
  PROPERTY = 'property',
  TENANT = 'tenant',
  LANDLORD = 'landlord',
  FINANCIAL = 'financial',
  LEGAL = 'legal',
  INSURANCE = 'insurance',
  MAINTENANCE = 'maintenance',
  COMPLIANCE = 'compliance',
}

@Entity('documents')
export class Document {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column()
  name: string;

  @ApiProperty()
  @Column('text', { nullable: true })
  description: string;

  @ApiProperty({ enum: DocumentType })
  @Column({
    type: 'varchar',
    
  })
  type: DocumentType;

  @ApiProperty({ enum: DocumentCategory })
  @Column({
    type: 'varchar',
    
  })
  category: DocumentCategory;

  @ApiProperty({ enum: DocumentStatus })
  @Column({
    type: 'varchar',
    
    default: DocumentStatus.ACTIVE,
  })
  status: DocumentStatus;

  @ApiProperty()
  @Column()
  fileName: string;

  @ApiProperty()
  @Column()
  originalFileName: string;

  @ApiProperty()
  @Column()
  filePath: string;

  @ApiProperty()
  @Column()
  mimeType: string;

  @ApiProperty()
  @Column('bigint')
  fileSize: number; // in bytes

  @ApiProperty()
  @Column({ nullable: true })
  checksum: string; // For file integrity

  @ApiProperty()
  @Column({ nullable: true })
  version: string;

  @ApiProperty()
  @Column({ nullable: true })
  issueDate: Date;

  @ApiProperty()
  @Column({ nullable: true })
  expiryDate: Date;

  @ApiProperty()
  @Column({ nullable: true })
  reminderDate: Date; // When to remind about expiry

  @ApiProperty()
  @Column({ default: false })
  isConfidential: boolean;

  @ApiProperty()
  @Column({ default: false })
  isVerified: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  verifiedBy: string;

  @ApiProperty()
  @Column({ nullable: true })
  verifiedAt: Date;

  @ApiProperty()
  @Column('simple-array', { nullable: true })
  tags: string[];

  @ApiProperty()
  @Column('json', { nullable: true })
  metadata: any; // Additional document-specific data

  @ApiProperty()
  @Column('text', { nullable: true })
  notes: string;

  @ApiProperty()
  @Column({ default: 0 })
  downloadCount: number;

  @ApiProperty()
  @Column({ nullable: true })
  lastAccessedAt: Date;

  @ApiProperty()
  @Column({ nullable: true })
  parentDocumentId: string; // For document versions

  // Relationships
  @ApiProperty()
  @Column('uuid')
  uploadedById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'uploadedById' })
  uploadedBy: User;

  @ApiProperty()
  @Column('uuid', { nullable: true })
  propertyId: string;

  @ManyToOne(() => Property)
  @JoinColumn({ name: 'propertyId' })
  property: Property;

  @ApiProperty()
  @Column('uuid', { nullable: true })
  tenantId: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

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
