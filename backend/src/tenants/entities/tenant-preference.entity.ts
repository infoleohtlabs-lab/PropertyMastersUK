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
import { Tenant } from './tenant.entity';

@Entity('tenant_preferences')
@Index(['tenantId'])
export class TenantPreference {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @ManyToOne(() => Tenant, (tenant) => tenant.preferences, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  // Location Preferences
  @Column({ type: 'simple-array', nullable: true })
  preferredAreas?: string[];

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  maxRentBudget?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  minRentBudget?: number;

  @Column({ type: 'int', nullable: true })
  minBedrooms?: number;

  @Column({ type: 'int', nullable: true })
  maxBedrooms?: number;

  @Column({ type: 'simple-array', nullable: true })
  propertyTypes?: string[];

  @Column({ type: 'boolean', default: false })
  petFriendly: boolean;

  @Column({ type: 'boolean', default: false })
  furnished: boolean;

  @Column({ type: 'boolean', default: false })
  parking: boolean;

  @Column({ type: 'boolean', default: false })
  garden: boolean;

  @Column({ type: 'simple-array', nullable: true })
  amenities?: string[];

  @Column({ type: 'int', nullable: true })
  maxDistanceToWork?: number;

  @Column({ type: 'simple-array', nullable: true })
  transportLinks?: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
