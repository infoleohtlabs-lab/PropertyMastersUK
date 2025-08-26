import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { User, UserRole } from '../types';
import { 
  Wrench, 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Calendar,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';

interface MaintenanceRequest {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyAddress: string;
  tenantId: string;
  tenantName: string;
  tenantEmail: string;
  tenantPhone: string;
  title: string;
  description: string;
  category: string;
  priority: 'emergency' | 'urgent' | 'high' | 'medium' | 'low';
  status: 'submitted' | 'acknowledged' | 'in_progress' | 'completed' | 'cancelled';
  submittedDate: string;
  scheduledDate?: string;
  completedDate?: string;
  estimatedCost?: number;
  actualCost?: number;
  contractorName?: string;
  contractorPhone?: string;
  images: string[];
  notes: string[];
}

// User interface and UserRole enum imported from types

const Maintenance: React.FC = () => {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<MaintenanceRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null);
  
  // Mock user - in real app this would come from auth context
  const user: User = {
    id: 'tenant1',
    email: 'sarah.johnson@email.com',
    firstName: 'Sarah',
    lastName: 'Johnson',
    role: UserRole.AGENT,
    phone: '+44 7700 900123',
    isEmailVerified: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Mock data
  const mockRequests: MaintenanceRequest[] = [
    {
      id: '1',
      propertyId: 'prop1',
      propertyTitle: 'Modern Apartment 2B',
      propertyAddress: '123 Manchester Street, Manchester M1 1AA',
      tenantId: 'tenant1',
      tenantName: 'John Smith',
      tenantEmail: 'john.smith@email.com',
      tenantPhone: '+44 7700 900123',
      title: 'Leaking Kitchen Tap',
      description: 'The kitchen tap has been leaking for the past week. Water is dripping constantly.',
      category: 'plumbing',
      priority: 'medium',
      status: 'in_progress',
      submittedDate: '2024-01-15T10:00:00Z',
      scheduledDate: '2024-01-18T14:00:00Z',
      estimatedCost: 150,
      contractorName: 'ABC Plumbing',
      contractorPhone: '+44 7700 900456',
      images: [],
      notes: ['Initial assessment completed', 'Parts ordered']
    },
    {
      id: '2',
      propertyId: 'prop2',
      propertyTitle: 'Victorian House',
      propertyAddress: '456 Birmingham Road, Birmingham B1 2BB',
      tenantId: 'tenant2',
      tenantName: 'Sarah Johnson',
      tenantEmail: 'sarah.johnson@email.com',
      tenantPhone: '+44 7700 900789',
      title: 'Heating Not Working',
      description: 'Central heating system not working. No hot water or heating throughout the property.',
      category: 'heating',
      priority: 'urgent',
      status: 'submitted',
      submittedDate: '2024-01-16T08:30:00Z',
      images: [],
      notes: []
    },
    {
      id: '3',
      propertyId: 'prop1',
      propertyTitle: 'Modern Apartment 2B',
      propertyAddress: '123 Manchester Street, Manchester M1 1AA',
      tenantId: 'tenant1',
      tenantName: 'John Smith',
      tenantEmail: 'john.smith@email.com',
      tenantPhone: '+44 7700 900123',
      title: 'Broken Window Lock',
      description: 'Bedroom window lock is broken and window won\'t close properly.',
      category: 'structural',
      priority: 'high',
      status: 'completed',
      submittedDate: '2024-01-10T16:00:00Z',
      scheduledDate: '2024-01-12T10:00:00Z',
      completedDate: '2024-01-12T12:00:00Z',
      estimatedCost: 80,
      actualCost: 75,
      contractorName: 'XYZ Repairs',
      contractorPhone: '+44 7700 900321',
      images: [],
      notes: ['Window lock replaced', 'Security check completed']
    }
  ];

  useEffect(() => {
    setRequests(mockRequests);
    setFilteredRequests(mockRequests);
  }, []);

  useEffect(() => {
    let filtered = requests;

    if (searchTerm) {
      filtered = filtered.filter(request => 
        request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.propertyTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.tenantName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(request => request.status === statusFilter);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(request => request.priority === priorityFilter);
    }

    // Filter by user role
    if (user?.role === UserRole.TENANT) {
      filtered = filtered.filter(request => request.tenantId === user.id);
    }

    setFilteredRequests(filtered);
  }, [requests, searchTerm, statusFilter, priorityFilter, user]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'emergency': return 'text-red-700 bg-red-100';
      case 'urgent': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-700 bg-green-100';
      case 'in_progress': return 'text-blue-600 bg-blue-50';
      case 'acknowledged': return 'text-yellow-600 bg-yellow-50';
      case 'submitted': return 'text-gray-600 bg-gray-50';
      case 'cancelled': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'in_progress': return <Clock className="h-4 w-4" />;
      case 'urgent':
      case 'emergency': return <AlertTriangle className="h-4 w-4" />;
      default: return <Wrench className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Maintenance Requests</h1>
            <p className="text-gray-600 mt-2">
              {user?.role === UserRole.TENANT 
                ? 'Manage your maintenance requests'
                : 'Manage property maintenance requests'
              }
            </p>
          </div>
          {user?.role === UserRole.TENANT && (
            <Button
              onClick={() => setShowNewRequestModal(true)}
              className="flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Submit Request</span>
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
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
            <option value="submitted">Submitted</option>
            <option value="acknowledged">Acknowledged</option>
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
            <option value="emergency">Emergency</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <Button variant="outline" className="flex items-center space-x-2">
            <Filter className="h-4 w-4" />
            <span>More Filters</span>
          </Button>
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <Card className="p-8 text-center">
            <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No maintenance requests found</h3>
            <p className="text-gray-600">
              {user?.role === UserRole.TENANT 
                ? 'You haven\'t submitted any maintenance requests yet.'
                : 'No maintenance requests match your current filters.'
              }
            </p>
          </Card>
        ) : (
          filteredRequests.map((request) => (
            <Card key={request.id} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{request.title}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                      {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                      {getStatusIcon(request.status)}
                      <span className="ml-1">{request.status.replace('_', ' ').charAt(0).toUpperCase() + request.status.replace('_', ' ').slice(1)}</span>
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="flex items-center text-sm text-gray-600 mb-1">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>{request.propertyTitle}</span>
                      </div>
                      <p className="text-sm text-gray-500">{request.propertyAddress}</p>
                    </div>
                    <div>
                      <div className="flex items-center text-sm text-gray-600 mb-1">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>Submitted: {formatDate(request.submittedDate)}</span>
                      </div>
                      {request.scheduledDate && (
                        <p className="text-sm text-gray-500">Scheduled: {formatDate(request.scheduledDate)}</p>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-4">{request.description}</p>
                  
                  {user?.role !== UserRole.TENANT && (
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-1" />
                        <span>{request.tenantName}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-1" />
                        <span>{request.tenantPhone}</span>
                      </div>
                    </div>
                  )}
                  
                  {request.contractorName && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm font-medium text-blue-900">Contractor: {request.contractorName}</p>
                      <p className="text-sm text-blue-700">{request.contractorPhone}</p>
                      {request.estimatedCost && (
                        <p className="text-sm text-blue-700">Estimated Cost: £{request.estimatedCost}</p>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col space-y-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedRequest(request)}
                  >
                    View Details
                  </Button>
                  {user?.role !== UserRole.TENANT && request.status === 'submitted' && (
                    <Button size="sm">
                      Acknowledge
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Maintenance;