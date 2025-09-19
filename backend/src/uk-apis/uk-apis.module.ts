import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

// Services
import { LandRegistryService } from './services/land-registry.service';
import { CompaniesHouseService } from './services/companies-house.service';
import { RoyalMailPafService } from './services/royal-mail-paf.service';
import { OrdnanceSurveyService } from './services/ordnance-survey.service';

// Controllers
import { UkApisController } from './controllers/uk-apis.controller';

@Module({
  imports: [
    HttpModule,
    ConfigModule,
  ],
  controllers: [UkApisController],
  providers: [
    LandRegistryService,
    CompaniesHouseService,
    RoyalMailPafService,
    OrdnanceSurveyService,
  ],
  exports: [
    LandRegistryService,
    CompaniesHouseService,
    RoyalMailPafService,
    OrdnanceSurveyService,
  ],
})
export class UkApisModule {}
