import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  MapPin, 
  RefreshCw, 
  Download, 
  Plus, 
  Filter,
  Calendar,
  Banknote,
  Percent,
  Target,
  AlertTriangle,
  Info,
  Share2,
  Eye,
  Clock,
  Users,
  Building,
  PieChart,
  LineChart,
  Activity,
  FileText,
  Settings,
  Search,
  Star,
  Bookmark,
  Home,
  AlertCircle,
  GraduationCap,
  Train,
  ShoppingBag,
  Heart
} from 'lucide-react';
import { 
  LineChart as RechartsLineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Cell,
  Legend,
  Area,
  AreaChart
} from 'recharts';
import { showToast } from '../components/ui/Toast';

interface MarketData {
  id: string;
  type: 'PROPERTY_VALUATION' | 'MARKET_TRENDS' | 'RENTAL_ANALYSIS' | 'PRICE_COMPARISON' | 'DEMAND_ANALYSIS' | 'INVESTMENT_ANALYSIS';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'EXPIRED';
  postcode: string;
  area: string;
  city: string;
  county: string;
  propertyType?: string;
  bedrooms?: number;
  estimatedValue?: number;
  valuationRange?: {
    min: number;
    max: number;
  };
  rentalValue?: number;
  rentalYield?: number;
  pricePerSqFt?: number;
  priceChange?: {
    monthly: number;
    quarterly: number;
    yearly: number;
  };
  averageDaysOnMarket?: number;
  salesVolume?: number;
  demandScore?: number;
  supplyScore?: number;
  marketTrend?: 'RISING' | 'FALLING' | 'STABLE';
  confidenceLevel?: number;
  lastUpdated: string;
  dataSource: string;
  requestedBy: string;
  requestedAt: string;
  completedAt?: string;
  notes?: string;
  insights?: MarketInsights;
  riskFactors?: RiskFactor[];
  opportunities?: string[];
  comparableProperties?: ComparableProperty[];
  investmentMetrics?: InvestmentMetrics;
  neighborhoodData?: NeighborhoodData;
}

interface MarketInsights {
  summary: string;
  keyFindings: string[];
  recommendations: string[];
  marketStrength: number;
  liquidityScore: number;
  growthPotential: number;
}

interface RiskFactor {
  type: 'HIGH' | 'MEDIUM' | 'LOW';
  category: string;
  description: string;
  impact: number;
  mitigation?: string;
}

interface ComparableProperty {
  id: string;
  address: string;
  price: number;
  saleDate: string;
  bedrooms: number;
  bathrooms: number;
  propertyType: string;
  distance: number;
  similarity: number;
  pricePerSqFt: number;
  daysOnMarket: number;
}

interface InvestmentMetrics {
  rentalYield: number;
  capitalGrowth: number;
  totalReturn: number;
  paybackPeriod: number;
  riskScore: number;
  liquidityScore: number;
  marketStrength: number;
  cashFlow: number;
  roi: number;
}

interface NeighborhoodData {
  name: string;
  averagePrice: number;
  priceGrowth: number;
  crimeRate: number;
  schoolRating: number;
  transportScore: number;
  amenityScore: number;
  demographics: {
    averageAge: number;
    familyHouseholds: number;
    professionals: number;
    students: number;
  };
  amenities: {
    schools: number;
    restaurants: number;
    shops: number;
    parks: number;
    hospitals: number;
    trainStations: number;
  };
}

interface PriceTrendData {
  period: string;
  averagePrice: number;
  medianPrice: number;
  priceChange: number;
  priceChangePercent: number;
  salesVolume: number;
  daysOnMarket: number;
  pricePerSqFt: number;
  inventory: number;
}

interface AnalyticsFilter {
  timeframe: '1M' | '3M' | '6M' | '1Y' | '2Y' | '5Y';
  propertyTypes: string[];
  priceRange: { min: number; max: number };
  bedrooms: number[];
  includeRentals: boolean;
  includeNewBuilds: boolean;
}

interface PropertyComparison {
  id: string;
  address: string;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  sqft?: number;
  price: number;
  pricePerSqFt: number;
  daysOnMarket: number;
  status: 'SOLD' | 'FOR_SALE' | 'UNDER_OFFER';
  distance: number; // in miles
  similarity: number; // percentage
  saleDate?: string;
  listingDate: string;
}

interface AnalysisFormData {
  type: string;
  postcode: string;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  notes: string;
}

