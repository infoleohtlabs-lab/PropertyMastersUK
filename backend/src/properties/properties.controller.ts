import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, UploadedFiles, UseInterceptors, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam, ApiBody, ApiConsumes, getSchemaPath } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { FilesInterceptor } from '@nestjs/platform-express';
import { PropertiesService } from './properties.service';
import { Property } from './entities/property.entity';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { PropertyValuationDto } from './dto/property-valuation.dto';
import { PropertySearchDto } from './dto/property-search.dto';
import { ApiSuccessResponse, ApiErrorResponse, PaginatedResponse } from '../common/dto/api-response.dto';
import { Express } from 'express';
import 'multer';

@ApiTags('Properties')
@Controller('properties')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Create a new property',
    description: 'Create a new property listing with detailed information including location, features, and pricing.'
  })
  @ApiBody({ 
    type: CreatePropertyDto,
    description: 'Property creation data'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Property created successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiSuccessResponse) },
        {
          properties: {
            data: { $ref: getSchemaPath(Property) }
          }
        }
      ]
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid property data', schema: { $ref: getSchemaPath(ApiErrorResponse) } })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - authentication required', schema: { $ref: getSchemaPath(ApiErrorResponse) } })
  create(@Body() createPropertyDto: CreatePropertyDto, @Request() req) {
    return this.propertiesService.create(createPropertyDto, req.user.id);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Get all properties',
    description: 'Retrieve all property listings with basic filtering and pagination support.'
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number for pagination' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of items per page' })
  @ApiQuery({ name: 'status', required: false, type: String, description: 'Property status filter' })
  @ApiResponse({ 
    status: 200, 
    description: 'Properties retrieved successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiSuccessResponse) },
        {
          properties: {
            data: {
              type: 'array',
              items: { $ref: getSchemaPath(Property) }
            }
          }
        }
      ]
    }
  })
  findAll() {
    return this.propertiesService.findAll();
  }

  @Get('search')
  @ApiOperation({ 
    summary: 'Search properties with advanced filtering and pagination',
    description: 'Advanced property search with filters for location, price range, property type, features, and more.'
  })
  @ApiQuery({ name: 'location', required: false, type: String, description: 'Location search term' })
  @ApiQuery({ name: 'minPrice', required: false, type: Number, description: 'Minimum price filter' })
  @ApiQuery({ name: 'maxPrice', required: false, type: Number, description: 'Maximum price filter' })
  @ApiQuery({ name: 'propertyType', required: false, type: String, description: 'Property type filter' })
  @ApiQuery({ name: 'bedrooms', required: false, type: Number, description: 'Number of bedrooms' })
  @ApiQuery({ name: 'bathrooms', required: false, type: Number, description: 'Number of bathrooms' })
  @ApiResponse({ 
    status: 200, 
    description: 'Properties found successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiSuccessResponse) },
        {
          properties: {
            data: { $ref: getSchemaPath(PaginatedResponse) }
          }
        }
      ]
    }
  })
  async search(@Query() searchDto: PropertySearchDto) {
    return this.propertiesService.search(searchDto);
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get property by ID',
    description: 'Retrieve detailed information about a specific property including all features, images, and related data.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Property unique identifier',
    type: String
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Property retrieved successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiSuccessResponse) },
        {
          properties: {
            data: { $ref: getSchemaPath(Property) }
          }
        }
      ]
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Property not found', schema: { $ref: getSchemaPath(ApiErrorResponse) } })
  findOne(@Param('id') id: string) {
    return this.propertiesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Update property',
    description: 'Update property information including details, pricing, and features. Only property owner or admin can update.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Property unique identifier',
    type: String
  })
  @ApiBody({ 
    type: UpdatePropertyDto,
    description: 'Property update data'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Property updated successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiSuccessResponse) },
        {
          properties: {
            data: { $ref: getSchemaPath(Property) }
          }
        }
      ]
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid update data', schema: { $ref: getSchemaPath(ApiErrorResponse) } })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - authentication required', schema: { $ref: getSchemaPath(ApiErrorResponse) } })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - insufficient permissions', schema: { $ref: getSchemaPath(ApiErrorResponse) } })
  @ApiResponse({ 
    status: 404, 
    description: 'Property not found', schema: { $ref: getSchemaPath(ApiErrorResponse) } })
  update(@Param('id') id: string, @Body() updatePropertyDto: UpdatePropertyDto, @Request() req) {
    return this.propertiesService.update(id, updatePropertyDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Delete property',
    description: 'Permanently delete a property listing. Only property owner or admin can delete.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Property unique identifier',
    type: String
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Property deleted successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiSuccessResponse) },
        {
          properties: {
            data: {
              type: 'object',
              properties: {
                message: { type: 'string', example: 'Property deleted successfully' }
              }
            }
          }
        }
      ]
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - authentication required', schema: { $ref: getSchemaPath(ApiErrorResponse) } })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - insufficient permissions', schema: { $ref: getSchemaPath(ApiErrorResponse) } })
  @ApiResponse({ 
    status: 404, 
    description: 'Property not found', schema: { $ref: getSchemaPath(ApiErrorResponse) } })
  remove(@Param('id') id: string, @Request() req) {
    return this.propertiesService.remove(id);
  }

  @Get('featured')
  @ApiOperation({ 
    summary: 'Get featured properties',
    description: 'Retrieve a list of featured properties that are highlighted for promotion.'
  })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Maximum number of featured properties to return' })
  @ApiResponse({ 
    status: 200, 
    description: 'Featured properties retrieved successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiSuccessResponse) },
        {
          properties: {
            data: {
              type: 'array',
              items: { $ref: getSchemaPath(Property) }
            }
          }
        }
      ]
    }
  })
  getFeatured() {
    return this.propertiesService.getFeatured();
  }

  @Get('recent')
  @ApiOperation({ 
    summary: 'Get recently added properties',
    description: 'Retrieve the most recently added property listings.'
  })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Maximum number of recent properties to return' })
  @ApiResponse({ 
    status: 200, 
    description: 'Recent properties retrieved successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiSuccessResponse) },
        {
          properties: {
            data: {
              type: 'array',
              items: { $ref: getSchemaPath(Property) }
            }
          }
        }
      ]
    }
  })
  getRecent(@Query('limit') limit?: number) {
    return this.propertiesService.getRecent(limit || 10);
  }

  @Get(':id/market-analysis')
  @ApiOperation({ 
    summary: 'Get market analysis for property',
    description: 'Retrieve comprehensive market analysis including price trends, demand metrics, and comparative data for a specific property.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Property unique identifier',
    type: String
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Market analysis retrieved successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiSuccessResponse) },
        {
          properties: {
            data: {
              type: 'object',
              properties: {
                propertyId: { type: 'string' },
                averagePrice: { type: 'number' },
                priceChange: { type: 'number' },
                demandLevel: { type: 'string' },
                marketTrends: { type: 'array', items: { type: 'object' } }
              }
            }
          }
        }
      ]
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Property not found', schema: { $ref: getSchemaPath(ApiErrorResponse) } })
  getMarketAnalysis(@Param('id') id: string) {
    return this.propertiesService.getMarketAnalysis(id);
  }

  @Post(':id/images')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @UseInterceptors(FilesInterceptor('images', 10))
  @ApiOperation({ 
    summary: 'Upload property images',
    description: 'Upload multiple images for a property. Maximum 10 images allowed per upload.'
  })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ 
    name: 'id', 
    description: 'Property unique identifier',
    type: String
  })
  @ApiBody({
    description: 'Property images to upload',
    schema: {
      type: 'object',
      properties: {
        images: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary'
          },
          maxItems: 10
        }
      }
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Images uploaded successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiSuccessResponse) },
        {
          properties: {
            data: {
              type: 'object',
              properties: {
                uploadedImages: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      url: { type: 'string' },
                      filename: { type: 'string' }
                    }
                  }
                }
              }
            }
          }
        }
      ]
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid file format or size', schema: { $ref: getSchemaPath(ApiErrorResponse) } })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - authentication required', schema: { $ref: getSchemaPath(ApiErrorResponse) } })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - insufficient permissions', schema: { $ref: getSchemaPath(ApiErrorResponse) } })
  @ApiResponse({ 
    status: 404, 
    description: 'Property not found', schema: { $ref: getSchemaPath(ApiErrorResponse) } })
  uploadImages(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.propertiesService.uploadImages(id, files);
  }

  @Delete(':id/images/:imageId')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Delete property image',
    description: 'Remove a specific image from a property listing. Only property owner or admin can delete images.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Property unique identifier',
    type: String
  })
  @ApiParam({ 
    name: 'imageId', 
    description: 'Image unique identifier',
    type: String
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Image deleted successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiSuccessResponse) },
        {
          properties: {
            data: {
              type: 'object',
              properties: {
                message: { type: 'string', example: 'Image deleted successfully' }
              }
            }
          }
        }
      ]
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - authentication required', schema: { $ref: getSchemaPath(ApiErrorResponse) } })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - insufficient permissions', schema: { $ref: getSchemaPath(ApiErrorResponse) } })
  @ApiResponse({ 
    status: 404, 
    description: 'Property or image not found', schema: { $ref: getSchemaPath(ApiErrorResponse) } })
  deleteImage(
    @Param('id') propertyId: string,
    @Param('imageId') imageId: string,
  ) {
    return this.propertiesService.deleteImage(propertyId, imageId);
  }

  @Get('agent/:agentId')
  @ApiOperation({ summary: 'Get properties by agent' })
  @ApiResponse({ status: 200, description: 'Agent properties retrieved successfully', schema: { type: 'array', items: { $ref: getSchemaPath(Property) } } })
  findByAgent(@Param('agentId') agentId: string) {
    return this.propertiesService.findByAgent(agentId);
  }

  @Post('valuation')
  @ApiOperation({ summary: 'Get property valuation estimate' })
  @ApiResponse({ status: 200, description: 'Property valuation calculated successfully' })
  getValuation(@Body() valuationDto: PropertyValuationDto) {
    return this.propertiesService.getPropertyValuation(valuationDto);
  }

  @Post('compare')
  @ApiOperation({ summary: 'Compare multiple properties' })
  @ApiResponse({ status: 200, description: 'Property comparison generated successfully' })
  compareProperties(@Body('propertyIds') propertyIds: string[]) {
    return this.propertiesService.compareProperties(propertyIds);
  }

  @Get('nearby/:id')
  @ApiOperation({ summary: 'Get nearby properties' })
  @ApiResponse({ status: 200, description: 'Nearby properties retrieved successfully', schema: { type: 'array', items: { $ref: getSchemaPath(Property) } } })
  @ApiQuery({ name: 'radius', required: false, description: 'Search radius in kilometers' })
  getNearbyProperties(
    @Param('id') id: string,
    @Query('radius') radius?: number,
  ) {
    return this.propertiesService.getNearbyProperties(id, radius || 5);
  }

  @Post(':id/favorite')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add property to favorites' })
  @ApiResponse({ status: 200, description: 'Property added to favorites successfully' })
  addToFavorites(@Param('id') id: string, @Request() req) {
    return this.propertiesService.addToFavorites(id, req.user.id);
  }

  @Delete(':id/favorite')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove property from favorites' })
  @ApiResponse({ status: 200, description: 'Property removed from favorites successfully' })
  removeFromFavorites(@Param('id') id: string, @Request() req) {
    return this.propertiesService.removeFromFavorites(id, req.user.id);
  }

  @Get('user/favorites')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user favorite properties' })
  @ApiResponse({ status: 200, description: 'User favorites retrieved successfully', schema: { type: 'array', items: { $ref: getSchemaPath(Property) } } })
  getUserFavorites(@Request() req) {
    return this.propertiesService.getUserFavorites(req.user.id);
  }

  @Post('saved-search')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Save property search criteria' })
  @ApiResponse({ status: 201, description: 'Search criteria saved successfully' })
  saveSearch(@Body() searchDto: PropertySearchDto, @Request() req) {
    return this.propertiesService.saveSearch(searchDto, req.user.id);
  }

  @Get('user/saved-searches')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user saved searches' })
  @ApiResponse({ status: 200, description: 'Saved searches retrieved successfully' })
  getUserSavedSearches(@Request() req) {
    return this.propertiesService.getUserSavedSearches(req.user.id);
  }

  @Delete('saved-search/:id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete saved search' })
  @ApiResponse({ status: 200, description: 'Saved search deleted successfully' })
  deleteSavedSearch(@Param('id') id: string, @Request() req) {
    return this.propertiesService.deleteSavedSearch(id, req.user.id);
  }

  @Get('analytics/trends')
  @ApiOperation({ summary: 'Get property market trends' })
  @ApiResponse({ status: 200, description: 'Market trends retrieved successfully' })
  @ApiQuery({ name: 'location', required: false })
  @ApiQuery({ name: 'propertyType', required: false })
  @ApiQuery({ name: 'period', required: false, description: 'Time period (1m, 3m, 6m, 1y)' })
  getMarketTrends(
    @Query('location') location?: string,
    @Query('propertyType') propertyType?: string,
    @Query('period') period?: string,
  ) {
    return this.propertiesService.getMarketTrends({ location, propertyType, period });
  }

  @Get('analytics/price-history/:id')
  @ApiOperation({ summary: 'Get property price history' })
  @ApiResponse({ status: 200, description: 'Price history retrieved successfully' })
  getPriceHistory(@Param('id') id: string) {
    return this.propertiesService.getPriceHistory(id);
  }

  @Post(':id/virtual-tour')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add virtual tour to property' })
  @ApiResponse({ status: 201, description: 'Virtual tour added successfully' })
  addVirtualTour(
    @Param('id') id: string,
    @Body() tourData: { tourUrl: string; tourType: string; description?: string },
  ) {
    return this.propertiesService.addVirtualTour(id, tourData);
  }

  @Post(':id/video')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add video to property' })
  @ApiResponse({ status: 201, description: 'Video added successfully' })
  addVideo(
    @Param('id') id: string,
    @Body() videoData: { videoUrl: string; title: string; description?: string },
  ) {
    return this.propertiesService.addVideo(id, videoData);
  }

  @Get(':id/energy-rating')
  @ApiOperation({ summary: 'Get property energy rating' })
  @ApiResponse({ status: 200, description: 'Energy rating retrieved successfully' })
  getEnergyRating(@Param('id') id: string) {
    return this.propertiesService.getEnergyRating(id);
  }

  @Post(':id/energy-rating')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update property energy rating' })
  @ApiResponse({ status: 200, description: 'Energy rating updated successfully' })
  updateEnergyRating(
    @Param('id') id: string,
    @Body() energyData: { rating: string; certificate?: string; validUntil?: Date },
  ) {
    return this.propertiesService.updateEnergyRating(id, energyData);
  }
}
