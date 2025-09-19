import { PartialType } from '@nestjs/swagger';
import { CreateConveyancingTransactionDto } from './create-conveyancing-transaction.dto';

export class UpdateConveyancingTransactionDto extends PartialType(CreateConveyancingTransactionDto) {}
