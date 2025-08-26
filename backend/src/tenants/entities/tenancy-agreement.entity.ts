import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { Property } from '../../properties/entities/property.entity';

export enum TenancyStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  ACTIVE = 'active',
  EXPIRED = 'expired',
  TERMINATED = 'terminated',
  RENEWED = 'renewed',
}

export enum TenancyType {
  ASSURED_SHORTHOLD = 'assured_shorthold',
  ASSURED = 'assured',
  REGULATED = 'regulated',
  COMPANY_LET = 'company_let',
  STUDENT = 'student',
}

@Entity('tenancy_agreements')
export class TenancyAgreement {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column()
  agreementNumber: string;

  @ApiProperty({ enum: TenancyType })
  @Column({
    type: 'varchar',
    
    default: TenancyType.ASSURED_SHORTHOLD,
  })
  type: TenancyType;

  @ApiProperty({ enum: TenancyStatus })
  @Column({
    type: 'varchar',
    
    default: TenancyStatus.DRAFT,
  })
  status: TenancyStatus;

  @ApiProperty()
  @Column()
  startDate: Date;

  @ApiProperty()
  @Column()
  endDate: Date;

  @ApiProperty()
  @Column('decimal', { precision: 8, scale: 2 })
  monthlyRent: number;

  @ApiProperty()
  @Column('decimal', { precision: 8, scale: 2 })
  deposit: number;

  @ApiProperty()
  @Column({ default: 1 })
  rentDueDay: number; // Day of month rent is due

  @ApiProperty()
  @Column({ default: 'monthly' })
  rentFrequency: string;

  @ApiProperty()
  @Column('simple-array', { nullable: true })
  tenantIds: string[];

  @ApiProperty()
  @Column('text', { nullable: true })
  specialTerms: string;

  @ApiProperty()
  @Column('text', { nullable: true })
  notes: string;

  @ApiProperty()
  @Column({ default: false })
  petsAllowed: boolean;

  @ApiProperty()
  @Column({ default: false })
  smokingAllowed: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  depositScheme: string;

  @ApiProperty()
  @Column({ nullable: true })
  depositSchemeReference: string;

  @ApiProperty()
  @Column({ nullable: true })
  inventoryDate: Date;

  @ApiProperty()
  @Column({ nullable: true })
  checkInDate: Date;

  @ApiProperty()
  @Column({ nullable: true })
  checkOutDate: Date;

  @ApiProperty()
  @Column({ nullable: true })
  renewalDate: Date;

  @ApiProperty()
  @Column({ nullable: true })
  terminationDate: Date;

  @ApiProperty()
  @Column('text', { nullable: true })
  terminationReason: string;

  @ApiProperty()
  @Column({ nullable: true })
  noticePeriod: number; // in days

  @ApiProperty()
  @Column('simple-array', { nullable: true })
  documentUrls: string[];

  // Relationships
  @ApiProperty()
  @Column('uuid')
  propertyId: string;

  @ManyToOne(() => Property)
  @JoinColumn({ name: 'propertyId' })
  property: Property;

  @ApiProperty()
  @Column('uuid')
  landlordId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'landlordId' })
  landlord: User;

  @ApiProperty()
  @Column('uuid')
  primaryTenantId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'primaryTenantId' })
  primaryTenant: User;

  @ApiProperty()
  @Column('uuid', { nullable: true })
  agentId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'agentId' })
  agent: User;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
