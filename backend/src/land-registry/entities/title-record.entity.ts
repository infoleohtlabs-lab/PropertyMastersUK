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

@Entity('title_records')
@Index(['propertyId'])
@Index(['titleNumber'])
export class TitleRecord {
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
  @Column({ unique: true })
  titleNumber: string;

  @ApiProperty()
  @Column()
  tenureType: string;

  @ApiProperty()
  @Column({ type: 'text', nullable: true })
  propertyDescription: string;

  @ApiProperty()
  @Column({ type: 'date', nullable: true })
  registrationDate: Date;

  @ApiProperty()
  @Column({ type: 'date', nullable: true })
  lastUpdated: Date;

  @ApiProperty()
  @Column({ type: 'json', nullable: true })
  restrictions: any;

  @ApiProperty()
  @Column({ type: 'json', nullable: true })
  charges: any;

  @ApiProperty()
  @Column({ type: 'json', nullable: true })
  notes: any;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
