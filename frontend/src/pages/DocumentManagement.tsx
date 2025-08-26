import React, { useState, useEffect } from 'react';
import { FileText, Upload, Download, Eye, Edit, Trash2, Search, Filter, Calendar, AlertTriangle, CheckCircle, Clock, Plus, FolderOpen, File } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';

interface Document {
  id: string;
  filename: string;
  originalName: string;
  title: string;
  description?: string;
  type: 'EPC' | 'GAS_SAFETY' | 'ELECTRICAL_SAFETY' | 'FIRE_SAFETY' | 'INSURANCE' | 'MORTGAGE' | 'DEED' | 'LEASE' | 'INVENTORY' | 'INSPECTION_REPORT' | 'MAINTENANCE_RECORD' | 'CERTIFICATE' | 'CONTRACT' | 'INVOICE' | 'RECEIPT' | 'OTHER';
  status: 'ACTIVE' | 'EXPIRED' | 'EXPIRING_SOON' | 'PENDING_RENEWAL' | 'ARCHIVED' | 'DRAFT';
  propertyId: string;
  propertyTitle: string;
  propertyAddress: string;
  issueDate?: string;
  expiryDate?: string;
  renewalDate?: string;
  issuer?: string;
  certificateNumber?: string;
  referenceNumber?: string;
  isRequired: boolean;
  isPublic: boolean;
  fileSize: number;
  mimeType: string;
  url: string;
  uploadedBy: string;
  uploadedAt: string;
  verifiedBy?: string;
  verifiedAt?: string;
  tags: string[];
  notes?: string;
  version: number;
  requiresRenewal: boolean;
  renewalReminderDays?: number;
  reminderSent: boolean;
}

interface DocumentFormData {
  title: string;
  description: string;
  type: string;
  propertyId: string;
  issueDate: string;
  expiryDate: string;
  issuer: string;
  certificateNumber: string;
  referenceNumber: string;
  isRequired: boolean;
  isPublic: boolean;
  requiresRenewal: boolean;
  renewalReminderDays: number;
  tags: string;
  notes: string;
}

