import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Building,
  Users,
  Wrench,
  DollarSign,
  Calendar,
  AlertCircle,
  TrendingUp,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  UserPlus,
  Settings,
  BarChart3
} from 'lucide-react';

interface PortfolioStats {
  totalProperties: number;
  occupiedUnits: number;
  vacantUnits: number;
  maintenanceRequests: number;
  monthlyRevenue: number;
  occupancyRate: number;
}

interface Property {
  id: string;
  name: string;
  address: string;
  type: 'residential' | 'commercial' | 'mixed';
  units: number;
  occupiedUnits: number;
  monthlyRevenue: number;
  status: 'active' | 'maintenance' | 'renovation';
}

interface StaffMember {
  id: string;
  name: string;
  role: string;
  department: string;
  status: 'active' | 'on_leave' | 'inactive';
  assignedProperties: number;
  performance: number;
}

interface MaintenanceRequest {
  id: string;
  propertyName: string;
  unit: string;
  type: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed';
  assignedTo?: string;
  createdAt: string;
  description: string;
}

const PropertyManagerDashboard: React.FC = () => {
  const [portfolioStats, setPortfolioStats] = useState<PortfolioStats>({
    totalProperties: 0,
    occupiedUnits: 0,
    vacantUnits: 0,
    maintenanceRequests: 0,
    monthlyRevenue: 0,
    occupancyRate: 0
  });

  const [properties, setProperties] = useState<Property[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadPortfolioStats(),
        loadProperties(),
        loadStaff(),
        loadMaintenanceRequests()
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPortfolioStats = async () => {
    // Mock data - replace with actual API call
    setPortfolioStats({
      totalProperties: 45,
      occupiedUnits: 387,
      vacantUnits: 23,
      maintenanceRequests: 12,
      monthlyRevenue: 245000,
      occupancyRate: 94.4
    });
  };

  const loadProperties = async () => {
    // Mock data - replace with actual API call
    setProperties([
      {
        id: '1',
        name: 'Riverside Apartments',
        address: '123 River Street, London',
        type: 'residential',
        units: 24,
        occupiedUnits: 22,
        monthlyRevenue: 48000,
        status: 'active'
      },
      {
        id: '2',
        name: 'City Center Office Complex',
        address: '456 Business Ave, Manchester',
        type: 'commercial',
        units: 12,
        occupiedUnits: 10,
        monthlyRevenue: 85000,
        status: 'active'
      },
      {
        id: '3',
        name: 'Garden View Residences',
        address: '789 Garden Road, Birmingham',
        type: 'residential',
        units: 18,
        occupiedUnits: 16,
        monthlyRevenue: 32000,
        status: 'maintenance'
      }
    ]);
  };

  const loadStaff = async () => {
    // Mock data - replace with actual API call
    setStaff([
      {
        id: '1',
        name: 'John Smith',
        role: 'Maintenance Supervisor',
        department: 'Maintenance',
        status: 'active',
        assignedProperties: 15,
        performance: 92
      },
      {
        id: '2',
        name: 'Sarah Johnson',
        role: 'Leasing Agent',
        department: 'Leasing',
        status: 'active',
        assignedProperties: 20,
        performance: 88
      },
      {
        id: '3',
        name: 'Mike Wilson',
        role: 'Property Inspector',
        department: 'Operations',
        status: 'on_leave',
        assignedProperties: 12,
        performance: 85
      }
    ]);
  };

  const loadMaintenanceRequests = async () => {
    // Mock data - replace with actual API call
    setMaintenanceRequests([
      {
        id: '1',
        propertyName: 'Riverside Apartments',
        unit: 'Unit 12A',
        type: 'Plumbing',
        priority: 'high',
        status: 'pending',
        assignedTo: 'John Smith',
        createdAt: '2024-01-15T10:30:00Z',
        description: 'Leaking faucet in kitchen'
      },
      {
        id: '2',
        propertyName: 'City Center Office',
        unit: 'Suite 304',
        type: 'HVAC',
        priority: 'medium',
        status: 'in_progress',
        assignedTo: 'John Smith',
        createdAt: '2024-01-14T14:20:00Z',
        description: 'Air conditioning not working properly'
      }
    ]);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'in_progress': return 'text-blue-600';
      case 'pending': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'in_progress': return <Clock className="h-4 w-4" />;
      case 'pending': return <AlertCircle className="h-4 w-4" />;
      default: return <XCircle className="h-4 w-4" />;
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
          <h1 className="text-3xl font-bold text-gray-900">Property Manager Dashboard</h1>
          <p className="text-gray-600">Portfolio overview and operations management</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={loadDashboardData}>
            <BarChart3 className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Portfolio Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{portfolioStats.totalProperties}</div>
            <p className="text-xs text-muted-foreground">
              {portfolioStats.occupiedUnits + portfolioStats.vacantUnits} total units
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{portfolioStats.occupancyRate}%</div>
            <p className="text-xs text-muted-foreground">
              {portfolioStats.occupiedUnits} occupied, {portfolioStats.vacantUnits} vacant
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">£{portfolioStats.monthlyRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +8.2% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maintenance Requests</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{portfolioStats.maintenanceRequests}</div>
            <p className="text-xs text-muted-foreground">
              3 urgent, 9 routine
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="portfolio" className="space-y-4">
        <TabsList>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="staff">Staff Management</TabsTrigger>
          <TabsTrigger value="operations">Operations</TabsTrigger>
        </TabsList>

        <TabsContent value="portfolio" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="h-5 w-5 mr-2" />
                Property Portfolio
              </CardTitle>
              <CardDescription>
                Overview of all managed properties
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {properties.map((property) => (
                  <div key={property.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <Building className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">{property.name}</h4>
                        <p className="text-sm text-muted-foreground flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {property.address}
                        </p>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {property.type}
                          </span>
                          <span className="text-xs">
                            {property.occupiedUnits}/{property.units} occupied
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold">£{property.monthlyRevenue.toLocaleString()}</div>
                      <p className="text-sm text-muted-foreground">monthly</p>
                      <Badge variant={property.status === 'active' ? 'default' : 'secondary'}>
                        {property.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Wrench className="h-5 w-5 mr-2" />
                Maintenance Requests
              </CardTitle>
              <CardDescription>
                Active maintenance requests across all properties
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {maintenanceRequests.map((request) => (
                  <div key={request.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <div className={`p-2 rounded-full ${getPriorityColor(request.priority)}`}>
                      <Wrench className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{request.propertyName} - {request.unit}</h4>
                        <Badge variant="outline">{request.type}</Badge>
                        <Badge variant={request.priority === 'urgent' ? 'destructive' : 'secondary'}>
                          {request.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{request.description}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                        <span>Created: {new Date(request.createdAt).toLocaleDateString()}</span>
                        {request.assignedTo && <span>Assigned to: {request.assignedTo}</span>}
                      </div>
                    </div>
                    <div className={`flex items-center space-x-1 ${getStatusColor(request.status)}`}>
                      {getStatusIcon(request.status)}
                      <span className="text-sm font-medium">{request.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="staff" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Staff Management
              </CardTitle>
              <CardDescription>
                Manage your property management team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-end">
                  <Button>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Staff Member
                  </Button>
                </div>
                {staff.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-green-100 rounded-full">
                        <Users className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">{member.name}</h4>
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {member.department}
                          </span>
                          <span className="text-xs">
                            {member.assignedProperties} properties
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">Performance: {member.performance}%</span>
                        <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                          {member.status}
                        </Badge>
                      </div>
                      <Progress value={member.performance} className="w-24 mt-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="operations" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common operational tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full" variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Inspection
                </Button>
                <Button className="w-full" variant="outline">
                  <Users className="h-4 w-4 mr-2" />
                  Tenant Communication
                </Button>
                <Button className="w-full" variant="outline">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Financial Reports
                </Button>
                <Button className="w-full" variant="outline">
                  <Wrench className="h-4 w-4 mr-2" />
                  Maintenance Schedule
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>Key operational indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Tenant Satisfaction</span>
                      <span>87%</span>
                    </div>
                    <Progress value={87} className="mt-1" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Maintenance Response Time</span>
                      <span>92%</span>
                    </div>
                    <Progress value={92} className="mt-1" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Rent Collection Rate</span>
                      <span>96%</span>
                    </div>
                    <Progress value={96} className="mt-1" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Property Utilization</span>
                      <span>94%</span>
                    </div>
                    <Progress value={94} className="mt-1" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PropertyManagerDashboard;