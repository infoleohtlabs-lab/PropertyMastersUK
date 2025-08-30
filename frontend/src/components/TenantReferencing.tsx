import React, { useState, useEffect } from 'react';
import {
  User,
  FileText,
  Upload,
  CheckCircle,
  AlertCircle,
  Clock,
  CreditCard,
  Building,
  Phone,
  Mail,
  Calendar,
  MapPin,
  Banknote,
  Shield,
  Download,
  Eye,
  Star,
  TrendingUp,
  Users,
  Briefcase,
  Home,
  Plus,
  X
} from 'lucide-react';
import { formatCurrency } from '../utils';

interface TenantApplication {
  id: string;
  propertyId: string;
  propertyAddress: string;
  applicantName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  nationality: string;
  employmentStatus: 'employed' | 'self_employed' | 'unemployed' | 'student' | 'retired';
  annualIncome: number;
  currentAddress: string;
  moveInDate: string;
  tenancyLength: string;
  guarantorRequired: boolean;
  pets: boolean;
  smoking: boolean;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';
  creditScore?: number;
  creditStatus?: 'pending' | 'passed' | 'failed';
  employmentVerified?: boolean;
  referencesVerified?: boolean;
  documentsComplete?: boolean;
  overallScore?: number;
  submittedDate?: string;
  reviewedDate?: string;
  notes?: string;
}

interface ReferenceContact {
  id: string;
  type: 'employer' | 'previous_landlord' | 'personal';
  name: string;
  company?: string;
  email: string;
  phone: string;
  relationship: string;
  verified: boolean;
  verificationDate?: string;
}

interface DocumentUpload {
  id: string;
  type: 'id_document' | 'proof_of_income' | 'bank_statement' | 'employment_contract' | 'previous_tenancy' | 'other';
  name: string;
  url: string;
  uploadDate: string;
  verified: boolean;
  verificationDate?: string;
  notes?: string;
}

interface CreditCheckResult {
  score: number;
  rating: 'excellent' | 'good' | 'fair' | 'poor';
  factors: {
    paymentHistory: number;
    creditUtilization: number;
    creditHistory: number;
    creditMix: number;
    newCredit: number;
  };
  recommendations: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

const TenantReferencing: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'applications' | 'new_application' | 'credit_checks'>('applications');
  const [selectedApplication, setSelectedApplication] = useState<TenantApplication | null>(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<TenantApplication>>({});
  const [references, setReferences] = useState<ReferenceContact[]>([]);
  const [documents, setDocuments] = useState<DocumentUpload[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Mock data - in production, this would come from APIs
  const applications: TenantApplication[] = [
    {
      id: 'APP001',
      propertyId: 'P001',
      propertyAddress: '123 High Street, London SW1A 1AA',
      applicantName: 'John Smith',
      email: 'john.smith@email.com',
      phone: '+44 7700 900123',
      dateOfBirth: '1990-05-15',
      nationality: 'British',
      employmentStatus: 'employed',
      annualIncome: 45000,
      currentAddress: '456 Current Street, London',
      moveInDate: '2024-03-01',
      tenancyLength: '12 months',
      guarantorRequired: false,
      pets: false,
      smoking: false,
      status: 'approved',
      creditScore: 750,
      creditStatus: 'passed',
      employmentVerified: true,
      referencesVerified: true,
      documentsComplete: true,
      overallScore: 85,
      submittedDate: '2024-01-15',
      reviewedDate: '2024-01-18'
    },
    {
      id: 'APP002',
      propertyId: 'P002',
      propertyAddress: '456 Park Avenue, London E1 6AN',
      applicantName: 'Sarah Wilson',
      email: 'sarah.wilson@email.com',
      phone: '+44 7700 900456',
      dateOfBirth: '1985-08-22',
      nationality: 'British',
      employmentStatus: 'self_employed',
      annualIncome: 38000,
      currentAddress: '789 Current Road, London',
      moveInDate: '2024-02-15',
      tenancyLength: '6 months',
      guarantorRequired: true,
      pets: true,
      smoking: false,
      status: 'under_review',
      creditScore: 680,
      creditStatus: 'passed',
      employmentVerified: false,
      referencesVerified: true,
      documentsComplete: false,
      overallScore: 72,
      submittedDate: '2024-01-20'
    },
    {
      id: 'APP003',
      propertyId: 'P003',
      propertyAddress: '789 Garden Square, London N1 2AB',
      applicantName: 'David Lee',
      email: 'david.lee@email.com',
      phone: '+44 7700 900789',
      dateOfBirth: '1992-12-10',
      nationality: 'British',
      employmentStatus: 'employed',
      annualIncome: 52000,
      currentAddress: '321 Current Avenue, London',
      moveInDate: '2024-04-01',
      tenancyLength: '24 months',
      guarantorRequired: false,
      pets: false,
      smoking: false,
      status: 'submitted',
      creditStatus: 'pending',
      employmentVerified: false,
      referencesVerified: false,
      documentsComplete: true,
      submittedDate: '2024-01-22'
    }
  ];

  const mockCreditCheck: CreditCheckResult = {
    score: 750,
    rating: 'excellent',
    factors: {
      paymentHistory: 95,
      creditUtilization: 25,
      creditHistory: 85,
      creditMix: 80,
      newCredit: 90
    },
    recommendations: [
      'Maintain low credit utilization',
      'Continue making payments on time',
      'Consider diversifying credit types'
    ],
    riskLevel: 'low'
  };



  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'under_review': return 'bg-blue-100 text-blue-800';
      case 'submitted': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCreditRatingColor = (rating: string): string => {
    switch (rating) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'fair': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredApplications = applications.filter(app => {
    return filterStatus === 'all' || app.status === filterStatus;
  });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting application:', formData);
    // In production, this would make API calls
  };

  const handleDocumentUpload = (file: File, type: string) => {
    console.log('Uploading document:', file.name, type);
    // In production, this would upload to cloud storage
  };

  const handleCreditCheck = (applicationId: string) => {
    console.log('Running credit check for:', applicationId);
    // In production, this would integrate with credit check APIs
  };

  const addReference = () => {
    const newReference: ReferenceContact = {
      id: `ref_${Date.now()}`,
      type: 'employer',
      name: '',
      email: '',
      phone: '',
      relationship: '',
      verified: false
    };
    setReferences([...references, newReference]);
  };

  const removeReference = (id: string) => {
    setReferences(references.filter(ref => ref.id !== id));
  };

  const updateReference = (id: string, field: string, value: string) => {
    setReferences(references.map(ref => 
      ref.id === id ? { ...ref, [field]: value } : ref
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tenant Referencing</h1>
          <p className="text-gray-600">Manage tenant applications, credit checks, and verification</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {
              setActiveTab('new_application');
              setCurrentStep(1);
              setFormData({});
              setReferences([]);
              setDocuments([]);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Application
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'applications', label: 'Applications', icon: FileText },
              { id: 'new_application', label: 'New Application', icon: Plus },
              { id: 'credit_checks', label: 'Credit Checks', icon: CreditCard }
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
          {/* Applications Tab */}
          {activeTab === 'applications' && (
            <div className="space-y-6">
              {/* Filter */}
              <div className="flex gap-4">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="submitted">Submitted</option>
                  <option value="under_review">Under Review</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              {/* Applications List */}
              <div className="space-y-4">
                {filteredApplications.map((application) => (
                  <div key={application.id} className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="font-semibold text-gray-900">{application.applicantName}</h3>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(application.status)}`}>
                            {application.status.replace('_', ' ').toUpperCase()}
                          </span>
                          {application.overallScore && (
                            <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 ${getScoreColor(application.overallScore)}`}>
                              <Star className="h-3 w-3" />
                              {application.overallScore}/100
                            </span>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>{application.propertyAddress}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Banknote className="h-4 w-4" />
                            <span>{formatCurrency(application.annualIncome)}/year</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>Move-in: {formatDate(application.moveInDate)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Briefcase className="h-4 w-4" />
                            <span className="capitalize">{application.employmentStatus.replace('_', ' ')}</span>
                          </div>
                        </div>
                        
                        {/* Verification Status */}
                        <div className="flex gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            {application.creditStatus === 'passed' ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : application.creditStatus === 'failed' ? (
                              <X className="h-4 w-4 text-red-500" />
                            ) : (
                              <Clock className="h-4 w-4 text-yellow-500" />
                            )}
                            <span>Credit Check</span>
                            {application.creditScore && (
                              <span className="font-medium">({application.creditScore})</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {application.employmentVerified ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <Clock className="h-4 w-4 text-yellow-500" />
                            )}
                            <span>Employment</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {application.referencesVerified ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <Clock className="h-4 w-4 text-yellow-500" />
                            )}
                            <span>References</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {application.documentsComplete ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <Clock className="h-4 w-4 text-yellow-500" />
                            )}
                            <span>Documents</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => {
                            setSelectedApplication(application);
                            setShowApplicationModal(true);
                          }}
                          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        >
                          View Details
                        </button>
                        {application.status === 'submitted' && (
                          <button
                            onClick={() => handleCreditCheck(application.id)}
                            className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                          >
                            Review
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Application Tab */}
          {activeTab === 'new_application' && (
            <div className="space-y-6">
              {/* Progress Steps */}
              <div className="flex items-center justify-between mb-8">
                {[
                  { step: 1, title: 'Personal Details', icon: User },
                  { step: 2, title: 'Employment & Income', icon: Briefcase },
                  { step: 3, title: 'References', icon: Users },
                  { step: 4, title: 'Documents', icon: FileText },
                  { step: 5, title: 'Review & Submit', icon: CheckCircle }
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.step} className="flex items-center">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                        currentStep >= item.step
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'border-gray-300 text-gray-400'
                      }`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="ml-3">
                        <p className={`text-sm font-medium ${
                          currentStep >= item.step ? 'text-blue-600' : 'text-gray-400'
                        }`}>
                          Step {item.step}
                        </p>
                        <p className={`text-xs ${
                          currentStep >= item.step ? 'text-gray-900' : 'text-gray-400'
                        }`}>
                          {item.title}
                        </p>
                      </div>
                      {item.step < 5 && (
                        <div className={`flex-1 h-0.5 mx-4 ${
                          currentStep > item.step ? 'bg-blue-600' : 'bg-gray-300'
                        }`} />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Form Content */}
              <form onSubmit={handleFormSubmit} className="space-y-6">
                {/* Step 1: Personal Details */}
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Personal Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.applicantName || ''}
                          onChange={(e) => setFormData({...formData, applicantName: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email || ''}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          required
                          value={formData.phone || ''}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Date of Birth *
                        </label>
                        <input
                          type="date"
                          required
                          value={formData.dateOfBirth || ''}
                          onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nationality *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.nationality || ''}
                          onChange={(e) => setFormData({...formData, nationality: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Current Address *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.currentAddress || ''}
                          onChange={(e) => setFormData({...formData, currentAddress: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Employment & Income */}
                {currentStep === 2 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Employment & Income</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Employment Status *
                        </label>
                        <select
                          required
                          value={formData.employmentStatus || ''}
                          onChange={(e) => setFormData({...formData, employmentStatus: e.target.value as any})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select status</option>
                          <option value="employed">Employed</option>
                          <option value="self_employed">Self Employed</option>
                          <option value="unemployed">Unemployed</option>
                          <option value="student">Student</option>
                          <option value="retired">Retired</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Annual Income (£) *
                        </label>
                        <input
                          type="number"
                          required
                          value={formData.annualIncome || ''}
                          onChange={(e) => setFormData({...formData, annualIncome: parseInt(e.target.value)})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Preferred Move-in Date *
                        </label>
                        <input
                          type="date"
                          required
                          value={formData.moveInDate || ''}
                          onChange={(e) => setFormData({...formData, moveInDate: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Preferred Tenancy Length
                        </label>
                        <select
                          value={formData.tenancyLength || ''}
                          onChange={(e) => setFormData({...formData, tenancyLength: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select length</option>
                          <option value="6 months">6 months</option>
                          <option value="12 months">12 months</option>
                          <option value="18 months">18 months</option>
                          <option value="24 months">24 months</option>
                          <option value="36 months">36 months</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="guarantor"
                          checked={formData.guarantorRequired || false}
                          onChange={(e) => setFormData({...formData, guarantorRequired: e.target.checked})}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="guarantor" className="ml-2 text-sm text-gray-700">
                          I have a guarantor available if required
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="pets"
                          checked={formData.pets || false}
                          onChange={(e) => setFormData({...formData, pets: e.target.checked})}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="pets" className="ml-2 text-sm text-gray-700">
                          I have pets
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="smoking"
                          checked={formData.smoking || false}
                          onChange={(e) => setFormData({...formData, smoking: e.target.checked})}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="smoking" className="ml-2 text-sm text-gray-700">
                          I am a smoker
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: References */}
                {currentStep === 3 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">References</h3>
                      <button
                        type="button"
                        onClick={addReference}
                        className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                        Add Reference
                      </button>
                    </div>
                    
                    {references.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No references added yet. Click "Add Reference" to get started.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {references.map((reference, index) => (
                          <div key={reference.id} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="font-medium text-gray-900">Reference {index + 1}</h4>
                              <button
                                type="button"
                                onClick={() => removeReference(reference.id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Reference Type
                                </label>
                                <select
                                  value={reference.type}
                                  onChange={(e) => updateReference(reference.id, 'type', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                  <option value="employer">Employer</option>
                                  <option value="previous_landlord">Previous Landlord</option>
                                  <option value="personal">Personal Reference</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Full Name
                                </label>
                                <input
                                  type="text"
                                  value={reference.name}
                                  onChange={(e) => updateReference(reference.id, 'name', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Email
                                </label>
                                <input
                                  type="email"
                                  value={reference.email}
                                  onChange={(e) => updateReference(reference.id, 'email', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Phone
                                </label>
                                <input
                                  type="tel"
                                  value={reference.phone}
                                  onChange={(e) => updateReference(reference.id, 'phone', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                              </div>
                              {reference.type !== 'employer' && (
                                <div className="md:col-span-2">
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Relationship
                                  </label>
                                  <input
                                    type="text"
                                    value={reference.relationship}
                                    onChange={(e) => updateReference(reference.id, 'relationship', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="e.g., Friend, Family member, Previous landlord"
                                  />
                                </div>
                              )}
                              {reference.type === 'employer' && (
                                <div className="md:col-span-2">
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Company
                                  </label>
                                  <input
                                    type="text"
                                    value={reference.company || ''}
                                    onChange={(e) => updateReference(reference.id, 'company', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Step 4: Documents */}
                {currentStep === 4 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Required Documents</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {[
                        { type: 'id_document', label: 'Photo ID (Passport/Driving License)', required: true },
                        { type: 'proof_of_income', label: 'Proof of Income (Payslips/Bank Statements)', required: true },
                        { type: 'employment_contract', label: 'Employment Contract', required: false },
                        { type: 'bank_statement', label: 'Bank Statements (3 months)', required: true },
                        { type: 'previous_tenancy', label: 'Previous Tenancy Agreement', required: false }
                      ].map((doc) => (
                        <div key={doc.type} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h4 className="font-medium text-gray-900">{doc.label}</h4>
                              {doc.required && (
                                <span className="text-xs text-red-600">Required</span>
                              )}
                            </div>
                            <Upload className="h-5 w-5 text-gray-400" />
                          </div>
                          
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer">
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleDocumentUpload(file, doc.type);
                                }
                              }}
                              className="hidden"
                              id={`upload-${doc.type}`}
                            />
                            <label htmlFor={`upload-${doc.type}`} className="cursor-pointer">
                              <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                              <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                              <p className="text-xs text-gray-500">PDF, JPG, PNG up to 10MB</p>
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 5: Review & Submit */}
                {currentStep === 5 && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900">Review & Submit</h3>
                    
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h4 className="font-medium text-gray-900 mb-4">Application Summary</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Name:</span>
                          <span className="ml-2 text-gray-900">{formData.applicantName}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Email:</span>
                          <span className="ml-2 text-gray-900">{formData.email}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Annual Income:</span>
                          <span className="ml-2 text-gray-900">{formData.annualIncome ? formatCurrency(formData.annualIncome) : 'Not specified'}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Employment:</span>
                          <span className="ml-2 text-gray-900 capitalize">{formData.employmentStatus?.replace('_', ' ') || 'Not specified'}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Move-in Date:</span>
                          <span className="ml-2 text-gray-900">{formData.moveInDate ? formatDate(formData.moveInDate) : 'Not specified'}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">References:</span>
                          <span className="ml-2 text-gray-900">{references.length} added</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <h5 className="font-medium text-blue-900">Data Protection Notice</h5>
                          <p className="text-sm text-blue-800 mt-1">
                            By submitting this application, you consent to us processing your personal data for the purpose of tenant referencing and credit checks. Your data will be handled in accordance with GDPR regulations.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="consent"
                        required
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="consent" className="ml-2 text-sm text-gray-700">
                        I agree to the terms and conditions and consent to credit checks and reference verification *
                      </label>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-6">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                    disabled={currentStep === 1}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  {currentStep < 5 ? (
                    <button
                      type="button"
                      onClick={() => setCurrentStep(Math.min(5, currentStep + 1))}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700"
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700"
                    >
                      Submit Application
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}

          {/* Credit Checks Tab */}
          {activeTab === 'credit_checks' && (
            <div className="space-y-6">
              {/* Credit Check Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-green-600">Passed</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">24</div>
                </div>
                <div className="bg-red-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <X className="h-5 w-5 text-red-600" />
                    <span className="text-sm font-medium text-red-600">Failed</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">3</div>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-5 w-5 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-600">Pending</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">5</div>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-600">Avg Score</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">720</div>
                </div>
              </div>

              {/* Sample Credit Check Result */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Sample Credit Check Result</h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <div className="text-center mb-6">
                      <div className="text-4xl font-bold text-green-600 mb-2">{mockCreditCheck.score}</div>
                      <div className={`text-lg font-medium ${getCreditRatingColor(mockCreditCheck.rating)}`}>
                        {mockCreditCheck.rating.toUpperCase()}
                      </div>
                      <div className="text-sm text-gray-600">Credit Score</div>
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900">Credit Factors</h4>
                      {Object.entries(mockCreditCheck.factors).map(([factor, score]) => (
                        <div key={factor} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 capitalize">
                            {factor.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  score >= 80 ? 'bg-green-500' :
                                  score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${score}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-900 w-8">{score}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="h-5 w-5 text-blue-600" />
                        <span className="font-medium text-gray-900">Risk Assessment</span>
                      </div>
                      <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                        mockCreditCheck.riskLevel === 'low' ? 'bg-green-100 text-green-800' :
                        mockCreditCheck.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {mockCreditCheck.riskLevel.toUpperCase()} RISK
                      </span>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Recommendations</h4>
                      <ul className="space-y-2">
                        {mockCreditCheck.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TenantReferencing;