import React, { useState, useEffect } from 'react';
import { Home, FileText, AlertTriangle, Banknote, Calendar, MessageSquare, User, Settings, Download, Upload, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';

interface TenancyInfo {
  propertyAddress: string;
  landlordName: string;
  agentName: string;
  agentPhone: string;
  agentEmail: string;
  leaseStart: string;
  leaseEnd: string;
  monthlyRent: number;
  deposit: number;
  nextRentDue: string;
  tenancyType: string;
}

interface MaintenanceRequest {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'submitted' | 'acknowledged' | 'in_progress' | 'completed' | 'cancelled';
  submittedDate: string;
  scheduledDate?: string;
  completedDate?: string;
  images: string[];
  updates: {
    date: string;
    message: string;
    author: string;
  }[];
}

interface Document {
  id: string;
  name: string;
  type: string;
  uploadDate: string;
  size: string;
  url: string;
}

interface RentPayment {
  id: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: 'pending' | 'paid' | 'overdue';
  method?: string;
  reference?: string;
}

const TenantPortal: React.FC = () => {
  const [tenancyInfo, setTenancyInfo] = useState<TenancyInfo | null>(null);
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [rentPayments, setRentPayments] = useState<RentPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [newMaintenanceRequest, setNewMaintenanceRequest] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium' as const,
    images: [] as string[],
  });

  // Mock data - replace with API calls
  useEffect(() => {
    const mockTenancyInfo: TenancyInfo = {
      propertyAddress: '123 High Street, London, SW1A 1AA',
      landlordName: 'Mr. James Wilson',
      agentName: 'Sarah Johnson',
      agentPhone: '+44 20 1234 5678',
      agentEmail: 'sarah.johnson@propertyagent.com',
      leaseStart: '2024-01-01',
      leaseEnd: '2024-12-31',
      monthlyRent: 2500,
      deposit: 5000,
      nextRentDue: '2024-02-01',
      tenancyType: 'Assured Shorthold Tenancy',
    };

    const mockMaintenanceRequests: MaintenanceRequest[] = [
      {
        id: '1',
        title: 'Leaking Kitchen Tap',
        description: 'The kitchen tap has been dripping constantly for the past week. It\'s getting worse and wasting water.',
        category: 'Plumbing',
        priority: 'medium',
        status: 'in_progress',
        submittedDate: '2024-01-20',
        scheduledDate: '2024-01-25',
        images: ['https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=leaking%20kitchen%20tap%20dripping%20water%20sink&image_size=square'],
        updates: [
          {
            date: '2024-01-20',
            message: 'Maintenance request submitted',
            author: 'System',
          },
          {
            date: '2024-01-21',
            message: 'Request acknowledged. Plumber will be scheduled.',
            author: 'Property Manager',
          },
          {
            date: '2024-01-23',
            message: 'Plumber scheduled for January 25th between 10-12 PM',
            author: 'Property Manager',
          },
        ],
      },
      {
        id: '2',
        title: 'Broken Window Lock',
        description: 'The lock on the bedroom window is broken and won\'t close properly.',
        category: 'Security',
        priority: 'high',
        status: 'completed',
        submittedDate: '2024-01-15',
        scheduledDate: '2024-01-18',
        completedDate: '2024-01-18',
        images: [],
        updates: [
          {
            date: '2024-01-15',
            message: 'Maintenance request submitted',
            author: 'System',
          },
          {
            date: '2024-01-16',
            message: 'Urgent repair scheduled for tomorrow',
            author: 'Property Manager',
          },
          {
            date: '2024-01-18',
            message: 'Window lock replaced successfully',
            author: 'Maintenance Team',
          },
        ],
      },
    ];

    const mockDocuments: Document[] = [
      {
        id: '1',
        name: 'Tenancy Agreement',
        type: 'Contract',
        uploadDate: '2024-01-01',
        size: '2.4 MB',
        url: '#',
      },
      {
        id: '2',
        name: 'Property Inventory',
        type: 'Inventory',
        uploadDate: '2024-01-01',
        size: '1.8 MB',
        url: '#',
      },
      {
        id: '3',
        name: 'Gas Safety Certificate',
        type: 'Certificate',
        uploadDate: '2024-01-01',
        size: '0.5 MB',
        url: '#',
      },
      {
        id: '4',
        name: 'EPC Certificate',
        type: 'Certificate',
        uploadDate: '2023-12-01',
        size: '0.3 MB',
        url: '#',
      },
    ];

    const mockRentPayments: RentPayment[] = [
      {
        id: '1',
        amount: 2500,
        dueDate: '2024-02-01',
        status: 'pending',
      },
      {
        id: '2',
        amount: 2500,
        dueDate: '2024-01-01',
        paidDate: '2023-12-28',
        status: 'paid',
        method: 'Bank Transfer',
        reference: 'REF123456',
      },
      {
        id: '3',
        amount: 2500,
        dueDate: '2023-12-01',
        paidDate: '2023-11-30',
        status: 'paid',
        method: 'Bank Transfer',
        reference: 'REF123455',
      },
    ];

    setTimeout(() => {
      setTenancyInfo(mockTenancyInfo);
      setMaintenanceRequests(mockMaintenanceRequests);
      setDocuments(mockDocuments);
      setRentPayments(mockRentPayments);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'acknowledged': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
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

  const handleSubmitMaintenance = () => {
    const newRequest: MaintenanceRequest = {
      id: Date.now().toString(),
      ...newMaintenanceRequest,
      status: 'submitted',
      submittedDate: new Date().toISOString().split('T')[0],
      updates: [
        {
          date: new Date().toISOString().split('T')[0],
          message: 'Maintenance request submitted',
          author: 'System',
        },
      ],
    };

    setMaintenanceRequests(prev => [newRequest, ...prev]);
    setNewMaintenanceRequest({
      title: '',
      description: '',
      category: '',
      priority: 'medium',
      images: [],
    });
    setShowMaintenanceModal(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tenant portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Tenant Portal</h1>
              <p className="text-gray-600 mt-1">{tenancyInfo?.propertyAddress}</p>
            </div>
            <Button 
              onClick={() => setShowMaintenanceModal(true)}
              className="mt-4 lg:mt-0"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Report Issue
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Home className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Lease Ends</p>
                <p className="text-lg font-bold text-gray-900">
                  {tenancyInfo && new Date(tenancyInfo.leaseEnd).toLocaleDateString()}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Banknote className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Monthly Rent</p>
                <p className="text-lg font-bold text-gray-900">
                  £{tenancyInfo?.monthlyRent.toLocaleString()}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Calendar className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Next Rent Due</p>
                <p className="text-lg font-bold text-gray-900">
                  {tenancyInfo && new Date(tenancyInfo.nextRentDue).toLocaleDateString()}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Open Issues</p>
                <p className="text-lg font-bold text-gray-900">
                  {maintenanceRequests.filter(r => r.status !== 'completed' && r.status !== 'cancelled').length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', name: 'Overview', icon: Home },
                { id: 'maintenance', name: 'Maintenance', icon: AlertTriangle },
                { id: 'payments', name: 'Rent Payments', icon: Banknote },
                { id: 'documents', name: 'Documents', icon: FileText },
                { id: 'contact', name: 'Contact', icon: MessageSquare },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && tenancyInfo && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Tenancy Information */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Tenancy Information</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-600">Property Address</p>
                  <p className="text-gray-900">{tenancyInfo.propertyAddress}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Landlord</p>
                  <p className="text-gray-900">{tenancyInfo.landlordName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Tenancy Type</p>
                  <p className="text-gray-900">{tenancyInfo.tenancyType}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Lease Start</p>
                    <p className="text-gray-900">{new Date(tenancyInfo.leaseStart).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Lease End</p>
                    <p className="text-gray-900">{new Date(tenancyInfo.leaseEnd).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Monthly Rent</p>
                    <p className="text-gray-900">£{tenancyInfo.monthlyRent.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Deposit</p>
                    <p className="text-gray-900">£{tenancyInfo.deposit.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Property Manager Contact */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Property Manager</h2>
              <div className="space-y-3">
                <div className="flex items-center">
                  <User className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Name</p>
                    <p className="text-gray-900">{tenancyInfo.agentName}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <MessageSquare className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Email</p>
                    <p className="text-gray-900">{tenancyInfo.agentEmail}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Phone</p>
                    <p className="text-gray-900">{tenancyInfo.agentPhone}</p>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <Button className="w-full">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'maintenance' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Maintenance Requests</h2>
              <Button onClick={() => setShowMaintenanceModal(true)}>
                <AlertTriangle className="h-4 w-4 mr-2" />
                Report New Issue
              </Button>
            </div>
            
            <div className="space-y-6">
              {maintenanceRequests.map((request) => (
                <Card key={request.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {request.title}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                          {request.priority.toUpperCase()}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                          {request.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-2">{request.category}</p>
                      <p className="text-gray-700">{request.description}</p>
                    </div>
                  </div>

                  {request.images.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-600 mb-2">Images</p>
                      <div className="flex gap-2">
                        {request.images.map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt={`Issue ${index + 1}`}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Updates</h4>
                    <div className="space-y-2">
                      {request.updates.map((update, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="flex-shrink-0">
                            {update.author === 'System' ? (
                              <Clock className="h-4 w-4 text-gray-400 mt-0.5" />
                            ) : (
                              <MessageSquare className="h-4 w-4 text-blue-500 mt-0.5" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-gray-900">{update.author}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(update.date).toLocaleDateString()}
                              </p>
                            </div>
                            <p className="text-sm text-gray-600">{update.message}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'payments' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Rent Payments</h2>
            <div className="space-y-4">
              {rentPayments.map((payment) => (
                <Card key={payment.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Banknote className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-gray-900">
                          £{payment.amount.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600">
                          Due: {new Date(payment.dueDate).toLocaleDateString()}
                        </p>
                        {payment.paidDate && (
                          <p className="text-sm text-gray-600">
                            Paid: {new Date(payment.paidDate).toLocaleDateString()}
                          </p>
                        )}
                        {payment.method && (
                          <p className="text-sm text-gray-600">
                            Method: {payment.method} | Ref: {payment.reference}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(payment.status)}`}>
                        {payment.status.toUpperCase()}
                      </span>
                      {payment.status === 'pending' && (
                        <Button size="sm">
                          Pay Now
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Property Documents</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {documents.map((document) => (
                <Card key={document.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FileText className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {document.name}
                        </h3>
                        <p className="text-sm text-gray-600">{document.type}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Uploaded:</span>
                      <span className="text-gray-900">
                        {new Date(document.uploadDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Size:</span>
                      <span className="text-gray-900">{document.size}</span>
                    </div>
                  </div>
                  
                  <Button variant="outline" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'contact' && tenancyInfo && (
          <div className="max-w-2xl">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Contact Information</h2>
            
            <Card className="p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Manager</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">{tenancyInfo.agentName}</p>
                    <p className="text-sm text-gray-600">Property Manager</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-5 w-5 text-gray-400" />
                  <p className="text-gray-900">{tenancyInfo.agentEmail}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <p className="text-gray-900">{tenancyInfo.agentPhone}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h3>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <p className="font-medium text-red-900">24/7 Emergency Line</p>
                </div>
                <p className="text-red-800 font-semibold">+44 20 9999 0000</p>
                <p className="text-sm text-red-700 mt-2">
                  For urgent issues only (gas leaks, flooding, electrical faults, security breaches)
                </p>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Maintenance Request Modal */}
      <Modal
        isOpen={showMaintenanceModal}
        onClose={() => setShowMaintenanceModal(false)}
        title="Report Maintenance Issue"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Issue Title
            </label>
            <Input
              type="text"
              value={newMaintenanceRequest.title}
              onChange={(e) => setNewMaintenanceRequest(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Brief description of the issue"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={newMaintenanceRequest.category}
              onChange={(e) => setNewMaintenanceRequest(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select category</option>
              <option value="Plumbing">Plumbing</option>
              <option value="Electrical">Electrical</option>
              <option value="Heating">Heating</option>
              <option value="Security">Security</option>
              <option value="Appliances">Appliances</option>
              <option value="General">General</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <select
              value={newMaintenanceRequest.priority}
              onChange={(e) => setNewMaintenanceRequest(prev => ({ ...prev, priority: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={newMaintenanceRequest.description}
              onChange={(e) => setNewMaintenanceRequest(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Detailed description of the issue"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Photos (Optional)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Click to upload photos or drag and drop</p>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowMaintenanceModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitMaintenance}
              className="flex-1"
              disabled={!newMaintenanceRequest.title || !newMaintenanceRequest.category || !newMaintenanceRequest.description}
            >
              Submit Request
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TenantPortal;