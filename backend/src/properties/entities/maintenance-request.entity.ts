import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { Property } from './property.entity';
import { Tenant } from '../../tenants/entities/tenant.entity';

export enum MaintenanceStatus {
  PENDING = 'pending',
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
  OTHER = 'other',
}

@Entity('maintenance_requests')
export class MaintenanceRequest {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

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
    
    default: MaintenanceStatus.PENDING,
  })
  status: MaintenanceStatus;

  @ApiProperty()
  @Column({ nullable: true })
  reportedDate: Date;

  @ApiProperty()
  @Column({ nullable: true })
  scheduledDate: Date;

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
  @Column('simple-array', { nullable: true })
  images: string[]; // Before/after photos

  @ApiProperty()
  @Column('simple-array', { nullable: true })
  documents: string[]; // Invoices, receipts, etc.

  @ApiProperty()
  @Column('text', { nullable: true })
  workDescription: string;

  @ApiProperty()
  @Column('text', { nullable: true })
  completionNotes: string;

  @ApiProperty()
  @Column({ default: false })
  tenantAccess: boolean; // Does contractor need tenant access?

  @ApiProperty()
  @Column({ nullable: true })
  accessArrangedDate: Date;

  @ApiProperty()
  @Column('text', { nullable: true })
  accessNotes: string;

  @ApiProperty()
  @Column({ default: false })
  warrantyApplicable: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  warrantyPeriod: number; // in months

  @ApiProperty()
  @Column({ nullable: true })
  warrantyExpiryDate: Date;

  @ApiProperty()
  @Column({ nullable: true })
  rating: number; // 1-5 stars for contractor/work quality

  @ApiProperty()
  @Column('text', { nullable: true })
  feedback: string;

  // Relationships
  @ApiProperty()
  @Column('uuid')
  propertyId: string;

  @ManyToOne(() => Property)
  @JoinColumn({ name: 'propertyId' })
  property: Property;

  @ApiProperty()
  @Column('uuid')
  reportedById: string; // User who reported the issue

  @ManyToOne(() => User)
  @JoinColumn({ name: 'reportedById' })
  reportedBy: User;

  @ApiProperty()
  @Column('uuid', { nullable: true })
  assignedToId: string; // Agent/contractor assigned

  @ManyToOne(() => User)
  @JoinColumn({ name: 'assignedToId' })
  assignedTo: User;

  @ApiProperty()
  @Column('uuid')
  landlordId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'landlordId' })
  landlord: User;

  @ApiProperty()
  @Column('uuid', { nullable: true })
  tenantId: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
