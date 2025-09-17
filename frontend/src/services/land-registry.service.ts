import { 
  Property, 
  OwnershipRecord, 
  PricePaidRecord, 
  BulkSearchRequest, 
  BulkSearchResult,
  PropertySearchParams,
  OwnershipLookupParams,
  PricePaidSearchParams,
  LandRegistryStats,
  PropertyValuation
} from '@/types/land-registry';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    has_more?: boolean;
  };
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class LandRegistryApiService {
  private baseUrl = '/api/land-registry';
  private cache = new Map<string, CacheEntry<any>>();
  private readonly defaultCacheTtl = 5 * 60 * 1000; // 5 minutes
  private readonly longCacheTtl = 30 * 60 * 1000; // 30 minutes

  /**
   * Generic API request handler with error handling and caching
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    cacheKey?: string,
    cacheTtl?: number
  ): Promise<ApiResponse<T>> {
    try {
      // Check cache first
      if (cacheKey && options.method !== 'POST') {
        const cached = this.getFromCache<T>(cacheKey);
        if (cached) {
          return { success: true, data: cached };
        }
      }

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const result: ApiResponse<T> = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      // Cache successful responses
      if (result.success && result.data && cacheKey && options.method !== 'POST') {
        this.setCache(cacheKey, result.data, cacheTtl || this.defaultCacheTtl);
      }

      return result;
    } catch (error) {
      console.error(`Land Registry API Error [${endpoint}]:`, error);
      
      return {
        success: false,
        error: {
          code: 'API_ERROR',
          message: error instanceof Error ? error.message : 'An unexpected error occurred',
          details: error
        }
      };
    }
  }

  /**
   * Cache management
   */
  private getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  private setCache<T>(key: string, data: T, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  /**
   * Clear cache for specific key or all cache
   */
  public clearCache(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  /**
   * Search properties by various criteria
   */
  public async searchProperties(params: PropertySearchParams): Promise<ApiResponse<Property[]>> {
    const queryParams = new URLSearchParams();
    
    if (params.postcode) queryParams.append('postcode', params.postcode);
    if (params.address) queryParams.append('address', params.address);
    if (params.property_type) queryParams.append('property_type', params.property_type);
    if (params.tenure) queryParams.append('tenure', params.tenure);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const cacheKey = `properties:${queryParams.toString()}`;
    
    return this.request<Property[]>(
      `/properties/search?${queryParams.toString()}`,
      { method: 'GET' },
      cacheKey,
      this.defaultCacheTtl
    );
  }

  /**
   * Get property details by title number
   */
  public async getPropertyByTitleNumber(titleNumber: string): Promise<ApiResponse<Property>> {
    const cacheKey = `property:${titleNumber}`;
    
    return this.request<Property>(
      `/properties/${encodeURIComponent(titleNumber)}`,
      { method: 'GET' },
      cacheKey,
      this.longCacheTtl
    );
  }

  /**
   * Lookup ownership records
   */
  public async lookupOwnership(params: OwnershipLookupParams): Promise<ApiResponse<OwnershipRecord[]>> {
    const queryParams = new URLSearchParams();
    
    if (params.title_number) queryParams.append('title_number', params.title_number);
    if (params.postcode) queryParams.append('postcode', params.postcode);
    if (params.owner_name) queryParams.append('owner_name', params.owner_name);
    if (params.company_number) queryParams.append('company_number', params.company_number);
    if (params.include_historical !== undefined) {
      queryParams.append('include_historical', params.include_historical.toString());
    }
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const cacheKey = `ownership:${queryParams.toString()}`;
    
    return this.request<OwnershipRecord[]>(
      `/ownership/lookup?${queryParams.toString()}`,
      { method: 'GET' },
      cacheKey,
      this.defaultCacheTtl
    );
  }

  /**
   * Search price paid data
   */
  public async searchPricePaid(params: PricePaidSearchParams): Promise<ApiResponse<PricePaidRecord[]>> {
    const queryParams = new URLSearchParams();
    
    if (params.postcode) queryParams.append('postcode', params.postcode);
    if (params.address) queryParams.append('address', params.address);
    if (params.date_from) queryParams.append('date_from', params.date_from);
    if (params.date_to) queryParams.append('date_to', params.date_to);
    if (params.min_price) queryParams.append('min_price', params.min_price.toString());
    if (params.max_price) queryParams.append('max_price', params.max_price.toString());
    if (params.property_type) queryParams.append('property_type', params.property_type);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const cacheKey = `price-paid:${queryParams.toString()}`;
    
    return this.request<PricePaidRecord[]>(
      `/price-paid/search?${queryParams.toString()}`,
      { method: 'GET' },
      cacheKey,
      this.defaultCacheTtl
    );
  }

  /**
   * Get price history for a specific property
   */
  public async getPriceHistory(titleNumber: string): Promise<ApiResponse<PricePaidRecord[]>> {
    const cacheKey = `price-history:${titleNumber}`;
    
    return this.request<PricePaidRecord[]>(
      `/price-paid/history/${encodeURIComponent(titleNumber)}`,
      { method: 'GET' },
      cacheKey,
      this.longCacheTtl
    );
  }

  /**
   * Start bulk search operation
   */
  public async startBulkSearch(request: BulkSearchRequest): Promise<ApiResponse<BulkSearchResult>> {
    return this.request<BulkSearchResult>(
      '/bulk-search',
      {
        method: 'POST',
        body: JSON.stringify(request),
      }
    );
  }

  /**
   * Get bulk search status and results
   */
  public async getBulkSearchStatus(requestId: string): Promise<ApiResponse<BulkSearchResult>> {
    return this.request<BulkSearchResult>(
      `/bulk-search/${encodeURIComponent(requestId)}`,
      { method: 'GET' }
    );
  }

  /**
   * Download bulk search results as CSV
   */
  public async downloadBulkResults(requestId: string): Promise<Blob | null> {
    try {
      const response = await fetch(`${this.baseUrl}/bulk-export/${encodeURIComponent(requestId)}`);
      
      if (!response.ok) {
        throw new Error(`Failed to download results: ${response.statusText}`);
      }
      
      return await response.blob();
    } catch (error) {
      console.error('Download error:', error);
      return null;
    }
  }

  /**
   * Get Land Registry API statistics
   */
  public async getStats(): Promise<ApiResponse<LandRegistryStats>> {
    const cacheKey = 'stats';
    
    return this.request<LandRegistryStats>(
      '/stats',
      { method: 'GET' },
      cacheKey,
      this.defaultCacheTtl
    );
  }

  /**
   * Get property valuation estimate
   */
  public async getPropertyValuation(titleNumber: string): Promise<ApiResponse<PropertyValuation>> {
    const cacheKey = `valuation:${titleNumber}`;
    
    return this.request<PropertyValuation>(
      `/valuation/${encodeURIComponent(titleNumber)}`,
      { method: 'GET' },
      cacheKey,
      this.defaultCacheTtl
    );
  }

  /**
   * Sync data with Land Registry API (admin function)
   */
  public async syncData(): Promise<ApiResponse<{ message: string; synced_records: number }>> {
    return this.request<{ message: string; synced_records: number }>(
      '/sync',
      { method: 'POST' }
    );
  }

  /**
   * Clear API cache (admin function)
   */
  public async clearApiCache(): Promise<ApiResponse<{ message: string }>> {
    const result = await this.request<{ message: string }>(
      '/cache/clear',
      { method: 'POST' }
    );
    
    // Also clear local cache
    this.clearCache();
    
    return result;
  }

  /**
   * Get API health status
   */
  public async getHealthStatus(): Promise<ApiResponse<{ 
    status: string; 
    timestamp: string; 
    api_available: boolean;
    database_connected: boolean;
    cache_available: boolean;
  }>> {
    return this.request(
      '/health',
      { method: 'GET' }
    );
  }

  /**
   * Batch property lookup
   */
  public async batchPropertyLookup(titleNumbers: string[]): Promise<ApiResponse<Property[]>> {
    return this.request<Property[]>(
      '/properties/batch',
      {
        method: 'POST',
        body: JSON.stringify({ title_numbers: titleNumbers }),
      }
    );
  }

  /**
   * Get nearby properties
   */
  public async getNearbyProperties(
    postcode: string, 
    radius: number = 1000
  ): Promise<ApiResponse<Property[]>> {
    const cacheKey = `nearby:${postcode}:${radius}`;
    
    return this.request<Property[]>(
      `/properties/nearby?postcode=${encodeURIComponent(postcode)}&radius=${radius}`,
      { method: 'GET' },
      cacheKey,
      this.defaultCacheTtl
    );
  }

  /**
   * Get market trends for an area
   */
  public async getMarketTrends(
    postcode: string, 
    period: '1m' | '3m' | '6m' | '1y' | '2y' = '1y'
  ): Promise<ApiResponse<{
    average_price: number;
    median_price: number;
    price_change_percent: number;
    transaction_count: number;
    trends: Array<{
      date: string;
      average_price: number;
      transaction_count: number;
    }>;
  }>> {
    const cacheKey = `trends:${postcode}:${period}`;
    
    return this.request(
      `/market/trends?postcode=${encodeURIComponent(postcode)}&period=${period}`,
      { method: 'GET' },
      cacheKey,
      this.longCacheTtl
    );
  }

  /**
   * Validate postcode format
   */
  public static validatePostcode(postcode: string): boolean {
    const postcodeRegex = /^[A-Z]{1,2}[0-9][A-Z0-9]?\s?[0-9][A-Z]{2}$/i;
    return postcodeRegex.test(postcode.replace(/\s/g, ''));
  }

  /**
   * Format postcode consistently
   */
  public static formatPostcode(postcode: string): string {
    const cleaned = postcode.replace(/\s/g, '').toUpperCase();
    if (cleaned.length >= 5) {
      return `${cleaned.slice(0, -3)} ${cleaned.slice(-3)}`;
    }
    return cleaned;
  }

  /**
   * Format currency values
   */
  public static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  /**
   * Format date consistently
   */
  public static formatDate(date: string | Date): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  /**
   * Get cache statistics
   */
  public getCacheStats(): {
    size: number;
    keys: string[];
    memory_usage: number;
  } {
    const keys = Array.from(this.cache.keys());
    const memoryUsage = JSON.stringify(Array.from(this.cache.values())).length;
    
    return {
      size: this.cache.size,
      keys,
      memory_usage: memoryUsage,
    };
  }
}

// Create singleton instance
export const landRegistryService = new LandRegistryApiService();
export default landRegistryService;

// Export types for convenience
export type {
  ApiResponse,
  Property,
  OwnershipRecord,
  PricePaidRecord,
  BulkSearchRequest,
  BulkSearchResult,
  PropertySearchParams,
  OwnershipLookupParams,
  PricePaidSearchParams,
  LandRegistryStats,
  PropertyValuation
};