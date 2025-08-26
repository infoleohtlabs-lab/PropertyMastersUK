import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LandRegistryService } from './land-registry/land-registry.service';
import { CompaniesHouseService } from './companies-house/companies-house.service';
import { RoyalMailService } from './royal-mail/royal-mail.service';
import { VrService } from './vr/vr.service';
import { VideoService } from './video/video.service';
import { GdprService } from './gdpr/gdpr.service';
import { BookingService } from './booking/booking.service';
import { IntegrationsController } from './integrations.controller';
import { VrTour } from './vr/entities/vr-tour.entity';
import { PropertyVideo } from './video/entities/property-video.entity';
import { GdprRequest } from './gdpr/entities/gdpr-request.entity';
import { DataConsent } from './gdpr/entities/data-consent.entity';
import { Booking } from './booking/entities/booking.entity';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([VrTour, PropertyVideo, GdprRequest, DataConsent, Booking])
  ],
  controllers: [IntegrationsController],
  providers: [
    LandRegistryService,
    CompaniesHouseService,
    RoyalMailService,
    VrService,
    VideoService,
    GdprService,
    BookingService,
  ],
  exports: [
    LandRegistryService,
    CompaniesHouseService,
    RoyalMailService,
    VrService,
    VideoService,
    GdprService,
    BookingService,
  ],
})
export class IntegrationsModule {}