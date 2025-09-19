import { ApiProperty } from '@nestjs/swagger';
import { Transaction } from '../../shared/types/land-registry.types';

export class PricePaidSearchResponse {
  @ApiProperty()
  transactions: Transaction[];

  @ApiProperty()
  totalCount: number;

  @ApiProperty()
  hasMore: boolean;

  @ApiProperty({ required: false })
  nextOffset?: number;

  @ApiProperty({ required: false })
  statistics?: {
    averagePrice: number;
    medianPrice: number;
    priceRange: {
      min: number;
      max: number;
    };
  };
}
