import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Property } from '../../properties/entities/property.entity';

@Entity('price_paid_records')
@Index(['uprn'])
@Index(['transferDate'])
@Index(['price'])
@Index(['postcode'])
export class PricePaidRecord {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Unique Property Reference Number' })
  @Column({ length: 20, nullable: true })
  uprn: string;

  @ApiProperty({ description: 'Property address' })
  @Column('text')
  address: string;

  @ApiProperty({ description: 'Property postcode' })
  @Column({ length: 10 })
  postcode: string;

  @ApiProperty({ description: 'Sale price in pence' })
  @Column('bigint')
  price: number;

  @ApiProperty({ description: 'Date of transfer' })
  @Column('date')
  transferDate: Date;

  @ApiProperty({ description: 'Property type code' })
  @Column({ length: 1, default: 'O' })
  propertyType: string;

  @ApiProperty({ description: 'Tenure type' })
  @Column({ length: 1, default: 'F' })
  tenure: string;

  @ApiProperty({ description: 'New build indicator' })
  @Column({ default: false })
  newBuild: boolean;

  @ApiProperty({ description: 'Record status' })
  @Column({ length: 1, default: 'A' })
  recordStatus: string;

  @ApiProperty({ description: 'Transaction unique identifier' })
  @Column({ length: 50, nullable: true })
  transactionId: string;

  @ApiProperty({ description: 'Estate type' })
  @Column({ length: 1, nullable: true })
  estateType: string;

  @ApiProperty({ description: 'Property category' })
  @Column({ length: 1, nullable: true })
  category: string;

  @ApiProperty({ description: 'County' })
  @Column({ length: 100, nullable: true })
  county: string;

  @ApiProperty({ description: 'City/Town' })
  @Column({ length: 100, nullable: true })
  city: string;

  @ApiProperty({ description: 'District' })
  @Column({ length: 100, nullable: true })
  district: string;

  @ApiProperty({ description: 'Associated property' })
  @ManyToOne(() => Property, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'property_id' })
  property: Property;

  @ApiProperty({ description: 'Property ID' })
  @Column({ name: 'property_id', nullable: true })
  propertyId: string;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
