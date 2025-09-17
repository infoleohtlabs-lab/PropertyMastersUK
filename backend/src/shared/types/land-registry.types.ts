export interface PropertySearchRequest {
  postcode?: string;
  address?: string;
  uprn?: string;
  titleNumber?: string;
  propertyTypes?: string[];
  limit?: number;
  offset?: number;
}

export interface PropertySearchResponse {
  properties: Property[];
  totalCount: number;
  hasMore: boolean;
}

export interface Property {
  id: string;
  uprn?: string;
  titleNumber?: string;
  address: string;
  postcode: string;
  propertyType: string;
  tenure?: string;
  price?: number;
  lastSaleDate?: Date;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface OwnershipLookupRequest {
  titleNumber?: string;
  uprn?: string;
  postcode?: string;
  address?: string;
  includeHistory?: boolean;
}

export interface OwnershipLookupResponse {
  property: Property;
  currentOwnership: Ownership;
  ownershipHistory?: Ownership[];
}

export interface Ownership {
  id: string;
  owners: Owner[];
  registrationDate: Date;
  tenure: string;
  restrictions?: string[];
  charges?: Charge[];
}

export interface Owner {
  name: string;
  address?: string;
  type: 'individual' | 'company' | 'other';
  share?: string;
}

export interface Charge {
  id: string;
  type: string;
  amount?: number;
  chargee: string;
  registrationDate: Date;
  status: 'active' | 'discharged';
}

export interface PricePaidSearchRequest {
  postcode?: string;
  address?: string;
  uprn?: string;
  minPrice?: number;
  maxPrice?: number;
  dateFrom?: Date;
  dateTo?: Date;
  propertyTypes?: string[];
  newBuildOnly?: boolean;
  limit?: number;
  offset?: number;
}

export interface PricePaidSearchResponse {
  transactions: Transaction[];
  totalCount: number;
  hasMore: boolean;
  statistics?: {
    averagePrice: number;
    medianPrice: number;
    priceRange: {
      min: number;
      max: number;
    };
  };
}

export interface Transaction {
  id: string;
  price: number;
  date: Date;
  property: Property;
  propertyType: string;
  newBuild: boolean;
  tenure: string;
  buyer?: string;
  seller?: string;
}

export interface BulkExportRequest {
  searchCriteria: {
    postcodes?: string[];
    propertyTypes?: string[];
    priceRange?: {
      min?: number;
      max?: number;
    };
    dateRange?: {
      from?: Date;
      to?: Date;
    };
  };
  exportFormat: 'csv' | 'json' | 'xlsx';
  includeFields: string[];
  maxRecords?: number;
}

export interface BulkExportResponse {
  exportId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  downloadUrl?: string;
  recordCount?: number;
  estimatedSize?: number;
  createdAt: Date;
  expiresAt?: Date;
}

export interface BulkExport {
  id: string;
  userId: string;
  request: BulkExportRequest;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  downloadUrl?: string;
  recordCount?: number;
  fileSize?: number;
  createdAt: Date;
  completedAt?: Date;
  expiresAt?: Date;
  errorMessage?: string;
}

export interface PropertyStatistics {
  totalProperties: number;
  averagePrice: number;
  medianPrice: number;
  priceDistribution: {
    range: string;
    count: number;
    percentage: number;
  }[];
  propertyTypeDistribution: {
    type: string;
    count: number;
    percentage: number;
  }[];
  tenureDistribution: {
    tenure: string;
    count: number;
    percentage: number;
  }[];
  salesTrends: {
    period: string;
    averagePrice: number;
    transactionCount: number;
  }[];
}

export interface LandRegistryApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    requestId: string;
    timestamp: Date;
    processingTime: number;
    rateLimit?: {
      remaining: number;
      resetTime: Date;
    };
  };
}

export interface LandRegistryConfig {
  apiKey: string;
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
  rateLimits: {
    requestsPerMinute: number;
    requestsPerHour: number;
    requestsPerDay: number;
  };
}

export interface ApiUsageStats {
  userId: string;
  endpoint: string;
  requestCount: number;
  lastRequest: Date;
  quotaUsed: number;
  quotaLimit: number;
  resetDate: Date;
}

export interface CacheEntry {
  key: string;
  data: any;
  createdAt: Date;
  expiresAt: Date;
  hitCount: number;
  lastAccessed: Date;
}

export interface SearchHistory {
  id: string;
  userId: string;
  searchType: 'property' | 'ownership' | 'price-paid';
  searchParams: any;
  resultCount: number;
  executionTime: number;
  createdAt: Date;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  value?: any;
}

export interface ServiceHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  lastCheck: Date;
  responseTime: number;
  errorRate: number;
  uptime: number;
  dependencies: {
    name: string;
    status: 'healthy' | 'degraded' | 'unhealthy';
    responseTime?: number;
  }[];
}

export enum PropertyType {
  DETACHED = 'D',
  SEMI_DETACHED = 'S',
  TERRACED = 'T',
  FLAT = 'F',
  OTHER = 'O'
}

export enum ExportFormat {
  CSV = 'csv',
  JSON = 'json',
  XLSX = 'xlsx'
}

export enum TenureType {
  FREEHOLD = 'freehold',
  LEASEHOLD = 'leasehold',
  COMMONHOLD = 'commonhold'
}