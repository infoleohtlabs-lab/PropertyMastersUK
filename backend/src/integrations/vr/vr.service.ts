import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VrTour } from './entities/vr-tour.entity';
import { CreateVrTourDto } from './dto/create-vr-tour.dto';
import { UpdateVrTourDto } from './dto/update-vr-tour.dto';

@Injectable()
export class VrService {
  constructor(
    @InjectRepository(VrTour)
    private vrTourRepository: Repository<VrTour>,
  ) {}

  async create(createVrTourDto: CreateVrTourDto): Promise<VrTour> {
    try {
      const vrTour = this.vrTourRepository.create(createVrTourDto);
      return await this.vrTourRepository.save(vrTour);
    } catch (error) {
      throw new BadRequestException('Failed to create VR tour');
    }
  }

  async findAll(): Promise<VrTour[]> {
    return await this.vrTourRepository.find({
      relations: ['property'],
      where: { isActive: true },
    });
  }

  async findOne(id: string): Promise<VrTour> {
    const vrTour = await this.vrTourRepository.findOne({
      where: { id, isActive: true },
      relations: ['property'],
    });

    if (!vrTour) {
      throw new NotFoundException('VR tour not found');
    }

    return vrTour;
  }

  async findByProperty(propertyId: string): Promise<VrTour[]> {
    return await this.vrTourRepository.find({
      where: { propertyId, isActive: true },
      relations: ['property'],
    });
  }

  async update(id: string, updateVrTourDto: UpdateVrTourDto): Promise<VrTour> {
    const vrTour = await this.findOne(id);
    
    Object.assign(vrTour, updateVrTourDto);
    
    try {
      return await this.vrTourRepository.save(vrTour);
    } catch (error) {
      throw new BadRequestException('Failed to update VR tour');
    }
  }

  async remove(id: string): Promise<void> {
    const vrTour = await this.findOne(id);
    
    vrTour.isActive = false;
    await this.vrTourRepository.save(vrTour);
  }

  async incrementViews(id: string): Promise<void> {
    await this.vrTourRepository.increment({ id }, 'viewCount', 1);
  }

  async getVrTourStats(propertyId: string): Promise<any> {
    const tours = await this.findByProperty(propertyId);
    
    const totalViews = tours.reduce((sum, tour) => sum + tour.viewCount, 0);
    const totalDuration = tours.reduce((sum, tour) => sum + (tour.duration || 0), 0);
    
    return {
      totalTours: tours.length,
      totalViews,
      averageViews: tours.length > 0 ? totalViews / tours.length : 0,
      totalDuration,
      averageDuration: tours.length > 0 ? totalDuration / tours.length : 0,
    };
  }
}