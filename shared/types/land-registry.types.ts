// Land Registry API Types and Interfaces
// Comprehensive type definitions for UK Land Registry data integration

// Base property information
export interface Property {
  id: string;
  uprn?: string;
  titleNumber?: string;
  addressLine1: string;
  addressLine2?: string;
  postcode: string;
  propertyType: PropertyType;
  tenure: TenureType;
  createdAt: string;
  updatedAt: string;
  lastSync?: string;
}

// Property type enumeration
export type PropertyType = 'D' | 'S' | 'T' | 'F' | 'O';

// Property type descriptions
export const PropertyTypeDescriptions: Record<PropertyType, string> = {
  'D': 'Detached',
  'S': 'Semi-Detached',
  'T': 'Terraced',
  'F': 'Flats/Maisonettes',
  'O': 'Other'
};

// Tenure type enumeration
export type TenureType = 'F' | 'L';

// Tenure type descriptions
export const TenureTypeDescriptions: Record<TenureType, string> = {
  'F': 'Freehold',
  'L': 'Leasehold'
};

// Ownership record interface
export interface OwnershipRecord {
  id: string;
  propertyId: string;
  ownerName: string;
  ownerAddress?: string;
  companyNumber?: string;
  ownershipType: OwnershipType;
  registrationDate?: string;
  isCurrent: boolean;
  createdAt: string;
  updatedAt: string;
}

// Ownership type enumeration
export type OwnershipType = 'individual' | 'company' | 'trust' | 'other';

// Price paid record interface
export interface PricePaidRecord {
  id: string;
  propertyId?: string;
  transactionId: string;
  price: number;
  transferDate: string;
  propertyType: PropertyType;
  newBuild: boolean;
  duration: TenureType;
  paon?: string;
  saon?: string;
  street?: string;
  locality?: string;
  city?: string;
  district?: string;
  county?: string;
  categoryType: CategoryType;
  recordStatus: RecordStatus;
  createdAt: string;
}

// Category type enumeration
export type CategoryType = 'A' | 'B';

// Category type descriptions
export const CategoryTypeDescriptions: Record<CategoryType, string> = {
  'A': 'Standard Price Paid entry',
  'B': 'Additional Price Paid entry'
};

// Record status enumeration
export type RecordStatus = 'A' | 'C' | 'D';

// Record status descriptions
export const RecordStatusDescriptions: Record<RecordStatus, string> = {
  'A': 'Addition',
  'C': 'Change',
  'D': 'Delete'
};

// Title record interface
export interface TitleRecord {
  id: string;
  propertyId: string;
  titleNumber: string;
  propertyDescription?: string;
  tenure: TenureType;
  registrationDate?: string;
  lastUpdated?: string;
  createdAt: string;
}

// Ownership history interface
export interface OwnershipHistory {
  id: string;
  ownershipRecordId: string;
  previousOwner?: string;
  changeDate?: string;
  changeType?: string;
  createdAt: string;
}

// API usage log interface
export interface ApiUsageLog {
  id: string;
  userId?: string;
  endpoint: string;
  method: string;
  responseStatus: number;
  responseTimeMs?: number;
  createdAt: string;
}

// Bulk export interface
export interface BulkExport {
  id: string;
  userId: string;
  exportId: string;
  searchCriteria?: Record<string, any>;
  exportFormat: ExportFormat;
  status: ExportStatus;
  downloadUrl?: string;
  recordCount?: number;
  createdAt: string;
  completedAt?: string;
}

// Export format enumeration
export type ExportFormat = 'csv' | 'excel' | 'json';

// Export status enumeration
export type ExportStatus = 'pending' | 'processing' | 'completed' | 'failed';

// Land Registry API request interfaces

// Property search request
export interface PropertySearchRequest {
  postcode?: string;
  address?: string;
  uprn?: string;
  titleNumber?: string;
  minPrice?: number;
  maxPrice?: number;
  propertyTypes?: PropertyType[];
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  offset?: number;
}

// Ownership lookup request
export interface OwnershipLookupRequest {
  titleNumber?: string;
  uprn?: string;
  postcode?: string;
  address?: string;
  includeHistory?: boolean;
}

// Price paid search request
export interface PricePaidSearchRequest {
  postcode?: string;
  address?: string;
  uprn?: string;
  minPrice?: number;
  maxPrice?: number;
  dateFrom?: string;
  dateTo?: string;
  propertyTypes?: PropertyType[];
  newBuildOnly?: boolean;
  limit?: number;
  offset?: number;
}

// Bulk export request
export interface BulkExportRequest {
  searchCriteria: PropertySearchRequest | PricePaidSearchRequest;
  exportFormat: ExportFormat;
  includeOwnership?: boolean;
  includePriceHistory?: boolean;
}

// Land Registry API response interfaces

// Property search response
export interface PropertySearchResponse {
  properties: PropertyWithDetails[];
  totalCount: number;
  hasMore: boolean;
  nextOffset?: number;
}

