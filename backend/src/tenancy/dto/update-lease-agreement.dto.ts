import { PartialType } from '@nestjs/swagger';
import { CreateLeaseAgreementDto } from './create-lease-agreement.dto';

export class UpdateLeaseAgreementDto extends PartialType(CreateLeaseAgreementDto) {}