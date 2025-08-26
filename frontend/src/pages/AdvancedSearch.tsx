import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { showToast } from '../utils/toast';
import {
  Search,
  Filter,
  MapPin,
  Home,
  Building,
  Car,
  Wifi,
  Trees,
  Shield,
  Heart,
  Star,
  Eye,
  Phone,
  Mail,
  Calendar,
  PoundSterling,
  Bed,
  Bath,
  Square,
  ChevronDown,
  ChevronUp,
  X,
  SlidersHorizontal,
  Grid,
  List,
  Map,
  Bookmark,
  Share2,
  Download,
  RefreshCw,
  ArrowUpDown,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertCircle,
  Info,
  Plus,
  Minus,
  MoreHorizontal,
  ExternalLink,
  Camera,
  Video,
  FileText,
  Users,
  Zap,
  Thermometer,
  Droplets,
  Sun,
  Moon
} from 'lucide-react';

interface Property {
  id: string;
  title: string;
  address: string;
  postcode: string;
  city: string;
  county: string;
  price: number;
  priceType: 'sale' | 'rent';
  propertyType: 'house' | 'flat' | 'bungalow' | 'commercial' | 'land';
  bedrooms: number;
  bathrooms: number;
  receptions: number;
  sqft: number;
  tenure: 'freehold' | 'leasehold' | 'shared-ownership';
  councilTaxBand: string;
  epcRating: string;
  yearBuilt: number;
  parking: boolean;
  garden: boolean;
  balcony: boolean;
  garage: boolean;
  furnished: 'furnished' | 'unfurnished' | 'part-furnished';
  petFriendly: boolean;
  smokingAllowed: boolean;
  availableFrom: string;
  description: string;
  features: string[];
  images: string[];
  virtualTour: boolean;
  floorPlan: boolean;
  agent: {
    name: string;
    company: string;
    phone: string;
    email: string;
  };
  location: {
    lat: number;
    lng: number;
  };
  nearbyAmenities: {
    schools: number;
    hospitals: number;
    shops: number;
    transport: number;
  };
  priceHistory: {
    date: string;
    price: number;
    event: string;
  }[];
  viewingStats: {
    views: number;
    enquiries: number;
    viewings: number;
  };
  listedDate: string;
  lastUpdated: string;
  status: 'available' | 'under-offer' | 'sold' | 'let' | 'withdrawn';
  featured: boolean;
  premium: boolean;
}

interface SearchFilters {
  query: string;
  location: string;
  radius: number;
  priceType: 'sale' | 'rent' | 'both';
  minPrice: number;
  maxPrice: number;
  propertyTypes: string[];
  minBedrooms: number;
  maxBedrooms: number;
  minBathrooms: number;
  maxBathrooms: number;
  minReceptions: number;
  maxReceptions: number;
  minSqft: number;
  maxSqft: number;
  tenure: string[];
  councilTaxBands: string[];
  epcRatings: string[];
  minYearBuilt: number;
  maxYearBuilt: number;
  parking: boolean | null;
  garden: boolean | null;
  balcony: boolean | null;
  garage: boolean | null;
  furnished: string[];
  petFriendly: boolean | null;
  smokingAllowed: boolean | null;
  availableFrom: string;
  features: string[];
  virtualTour: boolean | null;
  floorPlan: boolean | null;
  newListings: boolean;
  priceReduced: boolean;
  featured: boolean;
  premium: boolean;
}

