import * as React from 'react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Home,
  CreditCard,
  Wrench,
  FileText,
  MessageSquare,
  Calendar,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Clock,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Phone,
  Mail,
  MapPin,
  Banknote,
  Receipt,
  Bell,
  Settings,
  User,
  Shield,
  ExternalLink,
  BarChart3,
  TrendingUp,
  TrendingDown,
  PieChart,
  Zap,
  Calculator,
  Users,
  Heart,
  Star,
  Camera,
  FileImage,
  Percent,
  PoundSterling,
  Activity,
  Target,
  Award,
  Eye,
  X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { useAuthStore } from '../../stores/authStore';
import { showToast } from '../../components/ui/Toast';

interface TenantStats {
  currentRent: number;
  nextPaymentDue: string;
  leaseEndDate: string;
  maintenanceRequests: number;
  totalPaid: number;
  daysUntilLeaseEnd: number;
  daysUntilPayment: number;
  paymentHistory: number;
  avgMonthlyUtilities: number;
  onTimePayments: number;
  totalSavings: number;
  creditScore: number;
  renewalEligible: boolean;
  communityRating: number;
  energyEfficiency: string;
  monthlyBudget: number;
}

interface Property {
  id: string;
  title: string;
  address: string;
  type: 'house' | 'apartment' | 'studio';
  bedrooms: number;
  bathrooms: number;
  monthlyRent: number;
  leaseStart: string;
  leaseEnd: string;
  landlord: {
    name: string;
    email: string;
    phone: string;
  };
  agent?: {
    name: string;
    email: string;
    phone: string;
  };
  images: string[];
}

interface Payment {
  id: string;
  amount: number;
  date: string;
  status: 'paid' | 'pending' | 'overdue' | 'failed';
  type: 'rent' | 'deposit' | 'utilities' | 'other';
  description: string;
  paymentMethod: string;
  reference: string;
}

interface MaintenanceRequest {
  id: string;
  title: string;
  description: string;
  category: 'plumbing' | 'electrical' | 'heating' | 'general' | 'emergency';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'submitted' | 'acknowledged' | 'in_progress' | 'completed' | 'cancelled';
  submittedDate: string;
  completedDate?: string;
  estimatedCost?: number;
  actualCost?: number;
  assignedTo?: string;
  photos: string[];
}

interface Document {
  id: string;
  name: string;
  type: 'lease' | 'inventory' | 'certificate' | 'notice' | 'other';
  uploadDate: string;
  size: string;
  url: string;
}

interface UtilityBill {
  id: string;
  type: 'electricity' | 'gas' | 'water' | 'internet' | 'council_tax';
  provider: string;
  amount: number;
  dueDate: string;
  period: string;
  status: 'paid' | 'pending' | 'overdue';
  usage: number;
  unit: string;
  previousReading?: number;
  currentReading?: number;
}

interface LeaseRenewal {
  id: string;
  currentLeaseEnd: string;
  renewalDeadline: string;
  proposedRent: number;
  renewalTerms: string[];
  status: 'pending' | 'offered' | 'accepted' | 'declined';
  landlordNotes?: string;
}

interface CommunityPost {
  id: string;
  author: string;
  title: string;
  content: string;
  category: 'general' | 'maintenance' | 'events' | 'recommendations';
  date: string;
  likes: number;
  replies: number;
  isLiked: boolean;
}

interface Neighbor {
  id: string;
  name: string;
  apartment: string;
  rating: number;
  isVerified: boolean;
  lastSeen: string;
}

const TenantDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<TenantStats>({
    currentRent: 0,
    nextPaymentDue: '',
    leaseEndDate: '',
    maintenanceRequests: 0,
    totalPaid: 0,
    daysUntilLeaseEnd: 0,
    daysUntilPayment: 0,
    paymentHistory: 0,
    avgMonthlyUtilities: 0,
    onTimePayments: 0,
    totalSavings: 0,
    creditScore: 0,
    renewalEligible: false,
    communityRating: 0,
    energyEfficiency: '',
    monthlyBudget: 0
  });
  const [property, setProperty] = useState<Property | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [utilityBills, setUtilityBills] = useState<UtilityBill[]>([]);
  const [leaseRenewal, setLeaseRenewal] = useState<LeaseRenewal | null>(null);
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([]);
  const [neighbors, setNeighbors] = useState<Neighbor[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'payments' | 'maintenance' | 'documents' | 'property' | 'analytics' | 'utilities' | 'community'>('overview');
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedUtilityPeriod, setSelectedUtilityPeriod] = useState('current');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API calls
      const mockProperty: Property = {
        id: '1',
        title: 'Modern 2-Bed Apartment',
        address: '15 Oak Street, Manchester M1 2AB',
        type: 'apartment',
        bedrooms: 2,
        bathrooms: 1,
        monthlyRent: 1200,
        leaseStart: '2023-06-01',
        leaseEnd: '2024-05-31',
        landlord: {
          name: 'John Smith',
          email: 'john.smith@email.com',
          phone: '+44 7700 900789'
        },
        agent: {
          name: 'Emma Wilson',
          email: 'emma.wilson@propertyagents.com',
          phone: '+44 7700 900456'
        },
        images: ['https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20two%20bedroom%20apartment%20interior%20manchester%20uk%20contemporary%20design&image_size=landscape_4_3']
      };

      setProperty(mockProperty);

      const leaseEndDate = new Date(mockProperty.leaseEnd);
      const today = new Date();
      const daysUntilLeaseEnd = Math.ceil((leaseEndDate.getTime() - today.getTime()) / (1000 * 3600 * 24));

      setStats({
        currentRent: mockProperty.monthlyRent,
        nextPaymentDue: '2024-02-01',
        leaseEndDate: mockProperty.leaseEnd,
        maintenanceRequests: 2,
        totalPaid: 9600, // 8 months * 1200
        daysUntilLeaseEnd,
        paymentHistory: 8,
        avgMonthlyUtilities: 180,
        onTimePayments: 8,
        totalSavings: 240,
        creditScore: 742,
        renewalEligible: true,
        communityRating: 4.8,
        energyEfficiency: 'B',
        monthlyBudget: 1500
      });

      setPayments([
        {
          id: 'p1',
          amount: 1200,
          date: '2024-01-01',
          status: 'paid',
          type: 'rent',
          description: 'Monthly Rent - January 2024',
          paymentMethod: 'Bank Transfer',
          reference: 'REF001234'
        },
        {
          id: 'p2',
          amount: 1200,
          date: '2023-12-01',
          status: 'paid',
          type: 'rent',
          description: 'Monthly Rent - December 2023',
          paymentMethod: 'Bank Transfer',
          reference: 'REF001233'
        },
        {
          id: 'p3',
          amount: 1200,
          date: '2024-02-01',
          status: 'pending',
          type: 'rent',
          description: 'Monthly Rent - February 2024',
          paymentMethod: 'Bank Transfer',
          reference: 'REF001235'
        }
      ]);

      setMaintenanceRequests([
        {
          id: 'm1',
          title: 'Leaking Kitchen Tap',
          description: 'The kitchen tap has been dripping constantly for the past week. It\'s getting worse and wasting water.',
          category: 'plumbing',
          priority: 'medium',
          status: 'in_progress',
          submittedDate: '2024-01-20',
          assignedTo: 'John Smith Plumbing',
          photos: ['https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=leaking%20kitchen%20tap%20dripping%20water%20plumbing%20issue&image_size=square']
        },
        {
          id: 'm2',
          title: 'Broken Window Lock',
          description: 'The lock on the bedroom window is broken and won\'t secure properly.',
          category: 'general',
          priority: 'low',
          status: 'submitted',
          submittedDate: '2024-01-22',
          photos: []
        }
      ]);

      setDocuments([
        {
          id: 'd1',
          name: 'Tenancy Agreement',
          type: 'lease',
          uploadDate: '2023-05-15',
          size: '2.4 MB',
          url: '#'
        },
        {
          id: 'd2',
          name: 'Property Inventory',
          type: 'inventory',
          uploadDate: '2023-05-20',
          size: '1.8 MB',
          url: '#'
        },
        {
          id: 'd3',
          name: 'Gas Safety Certificate',
          type: 'certificate',
          uploadDate: '2023-05-25',
          size: '0.5 MB',
          url: '#'
        }
      ]);

      setUtilityBills([
        {
          id: 'u1',
          type: 'electricity',
          provider: 'British Gas',
          amount: 89.50,
          dueDate: '2024-02-15',
          period: 'January 2024',
          status: 'pending',
          usage: 450,
          unit: 'kWh',
          previousReading: 12450,
          currentReading: 12900
        },
        {
          id: 'u2',
          type: 'gas',
          provider: 'British Gas',
          amount: 67.20,
          dueDate: '2024-02-15',
          period: 'January 2024',
          status: 'pending',
          usage: 320,
          unit: 'kWh'
        },
        {
          id: 'u3',
          type: 'water',
          provider: 'United Utilities',
          amount: 45.80,
          dueDate: '2024-02-20',
          period: 'Q4 2023',
          status: 'paid',
          usage: 15,
          unit: 'm³'
        }
      ]);

      setLeaseRenewal({
        id: 'lr1',
        currentLeaseEnd: '2024-05-31',
        renewalDeadline: '2024-03-31',
        proposedRent: 1250,
        renewalTerms: ['12-month lease extension', '£50 monthly rent increase', 'Updated energy efficiency requirements'],
        status: 'offered',
        landlordNotes: 'We value you as a tenant and would like to offer a renewal with a modest increase to cover rising costs.'
      });

      setCommunityPosts([
        {
          id: 'cp1',
          author: 'Sarah M. (Apt 3B)',
          title: 'Building Wi-Fi Issues',
          content: 'Has anyone else been experiencing slow internet speeds lately? Wondering if it\'s a building-wide issue.',
          category: 'maintenance',
          date: '2024-01-25',
          likes: 5,
          replies: 3,
          isLiked: false
        },
        {
          id: 'cp2',
          author: 'Mike R. (Apt 1A)',
          title: 'Neighborhood Watch Meeting',
          content: 'Monthly neighborhood watch meeting this Saturday at 7 PM in the community room. All welcome!',
          category: 'events',
          date: '2024-01-24',
          likes: 12,
          replies: 8,
          isLiked: true
        }
      ]);

      setNeighbors([
        {
          id: 'n1',
          name: 'Sarah Mitchell',
          apartment: '3B',
          rating: 4.8,
          isVerified: true,
          lastSeen: '2024-01-25'
        },
        {
          id: 'n2',
          name: 'Mike Rodriguez',
          apartment: '1A',
          rating: 4.9,
          isVerified: true,
          lastSeen: '2024-01-24'
        }
      ]);
    } catch (error) {
      showToast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'overdue': return 'text-red-600 bg-red-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'submitted': return 'text-blue-600 bg-blue-100';
      case 'acknowledged': return 'text-purple-600 bg-purple-100';
      case 'in_progress': return 'text-orange-600 bg-orange-100';
      case 'completed': return 'text-green-600 bg-green-100';
      case 'cancelled': return 'text-gray-600 bg-gray-100';
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

  const handleSubmitMaintenance = () => {
    // Handle maintenance request submission
    showToast.success('Maintenance request submitted successfully');
    setShowMaintenanceModal(false);
  };

  const handleMakePayment = () => {
    // Handle payment processing
    showToast.success('Payment processed successfully');
    setShowPaymentModal(false);
  };

  const handleProcessPayment = () => {
    // Handle payment processing
    showToast.success('Payment processed successfully');
    setShowPaymentModal(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container-responsive component-spacing">
      {/* Header */}
      <div className="stack-lg">
        <h1 className="text-heading-1">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-body-lg text-gray-600">
          Manage your tenancy and stay updated with your property.
        </p>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid-responsive gap-md stack-lg">
        <Card>
          <CardContent className="card-compact">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Home className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-label text-gray-600">Current Rent</p>
                <p className="text-heading-3">£{stats.currentRent}</p>
                <p className="text-caption text-blue-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  per month
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="card-compact">
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${
                stats.daysUntilPayment <= 3 ? 'bg-red-100' : 'bg-green-100'
              }`}>
                <CreditCard className={`h-5 w-5 sm:h-6 sm:w-6 ${
                  stats.daysUntilPayment <= 3 ? 'text-red-600' : 'text-green-600'
                }`} />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-label text-gray-600">Next Payment</p>
                <p className="text-heading-4">{new Date(stats.nextPaymentDue).toLocaleDateString()}</p>
                <p className={`text-caption flex items-center ${
                  stats.daysUntilPayment <= 3 ? 'text-red-600' : 'text-green-600'
                }`}>
                  <Clock className="h-3 w-3 mr-1" />
                  {stats.daysUntilPayment <= 3 ? `Due in ${stats.daysUntilPayment} days` : 'On time'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="card-compact">
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${
                stats.daysUntilLeaseEnd <= 60 ? 'bg-orange-100' : 'bg-purple-100'
              }`}>
                <Calendar className={`h-5 w-5 sm:h-6 sm:w-6 ${
                  stats.daysUntilLeaseEnd <= 60 ? 'text-orange-600' : 'text-purple-600'
                }`} />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-label text-gray-600">Lease Ends</p>
                <p className="text-heading-4">{stats.daysUntilLeaseEnd}</p>
                <p className={`text-caption flex items-center ${
                  stats.daysUntilLeaseEnd <= 60 ? 'text-orange-600' : 'text-purple-600'
                }`}>
                  <Calendar className="h-3 w-3 mr-1" />
                  {stats.daysUntilLeaseEnd <= 60 ? 'Renewal needed' : 'days remaining'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="card-compact">
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${
                stats.maintenanceRequests > 0 ? 'bg-orange-100' : 'bg-green-100'
              }`}>
                <Wrench className={`h-5 w-5 sm:h-6 sm:w-6 ${
                  stats.maintenanceRequests > 0 ? 'text-orange-600' : 'text-green-600'
                }`} />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-label text-gray-600">Maintenance</p>
                <p className="text-heading-3">{stats.maintenanceRequests}</p>
                <p className={`text-caption flex items-center ${
                  stats.maintenanceRequests > 0 ? 'text-orange-600' : 'text-green-600'
                }`}>
                  <Activity className="h-3 w-3 mr-1" />
                  {stats.maintenanceRequests > 0 ? 'active requests' : 'all resolved'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="card-compact">
            <div className="flex items-center">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Banknote className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="ml-4">
                <p className="text-label text-gray-600">Total Paid</p>
                <p className="text-heading-3">£{stats.totalPaid.toLocaleString()}</p>
                <p className="text-caption text-indigo-600 flex items-center">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  this tenancy
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="card-compact">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Shield className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-label text-gray-600">Deposit</p>
                <p className="text-heading-3">£{stats.currentRent * 1.5}</p>
                <p className="text-caption text-yellow-600 flex items-center">
                  <Shield className="h-3 w-3 mr-1" />
                  protected
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Smart Notifications */}
      <div className="stack-md section-spacing">
        {/* Lease Renewal Notification */}
        {stats.daysUntilLeaseEnd <= 90 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="card-spacious">
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-heading-4 text-orange-900 stack-sm">
                    Lease Renewal Notice
                  </h3>
                  <p className="text-body text-orange-800 stack-md">
                    Your lease expires in {stats.daysUntilLeaseEnd} days. 
                    {stats.renewalEligible 
                      ? 'You are eligible for renewal. Contact your landlord to discuss renewal terms.' 
                      : 'Please contact your landlord to discuss your options.'}
                  </p>
                  <div className="flex gap-sm">
                    <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                      <Phone className="h-4 w-4 mr-2" />
                      Contact Landlord
                    </Button>
                    <Button size="sm" variant="outline" className="border-orange-300 text-orange-700">
                      <FileText className="h-4 w-4 mr-2" />
                      View Lease Terms
                    </Button>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-orange-600">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment Reminder */}
        {stats.daysUntilPayment <= 3 && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="card-spacious">
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-heading-4 text-red-900 stack-sm">
                    Payment Due Soon
                  </h3>
                  <p className="text-body text-red-800 stack-md">
                    Your rent payment of £{stats.currentRent.toLocaleString()} is due on {new Date(stats.nextPaymentDue).toLocaleDateString()} 
                    ({stats.daysUntilPayment} {stats.daysUntilPayment === 1 ? 'day' : 'days'} remaining).
                  </p>
                  <div className="flex gap-sm">
                    <Button 
                      size="sm" 
                      className="bg-red-600 hover:bg-red-700"
                      onClick={() => setShowPaymentModal(true)}
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Pay Now
                    </Button>
                    <Button size="sm" variant="outline" className="border-red-300 text-red-700">
                      <Calendar className="h-4 w-4 mr-2" />
                      Set Reminder
                    </Button>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-red-600">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Maintenance Alert */}
        {stats.maintenanceRequests > 0 && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="card-spacious">
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Wrench className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-heading-4 text-yellow-900 stack-sm">
                    Active Maintenance Requests
                  </h3>
                  <p className="text-body text-yellow-800 stack-md">
                    You have {stats.maintenanceRequests} active maintenance {stats.maintenanceRequests === 1 ? 'request' : 'requests'}. 
                    Track progress and communicate with your landlord.
                  </p>
                  <div className="flex gap-sm">
                    <Button 
                      size="sm" 
                      className="bg-yellow-600 hover:bg-yellow-700"
                      onClick={() => setActiveTab('maintenance')}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Requests
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="border-yellow-300 text-yellow-700"
                      onClick={() => setShowMaintenanceModal(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Report New Issue
                    </Button>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-yellow-600">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Enhanced KPI Cards */}
      <div className="grid-responsive gap-md section-spacing">
        <Card>
          <CardContent className="card-compact">
            <div className="flex items-center">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <Target className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-label text-gray-600">Credit Score</p>
                <p className="text-heading-3">{stats.creditScore}</p>
                <p className="text-caption text-emerald-600">Excellent</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="card-compact">
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${
                stats.renewalEligible ? 'bg-green-100' : 'bg-red-100'
              }`}>
                <Award className={`h-5 w-5 sm:h-6 sm:w-6 ${
                  stats.renewalEligible ? 'text-green-600' : 'text-red-600'
                }`} />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-label text-gray-600">Renewal Status</p>
                <p className="text-heading-4">
                  {stats.renewalEligible ? 'Eligible' : 'Not Eligible'}
                </p>
                <p className="text-caption text-gray-500">for lease renewal</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Star className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Community Rating</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.communityRating}</p>
                <p className="text-xs text-blue-600">★★★★★</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Energy Rating</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.energyEfficiency}</p>
                <p className="text-xs text-green-600">Very Efficient</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex flex-wrap gap-2 sm:gap-0 sm:space-x-4 lg:space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: Home },
            { id: 'payments', label: 'Payments', icon: CreditCard },
            { id: 'maintenance', label: 'Maintenance', icon: Wrench },
            { id: 'documents', label: 'Documents', icon: FileText },
            { id: 'property', label: 'Property Info', icon: MapPin },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'utilities', label: 'Utilities', icon: Zap },
            { id: 'community', label: 'Community', icon: Users }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center py-2 px-1 sm:px-2 border-b-2 font-medium text-xs sm:text-sm min-w-0 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => setShowPaymentModal(true)}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Make Rent Payment
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => setShowMaintenanceModal(true)}
                >
                  <Wrench className="h-4 w-4 mr-2" />
                  Report Maintenance Issue
                </Button>
                <Link to="/maintenance" className="w-full">
                  <Button className="w-full justify-start" variant="outline">
                    <Wrench className="h-4 w-4 mr-2" />
                    View All Maintenance
                    <ExternalLink className="h-3 w-3 ml-auto" />
                  </Button>
                </Link>
                <Link to="/communications" className="w-full">
                  <Button className="w-full justify-start" variant="outline">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Communications
                    <ExternalLink className="h-3 w-3 ml-auto" />
                  </Button>
                </Link>
                <Link to="/finances" className="w-full">
                  <Button className="w-full justify-start" variant="outline">
                    <Banknote className="h-4 w-4 mr-2" />
                    Financial Overview
                    <ExternalLink className="h-3 w-3 ml-auto" />
                  </Button>
                </Link>
                <Button className="w-full justify-start" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download Documents
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Payments */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {payments.slice(0, 3).map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">{payment.description}</h4>
                      <p className="text-sm text-gray-600">{new Date(payment.date).toLocaleDateString()}</p>
                      <p className="text-sm text-gray-500">{payment.paymentMethod}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">£{payment.amount}</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                        {payment.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Active Maintenance Requests */}
          <Card>
            <CardHeader>
              <CardTitle>Active Maintenance Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {maintenanceRequests.filter(r => r.status !== 'completed').map((request) => (
                  <div key={request.id} className="flex items-start space-x-4 p-3 border rounded-lg">
                    <div className={`p-2 rounded-lg ${
                      request.priority === 'urgent' ? 'bg-red-100' :
                      request.priority === 'high' ? 'bg-orange-100' :
                      request.priority === 'medium' ? 'bg-yellow-100' : 'bg-green-100'
                    }`}>
                      <Wrench className={`h-4 w-4 ${
                        request.priority === 'urgent' ? 'text-red-600' :
                        request.priority === 'high' ? 'text-orange-600' :
                        request.priority === 'medium' ? 'text-yellow-600' : 'text-green-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{request.title}</h4>
                      <p className="text-sm text-gray-600">{request.description}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                          {request.priority}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                          {request.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">{new Date(request.submittedDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Property Information */}
          <Card>
            <CardHeader>
              <CardTitle>Your Property</CardTitle>
            </CardHeader>
            <CardContent>
              {property && (
                <div className="space-y-4">
                  <img
                    src={property.images[0]}
                    alt={property.title}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900">{property.title}</h3>
                    <p className="text-gray-600 flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {property.address}
                    </p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                      <span>{property.bedrooms} bed</span>
                      <span>{property.bathrooms} bath</span>
                      <span className="capitalize">{property.type}</span>
                    </div>
                  </div>
                  <div className="border-t pt-4">
                    <h4 className="font-medium text-gray-900 mb-2">Contact Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Landlord:</span>
                        <span className="font-medium">{property.landlord.name}</span>
                      </div>
                      {property.agent && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Agent:</span>
                          <span className="font-medium">{property.agent.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'payments' && (
        <div>
          {/* Payments Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Input
                placeholder="Search payments..."
                leftIcon={<Search className="h-4 w-4" />}
                className="w-64"
              />
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
            <Button onClick={() => setShowPaymentModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Make Payment
            </Button>
          </div>

          {/* Payments List */}
          <div className="bg-white rounded-lg border">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Method
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reference
                    </th>
                    <th className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(payment.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{payment.description}</div>
                        <div className="text-sm text-gray-500 capitalize">{payment.type}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        £{payment.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {payment.paymentMethod}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {payment.reference}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'maintenance' && (
        <div>
          {/* Maintenance Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Input
                placeholder="Search maintenance requests..."
                leftIcon={<Search className="h-4 w-4" />}
                className="w-64"
              />
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
            <Button onClick={() => setShowMaintenanceModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Report Issue
            </Button>
          </div>

          {/* Maintenance Requests */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {maintenanceRequests.map((request) => (
              <Card key={request.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">{request.title}</h3>
                      <p className="text-sm text-gray-500 capitalize">{request.category}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                      {request.priority}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-4">{request.description}</p>
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                      {request.status.replace('_', ' ')}
                    </span>
                    <div className="text-sm text-gray-500">
                      Submitted: {new Date(request.submittedDate).toLocaleDateString()}
                    </div>
                  </div>
                  {request.assignedTo && (
                    <div className="text-sm text-gray-600 mb-4">
                      Assigned to: {request.assignedTo}
                    </div>
                  )}
                  {request.photos.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Photos:</p>
                      <div className="flex space-x-2">
                        {request.photos.map((photo, index) => (
                          <img
                            key={index}
                            src={photo}
                            alt={`Issue photo ${index + 1}`}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      {request.estimatedCost && (
                        <span>Estimated cost: £{request.estimatedCost}</span>
                      )}
                    </div>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'documents' && (
        <div>
          {/* Documents Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Input
                placeholder="Search documents..."
                leftIcon={<Search className="h-4 w-4" />}
                className="w-64"
              />
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
            <Button>
              <Upload className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          </div>

          {/* Documents Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((document) => (
              <Card key={document.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg mr-3">
                        <FileText className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{document.name}</h3>
                        <p className="text-sm text-gray-500 capitalize">{document.type}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 mb-4">
                    <p>Uploaded: {new Date(document.uploadDate).toLocaleDateString()}</p>
                    <p>Size: {document.size}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button variant="ghost" size="sm">
                      <FileText className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'property' && property && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Property Details */}
          <Card>
            <CardHeader>
              <CardTitle>Property Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <img
                  src={property.images[0]}
                  alt={property.title}
                  className="w-full h-48 object-cover rounded-lg"
                />
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{property.title}</h3>
                  <p className="text-gray-600 flex items-center mt-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    {property.address}
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-4 py-4 border-t border-b">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{property.bedrooms}</p>
                    <p className="text-sm text-gray-600">Bedrooms</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{property.bathrooms}</p>
                    <p className="text-sm text-gray-600">Bathrooms</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900 capitalize">{property.type}</p>
                    <p className="text-sm text-gray-600">Property Type</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Lease Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Monthly Rent:</span>
                      <span className="font-medium">£{property.monthlyRent.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Lease Start:</span>
                      <span className="font-medium">{new Date(property.leaseStart).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Lease End:</span>
                      <span className="font-medium">{new Date(property.leaseEnd).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Landlord */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Landlord</h4>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-gray-400 mr-3" />
                      <span className="text-gray-900">{property.landlord.name}</span>
                    </div>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 text-gray-400 mr-3" />
                      <span className="text-gray-900">{property.landlord.email}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 text-gray-400 mr-3" />
                      <span className="text-gray-900">{property.landlord.phone}</span>
                    </div>
                    <div className="flex space-x-2 mt-3">
                      <Button variant="outline" size="sm">
                        <Phone className="h-4 w-4 mr-2" />
                        Call
                      </Button>
                      <Button variant="outline" size="sm">
                        <Mail className="h-4 w-4 mr-2" />
                        Email
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Agent */}
                {property.agent && (
                  <div className="border-t pt-6">
                    <h4 className="font-medium text-gray-900 mb-3">Property Agent</h4>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-gray-400 mr-3" />
                        <span className="text-gray-900">{property.agent.name}</span>
                      </div>
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 text-gray-400 mr-3" />
                        <span className="text-gray-900">{property.agent.email}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 text-gray-400 mr-3" />
                        <span className="text-gray-900">{property.agent.phone}</span>
                      </div>
                      <div className="flex space-x-2 mt-3">
                        <Button variant="outline" size="sm">
                          <Phone className="h-4 w-4 mr-2" />
                          Call
                        </Button>
                        <Button variant="outline" size="sm">
                          <Mail className="h-4 w-4 mr-2" />
                          Email
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Emergency Contacts */}
                <div className="border-t pt-6">
                  <h4 className="font-medium text-gray-900 mb-3">Emergency Contacts</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Gas Emergency:</span>
                      <span className="font-medium">0800 111 999</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Electricity Emergency:</span>
                      <span className="font-medium">105</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Water Emergency:</span>
                      <span className="font-medium">0345 672 3723</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Maintenance Request Modal */}
      <Modal
        isOpen={showMaintenanceModal}
        onClose={() => setShowMaintenanceModal(false)}
        title="Report Maintenance Issue"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Issue Title
            </label>
            <Input placeholder="Brief description of the issue" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black">
              <option value="">Select category</option>
              <option value="plumbing">Plumbing</option>
              <option value="electrical">Electrical</option>
              <option value="heating">Heating</option>
              <option value="general">General</option>
              <option value="emergency">Emergency</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              rows={4}
              placeholder="Detailed description of the issue"
            />
          </div>
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setShowMaintenanceModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitMaintenance}>
              Submit Request
            </Button>
          </div>
        </div>
      </Modal>

      {/* Payment Modal */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title="Make Payment"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Type
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black">
              <option value="rent">Monthly Rent</option>
              <option value="utilities">Utilities</option>
              <option value="deposit">Deposit</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount
            </label>
            <Input placeholder="Enter amount" type="number" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Method
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black">
              <option value="bank_transfer">Bank Transfer</option>
              <option value="card">Credit/Debit Card</option>
              <option value="direct_debit">Direct Debit</option>
            </select>
          </div>
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setShowPaymentModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleProcessPayment}>
              Process Payment
            </Button>
          </div>
        </div>
      </Modal>

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Payment Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                  Payment Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">On-time Payments</span>
                    <span className="font-semibold text-green-600">
                      {stats.onTimePayments}/{stats.paymentHistory}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${(stats.onTimePayments / stats.paymentHistory) * 100}%` }}
                    ></div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {Math.round((stats.onTimePayments / stats.paymentHistory) * 100)}% success rate
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart className="h-5 w-5 mr-2 text-blue-600" />
                  Monthly Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rent</span>
                    <span className="font-semibold">£{stats.currentRent}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Utilities</span>
                    <span className="font-semibold">£{stats.avgMonthlyUtilities}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-medium">Total Monthly</span>
                    <span className="font-bold">£{stats.currentRent + stats.avgMonthlyUtilities}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Receipt className="h-5 w-5 mr-2 text-purple-600" />
                  Total Savings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    £{stats.totalSavings.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">
                    Saved through efficient payments
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment History Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Payment history chart would be displayed here</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Maintenance Analytics */}
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Request Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{maintenanceRequests.length}</div>
                  <div className="text-sm text-gray-600">Total Requests</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {maintenanceRequests.filter(r => r.status === 'completed').length}
                  </div>
                  <div className="text-sm text-gray-600">Completed</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">
                    {maintenanceRequests.filter(r => r.status === 'in_progress').length}
                  </div>
                  <div className="text-sm text-gray-600">In Progress</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Utilities Tab */}
      {activeTab === 'utilities' && (
        <div className="space-y-6">
          {/* Utilities Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Electricity</p>
                    <p className="text-2xl font-bold text-gray-900">£85</p>
                    <p className="text-sm text-green-600 flex items-center">
                      <TrendingDown className="h-4 w-4 mr-1" />
                      -5% from last month
                    </p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-full">
                    <Zap className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Gas</p>
                    <p className="text-2xl font-bold text-gray-900">£65</p>
                    <p className="text-sm text-red-600 flex items-center">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      +8% from last month
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Zap className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Water</p>
                    <p className="text-2xl font-bold text-gray-900">£30</p>
                    <p className="text-sm text-gray-600">Same as last month</p>
                  </div>
                  <div className="p-3 bg-cyan-100 rounded-full">
                    <Zap className="h-6 w-6 text-cyan-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total</p>
                    <p className="text-2xl font-bold text-gray-900">£{stats.avgMonthlyUtilities}</p>
                    <p className="text-sm text-green-600">Within budget</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Utility Bills */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Utility Bills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { type: 'Electricity', amount: 85, date: '2024-01-15', status: 'paid', provider: 'British Gas' },
                  { type: 'Gas', amount: 65, date: '2024-01-10', status: 'paid', provider: 'British Gas' },
                  { type: 'Water', amount: 30, date: '2024-01-05', status: 'pending', provider: 'Thames Water' },
                  { type: 'Internet', amount: 35, date: '2024-01-01', status: 'paid', provider: 'BT' }
                ].map((bill, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <Zap className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{bill.type}</h4>
                        <p className="text-sm text-gray-500">{bill.provider}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">£{bill.amount}</p>
                      <p className="text-sm text-gray-500">{new Date(bill.date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        bill.status === 'paid' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {bill.status}
                      </span>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Energy Saving Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2 text-green-600" />
                Energy Saving Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  'Turn off lights when leaving a room',
                  'Use energy-efficient LED bulbs',
                  'Unplug electronics when not in use',
                  'Set thermostat to 18-20°C in winter',
                  'Use cold water for washing clothes',
                  'Take shorter showers to save water'
                ].map((tip, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <span className="text-sm text-gray-700">{tip}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Community Tab */}
      {activeTab === 'community' && (
        <div className="space-y-6">
          {/* Community Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Community Rating</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.communityRating}/5</p>
                    <div className="flex items-center mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-4 w-4 ${
                          i < Math.floor(stats.communityRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`} />
                      ))}
                    </div>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-full">
                    <Star className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Neighbors</p>
                    <p className="text-2xl font-bold text-gray-900">{neighbors.length}</p>
                    <p className="text-sm text-green-600">Connected</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Community Posts</p>
                    <p className="text-2xl font-bold text-gray-900">{communityPosts.length}</p>
                    <p className="text-sm text-blue-600">This week</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <MessageSquare className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Community Posts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Community Forum</span>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  New Post
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {communityPosts.map((post) => (
                  <div key={post.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium text-gray-900">{post.author}</h4>
                            <span className="text-sm text-gray-500">{post.date}</span>
                          </div>
                          <h3 className="font-semibold text-gray-900 mt-1">{post.title}</h3>
                          <p className="text-gray-700 mt-2">{post.content}</p>
                          <div className="flex items-center space-x-4 mt-3">
                            <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-600">
                              <Heart className="h-4 w-4" />
                              <span className="text-sm">{post.likes}</span>
                            </button>
                            <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-600">
                              <MessageSquare className="h-4 w-4" />
                              <span className="text-sm">{post.replies}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        post.category === 'maintenance' ? 'bg-red-100 text-red-800' :
                        post.category === 'community' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {post.category}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Neighbors */}
          <Card>
            <CardHeader>
              <CardTitle>Your Neighbors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {neighbors.map((neighbor) => (
                  <div key={neighbor.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{neighbor.name}</h4>
                      <p className="text-sm text-gray-500">{neighbor.unit}</p>
                      <div className="flex items-center mt-1">
                        <div className={`w-2 h-2 rounded-full mr-2 ${
                          neighbor.status === 'online' ? 'bg-green-400' : 'bg-gray-400'
                        }`} />
                        <span className="text-xs text-gray-500">
                          {neighbor.status === 'online' ? 'Online' : 'Offline'}
                        </span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Building Amenities */}
          <Card>
            <CardHeader>
              <CardTitle>Building Amenities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: 'Gym', status: 'available', hours: '6 AM - 10 PM' },
                  { name: 'Laundry Room', status: 'busy', hours: '24/7' },
                  { name: 'Rooftop Terrace', status: 'available', hours: '8 AM - 8 PM' },
                  { name: 'Parking Garage', status: 'available', hours: '24/7' },
                  { name: 'Mail Room', status: 'available', hours: '9 AM - 6 PM' },
                  { name: 'Community Room', status: 'reserved', hours: '9 AM - 9 PM' }
                ].map((amenity, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{amenity.name}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        amenity.status === 'available' ? 'bg-green-100 text-green-800' :
                        amenity.status === 'busy' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {amenity.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{amenity.hours}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default TenantDashboard;