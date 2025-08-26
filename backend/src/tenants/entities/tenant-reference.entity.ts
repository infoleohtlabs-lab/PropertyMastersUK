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

export enum ReferenceType {
  EMPLOYER = 'employer',
  PREVIOUS_LANDLORD = 'previous_landlord',
  PERSONAL = 'personal',
  CHARACTER = 'character',
  PROFESSIONAL = 'professional',
  ACADEMIC = 'academic',
}

export enum ReferenceStatus {
  PENDING = 'pending',
  REQUESTED = 'requested',
  RECEIVED = 'received',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
}

@Entity('tenant_references')
@Index(['tenantId'])
@Index(['referenceType'])
@Index(['status'])
export class TenantReference {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @ManyToOne(() => Tenant, (tenant) => tenant.references, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({
    type: 'varchar',
    
  })
  referenceType: ReferenceType;

  @Column({ length: 100 })
  referenceName: string;

  @Column({ length: 255, nullable: true })
  referenceCompany?: string;

  @Column({ length: 100, nullable: true })
  referencePosition?: string;

  @Column({ length: 255 })
  referenceEmail: string;

  @Column({ length: 20 })
  referencePhone: string;

  @Column({ length: 255, nullable: true })
  referenceAddress?: string;

  @Column({ length: 100, nullable: true })
  relationship?: string;

  @Column({
    type: 'varchar',
    
    default: ReferenceStatus.PENDING,
  })
  status: ReferenceStatus;

  @Column({ type: 'datetime', nullable: true })
  requestedDate?: Date;

  @Column({ type: 'datetime', nullable: true })
  receivedDate?: Date;

  @Column({ type: 'datetime', nullable: true })
  verifiedDate?: Date;

  @Column({ type: 'text', nullable: true })
  referenceContent?: string;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  rating?: number;

  @Column({ length: 1000, nullable: true })
  notes?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
