import * as React from 'react';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/Textarea';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Mail,
  Send,
  Users,
  Calendar,
  BarChart3,
  Plus,
  Edit,
  Trash2,
  Eye,
  Play,
  Pause,
  Square,
  Copy,
  Download,
  Upload,
  Filter,
  Search,
  Target,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Settings,
  FileText,
  Image,
  Link,
  Zap,
  Globe,
  Smartphone,
  Monitor,
  PieChart,
  Activity,
  MousePointer,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '../../utils';

interface Campaign {
  id: string;
  name: string;
  description: string;
  type: 'EMAIL' | 'SMS' | 'PUSH' | 'SOCIAL';
  status: 'DRAFT' | 'SCHEDULED' | 'RUNNING' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  targetAudience: string;
  totalRecipients: number;
  sentCount: number;
  deliveredCount: number;
  openedCount: number;
  clickedCount: number;
  unsubscribedCount: number;
  bounceCount: number;
  conversionCount: number;
  revenue: number;
  startDate: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  tags: string[];
  emailTemplate?: EmailTemplate;
  automationRules?: AutomationRule[];
  abTestSettings?: ABTestSettings;
  analytics: CampaignAnalytics;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  previewText: string;
  fromName: string;
  fromEmail: string;
  replyTo: string;
  variables: string[];
  attachments: string[];
}

interface AutomationRule {
  id: string;
  name: string;
  trigger: 'SIGNUP' | 'PROPERTY_VIEW' | 'INQUIRY' | 'BOOKING' | 'CUSTOM';
  conditions: any[];
  actions: any[];
  isActive: boolean;
}

interface ABTestSettings {
  isEnabled: boolean;
  testType: 'SUBJECT' | 'CONTENT' | 'SEND_TIME' | 'FROM_NAME';
  variants: any[];
  trafficSplit: number;
  winnerCriteria: 'OPEN_RATE' | 'CLICK_RATE' | 'CONVERSION_RATE';
}

interface CampaignAnalytics {
  openRate: number;
  clickRate: number;
  conversionRate: number;
  unsubscribeRate: number;
  bounceRate: number;
  revenuePerRecipient: number;
  deviceBreakdown: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
  locationBreakdown: {
    country: string;
    count: number;
  }[];
  timeBreakdown: {
    hour: number;
    opens: number;
    clicks: number;
  }[];
}

