import React, { useState, useEffect } from 'react';
import {
  Building2,
  Users,
  PoundSterling,
  TrendingUp,
  TrendingDown,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Settings,
  Eye,
  Edit,
  Trash2,
  Plus,
  Download,
  Upload,
  Search,
  Filter,
  MoreHorizontal,
  Home,
  MapPin,
  Phone,
  Mail,
  User,
  Wrench,
  Receipt,
  CreditCard,
  BarChart3,
  PieChart,
  X,
  Star,
  MessageSquare,
  Camera
} from 'lucide-react';
import FinancialDashboard from './FinancialDashboard';
import BookingManagement from './BookingManagement';
import DocumentManagement from './DocumentManagement';
import { formatCurrency } from '../utils';

// Interfaces
interface LandlordMetrics {
  totalProperties: number;
  occupiedProperties: number;
  vacantProperties: number;
  totalTenants: number;
  monthlyRent: number;
  maintenanceRequests: number;
  overdueRent: number;
  portfolioValue: number;
  monthlyExpenses: number;
  netIncome: number;
  occupancyRate: number;
  averageRent: number;
}

interface Property {
  id: string;
  title: string;
  address: string;
  type: string;
  bedrooms: number;
  bathrooms: number;
  rent: number;
  deposit: number;
  status: 'occupied' | 'vacant' | 'maintenance';
  tenant?: Tenant;
  leaseStart?: string;
  leaseEnd?: string;
  lastInspection?: string;
  nextInspection?: string;
  images: string[];
  description: string;
  amenities: string[];
  energyRating: string;
  council: string;
  postcode: string;
  marketValue: number;
  purchasePrice: number;
  purchaseDate: string;
  mortgageBalance?: number;
  monthlyMortgage?: number;
  insurance: number;
  serviceCharge?: number;
  groundRent?: number;
}

interface Tenant {
  id: string;
  name: string;
  email: string;
  phone: string;
  moveInDate: string;
  leaseEndDate: string;
  rentAmount: number;
  depositAmount: number;
  paymentStatus: 'current' | 'late' | 'overdue';
  lastPayment?: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  employmentStatus: string;
  employer?: string;
  references: {
    previous: boolean;
    employer: boolean;
    credit: boolean;
  };
  notes?: string;
}

interface MaintenanceRequest {
  id: string;
  propertyId: string;
  propertyAddress: string;
  tenantName: string;
  title: string;
  description: string;
  category: 'plumbing' | 'electrical' | 'heating' | 'structural' | 'appliance' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  dateReported: string;
  dateCompleted?: string;
  assignedTo?: string;
  estimatedCost?: number;
  actualCost?: number;
  images: string[];
  notes?: string;
}

interface FinancialTransaction {
  id: string;
  propertyId: string;
  propertyAddress: string;
  type: 'rent' | 'deposit' | 'maintenance' | 'insurance' | 'mortgage' | 'tax' | 'other';
  category: 'income' | 'expense';
  amount: number;
  date: string;
  description: string;
  reference?: string;
  status: 'pending' | 'completed' | 'failed';
}

interface PortfolioAnalytics {
  totalValue: number;
  totalEquity: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  netYield: number;
  capitalGrowth: number;
  occupancyTrend: number[];
  rentTrend: number[];
  expenseTrend: number[];
  propertyPerformance: {
    propertyId: string;
    address: string;
    yield: number;
    growth: number;
    occupancy: number;
  }[];
}

const LandlordDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<LandlordMetrics | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([]);
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [analytics, setAnalytics] = useState<PortfolioAnalytics | null>(null);
  
  // Modal states
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [showTenantModal, setShowTenantModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [selectedMaintenance, setSelectedMaintenance] = useState<MaintenanceRequest | null>(null);
  
  // Filter states
  const [propertyFilter, setPropertyFilter] = useState('all');
  const [tenantFilter, setTenantFilter] = useState('all');
  const [maintenanceFilter, setMaintenanceFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data
  const mockMetrics: LandlordMetrics = {
    totalProperties: 12,
    occupiedProperties: 10,
    vacantProperties: 2,
    totalTenants: 15,
    monthlyRent: 18500,
    maintenanceRequests: 8,
    overdueRent: 2400,
    portfolioValue: 2850000,
    monthlyExpenses: 6200,
    netIncome: 12300,
    occupancyRate: 83.3,
    averageRent: 1540
  };

  const mockProperties: Property[] = [
    {
      id: '1',
      title: 'Modern 2-Bed Apartment',
      address: '123 Victoria Street, Manchester M1 4LY',
      type: 'apartment',
      bedrooms: 2,
      bathrooms: 1,
      rent: 1200,
      deposit: 1800,
      status: 'occupied',
      leaseStart: '2024-01-15',
      leaseEnd: '2024-12-15',
      lastInspection: '2024-09-15',
      nextInspection: '2024-12-15',
      images: ['https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20apartment%20living%20room%20with%20contemporary%20furniture&image_size=landscape_4_3'],
      description: 'Stylish modern apartment in city center',
      amenities: ['Parking', 'Gym', 'Concierge'],
      energyRating: 'B',
      council: 'Manchester City Council',
      postcode: 'M1 4LY',
      marketValue: 185000,
      purchasePrice: 165000,
      purchaseDate: '2022-03-15',
      mortgageBalance: 120000,
      monthlyMortgage: 650,
      insurance: 45,
      serviceCharge: 120
    },
    {
      id: '2',
      title: 'Victorian Terrace House',
      address: '45 Oak Road, Birmingham B15 2TT',
      type: 'house',
      bedrooms: 3,
      bathrooms: 2,
      rent: 1450,
      deposit: 2175,
      status: 'vacant',
      lastInspection: '2024-10-01',
      nextInspection: '2025-01-01',
      images: ['https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=victorian%20terrace%20house%20exterior%20with%20red%20brick&image_size=landscape_4_3'],
      description: 'Charming Victorian house with period features',
      amenities: ['Garden', 'Parking', 'Period Features'],
      energyRating: 'C',
      council: 'Birmingham City Council',
      postcode: 'B15 2TT',
      marketValue: 220000,
      purchasePrice: 195000,
      purchaseDate: '2021-08-20',
      mortgageBalance: 140000,
      monthlyMortgage: 780,
      insurance: 55
    }
  ];

  const mockTenants: Tenant[] = [
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      phone: '+44 7700 900123',
      moveInDate: '2024-01-15',
      leaseEndDate: '2024-12-15',
      rentAmount: 1200,
      depositAmount: 1800,
      paymentStatus: 'current',
      lastPayment: '2024-11-01',
      emergencyContact: {
        name: 'Mark Johnson',
        phone: '+44 7700 900124',
        relationship: 'Spouse'
      },
      employmentStatus: 'Employed',
      employer: 'Tech Solutions Ltd',
      references: {
        previous: true,
        employer: true,
        credit: true
      }
    },
    {
      id: '2',
      name: 'Michael Chen',
      email: 'michael.chen@email.com',
      phone: '+44 7700 900125',
      moveInDate: '2024-03-01',
      leaseEndDate: '2025-02-28',
      rentAmount: 1350,
      depositAmount: 2025,
      paymentStatus: 'late',
      lastPayment: '2024-10-15',
      emergencyContact: {
        name: 'Lisa Chen',
        phone: '+44 7700 900126',
        relationship: 'Sister'
      },
      employmentStatus: 'Self-employed',
      references: {
        previous: true,
        employer: false,
        credit: true
      },
      notes: 'Payment usually 5-7 days late but consistent'
    }
  ];

  const mockMaintenanceRequests: MaintenanceRequest[] = [
    {
      id: '1',
      propertyId: '1',
      propertyAddress: '123 Victoria Street, Manchester',
      tenantName: 'Sarah Johnson',
      title: 'Leaking Kitchen Tap',
      description: 'Kitchen tap has been dripping constantly for 3 days',
      category: 'plumbing',
      priority: 'medium',
      status: 'pending',
      dateReported: '2024-11-15',
      estimatedCost: 150,
      images: ['https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=leaking%20kitchen%20tap%20dripping%20water&image_size=square']
    },
    {
      id: '2',
      propertyId: '2',
      propertyAddress: '45 Oak Road, Birmingham',
      tenantName: 'Michael Chen',
      title: 'Heating System Not Working',
      description: 'Central heating system not responding, no hot water',
      category: 'heating',
      priority: 'urgent',
      status: 'in_progress',
      dateReported: '2024-11-10',
      assignedTo: 'ABC Heating Services',
      estimatedCost: 350,
      images: ['https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=broken%20heating%20system%20boiler%20maintenance&image_size=square']
    }
  ];

  const mockTransactions: FinancialTransaction[] = [
    {
      id: '1',
      propertyId: '1',
      propertyAddress: '123 Victoria Street, Manchester',
      type: 'rent',
      category: 'income',
      amount: 1200,
      date: '2024-11-01',
      description: 'Monthly rent - November 2024',
      reference: 'RENT-NOV-2024-001',
      status: 'completed'
    },
    {
      id: '2',
      propertyId: '1',
      propertyAddress: '123 Victoria Street, Manchester',
      type: 'maintenance',
      category: 'expense',
      amount: 180,
      date: '2024-10-25',
      description: 'Plumbing repair - bathroom leak',
      reference: 'MAINT-OCT-2024-003',
      status: 'completed'
    }
  ];

  const mockAnalytics: PortfolioAnalytics = {
    totalValue: 2850000,
    totalEquity: 1650000,
    monthlyIncome: 18500,
    monthlyExpenses: 6200,
    netYield: 5.2,
    capitalGrowth: 8.5,
    occupancyTrend: [85, 87, 83, 89, 91, 88, 83],
    rentTrend: [17800, 18000, 18200, 18300, 18400, 18450, 18500],
    expenseTrend: [5800, 6100, 5900, 6300, 6000, 6150, 6200],
    propertyPerformance: [
      {
        propertyId: '1',
        address: '123 Victoria Street, Manchester',
        yield: 6.2,
        growth: 9.1,
        occupancy: 100
      },
      {
        propertyId: '2',
        address: '45 Oak Road, Birmingham',
        yield: 4.8,
        growth: 7.8,
        occupancy: 0
      }
    ]
  };

  // Load data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Simulate API calls
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setMetrics(mockMetrics);
        setProperties(mockProperties);
        setTenants(mockTenants);
        setMaintenanceRequests(mockMaintenanceRequests);
        setTransactions(mockTransactions);
        setAnalytics(mockAnalytics);
      } catch (error) {
        console.error('Error loading landlord data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Utility functions
  

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'occupied':
      case 'current':
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'vacant':
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'maintenance':
      case 'late':
      case 'in_progress':
        return 'text-orange-600 bg-orange-100';
      case 'overdue':
      case 'urgent':
      case 'failed':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600 bg-red-100';
      case 'high':
        return 'text-orange-600 bg-orange-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  // Action handlers
  const handlePropertyAction = (propertyId: string, action: string) => {
    console.log(`Property action: ${action} for property ${propertyId}`);
    // Implement property actions
  };

  const handleTenantAction = (tenantId: string, action: string) => {
    console.log(`Tenant action: ${action} for tenant ${tenantId}`);
    // Implement tenant actions
  };

  const handleMaintenanceAction = (requestId: string, action: string) => {
    console.log(`Maintenance action: ${action} for request ${requestId}`);
    // Implement maintenance actions
  };

  const exportData = (type: string) => {
    console.log(`Exporting ${type} data`);
    // Implement data export
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Building2 className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Landlord Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => exportData('portfolio')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="h-4 w-4" />
                Export Portfolio
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'properties', label: 'Properties', icon: Building2 },
              { id: 'tenants', label: 'Tenants', icon: Users },
              { id: 'maintenance', label: 'Maintenance', icon: Wrench },
              { id: 'financials', label: 'Financials', icon: PoundSterling },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp },
              { id: 'documents', label: 'Documents', icon: FileText }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Properties</p>
                    <p className="text-2xl font-bold text-gray-900">{metrics?.totalProperties}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Building2 className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-green-600 font-medium">{metrics?.occupiedProperties} occupied</span>
                  <span className="text-gray-500 ml-2">{metrics?.vacantProperties} vacant</span>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Monthly Rent</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(metrics?.monthlyRent || 0)}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <PoundSterling className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-green-600 font-medium">+5.2%</span>
                  <span className="text-gray-500 ml-1">vs last month</span>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Net Income</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(metrics?.netIncome || 0)}</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-gray-600">Expenses: {formatCurrency(metrics?.monthlyExpenses || 0)}</span>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Occupancy Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{metrics?.occupancyRate}%</p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-full">
                    <Users className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-gray-600">{metrics?.totalTenants} active tenants</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <Plus className="h-6 w-6 text-blue-600 mb-2" />
                  <span className="text-sm font-medium text-gray-900">Add Property</span>
                </button>
                <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <User className="h-6 w-6 text-green-600 mb-2" />
                  <span className="text-sm font-medium text-gray-900">Add Tenant</span>
                </button>
                <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <Wrench className="h-6 w-6 text-orange-600 mb-2" />
                  <span className="text-sm font-medium text-gray-900">Log Maintenance</span>
                </button>
                <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <Receipt className="h-6 w-6 text-purple-600 mb-2" />
                  <span className="text-sm font-medium text-gray-900">Record Expense</span>
                </button>
                <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <Calendar className="h-6 w-6 text-red-600 mb-2" />
                  <span className="text-sm font-medium text-gray-900">Schedule Inspection</span>
                </button>
                <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <FileText className="h-6 w-6 text-indigo-600 mb-2" />
                  <span className="text-sm font-medium text-gray-900">Generate Report</span>
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Maintenance Requests */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Maintenance</h3>
                  <button
                    onClick={() => setActiveTab('maintenance')}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    View All
                  </button>
                </div>
                <div className="space-y-4">
                  {maintenanceRequests.slice(0, 3).map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{request.title}</p>
                        <p className="text-sm text-gray-600">{request.propertyAddress}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                            {request.priority}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                            {request.status}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">{formatDate(request.dateReported)}</p>
                        {request.estimatedCost && (
                          <p className="text-sm font-medium text-gray-900">{formatCurrency(request.estimatedCost)}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rent Collection Status */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Rent Collection</h3>
                  <button
                    onClick={() => setActiveTab('tenants')}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    View All
                  </button>
                </div>
                <div className="space-y-4">
                  {tenants.map((tenant) => (
                    <div key={tenant.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{tenant.name}</p>
                        <p className="text-sm text-gray-600">Rent: {formatCurrency(tenant.rentAmount)}</p>
                        {tenant.lastPayment && (
                          <p className="text-xs text-gray-500">Last payment: {formatDate(tenant.lastPayment)}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(tenant.paymentStatus)}`}>
                          {tenant.paymentStatus}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'properties' && (
          <div className="space-y-6">
            {/* Properties Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Property Portfolio</h2>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search properties..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={propertyFilter}
                  onChange={(e) => setPropertyFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Properties</option>
                  <option value="occupied">Occupied</option>
                  <option value="vacant">Vacant</option>
                  <option value="maintenance">Under Maintenance</option>
                </select>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Plus className="h-4 w-4" />
                  Add Property
                </button>
              </div>
            </div>

            {/* Properties Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <div key={property.id} className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="relative">
                    <img
                      src={property.images[0]}
                      alt={property.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(property.status)}`}>
                        {property.status}
                      </span>
                    </div>
                    <div className="absolute top-4 right-4">
                      <button className="p-2 bg-white rounded-full shadow hover:bg-gray-50">
                        <MoreHorizontal className="h-4 w-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="font-semibold text-gray-900 mb-2">{property.title}</h3>
                    <div className="flex items-center gap-1 text-gray-600 mb-3">
                      <MapPin className="h-4 w-4" />
                      <span className="text-sm">{property.address}</span>
                    </div>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>{property.bedrooms} bed</span>
                        <span>{property.bathrooms} bath</span>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-blue-600">{formatCurrency(property.rent)}</p>
                        <p className="text-xs text-gray-500">/month</p>
                      </div>
                    </div>
                    
                    {property.tenant && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-900">Current Tenant</p>
                        <p className="text-sm text-gray-600">{property.tenant.name}</p>
                        <p className="text-xs text-gray-500">Lease ends: {formatDate(property.leaseEnd!)}</p>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedProperty(property);
                          setShowPropertyModal(true);
                        }}
                        className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => handlePropertyAction(property.id, 'edit')}
                        className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'tenants' && (
          <div className="space-y-6">
            {/* Tenants Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Tenant Management</h2>
              <div className="flex items-center gap-4">
                <select
                  value={tenantFilter}
                  onChange={(e) => setTenantFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Tenants</option>
                  <option value="current">Current Payments</option>
                  <option value="late">Late Payments</option>
                  <option value="overdue">Overdue Payments</option>
                </select>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Plus className="h-4 w-4" />
                  Add Tenant
                </button>
              </div>
            </div>

            {/* Tenants Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
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
                        Payment Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Lease End
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tenants.map((tenant) => {
                      const property = properties.find(p => p.tenant?.id === tenant.id);
                      return (
                        <tr key={tenant.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                  <User className="h-5 w-5 text-blue-600" />
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{tenant.name}</div>
                                <div className="text-sm text-gray-500">{tenant.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{property?.address || 'N/A'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{formatCurrency(tenant.rentAmount)}</div>
                            <div className="text-sm text-gray-500">Deposit: {formatCurrency(tenant.depositAmount)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(tenant.paymentStatus)}`}>
                              {tenant.paymentStatus}
                            </span>
                            {tenant.lastPayment && (
                              <div className="text-xs text-gray-500 mt-1">
                                Last: {formatDate(tenant.lastPayment)}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(tenant.leaseEndDate)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setSelectedTenant(tenant);
                                  setShowTenantModal(true);
                                }}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleTenantAction(tenant.id, 'contact')}
                                className="text-green-600 hover:text-green-900"
                              >
                                <MessageSquare className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleTenantAction(tenant.id, 'edit')}
                                className="text-gray-600 hover:text-gray-900"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'maintenance' && (
          <div className="space-y-6">
            {/* Maintenance Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Maintenance Management</h2>
              <div className="flex items-center gap-4">
                <select
                  value={maintenanceFilter}
                  onChange={(e) => setMaintenanceFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Requests</option>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="urgent">Urgent</option>
                </select>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Plus className="h-4 w-4" />
                  Log Request
                </button>
              </div>
            </div>

            {/* Maintenance Requests */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {maintenanceRequests.map((request) => (
                <div key={request.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{request.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{request.propertyAddress}</p>
                      <p className="text-sm text-gray-700">{request.description}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                        {request.priority}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                        {request.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <span className="text-gray-600">Reported by:</span>
                      <p className="font-medium">{request.tenantName}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Date:</span>
                      <p className="font-medium">{formatDate(request.dateReported)}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Category:</span>
                      <p className="font-medium capitalize">{request.category}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Est. Cost:</span>
                      <p className="font-medium">{request.estimatedCost ? formatCurrency(request.estimatedCost) : 'TBD'}</p>
                    </div>
                  </div>
                  
                  {request.assignedTo && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <span className="font-medium">Assigned to:</span> {request.assignedTo}
                      </p>
                    </div>
                  )}
                  
                  {request.images.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">Photos:</p>
                      <div className="flex gap-2">
                        {request.images.map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt={`Maintenance ${index + 1}`}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedMaintenance(request);
                        setShowMaintenanceModal(true);
                      }}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleMaintenanceAction(request.id, 'update')}
                      className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'financials' && (
          <FinancialDashboard />
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Portfolio Analytics */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Portfolio Performance</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{formatCurrency(analytics?.totalValue || 0)}</p>
                  <p className="text-sm text-gray-600">Total Portfolio Value</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{analytics?.netYield}%</p>
                  <p className="text-sm text-gray-600">Net Yield</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">{analytics?.capitalGrowth}%</p>
                  <p className="text-sm text-gray-600">Capital Growth</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">{formatCurrency(analytics?.totalEquity || 0)}</p>
                  <p className="text-sm text-gray-600">Total Equity</p>
                </div>
              </div>
              
              {/* Property Performance Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Property
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Yield
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Growth
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Occupancy
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {analytics?.propertyPerformance.map((property) => (
                      <tr key={property.propertyId}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {property.address}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                          {property.yield}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                          {property.growth}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-purple-600">
                          {property.occupancy}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <DocumentManagement />
        )}
      </div>

      {/* Property Details Modal */}
      {showPropertyModal && selectedProperty && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Property Details</h3>
                <button
                  onClick={() => {
                    setShowPropertyModal(false);
                    setSelectedProperty(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <img
                    src={selectedProperty.images[0]}
                    alt={selectedProperty.title}
                    className="w-full h-64 object-cover rounded-lg mb-4"
                  />
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">{selectedProperty.title}</h4>
                    <div className="flex items-center gap-2 text-gray-600 mb-4">
                      <MapPin className="h-4 w-4" />
                      <span>{selectedProperty.address}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <span className="text-sm text-gray-600">Bedrooms</span>
                        <p className="font-medium">{selectedProperty.bedrooms}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Bathrooms</span>
                        <p className="font-medium">{selectedProperty.bathrooms}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Type</span>
                        <p className="font-medium capitalize">{selectedProperty.type}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Energy Rating</span>
                        <p className="font-medium">{selectedProperty.energyRating}</p>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 mb-4">{selectedProperty.description}</p>
                    
                    <div className="mb-4">
                      <h5 className="font-medium text-gray-900 mb-2">Amenities</h5>
                      <div className="flex flex-wrap gap-2">
                        {selectedProperty.amenities.map((amenity, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {amenity}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="space-y-6">
                    <div>
                      <h5 className="font-medium text-gray-900 mb-3">Financial Information</h5>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm text-gray-600">Monthly Rent</span>
                          <p className="font-medium text-lg text-blue-600">{formatCurrency(selectedProperty.rent)}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Deposit</span>
                          <p className="font-medium">{formatCurrency(selectedProperty.deposit)}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Market Value</span>
                          <p className="font-medium">{formatCurrency(selectedProperty.marketValue)}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Purchase Price</span>
                          <p className="font-medium">{formatCurrency(selectedProperty.purchasePrice)}</p>
                        </div>
                        {selectedProperty.monthlyMortgage && (
                          <div>
                            <span className="text-sm text-gray-600">Monthly Mortgage</span>
                            <p className="font-medium">{formatCurrency(selectedProperty.monthlyMortgage)}</p>
                          </div>
                        )}
                        <div>
                          <span className="text-sm text-gray-600">Insurance</span>
                          <p className="font-medium">{formatCurrency(selectedProperty.insurance)}</p>
                        </div>
                      </div>
                    </div>
                    
                    {selectedProperty.tenant && (
                      <div>
                        <h5 className="font-medium text-gray-900 mb-3">Current Tenant</h5>
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <p className="font-medium">{selectedProperty.tenant.name}</p>
                          <p className="text-sm text-gray-600">{selectedProperty.tenant.email}</p>
                          <p className="text-sm text-gray-600">{selectedProperty.tenant.phone}</p>
                          <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-gray-600">Move-in:</span>
                              <p>{formatDate(selectedProperty.leaseStart!)}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Lease End:</span>
                              <p>{formatDate(selectedProperty.leaseEnd!)}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <h5 className="font-medium text-gray-900 mb-3">Inspections</h5>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Last Inspection:</span>
                          <p className="font-medium">{selectedProperty.lastInspection ? formatDate(selectedProperty.lastInspection) : 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Next Inspection:</span>
                          <p className="font-medium">{selectedProperty.nextInspection ? formatDate(selectedProperty.nextInspection) : 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => handlePropertyAction(selectedProperty.id, 'edit')}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                  Edit Property
                </button>
                <button
                  onClick={() => handlePropertyAction(selectedProperty.id, 'schedule_inspection')}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Calendar className="h-4 w-4" />
                  Schedule Inspection
                </button>
                <button
                  onClick={() => handlePropertyAction(selectedProperty.id, 'view_documents')}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <FileText className="h-4 w-4" />
                  Documents
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tenant Details Modal */}
      {showTenantModal && selectedTenant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Tenant Details</h3>
                <button
                  onClick={() => {
                    setShowTenantModal(false);
                    setSelectedTenant(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Personal Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-600">Name</span>
                      <p className="font-medium">{selectedTenant.name}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Email</span>
                      <p className="font-medium">{selectedTenant.email}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Phone</span>
                      <p className="font-medium">{selectedTenant.phone}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Employment</span>
                      <p className="font-medium">{selectedTenant.employmentStatus}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Tenancy Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-600">Move-in Date</span>
                      <p className="font-medium">{formatDate(selectedTenant.moveInDate)}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Lease End Date</span>
                      <p className="font-medium">{formatDate(selectedTenant.leaseEndDate)}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Monthly Rent</span>
                      <p className="font-medium text-blue-600">{formatCurrency(selectedTenant.rentAmount)}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Deposit</span>
                      <p className="font-medium">{formatCurrency(selectedTenant.depositAmount)}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Payment Status</h4>
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedTenant.paymentStatus)}`}>
                      {selectedTenant.paymentStatus}
                    </span>
                    {selectedTenant.lastPayment && (
                      <span className="text-sm text-gray-600">
                        Last payment: {formatDate(selectedTenant.lastPayment)}
                      </span>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Emergency Contact</h4>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="font-medium">{selectedTenant.emergencyContact.name}</p>
                    <p className="text-sm text-gray-600">{selectedTenant.emergencyContact.phone}</p>
                    <p className="text-sm text-gray-600">{selectedTenant.emergencyContact.relationship}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">References</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center ${
                        selectedTenant.references.previous ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {selectedTenant.references.previous ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <X className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600">Previous Landlord</p>
                    </div>
                    <div className="text-center">
                      <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center ${
                        selectedTenant.references.employer ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {selectedTenant.references.employer ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <X className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600">Employer</p>
                    </div>
                    <div className="text-center">
                      <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center ${
                        selectedTenant.references.credit ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {selectedTenant.references.credit ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <X className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600">Credit Check</p>
                    </div>
                  </div>
                </div>
                
                {selectedTenant.notes && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Notes</h4>
                    <p className="text-gray-700 p-3 bg-yellow-50 rounded-lg">{selectedTenant.notes}</p>
                  </div>
                )}
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => handleTenantAction(selectedTenant.id, 'contact')}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <MessageSquare className="h-4 w-4" />
                  Contact Tenant
                </button>
                <button
                  onClick={() => handleTenantAction(selectedTenant.id, 'payment_reminder')}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  <CreditCard className="h-4 w-4" />
                  Payment Reminder
                </button>
                <button
                  onClick={() => handleTenantAction(selectedTenant.id, 'edit')}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                  Edit Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Maintenance Details Modal */}
      {showMaintenanceModal && selectedMaintenance && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Maintenance Request Details</h3>
                <button
                  onClick={() => {
                    setShowMaintenanceModal(false);
                    setSelectedMaintenance(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">{selectedMaintenance.title}</h4>
                  <p className="text-gray-700 mb-4">{selectedMaintenance.description}</p>
                  
                  <div className="flex gap-2 mb-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedMaintenance.priority)}`}>
                      {selectedMaintenance.priority} priority
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedMaintenance.status)}`}>
                      {selectedMaintenance.status}
                    </span>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Request Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-600">Property</span>
                      <p className="font-medium">{selectedMaintenance.propertyAddress}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Reported by</span>
                      <p className="font-medium">{selectedMaintenance.tenantName}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Date Reported</span>
                      <p className="font-medium">{formatDate(selectedMaintenance.dateReported)}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Category</span>
                      <p className="font-medium capitalize">{selectedMaintenance.category}</p>
                    </div>
                  </div>
                </div>
                
                {selectedMaintenance.assignedTo && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Assignment</h4>
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="font-medium text-blue-900">{selectedMaintenance.assignedTo}</p>
                      <p className="text-sm text-blue-700">Contractor assigned</p>
                    </div>
                  </div>
                )}
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Cost Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-600">Estimated Cost</span>
                      <p className="font-medium text-blue-600">
                        {selectedMaintenance.estimatedCost ? formatCurrency(selectedMaintenance.estimatedCost) : 'TBD'}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Actual Cost</span>
                      <p className="font-medium text-green-600">
                        {selectedMaintenance.actualCost ? formatCurrency(selectedMaintenance.actualCost) : 'Pending'}
                      </p>
                    </div>
                  </div>
                </div>
                
                {selectedMaintenance.images.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Photos</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {selectedMaintenance.images.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`Maintenance ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedMaintenance.notes && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Notes</h4>
                    <p className="text-gray-700 p-3 bg-gray-50 rounded-lg">{selectedMaintenance.notes}</p>
                  </div>
                )}
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => handleMaintenanceAction(selectedMaintenance.id, 'assign')}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <User className="h-4 w-4" />
                  Assign Contractor
                </button>
                <button
                  onClick={() => handleMaintenanceAction(selectedMaintenance.id, 'update_status')}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <CheckCircle className="h-4 w-4" />
                  Update Status
                </button>
                <button
                  onClick={() => handleMaintenanceAction(selectedMaintenance.id, 'add_photos')}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Camera className="h-4 w-4" />
                  Add Photos
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandlordDashboard