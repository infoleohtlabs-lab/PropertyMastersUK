import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

// Entities
import { Payment } from './entities/payment.entity';

// Services
import { StripePaymentService } from './services/stripe-payment.service';

// Controllers
import { PaymentController } from './controllers/payment.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment]),
    HttpModule,
    ConfigModule,
  ],
  controllers: [PaymentController],
  providers: [StripePaymentService],
  exports: [StripePaymentService, TypeOrmModule],
})
export class FinancialModule {}
