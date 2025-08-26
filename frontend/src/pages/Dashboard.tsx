import * as React from 'react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import {
  Home,
  Plus,
  Search,
  Heart,
  Calendar,
  MessageSquare,
  Bell,
  Settings,
  User as UserIcon,
  TrendingUp,
  PoundSterling,
  Eye,
  Edit,
  Trash2,
  MapPin,
  Bed,
  Bath,
  Square,
  Clock,
  Users,
  FileText,
  BarChart3,
  Activity,
  AlertCircle,
  CheckCircle,
  Star,
  Phone,
  Mail,
  Building2,
  Key,
  Wrench,
  CreditCard,
  Download,
  Upload,
  Filter,
  Grid,
  List,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { User, UserRole } from '../types';

interface Property {
  id: number;
  title: string;
  location: string;
  price: number;
  type: 'sale' | 'rent';
  status: 'active' | 'pending' | 'sold' | 'rented' | 'draft';
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  image: string;
  views: number;
  enquiries: number;
  daysOnMarket: number;
  lastUpdated: string;
}

interface DashboardStats {
  totalProperties: number;
  activeListings: number;
  totalViews: number;
  totalEnquiries: number;
  monthlyRevenue: number;
  revenueChange: number;
  viewsChange: number;
  enquiriesChange: number;
}

interface Activity {
  id: number;
  type: 'viewing' | 'enquiry' | 'offer' | 'message' | 'update';
  title: string;
  description: string;
  time: string;
  property?: string;
  user?: string;
}

