import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNumber, IsOptional, IsString, IsBoolean, IsEnum, IsDateString } from 'class-validator';
import { OfferType } from '../entities/property-offer.entity';

export class CreatePropertyOfferDto {
  @ApiProperty({ description: 'Property ID for the offer' })
  @IsUUID()
  propertyId: string;

  @ApiProperty({ description: 'Offer amount' })
  @IsNumber()
  offerAmount: number;

  @ApiProperty({ description: 'Type of offer', enum: OfferType, default: OfferType.PURCHASE })
  @IsOptional()
  @IsEnum(OfferType)
  offerType?: OfferType;

  @ApiProperty({ description: 'Message to accompany the offer', required: false })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiProperty({ description: 'Offer conditions as JSON string', required: false })
  @IsOptional()
  @IsString()
  conditions?: string;

  @ApiProperty({ description: 'Proposed completion date', required: false })
  @IsOptional()
  @IsDateString()
  proposedCompletionDate?: string;

  @ApiProperty({ description: 'Deposit amount', required: false })
  @IsOptional()
  @IsNumber()
  deposit?: number;

  @ApiProperty({ description: 'Whether this is a cash offer', required: false, default: false })
  @IsOptional()
  @IsBoolean()
  isCashOffer?: boolean;

  @ApiProperty({ description: 'Whether mortgage in principle is available', required: false })
  @IsOptional()
  @IsBoolean()
  mortgageInPrinciple?: boolean;

  @ApiProperty({ description: 'Offer expiry date', required: false })
  @IsOptional()
  @IsDateString()
  expiryDate?: string;
}
