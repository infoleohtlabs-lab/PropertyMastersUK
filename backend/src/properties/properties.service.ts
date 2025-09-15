import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Property } from './entities/property.entity';
import { MarketAnalysis } from './entities/market-analysis.entity';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { PropertyValuationDto } from './dto/property-valuation.dto';
import { PropertySearchDto } from './dto/property-search.dto';
import { FileUploadService } from '../file-upload/file-upload.service';
import { FileType } from '../file-upload/entities/file-upload.entity';
import { QueryOptimizationService } from '../database/query-optimization.service';
import { Express } from 'express';
import 'multer';
import * as path from 'path';
import * as fs from 'fs';

interface SearchParams {
  query?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  propertyType?: string;
  bedrooms?: number;
  bathrooms?: number;
}

@Injectable()
export class PropertiesService {
  constructor(
    @InjectRepository(Property)
    private propertiesRepository: Repository<Property>,
    @InjectRepository(MarketAnalysis)
    private marketAnalysisRepository: Repository<MarketAnalysis>,
    private fileUploadService: FileUploadService,
    private queryOptimizationService: QueryOptimizationService,
  ) {}

  async create(createPropertyDto: CreatePropertyDto, agentId?: string): Promise<Property> {
    // Transform DTO to match entity structure
    const propertyData: Partial<Property> = {
      title: createPropertyDto.title,
      description: createPropertyDto.description,
      type: createPropertyDto.propertyType,
      listingType: createPropertyDto.listingType,
      status: createPropertyDto.propertyStatus,
      price: createPropertyDto.price,
      bedrooms: createPropertyDto.bedrooms,
      bathrooms: createPropertyDto.bathrooms,
      squareFeet: createPropertyDto.squareFeet,
      addressLine1: createPropertyDto.location?.address || '',
      addressLine2: '',
      city: createPropertyDto.location?.city || '',
      county: createPropertyDto.location?.county || '',
      postcode: createPropertyDto.location?.postcode || '',
      latitude: createPropertyDto.location?.latitude,
      longitude: createPropertyDto.location?.longitude,
      images: createPropertyDto.images || [],
      amenities: [],
      epcRating: createPropertyDto.energyRating,
      availableFrom: createPropertyDto.availableFrom ? new Date(createPropertyDto.availableFrom) : null,
      agentId: agentId,
      isActive: true,
      isFeatured: createPropertyDto.isFeatured || false,
    };

    const property = this.propertiesRepository.create(propertyData);
    return this.propertiesRepository.save(property);
  }

  async findAll(): Promise<Property[]> {
    return this.propertiesRepository.find({
      relations: ['agent'],
      where: { isActive: true },
    });
  }

