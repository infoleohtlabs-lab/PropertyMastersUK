import React, { useState, useEffect } from 'react';
import { Heart, Eye, Calendar, MapPin, Bed, Bath, Square, Trash2, Filter, Search } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

interface SavedProperty {
  id: string;
  title: string;
  address: string;
  price: number;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  images: string[];
  savedDate: string;
  agent: {
    name: string;
    company: string;
    phone: string;
  };
  status: 'available' | 'under_offer' | 'sold';
  priceChange?: {
    amount: number;
    direction: 'up' | 'down';
    date: string;
  };
}

const SavedProperties: React.FC = () => {
  const { user } = useAuthStore();
  const [savedProperties, setSavedProperties] = useState<SavedProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('savedDate');

  useEffect(() => {
    loadSavedProperties();
  }, []);

  const loadSavedProperties = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API call
      const mockData: SavedProperty[] = [
        {
          id: '1',
          title: 'Modern 2-Bed Apartment in City Centre',
          address: '123 High Street, Birmingham, B1 1AA',
          price: 250000,
          propertyType: 'Apartment',
          bedrooms: 2,
          bathrooms: 2,
          area: 850,
          images: ['https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20apartment%20living%20room%20city%20centre&image_size=landscape_4_3'],
          savedDate: '2024-01-15',
          agent: {
            name: 'Sarah Johnson',
            company: 'PropertyMasters UK',
            phone: '+44 121 123 4567'
          },
          status: 'available',
          priceChange: {
            amount: 5000,
            direction: 'down',
            date: '2024-01-10'
          }
        },
        {
          id: '2',
          title: 'Victorian Terrace House',
          address: '45 Oak Avenue, Manchester, M1 2BB',
          price: 320000,
          propertyType: 'House',
          bedrooms: 3,
          bathrooms: 2,
          area: 1200,
          images: ['https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=victorian%20terrace%20house%20exterior%20brick&image_size=landscape_4_3'],
          savedDate: '2024-01-12',
          agent: {
            name: 'Michael Brown',
            company: 'Heritage Homes',
            phone: '+44 161 234 5678'
          },
          status: 'under_offer'
        }
      ];
      setSavedProperties(mockData);
    } catch (error) {
      console.error('Error loading saved properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeSavedProperty = async (propertyId: string) => {
    try {
      setSavedProperties(prev => prev.filter(p => p.id !== propertyId));
      // API call to remove from saved properties
    } catch (error) {
      console.error('Error removing saved property:', error);
    }
  };

  const filteredProperties = savedProperties.filter(property => {
    const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || property.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const sortedProperties = [...filteredProperties].sort((a, b) => {
    switch (sortBy) {
      case 'price_low':
        return a.price - b.price;
      case 'price_high':
        return b.price - a.price;
      case 'savedDate':
        return new Date(b.savedDate).getTime() - new Date(a.savedDate).getTime();
      default:
        return 0;
    }
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'under_offer':
        return 'bg-yellow-100 text-yellow-800';
      case 'sold':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading saved properties...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Saved Properties</h1>
          <p className="mt-2 text-gray-600">
            You have {savedProperties.length} saved properties
          </p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search properties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="under_offer">Under Offer</option>
              <option value="sold">Sold</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="savedDate">Recently Saved</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
            </select>

            {/* Clear All */}
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterStatus('all');
                setSortBy('savedDate');
              }}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Properties Grid */}
        {sortedProperties.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No saved properties found</h3>
            <p className="text-gray-600">Start browsing properties and save your favorites!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedProperties.map((property) => (
              <div key={property.id} className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
                {/* Property Image */}
                <div className="relative h-48">
                  <img
                    src={property.images[0]}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3">
                    <button
                      onClick={() => removeSavedProperty(property.id)}
                      className="p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </button>
                  </div>
                  <div className="absolute top-3 left-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(property.status)}`}>
                      {property.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  {property.priceChange && (
                    <div className="absolute bottom-3 left-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        property.priceChange.direction === 'down' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {property.priceChange.direction === 'down' ? '↓' : '↑'} {formatPrice(property.priceChange.amount)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Property Details */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{property.title}</h3>
                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="text-sm">{property.address}</span>
                  </div>
                  
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl font-bold text-blue-600">{formatPrice(property.price)}</span>
                    <span className="text-sm text-gray-500">{property.propertyType}</span>
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center">
                      <Bed className="h-4 w-4 mr-1" />
                      <span>{property.bedrooms} bed</span>
                    </div>
                    <div className="flex items-center">
                      <Bath className="h-4 w-4 mr-1" />
                      <span>{property.bathrooms} bath</span>
                    </div>
                    <div className="flex items-center">
                      <Square className="h-4 w-4 mr-1" />
                      <span>{property.area} sq ft</span>
                    </div>
                  </div>

                  <div className="border-t pt-3">
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        Saved on {new Date(property.savedDate).toLocaleDateString()}
                      </div>
                      <div className="flex space-x-2">
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors">
                          <Calendar className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedProperties;