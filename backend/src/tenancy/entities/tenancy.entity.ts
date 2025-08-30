import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { Property } from '../../properties/entities/property.entity';
import { RentPayment } from './rent-payment.entity';
import { LeaseAgreement } from './lease-agreement.entity';

export enum TenancyStatus {
  ACTIVE = 'active',
  PENDING = 'pending',
  EXPIRED = 'expired',
  TERMINATED = 'terminated',
  NOTICE_GIVEN = 'notice_given',
  RENEWED = 'renewed',
}

export enum TenancyType {
  ASSURED_SHORTHOLD = 'assured_shorthold',
  ASSURED = 'assured',
  REGULATED = 'regulated',
  COMPANY_LET = 'company_let',
  STUDENT = 'student',
  HOLIDAY_LET = 'holiday_let',
}

@Entity('tenancies')
export class Tenancy {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column('uuid')
  propertyId: string;

  @ManyToOne(() => Property)
  @JoinColumn({ name: 'propertyId' })
  property: Property;

  @ApiProperty()
  @Column('uuid')
  tenantId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'tenantId' })
  tenant: User;

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

  @ApiProperty({ enum: TenancyStatus })
  @Column({
    type: 'varchar',
    default: TenancyStatus.PENDING,
  })
  status: TenancyStatus;

  @ApiProperty({ enum: TenancyType })
  @Column({
    type: 'varchar',
    default: TenancyType.ASSURED_SHORTHOLD,
  })
  type: TenancyType;

  @ApiProperty()
  @Column()
  startDate: Date;

  @ApiProperty()
  @Column()
  endDate: Date;

  @ApiProperty()
  @Column('decimal', { precision: 10, scale: 2 })
  monthlyRent: number;

  @ApiProperty()
  @Column('decimal', { precision: 10, scale: 2 })
  deposit: number;

  @ApiProperty()
  @Column({ default: 1 })
  rentDueDay: number;

  @ApiProperty()
  @Column({ nullable: true })
  rentFrequency: string;

  @ApiProperty()
  @Column('text', { nullable: true })
  terms: string;

  @ApiProperty()
  @Column('text', { nullable: true })
  specialConditions: string;

  @ApiProperty()
  @Column({ default: false })
  petsAllowed: boolean;

  @ApiProperty()
  @Column({ default: false })
  smokingAllowed: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  maxOccupants: number;

  @ApiProperty()
  @Column('decimal', { precision: 8, scale: 2, nullable: true })
  serviceCharge: number;

  @ApiProperty()
  @Column('decimal', { precision: 8, scale: 2, nullable: true })
  councilTax: number;

  @ApiProperty()
  @Column('decimal', { precision: 8, scale: 2, nullable: true })
  utilities: number;

  @ApiProperty()
  @Column({ nullable: true })
  noticeDate: Date;

  @ApiProperty()
  @Column({ nullable: true })
  noticePeriod: number;

  @ApiProperty()
  @Column('text', { nullable: true })
  terminationReason: string;

  @ApiProperty()
  @Column({ default: false })
  depositProtected: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  depositScheme: string;

  @ApiProperty()
  @Column({ nullable: true })
  depositReference: string;

  @ApiProperty()
  @Column('simple-array', { nullable: true })
  documents: string[];

  @OneToMany(() => RentPayment, rentPayment => rentPayment.tenancy)
  rentPayments: RentPayment[];

  @OneToMany(() => LeaseAgreement, leaseAgreement => leaseAgreement.tenancy)
  leaseAgreements: LeaseAgreement[];

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}