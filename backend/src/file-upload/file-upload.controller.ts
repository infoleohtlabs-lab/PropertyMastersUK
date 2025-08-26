import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, UploadedFile, UseInterceptors, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FileUploadService } from './file-upload.service';
import { CreateFileUploadDto } from './dto/create-file-upload.dto';
import { UpdateFileUploadDto } from './dto/update-file-upload.dto';
import { FileUpload } from './entities/file-upload.entity';
import * as fs from 'fs';
import * as path from 'path';

@ApiTags('file-upload')
@Controller('file-upload')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a file' })
  @ApiResponse({ status: 201, description: 'File uploaded successfully', type: FileUpload })
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() createFileUploadDto: CreateFileUploadDto,
  ) {
    return this.fileUploadService.saveFile(file, createFileUploadDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all file uploads' })
  @ApiResponse({ status: 200, description: 'File uploads retrieved successfully', type: [FileUpload] })
  findAll() {
    return this.fileUploadService.findAll();
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get file uploads for a user' })
  @ApiResponse({ status: 200, description: 'User file uploads retrieved successfully', type: [FileUpload] })
  findByUser(@Param('userId') userId: string) {
    return this.fileUploadService.findByUser(userId);
  }

  @Get('entity/:entityType/:entityId')
  @ApiOperation({ summary: 'Get file uploads for an entity' })
  @ApiResponse({ status: 200, description: 'Entity file uploads retrieved successfully', type: [FileUpload] })
  findByEntity(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
  ) {
    return this.fileUploadService.findByEntity(entityType, entityId);
  }

  @Get('type/:fileType')
  @ApiOperation({ summary: 'Get file uploads by type' })
  @ApiResponse({ status: 200, description: 'File uploads retrieved successfully', type: [FileUpload] })
  findByType(@Param('fileType') fileType: string) {
    return this.fileUploadService.findByType(fileType);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get file upload statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  getStats(@Query('userId') userId?: string) {
    return this.fileUploadService.getFileStats(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get file upload by ID' })
  @ApiResponse({ status: 200, description: 'File upload retrieved successfully', type: FileUpload })
  @ApiResponse({ status: 404, description: 'File upload not found' })
  findOne(@Param('id') id: string) {
    return this.fileUploadService.findOne(id);
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Download file' })
  @ApiResponse({ status: 200, description: 'File downloaded successfully' })
  async downloadFile(@Param('id') id: string, @Res() res: Response) {
    const fileUpload = await this.fileUploadService.findOne(id);
    
    if (!fs.existsSync(fileUpload.filePath)) {
      return res.status(404).json({ message: 'File not found on disk' });
    }

    // Update download count and last accessed date
    await this.fileUploadService.update(id, {
      downloadCount: fileUpload.downloadCount + 1,
      lastAccessedAt: new Date(),
    });

    res.setHeader('Content-Disposition', `attachment; filename="${fileUpload.originalName}"`);
    res.setHeader('Content-Type', fileUpload.mimeType);
    
    const fileStream = fs.createReadStream(fileUpload.filePath);
    fileStream.pipe(res);
  }

  @Get(':id/view')
  @ApiOperation({ summary: 'View file (for images/documents)' })
  @ApiResponse({ status: 200, description: 'File viewed successfully' })
  async viewFile(@Param('id') id: string, @Res() res: Response) {
    const fileUpload = await this.fileUploadService.findOne(id);
    
    if (!fs.existsSync(fileUpload.filePath)) {
      return res.status(404).json({ message: 'File not found on disk' });
    }

    // Update last accessed date
    await this.fileUploadService.update(id, {
      lastAccessedAt: new Date(),
    });

    res.setHeader('Content-Type', fileUpload.mimeType);
    
    const fileStream = fs.createReadStream(fileUpload.filePath);
    fileStream.pipe(res);
  }

  @Post(':id/thumbnail')
  @ApiOperation({ summary: 'Generate thumbnail for image' })
  @ApiResponse({ status: 201, description: 'Thumbnail generated successfully' })
  generateThumbnail(@Param('id') id: string) {
    return this.fileUploadService.generateThumbnail(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update file upload metadata' })
  @ApiResponse({ status: 200, description: 'File upload updated successfully', type: FileUpload })
  @ApiResponse({ status: 404, description: 'File upload not found' })
  update(@Param('id') id: string, @Body() updateFileUploadDto: UpdateFileUploadDto) {
    return this.fileUploadService.update(id, updateFileUploadDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete file upload' })
  @ApiResponse({ status: 200, description: 'File upload deleted successfully' })
  @ApiResponse({ status: 404, description: 'File upload not found' })
  remove(@Param('id') id: string) {
    return this.fileUploadService.remove(id);
  }

  @Post('cleanup/orphaned')
  @ApiOperation({ summary: 'Clean up orphaned files' })
  @ApiResponse({ status: 200, description: 'Orphaned files cleaned up successfully' })
  cleanupOrphanedFiles() {
    return this.fileUploadService.cleanupOrphanedFiles();
  }
}