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
import { User } from '../../users/entities/user.entity';

export enum ConsentType {
  MARKETING = 'marketing',
  ANALYTICS = 'analytics',
  FUNCTIONAL = 'functional',
  PERFORMANCE = 'performance',
  THIRD_PARTY = 'third_party',
  DATA_PROCESSING = 'data_processing',
  COMMUNICATION = 'communication',
}

export enum ConsentStatus {
  GRANTED = 'granted',
  WITHDRAWN = 'withdrawn',
  EXPIRED = 'expired',
  PENDING = 'pending',
}

export enum ConsentMethod {
  EXPLICIT = 'explicit',
  IMPLIED = 'implied',
  LEGITIMATE_INTEREST = 'legitimate_interest',
  CONTRACTUAL = 'contractual',
}

@Entity('consent_records')
@Index(['userId', 'type'])
@Index(['status', 'createdAt'])
@Index(['expiresAt'])
export class ConsentRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    type: 'varchar',
  })
  type: ConsentType;

  @Column({
    type: 'varchar',
  })
  status: ConsentStatus;

  @Column({
    type: 'varchar',
  })
  method: ConsentMethod;

  @Column({ length: 200 })
  purpose: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({ name: 'granted_at', nullable: true })
  grantedAt: Date;

  @Column({ name: 'withdrawn_at', nullable: true })
  withdrawnAt: Date;

  @Column({ name: 'expires_at', nullable: true })
  expiresAt: Date;

  @Column({ name: 'ip_address', length: 45, nullable: true })
  ipAddress: string;

  @Column({ name: 'user_agent', length: 500, nullable: true })
  userAgent: string;

  @Column('text', { nullable: true })
  metadata: Record<string, any>;

  @Column({ name: 'legal_basis', length: 100, nullable: true })
  legalBasis: string;

  @Column({ name: 'data_categories', type: 'text', array: true, nullable: true })
  dataCategories: string[];

  @Column({ name: 'processing_purposes', type: 'text', array: true, nullable: true })
  processingPurposes: string[];

  @Column({ name: 'third_parties', type: 'text', array: true, nullable: true })
  thirdParties: string[];

  @Column({ name: 'retention_period', nullable: true })
  retentionPeriod: number; // in days

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ default: false })
  archived: boolean;

  @Column('text', { nullable: true })
  notes: string;

  @Column({ name: 'version', default: 1 })
  version: number;

  @Column({ name: 'parent_consent_id', nullable: true })
  parentConsentId: string;

  @ManyToOne(() => ConsentRecord, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'parent_consent_id' })
  parentConsent: ConsentRecord;
}
