import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Buyer } from './buyer.entity';
import { Property } from '../../properties/entities/property.entity';

export enum ValuationType {
  AVM = 'avm', // Automated Valuation Model
  PROFESSIONAL = 'professional',
  COMPARATIVE = 'comparative',
  INVESTMENT = 'investment',
  INSURANCE = 'insurance',
  MORTGAGE = 'mortgage',
}

export enum ValuationStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

export enum ConfidenceLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  VERY_HIGH = 'very_high',
}

@Entity('property_valuations')
export class PropertyValuation {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column('uuid', { nullable: true })
  buyerId: string;

  @ManyToOne(() => Buyer, buyer => buyer.valuations, { nullable: true })
  @JoinColumn({ name: 'buyerId' })
  buyer: Buyer;

  @ApiProperty()
  @Column('uuid', { nullable: true })
  propertyId: string;

  @ManyToOne(() => Property, { nullable: true })
  @JoinColumn({ name: 'propertyId' })
  property: Property;

  @ApiProperty({ enum: ValuationType })
  @Column({
    type: 'varchar',
    
  })
  type: ValuationType;

  @ApiProperty({ enum: ValuationStatus })
  @Column({
    type: 'varchar',
    
    default: ValuationStatus.PENDING,
  })
  status: ValuationStatus;

  @ApiProperty()
  @Column()
  address: string;

  @ApiProperty()
  @Column()
  postcode: string;

  @ApiProperty()
  @Column('decimal', { precision: 10, scale: 8, nullable: true })
  latitude: number;

  @ApiProperty()
  @Column('decimal', { precision: 11, scale: 8, nullable: true })
  longitude: number;

  @ApiProperty()
  @Column('decimal', { precision: 12, scale: 2 })
  estimatedValue: number;

  @ApiProperty()
  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  lowerEstimate: number;

  @ApiProperty()
  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  upperEstimate: number;

  @ApiProperty({ enum: ConfidenceLevel })
  @Column({
    type: 'varchar',
    
    nullable: true,
  })
  confidenceLevel: ConfidenceLevel;

  @ApiProperty()
  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  confidenceScore: number;

  @ApiProperty()
  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  pricePerSqFt: number;

  @ApiProperty()
  @Column({ nullable: true })
  floorArea: number;

  @ApiProperty()
  @Column({ nullable: true })
  bedrooms: number;

  @ApiProperty()
  @Column({ nullable: true })
  bathrooms: number;

  @ApiProperty()
  @Column({ nullable: true })
  propertyAge: number;

  @ApiProperty()
  @Column('simple-array', { nullable: true })
  comparableProperties: string[]; // Property IDs

  @ApiProperty()
  @Column('text', { nullable: true })
  methodology: string;

  @ApiProperty()
  @Column('text', { nullable: true })
  assumptions: string;

  @ApiProperty()
  @Column('text', { nullable: true })
  marketConditions: string;

  @ApiProperty()
  @Column('text', { nullable: true })
  adjustments: string; // JSON string of adjustments made

  @ApiProperty()
  @Column('text', { nullable: true })
  riskFactors: string;

  @ApiProperty()
  @Column('text', { nullable: true })
  notes: string;

  @ApiProperty()
  @Column({ nullable: true })
  valuerId: string; // Professional valuer ID

  @ApiProperty()
  @Column({ nullable: true })
  valuerName: string;

  @ApiProperty()
  @Column({ nullable: true })
  valuerCompany: string;

  @ApiProperty()
  @Column({ nullable: true })
  valuerLicense: string;

  @ApiProperty()
  @Column({ nullable: true })
  reportUrl: string;

  @ApiProperty()
  @Column({ nullable: true })
  certificateUrl: string;

  @ApiProperty()
  @Column('decimal', { precision: 8, scale: 2, nullable: true })
  fee: number;

  @ApiProperty()
  @Column({ nullable: true })
  requestedDate: Date;

  @ApiProperty()
  @Column({ nullable: true })
  completedDate: Date;

  @ApiProperty()
  @Column({ nullable: true })
  validUntil: Date;

  @ApiProperty()
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
