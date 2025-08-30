import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Building, 
  Banknote, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Eye, 
  Settings, 
  Download, 
  Filter, 
  Search, 
  BarChart3, 
  PieChart, 
  Calendar, 
  FileText, 
  Database, 
  Server, 
  Zap, 
  Globe, 
  Lock, 
  UserCheck, 
  UserX, 
  Mail, 
  Phone, 
  MapPin, 
  CreditCard, 
  Briefcase,
  Home,
  Key,
  Receipt,
  AlertCircle,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  MoreVertical
} from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '../utils';
import FinancialDashboard from './FinancialDashboard';
import BookingManagement from './BookingManagement';
import DocumentManagement from './DocumentManagement';

interface AdminDashboardProps {
  userId: string;
}

type ViewMode = 'overview' | 'users' | 'properties' | 'financial' | 'bookings' | 'documents' | 'analytics' | 'audit' | 'system';

interface SystemMetrics {
  totalUsers: number;
  activeUsers: number;
  totalProperties: number;
  activeListings: number;
  totalRevenue: number;
  monthlyRevenue: number;
  totalBookings: number;
  pendingBookings: number;
  systemUptime: number;
  serverLoad: number;
  databaseSize: number;
  apiCalls: number;
}

interface UserAnalytics {
  userGrowth: { month: string; users: number; growth: number }[];
  usersByRole: { role: string; count: number; percentage: number }[];
  userActivity: { date: string; logins: number; registrations: number }[];
  topUsers: { id: string; name: string; email: string; role: string; lastActive: string; properties: number; bookings: number }[];
}

interface PropertyAnalytics {
  propertyGrowth: { month: string; properties: number; growth: number }[];
  propertiesByType: { type: string; count: number; percentage: number }[];
  propertiesByLocation: { location: string; count: number; averagePrice: number }[];
  topPerformingProperties: { id: string; title: string; views: number; bookings: number; revenue: number }[];
}

interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  resourceId: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface SystemAlert {
  id: string;
  type: 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  resolved: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ userId }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [loading, setLoading] = useState(false);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    totalUsers: 1247,
    activeUsers: 892,
    totalProperties: 3456,
    activeListings: 2891,
    totalRevenue: 2847392,
    monthlyRevenue: 234567,
    totalBookings: 8934,
    pendingBookings: 127,
    systemUptime: 99.8,
    serverLoad: 67,
    databaseSize: 15.7,
    apiCalls: 45678
  });
  const [userAnalytics, setUserAnalytics] = useState<UserAnalytics>({
    userGrowth: [
      { month: 'Jan', users: 1050, growth: 8.5 },
      { month: 'Feb', users: 1134, growth: 8.0 },
      { month: 'Mar', users: 1247, growth: 10.0 }
    ],
    usersByRole: [
      { role: 'Tenant', count: 567, percentage: 45.5 },
      { role: 'Landlord', count: 234, percentage: 18.8 },
      { role: 'Buyer', count: 289, percentage: 23.2 },
      { role: 'Agent', count: 89, percentage: 7.1 },
      { role: 'Solicitor', count: 45, percentage: 3.6 },
      { role: 'Admin', count: 23, percentage: 1.8 }
    ],
    userActivity: [
      { date: '2024-01-15', logins: 234, registrations: 12 },
      { date: '2024-01-16', logins: 267, registrations: 15 },
      { date: '2024-01-17', logins: 298, registrations: 18 }
    ],
    topUsers: [
      { id: '1', name: 'John Smith', email: 'john@example.com', role: 'Landlord', lastActive: '2024-01-17T10:30:00Z', properties: 15, bookings: 45 },
      { id: '2', name: 'Sarah Johnson', email: 'sarah@example.com', role: 'Agent', lastActive: '2024-01-17T09:15:00Z', properties: 23, bookings: 67 }
    ]
  });
  const [propertyAnalytics, setPropertyAnalytics] = useState<PropertyAnalytics>({
    propertyGrowth: [
      { month: 'Jan', properties: 3200, growth: 5.2 },
      { month: 'Feb', properties: 3345, growth: 4.5 },
      { month: 'Mar', properties: 3456, growth: 3.3 }
    ],
    propertiesByType: [
      { type: 'Apartment', count: 1456, percentage: 42.1 },
      { type: 'House', count: 1234, percentage: 35.7 },
      { type: 'Studio', count: 456, percentage: 13.2 },
      { type: 'Commercial', count: 310, percentage: 9.0 }
    ],
    propertiesByLocation: [
      { location: 'London', count: 1234, averagePrice: 2500 },
      { location: 'Manchester', count: 567, averagePrice: 1200 },
      { location: 'Birmingham', count: 456, averagePrice: 1100 }
    ],
    topPerformingProperties: [
      { id: '1', title: 'Luxury Apartment in Canary Wharf', views: 2345, bookings: 45, revenue: 125000 },
      { id: '2', title: 'Modern House in Shoreditch', views: 1890, bookings: 38, revenue: 98000 }
    ]
  });
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    {
      id: '1',
      timestamp: '2024-01-17T10:30:00Z',
      userId: 'user123',
      userName: 'John Admin',
      action: 'USER_LOGIN',
      resource: 'Authentication',
      resourceId: 'auth-session-456',
      details: 'Successful login from new device',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      severity: 'low'
    },
    {
      id: '2',
      timestamp: '2024-01-17T10:25:00Z',
      userId: 'user456',
      userName: 'Sarah Manager',
      action: 'PROPERTY_DELETE',
      resource: 'Property',
      resourceId: 'prop-789',
      details: 'Deleted property: Modern Apartment in Central London',
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      severity: 'high'
    }
  ]);
  const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>([
    {
      id: '1',
      type: 'warning',
      title: 'High Server Load',
      message: 'Server CPU usage is at 85%. Consider scaling resources.',
      timestamp: '2024-01-17T10:15:00Z',
      resolved: false,
      severity: 'medium'
    },
    {
      id: '2',
      type: 'error',
      title: 'Database Connection Issue',
      message: 'Intermittent database connection timeouts detected.',
      timestamp: '2024-01-17T09:45:00Z',
      resolved: true,
      severity: 'high'
    }
  ]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  });

  // Mock data loading functions
  const loadSystemMetrics = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Data is already set in state
    } catch (error) {
      console.error('Error loading system metrics:', error);
      toast.error('Failed to load system metrics');
    } finally {
      setLoading(false);
    }
  };

  const loadAuditLogs = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      // Data is already set in state
    } catch (error) {
      console.error('Error loading audit logs:', error);
      toast.error('Failed to load audit logs');
    }
  };

  const handleUserAction = async (userId: string, action: 'activate' | 'deactivate' | 'delete' | 'reset_password') => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      toast.success(`User ${action} successful`);
      
      // Add audit log
      const newLog: AuditLog = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        userId: userId,
        userName: 'Current Admin',
        action: `USER_${action.toUpperCase()}`,
        resource: 'User',
        resourceId: userId,
        details: `User ${action} performed by admin`,
        ipAddress: '192.168.1.100',
        userAgent: navigator.userAgent,
        severity: action === 'delete' ? 'high' : 'medium'
      };
      setAuditLogs(prev => [newLog, ...prev]);
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
      toast.error(`Failed to ${action} user`);
    }
  };

  const handleSystemAlert = async (alertId: string, action: 'resolve' | 'dismiss') => {
    try {
      setSystemAlerts(prev => prev.map(alert => 
        alert.id === alertId ? { ...alert, resolved: action === 'resolve' } : alert
      ));
      toast.success(`Alert ${action}d successfully`);
    } catch (error) {
      console.error(`Error ${action}ing alert:`, error);
      toast.error(`Failed to ${action} alert`);
    }
  };

  const exportData = async (type: 'users' | 'properties' | 'audit' | 'analytics', format: 'csv' | 'excel' | 'pdf') => {
    try {
      // Simulate export
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success(`${type} data exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export data');
    }
  };

  useEffect(() => {
    loadSystemMetrics();
    loadAuditLogs();
  }, []);



  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'info': return <Activity className="h-4 w-4 text-blue-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          
          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              {(['overview', 'users', 'properties', 'financial', 'bookings', 'documents', 'analytics', 'audit', 'system'] as ViewMode[]).map(mode => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors capitalize ${
                    viewMode === mode ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
            
            <button
              onClick={() => exportData(viewMode as any, 'excel')}
              className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
            
            <button
              onClick={() => {
                loadSystemMetrics();
                loadAuditLogs();
              }}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>
        
        {/* System Status Bar */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-600">Users</span>
            </div>
            <div className="text-lg font-bold text-blue-700">{systemMetrics.totalUsers.toLocaleString()}</div>
            <div className="text-xs text-blue-600">{systemMetrics.activeUsers} active</div>
          </div>
          
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Building className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-600">Properties</span>
            </div>
            <div className="text-lg font-bold text-green-700">{systemMetrics.totalProperties.toLocaleString()}</div>
            <div className="text-xs text-green-600">{systemMetrics.activeListings} listed</div>
          </div>
          
          <div className="bg-purple-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Banknote className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-600">Revenue</span>
            </div>
            <div className="text-lg font-bold text-purple-700">{formatCurrency(systemMetrics.monthlyRevenue)}</div>
            <div className="text-xs text-purple-600">This month</div>
          </div>
          
          <div className="bg-yellow-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-600">Bookings</span>
            </div>
            <div className="text-lg font-bold text-yellow-700">{systemMetrics.totalBookings.toLocaleString()}</div>
            <div className="text-xs text-yellow-600">{systemMetrics.pendingBookings} pending</div>
          </div>
          
          <div className="bg-indigo-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Server className="h-4 w-4 text-indigo-600" />
              <span className="text-sm font-medium text-indigo-600">Uptime</span>
            </div>
            <div className="text-lg font-bold text-indigo-700">{systemMetrics.systemUptime}%</div>
            <div className="text-xs text-indigo-600">Last 30 days</div>
          </div>
          
          <div className="bg-red-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-red-600">Load</span>
            </div>
            <div className="text-lg font-bold text-red-700">{systemMetrics.serverLoad}%</div>
            <div className="text-xs text-red-600">CPU usage</div>
          </div>
        </div>
      </div>

      {/* System Alerts */}
      {systemAlerts.filter(alert => !alert.resolved).length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Alerts</h3>
          <div className="space-y-3">
            {systemAlerts.filter(alert => !alert.resolved).map(alert => (
              <div key={alert.id} className={`border rounded-lg p-4 ${
                alert.type === 'error' ? 'border-red-200 bg-red-50' :
                alert.type === 'warning' ? 'border-yellow-200 bg-yellow-50' :
                'border-blue-200 bg-blue-50'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {getAlertIcon(alert.type)}
                    <div>
                      <div className="font-medium text-gray-900">{alert.title}</div>
                      <div className="text-sm text-gray-600 mt-1">{alert.message}</div>
                      <div className="text-xs text-gray-500 mt-2">{formatDate(alert.timestamp)}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSystemAlert(alert.id, 'resolve')}
                      className="text-sm px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Resolve
                    </button>
                    <button
                      onClick={() => handleSystemAlert(alert.id, 'dismiss')}
                      className="text-sm px-3 py-1 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content based on view mode */}
      {viewMode === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Growth Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth</h3>
            <div className="space-y-4">
              {userAnalytics.userGrowth.map(item => (
                <div key={item.month} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{item.month}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">{item.users.toLocaleString()}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      item.growth >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {item.growth >= 0 ? '+' : ''}{item.growth}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Users by Role */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Users by Role</h3>
            <div className="space-y-3">
              {userAnalytics.usersByRole.map(item => (
                <div key={item.role} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{item.role}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-12 text-right">
                      {item.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Property Analytics */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Distribution</h3>
            <div className="space-y-3">
              {propertyAnalytics.propertiesByType.map(item => (
                <div key={item.type} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{item.type}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-12 text-right">
                      {item.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {auditLogs.slice(0, 5).map(log => (
                <div key={log.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`p-1 rounded-full ${
                    log.severity === 'high' || log.severity === 'critical' ? 'bg-red-100' :
                    log.severity === 'medium' ? 'bg-yellow-100' : 'bg-green-100'
                  }`}>
                    <Activity className={`h-3 w-3 ${
                      log.severity === 'high' || log.severity === 'critical' ? 'text-red-600' :
                      log.severity === 'medium' ? 'text-yellow-600' : 'text-green-600'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{log.action.replace('_', ' ')}</div>
                    <div className="text-xs text-gray-600">{log.userName} • {formatDate(log.timestamp)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {viewMode === 'users' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Plus className="h-4 w-4" />
                  Add User
                </button>
              </div>
            </div>
            
            {/* Top Users Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">User</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Role</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Properties</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Bookings</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Last Active</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {userAnalytics.topUsers.map(user => (
                    <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-600">{user.email}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">{user.properties}</td>
                      <td className="py-3 px-4 text-sm text-gray-900">{user.bookings}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{formatDate(user.lastActive)}</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3" />
                          Active
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowUserModal(true);
                            }}
                            className="p-1 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleUserAction(user.id, 'reset_password')}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Reset Password"
                          >
                            <Key className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleUserAction(user.id, 'deactivate')}
                            className="p-1 text-yellow-600 hover:bg-yellow-50 rounded transition-colors"
                            title="Deactivate"
                          >
                            <UserX className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleUserAction(user.id, 'delete')}
                            className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {viewMode === 'financial' && (
        <FinancialDashboard userRole="admin" userId={userId} />
      )}

      {viewMode === 'bookings' && (
        <BookingManagement userRole="admin" userId={userId} />
      )}

      {viewMode === 'documents' && (
        <DocumentManagement userRole="admin" userId={userId} />
      )}

      {viewMode === 'audit' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Audit Trail</h3>
              <div className="flex items-center gap-3">
                <input
                  type="date"
                  value={dateFilter.from}
                  onChange={(e) => setDateFilter(prev => ({ ...prev, from: e.target.value }))}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
                <span className="text-sm text-gray-500">to</span>
                <input
                  type="date"
                  value={dateFilter.to}
                  onChange={(e) => setDateFilter(prev => ({ ...prev, to: e.target.value }))}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
                <button
                  onClick={() => exportData('audit', 'csv')}
                  className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Export
                </button>
              </div>
            </div>
            
            <div className="space-y-3">
              {auditLogs.map(log => (
                <div key={log.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                          getSeverityColor(log.severity)
                        }`}>
                          {log.severity.charAt(0).toUpperCase() + log.severity.slice(1)}
                        </span>
                        <span className="text-sm font-medium text-gray-900">{log.action.replace('_', ' ')}</span>
                        <span className="text-sm text-gray-600">{log.resource}</span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-gray-600">User</div>
                          <div className="font-medium">{log.userName}</div>
                          <div className="text-gray-500">{log.userId}</div>
                        </div>
                        
                        <div>
                          <div className="text-gray-600">Details</div>
                          <div className="font-medium">{log.details}</div>
                          <div className="text-gray-500">Resource: {log.resourceId}</div>
                        </div>
                        
                        <div>
                          <div className="text-gray-600">Timestamp</div>
                          <div className="font-medium">{formatDate(log.timestamp)}</div>
                          <div className="text-gray-500">{log.ipAddress}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {viewMode === 'system' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* System Performance */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Performance</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">CPU Usage</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        systemMetrics.serverLoad > 80 ? 'bg-red-600' :
                        systemMetrics.serverLoad > 60 ? 'bg-yellow-600' : 'bg-green-600'
                      }`}
                      style={{ width: `${systemMetrics.serverLoad}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{systemMetrics.serverLoad}%</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Database Size</span>
                <span className="text-sm font-medium">{systemMetrics.databaseSize} GB</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">API Calls (24h)</span>
                <span className="text-sm font-medium">{systemMetrics.apiCalls.toLocaleString()}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">System Uptime</span>
                <span className={`text-sm font-medium ${
                  systemMetrics.systemUptime > 99 ? 'text-green-600' :
                  systemMetrics.systemUptime > 95 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {systemMetrics.systemUptime}%
                </span>
              </div>
            </div>
          </div>
          
          {/* System Configuration */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Configuration</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <Database className="h-5 w-5 text-gray-600" />
                  <span className="text-sm font-medium">Database Settings</span>
                </div>
                <Settings className="h-4 w-4 text-gray-400" />
              </button>
              
              <button className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-gray-600" />
                  <span className="text-sm font-medium">Email Configuration</span>
                </div>
                <Settings className="h-4 w-4 text-gray-400" />
              </button>
              
              <button className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-gray-600" />
                  <span className="text-sm font-medium">Security Settings</span>
                </div>
                <Settings className="h-4 w-4 text-gray-400" />
              </button>
              
              <button className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-gray-600" />
                  <span className="text-sm font-medium">API Configuration</span>
                </div>
                <Settings className="h-4 w-4 text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">User Details</h3>
                <button
                  onClick={() => {
                    setShowUserModal(false);
                    setSelectedUser(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <div className="text-sm text-gray-900">{selectedUser.name}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <div className="text-sm text-gray-900">{selectedUser.email}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <div className="text-sm text-gray-900">{selectedUser.role}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Active</label>
                    <div className="text-sm text-gray-900">{formatDate(selectedUser.lastActive)}</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Properties</label>
                    <div className="text-2xl font-bold text-blue-600">{selectedUser.properties}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bookings</label>
                    <div className="text-2xl font-bold text-green-600">{selectedUser.bookings}</div>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => handleUserAction(selectedUser.id, 'reset_password')}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Reset Password
                  </button>
                  <button
                    onClick={() => handleUserAction(selectedUser.id, 'deactivate')}
                    className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                  >
                    Deactivate
                  </button>
                  <button
                    onClick={() => handleUserAction(selectedUser.id, 'delete')}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Delete User
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;