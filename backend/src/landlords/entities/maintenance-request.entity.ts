import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { Property } from '../../properties/entities/property.entity';

export enum MaintenanceStatus {
  SUBMITTED = 'submitted',
  ACKNOWLEDGED = 'acknowledged',
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  ON_HOLD = 'on_hold',
}

export enum MaintenancePriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
  EMERGENCY = 'emergency',
}

export enum MaintenanceCategory {
  PLUMBING = 'plumbing',
  ELECTRICAL = 'electrical',
  HEATING = 'heating',
  APPLIANCES = 'appliances',
  STRUCTURAL = 'structural',
  DECORATIVE = 'decorative',
  GARDEN = 'garden',
  SECURITY = 'security',
  CLEANING = 'cleaning',
  PEST_CONTROL = 'pest_control',
  OTHER = 'other',
}

@Entity('maintenance_requests')
export class MaintenanceRequest {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column()
  requestNumber: string;

  @ApiProperty()
  @Column()
  title: string;

  @ApiProperty()
  @Column('text')
  description: string;

  @ApiProperty({ enum: MaintenanceCategory })
  @Column({
    type: 'varchar',
    
  })
  category: MaintenanceCategory;

  @ApiProperty({ enum: MaintenancePriority })
  @Column({
    type: 'varchar',
    
    default: MaintenancePriority.MEDIUM,
  })
  priority: MaintenancePriority;

  @ApiProperty({ enum: MaintenanceStatus })
  @Column({
    type: 'varchar',
    
    default: MaintenanceStatus.SUBMITTED,
  })
  status: MaintenanceStatus;

  @ApiProperty()
  @Column('simple-array', { nullable: true })
  images: string[];

  @ApiProperty()
  @Column('simple-array', { nullable: true })
  documents: string[];

  @ApiProperty()
  @Column({ nullable: true })
  location: string; // Specific location within property

  @ApiProperty()
  @Column({ default: false })
  tenantPresenceRequired: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  preferredDate: Date;

  @ApiProperty()
  @Column({ nullable: true })
  preferredTime: string;

  @ApiProperty()
  @Column({ nullable: true })
  scheduledDate: Date;

  @ApiProperty()
  @Column({ nullable: true })
  scheduledTime: string;

  @ApiProperty()
  @Column({ nullable: true })
  completedDate: Date;

  @ApiProperty()
  @Column('decimal', { precision: 8, scale: 2, nullable: true })
  estimatedCost: number;

  @ApiProperty()
  @Column('decimal', { precision: 8, scale: 2, nullable: true })
  actualCost: number;

  @ApiProperty()
  @Column({ nullable: true })
  contractorName: string;

  @ApiProperty()
  @Column({ nullable: true })
  contractorPhone: string;

  @ApiProperty()
  @Column({ nullable: true })
  contractorEmail: string;

  @ApiProperty()
  @Column('text', { nullable: true })
  contractorNotes: string;

  @ApiProperty()
  @Column('text', { nullable: true })
  landlordNotes: string;

  @ApiProperty()
  @Column('text', { nullable: true })
  tenantNotes: string;

  @ApiProperty()
  @Column('text', { nullable: true })
  completionNotes: string;

  @ApiProperty()
  @Column('simple-array', { nullable: true })
  completionImages: string[];

  @ApiProperty()
  @Column({ nullable: true })
  warrantyPeriod: number; // in days

  @ApiProperty()
  @Column({ nullable: true })
  warrantyExpiry: Date;

  @ApiProperty()
  @Column({ nullable: true })
  rating: number; // 1-5 stars

  @ApiProperty()
  @Column('text', { nullable: true })
  feedback: string;

  @ApiProperty()
  @Column({ default: false })
  isEmergency: boolean;

  @ApiProperty()
  @Column({ default: false })
  isRecurring: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  recurringFrequency: string;

  @ApiProperty()
  @Column({ nullable: true })
  nextScheduledDate: Date;

  // Relationships
  @ApiProperty()
  @Column('uuid')
  propertyId: string;

  @ManyToOne(() => Property)
  @JoinColumn({ name: 'propertyId' })
  property: Property;

  @ApiProperty()
  @Column('uuid')
  requestedById: string; // Usually tenant

  @ManyToOne(() => User)
  @JoinColumn({ name: 'requestedById' })
  requestedBy: User;

  @ApiProperty()
  @Column('uuid')
  landlordId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'landlordId' })
  landlord: User;

  @ApiProperty()
  @Column('uuid', { nullable: true })
  agentId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'agentId' })
  agent: User;

  @ApiProperty()
  @Column('uuid', { nullable: true })
  contractorId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'contractorId' })
  contractor: User;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
