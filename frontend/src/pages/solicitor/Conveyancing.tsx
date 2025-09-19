import React, { useState, useEffect } from 'react';
import { Home, FileText, Clock, CheckCircle, AlertTriangle, User, Calendar, PoundSterling, Search, Filter, Plus, Eye, Edit, Download, MapPin, Phone, Mail } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

interface ConveyancingTransaction {
  id: string;
  transactionNumber: string;
  type: 'purchase' | 'sale' | 'simultaneous';
  status: 'instruction' | 'searches' | 'mortgage' | 'contract' | 'exchange' | 'completion' | 'post_completion';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  property: {
    address: string;
    propertyType: 'house' | 'flat' | 'bungalow' | 'commercial' | 'land';
    tenure: 'freehold' | 'leasehold' | 'commonhold';
    value: number;
    bedrooms?: number;
    bathrooms?: number;
    squareFootage?: number;
    councilTaxBand?: string;
    epcRating?: string;
  };
  client: {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    type: 'individual' | 'company';
    isFirstTimeBuyer?: boolean;
  };
  otherParty: {
    name?: string;
    solicitor?: {
      firm: string;
      contact: string;
      email: string;
      phone: string;
      reference: string;
    };
    estateAgent?: {
      company: string;
      contact: string;
      email: string;
      phone: string;
    };
  };
  mortgage?: {
    lender: string;
    amount: number;
    type: 'repayment' | 'interest_only' | 'part_and_part';
    term: number;
    rate: number;
    product: string;
    reference: string;
    valuer?: string;
    brokerReference?: string;
  };
  searches: {
    local: {
      status: 'not_ordered' | 'ordered' | 'received' | 'reviewed';
      orderedDate?: string;
      receivedDate?: string;
      cost: number;
      results?: {
        planning: string[];
        highways: string[];
        environmental: string[];
        other: string[];
      };
    };
    environmental: {
      status: 'not_ordered' | 'ordered' | 'received' | 'reviewed';
      orderedDate?: string;
      receivedDate?: string;
      cost: number;
      riskLevel?: 'low' | 'medium' | 'high';
    };
    water: {
      status: 'not_ordered' | 'ordered' | 'received' | 'reviewed';
      orderedDate?: string;
      receivedDate?: string;
      cost: number;
    };
    chancel: {
      status: 'not_required' | 'not_ordered' | 'ordered' | 'received' | 'reviewed';
      orderedDate?: string;
      receivedDate?: string;
      cost: number;
      riskLevel?: 'low' | 'medium' | 'high';
    };
  };
  timeline: {
    instructionDate: string;
    targetExchangeDate?: string;
    actualExchangeDate?: string;
    targetCompletionDate?: string;
    actualCompletionDate?: string;
    keyMilestones: {
      stage: string;
      description: string;
      targetDate?: string;
      actualDate?: string;
      status: 'pending' | 'in_progress' | 'completed' | 'delayed';
    }[];
  };
  contract: {
    received: boolean;
    receivedDate?: string;
    approved: boolean;
    approvedDate?: string;
    specialConditions: string[];
    fixtures: string[];
    chattels: string[];
    completionDate?: string;
    deposit: number;
    balanceRequired: number;
  };
  finances: {
    purchasePrice: number;
    deposit: number;
    mortgageAmount: number;
    stampDuty: number;
    legalFees: number;
    searchCosts: number;
    surveyFees: number;
    otherCosts: number;
    totalCosts: number;
  };
  documents: {
    id: string;
    name: string;
    category: 'contract' | 'search' | 'mortgage' | 'survey' | 'insurance' | 'identity' | 'other';
    status: 'required' | 'received' | 'reviewed' | 'approved' | 'sent';
    uploadDate?: string;
    reviewDate?: string;
    expiryDate?: string;
  }[];
  notes: string;
  lastActivity: string;
}

