import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Phone, Mail, User, Clock, Search, Filter, Plus, Paperclip, Star } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { UserRole } from '../../types/auth';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  recipientId: string;
  recipientName: string;
  subject: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
  type: 'message' | 'notification' | 'alert';
  propertyId?: string;
  propertyTitle?: string;
  attachments?: string[];
}

interface Contact {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  lastContact: string;
  isOnline: boolean;
  avatar?: string;
}

const DashboardCommunications: React.FC = () => {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [newMessage, setNewMessage] = useState('');
  const [showCompose, setShowCompose] = useState(false);

  useEffect(() => {
    // Simulate API call
    const fetchCommunicationData = async () => {
      setLoading(true);
      
      // Mock messages
      const mockMessages: Message[] = [
        {
          id: '1',
          senderId: 'tenant1',
          senderName: 'John Smith',
          senderRole: 'Tenant',
          recipientId: user?.id || 'current-user',
          recipientName: user?.name || 'You',
          subject: 'Heating Issue in Apartment',
          content: 'Hi, I\'m experiencing issues with the heating system in my apartment. The radiators are not working properly and it\'s quite cold. Could someone please look into this?',
          timestamp: '2024-01-25T10:30:00Z',
          isRead: false,
          priority: 'high',
          type: 'message',
          propertyId: '1',
          propertyTitle: 'Modern 2-Bed Apartment'
        },
        {
          id: '2',
          senderId: 'landlord1',
          senderName: 'Sarah Johnson',
          senderRole: 'Landlord',
          recipientId: user?.id || 'current-user',
          recipientName: user?.name || 'You',
          subject: 'Property Inspection Scheduled',
          content: 'The annual property inspection has been scheduled for next week. Please coordinate with the tenant to ensure access.',
          timestamp: '2024-01-24T14:15:00Z',
          isRead: true,
          priority: 'medium',
          type: 'notification',
          propertyId: '2',
          propertyTitle: 'Victorian Terrace House'
        },
        {
          id: '3',
          senderId: 'maintenance1',
          senderName: 'Mike Wilson',
          senderRole: 'Maintenance',
          recipientId: user?.id || 'current-user',
          recipientName: user?.name || 'You',
          subject: 'Plumbing Repair Completed',
          content: 'The plumbing repair at the studio flat has been completed successfully. All fixtures are now working properly.',
          timestamp: '2024-01-23T16:45:00Z',
          isRead: true,
          priority: 'low',
          type: 'message',
          propertyId: '3',
          propertyTitle: 'Studio Flat City Center'
        },
        {
          id: '4',
          senderId: 'system',
          senderName: 'System',
          senderRole: 'System',
          recipientId: user?.id || 'current-user',
          recipientName: user?.name || 'You',
          subject: 'Rent Payment Overdue',
          content: 'Rent payment for Property #4 is now 5 days overdue. Please follow up with the tenant.',
          timestamp: '2024-01-22T09:00:00Z',
          isRead: false,
          priority: 'high',
          type: 'alert',
          propertyId: '4',
          propertyTitle: 'Luxury Penthouse'
        }
      ];

      // Mock contacts
      const mockContacts: Contact[] = [
        {
          id: 'tenant1',
          name: 'John Smith',
          role: 'Tenant',
          email: 'john.smith@email.com',
          phone: '+44 7700 900123',
          lastContact: '2024-01-25T10:30:00Z',
          isOnline: true
        },
        {
          id: 'landlord1',
          name: 'Sarah Johnson',
          role: 'Landlord',
          email: 'sarah.johnson@email.com',
          phone: '+44 7700 900456',
          lastContact: '2024-01-24T14:15:00Z',
          isOnline: false
        },
        {
          id: 'maintenance1',
          name: 'Mike Wilson',
          role: 'Maintenance',
          email: 'mike.wilson@email.com',
          phone: '+44 7700 900789',
          lastContact: '2024-01-23T16:45:00Z',
          isOnline: true
        },
        {
          id: 'agent1',
          name: 'Emma Davis',
          role: 'Agent',
          email: 'emma.davis@email.com',
          phone: '+44 7700 900321',
          lastContact: '2024-01-21T11:20:00Z',
          isOnline: false
        }
      ];

      setMessages(mockMessages);
      setContacts(mockContacts);
      setLoading(false);
    };

    fetchCommunicationData();
  }, [user]);

  const filteredMessages = messages.filter(message => {
    const matchesSearch = message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.senderName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || message.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const unreadCount = messages.filter(m => !m.isRead).length;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'message': return <MessageSquare className="h-4 w-4" />;
      case 'notification': return <Mail className="h-4 w-4" />;
      case 'alert': return <Star className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const markAsRead = (messageId: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, isRead: true } : msg
    ));
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedContact) return;

    const message: Message = {
      id: Date.now().toString(),
      senderId: user?.id || 'current-user',
      senderName: user?.name || 'You',
      senderRole: user?.role || 'User',
      recipientId: selectedContact.id,
      recipientName: selectedContact.name,
      subject: 'New Message',
      content: newMessage,
      timestamp: new Date().toISOString(),
      isRead: true,
      priority: 'medium',
      type: 'message'
    };

    setMessages(prev => [message, ...prev]);
    setNewMessage('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Communications</h1>
          <p className="text-gray-600">Manage messages and stay connected</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowCompose(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Compose
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MessageSquare className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Messages</p>
              <p className="text-2xl font-semibold text-gray-900">{messages.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <Mail className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Unread</p>
              <p className="text-2xl font-semibold text-gray-900">{unreadCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <User className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Contacts</p>
              <p className="text-2xl font-semibold text-gray-900">{contacts.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Star className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">High Priority</p>
              <p className="text-2xl font-semibold text-gray-900">
                {messages.filter(m => m.priority === 'high').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Messages List */}
        <div className="lg:col-span-2">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="message">Messages</option>
              <option value="notification">Notifications</option>
              <option value="alert">Alerts</option>
            </select>
          </div>

          {/* Messages */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="divide-y divide-gray-200">
              {filteredMessages.map((message) => (
                <div 
                  key={message.id} 
                  className={`p-6 hover:bg-gray-50 cursor-pointer ${
                    !message.isRead ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                  }`}
                  onClick={() => markAsRead(message.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(message.type)}
                          <span className="font-medium text-gray-900">{message.senderName}</span>
                          <span className="text-sm text-gray-500">({message.senderRole})</span>
                        </div>
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(message.priority)}`}>
                          {message.priority.charAt(0).toUpperCase() + message.priority.slice(1)}
                        </span>
                        {!message.isRead && (
                          <span className="inline-flex w-2 h-2 bg-blue-600 rounded-full"></span>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{message.subject}</h3>
                      <p className="text-gray-600 mb-2 line-clamp-2">{message.content}</p>
                      {message.propertyTitle && (
                        <div className="text-sm text-blue-600 mb-2">
                          Property: {message.propertyTitle}
                        </div>
                      )}
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{new Date(message.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {filteredMessages.length === 0 && (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <div className="text-gray-500 mb-4">No messages found</div>
              <p className="text-sm text-gray-400">Try adjusting your search or filters.</p>
            </div>
          )}
        </div>

        {/* Contacts Sidebar */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Contacts</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {contacts.map((contact) => (
              <div 
                key={contact.id} 
                className={`p-4 hover:bg-gray-50 cursor-pointer ${
                  selectedContact?.id === contact.id ? 'bg-blue-50' : ''
                }`}
                onClick={() => setSelectedContact(contact)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-gray-600" />
                      </div>
                      {contact.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{contact.name}</p>
                      <p className="text-xs text-gray-500">{contact.role}</p>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                      <Phone className="h-4 w-4" />
                    </button>
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                      <Mail className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Message */}
          {selectedContact && (
            <div className="p-4 border-t border-gray-200">
              <div className="mb-3">
                <p className="text-sm font-medium text-gray-900">Message {selectedContact.name}</p>
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardCommunications;