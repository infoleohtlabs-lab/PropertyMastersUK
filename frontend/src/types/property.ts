export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  listingType: 'sale' | 'rent';
  propertyType: PropertyType;
  bedrooms: number;
  bathrooms: number;
  size: number; // in square feet
  address: PropertyAddress;
  location: PropertyLocation;
  features: string[];
  images: PropertyImage[];
  floorPlans?: PropertyImage[];
  virtualTour?: string;
  agent: PropertyAgent;
  landlord?: PropertyLandlord;
  status: PropertyStatus;
  availability: PropertyAvailability;
  energyRating?: EnergyRating;
  council: CouncilInfo;
  transport: TransportInfo;
  schools: SchoolInfo[];
  amenities: AmenityInfo[];
  marketData: MarketData;
  viewingInfo: ViewingInfo;
  legalInfo: LegalInfo;
  createdAt: string;
  updatedAt: string;
  viewCount: number;
  favoriteCount: number;
  aiScore?: number; // AI matching score
  aiInsights?: AIPropertyInsights;
}

export type PropertyType = 
  | 'house'
  | 'flat'
  | 'apartment'
  | 'bungalow'
  | 'cottage'
  | 'townhouse'
  | 'penthouse'
  | 'studio'
  | 'maisonette'
  | 'commercial'
  | 'land';

export type PropertyStatus = 
  | 'available'
  | 'under_offer'
  | 'sold'
  | 'let'
  | 'withdrawn'
  | 'draft';

export interface PropertyAddress {
  street: string;
  city: string;
  county: string;
  postcode: string;
  country: string;
  displayAddress: string;
}

export interface PropertyLocation {
  latitude: number;
  longitude: number;
  area: string;
  district: string;
  ward: string;
  constituency: string;
}

export interface PropertyImage {
  id: string;
  url: string;
  alt: string;
  caption?: string;
  order: number;
  type: 'photo' | 'floorplan' | 'epc';
}

export interface PropertyAgent {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  company: string;
  licenseNumber?: string;
  rating: number;
  reviewCount: number;
}

export interface PropertyLandlord {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  type: 'individual' | 'company';
}

export interface PropertyAvailability {
  availableFrom: string;
  minimumTenancy?: number; // in months for rentals
  maximumTenancy?: number; // in months for rentals
  furnished?: 'furnished' | 'unfurnished' | 'part-furnished';
  petsAllowed: boolean;
  smokingAllowed: boolean;
  studentsAllowed: boolean;
  dssAccepted: boolean; // Department for Social Security
}

export interface EnergyRating {
  current: string; // A-G
  potential: string; // A-G
  epcUrl?: string;
  validUntil: string;
}

export interface CouncilInfo {
  name: string;
  taxBand: string;
  taxAmount: number; // annual amount
}

export interface TransportInfo {
  nearestStation: string;
  stationDistance: number; // in miles
  transportLinks: string[];
  walkScore?: number;
  bikeScore?: number;
  transitScore?: number;
}

export interface SchoolInfo {
  name: string;
  type: 'primary' | 'secondary' | 'college' | 'university';
  rating: string;
  distance: number; // in miles
  website?: string;
}

export interface AmenityInfo {
  name: string;
  type: string;
  distance: number; // in miles
  rating?: number;
}

export interface MarketData {
  priceHistory: PriceHistory[];
  areaAveragePrice: number;
  pricePerSqFt: number;
  marketTrend: 'rising' | 'falling' | 'stable';
  daysOnMarket: number;
  viewsPerWeek: number;
  similarProperties: string[]; // property IDs
}

export interface PriceHistory {
  date: string;
  price: number;
  event: 'listed' | 'price_change' | 'sold' | 'withdrawn';
}

export interface ViewingInfo {
  availableSlots: ViewingSlot[];
  virtualViewingAvailable: boolean;
  contactForViewing: boolean;
  openHouse?: OpenHouseInfo;
}

export interface ViewingSlot {
  id: string;
  date: string;
  time: string;
  duration: number; // in minutes
  available: boolean;
  type: 'physical' | 'virtual';
}

export interface OpenHouseInfo {
  date: string;
  startTime: string;
  endTime: string;
  description?: string;
}

