import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { UserManagementService } from './user-management.service';
import { UserManagementController } from './user-management.controller';
import { LandRegistryImportController } from './land-registry-import.controller';
import { LandRegistryImportService } from './land-registry-import.service';
import { SystemConfigService } from './system-config.service';
import { SystemConfigController } from './system-config.controller';
import { GdprComplianceController } from './gdpr-compliance.controller';
import { GdprComplianceService } from './gdpr-compliance.service';
import { SystemConfigurationController } from './system-configuration.controller';
import { SystemConfigurationService } from './system-configuration.service';
import { MarketAnalysisController } from './market-analysis.controller';
import { MarketAnalysisService } from './market-analysis.service';
import { BackupRecoveryController } from './backup-recovery.controller';
import { BackupRecoveryService } from './backup-recovery.service';
import { LandRegistryCsvImportController } from './land-registry-csv-import.controller';
import { LandRegistryCsvImportService } from './land-registry-csv-import.service';
import { FinancialManagementController } from './financial-management.controller';
import { FinancialManagementService } from './financial-management.service';
import { SecurityMonitoringController } from './security-monitoring.controller';
import { SecurityMonitoringService } from './security-monitoring.service';
import { MaintenanceOversightController } from './maintenance-oversight.controller';
import { MaintenanceOversightService } from './maintenance-oversight.service';
// TODO: AdminDashboardController and AdminDashboardService files are missing
// import { AdminDashboardController } from './admin-dashboard.controller';
// import { AdminDashboardService } from './admin-dashboard.service';
import { User } from '../users/entities/user.entity';
import { Property } from '../properties/entities/property.entity';
import { Booking } from '../booking/entities/booking.entity';
import { AdminActivityLog } from './entities/admin-activity-log.entity';
import { SystemConfig } from './entities/system-config.entity';
import { ImportJob } from './entities/import-job.entity';
// TODO: Transaction entity missing - transactions module doesn't exist
// import { Transaction } from '../transactions/entities/transaction.entity';
import { AuditLog } from './entities/audit-log.entity';
import { SecurityAlert } from './entities/security-alert.entity';
import { DataExport } from './entities/data-export.entity';
import { ConsentRecord } from './entities/consent-record.entity';
import { FinancialRecord } from './entities/financial-record.entity';
import { MarketData } from './entities/market-data.entity';
import { MarketReport } from './entities/market-report.entity';
// TODO: LandRegistryImport entity missing
// import { LandRegistryImport } from './entities/land-registry-import.entity';
import { BackupRecord } from './entities/backup-record.entity';
import { ImportHistory } from './entities/import-history.entity';

// External Modules
import { UsersModule } from '../users/users.module';
import { PropertiesModule } from '../properties/properties.module';
import { AuthModule } from '../auth/auth.module';
import { AuditModule } from '../audit/audit.module';
// TODO: EmailModule missing - email module doesn't exist
// import { EmailModule } from '../email/email.module';
import { FileUploadModule } from '../file-upload/file-upload.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Property,
      Booking,
      AdminActivityLog,
      SystemConfig,
      ImportJob,
      // Transaction, // TODO: Entity missing
      AuditLog,
      SecurityAlert,
      DataExport,
      ConsentRecord,
      FinancialRecord,
      MarketData,
      MarketReport,
      // LandRegistryImport, // TODO: Entity missing
      BackupRecord,
      ImportHistory,
    ]),
    EventEmitterModule.forRoot(),
    UsersModule,
    PropertiesModule,
    // EmailModule, // TODO: Module missing
    FileUploadModule,
  ],
  controllers: [
    AdminController,
    UserManagementController,
    LandRegistryImportController,
    SystemConfigController,
    GdprComplianceController,
    SystemConfigurationController,
    MarketAnalysisController,
    FinancialManagementController,
    SecurityMonitoringController,
    MaintenanceOversightController,
    // AdminDashboardController, // TODO: File missing
    BackupRecoveryController,
    LandRegistryCsvImportController,
  ],
  providers: [
    AdminService,
    UserManagementService,
    LandRegistryImportService,
    SystemConfigService,
    GdprComplianceService,
    SystemConfigurationService,
    MarketAnalysisService,
    FinancialManagementService,
    SecurityMonitoringService,
    MaintenanceOversightService,
    // AdminDashboardService, // TODO: File missing
    BackupRecoveryService,
    LandRegistryCsvImportService,
  ],
  exports: [
    AdminService,
    UserManagementService,
    LandRegistryImportService,
    GdprComplianceService,
    SystemConfigurationService,
    MarketAnalysisService,
    FinancialManagementService,
    SecurityMonitoringService,
    MaintenanceOversightService,
    LandRegistryCsvImportService,
  ],
})
export class AdminModule {}
