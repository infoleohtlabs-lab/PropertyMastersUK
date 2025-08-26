import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Property } from './property.entity';
import { User } from '../../users/entities/user.entity';

export enum DocumentType {
  EPC = 'epc',
  GAS_SAFETY = 'gas_safety',
  ELECTRICAL_SAFETY = 'electrical_safety',
  FIRE_SAFETY = 'fire_safety',
  LEGIONELLA_RISK = 'legionella_risk',
  INVENTORY = 'inventory',
  TENANCY_AGREEMENT = 'tenancy_agreement',
  DEPOSIT_CERTIFICATE = 'deposit_certificate',
  INSURANCE = 'insurance',
  MORTGAGE = 'mortgage',
  TITLE_DEED = 'title_deed',
  PLANNING_PERMISSION = 'planning_permission',
  BUILDING_REGULATIONS = 'building_regulations',
  WARRANTY = 'warranty',
  INVOICE = 'invoice',
  RECEIPT = 'receipt',
  FLOORPLAN = 'floorplan',
  SURVEY = 'survey',
  VALUATION = 'valuation',
  OTHER = 'other',
}

export enum DocumentStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  PENDING_RENEWAL = 'pending_renewal',
  ARCHIVED = 'archived',
  DRAFT = 'draft',
}

@Entity('property_documents')
export class PropertyDocument {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column()
  filename: string;

  @ApiProperty()
  @Column()
  originalName: string;

  @ApiProperty()
  @Column()
  url: string;

  @ApiProperty({ enum: DocumentType })
  @Column({
    type: 'varchar',
    
  })
  type: DocumentType;

  @ApiProperty({ enum: DocumentStatus })
  @Column({
    type: 'varchar',
    
    default: DocumentStatus.ACTIVE,
  })
  status: DocumentStatus;

  @ApiProperty()
  @Column()
  title: string;

  @ApiProperty()
  @Column('text', { nullable: true })
  description: string;

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
  issuer: string;

  @ApiProperty()
  @Column({ nullable: true })
  certificateNumber: string;

  @ApiProperty()
  @Column({ nullable: true })
  referenceNumber: string;

  @ApiProperty()
  @Column({ default: false })
  isRequired: boolean;

  @ApiProperty()
  @Column({ default: false })
  isPublic: boolean; // Can be viewed by tenants

  @ApiProperty()
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  fileSize: number; // in bytes

  @ApiProperty()
  @Column({ nullable: true })
  mimeType: string;

  @ApiProperty()
  @Column('simple-array', { nullable: true })
  tags: string[];

  @ApiProperty()
  @Column('text', { nullable: true })
  notes: string;

  @ApiProperty()
  @Column({ default: 0 })
  version: number;

  @ApiProperty()
  @Column({ nullable: true })
  previousVersionId: string;

  @ApiProperty()
  @Column({ default: false })
  requiresRenewal: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  renewalReminderDays: number;

  @ApiProperty()
  @Column({ default: false })
  reminderSent: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  reminderSentAt: Date;

  @ApiProperty()
  @Column('json', { nullable: true })
  metadata: any; // Additional document-specific data

  // Relationships
  @ApiProperty()
  @Column('uuid')
  propertyId: string;

  @ManyToOne(() => Property, property => property.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'propertyId' })
  property: Property;

  @ApiProperty()
  @Column('uuid')
  uploadedById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'uploadedById' })
  uploadedBy: User;

  @ApiProperty()
  @Column('uuid', { nullable: true })
  verifiedById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'verifiedById' })
  verifiedBy: User;

  @ApiProperty()
  @Column({ nullable: true })
  verifiedAt: Date;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
