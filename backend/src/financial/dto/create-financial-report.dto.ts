import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, IsOptional, IsUUID, IsDateString, IsBoolean } from 'class-validator';
import { ReportType, ReportStatus, ReportFormat, ReportPeriod } from '../entities/financial-report.entity';

export class CreateFinancialReportDto {
  @ApiProperty({ description: 'Report title', example: 'Monthly Income Statement - January 2024' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Type of financial report', enum: ReportType, example: ReportType.INCOME_STATEMENT })
  @IsEnum(ReportType)
  type: ReportType;

  @ApiProperty({ description: 'Report status', enum: ReportStatus, example: ReportStatus.GENERATING, required: false })
  @IsOptional()
  @IsEnum(ReportStatus)
  status?: ReportStatus;

  @ApiProperty({ description: 'Report format', enum: ReportFormat, example: ReportFormat.PDF, required: false })
  @IsOptional()
  @IsEnum(ReportFormat)
  format?: ReportFormat;

  @ApiProperty({ description: 'Report period', enum: ReportPeriod, example: ReportPeriod.MONTHLY })
  @IsEnum(ReportPeriod)
  period: ReportPeriod;

  @ApiProperty({ description: 'Start date for the report period' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ description: 'End date for the report period' })
  @IsDateString()
  endDate: string;

  @ApiProperty({ description: 'Report description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Report data as JSON string', required: false })
  @IsOptional()
  @IsString()
  data?: string;

  @ApiProperty({ description: 'Report summary statistics as JSON string', required: false })
  @IsOptional()
  @IsString()
  summary?: string;

  @ApiProperty({ description: 'Report file URL', required: false })
  @IsOptional()
  @IsString()
  fileUrl?: string;

  @ApiProperty({ description: 'File size in bytes', required: false })
  @IsOptional()
  fileSize?: number;

  @ApiProperty({ description: 'Report parameters as JSON string', required: false })
  @IsOptional()
  @IsString()
  parameters?: string;

  @ApiProperty({ description: 'Filters applied to the report as JSON string', required: false })
  @IsOptional()
  @IsString()
  filters?: string;

  @ApiProperty({ description: 'Error message if report generation failed', required: false })
  @IsOptional()
  @IsString()
  errorMessage?: string;

  @ApiProperty({ description: 'Date when report generation started', required: false })
  @IsOptional()
  @IsDateString()
  generationStartedAt?: string;

  @ApiProperty({ description: 'Date when report generation completed', required: false })
  @IsOptional()
  @IsDateString()
  generationCompletedAt?: string;

  @ApiProperty({ description: 'Time taken to generate report in milliseconds', required: false })
  @IsOptional()
  generationDuration?: number;

  @ApiProperty({ description: 'Whether this is a scheduled report', required: false })
  @IsOptional()
  @IsBoolean()
  isScheduled?: boolean;

  @ApiProperty({ description: 'Cron expression for scheduled reports', required: false })
  @IsOptional()
  @IsString()
  scheduleExpression?: string;

  @ApiProperty({ description: 'Next scheduled run date', required: false })
  @IsOptional()
  @IsDateString()
  nextRunAt?: string;

  @ApiProperty({ description: 'Whether the report is public', required: false })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiProperty({ description: 'Report access token for sharing', required: false })
  @IsOptional()
  @IsString()
  accessToken?: string;

  @ApiProperty({ description: 'Number of times report has been downloaded', required: false })
  @IsOptional()
  downloadCount?: number;

  @ApiProperty({ description: 'User ID who generated the report' })
  @IsUUID()
  generatedBy: string;

  @ApiProperty({ description: 'Property ID for property-specific reports', required: false })
  @IsOptional()
  @IsUUID()
  propertyId?: string;

  @ApiProperty({ description: 'Additional metadata as JSON string', required: false })
  @IsOptional()
  @IsString()
  metadata?: string;
}
