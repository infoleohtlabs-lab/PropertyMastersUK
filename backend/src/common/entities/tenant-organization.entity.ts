import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';

export enum TenantStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  TRIAL = 'trial',
  EXPIRED = 'expired',
}

export enum SubscriptionPlan {
  STARTER = 'starter',
  PROFESSIONAL = 'professional',
  ENTERPRISE = 'enterprise',
}

@Entity('tenant_organizations')
export class TenantOrganization {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ unique: true })
  name: string;

  @ApiProperty()
  @Column({ unique: true })
  subdomain: string;

  @ApiProperty()
  @Column({ unique: true, nullable: true })
  customDomain: string;

  @ApiProperty()
  @Column({ nullable: true })
  logo: string;

  @ApiProperty()
  @Column({ nullable: true })
  primaryColor: string;

  @ApiProperty()
  @Column({ nullable: true })
  secondaryColor: string;

  @ApiProperty({ enum: TenantStatus })
  @Column({
    type: 'varchar',
    default: TenantStatus.TRIAL,
  })
  status: TenantStatus;

  @ApiProperty({ enum: SubscriptionPlan })
  @Column({
    type: 'varchar',
    default: SubscriptionPlan.STARTER,
  })
  subscriptionPlan: SubscriptionPlan;

  @ApiProperty()
  @Column({ nullable: true })
  subscriptionStartDate: Date;

  @ApiProperty()
  @Column({ nullable: true })
  subscriptionEndDate: Date;

  @ApiProperty()
  @Column({ default: 10 })
  maxUsers: number;

  @ApiProperty()
  @Column({ default: 100 })
  maxProperties: number;

  @ApiProperty()
  @Column({ nullable: true })
  contactEmail: string;

  @ApiProperty()
  @Column({ nullable: true })
  contactPhone: string;

  @ApiProperty()
  @Column({ nullable: true })
  address: string;

  @ApiProperty()
  @Column({ nullable: true })
  city: string;

  @ApiProperty()
  @Column({ nullable: true })
  postcode: string;

  @ApiProperty()
  @Column({ nullable: true })
  country: string;

  @ApiProperty()
  @Column({ nullable: true })
  companyRegistrationNumber: string;

  @ApiProperty()
  @Column({ nullable: true })
  vatNumber: string;

  @ApiProperty()
  @Column({ type: 'json', nullable: true })
  settings: Record<string, any>;

  @ApiProperty()
  @Column({ type: 'json', nullable: true })
  features: string[];

  @ApiProperty()
  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => User, user => user.tenantOrganization)
  users: User[];

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}