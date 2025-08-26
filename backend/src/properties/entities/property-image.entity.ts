import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Property } from './property.entity';
import { User } from '../../users/entities/user.entity';

export enum ImageType {
  EXTERIOR = 'exterior',
  INTERIOR = 'interior',
  KITCHEN = 'kitchen',
  BATHROOM = 'bathroom',
  BEDROOM = 'bedroom',
  LIVING_ROOM = 'living_room',
  GARDEN = 'garden',
  PARKING = 'parking',
  FLOORPLAN = 'floorplan',
  EPC = 'epc',
  OTHER = 'other',
}

@Entity('property_images')
export class PropertyImage {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column()
  filename: string;

  @ApiProperty()
  @Column()
  originalName: string;

  @ApiProperty()
  @Column()
  url: string;

  @ApiProperty()
  @Column({ nullable: true })
  thumbnailUrl: string;

  @ApiProperty({ enum: ImageType })
  @Column({
    type: 'varchar',
    
    default: ImageType.INTERIOR,
  })
  type: ImageType;

  @ApiProperty()
  @Column({ nullable: true })
  caption: string;

  @ApiProperty()
  @Column('text', { nullable: true })
  description: string;

  @ApiProperty()
  @Column({ default: 0 })
  sortOrder: number;

  @ApiProperty()
  @Column({ default: false })
  isPrimary: boolean;

  @ApiProperty()
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  fileSize: number; // in bytes

  @ApiProperty()
  @Column({ nullable: true })
  width: number;

  @ApiProperty()
  @Column({ nullable: true })
  height: number;

  @ApiProperty()
  @Column({ nullable: true })
  mimeType: string;

  @ApiProperty()
  @Column('simple-array', { nullable: true })
  tags: string[];

  @ApiProperty()
  @Column({ nullable: true })
  altText: string;

  @ApiProperty()
  @Column({ default: false })
  isVirtual360: boolean;

  @ApiProperty()
  @Column('json', { nullable: true })
  metadata: any; // EXIF data, etc.

  // Relationships
  @ApiProperty()
  @Column('uuid')
  propertyId: string;

  @ManyToOne(() => Property, property => property.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'propertyId' })
  property: Property;

  @ApiProperty()
  @Column('uuid')
  uploadedById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'uploadedById' })
  uploadedBy: User;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
