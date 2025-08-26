import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { Conversation } from './conversation.entity';
import { MessageReaction } from './message-reaction.entity';
import { MessageAttachment } from './message-attachment.entity';

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  FILE = 'file',
  AUDIO = 'audio',
  VIDEO = 'video',
  LOCATION = 'location',
  PROPERTY = 'property',
  BOOKING = 'booking',
  SYSTEM = 'system',
  QUOTE = 'quote',
}

export enum MessageStatus {
  SENDING = 'sending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed',
}

@Entity('messages')
export class Message {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column('uuid')
  conversationId: string;

  @ManyToOne(() => Conversation, conversation => conversation.messages)
  @JoinColumn({ name: 'conversationId' })
  conversation: Conversation;

  @ApiProperty()
  @Column('uuid')
  senderId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'senderId' })
  sender: User;

  @ApiProperty({ enum: MessageType })
  @Column({
    type: 'varchar',
    default: MessageType.TEXT,
  })
  type: MessageType;

  @ApiProperty()
  @Column('text')
  content: string;

  @ApiProperty({ enum: MessageStatus })
  @Column({
    type: 'varchar',
    default: MessageStatus.SENT,
  })
  status: MessageStatus;

  @ApiProperty()
  @Column('uuid', { nullable: true })
  replyToId: string;

  @ManyToOne(() => Message, { nullable: true })
  @JoinColumn({ name: 'replyToId' })
  replyTo: Message;

  @ApiProperty()
  @Column('uuid', { nullable: true })
  forwardedFromId: string;

  @ManyToOne(() => Message, { nullable: true })
  @JoinColumn({ name: 'forwardedFromId' })
  forwardedFrom: Message;

  @OneToMany(() => MessageAttachment, attachment => attachment.message)
  attachments: MessageAttachment[];

  @OneToMany(() => MessageReaction, reaction => reaction.message)
  reactions: MessageReaction[];

  @ApiProperty()
  @Column({ default: false })
  isImportant: boolean;

  @ApiProperty()
  @Column({ default: false })
  isEdited: boolean;

  @ApiProperty()
  @Column('datetime', { nullable: true })
  editedAt: Date;

  @ApiProperty()
  @Column({ default: false })
  isDeleted: boolean;

  @ApiProperty()
  @Column('datetime', { nullable: true })
  deletedAt: Date;

  @ApiProperty()
  @Column('json', { nullable: true })
  readBy: { userId: string; readAt: Date }[];

  @ApiProperty()
  @Column('json', { nullable: true })
  deliveredTo: { userId: string; deliveredAt: Date }[];

  @ApiProperty()
  @Column('json', { nullable: true })
  metadata: any; // For location data, property info, booking details, etc.

  @ApiProperty()
  @Column('datetime', { nullable: true })
  scheduledAt: Date; // For scheduled messages

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
