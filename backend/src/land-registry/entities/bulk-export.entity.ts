import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('bulk_exports')
@Index(['userId', 'exportId'])
export class BulkExport {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column()
  userId: string;

  @ApiProperty()
  @Column({ unique: true })
  exportId: string;

  @ApiProperty()
  @Column('jsonb')
  searchCriteria: any;

  @ApiProperty()
  @Column()
  exportFormat: string;

  @ApiProperty()
  @Column({ default: 'pending' })
  status: 'pending' | 'processing' | 'completed' | 'failed';

  @ApiProperty({ required: false })
  @Column({ nullable: true })
  downloadUrl?: string;

  @ApiProperty({ required: false })
  @Column({ nullable: true })
  recordCount?: number;

  @ApiProperty({ required: false })
  @Column({ nullable: true })
  fileSize?: number;

  @ApiProperty({ required: false })
  @Column({ nullable: true })
  completedAt?: Date;

  @ApiProperty({ required: false })
  @Column({ nullable: true })
  expiresAt?: Date;

  @ApiProperty({ required: false })
  @Column({ nullable: true })
  errorMessage?: string;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}