import { ApiProperty } from '@nestjs/swagger';

export class ApiSuccessResponse<T = any> {
  @ApiProperty({ example: true, description: 'Indicates successful operation' })
  success: true;

  @ApiProperty({ description: 'Response data' })
  data: T;

  @ApiProperty({ example: '2025-01-15T10:30:00Z', description: 'Response timestamp' })
  timestamp: string;

  @ApiProperty({ example: '/api/properties', description: 'Request path' })
  path: string;
}

export class ApiErrorResponse {
  @ApiProperty({ example: false, description: 'Indicates failed operation' })
  success: false;

  @ApiProperty({
    type: 'object',
    properties: {
      code: {
        type: 'string',
        example: 'VALIDATION_ERROR',
        description: 'Error code'
      },
      message: {
        type: 'string',
        example: 'Validation failed',
        description: 'Error message'
      },
      details: {
        type: 'object',
        description: 'Additional error details',
        nullable: true
      },
      timestamp: {
        type: 'string',
        example: '2025-01-15T10:30:00Z',
        description: 'Error timestamp'
      },
      path: {
        type: 'string',
        example: '/api/properties',
        description: 'Request path'
      }
    }
  })
  error: {
    code: string;
    message: string;
    details?: any;
    timestamp: string;
    path: string;
  };
}

export class PaginatedResponse<T = any> {
  @ApiProperty({ description: 'Array of items' })
  data: T[];

  @ApiProperty({ example: 1, description: 'Current page number' })
  page: number;

  @ApiProperty({ example: 10, description: 'Number of items per page' })
  limit: number;

  @ApiProperty({ example: 100, description: 'Total number of items' })
  total: number;

  @ApiProperty({ example: 10, description: 'Total number of pages' })
  totalPages: number;

  @ApiProperty({ example: true, description: 'Whether there is a next page' })
  hasNext: boolean;

  @ApiProperty({ example: false, description: 'Whether there is a previous page' })
  hasPrev: boolean;
}

export class PaginationQueryDto {
  @ApiProperty({
    required: false,
    default: 1,
    minimum: 1,
    description: 'Page number'
  })
  page?: number = 1;

  @ApiProperty({
    required: false,
    default: 10,
    minimum: 1,
    maximum: 100,
    description: 'Number of items per page'
  })
  limit?: number = 10;

  @ApiProperty({
    required: false,
    description: 'Field to sort by'
  })
  sortBy?: string;

  @ApiProperty({
    required: false,
    enum: ['asc', 'desc'],
    default: 'desc',
    description: 'Sort order'
  })
  sortOrder?: 'asc' | 'desc' = 'desc';

  @ApiProperty({
    required: false,
    description: 'Search query string'
  })
  search?: string;
}

export class IdParamDto {
  @ApiProperty({
    description: 'Resource ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  id: string;
}

export class BulkOperationDto {
  @ApiProperty({
    type: [String],
    description: 'Array of resource IDs',
    example: ['123e4567-e89b-12d3-a456-426614174000', '987fcdeb-51a2-43d1-b789-123456789abc']
  })
  ids: string[];
}

export class BulkOperationResponse {
  @ApiProperty({ example: 2, description: 'Number of successfully processed items' })
  successCount: number;

  @ApiProperty({ example: 0, description: 'Number of failed items' })
  failureCount: number;

  @ApiProperty({
    type: [String],
    description: 'IDs of successfully processed items',
    example: ['123e4567-e89b-12d3-a456-426614174000']
  })
  successIds: string[];

  @ApiProperty({
    type: [Object],
    description: 'Details of failed items',
    example: []
  })
  failures: Array<{
    id: string;
    error: string;
  }>;
}
