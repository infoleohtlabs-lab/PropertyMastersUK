import { PartialType } from '@nestjs/swagger';
import { CreateSolicitorDto } from './create-solicitor.dto';

export class UpdateSolicitorDto extends PartialType(CreateSolicitorDto) {}
