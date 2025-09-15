import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { BookingController } from './controllers/booking.controller';
import { BookingService } from './services/booking.service';
import { Booking } from './entities/booking.entity';
import { Availability } from './entities/availability.entity';
import { UsersModule } from '../users/users.module';
import { PropertiesModule } from '../properties/properties.module';
import { TenantOrganizationsModule } from '../common/tenant-organizations.module';
import { MaintenanceModule } from '../maintenance/maintenance.module';
import { PaymentsModule } from '../payments/payments.module';
import { CommunicationModule } from '../communication/communication.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Booking, Availability]),
    HttpModule,
    ConfigModule,
    UsersModule,
    PropertiesModule,
    TenantOrganizationsModule,
    MaintenanceModule,
    PaymentsModule,
    CommunicationModule,
  ],
  controllers: [BookingController],
  providers: [BookingService],
  exports: [BookingService, TypeOrmModule],
})
export class BookingsModule {}