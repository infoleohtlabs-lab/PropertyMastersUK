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
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { VrService } from './vr.service';
import { CreateVrTourDto } from './dto/create-vr-tour.dto';
import { UpdateVrTourDto } from './dto/update-vr-tour.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../users/entities/user.entity';

@Controller('vr-tours')
@UseGuards(JwtAuthGuard)
export class VrController {
  constructor(private readonly vrService: VrService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.AGENT, UserRole.LANDLORD, UserRole.ADMIN)
  create(@Body() createVrTourDto: CreateVrTourDto, @GetUser() user: User) {
    return this.vrService.create(createVrTourDto, user);
  }

  @Post('upload')
  @UseGuards(RolesGuard)
  @Roles(UserRole.AGENT, UserRole.LANDLORD, UserRole.ADMIN)
  @UseInterceptors(FilesInterceptor('images', 50))
  async uploadVrImages(
    @UploadedFiles() files: Express.Multer.File[],
    @Body('propertyId') propertyId: string,
    @Body('title') title: string,
    @Body('description') description: string,
    @Body('roomData') roomData: string,
    @GetUser() user: User,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('VR images are required');
    }

    let parsedRoomData;
    try {
      parsedRoomData = JSON.parse(roomData);
    } catch (error) {
      throw new BadRequestException('Invalid room data format');
    }

    return this.vrService.uploadVrTour(files, {
      propertyId,
      title,
      description,
      roomData: parsedRoomData,
      uploadedBy: user.id,
    });
  }

  @Get()
  findAll(
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10,
    @Query('propertyId') propertyId?: string,
    @Query('status') status?: string,
  ) {
    return this.vrService.findAll({
      page,
      limit,
      propertyId,
      status,
    });
  }

  @Get('property/:propertyId')
  findByProperty(@Param('propertyId') propertyId: string) {
    return this.vrService.findByProperty(propertyId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vrService.findOne(id);
  }

  @Get(':id/viewer-data')
  getViewerData(@Param('id') id: string) {
    return this.vrService.getViewerData(id);
  }

  @Get(':id/hotspots')
  getHotspots(@Param('id') id: string) {
    return this.vrService.getHotspots(id);
  }

  @Post(':id/hotspots')
  @UseGuards(RolesGuard)
  @Roles(UserRole.AGENT, UserRole.LANDLORD, UserRole.ADMIN)
  addHotspot(
    @Param('id') id: string,
    @Body() hotspotData: any,
    @GetUser() user: User,
  ) {
    return this.vrService.addHotspot(id, hotspotData, user);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.AGENT, UserRole.LANDLORD, UserRole.ADMIN)
  update(
    @Param('id') id: string,
    @Body() updateVrTourDto: UpdateVrTourDto,
    @GetUser() user: User,
  ) {
    return this.vrService.update(id, updateVrTourDto, user);
  }

  @Patch(':id/process')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  processVrTour(@Param('id') id: string, @GetUser() user: User) {
    return this.vrService.processVrTour(id, user);
  }

  @Patch(':id/publish')
  @UseGuards(RolesGuard)
  @Roles(UserRole.AGENT, UserRole.LANDLORD, UserRole.ADMIN)
  publishVrTour(@Param('id') id: string, @GetUser() user: User) {
    return this.vrService.publishVrTour(id, user);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.AGENT, UserRole.LANDLORD, UserRole.ADMIN)
  remove(@Param('id') id: string, @GetUser() user: User) {
    return this.vrService.remove(id);
  }

  @Post(':id/view')
  recordView(
    @Param('id') id: string,
    @Body('viewerInfo') viewerInfo: any,
    @GetUser() user?: User,
  ) {
    return this.vrService.recordView(id, viewerInfo, user);
  }

  @Get('analytics/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.AGENT, UserRole.LANDLORD, UserRole.ADMIN)
  getVrAnalytics(
    @Param('id') id: string,
    @GetUser() user: User,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.vrService.getVrAnalytics(id, {
      startDate,
      endDate,
      user,
    });
  }
}
