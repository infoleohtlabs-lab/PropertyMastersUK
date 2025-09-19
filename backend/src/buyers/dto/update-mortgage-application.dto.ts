import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsEnum, IsDateString } from 'class-validator';
import { ApplicationStatus, MortgageType } from '../entities/mortgage-application.entity';

export class UpdateMortgageApplicationDto {
  @ApiProperty({ description: 'Application status', enum: ApplicationStatus, required: false })
  @IsOptional()
  @IsEnum(ApplicationStatus)
  status?: ApplicationStatus;

  @ApiProperty({ description: 'Lender name', required: false })
  @IsOptional()
  @IsString()
  lenderName?: string;

  @ApiProperty({ description: 'Loan amount', required: false })
  @IsOptional()
  @IsNumber()
  loanAmount?: number;

  @ApiProperty({ description: 'Property value', required: false })
  @IsOptional()
  @IsNumber()
  propertyValue?: number;

  @ApiProperty({ description: 'Interest rate', required: false })
  @IsOptional()
  @IsNumber()
  interestRate?: number;

  @ApiProperty({ description: 'Mortgage type', enum: MortgageType, required: false })
  @IsOptional()
  @IsEnum(MortgageType)
  mortgageType?: MortgageType;

  @ApiProperty({ description: 'Term in years', required: false })
  @IsOptional()
  @IsNumber()
  termYears?: number;

  @ApiProperty({ description: 'Monthly payment', required: false })
  @IsOptional()
  @IsNumber()
  monthlyPayment?: number;

  @ApiProperty({ description: 'Application reference', required: false })
  @IsOptional()
  @IsString()
  applicationReference?: string;

  @ApiProperty({ description: 'Decision date', required: false })
  @IsOptional()
  @IsDateString()
  decisionDate?: string;

  @ApiProperty({ description: 'Offer expiry date', required: false })
  @IsOptional()
  @IsDateString()
  offerExpiryDate?: string;

  @ApiProperty({ description: 'Additional notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'Mortgage conditions', required: false })
  @IsOptional()
  @IsString()
  conditions?: string;

  @ApiProperty({ description: 'Rejection reason', required: false })
  @IsOptional()
  @IsString()
  rejectionReason?: string;
}
