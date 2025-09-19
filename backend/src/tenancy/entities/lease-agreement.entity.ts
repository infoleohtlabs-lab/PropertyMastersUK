import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Tenancy } from './tenancy.entity';
import { User } from '../../users/entities/user.entity';

export enum AgreementStatus {
  DRAFT = 'draft',
  PENDING_SIGNATURE = 'pending_signature',
  SIGNED = 'signed',
  ACTIVE = 'active',
  EXPIRED = 'expired',
  TERMINATED = 'terminated',
  CANCELLED = 'cancelled',
}

export enum AgreementType {
  INITIAL = 'initial',
  RENEWAL = 'renewal',
  EXTENSION = 'extension',
  AMENDMENT = 'amendment',
  BREAK_CLAUSE = 'break_clause',
}

@Entity('lease_agreements')
export class LeaseAgreement {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column('uuid')
  tenancyId: string;

  @ManyToOne(() => Tenancy, tenancy => tenancy.leaseAgreements)
  @JoinColumn({ name: 'tenancyId' })
  tenancy: Tenancy;

  @ApiProperty()
  @Column()
  agreementNumber: string;

  @ApiProperty({ enum: AgreementType })
  @Column({
    type: 'varchar',
    default: AgreementType.INITIAL,
  })
  type: AgreementType;

  @ApiProperty({ enum: AgreementStatus })
  @Column({
    type: 'varchar',
    default: AgreementStatus.DRAFT,
  })
  status: AgreementStatus;

  @ApiProperty()
  @Column()
  startDate: Date;

  @ApiProperty()
  @Column()
  endDate: Date;

  @ApiProperty()
  @Column('decimal', { precision: 10, scale: 2 })
  rentAmount: number;

  @ApiProperty()
  @Column('decimal', { precision: 10, scale: 2 })
  depositAmount: number;

  @ApiProperty()
  @Column('text')
  terms: string;

  @ApiProperty()
  @Column('text', { nullable: true })
  specialConditions: string;

  @ApiProperty()
  @Column('text', { nullable: true })
  breakClause: string;

  @ApiProperty()
  @Column({ nullable: true })
  noticePeriod: number;

  @ApiProperty()
  @Column({ nullable: true })
  renewalOption: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  rentReviewDate: Date;

  @ApiProperty()
  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  rentIncreasePercentage: number;

  @ApiProperty()
  @Column({ nullable: true })
  documentUrl: string;

  @ApiProperty()
  @Column({ nullable: true })
  signedDocumentUrl: string;

  @ApiProperty()
  @Column({ nullable: true })
  tenantSignedDate: Date;

  @ApiProperty()
  @Column({ nullable: true })
  landlordSignedDate: Date;

  @ApiProperty()
  @Column('uuid', { nullable: true })
  witnessId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'witnessId' })
  witness: User;

  @ApiProperty()
  @Column({ nullable: true })
  witnessSignedDate: Date;

  @ApiProperty()
  @Column('uuid', { nullable: true })
  createdBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdBy' })
  creator: User;

  @ApiProperty()
  @Column('uuid', { nullable: true })
  approvedBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'approvedBy' })
  approver: User;

  @ApiProperty()
  @Column({ nullable: true })
  approvedDate: Date;

  @ApiProperty()
  @Column('simple-array', { nullable: true })
  attachments: string[];

  @ApiProperty()
  @Column('text', { nullable: true })
  notes: string;

  @ApiProperty()
  @Column({ default: 1 })
  version: number;

  @ApiProperty()
  @Column('uuid', { nullable: true })
  previousVersionId: string;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
