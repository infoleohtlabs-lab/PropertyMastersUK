import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MaintenanceController } from './maintenance.controller';
import { MaintenanceService } from './maintenance.service';
import { MaintenanceRequest } from './entities/maintenance-request.entity';
import { Contractor } from './entities/contractor.entity';
import { WorkOrder } from './entities/work-order.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MaintenanceRequest,
      Contractor,
      WorkOrder,
    ]),
  ],
  controllers: [MaintenanceController],
  providers: [MaintenanceService],
  exports: [MaintenanceService],
})
export class MaintenanceModule {}