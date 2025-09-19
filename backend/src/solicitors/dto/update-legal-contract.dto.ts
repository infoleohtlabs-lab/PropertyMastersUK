import { PartialType } from '@nestjs/swagger';
import { CreateLegalContractDto } from './create-legal-contract.dto';

export class UpdateLegalContractDto extends PartialType(CreateLegalContractDto) {}
