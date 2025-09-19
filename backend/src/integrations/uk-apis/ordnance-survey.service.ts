import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

export interface PlaceData {
  gazetteerEntry: {
    id: string;
    names: Array<{
      name: string;
      language: string;
      nameType: string;
    }>;
    type: string;
    localType: string;
    geometry: {
      coordinates: [number, number];
      type: string;
    };
    bbox: [number, number, number, number];
    district: string;
    county: string;
    country: string;
    region: string;
  };
  dpa: {
    uprn: string;
    address: string;
    buildingName?: string;
    buildingNumber?: string;
    thoroughfareName: string;
    dependentLocality?: string;
    postTown: string;
    postcode: string;
    rpc: string;
    xCoordinate: number;
    yCoordinate: number;
    status: string;
    logicalStatus: string;
    classificationCode: string;
    classificationCodeDescription: string;
    localCustodianCode: number;
    localCustodianCodeDescription: string;
    postalAddressCode: string;
    postalAddressCodeDescription: string;
    blpuStateCode: string;
    blpuStateCodeDescription: string;
    topographyLayerToid: string;
    lastUpdateDate: string;
    entryDate: string;
    blpuStateDate: string;
    language: string;
    matchDescription: string;
    matchScore: number;
  };
}

export interface NearestPlaceData {
  header: {
    uri: string;
    query: string;
    offset: number;
    totalresults: number;
    format: string;
    dataset: string;
    lr: string;
    maxresults: number;
    epoch: string;
    lastupdate: string;
    output_srs: string;
  };
  results: PlaceData[];
}

export interface PostcodeData {
  header: {
    uri: string;
    query: string;
    offset: number;
    totalresults: number;
    format: string;
    dataset: string;
    lr: string;
    maxresults: number;
    epoch: string;
    lastupdate: string;
    output_srs: string;
  };
  results: Array<{
    dpa: {
      uprn: string;
      address: string;
      buildingName?: string;
      buildingNumber?: string;
      thoroughfareName: string;
      dependentLocality?: string;
      postTown: string;
      postcode: string;
      xCoordinate: number;
      yCoordinate: number;
      matchScore: number;
    };
  }>;
}

