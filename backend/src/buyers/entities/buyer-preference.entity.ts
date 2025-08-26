import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Buyer } from './buyer.entity';
import { PropertyType } from '../../properties/entities/property.entity';

export enum PreferenceType {
  PROPERTY_TYPE = 'property_type',
  LOCATION = 'location',
  FEATURE = 'feature',
  AMENITY = 'amenity',
  TRANSPORT = 'transport',
  SCHOOL = 'school',
  LIFESTYLE = 'lifestyle',
}

export enum PreferencePriority {
  ESSENTIAL = 'essential',
  IMPORTANT = 'important',
  NICE_TO_HAVE = 'nice_to_have',
  AVOID = 'avoid',
}

@Entity('buyer_preferences')
export class BuyerPreference {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column('uuid')
  buyerId: string;

  @ManyToOne(() => Buyer, buyer => buyer.preferences)
  @JoinColumn({ name: 'buyerId' })
  buyer: Buyer;

  @ApiProperty({ enum: PreferenceType })
  @Column({
    type: 'varchar',
    
  })
  type: PreferenceType;

  @ApiProperty({ enum: PreferencePriority })
  @Column({
    type: 'varchar',
    
  })
  priority: PreferencePriority;

  @ApiProperty()
  @Column()
  name: string;

  @ApiProperty()
  @Column('text', { nullable: true })
  description: string;

  @ApiProperty()
  @Column('text', { nullable: true })
  value: string;

  @ApiProperty()
  @Column({ nullable: true })
  minValue: number;

  @ApiProperty()
  @Column({ nullable: true })
  maxValue: number;

  @ApiProperty()
  @Column({ nullable: true })
  radius: number; // For location-based preferences

  @ApiProperty()
  @Column('decimal', { precision: 10, scale: 8, nullable: true })
  latitude: number;

  @ApiProperty()
  @Column('decimal', { precision: 11, scale: 8, nullable: true })
  longitude: number;

  @ApiProperty()
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  weight: number; // For scoring algorithm

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
