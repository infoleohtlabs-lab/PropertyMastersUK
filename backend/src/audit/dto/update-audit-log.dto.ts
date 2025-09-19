import { PartialType } from '@nestjs/swagger';
import { IsOptional, IsString, IsDateString, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateAuditLogDto } from './create-audit-log.dto';

export class UpdateAuditLogDto extends PartialType(CreateAuditLogDto) {
  @ApiPropertyOptional({ description: 'User who reviewed this audit log' })
  @IsString()
  @IsOptional()
  reviewedBy?: string;

  @ApiPropertyOptional({ description: 'Date when this audit log was reviewed' })
  @IsDateString()
  @IsOptional()
  reviewedAt?: string;

  @ApiPropertyOptional({ description: 'Is this audit log archived?' })
  @IsBoolean()
  @IsOptional()
  isArchived?: boolean;

  @ApiPropertyOptional({ description: 'Retention period in days' })
  @IsOptional()
  retentionDays?: number;
}
