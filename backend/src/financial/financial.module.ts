import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinancialService } from './financial.service';
import { FinancialController } from './financial.controller';
import { Transaction } from './entities/transaction.entity';
import { Invoice } from './entities/invoice.entity';
import { FinancialReport } from './entities/financial-report.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Transaction,
      Invoice,
      FinancialReport,
    ]),
  ],
  controllers: [FinancialController],
  providers: [FinancialService],
  exports: [FinancialService],
})
export class FinancialModule {}