@Injectable()
export class OrdnanceSurveyService {
  private readonly logger = new Logger(OrdnanceSurveyService.name);
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.os.uk';

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiKey = this.configService.get<string>('ORDNANCE_SURVEY_API_KEY');
  }

  /**
   * Search for places by name
   */
  async searchPlaces(query: string, maxResults = 20): Promise<PlaceData[]> {
    try {
      const url = `${this.baseUrl}/search/places/v1/find`;
      
      const response = await firstValueFrom(
        this.httpService.get(url, {
          params: {
            query,
            maxresults: maxResults,
            key: this.apiKey,
          },
        })
      );

      return response.data.results || [];
    } catch (error) {
      this.logger.error(`Failed to search places with query ${query}:`, error.message);
      throw new Error(`Ordnance Survey API error: ${error.message}`);
    }
  }

  /**
   * Get nearest places to coordinates
   */
  async getNearestPlaces(
    longitude: number,
    latitude: number,
    radiusKm = 1,
    maxResults = 20
  ): Promise<NearestPlaceData> {
    try {
      const url = `${this.baseUrl}/search/places/v1/nearest`;
      
      const response = await firstValueFrom(
        this.httpService.get(url, {
          params: {
            point: `${longitude},${latitude}`,
            radius: radiusKm * 1000, // Convert to meters
            maxresults: maxResults,
            key: this.apiKey,
          },
        })
      );

      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get nearest places for coordinates ${longitude},${latitude}:`, error.message);
      throw new Error(`Ordnance Survey API error: ${error.message}`);
    }
  }

  /**
   * Get postcode data
   */
  async getPostcodeData(postcode: string): Promise<PostcodeData> {
    try {
      const cleanPostcode = postcode.replace(/\s+/g, '').toUpperCase();
      const url = `${this.baseUrl}/search/places/v1/postcode`;
      
      const response = await firstValueFrom(
        this.httpService.get(url, {
          params: {
            postcode: cleanPostcode,
            key: this.apiKey,
          },
        })
      );

      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get postcode data for ${postcode}:`, error.message);
      throw new Error(`Ordnance Survey API error: ${error.message}`);
    }
  }

  /**
   * Get UPRN details
   */
  async getUprnDetails(uprn: string): Promise<PlaceData> {
    try {
      const url = `${this.baseUrl}/search/places/v1/uprn`;
      
      const response = await firstValueFrom(
        this.httpService.get(url, {
          params: {
            uprn,
            key: this.apiKey,
          },
        })
      );

      return response.data.results?.[0];
    } catch (error) {
      this.logger.error(`Failed to get UPRN details for ${uprn}:`, error.message);
      throw new Error(`Ordnance Survey API error: ${error.message}`);
    }
  }

  /**
   * Convert British National Grid coordinates to WGS84 (lat/lng)
   */
  async convertBngToWgs84(easting: number, northing: number): Promise<{ latitude: number; longitude: number }> {
    try {
      const url = `${this.baseUrl}/transform/v1/bng`;
      
      const response = await firstValueFrom(
        this.httpService.get(url, {
          params: {
            easting,
            northing,
            key: this.apiKey,
          },
        })
      );

      return {
        latitude: response.data.latitude,
        longitude: response.data.longitude,
      };
    } catch (error) {
      this.logger.error(`Failed to convert BNG coordinates ${easting},${northing}:`, error.message);
      throw new Error(`Ordnance Survey API error: ${error.message}`);
    }
  }

  /**
   * Convert WGS84 (lat/lng) to British National Grid coordinates
   */
  async convertWgs84ToBng(latitude: number, longitude: number): Promise<{ easting: number; northing: number }> {
    try {
      const url = `${this.baseUrl}/transform/v1/wgs84`;
      
      const response = await firstValueFrom(
        this.httpService.get(url, {
          params: {
            lat: latitude,
            lon: longitude,
            key: this.apiKey,
          },
        })
      );

      return {
        easting: response.data.easting,
        northing: response.data.northing,
      };
    } catch (error) {
      this.logger.error(`Failed to convert WGS84 coordinates ${latitude},${longitude}:`, error.message);
      throw new Error(`Ordnance Survey API error: ${error.message}`);
    }
  }

  /**
   * Get map tiles for a specific area
   */
  async getMapTileUrl(
    z: number,
    x: number,
    y: number,
    style = 'outdoor'
  ): Promise<string> {
    return `${this.baseUrl}/maps/raster/v1/zxy/${style}/${z}/${x}/${y}.png?key=${this.apiKey}`;
  }

  /**
   * Get elevation data for coordinates
   */
  async getElevation(longitude: number, latitude: number): Promise<{ elevation: number; resolution: number }> {
    try {
      const url = `${this.baseUrl}/elevation/v1/height`;
      
      const response = await firstValueFrom(
        this.httpService.get(url, {
          params: {
            point: `${longitude},${latitude}`,
            key: this.apiKey,
          },
        })
      );

      return {
        elevation: response.data.elevation,
        resolution: response.data.resolution,
      };
    } catch (error) {
      this.logger.error(`Failed to get elevation for coordinates ${longitude},${latitude}:`, error.message);
      throw new Error(`Ordnance Survey API error: ${error.message}`);
    }
  }

  /**
   * Calculate distance between two points using Haversine formula
   */
  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
      Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Get nearby amenities (schools, hospitals, transport, etc.)
   */
  async getNearbyAmenities(
    longitude: number,
    latitude: number,
    amenityType: string,
    radiusKm = 2
  ): Promise<PlaceData[]> {
    try {
      const places = await this.getNearestPlaces(longitude, latitude, radiusKm, 100);
      
      // Filter by amenity type
      return places.results.filter(place => 
        place.gazetteerEntry.localType.toLowerCase().includes(amenityType.toLowerCase()) ||
        place.gazetteerEntry.type.toLowerCase().includes(amenityType.toLowerCase())
      );
    } catch (error) {
      this.logger.error(`Failed to get nearby amenities:`, error.message);
      throw error;
    }
  }

  /**
   * Get transport links near a location
   */
  async getTransportLinks(
    longitude: number,
    latitude: number,
    radiusKm = 1
  ): Promise<{
    railwayStations: PlaceData[];
    busStops: PlaceData[];
    undergroundStations: PlaceData[];
  }> {
    try {
      const places = await this.getNearestPlaces(longitude, latitude, radiusKm, 100);
      
      const railwayStations = places.results.filter(place => 
        place.gazetteerEntry.localType.toLowerCase().includes('railway') ||
        place.gazetteerEntry.localType.toLowerCase().includes('station')
      );
      
      const busStops = places.results.filter(place => 
        place.gazetteerEntry.localType.toLowerCase().includes('bus')
      );
      
      const undergroundStations = places.results.filter(place => 
        place.gazetteerEntry.localType.toLowerCase().includes('underground') ||
        place.gazetteerEntry.localType.toLowerCase().includes('tube')
      );
      
      return {
        railwayStations,
        busStops,
        undergroundStations,
      };
    } catch (error) {
      this.logger.error(`Failed to get transport links:`, error.message);
      throw error;
    }
  }

  /**
   * Validate coordinates are within UK bounds
   */
  isWithinUkBounds(latitude: number, longitude: number): boolean {
    // UK bounding box (approximate)
    const ukBounds = {
      north: 60.9,
      south: 49.8,
      east: 2.0,
      west: -8.2,
    };
    
    return (
      latitude >= ukBounds.south &&
      latitude <= ukBounds.north &&
      longitude >= ukBounds.west &&
      longitude <= ukBounds.east
    );
  }

  /**
   * Convert degrees to radians
   */
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Get property flood risk data
   */
  async getFloodRisk(longitude: number, latitude: number): Promise<{
    floodZone: string;
    riskLevel: 'low' | 'medium' | 'high';
    details: string;
  }> {
    try {
      // This would integrate with Environment Agency flood data
      // For now, return a placeholder implementation
      const places = await this.getNearestPlaces(longitude, latitude, 0.5, 10);
      
      // Simple heuristic based on nearby water features
      const waterFeatures = places.results.filter(place => 
        place.gazetteerEntry.localType.toLowerCase().includes('water') ||
        place.gazetteerEntry.localType.toLowerCase().includes('river') ||
        place.gazetteerEntry.localType.toLowerCase().includes('stream')
      );
      
      let riskLevel: 'low' | 'medium' | 'high' = 'low';
      let floodZone = 'Zone 1';
      let details = 'Low probability of flooding';
      
      if (waterFeatures.length > 2) {
        riskLevel = 'high';
        floodZone = 'Zone 3';
        details = 'High probability of flooding - near multiple water features';
      } else if (waterFeatures.length > 0) {
        riskLevel = 'medium';
        floodZone = 'Zone 2';
        details = 'Medium probability of flooding - near water features';
      }
      
      return {
        floodZone,
        riskLevel,
        details,
      };
    } catch (error) {
      this.logger.error(`Failed to get flood risk data:`, error.message);
      return {
        floodZone: 'Unknown',
        riskLevel: 'low',
        details: 'Flood risk data unavailable',
      };
    }
  }
}
