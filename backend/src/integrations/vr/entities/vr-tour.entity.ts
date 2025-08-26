import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Property } from '../../../properties/entities/property.entity';

export enum VrTourType {
  PANORAMIC = 'panoramic',
  WALKTHROUGH = 'walkthrough',
  INTERACTIVE = 'interactive',
  GUIDED = 'guided',
}

export enum VrTourStatus {
  DRAFT = 'draft',
  PROCESSING = 'processing',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

@Entity('vr_tours')
export class VrTour {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column()
  title: string;

  @ApiProperty()
  @Column('text', { nullable: true })
  description: string;

  @ApiProperty({ enum: VrTourType })
  @Column({
    type: 'varchar',
    
    default: VrTourType.PANORAMIC,
  })
  type: VrTourType;

  @ApiProperty({ enum: VrTourStatus })
  @Column({
    type: 'varchar',
    
    default: VrTourStatus.DRAFT,
  })
  status: VrTourStatus;

  @ApiProperty()
  @Column('uuid')
  propertyId: string;

  @ManyToOne(() => Property)
  @JoinColumn({ name: 'propertyId' })
  property: Property;

  @ApiProperty()
  @Column('text')
  tourUrl: string;

  @ApiProperty()
  @Column('text', { nullable: true })
  thumbnailUrl: string;

  @ApiProperty()
  @Column('simple-array', { nullable: true })
  scenes: string[]; // Array of scene URLs or IDs

  @ApiProperty()
  @Column('json', { nullable: true })
  hotspots: any; // JSON data for interactive hotspots

  @ApiProperty()
  @Column('json', { nullable: true })
  rooms: any; // JSON data for room information

  @ApiProperty()
  @Column('int', { default: 0 })
  viewCount: number;

  @ApiProperty()
  @Column('int', { nullable: true })
  duration: number; // Duration in seconds

  @ApiProperty()
  @Column('json', { nullable: true })
  settings: any; // VR tour settings (controls, navigation, etc.)

  @ApiProperty()
  @Column('json', { nullable: true })
  analytics: any; // Analytics data

  @ApiProperty()
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty()
  @Column({ default: false })
  isFeatured: boolean;

  @ApiProperty()
  @Column('text', { nullable: true })
  embedCode: string;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
