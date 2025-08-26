import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { CreateReferenceDto } from './dto/create-reference.dto';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { ConsentDto } from './dto/consent.dto';
import { Tenant } from './entities/tenant.entity';
import { TenantReference, ReferenceStatus } from './entities/tenant-reference.entity';
import { TenantDocument, DocumentStatus } from './entities/tenant-document.entity';
import { Express } from 'express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import 'multer';

@ApiTags('tenants')
@Controller('tenants')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new tenant profile' })
  @ApiResponse({ status: 201, description: 'Tenant created successfully', type: Tenant })
  async create(@Body() createTenantDto: CreateTenantDto, @Request() req): Promise<Tenant> {
    return await this.tenantsService.create(createTenantDto, req.user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tenants' })
  @ApiResponse({ status: 200, description: 'List of all tenants', type: [Tenant] })
  async findAll(@Query() query: any): Promise<any> {
    return await this.tenantsService.findAll(query);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current tenant profile' })
  @ApiResponse({ status: 200, description: 'Current tenant profile', type: Tenant })
  async getCurrentTenant(@Request() req): Promise<Tenant> {
    return await this.tenantsService.findByUserId(req.user.userId);
  }

  @Get('me/progress')
  @ApiOperation({ summary: 'Get tenant application progress' })
  @ApiResponse({ status: 200, description: 'Tenant application progress' })
  async getApplicationProgress(@Request() req): Promise<any> {
    const tenant = await this.tenantsService.findByUserId(req.user.userId);
    return await this.tenantsService.getApplicationProgress(tenant.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get tenant by ID' })
  @ApiResponse({ status: 200, description: 'Tenant details', type: Tenant })
  async findOne(@Param('id') id: string, @Request() req): Promise<Tenant> {
    return await this.tenantsService.findOne(id, req.user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update tenant profile' })
  @ApiResponse({ status: 200, description: 'Tenant updated successfully', type: Tenant })
  async update(@Param('id') id: string, @Body() updateTenantDto: UpdateTenantDto, @Request() req): Promise<Tenant> {
    return await this.tenantsService.update(id, updateTenantDto, req.user);
  }

  @Patch('me/update')
  @ApiOperation({ summary: 'Update current tenant profile' })
  @ApiResponse({ status: 200, description: 'Tenant updated successfully', type: Tenant })
  async updateCurrentTenant(@Request() req, @Body() updateTenantDto: UpdateTenantDto): Promise<Tenant> {
    const tenant = await this.tenantsService.findByUserId(req.user.userId);
    return await this.tenantsService.update(tenant.id, updateTenantDto, req.user);
  }

  @Patch('me/consent')
  @ApiOperation({ summary: 'Update tenant consent preferences' })
  @ApiResponse({ status: 200, description: 'Consent updated successfully', type: Tenant })
  async updateConsent(@Request() req, @Body() consentDto: ConsentDto): Promise<Tenant> {
    const tenant = await this.tenantsService.findByUserId(req.user.userId);
    return await this.tenantsService.updateConsent(tenant.id, consentDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete tenant' })
  @ApiResponse({ status: 200, description: 'Tenant deleted successfully' })
  async remove(@Param('id') id: string): Promise<void> {
    return await this.tenantsService.remove(id);
  }

  // Reference Management
  @Post('me/references')
  @ApiOperation({ summary: 'Add a new reference' })
  @ApiResponse({ status: 201, description: 'Reference added successfully', type: TenantReference })
  async addReference(@Request() req, @Body() createReferenceDto: CreateReferenceDto): Promise<TenantReference> {
    const tenant = await this.tenantsService.findByUserId(req.user.userId);
    return await this.tenantsService.addReference(tenant.id, createReferenceDto, req.user);
  }

  @Get('me/references')
  @ApiOperation({ summary: 'Get tenant references' })
  @ApiResponse({ status: 200, description: 'List of tenant references', type: [TenantReference] })
  async getReferences(@Request() req): Promise<TenantReference[]> {
    const tenant = await this.tenantsService.findByUserId(req.user.userId);
    return await this.tenantsService.getReferences(tenant.id, req.user);
  }

  @Post('references/:referenceId/request')
  @ApiOperation({ summary: 'Request a reference from landlord/employer' })
  @ApiResponse({ status: 200, description: 'Reference request sent', type: TenantReference })
  async requestReference(@Param('referenceId') referenceId: string): Promise<TenantReference> {
    return await this.tenantsService.requestReference(referenceId);
  }

  @Patch('references/:referenceId/status')
  @ApiOperation({ summary: 'Update reference status' })
  @ApiResponse({ status: 200, description: 'Reference status updated', type: TenantReference })
  async updateReferenceStatus(
    @Param('referenceId') referenceId: string,
    @Body('status') status: ReferenceStatus,
  ): Promise<TenantReference> {
    return await this.tenantsService.updateReferenceStatus(referenceId, status);
  }

  // Document Management
  @Post('me/documents/upload')
  @ApiOperation({ summary: 'Upload tenant document' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Document uploaded successfully', type: TenantDocument })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/tenant-documents',
        filename: (req, file, cb) => {
          const uniqueSuffix = uuidv4();
          const ext = extname(file.originalname);
          cb(null, `${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowedMimes = [
          'image/jpeg',
          'image/png',
          'image/gif',
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];
        if (allowedMimes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Invalid file type'), false);
        }
      },
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  )
  async uploadDocument(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadData: any,
  ): Promise<TenantDocument> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const tenant = await this.tenantsService.findByUserId(req.user.userId);
    
    const uploadDocumentDto: UploadDocumentDto = {
      type: uploadData.type,
      fileName: file.filename,
      originalName: file.originalname,
      filePath: file.path,
      mimeType: file.mimetype,
      fileSize: file.size,
      documentNumber: uploadData.documentNumber,
      issueDate: uploadData.issueDate,
      expiryDate: uploadData.expiryDate,
      issuingAuthority: uploadData.issuingAuthority,
      isConfidential: uploadData.isConfidential === 'true',
    };

    return await this.tenantsService.uploadDocument(tenant.id, file, uploadDocumentDto, req.user);
  }

  @Get('me/documents')
  @ApiOperation({ summary: 'Get tenant documents' })
  @ApiResponse({ status: 200, description: 'List of tenant documents', type: [TenantDocument] })
  async getDocuments(@Request() req): Promise<TenantDocument[]> {
    const tenant = await this.tenantsService.findByUserId(req.user.userId);
    return await this.tenantsService.getDocuments(tenant.id, req.user);
  }

  @Patch('documents/:documentId/status')
  @ApiOperation({ summary: 'Update document verification status' })
  @ApiResponse({ status: 200, description: 'Document status updated', type: TenantDocument })
  async updateDocumentStatus(
    @Param('documentId') documentId: string,
    @Body('status') status: DocumentStatus,
    @Body('verificationNotes') verificationNotes?: string,
  ): Promise<TenantDocument> {
    return await this.tenantsService.updateDocumentStatus(documentId, status, verificationNotes);
  }

  @Delete('documents/:documentId')
  @ApiOperation({ summary: 'Delete tenant document' })
  @ApiResponse({ status: 200, description: 'Document deleted successfully' })
  async deleteDocument(@Param('documentId') documentId: string): Promise<void> {
    return await this.tenantsService.deleteDocument(documentId);
  }

  // Credit and Background Checks
  @Post('me/credit-check')
  @ApiOperation({ summary: 'Perform credit check' })
  @ApiResponse({ status: 200, description: 'Credit check completed', type: Tenant })
  async performCreditCheck(@Request() req): Promise<Tenant> {
    const tenant = await this.tenantsService.findByUserId(req.user.userId);
    return await this.tenantsService.performCreditCheck(tenant.id);
  }

  @Post('me/dwp-check')
  @ApiOperation({ summary: 'Perform DWP benefit check' })
  @ApiResponse({ status: 200, description: 'DWP check completed', type: Tenant })
  async performDWPCheck(@Request() req): Promise<Tenant> {
    const tenant = await this.tenantsService.findByUserId(req.user.userId);
    return await this.tenantsService.performDWPCheck(tenant.id);
  }

  @Post('me/employment-check')
  @ApiOperation({ summary: 'Perform employment verification' })
  @ApiResponse({ status: 200, description: 'Employment check completed', type: Tenant })
  async performEmploymentCheck(@Request() req): Promise<Tenant> {
    const tenant = await this.tenantsService.findByUserId(req.user.userId);
    return await this.tenantsService.performEmploymentCheck(tenant.id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update tenant application status' })
  @ApiResponse({ status: 200, description: 'Application status updated', type: Tenant })
  async updateApplicationStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ): Promise<Tenant> {
    return await this.tenantsService.updateApplicationStatus(id, status as any);
  }
}