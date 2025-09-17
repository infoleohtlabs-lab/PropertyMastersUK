import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Server,
  Database,
  HardDrive,
  Cpu,
  Wifi,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  TrendingUp,
  RefreshCw,
  Monitor,
  Zap
} from 'lucide-react';

interface SystemMetrics {
  serverStatus: 'online' | 'offline' | 'maintenance';
  databaseStatus: 'healthy' | 'warning' | 'critical';
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkLatency: number;
  activeConnections: number;
  uptime: string;
  lastBackup: string;
  responseTime: number;
}

interface SystemAlert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: string;
  resolved: boolean;
}

const SystemOverview: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    serverStatus: 'online',
    databaseStatus: 'healthy',
    cpuUsage: 45,
    memoryUsage: 62,
    diskUsage: 78,
    networkLatency: 23,
    activeConnections: 1247,
    uptime: '15 days, 8 hours',
    lastBackup: '2 hours ago',
    responseTime: 245
  });

  const [alerts, setAlerts] = useState<SystemAlert[]>([
    {
      id: '1',
      type: 'warning',
      title: 'High Disk Usage',
      message: 'Disk usage is at 78%. Consider cleaning up old files.',
      timestamp: '2024-01-15 14:30:00',
      resolved: false
    },
    {
      id: '2',
      type: 'info',
      title: 'Scheduled Maintenance',
      message: 'System maintenance scheduled for tonight at 2:00 AM.',
      timestamp: '2024-01-15 12:00:00',
      resolved: false
    },
    {
      id: '3',
      type: 'success',
      title: 'Backup Completed',
      message: 'Daily backup completed successfully.',
      timestamp: '2024-01-15 10:15:00',
      resolved: true
    }
  ]);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshMetrics = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate updated metrics
    setMetrics(prev => ({
      ...prev,
      cpuUsage: Math.floor(Math.random() * 30) + 30,
      memoryUsage: Math.floor(Math.random() * 20) + 50,
      networkLatency: Math.floor(Math.random() * 20) + 15,
      responseTime: Math.floor(Math.random() * 100) + 200
    }));
    
    setIsRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
      case 'healthy':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'offline':
      case 'critical':
        return 'text-red-600';
      case 'maintenance':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'offline':
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'maintenance':
        return <Clock className="h-5 w-5 text-blue-500" />;
      default:
        return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  const getAlertBadgeVariant = (type: string) => {
    switch (type) {
      case 'error':
        return 'destructive';
      case 'warning':
        return 'secondary';
      case 'success':
        return 'default';
      case 'info':
      default:
        return 'outline';
    }
  };

  const getUsageColor = (usage: number) => {
    if (usage >= 80) return 'text-red-600';
    if (usage >= 60) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getUsageBarColor = (usage: number) => {
    if (usage >= 80) return 'bg-red-500';
    if (usage >= 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  useEffect(() => {
    // Set up real-time updates
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        cpuUsage: Math.max(0, Math.min(100, prev.cpuUsage + (Math.random() - 0.5) * 10)),
        memoryUsage: Math.max(0, Math.min(100, prev.memoryUsage + (Math.random() - 0.5) * 5)),
        networkLatency: Math.max(0, prev.networkLatency + (Math.random() - 0.5) * 10),
        activeConnections: Math.max(0, prev.activeConnections + Math.floor((Math.random() - 0.5) * 50))
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header with Refresh Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">System Overview</h2>
        <Button 
          onClick={refreshMetrics} 
          disabled={isRefreshing}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* System Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Server Status</p>
                <p className={`text-lg font-semibold ${getStatusColor(metrics.serverStatus)}`}>
                  {metrics.serverStatus.charAt(0).toUpperCase() + metrics.serverStatus.slice(1)}
                </p>
                <p className="text-xs text-gray-500">Uptime: {metrics.uptime}</p>
              </div>
              <div className="flex items-center">
                {getStatusIcon(metrics.serverStatus)}
                <Server className="h-6 w-6 ml-2 text-gray-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Database</p>
                <p className={`text-lg font-semibold ${getStatusColor(metrics.databaseStatus)}`}>
                  {metrics.databaseStatus.charAt(0).toUpperCase() + metrics.databaseStatus.slice(1)}
                </p>
                <p className="text-xs text-gray-500">Last backup: {metrics.lastBackup}</p>
              </div>
              <div className="flex items-center">
                {getStatusIcon(metrics.databaseStatus)}
                <Database className="h-6 w-6 ml-2 text-gray-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Connections</p>
                <p className="text-2xl font-bold text-blue-600">{metrics.activeConnections.toLocaleString()}</p>
                <p className="text-xs text-gray-500">Current sessions</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Response Time</p>
                <p className="text-2xl font-bold text-purple-600">{metrics.responseTime}ms</p>
                <p className="text-xs text-gray-500">Average latency</p>
              </div>
              <Zap className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resource Usage */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Cpu className="h-5 w-5 mr-2" />
              CPU Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Current</span>
                <span className={`text-lg font-semibold ${getUsageColor(metrics.cpuUsage)}`}>
                  {metrics.cpuUsage}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${getUsageBarColor(metrics.cpuUsage)}`}
                  style={{ width: `${metrics.cpuUsage}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Monitor className="h-5 w-5 mr-2" />
              Memory Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Current</span>
                <span className={`text-lg font-semibold ${getUsageColor(metrics.memoryUsage)}`}>
                  {metrics.memoryUsage}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${getUsageBarColor(metrics.memoryUsage)}`}
                  style={{ width: `${metrics.memoryUsage}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <HardDrive className="h-5 w-5 mr-2" />
              Disk Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Current</span>
                <span className={`text-lg font-semibold ${getUsageColor(metrics.diskUsage)}`}>
                  {metrics.diskUsage}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${getUsageBarColor(metrics.diskUsage)}`}
                  style={{ width: `${metrics.diskUsage}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            System Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alerts.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No active alerts</p>
            ) : (
              alerts.map((alert) => (
                <div 
                  key={alert.id} 
                  className={`p-4 rounded-lg border ${alert.resolved ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <Badge variant={getAlertBadgeVariant(alert.type)}>
                          {alert.type.toUpperCase()}
                        </Badge>
                        {alert.resolved && (
                          <Badge variant="outline">RESOLVED</Badge>
                        )}
                      </div>
                      <h4 className="font-medium text-gray-900">{alert.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                      <p className="text-xs text-gray-400 mt-2">{alert.timestamp}</p>
                    </div>
                    {!alert.resolved && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setAlerts(prev => 
                            prev.map(a => 
                              a.id === alert.id ? { ...a, resolved: true } : a
                            )
                          );
                        }}
                      >
                        Resolve
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col">
              <Server className="h-6 w-6 mb-2" />
              <span className="text-sm">Restart Services</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Database className="h-6 w-6 mb-2" />
              <span className="text-sm">Backup Database</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Activity className="h-6 w-6 mb-2" />
              <span className="text-sm">View Logs</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <TrendingUp className="h-6 w-6 mb-2" />
              <span className="text-sm">Performance Report</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemOverview;