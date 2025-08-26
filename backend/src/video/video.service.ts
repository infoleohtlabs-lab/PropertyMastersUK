import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Video, VideoStatus, VideoType } from './entities/video.entity';
import { User } from '../users/entities/user.entity';

interface CreateVideoDto {
  title: string;
  description?: string;
  propertyId: string;
  uploadedBy: string;
  videoType?: VideoType;
  videoUrl?: string;
  thumbnailUrl?: string;
  embedCode?: string;
  duration?: number;
  fileSize?: number;
  resolution?: string;
  format?: string;
  isPublic?: boolean;
  isFeatured?: boolean;
  autoplay?: boolean;
  showControls?: boolean;
  metadata?: Record<string, any>;
  tags?: string[];
  externalId?: string;
  provider?: string;
}

interface UpdateVideoDto {
  title?: string;
  description?: string;
  status?: VideoStatus;
  videoUrl?: string;
  thumbnailUrl?: string;
  embedCode?: string;
  duration?: number;
  fileSize?: number;
  resolution?: string;
  format?: string;
  isPublic?: boolean;
  isFeatured?: boolean;
  autoplay?: boolean;
  showControls?: boolean;
  metadata?: Record<string, any>;
  tags?: string[];
  externalId?: string;
  provider?: string;
  publishedAt?: Date;
}

@Injectable()
export class VideoService {
  constructor(
    @InjectRepository(Video)
    private videoRepository: Repository<Video>,
  ) {}

  async create(createVideoDto: CreateVideoDto, user: User): Promise<Video> {
    const video = this.videoRepository.create({
      ...createVideoDto,
      uploadedBy: user.id,
    });
    return this.videoRepository.save(video);
  }

