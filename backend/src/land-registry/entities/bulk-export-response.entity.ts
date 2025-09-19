import { ApiProperty } from '@nestjs/swagger';

export class BulkExportResponse {
  @ApiProperty()
  exportId: string;

  @ApiProperty({ enum: ['pending', 'processing', 'completed', 'failed'] })
  status: 'pending' | 'processing' | 'completed' | 'failed';

  @ApiProperty({ required: false })
  estimatedRecords?: number;

  @ApiProperty({ required: false })
  estimatedCompletionTime?: string;
}
