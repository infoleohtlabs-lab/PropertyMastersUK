import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VrService } from './vr.service';
import { VrController } from './vr.controller';
import { VrTour } from './entities/vr-tour.entity';

@Module({
  imports: [TypeOrmModule.forFeature([VrTour])],
  controllers: [VrController],
  providers: [VrService],
  exports: [VrService],
})
export class VrModule {}