import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Message } from './message.entity';

export enum AttachmentType {
  IMAGE = 'image',
  DOCUMENT = 'document',
  AUDIO = 'audio',
  VIDEO = 'video',
  ARCHIVE = 'archive',
  OTHER = 'other',
}

@Entity('message_attachments')
export class MessageAttachment {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column('uuid')
  messageId: string;

  @ManyToOne(() => Message, message => message.attachments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'messageId' })
  message: Message;

  @ApiProperty()
  @Column('varchar', { length: 255 })
  fileName: string;

  @ApiProperty()
  @Column('varchar', { length: 255 })
  originalName: string;

  @ApiProperty({ enum: AttachmentType })
  @Column({
    type: 'varchar',
  })
  type: AttachmentType;

  @ApiProperty()
  @Column('varchar', { length: 100 })
  mimeType: string;

  @ApiProperty()
  @Column('bigint')
  size: number;

  @ApiProperty()
  @Column('varchar', { length: 500 })
  url: string;

  @ApiProperty()
  @Column('varchar', { length: 500, nullable: true })
  thumbnailUrl: string;

  @ApiProperty()
  @Column('int', { nullable: true })
  width: number;

  @ApiProperty()
  @Column('int', { nullable: true })
  height: number;

  @ApiProperty()
  @Column('int', { nullable: true })
  duration: number; // For audio/video files in seconds

  @ApiProperty()
  @Column('json', { nullable: true })
  metadata: any; // Additional file metadata

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;
}
