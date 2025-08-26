import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Property } from './property.entity';
import { User } from '../../users/entities/user.entity';

export enum ValuationType {
  MARKET_VALUATION = 'market_valuation',
  RENTAL_VALUATION = 'rental_valuation',
  INSURANCE_VALUATION = 'insurance_valuation',
  PROBATE_VALUATION = 'probate_valuation',
  DIVORCE_VALUATION = 'divorce_valuation',
  MORTGAGE_VALUATION = 'mortgage_valuation',
  INVESTMENT_VALUATION = 'investment_valuation',
}

export enum ValuationStatus {
  REQUESTED = 'requested',
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}

export enum ValuationMethod {
  DESKTOP = 'desktop',
  PHYSICAL_INSPECTION = 'physical_inspection',
  DRIVE_BY = 'drive_by',
  AUTOMATED = 'automated',
  HYBRID = 'hybrid',
}

@Entity('property_valuations')
export class PropertyValuation {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column()
  valuationNumber: string; // Auto-generated unique number

  @ApiProperty({ enum: ValuationType })
  @Column({
    type: 'varchar',
    
  })
  type: ValuationType;

  @ApiProperty({ enum: ValuationStatus })
  @Column({
    type: 'varchar',
    
    default: ValuationStatus.REQUESTED,
  })
  status: ValuationStatus;

  @ApiProperty({ enum: ValuationMethod })
  @Column({
    type: 'varchar',
    
    default: ValuationMethod.PHYSICAL_INSPECTION,
  })
  method: ValuationMethod;

  @ApiProperty()
  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  estimatedValue: number;

  @ApiProperty()
  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  lowerEstimate: number;

  @ApiProperty()
  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  upperEstimate: number;

  @ApiProperty()
  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  rentalValue: number; // Monthly rental value

  @ApiProperty()
  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  confidenceLevel: number; // 0-100

  @ApiProperty()
  @Column({ nullable: true })
  validityPeriod: number; // Days the valuation is valid

  @ApiProperty()
  @Column({ nullable: true })
  expiryDate: Date;

  @ApiProperty()
  @Column({ nullable: true })
  scheduledDate: Date;

  @ApiProperty()
  @Column('time', { nullable: true })
  scheduledTime: string;

  @ApiProperty()
  @Column({ nullable: true })
  completedDate: Date;

  @ApiProperty()
  @Column('text', { nullable: true })
  purpose: string;

  @ApiProperty()
  @Column('text', { nullable: true })
  instructions: string;

  @ApiProperty()
  @Column('text', { nullable: true })
  findings: string;

  @ApiProperty()
  @Column('text', { nullable: true })
  methodology: string;

  @ApiProperty()
  @Column('text', { nullable: true })
  assumptions: string;

  @ApiProperty()
  @Column('text', { nullable: true })
  limitations: string;

  @ApiProperty()
  @Column('text', { nullable: true })
  recommendations: string;

  @ApiProperty()
  @Column('json', { nullable: true })
  comparableProperties: any; // Array of comparable sales

  @ApiProperty()
  @Column('json', { nullable: true })
  marketConditions: any; // Local market analysis

  @ApiProperty()
  @Column('json', { nullable: true })
  propertyCondition: any; // Condition assessment

  @ApiProperty()
  @Column('simple-array', { nullable: true })
  images: string[]; // URLs to valuation photos

  @ApiProperty()
  @Column('simple-array', { nullable: true })
  documents: string[]; // URLs to supporting documents

  @ApiProperty()
  @Column({ nullable: true })
  reportUrl: string;

  @ApiProperty()
  @Column({ default: false })
  reportGenerated: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  reportGeneratedAt: Date;

  // Fees and Costs
  @ApiProperty()
  @Column('decimal', { precision: 8, scale: 2, nullable: true })
  fee: number;

  @ApiProperty()
  @Column('decimal', { precision: 8, scale: 2, nullable: true })
  vatAmount: number;

  @ApiProperty()
  @Column('decimal', { precision: 8, scale: 2, nullable: true })
  totalCost: number;

  @ApiProperty()
  @Column({ default: false })
  isPaid: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  paidAt: Date;

  @ApiProperty()
  @Column({ nullable: true })
  paymentReference: string;

  // Quality Assurance
  @ApiProperty()
  @Column({ default: false })
  isReviewed: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  reviewedAt: Date;

  @ApiProperty()
  @Column('text', { nullable: true })
  reviewNotes: string;

  @ApiProperty()
  @Column({ default: false })
  isApproved: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  approvedAt: Date;

  // Client Communication
  @ApiProperty()
  @Column({ default: false })
  clientNotified: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  clientNotifiedAt: Date;

  @ApiProperty()
  @Column('text', { nullable: true })
  clientFeedback: string;

  @ApiProperty()
  @Column({ nullable: true })
  clientRating: number; // 1-5

  // External References
  @ApiProperty()
  @Column({ nullable: true })
  externalReference: string;

  @ApiProperty()
  @Column({ nullable: true })
  lenderReference: string;

  @ApiProperty()
  @Column({ nullable: true })
  solicitorReference: string;

  @ApiProperty()
  @Column('json', { nullable: true })
  metadata: any; // Additional data

  // Relationships
  @ApiProperty()
  @Column('uuid', { nullable: true })
  propertyId: string;

  @ManyToOne(() => Property)
  @JoinColumn({ name: 'propertyId' })
  property: Property;

  @ApiProperty()
  @Column('uuid')
  requestedById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'requestedById' })
  requestedBy: User;

  @ApiProperty()
  @Column('uuid', { nullable: true })
  valuerId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'valuerId' })
  valuer: User;

  @ApiProperty()
  @Column('uuid', { nullable: true })
  reviewedById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'reviewedById' })
  reviewedBy: User;

  @ApiProperty()
  @Column('uuid', { nullable: true })
  approvedById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'approvedById' })
  approvedBy: User;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
