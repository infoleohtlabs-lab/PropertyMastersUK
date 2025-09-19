import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Solicitor } from './solicitor.entity';
import { User } from '../../users/entities/user.entity';

export enum ContractType {
  EMPLOYMENT = 'employment',
  SERVICE_AGREEMENT = 'service_agreement',
  PARTNERSHIP = 'partnership',
  LEASE_AGREEMENT = 'lease_agreement',
  PURCHASE_AGREEMENT = 'purchase_agreement',
  NON_DISCLOSURE = 'non_disclosure',
  LICENSING = 'licensing',
  DISTRIBUTION = 'distribution',
  FRANCHISE = 'franchise',
  JOINT_VENTURE = 'joint_venture',
  CONSULTANCY = 'consultancy',
  MAINTENANCE = 'maintenance',
  SUPPLY = 'supply',
  OTHER = 'other',
}

export enum ContractStatus {
  DRAFT = 'draft',
  UNDER_REVIEW = 'under_review',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  SENT_FOR_SIGNATURE = 'sent_for_signature',
  PARTIALLY_SIGNED = 'partially_signed',
  FULLY_EXECUTED = 'fully_executed',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  TERMINATED = 'terminated',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
  DISPUTED = 'disputed',
  BREACHED = 'breached',
}

export enum ContractPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum RenewalStatus {
  NOT_APPLICABLE = 'not_applicable',
  AUTO_RENEWAL = 'auto_renewal',
  MANUAL_RENEWAL = 'manual_renewal',
  RENEWAL_REQUIRED = 'renewal_required',
  RENEWAL_IN_PROGRESS = 'renewal_in_progress',
  RENEWED = 'renewed',
  NOT_RENEWED = 'not_renewed',
}

export enum PartyType {
  INDIVIDUAL = 'individual',
  COMPANY = 'company',
  ORGANIZATION = 'organization',
  GOVERNMENT = 'government',
}

export enum ClauseType {
  PAYMENT = 'payment',
  TERMINATION = 'termination',
  CONFIDENTIALITY = 'confidentiality',
  LIABILITY = 'liability',
  INTELLECTUAL_PROPERTY = 'intellectual_property',
  DISPUTE_RESOLUTION = 'dispute_resolution',
  FORCE_MAJEURE = 'force_majeure',
  GOVERNING_LAW = 'governing_law',
  OTHER = 'other',
}

export enum TerminationReason {
  MUTUAL_AGREEMENT = 'mutual_agreement',
  BREACH_OF_CONTRACT = 'breach_of_contract',
  NON_PAYMENT = 'non_payment',
  CONVENIENCE = 'convenience',
  EXPIRATION = 'expiration',
  FORCE_MAJEURE = 'force_majeure',
  REGULATORY_CHANGE = 'regulatory_change',
  OTHER = 'other',
}

export enum RenewalType {
  AUTOMATIC = 'automatic',
  MANUAL = 'manual',
  NEGOTIATED = 'negotiated',
  NONE = 'none',
}

