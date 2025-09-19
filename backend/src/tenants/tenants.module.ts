import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantsService } from './tenants.service';
import { TenantsController } from './tenants.controller';
import { Tenant } from './entities/tenant.entity';
import { TenantApplication } from './entities/tenant-application.entity';
import { TenantDocument } from './entities/tenant-document.entity';
import { TenantPayment } from './entities/tenant-payment.entity';
import { TenantComplaint } from './entities/tenant-complaint.entity';
import { TenantNotification } from './entities/tenant-notification.entity';
import { TenantPreference } from './entities/tenant-preference.entity';
import { TenantReference } from './entities/tenant-reference.entity';
import { TenantEmergencyContact } from './entities/tenant-emergency-contact.entity';
import { TenantCommunication } from './entities/tenant-communication.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Tenant,
      TenantApplication,
      TenantDocument,
      TenantPayment,
      TenantComplaint,
      TenantNotification,
      TenantPreference,
      TenantReference,
      TenantEmergencyContact,
      TenantCommunication,
    ]),
  ],
  controllers: [TenantsController],
  providers: [TenantsService],
  exports: [TenantsService],
})
export class TenantsModule {}
