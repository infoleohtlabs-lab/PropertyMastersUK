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
import { Campaign } from './campaign.entity';
import { Lead } from './lead.entity';
import { User } from '../../users/entities/user.entity';

export enum EmailStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  OPENED = 'opened',
  CLICKED = 'clicked',
  BOUNCED = 'bounced',
  COMPLAINED = 'complained',
  UNSUBSCRIBED = 'unsubscribed',
  FAILED = 'failed',
}

@Entity('campaign_emails')
@Index(['campaignId'])
@Index(['recipientEmail'])
@Index(['status'])
@Index(['sentAt'])
@Index(['openedAt'])
@Index(['clickedAt'])
export class CampaignEmail {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column()
  campaignId: string;

  @ManyToOne(() => Campaign, (campaign) => campaign.emails)
  @JoinColumn({ name: 'campaignId' })
  campaign: Campaign;

  @ApiProperty()
  @Column()
  recipientEmail: string;

  @ApiProperty()
  @Column({ nullable: true })
  recipientName: string;

  @ApiProperty()
  @Column({ nullable: true })
  leadId: string;

  @ManyToOne(() => Lead, { nullable: true })
  @JoinColumn({ name: 'leadId' })
  lead: Lead;

  @ApiProperty()
  @Column({ nullable: true })
  userId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ApiProperty({ enum: EmailStatus })
  @Column({
    type: 'varchar',
    
    default: EmailStatus.PENDING,
  })
  status: EmailStatus;

  @ApiProperty()
  @Column({ type: 'text' })
  subject: string;

  @ApiProperty()
  @Column({ type: 'text' })
  htmlContent: string;

  @ApiProperty()
  @Column({ type: 'text', nullable: true })
  textContent: string;

  @ApiProperty()
  @Column({ nullable: true })
  fromEmail: string;

  @ApiProperty()
  @Column({ nullable: true })
  fromName: string;

  @ApiProperty()
  @Column({ nullable: true })
  replyToEmail: string;

  @ApiProperty()
  @Column({ type: 'json', nullable: true })
  attachments: {
    filename: string;
    url: string;
    size: number;
    mimeType: string;
  }[];

  @ApiProperty()
  @Column({ nullable: true })
  messageId: string; // External email service message ID

  @ApiProperty()
  @Column({ nullable: true })
  sentAt: Date;

  @ApiProperty()
  @Column({ nullable: true })
  deliveredAt: Date;

  @ApiProperty()
  @Column({ nullable: true })
  openedAt: Date;

  @ApiProperty()
  @Column({ nullable: true })
  firstOpenedAt: Date;

  @ApiProperty()
  @Column({ type: 'int', default: 0 })
  openCount: number;

  @ApiProperty()
  @Column({ nullable: true })
  clickedAt: Date;

  @ApiProperty()
  @Column({ nullable: true })
  firstClickedAt: Date;

  @ApiProperty()
  @Column({ type: 'int', default: 0 })
  clickCount: number;

  @ApiProperty()
  @Column({ type: 'json', nullable: true })
  clickedLinks: {
    url: string;
    clickedAt: Date;
    userAgent?: string;
    ipAddress?: string;
  }[];

  @ApiProperty()
  @Column({ nullable: true })
  bouncedAt: Date;

  @ApiProperty()
  @Column({ nullable: true })
  bounceReason: string;

  @ApiProperty()
  @Column({ nullable: true })
  complainedAt: Date;

  @ApiProperty()
  @Column({ nullable: true })
  unsubscribedAt: Date;

  @ApiProperty()
  @Column({ nullable: true })
  failedAt: Date;

  @ApiProperty()
  @Column({ nullable: true })
  failureReason: string;

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
  };

  @ApiProperty()
  @Column({ type: 'json', nullable: true })
  personalizedContent: Record<string, any>; // Personalization variables used

  @ApiProperty()
  @Column({ nullable: true })
  abTestVariant: string;

  @ApiProperty()
  @Column({ type: 'int', default: 0 })
  retryCount: number;

  @ApiProperty()
  @Column({ nullable: true })
  lastRetryAt: Date;

  @ApiProperty()
  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