  async findAll(user: User, page: number = 1, limit: number = 10, filters?: any): Promise<{ videos: Video[], total: number, page: number, limit: number }> {
    const queryBuilder = this.videoRepository.createQueryBuilder('video')
      .leftJoinAndSelect('video.property', 'property')
      .leftJoinAndSelect('video.uploader', 'uploader');

    if (filters?.status) {
      queryBuilder.andWhere('video.status = :status', { status: filters.status });
    }

    if (filters?.propertyId) {
      queryBuilder.andWhere('video.propertyId = :propertyId', { propertyId: filters.propertyId });
    }

    if (filters?.isPublic !== undefined) {
      queryBuilder.andWhere('video.isPublic = :isPublic', { isPublic: filters.isPublic });
    }

    const [videos, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('video.createdAt', 'DESC')
      .getManyAndCount();

    return {
      videos,
      total,
      page,
      limit
    };
  }

  async findOne(id: string): Promise<Video> {
    const video = await this.videoRepository.findOne({
      where: { id },
      relations: ['property', 'uploader'],
    });
    if (!video) {
      throw new NotFoundException(`Video with ID ${id} not found`);
    }
    return video;
  }

  async findByProperty(propertyId: string, type?: string): Promise<Video[]> {
    const where: any = { propertyId };
    if (type) {
      where.videoType = type;
    }
    return this.videoRepository.find({
      where,
      relations: ['property', 'uploader'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByAgent(agentId: string): Promise<Video[]> {
    return this.videoRepository.find({
      where: { uploadedBy: agentId },
      relations: ['property', 'uploader'],
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, updateVideoDto: UpdateVideoDto, user: User): Promise<Video> {
    const video = await this.findOne(id);
    Object.assign(video, updateVideoDto);
    return this.videoRepository.save(video);
  }

  async remove(id: string, user: User): Promise<void> {
    const video = await this.findOne(id);
    await this.videoRepository.remove(video);
  }

  async incrementViews(id: string): Promise<Video> {
    const video = await this.findOne(id);
    video.viewCount += 1;
    
    // Update analytics
    if (!video.analytics) {
      video.analytics = {};
    }
    
    const today = new Date().toISOString().split('T')[0];
    if (!video.analytics[today]) {
      video.analytics[today] = { views: 0, watchTime: 0 };
    }
    video.analytics[today].views += 1;
    
    return this.videoRepository.save(video);
  }

  async updateWatchTime(id: string, watchTime: number): Promise<Video> {
    const video = await this.findOne(id);
    video.totalWatchTime += watchTime;
    
    // Update analytics
    if (!video.analytics) {
      video.analytics = {};
    }
    
    const today = new Date().toISOString().split('T')[0];
    if (!video.analytics[today]) {
      video.analytics[today] = { views: 0, watchTime: 0 };
    }
    video.analytics[today].watchTime += watchTime;
    
    return this.videoRepository.save(video);
  }

  async getFeatured(): Promise<Video[]> {
    return this.videoRepository.find({
      where: { 
        isFeatured: true, 
        status: VideoStatus.PUBLISHED,
        isPublic: true 
      },
      relations: ['property', 'uploader'],
      order: { viewCount: 'DESC' },
      take: 10,
    });
  }

  async getPopular(): Promise<Video[]> {
    return this.videoRepository.find({
      where: { 
        status: VideoStatus.PUBLISHED,
        isPublic: true 
      },
      relations: ['property', 'uploader'],
      order: { viewCount: 'DESC' },
      take: 20,
    });
  }

  async getRecent(): Promise<Video[]> {
    return this.videoRepository.find({
      where: { 
        status: VideoStatus.PUBLISHED,
        isPublic: true 
      },
      relations: ['property', 'uploader'],
      order: { publishedAt: 'DESC' },
      take: 20,
    });
  }

  async searchByTags(tags: string[]): Promise<Video[]> {
    const queryBuilder = this.videoRepository.createQueryBuilder('video')
      .leftJoinAndSelect('video.property', 'property')
      .leftJoinAndSelect('video.uploader', 'uploader')
      .where('video.status = :status', { status: VideoStatus.PUBLISHED })
      .andWhere('video.isPublic = :isPublic', { isPublic: true });

    // Search for videos that contain any of the provided tags
    tags.forEach((tag, index) => {
      if (index === 0) {
        queryBuilder.andWhere('JSON_CONTAINS(video.tags, :tag' + index + ')', { ['tag' + index]: JSON.stringify(tag) });
      } else {
        queryBuilder.orWhere('JSON_CONTAINS(video.tags, :tag' + index + ')', { ['tag' + index]: JSON.stringify(tag) });
      }
    });

    return queryBuilder
      .orderBy('video.viewCount', 'DESC')
      .getMany();
  }

  async getStatistics(agentId?: string): Promise<any> {
    const queryBuilder = this.videoRepository.createQueryBuilder('video');
    
    if (agentId) {
      queryBuilder.where('video.uploadedBy = :agentId', { agentId });
    }

    const [total, published, uploading, totalViews, totalWatchTime] = await Promise.all([
      queryBuilder.getCount(),
      queryBuilder.clone().andWhere('video.status = :status', { status: VideoStatus.PUBLISHED }).getCount(),
      queryBuilder.clone().andWhere('video.status = :status', { status: VideoStatus.UPLOADING }).getCount(),
      queryBuilder.clone().select('SUM(video.viewCount)', 'totalViews').getRawOne(),
      queryBuilder.clone().select('SUM(video.totalWatchTime)', 'totalWatchTime').getRawOne(),
    ]);

    return {
      total,
      published,
      uploading,
      other: total - published - uploading,
      totalViews: parseInt(totalViews?.totalViews) || 0,
      totalWatchTime: parseInt(totalWatchTime?.totalWatchTime) || 0,
      averageWatchTime: total > 0 ? Math.round((parseInt(totalWatchTime?.totalWatchTime) || 0) / total) : 0,
    };
  }

  async uploadVideo(file: Express.Multer.File, videoData: {
    propertyId?: string;
    title?: string;
    description?: string;
    uploadedBy: string;
  }): Promise<Video> {
    // Implementation for video upload
    const video = new Video();
    video.title = videoData.title || file.originalname;
    video.description = videoData.description;
    video.propertyId = videoData.propertyId;
    video.uploadedBy = videoData.uploadedBy;
    video.videoUrl = `/uploads/videos/${file.filename}`;
    video.status = VideoStatus.PROCESSING;
    return this.videoRepository.save(video);
  }

  async getStreamingUrl(id: string): Promise<{ streamingUrl: string }> {
    const video = await this.findOne(id);
    return {
      streamingUrl: video.videoUrl,
    };
  }

  async getThumbnail(id: string): Promise<{ thumbnailUrl: string }> {
    const video = await this.findOne(id);
    return {
      thumbnailUrl: video.thumbnailUrl || '/default-thumbnail.jpg',
    };
  }

  async processVideo(id: string, user: User): Promise<Video> {
    const video = await this.findOne(id);
    video.status = VideoStatus.PROCESSING;
    return this.videoRepository.save(video);
  }

  async publishVideo(id: string, user: User): Promise<Video> {
    const video = await this.findOne(id);
    video.status = VideoStatus.PUBLISHED;
    video.isPublic = true;
    video.publishedAt = new Date();
    return this.videoRepository.save(video);
  }

  async getVideoAnalytics(id: string, options: {
    startDate?: string;
    endDate?: string;
    user: User;
  }): Promise<any> {
    const video = await this.findOne(id);
    const { startDate, endDate } = options;
    
    let analytics = video.analytics || {};
    
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
    
    const totalViews = Object.values(analytics).reduce((sum: number, data: any) => sum + (data?.views || 0), 0);
    const totalWatchTime = Object.values(analytics).reduce((sum: number, data: any) => sum + (data?.watchTime || 0), 0);
    
    return {
      totalViews,
      totalWatchTime,
      averageWatchTime: totalViews > 0 ? Math.round(totalWatchTime / totalViews) : 0,
      dailyViews: analytics,
      engagementRate: video.duration > 0 ? Math.round((totalWatchTime / (totalViews * video.duration)) * 100) : 0,
    };
  }
}