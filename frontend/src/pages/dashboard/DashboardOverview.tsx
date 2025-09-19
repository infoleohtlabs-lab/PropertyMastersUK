import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { UserRole, Permission } from '@/utils/permissions';
import {
  BarChart3,
  Building2,
  Users,
  DollarSign,
  TrendingUp,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowRight,
  Home,
  FileText,
  Settings,
  Bell
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface DashboardStats {
  totalProperties: number;
  activeListings: number;
  totalUsers: number;
  monthlyRevenue: number;
  pendingTasks: number;
  completedTasks: number;
  upcomingAppointments: number;
  recentActivities: Activity[];
}

interface Activity {
  id: string;
  type: 'property' | 'user' | 'booking' | 'maintenance' | 'financial';
  title: string;
  description: string;
  timestamp: string;
  status: 'pending' | 'completed' | 'in_progress' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  permission?: Permission;
  roles?: UserRole[];
}

const DashboardOverview: React.FC = () => {
  const { user } = useAuth();
  const { userRole, canAccessDashboard } = usePermissions();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Simulate API call - replace with actual API integration
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockStats: DashboardStats = {
        totalProperties: 156,
        activeListings: 42,
        totalUsers: 1247,
        monthlyRevenue: 125000,
        pendingTasks: 8,
        completedTasks: 23,
        upcomingAppointments: 5,
        recentActivities: [
          {
            id: '1',
            type: 'property',
            title: 'New Property Listed',
            description: '3-bed house in Manchester added to listings',
            timestamp: '2024-01-15T10:30:00Z',
            status: 'completed',
            priority: 'medium'
          },
          {
            id: '2',
            type: 'user',
            title: 'New User Registration',
            description: 'John Smith registered as a buyer',
            timestamp: '2024-01-15T09:15:00Z',
            status: 'completed',
            priority: 'low'
          },
          {
            id: '3',
            type: 'maintenance',
            title: 'Maintenance Request',
            description: 'Heating system repair needed at Property #123',
            timestamp: '2024-01-15T08:45:00Z',
            status: 'pending',
            priority: 'high'
          }
        ]
      };
      
      setStats(mockStats);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions: QuickAction[] = [
    {
      id: 'add-property',
      title: 'Add Property',
      description: 'List a new property',
      icon: <Building2 className="h-5 w-5" />,
      href: '/properties/create',
      permission: Permission.PROPERTY_CREATE
    },
    {
      id: 'manage-users',
      title: 'Manage Users',
      description: 'View and manage users',
      icon: <Users className="h-5 w-5" />,
      href: '/users',
      permission: Permission.USER_READ
    },
    {
      id: 'view-reports',
      title: 'View Reports',
      description: 'Access analytics and reports',
      icon: <BarChart3 className="h-5 w-5" />,
      href: '/reports',
      permission: Permission.ANALYTICS_VIEW
    },
    {
      id: 'maintenance',
      title: 'Maintenance',
      description: 'Manage maintenance requests',
      icon: <Settings className="h-5 w-5" />,
      href: '/maintenance',
      permission: Permission.MAINTENANCE_READ
    },
    {
      id: 'documents',
      title: 'Documents',
      description: 'Manage documents and contracts',
      icon: <FileText className="h-5 w-5" />,
      href: '/documents',
      permission: Permission.DOCUMENT_READ
    },
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'View all notifications',
      icon: <Bell className="h-5 w-5" />,
      href: '/notifications'
    }
  ];

  const getRoleDashboardLink = () => {
    if (!userRole) return '/dashboard/overview';
    
    const roleMap: Record<UserRole, string> = {
      [UserRole.SUPER_ADMIN]: '/dashboard/super-admin',
      [UserRole.ADMIN]: '/dashboard/admin',
      [UserRole.PROPERTY_MANAGER]: '/dashboard/property-manager',
      [UserRole.MANAGER]: '/dashboard/admin',
      [UserRole.AGENT]: '/dashboard/agent',
      [UserRole.CONTRACTOR]: '/dashboard/contractor',
      [UserRole.SELLER]: '/dashboard/seller',
      [UserRole.LANDLORD]: '/dashboard/landlord',
      [UserRole.TENANT]: '/dashboard/tenant',
      [UserRole.BUYER]: '/dashboard/buyer',
      [UserRole.SOLICITOR]: '/dashboard/solicitor',
      [UserRole.VIEWER]: '/dashboard/overview',
      [UserRole.USER]: '/dashboard/overview'
    };
    
    return roleMap[userRole] || '/dashboard/overview';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {user?.firstName || 'User'}!
        </h1>
        <p className="text-blue-100 mb-4">
          Here's what's happening with your PropertyMasters account today.
        </p>
        <div className="flex items-center space-x-4">
          <Badge variant="secondary" className="bg-white/20 text-white">
            {userRole?.replace('_', ' ').toUpperCase()}
          </Badge>
          {userRole && canAccessDashboard(userRole.toLowerCase()) && (
            <Link to={getRoleDashboardLink()}>
              <Button variant="secondary" size="sm" className="bg-white/20 hover:bg-white/30">
                Go to {userRole.replace('_', ' ')} Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <PermissionGuard permission={Permission.PROPERTY_READ}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalProperties || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.activeListings || 0} active listings
              </p>
            </CardContent>
          </Card>
        </PermissionGuard>

        <PermissionGuard permission={Permission.USER_READ}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
              <p className="text-xs text-muted-foreground">
                +12% from last month
              </p>
            </CardContent>
          </Card>
        </PermissionGuard>

        <PermissionGuard permission={Permission.FINANCE_READ}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                £{stats?.monthlyRevenue?.toLocaleString() || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                +8% from last month
              </p>
            </CardContent>
          </Card>
        </PermissionGuard>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pendingTasks || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.completedTasks || 0} completed this week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="activities" className="space-y-4">
        <TabsList>
          <TabsTrigger value="activities">Recent Activities</TabsTrigger>
          <TabsTrigger value="actions">Quick Actions</TabsTrigger>
          <TabsTrigger value="appointments">Upcoming</TabsTrigger>
        </TabsList>

        <TabsContent value="activities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
              <CardDescription>
                Latest updates and activities across the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                    <div className="flex-shrink-0">
                      {activity.type === 'property' && <Building2 className="h-5 w-5 text-blue-600" />}
                      {activity.type === 'user' && <Users className="h-5 w-5 text-green-600" />}
                      {activity.type === 'maintenance' && <Settings className="h-5 w-5 text-orange-600" />}
                      {activity.type === 'booking' && <Calendar className="h-5 w-5 text-purple-600" />}
                      {activity.type === 'financial' && <DollarSign className="h-5 w-5 text-emerald-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-900">{activity.title}</h4>
                        <div className="flex space-x-2">
                          <Badge className={getPriorityColor(activity.priority)}>
                            {activity.priority}
                          </Badge>
                          <Badge className={getStatusColor(activity.status)}>
                            {activity.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actions" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action) => (
              <PermissionGuard
                key={action.id}
                permission={action.permission}
                roles={action.roles}
              >
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <Link to={action.href}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          {action.icon}
                        </div>
                        <div>
                          <CardTitle className="text-base">{action.title}</CardTitle>
                          <CardDescription className="text-sm">
                            {action.description}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                  </Link>
                </Card>
              </PermissionGuard>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="appointments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Appointments</CardTitle>
              <CardDescription>
                Your scheduled appointments and meetings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming appointments</h3>