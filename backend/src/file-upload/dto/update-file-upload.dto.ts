import { PartialType } from '@nestjs/swagger';
import { CreateFileUploadDto } from './create-file-upload.dto';
import { IsOptional, IsEnum, IsNumber, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { FileStatus } from '../entities/file-upload.entity';

export class UpdateFileUploadDto extends PartialType(CreateFileUploadDto) {
  @ApiPropertyOptional({ enum: FileStatus })
  @IsOptional()
  @IsEnum(FileStatus)
  status?: FileStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  downloadCount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  lastAccessedAt?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  processingResults?: any;
}