const Dashboard: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock user data
  const mockUser: User = {
    id: '1',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah@primelondon.co.uk',
    role: UserRole.AGENT,
    avatar: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20female%20estate%20agent%20headshot%20business%20attire&image_size=square',
    phone: '+44 20 7123 4567',
    isEmailVerified: true,
    isActive: true,
    createdAt: '2022-03-15T00:00:00Z',
    updatedAt: '2024-01-20T00:00:00Z',
    profile: {
      company: 'Prime London Properties'
    }
  };

  // Mock properties data
  const mockProperties: Property[] = [
    {
      id: 1,
      title: 'Modern 2-Bed Apartment with River Views',
      location: 'Canary Wharf, London',
      price: 650000,
      type: 'sale',
      status: 'active',
      bedrooms: 2,
      bathrooms: 2,
      sqft: 950,
      image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20luxury%20apartment%20living%20room%20london%20canary%20wharf%20floor%20to%20ceiling%20windows%20river%20views&image_size=landscape_4_3',
      views: 234,
      enquiries: 12,
      daysOnMarket: 15,
      lastUpdated: '2024-01-20'
    },
    {
      id: 2,
      title: 'Victorian Terrace House',
      location: 'Clapham, London',
      price: 2200,
      type: 'rent',
      status: 'pending',
      bedrooms: 3,
      bathrooms: 2,
      sqft: 1200,
      image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=victorian%20terrace%20house%20london%20clapham%20traditional%20british%20architecture%20period%20features&image_size=landscape_4_3',
      views: 156,
      enquiries: 8,
      daysOnMarket: 8,
      lastUpdated: '2024-01-18'
    },
    {
      id: 3,
      title: 'Luxury Penthouse with Roof Terrace',
      location: 'Kensington, London',
      price: 1250000,
      type: 'sale',
      status: 'active',
      bedrooms: 3,
      bathrooms: 3,
      sqft: 1800,
      image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=luxury%20penthouse%20apartment%20kensington%20london%20high%20end%20interior%20design%20marble%20finishes&image_size=landscape_4_3',
      views: 89,
      enquiries: 5,
      daysOnMarket: 22,
      lastUpdated: '2024-01-19'
    }
  ];

  // Mock stats data
  const mockStats: DashboardStats = {
    totalProperties: 12,
    activeListings: 8,
    totalViews: 1247,
    totalEnquiries: 34,
    monthlyRevenue: 15750,
    revenueChange: 12.5,
    viewsChange: 8.3,
    enquiriesChange: -2.1
  };

  // Mock activities data
  const mockActivities: Activity[] = [
    {
      id: 1,
      type: 'viewing',
      title: 'New viewing booked',
      description: 'John Smith booked a viewing for Modern 2-Bed Apartment',
      time: '2 hours ago',
      property: 'Modern 2-Bed Apartment',
      user: 'John Smith'
    },
    {
      id: 2,
      type: 'enquiry',
      title: 'New enquiry received',
      description: 'Emma Wilson enquired about Victorian Terrace House',
      time: '4 hours ago',
      property: 'Victorian Terrace House',
      user: 'Emma Wilson'
    },
    {
      id: 3,
      type: 'offer',
      title: 'Offer received',
      description: 'Offer of £620,000 received for Modern 2-Bed Apartment',
      time: '1 day ago',
      property: 'Modern 2-Bed Apartment'
    },
    {
      id: 4,
      type: 'update',
      title: 'Property updated',
      description: 'Price reduced for Luxury Penthouse',
      time: '2 days ago',
      property: 'Luxury Penthouse'
    }
  ];

  useEffect(() => {
    setUser(mockUser);
    setProperties(mockProperties);
    setStats(mockStats);
    setActivities(mockActivities);
  }, []);

  const filteredProperties = properties.filter(property => {
    if (filterStatus === 'all') return true;
    return property.status === filterStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'sold': return 'bg-blue-100 text-blue-800';
      case 'rented': return 'bg-purple-100 text-purple-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'viewing': return <Calendar className="h-4 w-4" />;
      case 'enquiry': return <MessageSquare className="h-4 w-4" />;
      case 'offer': return <PoundSterling className="h-4 w-4" />;
      case 'message': return <Mail className="h-4 w-4" />;
      case 'update': return <Edit className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  if (!user || !stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user.firstName} {user.lastName}</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Property
              </Button>
              <div className="relative">
                <Button variant="outline" size="sm">
                  <Bell className="h-4 w-4" />
                </Button>
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  3
                </span>
              </div>
              <Link to="/profile">
                <img
                  src={user.avatar}
                  alt={`${user.firstName} ${user.lastName}`}
                  className="w-8 h-8 rounded-full object-cover"
                />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Properties</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalProperties}</p>
              </div>
              <div className="bg-blue-100 rounded-full p-3">
                <Home className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-gray-600">{stats.activeListings} active listings</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Views</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalViews.toLocaleString()}</p>
              </div>
              <div className="bg-green-100 rounded-full p-3">
                <Eye className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600">+{stats.viewsChange}% from last month</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Enquiries</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalEnquiries}</p>
              </div>
              <div className="bg-yellow-100 rounded-full p-3">
                <MessageSquare className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
              <span className="text-sm text-red-600">{stats.enquiriesChange}% from last month</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                <p className="text-3xl font-bold text-gray-900">£{stats.monthlyRevenue.toLocaleString()}</p>
              </div>
              <div className="bg-purple-100 rounded-full p-3">
                <PoundSterling className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600">+{stats.revenueChange}% from last month</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Properties Section */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">My Properties</h2>
                  <div className="flex items-center space-x-4">
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="pending">Pending</option>
                      <option value="sold">Sold</option>
                      <option value="rented">Rented</option>
                      <option value="draft">Draft</option>
                    </select>
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
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredProperties.map(property => (
                      <PropertyCard key={property.id} property={property} />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredProperties.map(property => (
                      <PropertyListItem key={property.id} property={property} />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Performance Chart */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Performance Overview</h3>
              <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-600">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                  <p>Performance charts coming soon</p>
                  <p className="text-sm">Views, enquiries, and revenue trends</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link to="/properties/add">
                  <Button className="w-full justify-start">
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Property
                  </Button>
                </Link>
                <Link to="/properties">
                  <Button variant="outline" className="w-full justify-start">
                    <Search className="h-4 w-4 mr-2" />
                    Search Properties
                  </Button>
                </Link>
                <Link to="/reports">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                </Link>
                <Link to="/market-analysis">
                  <Button variant="outline" className="w-full justify-start">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Market Analysis
                  </Button>
                </Link>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {activities.slice(0, 5).map(activity => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="bg-blue-100 rounded-full p-2 flex-shrink-0">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <p className="text-sm text-gray-600 truncate">{activity.description}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Link to="/activity" className="text-sm text-blue-600 hover:text-blue-800 flex items-center">
                  View all activity
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </div>

            {/* Upcoming Tasks */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Upcoming Tasks</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Property inspection due</p>
                    <p className="text-xs text-gray-600">Modern 2-Bed Apartment - Tomorrow</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Client viewing</p>
                    <p className="text-xs text-gray-600">Victorian Terrace - Friday 2PM</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Contract review</p>
                    <p className="text-xs text-gray-600">Luxury Penthouse - Next week</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Property Card Component
const PropertyCard: React.FC<{ property: Property }> = ({ property }) => {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative">
        <img
          src={property.image}
          alt={property.title}
          className="w-full h-40 object-cover"
        />
        <div className="absolute top-2 left-2">
          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(property.status)}`}>
            {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
          </span>
        </div>
        <div className="absolute top-2 right-2">
          <span className={`px-2 py-1 rounded text-xs font-medium text-white ${
            property.type === 'sale' ? 'bg-green-600' : 'bg-blue-600'
          }`}>
            For {property.type === 'sale' ? 'Sale' : 'Rent'}
          </span>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-1 truncate">{property.title}</h3>
        <p className="text-gray-600 text-sm mb-2 flex items-center">
          <MapPin className="h-3 w-3 mr-1" />
          {property.location}
        </p>
        
        <div className="flex items-center justify-between mb-3">
          <span className="text-lg font-bold text-gray-900">
            £{property.price.toLocaleString()}
            {property.type === 'rent' && <span className="text-sm text-gray-600">/month</span>}
          </span>
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
          <span className="flex items-center">
            <Bed className="h-3 w-3 mr-1" />
            {property.bedrooms}
          </span>
          <span className="flex items-center">
            <Bath className="h-3 w-3 mr-1" />
            {property.bathrooms}
          </span>
          <span className="flex items-center">
            <Square className="h-3 w-3 mr-1" />
            {property.sqft} sqft
          </span>
        </div>
        
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <span>{property.views} views</span>
          <span>{property.enquiries} enquiries</span>
          <span>{property.daysOnMarket} days</span>
        </div>
        
        <div className="flex space-x-2">
          <Link to={`/property/${property.id}`} className="flex-1">
            <Button size="sm" className="w-full">
              <Eye className="h-3 w-3 mr-1" />
              View
            </Button>
          </Link>
          <Button variant="outline" size="sm">
            <Edit className="h-3 w-3" />
          </Button>
          <Button variant="outline" size="sm">
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};

// Property List Item Component
const PropertyListItem: React.FC<{ property: Property }> = ({ property }) => {
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center space-x-4">
        <div className="relative flex-shrink-0">
          <img
            src={property.image}
            alt={property.title}
            className="w-20 h-16 object-cover rounded"
          />
          <div className="absolute -top-1 -right-1">
            <span className={`px-1 py-0.5 rounded text-xs font-medium ${getStatusColor(property.status)}`}>
              {property.status}
            </span>
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 truncate">{property.title}</h3>
              <p className="text-gray-600 text-sm flex items-center">
                <MapPin className="h-3 w-3 mr-1" />
                {property.location}
              </p>
            </div>
            <div className="text-right">
              <span className="text-lg font-bold text-gray-900">
                £{property.price.toLocaleString()}
                {property.type === 'rent' && <span className="text-sm text-gray-600">/month</span>}
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span className="flex items-center">
                <Bed className="h-3 w-3 mr-1" />
                {property.bedrooms} beds
              </span>
              <span className="flex items-center">
                <Bath className="h-3 w-3 mr-1" />
                {property.bathrooms} baths
              </span>
              <span className="flex items-center">
                <Square className="h-3 w-3 mr-1" />
                {property.sqft} sqft
              </span>
            </div>
            
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <span>{property.views} views</span>
              <span>{property.enquiries} enquiries</span>
              <span>{property.daysOnMarket} days</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Link to={`/property/${property.id}`}>
            <Button size="sm">
              <Eye className="h-3 w-3 mr-1" />
              View
            </Button>
          </Link>
          <Button variant="outline" size="sm">
            <Edit className="h-3 w-3" />
          </Button>
          <Button variant="outline" size="sm">
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};

// Helper function for status colors
const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800';
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'sold': return 'bg-blue-100 text-blue-800';
    case 'rented': return 'bg-purple-100 text-purple-800';
    case 'draft': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default Dashboard;