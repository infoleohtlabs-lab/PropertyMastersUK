import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

// Entities
import { MaintenanceRequest } from './entities/maintenance-request.entity';
import { MaintenanceSchedule } from './entities/maintenance-schedule.entity';

// Services
import { MaintenanceService } from './services/maintenance.service';

// Controllers
import { MaintenanceController } from './controllers/maintenance.controller';

// External Modules
import { UsersModule } from '../users/users.module';
import { PropertiesModule } from '../properties/properties.module';
import { TenantOrganizationsModule } from '../common/tenant-organizations.module';
import { PaymentsModule } from '../payments/payments.module';
import { CommunicationModule } from '../communication/communication.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MaintenanceRequest,
      MaintenanceSchedule,
    ]),
    HttpModule,
    ConfigModule,
    UsersModule,
    PropertiesModule,
    TenantOrganizationsModule,
    PaymentsModule,
    forwardRef(() => CommunicationModule),
  ],
  controllers: [MaintenanceController],
  providers: [MaintenanceService],
  exports: [
    MaintenanceService,
    TypeOrmModule,
  ],
})
export class MaintenanceModule {}
