import { ApiProperty } from '@nestjs/swagger';

export class PropertyStatistics {
  @ApiProperty()
  totalProperties: number;

  @ApiProperty()
  averagePrice: number;

  @ApiProperty()
  medianPrice: number;

  @ApiProperty()
  priceDistribution: {
    range: string;
    count: number;
    percentage: number;
  }[];

  @ApiProperty()
  propertyTypeDistribution: {
    type: string;
    count: number;
    percentage: number;
  }[];

  @ApiProperty()
  tenureDistribution: {
    tenure: string;
    count: number;
    percentage: number;
  }[];

  @ApiProperty()
  salesTrends: {
    period: string;
    averagePrice: number;
    transactionCount: number;
  }[];
}
