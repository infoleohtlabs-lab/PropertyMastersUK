import { PartialType } from '@nestjs/swagger';
import { CreateNotificationDto } from './create-notification.dto';
import { IsOptional, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateNotificationDto extends PartialType(CreateNotificationDto) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  readAt?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  sentAt?: Date;
}
