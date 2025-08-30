import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsString, IsOptional, IsUUID, IsDateString, Min, IsArray, IsIn } from 'class-validator';
import { InvoiceType, InvoiceStatus } from '../entities/invoice.entity';

export class CreateInvoiceDto {
  @ApiProperty({ description: 'Invoice number', example: 'INV-2024-001' })
  @IsString()
  invoiceNumber: string;

  @ApiProperty({ description: 'Type of invoice', enum: InvoiceType, example: InvoiceType.RENT })
  @IsEnum(InvoiceType)
  type: InvoiceType;

  @ApiProperty({ description: 'Invoice status', enum: InvoiceStatus, example: InvoiceStatus.DRAFT, required: false })
  @IsOptional()
  @IsEnum(InvoiceStatus)
  status?: InvoiceStatus;

  @ApiProperty({ description: 'Invoice title', example: 'Monthly Rent Invoice - January 2024' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Invoice description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Subtotal amount in pence/cents', example: 150000 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  subtotal: number;

  @ApiProperty({ description: 'Tax amount in pence/cents', example: 30000, required: false })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  taxAmount?: number;

  @ApiProperty({ description: 'Tax rate as percentage', example: 20, required: false })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  taxRate?: number;

  @ApiProperty({ description: 'Total amount in pence/cents', example: 180000 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  totalAmount: number;

  @ApiProperty({ description: 'Paid amount in pence/cents', example: 0, required: false })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  paidAmount?: number;

  @ApiProperty({ description: 'Outstanding amount in pence/cents', example: 180000, required: false })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  outstandingAmount?: number;

  @ApiProperty({ description: 'Currency code', example: 'GBP', default: 'GBP' })
  @IsOptional()
  @IsString()
  @IsIn(['GBP', 'EUR'])
  currency?: string;

  @ApiProperty({ description: 'Invoice issue date' })
  @IsDateString()
  issueDate: string;

  @ApiProperty({ description: 'Invoice due date' })
  @IsDateString()
  dueDate: string;

  @ApiProperty({ description: 'Date when invoice was sent', required: false })
  @IsOptional()
  @IsDateString()
  sentAt?: string;

  @ApiProperty({ description: 'Date when invoice was viewed', required: false })
  @IsOptional()
  @IsDateString()
  viewedAt?: string;

  @ApiProperty({ description: 'Date when invoice was paid', required: false })
  @IsOptional()
  @IsDateString()
  paidAt?: string;

  @ApiProperty({ description: 'Billing address as JSON string', required: false })
  @IsOptional()
  @IsString()
  billingAddress?: string;

  @ApiProperty({ description: 'Additional notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'Invoice items as JSON string', required: false })
  @IsOptional()
  @IsString()
  items?: string;

  @ApiProperty({ description: 'Payment terms', example: 'Net 30', required: false })
  @IsOptional()
  @IsString()
  paymentTerms?: string;

  @ApiProperty({ description: 'Late fee amount in pence/cents', example: 5000, required: false })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  lateFee?: number;

  @ApiProperty({ description: 'PDF file URL', required: false })
  @IsOptional()
  @IsString()
  pdfUrl?: string;

  @ApiProperty({ description: 'User ID who created the invoice' })
  @IsUUID()
  createdBy: string;

  @ApiProperty({ description: 'User ID who the invoice is addressed to' })
  @IsUUID()
  invoiceTo: string;

  @ApiProperty({ description: 'Property ID associated with the invoice', required: false })
  @IsOptional()
  @IsUUID()
  propertyId?: string;

  @ApiProperty({ description: 'Metadata as JSON string', required: false })
  @IsOptional()
  @IsString()
  metadata?: string;
}