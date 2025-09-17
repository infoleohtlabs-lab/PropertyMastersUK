import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { UserManagementController } from './user-management.controller';
import { UserManagementService } from './user-management.service';
import { LandRegistryImportController } from './land-registry-import.controller';
import { LandRegistryImportService } from './land-registry-import.service';
import { GdprComplianceController } from './gdpr-compliance.controller';
import { GdprComplianceService } from './gdpr-compliance.service';
import { FinancialManagementController } from './financial-management.controller';
import { FinancialManagementService } from './financial-management.service';
import { SecurityMonitoringController } from './security-monitoring.controller';
import { SecurityMonitoringService } from './security-monitoring.service';
import { MaintenanceOversightController } from './maintenance-oversight.controller';
import { MaintenanceOversightService } from './maintenance-oversight.service';
import { User } from '../users/entities/user.entity';
import { Property } from '../properties/entities/property.entity';
import { Booking } from '../booking/entities/booking.entity';
import { AdminActivityLog } from './entities/admin-activity-log.entity';
import { SystemConfig } from './entities/system-config.entity';
import { ImportJob } from './entities/import-job.entity';

// External Modules
import { UsersModule } from '../users/users.module';
import { PropertiesModule } from '../properties/properties.module';
import { AuthModule } from '../auth/auth.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Property,
      Booking,
      AdminActivityLog,
      SystemConfig,
      ImportJob,
    ]),
    EventEmitterModule,
  ],
  controllers: [
    AdminController,
    UserManagementController,
    LandRegistryImportController,
    GdprComplianceController,
    FinancialManagementController,
    SecurityMonitoringController,
    MaintenanceOversightController,
  ],
  providers: [
    AdminService,
    UserManagementService,
    LandRegistryImportService,
    GdprComplianceService,
    FinancialManagementService,
    SecurityMonitoringService,
    MaintenanceOversightService,
  ],
  exports: [
    AdminService,
    UserManagementService,
    LandRegistryImportService,
    GdprComplianceService,
    FinancialManagementService,
    SecurityMonitoringService,
    MaintenanceOversightService,
  ],
})
export class AdminModule {}