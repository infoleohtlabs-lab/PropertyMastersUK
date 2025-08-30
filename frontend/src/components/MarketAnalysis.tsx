import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  MapPin,
  Calculator,
  Banknote,
  Home,
  Calendar,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Download,
  RefreshCw,
  Info,
  Star,
  Building,
  Users,
  Clock,
  Percent,
  LineChart
} from 'lucide-react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, Area, AreaChart } from 'recharts';
import { formatCurrency } from '../utils';

interface MarketData {
  area: string;
  averagePrice: number;
  priceChange: number;
  priceChangePercent: number;
  averageRent: number;
  rentYield: number;
  salesVolume: number;
  daysOnMarket: number;
  pricePerSqFt: number;
  demandLevel: 'low' | 'medium' | 'high' | 'very_high';
  supplyLevel: 'low' | 'medium' | 'high' | 'very_high';
  marketTrend: 'rising' | 'stable' | 'declining';
}

interface PriceTrendData {
  month: string;
  averagePrice: number;
  salesVolume: number;
  rentPrice: number;
}

interface PropertyTypeData {
  type: string;
  averagePrice: number;
  count: number;
  priceChange: number;
}

interface InvestmentMetrics {
  propertyPrice: number;
  monthlyRent: number;
  annualRent: number;
  grossYield: number;
  netYield: number;
  monthlyExpenses: number;
  annualExpenses: number;
  cashFlow: number;
  roi: number;
  paybackPeriod: number;
}

