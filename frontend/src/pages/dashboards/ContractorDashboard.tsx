import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Wrench,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  MapPin,
  Phone,
  Mail,
  FileText,
  Plus,
  Filter,
  Download,
  Upload,
  Star,
  TrendingUp
} from 'lucide-react';

interface ContractorStats {
  activeJobs: number;
  completedJobs: number;
  pendingInvoices: number;
  totalEarnings: number;
  averageRating: number;
  responseTime: number;
}

interface WorkOrder {
  id: string;
  propertyName: string;
  propertyAddress: string;
  unit?: string;
  type: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'assigned' | 'in_progress' | 'completed' | 'on_hold';
  description: string;
  scheduledDate: string;
  estimatedDuration: number;
  clientContact: {
    name: string;
    phone: string;
    email: string;
  };
  materials?: string[];
  notes?: string;
  photos?: string[];
}

interface Invoice {
  id: string;
  workOrderId: string;
  propertyName: string;
  amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  dueDate: string;
  createdDate: string;
  description: string;
}

interface Schedule {
  id: string;
  workOrderId: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  type: 'maintenance' | 'inspection' | 'repair' | 'installation';
}

const ContractorDashboard: React.FC = () => {
  const [stats, setStats] = useState<ContractorStats>({
    activeJobs: 0,
    completedJobs: 0,
    pendingInvoices: 0,
    totalEarnings: 0,
    averageRating: 0,
    responseTime: 0
  });

  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [schedule, setSchedule] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadStats(),
        loadWorkOrders(),
        loadInvoices(),
        loadSchedule()
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    // Mock data - replace with actual API call
    setStats({
      activeJobs: 8,
      completedJobs: 156,
      pendingInvoices: 3,
      totalEarnings: 45600,
      averageRating: 4.8,
      responseTime: 2.4
    });
  };

  const loadWorkOrders = async () => {
    // Mock data - replace with actual API call
    setWorkOrders([
      {
        id: 'WO001',
        propertyName: 'Riverside Apartments',
        propertyAddress: '123 River Street, London',
        unit: 'Unit 12A',
        type: 'Plumbing',
        priority: 'high',
        status: 'assigned',
        description: 'Leaking faucet in kitchen needs immediate repair',
        scheduledDate: '2024-01-16T09:00:00Z',
        estimatedDuration: 2,
        clientContact: {
          name: 'John Smith',
          phone: '+44 20 1234 5678',
          email: 'john.smith@email.com'
        },
        materials: ['Faucet cartridge', 'Plumber\'s tape', 'Pipe sealant'],
        notes: 'Tenant will be available between 9 AM - 12 PM'
      },
      {
        id: 'WO002',
        propertyName: 'City Center Office',
        propertyAddress: '456 Business Ave, Manchester',
        unit: 'Suite 304',
        type: 'HVAC',
        priority: 'medium',
        status: 'in_progress',
        description: 'Air conditioning system maintenance and filter replacement',
        scheduledDate: '2024-01-15T14:00:00Z',
        estimatedDuration: 3,
        clientContact: {
          name: 'Sarah Johnson',
          phone: '+44 161 987 6543',
          email: 'sarah.johnson@business.com'
        },
        materials: ['HVAC filters', 'Cleaning supplies'],
        notes: 'Access through main reception'
      },
      {
        id: 'WO003',
        propertyName: 'Garden View Residences',
        propertyAddress: '789 Garden Road, Birmingham',
        unit: 'Unit 5B',
        type: 'Electrical',
        priority: 'urgent',
        status: 'assigned',
        description: 'Power outlet not working in bedroom',
        scheduledDate: '2024-01-16T11:00:00Z',
        estimatedDuration: 1.5,
        clientContact: {
          name: 'Mike Wilson',
          phone: '+44 121 555 0123',
          email: 'mike.wilson@email.com'
        },
        materials: ['Electrical outlet', 'Wire nuts', 'Electrical tape']
      }
    ]);
  };

  const loadInvoices = async () => {
    // Mock data - replace with actual API call
    setInvoices([
      {
        id: 'INV001',
        workOrderId: 'WO001',
        propertyName: 'Riverside Apartments',
        amount: 150,
        status: 'sent',
        dueDate: '2024-01-30',
        createdDate: '2024-01-15',
        description: 'Plumbing repair - kitchen faucet'
      },
      {
        id: 'INV002',
        workOrderId: 'WO002',
        propertyName: 'City Center Office',
        amount: 280,
        status: 'paid',
        dueDate: '2024-01-25',
        createdDate: '2024-01-10',
        description: 'HVAC maintenance and filter replacement'
      },
      {
        id: 'INV003',
        workOrderId: 'WO003',
        propertyName: 'Garden View Residences',
        amount: 95,
        status: 'draft',
        dueDate: '2024-02-05',
        createdDate: '2024-01-14',
        description: 'Electrical outlet repair'
      }
    ]);
  };

  const loadSchedule = async () => {
    // Mock data - replace with actual API call
    setSchedule([
      {
        id: 'SCH001',
        workOrderId: 'WO001',
        title: 'Plumbing Repair - Riverside Apartments',
        date: '2024-01-16',
        startTime: '09:00',
        endTime: '11:00',
        location: '123 River Street, London',
        type: 'repair'
      },
      {
        id: 'SCH002',
        workOrderId: 'WO003',
        title: 'Electrical Repair - Garden View',
        date: '2024-01-16',
        startTime: '11:00',
        endTime: '12:30',
        location: '789 Garden Road, Birmingham',
        type: 'repair'
      },
      {
        id: 'SCH003',
        workOrderId: 'WO004',
        title: 'Monthly Inspection - Oak Manor',
        date: '2024-01-17',
        startTime: '10:00',
        endTime: '12:00',
        location: '321 Oak Street, Leeds',
        type: 'inspection'
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
      case 'assigned': return 'text-orange-600';
      case 'on_hold': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getInvoiceStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-green-600';
      case 'sent': return 'text-blue-600';
      case 'draft': return 'text-gray-600';
      case 'overdue': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const filteredWorkOrders = workOrders.filter(order => {
    if (selectedFilter === 'all') return true;
    return order.status === selectedFilter;
  });

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
          <h1 className="text-3xl font-bold text-gray-900">Contractor Dashboard</h1>
          <p className="text-gray-600">Manage work orders, schedule, and invoicing</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={loadDashboardData}>
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Work Order
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeJobs}</div>
            <p className="text-xs text-muted-foreground">
              {stats.completedJobs} completed this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">£{stats.totalEarnings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingInvoices} pending invoices
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center">
              {stats.averageRating}
              <Star className="h-5 w-5 text-yellow-500 ml-1 fill-current" />
            </div>
            <p className="text-xs text-muted-foreground">
              Based on 156 reviews
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.responseTime}h</div>
            <p className="text-xs text-muted-foreground">
              Average response time
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="workorders" className="space-y-4">
        <TabsList>
          <TabsTrigger value="workorders">Work Orders</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="invoicing">Invoicing</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="workorders" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <Wrench className="h-5 w-5 mr-2" />
                    Work Orders
                  </CardTitle>
                  <CardDescription>
                    Manage your assigned work orders
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                  <select 
                    value={selectedFilter} 
                    onChange={(e) => setSelectedFilter(e.target.value)}
                    className="px-3 py-1 border rounded-md text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="assigned">Assigned</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="on_hold">On Hold</option>
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredWorkOrders.map((order) => (
                  <div key={order.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-full ${getPriorityColor(order.priority)}`}>
                          <Wrench className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium">{order.propertyName}</h4>
                            <Badge variant="outline">{order.id}</Badge>
                            <Badge variant={order.priority === 'urgent' ? 'destructive' : 'secondary'}>
                              {order.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground flex items-center mt-1">
                            <MapPin className="h-3 w-3 mr-1" />
                            {order.propertyAddress} {order.unit && `- ${order.unit}`}
                          </p>
                          <p className="text-sm mt-1">{order.description}</p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(order.scheduledDate).toLocaleDateString()}
                            </span>
                            <span className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {order.estimatedDuration}h estimated
                            </span>
                            <span>{order.type}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(order.status)}>
                          {order.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          {order.clientContact.phone}
                        </span>
                        <span className="flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {order.clientContact.email}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <FileText className="h-3 w-3 mr-1" />
                          Details
                        </Button>
                        <Button size="sm">
                          Update Status
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Schedule
              </CardTitle>
              <CardDescription>
                Your upcoming appointments and tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {schedule.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <Calendar className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{item.title}</h4>
                      <p className="text-sm text-muted-foreground flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {item.location}
                      </p>
                      <div className="flex items-center space-x-4 mt-1 text-xs text-muted-foreground">
                        <span>{new Date(item.date).toLocaleDateString()}</span>
                        <span>{item.startTime} - {item.endTime}</span>
                        <Badge variant="outline">{item.type}</Badge>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoicing" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <DollarSign className="h-5 w-5 mr-2" />
                    Invoicing
                  </CardTitle>
                  <CardDescription>
                    Manage your invoices and payments
                  </CardDescription>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Invoice
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {invoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-green-100 rounded-full">
                        <FileText className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">{invoice.id}</h4>
                          <Badge variant="outline">{invoice.workOrderId}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{invoice.propertyName}</p>
                        <p className="text-xs text-muted-foreground">{invoice.description}</p>
                        <div className="flex items-center space-x-4 mt-1 text-xs text-muted-foreground">
                          <span>Created: {new Date(invoice.createdDate).toLocaleDateString()}</span>
                          <span>Due: {new Date(invoice.dueDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold">£{invoice.amount}</div>
                      <Badge className={getInvoiceStatusColor(invoice.status)}>
                        {invoice.status}
                      </Badge>
                      <div className="flex space-x-2 mt-2">
                        <Button size="sm" variant="outline">
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                        {invoice.status === 'draft' && (
                          <Button size="sm">
                            Send
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>Your key performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Job Completion Rate</span>
                      <span>95%</span>
                    </div>
                    <Progress value={95} className="mt-1" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Customer Satisfaction</span>
                      <span>4.8/5.0</span>
                    </div>
                    <Progress value={96} className="mt-1" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>On-Time Completion</span>
                      <span>92%</span>
                    </div>
                    <Progress value={92} className="mt-1" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Response Time</span>
                      <span>2.4h avg</span>
                    </div>
                    <Progress value={88} className="mt-1" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Summary</CardTitle>
                <CardDescription>This month's achievements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Jobs Completed</span>
                    <span className="font-semibold">24</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Earnings</span>
                    <span className="font-semibold">£3,840</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Average Job Value</span>
                    <span className="font-semibold">£160</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Client Reviews</span>
                    <span className="font-semibold flex items-center">
                      4.8 <Star className="h-4 w-4 text-yellow-500 ml-1 fill-current" />
                    </span>
                  </div>
                  <div className="pt-4 border-t">
                    <Button className="w-full" variant="outline">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      View Detailed Report
                    </Button>
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

export default ContractorDashboard;