import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { Property } from '../../properties/entities/property.entity';

export enum CommunicationType {
  EMAIL = 'email',
  SMS = 'sms',
  PHONE = 'phone',
  IN_APP = 'in_app',
  WHATSAPP = 'whatsapp',
  VIDEO_CALL = 'video_call',
}

export enum CommunicationStatus {
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  REPLIED = 'replied',
  FAILED = 'failed',
}

export enum Priority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

@Entity('communications')
export class Communication {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ enum: CommunicationType })
  @Column({
    type: 'varchar',
    
  })
  type: CommunicationType;

  @ApiProperty({ enum: CommunicationStatus })
  @Column({
    type: 'varchar',
    
    default: CommunicationStatus.SENT,
  })
  status: CommunicationStatus;

  @ApiProperty()
  @Column('uuid')
  senderId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'senderId' })
  sender: User;

  @ApiProperty()
  @Column('uuid')
  recipientId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'recipientId' })
  recipient: User;

  @ApiProperty()
  @Column('uuid', { nullable: true })
  propertyId: string;

  @ManyToOne(() => Property, { nullable: true })
  @JoinColumn({ name: 'propertyId' })
  property: Property;

  @ApiProperty()
  @Column('varchar', { length: 255 })
  subject: string;

  @ApiProperty()
  @Column('text')
  message: string;

  @ApiProperty({ enum: Priority })
  @Column({
    type: 'varchar',
    
    default: Priority.NORMAL,
  })
  priority: Priority;

  @ApiProperty()
  @Column('datetime')
  sentAt: Date;

  @ApiProperty()
  @Column('datetime', { nullable: true })
  deliveredAt: Date;

  @ApiProperty()
  @Column('datetime', { nullable: true })
  readAt: Date;

  @ApiProperty()
  @Column('datetime', { nullable: true })
  repliedAt: Date;

  @ApiProperty()
  @Column('json', { nullable: true })
  attachments: any; // File attachments

  @ApiProperty()
  @Column('json', { nullable: true })
  metadata: any; // Additional metadata (tracking info, etc.)

  @ApiProperty()
  @Column('text', { nullable: true })
  templateId: string; // Reference to email/SMS template used

  @ApiProperty()
  @Column('json', { nullable: true })
  templateVariables: any; // Variables used in template

  @ApiProperty()
  @Column('text', { nullable: true })
  externalId: string; // ID from external service (email provider, SMS service)

  @ApiProperty()
  @Column('text', { nullable: true })
  errorMessage: string; // Error message if delivery failed

  @ApiProperty()
  @Column({ default: false })
  isAutomated: boolean; // Whether this was sent automatically

  @ApiProperty()
  @Column('text', { nullable: true })
  automationTrigger: string; // What triggered the automated message

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
