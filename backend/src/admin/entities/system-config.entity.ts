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

export enum ConfigCategory {
  DATABASE = 'database',
  EMAIL = 'email',
  API = 'api',
  SECURITY = 'security',
  INTEGRATION = 'integration',
  NOTIFICATION = 'notification',
  BACKUP = 'backup',
  ANALYTICS = 'analytics',
  GENERAL = 'general',
}

export enum ConfigType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  JSON = 'json',
  ARRAY = 'array',
  PASSWORD = 'password',
  URL = 'url',
  EMAIL = 'email',
}

export enum ConfigEnvironment {
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  PRODUCTION = 'production',
  ALL = 'all',
}

@Entity('system_configs')
@Index(['category', 'key'])
@Index(['environment', 'active'])
@Index(['key'], { unique: true })
export class SystemConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100, unique: true })
  key: string;

  @Column({ length: 200 })
  name: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({
    type: 'varchar',
  })
  category: ConfigCategory;

  @Column({
    type: 'varchar',
  })
  type: ConfigType;

  @Column({
    type: 'varchar',
    default: ConfigEnvironment.ALL,
  })
  environment: ConfigEnvironment;

  @Column('text', { nullable: true })
  value: string;

  @Column('text', { nullable: true })
  defaultValue: string;

  @Column({ default: true })
  active: boolean;

  @Column({ default: false })
  required: boolean;

  @Column({ default: false })
  sensitive: boolean;

  @Column({ default: false })
  readonly: boolean;

  @Column('text', { nullable: true })
  validationRules: string; // JSON string of validation rules

  @Column('text', { nullable: true })
  possibleValues: string; // JSON array of possible values for enum-like configs

  @Column({ name: 'min_value', nullable: true })
  minValue: number;

  @Column({ name: 'max_value', nullable: true })
  maxValue: number;

  @Column({ name: 'min_length', nullable: true })
  minLength: number;

  @Column({ name: 'max_length', nullable: true })
  maxLength: number;

  @Column('text', { nullable: true })
  pattern: string; // Regex pattern for validation

  @Column({ name: 'display_order', default: 0 })
  displayOrder: number;

  @Column({ name: 'group_name', length: 100, nullable: true })
  groupName: string;

  @Column('text', { nullable: true })
  metadata: Record<string, any>;

  @Column({ name: 'last_modified_by', nullable: true })
  lastModifiedBy: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'last_modified_by' })
  lastModifiedByUser: User;

  @Column({ name: 'last_modified_at', nullable: true })
  lastModifiedAt: Date;

  @Column({ name: 'version', default: 1 })
  version: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column('text', { nullable: true })
  notes: string;

  @Column({ name: 'restart_required', default: false })
  restartRequired: boolean;

  @Column({ name: 'backup_before_change', default: false })
  backupBeforeChange: boolean;
}
