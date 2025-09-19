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

export enum TransactionType {
  PURCHASE = 'purchase',
  SALE = 'sale',
  REMORTGAGE = 'remortgage',
  TRANSFER_OF_EQUITY = 'transfer_of_equity',
  LEASE_EXTENSION = 'lease_extension',
  SHARED_OWNERSHIP = 'shared_ownership',
}

export enum TransactionStatus {
  INSTRUCTION_RECEIVED = 'instruction_received',
  SEARCHES_ORDERED = 'searches_ordered',
  SEARCHES_RECEIVED = 'searches_received',
  ENQUIRIES_RAISED = 'enquiries_raised',
  ENQUIRIES_REPLIED = 'enquiries_replied',
  MORTGAGE_APPROVED = 'mortgage_approved',
  CONTRACT_APPROVED = 'contract_approved',
  EXCHANGE_READY = 'exchange_ready',
  CONTRACTS_EXCHANGED = 'contracts_exchanged',
  COMPLETION_READY = 'completion_ready',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  ON_HOLD = 'on_hold',
}

export enum PropertyType {
  DETACHED_HOUSE = 'detached_house',
  SEMI_DETACHED_HOUSE = 'semi_detached_house',
  TERRACED_HOUSE = 'terraced_house',
  BUNGALOW = 'bungalow',
  FLAT = 'flat',
  MAISONETTE = 'maisonette',
  STUDIO = 'studio',
  COMMERCIAL = 'commercial',
  LAND = 'land',
}

export enum TenureType {
  FREEHOLD = 'freehold',
  LEASEHOLD = 'leasehold',
  SHARED_FREEHOLD = 'shared_freehold',
  COMMONHOLD = 'commonhold',
}

