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
import { CrmTask } from './crm-task.entity';

export enum NoteType {
  GENERAL = 'general',
  CALL_LOG = 'call_log',
  MEETING_NOTES = 'meeting_notes',
  EMAIL_SUMMARY = 'email_summary',
  PROPERTY_FEEDBACK = 'property_feedback',
  NEGOTIATION_NOTES = 'negotiation_notes',
  FOLLOW_UP = 'follow_up',
  COMPLAINT = 'complaint',
  COMPLIMENT = 'compliment',
  INTERNAL = 'internal',
  CLIENT_REQUEST = 'client_request',
  MARKET_INSIGHT = 'market_insight',
}

export enum NoteVisibility {
  PUBLIC = 'public', // Visible to all team members
  PRIVATE = 'private', // Only visible to creator
  TEAM = 'team', // Visible to team members only
  MANAGERS = 'managers', // Visible to managers only
}

@Entity('crm_notes')
@Index(['type'])
@Index(['visibility'])
@Index(['createdById'])
@Index(['contactId'])
@Index(['dealId'])
@Index(['leadId'])
@Index(['createdAt'])
@Index(['isPinned'])
export class CrmNote {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ length: 255, nullable: true })
  title: string;

  @ApiProperty()
  @Column({ type: 'text' })
  content: string;

  @ApiProperty({ enum: NoteType })
  @Column({
    type: 'varchar',
    
    default: NoteType.GENERAL,
  })
  type: NoteType;

  @ApiProperty({ enum: NoteVisibility })
  @Column({
    type: 'varchar',
    
    default: NoteVisibility.PUBLIC,
  })
  visibility: NoteVisibility;

  @ApiProperty()
  @Column({ default: false })
  isPinned: boolean;

  @ApiProperty()
  @Column({ default: false })
  isImportant: boolean;

  @ApiProperty()
  @Column({ type: 'json', nullable: true })
  metadata: {
    callDuration?: number; // for call logs
    meetingDuration?: number; // for meeting notes
    emailSubject?: string; // for email summaries
    propertyAddress?: string; // for property feedback
    sentiment?: 'positive' | 'neutral' | 'negative';
    actionRequired?: boolean;
    followUpDate?: Date;
    priority?: 'low' | 'medium' | 'high';
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
  mentions: {
    userId: string;
    userName: string;
    position: number; // position in content where mention occurs
  }[];

  @ApiProperty()
  @Column({ type: 'json', nullable: true })
  linkedEntities: {
    type: 'property' | 'deal' | 'task' | 'campaign';
    id: string;
    title: string;
  }[];

  @ApiProperty()
  @Column({ nullable: true })
  parentNoteId: string; // For threaded notes/replies

  @ApiProperty()
  @Column({ default: 0 })
  replyCount: number;

  @ApiProperty()
  @Column({ type: 'json', nullable: true })
  reactions: {
    userId: string;
    type: 'like' | 'love' | 'helpful' | 'important';
    createdAt: Date;
  }[];

  @ApiProperty()
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty()
  @Column({ default: false })
  isArchived: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  archivedAt: Date;

  @ApiProperty()
  @Column({ nullable: true })
  archivedById: string;

  @ApiProperty()
  @Column({ type: 'json', nullable: true })
  editHistory: {
    editedAt: Date;
    editedBy: string;
    previousContent: string;
    reason?: string;
  }[];

  // Relationships
  @ApiProperty()
  @Column()
  createdById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @ApiProperty()
  @Column({ nullable: true })
  contactId: string;

  @ManyToOne(() => CrmContact, (contact) => contact.notes_relation, { nullable: true })
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

  @ManyToOne(() => CrmDeal, (deal) => deal.notes, { nullable: true })
  @JoinColumn({ name: 'dealId' })
  deal: CrmDeal;

  @ApiProperty()
  @Column({ nullable: true })
  taskId: string;

  @ManyToOne(() => CrmTask, { nullable: true })
  @JoinColumn({ name: 'taskId' })
  task: CrmTask;

  @ApiProperty()
  @Column({ nullable: true })
  propertyId: string;

  @ManyToOne(() => Property, { nullable: true })
  @JoinColumn({ name: 'propertyId' })
  property: Property;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
