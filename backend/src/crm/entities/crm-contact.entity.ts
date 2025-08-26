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
import { Lead } from './lead.entity';
import { CrmDeal } from './crm-deal.entity';
import { CrmNote } from './crm-note.entity';
import { CrmTask } from './crm-task.entity';

export enum ContactType {
  LEAD = 'lead',
  CUSTOMER = 'customer',
  PARTNER = 'partner',
  VENDOR = 'vendor',
  REFERRAL = 'referral',
}

export enum ContactStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BLOCKED = 'blocked',
  UNSUBSCRIBED = 'unsubscribed',
}

@Entity('crm_contacts')
@Index(['email'])
@Index(['phone'])
@Index(['type'])
@Index(['status'])
@Index(['assignedToId'])
@Index(['createdAt'])
export class CrmContact {
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

  @ApiProperty()
  @Column({ nullable: true })
  mobile: string;

  @ApiProperty()
  @Column({ nullable: true })
  workPhone: string;

  @ApiProperty({ enum: ContactType })
  @Column({
    type: 'varchar',
    
    default: ContactType.LEAD,
  })
  type: ContactType;

  @ApiProperty({ enum: ContactStatus })
  @Column({
    type: 'varchar',
    
    default: ContactStatus.ACTIVE,
  })
  status: ContactStatus;

  @ApiProperty()
  @Column({ nullable: true })
  company: string;

  @ApiProperty()
  @Column({ nullable: true })
  jobTitle: string;

  @ApiProperty()
  @Column({ nullable: true })
  department: string;

  @ApiProperty()
  @Column({ type: 'json', nullable: true })
  address: {
    street?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
  };

  @ApiProperty()
  @Column({ nullable: true })
  website: string;

  @ApiProperty()
  @Column({ type: 'json', nullable: true })
  socialMedia: {
    linkedin?: string;
    facebook?: string;
    twitter?: string;
    instagram?: string;
  };

  @ApiProperty()
  @Column({ type: 'date', nullable: true })
  dateOfBirth: Date;

  @ApiProperty()
  @Column({ nullable: true })
  timezone: string;

  @ApiProperty()
  @Column({ type: 'json', nullable: true })
  preferences: {
    communicationMethod?: 'email' | 'phone' | 'sms' | 'whatsapp';
    bestTimeToContact?: string;
    language?: string;
    currency?: string;
    doNotCall?: boolean;
    doNotEmail?: boolean;
    doNotSms?: boolean;
    marketingOptIn?: boolean;
  };

  @ApiProperty()
  @Column({ type: 'json', nullable: true })
  customFields: Record<string, any>;

  @ApiProperty()
  @Column({ type: 'json', nullable: true })
  tags: string[];

  @ApiProperty()
  @Column({ type: 'int', default: 0 })
  leadScore: number;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalValue: number; // Total value of all deals

  @ApiProperty()
  @Column({ type: 'int', default: 0 })
  dealCount: number;

  @ApiProperty()
  @Column({ nullable: true })
  lastContactDate: Date;

  @ApiProperty()
  @Column({ nullable: true })
  nextFollowUpDate: Date;

  @ApiProperty()
  @Column({ type: 'text', nullable: true })
  notes: string;

  @ApiProperty()
  @Column({ nullable: true })
  source: string; // How they were acquired

  @ApiProperty()
  @Column({ nullable: true })
  referredBy: string;

  @ApiProperty()
  @Column({ type: 'json', nullable: true })
  engagementMetrics: {
    emailOpens?: number;
    emailClicks?: number;
    websiteVisits?: number;
    lastEmailOpen?: Date;
    lastEmailClick?: Date;
    lastWebsiteVisit?: Date;
  };

  // Relationships
  @ApiProperty()
  @Column({ nullable: true })
  assignedToId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assignedToId' })
  assignedTo: User;

  @ApiProperty()
  @Column({ nullable: true })
  leadId: string;

  @ManyToOne(() => Lead, { nullable: true })
  @JoinColumn({ name: 'leadId' })
  lead: Lead;

  @OneToMany(() => CrmDeal, (deal) => deal.contact)
  deals: CrmDeal[];

  @OneToMany(() => CrmNote, (note) => note.contact)
  notes_relation: CrmNote[];

  @OneToMany(() => CrmTask, (task) => task.contact)
  tasks: CrmTask[];

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
