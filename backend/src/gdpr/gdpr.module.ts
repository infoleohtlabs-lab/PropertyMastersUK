import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GdprService } from './gdpr.service';
import { DataConsent } from './entities/data-consent.entity';
import { GdprRequest } from './entities/gdpr-request.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DataConsent, GdprRequest])],
  providers: [GdprService],
  exports: [GdprService],
})
export class GdprModule {}