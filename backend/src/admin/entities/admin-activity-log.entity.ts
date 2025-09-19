import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('admin_activity_logs')
@Index(['userId', 'createdAt'])
@Index(['action', 'createdAt'])
export class AdminActivityLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', nullable: true })
  userId: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ length: 100 })
  action: string;

  @Column('text')
  details: string;

  @Column({ name: 'ip_address', length: 45, nullable: true })
  ipAddress: string;

  @Column({ name: 'user_agent', length: 500, nullable: true })
  userAgent: string;

  @Column('text', { nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ length: 50, default: 'info' })
  severity: string; // info, warning, error, critical

  @Column({ length: 100, nullable: true })
  category: string; // user_management, system_config, security, etc.

  @Column({ name: 'resource_type', length: 50, nullable: true })
  resourceType: string; // user, property, system, etc.

  @Column({ name: 'resource_id', nullable: true })
  resourceId: string;

  @Column({ default: false })
  archived: boolean;
}
