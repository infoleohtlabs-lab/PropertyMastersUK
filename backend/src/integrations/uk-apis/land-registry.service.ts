import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

export interface LandRegistryPropertyData {
  titleNumber: string;
  address: string;
  tenure: string;
  proprietors: Array<{
    name: string;
    address: string;
  }>;
  charges: Array<{
    type: string;
    date: string;
    details: string;
  }>;
  restrictions: Array<{
    type: string;
    details: string;
  }>;
  priceData: Array<{
    date: string;
    price: number;
    propertyType: string;
  }>;
}

export interface PropertyPriceData {
  postcode: string;
  address: string;
  date: string;
  price: number;
  propertyType: string;
  oldNew: string;
  duration: string;
  paon: string;
  saon: string;
  street: string;
  locality: string;
  town: string;
  district: string;
  county: string;
}

@Injectable()
export class LandRegistryService {
  private readonly logger = new Logger(LandRegistryService.name);
  private readonly apiKey: string;
  private readonly baseUrl = 'https://landregistry.data.gov.uk';

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiKey = this.configService.get<string>('LAND_REGISTRY_API_KEY');
  }

  /**
   * Get property details by title number
   */
  async getPropertyByTitleNumber(titleNumber: string): Promise<LandRegistryPropertyData> {
    try {
      const url = `${this.baseUrl}/def/ccod/${titleNumber}`;
      
      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
          },
        })
      );

      return this.transformPropertyData(response.data);
    } catch (error) {
      this.logger.error(`Failed to fetch property data for title ${titleNumber}:`, error.message);
      throw new Error(`Land Registry API error: ${error.message}`);
    }
  }

  /**
   * Search for property prices by postcode
   */
  async getPropertyPricesByPostcode(postcode: string, limit = 100): Promise<PropertyPriceData[]> {
    try {
      const url = `${this.baseUrl}/def/ppi`;
      
      const response = await firstValueFrom(
        this.httpService.get(url, {
          params: {
            postcode: postcode.replace(/\s+/g, '').toUpperCase(),
            limit,
          },
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
          },
        })
      );

      return response.data.result?.items || [];
    } catch (error) {
      this.logger.error(`Failed to fetch price data for postcode ${postcode}:`, error.message);
      throw new Error(`Land Registry API error: ${error.message}`);
    }
  }

  /**
   * Get average property prices for an area
   */
  async getAveragePropertyPrices(postcode: string): Promise<{
    averagePrice: number;
    medianPrice: number;
    priceRange: { min: number; max: number };
    sampleSize: number;
    lastUpdated: Date;
  }> {
    try {
      const priceData = await this.getPropertyPricesByPostcode(postcode);
      
      if (priceData.length === 0) {
        return {
          averagePrice: 0,
          medianPrice: 0,
          priceRange: { min: 0, max: 0 },
          sampleSize: 0,
          lastUpdated: new Date(),
        };
      }

      const prices = priceData.map(item => item.price).sort((a, b) => a - b);
      const sum = prices.reduce((acc, price) => acc + price, 0);
      const average = sum / prices.length;
      const median = prices[Math.floor(prices.length / 2)];

      return {
        averagePrice: Math.round(average),
        medianPrice: median,
        priceRange: {
          min: Math.min(...prices),
          max: Math.max(...prices),
        },
        sampleSize: prices.length,
        lastUpdated: new Date(),
      };
    } catch (error) {
      this.logger.error(`Failed to calculate average prices for ${postcode}:`, error.message);
      throw error;
    }
  }

  /**
   * Search properties by address
   */
  async searchPropertiesByAddress(address: string): Promise<PropertyPriceData[]> {
    try {
      const url = `${this.baseUrl}/def/ppi`;
      
      const response = await firstValueFrom(
        this.httpService.get(url, {
          params: {
            street: address,
            limit: 50,
          },
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
          },
        })
      );

      return response.data.result?.items || [];
    } catch (error) {
      this.logger.error(`Failed to search properties by address ${address}:`, error.message);
      throw new Error(`Land Registry API error: ${error.message}`);
    }
  }

  /**
   * Transform raw API data to our format
   */
  private transformPropertyData(rawData: any): LandRegistryPropertyData {
    return {
      titleNumber: rawData.titleNumber || '',
      address: rawData.address || '',
      tenure: rawData.tenure || '',
      proprietors: rawData.proprietors || [],
      charges: rawData.charges || [],
      restrictions: rawData.restrictions || [],
      priceData: rawData.priceData || [],
    };
  }

  /**
   * Validate postcode format
   */
  private isValidPostcode(postcode: string): boolean {
    const postcodeRegex = /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i;
    return postcodeRegex.test(postcode.replace(/\s+/g, ''));
  }

  /**
   * Get property ownership history
   */
  async getOwnershipHistory(titleNumber: string): Promise<any[]> {
    try {
      const url = `${this.baseUrl}/def/ccod/${titleNumber}/proprietors`;
      
      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
          },
        })
      );

      return response.data.result?.items || [];
    } catch (error) {
      this.logger.error(`Failed to fetch ownership history for ${titleNumber}:`, error.message);
      throw new Error(`Land Registry API error: ${error.message}`);
    }
  }
}