const AdvancedSearch: React.FC = () => {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    location: '',
    radius: 5,
    priceType: 'both',
    minPrice: 0,
    maxPrice: 0,
    propertyTypes: [],
    minBedrooms: 0,
    maxBedrooms: 0,
    minBathrooms: 0,
    maxBathrooms: 0,
    minReceptions: 0,
    maxReceptions: 0,
    minSqft: 0,
    maxSqft: 0,
    tenure: [],
    councilTaxBands: [],
    epcRatings: [],
    minYearBuilt: 0,
    maxYearBuilt: 0,
    parking: null,
    garden: null,
    balcony: null,
    garage: null,
    furnished: [],
    petFriendly: null,
    smokingAllowed: null,
    availableFrom: '',
    features: [],
    virtualTour: null,
    floorPlan: null,
    newListings: false,
    priceReduced: false,
    featured: false,
    premium: false
  });

  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');
  const [sortBy, setSortBy] = useState('price-asc');
  const [showFilters, setShowFilters] = useState(true);
  const [expandedFilters, setExpandedFilters] = useState<string[]>(['basic']);
  const [savedSearches, setSavedSearches] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState({
    total: 0,
    pages: 0,
    currentPage: 1
  });

  // Mock property data
  useEffect(() => {
    const mockProperties: Property[] = [
      {
        id: '1',
        title: 'Modern 2-Bedroom Apartment',
        address: '123 High Street',
        postcode: 'SW1A 1AA',
        city: 'London',
        county: 'Greater London',
        price: 450000,
        priceType: 'sale',
        propertyType: 'flat',
        bedrooms: 2,
        bathrooms: 2,
        receptions: 1,
        sqft: 850,
        tenure: 'leasehold',
        councilTaxBand: 'D',
        epcRating: 'B',
        yearBuilt: 2018,
        parking: true,
        garden: false,
        balcony: true,
        garage: false,
        furnished: 'unfurnished',
        petFriendly: true,
        smokingAllowed: false,
        availableFrom: '2024-02-01',
        description: 'A stunning modern apartment in the heart of London with excellent transport links.',
        features: ['Central Heating', 'Double Glazing', 'Fitted Kitchen', 'En-suite', 'Balcony'],
        images: ['https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20apartment%20interior%20london%20living%20room&image_size=landscape_4_3'],
        virtualTour: true,
        floorPlan: true,
        agent: {
          name: 'Sarah Johnson',
          company: 'PropertyMasters UK',
          phone: '+44 20 7123 4567',
          email: 'sarah.johnson@propertymastersuk.com'
        },
        location: { lat: 51.5074, lng: -0.1278 },
        nearbyAmenities: { schools: 8, hospitals: 5, shops: 12, transport: 15 },
        priceHistory: [
          { date: '2024-01-15', price: 450000, event: 'Listed' },
          { date: '2024-01-10', price: 465000, event: 'Price Reduced' }
        ],
        viewingStats: { views: 245, enquiries: 18, viewings: 12 },
        listedDate: '2024-01-15',
        lastUpdated: '2024-01-20',
        status: 'available',
        featured: true,
        premium: false
      },
      {
        id: '2',
        title: 'Victorian Townhouse',
        address: '456 Queen Street',
        postcode: 'M1 1AA',
        city: 'Manchester',
        county: 'Greater Manchester',
        price: 2500,
        priceType: 'rent',
        propertyType: 'house',
        bedrooms: 4,
        bathrooms: 3,
        receptions: 2,
        sqft: 1850,
        tenure: 'freehold',
        councilTaxBand: 'F',
        epcRating: 'C',
        yearBuilt: 1890,
        parking: true,
        garden: true,
        balcony: false,
        garage: true,
        furnished: 'part-furnished',
        petFriendly: false,
        smokingAllowed: false,
        availableFrom: '2024-03-01',
        description: 'Beautiful Victorian townhouse with period features and modern amenities.',
        features: ['Period Features', 'Garden', 'Garage', 'Central Heating', 'Original Fireplaces'],
        images: ['https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=victorian%20townhouse%20exterior%20manchester%20brick&image_size=landscape_4_3'],
        virtualTour: false,
        floorPlan: true,
        agent: {
          name: 'Michael Brown',
          company: 'PropertyMasters UK',
          phone: '+44 161 123 4567',
          email: 'michael.brown@propertymastersuk.com'
        },
        location: { lat: 53.4808, lng: -2.2426 },
        nearbyAmenities: { schools: 6, hospitals: 3, shops: 8, transport: 10 },
        priceHistory: [
          { date: '2024-01-20', price: 2500, event: 'Listed' }
        ],
        viewingStats: { views: 156, enquiries: 12, viewings: 8 },
        listedDate: '2024-01-20',
        lastUpdated: '2024-01-22',
        status: 'available',
        featured: false,
        premium: true
      },
      {
        id: '3',
        title: 'Commercial Office Space',
        address: '789 Business Park',
        postcode: 'B1 1AA',
        city: 'Birmingham',
        county: 'West Midlands',
        price: 850000,
        priceType: 'sale',
        propertyType: 'commercial',
        bedrooms: 0,
        bathrooms: 4,
        receptions: 0,
        sqft: 5500,
        tenure: 'freehold',
        councilTaxBand: 'N/A',
        epcRating: 'A',
        yearBuilt: 2020,
        parking: true,
        garden: false,
        balcony: false,
        garage: false,
        furnished: 'unfurnished',
        petFriendly: false,
        smokingAllowed: false,
        availableFrom: '2024-02-15',
        description: 'Modern commercial office space in prime business location.',
        features: ['Air Conditioning', 'Lift Access', 'Parking', 'High Speed Internet', 'Security'],
        images: ['https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20office%20space%20commercial%20building%20interior&image_size=landscape_4_3'],
        virtualTour: true,
        floorPlan: true,
        agent: {
          name: 'David Wilson',
          company: 'PropertyMasters UK',
          phone: '+44 121 123 4567',
          email: 'david.wilson@propertymastersuk.com'
        },
        location: { lat: 52.4862, lng: -1.8904 },
        nearbyAmenities: { schools: 0, hospitals: 2, shops: 15, transport: 12 },
        priceHistory: [
          { date: '2024-01-18', price: 850000, event: 'Listed' }
        ],
        viewingStats: { views: 89, enquiries: 6, viewings: 4 },
        listedDate: '2024-01-18',
        lastUpdated: '2024-01-21',
        status: 'available',
        featured: false,
        premium: false
      }
    ];
    setProperties(mockProperties);
    setFilteredProperties(mockProperties);
    setSearchResults({
      total: mockProperties.length,
      pages: 1,
      currentPage: 1
    });
  }, []);

  const toggleFilterSection = (section: string) => {
    setExpandedFilters(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleArrayFilter = (key: keyof SearchFilters, value: string) => {
    setFilters(prev => {
      const currentArray = prev[key] as string[];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];
      return { ...prev, [key]: newArray };
    });
  };

  const handleSearch = () => {
    setIsSearching(true);
    
    // Simulate API call
    setTimeout(() => {
      let filtered = [...properties];
      
      // Apply filters
      if (filters.query) {
        filtered = filtered.filter(p => 
          p.title.toLowerCase().includes(filters.query.toLowerCase()) ||
          p.address.toLowerCase().includes(filters.query.toLowerCase()) ||
          p.description.toLowerCase().includes(filters.query.toLowerCase())
        );
      }
      
      if (filters.location) {
        filtered = filtered.filter(p => 
          p.city.toLowerCase().includes(filters.location.toLowerCase()) ||
          p.county.toLowerCase().includes(filters.location.toLowerCase()) ||
          p.postcode.toLowerCase().includes(filters.location.toLowerCase())
        );
      }
      
      if (filters.priceType !== 'both') {
        filtered = filtered.filter(p => p.priceType === filters.priceType);
      }
      
      if (filters.minPrice > 0) {
        filtered = filtered.filter(p => p.price >= filters.minPrice);
      }
      
      if (filters.maxPrice > 0) {
        filtered = filtered.filter(p => p.price <= filters.maxPrice);
      }
      
      if (filters.propertyTypes.length > 0) {
        filtered = filtered.filter(p => filters.propertyTypes.includes(p.propertyType));
      }
      
      if (filters.minBedrooms > 0) {
        filtered = filtered.filter(p => p.bedrooms >= filters.minBedrooms);
      }
      
      if (filters.maxBedrooms > 0) {
        filtered = filtered.filter(p => p.bedrooms <= filters.maxBedrooms);
      }
      
      if (filters.parking !== null) {
        filtered = filtered.filter(p => p.parking === filters.parking);
      }
      
      if (filters.garden !== null) {
        filtered = filtered.filter(p => p.garden === filters.garden);
      }
      
      if (filters.petFriendly !== null) {
        filtered = filtered.filter(p => p.petFriendly === filters.petFriendly);
      }
      
      if (filters.virtualTour !== null) {
        filtered = filtered.filter(p => p.virtualTour === filters.virtualTour);
      }
      
      if (filters.featured) {
        filtered = filtered.filter(p => p.featured);
      }
      
      if (filters.premium) {
        filtered = filtered.filter(p => p.premium);
      }
      
      // Apply sorting
      switch (sortBy) {
        case 'price-asc':
          filtered.sort((a, b) => a.price - b.price);
          break;
        case 'price-desc':
          filtered.sort((a, b) => b.price - a.price);
          break;
        case 'date-newest':
          filtered.sort((a, b) => new Date(b.listedDate).getTime() - new Date(a.listedDate).getTime());
          break;
        case 'date-oldest':
          filtered.sort((a, b) => new Date(a.listedDate).getTime() - new Date(b.listedDate).getTime());
          break;
        case 'bedrooms-desc':
          filtered.sort((a, b) => b.bedrooms - a.bedrooms);
          break;
        case 'sqft-desc':
          filtered.sort((a, b) => b.sqft - a.sqft);
          break;
      }
      
      setFilteredProperties(filtered);
      setSearchResults({
        total: filtered.length,
        pages: Math.ceil(filtered.length / 12),
        currentPage: 1
      });
      setIsSearching(false);
      showToast(`Found ${filtered.length} properties`, 'success');
    }, 1000);
  };

  const clearFilters = () => {
    setFilters({
      query: '',
      location: '',
      radius: 5,
      priceType: 'both',
      minPrice: 0,
      maxPrice: 0,
      propertyTypes: [],
      minBedrooms: 0,
      maxBedrooms: 0,
      minBathrooms: 0,
      maxBathrooms: 0,
      minReceptions: 0,
      maxReceptions: 0,
      minSqft: 0,
      maxSqft: 0,
      tenure: [],
      councilTaxBands: [],
      epcRatings: [],
      minYearBuilt: 0,
      maxYearBuilt: 0,
      parking: null,
      garden: null,
      balcony: null,
      garage: null,
      furnished: [],
      petFriendly: null,
      smokingAllowed: null,
      availableFrom: '',
      features: [],
      virtualTour: null,
      floorPlan: null,
      newListings: false,
      priceReduced: false,
      featured: false,
      premium: false
    });
    setFilteredProperties(properties);
    showToast('Filters cleared', 'info');
  };

  const saveSearch = () => {
    const searchName = prompt('Enter a name for this search:');
    if (searchName) {
      const newSearch = {
        id: Date.now().toString(),
        name: searchName,
        filters: { ...filters },
        createdAt: new Date().toISOString(),
        resultCount: filteredProperties.length
      };
      setSavedSearches(prev => [...prev, newSearch]);
      showToast('Search saved successfully', 'success');
    }
  };

  const formatPrice = (price: number, type: 'sale' | 'rent') => {
    const formatted = new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
    
    return type === 'rent' ? `${formatted} pcm` : formatted;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'text-green-600 bg-green-100';
      case 'under-offer': return 'text-orange-600 bg-orange-100';
      case 'sold': return 'text-red-600 bg-red-100';
      case 'let': return 'text-blue-600 bg-blue-100';
      case 'withdrawn': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const propertyTypes = ['house', 'flat', 'bungalow', 'commercial', 'land'];
  const tenureTypes = ['freehold', 'leasehold', 'shared-ownership'];
  const councilTaxBands = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const epcRatings = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
  const furnishedOptions = ['furnished', 'unfurnished', 'part-furnished'];
  const commonFeatures = [
    'Central Heating', 'Double Glazing', 'Fitted Kitchen', 'En-suite',
    'Balcony', 'Garden', 'Garage', 'Parking', 'Period Features',
    'Air Conditioning', 'Lift Access', 'Security', 'High Speed Internet'
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Advanced Property Search</h1>
        <p className="text-gray-600">Find your perfect property with our comprehensive search filters</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className={`lg:col-span-1 ${showFilters ? 'block' : 'hidden lg:block'}`}>
          <Card className="sticky top-4">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Search Filters</CardTitle>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    <X className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setShowFilters(false)} className="lg:hidden">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              {/* Basic Search */}
              <div>
                <button
                  onClick={() => toggleFilterSection('basic')}
                  className="flex justify-between items-center w-full text-left font-medium text-gray-900 mb-3"
                >
                  <span>Basic Search</span>
                  {expandedFilters.includes('basic') ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {expandedFilters.includes('basic') && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Search Keywords</label>
                      <Input
                        placeholder="Property title, description..."
                        value={filters.query}
                        onChange={(e) => updateFilter('query', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                      <Input
                        placeholder="City, postcode, area..."
                        value={filters.location}
                        onChange={(e) => updateFilter('location', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
                      <select
                        value={filters.priceType}
                        onChange={(e) => updateFilter('priceType', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="both">Sale &amp; Rent</option>
                        <option value="sale">For Sale</option>
                        <option value="rent">To Rent</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Price Range */}
              <div>
                <button
                  onClick={() => toggleFilterSection('price')}
                  className="flex justify-between items-center w-full text-left font-medium text-gray-900 mb-3"
                >
                  <span>Price Range</span>
                  {expandedFilters.includes('price') ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {expandedFilters.includes('price') && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Min Price</label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={filters.minPrice || ''}
                          onChange={(e) => updateFilter('minPrice', parseInt(e.target.value) || 0)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Max Price</label>
                        <Input
                          type="number"
                          placeholder="No max"
                          value={filters.maxPrice || ''}
                          onChange={(e) => updateFilter('maxPrice', parseInt(e.target.value) || 0)}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Property Details */}
              <div>
                <button
                  onClick={() => toggleFilterSection('details')}
                  className="flex justify-between items-center w-full text-left font-medium text-gray-900 mb-3"
                >
                  <span>Property Details</span>
                  {expandedFilters.includes('details') ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {expandedFilters.includes('details') && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Property Types</label>
                      <div className="space-y-2">
                        {propertyTypes.map(type => (
                          <label key={type} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={filters.propertyTypes.includes(type)}
                              onChange={() => toggleArrayFilter('propertyTypes', type)}
                              className="mr-2"
                            />
                            <span className="text-sm capitalize">{type}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Min Bedrooms</label>
                        <select
                          value={filters.minBedrooms}
                          onChange={(e) => updateFilter('minBedrooms', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value={0}>Any</option>
                          {[1, 2, 3, 4, 5, 6].map(num => (
                            <option key={num} value={num}>{num}+</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Max Bedrooms</label>
                        <select
                          value={filters.maxBedrooms}
                          onChange={(e) => updateFilter('maxBedrooms', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value={0}>Any</option>
                          {[1, 2, 3, 4, 5, 6].map(num => (
                            <option key={num} value={num}>{num}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Features */}
              <div>
                <button
                  onClick={() => toggleFilterSection('features')}
                  className="flex justify-between items-center w-full text-left font-medium text-gray-900 mb-3"
                >
                  <span>Features &amp; Amenities</span>
                  {expandedFilters.includes('features') ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {expandedFilters.includes('features') && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.parking === true}
                          onChange={(e) => updateFilter('parking', e.target.checked ? true : null)}
                          className="mr-2"
                        />
                        <Car className="w-4 h-4 mr-1" />
                        <span className="text-sm">Parking</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.garden === true}
                          onChange={(e) => updateFilter('garden', e.target.checked ? true : null)}
                          className="mr-2"
                        />
                        <Trees className="w-4 h-4 mr-1" />
                        <span className="text-sm">Garden</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.petFriendly === true}
                          onChange={(e) => updateFilter('petFriendly', e.target.checked ? true : null)}
                          className="mr-2"
                        />
                        <Heart className="w-4 h-4 mr-1" />
                        <span className="text-sm">Pet Friendly</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.virtualTour === true}
                          onChange={(e) => updateFilter('virtualTour', e.target.checked ? true : null)}
                          className="mr-2"
                        />
                        <Video className="w-4 h-4 mr-1" />
                        <span className="text-sm">Virtual Tour</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Special Filters */}
              <div>
                <button
                  onClick={() => toggleFilterSection('special')}
                  className="flex justify-between items-center w-full text-left font-medium text-gray-900 mb-3"
                >
                  <span>Special Filters</span>
                  {expandedFilters.includes('special') ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {expandedFilters.includes('special') && (
                  <div className="space-y-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.featured}
                        onChange={(e) => updateFilter('featured', e.target.checked)}
                        className="mr-2"
                      />
                      <Star className="w-4 h-4 mr-1" />
                      <span className="text-sm">Featured Properties</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.premium}
                        onChange={(e) => updateFilter('premium', e.target.checked)}
                        className="mr-2"
                      />
                      <Zap className="w-4 h-4 mr-1" />
                      <span className="text-sm">Premium Listings</span>
                    </label>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t">
                <Button onClick={handleSearch} className="w-full mb-3" disabled={isSearching}>
                  {isSearching ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4 mr-2" />
                  )}
                  {isSearching ? 'Searching...' : 'Search Properties'}
                </Button>
                <Button variant="outline" onClick={saveSearch} className="w-full">
                  <Bookmark className="w-4 h-4 mr-2" />
                  Save Search
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        <div className="lg:col-span-3">
          {/* Results Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => setShowFilters(true)}
                className="lg:hidden"
              >
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filters
              </Button>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {searchResults.total} Properties Found
                </h2>
                <p className="text-sm text-gray-600">
                  Page {searchResults.currentPage} of {searchResults.pages}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="date-newest">Newest First</option>
                <option value="date-oldest">Oldest First</option>
                <option value="bedrooms-desc">Most Bedrooms</option>
                <option value="sqft-desc">Largest First</option>
              </select>
              <div className="flex border border-gray-300 rounded-md">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`p-2 ${viewMode === 'map' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
                >
                  <Map className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Property Results */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProperties.map((property) => (
                <Card key={property.id} className="hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <img
                      src={property.images[0]}
                      alt={property.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    <div className="absolute top-3 left-3">
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        getStatusColor(property.status)
                      }`}>
                        {property.status}
                      </div>
                    </div>
                    <div className="absolute top-3 right-3 flex space-x-2">
                      {property.featured && (
                        <div className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                          Featured
                        </div>
                      )}
                      {property.premium && (
                        <div className="bg-purple-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                          Premium
                        </div>
                      )}
                    </div>
                    <div className="absolute bottom-3 right-3 flex space-x-2">
                      {property.virtualTour && (
                        <div className="bg-black bg-opacity-70 text-white p-2 rounded-full">
                          <Video className="w-4 h-4" />
                        </div>
                      )}
                      {property.floorPlan && (
                        <div className="bg-black bg-opacity-70 text-white p-2 rounded-full">
                          <FileText className="w-4 h-4" />
                        </div>
                      )}
                      <div className="bg-black bg-opacity-70 text-white px-2 py-1 rounded-full text-xs">
                        {property.images.length} photos
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="mb-2">
                      <h3 className="font-semibold text-lg text-gray-900 mb-1">{property.title}</h3>
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span>{property.address}, {property.city}</span>
                      </div>
                      <div className="text-2xl font-bold text-blue-600 mb-3">
                        {formatPrice(property.price, property.priceType)}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                      <div className="flex items-center space-x-4">
                        {property.bedrooms > 0 && (
                          <div className="flex items-center">
                            <Bed className="w-4 h-4 mr-1" />
                            <span>{property.bedrooms}</span>
                          </div>
                        )}
                        <div className="flex items-center">
                          <Bath className="w-4 h-4 mr-1" />
                          <span>{property.bathrooms}</span>
                        </div>
                        <div className="flex items-center">
                          <Square className="w-4 h-4 mr-1" />
                          <span>{property.sqft} sqft</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      {property.features.slice(0, 3).map((feature, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                        >
                          {feature}
                        </span>
                      ))}
                      {property.features.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                          +{property.features.length - 3} more
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      <span>Listed {new Date(property.listedDate).toLocaleDateString()}</span>
                      <div className="flex items-center space-x-3">
                        <span className="flex items-center">
                          <Eye className="w-3 h-3 mr-1" />
                          {property.viewingStats.views}
                        </span>
                        <span className="flex items-center">
                          <Heart className="w-3 h-3 mr-1" />
                          {property.viewingStats.enquiries}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button size="sm" className="flex-1">
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                      <Button variant="outline" size="sm">
                        <Phone className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Mail className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Heart className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {viewMode === 'list' && (
            <div className="space-y-6">
              {filteredProperties.map((property) => (
                <Card key={property.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                      <div className="lg:w-1/3">
                        <div className="relative">
                          <img
                            src={property.images[0]}
                            alt={property.title}
                            className="w-full h-48 object-cover rounded-lg"
                          />
                          <div className="absolute top-3 left-3">
                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                              getStatusColor(property.status)
                            }`}>
                              {property.status}
                            </div>
                          </div>
                          <div className="absolute bottom-3 right-3 bg-black bg-opacity-70 text-white px-2 py-1 rounded-full text-xs">
                            {property.images.length} photos
                          </div>
                        </div>
                      </div>
                      <div className="lg:w-2/3">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">{property.title}</h3>
                            <div className="flex items-center text-gray-600 mb-2">
                              <MapPin className="w-4 h-4 mr-1" />
                              <span>{property.address}, {property.city}, {property.postcode}</span>
                            </div>
                            <div className="text-2xl font-bold text-blue-600 mb-3">
                              {formatPrice(property.price, property.priceType)}
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            {property.featured && (
                              <div className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                                Featured
                              </div>
                            )}
                            {property.premium && (
                              <div className="bg-purple-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                                Premium
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          {property.bedrooms > 0 && (
                            <div className="flex items-center text-gray-600">
                              <Bed className="w-4 h-4 mr-2" />
                              <span>{property.bedrooms} bedrooms</span>
                            </div>
                          )}
                          <div className="flex items-center text-gray-600">
                            <Bath className="w-4 h-4 mr-2" />
                            <span>{property.bathrooms} bathrooms</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <Square className="w-4 h-4 mr-2" />
                            <span>{property.sqft} sqft</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <Building className="w-4 h-4 mr-2" />
                            <span className="capitalize">{property.propertyType}</span>
                          </div>
                        </div>
                        
                        <p className="text-gray-600 mb-4 line-clamp-2">{property.description}</p>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          {property.features.slice(0, 5).map((feature, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                            >
                              {feature}
                            </span>
                          ))}
                          {property.features.length > 5 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                              +{property.features.length - 5} more
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>Listed {new Date(property.listedDate).toLocaleDateString()}</span>
                            <span className="flex items-center">
                              <Eye className="w-4 h-4 mr-1" />
                              {property.viewingStats.views} views
                            </span>
                            <span className="flex items-center">
                              <Heart className="w-4 h-4 mr-1" />
                              {property.viewingStats.enquiries} enquiries
                            </span>
                          </div>
                          <div className="flex space-x-2">
                            <Button size="sm">
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </Button>
                            <Button variant="outline" size="sm">
                              <Phone className="w-4 h-4 mr-2" />
                              Call
                            </Button>
                            <Button variant="outline" size="sm">
                              <Mail className="w-4 h-4 mr-2" />
                              Email
                            </Button>
                            <Button variant="outline" size="sm">
                              <Heart className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {viewMode === 'map' && (
            <Card>
              <CardContent className="p-6">
                <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Map className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600">Interactive map view coming soon</p>
                    <p className="text-sm text-gray-500 mt-2">
                      This will show all {filteredProperties.length} properties on an interactive map
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* No Results */}
          {filteredProperties.length === 0 && !isSearching && (
            <Card>
              <CardContent className="p-12 text-center">
                <Search className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Properties Found</h3>
                <p className="text-gray-600 mb-6">
                  We couldn't find any properties matching your search criteria.
                  Try adjusting your filters or search terms.
                </p>
                <div className="flex justify-center space-x-3">
                  <Button onClick={clearFilters}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Clear Filters
                  </Button>
                  <Button variant="outline" onClick={() => setShowFilters(true)}>
                    <SlidersHorizontal className="w-4 h-4 mr-2" />
                    Adjust Filters
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pagination */}
          {searchResults.pages > 1 && (
            <div className="flex justify-center mt-8">
              <div className="flex space-x-2">
                <Button variant="outline" disabled={searchResults.currentPage === 1}>
                  Previous
                </Button>
                {Array.from({ length: Math.min(5, searchResults.pages) }, (_, i) => (
                  <Button
                    key={i + 1}
                    variant={searchResults.currentPage === i + 1 ? 'default' : 'outline'}
                  >
                    {i + 1}
                  </Button>
                ))}
                <Button variant="outline" disabled={searchResults.currentPage === searchResults.pages}>
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdvancedSearch;