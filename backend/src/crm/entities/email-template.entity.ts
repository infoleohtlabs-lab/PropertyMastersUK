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
import { Campaign } from './campaign.entity';

export enum TemplateType {
  WELCOME = 'welcome',
  FOLLOW_UP = 'follow_up',
  PROPERTY_ALERT = 'property_alert',
  NEWSLETTER = 'newsletter',
  PROMOTIONAL = 'promotional',
  TRANSACTIONAL = 'transactional',
  REMINDER = 'reminder',
  THANK_YOU = 'thank_you',
  SURVEY = 'survey',
  APPOINTMENT_CONFIRMATION = 'appointment_confirmation',
  PROPERTY_VIEWING = 'property_viewing',
  CONTRACT_UPDATE = 'contract_update',
  PAYMENT_REMINDER = 'payment_reminder',
  MAINTENANCE_NOTICE = 'maintenance_notice',
  MARKET_UPDATE = 'market_update',
  CUSTOM = 'custom',
}

export enum TemplateStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ARCHIVED = 'archived',
}

export enum TemplateCategory {
  MARKETING = 'marketing',
  SALES = 'sales',
  CUSTOMER_SERVICE = 'customer_service',
  PROPERTY_MANAGEMENT = 'property_management',
  LEGAL = 'legal',
  FINANCIAL = 'financial',
  SYSTEM = 'system',
}

@Entity('email_templates')
@Index(['type'])
@Index(['status'])
@Index(['category'])
@Index(['createdById'])
@Index(['isDefault'])
@Index(['createdAt'])
export class EmailTemplate {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ length: 255 })
  name: string;

  @ApiProperty()
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty()
  @Column({ length: 255 })
  subject: string;

  @ApiProperty()
  @Column({ type: 'text' })
  htmlContent: string;

  @ApiProperty()
  @Column({ type: 'text', nullable: true })
  textContent: string; // Plain text version

  @ApiProperty({ enum: TemplateType })
  @Column({
    type: 'varchar',
    
  })
  type: TemplateType;

  @ApiProperty({ enum: TemplateStatus })
  @Column({
    type: 'varchar',
    
    default: TemplateStatus.DRAFT,
  })
  status: TemplateStatus;

  @ApiProperty({ enum: TemplateCategory })
  @Column({
    type: 'varchar',
    
  })
  category: TemplateCategory;

  @ApiProperty()
  @Column({ default: false })
  isDefault: boolean; // Default template for this type

  @ApiProperty()
  @Column({ type: 'json', nullable: true })
  variables: {
    name: string;
    description: string;
    type: 'text' | 'number' | 'date' | 'boolean' | 'url' | 'email';
    required: boolean;
    defaultValue?: any;
    placeholder?: string;
  }[]; // Available variables for this template

  @ApiProperty()
  @Column({ type: 'json', nullable: true })
  designSettings: {
    theme: string;
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
    fontSize: number;
    headerImage?: string;
    footerText?: string;
    socialLinks?: {
      platform: string;
      url: string;
    }[];
    companyLogo?: string;
    companyAddress?: string;
  };

  @ApiProperty()
  @Column({ type: 'json', nullable: true })
  personalization: {
    enabled: boolean;
    rules: {
      condition: string; // e.g., "user.type === 'buyer'"
      content: string; // Alternative content for this condition
    }[];
  };

  @ApiProperty()
  @Column({ type: 'json', nullable: true })
  abTesting: {
    enabled: boolean;
    variants: {
      name: string;
      subject: string;
      content: string;
      percentage: number; // Percentage of recipients to receive this variant
    }[];
    winnerCriteria: 'open_rate' | 'click_rate' | 'conversion_rate';
  };

  @ApiProperty()
  @Column({ type: 'json', nullable: true })
  scheduling: {
    allowScheduling: boolean;
    timezone: string;
    optimalSendTimes: {
      dayOfWeek: number; // 0-6 (Sunday-Saturday)
      hour: number; // 0-23
    }[];
    avoidDates: Date[]; // Holidays, blackout dates
  };

  @ApiProperty()
  @Column({ type: 'json', nullable: true })
  analytics: {
    trackOpens: boolean;
    trackClicks: boolean;
    trackConversions: boolean;
    conversionGoal?: string;
    utmParameters?: {
      source: string;
      medium: string;
      campaign: string;
      term?: string;
      content?: string;
    };
  };

  @ApiProperty()
  @Column({ type: 'json', nullable: true })
  compliance: {
    gdprCompliant: boolean;
    includeUnsubscribeLink: boolean;
    includeCompanyInfo: boolean;
    dataRetentionPeriod?: number; // days
    consentRequired: boolean;
  };

  @ApiProperty()
  @Column({ type: 'json', nullable: true })
  tags: string[];

  @ApiProperty()
  @Column({ type: 'json', nullable: true })
  attachments: {
    name: string;
    url: string;
    type: string;
    size: number;
  }[];

  @ApiProperty()
  @Column({ type: 'int', default: 0 })
  usageCount: number; // How many times this template has been used

  @ApiProperty()
  @Column({ nullable: true })
  lastUsedAt: Date;

  @ApiProperty()
  @Column({ type: 'json', nullable: true })
  performanceMetrics: {
    totalSent: number;
    totalOpened: number;
    totalClicked: number;
    totalConverted: number;
    averageOpenRate: number;
    averageClickRate: number;
    averageConversionRate: number;
    lastCalculatedAt: Date;
  };

  @ApiProperty()
  @Column({ type: 'json', nullable: true })
  versionHistory: {
    version: number;
    changes: string;
    modifiedAt: Date;
    modifiedBy: string;
    htmlContent: string;
    subject: string;
  }[];

  @ApiProperty()
  @Column({ default: 1 })
  currentVersion: number;

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
  lastModifiedById: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'lastModifiedById' })
  lastModifiedBy: User;

  @OneToMany(() => Campaign, (campaign) => campaign.emailTemplate)
  campaigns: Campaign[];

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
