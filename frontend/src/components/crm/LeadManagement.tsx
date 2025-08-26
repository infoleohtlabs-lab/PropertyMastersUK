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
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Banknote,
  Star,
  Plus,
  Edit,
  Trash2,
  Eye,
  MessageSquare,
  Clock,
  Target,
  TrendingUp,
  Filter,
  Search,
  Download,
  Upload,
  UserPlus,
  CheckCircle,
  AlertCircle,
  XCircle,
  Building,
  Tag,
  Activity,
  FileText,
  Send,
} from 'lucide-react';
import { toast } from 'sonner';

interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'PROPOSAL' | 'NEGOTIATION' | 'CLOSED_WON' | 'CLOSED_LOST';
  source: 'WEBSITE' | 'REFERRAL' | 'SOCIAL_MEDIA' | 'ADVERTISING' | 'COLD_CALL' | 'EVENT' | 'OTHER';
  type: 'BUYER' | 'SELLER' | 'TENANT' | 'LANDLORD' | 'INVESTOR';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  score: number;
  assignedAgent?: string;
  createdAt: string;
  lastContactDate?: string;
  nextFollowUpDate?: string;
  interestedProperty?: string;
  budget?: number;
  requirements?: string;
  company?: string;
  jobTitle?: string;
  address?: string;
  tags: string[];
  notes: string;
  activities: LeadActivity[];
  tasks: LeadTask[];
}

interface LeadActivity {
  id: string;
  type: 'EMAIL' | 'CALL' | 'MEETING' | 'PROPERTY_VIEW' | 'PROPOSAL_SENT' | 'NOTE_ADDED';
  title: string;
  description: string;
  date: string;
  agent: string;
}

interface LeadTask {
  id: string;
  title: string;
  description: string;
  type: 'CALL' | 'EMAIL' | 'MEETING' | 'FOLLOW_UP' | 'PROPOSAL' | 'OTHER';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  assignedTo: string;
}

