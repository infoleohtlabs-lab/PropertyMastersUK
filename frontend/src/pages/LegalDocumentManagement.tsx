import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { showToast } from '../utils/toast';
import {
  FileText,
  Upload,
  Download,
  Eye,
  Edit,
  Trash2,
  Search,
  Filter,
  Calendar,
  User,
  Building,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Shield,
  Scale,
  Gavel,
  FileCheck,
  FilePlus,
  FileX,
  Folder,
  Tag,
  Star,
  Archive,
  Share,
  Lock,
  Unlock,
  AlertTriangle,
  BookOpen,
  Briefcase,
  Users,
  Home,
  PenTool
} from 'lucide-react';

interface LegalDocument {
  id: string;
  title: string;
  type: 'contract' | 'lease' | 'deed' | 'certificate' | 'compliance' | 'correspondence' | 'other';
  category: string;
  status: 'draft' | 'review' | 'approved' | 'executed' | 'expired' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  propertyId?: string;
  propertyAddress?: string;
  clientName: string;
  clientType: 'buyer' | 'seller' | 'landlord' | 'tenant' | 'agent' | 'other';
  solicitorName: string;
  createdDate: string;
  lastModified: string;
  expiryDate?: string;
  fileSize: string;
  version: number;
  tags: string[];
  description: string;
  isConfidential: boolean;
  requiresSignature: boolean;
  signedBy?: string[];
  complianceStatus: 'compliant' | 'non-compliant' | 'pending' | 'not-applicable';
}

interface Template {
  id: string;
  name: string;
  type: string;
  description: string;
  category: string;
  lastUsed: string;
  usageCount: number;
}

interface ComplianceItem {
  id: string;
  requirement: string;
  status: 'compliant' | 'non-compliant' | 'pending';
  dueDate: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
}

const LegalDocumentManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'documents' | 'templates' | 'compliance' | 'analytics'>('documents');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedDocument, setSelectedDocument] = useState<LegalDocument | null>(null);
  
  const [documents, setDocuments] = useState<LegalDocument[]>([
    {
      id: '1',
      title: 'Residential Tenancy Agreement - 123 High Street',
      type: 'lease',
      category: 'Tenancy Agreements',
      status: 'executed',
      priority: 'medium',
      propertyId: 'prop-001',
      propertyAddress: '123 High Street, London, SW1A 1AA',
      clientName: 'John Smith',
      clientType: 'landlord',
      solicitorName: 'Sarah Johnson',
      createdDate: '2024-01-15',
      lastModified: '2024-01-20',
      expiryDate: '2025-01-15',
      fileSize: '2.4 MB',
      version: 2,
      tags: ['tenancy', 'residential', 'london'],
      description: 'Standard residential tenancy agreement for 12-month term',
      isConfidential: false,
      requiresSignature: true,
      signedBy: ['John Smith', 'Jane Doe'],
      complianceStatus: 'compliant'
    },
    {
      id: '2',
      title: 'Property Purchase Contract - 456 Queen Street',
      type: 'contract',
      category: 'Purchase Contracts',
      status: 'review',
      priority: 'high',
      propertyId: 'prop-002',
      propertyAddress: '456 Queen Street, Manchester, M1 1AA',
      clientName: 'Mike Wilson',
      clientType: 'buyer',
      solicitorName: 'David Brown',
      createdDate: '2024-01-18',
      lastModified: '2024-01-22',
      fileSize: '3.1 MB',
      version: 1,
      tags: ['purchase', 'commercial', 'manchester'],
      description: 'Commercial property purchase agreement pending review',
      isConfidential: true,
      requiresSignature: true,
      complianceStatus: 'pending'
    },
    {
      id: '3',
      title: 'Energy Performance Certificate - 789 King Street',
      type: 'certificate',
      category: 'Compliance Documents',
      status: 'approved',
      priority: 'medium',
      propertyId: 'prop-003',
      propertyAddress: '789 King Street, Birmingham, B1 1AA',
      clientName: 'Emma Davis',
      clientType: 'landlord',
      solicitorName: 'Lisa White',
      createdDate: '2024-01-10',
      lastModified: '2024-01-12',
      expiryDate: '2034-01-10',
      fileSize: '1.2 MB',
      version: 1,
      tags: ['epc', 'energy', 'compliance'],
      description: 'Energy Performance Certificate valid for 10 years',
      isConfidential: false,
      requiresSignature: false,
      complianceStatus: 'compliant'
    },
    {
      id: '4',
      title: 'Title Deed - 321 Market Street',
      type: 'deed',
      category: 'Property Deeds',
      status: 'archived',
      priority: 'low',
      propertyId: 'prop-004',
      propertyAddress: '321 Market Street, Leeds, LS1 1AA',
      clientName: 'Robert Taylor',
      clientType: 'seller',
      solicitorName: 'Michael Green',
      createdDate: '2023-12-05',
      lastModified: '2023-12-20',
      fileSize: '4.7 MB',
      version: 3,
      tags: ['deed', 'title', 'ownership'],
      description: 'Official title deed with registered ownership details',
      isConfidential: true,
      requiresSignature: false,
      complianceStatus: 'compliant'
    }
  ]);

  const [templates, setTemplates] = useState<Template[]>([
    {
      id: '1',
      name: 'Standard Residential Tenancy Agreement',
      type: 'lease',
      description: 'Standard AST for residential properties',
      category: 'Tenancy Agreements',
      lastUsed: '2024-01-20',
      usageCount: 45
    },
    {
      id: '2',
      name: 'Commercial Property Purchase Contract',
      type: 'contract',
      description: 'Template for commercial property purchases',
      category: 'Purchase Contracts',
      lastUsed: '2024-01-18',
      usageCount: 12
    },
    {
      id: '3',
      name: 'Property Management Agreement',
      type: 'contract',
      description: 'Agreement between landlord and property manager',
      category: 'Management Agreements',
      lastUsed: '2024-01-15',
      usageCount: 28
    }
  ]);

  const [complianceItems, setComplianceItems] = useState<ComplianceItem[]>([
    {
      id: '1',
      requirement: 'Gas Safety Certificate Renewal',
      status: 'pending',
      dueDate: '2024-02-15',
      description: 'Annual gas safety inspection required for rental properties',
      priority: 'high'
    },
    {
      id: '2',
      requirement: 'Electrical Installation Condition Report',
      status: 'compliant',
      dueDate: '2024-06-30',
      description: 'EICR valid for 5 years from issue date',
      priority: 'medium'
    },
    {
      id: '3',
      requirement: 'Deposit Protection Scheme Registration',
      status: 'non-compliant',
      dueDate: '2024-01-30',
      description: 'Tenant deposits must be protected within 30 days',
      priority: 'high'
    }
  ]);

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = !typeFilter || doc.type === typeFilter;
    const matchesStatus = !statusFilter || doc.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'executed': return 'text-green-600 bg-green-100';
      case 'approved': return 'text-blue-600 bg-blue-100';
      case 'review': return 'text-yellow-600 bg-yellow-100';
      case 'draft': return 'text-gray-600 bg-gray-100';
      case 'expired': return 'text-red-600 bg-red-100';
      case 'archived': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getComplianceColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'text-green-600 bg-green-100';
      case 'non-compliant': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'contract': return Briefcase;
      case 'lease': return Home;
      case 'deed': return FileCheck;
      case 'certificate': return Shield;
      case 'compliance': return Scale;
      case 'correspondence': return FileText;
      default: return FileText;
    }
  };

  const handleCreateDocument = () => {
    showToast('Document creation feature coming soon', 'info');
  };

  const handleUploadDocument = () => {
    showToast('Document upload feature coming soon', 'info');
  };

  const handleUseTemplate = (template: Template) => {
    showToast(`Using template: ${template.name}`, 'success');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Legal Document Management</h1>
        <p className="text-gray-600">Manage legal documents, contracts, and compliance requirements</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'documents', label: 'Documents', icon: FileText },
            { id: 'templates', label: 'Templates', icon: FilePlus },
            { id: 'compliance', label: 'Compliance', icon: Shield },
            { id: 'analytics', label: 'Analytics', icon: BookOpen }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Documents Tab */}
      {activeTab === 'documents' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-900">Legal Documents ({documents.length})</h2>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                <option value="contract">Contracts</option>
                <option value="lease">Leases</option>
                <option value="deed">Deeds</option>
                <option value="certificate">Certificates</option>
                <option value="compliance">Compliance</option>
                <option value="correspondence">Correspondence</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="draft">Draft</option>
                <option value="review">Review</option>
                <option value="approved">Approved</option>
                <option value="executed">Executed</option>
                <option value="expired">Expired</option>
                <option value="archived">Archived</option>
              </select>
              <Button onClick={handleCreateDocument}>
                <FilePlus className="w-4 h-4 mr-2" />
                Create Document
              </Button>
              <Button onClick={handleUploadDocument} variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </Button>
            </div>
          </div>

          <div className="grid gap-6">
            {filteredDocuments.map((document) => {
              const TypeIcon = getTypeIcon(document.type);
              return (
                <Card key={document.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <TypeIcon className="w-5 h-5 text-blue-600" />
                          <CardTitle className="text-lg">{document.title}</CardTitle>
                          {document.isConfidential && (
                            <Lock className="w-4 h-4 text-red-600" title="Confidential" />
                          )}
                          {document.requiresSignature && (
                            <PenTool className="w-4 h-4 text-orange-600" title="Requires Signature" />
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <User className="w-4 h-4" />
                            <span>{document.clientName} ({document.clientType})</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Scale className="w-4 h-4" />
                            <span>{document.solicitorName}</span>
                          </div>
                          {document.propertyAddress && (
                            <div className="flex items-center space-x-1">
                              <Building className="w-4 h-4" />
                              <span>{document.propertyAddress}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <div className="flex items-center space-x-2">
                          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                            getStatusColor(document.status)
                          }`}>
                            {document.status}
                          </div>
                          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                            getPriorityColor(document.priority)
                          }`}>
                            {document.priority}
                          </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                          getComplianceColor(document.complianceStatus)
                        }`}>
                          {document.complianceStatus}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">Created: {document.createdDate}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">Modified: {document.lastModified}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">Size: {document.fileSize}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Tag className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">v{document.version}</span>
                      </div>
                    </div>

                    {document.expiryDate && (
                      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <AlertTriangle className="w-4 h-4 text-yellow-600" />
                          <span className="text-sm text-yellow-800">Expires: {document.expiryDate}</span>
                        </div>
                      </div>
                    )}

                    <div className="mb-4">
                      <p className="text-sm text-gray-600">{document.description}</p>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {document.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {document.signedBy && document.signedBy.length > 0 && (
                      <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-green-800">
                            Signed by: {document.signedBy.join(', ')}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-3">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                      <Button variant="outline" size="sm">
                        <Share className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                      {document.status === 'draft' && (
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                          <FileCheck className="w-4 h-4 mr-2" />
                          Submit for Review
                        </Button>
                      )}
                      {document.status === 'review' && (
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve
                        </Button>
                      )}
                      <Button variant="outline" size="sm" className="text-red-600 border-red-600 hover:bg-red-50">
                        <Archive className="w-4 h-4 mr-2" />
                        Archive
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Document Templates</h2>
            <Button>
              <FilePlus className="w-4 h-4 mr-2" />
              Create Template
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <p className="text-gray-600">{template.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Category:</span>
                      <span className="font-medium">{template.category}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Last Used:</span>
                      <span>{template.lastUsed}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Usage Count:</span>
                      <span>{template.usageCount}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => handleUseTemplate(template)}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <FilePlus className="w-4 h-4 mr-2" />
                      Use Template
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Compliance Tab */}
      {activeTab === 'compliance' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Compliance Monitoring</h2>
            <Button>
              <Shield className="w-4 h-4 mr-2" />
              Add Requirement
            </Button>
          </div>

          <div className="grid gap-6">
            {complianceItems.map((item) => (
              <Card key={item.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.requirement}</h3>
                      <p className="text-gray-600 mb-3">{item.description}</p>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">Due: {item.dueDate}</span>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                          getPriorityColor(item.priority)
                        }`}>
                          {item.priority} priority
                        </div>
                      </div>
                    </div>
                    <div className={`px-4 py-2 rounded-full text-sm font-medium ${
                      getComplianceColor(item.status)
                    }`}>
                      {item.status}
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Mark Compliant
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-2" />
                      Update
                    </Button>
                    <Button variant="outline" size="sm">
                      <FileText className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Document Analytics</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Documents</p>
                    <p className="text-2xl font-bold text-gray-900">{documents.length}</p>
                  </div>
                  <FileText className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Review</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {documents.filter(d => d.status === 'review').length}
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Executed</p>
                    <p className="text-2xl font-bold text-green-600">
                      {documents.filter(d => d.status === 'executed').length}
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Compliance Issues</p>
                    <p className="text-2xl font-bold text-red-600">
                      {complianceItems.filter(c => c.status === 'non-compliant').length}
                    </p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Document Types Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['contract', 'lease', 'deed', 'certificate', 'compliance', 'correspondence'].map(type => {
                    const count = documents.filter(d => d.type === type).length;
                    const percentage = documents.length > 0 ? (count / documents.length) * 100 : 0;
                    return (
                      <div key={type}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="capitalize">{type}</span>
                          <span>{count} documents</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full bg-blue-600"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {documents
                    .sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime())
                    .slice(0, 5)
                    .map((document) => (
                      <div key={document.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium">{document.title}</p>
                          <p className="text-sm text-gray-600">{document.clientName}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm">{document.lastModified}</p>
                          <p className={`text-xs px-2 py-1 rounded-full ${getStatusColor(document.status)}`}>
                            {document.status}
                          </p>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default LegalDocumentManagement;