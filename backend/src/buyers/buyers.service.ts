import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Buyer, BuyerStatus, BuyerType, FinancialStatus } from './entities/buyer.entity';
import { BuyerPreference, PreferenceType, PreferencePriority } from './entities/buyer-preference.entity';
import { PropertySearch, SearchType, SearchStatus } from './entities/property-search.entity';
import { MarketAnalysis, AnalysisType, MarketTrend } from './entities/market-analysis.entity';
import { PropertyValuation, ValuationType, ValuationStatus, ConfidenceLevel } from './entities/property-valuation.entity';
import { SavedProperty } from './entities/saved-property.entity';
import { PropertyOffer, OfferStatus, OfferType } from './entities/property-offer.entity';
import { MortgageApplication, ApplicationStatus, MortgageType } from './entities/mortgage-application.entity';
import { Viewing, ViewingStatus, ViewingType } from './entities/viewing.entity';
import { CreateBuyerDto } from './dto/create-buyer.dto';
import { UpdateBuyerDto } from './dto/update-buyer.dto';
import { CreatePreferenceDto } from './dto/create-preference.dto';
import { CreateSearchDto } from './dto/create-search.dto';
import { RequestValuationDto } from './dto/request-valuation.dto';
import { CreateSavedPropertyDto } from './dto/create-saved-property.dto';
import { UpdateSavedPropertyDto } from './dto/update-saved-property.dto';
import { CreatePropertyOfferDto } from './dto/create-property-offer.dto';
import { UpdatePropertyOfferDto } from './dto/update-property-offer.dto';
import { CreateMortgageApplicationDto } from './dto/create-mortgage-application.dto';
import { UpdateMortgageApplicationDto } from './dto/update-mortgage-application.dto';
import { CreateViewingDto } from './dto/create-viewing.dto';
import { UpdateViewingDto } from './dto/update-viewing.dto';

@Injectable()
export class BuyersService {
  constructor(
    @InjectRepository(Buyer)
    private buyerRepository: Repository<Buyer>,
    @InjectRepository(BuyerPreference)
    private preferenceRepository: Repository<BuyerPreference>,
    @InjectRepository(PropertySearch)
    private searchRepository: Repository<PropertySearch>,
    @InjectRepository(MarketAnalysis)
    private analysisRepository: Repository<MarketAnalysis>,
    @InjectRepository(PropertyValuation)
    private valuationRepository: Repository<PropertyValuation>,
    @InjectRepository(SavedProperty)
    private savedPropertyRepository: Repository<SavedProperty>,
    @InjectRepository(PropertyOffer)
    private propertyOfferRepository: Repository<PropertyOffer>,
    @InjectRepository(MortgageApplication)
    private mortgageApplicationRepository: Repository<MortgageApplication>,
    @InjectRepository(Viewing)
    private viewingRepository: Repository<Viewing>,
  ) {}

  // Buyer Management
  async create(createBuyerDto: CreateBuyerDto): Promise<Buyer> {
    const buyer = this.buyerRepository.create(createBuyerDto);
    return await this.buyerRepository.save(buyer);
  }

  async findAll(): Promise<Buyer[]> {
    return await this.buyerRepository.find({
      relations: ['preferences', 'searches', 'valuations'],
      where: { status: BuyerStatus.ACTIVE },
    });
  }

  async findOne(id: string): Promise<Buyer> {
    const buyer = await this.buyerRepository.findOne({
      where: { id, status: BuyerStatus.ACTIVE },
      relations: ['preferences', 'searches', 'valuations'],
    });
    if (!buyer) {
      throw new NotFoundException(`Buyer with ID ${id} not found`);
    }
    return buyer;
  }

  async findByUserId(userId: string): Promise<Buyer> {
    const buyer = await this.buyerRepository.findOne({
      where: { userId, status: BuyerStatus.ACTIVE },
      relations: ['preferences', 'searches', 'valuations'],
    });
    if (!buyer) {
      throw new NotFoundException(`Buyer profile for user ${userId} not found`);
    }
    return buyer;
  }

  async update(id: string, updateBuyerDto: UpdateBuyerDto): Promise<Buyer> {
    const buyer = await this.findOne(id);
    Object.assign(buyer, updateBuyerDto);
    return await this.buyerRepository.save(buyer);
  }

  async remove(id: string): Promise<void> {
    const buyer = await this.findOne(id);
    buyer.status = BuyerStatus.INACTIVE;
    await this.buyerRepository.save(buyer);
  }

  // Buyer Preferences
  async createPreference(buyerId: string, createPreferenceDto: CreatePreferenceDto): Promise<BuyerPreference> {
    await this.findOne(buyerId); // Verify buyer exists
    const preference = this.preferenceRepository.create({
      ...createPreferenceDto,
      buyerId,
    });
    return await this.preferenceRepository.save(preference);
  }