const CampaignManagement: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [newCampaign, setNewCampaign] = useState<Partial<Campaign>>({
    name: '',
    description: '',
    type: 'EMAIL',
    status: 'DRAFT',
    priority: 'MEDIUM',
    targetAudience: '',
    tags: [],
  });

  // Mock data - replace with actual API calls
  useEffect(() => {
    const fetchCampaigns = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockCampaigns: Campaign[] = [
          {
            id: '1',
            name: 'New Property Listings - January 2024',
            description: 'Monthly newsletter featuring new property listings and market updates',
            type: 'EMAIL',
            status: 'COMPLETED',
            priority: 'HIGH',
            targetAudience: 'All Active Subscribers',
            totalRecipients: 2500,
            sentCount: 2500,
            deliveredCount: 2450,
            openedCount: 1225,
            clickedCount: 368,
            unsubscribedCount: 12,
            bounceCount: 50,
            conversionCount: 45,
            revenue: 125000,
            startDate: '2024-01-15T09:00:00Z',
            endDate: '2024-01-15T09:30:00Z',
            createdAt: '2024-01-10T10:00:00Z',
            updatedAt: '2024-01-15T10:00:00Z',
            createdBy: 'Sarah Johnson',
            tags: ['newsletter', 'properties', 'monthly'],
            emailTemplate: {
              id: '1',
              name: 'Property Newsletter Template',
              subject: 'New Properties Just Listed - Don\'t Miss Out!',
              htmlContent: '<html>...</html>',
              textContent: 'New properties available...',
              previewText: 'Discover amazing new properties in your area',
              fromName: 'PropertyMasters UK',
              fromEmail: 'listings@propertymasters.co.uk',
              replyTo: 'support@propertymasters.co.uk',
              variables: ['firstName', 'lastName', 'preferredLocation'],
              attachments: [],
            },
            analytics: {
              openRate: 49.0,
              clickRate: 15.0,
              conversionRate: 1.8,
              unsubscribeRate: 0.5,
              bounceRate: 2.0,
              revenuePerRecipient: 50.0,
              deviceBreakdown: {
                desktop: 45,
                mobile: 50,
                tablet: 5,
              },
              locationBreakdown: [
                { country: 'United Kingdom', count: 2200 },
                { country: 'Ireland', count: 200 },
                { country: 'Other', count: 100 },
              ],
              timeBreakdown: [
                { hour: 9, opens: 245, clicks: 73 },
                { hour: 10, opens: 320, clicks: 96 },
                { hour: 11, opens: 280, clicks: 84 },
                { hour: 12, opens: 180, clicks: 54 },
                { hour: 13, opens: 120, clicks: 36 },
                { hour: 14, opens: 80, clicks: 25 },
              ],
            },
          },
          {
            id: '2',
            name: 'Welcome Series - New Subscribers',
            description: 'Automated welcome email series for new subscribers',
            type: 'EMAIL',
            status: 'RUNNING',
            priority: 'MEDIUM',
            targetAudience: 'New Subscribers',
            totalRecipients: 150,
            sentCount: 150,
            deliveredCount: 148,
            openedCount: 89,
            clickedCount: 34,
            unsubscribedCount: 2,
            bounceCount: 2,
            conversionCount: 8,
            revenue: 15000,
            startDate: '2024-01-01T00:00:00Z',
            createdAt: '2023-12-20T10:00:00Z',
            updatedAt: '2024-01-16T10:00:00Z',
            createdBy: 'Mike Davis',
            tags: ['welcome', 'automation', 'onboarding'],
            analytics: {
              openRate: 59.3,
              clickRate: 22.7,
              conversionRate: 5.3,
              unsubscribeRate: 1.3,
              bounceRate: 1.3,
              revenuePerRecipient: 100.0,
              deviceBreakdown: {
                desktop: 35,
                mobile: 60,
                tablet: 5,
              },
              locationBreakdown: [
                { country: 'United Kingdom', count: 135 },
                { country: 'Ireland', count: 10 },
                { country: 'Other', count: 5 },
              ],
              timeBreakdown: [],
            },
          },
          {
            id: '3',
            name: 'Property Price Alerts',
            description: 'Weekly price drop alerts for saved properties',
            type: 'EMAIL',
            status: 'SCHEDULED',
            priority: 'HIGH',
            targetAudience: 'Users with Saved Properties',
            totalRecipients: 800,
            sentCount: 0,
            deliveredCount: 0,
            openedCount: 0,
            clickedCount: 0,
            unsubscribedCount: 0,
            bounceCount: 0,
            conversionCount: 0,
            revenue: 0,
            startDate: '2024-01-20T08:00:00Z',
            createdAt: '2024-01-16T14:00:00Z',
            updatedAt: '2024-01-16T14:00:00Z',
            createdBy: 'Emma Wilson',
            tags: ['alerts', 'price-drops', 'weekly'],
            analytics: {
              openRate: 0,
              clickRate: 0,
              conversionRate: 0,
              unsubscribeRate: 0,
              bounceRate: 0,
              revenuePerRecipient: 0,
              deviceBreakdown: {
                desktop: 0,
                mobile: 0,
                tablet: 0,
              },
              locationBreakdown: [],
              timeBreakdown: [],
            },
          },
        ];
        
        setCampaigns(mockCampaigns);
      } catch (error) {
        toast.error('Failed to load campaigns');
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  const getStatusColor = (status: string) => {
    const colors = {
      DRAFT: 'bg-gray-100 text-gray-800',
      SCHEDULED: 'bg-blue-100 text-blue-800',
      RUNNING: 'bg-green-100 text-green-800',
      PAUSED: 'bg-yellow-100 text-yellow-800',
      COMPLETED: 'bg-purple-100 text-purple-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      LOW: 'bg-gray-100 text-gray-800',
      MEDIUM: 'bg-yellow-100 text-yellow-800',
      HIGH: 'bg-orange-100 text-orange-800',
      URGENT: 'bg-red-100 text-red-800',
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      DRAFT: <FileText className="w-4 h-4" />,
      SCHEDULED: <Clock className="w-4 h-4" />,
      RUNNING: <Play className="w-4 h-4" />,
      PAUSED: <Pause className="w-4 h-4" />,
      COMPLETED: <CheckCircle className="w-4 h-4" />,
      CANCELLED: <XCircle className="w-4 h-4" />,
    };
    return icons[status as keyof typeof icons] || <FileText className="w-4 h-4" />;
  };



  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const handleCreateCampaign = async () => {
    try {
      // Simulate API call
      const campaignData = {
        ...newCampaign,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'Current User',
        totalRecipients: 0,
        sentCount: 0,
        deliveredCount: 0,
        openedCount: 0,
        clickedCount: 0,
        unsubscribedCount: 0,
        bounceCount: 0,
        conversionCount: 0,
        revenue: 0,
        analytics: {
          openRate: 0,
          clickRate: 0,
          conversionRate: 0,
          unsubscribeRate: 0,
          bounceRate: 0,
          revenuePerRecipient: 0,
          deviceBreakdown: { desktop: 0, mobile: 0, tablet: 0 },
          locationBreakdown: [],
          timeBreakdown: [],
        },
      };
      
      setCampaigns([...campaigns, campaignData as Campaign]);
      setNewCampaign({
        name: '',
        description: '',
        type: 'EMAIL',
        status: 'DRAFT',
        priority: 'MEDIUM',
        targetAudience: '',
        tags: [],
      });
      setIsCreateDialogOpen(false);
      toast.success('Campaign created successfully');
    } catch (error) {
      toast.error('Failed to create campaign');
    }
  };

  const handleUpdateCampaignStatus = async (campaignId: string, newStatus: string) => {
    try {
      setCampaigns(campaigns.map(campaign => 
        campaign.id === campaignId ? { ...campaign, status: newStatus as any } : campaign
      ));
      toast.success(`Campaign ${newStatus.toLowerCase()}`);
    } catch (error) {
      toast.error('Failed to update campaign status');
    }
  };

  const handleDeleteCampaign = async (campaignId: string) => {
    try {
      setCampaigns(campaigns.filter(campaign => campaign.id !== campaignId));
      toast.success('Campaign deleted successfully');
    } catch (error) {
      toast.error('Failed to delete campaign');
    }
  };

  const handleDuplicateCampaign = async (campaign: Campaign) => {
    try {
      const duplicatedCampaign = {
        ...campaign,
        id: Date.now().toString(),
        name: `${campaign.name} (Copy)`,
        status: 'DRAFT' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        totalRecipients: 0,
        sentCount: 0,
        deliveredCount: 0,
        openedCount: 0,
        clickedCount: 0,
        unsubscribedCount: 0,
        bounceCount: 0,
        conversionCount: 0,
        revenue: 0,
      };
      
      setCampaigns([...campaigns, duplicatedCampaign]);
      toast.success('Campaign duplicated successfully');
    } catch (error) {
      toast.error('Failed to duplicate campaign');
    }
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = 
      campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.targetAudience.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
    const matchesType = typeFilter === 'all' || campaign.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Campaign Management</h2>
          <p className="text-gray-600 mt-1">Create and manage your marketing campaigns</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" className="flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </Button>
          <Button variant="outline" className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4" />
            <span>Analytics</span>
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Create Campaign</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Campaign</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="name">Campaign Name</Label>
                  <Input
                    id="name"
                    value={newCampaign.name}
                    onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                    placeholder="Enter campaign name"
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newCampaign.description}
                    onChange={(e) => setNewCampaign({ ...newCampaign, description: e.target.value })}
                    placeholder="Enter campaign description"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Campaign Type</Label>
                  <Select value={newCampaign.type} onValueChange={(value) => setNewCampaign({ ...newCampaign, type: value as any })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EMAIL">Email</SelectItem>
                      <SelectItem value="SMS">SMS</SelectItem>
                      <SelectItem value="PUSH">Push Notification</SelectItem>
                      <SelectItem value="SOCIAL">Social Media</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={newCampaign.priority} onValueChange={(value) => setNewCampaign({ ...newCampaign, priority: value as any })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="URGENT">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="targetAudience">Target Audience</Label>
                  <Input
                    id="targetAudience"
                    value={newCampaign.targetAudience}
                    onChange={(e) => setNewCampaign({ ...newCampaign, targetAudience: e.target.value })}
                    placeholder="Enter target audience description"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateCampaign}>
                  Create Campaign
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Campaigns</p>
                <p className="text-2xl font-bold text-gray-900">{campaigns.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Campaigns</p>
                <p className="text-2xl font-bold text-gray-900">
                  {campaigns.filter(c => c.status === 'RUNNING').length}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Play className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Recipients</p>
                <p className="text-2xl font-bold text-gray-900">
                  {campaigns.reduce((sum, c) => sum + c.totalRecipients, 0).toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(campaigns.reduce((sum, c) => sum + c.revenue, 0))}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <TrendingUp className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search campaigns by name, description, or audience..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                <SelectItem value="RUNNING">Running</SelectItem>
                <SelectItem value="PAUSED">Paused</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="EMAIL">Email</SelectItem>
                <SelectItem value="SMS">SMS</SelectItem>
                <SelectItem value="PUSH">Push</SelectItem>
                <SelectItem value="SOCIAL">Social</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Campaigns Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 font-medium">Campaign</th>
                  <th className="text-left py-3 px-4 font-medium">Type</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-left py-3 px-4 font-medium">Recipients</th>
                  <th className="text-left py-3 px-4 font-medium">Performance</th>
                  <th className="text-left py-3 px-4 font-medium">Revenue</th>
                  <th className="text-left py-3 px-4 font-medium">Created</th>
                  <th className="text-left py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCampaigns.map((campaign) => (
                  <tr key={campaign.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Mail className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{campaign.name}</p>
                          <p className="text-sm text-gray-600">{campaign.description}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge className={getPriorityColor(campaign.priority)}>
                              {campaign.priority}
                            </Badge>
                            {campaign.tags.length > 0 && (
                              <div className="flex space-x-1">
                                {campaign.tags.slice(0, 2).map((tag, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                                {campaign.tags.length > 2 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{campaign.tags.length - 2}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
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
                      <div className="space-y-1">
                        <p className="font-medium">{campaign.totalRecipients.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">
                          Sent: {campaign.sentCount.toLocaleString()}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm">Open:</span>
                          <span className="font-medium">{formatPercentage(campaign.analytics.openRate)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm">Click:</span>
                          <span className="font-medium">{formatPercentage(campaign.analytics.clickRate)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm">Conv:</span>
                          <span className="font-medium">{formatPercentage(campaign.analytics.conversionRate)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium">{formatCurrency(campaign.revenue)}</p>
                      <p className="text-sm text-gray-600">
                        {formatCurrency(campaign.analytics.revenuePerRecipient)}/recipient
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <p className="text-sm">{formatDate(campaign.createdAt)}</p>
                        <p className="text-xs text-gray-600">by {campaign.createdBy}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        {campaign.status === 'DRAFT' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUpdateCampaignStatus(campaign.id, 'RUNNING')}
                          >
                            <Play className="w-4 h-4" />
                          </Button>
                        )}
                        {campaign.status === 'RUNNING' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUpdateCampaignStatus(campaign.id, 'PAUSED')}
                          >
                            <Pause className="w-4 h-4" />
                          </Button>
                        )}
                        {campaign.status === 'PAUSED' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUpdateCampaignStatus(campaign.id, 'RUNNING')}
                          >
                            <Play className="w-4 h-4" />
                          </Button>
                        )}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedCampaign(campaign)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-6xl">
                            <DialogHeader>
                              <DialogTitle>{selectedCampaign?.name}</DialogTitle>
                            </DialogHeader>
                            {selectedCampaign && (
                              <Tabs defaultValue="overview" className="w-full">
                                <TabsList>
                                  <TabsTrigger value="overview">Overview</TabsTrigger>
                                  <TabsTrigger value="analytics">Analytics</TabsTrigger>
                                  <TabsTrigger value="content">Content</TabsTrigger>
                                  <TabsTrigger value="audience">Audience</TabsTrigger>
                                </TabsList>
                                <TabsContent value="overview" className="space-y-4">
                                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                    <Card>
                                      <CardContent className="p-4">
                                        <div className="flex items-center space-x-2">
                                          <Send className="w-5 h-5 text-blue-600" />
                                          <div>
                                            <p className="text-sm text-gray-600">Sent</p>
                                            <p className="font-bold">{selectedCampaign.sentCount.toLocaleString()}</p>
                                          </div>
                                        </div>
                                      </CardContent>
                                    </Card>
                                    <Card>
                                      <CardContent className="p-4">
                                        <div className="flex items-center space-x-2">
                                          <Eye className="w-5 h-5 text-green-600" />
                                          <div>
                                            <p className="text-sm text-gray-600">Opened</p>
                                            <p className="font-bold">{selectedCampaign.openedCount.toLocaleString()}</p>
                                          </div>
                                        </div>
                                      </CardContent>
                                    </Card>
                                    <Card>
                                      <CardContent className="p-4">
                                        <div className="flex items-center space-x-2">
                                          <MousePointer className="w-5 h-5 text-purple-600" />
                                          <div>
                                            <p className="text-sm text-gray-600">Clicked</p>
                                            <p className="font-bold">{selectedCampaign.clickedCount.toLocaleString()}</p>
                                          </div>
                                        </div>
                                      </CardContent>
                                    </Card>
                                    <Card>
                                      <CardContent className="p-4">
                                        <div className="flex items-center space-x-2">
                                          <Target className="w-5 h-5 text-orange-600" />
                                          <div>
                                            <p className="text-sm text-gray-600">Converted</p>
                                            <p className="font-bold">{selectedCampaign.conversionCount.toLocaleString()}</p>
                                          </div>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  </div>
                                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    <Card>
                                      <CardHeader>
                                        <CardTitle className="text-lg">Campaign Details</CardTitle>
                                      </CardHeader>
                                      <CardContent className="space-y-3">
                                        <div className="flex justify-between">
                                          <span className="text-gray-600">Status:</span>
                                          <Badge className={getStatusColor(selectedCampaign.status)}>
                                            {selectedCampaign.status}
                                          </Badge>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-600">Type:</span>
                                          <Badge variant="outline">{selectedCampaign.type}</Badge>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-600">Priority:</span>
                                          <Badge className={getPriorityColor(selectedCampaign.priority)}>
                                            {selectedCampaign.priority}
                                          </Badge>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-600">Target Audience:</span>
                                          <span className="font-medium">{selectedCampaign.targetAudience}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-600">Created:</span>
                                          <span className="font-medium">{formatDate(selectedCampaign.createdAt)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-600">Created By:</span>
                                          <span className="font-medium">{selectedCampaign.createdBy}</span>
                                        </div>
                                      </CardContent>
                                    </Card>
                                    <Card>
                                      <CardHeader>
                                        <CardTitle className="text-lg">Performance Metrics</CardTitle>
                                      </CardHeader>
                                      <CardContent className="space-y-3">
                                        <div className="flex justify-between">
                                          <span className="text-gray-600">Open Rate:</span>
                                          <span className="font-medium">{formatPercentage(selectedCampaign.analytics.openRate)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-600">Click Rate:</span>
                                          <span className="font-medium">{formatPercentage(selectedCampaign.analytics.clickRate)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-600">Conversion Rate:</span>
                                          <span className="font-medium">{formatPercentage(selectedCampaign.analytics.conversionRate)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-600">Unsubscribe Rate:</span>
                                          <span className="font-medium">{formatPercentage(selectedCampaign.analytics.unsubscribeRate)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-600">Bounce Rate:</span>
                                          <span className="font-medium">{formatPercentage(selectedCampaign.analytics.bounceRate)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-600">Revenue/Recipient:</span>
                                          <span className="font-medium">{formatCurrency(selectedCampaign.analytics.revenuePerRecipient)}</span>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  </div>
                                </TabsContent>
                                <TabsContent value="analytics">
                                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <Card>
                                      <CardHeader>
                                        <CardTitle className="text-lg">Device Breakdown</CardTitle>
                                      </CardHeader>
                                      <CardContent>
                                        <div className="space-y-3">
                                          <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                              <Monitor className="w-4 h-4 text-gray-600" />
                                              <span>Desktop</span>
                                            </div>
                                            <span className="font-medium">{selectedCampaign.analytics.deviceBreakdown.desktop}%</span>
                                          </div>
                                          <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                              <Smartphone className="w-4 h-4 text-gray-600" />
                                              <span>Mobile</span>
                                            </div>
                                            <span className="font-medium">{selectedCampaign.analytics.deviceBreakdown.mobile}%</span>
                                          </div>
                                          <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                              <Monitor className="w-4 h-4 text-gray-600" />
                                              <span>Tablet</span>
                                            </div>
                                            <span className="font-medium">{selectedCampaign.analytics.deviceBreakdown.tablet}%</span>
                                          </div>
                                        </div>
                                      </CardContent>
                                    </Card>
                                    <Card>
                                      <CardHeader>
                                        <CardTitle className="text-lg">Location Breakdown</CardTitle>
                                      </CardHeader>
                                      <CardContent>
                                        <div className="space-y-3">
                                          {selectedCampaign.analytics.locationBreakdown.map((location, index) => (
                                            <div key={index} className="flex items-center justify-between">
                                              <div className="flex items-center space-x-2">
                                                <Globe className="w-4 h-4 text-gray-600" />
                                                <span>{location.country}</span>
                                              </div>
                                              <span className="font-medium">{location.count.toLocaleString()}</span>
                                            </div>
                                          ))}
                                        </div>
                                      </CardContent>
                                    </Card>
                                  </div>
                                </TabsContent>
                                <TabsContent value="content">
                                  {selectedCampaign.emailTemplate ? (
                                    <div className="space-y-4">
                                      <Card>
                                        <CardHeader>
                                          <CardTitle className="text-lg">Email Template</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                          <div className="grid grid-cols-2 gap-4">
                                            <div>
                                              <Label className="text-sm font-medium text-gray-600">Template Name</Label>
                                              <p className="mt-1">{selectedCampaign.emailTemplate.name}</p>
                                            </div>
                                            <div>
                                              <Label className="text-sm font-medium text-gray-600">Subject Line</Label>
                                              <p className="mt-1">{selectedCampaign.emailTemplate.subject}</p>
                                            </div>
                                            <div>
                                              <Label className="text-sm font-medium text-gray-600">From Name</Label>
                                              <p className="mt-1">{selectedCampaign.emailTemplate.fromName}</p>
                                            </div>
                                            <div>
                                              <Label className="text-sm font-medium text-gray-600">From Email</Label>
                                              <p className="mt-1">{selectedCampaign.emailTemplate.fromEmail}</p>
                                            </div>
                                          </div>
                                          <div>
                                            <Label className="text-sm font-medium text-gray-600">Preview Text</Label>
                                            <p className="mt-1">{selectedCampaign.emailTemplate.previewText}</p>
                                          </div>
                                          {selectedCampaign.emailTemplate.variables.length > 0 && (
                                            <div>
                                              <Label className="text-sm font-medium text-gray-600">Variables</Label>
                                              <div className="mt-2 flex flex-wrap gap-2">
                                                {selectedCampaign.emailTemplate.variables.map((variable, index) => (
                                                  <Badge key={index} variant="outline">
                                                    &#123;&#123;{variable}&#125;&#125;
                                                  </Badge>
                                                ))}
                                              </div>
                                            </div>
                                          )}
                                        </CardContent>
                                      </Card>
                                    </div>
                                  ) : (
                                    <div className="text-center py-8">
                                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                      <p className="text-gray-600">No content template configured</p>
                                    </div>
                                  )}
                                </TabsContent>
                                <TabsContent value="audience">
                                  <Card>
                                    <CardHeader>
                                      <CardTitle className="text-lg">Audience Information</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <Label className="text-sm font-medium text-gray-600">Target Audience</Label>
                                          <p className="mt-1 font-medium">{selectedCampaign.targetAudience}</p>
                                        </div>
                                        <div>
                                          <Label className="text-sm font-medium text-gray-600">Total Recipients</Label>
                                          <p className="mt-1 font-medium">{selectedCampaign.totalRecipients.toLocaleString()}</p>
                                        </div>
                                        <div>
                                          <Label className="text-sm font-medium text-gray-600">Successfully Delivered</Label>
                                          <p className="mt-1 font-medium">{selectedCampaign.deliveredCount.toLocaleString()}</p>
                                        </div>
                                        <div>
                                          <Label className="text-sm font-medium text-gray-600">Bounced</Label>
                                          <p className="mt-1 font-medium">{selectedCampaign.bounceCount.toLocaleString()}</p>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                </TabsContent>
                              </Tabs>
                            )}
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDuplicateCampaign(campaign)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCampaign(campaign.id)}
                        >
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

      {filteredCampaigns.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                ? 'No campaigns match your current filters. Try adjusting your search criteria.'
                : 'Get started by creating your first marketing campaign.'}
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Campaign
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CampaignManagement;