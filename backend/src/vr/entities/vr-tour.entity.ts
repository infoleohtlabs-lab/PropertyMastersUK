import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Property } from '../../properties/entities/property.entity';
import { User } from '../../users/entities/user.entity';

export enum VrTourStatus {
  UPLOADING = 'uploading',
  PROCESSING = 'processing',
  READY = 'ready',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
  FAILED = 'failed',
}

export enum VrTourType {
  PANORAMIC = 'panoramic',
  WALKTHROUGH = 'walkthrough',
  INTERACTIVE = 'interactive',
  DOLLHOUSE = 'dollhouse',
}

@Entity('vr_tours')
export class VrTour {
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
  createdBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdBy' })
  creator: User;

  @Column({
    type: 'varchar',
    
    default: VrTourType.PANORAMIC,
  })
  tourType: VrTourType;

  @Column({
    type: 'varchar',
    
    default: VrTourStatus.UPLOADING,
  })
  status: VrTourStatus;

  @Column({ type: 'text' })
  tourUrl: string;

  @Column({ type: 'text', nullable: true })
  thumbnailUrl: string;

  @Column({ type: 'text', nullable: true })
  embedCode: string;

  @Column({ type: 'json', nullable: true })
  scenes: Record<string, any>[];

  @Column({ type: 'json', nullable: true })
  hotspots: Record<string, any>[];

  @Column({ type: 'json', nullable: true })
  settings: Record<string, any>;

  @Column({ type: 'int', default: 0 })
  viewCount: number;

  @Column({ type: 'int', default: 0 })
  duration: number; // in seconds

  @Column({ default: true })
  isPublic: boolean;

  @Column({ default: false })
  isFeatured: boolean;

  @Column({ type: 'json', nullable: true })
  analytics: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'varchar', length: 255, nullable: true })
  externalId: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  provider: string; // e.g., 'matterport', 'custom', etc.

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
