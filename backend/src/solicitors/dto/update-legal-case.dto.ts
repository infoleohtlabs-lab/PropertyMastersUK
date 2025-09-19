import { PartialType } from '@nestjs/swagger';
import { CreateLegalCaseDto } from './create-legal-case.dto';

export class UpdateLegalCaseDto extends PartialType(CreateLegalCaseDto) {}
