import React, { useState, useEffect } from 'react';
import {
  Home,
  Heart,
  Search,
  Calculator,
  TrendingUp,
  TrendingDown,
  MapPin,
  Calendar,
  Eye,
  Filter,
  Star,
  Bookmark,
  Phone,
  Mail,
  Camera,
  Video,
  Banknote,
  Percent,
  Clock,
  Building,
  Car,
  Wifi,
  Shield,
  CheckCircle,
  AlertCircle,
  Info,
  BarChart3,
  LineChart,
  PieChart,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Minus,
  User,
  Bell,
  Target,
  Award,
  Settings,
  Share2,
  Download,
  Upload,
  PiggyBank,
  Receipt,
  FileCheck,
  Circle,
  Plus,
  MessageSquare,
  FileText,
  X,
  XCircle,
  Send,
  PoundSterling,
  Activity,
  Zap,
  Lightbulb,
  Brain,
  Compass,
  Timer,
  Gauge,
  Trophy,
  Sparkles,
  Rocket,
  ChevronRight,
  ExternalLink,
  RefreshCw,
  Bookmark as BookmarkIcon
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { useAuthStore } from '../../stores/authStore';
import { showToast } from '../../components/ui/Toast';

interface BuyerStats {
  savedProperties: number;
  viewingsScheduled: number;
  offersSubmitted: number;
  averageViewingTime: number;
  budgetRange: {
    min: number;
    max: number;
  };
  searchCriteria: {
    location: string;
    propertyType: string;
    bedrooms: number;
  };
  totalSearches: number;
  favoriteAreas: string[];
  priceAlerts: number;
  marketUpdates: number;
  viewingSuccess: number;
  offerAcceptance: number;
}

interface Property {
  id: string;
  title: string;
  address: string;
  price: number;
  priceChange?: {
    amount: number;
    percentage: number;
    direction: 'up' | 'down' | 'same';
  };
  type: 'house' | 'apartment' | 'bungalow' | 'townhouse';
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  yearBuilt: number;
  listingDate: string;
  agent: {
    name: string;
    company: string;
    phone: string;
    email: string;
    rating: number;
  };
  features: string[];
  images: string[];
  virtualTour?: string;
  video?: string;
  energyRating: string;
  councilTax: string;
  tenure: 'freehold' | 'leasehold';
  chainFree: boolean;
  newBuild: boolean;
  parking: boolean;
  garden: boolean;
  balcony: boolean;
  furnished: 'furnished' | 'unfurnished' | 'part-furnished';
  availableFrom: string;
  viewingCount: number;
  lastViewed?: string;
  saved: boolean;
  notes?: string;
}

interface Offer {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyAddress: string;
  propertyImage: string;
  offerAmount: number;
  originalPrice: number;
  status: 'pending' | 'accepted' | 'rejected' | 'countered' | 'withdrawn' | 'expired';
  submissionDate: string;
  expiryDate: string;
  conditions: string[];
  timeline: string;
  escalationClause?: {
    enabled: boolean;
    maxAmount: number;
    increment: number;
  };
  documents: {
    id: string;
    name: string;
    type: string;
    uploadDate: string;
    status: 'pending' | 'approved' | 'rejected';
  }[];
  negotiationHistory: {
    id: string;
    type: 'offer' | 'counter' | 'acceptance' | 'rejection';
    amount: number;
    date: string;
    party: 'buyer' | 'seller' | 'agent';
    notes?: string;
  }[];
  communications: {
    id: string;
    sender: string;
    senderType: 'buyer' | 'seller' | 'agent' | 'solicitor';
    message: string;
    timestamp: string;
    attachments?: string[];
    read: boolean;
  }[];
  analytics: {
    viewsBeforeOffer: number;
    daysOnMarket: number;
    competitiveOffers: number;
    marketComparison: 'above' | 'at' | 'below';
  };
}

const BuyerDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'offers' | 'market' | 'mortgage'>('overview');
  const [offers, setOffers] = useState<Offer[]>([]);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Mock offers data
      const mockOffers: Offer[] = [
        {
          id: 'offer-1',
          propertyId: '1',
          propertyTitle: 'Modern 3-Bed Family Home',
          propertyAddress: '25 Maple Avenue, Manchester M20 4RT',
          propertyImage: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20three%20bedroom%20family%20house%20exterior%20manchester%20uk%20contemporary%20design&image_size=square',
          status: 'pending',
          offerAmount: 415000,
          originalPrice: 425000,
          submissionDate: '2024-02-01T10:00:00Z',
          expiryDate: '2024-02-08T17:00:00Z',
          conditions: ['Subject to survey', 'Subject to mortgage approval'],
          timeline: '30 days',
          escalationClause: {
            enabled: true,
            maxAmount: 420000,
            increment: 2500
          },
          documents: [
            { id: 'doc-1', name: 'Mortgage Agreement in Principle', type: 'pdf', uploadDate: '2024-02-01T09:30:00Z', status: 'approved' },
            { id: 'doc-2', name: 'Survey Report', type: 'pdf', uploadDate: '2024-02-01T14:00:00Z', status: 'pending' }
          ],
          negotiationHistory: [
            {
              id: 'neg-1',
              type: 'offer',
              amount: 415000,
              date: '2024-02-01T10:00:00Z',
              party: 'buyer',
              notes: 'Initial offer based on market analysis'
            }
          ],
          communications: [
            {
              id: 'comm-1',
              sender: 'Sarah Johnson',
              senderType: 'agent',
              message: 'Thank you for your offer. I will present it to the seller and get back to you within 24 hours.',
              timestamp: '2024-02-01T10:30:00Z',
              read: true
            }
          ],
          analytics: {
            viewsBeforeOffer: 5,
            daysOnMarket: 14,
            competitiveOffers: 2,
            marketComparison: 'at'
          }
        }
      ];
      setOffers(mockOffers);
    } catch (error) {
      showToast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
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
        <p className="text-body-lg">
          Track your property offers and manage your buying journey.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 stack-md">
        <nav className="-mb-px flex flex-wrap gap-sm lg:gap-lg">
          {[
            { id: 'overview', label: 'Overview', icon: Home },
            { id: 'offers', label: 'My Offers', icon: FileText },
            { id: 'market', label: 'Market Analysis', icon: TrendingUp },
            { id: 'mortgage', label: 'Mortgage Tools', icon: Calculator }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center py-2 px-1 sm:px-2 border-b-2 font-medium text-body-sm min-w-0 ${
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
        <div className="stack-lg section-spacing">
          {/* Enhanced KPI Cards */}
          <div className="grid-responsive gap-md">
            <Card>
              <CardContent className="card-compact">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-label">Saved Properties</p>
                    <p className="text-heading-3">12</p>
                    <p className="text-caption text-green-600 flex items-center mt-1">
                      <ArrowUp className="h-3 w-3 mr-1" />
                      +3 this week
                    </p>
                    <div className="mt-2 flex items-center text-caption text-gray-500">
                      <Sparkles className="h-3 w-3 mr-1" />
                      2 new matches today
                    </div>
                  </div>
                  <div className="p-2 sm:p-3 bg-red-100 rounded-full">
                    <Heart className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="card-compact">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-label">Active Search Alerts</p>
                    <p className="text-heading-3">8</p>
                    <p className="text-caption text-blue-600 flex items-center mt-1">
                      <Bell className="h-3 w-3 mr-1" />
                      5 matches today
                    </p>
                    <div className="mt-2 flex items-center text-caption text-gray-500">
                      <Zap className="h-3 w-3 mr-1" />
                      92% accuracy rate
                    </div>
                  </div>
                  <div className="p-2 sm:p-3 bg-blue-100 rounded-full">
                    <Bell className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="card-compact">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-label">Total Offers Made</p>
                    <p className="text-heading-3">7</p>
                    <p className="text-caption text-green-600 flex items-center mt-1">
                      <Trophy className="h-3 w-3 mr-1" />
                      71% success rate
                    </p>
                    <div className="mt-2 flex items-center text-caption text-gray-500">
                      <Target className="h-3 w-3 mr-1" />
                      Above market avg
                    </div>
                  </div>
                  <div className="p-2 sm:p-3 bg-yellow-100 rounded-full">
                    <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="card-compact">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-label">Viewing History</p>
                    <p className="text-heading-3">24</p>
                    <p className="text-caption text-purple-600 flex items-center mt-1">
                      <Star className="h-3 w-3 mr-1" />
                      4.2 avg rating
                    </p>
                    <div className="mt-2 flex items-center text-caption text-gray-500">
                      <Eye className="h-3 w-3 mr-1" />
                      29% conversion
                    </div>
                  </div>
                  <div className="p-2 sm:p-3 bg-purple-100 rounded-full">
                    <Eye className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional KPI Row */}
          <div className="grid-responsive gap-md section-spacing">
            <Card>
              <CardContent className="card-compact">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-label">Mortgage Pre-Approval</p>
                    <p className="text-heading-3 text-green-900">£450K</p>
                    <p className="text-caption text-green-600 flex items-center mt-1">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Approved
                    </p>
                    <div className="mt-2 flex items-center text-caption text-gray-500">
                      <Clock className="h-3 w-3 mr-1" />
                      Valid for 90 days
                    </div>
                  </div>
                  <div className="p-2 sm:p-3 bg-green-100 rounded-full">
                    <PiggyBank className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="card-compact">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-label">Search Duration</p>
                    <p className="text-heading-3">89</p>
                    <p className="text-caption text-blue-600 flex items-center mt-1">
                      <Timer className="h-3 w-3 mr-1" />
                      Days searching
                    </p>
                    <div className="mt-2 flex items-center text-caption text-gray-500">
                      <Gauge className="h-3 w-3 mr-1" />
                      Avg: 120 days
                    </div>
                  </div>
                  <div className="p-2 sm:p-3 bg-indigo-100 rounded-full">
                    <Timer className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="card-compact">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-label">Budget Utilization</p>
                    <p className="text-heading-3">92%</p>
                    <p className="text-caption text-orange-600 flex items-center mt-1">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      £415K of £450K
                    </p>
                    <div className="mt-2 flex items-center text-caption text-gray-500">
                      <PoundSterling className="h-3 w-3 mr-1" />
                      Optimal range
                    </div>
                  </div>
                  <div className="p-2 sm:p-3 bg-orange-100 rounded-full">
                    <PoundSterling className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="card-compact">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-label">Market Position</p>
                    <p className="text-heading-3">Strong</p>
                    <p className="text-caption text-green-600 flex items-center mt-1">
                      <Rocket className="h-3 w-3 mr-1" />
                      Top 15% buyer
                    </p>
                    <div className="mt-2 flex items-center text-caption text-gray-500">
                      <Brain className="h-3 w-3 mr-1" />
                      AI confidence: 94%
                    </div>
                  </div>
                  <div className="p-2 sm:p-3 bg-emerald-100 rounded-full">
                    <Rocket className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Home Buying Journey Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Award className="h-5 w-5 mr-2" />
                  Home Buying Journey Progress
                </div>
                <div className="text-body-sm text-gray-500">
                  Est. completion: 45 days
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="card-compact">
              <div className="stack-lg">
                {/* Enhanced Progress Steps */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-md">
                  {[
                    { 
                      step: 'Budget Set', 
                      completed: true, 
                      icon: PiggyBank, 
                      percentage: 100,
                      timeline: 'Completed',
                      description: 'Budget approved: £450K'
                    },
                    { 
                      step: 'Pre-Approval', 
                      completed: true, 
                      icon: FileCheck, 
                      percentage: 100,
                      timeline: 'Completed',
                      description: 'Mortgage pre-approved'
                    },
                    { 
                      step: 'Property Search', 
                      completed: true, 
                      icon: Search, 
                      percentage: 85,
                      timeline: 'Ongoing',
                      description: '24 properties viewed'
                    },
                    { 
                      step: 'Offer Submitted', 
                      completed: true, 
                      icon: FileText, 
                      percentage: 100,
                      timeline: 'Active',
                      description: '1 offer pending'
                    },
                    { 
                      step: 'Survey & Legal', 
                      completed: false, 
                      icon: Building, 
                      percentage: 0,
                      timeline: '2-3 weeks',
                      description: 'Awaiting offer acceptance'
                    },
                    { 
                      step: 'Exchange & Complete', 
                      completed: false, 
                      icon: CheckCircle, 
                      percentage: 0,
                      timeline: '4-6 weeks',
                      description: 'Final completion'
                    }
                  ].map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <div key={index} className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                          item.completed ? 'bg-green-100 text-green-600' : 
                          item.percentage > 0 ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
                        }`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <span className={`text-caption font-medium text-center mb-1 ${
                          item.completed ? 'text-green-600' : 
                          item.percentage > 0 ? 'text-blue-600' : 'text-gray-500'
                        }`}>
                          {item.step}
                        </span>
                        <div className="w-full bg-gray-200 rounded-full h-1 mb-1">
                          <div 
                            className={`h-1 rounded-full ${
                              item.completed ? 'bg-green-600' : 
                              item.percentage > 0 ? 'bg-blue-600' : 'bg-gray-300'
                            }`} 
                            style={{ width: `${item.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-caption text-gray-500 text-center">{item.timeline}</span>
                        <span className="text-caption text-gray-400 text-center mt-1">{item.description}</span>
                      </div>
                    );
                  })}
                </div>
                
                {/* Overall Progress */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-body-sm font-medium text-gray-700">Overall Progress</span>
                    <span className="text-body-sm font-bold text-green-600">67% Complete</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full" style={{ width: '67%' }}></div>
                  </div>
                  <div className="flex justify-between text-caption text-gray-500 mt-2">
                    <span>4 of 6 stages completed</span>
                    <span>Estimated completion: March 2024</span>
                  </div>
                </div>

                {/* Next Actions */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="text-heading-4 font-medium text-blue-900 mb-2 flex items-center">
                    <Lightbulb className="h-4 w-4 mr-2" />
                    Next Recommended Actions
                  </h4>
                  <div className="stack-sm">
                    <div className="flex items-center text-body-sm text-blue-800">
                      <ChevronRight className="h-3 w-3 mr-2" />
                      Follow up on pending offer for Modern 3-Bed Family Home
                    </div>
                    <div className="flex items-center text-body-sm text-blue-800">
                      <ChevronRight className="h-3 w-3 mr-2" />
                      Schedule survey for accepted offers
                    </div>
                    <div className="flex items-center text-body-sm text-blue-800">
                      <ChevronRight className="h-3 w-3 mr-2" />
                      Research solicitors in your area
                    </div>
                  </div>
                </div>

                {/* Achievements */}
                <div className="bg-yellow-50 rounded-lg p-4">
                  <h4 className="text-heading-4 font-medium text-yellow-900 mb-2 flex items-center">
                    <Trophy className="h-4 w-4 mr-2" />
                    Recent Achievements
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-sm">
                    <div className="flex items-center text-body-sm text-yellow-800">
                      <Star className="h-3 w-3 mr-2" />
                      First offer submitted
                    </div>
                    <div className="flex items-center text-body-sm text-yellow-800">
                      <Star className="h-3 w-3 mr-2" />
                      10+ properties viewed
                    </div>
                    <div className="flex items-center text-body-sm text-yellow-800">
                      <Star className="h-3 w-3 mr-2" />
                      Mortgage pre-approved
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity Timeline and Offer Status */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg section-spacing">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Activity className="h-5 w-5 mr-2" />
                    Activity Timeline
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Refresh
                    </Button>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      View All
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="card-compact">
                <div className="stack-md">
                  {/* Upcoming Events */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="text-heading-4 font-medium text-blue-900 mb-3 flex items-center">
                      <Timer className="h-4 w-4 mr-2" />
                      Upcoming Events
                    </h4>
                    <div className="stack-sm">
                      <div className="flex items-center justify-between text-body-sm">
                        <span className="text-blue-800">Property viewing - Victorian Terrace House</span>
                        <span className="text-blue-600 font-medium">Tomorrow 2:00 PM</span>
                      </div>
                      <div className="flex items-center justify-between text-body-sm">
                        <span className="text-blue-800">Mortgage advisor meeting</span>
                        <span className="text-blue-600 font-medium">Friday 10:00 AM</span>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Activity Feed */}
                  {[
                    {
                      type: 'offer',
                      title: 'Offer submitted for Modern 3-Bed Family Home',
                      description: 'Offer of £415,000 submitted • Status: Pending',
                      time: '2 hours ago',
                      icon: FileText,
                      color: 'blue',
                      priority: 'high',
                      category: 'Offers'
                    },
                    {
                      type: 'communication',
                      title: 'Agent responded to your inquiry',
                      description: 'Sarah Johnson • Re: Victorian Terrace House',
                      time: '4 hours ago',
                      icon: MessageSquare,
                      color: 'green',
                      priority: 'medium',
                      category: 'Communications'
                    },
                    {
                      type: 'viewing',
                      title: 'Property viewing scheduled',
                      description: 'Victorian Terrace House - Tomorrow 2:00 PM',
                      time: '1 day ago',
                      icon: Calendar,
                      color: 'purple',
                      priority: 'high',
                      category: 'Viewings'
                    },
                    {
                      type: 'saved',
                      title: 'Property saved to favorites',
                      description: 'Contemporary Apartment • Canary Wharf • £380,000',
                      time: '2 days ago',
                      icon: Heart,
                      color: 'red',
                      priority: 'low',
                      category: 'Saved Properties'
                    },
                    {
                      type: 'alert',
                      title: 'Market alert triggered',
                      description: '3 new properties match your criteria in Hampstead',
                      time: '2 days ago',
                      icon: Bell,
                      color: 'orange',
                      priority: 'medium',
                      category: 'Market Alerts'
                    },
                    {
                      type: 'milestone',
                      title: 'Achievement unlocked: First Offer Submitted!',
                      description: 'Congratulations on submitting your first offer!',
                      time: '4 days ago',
                      icon: Trophy,
                      color: 'yellow',
                      priority: 'medium',
                      category: 'Milestones'
                    },
                    {
                      type: 'counter',
                      title: 'Counter offer received',
                      description: 'Seller countered with £425,000 • Original: £415,000',
                      time: '5 days ago',
                      icon: ArrowUpDown,
                      color: 'orange',
                      priority: 'high',
                      category: 'Offers'
                    }
                  ].map((activity, index) => {
                    const Icon = activity.icon;
                    const colorClasses = {
                      blue: 'bg-blue-100 text-blue-600 border-blue-200',
                      green: 'bg-green-100 text-green-600 border-green-200',
                      red: 'bg-red-100 text-red-600 border-red-200',
                      purple: 'bg-purple-100 text-purple-600 border-purple-200',
                      orange: 'bg-orange-100 text-orange-600 border-orange-200',
                      yellow: 'bg-yellow-100 text-yellow-600 border-yellow-200'
                    };
                    
                    return (
                      <div key={index} className={`flex items-start gap-sm card-compact rounded-lg border-l-4 ${
                        activity.priority === 'high' ? 'bg-gray-50' : 'hover:bg-gray-50'
                      } transition-colors ${colorClasses[activity.color]}`}>
                        <div className={`p-2 rounded-full ${
                          colorClasses[activity.color].replace('border-', 'bg-').replace('-200', '-50')
                        }`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-sm">
                                <h4 className="text-body-sm font-medium text-gray-900">{activity.title}</h4>
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-caption font-medium bg-gray-100 text-gray-600">
                                  {activity.category}
                                </span>
                              </div>
                              <p className="text-body-sm text-gray-600 mt-1">{activity.description}</p>
                            </div>
                            <div className="flex items-center gap-sm ml-4">
                              {activity.priority === 'high' && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-caption font-medium bg-red-100 text-red-800">
                                  High Priority
                                </span>
                              )}
                              <span className="text-caption text-gray-500 whitespace-nowrap">{activity.time}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Load More */}
                  <div className="text-center pt-4">
                    <Button variant="outline" size="sm">
                      Load More Activities
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Market Insights Dashboard */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Market Insights & Recommendations
                  </div>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Full Report
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="card-compact">
                <div className="stack-lg">
                  {/* Personalized Recommendations */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg card-compact">
                    <h4 className="text-heading-4 font-medium text-blue-900 stack-sm flex items-center">
                      <Brain className="h-4 w-4 mr-2" />
                      AI-Powered Recommendations
                    </h4>
                    <div className="stack-sm">
                      <div className="flex items-start gap-sm">
                        <div className="p-1 bg-blue-100 rounded-full">
                          <Sparkles className="h-3 w-3 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-body-sm text-blue-800 font-medium">Perfect Match Found!</p>
                          <p className="text-caption text-blue-700">3-bed Victorian house in Hampstead matches 95% of your criteria</p>
                        </div>
                        <Button size="sm" variant="outline" className="text-blue-600 border-blue-200">
                          View
                        </Button>
                      </div>
                      <div className="flex items-start gap-sm">
                        <div className="p-1 bg-green-100 rounded-full">
                          <TrendingDown className="h-3 w-3 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-body-sm text-green-800 font-medium">Price Drop Alert</p>
                          <p className="text-caption text-green-700">Property in Camden reduced by £15,000 - now £385,000</p>
                        </div>
                        <Button size="sm" variant="outline" className="text-green-600 border-green-200">
                          View
                        </Button>
                      </div>
                      <div className="flex items-start gap-sm">
                        <div className="p-1 bg-orange-100 rounded-full">
                          <Lightbulb className="h-3 w-3 text-orange-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-body-sm text-orange-800 font-medium">Expand Search Area</p>
                          <p className="text-caption text-orange-700">Consider Islington for 20% more options within budget</p>
                        </div>
                        <Button size="sm" variant="outline" className="text-orange-600 border-orange-200">
                          Explore
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Market Trends */}
                  <div className="grid-responsive gap-md">
                    <div className="bg-white border rounded-lg card-compact">
                      <h4 className="text-heading-4 font-medium text-gray-900 stack-sm flex items-center">
                        <TrendingUp className="h-4 w-4 mr-2 text-green-600" />
                        Price Trends - Your Areas
                      </h4>
                      <div className="stack-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-body-sm text-gray-600">Hampstead</span>
                          <div className="flex items-center gap-sm">
                            <span className="text-body-sm font-medium text-green-600">+2.3%</span>
                            <ArrowUp className="h-3 w-3 text-green-600" />
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-body-sm text-gray-600">Camden</span>
                          <div className="flex items-center gap-sm">
                            <span className="text-body-sm font-medium text-red-600">-1.2%</span>
                            <ArrowDown className="h-3 w-3 text-red-600" />
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-body-sm text-gray-600">Islington</span>
                          <div className="flex items-center gap-sm">
                            <span className="text-body-sm font-medium text-green-600">+0.8%</span>
                            <ArrowUp className="h-3 w-3 text-green-600" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white border rounded-lg card-compact">
                      <h4 className="text-heading-4 font-medium text-gray-900 stack-sm flex items-center">
                        <Users className="h-4 w-4 mr-2 text-blue-600" />
                        Market Competition
                      </h4>
                      <div className="stack-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-body-sm text-gray-600">Avg. Days on Market</span>
                          <span className="text-body-sm font-medium">28 days</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-body-sm text-gray-600">Competition Level</span>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-caption font-medium bg-orange-100 text-orange-800">
                            High
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-body-sm text-gray-600">Success Rate</span>
                          <span className="text-body-sm font-medium text-green-600">73%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Seasonal Insights */}
                  <div className="bg-yellow-50 rounded-lg card-compact">
                    <h4 className="text-heading-4 font-medium text-yellow-900 stack-sm flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      Seasonal Buying Advice
                    </h4>
                    <p className="text-body-sm text-yellow-800">
                      <strong>Spring Market:</strong> Inventory is increasing by 15% this month. 
                      Consider viewing properties quickly as competition heats up. 
                      Best viewing times: Weekday mornings for less competition.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Offer Status Overview</CardTitle>
              </CardHeader>
              <CardContent className="card-compact">
                <div className="grid grid-cols-2 gap-md section-spacing">
                  <div className="text-center card-compact bg-yellow-50 rounded-lg">
                    <div className="text-heading-2 font-bold text-yellow-600">
                      {offers.filter(o => o.status === 'pending').length}
                    </div>
                    <div className="text-body-sm text-yellow-700">Pending</div>
                  </div>
                  <div className="text-center card-compact bg-green-50 rounded-lg">
                    <div className="text-heading-2 font-bold text-green-600">
                      {offers.filter(o => o.status === 'accepted').length}
                    </div>
                    <div className="text-body-sm text-green-700">Accepted</div>
                  </div>
                  <div className="text-center card-compact bg-red-50 rounded-lg">
                    <div className="text-heading-2 font-bold text-red-600">
                      {offers.filter(o => o.status === 'rejected').length}
                    </div>
                    <div className="text-body-sm text-red-700">Rejected</div>
                  </div>
                  <div className="text-center card-compact bg-blue-50 rounded-lg">
                    <div className="text-heading-2 font-bold text-blue-600">
                      {offers.filter(o => o.status === 'countered').length}
                    </div>
                    <div className="text-body-sm text-blue-700">Countered</div>
                  </div>
                </div>
                
                {/* Recent Offers */}
                <div className="stack-sm">
                  <h4 className="text-heading-4 font-medium text-gray-900">Recent Offers</h4>
                  {offers.slice(0, 3).map((offer) => (
                    <div key={offer.id} className="flex items-center gap-sm card-compact border rounded-lg hover:bg-gray-50">
                      <img
                        src={offer.propertyImage}
                        alt={offer.propertyTitle}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-body-sm">{offer.propertyTitle}</h4>
                        <p className="text-caption text-gray-600">£{offer.offerAmount.toLocaleString()}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-caption font-medium ${
                        offer.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        offer.status === 'accepted' ? 'bg-green-100 text-green-800' :
                        offer.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {offer.status}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="section-spacing">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="card-compact">
              <div className="grid-responsive gap-md">
                <Button className="flex items-center justify-center card-compact h-auto flex-col stack-xs">
                  <Search className="h-6 w-6" />
                  <span className="text-body-sm">Search Properties</span>
                </Button>
                <Button variant="outline" className="flex items-center justify-center card-compact h-auto flex-col stack-xs">
                  <Calculator className="h-6 w-6" />
                  <span className="text-body-sm">Mortgage Calculator</span>
                </Button>
                <Button variant="outline" className="flex items-center justify-center card-compact h-auto flex-col stack-xs">
                  <Calendar className="h-6 w-6" />
                  <span className="text-body-sm">Schedule Viewing</span>
                </Button>
                <Button variant="outline" className="flex items-center justify-center card-compact h-auto flex-col stack-xs">
                  <Bell className="h-6 w-6" />
                  <span className="text-body-sm">Set Price Alert</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Performance Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg section-spacing">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Gauge className="h-5 w-5 mr-2" />
                  Search Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="card-compact">
                <div className="stack-md">
                  <div className="flex items-center justify-between">
                    <span className="text-body-sm text-gray-600">Search Efficiency</span>
                    <div className="flex items-center gap-sm">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{width: '78%'}}></div>
                      </div>
                      <span className="text-body-sm font-medium">78%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-body-sm text-gray-600">Viewing Conversion</span>
                    <div className="flex items-center gap-sm">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{width: '65%'}}></div>
                      </div>
                      <span className="text-body-sm font-medium">65%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-body-sm text-gray-600">Offer Success Rate</span>
                    <div className="flex items-center gap-sm">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-500 h-2 rounded-full" style={{width: '42%'}}></div>
                      </div>
                      <span className="text-body-sm font-medium">42%</span>
                    </div>
                  </div>
                  <div className="pt-3 border-t">
                    <div className="grid grid-cols-2 gap-md text-center">
                      <div>
                        <div className="text-heading-3 font-bold text-gray-900">156</div>
                        <div className="text-caption text-gray-600">Properties Viewed</div>
                      </div>
                      <div>
                        <div className="text-heading-3 font-bold text-gray-900">23</div>
                        <div className="text-caption text-gray-600">Offers Made</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Timer className="h-5 w-5 mr-2" />
                  Time Analytics
                </CardTitle>
              </CardHeader>
              <CardContent className="card-compact">
                <div className="stack-md">
                  <div className="grid grid-cols-2 gap-md">
                    <div className="text-center card-compact bg-blue-50 rounded-lg">
                      <div className="text-heading-2 font-bold text-blue-600">47</div>
                      <div className="text-body-sm text-gray-600">Days Searching</div>
                    </div>
                    <div className="text-center card-compact bg-green-50 rounded-lg">
                      <div className="text-heading-2 font-bold text-green-600">12</div>
                      <div className="text-body-sm text-gray-600">Hours This Week</div>
                    </div>
                  </div>
                  <div className="stack-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-body-sm text-gray-600">Peak Activity</span>
                      <span className="text-body-sm font-medium">Weekends 2-5 PM</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-body-sm text-gray-600">Avg. Session</span>
                      <span className="text-body-sm font-medium">28 minutes</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-body-sm text-gray-600">Response Time</span>
                      <span className="text-body-sm font-medium">4.2 hours</span>
                    </div>
                  </div>
                  <div className="pt-3 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-body-sm text-gray-600">Engagement Score</span>
                      <div className="flex items-center gap-sm">
                        <Trophy className="h-4 w-4 text-yellow-500" />
                        <span className="text-body-sm font-bold text-yellow-600">8.7/10</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Smart Recommendations */}
          <Card className="section-spacing">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Brain className="h-5 w-5 mr-2" />
                  AI-Powered Recommendations
                </div>
                <Button variant="ghost" size="sm">
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Refresh
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="card-compact">
              <div className="grid-responsive gap-md">
                <div className="card-compact border border-blue-200 bg-blue-50 rounded-lg">
                  <div className="flex items-start gap-sm">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <Lightbulb className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-heading-4 font-medium text-blue-900">Expand Search Area</h4>
                      <p className="text-body-sm text-blue-700 mt-1">
                        Consider properties in Islington for 15% more options within your budget.
                      </p>
                      <Button variant="outline" size="sm" className="mt-2 text-blue-600 border-blue-300">
                        View Suggestions
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="card-compact border border-green-200 bg-green-50 rounded-lg">
                  <div className="flex items-start gap-sm">
                    <div className="p-2 bg-green-100 rounded-full">
                      <Zap className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-heading-4 font-medium text-green-900">Optimal Viewing Time</h4>
                      <p className="text-body-sm text-green-700 mt-1">
                        Schedule viewings on Saturday mornings for better negotiation outcomes.
                      </p>
                      <Button variant="outline" size="sm" className="mt-2 text-green-600 border-green-300">
                        Schedule Now
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="card-compact border border-purple-200 bg-purple-50 rounded-lg">
                  <div className="flex items-start gap-sm">
                    <div className="p-2 bg-purple-100 rounded-full">
                      <Rocket className="h-4 w-4 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-heading-4 font-medium text-purple-900">Budget Optimization</h4>
                      <p className="text-body-sm text-purple-700 mt-1">
                        Increase budget by £25k to access 40% more suitable properties.
                      </p>
                      <Button variant="outline" size="sm" className="mt-2 text-purple-600 border-purple-300">
                        Explore Options
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="section-spacing card-compact bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-sm">
                    <div className="p-2 bg-white rounded-full shadow-sm">
                      <Sparkles className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-heading-4 font-medium text-gray-900">Weekly Insight</h4>
                      <p className="text-body-sm text-gray-600">
                        Properties in your price range are selling 23% faster this week. Consider making competitive offers.
                      </p>
                    </div>
                  </div>
                  <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600">
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Learn More
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'offers' && (
        <div className="stack-lg">
          {/* Offers List */}
          <div className="stack-md">
            {offers.map((offer) => (
              <Card key={offer.id} className="hover:shadow-md transition-shadow">
                <CardContent className="card-compact">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-md">
                    <div className="flex items-start gap-md">
                      <img
                        src={offer.propertyImage}
                        alt={offer.propertyTitle}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="text-heading-3 font-semibold text-gray-900">{offer.propertyTitle}</h3>
                        <p className="text-body-sm text-gray-600 flex items-center mt-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          {offer.propertyAddress}
                        </p>
                        <div className="flex items-center gap-md mt-2">
                          <span className="text-heading-3 font-bold text-gray-900">£{offer.offerAmount.toLocaleString()}</span>
                          <span className={`px-2 py-1 rounded-full text-caption font-medium ${
                            offer.status === 'accepted' ? 'bg-green-100 text-green-800' :
                            offer.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            offer.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            offer.status === 'countered' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
                          </span>
                        </div>
                        <p className="text-caption text-gray-500 mt-1">
                          Submitted: {new Date(offer.submissionDate).toLocaleDateString()}
                          {offer.expiryDate && ` • Expires: ${new Date(offer.expiryDate).toLocaleDateString()}`}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-sm">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedOffer(offer);
                          setShowOfferModal(true);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                      
                      {offer.status === 'pending' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Withdraw
                        </Button>
                      )}
                      
                      {offer.status === 'countered' && (
                        <Button
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Respond
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {/* Negotiation Timeline Preview */}
                  {offer.negotiationHistory.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="text-body-sm font-medium text-gray-900 mb-2">Recent Activity</h4>
                      <div className="stack-sm">
                        {offer.negotiationHistory.slice(-2).map((event, index) => (
                          <div key={index} className="flex items-center text-body-sm text-gray-600">
                            <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                            <span>{event.type === 'offer' ? 'Offer submitted' : 
                                   event.type === 'counter' ? 'Counter offer received' :
                                   event.type === 'acceptance' ? 'Offer accepted' :
                                   event.type === 'rejection' ? 'Offer rejected' : event.type}
                            </span>
                            <span className="ml-2 font-medium">£{event.amount.toLocaleString()}</span>
                            <span className="ml-auto">{new Date(event.date).toLocaleDateString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            
            {offers.length === 0 && (
              <Card>
                <CardContent className="card-compact text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-heading-3 font-medium text-gray-900 mb-2">No offers yet</h3>
                  <p className="text-body-lg text-gray-600 mb-4">
                    You haven't submitted any offers yet. Start browsing properties to make your first offer.
                  </p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Browse Properties
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {activeTab === 'market' && (
        <div className="stack-lg">
          {/* Market Overview Cards */}
          <div className="grid-responsive gap-lg">
            <Card>
              <CardContent className="card-compact">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-body-sm font-medium text-gray-600">Average Price</p>
                    <p className="text-heading-1 font-bold text-gray-900">£425,000</p>
                    <p className="text-body-sm text-green-600 flex items-center mt-1">
                      <ArrowUp className="h-3 w-3 mr-1" />
                      +3.2% vs last month
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Home className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="card-compact">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-body-sm font-medium text-gray-600">Days on Market</p>
                    <p className="text-heading-1 font-bold text-gray-900">28</p>
                    <p className="text-body-sm text-red-600 flex items-center mt-1">
                      <ArrowDown className="h-3 w-3 mr-1" />
                      -5 days vs last month
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <Calendar className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="card-compact">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-body-sm font-medium text-gray-600">Properties Sold</p>
                    <p className="text-heading-1 font-bold text-gray-900">142</p>
                    <p className="text-body-sm text-green-600 flex items-center mt-1">
                      <ArrowUp className="h-3 w-3 mr-1" />
                      +12% vs last month
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="card-compact">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-body-sm font-medium text-gray-600">Price per Sq Ft</p>
                    <p className="text-heading-1 font-bold text-gray-900">£312</p>
                    <p className="text-body-sm text-green-600 flex items-center mt-1">
                      <ArrowUp className="h-3 w-3 mr-1" />
                      +1.8% vs last month
                    </p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-full">
                    <BarChart3 className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Market Trends Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <LineChart className="h-5 w-5 mr-2" />
                  Price Trends (Last 12 Months)
                </CardTitle>
              </CardHeader>
              <CardContent className="card-compact">
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <LineChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-body-lg text-gray-600">Price trend chart would be displayed here</p>
                    <p className="text-body-sm text-gray-500 mt-1">Showing average prices over time</p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-md text-center">
                  <div>
                    <p className="text-body-sm text-gray-600">Lowest</p>
                    <p className="text-heading-3 font-semibold text-red-600">£385,000</p>
                  </div>
                  <div>
                    <p className="text-body-sm text-gray-600">Average</p>
                    <p className="text-heading-3 font-semibold text-gray-900">£425,000</p>
                  </div>
                  <div>
                    <p className="text-body-sm text-gray-600">Highest</p>
                    <p className="text-heading-3 font-semibold text-green-600">£465,000</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart className="h-5 w-5 mr-2" />
                  Property Type Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="card-compact">
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-body-lg text-gray-600">Property type distribution chart</p>
                    <p className="text-body-sm text-gray-500 mt-1">Breakdown by property type</p>
                  </div>
                </div>
                <div className="mt-4 stack-sm">
                  {[
                    { type: 'Houses', percentage: 45, color: 'bg-blue-500' },
                    { type: 'Apartments', percentage: 35, color: 'bg-green-500' },
                    { type: 'Townhouses', percentage: 15, color: 'bg-purple-500' },
                    { type: 'Bungalows', percentage: 5, color: 'bg-orange-500' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full ${item.color} mr-2`}></div>
                        <span className="text-body-sm text-gray-700">{item.type}</span>
                      </div>
                      <span className="text-body-sm font-medium">{item.percentage}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Comparable Sales */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="h-5 w-5 mr-2" />
                Recent Comparable Sales
              </CardTitle>
            </CardHeader>
            <CardContent className="card-compact">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 text-heading-4 font-medium text-gray-900">Property</th>
                      <th className="text-left py-3 px-4 text-heading-4 font-medium text-gray-900">Sale Price</th>
                      <th className="text-left py-3 px-4 text-heading-4 font-medium text-gray-900">Price/Sq Ft</th>
                      <th className="text-left py-3 px-4 text-heading-4 font-medium text-gray-900">Beds/Baths</th>
                      <th className="text-left py-3 px-4 text-heading-4 font-medium text-gray-900">Sale Date</th>
                      <th className="text-left py-3 px-4 text-heading-4 font-medium text-gray-900">Days on Market</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      {
                        address: '15 Oak Street, Manchester M20',
                        price: 435000,
                        pricePerSqFt: 318,
                        beds: 3,
                        baths: 2,
                        saleDate: '2024-01-15',
                        daysOnMarket: 21
                      },
                      {
                        address: '42 Elm Avenue, Manchester M20',
                        price: 415000,
                        pricePerSqFt: 295,
                        beds: 3,
                        baths: 2,
                        saleDate: '2024-01-08',
                        daysOnMarket: 35
                      },
                      {
                        address: '8 Pine Close, Manchester M20',
                        price: 445000,
                        pricePerSqFt: 325,
                        beds: 4,
                        baths: 3,
                        saleDate: '2024-01-03',
                        daysOnMarket: 18
                      }
                    ].map((property, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div>
                            <p className="text-body-sm font-medium text-gray-900">{property.address}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-heading-3 font-semibold text-gray-900">£{property.price.toLocaleString()}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-body-sm text-gray-700">£{property.pricePerSqFt}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-body-sm text-gray-700">{property.beds}bed / {property.baths}bath</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-body-sm text-gray-700">{new Date(property.saleDate).toLocaleDateString()}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-body-sm text-gray-700">{property.daysOnMarket} days</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Market Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Market Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="card-compact">
                <div className="stack-md">
                  <div className="card-compact bg-blue-50 rounded-lg">
                    <div className="flex items-start">
                      <Info className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                      <div>
                        <h4 className="text-heading-4 font-medium text-blue-900">Buyer's Market</h4>
                        <p className="text-body-sm text-blue-700 mt-1">
                          Current market conditions favor buyers with increased inventory and longer days on market.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="card-compact bg-green-50 rounded-lg">
                    <div className="flex items-start">
                      <TrendingUp className="h-5 w-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                      <div>
                        <h4 className="text-heading-4 font-medium text-green-900">Price Growth</h4>
                        <p className="text-body-sm text-green-700 mt-1">
                          Property prices have increased by 3.2% over the last month, indicating steady growth.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="card-compact bg-orange-50 rounded-lg">
                    <div className="flex items-start">
                      <Clock className="h-5 w-5 text-orange-600 mt-0.5 mr-3 flex-shrink-0" />
                      <div>
                        <h4 className="text-heading-4 font-medium text-orange-900">Best Time to Buy</h4>
                        <p className="text-body-sm text-orange-700 mt-1">
                          Winter months typically offer better negotiation opportunities and less competition.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="h-5 w-5 mr-2" />
                  Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="card-compact">
                <div className="stack-md">
                  <div className="card-compact border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-heading-4 font-medium text-gray-900">Optimal Offer Range</h4>
                      <span className="text-caption bg-blue-100 text-blue-800 px-2 py-1 rounded">Recommended</span>
                    </div>
                    <p className="text-body-sm text-gray-600 mb-2">
                      Based on recent sales, consider offers between £410,000 - £430,000 for similar properties.
                    </p>
                    <div className="flex items-center text-body-sm text-green-600">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      95% success rate in this range
                    </div>
                  </div>
                  
                  <div className="card-compact border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-heading-4 font-medium text-gray-900">Negotiation Strategy</h4>
                      <span className="text-caption bg-green-100 text-green-800 px-2 py-1 rounded">High Impact</span>
                    </div>
                    <p className="text-body-sm text-gray-600 mb-2">
                      Properties in this area typically sell for 2-5% below asking price. Start with a competitive offer.
                    </p>
                    <div className="flex items-center text-body-sm text-blue-600">
                      <Target className="h-4 w-4 mr-1" />
                      Average negotiation: 3.2%
                    </div>
                  </div>
                  
                  <div className="card-compact border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-heading-4 font-medium text-gray-900">Market Timing</h4>
                      <span className="text-caption bg-purple-100 text-purple-800 px-2 py-1 rounded">Trending</span>
                    </div>
                    <p className="text-body-sm text-gray-600 mb-2">
                      Inventory is increasing. Consider waiting 2-4 weeks for better selection and pricing.
                    </p>
                    <div className="flex items-center text-body-sm text-purple-600">
                      <Calendar className="h-4 w-4 mr-1" />
                      +15% new listings expected
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Mortgage Tools Tab */}
      {activeTab === 'mortgage' && (
        <div className="stack-lg">
          {/* Mortgage Calculator */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-sm">
                <Calculator className="h-5 w-5" />
                Mortgage Calculator
              </CardTitle>
            </CardHeader>
            <CardContent className="card-compact">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
                <div className="stack-md">
                  <div>
                    <label className="block text-body-sm font-medium text-gray-700 stack-xs">
                      Property Price
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">£</span>
                      <input
                        type="number"
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="450,000"
                        defaultValue="450000"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-body-sm font-medium text-gray-700 stack-xs">
                      Deposit Amount
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">£</span>
                      <input
                        type="number"
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="90,000"
                        defaultValue="90000"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-body-sm font-medium text-gray-700 stack-xs">
                      Interest Rate (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="4.5"
                      defaultValue="4.5"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-body-sm font-medium text-gray-700 stack-xs">
                      Mortgage Term (years)
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="25">25 years</option>
                      <option value="30">30 years</option>
                      <option value="35">35 years</option>
                    </select>
                  </div>
                  
                  <Button className="w-full">
                    Calculate Payment
                  </Button>
                </div>
                
                <div className="bg-gray-50 card-compact rounded-lg">
                  <h3 className="text-heading-3 font-semibold text-gray-900 stack-md">Monthly Payment Breakdown</h3>
                  <div className="stack-sm">
                    <div className="flex justify-between">
                      <span className="text-body-sm text-gray-600">Principal & Interest:</span>
                      <span className="font-semibold">£1,847</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-body-sm text-gray-600">Property Tax:</span>
                      <span className="font-semibold">£375</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-body-sm text-gray-600">Home Insurance:</span>
                      <span className="font-semibold">£125</span>
                    </div>
                    <div className="flex justify-between border-t pt-3">
                      <span className="text-heading-4 font-semibold text-gray-900">Total Monthly Payment:</span>
                      <span className="text-heading-4 font-bold text-blue-600">£2,347</span>
                    </div>
                  </div>
                  
                  <div className="section-spacing card-compact bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-sm stack-sm">
                      <Info className="h-4 w-4 text-blue-600" />
                      <span className="text-body-sm font-medium text-blue-900">Loan Summary</span>
                    </div>
                    <div className="text-body-sm text-blue-700 stack-xs">
                      <div>Loan Amount: £360,000</div>
                      <div>Total Interest: £194,200</div>
                      <div>Total Paid: £554,200</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Affordability Calculator */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-sm">
                <PoundSterling className="h-5 w-5" />
                Affordability Calculator
              </CardTitle>
            </CardHeader>
            <CardContent className="card-compact">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
                <div className="stack-md">
                  <div>
                    <label className="block text-body-sm font-medium text-gray-700 stack-xs">
                      Annual Income
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">£</span>
                      <input
                        type="number"
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="75,000"
                        defaultValue="75000"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-body-sm font-medium text-gray-700 stack-xs">
                      Monthly Debt Payments
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">£</span>
                      <input
                        type="number"
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="500"
                        defaultValue="500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-body-sm font-medium text-gray-700 stack-xs">
                      Available Deposit
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">£</span>
                      <input
                        type="number"
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="90,000"
                        defaultValue="90000"
                      />
                    </div>
                  </div>
                  
                  <Button className="w-full">
                    Calculate Affordability
                  </Button>
                </div>
                
                <div className="bg-green-50 card-compact rounded-lg">
                  <h3 className="text-heading-3 font-semibold text-gray-900 stack-md">What You Can Afford</h3>
                  <div className="stack-md">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">£425,000</div>
                      <div className="text-body-sm text-gray-600">Maximum Property Price</div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-md text-center">
                      <div>
                        <div className="text-heading-2 font-semibold text-gray-900">£335,000</div>
                        <div className="text-caption text-gray-600">Max Loan Amount</div>
                      </div>
                      <div>
                        <div className="text-heading-2 font-semibold text-gray-900">£1,725</div>
                        <div className="text-caption text-gray-600">Monthly Payment</div>
                      </div>
                    </div>
                    
                    <div className="stack-sm">
                      <div className="flex justify-between text-body-sm">
                        <span className="text-gray-600">Debt-to-Income Ratio:</span>
                        <span className="font-medium">35%</span>
                      </div>
                      <div className="flex justify-between text-body-sm">
                        <span className="text-gray-600">Loan-to-Value Ratio:</span>
                        <span className="font-medium">79%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pre-approval Tracking */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-sm">
                <FileCheck className="h-5 w-5" />
                Pre-approval Tracking
              </CardTitle>
            </CardHeader>
            <CardContent className="card-compact">
              <div className="stack-lg">
                {/* Progress Steps */}
                <div className="flex items-center justify-between">
                  {[
                    { step: 1, label: 'Application', status: 'completed' },
                    { step: 2, label: 'Documentation', status: 'completed' },
                    { step: 3, label: 'Credit Check', status: 'in-progress' },
                    { step: 4, label: 'Approval', status: 'pending' }
                  ].map((item, index) => (
                      <div key={item.step} className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-body-sm font-medium ${
                        item.status === 'completed' ? 'bg-green-500 text-white' :
                        item.status === 'in-progress' ? 'bg-blue-500 text-white' :
                        'bg-gray-200 text-gray-600'
                      }`}>
                        {item.status === 'completed' ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          item.step
                        )}
                      </div>
                      <div className="ml-2 text-body-sm">
                          <div className={`font-medium ${
                          item.status === 'completed' ? 'text-green-700' :
                          item.status === 'in-progress' ? 'text-blue-700' :
                          'text-gray-500'
                        }`}>
                          {item.label}
                        </div>
                      </div>
                      {index < 3 && (
                        <div className={`flex-1 h-0.5 mx-4 ${
                          item.status === 'completed' ? 'bg-green-500' : 'bg-gray-200'
                        }`} />
                      )}
                    </div>
                  ))}
                </div>
                
                {/* Current Status */}
                <div className="bg-blue-50 card-compact rounded-lg">
                  <div className="flex items-center gap-sm stack-sm">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-blue-900">Current Status: Credit Check in Progress</span>
                  </div>
                  <p className="text-body-sm text-blue-700">
                    Your credit check is being processed. This typically takes 2-3 business days. 
                    We'll notify you once it's complete.
                  </p>
                </div>
                
                {/* Pre-approval Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
                  <div className="bg-gray-50 card-compact rounded-lg text-center">
                    <div className="text-heading-1 font-bold text-gray-900">£400,000</div>
                    <div className="text-body-sm text-gray-600">Pre-approved Amount</div>
                  </div>
                  <div className="bg-gray-50 card-compact rounded-lg text-center">
                    <div className="text-heading-1 font-bold text-gray-900">4.2%</div>
                    <div className="text-body-sm text-gray-600">Interest Rate</div>
                  </div>
                  <div className="bg-gray-50 card-compact rounded-lg text-center">
                    <div className="text-heading-1 font-bold text-gray-900">90 days</div>
                    <div className="text-body-sm text-gray-600">Valid Until</div>
                  </div>
                </div>
                
                {/* Required Documents */}
                <div>
                  <h4 className="text-heading-4 font-medium text-gray-900 stack-sm">Required Documents</h4>
                  <div className="stack-sm">
                    {[
                      { name: 'Proof of Income', status: 'uploaded' },
                      { name: 'Bank Statements (3 months)', status: 'uploaded' },
                      { name: 'Credit Report', status: 'pending' },
                      { name: 'Employment Verification', status: 'uploaded' }
                    ].map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <span className="text-gray-700">{doc.name}</span>
                        <span className={`px-2 py-1 rounded-full text-caption font-medium ${
                          doc.status === 'uploaded' ? 'bg-green-100 text-green-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {doc.status === 'uploaded' ? 'Uploaded' : 'Pending'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-sm">
                  <Button variant="outline" className="flex-1">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Documents
                  </Button>
                  <Button className="flex-1">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Contact Lender
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Offer Detail Modal */}
      <Modal
        isOpen={showOfferModal}
        onClose={() => {
          setShowOfferModal(false);
          setSelectedOffer(null);
        }}
        title={selectedOffer ? `Offer Details - ${selectedOffer.propertyTitle}` : 'Offer Details'}
        size="xl"
      >
        {selectedOffer && (
          <div className="stack-lg">
            {/* Property Summary */}
            <div className="bg-gray-50 card-compact rounded-lg">
              <div className="flex items-start gap-md">
                <img
                  src={selectedOffer.propertyImage}
                  alt={selectedOffer.propertyTitle}
                  className="w-24 h-24 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="text-heading-3 font-semibold text-gray-900">{selectedOffer.propertyTitle}</h3>
                  <p className="text-gray-600">{selectedOffer.propertyAddress}</p>
                  <p className="text-heading-2 font-bold text-blue-600 stack-xs">£{selectedOffer.offerAmount.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-caption font-medium ${
                    selectedOffer.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    selectedOffer.status === 'accepted' ? 'bg-green-100 text-green-800' :
                    selectedOffer.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    selectedOffer.status === 'countered' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedOffer.status.charAt(0).toUpperCase() + selectedOffer.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            {/* Offer Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
              <div className="stack-md">
                <h4 className="text-heading-3 font-medium text-gray-900">Offer Information</h4>
                <div className="stack-sm">
                  <div className="flex justify-between">
                    <span className="text-body-sm text-gray-600">Offer Amount:</span>
                    <span className="font-semibold">£{selectedOffer.offerAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-body-sm text-gray-600">Original Price:</span>
                    <span>£{selectedOffer.originalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-body-sm text-gray-600">Submitted:</span>
                    <span>{new Date(selectedOffer.submissionDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-body-sm text-gray-600">Expires:</span>
                    <span>{new Date(selectedOffer.expiryDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="stack-md">
                <h4 className="text-heading-3 font-medium text-gray-900">Analytics</h4>
                <div className="stack-sm">
                  <div className="flex justify-between">
                    <span className="text-body-sm text-gray-600">Views Before Offer:</span>
                    <span className="font-semibold">{selectedOffer.analytics.viewsBeforeOffer}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-body-sm text-gray-600">Days on Market:</span>
                    <span>{selectedOffer.analytics.daysOnMarket}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-body-sm text-gray-600">Competitive Offers:</span>
                    <span>{selectedOffer.analytics.competitiveOffers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-body-sm text-gray-600">Market Comparison:</span>
                    <span className="capitalize">{selectedOffer.analytics.marketComparison}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Conditions */}
            {selectedOffer.conditions.length > 0 && (
              <div>
                <h4 className="text-heading-3 font-medium text-gray-900 stack-sm">Conditions</h4>
                <ul className="stack-sm">
                  {selectedOffer.conditions.map((condition, index) => (
                    <li key={index} className="flex items-start gap-sm">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-body-sm text-gray-700">{condition}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Communications */}
            <div>
              <h4 className="text-heading-3 font-medium text-gray-900 stack-sm">Communications</h4>
              <div className="stack-sm max-h-60 overflow-y-auto">
                {selectedOffer.communications.map((comm, index) => (
                  <div key={index} className={`card-compact rounded-lg ${
                    comm.senderType === 'buyer' ? 'bg-blue-50 ml-8' : 'bg-gray-50 mr-8'
                  }`}>
                    <div className="flex items-center justify-between stack-xs">
                      <span className="font-medium text-body-sm">
                        {comm.senderType === 'buyer' ? 'You' : comm.sender}
                      </span>
                      <span className="text-caption text-gray-500">
                        {new Date(comm.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-gray-700 text-body-sm">{comm.message}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-sm section-spacing border-t">
              {selectedOffer.status === 'pending' && (
                <Button
                  variant="outline"
                  onClick={() => {
                    showToast.success('Offer withdrawn successfully');
                    setShowOfferModal(false);
                  }}
                >
                  Withdraw Offer
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => setShowOfferModal(false)}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default BuyerDashboard;