const MarketAnalysisPage: React.FC = () => {
  const [analyses, setAnalyses] = useState<MarketData[]>([]);
  const [loading, setLoading] = useState(false);
  const [showNewAnalysisModal, setShowNewAnalysisModal] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState<MarketData | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'investment' | 'neighborhood' | 'comparables'>('overview');
  const [analyticsFilter, setAnalyticsFilter] = useState<AnalyticsFilter>({
    timeframe: '1Y',
    propertyTypes: ['House', 'Flat', 'Bungalow'],
    priceRange: { min: 0, max: 2000000 },
    bedrooms: [1, 2, 3, 4, 5],
    includeRentals: true,
    includeNewBuilds: true
  });
  const [priceTrendData, setPriceTrendData] = useState<PriceTrendData[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [searchPostcode, setSearchPostcode] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    area: '',
    dateRange: ''
  });
  const [comparisons, setComparisons] = useState<PropertyComparison[]>([]);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [areaFilter, setAreaFilter] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const [analysisForm, setAnalysisForm] = useState<AnalysisFormData>({
    type: 'PROPERTY_VALUATION',
    postcode: '',
    propertyType: 'house',
    bedrooms: 3,
    bathrooms: 2,
    sqft: 1200,
    notes: '',
  });

  // Utility functions
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'RISING':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'FALLING':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <BarChart3 className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      case 'EXPIRED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'PROPERTY_VALUATION':
        return 'Property Valuation';
      case 'MARKET_TRENDS':
        return 'Market Trends';
      case 'RENTAL_ANALYSIS':
        return 'Rental Analysis';
      case 'PRICE_COMPARISON':
        return 'Price Comparison';
      case 'DEMAND_ANALYSIS':
        return 'Demand Analysis';
      case 'INVESTMENT_ANALYSIS':
        return 'Investment Analysis';
      default:
        return type;
    }
  };

  // Filter data
  const filteredData = analyses.filter(data => {
    const matchesType = typeFilter === 'all' || data.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || data.status === statusFilter;
    const matchesArea = areaFilter === '' || 
      data.area.toLowerCase().includes(areaFilter.toLowerCase()) ||
      data.city.toLowerCase().includes(areaFilter.toLowerCase()) ||
      data.postcode.toLowerCase().includes(areaFilter.toLowerCase());
    
    return matchesType && matchesStatus && matchesArea;
  });

  // Handle form submission
  const handleSubmitAnalysis = async () => {
    if (!analysisForm.postcode) return;
    
    setSubmitting(true);
    try {
      await handleRequestAnalysis();
    } catch (error) {
      console.error('Error submitting analysis:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // Mock data - replace with API calls
  useEffect(() => {
    const mockPriceTrendData: PriceTrendData[] = [
      { period: 'Jan 2023', averagePrice: 450000, medianPrice: 425000, priceChange: 15000, priceChangePercent: 3.4, salesVolume: 1250, daysOnMarket: 28, pricePerSqFt: 520, inventory: 2100 },
      { period: 'Feb 2023', averagePrice: 465000, medianPrice: 440000, priceChange: 15000, priceChangePercent: 3.3, salesVolume: 1180, daysOnMarket: 26, pricePerSqFt: 535, inventory: 1950 },
      { period: 'Mar 2023', averagePrice: 478000, medianPrice: 455000, priceChange: 13000, priceChangePercent: 2.8, salesVolume: 1320, daysOnMarket: 24, pricePerSqFt: 548, inventory: 1800 },
      { period: 'Apr 2023', averagePrice: 485000, medianPrice: 462000, priceChange: 7000, priceChangePercent: 1.5, salesVolume: 1420, daysOnMarket: 22, pricePerSqFt: 555, inventory: 1650 },
      { period: 'May 2023', averagePrice: 492000, medianPrice: 470000, priceChange: 7000, priceChangePercent: 1.4, salesVolume: 1380, daysOnMarket: 25, pricePerSqFt: 562, inventory: 1720 },
      { period: 'Jun 2023', averagePrice: 498000, medianPrice: 475000, priceChange: 6000, priceChangePercent: 1.2, salesVolume: 1450, daysOnMarket: 23, pricePerSqFt: 568, inventory: 1580 },
      { period: 'Jul 2023', averagePrice: 505000, medianPrice: 482000, priceChange: 7000, priceChangePercent: 1.4, salesVolume: 1520, daysOnMarket: 21, pricePerSqFt: 575, inventory: 1450 },
      { period: 'Aug 2023', averagePrice: 512000, medianPrice: 488000, priceChange: 7000, priceChangePercent: 1.4, salesVolume: 1480, daysOnMarket: 20, pricePerSqFt: 582, inventory: 1380 },
      { period: 'Sep 2023', averagePrice: 518000, medianPrice: 495000, priceChange: 6000, priceChangePercent: 1.2, salesVolume: 1350, daysOnMarket: 22, pricePerSqFt: 588, inventory: 1420 },
      { period: 'Oct 2023', averagePrice: 525000, medianPrice: 502000, priceChange: 7000, priceChangePercent: 1.4, salesVolume: 1280, daysOnMarket: 24, pricePerSqFt: 595, inventory: 1520 },
      { period: 'Nov 2023', averagePrice: 530000, medianPrice: 508000, priceChange: 5000, priceChangePercent: 1.0, salesVolume: 1150, daysOnMarket: 26, pricePerSqFt: 600, inventory: 1680 },
      { period: 'Dec 2023', averagePrice: 535000, medianPrice: 512000, priceChange: 5000, priceChangePercent: 0.9, salesVolume: 980, daysOnMarket: 30, pricePerSqFt: 605, inventory: 1850 }
    ];

    const mockMarketData: MarketData[] = [
      {
        id: '1',
        type: 'PROPERTY_VALUATION',
        status: 'COMPLETED',
        postcode: 'SW1A 1AA',
        area: 'Westminster',
        city: 'London',
        county: 'Greater London',
        propertyType: 'house',
        bedrooms: 3,
        estimatedValue: 850000,
        valuationRange: { min: 800000, max: 900000 },
        rentalValue: 3500,
        rentalYield: 4.9,
        pricePerSqFt: 708,
        priceChange: {
          monthly: 2.1,
          quarterly: 5.8,
          yearly: 12.3
        },
        averageDaysOnMarket: 45,
        salesVolume: 23,
        demandScore: 85,
        supplyScore: 65,
        marketTrend: 'RISING',
        confidenceLevel: 92,
        lastUpdated: '2024-01-15T10:00:00Z',
        dataSource: 'Rightmove API',
        requestedBy: 'Sarah Johnson',
        requestedAt: '2024-01-15T09:00:00Z',
        completedAt: '2024-01-15T10:00:00Z',
        notes: 'Prime central London location with excellent transport links',
        insights: {
          summary: 'Strong market performance with excellent growth potential in prime Westminster location.',
          keyFindings: [
            'Property values increased 12.3% year-over-year',
            'High demand from international buyers',
            'Limited supply driving price appreciation',
            'Strong rental market with 4.9% yield'
          ],
          recommendations: [
            'Consider holding for long-term capital appreciation',
            'Rental income provides stable cash flow',
            'Monitor interest rate changes for market impact'
          ],
          marketStrength: 92,
          liquidityScore: 88,
          growthPotential: 85
        },
        riskFactors: [
          { type: 'MEDIUM', category: 'Market Risk', description: 'Interest rate sensitivity', impact: 6, mitigation: 'Diversify portfolio across price ranges' },
          { type: 'LOW', category: 'Location Risk', description: 'Prime central location', impact: 2 }
        ],
        opportunities: [
          'Crossrail completion boosting connectivity',
          'Government infrastructure investment',
          'Growing financial services sector'
        ],
        investmentMetrics: {
          rentalYield: 4.9,
          capitalGrowth: 12.3,
          totalReturn: 17.2,
          paybackPeriod: 20.4,
          riskScore: 3.2,
          liquidityScore: 88,
          marketStrength: 92,
          cashFlow: 2800,
          roi: 8.5
        },
        neighborhoodData: {
          name: 'Westminster',
          averagePrice: 825000,
          priceGrowth: 11.8,
          crimeRate: 2.1,
          schoolRating: 8.5,
          transportScore: 95,
          amenityScore: 92,
          demographics: {
            averageAge: 38,
            familyHouseholds: 35,
            professionals: 78,
            students: 12
          },
          amenities: {
            schools: 15,
            restaurants: 180,
            shops: 95,
            parks: 8,
            hospitals: 3,
            trainStations: 6
          }
        }
      },
      {
        id: '2',
        type: 'MARKET_TRENDS',
        status: 'COMPLETED',
        postcode: 'W1K 1AA',
        area: 'Mayfair',
        city: 'London',
        county: 'Greater London',
        priceChange: {
          monthly: 1.8,
          quarterly: 4.2,
          yearly: 8.7
        },
        averageDaysOnMarket: 38,
        salesVolume: 156,
        demandScore: 92,
        supplyScore: 45,
        marketTrend: 'RISING',
        confidenceLevel: 88,
        lastUpdated: '2024-01-14T15:30:00Z',
        dataSource: 'Zoopla API',
        requestedBy: 'Michael Brown',
        requestedAt: '2024-01-14T14:00:00Z',
        completedAt: '2024-01-14T15:30:00Z',
        notes: 'Luxury market showing strong growth',
        insights: {
          summary: 'Steady market growth with strong rental demand in Manchester city centre.',
          keyFindings: [
            'Consistent 3.8% annual growth',
            'Strong student and professional rental market',
            'Major regeneration projects underway',
            'Good transport connectivity'
          ],
          recommendations: [
            'Ideal for buy-to-let investment',
            'Consider properties near universities',
            'Monitor new supply from developments'
          ],
          marketStrength: 78,
          liquidityScore: 82,
          growthPotential: 75
        }
      },
      {
        id: '3',
        type: 'RENTAL_ANALYSIS',
        status: 'COMPLETED',
        postcode: 'SW19 2AA',
        area: 'Wimbledon',
        city: 'London',
        county: 'Greater London',
        propertyType: 'house',
        bedrooms: 4,
        estimatedValue: 750000,
        rentalValue: 2800,
        rentalYield: 4.5,
        pricePerSqFt: 625,
        averageDaysOnMarket: 28,
        demandScore: 78,
        supplyScore: 72,
        marketTrend: 'STABLE',
        confidenceLevel: 85,
        lastUpdated: '2024-01-13T11:20:00Z',
        dataSource: 'SpareRoom API',
        requestedBy: 'Emma Thompson',
        requestedAt: '2024-01-13T10:00:00Z',
        completedAt: '2024-01-13T11:20:00Z',
        notes: 'Family-friendly area with good schools',
      },
      {
        id: '4',
        type: 'INVESTMENT_ANALYSIS',
        status: 'IN_PROGRESS',
        postcode: 'E14 5AB',
        area: 'Canary Wharf',
        city: 'London',
        county: 'Greater London',
        propertyType: 'apartment',
        bedrooms: 2,
        demandScore: 88,
        supplyScore: 55,
        marketTrend: 'RISING',
        lastUpdated: '2024-01-16T09:00:00Z',
        dataSource: 'Multiple Sources',
        requestedBy: 'David Wilson',
        requestedAt: '2024-01-16T08:30:00Z',
        notes: 'High-rise development analysis in progress',
      },
    ];

    const mockComparisons: PropertyComparison[] = [
      {
        id: '1',
        address: '125 High Street, London SW1A 1AB',
        propertyType: 'house',
        bedrooms: 3,
        bathrooms: 2,
        sqft: 1180,
        price: 825000,
        pricePerSqFt: 699,
        daysOnMarket: 32,
        status: 'SOLD',
        distance: 0.1,
        similarity: 95,
        saleDate: '2024-01-10',
        listingDate: '2023-12-09',
      },
      {
        id: '2',
        address: '127 High Street, London SW1A 1AC',
        propertyType: 'house',
        bedrooms: 3,
        bathrooms: 2,
        sqft: 1250,
        price: 875000,
        pricePerSqFt: 700,
        daysOnMarket: 28,
        status: 'SOLD',
        distance: 0.1,
        similarity: 92,
        saleDate: '2024-01-05',
        listingDate: '2023-12-08',
      },
      {
        id: '3',
        address: '45 Victoria Street, London SW1A 2BC',
        propertyType: 'house',
        bedrooms: 3,
        bathrooms: 2,
        sqft: 1150,
        price: 795000,
        pricePerSqFt: 691,
        daysOnMarket: 42,
        status: 'FOR_SALE',
        distance: 0.3,
        similarity: 88,
        listingDate: '2023-12-15',
      },
    ];

    setTimeout(() => {
      setAnalyses(mockMarketData);
      setComparisons(mockComparisons);
      setPriceTrendData(mockPriceTrendData);
      setLoading(false);
    }, 1000);
  }, []);

  // Remove duplicate function definitions - they are already defined earlier in the file

  const handleRequestAnalysis = () => {
    const newAnalysis: MarketData = {
      id: Date.now().toString(),
      type: analysisForm.type as any,
      status: 'PENDING',
      postcode: analysisForm.postcode,
      area: 'Area Name', // This would be resolved from postcode
      city: 'London',
      county: 'Greater London',
      propertyType: analysisForm.propertyType,
      bedrooms: analysisForm.bedrooms,
      lastUpdated: new Date().toISOString(),
      dataSource: 'Multiple Sources',
      requestedBy: 'Current User',
      requestedAt: new Date().toISOString(),
      notes: analysisForm.notes,
    };

    setAnalyses(prev => [newAnalysis, ...prev]);
    setAnalysisForm({
      type: 'PROPERTY_VALUATION',
      postcode: '',
      propertyType: 'house',
      bedrooms: 3,
      bathrooms: 2,
      sqft: 1200,
      notes: '',
    });
    setShowNewAnalysisModal(false);

    // Simulate analysis completion after 3 seconds
    setTimeout(() => {
      setAnalyses(prev => prev.map(data => 
        data.id === newAnalysis.id 
          ? { 
              ...data, 
              status: 'COMPLETED',
              estimatedValue: 750000 + Math.random() * 200000,
              rentalValue: 2500 + Math.random() * 1000,
              rentalYield: 4 + Math.random() * 2,
              pricePerSqFt: 600 + Math.random() * 200,
              demandScore: 70 + Math.random() * 30,
              supplyScore: 50 + Math.random() * 40,
              marketTrend: ['RISING', 'FALLING', 'STABLE'][Math.floor(Math.random() * 3)] as any,
              confidenceLevel: 80 + Math.random() * 20,
              completedAt: new Date().toISOString(),
            }
          : data
      ));
    }, 3000);
  };

  const completedAnalyses = analyses.filter(d => d.status === 'COMPLETED');
  const pendingAnalyses = analyses.filter(d => d.status === 'PENDING' || d.status === 'IN_PROGRESS');
  const avgValue = completedAnalyses.reduce((sum, d) => sum + (d.estimatedValue || 0), 0) / completedAnalyses.length || 0;
  const avgYield = completedAnalyses.reduce((sum, d) => sum + (d.rentalYield || 0), 0) / completedAnalyses.length || 0;

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };



  const handleExportData = (format: 'pdf' | 'excel' | 'csv') => {
    showToast('success', `Exporting data as ${format.toUpperCase()}...`);
    // Implement export functionality
  };

  const handleRefreshAnalysis = () => {
    setLoading(true);
    showToast('info', 'Refreshing market analysis...');
    setTimeout(() => {
      setLoading(false);
      showToast('success', 'Market analysis updated successfully');
    }, 2000);
  };

  const handleSearchPostcode = () => {
    if (!searchPostcode.trim()) {
      showToast('error', 'Please enter a valid postcode');
      return;
    }
    showToast('info', `Searching for market data in ${searchPostcode}...`);
    // Implement postcode search
  };

  const chartColors = ['#1E40AF', '#3B82F6', '#60A5FA', '#93C5FD', '#DBEAFE'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading market analysis...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">Market Analysis</h1>
              <p className="text-gray-600 mt-1">Property valuations, market trends, and investment insights</p>
            </div>
            <div className="flex gap-3 mt-4 lg:mt-0">
              <Button variant="outline" onClick={() => handleExportData('pdf')}>
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
              <Button variant="outline" onClick={handleRefreshAnalysis}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={() => setShowNewAnalysisModal(true)}>
                <BarChart3 className="h-4 w-4 mr-2" />
                New Analysis
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <Card className="mb-6">
          <div className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Search by postcode, area, or property type..."
                    value={searchPostcode}
                    onChange={(e) => setSearchPostcode(e.target.value)}
                    className="pl-10"
                    onKeyPress={(e) => e.key === 'Enter' && handleSearchPostcode()}
                  />
                </div>
              </div>
              <Button
                onClick={handleSearchPostcode}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Search
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>

            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Timeframe</label>
                    <select
                      value={analyticsFilter.timeframe}
                      onChange={(e) => setAnalyticsFilter(prev => ({ ...prev, timeframe: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="1M">1 Month</option>
                      <option value="3M">3 Months</option>
                      <option value="6M">6 Months</option>
                      <option value="1Y">1 Year</option>
                      <option value="2Y">2 Years</option>
                      <option value="5Y">5 Years</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
                    <select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Types</option>
                      <option value="PROPERTY_VALUATION">Property Valuation</option>
                      <option value="MARKET_TRENDS">Market Trends</option>
                      <option value="RENTAL_ANALYSIS">Rental Analysis</option>
                      <option value="INVESTMENT_ANALYSIS">Investment Analysis</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Status</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="PENDING">Pending</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setTypeFilter('all');
                        setStatusFilter('all');
                        setSearchPostcode('');
                        setAnalyticsFilter({
                          timeframe: '1Y',
                          propertyTypes: ['House', 'Flat', 'Bungalow'],
                          priceRange: { min: 0, max: 2000000 },
                          bedrooms: [1, 2, 3, 4, 5],
                          includeRentals: true,
                          includeNewBuilds: true
                        });
                      }}
                      className="w-full"
                    >
                      Clear Filters
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Tabbed Interface */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'trends', label: 'Market Trends', icon: TrendingUp },
              { id: 'investment', label: 'Investment Analysis', icon: Target },
              { id: 'neighborhood', label: 'Neighborhood Data', icon: MapPin },
              { id: 'comparables', label: 'Comparables', icon: Building }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className={`mr-2 h-5 w-5 ${
                    activeTab === tab.id ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                  }`} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Analyses</p>
                    <p className="text-2xl font-bold text-gray-900">{analyses.length}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Banknote className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Avg Property Value</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(avgValue)}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Avg Rental Yield</p>
                    <p className="text-2xl font-bold text-gray-900">{avgYield.toFixed(1)}%</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Clock className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-gray-900">{pendingAnalyses.length}</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Recent Analysis Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Market Performance</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={priceTrendData.slice(-6)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="period" />
                        <YAxis tickFormatter={(value) => `£${(value / 1000).toFixed(0)}k`} />
                        <Tooltip formatter={(value: any) => [formatCurrency(value), 'Average Price']} />
                        <Area type="monotone" dataKey="averagePrice" stroke="#1E40AF" fill="#3B82F6" fillOpacity={0.3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Analysis Distribution</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={[
                            { name: 'Property Valuation', value: analyses.filter(a => a.type === 'PROPERTY_VALUATION').length },
                            { name: 'Market Trends', value: analyses.filter(a => a.type === 'MARKET_TRENDS').length },
                            { name: 'Investment Analysis', value: analyses.filter(a => a.type === 'INVESTMENT_ANALYSIS').length },
                            { name: 'Rental Analysis', value: analyses.filter(a => a.type === 'RENTAL_ANALYSIS').length }
                          ]}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                        >
                          {chartColors.map((color, index) => (
                            <Cell key={`cell-${index}`} fill={color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </Card>
            </div>
          </div>
         )}

         {/* Market Trends Tab */}
         {activeTab === 'trends' && (
           <div className="space-y-6">
             <Card>
               <div className="p-6">
                 <h3 className="text-lg font-semibold text-gray-900 mb-4">Price Trends Over Time</h3>
                 <div className="h-80">
                   <ResponsiveContainer width="100%" height="100%">
                     <LineChart data={priceTrendData}>
                       <CartesianGrid strokeDasharray="3 3" />
                       <XAxis dataKey="period" />
                       <YAxis tickFormatter={(value) => `£${(value / 1000).toFixed(0)}k`} />
                       <Tooltip formatter={(value: any) => [formatCurrency(value), 'Average Price']} />
                       <Line type="monotone" dataKey="averagePrice" stroke="#1E40AF" strokeWidth={2} />
                       <Line type="monotone" dataKey="medianPrice" stroke="#059669" strokeWidth={2} />
                     </LineChart>
                   </ResponsiveContainer>
                 </div>
               </div>
             </Card>

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               <Card>
                 <div className="p-6">
                   <h3 className="text-lg font-semibold text-gray-900 mb-4">Market Indicators</h3>
                   <div className="space-y-4">
                     <div className="flex justify-between items-center">
                       <span className="text-sm text-gray-600">Price Growth (YoY)</span>
                       <span className="text-sm font-semibold text-green-600">+8.5%</span>
                     </div>
                     <div className="flex justify-between items-center">
                       <span className="text-sm text-gray-600">Sales Volume</span>
                       <span className="text-sm font-semibold text-blue-600">1,247 properties</span>
                     </div>
                     <div className="flex justify-between items-center">
                       <span className="text-sm text-gray-600">Days on Market</span>
                       <span className="text-sm font-semibold text-gray-900">32 days</span>
                     </div>
                     <div className="flex justify-between items-center">
                       <span className="text-sm text-gray-600">Market Activity</span>
                       <span className="text-sm font-semibold text-orange-600">High</span>
                     </div>
                   </div>
                 </div>
               </Card>

               <Card>
                 <div className="p-6">
                   <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Type Performance</h3>
                   <div className="h-64">
                     <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={[
                         { type: 'Detached', growth: 12.3, volume: 234 },
                         { type: 'Semi-Detached', growth: 8.7, volume: 456 },
                         { type: 'Terraced', growth: 6.2, volume: 389 },
                         { type: 'Flat', growth: 4.1, volume: 168 }
                       ]}>
                         <CartesianGrid strokeDasharray="3 3" />
                         <XAxis dataKey="type" />
                         <YAxis />
                         <Tooltip />
                         <Bar dataKey="growth" fill="#3B82F6" />
                       </BarChart>
                     </ResponsiveContainer>
                   </div>
                 </div>
               </Card>
             </div>
           </div>
         )}

         {/* Investment Analysis Tab */}
         {activeTab === 'investment' && (
           <div className="space-y-6">
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
               <Card>
                 <div className="p-6">
                   <h3 className="text-lg font-semibold text-gray-900 mb-4">Investment Metrics</h3>
                   <div className="space-y-4">
                     <div>
                       <div className="flex justify-between items-center mb-1">
                         <span className="text-sm text-gray-600">ROI Potential</span>
                         <span className="text-sm font-semibold text-green-600">High</span>
                       </div>
                       <div className="w-full bg-gray-200 rounded-full h-2">
                         <div className="bg-green-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                       </div>
                     </div>
                     <div>
                       <div className="flex justify-between items-center mb-1">
                         <span className="text-sm text-gray-600">Market Risk</span>
                         <span className="text-sm font-semibold text-yellow-600">Medium</span>
                       </div>
                       <div className="w-full bg-gray-200 rounded-full h-2">
                         <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                       </div>
                     </div>
                     <div>
                       <div className="flex justify-between items-center mb-1">
                         <span className="text-sm text-gray-600">Liquidity</span>
                         <span className="text-sm font-semibold text-blue-600">Good</span>
                       </div>
                       <div className="w-full bg-gray-200 rounded-full h-2">
                         <div className="bg-blue-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                       </div>
                     </div>
                   </div>
                 </div>
               </Card>

               <Card>
                 <div className="p-6">
                   <h3 className="text-lg font-semibold text-gray-900 mb-4">Rental Yield Analysis</h3>
                   <div className="text-center">
                     <div className="text-3xl font-bold text-blue-600 mb-2">6.8%</div>
                     <div className="text-sm text-gray-600 mb-4">Average Gross Yield</div>
                     <div className="space-y-2 text-sm">
                       <div className="flex justify-between">
                         <span>Monthly Rent:</span>
                         <span className="font-semibold">£1,850</span>
                       </div>
                       <div className="flex justify-between">
                         <span>Annual Rent:</span>
                         <span className="font-semibold">£22,200</span>
                       </div>
                       <div className="flex justify-between">
                         <span>Property Value:</span>
                         <span className="font-semibold">£325,000</span>
                       </div>
                     </div>
                   </div>
                 </div>
               </Card>

               <Card>
                 <div className="p-6">
                   <h3 className="text-lg font-semibold text-gray-900 mb-4">Cash Flow Projection</h3>
                   <div className="h-48">
                     <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={[
                         { year: 'Year 1', income: 22200, expenses: 8500, profit: 13700 },
                         { year: 'Year 2', income: 23100, expenses: 8800, profit: 14300 },
                         { year: 'Year 3', income: 24000, expenses: 9100, profit: 14900 },
                         { year: 'Year 4', income: 24900, expenses: 9400, profit: 15500 },
                         { year: 'Year 5', income: 25800, expenses: 9700, profit: 16100 }
                       ]}>
                         <CartesianGrid strokeDasharray="3 3" />
                         <XAxis dataKey="year" />
                         <YAxis tickFormatter={(value) => `£${(value / 1000).toFixed(0)}k`} />
                         <Tooltip formatter={(value: any) => [`£${value.toLocaleString()}`, '']} />
                         <Area type="monotone" dataKey="profit" stroke="#059669" fill="#10B981" fillOpacity={0.3} />
                       </AreaChart>
                     </ResponsiveContainer>
                   </div>
                 </div>
               </Card>
             </div>
           </div>
         )}

         {/* Neighborhood Data Tab */}
         {activeTab === 'neighborhood' && (
           <div className="space-y-6">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               <Card>
                 <div className="p-6">
                   <h3 className="text-lg font-semibold text-gray-900 mb-4">Area Demographics</h3>
                   <div className="space-y-4">
                     <div className="flex justify-between items-center">
                       <span className="text-sm text-gray-600">Population</span>
                       <span className="text-sm font-semibold">45,230</span>
                     </div>
                     <div className="flex justify-between items-center">
                       <span className="text-sm text-gray-600">Median Age</span>
                       <span className="text-sm font-semibold">34 years</span>
                     </div>
                     <div className="flex justify-between items-center">
                       <span className="text-sm text-gray-600">Household Income</span>
                       <span className="text-sm font-semibold">£52,400</span>
                     </div>
                     <div className="flex justify-between items-center">
                       <span className="text-sm text-gray-600">Employment Rate</span>
                       <span className="text-sm font-semibold">94.2%</span>
                     </div>
                     <div className="flex justify-between items-center">
                       <span className="text-sm text-gray-600">Crime Rate</span>
                       <span className="text-sm font-semibold text-green-600">Low</span>
                     </div>
                   </div>
                 </div>
               </Card>

               <Card>
                 <div className="p-6">
                   <h3 className="text-lg font-semibold text-gray-900 mb-4">Local Amenities</h3>
                   <div className="space-y-3">
                     <div className="flex items-center justify-between">
                       <div className="flex items-center">
                         <GraduationCap className="h-4 w-4 text-blue-600 mr-2" />
                         <span className="text-sm">Schools (Ofsted Good+)</span>
                       </div>
                       <span className="text-sm font-semibold">8 within 1 mile</span>
                     </div>
                     <div className="flex items-center justify-between">
                       <div className="flex items-center">
                         <Train className="h-4 w-4 text-green-600 mr-2" />
                         <span className="text-sm">Transport Links</span>
                       </div>
                       <span className="text-sm font-semibold">Excellent</span>
                     </div>
                     <div className="flex items-center justify-between">
                       <div className="flex items-center">
                         <ShoppingBag className="h-4 w-4 text-purple-600 mr-2" />
                         <span className="text-sm">Shopping Centers</span>
                       </div>
                       <span className="text-sm font-semibold">3 nearby</span>
                     </div>
                     <div className="flex items-center justify-between">
                       <div className="flex items-center">
                         <Heart className="h-4 w-4 text-red-600 mr-2" />
                         <span className="text-sm">Healthcare</span>
                       </div>
                       <span className="text-sm font-semibold">2 hospitals</span>
                     </div>
                   </div>
                 </div>
               </Card>
             </div>

             <Card>
               <div className="p-6">
                 <h3 className="text-lg font-semibold text-gray-900 mb-4">Development Plans</h3>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   <div className="bg-blue-50 p-4 rounded-lg">
                     <h4 className="font-semibold text-blue-900 mb-2">Transport Infrastructure</h4>
                     <p className="text-sm text-blue-700">New rail link planned for 2025, improving connectivity to central London.</p>
                   </div>
                   <div className="bg-green-50 p-4 rounded-lg">
                     <h4 className="font-semibold text-green-900 mb-2">Residential Development</h4>
                     <p className="text-sm text-green-700">450 new homes approved, increasing local housing supply.</p>
                   </div>
                   <div className="bg-purple-50 p-4 rounded-lg">
                     <h4 className="font-semibold text-purple-900 mb-2">Commercial Growth</h4>
                     <p className="text-sm text-purple-700">New business park creating 2,000 jobs by 2026.</p>
                   </div>
                 </div>
               </div>
             </Card>
           </div>
         )}

         {/* Comparables Tab */}
         {activeTab === 'comparables' && (
           <div className="space-y-6">
             <Card>
               <div className="p-6">
                 <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Sales Comparables</h3>
                 <div className="overflow-x-auto">
                   <table className="min-w-full divide-y divide-gray-200">
                     <thead className="bg-gray-50">
                       <tr>
                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bedrooms</th>
                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sale Price</th>
                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price/sqft</th>
                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sale Date</th>
                       </tr>
                     </thead>
                     <tbody className="bg-white divide-y divide-gray-200">
                       {[
                         { address: '15 Oak Street', type: 'Terraced', bedrooms: 3, price: 285000, pricePerSqft: 312, date: '2024-01-15' },
                         { address: '42 Maple Avenue', type: 'Semi-Detached', bedrooms: 4, price: 425000, pricePerSqft: 298, date: '2024-01-08' },
                         { address: '7 Pine Close', type: 'Detached', bedrooms: 5, price: 650000, pricePerSqft: 285, date: '2023-12-22' },
                         { address: '23 Birch Road', type: 'Terraced', bedrooms: 2, price: 245000, pricePerSqft: 325, date: '2023-12-18' }
                       ].map((property, index) => (
                         <tr key={index}>
                           <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{property.address}</td>
                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{property.type}</td>
                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{property.bedrooms}</td>
                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(property.price)}</td>
                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">£{property.pricePerSqft}</td>
                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(property.date).toLocaleDateString()}</td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                 </div>
               </div>
             </Card>

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               <Card>
                 <div className="p-6">
                   <h3 className="text-lg font-semibold text-gray-900 mb-4">Price Distribution</h3>
                   <div className="h-64">
                     <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={[
                         { range: '£200-250k', count: 12 },
                         { range: '£250-300k', count: 18 },
                         { range: '£300-350k', count: 25 },
                         { range: '£350-400k', count: 15 },
                         { range: '£400-450k', count: 8 },
                         { range: '£450k+', count: 5 }
                       ]}>
                         <CartesianGrid strokeDasharray="3 3" />
                         <XAxis dataKey="range" />
                         <YAxis />
                         <Tooltip />
                         <Bar dataKey="count" fill="#3B82F6" />
                       </BarChart>
                     </ResponsiveContainer>
                   </div>
                 </div>
               </Card>

               <Card>
                 <div className="p-6">
                   <h3 className="text-lg font-semibold text-gray-900 mb-4">Market Comparison</h3>
                   <div className="space-y-4">
                     <div className="flex justify-between items-center">
                       <span className="text-sm text-gray-600">Subject Property</span>
                       <span className="text-sm font-semibold">£325,000</span>
                     </div>
                     <div className="flex justify-between items-center">
                       <span className="text-sm text-gray-600">Average Comparable</span>
                       <span className="text-sm font-semibold">£315,000</span>
                     </div>
                     <div className="flex justify-between items-center">
                       <span className="text-sm text-gray-600">Market Premium</span>
                       <span className="text-sm font-semibold text-green-600">+3.2%</span>
                     </div>
                     <div className="flex justify-between items-center">
                       <span className="text-sm text-gray-600">Confidence Level</span>
                       <span className="text-sm font-semibold text-blue-600">High</span>
                     </div>
                   </div>
                 </div>
               </Card>
             </div>
           </div>
         )}

         {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search by area, city, or postcode..."
              value={areaFilter}
              onChange={(e) => setAreaFilter(e.target.value)}
              className="w-full"
            />
          </div>
          
          <div className="flex gap-3">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="PROPERTY_VALUATION">Property Valuation</option>
              <option value="MARKET_TRENDS">Market Trends</option>
              <option value="RENTAL_ANALYSIS">Rental Analysis</option>
              <option value="PRICE_COMPARISON">Price Comparison</option>
              <option value="DEMAND_ANALYSIS">Demand Analysis</option>
              <option value="INVESTMENT_ANALYSIS">Investment Analysis</option>
            </select>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="COMPLETED">Completed</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
              <option value="EXPIRED">Expired</option>
            </select>
          </div>
        </div>

        {/* Market Analysis Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {filteredData.map((analysis) => (
            <Card key={analysis.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => {
                    setSelectedAnalysis(analysis);
                    setShowAnalysisModal(true);
                  }}>
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {analysis.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(analysis.status)}`}>
                        {analysis.status.replace('_', ' ')}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-gray-600 text-sm mb-3">
                      <MapPin className="h-4 w-4 mr-1" />
                      {analysis.area}, {analysis.city} ({analysis.postcode})
                    </div>
                    
                    {analysis.propertyType && (
                      <div className="flex items-center text-gray-600 text-sm mb-3">
                        <Home className="h-4 w-4 mr-1" />
                        {analysis.bedrooms}-bed {analysis.propertyType}
                      </div>
                    )}
                  </div>
                  
                  {analysis.marketTrend && (
                    <div className="flex items-center gap-1">
                      {getTrendIcon(analysis.marketTrend)}
                      <span className="text-sm font-medium">
                        {analysis.marketTrend.toLowerCase()}
                      </span>
                    </div>
                  )}
                </div>

                {analysis.status === 'COMPLETED' && (
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {analysis.estimatedValue && (
                      <div>
                        <p className="text-sm font-medium text-gray-700">Estimated Value</p>
                        <p className="text-lg font-bold text-gray-900">
                          {formatCurrency(analysis.estimatedValue)}
                        </p>
                        {analysis.valuationRange && (
                          <p className="text-xs text-gray-600">
                            {formatCurrency(analysis.valuationRange.min)} - {formatCurrency(analysis.valuationRange.max)}
                          </p>
                        )}
                      </div>
                    )}
                    
                    {analysis.rentalValue && (
                      <div>
                        <p className="text-sm font-medium text-gray-700">Monthly Rent</p>
                        <p className="text-lg font-bold text-gray-900">
                          {formatCurrency(analysis.rentalValue)}
                        </p>
                        {analysis.rentalYield && (
                          <p className="text-xs text-gray-600">
                            {analysis.rentalYield.toFixed(1)}% yield
                          </p>
                        )}
                      </div>
                    )}
                    
                    {analysis.pricePerSqFt && (
                      <div>
                        <p className="text-sm font-medium text-gray-700">Price per sq ft</p>
                        <p className="text-lg font-bold text-gray-900">
                          {formatCurrency(analysis.pricePerSqFt)}
                        </p>
                      </div>
                    )}
                    
                    {analysis.demandScore && (
                      <div>
                        <p className="text-sm font-medium text-gray-700">Demand Score</p>
                        <p className="text-lg font-bold text-gray-900">
                          {analysis.demandScore}/100
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {analysis.status === 'IN_PROGRESS' && (
                  <div className="flex items-center gap-2 mb-4 text-blue-600">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Analysis in progress...</span>
                  </div>
                )}

                {analysis.priceChange && (
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-xs text-gray-600">Monthly</p>
                      <p className={`text-sm font-medium ${
                        analysis.priceChange.monthly > 0 ? 'text-green-600' : 
                        analysis.priceChange.monthly < 0 ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {formatPercentage(analysis.priceChange.monthly)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-600">Quarterly</p>
                      <p className={`text-sm font-medium ${
                        analysis.priceChange.quarterly > 0 ? 'text-green-600' : 
                        analysis.priceChange.quarterly < 0 ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {formatPercentage(analysis.priceChange.quarterly)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-600">Yearly</p>
                      <p className={`text-sm font-medium ${
                        analysis.priceChange.yearly > 0 ? 'text-green-600' : 
                        analysis.priceChange.yearly < 0 ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {formatPercentage(analysis.priceChange.yearly)}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="text-xs text-gray-500">
                    <div>Requested by {analysis.requestedBy}</div>
                    <div>{new Date(analysis.requestedAt).toLocaleDateString()}</div>
                  </div>
                  
                  {analysis.confidenceLevel && (
                    <div className="text-xs text-gray-600">
                      <span className="font-medium">{analysis.confidenceLevel}%</span> confidence
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredData.length === 0 && (
          <div className="text-center py-12">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No market analysis found
            </h3>
            <p className="text-gray-600 mb-4">
              No analyses match your current filters
            </p>
            <Button onClick={() => setShowNewAnalysisModal(true)}>
              Request New Analysis
            </Button>
          </div>
        )}

        {/* Property Comparisons */}
        {comparisons.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Property Comparisons</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {comparisons.map((comparison) => (
                <Card key={comparison.id} className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {comparison.address}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>{comparison.bedrooms} bed {comparison.propertyType}</span>
                        <span>•</span>
                        <span>{comparison.distance} miles away</span>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      comparison.status === 'SOLD' ? 'bg-green-100 text-green-800' :
                      comparison.status === 'UNDER_OFFER' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {comparison.status.replace('_', ' ')}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Price</p>
                      <p className="text-lg font-bold text-gray-900">
                        {formatCurrency(comparison.price)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Per sq ft</p>
                      <p className="text-lg font-bold text-gray-900">
                        {formatCurrency(comparison.pricePerSqFt)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>{comparison.similarity}% similar</span>
                    <span>{comparison.daysOnMarket} days on market</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* New Analysis Modal */}
      <Modal
        isOpen={showNewAnalysisModal}
        onClose={() => setShowNewAnalysisModal(false)}
        title="Request Market Analysis"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Analysis Type *
            </label>
            <select
              value={analysisForm.type}
              onChange={(e) => setAnalysisForm(prev => ({ ...prev, type: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="PROPERTY_VALUATION">Property Valuation</option>
              <option value="MARKET_TRENDS">Market Trends</option>
              <option value="RENTAL_ANALYSIS">Rental Analysis</option>
              <option value="PRICE_COMPARISON">Price Comparison</option>
              <option value="DEMAND_ANALYSIS">Demand Analysis</option>
              <option value="INVESTMENT_ANALYSIS">Investment Analysis</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Postcode *
            </label>
            <Input
              type="text"
              value={analysisForm.postcode}
              onChange={(e) => setAnalysisForm(prev => ({ ...prev, postcode: e.target.value.toUpperCase() }))}
              placeholder="e.g. SW1A 1AA"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Type
              </label>
              <select
                value={analysisForm.propertyType}
                onChange={(e) => setAnalysisForm(prev => ({ ...prev, propertyType: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="house">House</option>
                <option value="apartment">Apartment</option>
                <option value="flat">Flat</option>
                <option value="maisonette">Maisonette</option>
                <option value="bungalow">Bungalow</option>
                <option value="studio">Studio</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bedrooms
              </label>
              <Input
                type="number"
                value={analysisForm.bedrooms}
                onChange={(e) => setAnalysisForm(prev => ({ ...prev, bedrooms: parseInt(e.target.value) }))}
                min="1"
                max="10"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => setShowNewAnalysisModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitAnalysis}
              disabled={!analysisForm.postcode || submitting}
            >
              {submitting ? 'Requesting...' : 'Request Analysis'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MarketAnalysisPage;