import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenancyService } from './tenancy.service';
import { TenancyController } from './tenancy.controller';
import { Tenancy } from './entities/tenancy.entity';
import { RentPayment } from './entities/rent-payment.entity';
import { LeaseAgreement } from './entities/lease-agreement.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tenancy, RentPayment, LeaseAgreement]),
  ],
  controllers: [TenancyController],
  providers: [TenancyService],
  exports: [TenancyService],
})
export class TenancyModule {}
