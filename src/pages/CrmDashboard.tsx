import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { DashboardWidget, MetricWidget } from '../components/ui/dashboard-widget';
import { DashboardGrid, GridContainer } from '../components/ui/grid-layout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Users,
  TrendingUp,
  Target,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  BarChart3,
  PieChart,
  Filter,
  Search,
  Plus,
  Download,
  Upload,
  Settings,
  Eye,
  Edit,
  Trash2,
  UserPlus,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Activity,
  MoreHorizontal,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';

interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'PROPOSAL' | 'NEGOTIATION' | 'CLOSED_WON' | 'CLOSED_LOST';
  source: string;
  score: number;
  assignedAgent: string;
  createdAt: string;
  lastContactDate?: string;
  nextFollowUpDate?: string;
  interestedProperty?: string;
  budget?: number;
}

interface Campaign {
  id: string;
  name: string;
  type: 'EMAIL' | 'SMS' | 'SOCIAL_MEDIA' | 'DIRECT_MAIL';
  status: 'DRAFT' | 'SCHEDULED' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
  targetAudience: string;
  startDate: string;
  endDate?: string;
  totalSent: number;
  openRate: number;
  clickRate: number;
  conversionRate: number;
}

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company?: string;
  type: 'LEAD' | 'CLIENT' | 'PROSPECT' | 'PARTNER';
  status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
  lastContactDate?: string;
  totalValue: number;
  dealCount: number;
}

interface Deal {
  id: string;
  title: string;
  value: number;
  stage: 'PROSPECTING' | 'QUALIFICATION' | 'PROPOSAL' | 'NEGOTIATION' | 'CLOSING' | 'WON' | 'LOST';
  probability: number;
  expectedCloseDate: string;
  contact: string;
  assignedAgent: string;
  property?: string;
}

const CrmDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data - replace with actual API calls
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Simulate API calls
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setLeads([
          {
            id: '1',
            firstName: 'John',
            lastName: 'Smith',
            email: 'john.smith@email.com',
            phone: '+44 20 1234 5678',
            status: 'NEW',
            source: 'Website',
            score: 85,
            assignedAgent: 'Sarah Johnson',
            createdAt: '2024-01-15',
            budget: 450000,
            interestedProperty: '3-bed house in London',
          },
          {
            id: '2',
            firstName: 'Emma',
            lastName: 'Wilson',
            email: 'emma.wilson@email.com',
            phone: '+44 20 9876 5432',
            status: 'QUALIFIED',
            source: 'Referral',
            score: 92,
            assignedAgent: 'Mike Davis',
            createdAt: '2024-01-14',
            lastContactDate: '2024-01-16',
            nextFollowUpDate: '2024-01-20',
            budget: 320000,
          },
        ]);

        setCampaigns([
          {
            id: '1',
            name: 'New Property Listings',
            type: 'EMAIL',
            status: 'ACTIVE',
            targetAudience: 'All Leads',
            startDate: '2024-01-10',
            endDate: '2024-01-31',
            totalSent: 1250,
            openRate: 68.5,
            clickRate: 12.3,
            conversionRate: 3.2,
          },
          {
            id: '2',
            name: 'Winter Property Fair',
            type: 'EMAIL',
            status: 'SCHEDULED',
            targetAudience: 'Qualified Leads',
            startDate: '2024-01-25',
            totalSent: 0,
            openRate: 0,
            clickRate: 0,
            conversionRate: 0,
          },
        ]);

        setContacts([
          {
            id: '1',
            firstName: 'David',
            lastName: 'Brown',
            email: 'david.brown@email.com',
            phone: '+44 20 5555 1234',
            company: 'Brown Investments',
            type: 'CLIENT',
            status: 'ACTIVE',
            lastContactDate: '2024-01-15',
            totalValue: 850000,
            dealCount: 3,
          },
        ]);

        setDeals([
          {
            id: '1',
            title: 'Luxury Apartment Sale',
            value: 750000,
            stage: 'NEGOTIATION',
            probability: 75,
            expectedCloseDate: '2024-02-15',
            contact: 'David Brown',
            assignedAgent: 'Sarah Johnson',
            property: 'Penthouse in Canary Wharf',
          },
        ]);
      } catch (error) {
        toast.error('Failed to load CRM data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStatusColor = (status: string) => {
    const colors = {
      NEW: 'bg-blue-100 text-blue-800',
      CONTACTED: 'bg-yellow-100 text-yellow-800',
      QUALIFIED: 'bg-green-100 text-green-800',
      PROPOSAL: 'bg-purple-100 text-purple-800',
      NEGOTIATION: 'bg-orange-100 text-orange-800',
      CLOSED_WON: 'bg-green-100 text-green-800',
      CLOSED_LOST: 'bg-red-100 text-red-800',
      DRAFT: 'bg-gray-100 text-gray-800',
      SCHEDULED: 'bg-blue-100 text-blue-800',
      ACTIVE: 'bg-green-100 text-green-800',
      PAUSED: 'bg-yellow-100 text-yellow-800',
      COMPLETED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
      PROSPECTING: 'bg-blue-100 text-blue-800',
      QUALIFICATION: 'bg-yellow-100 text-yellow-800',
      CLOSING: 'bg-orange-100 text-orange-800',
      WON: 'bg-green-100 text-green-800',
      LOST: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      NEW: <AlertCircle className="w-4 h-4" />,
      CONTACTED: <Phone className="w-4 h-4" />,
      QUALIFIED: <CheckCircle className="w-4 h-4" />,
      PROPOSAL: <Mail className="w-4 h-4" />,
      NEGOTIATION: <MessageSquare className="w-4 h-4" />,
      CLOSED_WON: <CheckCircle className="w-4 h-4" />,
      CLOSED_LOST: <XCircle className="w-4 h-4" />,
      ACTIVE: <CheckCircle className="w-4 h-4" />,
      SCHEDULED: <Clock className="w-4 h-4" />,
      COMPLETED: <CheckCircle className="w-4 h-4" />,
    };
    return icons[status as keyof typeof icons] || <AlertCircle className="w-4 h-4" />;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">CRM Dashboard</h1>
              <p className="text-gray-600 mt-2">Manage your leads, contacts, deals, and campaigns</p>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" className="flex items-center space-x-2">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </Button>
              <Button variant="outline" className="flex items-center space-x-2">
                <Upload className="w-4 h-4" />
                <span>Import</span>
              </Button>
              <Button className="flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Add Lead</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Overview Cards */}
        <GridContainer className="mb-8">
          <DashboardGrid layout="widgets" gap="lg">
            <MetricWidget
              title="Total Leads"
              icon={<Users className="h-5 w-5" />}
              color="blue"
              metric={{
                current: leads.length,
                previous: Math.floor(leads.length * 0.88),
                target: 150,
              }}
              onClick={() => setActiveTab('leads')}
            />

            <MetricWidget
              title="Conversion Rate"
              icon={<Target className="h-5 w-5" />}
              color="green"
              metric={{
                current: 24.5,
                previous: 22.4,
                unit: '%',
              }}
            />

            <MetricWidget
              title="Active Deals"
              icon={<DollarSign className="h-5 w-5" />}
              color="purple"
              metric={{
                current: deals.length,
                previous: Math.floor(deals.length * 1.05),
                target: 50,
              }}
              onClick={() => setActiveTab('deals')}
            />

            <MetricWidget
              title="Email Open Rate"
              icon={<Mail className="h-5 w-5" />}
              color="orange"
              metric={{
                current: 68.2,
                previous: 63.9,
                unit: '%',
              }}
            />
          </DashboardGrid>
        </GridContainer>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="leads">Leads</TabsTrigger>
            <TabsTrigger value="contacts">Contacts</TabsTrigger>
            <TabsTrigger value="deals">Deals</TabsTrigger>
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Lead Pipeline */}
              <Card variant="elevated" hover className="group">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-heading-3 flex items-center space-x-2">
                      <BarChart3 className="w-5 h-5" />
                      <span>Lead Pipeline</span>
                    </span>
                    <Button variant="outline" size="sm" className="opacity-70 group-hover:opacity-100 transition-opacity">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="stack-sm">
                    {[
                      { stage: 'New', count: 45, color: 'bg-blue-500' },
                      { stage: 'Contacted', count: 32, color: 'bg-yellow-500' },
                      { stage: 'Qualified', count: 28, color: 'bg-green-500' },
                      { stage: 'Proposal', count: 15, color: 'bg-purple-500' },
                      { stage: 'Negotiation', count: 8, color: 'bg-orange-500' },
                    ].map((stage) => (
                      <div key={stage.stage} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 hover:border-gray-200 transition-all duration-200 cursor-pointer">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${stage.color} ring-2 ring-gray-50`}></div>
                          <span className="text-body font-medium">{stage.stage}</span>
                        </div>
                        <span className="text-body-sm text-gray-600 font-semibold">{stage.count}</span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-4 border-t border-gray-100">
                    <Button variant="outline" className="w-full hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-colors">
                      View All Pipeline
                      <BarChart3 className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activities */}
              <Card variant="elevated" hover className="group">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-heading-3 flex items-center space-x-2">
                      <Activity className="w-5 h-5" />
                      <span>Recent Activities</span>
                    </span>
                    <Button variant="ghost" size="sm" className="opacity-70 group-hover:opacity-100 transition-opacity">
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="stack-sm">
                    {[
                      {
                        action: 'New lead created',
                        user: 'John Smith',
                        time: '2 minutes ago',
                        type: 'lead',
                        color: 'blue',
                      },
                      {
                        action: 'Deal closed',
                        user: 'Sarah Johnson',
                        time: '1 hour ago',
                        type: 'deal',
                        color: 'green',
                      },
                      {
                        action: 'Email sent',
                        user: 'Mike Wilson',
                        time: '3 hours ago',
                        type: 'email',
                        color: 'orange',
                      },
                      {
                        action: 'Meeting scheduled',
                        user: 'Emma Davis',
                        time: '5 hours ago',
                        type: 'meeting',
                        color: 'purple',
                      },
                    ].map((activity, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 border border-gray-100 rounded-lg hover:bg-gray-50 hover:border-gray-200 transition-all duration-200 cursor-pointer">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ring-2 ${
                          activity.color === 'blue' ? 'bg-blue-100 text-blue-600 ring-blue-50' :
                          activity.color === 'green' ? 'bg-green-100 text-green-600 ring-green-50' :
                          activity.color === 'orange' ? 'bg-orange-100 text-orange-600 ring-orange-50' :
                          'bg-purple-100 text-purple-600 ring-purple-50'
                        }`}>
                          {activity.type === 'lead' && <Users className="w-4 h-4" />}
                          {activity.type === 'deal' && <DollarSign className="w-4 h-4" />}
                          {activity.type === 'email' && <Mail className="w-4 h-4" />}
                          {activity.type === 'meeting' && <Calendar className="w-4 h-4" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-body font-medium text-gray-900">
                            {activity.action}
                          </p>
                          <p className="text-body-sm text-gray-500">
                            by <span className="font-medium">{activity.user}</span> • {activity.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="pt-4 border-t border-gray-100">
                    <Button variant="outline" className="w-full hover:bg-gray-50 hover:border-gray-200 transition-colors">
                      View All Activities
                      <Activity className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="leads" className="space-y-6">
            <GridContainer>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h3 className="text-heading-2 text-gray-900">Lead Management</h3>
                  <p className="text-body text-gray-600 mt-1">Track and manage your sales leads</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <Input
                    placeholder="Search leads..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    variant="search"
                    size="default"
                    leftIcon={<Search className="h-4 w-4" />}
                    className="w-full sm:w-64"
                  />
                  <Button className="btn-primary">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Lead
                  </Button>
                </div>
              </div>

              <Card variant="elevated" className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                        <tr>
                          <th className="text-left p-4 font-semibold text-gray-900 text-body">Name</th>
                          <th className="text-left p-4 font-semibold text-gray-900 text-body">Contact</th>
                          <th className="text-left p-4 font-semibold text-gray-900 text-body">Status</th>
                          <th className="text-left p-4 font-semibold text-gray-900 text-body">Score</th>
                          <th className="text-left p-4 font-semibold text-gray-900 text-body">Agent</th>
                          <th className="text-left p-4 font-semibold text-gray-900 text-body">Budget</th>
                          <th className="text-left p-4 font-semibold text-gray-900 text-body">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leads.map((lead, index) => (
                          <tr key={lead.id} className={`border-b border-gray-100 hover:bg-gray-50 transition-all duration-200 ${
                            index % 2 === 0 ? 'bg-white' : 'bg-gray-25'
                          }`}>
                            <td className="p-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center ring-2 ring-blue-50">
                                  <span className="text-blue-700 font-semibold text-sm">
                                    {lead.firstName[0]}{lead.lastName[0]}
                                  </span>
                                </div>
                                <div>
                                  <p className="font-medium text-body text-gray-900">{lead.firstName} {lead.lastName}</p>
                                  <p className="text-body-sm text-gray-600">{lead.interestedProperty}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <div>
                                <p className="text-body text-gray-900">{lead.email}</p>
                                <p className="text-body-sm text-gray-600">{lead.phone}</p>
                              </div>
                            </td>
                            <td className="p-4">
                              <Badge className={getStatusColor(lead.status)}>
                                <div className="flex items-center space-x-1">
                                  {getStatusIcon(lead.status)}
                                  <span>{lead.status}</span>
                                </div>
                              </Badge>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center space-x-2">
                                <div className="w-12 bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-blue-600 h-2 rounded-full"
                                    style={{ width: `${lead.score}%` }}
                                  ></div>
                                </div>
                                <span className="text-body-sm font-medium">{lead.score}</span>
                              </div>
                            </td>
                            <td className="p-4">
                              <p className="text-body text-gray-600">{lead.assignedAgent}</p>
                            </td>
                            <td className="p-4">
                              <p className="font-semibold text-body text-gray-900">{lead.budget ? formatCurrency(lead.budget) : 'N/A'}</p>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center space-x-1">
                                <Button variant="ghost" size="sm" className="hover:bg-blue-50 hover:text-blue-600 transition-colors">
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm" className="hover:bg-green-50 hover:text-green-600 transition-colors">
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm" className="hover:bg-red-50 hover:text-red-600 transition-colors">
                                  <Trash2 className="w-4 h-4" />
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
            </GridContainer>
          </TabsContent>

          <TabsContent value="contacts" className="space-y-6">
            <GridContainer>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h3 className="text-heading-2 text-gray-900">Contact Directory</h3>
                  <p className="text-body text-gray-600 mt-1">Manage your client and prospect contacts</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <Input
                    placeholder="Search contacts..."
                    variant="search"
                    size="default"
                    leftIcon={<Search className="h-4 w-4" />}
                    className="w-full sm:w-64"
                  />
                  <Button variant="outline" size="sm" className="hover:bg-gray-50">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                  <Button className="btn-primary">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Contact
                  </Button>
                </div>
              </div>

              <div className="grid-responsive">
                {contacts.map((contact) => (
                  <Card key={contact.id} variant="elevated" hover className="group">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center ring-2 ring-green-50 group-hover:ring-green-100 transition-all">
                          <span className="text-green-700 font-semibold text-sm">
                            {contact.firstName[0]}{contact.lastName[0]}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 text-body group-hover:text-green-700 transition-colors">{contact.firstName} {contact.lastName}</h4>
                          <p className="text-body-sm text-gray-600">{contact.company || 'No company'}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center space-x-3">
                          <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="text-body-sm text-gray-600 truncate">{contact.email}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="text-body-sm text-gray-600">{contact.phone}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <DollarSign className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="text-body-sm text-gray-600">{formatCurrency(contact.totalValue)}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <Badge variant={contact.type === 'CLIENT' ? 'default' : 'secondary'} className="text-xs">
                          {contact.type}
                        </Badge>
                        <div className="flex items-center space-x-1">
                          <Button variant="ghost" size="sm" className="hover:bg-blue-50 hover:text-blue-600 transition-colors">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="hover:bg-green-50 hover:text-green-600 transition-colors">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="hover:bg-gray-50 hover:text-gray-600 transition-colors">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </GridContainer>
          </TabsContent>

          <TabsContent value="deals" className="space-y-6">
              <GridContainer>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <div>
                    <h3 className="text-heading-2 text-gray-900">Deals Management</h3>
                    <p className="text-body text-gray-600 mt-1">Track and manage your property deals</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <Input
                      placeholder="Search deals..."
                      variant="search"
                      size="default"
                      leftIcon={<Search className="h-4 w-4" />}
                      className="w-full sm:w-64"
                    />
                    <Button variant="outline" size="sm" className="hover:bg-gray-50">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </Button>
                    <Button className="btn-primary">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Deal
                    </Button>
                  </div>
                </div>

                <div className="grid-responsive">
                  {deals.map((deal) => (
                    <Card key={deal.id} variant="elevated" hover className="group">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 text-body group-hover:text-blue-700 transition-colors mb-1">
                              {deal.propertyAddress}
                            </h4>
                            <p className="text-body-sm text-gray-600">{deal.clientName}</p>
                          </div>
                          <Badge variant={getStatusVariant(deal.status)} className="text-xs">
                            {deal.status}
                          </Badge>
                        </div>
                        
                        <div className="space-y-3 mb-4">
                          <div className="flex items-center justify-between">
                            <span className="text-body-sm text-gray-600">Deal Value</span>
                            <span className="font-semibold text-body text-gray-900">{formatCurrency(deal.value)}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-body-sm text-gray-600">Commission</span>
                            <span className="font-medium text-body text-green-600">{formatCurrency(deal.commission)}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-body-sm text-gray-600">Expected Close</span>
                            <span className="text-body-sm text-gray-600">{formatDate(deal.expectedCloseDate)}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-body-sm text-gray-600">Probability</span>
                            <div className="flex items-center space-x-2">
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full transition-all"
                                  style={{ width: `${deal.probability}%` }}
                                ></div>
                              </div>
                              <span className="text-body-sm font-medium text-gray-700">{deal.probability}%</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                              <span className="text-blue-700 font-medium text-xs">
                                {deal.assignedAgent.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <span className="text-body-sm text-gray-600">{deal.assignedAgent}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Button variant="ghost" size="sm" className="hover:bg-blue-50 hover:text-blue-600 transition-colors">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="hover:bg-green-50 hover:text-green-600 transition-colors">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="hover:bg-gray-50 hover:text-gray-600 transition-colors">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </GridContainer>
            </TabsContent>

          <TabsContent value="campaigns" className="space-y-6">
            <GridContainer>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h3 className="text-heading-2 text-gray-900">Email Campaigns</h3>
                  <p className="text-body text-gray-600 mt-1">Create and manage your marketing campaigns</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <Input
                    placeholder="Search campaigns..."
                    variant="search"
                    size="default"
                    leftIcon={<Search className="h-4 w-4" />}
                    className="w-full sm:w-64"
                  />
                  <Button variant="outline" size="sm" className="hover:bg-gray-50">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                  <Button className="btn-primary">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Campaign
                  </Button>
                </div>
              </div>

              <Card variant="elevated" hover className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="text-left py-4 px-6 font-semibold text-gray-900 text-body-sm">Campaign</th>
                          <th className="text-left py-4 px-6 font-semibold text-gray-900 text-body-sm">Type</th>
                          <th className="text-left py-4 px-6 font-semibold text-gray-900 text-body-sm">Status</th>
                          <th className="text-left py-4 px-6 font-semibold text-gray-900 text-body-sm">Sent</th>
                          <th className="text-left py-4 px-6 font-semibold text-gray-900 text-body-sm">Open Rate</th>
                          <th className="text-left py-4 px-6 font-semibold text-gray-900 text-body-sm">Click Rate</th>
                          <th className="text-left py-4 px-6 font-semibold text-gray-900 text-body-sm">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {campaigns.map((campaign) => (
                          <tr key={campaign.id} className="hover:bg-gray-50 transition-colors group">
                            <td className="py-4 px-6">
                              <div>
                                <p className="font-semibold text-gray-900 text-body group-hover:text-blue-700 transition-colors">{campaign.name}</p>
                                <p className="text-body-sm text-gray-600 mt-1">{campaign.targetAudience}</p>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <Badge variant="outline" className="text-xs">{campaign.type}</Badge>
                            </td>
                            <td className="py-4 px-6">
                              <Badge className={getStatusColor(campaign.status)}>
                                <div className="flex items-center space-x-1">
                                  {getStatusIcon(campaign.status)}
                                  <span>{campaign.status}</span>
                                </div>
                              </Badge>
                            </td>
                            <td className="py-4 px-6">
                              <p className="font-semibold text-gray-900 text-body">{campaign.totalSent.toLocaleString()}</p>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center space-x-2">
                                <div className="w-12 bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-green-500 h-2 rounded-full transition-all"
                                    style={{ width: `${campaign.openRate}%` }}
                                  ></div>
                                </div>
                                <span className="font-semibold text-gray-900 text-body-sm">{campaign.openRate}%</span>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center space-x-2">
                                <div className="w-12 bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-blue-500 h-2 rounded-full transition-all"
                                    style={{ width: `${campaign.clickRate}%` }}
                                  ></div>
                                </div>
                                <span className="font-semibold text-gray-900 text-body-sm">{campaign.clickRate}%</span>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center space-x-1">
                                <Button variant="ghost" size="sm" className="hover:bg-blue-50 hover:text-blue-600 transition-colors">
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm" className="hover:bg-green-50 hover:text-green-600 transition-colors">
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm" className="hover:bg-gray-50 hover:text-gray-600 transition-colors">
                                  <Settings className="w-4 h-4" />
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
            </GridContainer>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CrmDashboard;