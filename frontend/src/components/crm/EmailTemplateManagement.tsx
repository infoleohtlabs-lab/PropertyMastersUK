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
  FileText,
  Plus,
  Edit,
  Trash2,
  Eye,
  Copy,
  Download,
  Upload,
  Search,
  Filter,
  Send,
  Code,
  Type,
  Image,
  Link,
  Settings,
  Palette,
  Layout,
  Smartphone,
  Monitor,
  Globe,
  Users,
  Calendar,
  BarChart3,
  CheckCircle,
  AlertCircle,
  Clock,
  Star,
  Tag,
  Zap,
  Target,
  Activity,
} from 'lucide-react';
import { toast } from 'sonner';

interface EmailTemplate {
  id: string;
  name: string;
  description: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  previewText: string;
  type: 'WELCOME' | 'NEWSLETTER' | 'PROMOTIONAL' | 'TRANSACTIONAL' | 'FOLLOW_UP' | 'PROPERTY_ALERT' | 'CUSTOM';
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
  category: string;
  isDefault: boolean;
  fromName: string;
  fromEmail: string;
  replyTo: string;
  variables: string[];
  designSettings: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
    fontSize: string;
    backgroundColor: string;
    headerImage?: string;
    footerText: string;
  };
  personalizationRules: {
    field: string;
    condition: string;
    value: string;
    replacement: string;
  }[];
  abTestSettings?: {
    isEnabled: boolean;
    variants: {
      name: string;
      subject: string;
      content: string;
    }[];
  };
  schedulingOptions: {
    timezone: string;
    sendTime: string;
    frequency: 'ONCE' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
  };
  analytics: {
    usageCount: number;
    lastUsed?: string;
    avgOpenRate: number;
    avgClickRate: number;
    avgConversionRate: number;
  };
  tags: string[];
  attachments: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  lastModifiedBy: string;
}

