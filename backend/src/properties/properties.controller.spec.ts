import { Test, TestingModule } from '@nestjs/testing';
import { PropertiesController } from './properties.controller';
import { PropertiesService } from './properties.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { PropertySearchDto } from './dto/property-search.dto';
import { PropertyValuationDto } from './dto/property-valuation.dto';
import { PropertyType, PropertyStatus } from './entities/property.entity';
import {
  createTestProperty,
  createTestUser,
  createTestMarketAnalysis
} from '../../test/test-utils';

describe('PropertiesController', () => {
  let controller: PropertiesController;
  let service: jest.Mocked<PropertiesService>;

  const mockPropertiesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    search: jest.fn(),
    getFeatured: jest.fn(),
    getRecent: jest.fn(),
    getMarketAnalysis: jest.fn(),
    uploadImages: jest.fn(),
    deleteImage: jest.fn(),
    findByAgent: jest.fn(),
    getPropertyValuation: jest.fn(),
    compareProperties: jest.fn(),
    getNearbyProperties: jest.fn(),
    addToFavorites: jest.fn(),
    removeFromFavorites: jest.fn(),
    getUserFavorites: jest.fn(),
    saveSearch: jest.fn(),
    getUserSavedSearches: jest.fn(),
    deleteSavedSearch: jest.fn(),
    getMarketTrends: jest.fn(),
    getPriceHistory: jest.fn(),
    addVirtualTour: jest.fn(),
    addVideo: jest.fn(),
    getEnergyRating: jest.fn(),
    updateEnergyRating: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PropertiesController],
      providers: [
        {
          provide: PropertiesService,
          useValue: mockPropertiesService,
        },
      ],
    }).compile();

    controller = module.get<PropertiesController>(PropertiesController);
    service = module.get(PropertiesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
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
      const user = createTestUser();
      const req = { user };
      const property = createTestProperty(createPropertyDto);

      service.create.mockResolvedValue(property);

      const result = await controller.create(createPropertyDto, req);

      expect(service.create).toHaveBeenCalledWith(createPropertyDto, user.id);
      expect(result).toEqual(property);
    });

    it('should handle creation errors', async () => {
      const createPropertyDto: CreatePropertyDto = {} as CreatePropertyDto;
      const user = createTestUser();
      const req = { user };

      service.create.mockRejectedValue(new Error('Validation failed'));

      await expect(controller.create(createPropertyDto, req)).rejects.toThrow('Validation failed');
    });
  });

  describe('findAll', () => {
    it('should return all properties', async () => {
      const properties = [createTestProperty(), createTestProperty()];
      service.findAll.mockResolvedValue(properties);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(properties);
    });

    it('should return empty array when no properties exist', async () => {
      service.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
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

      service.search.mockResolvedValue(properties);

      const result = await controller.search(searchDto);

      expect(service.search).toHaveBeenCalledWith(searchDto);
      expect(result).toEqual(properties);
    });

    it('should handle empty search results', async () => {
      const searchDto: PropertySearchDto = {
        location: 'NonExistentCity'
      };

      service.search.mockResolvedValue([]);

      const result = await controller.search(searchDto);

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a property by id', async () => {
      const property = createTestProperty();
      service.findOne.mockResolvedValue(property);

      const result = await controller.findOne('property-123');

      expect(service.findOne).toHaveBeenCalledWith('property-123');
      expect(result).toEqual(property);
    });

    it('should handle property not found', async () => {
      service.findOne.mockRejectedValue(new Error('Property not found'));

      await expect(controller.findOne('non-existent')).rejects.toThrow('Property not found');
    });
  });

  describe('update', () => {
    it('should update a property successfully', async () => {
      const updateDto: UpdatePropertyDto = { price: 600000 };
      const user = createTestUser();
      const req = { user };
      const updatedProperty = createTestProperty({ price: 600000 });

      service.update.mockResolvedValue(updatedProperty);

      const result = await controller.update('property-123', updateDto, req);

      expect(service.update).toHaveBeenCalledWith('property-123', updateDto, user.id);
      expect(result).toEqual(updatedProperty);
    });

    it('should handle update errors', async () => {
      const updateDto: UpdatePropertyDto = { price: -1000 };
      const user = createTestUser();
      const req = { user };

      service.update.mockRejectedValue(new Error('Invalid price'));

      await expect(controller.update('property-123', updateDto, req)).rejects.toThrow('Invalid price');
    });
  });

  describe('remove', () => {
    it('should remove a property successfully', async () => {
      const user = createTestUser();
      const req = { user };
      const deleteResult = { message: 'Property deleted successfully' };

      service.remove.mockResolvedValue(deleteResult);

      const result = await controller.remove('property-123', req);

      expect(service.remove).toHaveBeenCalledWith('property-123', user.id);
      expect(result).toEqual(deleteResult);
    });

    it('should handle removal errors', async () => {
      const user = createTestUser();
      const req = { user };

      service.remove.mockRejectedValue(new Error('Property not found'));

      await expect(controller.remove('non-existent', req)).rejects.toThrow('Property not found');
    });
  });

  describe('getFeatured', () => {
    it('should return featured properties', async () => {
      const featuredProperties = [createTestProperty({ isFeatured: true })];
      service.getFeatured.mockResolvedValue(featuredProperties);

      const result = await controller.getFeatured();

      expect(service.getFeatured).toHaveBeenCalled();
      expect(result).toEqual(featuredProperties);
    });
  });

  describe('getRecent', () => {
    it('should return recent properties with default limit', async () => {
      const recentProperties = [createTestProperty()];
      service.getRecent.mockResolvedValue(recentProperties);

      const result = await controller.getRecent();

      expect(service.getRecent).toHaveBeenCalledWith(10);
      expect(result).toEqual(recentProperties);
    });

    it('should return recent properties with custom limit', async () => {
      const recentProperties = [createTestProperty()];
      service.getRecent.mockResolvedValue(recentProperties);

      const result = await controller.getRecent(5);

      expect(service.getRecent).toHaveBeenCalledWith(5);
      expect(result).toEqual(recentProperties);
    });
  });

  describe('getMarketAnalysis', () => {
    it('should return market analysis for a property', async () => {
      const marketAnalysis = createTestMarketAnalysis();
      service.getMarketAnalysis.mockResolvedValue(marketAnalysis);

      const result = await controller.getMarketAnalysis('property-123');

      expect(service.getMarketAnalysis).toHaveBeenCalledWith('property-123');
      expect(result).toEqual(marketAnalysis);
    });

    it('should handle market analysis errors', async () => {
      service.getMarketAnalysis.mockRejectedValue(new Error('Property not found'));

      await expect(controller.getMarketAnalysis('non-existent')).rejects.toThrow('Property not found');
    });
  });

  describe('uploadImages', () => {
    it('should upload images successfully', async () => {
      const files = [
        { originalname: 'image1.jpg', mimetype: 'image/jpeg', size: 1024 } as Express.Multer.File,
        { originalname: 'image2.jpg', mimetype: 'image/jpeg', size: 2048 } as Express.Multer.File
      ];
      const uploadResult = {
        message: 'Images uploaded successfully',
        images: [{ id: '1', url: 'http://example.com/image1.jpg' }]
      };

      service.uploadImages.mockResolvedValue(uploadResult);

      const result = await controller.uploadImages('property-123', files);

      expect(service.uploadImages).toHaveBeenCalledWith('property-123', files);
      expect(result).toEqual(uploadResult);
    });

    it('should handle upload errors', async () => {
      const files = [{ originalname: 'invalid.txt' } as Express.Multer.File];

      service.uploadImages.mockRejectedValue(new Error('Invalid file type'));

      await expect(controller.uploadImages('property-123', files)).rejects.toThrow('Invalid file type');
    });
  });

  describe('deleteImage', () => {
    it('should delete an image successfully', async () => {
      const deleteResult = { message: 'Image deleted successfully' };
      service.deleteImage.mockResolvedValue(deleteResult);

      const result = await controller.deleteImage('property-123', 'image-456');

      expect(service.deleteImage).toHaveBeenCalledWith('property-123', 'image-456');
      expect(result).toEqual(deleteResult);
    });

    it('should handle image deletion errors', async () => {
      service.deleteImage.mockRejectedValue(new Error('Image not found'));

      await expect(controller.deleteImage('property-123', 'non-existent')).rejects.toThrow('Image not found');
    });
  });

  describe('findByAgent', () => {
    it('should return properties by agent', async () => {
      const agentProperties = [createTestProperty({ agentId: 'agent-123' })];
      service.findByAgent.mockResolvedValue(agentProperties);

      const result = await controller.findByAgent('agent-123');

      expect(service.findByAgent).toHaveBeenCalledWith('agent-123');
      expect(result).toEqual(agentProperties);
    });
  });

  describe('getValuation', () => {
    it('should calculate property valuation', async () => {
      const valuationDto: PropertyValuationDto = {
        bedrooms: 3,
        bathrooms: 2,
        location: { city: 'London' }
      } as PropertyValuationDto;
      const valuation = {
        estimatedValue: 500000,
        confidence: 85,
        priceRange: { min: 450000, max: 550000 }
      };

      service.getPropertyValuation.mockResolvedValue(valuation);

      const result = await controller.getValuation(valuationDto);

      expect(service.getPropertyValuation).toHaveBeenCalledWith(valuationDto);
      expect(result).toEqual(valuation);
    });
  });

  describe('compareProperties', () => {
    it('should compare multiple properties', async () => {
      const propertyIds = ['1', '2', '3'];
      const comparison = {
        properties: [createTestProperty()],
        comparison: { priceRange: { min: 400000, max: 600000 }, averagePrice: 500000 }
      };

      service.compareProperties.mockResolvedValue(comparison);

      const result = await controller.compareProperties(propertyIds);

      expect(service.compareProperties).toHaveBeenCalledWith(propertyIds);
      expect(result).toEqual(comparison);
    });
  });

  describe('getNearbyProperties', () => {
    it('should return nearby properties with default radius', async () => {
      const nearbyProperties = [createTestProperty()];
      service.getNearbyProperties.mockResolvedValue(nearbyProperties);

      const result = await controller.getNearbyProperties('property-123');

      expect(service.getNearbyProperties).toHaveBeenCalledWith('property-123', 5);
      expect(result).toEqual(nearbyProperties);
    });

    it('should return nearby properties with custom radius', async () => {
      const nearbyProperties = [createTestProperty()];
      service.getNearbyProperties.mockResolvedValue(nearbyProperties);

      const result = await controller.getNearbyProperties('property-123', 10);

      expect(service.getNearbyProperties).toHaveBeenCalledWith('property-123', 10);
      expect(result).toEqual(nearbyProperties);
    });
  });

  describe('favorites operations', () => {
    it('should add property to favorites', async () => {
      const user = createTestUser();
      const req = { user };
      const result = { message: 'Property added to favorites' };

      service.addToFavorites.mockResolvedValue(result);

      const response = await controller.addToFavorites('property-123', req);

      expect(service.addToFavorites).toHaveBeenCalledWith('property-123', user.id);
      expect(response).toEqual(result);
    });

    it('should remove property from favorites', async () => {
      const user = createTestUser();
      const req = { user };
      const result = { message: 'Property removed from favorites' };

      service.removeFromFavorites.mockResolvedValue(result);

      const response = await controller.removeFromFavorites('property-123', req);

      expect(service.removeFromFavorites).toHaveBeenCalledWith('property-123', user.id);
      expect(response).toEqual(result);
    });

    it('should get user favorites', async () => {
      const user = createTestUser();
      const req = { user };
      const favorites = [createTestProperty()];

      service.getUserFavorites.mockResolvedValue(favorites);

      const result = await controller.getUserFavorites(req);

      expect(service.getUserFavorites).toHaveBeenCalledWith(user.id);
      expect(result).toEqual(favorites);
    });
  });

  describe('saved searches', () => {
    it('should save search criteria', async () => {
      const user = createTestUser();
      const req = { user };
      const searchDto: PropertySearchDto = {
        location: 'London',
        searchName: 'My London Search'
      };
      const savedSearch = {
        id: '1',
        name: 'My London Search',
        criteria: searchDto,
        userId: user.id
      };

      service.saveSearch.mockResolvedValue(savedSearch);

      const result = await controller.saveSearch(searchDto, req);

      expect(service.saveSearch).toHaveBeenCalledWith(searchDto, user.id);
      expect(result).toEqual(savedSearch);
    });

    it('should get user saved searches', async () => {
      const user = createTestUser();
      const req = { user };
      const savedSearches = [{ id: '1', name: 'London Search' }];

      service.getUserSavedSearches.mockResolvedValue(savedSearches);

      const result = await controller.getUserSavedSearches(req);

      expect(service.getUserSavedSearches).toHaveBeenCalledWith(user.id);
      expect(result).toEqual(savedSearches);
    });

    it('should delete saved search', async () => {
      const user = createTestUser();
      const req = { user };
      const deleteResult = { message: 'Saved search deleted' };

      service.deleteSavedSearch.mockResolvedValue(deleteResult);

      const result = await controller.deleteSavedSearch('search-123', req);

      expect(service.deleteSavedSearch).toHaveBeenCalledWith('search-123', user.id);
      expect(result).toEqual(deleteResult);
    });
  });

  describe('analytics', () => {
    it('should get market trends with default parameters', async () => {
      const trends = {
        trends: [{ month: 'Jan', averagePrice: 450000 }],
        summary: { priceChange: '+4.4%' }
      };

      service.getMarketTrends.mockResolvedValue(trends);

      const result = await controller.getMarketTrends();

      expect(service.getMarketTrends).toHaveBeenCalledWith({
        location: undefined,
        propertyType: undefined,
        period: undefined
      });
      expect(result).toEqual(trends);
    });

    it('should get market trends with filters', async () => {
      const trends = {
        trends: [{ month: 'Jan', averagePrice: 450000 }],
        summary: { priceChange: '+4.4%' }
      };

      service.getMarketTrends.mockResolvedValue(trends);

      const result = await controller.getMarketTrends('London', 'house', '6m');

      expect(service.getMarketTrends).toHaveBeenCalledWith({
        location: 'London',
        propertyType: 'house',
        period: '6m'
      });
      expect(result).toEqual(trends);
    });

    it('should get price history', async () => {
      const priceHistory = {
        propertyId: 'property-123',
        history: [{ date: '2023-01-01', price: 500000 }]
      };

      service.getPriceHistory.mockResolvedValue(priceHistory);

      const result = await controller.getPriceHistory('property-123');

      expect(service.getPriceHistory).toHaveBeenCalledWith('property-123');
      expect(result).toEqual(priceHistory);
    });
  });

  describe('media operations', () => {
    it('should add virtual tour', async () => {
      const tourData = { tourUrl: 'http://example.com/tour', tourType: '360' };
      const tourResult = {
        id: '1',
        propertyId: 'property-123',
        ...tourData
      };

      service.addVirtualTour.mockResolvedValue(tourResult);

      const result = await controller.addVirtualTour('property-123', tourData);

      expect(service.addVirtualTour).toHaveBeenCalledWith('property-123', tourData);
      expect(result).toEqual(tourResult);
    });

    it('should add video', async () => {
      const videoData = { videoUrl: 'http://example.com/video.mp4', title: 'Property Tour' };
      const videoResult = {
        id: '1',
        propertyId: 'property-123',
        ...videoData
      };

      service.addVideo.mockResolvedValue(videoResult);

      const result = await controller.addVideo('property-123', videoData);

      expect(service.addVideo).toHaveBeenCalledWith('property-123', videoData);
      expect(result).toEqual(videoResult);
    });
  });

  describe('energy rating', () => {
    it('should get energy rating', async () => {
      const energyRating = {
        propertyId: 'property-123',
        rating: 'B',
        score: 82,
        certificate: 'EPC-2024-001'
      };

      service.getEnergyRating.mockResolvedValue(energyRating);

      const result = await controller.getEnergyRating('property-123');

      expect(service.getEnergyRating).toHaveBeenCalledWith('property-123');
      expect(result).toEqual(energyRating);
    });

    it('should update energy rating', async () => {
      const energyData = { rating: 'A', certificate: 'EPC-2024-002' };
      const updateResult = {
        propertyId: 'property-123',
        ...energyData,
        updatedAt: new Date()
      };

      service.updateEnergyRating.mockResolvedValue(updateResult);

      const result = await controller.updateEnergyRating('property-123', energyData);

      expect(service.updateEnergyRating).toHaveBeenCalledWith('property-123', energyData);
      expect(result).toEqual(updateResult);
    });
  });
});