  async getPreferences(buyerId: string): Promise<BuyerPreference[]> {
    return await this.preferenceRepository.find({
      where: { buyerId, isActive: true },
      order: { priority: 'ASC', createdAt: 'DESC' },
    });
  }

  async updatePreference(id: string, updateData: Partial<BuyerPreference>): Promise<BuyerPreference> {
    const preference = await this.preferenceRepository.findOne({ where: { id } });
    if (!preference) {
      throw new NotFoundException(`Preference with ID ${id} not found`);
    }
    Object.assign(preference, updateData);
    return await this.preferenceRepository.save(preference);
  }

  async removePreference(id: string): Promise<void> {
    const preference = await this.preferenceRepository.findOne({ where: { id } });
    if (!preference) {
      throw new NotFoundException(`Preference with ID ${id} not found`);
    }
    preference.isActive = false;
    await this.preferenceRepository.save(preference);
  }

  // Property Searches
  async createSearch(buyerId: string, createSearchDto: CreateSearchDto): Promise<PropertySearch> {
    await this.findOne(buyerId); // Verify buyer exists
    const search = this.searchRepository.create({
      ...createSearchDto,
      buyerId,
    });
    return await this.searchRepository.save(search);
  }

  async getSearches(buyerId: string): Promise<PropertySearch[]> {
    return await this.searchRepository.find({
      where: { buyerId },
      order: { createdAt: 'DESC' },
    });
  }

  async getSavedSearches(buyerId: string): Promise<PropertySearch[]> {
    return await this.searchRepository.find({
      where: { 
        buyerId, 
        type: SearchType.SAVED_SEARCH,
        status: SearchStatus.ACTIVE,
      },
      order: { createdAt: 'DESC' },
    });
  }

  async updateSearch(id: string, updateData: Partial<PropertySearch>): Promise<PropertySearch> {
    const search = await this.searchRepository.findOne({ where: { id } });
    if (!search) {
      throw new NotFoundException(`Search with ID ${id} not found`);
    }
    Object.assign(search, updateData);
    return await this.searchRepository.save(search);
  }

  async executeSearch(searchId: string): Promise<any> {
    const search = await this.searchRepository.findOne({ where: { id: searchId } });
    if (!search) {
      throw new NotFoundException(`Search with ID ${searchId} not found`);
    }

    // Update last search date
    search.lastSearchDate = new Date();
    await this.searchRepository.save(search);

    // TODO: Implement actual property search logic
    // This would integrate with property service to find matching properties
    return {
      searchId,
      criteria: search,
      results: [], // Placeholder for actual search results
      totalCount: 0,
    };
  }

  // Market Analysis
  async getMarketAnalysis(area: string, postcode?: string): Promise<MarketAnalysis[]> {
    const whereCondition: any = { area, isActive: true };
    if (postcode) {
      whereCondition.postcode = postcode;
    }

    return await this.analysisRepository.find({
      where: whereCondition,
      order: { analysisDate: 'DESC' },
    });
  }

