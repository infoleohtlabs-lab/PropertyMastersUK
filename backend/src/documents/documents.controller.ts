import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseUUIDPipe,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { Document, DocumentStatus, DocumentType, DocumentCategory } from './entities/document.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('documents')
@Controller('documents')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new document' })
  @ApiResponse({ status: 201, description: 'Document created successfully', type: Document })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        data: {
          type: 'string',
          description: 'JSON string of CreateDocumentDto',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  @Roles(UserRole.ADMIN, UserRole.LANDLORD, UserRole.TENANT)
  async create(
    @Body('data') data: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Document> {
    const createDocumentDto: CreateDocumentDto = JSON.parse(data);
    return this.documentsService.create(createDocumentDto, file);
  }

  @Get()
  @ApiOperation({ summary: 'Get all documents with optional filters' })
  @ApiResponse({ status: 200, description: 'Documents retrieved successfully', type: [Document] })
  @ApiQuery({ name: 'uploadedById', required: false, description: 'Filter by uploader ID' })
  @ApiQuery({ name: 'propertyId', required: false, description: 'Filter by property ID' })
  @ApiQuery({ name: 'tenantId', required: false, description: 'Filter by tenant ID' })
  @ApiQuery({ name: 'landlordId', required: false, description: 'Filter by landlord ID' })
  @ApiQuery({ name: 'type', required: false, enum: DocumentType, description: 'Filter by document type' })
  @ApiQuery({ name: 'category', required: false, enum: DocumentCategory, description: 'Filter by document category' })
  @ApiQuery({ name: 'status', required: false, enum: DocumentStatus, description: 'Filter by document status' })
  @ApiQuery({ name: 'isConfidential', required: false, type: Boolean, description: 'Filter by confidential status' })
  @ApiQuery({ name: 'isVerified', required: false, type: Boolean, description: 'Filter by verified status' })
  @ApiQuery({ name: 'search', required: false, description: 'Search in name, description, or filename' })
  @ApiQuery({ name: 'tags', required: false, description: 'Filter by tags (comma-separated)' })
  @ApiQuery({ name: 'expiringBefore', required: false, description: 'Filter documents expiring before date' })
  @Roles(UserRole.ADMIN, UserRole.LANDLORD, UserRole.TENANT)
  async findAll(@Query() query: any): Promise<Document[]> {
    const filters = {
      ...query,
      tags: query.tags ? query.tags.split(',') : undefined,
      isConfidential: query.isConfidential ? query.isConfidential === 'true' : undefined,
      isVerified: query.isVerified ? query.isVerified === 'true' : undefined,
      expiringBefore: query.expiringBefore ? new Date(query.expiringBefore) : undefined,
    };
    return this.documentsService.findAll(filters);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get document statistics' })
  @ApiResponse({ status: 200, description: 'Document statistics retrieved successfully' })
  @ApiQuery({ name: 'propertyId', required: false, description: 'Filter by property ID' })
  @ApiQuery({ name: 'landlordId', required: false, description: 'Filter by landlord ID' })
  @Roles(UserRole.ADMIN, UserRole.LANDLORD)
  async getStats(@Query() query: any): Promise<any> {
    return this.documentsService.getDocumentStats(query);
  }

  @Get('expiring')
  @ApiOperation({ summary: 'Get documents expiring soon' })
  @ApiResponse({ status: 200, description: 'Expiring documents retrieved successfully', type: [Document] })
  @ApiQuery({ name: 'days', required: false, description: 'Number of days to look ahead (default: 30)' })
  @Roles(UserRole.ADMIN, UserRole.LANDLORD)
  async getExpiringDocuments(@Query('days') days?: number): Promise<Document[]> {
    return this.documentsService.findExpiringDocuments(days);
  }

  @Get('property/:propertyId')
  @ApiOperation({ summary: 'Get documents by property ID' })
  @ApiResponse({ status: 200, description: 'Property documents retrieved successfully', type: [Document] })
  @Roles(UserRole.ADMIN, UserRole.LANDLORD, UserRole.TENANT)
  async findByProperty(@Param('propertyId', ParseUUIDPipe) propertyId: string): Promise<Document[]> {
    return this.documentsService.findByProperty(propertyId);
  }

  @Get('tenant/:tenantId')
  @ApiOperation({ summary: 'Get documents by tenant ID' })
  @ApiResponse({ status: 200, description: 'Tenant documents retrieved successfully', type: [Document] })
  @Roles(UserRole.ADMIN, UserRole.LANDLORD, UserRole.TENANT)
  async findByTenant(@Param('tenantId', ParseUUIDPipe) tenantId: string): Promise<Document[]> {
    return this.documentsService.findByTenant(tenantId);
  }

  @Get('landlord/:landlordId')
  @ApiOperation({ summary: 'Get documents by landlord ID' })
  @ApiResponse({ status: 200, description: 'Landlord documents retrieved successfully', type: [Document] })
  @Roles(UserRole.ADMIN, UserRole.LANDLORD)
  async findByLandlord(@Param('landlordId', ParseUUIDPipe) landlordId: string): Promise<Document[]> {
    return this.documentsService.findByLandlord(landlordId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get document by ID' })
  @ApiResponse({ status: 200, description: 'Document retrieved successfully', type: Document })
  @ApiResponse({ status: 404, description: 'Document not found' })
  @Roles(UserRole.ADMIN, UserRole.LANDLORD, UserRole.TENANT)
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Document> {
    return this.documentsService.findOne(id);
  }

  @Get(':id/versions')
  @ApiOperation({ summary: 'Get all versions of a document' })
  @ApiResponse({ status: 200, description: 'Document versions retrieved successfully', type: [Document] })
  @Roles(UserRole.ADMIN, UserRole.LANDLORD, UserRole.TENANT)
  async getVersions(@Param('id', ParseUUIDPipe) id: string): Promise<Document[]> {
    return this.documentsService.getDocumentVersions(id);
  }

  @Post(':id/versions')
  @ApiOperation({ summary: 'Create a new version of a document' })
  @ApiResponse({ status: 201, description: 'Document version created successfully', type: Document })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @Roles(UserRole.ADMIN, UserRole.LANDLORD, UserRole.TENANT)
  async addVersion(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('data') data: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Document> {
    const createDocumentDto: CreateDocumentDto = JSON.parse(data);
    return this.documentsService.addVersion(id, createDocumentDto, file);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update document' })
  @ApiResponse({ status: 200, description: 'Document updated successfully', type: Document })
  @ApiResponse({ status: 404, description: 'Document not found' })
  @Roles(UserRole.ADMIN, UserRole.LANDLORD, UserRole.TENANT)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDocumentDto: UpdateDocumentDto,
  ): Promise<Document> {
    return this.documentsService.update(id, updateDocumentDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update document status' })
  @ApiResponse({ status: 200, description: 'Document status updated successfully', type: Document })
  @ApiResponse({ status: 404, description: 'Document not found' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: {
          enum: Object.values(DocumentStatus),
        },
      },
    },
  })
  @Roles(UserRole.ADMIN, UserRole.LANDLORD)
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: DocumentStatus,
  ): Promise<Document> {
    return this.documentsService.updateStatus(id, status);
  }

  @Patch(':id/verify')
  @ApiOperation({ summary: 'Verify document' })
  @ApiResponse({ status: 200, description: 'Document verified successfully', type: Document })
  @ApiResponse({ status: 404, description: 'Document not found' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        verifiedBy: {
          type: 'string',
        },
      },
    },
  })
  @Roles(UserRole.ADMIN, UserRole.LANDLORD)
  async verifyDocument(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('verifiedBy') verifiedBy: string,
  ): Promise<Document> {
    return this.documentsService.verifyDocument(id, verifiedBy);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete document' })
  @ApiResponse({ status: 204, description: 'Document deleted successfully' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.ADMIN, UserRole.LANDLORD)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.documentsService.remove(id);
  }

  @Delete(':id/permanent')
  @ApiOperation({ summary: 'Permanently delete document' })
  @ApiResponse({ status: 204, description: 'Document permanently deleted' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.ADMIN)
  async permanentDelete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.documentsService.permanentDelete(id);
  }
}