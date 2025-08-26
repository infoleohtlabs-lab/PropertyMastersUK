import React, { useState, useEffect } from 'react';
import {
  Wrench,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  Phone,
  Mail,
  Calendar,
  Camera,
  FileText,
  Banknote,
  MapPin,
  Filter,
  Plus,
  Search,
  Download,
  Upload,
  Star,
  Shield,
  TrendingUp
} from 'lucide-react';

interface MaintenanceRequest {
  id: string;
  propertyId: string;
  propertyAddress: string;
  tenantName: string;
  tenantEmail: string;
  tenantPhone: string;
  title: string;
  description: string;
  category: 'plumbing' | 'electrical' | 'heating' | 'structural' | 'appliance' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  dateReported: string;
  dateAssigned?: string;
  dateCompleted?: string;
  assignedContractor?: string;
  contractorId?: string;
  estimatedCost?: number;
  actualCost?: number;
  photos: string[];
  documents: string[];
  notes: string[];
  complianceRequired: boolean;
  complianceStatus?: 'pending' | 'approved' | 'rejected';
  warrantyExpiry?: string;
}

interface Contractor {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  specialties: string[];
  rating: number;
  completedJobs: number;
  averageResponseTime: number;
  certifications: string[];
  insurance: {
    provider: string;
    policyNumber: string;
    expiryDate: string;
  };
  availability: 'available' | 'busy' | 'unavailable';
  hourlyRate: number;
  location: string;
}

interface ComplianceItem {
  id: string;
  type: 'gas_safety' | 'electrical' | 'fire_safety' | 'epc' | 'legionella' | 'asbestos';
  propertyId: string;
  propertyAddress: string;
  certificateNumber: string;
  issueDate: string;
  expiryDate: string;
  status: 'valid' | 'expiring' | 'expired';
  inspector: string;
  documentUrl: string;
}

const MaintenanceManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'requests' | 'contractors' | 'compliance'>('requests');
  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showContractorModal, setShowContractorModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data - in production, this would come from APIs
  const maintenanceRequests: MaintenanceRequest[] = [
    {
      id: 'MR001',
      propertyId: 'P001',
      propertyAddress: '123 High Street, London SW1A 1AA',
      tenantName: 'John Smith',
      tenantEmail: 'john.smith@email.com',
      tenantPhone: '+44 7700 900123',
      title: 'Boiler not heating water',
      description: 'The boiler is not producing hot water. Central heating works fine but no hot water from taps.',
      category: 'heating',
      priority: 'high',
      status: 'assigned',
      dateReported: '2024-01-15',
      dateAssigned: '2024-01-16',
      assignedContractor: 'Mike Johnson - PlumbPro Ltd',
      contractorId: 'C001',
      estimatedCost: 250,
      photos: ['photo1.jpg', 'photo2.jpg'],
      documents: [],
      notes: ['Initial assessment completed', 'Parts ordered'],
      complianceRequired: true,
      complianceStatus: 'pending'
    },
    {
      id: 'MR002',
      propertyId: 'P002',
      propertyAddress: '456 Park Avenue, London E1 6AN',
      tenantName: 'Sarah Wilson',
      tenantEmail: 'sarah.wilson@email.com',
      tenantPhone: '+44 7700 900456',
      title: 'Kitchen tap leaking',
      description: 'Kitchen tap has been dripping constantly for the past week.',
      category: 'plumbing',
      priority: 'medium',
      status: 'completed',
      dateReported: '2024-01-10',
      dateAssigned: '2024-01-11',
      dateCompleted: '2024-01-12',
      assignedContractor: 'Tom Brown - FixIt Services',
      contractorId: 'C002',
      estimatedCost: 80,
      actualCost: 75,
      photos: ['before.jpg', 'after.jpg'],
      documents: ['invoice.pdf'],
      notes: ['Replaced tap washer', 'Job completed successfully'],
      complianceRequired: false
    },
    {
      id: 'MR003',
      propertyId: 'P003',
      propertyAddress: '789 Garden Square, London N1 2AB',
      tenantName: 'David Lee',
      tenantEmail: 'david.lee@email.com',
      tenantPhone: '+44 7700 900789',
      title: 'Electrical socket not working',
      description: 'Power socket in bedroom has stopped working completely.',
      category: 'electrical',
      priority: 'urgent',
      status: 'pending',
      dateReported: '2024-01-18',
      photos: ['socket.jpg'],
      documents: [],
      notes: [],
      complianceRequired: true,
      complianceStatus: 'pending'
    }
  ];

  const contractors: Contractor[] = [
    {
      id: 'C001',
      name: 'Mike Johnson',
      company: 'PlumbPro Ltd',
      email: 'mike@plumbpro.co.uk',
      phone: '+44 7700 123456',
      specialties: ['Plumbing', 'Heating', 'Gas'],
      rating: 4.8,
      completedJobs: 156,
      averageResponseTime: 2.5,
      certifications: ['Gas Safe Registered', 'City & Guilds Plumbing'],
      insurance: {
        provider: 'Tradesman Insurance Co',
        policyNumber: 'TIC123456',
        expiryDate: '2024-12-31'
      },
      availability: 'available',
      hourlyRate: 65,
      location: 'Central London'
    },
    {
      id: 'C002',
      name: 'Tom Brown',
      company: 'FixIt Services',
      email: 'tom@fixit.co.uk',
      phone: '+44 7700 234567',
      specialties: ['General Maintenance', 'Plumbing', 'Carpentry'],
      rating: 4.6,
      completedJobs: 89,
      averageResponseTime: 3.2,
      certifications: ['NVQ Level 3 Plumbing', 'First Aid Certified'],
      insurance: {
        provider: 'Builder Insurance Ltd',
        policyNumber: 'BIL789012',
        expiryDate: '2024-11-30'
      },
      availability: 'busy',
      hourlyRate: 55,
      location: 'East London'
    },
    {
      id: 'C003',
      name: 'Emma Davis',
      company: 'Spark Electrical',
      email: 'emma@sparkelectrical.co.uk',
      phone: '+44 7700 345678',
      specialties: ['Electrical', 'PAT Testing', 'Emergency Repairs'],
      rating: 4.9,
      completedJobs: 203,
      averageResponseTime: 1.8,
      certifications: ['NICEIC Approved', '18th Edition Wiring Regulations'],
      insurance: {
        provider: 'Electrical Insurance Co',
        policyNumber: 'EIC345678',
        expiryDate: '2025-01-31'
      },
      availability: 'available',
      hourlyRate: 75,
      location: 'North London'
    }
  ];

  const complianceItems: ComplianceItem[] = [
    {
      id: 'CP001',
      type: 'gas_safety',
      propertyId: 'P001',
      propertyAddress: '123 High Street, London SW1A 1AA',
      certificateNumber: 'GS123456',
      issueDate: '2024-01-01',
      expiryDate: '2025-01-01',
      status: 'valid',
      inspector: 'Mike Johnson - PlumbPro Ltd',
      documentUrl: 'gas_cert_p001.pdf'
    },
    {
      id: 'CP002',
      type: 'electrical',
      propertyId: 'P002',
      propertyAddress: '456 Park Avenue, London E1 6AN',
      certificateNumber: 'EL789012',
      issueDate: '2023-06-15',
      expiryDate: '2024-06-15',
      status: 'expiring',
      inspector: 'Emma Davis - Spark Electrical',
      documentUrl: 'electrical_cert_p002.pdf'
    },
    {
      id: 'CP003',
      type: 'epc',
      propertyId: 'P003',
      propertyAddress: '789 Garden Square, London N1 2AB',
      certificateNumber: 'EPC345678',
      issueDate: '2023-01-01',
      expiryDate: '2024-01-01',
      status: 'expired',
      inspector: 'Energy Assessment Ltd',
      documentUrl: 'epc_cert_p003.pdf'
    }
  ];

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'assigned': return 'bg-purple-100 text-purple-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getComplianceStatusColor = (status: string): string => {
    switch (status) {
      case 'valid': return 'bg-green-100 text-green-800';
      case 'expiring': return 'bg-yellow-100 text-yellow-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredRequests = maintenanceRequests.filter(request => {
    const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || request.priority === filterPriority;
    const matchesSearch = searchTerm === '' || 
      request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.propertyAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.tenantName.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesPriority && matchesSearch;
  });

  const handleRequestAction = (requestId: string, action: string) => {
    console.log(`Performing ${action} on request ${requestId}`);
    // In production, this would make API calls
  };

  const handleContractorAction = (contractorId: string, action: string) => {
    console.log(`Performing ${action} on contractor ${contractorId}`);
    // In production, this would make API calls
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Maintenance Management</h1>
          <p className="text-gray-600">Track requests, manage contractors, and ensure compliance</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowRequestModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Request
          </button>
          <button
            onClick={() => setShowContractorModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <User className="h-4 w-4" />
            Add Contractor
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'requests', label: 'Maintenance Requests', icon: Wrench },
              { id: 'contractors', label: 'Contractors', icon: User },
              { id: 'compliance', label: 'Compliance', icon: Shield }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
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

        <div className="p-6">
          {/* Maintenance Requests Tab */}
          {activeTab === 'requests' && (
            <div className="space-y-6">
              {/* Filters */}
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-64">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search requests..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="assigned">Assigned</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Priority</option>
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              {/* Requests List */}
              <div className="space-y-4">
                {filteredRequests.map((request) => (
                  <div key={request.id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900">{request.title}</h3>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(request.priority)}`}>
                            {request.priority.toUpperCase()}
                          </span>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                            {request.status.replace('_', ' ').toUpperCase()}
                          </span>
                          {request.complianceRequired && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                              <Shield className="h-3 w-3" />
                              Compliance Required
                            </span>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>{request.propertyAddress}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>{request.tenantName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>Reported: {formatDate(request.dateReported)}</span>
                          </div>
                          {request.estimatedCost && (
                            <div className="flex items-center gap-2">
                              <Banknote className="h-4 w-4" />
                              <span>Est: {formatCurrency(request.estimatedCost)}</span>
                            </div>
                          )}
                        </div>
                        
                        {request.assignedContractor && (
                          <div className="mt-2 text-sm text-gray-600">
                            <span className="font-medium">Assigned to:</span> {request.assignedContractor}
                          </div>
                        )}
                        
                        <p className="mt-2 text-sm text-gray-700">{request.description}</p>
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => {
                            setSelectedRequest(request);
                            setShowRequestModal(true);
                          }}
                          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        >
                          View Details
                        </button>
                        {request.status === 'pending' && (
                          <button
                            onClick={() => handleRequestAction(request.id, 'assign')}
                            className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                          >
                            Assign
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contractors Tab */}
          {activeTab === 'contractors' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {contractors.map((contractor) => (
                  <div key={contractor.id} className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">{contractor.name}</h3>
                        <p className="text-sm text-gray-600">{contractor.company}</p>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        contractor.availability === 'available' ? 'bg-green-100 text-green-800' :
                        contractor.availability === 'busy' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {contractor.availability.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm font-medium">{contractor.rating}/5</span>
                        <span className="text-sm text-gray-600">({contractor.completedJobs} jobs)</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Avg response: {contractor.averageResponseTime}h</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Banknote className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{formatCurrency(contractor.hourlyRate)}/hour</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{contractor.location}</span>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Specialties:</p>
                        <div className="flex flex-wrap gap-1">
                          {contractor.specialties.map((specialty, index) => (
                            <span key={index} className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                              {specialty}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Certifications:</p>
                        <div className="space-y-1">
                          {contractor.certifications.map((cert, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <CheckCircle className="h-3 w-3 text-green-500" />
                              <span className="text-xs text-gray-600">{cert}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => handleContractorAction(contractor.id, 'contact')}
                        className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      >
                        Contact
                      </button>
                      <button
                        onClick={() => handleContractorAction(contractor.id, 'assign')}
                        className="flex-1 px-3 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                        disabled={contractor.availability === 'unavailable'}
                      >
                        Assign Job
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Compliance Tab */}
          {activeTab === 'compliance' && (
            <div className="space-y-6">
              {/* Compliance Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-green-600">Valid Certificates</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">12</div>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-5 w-5 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-600">Expiring Soon</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">3</div>
                </div>
                <div className="bg-red-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <span className="text-sm font-medium text-red-600">Expired</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">1</div>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-600">Compliance Rate</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">94%</div>
                </div>
              </div>

              {/* Compliance Items */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Property
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Certificate Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Certificate Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Issue Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Expiry Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Inspector
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {complianceItems.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{item.propertyAddress}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 capitalize">{item.type.replace('_', ' ')}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.certificateNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(item.issueDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(item.expiryDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getComplianceStatusColor(item.status)}`}>
                            {item.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.inspector}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <button className="text-blue-600 hover:text-blue-900">
                              <Download className="h-4 w-4" />
                            </button>
                            {item.status === 'expired' || item.status === 'expiring' ? (
                              <button className="text-green-600 hover:text-green-900">
                                <Upload className="h-4 w-4" />
                              </button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MaintenanceManagement;