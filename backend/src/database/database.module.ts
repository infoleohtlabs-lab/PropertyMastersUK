import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { QueryOptimizationService } from './query-optimization.service';
import { PerformanceMonitoringService } from './performance-monitoring.service';
import { PerformanceMonitoringController } from './performance-monitoring.controller';
import { getDatabaseConfig } from './database.config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getDatabaseConfig,
      inject: [ConfigService],
    }),
  ],
  controllers: [PerformanceMonitoringController],
  providers: [QueryOptimizationService, PerformanceMonitoringService],
  exports: [QueryOptimizationService, PerformanceMonitoringService],
})
export class DatabaseModule {}
