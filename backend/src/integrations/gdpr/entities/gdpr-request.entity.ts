import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../../users/entities/user.entity';

export enum GdprRequestType {
  DATA_ACCESS = 'data_access',
  DATA_PORTABILITY = 'data_portability',
  DATA_RECTIFICATION = 'data_rectification',
  DATA_ERASURE = 'data_erasure',
  PROCESSING_RESTRICTION = 'processing_restriction',
  OBJECTION_TO_PROCESSING = 'objection_to_processing',
}

export enum GdprRequestStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  REJECTED = 'rejected',
}

@Entity('gdpr_requests')
export class GdprRequest {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ enum: GdprRequestType })
  @Column({
    type: 'varchar',
    
  })
  requestType: GdprRequestType;

  @ApiProperty({ enum: GdprRequestStatus })
  @Column({
    type: 'varchar',
    
    default: GdprRequestStatus.PENDING,
  })
  status: GdprRequestStatus;

  @ApiProperty()
  @Column('uuid')
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ApiProperty()
  @Column('text', { nullable: true })
  description: string;

  @ApiProperty()
  @Column('text', { nullable: true })
  requestDetails: string;

  @ApiProperty()
  @Column('datetime')
  requestDate: Date;

  @ApiProperty()
  @Column('datetime', { nullable: true })
  processingDate: Date;

  @ApiProperty()
  @Column('datetime', { nullable: true })
  completionDate: Date;

  @ApiProperty()
  @Column('text', { nullable: true })
  processingNotes: string;

  @ApiProperty()
  @Column('text', { nullable: true })
  completionNotes: string;

  @ApiProperty()
  @Column('text', { nullable: true })
  rejectionReason: string;

  @ApiProperty()
  @Column('json', { nullable: true })
  attachments: any; // File attachments or references

  @ApiProperty()
  @Column('json', { nullable: true })
  responseData: any; // Data provided in response to the request

  @ApiProperty()
  @Column('text', { nullable: true })
  verificationMethod: string; // How identity was verified

  @ApiProperty()
  @Column({ default: false })
  identityVerified: boolean;

  @ApiProperty()
  @Column('text', { nullable: true })
  legalBasis: string; // Legal basis for processing or rejection

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