const Conveyancing: React.FC = () => {
  const { user } = useAuthStore();
  const [transactions, setTransactions] = useState<ConveyancingTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'client' | 'completion' | 'value'>('date');
  const [selectedTransaction, setSelectedTransaction] = useState<ConveyancingTransaction | null>(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'searches' | 'contract' | 'documents' | 'timeline'>('overview');

  useEffect(() => {
    loadConveyancingTransactions();
  }, []);

  const loadConveyancingTransactions = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API call
      const mockData: ConveyancingTransaction[] = [
        {
          id: '1',
          transactionNumber: 'CV-2024-001',
          type: 'purchase',
          status: 'searches',
          priority: 'high',
          property: {
            address: '123 Oak Avenue, Birmingham, B15 2TT',
            propertyType: 'house',
            tenure: 'freehold',
            value: 350000,
            bedrooms: 3,
            bathrooms: 2,
            squareFootage: 1200,
            councilTaxBand: 'D',
            epcRating: 'C'
          },
          client: {
            id: 'c1',
            name: 'John & Sarah Smith',
            email: 'john.smith@email.com',
            phone: '+44 7700 900123',
            address: '45 High Street, Birmingham, B1 1AA',
            type: 'individual',
            isFirstTimeBuyer: true
          },
          otherParty: {
            name: 'Michael & Emma Johnson',
            solicitor: {
              firm: 'Brown & Associates',
              contact: 'Michael Brown',
              email: 'mbrown@brownlaw.co.uk',
              phone: '+44 121 555 0123',
              reference: 'BA-2024-456'
            },
            estateAgent: {
              company: 'Prime Properties',
              contact: 'Lisa Johnson',
              email: 'lisa@primeproperties.co.uk',
              phone: '+44 121 555 0456'
            }
          },
          mortgage: {
            lender: 'Halifax',
            amount: 280000,
            type: 'repayment',
            term: 25,
            rate: 4.5,
            product: '5 Year Fixed Rate',
            reference: 'HAL-2024-001234',
            valuer: 'Connells Survey Services',
            brokerReference: 'BR-2024-789'
          },
          searches: {
            local: {
              status: 'received',
              orderedDate: '2024-01-15',
              receivedDate: '2024-01-22',
              cost: 250,
              results: {
                planning: ['No current applications', 'Conservation area'],
                highways: ['No proposed road schemes'],
                environmental: ['No contaminated land issues'],
                other: ['Flood risk: Low']
              }
            },
            environmental: {
              status: 'received',
              orderedDate: '2024-01-15',
              receivedDate: '2024-01-20',
              cost: 45,
              riskLevel: 'low'
            },
            water: {
              status: 'received',
              orderedDate: '2024-01-15',
              receivedDate: '2024-01-21',
              cost: 35
            },
            chancel: {
              status: 'not_required',
              cost: 0
            }
          },
          timeline: {
            instructionDate: '2024-01-10',
            targetExchangeDate: '2024-02-01',
            targetCompletionDate: '2024-02-15',
            keyMilestones: [
              {
                stage: 'instruction',
                description: 'Instructions received and ID verified',
                targetDate: '2024-01-10',
                actualDate: '2024-01-10',
                status: 'completed'
              },
              {
                stage: 'searches',
                description: 'Order and review property searches',
                targetDate: '2024-01-25',
                actualDate: '2024-01-22',
                status: 'completed'
              },
              {
                stage: 'mortgage',
                description: 'Mortgage offer received and reviewed',
                targetDate: '2024-01-28',
                status: 'in_progress'
              },
              {
                stage: 'contract',
                description: 'Contract approved and report sent',
                targetDate: '2024-01-30',
                status: 'pending'
              },
              {
                stage: 'exchange',
                description: 'Exchange of contracts',
                targetDate: '2024-02-01',
                status: 'pending'
              },
              {
                stage: 'completion',
                description: 'Complete transaction',
                targetDate: '2024-02-15',
                status: 'pending'
              }
            ]
          },
          contract: {
            received: true,
            receivedDate: '2024-01-16',
            approved: false,
            specialConditions: ['Subject to mortgage offer', 'Vacant possession'],
            fixtures: ['Fitted kitchen', 'Built-in wardrobes', 'Garden shed'],
            chattels: ['Washing machine', 'Dishwasher', 'Garden furniture'],
            completionDate: '2024-02-15',
            deposit: 35000,
            balanceRequired: 315000
          },
          finances: {
            purchasePrice: 350000,
            deposit: 70000,
            mortgageAmount: 280000,
            stampDuty: 7500,
            legalFees: 1200,
            searchCosts: 330,
            surveyFees: 600,
            otherCosts: 200,
            totalCosts: 9830
          },
          documents: [
            {
              id: 'd1',
              name: 'Draft Contract',
              category: 'contract',
              status: 'received',
              uploadDate: '2024-01-16'
            },
            {
              id: 'd2',
              name: 'Local Search Results',
              category: 'search',
              status: 'reviewed',
              uploadDate: '2024-01-22',
              reviewDate: '2024-01-23'
            },
            {
              id: 'd3',
              name: 'Mortgage Offer',
              category: 'mortgage',
              status: 'required'
            },
            {
              id: 'd4',
              name: 'Survey Report',
              category: 'survey',
              status: 'received',
              uploadDate: '2024-01-18'
            },
            {
              id: 'd5',
              name: 'Buildings Insurance',
              category: 'insurance',
              status: 'required',
              expiryDate: '2024-02-01'
            }
          ],
          notes: 'First-time buyers. Chain-free purchase. Client very keen to complete quickly. Mortgage application progressing well.',
          lastActivity: '2024-01-23'
        },
        {
          id: '2',
          transactionNumber: 'CV-2024-002',
          type: 'sale',
          status: 'contract',
          priority: 'medium',
          property: {
            address: '78 Garden Lane, Leeds, LS6 3QR',
            propertyType: 'house',
            tenure: 'freehold',
            value: 280000,
            bedrooms: 2,
            bathrooms: 1,
            squareFootage: 950,
            councilTaxBand: 'C',
            epcRating: 'D'
          },
          client: {
            id: 'c2',
            name: 'Emma Thompson',
            email: 'emma.thompson@email.com',
            phone: '+44 7700 900456',
            address: '78 Garden Lane, Leeds, LS6 3QR',
            type: 'individual'
          },
          otherParty: {
            name: 'David & Claire Wilson',
            solicitor: {
              firm: 'City Legal Services',
              contact: 'David Thompson',
              email: 'dthompson@citylegal.co.uk',
              phone: '+44 113 555 0123',
              reference: 'CLS-2024-789'
            },
            estateAgent: {
              company: 'Yorkshire Properties',
              contact: 'Mark Roberts',
              email: 'mark@yorkshireprops.co.uk',
              phone: '+44 113 555 0456'
            }
          },
          searches: {
            local: {
              status: 'not_required',
              cost: 0
            },
            environmental: {
              status: 'not_required',
              cost: 0
            },
            water: {
              status: 'not_required',
              cost: 0
            },
            chancel: {
              status: 'not_required',
              cost: 0
            }
          },
          timeline: {
            instructionDate: '2024-01-08',
            targetExchangeDate: '2024-02-05',
            targetCompletionDate: '2024-02-20',
            keyMilestones: [
              {
                stage: 'instruction',
                description: 'Instructions received and ID verified',
                targetDate: '2024-01-08',
                actualDate: '2024-01-08',
                status: 'completed'
              },
              {
                stage: 'contract',
                description: 'Contract pack prepared and sent',
                targetDate: '2024-01-15',
                actualDate: '2024-01-12',
                status: 'completed'
              },
              {
                stage: 'enquiries',
                description: 'Respond to buyer enquiries',
                targetDate: '2024-01-25',
                status: 'in_progress'
              },
              {
                stage: 'exchange',
                description: 'Exchange of contracts',
                targetDate: '2024-02-05',
                status: 'pending'
              },
              {
                stage: 'completion',
                description: 'Complete transaction',
                targetDate: '2024-02-20',
                status: 'pending'
              }
            ]
          },
          contract: {
            received: false,
            approved: true,
            approvedDate: '2024-01-12',
            specialConditions: ['Vacant possession on completion'],
            fixtures: ['Fitted kitchen', 'Bathroom suite', 'Central heating system'],
            chattels: [],
            completionDate: '2024-02-20',
            deposit: 28000,
            balanceRequired: 252000
          },
          finances: {
            purchasePrice: 280000,
            deposit: 0,
            mortgageAmount: 0,
            stampDuty: 0,
            legalFees: 800,
            searchCosts: 0,
            surveyFees: 0,
            otherCosts: 150,
            totalCosts: 950
          },
          documents: [
            {
              id: 'd6',
              name: 'Contract Pack',
              category: 'contract',
              status: 'sent',
              uploadDate: '2024-01-12'
            },
            {
              id: 'd7',
              name: 'Title Deeds',
              category: 'other',
              status: 'reviewed',
              uploadDate: '2024-01-10'
            },
            {
              id: 'd8',
              name: 'Energy Performance Certificate',
              category: 'other',
              status: 'approved',
              uploadDate: '2024-01-09'
            }
          ],
          notes: 'Sale transaction. No chain. Client relocating for work. Buyer has mortgage in principle.',
          lastActivity: '2024-01-20'
        },
        {
          id: '3',
          transactionNumber: 'CV-2024-003',
          type: 'simultaneous',
          status: 'exchange',
          priority: 'urgent',
          property: {
            address: '15 Victoria Street, Manchester, M1 4BT',
            propertyType: 'flat',
            tenure: 'leasehold',
            value: 195000,
            bedrooms: 1,
            bathrooms: 1,
            squareFootage: 650,
            councilTaxBand: 'B',
            epcRating: 'B'
          },
          client: {
            id: 'c3',
            name: 'Robert Chen',
            email: 'robert.chen@email.com',
            phone: '+44 7700 900789',
            address: '22 King Street, Manchester, M2 6AA',
            type: 'individual'
          },
          otherParty: {
            name: 'Investment Properties Ltd',
            solicitor: {
              firm: 'Commercial Law Partners',
              contact: 'Jennifer Walsh',
              email: 'jwalsh@clpartners.co.uk',
              phone: '+44 161 555 0123',
              reference: 'CLP-2024-321'
            },
            estateAgent: {
              company: 'City Centre Estates',
              contact: 'Paul Mitchell',
              email: 'paul@citycentreestates.co.uk',
              phone: '+44 161 555 0456'
            }
          },
          mortgage: {
            lender: 'Nationwide',
            amount: 156000,
            type: 'repayment',
            term: 30,
            rate: 4.2,
            product: '2 Year Fixed Rate',
            reference: 'NW-2024-005678'
          },
          searches: {
            local: {
              status: 'reviewed',
              orderedDate: '2024-01-05',
              receivedDate: '2024-01-12',
              cost: 250,
              results: {
                planning: ['City centre regeneration area'],
                highways: ['Proposed cycle lane improvements'],
                environmental: ['No issues identified'],
                other: ['Flood risk: Very low']
              }
            },
            environmental: {
              status: 'reviewed',
              orderedDate: '2024-01-05',
              receivedDate: '2024-01-10',
              cost: 45,
              riskLevel: 'low'
            },
            water: {
              status: 'reviewed',
              orderedDate: '2024-01-05',
              receivedDate: '2024-01-11',
              cost: 35
            },
            chancel: {
              status: 'not_required',
              cost: 0
            }
          },
          timeline: {
            instructionDate: '2024-01-02',
            targetExchangeDate: '2024-01-25',
            targetCompletionDate: '2024-01-25',
            keyMilestones: [
              {
                stage: 'instruction',
                description: 'Instructions received and ID verified',
                targetDate: '2024-01-02',
                actualDate: '2024-01-02',
                status: 'completed'
              },
              {
                stage: 'searches',
                description: 'Order and review property searches',
                targetDate: '2024-01-15',
                actualDate: '2024-01-12',
                status: 'completed'
              },
              {
                stage: 'mortgage',
                description: 'Mortgage offer received and reviewed',
                targetDate: '2024-01-18',
                actualDate: '2024-01-16',
                status: 'completed'
              },
              {
                stage: 'contract',
                description: 'Contract approved and report sent',
                targetDate: '2024-01-22',
                actualDate: '2024-01-20',
                status: 'completed'
              },
              {
                stage: 'exchange',
                description: 'Exchange of contracts',
                targetDate: '2024-01-25',
                status: 'in_progress'
              },
              {
                stage: 'completion',
                description: 'Complete transaction',
                targetDate: '2024-01-25',
                status: 'pending'
              }
            ]
          },
          contract: {
            received: true,
            receivedDate: '2024-01-08',
            approved: true,
            approvedDate: '2024-01-20',
            specialConditions: ['Simultaneous exchange and completion', 'Leasehold information pack provided'],
            fixtures: ['Fitted kitchen', 'Bathroom suite', 'Built-in storage'],
            chattels: ['White goods included'],
            completionDate: '2024-01-25',
            deposit: 19500,
            balanceRequired: 175500
          },
          finances: {
            purchasePrice: 195000,
            deposit: 39000,
            mortgageAmount: 156000,
            stampDuty: 0,
            legalFees: 950,
            searchCosts: 330,
            surveyFees: 400,
            otherCosts: 180,
            totalCosts: 1860
          },
          documents: [
            {
              id: 'd9',
              name: 'Approved Contract',
              category: 'contract',
              status: 'approved',
              uploadDate: '2024-01-08',
              reviewDate: '2024-01-20'
            },
            {
              id: 'd10',
              name: 'Mortgage Offer',
              category: 'mortgage',
              status: 'approved',
              uploadDate: '2024-01-16'
            },
            {
              id: 'd11',
              name: 'Leasehold Information Pack',
              category: 'other',
              status: 'reviewed',
              uploadDate: '2024-01-09'
            },
            {
              id: 'd12',
              name: 'Management Company Accounts',
              category: 'other',
              status: 'reviewed',
              uploadDate: '2024-01-10'
            }
          ],
          notes: 'Simultaneous exchange and completion. Leasehold flat with 95 years remaining. Service charge £180/month.',
          lastActivity: '2024-01-24'
        }
      ];
      setTransactions(mockData);
    } catch (error) {
      console.error('Error loading conveyancing transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredAndSortedTransactions = () => {
    let filtered = transactions;
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(t => 
        t.transactionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.property.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(t => t.status === statusFilter);
    }
    
    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(t => t.type === typeFilter);
    }
    
    // Apply priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(t => t.priority === priorityFilter);
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
          if (!a.timeline.targetCompletionDate) return 1;
          if (!b.timeline.targetCompletionDate) return -1;
          return new Date(a.timeline.targetCompletionDate).getTime() - new Date(b.timeline.targetCompletionDate).getTime();
        case 'value':
          return b.property.value - a.property.value;
        case 'date':
        default:
          return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime();
      }
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'instruction':
        return 'bg-blue-100 text-blue-800';
      case 'searches':
        return 'bg-yellow-100 text-yellow-800';
      case 'mortgage':
        return 'bg-purple-100 text-purple-800';
      case 'contract':
        return 'bg-orange-100 text-orange-800';
      case 'exchange':
        return 'bg-green-100 text-green-800';
      case 'completion':
        return 'bg-gray-100 text-gray-800';
      case 'post_completion':
        return 'bg-gray-100 text-gray-800';
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

  const getProgressPercentage = (transaction: ConveyancingTransaction) => {
    const completedMilestones = transaction.timeline.keyMilestones.filter(m => m.status === 'completed').length;
    return (completedMilestones / transaction.timeline.keyMilestones.length) * 100;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading conveyancing transactions...</p>
        </div>
      </div>
    );
  }

  const filteredTransactions = getFilteredAndSortedTransactions();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Conveyancing</h1>
              <p className="mt-2 text-gray-600">
                Manage property transactions and conveyancing processes
              </p>
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              New Transaction
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Home className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Transactions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {transactions.filter(t => !['completion', 'post_completion'].includes(t.status)).length}
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
                <p className="text-sm font-medium text-gray-600">Ready to Exchange</p>
                <p className="text-2xl font-bold text-gray-900">
                  {transactions.filter(t => t.status === 'exchange').length}
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
                <p className="text-sm font-medium text-gray-600">Awaiting Searches</p>
                <p className="text-2xl font-bold text-gray-900">
                  {transactions.filter(t => t.status === 'searches').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <PoundSterling className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatPrice(transactions.reduce((sum, t) => sum + t.property.value, 0))}
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
                  placeholder="Search transactions, clients, or addresses..."
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
                  <option value="instruction">Instruction</option>
                  <option value="searches">Searches</option>
                  <option value="mortgage">Mortgage</option>
                  <option value="contract">Contract</option>
                  <option value="exchange">Exchange</option>
                  <option value="completion">Completion</option>
                  <option value="post_completion">Post Completion</option>
                </select>
              </div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="purchase">Purchase</option>
                <option value="sale">Sale</option>
                <option value="simultaneous">Simultaneous</option>
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
                <option value="value">Property Value</option>
              </select>
            </div>
          </div>
        </div>

        {/* Transactions List */}
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12">
            <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
            <p className="text-gray-600">No transactions match your current filters.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTransactions.map((transaction) => (
              <div key={transaction.id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{transaction.transactionNumber}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                          {transaction.status.replace('_', ' ').toUpperCase()}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(transaction.priority)}`}>
                          {transaction.priority.toUpperCase()}
                        </span>
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                          {transaction.type.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <User className="h-4 w-4 mr-1" />
                        <span className="font-medium">{transaction.client.name}</span>
                        <span className="mx-2">•</span>
                        <span>{transaction.client.type}</span>
                        {transaction.client.isFirstTimeBuyer && (
                          <>
                            <span className="mx-2">•</span>
                            <span className="text-green-600 font-medium">First Time Buyer</span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center text-sm text-gray-600 mb-3">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>{transaction.property.address}</span>
                      </div>
                    </div>
                    <div className="text-right ml-6">
                      <div className="text-lg font-bold text-blue-600">{formatPrice(transaction.property.value)}</div>
                      <div className="text-sm text-gray-600">{transaction.property.propertyType}</div>
                      <div className="text-sm text-gray-600">{transaction.property.tenure}</div>
                      {transaction.property.bedrooms && (
                        <div className="text-sm text-gray-600">
                          {transaction.property.bedrooms} bed, {transaction.property.bathrooms} bath
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Transaction Progress</span>
                      {transaction.timeline.targetCompletionDate && (
                        <span className="text-sm text-gray-600">
                          Target: {new Date(transaction.timeline.targetCompletionDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${getProgressPercentage(transaction)}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {transaction.timeline.keyMilestones.filter(m => m.status === 'completed').length} of {transaction.timeline.keyMilestones.length} milestones completed
                    </div>
                  </div>

                  {/* Key Information */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                    {transaction.mortgage && (
                      <div>
                        <span className="text-gray-600">Mortgage:</span>
                        <p className="font-medium">{formatPrice(transaction.mortgage.amount)}</p>
                        <p className="text-xs text-gray-600">{transaction.mortgage.lender}</p>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-600">Legal Fees:</span>
                      <p className="font-medium">{formatPrice(transaction.finances.legalFees)}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Total Costs:</span>
                      <p className="font-medium">{formatPrice(transaction.finances.totalCosts)}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Last Activity:</span>
                      <p className="font-medium">{new Date(transaction.lastActivity).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {/* Other Party Information */}
                  {transaction.otherParty.solicitor && (
                    <div className="mb-4 p-3 bg-gray-50 rounded">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Other Party Solicitor</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                        <div>
                          <span className="text-gray-600">Firm:</span>
                          <p className="font-medium">{transaction.otherParty.solicitor.firm}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Contact:</span>
                          <p className="font-medium">{transaction.otherParty.solicitor.contact}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Reference:</span>
                          <p className="font-medium">{transaction.otherParty.solicitor.reference}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center space-x-3">
                      <button 
                        onClick={() => {
                          setSelectedTransaction(transaction);
                          setShowTransactionModal(true);
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
                    </div>
                    <div className="flex items-center space-x-3">
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        Schedule
                      </button>
                      <button className="text-gray-600 hover:text-gray-800 text-sm font-medium flex items-center">
                        <Download className="h-4 w-4 mr-1" />
                        Documents
                      </button>
                      {transaction.otherParty.solicitor && (
                        <button className="text-green-600 hover:text-green-800 text-sm font-medium flex items-center">
                          <Phone className="h-4 w-4 mr-1" />
                          Contact
                        </button>
                      )}
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

export default Conveyancing;