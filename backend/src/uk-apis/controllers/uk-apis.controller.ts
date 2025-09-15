import {
  Controller,
  Get,
  Query,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';
import { LandRegistryService } from '../services/land-registry.service';
import { CompaniesHouseService } from '../services/companies-house.service';
import { RoyalMailPafService } from '../services/royal-mail-paf.service';
import { OrdnanceSurveyService } from '../services/ordnance-survey.service';

@ApiTags('UK APIs')
@Controller('uk-apis')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UkApisController {
  constructor(
    private readonly landRegistryService: LandRegistryService,
    private readonly companiesHouseService: CompaniesHouseService,
    private readonly royalMailPafService: RoyalMailPafService,
    private readonly ordnanceSurveyService: OrdnanceSurveyService,
  ) {}

  // Land Registry APIs
  @Get('land-registry/property')
  @ApiOperation({ summary: 'Get property details from Land Registry' })
  @ApiResponse({ status: 200, description: 'Property details retrieved successfully' })
  @ApiQuery({ name: 'postcode', required: true, type: String })
  @ApiQuery({ name: 'address', required: true, type: String })
  @Roles(UserRole.LANDLORD, UserRole.AGENT, UserRole.ADMIN)
  async getLandRegistryProperty(
    @Query('postcode') postcode: string,
    @Query('address') address: string,
  ) {
    try {
      return await this.landRegistryService.getPropertyData(address);
    } catch (error) {
      throw new HttpException(
        `Failed to fetch property details: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('land-registry/prices')
  @ApiOperation({ summary: 'Get property prices from Land Registry' })
  @ApiResponse({ status: 200, description: 'Property prices retrieved successfully' })
  @ApiQuery({ name: 'postcode', required: true, type: String })
  @ApiQuery({ name: 'fromDate', required: false, type: String })
  @ApiQuery({ name: 'toDate', required: false, type: String })
  @Roles(UserRole.LANDLORD, UserRole.AGENT, UserRole.ADMIN)
  async getLandRegistryPrices(
    @Query('postcode') postcode: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    try {
      return await this.landRegistryService.getPropertyPrices(
        postcode,
        fromDate,
        toDate,
      );
    } catch (error) {
      throw new HttpException(
        `Failed to fetch property prices: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('land-registry/average-prices')
  @ApiOperation({ summary: 'Get average property prices from Land Registry' })
  @ApiResponse({ status: 200, description: 'Average prices retrieved successfully' })
  @ApiQuery({ name: 'postcode', required: true, type: String })
  @ApiQuery({ name: 'propertyType', required: false, type: String })
  @Roles(UserRole.LANDLORD, UserRole.AGENT, UserRole.ADMIN)
  async getLandRegistryAveragePrices(
    @Query('postcode') postcode: string,
    @Query('propertyType') propertyType?: string,
  ) {
    try {
      return await this.landRegistryService.getAveragePrices(postcode, propertyType);
    } catch (error) {
      throw new HttpException(
        `Failed to fetch average prices: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('land-registry/ownership-history')
  @ApiOperation({ summary: 'Get property ownership history from Land Registry' })
  @ApiResponse({ status: 200, description: 'Ownership history retrieved successfully' })
  @ApiQuery({ name: 'titleNumber', required: true, type: String })
  @Roles(UserRole.LANDLORD, UserRole.AGENT, UserRole.ADMIN)
  async getLandRegistryOwnershipHistory(@Query('titleNumber') titleNumber: string) {
    try {
      return await this.landRegistryService.getOwnershipHistory(titleNumber);
    } catch (error) {
      throw new HttpException(
        `Failed to fetch ownership history: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Companies House APIs
  @Get('companies-house/search')
  @ApiOperation({ summary: 'Search companies in Companies House' })
  @ApiResponse({ status: 200, description: 'Companies search results retrieved successfully' })
  @ApiQuery({ name: 'query', required: true, type: String })
  @ApiQuery({ name: 'itemsPerPage', required: false, type: Number })
  @ApiQuery({ name: 'startIndex', required: false, type: Number })
  @Roles(UserRole.LANDLORD, UserRole.AGENT, UserRole.ADMIN)
  async searchCompanies(
    @Query('query') query: string,
    @Query('itemsPerPage') itemsPerPage = 20,
    @Query('startIndex') startIndex = 0,
  ) {
    try {
      return await this.companiesHouseService.searchCompanies(
        query,
        Number(itemsPerPage),
        Number(startIndex),
      );
    } catch (error) {
      throw new HttpException(
        `Failed to search companies: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('companies-house/company/:companyNumber')
  @ApiOperation({ summary: 'Get company details from Companies House' })
  @ApiResponse({ status: 200, description: 'Company details retrieved successfully' })
  @Roles(UserRole.LANDLORD, UserRole.AGENT, UserRole.ADMIN)
  async getCompanyDetails(@Query('companyNumber') companyNumber: string) {
    try {
      return await this.companiesHouseService.getCompanyDetails(companyNumber);
    } catch (error) {
      throw new HttpException(
        `Failed to fetch company details: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('companies-house/company/:companyNumber/directors')
  @ApiOperation({ summary: 'Get company directors from Companies House' })
  @ApiResponse({ status: 200, description: 'Company directors retrieved successfully' })
  @Roles(UserRole.LANDLORD, UserRole.AGENT, UserRole.ADMIN)
  async getCompanyDirectors(@Query('companyNumber') companyNumber: string) {
    try {
      return await this.companiesHouseService.getCompanyDirectors(companyNumber);
    } catch (error) {
      throw new HttpException(
        `Failed to fetch company directors: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('companies-house/company/:companyNumber/filing-history')
  @ApiOperation({ summary: 'Get company filing history from Companies House' })
  @ApiResponse({ status: 200, description: 'Filing history retrieved successfully' })
  @ApiQuery({ name: 'itemsPerPage', required: false, type: Number })
  @ApiQuery({ name: 'startIndex', required: false, type: Number })
  @Roles(UserRole.LANDLORD, UserRole.AGENT, UserRole.ADMIN)
  async getCompanyFilingHistory(
    @Query('companyNumber') companyNumber: string,
    @Query('itemsPerPage') itemsPerPage = 20,
    @Query('startIndex') startIndex = 0,
  ) {
    try {
      return await this.companiesHouseService.getFilingHistory(
        companyNumber,
        Number(itemsPerPage),
        Number(startIndex),
      );
    } catch (error) {
      throw new HttpException(
        `Failed to fetch filing history: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Royal Mail PAF APIs
  @Get('royal-mail/validate-postcode')
  @ApiOperation({ summary: 'Validate UK postcode' })
  @ApiResponse({ status: 200, description: 'Postcode validation result' })
  @ApiQuery({ name: 'postcode', required: true, type: String })
  @Roles(UserRole.TENANT, UserRole.LANDLORD, UserRole.AGENT, UserRole.ADMIN)
  async validatePostcode(@Query('postcode') postcode: string) {
    try {
      return await this.royalMailPafService.validatePostcode(postcode);
    } catch (error) {
      throw new HttpException(
        `Failed to validate postcode: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('royal-mail/addresses')
  @ApiOperation({ summary: 'Get addresses by postcode' })
  @ApiResponse({ status: 200, description: 'Addresses retrieved successfully' })
  @ApiQuery({ name: 'postcode', required: true, type: String })
  @Roles(UserRole.TENANT, UserRole.LANDLORD, UserRole.AGENT, UserRole.ADMIN)
  async getAddressesByPostcode(@Query('postcode') postcode: string) {
    try {
      return await this.royalMailPafService.getAddressesByPostcode(postcode);
    } catch (error) {
      throw new HttpException(
        `Failed to fetch addresses: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('royal-mail/address/:uprn')
  @ApiOperation({ summary: 'Get address by UPRN' })
  @ApiResponse({ status: 200, description: 'Address retrieved successfully' })
  @Roles(UserRole.TENANT, UserRole.LANDLORD, UserRole.AGENT, UserRole.ADMIN)
  async getAddressByUprn(@Query('uprn') uprn: string) {
    try {
      return await this.royalMailPafService.getAddressByUprn(uprn);
    } catch (error) {
      throw new HttpException(
        `Failed to fetch address: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('royal-mail/search-addresses')
  @ApiOperation({ summary: 'Search addresses by query' })
  @ApiResponse({ status: 200, description: 'Address search results retrieved successfully' })
  @ApiQuery({ name: 'query', required: true, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @Roles(UserRole.TENANT, UserRole.LANDLORD, UserRole.AGENT, UserRole.ADMIN)
  async searchAddresses(
    @Query('query') query: string,
    @Query('limit') limit = 20,
  ) {
    try {
      return await this.royalMailPafService.searchAddresses(query, Number(limit));
    } catch (error) {
      throw new HttpException(
        `Failed to search addresses: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Ordnance Survey APIs
  @Get('ordnance-survey/search-places')
  @ApiOperation({ summary: 'Search places using Ordnance Survey' })
  @ApiResponse({ status: 200, description: 'Places search results retrieved successfully' })
  @ApiQuery({ name: 'query', required: true, type: String })
  @ApiQuery({ name: 'maxResults', required: false, type: Number })
  @Roles(UserRole.TENANT, UserRole.LANDLORD, UserRole.AGENT, UserRole.ADMIN)
  async searchPlaces(
    @Query('query') query: string,
    @Query('maxResults') maxResults = 20,
  ) {
    try {
      return await this.ordnanceSurveyService.searchPlaces(query, Number(maxResults));
    } catch (error) {
      throw new HttpException(
        `Failed to search places: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('ordnance-survey/nearest-places')
  @ApiOperation({ summary: 'Get nearest places to coordinates' })
  @ApiResponse({ status: 200, description: 'Nearest places retrieved successfully' })
  @ApiQuery({ name: 'lat', required: true, type: Number })
  @ApiQuery({ name: 'lon', required: true, type: Number })
  @ApiQuery({ name: 'radius', required: false, type: Number })
  @ApiQuery({ name: 'maxResults', required: false, type: Number })
  @Roles(UserRole.TENANT, UserRole.LANDLORD, UserRole.AGENT, UserRole.ADMIN)
  async getNearestPlaces(
    @Query('lat') lat: number,
    @Query('lon') lon: number,
    @Query('radius') radius = 1000,
    @Query('maxResults') maxResults = 20,
  ) {
    try {
      return await this.ordnanceSurveyService.getNearestPlaces(
        Number(lat),
        Number(lon),
        Number(radius),
        Number(maxResults),
      );
    } catch (error) {
      throw new HttpException(
        `Failed to fetch nearest places: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('ordnance-survey/postcode-data')
  @ApiOperation({ summary: 'Get postcode data from Ordnance Survey' })
  @ApiResponse({ status: 200, description: 'Postcode data retrieved successfully' })
  @ApiQuery({ name: 'postcode', required: true, type: String })
  @Roles(UserRole.TENANT, UserRole.LANDLORD, UserRole.AGENT, UserRole.ADMIN)
  async getPostcodeData(@Query('postcode') postcode: string) {
    try {
      return await this.ordnanceSurveyService.getPostcodeData(postcode);
    } catch (error) {
      throw new HttpException(
        `Failed to fetch postcode data: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('ordnance-survey/uprn-details')
  @ApiOperation({ summary: 'Get UPRN details from Ordnance Survey' })
  @ApiResponse({ status: 200, description: 'UPRN details retrieved successfully' })
  @ApiQuery({ name: 'uprn', required: true, type: String })
  @Roles(UserRole.TENANT, UserRole.LANDLORD, UserRole.AGENT, UserRole.ADMIN)
  async getUprnDetails(@Query('uprn') uprn: string) {
    try {
      return await this.ordnanceSurveyService.getUprnDetails(uprn);
    } catch (error) {
      throw new HttpException(
        `Failed to fetch UPRN details: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('ordnance-survey/elevation')
  @ApiOperation({ summary: 'Get elevation data for coordinates' })
  @ApiResponse({ status: 200, description: 'Elevation data retrieved successfully' })
  @ApiQuery({ name: 'lat', required: true, type: Number })
  @ApiQuery({ name: 'lon', required: true, type: Number })
  @Roles(UserRole.TENANT, UserRole.LANDLORD, UserRole.AGENT, UserRole.ADMIN)
  async getElevation(
    @Query('lat') lat: number,
    @Query('lon') lon: number,
  ) {
    try {
      return await this.ordnanceSurveyService.getElevation(Number(lat), Number(lon));
    } catch (error) {
      throw new HttpException(
        `Failed to fetch elevation data: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('ordnance-survey/nearby-amenities')
  @ApiOperation({ summary: 'Get nearby amenities' })
  @ApiResponse({ status: 200, description: 'Nearby amenities retrieved successfully' })
  @ApiQuery({ name: 'lat', required: true, type: Number })
  @ApiQuery({ name: 'lon', required: true, type: Number })
  @ApiQuery({ name: 'radius', required: false, type: Number })
  @ApiQuery({ name: 'amenityType', required: false, type: String })
  @Roles(UserRole.TENANT, UserRole.LANDLORD, UserRole.AGENT, UserRole.ADMIN)
  async getNearbyAmenities(
    @Query('lat') lat: number,
    @Query('lon') lon: number,
    @Query('radius') radius = 1000,
    @Query('amenityType') amenityType?: string,
  ) {
    try {
      return await this.ordnanceSurveyService.getNearbyAmenities(
        Number(lat),
        Number(lon),
        Number(radius),
        amenityType,
      );
    } catch (error) {
      throw new HttpException(
        `Failed to fetch nearby amenities: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('ordnance-survey/transport-links')
  @ApiOperation({ summary: 'Get nearby transport links' })
  @ApiResponse({ status: 200, description: 'Transport links retrieved successfully' })
  @ApiQuery({ name: 'lat', required: true, type: Number })
  @ApiQuery({ name: 'lon', required: true, type: Number })
  @ApiQuery({ name: 'radius', required: false, type: Number })
  @Roles(UserRole.TENANT, UserRole.LANDLORD, UserRole.AGENT, UserRole.ADMIN)
  async getTransportLinks(
    @Query('lat') lat: number,
    @Query('lon') lon: number,
    @Query('radius') radius = 1000,
  ) {
    try {
      return await this.ordnanceSurveyService.getTransportLinks(
        Number(lat),
        Number(lon),
        Number(radius),
      );
    } catch (error) {
      throw new HttpException(
        `Failed to fetch transport links: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('ordnance-survey/flood-risk')
  @ApiOperation({ summary: 'Get flood risk assessment for coordinates' })
  @ApiResponse({ status: 200, description: 'Flood risk data retrieved successfully' })
  @ApiQuery({ name: 'lat', required: true, type: Number })
  @ApiQuery({ name: 'lon', required: true, type: Number })
  @Roles(UserRole.TENANT, UserRole.LANDLORD, UserRole.AGENT, UserRole.ADMIN)
  async getFloodRisk(
    @Query('lat') lat: number,
    @Query('lon') lon: number,
  ) {
    try {
      return await this.ordnanceSurveyService.getFloodRisk(Number(lat), Number(lon));
    } catch (error) {
      throw new HttpException(
        `Failed to fetch flood risk data: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}