export interface LegalInfo {
  tenure: 'freehold' | 'leasehold' | 'shared_ownership';
  leaseYearsRemaining?: number;
  groundRent?: number;
  serviceCharge?: number;
  managementCompany?: string;
  restrictionsOrCovenants?: string[];
}

// AI-related interfaces
export interface AIPropertyInsights {
  matchScore: number;
  matchReasons: string[];
  priceAnalysis: PriceAnalysis;
  locationInsights: LocationInsights;
  marketPrediction: MarketPrediction;
  investmentPotential?: InvestmentPotential;
  recommendations: string[];
}

export interface PriceAnalysis {
  fairValue: number;
  priceRating: 'excellent' | 'good' | 'fair' | 'overpriced';
  comparisonToMarket: number; // percentage difference
  pricePerSqFtComparison: number;
  negotiationPotential: number; // percentage
}

export interface LocationInsights {
  walkabilityScore: number;
  safetyRating: number;
  growthPotential: number;
  amenityScore: number;
  transportScore: number;
  schoolRating: number;
  investmentGrade: 'A' | 'B' | 'C' | 'D';
}

export interface MarketPrediction {
  priceGrowthForecast: number; // percentage over next year
  demandLevel: 'high' | 'medium' | 'low';
  timeToSell: number; // estimated days
  marketCondition: 'buyers_market' | 'sellers_market' | 'balanced';
  confidence: number; // percentage
}

export interface InvestmentPotential {
  rentalYield: number;
  capitalGrowth: number;
  totalReturn: number;
  riskLevel: 'low' | 'medium' | 'high';
  investmentGrade: 'A' | 'B' | 'C' | 'D';
}

// Search-related interfaces
export interface SearchFilters {
  location?: string;
  propertyType?: PropertyType[];
  listingType?: 'sale' | 'rent';
  priceMin?: number;
  priceMax?: number;
  bedrooms?: number;
  bathrooms?: number;
  features?: string[];
  keywords?: string;
  radius?: number; // in miles
  sortBy?: SortOption;
  sortOrder?: 'asc' | 'desc';
}

export type SortOption = 
  | 'price'
  | 'date_added'
  | 'bedrooms'
  | 'size'
  | 'distance'
  | 'ai_score'
  | 'popularity';

export interface SearchResult {
  properties: Property[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  filters: SearchFilters;
  searchTime: number; // in milliseconds
  suggestions?: SearchSuggestion[];
  aiInsights?: SearchInsights;
}

export interface SearchSuggestion {
  type: 'location' | 'property_type' | 'price_range' | 'feature';
  value: string;
  count: number;
}

export interface SearchInsights {
  marketTrends: MarketTrend[];
  priceInsights: SearchPriceInsights;
  locationInsights: SearchLocationInsights;
  recommendations: SearchRecommendation[];
}

export interface MarketTrend {
  area: string;
  trend: 'rising' | 'falling' | 'stable';
  change: number; // percentage
  period: string;
}

export interface SearchPriceInsights {
  averagePrice: number;
  medianPrice: number;
  priceRange: {
    min: number;
    max: number;
  };
  pricePerSqFt: number;
  affordabilityIndex: number;
}

export interface SearchLocationInsights {
  popularAreas: string[];
  emergingAreas: string[];
  priceHotspots: string[];
  investmentOpportunities: string[];
}

export interface SearchRecommendation {
  type: 'expand_search' | 'adjust_budget' | 'consider_area' | 'property_type';
  title: string;
  description: string;
  action?: string;
}

// Saved search interfaces
export interface SavedSearch {
  id: string;
  name: string;
  filters: SearchFilters;
  alertsEnabled: boolean;
  alertFrequency: 'instant' | 'daily' | 'weekly';
  lastRun: string;
  resultCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface SearchAlert {
  id: string;
  savedSearchId: string;
  properties: Property[];
  sentAt: string;
  opened: boolean;
}

// Property comparison
export interface PropertyComparison {
  properties: Property[];
  comparisonMetrics: ComparisonMetric[];
  winner?: string; // property ID
  aiRecommendation?: string;
}

export interface ComparisonMetric {
  name: string;
  values: { [propertyId: string]: any };
  winner?: string; // property ID
  importance: 'high' | 'medium' | 'low';
}