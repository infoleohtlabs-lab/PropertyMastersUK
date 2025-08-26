import React, { useState, useEffect } from 'react';
import { 
  User, 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Upload, 
  Download,
  Plus,
  Edit,
  Trash2,
  Phone,
  Mail,
  Building,
  CreditCard,
  Shield,
  Star,
  Calendar,
  Banknote
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Modal } from './ui/Modal';

interface TenantSelfReferencingProps {
  tenantId: string;
  className?: string;
}

interface TenantReference {
  id: string;
  referenceType: 'employer' | 'previous_landlord' | 'personal' | 'character' | 'professional' | 'academic';
  referenceName: string;
  referenceEmail: string;
  referencePhone: string;
  companyName?: string;
  position?: string;
  relationship: string;
  status: 'pending' | 'requested' | 'received' | 'verified' | 'rejected';
  requestedDate?: string;
  receivedDate?: string;
  verifiedDate?: string;
  notes?: string;
  rating?: number;
  feedback?: string;
}

interface TenantApplication {
  id: string;
  propertyId: string;
  propertyTitle: string;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';
  submittedDate?: string;
  completionPercentage: number;
  requiredDocuments: string[];
  uploadedDocuments: string[];
  creditCheckPassed?: boolean;
  creditScore?: number;
  employmentVerified?: boolean;
  referencesVerified?: boolean;
  rightToRentVerified?: boolean;
}

interface VerificationStatus {
  identity: boolean;
  income: boolean;
  employment: boolean;
  creditCheck: boolean;
  references: boolean;
  rightToRent: boolean;
}

