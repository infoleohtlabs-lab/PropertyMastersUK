import React, { useState, useEffect } from 'react';
import { FileText, Clock, CheckCircle, AlertTriangle, User, Calendar, PoundSterling, Search, Filter, Plus, Eye, Edit, Download } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

interface LegalCase {
  id: string;
  caseNumber: string;
  type: 'purchase' | 'sale' | 'remortgage' | 'transfer' | 'lease_extension' | 'other';
  status: 'new' | 'in_progress' | 'awaiting_client' | 'awaiting_third_party' | 'ready_to_complete' | 'completed' | 'on_hold';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  client: {
    id: string;
    name: string;
    email: string;
    phone: string;
    type: 'individual' | 'company';
  };
  property: {
    address: string;
    propertyType: string;
    tenure: string;
    value: number;
  };
  otherParties: {
    buyerSolicitor?: {
      firm: string;
      contact: string;
      email: string;
    };
    sellerSolicitor?: {
      firm: string;
      contact: string;
      email: string;
    };
    estateAgent?: {
      company: string;
      contact: string;
      email: string;
    };
    mortgageLender?: {
      name: string;
      contact: string;
      reference: string;
    };
  };
  timeline: {
    instructionDate: string;
    targetCompletionDate?: string;
    actualCompletionDate?: string;
    keyDates: {
      date: string;
      description: string;
      completed: boolean;
    }[];
  };
  documents: {
    id: string;
    name: string;
    type: string;
    status: 'required' | 'received' | 'reviewed' | 'approved' | 'sent';
    uploadDate?: string;
    dueDate?: string;
  }[];
  tasks: {
    id: string;
    description: string;
    assignedTo: string;
    dueDate: string;
    status: 'pending' | 'in_progress' | 'completed' | 'overdue';
    priority: 'low' | 'medium' | 'high';
  }[];
  financials: {
    propertyValue: number;
    deposit?: number;
    mortgageAmount?: number;
    stampDuty?: number;
    legalFees: number;
    disbursements: number;
    totalCosts: number;
  };
  notes: string;
  lastActivity: string;
}

