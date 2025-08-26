import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import {
  FileText, Download, Upload, Settings, RefreshCw, Eye, TrendingUp, TrendingDown,
  BarChart3, PieChart, LineChart, Calendar, Filter, Search, Plus, AlertTriangle,
  CheckCircle, Clock, XCircle, Users, Home, Wrench, Banknote, Target, Award,
  Calculator, Percent, Building, CreditCard, Receipt, Wallet,
  ArrowUpRight, ArrowDownRight, Activity, Zap, Bell, Mail, Share2
} from 'lucide-react';

interface Report {
  id: string;
  name: string;
  type: 'FINANCIAL' | 'PROPERTY' | 'TENANT' | 'MAINTENANCE' | 'MARKETING' | 'COMPLIANCE' | 'CUSTOM';
  description: string;
  category: string;
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'ON_DEMAND';
  format: 'PDF' | 'EXCEL' | 'CSV' | 'JSON';
  status: 'ACTIVE' | 'INACTIVE' | 'SCHEDULED' | 'GENERATING' | 'COMPLETED' | 'FAILED';
  lastGenerated?: string;
  nextScheduled?: string;
  recipients: string[];
  parameters?: {
    dateRange?: {
      start: string;
      end: string;
    };
    properties?: string[];
    tenants?: string[];
    categories?: string[];
    filters?: Record<string, any>;
  };
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface AnalyticsData {
  id: string;
  metric: string;
  value: number;
  previousValue?: number;
  change?: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  period: string;
  category: string;
  description: string;
  trend: number[];
  target?: number;
  unit: string;
  color: string;
}

interface ChartData {
  id: string;
  title: string;
  type: 'line' | 'bar' | 'pie' | 'area' | 'donut';
  data: any[];
  xAxis?: string;
  yAxis?: string;
  categories?: string[];
  colors?: string[];
  description: string;
}

const ReportsAnalytics: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData[]>([]);
  const [charts, setCharts] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'reports' | 'analytics' | 'custom'>('dashboard');
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [showReportModal, setShowReportModal] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [showCustomReportModal, setShowCustomReportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [exportFormat, setExportFormat] = useState('PDF');
  const [reportFilters, setReportFilters] = useState({
    dateRange: 'last_month',
    propertyType: 'all',
    includeComparisons: true,
    includeCharts: true,
    includeRecommendations: true
  });
  const [automationSettings, setAutomationSettings] = useState({
    enabled: false,
    frequency: 'monthly',
    recipients: [''],
    nextRun: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock data - replace with API calls
  useEffect(() => {
    const mockReports: Report[] = [
      {
        id: '1',
        name: 'Monthly Financial Summary',
        type: 'FINANCIAL',
        description: 'Comprehensive monthly financial report including rent collection, expenses, and profit/loss',
        category: 'Finance',
        frequency: 'MONTHLY',
        format: 'PDF',
        status: 'ACTIVE',
        lastGenerated: '2024-01-01T00:00:00Z',
        nextScheduled: '2024-02-01T00:00:00Z',
        recipients: ['finance@propertymastersuk.com', 'admin@propertymastersuk.com'],
        parameters: {
          dateRange: {
            start: '2024-01-01',
            end: '2024-01-31',
          },
        },
        createdBy: 'admin',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      {
        id: '2',
        name: 'Property Performance Report',
        type: 'PROPERTY',
        description: 'Detailed analysis of property performance including occupancy rates, rental yields, and maintenance costs',
        category: 'Property Management',
        frequency: 'QUARTERLY',
        format: 'EXCEL',
        status: 'ACTIVE',
        lastGenerated: '2024-01-01T00:00:00Z',
        nextScheduled: '2024-04-01T00:00:00Z',
        recipients: ['property@propertymastersuk.com'],
        createdBy: 'property_manager',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      {
        id: '3',
        name: 'Tenant Satisfaction Survey',
        type: 'TENANT',
        description: 'Analysis of tenant feedback and satisfaction scores',
        category: 'Tenant Relations',
        frequency: 'QUARTERLY',
        format: 'PDF',
        status: 'COMPLETED',
        lastGenerated: '2024-01-15T00:00:00Z',
        nextScheduled: '2024-04-15T00:00:00Z',
        recipients: ['tenant@propertymastersuk.com', 'admin@propertymastersuk.com'],
        createdBy: 'tenant_manager',
        createdAt: '2023-06-01T00:00:00Z',
        updatedAt: '2024-01-15T00:00:00Z',
      },
      {
        id: '4',
        name: 'Maintenance Cost Analysis',
        type: 'MAINTENANCE',
        description: 'Breakdown of maintenance costs by property and category',
        category: 'Maintenance',
        frequency: 'MONTHLY',
        format: 'CSV',
        status: 'GENERATING',
        lastGenerated: '2023-12-01T00:00:00Z',
        nextScheduled: '2024-02-01T00:00:00Z',
        recipients: ['maintenance@propertymastersuk.com'],
        createdBy: 'maintenance_manager',
        createdAt: '2023-03-01T00:00:00Z',
        updatedAt: '2024-01-16T00:00:00Z',
      },
      {
        id: '5',
        name: 'Marketing Performance Dashboard',
        type: 'MARKETING',
        description: 'Analysis of marketing campaigns, lead generation, and conversion rates',
        category: 'Marketing',
        frequency: 'WEEKLY',
        format: 'PDF',
        status: 'ACTIVE',
        lastGenerated: '2024-01-15T00:00:00Z',
        nextScheduled: '2024-01-22T00:00:00Z',
        recipients: ['marketing@propertymastersuk.com'],
        createdBy: 'marketing_manager',
        createdAt: '2023-09-01T00:00:00Z',
        updatedAt: '2024-01-15T00:00:00Z',
      },
    ];

    const mockAnalytics: AnalyticsData[] = [
      {
        id: '1',
        metric: 'Total Revenue',
        value: 125000,
        previousValue: 118000,
        change: 5.9,
        changeType: 'increase',
        period: 'Last 30 days',
        category: 'Financial',
        description: 'Total rental income and fees collected',
        trend: [110000, 112000, 115000, 118000, 120000, 125000],
        target: 130000,
        unit: '£',
        color: '#10B981',
      },
      {
        id: '2',
        metric: 'Net Profit',
        value: 89250,
        previousValue: 77500,
        change: 15.2,
        changeType: 'increase',
        period: 'Last 30 days',
        category: 'Financial',
        description: 'Net profit after all expenses',
        trend: [70000, 72000, 75000, 77500, 85000, 89250],
        target: 95000,
        unit: '£',
        color: '#059669',
      },
      {
        id: '3',
        metric: 'Gross Yield',
        value: 6.8,
        previousValue: 6.4,
        change: 6.3,
        changeType: 'increase',
        period: 'Annual',
        category: 'Financial',
        description: 'Gross rental yield percentage',
        trend: [6.0, 6.1, 6.2, 6.4, 6.6, 6.8],
        target: 7.5,
        unit: '%',
        color: '#0D9488',
      },
      {
        id: '4',
        metric: 'Net Yield',
        value: 4.9,
        previousValue: 4.6,
        change: 6.5,
        changeType: 'increase',
        period: 'Annual',
        category: 'Financial',
        description: 'Net rental yield after expenses',
        trend: [4.2, 4.3, 4.4, 4.6, 4.7, 4.9],
        target: 5.5,
        unit: '%',
        color: '#0F766E',
      },
      {
        id: '5',
        metric: 'Occupancy Rate',
        value: 94.5,
        previousValue: 92.1,
        change: 2.4,
        changeType: 'increase',
        period: 'Current month',
        category: 'Property',
        description: 'Percentage of occupied properties',
        trend: [89, 90, 91, 92.1, 93, 94.5],
        target: 95,
        unit: '%',
        color: '#3B82F6',
      },
      {
        id: '6',
        metric: 'Average Rent',
        value: 1850,
        previousValue: 1820,
        change: 1.6,
        changeType: 'increase',
        period: 'Per property/month',
        category: 'Financial',
        description: 'Average monthly rent across all properties',
        trend: [1780, 1790, 1800, 1820, 1835, 1850],
        target: 1900,
        unit: '£',
        color: '#8B5CF6',
      },
      {
        id: '7',
        metric: 'Cash Flow',
        value: 45680,
        previousValue: 42000,
        change: 8.8,
        changeType: 'increase',
        period: 'Last 30 days',
        category: 'Financial',
        description: 'Net cash flow from operations',
        trend: [38000, 39000, 40000, 42000, 44000, 45680],
        target: 50000,
        unit: '£',
        color: '#7C3AED',
      },
      {
        id: '8',
        metric: 'ROI',
        value: 12.4,
        previousValue: 11.2,
        change: 10.7,
        changeType: 'increase',
        period: 'Annual',
        category: 'Financial',
        description: 'Return on investment percentage',
        trend: [10.5, 10.8, 11.0, 11.2, 11.8, 12.4],
        target: 15.0,
        unit: '%',
        color: '#DC2626',
      },
      {
        id: '9',
        metric: 'Maintenance Costs',
        value: 15200,
        previousValue: 18500,
        change: -17.8,
        changeType: 'decrease',
        period: 'Last 30 days',
        category: 'Maintenance',
        description: 'Total maintenance and repair costs',
        trend: [22000, 20000, 19000, 18500, 16800, 15200],
        target: 12000,
        unit: '£',
        color: '#EF4444',
      },
      {
        id: '10',
        metric: 'Void Costs',
        value: 2150,
        previousValue: 2450,
        change: -12.2,
        changeType: 'decrease',
        period: 'Last 30 days',
        category: 'Property',
        description: 'Costs associated with vacant properties',
        trend: [3000, 2800, 2600, 2450, 2300, 2150],
        target: 1500,
        unit: '£',
        color: '#F97316',
      },
      {
        id: '11',
        metric: 'New Tenants',
        value: 12,
        previousValue: 8,
        change: 50,
        changeType: 'increase',
        period: 'Last 30 days',
        category: 'Tenant',
        description: 'Number of new tenant sign-ups',
        trend: [6, 7, 8, 8, 10, 12],
        target: 15,
        unit: '',
        color: '#F59E0B',
      },
      {
        id: '12',
        metric: 'Tenant Satisfaction',
        value: 4.2,
        previousValue: 4.0,
        change: 5,
        changeType: 'increase',
        period: 'Average rating',
        category: 'Tenant',
        description: 'Average tenant satisfaction score (1-5)',
        trend: [3.8, 3.9, 4.0, 4.0, 4.1, 4.2],
        target: 4.5,
        unit: '/5',
        color: '#06B6D4',
      },
    ];

    const mockCharts: ChartData[] = [
      {
        id: '1',
        title: 'Monthly Revenue vs Expenses',
        type: 'line',
        data: [
          { month: 'Jul', revenue: 110000, expenses: 45000 },
          { month: 'Aug', revenue: 112000, expenses: 47000 },
          { month: 'Sep', revenue: 115000, expenses: 46000 },
          { month: 'Oct', revenue: 118000, expenses: 48000 },
          { month: 'Nov', revenue: 120000, expenses: 49000 },
          { month: 'Dec', revenue: 125000, expenses: 50000 },
        ],
        xAxis: 'month',
        yAxis: 'revenue',
        description: 'Monthly revenue and expenses comparison',
      },
      {
        id: '2',
        title: 'Cash Flow Analysis',
        type: 'line',
        data: [
          { month: 'Jul', cashflow: 65000 },
          { month: 'Aug', cashflow: 65000 },
          { month: 'Sep', cashflow: 69000 },
          { month: 'Oct', cashflow: 70000 },
          { month: 'Nov', cashflow: 71000 },
          { month: 'Dec', cashflow: 75000 },
        ],
        xAxis: 'month',
        yAxis: 'cashflow',
        description: 'Monthly cash flow trends',
      },
      {
        id: '3',
        title: 'Property Performance by Yield',
        type: 'bar',
        data: [
          { category: 'High Yield (>7%)', count: 12 },
          { category: 'Medium Yield (5-7%)', count: 28 },
          { category: 'Low Yield (<5%)', count: 8 },
        ],
        xAxis: 'category',
        yAxis: 'count',
        description: 'Property distribution by yield performance',
      },
      {
        id: '4',
        title: 'Expense Breakdown',
        type: 'pie',
        data: [
          { type: 'Mortgage Payments', count: 35, percentage: 35.0 },
          { type: 'Maintenance', count: 20, percentage: 20.0 },
          { type: 'Management Fees', count: 15, percentage: 15.0 },
          { type: 'Insurance', count: 12, percentage: 12.0 },
          { type: 'Utilities', count: 8, percentage: 8.0 },
          { type: 'Other', count: 10, percentage: 10.0 },
        ],
        colors: ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#DC2626', '#059669'],
        description: 'Breakdown of monthly expenses by category',
      },
      {
        id: '5',
        title: 'ROI by Property Type',
        type: 'bar',
        data: [
          { category: 'Apartments', roi: 14.2 },
          { category: 'Houses', roi: 11.8 },
          { category: 'Studios', roi: 16.5 },
          { category: 'Commercial', roi: 9.3 },
        ],
        xAxis: 'category',
        yAxis: 'roi',
        description: 'Return on investment by property type',
      },
      {
        id: '6',
        title: 'Occupancy Rate Trends',
        type: 'line',
        data: [
          { month: 'Jul', rate: 91.2 },
          { month: 'Aug', rate: 92.8 },
          { month: 'Sep', rate: 93.5 },
          { month: 'Oct', rate: 92.1 },
          { month: 'Nov', rate: 94.0 },
          { month: 'Dec', rate: 94.2 },
        ],
        xAxis: 'month',
        yAxis: 'rate',
        description: 'Monthly occupancy rate trends',
      },
    ];

    setReports(mockReports);
    setAnalytics(mockAnalytics);
    setCharts(mockCharts);
    setLoading(false);

    setTimeout(() => {
      setReports(mockReports);
      setAnalytics(mockAnalytics);
      setCharts(mockCharts);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || report.type === filterType;
    const matchesStatus = filterStatus === 'all' || report.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'INACTIVE': return 'bg-gray-100 text-gray-800';
      case 'SCHEDULED': return 'bg-blue-100 text-blue-800';
      case 'GENERATING': return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'FAILED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'FINANCIAL': return 'bg-green-100 text-green-800';
      case 'PROPERTY': return 'bg-blue-100 text-blue-800';
      case 'TENANT': return 'bg-purple-100 text-purple-800';
      case 'MAINTENANCE': return 'bg-orange-100 text-orange-800';
      case 'MARKETING': return 'bg-pink-100 text-pink-800';
      case 'COMPLIANCE': return 'bg-red-100 text-red-800';
      case 'CUSTOM': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleGenerateReport = async (reportId: string) => {
    setReports(prev => prev.map(report => 
      report.id === reportId 
        ? { ...report, status: 'GENERATING' as any, updatedAt: new Date().toISOString() }
        : report
    ));
    
    try {
      // Simulate API call with progress tracking
      const report = reports.find(r => r.id === reportId);
      if (report) {
        // Simulate generation time
        setTimeout(() => {
          setReports(prev => prev.map(report => 
            report.id === reportId 
              ? { 
                  ...report, 
                  status: 'COMPLETED' as any, 
                  lastGenerated: new Date().toISOString(),
                  updatedAt: new Date().toISOString() 
                }
              : report
          ));
        }, 3000);
      }
    } catch (error) {
      console.error('Error generating report:', error);
    }
  };

  const handleDownloadReport = async (reportId: string, format: string = 'PDF') => {
    try {
      const report = reports.find(r => r.id === reportId);
      if (report) {
        // Simulate file download
        const fileName = `${report.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.${format.toLowerCase()}`;
        console.log(`Downloading ${fileName}`);
        
        // Create a temporary download link
        const link = document.createElement('a');
        link.href = '#'; // In real app, this would be the file URL
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Error downloading report:', error);
    }
  };

  const exportReports = async (reportIds: string[], format: string) => {
    setLoading(true);
    try {
      // Simulate bulk export
      setTimeout(() => {
        const fileName = `Financial_Reports_Export_${new Date().toISOString().split('T')[0]}.${format.toLowerCase()}`;
        console.log(`Exporting ${reportIds.length} reports as ${fileName}`);
        setLoading(false);
        setShowExportModal(false);
      }, 2000);
    } catch (error) {
      console.error('Error exporting reports:', error);
      setLoading(false);
    }
  };

  const scheduleReport = async (reportId: string, settings: any) => {
    try {
      const report = reports.find(r => r.id === reportId);
      if (report) {
        // Update report with automation settings
        report.frequency = settings.frequency;
        report.recipients = settings.recipients;
        setReports([...reports]);
        setShowScheduleModal(false);
        console.log(`Scheduled report ${report.name} for ${settings.frequency} delivery`);
      }
    } catch (error) {
      console.error('Error scheduling report:', error);
    }
  };

  const createCustomReport = async (reportData: any) => {
    try {
      const newReport: Report = {
        id: `custom_${Date.now()}`,
        name: reportData.name,
        type: reportData.type,
        description: reportData.description,
        category: reportData.category || 'Custom',
        frequency: reportData.frequency,
        format: reportData.format,
        status: 'INACTIVE' as any,
        lastGenerated: undefined,
        nextScheduled: reportData.nextScheduled || undefined,
        recipients: reportData.recipients || [],
        createdBy: 'user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setReports([...reports, newReport]);
      setShowCustomModal(false);
      console.log('Created custom report:', newReport);
    } catch (error) {
      console.error('Error creating custom report:', error);
    }
  };

  const getAnalyticsIcon = (metric: string, category: string) => {
    if (metric.toLowerCase().includes('revenue') || metric.toLowerCase().includes('income')) {
      return <Banknote className="h-6 w-6" />;
    }
    if (metric.toLowerCase().includes('profit')) {
      return <TrendingUp className="h-6 w-6" />;
    }
    if (metric.toLowerCase().includes('yield') || metric.toLowerCase().includes('roi')) {
      return <Percent className="h-6 w-6" />;
    }
    if (metric.toLowerCase().includes('cash flow')) {
      return <Wallet className="h-6 w-6" />;
    }
    if (metric.toLowerCase().includes('cost') || metric.toLowerCase().includes('expense')) {
      return <Receipt className="h-6 w-6" />;
    }
    if (metric.toLowerCase().includes('occupancy')) {
      return <Building className="h-6 w-6" />;
    }
    if (metric.toLowerCase().includes('rent')) {
      return <CreditCard className="h-6 w-6" />;
    }
    if (metric.toLowerCase().includes('tenant')) {
      return <Users className="h-6 w-6" />;
    }
    if (metric.toLowerCase().includes('maintenance')) {
      return <Wrench className="h-6 w-6" />;
    }
    
    switch (category) {
      case 'Financial': return <Banknote className="h-6 w-6" />;
      case 'Property': return <Home className="h-6 w-6" />;
      case 'Tenant': return <Users className="h-6 w-6" />;
      case 'Maintenance': return <Settings className="h-6 w-6" />;
      default: return <BarChart3 className="h-6 w-6" />;
    }
  };

  const renderAnalyticsCard = (data: AnalyticsData) => (
    <Card key={data.id} className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{data.metric}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-gray-900">
              {data.unit === '£' ? '£' : ''}
              {data.value.toLocaleString()}
              {data.unit !== '£' ? data.unit : ''}
            </p>
            {data.change && (
              <span className={`flex items-center text-sm font-medium ${
                data.changeType === 'increase' ? 'text-green-600' : 
                data.changeType === 'decrease' ? 'text-red-600' : 'text-gray-600'
              }`}>
                {data.changeType === 'increase' ? '↗' : data.changeType === 'decrease' ? '↘' : '→'}
                {Math.abs(data.change)}%
              </span>
            )}
          </div>
          <div className="flex items-center mt-2">
            {data.changeType === 'increase' ? (
              <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
            ) : data.changeType === 'decrease' ? (
              <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
            ) : (
              <Activity className="h-4 w-4 text-gray-500 mr-1" />
            )}
            <span className="text-xs text-gray-500">vs last period</span>
          </div>
        </div>
        <div className={`p-2 rounded-lg`} style={{ backgroundColor: `${data.color}20` }}>
          <div style={{ color: data.color }}>
            {getAnalyticsIcon(data.metric, data.category)}
          </div>
        </div>
      </div>
      
      <p className="text-sm text-gray-600 mb-3">{data.description}</p>
      
      {/* Simple trend visualization */}
      <div className="flex items-end gap-1 h-8 mb-2">
        {data.trend.map((value, index) => {
          const maxValue = Math.max(...data.trend);
          const height = (value / maxValue) * 100;
          return (
            <div
              key={index}
              className="flex-1 rounded-t"
              style={{ 
                height: `${height}%`, 
                backgroundColor: data.color,
                opacity: 0.7 + (index * 0.05)
              }}
            />
          );
        })}
      </div>
      
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{data.period}</span>
        {data.target && (
          <span>Target: {data.unit === '£' ? '£' : ''}{data.target.toLocaleString()}{data.unit !== '£' ? data.unit : ''}</span>
        )}
      </div>
    </Card>
  );

  const renderChart = (chart: ChartData) => {
    const maxValue = Math.max(...chart.data.map(d => d[chart.yAxis!] || d.value || 0));
    const colors = [
      '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', 
      '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
    ];

    const renderBarChart = () => (
      <div className="space-y-3">
        {chart.data.map((item, index) => {
          const value = item[chart.yAxis!] || item.value || 0;
          return (
            <div key={index} className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">{item[chart.xAxis!] || item.category}</span>
                <span className="text-sm font-bold text-gray-900">
                  {typeof value === 'number' ? 
                    (value > 1000 ? `${(value/1000).toFixed(1)}k` : value.toLocaleString()) : 
                    value
                  }
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="h-2.5 rounded-full transition-all duration-500 ease-out" 
                  style={{ 
                    width: `${(value / maxValue) * 100}%`,
                    backgroundColor: colors[index % colors.length]
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    );

    const renderPieChart = () => {
      const total = chart.data.reduce((sum, item) => sum + (item.count || item.value || 0), 0);
      return (
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-3">
            {chart.data.map((item, index) => {
              const value = item.count || item.value || 0;
              const percentage = ((value / total) * 100).toFixed(1);
              return (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: colors[index % colors.length] }}
                    />
                    <span className="text-sm text-gray-700">{item.type || item.category}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900">{percentage}%</div>
                    <div className="text-xs text-gray-500">
                      {typeof value === 'number' ? value.toLocaleString() : value}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">
                {total.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500 mt-1">Total</div>
              <div className="text-xs text-gray-400 mt-1">{chart.data.length} categories</div>
            </div>
          </div>
        </div>
      );
    };

    const renderLineChart = () => (
      <div className="space-y-4">
        <div className="relative">
          <div className="flex justify-between items-end h-40 border-b border-l border-gray-200 pl-4 pb-4">
            {chart.data.map((item, index) => {
              const value = item[chart.yAxis!] || item.value || 0;
              const height = (value / maxValue) * 120;
              return (
                <div key={index} className="flex flex-col items-center space-y-2 relative group">
                  <div className="absolute -top-8 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    {typeof value === 'number' ? value.toLocaleString() : value}
                  </div>
                  <div 
                    className="bg-gradient-to-t from-blue-500 to-blue-400 w-6 rounded-t transition-all duration-500 ease-out hover:from-blue-600 hover:to-blue-500" 
                    style={{ height: `${height}px` }}
                  />
                  <span className="text-xs text-gray-600 transform -rotate-45 origin-top-left whitespace-nowrap">
                    {(item[chart.xAxis!] || item.month || '').toString().length > 8 ? 
                      `${(item[chart.xAxis!] || item.month || '').toString().substring(0, 8)}...` : 
                      (item[chart.xAxis!] || item.month || '')
                    }
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2 pl-4">
            <span>0</span>
            <span className="text-center">Timeline</span>
            <span>{maxValue.toLocaleString()}</span>
          </div>
        </div>
      </div>
    );

    return (
      <Card key={chart.id} className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{chart.title}</h3>
          <div className="flex gap-2">
            {chart.type === 'line' && <LineChart className="h-5 w-5 text-gray-400" />}
            {chart.type === 'bar' && <BarChart3 className="h-5 w-5 text-gray-400" />}
            {chart.type === 'pie' && <PieChart className="h-5 w-5 text-gray-400" />}
          </div>
        </div>
        
        <p className="text-sm text-gray-600 mb-4">{chart.description}</p>
        
        <div className="bg-gray-50 rounded-lg p-4">
          {chart.type === 'bar' && renderBarChart()}
          {chart.type === 'pie' && renderPieChart()}
          {chart.type === 'line' && renderLineChart()}
        </div>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading reports and analytics...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">Reports &amp; Analytics</h1>
              <p className="text-gray-600 mt-1">Comprehensive reporting and business intelligence</p>
            </div>
            <div className="flex gap-3 mt-4 lg:mt-0">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
                <option value="custom">Custom range</option>
              </select>
              <Button onClick={() => setShowCustomReportModal(true)}>
                <FileText className="h-4 w-4 mr-2" />
                Create Report
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'reports', label: 'Reports', icon: FileText },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp },
              { id: 'custom', label: 'Custom', icon: Settings },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
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
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Key Performance Indicators</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {analytics.map(renderAnalyticsCard)}
              </div>
            </div>

            {/* Charts */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Visual Analytics</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {charts.map(renderChart)}
              </div>
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            {/* Header Actions */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Financial Reports</h2>
                <p className="text-gray-600">Manage and generate comprehensive financial reports</p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowExportModal(true)}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowScheduleModal(true)}
                  className="flex items-center gap-2"
                >
                  <Bell className="h-4 w-4" />
                  Schedule
                </Button>
                <Button
                  onClick={() => setShowCustomReportModal(true)}
                  className="flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Create Report
                </Button>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Search reports..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex gap-3">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="FINANCIAL">Financial</option>
                  <option value="PROPERTY">Property</option>
                  <option value="TENANT">Tenant</option>
                  <option value="MAINTENANCE">Maintenance</option>
                  <option value="MARKETING">Marketing</option>
                  <option value="COMPLIANCE">Compliance</option>
                </select>
                
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="GENERATING">Generating</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="FAILED">Failed</option>
                </select>
              </div>
            </div>

            {/* Reports List */}
            <div className="space-y-4">
              {filteredReports.map((report) => (
                <Card key={report.id} className="overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{report.name}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(report.type)}`}>
                            {report.type.replace('_', ' ')}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                            {report.status.replace('_', ' ')}
                          </span>
                        </div>
                        
                        <p className="text-gray-600 mb-3">{report.description}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Frequency:</span> {report.frequency.replace('_', ' ')}
                          </div>
                          <div>
                            <span className="font-medium">Format:</span> {report.format}
                          </div>
                          {report.lastGenerated && (
                            <div>
                              <span className="font-medium">Last Generated:</span> {new Date(report.lastGenerated).toLocaleDateString()}
                            </div>
                          )}
                          {report.nextScheduled && (
                            <div>
                              <span className="font-medium">Next Scheduled:</span> {new Date(report.nextScheduled).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                        
                        {report.recipients.length > 0 && (
                          <div className="mt-3">
                            <span className="text-sm font-medium text-gray-600">Recipients:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {report.recipients.map((recipient, index) => (
                                <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                  {recipient}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedReport(report);
                            setShowReportModal(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleGenerateReport(report.id)}
                          disabled={report.status === 'GENERATING'}
                        >
                          {report.status === 'GENERATING' ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <RefreshCw className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleDownloadReport(report.id)}
                          disabled={report.status !== 'COMPLETED'}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {filteredReports.length === 0 && (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No reports found
                </h3>
                <p className="text-gray-600 mb-4">
                  No reports match your current filters
                </p>
                <Button onClick={() => setShowCustomReportModal(true)}>
                  Create First Report
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {analytics.map(renderAnalyticsCard)}
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {charts.map(renderChart)}
            </div>
          </div>
        )}

        {/* Custom Tab */}
        {activeTab === 'custom' && (
          <div className="text-center py-12">
            <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Custom Report Builder
            </h3>
            <p className="text-gray-600 mb-4">
              Create custom reports with your specific requirements
            </p>
            <Button onClick={() => setShowCustomReportModal(true)}>
              <FileText className="h-4 w-4 mr-2" />
              Build Custom Report
            </Button>
          </div>
        )}
      </div>

      {/* Report Details Modal */}
      <Modal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        title={selectedReport?.name || 'Report Details'}
      >
        {selectedReport && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{selectedReport.name}</h3>
              <p className="text-gray-600">{selectedReport.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Type</p>
                <p className="text-sm text-gray-900">{selectedReport.type.replace('_', ' ')}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Status</p>
                <p className="text-sm text-gray-900">{selectedReport.status.replace('_', ' ')}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Frequency</p>
                <p className="text-sm text-gray-900">{selectedReport.frequency.replace('_', ' ')}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Format</p>
                <p className="text-sm text-gray-900">{selectedReport.format}</p>
              </div>
            </div>

            {selectedReport.lastGenerated && (
              <div>
                <p className="text-sm font-medium text-gray-700">Last Generated</p>
                <p className="text-sm text-gray-900">{new Date(selectedReport.lastGenerated).toLocaleString()}</p>
              </div>
            )}

            {selectedReport.nextScheduled && (
              <div>
                <p className="text-sm font-medium text-gray-700">Next Scheduled</p>
                <p className="text-sm text-gray-900">{new Date(selectedReport.nextScheduled).toLocaleString()}</p>
              </div>
            )}

            {selectedReport.recipients.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Recipients</p>
                <div className="space-y-1">
                  {selectedReport.recipients.map((recipient, index) => (
                    <p key={index} className="text-sm text-gray-900">{recipient}</p>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => handleGenerateReport(selectedReport.id)}
                disabled={selectedReport.status === 'GENERATING'}
                className="flex-1"
              >
                {selectedReport.status === 'GENERATING' ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Generate Now
              </Button>
              <Button
                variant="outline"
                onClick={() => handleDownloadReport(selectedReport.id)}
                disabled={selectedReport.status !== 'COMPLETED'}
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Custom Report Modal */}
      <Modal
        isOpen={showCustomReportModal}
        onClose={() => setShowCustomReportModal(false)}
        title="Create Custom Report"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Report Name *
            </label>
            <Input
              type="text"
              placeholder="Enter report name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              placeholder="Describe what this report will contain"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Report Type *
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black">
                <option value="FINANCIAL">Financial</option>
                <option value="PROPERTY">Property</option>
                <option value="TENANT">Tenant</option>
                <option value="MAINTENANCE">Maintenance</option>
                <option value="MARKETING">Marketing</option>
                <option value="COMPLIANCE">Compliance</option>
                <option value="CUSTOM">Custom</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Frequency *
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black">
                <option value="ON_DEMAND">On Demand</option>
                <option value="DAILY">Daily</option>
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY">Monthly</option>
                <option value="QUARTERLY">Quarterly</option>
                <option value="YEARLY">Yearly</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Format *
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black">
                <option value="PDF">PDF</option>
                <option value="EXCEL">Excel</option>
                <option value="CSV">CSV</option>
                <option value="JSON">JSON</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Range
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black">
                <option value="last_30_days">Last 30 days</option>
                <option value="last_90_days">Last 90 days</option>
                <option value="last_year">Last year</option>
                <option value="custom">Custom range</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recipients
            </label>
            <Input
              type="email"
              placeholder="Enter email addresses separated by commas"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowCustomReportModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                // Handle report creation
                setShowCustomReportModal(false);
              }}
              className="flex-1"
            >
              Create Report
            </Button>
          </div>
        </div>
      </Modal>

      {/* Export Modal */}
      <Modal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        title="Export Reports"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Export Format
            </label>
            <div className="grid grid-cols-2 gap-3">
              {['PDF', 'Excel', 'CSV', 'JSON'].map((format) => (
                <label key={format} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="exportFormat"
                    value={format}
                    checked={exportFormat === format}
                    onChange={(e) => setExportFormat(e.target.value)}
                    className="text-blue-600"
                  />
                  <span className="text-sm text-gray-700">{format}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Range
            </label>
            <select 
              value={reportFilters.dateRange}
              onChange={(e) => setReportFilters(prev => ({ ...prev, dateRange: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            >
              <option value="last_30_days">Last 30 days</option>
              <option value="last_90_days">Last 90 days</option>
              <option value="last_6_months">Last 6 months</option>
              <option value="last_year">Last year</option>
              <option value="custom">Custom range</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Property Type
            </label>
            <select 
              value={reportFilters.propertyType}
              onChange={(e) => setReportFilters(prev => ({ ...prev, propertyType: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            >
              <option value="all">All Properties</option>
              <option value="residential">Residential</option>
              <option value="commercial">Commercial</option>
              <option value="mixed_use">Mixed Use</option>
            </select>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Include Options
            </label>
            <div className="space-y-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={reportFilters.includeComparisons}
                  onChange={(e) => setReportFilters(prev => ({ ...prev, includeComparisons: e.target.checked }))}
                  className="text-blue-600"
                />
                <span className="text-sm text-gray-700">Include year-over-year comparisons</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={reportFilters.includeCharts}
                  onChange={(e) => setReportFilters(prev => ({ ...prev, includeCharts: e.target.checked }))}
                  className="text-blue-600"
                />
                <span className="text-sm text-gray-700">Include charts and visualizations</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={reportFilters.includeRecommendations}
                  onChange={(e) => setReportFilters(prev => ({ ...prev, includeRecommendations: e.target.checked }))}
                  className="text-blue-600"
                />
                <span className="text-sm text-gray-700">Include AI-powered recommendations</span>
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowExportModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                exportReports([], exportFormat);
                setShowExportModal(false);
              }}
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Reports
            </Button>
          </div>
        </div>
      </Modal>

      {/* Schedule Modal */}
      <Modal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        title="Schedule Automated Reports"
      >
        <div className="space-y-6">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={automationSettings.enabled}
              onChange={(e) => setAutomationSettings(prev => ({ ...prev, enabled: e.target.checked }))}
              className="text-blue-600"
            />
            <label className="text-sm font-medium text-gray-700">
              Enable automated report generation
            </label>
          </div>

          {automationSettings.enabled && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Frequency
                </label>
                <select 
                  value={automationSettings.frequency}
                  onChange={(e) => setAutomationSettings(prev => ({ ...prev, frequency: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipients
                </label>
                <textarea
                  rows={3}
                  value={automationSettings.recipients.join(', ')}
                  onChange={(e) => setAutomationSettings(prev => ({ 
                    ...prev, 
                    recipients: e.target.value.split(',').map(email => email.trim()).filter(Boolean)
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="Enter email addresses separated by commas"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Next Run
                </label>
                <input
                  type="datetime-local"
                  value={automationSettings.nextRun}
                  onChange={(e) => setAutomationSettings(prev => ({ ...prev, nextRun: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                />
              </div>
            </>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowScheduleModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                scheduleReport('', automationSettings);
                setShowScheduleModal(false);
              }}
              className="flex-1"
            >
              <Bell className="h-4 w-4 mr-2" />
              {automationSettings.enabled ? 'Save Schedule' : 'Disable Automation'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ReportsAnalytics;