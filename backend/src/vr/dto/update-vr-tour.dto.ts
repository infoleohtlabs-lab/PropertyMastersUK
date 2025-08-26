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
import { CreateVrTourDto } from './create-vr-tour.dto';

export enum VrTourStatus {
  UPLOADING = 'uploading',
  PROCESSING = 'processing',
  READY = 'ready',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
  FAILED = 'failed',
}

export class UpdateVrTourDto extends PartialType(CreateVrTourDto) {
  @IsOptional()
  @IsEnum(VrTourStatus)
  status?: VrTourStatus;

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
  publishedAt?: string;

  @IsOptional()
  @IsDateString()
  archivedAt?: string;

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
  @IsBoolean()
  isProcessed?: boolean;

  @IsOptional()
  @IsString()
  lastViewedAt?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  totalViewTime?: number; // in seconds

  @IsOptional()
  @IsNumber()
  @Min(0)
  uniqueViewers?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  completionRate?: number; // percentage

  @IsOptional()
  @IsNumber()
  @Min(0)
  averageViewDuration?: number; // in seconds

  @IsOptional()
  @IsNumber()
  @Min(0)
  hotspotInteractions?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  sceneTransitions?: number;

  @IsOptional()
  @IsString()
  mostViewedScene?: string;

  @IsOptional()
  @IsString()
  popularHotspot?: string;

  @IsOptional()
  @IsBoolean()
  hasVrSupport?: boolean;

  @IsOptional()
  @IsBoolean()
  isMobileOptimized?: boolean;

  @IsOptional()
  @IsString()
  embedCode?: string;

  @IsOptional()
  @IsString()
  shareUrl?: string;
}