import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

export interface CompanyData {
  companyNumber: string;
  companyName: string;
  companyStatus: string;
  companyType: string;
  dateOfCreation: string;
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
  accounts: {
    nextDue: string;
    lastMadeUp: string;
    accountingReferenceDate: {
      day: string;
      month: string;
    };
  };
  confirmationStatement: {
    nextDue: string;
    lastMadeUp: string;
  };
}

export interface DirectorData {
  name: string;
  dateOfBirth: {
    month: number;
    year: number;
  };
  nationality: string;
  countryOfResidence: string;
  occupation: string;
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
}

export interface FilingHistoryItem {
  transactionId: string;
  type: string;
  description: string;
  date: string;
  category: string;
  subcategory?: string;
}

@Injectable()
export class CompaniesHouseService {
  private readonly logger = new Logger(CompaniesHouseService.name);
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.company-information.service.gov.uk';

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiKey = this.configService.get<string>('COMPANIES_HOUSE_API_KEY');
  }

  /**
   * Search for companies by name
   */
  async searchCompanies(query: string, itemsPerPage = 20): Promise<any[]> {
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
        })
      );

      return response.data.items || [];
    } catch (error) {
      this.logger.error(`Failed to search companies with query ${query}:`, error.message);
      throw new Error(`Companies House API error: ${error.message}`);
    }
  }

  /**
   * Get company details by company number
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
        })
      );

      return this.transformCompanyData(response.data);
    } catch (error) {
      this.logger.error(`Failed to fetch company details for ${companyNumber}:`, error.message);
      throw new Error(`Companies House API error: ${error.message}`);
    }
  }

  /**
   * Get company directors
   */
  async getCompanyDirectors(companyNumber: string): Promise<DirectorData[]> {
    try {
      const url = `${this.baseUrl}/company/${companyNumber}/officers`;
      
      const response = await firstValueFrom(
        this.httpService.get(url, {
          auth: {
            username: this.apiKey,
            password: '',
          },
        })
      );

      return (response.data.items || []).map(this.transformDirectorData);
    } catch (error) {
      this.logger.error(`Failed to fetch directors for company ${companyNumber}:`, error.message);
      throw new Error(`Companies House API error: ${error.message}`);
    }
  }

  /**
   * Get company filing history
   */
  async getFilingHistory(companyNumber: string, itemsPerPage = 35): Promise<FilingHistoryItem[]> {
    try {
      const url = `${this.baseUrl}/company/${companyNumber}/filing-history`;
      
      const response = await firstValueFrom(
        this.httpService.get(url, {
          params: {
            items_per_page: itemsPerPage,
          },
          auth: {
            username: this.apiKey,
            password: '',
          },
        })
      );

      return (response.data.items || []).map(this.transformFilingHistoryItem);
    } catch (error) {
      this.logger.error(`Failed to fetch filing history for company ${companyNumber}:`, error.message);
      throw new Error(`Companies House API error: ${error.message}`);
    }
  }

  /**
   * Verify company is active and in good standing
   */
  async verifyCompanyStatus(companyNumber: string): Promise<{
    isActive: boolean;
    isInGoodStanding: boolean;
    status: string;
    issues: string[];
  }> {
    try {
      const company = await this.getCompanyDetails(companyNumber);
      const filingHistory = await this.getFilingHistory(companyNumber, 10);
      
      const isActive = company.companyStatus === 'active';
      const issues: string[] = [];
      
      // Check for overdue accounts
      const accountsDue = new Date(company.accounts.nextDue);
      if (accountsDue < new Date()) {
        issues.push('Accounts are overdue');
      }
      
      // Check for overdue confirmation statement
      const confirmationDue = new Date(company.confirmationStatement.nextDue);
      if (confirmationDue < new Date()) {
        issues.push('Confirmation statement is overdue');
      }
      
      // Check for recent strike-off notices
      const hasStrikeOffNotice = filingHistory.some(filing => 
        filing.description.toLowerCase().includes('strike') ||
        filing.description.toLowerCase().includes('dissolution')
      );
      
      if (hasStrikeOffNotice) {
        issues.push('Recent strike-off or dissolution notice found');
      }
      
      const isInGoodStanding = isActive && issues.length === 0;
      
      return {
        isActive,
        isInGoodStanding,
        status: company.companyStatus,
        issues,
      };
    } catch (error) {
      this.logger.error(`Failed to verify company status for ${companyNumber}:`, error.message);
      throw error;
    }
  }

  /**
   * Get company persons with significant control (PSC)
   */
  async getPersonsWithSignificantControl(companyNumber: string): Promise<any[]> {
    try {
      const url = `${this.baseUrl}/company/${companyNumber}/persons-with-significant-control`;
      
      const response = await firstValueFrom(
        this.httpService.get(url, {
          auth: {
            username: this.apiKey,
            password: '',
          },
        })
      );

      return response.data.items || [];
    } catch (error) {
      this.logger.error(`Failed to fetch PSC for company ${companyNumber}:`, error.message);
      throw new Error(`Companies House API error: ${error.message}`);
    }
  }

  /**
   * Transform raw company data to our format
   */
  private transformCompanyData(rawData: any): CompanyData {
    return {
      companyNumber: rawData.company_number,
      companyName: rawData.company_name,
      companyStatus: rawData.company_status,
      companyType: rawData.type,
      dateOfCreation: rawData.date_of_creation,
      registeredOfficeAddress: {
        addressLine1: rawData.registered_office_address?.address_line_1 || '',
        addressLine2: rawData.registered_office_address?.address_line_2,
        locality: rawData.registered_office_address?.locality || '',
        region: rawData.registered_office_address?.region,
        postalCode: rawData.registered_office_address?.postal_code || '',
        country: rawData.registered_office_address?.country || '',
      },
      sicCodes: (rawData.sic_codes || []).map((code: string) => ({
        code,
        description: this.getSicCodeDescription(code),
      })),
      accounts: {
        nextDue: rawData.accounts?.next_due || '',
        lastMadeUp: rawData.accounts?.last_accounts?.made_up_to || '',
        accountingReferenceDate: {
          day: rawData.accounts?.accounting_reference_date?.day || '',
          month: rawData.accounts?.accounting_reference_date?.month || '',
        },
      },
      confirmationStatement: {
        nextDue: rawData.confirmation_statement?.next_due || '',
        lastMadeUp: rawData.confirmation_statement?.last_made_up_to || '',
      },
    };
  }

  /**
   * Transform raw director data to our format
   */
  private transformDirectorData(rawData: any): DirectorData {
    return {
      name: rawData.name,
      dateOfBirth: {
        month: rawData.date_of_birth?.month || 0,
        year: rawData.date_of_birth?.year || 0,
      },
      nationality: rawData.nationality || '',
      countryOfResidence: rawData.country_of_residence || '',
      occupation: rawData.occupation || '',
      appointedOn: rawData.appointed_on || '',
      resignedOn: rawData.resigned_on,
      address: {
        addressLine1: rawData.address?.address_line_1 || '',
        addressLine2: rawData.address?.address_line_2,
        locality: rawData.address?.locality || '',
        region: rawData.address?.region,
        postalCode: rawData.address?.postal_code || '',
        country: rawData.address?.country || '',
      },
    };
  }

  /**
   * Transform raw filing history item to our format
   */
  private transformFilingHistoryItem(rawData: any): FilingHistoryItem {
    return {
      transactionId: rawData.transaction_id,
      type: rawData.type,
      description: rawData.description,
      date: rawData.date,
      category: rawData.category,
      subcategory: rawData.subcategory,
    };
  }

  /**
   * Get SIC code description (simplified mapping)
   */
  private getSicCodeDescription(code: string): string {
    // This would typically be a comprehensive mapping
    // For now, return a placeholder
    return `SIC Code ${code}`;
  }
}
