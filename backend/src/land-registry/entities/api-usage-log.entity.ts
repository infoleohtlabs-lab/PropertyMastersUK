import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('api_usage_logs')
@Index(['userId'])
@Index(['endpoint'])
@Index(['createdAt'])
export class ApiUsageLog {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column('uuid', { nullable: true })
  userId: string;

  @ApiProperty()
  @Column()
  endpoint: string;

  @ApiProperty()
  @Column()
  method: string;

  @ApiProperty()
  @Column()
  responseStatus: number;

  @ApiProperty()
  @Column()
  responseTimeMs: number;

  @ApiProperty()
  @Column({ type: 'json', nullable: true })
  requestData: any;

  @ApiProperty()
  @Column({ type: 'json', nullable: true })
  responseData: any;

  @ApiProperty()
  @Column({ nullable: true })
  userAgent: string;

  @ApiProperty()
  @Column({ nullable: true })
  ipAddress: string;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;
}
