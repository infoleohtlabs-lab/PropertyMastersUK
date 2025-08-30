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
  Users,
  UserPlus,
  Search,
  Filter,
  Edit,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Building,
  Star,
  Tag,
  Eye,
  MessageSquare,
  FileText,
  Clock,
  Activity,
  Download,
  Upload,
  Plus,
  MoreHorizontal,
  Heart,
  Home,
  Briefcase,
  Globe,
  Linkedin,
  Facebook,
  Twitter,
  Instagram,
  CheckCircle,
  AlertCircle,
  XCircle,
  User,
  Settings,
  History,
  TrendingUp,
  Target,
  Banknote,
  BarChart3,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '../../utils';

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  mobile?: string;
  company?: string;
  jobTitle?: string;
  website?: string;
  address: {
    street: string;
    city: string;
    county: string;
    postcode: string;
    country: string;
  };
  type: 'BUYER' | 'SELLER' | 'LANDLORD' | 'TENANT' | 'INVESTOR' | 'AGENT' | 'VENDOR' | 'OTHER';
  status: 'ACTIVE' | 'INACTIVE' | 'PROSPECT' | 'QUALIFIED' | 'CONVERTED' | 'LOST';
  source: 'WEBSITE' | 'REFERRAL' | 'SOCIAL_MEDIA' | 'ADVERTISING' | 'COLD_CALL' | 'EVENT' | 'PARTNER' | 'OTHER';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  rating: number; // 1-5 stars
  tags: string[];
  notes: string;
  preferences: {
    propertyTypes: string[];
    priceRange: {
      min: number;
      max: number;
    };
    locations: string[];
    bedrooms?: number;
    bathrooms?: number;
    features: string[];
    communicationPreference: 'EMAIL' | 'PHONE' | 'SMS' | 'WHATSAPP';
    contactTimes: string[];
  };
  socialMedia: {
    linkedin?: string;
    facebook?: string;
    twitter?: string;
    instagram?: string;
  };
  customFields: Record<string, any>;
  assignedAgent?: string;
  lastContact?: string;
  nextFollowUp?: string;
  totalDeals: number;
  totalValue: number;
  avgDealValue: number;
  conversionRate: number;
  lifetimeValue: number;
  activities: {
    id: string;
    type: 'CALL' | 'EMAIL' | 'MEETING' | 'PROPERTY_VIEW' | 'OFFER' | 'CONTRACT' | 'NOTE';
    description: string;
    date: string;
    outcome?: string;
  }[];
  properties: {
    id: string;
    title: string;
    type: 'INTERESTED' | 'VIEWED' | 'OFFERED' | 'PURCHASED' | 'RENTED';
    date: string;
  }[];
  documents: {
    id: string;
    name: string;
    type: string;
    url: string;
    uploadDate: string;
  }[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  lastModifiedBy: string;
}

const ContactManagement: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [newContact, setNewContact] = useState<Partial<Contact>>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    mobile: '',
    company: '',
    jobTitle: '',
    website: '',
    address: {
      street: '',
      city: '',
      county: '',
      postcode: '',
      country: 'United Kingdom',
    },
    type: 'BUYER',
    status: 'PROSPECT',
    source: 'WEBSITE',
    priority: 'MEDIUM',
    rating: 3,
    tags: [],
    notes: '',
    preferences: {
      propertyTypes: [],
      priceRange: {
        min: 0,
        max: 1000000,
      },
      locations: [],
      features: [],
      communicationPreference: 'EMAIL',
      contactTimes: [],
    },
    socialMedia: {},
    customFields: {},
  });

  // Mock data - replace with actual API calls
  useEffect(() => {
    const fetchContacts = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockContacts: Contact[] = [
          {
            id: '1',
            firstName: 'John',
            lastName: 'Smith',
            email: 'john.smith@email.com',
            phone: '+44 20 7123 4567',
            mobile: '+44 7700 123456',
            company: 'Smith Investments Ltd',
            jobTitle: 'Investment Director',
            website: 'https://smithinvestments.co.uk',
            address: {
              street: '123 High Street',
              city: 'London',
              county: 'Greater London',
              postcode: 'SW1A 1AA',
              country: 'United Kingdom',
            },
            type: 'INVESTOR',
            status: 'ACTIVE',
            source: 'REFERRAL',
            priority: 'HIGH',
            rating: 5,
            tags: ['vip', 'investor', 'london'],
            notes: 'High-value investor looking for commercial properties in Central London. Prefers modern office buildings.',
            preferences: {
              propertyTypes: ['Commercial', 'Office'],
              priceRange: {
                min: 500000,
                max: 5000000,
              },
              locations: ['Central London', 'Canary Wharf'],
              features: ['Parking', 'Modern', 'Air Conditioning'],
              communicationPreference: 'EMAIL',
              contactTimes: ['9:00-17:00'],
            },
            socialMedia: {
              linkedin: 'https://linkedin.com/in/johnsmith',
              twitter: 'https://twitter.com/johnsmith',
            },
            customFields: {
              investmentBudget: '£2M-5M',
              preferredROI: '8-12%',
            },
            assignedAgent: 'Sarah Johnson',
            lastContact: '2024-01-15T14:30:00Z',
            nextFollowUp: '2024-01-22T10:00:00Z',
            totalDeals: 3,
            totalValue: 4500000,
            avgDealValue: 1500000,
            conversionRate: 75,
            lifetimeValue: 4500000,
            activities: [
              {
                id: '1',
                type: 'MEETING',
                description: 'Initial consultation meeting',
                date: '2024-01-15T14:30:00Z',
                outcome: 'Interested in commercial properties',
              },
              {
                id: '2',
                type: 'EMAIL',
                description: 'Sent property portfolio',
                date: '2024-01-16T09:00:00Z',
              },
            ],
            properties: [
              {
                id: '1',
                title: 'Modern Office Building - Canary Wharf',
                type: 'INTERESTED',
                date: '2024-01-16T10:00:00Z',
              },
            ],
            documents: [
              {
                id: '1',
                name: 'Investment Portfolio.pdf',
                type: 'PDF',
                url: '/documents/investment-portfolio.pdf',
                uploadDate: '2024-01-10T12:00:00Z',
              },
            ],
            createdAt: '2024-01-01T10:00:00Z',
            updatedAt: '2024-01-16T15:30:00Z',
            createdBy: 'Sarah Johnson',
            lastModifiedBy: 'Mike Davis',
          },
          {
            id: '2',
            firstName: 'Emma',
            lastName: 'Wilson',
            email: 'emma.wilson@email.com',
            phone: '+44 161 123 4567',
            mobile: '+44 7700 234567',
            company: '',
            jobTitle: '',
            website: '',
            address: {
              street: '45 Oak Avenue',
              city: 'Manchester',
              county: 'Greater Manchester',
              postcode: 'M1 2AB',
              country: 'United Kingdom',
            },
            type: 'BUYER',
            status: 'QUALIFIED',
            source: 'WEBSITE',
            priority: 'MEDIUM',
            rating: 4,
            tags: ['first-time-buyer', 'manchester'],
            notes: 'First-time buyer looking for a family home in Manchester suburbs. Budget around £300k.',
            preferences: {
              propertyTypes: ['House', 'Terraced'],
              priceRange: {
                min: 250000,
                max: 350000,
              },
              locations: ['Manchester', 'Stockport', 'Altrincham'],
              bedrooms: 3,
              bathrooms: 2,
              features: ['Garden', 'Parking', 'Good Schools'],
              communicationPreference: 'PHONE',
              contactTimes: ['18:00-20:00'],
            },
            socialMedia: {
              facebook: 'https://facebook.com/emmawilson',
            },
            customFields: {
              mortgagePreApproved: 'Yes',
              moveInDate: '2024-06-01',
            },
            assignedAgent: 'Tom Brown',
            lastContact: '2024-01-14T16:00:00Z',
            nextFollowUp: '2024-01-20T14:00:00Z',
            totalDeals: 0,
            totalValue: 0,
            avgDealValue: 0,
            conversionRate: 0,
            lifetimeValue: 0,
            activities: [
              {
                id: '1',
                type: 'CALL',
                description: 'Initial inquiry call',
                date: '2024-01-14T16:00:00Z',
                outcome: 'Scheduled property viewing',
              },
            ],
            properties: [
              {
                id: '2',
                title: '3-Bed Terraced House - Didsbury',
                type: 'VIEWED',
                date: '2024-01-15T11:00:00Z',
              },
            ],
            documents: [],
            createdAt: '2024-01-10T14:00:00Z',
            updatedAt: '2024-01-14T16:30:00Z',
            createdBy: 'Tom Brown',
            lastModifiedBy: 'Tom Brown',
          },
          {
            id: '3',
            firstName: 'David',
            lastName: 'Johnson',
            email: 'david.johnson@email.com',
            phone: '+44 113 123 4567',
            mobile: '+44 7700 345678',
            company: 'Johnson Properties',
            jobTitle: 'Property Developer',
            website: 'https://johnsonproperties.co.uk',
            address: {
              street: '78 Victoria Road',
              city: 'Leeds',
              county: 'West Yorkshire',
              postcode: 'LS1 3CD',
              country: 'United Kingdom',
            },
            type: 'LANDLORD',
            status: 'ACTIVE',
            source: 'PARTNER',
            priority: 'HIGH',
            rating: 5,
            tags: ['landlord', 'developer', 'portfolio'],
            notes: 'Experienced landlord with 15+ properties. Looking to expand portfolio with buy-to-let investments.',
            preferences: {
              propertyTypes: ['Apartment', 'House'],
              priceRange: {
                min: 150000,
                max: 400000,
              },
              locations: ['Leeds', 'Bradford', 'Wakefield'],
              features: ['High Yield', 'Good Transport Links'],
              communicationPreference: 'EMAIL',
              contactTimes: ['9:00-18:00'],
            },
            socialMedia: {
              linkedin: 'https://linkedin.com/in/davidjohnson',
            },
            customFields: {
              portfolioSize: '15 properties',
              targetYield: '6-8%',
            },
            assignedAgent: 'Lisa Chen',
            lastContact: '2024-01-12T11:00:00Z',
            nextFollowUp: '2024-01-25T15:00:00Z',
            totalDeals: 8,
            totalValue: 2400000,
            avgDealValue: 300000,
            conversionRate: 80,
            lifetimeValue: 2400000,
            activities: [
              {
                id: '1',
                type: 'PROPERTY_VIEW',
                description: 'Viewed 2-bed apartment in Leeds city centre',
                date: '2024-01-12T11:00:00Z',
                outcome: 'Interested, requested rental yield analysis',
              },
            ],
            properties: [
              {
                id: '3',
                title: '2-Bed Apartment - Leeds City Centre',
                type: 'INTERESTED',
                date: '2024-01-12T11:00:00Z',
              },
            ],
            documents: [
              {
                id: '2',
                name: 'Portfolio Analysis.xlsx',
                type: 'Excel',
                url: '/documents/portfolio-analysis.xlsx',
                uploadDate: '2024-01-05T10:00:00Z',
              },
            ],
            createdAt: '2023-12-15T09:00:00Z',
            updatedAt: '2024-01-12T12:00:00Z',
            createdBy: 'Lisa Chen',
            lastModifiedBy: 'Lisa Chen',
          },
        ];
        
        setContacts(mockContacts);
      } catch (error) {
        toast.error('Failed to load contacts');
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, []);

  const getTypeColor = (type: string) => {
    const colors = {
      BUYER: 'bg-blue-100 text-blue-800',
      SELLER: 'bg-green-100 text-green-800',
      LANDLORD: 'bg-purple-100 text-purple-800',
      TENANT: 'bg-yellow-100 text-yellow-800',
      INVESTOR: 'bg-red-100 text-red-800',
      AGENT: 'bg-gray-100 text-gray-800',
      VENDOR: 'bg-orange-100 text-orange-800',
      OTHER: 'bg-gray-100 text-gray-800',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      ACTIVE: 'bg-green-100 text-green-800',
      INACTIVE: 'bg-gray-100 text-gray-800',
      PROSPECT: 'bg-blue-100 text-blue-800',
      QUALIFIED: 'bg-yellow-100 text-yellow-800',
      CONVERTED: 'bg-green-100 text-green-800',
      LOST: 'bg-red-100 text-red-800',
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
      ACTIVE: <CheckCircle className="w-4 h-4" />,
      INACTIVE: <XCircle className="w-4 h-4" />,
      PROSPECT: <User className="w-4 h-4" />,
      QUALIFIED: <Target className="w-4 h-4" />,
      CONVERTED: <CheckCircle className="w-4 h-4" />,
      LOST: <AlertCircle className="w-4 h-4" />,
    };
    return icons[status as keyof typeof icons] || <User className="w-4 h-4" />;
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

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const handleCreateContact = async () => {
    try {
      // Simulate API call
      const contactData = {
        ...newContact,
        id: Date.now().toString(),
        totalDeals: 0,
        totalValue: 0,
        avgDealValue: 0,
        conversionRate: 0,
        lifetimeValue: 0,
        activities: [],
        properties: [],
        documents: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'Current User',
        lastModifiedBy: 'Current User',
      };
      
      setContacts([...contacts, contactData as Contact]);
      setNewContact({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        mobile: '',
        company: '',
        jobTitle: '',
        website: '',
        address: {
          street: '',
          city: '',
          county: '',
          postcode: '',
          country: 'United Kingdom',
        },
        type: 'BUYER',
        status: 'PROSPECT',
        source: 'WEBSITE',
        priority: 'MEDIUM',
        rating: 3,
        tags: [],
        notes: '',
        preferences: {
          propertyTypes: [],
          priceRange: {
            min: 0,
            max: 1000000,
          },
          locations: [],
          features: [],
          communicationPreference: 'EMAIL',
          contactTimes: [],
        },
        socialMedia: {},
        customFields: {},
      });
      setIsCreateDialogOpen(false);
      toast.success('Contact created successfully');
    } catch (error) {
      toast.error('Failed to create contact');
    }
  };

  const handleUpdateContactStatus = async (contactId: string, newStatus: string) => {
    try {
      setContacts(contacts.map(contact => 
        contact.id === contactId ? { ...contact, status: newStatus as any } : contact
      ));
      toast.success(`Contact status updated to ${newStatus.toLowerCase()}`);
    } catch (error) {
      toast.error('Failed to update contact status');
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    try {
      setContacts(contacts.filter(contact => contact.id !== contactId));
      toast.success('Contact deleted successfully');
    } catch (error) {
      toast.error('Failed to delete contact');
    }
  };

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = 
      contact.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.phone.includes(searchTerm);
    
    const matchesType = typeFilter === 'all' || contact.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || contact.status === statusFilter;
    const matchesSource = sourceFilter === 'all' || contact.source === sourceFilter;
    const matchesPriority = priorityFilter === 'all' || contact.priority === priorityFilter;
    
    return matchesSearch && matchesType && matchesStatus && matchesSource && matchesPriority;
  });

  const sortedContacts = [...filteredContacts].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'name':
        aValue = `${a.firstName} ${a.lastName}`.toLowerCase();
        bValue = `${b.firstName} ${b.lastName}`.toLowerCase();
        break;
      case 'company':
        aValue = (a.company || '').toLowerCase();
        bValue = (b.company || '').toLowerCase();
        break;
      case 'lastContact':
        aValue = new Date(a.lastContact || 0).getTime();
        bValue = new Date(b.lastContact || 0).getTime();
        break;
      case 'value':
        aValue = a.lifetimeValue;
        bValue = b.lifetimeValue;
        break;
      case 'rating':
        aValue = a.rating;
        bValue = b.rating;
        break;
      default:
        aValue = a.createdAt;
        bValue = b.createdAt;
    }
    
    if (sortOrder === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
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
          <h2 className="text-2xl font-bold text-gray-900">Contact Management</h2>
          <p className="text-gray-600 mt-1">Manage your CRM contacts and relationships</p>
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
                <UserPlus className="w-4 h-4" />
                <span>Add Contact</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Add New Contact</DialogTitle>
              </DialogHeader>
              <Tabs defaultValue="basic" className="w-full">
                <TabsList>
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="address">Address</TabsTrigger>
                  <TabsTrigger value="preferences">Preferences</TabsTrigger>
                  <TabsTrigger value="social">Social & Custom</TabsTrigger>
                </TabsList>
                <TabsContent value="basic" className="space-y-6">
                  {/* Personal Information */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <User className="h-5 w-5 mr-2 text-blue-600" />
                      Personal Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="form-group">
                        <Label htmlFor="firstName" className="text-sm font-medium text-gray-700 flex items-center">
                          <User className="h-4 w-4 mr-2 text-gray-500" />
                          First Name *
                        </Label>
                        <Input
                          id="firstName"
                          value={newContact.firstName}
                          onChange={(e) => setNewContact({ ...newContact, firstName: e.target.value })}
                          placeholder="Enter first name"
                          required
                          className="input-field mt-2 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400"
                        />
                      </div>
                      <div className="form-group">
                        <Label htmlFor="lastName" className="text-sm font-medium text-gray-700 flex items-center">
                          <User className="h-4 w-4 mr-2 text-gray-500" />
                          Last Name *
                        </Label>
                        <Input
                          id="lastName"
                          value={newContact.lastName}
                          onChange={(e) => setNewContact({ ...newContact, lastName: e.target.value })}
                          placeholder="Enter last name"
                          required
                          className="input-field mt-2 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Phone className="h-5 w-5 mr-2 text-green-600" />
                      Contact Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="form-group">
                        <Label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center">
                          <Mail className="h-4 w-4 mr-2 text-gray-500" />
                          Email *
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={newContact.email}
                          onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                          placeholder="Enter email address"
                          required
                          className="input-field mt-2 transition-all duration-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 hover:border-gray-400"
                        />
                      </div>
                      <div className="form-group">
                        <Label htmlFor="phone" className="text-sm font-medium text-gray-700 flex items-center">
                          <Phone className="h-4 w-4 mr-2 text-gray-500" />
                          Phone *
                        </Label>
                        <Input
                          id="phone"
                          value={newContact.phone}
                          onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                          placeholder="Enter phone number"
                          required
                          className="input-field mt-2 transition-all duration-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 hover:border-gray-400"
                        />
                      </div>
                      <div className="form-group">
                        <Label htmlFor="mobile" className="text-sm font-medium text-gray-700 flex items-center">
                          <Phone className="h-4 w-4 mr-2 text-gray-500" />
                          Mobile
                        </Label>
                        <Input
                          id="mobile"
                          value={newContact.mobile}
                          onChange={(e) => setNewContact({ ...newContact, mobile: e.target.value })}
                          placeholder="Enter mobile number"
                          className="input-field mt-2 transition-all duration-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 hover:border-gray-400"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Professional Information */}
                  <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-6 rounded-lg border border-purple-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Briefcase className="h-5 w-5 mr-2 text-purple-600" />
                      Professional Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="form-group">
                        <Label htmlFor="company" className="text-sm font-medium text-gray-700 flex items-center">
                          <Building className="h-4 w-4 mr-2 text-gray-500" />
                          Company
                        </Label>
                        <Input
                          id="company"
                          value={newContact.company}
                          onChange={(e) => setNewContact({ ...newContact, company: e.target.value })}
                          placeholder="Enter company name"
                          className="input-field mt-2 transition-all duration-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 hover:border-gray-400"
                        />
                      </div>
                      <div className="form-group">
                        <Label htmlFor="jobTitle" className="text-sm font-medium text-gray-700 flex items-center">
                          <Briefcase className="h-4 w-4 mr-2 text-gray-500" />
                          Job Title
                        </Label>
                        <Input
                          id="jobTitle"
                          value={newContact.jobTitle}
                          onChange={(e) => setNewContact({ ...newContact, jobTitle: e.target.value })}
                          placeholder="Enter job title"
                          className="input-field mt-2 transition-all duration-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 hover:border-gray-400"
                        />
                      </div>
                      <div className="form-group md:col-span-2">
                        <Label htmlFor="website" className="text-sm font-medium text-gray-700 flex items-center">
                          <Globe className="h-4 w-4 mr-2 text-gray-500" />
                          Website
                        </Label>
                        <Input
                          id="website"
                          value={newContact.website}
                          onChange={(e) => setNewContact({ ...newContact, website: e.target.value })}
                          placeholder="Enter website URL"
                          className="input-field mt-2 transition-all duration-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 hover:border-gray-400"
                        />
                      </div>
                    </div>
                  </div>
                  {/* Contact Classification */}
                  <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-6 rounded-lg border border-orange-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Tag className="h-5 w-5 mr-2 text-orange-600" />
                      Contact Classification
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="form-group">
                        <Label htmlFor="type" className="text-sm font-medium text-gray-700 flex items-center">
                          <User className="h-4 w-4 mr-2 text-gray-500" />
                          Contact Type
                        </Label>
                        <Select value={newContact.type} onValueChange={(value) => setNewContact({ ...newContact, type: value as any })}>
                          <SelectTrigger className="mt-2 transition-all duration-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 hover:border-gray-400">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="BUYER">Buyer</SelectItem>
                            <SelectItem value="SELLER">Seller</SelectItem>
                            <SelectItem value="LANDLORD">Landlord</SelectItem>
                            <SelectItem value="TENANT">Tenant</SelectItem>
                            <SelectItem value="INVESTOR">Investor</SelectItem>
                            <SelectItem value="AGENT">Agent</SelectItem>
                            <SelectItem value="VENDOR">Vendor</SelectItem>
                            <SelectItem value="OTHER">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="form-group">
                        <Label htmlFor="status" className="text-sm font-medium text-gray-700 flex items-center">
                          <Activity className="h-4 w-4 mr-2 text-gray-500" />
                          Status
                        </Label>
                        <Select value={newContact.status} onValueChange={(value) => setNewContact({ ...newContact, status: value as any })}>
                          <SelectTrigger className="mt-2 transition-all duration-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 hover:border-gray-400">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PROSPECT">Prospect</SelectItem>
                            <SelectItem value="QUALIFIED">Qualified</SelectItem>
                            <SelectItem value="ACTIVE">Active</SelectItem>
                            <SelectItem value="CONVERTED">Converted</SelectItem>
                            <SelectItem value="INACTIVE">Inactive</SelectItem>
                            <SelectItem value="LOST">Lost</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="form-group">
                        <Label htmlFor="source" className="text-sm font-medium text-gray-700 flex items-center">
                          <Target className="h-4 w-4 mr-2 text-gray-500" />
                          Source
                        </Label>
                        <Select value={newContact.source} onValueChange={(value) => setNewContact({ ...newContact, source: value as any })}>
                          <SelectTrigger className="mt-2 transition-all duration-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 hover:border-gray-400">
                            <SelectValue placeholder="Select source" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="WEBSITE">Website</SelectItem>
                            <SelectItem value="REFERRAL">Referral</SelectItem>
                            <SelectItem value="SOCIAL_MEDIA">Social Media</SelectItem>
                            <SelectItem value="ADVERTISING">Advertising</SelectItem>
                            <SelectItem value="COLD_CALL">Cold Call</SelectItem>
                            <SelectItem value="EVENT">Event</SelectItem>
                            <SelectItem value="PARTNER">Partner</SelectItem>
                            <SelectItem value="OTHER">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="form-group">
                        <Label htmlFor="priority" className="text-sm font-medium text-gray-700 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-2 text-gray-500" />
                          Priority
                        </Label>
                        <Select value={newContact.priority} onValueChange={(value) => setNewContact({ ...newContact, priority: value as any })}>
                          <SelectTrigger className="mt-2 transition-all duration-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 hover:border-gray-400">
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
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-6 rounded-lg border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-gray-600" />
                      Notes
                    </h3>
                    <div className="form-group">
                      <Label htmlFor="notes" className="text-sm font-medium text-gray-700 flex items-center">
                        <Edit className="h-4 w-4 mr-2 text-gray-500" />
                        Additional Information
                      </Label>
                      <Textarea
                        id="notes"
                        value={newContact.notes}
                        onChange={(e) => setNewContact({ ...newContact, notes: e.target.value })}
                        placeholder="Enter notes about this contact, their preferences, or any important details..."
                        rows={4}
                        className="mt-2 transition-all duration-200 focus:ring-2 focus:ring-gray-500 focus:border-gray-500 hover:border-gray-400 resize-none"
                      />
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="address" className="space-y-6">
                  {/* Address Information */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                      Address Information
                    </h3>
                    <div className="space-y-6">
                      <div className="form-group">
                        <Label htmlFor="street" className="text-sm font-medium text-gray-700 flex items-center">
                          <Home className="h-4 w-4 mr-2 text-gray-500" />
                          Street Address
                        </Label>
                        <Input
                          id="street"
                          value={newContact.address?.street}
                          onChange={(e) => setNewContact({
                            ...newContact,
                            address: { ...newContact.address!, street: e.target.value },
                          })}
                          placeholder="Enter full street address"
                          className="mt-2 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="form-group">
                          <Label htmlFor="city" className="text-sm font-medium text-gray-700 flex items-center">
                            <Building className="h-4 w-4 mr-2 text-gray-500" />
                            City
                          </Label>
                          <Input
                            id="city"
                            value={newContact.address?.city}
                            onChange={(e) => setNewContact({
                              ...newContact,
                              address: { ...newContact.address!, city: e.target.value },
                            })}
                            placeholder="Enter city"
                            className="mt-2 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400"
                          />
                        </div>
                        <div className="form-group">
                          <Label htmlFor="county" className="text-sm font-medium text-gray-700 flex items-center">
                            <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                            County
                          </Label>
                          <Input
                            id="county"
                            value={newContact.address?.county}
                            onChange={(e) => setNewContact({
                              ...newContact,
                              address: { ...newContact.address!, county: e.target.value },
                            })}
                            placeholder="Enter county"
                            className="mt-2 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400"
                          />
                        </div>
                        <div className="form-group">
                          <Label htmlFor="postcode" className="text-sm font-medium text-gray-700 flex items-center">
                            <Tag className="h-4 w-4 mr-2 text-gray-500" />
                            Postcode
                          </Label>
                          <Input
                            id="postcode"
                            value={newContact.address?.postcode}
                            onChange={(e) => setNewContact({
                              ...newContact,
                              address: { ...newContact.address!, postcode: e.target.value },
                            })}
                            placeholder="Enter postcode"
                            className="mt-2 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400"
                          />
                        </div>
                        <div className="form-group">
                          <Label htmlFor="country" className="text-sm font-medium text-gray-700 flex items-center">
                            <Globe className="h-4 w-4 mr-2 text-gray-500" />
                            Country
                          </Label>
                          <Select
                            value={newContact.address?.country}
                            onValueChange={(value) => setNewContact({
                              ...newContact,
                              address: { ...newContact.address!, country: value },
                            })}
                          >
                            <SelectTrigger className="mt-2 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400">
                              <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                              <SelectItem value="Ireland">Ireland</SelectItem>
                              <SelectItem value="United States">United States</SelectItem>
                              <SelectItem value="Canada">Canada</SelectItem>
                              <SelectItem value="Australia">Australia</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="preferences" className="space-y-6">
                  {/* Property Preferences */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Home className="h-5 w-5 mr-2 text-green-600" />
                      Property Preferences
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="form-group">
                        <Label className="text-sm font-medium text-gray-700 flex items-center">
                          <Banknote className="h-4 w-4 mr-2 text-gray-500" />
                          Price Range
                        </Label>
                        <div className="flex space-x-3 mt-2">
                          <Input
                            type="number"
                            placeholder="Min price"
                            value={newContact.preferences?.priceRange.min}
                            onChange={(e) => setNewContact({
                              ...newContact,
                              preferences: {
                                ...newContact.preferences!,
                                priceRange: {
                                  ...newContact.preferences!.priceRange,
                                  min: parseInt(e.target.value) || 0,
                                },
                              },
                            })}
                            className="transition-all duration-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 hover:border-gray-400"
                          />
                          <Input
                            type="number"
                            placeholder="Max price"
                            value={newContact.preferences?.priceRange.max}
                            onChange={(e) => setNewContact({
                              ...newContact,
                              preferences: {
                                ...newContact.preferences!,
                                priceRange: {
                                  ...newContact.preferences!.priceRange,
                                  max: parseInt(e.target.value) || 0,
                                },
                              },
                            })}
                            className="transition-all duration-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 hover:border-gray-400"
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <Label htmlFor="communicationPreference" className="text-sm font-medium text-gray-700 flex items-center">
                          <MessageSquare className="h-4 w-4 mr-2 text-gray-500" />
                          Communication Preference
                        </Label>
                        <Select
                          value={newContact.preferences?.communicationPreference}
                          onValueChange={(value) => setNewContact({
                            ...newContact,
                            preferences: {
                              ...newContact.preferences!,
                              communicationPreference: value as any,
                            },
                          })}
                        >
                          <SelectTrigger className="mt-2 transition-all duration-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 hover:border-gray-400">
                            <SelectValue placeholder="Select preference" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="EMAIL">Email</SelectItem>
                            <SelectItem value="PHONE">Phone</SelectItem>
                            <SelectItem value="SMS">SMS</SelectItem>
                            <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="form-group">
                        <Label htmlFor="bedrooms" className="text-sm font-medium text-gray-700 flex items-center">
                          <Home className="h-4 w-4 mr-2 text-gray-500" />
                          Bedrooms
                        </Label>
                        <Input
                          id="bedrooms"
                          type="number"
                          value={newContact.preferences?.bedrooms}
                          onChange={(e) => setNewContact({
                            ...newContact,
                            preferences: {
                              ...newContact.preferences!,
                              bedrooms: parseInt(e.target.value) || undefined,
                            },
                          })}
                          placeholder="Number of bedrooms"
                          className="mt-2 transition-all duration-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 hover:border-gray-400"
                        />
                      </div>
                      <div className="form-group">
                        <Label htmlFor="bathrooms" className="text-sm font-medium text-gray-700 flex items-center">
                          <Home className="h-4 w-4 mr-2 text-gray-500" />
                          Bathrooms
                        </Label>
                        <Input
                          id="bathrooms"
                          type="number"
                          value={newContact.preferences?.bathrooms}
                          onChange={(e) => setNewContact({
                            ...newContact,
                            preferences: {
                              ...newContact.preferences!,
                              bathrooms: parseInt(e.target.value) || undefined,
                            },
                          })}
                          placeholder="Number of bathrooms"
                          className="mt-2 transition-all duration-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 hover:border-gray-400"
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="social" className="space-y-6">
                  {/* Social Media */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <MessageSquare className="h-5 w-5 mr-2 text-purple-600" />
                      Social Media Profiles
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="form-group">
                        <Label htmlFor="linkedin" className="text-sm font-medium text-gray-700 flex items-center">
                          <Linkedin className="h-4 w-4 mr-2 text-blue-600" />
                          LinkedIn
                        </Label>
                        <Input
                          id="linkedin"
                          value={newContact.socialMedia?.linkedin}
                          onChange={(e) => setNewContact({
                            ...newContact,
                            socialMedia: {
                              ...newContact.socialMedia!,
                              linkedin: e.target.value,
                            },
                          })}
                          placeholder="https://linkedin.com/in/username"
                          className="mt-2 transition-all duration-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 hover:border-gray-400"
                        />
                      </div>
                      <div className="form-group">
                        <Label htmlFor="facebook" className="text-sm font-medium text-gray-700 flex items-center">
                          <Facebook className="h-4 w-4 mr-2 text-blue-700" />
                          Facebook
                        </Label>
                        <Input
                          id="facebook"
                          value={newContact.socialMedia?.facebook}
                          onChange={(e) => setNewContact({
                            ...newContact,
                            socialMedia: {
                              ...newContact.socialMedia!,
                              facebook: e.target.value,
                            },
                          })}
                          placeholder="https://facebook.com/username"
                          className="mt-2 transition-all duration-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 hover:border-gray-400"
                        />
                      </div>
                      <div className="form-group">
                        <Label htmlFor="twitter" className="text-sm font-medium text-gray-700 flex items-center">
                          <Twitter className="h-4 w-4 mr-2 text-blue-400" />
                          Twitter
                        </Label>
                        <Input
                          id="twitter"
                          value={newContact.socialMedia?.twitter}
                          onChange={(e) => setNewContact({
                            ...newContact,
                            socialMedia: {
                              ...newContact.socialMedia!,
                              twitter: e.target.value,
                            },
                          })}
                          placeholder="https://twitter.com/username"
                          className="mt-2 transition-all duration-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 hover:border-gray-400"
                        />
                      </div>
                      <div className="form-group">
                        <Label htmlFor="instagram" className="text-sm font-medium text-gray-700 flex items-center">
                          <Instagram className="h-4 w-4 mr-2 text-pink-600" />
                          Instagram
                        </Label>
                        <Input
                          id="instagram"
                          value={newContact.socialMedia?.instagram}
                          onChange={(e) => setNewContact({
                            ...newContact,
                            socialMedia: {
                              ...newContact.socialMedia!,
                              instagram: e.target.value,
                            },
                          })}
                          placeholder="https://instagram.com/username"
                          className="mt-2 transition-all duration-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 hover:border-gray-400"
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsCreateDialogOpen(false)}
                  className="btn-secondary flex items-center px-6 py-3 text-sm font-medium"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateContact}
                  className="btn-primary flex items-center px-6 py-3 text-sm font-medium"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create Contact
                </button>
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
                <p className="text-sm font-medium text-gray-600">Total Contacts</p>
                <p className="text-2xl font-bold text-gray-900">{contacts.length}</p>
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
                <p className="text-sm font-medium text-gray-600">Active Contacts</p>
                <p className="text-2xl font-bold text-gray-900">
                  {contacts.filter(c => c.status === 'ACTIVE').length}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(contacts.reduce((sum, c) => sum + c.lifetimeValue, 0))}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Banknote className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Conversion</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatPercentage(
                    contacts.reduce((sum, c) => sum + c.conversionRate, 0) / contacts.length || 0
                  )}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <TrendingUp className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search contacts by name, email, company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="BUYER">Buyer</SelectItem>
                  <SelectItem value="SELLER">Seller</SelectItem>
                  <SelectItem value="LANDLORD">Landlord</SelectItem>
                  <SelectItem value="TENANT">Tenant</SelectItem>
                  <SelectItem value="INVESTOR">Investor</SelectItem>
                  <SelectItem value="AGENT">Agent</SelectItem>
                  <SelectItem value="VENDOR">Vendor</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="PROSPECT">Prospect</SelectItem>
                  <SelectItem value="QUALIFIED">Qualified</SelectItem>
                  <SelectItem value="CONVERTED">Converted</SelectItem>
                  <SelectItem value="LOST">Lost</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="URGENT">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="company">Company</SelectItem>
                  <SelectItem value="lastContact">Last Contact</SelectItem>
                  <SelectItem value="value">Lifetime Value</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                  <SelectItem value="created">Created Date</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contacts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedContacts.map((contact) => (
          <Card key={contact.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge className={getTypeColor(contact.type)}>
                      {contact.type}
                    </Badge>
                    <Badge className={getStatusColor(contact.status)}>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(contact.status)}
                        <span>{contact.status}</span>
                      </div>
                    </Badge>
                    <Badge className={getPriorityColor(contact.priority)}>
                      {contact.priority}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">
                    {contact.firstName} {contact.lastName}
                  </CardTitle>
                  {contact.company && (
                    <p className="text-sm text-gray-600">{contact.company}</p>
                  )}
                  {contact.jobTitle && (
                    <p className="text-xs text-gray-500">{contact.jobTitle}</p>
                  )}
                </div>
                <div className="flex items-center space-x-1">
                  {renderStars(contact.rating)}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="truncate" title={contact.email}>
                    {contact.email}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span>{contact.phone}</span>
                </div>
                {contact.address.city && (
                  <div className="flex items-center space-x-2 text-sm">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span>
                      {contact.address.city}, {contact.address.county}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Total Deals:</span>
                  <span className="font-medium">{contact.totalDeals}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Lifetime Value:</span>
                  <span className="font-medium">{formatCurrency(contact.lifetimeValue)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Conversion Rate:</span>
                  <span className="font-medium">{formatPercentage(contact.conversionRate)}</span>
                </div>
              </div>

              {contact.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {contact.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                  {contact.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{contact.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}

              <div className="text-xs text-gray-500">
                {contact.lastContact && (
                  <p>Last contact: {formatDate(contact.lastContact)}</p>
                )}
                {contact.nextFollowUp && (
                  <p>Next follow-up: {formatDate(contact.nextFollowUp)}</p>
                )}
                <p>Created: {formatDate(contact.createdAt)}</p>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setSelectedContact(contact)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl">
                    <DialogHeader>
                      <DialogTitle>
                        {selectedContact?.firstName} {selectedContact?.lastName}
                      </DialogTitle>
                    </DialogHeader>
                    {selectedContact && (
                      <Tabs defaultValue="overview" className="w-full">
                        <TabsList>
                          <TabsTrigger value="overview">Overview</TabsTrigger>
                          <TabsTrigger value="activities">Activities</TabsTrigger>
                          <TabsTrigger value="properties">Properties</TabsTrigger>
                          <TabsTrigger value="documents">Documents</TabsTrigger>
                        </TabsList>
                        <TabsContent value="overview" className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-gray-600">Contact Information</Label>
                              <div className="space-y-1 text-sm">
                                <p><strong>Email:</strong> {selectedContact.email}</p>
                                <p><strong>Phone:</strong> {selectedContact.phone}</p>
                                {selectedContact.mobile && (
                                  <p><strong>Mobile:</strong> {selectedContact.mobile}</p>
                                )}
                                {selectedContact.company && (
                                  <p><strong>Company:</strong> {selectedContact.company}</p>
                                )}
                                {selectedContact.jobTitle && (
                                  <p><strong>Job Title:</strong> {selectedContact.jobTitle}</p>
                                )}
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-gray-600">Address</Label>
                              <div className="text-sm">
                                <p>{selectedContact.address.street}</p>
                                <p>{selectedContact.address.city}, {selectedContact.address.county}</p>
                                <p>{selectedContact.address.postcode}</p>
                                <p>{selectedContact.address.country}</p>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-gray-600">Preferences</Label>
                              <div className="text-sm space-y-1">
                                <p><strong>Price Range:</strong> {formatCurrency(selectedContact.preferences.priceRange.min)} - {formatCurrency(selectedContact.preferences.priceRange.max)}</p>
                                <p><strong>Communication:</strong> {selectedContact.preferences.communicationPreference}</p>
                                {selectedContact.preferences.bedrooms && (
                                  <p><strong>Bedrooms:</strong> {selectedContact.preferences.bedrooms}</p>
                                )}
                                {selectedContact.preferences.bathrooms && (
                                  <p><strong>Bathrooms:</strong> {selectedContact.preferences.bathrooms}</p>
                                )}
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-gray-600">Performance</Label>
                              <div className="text-sm space-y-1">
                                <p><strong>Total Deals:</strong> {selectedContact.totalDeals}</p>
                                <p><strong>Total Value:</strong> {formatCurrency(selectedContact.totalValue)}</p>
                                <p><strong>Avg Deal Value:</strong> {formatCurrency(selectedContact.avgDealValue)}</p>
                                <p><strong>Conversion Rate:</strong> {formatPercentage(selectedContact.conversionRate)}</p>
                                <p><strong>Lifetime Value:</strong> {formatCurrency(selectedContact.lifetimeValue)}</p>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-gray-600">Notes</Label>
                              <div className="text-sm">
                                <p>{selectedContact.notes || 'No notes available'}</p>
                              </div>
                            </div>
                          </div>
                        </TabsContent>
                        <TabsContent value="activities" className="space-y-4">
                          <div className="space-y-3">
                            {selectedContact.activities.length > 0 ? (
                              selectedContact.activities.map((activity) => (
                                <div key={activity.id} className="border rounded-lg p-3">
                                  <div className="flex items-center justify-between mb-2">
                                    <Badge variant="outline">{activity.type}</Badge>
                                    <span className="text-xs text-gray-500">
                                      {formatDate(activity.date)}
                                    </span>
                                  </div>
                                  <p className="text-sm">{activity.description}</p>
                                  {activity.outcome && (
                                    <p className="text-xs text-gray-600 mt-1">
                                      <strong>Outcome:</strong> {activity.outcome}
                                    </p>
                                  )}
                                </div>
                              ))
                            ) : (
                              <p className="text-center text-gray-500 py-8">
                                No activities recorded
                              </p>
                            )}
                          </div>
                        </TabsContent>
                        <TabsContent value="properties" className="space-y-4">
                          <div className="space-y-3">
                            {selectedContact.properties.length > 0 ? (
                              selectedContact.properties.map((property) => (
                                <div key={property.id} className="border rounded-lg p-3">
                                  <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-medium">{property.title}</h4>
                                    <Badge variant="outline">{property.type}</Badge>
                                  </div>
                                  <p className="text-xs text-gray-500">
                                    {formatDate(property.date)}
                                  </p>
                                </div>
                              ))
                            ) : (
                              <p className="text-center text-gray-500 py-8">
                                No properties associated
                              </p>
                            )}
                          </div>
                        </TabsContent>
                        <TabsContent value="documents" className="space-y-4">
                          <div className="space-y-3">
                            {selectedContact.documents.length > 0 ? (
                              selectedContact.documents.map((document) => (
                                <div key={document.id} className="border rounded-lg p-3">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                      <FileText className="w-4 h-4 text-gray-400" />
                                      <span className="font-medium">{document.name}</span>
                                    </div>
                                    <Badge variant="outline">{document.type}</Badge>
                                  </div>
                                  <p className="text-xs text-gray-500 mt-1">
                                    Uploaded: {formatDate(document.uploadDate)}
                                  </p>
                                </div>
                              ))
                            ) : (
                              <p className="text-center text-gray-500 py-8">
                                No documents uploaded
                              </p>
                            )}
                          </div>
                        </TabsContent>
                      </Tabs>
                    )}
                  </DialogContent>
                </Dialog>
                <Button variant="outline" size="sm">
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteContact(contact.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {sortedContacts.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No contacts found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || typeFilter !== 'all' || statusFilter !== 'all' || priorityFilter !== 'all'
                ? 'No contacts match your current filters. Try adjusting your search criteria.'
                : 'Get started by adding your first contact.'}
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <UserPlus className="w-4 h-4 mr-2" />
              Add Your First Contact
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ContactManagement;