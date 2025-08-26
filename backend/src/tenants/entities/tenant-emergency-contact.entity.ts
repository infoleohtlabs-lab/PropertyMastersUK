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

export enum ContactRelationship {
  PARENT = 'parent',
  SIBLING = 'sibling',
  SPOUSE = 'spouse',
  PARTNER = 'partner',
  FRIEND = 'friend',
  COLLEAGUE = 'colleague',
  OTHER_FAMILY = 'other_family',
  OTHER = 'other',
}

@Entity('tenant_emergency_contacts')
@Index(['tenantId'])
export class TenantEmergencyContact {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @ManyToOne(() => Tenant, (tenant) => tenant.emergencyContacts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ length: 100 })
  firstName: string;

  @Column({ length: 100 })
  lastName: string;

  @Column({
    type: 'varchar',
    
  })
  relationship: ContactRelationship;

  @Column({ length: 20 })
  primaryPhone: string;

  @Column({ length: 20, nullable: true })
  secondaryPhone?: string;

  @Column({ length: 255, nullable: true })
  email?: string;

  @Column({ length: 255, nullable: true })
  address?: string;

  @Column({ type: 'boolean', default: true })
  isPrimary: boolean;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ length: 500, nullable: true })
  notes?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
