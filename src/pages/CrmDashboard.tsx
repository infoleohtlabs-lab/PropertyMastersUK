import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Leads</p>
                  <p className="text-3xl font-bold text-gray-900">1,247</p>
                  <p className="text-sm text-green-600 mt-1">+12% from last month</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                  <p className="text-3xl font-bold text-gray-900">24.5%</p>
                  <p className="text-sm text-green-600 mt-1">+3.2% from last month</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Deals</p>
                  <p className="text-3xl font-bold text-gray-900">89</p>
                  <p className="text-sm text-blue-600 mt-1">{formatCurrency(2450000)} value</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Target className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Email Open Rate</p>
                  <p className="text-3xl font-bold text-gray-900">68.5%</p>
                  <p className="text-sm text-green-600 mt-1">+5.1% from last month</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <Mail className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

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
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5" />
                    <span>Lead Pipeline</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { stage: 'New', count: 45, color: 'bg-blue-500' },
                      { stage: 'Contacted', count: 32, color: 'bg-yellow-500' },
                      { stage: 'Qualified', count: 28, color: 'bg-green-500' },
                      { stage: 'Proposal', count: 15, color: 'bg-purple-500' },
                      { stage: 'Negotiation', count: 8, color: 'bg-orange-500' },
                    ].map((stage) => (
                      <div key={stage.stage} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${stage.color}`}></div>
                          <span className="text-sm font-medium">{stage.stage}</span>
                        </div>
                        <span className="text-sm text-gray-600">{stage.count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activities */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="w-5 h-5" />
                    <span>Recent Activities</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        action: 'New lead created',
                        details: 'John Smith from Website',
                        time: '2 hours ago',
                        icon: <UserPlus className="w-4 h-4 text-blue-600" />,
                      },
                      {
                        action: 'Deal updated',
                        details: 'Luxury Apartment Sale moved to Negotiation',
                        time: '4 hours ago',
                        icon: <Target className="w-4 h-4 text-purple-600" />,
                      },
                      {
                        action: 'Email campaign sent',
                        details: 'New Property Listings to 1,250 contacts',
                        time: '1 day ago',
                        icon: <Mail className="w-4 h-4 text-green-600" />,
                      },
                    ].map((activity, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="p-2 bg-gray-100 rounded-full">
                          {activity.icon}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.action}</p>
                          <p className="text-sm text-gray-600">{activity.details}</p>
                          <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="leads" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Leads Management</CardTitle>
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input
                        placeholder="Search leads..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                    <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium">Name</th>
                        <th className="text-left py-3 px-4 font-medium">Contact</th>
                        <th className="text-left py-3 px-4 font-medium">Status</th>
                        <th className="text-left py-3 px-4 font-medium">Score</th>
                        <th className="text-left py-3 px-4 font-medium">Agent</th>
                        <th className="text-left py-3 px-4 font-medium">Budget</th>
                        <th className="text-left py-3 px-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leads.map((lead) => (
                        <tr key={lead.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium">{lead.firstName} {lead.lastName}</p>
                              <p className="text-sm text-gray-600">{lead.interestedProperty}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div>
                              <p className="text-sm">{lead.email}</p>
                              <p className="text-sm text-gray-600">{lead.phone}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={getStatusColor(lead.status)}>
                              <div className="flex items-center space-x-1">
                                {getStatusIcon(lead.status)}
                                <span>{lead.status}</span>
                              </div>
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <div className="w-12 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{ width: `${lead.score}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium">{lead.score}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <p className="text-sm">{lead.assignedAgent}</p>
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-medium">{lead.budget ? formatCurrency(lead.budget) : 'N/A'}</p>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
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
          </TabsContent>

          <TabsContent value="contacts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Contacts Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Contacts management interface will be implemented here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="deals" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Deals Pipeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Deals pipeline interface will be implemented here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="campaigns" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Email Campaigns</CardTitle>
                  <Button className="flex items-center space-x-2">
                    <Plus className="w-4 h-4" />
                    <span>New Campaign</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium">Campaign</th>
                        <th className="text-left py-3 px-4 font-medium">Type</th>
                        <th className="text-left py-3 px-4 font-medium">Status</th>
                        <th className="text-left py-3 px-4 font-medium">Sent</th>
                        <th className="text-left py-3 px-4 font-medium">Open Rate</th>
                        <th className="text-left py-3 px-4 font-medium">Click Rate</th>
                        <th className="text-left py-3 px-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {campaigns.map((campaign) => (
                        <tr key={campaign.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium">{campaign.name}</p>
                              <p className="text-sm text-gray-600">{campaign.targetAudience}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="outline">{campaign.type}</Badge>
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={getStatusColor(campaign.status)}>
                              <div className="flex items-center space-x-1">
                                {getStatusIcon(campaign.status)}
                                <span>{campaign.status}</span>
                              </div>
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-medium">{campaign.totalSent.toLocaleString()}</p>
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-medium">{campaign.openRate}%</p>
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-medium">{campaign.clickRate}%</p>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CrmDashboard;