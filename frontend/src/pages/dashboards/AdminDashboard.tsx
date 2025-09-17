import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { User, UserRole } from '../../types/auth';
import { formatCurrency } from '../../utils';
import {
  Users,
  Building,
  Banknote,
  AlertTriangle,
  Search,
  Download,
  Plus,
  Eye,
  Edit,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Clock,
  UserCheck,
  UserX,
  Shield,
  Trash2,
  Activity,
  Database,
  HardDrive,
  Cpu,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Calendar,
  Globe,
  Zap,
  Target,
  Award,
  PoundSterling,
  Percent,
  ArrowUp,
  ArrowDown,
  Monitor,
  Server,
  Wifi,
  Settings,
  Wrench,
  Lock,
  Upload,
  FileText,
  RefreshCw,
  Key,
  FileCheck,
  CreditCard,
  Receipt,
  Bell,
  Mail,
  Phone,
  MapPin,
  Home,
  Car,
  Briefcase
} from 'lucide-react';

interface AdminStats {
  totalUsers: number;
  totalProperties: number;
  totalRevenue: number;
  systemAlerts: number;
  monthlyGrowth: number;
  activeUsers: number;
  totalTransactions: number;
  conversionRate: number;
  averageSessionTime: string;
  platformUptime: number;
  apiCalls: number;
  storageUsed: number;
  dailyRevenue: number;
  weeklyRevenue: number;
  monthlyRevenue: number;
  userRetention: number;
  churnRate: number;
  customerSatisfaction: number;
}

// User interface imported from types

