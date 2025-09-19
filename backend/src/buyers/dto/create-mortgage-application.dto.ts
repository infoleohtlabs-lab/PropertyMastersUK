import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsBoolean, IsEnum, IsDateString, IsUUID } from 'class-validator';
import { MortgageType } from '../entities/mortgage-application.entity';

export class CreateMortgageApplicationDto {
  @ApiProperty({ description: 'Property ID for the mortgage application', required: false })
  @IsOptional()
  @IsUUID()
  propertyId?: string;

  @ApiProperty({ description: 'Name of the lender' })
  @IsString()
  lenderName: string;

  @ApiProperty({ description: 'Loan amount requested' })
  @IsNumber()
  loanAmount: number;

  @ApiProperty({ description: 'Property value' })
  @IsNumber()
  propertyValue: number;

  @ApiProperty({ description: 'Interest rate' })
  @IsNumber()
  interestRate: number;

  @ApiProperty({ description: 'Type of mortgage', enum: MortgageType })
  @IsEnum(MortgageType)
  mortgageType: MortgageType;

  @ApiProperty({ description: 'Mortgage term in years' })
  @IsNumber()
  termYears: number;

  @ApiProperty({ description: 'Monthly payment amount' })
  @IsNumber()
  monthlyPayment: number;

  @ApiProperty({ description: 'Deposit amount', required: false })
  @IsOptional()
  @IsNumber()
  deposit?: number;

  @ApiProperty({ description: 'Loan to value ratio' })
  @IsNumber()
  loanToValue: number;

  @ApiProperty({ description: 'Application reference number', required: false })
  @IsOptional()
  @IsString()
  applicationReference?: string;

  @ApiProperty({ description: 'Additional notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'Mortgage conditions as JSON string', required: false })
  @IsOptional()
  @IsString()
  conditions?: string;

  @ApiProperty({ description: 'Whether applicant is first time buyer', required: false, default: false })
  @IsOptional()
  @IsBoolean()
  isFirstTimeBuyer?: boolean;

  @ApiProperty({ description: 'Broker name', required: false })
  @IsOptional()
  @IsString()
  brokerName?: string;

  @ApiProperty({ description: 'Broker contact information', required: false })
  @IsOptional()
  @IsString()
  brokerContact?: string;

  @ApiProperty({ description: 'Offer expiry date', required: false })
  @IsOptional()
  @IsDateString()
  offerExpiryDate?: string;
}
