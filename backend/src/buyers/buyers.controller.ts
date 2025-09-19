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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth ,
  getSchemaPath,} from '@nestjs/swagger';
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
import { SavedProperty } from './entities/saved-property.entity';
import { PropertyOffer } from './entities/property-offer.entity';
import { MortgageApplication, ApplicationStatus } from './entities/mortgage-application.entity';
import { Viewing } from './entities/viewing.entity';
import { CreateSavedPropertyDto } from './dto/create-saved-property.dto';
import { UpdateSavedPropertyDto } from './dto/update-saved-property.dto';
import { CreatePropertyOfferDto } from './dto/create-property-offer.dto';
import { UpdatePropertyOfferDto } from './dto/update-property-offer.dto';
import { CreateMortgageApplicationDto } from './dto/create-mortgage-application.dto';
import { UpdateMortgageApplicationDto } from './dto/update-mortgage-application.dto';
import { CreateViewingDto } from './dto/create-viewing.dto';
import { UpdateViewingDto } from './dto/update-viewing.dto';

@ApiTags('buyers')
@Controller('buyers')
@ApiBearerAuth()
export class BuyersController {
  constructor(private readonly buyersService: BuyersService) {}

  // Buyer Management
  @Post()
  @ApiOperation({ summary: 'Create a new buyer profile' })
  @ApiResponse({ status: 201, description: 'Buyer profile created successfully', schema: { $ref: getSchemaPath(Buyer) } })
  async create(@Body() createBuyerDto: CreateBuyerDto): Promise<Buyer> {
    return await this.buyersService.create(createBuyerDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all buyer profiles' })
  @ApiResponse({ status: 200, description: 'List of all buyers', schema: { type: 'array', items: { $ref: getSchemaPath(Buyer) } } })
  async findAll(): Promise<Buyer[]> {
    return await this.buyersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get buyer profile by ID' })
  @ApiResponse({ status: 200, description: 'Buyer profile found', schema: { $ref: getSchemaPath(Buyer) } })
  @ApiResponse({ status: 404, description: 'Buyer not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Buyer> {
    return await this.buyersService.findOne(id);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get buyer profile by user ID' })
  @ApiResponse({ status: 200, description: 'Buyer profile found', schema: { $ref: getSchemaPath(Buyer) } })
  @ApiResponse({ status: 404, description: 'Buyer profile not found' })
  async findByUserId(@Param('userId', ParseUUIDPipe) userId: string): Promise<Buyer> {
    return await this.buyersService.findByUserId(userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update buyer profile' })
  @ApiResponse({ status: 200, description: 'Buyer profile updated successfully', schema: { $ref: getSchemaPath(Buyer) } })
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
  @ApiResponse({ status: 201, description: 'Preference created successfully', schema: { $ref: getSchemaPath(BuyerPreference) } })
  async createPreference(
    @Param('id', ParseUUIDPipe) buyerId: string,
    @Body() createPreferenceDto: CreatePreferenceDto,
  ): Promise<BuyerPreference> {
    return await this.buyersService.createPreference(buyerId, createPreferenceDto);
  }

  @Get(':id/preferences')
  @ApiOperation({ summary: 'Get buyer preferences' })
  @ApiResponse({ status: 200, description: 'List of buyer preferences', schema: { type: 'array', items: { $ref: getSchemaPath(BuyerPreference) } } })
  async getPreferences(@Param('id', ParseUUIDPipe) buyerId: string): Promise<BuyerPreference[]> {
    return await this.buyersService.getPreferences(buyerId);
  }

  @Patch('preferences/:preferenceId')
  @ApiOperation({ summary: 'Update buyer preference' })
  @ApiResponse({ status: 200, description: 'Preference updated successfully', schema: { $ref: getSchemaPath(BuyerPreference) } })
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
  @ApiResponse({ status: 201, description: 'Search created successfully', schema: { $ref: getSchemaPath(PropertySearch) } })
  async createSearch(
    @Param('id', ParseUUIDPipe) buyerId: string,
    @Body() createSearchDto: CreateSearchDto,
  ): Promise<PropertySearch> {
    return await this.buyersService.createSearch(buyerId, createSearchDto);
  }

  @Get(':id/searches')
  @ApiOperation({ summary: 'Get buyer searches' })
  @ApiResponse({ status: 200, description: 'List of buyer searches', schema: { type: 'array', items: { $ref: getSchemaPath(PropertySearch) } } })
  async getSearches(@Param('id', ParseUUIDPipe) buyerId: string): Promise<PropertySearch[]> {
    return await this.buyersService.getSearches(buyerId);
  }

  @Get(':id/searches/saved')
  @ApiOperation({ summary: 'Get saved searches' })
  @ApiResponse({ status: 200, description: 'List of saved searches', schema: { type: 'array', items: { $ref: getSchemaPath(PropertySearch) } } })
  async getSavedSearches(@Param('id', ParseUUIDPipe) buyerId: string): Promise<PropertySearch[]> {
    return await this.buyersService.getSavedSearches(buyerId);
  }

  @Patch('searches/:searchId')
  @ApiOperation({ summary: 'Update property search' })
  @ApiResponse({ status: 200, description: 'Search updated successfully', schema: { $ref: getSchemaPath(PropertySearch) } })
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
  @ApiResponse({ status: 200, description: 'Market analysis data', schema: { type: 'array', items: { $ref: getSchemaPath(MarketAnalysis) } } })
  async getMarketAnalysis(
    @Param('area') area: string,
    @Query('postcode') postcode?: string,
  ): Promise<MarketAnalysis[]> {
    return await this.buyersService.getMarketAnalysis(area, postcode);
  }

  @Post('market-analysis/generate')
  @ApiOperation({ summary: 'Generate market analysis' })
  @ApiResponse({ status: 201, description: 'Market analysis generated', schema: { $ref: getSchemaPath(MarketAnalysis) } })
  async generateMarketAnalysis(
    @Body() body: { area: string; postcode: string; type: AnalysisType },
  ): Promise<MarketAnalysis> {
    return await this.buyersService.generateMarketAnalysis(body.area, body.postcode, body.type);
  }

  // Property Valuations
  @Post(':id/valuations')
  @ApiOperation({ summary: 'Request property valuation' })
  @ApiResponse({ status: 201, description: 'Valuation requested successfully', schema: { $ref: getSchemaPath(PropertyValuation) } })
  async requestValuation(
    @Param('id', ParseUUIDPipe) buyerId: string,
    @Body() requestValuationDto: RequestValuationDto,
  ): Promise<PropertyValuation> {
    return await this.buyersService.requestValuation(buyerId, requestValuationDto);
  }

  @Get(':id/valuations')
  @ApiOperation({ summary: 'Get buyer valuations' })
  @ApiResponse({ status: 200, description: 'List of valuations', schema: { type: 'array', items: { $ref: getSchemaPath(PropertyValuation) } } })
  async getValuations(@Param('id', ParseUUIDPipe) buyerId: string): Promise<PropertyValuation[]> {
    return await this.buyersService.getValuations(buyerId);
  }

  @Post('valuations/avm')
  @ApiOperation({ summary: 'Generate automated valuation' })
  @ApiResponse({ status: 201, description: 'AVM generated successfully', schema: { $ref: getSchemaPath(PropertyValuation) } })
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

  // Saved Properties
  @Post(':id/saved-properties')
  @ApiOperation({ summary: 'Save a property to buyer favorites' })
  @ApiResponse({ status: 201, description: 'Property saved successfully', schema: { $ref: getSchemaPath(SavedProperty) } })
  @ApiResponse({ status: 404, description: 'Buyer not found' })
  async saveProperty(
    @Param('id', ParseUUIDPipe) buyerId: string,
    @Body() createSavedPropertyDto: CreateSavedPropertyDto,
  ): Promise<SavedProperty> {
    return await this.buyersService.saveProperty(buyerId, createSavedPropertyDto);
  }

  @Get(':id/saved-properties')
  @ApiOperation({ summary: 'Get buyer saved properties' })
  @ApiResponse({ status: 200, description: 'List of saved properties', schema: { type: 'array', items: { $ref: getSchemaPath(SavedProperty) } } })
  async getSavedProperties(@Param('id', ParseUUIDPipe) buyerId: string): Promise<SavedProperty[]> {
    return await this.buyersService.getSavedProperties(buyerId);
  }

  @Patch('saved-properties/:savedPropertyId')
  @ApiOperation({ summary: 'Update saved property details' })
  @ApiResponse({ status: 200, description: 'Saved property updated successfully', schema: { $ref: getSchemaPath(SavedProperty) } })
  @ApiResponse({ status: 404, description: 'Saved property not found' })
  async updateSavedProperty(
    @Param('savedPropertyId', ParseUUIDPipe) savedPropertyId: string,
    @Body() updateSavedPropertyDto: UpdateSavedPropertyDto,
  ): Promise<SavedProperty> {
    return await this.buyersService.updateSavedProperty(savedPropertyId, updateSavedPropertyDto);
  }

  @Delete(':id/saved-properties/:propertyId')
  @ApiOperation({ summary: 'Remove property from saved list' })
  @ApiResponse({ status: 200, description: 'Property removed from saved list successfully' })
  @ApiResponse({ status: 404, description: 'Saved property not found' })
  async removeSavedProperty(
    @Param('id', ParseUUIDPipe) buyerId: string,
    @Param('propertyId', ParseUUIDPipe) propertyId: string,
  ): Promise<void> {
    return await this.buyersService.removeSavedProperty(buyerId, propertyId);
  }

  // Property Offers
  @Post(':id/offers')
  @ApiOperation({ summary: 'Submit a property offer' })
  @ApiResponse({ status: 201, description: 'Offer submitted successfully', schema: { $ref: getSchemaPath(PropertyOffer) } })
  @ApiResponse({ status: 404, description: 'Buyer not found' })
  async submitOffer(
    @Param('id', ParseUUIDPipe) buyerId: string,
    @Body() createPropertyOfferDto: CreatePropertyOfferDto,
  ): Promise<PropertyOffer> {
    return await this.buyersService.submitOffer(buyerId, createPropertyOfferDto);
  }

  @Get(':id/offers')
  @ApiOperation({ summary: 'Get buyer property offers' })
  @ApiResponse({ status: 200, description: 'List of property offers', schema: { type: 'array', items: { $ref: getSchemaPath(PropertyOffer) } } })
  async getBuyerOffers(@Param('id', ParseUUIDPipe) buyerId: string): Promise<PropertyOffer[]> {
    return await this.buyersService.getBuyerOffers(buyerId);
  }

  @Patch('offers/:offerId')
  @ApiOperation({ summary: 'Update property offer status' })
  @ApiResponse({ status: 200, description: 'Offer updated successfully', schema: { $ref: getSchemaPath(PropertyOffer) } })
  @ApiResponse({ status: 404, description: 'Offer not found' })
  async updateOffer(
    @Param('offerId', ParseUUIDPipe) offerId: string,
    @Body() updatePropertyOfferDto: UpdatePropertyOfferDto,
  ): Promise<PropertyOffer> {
    return await this.buyersService.updateOffer(offerId, updatePropertyOfferDto);
  }

  @Delete('offers/:offerId')
  @ApiOperation({ summary: 'Withdraw property offer' })
  @ApiResponse({ status: 200, description: 'Offer withdrawn successfully' })
  @ApiResponse({ status: 404, description: 'Offer not found' })
  async withdrawOffer(@Param('offerId', ParseUUIDPipe) offerId: string): Promise<void> {
    return await this.buyersService.withdrawOffer(offerId);
  }

  // Mortgage Applications
  @Post(':id/mortgage-applications')
  @ApiOperation({ summary: 'Submit mortgage application' })
  @ApiResponse({ status: 201, description: 'Mortgage application submitted successfully', schema: { $ref: getSchemaPath(MortgageApplication) } })
  @ApiResponse({ status: 404, description: 'Buyer not found' })
  async submitMortgageApplication(
    @Param('id', ParseUUIDPipe) buyerId: string,
    @Body() createMortgageApplicationDto: CreateMortgageApplicationDto,
  ): Promise<MortgageApplication> {
    return await this.buyersService.submitMortgageApplication(buyerId, createMortgageApplicationDto);
  }

  @Get(':id/mortgage-applications')
  @ApiOperation({ summary: 'Get buyer mortgage applications' })
  @ApiResponse({ status: 200, description: 'List of mortgage applications', schema: { type: 'array', items: { $ref: getSchemaPath(MortgageApplication) } } })
  async getMortgageApplications(@Param('id', ParseUUIDPipe) buyerId: string): Promise<MortgageApplication[]> {
    return await this.buyersService.getMortgageApplications(buyerId);
  }

  @Patch('mortgage-applications/:applicationId')
  @ApiOperation({ summary: 'Update mortgage application' })
  @ApiResponse({ status: 200, description: 'Mortgage application updated successfully', schema: { $ref: getSchemaPath(MortgageApplication) } })
  @ApiResponse({ status: 404, description: 'Mortgage application not found' })
  async updateMortgageApplication(
    @Param('applicationId', ParseUUIDPipe) applicationId: string,
    @Body() updateMortgageApplicationDto: UpdateMortgageApplicationDto,
  ): Promise<MortgageApplication> {
    return await this.buyersService.updateMortgageApplication(applicationId, updateMortgageApplicationDto);
  }

  @Get('mortgage-applications/:applicationId/status')
  @ApiOperation({ summary: 'Get mortgage application status' })
  @ApiResponse({ status: 200, description: 'Mortgage application status' })
  @ApiResponse({ status: 404, description: 'Mortgage application not found' })
  async getMortgageApplicationStatus(@Param('applicationId', ParseUUIDPipe) applicationId: string): Promise<{ status: ApplicationStatus; lastUpdated: Date; details?: string }> {
    return await this.buyersService.getMortgageApplicationStatus(applicationId);
  }

  // Viewings
  @Post(':id/viewings')
  @ApiOperation({ summary: 'Schedule property viewing' })
  @ApiResponse({ status: 201, description: 'Viewing scheduled successfully', schema: { $ref: getSchemaPath(Viewing) } })
  @ApiResponse({ status: 404, description: 'Buyer not found' })
  async scheduleViewing(
    @Param('id', ParseUUIDPipe) buyerId: string,
    @Body() createViewingDto: CreateViewingDto,
  ): Promise<Viewing> {
    return await this.buyersService.scheduleViewing(buyerId, createViewingDto);
  }

  @Get(':id/viewings')
  @ApiOperation({ summary: 'Get buyer scheduled viewings' })
  @ApiResponse({ status: 200, description: 'List of scheduled viewings', schema: { type: 'array', items: { $ref: getSchemaPath(Viewing) } } })
  async getScheduledViewings(@Param('id', ParseUUIDPipe) buyerId: string): Promise<Viewing[]> {
    return await this.buyersService.getScheduledViewings(buyerId);
  }

  @Patch('viewings/:viewingId')
  @ApiOperation({ summary: 'Update viewing details' })
  @ApiResponse({ status: 200, description: 'Viewing updated successfully', schema: { $ref: getSchemaPath(Viewing) } })
  @ApiResponse({ status: 404, description: 'Viewing not found' })
  async updateViewing(
    @Param('viewingId', ParseUUIDPipe) viewingId: string,
    @Body() updateViewingDto: UpdateViewingDto,
  ): Promise<Viewing> {
    return await this.buyersService.updateViewing(viewingId, updateViewingDto);
  }

  @Delete('viewings/:viewingId')
  @ApiOperation({ summary: 'Cancel viewing' })
  @ApiResponse({ status: 200, description: 'Viewing cancelled successfully' })
  @ApiResponse({ status: 404, description: 'Viewing not found' })
  async cancelViewing(@Param('viewingId', ParseUUIDPipe) viewingId: string): Promise<void> {
    return await this.buyersService.cancelViewing(viewingId);
  }
}
