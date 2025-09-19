import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CacheModule } from '@nestjs/cache-manager';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LandRegistryController } from './land-registry.controller';
import { LandRegistryService } from './land-registry.service';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from '../auth/auth.module';
import { BulkExport } from './entities/bulk-export.entity';
import { PricePaidRecord } from './entities/price-paid-record.entity';
import { OwnershipRecord } from './entities/ownership-record.entity';
import { TitleRecord } from './entities/title-record.entity';
import { ApiUsageLog } from './entities/api-usage-log.entity';
import { Property } from '../properties/entities/property.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BulkExport, 
      PricePaidRecord, 
      OwnershipRecord, 
      TitleRecord, 
      ApiUsageLog, 
      Property
    ]),
    HttpModule.register({
      timeout: 30000,
      maxRedirects: 3,
    }),
    CacheModule.register({
      ttl: 300, // 5 minutes default cache
      max: 1000, // Maximum number of items in cache
    }),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 3,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 20,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 100,
      },
    ]),
    DatabaseModule,
    AuthModule,
  ],
  controllers: [LandRegistryController],
  providers: [LandRegistryService],
  exports: [LandRegistryService],
})
export class LandRegistryModule {}
