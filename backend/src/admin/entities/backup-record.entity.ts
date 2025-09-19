import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('backup_records')
export class BackupRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', default: 'manual' })
  type: string;

  @Column({ type: 'varchar', default: 'pending' })
  status: string;

  @Column({ type: 'bigint', nullable: true })
  size?: number;

  @Column({ type: 'int', nullable: true })
  duration?: number;

  @Column({ type: 'varchar', length: 64, nullable: true })
  checksum?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  filePath?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  version?: string;

  @Column({ type: 'boolean', default: true })
  includeUserData: boolean;

  @Column({ type: 'boolean', default: true })
  includeSystemData: boolean;

  @Column({ type: 'boolean', default: false })
  includeFiles: boolean;

  @Column({ type: 'int', default: 6 })
  compressionLevel: number;

  @Column({ type: 'boolean', default: false })
  encryptionEnabled: boolean;

  @Column({ type: 'json', nullable: true })
  includedTables?: string[];

  @Column({ type: 'text', nullable: true })
  errorMessage?: string;

  @Column({ type: 'varchar', length: 255 })
  createdBy: string;

  @Column({ type: 'datetime', nullable: true })
  completedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
