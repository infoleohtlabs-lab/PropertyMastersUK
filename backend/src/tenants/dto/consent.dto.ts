import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class ConsentDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  creditCheckConsent?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  dwpCheckConsent?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  employmentCheckConsent?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  landlordReferenceConsent?: boolean;
}