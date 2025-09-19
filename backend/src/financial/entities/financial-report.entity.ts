import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { Property } from '../../properties/entities/property.entity';

export enum ReportType {
  INCOME_STATEMENT = 'income_statement',
  CASH_FLOW = 'cash_flow',
  PROFIT_LOSS = 'profit_loss',
  RENT_ROLL = 'rent_roll',
  EXPENSE_REPORT = 'expense_report',
  TAX_REPORT = 'tax_report',
  PORTFOLIO_SUMMARY = 'portfolio_summary',
  PROPERTY_PERFORMANCE = 'property_performance',
  TENANT_PAYMENT_HISTORY = 'tenant_payment_history',
  MAINTENANCE_COSTS = 'maintenance_costs',
  VACANCY_REPORT = 'vacancy_report',
  COMMISSION_REPORT = 'commission_report',
  CUSTOM = 'custom'
}

export enum ReportStatus {
  GENERATING = 'generating',
  COMPLETED = 'completed',
  FAILED = 'failed',
  SCHEDULED = 'scheduled'
}

export enum ReportFormat {
  PDF = 'pdf',
  EXCEL = 'excel',
  CSV = 'csv',
  JSON = 'json'
}

export enum ReportPeriod {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
  CUSTOM = 'custom'
}

@Entity('financial_reports')
export class FinancialReport {
  @ApiProperty({ description: 'Unique identifier for the financial report' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Report title' })
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @ApiProperty({ description: 'Type of financial report', enum: ReportType })
  @Column({ type: 'varchar', length: 50 })
  type: ReportType;

  @ApiProperty({ description: 'Report status', enum: ReportStatus })
  @Column({ type: 'varchar', length: 50, default: ReportStatus.GENERATING })
  status: ReportStatus;

  @ApiProperty({ description: 'Report format', enum: ReportFormat })
  @Column({ type: 'varchar', length: 50, default: ReportFormat.PDF })
  format: ReportFormat;

  @ApiProperty({ description: 'Report period', enum: ReportPeriod })
  @Column({ type: 'varchar', length: 50 })
  period: ReportPeriod;

  @ApiProperty({ description: 'Start date for the report period' })
  @Column({ type: 'date' })
  startDate: Date;

  @ApiProperty({ description: 'End date for the report period' })
  @Column({ type: 'date' })
  endDate: Date;

  @ApiProperty({ description: 'Report description' })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({ description: 'Report data as JSON string' })
  @Column({ type: 'text', nullable: true })
  data: string;

  @ApiProperty({ description: 'Report summary statistics as JSON string' })
  @Column({ type: 'text', nullable: true })
  summary: string;

  @ApiProperty({ description: 'Report file URL' })
  @Column({ type: 'varchar', length: 500, nullable: true })
  fileUrl: string;

  @ApiProperty({ description: 'File size in bytes' })
  @Column({ type: 'bigint', nullable: true })
  fileSize: number;

  @ApiProperty({ description: 'Report parameters as JSON string' })
  @Column({ type: 'text', nullable: true })
  parameters: string;

  @ApiProperty({ description: 'Filters applied to the report as JSON string' })
  @Column({ type: 'text', nullable: true })
  filters: string;

  @ApiProperty({ description: 'Error message if report generation failed' })
  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @ApiProperty({ description: 'Date when report generation started' })
  @Column({ type: 'datetime', nullable: true })
  generationStartedAt: Date;

  @ApiProperty({ description: 'Date when report generation completed' })
  @Column({ type: 'datetime', nullable: true })
  generationCompletedAt: Date;

  @ApiProperty({ description: 'Time taken to generate report in milliseconds' })
  @Column({ type: 'integer', nullable: true })
  generationDuration: number;

  @ApiProperty({ description: 'Whether this is a scheduled report' })
  @Column({ type: 'boolean', default: false })
  isScheduled: boolean;

  @ApiProperty({ description: 'Cron expression for scheduled reports' })
  @Column({ type: 'varchar', length: 100, nullable: true })
  scheduleExpression: string;

  @ApiProperty({ description: 'Next scheduled run date' })
  @Column({ type: 'datetime', nullable: true })
  nextRunAt: Date;

  @ApiProperty({ description: 'Whether the report is public' })
  @Column({ type: 'boolean', default: false })
  isPublic: boolean;

  @ApiProperty({ description: 'Report access token for sharing' })
  @Column({ type: 'varchar', length: 255, nullable: true })
  accessToken: string;

  @ApiProperty({ description: 'Number of times report has been downloaded' })
  @Column({ type: 'integer', default: 0 })
  downloadCount: number;

  @ApiProperty({ description: 'User ID who generated the report' })
  @Column({ type: 'uuid' })
  generatedBy: string;

  @ApiProperty({ description: 'Property ID for property-specific reports' })
  @Column({ type: 'uuid', nullable: true })
  propertyId: string;

  @ApiProperty({ description: 'Additional metadata as JSON string' })
  @Column({ type: 'text', nullable: true })
  metadata: string;

  @ApiProperty({ description: 'Date when the report was created' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Date when the report was last updated' })
  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ApiProperty({ description: 'User who generated the report', type: () => User })
  @ManyToOne(() => User)
  @JoinColumn({ name: 'generatedBy' })
  generator: User;

  @ApiProperty({ description: 'Property for property-specific reports', type: () => Property })
  @ManyToOne(() => Property, { nullable: true })
  @JoinColumn({ name: 'propertyId' })
  property: Property;
}
