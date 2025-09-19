import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { TenantOrganization } from '../../common/entities/tenant-organization.entity';

export enum UserRole {
  ADMIN = 'admin',
  AGENT = 'agent',
  LANDLORD = 'landlord',
  TENANT = 'tenant',
  BUYER = 'buyer',
  SELLER = 'seller',
  SOLICITOR = 'solicitor',
  PROPERTY_MANAGER = 'property_manager',
  CONTRACTOR = 'contractor',
  VIEWER = 'viewer',
  SUPER_ADMIN = 'super_admin',
  MANAGER = 'manager',
  USER = 'user',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending',
  DELETED = 'deleted',
}

@Entity('users')
export class User {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ unique: true, nullable: true })
  email: string;

  @Column({ nullable: true })
  password: string;

  @ApiProperty()
  @Column({ nullable: true })
  firstName: string;

  @ApiProperty()
  @Column({ nullable: true })
  lastName: string;

  @ApiProperty()
  @Column({ nullable: true })
  phone: string;

  @ApiProperty({ enum: UserRole })
  @Column({
    type: 'varchar',
    default: UserRole.TENANT,
  })
  role: UserRole;

  @ApiProperty()
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({ enum: UserStatus })
  @Column({
    type: 'varchar',
    default: UserStatus.ACTIVE,
  })
  status: UserStatus;

  @ApiProperty()
  @Column({ default: false })
  isVerified: boolean;

  @ApiProperty()
  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ nullable: true })
  emailVerificationToken: string;

  @Column({ nullable: true })
  passwordResetToken: string;

  @Column({ nullable: true })
  passwordResetTokenExpiry: Date;

  @ApiProperty()
  @Column({ nullable: true })
  lastLoginAt: Date;

  @Column({ default: 0 })
  failedLoginAttempts: number;

  @Column({ nullable: true })
  accountLockedUntil: Date;

  @Column({ default: false })
  isAccountLocked: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  profilePicture: string;

  @ApiProperty()
  @Column({ nullable: true })
  avatar: string;

  @ApiProperty()
  @Column({ nullable: true })
  address: string;

  @ApiProperty()
  @Column({ nullable: true })
  dateOfBirth: Date;

  @ApiProperty()
  @Column({ default: 'en' })
  preferredLanguage: string;

  @ApiProperty()
  @Column({ default: true })
  emailNotifications: boolean;

  @ApiProperty()
  @Column({ default: true })
  smsNotifications: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  tenantOrganizationId: string;

  @ManyToOne(() => TenantOrganization, tenantOrg => tenantOrg.users)
  @JoinColumn({ name: 'tenantOrganizationId' })
  tenantOrganization: TenantOrganization;

  @ApiProperty()
  @Column({ type: 'json', nullable: true })
  permissions: string[];

  @ApiProperty()
  @Column({ nullable: true })
  department: string;

  @ApiProperty()
  @Column({ nullable: true })
  jobTitle: string;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @OneToMany('Property', 'owner')
  properties: any[];

  @OneToMany('Booking', 'user')
  bookings: any[];
}
