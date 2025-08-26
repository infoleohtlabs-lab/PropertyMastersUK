import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Property } from '../../../properties/entities/property.entity';

export enum VideoType {
  WALKTHROUGH = 'walkthrough',
  DRONE = 'drone',
  NEIGHBORHOOD = 'neighborhood',
  INTERIOR = 'interior',
  EXTERIOR = 'exterior',
  PROMOTIONAL = 'promotional',
}

export enum VideoQuality {
  HD_720 = '720p',
  HD_1080 = '1080p',
  UHD_4K = '4k',
}

export enum VideoStatus {
  UPLOADING = 'uploading',
  PROCESSING = 'processing',
  READY = 'ready',
  FAILED = 'failed',
  ARCHIVED = 'archived',
}

@Entity('property_videos')
export class PropertyVideo {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column()
  title: string;

  @ApiProperty()
  @Column('text', { nullable: true })
  description: string;

  @ApiProperty({ enum: VideoType })
  @Column({
    type: 'varchar',
    
    default: VideoType.WALKTHROUGH,
  })
  type: VideoType;

  @ApiProperty({ enum: VideoStatus })
  @Column({
    type: 'varchar',
    
    default: VideoStatus.UPLOADING,
  })
  status: VideoStatus;

  @ApiProperty()
  @Column('uuid')
  propertyId: string;

  @ManyToOne(() => Property)
  @JoinColumn({ name: 'propertyId' })
  property: Property;

  @ApiProperty()
  @Column('text')
  videoUrl: string;

  @ApiProperty()
  @Column('text', { nullable: true })
  thumbnailUrl: string;

  @ApiProperty()
  @Column('int', { nullable: true })
  duration: number; // Duration in seconds

  @ApiProperty({ enum: VideoQuality })
  @Column({
    type: 'varchar',
    
    default: VideoQuality.HD_1080,
  })
  quality: VideoQuality;

  @ApiProperty()
  @Column('bigint', { nullable: true })
  fileSize: number; // File size in bytes

  @ApiProperty()
  @Column('int', { default: 0 })
  viewCount: number;

  @ApiProperty()
  @Column('int', { default: 0 })
  totalWatchTime: number; // Total watch time in seconds

  @ApiProperty()
  @Column('json', { nullable: true })
  chapters: any; // Video chapters/timestamps

  @ApiProperty()
  @Column('json', { nullable: true })
  captions: any; // Video captions/subtitles

  @ApiProperty()
  @Column('json', { nullable: true })
  analytics: any; // Video analytics data

  @ApiProperty()
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty()
  @Column({ default: false })
  isFeatured: boolean;

  @ApiProperty()
  @Column({ default: false })
  isPublic: boolean;

  @ApiProperty()
  @Column('text', { nullable: true })
  embedCode: string;

  @ApiProperty()
  @Column('simple-array', { nullable: true })
  tags: string[];

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
