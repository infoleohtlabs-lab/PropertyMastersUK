import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Tenant } from './tenant.entity';

export enum DocumentType {
  IDENTITY = 'identity',
  PASSPORT = 'passport',
  DRIVING_LICENSE = 'driving_license',
  PROOF_OF_INCOME = 'proof_of_income',
  BANK_STATEMENT = 'bank_statement',
  EMPLOYMENT_CONTRACT = 'employment_contract',
  PAYSLIP = 'payslip',
  RIGHT_TO_RENT = 'right_to_rent',
  REFERENCE = 'reference',
  GUARANTOR_DOCUMENT = 'guarantor_document',
  CREDIT_REPORT = 'credit_report',
  OTHER = 'other',
}

export enum DocumentStatus {
  PENDING = 'pending',
  UPLOADED = 'uploaded',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
}

@Entity('tenant_documents')
@Index(['tenantId'])
@Index(['documentType'])
@Index(['status'])
export class TenantDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @ManyToOne(() => Tenant, (tenant) => tenant.documents, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({
    type: 'varchar',
    
  })
  documentType: DocumentType;

  @Column({ length: 255 })
  fileName: string;

  @Column({ length: 255 })
  filePath: string;

  @Column({ length: 100, nullable: true })
  mimeType?: string;

  @Column({ type: 'bigint', nullable: true })
  fileSize?: number;

  @Column({
    type: 'varchar',
    
    default: DocumentStatus.PENDING,
  })
  status: DocumentStatus;

  @Column({ type: 'date', nullable: true })
  expiryDate?: Date;

  @Column({ type: 'boolean', default: false })
  isVerified: boolean;

  @Column({ type: 'datetime', nullable: true })
  verifiedDate?: Date;

  @Column({ length: 100, nullable: true })
  verifiedBy?: string;

  @Column({ length: 1000, nullable: true })
  notes?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
