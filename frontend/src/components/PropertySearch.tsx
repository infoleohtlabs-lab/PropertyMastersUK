import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Filter,
  MapPin,
  Home,
  Bed,
  Bath,
  Car,
  Ruler,
  Calendar,
  Banknote,
  Star,
  Heart,
  Share2,
  Eye,
  ChevronDown,
  Brain,
  Sparkles,
  MessageSquare,
  Target,
  Zap,
  ChevronUp,
  X,
  SlidersHorizontal,
  Map,
  List,
  LayoutGrid,
  Bookmark,
  Phone,
  Mail,
  Clock,
  TrendingDown,
  TrendingUp,
  Award,
  Wifi,
  TreePine,
  Train,
  ShoppingCart,
  BookOpen,
  Shield,
  Camera,
  Video,
  Move,
  RefreshCw,
  Download,
  Settings,
  Info,
  AlertCircle,
  CheckCircle,
  Navigation2
} from 'lucide-react';
import { Button } from './ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { showToast } from './ui/Toast';
import type { Property, PropertySearchFilters } from '../types';
import { PropertyType, PropertyStatus, PriceType } from '../types';

interface PropertySearchProps {
  onPropertySelect?: (property: Property) => void;
  onSaveSearch?: (searchCriteria: PropertySearchFilters) => void;
  className?: string;
  initialFilters?: Partial<PropertySearchFilters>;
  showMap?: boolean;
}

// Using Property and PropertyType from ../types

interface SearchState {
  results: Property[];
  loading: boolean;
  totalResults: number;
  currentPage: number;
  resultsPerPage: number;
  viewMode: 'list' | 'grid' | 'map';
  showFilters: boolean;
  savedSearches: SavedSearch[];
  recentSearches: string[];
  suggestions: string[];
  showSuggestions: boolean;
  aiSearchEnabled: boolean;
  aiSuggestions: string[];
  smartRecommendations: Property[];
  naturalLanguageQuery: string;
  searchInsights: {
    marketTrends: string[];
    priceInsights: string[];
    locationInsights: string[];
  };
}

interface SavedSearch {
  id: string;
  name: string;
  criteria: PropertySearchFilters;
  alertsEnabled: boolean;
  dateCreated: string;
  lastRun: string;
  newResults: number;
}

