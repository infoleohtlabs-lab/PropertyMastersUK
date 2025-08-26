import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Property } from '../../properties/entities/property.entity';
import { User } from '../../users/entities/user.entity';

export enum VideoStatus {
  UPLOADING = 'uploading',
  PROCESSING = 'processing',
  READY = 'ready',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
  FAILED = 'failed',
}

export enum VideoType {
  PROPERTY_TOUR = 'property_tour',
  WALKTHROUGH = 'walkthrough',
  NEIGHBORHOOD = 'neighborhood',
  TESTIMONIAL = 'testimonial',
  PROMOTIONAL = 'promotional',
  DRONE = 'drone',
}

@Entity('videos')
export class Video {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column('uuid')
  propertyId: string;

  @ManyToOne(() => Property)
  @JoinColumn({ name: 'propertyId' })
  property: Property;

  @Column('uuid')
  uploadedBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'uploadedBy' })
  uploader: User;

  @Column({
    type: 'varchar',
    
    default: VideoType.PROPERTY_TOUR,
  })
  videoType: VideoType;

  @Column({
    type: 'varchar',
    
    default: VideoStatus.UPLOADING,
  })
  status: VideoStatus;

  @Column({ type: 'text' })
  videoUrl: string;

  @Column({ type: 'text', nullable: true })
  thumbnailUrl: string;

  @Column({ type: 'text', nullable: true })
  embedCode: string;

  @Column({ type: 'int', default: 0 })
  duration: number; // in seconds

  @Column({ type: 'bigint', default: 0 })
  fileSize: number; // in bytes

  @Column({ type: 'varchar', length: 50, nullable: true })
  resolution: string; // e.g., '1920x1080'

  @Column({ type: 'varchar', length: 20, nullable: true })
  format: string; // e.g., 'mp4', 'webm'

  @Column({ type: 'int', default: 0 })
  viewCount: number;

  @Column({ type: 'int', default: 0 })
  totalWatchTime: number; // in seconds

  @Column({ default: true })
  isPublic: boolean;

  @Column({ default: false })
  isFeatured: boolean;

  @Column({ default: false })
  autoplay: boolean;

  @Column({ default: true })
  showControls: boolean;

  @Column({ type: 'json', nullable: true })
  analytics: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  tags: string[];

  @Column({ type: 'varchar', length: 255, nullable: true })
  externalId: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  provider: string; // e.g., 'youtube', 'vimeo', 'local'

  @Column({ type: 'datetime', nullable: true })
  publishedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
