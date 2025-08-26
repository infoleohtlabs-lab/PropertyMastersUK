import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { BuyerPreference } from './buyer-preference.entity';
import { PropertySearch } from './property-search.entity';
import { PropertyValuation } from './property-valuation.entity';

export enum BuyerStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  VIEWING = 'viewing',
  OFFER_MADE = 'offer_made',
  UNDER_OFFER = 'under_offer',
  COMPLETED = 'completed',
}

export enum BuyerType {
  FIRST_TIME = 'first_time',
  SECOND_TIME = 'second_time',
  INVESTOR = 'investor',
  DOWNSIZING = 'downsizing',
  UPSIZING = 'upsizing',
  RELOCATION = 'relocation',
}

export enum FinancialStatus {
  CASH_BUYER = 'cash_buyer',
  MORTGAGE_REQUIRED = 'mortgage_required',
  MORTGAGE_APPROVED = 'mortgage_approved',
  CHAIN_FREE = 'chain_free',
  CHAIN_DEPENDENT = 'chain_dependent',
}

@Entity('buyers')
export class Buyer {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column('uuid')
  userId: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ApiProperty({ enum: BuyerStatus })
  @Column({
    type: 'varchar',
    
    default: BuyerStatus.ACTIVE,
  })
  status: BuyerStatus;

  @ApiProperty({ enum: BuyerType })
  @Column({
    type: 'varchar',
    
    nullable: true,
  })
  buyerType: BuyerType;

  @ApiProperty({ enum: FinancialStatus })
  @Column({
    type: 'varchar',
    
    nullable: true,
  })
  financialStatus: FinancialStatus;

  @ApiProperty()
  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  maxBudget: number;

  @ApiProperty()
  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  minBudget: number;

  @ApiProperty()
  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  depositAmount: number;

  @ApiProperty()
  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  monthlyIncome: number;

  @ApiProperty()
  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  monthlyExpenses: number;

  @ApiProperty()
  @Column({ nullable: true })
  mortgagePreApproval: boolean;

  @ApiProperty()
  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  mortgageAmount: number;

  @ApiProperty()
  @Column({ nullable: true })
  mortgageLender: string;

  @ApiProperty()
  @Column({ nullable: true })
  mortgageAdvisor: string;

  @ApiProperty()
  @Column({ nullable: true })
  solicitorName: string;

  @ApiProperty()
  @Column({ nullable: true })
  solicitorEmail: string;

  @ApiProperty()
  @Column({ nullable: true })
  solicitorPhone: string;

  @ApiProperty()
  @Column({ nullable: true })
  currentPropertyValue: number;

  @ApiProperty()
  @Column({ nullable: true })
  currentPropertyAddress: string;

  @ApiProperty()
  @Column({ nullable: true })
  currentPropertyOnMarket: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  timeframe: string;

  @ApiProperty()
  @Column({ nullable: true })
  urgency: string;

  @ApiProperty()
  @Column('simple-array', { nullable: true })
  preferredAreas: string[];

  @ApiProperty()
  @Column('simple-array', { nullable: true })
  avoidAreas: string[];

  @ApiProperty()
  @Column({ nullable: true })
  transportLinks: string;

  @ApiProperty()
  @Column({ nullable: true })
  schoolCatchment: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  petFriendly: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  gardenRequired: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  parkingRequired: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  newBuildPreference: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  chainFree: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  investmentPurpose: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  buyToLet: boolean;

  @ApiProperty()
  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  expectedRentalYield: number;

  @ApiProperty()
  @Column('text', { nullable: true })
  additionalRequirements: string;

  @OneToMany(() => BuyerPreference, preference => preference.buyer)
  preferences: BuyerPreference[];

  @OneToMany(() => PropertySearch, search => search.buyer)
  searches: PropertySearch[];

  @OneToMany(() => PropertyValuation, valuation => valuation.buyer)
  valuations: PropertyValuation[];

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
