import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Building, 
  Banknote, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Calendar, 
  Eye, 
  Edit, 
  Trash2, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Star, 
  Target, 
  Briefcase, 
  Home, 
  Key, 
  Receipt, 
  FileText, 
  Camera, 
  Video, 
  Share2, 
  Heart, 
  MessageSquare, 
  Bell, 
  Settings, 
  BarChart3, 
  PieChart, 
  RefreshCw, 
  MoreVertical,
  UserPlus,
  Building2,
  Handshake,
  Calculator,
  Percent,
  Wallet,
  CreditCard,
  TrendingDown as TrendDown,
  ArrowUpRight,
  ArrowDownRight,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import BookingManagement from './BookingManagement';
import DocumentManagement from './DocumentManagement';

interface AgentDashboardProps {
  userId: string;
}

type ViewMode = 'overview' | 'properties' | 'clients' | 'bookings' | 'leads' | 'commission' | 'analytics' | 'documents';

interface AgentMetrics {
  totalProperties: number;
  activeListings: number;
  totalClients: number;
  activeClients: number;
  totalBookings: number;
  pendingBookings: number;
  totalCommission: number;
  monthlyCommission: number;
  conversionRate: number;
  averageDealValue: number;
  leadsThisMonth: number;
  closedDealsThisMonth: number;
}

interface Property {
  id: string;
  title: string;
  type: 'sale' | 'rent';
  propertyType: string;
  price: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  status: 'active' | 'pending' | 'sold' | 'rented' | 'withdrawn';
  views: number;
  enquiries: number;
  bookings: number;
  images: string[];
  dateAdded: string;
  lastUpdated: string;
  featured: boolean;
  description: string;
}

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: 'buyer' | 'seller' | 'landlord' | 'tenant';
  status: 'active' | 'inactive' | 'prospect';
  budget?: number;
  requirements?: string;
  lastContact: string;
  totalDeals: number;
  totalValue: number;
  source: string;
  notes: string;
  preferredContact: 'email' | 'phone' | 'text';
}

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  propertyInterest: string;
  budget: number;
  status: 'new' | 'contacted' | 'qualified' | 'viewing' | 'offer' | 'closed' | 'lost';
  priority: 'low' | 'medium' | 'high';
  dateCreated: string;
  lastContact?: string;
  nextFollowUp?: string;
  notes: string;
  score: number;
}

interface Commission {
  id: string;
  propertyId: string;
  propertyTitle: string;
  clientName: string;
  dealType: 'sale' | 'rental';
  dealValue: number;
  commissionRate: number;
  commissionAmount: number;
  status: 'pending' | 'confirmed' | 'paid';
  dateCompleted: string;
  datePaid?: string;
  invoiceNumber?: string;
}

