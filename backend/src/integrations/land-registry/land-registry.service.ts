import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';

export interface PropertyTitleData {
  titleNumber: string;
  address: string;
  tenure: 'Freehold' | 'Leasehold';
  proprietors: Array<{
    name: string;
    address: string;
    type: 'Individual' | 'Company';
  }>;
  charges: Array<{
    type: string;
    chargee: string;
    date: string;
    amount?: number;
  }>;
  restrictions: string[];
  notes: string[];
  lastUpdated: string;
}

export interface PropertyPriceData {
  address: string;
  postcode: string;
  price: number;
  date: string;
  propertyType: string;
  tenure: string;
  newBuild: boolean;
  estate: string;
}

export interface PropertySearchResult {
  titleNumber: string;
  address: string;
  postcode: string;
  tenure: string;
  class: string;
}

@Injectable()
export class LandRegistryService {
  private readonly logger = new Logger(LandRegistryService.name);
  private readonly baseUrl = 'https://landregistry.data.gov.uk';
  private readonly apiKey: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiKey = this.configService.get<string>('LAND_REGISTRY_API_KEY');
  }

  /**
   * Search for property titles by address
   */
  async searchPropertyTitles(address: string, postcode?: string): Promise<PropertySearchResult[]> {
    try {
      const searchQuery = postcode ? `${address}, ${postcode}` : address;
      const url = `${this.baseUrl}/def/common/address`;
      
      const response = await firstValueFrom(
        this.httpService.get(url, {
          params: {
            query: searchQuery,
            format: 'json',
            limit: 50,
          },
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Accept': 'application/json',
          },
        })
      );

      return this.parseSearchResults((response as AxiosResponse<any>).data);
    } catch (error) {
      this.logger.error(`Failed to search property titles: ${error.message}`);
      throw new HttpException(
        'Failed to search property titles',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  /**
   * Get detailed property title information
   */
  async getPropertyTitle(titleNumber: string): Promise<PropertyTitleData> {
    try {
      const url = `${this.baseUrl}/def/title/${titleNumber}`;
      
      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Accept': 'application/json',
          },
        })
      );

      return this.parseTitleData((response as AxiosResponse<any>).data);
    } catch (error) {
      this.logger.error(`Failed to get property title ${titleNumber}: ${error.message}`);
      throw new HttpException(
        'Failed to retrieve property title',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  /**
   * Get property price paid data
   */
  async getPropertyPrices(postcode: string, fromDate?: string, toDate?: string): Promise<PropertyPriceData[]> {
    try {
      const url = `${this.baseUrl}/def/ppi/transaction-record`;
      
      const params: any = {
        postcode,
        format: 'json',
        limit: 100,
      };

      if (fromDate) params.min_date = fromDate;
      if (toDate) params.max_date = toDate;

      const response = await firstValueFrom(
        this.httpService.get(url, {
          params,
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Accept': 'application/json',
          },
        })
      );

      return this.parsePriceData((response as AxiosResponse<any>).data);
    } catch (error) {
      this.logger.error(`Failed to get property prices for ${postcode}: ${error.message}`);
      throw new HttpException(
        'Failed to retrieve property prices',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  /**
   * Get average property prices for an area
   */
  async getAveragePropertyPrices(postcode: string, propertyType?: string): Promise<{
    averagePrice: number;
    medianPrice: number;
    transactionCount: number;
    priceRange: { min: number; max: number };
    lastUpdated: string;
  }> {
    try {
      const prices = await this.getPropertyPrices(postcode);
      
      let filteredPrices = prices;
      if (propertyType) {
        filteredPrices = prices.filter(p => p.propertyType.toLowerCase() === propertyType.toLowerCase());
      }

      if (filteredPrices.length === 0) {
        throw new HttpException('No price data available', HttpStatus.NOT_FOUND);
      }

      const priceValues = filteredPrices.map(p => p.price).sort((a, b) => a - b);
      const averagePrice = priceValues.reduce((sum, price) => sum + price, 0) / priceValues.length;
      const medianPrice = priceValues[Math.floor(priceValues.length / 2)];

      return {
        averagePrice: Math.round(averagePrice),
        medianPrice,
        transactionCount: filteredPrices.length,
        priceRange: {
          min: Math.min(...priceValues),
          max: Math.max(...priceValues),
        },
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Failed to calculate average prices for ${postcode}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Validate property ownership
   */
  async validatePropertyOwnership(titleNumber: string, ownerName: string): Promise<{
    isValid: boolean;
    confidence: number;
    details: string;
  }> {
    try {
      const titleData = await this.getPropertyTitle(titleNumber);
      
      const normalizedOwnerName = ownerName.toLowerCase().trim();
      const matchingProprietors = titleData.proprietors.filter(p => 
        p.name.toLowerCase().includes(normalizedOwnerName) ||
        normalizedOwnerName.includes(p.name.toLowerCase())
      );

      const confidence = matchingProprietors.length > 0 ? 
        (matchingProprietors.length / titleData.proprietors.length) * 100 : 0;

      return {
        isValid: matchingProprietors.length > 0,
        confidence: Math.round(confidence),
        details: matchingProprietors.length > 0 ? 
          `Found ${matchingProprietors.length} matching proprietor(s)` :
          'No matching proprietors found',
      };
    } catch (error) {
      this.logger.error(`Failed to validate ownership for ${titleNumber}: ${error.message}`);
      throw error;
    }
  }

  private parseSearchResults(data: any): PropertySearchResult[] {
    // Parse Land Registry API response format
    if (!data || !data.results) return [];
    
    return data.results.map((result: any) => ({
      titleNumber: result.titleNumber || '',
      address: result.address || '',
      postcode: result.postcode || '',
      tenure: result.tenure || '',
      class: result.class || '',
    }));
  }

  private parseTitleData(data: any): PropertyTitleData {
    // Parse detailed title information
    return {
      titleNumber: data.titleNumber || '',
      address: data.address || '',
      tenure: data.tenure || 'Freehold',
      proprietors: data.proprietors || [],
      charges: data.charges || [],
      restrictions: data.restrictions || [],
      notes: data.notes || [],
      lastUpdated: data.lastUpdated || new Date().toISOString(),
    };
  }

  private parsePriceData(data: any): PropertyPriceData[] {
    // Parse price paid data
    if (!data || !data.results) return [];
    
    return data.results.map((result: any) => ({
      address: result.propertyAddress || '',
      postcode: result.postcode || '',
      price: result.pricePaid || 0,
      date: result.transactionDate || '',
      propertyType: result.propertyType || '',
      tenure: result.tenure || '',
      newBuild: result.newBuild === 'Y',
      estate: result.estateType || '',
    }));
  }
}