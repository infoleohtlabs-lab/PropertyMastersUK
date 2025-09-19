import React, { useState, useEffect } from 'react';
import { CreditCard, Clock, CheckCircle, XCircle, AlertTriangle, Calculator, FileText, Plus, Download, Upload } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

interface MortgageApplication {
  id: string;
  lender: {
    name: string;
    logo?: string;
    contactPerson?: string;
    phone?: string;
    email?: string;
  };
  applicationNumber: string;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'offer_made';
  loanAmount: number;
  propertyValue: number;
  loanToValue: number;
  interestRate?: number;
  term: number; // in years
  monthlyPayment?: number;
  applicationDate: string;
  decisionDate?: string;
  offerExpiryDate?: string;
  applicationType: 'purchase' | 'remortgage' | 'buy_to_let';
  property?: {
    address: string;
    propertyType: string;
    tenure: string;
  };
  documents: {
    id: string;
    name: string;
    type: string;
    status: 'required' | 'uploaded' | 'verified' | 'rejected';
    uploadDate?: string;
  }[];
  conditions?: string[];
  notes?: string;
}

const MortgageApplications: React.FC = () => {
  const { user } = useAuthStore();
  const [applications, setApplications] = useState<MortgageApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'all'>('active');
  const [showCalculator, setShowCalculator] = useState(false);
  const [calculator, setCalculator] = useState({
    propertyValue: '',
    deposit: '',
    term: '25',
    interestRate: '4.5'
  });

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API call
      const mockData: MortgageApplication[] = [
        {
          id: '1',
          lender: {
            name: 'Halifax',
            contactPerson: 'John Smith',
            phone: '+44 345 720 3040',
            email: 'john.smith@halifax.co.uk'
          },
          applicationNumber: 'HAL-2024-001234',
          status: 'approved',
          loanAmount: 200000,
          propertyValue: 250000,
          loanToValue: 80,
          interestRate: 4.25,
          term: 25,
          monthlyPayment: 1098,
          applicationDate: '2024-01-15',
          decisionDate: '2024-01-22',
          offerExpiryDate: '2024-04-22',
          applicationType: 'purchase',
          property: {
            address: '123 High Street, Birmingham, B1 1AA',
            propertyType: 'Apartment',
            tenure: 'Leasehold'
          },
          documents: [
            { id: '1', name: 'Payslips (3 months)', type: 'income', status: 'verified', uploadDate: '2024-01-16' },
            { id: '2', name: 'Bank Statements (3 months)', type: 'financial', status: 'verified', uploadDate: '2024-01-16' },
            { id: '3', name: 'ID Document', type: 'identity', status: 'verified', uploadDate: '2024-01-15' },
            { id: '4', name: 'Property Valuation', type: 'property', status: 'verified', uploadDate: '2024-01-20' }
          ],
          conditions: ['Property valuation satisfactory', 'Employment verification complete'],
          notes: 'Fast-track application approved'
        },
        {
          id: '2',
          lender: {
            name: 'Nationwide',
            contactPerson: 'Sarah Johnson',
            phone: '+44 345 266 0611',
            email: 'sarah.johnson@nationwide.co.uk'
          },
          applicationNumber: 'NW-2024-005678',
          status: 'under_review',
          loanAmount: 280000,
          propertyValue: 350000,
          loanToValue: 80,
          interestRate: 4.15,
          term: 30,
          applicationDate: '2024-01-20',
          applicationType: 'purchase',
          property: {
            address: '45 Oak Avenue, Manchester, M1 2BB',
            propertyType: 'House',
            tenure: 'Freehold'
          },
          documents: [
            { id: '5', name: 'Payslips (3 months)', type: 'income', status: 'verified', uploadDate: '2024-01-21' },
            { id: '6', name: 'Bank Statements (3 months)', type: 'financial', status: 'uploaded', uploadDate: '2024-01-21' },
            { id: '7', name: 'ID Document', type: 'identity', status: 'verified', uploadDate: '2024-01-20' },
            { id: '8', name: 'Property Survey', type: 'property', status: 'required' }
          ],
          notes: 'Awaiting property survey completion'
        },
        {
          id: '3',
          lender: {
            name: 'Barclays',
            contactPerson: 'Michael Brown',
            phone: '+44 345 734 5345',
            email: 'michael.brown@barclays.co.uk'
          },
          applicationNumber: 'BAR-2024-009876',
          status: 'rejected',
          loanAmount: 400000,
          propertyValue: 500000,
          loanToValue: 80,
          term: 25,
          applicationDate: '2024-01-10',
          decisionDate: '2024-01-18',
          applicationType: 'purchase',
          documents: [
            { id: '9', name: 'Payslips (3 months)', type: 'income', status: 'rejected', uploadDate: '2024-01-11' },
            { id: '10', name: 'Bank Statements (3 months)', type: 'financial', status: 'verified', uploadDate: '2024-01-11' }
          ],
          notes: 'Insufficient income for requested loan amount'
        }
      ];
      setApplications(mockData);
    } catch (error) {
      console.error('Error loading mortgage applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateMortgage = () => {
    const propertyValue = parseFloat(calculator.propertyValue);
    const deposit = parseFloat(calculator.deposit);
    const loanAmount = propertyValue - deposit;
    const monthlyRate = parseFloat(calculator.interestRate) / 100 / 12;
    const numberOfPayments = parseInt(calculator.term) * 12;
    
    const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
                          (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    
    const loanToValue = (loanAmount / propertyValue) * 100;
    
    return {
      loanAmount,
      monthlyPayment: isNaN(monthlyPayment) ? 0 : monthlyPayment,
      loanToValue: isNaN(loanToValue) ? 0 : loanToValue
    };
  };

  const getFilteredApplications = () => {
    switch (activeTab) {
      case 'active':
        return applications.filter(a => ['draft', 'submitted', 'under_review', 'offer_made'].includes(a.status));
      case 'completed':
        return applications.filter(a => ['approved', 'rejected'].includes(a.status));
      case 'all':
      default:
        return applications;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <FileText className="h-4 w-4 text-gray-600" />;
      case 'submitted':
      case 'under_review':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'approved':
      case 'offer_made':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'submitted':
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
      case 'offer_made':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDocumentStatusColor = (status: string) => {
    switch (status) {
      case 'required':
        return 'bg-red-100 text-red-800';
      case 'uploaded':
        return 'bg-yellow-100 text-yellow-800';
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading mortgage applications...</p>
        </div>
      </div>
    );
  }

  const filteredApplications = getFilteredApplications();
  const calculatorResults = calculateMortgage();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mortgage Applications</h1>
              <p className="mt-2 text-gray-600">
                Track and manage your mortgage applications
              </p>
            </div>
            <div className="flex space-x-3">
              <button 
                onClick={() => setShowCalculator(!showCalculator)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
              >
                <Calculator className="h-4 w-4 mr-2" />
                Mortgage Calculator
              </button>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
                <Plus className="h-4 w-4 mr-2" />
                New Application
              </button>
            </div>
          </div>
        </div>

        {/* Mortgage Calculator */}
        {showCalculator && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Mortgage Calculator</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Property Value</label>
                  <input
                    type="number"
                    value={calculator.propertyValue}
                    onChange={(e) => setCalculator(prev => ({ ...prev, propertyValue: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="£250,000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deposit</label>
                  <input
                    type="number"
                    value={calculator.deposit}
                    onChange={(e) => setCalculator(prev => ({ ...prev, deposit: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="£50,000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mortgage Term (years)</label>
                  <select
                    value={calculator.term}
                    onChange={(e) => setCalculator(prev => ({ ...prev, term: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="15">15 years</option>
                    <option value="20">20 years</option>
                    <option value="25">25 years</option>
                    <option value="30">30 years</option>
                    <option value="35">35 years</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Interest Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={calculator.interestRate}
                    onChange={(e) => setCalculator(prev => ({ ...prev, interestRate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="4.5"
                  />
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-4">Calculation Results</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Loan Amount:</span>
                    <span className="font-medium">{formatPrice(calculatorResults.loanAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Loan to Value:</span>
                    <span className="font-medium">{calculatorResults.loanToValue.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between border-t pt-3">
                    <span className="text-gray-600">Monthly Payment:</span>
                    <span className="font-bold text-lg text-blue-600">
                      {formatPrice(calculatorResults.monthlyPayment)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CreditCard className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Applications</p>
                <p className="text-2xl font-bold text-gray-900">{applications.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Under Review</p>
                <p className="text-2xl font-bold text-gray-900">
                  {applications.filter(a => a.status === 'under_review').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-900">
                  {applications.filter(a => a.status === 'approved').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-gray-900">
                  {applications.filter(a => a.status === 'rejected').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { key: 'active', label: 'Active Applications', count: applications.filter(a => ['draft', 'submitted', 'under_review', 'offer_made'].includes(a.status)).length },
                { key: 'completed', label: 'Completed', count: applications.filter(a => ['approved', 'rejected'].includes(a.status)).length },
                { key: 'all', label: 'All Applications', count: applications.length }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Applications List */}
        {filteredApplications.length === 0 ? (
          <div className="text-center py-12">
            <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
            <p className="text-gray-600">Start your first mortgage application to get started!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredApplications.map((application) => (
              <div key={application.id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{application.lender.name}</h3>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(application.status)}
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                            {application.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">Application #{application.applicationNumber}</p>
                      {application.property && (
                        <p className="text-sm text-gray-600 mt-1">{application.property.address}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600">{formatPrice(application.loanAmount)}</p>
                      <p className="text-sm text-gray-600">{application.loanToValue}% LTV</p>
                    </div>
                  </div>

                  {/* Application Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Loan Details</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Property Value:</span>
                          <span>{formatPrice(application.propertyValue)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Term:</span>
                          <span>{application.term} years</span>
                        </div>
                        {application.interestRate && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Interest Rate:</span>
                            <span>{application.interestRate}%</span>
                          </div>
                        )}
                        {application.monthlyPayment && (
                          <div className="flex justify-between font-medium">
                            <span className="text-gray-600">Monthly Payment:</span>
                            <span>{formatPrice(application.monthlyPayment)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Timeline</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Applied:</span>
                          <span>{new Date(application.applicationDate).toLocaleDateString()}</span>
                        </div>
                        {application.decisionDate && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Decision:</span>
                            <span>{new Date(application.decisionDate).toLocaleDateString()}</span>
                          </div>
                        )}
                        {application.offerExpiryDate && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Offer Expires:</span>
                            <span>{new Date(application.offerExpiryDate).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Contact</h4>
                      <div className="space-y-2 text-sm">
                        {application.lender.contactPerson && (
                          <div>
                            <span className="text-gray-600">Contact:</span>
                            <p>{application.lender.contactPerson}</p>
                          </div>
                        )}
                        {application.lender.phone && (
                          <div>
                            <span className="text-gray-600">Phone:</span>
                            <p>{application.lender.phone}</p>
                          </div>
                        )}
                        {application.lender.email && (
                          <div>
                            <span className="text-gray-600">Email:</span>
                            <p>{application.lender.email}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Documents */}
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-3">Required Documents</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {application.documents.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <FileText className="h-4 w-4 text-gray-600" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                              {doc.uploadDate && (
                                <p className="text-xs text-gray-500">Uploaded {new Date(doc.uploadDate).toLocaleDateString()}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDocumentStatusColor(doc.status)}`}>
                              {doc.status.replace('_', ' ').toUpperCase()}
                            </span>
                            {doc.status === 'required' && (
                              <button className="p-1 text-blue-600 hover:text-blue-800">
                                <Upload className="h-4 w-4" />
                              </button>
                            )}
                            {doc.status === 'verified' && (
                              <button className="p-1 text-gray-600 hover:text-gray-800">
                                <Download className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Conditions */}
                  {application.conditions && application.conditions.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-medium text-gray-900 mb-3">Conditions</h4>
                      <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                        <ul className="text-sm text-blue-800 space-y-1">
                          {application.conditions.map((condition, index) => (
                            <li key={index}>• {condition}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {application.notes && (
                    <div className="mb-6">
                      <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">{application.notes}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center space-x-3 pt-4 border-t">
                    {application.status === 'draft' && (
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm">
                        Continue Application
                      </button>
                    )}
                    {application.status === 'offer_made' && (
                      <>
                        <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm">
                          Accept Offer
                        </button>
                        <button className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 text-sm">
                          Decline Offer
                        </button>
                      </>
                    )}
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      View Details
                    </button>
                    <button className="text-gray-600 hover:text-gray-800 text-sm font-medium flex items-center">
                      <Download className="h-4 w-4 mr-1" />
                      Download Documents
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MortgageApplications;