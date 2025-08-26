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
import { User } from '../../users/entities/user.entity';

export enum ConsentStatus {
  PENDING = 'pending',
  GRANTED = 'granted',
  WITHDRAWN = 'withdrawn',
  EXPIRED = 'expired',
}

export enum ConsentType {
  MARKETING = 'marketing',
  ANALYTICS = 'analytics',
  FUNCTIONAL = 'functional',
  NECESSARY = 'necessary',
  THIRD_PARTY = 'third_party',
}

@Entity('data_consents')
@Index(['userId'])
@Index(['consentType'])
@Index(['consentStatus'])
export class DataConsent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    type: 'varchar',
    
  })
  consentType: ConsentType;

  @Column({
    type: 'varchar',
    
    default: ConsentStatus.PENDING,
  })
  consentStatus: ConsentStatus;

  @Column({ type: 'boolean', default: false })
  granted: boolean;

  @Column({ type: 'datetime', nullable: true })
  grantedDate?: Date;

  @Column({ type: 'datetime', nullable: true })
  withdrawalDate?: Date;

  @Column({ type: 'text', nullable: true })
  withdrawalReason?: string;

  @Column({ type: 'datetime', nullable: true })
  expiryDate?: Date;

  @Column({ type: 'text', nullable: true })
  purpose?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'json', nullable: true })
  metadata?: Record<string, any>;

  @Column({ type: 'varchar', length: 255, nullable: true })
  ipAddress?: string;

  @Column({ type: 'text', nullable: true })
  userAgent?: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  createdBy?: string;

  @Column({ type: 'uuid', nullable: true })
  updatedBy?: string;
}
