import { IsString, IsEmail, IsOptional, IsEnum, IsNumber, IsBoolean, IsArray, IsDateString, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BuyerType, FinancialStatus } from '../entities/buyer.entity';

export class CreateBuyerDto {
  @ApiProperty()
  @IsString()
  userId: string;

  @ApiProperty({ enum: BuyerType })
  @IsEnum(BuyerType)
  type: BuyerType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  budget: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  minBudget: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxBudget: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  deposit: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  monthlyIncome: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  monthlyExpenses: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  existingDebt: number;

  @ApiPropertyOptional({ enum: FinancialStatus })
  @IsOptional()
  @IsEnum(FinancialStatus)
  financialStatus: FinancialStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  mortgagePreApproved: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mortgageLender: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  mortgageAmount: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  mortgageRate: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(40)
  mortgageTerm: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  firstTimeBuyer: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  cashBuyer: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  solicitorName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  solicitorEmail: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  solicitorPhone: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  solicitorAddress: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  currentPropertyAddress: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  currentPropertyPostcode: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  currentPropertyValue: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  currentMortgageBalance: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  needToSellFirst: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  chainFree: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preferredAreas: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  avoidAreas: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  minBedrooms: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  maxBedrooms: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  minBathrooms: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  gardenRequired: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  parkingRequired: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  newBuildOnly: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  petFriendly: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  targetMoveDate: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes: string;
}
