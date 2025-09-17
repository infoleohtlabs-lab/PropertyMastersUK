import {
  PostcodeValidationResponse,
  AddressSearchResponse,
  AddressLookupResponse,
  RoyalMailApiError
} from '../types/royal-mail';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

class RoyalMailService {
  private async makeRequest<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    try {
      const url = new URL(`${API_BASE_URL}/api/uk-apis/royal-mail${endpoint}`);
      
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value) {
            url.searchParams.append(key, value);
          }
        });
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: 'An error occurred',
          statusCode: response.status
        }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred');
    }
  }

  /**
   * Validate a UK postcode
   * @param postcode - The postcode to validate
   * @returns Promise<PostcodeValidationResponse>
   */
  async validatePostcode(postcode: string): Promise<PostcodeValidationResponse> {
    if (!postcode || postcode.trim().length === 0) {
      return {
        isValid: false,
        message: 'Postcode is required'
      };
    }

    return this.makeRequest<PostcodeValidationResponse>('/validate-postcode', {
      postcode: postcode.trim().toUpperCase()
    });
  }

  /**
   * Get addresses by postcode
   * @param postcode - The postcode to search for
   * @returns Promise<AddressSearchResponse>
   */
  async getAddressesByPostcode(postcode: string): Promise<AddressSearchResponse> {
    if (!postcode || postcode.trim().length === 0) {
      return {
        addresses: [],
        totalResults: 0,
        message: 'Postcode is required'
      };
    }

    return this.makeRequest<AddressSearchResponse>('/addresses', {
      postcode: postcode.trim().toUpperCase()
    });
  }

  /**
   * Search addresses by query string
   * @param query - The search query (address, building name, etc.)
   * @param limit - Maximum number of results to return (default: 10)
   * @returns Promise<AddressSearchResponse>
   */
  async searchAddresses(query: string, limit: number = 10): Promise<AddressSearchResponse> {
    if (!query || query.trim().length === 0) {
      return {
        addresses: [],
        totalResults: 0,
        message: 'Search query is required'
      };
    }

    return this.makeRequest<AddressSearchResponse>('/search-addresses', {
      query: query.trim(),
      limit: limit.toString()
    });
  }

  /**
   * Get address details by UPRN (Unique Property Reference Number)
   * @param uprn - The UPRN to lookup
   * @returns Promise<AddressLookupResponse>
   */
  async getAddressByUprn(uprn: string): Promise<AddressLookupResponse> {
    if (!uprn || uprn.trim().length === 0) {
      return {
        address: null,
        message: 'UPRN is required'
      };
    }

    return this.makeRequest<AddressLookupResponse>(`/address/${uprn.trim()}`);
  }

  /**
   * Format address for display
   * @param address - The address object to format
   * @returns Formatted address string
   */
  formatAddress(address: any): string {
    const parts: string[] = [];
    
    if (address.buildingNumber && address.thoroughfareName) {
      parts.push(`${address.buildingNumber} ${address.thoroughfareName}`);
    } else if (address.buildingName) {
      parts.push(address.buildingName);
      if (address.thoroughfareName) {
        parts.push(address.thoroughfareName);
      }
    } else if (address.thoroughfareName) {
      parts.push(address.thoroughfareName);
    }
    
    if (address.dependentLocality) {
      parts.push(address.dependentLocality);
    }
    
    if (address.postTown) {
      parts.push(address.postTown);
    }
    
    if (address.postcode) {
      parts.push(address.postcode);
    }
    
    return parts.filter(Boolean).join(', ');
  }

  /**
   * Extract address components for form filling
   * @param address - The Royal Mail address object
   * @returns Object with common address form fields
   */
  extractAddressComponents(address: any) {
    const streetParts: string[] = [];
    
    if (address.subBuildingName) {
      streetParts.push(address.subBuildingName);
    }
    
    if (address.buildingName) {
      streetParts.push(address.buildingName);
    }
    
    if (address.buildingNumber && address.thoroughfareName) {
      streetParts.push(`${address.buildingNumber} ${address.thoroughfareName}`);
    } else if (address.thoroughfareName) {
      streetParts.push(address.thoroughfareName);
    }
    
    if (address.dependentThoroughfareName) {
      streetParts.push(address.dependentThoroughfareName);
    }
    
    if (address.dependentLocality) {
      streetParts.push(address.dependentLocality);
    }
    
    return {
      street: streetParts.join(', '),
      city: address.postTown || '',
      county: address.county || '',
      postcode: address.postcode || '',
      country: 'UK'
    };
  }
}

// Export singleton instance
export const royalMailService = new RoyalMailService();
export default royalMailService;