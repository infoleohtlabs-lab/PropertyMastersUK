import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum UserRole {
  ADMIN = 'admin',
  AGENT = 'agent',
  LANDLORD = 'landlord',
  TENANT = 'tenant',
  BUYER = 'buyer',
  SELLER = 'seller',
  SOLICITOR = 'solicitor',
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
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