@Entity('legal_contracts')
export class LegalContract {
  @ApiProperty({ description: 'Unique identifier for the contract' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Contract reference number' })
  @Column({ unique: true, length: 50 })
  referenceNumber: string;

  @ApiProperty({ description: 'Contract title' })
  @Column({ length: 255 })
  title: string;

  @ApiProperty({ description: 'Contract description' })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({ description: 'Type of contract', enum: ContractType })
  @Column({ type: 'varchar' })
  contractType: ContractType;

  @ApiProperty({ description: 'Current status', enum: ContractStatus })
  @Column({ type: 'varchar', default: ContractStatus.DRAFT })
  status: ContractStatus;

  @ApiProperty({ description: 'Priority level', enum: ContractPriority })
  @Column({ type: 'varchar', default: ContractPriority.MEDIUM })
  priority: ContractPriority;

  @ApiProperty({ description: 'Client user ID' })
  @Column('uuid')
  clientId: string;

  @ApiProperty({ description: 'Assigned solicitor ID' })
  @Column('uuid')
  solicitorId: string;

  // Contract Terms
  @ApiProperty({ description: 'Contract value' })
  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  contractValue?: number;

  @ApiProperty({ description: 'Currency code' })
  @Column({ length: 3, default: 'GBP' })
  currency: string;

  @ApiProperty({ description: 'Payment terms' })
  @Column({ type: 'text', nullable: true })
  paymentTerms?: string;

  @ApiProperty({ description: 'Delivery terms' })
  @Column({ type: 'text', nullable: true })
  deliveryTerms?: string;

  @ApiProperty({ description: 'Governing law' })
  @Column({ length: 100, default: 'English Law' })
  governingLaw: string;

  @ApiProperty({ description: 'Jurisdiction' })
  @Column({ length: 100, default: 'England and Wales' })
  jurisdiction: string;

  // Key Dates
  @ApiProperty({ description: 'Contract start date' })
  @Column({ type: 'date', nullable: true })
  startDate?: Date;

  @ApiProperty({ description: 'Contract end date' })
  @Column({ type: 'date', nullable: true })
  endDate?: Date;

  @ApiProperty({ description: 'Signature deadline' })
  @Column({ type: 'date', nullable: true })
  signatureDeadline?: Date;

  @ApiProperty({ description: 'Notice period in days' })
  @Column({ type: 'int', nullable: true })
  noticePeriodDays?: number;

  @ApiProperty({ description: 'Renewal status', enum: RenewalStatus })
  @Column({ type: 'varchar', default: RenewalStatus.NOT_APPLICABLE })
  renewalStatus: RenewalStatus;

  @ApiProperty({ description: 'Auto-renewal period in months' })
  @Column({ type: 'int', nullable: true })
  autoRenewalMonths?: number;

  @ApiProperty({ description: 'Renewal notice period in days' })
  @Column({ type: 'int', nullable: true })
  renewalNoticeDays?: number;

  // Risk and Compliance
  @ApiProperty({ description: 'Risk assessment score' })
  @Column({ type: 'decimal', precision: 3, scale: 1, nullable: true })
  riskScore?: number;

  @ApiProperty({ description: 'Risk factors identified' })
  @Column({ type: 'simple-array', nullable: true })
  riskFactors?: string[];

  @ApiProperty({ description: 'Compliance requirements' })
  @Column({ type: 'simple-array', nullable: true })
  complianceRequirements?: string[];

  @ApiProperty({ description: 'Regulatory approvals required' })
  @Column({ type: 'simple-array', nullable: true })
  regulatoryApprovals?: string[];

  @ApiProperty({ description: 'Insurance requirements' })
  @Column({ type: 'text', nullable: true })
  insuranceRequirements?: string;

  // Performance and Monitoring
  @ApiProperty({ description: 'Key performance indicators' })
  @Column({ type: 'json', nullable: true })
  kpis?: {
    name: string;
    target: string;
    current?: string;
    status: 'on_track' | 'at_risk' | 'behind';
  }[];

  @ApiProperty({ description: 'Service level agreements' })
  @Column({ type: 'json', nullable: true })
  slas?: {
    metric: string;
    target: string;
    measurement: string;
    penalty?: string;
  }[];

  @ApiProperty({ description: 'Performance review dates' })
  @Column({ type: 'simple-array', nullable: true })
  reviewDates?: string[];

  // Communication and Notes
  @ApiProperty({ description: 'Internal notes' })
  @Column({ type: 'text', nullable: true })
  notes?: string;

  @ApiProperty({ description: 'Client instructions' })
  @Column({ type: 'text', nullable: true })
  clientInstructions?: string;

  @ApiProperty({ description: 'Special conditions' })
  @Column({ type: 'text', nullable: true })
  specialConditions?: string;

  @ApiProperty({ description: 'Communication log' })
  @Column({ type: 'json', nullable: true })
  communicationLog?: {
    date: Date;
    type: 'email' | 'phone' | 'meeting' | 'letter';
    summary: string;
    participants: string[];
  }[];

  @ApiProperty({ description: 'Last activity date' })
  @Column({ type: 'datetime', nullable: true })
  lastActivity?: Date;

  // Template and Automation
  @ApiProperty({ description: 'Template used for contract' })
  @Column({ length: 255, nullable: true })
  templateUsed?: string;

  @ApiProperty({ description: 'Automated clauses applied' })
  @Column({ type: 'simple-array', nullable: true })
  automatedClauses?: string[];

  @ApiProperty({ description: 'Custom fields' })
  @Column({ type: 'json', nullable: true })
  customFields?: Record<string, any>;

  @ApiProperty({ description: 'Tags for categorization' })
  @Column({ type: 'simple-array', nullable: true })
  tags?: string[];

  @ApiProperty({ description: 'Date when the contract was created' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Date when the contract was last updated' })
  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'clientId' })
  client: User;

  @ManyToOne(() => Solicitor, (solicitor) => solicitor.legalContracts, { eager: true })
  @JoinColumn({ name: 'solicitorId' })
  solicitor: Solicitor;

  @OneToMany(() => ContractParty, (party) => party.contract, { cascade: true })
  parties: ContractParty[];

  @OneToMany(() => ContractClause, (clause) => clause.contract, { cascade: true })
  clauses: ContractClause[];

  @OneToMany(() => ContractDocument, (document) => document.contract, { cascade: true })
  documents: ContractDocument[];

  @OneToMany(() => ContractMilestone, (milestone) => milestone.contract, { cascade: true })
  milestones: ContractMilestone[];

  // Virtual properties
  get isExpired(): boolean {
    if (!this.endDate) return false;
    return new Date() > this.endDate;
  }

  get isExpiringSoon(): boolean {
    if (!this.endDate) return false;
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return this.endDate <= thirtyDaysFromNow && !this.isExpired;
  }

  get isFullySigned(): boolean {
    return this.parties?.every(party => party.hasSigned) || false;
  }

  get signatureProgress(): number {
    if (!this.parties || this.parties.length === 0) return 0;
    const signedCount = this.parties.filter(party => party.hasSigned).length;
    return (signedCount / this.parties.length) * 100;
  }

  get daysUntilExpiry(): number {
    if (!this.endDate) return 0;
    const today = new Date();
    const diffTime = this.endDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  get overdueMilestones(): ContractMilestone[] {
    if (!this.milestones) return [];
    const today = new Date();
    return this.milestones.filter(
      milestone => milestone.dueDate < today && milestone.status !== 'completed'
    );
  }

  get completionPercentage(): number {
    if (!this.milestones || this.milestones.length === 0) return 0;
    const completedCount = this.milestones.filter(milestone => milestone.status === 'completed').length;
    return (completedCount / this.milestones.length) * 100;
  }

  get requiresRenewalAction(): boolean {
    if (this.renewalStatus === RenewalStatus.NOT_APPLICABLE) return false;
    if (!this.endDate || !this.renewalNoticeDays) return false;
    
    const renewalNoticeDate = new Date(this.endDate);
    renewalNoticeDate.setDate(renewalNoticeDate.getDate() - this.renewalNoticeDays);
    
    return new Date() >= renewalNoticeDate && this.renewalStatus === RenewalStatus.MANUAL_RENEWAL;
  }
}

@Entity('contract_parties')
export class ContractParty {
  @ApiProperty({ description: 'Unique identifier for the party' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Party name' })
  @Column({ length: 255 })
  name: string;

  @ApiProperty({ description: 'Party type' })
  @Column({ length: 50 })
  type: 'individual' | 'company' | 'organization' | 'government';

  @ApiProperty({ description: 'Party role in contract' })
  @Column({ length: 100 })
  role: string;

  @ApiProperty({ description: 'Contact email' })
  @Column({ length: 255, nullable: true })
  email?: string;

  @ApiProperty({ description: 'Contact phone' })
  @Column({ length: 50, nullable: true })
  phone?: string;

  @ApiProperty({ description: 'Address' })
  @Column({ type: 'text', nullable: true })
  address?: string;

  @ApiProperty({ description: 'Company registration number' })
  @Column({ length: 50, nullable: true })
  registrationNumber?: string;

  @ApiProperty({ description: 'Authorized signatory name' })
  @Column({ length: 255, nullable: true })
  authorizedSignatory?: string;

  @ApiProperty({ description: 'Signatory title/position' })
  @Column({ length: 100, nullable: true })
  signatoryTitle?: string;

  @ApiProperty({ description: 'Date when party signed' })
  @Column({ type: 'datetime', nullable: true })
  signedDate?: Date;

  @ApiProperty({ description: 'Whether party has signed' })
  @Column({ default: false })
  hasSigned: boolean;

  @ApiProperty({ description: 'Digital signature data' })
  @Column({ type: 'text', nullable: true })
  digitalSignature?: string;

  @ApiProperty({ description: 'Contract ID' })
  @Column('uuid')
  contractId: string;

  @ApiProperty({ description: 'Date when the party was created' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Date when the party was last updated' })
  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => LegalContract, (contract) => contract.parties, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'contractId' })
  contract: LegalContract;
}

@Entity('contract_clauses')
export class ContractClause {
  @ApiProperty({ description: 'Unique identifier for the clause' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Clause title' })
  @Column({ length: 255 })
  title: string;

  @ApiProperty({ description: 'Clause content' })
  @Column({ type: 'text' })
  content: string;

  @ApiProperty({ description: 'Clause category' })
  @Column({ length: 100 })
  category: string;

  @ApiProperty({ description: 'Clause order/position' })
  @Column({ type: 'int' })
  order: number;

  @ApiProperty({ description: 'Whether clause is mandatory' })
  @Column({ default: false })
  isMandatory: boolean;

  @ApiProperty({ description: 'Whether clause is negotiable' })
  @Column({ default: true })
  isNegotiable: boolean;

  @ApiProperty({ description: 'Clause status' })
  @Column({ length: 50, default: 'active' })
  status: 'active' | 'deleted' | 'superseded';

  @ApiProperty({ description: 'Version number' })
  @Column({ type: 'int', default: 1 })
  version: number;

  @ApiProperty({ description: 'Notes about the clause' })
  @Column({ type: 'text', nullable: true })
  notes?: string;

  @ApiProperty({ description: 'Contract ID' })
  @Column('uuid')
  contractId: string;

  @ApiProperty({ description: 'Date when the clause was created' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Date when the clause was last updated' })
  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => LegalContract, (contract) => contract.clauses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'contractId' })
  contract: LegalContract;
}

@Entity('contract_documents')
export class ContractDocument {
  @ApiProperty({ description: 'Unique identifier for the document' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Document name' })
  @Column({ length: 255 })
  name: string;

  @ApiProperty({ description: 'Document type' })
  @Column({ length: 100 })
  type: 'main_contract' | 'amendment' | 'addendum' | 'schedule' | 'exhibit' | 'supporting_document';

  @ApiProperty({ description: 'Document version' })
  @Column({ length: 20, default: '1.0' })
  version: string;

  @ApiProperty({ description: 'File path or URL' })
  @Column({ length: 500, nullable: true })
  filePath?: string;

  @ApiProperty({ description: 'File size in bytes' })
  @Column({ type: 'bigint', nullable: true })
  fileSize?: number;

  @ApiProperty({ description: 'MIME type' })
  @Column({ length: 100, nullable: true })
  mimeType?: string;

  @ApiProperty({ description: 'Document hash for integrity' })
  @Column({ length: 255, nullable: true })
  documentHash?: string;

  @ApiProperty({ description: 'Whether document is final version' })
  @Column({ default: false })
  isFinal: boolean;

  @ApiProperty({ description: 'Whether document is signed' })
  @Column({ default: false })
  isSigned: boolean;

  @ApiProperty({ description: 'Upload date' })
  @Column({ type: 'datetime', nullable: true })
  uploadDate?: Date;

  @ApiProperty({ description: 'Contract ID' })
  @Column('uuid')
  contractId: string;

  @ApiProperty({ description: 'Uploaded by user ID' })
  @Column('uuid', { nullable: true })
  uploadedById?: string;

  @ApiProperty({ description: 'Date when the document was created' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Date when the document was last updated' })
  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => LegalContract, (contract) => contract.documents, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'contractId' })
  contract: LegalContract;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'uploadedById' })
  uploadedBy?: User;
}

@Entity('contract_milestones')
export class ContractMilestone {
  @ApiProperty({ description: 'Unique identifier for the milestone' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Milestone title' })
  @Column({ length: 255 })
  title: string;

  @ApiProperty({ description: 'Milestone description' })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({ description: 'Due date' })
  @Column({ type: 'date' })
  dueDate: Date;

  @ApiProperty({ description: 'Completion date' })
  @Column({ type: 'date', nullable: true })
  completionDate?: Date;

  @ApiProperty({ description: 'Milestone status' })
  @Column({ length: 50, default: 'pending' })
  status: 'pending' | 'in_progress' | 'completed' | 'overdue' | 'cancelled';

  @ApiProperty({ description: 'Responsible party' })
  @Column({ length: 255, nullable: true })
  responsibleParty?: string;

  @ApiProperty({ description: 'Priority level' })
  @Column({ type: 'varchar', default: ContractPriority.MEDIUM })
  priority: ContractPriority;

  @ApiProperty({ description: 'Notes about the milestone' })
  @Column({ type: 'text', nullable: true })
  notes?: string;

  @ApiProperty({ description: 'Contract ID' })
  @Column('uuid')
  contractId: string;

  @ApiProperty({ description: 'Date when the milestone was created' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Date when the milestone was last updated' })
  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => LegalContract, (contract) => contract.milestones, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'contractId' })
  contract: LegalContract;
}
