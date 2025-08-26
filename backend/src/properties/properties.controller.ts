import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, UploadedFiles, UseInterceptors, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { FilesInterceptor } from '@nestjs/platform-express';
import { PropertiesService } from './properties.service';
import { Property } from './entities/property.entity';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { PropertySearchDto } from './dto/property-search.dto';
import { PropertyValuationDto } from './dto/property-valuation.dto';
import { Express } from 'express';
import 'multer';

@ApiTags('Properties')
@Controller('properties')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new property' })
  @ApiResponse({ status: 201, description: 'Property created successfully', type: Property })
  create(@Body() createPropertyDto: CreatePropertyDto, @Request() req) {
    return this.propertiesService.create(createPropertyDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all properties' })
  @ApiResponse({ status: 200, description: 'Properties retrieved successfully', type: [Property] })
  findAll() {
    return this.propertiesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get property by ID' })
  @ApiResponse({ status: 200, description: 'Property retrieved successfully', type: Property })
  @ApiResponse({ status: 404, description: 'Property not found' })
  findOne(@Param('id') id: string) {
    return this.propertiesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update property' })
  @ApiResponse({ status: 200, description: 'Property updated successfully', type: Property })
  @ApiResponse({ status: 404, description: 'Property not found' })
  update(@Param('id') id: string, @Body() updatePropertyDto: UpdatePropertyDto) {
    return this.propertiesService.update(id, updatePropertyDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete property' })
  @ApiResponse({ status: 200, description: 'Property deleted successfully' })
  @ApiResponse({ status: 404, description: 'Property not found' })
  remove(@Param('id') id: string) {
    return this.propertiesService.remove(id);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search properties' })
  @ApiResponse({ status: 200, description: 'Properties found successfully', type: [Property] })
  search(
    @Query('query') query?: string,
    @Query('location') location?: string,
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
    @Query('propertyType') propertyType?: string,
    @Query('bedrooms') bedrooms?: number,
    @Query('bathrooms') bathrooms?: number,
  ) {
    return this.propertiesService.search({
      query,
      location,
      minPrice,
      maxPrice,
      propertyType,
      bedrooms,
      bathrooms,
    });
  }

  @Get('featured')
  @ApiOperation({ summary: 'Get featured properties' })
  @ApiResponse({ status: 200, description: 'Featured properties retrieved successfully', type: [Property] })
  getFeatured() {
    return this.propertiesService.getFeatured();
  }

  @Get('recent')
  @ApiOperation({ summary: 'Get recent properties' })
  @ApiResponse({ status: 200, description: 'Recent properties retrieved successfully', type: [Property] })
  getRecent(@Query('limit') limit?: number) {
    return this.propertiesService.getRecent(limit || 10);
  }

  @Get(':id/market-analysis')
  @ApiOperation({ summary: 'Get market analysis for property' })
  @ApiResponse({ status: 200, description: 'Market analysis retrieved successfully' })
  getMarketAnalysis(@Param('id') id: string) {
    return this.propertiesService.getMarketAnalysis(id);
  }

  @Post(':id/images')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @UseInterceptors(FilesInterceptor('images', 10))
  @ApiOperation({ summary: 'Upload property images' })
  @ApiResponse({ status: 201, description: 'Images uploaded successfully' })
  uploadImages(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.propertiesService.uploadImages(id, files);
  }

  @Delete(':id/images/:imageId')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete property image' })
  @ApiResponse({ status: 200, description: 'Image deleted successfully' })
  deleteImage(
    @Param('id') propertyId: string,
    @Param('imageId') imageId: string,
  ) {
    return this.propertiesService.deleteImage(propertyId, imageId);
  }

  @Get('agent/:agentId')
  @ApiOperation({ summary: 'Get properties by agent' })
  @ApiResponse({ status: 200, description: 'Agent properties retrieved successfully', type: [Property] })
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
  @ApiResponse({ status: 200, description: 'Nearby properties retrieved successfully', type: [Property] })
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
  @ApiResponse({ status: 200, description: 'User favorites retrieved successfully', type: [Property] })
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