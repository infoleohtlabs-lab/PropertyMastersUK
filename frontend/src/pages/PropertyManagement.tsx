import React, { useState, useEffect } from 'react';
import { Plus, Edit, Eye, Trash2, Calendar, FileText, Users, Banknote, AlertTriangle, CheckCircle, Clock, Home } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';

interface Property {
  id: string;
  title: string;
  type: string;
  status: 'available' | 'occupied' | 'maintenance' | 'draft';
  address: string;
  monthlyRent?: number;
  salePrice?: number;
  tenantName?: string;
  tenantEmail?: string;
  leaseStart?: string;
  leaseEnd?: string;
  lastInspection?: string;
  nextInspection?: string;
  maintenanceIssues: number;
  documents: number;
  images: string[];
  epcRating: string;
  createdAt: string;
}

interface MaintenanceRequest {
  id: string;
  propertyId: string;
  title: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed';
  reportedDate: string;
  description: string;
}

interface Document {
  id: string;
  propertyId: string;
  name: string;
  type: string;
  uploadDate: string;
  expiryDate?: string;
  status: 'active' | 'expired' | 'expiring_soon';
}

const PropertyManagement: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Mock data - replace with API calls
  useEffect(() => {
    const mockProperties: Property[] = [
      {
        id: '1',
        title: '3-Bedroom House, Central London',
        type: 'house',
        status: 'occupied',
        address: '123 High Street, London, SW1A 1AA',
        monthlyRent: 2500,
        tenantName: 'John Smith',
        tenantEmail: 'john.smith@email.com',
        leaseStart: '2024-01-01',
        leaseEnd: '2024-12-31',
        lastInspection: '2024-01-15',
        nextInspection: '2024-04-15',
        maintenanceIssues: 2,
        documents: 8,
        images: ['https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20three%20bedroom%20house%20exterior%20london%20brick%20facade&image_size=landscape_4_3'],
        epcRating: 'B',
        createdAt: '2024-01-01T10:00:00Z',
      },
      {
        id: '2',
        title: '2-Bedroom Apartment, Canary Wharf',
        type: 'flat',
        status: 'available',
        address: '456 Park Lane, London, W1K 1AA',
        monthlyRent: 3200,
        lastInspection: '2024-01-20',
        nextInspection: '2024-04-20',
        maintenanceIssues: 0,
        documents: 6,
        images: ['https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=luxury%20apartment%20exterior%20modern%20glass%20building%20canary%20wharf&image_size=landscape_4_3'],
        epcRating: 'A',
        createdAt: '2024-01-10T14:30:00Z',
      },
      {
        id: '3',
        title: '4-Bedroom Victorian House',
        type: 'house',
        status: 'maintenance',
        address: '789 Victoria Road, London, SW19 2AA',
        monthlyRent: 3800,
        tenantName: 'Sarah Johnson',
        tenantEmail: 'sarah.johnson@email.com',
        leaseStart: '2023-06-01',
        leaseEnd: '2024-05-31',
        lastInspection: '2024-01-10',
        nextInspection: '2024-04-10',
        maintenanceIssues: 3,
        documents: 12,
        images: ['https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=victorian%20house%20exterior%20london%20red%20brick%20bay%20windows&image_size=landscape_4_3'],
        epcRating: 'C',
        createdAt: '2023-05-15T09:00:00Z',
      },
    ];

    const mockMaintenanceRequests: MaintenanceRequest[] = [
      {
        id: '1',
        propertyId: '1',
        title: 'Leaking Kitchen Tap',
        priority: 'medium',
        status: 'pending',
        reportedDate: '2024-01-25',
        description: 'Kitchen tap is dripping constantly',
      },
      {
        id: '2',
        propertyId: '3',
        title: 'Heating System Not Working',
        priority: 'urgent',
        status: 'in_progress',
        reportedDate: '2024-01-24',
        description: 'Central heating system completely stopped working',
      },
    ];

    const mockDocuments: Document[] = [
      {
        id: '1',
        propertyId: '1',
        name: 'Gas Safety Certificate',
        type: 'gas_safety',
        uploadDate: '2024-01-01',
        expiryDate: '2025-01-01',
        status: 'active',
      },
      {
        id: '2',
        propertyId: '1',
        name: 'EPC Certificate',
        type: 'epc',
        uploadDate: '2023-12-01',
        expiryDate: '2024-03-01',
        status: 'expiring_soon',
      },
    ];

    setTimeout(() => {
      setProperties(mockProperties);
      setMaintenanceRequests(mockMaintenanceRequests);
      setDocuments(mockDocuments);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || property.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'occupied': return 'bg-blue-100 text-blue-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
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

  const getDocumentStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'expiring_soon': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalRent = properties
    .filter(p => p.status === 'occupied' && p.monthlyRent)
    .reduce((sum, p) => sum + (p.monthlyRent || 0), 0);

  const occupancyRate = properties.length > 0 
    ? (properties.filter(p => p.status === 'occupied').length / properties.length) * 100 
    : 0;

  const urgentMaintenance = maintenanceRequests.filter(r => r.priority === 'urgent').length;
  const expiringDocuments = documents.filter(d => d.status === 'expiring_soon' || d.status === 'expired').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading property management...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">Property Management</h1>
              <p className="text-gray-600 mt-1">Manage your property portfolio</p>
            </div>
            <Button className="mt-4 lg:mt-0">
              <Plus className="h-4 w-4 mr-2" />
              Add Property
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Home className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Properties</p>
                <p className="text-2xl font-bold text-gray-900">{properties.length}</p>
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
                <p className="text-2xl font-bold text-gray-900">£{totalRent.toLocaleString()}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Occupancy Rate</p>
                <p className="text-2xl font-bold text-gray-900">{occupancyRate.toFixed(1)}%</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Urgent Issues</p>
                <p className="text-2xl font-bold text-gray-900">{urgentMaintenance + expiringDocuments}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', name: 'Properties Overview', icon: Home },
                { id: 'maintenance', name: 'Maintenance', icon: AlertTriangle },
                { id: 'documents', name: 'Documents', icon: FileText },
                { id: 'inspections', name: 'Inspections', icon: Calendar },
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
        {activeTab === 'overview' && (
          <div>
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Search properties..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="available">Available</option>
                <option value="occupied">Occupied</option>
                <option value="maintenance">Maintenance</option>
                <option value="draft">Draft</option>
              </select>
            </div>

            {/* Properties Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProperties.map((property) => (
                <Card key={property.id} className="overflow-hidden">
                  <img
                    src={property.images[0]}
                    alt={property.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {property.title}
                        </h3>
                        <p className="text-sm text-gray-600">{property.address}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(property.status)}`}>
                        {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                      </span>
                    </div>

                    {property.monthlyRent && (
                      <div className="mb-3">
                        <p className="text-xl font-bold text-blue-600">
                          £{property.monthlyRent.toLocaleString()}/month
                        </p>
                      </div>
                    )}

                    {property.tenantName && (
                      <div className="mb-3">
                        <p className="text-sm text-gray-600">
                          <strong>Tenant:</strong> {property.tenantName}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Lease:</strong> {property.leaseStart} - {property.leaseEnd}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                      <div className="flex items-center">
                        <AlertTriangle className="h-4 w-4 mr-1" />
                        {property.maintenanceIssues} issues
                      </div>
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-1" />
                        {property.documents} docs
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        EPC: {property.epcRating}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'maintenance' && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Maintenance Requests</h2>
              <div className="space-y-4">
                {maintenanceRequests.map((request) => {
                  const property = properties.find(p => p.id === request.propertyId);
                  return (
                    <Card key={request.id} className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {request.title}
                            </h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                              {request.priority.toUpperCase()}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              request.status === 'completed' ? 'bg-green-100 text-green-800' :
                              request.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {request.status.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>
                          <p className="text-gray-600 mb-2">{property?.title}</p>
                          <p className="text-gray-700 mb-3">{request.description}</p>
                          <p className="text-sm text-gray-500">
                            Reported: {new Date(request.reportedDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            View Details
                          </Button>
                          <Button size="sm">
                            Update Status
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Property Documents</h2>
              <div className="space-y-4">
                {documents.map((document) => {
                  const property = properties.find(p => p.id === document.propertyId);
                  return (
                    <Card key={document.id} className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <FileText className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {document.name}
                            </h3>
                            <p className="text-gray-600">{property?.title}</p>
                            <div className="flex items-center gap-4 mt-1">
                              <p className="text-sm text-gray-500">
                                Uploaded: {new Date(document.uploadDate).toLocaleDateString()}
                              </p>
                              {document.expiryDate && (
                                <p className="text-sm text-gray-500">
                                  Expires: {new Date(document.expiryDate).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDocumentStatusColor(document.status)}`}>
                            {document.status.replace('_', ' ').toUpperCase()}
                          </span>
                          <Button size="sm" variant="outline">
                            Download
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'inspections' && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Property Inspections</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {properties.map((property) => (
                  <Card key={property.id} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {property.title}
                        </h3>
                        <p className="text-gray-600">{property.address}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(property.status)}`}>
                        {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {property.lastInspection && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                            <span className="text-sm text-gray-600">Last Inspection</span>
                          </div>
                          <span className="text-sm font-medium">
                            {new Date(property.lastInspection).toLocaleDateString()}
                          </span>
                        </div>
                      )}

                      {property.nextInspection && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 text-blue-600 mr-2" />
                            <span className="text-sm text-gray-600">Next Inspection</span>
                          </div>
                          <span className="text-sm font-medium">
                            {new Date(property.nextInspection).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Calendar className="h-4 w-4 mr-1" />
                        Schedule
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <FileText className="h-4 w-4 mr-1" />
                        Report
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyManagement;