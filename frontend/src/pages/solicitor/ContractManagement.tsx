import React, { useState, useEffect } from 'react';
import { FileText, Search, Filter, Plus, Eye, Edit, Download, Upload, CheckCircle, Clock, AlertTriangle, User, Calendar, Pound, Send, Archive, Copy } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

interface Contract {
  id: string;
  contractNumber: string;
  title: string;
  type: 'sale_purchase' | 'lease' | 'mortgage' | 'development' | 'commercial' | 'other';
  status: 'draft' | 'review' | 'approved' | 'executed' | 'completed' | 'terminated';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  client: {
    id: string;
    name: string;
    email: string;
    phone: string;
    type: 'individual' | 'company';
  };
  property?: {
    address: string;
    propertyType: string;
    value: number;
  };
  parties: {
    role: 'buyer' | 'seller' | 'landlord' | 'tenant' | 'lender' | 'borrower' | 'developer' | 'other';
    name: string;
    email?: string;
    phone?: string;
    solicitor?: {
      firm: string;
      contact: string;
      email: string;
      reference: string;
    };
  }[];
  terms: {
    contractValue?: number;
    deposit?: number;
    completionDate?: string;
    keyTerms: string[];
    specialConditions: string[];
    warranties: string[];
    indemnities: string[];
  };
  timeline: {
    createdDate: string;
    draftCompletedDate?: string;
    reviewStartDate?: string;
    approvedDate?: string;
    executedDate?: string;
    completionDate?: string;
    keyMilestones: {
      stage: string;
      description: string;
      targetDate?: string;
      actualDate?: string;
      status: 'pending' | 'in_progress' | 'completed' | 'delayed';
      assignedTo?: string;
    }[];
  };
  documents: {
    id: string;
    name: string;
    category: 'contract' | 'amendment' | 'schedule' | 'exhibit' | 'correspondence' | 'other';
    version: string;
    status: 'draft' | 'final' | 'executed' | 'superseded';
    uploadDate: string;
    uploadedBy: string;
    size: number;
    format: string;
  }[];
  amendments: {
    id: string;
    amendmentNumber: string;
    description: string;
    reason: string;
    requestedBy: string;
    requestDate: string;
    approvedDate?: string;
    status: 'requested' | 'approved' | 'rejected' | 'implemented';
    changes: {
      section: string;
      oldText: string;
      newText: string;
    }[];
  }[];
  compliance: {
    regulatoryRequirements: string[];
    complianceChecks: {
      requirement: string;
      status: 'pending' | 'completed' | 'failed';
      checkedBy?: string;
      checkedDate?: string;
      notes?: string;
    }[];
    riskAssessment: {
      level: 'low' | 'medium' | 'high';
      factors: string[];
      mitigations: string[];
    };
  };
  billing: {
    feeStructure: 'fixed' | 'hourly' | 'percentage' | 'mixed';
    agreedFee?: number;
    hourlyRate?: number;
    timeRecorded: number;
    expenses: number;
    totalBilled: number;
    amountPaid: number;
    outstandingAmount: number;
  };
  notes: string;
  lastActivity: string;
  assignedSolicitor: string;
}