const AgentDashboard: React.FC<AgentDashboardProps> = ({ userId }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [loading, setLoading] = useState(false);
  const [agentMetrics, setAgentMetrics] = useState<AgentMetrics>({
    totalProperties: 45,
    activeListings: 38,
    totalClients: 127,
    activeClients: 89,
    totalBookings: 234,
    pendingBookings: 12,
    totalCommission: 125000,
    monthlyCommission: 15750,
    conversionRate: 23.5,
    averageDealValue: 285000,
    leadsThisMonth: 34,
    closedDealsThisMonth: 8
  });
  
  const [properties, setProperties] = useState<Property[]>([
    {
      id: '1',
      title: 'Modern 2-Bed Apartment in Canary Wharf',
      type: 'sale',
      propertyType: 'Apartment',
      price: 650000,
      location: 'Canary Wharf, London',
      bedrooms: 2,
      bathrooms: 2,
      status: 'active',
      views: 245,
      enquiries: 18,
      bookings: 5,
      images: ['https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20luxury%20apartment%20interior%20canary%20wharf%20london%20living%20room&image_size=landscape_4_3'],
      dateAdded: '2024-01-10T00:00:00Z',
      lastUpdated: '2024-01-15T00:00:00Z',
      featured: true,
      description: 'Stunning modern apartment with river views'
    },
    {
      id: '2',
      title: 'Victorian House in Hampstead',
      type: 'rent',
      propertyType: 'House',
      price: 3500,
      location: 'Hampstead, London',
      bedrooms: 4,
      bathrooms: 3,
      status: 'active',
      views: 189,
      enquiries: 12,
      bookings: 3,
      images: ['https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=victorian%20house%20exterior%20hampstead%20london%20traditional%20architecture&image_size=landscape_4_3'],
      dateAdded: '2024-01-08T00:00:00Z',
      lastUpdated: '2024-01-14T00:00:00Z',
      featured: false,
      description: 'Beautiful Victorian house with period features'
    }
  ]);
  
  const [clients, setClients] = useState<Client[]>([
    {
      id: '1',
      name: 'John Smith',
      email: 'john.smith@email.com',
      phone: '+44 7700 900123',
      type: 'buyer',
      status: 'active',
      budget: 500000,
      requirements: '2-3 bed apartment in Central London',
      lastContact: '2024-01-15T00:00:00Z',
      totalDeals: 0,
      totalValue: 0,
      source: 'Website',
      notes: 'First-time buyer, pre-approved mortgage',
      preferredContact: 'email'
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah.j@email.com',
      phone: '+44 7700 900456',
      type: 'seller',
      status: 'active',
      lastContact: '2024-01-14T00:00:00Z',
      totalDeals: 1,
      totalValue: 450000,
      source: 'Referral',
      notes: 'Looking to downsize, flexible on timing',
      preferredContact: 'phone'
    }
  ]);
  
  const [leads, setLeads] = useState<Lead[]>([
    {
      id: '1',
      name: 'Michael Brown',
      email: 'michael.brown@email.com',
      phone: '+44 7700 900789',
      source: 'Rightmove',
      propertyInterest: 'Modern 2-Bed Apartment in Canary Wharf',
      budget: 600000,
      status: 'qualified',
      priority: 'high',
      dateCreated: '2024-01-16T00:00:00Z',
      lastContact: '2024-01-16T10:30:00Z',
      nextFollowUp: '2024-01-18T14:00:00Z',
      notes: 'Very interested, wants to view ASAP',
      score: 85
    },
    {
      id: '2',
      name: 'Emma Wilson',
      email: 'emma.wilson@email.com',
      phone: '+44 7700 900012',
      source: 'Zoopla',
      propertyInterest: 'Victorian House in Hampstead',
      budget: 4000,
      status: 'new',
      priority: 'medium',
      dateCreated: '2024-01-17T00:00:00Z',
      notes: 'Enquiry about rental property',
      score: 65
    }
  ]);
  
  const [commissions, setCommissions] = useState<Commission[]>([
    {
      id: '1',
      propertyId: '1',
      propertyTitle: 'Modern 2-Bed Apartment in Canary Wharf',
      clientName: 'John Smith',
      dealType: 'sale',
      dealValue: 650000,
      commissionRate: 2.5,
      commissionAmount: 16250,
      status: 'confirmed',
      dateCompleted: '2024-01-15T00:00:00Z',
      invoiceNumber: 'INV-2024-001'
    },
    {
      id: '2',
      propertyId: '2',
      propertyTitle: 'Victorian House in Hampstead',
      clientName: 'Sarah Johnson',
      dealType: 'rental',
      dealValue: 42000,
      commissionRate: 8.0,
      commissionAmount: 3360,
      status: 'pending',
      dateCompleted: '2024-01-14T00:00:00Z'
    }
  ]);
  
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Mock data loading functions
  const loadAgentData = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Data is already set in state
    } catch (error) {
      console.error('Error loading agent data:', error);
      toast.error('Failed to load agent data');
    } finally {
      setLoading(false);
    }
  };

  const handlePropertyAction = async (propertyId: string, action: 'edit' | 'delete' | 'feature' | 'withdraw') => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (action === 'delete') {
        setProperties(prev => prev.filter(p => p.id !== propertyId));
        toast.success('Property deleted successfully');
      } else if (action === 'feature') {
        setProperties(prev => prev.map(p => 
          p.id === propertyId ? { ...p, featured: !p.featured } : p
        ));
        toast.success('Property featured status updated');
      } else if (action === 'withdraw') {
        setProperties(prev => prev.map(p => 
          p.id === propertyId ? { ...p, status: 'withdrawn' } : p
        ));
        toast.success('Property withdrawn from market');
      }
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
      toast.error(`Failed to ${action} property`);
    }
  };

  const handleClientAction = async (clientId: string, action: 'edit' | 'delete' | 'contact' | 'convert') => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (action === 'delete') {
        setClients(prev => prev.filter(c => c.id !== clientId));
        toast.success('Client deleted successfully');
      } else if (action === 'contact') {
        setClients(prev => prev.map(c => 
          c.id === clientId ? { ...c, lastContact: new Date().toISOString() } : c
        ));
        toast.success('Contact logged successfully');
      } else if (action === 'convert') {
        // Convert lead to client logic
        toast.success('Lead converted to client');
      }
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
      toast.error(`Failed to ${action} client`);
    }
  };

  const handleLeadAction = async (leadId: string, action: 'contact' | 'qualify' | 'convert' | 'lose') => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setLeads(prev => prev.map(lead => {
        if (lead.id === leadId) {
          switch (action) {
            case 'contact':
              return { ...lead, lastContact: new Date().toISOString(), status: 'contacted' };
            case 'qualify':
              return { ...lead, status: 'qualified' };
            case 'convert':
              return { ...lead, status: 'closed' };
            case 'lose':
              return { ...lead, status: 'lost' };
            default:
              return lead;
          }
        }
        return lead;
      }));
      
      toast.success(`Lead ${action}ed successfully`);
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
      toast.error(`Failed to ${action} lead`);
    }
  };

  useEffect(() => {
    loadAgentData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'sold': case 'rented': case 'closed': return 'bg-blue-100 text-blue-800';
      case 'withdrawn': case 'lost': return 'bg-red-100 text-red-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Agent Dashboard</h1>
          
          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              {(['overview', 'properties', 'clients', 'bookings', 'leads', 'commission', 'analytics', 'documents'] as ViewMode[]).map(mode => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors capitalize ${
                    viewMode === mode ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
            
            <button
              onClick={() => loadAgentData()}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>
        
        {/* Agent Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Building className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-600">Properties</span>
            </div>
            <div className="text-lg font-bold text-blue-700">{agentMetrics.totalProperties}</div>
            <div className="text-xs text-blue-600">{agentMetrics.activeListings} active</div>
          </div>
          
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-600">Clients</span>
            </div>
            <div className="text-lg font-bold text-green-700">{agentMetrics.totalClients}</div>
            <div className="text-xs text-green-600">{agentMetrics.activeClients} active</div>
          </div>
          
          <div className="bg-purple-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-600">Bookings</span>
            </div>
            <div className="text-lg font-bold text-purple-700">{agentMetrics.totalBookings}</div>
            <div className="text-xs text-purple-600">{agentMetrics.pendingBookings} pending</div>
          </div>
          
          <div className="bg-yellow-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Target className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-600">Leads</span>
            </div>
            <div className="text-lg font-bold text-yellow-700">{agentMetrics.leadsThisMonth}</div>
            <div className="text-xs text-yellow-600">This month</div>
          </div>
          
          <div className="bg-indigo-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Banknote className="h-4 w-4 text-indigo-600" />
              <span className="text-sm font-medium text-indigo-600">Commission</span>
            </div>
            <div className="text-lg font-bold text-indigo-700">{formatCurrency(agentMetrics.monthlyCommission)}</div>
            <div className="text-xs text-indigo-600">This month</div>
          </div>
          
          <div className="bg-red-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Percent className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-red-600">Conversion</span>
            </div>
            <div className="text-lg font-bold text-red-700">{agentMetrics.conversionRate}%</div>
            <div className="text-xs text-red-600">Lead to deal</div>
          </div>
        </div>
      </div>

      {/* Content based on view mode */}
      {viewMode === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Properties */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Properties</h3>
              <button
                onClick={() => setViewMode('properties')}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                View All
              </button>
            </div>
            <div className="space-y-3">
              {properties.slice(0, 3).map(property => (
                <div key={property.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <img 
                    src={property.images[0]} 
                    alt={property.title}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 text-sm">{property.title}</div>
                    <div className="text-xs text-gray-600">{formatCurrency(property.price)}</div>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    getStatusColor(property.status)
                  }`}>
                    {property.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Recent Leads */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Leads</h3>
              <button
                onClick={() => setViewMode('leads')}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                View All
              </button>
            </div>
            <div className="space-y-3">
              {leads.slice(0, 3).map(lead => (
                <div key={lead.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900 text-sm">{lead.name}</div>
                    <div className="text-xs text-gray-600">{lead.source} • {formatCurrency(lead.budget)}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      getPriorityColor(lead.priority)
                    }`}>
                      {lead.priority}
                    </span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      getStatusColor(lead.status)
                    }`}>
                      {lead.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Commission Summary */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Commission Summary</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Earned</span>
                <span className="text-lg font-bold text-green-600">{formatCurrency(agentMetrics.totalCommission)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">This Month</span>
                <span className="text-lg font-bold text-blue-600">{formatCurrency(agentMetrics.monthlyCommission)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Average Deal</span>
                <span className="text-lg font-bold text-purple-600">{formatCurrency(agentMetrics.averageDealValue)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Deals Closed</span>
                <span className="text-lg font-bold text-orange-600">{agentMetrics.closedDealsThisMonth}</span>
              </div>
            </div>
          </div>
          
          {/* Performance Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Conversion Rate</span>
                  <span className="text-sm font-medium">{agentMetrics.conversionRate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${agentMetrics.conversionRate}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Monthly Target</span>
                  <span className="text-sm font-medium">75%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Client Satisfaction</span>
                  <span className="text-sm font-medium">92%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {viewMode === 'properties' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Property Management</h3>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search properties..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="sold">Sold</option>
                  <option value="rented">Rented</option>
                </select>
                <button className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Plus className="h-4 w-4" />
                  Add Property
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {properties.map(property => (
                <div key={property.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                  <div className="relative">
                    <img 
                      src={property.images[0]} 
                      alt={property.title}
                      className="w-full h-48 object-cover"
                    />
                    {property.featured && (
                      <div className="absolute top-2 left-2">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-500 text-white text-xs font-medium rounded">
                          <Star className="h-3 w-3" />
                          Featured
                        </span>
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                        getStatusColor(property.status)
                      }`}>
                        {property.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h4 className="font-medium text-gray-900 mb-2">{property.title}</h4>
                    <div className="text-lg font-bold text-blue-600 mb-2">
                      {formatCurrency(property.price)}
                      {property.type === 'rent' && <span className="text-sm font-normal text-gray-600">/month</span>}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <span>{property.bedrooms} bed</span>
                      <span>{property.bathrooms} bath</span>
                      <span>{property.propertyType}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                      <MapPin className="h-4 w-4" />
                      <span>{property.location}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        <span>{property.views}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        <span>{property.enquiries}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{property.bookings}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedProperty(property);
                          setShowPropertyModal(true);
                        }}
                        className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => handlePropertyAction(property.id, 'feature')}
                        className={`p-2 rounded-lg transition-colors ${
                          property.featured ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        title="Toggle Featured"
                      >
                        <Star className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handlePropertyAction(property.id, 'edit')}
                        className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                        title="Edit Property"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {viewMode === 'clients' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Client Management</h3>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search clients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <UserPlus className="h-4 w-4" />
                  Add Client
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Client</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Type</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Budget</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Last Contact</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Deals</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map(client => (
                    <tr key={client.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium text-gray-900">{client.name}</div>
                          <div className="text-sm text-gray-600">{client.email}</div>
                          <div className="text-sm text-gray-600">{client.phone}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                          {client.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">
                        {client.budget ? formatCurrency(client.budget) : '-'}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">{formatDate(client.lastContact)}</td>
                      <td className="py-3 px-4">
                        <div className="text-sm">
                          <div className="font-medium">{client.totalDeals}</div>
                          <div className="text-gray-600">{formatCurrency(client.totalValue)}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          getStatusColor(client.status)
                        }`}>
                          {client.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedClient(client);
                              setShowClientModal(true);
                            }}
                            className="p-1 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleClientAction(client.id, 'contact')}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Log Contact"
                          >
                            <Phone className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleClientAction(client.id, 'edit')}
                            className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                            title="Edit Client"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
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

      {viewMode === 'leads' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Lead Management</h3>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search leads..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Plus className="h-4 w-4" />
                  Add Lead
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {leads.map(lead => (
                <div key={lead.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900">{lead.name}</h4>
                      <div className="text-sm text-gray-600">{lead.email}</div>
                      <div className="text-sm text-gray-600">{lead.phone}</div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        getPriorityColor(lead.priority)
                      }`}>
                        {lead.priority}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        getStatusColor(lead.status)
                      }`}>
                        {lead.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="text-sm">
                      <span className="text-gray-600">Interest:</span>
                      <span className="ml-1 font-medium">{lead.propertyInterest}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-600">Budget:</span>
                      <span className="ml-1 font-medium">{formatCurrency(lead.budget)}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-600">Source:</span>
                      <span className="ml-1 font-medium">{lead.source}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-600">Score:</span>
                      <span className="ml-1 font-medium">{lead.score}/100</span>
                    </div>
                  </div>
                  
                  {lead.notes && (
                    <div className="text-sm text-gray-600 mb-4 p-2 bg-gray-50 rounded">
                      {lead.notes}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleLeadAction(lead.id, 'contact')}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Contact
                    </button>
                    <button
                      onClick={() => handleLeadAction(lead.id, 'qualify')}
                      className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Qualify
                    </button>
                    <button
                      onClick={() => {
                        setSelectedLead(lead);
                        setShowLeadModal(true);
                      }}
                      className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {viewMode === 'commission' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Commission Tracking</h3>
              <button
                onClick={() => {}}
                className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Download className="h-4 w-4" />
                Export Report
              </button>
            </div>
            
            {/* Commission Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Wallet className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-green-600">Total Earned</span>
                </div>
                <div className="text-2xl font-bold text-green-700">{formatCurrency(agentMetrics.totalCommission)}</div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-600">This Month</span>
                </div>
                <div className="text-2xl font-bold text-blue-700">{formatCurrency(agentMetrics.monthlyCommission)}</div>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Calculator className="h-5 w-5 text-purple-600" />
                  <span className="text-sm font-medium text-purple-600">Average Deal</span>
                </div>
                <div className="text-2xl font-bold text-purple-700">{formatCurrency(agentMetrics.averageDealValue)}</div>
              </div>
              
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Handshake className="h-5 w-5 text-orange-600" />
                  <span className="text-sm font-medium text-orange-600">Deals Closed</span>
                </div>
                <div className="text-2xl font-bold text-orange-700">{agentMetrics.closedDealsThisMonth}</div>
              </div>
            </div>
            
            {/* Commission Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Property</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Client</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Deal Value</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Commission Rate</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Commission</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {commissions.map(commission => (
                    <tr key={commission.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900">{commission.propertyTitle}</div>
                        <div className="text-sm text-gray-600 capitalize">{commission.dealType}</div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">{commission.clientName}</td>
                      <td className="py-3 px-4 text-sm font-medium text-gray-900">{formatCurrency(commission.dealValue)}</td>
                      <td className="py-3 px-4 text-sm text-gray-900">{commission.commissionRate}%</td>
                      <td className="py-3 px-4 text-sm font-bold text-green-600">{formatCurrency(commission.commissionAmount)}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          commission.status === 'paid' ? 'bg-green-100 text-green-800' :
                          commission.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {commission.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">{formatDate(commission.dateCompleted)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {viewMode === 'bookings' && (
        <BookingManagement userRole="agent" userId={userId} />
      )}

      {viewMode === 'documents' && (
        <DocumentManagement userRole="agent" userId={userId} />
      )}

      {viewMode === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Performance Analytics */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Analytics</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Lead Conversion Rate</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${agentMetrics.conversionRate}%` }}></div>
                  </div>
                  <span className="text-sm font-medium">{agentMetrics.conversionRate}%</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Monthly Target Achievement</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                  <span className="text-sm font-medium">85%</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Client Satisfaction</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                  </div>
                  <span className="text-sm font-medium">92%</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Response Time</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div className="bg-orange-600 h-2 rounded-full" style={{ width: '78%' }}></div>
                  </div>
                  <span className="text-sm font-medium">2.3 hrs avg</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Revenue Analytics */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Analytics</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <div className="text-sm text-green-600">Sales Commission</div>
                  <div className="text-lg font-bold text-green-700">{formatCurrency(12500)}</div>
                </div>
                <ArrowUpRight className="h-5 w-5 text-green-600" />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <div className="text-sm text-blue-600">Rental Commission</div>
                  <div className="text-lg font-bold text-blue-700">{formatCurrency(3250)}</div>
                </div>
                <ArrowUpRight className="h-5 w-5 text-blue-600" />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div>
                  <div className="text-sm text-purple-600">Referral Bonus</div>
                  <div className="text-lg font-bold text-purple-700">{formatCurrency(500)}</div>
                </div>
                <ArrowUpRight className="h-5 w-5 text-purple-600" />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="text-sm text-gray-600">Total This Month</div>
                  <div className="text-xl font-bold text-gray-900">{formatCurrency(agentMetrics.monthlyCommission)}</div>
                </div>
                <TrendingUp className="h-5 w-5 text-gray-600" />
              </div>
            </div>
          </div>
        </div>
      )}

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
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">{selectedProperty.title}</h4>
                      <div className="text-2xl font-bold text-green-700">{formatCurrency(selectedProperty.price)}</div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-600">{selectedProperty.location}</span>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Bed className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{selectedProperty.bedrooms} beds</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Bath className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{selectedProperty.bathrooms} baths</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Square className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{selectedProperty.area} sqft</span>
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Description</h5>
                      <p className="text-gray-600 text-sm leading-relaxed">{selectedProperty.description}</p>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Features</h5>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedProperty.features?.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500" />
                            <span className="text-sm text-gray-600">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Client Details Modal */}
      {showClientModal && selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Client Details</h3>
                <button
                  onClick={() => {
                    setShowClientModal(false);
                    setSelectedClient(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">{selectedClient.name}</h4>
                    <p className="text-gray-600">{selectedClient.email}</p>
                    <p className="text-gray-600">{selectedClient.phone}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Client Type</label>
                    <p className="text-gray-900 capitalize">{selectedClient.type}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Status</label>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      selectedClient.status === 'active' ? 'bg-green-100 text-green-800' :
                      selectedClient.status === 'potential' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedClient.status}
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Recent Activity</label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">Last contact: {formatDate(selectedClient.lastContact)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Eye className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">Properties viewed: {selectedClient.propertiesViewed}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Notes</label>
                  <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-lg">
                    {selectedClient.notes || 'No notes available'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lead Details Modal */}
      {showLeadModal && selectedLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Lead Details</h3>
                <button
                  onClick={() => {
                    setShowLeadModal(false);
                    setSelectedLead(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                    <UserPlus className="h-8 w-8 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">{selectedLead.name}</h4>
                    <p className="text-gray-600">{selectedLead.email}</p>
                    <p className="text-gray-600">{selectedLead.phone}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Source</label>
                    <p className="text-gray-900 capitalize">{selectedLead.source}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Priority</label>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      selectedLead.priority === 'high' ? 'bg-red-100 text-red-800' :
                      selectedLead.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {selectedLead.priority}
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Interest</label>
                  <p className="text-gray-900">{selectedLead.interest}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Budget Range</label>
                  <p className="text-gray-900">{formatCurrency(selectedLead.budgetMin)} - {formatCurrency(selectedLead.budgetMax)}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Timeline</label>
                  <p className="text-gray-900 capitalize">{selectedLead.timeline}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Notes</label>
                  <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-lg">
                    {selectedLead.notes || 'No notes available'}
                  </p>
                </div>
                
                <div className="flex gap-3">
                  <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    Convert to Client
                  </button>
                  <button className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                    Schedule Follow-up
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentDashboard;