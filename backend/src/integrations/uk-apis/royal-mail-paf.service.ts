import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

export interface AddressData {
  uprn: string;
  udprn: string;
  addressLine1: string;
  addressLine2?: string;
  addressLine3?: string;
  locality: string;
  townOrCity: string;
  county: string;
  postcode: string;
  country: string;
  xCoordinate?: number;
  yCoordinate?: number;
  latitude?: number;
  longitude?: number;
  matchScore: number;
  addressType: string;
  deliveryPointSuffix?: string;
}

export interface PostcodeData {
  postcode: string;
  quality: number;
  eastings: number;
  northings: number;
  country: string;
  nhsHa: string;
  longitude: number;
  latitude: number;
  europeanElectoralRegion: string;
  primaryCareTrust: string;
  region: string;
  lsoa: string;
  msoa: string;
  incode: string;
  outcode: string;
  parliamentaryConstituency: string;
  adminDistrict: string;
  parish: string;
  adminCounty: string;
  adminWard: string;
  ced: string;
  ccg: string;
  nuts: string;
  codes: {
    adminDistrict: string;
    adminCounty: string;
    adminWard: string;
    parish: string;
    parliamentaryConstituency: string;
    ccg: string;
    ced: string;
    nuts: string;
  };
}

@Injectable()
export class RoyalMailPafService {
  private readonly logger = new Logger(RoyalMailPafService.name);
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.royalmail.com/postcode';
  private readonly addressUrl = 'https://api.royalmail.com/address';

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiKey = this.configService.get<string>('ROYAL_MAIL_API_KEY');
  }

  /**
   * Validate and get details for a postcode
   */
  async validatePostcode(postcode: string): Promise<PostcodeData> {
    try {
      const cleanPostcode = this.cleanPostcode(postcode);
      
      if (!this.isValidPostcodeFormat(cleanPostcode)) {
        throw new Error('Invalid postcode format');
      }

      const url = `${this.baseUrl}/v2/lookup/${cleanPostcode}`;
      
      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Accept': 'application/json',
          },
        })
      );

      return this.transformPostcodeData(response.data);
    } catch (error) {
      this.logger.error(`Failed to validate postcode ${postcode}:`, error.message);
      throw new Error(`Royal Mail PAF API error: ${error.message}`);
    }
  }

  /**
   * Search for addresses by postcode
   */
  async getAddressesByPostcode(postcode: string): Promise<AddressData[]> {
    try {
      const cleanPostcode = this.cleanPostcode(postcode);
      const url = `${this.addressUrl}/v2/lookup/${cleanPostcode}`;
      
      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Accept': 'application/json',
          },
        })
      );

      return (response.data.addresses || []).map(this.transformAddressData);
    } catch (error) {
      this.logger.error(`Failed to get addresses for postcode ${postcode}:`, error.message);
      throw new Error(`Royal Mail PAF API error: ${error.message}`);
    }
  }

  /**
   * Search for addresses by partial address
   */
  async searchAddresses(query: string, maxResults = 20): Promise<AddressData[]> {
    try {
      const url = `${this.addressUrl}/v2/search`;
      
      const response = await firstValueFrom(
        this.httpService.get(url, {
          params: {
            query,
            maxresults: maxResults,
          },
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Accept': 'application/json',
          },
        })
      );

      return (response.data.addresses || []).map(this.transformAddressData);
    } catch (error) {
      this.logger.error(`Failed to search addresses with query ${query}:`, error.message);
      throw new Error(`Royal Mail PAF API error: ${error.message}`);
    }
  }

  /**
   * Get address details by UPRN (Unique Property Reference Number)
   */
  async getAddressByUprn(uprn: string): Promise<AddressData> {
    try {
      const url = `${this.addressUrl}/v2/uprn/${uprn}`;
      
      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Accept': 'application/json',
          },
        })
      );

      return this.transformAddressData(response.data.address);
    } catch (error) {
      this.logger.error(`Failed to get address for UPRN ${uprn}:`, error.message);
      throw new Error(`Royal Mail PAF API error: ${error.message}`);
    }
  }

  /**
   * Validate a full address
   */
  async validateAddress(address: {
    addressLine1: string;
    addressLine2?: string;
    locality?: string;
    townOrCity: string;
    postcode: string;
  }): Promise<{
    isValid: boolean;
    confidence: number;
    suggestedAddress?: AddressData;
    issues: string[];
  }> {
    try {
      const issues: string[] = [];
      
      // First validate the postcode
      let postcodeValid = false;
      try {
        await this.validatePostcode(address.postcode);
        postcodeValid = true;
      } catch (error) {
        issues.push('Invalid postcode');
      }

      if (!postcodeValid) {
        return {
          isValid: false,
          confidence: 0,
          issues,
        };
      }

      // Get addresses for the postcode
      const addresses = await this.getAddressesByPostcode(address.postcode);
      
      // Find the best match
      let bestMatch: AddressData | undefined;
      let bestScore = 0;

      for (const addr of addresses) {
        const score = this.calculateAddressMatchScore(address, addr);
        if (score > bestScore) {
          bestScore = score;
          bestMatch = addr;
        }
      }

      const isValid = bestScore >= 0.8; // 80% confidence threshold
      
      if (!isValid) {
        issues.push('Address not found in Royal Mail database');
      }

      return {
        isValid,
        confidence: bestScore,
        suggestedAddress: bestMatch,
        issues,
      };
    } catch (error) {
      this.logger.error('Failed to validate address:', error.message);
      return {
        isValid: false,
        confidence: 0,
        issues: ['Address validation service unavailable'],
      };
    }
  }

  /**
   * Get nearby postcodes
   */
  async getNearbyPostcodes(postcode: string, radiusKm = 1): Promise<string[]> {
    try {
      const postcodeData = await this.validatePostcode(postcode);
      const url = `${this.baseUrl}/v2/nearest/${postcode}`;
      
      const response = await firstValueFrom(
        this.httpService.get(url, {
          params: {
            radius: radiusKm * 1000, // Convert to meters
          },
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Accept': 'application/json',
          },
        })
      );

      return (response.data.postcodes || []).map((p: any) => p.postcode);
    } catch (error) {
      this.logger.error(`Failed to get nearby postcodes for ${postcode}:`, error.message);
      throw new Error(`Royal Mail PAF API error: ${error.message}`);
    }
  }

  /**
   * Clean and format postcode
   */
  private cleanPostcode(postcode: string): string {
    return postcode.replace(/\s+/g, '').toUpperCase();
  }

  /**
   * Validate postcode format
   */
  private isValidPostcodeFormat(postcode: string): boolean {
    const postcodeRegex = /^[A-Z]{1,2}[0-9][A-Z0-9]?[0-9][A-Z]{2}$/;
    return postcodeRegex.test(postcode);
  }

  /**
   * Transform raw postcode data to our format
   */
  private transformPostcodeData(rawData: any): PostcodeData {
    return {
      postcode: rawData.postcode,
      quality: rawData.quality,
      eastings: rawData.eastings,
      northings: rawData.northings,
      country: rawData.country,
      nhsHa: rawData.nhs_ha,
      longitude: rawData.longitude,
      latitude: rawData.latitude,
      europeanElectoralRegion: rawData.european_electoral_region,
      primaryCareTrust: rawData.primary_care_trust,
      region: rawData.region,
      lsoa: rawData.lsoa,
      msoa: rawData.msoa,
      incode: rawData.incode,
      outcode: rawData.outcode,
      parliamentaryConstituency: rawData.parliamentary_constituency,
      adminDistrict: rawData.admin_district,
      parish: rawData.parish,
      adminCounty: rawData.admin_county,
      adminWard: rawData.admin_ward,
      ced: rawData.ced,
      ccg: rawData.ccg,
      nuts: rawData.nuts,
      codes: rawData.codes || {},
    };
  }

  /**
   * Transform raw address data to our format
   */
  private transformAddressData(rawData: any): AddressData {
    return {
      uprn: rawData.uprn,
      udprn: rawData.udprn,
      addressLine1: rawData.address_line_1,
      addressLine2: rawData.address_line_2,
      addressLine3: rawData.address_line_3,
      locality: rawData.locality,
      townOrCity: rawData.town_or_city,
      county: rawData.county,
      postcode: rawData.postcode,
      country: rawData.country,
      xCoordinate: rawData.x_coordinate,
      yCoordinate: rawData.y_coordinate,
      latitude: rawData.latitude,
      longitude: rawData.longitude,
      matchScore: rawData.match_score || 1.0,
      addressType: rawData.address_type,
      deliveryPointSuffix: rawData.delivery_point_suffix,
    };
  }

  /**
   * Calculate address match score
   */
  private calculateAddressMatchScore(inputAddress: any, pafAddress: AddressData): number {
    let score = 0;
    let totalChecks = 0;

    // Check address line 1
    if (inputAddress.addressLine1 && pafAddress.addressLine1) {
      const similarity = this.calculateStringSimilarity(
        inputAddress.addressLine1.toLowerCase(),
        pafAddress.addressLine1.toLowerCase()
      );
      score += similarity * 0.4; // 40% weight
      totalChecks += 0.4;
    }

    // Check town/city
    if (inputAddress.townOrCity && pafAddress.townOrCity) {
      const similarity = this.calculateStringSimilarity(
        inputAddress.townOrCity.toLowerCase(),
        pafAddress.townOrCity.toLowerCase()
      );
      score += similarity * 0.3; // 30% weight
      totalChecks += 0.3;
    }

    // Check postcode (exact match)
    if (inputAddress.postcode && pafAddress.postcode) {
      const match = this.cleanPostcode(inputAddress.postcode) === this.cleanPostcode(pafAddress.postcode);
      score += match ? 0.3 : 0; // 30% weight
      totalChecks += 0.3;
    }

    return totalChecks > 0 ? score / totalChecks : 0;
  }

  /**
   * Calculate string similarity using Levenshtein distance
   */
  private calculateStringSimilarity(str1: string, str2: string): number {
    const matrix = [];
    const len1 = str1.length;
    const len2 = str2.length;

    for (let i = 0; i <= len2; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= len1; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= len2; i++) {
      for (let j = 1; j <= len1; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    const maxLen = Math.max(len1, len2);
    return maxLen === 0 ? 1 : (maxLen - matrix[len2][len1]) / maxLen;
  }
}
