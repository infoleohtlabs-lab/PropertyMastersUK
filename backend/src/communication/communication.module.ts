import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from '../users/users.module';
import { PropertiesModule } from '../properties/properties.module';
import { TenantOrganizationsModule } from '../common/tenant-organizations.module';
import { MaintenanceModule } from '../maintenance/maintenance.module';
import { BookingsModule } from '../bookings/bookings.module';
import { Message } from './entities/message.entity';
import { Conversation } from './entities/conversation.entity';
import { Notification } from './entities/notification.entity';
import { CommunicationService } from './services/communication.service';
import { CommunicationController } from './controllers/communication.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Message,
      Conversation,
      Notification,
    ]),
    HttpModule,
    ConfigModule,
    UsersModule,
    PropertiesModule,
    TenantOrganizationsModule,
    forwardRef(() => MaintenanceModule),
    forwardRef(() => BookingsModule),
  ],
  controllers: [CommunicationController],
  providers: [CommunicationService],
  exports: [
    CommunicationService,
    TypeOrmModule,
  ],
})
export class CommunicationModule {}
