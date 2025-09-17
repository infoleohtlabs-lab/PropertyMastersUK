import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, TrendingDown, Minus, Search, Calendar, PoundSterling } from 'lucide-react';
import { PricePaidRecord, TransactionHistory, formatPrice, formatDate, calculatePriceChange } from '@/types/land-registry';

interface PriceHistoryChartProps {
  postcode?: string;
  titleNumber?: string;
  onDataLoaded?: (data: TransactionHistory) => void;
}

interface ChartDataPoint {
  date: string;
  price: number;
  formattedDate: string;
  formattedPrice: string;
  propertyType: string;
}

type ChartType = 'line' | 'bar';
type TimeRange = 'all' | '1y' | '3y' | '5y' | '10y';

export const PriceHistoryChart: React.FC<PriceHistoryChartProps> = ({
  postcode: initialPostcode,
  titleNumber: initialTitleNumber,
  onDataLoaded
}) => {
  const [postcode, setPostcode] = useState(initialPostcode || '');
  const [titleNumber, setTitleNumber] = useState(initialTitleNumber || '');
  const [transactionHistory, setTransactionHistory] = useState<TransactionHistory | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chartType, setChartType] = useState<ChartType>('line');
  const [timeRange, setTimeRange] = useState<TimeRange>('all');

  const searchPriceHistory = async () => {
    if (!postcode.trim() && !titleNumber.trim()) {
      setError('Please enter either a postcode or title number');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (postcode.trim()) params.append('postcode', postcode.trim());
      if (titleNumber.trim()) params.append('title_number', titleNumber.trim());
      
      const response = await fetch(`/api/land-registry/price-history?${params}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch price history: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setTransactionHistory(result.data);
        processChartData(result.data.transactions);
        onDataLoaded?.(result.data);
      } else {
        throw new Error(result.error?.message || 'Failed to fetch price history');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setTransactionHistory(null);
      setChartData([]);
    } finally {
      setLoading(false);
    }
  };

  const processChartData = (transactions: PricePaidRecord[]) => {
    const filteredTransactions = filterTransactionsByTimeRange(transactions);
    
    const data: ChartDataPoint[] = filteredTransactions
      .sort((a, b) => new Date(a.date_of_transfer).getTime() - new Date(b.date_of_transfer).getTime())
      .map(transaction => ({
        date: transaction.date_of_transfer,
        price: transaction.price,
        formattedDate: formatDate(transaction.date_of_transfer),
        formattedPrice: formatPrice(transaction.price),
        propertyType: getPropertyTypeLabel(transaction.property_type)
      }));
    
    setChartData(data);
  };

  const filterTransactionsByTimeRange = (transactions: PricePaidRecord[]): PricePaidRecord[] => {
    if (timeRange === 'all') return transactions;
    
    const now = new Date();
    const cutoffDate = new Date();
    
    switch (timeRange) {
      case '1y':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
      case '3y':
        cutoffDate.setFullYear(now.getFullYear() - 3);
        break;
      case '5y':
        cutoffDate.setFullYear(now.getFullYear() - 5);
        break;
      case '10y':
        cutoffDate.setFullYear(now.getFullYear() - 10);
        break;
    }
    
    return transactions.filter(t => new Date(t.date_of_transfer) >= cutoffDate);
  };

  const getPropertyTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      'D': 'Detached',
      'S': 'Semi-detached',
      'T': 'Terraced',
      'F': 'Flat',
      'O': 'Other'
    };
    return labels[type] || 'Unknown';
  };

  const getTrendIcon = (direction: 'up' | 'down' | 'stable') => {
    switch (direction) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTrendColor = (direction: 'up' | 'down' | 'stable') => {
    switch (direction) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  useEffect(() => {
    if (transactionHistory) {
      processChartData(transactionHistory.transactions);
    }
  }, [timeRange, transactionHistory]);

  useEffect(() => {
    if ((initialPostcode || initialTitleNumber)) {
      searchPriceHistory();
    }
  }, [initialPostcode, initialTitleNumber]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{data.formattedDate}</p>
          <p className="text-lg font-bold text-blue-600">{data.formattedPrice}</p>
          <p className="text-sm text-gray-600">{data.propertyType}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Price History Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="postcode">Postcode</Label>
              <Input
                id="postcode"
                placeholder="e.g., SW1A 1AA"
                value={postcode}
                onChange={(e) => setPostcode(e.target.value.toUpperCase())}
                disabled={loading}
              />
            </div>
            <div>
              <Label htmlFor="titleNumber">Title Number (Optional)</Label>
              <Input
                id="titleNumber"
                placeholder="e.g., ABC123456"
                value={titleNumber}
                onChange={(e) => setTitleNumber(e.target.value.toUpperCase())}
                disabled={loading}
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={searchPriceHistory} 
                disabled={loading || (!postcode.trim() && !titleNumber.trim())}
                className="w-full"
              >
                {loading ? 'Searching...' : 'Search'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {transactionHistory && !loading && (
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <PoundSterling className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-600">Total Transactions</span>
                </div>
                <p className="text-2xl font-bold">{transactionHistory.total_transactions}</p>
              </CardContent>
            </Card>
            
            {transactionHistory.price_trend.current_value && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-600">Latest Price</span>
                  </div>
                  <p className="text-2xl font-bold">
                    {formatPrice(transactionHistory.price_trend.current_value)}
                  </p>
                </CardContent>
              </Card>
            )}
            
            {transactionHistory.price_trend.change_percentage !== undefined && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    {getTrendIcon(transactionHistory.price_trend.trend_direction)}
                    <span className="text-sm font-medium text-gray-600">Price Change</span>
                  </div>
                  <p className={`text-2xl font-bold ${getTrendColor(transactionHistory.price_trend.trend_direction)}`}>
                    {transactionHistory.price_trend.change_percentage > 0 ? '+' : ''}
                    {transactionHistory.price_trend.change_percentage.toFixed(1)}%
                  </p>
                </CardContent>
              </Card>
            )}
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-600">Trend</span>
                </div>
                <Badge 
                  variant={transactionHistory.price_trend.trend_direction === 'up' ? 'default' : 
                          transactionHistory.price_trend.trend_direction === 'down' ? 'destructive' : 'secondary'}
                  className="text-sm"
                >
                  {transactionHistory.price_trend.trend_direction.toUpperCase()}
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* Chart Controls */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2">
                  <Label>Chart Type:</Label>
                  <Select value={chartType} onValueChange={(value: ChartType) => setChartType(value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="line">Line Chart</SelectItem>
                      <SelectItem value="bar">Bar Chart</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center gap-2">
                  <Label>Time Range:</Label>
                  <Select value={timeRange} onValueChange={(value: TimeRange) => setTimeRange(value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="1y">1 Year</SelectItem>
                      <SelectItem value="3y">3 Years</SelectItem>
                      <SelectItem value="5y">5 Years</SelectItem>
                      <SelectItem value="10y">10 Years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Price History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === 'line' ? (
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="formattedDate" 
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis 
                        tickFormatter={(value) => formatPrice(value)}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Line 
                        type="monotone" 
                        dataKey="price" 
                        stroke="#2563eb" 
                        strokeWidth={2}
                        dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  ) : (
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="formattedDate" 
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis 
                        tickFormatter={(value) => formatPrice(value)}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="price" fill="#2563eb" />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default PriceHistoryChart;