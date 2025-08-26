import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';

export interface AddressData {
  addressId: string;
  organisationName?: string;
  departmentName?: string;
  poBoxNumber?: string;
  buildingName?: string;
  subBuildingName?: string;
  buildingNumber?: string;
  dependentThoroughfare?: string;
  thoroughfare: string;
  doubleDependentLocality?: string;
  dependentLocality?: string;
  postTown: string;
  county?: string;
  postcode: string;
  postcodeType: string;
  deliveryPointSuffix: string;
  addressType: 'Residential' | 'Commercial' | 'Mixed';
  smallUserOrganisationIndicator?: string;
  udprn: string; // Unique Delivery Point Reference Number
  umprn?: string; // Unique Multiple Residence Reference Number
  postcodePlusCode?: string;
  addressKey: string;
  organisationKey?: string;
  formattedAddress: string[];
}

export interface PostcodeData {
  postcode: string;
  postcodeNoSpaces: string;
  postcodeType: string;
  addressCount: number;
  addresses: AddressData[];
  localAuthority: string;
  county: string;
  country: string;
  region: string;
  parliamentary_constituency: string;
  european_electoral_region: string;
  primary_care_trust: string;
  lsoa: string; // Lower Super Output Area
  msoa: string; // Middle Super Output Area
  nuts: string;
  incode: string;
  outcode: string;
  quality: number;
  eastings: number;
  northings: number;
  latitude: number;
  longitude: number;
  ccg: string; // Clinical Commissioning Group
  ced: string; // County Electoral Division
  ward: string;
}

export interface AddressValidationResult {
  isValid: boolean;
  confidence: number;
  matchType: 'Exact' | 'Close' | 'Partial' | 'None';
  suggestions: AddressData[];
  validationErrors: string[];
  correctedAddress?: AddressData;
}