  async generateMarketAnalysis(area: string, postcode: string, type: AnalysisType): Promise<MarketAnalysis> {
    // Check if recent analysis exists
    const existingAnalysis = await this.analysisRepository.findOne({
      where: {
        area,
        postcode,
        type,
        isActive: true,
        analysisDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Within last 7 days
      },
    });

    if (existingAnalysis) {
      return existingAnalysis;
    }

    // Generate new analysis
    const analysis = this.analysisRepository.create({
      type,
      area,
      postcode,
      analysisDate: new Date(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Valid for 30 days
      // TODO: Implement actual market analysis logic
      averagePrice: 450000,
      medianPrice: 425000,
      trend: MarketTrend.RISING,
      priceChangePercent: 5.2,
      averageDaysOnMarket: 45,
      marketInsights: 'Market showing strong growth with high demand',
    });

    return await this.analysisRepository.save(analysis);
  }

  // Property Valuations
  async requestValuation(buyerId: string, requestValuationDto: RequestValuationDto): Promise<PropertyValuation> {
    await this.findOne(buyerId); // Verify buyer exists

    const valuation = this.valuationRepository.create({
      ...requestValuationDto,
      buyerId,
      status: ValuationStatus.PENDING,
      requestedDate: new Date(),
    });

    return await this.valuationRepository.save(valuation);
  }

  async getValuations(buyerId: string): Promise<PropertyValuation[]> {
    return await this.valuationRepository.find({
      where: { buyerId, isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  async generateAVM(address: string, postcode: string): Promise<PropertyValuation> {
    // TODO: Implement Automated Valuation Model logic
    // This would integrate with external APIs or internal algorithms
    
    const valuation = this.valuationRepository.create({
      type: ValuationType.AVM,
      status: ValuationStatus.COMPLETED,
      address,
      postcode,
      estimatedValue: 425000,
      lowerEstimate: 400000,
      upperEstimate: 450000,
      confidenceLevel: ConfidenceLevel.MEDIUM,
      confidenceScore: 75.5,
      methodology: 'Automated Valuation Model using comparable sales and market data',
      completedDate: new Date(),
      validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // Valid for 90 days
    });

    return await this.valuationRepository.save(valuation);
  }

  // Financial Assessment
  async assessAffordability(buyerId: string): Promise<any> {
    const buyer = await this.findOne(buyerId);
    
    const monthlyIncome = buyer.monthlyIncome || 0;
    const monthlyExpenses = buyer.monthlyExpenses || 0;
    const existingDebt = 0; // No existingDebt property in Buyer entity
    const deposit = buyer.depositAmount || 0;
    
    const disposableIncome = monthlyIncome - monthlyExpenses;
    const maxMonthlyPayment = disposableIncome * 0.35; // 35% of disposable income
    const maxLoanAmount = maxMonthlyPayment * 12 * 25; // Assuming 25-year mortgage
    const maxPurchasePrice = maxLoanAmount + deposit;
    
    return {
      buyerId,
      monthlyIncome,
      monthlyExpenses,
      disposableIncome,
      maxMonthlyPayment,
      maxLoanAmount,
      maxPurchasePrice,
      deposit,
      debtToIncomeRatio: existingDebt / (monthlyIncome * 12),
      recommendation: maxPurchasePrice > 200000 ? 'Good affordability' : 'Consider increasing deposit or income',
    };
  }

  // Dashboard Data
  async getDashboardData(buyerId: string): Promise<any> {
    const buyer = await this.findOne(buyerId);
    const preferences = await this.getPreferences(buyerId);
    const searches = await this.getSearches(buyerId);
    const valuations = await this.getValuations(buyerId);
    const affordability = await this.assessAffordability(buyerId);
    
    return {
      buyer,
      preferences: preferences.slice(0, 5), // Top 5 preferences
      recentSearches: searches.slice(0, 3), // Last 3 searches
      savedSearches: searches.filter(s => s.type === SearchType.SAVED_SEARCH),
      recentValuations: valuations.slice(0, 3), // Last 3 valuations
      affordability,
      stats: {
        totalSearches: searches.length,
        savedSearches: searches.filter(s => s.type === SearchType.SAVED_SEARCH).length,
        totalValuations: valuations.length,
        activePreferences: preferences.length,
      },
    };
  }

  // Saved Properties Management
  async saveProperty(buyerId: string, createSavedPropertyDto: CreateSavedPropertyDto): Promise<SavedProperty> {
    await this.findOne(buyerId); // Verify buyer exists
    
    // Check if property is already saved
    const existingSaved = await this.savedPropertyRepository.findOne({
      where: { buyerId, propertyId: createSavedPropertyDto.propertyId, isActive: true },
    });
    
    if (existingSaved) {
      throw new BadRequestException('Property is already saved');
    }
    
    const savedProperty = this.savedPropertyRepository.create({
      ...createSavedPropertyDto,
      buyerId,
    });
    
    return await this.savedPropertyRepository.save(savedProperty);
  }

  async getSavedProperties(buyerId: string): Promise<SavedProperty[]> {
    return await this.savedPropertyRepository.find({
      where: { buyerId, isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  async updateSavedProperty(id: string, updateSavedPropertyDto: UpdateSavedPropertyDto): Promise<SavedProperty> {
    const savedProperty = await this.savedPropertyRepository.findOne({ where: { id } });
    if (!savedProperty) {
      throw new NotFoundException(`Saved property with ID ${id} not found`);
    }
    
    Object.assign(savedProperty, updateSavedPropertyDto);
    return await this.savedPropertyRepository.save(savedProperty);
  }

  async removeSavedProperty(buyerId: string, propertyId: string): Promise<void> {
    const savedProperty = await this.savedPropertyRepository.findOne({
      where: { buyerId, propertyId, isActive: true },
    });
    
    if (!savedProperty) {
      throw new NotFoundException('Saved property not found');
    }
    
    savedProperty.isActive = false;
    await this.savedPropertyRepository.save(savedProperty);
  }

  // Property Offers Management
  async submitOffer(buyerId: string, createPropertyOfferDto: CreatePropertyOfferDto): Promise<PropertyOffer> {
    await this.findOne(buyerId); // Verify buyer exists
    
    const offer = this.propertyOfferRepository.create({
      ...createPropertyOfferDto,
      buyerId,
      status: OfferStatus.PENDING,
    });
    
    return await this.propertyOfferRepository.save(offer);
  }

  async getBuyerOffers(buyerId: string): Promise<PropertyOffer[]> {
    return await this.propertyOfferRepository.find({
      where: { buyerId },
      order: { createdAt: 'DESC' },
    });
  }

  async updateOffer(offerId: string, updatePropertyOfferDto: UpdatePropertyOfferDto): Promise<PropertyOffer> {
    const offer = await this.propertyOfferRepository.findOne({ where: { id: offerId } });
    if (!offer) {
      throw new NotFoundException(`Offer with ID ${offerId} not found`);
    }
    
    Object.assign(offer, updatePropertyOfferDto);
    return await this.propertyOfferRepository.save(offer);
  }

  async withdrawOffer(offerId: string): Promise<void> {
    const offer = await this.propertyOfferRepository.findOne({ where: { id: offerId } });
    if (!offer) {
      throw new NotFoundException(`Offer with ID ${offerId} not found`);
    }
    
    if (offer.status === OfferStatus.ACCEPTED || offer.status === OfferStatus.REJECTED) {
      throw new BadRequestException('Cannot withdraw an offer that has been accepted or rejected');
    }
    
    offer.status = OfferStatus.WITHDRAWN;
    await this.propertyOfferRepository.save(offer);
  }

  // Mortgage Applications Management
  async submitMortgageApplication(buyerId: string, createMortgageApplicationDto: CreateMortgageApplicationDto): Promise<MortgageApplication> {
    await this.findOne(buyerId); // Verify buyer exists
    
    const application = this.mortgageApplicationRepository.create({
      ...createMortgageApplicationDto,
      buyerId,
      status: ApplicationStatus.SUBMITTED,
      submittedDate: new Date(),
    });
    
    return await this.mortgageApplicationRepository.save(application);
  }

  async getMortgageApplications(buyerId: string): Promise<MortgageApplication[]> {
    return await this.mortgageApplicationRepository.find({
      where: { buyerId },
      order: { createdAt: 'DESC' },
    });
  }

  async updateMortgageApplication(applicationId: string, updateMortgageApplicationDto: UpdateMortgageApplicationDto): Promise<MortgageApplication> {
    const application = await this.mortgageApplicationRepository.findOne({ where: { id: applicationId } });
    if (!application) {
      throw new NotFoundException(`Mortgage application with ID ${applicationId} not found`);
    }
    
    Object.assign(application, updateMortgageApplicationDto);
    return await this.mortgageApplicationRepository.save(application);
  }

  async getMortgageApplicationStatus(applicationId: string): Promise<{ status: ApplicationStatus; lastUpdated: Date; details?: string }> {
    const application = await this.mortgageApplicationRepository.findOne({ where: { id: applicationId } });
    if (!application) {
      throw new NotFoundException(`Mortgage application with ID ${applicationId} not found`);
    }
    
    return {
      status: application.status,
      lastUpdated: application.updatedAt,
      details: application.notes,
    };
  }

  // Viewings Management
  async scheduleViewing(buyerId: string, createViewingDto: CreateViewingDto): Promise<Viewing> {
    await this.findOne(buyerId); // Verify buyer exists
    
    const viewing = this.viewingRepository.create({
      ...createViewingDto,
      buyerId,
      status: ViewingStatus.SCHEDULED,
    });
    
    return await this.viewingRepository.save(viewing);
  }

  async getScheduledViewings(buyerId: string): Promise<Viewing[]> {
    return await this.viewingRepository.find({
      where: { buyerId },
      order: { scheduledDate: 'ASC' },
    });
  }

  async updateViewing(viewingId: string, updateViewingDto: UpdateViewingDto): Promise<Viewing> {
    const viewing = await this.viewingRepository.findOne({ where: { id: viewingId } });
    if (!viewing) {
      throw new NotFoundException(`Viewing with ID ${viewingId} not found`);
    }
    
    Object.assign(viewing, updateViewingDto);
    return await this.viewingRepository.save(viewing);
  }

  async cancelViewing(viewingId: string, cancellationReason?: string): Promise<void> {
    const viewing = await this.viewingRepository.findOne({ where: { id: viewingId } });
    if (!viewing) {
      throw new NotFoundException(`Viewing with ID ${viewingId} not found`);
    }
    
    if (viewing.status === ViewingStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel a completed viewing');
    }
    
    viewing.status = ViewingStatus.CANCELLED;
    if (cancellationReason) {
      viewing.cancellationReason = cancellationReason;
    }
    
    await this.viewingRepository.save(viewing);
  }
}
