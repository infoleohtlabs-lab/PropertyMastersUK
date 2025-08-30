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
  MessageSquare,
  PieChart,
  BarChart3,
  Download,
  Upload,
  Target,
  Percent,
  Calculator,
  FileSpreadsheet,
  Archive,
  TrendingDown,
  Eye,
  Edit,
  Trash2,
  Star,
  PoundSterling
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
  portfolioValue: number;
  averageRent: number;
  maintenanceCosts: number;
  vacancyRate: number;
  annualYield: number;
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

interface Expense {
  id: string;
  propertyId: string;
  propertyTitle: string;
  category: 'maintenance' | 'insurance' | 'tax' | 'management' | 'utilities' | 'other';
  description: string;
  amount: number;
  date: string;
  receipt?: string;
  taxDeductible: boolean;
}

interface LeaseInfo {
  id: string;
  tenantId: string;
  propertyId: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  deposit: number;
  renewalDate?: string;
  status: 'active' | 'expiring' | 'expired' | 'renewed';
  documents: string[];
}

interface TaxDocument {
  id: string;
  name: string;
  description: string;
  type: 'income' | 'expense' | 'tax_return' | 'depreciation';
  date: string;
  status: 'ready' | 'pending' | 'draft';
  year?: number;
  filename?: string;
  downloadUrl?: string;
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
    monthlyExpenses: 0,
    portfolioValue: 0,
    averageRent: 0,
    maintenanceCosts: 0,
    vacancyRate: 0,
    annualYield: 0
  });
  const [properties, setProperties] = useState<Property[]>([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([]);
  const [financialData, setFinancialData] = useState<FinancialSummary[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [leases, setLeases] = useState<LeaseInfo[]>([]);
  const [taxDocuments, setTaxDocuments] = useState<TaxDocument[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'properties' | 'tenants' | 'maintenance' | 'finances' | 'portfolio' | 'reports'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDateRange, setSelectedDateRange] = useState('last_6_months');
  const [loading, setLoading] = useState(true);
  const [maintenanceFilter, setMaintenanceFilter] = useState<'all' | 'urgent' | 'high' | 'medium' | 'low'>('all');
  const [tenantView, setTenantView] = useState<'list' | 'cards'>('list');
  const [financialView, setFinancialView] = useState<'overview' | 'income' | 'expenses' | 'analytics'>('overview');
  const [portfolioMetrics, setPortfolioMetrics] = useState({
    totalValue: 2850000,
    monthlyGrowth: 2.3,
    yearlyGrowth: 8.2,
    averageYield: 7.8,
    bestPerformer: 'Modern 2-Bed Apartment',
    worstPerformer: 'Studio Apartment'
  });

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
        monthlyExpenses: 4200,
        portfolioValue: 2850000,
        averageRent: 1542,
        maintenanceCosts: 1200,
        vacancyRate: 16.7,
        annualYield: 7.8
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

      setExpenses([
        {
          id: 'e1',
          propertyId: '1',
          propertyTitle: 'Modern 2-Bed Apartment',
          category: 'maintenance',
          description: 'Plumbing repair - kitchen tap replacement',
          amount: 150,
          date: '2024-01-20',
          taxDeductible: true
        },
        {
          id: 'e2',
          propertyId: '2',
          propertyTitle: 'Victorian Terraced House',
          category: 'insurance',
          description: 'Annual property insurance premium',
          amount: 850,
          date: '2024-01-15',
          taxDeductible: true
        },
        {
          id: 'e3',
          propertyId: '1',
          propertyTitle: 'Modern 2-Bed Apartment',
          category: 'management',
          description: 'Property management fee - January',
          amount: 120,
          date: '2024-01-01',
          taxDeductible: true
        }
      ]);

      setLeases([
        {
          id: 'l1',
          tenantId: 't1',
          propertyId: '1',
          startDate: '2023-06-01',
          endDate: '2024-05-31',
          monthlyRent: 1200,
          deposit: 1800,
          status: 'active',
          documents: ['lease_agreement.pdf', 'inventory_report.pdf']
        },
        {
          id: 'l2',
          tenantId: 't2',
          propertyId: '2',
          startDate: '2023-09-01',
          endDate: '2024-08-31',
          monthlyRent: 1800,
          deposit: 2700,
          renewalDate: '2024-06-01',
          status: 'expiring',
          documents: ['lease_agreement.pdf', 'inventory_report.pdf', 'renewal_notice.pdf']
        }
      ]);

      setTaxDocuments([
        {
          id: 'td1',
          name: 'Rental Income Statement 2023',
          description: 'Annual rental income summary for tax purposes',
          type: 'income',
          date: '2024-01-15',
          status: 'ready',
          year: 2023,
          filename: 'rental_income_statement_2023.pdf',
          downloadUrl: '#'
        },
        {
          id: 'td2',
          name: 'Property Expenses Report 2023',
          description: 'Detailed breakdown of all property-related expenses',
          type: 'expense',
          date: '2024-01-15',
          status: 'ready',
          year: 2023,
          filename: 'property_expenses_2023.pdf',
          downloadUrl: '#'
        },
        {
          id: 'td3',
          name: 'Property Tax Return 2023',
          description: 'Complete tax return for property portfolio',
          type: 'tax_return',
          date: '2024-01-20',
          status: 'ready',
          year: 2023,
          filename: 'property_tax_return_2023.pdf',
          downloadUrl: '#'
        },
        {
          id: 'td4',
          name: 'Depreciation Schedule 2024',
          description: 'Asset depreciation calculations for current year',
          type: 'depreciation',
          date: '2024-01-25',
          status: 'pending',
          year: 2024
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
    <div className="container-responsive component-spacing">
      {/* Header */}
      <div className="stack-lg">
        <h1 className="text-heading-1">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-body-lg text-gray-600">
          Manage your property portfolio and track your rental income.
        </p>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid-responsive gap-md section-spacing">
        <Card className="col-span-1 sm:col-span-2">
          <CardContent className="card-compact">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-label">Total Properties</p>
                <p className="text-heading-3">{stats.totalProperties}</p>
                <p className="text-caption text-gray-500">{stats.occupiedProperties} occupied</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 sm:col-span-2">
          <CardContent className="card-compact">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Banknote className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-label">Monthly Rental</p>
                <p className="text-heading-3">£{stats.monthlyRental.toLocaleString()}</p>
                <p className="text-caption text-green-600">+5.2% from last month</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 sm:col-span-2">
          <CardContent className="card-compact">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-label">Total Tenants</p>
                <p className="text-heading-3">{stats.totalTenants}</p>
                <p className="text-caption text-gray-500">{stats.overdueRent} overdue payments</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 sm:col-span-2">
          <CardContent className="card-compact">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Wrench className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-label">Maintenance</p>
                <p className="text-heading-3">{stats.pendingMaintenance}</p>
                <div className="flex items-center space-x-2 text-caption">
                  <span className="text-red-600">1 urgent</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-orange-600">2 pending</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 stack-md">
        <nav className="-mb-px flex flex-wrap gap-sm lg:gap-lg">
          {[
            { id: 'overview', label: 'Overview', icon: TrendingUp },
            { id: 'portfolio', label: 'Portfolio', icon: PieChart },
            { id: 'properties', label: 'Properties', icon: Building2 },
            { id: 'tenants', label: 'Tenants', icon: Users },
            { id: 'maintenance', label: 'Maintenance', icon: Wrench },
            { id: 'finances', label: 'Finances', icon: Banknote },
            { id: 'reports', label: 'Reports', icon: FileSpreadsheet }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center py-2 px-2 sm:px-3 border-b-2 font-medium text-body-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.slice(0, 4)}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'portfolio' && (
        <div>
          {/* Portfolio Overview KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-md section-spacing">
            <Card className="col-span-1 sm:col-span-2 lg:col-span-1">
              <CardContent className="card-compact">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <PoundSterling className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                  </div>
                  <div className="ml-3 sm:ml-4">
                    <p className="text-label">Portfolio Value</p>
                    <p className="text-heading-3">£{stats.portfolioValue.toLocaleString()}</p>
                    <p className="text-caption text-green-600 flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +8.2% this year
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="card-compact">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Target className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                  </div>
                  <div className="ml-3 sm:ml-4">
                    <p className="text-label">Annual Yield</p>
                    <p className="text-heading-3">{stats.annualYield}%</p>
                    <p className="text-caption text-green-600">Above market average</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="card-compact">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Percent className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                  </div>
                  <div className="ml-3 sm:ml-4">
                    <p className="text-label">Occupancy Rate</p>
                    <p className="text-heading-3">{stats.occupancyRate}%</p>
                    <p className="text-caption text-gray-500">Vacancy: {stats.vacancyRate}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Property Performance Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-base sm:text-lg">Property Performance</span>
                  <Button variant="outline" size="sm" className="w-full sm:w-auto">
                    <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    Export
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 sm:space-y-4">
                  {properties.map((property) => {
                    const monthlyYield = ((property.monthlyRent * 12) / 250000 * 100).toFixed(1);
                    return (
                      <div key={property.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border rounded-lg gap-3 sm:gap-0">
                        <div className="flex items-center space-x-3 sm:space-x-4">
                          <img
                            src={property.images[0]}
                            alt={property.title}
                            className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-lg"
                          />
                          <div>
                            <h4 className="font-medium text-gray-900 text-sm sm:text-base">{property.title}</h4>
                            <p className="text-xs sm:text-sm text-gray-600">£{property.monthlyRent}/month</p>
                          </div>
                        </div>
                        <div className="flex justify-between sm:block sm:text-right">
                          <p className="text-xs sm:text-sm font-medium text-green-600">{monthlyYield}% yield</p>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(property.status)}`}>
                            {property.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Portfolio Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm text-gray-600">Apartments</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 sm:w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{width: '60%'}}></div>
                      </div>
                      <span className="text-xs sm:text-sm font-medium">60%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm text-gray-600">Houses</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 sm:w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{width: '30%'}}></div>
                      </div>
                      <span className="text-xs sm:text-sm font-medium">30%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm text-gray-600">Commercial</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 sm:w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-600 h-2 rounded-full" style={{width: '10%'}}></div>
                      </div>
                      <span className="text-xs sm:text-sm font-medium">10%</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t">
                  <h4 className="font-medium text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">Market Analysis</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-xs sm:text-sm text-gray-600">Average Rent</span>
                      <span className="text-xs sm:text-sm font-medium">£{stats.averageRent}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs sm:text-sm text-gray-600">Market Average</span>
                      <span className="text-xs sm:text-sm text-gray-500">£1,485</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs sm:text-sm text-gray-600">Performance</span>
                      <span className="text-xs sm:text-sm text-green-600">+3.8% above market</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Rental Income Tracking */}
          <Card>
            <CardHeader>
              <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="text-base sm:text-lg">Rental Income Tracking</span>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                  <select 
                    value={selectedDateRange} 
                    onChange={(e) => setSelectedDateRange(e.target.value)}
                    className="text-xs sm:text-sm border rounded px-2 py-1 w-full sm:w-auto"
                  >
                    <option value="last_6_months">Last 6 Months</option>
                    <option value="last_year">Last Year</option>
                    <option value="ytd">Year to Date</option>
                  </select>
                  <Button variant="outline" size="sm" className="w-full sm:w-auto">
                    <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="text-center p-3 sm:p-4 bg-green-50 rounded-lg">
                  <p className="text-xs sm:text-sm text-gray-600">Total Collected</p>
                  <p className="text-lg sm:text-2xl font-bold text-green-600">£{stats.monthlyRental.toLocaleString()}</p>
                </div>
                <div className="text-center p-3 sm:p-4 bg-yellow-50 rounded-lg">
                  <p className="text-xs sm:text-sm text-gray-600">Pending</p>
                  <p className="text-lg sm:text-2xl font-bold text-yellow-600">£2,400</p>
                </div>
                <div className="text-center p-3 sm:p-4 bg-red-50 rounded-lg">
                  <p className="text-xs sm:text-sm text-gray-600">Overdue</p>
                  <p className="text-lg sm:text-2xl font-bold text-red-600">£1,800</p>
                </div>
                <div className="text-center p-3 sm:p-4 bg-blue-50 rounded-lg">
                  <p className="text-xs sm:text-sm text-gray-600">Collection Rate</p>
                  <p className="text-lg sm:text-2xl font-bold text-blue-600">94.2%</p>
                </div>
              </div>
              <div className="h-48 sm:h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm sm:text-base">Income Tracking Chart</p>
                  <p className="text-xs sm:text-sm text-gray-400">Monthly rental income trends</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Portfolio Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mt-6 sm:mt-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-base sm:text-lg">
                  <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Best & Worst Performers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-green-50 rounded-lg gap-2 sm:gap-0">
                    <div>
                      <p className="font-medium text-green-900 text-sm sm:text-base">Best Performer</p>
                      <p className="text-xs sm:text-sm text-green-700">{portfolioMetrics.bestPerformer}</p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="font-bold text-green-900 text-lg sm:text-xl">12.4%</p>
                      <p className="text-xs sm:text-sm text-green-700">Annual Yield</p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-red-50 rounded-lg gap-2 sm:gap-0">
                    <div>
                      <p className="font-medium text-red-900 text-sm sm:text-base">Needs Attention</p>
                      <p className="text-xs sm:text-sm text-red-700">{portfolioMetrics.worstPerformer}</p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="font-bold text-red-900 text-lg sm:text-xl">4.2%</p>
                      <p className="text-xs sm:text-sm text-red-700">Annual Yield</p>
                    </div>
                  </div>
                  <div className="pt-3 sm:pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm text-gray-600">Portfolio Growth</span>
                      <span className="text-xs sm:text-sm font-medium text-green-600">+{portfolioMetrics.yearlyGrowth}% YoY</span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs sm:text-sm text-gray-600">Monthly Growth</span>
                      <span className="text-xs sm:text-sm font-medium text-blue-600">+{portfolioMetrics.monthlyGrowth}% MoM</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-base sm:text-lg">
                  <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Portfolio Growth Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48 sm:h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <TrendingUp className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm sm:text-base">Portfolio Growth Chart</p>
                    <p className="text-xs sm:text-sm text-gray-400">12-month performance trend</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div>
          {/* Financial Reports Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Financial Reports & Tax Documentation</h2>
            <div className="flex items-center space-x-3">
              <select 
                value={selectedDateRange} 
                onChange={(e) => setSelectedDateRange(e.target.value)}
                className="border rounded px-3 py-2"
              >
                <option value="current_year">Current Tax Year</option>
                <option value="last_year">Previous Tax Year</option>
                <option value="custom">Custom Range</option>
              </select>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export All
              </Button>
            </div>
          </div>

          {/* Tax Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <PoundSterling className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Rental Income</p>
                    <p className="text-2xl font-bold text-gray-900">£{(stats.monthlyRental * 12).toLocaleString()}</p>
                    <p className="text-sm text-gray-500">Tax Year 2024</p>
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
                    <p className="text-sm font-medium text-gray-600">Deductible Expenses</p>
                    <p className="text-2xl font-bold text-gray-900">£{stats.maintenanceCosts.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">Maintenance & Repairs</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Calculator className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Taxable Profit</p>
                    <p className="text-2xl font-bold text-gray-900">£{((stats.monthlyRental * 12) - stats.maintenanceCosts).toLocaleString()}</p>
                    <p className="text-sm text-gray-500">After deductions</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <FileText className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Tax Documents</p>
                    <p className="text-2xl font-bold text-gray-900">{taxDocuments.length}</p>
                    <p className="text-sm text-gray-500">Ready for filing</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Reports and Documents */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Financial Reports */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Financial Reports
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <FileSpreadsheet className="h-5 w-5 text-green-600" />
                      <div>
                        <h4 className="font-medium">Profit & Loss Statement</h4>
                        <p className="text-sm text-gray-600">Annual income and expenses</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <div>
                        <h4 className="font-medium">Rental Income Summary</h4>
                        <p className="text-sm text-gray-600">Monthly rental breakdown</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <Receipt className="h-5 w-5 text-purple-600" />
                      <div>
                        <h4 className="font-medium">Expense Report</h4>
                        <p className="text-sm text-gray-600">Deductible expenses summary</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <TrendingUp className="h-5 w-5 text-orange-600" />
                      <div>
                        <h4 className="font-medium">Portfolio Performance</h4>
                        <p className="text-sm text-gray-600">ROI and yield analysis</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tax Documents */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Tax Documents
                  </span>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Upload
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {taxDocuments.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${
                          doc.type === 'income' ? 'bg-green-100' :
                          doc.type === 'expense' ? 'bg-red-100' :
                          doc.type === 'tax_return' ? 'bg-blue-100' :
                          'bg-gray-100'
                        }`}>
                          <FileText className={`h-4 w-4 ${
                            doc.type === 'income' ? 'text-green-600' :
                            doc.type === 'expense' ? 'text-red-600' :
                            doc.type === 'tax_return' ? 'text-blue-600' :
                            'text-gray-600'
                          }`} />
                        </div>
                        <div>
                          <h4 className="font-medium">{doc.name}</h4>
                          <p className="text-sm text-gray-600">{doc.description}</p>
                          <p className="text-xs text-gray-500">{doc.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          doc.status === 'ready' ? 'bg-green-100 text-green-800' :
                          doc.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {doc.status}
                        </span>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Expense Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Expense Management</span>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Expense
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {expenses.map((expense) => (
                  <div key={expense.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-lg ${
                        expense.category === 'maintenance' ? 'bg-orange-100' :
                        expense.category === 'insurance' ? 'bg-blue-100' :
                        expense.category === 'management' ? 'bg-purple-100' :
                        expense.category === 'legal' ? 'bg-red-100' :
                        'bg-gray-100'
                      }`}>
                        <Receipt className={`h-4 w-4 ${
                          expense.category === 'maintenance' ? 'text-orange-600' :
                          expense.category === 'insurance' ? 'text-blue-600' :
                          expense.category === 'management' ? 'text-purple-600' :
                          expense.category === 'legal' ? 'text-red-600' :
                          'text-gray-600'
                        }`} />
                      </div>
                      <div>
                        <h4 className="font-medium">{expense.description}</h4>
                        <p className="text-sm text-gray-600">{expense.category} • {expense.property}</p>
                        <p className="text-xs text-gray-500">{expense.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">£{expense.amount}</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        expense.taxDeductible ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {expense.taxDeductible ? 'Tax Deductible' : 'Non-deductible'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

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
          {/* Enhanced Tenants Header */}
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
              <div className="flex items-center space-x-2">
                <Button
                  variant={tenantView === 'list' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setTenantView('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={tenantView === 'cards' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setTenantView('cards')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Tenant
              </Button>
            </div>
          </div>

          {/* Tenant Analytics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Tenants</p>
                    <p className="text-2xl font-bold text-gray-900">{properties.filter(p => p.tenant).length}</p>
                    <p className="text-sm text-green-600">+2 this month</p>
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
                    <p className="text-sm font-medium text-gray-600">On-time Payments</p>
                    <p className="text-2xl font-bold text-gray-900">94%</p>
                    <p className="text-sm text-green-600">+3% vs last month</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Calendar className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Lease Renewals</p>
                    <p className="text-2xl font-bold text-gray-900">3</p>
                    <p className="text-sm text-yellow-600">Due in 30 days</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <MessageSquare className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Communications</p>
                    <p className="text-2xl font-bold text-gray-900">12</p>
                    <p className="text-sm text-purple-600">This week</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Tenants List/Cards View */}
          {tenantView === 'list' ? (
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Contact
                      </th>
                      <th className="relative px-6 py-3">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {properties.filter(p => p.tenant).map((property) => {
                      const daysToLeaseEnd = Math.ceil((new Date(property.tenant!.leaseEnd).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                      return (
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
                                <div className="text-xs text-gray-400">{property.tenant!.phone}</div>
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
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{new Date(property.tenant!.leaseEnd).toLocaleDateString()}</div>
                            <div className={`text-xs ${
                              daysToLeaseEnd <= 30 ? 'text-red-600' : 
                              daysToLeaseEnd <= 90 ? 'text-yellow-600' : 'text-gray-500'
                            }`}>
                              {daysToLeaseEnd > 0 ? `${daysToLeaseEnd} days left` : 'Expired'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            2 days ago
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
                                <FileText className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.filter(p => p.tenant).map((property) => {
                const daysToLeaseEnd = Math.ceil((new Date(property.tenant!.leaseEnd).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                return (
                  <Card key={property.tenant!.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
                            <Users className="h-6 w-6 text-gray-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{property.tenant!.name}</h3>
                            <p className="text-sm text-gray-500">{property.tenant!.email}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(property.tenant!.rentStatus)}`}>
                          {property.tenant!.rentStatus}
                        </span>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{property.title}</p>
                          <p className="text-sm text-gray-500">{property.address}</p>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm text-gray-600">Monthly Rent</p>
                            <p className="font-semibold text-gray-900">£{property.monthlyRent.toLocaleString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">Lease Ends</p>
                            <p className={`text-sm font-medium ${
                              daysToLeaseEnd <= 30 ? 'text-red-600' : 
                              daysToLeaseEnd <= 90 ? 'text-yellow-600' : 'text-gray-900'
                            }`}>
                              {new Date(property.tenant!.leaseEnd).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between pt-4 border-t">
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm">
                              <Phone className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Mail className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <FileText className="h-4 w-4" />
                            </Button>
                          </div>
                          <Button variant="outline" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'maintenance' && (
        <div>
          {/* Enhanced Maintenance Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Maintenance Requests</h2>
              <p className="text-gray-600">Manage property maintenance and repairs</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search requests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select 
                value={maintenanceFilter}
                onChange={(e) => setMaintenanceFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option>All Status</option>
                <option>Open</option>
                <option>In Progress</option>
                <option>Completed</option>
              </select>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Request
              </Button>
            </div>
          </div>

          {/* Maintenance Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Urgent Requests</p>
                    <p className="text-2xl font-bold text-red-600">
                      {maintenanceRequests.filter(r => r.priority === 'urgent').length}
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">Requires immediate attention</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">In Progress</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {maintenanceRequests.filter(r => r.status === 'in-progress').length}
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Clock className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">Currently being worked on</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {maintenanceRequests.filter(r => r.status === 'pending').length}
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">Awaiting assignment</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg. Response</p>
                    <p className="text-2xl font-bold text-green-600">2.4h</p>
                  </div>
                  <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">Response time this month</p>
              </CardContent>
            </Card>
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
          {/* Enhanced Financial Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Financial Management</h2>
              <p className="text-gray-600">Track income, expenses, and financial performance</p>
            </div>
            <div className="flex items-center space-x-3">
              <select 
                value={financialView}
                onChange={(e) => setFinancialView(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="overview">Overview</option>
                <option value="income">Income Analysis</option>
                <option value="expenses">Expense Tracking</option>
                <option value="reports">Reports</option>
              </select>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Transaction
              </Button>
            </div>
          </div>

          {/* Enhanced Financial Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Income</p>
                    <p className="text-2xl font-bold text-green-600">£{stats.monthlyRental.toLocaleString()}</p>
                    <p className="text-xs text-green-600 mt-1">+8.2% from last month</p>
                  </div>
                  <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                    <p className="text-2xl font-bold text-red-600">£{stats.monthlyExpenses.toLocaleString()}</p>
                    <p className="text-xs text-red-600 mt-1">+3.1% from last month</p>
                  </div>
                  <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <Receipt className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Net Profit</p>
                    <p className="text-2xl font-bold text-blue-600">£{(stats.monthlyRental - stats.monthlyExpenses).toLocaleString()}</p>
                    <p className="text-xs text-blue-600 mt-1">+12.8% from last month</p>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Banknote className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Portfolio ROI</p>
                    <p className="text-2xl font-bold text-purple-600">12.5%</p>
                    <p className="text-xs text-purple-600 mt-1">Annual return</p>
                  </div>
                  <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Financial Analytics Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Income vs Expenses Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <p className="text-gray-500">Income vs Expenses Chart Placeholder</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Expense Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Maintenance</span>
                    </div>
                    <span className="text-sm font-medium">£2,450 (35%)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Insurance</span>
                    </div>
                    <span className="text-sm font-medium">£1,200 (17%)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Property Tax</span>
                    </div>
                    <span className="text-sm font-medium">£1,800 (26%)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Management</span>
                    </div>
                    <span className="text-sm font-medium">£950 (14%)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Other</span>
                    </div>
                    <span className="text-sm font-medium">£600 (8%)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Transactions */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Recent Transactions</CardTitle>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">2024-01-15</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Income
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">123 Main St</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Rent Payment</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">+£1,200</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Received
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">2024-01-10</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Expense
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">456 Oak Ave</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Maintenance</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">-£350</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          Paid
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">2024-01-08</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Income
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">789 Pine Rd</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Rent Payment</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">+£950</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Received
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Financial History */}
          <Card className="mb-8">
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

          {/* Tax & Reporting Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Tax Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Rental Income</p>
                      <p className="text-lg font-bold text-gray-900">£45,600</p>
                    </div>
                    <FileText className="h-8 w-8 text-gray-400" />
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Deductible Expenses</p>
                      <p className="text-lg font-bold text-gray-900">£12,800</p>
                    </div>
                    <Receipt className="h-8 w-8 text-gray-400" />
                  </div>
                  <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-green-600">Taxable Profit</p>
                      <p className="text-lg font-bold text-green-900">£32,800</p>
                    </div>
                    <Calculator className="h-8 w-8 text-green-600" />
                  </div>
                  <Button className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Generate Tax Report
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Profit & Loss Statement
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Cash Flow Report
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <PieChart className="h-4 w-4 mr-2" />
                    Expense Analysis
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Rental Income Summary
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Calculator className="h-4 w-4 mr-2" />
                    ROI Analysis
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandlordDashboard;