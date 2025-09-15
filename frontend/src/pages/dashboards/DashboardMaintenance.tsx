import React, { useState, useEffect } from 'react';
import { Wrench, AlertTriangle, CheckCircle, Clock, User, MapPin, Calendar, Search, Filter, Plus, Eye, Edit, Trash2 } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { UserRole } from '../../types/auth';

interface MaintenanceRequest {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyAddress: string;
  tenantId: string;
  tenantName: string;
  title: string;
  description: string;
  category: 'plumbing' | 'electrical' | 'heating' | 'appliances' | 'structural' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  assignedTo?: string;
  assignedToName?: string;
  createdAt: string;
  updatedAt: string;
  scheduledDate?: string;
  completedDate?: string;
  estimatedCost?: number;
  actualCost?: number;
  images?: string[];
  notes?: string;
}

interface MaintenanceStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  urgent: number;
  avgResolutionTime: number;
  totalCost: number;
}

const DashboardMaintenance: React.FC = () => {
  const { user } = useAuthStore();
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [stats, setStats] = useState<MaintenanceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    // Simulate API call
    const fetchMaintenanceData = async () => {
      setLoading(true);
      
      // Mock maintenance requests
      const mockRequests: MaintenanceRequest[] = [
        {
          id: '1',
          propertyId: '1',
          propertyTitle: 'Modern 2-Bed Apartment',
          propertyAddress: '123 High Street, London, SW1A 1AA',
          tenantId: 'tenant1',
          tenantName: 'John Smith',
          title: 'Heating System Not Working',
          description: 'The central heating system has stopped working. Radiators are cold and the boiler is making strange noises.',
          category: 'heating',
          priority: 'urgent',
          status: 'pending',
          createdAt: '2024-01-25T10:30:00Z',
          updatedAt: '2024-01-25T10:30:00Z',
          estimatedCost: 250
        },
        {
          id: '2',
          propertyId: '2',
          propertyTitle: 'Victorian Terrace House',
          propertyAddress: '456 Oak Avenue, Manchester, M1 2AB',
          tenantId: 'tenant2',
          tenantName: 'Sarah Johnson',
          title: 'Kitchen Sink Leak',
          description: 'Water is leaking from under the kitchen sink. The cabinet is getting damaged.',
          category: 'plumbing',
          priority: 'high',
          status: 'assigned',
          assignedTo: 'maintenance1',
          assignedToName: 'Mike Wilson',
          createdAt: '2024-01-24T14:15:00Z',
          updatedAt: '2024-01-25T09:00:00Z',
          scheduledDate: '2024-01-26T10:00:00Z',
          estimatedCost: 150
        },
        {
          id: '3',
          propertyId: '3',
          propertyTitle: 'Studio Flat City Center',
          propertyAddress: '789 City Road, Birmingham, B1 3CD',
          tenantId: 'tenant3',
          tenantName: 'Emma Davis',
          title: 'Electrical Outlet Not Working',
          description: 'The electrical outlet in the bedroom has stopped working. No power to any devices plugged in.',
          category: 'electrical',
          priority: 'medium',
          status: 'in_progress',
          assignedTo: 'maintenance2',
          assignedToName: 'Tom Brown',
          createdAt: '2024-01-23T16:45:00Z',
          updatedAt: '2024-01-25T11:30:00Z',
          scheduledDate: '2024-01-25T14:00:00Z',
          estimatedCost: 100
        },
        {
          id: '4',
          propertyId: '4',
          propertyTitle: 'Luxury Penthouse',
          propertyAddress: '321 Park Lane, London, W1K 4EF',
          tenantId: 'tenant4',
          tenantName: 'David Wilson',
          title: 'Dishwasher Repair',
          description: 'The dishwasher is not draining properly and leaving dishes dirty.',
          category: 'appliances',
          priority: 'low',
          status: 'completed',
          assignedTo: 'maintenance1',
          assignedToName: 'Mike Wilson',
          createdAt: '2024-01-20T11:20:00Z',
          updatedAt: '2024-01-22T15:30:00Z',
          completedDate: '2024-01-22T15:30:00Z',
          estimatedCost: 120,
          actualCost: 95,
          notes: 'Replaced drain pump and cleaned filters. Working properly now.'
        },
        {
          id: '5',
          propertyId: '5',
          propertyTitle: 'Garden Flat',
          propertyAddress: '654 Green Street, Edinburgh, EH1 5GH',
          tenantId: 'tenant5',
          tenantName: 'Lisa Anderson',
          title: 'Window Lock Broken',
          description: 'The lock on the main bedroom window is broken and the window won\'t stay closed properly.',
          category: 'structural',
          priority: 'medium',
          status: 'pending',
          createdAt: '2024-01-22T09:15:00Z',
          updatedAt: '2024-01-22T09:15:00Z',
          estimatedCost: 80
        }
      ];

      // Mock stats
      const mockStats: MaintenanceStats = {
        total: mockRequests.length,
        pending: mockRequests.filter(r => r.status === 'pending').length,
        inProgress: mockRequests.filter(r => r.status === 'in_progress').length,
        completed: mockRequests.filter(r => r.status === 'completed').length,
        urgent: mockRequests.filter(r => r.priority === 'urgent').length,
        avgResolutionTime: 2.5,
        totalCost: mockRequests.reduce((sum, r) => sum + (r.actualCost || r.estimatedCost || 0), 0)
      };

      setRequests(mockRequests);
      setStats(mockStats);
      setLoading(false);
    };

    fetchMaintenanceData();
  }, [user]);

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.propertyTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.tenantName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || request.priority === priorityFilter;
    const matchesCategory = categoryFilter === 'all' || request.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'assigned': return <User className="h-4 w-4" />;
      case 'in_progress': return <Wrench className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const canManageRequests = () => {
    return user?.role === UserRole.ADMIN || user?.role === UserRole.AGENT || user?.role === UserRole.LANDLORD;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Maintenance Management</h1>
          <p className="text-gray-600">Track and manage property maintenance requests</p>
        </div>
        <div className="flex gap-2">
          {canManageRequests() && (
            <button 
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              New Request
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Wrench className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Wrench className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.inProgress}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.completed}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Urgent</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.urgent}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Calendar className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Resolution</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.avgResolutionTime}d</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <span className="text-emerald-600 font-bold text-lg">£</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Cost</p>
                <p className="text-2xl font-semibold text-gray-900">£{stats.totalCost.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search maintenance requests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Priority</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            <option value="plumbing">Plumbing</option>
            <option value="electrical">Electrical</option>
            <option value="heating">Heating</option>
            <option value="appliances">Appliances</option>
            <option value="structural">Structural</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Maintenance Requests */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Request Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Property
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tenant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned To
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cost
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRequests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{request.title}</div>
                      <div className="text-sm text-gray-500 line-clamp-2">{request.description}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        {request.category.charAt(0).toUpperCase() + request.category.slice(1)} • 
                        {new Date(request.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{request.propertyTitle}</div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {request.propertyAddress}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                        <User className="h-4 w-4 text-gray-600" />
                      </div>
                      <div className="text-sm font-medium text-gray-900">{request.tenantName}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                      {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                      {getStatusIcon(request.status)}
                      <span className="ml-1">
                        {request.status.replace('_', ' ').charAt(0).toUpperCase() + request.status.replace('_', ' ').slice(1)}
                      </span>
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {request.assignedToName ? (
                      <div className="text-sm text-gray-900">{request.assignedToName}</div>
                    ) : (
                      <span className="text-sm text-gray-500">Unassigned</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      £{(request.actualCost || request.estimatedCost || 0).toLocaleString()}
                      {request.actualCost && request.estimatedCost && request.actualCost !== request.estimatedCost && (
                        <div className="text-xs text-gray-500">Est: £{request.estimatedCost.toLocaleString()}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => setSelectedRequest(request)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {canManageRequests() && (
                        <>
                          <button className="text-green-600 hover:text-green-900">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="text-red-600 hover:text-red-900">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredRequests.length === 0 && (
        <div className="text-center py-12">
          <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <div className="text-gray-500 mb-4">No maintenance requests found</div>
          <p className="text-sm text-gray-400">Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  );
};

export default DashboardMaintenance;