const LeadManagement: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [newLead, setNewLead] = useState<Partial<Lead>>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    status: 'NEW',
    source: 'WEBSITE',
    type: 'BUYER',
    priority: 'MEDIUM',
    tags: [],
    notes: '',
  });

  // Mock data - replace with actual API calls
  useEffect(() => {
    const fetchLeads = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockLeads: Lead[] = [
          {
            id: '1',
            firstName: 'John',
            lastName: 'Smith',
            email: 'john.smith@email.com',
            phone: '+44 20 1234 5678',
            status: 'NEW',
            source: 'WEBSITE',
            type: 'BUYER',
            priority: 'HIGH',
            score: 85,
            assignedAgent: 'Sarah Johnson',
            createdAt: '2024-01-15T10:30:00Z',
            budget: 450000,
            interestedProperty: '3-bedroom house in London',
            requirements: 'Looking for a family home with garden, good schools nearby',
            company: 'Tech Solutions Ltd',
            jobTitle: 'Software Engineer',
            address: '123 Main Street, London, UK',
            tags: ['first-time-buyer', 'urgent', 'high-budget'],
            notes: 'Very interested, ready to move quickly. Has pre-approval for mortgage.',
            activities: [
              {
                id: '1',
                type: 'EMAIL',
                title: 'Welcome email sent',
                description: 'Sent welcome email with property recommendations',
                date: '2024-01-15T11:00:00Z',
                agent: 'Sarah Johnson',
              },
              {
                id: '2',
                type: 'CALL',
                title: 'Initial consultation call',
                description: 'Discussed requirements and budget. Very motivated buyer.',
                date: '2024-01-16T14:30:00Z',
                agent: 'Sarah Johnson',
              },
            ],
            tasks: [
              {
                id: '1',
                title: 'Schedule property viewing',
                description: 'Arrange viewing for 3 properties in preferred area',
                type: 'MEETING',
                priority: 'HIGH',
                dueDate: '2024-01-20T10:00:00Z',
                status: 'PENDING',
                assignedTo: 'Sarah Johnson',
              },
            ],
          },
          {
            id: '2',
            firstName: 'Emma',
            lastName: 'Wilson',
            email: 'emma.wilson@email.com',
            phone: '+44 20 9876 5432',
            status: 'QUALIFIED',
            source: 'REFERRAL',
            type: 'SELLER',
            priority: 'MEDIUM',
            score: 92,
            assignedAgent: 'Mike Davis',
            createdAt: '2024-01-14T09:15:00Z',
            lastContactDate: '2024-01-16T16:00:00Z',
            nextFollowUpDate: '2024-01-20T10:00:00Z',
            budget: 320000,
            interestedProperty: '2-bedroom apartment for sale',
            requirements: 'Looking to sell current property and downsize',
            tags: ['seller', 'downsizing'],
            notes: 'Needs to sell within 3 months due to relocation.',
            activities: [],
            tasks: [],
          },
        ];
        
        setLeads(mockLeads);
      } catch (error) {
        toast.error('Failed to load leads');
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
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
      NEW: <AlertCircle className="w-4 h-4" />,
      CONTACTED: <Phone className="w-4 h-4" />,
      QUALIFIED: <CheckCircle className="w-4 h-4" />,
      PROPOSAL: <Mail className="w-4 h-4" />,
      NEGOTIATION: <MessageSquare className="w-4 h-4" />,
      CLOSED_WON: <CheckCircle className="w-4 h-4" />,
      CLOSED_LOST: <XCircle className="w-4 h-4" />,
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
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleCreateLead = async () => {
    try {
      // Simulate API call
      const leadData = {
        ...newLead,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        score: Math.floor(Math.random() * 100),
        activities: [],
        tasks: [],
      };
      
      setLeads([...leads, leadData as Lead]);
      setNewLead({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        status: 'NEW',
        source: 'WEBSITE',
        type: 'BUYER',
        priority: 'MEDIUM',
        tags: [],
        notes: '',
      });
      setIsCreateDialogOpen(false);
      toast.success('Lead created successfully');
    } catch (error) {
      toast.error('Failed to create lead');
    }
  };

  const handleUpdateLeadStatus = async (leadId: string, newStatus: string) => {
    try {
      setLeads(leads.map(lead => 
        lead.id === leadId ? { ...lead, status: newStatus as any } : lead
      ));
      toast.success('Lead status updated');
    } catch (error) {
      toast.error('Failed to update lead status');
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    try {
      setLeads(leads.filter(lead => lead.id !== leadId));
      toast.success('Lead deleted successfully');
    } catch (error) {
      toast.error('Failed to delete lead');
    }
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    const matchesSource = sourceFilter === 'all' || lead.source === sourceFilter;
    const matchesPriority = priorityFilter === 'all' || lead.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesSource && matchesPriority;
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
          <h2 className="text-2xl font-bold text-gray-900">Lead Management</h2>
          <p className="text-gray-600 mt-1">Manage and track your sales leads</p>
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
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Add Lead</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Lead</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={newLead.firstName}
                    onChange={(e) => setNewLead({ ...newLead, firstName: e.target.value })}
                    placeholder="Enter first name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={newLead.lastName}
                    onChange={(e) => setNewLead({ ...newLead, lastName: e.target.value })}
                    placeholder="Enter last name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newLead.email}
                    onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                    placeholder="Enter email address"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={newLead.phone}
                    onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="source">Source</Label>
                  <Select value={newLead.source} onValueChange={(value) => setNewLead({ ...newLead, source: value as any })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="WEBSITE">Website</SelectItem>
                      <SelectItem value="REFERRAL">Referral</SelectItem>
                      <SelectItem value="SOCIAL_MEDIA">Social Media</SelectItem>
                      <SelectItem value="ADVERTISING">Advertising</SelectItem>
                      <SelectItem value="COLD_CALL">Cold Call</SelectItem>
                      <SelectItem value="EVENT">Event</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select value={newLead.type} onValueChange={(value) => setNewLead({ ...newLead, type: value as any })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BUYER">Buyer</SelectItem>
                      <SelectItem value="SELLER">Seller</SelectItem>
                      <SelectItem value="TENANT">Tenant</SelectItem>
                      <SelectItem value="LANDLORD">Landlord</SelectItem>
                      <SelectItem value="INVESTOR">Investor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={newLead.priority} onValueChange={(value) => setNewLead({ ...newLead, priority: value as any })}>
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
                <div className="space-y-2">
                  <Label htmlFor="budget">Budget</Label>
                  <Input
                    id="budget"
                    type="number"
                    value={newLead.budget || ''}
                    onChange={(e) => setNewLead({ ...newLead, budget: parseInt(e.target.value) || undefined })}
                    placeholder="Enter budget"
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="requirements">Requirements</Label>
                  <Textarea
                    id="requirements"
                    value={newLead.requirements || ''}
                    onChange={(e) => setNewLead({ ...newLead, requirements: e.target.value })}
                    placeholder="Enter requirements and preferences"
                    rows={3}
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={newLead.notes}
                    onChange={(e) => setNewLead({ ...newLead, notes: e.target.value })}
                    placeholder="Enter additional notes"
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateLead}>
                  Create Lead
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search leads by name, email, or phone..."
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
                <SelectItem value="NEW">New</SelectItem>
                <SelectItem value="CONTACTED">Contacted</SelectItem>
                <SelectItem value="QUALIFIED">Qualified</SelectItem>
                <SelectItem value="PROPOSAL">Proposal</SelectItem>
                <SelectItem value="NEGOTIATION">Negotiation</SelectItem>
                <SelectItem value="CLOSED_WON">Closed Won</SelectItem>
                <SelectItem value="CLOSED_LOST">Closed Lost</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="WEBSITE">Website</SelectItem>
                <SelectItem value="REFERRAL">Referral</SelectItem>
                <SelectItem value="SOCIAL_MEDIA">Social Media</SelectItem>
                <SelectItem value="ADVERTISING">Advertising</SelectItem>
                <SelectItem value="COLD_CALL">Cold Call</SelectItem>
                <SelectItem value="EVENT">Event</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="URGENT">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Leads Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 font-medium">Lead</th>
                  <th className="text-left py-3 px-4 font-medium">Contact</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-left py-3 px-4 font-medium">Priority</th>
                  <th className="text-left py-3 px-4 font-medium">Score</th>
                  <th className="text-left py-3 px-4 font-medium">Source</th>
                  <th className="text-left py-3 px-4 font-medium">Budget</th>
                  <th className="text-left py-3 px-4 font-medium">Agent</th>
                  <th className="text-left py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{lead.firstName} {lead.lastName}</p>
                          <p className="text-sm text-gray-600">{lead.type}</p>
                          {lead.tags.length > 0 && (
                            <div className="flex space-x-1 mt-1">
                              {lead.tags.slice(0, 2).map((tag, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {lead.tags.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{lead.tags.length - 2}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{lead.email}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{lead.phone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Select
                        value={lead.status}
                        onValueChange={(value) => handleUpdateLeadStatus(lead.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <Badge className={getStatusColor(lead.status)}>
                            <div className="flex items-center space-x-1">
                              {getStatusIcon(lead.status)}
                              <span>{lead.status}</span>
                            </div>
                          </Badge>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="NEW">New</SelectItem>
                          <SelectItem value="CONTACTED">Contacted</SelectItem>
                          <SelectItem value="QUALIFIED">Qualified</SelectItem>
                          <SelectItem value="PROPOSAL">Proposal</SelectItem>
                          <SelectItem value="NEGOTIATION">Negotiation</SelectItem>
                          <SelectItem value="CLOSED_WON">Closed Won</SelectItem>
                          <SelectItem value="CLOSED_LOST">Closed Lost</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={getPriorityColor(lead.priority)}>
                        {lead.priority}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${lead.score}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{lead.score}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline">{lead.source}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium">
                        {lead.budget ? formatCurrency(lead.budget) : 'N/A'}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm">{lead.assignedAgent || 'Unassigned'}</p>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedLead(lead)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl">
                            <DialogHeader>
                              <DialogTitle>
                                {selectedLead?.firstName} {selectedLead?.lastName}
                              </DialogTitle>
                            </DialogHeader>
                            {selectedLead && (
                              <Tabs defaultValue="details" className="w-full">
                                <TabsList>
                                  <TabsTrigger value="details">Details</TabsTrigger>
                                  <TabsTrigger value="activities">Activities</TabsTrigger>
                                  <TabsTrigger value="tasks">Tasks</TabsTrigger>
                                </TabsList>
                                <TabsContent value="details" className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-3">
                                      <div>
                                        <Label className="text-sm font-medium text-gray-600">Contact Information</Label>
                                        <div className="mt-2 space-y-2">
                                          <div className="flex items-center space-x-2">
                                            <Mail className="w-4 h-4 text-gray-400" />
                                            <span>{selectedLead.email}</span>
                                          </div>
                                          <div className="flex items-center space-x-2">
                                            <Phone className="w-4 h-4 text-gray-400" />
                                            <span>{selectedLead.phone}</span>
                                          </div>
                                          {selectedLead.address && (
                                            <div className="flex items-center space-x-2">
                                              <MapPin className="w-4 h-4 text-gray-400" />
                                              <span>{selectedLead.address}</span>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                      <div>
                                        <Label className="text-sm font-medium text-gray-600">Professional Information</Label>
                                        <div className="mt-2 space-y-2">
                                          {selectedLead.company && (
                                            <div className="flex items-center space-x-2">
                                              <Building className="w-4 h-4 text-gray-400" />
                                              <span>{selectedLead.company}</span>
                                            </div>
                                          )}
                                          {selectedLead.jobTitle && (
                                            <div className="flex items-center space-x-2">
                                              <User className="w-4 h-4 text-gray-400" />
                                              <span>{selectedLead.jobTitle}</span>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="space-y-3">
                                      <div>
                                        <Label className="text-sm font-medium text-gray-600">Lead Information</Label>
                                        <div className="mt-2 space-y-2">
                                          <div className="flex items-center justify-between">
                                            <span className="text-sm">Status:</span>
                                            <Badge className={getStatusColor(selectedLead.status)}>
                                              {selectedLead.status}
                                            </Badge>
                                          </div>
                                          <div className="flex items-center justify-between">
                                            <span className="text-sm">Priority:</span>
                                            <Badge className={getPriorityColor(selectedLead.priority)}>
                                              {selectedLead.priority}
                                            </Badge>
                                          </div>
                                          <div className="flex items-center justify-between">
                                            <span className="text-sm">Score:</span>
                                            <span className="font-medium">{selectedLead.score}</span>
                                          </div>
                                          <div className="flex items-center justify-between">
                                            <span className="text-sm">Source:</span>
                                            <Badge variant="outline">{selectedLead.source}</Badge>
                                          </div>
                                          {selectedLead.budget && (
                                            <div className="flex items-center justify-between">
                                              <span className="text-sm">Budget:</span>
                                              <span className="font-medium">{formatCurrency(selectedLead.budget)}</span>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  {selectedLead.requirements && (
                                    <div>
                                      <Label className="text-sm font-medium text-gray-600">Requirements</Label>
                                      <p className="mt-2 text-sm text-gray-800">{selectedLead.requirements}</p>
                                    </div>
                                  )}
                                  {selectedLead.notes && (
                                    <div>
                                      <Label className="text-sm font-medium text-gray-600">Notes</Label>
                                      <p className="mt-2 text-sm text-gray-800">{selectedLead.notes}</p>
                                    </div>
                                  )}
                                  {selectedLead.tags.length > 0 && (
                                    <div>
                                      <Label className="text-sm font-medium text-gray-600">Tags</Label>
                                      <div className="mt-2 flex flex-wrap gap-2">
                                        {selectedLead.tags.map((tag, index) => (
                                          <Badge key={index} variant="outline">
                                            <Tag className="w-3 h-3 mr-1" />
                                            {tag}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </TabsContent>
                                <TabsContent value="activities">
                                  <div className="space-y-4">
                                    {selectedLead.activities.length > 0 ? (
                                      selectedLead.activities.map((activity) => (
                                        <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                                          <div className="p-2 bg-blue-100 rounded-full">
                                            <Activity className="w-4 h-4 text-blue-600" />
                                          </div>
                                          <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                              <h4 className="font-medium">{activity.title}</h4>
                                              <span className="text-sm text-gray-500">{formatDate(activity.date)}</span>
                                            </div>
                                            <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                                            <div className="flex items-center space-x-2 mt-2">
                                              <Badge variant="outline">{activity.type}</Badge>
                                              <span className="text-xs text-gray-500">by {activity.agent}</span>
                                            </div>
                                          </div>
                                        </div>
                                      ))
                                    ) : (
                                      <div className="text-center py-8">
                                        <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                        <p className="text-gray-600">No activities recorded yet</p>
                                      </div>
                                    )}
                                  </div>
                                </TabsContent>
                                <TabsContent value="tasks">
                                  <div className="space-y-4">
                                    {selectedLead.tasks.length > 0 ? (
                                      selectedLead.tasks.map((task) => (
                                        <div key={task.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                                          <div className="p-2 bg-green-100 rounded-full">
                                            <CheckCircle className="w-4 h-4 text-green-600" />
                                          </div>
                                          <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                              <h4 className="font-medium">{task.title}</h4>
                                              <Badge className={getPriorityColor(task.priority)}>
                                                {task.priority}
                                              </Badge>
                                            </div>
                                            <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                                            <div className="flex items-center space-x-2 mt-2">
                                              <Badge variant="outline">{task.type}</Badge>
                                              <Badge variant="outline">{task.status}</Badge>
                                              <span className="text-xs text-gray-500">Due: {formatDate(task.dueDate)}</span>
                                            </div>
                                          </div>
                                        </div>
                                      ))
                                    ) : (
                                      <div className="text-center py-8">
                                        <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                        <p className="text-gray-600">No tasks assigned yet</p>
                                      </div>
                                    )}
                                  </div>
                                </TabsContent>
                              </Tabs>
                            )}
                          </DialogContent>
                        </Dialog>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteLead(lead.id)}
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

      {filteredLeads.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <UserPlus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No leads found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter !== 'all' || sourceFilter !== 'all' || priorityFilter !== 'all'
                ? 'No leads match your current filters. Try adjusting your search criteria.'
                : 'Get started by creating your first lead.'}
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Lead
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LeadManagement;