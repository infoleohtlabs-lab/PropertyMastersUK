import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { TrendingUp, TrendingDown, BarChart3, PieChart, MapPin, Calendar } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell } from 'recharts';

interface MarketTrend {
  month: string;
  averagePrice: number;
  salesVolume: number;
  priceChange: number;
}

interface PropertyType {
  type: string;
  averagePrice: number;
  marketShare: number;
  priceChange: number;
}

interface AreaData {
  area: string;
  averagePrice: number;
  pricePerSqFt: number;
  demandLevel: 'High' | 'Medium' | 'Low';
  priceChange: number;
}

const MarketAnalysis: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'trends' | 'areas' | 'types' | 'forecast'>('trends');
  const [selectedPeriod, setSelectedPeriod] = useState<'6m' | '1y' | '2y' | '5y'>('1y');
  const [loading, setLoading] = useState(true);

  // Mock data
  const marketTrends: MarketTrend[] = [
    { month: 'Jan 2024', averagePrice: 285000, salesVolume: 1250, priceChange: 2.1 },
    { month: 'Feb 2024', averagePrice: 287500, salesVolume: 1180, priceChange: 0.9 },
    { month: 'Mar 2024', averagePrice: 292000, salesVolume: 1320, priceChange: 1.6 },
    { month: 'Apr 2024', averagePrice: 295000, salesVolume: 1450, priceChange: 1.0 },
    { month: 'May 2024', averagePrice: 298500, salesVolume: 1380, priceChange: 1.2 },
    { month: 'Jun 2024', averagePrice: 301000, salesVolume: 1420, priceChange: 0.8 },
    { month: 'Jul 2024', averagePrice: 304500, salesVolume: 1350, priceChange: 1.2 },
    { month: 'Aug 2024', averagePrice: 307000, salesVolume: 1280, priceChange: 0.8 },
    { month: 'Sep 2024', averagePrice: 310000, salesVolume: 1400, priceChange: 1.0 },
    { month: 'Oct 2024', averagePrice: 312500, salesVolume: 1320, priceChange: 0.8 },
    { month: 'Nov 2024', averagePrice: 315000, salesVolume: 1250, priceChange: 0.8 },
    { month: 'Dec 2024', averagePrice: 318000, salesVolume: 1180, priceChange: 1.0 }
  ];

  const propertyTypes: PropertyType[] = [
    { type: 'Detached', averagePrice: 485000, marketShare: 25, priceChange: 3.2 },
    { type: 'Semi-Detached', averagePrice: 325000, marketShare: 35, priceChange: 2.8 },
    { type: 'Terraced', averagePrice: 245000, marketShare: 28, priceChange: 2.1 },
    { type: 'Flat/Apartment', averagePrice: 195000, marketShare: 12, priceChange: 1.5 }
  ];

  const areaData: AreaData[] = [
    { area: 'Central London', averagePrice: 650000, pricePerSqFt: 850, demandLevel: 'High', priceChange: 4.2 },
    { area: 'North London', averagePrice: 485000, pricePerSqFt: 620, demandLevel: 'High', priceChange: 3.8 },
    { area: 'South London', averagePrice: 425000, pricePerSqFt: 580, demandLevel: 'Medium', priceChange: 2.9 },
    { area: 'East London', averagePrice: 395000, pricePerSqFt: 520, demandLevel: 'High', priceChange: 3.5 },
    { area: 'West London', averagePrice: 520000, pricePerSqFt: 680, demandLevel: 'Medium', priceChange: 2.2 },
    { area: 'Manchester', averagePrice: 285000, pricePerSqFt: 320, demandLevel: 'High', priceChange: 5.1 },
    { area: 'Birmingham', averagePrice: 245000, pricePerSqFt: 280, demandLevel: 'Medium', priceChange: 4.2 },
    { area: 'Leeds', averagePrice: 225000, pricePerSqFt: 260, demandLevel: 'Medium', priceChange: 3.8 }
  ];

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const getDemandColor = (level: string) => {
    switch (level) {
      case 'High': return 'text-green-600 bg-green-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Low': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Market Analysis</h1>
        <p className="mt-2 text-gray-600">Comprehensive property market insights and trends</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Property Price</p>
              <p className="text-2xl font-bold text-gray-900">{formatPrice(318000)}</p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <TrendingUp className="h-4 w-4 mr-1" />
                +1.0% from last month
              </p>
            </div>
            <BarChart3 className="h-8 w-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Sales Volume</p>
              <p className="text-2xl font-bold text-gray-900">1,180</p>
              <p className="text-sm text-red-600 flex items-center mt-1">
                <TrendingDown className="h-4 w-4 mr-1" />
                -5.6% from last month
              </p>
            </div>
            <PieChart className="h-8 w-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Market Activity</p>
              <p className="text-2xl font-bold text-gray-900">High</p>
              <p className="text-sm text-blue-600 flex items-center mt-1">
                <MapPin className="h-4 w-4 mr-1" />
                London &amp; Manchester leading
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-600" />
          </div>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'trends', label: 'Price Trends', icon: TrendingUp },
            { id: 'areas', label: 'Area Analysis', icon: MapPin },
            { id: 'types', label: 'Property Types', icon: PieChart },
            { id: 'forecast', label: 'Market Forecast', icon: Calendar }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Price Trends Tab */}
      {activeTab === 'trends' && (
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Property Price Trends</h3>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as any)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm text-black"
              >
                <option value="6m">Last 6 Months</option>
                <option value="1y">Last Year</option>
                <option value="2y">Last 2 Years</option>
                <option value="5y">Last 5 Years</option>
              </select>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={marketTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => [formatPrice(value), 'Average Price']} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="averagePrice" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    name="Average Price"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-6">Sales Volume Trends</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={marketTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="salesVolume" fill="#10B981" name="Sales Volume" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}

      {/* Area Analysis Tab */}
      {activeTab === 'areas' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-6">Area Performance</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Area</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Average Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price per Sq Ft</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Demand Level</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price Change</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {areaData.map((area, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{area.area}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatPrice(area.averagePrice)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">£{area.pricePerSqFt}/sq ft</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getDemandColor(area.demandLevel)}`}>
                          {area.demandLevel}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                        +{area.priceChange}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Property Types Tab */}
      {activeTab === 'types' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-6">Market Share by Property Type</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={propertyTypes}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ type, marketShare }) => `${type}: ${marketShare}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="marketShare"
                    >
                      {propertyTypes.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-6">Average Prices by Type</h3>
              <div className="space-y-4">
                {propertyTypes.map((type, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      ></div>
                      <span className="font-medium text-gray-900">{type.type}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatPrice(type.averagePrice)}</p>
                      <p className="text-sm text-green-600">+{type.priceChange}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Market Forecast Tab */}
      {activeTab === 'forecast' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-6">Market Forecast</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Next 12 Months Prediction</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="text-gray-700">Price Growth</span>
                    <span className="font-semibold text-green-600">+8.5%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="text-gray-700">Sales Volume</span>
                    <span className="font-semibold text-blue-600">+12.3%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                    <span className="text-gray-700">Market Activity</span>
                    <span className="font-semibold text-purple-600">High</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Key Market Drivers</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">Low interest rates supporting demand</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">Government housing initiatives</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">Limited housing supply</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">Regional economic growth</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default MarketAnalysis;