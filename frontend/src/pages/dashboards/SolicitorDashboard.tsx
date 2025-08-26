import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Scale,
  FileText,
  Users,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  Banknote,
  MessageSquare,
  Search,
  Filter,
  Plus,
  Eye,
  Download,
  Upload,
  Phone,
  Mail,
  MapPin,
  Building,
  Home,
  Briefcase,
  Shield,
  ExternalLink,
  MoreHorizontal,
  Star,
  TrendingUp,
  Receipt,
  Gavel
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { useAuthStore } from '../../stores/authStore';
import { showToast } from '../../components/ui/Toast';

interface SolicitorStats {
  activeCases: number;
  completedCases: number;
  totalClients: number;
  monthlyRevenue: number;
  pendingDocuments: number;
  upcomingDeadlines: number;
  averageCaseValue: number;
  completionRate: number;
}

interface LegalCase {
  id: string;
  caseNumber: string;
  title: string;
  type: 'conveyancing' | 'lease' | 'dispute' | 'planning' | 'commercial' | 'litigation';
  status: 'active' | 'pending' | 'completed' | 'on_hold' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  client: {
    id: string;
    name: string;
    email: string;
    phone: string;
    company?: string;
  };
  property?: {
    address: string;
    value: number;
    type: string;
  };
  startDate: string;
  expectedCompletion: string;
  actualCompletion?: string;
  value: number;
  timeSpent: number;
  billableHours: number;
  hourlyRate: number;
  totalBilled: number;
  nextAction: string;
  nextDeadline: string;
  assignedTo: string[];
  documents: string[];
  notes: string;
}

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  type: 'individual' | 'business' | 'developer' | 'investor';
  status: 'active' | 'inactive' | 'prospect';
  totalCases: number;
  totalValue: number;
  lastContact: string;
  preferredContact: 'email' | 'phone' | 'post';
  address: {
    street: string;
    city: string;
    postcode: string;
  };
  notes: string;
}

interface Document {
  id: string;
  name: string;
  type: 'contract' | 'deed' | 'certificate' | 'correspondence' | 'report' | 'other';
  caseId: string;
  clientId: string;
  uploadDate: string;
  lastModified: string;
  size: string;
  status: 'draft' | 'review' | 'approved' | 'signed' | 'filed';
  version: number;
  uploadedBy: string;
  url: string;
}

interface Deadline {
  id: string;
  caseId: string;
  caseTitle: string;
  title: string;
  description: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'completed' | 'overdue';
  assignedTo: string;
  type: 'court_filing' | 'completion' | 'exchange' | 'search' | 'other';
}

const SolicitorDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<SolicitorStats>({
    activeCases: 0,
    completedCases: 0,
    totalClients: 0,
    monthlyRevenue: 0,
    pendingDocuments: 0,
    upcomingDeadlines: 0,
    averageCaseValue: 0,
    completionRate: 0
  });
  const [cases, setCases] = useState<LegalCase[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'cases' | 'clients' | 'documents' | 'deadlines' | 'billing'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [showCaseModal, setShowCaseModal] = useState(false);
  const [selectedCase, setSelectedCase] = useState<LegalCase | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API calls
      setStats({
        activeCases: 24,
        completedCases: 156,
        totalClients: 89,
        monthlyRevenue: 45750,
        pendingDocuments: 12,
        upcomingDeadlines: 8,
        averageCaseValue: 125000,
        completionRate: 94.2
      });

      setCases([
        {
          id: 'c1',
          caseNumber: 'CONV-2024-001',
          title: 'Residential Purchase - 15 Oak Street',
          type: 'conveyancing',
          status: 'active',
          priority: 'high',
          client: {
            id: 'cl1',
            name: 'Sarah Johnson',
            email: 'sarah.johnson@email.com',
            phone: '+44 7700 900123'
          },
          property: {
            address: '15 Oak Street, Manchester M1 2AB',
            value: 425000,
            type: 'Residential'
          },
          startDate: '2024-01-15',
          expectedCompletion: '2024-02-28',
          value: 425000,
          timeSpent: 15.5,
          billableHours: 12.0,
          hourlyRate: 350,
          totalBilled: 4200,
          nextAction: 'Exchange contracts',
          nextDeadline: '2024-02-15',
          assignedTo: ['John Smith', 'Emma Wilson'],
          documents: ['Purchase Agreement', 'Survey Report', 'Mortgage Offer'],
          notes: 'Client is keen to complete quickly. Mortgage approved.'
        },
        {
          id: 'c2',
          caseNumber: 'LEASE-2024-002',
          title: 'Commercial Lease - City Centre Office',
          type: 'lease',
          status: 'active',
          priority: 'medium',
          client: {
            id: 'cl2',
            name: 'TechStart Ltd',
            email: 'legal@techstart.com',
            phone: '+44 161 123 4567',
            company: 'TechStart Ltd'
          },
          property: {
            address: '42 Business Park, Manchester M3 4RT',
            value: 2500000,
            type: 'Commercial'
          },
          startDate: '2024-01-10',
          expectedCompletion: '2024-02-20',
          value: 2500000,
          timeSpent: 8.0,
          billableHours: 6.5,
          hourlyRate: 400,
          totalBilled: 2600,
          nextAction: 'Review lease terms',
          nextDeadline: '2024-02-10',
          assignedTo: ['Michael Brown'],
          documents: ['Lease Agreement', 'Building Survey'],
          notes: 'Complex commercial lease with break clauses.'
        }
      ]);

      setClients([
        {
          id: 'cl1',
          name: 'Sarah Johnson',
          email: 'sarah.johnson@email.com',
          phone: '+44 7700 900123',
          type: 'individual',
          status: 'active',
          totalCases: 2,
          totalValue: 650000,
          lastContact: '2024-01-20',
          preferredContact: 'email',
          address: {
            street: '123 Main Street',
            city: 'Manchester',
            postcode: 'M1 1AA'
          },
          notes: 'First-time buyer, very responsive.'
        },
        {
          id: 'cl2',
          name: 'TechStart Ltd',
          email: 'legal@techstart.com',
          phone: '+44 161 123 4567',
          company: 'TechStart Ltd',
          type: 'business',
          status: 'active',
          totalCases: 5,
          totalValue: 3200000,
          lastContact: '2024-01-18',
          preferredContact: 'email',
          address: {
            street: '456 Business Avenue',
            city: 'Manchester',
            postcode: 'M3 2BB'
          },
          notes: 'Growing tech company, regular client.'
        }
      ]);

      setDocuments([
        {
          id: 'd1',
          name: 'Purchase Agreement - 15 Oak Street.pdf',
          type: 'contract',
          caseId: 'c1',
          clientId: 'cl1',
          uploadDate: '2024-01-16',
          lastModified: '2024-01-18',
          size: '2.4 MB',
          status: 'review',
          version: 2,
          uploadedBy: 'John Smith',
          url: '#'
        },
        {
          id: 'd2',
          name: 'Commercial Lease Draft.docx',
          type: 'contract',
          caseId: 'c2',
          clientId: 'cl2',
          uploadDate: '2024-01-12',
          lastModified: '2024-01-19',
          size: '1.8 MB',
          status: 'draft',
          version: 3,
          uploadedBy: 'Michael Brown',
          url: '#'
        }
      ]);

      setDeadlines([
        {
          id: 'dl1',
          caseId: 'c1',
          caseTitle: 'Residential Purchase - 15 Oak Street',
          title: 'Exchange Contracts',
          description: 'Exchange contracts with seller',
          dueDate: '2024-02-15',
          priority: 'high',
          status: 'pending',
          assignedTo: 'John Smith',
          type: 'exchange'
        },
        {
          id: 'dl2',
          caseId: 'c2',
          caseTitle: 'Commercial Lease - City Centre Office',
          title: 'Lease Review Complete',
          description: 'Complete review of lease terms',
          dueDate: '2024-02-10',
          priority: 'medium',
          status: 'pending',
          assignedTo: 'Michael Brown',
          type: 'other'
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
      case 'active': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'completed': return 'text-blue-600 bg-blue-100';
      case 'on_hold': return 'text-orange-600 bg-orange-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      case 'overdue': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'text-blue-600 bg-blue-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'urgent': case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatCurrency = (amount: number) => {
    return `£${amount.toLocaleString()}`;
  };

  const filteredCases = cases.filter(caseItem => {
    const matchesSearch = caseItem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         caseItem.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         caseItem.client.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || caseItem.status === filterStatus;
    const matchesType = filterType === 'all' || caseItem.type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

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
          Manage your legal cases, clients, and documents efficiently.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Scale className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Cases</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeCases}</p>
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
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedCases}</p>
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
                <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.monthlyRevenue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <FileText className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Docs</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingDocuments}</p>
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
                <p className="text-sm font-medium text-gray-600">Deadlines</p>
                <p className="text-2xl font-bold text-gray-900">{stats.upcomingDeadlines}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-teal-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-teal-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Case Value</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.averageCaseValue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-pink-100 rounded-lg">
                <Star className="h-6 w-6 text-pink-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completionRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: Scale },
            { id: 'cases', label: 'Cases', icon: Briefcase },
            { id: 'clients', label: 'Clients', icon: Users },
            { id: 'documents', label: 'Documents', icon: FileText },
            { id: 'deadlines', label: 'Deadlines', icon: Clock },
            { id: 'billing', label: 'Billing', icon: Receipt }
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
                <button className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="text-center">
                    <Plus className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <span className="text-sm font-medium text-gray-900">New Case</span>
                  </div>
                </button>
                <Link to="/communications" className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="text-center">
                    <MessageSquare className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <span className="text-sm font-medium text-gray-900">Communications</span>
                    <ExternalLink className="h-3 w-3 text-gray-400 ml-1 inline" />
                  </div>
                </Link>
                <Link to="/documents" className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="text-center">
                    <FileText className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <span className="text-sm font-medium text-gray-900">Documents</span>
                    <ExternalLink className="h-3 w-3 text-gray-400 ml-1 inline" />
                  </div>
                </Link>
                <Link to="/reports" className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="text-center">
                    <TrendingUp className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                    <span className="text-sm font-medium text-gray-900">Reports</span>
                    <ExternalLink className="h-3 w-3 text-gray-400 ml-1 inline" />
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Cases */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Recent Cases</span>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View All
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cases.slice(0, 3).map((caseItem) => (
                    <div key={caseItem.id} className="p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{caseItem.title}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(caseItem.status)}`}>
                          {caseItem.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{caseItem.caseNumber}</p>
                      <p className="text-sm text-gray-600 mb-2">Client: {caseItem.client.name}</p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Value: {formatCurrency(caseItem.value)}</span>
                        <span className="text-gray-500">Due: {new Date(caseItem.nextDeadline).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Deadlines */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Upcoming Deadlines</span>
                  <Button variant="outline" size="sm">
                    <Calendar className="h-4 w-4 mr-2" />
                    View Calendar
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {deadlines.slice(0, 3).map((deadline) => (
                    <div key={deadline.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{deadline.title}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(deadline.priority)}`}>
                          {deadline.priority}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{deadline.caseTitle}</p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Assigned: {deadline.assignedTo}</span>
                        <span className="text-gray-500">Due: {new Date(deadline.dueDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Cases Tab */}
      {activeTab === 'cases' && (
        <div>
          {/* Cases Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Input
                placeholder="Search cases..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<Search className="h-4 w-4" />}
                className="w-64"
              />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="on_hold">On Hold</option>
              </select>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="conveyancing">Conveyancing</option>
                <option value="lease">Lease</option>
                <option value="dispute">Dispute</option>
                <option value="planning">Planning</option>
                <option value="commercial">Commercial</option>
              </select>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Case
            </Button>
          </div>

          {/* Cases Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Case
                      </th>
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
                        Value
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Next Deadline
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredCases.map((caseItem) => (
                      <tr key={caseItem.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{caseItem.title}</div>
                            <div className="text-sm text-gray-500">{caseItem.caseNumber}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{caseItem.client.name}</div>
                          <div className="text-sm text-gray-500">{caseItem.client.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="capitalize text-sm text-gray-900">{caseItem.type}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(caseItem.status)}`}>
                            {caseItem.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(caseItem.value)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(caseItem.nextDeadline).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm" onClick={() => setSelectedCase(caseItem)}>
                              <Eye className="h-4 w-4" />
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
            </CardContent>
          </Card>
        </div>
      )}

      {/* Clients Tab */}
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
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="prospect">Prospect</option>
              </select>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="individual">Individual</option>
                <option value="business">Business</option>
                <option value="developer">Developer</option>
                <option value="investor">Investor</option>
              </select>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Client
            </Button>
          </div>

          {/* Clients Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clients.map((client) => (
              <Card key={client.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg mr-3">
                        {client.type === 'business' ? (
                          <Building className="h-6 w-6 text-blue-600" />
                        ) : (
                          <Users className="h-6 w-6 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{client.name}</h3>
                        {client.company && (
                          <p className="text-sm text-gray-500">{client.company}</p>
                        )}
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      client.status === 'active' ? 'text-green-600 bg-green-100' :
                      client.status === 'inactive' ? 'text-gray-600 bg-gray-100' :
                      'text-yellow-600 bg-yellow-100'
                    }`}>
                      {client.status}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="h-4 w-4 mr-2" />
                      {client.email}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="h-4 w-4 mr-2" />
                      {client.phone}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      {client.address.city}, {client.address.postcode}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-lg font-semibold text-gray-900">{client.totalCases}</p>
                      <p className="text-xs text-gray-500">Cases</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-gray-900">{formatCurrency(client.totalValue)}</p>
                      <p className="text-xs text-gray-500">Total Value</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      Last contact: {new Date(client.lastContact).toLocaleDateString()}
                    </span>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
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

      {/* Documents Tab */}
      {activeTab === 'documents' && (
        <div>
          {/* Documents Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Input
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<Search className="h-4 w-4" />}
                className="w-64"
              />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="review">Under Review</option>
                <option value="approved">Approved</option>
                <option value="signed">Signed</option>
                <option value="filed">Filed</option>
              </select>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="contract">Contract</option>
                <option value="deed">Deed</option>
                <option value="certificate">Certificate</option>
                <option value="correspondence">Correspondence</option>
                <option value="report">Report</option>
              </select>
            </div>
            <Button>
              <Upload className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          </div>

          {/* Documents Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Document
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Case
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Version
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Modified
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {documents.map((doc) => (
                      <tr key={doc.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <FileText className="h-5 w-5 text-gray-400 mr-3" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">{doc.name}</div>
                              <div className="text-sm text-gray-500">{doc.size}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="capitalize text-sm text-gray-900">{doc.type}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {cases.find(c => c.id === doc.caseId)?.title || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            doc.status === 'approved' ? 'text-green-600 bg-green-100' :
                            doc.status === 'review' ? 'text-yellow-600 bg-yellow-100' :
                            doc.status === 'signed' ? 'text-blue-600 bg-blue-100' :
                            doc.status === 'filed' ? 'text-purple-600 bg-purple-100' :
                            'text-gray-600 bg-gray-100'
                          }`}>
                            {doc.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          v{doc.version}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(doc.lastModified).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
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
            </CardContent>
          </Card>
        </div>
      )}

      {/* Deadlines Tab */}
      {activeTab === 'deadlines' && (
        <div>
          {/* Deadlines Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Input
                placeholder="Search deadlines..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<Search className="h-4 w-4" />}
                className="w-64"
              />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="overdue">Overdue</option>
              </select>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="court_filing">Court Filing</option>
                <option value="completion">Completion</option>
                <option value="exchange">Exchange</option>
                <option value="search">Search</option>
                <option value="other">Other</option>
              </select>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Deadline
            </Button>
          </div>

          {/* Deadlines Calendar View */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Deadline Calendar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Interactive calendar view coming soon...</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Priority Deadlines</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {deadlines.filter(d => d.priority === 'high' || d.priority === 'critical').map((deadline) => (
                    <div key={deadline.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm text-gray-900">{deadline.title}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(deadline.priority)}`}>
                          {deadline.priority}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mb-1">{deadline.caseTitle}</p>
                      <p className="text-xs text-gray-500">Due: {new Date(deadline.dueDate).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Deadlines List */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Deadline
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Case
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Priority
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Due Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Assigned To
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {deadlines.map((deadline) => (
                      <tr key={deadline.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{deadline.title}</div>
                            <div className="text-sm text-gray-500">{deadline.description}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{deadline.caseTitle}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="capitalize text-sm text-gray-900">{deadline.type.replace('_', ' ')}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(deadline.priority)}`}>
                            {deadline.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(deadline.dueDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {deadline.assignedTo}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(deadline.status)}`}>
                            {deadline.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm">
                              <CheckCircle className="h-4 w-4" />
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
            </CardContent>
          </Card>
        </div>
      )}

      {/* Billing Tab */}
      {activeTab === 'billing' && (
        <div>
          {/* Billing Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Banknote className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Billed</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(156750)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Clock className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Billable Hours</p>
                    <p className="text-2xl font-bold text-gray-900">342.5</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Receipt className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Outstanding</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(23450)}</p>
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
                    <p className="text-sm font-medium text-gray-600">Avg Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(375)}/hr</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Time Tracking */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Time Entry</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Case</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option>Select a case...</option>
                      {cases.map(c => (
                        <option key={c.id} value={c.id}>{c.title}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <Input placeholder="What did you work on?" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Hours</label>
                      <Input type="number" step="0.25" placeholder="0.00" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Rate</label>
                      <Input type="number" placeholder="375" />
                    </div>
                  </div>
                  <Button className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Time Entry
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Recent Time Entries</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { case: 'Residential Purchase - 15 Oak Street', description: 'Contract review', hours: 2.5, rate: 350, date: '2024-01-20' },
                    { case: 'Commercial Lease - City Centre Office', description: 'Lease negotiation', hours: 1.5, rate: 400, date: '2024-01-19' },
                    { case: 'Residential Purchase - 15 Oak Street', description: 'Client consultation', hours: 1.0, rate: 350, date: '2024-01-18' }
                  ].map((entry, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-sm text-gray-900">{entry.case}</h4>
                        <span className="text-sm font-semibold text-gray-900">{formatCurrency(entry.hours * entry.rate)}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{entry.description}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{entry.hours}h @ {formatCurrency(entry.rate)}/hr</span>
                        <span>{new Date(entry.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Invoicing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Recent Invoices</span>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Invoice
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Invoice #
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Client
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {[
                      { id: 'INV-2024-001', client: 'Sarah Johnson', amount: 4200, status: 'paid', date: '2024-01-15' },
                      { id: 'INV-2024-002', client: 'TechStart Ltd', amount: 2600, status: 'pending', date: '2024-01-18' },
                      { id: 'INV-2024-003', client: 'Property Developers Ltd', amount: 8750, status: 'overdue', date: '2024-01-10' }
                    ].map((invoice) => (
                      <tr key={invoice.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {invoice.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {invoice.client}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(invoice.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            invoice.status === 'paid' ? 'text-green-600 bg-green-100' :
                            invoice.status === 'pending' ? 'text-yellow-600 bg-yellow-100' :
                            'text-red-600 bg-red-100'
                          }`}>
                            {invoice.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(invoice.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
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
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SolicitorDashboard;