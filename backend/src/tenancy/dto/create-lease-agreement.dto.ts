import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsDateString, IsUUID, IsUrl } from 'class-validator';
import { AgreementStatus, AgreementType } from '../entities/lease-agreement.entity';

export class CreateLeaseAgreementDto {
  @ApiProperty({ description: 'Tenancy ID' })
  @IsUUID()
  tenancyId: string;

  @ApiProperty({ description: 'Agreement title' })
  @IsString()
  title: string;

  @ApiProperty({ enum: AgreementType, description: 'Type of agreement' })
  @IsEnum(AgreementType)
  agreementType: AgreementType;

  @ApiProperty({ description: 'Agreement content/terms' })
  @IsString()
  content: string;

  @ApiProperty({ description: 'Document URL', required: false })
  @IsUrl()
  @IsOptional()
  documentUrl?: string;

  @ApiProperty({ description: 'Agreement version' })
  @IsString()
  version: string;

  @ApiProperty({ enum: AgreementStatus, description: 'Agreement status', default: AgreementStatus.DRAFT })
  @IsEnum(AgreementStatus)
  @IsOptional()
  status?: AgreementStatus;

  @ApiProperty({ description: 'Date agreement was signed', required: false })
  @IsDateString()
  @IsOptional()
  signedDate?: string;

  @ApiProperty({ description: 'Tenant signature', required: false })
  @IsString()
  @IsOptional()
  tenantSignature?: string;

  @ApiProperty({ description: 'Landlord signature', required: false })
  @IsString()
  @IsOptional()
  landlordSignature?: string;

  @ApiProperty({ description: 'Witness signature', required: false })
  @IsString()
  @IsOptional()
  witnessSignature?: string;

  @ApiProperty({ description: 'Additional notes', required: false })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ description: 'Agreement expiry date', required: false })
  @IsDateString()
  @IsOptional()
  expiryDate?: string;
}