import {
  Property,
  PropertyType,
  PropertyStatus,
  PriceType,
  SearchFilters,
  SearchResult,
  SearchSuggestion,
  SearchInsights,
  MarketTrend,
  SearchPriceInsights,
  SearchLocationInsights,
  SearchRecommendation,
  AIPropertyInsights,
  PriceAnalysis,
  LocationInsights,
  MarketPrediction,
  InvestmentPotential
} from '../types';

class AISearchService {
  private readonly API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
  private readonly AI_API_KEY = import.meta.env.VITE_AI_API_KEY || '';

  /**
   * Process natural language search query and convert to structured filters
   */
  async processNaturalLanguageQuery(query: string): Promise<{
    filters: SearchFilters;
    suggestions: SearchSuggestion[];
    insights: SearchInsights;
  }> {
    try {
      // Simulate AI processing - in production, this would call an AI service
      const processedQuery = this.parseNaturalLanguage(query);
      
      const filters = this.extractFiltersFromQuery(query);
      const suggestions = await this.generateSearchSuggestions(query);
      const insights = await this.generateSearchInsights(query, filters);

      return {
        filters,
        suggestions,
        insights
      };
    } catch (error) {
      console.error('Error processing natural language query:', error);
      throw new Error('Failed to process search query');
    }
  }

  /**
   * Generate smart property recommendations based on user preferences and search history
   */
  async generateSmartRecommendations(
    userId: string,
    searchHistory: SearchFilters[],
    currentFilters?: SearchFilters
  ): Promise<SearchRecommendation[]> {
    try {
      // Simulate AI recommendation engine
      const userPreferences = this.analyzeUserPreferences(searchHistory);
      const marketData = await this.getMarketData();
      
      return this.generateRecommendations(userPreferences, marketData, currentFilters);
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return [];
    }
  }

