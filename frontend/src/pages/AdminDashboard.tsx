import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Progress from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Users,
  Settings,
  BarChart3,
  Shield,
  FileText,
  DollarSign,
  Wrench,
  Database,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Activity,
  Upload,
  Download,
  RefreshCw,
  Eye,
  Search,
  Filter,
  MoreHorizontal,
  Home,
  UserCheck,
  X,
  Zap,
  Trash2,
  HardDrive,
  Lock,
  Archive
} from 'lucide-react';
import { toast } from 'sonner';
import CsvUploadComponent from '../components/admin/CsvUploadComponent';
import ImportHistoryComponent from '../components/admin/ImportHistoryComponent';
import { ImportJob } from '../services/adminService';

// Types
interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalProperties: number;
  totalBookings: number;
  revenue: number;
  systemHealth: number;
  securityAlerts: number;
  pendingTasks: number;
}

interface ImportJob {
  id: string;
  filename: string;
  status: 'uploaded' | 'processing' | 'completed' | 'failed';
  progress: number;
  totalRows: number;
  processedRows: number;
  errorRows: number;
  createdAt: string;
}

interface SecurityAlert {
  id: string;
  type: 'warning' | 'error' | 'info';
  message: string;
  timestamp: string;
  resolved: boolean;
}

interface SystemMetric {
  name: string;
  value: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
}

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedImportJob, setSelectedImportJob] = useState<ImportJob | null>(null);
  const [refreshImportHistory, setRefreshImportHistory] = useState(0);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalProperties: 0,
    totalBookings: 0,
    revenue: 0,
    systemHealth: 0,
    securityAlerts: 0,
    pendingTasks: 0,
  });
  const [importJobs, setImportJobs] = useState<ImportJob[]>([]);
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load dashboard statistics
      const statsResponse = await fetch('/api/admin/dashboard/stats');
      if (statsResponse.ok) {
        const stats = await statsResponse.json();
        setDashboardStats(stats);
      }

      // Load import jobs
      const jobsResponse = await fetch('/api/admin/land-registry-import/jobs?limit=5');
      if (jobsResponse.ok) {
        const jobs = await jobsResponse.json();
        setImportJobs(jobs.data || []);
      }

      // Load security alerts
      const alertsResponse = await fetch('/api/admin/security-monitoring/alerts?limit=5');
      if (alertsResponse.ok) {
        const alerts = await alertsResponse.json();
        setSecurityAlerts(alerts.data || []);
      }

      // Load system metrics
      const metricsResponse = await fetch('/api/admin/maintenance-oversight/system-overview');
      if (metricsResponse.ok) {
        const metrics = await metricsResponse.json();
        setSystemMetrics(metrics.metrics || []);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    loadDashboardData();
    toast.success('Dashboard data refreshed');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'good':
        return 'text-green-600';
      case 'processing':
      case 'warning':
        return 'text-yellow-600';
      case 'failed':
      case 'critical':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed':
      case 'good':
        return 'default';
      case 'processing':
      case 'warning':
        return 'secondary';
      case 'failed':
      case 'critical':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive system management and monitoring
          </p>
        </div>
        <Button onClick={refreshData} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {dashboardStats.activeUsers} active users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Properties</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.totalProperties.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {dashboardStats.totalBookings} total bookings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(dashboardStats.revenue)}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.systemHealth}%</div>
            <Progress value={dashboardStats.systemHealth} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-9">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="gdpr">GDPR</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="import">Import</TabsTrigger>
        </TabsList>

        {/* System Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Recent Import Jobs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Upload className="h-5 w-5 mr-2" />
                  Recent Import Jobs
                </CardTitle>
                <CardDescription>
                  Latest Land Registry data imports
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {importJobs.length > 0 ? (
                    importJobs.map((job) => (
                      <div key={job.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">{job.filename}</div>
                          <div className="text-sm text-muted-foreground">
                            {job.processedRows.toLocaleString()} / {job.totalRows.toLocaleString()} rows
                          </div>
                          {job.status === 'processing' && (
                            <Progress value={job.progress} className="mt-2" />
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={getStatusBadgeVariant(job.status)}>
                            {job.status}
                          </Badge>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No recent import jobs
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Security Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Security Alerts
                  {dashboardStats.securityAlerts > 0 && (
                    <Badge variant="destructive" className="ml-2">
                      {dashboardStats.securityAlerts}
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Recent security events and alerts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {securityAlerts.length > 0 ? (
                    securityAlerts.map((alert) => (
                      <div key={alert.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                        <div className="flex-shrink-0">
                          {alert.type === 'error' && <AlertTriangle className="h-5 w-5 text-red-500" />}
                          {alert.type === 'warning' && <AlertTriangle className="h-5 w-5 text-yellow-500" />}
                          {alert.type === 'info' && <CheckCircle className="h-5 w-5 text-blue-500" />}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{alert.message}</div>
                          <div className="text-sm text-muted-foreground">
                            {formatDate(alert.timestamp)}
                          </div>
                        </div>
                        {alert.resolved && (
                          <Badge variant="outline">Resolved</Badge>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No security alerts
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* System Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                System Metrics
              </CardTitle>
              <CardDescription>
                Real-time system performance indicators
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {systemMetrics.map((metric, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{metric.name}</div>
                      <div className={`text-sm ${getStatusColor(metric.status)}`}>
                        {metric.trend === 'up' && <TrendingUp className="h-4 w-4" />}
                        {metric.trend === 'down' && <TrendingUp className="h-4 w-4 rotate-180" />}
                        {metric.trend === 'stable' && <div className="h-4 w-4 bg-gray-400 rounded-full" />}
                      </div>
                    </div>
                    <div className="text-2xl font-bold mt-2">
                      {metric.value}{metric.unit}
                    </div>
                    <Badge variant={getStatusBadgeVariant(metric.status)} className="mt-2">
                      {metric.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Management Tab */}
        <TabsContent value="users" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* User Operations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  User Operations
                </CardTitle>
                <CardDescription>
                  Manage user accounts and bulk operations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Search Users</label>
                  <div className="flex space-x-2">
                    <input 
                      type="text" 
                      className="flex-1 p-2 border rounded" 
                      placeholder="Search by name, email, or ID" 
                    />
                    <Button variant="outline">
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Filter by Status</label>
                  <select className="w-full p-2 border rounded">
                    <option value="all">All Users</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                    <option value="pending">Pending Verification</option>
                  </select>
                </div>
                <div className="flex space-x-2">
                  <Button className="flex-1" onClick={() => toast.success('User list loaded')}>
                    <Users className="h-4 w-4 mr-2" />
                    View Users
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={() => toast.success('Users exported')}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Role & Permission Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Role & Permission Management
                </CardTitle>
                <CardDescription>
                  Configure user roles and permissions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Role</label>
                  <select className="w-full p-2 border rounded">
                    <option value="admin">Administrator</option>
                    <option value="manager">Property Manager</option>
                    <option value="agent">Estate Agent</option>
                    <option value="user">Standard User</option>
                    <option value="viewer">Viewer Only</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Permissions</label>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" defaultChecked />
                      View Properties
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" defaultChecked />
                      Edit Properties
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      Delete Properties
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" defaultChecked />
                      Manage Bookings
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      Access Admin Panel
                    </label>
                  </div>
                </div>
                <Button className="w-full" onClick={() => toast.success('Role permissions updated')}>
                  <UserCheck className="h-4 w-4 mr-2" />
                  Update Role Permissions
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Bulk User Operations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Bulk User Operations
              </CardTitle>
              <CardDescription>
                Perform operations on multiple users simultaneously
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <Button variant="outline" className="h-20 flex-col" onClick={() => toast.success('Bulk activation initiated')}>
                  <UserCheck className="h-6 w-6 mb-2" />
                  <span>Bulk Activate</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col" onClick={() => toast.success('Bulk deactivation initiated')}>
                  <X className="h-6 w-6 mb-2" />
                  <span>Bulk Deactivate</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col" onClick={() => toast.success('Bulk role assignment initiated')}>
                  <Shield className="h-6 w-6 mb-2" />
                  <span>Assign Roles</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col" onClick={() => toast.success('Bulk notification sent')}>
                  <AlertTriangle className="h-6 w-6 mb-2" />
                  <span>Send Notifications</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* User Activity Monitoring */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                User Activity Monitoring
              </CardTitle>
              <CardDescription>
                Monitor and track user activities and sessions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Time Period</label>
                  <select className="w-full p-2 border rounded">
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="custom">Custom Range</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Activity Type</label>
                  <select className="w-full p-2 border rounded">
                    <option value="all">All Activities</option>
                    <option value="login">Login/Logout</option>
                    <option value="property">Property Actions</option>
                    <option value="booking">Booking Actions</option>
                    <option value="profile">Profile Changes</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">User Filter</label>
                  <input 
                    type="text" 
                    className="w-full p-2 border rounded" 
                    placeholder="Filter by user" 
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                <Button className="flex-1" onClick={() => toast.success('Activity report generated')}>
                  <Activity className="h-4 w-4 mr-2" />
                  Generate Activity Report
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => toast.success('Active sessions loaded')}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Active Sessions
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Configuration Tab */}
        <TabsContent value="system" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Database Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="h-5 w-5 mr-2" />
                  Database Configuration
                </CardTitle>
                <CardDescription>
                  Manage database connection and settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Connection Pool Size</label>
                  <input 
                    type="number" 
                    className="w-full p-2 border rounded" 
                    placeholder="10" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Query Timeout (ms)</label>
                  <input 
                    type="number" 
                    className="w-full p-2 border rounded" 
                    placeholder="30000" 
                  />
                </div>
                <Button className="w-full">
                  <Settings className="h-4 w-4 mr-2" />
                  Update Database Config
                </Button>
              </CardContent>
            </Card>

            {/* Email Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Email Configuration
                </CardTitle>
                <CardDescription>
                  Configure SMTP and email settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">SMTP Host</label>
                  <input 
                    type="text" 
                    className="w-full p-2 border rounded" 
                    placeholder="smtp.gmail.com" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">SMTP Port</label>
                  <input 
                    type="number" 
                    className="w-full p-2 border rounded" 
                    placeholder="587" 
                  />
                </div>
                <Button className="w-full">
                  <FileText className="h-4 w-4 mr-2" />
                  Update Email Config
                </Button>
              </CardContent>
            </Card>

            {/* API Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  API Configuration
                </CardTitle>
                <CardDescription>
                  Configure API rate limiting and settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Rate Limit (requests/minute)</label>
                  <input 
                    type="number" 
                    className="w-full p-2 border rounded" 
                    placeholder="100" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">API Timeout (ms)</label>
                  <input 
                    type="number" 
                    className="w-full p-2 border rounded" 
                    placeholder="5000" 
                  />
                </div>
                <Button className="w-full">
                  <Settings className="h-4 w-4 mr-2" />
                  Update API Config
                </Button>
              </CardContent>
            </Card>

            {/* Security Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Security Configuration
                </CardTitle>
                <CardDescription>
                  Configure security and authentication settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Session Timeout (minutes)</label>
                  <input 
                    type="number" 
                    className="w-full p-2 border rounded" 
                    placeholder="30" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Max Login Attempts</label>
                  <input 
                    type="number" 
                    className="w-full p-2 border rounded" 
                    placeholder="5" 
                  />
                </div>
                <Button className="w-full">
                  <Shield className="h-4 w-4 mr-2" />
                  Update Security Config
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* System Health Check */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                System Health Check
              </CardTitle>
              <CardDescription>
                Monitor system health and perform diagnostics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <Button onClick={() => toast.success('System health check completed')}>
                  <Activity className="h-4 w-4 mr-2" />
                  Run Health Check
                </Button>
                <Button variant="outline" onClick={() => toast.success('Configuration backup created')}>
                  <Download className="h-4 w-4 mr-2" />
                  Backup Configuration
                </Button>
                <Button variant="outline" onClick={() => toast.success('Configuration restored')}>
                  <Upload className="h-4 w-4 mr-2" />
                  Restore Configuration
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics & Reporting Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Market Data Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Market Data Management
                </CardTitle>
                <CardDescription>
                  Import and manage market analysis data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Button onClick={() => toast.success('Market data import started')}>
                    <Upload className="h-4 w-4 mr-2" />
                    Import Market Data
                  </Button>
                  <Button variant="outline" onClick={() => toast.success('Market data exported')}>
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </Button>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Data Source</label>
                  <select className="w-full p-2 border rounded">
                    <option value="land_registry">Land Registry</option>
                    <option value="rightmove">Rightmove</option>
                    <option value="zoopla">Zoopla</option>
                    <option value="manual">Manual Entry</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Location Filter</label>
                  <input 
                    type="text" 
                    className="w-full p-2 border rounded" 
                    placeholder="Enter postcode or area" 
                  />
                </div>
              </CardContent>
            </Card>

            {/* Market Trends & Analytics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Market Trends & Analytics
                </CardTitle>
                <CardDescription>
                  Configure analytics and trend analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Analysis Period</label>
                  <select className="w-full p-2 border rounded">
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                    <option value="custom">Custom Range</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Property Type</label>
                  <select className="w-full p-2 border rounded">
                    <option value="all">All Types</option>
                    <option value="detached">Detached</option>
                    <option value="semi_detached">Semi-Detached</option>
                    <option value="terraced">Terraced</option>
                    <option value="flat">Flat/Apartment</option>
                  </select>
                </div>
                <Button className="w-full" onClick={() => toast.success('Analytics configuration updated')}>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Update Analytics Config
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Market Reports */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Market Reports
              </CardTitle>
              <CardDescription>
                Generate and manage market analysis reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <Button variant="outline" className="h-20 flex-col" onClick={() => toast.success('Price trend report generated')}>
                  <TrendingUp className="h-6 w-6 mb-2" />
                  <span>Price Trends</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col" onClick={() => toast.success('Market summary report generated')}>
                  <BarChart3 className="h-6 w-6 mb-2" />
                  <span>Market Summary</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col" onClick={() => toast.success('Comparative analysis report generated')}>
                  <Activity className="h-6 w-6 mb-2" />
                  <span>Comparative Analysis</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col" onClick={() => toast.success('Custom report generated')}>
                  <FileText className="h-6 w-6 mb-2" />
                  <span>Custom Report</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Market Alerts Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Market Alerts Configuration
              </CardTitle>
              <CardDescription>
                Set up automated market alerts and notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Price Change Threshold (%)</label>
                  <input 
                    type="number" 
                    className="w-full p-2 border rounded" 
                    placeholder="5" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Alert Frequency</label>
                  <select className="w-full p-2 border rounded">
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>
              <Button className="w-full" onClick={() => toast.success('Market alerts configured')}>
                <AlertTriangle className="h-4 w-4 mr-2" />
                Configure Alerts
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* GDPR Compliance Tab */}
        <TabsContent value="gdpr" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Data Export Tools */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Download className="h-5 w-5 mr-2" />
                  Data Export Tools
                </CardTitle>
                <CardDescription>
                  Export user data for GDPR compliance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">User Email/ID</label>
                  <input 
                    type="text" 
                    className="w-full p-2 border rounded" 
                    placeholder="Enter user email or ID" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Export Format</label>
                  <select className="w-full p-2 border rounded">
                    <option value="json">JSON</option>
                    <option value="csv">CSV</option>
                    <option value="pdf">PDF Report</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Data Categories</label>
                  <div className="space-y-1">
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" defaultChecked />
                      Personal Information
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" defaultChecked />
                      Property Data
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" defaultChecked />
                      Activity Logs
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      Communication History
                    </label>
                  </div>
                </div>
                <Button className="w-full" onClick={() => toast.success('Data export initiated')}>
                  <Download className="h-4 w-4 mr-2" />
                  Export User Data
                </Button>
              </CardContent>
            </Card>

            {/* Data Deletion Tools */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <X className="h-5 w-5 mr-2" />
                  Data Deletion Tools
                </CardTitle>
                <CardDescription>
                  Securely delete user data upon request
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">User Email/ID</label>
                  <input 
                    type="text" 
                    className="w-full p-2 border rounded" 
                    placeholder="Enter user email or ID" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Deletion Type</label>
                  <select className="w-full p-2 border rounded">
                    <option value="soft">Soft Delete (Anonymize)</option>
                    <option value="hard">Hard Delete (Permanent)</option>
                    <option value="selective">Selective Deletion</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Reason for Deletion</label>
                  <textarea 
                    className="w-full p-2 border rounded" 
                    rows={3}
                    placeholder="Enter reason for data deletion request"
                  />
                </div>
                <Button 
                  variant="destructive" 
                  className="w-full" 
                  onClick={() => toast.success('Data deletion request processed')}
                >
                  <X className="h-4 w-4 mr-2" />
                  Process Deletion Request
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Consent Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Consent Management
              </CardTitle>
              <CardDescription>
                Manage user consent and privacy preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <Button variant="outline" className="h-20 flex-col" onClick={() => toast.success('Consent records exported')}>
                  <FileText className="h-6 w-6 mb-2" />
                  <span>View Consent Records</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col" onClick={() => toast.success('Consent preferences updated')}>
                  <Settings className="h-6 w-6 mb-2" />
                  <span>Update Preferences</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col" onClick={() => toast.success('Consent audit completed')}>
                  <Search className="h-6 w-6 mb-2" />
                  <span>Audit Consent</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Privacy Audit Logs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Privacy Audit Logs
              </CardTitle>
              <CardDescription>
                Track and monitor privacy-related activities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date Range</label>
                  <div className="flex space-x-2">
                    <input type="date" className="flex-1 p-2 border rounded" />
                    <input type="date" className="flex-1 p-2 border rounded" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Activity Type</label>
                  <select className="w-full p-2 border rounded">
                    <option value="all">All Activities</option>
                    <option value="data_access">Data Access</option>
                    <option value="data_export">Data Export</option>
                    <option value="data_deletion">Data Deletion</option>
                    <option value="consent_changes">Consent Changes</option>
                  </select>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button className="flex-1" onClick={() => toast.success('Audit logs generated')}>
                  <Search className="h-4 w-4 mr-2" />
                  Generate Audit Report
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => toast.success('Audit logs exported')}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Logs
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Data Protection Impact Assessment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Data Protection Impact Assessment
              </CardTitle>
              <CardDescription>
                Assess and manage privacy risks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <Button variant="outline" className="h-20 flex-col" onClick={() => toast.success('DPIA assessment started')}>
                  <Shield className="h-6 w-6 mb-2" />
                  <span>Start New DPIA</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col" onClick={() => toast.success('DPIA reports loaded')}>
                  <FileText className="h-6 w-6 mb-2" />
                  <span>View DPIA Reports</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Financial Management Tab */}
        <TabsContent value="financial" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Transaction Monitoring */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Transaction Monitoring
                </CardTitle>
                <CardDescription>
                  Monitor and manage payment transactions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Transaction Status</label>
                  <select className="w-full p-2 border rounded">
                    <option value="all">All Transactions</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date Range</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="date" className="p-2 border rounded" />
                    <input type="date" className="p-2 border rounded" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Amount Range (£)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="number" className="p-2 border rounded" placeholder="Min" />
                    <input type="number" className="p-2 border rounded" placeholder="Max" />
                  </div>
                </div>
                <Button className="w-full" onClick={() => toast.success('Transactions loaded')}>
                  <Search className="h-4 w-4 mr-2" />
                  Search Transactions
                </Button>
              </CardContent>
            </Card>

            {/* Payment Processing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Payment Processing
                </CardTitle>
                <CardDescription>
                  Manage payment methods and processing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Payment Gateway</label>
                  <select className="w-full p-2 border rounded">
                    <option value="stripe">Stripe</option>
                    <option value="paypal">PayPal</option>
                    <option value="worldpay">Worldpay</option>
                    <option value="sagepay">SagePay</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Processing Fee (%)</label>
                  <input 
                    type="number" 
                    className="w-full p-2 border rounded" 
                    placeholder="2.9" 
                    step="0.1" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Minimum Transaction (£)</label>
                  <input 
                    type="number" 
                    className="w-full p-2 border rounded" 
                    placeholder="1.00" 
                    step="0.01" 
                  />
                </div>
                <div className="flex space-x-2">
                  <Button className="flex-1" onClick={() => toast.success('Payment settings updated')}>
                    <Settings className="h-4 w-4 mr-2" />
                    Update Settings
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={() => toast.success('Gateway tested')}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Test Gateway
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Revenue Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Revenue Analytics
              </CardTitle>
              <CardDescription>
                Analyze revenue trends and financial performance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Time Period</label>
                  <select className="w-full p-2 border rounded">
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="quarter">This Quarter</option>
                    <option value="year">This Year</option>
                    <option value="custom">Custom Range</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Revenue Type</label>
                  <select className="w-full p-2 border rounded">
                    <option value="all">All Revenue</option>
                    <option value="bookings">Booking Fees</option>
                    <option value="commissions">Commissions</option>
                    <option value="subscriptions">Subscriptions</option>
                    <option value="services">Additional Services</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Property Type</label>
                  <select className="w-full p-2 border rounded">
                    <option value="all">All Properties</option>
                    <option value="residential">Residential</option>
                    <option value="commercial">Commercial</option>
                    <option value="land">Land</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Location</label>
                  <input 
                    type="text" 
                    className="w-full p-2 border rounded" 
                    placeholder="Filter by location" 
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                <Button className="flex-1" onClick={() => toast.success('Revenue analytics generated')}>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Generate Analytics
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => toast.success('Revenue forecast generated')}>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Revenue Forecast
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Financial Reports */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Financial Reports
              </CardTitle>
              <CardDescription>
                Generate comprehensive financial reports
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Report Type</label>
                  <select className="w-full p-2 border rounded">
                    <option value="profit-loss">Profit &amp; Loss</option>
                    <option value="cash-flow">Cash Flow</option>
                    <option value="balance-sheet">Balance Sheet</option>
                    <option value="tax-summary">Tax Summary</option>
                    <option value="commission-report">Commission Report</option>
                    <option value="expense-report">Expense Report</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Report Period</label>
                  <select className="w-full p-2 border rounded">
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                    <option value="custom">Custom Period</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Export Format</label>
                  <select className="w-full p-2 border rounded">
                    <option value="pdf">PDF</option>
                    <option value="excel">Excel</option>
                    <option value="csv">CSV</option>
                    <option value="json">JSON</option>
                  </select>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-4">
                <Button variant="outline" className="h-20 flex-col" onClick={() => toast.success('Financial report generated')}>
                  <FileText className="h-6 w-6 mb-2" />
                  <span>Generate Report</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col" onClick={() => toast.success('Report scheduled')}>
                  <Calendar className="h-6 w-6 mb-2" />
                  <span>Schedule Report</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col" onClick={() => toast.success('Tax documents prepared')}>
                  <Calculator className="h-6 w-6 mb-2" />
                  <span>Tax Documents</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col" onClick={() => toast.success('Audit trail generated')}>
                  <Shield className="h-6 w-6 mb-2" />
                  <span>Audit Trail</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Monitoring Tab */}
        <TabsContent value="security" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Threat Detection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Threat Detection
                </CardTitle>
                <CardDescription>
                  Monitor and respond to security threats
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Threat Level</label>
                  <select className="w-full p-2 border rounded">
                    <option value="all">All Threats</option>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Threat Type</label>
                  <select className="w-full p-2 border rounded">
                    <option value="all">All Types</option>
                    <option value="brute-force">Brute Force</option>
                    <option value="sql-injection">SQL Injection</option>
                    <option value="xss">Cross-Site Scripting</option>
                    <option value="ddos">DDoS Attack</option>
                    <option value="malware">Malware</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Time Range</label>
                  <select className="w-full p-2 border rounded">
                    <option value="1h">Last Hour</option>
                    <option value="24h">Last 24 Hours</option>
                    <option value="7d">Last 7 Days</option>
                    <option value="30d">Last 30 Days</option>
                  </select>
                </div>
                <Button className="w-full" onClick={() => toast.success('Threat scan initiated')}>
                  <Search className="h-4 w-4 mr-2" />
                  Scan for Threats
                </Button>
              </CardContent>
            </Card>

            {/* Access Control */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lock className="h-5 w-5 mr-2" />
                  Access Control
                </CardTitle>
                <CardDescription>
                  Manage user access and permissions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Failed Login Threshold</label>
                  <input 
                    type="number" 
                    className="w-full p-2 border rounded" 
                    placeholder="5" 
                    min="1" 
                    max="10" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Account Lockout Duration (minutes)</label>
                  <input 
                    type="number" 
                    className="w-full p-2 border rounded" 
                    placeholder="30" 
                    min="5" 
                    max="1440" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Session Timeout (minutes)</label>
                  <input 
                    type="number" 
                    className="w-full p-2 border rounded" 
                    placeholder="60" 
                    min="15" 
                    max="480" 
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="two-factor" className="rounded" />
                  <label htmlFor="two-factor" className="text-sm font-medium">Require Two-Factor Authentication</label>
                </div>
                <Button className="w-full" onClick={() => toast.success('Access control settings updated')}>
                  <Settings className="h-4 w-4 mr-2" />
                  Update Settings
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Security Logs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Security Audit Logs
              </CardTitle>
              <CardDescription>
                View and analyze security-related events
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Log Type</label>
                  <select className="w-full p-2 border rounded">
                    <option value="all">All Logs</option>
                    <option value="login">Login Attempts</option>
                    <option value="access">Access Events</option>
                    <option value="admin">Admin Actions</option>
                    <option value="data">Data Changes</option>
                    <option value="security">Security Events</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Severity</label>
                  <select className="w-full p-2 border rounded">
                    <option value="all">All Levels</option>
                    <option value="critical">Critical</option>
                    <option value="warning">Warning</option>
                    <option value="info">Information</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">User</label>
                  <input 
                    type="text" 
                    className="w-full p-2 border rounded" 
                    placeholder="Filter by user" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">IP Address</label>
                  <input 
                    type="text" 
                    className="w-full p-2 border rounded" 
                    placeholder="Filter by IP" 
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                <Button className="flex-1" onClick={() => toast.success('Security logs loaded')}>
                  <Search className="h-4 w-4 mr-2" />
                  Search Logs
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => toast.success('Logs exported')}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Logs
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Security Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Security Configuration
              </CardTitle>
              <CardDescription>
                Configure security policies and monitoring
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-4">
                <Button variant="outline" className="h-20 flex-col" onClick={() => toast.success('Firewall rules updated')}>
                  <Shield className="h-6 w-6 mb-2" />
                  <span>Firewall Rules</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col" onClick={() => toast.success('SSL certificates checked')}>
                  <Lock className="h-6 w-6 mb-2" />
                  <span>SSL Certificates</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col" onClick={() => toast.success('Backup encryption configured')}>
                  <Database className="h-6 w-6 mb-2" />
                  <span>Backup Encryption</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col" onClick={() => toast.success('Security scan initiated')}>
                  <Search className="h-6 w-6 mb-2" />
                  <span>Vulnerability Scan</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Maintenance & Oversight Tab */}
        <TabsContent value="maintenance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* System Health */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  System Health
                </CardTitle>
                <CardDescription>
                  Monitor system performance and health metrics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">CPU Usage</span>
                    <span className="text-sm text-green-600">23%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{width: '23%'}}></div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Memory Usage</span>
                    <span className="text-sm text-yellow-600">67%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-600 h-2 rounded-full" style={{width: '67%'}}></div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Disk Usage</span>
                    <span className="text-sm text-blue-600">45%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{width: '45%'}}></div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Database Connections</span>
                    <span className="text-sm text-green-600">12/100</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{width: '12%'}}></div>
                  </div>
                </div>
                <Button className="w-full" onClick={() => toast.success('System health check completed')}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Health Check
                </Button>
              </CardContent>
            </Card>

            {/* Performance Monitoring */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Performance Monitoring
                </CardTitle>
                <CardDescription>
                  Track system performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Monitoring Period</label>
                  <select className="w-full p-2 border rounded">
                    <option value="1h">Last Hour</option>
                    <option value="24h">Last 24 Hours</option>
                    <option value="7d">Last 7 Days</option>
                    <option value="30d">Last 30 Days</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Metric Type</label>
                  <select className="w-full p-2 border rounded">
                    <option value="all">All Metrics</option>
                    <option value="response-time">Response Time</option>
                    <option value="throughput">Throughput</option>
                    <option value="error-rate">Error Rate</option>
                    <option value="resource-usage">Resource Usage</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="p-2 bg-gray-50 rounded">
                    <div className="font-medium">Avg Response Time</div>
                    <div className="text-green-600">245ms</div>
                  </div>
                  <div className="p-2 bg-gray-50 rounded">
                    <div className="font-medium">Requests/min</div>
                    <div className="text-blue-600">1,234</div>
                  </div>
                  <div className="p-2 bg-gray-50 rounded">
                    <div className="font-medium">Error Rate</div>
                    <div className="text-red-600">0.02%</div>
                  </div>
                  <div className="p-2 bg-gray-50 rounded">
                    <div className="font-medium">Uptime</div>
                    <div className="text-green-600">99.98%</div>
                  </div>
                </div>
                <Button className="w-full" onClick={() => toast.success('Performance report generated')}>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Scheduled Tasks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Scheduled Tasks & Maintenance
              </CardTitle>
              <CardDescription>
                Manage automated tasks and maintenance schedules
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <h4 className="font-medium">Database Maintenance</h4>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start" onClick={() => toast.success('Database backup initiated')}>
                      <Database className="h-4 w-4 mr-2" />
                      Backup Database
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => toast.success('Database optimization started')}>
                      <Zap className="h-4 w-4 mr-2" />
                      Optimize Database
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => toast.success('Index rebuild scheduled')}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Rebuild Indexes
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">System Cleanup</h4>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start" onClick={() => toast.success('Log cleanup initiated')}>
                      <FileText className="h-4 w-4 mr-2" />
                      Clean Log Files
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => toast.success('Cache cleared')}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear Cache
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => toast.success('Temp files cleaned')}>
                      <HardDrive className="h-4 w-4 mr-2" />
                      Clean Temp Files
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Security Tasks</h4>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start" onClick={() => toast.success('Security scan scheduled')}>
                      <Shield className="h-4 w-4 mr-2" />
                      Security Scan
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => toast.success('SSL certificates checked')}>
                      <Lock className="h-4 w-4 mr-2" />
                      Check SSL Certs
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => toast.success('Access logs archived')}>
                      <Archive className="h-4 w-4 mr-2" />
                      Archive Logs
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Backup & Recovery */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <HardDrive className="h-5 w-5 mr-2" />
                Backup & Recovery
              </CardTitle>
              <CardDescription>
                Manage system backups and recovery options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <h4 className="font-medium">Backup Configuration</h4>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Backup Frequency</label>
                    <select className="w-full p-2 border rounded">
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Retention Period (days)</label>
                    <input 
                      type="number" 
                      className="w-full p-2 border rounded" 
                      placeholder="30" 
                      min="1" 
                      max="365" 
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="compress-backup" className="rounded" />
                    <label htmlFor="compress-backup" className="text-sm font-medium">Compress Backups</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="encrypt-backup" className="rounded" />
                    <label htmlFor="encrypt-backup" className="text-sm font-medium">Encrypt Backups</label>
                  </div>
                  <Button className="w-full" onClick={() => toast.success('Backup configuration updated')}>
                    <Settings className="h-4 w-4 mr-2" />
                    Update Configuration
                  </Button>
                </div>
                <div className="space-y-4">
                  <h4 className="font-medium">Recovery Options</h4>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Select Backup</label>
                    <select className="w-full p-2 border rounded">
                      <option value="latest">Latest Backup (2024-01-15)</option>
                      <option value="yesterday">Yesterday (2024-01-14)</option>
                      <option value="week">Last Week (2024-01-08)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Recovery Type</label>
                    <select className="w-full p-2 border rounded">
                      <option value="full">Full System Recovery</option>
                      <option value="database">Database Only</option>
                      <option value="files">Files Only</option>
                      <option value="selective">Selective Recovery</option>
                    </select>
                  </div>
                  <Button variant="destructive" className="w-full" onClick={() => toast.success('Recovery process initiated')}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Start Recovery
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => toast.success('Backup verification completed')}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Verify Backup
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Land Registry Import Tab */}
        <TabsContent value="import" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Upload className="h-5 w-5 mr-2" />
                Land Registry Import
              </CardTitle>
              <CardDescription>
                Import and process Land Registry CSV data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <CsvUploadComponent
                  onUploadSuccess={(job) => {
                    setSelectedImportJob(job);
                    setRefreshImportHistory(prev => prev + 1);
                  }}
                  onUploadError={(error) => {
                    console.error('Upload error:', error);
                  }}
                  maxFileSize={100}
                  className="mb-6"
                />
                
                <div className="border-t pt-6">
                  <ImportHistoryComponent
                    onJobSelect={(job) => setSelectedImportJob(job)}
                    refreshTrigger={refreshImportHistory}
                  />
                </div>
              </div>
              
              {/* Import Job Details Modal/Panel */}
              {selectedImportJob && (
                <div className="mt-6 p-6 border rounded-lg bg-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Import Job Details</h3>
                    <Button
                      onClick={() => setSelectedImportJob(null)}
                      variant="ghost"
                      size="sm"
                    >
                      ×
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-2">Job Information</h4>
                      <dl className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Filename:</dt>
                          <dd>{selectedImportJob.filename}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Status:</dt>
                          <dd>
                            <Badge variant={getStatusBadgeVariant(selectedImportJob.status)}>
                              {selectedImportJob.status}
                            </Badge>
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Created:</dt>
                          <dd>{formatDate(selectedImportJob.createdAt)}</dd>
                        </div>
                      </dl>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Statistics</h4>
                      <dl className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Total Rows:</dt>
                          <dd>{selectedImportJob.totalRows?.toLocaleString() || 0}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Processed:</dt>
                          <dd className="text-blue-600">{selectedImportJob.processedRows?.toLocaleString() || 0}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Errors:</dt>
                          <dd className="text-red-600">{selectedImportJob.errorRows?.toLocaleString() || 0}</dd>
                        </div>
                        {selectedImportJob.status === 'processing' && (
                          <div className="mt-2">
                            <Progress value={selectedImportJob.progress || 0} />
                          </div>
                        )}
                      </dl>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;