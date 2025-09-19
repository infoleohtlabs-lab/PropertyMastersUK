import { PartialType } from '@nestjs/swagger';
import { CreateFinancialReportDto } from './create-financial-report.dto';

export class UpdateFinancialReportDto extends PartialType(CreateFinancialReportDto) {}
