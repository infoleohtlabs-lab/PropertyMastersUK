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

export enum SecurityAlertType {
  FAILED_LOGIN = 'failed_login',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  UNAUTHORIZED_ACCESS = 'unauthorized_access',
  DATA_BREACH = 'data_breach',
  MALWARE_DETECTED = 'malware_detected',
  UNUSUAL_TRAFFIC = 'unusual_traffic',
  PRIVILEGE_ESCALATION = 'privilege_escalation',
  ACCOUNT_LOCKOUT = 'account_lockout',
}

export enum SecurityAlertSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum SecurityAlertStatus {
  OPEN = 'open',
  INVESTIGATING = 'investigating',
  RESOLVED = 'resolved',
  FALSE_POSITIVE = 'false_positive',
  DISMISSED = 'dismissed',
}

@Entity('security_alerts')
@Index(['type', 'createdAt'])
@Index(['severity', 'status'])
@Index(['userId', 'createdAt'])
export class SecurityAlert {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
  })
  type: SecurityAlertType;

  @Column({
    type: 'varchar',
    default: SecurityAlertSeverity.MEDIUM,
  })
  severity: SecurityAlertSeverity;

  @Column({
    type: 'varchar',
    default: SecurityAlertStatus.OPEN,
  })
  status: SecurityAlertStatus;

  @Column({ length: 200 })
  title: string;

  @Column('text')
  description: string;

  @Column({ name: 'user_id', nullable: true })
  userId: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'ip_address', length: 45, nullable: true })
  ipAddress: string;

  @Column({ name: 'user_agent', length: 500, nullable: true })
  userAgent: string;

  @Column('text', { nullable: true })
  metadata: Record<string, any>;

  @Column({ name: 'resolved_by', nullable: true })
  resolvedBy: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'resolved_by' })
  resolvedByUser: User;

  @Column({ name: 'resolved_at', nullable: true })
  resolvedAt: Date;

  @Column('text', { nullable: true })
  resolution: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ default: false })
  archived: boolean;

  @Column({ name: 'auto_resolved', default: false })
  autoResolved: boolean;
}
