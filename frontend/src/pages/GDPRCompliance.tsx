import React, { useState } from 'react';
import { Shield, FileText, Users, Database, AlertTriangle, CheckCircle, Clock, Download, Eye, Trash2 } from 'lucide-react';

interface DataRequest {
  id: string;
  type: 'access' | 'deletion' | 'portability' | 'rectification';
  userId: string;
  userName: string;
  userEmail: string;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  requestDate: string;
  completionDate?: string;
  description: string;
}

interface ConsentRecord {
  id: string;
  userId: string;
  userName: string;
  consentType: string;
  status: 'granted' | 'withdrawn' | 'expired';
  grantedDate: string;
  withdrawnDate?: string;
  purpose: string;
}

const GDPRCompliance: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'requests' | 'consent' | 'audit' | 'policies'>('overview');
  const [selectedRequest, setSelectedRequest] = useState<DataRequest | null>(null);

  const mockDataRequests: DataRequest[] = [
    {
      id: '1',
      type: 'access',
      userId: 'user-1',
      userName: 'John Smith',
      userEmail: 'john.smith@email.com',
      status: 'pending',
      requestDate: '2024-01-20',
      description: 'Request for all personal data held by the company'
    },
    {
      id: '2',
      type: 'deletion',
      userId: 'user-2',
      userName: 'Sarah Johnson',
      userEmail: 'sarah.johnson@email.com',
      status: 'processing',
      requestDate: '2024-01-18',
      description: 'Request to delete all personal data and close account'
    },
    {
      id: '3',
      type: 'rectification',
      userId: 'user-3',
      userName: 'Mike Wilson',
      userEmail: 'mike.wilson@email.com',
      status: 'completed',
      requestDate: '2024-01-15',
      completionDate: '2024-01-16',
      description: 'Request to correct incorrect address information'
    }
  ];

  const mockConsentRecords: ConsentRecord[] = [
    {
      id: '1',
      userId: 'user-1',
      userName: 'John Smith',
      consentType: 'Marketing Communications',
      status: 'granted',
      grantedDate: '2024-01-01',
      purpose: 'Email marketing and promotional materials'
    },
    {
      id: '2',
      userId: 'user-2',
      userName: 'Sarah Johnson',
      consentType: 'Data Analytics',
      status: 'withdrawn',
      grantedDate: '2023-12-15',
      withdrawnDate: '2024-01-10',
      purpose: 'Usage analytics and service improvement'
    },
    {
      id: '3',
      userId: 'user-3',
      userName: 'Mike Wilson',
      consentType: 'Third-party Sharing',
      status: 'granted',
      grantedDate: '2024-01-05',
      purpose: 'Sharing data with trusted partners for service delivery'
    }
  ];

  const getRequestTypeIcon = (type: string) => {
    switch (type) {
      case 'access': return <Eye className="h-4 w-4" />;
      case 'deletion': return <Trash2 className="h-4 w-4" />;
      case 'portability': return <Download className="h-4 w-4" />;
      case 'rectification': return <FileText className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'granted': return 'bg-green-100 text-green-800';
      case 'withdrawn': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleRequestAction = (requestId: string, action: 'approve' | 'reject') => {
    console.log(`${action} request ${requestId}`);
    // Implementation would update the request status
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">GDPR Compliance</h1>
          <p className="text-gray-600">Manage data protection and privacy compliance</p>
        </div>
        <div className="flex space-x-3">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Export Audit Log</span>
          </button>
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span>Run Compliance Check</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: Shield },
            { id: 'requests', label: 'Data Requests', icon: FileText },
            { id: 'consent', label: 'Consent Management', icon: Users },
            { id: 'audit', label: 'Audit Trail', icon: Database },
            { id: 'policies', label: 'Policies', icon: FileText }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Compliance Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Requests</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {mockDataRequests.filter(r => r.status === 'pending').length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Consents</p>
                  <p className="text-2xl font-bold text-green-600">
                    {mockConsentRecords.filter(c => c.status === 'granted').length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Data Subjects</p>
                  <p className="text-2xl font-bold text-blue-600">1,247</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Compliance Score</p>
                  <p className="text-2xl font-bold text-green-600">98%</p>
                </div>
                <Shield className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent GDPR Activity</h2>
            <div className="space-y-4">
              {mockDataRequests.slice(0, 3).map((request) => (
                <div key={request.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getRequestTypeIcon(request.type)}
                    <div>
                      <p className="font-medium text-gray-900">{request.userName}</p>
                      <p className="text-sm text-gray-600">{request.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                    <span className="text-sm text-gray-500">{request.requestDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Data Requests Tab */}
      {activeTab === 'requests' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Data Subject Requests</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {mockDataRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{request.userName}</div>
                          <div className="text-sm text-gray-500">{request.userEmail}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {getRequestTypeIcon(request.type)}
                          <span className="text-sm text-gray-900 capitalize">{request.type}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {request.requestDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {request.status === 'pending' && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleRequestAction(request.id, 'approve')}
                              className="text-green-600 hover:text-green-900"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleRequestAction(request.id, 'reject')}
                              className="text-red-600 hover:text-red-900"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                        {request.status === 'completed' && (
                          <button className="text-blue-600 hover:text-blue-900">
                            View Details
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Consent Management Tab */}
      {activeTab === 'consent' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Consent Records</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Consent Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purpose</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {mockConsentRecords.map((consent) => (
                    <tr key={consent.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{consent.userName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{consent.consentType}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(consent.status)}`}>
                          {consent.status.charAt(0).toUpperCase() + consent.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {consent.status === 'withdrawn' ? consent.withdrawnDate : consent.grantedDate}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {consent.purpose}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Audit Trail Tab */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">GDPR Audit Trail</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <Database className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-gray-900">Data Processing Activity Logged</p>
                  <p className="text-sm text-gray-600">User data accessed for service delivery</p>
                </div>
              </div>
              <span className="text-sm text-gray-500">2024-01-20 14:30</span>
            </div>
            
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <Shield className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-gray-900">Consent Updated</p>
                  <p className="text-sm text-gray-600">Marketing consent granted by user</p>
                </div>
              </div>
              <span className="text-sm text-gray-500">2024-01-20 12:15</span>
            </div>
            
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-gray-900">Data Breach Assessment</p>
                  <p className="text-sm text-gray-600">Security incident reviewed - no personal data affected</p>
                </div>
              </div>
              <span className="text-sm text-gray-500">2024-01-19 09:45</span>
            </div>
          </div>
        </div>
      )}

      {/* Policies Tab */}
      {activeTab === 'policies' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Privacy Policy</h3>
              <p className="text-gray-600 mb-4">Last updated: January 1, 2024</p>
              <div className="space-y-2">
                <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  View Current Policy
                </button>
                <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  Update Policy
                </button>
                <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  Version History
                </button>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Cookie Policy</h3>
              <p className="text-gray-600 mb-4">Last updated: January 1, 2024</p>
              <div className="space-y-2">
                <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  View Current Policy
                </button>
                <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  Update Policy
                </button>
                <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  Cookie Settings
                </button>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Retention Policy</h3>
              <p className="text-gray-600 mb-4">Last updated: January 1, 2024</p>
              <div className="space-y-2">
                <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  View Current Policy
                </button>
                <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  Update Retention Rules
                </button>
                <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  Automated Cleanup
                </button>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Terms of Service</h3>
              <p className="text-gray-600 mb-4">Last updated: January 1, 2024</p>
              <div className="space-y-2">
                <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  View Current Terms
                </button>
                <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  Update Terms
                </button>
                <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  Acceptance Log
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