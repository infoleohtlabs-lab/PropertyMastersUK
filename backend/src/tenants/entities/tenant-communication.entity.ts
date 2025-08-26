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
import { Tenant } from './tenant.entity';

export enum CommunicationType {
  EMAIL = 'email',
  PHONE = 'phone',
  SMS = 'sms',
  IN_PERSON = 'in_person',
  VIDEO_CALL = 'video_call',
  LETTER = 'letter',
  OTHER = 'other',
}

export enum CommunicationDirection {
  INBOUND = 'inbound',
  OUTBOUND = 'outbound',
}

export enum CommunicationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  RESPONDED = 'responded',
  FAILED = 'failed',
}

export enum CommunicationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

@Entity('tenant_communications')
@Index(['tenantId'])
@Index(['type'])
@Index(['direction'])
@Index(['status'])
export class TenantCommunication {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @ManyToOne(() => Tenant, (tenant) => tenant.communications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({
    type: 'varchar',
    
  })
  type: CommunicationType;

  @Column({
    type: 'varchar',
    
  })
  direction: CommunicationDirection;

  @Column({ length: 255 })
  subject: string;

  @Column({ type: 'text' })
  content: string;

  @Column({
    type: 'varchar',
    
    default: CommunicationStatus.PENDING,
  })
  status: CommunicationStatus;

  @Column({
    type: 'varchar',
    
    default: CommunicationPriority.NORMAL,
  })
  priority: CommunicationPriority;

  @Column({ length: 100, nullable: true })
  fromUser?: string;

  @Column({ length: 100, nullable: true })
  toUser?: string;

  @Column({ type: 'datetime', nullable: true })
  sentDate?: Date;

  @Column({ type: 'datetime', nullable: true })
  deliveredDate?: Date;

  @Column({ type: 'datetime', nullable: true })
  readDate?: Date;

  @Column({ type: 'datetime', nullable: true })
  respondedDate?: Date;

  @Column({ type: 'simple-array', nullable: true })
  attachments?: string[];

  @Column({ type: 'json', nullable: true })
  metadata?: Record<string, any>;

  @Column({ length: 1000, nullable: true })
  notes?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
