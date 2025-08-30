// Re-export specific types to avoid conflicts
export type { User, Address, LoginCredentials, RegisterData, AuthResponse, EmailVerification, Permission, PasswordResetRequest, PasswordReset, PasswordChange } from './auth';
export { UserRole } from './auth';
export type { Property as PropertyDetailed, PropertyType as PropertyTypeDetailed, PropertyStatus as PropertyStatusDetailed } from './property';

// Import types for internal use
import type { User, UserRole, Address } from './auth';

// Simplified Property interface for general use
export interface Property {
  id: string;
  title: string;
  description: string;
  type: PropertyType;
  status: PropertyStatus;
  price: {
    amount: number;
    period?: string;
  };
  priceType: PriceType;
  bedrooms: number;
  bathrooms: number;
  area: number;
  size?: string;
  location?: string;
  address: Address;
  images: PropertyImage[];
  features: string[];
  virtualTourUrl?: string;
  videoUrl?: string;
  hasVideo?: boolean;
  hasVirtualTour?: boolean;
  has360Tour?: boolean;
  propertyType?: PropertyType;
  isNew?: boolean;
  isFeatured?: boolean;
  isPremium?: boolean;
  agentId: string;
  agent?: Agent;
  landlordId?: string;
  epcRating?: string;
  marketInsights?: {
    daysOnMarket: number;
    viewsThisWeek: number;
    priceChange: number;
  };
  nearbyAmenities?: {
    schools: number;
    transport: number;
    shops: number;
    parks: number;
  };
  priceHistory?: PriceHistoryEntry[];
  marketData?: {
    priceHistory?: PriceHistoryEntry[];
    averagePrice?: number;
    priceChange?: number;
    daysOnMarket?: number;
    demandLevel?: 'low' | 'medium' | 'high';
    comparableProperties?: Property[];
  };
  priceChange?: {
    amount: number;
    percentage: number;
    direction: 'up' | 'down' | 'stable';
  };
  // Additional properties for compatibility
  council?: {
    taxBand: string;
  };
  energyRating?: {
    current: string;
  };
  legalInfo?: {
    tenure: string;
    groundRent?: number;
    serviceCharge?: number;
    leaseYearsRemaining?: number;
  };
  createdAt: string;
  updatedAt: string;
}

// Price History Entry interface
export interface PriceHistoryEntry {
  date: string;
  price: number;
  event: string;
  change?: number;
  changePercent?: number;
}

// Legacy PriceHistory interface for backward compatibility
export interface PriceHistory {
  date: string;
  price: number;
  event?: string;
  change?: number;
  changePercent?: number;
}

export enum PropertyType {
  HOUSE = 'house',
  FLAT = 'flat',
  APARTMENT = 'apartment',
  BUNGALOW = 'bungalow',
  MAISONETTE = 'maisonette',
  LAND = 'land',
  COMMERCIAL = 'commercial'
}

export enum PropertyStatus {
  AVAILABLE = 'available',
  UNDER_OFFER = 'under_offer',
  SOLD = 'sold',
  LET = 'let',
  WITHDRAWN = 'withdrawn'
}

export enum PriceType {
  SALE = 'sale',
  RENT_MONTHLY = 'rent_monthly',
  RENT_WEEKLY = 'rent_weekly'
}

export interface PropertyImage {
  id: string;
  url: string;
  alt: string;
  isPrimary: boolean;
  order: number;
}

// Address interface is imported from auth.ts

// Agent Types
export interface Agent {
  id: string;
  userId: string;
  user?: User;
  companyName: string;
  licenseNumber: string;
  address: Address;
  website?: string;
  specializations: string[];
  rating: number;
  reviewCount: number;
  isActive: boolean;
  phone?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  logo?: string;
  createdAt: string;
  updatedAt: string;
}

// Search and Filter Types
export interface PropertySearchFilters {
  type?: PropertyType;
  status?: PropertyStatus;
  priceType?: PriceType;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number | { min: number; max: number };
  bathrooms?: number | { min: number; max: number };
  minBedrooms?: number;
  maxBedrooms?: number;
  minBathrooms?: number;
  maxBathrooms?: number;
  location?: string;
  features?: string[];
  agentId?: string;
  propertyType?: PropertyType | PropertyType[];
  query?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  sortBy?: string;
  radius?: number;
  listingType?: string;
  addedWithin?: string;
  keywords?: string[];
  excludeKeywords?: string[];
}

// Type alias for backward compatibility
export type SearchCriteria = PropertySearchFilters;

export interface SearchResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Lead Management Types
export interface Lead {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone: string;
  source: string;
  propertyInterest: string;
  budget: number;
  budgetMin?: number;
  budgetMax?: number;
  interest?: string;
  timeline?: string;
  status: 'new' | 'contacted' | 'qualified' | 'viewing' | 'offer' | 'closed' | 'lost';
  priority: 'low' | 'medium' | 'high';
  dateCreated: string;
  lastContact?: string;
  nextFollowUp?: string;
  notes: string;
  score: number;
  type?: 'BUYER' | 'SELLER' | 'TENANT' | 'LANDLORD' | 'INVESTOR';
  requirements?: string;
  company?: string;
  jobTitle?: string;
  assignedAgent?: string;
  interestedProperty?: string;
  createdAt?: string;
  lastContactDate?: string;
  nextFollowUpDate?: string;
}

// Auth types are re-exported from auth.ts

// Dashboard Types
export interface DashboardStats {
  totalProperties: number;
  activeListings: number;
  totalViews: number;
  totalInquiries: number;
  monthlyRevenue?: number;
  recentActivities: Activity[];
}

export interface Activity {
  id: string;
  type: ActivityType;
  description: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export enum ActivityType {
  PROPERTY_LISTED = 'property_listed',
  PROPERTY_VIEWED = 'property_viewed',
  INQUIRY_RECEIVED = 'inquiry_received',
  VIEWING_SCHEDULED = 'viewing_scheduled',
  OFFER_MADE = 'offer_made',
  SALE_COMPLETED = 'sale_completed'
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> extends ApiResponse<SearchResult<T>> {}

// Form Types
export interface PropertyFormData {
  title: string;
  description: string;
  type: PropertyType;
  status: PropertyStatus;
  price: {
    amount: number;
    period?: string;
  };
  priceType: PriceType;
  bedrooms: number;
  bathrooms: number;
  area: number;
  size?: string;
  location?: string;
  address: Address;
  features: string[];
  virtualTourUrl?: string;
  videoUrl?: string;
}

// Market Analysis Types
export interface MarketAnalysis {
  averagePrice: number;
  priceChange: number;
  daysOnMarket: number;
  demandLevel: 'low' | 'medium' | 'high';
  comparableProperties: Property[];
  priceHistory: PricePoint[];
}

export interface PricePoint {
  date: string;
  price: number;
}

// Notification Types
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
}

export enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error'
}

// VR and 3D Types
export interface VRTour {
  id: string;
  propertyId: string;
  scenes: VRScene[];
  isActive: boolean;
}

export interface VRScene {
  id: string;
  name: string;
  imageUrl: string;
  hotspots: VRHotspot[];
}

export interface VRHotspot {
  id: string;
  x: number;
  y: number;
  type: 'navigation' | 'info';
  targetSceneId?: string;
  infoText?: string;
}

// AI Search Types
export interface SearchFilters {
  type?: PropertyType;
  status?: PropertyStatus;
  priceType?: PriceType;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  location?: string;
  features?: string[];
  agentId?: string;
  query?: string;
  radius?: number;
  keywords?: string[];
}

export interface SearchSuggestion {
  id: string;
  text: string;
  type: 'location' | 'property_type' | 'feature' | 'price_range';
  confidence: number;
  metadata?: Record<string, any>;
}

export interface SearchInsights {
  totalResults: number;
  averagePrice: number;
  priceRange: { min: number; max: number };
  popularFeatures: string[];
  marketTrends: MarketTrend[];
  recommendations: string[];
}

export interface MarketTrend {
  id: string;
  location: string;
  propertyType: PropertyType;
  period: string;
  priceChange: number;
  volumeChange: number;
  averagePrice: number;
  daysOnMarket: number;
  demandLevel: 'low' | 'medium' | 'high';
  trend: 'rising' | 'falling' | 'stable';
  confidence: number;
  lastUpdated: string;
}

export interface SearchPriceInsights {
  averagePrice: number;
  medianPrice: number;
  pricePerSqFt: number;
  priceChange: {
    monthly: number;
    quarterly: number;
    yearly: number;
  };
  priceDistribution: {
    range: string;
    count: number;
    percentage: number;
  }[];
}

export interface SearchLocationInsights {
  location: string;
  popularity: number;
  averageCommute: number;
  schoolRating: number;
  crimeRate: number;
  amenityScore: number;
  transportLinks: string[];
  nearbyAmenities: {
    schools: number;
    hospitals: number;
    shops: number;
    restaurants: number;
    parks: number;
  };
}

export interface SearchRecommendation {
  id: string;
  type: 'property' | 'location' | 'price_adjustment' | 'feature';
  title: string;
  description: string;
  confidence: number;
  reasoning: string;
  actionable: boolean;
  metadata?: {
    propertyId?: string;
    suggestedPrice?: number;
    alternativeLocations?: string[];
  };
}

export interface AIPropertyInsights {
  propertyId: string;
  priceAnalysis: PriceAnalysis;
  locationInsights: LocationInsights;
  marketPrediction: MarketPrediction;
  investmentPotential: InvestmentPotential;
  comparableProperties: Property[];
  riskFactors: string[];
  opportunities: string[];
  lastUpdated: string;
}

export interface PriceAnalysis {
  currentValue: number;
  estimatedValue: number;
  confidence: number;
  priceHistory: PricePoint[];
  marketComparison: {
    aboveMarket: boolean;
    percentage: number;
  };
  factors: {
    positive: string[];
    negative: string[];
  };
}

export interface LocationInsights {
  walkScore: number;
  transitScore: number;
  bikeScore: number;
  schoolDistrict: {
    rating: number;
    schools: string[];
  };
  demographics: {
    medianAge: number;
    medianIncome: number;
    populationGrowth: number;
  };
  amenities: {
    restaurants: number;
    shopping: number;
    entertainment: number;
    healthcare: number;
  };
}

export interface MarketPrediction {
  timeframe: '3_months' | '6_months' | '1_year' | '2_years';
  predictedValue: number;
  confidence: number;
  trend: 'bullish' | 'bearish' | 'neutral';
  factors: string[];
  scenarios: {
    optimistic: number;
    realistic: number;
    pessimistic: number;
  };
}

export interface InvestmentPotential {
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  roi: {
    rental: number;
    appreciation: number;
    total: number;
  };
  risks: {
    level: 'low' | 'medium' | 'high';
    factors: string[];
  };
  recommendations: string[];
}