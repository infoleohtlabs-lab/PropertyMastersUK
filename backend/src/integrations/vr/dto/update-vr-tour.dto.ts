import { PartialType } from '@nestjs/swagger';
import { CreateVrTourDto } from './create-vr-tour.dto';

export class UpdateVrTourDto extends PartialType(CreateVrTourDto) {}
