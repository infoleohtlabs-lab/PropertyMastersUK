import { ApiProperty } from '@nestjs/swagger';
import { PropertyWithDetails } from '../../shared/types/land-registry.types';

export class PropertySearchResponse {
  @ApiProperty()
  properties: PropertyWithDetails[];

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
