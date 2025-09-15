import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

// Entities
import { Consent } from './entities/consent.entity';
import { DataProcessingActivity } from './entities/data-processing-activity.entity';
import { DataSubjectRequest } from './entities/data-subject-request.entity';

// Services
import { GdprService } from './services/gdpr.service';

// Controllers
import { GdprController } from './controllers/gdpr.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Consent,
      DataProcessingActivity,
      DataSubjectRequest,
    ]),
    HttpModule,
    ConfigModule,
  ],
  controllers: [GdprController],
  providers: [GdprService],
  exports: [
    GdprService,
    TypeOrmModule.forFeature([
      Consent,
      DataProcessingActivity,
      DataSubjectRequest,
    ]),
  ],
})
export class GdprModule {}