  /**
   * Get AI-powered property insights
   */
  async getPropertyInsights(propertyId: string): Promise<AIPropertyInsights> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/ai/property-insights/${propertyId}`, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch property insights');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching property insights:', error);
      // Return mock data for development
      return this.generateMockPropertyInsights(propertyId);
    }
  }

  /**
   * Perform intelligent property search with AI enhancements
   */
  async intelligentSearch(
    query: string,
    filters: SearchFilters,
    userId?: string
  ): Promise<SearchResult<Property>> {
    try {
      const enhancedFilters = await this.enhanceFiltersWithAI(filters, query);
      
      const response = await fetch(`${this.API_BASE_URL}/ai/search`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query,
          filters: enhancedFilters,
          userId
        })
      });

      if (!response.ok) {
        throw new Error('Search request failed');
      }

      const result = await response.json();
      
      // Enhance results with AI insights
      result.properties = await this.enhancePropertiesWithAI(result.properties);
      
      return result;
    } catch (error) {
      console.error('Error performing intelligent search:', error);
      // Fallback to basic search
      return this.performBasicSearch(filters);
    }
  }

  /**
   * Generate search suggestions based on partial input
   */
  async getSearchSuggestions(partialQuery: string): Promise<SearchSuggestion[]> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/ai/suggestions?q=${encodeURIComponent(partialQuery)}`, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch suggestions');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      return this.generateMockSuggestions(partialQuery);
    }
  }

  /**
   * Analyze market trends for a specific area
   */
  async analyzeMarketTrends(location: string, propertyType?: string): Promise<MarketTrend[]> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/ai/market-trends`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ location, propertyType })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch market trends');
      }

      return await response.json();
    } catch (error) {
      console.error('Error analyzing market trends:', error);
      return this.generateMockMarketTrends(location);
    }
  }

  /**
   * Get price predictions for a property or area
   */
  async getPricePredictions(
    location: string,
    propertyType: string,
    features: string[]
  ): Promise<MarketPrediction> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/ai/price-predictions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ location, propertyType, features })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch price predictions');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching price predictions:', error);
      return this.generateMockPricePredictions();
    }
  }

  // Private helper methods

  private parseNaturalLanguage(query: string): any {
    // Simulate NLP processing
    const keywords = query.toLowerCase().split(' ');
    const entities = {
      bedrooms: this.extractNumber(query, ['bedroom', 'bed']),
      bathrooms: this.extractNumber(query, ['bathroom', 'bath']),
      propertyType: this.extractPropertyType(query),
      location: this.extractLocation(query),
      priceRange: this.extractPriceRange(query),
      features: this.extractFeatures(query)
    };

    return { keywords, entities };
  }

  private extractFiltersFromQuery(query: string): SearchFilters {
    const lowerQuery = query.toLowerCase();
    
    return {
      type: this.extractPropertyType(lowerQuery),
      bedrooms: this.extractNumber(lowerQuery, ['bedroom', 'bed']),
      bathrooms: this.extractNumber(lowerQuery, ['bathroom', 'bath']),
      minPrice: this.extractMinPrice(lowerQuery),
      maxPrice: this.extractMaxPrice(lowerQuery),
      location: this.extractLocation(lowerQuery),
      features: this.extractFeatures(lowerQuery)
    };
  }

  private extractNumber(query: string, keywords: string[]): number | undefined {
    for (const keyword of keywords) {
      const regex = new RegExp(`(\\d+)\\s*${keyword}`, 'i');
      const match = query.match(regex);
      if (match) {
        return parseInt(match[1]);
      }
    }
    return undefined;
  }

  private extractPropertyType(query: string): PropertyType | undefined {
    if (query.includes('house') || query.includes('bungalow') || query.includes('cottage') || query.includes('mansion')) {
      return PropertyType.HOUSE;
    }
    if (query.includes('flat') || query.includes('apartment') || query.includes('studio')) {
      return PropertyType.FLAT;
    }
    return undefined;
  }

  private extractLocation(query: string): string | undefined {
    // Simple location extraction - in production, use proper NER
    const locationKeywords = ['in', 'near', 'around', 'close to'];
    for (const keyword of locationKeywords) {
      const index = query.indexOf(keyword);
      if (index !== -1) {
        const afterKeyword = query.substring(index + keyword.length).trim();
        const words = afterKeyword.split(' ');
        return words.slice(0, 2).join(' '); // Take first 1-2 words as location
      }
    }
    return undefined;
  }

  private extractPriceRange(query: string): { min?: number; max?: number } {
    const priceRegex = /£([\d,]+)/g;
    const matches = Array.from(query.matchAll(priceRegex));
    
    if (matches.length === 1) {
      const price = parseInt(matches[0][1].replace(/,/g, ''));
      if (query.includes('under') || query.includes('below')) {
        return { max: price };
      } else if (query.includes('over') || query.includes('above')) {
        return { min: price };
      }
    } else if (matches.length === 2) {
      const prices = matches.map(m => parseInt(m[1].replace(/,/g, ''))).sort((a, b) => a - b);
      return { min: prices[0], max: prices[1] };
    }
    
    return {};
  }

  private extractMinPrice(query: string): number | undefined {
    const range = this.extractPriceRange(query);
    return range.min;
  }

  private extractMaxPrice(query: string): number | undefined {
    const range = this.extractPriceRange(query);
    return range.max;
  }

  private extractFeatures(query: string): string[] {
    const features = [
      'garden', 'parking', 'garage', 'balcony', 'terrace', 'fireplace',
      'gym', 'pool', 'swimming pool', 'elevator', 'lift', 'security',
      'furnished', 'unfurnished', 'pet friendly', 'disabled access'
    ];
    
    return features.filter(feature => query.includes(feature));
  }

  private async generateSearchSuggestions(query: string): Promise<SearchSuggestion[]> {
    // Mock suggestions - in production, use AI service
    return [
      {
        id: '1',
        text: `${query} with garden`,
        type: 'feature',
        confidence: 0.9
      },
      {
        id: '2',
        text: `${query} near schools`,
        type: 'location',
        confidence: 0.8
      },
      {
        id: '3',
        text: `${query} with parking`,
        type: 'feature',
        confidence: 0.7
      }
    ];
  }

  private async generateSearchInsights(query: string, filters: SearchFilters): Promise<SearchInsights> {
    return {
      totalResults: 25,
      averagePrice: 485000,
      priceRange: { min: 350000, max: 650000 },
      popularFeatures: ['Garden', 'Parking', 'Modern Kitchen'],
      marketTrends: await this.generateMockMarketTrends(filters.location || 'London'),
      recommendations: [
        'Consider properties with gardens for better value',
        'Look for newly renovated properties in this area',
        'Properties near transport links are in high demand'
      ]
    };
  }

  private analyzeUserPreferences(searchHistory: SearchFilters[]): any {
    // Analyze user's search patterns
    const preferences = {
      preferredPropertyTypes: [],
      preferredLocations: [],
      averagePriceRange: { min: 0, max: 0 },
      preferredFeatures: []
    };
    
    // Simple analysis - in production, use ML algorithms
    return preferences;
  }

  private async getMarketData(): Promise<any> {
    // Fetch current market data
    return {
      averagePrices: {},
      trends: [],
      hotAreas: []
    };
  }

  private generateRecommendations(
    userPreferences: any,
    marketData: any,
    currentFilters?: SearchFilters
  ): SearchRecommendation[] {
    // Mock recommendations
    return [
      {
        id: '1',
        type: 'property',
        title: 'Similar Property Found',
        description: 'Found a property matching your criteria',
        confidence: 0.95,
        reasoning: 'Matches your preferred location and has great investment potential',
        actionable: true,
        metadata: {
           propertyId: '1'
         }
      },
      {
        id: '2',
        type: 'property',
        title: 'Alternative Property',
        description: 'Similar to your recent searches with excellent transport links',
        confidence: 0.88,
        reasoning: 'Price within budget and excellent transport links',
        actionable: true,
        metadata: {
           propertyId: '2'
         }
      }
    ];
  }

  private async enhanceFiltersWithAI(filters: SearchFilters, query: string): Promise<SearchFilters> {
    // AI enhancement of search filters
    return {
      ...filters,
      // Add AI-suggested enhancements
    };
  }

  private async enhancePropertiesWithAI(properties: Property[]): Promise<Property[]> {
    // Add AI insights to each property
    return properties.map(property => ({
      ...property,
      aiInsights: this.generateMockPropertyInsights(property.id)
    }));
  }

  private async performBasicSearch(filters: SearchFilters): Promise<SearchResult<Property>> {
    // Fallback basic search
    return {
      data: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0
    };
  }

  private generateMockSuggestions(query: string): SearchSuggestion[] {
    return [
      {
        id: '1',
        text: `${query} London`,
        type: 'location',
        confidence: 0.9
      },
      {
        id: '2',
        text: `${query} Manchester`,
        type: 'location',
        confidence: 0.8
      }
    ];
  }

  private generateMockMarketTrends(location: string): MarketTrend[] {
    return [
      {
        id: '1',
        location,
        propertyType: PropertyType.HOUSE,
        period: '3_months',
        priceChange: 2.5,
        volumeChange: 5.2,
        averagePrice: 485000,
        daysOnMarket: 28,
        demandLevel: 'high',
        trend: 'rising',
        confidence: 0.85,
        lastUpdated: new Date().toISOString()
      },
      {
        id: '2',
        location,
        propertyType: PropertyType.FLAT,
        period: '6_months',
        priceChange: 3.3,
        volumeChange: 7.1,
        averagePrice: 465000,
        daysOnMarket: 32,
        demandLevel: 'high',
        trend: 'rising',
        confidence: 0.78,
        lastUpdated: new Date().toISOString()
      }
    ];
  }

  private generateMockPriceInsights(): SearchPriceInsights {
    return {
      averagePrice: 485000,
      medianPrice: 465000,
      pricePerSqFt: 485,
      priceChange: {
        monthly: 2.5,
        quarterly: 5.8,
        yearly: 12.3
      },
      priceDistribution: [
        { range: '300k-400k', count: 25, percentage: 20 },
        { range: '400k-500k', count: 45, percentage: 36 },
        { range: '500k-600k', count: 35, percentage: 28 },
        { range: '600k+', count: 20, percentage: 16 }
      ]
    };
  }

  private generateMockLocationInsights(location: string): SearchLocationInsights {
    return {
      location: location,
      popularity: 85,
      averageCommute: 32,
      schoolRating: 8.5,
      crimeRate: 2.1,
      amenityScore: 92,
      transportLinks: ['Underground', 'Bus', 'Rail'],
      nearbyAmenities: {
        schools: 12,
        hospitals: 3,
        shops: 45,
        restaurants: 28,
        parks: 8
      }
    };
  }

  private generateMockPropertyInsights(propertyId: string): AIPropertyInsights {
    return {
      propertyId,
      priceAnalysis: {
        currentValue: 425000,
        estimatedValue: 450000,
        confidence: 0.85,
        priceHistory: [
          { date: '2024-01-01', price: 420000 },
          { date: '2024-02-01', price: 425000 }
        ],
        marketComparison: {
          aboveMarket: false,
          percentage: -5.5
        },
        factors: {
          positive: ['Good location', 'Recent renovations'],
          negative: ['Small garden', 'Busy road']
        }
      },
      locationInsights: {
        walkScore: 88,
        transitScore: 75,
        bikeScore: 65,
        schoolDistrict: {
          rating: 8.5,
          schools: ['Excellent Primary School', 'Good Secondary School']
        },
        demographics: {
          medianAge: 35,
          medianIncome: 45000,
          populationGrowth: 2.1
        },
        amenities: {
          restaurants: 25,
          shopping: 15,
          entertainment: 10,
          healthcare: 5
        }
      },
      marketPrediction: {
        timeframe: '1_year',
        predictedValue: 465000,
        confidence: 0.75,
        trend: 'bullish',
        factors: ['Growing area', 'New transport links'],
        scenarios: {
          optimistic: 485000,
          realistic: 465000,
          pessimistic: 445000
        }
      },
      investmentPotential: {
        score: 8.5,
        grade: 'A',
        roi: {
          rental: 5.2,
          appreciation: 7.3,
          total: 12.5
        },
        risks: {
          level: 'low',
          factors: ['Market volatility', 'Interest rate changes']
        },
        recommendations: ['Strong Buy', 'Good rental potential']
      },
      comparableProperties: [],
      riskFactors: ['Market volatility'],
      opportunities: ['Growing area', 'Transport improvements'],
      lastUpdated: new Date().toISOString()
    };
  }

  private generateMockPricePredictions(): MarketPrediction {
    return {
      timeframe: '1_year',
      predictedValue: 460000,
      confidence: 0.75,
      trend: 'bullish',
      factors: ['Market growth', 'Area development'],
      scenarios: {
        optimistic: 485000,
        realistic: 460000,
        pessimistic: 435000
      }
    };
  }

  private generateMockProperty(id: string): Property {
    return {
      id,
      title: `Beautiful ${id === '1' ? '3' : '2'} Bedroom ${id === '1' ? 'House' : 'Flat'}`,
      description: 'A stunning property in a prime location',
      type: id === '1' ? PropertyType.HOUSE : PropertyType.FLAT,
      status: PropertyStatus.AVAILABLE,
      price: {
        amount: id === '1' ? 425000 : 385000,
        period: 'monthly'
      },
      priceType: PriceType.SALE,
      bedrooms: id === '1' ? 3 : 2,
      bathrooms: id === '1' ? 2 : 1,
      area: id === '1' ? 1200 : 850,
      location: `${id === '1' ? '123 Oak' : '456 Pine'} Street, London`,
      address: {
        street: `${id === '1' ? '123 Oak' : '456 Pine'} Street`,
        city: 'London',
        county: 'Greater London',
        postcode: id === '1' ? 'SW1A 1AA' : 'SW1A 2BB',
        country: 'UK'
      },
      images: [
        {
          id: '1',
          url: 'https://example.com/image1.jpg',
          alt: 'Property image',
          isPrimary: true,
          order: 1
        }
      ],
      features: ['Garden', 'Parking'],
      agentId: '1',
      agent: {
        id: '1',
        userId: '1',
        companyName: 'PropertyMasters UK',
        licenseNumber: 'LIC123456',
        address: {
          street: '123 Business Street',
          city: 'London',
          county: 'Greater London',
          postcode: 'SW1A 1AA',
          country: 'UK'
        },
        specializations: ['Residential Sales'],
        rating: 4.8,
        reviewCount: 125,
        isActive: true,
        phone: '+44 20 1234 5678',
        email: 'john@example.com',
        name: 'John Smith',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  private getAuthToken(): string {
    return localStorage.getItem('auth-token') || '';
  }
}

export const aiSearchService = new AISearchService();
export default aiSearchService;