import React, { useState, useEffect } from 'react';
import {
  Shield,
  Download,
  Trash2,
  Eye,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  User,
  Database,
  Lock,
  Unlock,
  Settings,
  Search,
  Filter,
  Calendar,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Building,
  Users,
  Activity,
  Archive,
  RefreshCw,
  Plus,
  Edit,
  Save,
  X,
  Info,
  ExternalLink,
  History,
  Bell,
  Key
} from 'lucide-react';

// Types
interface ConsentRecord {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  consentType: 'marketing' | 'analytics' | 'cookies' | 'data_processing' | 'third_party';
  purpose: string;
  status: 'granted' | 'withdrawn' | 'pending';
  grantedDate?: string;
  withdrawnDate?: string;
  expiryDate?: string;
  ipAddress: string;
  userAgent: string;
  legalBasis: 'consent' | 'contract' | 'legal_obligation' | 'vital_interests' | 'public_task' | 'legitimate_interests';
  dataCategories: string[];
  retentionPeriod: string;
}

interface DataExportRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  requestDate: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  completedDate?: string;
  downloadUrl?: string;
  expiryDate?: string;
  dataTypes: string[];
  fileSize?: string;
  format: 'json' | 'csv' | 'pdf';
}

interface ErasureRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  reason: string;
  approvedBy?: string;
  completedDate?: string;
  dataTypes: string[];
  retentionExceptions: string[];
  notes?: string;
}

interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  result: 'success' | 'failure';
  riskLevel: 'low' | 'medium' | 'high';
}

interface PrivacySettings {
  id: string;
  userId: string;
  profileVisibility: 'public' | 'private' | 'contacts_only';
  dataSharing: boolean;
  marketingEmails: boolean;
  analyticsTracking: boolean;
  cookiePreferences: {
    essential: boolean;
    functional: boolean;
    analytics: boolean;
    marketing: boolean;
  };
  dataRetention: 'minimum' | 'standard' | 'extended';
  twoFactorAuth: boolean;
  loginNotifications: boolean;
  dataDownloadFrequency: 'monthly' | 'quarterly' | 'annually' | 'on_request';
}

