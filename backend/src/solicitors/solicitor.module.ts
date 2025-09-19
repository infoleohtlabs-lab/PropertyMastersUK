import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SolicitorService } from './solicitor.service';
import { SolicitorController } from './solicitor.controller';
import { Solicitor } from './entities/solicitor.entity';
import { LegalCase, CaseTask, CaseDocument } from './entities/legal-case.entity';
import { ConveyancingTransaction, ConveyancingDocument } from './entities/conveyancing-transaction.entity';
import { 
  LegalContract, 
  ContractParty, 
  ContractClause 
} from './entities/legal-contract.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      // Main entities
      Solicitor,
      LegalCase,
      ConveyancingTransaction,
      LegalContract,
      // Related entities
      CaseTask,
      CaseDocument,
      ConveyancingDocument,
      ContractParty,
      ContractClause,
    ]),
    UsersModule,
  ],
  controllers: [SolicitorController],
  providers: [SolicitorService],
  exports: [SolicitorService, TypeOrmModule],
})
export class SolicitorModule {}
