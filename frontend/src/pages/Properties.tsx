import * as React from 'react';
import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  Filter,
  MapPin,
  Bed,
  Bath,
  Square,
  Heart,
  Share2,
  Grid,
  List,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { showToast } from '../components/ui/Toast';
import { usePropertyStore } from '../stores/propertyStore';
import { usePagination, useDebounce } from '../hooks';
import { formatCurrency } from '../utils';

// Utility function for combining class names
const cn = (...classes: (string | undefined | null | false)[]) => {
  return classes.filter(Boolean).join(' ');
};
import type { PropertySearchFilters, PropertyType, PropertyStatus } from '../types';

const Properties: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    properties,
    searchResults,
    searchFilters,
    isLoading,
    error,
    searchProperties,
    setSearchFilters
  } = usePropertyStore();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [localFilters, setLocalFilters] = useState<PropertySearchFilters>({
    location: searchParams.get('location') || '',
    type: (searchParams.get('type') as PropertyType) || undefined,
    minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
    minBedrooms: searchParams.get('minBedrooms') ? Number(searchParams.get('minBedrooms')) : undefined,
    minBathrooms: searchParams.get('minBathrooms') ? Number(searchParams.get('minBathrooms')) : undefined,
    status: (searchParams.get('status') as PropertyStatus) || undefined
  });

  const debouncedFilters = useDebounce(localFilters, 500);

  const {
    currentPage,
    totalPages,
    goToPage,
    goToNext: nextPage,
    goToPrevious: prevPage,
    hasNext: canGoNext,
    hasPrevious: canGoPrev
  } = usePagination(searchResults?.total || 0, 12);

  // Mock properties data
  const mockProperties = [
    {
      id: '1',
      title: 'Modern 2-Bed Apartment in Canary Wharf',
      description: 'Stunning modern apartment with panoramic views of London skyline',
      price: { amount: 650000, period: undefined },
      type: 'APARTMENT' as PropertyType,
      status: 'AVAILABLE' as PropertyStatus,
      priceType: 'SALE' as any,
      bedrooms: 2,
      bathrooms: 2,
      area: 850,
      size: '850 sq ft',
      location: 'Canary Wharf, London',
      address: {
        street: '25 Marsh Wall',
        city: 'London',
        county: 'Greater London',
        postcode: 'E14 9FW',
        country: 'UK'
      },
      images: [{
        id: '1',
        url: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20luxury%20apartment%20interior%20with%20floor%20to%20ceiling%20windows%20overlooking%20london%20skyline%2C%20contemporary%20furniture%2C%20bright%20natural%20lighting&image_size=landscape_4_3',
        alt: 'Modern apartment interior',
        isPrimary: true,
        order: 1
      }],
      agentId: '1',
      agent: {
        id: '1',
        userId: 'user1',
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@example.com',
        phone: '+44 20 7123 4567',
        companyName: 'Prime Properties London',
        licenseNumber: 'LIC001',
        address: {
          street: '123 Business St',
          city: 'London',
          county: 'Greater London',
          postcode: 'SW1A 1AA',
          country: 'UK'
        },
        specializations: ['Luxury Properties'],
        rating: 4.8,
        reviewCount: 125,
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      },
      features: ['Balcony', 'Gym', 'Concierge', 'Parking'],
      createdAt: '2024-01-15T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z'
    },
    {
      id: '2',
      title: 'Victorian Townhouse in Kensington',
      description: 'Beautiful period property with original features and modern amenities',
      price: { amount: 2500, period: 'month' },
      type: 'HOUSE' as PropertyType,
      status: 'AVAILABLE' as PropertyStatus,
      priceType: 'RENT_MONTHLY' as any,
      bedrooms: 4,
      bathrooms: 3,
      area: 1200,
      size: '1200 sq ft',
      location: 'Kensington, London',
      address: {
        street: '42 Kensington Gardens Square',
        city: 'London',
        county: 'Greater London',
        postcode: 'W2 4BH',
        country: 'UK'
      },
      images: [{
        id: '2',
        url: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=elegant%20victorian%20townhouse%20exterior%20with%20white%20facade%2C%20black%20railings%2C%20traditional%20london%20architecture%2C%20tree%20lined%20street&image_size=landscape_4_3',
        alt: 'Victorian townhouse exterior',
        isPrimary: true,
        order: 1
      }],
      agentId: '2',
      agent: {
        id: '2',
        userId: 'user2',
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@example.com',
        phone: '+44 20 7987 6543',
        companyName: 'Kensington Estates',
        licenseNumber: 'LIC002',
        address: {
          street: '456 Estate Ave',
          city: 'London',
          county: 'Greater London',
          postcode: 'SW7 2AZ',
          country: 'UK'
        },
        specializations: ['Period Properties'],
        rating: 4.6,
        reviewCount: 89,
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      },
      features: ['Garden', 'Fireplace', 'Period Features', 'Parking'],
      createdAt: '2024-01-10T00:00:00Z',
      updatedAt: '2024-01-10T00:00:00Z'
    },
    {
      id: '3',
      title: 'Contemporary Studio in Shoreditch',
      description: 'Stylish studio apartment in the heart of trendy Shoreditch',
      price: { amount: 1800, period: 'month' },
      type: 'FLAT' as PropertyType,
      status: 'AVAILABLE' as PropertyStatus,
      priceType: 'RENT_MONTHLY' as any,
      bedrooms: 1,
      bathrooms: 1,
      area: 450,
      size: '450 sq ft',
      location: 'Shoreditch, London',
      address: {
        street: '15 Brick Lane',
        city: 'London',
        county: 'Greater London',
        postcode: 'E1 6PU',
        country: 'UK'
      },
      images: [{
        id: '3',
        url: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=stylish%20studio%20apartment%20with%20exposed%20brick%20walls%2C%20industrial%20design%2C%20modern%20kitchen%2C%20urban%20loft%20style&image_size=landscape_4_3',
        alt: 'Contemporary studio interior',
        isPrimary: true,
        order: 1
      }],
      agentId: '3',
      agent: {
        id: '3',
        userId: 'user3',
        firstName: 'Mike',
        lastName: 'Chen',
        email: 'mike.chen@example.com',
        phone: '+44 20 7456 7890',
        companyName: 'Urban Living Properties',
        licenseNumber: 'LIC003',
        address: {
          street: '789 Urban St',
          city: 'London',
          county: 'Greater London',
          postcode: 'E1 6AA',
          country: 'UK'
        },
        specializations: ['Urban Properties'],
        rating: 4.7,
        reviewCount: 156,
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      },
      features: ['Exposed Brick', 'High Ceilings', 'Modern Kitchen', 'Near Transport'],
      createdAt: '2024-01-12T00:00:00Z',
      updatedAt: '2024-01-12T00:00:00Z'
    }
  ];

  useEffect(() => {
    // Update search filters when debounced filters change
    setSearchFilters(debouncedFilters);
    
    // Update URL params
    const params = new URLSearchParams();
    Object.entries(debouncedFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.set(key, String(value));
      }
    });
    setSearchParams(params);

    // Trigger search
    searchProperties(debouncedFilters);
  }, [debouncedFilters, currentPage]);

  const handleFilterChange = (key: keyof PropertySearchFilters, value: any) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setLocalFilters({
      location: '',
      type: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      minBedrooms: undefined,
      minBathrooms: undefined,
      status: undefined
    });
  };

  const handleSaveProperty = (propertyId: string) => {
    showToast.success('Property saved to your favorites');
  };

  const handleShareProperty = (propertyId: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/properties/${propertyId}`);
    showToast.success('Property link copied to clipboard');
  };

  const displayProperties = searchResults?.data || mockProperties;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1">
              <Input
                placeholder="Search by location, property type, or keyword..."
                value={localFilters.location || ''}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                leftIcon={<Search />}
                className="h-12"
              />
            </div>
            
            {/* Quick Filters */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowFilters(true)}
                className="h-12"
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
              </Button>
              
              <div className="flex border border-gray-300 rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Active Filters */}
          <div className="mt-4 flex flex-wrap gap-2">
            {Object.entries(localFilters).map(([key, value]) => {
              if (!value) return null;
              return (
                <span
                  key={key}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                >
                  {key}: {String(value)}
                  <button
                    onClick={() => handleFilterChange(key as keyof PropertySearchFilters, undefined)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              );
            })}
            {Object.values(localFilters).some(v => v) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-gray-500 hover:text-gray-700"
              >
                Clear all
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Results Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Properties {localFilters.location && `in ${localFilters.location}`}
            </h1>
            <p className="text-gray-600">
              {displayProperties.length} properties found
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <select className="border border-gray-300 rounded-md px-3 py-2 text-sm text-black">
              <option>Sort by: Newest</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Bedrooms</option>
              <option>Area</option>
            </select>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Searching properties...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => searchProperties(localFilters)}>
              Try Again
            </Button>
          </div>
        )}

        {/* Properties Grid/List */}
        {!isLoading && !error && (
          <div className={cn(
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-6'
          )}>
            {displayProperties.map((property: any) => (
              <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img
                    src={property.images[0]?.url}
                    alt={property.images[0]?.alt}
                    className={cn(
                      'w-full object-cover',
                      viewMode === 'grid' ? 'h-48' : 'h-64 md:h-48'
                    )}
                  />
                  <div className="absolute top-4 left-4">
                    <span className={cn(
                      'px-2 py-1 rounded-full text-xs font-medium',
                      property.priceType === 'SALE' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                    )}>
                      For {property.priceType === 'SALE' ? 'Sale' : 'Rent'}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4 flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="bg-white/80 hover:bg-white"
                      onClick={() => handleSaveProperty(property.id)}
                    >
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="bg-white/80 hover:bg-white"
                      onClick={() => handleShareProperty(property.id)}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <CardContent className="p-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      <Link 
                        to={`/properties/${property.id}`}
                        className="hover:text-blue-600 transition-colors"
                      >
                        {property.title}
                      </Link>
                    </h3>
                    <p className="text-gray-600 flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {property.location}
                    </p>
                  </div>

                  <div className="mb-4">
                    <div className="text-2xl font-bold text-blue-600">
                      {property.price.period 
                        ? `${formatCurrency(property.price.amount)}/${property.price.period}`
                        : formatCurrency(property.price.amount)
                      }
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center">
                      <Bed className="h-4 w-4 mr-1" />
                      {property.bedrooms} bed{property.bedrooms !== 1 ? 's' : ''}
                    </div>
                    <div className="flex items-center">
                      <Bath className="h-4 w-4 mr-1" />
                      {property.bathrooms} bath{property.bathrooms !== 1 ? 's' : ''}
                    </div>
                    <div className="flex items-center">
                      <Square className="h-4 w-4 mr-1" />
                      {property.area} sq ft
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {property.features.slice(0, 3).map((feature: string, index: number) => (
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

                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                      {property.agent.companyName}
                    </div>
                    <Link to={`/properties/${property.id}`}>
                      <Button size="sm">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && !error && displayProperties.length > 0 && (
          <div className="mt-12 flex justify-center">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={prevPage}
                disabled={!canGoPrev}
              >
                Previous
              </Button>
              
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const page = i + 1;
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? 'default' : 'outline'}
                    onClick={() => goToPage(page)}
                  >
                    {page}
                  </Button>
                );
              })}
              
              <Button
                variant="outline"
                onClick={nextPage}
                disabled={!canGoNext}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Filters Modal */}
      <Modal
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        title="Filter Properties"
        size="lg"
      >
        <div className="space-y-6">
          {/* Property Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Property Type
            </label>
            <select
              value={localFilters.type || ''}
              onChange={(e) => handleFilterChange('type', e.target.value || undefined)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-black"
            >
              <option value="">Any Type</option>
              <option value="house">House</option>
              <option value="apartment">Apartment</option>
              <option value="studio">Studio</option>
              <option value="flat">Flat</option>
            </select>
          </div>

          {/* Price Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Price
              </label>
              <Input
                type="number"
                placeholder="Min price"
                value={localFilters.minPrice || ''}
                onChange={(e) => handleFilterChange('minPrice', e.target.value ? Number(e.target.value) : undefined)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Price
              </label>
              <Input
                type="number"
                placeholder="Max price"
                value={localFilters.maxPrice || ''}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
              />
            </div>
          </div>

          {/* Bedrooms & Bathrooms */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bedrooms
              </label>
              <select
                value={localFilters.minBedrooms || ''}
                onChange={(e) => handleFilterChange('minBedrooms', e.target.value ? Number(e.target.value) : undefined)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-black"
              >
                <option value="">Any</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
                <option value="5">5+</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bathrooms
              </label>
              <select
                value={localFilters.minBathrooms || ''}
                onChange={(e) => handleFilterChange('minBathrooms', e.target.value ? Number(e.target.value) : undefined)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-black"
              >
                <option value="">Any</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              variant="outline"
              onClick={clearFilters}
              className="flex-1"
            >
              Clear All
            </Button>
            <Button
              onClick={() => setShowFilters(false)}
              className="flex-1"
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Properties;