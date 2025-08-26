import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum GdprRequestType {
  ACCESS = 'access',
  RECTIFICATION = 'rectification',
  ERASURE = 'erasure',
  PORTABILITY = 'portability',
  RESTRICTION = 'restriction',
  OBJECTION = 'objection',
}

export enum GdprRequestStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  REJECTED = 'rejected',
  WITHDRAWN = 'withdrawn',
}

export enum VerificationMethod {
  EMAIL = 'email',
  PHONE = 'phone',
  DOCUMENT = 'document',
  IN_PERSON = 'in_person',
}

@Entity('gdpr_requests')
export class GdprRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    
  })
  requestType: GdprRequestType;

  @Column('uuid')
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({
    type: 'varchar',
    
    default: GdprRequestStatus.PENDING,
  })
  status: GdprRequestStatus;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'json', nullable: true })
  requestDetails: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  attachments: string[];

  @Column({
    type: 'varchar',
    
    nullable: true,
  })
  verificationMethod: VerificationMethod;

  @Column({ default: false })
  identityVerified: boolean;

  @Column({ type: 'text', nullable: true })
  legalBasis: string;

  @Column({ type: 'datetime', nullable: true })
  processedAt: Date;

  @Column({ type: 'datetime', nullable: true })
  completedAt: Date;

  @Column({ type: 'datetime', nullable: true })
  rejectedAt: Date;

  @Column({ type: 'text', nullable: true })
  rejectionReason: string;

  @Column({ type: 'datetime', nullable: true })
  withdrawnAt: Date;

  @Column({ type: 'text', nullable: true })
  withdrawalReason: string;

  @Column({ type: 'json', nullable: true })
  responseData: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  processingNotes: string;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ipAddress: string;

  @Column({ type: 'text', nullable: true })
  userAgent: string;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
