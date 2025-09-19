import { PartialType } from '@nestjs/mapped-types';
import {
  IsOptional,
  IsEnum,
  IsString,
  IsNumber,
  IsBoolean,
  IsDateString,
  Min,
  Max,
} from 'class-validator';
import { CreateVideoDto } from './create-video.dto';

export enum VideoStatus {
  UPLOADING = 'uploading',
  PROCESSING = 'processing',
  READY = 'ready',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
  FAILED = 'failed',
}

export class UpdateVideoDto extends PartialType(CreateVideoDto) {
  @IsOptional()
  @IsEnum(VideoStatus)
  status?: VideoStatus;

  @IsOptional()
  @IsNumber()
  @Min(0)
  viewCount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  likeCount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  shareCount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  averageRating?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  totalRatings?: number;

  @IsOptional()
  @IsDateString()
  publishedAt?: Date;

  @IsOptional()
  @IsDateString()
  archivedAt?: Date;

  @IsOptional()
  @IsString()
  processingStatus?: string;

  @IsOptional()
  @IsString()
  errorMessage?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  processingProgress?: number;

  @IsOptional()
  @IsString()
  streamingUrl?: string;

  @IsOptional()
  @IsString()
  downloadUrl?: string;

  @IsOptional()
  @IsBoolean()
  isProcessed?: boolean;

  @IsOptional()
  @IsBoolean()
  hasSubtitles?: boolean;

  @IsOptional()
  @IsDateString()
  lastViewedAt?: Date;

  @IsOptional()
  @IsNumber()
  @Min(0)
  totalWatchTime?: number; // in seconds

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  completionRate?: number; // percentage
}
