import { ApiProperty } from '@nestjs/swagger';
import { Property, Ownership } from '../../shared/types/land-registry.types';

export class OwnershipLookupResponse {
  @ApiProperty()
  property: Property;

  @ApiProperty()
  currentOwnership: Ownership;

  @ApiProperty({ required: false })
  ownershipHistory?: Ownership[];
}
