import React, { useState, useEffect } from 'react';
import { Search, MapPin, Bell, BellOff, Edit, Trash2, Plus, Filter, Calendar, Home, PoundSterling } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

interface SavedSearch {
  id: string;
  name: string;
  location: {
    area: string;
    radius: number;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  criteria: {
    propertyType: string[];
    minPrice?: number;
    maxPrice?: number;
    minBedrooms?: number;
    maxBedrooms?: number;
    minBathrooms?: number;
    tenure?: string[];
    features?: string[];
    keywords?: string;
  };
  notifications: {
    enabled: boolean;
    frequency: 'instant' | 'daily' | 'weekly';
    lastSent?: string;
  };
  createdDate: string;
  lastModified: string;
  resultsCount: number;
  newResultsCount: number;
}

const SavedSearches: React.FC = () => {
  const { user } = useAuthStore();
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingSearch, setEditingSearch] = useState<SavedSearch | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'results'>('date');
  const [filterBy, setFilterBy] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    loadSavedSearches();
  }, []);

  const loadSavedSearches = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API call
      const mockData: SavedSearch[] = [
        {
          id: '1',
          name: 'Family Home in Birmingham',
          location: {
            area: 'Birmingham, West Midlands',
            radius: 5,
            coordinates: { lat: 52.4862, lng: -1.8904 }
          },
          criteria: {
            propertyType: ['House'],
            minPrice: 200000,
            maxPrice: 350000,
            minBedrooms: 3,
            maxBedrooms: 4,
            minBathrooms: 2,
            tenure: ['Freehold'],
            features: ['Garden', 'Parking', 'Modern Kitchen'],
            keywords: 'family friendly quiet area'
          },
          notifications: {
            enabled: true,
            frequency: 'daily',
            lastSent: '2024-01-20'
          },
          createdDate: '2024-01-10',
          lastModified: '2024-01-18',
          resultsCount: 24,
          newResultsCount: 3
        },
        {
          id: '2',
          name: 'City Centre Apartment',
          location: {
            area: 'Manchester City Centre',
            radius: 2,
            coordinates: { lat: 53.4808, lng: -2.2426 }
          },
          criteria: {
            propertyType: ['Apartment', 'Flat'],
            minPrice: 150000,
            maxPrice: 250000,
            minBedrooms: 1,
            maxBedrooms: 2,
            minBathrooms: 1,
            tenure: ['Leasehold'],
            features: ['Balcony', 'Concierge', 'Gym'],
            keywords: 'modern city centre transport links'
          },
          notifications: {
            enabled: true,
            frequency: 'instant',
            lastSent: '2024-01-21'
          },
          createdDate: '2024-01-15',
          lastModified: '2024-01-20',
          resultsCount: 18,
          newResultsCount: 1
        },
        {
          id: '3',
          name: 'Investment Property London',
          location: {
            area: 'East London',
            radius: 10,
            coordinates: { lat: 51.5074, lng: -0.1278 }
          },
          criteria: {
            propertyType: ['Apartment', 'House'],
            minPrice: 300000,
            maxPrice: 500000,
            minBedrooms: 2,
            maxBedrooms: 3,
            tenure: ['Leasehold', 'Freehold'],
            features: ['Good Transport Links', 'High Rental Yield'],
            keywords: 'investment opportunity rental yield'
          },
          notifications: {
            enabled: false,
            frequency: 'weekly'
          },
          createdDate: '2024-01-05',
          lastModified: '2024-01-12',
          resultsCount: 42,
          newResultsCount: 0
        },
        {
          id: '4',
          name: 'Retirement Bungalow',
          location: {
            area: 'Brighton, East Sussex',
            radius: 8,
            coordinates: { lat: 50.8225, lng: -0.1372 }
          },
          criteria: {
            propertyType: ['Bungalow'],
            minPrice: 250000,
            maxPrice: 400000,
            minBedrooms: 2,
            maxBedrooms: 3,
            minBathrooms: 1,
            tenure: ['Freehold'],
            features: ['Garden', 'No Steps', 'Quiet Area'],
            keywords: 'retirement accessible ground floor'
          },
          notifications: {
            enabled: true,
            frequency: 'weekly',
            lastSent: '2024-01-19'
          },
          createdDate: '2024-01-08',
          lastModified: '2024-01-16',
          resultsCount: 12,
          newResultsCount: 2
        }
      ];
      setSearches(mockData);
    } catch (error) {
      console.error('Error loading saved searches:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleNotifications = async (searchId: string) => {
    setSearches(prev => prev.map(search => 
      search.id === searchId 
        ? { ...search, notifications: { ...search.notifications, enabled: !search.notifications.enabled } }
        : search
    ));
  };

  const deleteSearch = async (searchId: string) => {
    if (window.confirm('Are you sure you want to delete this saved search?')) {
      setSearches(prev => prev.filter(search => search.id !== searchId));
    }
  };

  const runSearch = (search: SavedSearch) => {
    // Navigate to property search with criteria
    console.log('Running search:', search);
  };

  const getFilteredAndSortedSearches = () => {
    let filtered = searches;
    
    // Apply filter
    if (filterBy === 'active') {
      filtered = searches.filter(s => s.notifications.enabled);
    } else if (filterBy === 'inactive') {
      filtered = searches.filter(s => !s.notifications.enabled);
    }
    
    // Apply sort
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'results':
          return b.resultsCount - a.resultsCount;
        case 'date':
        default:
          return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime();
      }
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatCriteria = (criteria: SavedSearch['criteria']) => {
    const parts = [];
    
    if (criteria.propertyType.length > 0) {
      parts.push(criteria.propertyType.join(', '));
    }
    
    if (criteria.minBedrooms || criteria.maxBedrooms) {
      const bedrooms = criteria.minBedrooms === criteria.maxBedrooms 
        ? `${criteria.minBedrooms} bed`
        : `${criteria.minBedrooms || 'Any'}-${criteria.maxBedrooms || 'Any'} bed`;
      parts.push(bedrooms);
    }
    
    if (criteria.minPrice || criteria.maxPrice) {
      const priceRange = `${criteria.minPrice ? formatPrice(criteria.minPrice) : 'Any'} - ${criteria.maxPrice ? formatPrice(criteria.maxPrice) : 'Any'}`;
      parts.push(priceRange);
    }
    
    return parts.join(' • ');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading saved searches...</p>
        </div>
      </div>
    );
  }

  const filteredSearches = getFilteredAndSortedSearches();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Saved Searches</h1>
              <p className="mt-2 text-gray-600">
                Manage your property search alerts and get notified of new listings
              </p>
            </div>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Search Alert
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Search className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Searches</p>
                <p className="text-2xl font-bold text-gray-900">{searches.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Bell className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Alerts</p>
                <p className="text-2xl font-bold text-gray-900">
                  {searches.filter(s => s.notifications.enabled).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Home className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Results</p>
                <p className="text-2xl font-bold text-gray-900">
                  {searches.reduce((sum, s) => sum + s.resultsCount, 0)}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <Calendar className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">New Results</p>
                <p className="text-2xl font-bold text-gray-900">
                  {searches.reduce((sum, s) => sum + s.newResultsCount, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Sort */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Filter:</span>
                <select
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value as any)}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Searches</option>
                  <option value="active">Active Alerts</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="date">Last Modified</option>
                  <option value="name">Name</option>
                  <option value="results">Results Count</option>
                </select>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              {filteredSearches.length} of {searches.length} searches
            </div>
          </div>
        </div>

        {/* Searches List */}
        {filteredSearches.length === 0 ? (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No saved searches found</h3>
            <p className="text-gray-600 mb-4">Create your first search alert to get notified of new properties!</p>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Search Alert
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSearches.map((search) => (
              <div key={search.id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{search.name}</h3>
                        {search.newResultsCount > 0 && (
                          <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                            {search.newResultsCount} new
                          </span>
                        )}
                        <div className="flex items-center space-x-1">
                          {search.notifications.enabled ? (
                            <Bell className="h-4 w-4 text-green-600" />
                          ) : (
                            <BellOff className="h-4 w-4 text-gray-400" />
                          )}
                          <span className={`text-xs ${
                            search.notifications.enabled ? 'text-green-600' : 'text-gray-400'
                          }`}>
                            {search.notifications.enabled ? search.notifications.frequency : 'disabled'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>{search.location.area} ({search.location.radius} miles)</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{formatCriteria(search.criteria)}</p>
                      {search.criteria.keywords && (
                        <p className="text-sm text-gray-500 italic mb-3">
                          Keywords: {search.criteria.keywords}
                        </p>
                      )}
                    </div>
                    <div className="text-right ml-6">
                      <div className="text-2xl font-bold text-blue-600">{search.resultsCount}</div>
                      <div className="text-sm text-gray-600">properties</div>
                    </div>
                  </div>

                  {/* Features */}
                  {search.criteria.features && search.criteria.features.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {search.criteria.features.map((feature, index) => (
                          <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center space-x-4">
                      <span>Created: {new Date(search.createdDate).toLocaleDateString()}</span>
                      <span>Modified: {new Date(search.lastModified).toLocaleDateString()}</span>
                      {search.notifications.lastSent && (
                        <span>Last alert: {new Date(search.notifications.lastSent).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center space-x-3">
                      <button 
                        onClick={() => runSearch(search)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm flex items-center"
                      >
                        <Search className="h-4 w-4 mr-2" />
                        Run Search
                      </button>
                      <button 
                        onClick={() => setEditingSearch(search)}
                        className="text-gray-600 hover:text-gray-800 text-sm font-medium flex items-center"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </button>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button 
                        onClick={() => toggleNotifications(search.id)}
                        className={`text-sm font-medium flex items-center ${
                          search.notifications.enabled 
                            ? 'text-red-600 hover:text-red-800' 
                            : 'text-green-600 hover:text-green-800'
                        }`}
                      >
                        {search.notifications.enabled ? (
                          <>
                            <BellOff className="h-4 w-4 mr-1" />
                            Disable Alerts
                          </>
                        ) : (
                          <>
                            <Bell className="h-4 w-4 mr-1" />
                            Enable Alerts
                          </>
                        )}
                      </button>
                      <button 
                        onClick={() => deleteSearch(search.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </button>
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

export default SavedSearches;