@Injectable()
export class RoyalMailService {
  private readonly logger = new Logger(RoyalMailService.name);
  private readonly baseUrl = 'https://api.royalmail.net/postcode/v1';
  private readonly apiKey: string;
  private readonly clientId: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiKey = this.configService.get<string>('ROYAL_MAIL_API_KEY');
    this.clientId = this.configService.get<string>('ROYAL_MAIL_CLIENT_ID');
  }

  /**
   * Lookup addresses by postcode
   */
  async lookupPostcode(postcode: string): Promise<PostcodeData> {
    try {
      const cleanPostcode = this.cleanPostcode(postcode);
      const url = `${this.baseUrl}/addresses`;
      
      const response = await firstValueFrom(
        this.httpService.get(url, {
          params: {
            postcode: cleanPostcode,
          },
          headers: {
            'X-IBM-Client-Id': this.clientId,
            'X-IBM-Client-Secret': this.apiKey,
            'Accept': 'application/json',
          },
        })
      );

      return this.parsePostcodeData((response as AxiosResponse<any>).data, cleanPostcode);
    } catch (error) {
      this.logger.error(`Failed to lookup postcode ${postcode}: ${error.message}`);
      throw new HttpException(
        'Failed to lookup postcode',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  /**
   * Search for addresses by partial address
   */
  async searchAddresses(query: string, postcode?: string): Promise<AddressData[]> {
    try {
      const url = `${this.baseUrl}/addresses/search`;
      
      const params: any = {
        query: query.trim(),
        limit: 50,
      };

      if (postcode) {
        params.postcode = this.cleanPostcode(postcode);
      }

      const response = await firstValueFrom(
        this.httpService.get(url, {
          params,
          headers: {
            'X-IBM-Client-Id': this.clientId,
            'X-IBM-Client-Secret': this.apiKey,
            'Accept': 'application/json',
          },
        })
      );

      return this.parseAddressData((response as AxiosResponse<any>).data.addresses || []);
    } catch (error) {
      this.logger.error(`Failed to search addresses: ${error.message}`);
      throw new HttpException(
        'Failed to search addresses',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  /**
   * Get detailed address information by UDPRN
   */
  async getAddressByUDPRN(udprn: string): Promise<AddressData> {
    try {
      const url = `${this.baseUrl}/addresses/${udprn}`;
      
      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: {
            'X-IBM-Client-Id': this.clientId,
            'X-IBM-Client-Secret': this.apiKey,
            'Accept': 'application/json',
          },
        })
      );

      return this.parseAddressData([(response as AxiosResponse<any>).data])[0];
    } catch (error) {
      this.logger.error(`Failed to get address by UDPRN ${udprn}: ${error.message}`);
      throw new HttpException(
        'Failed to retrieve address',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  /**
   * Validate and correct an address
   */
  async validateAddress(address: {
    buildingNumber?: string;
    buildingName?: string;
    thoroughfare?: string;
    locality?: string;
    postTown?: string;
    postcode: string;
  }): Promise<AddressValidationResult> {
    try {
      const postcode = this.cleanPostcode(address.postcode);
      
      // First, get all addresses for the postcode
      const postcodeData = await this.lookupPostcode(postcode);
      
      if (postcodeData.addresses.length === 0) {
        return {
          isValid: false,
          confidence: 0,
          matchType: 'None',
          suggestions: [],
          validationErrors: ['Invalid postcode'],
        };
      }

      // Find matching addresses
      const matches = this.findAddressMatches(address, postcodeData.addresses);
      
      if (matches.exact.length > 0) {
        return {
          isValid: true,
          confidence: 100,
          matchType: 'Exact',
          suggestions: matches.exact,
          validationErrors: [],
          correctedAddress: matches.exact[0],
        };
      }

      if (matches.close.length > 0) {
        return {
          isValid: true,
          confidence: 85,
          matchType: 'Close',
          suggestions: matches.close,
          validationErrors: ['Minor differences found'],
          correctedAddress: matches.close[0],
        };
      }

      if (matches.partial.length > 0) {
        return {
          isValid: false,
          confidence: 60,
          matchType: 'Partial',
          suggestions: matches.partial,
          validationErrors: ['Significant differences found'],
        };
      }

      return {
        isValid: false,
        confidence: 0,
        matchType: 'None',
        suggestions: postcodeData.addresses.slice(0, 10), // Show first 10 as suggestions
        validationErrors: ['No matching address found'],
      };
    } catch (error) {
      this.logger.error(`Failed to validate address: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get postcode information including geographic data
   */
  async getPostcodeInfo(postcode: string): Promise<{
    postcode: string;
    coordinates: { latitude: number; longitude: number };
    adminAreas: {
      localAuthority: string;
      county: string;
      region: string;
      country: string;
      ward: string;
      constituency: string;
    };
    demographics: {
      lsoa: string;
      msoa: string;
      nuts: string;
      ccg: string;
    };
    quality: number;
  }> {
    try {
      const postcodeData = await this.lookupPostcode(postcode);
      
      return {
        postcode: postcodeData.postcode,
        coordinates: {
          latitude: postcodeData.latitude,
          longitude: postcodeData.longitude,
        },
        adminAreas: {
          localAuthority: postcodeData.localAuthority,
          county: postcodeData.county,
          region: postcodeData.region,
          country: postcodeData.country,
          ward: postcodeData.ward,
          constituency: postcodeData.parliamentary_constituency,
        },
        demographics: {
          lsoa: postcodeData.lsoa,
          msoa: postcodeData.msoa,
          nuts: postcodeData.nuts,
          ccg: postcodeData.ccg,
        },
        quality: postcodeData.quality,
      };
    } catch (error) {
      this.logger.error(`Failed to get postcode info: ${error.message}`);
      throw error;
    }
  }

  /**
   * Calculate distance between two postcodes
   */
  async calculateDistance(postcode1: string, postcode2: string): Promise<{
    distanceKm: number;
    distanceMiles: number;
    coordinates1: { latitude: number; longitude: number };
    coordinates2: { latitude: number; longitude: number };
  }> {
    try {
      const [info1, info2] = await Promise.all([
        this.getPostcodeInfo(postcode1),
        this.getPostcodeInfo(postcode2),
      ]);

      const distanceKm = this.haversineDistance(
        info1.coordinates.latitude,
        info1.coordinates.longitude,
        info2.coordinates.latitude,
        info2.coordinates.longitude
      );

      return {
        distanceKm: Math.round(distanceKm * 100) / 100,
        distanceMiles: Math.round(distanceKm * 0.621371 * 100) / 100,
        coordinates1: info1.coordinates,
        coordinates2: info2.coordinates,
      };
    } catch (error) {
      this.logger.error(`Failed to calculate distance: ${error.message}`);
      throw error;
    }
  }

  private cleanPostcode(postcode: string): string {
    return postcode.replace(/\s+/g, '').toUpperCase();
  }

  private parsePostcodeData(data: any, postcode: string): PostcodeData {
    return {
      postcode,
      postcodeNoSpaces: this.cleanPostcode(postcode),
      postcodeType: data.postcode_type || 'Standard',
      addressCount: data.addresses?.length || 0,
      addresses: this.parseAddressData(data.addresses || []),
      localAuthority: data.local_authority || '',
      county: data.county || '',
      country: data.country || 'England',
      region: data.region || '',
      parliamentary_constituency: data.parliamentary_constituency || '',
      european_electoral_region: data.european_electoral_region || '',
      primary_care_trust: data.primary_care_trust || '',
      lsoa: data.lsoa || '',
      msoa: data.msoa || '',
      nuts: data.nuts || '',
      incode: data.incode || '',
      outcode: data.outcode || '',
      quality: data.quality || 1,
      eastings: data.eastings || 0,
      northings: data.northings || 0,
      latitude: data.latitude || 0,
      longitude: data.longitude || 0,
      ccg: data.ccg || '',
      ced: data.ced || '',
      ward: data.ward || '',
    };
  }

  private parseAddressData(addresses: any[]): AddressData[] {
    return addresses.map(addr => ({
      addressId: addr.address_id || '',
      organisationName: addr.organisation_name,
      departmentName: addr.department_name,
      poBoxNumber: addr.po_box_number,
      buildingName: addr.building_name,
      subBuildingName: addr.sub_building_name,
      buildingNumber: addr.building_number,
      dependentThoroughfare: addr.dependent_thoroughfare,
      thoroughfare: addr.thoroughfare || '',
      doubleDependentLocality: addr.double_dependent_locality,
      dependentLocality: addr.dependent_locality,
      postTown: addr.post_town || '',
      county: addr.county,
      postcode: addr.postcode || '',
      postcodeType: addr.postcode_type || 'Standard',
      deliveryPointSuffix: addr.delivery_point_suffix || '',
      addressType: addr.address_type || 'Residential',
      smallUserOrganisationIndicator: addr.small_user_organisation_indicator,
      udprn: addr.udprn || '',
      umprn: addr.umprn,
      postcodePlusCode: addr.postcode_plus_code,
      addressKey: addr.address_key || '',
      organisationKey: addr.organisation_key,
      formattedAddress: this.formatAddress(addr),
    }));
  }

  private formatAddress(addr: any): string[] {
    const lines: string[] = [];
    
    if (addr.organisation_name) lines.push(addr.organisation_name);
    if (addr.department_name) lines.push(addr.department_name);
    
    let addressLine = '';
    if (addr.sub_building_name) addressLine += addr.sub_building_name + ', ';
    if (addr.building_name) addressLine += addr.building_name + ', ';
    if (addr.building_number) addressLine += addr.building_number + ' ';
    if (addr.thoroughfare) addressLine += addr.thoroughfare;
    
    if (addressLine.trim()) lines.push(addressLine.trim().replace(/,$/, ''));
    
    if (addr.dependent_locality) lines.push(addr.dependent_locality);
    if (addr.post_town) lines.push(addr.post_town);
    if (addr.county) lines.push(addr.county);
    if (addr.postcode) lines.push(addr.postcode);
    
    return lines.filter(line => line.trim().length > 0);
  }

  private findAddressMatches(inputAddress: any, addresses: AddressData[]): {
    exact: AddressData[];
    close: AddressData[];
    partial: AddressData[];
  } {
    const exact: AddressData[] = [];
    const close: AddressData[] = [];
    const partial: AddressData[] = [];

    for (const addr of addresses) {
      const score = this.calculateAddressMatchScore(inputAddress, addr);
      
      if (score >= 95) {
        exact.push(addr);
      } else if (score >= 80) {
        close.push(addr);
      } else if (score >= 50) {
        partial.push(addr);
      }
    }

    return { exact, close, partial };
  }

  private calculateAddressMatchScore(input: any, address: AddressData): number {
    let score = 0;
    let totalFields = 0;

    const compareField = (inputValue: string | undefined, addressValue: string | undefined): number => {
      if (!inputValue && !addressValue) return 1;
      if (!inputValue || !addressValue) return 0;
      
      const normalized1 = inputValue.toLowerCase().trim();
      const normalized2 = addressValue.toLowerCase().trim();
      
      if (normalized1 === normalized2) return 1;
      if (normalized1.includes(normalized2) || normalized2.includes(normalized1)) return 0.8;
      
      return 0;
    };

    // Compare building number/name
    if (input.buildingNumber || address.buildingNumber) {
      score += compareField(input.buildingNumber, address.buildingNumber) * 30;
      totalFields += 30;
    }

    if (input.buildingName || address.buildingName) {
      score += compareField(input.buildingName, address.buildingName) * 25;
      totalFields += 25;
    }

    // Compare thoroughfare (street)
    if (input.thoroughfare || address.thoroughfare) {
      score += compareField(input.thoroughfare, address.thoroughfare) * 35;
      totalFields += 35;
    }

    // Compare locality
    if (input.locality || address.dependentLocality) {
      score += compareField(input.locality, address.dependentLocality) * 10;
      totalFields += 10;
    }

    return totalFields > 0 ? (score / totalFields) * 100 : 0;
  }

  private haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}