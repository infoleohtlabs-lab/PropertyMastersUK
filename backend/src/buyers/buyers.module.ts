import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BuyersController } from './buyers.controller';
import { BuyersService } from './buyers.service';
import { Buyer } from './entities/buyer.entity';
import { BuyerPreference } from './entities/buyer-preference.entity';
import { PropertySearch } from './entities/property-search.entity';
import { MarketAnalysis } from './entities/market-analysis.entity';
import { PropertyValuation } from './entities/property-valuation.entity';
import { SavedProperty } from './entities/saved-property.entity';
import { PropertyOffer } from './entities/property-offer.entity';
import { MortgageApplication } from './entities/mortgage-application.entity';
import { Viewing } from './entities/viewing.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Buyer,
      BuyerPreference,
      PropertySearch,
      MarketAnalysis,
      PropertyValuation,
      SavedProperty,
      PropertyOffer,
      MortgageApplication,
      Viewing,
    ])
  ],
  controllers: [BuyersController],
  providers: [BuyersService],
  exports: [BuyersService],
})
export class BuyersModule {}
