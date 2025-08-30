import React, { useState, useEffect } from 'react';
import { Bell, Check, X, Eye, EyeOff, Filter, Search, Calendar, User, Home, AlertTriangle, Info, CheckCircle, Clock, Trash2, MoreVertical, Settings } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { showToast } from '../components/ui/Toast';

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  category: 'system' | 'property' | 'maintenance' | 'payment' | 'viewing' | 'tenant' | 'landlord' | 'marketing';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  isImportant: boolean;
  actionRequired: boolean;
  relatedEntity?: {
    type: 'property' | 'user' | 'booking' | 'payment' | 'maintenance';
    id: string;
    name: string;
  };
  actions?: {
    label: string;
    action: string;
    variant?: 'primary' | 'secondary' | 'danger';
  }[];
  metadata?: {
    propertyAddress?: string;
    amount?: number;
    dueDate?: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
  };
}

interface NotificationSettings {
  email: {
    enabled: boolean;
    frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
    categories: string[];
  };
  sms: {
    enabled: boolean;
    urgentOnly: boolean;
    categories: string[];
  };
  push: {
    enabled: boolean;
    desktop: boolean;
    mobile: boolean;
    categories: string[];
  };
  inApp: {
    enabled: boolean;
    showBadge: boolean;
    autoMarkRead: boolean;
    retentionDays: number;
  };
}

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'warning',
      category: 'maintenance',
      title: 'Urgent Maintenance Request',
      message: 'Heating system failure reported at 123 Oak Street. Tenant requires immediate attention.',
      timestamp: '2024-01-16T10:30:00Z',
      isRead: false,
      isImportant: true,
      actionRequired: true,
      relatedEntity: {
        type: 'property',
        id: 'prop-1',
        name: '123 Oak Street'
      },
      actions: [
        { label: 'Assign Contractor', action: 'assign_contractor', variant: 'primary' },
        { label: 'Contact Tenant', action: 'contact_tenant', variant: 'secondary' }
      ],
      metadata: {
        propertyAddress: '123 Oak Street, London',
        priority: 'urgent'
      }
    },
    {
      id: '2',
      type: 'success',
      category: 'payment',
      title: 'Rent Payment Received',
      message: 'Monthly rent payment of £1,200 has been received from John Smith for 456 Elm Avenue.',
      timestamp: '2024-01-16T09:15:00Z',
      isRead: false,
      isImportant: false,
      actionRequired: false,
      relatedEntity: {
        type: 'payment',
        id: 'pay-1',
        name: 'January Rent - 456 Elm Avenue'
      },
      metadata: {
        propertyAddress: '456 Elm Avenue, London',
        amount: 1200
      }
    },
    {
      id: '3',
      type: 'info',
      category: 'viewing',
      title: 'Property Viewing Scheduled',
      message: 'New viewing appointment scheduled for 789 Pine Road on January 18th at 2:00 PM.',
      timestamp: '2024-01-16T08:45:00Z',
      isRead: true,
      isImportant: false,
      actionRequired: false,
      relatedEntity: {
        type: 'booking',
        id: 'book-1',
        name: 'Viewing - 789 Pine Road'
      },
      actions: [
        { label: 'View Details', action: 'view_booking', variant: 'secondary' }
      ],
      metadata: {
        propertyAddress: '789 Pine Road, London'
      }
    },
    {
      id: '4',
      type: 'error',
      category: 'system',
      title: 'Integration Error',
      message: 'Failed to sync property data with Rightmove. Please check your API configuration.',
      timestamp: '2024-01-16T07:20:00Z',
      isRead: true,
      isImportant: true,
      actionRequired: true,
      actions: [
        { label: 'Check Settings', action: 'check_settings', variant: 'primary' },
        { label: 'Retry Sync', action: 'retry_sync', variant: 'secondary' }
      ]
    },
    {
      id: '5',
      type: 'warning',
      category: 'payment',
      title: 'Overdue Payment Reminder',
      message: 'Rent payment for 321 Maple Drive is 5 days overdue. Amount due: £950.',
      timestamp: '2024-01-15T16:30:00Z',
      isRead: false,
      isImportant: true,
      actionRequired: true,
      relatedEntity: {
        type: 'payment',
        id: 'pay-2',
        name: 'Overdue Rent - 321 Maple Drive'
      },
      actions: [
        { label: 'Send Reminder', action: 'send_reminder', variant: 'primary' },
        { label: 'Contact Tenant', action: 'contact_tenant', variant: 'secondary' }
      ],
      metadata: {
        propertyAddress: '321 Maple Drive, London',
        amount: 950,
        dueDate: '2024-01-10',
        priority: 'high'
      }
    }
  ]);

  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>(notifications);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [showImportantOnly, setShowImportantOnly] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    email: {
      enabled: true,
      frequency: 'immediate',
      categories: ['maintenance', 'payment', 'viewing']
    },
    sms: {
      enabled: true,
      urgentOnly: true,
      categories: ['maintenance', 'payment']
    },
    push: {
      enabled: true,
      desktop: true,
      mobile: true,
      categories: ['system', 'maintenance', 'payment', 'viewing']
    },
    inApp: {
      enabled: true,
      showBadge: true,
      autoMarkRead: false,
      retentionDays: 30
    }
  });

  // Filter notifications based on search and filters
  useEffect(() => {
    let filtered = notifications;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(notification =>
        notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.relatedEntity?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(notification => notification.category === selectedCategory);
    }

    // Type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(notification => notification.type === selectedType);
    }

    // Unread filter
    if (showUnreadOnly) {
      filtered = filtered.filter(notification => !notification.isRead);
    }

    // Important filter
    if (showImportantOnly) {
      filtered = filtered.filter(notification => notification.isImportant);
    }

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    setFilteredNotifications(filtered);
  }, [notifications, searchTerm, selectedCategory, selectedType, showUnreadOnly, showImportantOnly]);

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications(prev => prev.map(notification =>
      notification.id === notificationId
        ? { ...notification, isRead: true }
        : notification
    ));
  };

  const handleMarkAsUnread = (notificationId: string) => {
    setNotifications(prev => prev.map(notification =>
      notification.id === notificationId
        ? { ...notification, isRead: false }
        : notification
    ));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(notification => ({ ...notification, isRead: true })));
    setToast({ message: 'All notifications marked as read', type: 'success' });
  };

  const handleDeleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== notificationId));
    setToast({ message: 'Notification deleted', type: 'success' });
  };

  const handleDeleteAllRead = () => {
    setNotifications(prev => prev.filter(notification => !notification.isRead));
    setToast({ message: 'All read notifications deleted', type: 'success' });
  };

  const handleNotificationAction = async (action: string, notificationId: string) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mark notification as read when action is taken
      handleMarkAsRead(notificationId);
      
      setToast({ message: `Action "${action}" completed successfully`, type: 'success' });
    } catch (error) {
      setToast({ message: 'Failed to complete action', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setToast({ message: 'Notification settings saved successfully', type: 'success' });
      setShowSettingsModal(false);
    } catch (error) {
      setToast({ message: 'Failed to save settings', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <X className="h-5 w-5 text-red-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'property':
        return <Home className="h-4 w-4" />;
      case 'maintenance':
        return <AlertTriangle className="h-4 w-4" />;
      case 'payment':
        return <Calendar className="h-4 w-4" />;
      case 'viewing':
        return <Eye className="h-4 w-4" />;
      case 'tenant':
      case 'landlord':
        return <User className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const importantCount = notifications.filter(n => n.isImportant && !n.isRead).length;

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'system', label: 'System' },
    { value: 'property', label: 'Property' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'payment', label: 'Payment' },
    { value: 'viewing', label: 'Viewing' },
    { value: 'tenant', label: 'Tenant' },
    { value: 'landlord', label: 'Landlord' },
    { value: 'marketing', label: 'Marketing' }
  ];

  const types = [
    { value: 'all', label: 'All Types' },
    { value: 'info', label: 'Information' },
    { value: 'success', label: 'Success' },
    { value: 'warning', label: 'Warning' },
    { value: 'error', label: 'Error' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Bell className="h-8 w-8 text-blue-600" />
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                <p className="text-gray-600 mt-1">
                  {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
                  {importantCount > 0 && ` • ${importantCount} important`}
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-4 lg:mt-0">
              <Button
                variant="outline"
                onClick={() => setShowSettingsModal(true)}
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              {unreadCount > 0 && (
                <Button
                  onClick={handleMarkAllAsRead}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Mark All Read
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-80">
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
              
              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search notifications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Type Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {types.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quick Filters */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    Unread only
                  </label>
                  <input
                    type="checkbox"
                    checked={showUnreadOnly}
                    onChange={(e) => setShowUnreadOnly(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    Important only
                  </label>
                  <input
                    type="checkbox"
                    checked={showImportantOnly}
                    onChange={(e) => setShowImportantOnly(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDeleteAllRead}
                    className="w-full justify-start"
                    disabled={notifications.filter(n => n.isRead).length === 0}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete All Read
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Notifications List */}
          <div className="flex-1">
            {filteredNotifications.length === 0 ? (
              <Card className="p-8 text-center">
                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
                <p className="text-gray-600">
                  {searchTerm || selectedCategory !== 'all' || selectedType !== 'all' || showUnreadOnly || showImportantOnly
                    ? 'Try adjusting your filters to see more notifications.'
                    : 'You\'re all caught up! No new notifications at this time.'}
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredNotifications.map((notification) => (
                  <Card
                    key={notification.id}
                    className={`p-6 cursor-pointer transition-all hover:shadow-md ${
                      !notification.isRead ? 'border-l-4 border-l-blue-500 bg-blue-50/30' : ''
                    } ${
                      notification.isImportant ? 'ring-2 ring-yellow-200' : ''
                    }`}
                    onClick={() => {
                      setSelectedNotification(notification);
                      setShowNotificationModal(true);
                      if (!notification.isRead) {
                        handleMarkAsRead(notification.id);
                      }
                    }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {getCategoryIcon(notification.category)}
                              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                {notification.category}
                              </span>
                              {notification.isImportant && (
                                <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium">
                                  Important
                                </span>
                              )}
                              {notification.actionRequired && (
                                <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium">
                                  Action Required
                                </span>
                              )}
                            </div>
                            
                            <h3 className={`text-lg font-medium mb-2 ${
                              !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                            }`}>
                              {notification.title}
                            </h3>
                            
                            <p className="text-gray-600 mb-3 line-clamp-2">
                              {notification.message}
                            </p>
                            
                            {notification.relatedEntity && (
                              <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                                <span>Related to:</span>
                                <span className="font-medium">{notification.relatedEntity.name}</span>
                              </div>
                            )}
                            
                            {notification.metadata && (
                              <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
                                {notification.metadata.propertyAddress && (
                                  <span>📍 {notification.metadata.propertyAddress}</span>
                                )}
                                {notification.metadata.amount && (
                                  <span>💰 £{notification.metadata.amount.toLocaleString()}</span>
                                )}
                                {notification.metadata.priority && (
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    notification.metadata.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                                    notification.metadata.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                                    notification.metadata.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {notification.metadata.priority} priority
                                  </span>
                                )}
                              </div>
                            )}
                            
                            <div className="flex items-center justify-between text-sm text-gray-500">
                              <span>{new Date(notification.timestamp).toLocaleString()}</span>
                              <div className="flex items-center gap-2">
                                {notification.actions && notification.actions.length > 0 && (
                                  <span className="text-blue-600 font-medium">Action available</span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkAsRead(notification.id);
                              }}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              {notification.isRead ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteNotification(notification.id);
                              }}
                              className="text-gray-400 hover:text-red-600"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notification Detail Modal */}
      {showNotificationModal && selectedNotification && (
        <Modal
          isOpen={showNotificationModal}
          onClose={() => {
            setShowNotificationModal(false);
            setSelectedNotification(null);
          }}
          title={selectedNotification.title}
          size="lg"
        >
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              {getNotificationIcon(selectedNotification.type)}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {getCategoryIcon(selectedNotification.category)}
                  <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                    {selectedNotification.category}
                  </span>
                  {selectedNotification.isImportant && (
                    <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium">
                      Important
                    </span>
                  )}
                  {selectedNotification.actionRequired && (
                    <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium">
                      Action Required
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  {new Date(selectedNotification.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
            
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed">
                {selectedNotification.message}
              </p>
            </div>
            
            {selectedNotification.relatedEntity && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Related Information</h4>
                <div className="text-sm text-gray-600">
                  <p><strong>Type:</strong> {selectedNotification.relatedEntity.type}</p>
                  <p><strong>Name:</strong> {selectedNotification.relatedEntity.name}</p>
                </div>
              </div>
            )}
            
            {selectedNotification.metadata && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Additional Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {selectedNotification.metadata.propertyAddress && (
                    <div>
                      <span className="font-medium text-gray-700">Property:</span>
                      <p className="text-gray-600">{selectedNotification.metadata.propertyAddress}</p>
                    </div>
                  )}
                  {selectedNotification.metadata.amount && (
                    <div>
                      <span className="font-medium text-gray-700">Amount:</span>
                      <p className="text-gray-600">£{selectedNotification.metadata.amount.toLocaleString()}</p>
                    </div>
                  )}
                  {selectedNotification.metadata.dueDate && (
                    <div>
                      <span className="font-medium text-gray-700">Due Date:</span>
                      <p className="text-gray-600">{new Date(selectedNotification.metadata.dueDate).toLocaleDateString()}</p>
                    </div>
                  )}
                  {selectedNotification.metadata.priority && (
                    <div>
                      <span className="font-medium text-gray-700">Priority:</span>
                      <p className={`font-medium ${
                        selectedNotification.metadata.priority === 'urgent' ? 'text-red-600' :
                        selectedNotification.metadata.priority === 'high' ? 'text-orange-600' :
                        selectedNotification.metadata.priority === 'medium' ? 'text-yellow-600' :
                        'text-gray-600'
                      }`}>
                        {selectedNotification.metadata.priority}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {selectedNotification.actions && selectedNotification.actions.length > 0 && (
              <div className="border-t pt-6">
                <h4 className="font-medium text-gray-900 mb-4">Available Actions</h4>
                <div className="flex flex-wrap gap-3">
                  {selectedNotification.actions.map((action, index) => (
                    <Button
                      key={index}
                      variant={action.variant === 'primary' ? 'primary' : 'outline'}
                      onClick={() => handleNotificationAction(selectedNotification.id, action.action)}
                    >
                      {action.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex justify-end gap-3 pt-6 border-t">
              {!selectedNotification.isRead && (
                <Button
                  variant="outline"
                  onClick={() => {
                    handleMarkAsRead(selectedNotification.id);
                    setSelectedNotification(prev => prev ? { ...prev, isRead: true } : null);
                  }}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Mark as Read
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => {
                  setShowNotificationModal(false);
                  setSelectedNotification(null);
                }}
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <Modal
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
          title="Notification Settings"
          size="lg"
        >
          <div className="space-y-6">
            {/* Email Settings */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Email Notifications</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    Enable email notifications
                  </label>
                  <input
                    type="checkbox"
                    checked={notificationSettings.email.enabled}
                    onChange={(e) => setNotificationSettings(prev => ({
                      ...prev,
                      email: { ...prev.email, enabled: e.target.checked }
                    }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
                
                {notificationSettings.email.enabled && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Frequency
                      </label>
                      <select
                        value={notificationSettings.email.frequency}
                        onChange={(e) => setNotificationSettings(prev => ({
                          ...prev,
                          email: { ...prev.email, frequency: e.target.value as any }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="immediate">Immediate</option>
                        <option value="hourly">Hourly</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Categories
                      </label>
                      <div className="space-y-2">
                        {categories.slice(1).map(category => (
                          <div key={category.value} className="flex items-center">
                            <input
                              type="checkbox"
                              id={`email-${category.value}`}
                              checked={notificationSettings.email.categories.includes(category.value)}
                              onChange={(e) => {
                                const categories = e.target.checked
                                  ? [...notificationSettings.email.categories, category.value]
                                  : notificationSettings.email.categories.filter(c => c !== category.value);
                                setNotificationSettings(prev => ({
                                  ...prev,
                                  email: { ...prev.email, categories }
                                }));
                              }}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor={`email-${category.value}`} className="ml-2 text-sm text-gray-700">
                              {category.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* SMS Settings */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">SMS Notifications</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    Enable SMS notifications
                  </label>
                  <input
                    type="checkbox"
                    checked={notificationSettings.sms.enabled}
                    onChange={(e) => setNotificationSettings(prev => ({
                      ...prev,
                      sms: { ...prev.sms, enabled: e.target.checked }
                    }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
                
                {notificationSettings.sms.enabled && (
                  <>
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700">
                        Urgent notifications only
                      </label>
                      <input
                        type="checkbox"
                        checked={notificationSettings.sms.urgentOnly}
                        onChange={(e) => setNotificationSettings(prev => ({
                          ...prev,
                          sms: { ...prev.sms, urgentOnly: e.target.checked }
                        }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Push Settings */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Push Notifications</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    Enable push notifications
                  </label>
                  <input
                    type="checkbox"
                    checked={notificationSettings.push.enabled}
                    onChange={(e) => setNotificationSettings(prev => ({
                      ...prev,
                      push: { ...prev.push, enabled: e.target.checked }
                    }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
                
                {notificationSettings.push.enabled && (
                  <>
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700">
                        Desktop notifications
                      </label>
                      <input
                        type="checkbox"
                        checked={notificationSettings.push.desktop}
                        onChange={(e) => setNotificationSettings(prev => ({
                          ...prev,
                          push: { ...prev.push, desktop: e.target.checked }
                        }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700">
                        Mobile notifications
                      </label>
                      <input
                        type="checkbox"
                        checked={notificationSettings.push.mobile}
                        onChange={(e) => setNotificationSettings(prev => ({
                          ...prev,
                          push: { ...prev.push, mobile: e.target.checked }
                        }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button
                variant="outline"
                onClick={() => setShowSettingsModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  handleSaveSettings();
                  setShowSettingsModal(false);
                }}
              >
                Save Settings
              </Button>
            </div>
          </div>
        </Modal>
      )}


    </div>
  );
};

export default Notifications;