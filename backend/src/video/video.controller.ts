import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { VideoService } from './video.service';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../users/entities/user.entity';

@Controller('videos')
@UseGuards(JwtAuthGuard)
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.AGENT, UserRole.LANDLORD, UserRole.ADMIN)
  create(@Body() createVideoDto: CreateVideoDto, @GetUser() user: User) {
    return this.videoService.create(createVideoDto, user);
  }

  @Post('upload')
  @UseGuards(RolesGuard)
  @Roles(UserRole.AGENT, UserRole.LANDLORD, UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('video'))
  async uploadVideo(
    @UploadedFile() file: Express.Multer.File,
    @Body('propertyId') propertyId: string,
    @Body('title') title: string,
    @Body('description') description: string,
    @GetUser() user: User,
  ) {
    if (!file) {
      throw new BadRequestException('Video file is required');
    }

    return this.videoService.uploadVideo(file, {
      propertyId,
      title,
      description,
      uploadedBy: user.id,
    });
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(
    @GetUser() user: User,
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10,
    @Query('status') status?: string,
    @Query('propertyId') propertyId?: string,
    @Query('isPublic') isPublic?: boolean,
  ) {
    const filters = {
      status,
      propertyId,
      isPublic,
    };
    return this.videoService.findAll(user, page, limit, filters);
  }

  @Get('property/:propertyId')
  findByProperty(
    @Param('propertyId') propertyId: string,
    @Query('type') type?: string,
  ) {
    return this.videoService.findByProperty(propertyId, type);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.videoService.findOne(id);
  }

  @Get(':id/stream')
  streamVideo(@Param('id') id: string) {
    return this.videoService.getStreamingUrl(id);
  }

  @Get(':id/thumbnail')
  getThumbnail(@Param('id') id: string) {
    return this.videoService.getThumbnail(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.AGENT, UserRole.LANDLORD, UserRole.ADMIN)
  update(
    @Param('id') id: string,
    @Body() updateVideoDto: UpdateVideoDto,
    @GetUser() user: User,
  ) {
    // Convert string dates to Date objects if needed
    if (updateVideoDto.publishedAt && typeof updateVideoDto.publishedAt === 'string') {
      updateVideoDto.publishedAt = new Date(updateVideoDto.publishedAt) as any;
    }
    return this.videoService.update(id, updateVideoDto, user);
  }

  @Patch(':id/process')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  processVideo(@Param('id') id: string, @GetUser() user: User) {
    return this.videoService.processVideo(id, user);
  }

  @Patch(':id/publish')
  @UseGuards(RolesGuard)
  @Roles(UserRole.AGENT, UserRole.LANDLORD, UserRole.ADMIN)
  publishVideo(@Param('id') id: string, @GetUser() user: User) {
    return this.videoService.publishVideo(id, user);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.AGENT, UserRole.LANDLORD, UserRole.ADMIN)
  remove(@Param('id') id: string, @GetUser() user: User) {
    return this.videoService.remove(id, user);
  }

  @Get('analytics/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.AGENT, UserRole.LANDLORD, UserRole.ADMIN)
  getVideoAnalytics(
    @Param('id') id: string,
    @GetUser() user: User,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.videoService.getVideoAnalytics(id, {
      startDate,
      endDate,
      user,
    });
  }
}