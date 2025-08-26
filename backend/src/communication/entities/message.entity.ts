import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { Property } from '../../properties/entities/property.entity';

export enum MessageType {
  TEXT = 'text',
  EMAIL = 'email',
  SMS = 'sms',
  SYSTEM = 'system',
  NOTIFICATION = 'notification',
}

export enum MessageStatus {
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed',
  PENDING = 'pending',
}

export enum MessagePriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum ConversationType {
  PROPERTY_INQUIRY = 'property_inquiry',
  BOOKING = 'booking',
  MAINTENANCE = 'maintenance',
  TENANCY = 'tenancy',
  GENERAL = 'general',
  SUPPORT = 'support',
}

@Entity('messages')
export class Message {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column()
  subject: string;

  @ApiProperty()
  @Column('text')
  content: string;

  @ApiProperty({ enum: MessageType })
  @Column({
    type: 'varchar',
    
    default: MessageType.TEXT,
  })
  type: MessageType;

  @ApiProperty({ enum: MessageStatus })
  @Column({
    type: 'varchar',
    
    default: MessageStatus.SENT,
  })
  status: MessageStatus;

  @ApiProperty({ enum: MessagePriority })
  @Column({
    type: 'varchar',
    
    default: MessagePriority.NORMAL,
  })
  priority: MessagePriority;

  @ApiProperty({ enum: ConversationType })
  @Column({
    type: 'varchar',
    
    default: ConversationType.GENERAL,
  })
  conversationType: ConversationType;

  @ApiProperty()
  @Column({ nullable: true })
  conversationId: string; // Group related messages

  @ApiProperty()
  @Column({ nullable: true })
  parentMessageId: string; // For replies

  @ApiProperty()
  @Column('simple-array', { nullable: true })
  attachments: string[]; // File paths/URLs

  @ApiProperty()
  @Column({ nullable: true })
  readAt: Date;

  @ApiProperty()
  @Column({ nullable: true })
  deliveredAt: Date;

  @ApiProperty()
  @Column({ default: false })
  isArchived: boolean;

  @ApiProperty()
  @Column({ default: false })
  isStarred: boolean;

  @ApiProperty()
  @Column({ default: false })
  isDeleted: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  scheduledSendTime: Date;

  @ApiProperty()
  @Column('json', { nullable: true })
  metadata: any; // Additional data like email headers, SMS details, etc.

  // Relationships
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
  propertyId: string; // If message is related to a property

  @ManyToOne(() => Property)
  @JoinColumn({ name: 'propertyId' })
  property: Property;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
