import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum ImportStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

@Entity('import_history')
@Index(['dataType', 'importedAt'])
@Index(['status', 'importedAt'])
export class ImportHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  dataType: string;

  @Column({ type: 'varchar', length: 255 })
  source: string;

  @Column({ type: 'varchar', length: 255 })
  fileName: string;

  @Column({ type: 'int', default: 0 })
  recordsImported: number;

  @Column({ type: 'int', default: 0 })
  recordsFailed: number;

  @Column({ type: 'uuid' })
  importedBy: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'importedBy' })
  user: User;

  @CreateDateColumn()
  importedAt: Date;

  @Column({
    type: 'varchar',
    default: ImportStatus.PENDING,
  })
  status: ImportStatus;

  @Column({ type: 'json', nullable: true })
  errors: string[];

  @UpdateDateColumn()
  updatedAt: Date;
}