const TenantSelfReferencing: React.FC<TenantSelfReferencingProps> = ({ 
  tenantId, 
  className = '' 
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'applications' | 'references' | 'documents' | 'verification'>('overview');
  const [applications, setApplications] = useState<TenantApplication[]>([]);
  const [references, setReferences] = useState<TenantReference[]>([]);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>({
    identity: false,
    income: false,
    employment: false,
    creditCheck: false,
    references: false,
    rightToRent: false
  });
  const [showAddReferenceModal, setShowAddReferenceModal] = useState(false);
  const [showDocumentUploadModal, setShowDocumentUploadModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newReference, setNewReference] = useState<Partial<TenantReference>>({});

  // Mock data
  const mockApplications: TenantApplication[] = [
    {
      id: '1',
      propertyId: 'prop1',
      propertyTitle: 'Modern 2-Bed Apartment in Manchester City Centre',
      status: 'under_review',
      submittedDate: '2024-01-15T10:00:00Z',
      completionPercentage: 85,
      requiredDocuments: ['ID', 'Proof of Income', 'Bank Statements', 'Employment Letter', 'References'],
      uploadedDocuments: ['ID', 'Proof of Income', 'Bank Statements', 'Employment Letter'],
      creditCheckPassed: true,
      creditScore: 720,
      employmentVerified: true,
      referencesVerified: false,
      rightToRentVerified: true
    },
    {
      id: '2',
      propertyId: 'prop2',
      propertyTitle: 'Victorian House in Birmingham',
      status: 'draft',
      completionPercentage: 45,
      requiredDocuments: ['ID', 'Proof of Income', 'Bank Statements', 'Employment Letter', 'References'],
      uploadedDocuments: ['ID', 'Proof of Income']
    }
  ];

  const mockReferences: TenantReference[] = [
    {
      id: '1',
      referenceType: 'employer',
      referenceName: 'Sarah Johnson',
      referenceEmail: 'sarah.johnson@techcorp.com',
      referencePhone: '+44 7700 900123',
      companyName: 'TechCorp Ltd',
      position: 'HR Manager',
      relationship: 'Direct Supervisor',
      status: 'verified',
      requestedDate: '2024-01-10T09:00:00Z',
      receivedDate: '2024-01-12T14:30:00Z',
      verifiedDate: '2024-01-13T11:00:00Z',
      rating: 5,
      feedback: 'Excellent employee, reliable and professional'
    },
    {
      id: '2',
      referenceType: 'previous_landlord',
      referenceName: 'Michael Brown',
      referenceEmail: 'michael@brownproperties.co.uk',
      referencePhone: '+44 7700 900456',
      companyName: 'Brown Properties',
      relationship: 'Previous Landlord',
      status: 'received',
      requestedDate: '2024-01-11T10:00:00Z',
      receivedDate: '2024-01-14T16:00:00Z',
      rating: 4,
      feedback: 'Good tenant, always paid rent on time'
    },
    {
      id: '3',
      referenceType: 'personal',
      referenceName: 'Emma Wilson',
      referenceEmail: 'emma.wilson@email.com',
      referencePhone: '+44 7700 900789',
      relationship: 'Friend for 5 years',
      status: 'requested',
      requestedDate: '2024-01-12T15:00:00Z'
    }
  ];

  useEffect(() => {
    setApplications(mockApplications);
    setReferences(mockReferences);
    setVerificationStatus({
      identity: true,
      income: true,
      employment: true,
      creditCheck: true,
      references: false,
      rightToRent: true
    });
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
      case 'approved':
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'received':
      case 'under_review':
      case 'submitted':
        return 'text-blue-600 bg-blue-100';
      case 'requested':
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'rejected':
      case 'failed':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
      case 'approved':
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'received':
      case 'under_review':
      case 'submitted':
        return <Clock className="h-4 w-4" />;
      case 'requested':
      case 'pending':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const handleAddReference = async () => {
    if (!newReference.referenceName || !newReference.referenceEmail || !newReference.referenceType) {
      return;
    }

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      const reference: TenantReference = {
        id: Date.now().toString(),
        referenceType: newReference.referenceType!,
        referenceName: newReference.referenceName!,
        referenceEmail: newReference.referenceEmail!,
        referencePhone: newReference.referencePhone || '',
        companyName: newReference.companyName,
        position: newReference.position,
        relationship: newReference.relationship || '',
        status: 'pending'
      };
      
      setReferences(prev => [...prev, reference]);
      setNewReference({});
      setShowAddReferenceModal(false);
      setLoading(false);
    }, 1000);
  };

  const handleRequestReference = async (referenceId: string) => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setReferences(prev => prev.map(ref => 
        ref.id === referenceId 
          ? { ...ref, status: 'requested', requestedDate: new Date().toISOString() }
          : ref
      ));
      setLoading(false);
    }, 500);
  };

  const handleCreditCheck = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setVerificationStatus(prev => ({ ...prev, creditCheck: true }));
      setLoading(false);
    }, 2000);
  };

  const handleEmploymentVerification = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setVerificationStatus(prev => ({ ...prev, employment: true }));
      setLoading(false);
    }, 1500);
  };

  const renderOverview = () => {
    const completedVerifications = Object.values(verificationStatus).filter(Boolean).length;
    const totalVerifications = Object.keys(verificationStatus).length;
    const completionPercentage = Math.round((completedVerifications / totalVerifications) * 100);

    return (
      <div className="space-y-6">
        {/* Progress Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Verification Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span>Overall Progress</span>
                <span>{completionPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${completionPercentage}%` }}
                ></div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(verificationStatus).map(([key, completed]) => (
                <div key={key} className="flex items-center space-x-2">
                  {completed ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <Clock className="h-5 w-5 text-gray-400" />
                  )}
                  <span className={`text-sm capitalize ${
                    completed ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button 
                onClick={() => setActiveTab('applications')}
                className="h-20 flex flex-col items-center justify-center"
                variant="outline">
                <FileText className="h-6 w-6 mb-2" />
                <span>Applications</span>
              </Button>
              
              <Button 
                onClick={() => setActiveTab('references')}
                className="h-20 flex flex-col items-center justify-center"
                variant="outline">
                <User className="h-6 w-6 mb-2" />
                <span>References</span>
              </Button>
              
              <Button 
                onClick={() => setActiveTab('documents')}
                className="h-20 flex flex-col items-center justify-center"
                variant="outline">
                <Upload className="h-6 w-6 mb-2" />
                <span>Documents</span>
              </Button>
              
              <Button 
                onClick={() => setActiveTab('verification')}
                className="h-20 flex flex-col items-center justify-center"
                variant="outline">
                <Shield className="h-6 w-6 mb-2" />
                <span>Verification</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Employment reference verified</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <Clock className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">Credit check completed</p>
                  <p className="text-xs text-gray-500">1 day ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium">Personal reference requested</p>
                  <p className="text-xs text-gray-500">2 days ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: Shield },
            { id: 'applications', label: 'Applications', icon: FileText },
            { id: 'references', label: 'References', icon: User },
            { id: 'documents', label: 'Documents', icon: Upload },
            { id: 'verification', label: 'Verification', icon: CheckCircle }
          ].map((tab) => {
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
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && renderOverview()}
      
      {activeTab === 'applications' && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Applications management coming soon</p>
        </div>
      )}
      
      {activeTab === 'references' && (
        <div className="text-center py-12">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">References management coming soon</p>
        </div>
      )}
      
      {activeTab === 'documents' && (
        <div className="text-center py-12">
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Document upload coming soon</p>
        </div>
      )}
      
      {activeTab === 'verification' && (
        <div className="text-center py-12">
          <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Verification tools coming soon</p>
        </div>
      )}

      {/* Add Reference Modal */}
      {showAddReferenceModal && (
        <Modal
          isOpen={showAddReferenceModal}
          onClose={() => setShowAddReferenceModal(false)}
          title="Add Reference"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reference Type
              </label>
              <select
                value={newReference.referenceType || ''}
                onChange={(e) => setNewReference({ ...newReference, referenceType: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select type</option>
                <option value="employer">Employer</option>
                <option value="previous_landlord">Previous Landlord</option>
                <option value="personal">Personal</option>
                <option value="character">Character</option>
                <option value="professional">Professional</option>
                <option value="academic">Academic</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reference Name
              </label>
              <Input
                value={newReference.referenceName || ''}
                onChange={(e) => setNewReference({ ...newReference, referenceName: e.target.value })}
                placeholder="Enter reference name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <Input
                type="email"
                value={newReference.referenceEmail || ''}
                onChange={(e) => setNewReference({ ...newReference, referenceEmail: e.target.value })}
                placeholder="Enter email address"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <Input
                value={newReference.referencePhone || ''}
                onChange={(e) => setNewReference({ ...newReference, referencePhone: e.target.value })}
                placeholder="Enter phone number"
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowAddReferenceModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddReference}
                disabled={loading}
              >
                {loading ? 'Adding...' : 'Add Reference'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default TenantSelfReferencing;