const GDPRCompliance: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'consent' | 'export' | 'erasure' | 'audit' | 'privacy'>('overview');
  const [consentRecords, setConsentRecords] = useState<ConsentRecord[]>([]);
  const [exportRequests, setExportRequests] = useState<DataExportRequest[]>([]);
  const [erasureRequests, setErasureRequests] = useState<ErasureRequest[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showErasureModal, setShowErasureModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);

  // Mock data
  useEffect(() => {
    setConsentRecords([
      {
        id: '1',
        userId: 'user1',
        userName: 'John Smith',
        userEmail: 'john@example.com',
        consentType: 'marketing',
        purpose: 'Email marketing campaigns and promotional offers',
        status: 'granted',
        grantedDate: '2024-01-15',
        expiryDate: '2025-01-15',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        legalBasis: 'consent',
        dataCategories: ['email', 'name', 'preferences'],
        retentionPeriod: '2 years'
      },
      {
        id: '2',
        userId: 'user2',
        userName: 'Sarah Johnson',
        userEmail: 'sarah@example.com',
        consentType: 'analytics',
        purpose: 'Website analytics and performance tracking',
        status: 'withdrawn',
        grantedDate: '2024-01-10',
        withdrawnDate: '2024-01-20',
        ipAddress: '192.168.1.101',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        legalBasis: 'consent',
        dataCategories: ['usage_data', 'device_info'],
        retentionPeriod: '1 year'
      }
    ]);

    setExportRequests([
      {
        id: '1',
        userId: 'user1',
        userName: 'John Smith',
        userEmail: 'john@example.com',
        requestDate: '2024-01-20',
        status: 'completed',
        completedDate: '2024-01-22',
        downloadUrl: '/downloads/user1-data-export.zip',
        expiryDate: '2024-02-22',
        dataTypes: ['profile', 'properties', 'transactions'],
        fileSize: '2.5 MB',
        format: 'json'
      },
      {
        id: '2',
        userId: 'user2',
        userName: 'Sarah Johnson',
        userEmail: 'sarah@example.com',
        requestDate: '2024-01-25',
        status: 'processing',
        dataTypes: ['profile', 'communications'],
        format: 'csv'
      }
    ]);

    setErasureRequests([
      {
        id: '1',
        userId: 'user3',
        userName: 'Mike Wilson',
        userEmail: 'mike@example.com',
        requestDate: '2024-01-18',
        status: 'pending',
        reason: 'No longer using the service',
        dataTypes: ['profile', 'preferences', 'activity_logs'],
        retentionExceptions: ['transaction_records']
      }
    ]);

    setAuditLogs([
      {
        id: '1',
        timestamp: '2024-01-25T10:30:00Z',
        userId: 'user1',
        userName: 'John Smith',
        action: 'DATA_EXPORT_REQUESTED',
        resource: 'user_data',
        details: 'User requested data export in JSON format',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        result: 'success',
        riskLevel: 'low'
      },
      {
        id: '2',
        timestamp: '2024-01-24T15:45:00Z',
        userId: 'admin1',
        userName: 'Admin User',
        action: 'CONSENT_WITHDRAWN',
        resource: 'marketing_consent',
        details: 'Marketing consent withdrawn for user sarah@example.com',
        ipAddress: '192.168.1.200',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        result: 'success',
        riskLevel: 'medium'
      }
    ]);

    setPrivacySettings({
      id: '1',
      userId: 'current_user',
      profileVisibility: 'private',
      dataSharing: false,
      marketingEmails: true,
      analyticsTracking: false,
      cookiePreferences: {
        essential: true,
        functional: true,
        analytics: false,
        marketing: false
      },
      dataRetention: 'minimum',
      twoFactorAuth: true,
      loginNotifications: true,
      dataDownloadFrequency: 'quarterly'
    });
  }, []);

  // Utility functions
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-GB');
  };

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleString('en-GB');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'granted':
      case 'completed':
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'withdrawn':
      case 'rejected':
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Tab Components
  const OverviewTab = () => {
    const totalConsents = consentRecords.length;
    const activeConsents = consentRecords.filter(c => c.status === 'granted').length;
    const pendingExports = exportRequests.filter(r => r.status === 'pending' || r.status === 'processing').length;
    const pendingErasures = erasureRequests.filter(r => r.status === 'pending').length;

    return (
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-xl font-bold text-gray-900">GDPR Compliance Overview</h2>
          <p className="text-gray-600">Monitor data protection compliance and user privacy rights</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Consents</p>
                <p className="text-2xl font-bold text-gray-900">{totalConsents}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-600">Active:</span>
              <span className="text-green-600 font-medium ml-1">{activeConsents}</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Data Exports</p>
                <p className="text-2xl font-bold text-gray-900">{exportRequests.length}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Download className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-600">Pending:</span>
              <span className="text-yellow-600 font-medium ml-1">{pendingExports}</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Erasure Requests</p>
                <p className="text-2xl font-bold text-gray-900">{erasureRequests.length}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-600">Pending:</span>
              <span className="text-red-600 font-medium ml-1">{pendingErasures}</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Audit Events</p>
                <p className="text-2xl font-bold text-gray-900">{auditLogs.length}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Activity className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-600">Today:</span>
              <span className="text-purple-600 font-medium ml-1">12</span>
            </div>
          </div>
        </div>

        {/* Compliance Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Compliance Status</h3>
            <div className="space-y-4">
              {[
                { item: 'Consent Management', status: 'compliant', score: 95 },
                { item: 'Data Export Requests', status: 'compliant', score: 100 },
                { item: 'Right to Erasure', status: 'attention', score: 85 },
                { item: 'Privacy Policies', status: 'compliant', score: 90 },
                { item: 'Audit Logging', status: 'compliant', score: 98 }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      item.status === 'compliant' ? 'bg-green-500' : 'bg-yellow-500'
                    }`}></div>
                    <span className="text-gray-900">{item.item}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">{item.score}%</span>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          item.status === 'compliant' ? 'bg-green-500' : 'bg-yellow-500'
                        }`}
                        style={{ width: `${item.score}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {auditLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded">
                  <div className={`p-2 rounded-full ${
                    log.riskLevel === 'low' ? 'bg-green-100' :
                    log.riskLevel === 'medium' ? 'bg-yellow-100' : 'bg-red-100'
                  }`}>
                    <Activity className={`h-4 w-4 ${
                      log.riskLevel === 'low' ? 'text-green-600' :
                      log.riskLevel === 'medium' ? 'text-yellow-600' : 'text-red-600'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{log.action.replace(/_/g, ' ')}</p>
                    <p className="text-sm text-gray-600">{log.details}</p>
                    <p className="text-xs text-gray-500 mt-1">{formatDateTime(log.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setShowExportModal(true)}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
            >
              <Download className="h-6 w-6 text-blue-600 mb-2" />
              <h4 className="font-medium text-gray-900">Request Data Export</h4>
              <p className="text-sm text-gray-600">Download user data in compliance with GDPR</p>
            </button>
            <button
              onClick={() => setShowErasureModal(true)}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
            >
              <Trash2 className="h-6 w-6 text-red-600 mb-2" />
              <h4 className="font-medium text-gray-900">Request Data Erasure</h4>
              <p className="text-sm text-gray-600">Submit right to be forgotten request</p>
            </button>
            <button
              onClick={() => setActiveTab('privacy')}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
            >
              <Settings className="h-6 w-6 text-gray-600 mb-2" />
              <h4 className="font-medium text-gray-900">Privacy Settings</h4>
              <p className="text-sm text-gray-600">Manage data processing preferences</p>
            </button>
          </div>
        </div>
      </div>
    );
  };

  const ConsentTab = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Consent Management</h2>
          <p className="text-gray-600">Track and manage user consent records</p>
        </div>
        <button
          onClick={() => setShowConsentModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Record Consent
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search users..."
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="granted">Granted</option>
              <option value="withdrawn">Withdrawn</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Consent Type</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">All Types</option>
              <option value="marketing">Marketing</option>
              <option value="analytics">Analytics</option>
              <option value="cookies">Cookies</option>
              <option value="data_processing">Data Processing</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Consent Records Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Consent Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purpose</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {consentRecords
                .filter(record => {
                  if (filterStatus !== 'all' && record.status !== filterStatus) return false;
                  if (searchTerm && !record.userName.toLowerCase().includes(searchTerm.toLowerCase()) && 
                      !record.userEmail.toLowerCase().includes(searchTerm.toLowerCase())) return false;
                  return true;
                })
                .map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div>
                        <p className="font-medium">{record.userName}</p>
                        <p className="text-gray-500">{record.userEmail}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {record.consentType.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {record.purpose}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.status === 'granted' && record.grantedDate ? formatDate(record.grantedDate) :
                       record.status === 'withdrawn' && record.withdrawnDate ? formatDate(record.withdrawnDate) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedRecord(record)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900">
                          <Edit className="h-4 w-4" />
                        </button>
                        {record.status === 'granted' && (
                          <button className="text-red-600 hover:text-red-900">
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const ExportTab = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Data Export Requests</h2>
          <p className="text-gray-600">Manage user data export requests under GDPR Article 20</p>
        </div>
        <button
          onClick={() => setShowExportModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          New Export Request
        </button>
      </div>

      {/* Export Requests Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data Types</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Format</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {exportRequests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div>
                      <p className="font-medium">{request.userName}</p>
                      <p className="text-gray-500">{request.userEmail}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(request.requestDate)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="flex flex-wrap gap-1">
                      {request.dataTypes.map((type, index) => (
                        <span key={index} className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                          {type}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="uppercase font-medium">{request.format}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      {request.status === 'completed' && request.downloadUrl && (
                        <button className="text-green-600 hover:text-green-900">
                          <Download className="h-4 w-4" />
                        </button>
                      )}
                      <button className="text-blue-600 hover:text-blue-900">
                        <Eye className="h-4 w-4" />
                      </button>
                      {request.status === 'pending' && (
                        <button className="text-red-600 hover:text-red-900">
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const ErasureTab = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Data Erasure Requests</h2>
          <p className="text-gray-600">Manage right to be forgotten requests under GDPR Article 17</p>
        </div>
        <button
          onClick={() => setShowErasureModal(true)}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2"
        >
          <Trash2 className="h-4 w-4" />
          New Erasure Request
        </button>
      </div>

      {/* Erasure Requests Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data Types</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {erasureRequests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div>
                      <p className="font-medium">{request.userName}</p>
                      <p className="text-gray-500">{request.userEmail}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(request.requestDate)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                    {request.reason}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="flex flex-wrap gap-1">
                      {request.dataTypes.map((type, index) => (
                        <span key={index} className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                          {type}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        <Eye className="h-4 w-4" />
                      </button>
                      {request.status === 'pending' && (
                        <>
                          <button className="text-green-600 hover:text-green-900">
                            <CheckCircle className="h-4 w-4" />
                          </button>
                          <button className="text-red-600 hover:text-red-900">
                            <XCircle className="h-4 w-4" />
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
    </div>
  );

  const AuditTab = () => (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">Audit Logs</h2>
        <p className="text-gray-600">Track all data processing activities and compliance events</p>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search logs..."
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">All Actions</option>
              <option value="DATA_EXPORT_REQUESTED">Data Export</option>
              <option value="CONSENT_WITHDRAWN">Consent Withdrawn</option>
              <option value="DATA_DELETED">Data Deleted</option>
              <option value="PRIVACY_SETTINGS_UPDATED">Privacy Updated</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Risk Level</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">All Levels</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk Level</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Result</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDateTime(log.timestamp)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div>
                      <p className="font-medium">{log.userName}</p>
                      <p className="text-gray-500 text-xs">{log.ipAddress}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {log.action.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                    {log.details}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskLevelColor(log.riskLevel)}`}>
                      {log.riskLevel}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      log.result === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {log.result}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const PrivacyTab = () => {
    if (!privacySettings) return null;

    return (
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-xl font-bold text-gray-900">Privacy Settings</h2>
          <p className="text-gray-600">Manage your data processing preferences and privacy controls</p>
        </div>

        {/* Privacy Settings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile Privacy */}
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Privacy</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Profile Visibility</label>
                <select
                  value={privacySettings.profileVisibility}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                  <option value="contacts_only">Contacts Only</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Data Sharing</label>
                  <p className="text-xs text-gray-500">Allow sharing data with partners</p>
                </div>
                <button
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    privacySettings.dataSharing ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      privacySettings.dataSharing ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Marketing Emails</label>
                  <p className="text-xs text-gray-500">Receive promotional emails</p>
                </div>
                <button
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    privacySettings.marketingEmails ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      privacySettings.marketingEmails ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Analytics Tracking</label>
                  <p className="text-xs text-gray-500">Allow usage analytics</p>
                </div>
                <button
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    privacySettings.analyticsTracking ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      privacySettings.analyticsTracking ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Cookie Preferences */}
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Cookie Preferences</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Essential Cookies</label>
                  <p className="text-xs text-gray-500">Required for basic functionality</p>
                </div>
                <button
                  disabled
                  className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 opacity-50"
                >
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6" />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Functional Cookies</label>
                  <p className="text-xs text-gray-500">Enhanced user experience</p>
                </div>
                <button
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    privacySettings.cookiePreferences.functional ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      privacySettings.cookiePreferences.functional ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Analytics Cookies</label>
                  <p className="text-xs text-gray-500">Usage statistics and insights</p>
                </div>
                <button
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    privacySettings.cookiePreferences.analytics ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      privacySettings.cookiePreferences.analytics ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Marketing Cookies</label>
                  <p className="text-xs text-gray-500">Personalized advertisements</p>
                </div>
                <button
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    privacySettings.cookiePreferences.marketing ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      privacySettings.cookiePreferences.marketing ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Data Retention */}
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Retention</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Retention Period</label>
                <select
                  value={privacySettings.dataRetention}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="minimum">Minimum (1 year)</option>
                  <option value="standard">Standard (3 years)</option>
                  <option value="extended">Extended (7 years)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Data Download Frequency</label>
                <select
                  value={privacySettings.dataDownloadFrequency}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="annually">Annually</option>
                  <option value="on_request">On Request Only</option>
                </select>
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Two-Factor Authentication</label>
                  <p className="text-xs text-gray-500">Extra security for your account</p>
                </div>
                <button
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    privacySettings.twoFactorAuth ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      privacySettings.twoFactorAuth ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Login Notifications</label>
                  <p className="text-xs text-gray-500">Get notified of new logins</p>
                </div>
                <button
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    privacySettings.loginNotifications ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      privacySettings.loginNotifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <Save className="h-4 w-4" />
            Save Privacy Settings
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">GDPR Compliance</h1>
                <p className="text-sm text-gray-600">Data protection & privacy management</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-1.5"></div>
                Compliant
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: Shield },
              { id: 'consent', label: 'Consent', icon: CheckCircle },
              { id: 'export', label: 'Data Export', icon: Download },
              { id: 'erasure', label: 'Data Erasure', icon: Trash2 },
              { id: 'audit', label: 'Audit Logs', icon: Activity },
              { id: 'privacy', label: 'Privacy Settings', icon: Settings }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
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
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'consent' && <ConsentTab />}
        {activeTab === 'export' && <ExportTab />}
        {activeTab === 'erasure' && <ErasureTab />}
        {activeTab === 'audit' && <AuditTab />}
        {activeTab === 'privacy' && <PrivacyTab />}
      </div>

      {/* Modals */}
      {showConsentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Record Consent</h3>
              <button
                onClick={() => setShowConsentModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">User Email</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="user@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Consent Type</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="marketing">Marketing</option>
                  <option value="analytics">Analytics</option>
                  <option value="cookies">Cookies</option>
                  <option value="data_processing">Data Processing</option>
                  <option value="third_party">Third Party</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Describe the purpose of data processing..."
                ></textarea>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowConsentModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Record Consent
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Request Data Export</h3>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">User Email</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="user@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Export Format</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="json">JSON</option>
                  <option value="csv">CSV</option>
                  <option value="pdf">PDF</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Data Types</label>
                <div className="space-y-2">
                  {['Profile Data', 'Property Data', 'Transaction History', 'Communication History', 'Preferences'].map((type) => (
                    <label key={type} className="flex items-center">
                      <input type="checkbox" className="mr-2" defaultChecked />
                      <span className="text-sm text-gray-700">{type}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowExportModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Request Export
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showErasureModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Request Data Erasure</h3>
              <button
                onClick={() => setShowErasureModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">User Email</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="user@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Erasure</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Please provide a reason for the data erasure request..."
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Data Types to Erase</label>
                <div className="space-y-2">
                  {['Profile Data', 'Activity Logs', 'Preferences', 'Communication History'].map((type) => (
                    <label key={type} className="flex items-center">
                      <input type="checkbox" className="mr-2" defaultChecked />
                      <span className="text-sm text-gray-700">{type}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                <div className="flex">
                  <AlertTriangle className="h-5 w-5 text-yellow-400 mr-2" />
                  <div>
                    <h4 className="text-sm font-medium text-yellow-800">Important Notice</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      Some data may be retained for legal compliance purposes.
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowErasureModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                  Submit Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GDPRCompliance;