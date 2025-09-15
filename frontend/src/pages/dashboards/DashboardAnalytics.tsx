import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Users, Home, Calendar, DollarSign, Download, Filter } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { UserRole } from '../../types/auth';

interface AnalyticsData {
  monthlyRevenue: Array<{ month: string; revenue: number; expenses: number; profit: number }>;
  propertyPerformance: Array<{ property: string; occupancy: number; revenue: number }>;
  tenantDemographics: Array<{ name: string; value: number; color: string }>;
  marketTrends: Array<{ month: string; averageRent: number; marketRate: number }>;
}

interface KPIMetrics {
  totalProperties: number;
  occupancyRate: number;
  averageRent: number;
  totalTenants: number;
  monthlyRevenue: number;
  maintenanceRequests: number;
  portfolioValue: number;
  roi: number;
}

const DashboardAnalytics: React.FC = () => {
  const { user } = useAuthStore();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [kpiMetrics, setKpiMetrics] = useState<KPIMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<string>('6months');
  const [selectedMetric, setSelectedMetric] = useState<string>('revenue');

  useEffect(() => {
    // Simulate API call
    const fetchAnalyticsData = async () => {
      setLoading(true);
      
      // Mock analytics data
      const mockAnalyticsData: AnalyticsData = {
        monthlyRevenue: [
          { month: 'Aug', revenue: 12500, expenses: 3200, profit: 9300 },
          { month: 'Sep', revenue: 13200, expenses: 2800, profit: 10400 },
          { month: 'Oct', revenue: 12800, expenses: 3500, profit: 9300 },
          { month: 'Nov', revenue: 14100, expenses: 2900, profit: 11200 },
          { month: 'Dec', revenue: 13800, expenses: 3100, profit: 10700 },
          { month: 'Jan', revenue: 15200, expenses: 3400, profit: 11800 }
        ],
        propertyPerformance: [
          { property: 'Modern 2-Bed Apartment', occupancy: 95, revenue: 2500 },
          { property: 'Victorian Terrace House', occupancy: 100, revenue: 1800 },
          { property: 'Studio Flat City Center', occupancy: 85, revenue: 950 },
          { property: 'Luxury Penthouse', occupancy: 90, revenue: 3200 },
          { property: 'Family House Suburbs', occupancy: 100, revenue: 2100 }
        ],
        tenantDemographics: [
          { name: 'Young Professionals', value: 45, color: '#3B82F6' },
          { name: 'Families', value: 30, color: '#10B981' },
          { name: 'Students', value: 15, color: '#F59E0B' },
          { name: 'Retirees', value: 10, color: '#EF4444' }
        ],
        marketTrends: [
          { month: 'Aug', averageRent: 1850, marketRate: 1900 },
          { month: 'Sep', averageRent: 1875, marketRate: 1920 },
          { month: 'Oct', averageRent: 1900, marketRate: 1940 },
          { month: 'Nov', averageRent: 1925, marketRate: 1960 },
          { month: 'Dec', averageRent: 1950, marketRate: 1980 },
          { month: 'Jan', averageRent: 1975, marketRate: 2000 }
        ]
      };

      // Mock KPI metrics
      const mockKpiMetrics: KPIMetrics = {
        totalProperties: 12,
        occupancyRate: 92.5,
        averageRent: 1975,
        totalTenants: 28,
        monthlyRevenue: 15200,
        maintenanceRequests: 3,
        portfolioValue: 2850000,
        roi: 8.7
      };

      setAnalyticsData(mockAnalyticsData);
      setKpiMetrics(mockKpiMetrics);
      setLoading(false);
    };

    fetchAnalyticsData();
  }, [timeRange]);

  const canViewAnalytics = user?.role === UserRole.ADMIN || user?.role === UserRole.AGENT || user?.role === UserRole.LANDLORD;

  if (!canViewAnalytics) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 mb-4">Access denied</div>
        <p className="text-sm text-gray-400">You don't have permission to view analytics data.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics &amp; Reports</h1>
          <p className="text-gray-600">Insights into your property portfolio performance</p>
        </div>
        <div className="flex gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
            <option value="year">Last Year</option>
            <option value="2years">Last 2 Years</option>
          </select>
          <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Download className="h-5 w-5 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* KPI Metrics */}
      {kpiMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Properties</p>
                <p className="text-2xl font-semibold text-gray-900">{kpiMetrics.totalProperties}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Home className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-500">+2</span>
              <span className="text-gray-500 ml-1">this quarter</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Occupancy Rate</p>
                <p className="text-2xl font-semibold text-gray-900">{kpiMetrics.occupancyRate}%</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-500">+3.2%</span>
              <span className="text-gray-500 ml-1">from last month</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Rent</p>
                <p className="text-2xl font-semibold text-gray-900">£{kpiMetrics.averageRent.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-500">+5.1%</span>
              <span className="text-gray-500 ml-1">from last month</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">ROI</p>
                <p className="text-2xl font-semibold text-gray-900">{kpiMetrics.roi}%</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-500">+0.8%</span>
              <span className="text-gray-500 ml-1">from last quarter</span>
            </div>
          </div>
        </div>
      )}

      {/* Charts Section */}
      {analyticsData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Revenue Trends</h3>
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="revenue">Revenue</option>
                <option value="profit">Profit</option>
                <option value="expenses">Expenses</option>
              </select>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData.monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`£${value}`, selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)]} />
                <Line 
                  type="monotone" 
                  dataKey={selectedMetric} 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Tenant Demographics */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Tenant Demographics</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analyticsData.tenantDemographics}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {analyticsData.tenantDemographics.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Property Performance */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Property Performance</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.propertyPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="property" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  interval={0}
                />
                <YAxis yAxisId="left" orientation="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Bar yAxisId="left" dataKey="occupancy" fill="#10B981" name="Occupancy %" />
                <Bar yAxisId="right" dataKey="revenue" fill="#3B82F6" name="Revenue £" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Market Trends */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Market Comparison</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData.marketTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`£${value}`, '']} />
                <Line 
                  type="monotone" 
                  dataKey="averageRent" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  name="Your Average Rent"
                />
                <Line 
                  type="monotone" 
                  dataKey="marketRate" 
                  stroke="#EF4444" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Market Rate"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Additional Metrics */}
      {kpiMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tenants</p>
                <p className="text-2xl font-semibold text-gray-900">{kpiMetrics.totalTenants}</p>
              </div>
              <div className="p-3 bg-indigo-100 rounded-full">
                <Users className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                <p className="text-2xl font-semibold text-gray-900">£{kpiMetrics.monthlyRevenue.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Maintenance Requests</p>
                <p className="text-2xl font-semibold text-gray-900">{kpiMetrics.maintenanceRequests}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Portfolio Value</p>
                <p className="text-2xl font-semibold text-gray-900">£{(kpiMetrics.portfolioValue / 1000000).toFixed(1)}M</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardAnalytics;