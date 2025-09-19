import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Users,
  Shield,
  Activity,
  Database,
  Settings,
  AlertTriangle,
  TrendingUp,
  Server,
  Lock,
  Eye,
  UserCheck,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react';

interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalProperties: number;
  systemUptime: string;
  databaseSize: string;
  apiCalls: number;
}

interface SecurityEvent {
  id: string;
  type: 'login_attempt' | 'permission_denied' | 'data_breach' | 'suspicious_activity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  timestamp: string;
  userId?: string;
  ipAddress: string;
}

interface AnalyticsData {
  userGrowth: number;
  propertyGrowth: number;
  revenueGrowth: number;
  systemPerformance: number;
}

const SuperAdminDashboard: React.FC = () => {
  const [systemStats, setSystemStats] = useState<SystemStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalProperties: 0,
    systemUptime: '0 days',
    databaseSize: '0 GB',
    apiCalls: 0
  });

  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    userGrowth: 0,
    propertyGrowth: 0,
    revenueGrowth: 0,
    systemPerformance: 0
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Simulate API calls - replace with actual API endpoints
      await Promise.all([
        loadSystemStats(),
        loadSecurityEvents(),
        loadAnalytics()
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSystemStats = async () => {
    // Mock data - replace with actual API call
    setSystemStats({
      totalUsers: 15420,
      activeUsers: 8934,
      totalProperties: 3256,
      systemUptime: '45 days, 12 hours',
      databaseSize: '2.4 GB',
      apiCalls: 1250000
    });
  };

  const loadSecurityEvents = async () => {
    // Mock data - replace with actual API call
    setSecurityEvents([
      {
        id: '1',
        type: 'suspicious_activity',
        severity: 'high',
        description: 'Multiple failed login attempts from IP 192.168.1.100',
        timestamp: '2024-01-15T10:30:00Z',
        userId: 'user123',
        ipAddress: '192.168.1.100'
      },
      {
        id: '2',
        type: 'permission_denied',
        severity: 'medium',
        description: 'Unauthorized access attempt to admin panel',
        timestamp: '2024-01-15T09:15:00Z',
        userId: 'user456',
        ipAddress: '10.0.0.50'
      }
    ]);
  };

  const loadAnalytics = async () => {
    // Mock data - replace with actual API call
    setAnalytics({
      userGrowth: 12.5,
      propertyGrowth: 8.3,
      revenueGrowth: 15.7,
      systemPerformance: 94.2
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'login_attempt': return <UserCheck className="h-4 w-4" />;
      case 'permission_denied': return <Lock className="h-4 w-4" />;
      case 'data_breach': return <AlertTriangle className="h-4 w-4" />;
      case 'suspicious_activity': return <Eye className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>
          <p className="text-gray-600">Complete system oversight and management</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={loadDashboardData}>
            <Activity className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Settings className="h-4 w-4 mr-2" />
            System Settings
          </Button>
        </div>
      </div>

      {/* System Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {systemStats.activeUsers.toLocaleString()} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Properties</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.totalProperties.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +{analytics.propertyGrowth}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.systemUptime}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.systemPerformance}% performance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Calls</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.apiCalls.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Database: {systemStats.databaseSize}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="analytics" className="space-y-4">
        <TabsList>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="system">System Management</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  User Growth
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">+{analytics.userGrowth}%</div>
                <Progress value={analytics.userGrowth} className="mt-2" />
                <p className="text-sm text-muted-foreground mt-2">vs last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Property Growth
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">+{analytics.propertyGrowth}%</div>
                <Progress value={analytics.propertyGrowth} className="mt-2" />
                <p className="text-sm text-muted-foreground mt-2">vs last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <LineChart className="h-5 w-5 mr-2" />
                  Revenue Growth
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">+{analytics.revenueGrowth}%</div>
                <Progress value={analytics.revenueGrowth} className="mt-2" />
                <p className="text-sm text-muted-foreground mt-2">vs last month</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Security Events
              </CardTitle>
              <CardDescription>
                Recent security events and alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {securityEvents.map((event) => (
                  <div key={event.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <div className={`p-2 rounded-full ${getSeverityColor(event.severity)}`}>
                      {getEventIcon(event.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{event.description}</h4>
                        <Badge variant={event.severity === 'critical' ? 'destructive' : 'secondary'}>
                          {event.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(event.timestamp).toLocaleString()} • IP: {event.ipAddress}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Investigate
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>System Configuration</CardTitle>
                <CardDescription>Manage system-wide settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full" variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Global Settings
                </Button>
                <Button className="w-full" variant="outline">
                  <Database className="h-4 w-4 mr-2" />
                  Database Management
                </Button>
                <Button className="w-full" variant="outline">
                  <Server className="h-4 w-4 mr-2" />
                  Server Configuration
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
                <CardDescription>Monitor system performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>CPU Usage</span>
                      <span>45%</span>
                    </div>
                    <Progress value={45} className="mt-1" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Memory Usage</span>
                      <span>67%</span>
                    </div>
                    <Progress value={67} className="mt-1" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Disk Usage</span>
                      <span>23%</span>
                    </div>
                    <Progress value={23} className="mt-1" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                User Management
              </CardTitle>
              <CardDescription>
                Manage user accounts and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button className="h-20 flex-col">
                  <Users className="h-6 w-6 mb-2" />
                  Manage Users
                </Button>