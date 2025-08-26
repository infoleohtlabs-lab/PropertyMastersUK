import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, IsDateString, IsBoolean, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DocumentType, DocumentCategory } from '../entities/document.entity';

export class CreateDocumentDto {
  @ApiProperty({ description: 'Document name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Document description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: DocumentType })
  @IsEnum(DocumentType)
  @IsNotEmpty()
  type: DocumentType;

  @ApiProperty({ enum: DocumentCategory })
  @IsEnum(DocumentCategory)
  @IsNotEmpty()
  category: DocumentCategory;

  @ApiPropertyOptional({ description: 'Document version' })
  @IsString()
  @IsOptional()
  version?: string;

  @ApiPropertyOptional({ description: 'Document issue date' })
  @IsDateString()
  @IsOptional()
  issueDate?: string;

  @ApiPropertyOptional({ description: 'Document expiry date' })
  @IsDateString()
  @IsOptional()
  expiryDate?: string;

  @ApiPropertyOptional({ description: 'Reminder date for expiry' })
  @IsDateString()
  @IsOptional()
  reminderDate?: string;

  @ApiPropertyOptional({ description: 'Is document confidential?' })
  @IsBoolean()
  @IsOptional()
  isConfidential?: boolean;

  @ApiPropertyOptional({ description: 'Document tags' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  metadata?: any;

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ description: 'User who uploaded the document' })
  @IsUUID()
  @IsNotEmpty()
  uploadedById: string;

  @ApiPropertyOptional({ description: 'Related property ID' })
  @IsUUID()
  @IsOptional()
  propertyId?: string;

  @ApiPropertyOptional({ description: 'Related tenant ID' })
  @IsUUID()
  @IsOptional()
  tenantId?: string;

  @ApiPropertyOptional({ description: 'Related landlord ID' })
  @IsUUID()
  @IsOptional()
  landlordId?: string;

  @ApiPropertyOptional({ description: 'Parent document ID (for versions)' })
  @IsUUID()
  @IsOptional()
  parentDocumentId?: string;
}