const MarketAnalysis: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'comparison' | 'calculator'>('overview');
  const [selectedArea, setSelectedArea] = useState<string>('london');
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('12m');
  const [calculatorInputs, setCalculatorInputs] = useState({
    propertyPrice: 500000,
    monthlyRent: 2500,
    monthlyExpenses: 500,
    deposit: 100000,
    mortgageRate: 4.5,
    mortgageTerm: 25
  });

  // Mock data - in production, this would come from APIs
  const marketData: MarketData[] = [
    {
      area: 'Central London',
      averagePrice: 850000,
      priceChange: 45000,
      priceChangePercent: 5.6,
      averageRent: 3200,
      rentYield: 4.5,
      salesVolume: 1250,
      daysOnMarket: 28,
      pricePerSqFt: 1200,
      demandLevel: 'very_high',
      supplyLevel: 'low',
      marketTrend: 'rising'
    },
    {
      area: 'East London',
      averagePrice: 520000,
      priceChange: 28000,
      priceChangePercent: 5.7,
      averageRent: 2100,
      rentYield: 4.8,
      salesVolume: 890,
      daysOnMarket: 32,
      pricePerSqFt: 750,
      demandLevel: 'high',
      supplyLevel: 'medium',
      marketTrend: 'rising'
    },
    {
      area: 'South London',
      averagePrice: 480000,
      priceChange: 15000,
      priceChangePercent: 3.2,
      averageRent: 1950,
      rentYield: 4.9,
      salesVolume: 720,
      daysOnMarket: 35,
      pricePerSqFt: 680,
      demandLevel: 'high',
      supplyLevel: 'medium',
      marketTrend: 'stable'
    },
    {
      area: 'West London',
      averagePrice: 720000,
      priceChange: 32000,
      priceChangePercent: 4.6,
      averageRent: 2800,
      rentYield: 4.7,
      salesVolume: 650,
      daysOnMarket: 30,
      pricePerSqFt: 950,
      demandLevel: 'very_high',
      supplyLevel: 'low',
      marketTrend: 'rising'
    },
    {
      area: 'North London',
      averagePrice: 580000,
      priceChange: 22000,
      priceChangePercent: 3.9,
      averageRent: 2300,
      rentYield: 4.8,
      salesVolume: 580,
      daysOnMarket: 33,
      pricePerSqFt: 780,
      demandLevel: 'high',
      supplyLevel: 'medium',
      marketTrend: 'rising'
    }
  ];

  const priceTrendData: PriceTrendData[] = [
    { month: 'Jan 2023', averagePrice: 480000, salesVolume: 850, rentPrice: 1900 },
    { month: 'Feb 2023', averagePrice: 485000, salesVolume: 920, rentPrice: 1920 },
    { month: 'Mar 2023', averagePrice: 490000, salesVolume: 1100, rentPrice: 1940 },
    { month: 'Apr 2023', averagePrice: 495000, salesVolume: 1250, rentPrice: 1960 },
    { month: 'May 2023', averagePrice: 500000, salesVolume: 1180, rentPrice: 1980 },
    { month: 'Jun 2023', averagePrice: 505000, salesVolume: 1320, rentPrice: 2000 },
    { month: 'Jul 2023', averagePrice: 510000, salesVolume: 1400, rentPrice: 2020 },
    { month: 'Aug 2023', averagePrice: 515000, salesVolume: 1350, rentPrice: 2040 },
    { month: 'Sep 2023', averagePrice: 518000, salesVolume: 1280, rentPrice: 2060 },
    { month: 'Oct 2023', averagePrice: 522000, salesVolume: 1150, rentPrice: 2080 },
    { month: 'Nov 2023', averagePrice: 525000, salesVolume: 980, rentPrice: 2100 },
    { month: 'Dec 2023', averagePrice: 530000, salesVolume: 890, rentPrice: 2120 }
  ];

  const propertyTypeData: PropertyTypeData[] = [
    { type: 'Flat/Apartment', averagePrice: 420000, count: 2850, priceChange: 4.2 },
    { type: 'Terraced House', averagePrice: 580000, count: 1650, priceChange: 3.8 },
    { type: 'Semi-Detached', averagePrice: 650000, count: 980, priceChange: 4.1 },
    { type: 'Detached House', averagePrice: 850000, count: 520, priceChange: 3.5 },
    { type: 'Bungalow', averagePrice: 480000, count: 280, priceChange: 2.9 }
  ];



  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-GB').format(num);
  };

  const formatPercentage = (num: number): string => {
    return `${num.toFixed(1)}%`;
  };

  const getDemandColor = (level: string): string => {
    switch (level) {
      case 'very_high': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'rising': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'declining': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <ArrowUpRight className="h-4 w-4 text-blue-600" />;
    }
  };

  const calculateInvestmentMetrics = (): InvestmentMetrics => {
    const { propertyPrice, monthlyRent, monthlyExpenses, deposit, mortgageRate, mortgageTerm } = calculatorInputs;
    
    const annualRent = monthlyRent * 12;
    const annualExpenses = monthlyExpenses * 12;
    const grossYield = (annualRent / propertyPrice) * 100;
    const netYield = ((annualRent - annualExpenses) / propertyPrice) * 100;
    const cashFlow = monthlyRent - monthlyExpenses;
    
    // Simplified mortgage calculation
    const loanAmount = propertyPrice - deposit;
    const monthlyRate = mortgageRate / 100 / 12;
    const numPayments = mortgageTerm * 12;
    const monthlyMortgage = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
    
    const netCashFlow = cashFlow - monthlyMortgage;
    const roi = deposit > 0 ? (netCashFlow * 12 / deposit) * 100 : 0;
    const paybackPeriod = deposit > 0 && netCashFlow > 0 ? deposit / (netCashFlow * 12) : 0;
    
    return {
      propertyPrice,
      monthlyRent,
      annualRent,
      grossYield,
      netYield,
      monthlyExpenses,
      annualExpenses,
      cashFlow: netCashFlow,
      roi,
      paybackPeriod
    };
  };

  const investmentMetrics = calculateInvestmentMetrics();

  const COLORS = ['#1E40AF', '#3B82F6', '#60A5FA', '#93C5FD', '#DBEAFE'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Market Analysis</h1>
          <p className="text-gray-600">Comprehensive property market insights and investment analysis</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="h-4 w-4" />
            Export Report
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <RefreshCw className="h-4 w-4" />
            Refresh Data
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Area</label>
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="london">Greater London</option>
              <option value="central">Central London</option>
              <option value="east">East London</option>
              <option value="west">West London</option>
              <option value="north">North London</option>
              <option value="south">South London</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Timeframe</label>
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="3m">Last 3 months</option>
              <option value="6m">Last 6 months</option>
              <option value="12m">Last 12 months</option>
              <option value="24m">Last 24 months</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Market Overview', icon: BarChart3 },
              { id: 'trends', label: 'Price Trends', icon: LineChart },
              { id: 'comparison', label: 'Area Comparison', icon: PieChart },
              { id: 'calculator', label: 'Investment Calculator', icon: Calculator }
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
          {/* Market Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Home className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-600">Avg Property Price</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{formatCurrency(580000)}</div>
                  <div className="flex items-center gap-1 text-sm text-green-600">
                    <TrendingUp className="h-4 w-4" />
                    +4.2% vs last year
                  </div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Banknote className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-green-600">Avg Rental Yield</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">4.7%</div>
                  <div className="flex items-center gap-1 text-sm text-green-600">
                    <TrendingUp className="h-4 w-4" />
                    +0.3% vs last year
                  </div>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-5 w-5 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-600">Days on Market</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">31</div>
                  <div className="flex items-center gap-1 text-sm text-red-600">
                    <TrendingDown className="h-4 w-4" />
                    -5 days vs last year
                  </div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="h-5 w-5 text-purple-600" />
                    <span className="text-sm font-medium text-purple-600">Sales Volume</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{formatNumber(5290)}</div>
                  <div className="flex items-center gap-1 text-sm text-green-600">
                    <TrendingUp className="h-4 w-4" />
                    +12% vs last year
                  </div>
                </div>
              </div>

              {/* Area Performance */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Area Performance</h3>
                <div className="space-y-4">
                  {marketData.map((area) => (
                    <div key={area.area} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <h4 className="font-semibold text-gray-900">{area.area}</h4>
                          {getTrendIcon(area.marketTrend)}
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getDemandColor(area.demandLevel)}`}>
                            {area.demandLevel.replace('_', ' ').toUpperCase()} DEMAND
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-900">{formatCurrency(area.averagePrice)}</div>
                          <div className={`text-sm ${area.priceChangePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {area.priceChangePercent >= 0 ? '+' : ''}{formatPercentage(area.priceChangePercent)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Avg Rent:</span>
                          <span className="ml-2 font-medium text-gray-900">{formatCurrency(area.averageRent)}/month</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Yield:</span>
                          <span className="ml-2 font-medium text-gray-900">{formatPercentage(area.rentYield)}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Sales Volume:</span>
                          <span className="ml-2 font-medium text-gray-900">{formatNumber(area.salesVolume)}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Price/sq ft:</span>
                          <span className="ml-2 font-medium text-gray-900">£{formatNumber(area.pricePerSqFt)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Price Trends Tab */}
          {activeTab === 'trends' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Price Trend Chart */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Average Property Prices</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={priceTrendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip formatter={(value) => [formatCurrency(value as number), 'Price']} />
                      <Area type="monotone" dataKey="averagePrice" stroke="#1E40AF" fill="#3B82F6" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Sales Volume Chart */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Volume</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={priceTrendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip formatter={(value) => [formatNumber(value as number), 'Sales']} />
                      <Bar dataKey="salesVolume" fill="#10B981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Rental Price Trends */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Rental Price Trends</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsLineChart data={priceTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(value) => [formatCurrency(value as number), 'Rent']} />
                    <Line type="monotone" dataKey="rentPrice" stroke="#F59E0B" strokeWidth={3} />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Area Comparison Tab */}
          {activeTab === 'comparison' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Property Type Distribution */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Type Distribution</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={propertyTypeData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="count"
                        label={({ type, percent }) => `${type} ${(percent * 100).toFixed(0)}%`}
                      >
                        {propertyTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [formatNumber(value as number), 'Properties']} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>

                {/* Price by Property Type */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Average Price by Property Type</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={propertyTypeData} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" tick={{ fontSize: 12 }} />
                      <YAxis dataKey="type" type="category" tick={{ fontSize: 12 }} width={100} />
                      <Tooltip formatter={(value) => [formatCurrency(value as number), 'Avg Price']} />
                      <Bar dataKey="averagePrice" fill="#6366F1" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Detailed Comparison Table */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Area Comparison</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Area</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price Change</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rental Yield</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Days on Market</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Demand Level</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {marketData.map((area) => (
                        <tr key={area.area} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-gray-400" />
                              <span className="font-medium text-gray-900">{area.area}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(area.averagePrice)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`flex items-center gap-1 text-sm ${
                              area.priceChangePercent >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {area.priceChangePercent >= 0 ? (
                                <TrendingUp className="h-4 w-4" />
                              ) : (
                                <TrendingDown className="h-4 w-4" />
                              )}
                              {area.priceChangePercent >= 0 ? '+' : ''}{formatPercentage(area.priceChangePercent)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatPercentage(area.rentYield)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {area.daysOnMarket} days
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getDemandColor(area.demandLevel)}`}>
                              {area.demandLevel.replace('_', ' ').toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Investment Calculator Tab */}
          {activeTab === 'calculator' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Calculator Inputs */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Investment Parameters</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Property Price (£)
                      </label>
                      <input
                        type="number"
                        value={calculatorInputs.propertyPrice}
                        onChange={(e) => setCalculatorInputs({...calculatorInputs, propertyPrice: parseInt(e.target.value) || 0})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Monthly Rent (£)
                      </label>
                      <input
                        type="number"
                        value={calculatorInputs.monthlyRent}
                        onChange={(e) => setCalculatorInputs({...calculatorInputs, monthlyRent: parseInt(e.target.value) || 0})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Monthly Expenses (£)
                      </label>
                      <input
                        type="number"
                        value={calculatorInputs.monthlyExpenses}
                        onChange={(e) => setCalculatorInputs({...calculatorInputs, monthlyExpenses: parseInt(e.target.value) || 0})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Deposit (£)
                      </label>
                      <input
                        type="number"
                        value={calculatorInputs.deposit}
                        onChange={(e) => setCalculatorInputs({...calculatorInputs, deposit: parseInt(e.target.value) || 0})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mortgage Rate (%)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={calculatorInputs.mortgageRate}
                        onChange={(e) => setCalculatorInputs({...calculatorInputs, mortgageRate: parseFloat(e.target.value) || 0})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mortgage Term (years)
                      </label>
                      <input
                        type="number"
                        value={calculatorInputs.mortgageTerm}
                        onChange={(e) => setCalculatorInputs({...calculatorInputs, mortgageTerm: parseInt(e.target.value) || 0})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Calculator Results */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Investment Analysis</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="text-sm text-blue-600 font-medium">Gross Yield</div>
                        <div className="text-2xl font-bold text-gray-900">{formatPercentage(investmentMetrics.grossYield)}</div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4">
                        <div className="text-sm text-green-600 font-medium">Net Yield</div>
                        <div className="text-2xl font-bold text-gray-900">{formatPercentage(investmentMetrics.netYield)}</div>
                      </div>
                    </div>
                    
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Annual Rental Income:</span>
                        <span className="font-medium text-gray-900">{formatCurrency(investmentMetrics.annualRent)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Annual Expenses:</span>
                        <span className="font-medium text-gray-900">{formatCurrency(investmentMetrics.annualExpenses)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Monthly Cash Flow:</span>
                        <span className={`font-medium ${
                          investmentMetrics.cashFlow >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatCurrency(investmentMetrics.cashFlow)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">ROI on Deposit:</span>
                        <span className={`font-medium ${
                          investmentMetrics.roi >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatPercentage(investmentMetrics.roi)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Payback Period:</span>
                        <span className="font-medium text-gray-900">
                          {investmentMetrics.paybackPeriod > 0 ? `${investmentMetrics.paybackPeriod.toFixed(1)} years` : 'N/A'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-gray-900 mb-1">Investment Summary</h4>
                          <p className="text-sm text-gray-600">
                            {investmentMetrics.roi >= 8 ? (
                              "Excellent investment opportunity with strong returns."
                            ) : investmentMetrics.roi >= 5 ? (
                              "Good investment potential with reasonable returns."
                            ) : investmentMetrics.roi >= 2 ? (
                              "Moderate investment with average returns."
                            ) : (
                              "Consider reviewing the investment parameters."
                            )}
                          </p>
                        </div>
                      </div>
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

export default MarketAnalysis;