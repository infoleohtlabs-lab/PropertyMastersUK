import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LandlordsController } from './landlords.controller';
import { LandlordsService } from './landlords.service';
import { Landlord } from './entities/landlord.entity';
import { LandlordProperty } from './entities/landlord-property.entity';
import { TenancyAgreement } from './entities/tenancy-agreement.entity';
import { RentPayment } from './entities/rent-payment.entity';
import { MaintenanceRequest } from './entities/maintenance-request.entity';
import { PropertyInspection } from './entities/property-inspection.entity';
import { FinancialReport } from './entities/financial-report.entity';
import { LandlordDocument } from './entities/landlord-document.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Landlord,
      LandlordProperty,
      TenancyAgreement,
      RentPayment,
      MaintenanceRequest,
      PropertyInspection,
      FinancialReport,
      LandlordDocument,
    ]),
  ],
  controllers: [LandlordsController],
  providers: [LandlordsService],
  exports: [LandlordsService],
})
export class LandlordsModule {}