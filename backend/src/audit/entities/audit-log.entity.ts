import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';

export enum AuditAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  LOGIN = 'login',
  LOGOUT = 'logout',
  LOGIN_FAILED = 'login_failed',
  PASSWORD_CHANGED = 'password_changed',
  ROLE_CHANGED = 'role_changed',
  PERMISSION_DENIED = 'permission_denied',
  ACCOUNT_LOCKED = 'account_locked',
  SECURITY_BREACH = 'security_breach',
  DATA_EXPORT = 'data_export',
  UPLOAD = 'upload',
  DOWNLOAD = 'download',
  EXPORT = 'export',
  IMPORT = 'import',
  APPROVE = 'approve',
  REJECT = 'reject',
  SUBMIT = 'submit',
  CANCEL = 'cancel',
  ARCHIVE = 'archive',
  RESTORE = 'restore',
}

export enum AuditEntityType {
  USER = 'user',
  PROPERTY = 'property',
  TENANT = 'tenant',
  LANDLORD = 'landlord',
  BOOKING = 'booking',
  PAYMENT = 'payment',
  DOCUMENT = 'document',
  MESSAGE = 'message',
  NOTIFICATION = 'notification',
  MAINTENANCE_REQUEST = 'maintenance_request',
  VALUATION = 'valuation',
  REPORT = 'report',
  SYSTEM = 'system',
}

export enum AuditSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

@Entity('audit_logs')
export class AuditLog {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ enum: AuditAction })
  @Column({
    type: 'varchar',
    
  })
  action: AuditAction;

  @ApiProperty({ enum: AuditEntityType })
  @Column({
    type: 'varchar',
    
  })
  entityType: AuditEntityType;

  @ApiProperty()
  @Column({ nullable: true })
  entityId: string;

  @ApiProperty()
  @Column({ nullable: true })
  entityName: string; // Human readable name

  @ApiProperty({ enum: AuditSeverity })
  @Column({
    type: 'varchar',
    
    default: AuditSeverity.LOW,
  })
  severity: AuditSeverity;

  @ApiProperty()
  @Column('text')
  description: string;

  @ApiProperty()
  @Column('json', { nullable: true })
  oldValues: any; // Previous state

  @ApiProperty()
  @Column('json', { nullable: true })
  newValues: any; // New state

  @ApiProperty()
  @Column('json', { nullable: true })
  metadata: any; // Additional context

  @ApiProperty()
  @Column({ nullable: true })
  ipAddress: string;

  @ApiProperty()
  @Column({ nullable: true })
  userAgent: string;

  @ApiProperty()
  @Column({ nullable: true })
  sessionId: string;

  @ApiProperty()
  @Column({ nullable: true })
  requestId: string;

  @ApiProperty()
  @Column({ nullable: true })
  endpoint: string; // API endpoint called

  @ApiProperty()
  @Column({ nullable: true })
  httpMethod: string;

  @ApiProperty()
  @Column({ nullable: true })
  statusCode: number;

  @ApiProperty()
  @Column({ nullable: true })
  responseTime: number; // in milliseconds

  @ApiProperty()
  @Column('text', { nullable: true })
  errorMessage: string;

  @ApiProperty()
  @Column('text', { nullable: true })
  stackTrace: string;

  @ApiProperty()
  @Column('text', { nullable: true })
  errorStack: string;

  @ApiProperty()
  @Column({ default: false })
  isSystemGenerated: boolean;

  @ApiProperty()
  @Column({ default: false })
  isSecurityEvent: boolean;

  @ApiProperty()
  @Column({ default: false })
  isComplianceEvent: boolean;

  @ApiProperty()
  @Column({ default: false })
  requiresReview: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  reviewedAt: Date;

  @ApiProperty()
  @Column({ nullable: true })
  reviewedById: string;

  @ApiProperty()
  @Column('text', { nullable: true })
  reviewNotes: string;

  @ApiProperty()
  @Column('simple-array', { nullable: true })
  tags: string[];

  @ApiProperty()
  @Column({ nullable: true })
  correlationId: string; // For grouping related events

  @ApiProperty()
  @Column({ nullable: true })
  parentEventId: string;

  @ApiProperty()
  @Column({ nullable: true })
  businessProcess: string; // e.g., 'tenant_onboarding', 'property_listing'

  @ApiProperty()
  @Column({ nullable: true })
  riskScore: number; // 0-100 for security events

  @ApiProperty()
  @Column({ default: false })
  isAnomaly: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  retentionPeriod: number; // Days to retain this log

  @ApiProperty()
  @Column({ nullable: true })
  expiresAt: Date;

  @ApiProperty()
  @Column({ default: false })
  isArchived: boolean;

  // Relationships
  @ApiProperty()
  @Column('uuid', { nullable: true })
  userId: string;

  @ApiProperty()
  @Column('uuid', { nullable: true })
  actorId: string; // The user who performed the action

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ApiProperty()
  @Column('uuid', { nullable: true })
  impersonatedById: string; // If action was performed by admin on behalf of user

  @ManyToOne(() => User)
  @JoinColumn({ name: 'impersonatedById' })
  impersonatedBy: User;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;
}
