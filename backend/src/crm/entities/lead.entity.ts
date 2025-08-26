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
import { LeadActivity } from './lead-activity.entity';
import { CrmNote } from './crm-note.entity';
import { CrmTask } from './crm-task.entity';

export enum LeadStatus {
  NEW = 'new',
  CONTACTED = 'contacted',
  QUALIFIED = 'qualified',
  PROPOSAL = 'proposal',
  NEGOTIATION = 'negotiation',
  CLOSED_WON = 'closed_won',
  CLOSED_LOST = 'closed_lost',
  NURTURING = 'nurturing',
}

export enum LeadSource {
  WEBSITE = 'website',
  REFERRAL = 'referral',
  SOCIAL_MEDIA = 'social_media',
  EMAIL_CAMPAIGN = 'email_campaign',
  PHONE_CALL = 'phone_call',
  WALK_IN = 'walk_in',
  ADVERTISEMENT = 'advertisement',
  PARTNER = 'partner',
  OTHER = 'other',
}

export enum LeadType {
  BUYER = 'buyer',
  SELLER = 'seller',
  TENANT = 'tenant',
  LANDLORD = 'landlord',
  INVESTOR = 'investor',
}

export enum LeadPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

@Entity('leads')
@Index(['email'])
@Index(['phone'])
@Index(['status'])
@Index(['assignedAgentId'])
@Index(['createdAt'])
export class Lead {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ length: 100 })
  firstName: string;

  @ApiProperty()
  @Column({ length: 100 })
  lastName: string;

  @ApiProperty()
  @Column({ unique: true })
  email: string;

  @ApiProperty()
  @Column({ nullable: true })
  phone: string;

  @ApiProperty({ enum: LeadStatus })
  @Column({
    type: 'varchar',
    
    default: LeadStatus.NEW,
  })
  status: LeadStatus;

  @ApiProperty({ enum: LeadSource })
  @Column({
    type: 'varchar',
    
    default: LeadSource.WEBSITE,
  })
  source: LeadSource;

  @ApiProperty({ enum: LeadType })
  @Column({
    type: 'varchar',
    
  })
  type: LeadType;

  @ApiProperty({ enum: LeadPriority })
  @Column({
    type: 'varchar',
    
    default: LeadPriority.MEDIUM,
  })
  priority: LeadPriority;

  @ApiProperty()
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  budget: number;

  @ApiProperty()
  @Column({ type: 'json', nullable: true })
  requirements: {
    propertyType?: string[];
    bedrooms?: number;
    bathrooms?: number;
    location?: string[];
    features?: string[];
    timeline?: string;
  };

  @ApiProperty()
  @Column({ type: 'json', nullable: true })
  contactPreferences: {
    preferredMethod: 'email' | 'phone' | 'sms' | 'whatsapp';
    bestTimeToCall?: string;
    timezone?: string;
    doNotCall?: boolean;
    doNotEmail?: boolean;
  };

  @ApiProperty()
  @Column({ nullable: true })
  company: string;

  @ApiProperty()
  @Column({ nullable: true })
  jobTitle: string;

  @ApiProperty()
  @Column({ type: 'json', nullable: true })
  address: {
    street?: string;
    city?: string;
    postcode?: string;
    country?: string;
  };

  @ApiProperty()
  @Column({ type: 'json', nullable: true })
  socialMedia: {
    linkedin?: string;
    facebook?: string;
    twitter?: string;
    instagram?: string;
  };

  @ApiProperty()
  @Column({ type: 'int', default: 0 })
  score: number; // Lead scoring based on engagement and fit

  @ApiProperty()
  @Column({ type: 'json', nullable: true })
  tags: string[];

  @ApiProperty()
  @Column({ type: 'json', nullable: true })
  customFields: Record<string, any>;

  @ApiProperty()
  @Column({ nullable: true })
  lastContactDate: Date;

  @ApiProperty()
  @Column({ nullable: true })
  nextFollowUpDate: Date;

  @ApiProperty()
  @Column({ type: 'int', default: 0 })
  emailOpens: number;

  @ApiProperty()
  @Column({ type: 'int', default: 0 })
  emailClicks: number;

  @ApiProperty()
  @Column({ type: 'int', default: 0 })
  websiteVisits: number;

  @ApiProperty()
  @Column({ type: 'int', default: 0 })
  propertyViews: number;

  @ApiProperty()
  @Column({ default: false })
  isQualified: boolean;

  @ApiProperty()
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  convertedDate: Date;

  @ApiProperty()
  @Column({ nullable: true })
  lostReason: string;

  // Relationships
  @ApiProperty()
  @Column({ nullable: true })
  assignedAgentId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assignedAgentId' })
  assignedAgent: User;

  @ApiProperty()
  @Column({ nullable: true })
  interestedPropertyId: string;

  @ManyToOne(() => Property, { nullable: true })
  @JoinColumn({ name: 'interestedPropertyId' })
  interestedProperty: Property;

  @OneToMany(() => LeadActivity, (activity) => activity.lead)
  activities: LeadActivity[];

  @OneToMany(() => CrmNote, (note) => note.lead)
  notes: CrmNote[];

  @OneToMany(() => CrmTask, (task) => task.lead)
  tasks: CrmTask[];

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
