import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable, OneToMany, ManyToOne } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { Property } from '../../properties/entities/property.entity';
import { Message } from './message.entity';

export enum ConversationType {
  DIRECT = 'direct',
  GROUP = 'group',
  PROPERTY_INQUIRY = 'property_inquiry',
  MAINTENANCE = 'maintenance',
  SUPPORT = 'support',
}

@Entity('conversations')
export class Conversation {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ enum: ConversationType })
  @Column({
    type: 'varchar',
    default: ConversationType.DIRECT,
  })
  type: ConversationType;

  @ApiProperty()
  @Column('varchar', { length: 255, nullable: true })
  title: string;

  @ApiProperty()
  @Column('text', { nullable: true })
  description: string;

  @ApiProperty()
  @Column('varchar', { length: 500, nullable: true })
  avatar: string;

  @ApiProperty()
  @Column('uuid', { nullable: true })
  propertyId: string;

  @ManyToOne(() => Property, { nullable: true })
  property: Property;

  @ApiProperty()
  @Column('uuid')
  createdBy: string;

  @ManyToOne(() => User)
  creator: User;

  @ManyToMany(() => User, { cascade: true })
  @JoinTable({
    name: 'conversation_participants',
    joinColumn: { name: 'conversationId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'userId', referencedColumnName: 'id' },
  })
  participants: User[];

  @OneToMany(() => Message, message => message.conversation)
  messages: Message[];

  @ApiProperty()
  @Column('uuid', { nullable: true })
  lastMessageId: string;

  @ManyToOne(() => Message, { nullable: true })
  lastMessage: Message;

  @ApiProperty()
  @Column('datetime', { nullable: true })
  lastActivityAt: Date;

  @ApiProperty()
  @Column({ default: false })
  isArchived: boolean;

  @ApiProperty()
  @Column({ default: false })
  isMuted: boolean;

  @ApiProperty()
  @Column({ default: false })
  isPinned: boolean;

  @ApiProperty()
  @Column('json', { nullable: true })
  tags: string[];

  @ApiProperty()
  @Column('json', { nullable: true })
  metadata: any;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
