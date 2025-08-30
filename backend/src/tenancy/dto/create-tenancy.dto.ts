import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsEnum, IsDateString, IsUUID, Min } from 'class-validator';
import { TenancyStatus, TenancyType } from '../entities/tenancy.entity';

export class CreateTenancyDto {
  @ApiProperty({ description: 'Property ID' })
  @IsUUID()
  propertyId: string;

  @ApiProperty({ description: 'Tenant ID' })
  @IsUUID()
  tenantId: string;

  @ApiProperty({ description: 'Landlord ID' })
  @IsUUID()
  landlordId: string;

  @ApiProperty({ description: 'Agent ID', required: false })
  @IsUUID()
  @IsOptional()
  agentId?: string;

  @ApiProperty({ description: 'Tenancy start date' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ description: 'Tenancy end date' })
  @IsDateString()
  endDate: string;

  @ApiProperty({ description: 'Monthly rent amount' })
  @IsNumber()
  @Min(0)
  rentAmount: number;

  @ApiProperty({ description: 'Security deposit amount' })
  @IsNumber()
  @Min(0)
  depositAmount: number;

  @ApiProperty({ enum: TenancyType, description: 'Type of tenancy' })
  @IsEnum(TenancyType)
  tenancyType: TenancyType;

  @ApiProperty({ enum: TenancyStatus, description: 'Tenancy status', default: TenancyStatus.PENDING })
  @IsEnum(TenancyStatus)
  @IsOptional()
  status?: TenancyStatus;

  @ApiProperty({ description: 'Rent due day of month (1-31)' })
  @IsNumber()
  @Min(1)
  rentDueDay: number;

  @ApiProperty({ description: 'Special terms and conditions', required: false })
  @IsString()
  @IsOptional()
  specialTerms?: string;

  @ApiProperty({ description: 'Additional notes', required: false })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ description: 'Break clause notice period in months', required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  breakClauseNotice?: number;
}