import { IsString, IsOptional, IsEnum, IsNumber, IsBoolean, IsArray, IsDateString, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod, PaymentType } from '../entities/rent-payment.entity';

export class RecordRentPaymentDto {
  @ApiProperty({ description: 'Tenancy agreement ID' })
  @IsString()
  tenancyId: string;

  @ApiProperty({ description: 'Payment amount', minimum: 0 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  amount: number;

  @ApiProperty({ description: 'Payment date' })
  @IsDateString()
  paymentDate: string;

  @ApiProperty({ enum: PaymentMethod, description: 'Payment method used' })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiProperty({ enum: PaymentType, description: 'Type of payment' })
  @IsEnum(PaymentType)
  paymentType: PaymentType;

  // Payment Period Information
  @ApiProperty({ description: 'Period start date this payment covers' })
  @IsDateString()
  periodStartDate: string;

  @ApiProperty({ description: 'Period end date this payment covers' })
  @IsDateString()
  periodEndDate: string;

  @ApiPropertyOptional({ description: 'Due date for this payment' })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  // Payment Processing Information
  @ApiPropertyOptional({ description: 'Transaction reference number' })
  @IsOptional()
  @IsString()
  transactionReference?: string;

  @ApiPropertyOptional({ description: 'Bank reference or sort code' })
  @IsOptional()
  @IsString()
  bankReference?: string;

  @ApiPropertyOptional({ description: 'Cheque number if payment by cheque' })
  @IsOptional()
  @IsString()
  chequeNumber?: string;

  @ApiPropertyOptional({ description: 'Date payment was processed' })
  @IsOptional()
  @IsDateString()
  processedDate?: string;

  @ApiPropertyOptional({ description: 'Date payment cleared' })
  @IsOptional()
  @IsDateString()
  clearedDate?: string;

  // Late Payment Information
  @ApiPropertyOptional({ description: 'Number of days late', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  daysLate?: number;

  @ApiPropertyOptional({ description: 'Late payment fee charged', minimum: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  lateFee?: number;

  @ApiPropertyOptional({ description: 'Interest charged on late payment', minimum: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  interestCharged?: number;

  // Partial Payment Information
  @ApiPropertyOptional({ description: 'Whether this is a partial payment' })
  @IsOptional()
  @IsBoolean()
  isPartialPayment?: boolean;

  @ApiPropertyOptional({ description: 'Outstanding amount after this payment', minimum: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  outstandingAmount?: number;

  @ApiPropertyOptional({ description: 'Expected date for remaining payment' })
  @IsOptional()
  @IsDateString()
  expectedRemainingPaymentDate?: string;

  // Recurring Payment Information
  @ApiPropertyOptional({ description: 'Whether this is a recurring payment' })
  @IsOptional()
  @IsBoolean()
  isRecurringPayment?: boolean;

  @ApiPropertyOptional({ description: 'Recurring payment ID' })
  @IsOptional()
  @IsString()
  recurringPaymentId?: string;

  @ApiPropertyOptional({ description: 'Next expected payment date' })
  @IsOptional()
  @IsDateString()
  nextPaymentDate?: string;

  // Refund Information
  @ApiPropertyOptional({ description: 'Whether this payment is a refund' })
  @IsOptional()
  @IsBoolean()
  isRefund?: boolean;

  @ApiPropertyOptional({ description: 'Original payment ID being refunded' })
  @IsOptional()
  @IsString()
  originalPaymentId?: string;

  @ApiPropertyOptional({ description: 'Reason for refund' })
  @IsOptional()
  @IsString()
  refundReason?: string;

  @ApiPropertyOptional({ description: 'Refund processed date' })
  @IsOptional()
  @IsDateString()
  refundProcessedDate?: string;

  // Communication
  @ApiPropertyOptional({ description: 'Whether payment confirmation was sent' })
  @IsOptional()
  @IsBoolean()
  confirmationSent?: boolean;

  @ApiPropertyOptional({ description: 'Date confirmation was sent' })
  @IsOptional()
  @IsDateString()
  confirmationSentDate?: string;

  @ApiPropertyOptional({ description: 'Whether receipt was requested' })
  @IsOptional()
  @IsBoolean()
  receiptRequested?: boolean;

  @ApiPropertyOptional({ description: 'Receipt sent date' })
  @IsOptional()
  @IsDateString()
  receiptSentDate?: string;

  // Dispute Information
  @ApiPropertyOptional({ description: 'Whether payment is disputed' })
  @IsOptional()
  @IsBoolean()
  isDisputed?: boolean;

  @ApiPropertyOptional({ description: 'Dispute reason' })
  @IsOptional()
  @IsString()
  disputeReason?: string;

  @ApiPropertyOptional({ description: 'Date dispute was raised' })
  @IsOptional()
  @IsDateString()
  disputeDate?: string;

  @ApiPropertyOptional({ description: 'Dispute resolution date' })
  @IsOptional()
  @IsDateString()
  disputeResolutionDate?: string;

  @ApiPropertyOptional({ description: 'Dispute resolution outcome' })
  @IsOptional()
  @IsString()
  disputeResolution?: string;

  // Fees and Charges
  @ApiPropertyOptional({ description: 'Processing fee charged', minimum: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  processingFee?: number;

  @ApiPropertyOptional({ description: 'Service charge included', minimum: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  serviceCharge?: number;

  @ApiPropertyOptional({ description: 'Admin fee charged', minimum: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  adminFee?: number;

  @ApiPropertyOptional({ description: 'Other fees charged', minimum: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  otherFees?: number;

  @ApiPropertyOptional({ description: 'Description of other fees' })
  @IsOptional()
  @IsString()
  otherFeesDescription?: string;

  // Allocation
  @ApiPropertyOptional({ description: 'Amount allocated to rent', minimum: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  rentAllocation?: number;

  @ApiPropertyOptional({ description: 'Amount allocated to service charges', minimum: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  serviceChargeAllocation?: number;

  @ApiPropertyOptional({ description: 'Amount allocated to utilities', minimum: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  utilitiesAllocation?: number;

  @ApiPropertyOptional({ description: 'Amount allocated to arrears', minimum: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  arrearsAllocation?: number;

  @ApiPropertyOptional({ description: 'Amount allocated to fees', minimum: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  feesAllocation?: number;

  @ApiPropertyOptional({ description: 'Amount allocated to other charges', minimum: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  otherAllocation?: number;

  // Metadata
  @ApiPropertyOptional({ description: 'Source system or application' })
  @IsOptional()
  @IsString()
  sourceSystem?: string;

  @ApiPropertyOptional({ description: 'User who recorded the payment' })
  @IsOptional()
  @IsString()
  recordedBy?: string;

  @ApiPropertyOptional({ description: 'Date payment was recorded' })
  @IsOptional()
  @IsDateString()
  recordedDate?: string;

  @ApiPropertyOptional({ description: 'Whether payment was automatically recorded' })
  @IsOptional()
  @IsBoolean()
  autoRecorded?: boolean;

  @ApiPropertyOptional({ description: 'Integration reference ID' })
  @IsOptional()
  @IsString()
  integrationReference?: string;

  @ApiPropertyOptional({ description: 'External system reference' })
  @IsOptional()
  @IsString()
  externalReference?: string;

  @ApiPropertyOptional({ description: 'Additional metadata', type: 'object' })
  @IsOptional()
  additionalMetadata?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Payment notes or comments' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Internal notes (not visible to tenant)' })
  @IsOptional()
  @IsString()
  internalNotes?: string;

  @ApiPropertyOptional({ description: 'Attachments or supporting documents', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[];
}