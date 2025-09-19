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

export enum CaseType {
  CONVEYANCING = 'conveyancing',
  FAMILY_LAW = 'family_law',
  CRIMINAL_LAW = 'criminal_law',
  COMMERCIAL_LAW = 'commercial_law',
  EMPLOYMENT_LAW = 'employment_law',
  PERSONAL_INJURY = 'personal_injury',
  PROPERTY_DISPUTE = 'property_dispute',
  LITIGATION = 'litigation',
  CORPORATE_LAW = 'corporate_law',
  IMMIGRATION_LAW = 'immigration_law',
  WILLS_PROBATE = 'wills_probate',
  DEBT_RECOVERY = 'debt_recovery',
}

export enum CaseStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  ON_HOLD = 'on_hold',
  AWAITING_CLIENT = 'awaiting_client',
  AWAITING_THIRD_PARTY = 'awaiting_third_party',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  CLOSED = 'closed',
}

export enum CasePriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  OVERDUE = 'overdue',
}

@Entity('legal_cases')
export class LegalCase {
  @ApiProperty({ description: 'Unique identifier for the legal case' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Case reference number' })
  @Column({ unique: true, length: 50 })
  caseNumber: string;

  @ApiProperty({ description: 'Case title' })
  @Column({ length: 255 })
  title: string;

  @ApiProperty({ description: 'Case description' })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({ description: 'Type of legal case', enum: CaseType })
  @Column({ type: 'varchar' })
  caseType: CaseType;

  @ApiProperty({ description: 'Current status of the case', enum: CaseStatus })
  @Column({ type: 'varchar', default: CaseStatus.PENDING })
  status: CaseStatus;

  @ApiProperty({ description: 'Case priority', enum: CasePriority })
  @Column({ type: 'varchar', default: CasePriority.MEDIUM })
  priority: CasePriority;

  @ApiProperty({ description: 'Client user ID' })
  @Column('uuid')
  clientId: string;

  @ApiProperty({ description: 'Assigned solicitor ID' })
  @Column('uuid')
  solicitorId: string;

  @ApiProperty({ description: 'Property ID if related to property' })
  @Column('uuid', { nullable: true })
  propertyId?: string;

  @ApiProperty({ description: 'Property address if related to property' })
  @Column({ length: 500, nullable: true })
  propertyAddress?: string;

  @ApiProperty({ description: 'Case start date' })
  @Column({ type: 'date' })
  startDate: Date;

  @ApiProperty({ description: 'Expected completion date' })
  @Column({ type: 'date', nullable: true })
  expectedCompletionDate?: Date;

  @ApiProperty({ description: 'Actual completion date' })
  @Column({ type: 'date', nullable: true })
  actualCompletionDate?: Date;

  @ApiProperty({ description: 'Court reference number if applicable' })
  @Column({ length: 100, nullable: true })
  courtReference?: string;

  @ApiProperty({ description: 'Opposing party name' })
  @Column({ length: 255, nullable: true })
  opposingParty?: string;

  @ApiProperty({ description: 'Opposing solicitor details' })
  @Column({ type: 'json', nullable: true })
  opposingSolicitor?: {
    name: string;
    firm: string;
    email?: string;
    phone?: string;
  };

  @ApiProperty({ description: 'Estimated case value' })
  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  estimatedValue?: number;

  @ApiProperty({ description: 'Legal fees quoted' })
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  quotedFees?: number;

  @ApiProperty({ description: 'Actual legal fees charged' })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  actualFees: number;

  @ApiProperty({ description: 'Disbursements' })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  disbursements: number;

  @ApiProperty({ description: 'Total costs' })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalCosts: number;

  @ApiProperty({ description: 'Payment status' })
  @Column({ length: 50, default: 'pending' })
  paymentStatus: string;

  @ApiProperty({ description: 'Key milestones and dates' })
  @Column({ type: 'json', nullable: true })
  milestones?: {
    name: string;
    description?: string;
    dueDate?: Date;
    completedDate?: Date;
    status: 'pending' | 'completed' | 'overdue';
  }[];

  @ApiProperty({ description: 'Case progress percentage' })
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  progressPercentage: number;

  @ApiProperty({ description: 'Next action required' })
  @Column({ length: 500, nullable: true })
  nextAction?: string;

  @ApiProperty({ description: 'Next action due date' })
  @Column({ type: 'date', nullable: true })
  nextActionDueDate?: Date;

  @ApiProperty({ description: 'Internal notes' })
  @Column({ type: 'text', nullable: true })
  internalNotes?: string;

  @ApiProperty({ description: 'Client notes' })
  @Column({ type: 'text', nullable: true })
  clientNotes?: string;

  @ApiProperty({ description: 'Last communication date' })
  @Column({ type: 'datetime', nullable: true })
  lastCommunication?: Date;

  @ApiProperty({ description: 'Communication log' })
  @Column({ type: 'json', nullable: true })
  communicationLog?: {
    date: Date;
    type: 'email' | 'phone' | 'meeting' | 'letter';
    summary: string;
    participants: string[];
  }[];

  @ApiProperty({ description: 'Risk assessment' })
  @Column({ length: 50, default: 'low' })
  riskLevel: string;

  @ApiProperty({ description: 'Compliance checks completed' })
  @Column({ default: false })
  complianceChecksCompleted: boolean;

  @ApiProperty({ description: 'Money laundering checks completed' })
  @Column({ default: false })
  mlChecksCompleted: boolean;

  @ApiProperty({ description: 'Client identification verified' })
  @Column({ default: false })
  clientIdVerified: boolean;

  @ApiProperty({ description: 'Date when the case was created' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Date when the case was last updated' })
  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'clientId' })
  client: User;

  @ManyToOne(() => Solicitor, (solicitor) => solicitor.legalCases, { eager: true })
  @JoinColumn({ name: 'solicitorId' })
  solicitor: Solicitor;

  @OneToMany(() => CaseTask, (task) => task.legalCase, { cascade: true })
  tasks: CaseTask[];

  @OneToMany(() => CaseDocument, (document) => document.legalCase, { cascade: true })
  documents: CaseDocument[];

  get isOverdue(): boolean {
    if (!this.expectedCompletionDate) return false;
    return new Date() > this.expectedCompletionDate && this.status !== CaseStatus.COMPLETED;
  }

  get daysRemaining(): number {
    if (!this.expectedCompletionDate) return 0;
    const today = new Date();
    const diffTime = this.expectedCompletionDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  get isUrgent(): boolean {
    return this.priority === CasePriority.URGENT || this.daysRemaining <= 7;
  }

  get completionRate(): number {
    if (!this.tasks || this.tasks.length === 0) return 0;
    const completedTasks = this.tasks.filter(task => task.status === TaskStatus.COMPLETED).length;
    return (completedTasks / this.tasks.length) * 100;
  }
}

@Entity('case_tasks')
export class CaseTask {
  @ApiProperty({ description: 'Unique identifier for the task' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Task title' })
  @Column({ length: 200 })
  title: string;

  @ApiProperty({ description: 'Task description' })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({ description: 'Task status', enum: TaskStatus })
  @Column({ type: 'varchar', default: TaskStatus.PENDING })
  status: TaskStatus;

  @ApiProperty({ description: 'Task priority', enum: CasePriority })
  @Column({ type: 'varchar', default: CasePriority.MEDIUM })
  priority: CasePriority;

  @ApiProperty({ description: 'Due date for the task' })
  @Column({ type: 'date', nullable: true })
  dueDate?: Date;

  @ApiProperty({ description: 'Date when the task was completed' })
  @Column({ type: 'datetime', nullable: true })
  completedAt?: Date;

  @ApiProperty({ description: 'Assigned to user ID' })
  @Column('uuid', { nullable: true })
  assignedToId?: string;

  @ApiProperty({ description: 'Legal case ID' })
  @Column('uuid')
  legalCaseId: string;

  @ApiProperty({ description: 'Date when the task was created' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Date when the task was last updated' })
  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => LegalCase, (legalCase) => legalCase.tasks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'legalCaseId' })
  legalCase: LegalCase;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assignedToId' })
  assignedTo?: User;
}

@Entity('case_documents')
export class CaseDocument {
  @ApiProperty({ description: 'Unique identifier for the document' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Document name' })
  @Column({ length: 255 })
  name: string;

  @ApiProperty({ description: 'Document type/category' })
  @Column({ length: 100 })
  category: string;

  @ApiProperty({ description: 'File path or URL' })
  @Column({ length: 500 })
  filePath: string;

  @ApiProperty({ description: 'File size in bytes' })
  @Column({ type: 'bigint', nullable: true })
  fileSize?: number;

  @ApiProperty({ description: 'MIME type of the file' })
  @Column({ length: 100, nullable: true })
  mimeType?: string;

  @ApiProperty({ description: 'Document status' })
  @Column({ length: 50, default: 'uploaded' })
  status: string;

  @ApiProperty({ description: 'Legal case ID' })
  @Column('uuid')
  legalCaseId: string;

  @ApiProperty({ description: 'Uploaded by user ID' })
  @Column('uuid')
  uploadedById: string;

  @ApiProperty({ description: 'Date when the document was uploaded' })
  @CreateDateColumn()
  uploadedAt: Date;

  @ManyToOne(() => LegalCase, (legalCase) => legalCase.documents, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'legalCaseId' })
  legalCase: LegalCase;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'uploadedById' })
  uploadedBy: User;
}
