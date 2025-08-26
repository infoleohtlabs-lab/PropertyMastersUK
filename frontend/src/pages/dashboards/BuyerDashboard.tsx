import React, { useState, useEffect } from 'react';
import {
  Home,
  Heart,
  Search,
  Calculator,
  TrendingUp,
  MapPin,
  Calendar,
  Eye,
  Filter,
  Star,
  Bookmark,
  Phone,
  Mail,
  Camera,
  Video,
  Banknote,
  Percent,
  Clock,
  Building,
  Car,
  Wifi,
  Shield,
  CheckCircle,
  AlertCircle,
  Info,
  BarChart3,
  LineChart,
  PieChart,
  ArrowUp,
  ArrowDown,
  Minus,
  User,
  Bell,
  Target,
  Award,
  Settings,
  Share2,
  Download,
  Upload
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { useAuthStore } from '../../stores/authStore';
import { showToast } from '../../components/ui/Toast';

interface BuyerStats {
  savedProperties: number;
  viewingsScheduled: number;
  offersSubmitted: number;
  averageViewingTime: number;
  budgetRange: {
    min: number;
    max: number;
  };
  searchCriteria: {
    location: string;
    propertyType: string;
    bedrooms: number;
  };
  totalSearches: number;
  favoriteAreas: string[];
  priceAlerts: number;
  marketUpdates: number;
  viewingSuccess: number;
  offerAcceptance: number;
}

interface Property {
  id: string;
  title: string;
  address: string;
  price: number;
  priceChange?: {
    amount: number;
    percentage: number;
    direction: 'up' | 'down' | 'same';
  };
  type: 'house' | 'apartment' | 'bungalow' | 'townhouse';
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  yearBuilt: number;
  listingDate: string;
  agent: {
    name: string;
    company: string;
    phone: string;
    email: string;
    rating: number;
  };
  features: string[];
  images: string[];
  virtualTour?: string;
  video?: string;
  energyRating: string;
  councilTax: string;
  tenure: 'freehold' | 'leasehold';
  chainFree: boolean;
  newBuild: boolean;
  parking: boolean;
  garden: boolean;
  balcony: boolean;
  furnished: 'furnished' | 'unfurnished' | 'part-furnished';
  availableFrom: string;
  viewingCount: number;
  lastViewed?: string;
  saved: boolean;
  notes?: string;
}

interface Viewing {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyAddress: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  agent: {
    name: string;
    phone: string;
  };
  notes?: string;
  rating?: number;
  feedback?: string;
}

interface MarketData {
  averagePrice: number;
  priceChange: {
    amount: number;
    percentage: number;
    period: string;
  };
  salesVolume: number;
  timeOnMarket: number;
  pricePerSqft: number;
  demandLevel: 'low' | 'medium' | 'high' | 'very-high';
  supplyLevel: 'low' | 'medium' | 'high' | 'very-high';
  forecast: {
    nextMonth: number;
    nextQuarter: number;
    nextYear: number;
  };
}

interface MortgageCalculation {
  loanAmount: number;
  interestRate: number;
  termYears: number;
  monthlyPayment: number;
  totalInterest: number;
  totalPayment: number;
  ltv: number;
  deposit: number;
}

const BuyerDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<BuyerStats>({
    savedProperties: 0,
    viewingsScheduled: 0,
    offersSubmitted: 0,
    averageViewingTime: 0,
    budgetRange: { min: 0, max: 0 },
    searchCriteria: { location: '', propertyType: '', bedrooms: 0 },
    totalSearches: 0,
    favoriteAreas: [],
    priceAlerts: 0,
    marketUpdates: 0,
    viewingSuccess: 0,
    offerAcceptance: 0
  });
  const [properties, setProperties] = useState<Property[]>([]);
  const [savedProperties, setSavedProperties] = useState<Property[]>([]);
  const [viewings, setViewings] = useState<Viewing[]>([]);
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [mortgageCalc, setMortgageCalc] = useState<MortgageCalculation | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'search' | 'saved' | 'viewings' | 'market' | 'calculator' | 'analytics' | 'alerts'>('overview');
  const [showMortgageModal, setShowMortgageModal] = useState(false);
  const [showViewingModal, setShowViewingModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [searchFilters, setSearchFilters] = useState({
    location: '',
    minPrice: '',
    maxPrice: '',
    propertyType: '',
    bedrooms: '',
    bathrooms: '',
    features: [] as string[]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API calls
      const mockProperties: Property[] = [
        {
          id: '1',
          title: 'Modern 3-Bed Family Home',
          address: '25 Maple Avenue, Manchester M20 4RT',
          price: 425000,
          priceChange: { amount: -5000, percentage: -1.2, direction: 'down' },
          type: 'house',
          bedrooms: 3,
          bathrooms: 2,
          sqft: 1450,
          yearBuilt: 2018,
          listingDate: '2024-01-15',
          agent: {
            name: 'Sarah Johnson',
            company: 'Prime Properties',
            phone: '+44 7700 900123',
            email: 'sarah@primeproperties.com',
            rating: 4.8
          },
          features: ['Garden', 'Parking', 'Modern Kitchen', 'En-suite'],
          images: ['https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20three%20bedroom%20family%20house%20exterior%20manchester%20uk%20contemporary%20design&image_size=landscape_4_3'],
          virtualTour: 'https://example.com/virtual-tour',
          energyRating: 'B',
          councilTax: 'Band D',
          tenure: 'freehold',
          chainFree: true,
          newBuild: false,
          parking: true,
          garden: true,
          balcony: false,
          furnished: 'unfurnished',
          availableFrom: '2024-03-01',
          viewingCount: 12,
          lastViewed: '2024-01-20',
          saved: true,
          notes: 'Great location, close to schools'
        },
        {
          id: '2',
          title: 'Luxury 2-Bed Apartment',
          address: '10 City Heights, Manchester M1 5AB',
          price: 320000,
          priceChange: { amount: 8000, percentage: 2.6, direction: 'up' },
          type: 'apartment',
          bedrooms: 2,
          bathrooms: 2,
          sqft: 950,
          yearBuilt: 2020,
          listingDate: '2024-01-18',
          agent: {
            name: 'Michael Brown',
            company: 'Urban Living',
            phone: '+44 7700 900456',
            email: 'michael@urbanliving.com',
            rating: 4.6
          },
          features: ['Balcony', 'Concierge', 'Gym', 'City Views'],
          images: ['https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=luxury%20two%20bedroom%20apartment%20city%20views%20manchester%20modern%20interior&image_size=landscape_4_3'],
          video: 'https://example.com/property-video',
          energyRating: 'A',
          councilTax: 'Band C',
          tenure: 'leasehold',
          chainFree: false,
          newBuild: true,
          parking: true,
          garden: false,
          balcony: true,
          furnished: 'part-furnished',
          availableFrom: '2024-02-15',
          viewingCount: 8,
          saved: false
        }
      ];

      setProperties(mockProperties);
      setSavedProperties(mockProperties.filter(p => p.saved));

      setStats({
        savedProperties: mockProperties.filter(p => p.saved).length,
        viewingsScheduled: 3,
        offersSubmitted: 1,
        averageViewingTime: 45,
        budgetRange: { min: 300000, max: 500000 },
        searchCriteria: {
          location: 'Manchester',
          propertyType: 'house',
          bedrooms: 3
        },
        totalSearches: 156,
        favoriteAreas: ['Manchester', 'Salford', 'Stockport'],
        priceAlerts: 8,
        marketUpdates: 15,
        viewingSuccess: 85,
        offerAcceptance: 67
      });

      setViewings([
        {
          id: 'v1',
          propertyId: '1',
          propertyTitle: 'Modern 3-Bed Family Home',
          propertyAddress: '25 Maple Avenue, Manchester M20 4RT',
          date: '2024-02-05',
          time: '14:00',
          status: 'scheduled',
          agent: {
            name: 'Sarah Johnson',
            phone: '+44 7700 900123'
          }
        },
        {
          id: 'v2',
          propertyId: '2',
          propertyTitle: 'Luxury 2-Bed Apartment',
          propertyAddress: '10 City Heights, Manchester M1 5AB',
          date: '2024-02-03',
          time: '11:00',
          status: 'completed',
          agent: {
            name: 'Michael Brown',
            phone: '+44 7700 900456'
          },
          rating: 4,
          feedback: 'Beautiful apartment with great city views. Very modern and well-maintained.'
        }
      ]);

      setMarketData({
        averagePrice: 385000,
        priceChange: {
          amount: 12000,
          percentage: 3.2,
          period: 'last 6 months'
        },
        salesVolume: 156,
        timeOnMarket: 42,
        pricePerSqft: 285,
        demandLevel: 'high',
        supplyLevel: 'medium',
        forecast: {
          nextMonth: 1.2,
          nextQuarter: 2.8,
          nextYear: 5.5
        }
      });
    } catch (error) {
      showToast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const calculateMortgage = (propertyPrice: number, deposit: number, interestRate: number, termYears: number) => {
    const loanAmount = propertyPrice - deposit;
    const monthlyRate = interestRate / 100 / 12;
    const numPayments = termYears * 12;
    
    const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
    const totalPayment = monthlyPayment * numPayments;
    const totalInterest = totalPayment - loanAmount;
    const ltv = (loanAmount / propertyPrice) * 100;

    return {
      loanAmount,
      interestRate,
      termYears,
      monthlyPayment,
      totalInterest,
      totalPayment,
      ltv,
      deposit
    };
  };

  const toggleSaveProperty = (propertyId: string) => {
    setProperties(prev => prev.map(p => 
      p.id === propertyId ? { ...p, saved: !p.saved } : p
    ));
    setSavedProperties(prev => {
      const property = properties.find(p => p.id === propertyId);
      if (property?.saved) {
        return prev.filter(p => p.id !== propertyId);
      } else {
        return property ? [...prev, { ...property, saved: true }] : prev;
      }
    });
  };

  const scheduleViewing = (property: Property) => {
    setSelectedProperty(property);
    setShowViewingModal(true);
  };

  const handleScheduleViewing = () => {
    showToast.success('Viewing scheduled successfully');
    setShowViewingModal(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'text-blue-600 bg-blue-100';
      case 'completed': return 'text-green-600 bg-green-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      case 'rescheduled': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getDemandColor = (level: string) => {
    switch (level) {
      case 'very-high': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-gray-600 mt-2">
          Find your perfect home with our comprehensive property search and market insights.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <Heart className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Saved</p>
                <p className="text-2xl font-bold text-gray-900">{stats.savedProperties}</p>
                <p className="text-xs text-gray-500">properties</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Viewings</p>
                <p className="text-2xl font-bold text-gray-900">{stats.viewingsScheduled}</p>
                <p className="text-xs text-gray-500">scheduled</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Offers</p>
                <p className="text-2xl font-bold text-gray-900">{stats.offersSubmitted}</p>
                <p className="text-xs text-gray-500">submitted</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg. Viewing</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageViewingTime}</p>
                <p className="text-xs text-gray-500">minutes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Banknote className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Budget</p>
                <p className="text-lg font-bold text-gray-900">£{stats.budgetRange.min / 1000}k-{stats.budgetRange.max / 1000}k</p>
                <p className="text-xs text-gray-500">range</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Market</p>
                <p className="text-lg font-bold text-gray-900">+3.2%</p>
                <p className="text-xs text-gray-500">6 months</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: Home },
            { id: 'search', label: 'Search', icon: Search },
            { id: 'saved', label: 'Saved Properties', icon: Heart },
            { id: 'viewings', label: 'Viewings', icon: Calendar },
            { id: 'market', label: 'Market Analysis', icon: TrendingUp },
            { id: 'calculator', label: 'Mortgage Calculator', icon: Calculator },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'alerts', label: 'Alerts', icon: Bell }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button className="w-full justify-start" onClick={() => setActiveTab('search')}>
                  <Search className="h-4 w-4 mr-2" />
                  Search Properties
                </Button>
                <Button className="w-full justify-start" variant="outline" onClick={() => setActiveTab('saved')}>
                  <Heart className="h-4 w-4 mr-2" />
                  View Saved Properties
                </Button>
                <Button className="w-full justify-start" variant="outline" onClick={() => setActiveTab('viewings')}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Manage Viewings
                </Button>
                <Button className="w-full justify-start" variant="outline" onClick={() => setShowMortgageModal(true)}>
                  <Calculator className="h-4 w-4 mr-2" />
                  Calculate Mortgage
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Properties */}
          <Card>
            <CardHeader>
              <CardTitle>Recently Viewed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {properties.slice(0, 2).map((property) => (
                  <div key={property.id} className="flex items-start space-x-4 p-3 border rounded-lg">
                    <img
                      src={property.images[0]}
                      alt={property.title}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{property.title}</h4>
                      <p className="text-sm text-gray-600 flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {property.address}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <p className="font-semibold text-gray-900">£{property.price.toLocaleString()}</p>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleSaveProperty(property.id)}
                          >
                            <Heart className={`h-4 w-4 ${property.saved ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => scheduleViewing(property)}>
                            <Calendar className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Market Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Market Summary - {stats.searchCriteria.location}</CardTitle>
            </CardHeader>
            <CardContent>
              {marketData && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Average Price</p>
                      <p className="text-xl font-bold text-gray-900">£{marketData.averagePrice.toLocaleString()}</p>
                      <div className="flex items-center text-sm">
                        {marketData.priceChange.amount > 0 ? (
                          <ArrowUp className="h-3 w-3 text-green-600 mr-1" />
                        ) : (
                          <ArrowDown className="h-3 w-3 text-red-600 mr-1" />
                        )}
                        <span className={marketData.priceChange.amount > 0 ? 'text-green-600' : 'text-red-600'}>
                          {marketData.priceChange.percentage}% ({marketData.priceChange.period})
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Time on Market</p>
                      <p className="text-xl font-bold text-gray-900">{marketData.timeOnMarket} days</p>
                      <p className="text-sm text-gray-500">average</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Demand Level</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getDemandColor(marketData.demandLevel)}`}>
                        {marketData.demandLevel.replace('-', ' ')}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Price per sq ft</p>
                      <p className="text-lg font-bold text-gray-900">£{marketData.pricePerSqft}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Viewings */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Viewings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {viewings.filter(v => v.status === 'scheduled').map((viewing) => (
                  <div key={viewing.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">{viewing.propertyTitle}</h4>
                      <p className="text-sm text-gray-600">{viewing.propertyAddress}</p>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                        <span>{new Date(viewing.date).toLocaleDateString()}</span>
                        <span>{viewing.time}</span>
                        <span>with {viewing.agent.name}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        Reschedule
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'search' && (
        <div>
          {/* Search Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Search Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <Input
                    placeholder="Enter location"
                    value={searchFilters.location}
                    onChange={(e) => setSearchFilters(prev => ({ ...prev, location: e.target.value }))}
                    leftIcon={<MapPin className="h-4 w-4" />}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min Price
                  </label>
                  <Input
                    placeholder="£0"
                    value={searchFilters.minPrice}
                    onChange={(e) => setSearchFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                    leftIcon={<Banknote className="h-4 w-4" />}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Price
                  </label>
                  <Input
                    placeholder="£1,000,000"
                    value={searchFilters.maxPrice}
                    onChange={(e) => setSearchFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                    leftIcon={<Banknote className="h-4 w-4" />}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Property Type
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchFilters.propertyType}
                    onChange={(e) => setSearchFilters(prev => ({ ...prev, propertyType: e.target.value }))}
                  >
                    <option value="">Any</option>
                    <option value="house">House</option>
                    <option value="apartment">Apartment</option>
                    <option value="bungalow">Bungalow</option>
                    <option value="townhouse">Townhouse</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bedrooms
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchFilters.bedrooms}
                    onChange={(e) => setSearchFilters(prev => ({ ...prev, bedrooms: e.target.value }))}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bathrooms
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchFilters.bathrooms}
                    onChange={(e) => setSearchFilters(prev => ({ ...prev, bathrooms: e.target.value }))}
                  >
                    <option value="">Any</option>
                    <option value="1">1+</option>
                    <option value="2">2+</option>
                    <option value="3">3+</option>
                    <option value="4">4+</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Features
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['Garden', 'Parking', 'Balcony', 'New Build', 'Chain Free', 'Furnished'].map((feature) => (
                      <button
                        key={feature}
                        onClick={() => {
                          setSearchFilters(prev => ({
                            ...prev,
                            features: prev.features.includes(feature)
                              ? prev.features.filter(f => f !== feature)
                              : [...prev.features, feature]
                          }));
                        }}
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          searchFilters.features.includes(feature)
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {feature}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <Button>
                  <Search className="h-4 w-4 mr-2" />
                  Search Properties
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Search Results */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {properties.map((property) => (
              <Card key={property.id}>
                <CardContent className="p-0">
                  <div className="relative">
                    <img
                      src={property.images[0]}
                      alt={property.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    <div className="absolute top-2 right-2 flex space-x-2">
                      {property.virtualTour && (
                        <div className="bg-white bg-opacity-90 rounded-full p-2">
                          <Camera className="h-4 w-4 text-blue-600" />
                        </div>
                      )}
                      {property.video && (
                        <div className="bg-white bg-opacity-90 rounded-full p-2">
                          <Video className="h-4 w-4 text-red-600" />
                        </div>
                      )}
                      <button
                        onClick={() => toggleSaveProperty(property.id)}
                        className="bg-white bg-opacity-90 rounded-full p-2 hover:bg-opacity-100"
                      >
                        <Heart className={`h-4 w-4 ${property.saved ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                      </button>
                    </div>
                    <div className="absolute bottom-2 left-2 flex space-x-2">
                      {property.chainFree && (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                          Chain Free
                        </span>
                      )}
                      {property.newBuild && (
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                          New Build
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{property.title}</h3>
                        <p className="text-gray-600 flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {property.address}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-gray-900">£{property.price.toLocaleString()}</p>
                        {property.priceChange && (
                          <div className="flex items-center text-sm">
                            {property.priceChange.direction === 'up' ? (
                              <ArrowUp className="h-3 w-3 text-green-600 mr-1" />
                            ) : property.priceChange.direction === 'down' ? (
                              <ArrowDown className="h-3 w-3 text-red-600 mr-1" />
                            ) : (
                              <Minus className="h-3 w-3 text-gray-600 mr-1" />
                            )}
                            <span className={
                              property.priceChange.direction === 'up' ? 'text-green-600' :
                              property.priceChange.direction === 'down' ? 'text-red-600' : 'text-gray-600'
                            }>
                              {property.priceChange.percentage}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                      <span>{property.bedrooms} bed</span>
                      <span>{property.bathrooms} bath</span>
                      <span>{property.sqft} sq ft</span>
                      <span className="capitalize">{property.type}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {property.features.slice(0, 3).map((feature) => (
                        <span key={feature} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                          {feature}
                        </span>
                      ))}
                      {property.features.length > 3 && (
                        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                          +{property.features.length - 3} more
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 mr-1" />
                          <span>{property.agent.rating}</span>
                        </div>
                        <span>•</span>
                        <span>{property.agent.company}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Phone className="h-4 w-4 mr-1" />
                          Call
                        </Button>
                        <Button size="sm" onClick={() => scheduleViewing(property)}>
                          <Calendar className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'saved' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Saved Properties ({savedProperties.length})</h2>
            <div className="flex items-center space-x-2">
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline">
                Compare Selected
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {savedProperties.map((property) => (
              <Card key={property.id}>
                <CardContent className="p-0">
                  <div className="relative">
                    <img
                      src={property.images[0]}
                      alt={property.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    <div className="absolute top-2 right-2">
                      <button
                        onClick={() => toggleSaveProperty(property.id)}
                        className="bg-white bg-opacity-90 rounded-full p-2 hover:bg-opacity-100"
                      >
                        <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                      </button>
                    </div>
                    {property.lastViewed && (
                      <div className="absolute bottom-2 left-2">
                        <span className="bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
                          Last viewed: {new Date(property.lastViewed).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{property.title}</h3>
                        <p className="text-gray-600 flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {property.address}
                        </p>
                      </div>
                      <p className="text-xl font-bold text-gray-900">£{property.price.toLocaleString()}</p>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                      <span>{property.bedrooms} bed</span>
                      <span>{property.bathrooms} bath</span>
                      <span>{property.sqft} sq ft</span>
                    </div>
                    {property.notes && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-700 bg-yellow-50 p-2 rounded">
                          <strong>Notes:</strong> {property.notes}
                        </p>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        <span>Viewed {property.viewingCount} times</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Calculator className="h-4 w-4 mr-1" />
                          Calculate
                        </Button>
                        <Button size="sm" onClick={() => scheduleViewing(property)}>
                          <Calendar className="h-4 w-4 mr-1" />
                          View Again
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'viewings' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Property Viewings</h2>
            <Button>
              <Calendar className="h-4 w-4 mr-2" />
              Schedule New Viewing
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {viewings.map((viewing) => (
              <Card key={viewing.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">{viewing.propertyTitle}</h3>
                      <p className="text-sm text-gray-600">{viewing.propertyAddress}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(viewing.status)}`}>
                      {viewing.status}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>{new Date(viewing.date).toLocaleDateString()} at {viewing.time}</span>
                    </div>
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      <span>with {viewing.agent.name}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2" />
                      <span>{viewing.agent.phone}</span>
                    </div>
                  </div>
                  {viewing.feedback && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-1">Your Feedback:</p>
                      <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{viewing.feedback}</p>
                      {viewing.rating && (
                        <div className="flex items-center mt-2">
                          <span className="text-sm text-gray-600 mr-2">Rating:</span>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-4 w-4 ${
                                  star <= viewing.rating! ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      {viewing.status === 'completed' ? 'Completed' : 'Scheduled'}
                    </div>
                    <div className="flex items-center space-x-2">
                      {viewing.status === 'scheduled' && (
                        <>
                          <Button variant="outline" size="sm">
                            <Phone className="h-4 w-4 mr-1" />
                            Call
                          </Button>
                          <Button variant="outline" size="sm">
                            Reschedule
                          </Button>
                        </>
                      )}
                      {viewing.status === 'completed' && (
                        <Button variant="outline" size="sm">
                          View Property
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'market' && marketData && (
        <div className="space-y-6">
          {/* Market Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Average Price</p>
                    <p className="text-2xl font-bold text-gray-900">£{marketData.averagePrice.toLocaleString()}</p>
                    <div className="flex items-center text-sm">
                      <ArrowUp className="h-3 w-3 text-green-600 mr-1" />
                      <span className="text-green-600">+{marketData.priceChange.percentage}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Sales Volume</p>
                    <p className="text-2xl font-bold text-gray-900">{marketData.salesVolume}</p>
                    <p className="text-xs text-gray-500">last 3 months</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Clock className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Time on Market</p>
                    <p className="text-2xl font-bold text-gray-900">{marketData.timeOnMarket}</p>
                    <p className="text-xs text-gray-500">days average</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Banknote className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Price per sq ft</p>
                    <p className="text-2xl font-bold text-gray-900">£{marketData.pricePerSqft}</p>
                    <p className="text-xs text-gray-500">average</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Market Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Market Conditions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Demand Level</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDemandColor(marketData.demandLevel)}`}>
                      {marketData.demandLevel.replace('-', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Supply Level</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDemandColor(marketData.supplyLevel)}`}>
                      {marketData.supplyLevel}
                    </span>
                  </div>
                  <div className="pt-4 border-t">
                    <h4 className="font-medium text-gray-900 mb-2">Market Insights</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• High demand is driving competitive pricing</li>
                      <li>• Properties are selling faster than last year</li>
                      <li>• New developments are increasing supply</li>
                      <li>• Interest rates are affecting buyer behavior</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Price Forecast</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Next Month</span>
                    <div className="flex items-center">
                      <ArrowUp className="h-4 w-4 text-green-600 mr-1" />
                      <span className="text-green-600 font-medium">+{marketData.forecast.nextMonth}%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Next Quarter</span>
                    <div className="flex items-center">
                      <ArrowUp className="h-4 w-4 text-green-600 mr-1" />
                      <span className="text-green-600 font-medium">+{marketData.forecast.nextQuarter}%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Next Year</span>
                    <div className="flex items-center">
                      <ArrowUp className="h-4 w-4 text-green-600 mr-1" />
                      <span className="text-green-600 font-medium">+{marketData.forecast.nextYear}%</span>
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    <h4 className="font-medium text-gray-900 mb-2">Forecast Summary</h4>
                    <p className="text-sm text-gray-600">
                      Market conditions suggest continued growth with moderate price increases expected over the next year.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'calculator' && (
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Mortgage Calculator</CardTitle>
              <p className="text-gray-600">Calculate your monthly mortgage payments and see how different factors affect your loan.</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Property Price
                    </label>
                    <Input
                      type="number"
                      placeholder="425000"
                      leftIcon={<Banknote className="h-4 w-4" />}
                      id="propertyPrice"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Deposit Amount
                    </label>
                    <Input
                      type="number"
                      placeholder="85000"
                      leftIcon={<Banknote className="h-4 w-4" />}
                      id="deposit"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Interest Rate (%)
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="4.5"
                      leftIcon={<Percent className="h-4 w-4" />}
                      id="interestRate"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Loan Term (Years)
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      id="loanTerm"
                    >
                      <option value="25">25 years</option>
                      <option value="30">30 years</option>
                      <option value="35">35 years</option>
                    </select>
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => {
                      const propertyPrice = parseFloat((document.getElementById('propertyPrice') as HTMLInputElement).value) || 425000;
                      const deposit = parseFloat((document.getElementById('deposit') as HTMLInputElement).value) || 85000;
                      const interestRate = parseFloat((document.getElementById('interestRate') as HTMLInputElement).value) || 4.5;
                      const termYears = parseInt((document.getElementById('loanTerm') as HTMLSelectElement).value) || 25;
                      
                      const calculation = calculateMortgage(propertyPrice, deposit, interestRate, termYears);
                      setMortgageCalc(calculation);
                    }}
                  >
                    <Calculator className="h-4 w-4 mr-2" />
                    Calculate
                  </Button>
                </div>

                {/* Results */}
                {mortgageCalc && (
                  <div className="space-y-6">
                    <div className="bg-blue-50 p-6 rounded-lg">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Payment</h3>
                      <p className="text-3xl font-bold text-blue-600">£{mortgageCalc.monthlyPayment.toFixed(2)}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">Loan Amount</p>
                        <p className="text-xl font-bold text-gray-900">£{mortgageCalc.loanAmount.toLocaleString()}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">Loan-to-Value</p>
                        <p className="text-xl font-bold text-gray-900">{mortgageCalc.ltv.toFixed(1)}%</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">Total Interest</p>
                        <p className="text-xl font-bold text-gray-900">£{mortgageCalc.totalInterest.toLocaleString()}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">Total Payment</p>
                        <p className="text-xl font-bold text-gray-900">£{mortgageCalc.totalPayment.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="font-medium text-gray-900 mb-2">Additional Costs to Consider</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Stamp Duty:</span>
                          <span className="font-medium">£{(mortgageCalc.loanAmount * 0.02).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Legal Fees:</span>
                          <span className="font-medium">£1,500 - £3,000</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Survey:</span>
                          <span className="font-medium">£400 - £1,500</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Mortgage Fees:</span>
                          <span className="font-medium">£500 - £2,000</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Search Analytics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Searches</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.totalSearches}</p>
                  </div>
                  <Search className="h-8 w-8 text-blue-600" />
                </div>
                <div className="mt-2 flex items-center text-sm">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-green-600">+12% this month</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Viewing Success</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.viewingSuccess}%</p>
                  </div>
                  <Target className="h-8 w-8 text-green-600" />
                </div>
                <div className="mt-2 flex items-center text-sm">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-green-600">+5% this month</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Offer Acceptance</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.offerAcceptance}%</p>
                  </div>
                  <Award className="h-8 w-8 text-purple-600" />
                </div>
                <div className="mt-2 flex items-center text-sm">
                  <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-green-600">Above average</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Alerts</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.priceAlerts}</p>
                  </div>
                  <Bell className="h-8 w-8 text-orange-600" />
                </div>
                <div className="mt-2 flex items-center text-sm">
                  <Info className="h-4 w-4 text-blue-500 mr-1" />
                  <span className="text-blue-600">2 triggered today</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search Patterns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Search Patterns
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Peak Search Time</span>
                    <span className="font-medium">7-9 PM</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Most Active Day</span>
                    <span className="font-medium">Sunday</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Avg. Search Duration</span>
                    <span className="font-medium">12 minutes</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Properties per Search</span>
                    <span className="font-medium">8.5</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Favorite Areas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats?.favoriteAreas.map((area, index) => (
                    <div key={area} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{area}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${100 - (index * 20)}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500">{100 - (index * 20)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Property Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Property Preferences Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Property Types</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Houses</span>
                      <span className="text-sm font-medium">65%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Apartments</span>
                      <span className="text-sm font-medium">30%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Townhouses</span>
                      <span className="text-sm font-medium">5%</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-3">Price Ranges</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">£300k-£400k</span>
                      <span className="text-sm font-medium">45%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">£400k-£500k</span>
                      <span className="text-sm font-medium">35%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">£500k+</span>
                      <span className="text-sm font-medium">20%</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-3">Features</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Garden</span>
                      <span className="text-sm font-medium">85%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Parking</span>
                      <span className="text-sm font-medium">78%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Modern Kitchen</span>
                      <span className="text-sm font-medium">72%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Market Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="h-5 w-5" />
                Personal Market Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Your Search vs Market</h4>
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium">Price Trend</span>
                      </div>
                      <p className="text-xs text-gray-600">Your target areas have seen 3.2% price increase this quarter</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium">Time on Market</span>
                      </div>
                      <p className="text-xs text-gray-600">Properties in your range sell 15% faster than average</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-3">Recommendations</h4>
                  <div className="space-y-3">
                    <div className="p-3 bg-yellow-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Star className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm font-medium">Best Time to Buy</span>
                      </div>
                      <p className="text-xs text-gray-600">Consider viewing properties on weekdays for better negotiation</p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Target className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-medium">Expand Search</span>
                      </div>
                      <p className="text-xs text-gray-600">Consider Trafford area - 12% better value for similar properties</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Alerts & Notifications Tab */}
      {activeTab === 'alerts' && (
        <div className="space-y-6">
          {/* Alert Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Alerts</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.priceAlerts}</p>
                  </div>
                  <Bell className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Triggered Today</p>
                    <p className="text-2xl font-bold text-gray-900">2</p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Market Updates</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.marketUpdates}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">New Properties</p>
                    <p className="text-2xl font-bold text-gray-900">5</p>
                  </div>
                  <Home className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Alert Management */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Alert Settings
                  </span>
                  <button className="text-sm text-blue-600 hover:text-blue-800">
                    Manage All
                  </button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Price Drop Alerts</p>
                      <p className="text-sm text-gray-600">Manchester, 3+ bed houses</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Active</span>
                      <button className="text-gray-400 hover:text-gray-600">
                        <Settings className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">New Listings</p>
                      <p className="text-sm text-gray-600">£300k-£500k range</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Active</span>
                      <button className="text-gray-400 hover:text-gray-600">
                        <Settings className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Market Reports</p>
                      <p className="text-sm text-gray-600">Weekly summary</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">Paused</span>
                      <button className="text-gray-400 hover:text-gray-600">
                        <Settings className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Recent Notifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Price Drop Alert</p>
                      <p className="text-xs text-gray-600">3 bed house in Didsbury reduced by £15,000</p>
                      <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                    <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">New Listing</p>
                      <p className="text-xs text-gray-600">4 bed house in Chorlton matches your criteria</p>
                      <p className="text-xs text-gray-500 mt-1">5 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                    <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Market Update</p>
                      <p className="text-xs text-gray-600">Manchester property prices up 2.1% this month</p>
                      <p className="text-xs text-gray-500 mt-1">1 day ago</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                    <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Viewing Reminder</p>
                      <p className="text-xs text-gray-600">Property viewing tomorrow at 2 PM</p>
                      <p className="text-xs text-gray-500 mt-1">1 day ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Create New Alert */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Create New Alert
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
                  <div className="text-center">
                    <Banknote className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm font-medium">Price Drop Alert</p>
                    <p className="text-xs text-gray-600">Get notified when prices drop</p>
                  </div>
                </button>
                <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors">
                  <div className="text-center">
                    <Home className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm font-medium">New Listings</p>
                    <p className="text-xs text-gray-600">Alert for new properties</p>
                  </div>
                </button>
                <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors">
                  <div className="text-center">
                    <TrendingUp className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm font-medium">Market Trends</p>
                    <p className="text-xs text-gray-600">Track market changes</p>
                  </div>
                </button>
                <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors">
                  <div className="text-center">
                    <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm font-medium">Viewing Reminders</p>
                    <p className="text-xs text-gray-600">Never miss a viewing</p>
                  </div>
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Viewing Modal */}
      <Modal
        isOpen={showViewingModal}
        onClose={() => setShowViewingModal(false)}
        title="Schedule Property Viewing"
      >
        {selectedProperty && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900">{selectedProperty.title}</h3>
              <p className="text-gray-600">{selectedProperty.address}</p>
              <p className="text-lg font-bold text-gray-900">£{selectedProperty.price.toLocaleString()}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preferred Date
              </label>
              <Input type="date" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preferred Time
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black">
                <option value="">Select time</option>
                <option value="09:00">9:00 AM</option>
                <option value="10:00">10:00 AM</option>
                <option value="11:00">11:00 AM</option>
                <option value="14:00">2:00 PM</option>
                <option value="15:00">3:00 PM</option>
                <option value="16:00">4:00 PM</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Number
              </label>
              <Input placeholder="Your phone number" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Additional Notes
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Any specific requirements or questions"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowViewingModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleScheduleViewing}>
                Schedule Viewing
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Mortgage Calculator Modal */}
      <Modal
        isOpen={showMortgageModal}
        onClose={() => setShowMortgageModal(false)}
        title="Quick Mortgage Calculator"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Property Price
            </label>
            <Input type="number" placeholder="425000" leftIcon={<Banknote className="h-4 w-4" />} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Deposit
            </label>
            <Input type="number" placeholder="85000" leftIcon={<Banknote className="h-4 w-4" />} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Interest Rate (%)
            </label>
            <Input type="number" step="0.01" placeholder="4.5" leftIcon={<Percent className="h-4 w-4" />} />
          </div>
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setShowMortgageModal(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              setShowMortgageModal(false);
              setActiveTab('calculator');
            }}>
              Open Full Calculator
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default BuyerDashboard;