import { PartialType } from '@nestjs/swagger';
import { CreatePaymentDto } from './create-payment.dto';
import { IsEnum, IsOptional, IsNumber, IsString, IsDateString, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentStatus } from '../entities/payment.entity';

export class UpdatePaymentDto extends PartialType(CreatePaymentDto) {
  @ApiPropertyOptional({ enum: PaymentStatus })
  @IsEnum(PaymentStatus)
  @IsOptional()
  status?: PaymentStatus;

  @ApiPropertyOptional({ description: 'Date payment was made' })
  @IsDateString()
  @IsOptional()
  paidDate?: string;

  @ApiPropertyOptional({ description: 'Date payment was processed' })
  @IsDateString()
  @IsOptional()
  processedDate?: string;

  @ApiPropertyOptional({ description: 'Failure reason if payment failed' })
  @IsString()
  @IsOptional()
  failureReason?: string;

  @ApiPropertyOptional({ description: 'Number of retry attempts' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  retryCount?: number;

  @ApiPropertyOptional({ description: 'Last retry date' })
  @IsDateString()
  @IsOptional()
  lastRetryDate?: string;

  @ApiPropertyOptional({ description: 'Refunded amount' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  refundedAmount?: number;

  @ApiPropertyOptional({ description: 'Refund date' })
  @IsDateString()
  @IsOptional()
  refundedDate?: string;

  @ApiPropertyOptional({ description: 'Refund reason' })
  @IsString()
  @IsOptional()
  refundReason?: string;

  @ApiPropertyOptional({ description: 'Net amount (calculated)' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  netAmount?: number;
}