const LegalCases: React.FC = () => {
  const { user } = useAuthStore();
  const [cases, setCases] = useState<LegalCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'client' | 'completion'>('date');
  const [selectedCase, setSelectedCase] = useState<LegalCase | null>(null);
  const [showCaseModal, setShowCaseModal] = useState(false);

  useEffect(() => {
    loadLegalCases();
  }, []);

  const loadLegalCases = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API call
      const mockData: LegalCase[] = [
        {
          id: '1',
          caseNumber: 'LC-2024-001',
          type: 'purchase',
          status: 'in_progress',
          priority: 'high',
          client: {
            id: 'c1',
            name: 'John & Sarah Smith',
            email: 'john.smith@email.com',
            phone: '+44 7700 900123',
            type: 'individual'
          },
          property: {
            address: '123 Oak Avenue, Birmingham, B15 2TT',
            propertyType: 'House',
            tenure: 'Freehold',
            value: 350000
          },
          otherParties: {
            sellerSolicitor: {
              firm: 'Brown & Associates',
              contact: 'Michael Brown',
              email: 'mbrown@brownlaw.co.uk'
            },
            estateAgent: {
              company: 'Prime Properties',
              contact: 'Lisa Johnson',
              email: 'lisa@primeproperties.co.uk'
            },
            mortgageLender: {
              name: 'Halifax',
              contact: 'Mortgage Team',
              reference: 'HAL-2024-001234'
            }
          },
          timeline: {
            instructionDate: '2024-01-10',
            targetCompletionDate: '2024-02-15',
            keyDates: [
              { date: '2024-01-10', description: 'Instructions received', completed: true },
              { date: '2024-01-15', description: 'Contract received from seller', completed: true },
              { date: '2024-01-20', description: 'Local searches ordered', completed: true },
              { date: '2024-01-25', description: 'Mortgage offer received', completed: false },
              { date: '2024-02-01', description: 'Exchange contracts', completed: false },
              { date: '2024-02-15', description: 'Completion', completed: false }
            ]
          },
          documents: [
            { id: 'd1', name: 'Draft Contract', type: 'contract', status: 'received', uploadDate: '2024-01-15' },
            { id: 'd2', name: 'Local Search Results', type: 'search', status: 'received', uploadDate: '2024-01-22' },
            { id: 'd3', name: 'Mortgage Offer', type: 'mortgage', status: 'required', dueDate: '2024-01-25' },
            { id: 'd4', name: 'Survey Report', type: 'survey', status: 'received', uploadDate: '2024-01-18' },
            { id: 'd5', name: 'Insurance Policy', type: 'insurance', status: 'required', dueDate: '2024-02-01' }
          ],
          tasks: [
            {
              id: 't1',
              description: 'Review mortgage offer terms',
              assignedTo: 'Sarah Wilson',
              dueDate: '2024-01-26',
              status: 'pending',
              priority: 'high'
            },
            {
              id: 't2',
              description: 'Prepare contract report for client',
              assignedTo: 'Sarah Wilson',
              dueDate: '2024-01-24',
              status: 'in_progress',
              priority: 'medium'
            }
          ],
          financials: {
            propertyValue: 350000,
            deposit: 70000,
            mortgageAmount: 280000,
            stampDuty: 7500,
            legalFees: 1200,
            disbursements: 450,
            totalCosts: 9150
          },
          notes: 'First-time buyers. Chain-free purchase. Client very keen to complete quickly.',
          lastActivity: '2024-01-22'
        },
        {
          id: '2',
          caseNumber: 'LC-2024-002',
          type: 'sale',
          status: 'awaiting_client',
          priority: 'medium',
          client: {
            id: 'c2',
            name: 'Property Investments Ltd',
            email: 'admin@propertyinvestments.co.uk',
            phone: '+44 121 555 0123',
            type: 'company'
          },
          property: {
            address: '45 High Street, Manchester, M1 4BT',
            propertyType: 'Commercial',
            tenure: 'Freehold',
            value: 750000
          },
          otherParties: {
            buyerSolicitor: {
              firm: 'City Legal Services',
              contact: 'David Thompson',
              email: 'dthompson@citylegal.co.uk'
            },
            estateAgent: {
              company: 'Commercial Property Solutions',
              contact: 'Mark Roberts',
              email: 'mark@cpsolutions.co.uk'
            }
          },
          timeline: {
            instructionDate: '2024-01-05',
            targetCompletionDate: '2024-02-20',
            keyDates: [
              { date: '2024-01-05', description: 'Instructions received', completed: true },
              { date: '2024-01-12', description: 'Contract pack prepared', completed: true },
              { date: '2024-01-18', description: 'Awaiting signed contract from client', completed: false },
              { date: '2024-02-05', description: 'Exchange contracts', completed: false },
              { date: '2024-02-20', description: 'Completion', completed: false }
            ]
          },
          documents: [
            { id: 'd6', name: 'Title Deeds', type: 'title', status: 'reviewed', uploadDate: '2024-01-08' },
            { id: 'd7', name: 'Commercial Lease', type: 'lease', status: 'reviewed', uploadDate: '2024-01-10' },
            { id: 'd8', name: 'Signed Contract', type: 'contract', status: 'required', dueDate: '2024-01-25' },
            { id: 'd9', name: 'Company Resolution', type: 'corporate', status: 'required', dueDate: '2024-01-25' }
          ],
          tasks: [
            {
              id: 't3',
              description: 'Chase client for signed contract',
              assignedTo: 'Michael Chen',
              dueDate: '2024-01-24',
              status: 'overdue',
              priority: 'high'
            },
            {
              id: 't4',
              description: 'Prepare completion statement',
              assignedTo: 'Michael Chen',
              dueDate: '2024-02-01',
              status: 'pending',
              priority: 'medium'
            }
          ],
          financials: {
            propertyValue: 750000,
            legalFees: 2500,
            disbursements: 750,
            totalCosts: 3250
          },
          notes: 'Commercial property sale. Tenant in situ with 10-year lease.',
          lastActivity: '2024-01-20'
        },
        {
          id: '3',
          caseNumber: 'LC-2024-003',
          type: 'remortgage',
          status: 'ready_to_complete',
          priority: 'low',
          client: {
            id: 'c3',
            name: 'Emma Thompson',
            email: 'emma.thompson@email.com',
            phone: '+44 7700 900456',
            type: 'individual'
          },
          property: {
            address: '78 Garden Lane, Leeds, LS6 3QR',
            propertyType: 'House',
            tenure: 'Freehold',
            value: 280000
          },
          otherParties: {
            mortgageLender: {
              name: 'Nationwide',
              contact: 'Remortgage Team',
              reference: 'NW-2024-005678'
            }
          },
          timeline: {
            instructionDate: '2024-01-08',
            targetCompletionDate: '2024-01-30',
            keyDates: [
              { date: '2024-01-08', description: 'Instructions received', completed: true },
              { date: '2024-01-12', description: 'Mortgage offer received', completed: true },
              { date: '2024-01-20', description: 'Legal charge prepared', completed: true },
              { date: '2024-01-25', description: 'Documents signed by client', completed: true },
              { date: '2024-01-30', description: 'Completion', completed: false }
            ]
          },
          documents: [
            { id: 'd10', name: 'Mortgage Offer', type: 'mortgage', status: 'approved', uploadDate: '2024-01-12' },
            { id: 'd11', name: 'Legal Charge', type: 'charge', status: 'approved', uploadDate: '2024-01-20' },
            { id: 'd12', name: 'Signed Documents', type: 'signed', status: 'received', uploadDate: '2024-01-25' }
          ],
          tasks: [
            {
              id: 't5',
              description: 'Submit completion documents to lender',
              assignedTo: 'Sarah Wilson',
              dueDate: '2024-01-29',
              status: 'pending',
              priority: 'medium'
            }
          ],
          financials: {
            propertyValue: 280000,
            mortgageAmount: 200000,
            legalFees: 800,
            disbursements: 200,
            totalCosts: 1000
          },
          notes: 'Simple remortgage. All documents ready for completion.',
          lastActivity: '2024-01-25'
        }
      ];
      setCases(mockData);
    } catch (error) {
      console.error('Error loading legal cases:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredAndSortedCases = () => {
    let filtered = cases;
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(c => 
        c.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.property.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(c => c.status === statusFilter);
    }
    
    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(c => c.type === typeFilter);
    }
    
    // Apply priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(c => c.priority === priorityFilter);
    }
    
    // Apply sort
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'client':
          return a.client.name.localeCompare(b.client.name);
        case 'priority':
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'completion':
          if (!a.timeline.targetCompletionDate) return 1;
          if (!b.timeline.targetCompletionDate) return -1;
          return new Date(a.timeline.targetCompletionDate).getTime() - new Date(b.timeline.targetCompletionDate).getTime();
        case 'date':
        default:
          return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime();
      }
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'awaiting_client':
        return 'bg-orange-100 text-orange-800';
      case 'awaiting_third_party':
        return 'bg-purple-100 text-purple-800';
      case 'ready_to_complete':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'on_hold':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'pending':
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const getOverdueTasks = () => {
    return cases.reduce((total, c) => {
      return total + c.tasks.filter(t => t.status === 'overdue').length;
    }, 0);
  };

  const getUpcomingDeadlines = () => {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return cases.reduce((total, c) => {
      return total + c.tasks.filter(t => {
        const dueDate = new Date(t.dueDate);
        return dueDate >= today && dueDate <= nextWeek && t.status !== 'completed';
      }).length;
    }, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading legal cases...</p>
        </div>
      </div>
    );
  }

  const filteredCases = getFilteredAndSortedCases();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Legal Cases</h1>
              <p className="mt-2 text-gray-600">
                Manage conveyancing and legal matters for your clients
              </p>
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              New Case
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Cases</p>
                <p className="text-2xl font-bold text-gray-900">
                  {cases.filter(c => !['completed', 'on_hold'].includes(c.status)).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Overdue Tasks</p>
                <p className="text-2xl font-bold text-gray-900">{getOverdueTasks()}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Due This Week</p>
                <p className="text-2xl font-bold text-gray-900">{getUpcomingDeadlines()}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {cases.filter(c => c.status === 'completed').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search cases, clients, or addresses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-600" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="new">New</option>
                  <option value="in_progress">In Progress</option>
                  <option value="awaiting_client">Awaiting Client</option>
                  <option value="awaiting_third_party">Awaiting Third Party</option>
                  <option value="ready_to_complete">Ready to Complete</option>
                  <option value="completed">Completed</option>
                  <option value="on_hold">On Hold</option>
                </select>
              </div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="purchase">Purchase</option>
                <option value="sale">Sale</option>
                <option value="remortgage">Remortgage</option>
                <option value="transfer">Transfer</option>
                <option value="lease_extension">Lease Extension</option>
                <option value="other">Other</option>
              </select>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="date">Last Activity</option>
                <option value="priority">Priority</option>
                <option value="client">Client Name</option>
                <option value="completion">Completion Date</option>
              </select>
            </div>
          </div>
        </div>

        {/* Cases List */}
        {filteredCases.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No cases found</h3>
            <p className="text-gray-600">No cases match your current filters.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCases.map((legalCase) => (
              <div key={legalCase.id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{legalCase.caseNumber}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(legalCase.status)}`}>
                          {legalCase.status.replace('_', ' ').toUpperCase()}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(legalCase.priority)}`}>
                          {legalCase.priority.toUpperCase()}
                        </span>
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                          {legalCase.type.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <User className="h-4 w-4 mr-1" />
                        <span className="font-medium">{legalCase.client.name}</span>
                        <span className="mx-2">•</span>
                        <span>{legalCase.client.type}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{legalCase.property.address}</p>
                    </div>
                    <div className="text-right ml-6">
                      <div className="text-lg font-bold text-blue-600">{formatPrice(legalCase.property.value)}</div>
                      <div className="text-sm text-gray-600">{legalCase.property.propertyType}</div>
                      <div className="text-sm text-gray-600">{legalCase.property.tenure}</div>
                    </div>
                  </div>

                  {/* Timeline Progress */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Progress</span>
                      {legalCase.timeline.targetCompletionDate && (
                        <span className="text-sm text-gray-600">
                          Target: {new Date(legalCase.timeline.targetCompletionDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ 
                          width: `${(legalCase.timeline.keyDates.filter(d => d.completed).length / legalCase.timeline.keyDates.length) * 100}%` 
                        }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {legalCase.timeline.keyDates.filter(d => d.completed).length} of {legalCase.timeline.keyDates.length} milestones completed
                    </div>
                  </div>

                  {/* Tasks Summary */}
                  {legalCase.tasks.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Tasks</h4>
                      <div className="space-y-2">
                        {legalCase.tasks.slice(0, 2).map((task) => (
                          <div key={task.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div className="flex-1">
                              <p className="text-sm text-gray-900">{task.description}</p>
                              <p className="text-xs text-gray-600">Assigned to: {task.assignedTo}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTaskStatusColor(task.status)}`}>
                                {task.status.replace('_', ' ').toUpperCase()}
                              </span>
                              <span className="text-xs text-gray-600">
                                {new Date(task.dueDate).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        ))}
                        {legalCase.tasks.length > 2 && (
                          <p className="text-xs text-gray-600">+{legalCase.tasks.length - 2} more tasks</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Financial Summary */}
                  <div className="mb-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Legal Fees:</span>
                        <p className="font-medium">{formatPrice(legalCase.financials.legalFees)}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Disbursements:</span>
                        <p className="font-medium">{formatPrice(legalCase.financials.disbursements)}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Total Costs:</span>
                        <p className="font-medium">{formatPrice(legalCase.financials.totalCosts)}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Last Activity:</span>
                        <p className="font-medium">{new Date(legalCase.lastActivity).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center space-x-3">
                      <button 
                        onClick={() => {
                          setSelectedCase(legalCase);
                          setShowCaseModal(true);
                        }}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm flex items-center"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </button>
                      <button className="text-gray-600 hover:text-gray-800 text-sm font-medium flex items-center">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </button>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        Schedule
                      </button>
                      <button className="text-gray-600 hover:text-gray-800 text-sm font-medium flex items-center">
                        <Download className="h-4 w-4 mr-1" />
                        Documents
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LegalCases;