const ContractManagement: React.FC = () => {
  const { user } = useAuthStore();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'client' | 'completion' | 'value'>('date');
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [showContractModal, setShowContractModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'parties' | 'terms' | 'documents' | 'amendments' | 'compliance' | 'billing'>('overview');

  useEffect(() => {
    loadContracts();
  }, []);

  const loadContracts = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API call
      const mockData: Contract[] = [
        {
          id: '1',
          contractNumber: 'CON-2024-001',
          title: 'Sale and Purchase Agreement - 123 Oak Avenue',
          type: 'sale_purchase',
          status: 'review',
          priority: 'high',
          client: {
            id: 'c1',
            name: 'John & Sarah Smith',
            email: 'john.smith@email.com',
            phone: '+44 7700 900123',
            type: 'individual'
          },
          property: {
            address: '123 Oak Avenue, Birmingham, B15 2TT',
            propertyType: 'Residential House',
            value: 350000
          },
          parties: [
            {
              role: 'buyer',
              name: 'John & Sarah Smith',
              email: 'john.smith@email.com',
              phone: '+44 7700 900123'
            },
            {
              role: 'seller',
              name: 'Michael & Emma Johnson',
              email: 'michael.johnson@email.com',
              phone: '+44 7700 900456',
              solicitor: {
                firm: 'Brown & Associates',
                contact: 'Michael Brown',
                email: 'mbrown@brownlaw.co.uk',
                reference: 'BA-2024-456'
              }
            }
          ],
          terms: {
            contractValue: 350000,
            deposit: 35000,
            completionDate: '2024-02-15',
            keyTerms: [
              'Vacant possession on completion',
              'Subject to mortgage offer',
              'Standard conditions of sale apply',
              'Fixtures and fittings as per schedule'
            ],
            specialConditions: [
              'Buyer to arrange buildings insurance from exchange',
              'Seller to provide warranties for recent electrical work',
              'Completion to take place at seller\'s solicitor\'s office'
            ],
            warranties: [
              'Title guarantee',
              'Planning compliance',
              'Building regulations compliance',
              'No outstanding disputes'
            ],
            indemnities: [
              'Seller indemnifies buyer against pre-completion liabilities',
              'Mutual indemnity for breach of contract'
            ]
          },
          timeline: {
            createdDate: '2024-01-10',
            draftCompletedDate: '2024-01-12',
            reviewStartDate: '2024-01-15',
            keyMilestones: [
              {
                stage: 'draft',
                description: 'Initial contract draft prepared',
                targetDate: '2024-01-12',
                actualDate: '2024-01-12',
                status: 'completed',
                assignedTo: 'Sarah Wilson'
              },
              {
                stage: 'review',
                description: 'Client review and approval',
                targetDate: '2024-01-18',
                status: 'in_progress',
                assignedTo: 'Sarah Wilson'
              },
              {
                stage: 'negotiation',
                description: 'Terms negotiation with other party',
                targetDate: '2024-01-25',
                status: 'pending'
              },
              {
                stage: 'execution',
                description: 'Contract execution by all parties',
                targetDate: '2024-02-01',
                status: 'pending'
              }
            ]
          },
          documents: [
            {
              id: 'd1',
              name: 'Sale and Purchase Agreement v1.0',
              category: 'contract',
              version: '1.0',
              status: 'draft',
              uploadDate: '2024-01-12',
              uploadedBy: 'Sarah Wilson',
              size: 245760,
              format: 'PDF'
            },
            {
              id: 'd2',
              name: 'Property Information Form',
              category: 'schedule',
              version: '1.0',
              status: 'final',
              uploadDate: '2024-01-11',
              uploadedBy: 'Client',
              size: 156432,
              format: 'PDF'
            },
            {
              id: 'd3',
              name: 'Fixtures and Fittings List',
              category: 'schedule',
              version: '1.0',
              status: 'final',
              uploadDate: '2024-01-11',
              uploadedBy: 'Client',
              size: 89123,
              format: 'PDF'
            }
          ],
          amendments: [],
          compliance: {
            regulatoryRequirements: [
              'Money Laundering Regulations 2017',
              'Consumer Protection from Unfair Trading Regulations 2008',
              'Estate Agents Act 1979',
              'SRA Code of Conduct'
            ],
            complianceChecks: [
              {
                requirement: 'Client ID verification',
                status: 'completed',
                checkedBy: 'Sarah Wilson',
                checkedDate: '2024-01-10',
                notes: 'Passport and utility bill verified'
              },
              {
                requirement: 'Source of funds verification',
                status: 'completed',
                checkedBy: 'Sarah Wilson',
                checkedDate: '2024-01-10',
                notes: 'Bank statements and mortgage offer reviewed'
              },
              {
                requirement: 'Property title verification',
                status: 'pending',
                notes: 'Awaiting official copies from Land Registry'
              }
            ],
            riskAssessment: {
              level: 'low',
              factors: ['Standard residential transaction', 'Established clients', 'Clear title'],
              mitigations: ['Standard due diligence procedures', 'Regular client updates']
            }
          },
          billing: {
            feeStructure: 'fixed',
            agreedFee: 1200,
            timeRecorded: 8.5,
            expenses: 330,
            totalBilled: 1530,
            amountPaid: 500,
            outstandingAmount: 1030
          },
          notes: 'First-time buyers. Chain-free purchase. Client very keen to complete quickly.',
          lastActivity: '2024-01-15',
          assignedSolicitor: 'Sarah Wilson'
        },
        {
          id: '2',
          contractNumber: 'CON-2024-002',
          title: 'Commercial Lease Agreement - City Centre Office',
          type: 'lease',
          status: 'approved',
          priority: 'medium',
          client: {
            id: 'c2',
            name: 'TechStart Solutions Ltd',
            email: 'legal@techstart.co.uk',
            phone: '+44 161 555 0123',
            type: 'company'
          },
          property: {
            address: 'Unit 5, Business Park, Manchester, M1 4BT',
            propertyType: 'Commercial Office',
            value: 0
          },
          parties: [
            {
              role: 'tenant',
              name: 'TechStart Solutions Ltd',
              email: 'legal@techstart.co.uk',
              phone: '+44 161 555 0123'
            },
            {
              role: 'landlord',
              name: 'Manchester Property Investments Ltd',
              email: 'leasing@mpi.co.uk',
              phone: '+44 161 555 0456',
              solicitor: {
                firm: 'Commercial Law Partners',
                contact: 'Jennifer Walsh',
                email: 'jwalsh@clpartners.co.uk',
                reference: 'CLP-2024-321'
              }
            }
          ],
          terms: {
            keyTerms: [
              'Term: 5 years with 3-year break clause',
              'Rent: £25,000 per annum',
              'Service charge: £3,000 per annum',
              'Use: Office purposes only',
              'Rent reviews: Annual RPI increases'
            ],
            specialConditions: [
              'Tenant fit-out period: 6 weeks rent-free',
              'Landlord to provide CAT A fit-out',
              'Tenant responsible for business rates',
              'Assignment permitted with landlord consent'
            ],
            warranties: [
              'Landlord has good title',
              'Property complies with health and safety regulations',
              'No outstanding planning enforcement',
              'All necessary consents in place'
            ],
            indemnities: [
              'Tenant indemnifies landlord for breach of user covenant',
              'Mutual indemnity for pre-completion liabilities'
            ]
          },
          timeline: {
            createdDate: '2024-01-05',
            draftCompletedDate: '2024-01-08',
            reviewStartDate: '2024-01-10',
            approvedDate: '2024-01-18',
            keyMilestones: [
              {
                stage: 'draft',
                description: 'Initial lease draft prepared',
                targetDate: '2024-01-08',
                actualDate: '2024-01-08',
                status: 'completed',
                assignedTo: 'David Thompson'
              },
              {
                stage: 'review',
                description: 'Client review and approval',
                targetDate: '2024-01-15',
                actualDate: '2024-01-12',
                status: 'completed',
                assignedTo: 'David Thompson'
              },
              {
                stage: 'negotiation',
                description: 'Terms negotiation with landlord',
                targetDate: '2024-01-18',
                actualDate: '2024-01-16',
                status: 'completed'
              },
              {
                stage: 'execution',
                description: 'Lease execution by all parties',
                targetDate: '2024-01-25',
                status: 'in_progress'
              }
            ]
          },
          documents: [
            {
              id: 'd4',
              name: 'Commercial Lease Agreement v2.1',
              category: 'contract',
              version: '2.1',
              status: 'final',
              uploadDate: '2024-01-18',
              uploadedBy: 'David Thompson',
              size: 512000,
              format: 'PDF'
            },
            {
              id: 'd5',
              name: 'Property Plans and Specifications',
              category: 'schedule',
              version: '1.0',
              status: 'final',
              uploadDate: '2024-01-06',
              uploadedBy: 'Landlord',
              size: 1024000,
              format: 'PDF'
            },
            {
              id: 'd6',
              name: 'Service Charge Budget',
              category: 'schedule',
              version: '1.0',
              status: 'final',
              uploadDate: '2024-01-07',
              uploadedBy: 'Landlord',
              size: 234567,
              format: 'Excel'
            }
          ],
          amendments: [
            {
              id: 'a1',
              amendmentNumber: 'AMD-001',
              description: 'Rent-free period extension',
              reason: 'Client requested additional fit-out time',
              requestedBy: 'TechStart Solutions Ltd',
              requestDate: '2024-01-14',
              approvedDate: '2024-01-16',
              status: 'implemented',
              changes: [
                {
                  section: 'Clause 3.2 - Rent Commencement',
                  oldText: 'Rent shall commence 4 weeks after the lease commencement date',
                  newText: 'Rent shall commence 6 weeks after the lease commencement date'
                }
              ]
            }
          ],
          compliance: {
            regulatoryRequirements: [
              'Landlord and Tenant Act 1954',
              'Commercial Property Standard Enquiries',
              'Money Laundering Regulations 2017',
              'SRA Code of Conduct'
            ],
            complianceChecks: [
              {
                requirement: 'Company verification',
                status: 'completed',
                checkedBy: 'David Thompson',
                checkedDate: '2024-01-05',
                notes: 'Companies House records verified'
              },
              {
                requirement: 'Director ID verification',
                status: 'completed',
                checkedBy: 'David Thompson',
                checkedDate: '2024-01-05',
                notes: 'All directors identified and verified'
              },
              {
                requirement: 'Property title verification',
                status: 'completed',
                checkedBy: 'David Thompson',
                checkedDate: '2024-01-06',
                notes: 'Landlord title confirmed'
              }
            ],
            riskAssessment: {
              level: 'medium',
              factors: ['New company tenant', 'Commercial property', 'Long-term lease'],
              mitigations: ['Guarantor required', 'Rent deposit', 'Regular rent reviews']
            }
          },
          billing: {
            feeStructure: 'fixed',
            agreedFee: 2500,
            timeRecorded: 15.5,
            expenses: 150,
            totalBilled: 2650,
            amountPaid: 1000,
            outstandingAmount: 1650
          },
          notes: 'Growing tech company. Good references. Guarantor provided by directors.',
          lastActivity: '2024-01-18',
          assignedSolicitor: 'David Thompson'
        },
        {
          id: '3',
          contractNumber: 'CON-2024-003',
          title: 'Mortgage Deed - Halifax Building Society',
          type: 'mortgage',
          status: 'executed',
          priority: 'low',
          client: {
            id: 'c3',
            name: 'Robert Chen',
            email: 'robert.chen@email.com',
            phone: '+44 7700 900789',
            type: 'individual'
          },
          property: {
            address: '15 Victoria Street, Manchester, M1 4BT',
            propertyType: 'Residential Flat',
            value: 195000
          },
          parties: [
            {
              role: 'borrower',
              name: 'Robert Chen',
              email: 'robert.chen@email.com',
              phone: '+44 7700 900789'
            },
            {
              role: 'lender',
              name: 'Halifax Building Society',
              email: 'legal@halifax.co.uk',
              phone: '+44 345 720 3040'
            }
          ],
          terms: {
            contractValue: 156000,
            keyTerms: [
              'Loan amount: £156,000',
              'Term: 30 years',
              'Interest rate: 4.2% fixed for 2 years',
              'Monthly payment: £765.43',
              'Security: First legal charge over property'
            ],
            specialConditions: [
              'Buildings insurance required',
              'Life insurance recommended',
              'No further borrowing without consent',
              'Property to be borrower\'s main residence'
            ],
            warranties: [
              'Borrower has good title to property',
              'No prior charges or encumbrances',
              'Property value as stated in valuation',
              'Borrower financial information accurate'
            ],
            indemnities: [
              'Borrower indemnifies lender against all losses',
              'Guarantor indemnity if applicable'
            ]
          },
          timeline: {
            createdDate: '2024-01-02',
            draftCompletedDate: '2024-01-03',
            reviewStartDate: '2024-01-04',
            approvedDate: '2024-01-08',
            executedDate: '2024-01-15',
            keyMilestones: [
              {
                stage: 'draft',
                description: 'Mortgage deed prepared',
                targetDate: '2024-01-03',
                actualDate: '2024-01-03',
                status: 'completed',
                assignedTo: 'Emma Roberts'
              },
              {
                stage: 'review',
                description: 'Client review and explanation',
                targetDate: '2024-01-05',
                actualDate: '2024-01-04',
                status: 'completed',
                assignedTo: 'Emma Roberts'
              },
              {
                stage: 'execution',
                description: 'Deed execution and registration',
                targetDate: '2024-01-15',
                actualDate: '2024-01-15',
                status: 'completed'
              }
            ]
          },
          documents: [
            {
              id: 'd7',
              name: 'Mortgage Deed',
              category: 'contract',
              version: '1.0',
              status: 'executed',
              uploadDate: '2024-01-15',
              uploadedBy: 'Emma Roberts',
              size: 345678,
              format: 'PDF'
            },
            {
              id: 'd8',
              name: 'Mortgage Offer',
              category: 'other',
              version: '1.0',
              status: 'final',
              uploadDate: '2024-01-02',
              uploadedBy: 'Lender',
              size: 123456,
              format: 'PDF'
            }
          ],
          amendments: [],
          compliance: {
            regulatoryRequirements: [
              'Mortgage Conduct of Business Rules',
              'Consumer Credit Act 1974',
              'Financial Services and Markets Act 2000',
              'SRA Code of Conduct'
            ],
            complianceChecks: [
              {
                requirement: 'Borrower ID verification',
                status: 'completed',
                checkedBy: 'Emma Roberts',
                checkedDate: '2024-01-02',
                notes: 'Passport and driving licence verified'
              },
              {
                requirement: 'Income verification',
                status: 'completed',
                checkedBy: 'Emma Roberts',
                checkedDate: '2024-01-02',
                notes: 'Payslips and bank statements reviewed'
              },
              {
                requirement: 'Property valuation',
                status: 'completed',
                checkedBy: 'Lender',
                checkedDate: '2024-01-03',
                notes: 'Professional valuation obtained'
              }
            ],
            riskAssessment: {
              level: 'low',
              factors: ['Standard residential mortgage', 'Good credit history', 'Stable employment'],
              mitigations: ['Standard mortgage terms', 'Buildings insurance required']
            }
          },
          billing: {
            feeStructure: 'fixed',
            agreedFee: 600,
            timeRecorded: 4.0,
            expenses: 50,
            totalBilled: 650,
            amountPaid: 650,
            outstandingAmount: 0
          },
          notes: 'Standard residential mortgage. No complications. Completed on time.',
          lastActivity: '2024-01-15',
          assignedSolicitor: 'Emma Roberts'
        }
      ];
      setContracts(mockData);
    } catch (error) {
      console.error('Error loading contracts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredAndSortedContracts = () => {
    let filtered = contracts;
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(c => 
        c.contractNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.client.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(c => c.status === statusFilter);
    }
    
    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(c => c.type === typeFilter);
    }
    
    // Apply priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(c => c.priority === priorityFilter);
    }
    
    // Apply sort
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'client':
          return a.client.name.localeCompare(b.client.name);
        case 'priority':
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'completion':
          if (!a.terms.completionDate) return 1;
          if (!b.terms.completionDate) return -1;
          return new Date(a.terms.completionDate).getTime() - new Date(b.terms.completionDate).getTime();
        case 'value':
          return (b.terms.contractValue || 0) - (a.terms.contractValue || 0);
        case 'date':
        default:
          return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime();
      }
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'review':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'executed':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'terminated':
        return 'bg-red-100 text-red-800';
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading contracts...</p>
        </div>
      </div>
    );
  }

  const filteredContracts = getFilteredAndSortedContracts();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Contract Management</h1>
              <p className="mt-2 text-gray-600">
                Manage legal contracts, agreements, and documentation
              </p>
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              New Contract
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Contracts</p>
                <p className="text-2xl font-bold text-gray-900">
                  {contracts.filter(c => !['completed', 'terminated'].includes(c.status)).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold text-gray-900">
                  {contracts.filter(c => c.status === 'review').length}
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
                <p className="text-sm font-medium text-gray-600">Executed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {contracts.filter(c => c.status === 'executed').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Pound className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatPrice(contracts.reduce((sum, c) => sum + (c.terms.contractValue || 0), 0))}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search contracts, clients, or titles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-600" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="review">Review</option>
                  <option value="approved">Approved</option>
                  <option value="executed">Executed</option>
                  <option value="completed">Completed</option>
                  <option value="terminated">Terminated</option>
                </select>
              </div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="sale_purchase">Sale & Purchase</option>
                <option value="lease">Lease</option>
                <option value="mortgage">Mortgage</option>
                <option value="development">Development</option>
                <option value="commercial">Commercial</option>
                <option value="other">Other</option>
              </select>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="date">Last Activity</option>
                <option value="priority">Priority</option>
                <option value="client">Client Name</option>
                <option value="completion">Completion Date</option>
                <option value="value">Contract Value</option>
              </select>
            </div>
          </div>
        </div>

        {/* Contracts List */}
        {filteredContracts.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No contracts found</h3>
            <p className="text-gray-600">No contracts match your current filters.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredContracts.map((contract) => (
              <div key={contract.id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{contract.contractNumber}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(contract.status)}`}>
                          {contract.status.toUpperCase()}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(contract.priority)}`}>
                          {contract.priority.toUpperCase()}
                        </span>
                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
                          {contract.type.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <h4 className="text-md font-medium text-gray-800 mb-2">{contract.title}</h4>
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <User className="h-4 w-4 mr-1" />
                        <span className="font-medium">{contract.client.name}</span>
                        <span className="mx-2">•</span>
                        <span>{contract.client.type}</span>
                        <span className="mx-2">•</span>
                        <span>Assigned to: {contract.assignedSolicitor}</span>
                      </div>
                      {contract.property && (
                        <div className="text-sm text-gray-600 mb-3">
                          <span className="font-medium">Property:</span> {contract.property.address}
                        </div>
                      )}
                    </div>
                    <div className="text-right ml-6">
                      {contract.terms.contractValue && (
                        <div className="text-lg font-bold text-blue-600">{formatPrice(contract.terms.contractValue)}</div>
                      )}
                      {contract.terms.completionDate && (
                        <div className="text-sm text-gray-600">
                          Completion: {new Date(contract.terms.completionDate).toLocaleDateString()}
                        </div>
                      )}
                      <div className="text-sm text-gray-600 mt-1">
                        {contract.documents.length} document{contract.documents.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>

                  {/* Key Terms Preview */}
                  <div className="mb-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Key Terms</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {contract.terms.keyTerms.slice(0, 4).map((term, index) => (
                        <div key={index} className="text-sm text-gray-600 flex items-start">
                          <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                          <span>{term}</span>
                        </div>
                      ))}
                    </div>
                    {contract.terms.keyTerms.length > 4 && (
                      <div className="text-sm text-blue-600 mt-2">
                        +{contract.terms.keyTerms.length - 4} more terms
                      </div>
                    )}
                  </div>

                  {/* Billing Information */}
                  <div className="mb-4 p-3 bg-gray-50 rounded">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Billing Summary</h5>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Fee Structure:</span>
                        <p className="font-medium capitalize">{contract.billing.feeStructure}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Total Billed:</span>
                        <p className="font-medium">{formatPrice(contract.billing.totalBilled)}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Amount Paid:</span>
                        <p className="font-medium text-green-600">{formatPrice(contract.billing.amountPaid)}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Outstanding:</span>
                        <p className={`font-medium ${contract.billing.outstandingAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {formatPrice(contract.billing.outstandingAmount)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center space-x-3">
                      <button 
                        onClick={() => {
                          setSelectedContract(contract);
                          setShowContractModal(true);
                        }}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm flex items-center"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </button>
                      <button className="text-gray-600 hover:text-gray-800 text-sm font-medium flex items-center">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </button>
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center">
                        <Copy className="h-4 w-4 mr-1" />
                        Duplicate
                      </button>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button className="text-green-600 hover:text-green-800 text-sm font-medium flex items-center">
                        <Upload className="h-4 w-4 mr-1" />
                        Upload
                      </button>
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center">
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </button>
                      <button className="text-purple-600 hover:text-purple-800 text-sm font-medium flex items-center">
                        <Send className="h-4 w-4 mr-1" />
                        Send
                      </button>
                      <button className="text-gray-600 hover:text-gray-800 text-sm font-medium flex items-center">
                        <Archive className="h-4 w-4 mr-1" />
                        Archive
                      </button>
                    </div>
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

export default ContractManagement;