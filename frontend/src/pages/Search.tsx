import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Home, Bed, Bath, Car, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Property, PropertySearchFilters, PropertyType, PropertyStatus, PriceType } from '../types';

interface SearchPageProps {
  className?: string;
}

const SearchPage: React.FC<SearchPageProps> = ({ className = '' }) => {
  const [filters, setFilters] = useState<PropertySearchFilters>({
    type: undefined,
    status: undefined,
    priceType: PriceType.SALE,
    minPrice: undefined,
    maxPrice: undefined,
    minBedrooms: undefined,
    maxBedrooms: undefined,
    minBathrooms: undefined,
    maxBathrooms: undefined,
    location: '',
    features: [],
    agentId: undefined
  });
  const [searchResults, setSearchResults] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Mock search results
  const mockProperties: Property[] = [
    {
      id: '1',
      title: 'Modern 3-Bedroom House in Manchester',
      description: 'Beautiful modern house with garden and parking',
      type: PropertyType.HOUSE,
      status: PropertyStatus.AVAILABLE,
      price: { amount: 350000, period: undefined },
      priceType: PriceType.SALE,
      bedrooms: 3,
      bathrooms: 2,
      area: 1200,
      address: {
        street: '123 Oak Street',
        city: 'London',
        county: 'Greater London',
        postcode: 'SW1A 1AA',
        country: 'UK'
      },
      location: 'Central London, Westminster',
      features: ['Garden', 'Parking', 'Modern Kitchen'],
      images: [{
        id: '1',
        url: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20three%20bedroom%20house%20exterior%20UK%20style%20brick%20garden%20parking&image_size=landscape_16_9',
        alt: 'Property exterior',
        isPrimary: true,
        order: 1
      }],
      agentId: 'agent1',
      landlordId: 'landlord1',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z'
    },
    {
      id: '2',
      title: 'City Centre Apartment',
      description: 'Luxury apartment in the heart of the city',
      type: PropertyType.APARTMENT,
      status: PropertyStatus.AVAILABLE,
      price: { amount: 1200, period: 'monthly' },
      priceType: PriceType.RENT_MONTHLY,
      bedrooms: 2,
      bathrooms: 1,
      area: 800,
      address: {
        street: '45 City Tower',
        city: 'Manchester',
        county: 'Greater Manchester',
        postcode: 'M2 2BB',
        country: 'UK'
      },
      location: 'City Centre, Manchester',
      features: ['Balcony', 'Gym Access', 'Concierge'],
      images: [{
        id: '2',
        url: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=luxury%20city%20apartment%20interior%20modern%20balcony%20view&image_size=landscape_16_9',
        alt: 'Apartment interior',
        isPrimary: true,
        order: 1
      }],
      agentId: 'agent2',
      landlordId: 'landlord2',
      createdAt: '2024-01-14T15:30:00Z',
      updatedAt: '2024-01-14T15:30:00Z'
    }
  ];

  useEffect(() => {
    // Simulate search on component mount
    setSearchResults(mockProperties);
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      const filtered = mockProperties.filter(property => {
        const matchesQuery = !searchQuery || 
          property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          property.address.city.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesLocation = !filters.location || 
          property.address.city.toLowerCase().includes(filters.location.toLowerCase());
        
        const matchesType = !filters.type || property.type === filters.type;
        const matchesStatus = !filters.status || property.status === filters.status;
        const matchesPriceType = !filters.priceType || property.priceType === filters.priceType;
        
        const matchesMinPrice = !filters.minPrice || property.price.amount >= filters.minPrice;
        const matchesMaxPrice = !filters.maxPrice || property.price.amount <= filters.maxPrice;
        
        const matchesMinBedrooms = !filters.minBedrooms || property.bedrooms >= filters.minBedrooms;
        const matchesMaxBedrooms = !filters.maxBedrooms || property.bedrooms <= filters.maxBedrooms;
        
        return matchesQuery && matchesLocation && matchesType && matchesStatus && 
               matchesPriceType && matchesMinPrice && matchesMaxPrice && 
               matchesMinBedrooms && matchesMaxBedrooms;
      });
      
      setSearchResults(filtered);
      setLoading(false);
    }, 1000);
  };

  const formatPrice = (price: { amount: number; period?: string }, priceType: PriceType) => {
    const formatter = new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0
    });
    
    const formattedPrice = formatter.format(price.amount);
    
    if (price.period) {
      return `${formattedPrice}/${price.period}`;
    }
    
    switch (priceType) {
      case PriceType.RENT_MONTHLY:
        return `${formattedPrice}/month`;
      case PriceType.RENT_WEEKLY:
        return `${formattedPrice}/week`;
      default:
        return formattedPrice;
    }
  };

  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${className}`}>
      {/* Search Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Property Search</h1>
        <p className="text-gray-600">Find your perfect property with our advanced search filters</p>
      </div>

      {/* Search Bar */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Search by location, property type, or keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Filters
              </Button>
              <Button onClick={handleSearch} disabled={loading}>
                {loading ? 'Searching...' : 'Search'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Filters */}
      {showFilters && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Advanced Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Property Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Type
                </label>
                <select
                  value={filters.type || ''}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value as PropertyType || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Any Type</option>
                  <option value={PropertyType.HOUSE}>House</option>
                  <option value={PropertyType.APARTMENT}>Apartment</option>
                  <option value={PropertyType.FLAT}>Flat</option>
                  <option value={PropertyType.BUNGALOW}>Bungalow</option>
                  <option value={PropertyType.COMMERCIAL}>Commercial</option>
                </select>
              </div>

              {/* Price Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Type
                </label>
                <select
                  value={filters.priceType || PriceType.SALE}
                  onChange={(e) => setFilters({ ...filters, priceType: e.target.value as PriceType })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={PriceType.SALE}>For Sale</option>
                  <option value={PriceType.RENT_MONTHLY}>Monthly Rent</option>
                  <option value={PriceType.RENT_WEEKLY}>Weekly Rent</option>
                </select>
              </div>

              {/* Min Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Min Price (£)
                </label>
                <Input
                  type="number"
                  placeholder="0"
                  value={filters.minPrice || ''}
                  onChange={(e) => setFilters({ ...filters, minPrice: e.target.value ? Number(e.target.value) : undefined })}
                />
              </div>

              {/* Max Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Price (£)
                </label>
                <Input
                  type="number"
                  placeholder="No limit"
                  value={filters.maxPrice || ''}
                  onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value ? Number(e.target.value) : undefined })}
                />
              </div>

              {/* Bedrooms */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Min Bedrooms
                </label>
                <select
                  value={filters.minBedrooms || ''}
                  onChange={(e) => setFilters({ ...filters, minBedrooms: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Any</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                  <option value="4">4+</option>
                  <option value="5">5+</option>
                </select>
              </div>

              {/* Bathrooms */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Min Bathrooms
                </label>
                <select
                  value={filters.minBathrooms || ''}
                  onChange={(e) => setFilters({ ...filters, minBathrooms: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Any</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                  <option value="4">4+</option>
                </select>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <Input
                  type="text"
                  placeholder="Enter location"
                  value={filters.location || ''}
                  onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setFilters({
                    type: undefined,
                    status: undefined,
                    priceType: PriceType.SALE,
                    minPrice: undefined,
                    maxPrice: undefined,
                    minBedrooms: undefined,
                    maxBedrooms: undefined,
                    minBathrooms: undefined,
                    maxBathrooms: undefined,
                    location: '',
                    features: [],
                    agentId: undefined
                  });
                }}
                className="mr-3"
              >
                Clear Filters
              </Button>
              <Button onClick={handleSearch} disabled={loading}>
                Apply Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Results */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {loading ? 'Searching...' : `${searchResults.length} Properties Found`}
          </h2>
          <div className="text-sm text-gray-600">
            {searchQuery && `Results for "${searchQuery}"`}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-lg font-medium text-gray-700">Searching Properties...</p>
            </div>
          </div>
        ) : searchResults.length === 0 ? (
          <div className="text-center py-12">
            <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search criteria or expanding your search area.</p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setFilters({
                  type: undefined,
                  status: undefined,
                  priceType: PriceType.SALE,
                  minPrice: undefined,
                  maxPrice: undefined,
                  minBedrooms: undefined,
                  maxBedrooms: undefined,
                  minBathrooms: undefined,
                  maxBathrooms: undefined,
                  location: '',
                  features: [],
                  agentId: undefined
                });
                setSearchResults(mockProperties);
              }}
            >
              Clear all filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchResults.map((property) => (
              <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img
                    src={property.images[0]?.url}
                    alt={property.images[0]?.alt || property.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      property.status === PropertyStatus.AVAILABLE
                        ? 'bg-green-100 text-green-800'
                        : property.status === PropertyStatus.UNDER_OFFER
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {property.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {property.title}
                    </h3>
                    <p className="text-2xl font-bold text-blue-600">
                      {formatPrice(property.price, property.priceType)}
                    </p>
                  </div>
                  
                  <div className="flex items-center text-gray-600 mb-3">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="text-sm">
                      {property.address.street}, {property.address.city}, {property.address.postcode}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center">
                      <Bed className="h-4 w-4 mr-1" />
                      <span>{property.bedrooms} bed{property.bedrooms !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center">
                      <Bath className="h-4 w-4 mr-1" />
                      <span>{property.bathrooms} bath{property.bathrooms !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center">
                      <Home className="h-4 w-4 mr-1" />
                      <span>{property.area} sq ft</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {property.description}
                  </p>
                  
                  {property.features && property.features.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {property.features.slice(0, 3).map((feature, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                          >
                            {feature}
                          </span>
                        ))}
                        {property.features.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            +{property.features.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex space-x-2">
                    <Button
                      className="flex-1"
                      onClick={() => window.location.href = `/properties/${property.id}`}
                    >
                      View Details
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => window.location.href = `/properties/${property.id}/booking`}
                    >
                      <Calendar className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;