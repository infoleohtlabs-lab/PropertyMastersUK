import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PropertiesModule } from './properties/properties.module';
import { AgentsModule } from './agents/agents.module';
import { BuyersModule } from './buyers/buyers.module';
import { TenantsModule } from './tenants/tenants.module';
import { LandlordsModule } from './landlords/landlords.module';
import { CommunicationModule } from './communication/communication.module';
import { NotificationModule } from './notifications/notification.module';
import { FileUploadModule } from './file-upload/file-upload.module';
import { GdprModule } from './gdpr/gdpr.module';
import { VrModule } from './vr/vr.module';
import { VideoModule } from './video/video.module';
import { BookingModule } from './booking/booking.module';
import { PaymentsModule } from './payments/payments.module';
import { DocumentsModule } from './documents/documents.module';
import { AuditModule } from './audit/audit.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { CrmModule } from './crm/crm.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'propertymastersuk.db',
      autoLoadEntities: true,
      synchronize: true,
      dropSchema: false,
    }),
    AuthModule,
    UsersModule,
    PropertiesModule,
    AgentsModule,
    BuyersModule,
    TenantsModule,
    LandlordsModule,
    CommunicationModule,
    NotificationModule,
    FileUploadModule,
    GdprModule,
    VrModule,
    VideoModule,
    BookingModule,
    PaymentsModule,
    DocumentsModule,
    AuditModule,
    IntegrationsModule,
    CrmModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}