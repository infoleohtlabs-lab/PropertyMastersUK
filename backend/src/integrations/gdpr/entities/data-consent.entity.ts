import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum ConsentType {
  MARKETING_EMAILS = 'marketing_emails',
  MARKETING_SMS = 'marketing_sms',
  MARKETING_PHONE = 'marketing_phone',
  ANALYTICS = 'analytics',
  COOKIES_FUNCTIONAL = 'cookies_functional',
  COOKIES_ANALYTICS = 'cookies_analytics',
  COOKIES_MARKETING = 'cookies_marketing',
  DATA_PROCESSING = 'data_processing',
  DATA_SHARING = 'data_sharing',
  THIRD_PARTY_SERVICES = 'third_party_services',
}

export enum ConsentStatus {
  ACTIVE = 'active',
  WITHDRAWN = 'withdrawn',
  EXPIRED = 'expired',
}

@Entity('data_consents')
export class DataConsent {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column('uuid')
  userId: string;

  @ApiProperty({ enum: ConsentType })
  @Column({
    type: 'varchar',
    
  })
  consentType: ConsentType;

  @ApiProperty()
  @Column({ default: false })
  granted: boolean;

  @ApiProperty({ enum: ConsentStatus })
  @Column({
    type: 'varchar',
    
    default: ConsentStatus.ACTIVE,
  })
  status: ConsentStatus;

  @ApiProperty()
  @Column('datetime')
  consentDate: Date;

  @ApiProperty()
  @Column('datetime', { nullable: true })
  withdrawalDate: Date;

  @ApiProperty()
  @Column('datetime', { nullable: true })
  expiryDate: Date;

  @ApiProperty()
  @Column('datetime')
  lastUpdated: Date;

  @ApiProperty()
  @Column('text', { nullable: true })
  consentMethod: string; // How consent was obtained (web form, email, etc.)

  @ApiProperty()
  @Column('text', { nullable: true })
  ipAddress: string; // IP address when consent was given

  @ApiProperty()
  @Column('text', { nullable: true })
  userAgent: string; // Browser/device info when consent was given

  @ApiProperty()
  @Column('text', { nullable: true })
  consentVersion: string; // Version of consent terms

  @ApiProperty()
  @Column('json', { nullable: true })
  metadata: any; // Additional metadata about the consent

  @ApiProperty()
  @Column('text', { nullable: true })
  withdrawalReason: string; // Reason for withdrawal if applicable

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