const EmailTemplateManagement: React.FC = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [newTemplate, setNewTemplate] = useState<Partial<EmailTemplate>>({
    name: '',
    description: '',
    subject: '',
    htmlContent: '',
    textContent: '',
    previewText: '',
    type: 'CUSTOM',
    status: 'DRAFT',
    category: 'General',
    isDefault: false,
    fromName: 'PropertyMasters UK',
    fromEmail: 'noreply@propertymasters.co.uk',
    replyTo: 'support@propertymasters.co.uk',
    variables: [],
    tags: [],
    attachments: [],
    designSettings: {
      primaryColor: '#3B82F6',
      secondaryColor: '#64748B',
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      backgroundColor: '#FFFFFF',
      footerText: '© 2024 PropertyMasters UK. All rights reserved.',
    },
    personalizationRules: [],
    schedulingOptions: {
      timezone: 'Europe/London',
      sendTime: '09:00',
      frequency: 'ONCE',
    },
  });

  // Mock data - replace with actual API calls
  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockTemplates: EmailTemplate[] = [
          {
            id: '1',
            name: 'Welcome New Subscriber',
            description: 'Welcome email for new subscribers with property recommendations',
            subject: 'Welcome to PropertyMasters UK - Your Property Journey Starts Here!',
            htmlContent: `
              <html>
                <body style="font-family: Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px;">
                  <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <div style="background-color: #3B82F6; color: white; padding: 30px; text-align: center;">
                      <h1 style="margin: 0; font-size: 28px;">Welcome to PropertyMasters UK!</h1>
                      <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Your property journey starts here</p>
                    </div>
                    <div style="padding: 30px;">
                      <h2 style="color: #1f2937; margin-bottom: 20px;">Hello {{firstName}},</h2>
                      <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
                        Thank you for joining PropertyMasters UK! We're excited to help you find your perfect property in {{preferredLocation}}.
                      </p>
                      <p style="color: #4b5563; line-height: 1.6; margin-bottom: 30px;">
                        Here's what you can expect from us:
                      </p>
                      <ul style="color: #4b5563; line-height: 1.8; margin-bottom: 30px;">
                        <li>Personalized property recommendations</li>
                        <li>Instant alerts for new listings</li>
                        <li>Expert market insights and advice</li>
                        <li>Professional support throughout your journey</li>
                      </ul>
                      <div style="text-align: center; margin: 30px 0;">
                        <a href="{{websiteUrl}}/properties" style="background-color: #3B82F6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Browse Properties</a>
                      </div>
                      <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                        Need help? Reply to this email or contact our support team.
                      </p>
                    </div>
                    <div style="background-color: #f8fafc; padding: 20px; text-align: center; color: #6b7280; font-size: 12px;">
                      © 2024 PropertyMasters UK. All rights reserved.
                    </div>
                  </div>
                </body>
              </html>
            `,
            textContent: 'Welcome to PropertyMasters UK! Thank you for joining us. We\'re excited to help you find your perfect property.',
            previewText: 'Welcome to PropertyMasters UK - Your property journey starts here!',
            type: 'WELCOME',
            status: 'ACTIVE',
            category: 'Onboarding',
            isDefault: true,
            fromName: 'PropertyMasters UK',
            fromEmail: 'welcome@propertymasters.co.uk',
            replyTo: 'support@propertymasters.co.uk',
            variables: ['firstName', 'lastName', 'preferredLocation', 'websiteUrl'],
            designSettings: {
              primaryColor: '#3B82F6',
              secondaryColor: '#64748B',
              fontFamily: 'Arial, sans-serif',
              fontSize: '14px',
              backgroundColor: '#FFFFFF',
              footerText: '© 2024 PropertyMasters UK. All rights reserved.',
            },
            personalizationRules: [
              {
                field: 'userType',
                condition: 'equals',
                value: 'BUYER',
                replacement: 'Browse our latest properties for sale',
              },
              {
                field: 'userType',
                condition: 'equals',
                value: 'TENANT',
                replacement: 'Discover rental properties in your area',
              },
            ],
            schedulingOptions: {
              timezone: 'Europe/London',
              sendTime: '09:00',
              frequency: 'ONCE',
            },
            analytics: {
              usageCount: 245,
              lastUsed: '2024-01-16T10:30:00Z',
              avgOpenRate: 68.5,
              avgClickRate: 24.3,
              avgConversionRate: 8.7,
            },
            tags: ['welcome', 'onboarding', 'automated'],
            attachments: [],
            createdAt: '2023-12-01T10:00:00Z',
            updatedAt: '2024-01-10T15:30:00Z',
            createdBy: 'Sarah Johnson',
            lastModifiedBy: 'Mike Davis',
          },
          {
            id: '2',
            name: 'Monthly Property Newsletter',
            description: 'Monthly newsletter featuring new listings and market updates',
            subject: 'New Properties & Market Updates - {{monthYear}}',
            htmlContent: '<html><body>Monthly newsletter content...</body></html>',
            textContent: 'Monthly newsletter with new properties and market updates.',
            previewText: 'Discover new properties and market insights this month',
            type: 'NEWSLETTER',
            status: 'ACTIVE',
            category: 'Marketing',
            isDefault: false,
            fromName: 'PropertyMasters UK',
            fromEmail: 'newsletter@propertymasters.co.uk',
            replyTo: 'support@propertymasters.co.uk',
            variables: ['firstName', 'monthYear', 'newListingsCount', 'marketTrend'],
            designSettings: {
              primaryColor: '#059669',
              secondaryColor: '#64748B',
              fontFamily: 'Georgia, serif',
              fontSize: '16px',
              backgroundColor: '#FFFFFF',
              footerText: '© 2024 PropertyMasters UK. All rights reserved.',
            },
            personalizationRules: [],
            schedulingOptions: {
              timezone: 'Europe/London',
              sendTime: '08:00',
              frequency: 'MONTHLY',
            },
            analytics: {
              usageCount: 12,
              lastUsed: '2024-01-15T08:00:00Z',
              avgOpenRate: 45.2,
              avgClickRate: 12.8,
              avgConversionRate: 3.4,
            },
            tags: ['newsletter', 'monthly', 'marketing'],
            attachments: [],
            createdAt: '2023-11-15T14:00:00Z',
            updatedAt: '2024-01-05T09:00:00Z',
            createdBy: 'Emma Wilson',
            lastModifiedBy: 'Emma Wilson',
          },
          {
            id: '3',
            name: 'Property Price Alert',
            description: 'Alert email for property price changes',
            subject: 'Price Drop Alert: {{propertyTitle}} - Save {{discountAmount}}!',
            htmlContent: '<html><body>Price alert content...</body></html>',
            textContent: 'Price drop alert for your saved property.',
            previewText: 'Great news! The price has dropped on a property you\'re watching',
            type: 'PROPERTY_ALERT',
            status: 'ACTIVE',
            category: 'Alerts',
            isDefault: false,
            fromName: 'PropertyMasters Alerts',
            fromEmail: 'alerts@propertymasters.co.uk',
            replyTo: 'support@propertymasters.co.uk',
            variables: ['firstName', 'propertyTitle', 'oldPrice', 'newPrice', 'discountAmount', 'propertyUrl'],
            designSettings: {
              primaryColor: '#DC2626',
              secondaryColor: '#64748B',
              fontFamily: 'Arial, sans-serif',
              fontSize: '14px',
              backgroundColor: '#FFFFFF',
              footerText: '© 2024 PropertyMasters UK. All rights reserved.',
            },
            personalizationRules: [],
            schedulingOptions: {
              timezone: 'Europe/London',
              sendTime: 'immediate',
              frequency: 'ONCE',
            },
            analytics: {
              usageCount: 89,
              lastUsed: '2024-01-16T14:22:00Z',
              avgOpenRate: 72.1,
              avgClickRate: 35.6,
              avgConversionRate: 15.2,
            },
            tags: ['alert', 'price-drop', 'automated'],
            attachments: [],
            createdAt: '2023-12-10T11:00:00Z',
            updatedAt: '2024-01-12T16:45:00Z',
            createdBy: 'Mike Davis',
            lastModifiedBy: 'Sarah Johnson',
          },
        ];
        
        setTemplates(mockTemplates);
      } catch (error) {
        toast.error('Failed to load email templates');
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  const getTypeColor = (type: string) => {
    const colors = {
      WELCOME: 'bg-green-100 text-green-800',
      NEWSLETTER: 'bg-blue-100 text-blue-800',
      PROMOTIONAL: 'bg-purple-100 text-purple-800',
      TRANSACTIONAL: 'bg-gray-100 text-gray-800',
      FOLLOW_UP: 'bg-yellow-100 text-yellow-800',
      PROPERTY_ALERT: 'bg-red-100 text-red-800',
      CUSTOM: 'bg-orange-100 text-orange-800',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      DRAFT: 'bg-gray-100 text-gray-800',
      ACTIVE: 'bg-green-100 text-green-800',
      ARCHIVED: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      DRAFT: <FileText className="w-4 h-4" />,
      ACTIVE: <CheckCircle className="w-4 h-4" />,
      ARCHIVED: <AlertCircle className="w-4 h-4" />,
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

  const handleCreateTemplate = async () => {
    try {
      // Simulate API call
      const templateData = {
        ...newTemplate,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'Current User',
        lastModifiedBy: 'Current User',
        analytics: {
          usageCount: 0,
          avgOpenRate: 0,
          avgClickRate: 0,
          avgConversionRate: 0,
        },
      };
      
      setTemplates([...templates, templateData as EmailTemplate]);
      setNewTemplate({
        name: '',
        description: '',
        subject: '',
        htmlContent: '',
        textContent: '',
        previewText: '',
        type: 'CUSTOM',
        status: 'DRAFT',
        category: 'General',
        isDefault: false,
        fromName: 'PropertyMasters UK',
        fromEmail: 'noreply@propertymasters.co.uk',
        replyTo: 'support@propertymasters.co.uk',
        variables: [],
        tags: [],
        attachments: [],
        designSettings: {
          primaryColor: '#3B82F6',
          secondaryColor: '#64748B',
          fontFamily: 'Arial, sans-serif',
          fontSize: '14px',
          backgroundColor: '#FFFFFF',
          footerText: '© 2024 PropertyMasters UK. All rights reserved.',
        },
        personalizationRules: [],
        schedulingOptions: {
          timezone: 'Europe/London',
          sendTime: '09:00',
          frequency: 'ONCE',
        },
      });
      setIsCreateDialogOpen(false);
      toast.success('Email template created successfully');
    } catch (error) {
      toast.error('Failed to create email template');
    }
  };

  const handleUpdateTemplateStatus = async (templateId: string, newStatus: string) => {
    try {
      setTemplates(templates.map(template => 
        template.id === templateId ? { ...template, status: newStatus as any } : template
      ));
      toast.success(`Template ${newStatus.toLowerCase()}`);
    } catch (error) {
      toast.error('Failed to update template status');
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      setTemplates(templates.filter(template => template.id !== templateId));
      toast.success('Template deleted successfully');
    } catch (error) {
      toast.error('Failed to delete template');
    }
  };

  const handleDuplicateTemplate = async (template: EmailTemplate) => {
    try {
      const duplicatedTemplate = {
        ...template,
        id: Date.now().toString(),
        name: `${template.name} (Copy)`,
        status: 'DRAFT' as const,
        isDefault: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'Current User',
        lastModifiedBy: 'Current User',
        analytics: {
          usageCount: 0,
          avgOpenRate: 0,
          avgClickRate: 0,
          avgConversionRate: 0,
        },
      };
      
      setTemplates([...templates, duplicatedTemplate]);
      toast.success('Template duplicated successfully');
    } catch (error) {
      toast.error('Failed to duplicate template');
    }
  };

  const handleSendTestEmail = async (template: EmailTemplate) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Test email sent successfully');
    } catch (error) {
      toast.error('Failed to send test email');
    }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = 
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.subject.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || template.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || template.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || template.category === categoryFilter;
    
    return matchesSearch && matchesType && matchesStatus && matchesCategory;
  });

  const categories = Array.from(new Set(templates.map(t => t.category)));

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
          <h2 className="text-2xl font-bold text-gray-900">Email Templates</h2>
          <p className="text-gray-600 mt-1">Create and manage email templates for campaigns</p>
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
                <span>Create Template</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Create New Email Template</DialogTitle>
              </DialogHeader>
              <Tabs defaultValue="basic" className="w-full">
                <TabsList>
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="content">Content</TabsTrigger>
                  <TabsTrigger value="design">Design</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>
                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Template Name</Label>
                      <Input
                        id="name"
                        value={newTemplate.name}
                        onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                        placeholder="Enter template name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">Template Type</Label>
                      <Select value={newTemplate.type} onValueChange={(value) => setNewTemplate({ ...newTemplate, type: value as any })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="WELCOME">Welcome</SelectItem>
                          <SelectItem value="NEWSLETTER">Newsletter</SelectItem>
                          <SelectItem value="PROMOTIONAL">Promotional</SelectItem>
                          <SelectItem value="TRANSACTIONAL">Transactional</SelectItem>
                          <SelectItem value="FOLLOW_UP">Follow Up</SelectItem>
                          <SelectItem value="PROPERTY_ALERT">Property Alert</SelectItem>
                          <SelectItem value="CUSTOM">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Input
                        id="category"
                        value={newTemplate.category}
                        onChange={(e) => setNewTemplate({ ...newTemplate, category: e.target.value })}
                        placeholder="Enter category"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select value={newTemplate.status} onValueChange={(value) => setNewTemplate({ ...newTemplate, status: value as any })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DRAFT">Draft</SelectItem>
                          <SelectItem value="ACTIVE">Active</SelectItem>
                          <SelectItem value="ARCHIVED">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newTemplate.description}
                      onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                      placeholder="Enter template description"
                      rows={3}
                    />
                  </div>
                </TabsContent>
                <TabsContent value="content" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fromName">From Name</Label>
                      <Input
                        id="fromName"
                        value={newTemplate.fromName}
                        onChange={(e) => setNewTemplate({ ...newTemplate, fromName: e.target.value })}
                        placeholder="Enter sender name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fromEmail">From Email</Label>
                      <Input
                        id="fromEmail"
                        type="email"
                        value={newTemplate.fromEmail}
                        onChange={(e) => setNewTemplate({ ...newTemplate, fromEmail: e.target.value })}
                        placeholder="Enter sender email"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject Line</Label>
                    <Input
                      id="subject"
                      value={newTemplate.subject}
                      onChange={(e) => setNewTemplate({ ...newTemplate, subject: e.target.value })}
                      placeholder="Enter email subject"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="previewText">Preview Text</Label>
                    <Input
                      id="previewText"
                      value={newTemplate.previewText}
                      onChange={(e) => setNewTemplate({ ...newTemplate, previewText: e.target.value })}
                      placeholder="Enter preview text"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="htmlContent">HTML Content</Label>
                    <Textarea
                      id="htmlContent"
                      value={newTemplate.htmlContent}
                      onChange={(e) => setNewTemplate({ ...newTemplate, htmlContent: e.target.value })}
                      placeholder="Enter HTML content"
                      rows={8}
                      className="font-mono text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="textContent">Text Content</Label>
                    <Textarea
                      id="textContent"
                      value={newTemplate.textContent}
                      onChange={(e) => setNewTemplate({ ...newTemplate, textContent: e.target.value })}
                      placeholder="Enter plain text content"
                      rows={6}
                    />
                  </div>
                </TabsContent>
                <TabsContent value="design" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="primaryColor">Primary Color</Label>
                      <div className="flex space-x-2">
                        <Input
                          id="primaryColor"
                          type="color"
                          value={newTemplate.designSettings?.primaryColor}
                          onChange={(e) => setNewTemplate({
                            ...newTemplate,
                            designSettings: {
                              ...newTemplate.designSettings!,
                              primaryColor: e.target.value,
                            },
                          })}
                          className="w-16 h-10"
                        />
                        <Input
                          value={newTemplate.designSettings?.primaryColor}
                          onChange={(e) => setNewTemplate({
                            ...newTemplate,
                            designSettings: {
                              ...newTemplate.designSettings!,
                              primaryColor: e.target.value,
                            },
                          })}
                          placeholder="#3B82F6"
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="secondaryColor">Secondary Color</Label>
                      <div className="flex space-x-2">
                        <Input
                          id="secondaryColor"
                          type="color"
                          value={newTemplate.designSettings?.secondaryColor}
                          onChange={(e) => setNewTemplate({
                            ...newTemplate,
                            designSettings: {
                              ...newTemplate.designSettings!,
                              secondaryColor: e.target.value,
                            },
                          })}
                          className="w-16 h-10"
                        />
                        <Input
                          value={newTemplate.designSettings?.secondaryColor}
                          onChange={(e) => setNewTemplate({
                            ...newTemplate,
                            designSettings: {
                              ...newTemplate.designSettings!,
                              secondaryColor: e.target.value,
                            },
                          })}
                          placeholder="#64748B"
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fontFamily">Font Family</Label>
                      <Select
                        value={newTemplate.designSettings?.fontFamily}
                        onValueChange={(value) => setNewTemplate({
                          ...newTemplate,
                          designSettings: {
                            ...newTemplate.designSettings!,
                            fontFamily: value,
                          },
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select font" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Arial, sans-serif">Arial</SelectItem>
                          <SelectItem value="Georgia, serif">Georgia</SelectItem>
                          <SelectItem value="Helvetica, sans-serif">Helvetica</SelectItem>
                          <SelectItem value="Times New Roman, serif">Times New Roman</SelectItem>
                          <SelectItem value="Verdana, sans-serif">Verdana</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fontSize">Font Size</Label>
                      <Select
                        value={newTemplate.designSettings?.fontSize}
                        onValueChange={(value) => setNewTemplate({
                          ...newTemplate,
                          designSettings: {
                            ...newTemplate.designSettings!,
                            fontSize: value,
                          },
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="12px">12px</SelectItem>
                          <SelectItem value="14px">14px</SelectItem>
                          <SelectItem value="16px">16px</SelectItem>
                          <SelectItem value="18px">18px</SelectItem>
                          <SelectItem value="20px">20px</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="footerText">Footer Text</Label>
                    <Input
                      id="footerText"
                      value={newTemplate.designSettings?.footerText}
                      onChange={(e) => setNewTemplate({
                        ...newTemplate,
                        designSettings: {
                          ...newTemplate.designSettings!,
                          footerText: e.target.value,
                        },
                      })}
                      placeholder="Enter footer text"
                    />
                  </div>
                </TabsContent>
                <TabsContent value="settings" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="replyTo">Reply To Email</Label>
                      <Input
                        id="replyTo"
                        type="email"
                        value={newTemplate.replyTo}
                        onChange={(e) => setNewTemplate({ ...newTemplate, replyTo: e.target.value })}
                        placeholder="Enter reply-to email"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timezone">Timezone</Label>
                      <Select
                        value={newTemplate.schedulingOptions?.timezone}
                        onValueChange={(value) => setNewTemplate({
                          ...newTemplate,
                          schedulingOptions: {
                            ...newTemplate.schedulingOptions!,
                            timezone: value,
                          },
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select timezone" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Europe/London">London (GMT)</SelectItem>
                          <SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
                          <SelectItem value="America/New_York">New York (EST)</SelectItem>
                          <SelectItem value="America/Los_Angeles">Los Angeles (PST)</SelectItem>
                          <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Variables</Label>
                    <div className="flex flex-wrap gap-2">
                      {['firstName', 'lastName', 'email', 'propertyTitle', 'price', 'location', 'websiteUrl'].map((variable) => (
                        <Badge key={variable} variant="outline" className="cursor-pointer">
                          &#123;&#123;{variable}&#125;&#125;
                        </Badge>
                      ))}
                    </div>
                    <p className="text-sm text-gray-600">Click on variables to copy them to your content</p>
                  </div>
                </TabsContent>
              </Tabs>
              <div className="flex justify-end space-x-3 mt-6">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateTemplate}>
                  Create Template
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
                <p className="text-sm font-medium text-gray-600">Total Templates</p>
                <p className="text-2xl font-bold text-gray-900">{templates.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Templates</p>
                <p className="text-2xl font-bold text-gray-900">
                  {templates.filter(t => t.status === 'ACTIVE').length}
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
                <p className="text-sm font-medium text-gray-600">Total Usage</p>
                <p className="text-2xl font-bold text-gray-900">
                  {templates.reduce((sum, t) => sum + t.analytics.usageCount, 0).toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Activity className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Open Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatPercentage(
                    templates.reduce((sum, t) => sum + t.analytics.avgOpenRate, 0) / templates.length || 0
                  )}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <BarChart3 className="w-6 h-6 text-yellow-600" />
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
                placeholder="Search templates by name, description, or subject..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="WELCOME">Welcome</SelectItem>
                <SelectItem value="NEWSLETTER">Newsletter</SelectItem>
                <SelectItem value="PROMOTIONAL">Promotional</SelectItem>
                <SelectItem value="TRANSACTIONAL">Transactional</SelectItem>
                <SelectItem value="FOLLOW_UP">Follow Up</SelectItem>
                <SelectItem value="PROPERTY_ALERT">Property Alert</SelectItem>
                <SelectItem value="CUSTOM">Custom</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="ARCHIVED">Archived</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge className={getTypeColor(template.type)}>
                      {template.type}
                    </Badge>
                    <Badge className={getStatusColor(template.status)}>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(template.status)}
                        <span>{template.status}</span>
                      </div>
                    </Badge>
                    {template.isDefault && (
                      <Badge variant="outline">
                        <Star className="w-3 h-3 mr-1" />
                        Default
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Subject:</span>
                  <span className="font-medium truncate ml-2" title={template.subject}>
                    {template.subject.length > 30 ? `${template.subject.substring(0, 30)}...` : template.subject}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Category:</span>
                  <Badge variant="outline">{template.category}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Usage:</span>
                  <span className="font-medium">{template.analytics.usageCount}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Open Rate:</span>
                  <span className="font-medium">{formatPercentage(template.analytics.avgOpenRate)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Click Rate:</span>
                  <span className="font-medium">{formatPercentage(template.analytics.avgClickRate)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Conversion:</span>
                  <span className="font-medium">{formatPercentage(template.analytics.avgConversionRate)}</span>
                </div>
              </div>

              {template.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {template.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                  {template.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{template.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}

              <div className="text-xs text-gray-500">
                <p>Created: {formatDate(template.createdAt)}</p>
                <p>Modified: {formatDate(template.updatedAt)}</p>
                {template.analytics.lastUsed && (
                  <p>Last used: {formatDate(template.analytics.lastUsed)}</p>
                )}
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setSelectedTemplate(template)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Preview
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl">
                    <DialogHeader>
                      <div className="flex items-center justify-between">
                        <DialogTitle>{selectedTemplate?.name}</DialogTitle>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPreviewMode(previewMode === 'desktop' ? 'mobile' : 'desktop')}
                          >
                            {previewMode === 'desktop' ? (
                              <Smartphone className="w-4 h-4" />
                            ) : (
                              <Monitor className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </DialogHeader>
                    {selectedTemplate && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <Label className="text-gray-600">Subject:</Label>
                            <p className="font-medium">{selectedTemplate.subject}</p>
                          </div>
                          <div>
                            <Label className="text-gray-600">From:</Label>
                            <p className="font-medium">{selectedTemplate.fromName} &lt;{selectedTemplate.fromEmail}&gt;</p>
                          </div>
                          <div>
                            <Label className="text-gray-600">Preview Text:</Label>
                            <p className="font-medium">{selectedTemplate.previewText}</p>
                          </div>
                          <div>
                            <Label className="text-gray-600">Type:</Label>
                            <Badge className={getTypeColor(selectedTemplate.type)}>
                              {selectedTemplate.type}
                            </Badge>
                          </div>
                        </div>
                        <div className="border rounded-lg overflow-hidden">
                          <div className="bg-gray-50 p-3 border-b">
                            <p className="text-sm font-medium">Email Preview ({previewMode})</p>
                          </div>
                          <div className={`p-4 ${previewMode === 'mobile' ? 'max-w-sm mx-auto' : ''}`}>
                            <div 
                              className="prose max-w-none"
                              dangerouslySetInnerHTML={{ __html: selectedTemplate.htmlContent }}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSendTestEmail(template)}
                >
                  <Send className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDuplicateTemplate(template)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteTemplate(template.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || typeFilter !== 'all' || statusFilter !== 'all' || categoryFilter !== 'all'
                ? 'No templates match your current filters. Try adjusting your search criteria.'
                : 'Get started by creating your first email template.'}
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Template
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EmailTemplateManagement;