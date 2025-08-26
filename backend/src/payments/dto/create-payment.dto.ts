import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, IsDateString, IsBoolean, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentType, PaymentMethod } from '../entities/payment.entity';

export class CreatePaymentDto {
  @ApiProperty({ enum: PaymentType })
  @IsEnum(PaymentType)
  @IsNotEmpty()
  type: PaymentType;

  @ApiProperty({ enum: PaymentMethod })
  @IsEnum(PaymentMethod)
  @IsNotEmpty()
  method: PaymentMethod;

  @ApiProperty({ description: 'Payment amount' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @IsNotEmpty()
  amount: number;

  @ApiPropertyOptional({ description: 'Fee amount' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  feeAmount?: number;

  @ApiPropertyOptional({ description: 'Currency code', default: 'GBP' })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional({ description: 'Payment description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Payment due date' })
  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @ApiProperty({ description: 'Payer user ID' })
  @IsUUID()
  @IsNotEmpty()
  payerId: string;

  @ApiProperty({ description: 'Payee user ID' })
  @IsUUID()
  @IsNotEmpty()
  payeeId: string;

  @ApiPropertyOptional({ description: 'Property ID' })
  @IsUUID()
  @IsOptional()
  propertyId?: string;

  @ApiPropertyOptional({ description: 'Tenant ID' })
  @IsUUID()
  @IsOptional()
  tenantId?: string;

  @ApiPropertyOptional({ description: 'External transaction ID' })
  @IsString()
  @IsOptional()
  externalTransactionId?: string;

  @ApiPropertyOptional({ description: 'Payment details (card info, bank details, etc.)' })
  @IsOptional()
  paymentDetails?: any;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  metadata?: any;

  @ApiPropertyOptional({ description: 'Is this a recurring payment?' })
  @IsBoolean()
  @IsOptional()
  isRecurring?: boolean;

  @ApiPropertyOptional({ description: 'Recurring schedule (cron expression)' })
  @IsString()
  @IsOptional()
  recurringSchedule?: string;

  @ApiPropertyOptional({ description: 'Next payment date for recurring payments' })
  @IsDateString()
  @IsOptional()
  nextPaymentDate?: string;

  @ApiPropertyOptional({ description: 'Period start date (for rent payments)' })
  @IsDateString()
  @IsOptional()
  periodStart?: string;

  @ApiPropertyOptional({ description: 'Period end date (for rent payments)' })
  @IsDateString()
  @IsOptional()
  periodEnd?: string;

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsString()
  @IsOptional()
  notes?: string;
}