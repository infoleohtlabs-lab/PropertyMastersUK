import React, { useState, useEffect } from 'react';
import {
  Wrench,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  User,
  MapPin,
  Phone,
  Mail,
  FileText,
  Image,
  Download,
  Edit,
  Trash2,
  Eye,
  Star,
  MessageSquare,
  Camera,
  Upload,
  DollarSign,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { useAuthStore } from '../stores/authStore';
import { showToast } from '../components/ui/Toast';

interface MaintenanceRequest {
  id: string;
  propertyId: string;
  propertyAddress: string;
  tenantId: string;
  tenantName: string;
  tenantEmail: string;
  tenantPhone: string;
  title: string;
  description: string;
  category: 'plumbing' | 'electrical' | 'heating' | 'appliances' | 'structural' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  assignedTo?: string;
  assignedContractor?: string;
  estimatedCost?: number;
  actualCost?: number;
  scheduledDate?: string;
  completedDate?: string;
  attachments: Attachment[];
  notes: Note[];
  createdAt: string;
  updatedAt: string;
}

interface Attachment {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadedBy: string;
  uploadedAt: string;
}

interface Note {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: string;
}

interface Contractor {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialties: string[];
  rating: number;
  isActive: boolean;
}

const MaintenanceManagement: React.FC = () => {
  const { user } = useAuthStore();
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null);
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [showRequestDetail, setShowRequestDetail] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'requests' | 'contractors' | 'analytics'>('requests');
  const [newRequest, setNewRequest] = useState({
    propertyId: '',
    title: '',
    description: '',
    category: 'other' as const,
    priority: 'medium' as const
  });

  useEffect(() => {
    loadMaintenanceData();
  }, []);

  const loadMaintenanceData = async () => {
    try {
      // Mock data - replace with actual API calls
      const mockRequests: MaintenanceRequest[] = [
        {
          id: 'req1',
          propertyId: 'prop1',
          propertyAddress: '123 Baker Street, London, NW1 6XE',
          tenantId: 'tenant1',
          tenantName: 'John Smith',
          tenantEmail: 'john.smith@email.com',
          tenantPhone: '+44 20 7946 0958',
          title: 'Leaking Kitchen Tap',
          description: 'The kitchen tap has been leaking for the past week. Water is dripping constantly and the issue seems to be getting worse.',
          category: 'plumbing',
          priority: 'high',
          status: 'assigned',
          assignedContractor: 'ABC Plumbing Services',
          estimatedCost: 150,
          scheduledDate: new Date(Date.now() + 86400000).toISOString(),
          attachments: [
            {
              id: 'att1',
              name: 'kitchen_tap_leak.jpg',
              type: 'image/jpeg',
              url: '/api/attachments/kitchen_tap_leak.jpg',
              uploadedBy: 'tenant1',
              uploadedAt: new Date(Date.now() - 86400000).toISOString()
            }
          ],
          notes: [
            {
              id: 'note1',
              content: 'Tenant reported the issue started after the recent cold weather.',
              authorId: 'tenant1',
              authorName: 'John Smith',
              createdAt: new Date(Date.now() - 86400000).toISOString()
            }
          ],
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          updatedAt: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: 'req2',
          propertyId: 'prop2',
          propertyAddress: '456 Oxford Street, London, W1C 1AP',
          tenantId: 'tenant2',
          tenantName: 'Sarah Johnson',
          tenantEmail: 'sarah.johnson@email.com',
          tenantPhone: '+44 20 7946 0959',
          title: 'Heating System Not Working',
          description: 'The central heating system stopped working yesterday evening. No hot water or heating throughout the property.',
          category: 'heating',
          priority: 'urgent',
          status: 'in_progress',
          assignedContractor: 'London Heating Solutions',
          estimatedCost: 300,
          actualCost: 275,
          scheduledDate: new Date().toISOString(),
          attachments: [],
          notes: [
            {
              id: 'note2',
              content: 'Emergency call-out arranged for today.',
              authorId: user?.id || 'agent1',
              authorName: user?.name || 'Property Agent',
              createdAt: new Date(Date.now() - 3600000).toISOString()
            }
          ],
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: 'req3',
          propertyId: 'prop3',
          propertyAddress: '789 Regent Street, London, W1B 4HH',
          tenantId: 'tenant3',
          tenantName: 'Michael Brown',
          tenantEmail: 'michael.brown@email.com',
          tenantPhone: '+44 20 7946 0960',
          title: 'Broken Window Lock',
          description: 'The window lock in the bedroom is broken and the window cannot be secured properly.',
          category: 'structural',
          priority: 'medium',
          status: 'completed',
          assignedContractor: 'Secure Windows Ltd',
          estimatedCost: 80,
          actualCost: 75,
          scheduledDate: new Date(Date.now() - 172800000).toISOString(),
          completedDate: new Date(Date.now() - 86400000).toISOString(),
          attachments: [],
          notes: [],
          createdAt: new Date(Date.now() - 259200000).toISOString(),
          updatedAt: new Date(Date.now() - 86400000).toISOString()
        }
      ];

      const mockContractors: Contractor[] = [
        {
          id: 'cont1',
          name: 'ABC Plumbing Services',
          email: 'info@abcplumbing.co.uk',
          phone: '+44 20 8123 4567',
          specialties: ['plumbing', 'heating'],
          rating: 4.8,
          isActive: true
        },
        {
          id: 'cont2',
          name: 'London Heating Solutions',
          email: 'contact@londonheating.co.uk',
          phone: '+44 20 8234 5678',
          specialties: ['heating', 'electrical'],
          rating: 4.6,
          isActive: true
        },
        {
          id: 'cont3',
          name: 'Secure Windows Ltd',
          email: 'info@securewindows.co.uk',
          phone: '+44 20 8345 6789',
          specialties: ['structural', 'security'],
          rating: 4.9,
          isActive: true
        }
      ];

      setRequests(mockRequests);
      setContractors(mockContractors);
    } catch (error) {
      console.error('Error loading maintenance data:', error);
      showToast('Failed to load maintenance data', 'error');
    }
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.propertyAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.tenantName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || request.priority === priorityFilter;
    const matchesCategory = categoryFilter === 'all' || request.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  const handleCreateRequest = async () => {
    try {
      const request: MaintenanceRequest = {
        id: `req${Date.now()}`,
        propertyId: newRequest.propertyId,
        propertyAddress: '123 Example Street, London', // This would come from property lookup
        tenantId: user?.id || 'current',
        tenantName: user?.name || 'Current User',
        tenantEmail: user?.email || '',
        tenantPhone: '+44 20 7946 0000',
        title: newRequest.title,
        description: newRequest.description,
        category: newRequest.category,
        priority: newRequest.priority,
        status: 'pending',
        attachments: [],
        notes: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setRequests(prev => [request, ...prev]);
      setShowNewRequest(false);
      setNewRequest({
        propertyId: '',
        title: '',
        description: '',
        category: 'other',
        priority: 'medium'
      });
      showToast('Maintenance request created successfully', 'success');
    } catch (error) {
      console.error('Error creating request:', error);
      showToast('Failed to create maintenance request', 'error');
    }
  };

  const handleUpdateStatus = async (requestId: string, newStatus: MaintenanceRequest['status']) => {
    try {
      setRequests(prev => prev.map(req => 
        req.id === requestId 
          ? { ...req, status: newStatus, updatedAt: new Date().toISOString() }
          : req
      ));
      showToast('Request status updated successfully', 'success');
    } catch (error) {
      console.error('Error updating status:', error);
      showToast('Failed to update request status', 'error');
    }
  };

  const getStatusColor = (status: MaintenanceRequest['status']) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'assigned': return 'text-blue-600 bg-blue-100';
      case 'in_progress': return 'text-purple-600 bg-purple-100';
      case 'completed': return 'text-green-600 bg-green-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: MaintenanceRequest['priority']) => {
    switch (priority) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-orange-600';
      case 'urgent': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: MaintenanceRequest['status']) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'assigned': return <User className="w-4 h-4" />;
      case 'in_progress': return <Wrench className="w-4 h-4" />;
      case 'completed': return <CheckCircle2 className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Maintenance Management</h1>
        <p className="text-gray-600">Track and manage property maintenance requests</p>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'requests', label: 'Requests', icon: Wrench },
              { id: 'contractors', label: 'Contractors', icon: User },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {activeTab === 'requests' && (
        <>
          {/* Filters and Search */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="plumbing">Plumbing</option>
              <option value="electrical">Electrical</option>
              <option value="heating">Heating</option>
              <option value="appliances">Appliances</option>
              <option value="structural">Structural</option>
              <option value="other">Other</option>
            </select>

            <Button
              onClick={() => setShowNewRequest(true)}
              className="flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>New Request</span>
            </Button>
          </div>

          {/* Requests List */}
          <div className="grid gap-4">
            {filteredRequests.map(request => (
              <Card key={request.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{request.title}</h3>
                        <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                          getStatusColor(request.status)
                        }`}>
                          {getStatusIcon(request.status)}
                          <span className="capitalize">{request.status.replace('_', ' ')}</span>
                        </span>
                        <span className={`text-xs font-medium capitalize ${
                          getPriorityColor(request.priority)
                        }`}>
                          {request.priority} Priority
                        </span>
                      </div>
                      
                      <p className="text-gray-600 mb-3">{request.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4" />
                          <span>{request.propertyAddress}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4" />
                          <span>{request.tenantName}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      {request.assignedContractor && (
                        <div className="mt-2 text-sm text-gray-600">
                          <span className="font-medium">Assigned to:</span> {request.assignedContractor}
                        </div>
                      )}
                      
                      {request.estimatedCost && (
                        <div className="mt-2 text-sm text-gray-600">
                          <span className="font-medium">Estimated Cost:</span> £{request.estimatedCost}
                          {request.actualCost && (
                            <span className="ml-2">(Actual: £{request.actualCost})</span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedRequest(request);
                          setShowRequestDetail(true);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      
                      {request.status !== 'completed' && request.status !== 'cancelled' && (
                        <select
                          value={request.status}
                          onChange={(e) => handleUpdateStatus(request.id, e.target.value as MaintenanceRequest['status'])}
                          className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="pending">Pending</option>
                          <option value="assigned">Assigned</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {activeTab === 'contractors' && (
        <div className="grid gap-4">
          {contractors.map(contractor => (
            <Card key={contractor.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{contractor.name}</h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4" />
                        <span>{contractor.email}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4" />
                        <span>{contractor.phone}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Wrench className="w-4 h-4" />
                        <span>{contractor.specialties.join(', ')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-1 mb-2">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="font-medium">{contractor.rating}</span>
                    </div>
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      contractor.isActive 
                        ? 'text-green-600 bg-green-100' 
                        : 'text-red-600 bg-red-100'
                    }`}>
                      {contractor.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Total Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{requests.length}</div>
              <p className="text-xs text-gray-500">This month</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Pending Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {requests.filter(r => r.status === 'pending').length}
              </div>
              <p className="text-xs text-gray-500">Awaiting assignment</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">In Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {requests.filter(r => r.status === 'in_progress' || r.status === 'assigned').length}
              </div>
              <p className="text-xs text-gray-500">Being worked on</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {requests.filter(r => r.status === 'completed').length}
              </div>
              <p className="text-xs text-gray-500">This month</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* New Request Modal */}
      <Modal
        isOpen={showNewRequest}
        onClose={() => setShowNewRequest(false)}
        title="Create New Maintenance Request"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Property ID
            </label>
            <Input
              value={newRequest.propertyId}
              onChange={(e) => setNewRequest(prev => ({ ...prev, propertyId: e.target.value }))}
              placeholder="Enter property ID"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <Input
              value={newRequest.title}
              onChange={(e) => setNewRequest(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Brief description of the issue"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={newRequest.description}
              onChange={(e) => setNewRequest(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Detailed description of the maintenance issue"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={newRequest.category}
                onChange={(e) => setNewRequest(prev => ({ ...prev, category: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="plumbing">Plumbing</option>
                <option value="electrical">Electrical</option>
                <option value="heating">Heating</option>
                <option value="appliances">Appliances</option>
                <option value="structural">Structural</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                value={newRequest.priority}
                onChange={(e) => setNewRequest(prev => ({ ...prev, priority: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowNewRequest(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateRequest}
              disabled={!newRequest.title || !newRequest.description}
            >
              Create Request
            </Button>
          </div>
        </div>
      </Modal>

      {/* Request Detail Modal */}
      <Modal
        isOpen={showRequestDetail}
        onClose={() => setShowRequestDetail(false)}
        title="Maintenance Request Details"
        size="lg"
      >
        {selectedRequest && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{selectedRequest.title}</h3>
                <p className="text-gray-600">{selectedRequest.description}</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Status:</span>
                  <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                    getStatusColor(selectedRequest.status)
                  }`}>
                    {getStatusIcon(selectedRequest.status)}
                    <span className="capitalize">{selectedRequest.status.replace('_', ' ')}</span>
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Priority:</span>
                  <span className={`text-sm font-medium capitalize ${
                    getPriorityColor(selectedRequest.priority)
                  }`}>
                    {selectedRequest.priority}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Category:</span>
                  <span className="text-sm capitalize">{selectedRequest.category}</span>
                </div>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-900 mb-2">Property & Tenant Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span>{selectedRequest.propertyAddress}</span>
                  </div>
                  <div className="flex items-center space-x-2 mb-1">
                    <User className="w-4 h-4 text-gray-400" />
                    <span>{selectedRequest.tenantName}</span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span>{selectedRequest.tenantEmail}</span>
                  </div>
                  <div className="flex items-center space-x-2 mb-1">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>{selectedRequest.tenantPhone}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {selectedRequest.attachments.length > 0 && (
              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-2">Attachments</h4>
                <div className="space-y-2">
                  {selectedRequest.attachments.map(attachment => (
                    <div key={attachment.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center space-x-2">
                        <Image className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{attachment.name}</span>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {selectedRequest.notes.length > 0 && (
              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
                <div className="space-y-2">
                  {selectedRequest.notes.map(note => (
                    <div key={note.id} className="p-3 bg-gray-50 rounded">
                      <p className="text-sm text-gray-700">{note.content}</p>
                      <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                        <span>{note.authorName}</span>
                        <span>{new Date(note.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MaintenanceManagement;