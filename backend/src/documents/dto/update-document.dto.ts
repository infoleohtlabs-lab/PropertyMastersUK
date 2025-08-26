import { PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsDateString, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateDocumentDto } from './create-document.dto';
import { DocumentStatus } from '../entities/document.entity';

export class UpdateDocumentDto extends PartialType(CreateDocumentDto) {
  @ApiPropertyOptional({ enum: DocumentStatus })
  @IsEnum(DocumentStatus)
  @IsOptional()
  status?: DocumentStatus;

  @ApiPropertyOptional({ description: 'Is document verified?' })
  @IsBoolean()
  @IsOptional()
  isVerified?: boolean;

  @ApiPropertyOptional({ description: 'User who verified the document' })
  @IsString()
  @IsOptional()
  verifiedBy?: string;

  @ApiPropertyOptional({ description: 'Date when document was verified' })
  @IsDateString()
  @IsOptional()
  verifiedAt?: string;

  @ApiPropertyOptional({ description: 'Download count' })
  @IsOptional()
  downloadCount?: number;

  @ApiPropertyOptional({ description: 'Last accessed date' })
  @IsDateString()
  @IsOptional()
  lastAccessedAt?: string;
}