import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsEnum, IsDateString, IsUUID, Min } from 'class-validator';
import { PaymentStatus, PaymentMethod } from '../entities/rent-payment.entity';

export class CreateRentPaymentDto {
  @ApiProperty({ description: 'Tenancy ID' })
  @IsUUID()
  tenancyId: string;

  @ApiProperty({ description: 'Payment amount' })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ description: 'Payment due date' })
  @IsDateString()
  dueDate: string;

  @ApiProperty({ description: 'Payment date', required: false })
  @IsDateString()
  @IsOptional()
  paymentDate?: string;

  @ApiProperty({ enum: PaymentMethod, description: 'Payment method' })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiProperty({ enum: PaymentStatus, description: 'Payment status', default: PaymentStatus.PENDING })
  @IsEnum(PaymentStatus)
  @IsOptional()
  status?: PaymentStatus;

  @ApiProperty({ description: 'Payment reference number', required: false })
  @IsString()
  @IsOptional()
  reference?: string;

  @ApiProperty({ description: 'Late fee amount', required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  lateFee?: number;

  @ApiProperty({ description: 'Payment notes', required: false })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ description: 'Transaction ID from payment processor', required: false })
  @IsString()
  @IsOptional()
  transactionId?: string;

  @ApiProperty({ description: 'Receipt URL', required: false })
  @IsString()
  @IsOptional()
  receiptUrl?: string;
}