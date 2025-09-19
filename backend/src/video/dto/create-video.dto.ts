import {
  IsString,
  IsOptional,
  IsEnum,
  IsUUID,
  IsNumber,
  IsBoolean,
  IsArray,
  ValidateNested,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum VideoType {
  PROPERTY_TOUR = 'property_tour',
  ROOM_SHOWCASE = 'room_showcase',
  NEIGHBORHOOD = 'neighborhood',
  AGENT_INTRODUCTION = 'agent_introduction',
  TESTIMONIAL = 'testimonial',
  PROMOTIONAL = 'promotional',
}

export enum VideoQuality {
  HD_720P = '720p',
  FULL_HD_1080P = '1080p',
  UHD_4K = '4k',
}

class VideoMetadataDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  duration?: number; // in seconds

  @IsOptional()
  @IsString()
  resolution?: string;

  @IsOptional()
  @IsNumber()
  fileSize?: number; // in bytes

  @IsOptional()
  @IsString()
  format?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(60)
  frameRate?: number;

  @IsOptional()
  @IsString()
  codec?: string;
}

class VideoSettingsDto {
  @IsOptional()
  @IsBoolean()
  autoplay?: boolean = false;

  @IsOptional()
  @IsBoolean()
  showControls?: boolean = true;

  @IsOptional()
  @IsBoolean()
  allowDownload?: boolean = false;

  @IsOptional()
  @IsBoolean()
  enableComments?: boolean = true;

  @IsOptional()
  @IsBoolean()
  enableSharing?: boolean = true;

  @IsOptional()
  @IsString()
  watermarkText?: string;

  @IsOptional()
  @IsString()
  thumbnailUrl?: string;
}

export class CreateVideoDto {
  @IsUUID()
  propertyId: string;

  @IsString()
  uploadedBy: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(VideoType)
  type: VideoType;

  @IsOptional()
  @IsEnum(VideoQuality)
  quality?: VideoQuality = VideoQuality.FULL_HD_1080P;

  @IsOptional()
  @IsString()
  videoUrl?: string;

  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => VideoMetadataDto)
  metadata?: VideoMetadataDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => VideoSettingsDto)
  settings?: VideoSettingsDto;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean = true;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean = false;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  priority?: number = 5;

  @IsOptional()
  @IsString()
  language?: string = 'en';

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  subtitleLanguages?: string[];
}
