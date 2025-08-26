import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Users,
  TrendingUp,
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
  Video
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuthStore } from '../../stores/authStore';
import { showToast } from '../../components/ui/Toast';

interface DashboardStats {
  totalProperties: number;
  activeListings: number;
  totalClients: number;
  monthlyCommission: number;
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
  const [activeTab, setActiveTab] = useState<'overview' | 'properties' | 'clients' | 'viewings' | 'analytics' | 'performance'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

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
          properties: 3
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
          properties: 5
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

  const formatCurrency = (amount: number, type: 'sale' | 'rent') => {
    if (type === 'rent') {
      return `£${amount.toLocaleString()}/month`;
    }
    return `£${amount.toLocaleString()}`;
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
          Here's what's happening with your properties and clients today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Properties</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProperties}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Home className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Listings</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeListings}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Clients</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalClients}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Banknote className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Monthly Commission</p>
                <p className="text-2xl font-bold text-gray-900">£{stats.monthlyCommission.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Calendar className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Viewings Scheduled</p>
                <p className="text-2xl font-bold text-gray-900">{stats.viewingsScheduled}</p>
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
                <p className="text-sm font-medium text-gray-600">Pending Offers</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingOffers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: TrendingUp },
            { id: 'properties', label: 'Properties', icon: Building2 },
            { id: 'clients', label: 'Clients', icon: Users },
            { id: 'viewings', label: 'Viewings', icon: Calendar },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'performance', label: 'Performance', icon: Target }
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
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Link to="/maintenance" className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="text-center">
                    <Wrench className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <span className="text-sm font-medium text-gray-900">Maintenance</span>
                    <ExternalLink className="h-3 w-3 text-gray-400 ml-1 inline" />
                  </div>
                </Link>
                <Link to="/communications" className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="text-center">
                    <MessageSquare className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <span className="text-sm font-medium text-gray-900">Communications</span>
                    <ExternalLink className="h-3 w-3 text-gray-400 ml-1 inline" />
                  </div>
                </Link>
                <Link to="/finances" className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="text-center">
                    <Banknote className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <span className="text-sm font-medium text-gray-900">Financial Reports</span>
                    <ExternalLink className="h-3 w-3 text-gray-400 ml-1 inline" />
                  </div>
                </Link>
                <button className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="text-center">
                    <Plus className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                    <span className="text-sm font-medium text-gray-900">Add Property</span>
                  </div>
                </button>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Properties */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Recent Properties</span>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Property
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
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
                            {formatCurrency(property.price, property.type)}
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
              <CardHeader>
                <CardTitle>Upcoming Viewings</CardTitle>
              </CardHeader>
              <CardContent>
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
                      {formatCurrency(property.price, property.type)}
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
          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Target className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Monthly Target</p>
                    <p className="text-2xl font-bold text-gray-900">£{stats.monthlyTarget.toLocaleString()}</p>
                    <p className="text-sm text-green-600">{stats.achievementRate}% achieved</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Award className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Sales</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalSales}</p>
                    <p className="text-sm text-blue-600">This month</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.conversionRate}%</p>
                    <p className="text-sm text-purple-600">+2.3% from last month</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Star className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Client Satisfaction</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.clientSatisfaction}/5</p>
                    <p className="text-sm text-yellow-600">Based on 45 reviews</p>
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