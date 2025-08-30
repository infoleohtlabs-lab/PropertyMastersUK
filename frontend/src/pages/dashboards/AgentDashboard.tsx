import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Users,
  TrendingUp,
  TrendingDown,
  Calendar,
  MessageSquare,
  FileText,
  Eye,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Phone,
  Mail,
  MapPin,
  Star,
  Clock,
  Banknote,
  Home,
  UserCheck,
  ExternalLink,
  Wrench,
  BarChart3,
  Target,
  Award,
  Download,
  Upload,
  Edit,
  Trash2,
  Camera,
  Video,
  Bell,
  CheckCircle,
  AlertCircle,
  PoundSterling,
  PieChart,
  Activity,
  CalendarDays,
  UserPlus,
  PhoneCall,
  Send,
  ArrowUpRight,
  ArrowDownRight,
  Percent
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuthStore } from '../../stores/authStore';
import { showToast } from '../../components/ui/Toast';
import { formatCurrency } from '../../utils';

interface DashboardStats {
  totalProperties: number;
  activeListings: number;
  totalClients: number;
  monthlyCommission: number;
  totalCommission: number;
  viewingsScheduled: number;
  pendingOffers: number;
  monthlyTarget: number;
  achievementRate: number;
  averagePropertyValue: number;
  totalSales: number;
  conversionRate: number;
  clientSatisfaction: number;
}

interface Property {
  id: string;
  title: string;
  address: string;
  price: number;
  type: 'sale' | 'rent';
  status: 'available' | 'under_offer' | 'sold' | 'let';
  bedrooms: number;
  bathrooms: number;
  views: number;
  inquiries: number;
  dateAdded: string;
  images: string[];
}

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: 'buyer' | 'seller' | 'landlord' | 'tenant';
  status: 'active' | 'inactive' | 'prospect';
  lastContact: string;
  totalValue: number;
  properties: number;
  nextFollowUp?: string;
  communicationHistory: number;
}

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: 'website' | 'referral' | 'social' | 'advertising';
  stage: 'new' | 'contacted' | 'qualified' | 'viewing' | 'offer' | 'closed';
  value: number;
  dateCreated: string;
  lastActivity: string;
  notes: string;
}

interface Communication {
  id: string;
  clientId: string;
  type: 'call' | 'email' | 'meeting' | 'message';
  subject: string;
  date: string;
  status: 'completed' | 'scheduled' | 'pending';
  notes?: string;
}

interface Viewing {
  id: string;
  propertyTitle: string;
  clientName: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  type: 'physical' | 'virtual';
}

const AgentDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats>({
    totalProperties: 0,
    activeListings: 0,
    totalClients: 0,
    monthlyCommission: 0,
    totalCommission: 0,
    viewingsScheduled: 0,
    pendingOffers: 0,
    monthlyTarget: 0,
    achievementRate: 0,
    averagePropertyValue: 0,
    totalSales: 0,
    conversionRate: 0,
    clientSatisfaction: 0
  });
  const [properties, setProperties] = useState<Property[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [viewings, setViewings] = useState<Viewing[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'properties' | 'clients' | 'viewings' | 'analytics' | 'performance' | 'leads' | 'calendar'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedDateRange, setSelectedDateRange] = useState('30d');
  const [leadPipelineView, setLeadPipelineView] = useState('kanban');
  const [analyticsView, setAnalyticsView] = useState('overview');
  const [communicationFilter, setCommunicationFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API calls
      setStats({
        totalProperties: 45,
        activeListings: 38,
        totalClients: 127,
        monthlyCommission: 15750,
        totalCommission: 45200,
        viewingsScheduled: 12,
        pendingOffers: 8,
        monthlyTarget: 20000,
        achievementRate: 78.75,
        averagePropertyValue: 485000,
        totalSales: 12,
        conversionRate: 24.5,
        clientSatisfaction: 4.8
      });

      setProperties([
        {
          id: '1',
          title: 'Modern 3-Bed House in Hampstead',
          address: '15 Elm Grove, Hampstead, London NW3',
          price: 1250000,
          type: 'sale',
          status: 'available',
          bedrooms: 3,
          bathrooms: 2,
          views: 245,
          inquiries: 18,
          dateAdded: '2024-01-15',
          images: ['https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20three%20bedroom%20house%20hampstead%20london%20exterior%20victorian%20architecture&image_size=landscape_4_3']
        },
        {
          id: '2',
          title: 'Luxury 2-Bed Apartment in Canary Wharf',
          address: '42 Marsh Wall, Canary Wharf, London E14',
          price: 3500,
          type: 'rent',
          status: 'under_offer',
          bedrooms: 2,
          bathrooms: 2,
          views: 189,
          inquiries: 24,
          dateAdded: '2024-01-10',
          images: ['https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=luxury%20apartment%20canary%20wharf%20london%20modern%20interior%20city%20views&image_size=landscape_4_3']
        }
      ]);

      setClients([
        {
          id: '1',
          name: 'Sarah Johnson',
          email: 'sarah.johnson@email.com',
          phone: '+44 7700 900123',
          type: 'buyer',
          status: 'active',
          lastContact: '2024-01-20',
          totalValue: 850000,
          properties: 3,
          nextFollowUp: '2024-01-25',
          communicationHistory: 12
        },
        {
          id: '2',
          name: 'Michael Chen',
          email: 'michael.chen@email.com',
          phone: '+44 7700 900456',
          type: 'landlord',
          status: 'active',
          lastContact: '2024-01-18',
          totalValue: 2100000,
          properties: 5,
          nextFollowUp: '2024-01-22',
          communicationHistory: 28
        }
      ]);

      setLeads([
        {
          id: '1',
          name: 'Emma Wilson',
          email: 'emma.wilson@email.com',
          phone: '+44 7700 900789',
          source: 'website',
          stage: 'qualified',
          value: 750000,
          dateCreated: '2024-01-15',
          lastActivity: '2024-01-20',
          notes: 'Interested in 3-bed properties in North London'
        },
        {
          id: '2',
          name: 'James Brown',
          email: 'james.brown@email.com',
          phone: '+44 7700 900321',
          source: 'referral',
          stage: 'viewing',
          value: 1200000,
          dateCreated: '2024-01-10',
          lastActivity: '2024-01-19',
          notes: 'Looking for luxury apartment in Central London'
        }
      ]);

      setCommunications([
        {
          id: '1',
          clientId: '1',
          type: 'call',
          subject: 'Property viewing follow-up',
          date: '2024-01-20',
          status: 'completed',
          notes: 'Discussed property details and next steps'
        },
        {
          id: '2',
          clientId: '2',
          type: 'email',
          subject: 'Market update and new listings',
          date: '2024-01-22',
          status: 'scheduled'
        }
      ]);

      setViewings([
        {
          id: '1',
          propertyTitle: 'Modern 3-Bed House in Hampstead',
          clientName: 'Sarah Johnson',
          date: '2024-01-25',
          time: '14:00',
          status: 'scheduled',
          type: 'physical'
        },
        {
          id: '2',
          propertyTitle: 'Luxury 2-Bed Apartment in Canary Wharf',
          clientName: 'David Wilson',
          date: '2024-01-25',
          time: '16:30',
          status: 'scheduled',
          type: 'virtual'
        }
      ]);
    } catch (error) {
      showToast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'text-green-600 bg-green-100';
      case 'under_offer': return 'text-orange-600 bg-orange-100';
      case 'sold': return 'text-blue-600 bg-blue-100';
      case 'let': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatCurrencyWithType = (amount: number, type: 'sale' | 'rent') => {
    if (type === 'rent') {
      return `${formatCurrency(amount)}/month`;
    }
    return formatCurrency(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
      {/* Header */}
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-gray-600 mt-2 text-sm lg:text-base">
          Here's what's happening with your properties and clients today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 lg:gap-6 mb-6 lg:mb-8">
        <Card>
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building2 className="h-5 w-5 lg:h-6 lg:w-6 text-blue-600" />
              </div>
              <div className="ml-3 lg:ml-4">
                <p className="text-xs lg:text-sm font-medium text-gray-600">Total Properties</p>
                <p className="text-xl lg:text-2xl font-bold text-gray-900">{stats.totalProperties}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Home className="h-5 w-5 lg:h-6 lg:w-6 text-green-600" />
              </div>
              <div className="ml-3 lg:ml-4">
                <p className="text-xs lg:text-sm font-medium text-gray-600">Active Listings</p>
                <p className="text-xl lg:text-2xl font-bold text-gray-900">{stats.activeListings}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-5 w-5 lg:h-6 lg:w-6 text-purple-600" />
              </div>
              <div className="ml-3 lg:ml-4">
                <p className="text-xs lg:text-sm font-medium text-gray-600">Total Clients</p>
                <p className="text-xl lg:text-2xl font-bold text-gray-900">{stats.totalClients}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Banknote className="h-5 w-5 lg:h-6 lg:w-6 text-yellow-600" />
              </div>
              <div className="ml-3 lg:ml-4">
                <p className="text-xs lg:text-sm font-medium text-gray-600">Monthly Commission</p>
                <p className="text-xl lg:text-2xl font-bold text-gray-900">£{stats.monthlyCommission.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Calendar className="h-5 w-5 lg:h-6 lg:w-6 text-indigo-600" />
              </div>
              <div className="ml-3 lg:ml-4">
                <p className="text-xs lg:text-sm font-medium text-gray-600">Viewings Scheduled</p>
                <p className="text-xl lg:text-2xl font-bold text-gray-900">{stats.viewingsScheduled}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingUp className="h-5 w-5 lg:h-6 lg:w-6 text-orange-600" />
              </div>
              <div className="ml-3 lg:ml-4">
                <p className="text-xs lg:text-sm font-medium text-gray-600">Pending Offers</p>
                <p className="text-xl lg:text-2xl font-bold text-gray-900">{stats.pendingOffers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex flex-wrap gap-2 lg:gap-0 lg:space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: TrendingUp },
            { id: 'properties', label: 'Properties', icon: Building2 },
            { id: 'clients', label: 'Clients', icon: Users },
            { id: 'leads', label: 'Leads', icon: UserPlus },
            { id: 'viewings', label: 'Viewings', icon: Calendar },
            { id: 'calendar', label: 'Calendar', icon: CalendarDays },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'performance', label: 'Performance', icon: Target }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center py-2 px-2 lg:px-1 border-b-2 font-medium text-xs lg:text-sm transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.slice(0, 4)}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3 lg:pb-6">
              <CardTitle className="text-base lg:text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                <Link to="/maintenance" className="flex items-center justify-center p-3 lg:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="text-center">
                    <Wrench className="h-6 w-6 lg:h-8 lg:w-8 text-blue-600 mx-auto mb-2" />
                    <span className="text-xs lg:text-sm font-medium text-gray-900">Maintenance</span>
                    <ExternalLink className="h-3 w-3 text-gray-400 ml-1 inline" />
                  </div>
                </Link>
                <Link to="/communications" className="flex items-center justify-center p-3 lg:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="text-center">
                    <MessageSquare className="h-6 w-6 lg:h-8 lg:w-8 text-green-600 mx-auto mb-2" />
                    <span className="text-xs lg:text-sm font-medium text-gray-900">Communications</span>
                    <ExternalLink className="h-3 w-3 text-gray-400 ml-1 inline" />
                  </div>
                </Link>
                <Link to="/finances" className="flex items-center justify-center p-3 lg:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="text-center">
                    <Banknote className="h-6 w-6 lg:h-8 lg:w-8 text-purple-600 mx-auto mb-2" />
                    <span className="text-xs lg:text-sm font-medium text-gray-900">Financial Reports</span>
                    <ExternalLink className="h-3 w-3 text-gray-400 ml-1 inline" />
                  </div>
                </Link>
                <button className="flex items-center justify-center p-3 lg:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="text-center">
                    <Plus className="h-6 w-6 lg:h-8 lg:w-8 text-gray-600 mx-auto mb-2" />
                    <span className="text-xs lg:text-sm font-medium text-gray-900">Add Property</span>
                  </div>
                </button>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            {/* Recent Properties */}
            <Card>
              <CardHeader className="pb-3 lg:pb-6">
                <CardTitle className="flex items-center justify-between text-base lg:text-lg">
                  <span>Recent Properties</span>
                  <Button variant="outline" size="sm" className="text-xs lg:text-sm">
                    <Plus className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
                    <span className="hidden sm:inline">Add Property</span>
                    <span className="sm:hidden">Add</span>
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-4">
                  {properties.slice(0, 3).map((property) => (
                    <div key={property.id} className="flex items-center space-x-4 p-3 border rounded-lg">
                      <img
                        src={property.images[0]}
                        alt={property.title}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{property.title}</h4>
                        <p className="text-sm text-gray-600">{property.address}</p>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-sm font-medium text-blue-600">
                          {formatCurrencyWithType(property.price, property.type)}
                        </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(property.status)}`}>
                            {property.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">{property.views} views</p>
                        <p className="text-sm text-gray-600">{property.inquiries} inquiries</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Viewings */}
            <Card>
              <CardHeader className="pb-3 lg:pb-6">
                <CardTitle className="text-base lg:text-lg">Upcoming Viewings</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-4">
                  {viewings.slice(0, 3).map((viewing) => (
                    <div key={viewing.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">{viewing.propertyTitle}</h4>
                        <p className="text-sm text-gray-600">{viewing.clientName}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {new Date(viewing.date).toLocaleDateString()} at {viewing.time}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            viewing.type === 'virtual' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                          }`}>
                            {viewing.type}
                          </span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'properties' && (
        <div>
          {/* Properties Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Input
                placeholder="Search properties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<Search className="h-4 w-4" />}
                className="w-64"
              />
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Property
            </Button>
          </div>

          {/* Properties Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <Card key={property.id} className="overflow-hidden">
                <div className="aspect-w-16 aspect-h-9">
                  <img
                    src={property.images[0]}
                    alt={property.title}
                    className="w-full h-48 object-cover"
                  />
                </div>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 text-lg">{property.title}</h3>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{property.address}</p>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xl font-bold text-blue-600">
                      {formatCurrencyWithType(property.price, property.type)}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(property.status)}`}>
                      {property.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>{property.bedrooms} bed • {property.bathrooms} bath</span>
                    <div className="flex items-center space-x-3">
                      <span>{property.views} views</span>
                      <span>{property.inquiries} inquiries</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'clients' && (
        <div>
          {/* Clients Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Input
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<Search className="h-4 w-4" />}
                className="w-64"
              />
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Client
            </Button>
          </div>

          {/* Clients List */}
          <div className="bg-white rounded-lg border">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Value
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Properties
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Contact
                    </th>
                    <th className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {clients.map((client) => (
                    <tr key={client.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <UserCheck className="h-5 w-5 text-gray-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{client.name}</div>
                            <div className="text-sm text-gray-500">{client.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="capitalize text-sm text-gray-900">{client.type}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          client.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {client.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        £{client.totalValue.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {client.properties}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(client.lastContact).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Phone className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Mail className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'viewings' && (
        <div>
          {/* Viewings Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Input
                placeholder="Search viewings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<Search className="h-4 w-4" />}
                className="w-64"
              />
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Schedule Viewing
            </Button>
          </div>

          {/* Viewings Calendar/List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {viewings.map((viewing) => (
              <Card key={viewing.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">{viewing.propertyTitle}</h3>
                      <p className="text-gray-600">{viewing.clientName}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      viewing.type === 'virtual' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                    }`}>
                      {viewing.type}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(viewing.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {viewing.time}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      viewing.status === 'scheduled' ? 'bg-yellow-100 text-yellow-600' :
                      viewing.status === 'completed' ? 'bg-green-100 text-green-600' :
                      'bg-red-100 text-red-600'
                    }`}>
                      {viewing.status}
                    </span>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Analytics Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
            <div className="flex space-x-2">
              <select 
                value={selectedDateRange} 
                onChange={(e) => setSelectedDateRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>

          {/* Analytics Navigation */}
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => setAnalyticsView('overview')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                analyticsView === 'overview' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setAnalyticsView('performance')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                analyticsView === 'performance' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Performance
            </button>
            <button
              onClick={() => setAnalyticsView('market')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                analyticsView === 'market' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Market Insights
            </button>
            <button
              onClick={() => setAnalyticsView('forecasting')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                analyticsView === 'forecasting' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Forecasting
            </button>
          </div>

          {/* Enhanced Performance Metrics */}
          {analyticsView === 'overview' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Monthly Target</p>
                    <p className="text-2xl font-bold text-gray-900">£{stats.monthlyTarget.toLocaleString()}</p>
                    <div className="flex items-center mt-1">
                      <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                      <p className="text-sm text-green-600">{stats.achievementRate}% achieved</p>
                    </div>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Target className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Commission</p>
                    <p className="text-2xl font-bold text-gray-900">£{stats.totalCommission.toLocaleString()}</p>
                    <div className="flex items-center mt-1">
                      <TrendingUp className="h-4 w-4 text-blue-600 mr-1" />
                      <p className="text-sm text-blue-600">+12.5% this month</p>
                    </div>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <PoundSterling className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.conversionRate}%</p>
                    <div className="flex items-center mt-1">
                      <TrendingUp className="h-4 w-4 text-purple-600 mr-1" />
                      <p className="text-sm text-purple-600">+2.3% from last month</p>
                    </div>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Response Time</p>
                    <p className="text-2xl font-bold text-gray-900">1.8h</p>
                    <div className="flex items-center mt-1">
                      <TrendingDown className="h-4 w-4 text-green-600 mr-1" />
                      <p className="text-sm text-green-600">-0.5h improvement</p>
                    </div>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <Clock className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts and Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Sales Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">Sales chart visualization</p>
                    <p className="text-sm text-gray-500">Monthly sales trends and targets</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Property Types Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Houses</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{width: '65%'}}></div>
                      </div>
                      <span className="text-sm text-gray-600">65%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Apartments</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{width: '25%'}}></div>
                      </div>
                      <span className="text-sm text-gray-600">25%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Commercial</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-600 h-2 rounded-full" style={{width: '10%'}}></div>
                      </div>
                      <span className="text-sm text-gray-600">10%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Market Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Market Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">£{stats.averagePropertyValue.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Average Property Value</div>
                  <div className="text-xs text-green-600 mt-1">+5.2% from last quarter</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">28 days</div>
                  <div className="text-sm text-gray-600">Average Time on Market</div>
                  <div className="text-xs text-red-600 mt-1">+3 days from last month</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">94%</div>
                  <div className="text-sm text-gray-600">Asking Price Achieved</div>
                  <div className="text-xs text-green-600 mt-1">+1.2% from last month</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Real-time Activity Feed */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2 text-blue-600" />
                Real-time Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">New lead inquiry received</p>
                    <p className="text-xs text-gray-500">Sarah Johnson interested in 3-bed house in Hampstead</p>
                  </div>
                  <span className="text-xs text-gray-500">2 min ago</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Property viewing scheduled</p>
                    <p className="text-xs text-gray-500">Michael Chen - Tomorrow 2:00 PM</p>
                  </div>
                  <span className="text-xs text-gray-500">5 min ago</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Follow-up reminder</p>
                    <p className="text-xs text-gray-500">Contact Emma Wilson about offer feedback</p>
                  </div>
                  <span className="text-xs text-gray-500">10 min ago</span>
                </div>
              </div>
            </CardContent>
          </Card>
            </>
          )}

          {/* Performance Analytics View */}
          {analyticsView === 'performance' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                      Sales Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">This Month</span>
                        <span className="text-lg font-bold text-green-600">£{stats.monthlyCommission.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Last Month</span>
                        <span className="text-lg font-bold text-gray-900">£{(stats.monthlyCommission * 0.85).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Growth</span>
                        <span className="text-lg font-bold text-green-600">+17.6%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="h-5 w-5 mr-2 text-blue-600" />
                      Client Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Active Clients</span>
                        <span className="text-lg font-bold text-blue-600">{stats.totalClients}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">New This Month</span>
                        <span className="text-lg font-bold text-gray-900">12</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Satisfaction</span>
                        <span className="text-lg font-bold text-yellow-600">{stats.clientSatisfaction}/5.0</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Target className="h-5 w-5 mr-2 text-purple-600" />
                      Goal Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Monthly Target</span>
                          <span>{stats.achievementRate}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-purple-600 h-2 rounded-full" style={{width: `${stats.achievementRate}%`}}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Annual Target</span>
                          <span>65%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{width: '65%'}}></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Performance Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Monthly Performance Trend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600">Performance trend chart</p>
                        <p className="text-sm text-gray-500">Commission and sales over time</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Lead Conversion Funnel</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Leads Generated</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 bg-gray-200 rounded-full h-3">
                            <div className="bg-blue-600 h-3 rounded-full" style={{width: '100%'}}></div>
                          </div>
                          <span className="text-sm text-gray-600">156</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Qualified</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 bg-gray-200 rounded-full h-3">
                            <div className="bg-green-600 h-3 rounded-full" style={{width: '75%'}}></div>
                          </div>
                          <span className="text-sm text-gray-600">117</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Viewings</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 bg-gray-200 rounded-full h-3">
                            <div className="bg-yellow-600 h-3 rounded-full" style={{width: '45%'}}></div>
                          </div>
                          <span className="text-sm text-gray-600">70</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Offers</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 bg-gray-200 rounded-full h-3">
                            <div className="bg-orange-600 h-3 rounded-full" style={{width: '30%'}}></div>
                          </div>
                          <span className="text-sm text-gray-600">47</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Closed</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 bg-gray-200 rounded-full h-3">
                            <div className="bg-purple-600 h-3 rounded-full" style={{width: '25%'}}></div>
                          </div>
                          <span className="text-sm text-gray-600">38</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Market Insights View */}
          {analyticsView === 'market' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Home className="h-5 w-5 mr-2 text-blue-600" />
                      Market Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Avg. Property Value</span>
                        <span className="font-medium">£{stats.averagePropertyValue.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Market Growth</span>
                        <span className="font-medium text-green-600">+5.2%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Days on Market</span>
                        <span className="font-medium">28 days</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <MapPin className="h-5 w-5 mr-2 text-green-600" />
                      Area Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Hampstead</span>
                        <span className="font-medium text-green-600">+8.1%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Canary Wharf</span>
                        <span className="font-medium text-blue-600">+3.4%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Kensington</span>
                        <span className="font-medium text-purple-600">+6.7%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2 text-purple-600" />
                      Price Trends
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">1-Bed Flats</span>
                        <span className="font-medium">£425k</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">2-Bed Houses</span>
                        <span className="font-medium">£675k</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">3-Bed Houses</span>
                        <span className="font-medium">£950k</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Market Analysis Charts */}
              <Card>
                <CardHeader>
                  <CardTitle>Market Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">Market trends visualization</p>
                      <p className="text-sm text-gray-500">Price movements and market indicators</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Forecasting View */}
          {analyticsView === 'forecasting' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Target className="h-5 w-5 mr-2 text-blue-600" />
                      Revenue Forecast
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Next Month</span>
                        <span className="text-lg font-bold text-blue-600">£18,500</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Next Quarter</span>
                        <span className="text-lg font-bold text-green-600">£52,000</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Annual Projection</span>
                        <span className="text-lg font-bold text-purple-600">£195,000</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                      Growth Predictions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Client Growth</span>
                        <span className="text-lg font-bold text-green-600">+15%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Market Share</span>
                        <span className="text-lg font-bold text-blue-600">+8%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Commission Rate</span>
                        <span className="text-lg font-bold text-purple-600">+12%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Forecasting Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>12-Month Revenue Forecast</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">Revenue forecasting chart</p>
                      <p className="text-sm text-gray-500">Projected earnings and growth trends</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

      {activeTab === 'leads' && (
        <div className="space-y-6">
          {/* Lead Pipeline Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-blue-600" />
                  Lead Pipeline Overview
                </div>
                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    variant={leadPipelineView === 'kanban' ? 'primary' : 'outline'}
                    onClick={() => setLeadPipelineView('kanban')}
                  >
                    <LayoutGrid className="h-4 w-4 mr-1" />
                    Kanban
                  </Button>
                  <Button 
                    size="sm" 
                    variant={leadPipelineView === 'list' ? 'primary' : 'outline'}
                    onClick={() => setLeadPipelineView('list')}
                  >
                    <List className="h-4 w-4 mr-1" />
                    List
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                {[
                  { stage: 'new', count: 8, color: 'bg-gray-100 text-gray-800', trend: '+2 this week' },
                  { stage: 'contacted', count: 12, color: 'bg-blue-100 text-blue-800', trend: '75% response rate' },
                  { stage: 'qualified', count: 6, color: 'bg-yellow-100 text-yellow-800', trend: '50% conversion' },
                  { stage: 'viewing', count: 4, color: 'bg-purple-100 text-purple-800', trend: '67% from qualified' },
                  { stage: 'offer', count: 3, color: 'bg-orange-100 text-orange-800', trend: '75% from viewings' },
                  { stage: 'closed', count: 2, color: 'bg-green-100 text-green-800', trend: '67% close rate' }
                ].map((stage) => (
                  <Card key={stage.stage}>
                    <CardContent className="p-4 text-center">
                      <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${stage.color} mb-2`}>
                        {stage.stage.charAt(0).toUpperCase() + stage.stage.slice(1)}
                      </div>
                      <div className="text-2xl font-bold text-gray-900">{stage.count}</div>
                      <div className="text-sm text-gray-600">leads</div>
                      <div className="text-xs text-gray-500 mt-1">{stage.trend}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Lead Management - Kanban View */}
          {leadPipelineView === 'kanban' && (
            <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
              {/* New Leads Column */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">New (8)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-white border rounded-lg shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">Sarah Johnson</h4>
                      <span className="text-xs text-gray-500">2h ago</span>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">3-bed house in Hampstead</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">High Priority</span>
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                        <Phone className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="p-3 bg-white border rounded-lg shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">Michael Chen</h4>
                      <span className="text-xs text-gray-500">4h ago</span>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">2-bed flat in Canary Wharf</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Medium</span>
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                        <Mail className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contacted Column */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-blue-600">Contacted (12)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-white border rounded-lg shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">Emma Wilson</h4>
                      <span className="text-xs text-gray-500">1d ago</span>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">4-bed house in Kensington</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Responded</span>
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                        <MessageSquare className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Qualified Column */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-yellow-600">Qualified (6)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-white border rounded-lg shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">David Brown</h4>
                      <span className="text-xs text-gray-500">2d ago</span>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">3-bed townhouse in Chelsea</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Pre-approved</span>
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                        <Calendar className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Viewing Column */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-purple-600">Viewing (4)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-white border rounded-lg shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">Lisa Taylor</h4>
                      <span className="text-xs text-gray-500">Tomorrow 2PM</span>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">2-bed flat in Shoreditch</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">Confirmed</span>
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                        <MapPin className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Offer Column */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-orange-600">Offer (3)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-white border rounded-lg shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">James Miller</h4>
                      <span className="text-xs text-gray-500">3d ago</span>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">1-bed flat in Greenwich</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">£450k offer</span>
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                        <Clock className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Closed Column */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-green-600">Closed (2)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-white border rounded-lg shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">Robert Davis</h4>
                      <span className="text-xs text-gray-500">1w ago</span>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">Studio in King's Cross</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">£325k sold</span>
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                        <CheckCircle className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Lead Management - List View */}
          {leadPipelineView === 'list' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Lead Management</span>
                  <div className="flex space-x-2">
                    <Input placeholder="Search leads..." className="w-64" />
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Lead
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {leads.map((lead) => (
                    <div key={lead.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div>
                            <h4 className="font-medium text-gray-900">{lead.name}</h4>
                            <p className="text-sm text-gray-600">{lead.email} • {lead.phone}</p>
                          </div>
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                            lead.stage === 'new' ? 'bg-gray-100 text-gray-800' :
                            lead.stage === 'contacted' ? 'bg-blue-100 text-blue-800' :
                            lead.stage === 'qualified' ? 'bg-yellow-100 text-yellow-800' :
                            lead.stage === 'viewing' ? 'bg-purple-100 text-purple-800' :
                            lead.stage === 'offer' ? 'bg-orange-100 text-orange-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {lead.stage}
                          </div>
                        </div>
                        <div className="mt-2 text-sm text-gray-600">
                          <span className="font-medium">Value:</span> {formatCurrency(lead.value)} • 
                          <span className="font-medium">Source:</span> {lead.source} • 
                          <span className="font-medium">Last Activity:</span> {new Date(lead.lastActivity).toLocaleDateString()}
                        </div>
                        <div className="mt-1 text-sm text-gray-500">{lead.notes}</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Mail className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Calendar className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Lead Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                  Lead Source Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Website</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{width: '65%'}}></div>
                      </div>
                      <span className="text-sm text-gray-600">65%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Referrals</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{width: '25%'}}></div>
                      </div>
                      <span className="text-sm text-gray-600">25%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Social Media</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-600 h-2 rounded-full" style={{width: '10%'}}></div>
                      </div>
                      <span className="text-sm text-gray-600">10%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-orange-600" />
                  Response Time Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Average Response Time</span>
                    <span className="text-lg font-bold text-green-600">12 minutes</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">First Contact Rate</span>
                    <span className="text-lg font-bold text-blue-600">94%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Follow-up Rate</span>
                    <span className="text-lg font-bold text-purple-600">87%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Conversion Rate</span>
                    <span className="text-lg font-bold text-emerald-600">23%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'calendar' && (
        <div className="space-y-6">
          {/* Calendar Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Calendar & Appointments</h2>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Calendar className="h-4 w-4 mr-2" />
                Today
              </Button>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Schedule Viewing
              </Button>
            </div>
          </div>

          {/* Upcoming Appointments */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Today's Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 p-3 border-l-4 border-blue-500 bg-blue-50 rounded">
                    <div className="flex-shrink-0">
                      <Clock className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">Property Viewing</div>
                      <div className="text-sm text-gray-600">14:00 - Modern 3-Bed House in Hampstead</div>
                      <div className="text-xs text-gray-500">with Sarah Johnson</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 p-3 border-l-4 border-green-500 bg-green-50 rounded">
                    <div className="flex-shrink-0">
                      <PhoneCall className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">Client Call</div>
                      <div className="text-sm text-gray-600">16:30 - Follow-up with Michael Chen</div>
                      <div className="text-xs text-gray-500">Portfolio review discussion</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>This Week's Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total Appointments</span>
                    <span className="text-lg font-bold text-blue-600">18</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Property Viewings</span>
                    <span className="text-lg font-bold text-green-600">12</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Client Meetings</span>
                    <span className="text-lg font-bold text-purple-600">4</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Follow-up Calls</span>
                    <span className="text-lg font-bold text-orange-600">8</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Communication Tracking */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Communications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {communications.map((comm) => (
                  <div key={comm.id} className="flex items-center space-x-4 p-3 border rounded-lg">
                    <div className={`p-2 rounded-lg ${
                      comm.type === 'call' ? 'bg-blue-100' :
                      comm.type === 'email' ? 'bg-green-100' :
                      comm.type === 'meeting' ? 'bg-purple-100' :
                      'bg-gray-100'
                    }`}>
                      {comm.type === 'call' && <Phone className="h-4 w-4 text-blue-600" />}
                      {comm.type === 'email' && <Mail className="h-4 w-4 text-green-600" />}
                      {comm.type === 'meeting' && <Users className="h-4 w-4 text-purple-600" />}
                      {comm.type === 'message' && <MessageSquare className="h-4 w-4 text-gray-600" />}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">{comm.subject}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(comm.date).toLocaleDateString()} • 
                        {comm.status === 'completed' ? 'Completed' : comm.status === 'scheduled' ? 'Scheduled' : 'Pending'}
                      </div>
                      {comm.notes && <div className="text-xs text-gray-600 mt-1">{comm.notes}</div>}
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      comm.status === 'completed' ? 'bg-green-100 text-green-800' :
                      comm.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {comm.status}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'performance' && (
        <div className="space-y-6">
          {/* Performance Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="h-5 w-5 mr-2 text-yellow-600" />
                  Monthly Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Sales Target</span>
                    <span className="text-sm font-medium text-green-600">Achieved</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Client Satisfaction</span>
                    <span className="text-sm font-medium text-green-600">Exceeded</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Response Time</span>
                    <span className="text-sm font-medium text-yellow-600">Good</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Property Listings</span>
                    <span className="text-sm font-medium text-green-600">Exceeded</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                  Performance Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Sales Volume</span>
                    <span className="text-sm font-medium text-green-600">↑ 15%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Client Acquisition</span>
                    <span className="text-sm font-medium text-green-600">↑ 8%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Average Deal Size</span>
                    <span className="text-sm font-medium text-blue-600">↑ 12%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Conversion Rate</span>
                    <span className="text-sm font-medium text-green-600">↑ 5%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2 text-purple-600" />
                  Goals Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Monthly Sales</span>
                      <span>78%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{width: '78%'}}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>New Clients</span>
                      <span>92%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{width: '92%'}}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Property Listings</span>
                      <span>85%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{width: '85%'}}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Reports */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Performance Reports</span>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Button variant="outline" size="sm">
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div className="text-center">
                    <BarChart3 className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-sm font-medium">Monthly Performance</div>
                    <div className="text-xs text-gray-500">Detailed monthly analysis</div>
                  </div>
                </div>
                <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div className="text-center">
                    <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <div className="text-sm font-medium">Client Analysis</div>
                    <div className="text-xs text-gray-500">Client interaction metrics</div>
                  </div>
                </div>
                <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div className="text-center">
                    <Building2 className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <div className="text-sm font-medium">Property Performance</div>
                    <div className="text-xs text-gray-500">Listing and sales analysis</div>
                  </div>
                </div>
                <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div className="text-center">
                    <Banknote className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                    <div className="text-sm font-medium">Commission Report</div>
                    <div className="text-xs text-gray-500">Earnings and projections</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Performance Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-3 border rounded-lg">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Award className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">Monthly Sales Target Achieved</div>
                    <div className="text-xs text-gray-500">Exceeded target by 15% - £18,500 commission earned</div>
                  </div>
                  <div className="text-xs text-gray-500">2 hours ago</div>
                </div>
                <div className="flex items-center space-x-4 p-3 border rounded-lg">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Star className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">Client Satisfaction Rating</div>
                    <div className="text-xs text-gray-500">Received 5-star rating from Sarah Johnson for exceptional service</div>
                  </div>
                  <div className="text-xs text-gray-500">1 day ago</div>
                </div>
                <div className="flex items-center space-x-4 p-3 border rounded-lg">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">Performance Milestone</div>
                    <div className="text-xs text-gray-500">Reached 100 successful property transactions this year</div>
                  </div>
                  <div className="text-xs text-gray-500">3 days ago</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AgentDashboard;