const DocumentManagement: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [propertyFilter, setPropertyFilter] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'type' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  const [documentForm, setDocumentForm] = useState<DocumentFormData>({
    title: '',
    description: '',
    type: 'OTHER',
    propertyId: '',
    issueDate: '',
    expiryDate: '',
    issuer: '',
    certificateNumber: '',
    referenceNumber: '',
    isRequired: false,
    isPublic: false,
    requiresRenewal: false,
    renewalReminderDays: 30,
    tags: '',
    notes: '',
  });

  // Mock data - replace with API calls
  useEffect(() => {
    const mockDocuments: Document[] = [
      {
        id: '1',
        filename: 'epc_certificate_123_high_street.pdf',
        originalName: 'EPC Certificate - 123 High Street.pdf',
        title: 'Energy Performance Certificate',
        description: 'EPC certificate for 123 High Street property',
        type: 'EPC',
        status: 'ACTIVE',
        propertyId: 'prop1',
        propertyTitle: '3-Bedroom House in Central London',
        propertyAddress: '123 High Street, London, SW1A 1AA',
        issueDate: '2023-06-15',
        expiryDate: '2033-06-15',
        issuer: 'Energy Assessments Ltd',
        certificateNumber: 'EPC-2023-001234',
        referenceNumber: 'REF-EPC-001',
        isRequired: true,
        isPublic: true,
        fileSize: 2048576,
        mimeType: 'application/pdf',
        url: '/documents/epc_certificate_123_high_street.pdf',
        uploadedBy: 'Sarah Johnson',
        uploadedAt: '2023-06-15T10:00:00Z',
        verifiedBy: 'Michael Brown',
        verifiedAt: '2023-06-15T14:30:00Z',
        tags: ['EPC', 'Energy', 'Certificate', 'Required'],
        notes: 'Property has excellent energy rating of A',
        version: 1,
        requiresRenewal: true,
        renewalReminderDays: 90,
        reminderSent: false,
      },
      {
        id: '2',
        filename: 'gas_safety_456_park_lane.pdf',
        originalName: 'Gas Safety Certificate - 456 Park Lane.pdf',
        title: 'Gas Safety Certificate',
        description: 'Annual gas safety inspection certificate',
        type: 'GAS_SAFETY',
        status: 'EXPIRING_SOON',
        propertyId: 'prop2',
        propertyTitle: '2-Bedroom Apartment in Canary Wharf',
        propertyAddress: '456 Park Lane, London, W1K 1AA',
        issueDate: '2023-02-01',
        expiryDate: '2024-02-01',
        issuer: 'Safe Gas Engineers Ltd',
        certificateNumber: 'GAS-2023-005678',
        referenceNumber: 'REF-GAS-002',
        isRequired: true,
        isPublic: false,
        fileSize: 1536000,
        mimeType: 'application/pdf',
        url: '/documents/gas_safety_456_park_lane.pdf',
        uploadedBy: 'David Wilson',
        uploadedAt: '2023-02-01T09:15:00Z',
        verifiedBy: 'Sarah Johnson',
        verifiedAt: '2023-02-01T11:45:00Z',
        tags: ['Gas Safety', 'Certificate', 'Required', 'Annual'],
        notes: 'All gas appliances checked and certified safe',
        version: 1,
        requiresRenewal: true,
        renewalReminderDays: 30,
        reminderSent: true,
      },
      {
        id: '3',
        filename: 'insurance_policy_789_victoria_road.pdf',
        originalName: 'Buildings Insurance Policy - 789 Victoria Road.pdf',
        title: 'Buildings Insurance Policy',
        description: 'Comprehensive buildings insurance policy',
        type: 'INSURANCE',
        status: 'ACTIVE',
        propertyId: 'prop3',
        propertyTitle: '4-Bedroom Victorian House',
        propertyAddress: '789 Victoria Road, London, SW19 2AA',
        issueDate: '2023-08-01',
        expiryDate: '2024-08-01',
        issuer: 'Premier Insurance Group',
        certificateNumber: 'INS-2023-009876',
        referenceNumber: 'REF-INS-003',
        isRequired: true,
        isPublic: false,
        fileSize: 3072000,
        mimeType: 'application/pdf',
        url: '/documents/insurance_policy_789_victoria_road.pdf',
        uploadedBy: 'Emma Thompson',
        uploadedAt: '2023-08-01T16:20:00Z',
        tags: ['Insurance', 'Buildings', 'Policy', 'Required'],
        notes: 'Covers up to £500,000 rebuild cost',
        version: 2,
        requiresRenewal: true,
        renewalReminderDays: 60,
        reminderSent: false,
      },
      {
        id: '4',
        filename: 'tenancy_agreement_321_oxford_street.pdf',
        originalName: 'Tenancy Agreement - 321 Oxford Street.pdf',
        title: 'Assured Shorthold Tenancy Agreement',
        description: 'Standard AST for studio apartment rental',
        type: 'LEASE',
        status: 'ACTIVE',
        propertyId: 'prop4',
        propertyTitle: '1-Bedroom Studio Apartment',
        propertyAddress: '321 Oxford Street, London, W1C 1AA',
        issueDate: '2023-09-01',
        expiryDate: '2024-08-31',
        issuer: 'Property Masters UK',
        referenceNumber: 'REF-LEASE-004',
        isRequired: true,
        isPublic: false,
        fileSize: 2560000,
        mimeType: 'application/pdf',
        url: '/documents/tenancy_agreement_321_oxford_street.pdf',
        uploadedBy: 'Michael Brown',
        uploadedAt: '2023-09-01T12:00:00Z',
        verifiedBy: 'Sarah Johnson',
        verifiedAt: '2023-09-01T15:30:00Z',
        tags: ['Tenancy', 'Agreement', 'AST', 'Legal'],
        notes: '12-month fixed term tenancy',
        version: 1,
        requiresRenewal: false,
        reminderSent: false,
      },
      {
        id: '5',
        filename: 'electrical_safety_123_high_street.pdf',
        originalName: 'Electrical Safety Certificate - 123 High Street.pdf',
        title: 'Electrical Installation Condition Report',
        description: 'EICR for electrical safety compliance',
        type: 'ELECTRICAL_SAFETY',
        status: 'EXPIRED',
        propertyId: 'prop1',
        propertyTitle: '3-Bedroom House in Central London',
        propertyAddress: '123 High Street, London, SW1A 1AA',
        issueDate: '2018-03-15',
        expiryDate: '2023-03-15',
        issuer: 'Certified Electricians Ltd',
        certificateNumber: 'EICR-2018-001122',
        referenceNumber: 'REF-ELEC-005',
        isRequired: true,
        isPublic: false,
        fileSize: 1792000,
        mimeType: 'application/pdf',
        url: '/documents/electrical_safety_123_high_street.pdf',
        uploadedBy: 'David Wilson',
        uploadedAt: '2018-03-15T14:45:00Z',
        tags: ['Electrical', 'Safety', 'EICR', 'Expired'],
        notes: 'Requires urgent renewal - expired 6 months ago',
        version: 1,
        requiresRenewal: true,
        renewalReminderDays: 30,
        reminderSent: true,
      },
    ];

    setTimeout(() => {
      setDocuments(mockDocuments);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.propertyTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = typeFilter === 'all' || doc.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    const matchesProperty = propertyFilter === 'all' || doc.propertyId === propertyFilter;
    return matchesSearch && matchesType && matchesStatus && matchesProperty;
  });

  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    let aValue: any, bValue: any;
    
    switch (sortBy) {
      case 'name':
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
        break;
      case 'date':
        aValue = new Date(a.uploadedAt);
        bValue = new Date(b.uploadedAt);
        break;
      case 'type':
        aValue = a.type;
        bValue = b.type;
        break;
      case 'status':
        aValue = a.status;
        bValue = b.status;
        break;
      default:
        return 0;
    }
    
    if (sortOrder === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'EXPIRED': return 'bg-red-100 text-red-800';
      case 'EXPIRING_SOON': return 'bg-yellow-100 text-yellow-800';
      case 'PENDING_RENEWAL': return 'bg-orange-100 text-orange-800';
      case 'ARCHIVED': return 'bg-gray-100 text-gray-800';
      case 'DRAFT': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE': return <CheckCircle className="h-4 w-4" />;
      case 'EXPIRED': return <AlertTriangle className="h-4 w-4" />;
      case 'EXPIRING_SOON': return <Clock className="h-4 w-4" />;
      case 'PENDING_RENEWAL': return <AlertTriangle className="h-4 w-4" />;
      case 'ARCHIVED': return <FolderOpen className="h-4 w-4" />;
      case 'DRAFT': return <Edit className="h-4 w-4" />;
      default: return <File className="h-4 w-4" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'EPC':
      case 'GAS_SAFETY':
      case 'ELECTRICAL_SAFETY':
      case 'FIRE_SAFETY':
      case 'CERTIFICATE':
        return <CheckCircle className="h-5 w-5" />;
      case 'INSURANCE':
      case 'MORTGAGE':
        return <FileText className="h-5 w-5" />;
      case 'DEED':
      case 'LEASE':
      case 'CONTRACT':
        return <FileText className="h-5 w-5" />;
      default:
        return <File className="h-5 w-5" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDeleteDocument = (documentId: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== documentId));
  };

  const handleViewDocument = (document: Document) => {
    setSelectedDocument(document);
    setShowDocumentModal(true);
  };

  const handleSubmitDocument = () => {
    const newDocument: Document = {
      id: Date.now().toString(),
      filename: `${documentForm.title.toLowerCase().replace(/\s+/g, '_')}.pdf`,
      originalName: `${documentForm.title}.pdf`,
      title: documentForm.title,
      description: documentForm.description,
      type: documentForm.type as any,
      status: 'DRAFT',
      propertyId: documentForm.propertyId || 'prop1',
      propertyTitle: 'Selected Property',
      propertyAddress: 'Property Address',
      issueDate: documentForm.issueDate,
      expiryDate: documentForm.expiryDate,
      issuer: documentForm.issuer,
      certificateNumber: documentForm.certificateNumber,
      referenceNumber: documentForm.referenceNumber,
      isRequired: documentForm.isRequired,
      isPublic: documentForm.isPublic,
      fileSize: 1024000,
      mimeType: 'application/pdf',
      url: `/documents/${documentForm.title.toLowerCase().replace(/\s+/g, '_')}.pdf`,
      uploadedBy: 'Current User',
      uploadedAt: new Date().toISOString(),
      tags: documentForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      notes: documentForm.notes,
      version: 1,
      requiresRenewal: documentForm.requiresRenewal,
      renewalReminderDays: documentForm.renewalReminderDays,
      reminderSent: false,
    };

    setDocuments(prev => [newDocument, ...prev]);
    setDocumentForm({
      title: '',
      description: '',
      type: 'OTHER',
      propertyId: '',
      issueDate: '',
      expiryDate: '',
      issuer: '',
      certificateNumber: '',
      referenceNumber: '',
      isRequired: false,
      isPublic: false,
      requiresRenewal: false,
      renewalReminderDays: 30,
      tags: '',
      notes: '',
    });
    setShowUploadModal(false);
  };

  const activeDocuments = documents.filter(d => d.status === 'ACTIVE');
  const expiredDocuments = documents.filter(d => d.status === 'EXPIRED');
  const expiringDocuments = documents.filter(d => d.status === 'EXPIRING_SOON');
  const requiredDocuments = documents.filter(d => d.isRequired);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading documents...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">Document Management</h1>
              <p className="text-gray-600 mt-1">Manage property documents, certificates, and legal paperwork</p>
            </div>
            <div className="flex gap-3 mt-4 lg:mt-0">
              <div className="flex border border-gray-300 rounded-md">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 text-sm ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
                >
                  List
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 text-sm ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
                >
                  Grid
                </button>
              </div>
              <Button onClick={() => setShowUploadModal(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Document
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Documents</p>
                <p className="text-2xl font-bold text-gray-900">{activeDocuments.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
                <p className="text-2xl font-bold text-gray-900">{expiringDocuments.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Expired</p>
                <p className="text-2xl font-bold text-gray-900">{expiredDocuments.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Required</p>
                <p className="text-2xl font-bold text-gray-900">{requiredDocuments.length}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex gap-3">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="EPC">EPC Certificate</option>
              <option value="GAS_SAFETY">Gas Safety</option>
              <option value="ELECTRICAL_SAFETY">Electrical Safety</option>
              <option value="FIRE_SAFETY">Fire Safety</option>
              <option value="INSURANCE">Insurance</option>
              <option value="MORTGAGE">Mortgage</option>
              <option value="DEED">Deed</option>
              <option value="LEASE">Lease</option>
              <option value="INVENTORY">Inventory</option>
              <option value="INSPECTION_REPORT">Inspection Report</option>
              <option value="OTHER">Other</option>
            </select>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="EXPIRED">Expired</option>
              <option value="EXPIRING_SOON">Expiring Soon</option>
              <option value="PENDING_RENEWAL">Pending Renewal</option>
              <option value="ARCHIVED">Archived</option>
              <option value="DRAFT">Draft</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="date">Sort by Date</option>
              <option value="name">Sort by Name</option>
              <option value="type">Sort by Type</option>
              <option value="status">Sort by Status</option>
            </select>
            
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>

        {/* Documents List/Grid */}
        {viewMode === 'list' ? (
          <div className="space-y-4">
            {sortedDocuments.map((document) => (
              <Card key={document.id} className="overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="p-3 bg-gray-100 rounded-lg">
                        {getTypeIcon(document.type)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {document.title}
                          </h3>
                          <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(document.status)}`}>
                            {getStatusIcon(document.status)}
                            {document.status.replace('_', ' ')}
                          </span>
                          {document.isRequired && (
                            <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                              Required
                            </span>
                          )}
                          {document.isPublic && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                              Public
                            </span>
                          )}
                        </div>
                        
                        <p className="text-gray-600 mb-2">{document.description}</p>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                          <span className="font-medium">{document.propertyTitle}</span>
                          <span>•</span>
                          <span>{document.type.replace('_', ' ')}</span>
                          <span>•</span>
                          <span>{formatFileSize(document.fileSize)}</span>
                          {document.expiryDate && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                Expires: {new Date(document.expiryDate).toLocaleDateString()}
                              </span>
                            </>
                          )}
                        </div>
                        
                        {document.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {document.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        
                        <div className="text-xs text-gray-500">
                          Uploaded by {document.uploadedBy} on {new Date(document.uploadedAt).toLocaleDateString()}
                          {document.verifiedBy && (
                            <span> • Verified by {document.verifiedBy}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewDocument(document)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteDocument(document.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedDocuments.map((document) => (
              <Card key={document.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      {getTypeIcon(document.type)}
                    </div>
                    <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(document.status)}`}>
                      {getStatusIcon(document.status)}
                    </span>
                  </div>
                  
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {document.title}
                  </h3>
                  
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {document.description}
                  </p>
                  
                  <div className="text-xs text-gray-500 mb-3">
                    <div className="flex items-center gap-1 mb-1">
                      <span className="font-medium">{document.propertyTitle}</span>
                    </div>
                    <div>{formatFileSize(document.fileSize)}</div>
                    {document.expiryDate && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Expires: {new Date(document.expiryDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewDocument(document)}
                      className="flex-1"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteDocument(document.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {sortedDocuments.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No documents found
            </h3>
            <p className="text-gray-600 mb-4">
              No documents match your current filters
            </p>
            <Button onClick={() => setShowUploadModal(true)}>
              Upload First Document
            </Button>
          </div>
        )}
      </div>

      {/* Upload Document Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="Upload New Document"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Document Title *
            </label>
            <Input
              type="text"
              value={documentForm.title}
              onChange={(e) => setDocumentForm(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter document title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={documentForm.description}
              onChange={(e) => setDocumentForm(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Brief description of the document"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Document Type *
              </label>
              <select
                value={documentForm.type}
                onChange={(e) => setDocumentForm(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="OTHER">Other</option>
                <option value="EPC">EPC Certificate</option>
                <option value="GAS_SAFETY">Gas Safety Certificate</option>
                <option value="ELECTRICAL_SAFETY">Electrical Safety Certificate</option>
                <option value="FIRE_SAFETY">Fire Safety Certificate</option>
                <option value="INSURANCE">Insurance Policy</option>
                <option value="MORTGAGE">Mortgage Document</option>
                <option value="DEED">Property Deed</option>
                <option value="LEASE">Lease Agreement</option>
                <option value="INVENTORY">Inventory Report</option>
                <option value="INSPECTION_REPORT">Inspection Report</option>
                <option value="MAINTENANCE_RECORD">Maintenance Record</option>
                <option value="CERTIFICATE">Certificate</option>
                <option value="CONTRACT">Contract</option>
                <option value="INVOICE">Invoice</option>
                <option value="RECEIPT">Receipt</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property
              </label>
              <select
                value={documentForm.propertyId}
                onChange={(e) => setDocumentForm(prev => ({ ...prev, propertyId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Property</option>
                <option value="prop1">123 High Street, London</option>
                <option value="prop2">456 Park Lane, London</option>
                <option value="prop3">789 Victoria Road, London</option>
                <option value="prop4">321 Oxford Street, London</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Issue Date
              </label>
              <Input
                type="date"
                value={documentForm.issueDate}
                onChange={(e) => setDocumentForm(prev => ({ ...prev, issueDate: e.target.value }))}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expiry Date
              </label>
              <Input
                type="date"
                value={documentForm.expiryDate}
                onChange={(e) => setDocumentForm(prev => ({ ...prev, expiryDate: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Issuer
              </label>
              <Input
                type="text"
                value={documentForm.issuer}
                onChange={(e) => setDocumentForm(prev => ({ ...prev, issuer: e.target.value }))}
                placeholder="Document issuer/authority"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Certificate Number
              </label>
              <Input
                type="text"
                value={documentForm.certificateNumber}
                onChange={(e) => setDocumentForm(prev => ({ ...prev, certificateNumber: e.target.value }))}
                placeholder="Certificate/reference number"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags (comma-separated)
            </label>
            <Input
              type="text"
              value={documentForm.tags}
              onChange={(e) => setDocumentForm(prev => ({ ...prev, tags: e.target.value }))}
              placeholder="e.g. certificate, safety, required"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isRequired"
                checked={documentForm.isRequired}
                onChange={(e) => setDocumentForm(prev => ({ ...prev, isRequired: e.target.checked }))}
                className="mr-2"
              />
              <label htmlFor="isRequired" className="text-sm text-gray-700">
                Required Document
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isPublic"
                checked={documentForm.isPublic}
                onChange={(e) => setDocumentForm(prev => ({ ...prev, isPublic: e.target.checked }))}
                className="mr-2"
              />
              <label htmlFor="isPublic" className="text-sm text-gray-700">
                Public Document
              </label>
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="requiresRenewal"
              checked={documentForm.requiresRenewal}
              onChange={(e) => setDocumentForm(prev => ({ ...prev, requiresRenewal: e.target.checked }))}
              className="mr-2"
            />
            <label htmlFor="requiresRenewal" className="text-sm text-gray-700">
              Requires Renewal
            </label>
            {documentForm.requiresRenewal && (
              <div className="ml-4">
                <Input
                  type="number"
                  value={documentForm.renewalReminderDays}
                  onChange={(e) => setDocumentForm(prev => ({ ...prev, renewalReminderDays: parseInt(e.target.value) }))}
                  placeholder="Reminder days"
                  className="w-32"
                  min="1"
                />
                <span className="ml-2 text-sm text-gray-600">days before expiry</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={documentForm.notes}
              onChange={(e) => setDocumentForm(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Additional notes about this document"
            />
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-2">Drop files here or click to browse</p>
            <p className="text-xs text-gray-500">Supports PDF, DOC, DOCX, JPG, PNG (max 10MB)</p>
            <input
              type="file"
              className="hidden"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              multiple
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowUploadModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitDocument}
              className="flex-1"
              disabled={!documentForm.title}
            >
              Upload Document
            </Button>
          </div>
        </div>
      </Modal>

      {/* Document View Modal */}
      <Modal
        isOpen={showDocumentModal}
        onClose={() => setShowDocumentModal(false)}
        title={selectedDocument?.title || 'Document Details'}
      >
        {selectedDocument && (
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gray-100 rounded-lg">
                {getTypeIcon(selectedDocument.type)}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {selectedDocument.title}
                </h3>
                <p className="text-gray-600 mb-3">{selectedDocument.description}</p>
                <div className="flex items-center gap-3">
                  <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedDocument.status)}`}>
                    {getStatusIcon(selectedDocument.status)}
                    {selectedDocument.status.replace('_', ' ')}
                  </span>
                  {selectedDocument.isRequired && (
                    <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                      Required
                    </span>
                  )}
                  {selectedDocument.isPublic && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      Public
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Property</p>
                <p className="text-sm text-gray-900">{selectedDocument.propertyTitle}</p>
                <p className="text-xs text-gray-600">{selectedDocument.propertyAddress}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Document Type</p>
                <p className="text-sm text-gray-900">{selectedDocument.type.replace('_', ' ')}</p>
              </div>
              {selectedDocument.issueDate && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Issue Date</p>
                  <p className="text-sm text-gray-900">{new Date(selectedDocument.issueDate).toLocaleDateString()}</p>
                </div>
              )}
              {selectedDocument.expiryDate && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Expiry Date</p>
                  <p className="text-sm text-gray-900">{new Date(selectedDocument.expiryDate).toLocaleDateString()}</p>
                </div>
              )}
              {selectedDocument.issuer && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Issuer</p>
                  <p className="text-sm text-gray-900">{selectedDocument.issuer}</p>
                </div>
              )}
              {selectedDocument.certificateNumber && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Certificate Number</p>
                  <p className="text-sm text-gray-900">{selectedDocument.certificateNumber}</p>
                </div>
              )}
            </div>

            {selectedDocument.tags.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Tags</p>
                <div className="flex flex-wrap gap-1">
                  {selectedDocument.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {selectedDocument.notes && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Notes</p>
                <p className="text-sm text-gray-900">{selectedDocument.notes}</p>
              </div>
            )}

            <div className="border-t pt-4">
              <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
                <div>
                  <p>Uploaded by: {selectedDocument.uploadedBy}</p>
                  <p>Upload date: {new Date(selectedDocument.uploadedAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p>File size: {formatFileSize(selectedDocument.fileSize)}</p>
                  <p>Version: {selectedDocument.version}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button variant="outline" className="flex-1">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => {
                  handleDeleteDocument(selectedDocument.id);
                  setShowDocumentModal(false);
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DocumentManagement;