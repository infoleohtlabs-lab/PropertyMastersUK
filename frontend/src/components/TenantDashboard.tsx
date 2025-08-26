import React, { useState, useEffect } from 'react';
import {
  Home,
  CreditCard,
  FileText,
  Calendar,
  MessageSquare,
  Settings,
  Download,
  Upload,
  AlertCircle,
  CheckCircle,
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
  Banknote,
  Wrench,
  Camera,
  X,
  Plus,
  Eye,
  Edit,
  Bell,
  Shield,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { DocumentManagement } from './DocumentManagement';
import { FinancialDashboard } from './FinancialDashboard';

// Interfaces
interface TenantMetrics {
  currentRent: number;
  nextPaymentDue: Date;
  leaseEndDate: Date;
  depositAmount: number;
  outstandingBalance: number;
  maintenanceRequests: number;
  documentsCount: number;
  paymentHistory: number;
}

interface Property {
  id: string;
  address: string;
  type: string;
  bedrooms: number;
  bathrooms: number;
  rentAmount: number;
  leaseStart: Date;
  leaseEnd: Date;
  landlordName: string;
  landlordEmail: string;
  landlordPhone: string;
  agentName?: string;
  agentEmail?: string;
  agentPhone?: string;
  amenities: string[];
  images: string[];
  floorPlan?: string;
  energyRating?: string;
  councilTaxBand?: string;
}

interface RentPayment {
  id: string;
  amount: number;
  dueDate: Date;
  paidDate?: Date;
  status: 'paid' | 'pending' | 'overdue';
  method?: string;
  reference?: string;
  late_fee?: number;
}

interface MaintenanceRequest {
  id: string;
  title: string;
  description: string;
  category: 'plumbing' | 'electrical' | 'heating' | 'appliances' | 'structural' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'submitted' | 'acknowledged' | 'in_progress' | 'completed' | 'cancelled';
  dateSubmitted: Date;
  dateCompleted?: Date;
  images: string[];
  landlordResponse?: string;
  contractorAssigned?: string;
  estimatedCompletion?: Date;
  notes?: string;
}

interface TenantDocument {
  id: string;
  name: string;
  type: 'lease' | 'inventory' | 'certificate' | 'notice' | 'receipt' | 'other';
  uploadDate: Date;
  size: number;
  url: string;
  description?: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'payment' | 'maintenance' | 'lease' | 'general';
  date: Date;
  read: boolean;
  urgent: boolean;
}

const TenantDashboard: React.FC = () => {
  // State management
  const [activeTab, setActiveTab] = useState('overview');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<RentPayment | null>(null);
  const [selectedMaintenance, setSelectedMaintenance] = useState<MaintenanceRequest | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<TenantDocument | null>(null);
  const [newMaintenanceRequest, setNewMaintenanceRequest] = useState({
    title: '',
    description: '',
    category: 'other' as const,
    priority: 'medium' as const,
    images: [] as string[]
  });

  // Mock data
  const tenantMetrics: TenantMetrics = {
    currentRent: 1200,
    nextPaymentDue: new Date('2024-02-01'),
    leaseEndDate: new Date('2024-12-31'),
    depositAmount: 1800,
    outstandingBalance: 0,
    maintenanceRequests: 2,
    documentsCount: 8,
    paymentHistory: 12
  };

  const property: Property = {
    id: '1',
    address: '123 Oak Street, Manchester, M1 2AB',
    type: 'Apartment',
    bedrooms: 2,
    bathrooms: 1,
    rentAmount: 1200,
    leaseStart: new Date('2024-01-01'),
    leaseEnd: new Date('2024-12-31'),
    landlordName: 'John Smith',
    landlordEmail: 'john.smith@email.com',
    landlordPhone: '+44 7700 900123',
    agentName: 'Sarah Johnson',
    agentEmail: 'sarah.johnson@propertyagent.com',
    agentPhone: '+44 7700 900456',
    amenities: ['Parking', 'Garden', 'Central Heating', 'Double Glazing'],
    images: [
      'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20apartment%20living%20room%20interior&image_size=landscape_4_3',
      'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20apartment%20kitchen%20interior&image_size=landscape_4_3'
    ],
    energyRating: 'B',
    councilTaxBand: 'C'
  };

  const rentPayments: RentPayment[] = [
    {
      id: '1',
      amount: 1200,
      dueDate: new Date('2024-02-01'),
      status: 'pending'
    },
    {
      id: '2',
      amount: 1200,
      dueDate: new Date('2024-01-01'),
      paidDate: new Date('2023-12-28'),
      status: 'paid',
      method: 'Bank Transfer',
      reference: 'REF123456'
    },
    {
      id: '3',
      amount: 1200,
      dueDate: new Date('2023-12-01'),
      paidDate: new Date('2023-11-29'),
      status: 'paid',
      method: 'Direct Debit',
      reference: 'DD789012'
    }
  ];

  const maintenanceRequests: MaintenanceRequest[] = [
    {
      id: '1',
      title: 'Leaking Kitchen Tap',
      description: 'The kitchen tap has been dripping constantly for the past week.',
      category: 'plumbing',
      priority: 'medium',
      status: 'in_progress',
      dateSubmitted: new Date('2024-01-15'),
      images: ['https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=leaking%20kitchen%20tap%20dripping%20water&image_size=square'],
      landlordResponse: 'Plumber has been contacted and will visit on Friday.',
      contractorAssigned: 'ABC Plumbing Services',
      estimatedCompletion: new Date('2024-01-19')
    },
    {
      id: '2',
      title: 'Heating Not Working',
      description: 'Central heating system not responding to thermostat.',
      category: 'heating',
      priority: 'high',
      status: 'acknowledged',
      dateSubmitted: new Date('2024-01-18'),
      images: [],
      landlordResponse: 'Engineer will be scheduled within 24 hours.'
    }
  ];

  const tenantDocuments: TenantDocument[] = [
    {
      id: '1',
      name: 'Tenancy Agreement',
      type: 'lease',
      uploadDate: new Date('2024-01-01'),
      size: 2048000,
      url: '/documents/tenancy-agreement.pdf',
      description: 'Main tenancy agreement for the property'
    },
    {
      id: '2',
      name: 'Property Inventory',
      type: 'inventory',
      uploadDate: new Date('2024-01-01'),
      size: 1536000,
      url: '/documents/inventory.pdf',
      description: 'Detailed inventory of property contents'
    },
    {
      id: '3',
      name: 'Gas Safety Certificate',
      type: 'certificate',
      uploadDate: new Date('2024-01-01'),
      size: 512000,
      url: '/documents/gas-certificate.pdf',
      description: 'Annual gas safety inspection certificate'
    }
  ];

  const notifications: Notification[] = [
    {
      id: '1',
      title: 'Rent Payment Due',
      message: 'Your rent payment of £1,200 is due on February 1st, 2024.',
      type: 'payment',
      date: new Date('2024-01-25'),
      read: false,
      urgent: true
    },
    {
      id: '2',
      title: 'Maintenance Update',
      message: 'Your plumbing request has been assigned to ABC Plumbing Services.',
      type: 'maintenance',
      date: new Date('2024-01-16'),
      read: true,
      urgent: false
    }
  ];

  // Utility functions
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
      case 'acknowledged':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
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

  // Event handlers
  const handlePaymentAction = (paymentId: string, action: string) => {
    console.log(`Payment action: ${action} for payment ${paymentId}`);
    // Implement payment actions
  };

  const handleMaintenanceAction = (requestId: string, action: string) => {
    console.log(`Maintenance action: ${action} for request ${requestId}`);
    // Implement maintenance actions
  };

  const handleDocumentAction = (documentId: string, action: string) => {
    console.log(`Document action: ${action} for document ${documentId}`);
    // Implement document actions
  };

  const handleSubmitMaintenanceRequest = () => {
    console.log('Submitting maintenance request:', newMaintenanceRequest);
    setShowMaintenanceModal(false);
    setNewMaintenanceRequest({
      title: '',
      description: '',
      category: 'other',
      priority: 'medium',
      images: []
    });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      // Handle image upload logic
      console.log('Uploading images:', files);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Home className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Tenant Dashboard</h1>
                <p className="text-sm text-gray-600">{property.address}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Bell className="h-6 w-6 text-gray-600" />
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {notifications.filter(n => !n.read).length}
                  </span>
                )}
              </div>
              <Settings className="h-6 w-6 text-gray-600" />
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
              { id: 'payments', label: 'Rent Payments', icon: CreditCard },
              { id: 'maintenance', label: 'Maintenance', icon: Wrench },
              { id: 'documents', label: 'Documents', icon: FileText },
              { id: 'property', label: 'Property Info', icon: Home },
              { id: 'financial', label: 'Financial', icon: TrendingUp }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
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
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Current Rent</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(tenantMetrics.currentRent)}</p>
                  </div>
                  <Banknote className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Next Payment Due</p>
                    <p className="text-lg font-semibold text-gray-900">{formatDate(tenantMetrics.nextPaymentDue)}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-orange-600" />
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Lease Ends</p>
                    <p className="text-lg font-semibold text-gray-900">{formatDate(tenantMetrics.leaseEndDate)}</p>
                  </div>
                  <Clock className="h-8 w-8 text-purple-600" />
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Outstanding Balance</p>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(tenantMetrics.outstandingBalance)}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  onClick={() => setActiveTab('payments')}
                  className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <CreditCard className="h-6 w-6 text-blue-600" />
                  <span className="font-medium text-blue-900">Pay Rent</span>
                </button>
                
                <button
                  onClick={() => setShowMaintenanceModal(true)}
                  className="flex items-center gap-3 p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
                >
                  <Wrench className="h-6 w-6 text-orange-600" />
                  <span className="font-medium text-orange-900">Report Issue</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('documents')}
                  className="flex items-center gap-3 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <FileText className="h-6 w-6 text-green-600" />
                  <span className="font-medium text-green-900">View Documents</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('property')}
                  className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <MessageSquare className="h-6 w-6 text-purple-600" />
                  <span className="font-medium text-purple-900">Contact Landlord</span>
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Payments */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Payments</h3>
                <div className="space-y-3">
                  {rentPayments.slice(0, 3).map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{formatCurrency(payment.amount)}</p>
                        <p className="text-sm text-gray-600">Due: {formatDate(payment.dueDate)}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                        {payment.status}
                      </span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setActiveTab('payments')}
                  className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View all payments →
                </button>
              </div>

              {/* Recent Maintenance */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Maintenance Requests</h3>
                <div className="space-y-3">
                  {maintenanceRequests.slice(0, 3).map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{request.title}</p>
                        <p className="text-sm text-gray-600">{formatDate(request.dateSubmitted)}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                        {request.status}
                      </span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setActiveTab('maintenance')}
                  className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View all requests →
                </button>
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Notifications</h3>
              <div className="space-y-3">
                {notifications.slice(0, 3).map((notification) => (
                  <div key={notification.id} className={`p-4 rounded-lg border-l-4 ${
                    notification.urgent ? 'border-red-500 bg-red-50' : 'border-blue-500 bg-blue-50'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{notification.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-2">{formatDate(notification.date)}</p>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Rent Payments Tab */}
        {activeTab === 'payments' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Rent Payments</h2>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <CreditCard className="h-4 w-4" />
                Make Payment
              </button>
            </div>

            {/* Payment Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Next Payment</h3>
                <p className="text-3xl font-bold text-blue-600">{formatCurrency(tenantMetrics.currentRent)}</p>
                <p className="text-sm text-gray-600 mt-1">Due: {formatDate(tenantMetrics.nextPaymentDue)}</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Outstanding Balance</h3>
                <p className="text-3xl font-bold text-green-600">{formatCurrency(tenantMetrics.outstandingBalance)}</p>
                <p className="text-sm text-gray-600 mt-1">All payments up to date</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment History</h3>
                <p className="text-3xl font-bold text-gray-900">{tenantMetrics.paymentHistory}</p>
                <p className="text-sm text-gray-600 mt-1">Payments made</p>
              </div>
            </div>

            {/* Payment History */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Payment History</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {rentPayments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatCurrency(payment.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(payment.dueDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {payment.paidDate ? formatDate(payment.paidDate) : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {payment.method || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                            {payment.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => {
                              setSelectedPayment(payment);
                              setShowPaymentModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Maintenance Tab */}
        {activeTab === 'maintenance' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Maintenance Requests</h2>
              <button
                onClick={() => setShowMaintenanceModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                New Request
              </button>
            </div>

            {/* Maintenance Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: 'Total Requests', value: maintenanceRequests.length, color: 'blue' },
                { label: 'In Progress', value: maintenanceRequests.filter(r => r.status === 'in_progress').length, color: 'yellow' },
                { label: 'Completed', value: maintenanceRequests.filter(r => r.status === 'completed').length, color: 'green' },
                { label: 'Urgent', value: maintenanceRequests.filter(r => r.priority === 'urgent').length, color: 'red' }
              ].map((stat, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-sm border">
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className={`text-3xl font-bold text-${stat.color}-600`}>{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Maintenance Requests List */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Your Requests</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {maintenanceRequests.map((request) => (
                  <div key={request.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-lg font-medium text-gray-900">{request.title}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                            {request.priority}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                            {request.status}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-3">{request.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>Category: {request.category}</span>
                          <span>Submitted: {formatDate(request.dateSubmitted)}</span>
                          {request.estimatedCompletion && (
                            <span>Est. completion: {formatDate(request.estimatedCompletion)}</span>
                          )}
                        </div>
                        {request.landlordResponse && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-900">
                              <strong>Landlord Response:</strong> {request.landlordResponse}
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => {
                            setSelectedMaintenance(request);
                            setShowMaintenanceModal(true);
                          }}
                          className="flex items-center gap-1 px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Documents</h2>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Upload className="h-4 w-4" />
                Upload Document
              </button>
            </div>

            {/* Document Categories */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { type: 'lease', label: 'Lease Documents', count: tenantDocuments.filter(d => d.type === 'lease').length, color: 'blue' },
                { type: 'certificate', label: 'Certificates', count: tenantDocuments.filter(d => d.type === 'certificate').length, color: 'green' },
                { type: 'receipt', label: 'Receipts', count: tenantDocuments.filter(d => d.type === 'receipt').length, color: 'purple' }
              ].map((category) => (
                <div key={category.type} className="bg-white p-6 rounded-lg shadow-sm border">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{category.label}</h3>
                  <p className={`text-3xl font-bold text-${category.color}-600`}>{category.count}</p>
                  <p className="text-sm text-gray-600 mt-1">documents</p>
                </div>
              ))}
            </div>

            {/* Documents List */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">All Documents</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {tenantDocuments.map((document) => (
                  <div key={document.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <FileText className="h-8 w-8 text-blue-600" />
                        <div>
                          <h4 className="text-lg font-medium text-gray-900">{document.name}</h4>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="capitalize">{document.type}</span>
                            <span>{formatFileSize(document.size)}</span>
                            <span>Uploaded: {formatDate(document.uploadDate)}</span>
                          </div>
                          {document.description && (
                            <p className="text-sm text-gray-600 mt-1">{document.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDocumentAction(document.id, 'view')}
                          className="flex items-center gap-1 px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </button>
                        <button
                          onClick={() => handleDocumentAction(document.id, 'download')}
                          className="flex items-center gap-1 px-3 py-1 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        >
                          <Download className="h-4 w-4" />
                          Download
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Property Info Tab */}
        {activeTab === 'property' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Property Information</h2>

            {/* Property Details */}
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Property Details</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Address</label>
                      <p className="text-gray-900">{property.address}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Type</label>
                        <p className="text-gray-900">{property.type}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Bedrooms</label>
                        <p className="text-gray-900">{property.bedrooms}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Bathrooms</label>
                        <p className="text-gray-900">{property.bathrooms}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Monthly Rent</label>
                        <p className="text-gray-900 font-semibold">{formatCurrency(property.rentAmount)}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Energy Rating</label>
                        <p className="text-gray-900">{property.energyRating}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Council Tax Band</label>
                        <p className="text-gray-900">{property.councilTaxBand}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-6 bg-gray-50">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Property Images</h4>
                  <div className="grid grid-cols-1 gap-4">
                    {property.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Property ${index + 1}`}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Lease Information */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Lease Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-600">Lease Start Date</label>
                  <p className="text-gray-900 font-medium">{formatDate(property.leaseStart)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Lease End Date</label>
                  <p className="text-gray-900 font-medium">{formatDate(property.leaseEnd)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Monthly Rent</label>
                  <p className="text-gray-900 font-medium">{formatCurrency(property.rentAmount)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Deposit Amount</label>
                  <p className="text-gray-900 font-medium">{formatCurrency(tenantMetrics.depositAmount)}</p>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Landlord Contact */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Landlord Contact</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-gray-600" />
                    <span className="text-gray-900">{property.landlordName}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-gray-600" />
                    <a href={`mailto:${property.landlordEmail}`} className="text-blue-600 hover:text-blue-800">
                      {property.landlordEmail}
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-gray-600" />
                    <a href={`tel:${property.landlordPhone}`} className="text-blue-600 hover:text-blue-800">
                      {property.landlordPhone}
                    </a>
                  </div>
                </div>
                <button className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <MessageSquare className="h-4 w-4" />
                  Contact Landlord
                </button>
              </div>

              {/* Agent Contact */}
              {property.agentName && (
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Property Agent</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-gray-600" />
                      <span className="text-gray-900">{property.agentName}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-gray-600" />
                      <a href={`mailto:${property.agentEmail}`} className="text-blue-600 hover:text-blue-800">
                        {property.agentEmail}
                      </a>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-gray-600" />
                      <a href={`tel:${property.agentPhone}`} className="text-blue-600 hover:text-blue-800">
                        {property.agentPhone}
                      </a>
                    </div>
                  </div>
                  <button className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    <MessageSquare className="h-4 w-4" />
                    Contact Agent
                  </button>
                </div>
              )}
            </div>

            {/* Amenities */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Property Amenities</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {property.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-green-900 text-sm font-medium">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Financial Tab */}
        {activeTab === 'financial' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Financial Overview</h2>
            <FinancialDashboard userRole="tenant" />
          </div>
        )}
      </div>

      {/* Payment Details Modal */}
      {showPaymentModal && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Payment Details</h3>
                <button
                  onClick={() => {
                    setShowPaymentModal(false);
                    setSelectedPayment(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Amount</label>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(selectedPayment.amount)}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Due Date</label>
                    <p className="text-gray-900">{formatDate(selectedPayment.dueDate)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Status</label>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedPayment.status)}`}>
                      {selectedPayment.status}
                    </span>
                  </div>
                </div>
                
                {selectedPayment.paidDate && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Paid Date</label>
                    <p className="text-gray-900">{formatDate(selectedPayment.paidDate)}</p>
                  </div>
                )}
                
                {selectedPayment.method && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Payment Method</label>
                    <p className="text-gray-900">{selectedPayment.method}</p>
                  </div>
                )}
                
                {selectedPayment.reference && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Reference</label>
                    <p className="text-gray-900 font-mono">{selectedPayment.reference}</p>
                  </div>
                )}
              </div>
              
              <div className="flex gap-3 mt-6">
                {selectedPayment.status === 'pending' && (
                  <button
                    onClick={() => handlePaymentAction(selectedPayment.id, 'pay')}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Pay Now
                  </button>
                )}
                <button
                  onClick={() => handlePaymentAction(selectedPayment.id, 'download_receipt')}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Download Receipt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Maintenance Request Modal */}
      {showMaintenanceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  {selectedMaintenance ? 'Maintenance Request Details' : 'New Maintenance Request'}
                </h3>
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
              
              {selectedMaintenance ? (
                // View existing request
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">{selectedMaintenance.title}</h4>
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
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Category</label>
                      <p className="text-gray-900 capitalize">{selectedMaintenance.category}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Date Submitted</label>
                      <p className="text-gray-900">{formatDate(selectedMaintenance.dateSubmitted)}</p>
                    </div>
                  </div>
                  
                  {selectedMaintenance.landlordResponse && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Landlord Response</label>
                      <p className="text-gray-900 p-3 bg-blue-50 rounded-lg mt-1">{selectedMaintenance.landlordResponse}</p>
                    </div>
                  )}
                  
                  {selectedMaintenance.contractorAssigned && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Assigned Contractor</label>
                      <p className="text-gray-900">{selectedMaintenance.contractorAssigned}</p>
                    </div>
                  )}
                  
                  {selectedMaintenance.estimatedCompletion && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Estimated Completion</label>
                      <p className="text-gray-900">{formatDate(selectedMaintenance.estimatedCompletion)}</p>
                    </div>
                  )}
                  
                  {selectedMaintenance.images.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Photos</label>
                      <div className="grid grid-cols-2 gap-4 mt-2">
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
                </div>
              ) : (
                // Create new request
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                    <input
                      type="text"
                      value={newMaintenanceRequest.title}
                      onChange={(e) => setNewMaintenanceRequest(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Brief description of the issue"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={newMaintenanceRequest.description}
                      onChange={(e) => setNewMaintenanceRequest(prev => ({ ...prev, description: e.target.value }))}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Detailed description of the maintenance issue"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                      <select
                        value={newMaintenanceRequest.category}
                        onChange={(e) => setNewMaintenanceRequest(prev => ({ ...prev, category: e.target.value as any }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                      <select
                        value={newMaintenanceRequest.priority}
                        onChange={(e) => setNewMaintenanceRequest(prev => ({ ...prev, priority: e.target.value as any }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Photos (Optional)</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-2">Upload photos of the issue</p>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="maintenance-images"
                      />
                      <label
                        htmlFor="maintenance-images"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
                      >
                        <Upload className="h-4 w-4" />
                        Choose Files
                      </label>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowMaintenanceModal(false);
                        setNewMaintenanceRequest({
                          title: '',
                          description: '',
                          category: 'other',
                          priority: 'medium',
                          images: []
                        });
                      }}
                      className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmitMaintenanceRequest}
                      disabled={!newMaintenanceRequest.title || !newMaintenanceRequest.description}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                      Submit Request
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TenantDashboard;