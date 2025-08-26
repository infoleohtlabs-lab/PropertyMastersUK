import { PartialType } from '@nestjs/swagger';
import { IsOptional, IsDateString, IsString, IsEnum } from 'class-validator';
import { CreateConsentDto } from './create-consent.dto';
import { ConsentStatus } from '../entities/data-consent.entity';

export class UpdateConsentDto extends PartialType(CreateConsentDto) {
  @IsOptional()
  @IsEnum(ConsentStatus)
  consentStatus?: ConsentStatus;

  @IsOptional()
  @IsDateString()
  withdrawalDate?: Date;

  @IsOptional()
  @IsString()
  withdrawalReason?: string;
}