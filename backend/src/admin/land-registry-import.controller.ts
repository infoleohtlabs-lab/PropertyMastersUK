import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody ,
  getSchemaPath,} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { LandRegistryImportService } from './land-registry-import.service';
import {
  CsvUploadDto,
  ImportJobDto,
  ImportJobQueryDto,
  ValidationRuleDto,
  DataMappingDto,
  ImportConfigurationDto,
  ImportJobResponseDto,
  ValidationResultDto,
  ImportProgressDto,
  ImportStatisticsDto,
  ErrorReportDto,
  DataPreviewDto,
  ImportTemplateDto,
} from './dto/land-registry-import.dto';

@ApiTags('Land Registry Import')
@Controller('admin/land-registry-import')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'super_admin')
export class LandRegistryImportController {
  constructor(private readonly landRegistryImportService: LandRegistryImportService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload CSV file for Land Registry import' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'CSV file upload',
    type: CsvUploadDto,
  })
  @ApiResponse({
    status: 201,
    description: 'File uploaded successfully',
    type: ImportJobResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid file format or validation failed' })
  @ApiResponse({ status: 413, description: 'File too large' })
  @UseInterceptors(FileInterceptor('file', {
    limits: {
      fileSize: 50 * 1024 * 1024, // 50MB limit
    },
    fileFilter: (req, file, callback) => {
      if (file.mimetype !== 'text/csv' && !file.originalname.endsWith('.csv')) {
        return callback(new HttpException('Only CSV files are allowed', HttpStatus.BAD_REQUEST), false);
      }
      callback(null, true);
    },
  }))
  async uploadCsvFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadDto: CsvUploadDto,
  ): Promise<ImportJobResponseDto> {
    if (!file) {
      throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
    }

    return this.landRegistryImportService.uploadCsvFile(file, uploadDto);
  }

  @Post('validate/:jobId')
  @ApiOperation({ summary: 'Validate uploaded CSV data' })
  @ApiResponse({
    status: 200,
    description: 'Validation completed',
    type: ValidationResultDto,
  })
  @ApiResponse({ status: 404, description: 'Import job not found' })
  async validateCsvData(
    @Param('jobId') jobId: string,
  ): Promise<ValidationResultDto> {
    return this.landRegistryImportService.validateCsvData(jobId);
  }

  @Post('process/:jobId')
  @ApiOperation({ summary: 'Process validated CSV data and import to database' })
  @ApiResponse({
    status: 200,
    description: 'Import process started',
    type: ImportJobResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Import job not found' })
  @ApiResponse({ status: 400, description: 'Validation not completed or failed' })
  async processCsvData(
    @Param('jobId') jobId: string,
    @Body() processDto: ImportJobDto,
  ): Promise<ImportJobResponseDto> {
    return this.landRegistryImportService.processCsvData(jobId, processDto);
  }

  @Get('jobs')
  @ApiOperation({ summary: 'Get import jobs with filtering and pagination' })
  @ApiResponse({
    status: 200,
    description: 'Import jobs retrieved successfully',
    type: [ImportJobResponseDto],
  })
  async getImportJobs(
    @Query() query: ImportJobQueryDto,
  ): Promise<{
    data: ImportJobResponseDto[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    return this.landRegistryImportService.getImportJobs(query);
  }

  @Get('jobs/:jobId')
  @ApiOperation({ summary: 'Get specific import job details' })
  @ApiResponse({
    status: 200,
    description: 'Import job details retrieved',
    type: ImportJobResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Import job not found' })
  async getImportJob(
    @Param('jobId') jobId: string,
  ): Promise<ImportJobResponseDto> {
    return this.landRegistryImportService.getImportJob(jobId);
  }

  @Get('jobs/:jobId/progress')
  @ApiOperation({ summary: 'Get import job progress' })
  @ApiResponse({
    status: 200,
    description: 'Import progress retrieved',
    type: ImportProgressDto,
  })
  @ApiResponse({ status: 404, description: 'Import job not found' })
  async getImportProgress(
    @Param('jobId') jobId: string,
  ): Promise<ImportProgressDto> {
    return this.landRegistryImportService.getImportProgress(jobId);
  }

  @Get('jobs/:jobId/errors')
  @ApiOperation({ summary: 'Get import job errors and validation issues' })
  @ApiResponse({
    status: 200,
    description: 'Import errors retrieved',
    type: ErrorReportDto,
  })
  @ApiResponse({ status: 404, description: 'Import job not found' })
  async getImportErrors(
    @Param('jobId') jobId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<ErrorReportDto> {
    return this.landRegistryImportService.getImportErrors(jobId, page, limit);
  }

  @Get('jobs/:jobId/preview')
  @ApiOperation({ summary: 'Preview CSV data before import' })
  @ApiResponse({
    status: 200,
    description: 'Data preview retrieved',
    type: DataPreviewDto,
  })
  @ApiResponse({ status: 404, description: 'Import job not found' })
  async previewCsvData(
    @Param('jobId') jobId: string,
    @Query('rows') rows?: number,
  ): Promise<DataPreviewDto> {
    return this.landRegistryImportService.previewCsvData(jobId, rows);
  }

  @Put('jobs/:jobId/cancel')
  @ApiOperation({ summary: 'Cancel running import job' })
  @ApiResponse({
    status: 200,
    description: 'Import job cancelled',
    type: ImportJobResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Import job not found' })
  @ApiResponse({ status: 400, description: 'Cannot cancel completed job' })
  async cancelImportJob(
    @Param('jobId') jobId: string,
  ): Promise<ImportJobResponseDto> {
    return this.landRegistryImportService.cancelImportJob(jobId);
  }

  @Put('jobs/:jobId/retry')
  @ApiOperation({ summary: 'Retry failed import job' })
  @ApiResponse({
    status: 200,
    description: 'Import job retried',
    type: ImportJobResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Import job not found' })
  @ApiResponse({ status: 400, description: 'Cannot retry non-failed job' })
  async retryImportJob(
    @Param('jobId') jobId: string,
  ): Promise<ImportJobResponseDto> {
    return this.landRegistryImportService.retryImportJob(jobId);
  }

  @Delete('jobs/:jobId')
  @ApiOperation({ summary: 'Delete import job and associated data' })
  @ApiResponse({ status: 200, description: 'Import job deleted successfully' })
  @ApiResponse({ status: 404, description: 'Import job not found' })
  @ApiResponse({ status: 400, description: 'Cannot delete running job' })
  async deleteImportJob(
    @Param('jobId') jobId: string,
  ): Promise<{ message: string }> {
    await this.landRegistryImportService.deleteImportJob(jobId);
    return { message: 'Import job deleted successfully' };
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get import statistics and metrics' })
  @ApiResponse({
    status: 200,
    description: 'Import statistics retrieved',
    type: ImportStatisticsDto,
  })
  async getImportStatistics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<ImportStatisticsDto> {
    return this.landRegistryImportService.getImportStatistics(startDate, endDate);
  }

  @Get('validation-rules')
  @ApiOperation({ summary: 'Get available validation rules' })
  @ApiResponse({
    status: 200,
    description: 'Validation rules retrieved',
    type: [ValidationRuleDto],
  })
  async getValidationRules(): Promise<ValidationRuleDto[]> {
    return this.landRegistryImportService.getValidationRules();
  }

  @Post('validation-rules')
  @ApiOperation({ summary: 'Create custom validation rule' })
  @ApiResponse({
    status: 201,
    description: 'Validation rule created',
    type: ValidationRuleDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid validation rule' })
  async createValidationRule(
    @Body() ruleDto: ValidationRuleDto,
  ): Promise<ValidationRuleDto> {
    return this.landRegistryImportService.createValidationRule(ruleDto);
  }

  @Put('validation-rules/:ruleId')
  @ApiOperation({ summary: 'Update validation rule' })
  @ApiResponse({
    status: 200,
    description: 'Validation rule updated',
    type: ValidationRuleDto,
  })
  @ApiResponse({ status: 404, description: 'Validation rule not found' })
  async updateValidationRule(
    @Param('ruleId') ruleId: string,
    @Body() ruleDto: ValidationRuleDto,
  ): Promise<ValidationRuleDto> {
    return this.landRegistryImportService.updateValidationRule(ruleId, ruleDto);
  }

  @Delete('validation-rules/:ruleId')
  @ApiOperation({ summary: 'Delete validation rule' })
  @ApiResponse({ status: 200, description: 'Validation rule deleted' })
  @ApiResponse({ status: 404, description: 'Validation rule not found' })
  async deleteValidationRule(
    @Param('ruleId') ruleId: string,
  ): Promise<{ message: string }> {
    await this.landRegistryImportService.deleteValidationRule(ruleId);
    return { message: 'Validation rule deleted successfully' };
  }

  @Get('data-mapping')
  @ApiOperation({ summary: 'Get data mapping configurations' })
  @ApiResponse({
    status: 200,
    description: 'Data mapping configurations retrieved',
    type: [DataMappingDto],
  })
  async getDataMappings(): Promise<DataMappingDto[]> {
    return this.landRegistryImportService.getDataMappings();
  }

  @Post('data-mapping')
  @ApiOperation({ summary: 'Create data mapping configuration' })
  @ApiResponse({
    status: 201,
    description: 'Data mapping created',
    type: DataMappingDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid data mapping' })
  async createDataMapping(
    @Body() mappingDto: DataMappingDto,
  ): Promise<DataMappingDto> {
    return this.landRegistryImportService.createDataMapping(mappingDto);
  }

  @Put('data-mapping/:mappingId')
  @ApiOperation({ summary: 'Update data mapping configuration' })
  @ApiResponse({
    status: 200,
    description: 'Data mapping updated',
    type: DataMappingDto,
  })
  @ApiResponse({ status: 404, description: 'Data mapping not found' })
  async updateDataMapping(
    @Param('mappingId') mappingId: string,
    @Body() mappingDto: DataMappingDto,
  ): Promise<DataMappingDto> {
    return this.landRegistryImportService.updateDataMapping(mappingId, mappingDto);
  }

  @Delete('data-mapping/:mappingId')
  @ApiOperation({ summary: 'Delete data mapping configuration' })
  @ApiResponse({ status: 200, description: 'Data mapping deleted' })
  @ApiResponse({ status: 404, description: 'Data mapping not found' })
  async deleteDataMapping(
    @Param('mappingId') mappingId: string,
  ): Promise<{ message: string }> {
    await this.landRegistryImportService.deleteDataMapping(mappingId);
    return { message: 'Data mapping deleted successfully' };
  }

  @Get('configuration')
  @ApiOperation({ summary: 'Get import configuration settings' })
  @ApiResponse({
    status: 200,
    description: 'Import configuration retrieved',
    type: ImportConfigurationDto,
  })
  async getImportConfiguration(): Promise<ImportConfigurationDto> {
    return this.landRegistryImportService.getImportConfiguration();
  }

  @Put('configuration')
  @ApiOperation({ summary: 'Update import configuration settings' })
  @ApiResponse({
    status: 200,
    description: 'Import configuration updated',
    type: ImportConfigurationDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid configuration' })
  async updateImportConfiguration(
    @Body() configDto: ImportConfigurationDto,
  ): Promise<ImportConfigurationDto> {
    return this.landRegistryImportService.updateImportConfiguration(configDto);
  }

  @Get('template')
  @ApiOperation({ summary: 'Download CSV import template' })
  @ApiResponse({
    status: 200,
    description: 'CSV template downloaded',
    type: ImportTemplateDto,
  })
  async downloadTemplate(): Promise<ImportTemplateDto> {
    return this.landRegistryImportService.generateImportTemplate();
  }

  @Get('export/:jobId')
  @ApiOperation({ summary: 'Export processed data' })
  @ApiResponse({
    status: 200,
    description: 'Data exported successfully',
  })
  @ApiResponse({ status: 404, description: 'Import job not found' })
  async exportProcessedData(
    @Param('jobId') jobId: string,
    @Query('format') format: 'csv' | 'json' | 'xlsx' = 'csv',
  ): Promise<any> {
    return this.landRegistryImportService.exportProcessedData(jobId, format);
  }

  @Post('bulk-delete')
  @ApiOperation({ summary: 'Bulk delete import jobs' })
  @ApiResponse({ status: 200, description: 'Import jobs deleted successfully' })
  @ApiResponse({ status: 400, description: 'Invalid job IDs or running jobs included' })
  async bulkDeleteImportJobs(
    @Body() jobIds: string[],
  ): Promise<{ message: string; deletedCount: number }> {
    const deletedCount = await this.landRegistryImportService.bulkDeleteImportJobs(jobIds);
    return {
      message: `${deletedCount} import jobs deleted successfully`,
      deletedCount,
    };
  }

  @Post('cleanup')
  @ApiOperation({ summary: 'Cleanup old import jobs and files' })
  @ApiResponse({ status: 200, description: 'Cleanup completed successfully' })
  async cleanupOldJobs(
    @Query('olderThanDays') olderThanDays: number = 30,
  ): Promise<{ message: string; cleanedCount: number }> {
    const cleanedCount = await this.landRegistryImportService.cleanupOldJobs(olderThanDays);
    return {
      message: `Cleanup completed. ${cleanedCount} old jobs removed.`,
      cleanedCount,
    };
  }
}
