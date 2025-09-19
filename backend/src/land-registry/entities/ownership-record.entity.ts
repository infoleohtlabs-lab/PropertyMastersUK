import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Property } from '../../properties/entities/property.entity';

@Entity('ownership_records')
@Index(['propertyId', 'isCurrent'])
export class OwnershipRecord {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column('uuid')
  propertyId: string;

  @ManyToOne(() => Property)
  @JoinColumn({ name: 'propertyId' })
  property: Property;

  @ApiProperty()
  @Column()
  ownerName: string;

  @ApiProperty()
  @Column({ nullable: true })
  ownerAddress: string;

  @ApiProperty()
  @Column({ nullable: true })
  companyRegistrationNumber: string;

  @ApiProperty()
  @Column({ type: 'date', nullable: true })
  registrationDate: Date;

  @ApiProperty()
  @Column({ default: true })
  isCurrent: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  titleNumber: string;

  @ApiProperty()
  @Column({ nullable: true })
  tenureType: string;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
