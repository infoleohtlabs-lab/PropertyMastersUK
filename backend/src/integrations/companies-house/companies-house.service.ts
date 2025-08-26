import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

export interface CompanyData {
  companyNumber: string;
  companyName: string;
  companyStatus: string;
  companyType: string;
  dateOfCreation: string;
  dateOfCessation?: string;
  registeredOfficeAddress: {
    addressLine1: string;
    addressLine2?: string;
    locality: string;
    region?: string;
    postalCode: string;
    country: string;
  };
  sicCodes: Array<{
    code: string;
    description: string;
  }>;
  accounts?: {
    nextDue: string;
    lastMadeUp: string;
    accountingReferenceDate: {
      day: number;
      month: number;
    };
  };
  confirmationStatement?: {
    nextDue: string;
    lastMadeUp: string;
  };
  links: {
    self: string;
    filing_history: string;
    officers: string;
    persons_with_significant_control: string;
  };
}

export interface CompanyOfficer {
  name: string;
  officerRole: string;
  appointedOn: string;
  resignedOn?: string;
  address: {
    addressLine1: string;
    addressLine2?: string;
    locality: string;
    region?: string;
    postalCode: string;
    country: string;
  };
  dateOfBirth?: {
    month: number;
    year: number;
  };
  nationality?: string;
  countryOfResidence?: string;
  occupation?: string;
}

export interface CompanySearchResult {
  companyNumber: string;
  title: string;
  companyStatus: string;
  companyType: string;
  dateOfCreation: string;
  address: {
    snippet: string;
    postalCode: string;
  };
  description: string;
  matches: {
    title: number[];
    snippet: number[];
  };
}

export interface PersonWithSignificantControl {
  name: string;
  kind: string;
  naturesOfControl: string[];
  notifiedOn: string;
  ceasedOn?: string;
  address: {
    addressLine1: string;
    addressLine2?: string;
    locality: string;
    region?: string;
    postalCode: string;
    country: string;
  };
  dateOfBirth?: {
    month: number;
    year: number;
  };
  nationality?: string;
  countryOfResidence?: string;
}

