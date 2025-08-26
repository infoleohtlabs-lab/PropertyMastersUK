import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Users,
  Banknote,
  TrendingUp,
  Wrench,
  FileText,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Home,
  CreditCard,
  Receipt,
  Settings,
  Bell,
  MapPin,
  Phone,
  Mail,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuthStore } from '../../stores/authStore';
import { showToast } from '../../components/ui/Toast';

interface LandlordStats {
  totalProperties: number;
  occupiedProperties: number;
  monthlyRental: number;
  totalTenants: number;
  pendingMaintenance: number;
  overdueRent: number;
  occupancyRate: number;
  monthlyExpenses: number;
}

interface Property {
  id: string;
  title: string;
  address: string;
  type: 'house' | 'apartment' | 'studio' | 'commercial';
  bedrooms: number;
  bathrooms: number;
  monthlyRent: number;
  tenant?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    leaseStart: string;
    leaseEnd: string;
    rentStatus: 'paid' | 'overdue' | 'pending';
  };
  status: 'occupied' | 'vacant' | 'maintenance';
  lastInspection: string;
  nextInspection: string;
  images: string[];
}

interface MaintenanceRequest {
  id: string;
  propertyId: string;
  propertyTitle: string;
  tenantName: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  category: 'plumbing' | 'electrical' | 'heating' | 'general' | 'emergency';
  reportedDate: string;
  estimatedCost: number;
  assignedTo?: string;
}

interface FinancialSummary {
  month: string;
  rental: number;
  expenses: number;
  maintenance: number;
  profit: number;
}

const LandlordDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<LandlordStats>({
    totalProperties: 0,
    occupiedProperties: 0,
    monthlyRental: 0,
    totalTenants: 0,
    pendingMaintenance: 0,
    overdueRent: 0,
    occupancyRate: 0,
    monthlyExpenses: 0
  });
  const [properties, setProperties] = useState<Property[]>([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([]);
  const [financialData, setFinancialData] = useState<FinancialSummary[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'properties' | 'tenants' | 'maintenance' | 'finances'>('overview');
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
        totalProperties: 12,
        occupiedProperties: 10,
        monthlyRental: 18500,
        totalTenants: 15,
        pendingMaintenance: 3,
        overdueRent: 2,
        occupancyRate: 83.3,
        monthlyExpenses: 4200
      });

      setProperties([
        {
          id: '1',
          title: 'Modern 2-Bed Apartment',
          address: '15 Oak Street, Manchester M1 2AB',
          type: 'apartment',
          bedrooms: 2,
          bathrooms: 1,
          monthlyRent: 1200,
          tenant: {
            id: 't1',
            name: 'Sarah Johnson',
            email: 'sarah.j@email.com',
            phone: '+44 7700 900123',
            leaseStart: '2023-06-01',
            leaseEnd: '2024-05-31',
            rentStatus: 'paid'
          },
          status: 'occupied',
          lastInspection: '2023-12-15',
          nextInspection: '2024-03-15',
          images: ['https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20two%20bedroom%20apartment%20interior%20manchester%20uk%20contemporary%20design&image_size=landscape_4_3']
        },
        {
          id: '2',
          title: 'Victorian Terraced House',
          address: '42 Elm Grove, Birmingham B15 3TG',
          type: 'house',
          bedrooms: 3,
          bathrooms: 2,
          monthlyRent: 1800,
          tenant: {
            id: 't2',
            name: 'Michael Chen',
            email: 'michael.chen@email.com',
            phone: '+44 7700 900456',
            leaseStart: '2023-09-01',
            leaseEnd: '2024-08-31',
            rentStatus: 'overdue'
          },
          status: 'occupied',
          lastInspection: '2023-11-20',
          nextInspection: '2024-02-20',
          images: ['https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=victorian%20terraced%20house%20birmingham%20uk%20traditional%20architecture%20red%20brick&image_size=landscape_4_3']
        },
        {
          id: '3',
          title: 'Studio Apartment',
          address: '8 City Centre Plaza, Leeds LS1 4AP',
          type: 'studio',
          bedrooms: 0,
          bathrooms: 1,
          monthlyRent: 850,
          status: 'vacant',
          lastInspection: '2024-01-10',
          nextInspection: '2024-04-10',
          images: ['https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20studio%20apartment%20leeds%20city%20centre%20compact%20design%20urban&image_size=landscape_4_3']
        }
      ]);

      setMaintenanceRequests([
        {
          id: 'm1',
          propertyId: '1',
          propertyTitle: 'Modern 2-Bed Apartment',
          tenantName: 'Sarah Johnson',
          title: 'Leaking Kitchen Tap',
          description: 'The kitchen tap has been dripping constantly for the past week.',
          priority: 'medium',
          status: 'pending',
          category: 'plumbing',
          reportedDate: '2024-01-20',
          estimatedCost: 150,
          assignedTo: 'John Smith Plumbing'
        },
        {
          id: 'm2',
          propertyId: '2',
          propertyTitle: 'Victorian Terraced House',
          tenantName: 'Michael Chen',
          title: 'Heating System Not Working',
          description: 'Central heating system stopped working yesterday evening.',
          priority: 'urgent',
          status: 'in_progress',
          category: 'heating',
          reportedDate: '2024-01-22',
          estimatedCost: 350,
          assignedTo: 'ABC Heating Services'
        }
      ]);

      setFinancialData([
        { month: 'Jan 2024', rental: 18500, expenses: 4200, maintenance: 800, profit: 13500 },
        { month: 'Dec 2023', rental: 18500, expenses: 3800, maintenance: 1200, profit: 13500 },
        { month: 'Nov 2023', rental: 17200, expenses: 4100, maintenance: 600, profit: 12500 },
        { month: 'Oct 2023', rental: 17200, expenses: 3900, maintenance: 900, profit: 12400 },
        { month: 'Sep 2023', rental: 16800, expenses: 4000, maintenance: 1100, profit: 11700 }
      ]);
    } catch (error) {
      showToast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'occupied': return 'text-green-600 bg-green-100';
      case 'vacant': return 'text-yellow-600 bg-yellow-100';
      case 'maintenance': return 'text-red-600 bg-red-100';
      case 'paid': return 'text-green-600 bg-green-100';
      case 'overdue': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'in_progress': return 'text-blue-600 bg-blue-100';
      case 'completed': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100';
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
          Manage your property portfolio and track your rental income.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-6 mb-8">
        <Card className="col-span-2">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Properties</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProperties}</p>
                <p className="text-sm text-gray-500">{stats.occupiedProperties} occupied</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-2">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Banknote className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Monthly Rental</p>
                <p className="text-2xl font-bold text-gray-900">£{stats.monthlyRental.toLocaleString()}</p>
                <p className="text-sm text-green-600">+5.2% from last month</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-2">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Tenants</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalTenants}</p>
                <p className="text-sm text-gray-500">{stats.overdueRent} overdue payments</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-2">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Wrench className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Maintenance</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingMaintenance}</p>
                <p className="text-sm text-gray-500">pending requests</p>
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
            { id: 'tenants', label: 'Tenants', icon: Users },
            { id: 'maintenance', label: 'Maintenance', icon: Wrench },
            { id: 'finances', label: 'Finances', icon: Banknote }
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
                <Link to="/maintenance" className="w-full">
                  <Button className="w-full justify-start" variant="outline">
                    <Wrench className="h-4 w-4 mr-2" />
                    Maintenance Management
                    <ExternalLink className="h-3 w-3 ml-auto" />
                  </Button>
                </Link>
                <Link to="/communications" className="w-full">
                  <Button className="w-full justify-start" variant="outline">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Communications
                    <ExternalLink className="h-3 w-3 ml-auto" />
                  </Button>
                </Link>
                <Link to="/finances" className="w-full">
                  <Button className="w-full justify-start" variant="outline">
                    <Banknote className="h-4 w-4 mr-2" />
                    Financial Reports
                    <ExternalLink className="h-3 w-3 ml-auto" />
                  </Button>
                </Link>
                <Button className="w-full justify-start" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Property
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Maintenance Requests */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Recent Maintenance</span>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Request
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {maintenanceRequests.slice(0, 3).map((request) => (
                  <div key={request.id} className="flex items-start space-x-4 p-3 border rounded-lg">
                    <div className={`p-2 rounded-lg ${
                      request.priority === 'urgent' ? 'bg-red-100' :
                      request.priority === 'high' ? 'bg-orange-100' :
                      request.priority === 'medium' ? 'bg-yellow-100' : 'bg-green-100'
                    }`}>
                      <Wrench className={`h-4 w-4 ${
                        request.priority === 'urgent' ? 'text-red-600' :
                        request.priority === 'high' ? 'text-orange-600' :
                        request.priority === 'medium' ? 'text-yellow-600' : 'text-green-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{request.title}</h4>
                      <p className="text-sm text-gray-600">{request.propertyTitle}</p>
                      <p className="text-sm text-gray-500">{request.tenantName}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                          {request.priority}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                          {request.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">£{request.estimatedCost}</p>
                      <p className="text-xs text-gray-500">{new Date(request.reportedDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Property Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Property Performance</CardTitle>
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
                        <span className="text-sm font-medium text-green-600">
                          £{property.monthlyRent}/month
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(property.status)}`}>
                          {property.status}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      {property.tenant && (
                        <>
                          <p className="text-sm text-gray-900">{property.tenant.name}</p>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(property.tenant.rentStatus)}`}>
                            {property.tenant.rentStatus}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Financial Summary */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Financial Summary - Last 5 Months</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Month</th>
                      <th className="text-right py-2">Rental Income</th>
                      <th className="text-right py-2">Expenses</th>
                      <th className="text-right py-2">Maintenance</th>
                      <th className="text-right py-2">Net Profit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {financialData.map((data, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-2 font-medium">{data.month}</td>
                        <td className="text-right py-2 text-green-600">£{data.rental.toLocaleString()}</td>
                        <td className="text-right py-2 text-red-600">£{data.expenses.toLocaleString()}</td>
                        <td className="text-right py-2 text-orange-600">£{data.maintenance.toLocaleString()}</td>
                        <td className="text-right py-2 font-medium text-blue-600">£{data.profit.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
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
                  <p className="text-gray-600 text-sm mb-3 flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {property.address}
                  </p>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xl font-bold text-green-600">
                      £{property.monthlyRent.toLocaleString()}/month
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(property.status)}`}>
                      {property.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                    <span>{property.bedrooms} bed • {property.bathrooms} bath</span>
                    <span className="capitalize">{property.type}</span>
                  </div>
                  {property.tenant && (
                    <div className="border-t pt-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{property.tenant.name}</p>
                          <p className="text-xs text-gray-500">Lease: {new Date(property.tenant.leaseStart).toLocaleDateString()} - {new Date(property.tenant.leaseEnd).toLocaleDateString()}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(property.tenant.rentStatus)}`}>
                          {property.tenant.rentStatus}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'tenants' && (
        <div>
          {/* Tenants Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Input
                placeholder="Search tenants..."
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
              Add Tenant
            </Button>
          </div>

          {/* Tenants List */}
          <div className="bg-white rounded-lg border">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tenant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Property
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lease End
                    </th>
                    <th className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {properties.filter(p => p.tenant).map((property) => (
                    <tr key={property.tenant!.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <Users className="h-5 w-5 text-gray-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{property.tenant!.name}</div>
                            <div className="text-sm text-gray-500">{property.tenant!.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{property.title}</div>
                        <div className="text-sm text-gray-500">{property.address}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        £{property.monthlyRent.toLocaleString()}/month
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(property.tenant!.rentStatus)}`}>
                          {property.tenant!.rentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(property.tenant!.leaseEnd).toLocaleDateString()}
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

      {activeTab === 'maintenance' && (
        <div>
          {/* Maintenance Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Input
                placeholder="Search maintenance requests..."
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
              Add Request
            </Button>
          </div>

          {/* Maintenance Requests */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {maintenanceRequests.map((request) => (
              <Card key={request.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">{request.title}</h3>
                      <p className="text-gray-600">{request.propertyTitle}</p>
                      <p className="text-sm text-gray-500">Reported by: {request.tenantName}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                      {request.priority}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-4">{request.description}</p>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                        {request.status.replace('_', ' ')}
                      </span>
                      <span className="text-sm text-gray-600 capitalize">{request.category}</span>
                    </div>
                    <span className="text-lg font-semibold text-gray-900">£{request.estimatedCost}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      <p>Reported: {new Date(request.reportedDate).toLocaleDateString()}</p>
                      {request.assignedTo && <p>Assigned to: {request.assignedTo}</p>}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        <Phone className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'finances' && (
        <div>
          {/* Financial Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Income</p>
                    <p className="text-2xl font-bold text-green-600">£{stats.monthlyRental.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Receipt className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                    <p className="text-2xl font-bold text-red-600">£{stats.monthlyExpenses.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Banknote className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Net Profit</p>
                    <p className="text-2xl font-bold text-blue-600">£{(stats.monthlyRental - stats.monthlyExpenses).toLocaleString()}</p>
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
                    <p className="text-sm font-medium text-gray-600">ROI</p>
                    <p className="text-2xl font-bold text-purple-600">12.5%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Financial History */}
          <Card>
            <CardHeader>
              <CardTitle>Financial History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3">Month</th>
                      <th className="text-right py-3">Rental Income</th>
                      <th className="text-right py-3">Operating Expenses</th>
                      <th className="text-right py-3">Maintenance Costs</th>
                      <th className="text-right py-3">Net Profit</th>
                      <th className="text-right py-3">Profit Margin</th>
                    </tr>
                  </thead>
                  <tbody>
                    {financialData.map((data, index) => {
                      const profitMargin = ((data.profit / data.rental) * 100).toFixed(1);
                      return (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="py-3 font-medium">{data.month}</td>
                          <td className="text-right py-3 text-green-600 font-medium">£{data.rental.toLocaleString()}</td>
                          <td className="text-right py-3 text-red-600">£{data.expenses.toLocaleString()}</td>
                          <td className="text-right py-3 text-orange-600">£{data.maintenance.toLocaleString()}</td>
                          <td className="text-right py-3 font-bold text-blue-600">£{data.profit.toLocaleString()}</td>
                          <td className="text-right py-3 font-medium text-purple-600">{profitMargin}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default LandlordDashboard;