  async findOne(id: string): Promise<Property> {
    const property = await this.propertiesRepository.findOne({
      where: { id },
      relations: ['agent'],
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    return property;
  }

  async update(id: string, updatePropertyDto: UpdatePropertyDto): Promise<Property> {
    // Transform DTO to match entity structure if needed
    const updateData: Partial<Property> = {};
    
    if (updatePropertyDto.title) updateData.title = updatePropertyDto.title;
    if (updatePropertyDto.description) updateData.description = updatePropertyDto.description;
    if (updatePropertyDto.propertyType) updateData.type = updatePropertyDto.propertyType;
    if (updatePropertyDto.listingType) updateData.listingType = updatePropertyDto.listingType;
    if (updatePropertyDto.propertyStatus) updateData.status = updatePropertyDto.propertyStatus;
    if (updatePropertyDto.price !== undefined) updateData.price = updatePropertyDto.price;
    if (updatePropertyDto.bedrooms !== undefined) updateData.bedrooms = updatePropertyDto.bedrooms;
    if (updatePropertyDto.bathrooms !== undefined) updateData.bathrooms = updatePropertyDto.bathrooms;
    if (updatePropertyDto.squareFeet !== undefined) updateData.squareFeet = updatePropertyDto.squareFeet;
    if (updatePropertyDto.energyRating) updateData.epcRating = updatePropertyDto.energyRating;
    if (updatePropertyDto.images) updateData.images = updatePropertyDto.images;
    if (updatePropertyDto.isFeatured !== undefined) updateData.isFeatured = updatePropertyDto.isFeatured;
    
    if (updatePropertyDto.location) {
      if (updatePropertyDto.location.address) updateData.addressLine1 = updatePropertyDto.location.address;
      if (updatePropertyDto.location.city) updateData.city = updatePropertyDto.location.city;
      if (updatePropertyDto.location.county) updateData.county = updatePropertyDto.location.county;
      if (updatePropertyDto.location.postcode) updateData.postcode = updatePropertyDto.location.postcode;
      if (updatePropertyDto.location.latitude !== undefined) updateData.latitude = updatePropertyDto.location.latitude;
      if (updatePropertyDto.location.longitude !== undefined) updateData.longitude = updatePropertyDto.location.longitude;
    }
    
    if (updatePropertyDto.availableFrom) {
      updateData.availableFrom = new Date(updatePropertyDto.availableFrom);
    }

    await this.propertiesRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.propertiesRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Property not found');
    }
  }

  async findByAgent(agentId: string): Promise<Property[]> {
    return this.propertiesRepository.find({
      where: { agentId, isActive: true },
      relations: ['agent'],
    });
  }

  async search(searchDto: PropertySearchDto): Promise<{ properties: Property[]; total: number; page: number; limit: number }> {
    // Use optimized search from QueryOptimizationService
    return this.queryOptimizationService.searchPropertiesOptimized(searchDto);
  }

  // Keep the old search method for backward compatibility
  async searchLegacy(params: SearchParams): Promise<Property[]> {
    const searchDto: PropertySearchDto = {
      query: params.query,
      location: params.location,
      minPrice: params.minPrice,
      maxPrice: params.maxPrice,
      propertyType: params.propertyType as any,
      minBedrooms: params.bedrooms,
      minBathrooms: params.bathrooms
    };
    
    const result = await this.search(searchDto);
    return result.properties;
  }

  async getFeatured(): Promise<Property[]> {
    return this.propertiesRepository.find({
      where: { isFeatured: true, isActive: true },
      relations: ['agent'],
      order: { createdAt: 'DESC' },
      take: 6,
    });
  }

  async getRecent(limit: number = 10): Promise<Property[]> {
    return this.propertiesRepository.find({
      where: { isActive: true },
      relations: ['agent'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async getMarketAnalysis(propertyId: string): Promise<MarketAnalysis> {
    const property = await this.findOne(propertyId);
    
    let analysis = await this.marketAnalysisRepository.findOne({
      where: { propertyId },
    });

    if (!analysis) {
      // Generate market analysis if it doesn't exist
      analysis = await this.generateMarketAnalysis(property);
    }

    return analysis;
  }

  private async generateMarketAnalysis(property: Property): Promise<MarketAnalysis> {
    // This is a simplified market analysis generation
    // In a real implementation, you would integrate with external APIs
    // and use more sophisticated algorithms
    
    const similarProperties = await this.propertiesRepository.find({
      where: {
        type: property.type,
        bedrooms: property.bedrooms,
        city: property.city,
        isActive: true,
      },
      take: 10,
    });

    const prices = similarProperties.map(p => p.price).filter(p => p > 0);
    const averagePrice = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    const analysis = this.marketAnalysisRepository.create({
      propertyId: property.id,
      estimatedValue: averagePrice,
      minValue: minPrice,
      maxValue: maxPrice,
      marketTrend: ((property.price - averagePrice) / averagePrice) * 100,
      comparableProperties: similarProperties.map(p => ({ id: p.id, price: p.price, bedrooms: p.bedrooms })),
      priceHistory: [],
      analysisDate: new Date(),
      rentalYield: 0, // Would be calculated based on rental data
      confidenceScore: this.calculateMarketScore(property.price, averagePrice),
      areaStatistics: {},
      investmentMetrics: {
        investmentPotential: this.calculateInvestmentPotential(property),
        liquidityScore: 75,
        competitionLevel: 'medium'
      },
      marketFactors: {},
      dataSource: { source: 'internal_calculation' },
      methodology: 'Simplified calculation based on similar properties in the area',
    }) as unknown as MarketAnalysis;

    return this.marketAnalysisRepository.save(analysis);
  }

  private calculateMarketTrend(propertyPrice: number, averagePrice: number): string {
    const difference = ((propertyPrice - averagePrice) / averagePrice) * 100;
    if (difference > 10) return 'above_market';
    if (difference < -10) return 'below_market';
    return 'market_value';
  }

  private calculateMarketScore(propertyPrice: number, averagePrice: number): number {
    const ratio = propertyPrice / averagePrice;
    if (ratio <= 0.8) return 90;
    if (ratio <= 0.9) return 80;
    if (ratio <= 1.1) return 70;
    if (ratio <= 1.2) return 60;
    return 50;
  }

  private calculateInvestmentPotential(property: Property): string {
    // Simplified calculation based on property characteristics
    let score = 0;
    
    if (property.bedrooms >= 3) score += 20;
    if (property.bathrooms >= 2) score += 15;
    // Note: hasGarden and hasParking properties don't exist in current Property entity
    if (property.type === 'house') score += 15;
    
    if (score >= 60) return 'high';
    if (score >= 40) return 'medium';
    return 'low';
  }

  async uploadImages(propertyId: string, files: Express.Multer.File[]): Promise<any> {
    const property = await this.findOne(propertyId);
    
    const uploadPromises = files.map(async (file) => {
      return this.fileUploadService.saveFile(file, {
        fileName: file.originalname,
        originalName: file.originalname,
        filePath: '',
        fileType: FileType.IMAGE,
        mimeType: file.mimetype,
        fileSize: file.size,
        uploadedById: property.agentId,
        entityType: 'property',
        entityId: propertyId,
        isPublic: true,
      });
    });

    const uploadedFiles = await Promise.all(uploadPromises);
    
    // Update property images array
    const currentImages = property.images || [];
    const newImageUrls = uploadedFiles.map(file => file.fileUrl);
    
    await this.update(propertyId, {
      images: [...currentImages, ...newImageUrls],
    });

    return {
      message: 'Images uploaded successfully',
      images: uploadedFiles,
    };
  }

  async deleteImage(propertyId: string, imageId: string): Promise<any> {
    const property = await this.findOne(propertyId);
    
    // Find and delete the file
    const fileUpload = await this.fileUploadService.findOne(imageId);
    await this.fileUploadService.remove(imageId);
    
    // Update property images array
    const updatedImages = (property.images || []).filter(
      imageUrl => !imageUrl.includes(path.basename(fileUpload.filePath))
    );
    
    await this.update(propertyId, {
      images: updatedImages,
    });

    return {
      message: 'Image deleted successfully',
    };
  }

  async getPropertyValuation(valuationDto: PropertyValuationDto) {
    // Mock valuation calculation based on property details
    const basePrice = valuationDto.bedrooms * 50000 + valuationDto.bathrooms * 25000;
    const locationMultiplier = valuationDto.location?.city?.includes('London') ? 2.5 : 1.2;
    const estimatedValue = basePrice * locationMultiplier;

    return {
      estimatedValue,
      confidence: 85,
      priceRange: {
        min: estimatedValue * 0.9,
        max: estimatedValue * 1.1
      },
      factors: [
        'Location premium',
        'Property size',
        'Market conditions'
      ]
    };
  }

  async compareProperties(propertyIds: string[]) {
    const properties = await this.propertiesRepository.findByIds(propertyIds);
    
    return {
      properties: properties.map(prop => ({
        id: prop.id,
        title: prop.title,
        price: prop.price,
        bedrooms: prop.bedrooms,
        bathrooms: prop.bathrooms,
        squareFeet: prop.squareFeet,
        location: {
          address: prop.addressLine1,
          city: prop.city,
          county: prop.county,
          postcode: prop.postcode
        }
      })),
      comparison: {
        priceRange: {
          min: Math.min(...properties.map(p => p.price)),
          max: Math.max(...properties.map(p => p.price))
        },
        averagePrice: properties.reduce((sum, p) => sum + p.price, 0) / properties.length
      }
    };
  }

  async getNearbyProperties(propertyId: string, radius: number) {
    const property = await this.findOne(propertyId);

    // Mock nearby properties - in real implementation, use geospatial queries
    return this.propertiesRepository.find({
      where: {
        city: Like(`%${property.city}%`)
      },
      take: 10
    });
  }

  async addToFavorites(propertyId: string, userId: string) {
    // In real implementation, create a favorites table
    return { message: 'Property added to favorites' };
  }

  async removeFromFavorites(propertyId: string, userId: string) {
    return { message: 'Property removed from favorites' };
  }

  async getUserFavorites(userId: string) {
    // Mock favorites - in real implementation, join with favorites table
    return this.propertiesRepository.find({ take: 5 });
  }

  async saveSearch(searchDto: PropertySearchDto, userId: string) {
    // In real implementation, save to saved_searches table
    return {
      id: Date.now().toString(),
      name: searchDto.searchName || 'Saved Search',
      criteria: searchDto,
      userId,
      createdAt: new Date()
    };
  }

  async getUserSavedSearches(userId: string) {
    // Mock saved searches
    return [
      {
        id: '1',
        name: 'London Apartments',
        criteria: { location: 'London', propertyType: 'apartment' },
        createdAt: new Date()
      }
    ];
  }

  async deleteSavedSearch(searchId: string, userId: string) {
    return { message: 'Saved search deleted' };
  }

  async getMarketTrends(filters: any = {}) {
    // Mock market trends data
    return {
      trends: [
        { month: 'Jan', averagePrice: 450000, volume: 120 },
        { month: 'Feb', averagePrice: 465000, volume: 135 },
        { month: 'Mar', averagePrice: 470000, volume: 142 }
      ],
      summary: {
        priceChange: '+4.4%',
        volumeChange: '+18.3%',
        forecast: 'Stable growth expected'
      }
    };
  }

  async getPriceHistory(propertyId: string) {
    const property = await this.findOne(propertyId);

    // Mock price history
    return {
      propertyId,
      history: [
        { date: '2023-01-01', price: property.price * 0.95, event: 'Listed' },
        { date: '2023-06-01', price: property.price * 0.98, event: 'Price adjustment' },
        { date: '2024-01-01', price: property.price, event: 'Current price' }
      ]
    };
  }

  async addVirtualTour(propertyId: string, tourData: any) {
    const property = await this.findOne(propertyId);

    // In real implementation, save to virtual_tours table
    return {
      id: Date.now().toString(),
      propertyId,
      ...tourData,
      createdAt: new Date()
    };
  }

  async addVideo(propertyId: string, videoData: any) {
    const property = await this.findOne(propertyId);

    // In real implementation, save to property_videos table
    return {
      id: Date.now().toString(),
      propertyId,
      ...videoData,
      createdAt: new Date()
    };
  }

  async getEnergyRating(propertyId: string) {
    const property = await this.findOne(propertyId);

    // Mock energy rating data
    return {
      propertyId,
      rating: 'B',
      score: 82,
      certificate: 'EPC-2024-001',
      validUntil: new Date('2034-01-01'),
      recommendations: [
        'Install double glazing',
        'Improve loft insulation'
      ]
    };
  }

  async updateEnergyRating(propertyId: string, energyData: any) {
    const property = await this.findOne(propertyId);

    // In real implementation, update energy_ratings table
    return {
      propertyId,
      ...energyData,
      updatedAt: new Date()
    };
  }
}