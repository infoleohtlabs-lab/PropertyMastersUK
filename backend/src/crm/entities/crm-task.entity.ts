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
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { Property } from '../../properties/entities/property.entity';
import { Lead } from './lead.entity';
import { CrmContact } from './crm-contact.entity';
import { CrmDeal } from './crm-deal.entity';
import { Campaign } from './campaign.entity';

export enum TaskType {
  CALL = 'call',
  EMAIL = 'email',
  MEETING = 'meeting',
  FOLLOW_UP = 'follow_up',
  PROPERTY_VIEWING = 'property_viewing',
  VALUATION = 'valuation',
  DOCUMENT_REVIEW = 'document_review',
  PROPOSAL_PREPARATION = 'proposal_preparation',
  CONTRACT_NEGOTIATION = 'contract_negotiation',
  MARKETING = 'marketing',
  RESEARCH = 'research',
  ADMINISTRATIVE = 'administrative',
  OTHER = 'other',
}

export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  OVERDUE = 'overdue',
  DEFERRED = 'deferred',
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

@Entity('crm_tasks')
@Index(['type'])
@Index(['status'])
@Index(['priority'])
@Index(['assignedToId'])
@Index(['dueDate'])
@Index(['contactId'])
@Index(['dealId'])
@Index(['leadId'])
@Index(['createdAt'])
export class CrmTask {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ length: 255 })
  title: string;

  @ApiProperty()
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({ enum: TaskType })
  @Column({
    type: 'varchar',
    
  })
  type: TaskType;

  @ApiProperty({ enum: TaskStatus })
  @Column({
    type: 'varchar',
    
    default: TaskStatus.PENDING,
  })
  status: TaskStatus;

  @ApiProperty({ enum: TaskPriority })
  @Column({
    type: 'varchar',
    
    default: TaskPriority.MEDIUM,
  })
  priority: TaskPriority;

  @ApiProperty()
  @Column({ nullable: true })
  dueDate: Date;

  @ApiProperty()
  @Column({ nullable: true })
  startDate: Date;

  @ApiProperty()
  @Column({ nullable: true })
  completedDate: Date;

  @ApiProperty()
  @Column({ type: 'int', nullable: true })
  estimatedDuration: number; // in minutes

  @ApiProperty()
  @Column({ type: 'int', nullable: true })
  actualDuration: number; // in minutes

  @ApiProperty()
  @Column({ type: 'json', nullable: true })
  reminder: {
    enabled: boolean;
    reminderTime: Date;
    reminderSent: boolean;
    reminderType: 'email' | 'sms' | 'push';
  };

  @ApiProperty()
  @Column({ type: 'json', nullable: true })
  recurrence: {
    enabled: boolean;
    pattern: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number; // every X days/weeks/months/years
    endDate?: Date;
    endAfterOccurrences?: number;
  };

  @ApiProperty()
  @Column({ type: 'json', nullable: true })
  location: {
    type: 'physical' | 'virtual';
    address?: string;
    meetingLink?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };

  @ApiProperty()
  @Column({ type: 'json', nullable: true })
  outcome: {
    result: 'successful' | 'unsuccessful' | 'rescheduled' | 'no_show';
    notes: string;
    nextAction?: string;
    followUpDate?: Date;
    rating?: number; // 1-5 stars
  };

  @ApiProperty()
  @Column({ type: 'json', nullable: true })
  attachments: {
    name: string;
    url: string;
    type: string;
    size: number;
    uploadedAt: Date;
  }[];

  @ApiProperty()
  @Column({ type: 'json', nullable: true })
  tags: string[];

  @ApiProperty()
  @Column({ type: 'json', nullable: true })
  customFields: Record<string, any>;

  @ApiProperty()
  @Column({ default: false })
  isRecurring: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  parentTaskId: string; // For recurring tasks

  @ApiProperty()
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty()
  @Column({ default: false })
  isAutomated: boolean; // Created by automation

  @ApiProperty()
  @Column({ type: 'text', nullable: true })
  automationRule: string; // Rule that created this task

  // Relationships
  @ApiProperty()
  @Column()
  assignedToId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'assignedToId' })
  assignedTo: User;

  @ApiProperty()
  @Column()
  createdById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @ApiProperty()
  @Column({ nullable: true })
  contactId: string;

  @ManyToOne(() => CrmContact, (contact) => contact.tasks, { nullable: true })
  @JoinColumn({ name: 'contactId' })
  contact: CrmContact;

  @ApiProperty()
  @Column({ nullable: true })
  leadId: string;

  @ManyToOne(() => Lead, { nullable: true })
  @JoinColumn({ name: 'leadId' })
  lead: Lead;

  @ApiProperty()
  @Column({ nullable: true })
  dealId: string;

  @ManyToOne(() => CrmDeal, (deal) => deal.tasks, { nullable: true })
  @JoinColumn({ name: 'dealId' })
  deal: CrmDeal;

  @ApiProperty()
  @Column({ nullable: true })
  propertyId: string;

  @ManyToOne(() => Property, { nullable: true })
  @JoinColumn({ name: 'propertyId' })
  property: Property;

  @ApiProperty()
  @Column({ nullable: true })
  campaignId: string;

  @ManyToOne(() => Campaign, { nullable: true })
  @JoinColumn({ name: 'campaignId' })
  campaign: Campaign;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
