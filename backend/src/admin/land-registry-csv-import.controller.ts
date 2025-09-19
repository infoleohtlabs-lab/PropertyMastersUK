import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Query,
  Body,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Request,
  BadRequestException,
  NotFoundException,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiProperty,
  getSchemaPath,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import {
  LandRegistryCsvImportService,
  CsvValidationResult,
  ImportProgress,
  CsvImportResult,
} from './land-registry-csv-import.service';
import {
  IsOptional,
  IsBoolean,
  IsNumber,
  Min,
  Max,
  IsString,
} from 'class-validator';
import { Transform } from 'class-transformer';

// DTOs
class CsvImportOptionsDto {
  @ApiProperty({
    description: 'Skip duplicate records during import',
    default: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  skipDuplicates?: boolean = true;

  @ApiProperty({
    description: 'Update existing records if duplicates found',
    default: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  updateExisting?: boolean = false;

  @ApiProperty({
    description: 'Batch size for processing records',
    default: 1000,
    minimum: 100,
    maximum: 5000,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(100)
  @Max(5000)
  @Transform(({ value }) => parseInt(value))
  batchSize?: number = 1000;
}

class ImportHistoryQueryDto {
  @ApiProperty({
    description: 'Page number for pagination',
    default: 1,
    minimum: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Transform(({ value }) => parseInt(value))
  page?: number = 1;

  @ApiProperty({
    description: 'Number of records per page',
    default: 20,
    minimum: 1,
    maximum: 100,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Transform(({ value }) => parseInt(value))
  limit?: number = 20;
}

// Response DTOs
class CsvValidationResponseDto {
  @ApiProperty({ description: 'Whether the CSV file is valid' })
  isValid: boolean;

  @ApiProperty({ description: 'List of validation errors', type: [String] })
  errors: string[];

  @ApiProperty({ description: 'List of validation warnings', type: [String] })
  warnings: string[];

  @ApiProperty({ description: 'Total number of records in the CSV' })
  recordCount: number;

  @ApiProperty({ description: 'Sample records from the CSV' })
  sampleRecords: any[];
}

class ImportStartResponseDto {
  @ApiProperty({ description: 'Unique import identifier' })
  importId: string;

  @ApiProperty({ description: 'Import start message' })
  message: string;
}

class ImportProgressResponseDto {
  @ApiProperty({ description: 'Unique import identifier' })
  importId: string;

  @ApiProperty({ 
    description: 'Current import status',
    enum: ['validating', 'processing', 'completed', 'failed']
  })
  status: string;

  @ApiProperty({ description: 'Import progress percentage (0-100)' })
  progress: number;

  @ApiProperty({ description: 'Current record being processed' })
  currentRecord: number;

  @ApiProperty({ description: 'Total number of records to process' })
  totalRecords: number;

  @ApiProperty({ description: 'Current status message' })
  message: string;

  @ApiProperty({ description: 'Import start time' })
  startTime: Date;

  @ApiProperty({ description: 'List of errors encountered', type: [String] })
  errors: string[];
}

class ImportHistoryResponseDto {
  @ApiProperty({ description: 'List of import records' })
  imports: any[];

  @ApiProperty({ description: 'Pagination information' })
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

@ApiTags('Admin - Land Registry CSV Import')
@Controller('admin/land-registry-import')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class LandRegistryCsvImportController {
  constructor(
    private readonly landRegistryImportService: LandRegistryCsvImportService,
  ) {}

  @Post('validate')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Validate Land Registry CSV file',
    description: 'Upload and validate a Land Registry CSV file before importing. Returns validation results and sample records.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'CSV file to validate',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Land Registry CSV file',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'CSV validation completed',
    type: CsvValidationResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid file or validation failed',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized access',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  async validateCsv(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
  ): Promise<CsvValidationResponseDto> {
    if (!file) {
      throw new BadRequestException('CSV file is required');
    }

    if (!file.originalname.toLowerCase().endsWith('.csv')) {
      throw new BadRequestException('File must be a CSV file');
    }

    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      throw new BadRequestException('File size must be less than 50MB');
    }

    const result = await this.landRegistryImportService.validateCsvFile(
      file.buffer,
      req.user.id,
    );

    return result;
  }

  @Post('import')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Import Land Registry CSV file',
    description: 'Upload and import a Land Registry CSV file. Returns import ID for tracking progress.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'CSV file and import options',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Land Registry CSV file',
        },
        skipDuplicates: {
          type: 'boolean',
          description: 'Skip duplicate records during import',
          default: true,
        },
        updateExisting: {
          type: 'boolean',
          description: 'Update existing records if duplicates found',
          default: false,
        },
        batchSize: {
          type: 'number',
          description: 'Batch size for processing records',
          default: 1000,
          minimum: 100,
          maximum: 5000,
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Import started successfully',
    type: ImportStartResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid file or import options',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized access',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  async importCsv(
    @UploadedFile() file: Express.Multer.File,
    @Body() options: CsvImportOptionsDto,
    @Request() req: any,
  ): Promise<ImportStartResponseDto> {
    if (!file) {
      throw new BadRequestException('CSV file is required');
    }

    if (!file.originalname.toLowerCase().endsWith('.csv')) {
      throw new BadRequestException('File must be a CSV file');
    }

    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      throw new BadRequestException('File size must be less than 50MB');
    }

    const result = await this.landRegistryImportService.importCsvFile(
      file.buffer,
      req.user.id,
      options,
    );

    return result;
  }

  @Get('progress/:importId')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Get import progress',
    description: 'Get the current progress of a CSV import operation.',
  })
  @ApiParam({
    name: 'importId',
    description: 'Unique import identifier',
    type: 'string',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Import progress retrieved successfully',
    type: ImportProgressResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Import not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized access',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  async getImportProgress(
    @Param('importId') importId: string,
  ): Promise<ImportProgressResponseDto> {
    const progress = this.landRegistryImportService.getImportProgress(importId);
    
    if (!progress) {
      throw new NotFoundException('Import not found');
    }

    return progress;
  }

  @Get('active-imports')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Get all active imports',
    description: 'Get a list of all currently active (running) import operations.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Active imports retrieved successfully',
    type: [ImportProgressResponseDto],
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized access',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  async getActiveImports(): Promise<ImportProgressResponseDto[]> {
    return this.landRegistryImportService.getAllActiveImports();
  }

  @Delete('cancel/:importId')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Cancel import',
    description: 'Cancel a running CSV import operation.',
  })
  @ApiParam({
    name: 'importId',
    description: 'Unique import identifier',
    type: 'string',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Import cancelled successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Cannot cancel import (not found or already completed)',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized access',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  async cancelImport(
    @Param('importId') importId: string,
    @Request() req: any,
  ): Promise<{ success: boolean; message: string }> {
    return this.landRegistryImportService.cancelImport(importId, req.user.id);
  }

  @Get('history')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Get import history',
    description: 'Get a paginated list of completed CSV import operations.',
  })
  @ApiQuery({
    name: 'page',
    description: 'Page number for pagination',
    required: false,
    type: 'number',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    description: 'Number of records per page',
    required: false,
    type: 'number',
    example: 20,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Import history retrieved successfully',
    type: ImportHistoryResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized access',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  async getImportHistory(
    @Query() query: ImportHistoryQueryDto,
    @Request() req: any,
  ): Promise<ImportHistoryResponseDto> {
    return this.landRegistryImportService.getImportHistory(
      req.user.id,
      query.page,
      query.limit,
    );
  }

  @Get('health')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Health check for import service',
    description: 'Check the health and status of the Land Registry import service.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Service health status',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'healthy' },
        activeImports: { type: 'number' },
        timestamp: { type: 'string', format: 'date-time' },
        version: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized access',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  async getHealthStatus(): Promise<{
    status: string;
    activeImports: number;
    timestamp: Date;
    version: string;
  }> {
    const activeImports = this.landRegistryImportService.getAllActiveImports();
    
    return {
      status: 'healthy',
      activeImports: activeImports.length,
      timestamp: new Date(),
      version: '1.0.0',
    };
  }

  @Post('template/download')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Download CSV template',
    description: 'Download a sample CSV template for Land Registry data import.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'CSV template downloaded successfully',
    headers: {
      'Content-Type': {
        description: 'MIME type of the file',
        schema: { type: 'string', example: 'text/csv' },
      },
      'Content-Disposition': {
        description: 'File download disposition',
        schema: { type: 'string', example: 'attachment; filename="land-registry-template.csv"' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized access',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  async downloadTemplate(@Request() req: any): Promise<any> {
    const csvTemplate = [
      'transactionId,price,dateOfTransfer,postcode,propertyType,oldNew,duration,paon,saon,street,locality,town,district,county,ppd,recordStatus',
      '{12345678-1234-1234-1234-123456789012},250000,2023-01-15,SW1A 1AA,D,N,F,1,,DOWNING STREET,,LONDON,CITY OF WESTMINSTER,GREATER LONDON,A,A',
      '{87654321-4321-4321-4321-210987654321},450000,2023-02-20,M1 1AA,S,N,F,10,,MARKET STREET,,MANCHESTER,MANCHESTER,GREATER MANCHESTER,A,A',
    ].join('\n');

    // Set response headers for file download
    req.res.setHeader('Content-Type', 'text/csv');
    req.res.setHeader('Content-Disposition', 'attachment; filename="land-registry-template.csv"');
    
    return csvTemplate;
  }
}