@Injectable()
export class CompaniesHouseService {
  private readonly logger = new Logger(CompaniesHouseService.name);
  private readonly baseUrl = 'https://api.company-information.service.gov.uk';
  private readonly apiKey: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiKey = this.configService.get<string>('COMPANIES_HOUSE_API_KEY');
  }

  /**
   * Search for companies by name
   */
  async searchCompanies(query: string, itemsPerPage: number = 20): Promise<CompanySearchResult[]> {
    try {
      const url = `${this.baseUrl}/search/companies`;
      
      const response = await firstValueFrom(
        this.httpService.get(url, {
          params: {
            q: query,
            items_per_page: itemsPerPage,
          },
          auth: {
            username: this.apiKey,
            password: '',
          },
          headers: {
            'Accept': 'application/json',
          },
        })
      );

      return response.data.items || [];
    } catch (error) {
      this.logger.error(`Failed to search companies: ${error.message}`);
      throw new HttpException(
        'Failed to search companies',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  /**
   * Get detailed company information
   */
  async getCompanyDetails(companyNumber: string): Promise<CompanyData> {
    try {
      const url = `${this.baseUrl}/company/${companyNumber}`;
      
      const response = await firstValueFrom(
        this.httpService.get(url, {
          auth: {
            username: this.apiKey,
            password: '',
          },
          headers: {
            'Accept': 'application/json',
          },
        })
      );

      return this.parseCompanyData(response.data);
    } catch (error) {
      this.logger.error(`Failed to get company details for ${companyNumber}: ${error.message}`);
      throw new HttpException(
        'Failed to retrieve company details',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  /**
   * Get company officers
   */
  async getCompanyOfficers(companyNumber: string): Promise<CompanyOfficer[]> {
    try {
      const url = `${this.baseUrl}/company/${companyNumber}/officers`;
      
      const response = await firstValueFrom(
        this.httpService.get(url, {
          auth: {
            username: this.apiKey,
            password: '',
          },
          headers: {
            'Accept': 'application/json',
          },
        })
      );

      return response.data.items || [];
    } catch (error) {
      this.logger.error(`Failed to get officers for company ${companyNumber}: ${error.message}`);
      throw new HttpException(
        'Failed to retrieve company officers',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  /**
   * Get persons with significant control
   */
  async getPersonsWithSignificantControl(companyNumber: string): Promise<PersonWithSignificantControl[]> {
    try {
      const url = `${this.baseUrl}/company/${companyNumber}/persons-with-significant-control`;
      
      const response = await firstValueFrom(
        this.httpService.get(url, {
          auth: {
            username: this.apiKey,
            password: '',
          },
          headers: {
            'Accept': 'application/json',
          },
        })
      );

      return response.data.items || [];
    } catch (error) {
      this.logger.error(`Failed to get PSCs for company ${companyNumber}: ${error.message}`);
      throw new HttpException(
        'Failed to retrieve persons with significant control',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  /**
   * Verify company status and legitimacy
   */
  async verifyCompany(companyNumber: string): Promise<{
    isActive: boolean;
    isLegitimate: boolean;
    riskScore: number;
    riskFactors: string[];
    companyAge: number;
    lastFilingDate?: string;
  }> {
    try {
      const company = await this.getCompanyDetails(companyNumber);
      const officers = await this.getCompanyOfficers(companyNumber);
      
      const isActive = company.companyStatus === 'active';
      const riskFactors: string[] = [];
      let riskScore = 0;

      // Calculate company age
      const creationDate = new Date(company.dateOfCreation);
      const companyAge = Math.floor((Date.now() - creationDate.getTime()) / (1000 * 60 * 60 * 24 * 365));

      // Risk assessment
      if (!isActive) {
        riskFactors.push('Company is not active');
        riskScore += 50;
      }

      if (companyAge < 1) {
        riskFactors.push('Company is less than 1 year old');
        riskScore += 20;
      }

      if (officers.length === 0) {
        riskFactors.push('No officers found');
        riskScore += 30;
      }

      if (company.accounts?.lastMadeUp) {
        const lastFiling = new Date(company.accounts.lastMadeUp);
        const daysSinceLastFiling = Math.floor((Date.now() - lastFiling.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysSinceLastFiling > 365) {
          riskFactors.push('Accounts not filed within last year');
          riskScore += 25;
        }
      }

      // Check for property-related SIC codes
      const propertyRelatedCodes = ['68100', '68200', '68310', '68320', '68209'];
      const hasPropertySIC = company.sicCodes.some(sic => 
        propertyRelatedCodes.includes(sic.code)
      );

      if (!hasPropertySIC) {
        riskFactors.push('No property-related business activities');
        riskScore += 15;
      }

      return {
        isActive,
        isLegitimate: riskScore < 50,
        riskScore: Math.min(riskScore, 100),
        riskFactors,
        companyAge,
        lastFilingDate: company.accounts?.lastMadeUp,
      };
    } catch (error) {
      this.logger.error(`Failed to verify company ${companyNumber}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Check if person is associated with company
   */
  async checkPersonAssociation(companyNumber: string, personName: string): Promise<{
    isAssociated: boolean;
    roles: string[];
    confidence: number;
  }> {
    try {
      const officers = await this.getCompanyOfficers(companyNumber);
      const pscs = await this.getPersonsWithSignificantControl(companyNumber);
      
      const normalizedName = personName.toLowerCase().trim();
      const roles: string[] = [];
      let confidence = 0;

      // Check officers
      const matchingOfficers = officers.filter(officer => {
        const officerName = officer.name.toLowerCase();
        return officerName.includes(normalizedName) || normalizedName.includes(officerName);
      });

      matchingOfficers.forEach(officer => {
        roles.push(officer.officerRole);
        confidence += 30;
      });

      // Check PSCs
      const matchingPSCs = pscs.filter(psc => {
        const pscName = psc.name.toLowerCase();
        return pscName.includes(normalizedName) || normalizedName.includes(pscName);
      });

      matchingPSCs.forEach(psc => {
        roles.push('Person with Significant Control');
        confidence += 40;
      });

      return {
        isAssociated: roles.length > 0,
        roles: [...new Set(roles)], // Remove duplicates
        confidence: Math.min(confidence, 100),
      };
    } catch (error) {
      this.logger.error(`Failed to check person association: ${error.message}`);
      throw error;
    }
  }

  private parseCompanyData(data: any): CompanyData {
    return {
      companyNumber: data.company_number,
      companyName: data.company_name,
      companyStatus: data.company_status,
      companyType: data.type,
      dateOfCreation: data.date_of_creation,
      dateOfCessation: data.date_of_cessation,
      registeredOfficeAddress: {
        addressLine1: data.registered_office_address?.address_line_1 || '',
        addressLine2: data.registered_office_address?.address_line_2,
        locality: data.registered_office_address?.locality || '',
        region: data.registered_office_address?.region,
        postalCode: data.registered_office_address?.postal_code || '',
        country: data.registered_office_address?.country || '',
      },
      sicCodes: data.sic_codes?.map((code: string) => ({
        code,
        description: this.getSICDescription(code),
      })) || [],
      accounts: data.accounts ? {
        nextDue: data.accounts.next_due,
        lastMadeUp: data.accounts.last_made_up,
        accountingReferenceDate: data.accounts.accounting_reference_date,
      } : undefined,
      confirmationStatement: data.confirmation_statement ? {
        nextDue: data.confirmation_statement.next_due,
        lastMadeUp: data.confirmation_statement.last_made_up,
      } : undefined,
      links: data.links || {},
    };
  }

  private getSICDescription(code: string): string {
    // Basic SIC code descriptions - in production, use a comprehensive mapping
    const sicDescriptions: { [key: string]: string } = {
      '68100': 'Buying and selling of own real estate',
      '68200': 'Renting and operating of own or leased real estate',
      '68310': 'Real estate agencies',
      '68320': 'Management of real estate on a fee or contract basis',
      '68209': 'Other letting and operating of own or leased real estate',
    };
    
    return sicDescriptions[code] || 'Unknown business activity';
  }
}