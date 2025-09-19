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

@Entity('saved_properties')
export class SavedProperty {
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
  @Column({ nullable: true })
  notes: string;

  @ApiProperty()
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  tags: string; // JSON string for property tags

  @ApiProperty()
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  maxBudget: number;

  @ApiProperty()
  @Column({ nullable: true })
  priority: 'low' | 'medium' | 'high';

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Buyer, buyer => buyer.savedProperties)
  @JoinColumn({ name: 'buyerId' })
  buyer: Buyer;
}
