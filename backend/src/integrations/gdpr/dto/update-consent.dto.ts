import { PartialType } from '@nestjs/swagger';
import { CreateConsentDto } from './create-consent.dto';
import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateConsentDto extends PartialType(CreateConsentDto) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  withdrawalReason?: string;
}
