import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PropertiesModule } from './properties/properties.module';
import { PaymentsModule } from './payments/payments.module';
import { MaintenanceModule } from './maintenance/maintenance.module';
import { TenantOrganizationsModule } from './common/tenant-organizations.module';
import { CommunicationModule } from './communication/communication.module';
import { BookingsModule } from './bookings/bookings.module';
import { AgentsModule } from './agents/agents.module';
import { HealthModule } from './health/health.module';
import { LoggingModule } from './logging/logging.module';
import { SecurityModule } from './security/security.module';
import { DatabaseModule } from './database/database.module';
import configuration from './config/configuration';
import { envValidationSchema } from './config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema: envValidationSchema,
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      },
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    PropertiesModule,
    PaymentsModule,
    MaintenanceModule,
    TenantOrganizationsModule,
    CommunicationModule,
    BookingsModule,
    AgentsModule,
    HealthModule,
    LoggingModule,
    SecurityModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}