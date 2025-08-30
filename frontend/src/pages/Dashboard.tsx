import * as React from 'react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, CardBadge, CardStats } from '../components/ui/Card';
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
        <div className="container-responsive component-spacing">
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

      <div className="container-responsive section-spacing">
        {/* Stats Cards */}
        <div className="grid-dashboard-stats mb-8">
          <Card variant="elevated" size="md" interactive>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <CardDescription className="text-sm font-medium text-gray-600 mb-1">
                    Total Properties
                  </CardDescription>
                  <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
                    {stats.totalProperties}
                  </CardTitle>
                  <CardBadge variant="secondary" size="sm">
                    {stats.activeListings} active listings
                  </CardBadge>
                </div>
                <div className="bg-blue-100 rounded-full p-3 flex-shrink-0 ml-4">
                  <Home className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="elevated" size="md" interactive>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <CardDescription className="text-sm font-medium text-gray-600 mb-1">
                    Total Views
                  </CardDescription>
                  <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
                    {stats.totalViews.toLocaleString()}
                  </CardTitle>
                  <CardBadge variant="success" size="sm">
                    +{stats.viewsChange}% from last month
                  </CardBadge>
                </div>
                <div className="bg-green-100 rounded-full p-3 flex-shrink-0 ml-4">
                  <Eye className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="elevated" size="md" interactive>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <CardDescription className="text-sm font-medium text-gray-600 mb-1">
                    Total Enquiries
                  </CardDescription>
                  <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
                    {stats.totalEnquiries}
                  </CardTitle>
                  <CardBadge variant="destructive" size="sm">
                    {stats.enquiriesChange}% from last month
                  </CardBadge>
                </div>
                <div className="bg-yellow-100 rounded-full p-3 flex-shrink-0 ml-4">
                  <MessageSquare className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="elevated" size="md" interactive>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <CardDescription className="text-sm font-medium text-gray-600 mb-1">
                    Monthly Revenue
                  </CardDescription>
                  <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
                    £{stats.monthlyRevenue.toLocaleString()}
                  </CardTitle>
                  <CardBadge variant="success" size="sm">
                    +{stats.revenueChange}% from last month
                  </CardBadge>
                </div>
                <div className="bg-purple-100 rounded-full p-3 flex-shrink-0 ml-4">
                  <PoundSterling className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Properties Section */}
            <Card variant="outlined" size="lg">
              <CardHeader className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-gray-900">My Properties</CardTitle>
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
                        variant={viewMode === 'grid' ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('grid')}
                      >
                        <Grid className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={viewMode === 'list' ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('list')}
                      >
                        <List className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                {viewMode === 'grid' ? (
                  <div className="grid-listing-cards">
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
              </CardContent>
            </Card>

            {/* Performance Chart */}
            <Card variant="outlined" size="lg">
              <CardHeader className="p-6 pb-4">
                <CardTitle className="text-lg font-semibold">Performance Overview</CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100">
                  <div className="text-center text-gray-600">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="font-medium">Performance charts coming soon</p>
                    <p className="text-sm">Views, enquiries, and revenue trends</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card variant="outlined" size="md">
              <CardHeader className="p-6 pb-4">
                <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6">
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
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card variant="outlined" size="md">
              <CardHeader className="p-6 pb-4">
                <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="px-6">
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
              </CardContent>
              <CardFooter className="px-6 pb-6 pt-4">
                <Link to="/activity" className="text-sm text-blue-600 hover:text-blue-800 flex items-center">
                  View all activity
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </CardFooter>
            </Card>

            {/* Upcoming Tasks */}
            <Card variant="outlined" size="md">
              <CardHeader className="p-6 pb-4">
                <CardTitle className="text-lg font-semibold">Upcoming Tasks</CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <div className="space-y-3">
                  <Card variant="ghost" size="sm" className="bg-yellow-50 border-yellow-200">
                    <CardContent className="p-3">
                      <div className="flex items-center space-x-3">
                        <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">Property inspection due</p>
                          <p className="text-xs text-gray-600">Modern 2-Bed Apartment - Tomorrow</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card variant="ghost" size="sm" className="bg-blue-50 border-blue-200">
                    <CardContent className="p-3">
                      <div className="flex items-center space-x-3">
                        <Calendar className="h-5 w-5 text-blue-600 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">Client viewing</p>
                          <p className="text-xs text-gray-600">Victorian Terrace - Friday 2PM</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card variant="ghost" size="sm" className="bg-green-50 border-green-200">
                    <CardContent className="p-3">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">Contract review</p>
                          <p className="text-xs text-gray-600">Luxury Penthouse - Next week</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

// Property Card Component
const PropertyCard: React.FC<{ property: Property }> = ({ property }) => {
  return (
    <Card variant="outlined" size="md" interactive className="overflow-hidden group">
      <div className="relative">
        <img
          src={property.image}
          alt={property.title}
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3">
          <CardBadge 
            variant={property.status === 'active' ? 'success' : property.status === 'pending' ? 'warning' : 'secondary'}
            size="sm"
          >
            {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
          </CardBadge>
        </div>
        <div className="absolute top-3 right-3">
          <CardBadge 
            variant={property.type === 'sale' ? 'success' : 'info'}
            size="sm"
          >
            For {property.type === 'sale' ? 'Sale' : 'Rent'}
          </CardBadge>
        </div>
      </div>
      
      <CardContent className="p-4">
        <CardTitle className="text-lg font-semibold text-gray-900 mb-1 truncate">
          {property.title}
        </CardTitle>
        <CardDescription className="text-gray-600 text-sm mb-3 flex items-center">
          <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
          {property.location}
        </CardDescription>
        
        <div className="mb-4">
          <span className="text-xl font-bold text-gray-900">
            £{property.price.toLocaleString()}
            {property.type === 'rent' && <span className="text-sm text-gray-600 font-normal">/month</span>}
          </span>
        </div>
        
        <div className="grid grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
          <div className="flex items-center justify-center">
            <Bed className="h-4 w-4 mr-1" />
            <span>{property.bedrooms}</span>
          </div>
          <div className="flex items-center justify-center">
            <Bath className="h-4 w-4 mr-1" />
            <span>{property.bathrooms}</span>
          </div>
          <div className="flex items-center justify-center">
            <Square className="h-4 w-4 mr-1" />
            <span>{property.sqft}</span>
          </div>
        </div>
        
        <CardStats className="grid grid-cols-3 gap-2 text-xs text-gray-500 mb-4">
          <div className="text-center">
            <div className="font-medium">{property.views}</div>
            <div>views</div>
          </div>
          <div className="text-center">
            <div className="font-medium">{property.enquiries}</div>
            <div>enquiries</div>
          </div>
          <div className="text-center">
            <div className="font-medium">{property.daysOnMarket}</div>
            <div>days</div>
          </div>
        </CardStats>
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        <div className="flex space-x-2 w-full">
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
      </CardFooter>
    </Card>
  );
};

// Property List Item Component
const PropertyListItem: React.FC<{ property: Property }> = ({ property }) => {
  return (
    <Card variant="outlined" size="sm" interactive>
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          <div className="relative flex-shrink-0">
            <img
              src={property.image}
              alt={property.title}
              className="w-20 h-16 object-cover rounded-lg"
            />
            <div className="absolute -top-1 -right-1">
              <CardBadge 
                variant={property.status === 'active' ? 'success' : property.status === 'pending' ? 'warning' : 'secondary'}
                size="xs"
              >
                {property.status}
              </CardBadge>
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0 mr-4">
                <CardTitle className="text-base font-semibold text-gray-900 truncate mb-1">
                  {property.title}
                </CardTitle>
                <CardDescription className="text-gray-600 text-sm flex items-center">
                  <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                  {property.location}
                </CardDescription>
              </div>
              <div className="text-right flex-shrink-0">
                <span className="text-lg font-bold text-gray-900">
                  £{property.price.toLocaleString()}
                  {property.type === 'rent' && <span className="text-sm text-gray-600 font-normal">/month</span>}
                </span>
                <CardBadge 
                  variant={property.type === 'sale' ? 'success' : 'info'}
                  size="xs"
                  className="ml-2"
                >
                  {property.type === 'sale' ? 'Sale' : 'Rent'}
                </CardBadge>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm text-gray-600">
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
              
              <CardStats className="flex items-center space-x-3 text-xs text-gray-500">
                <span>{property.views} views</span>
                <span>{property.enquiries} enquiries</span>
                <span>{property.daysOnMarket} days</span>
              </CardStats>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 flex-shrink-0">
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
      </CardContent>
    </Card>
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