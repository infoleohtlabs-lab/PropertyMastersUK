import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsEnum, IsDateString } from 'class-validator';
import { OfferStatus } from '../entities/property-offer.entity';

export class UpdatePropertyOfferDto {
  @ApiProperty({ description: 'Offer status', enum: OfferStatus, required: false })
  @IsOptional()
  @IsEnum(OfferStatus)
  status?: OfferStatus;

  @ApiProperty({ description: 'Message to accompany the offer update', required: false })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiProperty({ description: 'Updated offer conditions as JSON string', required: false })
  @IsOptional()
  @IsString()
  conditions?: string;

  @ApiProperty({ description: 'Agent response to the offer', required: false })
  @IsOptional()
  @IsString()
  agentResponse?: string;

  @ApiProperty({ description: 'Counter offer amount', required: false })
  @IsOptional()
  @IsNumber()
  counterOfferAmount?: number;

  @ApiProperty({ description: 'Updated expiry date for the offer', required: false })
  @IsOptional()
  @IsDateString()
  expiryDate?: string;
}
