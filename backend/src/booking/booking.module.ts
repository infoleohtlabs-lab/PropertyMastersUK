import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { Booking } from './entities/booking.entity';
import { Availability } from './entities/availability.entity';
import { BookingService } from './services/booking.service';
import { BookingController } from './controllers/booking.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Booking, Availability]),
    HttpModule,
    ConfigModule,
    DatabaseModule,
  ],
  controllers: [BookingController],
  providers: [BookingService],
  exports: [BookingService, TypeOrmModule],
})
export class BookingModule {}