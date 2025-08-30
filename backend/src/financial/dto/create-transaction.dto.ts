import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsString, IsOptional, IsUUID, IsDateString, Min, IsIn } from 'class-validator';
import { TransactionType, TransactionStatus, PaymentMethod } from '../entities/transaction.entity';

export class CreateTransactionDto {
  @ApiProperty({ description: 'Reference number for the transaction', example: 'TXN-2024-001' })
  @IsString()
  reference: string;

  @ApiProperty({ description: 'Type of transaction', enum: TransactionType, example: TransactionType.RENT_PAYMENT })
  @IsEnum(TransactionType)
  type: TransactionType;

  @ApiProperty({ description: 'Transaction amount in pence/cents', example: 150000 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  amount: number;

  @ApiProperty({ description: 'Currency code', example: 'GBP', default: 'GBP' })
  @IsOptional()
  @IsString()
  @IsIn(['GBP', 'EUR'])
  currency?: string;

  @ApiProperty({ description: 'Transaction status', enum: TransactionStatus, example: TransactionStatus.PENDING, required: false })
  @IsOptional()
  @IsEnum(TransactionStatus)
  status?: TransactionStatus;

  @ApiProperty({ description: 'Payment method used', enum: PaymentMethod, example: PaymentMethod.BANK_TRANSFER })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiProperty({ description: 'Description of the transaction', example: 'Monthly rent payment for January 2024', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Additional notes about the transaction', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'External transaction ID from payment provider', required: false })
  @IsOptional()
  @IsString()
  externalTransactionId?: string;

  @ApiProperty({ description: 'Date when the transaction was processed', required: false })
  @IsOptional()
  @IsDateString()
  processedAt?: string;

  @ApiProperty({ description: 'Date when the transaction failed (if applicable)', required: false })
  @IsOptional()
  @IsDateString()
  failedAt?: string;

  @ApiProperty({ description: 'Reason for failure (if applicable)', required: false })
  @IsOptional()
  @IsString()
  failureReason?: string;

  @ApiProperty({ description: 'Receipt URL or file path', required: false })
  @IsOptional()
  @IsString()
  receiptUrl?: string;

  @ApiProperty({ description: 'User ID who initiated the transaction', required: false })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiProperty({ description: 'Property ID associated with the transaction', required: false })
  @IsOptional()
  @IsUUID()
  propertyId?: string;

  @ApiProperty({ description: 'Related transaction ID (for refunds, etc.)', required: false })
  @IsOptional()
  @IsUUID()
  relatedTransactionId?: string;

  @ApiProperty({ description: 'Metadata as JSON string', required: false })
  @IsOptional()
  @IsString()
  metadata?: string;
}