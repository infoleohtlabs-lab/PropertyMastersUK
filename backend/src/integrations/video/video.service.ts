import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PropertyVideo } from './entities/property-video.entity';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';

@Injectable()
export class VideoService {
  constructor(
    @InjectRepository(PropertyVideo)
    private videoRepository: Repository<PropertyVideo>,
  ) {}

  async create(createVideoDto: CreateVideoDto): Promise<PropertyVideo> {
    try {
      const video = this.videoRepository.create(createVideoDto);
      return await this.videoRepository.save(video);
    } catch (error) {
      throw new BadRequestException('Failed to create video');
    }
  }

  async findAll(): Promise<PropertyVideo[]> {
    return await this.videoRepository.find({
      relations: ['property'],
      where: { isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<PropertyVideo> {
    const video = await this.videoRepository.findOne({
      where: { id, isActive: true },
      relations: ['property'],
    });

    if (!video) {
      throw new NotFoundException('Video not found');
    }

    return video;
  }

  async findByProperty(propertyId: string): Promise<PropertyVideo[]> {
    return await this.videoRepository.find({
      where: { propertyId, isActive: true },
      relations: ['property'],
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, updateVideoDto: UpdateVideoDto): Promise<PropertyVideo> {
    const video = await this.findOne(id);
    
    Object.assign(video, updateVideoDto);
    
    try {
      return await this.videoRepository.save(video);
    } catch (error) {
      throw new BadRequestException('Failed to update video');
    }
  }

  async remove(id: string): Promise<void> {
    const video = await this.findOne(id);
    
    video.isActive = false;
    await this.videoRepository.save(video);
  }

  async incrementViews(id: string): Promise<void> {
    await this.videoRepository.increment({ id }, 'viewCount', 1);
  }

  async updateWatchTime(id: string, watchTime: number): Promise<void> {
    const video = await this.findOne(id);
    video.totalWatchTime = (video.totalWatchTime || 0) + watchTime;
    await this.videoRepository.save(video);
  }

  async getVideoStats(propertyId: string): Promise<any> {
    const videos = await this.findByProperty(propertyId);
    
    const totalViews = videos.reduce((sum, video) => sum + video.viewCount, 0);
    const totalDuration = videos.reduce((sum, video) => sum + (video.duration || 0), 0);
    const totalWatchTime = videos.reduce((sum, video) => sum + (video.totalWatchTime || 0), 0);
    
    return {
      totalVideos: videos.length,
      totalViews,
      averageViews: videos.length > 0 ? totalViews / videos.length : 0,
      totalDuration,
      totalWatchTime,
      engagementRate: totalDuration > 0 ? (totalWatchTime / totalDuration) * 100 : 0,
    };
  }

  async getFeaturedVideos(limit: number = 10): Promise<PropertyVideo[]> {
    return await this.videoRepository.find({
      where: { isFeatured: true, isActive: true },
      relations: ['property'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async getPopularVideos(limit: number = 10): Promise<PropertyVideo[]> {
    return await this.videoRepository.find({
      where: { isActive: true },
      relations: ['property'],
      order: { viewCount: 'DESC' },
      take: limit,
    });
  }
}
