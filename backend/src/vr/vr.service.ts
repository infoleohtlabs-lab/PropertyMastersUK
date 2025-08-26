import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VrTour, VrTourStatus, VrTourType } from './entities/vr-tour.entity';
import { User } from '../users/entities/user.entity';
import { CreateVrTourDto } from './dto/create-vr-tour.dto';
import { UpdateVrTourDto } from './dto/update-vr-tour.dto';



@Injectable()
export class VrService {
  constructor(
    @InjectRepository(VrTour)
    private vrTourRepository: Repository<VrTour>,
  ) {}

  async create(createVrTourDto: CreateVrTourDto, user: User): Promise<VrTour> {
    const vrTour = this.vrTourRepository.create({
      ...createVrTourDto,
      createdBy: user.id,
    });
    return this.vrTourRepository.save(vrTour);
  }

  async findAll(options?: {
    page?: number;
    limit?: number;
    propertyId?: string;
    status?: string;
  }): Promise<{ data: VrTour[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 10, propertyId, status } = options || {};
    const queryBuilder = this.vrTourRepository.createQueryBuilder('vr')
      .leftJoinAndSelect('vr.property', 'property')
      .leftJoinAndSelect('vr.creator', 'creator');

    if (propertyId) {
      queryBuilder.andWhere('vr.propertyId = :propertyId', { propertyId });
    }

    if (status) {
      queryBuilder.andWhere('vr.status = :status', { status });
    }

    const [data, total] = await queryBuilder
      .orderBy('vr.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<VrTour> {
    const vrTour = await this.vrTourRepository.findOne({
      where: { id },
      relations: ['property', 'creator'],
    });
    if (!vrTour) {
      throw new NotFoundException(`VR Tour with ID ${id} not found`);
    }
    return vrTour;
  }

  async findByProperty(propertyId: string): Promise<VrTour[]> {
    return this.vrTourRepository.find({
      where: { propertyId },
      relations: ['property', 'creator'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByAgent(agentId: string): Promise<VrTour[]> {
    return this.vrTourRepository.find({
      where: { createdBy: agentId },
      relations: ['property', 'creator'],
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, updateVrTourDto: UpdateVrTourDto, user: User): Promise<VrTour> {
    const vrTour = await this.findOne(id);
    Object.assign(vrTour, updateVrTourDto);
    return this.vrTourRepository.save(vrTour);
  }

  async remove(id: string): Promise<void> {
    const vrTour = await this.findOne(id);
    await this.vrTourRepository.remove(vrTour);
  }

  async incrementViews(id: string): Promise<VrTour> {
    const vrTour = await this.findOne(id);
    vrTour.viewCount += 1;
    
    // Update analytics
    if (!vrTour.analytics) {
      vrTour.analytics = {};
    }
    
    const today = new Date().toISOString().split('T')[0];
    if (!vrTour.analytics[today]) {
      vrTour.analytics[today] = 0;
    }
    vrTour.analytics[today] += 1;
    
    return this.vrTourRepository.save(vrTour);
  }

  async getFeatured(): Promise<VrTour[]> {
    return this.vrTourRepository.find({
      where: { 
        isFeatured: true, 
        status: VrTourStatus.PUBLISHED,
        isPublic: true 
      },
      relations: ['property', 'creator'],
      order: { viewCount: 'DESC' },
      take: 10,
    });
  }

  async getPopular(): Promise<VrTour[]> {
    return this.vrTourRepository.find({
      where: { 
        status: VrTourStatus.PUBLISHED,
        isPublic: true 
      },
      relations: ['property', 'creator'],
      order: { viewCount: 'DESC' },
      take: 20,
    });
  }

  async getStatistics(agentId?: string): Promise<any> {
    const queryBuilder = this.vrTourRepository.createQueryBuilder('vr');
    
    if (agentId) {
      queryBuilder.where('vr.createdBy = :agentId', { agentId });
    }

    const [total, published, uploading, totalViews] = await Promise.all([
      queryBuilder.getCount(),
      queryBuilder.clone().andWhere('vr.status = :status', { status: VrTourStatus.PUBLISHED }).getCount(),
      queryBuilder.clone().andWhere('vr.status = :status', { status: VrTourStatus.UPLOADING }).getCount(),
      queryBuilder.clone().select('SUM(vr.viewCount)', 'totalViews').getRawOne(),
    ]);

    return {
      total,
      published,
      uploading,
      other: total - published - uploading,
      totalViews: parseInt(totalViews?.totalViews) || 0,
    };
  }

  async uploadVrTour(files: Express.Multer.File[], tourData: any): Promise<VrTour> {
    // Process uploaded files and create VR tour
    const vrTour = this.vrTourRepository.create({
      ...tourData,
      status: VrTourStatus.UPLOADING,
      scenes: tourData.roomData || [],
    });
    const savedTour = await this.vrTourRepository.save(vrTour);
    return Array.isArray(savedTour) ? savedTour[0] : savedTour;
  }

  async getViewerData(id: string): Promise<any> {
    const vrTour = await this.findOne(id);
    return {
      scenes: vrTour.scenes || [],
      hotspots: vrTour.hotspots || [],
      settings: vrTour.settings || {},
      metadata: vrTour.metadata || {},
    };
  }

  async getHotspots(id: string): Promise<any[]> {
    const vrTour = await this.findOne(id);
    return vrTour.hotspots || [];
  }

  async addHotspot(id: string, hotspotData: any, user: User): Promise<VrTour> {
    const vrTour = await this.findOne(id);
    if (!vrTour.hotspots) {
      vrTour.hotspots = [];
    }
    vrTour.hotspots.push({
      ...hotspotData,
      id: Date.now().toString(),
      createdBy: user.id,
      createdAt: new Date(),
    });
    return this.vrTourRepository.save(vrTour);
  }

  async processVrTour(id: string, user: User): Promise<VrTour> {
    const vrTour = await this.findOne(id);
    vrTour.status = VrTourStatus.PROCESSING;
    return this.vrTourRepository.save(vrTour);
  }

  async publishVrTour(id: string, user: User): Promise<VrTour> {
    const vrTour = await this.findOne(id);
    vrTour.status = VrTourStatus.PUBLISHED;
    vrTour.isPublic = true;
    return this.vrTourRepository.save(vrTour);
  }

  async recordView(id: string, viewerInfo: any, user?: User): Promise<VrTour> {
    const vrTour = await this.incrementViews(id);
    
    // Record viewer information if provided
    if (viewerInfo) {
      if (!vrTour.metadata) {
        vrTour.metadata = {};
      }
      if (!vrTour.metadata.viewers) {
        vrTour.metadata.viewers = [];
      }
      vrTour.metadata.viewers.push({
        ...viewerInfo,
        viewedAt: new Date(),
        userId: user?.id,
      });
      await this.vrTourRepository.save(vrTour);
    }
    
    return vrTour;
  }

  async getVrAnalytics(id: string, options: {
    startDate?: string;
    endDate?: string;
    user: User;
  }): Promise<any> {
    const vrTour = await this.findOne(id);
    const { startDate, endDate } = options;
    
    let analytics = vrTour.analytics || {};
    
    // Filter analytics by date range if provided
    if (startDate || endDate) {
      const filteredAnalytics = {};
      Object.keys(analytics).forEach(date => {
        const dateObj = new Date(date);
        const start = startDate ? new Date(startDate) : new Date('1970-01-01');
        const end = endDate ? new Date(endDate) : new Date();
        
        if (dateObj >= start && dateObj <= end) {
          filteredAnalytics[date] = analytics[date];
        }
      });
      analytics = filteredAnalytics;
    }
    
    const totalViews = Object.values(analytics).reduce((sum: number, views: any) => sum + (views || 0), 0);
    const viewerCount = vrTour.metadata?.viewers?.length || 0;
    
    return {
      totalViews,
      viewerCount,
      dailyViews: analytics,
      averageViewTime: vrTour.metadata?.averageViewTime || 0,
      popularScenes: vrTour.metadata?.popularScenes || [],
      deviceBreakdown: vrTour.metadata?.deviceBreakdown || {},
    };
  }
}