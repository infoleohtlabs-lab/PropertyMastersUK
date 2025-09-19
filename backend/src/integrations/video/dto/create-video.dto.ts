import { IsString, IsEnum, IsOptional, IsArray, IsBoolean, IsInt, IsUrl, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VideoType, VideoQuality, VideoStatus } from '../entities/property-video.entity';

export class CreateVideoDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: VideoType })
  @IsEnum(VideoType)
  type: VideoType;

  @ApiPropertyOptional({ enum: VideoStatus })
  @IsOptional()
  @IsEnum(VideoStatus)
  status?: VideoStatus;

  @ApiProperty()
  @IsString()
  propertyId: string;

  @ApiProperty()
  @IsUrl()
  videoUrl: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  thumbnailUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  duration?: number;

  @ApiProperty({ enum: VideoQuality })
  @IsEnum(VideoQuality)
  quality: VideoQuality;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  fileSize?: number;

  @ApiPropertyOptional()
  @IsOptional()
  chapters?: any;

  @ApiPropertyOptional()
  @IsOptional()
  captions?: any;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  embedCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
