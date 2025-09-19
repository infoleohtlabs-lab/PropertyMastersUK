import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Buyer } from './buyer.entity';

export enum ApplicationStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  WITHDRAWN = 'withdrawn',
  COMPLETED = 'completed'
}

export enum MortgageType {
  FIXED_RATE = 'fixed_rate',
  VARIABLE_RATE = 'variable_rate',
  TRACKER = 'tracker',
  DISCOUNT = 'discount',
  OFFSET = 'offset',
  INTEREST_ONLY = 'interest_only'
}

@Entity('mortgage_applications')
export class MortgageApplication {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column('uuid')
  buyerId: string;

  @ApiProperty()
  @Column('uuid', { nullable: true })
  propertyId: string;

  @ApiProperty()
  @Column()
  lenderName: string;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  loanAmount: number;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  propertyValue: number;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 5, scale: 2 })
  interestRate: number;

  @ApiProperty({ enum: MortgageType })
  @Column({ type: 'varchar' })
  mortgageType: MortgageType;

  @ApiProperty()
  @Column({ type: 'int' })
  termYears: number;

  @ApiProperty({ enum: ApplicationStatus })
  @Column({ type: 'varchar', default: ApplicationStatus.DRAFT })
  status: ApplicationStatus;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  monthlyPayment: number;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  deposit: number;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 5, scale: 2 })
  loanToValue: number;

  @ApiProperty()
  @Column({ nullable: true })
  applicationReference: string;

  @ApiProperty()
  @Column({ type: 'date', nullable: true })
  submittedDate: Date;

  @ApiProperty()
  @Column({ type: 'date', nullable: true })
  decisionDate: Date;

  @ApiProperty()
  @Column({ type: 'date', nullable: true })
  offerExpiryDate: Date;

  @ApiProperty()
  @Column({ nullable: true })
  notes: string;

  @ApiProperty()
  @Column({ nullable: true })
  conditions: string; // JSON string for mortgage conditions

  @ApiProperty()
  @Column({ nullable: true })
  rejectionReason: string;

  @ApiProperty()
  @Column({ default: false })
  isFirstTimeBuyer: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  brokerName: string;

  @ApiProperty()
  @Column({ nullable: true })
  brokerContact: string;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Buyer, buyer => buyer.mortgageApplications)
  @JoinColumn({ name: 'buyerId' })
  buyer: Buyer;
}
