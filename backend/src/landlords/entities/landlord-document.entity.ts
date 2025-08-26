import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Landlord } from './landlord.entity';
import { LandlordProperty } from './landlord-property.entity';
import { User } from '../../users/entities/user.entity';

export enum DocumentType {
  // Property Documents
  TITLE_DEED = 'title_deed',
  LEASE_AGREEMENT = 'lease_agreement',
  TENANCY_AGREEMENT = 'tenancy_agreement',
  INVENTORY = 'inventory',
  PROPERTY_SURVEY = 'property_survey',
  VALUATION_REPORT = 'valuation_report',
  FLOOR_PLAN = 'floor_plan',
  
  // Safety Certificates
  GAS_SAFETY_CERTIFICATE = 'gas_safety_certificate',
  ELECTRICAL_SAFETY_CERTIFICATE = 'electrical_safety_certificate',
  EPC_CERTIFICATE = 'epc_certificate',
  FIRE_SAFETY_CERTIFICATE = 'fire_safety_certificate',
  LEGIONELLA_RISK_ASSESSMENT = 'legionella_risk_assessment',
  ASBESTOS_SURVEY = 'asbestos_survey',
  
  // Insurance Documents
  BUILDINGS_INSURANCE = 'buildings_insurance',
  CONTENTS_INSURANCE = 'contents_insurance',
  LIABILITY_INSURANCE = 'liability_insurance',
  RENT_GUARANTEE_INSURANCE = 'rent_guarantee_insurance',
  
  // Financial Documents
  MORTGAGE_AGREEMENT = 'mortgage_agreement',
  BANK_STATEMENT = 'bank_statement',
  INVOICE = 'invoice',
  RECEIPT = 'receipt',
  TAX_RETURN = 'tax_return',
  FINANCIAL_STATEMENT = 'financial_statement',
  
  // Legal Documents
  SECTION_21_NOTICE = 'section_21_notice',
  SECTION_8_NOTICE = 'section_8_notice',
  COURT_ORDER = 'court_order',
  LEGAL_CORRESPONDENCE = 'legal_correspondence',
  SOLICITOR_LETTER = 'solicitor_letter',
  
  // Compliance Documents
  HMO_LICENSE = 'hmo_license',
  SELECTIVE_LICENSE = 'selective_license',
  PLANNING_PERMISSION = 'planning_permission',
  BUILDING_REGULATIONS = 'building_regulations',
  COUNCIL_TAX_BILL = 'council_tax_bill',
  
  // Maintenance Documents
  MAINTENANCE_REPORT = 'maintenance_report',
  INSPECTION_REPORT = 'inspection_report',
  CONTRACTOR_QUOTE = 'contractor_quote',
  WARRANTY_DOCUMENT = 'warranty_document',
  SERVICE_RECORD = 'service_record',
  
  // Tenant Documents
  TENANT_APPLICATION = 'tenant_application',
  REFERENCE_CHECK = 'reference_check',
  RIGHT_TO_RENT_CHECK = 'right_to_rent_check',
  DEPOSIT_PROTECTION = 'deposit_protection',
  TENANT_CORRESPONDENCE = 'tenant_correspondence',
  
  // Other
  PHOTOGRAPH = 'photograph',
  VIDEO = 'video',
  CONTRACT = 'contract',
  CORRESPONDENCE = 'correspondence',
  OTHER = 'other',
}

export enum DocumentStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  EXPIRING_SOON = 'expiring_soon',
  PENDING_RENEWAL = 'pending_renewal',
  ARCHIVED = 'archived',
  DRAFT = 'draft',
  UNDER_REVIEW = 'under_review',
  REJECTED = 'rejected',
}

export enum DocumentCategory {
  LEGAL = 'legal',
  FINANCIAL = 'financial',
  SAFETY = 'safety',
  COMPLIANCE = 'compliance',
  MAINTENANCE = 'maintenance',
  TENANT = 'tenant',
  INSURANCE = 'insurance',
  PROPERTY = 'property',
  ADMINISTRATIVE = 'administrative',
}