@Entity('conveyancing_transactions')
export class ConveyancingTransaction {
  @ApiProperty({ description: 'Unique identifier for the transaction' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Transaction reference number' })
  @Column({ unique: true, length: 50 })
  referenceNumber: string;

  @ApiProperty({ description: 'Type of transaction', enum: TransactionType })
  @Column({ type: 'varchar' })
  transactionType: TransactionType;

  @ApiProperty({ description: 'Current status', enum: TransactionStatus })
  @Column({ type: 'varchar', default: TransactionStatus.INSTRUCTION_RECEIVED })
  status: TransactionStatus;

  @ApiProperty({ description: 'Client user ID' })
  @Column('uuid')
  clientId: string;

  @ApiProperty({ description: 'Assigned solicitor ID' })
  @Column('uuid')
  solicitorId: string;

  // Property Information
  @ApiProperty({ description: 'Property address' })
  @Column({ length: 500 })
  propertyAddress: string;

  @ApiProperty({ description: 'Property postcode' })
  @Column({ length: 10 })
  propertyPostcode: string;

  @ApiProperty({ description: 'Property type', enum: PropertyType })
  @Column({ type: 'varchar' })
  propertyType: PropertyType;

  @ApiProperty({ description: 'Tenure type', enum: TenureType })
  @Column({ type: 'varchar' })
  tenureType: TenureType;

  @ApiProperty({ description: 'Property value' })
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  propertyValue: number;

  @ApiProperty({ description: 'Land Registry title number' })
  @Column({ length: 20, nullable: true })
  titleNumber?: string;

  @ApiProperty({ description: 'Lease expiry date for leasehold properties' })
  @Column({ type: 'date', nullable: true })
  leaseExpiryDate?: Date;

  @ApiProperty({ description: 'Ground rent amount for leasehold properties' })
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  groundRent?: number;

  @ApiProperty({ description: 'Service charge amount for leasehold properties' })
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  serviceCharge?: number;

  // Financial Information
  @ApiProperty({ description: 'Deposit amount' })
  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  deposit?: number;

  @ApiProperty({ description: 'Mortgage amount' })
  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  mortgageAmount?: number;

  @ApiProperty({ description: 'Mortgage lender name' })
  @Column({ length: 200, nullable: true })
  mortgageLender?: string;

  @ApiProperty({ description: 'Mortgage offer date' })
  @Column({ type: 'date', nullable: true })
  mortgageOfferDate?: Date;

  @ApiProperty({ description: 'Mortgage offer expiry date' })
  @Column({ type: 'date', nullable: true })
  mortgageOfferExpiryDate?: Date;

  @ApiProperty({ description: 'Stamp duty amount' })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  stampDuty: number;

  @ApiProperty({ description: 'Legal fees' })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  legalFees: number;

  @ApiProperty({ description: 'Search costs' })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  searchCosts: number;

  @ApiProperty({ description: 'Survey fees' })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  surveyFees: number;

  @ApiProperty({ description: 'Other costs' })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  otherCosts: number;

  @ApiProperty({ description: 'Total costs' })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalCosts: number;

  // Parties Information
  @ApiProperty({ description: 'Vendor/seller information' })
  @Column({ type: 'json', nullable: true })
  vendor?: {
    name: string;
    address: string;
    phone?: string;
    email?: string;
    solicitor?: {
      name: string;
      firm: string;
      address: string;
      phone?: string;
      email?: string;
      reference?: string;
    };
  };

  @ApiProperty({ description: 'Other party information' })
  @Column({ type: 'json', nullable: true })
  otherParty?: {
    name: string;
    address: string;
    phone?: string;
    email?: string;
    solicitor?: {
      name: string;
      firm: string;
      address: string;
      phone?: string;
      email?: string;
      reference?: string;
    };
  };

  @ApiProperty({ description: 'Estate agent information' })
  @Column({ type: 'json', nullable: true })
  estateAgent?: {
    name: string;
    firm: string;
    address: string;
    phone?: string;
    email?: string;
    reference?: string;
  };

  // Key Dates
  @ApiProperty({ description: 'Instruction date' })
  @Column({ type: 'date' })
  instructionDate: Date;

  @ApiProperty({ description: 'Target exchange date' })
  @Column({ type: 'date', nullable: true })
  targetExchangeDate?: Date;

  @ApiProperty({ description: 'Actual exchange date' })
  @Column({ type: 'date', nullable: true })
  actualExchangeDate?: Date;

  @ApiProperty({ description: 'Target completion date' })
  @Column({ type: 'date', nullable: true })
  targetCompletionDate?: Date;

  @ApiProperty({ description: 'Actual completion date' })
  @Column({ type: 'date', nullable: true })
  actualCompletionDate?: Date;

  // Progress Tracking
  @ApiProperty({ description: 'Key milestones and their status' })
  @Column({ type: 'json', nullable: true })
  milestones?: {
    name: string;
    description?: string;
    targetDate?: Date;
    completedDate?: Date;
    status: 'pending' | 'in_progress' | 'completed' | 'overdue';
    priority: 'low' | 'medium' | 'high';
  }[];

  @ApiProperty({ description: 'Progress percentage' })
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  progressPercentage: number;

  @ApiProperty({ description: 'Next action required' })
  @Column({ length: 500, nullable: true })
  nextAction?: string;

  @ApiProperty({ description: 'Next action due date' })
  @Column({ type: 'date', nullable: true })
  nextActionDueDate?: Date;

  // Searches and Enquiries
  @ApiProperty({ description: 'Local authority search status' })
  @Column({ length: 50, default: 'not_ordered' })
  localSearchStatus: string;

  @ApiProperty({ description: 'Environmental search status' })
  @Column({ length: 50, default: 'not_ordered' })
  environmentalSearchStatus: string;

  @ApiProperty({ description: 'Water search status' })
  @Column({ length: 50, default: 'not_ordered' })
  waterSearchStatus: string;

  @ApiProperty({ description: 'Drainage search status' })
  @Column({ length: 50, default: 'not_ordered' })
  drainageSearchStatus: string;

  @ApiProperty({ description: 'Enquiries raised' })
  @Column({ type: 'json', nullable: true })
  enquiries?: {
    question: string;
    response?: string;
    dateRaised: Date;
    dateResponded?: Date;
    status: 'pending' | 'responded' | 'satisfactory' | 'requires_follow_up';
  }[];

  // Communication and Notes
  @ApiProperty({ description: 'Internal notes' })
  @Column({ type: 'text', nullable: true })
  notes?: string;

  @ApiProperty({ description: 'Client updates log' })
  @Column({ type: 'json', nullable: true })
  clientUpdates?: {
    date: Date;
    update: string;
    method: 'email' | 'phone' | 'letter' | 'meeting';
  }[];

  @ApiProperty({ description: 'Last activity date' })
  @Column({ type: 'datetime', nullable: true })
  lastActivity?: Date;

  // Risk and Compliance
  @ApiProperty({ description: 'Risk factors identified' })
  @Column({ type: 'simple-array', nullable: true })
  riskFactors?: string[];

  @ApiProperty({ description: 'AML checks completed' })
  @Column({ default: false })
  amlChecksCompleted: boolean;

  @ApiProperty({ description: 'Source of funds verified' })
  @Column({ default: false })
  sourceOfFundsVerified: boolean;

  @ApiProperty({ description: 'Client ID verified' })
  @Column({ default: false })
  clientIdVerified: boolean;

  @ApiProperty({ description: 'Date when the transaction was created' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Date when the transaction was last updated' })
  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'clientId' })
  client: User;

  @ManyToOne(() => Solicitor, (solicitor) => solicitor.conveyancingTransactions, { eager: true })
  @JoinColumn({ name: 'solicitorId' })
  solicitor: Solicitor;

  @OneToMany(() => ConveyancingDocument, (document) => document.transaction, { cascade: true })
  documents: ConveyancingDocument[];

  // Virtual properties
  get isOverdue(): boolean {
    if (!this.targetCompletionDate) return false;
    return new Date() > this.targetCompletionDate && this.status !== TransactionStatus.COMPLETED;
  }

  get daysToCompletion(): number {
    if (!this.targetCompletionDate) return 0;
    const today = new Date();
    const diffTime = this.targetCompletionDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  get isUrgent(): boolean {
    return this.daysToCompletion <= 14 && this.daysToCompletion > 0;
  }

  get searchesComplete(): boolean {
    return (
      this.localSearchStatus === 'received' &&
      this.environmentalSearchStatus === 'received' &&
      this.waterSearchStatus === 'received' &&
      this.drainageSearchStatus === 'received'
    );
  }

  get readyForExchange(): boolean {
    return (
      this.searchesComplete &&
      this.amlChecksCompleted &&
      this.clientIdVerified &&
      this.mortgageOfferDate !== null &&
      this.status === TransactionStatus.EXCHANGE_READY
    );
  }
}

@Entity('conveyancing_documents')
export class ConveyancingDocument {
  @ApiProperty({ description: 'Unique identifier for the document' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Document name' })
  @Column({ length: 255 })
  name: string;

  @ApiProperty({ description: 'Document category' })
  @Column({ length: 100 })
  category: 'contract' | 'search' | 'mortgage' | 'survey' | 'insurance' | 'identity' | 'other';

  @ApiProperty({ description: 'Document status' })
  @Column({ length: 50 })
  status: 'required' | 'received' | 'reviewed' | 'approved' | 'sent';

  @ApiProperty({ description: 'File path or URL' })
  @Column({ length: 500, nullable: true })
  filePath?: string;

  @ApiProperty({ description: 'File size in bytes' })
  @Column({ type: 'bigint', nullable: true })
  fileSize?: number;

  @ApiProperty({ description: 'MIME type' })
  @Column({ length: 100, nullable: true })
  mimeType?: string;

  @ApiProperty({ description: 'Upload date' })
  @Column({ type: 'datetime', nullable: true })
  uploadDate?: Date;

  @ApiProperty({ description: 'Review date' })
  @Column({ type: 'datetime', nullable: true })
  reviewDate?: Date;

  @ApiProperty({ description: 'Expiry date' })
  @Column({ type: 'date', nullable: true })
  expiryDate?: Date;

  @ApiProperty({ description: 'Transaction ID' })
  @Column('uuid')
  transactionId: string;

  @ApiProperty({ description: 'Uploaded by user ID' })
  @Column('uuid', { nullable: true })
  uploadedById?: string;

  @ApiProperty({ description: 'Date when the document was created' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Date when the document was last updated' })
  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => ConveyancingTransaction, (transaction) => transaction.documents, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'transactionId' })
  transaction: ConveyancingTransaction;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'uploadedById' })
  uploadedBy?: User;
}
