import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { Property } from '../../properties/entities/property.entity';
import { Lead } from './lead.entity';
import { CrmContact } from './crm-contact.entity';
import { CrmNote } from './crm-note.entity';
import { CrmTask } from './crm-task.entity';

export enum DealStage {
  PROSPECTING = 'prospecting',
  QUALIFICATION = 'qualification',
  NEEDS_ANALYSIS = 'needs_analysis',
  PROPOSAL = 'proposal',
  NEGOTIATION = 'negotiation',
  CLOSED_WON = 'closed_won',
  CLOSED_LOST = 'closed_lost',
  ON_HOLD = 'on_hold',
}

export enum DealType {
  SALE = 'sale',
  RENTAL = 'rental',
  MANAGEMENT = 'management',
  VALUATION = 'valuation',
  CONSULTATION = 'consultation',
  INVESTMENT = 'investment',
}

export enum DealPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum DealSource {
  WEBSITE = 'website',
  REFERRAL = 'referral',
  COLD_CALL = 'cold_call',
  EMAIL_CAMPAIGN = 'email_campaign',
  SOCIAL_MEDIA = 'social_media',
  ADVERTISEMENT = 'advertisement',
  WALK_IN = 'walk_in',
  PARTNER = 'partner',
  EVENT = 'event',
  OTHER = 'other',
}

@Entity('crm_deals')
@Index(['stage'])
@Index(['type'])
@Index(['priority'])
@Index(['assignedToId'])
@Index(['contactId'])
@Index(['propertyId'])
@Index(['expectedCloseDate'])
@Index(['createdAt'])
export class CrmDeal {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ length: 255 })
  title: string;

  @ApiProperty()
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({ enum: DealStage })
  @Column({
    type: 'varchar',
    
    default: DealStage.PROSPECTING,
  })
  stage: DealStage;

  @ApiProperty({ enum: DealType })
  @Column({
    type: 'varchar',
    
  })
  type: DealType;

  @ApiProperty({ enum: DealPriority })
  @Column({
    type: 'varchar',
    
    default: DealPriority.MEDIUM,
  })
  priority: DealPriority;

  @ApiProperty({ enum: DealSource })
  @Column({
    type: 'varchar',
    
    default: DealSource.WEBSITE,
  })
  source: DealSource;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  value: number;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  commission: number;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 50 })
  probability: number; // Percentage chance of closing

  @ApiProperty()
  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  weightedValue: number; // value * probability

  @ApiProperty()
  @Column({ nullable: true })
  expectedCloseDate: Date;

  @ApiProperty()
  @Column({ nullable: true })
  actualCloseDate: Date;

  @ApiProperty()
  @Column({ type: 'json', nullable: true })
  stageHistory: {
    stage: DealStage;
    changedAt: Date;
    changedBy: string;
    notes?: string;
  }[];

  @ApiProperty()
  @Column({ type: 'json', nullable: true })
  requirements: {
    propertyType?: string[];
    budget?: { min: number; max: number };
    location?: string[];
    bedrooms?: number;
    bathrooms?: number;
    features?: string[];
    timeline?: string;
    financing?: {
      type: 'cash' | 'mortgage' | 'mixed';
      preApproved?: boolean;
      lender?: string;
    };
  };

  @ApiProperty()
  @Column({ type: 'json', nullable: true })
  competitors: {
    name: string;
    strengths?: string[];
    weaknesses?: string[];
    pricing?: number;
  }[];

  @ApiProperty()
  @Column({ type: 'json', nullable: true })
  nextSteps: {
    action: string;
    dueDate: Date;
    assignedTo?: string;
    completed?: boolean;
    completedAt?: Date;
  }[];

  @ApiProperty()
  @Column({ type: 'json', nullable: true })
  lostReason: {
    category: 'price' | 'timing' | 'competition' | 'no_need' | 'budget' | 'other';
    details: string;
    competitor?: string;
  };

  @ApiProperty()
  @Column({ type: 'json', nullable: true })
  tags: string[];

  @ApiProperty()
  @Column({ type: 'json', nullable: true })
  customFields: Record<string, any>;

  @ApiProperty()
  @Column({ type: 'json', nullable: true })
  documents: {
    name: string;
    url: string;
    type: string;
    uploadedAt: Date;
    uploadedBy: string;
  }[];

  @ApiProperty()
  @Column({ type: 'json', nullable: true })
  communications: {
    type: 'email' | 'phone' | 'meeting' | 'sms';
    date: Date;
    subject?: string;
    summary: string;
    outcome?: string;
  }[];

  @ApiProperty()
  @Column({ default: true })
  isActive: boolean;

  // Relationships
  @ApiProperty()
  @Column()
  assignedToId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'assignedToId' })
  assignedTo: User;

  @ApiProperty()
  @Column()
  contactId: string;

  @ManyToOne(() => CrmContact, (contact) => contact.deals)
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
  propertyId: string;

  @ManyToOne(() => Property, { nullable: true })
  @JoinColumn({ name: 'propertyId' })
  property: Property;

  @OneToMany(() => CrmNote, (note) => note.deal)
  notes: CrmNote[];

  @OneToMany(() => CrmTask, (task) => task.deal)
  tasks: CrmTask[];

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
