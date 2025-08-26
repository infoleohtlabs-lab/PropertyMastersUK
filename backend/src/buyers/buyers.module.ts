import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BuyersController } from './buyers.controller';
import { BuyersService } from './buyers.service';
import { Buyer } from './entities/buyer.entity';
import { BuyerPreference } from './entities/buyer-preference.entity';
import { PropertySearch } from './entities/property-search.entity';
import { MarketAnalysis } from './entities/market-analysis.entity';
import { PropertyValuation } from './entities/property-valuation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Buyer, BuyerPreference, PropertySearch, MarketAnalysis, PropertyValuation])],
  controllers: [BuyersController],
  providers: [BuyersService],
  exports: [BuyersService],
})
export class BuyersModule {}