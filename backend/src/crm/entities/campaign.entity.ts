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
import { CampaignEmail } from './campaign-email.entity';
import { EmailTemplate } from './email-template.entity';

export enum CampaignType {
  EMAIL = 'email',
  SMS = 'sms',
  SOCIAL_MEDIA = 'social_media',
  DIRECT_MAIL = 'direct_mail',
  PHONE = 'phone',
  MIXED = 'mixed',
}

export enum CampaignStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  RUNNING = 'running',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum CampaignGoal {
  LEAD_GENERATION = 'lead_generation',
  NURTURING = 'nurturing',
  CONVERSION = 'conversion',
  RETENTION = 'retention',
  REACTIVATION = 'reactivation',
  BRAND_AWARENESS = 'brand_awareness',
  PROPERTY_PROMOTION = 'property_promotion',
}

@Entity('campaigns')
@Index(['status'])
@Index(['type'])
@Index(['createdById'])
@Index(['startDate'])
@Index(['endDate'])
export class Campaign {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ length: 255 })
  name: string;

  @ApiProperty()
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({ enum: CampaignType })
  @Column({
    type: 'varchar',
    
    default: CampaignType.EMAIL,
  })
  type: CampaignType;

  @ApiProperty({ enum: CampaignStatus })
  @Column({
    type: 'varchar',
    
    default: CampaignStatus.DRAFT,
  })
  status: CampaignStatus;

  @ApiProperty({ enum: CampaignGoal })
  @Column({
    type: 'varchar',
    
  })
  goal: CampaignGoal;

  @ApiProperty()
  @Column({ type: 'json', nullable: true })
  targetAudience: {
    leadStatus?: string[];
    leadType?: string[];
    location?: string[];
    budget?: { min?: number; max?: number };
    tags?: string[];
    customCriteria?: Record<string, any>;
  };

  @ApiProperty()
  @Column({ type: 'json', nullable: true })
  content: {
    subject?: string;
    htmlContent?: string;
    textContent?: string;
    attachments?: string[];
    callToAction?: {
      text: string;
      url: string;
      type: 'button' | 'link';
    }[];
  };

  @ApiProperty()
  @Column({ type: 'json', nullable: true })
  schedule: {
    sendImmediately?: boolean;
    scheduledDate?: Date;
    timezone?: string;
    recurring?: {
      enabled: boolean;
      frequency: 'daily' | 'weekly' | 'monthly';
      interval: number;
      endDate?: Date;
    };
  };

  @ApiProperty()
  @Column({ type: 'json', nullable: true })
  settings: {
    trackOpens?: boolean;
    trackClicks?: boolean;
    allowUnsubscribe?: boolean;
    replyToEmail?: string;
    fromName?: string;
    fromEmail?: string;
  };

  @ApiProperty()
  @Column({ nullable: true })
  startDate: Date;

  @ApiProperty()
  @Column({ nullable: true })
  endDate: Date;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  budget: number;

  @ApiProperty()
  @Column({ type: 'int', default: 0 })
  totalRecipients: number;

  @ApiProperty()
  @Column({ type: 'int', default: 0 })
  sentCount: number;

  @ApiProperty()
  @Column({ type: 'int', default: 0 })
  deliveredCount: number;

  @ApiProperty()
  @Column({ type: 'int', default: 0 })
  openedCount: number;

  @ApiProperty()
  @Column({ type: 'int', default: 0 })
  clickedCount: number;

  @ApiProperty()
  @Column({ type: 'int', default: 0 })
  unsubscribedCount: number;

  @ApiProperty()
  @Column({ type: 'int', default: 0 })
  bouncedCount: number;

  @ApiProperty()
  @Column({ type: 'int', default: 0 })
  complaintsCount: number;

  @ApiProperty()
  @Column({ type: 'int', default: 0 })
  conversionsCount: number;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  openRate: number;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  clickRate: number;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  conversionRate: number;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  revenue: number;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  roi: number; // Return on Investment

  @ApiProperty()
  @Column({ type: 'json', nullable: true })
  abTestSettings: {
    enabled?: boolean;
    variants?: {
      name: string;
      subject?: string;
      content?: string;
      percentage: number;
    }[];
    winnerCriteria?: 'open_rate' | 'click_rate' | 'conversion_rate';
    testDuration?: number; // hours
  };

  @ApiProperty()
  @Column({ type: 'json', nullable: true })
  tags: string[];

  @ApiProperty()
  @Column({ type: 'json', nullable: true })
  notes: string;

  @ApiProperty()
  @Column({ default: true })
  isActive: boolean;

  // Relationships
  @ApiProperty()
  @Column()
  createdById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @ApiProperty()
  @Column({ nullable: true })
  emailTemplateId: string;

  @ManyToOne(() => EmailTemplate, { nullable: true })
  @JoinColumn({ name: 'emailTemplateId' })
  emailTemplate: EmailTemplate;

  @OneToMany(() => CampaignEmail, (email) => email.campaign)
  emails: CampaignEmail[];

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