// Property with additional details
export interface PropertyWithDetails extends Property {
  latestPrice?: number;
  latestSaleDate?: string;
  currentOwner?: string;
  ownershipType?: OwnershipType;
  priceHistory?: PricePaidRecord[];
  ownershipHistory?: OwnershipRecord[];
}

// Ownership lookup response
export interface OwnershipLookupResponse {
  property?: Property;
  currentOwnership?: OwnershipRecord[];
  ownershipHistory?: OwnershipHistory[];
  titleRecord?: TitleRecord;
}

// Price paid search response
export interface PricePaidSearchResponse {
  transactions: PricePaidRecord[];
  totalCount: number;
  hasMore: boolean;
  nextOffset?: number;
  averagePrice?: number;
  medianPrice?: number;
}

// Bulk export response
export interface BulkExportResponse {
  exportId: string;
  status: ExportStatus;
  estimatedRecords?: number;
  estimatedCompletionTime?: string;
}

// Error response interface
export interface LandRegistryError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
}

// API response wrapper
export interface LandRegistryApiResponse<T> {
  success: boolean;
  data?: T;
  error?: LandRegistryError;
  metadata?: {
    requestId: string;
    timestamp: string;
    processingTime: number;
  };
}

// Search filters interface
export interface SearchFilters {
  postcode?: string;
  address?: string;
  minPrice?: number;
  maxPrice?: number;
  propertyTypes?: PropertyType[];
  tenureTypes?: TenureType[];
  dateFrom?: string;
  dateTo?: string;
  newBuildOnly?: boolean;
  includeCommercial?: boolean;
}

// Property statistics interface
export interface PropertyStatistics {
  totalProperties: number;
  averagePrice: number;
  medianPrice: number;
  priceRange: {
    min: number;
    max: number;
  };
  propertyTypeDistribution: Record<PropertyType, number>;
  tenureDistribution: Record<TenureType, number>;
  salesByYear: Record<string, number>;
  priceGrowth: {
    oneYear: number;
    fiveYear: number;
    tenYear: number;
  };
}

// Property valuation interface
export interface PropertyValuation {
  propertyId: string;
  estimatedValue: number;
  confidence: number;
  valuationDate: string;
  methodology: string;
  comparableProperties: PropertyWithDetails[];
  marketTrends: {
    localGrowth: number;
    regionalGrowth: number;
    nationalGrowth: number;
  };
}

// Land Registry API configuration
export interface LandRegistryConfig {
  baseUrl: string;
  apiKey: string;
  timeout: number;
  retryAttempts: number;
  rateLimitPerMinute: number;
  enableCaching: boolean;
  cacheExpiryMinutes: number;
}

// Cache entry interface
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
  key: string;
}

// Pagination interface
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Sort options
export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

// Advanced search options
export interface AdvancedSearchOptions {
  filters: SearchFilters;
  pagination: Pagination;
  sort: SortOptions[];
  includeStatistics: boolean;
  includeOwnership: boolean;
  includePriceHistory: boolean;
}

// Property comparison interface
export interface PropertyComparison {
  properties: PropertyWithDetails[];
  comparison: {
    priceRange: { min: number; max: number };
    averagePrice: number;
    sizeDifference?: number;
    locationSimilarity: number;
    marketPosition: string;
  };
}

// Market analysis interface
export interface MarketAnalysis {
  area: string;
  timeframe: string;
  statistics: PropertyStatistics;
  trends: {
    priceMovement: 'up' | 'down' | 'stable';
    volumeChange: number;
    averageDaysOnMarket: number;
    supplyDemandRatio: number;
  };
  forecast: {
    nextQuarter: number;
    nextYear: number;
    confidence: number;
  };
}

// Export type guards
export const isPropertyType = (value: string): value is PropertyType => {
  return ['D', 'S', 'T', 'F', 'O'].includes(value);
};

export const isTenureType = (value: string): value is TenureType => {
  return ['F', 'L'].includes(value);
};

export const isOwnershipType = (value: string): value is OwnershipType => {
  return ['individual', 'company', 'trust', 'other'].includes(value);
};

export const isExportFormat = (value: string): value is ExportFormat => {
  return ['csv', 'excel', 'json'].includes(value);
};

export const isExportStatus = (value: string): value is ExportStatus => {
  return ['pending', 'processing', 'completed', 'failed'].includes(value);
};

// Utility functions
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
};

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const calculatePriceChange = (oldPrice: number, newPrice: number): number => {
  return ((newPrice - oldPrice) / oldPrice) * 100;
};

export const getPropertyTypeDescription = (type: PropertyType): string => {
  return PropertyTypeDescriptions[type] || 'Unknown';
};

export const getTenureTypeDescription = (type: TenureType): string => {
  return TenureTypeDescriptions[type] || 'Unknown';
};