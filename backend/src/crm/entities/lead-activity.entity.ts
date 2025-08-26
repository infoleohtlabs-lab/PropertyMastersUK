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
import { Lead } from './lead.entity';
import { User } from '../../users/entities/user.entity';
import { Property } from '../../properties/entities/property.entity';

export enum ActivityType {
  EMAIL_SENT = 'email_sent',
  EMAIL_OPENED = 'email_opened',
  EMAIL_CLICKED = 'email_clicked',
  EMAIL_REPLIED = 'email_replied',
  PHONE_CALL = 'phone_call',
  SMS_SENT = 'sms_sent',
  MEETING_SCHEDULED = 'meeting_scheduled',
  MEETING_COMPLETED = 'meeting_completed',
  PROPERTY_VIEWED = 'property_viewed',
  WEBSITE_VISIT = 'website_visit',
  FORM_SUBMITTED = 'form_submitted',
  DOCUMENT_DOWNLOADED = 'document_downloaded',
  QUOTE_REQUESTED = 'quote_requested',
  PROPOSAL_SENT = 'proposal_sent',
  CONTRACT_SIGNED = 'contract_signed',
  PAYMENT_RECEIVED = 'payment_received',
  NOTE_ADDED = 'note_added',
  STATUS_CHANGED = 'status_changed',
  TASK_CREATED = 'task_created',
  TASK_COMPLETED = 'task_completed',
  CAMPAIGN_ENROLLED = 'campaign_enrolled',
  CAMPAIGN_COMPLETED = 'campaign_completed',
  UNSUBSCRIBED = 'unsubscribed',
  COMPLAINT = 'complaint',
  REFERRAL_MADE = 'referral_made',
  SOCIAL_MEDIA_INTERACTION = 'social_media_interaction',
  CHAT_INITIATED = 'chat_initiated',
  CHAT_COMPLETED = 'chat_completed',
  BOOKING_MADE = 'booking_made',
  BOOKING_CANCELLED = 'booking_cancelled',
  VALUATION_REQUESTED = 'valuation_requested',
  OFFER_MADE = 'offer_made',
  OFFER_ACCEPTED = 'offer_accepted',
  OFFER_REJECTED = 'offer_rejected',
}

export enum ActivityDirection {
  INBOUND = 'inbound',
  OUTBOUND = 'outbound',
  INTERNAL = 'internal',
}

export enum ActivityPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

@Entity('lead_activities')
@Index(['leadId'])
@Index(['type'])
@Index(['performedById'])
@Index(['createdAt'])
@Index(['direction'])
@Index(['priority'])
export class LeadActivity {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column()
  leadId: string;

  @ManyToOne(() => Lead, (lead) => lead.activities)
  @JoinColumn({ name: 'leadId' })
  lead: Lead;

  @ApiProperty({ enum: ActivityType })
  @Column({
    type: 'varchar',
    
  })
  type: ActivityType;

  @ApiProperty({ enum: ActivityDirection })
  @Column({
    type: 'varchar',
    
    default: ActivityDirection.OUTBOUND,
  })
  direction: ActivityDirection;

  @ApiProperty({ enum: ActivityPriority })
  @Column({
    type: 'varchar',
    
    default: ActivityPriority.MEDIUM,
  })
  priority: ActivityPriority;

  @ApiProperty()
  @Column({ length: 255 })
  title: string;

  @ApiProperty()
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty()
  @Column({ type: 'json', nullable: true })
  details: Record<string, any>;

  @ApiProperty()
  @Column({ nullable: true })
  performedById: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'performedById' })
  performedBy: User;

  @ApiProperty()
  @Column({ nullable: true })
  relatedPropertyId: string;

  @ManyToOne(() => Property, { nullable: true })
  @JoinColumn({ name: 'relatedPropertyId' })
  relatedProperty: Property;

  @ApiProperty()
  @Column({ nullable: true })
  campaignId: string;

  @ApiProperty()
  @Column({ nullable: true })
  emailId: string;

  @ApiProperty()
  @Column({ nullable: true })
  taskId: string;

  @ApiProperty()
  @Column({ nullable: true })
  bookingId: string;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  value: number; // Monetary value associated with the activity

  @ApiProperty()
  @Column({ type: 'int', default: 0 })
  score: number; // Activity scoring for lead qualification

  @ApiProperty()
  @Column({ type: 'json', nullable: true })
  trackingData: {
    userAgent?: string;
    ipAddress?: string;
    location?: {
      country?: string;
      region?: string;
      city?: string;
    };
    device?: {
      type?: string;
      brand?: string;
      model?: string;
    };
    browser?: {
      name?: string;
      version?: string;
    };
    referrer?: string;
    sessionId?: string;
  };

  @ApiProperty()
  @Column({ type: 'json', nullable: true })
  tags: string[];

  @ApiProperty()
  @Column({ type: 'json', nullable: true })
  customFields: Record<string, any>;

  @ApiProperty()
  @Column({ default: true })
  isVisible: boolean; // Whether this activity should be visible to the lead

  @ApiProperty()
  @Column({ default: false })
  isAutomated: boolean; // Whether this activity was automated or manual

  @ApiProperty()
  @Column({ nullable: true })
  scheduledAt: Date; // For scheduled activities

  @ApiProperty()
  @Column({ nullable: true })
  completedAt: Date;

  @ApiProperty()
  @Column({ nullable: true })
  dueDate: Date;

  @ApiProperty()
  @Column({ type: 'json', nullable: true })
  outcome: {
    result?: 'successful' | 'failed' | 'partial' | 'cancelled';
    notes?: string;
    nextAction?: string;
    followUpDate?: Date;
  };

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
