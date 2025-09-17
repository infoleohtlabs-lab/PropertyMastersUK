// Land Registry API Types and Interfaces

export interface Property {
  id: string;
  title_number: string;
  property_description: string;
  tenure: 'Freehold' | 'Leasehold';
  address: {
    line1: string;
    line2?: string;
    town: string;
    county: string;
    postcode: string;
  };
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  created_at: string;
  updated_at: string;
}

export interface OwnershipRecord {
  id: string;
  property_id: string;
  proprietor_name: string;
  proprietor_address: {
    line1: string;
    line2?: string;
    town: string;
    county: string;
    postcode: string;
  };
  ownership_type: 'Sole' | 'Joint' | 'Tenants in Common' | 'Other';
  date_proprietor_added: string;
  additional_proprietor_indicator?: boolean;
  created_at: string;
  updated_at: string;
}

export interface PricePaidRecord {
  id: string;
  property_id?: string;
  price: number;
  date_of_transfer: string;
  postcode: string;
  property_type: 'D' | 'S' | 'T' | 'F' | 'O'; // Detached, Semi-detached, Terraced, Flat, Other
  old_new: 'Y' | 'N'; // New build or established property
  duration: 'F' | 'L'; // Freehold or Leasehold
  paon: string; // Primary Addressable Object Name
  saon?: string; // Secondary Addressable Object Name
  street: string;
  locality?: string;
  town_city: string;
  district: string;
  county: string;
  ppd_category_type: 'A' | 'B'; // Standard price paid or additional price paid
  record_status: 'A' | 'C' | 'D'; // Addition, Change, Delete
  created_at: string;
  updated_at: string;
}

export interface TransactionHistory {
  property_id: string;
  transactions: PricePaidRecord[];
  total_transactions: number;
  price_trend: {
    current_value?: number;
    previous_value?: number;
    change_percentage?: number;
    trend_direction: 'up' | 'down' | 'stable';
  };
}

export interface PropertyValuation {
  property_id: string;
  estimated_value: number;
  confidence_level: 'High' | 'Medium' | 'Low';
  valuation_date: string;
  comparable_properties: {
    property_id: string;
    price: number;
    date_of_sale: string;
    distance_meters: number;
  }[];
  market_trends: {
    area_average_price: number;
    price_change_12_months: number;
    market_activity_level: 'High' | 'Medium' | 'Low';
  };
}

export interface BulkSearchRequest {
  postcodes?: string[];
  title_numbers?: string[];
  search_type: 'ownership' | 'price_paid' | 'both';
  date_from?: string;
  date_to?: string;
  max_results?: number;
}

export interface BulkSearchResult {
  request_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  total_records: number;
  processed_records: number;
  results: {
    properties?: Property[];
    ownership_records?: OwnershipRecord[];
    price_paid_records?: PricePaidRecord[];
  };
  errors?: string[];
  created_at: string;
  completed_at?: string;
}

export interface ApiStatistics {
  total_requests: number;
  successful_requests: number;
  failed_requests: number;
  average_response_time: number;
  requests_by_endpoint: Record<string, number>;
  cache_hit_rate: number;
  last_updated: string;
}

export interface SyncStatus {
  last_sync: string;
  next_sync: string;
  status: 'idle' | 'syncing' | 'error';
  records_synced: number;
  errors: string[];
}

// Enums
export enum PropertyType {
  DETACHED = 'D',
  SEMI_DETACHED = 'S',
  TERRACED = 'T',
  FLAT = 'F',
  OTHER = 'O'
}

export enum Tenure {
  FREEHOLD = 'Freehold',
  LEASEHOLD = 'Leasehold'
}

export enum OwnershipType {
  SOLE = 'Sole',
  JOINT = 'Joint',
  TENANTS_IN_COMMON = 'Tenants in Common',
  OTHER = 'Other'
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

// Search and Filter Types
export interface PropertySearchFilters {
  postcode?: string;
  town?: string;
  county?: string;
  tenure?: Tenure;
  property_type?: PropertyType;
  price_min?: number;
  price_max?: number;
  date_from?: string;
  date_to?: string;
}

export interface PricePaidSearchFilters {
  postcode?: string;
  property_type?: PropertyType;
  price_min?: number;
  price_max?: number;
  date_from?: string;
  date_to?: string;
  new_build?: boolean;
}

// Type Guards
export const isProperty = (obj: any): obj is Property => {
  return obj && typeof obj.id === 'string' && typeof obj.title_number === 'string';
};

export const isOwnershipRecord = (obj: any): obj is OwnershipRecord => {
  return obj && typeof obj.id === 'string' && typeof obj.property_id === 'string';
};

export const isPricePaidRecord = (obj: any): obj is PricePaidRecord => {
  return obj && typeof obj.id === 'string' && typeof obj.price === 'number';
};

// Utility Functions
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const getPropertyTypeLabel = (type: PropertyType): string => {
  const labels = {
    [PropertyType.DETACHED]: 'Detached',
    [PropertyType.SEMI_DETACHED]: 'Semi-detached',
    [PropertyType.TERRACED]: 'Terraced',
    [PropertyType.FLAT]: 'Flat/Apartment',
    [PropertyType.OTHER]: 'Other',
  };
  return labels[type] || 'Unknown';
};

export const calculatePriceChange = (current: number, previous: number): {
  amount: number;
  percentage: number;
  direction: 'up' | 'down' | 'stable';
} => {
  const amount = current - previous;
  const percentage = previous > 0 ? (amount / previous) * 100 : 0;
  
  let direction: 'up' | 'down' | 'stable' = 'stable';
  if (Math.abs(percentage) > 0.1) {
    direction = percentage > 0 ? 'up' : 'down';
  }
  
  return { amount, percentage, direction };
};