import {
  IsString,
  IsOptional,
  IsEnum,
  IsUUID,
  IsNumber,
  IsBoolean,
  IsArray,
  ValidateNested,
  IsObject,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum VrTourType {
  FULL_PROPERTY = 'full_property',
  ROOM_SPECIFIC = 'room_specific',
  EXTERIOR_ONLY = 'exterior_only',
  NEIGHBORHOOD = 'neighborhood',
}

export enum VrQuality {
  STANDARD = 'standard',
  HIGH = 'high',
  ULTRA = 'ultra',
}

class HotspotDto {
  @IsString()
  id: string;

  @IsString()
  type: string; // 'info', 'navigation', 'media', 'link'

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  x: number; // position coordinates

  @IsNumber()
  y: number;

  @IsNumber()
  z: number;

  @IsOptional()
  @IsString()
  targetSceneId?: string;

  @IsOptional()
  @IsString()
  mediaUrl?: string;

  @IsOptional()
  @IsString()
  linkUrl?: string;

  @IsOptional()
  @IsObject()
  customData?: any;
}

class SceneDto {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsString()
  roomType: string;

  @IsString()
  imageUrl: string;

  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HotspotDto)
  hotspots?: HotspotDto[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(360)
  initialYaw?: number;

  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  initialPitch?: number;

  @IsOptional()
  @IsNumber()
  @Min(30)
  @Max(120)
  initialFov?: number;

  @IsOptional()
  @IsObject()
  metadata?: any;
}

class VrSettingsDto {
  @IsOptional()
  @IsBoolean()
  autoRotate?: boolean = false;

  @IsOptional()
  @IsNumber()
  @Min(0.1)
  @Max(5)
  autoRotateSpeed?: number = 1;

  @IsOptional()
  @IsBoolean()
  showCompass?: boolean = true;

  @IsOptional()
  @IsBoolean()
  showFullscreenButton?: boolean = true;

  @IsOptional()
  @IsBoolean()
  showVrButton?: boolean = true;

  @IsOptional()
  @IsBoolean()
  enableGyroscope?: boolean = true;

  @IsOptional()
  @IsBoolean()
  enableKeyboardControls?: boolean = true;

  @IsOptional()
  @IsBoolean()
  enableMouseControls?: boolean = true;

  @IsOptional()
  @IsString()
  backgroundColor?: string = '#000000';

  @IsOptional()
  @IsString()
  loadingScreenUrl?: string;
}

export class CreateVrTourDto {
  @IsUUID()
  propertyId: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(VrTourType)
  type: VrTourType;

  @IsOptional()
  @IsEnum(VrQuality)
  quality?: VrQuality = VrQuality.HIGH;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SceneDto)
  scenes: SceneDto[];

  @IsOptional()
  @IsString()
  startingSceneId?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => VrSettingsDto)
  settings?: VrSettingsDto;

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
  @IsObject()
  customData?: any;

  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @IsOptional()
  @IsBoolean()
  enableAnalytics?: boolean = true;

  @IsOptional()
  @IsBoolean()
  enableSharing?: boolean = true;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  accessPermissions?: string[];
}
