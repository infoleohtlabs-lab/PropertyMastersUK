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


export enum OfferStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  WITHDRAWN = 'withdrawn',
  COUNTERED = 'countered',
  EXPIRED = 'expired'
}

export enum OfferType {
  PURCHASE = 'purchase',
  RENTAL = 'rental'
}

@Entity('property_offers')
export class PropertyOffer {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column('uuid')
  buyerId: string;

  @ApiProperty()
  @Column('uuid')
  propertyId: string;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  offerAmount: number;

  @ApiProperty({ enum: OfferType })
  @Column({ type: 'varchar', default: OfferType.PURCHASE })
  offerType: OfferType;

  @ApiProperty({ enum: OfferStatus })
  @Column({ type: 'varchar', default: OfferStatus.PENDING })
  status: OfferStatus;

  @ApiProperty()
  @Column({ nullable: true })
  message: string;

  @ApiProperty()
  @Column({ nullable: true })
  conditions: string; // JSON string for offer conditions

  @ApiProperty()
  @Column({ type: 'date', nullable: true })
  proposedCompletionDate: Date;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  deposit: number;

  @ApiProperty()
  @Column({ default: false })
  isCashOffer: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  mortgageInPrinciple: boolean;

  @ApiProperty()
  @Column({ type: 'date', nullable: true })
  expiryDate: Date;

  @ApiProperty()
  @Column({ nullable: true })
  agentResponse: string;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  counterOfferAmount: number;

  @ApiProperty()
  @Column({ type: 'datetime', nullable: true })
  respondedAt: Date;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Buyer, buyer => buyer.propertyOffers)
  @JoinColumn({ name: 'buyerId' })
  buyer: Buyer;
}
