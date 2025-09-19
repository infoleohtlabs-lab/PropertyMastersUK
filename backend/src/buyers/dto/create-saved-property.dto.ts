import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsOptional, IsString, IsBoolean, IsNumber, IsEnum } from 'class-validator';

export class CreateSavedPropertyDto {
  @ApiProperty({ description: 'Property ID to save' })
  @IsUUID()
  propertyId: string;

  @ApiProperty({ description: 'Personal notes about the property', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'Tags for categorizing the property', required: false })
  @IsOptional()
  @IsString()
  tags?: string;

  @ApiProperty({ description: 'Maximum budget for this property', required: false })
  @IsOptional()
  @IsNumber()
  maxBudget?: number;

  @ApiProperty({ description: 'Priority level', enum: ['low', 'medium', 'high'], required: false })
  @IsOptional()
  @IsEnum(['low', 'medium', 'high'])
  priority?: 'low' | 'medium' | 'high';

  @ApiProperty({ description: 'Whether the saved property is active', required: false, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
