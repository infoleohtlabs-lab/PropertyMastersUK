import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { Property } from './entities/property.entity';
import { MarketAnalysis } from './entities/market-analysis.entity';
import { FileUploadService } from '../file-upload/file-upload.service';
import { QueryOptimizationService } from '../query-optimization/query-optimization.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { PropertySearchDto } from './dto/property-search.dto';
import { PropertyValuationDto } from './dto/property-valuation.dto';
import { PropertyType, PropertyStatus } from './entities/property.entity';
import {
  createMockRepository,
  createMockFileUploadService,
  createMockQueryOptimizationService,
  createTestProperty,
  createTestMarketAnalysis
} from '../../test/test-utils';

describe('PropertiesService', () => {
  let service: PropertiesService;
  let propertiesRepository: jest.Mocked<Repository<Property>>;
  let marketAnalysisRepository: jest.Mocked<Repository<MarketAnalysis>>;
  let fileUploadService: jest.Mocked<FileUploadService>;
  let queryOptimizationService: jest.Mocked<QueryOptimizationService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PropertiesService,
        {
          provide: getRepositoryToken(Property),
          useValue: createMockRepository(),
        },
        {
          provide: getRepositoryToken(MarketAnalysis),
          useValue: createMockRepository(),
        },
        {
          provide: FileUploadService,
          useValue: createMockFileUploadService(),
        },
        {
          provide: QueryOptimizationService,
          useValue: createMockQueryOptimizationService(),
        },
      ],
    }).compile();

    service = module.get<PropertiesService>(PropertiesService);
    propertiesRepository = module.get(getRepositoryToken(Property));
    marketAnalysisRepository = module.get(getRepositoryToken(MarketAnalysis));
    fileUploadService = module.get(FileUploadService);
    queryOptimizationService = module.get(QueryOptimizationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a property successfully', async () => {
      const createPropertyDto: CreatePropertyDto = {
        title: 'Test Property',
        description: 'A test property',
        price: 500000,
        bedrooms: 3,
        bathrooms: 2,
        squareFeet: 1500,
        type: PropertyType.HOUSE,
        status: PropertyStatus.AVAILABLE,
        addressLine1: '123 Test St',
        city: 'London',
        county: 'Greater London',
        postcode: 'SW1A 1AA',
        agentId: 'agent-123'
      };

      const savedProperty = createTestProperty(createPropertyDto);
      propertiesRepository.create.mockReturnValue(savedProperty);
      propertiesRepository.save.mockResolvedValue(savedProperty);

      const result = await service.create(createPropertyDto);

      expect(propertiesRepository.create).toHaveBeenCalledWith(createPropertyDto);
      expect(propertiesRepository.save).toHaveBeenCalledWith(savedProperty);
      expect(result).toEqual(savedProperty);
    });

    it('should handle creation errors', async () => {
      const createPropertyDto: CreatePropertyDto = {
        title: 'Test Property',
        price: 500000,
        agentId: 'agent-123'
      } as CreatePropertyDto;

      propertiesRepository.create.mockReturnValue({} as Property);
      propertiesRepository.save.mockRejectedValue(new Error('Database error'));

      await expect(service.create(createPropertyDto)).rejects.toThrow('Database error');
    });
  });

  describe('findAll', () => {
    it('should return all properties', async () => {
      const properties = [createTestProperty(), createTestProperty()];
      propertiesRepository.find.mockResolvedValue(properties);

      const result = await service.findAll();

      expect(propertiesRepository.find).toHaveBeenCalled();
      expect(result).toEqual(properties);
    });

    it('should return empty array when no properties exist', async () => {
      propertiesRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a property by id', async () => {
      const property = createTestProperty();
      propertiesRepository.findOne.mockResolvedValue(property);

      const result = await service.findOne('property-123');

      expect(propertiesRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'property-123' },
        relations: ['agent']
      });
      expect(result).toEqual(property);
    });

    it('should throw NotFoundException when property not found', async () => {
      propertiesRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a property successfully', async () => {
      const property = createTestProperty();
      const updateDto: UpdatePropertyDto = { price: 600000 };
      const updatedProperty = { ...property, ...updateDto };

      propertiesRepository.findOne.mockResolvedValue(property);
      propertiesRepository.save.mockResolvedValue(updatedProperty);

      const result = await service.update('property-123', updateDto);

      expect(propertiesRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'property-123' }
      });
      expect(propertiesRepository.save).toHaveBeenCalledWith(updatedProperty);
      expect(result).toEqual(updatedProperty);
    });

    it('should throw NotFoundException when property not found', async () => {
      propertiesRepository.findOne.mockResolvedValue(null);

      await expect(service.update('non-existent', {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a property successfully', async () => {
      const property = createTestProperty();
      propertiesRepository.findOne.mockResolvedValue(property);
      propertiesRepository.remove.mockResolvedValue(property);

      await service.remove('property-123');

      expect(propertiesRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'property-123' }
      });
      expect(propertiesRepository.remove).toHaveBeenCalledWith(property);
    });

    it('should throw NotFoundException when property not found', async () => {
      propertiesRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByAgent', () => {
    it('should return properties by agent id', async () => {
      const properties = [createTestProperty({ agentId: 'agent-123' })];
      propertiesRepository.find.mockResolvedValue(properties);

      const result = await service.findByAgent('agent-123');

      expect(propertiesRepository.find).toHaveBeenCalledWith({
        where: { agentId: 'agent-123' },
        relations: ['agent']
      });
      expect(result).toEqual(properties);
    });
  });

  describe('search', () => {
    it('should search properties with filters', async () => {
      const searchDto: PropertySearchDto = {
        location: 'London',
        minPrice: 400000,
        maxPrice: 600000,
        bedrooms: 3,
        propertyType: PropertyType.HOUSE
      };
      const properties = [createTestProperty()];
      
      queryOptimizationService.buildPropertySearchQuery.mockReturnValue({
        where: expect.any(Object),
        order: expect.any(Object)
      });
      propertiesRepository.find.mockResolvedValue(properties);

      const result = await service.search(searchDto);

      expect(queryOptimizationService.buildPropertySearchQuery).toHaveBeenCalledWith(searchDto);
      expect(propertiesRepository.find).toHaveBeenCalled();
      expect(result).toEqual(properties);
    });
  });

  describe('getFeatured', () => {
    it('should return featured properties', async () => {
      const properties = [createTestProperty({ isFeatured: true })];
      propertiesRepository.find.mockResolvedValue(properties);

      const result = await service.getFeatured();

      expect(propertiesRepository.find).toHaveBeenCalledWith({
        where: { isFeatured: true, isActive: true },
        take: 10,
        order: { createdAt: 'DESC' }
      });
      expect(result).toEqual(properties);
    });
  });

  describe('getRecent', () => {
    it('should return recent properties', async () => {
      const properties = [createTestProperty()];
      propertiesRepository.find.mockResolvedValue(properties);

      const result = await service.getRecent();

      expect(propertiesRepository.find).toHaveBeenCalledWith({
        where: { isActive: true },
        take: 10,
        order: { createdAt: 'DESC' }
      });
      expect(result).toEqual(properties);
    });
  });

  describe('getMarketAnalysis', () => {
    it('should create and return market analysis', async () => {
      const property = createTestProperty();
      const similarProperties = [createTestProperty({ price: 480000 }), createTestProperty({ price: 520000 })];
      const marketAnalysis = createTestMarketAnalysis();

      propertiesRepository.findOne.mockResolvedValue(property);
      propertiesRepository.find.mockResolvedValue(similarProperties);
      marketAnalysisRepository.create.mockReturnValue(marketAnalysis);
      marketAnalysisRepository.save.mockResolvedValue(marketAnalysis);

      const result = await service.getMarketAnalysis('property-123');

      expect(propertiesRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'property-123' }
      });
      expect(marketAnalysisRepository.save).toHaveBeenCalled();
      expect(result).toEqual(marketAnalysis);
    });

    it('should throw NotFoundException when property not found', async () => {
      propertiesRepository.findOne.mockResolvedValue(null);

      await expect(service.getMarketAnalysis('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('uploadImages', () => {
    it('should upload images successfully', async () => {
      const property = createTestProperty();
      const files = [
        { originalname: 'image1.jpg', mimetype: 'image/jpeg', size: 1024 } as Express.Multer.File,
        { originalname: 'image2.jpg', mimetype: 'image/jpeg', size: 2048 } as Express.Multer.File
      ];
      const uploadedFiles = [
        { fileUrl: 'http://example.com/image1.jpg' },
        { fileUrl: 'http://example.com/image2.jpg' }
      ];

      propertiesRepository.findOne.mockResolvedValue(property);
      fileUploadService.saveFile.mockResolvedValueOnce(uploadedFiles[0] as any);
      fileUploadService.saveFile.mockResolvedValueOnce(uploadedFiles[1] as any);
      propertiesRepository.save.mockResolvedValue(property);

      const result = await service.uploadImages('property-123', files);

      expect(fileUploadService.saveFile).toHaveBeenCalledTimes(2);
      expect(result.message).toBe('Images uploaded successfully');
      expect(result.images).toEqual(uploadedFiles);
    });
  });

  describe('getPropertyValuation', () => {
    it('should calculate property valuation', async () => {
      const valuationDto: PropertyValuationDto = {
        bedrooms: 3,
        bathrooms: 2,
        location: { city: 'London' }
      } as PropertyValuationDto;

      const result = await service.getPropertyValuation(valuationDto);

      expect(result.estimatedValue).toBeGreaterThan(0);
      expect(result.confidence).toBe(85);
      expect(result.priceRange).toBeDefined();
      expect(result.factors).toBeInstanceOf(Array);
    });
  });

  describe('compareProperties', () => {
    it('should compare multiple properties', async () => {
      const properties = [
        createTestProperty({ price: 400000 }),
        createTestProperty({ price: 500000 }),
        createTestProperty({ price: 600000 })
      ];
      propertiesRepository.findByIds.mockResolvedValue(properties);

      const result = await service.compareProperties(['1', '2', '3']);

      expect(result.properties).toHaveLength(3);
      expect(result.comparison.priceRange.min).toBe(400000);
      expect(result.comparison.priceRange.max).toBe(600000);
      expect(result.comparison.averagePrice).toBe(500000);
    });
  });

  describe('getNearbyProperties', () => {
    it('should return nearby properties', async () => {
      const property = createTestProperty({ city: 'London' });
      const nearbyProperties = [createTestProperty()];

      propertiesRepository.findOne.mockResolvedValue(property);
      propertiesRepository.find.mockResolvedValue(nearbyProperties);

      const result = await service.getNearbyProperties('property-123', 5);

      expect(result).toEqual(nearbyProperties);
    });
  });

  describe('favorites operations', () => {
    it('should add property to favorites', async () => {
      const result = await service.addToFavorites('property-123', 'user-123');
      expect(result.message).toBe('Property added to favorites');
    });

    it('should remove property from favorites', async () => {
      const result = await service.removeFromFavorites('property-123', 'user-123');
      expect(result.message).toBe('Property removed from favorites');
    });

    it('should get user favorites', async () => {
      const properties = [createTestProperty()];
      propertiesRepository.find.mockResolvedValue(properties);

      const result = await service.getUserFavorites('user-123');
      expect(result).toEqual(properties);
    });
  });

  describe('saved searches', () => {
    it('should save search criteria', async () => {
      const searchDto: PropertySearchDto = {
        location: 'London',
        searchName: 'My London Search'
      };

      const result = await service.saveSearch(searchDto, 'user-123');

      expect(result.name).toBe('My London Search');
      expect(result.criteria).toEqual(searchDto);
      expect(result.userId).toBe('user-123');
    });

    it('should get user saved searches', async () => {
      const result = await service.getUserSavedSearches('user-123');
      expect(result).toBeInstanceOf(Array);
    });

    it('should delete saved search', async () => {
      const result = await service.deleteSavedSearch('search-123', 'user-123');
      expect(result.message).toBe('Saved search deleted');
    });
  });

  describe('market data', () => {
    it('should get market trends', async () => {
      const result = await service.getMarketTrends();

      expect(result.trends).toBeInstanceOf(Array);
      expect(result.summary).toBeDefined();
      expect(result.summary.priceChange).toBeDefined();
    });

    it('should get price history', async () => {
      const property = createTestProperty();
      propertiesRepository.findOne.mockResolvedValue(property);

      const result = await service.getPriceHistory('property-123');

      expect(result.propertyId).toBe('property-123');
      expect(result.history).toBeInstanceOf(Array);
    });
  });

  describe('media operations', () => {
    it('should add virtual tour', async () => {
      const property = createTestProperty();
      const tourData = { url: 'http://example.com/tour', type: '360' };

      propertiesRepository.findOne.mockResolvedValue(property);

      const result = await service.addVirtualTour('property-123', tourData);

      expect(result.propertyId).toBe('property-123');
      expect(result.url).toBe(tourData.url);
    });

    it('should add video', async () => {
      const property = createTestProperty();
      const videoData = { url: 'http://example.com/video.mp4', title: 'Property Tour' };

      propertiesRepository.findOne.mockResolvedValue(property);

      const result = await service.addVideo('property-123', videoData);

      expect(result.propertyId).toBe('property-123');
      expect(result.url).toBe(videoData.url);
    });
  });

  describe('energy rating', () => {
    it('should get energy rating', async () => {
      const property = createTestProperty();
      propertiesRepository.findOne.mockResolvedValue(property);

      const result = await service.getEnergyRating('property-123');

      expect(result.propertyId).toBe('property-123');
      expect(result.rating).toBeDefined();
      expect(result.score).toBeGreaterThan(0);
    });

    it('should update energy rating', async () => {
      const property = createTestProperty();
      const energyData = { rating: 'A', score: 95 };

      propertiesRepository.findOne.mockResolvedValue(property);

      const result = await service.updateEnergyRating('property-123', energyData);

      expect(result.propertyId).toBe('property-123');
      expect(result.rating).toBe('A');
      expect(result.score).toBe(95);
    });
  });
});