interface SystemAlert {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  resolved: boolean;
}

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalProperties: 0,
    totalRevenue: 0,
    systemAlerts: 0,
    monthlyGrowth: 0,
    activeUsers: 0,
    totalTransactions: 0,
    conversionRate: 0,
    averageSessionTime: '0m 0s',
    platformUptime: 0,
    apiCalls: 0,
    storageUsed: 0,
    dailyRevenue: 0,
    weeklyRevenue: 0,
    monthlyRevenue: 0,
    userRetention: 0,
    churnRate: 0,
    customerSatisfaction: 0
  });
  const [users, setUsers] = useState<User[]>([]);
  const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    // Simulate loading admin data
    const loadAdminData = async () => {
      setLoading(true);
      
      // Mock admin statistics
      const mockStats: AdminStats = {
        totalUsers: 1247,
        totalProperties: 856,
        totalRevenue: 2450000,
        systemAlerts: 12,
        monthlyGrowth: 24.5,
        activeUsers: 8234,
        totalTransactions: 12847,
        conversionRate: 3.2,
        averageSessionTime: '12m 34s',
        platformUptime: 99.8,
        apiCalls: 1247893,
        storageUsed: 78.5,
        dailyRevenue: 94913,
        weeklyRevenue: 664391,
        monthlyRevenue: 2450000,
        userRetention: 87.3,
        churnRate: 2.1,
        customerSatisfaction: 4.7
      };

      // Mock users data
      const mockUsers: User[] = [
        {
          id: '1',
          firstName: 'John',
          lastName: 'Smith',
          email: 'john.smith@email.com',
          role: UserRole.AGENT,
          isActive: true,
          isEmailVerified: true,
          lastLogin: '2024-01-15T10:30:00Z',
          createdAt: '2023-06-15T09:00:00Z',
          updatedAt: '2024-01-15T10:30:00Z'
        },
        {
          id: '2',
          firstName: 'Sarah',
          lastName: 'Johnson',
          email: 'sarah.johnson@email.com',
          role: UserRole.LANDLORD,
          isActive: true,
          isEmailVerified: true,
          lastLogin: '2024-01-14T16:45:00Z',
          createdAt: '2023-08-22T11:30:00Z',
          updatedAt: '2024-01-14T16:45:00Z'
        },
        {
          id: '3',
          firstName: 'Mike',
          lastName: 'Brown',
          email: 'mike.brown@email.com',
          role: UserRole.TENANT,
          isActive: false,
          isEmailVerified: false,
          lastLogin: '2024-01-10T14:20:00Z',
          createdAt: '2023-11-05T13:15:00Z',
          updatedAt: '2024-01-10T14:20:00Z'
        }
      ];

      // Mock system alerts
      const mockAlerts: SystemAlert[] = [
        {
          id: '1',
          type: 'security',
          severity: 'high',
          message: 'Multiple failed login attempts detected',
          timestamp: '2024-01-15T09:30:00Z',
          resolved: false
        },
        {
          id: '2',
          type: 'system',
          severity: 'medium',
          message: 'Database backup completed successfully',
          timestamp: '2024-01-15T02:00:00Z',
          resolved: true
        },
        {
          id: '3',
          type: 'payment',
          severity: 'critical',
          message: 'Payment gateway connection timeout',
          timestamp: '2024-01-14T18:45:00Z',
          resolved: false
        }
      ];

      setStats(mockStats);
      setUsers(mockUsers);
      setSystemAlerts(mockAlerts);
      setLoading(false);
    };

    loadAdminData();
  }, []);

  const handleUserAction = (userId: string, action: string) => {
    setUsers(prevUsers => 
      prevUsers.map(user => {
        if (user.id === userId) {
          switch (action) {
            case 'suspend':
              return { ...user, isActive: false };
            case 'activate':
              return { ...user, isActive: true };
            case 'verify':
              return { ...user, isEmailVerified: true };
            case 'delete':
              return user; // Handle delete separately
            default:
              return user;
          }
        }
        return user;
      })
    );

    if (action === 'delete') {
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
    }
  };

  const exportData = (type: string) => {
    console.log(`Exporting ${type} data...`);
    // Implement export functionality
  };



  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'bg-blue-100 text-blue-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 container-responsive component-spacing">
      {/* Header */}
      <div className="stack-lg">
        <h1 className="text-heading-1">Admin Dashboard</h1>
        <p className="text-body-lg text-gray-600">Manage users, properties, and system settings</p>
      </div>

      {/* Navigation Tabs */}
      <div className="stack-md">
        <nav className="flex flex-wrap gap-sm lg:gap-lg lg:flex-nowrap">
          {[
            { id: 'overview', label: 'System Overview', icon: BarChart3 },
            { id: 'users', label: 'User Management', icon: Users },
            { id: 'system-config', label: 'System Config', icon: Settings },
            { id: 'analytics', label: 'Analytics & Reports', icon: TrendingUp },
            { id: 'gdpr', label: 'GDPR Compliance', icon: Shield },
            { id: 'financial', label: 'Financial Management', icon: Banknote },
            { id: 'maintenance', label: 'Maintenance', icon: Wrench },
            { id: 'integrations', label: 'Integration Services', icon: Database },
            { id: 'security', label: 'Security Monitoring', icon: Lock },
            { id: 'land-registry', label: 'Land Registry Import', icon: Upload }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-3 py-2 text-body-sm font-medium rounded-lg transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 border border-transparent'
                }`}
              >
                <Icon className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="stack-lg section-spacing">
          {/* Primary Statistics Cards */}
          <div className="grid-dashboard-stats">
            <Card>
              <CardContent className="card-compact">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-label text-gray-600">Total Users</p>
                    <p className="text-heading-3">{stats.totalUsers.toLocaleString()}</p>
                    <div className="flex items-center mt-2">
                      <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-caption text-green-500 font-medium">+{stats.monthlyGrowth}%</span>
                      <span className="text-caption text-gray-500 ml-1">this month</span>
                    </div>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="card-compact">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-label text-gray-600">Total Properties</p>
                    <p className="text-heading-3">{stats.totalProperties.toLocaleString()}</p>
                    <div className="flex items-center mt-2">
                      <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-caption text-green-500 font-medium">+12.3%</span>
                      <span className="text-caption text-gray-500 ml-1">this month</span>
                    </div>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Building className="h-8 w-8 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="card-compact">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-label text-gray-600">Monthly Revenue</p>
                    <p className="text-heading-3">£{stats.monthlyRevenue.toLocaleString()}</p>
                    <div className="flex items-center mt-2">
                      <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-caption text-green-500 font-medium">+18.7%</span>
                      <span className="text-caption text-gray-500 ml-1">vs last month</span>
                    </div>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Banknote className="h-8 w-8 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="card-compact">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-label text-gray-600">System Alerts</p>
                    <p className="text-heading-3">{stats.systemAlerts}</p>
                    <div className="flex items-center mt-2">
                      <ArrowDown className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-caption text-green-500 font-medium">-25%</span>
                      <span className="text-caption text-gray-500 ml-1">vs last week</span>
                    </div>
                  </div>
                  <div className="p-3 bg-red-100 rounded-lg">
                    <AlertTriangle className="h-8 w-8 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Secondary KPI Cards */}
          <div className="grid-dashboard-stats section-spacing">
            <Card>
              <CardContent className="card-compact">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-label text-gray-600">Active Users</p>
                    <p className="text-heading-4">{stats.activeUsers.toLocaleString()}</p>
                    <p className="text-caption text-gray-500">Last 30 days</p>
                  </div>
                  <Activity className="h-6 w-6 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="card-compact">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-label text-gray-600">Conversion Rate</p>
                    <p className="text-heading-4">{stats.conversionRate}%</p>
                    <p className="text-caption text-gray-500">Visitor to user</p>
                  </div>
                  <Target className="h-6 w-6 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="card-compact">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-label text-gray-600">Platform Uptime</p>
                    <p className="text-heading-4">{stats.platformUptime}%</p>
                    <p className="text-caption text-gray-500">This month</p>
                  </div>
                  <Shield className="h-6 w-6 text-purple-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="card-compact">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-label text-gray-600">Customer Satisfaction</p>
                    <p className="text-heading-4">{stats.customerSatisfaction}/5</p>
                    <p className="text-caption text-gray-500">Average rating</p>
                  </div>
                  <Award className="h-6 w-6 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Real-time Analytics */}
          <div className="grid-responsive section-spacing">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-heading-4">
                  <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Revenue Analytics
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="stack-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-body text-gray-600">Daily Revenue</span>
                    <span className="text-body font-semibold">£{stats.dailyRevenue.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-body text-gray-600">Weekly Revenue</span>
                    <span className="text-body font-semibold">£{stats.weeklyRevenue.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-body text-gray-600">Total Transactions</span>
                    <span className="text-body font-semibold">{stats.totalTransactions.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-body text-gray-600">Average Transaction</span>
                    <span className="text-body font-semibold">£{Math.round(stats.monthlyRevenue / stats.totalTransactions).toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-heading-4">
                  <PieChart className="h-5 w-5 mr-2" />
                  User Engagement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="stack-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-body text-gray-600">User Retention</span>
                    <span className="text-body font-semibold">{stats.userRetention}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-body text-gray-600">Churn Rate</span>
                    <span className="text-body font-semibold">{stats.churnRate}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-body text-gray-600">Avg Session Time</span>
                    <span className="text-body font-semibold">{stats.averageSessionTime}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-body text-gray-600">API Calls Today</span>
                    <span className="text-body font-semibold">{(stats.apiCalls / 30).toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="grid-responsive section-spacing">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-heading-4">Recent Users</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="stack-sm">
                  {users.slice(0, 3).map((userItem) => (
                    <div key={userItem.id} className="flex items-center justify-between card-compact border rounded-lg">
                      <div className="flex-1">
                        <h4 className="text-body font-medium text-gray-900">{userItem.firstName} {userItem.lastName}</h4>
                        <p className="text-body text-gray-600">{userItem.email}</p>
                        <p className="text-caption text-gray-500 capitalize">{userItem.role}</p>
                      </div>
                      <div className="flex items-center gap-sm">
                        <span className={`px-2 py-1 rounded-full text-caption font-medium ${getStatusColor(userItem.isActive ? 'active' : 'inactive')}`}>
                          {userItem.isActive ? 'active' : 'inactive'}
                        </span>
                        {userItem.isEmailVerified ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <Clock className="h-4 w-4 text-yellow-500" />
                        )}

      {/* System Configuration Tab */}
      {activeTab === 'system-config' && (
        <div className="space-y-6">
          {/* System Settings Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  General Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Globe className="h-4 w-4 mr-2" />
                    Site Configuration
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Mail className="h-4 w-4 mr-2" />
                    Email Settings
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Bell className="h-4 w-4 mr-2" />
                    Notification Preferences
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Key className="h-4 w-4 mr-2" />
                    API Configuration
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="h-5 w-5 mr-2" />
                  Database Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Backup & Restore
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Monitor className="h-4 w-4 mr-2" />
                    Performance Monitoring
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <HardDrive className="h-4 w-4 mr-2" />
                    Storage Management
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Zap className="h-4 w-4 mr-2" />
                    Query Optimization
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Lock className="h-4 w-4 mr-2" />
                    Access Control
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Key className="h-4 w-4 mr-2" />
                    Authentication
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileCheck className="h-4 w-4 mr-2" />
                    Audit Logs
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Security Alerts
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* GDPR Compliance Tab */}
      {activeTab === 'gdpr' && (
        <div className="space-y-6">
          {/* GDPR Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Data Requests</p>
                    <p className="text-2xl font-bold text-blue-600">23</p>
                    <p className="text-xs text-gray-500">This month</p>
                  </div>
                  <FileCheck className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Consent Rate</p>
                    <p className="text-2xl font-bold text-green-600">94.2%</p>
                    <p className="text-xs text-gray-500">User consent</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Data Breaches</p>
                    <p className="text-2xl font-bold text-red-600">0</p>
                    <p className="text-xs text-gray-500">Last 12 months</p>
                  </div>
                  <Shield className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Compliance Score</p>
                    <p className="text-2xl font-bold text-purple-600">98%</p>
                    <p className="text-xs text-gray-500">Overall rating</p>
                  </div>
                  <Award className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* GDPR Management Tools */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Data Subject Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Eye className="h-4 w-4 mr-2" />
                    View Data Requests
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Export User Data
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete User Data
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileCheck className="h-4 w-4 mr-2" />
                    Consent Management
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Privacy Controls
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="h-4 w-4 mr-2" />
                    Privacy Settings
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Bell className="h-4 w-4 mr-2" />
                    Breach Notifications
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Privacy Policy Updates
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Activity className="h-4 w-4 mr-2" />
                    Audit Trail
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Financial Management Tab */}
      {activeTab === 'financial' && (
        <div className="space-y-6">
          {/* Financial Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-green-600">£{stats.monthlyRevenue.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">This month</p>
                  </div>
                  <Banknote className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Commission Earned</p>
                    <p className="text-2xl font-bold text-blue-600">£{Math.round(stats.monthlyRevenue * 0.15).toLocaleString()}</p>
                    <p className="text-xs text-gray-500">15% commission</p>
                  </div>
                  <Receipt className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Payments</p>
                    <p className="text-2xl font-bold text-yellow-600">£{Math.round(stats.monthlyRevenue * 0.08).toLocaleString()}</p>
                    <p className="text-xs text-gray-500">Awaiting processing</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Refunds Issued</p>
                    <p className="text-2xl font-bold text-red-600">£{Math.round(stats.monthlyRevenue * 0.02).toLocaleString()}</p>
                    <p className="text-xs text-gray-500">2% of revenue</p>
                  </div>
                  <CreditCard className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Financial Management Tools */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Payment Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Eye className="h-4 w-4 mr-2" />
                    View Transactions
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Process Refunds
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Receipt className="h-4 w-4 mr-2" />
                    Generate Invoices
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Export Financial Data
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Financial Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Revenue Trends
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <PieChart className="h-4 w-4 mr-2" />
                    Commission Breakdown
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Target className="h-4 w-4 mr-2" />
                    Performance Metrics
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="h-4 w-4 mr-2" />
                    Financial Forecasting
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Maintenance Tab */}
      {activeTab === 'maintenance' && (
        <div className="space-y-6">
          {/* System Health Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">System Uptime</p>
                    <p className="text-2xl font-bold text-green-600">{stats.platformUptime}%</p>
                    <p className="text-xs text-gray-500">Last 30 days</p>
                  </div>
                  <Server className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Issues</p>
                    <p className="text-2xl font-bold text-yellow-600">3</p>
                    <p className="text-xs text-gray-500">Requires attention</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Last Backup</p>
                    <p className="text-2xl font-bold text-blue-600">2h ago</p>
                    <p className="text-xs text-gray-500">Successful</p>
                  </div>
                  <HardDrive className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Scheduled Tasks</p>
                    <p className="text-2xl font-bold text-purple-600">12</p>
                    <p className="text-xs text-gray-500">Running</p>
                  </div>
                  <Wrench className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Maintenance Tools */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Wrench className="h-5 w-5 mr-2" />
                  System Maintenance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    System Updates
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <HardDrive className="h-4 w-4 mr-2" />
                    Database Maintenance
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Zap className="h-4 w-4 mr-2" />
                    Performance Optimization
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Monitor className="h-4 w-4 mr-2" />
                    Health Checks
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Monitoring & Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Bell className="h-4 w-4 mr-2" />
                    Alert Configuration
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Eye className="h-4 w-4 mr-2" />
                    System Logs
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Performance Metrics
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Export Diagnostics
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Integration Services Tab */}
      {activeTab === 'integrations' && (
        <div className="space-y-6">
          {/* Integration Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Integrations</p>
                    <p className="text-2xl font-bold text-green-600">8</p>
                    <p className="text-xs text-gray-500">Connected services</p>
                  </div>
                  <Database className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">API Calls Today</p>
                    <p className="text-2xl font-bold text-blue-600">{Math.round(stats.apiCalls / 30).toLocaleString()}</p>
                    <p className="text-xs text-gray-500">Successful requests</p>
                  </div>
                  <Globe className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Failed Requests</p>
                    <p className="text-2xl font-bold text-red-600">12</p>
                    <p className="text-xs text-gray-500">Last 24 hours</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Response Time</p>
                    <p className="text-2xl font-bold text-purple-600">245ms</p>
                    <p className="text-xs text-gray-500">Average</p>
                  </div>
                  <Zap className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Integration Management */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="h-5 w-5 mr-2" />
                  External Services
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Home className="h-4 w-4 mr-2" />
                    Land Registry API
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Briefcase className="h-4 w-4 mr-2" />
                    Companies House
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <MapPin className="h-4 w-4 mr-2" />
                    Royal Mail PAF
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Globe className="h-4 w-4 mr-2" />
                    Ordnance Survey
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  API Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Key className="h-4 w-4 mr-2" />
                    API Keys
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Monitor className="h-4 w-4 mr-2" />
                    Rate Limits
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Activity className="h-4 w-4 mr-2" />
                    Usage Analytics
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    API Documentation
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Security Monitoring Tab */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          {/* Security Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Security Score</p>
                    <p className="text-2xl font-bold text-green-600">95%</p>
                    <p className="text-xs text-gray-500">Excellent</p>
                  </div>
                  <Shield className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Failed Logins</p>
                    <p className="text-2xl font-bold text-red-600">23</p>
                    <p className="text-xs text-gray-500">Last 24 hours</p>
                  </div>
                  <Lock className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Sessions</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.activeUsers}</p>
                    <p className="text-xs text-gray-500">Current users</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Threats Blocked</p>
                    <p className="text-2xl font-bold text-purple-600">156</p>
                    <p className="text-xs text-gray-500">This week</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Security Management Tools */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lock className="h-5 w-5 mr-2" />
                  Access Control
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    User Permissions
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Key className="h-4 w-4 mr-2" />
                    Role Management
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Shield className="h-4 w-4 mr-2" />
                    Two-Factor Auth
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Activity className="h-4 w-4 mr-2" />
                    Session Management
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Eye className="h-5 w-5 mr-2" />
                  Security Monitoring
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Threat Detection
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Audit Logs
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Monitor className="h-4 w-4 mr-2" />
                    Real-time Monitoring
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Security Reports
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-heading-4">System Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="stack-sm">
                  {systemAlerts.map((alert) => (
                    <div key={alert.id} className="card-compact border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`px-2 py-1 rounded-full text-caption font-medium ${getSeverityColor(alert.severity)}`}>
                          {alert.severity}
                        </span>
                        <span className="text-caption text-gray-500">
                          {new Date(alert.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-body text-gray-900">{alert.message}</p>
                      <div className="mt-2 flex items-center gap-sm">
                        <span className="text-caption text-gray-500 capitalize">{alert.type}</span>
                        {alert.resolved ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div>
          {/* User Management Overview */}
          <div className="grid-responsive gap-md section-spacing">
            <Card>
              <CardContent className="card-compact">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-label text-gray-600">Total Users</p>
                    <p className="text-heading-3">{users.length}</p>
                  </div>
                  <Users className="h-6 w-6 lg:h-8 lg:w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="card-compact">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-label text-gray-600">Active Users</p>
                    <p className="text-heading-3">{users.filter(u => u.isActive).length}</p>
                  </div>
                  <UserCheck className="h-6 w-6 lg:h-8 lg:w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="card-compact">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-label text-gray-600">Verified Users</p>
                    <p className="text-heading-3">{users.filter(u => u.isEmailVerified).length}</p>
                  </div>
                  <CheckCircle className="h-6 w-6 lg:h-8 lg:w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="card-compact">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-label text-gray-600">New This Month</p>
                    <p className="text-heading-3">{Math.floor(users.length * 0.15)}</p>
                  </div>
                  <TrendingUp className="h-6 w-6 lg:h-8 lg:w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Users Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<Search className="h-4 w-4" />}
                className="w-full sm:w-64"
              />
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
              >
                <option value="all">All Roles</option>
                <option value="agent">Agent</option>
                <option value="landlord">Landlord</option>
                <option value="tenant">Tenant</option>
                <option value="buyer">Buyer</option>
                <option value="solicitor">Solicitor</option>
              </select>
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                <Settings className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Bulk Actions</span>
                <span className="sm:hidden">Bulk</span>
              </Button>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => exportData('Users')} className="w-full sm:w-auto">
                <Download className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Export</span>
                <span className="sm:hidden">Export</span>
              </Button>
              <Button variant="outline" className="w-full sm:w-auto">
                <UserCheck className="h-4 w-4 mr-2" />
                <span className="hidden lg:inline">Invite User</span>
                <span className="lg:hidden">Invite</span>
              </Button>
              <Button className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden lg:inline">Add User</span>
                <span className="lg:hidden">Add</span>
              </Button>
            </div>
          </div>

          {/* Users Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Verified
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Login
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((userItem) => (
                      <tr key={userItem.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {userItem.firstName} {userItem.lastName}
                            </div>
                            <div className="text-sm text-gray-500">{userItem.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="capitalize text-sm text-gray-900">{userItem.role}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(userItem.isActive ? 'active' : 'inactive')}`}>
                            {userItem.isActive ? 'active' : 'inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {userItem.isEmailVerified ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {userItem.lastLogin ? new Date(userItem.lastLogin).toLocaleDateString() : 'Never'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm" onClick={() => setSelectedUser(userItem)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <select
                              value={userItem.role}
                              onChange={(e) => handleUserAction(userItem.id, 'changeRole', e.target.value)}
                              className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                              <option value="agent">Agent</option>
                              <option value="landlord">Landlord</option>
                              <option value="tenant">Tenant</option>
                              <option value="buyer">Buyer</option>
                              <option value="solicitor">Solicitor</option>
                            </select>
                            {userItem.isActive ? (
                              <Button variant="ghost" size="sm" onClick={() => handleUserAction(userItem.id, 'suspend')}>
                                <UserX className="h-4 w-4 text-red-500" />
                              </Button>
                            ) : (
                              <Button variant="ghost" size="sm" onClick={() => handleUserAction(userItem.id, 'activate')}>
                                <UserCheck className="h-4 w-4 text-green-500" />
                              </Button>
                            )}
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Other tabs content can be added here */}
      {activeTab === 'properties' && (
        <div className="space-y-6">
          {/* Property Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Building className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Properties</p>
                    <p className="text-2xl font-bold text-gray-900">1,247</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Listings</p>
                    <p className="text-2xl font-bold text-gray-900">892</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Clock className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pending Approval</p>
                    <p className="text-2xl font-bold text-gray-900">23</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Banknote className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Value</p>
                    <p className="text-2xl font-bold text-gray-900">£2.4B</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Property Management Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Property Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button className="h-20 flex flex-col items-center justify-center">
                  <Plus className="h-6 w-6 mb-2" />
                  <span>Add Property</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                  <Eye className="h-6 w-6 mb-2" />
                  <span>Review Listings</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                  <Download className="h-6 w-6 mb-2" />
                  <span>Generate Report</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Real-time Analytics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                  User Growth
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">+{stats.monthlyGrowth}%</div>
                  <p className="text-sm text-gray-600">This month vs last month</p>
                  <div className="mt-4 flex justify-between text-xs text-gray-500">
                    <span>Daily: +{Math.round(stats.monthlyGrowth / 30 * 10) / 10}%</span>
                    <span>Weekly: +{Math.round(stats.monthlyGrowth / 4 * 10) / 10}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                  Revenue Growth
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">+18%</div>
                  <p className="text-sm text-gray-600">Monthly recurring revenue</p>
                  <div className="mt-4 flex justify-between text-xs text-gray-500">
                    <span>Today: £{stats.dailyRevenue.toLocaleString()}</span>
                    <span>Week: £{stats.weeklyRevenue.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Monitor className="h-5 w-5 mr-2 text-purple-600" />
                  System Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">{stats.platformUptime}%</div>
                  <p className="text-sm text-gray-600">Uptime this month</p>
                  <div className="mt-4 flex justify-between text-xs text-gray-500">
                    <span>API Calls: {stats.apiCalls.toLocaleString()}</span>
                    <span>Storage: {stats.storageUsed}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2 text-orange-600" />
                  Conversion Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600 mb-2">{stats.conversionRate}%</div>
                  <p className="text-sm text-gray-600">Visitor to customer</p>
                  <div className="mt-4 flex justify-between text-xs text-gray-500">
                    <span>Retention: {stats.userRetention}%</span>
                    <span>Churn: {stats.churnRate}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Advanced Analytics Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Real-time Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></div>
                      <span className="text-sm font-medium">Active Users Now</span>
                    </div>
                    <span className="text-lg font-bold text-green-600">{stats.activeUsers.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                      <span className="text-sm font-medium">Properties Viewed Today</span>
                    </div>
                    <span className="text-lg font-bold text-blue-600">2,847</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                      <span className="text-sm font-medium">New Inquiries</span>
                    </div>
                    <span className="text-lg font-bold text-purple-600">156</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-orange-500 rounded-full mr-3"></div>
                      <span className="text-sm font-medium">Transactions Today</span>
                    </div>
                    <span className="text-lg font-bold text-orange-600">89</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart className="h-5 w-5 mr-2" />
                  User Engagement Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">Session Duration</span>
                      <span className="text-sm font-medium">{stats.averageSessionTime}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{width: '75%'}}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">Customer Satisfaction</span>
                      <span className="text-sm font-medium">{stats.customerSatisfaction}/5.0</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{width: `${(stats.customerSatisfaction / 5) * 100}%`}}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">User Retention Rate</span>
                      <span className="text-sm font-medium">{stats.userRetention}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{width: `${stats.userRetention}%`}}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">Platform Adoption</span>
                      <span className="text-sm font-medium">92%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-orange-600 h-2 rounded-full" style={{width: '92%'}}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Daily Active Users</span>
                    <span className="font-semibold">2,847</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Weekly Active Users</span>
                    <span className="font-semibold">8,234</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Monthly Active Users</span>
                    <span className="font-semibold">24,891</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Average Session Duration</span>
                    <span className="font-semibold">12m 34s</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Platform Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Properties Listed Today</span>
                    <span className="font-semibold">47</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Searches Performed</span>
                    <span className="font-semibold">1,234</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Bookings Made</span>
                    <span className="font-semibold">89</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Messages Sent</span>
                    <span className="font-semibold">567</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'system' && (
        <div className="space-y-6">
          {/* Real-time System Health */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Server className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Server Status</p>
                      <p className="text-lg font-bold text-green-600">Online</p>
                    </div>
                  </div>
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                </div>
                <div className="mt-4 text-xs text-gray-500">
                  <div className="flex justify-between">
                    <span>Uptime: {stats.platformUptime}%</span>
                    <span>Load: 0.45</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Database className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Database</p>
                      <p className="text-lg font-bold text-blue-600">Healthy</p>
                    </div>
                  </div>
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                </div>
                <div className="mt-4 text-xs text-gray-500">
                  <div className="flex justify-between">
                    <span>Connections: 247</span>
                    <span>Response: 12ms</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <HardDrive className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Storage</p>
                      <p className="text-lg font-bold text-yellow-600">{stats.storageUsed}% Used</p>
                    </div>
                  </div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                </div>
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-600 h-2 rounded-full" style={{width: `${stats.storageUsed}%`}}></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Used: 785 GB</span>
                    <span>Free: 215 GB</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Cpu className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">CPU Usage</p>
                      <p className="text-lg font-bold text-purple-600">45%</p>
                    </div>
                  </div>
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                </div>
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{width: '45%'}}></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Cores: 8</span>
                    <span>Temp: 62°C</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* System Performance Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Monitor className="h-5 w-5 mr-2" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">Memory Usage</span>
                      <span className="text-sm font-medium">6.2 GB / 16 GB</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{width: '39%'}}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">Network I/O</span>
                      <span className="text-sm font-medium">↑ 125 MB/s ↓ 89 MB/s</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{width: '65%'}}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">Disk I/O</span>
                      <span className="text-sm font-medium">Read: 45 MB/s Write: 23 MB/s</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{width: '30%'}}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">API Response Time</span>
                      <span className="text-sm font-medium">Average: 145ms</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-orange-600 h-2 rounded-full" style={{width: '25%'}}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Wifi className="h-5 w-5 mr-2" />
                  Network & Security
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center">
                      <Shield className="h-5 w-5 text-green-600 mr-3" />
                      <span className="text-sm font-medium">SSL Certificate</span>
                    </div>
                    <span className="text-sm text-green-600 font-medium">Valid</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center">
                      <Globe className="h-5 w-5 text-blue-600 mr-3" />
                      <span className="text-sm font-medium">CDN Status</span>
                    </div>
                    <span className="text-sm text-blue-600 font-medium">Active</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center">
                      <Zap className="h-5 w-5 text-purple-600 mr-3" />
                      <span className="text-sm font-medium">Firewall</span>
                    </div>
                    <span className="text-sm text-purple-600 font-medium">Protected</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div className="flex items-center">
                      <Activity className="h-5 w-5 text-orange-600 mr-3" />
                      <span className="text-sm font-medium">DDoS Protection</span>
                    </div>
                    <span className="text-sm text-orange-600 font-medium">Enabled</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* System Settings */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>System Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Maintenance Mode</span>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Backup Schedule</span>
                    <Button variant="outline" size="sm">Manage</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Security Settings</span>
                    <Button variant="outline" size="sm">Review</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">API Rate Limits</span>
                    <Button variant="outline" size="sm">Adjust</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Recent System Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">System backup completed</p>
                      <p className="text-xs text-gray-500">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Database optimization finished</p>
                      <p className="text-xs text-gray-500">6 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Security scan initiated</p>
                      <p className="text-xs text-gray-500">1 day ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'land-registry' && (
        <div className="space-y-6">
          {/* Land Registry API Status */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="card-compact">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-label text-gray-600">API Status</p>
                    <p className="text-heading-3 text-green-600">Online</p>
                    <div className="flex items-center mt-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-caption text-gray-500">99.9% uptime</span>
                    </div>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Wifi className="h-8 w-8 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="card-compact">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-label text-gray-600">Daily Requests</p>
                    <p className="text-heading-3">12,847</p>
                    <div className="flex items-center mt-2">
                      <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-caption text-green-500 font-medium">+15.3%</span>
                      <span className="text-caption text-gray-500 ml-1">vs yesterday</span>
                    </div>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Activity className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="card-compact">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-label text-gray-600">Cache Hit Rate</p>
                    <p className="text-heading-3">94.2%</p>
                    <div className="flex items-center mt-2">
                      <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-caption text-green-500 font-medium">+2.1%</span>
                      <span className="text-caption text-gray-500 ml-1">efficiency</span>
                    </div>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Database className="h-8 w-8 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="card-compact">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-label text-gray-600">Error Rate</p>
                    <p className="text-heading-3 text-red-600">0.3%</p>
                    <div className="flex items-center mt-2">
                      <ArrowDown className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-caption text-green-500 font-medium">-0.2%</span>
                      <span className="text-caption text-gray-500 ml-1">improvement</span>
                    </div>
                  </div>
                  <div className="p-3 bg-red-100 rounded-lg">
                    <AlertTriangle className="h-8 w-8 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* API Endpoints Monitoring */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Monitor className="h-5 w-5 mr-2" />
                  API Endpoints Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                      <div>
                        <p className="text-sm font-medium">Property Ownership Lookup</p>
                        <p className="text-xs text-gray-500">Average response: 245ms</p>
                      </div>
                    </div>
                    <span className="text-sm text-green-600 font-medium">Healthy</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                      <div>
                        <p className="text-sm font-medium">Price Paid Data Search</p>
                        <p className="text-xs text-gray-500">Average response: 312ms</p>
                      </div>
                    </div>
                    <span className="text-sm text-green-600 font-medium">Healthy</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                      <div>
                        <p className="text-sm font-medium">Bulk Data Processing</p>
                        <p className="text-xs text-gray-500">Average response: 1.2s</p>
                      </div>
                    </div>
                    <span className="text-sm text-yellow-600 font-medium">Slow</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                      <div>
                        <p className="text-sm font-medium">Transaction History</p>
                        <p className="text-xs text-gray-500">Average response: 189ms</p>
                      </div>
                    </div>
                    <span className="text-sm text-green-600 font-medium">Healthy</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Usage Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Most Used Endpoint</span>
                    <span className="text-sm text-blue-600">Property Ownership (45%)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Peak Usage Time</span>
                    <span className="text-sm text-gray-600">2:00 PM - 4:00 PM</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Average Daily Requests</span>
                    <span className="text-sm text-gray-600">12,847</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Data Sync Status</span>
                    <span className="text-sm text-green-600">Last synced: 2 hours ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Data Management */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="h-5 w-5 mr-2" />
                  Data Synchronization
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Last Full Sync</span>
                    <span className="text-sm text-gray-600">2024-01-15 02:00</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Records Synced</span>
                    <span className="text-sm text-gray-600">2,847,392</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Sync Status</span>
                    <span className="text-sm text-green-600">Up to date</span>
                  </div>
                  <Button className="w-full" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Force Sync Now
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <HardDrive className="h-5 w-5 mr-2" />
                  Storage Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Property Data</span>
                    <span className="text-sm text-gray-600">2.4 GB</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Price History</span>
                    <span className="text-sm text-gray-600">1.8 GB</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Cache Storage</span>
                    <span className="text-sm text-gray-600">512 MB</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '68%' }}></div>
                  </div>
                  <p className="text-xs text-gray-500">68% of allocated storage used</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Configuration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="h-4 w-4 mr-2" />
                    API Rate Limits
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Database className="h-4 w-4 mr-2" />
                    Cache Settings
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Monitor className="h-4 w-4 mr-2" />
                    Monitoring Alerts
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Export Logs
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity Log */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Recent Land Registry Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Bulk search completed for SW1A postcodes</p>
                    <p className="text-xs text-gray-500">2 minutes ago • 1,247 properties processed</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Price history data updated</p>
                    <p className="text-xs text-gray-500">15 minutes ago • 3,892 new transactions</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">API rate limit warning</p>
                    <p className="text-xs text-gray-500">1 hour ago • Approaching daily limit (85%)</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Data synchronization completed</p>
                    <p className="text-xs text-gray-500">2 hours ago • All systems synchronized</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="space-y-6">
          {/* Report Categories */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  User Reports
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    User Activity Report
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Registration Analytics
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    User Engagement
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="h-5 w-5 mr-2" />
                  Property Reports
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Listing Performance
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Market Analysis
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Property Trends
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Banknote className="h-5 w-5 mr-2" />
                  Financial Reports
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Revenue Report
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Commission Tracking
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Payment Analytics
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Report Generation */}
          <Card>
            <CardHeader>
              <CardTitle>Generate Custom Report</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Select Report Type</option>
                  <option>User Analytics</option>
                  <option>Property Performance</option>
                  <option>Financial Summary</option>
                  <option>System Usage</option>
                </select>
                <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Time Period</option>
                  <option>Last 7 days</option>
                  <option>Last 30 days</option>
                  <option>Last 3 months</option>
                  <option>Last year</option>
                </select>
                <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Format</option>
                  <option>PDF</option>
                  <option>Excel</option>
                  <option>CSV</option>
                </select>
                <Button>
                  <Download className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;