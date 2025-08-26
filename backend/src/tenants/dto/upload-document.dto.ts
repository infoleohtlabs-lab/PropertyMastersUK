import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsDateString, IsNumber, IsBoolean } from 'class-validator';
import { DocumentType } from '../entities/tenant-document.entity';

export class UploadDocumentDto {
  @ApiProperty({ enum: DocumentType })
  @IsEnum(DocumentType)
  type: DocumentType;

  @ApiProperty()
  @IsString()
  fileName: string;

  @ApiProperty()
  @IsString()
  originalName: string;

  @ApiProperty()
  @IsString()
  filePath: string;

  @ApiProperty()
  @IsString()
  mimeType: string;

  @ApiProperty()
  @IsNumber()
  fileSize: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  expiryDate?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  documentNumber?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  issueDate?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  issuingAuthority?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isConfidential?: boolean;
}