export enum AccessLevel {
  PRIVATE = 'private',
  LANDLORD_ONLY = 'landlord_only',
  TENANT_SHARED = 'tenant_shared',
  AGENT_SHARED = 'agent_shared',
  PUBLIC = 'public',
}

@Entity('landlord_documents')
export class LandlordDocument {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column('uuid')
  landlordId: string;

  @ManyToOne(() => Landlord, landlord => landlord.documents)
  @JoinColumn({ name: 'landlordId' })
  landlord: Landlord;

  @ApiProperty()
  @Column('uuid', { nullable: true })
  propertyId: string; // Null for landlord-level documents

  @ManyToOne(() => LandlordProperty, { nullable: true })
  @JoinColumn({ name: 'propertyId' })
  property: LandlordProperty;

  @ApiProperty()
  @Column('uuid', { nullable: true })
  uploadedBy: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'uploadedBy' })
  uploader: User;

  @ApiProperty()
  @Column({ nullable: true })
  documentReference: string;

  @ApiProperty()
  @Column()
  documentName: string;

  @ApiProperty()
  @Column('text', { nullable: true })
  description: string;

  @ApiProperty({ enum: DocumentType })
  @Column({
    type: 'varchar',
    
  })
  documentType: DocumentType;

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

  @ApiProperty({ enum: AccessLevel })
  @Column({
    type: 'varchar',
    
    default: AccessLevel.LANDLORD_ONLY,
  })
  accessLevel: AccessLevel;

  // File Information
  @ApiProperty()
  @Column()
  fileName: string;

  @ApiProperty()
  @Column()
  fileUrl: string;

  @ApiProperty()
  @Column({ nullable: true })
  thumbnailUrl: string;

  @ApiProperty()
  @Column()
  mimeType: string;

  @ApiProperty()
  @Column()
  fileSize: number; // Bytes

  @ApiProperty()
  @Column({ nullable: true })
  fileHash: string; // For duplicate detection

  @ApiProperty()
  @Column({ nullable: true })
  originalFileName: string;

  // Version Control
  @ApiProperty()
  @Column({ default: 1 })
  version: number;

  @ApiProperty()
  @Column('uuid', { nullable: true })
  parentDocumentId: string; // For versioning

  @ApiProperty()
  @Column({ default: false })
  isLatestVersion: boolean;

  @ApiProperty()
  @Column('simple-array', { nullable: true })
  versionHistory: string[]; // Array of document IDs

  // Dates and Validity
  @ApiProperty()
  @Column({ nullable: true })
  issueDate: Date;

  @ApiProperty()
  @Column({ nullable: true })
  expiryDate: Date;

  @ApiProperty()
  @Column({ nullable: true })
  renewalDate: Date;

  @ApiProperty()
  @Column({ nullable: true })
  validFrom: Date;

  @ApiProperty()
  @Column({ nullable: true })
  validTo: Date;

  @ApiProperty()
  @Column({ default: false })
  hasExpiry: boolean;

  @ApiProperty()
  @Column({ default: 0 })
  reminderDays: number; // Days before expiry to send reminder

  // Document Source and Authority
  @ApiProperty()
  @Column({ nullable: true })
  issuingAuthority: string;

  @ApiProperty()
  @Column({ nullable: true })
  certificateNumber: string;

  @ApiProperty()
  @Column({ nullable: true })
  licenseNumber: string;

  @ApiProperty()
  @Column({ nullable: true })
  contractorName: string;

  @ApiProperty()
  @Column({ nullable: true })
  contractorCompany: string;

  @ApiProperty()
  @Column({ nullable: true })
  contractorRegistration: string;

  // Compliance and Legal
  @ApiProperty()
  @Column({ default: false })
  isStatutoryRequirement: boolean;

  @ApiProperty()
  @Column({ default: false })
  isCompliant: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  complianceNotes: string;

  @ApiProperty()
  @Column({ default: false })
  requiresAction: boolean;

  @ApiProperty()
  @Column('text', { nullable: true })
  actionRequired: string;

  @ApiProperty()
  @Column({ nullable: true })
  actionDeadline: Date;

  // Financial Information
  @ApiProperty()
  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  cost: number;

  @ApiProperty()
  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  renewalCost: number;

  @ApiProperty()
  @Column({ nullable: true })
  paymentReference: string;

  @ApiProperty()
  @Column({ nullable: true })
  invoiceNumber: string;

  @ApiProperty()
  @Column({ default: false })
  isPaid: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  paymentDate: Date;

  // Sharing and Access
  @ApiProperty()
  @Column('simple-array', { nullable: true })
  sharedWith: string[]; // User IDs or email addresses

  @ApiProperty()
  @Column({ nullable: true })
  shareToken: string;

  @ApiProperty()
  @Column({ nullable: true })
  shareExpiryDate: Date;

  @ApiProperty()
  @Column({ default: 0 })
  downloadCount: number;

  @ApiProperty()
  @Column({ nullable: true })
  lastDownloaded: Date;

  @ApiProperty()
  @Column({ default: 0 })
  viewCount: number;

  @ApiProperty()
  @Column({ nullable: true })
  lastViewed: Date;

  // Notifications and Reminders
  @ApiProperty()
  @Column({ default: false })
  reminderSent: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  reminderSentDate: Date;

  @ApiProperty()
  @Column({ default: 0 })
  reminderCount: number;

  @ApiProperty()
  @Column({ nullable: true })
  nextReminderDate: Date;

  @ApiProperty()
  @Column('simple-array', { nullable: true })
  notificationRecipients: string[];

  // OCR and Text Extraction
  @ApiProperty()
  @Column({ default: false })
  isTextExtracted: boolean;

  @ApiProperty()
  @Column('text', { nullable: true })
  extractedText: string;

  @ApiProperty()
  @Column('json', { nullable: true })
  extractedData: {
    field: string;
    value: string;
    confidence: number;
  }[];

  @ApiProperty()
  @Column({ default: false })
  isSearchable: boolean;

  // Security and Encryption
  @ApiProperty()
  @Column({ default: false })
  isEncrypted: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  encryptionKey: string;

  @ApiProperty()
  @Column({ default: false })
  isPasswordProtected: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  passwordHash: string;

  @ApiProperty()
  @Column({ default: false })
  requiresDigitalSignature: boolean;

  @ApiProperty()
  @Column({ default: false })
  isDigitallySigned: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  signatureDate: Date;

  @ApiProperty()
  @Column({ nullable: true })
  signedBy: string;

  // Workflow and Approval
  @ApiProperty()
  @Column({ default: false })
  requiresApproval: boolean;

  @ApiProperty()
  @Column({ default: false })
  isApproved: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  approvedBy: string;

  @ApiProperty()
  @Column({ nullable: true })
  approvedDate: Date;

  @ApiProperty()
  @Column('text', { nullable: true })
  approvalNotes: string;

  @ApiProperty()
  @Column({ nullable: true })
  rejectionReason: string;

  @ApiProperty()
  @Column({ nullable: true })
  rejectionDate: Date;

  // Metadata and Tags
  @ApiProperty()
  @Column('simple-array', { nullable: true })
  tags: string[];

  @ApiProperty()
  @Column('json', { nullable: true })
  metadata: {
    key: string;
    value: string;
  }[];

  @ApiProperty()
  @Column('simple-array', { nullable: true })
  keywords: string[];

  @ApiProperty()
  @Column({ nullable: true })
  customCategory: string;

  // Related Documents
  @ApiProperty()
  @Column('simple-array', { nullable: true })
  relatedDocuments: string[]; // Document IDs

  @ApiProperty()
  @Column('uuid', { nullable: true })
  replacesDocumentId: string;

  @ApiProperty()
  @Column('uuid', { nullable: true })
  replacedByDocumentId: string;

  // Backup and Archive
  @ApiProperty()
  @Column({ default: false })
  isBackedUp: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  backupLocation: string;

  @ApiProperty()
  @Column({ nullable: true })
  backupDate: Date;

  @ApiProperty()
  @Column({ default: false })
  isArchived: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  archiveDate: Date;

  @ApiProperty()
  @Column({ nullable: true })
  archiveReason: string;

  @ApiProperty()
  @Column('text', { nullable: true })
  notes: string;

  @ApiProperty()
  @Column('text', { nullable: true })
  internalNotes: string;

  @ApiProperty()
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