const PropertySearch: React.FC<PropertySearchProps> = ({
  onPropertySelect,
  onSaveSearch,
  className = '',
  initialFilters,
  showMap = true
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchCriteria, setSearchCriteria] = useState<PropertySearchFilters>({
    location: '',
    type: undefined,
    minPrice: 0,
    maxPrice: 2000000,
    bedrooms: undefined,
    bathrooms: undefined,
    propertyType: undefined,
    status: undefined,
    ...initialFilters
  });

  const [state, setState] = useState<SearchState>({
    results: [],
    loading: false,
    totalResults: 0,
    currentPage: 1,
    resultsPerPage: 12,
    viewMode: 'grid',
    showFilters: false,
    savedSearches: [],
    recentSearches: [],
    suggestions: [],
    showSuggestions: false,
    aiSearchEnabled: true,
    aiSuggestions: [],
    smartRecommendations: [],
    naturalLanguageQuery: '',
    searchInsights: {
      marketTrends: [],
      priceInsights: [],
      locationInsights: []
    }
  });

  // Mock data
  const mockProperties: Property[] = [
    {
      id: '1',
      title: 'Modern 3-Bedroom Semi-Detached House',
      description: 'A beautifully presented three-bedroom semi-detached house in the sought-after Riverside Gardens area.',
      type: PropertyType.HOUSE,
      status: PropertyStatus.AVAILABLE,
      price: { amount: 485000, period: undefined },
      priceType: PriceType.SALE,
      bedrooms: 3,
      bathrooms: 2,
      area: 1200,
      size: '1200 sq ft',
      location: 'Riverside Gardens',
      address: {
        street: '15 Oak Street',
        city: 'Reading',
        county: 'Berkshire',
        postcode: 'RG1 2AB',
        country: 'United Kingdom'
      },
      images: [
        {
          id: '1',
          url: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20house%20exterior%20semi%20detached%20front%20view&image_size=landscape_16_9',
          alt: 'Modern house exterior',
          isPrimary: true,
          order: 1
        }
      ],
      features: ['Garden', 'Parking', 'Modern Kitchen', 'En-suite', 'Double Glazing', 'Central Heating'],
      virtualTourUrl: 'vr-tour-1',
      videoUrl: 'property-video-1',
      agentId: 'agent1',
      agent: {
        id: 'agent1',
        userId: 'user1',
        companyName: 'Prime Properties',
        licenseNumber: 'LIC001',
        address: {
          street: '123 Business St',
          city: 'Reading',
          county: 'Berkshire',
          postcode: 'RG1 1AA',
          country: 'United Kingdom'
        },
        specializations: ['Residential Sales'],
        rating: 4.8,
        reviewCount: 125,
        isActive: true,
        phone: '+44 20 1234 5678',
        email: 'info@primeproperties.co.uk',
        firstName: 'John',
        lastName: 'Smith',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      },
      createdAt: '2024-01-15T00:00:00Z',
      updatedAt: '2024-01-20T00:00:00Z'
    },
    {
      id: '2',
      title: 'Luxury 2-Bedroom Apartment',
      description: 'Stunning luxury apartment in the heart of the city with panoramic views.',
      type: PropertyType.APARTMENT,
      status: PropertyStatus.AVAILABLE,
      price: { amount: 1800, period: 'month' },
      priceType: PriceType.RENT_MONTHLY,
      bedrooms: 2,
      bathrooms: 2,
      area: 950,
      size: '950 sq ft',
      location: 'City Centre',
      address: {
        street: '22 Elm Avenue',
        city: 'London',
        county: 'Greater London',
        postcode: 'CC1 3CD',
        country: 'United Kingdom'
      },
      images: [
        {
          id: '2',
          url: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=luxury%20apartment%20building%20modern%20exterior&image_size=landscape_16_9',
          alt: 'Luxury apartment exterior',
          isPrimary: true,
          order: 1
        }
      ],
      features: ['Balcony', 'Concierge', 'Gym', 'Parking', 'Air Conditioning', 'Floor-to-ceiling windows'],
      agentId: 'agent2',
      agent: {
        id: 'agent2',
        userId: 'user2',
        companyName: 'City Living Estates',
        licenseNumber: 'LIC002',
        address: {
          street: '456 Business Ave',
          city: 'London',
          county: 'Greater London',
          postcode: 'SW1A 2AA',
          country: 'United Kingdom'
        },
        specializations: ['Luxury Rentals'],
        rating: 4.6,
        reviewCount: 89,
        isActive: true,
        phone: '+44 20 2345 6789',
        email: 'rentals@cityliving.co.uk',
        firstName: 'Sarah',
        lastName: 'Johnson',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      },
      createdAt: '2024-01-18T00:00:00Z',
      updatedAt: '2024-01-22T00:00:00Z'
    },
    {
      id: '3',
      title: 'Charming Victorian Terraced House',
      description: 'Beautiful Victorian terraced house with original features and modern conveniences.',
      type: PropertyType.HOUSE,
      status: PropertyStatus.AVAILABLE,
      price: { amount: 425000, period: undefined },
      priceType: PriceType.SALE,
      bedrooms: 4,
      bathrooms: 1,
      area: 1350,
      size: '1350 sq ft',
      location: 'Heritage District',
      address: {
        street: '7 Maple Close',
        city: 'Reading',
        county: 'Berkshire',
        postcode: 'HD2 4EF',
        country: 'United Kingdom'
      },
      images: [
        {
          id: '3',
          url: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=victorian%20terraced%20house%20traditional%20brick&image_size=landscape_16_9',
          alt: 'Victorian terraced house exterior',
          isPrimary: true,
          order: 1
        }
      ],
      features: ['Period Features', 'Garden', 'Fireplace', 'High Ceilings', 'Original Sash Windows'],
      virtualTourUrl: 'vr-tour-3',
      agentId: 'agent3',
      agent: {
        id: 'agent3',
        userId: 'user3',
        companyName: 'Heritage Homes',
        licenseNumber: 'LIC003',
        address: {
          street: '789 Heritage Lane',
          city: 'Reading',
          county: 'Berkshire',
          postcode: 'RG1 3AA',
          country: 'United Kingdom'
        },
        specializations: ['Period Properties'],
        rating: 4.7,
        reviewCount: 98,
        isActive: true,
        phone: '+44 20 3456 7890',
        email: 'sales@heritagehomes.co.uk',
        firstName: 'Michael',
        lastName: 'Brown',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      },
      createdAt: '2024-01-10T00:00:00Z',
      updatedAt: '2024-01-19T00:00:00Z'
    }
  ];

  const propertyTypeOptions = [
    { value: 'HOUSE', label: 'House', icon: Home },
    { value: 'FLAT', label: 'Flat', icon: Home },
    { value: 'BUNGALOW', label: 'Bungalow', icon: Home },
    { value: 'TERRACED', label: 'Terraced', icon: Home },
    { value: 'SEMI_DETACHED', label: 'Semi-detached', icon: Home },
    { value: 'DETACHED', label: 'Detached', icon: Home },
    { value: 'STUDIO', label: 'Studio', icon: Home },
    { value: 'MAISONETTE', label: 'Maisonette', icon: Home }
  ];

  const featureOptions = [
    'Garden', 'Parking', 'Garage', 'Balcony', 'Terrace', 'Fireplace',
    'En-suite', 'Walk-in Closet', 'Utility Room', 'Conservatory',
    'Swimming Pool', 'Gym', 'Concierge', 'Security', 'Lift',
    'Air Conditioning', 'Underfloor Heating', 'Solar Panels',
    'Electric Car Charging', 'Fiber Broadband', 'Smart Home'
  ];

  const searchSuggestions = [
    'London', 'Manchester', 'Birmingham', 'Leeds', 'Liverpool',
    'Bristol', 'Sheffield', 'Newcastle', 'Nottingham', 'Leicester'
  ];

  useEffect(() => {
    // Simulate search when criteria changes
    if (searchCriteria.location) {
      performSearch();
    }
  }, [searchCriteria]);

  // AI-powered search functions
  const processNaturalLanguageQuery = async (query: string) => {
    // Simulate AI processing of natural language
    const aiSuggestions = [
      'Properties with gardens near schools',
      'Modern apartments under £300k',
      'Family homes with parking',
      'Investment properties with high yield',
      'Properties near transport links'
    ];
    
    const insights = {
      marketTrends: [
        'Property prices in this area increased by 5% this year',
        'High demand for 3-bedroom houses',
        'New developments planned nearby'
      ],
      priceInsights: [
        'Average price: £285,000',
        'Price range: £200k - £450k',
        'Best value properties available'
      ],
      locationInsights: [
        'Excellent transport links',
        'Good school ratings',
        'Growing investment area'
      ]
    };
    
    setState(prev => ({
      ...prev,
      aiSuggestions,
      searchInsights: insights,
      naturalLanguageQuery: query
    }));
  };
  
  const generateSmartRecommendations = async () => {
    // Simulate AI-based recommendations
    const recommendations = mockProperties.slice(0, 3).map(property => ({
      ...property,
      id: `rec_${property.id}`,
      title: `Recommended: ${property.title}`,
      aiScore: Math.floor(Math.random() * 30) + 70 // 70-100% match
    }));
    
    setState(prev => ({
      ...prev,
      smartRecommendations: recommendations
    }));
  };

  const performSearch = async () => {
    setState(prev => ({ ...prev, loading: true }));
    
    // Process natural language query if AI is enabled
    if (state.aiSearchEnabled && searchCriteria.location) {
      await processNaturalLanguageQuery(searchCriteria.location);
    }
    
    // Simulate API call
    setTimeout(() => {
      const filteredResults = mockProperties.filter(property => {
        // Apply filters
        if (searchCriteria.type && property.type !== searchCriteria.type) {
          return false;
        }
        
        if (searchCriteria.minPrice && property.price.amount < searchCriteria.minPrice) {
          return false;
        }
        
        if (searchCriteria.maxPrice && property.price.amount > searchCriteria.maxPrice) {
          return false;
        }
        
        if (searchCriteria.bedrooms) {
          if (typeof searchCriteria.bedrooms === 'number') {
            if (property.bedrooms < searchCriteria.bedrooms) {
              return false;
            }
          } else {
            if (property.bedrooms < searchCriteria.bedrooms.min || property.bedrooms > searchCriteria.bedrooms.max) {
              return false;
            }
          }
        }
        
        if (searchCriteria.bathrooms) {
          if (typeof searchCriteria.bathrooms === 'number') {
            if (property.bathrooms < searchCriteria.bathrooms) {
              return false;
            }
          } else {
            if (property.bathrooms < searchCriteria.bathrooms.min || property.bathrooms > searchCriteria.bathrooms.max) {
              return false;
            }
          }
        }
        
        if (searchCriteria.status && property.status !== searchCriteria.status) {
          return false;
        }
        
        return true;
      });
      
      setState(prev => ({
        ...prev,
        results: filteredResults,
        totalResults: filteredResults.length,
        loading: false
      }));
      
      // Generate smart recommendations after search
      if (state.aiSearchEnabled) {
        generateSmartRecommendations();
      }
    }, 1000);
  };

  const handleSearch = (location: string) => {
    setSearchCriteria(prev => ({ ...prev, location }));
    setState(prev => ({
      ...prev,
      recentSearches: [location, ...prev.recentSearches.filter(s => s !== location)].slice(0, 5)
    }));
  };

  const handleFilterChange = (key: keyof PropertySearchFilters, value: any) => {
    setSearchCriteria(prev => ({ ...prev, [key]: value }));
  };

  const togglePropertyType = (type: PropertyType) => {
    setSearchCriteria(prev => {
      const currentTypes = Array.isArray(prev.propertyType) ? prev.propertyType : [];
      return {
        ...prev,
        propertyType: currentTypes.includes(type)
          ? currentTypes.filter(t => t !== type)
          : [...currentTypes, type]
      };
    });
  };

  const toggleFeature = (feature: string) => {
    setSearchCriteria(prev => {
      const currentFeatures = Array.isArray(prev.features) ? prev.features : [];
      return {
        ...prev,
        features: currentFeatures.includes(feature)
          ? currentFeatures.filter(f => f !== feature)
          : [...currentFeatures, feature]
      };
    });
  };

  const clearFilters = () => {
    setSearchCriteria({
      query: '',
      location: '',
      propertyType: [],
      priceRange: { min: 0, max: 2000000 },
      bedrooms: { min: 0, max: 10 },
      bathrooms: { min: 0, max: 10 },
      features: [],
      radius: 5,
      sortBy: 'relevance',
      listingType: 'both',
      addedWithin: 'any',
      keywords: [],
      excludeKeywords: []
    });
  };

  const saveSearch = () => {
    if (onSaveSearch) {
      onSaveSearch(searchCriteria);
    }
    showToast.success('Search saved successfully');
  };

  const formatPrice = (price: { amount: number; period?: string }, type: string) => {
    const formatted = new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price.amount);
    
    if (type.toLowerCase() === 'rent') {
      return price.period ? `${formatted} ${price.period}` : `${formatted} pcm`;
    }
    return formatted;
  };

  const getPropertyTypeIcon = (type: PropertyType) => {
    const option = propertyTypeOptions.find(opt => opt.value === type);
    return option ? option.icon : Home;
  };

  const PropertyCard: React.FC<{ property: Property }> = ({ property }) => {
    const [isFavorited, setIsFavorited] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    
    const PropertyIcon = getPropertyTypeIcon(property.propertyType || PropertyType.HOUSE);
    
    return (
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
        {/* Image Gallery */}
        <div className="relative">
          <img
            src={property.images[0]?.url || '/placeholder-property.jpg'}
            alt={property.title}
            className="w-full h-48 object-cover"
          />
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col space-y-1">
            {property.isNew && (
              <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
                New
              </span>
            )}
            {property.isFeatured && (
              <span className="bg-yellow-500 text-white px-2 py-1 rounded text-xs font-medium">
                Featured
              </span>
            )}
            {property.isPremium && (
              <span className="bg-purple-500 text-white px-2 py-1 rounded text-xs font-medium">
                Premium
              </span>
            )}
          </div>
          
          {/* Media Icons */}
          <div className="absolute top-2 right-2 flex space-x-1">
            {property.hasVirtualTour && (
              <div className="bg-black bg-opacity-70 text-white p-1 rounded">
                <Move className="h-4 w-4" />
              </div>
            )}
            {property.hasVideo && (
              <div className="bg-black bg-opacity-70 text-white p-1 rounded">
                <Video className="h-4 w-4" />
              </div>
            )}
            {property.has360Tour && (
              <div className="bg-black bg-opacity-70 text-white p-1 rounded">
                <Camera className="h-4 w-4" />
              </div>
            )}
          </div>
          
          {/* Image Count */}
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
            <Camera className="h-3 w-3 inline mr-1" />
            {property.images.length}
          </div>
          
          {/* Favorite Button */}
          <button
            onClick={() => setIsFavorited(!isFavorited)}
            className="absolute bottom-2 left-2 bg-white bg-opacity-90 p-2 rounded-full hover:bg-opacity-100 transition-colors"
          >
            <Heart className={`h-4 w-4 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
          </button>
        </div>
        
        <CardContent className="p-4">
          {/* Price and Type */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-blue-600">
                {formatPrice(property.price, property.priceType)}
              </span>
              {property.marketInsights && property.marketInsights.priceChange !== 0 && (
                <span className={`text-sm flex items-center ${
                  property.marketInsights.priceChange > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {property.marketInsights.priceChange > 0 ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  {Math.abs(property.marketInsights.priceChange)}%
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-1">
              <PropertyIcon className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600 capitalize">
                {property.propertyType?.replace('_', ' ') || property.type.replace('_', ' ')}
              </span>
            </div>
          </div>
          
          {/* Title and Address */}
          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{property.title}</h3>
          <p className="text-gray-600 text-sm mb-3 flex items-center">
            <MapPin className="h-3 w-3 mr-1" />
            {`${property.address.street}, ${property.address.city}, ${property.address.postcode}`}
          </p>
          
          {/* Property Details */}
          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
            <div className="flex items-center">
              <Bed className="h-4 w-4 mr-1" />
              {property.bedrooms}
            </div>
            <div className="flex items-center">
              <Bath className="h-4 w-4 mr-1" />
              {property.bathrooms}
            </div>
            <div className="flex items-center">
              <Ruler className="h-4 w-4 mr-1" />
              {property.size} sq ft
            </div>
            {property.epcRating && (
              <div className="flex items-center">
                <Zap className="h-4 w-4 mr-1" />
                EPC {property.epcRating}
              </div>
            )}
          </div>
          
          {/* Features */}
          <div className="flex flex-wrap gap-1 mb-3">
            {property.features.slice(0, 3).map((feature) => (
              <span
                key={feature}
                className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
              >
                {feature}
              </span>
            ))}
            {property.features.length > 3 && (
              <span className="text-gray-500 text-xs">+{property.features.length - 3} more</span>
            )}
          </div>
          
          {/* Agent and Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {property.agent && (
                <>
                  <img
                    src={property.agent.logo || '/default-agent-logo.png'}
                    alt={property.agent.name || 'Agent'}
                    className="w-6 h-6 rounded"
                  />
                  <div>
                    <p className="text-xs font-medium text-gray-900">{property.agent.name || 'Unknown Agent'}</p>
                    <div className="flex items-center">
                      <Star className="h-3 w-3 text-yellow-400 fill-current" />
                      <span className="text-xs text-gray-600 ml-1">{property.agent.rating || 0}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
            
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => showToast.info('Sharing feature coming soon')}
              >
                <Share2 className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
              >
                <Eye className="h-4 w-4" />
              </Button>
              
              <Button
                variant="primary"
                size="sm"
                onClick={() => onPropertySelect?.(property)}
              >
                View Details
              </Button>
            </div>
          </div>
          
          {/* Market Insights */}
          {showDetails && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              {property.marketInsights && (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Days on market</p>
                    <p className="font-medium">{property.marketInsights.daysOnMarket}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Views this week</p>
                    <p className="font-medium">{property.marketInsights.viewsThisWeek}</p>
                  </div>
                </div>
              )}
              
              {/* Nearby Amenities */}
              {property.nearbyAmenities && (
                <div className="mt-3">
                  <p className="text-sm font-medium text-gray-900 mb-2">Nearby Amenities</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-600">
                    <div className="flex items-center">
                      <BookOpen className="h-3 w-3 mr-1" />
                      {property.nearbyAmenities.schools}/10
                    </div>
                    <div className="flex items-center">
                      <Train className="h-3 w-3 mr-1" />
                      {property.nearbyAmenities.transport}/10
                    </div>
                    <div className="flex items-center">
                      <ShoppingCart className="h-3 w-3 mr-1" />
                      {property.nearbyAmenities.shops}/10
                    </div>
                    <div className="flex items-center">
                      <TreePine className="h-3 w-3 mr-1" />
                      {property.nearbyAmenities.parks}/10
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg ${className}`}>
      {/* Search Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center space-x-4 mb-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search by location, postcode, or property type..."
                value={searchCriteria.query || ''}
                onChange={(e) => {
                  handleFilterChange('query', e.target.value);
                  setState(prev => ({ ...prev, showSuggestions: e.target.value.length > 0 }));
                }}
                onFocus={() => setState(prev => ({ ...prev, showSuggestions: true }))}
                onBlur={() => setTimeout(() => setState(prev => ({ ...prev, showSuggestions: false })), 200)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              
              {/* Search Suggestions */}
              {state.showSuggestions && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 mt-1">
                  {searchSuggestions
                    .filter(suggestion => suggestion.toLowerCase().includes((searchCriteria.query || '').toLowerCase()))
                    .slice(0, 5)
                    .map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => {
                          handleSearch(suggestion);
                          setState(prev => ({ ...prev, showSuggestions: false }));
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center"
                      >
                        <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                        {suggestion}
                      </button>
                    ))
                  }
                </div>
              )}
            </div>
          </div>
          
          {/* Filter Toggle */}
          <Button
            variant="outline"
            onClick={() => setState(prev => ({ ...prev, showFilters: !prev.showFilters }))}
            className="flex items-center"
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filters
            {((searchCriteria.propertyType?.length || 0) > 0 || 
              (searchCriteria.features?.length || 0) > 0 || 
              (searchCriteria.priceRange?.min || 0) > 0 || 
              (searchCriteria.priceRange?.max || 2000000) < 2000000) && (
              <span className="ml-2 bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                !
              </span>
            )}
          </Button>
          
          {/* Save Search */}
          <Button
            variant="outline"
            onClick={saveSearch}
            className="flex items-center"
          >
            <Bookmark className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
        
        {/* Quick Filters */}
        <div className="flex items-center space-x-2 mb-4">
          <span className="text-sm text-gray-600">Quick filters:</span>
          
          <select
            value={searchCriteria.listingType}
            onChange={(e) => handleFilterChange('listingType', e.target.value)}
            className="border border-gray-300 rounded px-3 py-1 text-sm"
          >
            <option value="both">Buy & Rent</option>
            <option value="sale">For Sale</option>
            <option value="rent">To Rent</option>
          </select>
          
          <select
            value={typeof searchCriteria.bedrooms === 'object' ? `${searchCriteria.bedrooms?.min || 0}-${searchCriteria.bedrooms?.max || 10}` : `${searchCriteria.bedrooms || 0}-${searchCriteria.bedrooms || 10}`}
            onChange={(e) => {
              const [min, max] = e.target.value.split('-').map(Number);
              handleFilterChange('bedrooms', { min, max });
            }}
            className="border border-gray-300 rounded px-3 py-1 text-sm"
          >
            <option value="0-10">Any bedrooms</option>
            <option value="1-1">1 bedroom</option>
            <option value="2-2">2 bedrooms</option>
            <option value="3-3">3 bedrooms</option>
            <option value="4-4">4 bedrooms</option>
            <option value="5-10">5+ bedrooms</option>
          </select>
          
          <select
            value={searchCriteria.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            className="border border-gray-300 rounded px-3 py-1 text-sm"
          >
            <option value="relevance">Most relevant</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="date_desc">Newest first</option>
            <option value="size_desc">Largest first</option>
          </select>
        </div>
      </div>
      
      {/* AI Search Features */}
      {state.aiSearchEnabled && (
        <div className="border-b border-gray-200 p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center mb-4">
            <Brain className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">AI-Powered Search</h3>
            <Sparkles className="h-4 w-4 text-yellow-500 ml-2" />
          </div>
          
          {/* Natural Language Search */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MessageSquare className="h-4 w-4 inline mr-1" />
              Describe what you're looking for
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g., 'Family home with garden near good schools under £400k'"
                value={state.naturalLanguageQuery}
                onChange={(e) => setState(prev => ({ ...prev, naturalLanguageQuery: e.target.value }))}
                onKeyPress={(e) => e.key === 'Enter' && processNaturalLanguageQuery(e.currentTarget.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
              />
              <Button
                onClick={() => processNaturalLanguageQuery(state.naturalLanguageQuery)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
                size="sm"
              >
                <Zap className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* AI Suggestions */}
          {state.aiSuggestions.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Target className="h-4 w-4 inline mr-1" />
                AI Suggestions
              </label>
              <div className="flex flex-wrap gap-2">
                {state.aiSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setState(prev => ({ ...prev, naturalLanguageQuery: suggestion }));
                      processNaturalLanguageQuery(suggestion);
                    }}
                    className="px-3 py-1 bg-white border border-blue-200 rounded-full text-sm text-blue-700 hover:bg-blue-50 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Search Insights */}
          {(state.searchInsights.marketTrends.length > 0 || 
            state.searchInsights.priceInsights.length > 0 || 
            state.searchInsights.locationInsights.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {state.searchInsights.marketTrends.length > 0 && (
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center mb-2">
                    <TrendingUp className="h-4 w-4 text-green-600 mr-2" />
                    <h4 className="font-medium text-gray-900">Market Trends</h4>
                  </div>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {state.searchInsights.marketTrends.map((trend, index) => (
                      <li key={index}>• {trend}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {state.searchInsights.priceInsights.length > 0 && (
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center mb-2">
                    <Banknote className="h-4 w-4 text-blue-600 mr-2" />
                    <h4 className="font-medium text-gray-900">Price Insights</h4>
                  </div>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {state.searchInsights.priceInsights.map((insight, index) => (
                      <li key={index}>• {insight}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {state.searchInsights.locationInsights.length > 0 && (
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center mb-2">
                    <MapPin className="h-4 w-4 text-purple-600 mr-2" />
                    <h4 className="font-medium text-gray-900">Location Insights</h4>
                  </div>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {state.searchInsights.locationInsights.map((insight, index) => (
                      <li key={index}>• {insight}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* Advanced Filters */}
      {state.showFilters && (
        <div className="border-b border-gray-200 p-6 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Property Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
              <div className="grid grid-cols-2 gap-2">
                {propertyTypeOptions.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => togglePropertyType(value as PropertyType)}
                    className={`flex items-center p-2 rounded border text-sm ${
                      searchCriteria.propertyType?.includes(value as PropertyType)
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {label}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
              <div className="space-y-2">
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Min price"
                    value={searchCriteria.priceRange?.min || ''}
                    onChange={(e) => handleFilterChange('priceRange', {
                      ...(searchCriteria.priceRange || { min: 0, max: 2000000 }),
                      min: Number(e.target.value) || 0
                    })}
                    className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm text-black"
                  />
                  <input
                    type="number"
                    placeholder="Max price"
                    value={(searchCriteria.priceRange?.max || 2000000) === 2000000 ? '' : (searchCriteria.priceRange?.max || 2000000)}
                    onChange={(e) => handleFilterChange('priceRange', {
                      ...(searchCriteria.priceRange || { min: 0, max: 2000000 }),
                      max: Number(e.target.value) || 2000000
                    })}
                    className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm text-black"
                  />
                </div>
              </div>
            </div>
            
            {/* Features */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Features</label>
              <div className="max-h-32 overflow-y-auto">
                <div className="grid grid-cols-1 gap-1">
                  {featureOptions.slice(0, 8).map((feature) => (
                    <label key={feature} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={searchCriteria.features?.includes(feature) || false}
                        onChange={() => toggleFeature(feature)}
                        className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-6">
            <Button
              variant="outline"
              onClick={clearFilters}
              className="flex items-center"
            >
              <X className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
            
            <div className="text-sm text-gray-600">
              {state.totalResults} properties found
            </div>
          </div>
        </div>
      )}
      
      {/* Results Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {state.loading ? 'Searching...' : `${state.totalResults} Properties Found`}
            </h2>
            {searchCriteria.location && (
              <p className="text-gray-600">in {searchCriteria.location}</p>
            )}
          </div>
          
          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2">
            <div className="flex border border-gray-300 rounded">
              <button
                onClick={() => setState(prev => ({ ...prev, viewMode: 'list' }))}
                className={`p-2 ${
                  state.viewMode === 'list'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => setState(prev => ({ ...prev, viewMode: 'grid' }))}
                className={`p-2 ${
                  state.viewMode === 'grid'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              {showMap && (
                <button
                  onClick={() => setState(prev => ({ ...prev, viewMode: 'map' }))}
                  className={`p-2 ${
                    state.viewMode === 'map'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Map className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Smart Recommendations */}
      {state.aiSearchEnabled && state.smartRecommendations.length > 0 && (
        <div className="border-b border-gray-200 p-6 bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-center mb-4">
            <Sparkles className="h-5 w-5 text-purple-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Smart Recommendations</h3>
            <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">AI Powered</span>
          </div>
          <p className="text-gray-600 mb-4">Based on your search preferences and market analysis</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {state.smartRecommendations.map((property) => (
              <div key={property.id} className="bg-white rounded-lg border border-purple-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="relative">
                  <img
                    src={property.images?.[0]?.url || 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20house%20exterior&image_size=landscape_16_9'}
                    alt={property.images?.[0]?.alt || 'Property'}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <div className="absolute top-2 right-2 bg-purple-600 text-white px-2 py-1 rounded text-xs font-medium">
                    {(property as any).aiScore}% Match
                  </div>
                  <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
                    {property.priceType === 'sale' ? 'For Sale' : 'To Rent'}
                  </div>
                </div>
                
                <div className="p-4">
                  <h4 className="font-semibold text-gray-900 mb-1 line-clamp-2">{property.title}</h4>
                  <p className="text-gray-600 text-sm mb-2 flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    {`${property.address.city}, ${property.address.postcode}`}
                  </p>
                  
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-lg font-bold text-purple-600">
                      £{property.price.amount.toLocaleString()}
                      {property.price.period && `/${property.price.period}`}
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Bed className="h-3 w-3 mr-1" />
                        {property.bedrooms}
                      </div>
                      <div className="flex items-center">
                        <Bath className="h-3 w-3 mr-1" />
                        {property.bathrooms}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onPropertySelect?.(property)}
                      className="flex-1 mr-2"
                    >
                      View Details
                    </Button>
                    <Button size="sm" variant="ghost" className="p-2">
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Results */}
      <div className="p-6">
        {state.loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-lg font-medium text-gray-700">Searching Properties...</p>
            </div>
          </div>
        ) : state.viewMode === 'map' ? (
          <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-500">
              <Map className="h-12 w-12 mx-auto mb-2" />
              <p>Interactive map would be displayed here</p>
              <p className="text-sm">Showing {state.totalResults} properties</p>
            </div>
          </div>
        ) : (
          <div className={`grid gap-6 ${
            state.viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
              : 'grid-cols-1'
          }`}>
            {state.results.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
        
        {/* No Results */}
        {!state.loading && state.results.length === 0 && (
          <div className="text-center py-12">
            <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search criteria or expanding your search area.</p>
            <Button onClick={clearFilters} variant="outline">
              Clear all filters
            </Button>
          </div>
        )}
        
        {/* Pagination */}
        {state.totalResults > state.resultsPerPage && (
          <div className="flex items-center justify-center mt-8">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                disabled={state.currentPage === 1}
                onClick={() => setState(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
              >
                Previous
              </Button>
              
              <span className="text-sm text-gray-600">
                Page {state.currentPage} of {Math.ceil(state.totalResults / state.resultsPerPage)}
              </span>
              
              <Button
                variant="outline"
                disabled={state.currentPage >= Math.ceil(state.totalResults / state.resultsPerPage)}
                onClick={() => setState(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertySearch;