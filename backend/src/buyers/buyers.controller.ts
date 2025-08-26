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
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { BuyersService } from './buyers.service';
import { CreateBuyerDto } from './dto/create-buyer.dto';
import { UpdateBuyerDto } from './dto/update-buyer.dto';
import { CreatePreferenceDto } from './dto/create-preference.dto';
import { CreateSearchDto } from './dto/create-search.dto';
import { RequestValuationDto } from './dto/request-valuation.dto';
import { Buyer } from './entities/buyer.entity';
import { BuyerPreference } from './entities/buyer-preference.entity';
import { PropertySearch } from './entities/property-search.entity';
import { MarketAnalysis, AnalysisType } from './entities/market-analysis.entity';
import { PropertyValuation } from './entities/property-valuation.entity';

@ApiTags('buyers')
@Controller('buyers')
@ApiBearerAuth()
export class BuyersController {
  constructor(private readonly buyersService: BuyersService) {}

  // Buyer Management
  @Post()
  @ApiOperation({ summary: 'Create a new buyer profile' })
  @ApiResponse({ status: 201, description: 'Buyer profile created successfully', type: Buyer })
  async create(@Body() createBuyerDto: CreateBuyerDto): Promise<Buyer> {
    return await this.buyersService.create(createBuyerDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all buyer profiles' })
  @ApiResponse({ status: 200, description: 'List of all buyers', type: [Buyer] })
  async findAll(): Promise<Buyer[]> {
    return await this.buyersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get buyer profile by ID' })
  @ApiResponse({ status: 200, description: 'Buyer profile found', type: Buyer })
  @ApiResponse({ status: 404, description: 'Buyer not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Buyer> {
    return await this.buyersService.findOne(id);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get buyer profile by user ID' })
  @ApiResponse({ status: 200, description: 'Buyer profile found', type: Buyer })
  @ApiResponse({ status: 404, description: 'Buyer profile not found' })
  async findByUserId(@Param('userId', ParseUUIDPipe) userId: string): Promise<Buyer> {
    return await this.buyersService.findByUserId(userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update buyer profile' })
  @ApiResponse({ status: 200, description: 'Buyer profile updated successfully', type: Buyer })
  @ApiResponse({ status: 404, description: 'Buyer not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateBuyerDto: UpdateBuyerDto,
  ): Promise<Buyer> {
    return await this.buyersService.update(id, updateBuyerDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete buyer profile' })
  @ApiResponse({ status: 200, description: 'Buyer profile deleted successfully' })
  @ApiResponse({ status: 404, description: 'Buyer not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return await this.buyersService.remove(id);
  }

  // Buyer Preferences
  @Post(':id/preferences')
  @ApiOperation({ summary: 'Create buyer preference' })
  @ApiResponse({ status: 201, description: 'Preference created successfully', type: BuyerPreference })
  async createPreference(
    @Param('id', ParseUUIDPipe) buyerId: string,
    @Body() createPreferenceDto: CreatePreferenceDto,
  ): Promise<BuyerPreference> {
    return await this.buyersService.createPreference(buyerId, createPreferenceDto);
  }

  @Get(':id/preferences')
  @ApiOperation({ summary: 'Get buyer preferences' })
  @ApiResponse({ status: 200, description: 'List of buyer preferences', type: [BuyerPreference] })
  async getPreferences(@Param('id', ParseUUIDPipe) buyerId: string): Promise<BuyerPreference[]> {
    return await this.buyersService.getPreferences(buyerId);
  }

  @Patch('preferences/:preferenceId')
  @ApiOperation({ summary: 'Update buyer preference' })
  @ApiResponse({ status: 200, description: 'Preference updated successfully', type: BuyerPreference })
  async updatePreference(
    @Param('preferenceId', ParseUUIDPipe) preferenceId: string,
    @Body() updateData: Partial<BuyerPreference>,
  ): Promise<BuyerPreference> {
    return await this.buyersService.updatePreference(preferenceId, updateData);
  }

  @Delete('preferences/:preferenceId')
  @ApiOperation({ summary: 'Delete buyer preference' })
  @ApiResponse({ status: 200, description: 'Preference deleted successfully' })
  async removePreference(@Param('preferenceId', ParseUUIDPipe) preferenceId: string): Promise<void> {
    return await this.buyersService.removePreference(preferenceId);
  }

  // Property Searches
  @Post(':id/searches')
  @ApiOperation({ summary: 'Create property search' })
  @ApiResponse({ status: 201, description: 'Search created successfully', type: PropertySearch })
  async createSearch(
    @Param('id', ParseUUIDPipe) buyerId: string,
    @Body() createSearchDto: CreateSearchDto,
  ): Promise<PropertySearch> {
    return await this.buyersService.createSearch(buyerId, createSearchDto);
  }

  @Get(':id/searches')
  @ApiOperation({ summary: 'Get buyer searches' })
  @ApiResponse({ status: 200, description: 'List of buyer searches', type: [PropertySearch] })
  async getSearches(@Param('id', ParseUUIDPipe) buyerId: string): Promise<PropertySearch[]> {
    return await this.buyersService.getSearches(buyerId);
  }

  @Get(':id/searches/saved')
  @ApiOperation({ summary: 'Get saved searches' })
  @ApiResponse({ status: 200, description: 'List of saved searches', type: [PropertySearch] })
  async getSavedSearches(@Param('id', ParseUUIDPipe) buyerId: string): Promise<PropertySearch[]> {
    return await this.buyersService.getSavedSearches(buyerId);
  }

  @Patch('searches/:searchId')
  @ApiOperation({ summary: 'Update property search' })
  @ApiResponse({ status: 200, description: 'Search updated successfully', type: PropertySearch })
  async updateSearch(
    @Param('searchId', ParseUUIDPipe) searchId: string,
    @Body() updateData: Partial<PropertySearch>,
  ): Promise<PropertySearch> {
    return await this.buyersService.updateSearch(searchId, updateData);
  }

  @Post('searches/:searchId/execute')
  @ApiOperation({ summary: 'Execute property search' })
  @ApiResponse({ status: 200, description: 'Search executed successfully' })
  async executeSearch(@Param('searchId', ParseUUIDPipe) searchId: string): Promise<any> {
    return await this.buyersService.executeSearch(searchId);
  }

  // Market Analysis
  @Get('market-analysis/:area')
  @ApiOperation({ summary: 'Get market analysis for area' })
  @ApiResponse({ status: 200, description: 'Market analysis data', type: [MarketAnalysis] })
  async getMarketAnalysis(
    @Param('area') area: string,
    @Query('postcode') postcode?: string,
  ): Promise<MarketAnalysis[]> {
    return await this.buyersService.getMarketAnalysis(area, postcode);
  }

  @Post('market-analysis/generate')
  @ApiOperation({ summary: 'Generate market analysis' })
  @ApiResponse({ status: 201, description: 'Market analysis generated', type: MarketAnalysis })
  async generateMarketAnalysis(
    @Body() body: { area: string; postcode: string; type: AnalysisType },
  ): Promise<MarketAnalysis> {
    return await this.buyersService.generateMarketAnalysis(body.area, body.postcode, body.type);
  }

  // Property Valuations
  @Post(':id/valuations')
  @ApiOperation({ summary: 'Request property valuation' })
  @ApiResponse({ status: 201, description: 'Valuation requested successfully', type: PropertyValuation })
  async requestValuation(
    @Param('id', ParseUUIDPipe) buyerId: string,
    @Body() requestValuationDto: RequestValuationDto,
  ): Promise<PropertyValuation> {
    return await this.buyersService.requestValuation(buyerId, requestValuationDto);
  }

  @Get(':id/valuations')
  @ApiOperation({ summary: 'Get buyer valuations' })
  @ApiResponse({ status: 200, description: 'List of valuations', type: [PropertyValuation] })
  async getValuations(@Param('id', ParseUUIDPipe) buyerId: string): Promise<PropertyValuation[]> {
    return await this.buyersService.getValuations(buyerId);
  }

  @Post('valuations/avm')
  @ApiOperation({ summary: 'Generate automated valuation' })
  @ApiResponse({ status: 201, description: 'AVM generated successfully', type: PropertyValuation })
  async generateAVM(
    @Body() body: { address: string; postcode: string },
  ): Promise<PropertyValuation> {
    return await this.buyersService.generateAVM(body.address, body.postcode);
  }

  // Financial Assessment
  @Get(':id/affordability')
  @ApiOperation({ summary: 'Assess buyer affordability' })
  @ApiResponse({ status: 200, description: 'Affordability assessment' })
  async assessAffordability(@Param('id', ParseUUIDPipe) buyerId: string): Promise<any> {
    return await this.buyersService.assessAffordability(buyerId);
  }

  // Dashboard
  @Get(':id/dashboard')
  @ApiOperation({ summary: 'Get buyer dashboard data' })
  @ApiResponse({ status: 200, description: 'Dashboard data' })
  async getDashboardData(@Param('id', ParseUUIDPipe) buyerId: string): Promise<any> {
    return await this.buyersService.getDashboardData(buyerId);
  }
}