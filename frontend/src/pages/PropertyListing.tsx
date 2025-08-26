import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import {
  Search,
  MapPin,
  Filter,
  Grid,
  List,
  Map,
  Heart,
  Share2,
  Eye,
  Calculator,
  Bed,
  Bath,
  Square,
  Star,
  ChevronDown,
  SlidersHorizontal,
  ArrowUpDown,
  Bookmark,
  Phone,
  Mail,
  Calendar,
  TrendingUp,
  Home,
  Building2,
  Car,
  Wifi,
  Shield,
  CheckCircle
} from 'lucide-react';

interface Property {
  id: number;
  title: string;
  location: string;
  postcode: string;
  price: number;
  type: 'sale' | 'rent';
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  epcRating: string;
  tenure: string;
  yearBuilt: number;
  councilTax: string;
  image: string;
  images: string[];
  features: string[];
  description: string;
  agent: {
    name: string;
    company: string;
    phone: string;
    email: string;
    image: string;
  };
  pricePerSqft: number;
  daysOnMarket: number;
  viewingCount: number;
  saved: boolean;
}

const PropertyListing: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('price-asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [savedSearches, setSavedSearches] = useState<string[]>([]);
  
  // Filter states
  const [filters, setFilters] = useState({
    location: searchParams.get('location') || '',
    query: searchParams.get('query') || '',
    propertyType: searchParams.get('type') || '',
    priceMin: '',
    priceMax: '',
    bedrooms: '',
    bathrooms: '',
    tenure: '',
    epcRating: '',
    features: [] as string[]
  });

  const propertiesPerPage = 12;

  // Mock property data
  const mockProperties: Property[] = [
    {
      id: 1,
      title: 'Modern 2-Bed Apartment with River Views',
      location: 'Canary Wharf, London',
      postcode: 'E14 5AB',
      price: 650000,
      type: 'sale',
      bedrooms: 2,
      bathrooms: 2,
      sqft: 950,
      epcRating: 'B',
      tenure: 'Leasehold',
      yearBuilt: 2019,
      councilTax: 'Band E',
      image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20luxury%20apartment%20living%20room%20london%20canary%20wharf%20floor%20to%20ceiling%20windows%20river%20views&image_size=landscape_4_3',
      images: [],
      features: ['Balcony', 'Concierge', 'Gym', 'River Views', 'Parking'],
      description: 'Stunning modern apartment with panoramic river views in the heart of Canary Wharf.',
      agent: {
        name: 'Sarah Johnson',
        company: 'Prime London Properties',
        phone: '+44 20 7123 4567',
        email: 'sarah@primelondon.co.uk',
        image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20female%20estate%20agent%20headshot%20business%20attire&image_size=square'
      },
      pricePerSqft: 684,
      daysOnMarket: 15,
      viewingCount: 23,
      saved: false
    },
    {
      id: 2,
      title: 'Victorian Terrace House',
      location: 'Clapham, London',
      postcode: 'SW4 7AA',
      price: 2200,
      type: 'rent',
      bedrooms: 3,
      bathrooms: 2,
      sqft: 1200,
      epcRating: 'C',
      tenure: 'Freehold',
      yearBuilt: 1890,
      councilTax: 'Band F',
      image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=victorian%20terrace%20house%20london%20clapham%20traditional%20british%20architecture%20period%20features&image_size=landscape_4_3',
      images: [],
      features: ['Garden', 'Period Features', 'Off-street Parking', 'Near Transport'],
      description: 'Beautiful Victorian terrace house with original period features and modern amenities.',
      agent: {
        name: 'David Chen',
        company: 'Heritage Homes London',
        phone: '+44 20 7234 5678',
        email: 'david@heritagehomes.co.uk',
        image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20male%20estate%20agent%20headshot%20business%20suit&image_size=square'
      },
      pricePerSqft: 22,
      daysOnMarket: 8,
      viewingCount: 31,
      saved: true
    },
    {
      id: 3,
      title: 'Luxury Penthouse with Roof Terrace',
      location: 'Kensington, London',
      postcode: 'SW7 2AZ',
      price: 1250000,
      type: 'sale',
      bedrooms: 3,
      bathrooms: 3,
      sqft: 1800,
      epcRating: 'A',
      tenure: 'Freehold',
      yearBuilt: 2020,
      councilTax: 'Band H',
      image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=luxury%20penthouse%20apartment%20kensington%20london%20high%20end%20interior%20design%20marble%20finishes&image_size=landscape_4_3',
      images: [],
      features: ['Roof Terrace', 'Smart Home', 'Parking', 'Porter', 'Gym'],
      description: 'Exceptional penthouse apartment with private roof terrace and luxury finishes throughout.',
      agent: {
        name: 'Emma Thompson',
        company: 'Kensington Elite Properties',
        phone: '+44 20 7345 6789',
        email: 'emma@kensingtonelite.co.uk',
        image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20female%20estate%20agent%20headshot%20elegant%20business%20attire&image_size=square'
      },
      pricePerSqft: 694,
      daysOnMarket: 22,
      viewingCount: 18,
      saved: false
    }
  ];

  useEffect(() => {
    setProperties(mockProperties);
    setFilteredProperties(mockProperties);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, properties, sortBy]);

  const applyFilters = () => {
    let filtered = [...properties];

    // Apply location filter
    if (filters.location) {
      filtered = filtered.filter(property => 
        property.location.toLowerCase().includes(filters.location.toLowerCase()) ||
        property.postcode.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    // Apply query filter
    if (filters.query) {
      filtered = filtered.filter(property => 
        property.title.toLowerCase().includes(filters.query.toLowerCase()) ||
        property.description.toLowerCase().includes(filters.query.toLowerCase())
      );
    }

    // Apply property type filter
    if (filters.propertyType) {
      filtered = filtered.filter(property => property.type === filters.propertyType);
    }

    // Apply price filters
    if (filters.priceMin) {
      filtered = filtered.filter(property => property.price >= parseInt(filters.priceMin));
    }
    if (filters.priceMax) {
      filtered = filtered.filter(property => property.price <= parseInt(filters.priceMax));
    }

    // Apply bedroom filter
    if (filters.bedrooms) {
      filtered = filtered.filter(property => property.bedrooms >= parseInt(filters.bedrooms));
    }

    // Apply bathroom filter
    if (filters.bathrooms) {
      filtered = filtered.filter(property => property.bathrooms >= parseInt(filters.bathrooms));
    }

    // Apply tenure filter
    if (filters.tenure) {
      filtered = filtered.filter(property => property.tenure === filters.tenure);
    }

    // Apply EPC rating filter
    if (filters.epcRating) {
      filtered = filtered.filter(property => property.epcRating === filters.epcRating);
    }

    // Apply features filter
    if (filters.features.length > 0) {
      filtered = filtered.filter(property => 
        filters.features.every(feature => property.features.includes(feature))
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'newest':
          return b.yearBuilt - a.yearBuilt;
        case 'oldest':
          return a.yearBuilt - b.yearBuilt;
        case 'size-asc':
          return a.sqft - b.sqft;
        case 'size-desc':
          return b.sqft - a.sqft;
        default:
          return 0;
      }
    });

    setFilteredProperties(filtered);
    setCurrentPage(1);
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleFeature = (feature: string) => {
    setFilters(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const saveSearch = () => {
    const searchQuery = `${filters.location} ${filters.query}`.trim();
    if (searchQuery && !savedSearches.includes(searchQuery)) {
      setSavedSearches(prev => [...prev, searchQuery]);
    }
  };

  const toggleSaveProperty = (propertyId: number) => {
    setProperties(prev => prev.map(property => 
      property.id === propertyId 
        ? { ...property, saved: !property.saved }
        : property
    ));
  };

  const paginatedProperties = filteredProperties.slice(
    (currentPage - 1) * propertiesPerPage,
    currentPage * propertiesPerPage
  );

  const totalPages = Math.ceil(filteredProperties.length / propertiesPerPage);

  const availableFeatures = ['Balcony', 'Garden', 'Parking', 'Gym', 'Concierge', 'River Views', 'Period Features', 'Smart Home', 'Roof Terrace'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Property Search</h1>
              <p className="text-gray-600">
                {filteredProperties.length} properties found
                {filters.location && ` in ${filters.location}`}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={saveSearch}>
                <Bookmark className="h-4 w-4 mr-2" />
                Save Search
              </Button>
              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'map' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('map')}
                >
                  <Map className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Filters Sidebar */}
          <div className={`${showFilters ? 'block' : 'hidden'} lg:block w-80 flex-shrink-0`}>
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                <Button variant="outline" size="sm" onClick={() => setFilters({
                  location: '',
                  query: '',
                  propertyType: '',
                  priceMin: '',
                  priceMax: '',
                  bedrooms: '',
                  bathrooms: '',
                  tenure: '',
                  epcRating: '',
                  features: []
                })}>
                  Clear All
                </Button>
              </div>

              <div className="space-y-6">
                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <Input
                    placeholder="Postcode, area, or station"
                    value={filters.location}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                    leftIcon={<MapPin className="h-4 w-4" />}
                  />
                </div>

                {/* Keywords */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Keywords
                  </label>
                  <Input
                    placeholder="Property type, features..."
                    value={filters.query}
                    onChange={(e) => handleFilterChange('query', e.target.value)}
                    leftIcon={<Search className="h-4 w-4" />}
                  />
                </div>

                {/* Property Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property Type
                  </label>
                  <select
                    value={filters.propertyType}
                    onChange={(e) => handleFilterChange('propertyType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Types</option>
                    <option value="sale">For Sale</option>
                    <option value="rent">For Rent</option>
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price Range
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Min price"
                      type="number"
                      value={filters.priceMin}
                      onChange={(e) => handleFilterChange('priceMin', e.target.value)}
                    />
                    <Input
                      placeholder="Max price"
                      type="number"
                      value={filters.priceMax}
                      onChange={(e) => handleFilterChange('priceMax', e.target.value)}
                    />
                  </div>
                </div>

                {/* Bedrooms & Bathrooms */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Min Bedrooms
                    </label>
                    <select
                      value={filters.bedrooms}
                      onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Any</option>
                      <option value="1">1+</option>
                      <option value="2">2+</option>
                      <option value="3">3+</option>
                      <option value="4">4+</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Min Bathrooms
                    </label>
                    <select
                      value={filters.bathrooms}
                      onChange={(e) => handleFilterChange('bathrooms', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Any</option>
                      <option value="1">1+</option>
                      <option value="2">2+</option>
                      <option value="3">3+</option>
                    </select>
                  </div>
                </div>

                {/* Tenure */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tenure
                  </label>
                  <select
                    value={filters.tenure}
                    onChange={(e) => handleFilterChange('tenure', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Tenures</option>
                    <option value="Freehold">Freehold</option>
                    <option value="Leasehold">Leasehold</option>
                  </select>
                </div>

                {/* EPC Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    EPC Rating
                  </label>
                  <select
                    value={filters.epcRating}
                    onChange={(e) => handleFilterChange('epcRating', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Ratings</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                  </select>
                </div>

                {/* Features */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Features
                  </label>
                  <div className="space-y-2">
                    {availableFeatures.map(feature => (
                      <label key={feature} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.features.includes(feature)}
                          onChange={() => toggleFeature(feature)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{feature}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Sort and Filter Toggle */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden"
                >
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Filters
                </Button>
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <ArrowUpDown className="h-4 w-4 text-gray-500" />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="price-asc">Price: Low to High</option>
                      <option value="price-desc">Price: High to Low</option>
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="size-desc">Largest First</option>
                      <option value="size-asc">Smallest First</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Properties Grid/List */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedProperties.map(property => (
                  <PropertyCard key={property.id} property={property} onToggleSave={toggleSaveProperty} />
                ))}
              </div>
            )}

            {viewMode === 'list' && (
              <div className="space-y-4">
                {paginatedProperties.map(property => (
                  <PropertyListItem key={property.id} property={property} onToggleSave={toggleSaveProperty} />
                ))}
              </div>
            )}

            {viewMode === 'map' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Map className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Interactive map view coming soon</p>
                    <p className="text-sm text-gray-500">Will integrate with Ordnance Survey APIs</p>
                  </div>
                </div>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    Previous
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <Button
                      key={page}
                      variant={currentPage === page ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Property Card Component
const PropertyCard: React.FC<{ property: Property; onToggleSave: (id: number) => void }> = ({ property, onToggleSave }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <div className="relative">
        <img
          src={property.image}
          alt={property.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-3 left-3">
          <span className={`px-2 py-1 rounded text-xs font-medium text-white ${
            property.type === 'sale' ? 'bg-green-600' : 'bg-blue-600'
          }`}>
            For {property.type === 'sale' ? 'Sale' : 'Rent'}
          </span>
        </div>
        <div className="absolute top-3 right-3 flex space-x-2">
          <button
            onClick={() => onToggleSave(property.id)}
            className="bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors"
          >
            <Heart className={`h-4 w-4 ${property.saved ? 'text-red-500 fill-current' : 'text-gray-600'}`} />
          </button>
          <button className="bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors">
            <Share2 className="h-4 w-4 text-gray-600" />
          </button>
        </div>
        <div className="absolute bottom-3 left-3">
          <span className={`px-2 py-1 rounded text-xs font-medium text-white ${
            property.epcRating === 'A' ? 'bg-green-600' :
            property.epcRating === 'B' ? 'bg-green-500' :
            property.epcRating === 'C' ? 'bg-yellow-500' : 'bg-orange-500'
          }`}>
            EPC {property.epcRating}
          </span>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xl font-bold text-gray-900">
            £{property.price.toLocaleString()}
            {property.type === 'rent' && <span className="text-sm text-gray-600">/month</span>}
          </span>
          <span className="text-sm text-gray-500">
            £{property.pricePerSqft}/sqft
          </span>
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          {property.title}
        </h3>
        
        <p className="text-gray-600 mb-3 flex items-center text-sm">
          <MapPin className="h-4 w-4 mr-1" />
          {property.location}
        </p>
        
        <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
          <span className="flex items-center">
            <Bed className="h-4 w-4 mr-1" />
            {property.bedrooms} beds
          </span>
          <span className="flex items-center">
            <Bath className="h-4 w-4 mr-1" />
            {property.bathrooms} baths
          </span>
          <span className="flex items-center">
            <Square className="h-4 w-4 mr-1" />
            {property.sqft} sqft
          </span>
        </div>
        
        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          <span>{property.daysOnMarket} days on market</span>
          <span>{property.viewingCount} viewings</span>
        </div>
        
        <div className="flex space-x-2">
          <Link to={`/property/${property.id}`} className="flex-1">
            <Button className="w-full" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Button>
          </Link>
          <Button variant="outline" size="sm">
            <Calculator className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

// Property List Item Component
const PropertyListItem: React.FC<{ property: Property; onToggleSave: (id: number) => void }> = ({ property, onToggleSave }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6">
      <div className="flex gap-6">
        <div className="relative flex-shrink-0">
          <img
            src={property.image}
            alt={property.title}
            className="w-64 h-40 object-cover rounded-lg"
          />
          <div className="absolute top-2 left-2">
            <span className={`px-2 py-1 rounded text-xs font-medium text-white ${
              property.type === 'sale' ? 'bg-green-600' : 'bg-blue-600'
            }`}>
              For {property.type === 'sale' ? 'Sale' : 'Rent'}
            </span>
          </div>
          <div className="absolute bottom-2 left-2">
            <span className={`px-2 py-1 rounded text-xs font-medium text-white ${
              property.epcRating === 'A' ? 'bg-green-600' :
              property.epcRating === 'B' ? 'bg-green-500' :
              property.epcRating === 'C' ? 'bg-yellow-500' : 'bg-orange-500'
            }`}>
              EPC {property.epcRating}
            </span>
          </div>
        </div>
        
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-1">
                {property.title}
              </h3>
              <p className="text-gray-600 flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                {property.location} • {property.postcode}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onToggleSave(property.id)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <Heart className={`h-5 w-5 ${property.saved ? 'text-red-500 fill-current' : 'text-gray-400'}`} />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <Share2 className="h-5 w-5 text-gray-400" />
              </button>
            </div>
          </div>
          
          <div className="flex items-center space-x-6 mb-3">
            <span className="text-2xl font-bold text-gray-900">
              £{property.price.toLocaleString()}
              {property.type === 'rent' && <span className="text-base text-gray-600">/month</span>}
            </span>
            <span className="text-gray-500">
              £{property.pricePerSqft}/sqft
            </span>
          </div>
          
          <div className="flex items-center space-x-6 mb-3 text-gray-600">
            <span className="flex items-center">
              <Bed className="h-4 w-4 mr-1" />
              {property.bedrooms} bedrooms
            </span>
            <span className="flex items-center">
              <Bath className="h-4 w-4 mr-1" />
              {property.bathrooms} bathrooms
            </span>
            <span className="flex items-center">
              <Square className="h-4 w-4 mr-1" />
              {property.sqft} sqft
            </span>
            <span>{property.tenure}</span>
          </div>
          
          <p className="text-gray-700 mb-4 line-clamp-2">
            {property.description}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>{property.daysOnMarket} days on market</span>
              <span>{property.viewingCount} viewings</span>
              <span>Built {property.yearBuilt}</span>
            </div>
            
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Phone className="h-4 w-4 mr-2" />
                Call Agent
              </Button>
              <Button variant="outline" size="sm">
                <Calendar className="h-4 w-4 mr-2" />
                Book Viewing
              </Button>
              <Link to={`/property/${property.id}`}>
                <Button size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyListing;