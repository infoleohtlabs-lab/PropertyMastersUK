import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  Phone,
  Video,
  Mail,
  Bell,
  Search,
  Filter,
  MoreHorizontal,
  Paperclip,
  Smile,
  Image,
  File,
  Calendar,
  Clock,
  User,
  Users,
  Star,
  Archive,
  Trash2,
  Edit,
  Reply,
  Forward,
  Download,
  Upload,
  Settings,
  Plus,
  X,
  Check,
  CheckCheck,
  AlertCircle,
  Info,
  Zap,
  Shield,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  ScreenShare,
  PhoneCall,
  PhoneOff,
  UserPlus,
  UserMinus,
  Hash,
  AtSign,
  Link,
  MapPin,
  Home,
  Building,
  Banknote,
  TrendingUp,
  Activity,
  Bookmark,
  Tag,
  Flag,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  RotateCcw,
  Share2,
  ExternalLink,
  Copy,
  Printer,
  FileText,
  Image as ImageIcon,
  VideoIcon,
  Music,
  FileArchive,
  FileCode,
  FileSpreadsheet,
  Folder,
  FolderOpen,
  HardDrive,
  Cloud,
  Upload as CloudUpload,
  Download as CloudDownload,
  Wifi,
  WifiOff,
  Signal,
  Battery,
  BatteryLow,
  Power,
  PowerOff,
  Pin
} from 'lucide-react';
import { Button } from './ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { showToast } from './ui/Toast';

interface CommunicationToolsProps {
  userRole: 'agent' | 'landlord' | 'tenant' | 'buyer';
  userId: string;
  onMessageSend?: (message: Message) => void;
  onCallInitiate?: (contact: Contact, type: 'voice' | 'video') => void;
  className?: string;
}

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  role: 'agent' | 'landlord' | 'tenant' | 'buyer' | 'admin';
  status: 'online' | 'offline' | 'away' | 'busy';
  lastSeen: string;
  isVerified: boolean;
  rating?: number;
  company?: string;
  properties?: string[];
  tags: string[];
  notes?: string;
  preferences: {
    contactMethod: 'email' | 'phone' | 'sms' | 'app';
    availability: {
      timezone: string;
      workingHours: { start: string; end: string };
      workingDays: string[];
    };
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
      marketing: boolean;
    };
  };
}

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  sender: Contact;
  recipientId: string;
  recipient: Contact;
  content: string;
  type: 'text' | 'image' | 'file' | 'property' | 'booking' | 'system';
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  attachments?: {
    id: string;
    name: string;
    type: string;
    size: number;
    url: string;
  }[];
  metadata?: {
    propertyId?: string;
    bookingId?: string;
    location?: { lat: number; lng: number };
    quotedMessage?: string;
    isEdited?: boolean;
    editedAt?: string;
  };
  reactions?: {
    emoji: string;
    userId: string;
    timestamp: string;
  }[];
  isImportant: boolean;
  isArchived: boolean;
}

interface Conversation {
  id: string;
  participants: Contact[];
  lastMessage: Message;
  unreadCount: number;
  isGroup: boolean;
  groupName?: string;
  groupAvatar?: string;
  createdAt: string;
  updatedAt: string;
  isArchived: boolean;
  isMuted: boolean;
  isPinned: boolean;
  tags: string[];
  propertyContext?: {
    propertyId: string;
    propertyTitle: string;
    propertyAddress: string;
  };
}

interface Notification {
  id: string;
  type: 'message' | 'booking' | 'property' | 'system' | 'marketing';
  title: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actionUrl?: string;
  metadata?: {
    senderId?: string;
    propertyId?: string;
    bookingId?: string;
  };
}

interface CommunicationState {
  conversations: Conversation[];
  filteredConversations: Conversation[];
  selectedConversation: Conversation | null;
  messages: Message[];
  contacts: Contact[];
  notifications: Notification[];
  unreadNotifications: number;
  loading: boolean;
  searchQuery: string;
  filters: {
    status: string[];
    role: string[];
    tags: string[];
    dateRange: { start: string; end: string };
  };
  activeCall?: {
    contact: Contact;
    type: 'voice' | 'video';
    status: 'connecting' | 'connected' | 'ended';
    duration: number;
    isMuted: boolean;
    isVideoEnabled: boolean;
  };
  showContactModal: boolean;
  showNotifications: boolean;
  showCallModal: boolean;
  selectedContact: Contact | null;
  messageInput: string;
  isTyping: boolean;
  typingUsers: string[];
  onlineUsers: string[];
}

const CommunicationTools: React.FC<CommunicationToolsProps> = ({
  userRole,
  userId,
  onMessageSend,
  onCallInitiate,
  className = ''
}) => {
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [state, setState] = useState<CommunicationState>({
    conversations: [],
    filteredConversations: [],
    selectedConversation: null,
    messages: [],
    contacts: [],
    notifications: [],
    unreadNotifications: 0,
    loading: false,
    searchQuery: '',
    filters: {
      status: [],
      role: [],
      tags: [],
      dateRange: { start: '', end: '' }
    },
    showContactModal: false,
    showNotifications: false,
    showCallModal: false,
    selectedContact: null,
    messageInput: '',
    isTyping: false,
    typingUsers: [],
    onlineUsers: []
  });

  // Mock data
  const mockContacts: Contact[] = [
    {
      id: 'contact1',
      name: 'Sarah Johnson',
      email: 'sarah@primeproperties.co.uk',
      phone: '+44 20 1234 5678',
      avatar: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20headshot%20woman&image_size=square',
      role: 'agent',
      status: 'online',
      lastSeen: '2024-01-25T10:30:00Z',
      isVerified: true,
      rating: 4.8,
      company: 'Prime Properties',
      tags: ['premium', 'residential'],
      preferences: {
        contactMethod: 'email',
        availability: {
          timezone: 'Europe/London',
          workingHours: { start: '09:00', end: '18:00' },
          workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
        },
        notifications: {
          email: true,
          sms: true,
          push: true,
          marketing: false
        }
      }
    },
    {
      id: 'contact2',
      name: 'John Smith',
      email: 'john.smith@email.com',
      phone: '+44 7700 123456',
      avatar: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20headshot%20man&image_size=square',
      role: 'buyer',
      status: 'away',
      lastSeen: '2024-01-25T09:15:00Z',
      isVerified: true,
      tags: ['first-time-buyer', 'urgent'],
      preferences: {
        contactMethod: 'phone',
        availability: {
          timezone: 'Europe/London',
          workingHours: { start: '08:00', end: '20:00' },
          workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
        },
        notifications: {
          email: true,
          sms: true,
          push: true,
          marketing: true
        }
      }
    },
    {
      id: 'contact3',
      name: 'Emma Wilson',
      email: 'emma.wilson@email.com',
      phone: '+44 7700 234567',
      avatar: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20headshot%20woman%20young&image_size=square',
      role: 'tenant',
      status: 'offline',
      lastSeen: '2024-01-24T22:45:00Z',
      isVerified: false,
      tags: ['student', 'shared-accommodation'],
      preferences: {
        contactMethod: 'app',
        availability: {
          timezone: 'Europe/London',
          workingHours: { start: '10:00', end: '22:00' },
          workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
        },
        notifications: {
          email: false,
          sms: false,
          push: true,
          marketing: false
        }
      }
    }
  ];

  const mockMessages: Message[] = [
    {
      id: 'msg1',
      conversationId: 'conv1',
      senderId: 'contact1',
      sender: mockContacts[0],
      recipientId: userId,
      recipient: mockContacts[1],
      content: 'Hi John! I have some great properties that match your criteria. Would you like to schedule a viewing?',
      type: 'text',
      timestamp: '2024-01-25T10:30:00Z',
      status: 'read',
      isImportant: false,
      isArchived: false
    },
    {
      id: 'msg2',
      conversationId: 'conv1',
      senderId: userId,
      sender: mockContacts[1],
      recipientId: 'contact1',
      recipient: mockContacts[0],
      content: 'That sounds perfect! I\'m particularly interested in properties with gardens and good transport links.',
      type: 'text',
      timestamp: '2024-01-25T10:35:00Z',
      status: 'read',
      isImportant: false,
      isArchived: false
    },
    {
      id: 'msg3',
      conversationId: 'conv1',
      senderId: 'contact1',
      sender: mockContacts[0],
      recipientId: userId,
      recipient: mockContacts[1],
      content: 'I have the perfect property for you! Let me share the details.',
      type: 'property',
      timestamp: '2024-01-25T10:40:00Z',
      status: 'delivered',
      metadata: {
        propertyId: 'prop1'
      },
      isImportant: true,
      isArchived: false
    }
  ];

  const mockConversations: Conversation[] = [
    {
      id: 'conv1',
      participants: [mockContacts[0], mockContacts[1]],
      lastMessage: mockMessages[2],
      unreadCount: 1,
      isGroup: false,
      createdAt: '2024-01-25T10:30:00Z',
      updatedAt: '2024-01-25T10:40:00Z',
      isArchived: false,
      isMuted: false,
      isPinned: true,
      tags: ['urgent', 'viewing'],
      propertyContext: {
        propertyId: 'prop1',
        propertyTitle: 'Modern 3-Bedroom House',
        propertyAddress: '15 Oak Street, Riverside Gardens'
      }
    },
    {
      id: 'conv2',
      participants: [mockContacts[2]],
      lastMessage: {
        ...mockMessages[0],
        id: 'msg4',
        conversationId: 'conv2',
        content: 'Hi Emma! Your rental application has been approved. When would you like to schedule the key handover?',
        timestamp: '2024-01-24T16:20:00Z'
      },
      unreadCount: 0,
      isGroup: false,
      createdAt: '2024-01-24T16:20:00Z',
      updatedAt: '2024-01-24T16:20:00Z',
      isArchived: false,
      isMuted: false,
      isPinned: false,
      tags: ['rental', 'approved']
    }
  ];

  const mockNotifications: Notification[] = [
    {
      id: 'notif1',
      type: 'message',
      title: 'New message from Sarah Johnson',
      content: 'I have the perfect property for you! Let me share the details.',
      timestamp: '2024-01-25T10:40:00Z',
      isRead: false,
      priority: 'high',
      metadata: {
        senderId: 'contact1'
      }
    },
    {
      id: 'notif2',
      type: 'booking',
      title: 'Viewing confirmed',
      content: 'Your property viewing for tomorrow at 2:00 PM has been confirmed.',
      timestamp: '2024-01-25T09:15:00Z',
      isRead: false,
      priority: 'medium',
      metadata: {
        bookingId: 'booking1'
      }
    },
    {
      id: 'notif3',
      type: 'property',
      title: 'New property match',
      content: 'A new property matching your criteria has been listed.',
      timestamp: '2024-01-25T08:30:00Z',
      isRead: true,
      priority: 'low',
      metadata: {
        propertyId: 'prop2'
      }
    }
  ];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [state.conversations, state.searchQuery, state.filters]);

  useEffect(() => {
    if (state.selectedConversation) {
      loadMessages(state.selectedConversation.id);
    }
  }, [state.selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [state.messages]);

  const loadData = async () => {
    setState(prev => ({ ...prev, loading: true }));
    
    // Simulate API calls
    setTimeout(() => {
      setState(prev => ({
        ...prev,
        conversations: mockConversations,
        contacts: mockContacts,
        notifications: mockNotifications,
        unreadNotifications: mockNotifications.filter(n => !n.isRead).length,
        onlineUsers: mockContacts.filter(c => c.status === 'online').map(c => c.id),
        loading: false
      }));
    }, 1000);
  };

  const loadMessages = async (conversationId: string) => {
    // Simulate loading messages for conversation
    const conversationMessages = mockMessages.filter(m => m.conversationId === conversationId);
    setState(prev => ({ ...prev, messages: conversationMessages }));
  };

  const applyFilters = () => {
    let filtered = [...state.conversations];

    // Search filter
    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase();
      filtered = filtered.filter(conv =>
        conv.participants.some(p => 
          p.name.toLowerCase().includes(query) ||
          p.email.toLowerCase().includes(query)
        ) ||
        conv.lastMessage.content.toLowerCase().includes(query) ||
        conv.propertyContext?.propertyTitle.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (state.filters.status.length > 0) {
      filtered = filtered.filter(conv =>
        conv.participants.some(p => state.filters.status.includes(p.status))
      );
    }

    // Role filter
    if (state.filters.role.length > 0) {
      filtered = filtered.filter(conv =>
        conv.participants.some(p => state.filters.role.includes(p.role))
      );
    }

    // Tags filter
    if (state.filters.tags.length > 0) {
      filtered = filtered.filter(conv =>
        state.filters.tags.some(tag => conv.tags.includes(tag))
      );
    }

    setState(prev => ({ ...prev, filteredConversations: filtered }));
  };

  const handleSendMessage = async () => {
    if (!state.messageInput.trim() || !state.selectedConversation) return;

    const newMessage: Message = {
      id: `msg_${Date.now()}`,
      conversationId: state.selectedConversation.id,
      senderId: userId,
      sender: mockContacts.find(c => c.id === userId) || mockContacts[1],
      recipientId: state.selectedConversation.participants[0].id,
      recipient: state.selectedConversation.participants[0],
      content: state.messageInput,
      type: 'text',
      timestamp: new Date().toISOString(),
      status: 'sent',
      isImportant: false,
      isArchived: false
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage],
      messageInput: ''
    }));

    if (onMessageSend) {
      onMessageSend(newMessage);
    }

    // Simulate message delivery
    setTimeout(() => {
      setState(prev => ({
        ...prev,
        messages: prev.messages.map(m => 
          m.id === newMessage.id ? { ...m, status: 'delivered' } : m
        )
      }));
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      // Handle file upload logic here
      showToast.info(`Uploading ${files.length} file(s)...`);
    }
  };

  const initiateCall = (contact: Contact, type: 'voice' | 'video') => {
    setState(prev => ({
      ...prev,
      activeCall: {
        contact,
        type,
        status: 'connecting',
        duration: 0,
        isMuted: false,
        isVideoEnabled: type === 'video'
      },
      showCallModal: true
    }));

    if (onCallInitiate) {
      onCallInitiate(contact, type);
    }

    // Simulate call connection
    setTimeout(() => {
      setState(prev => ({
        ...prev,
        activeCall: prev.activeCall ? {
          ...prev.activeCall,
          status: 'connected'
        } : undefined
      }));
    }, 3000);
  };

  const endCall = () => {
    setState(prev => ({
      ...prev,
      activeCall: undefined,
      showCallModal: false
    }));
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short'
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <Check className="h-3 w-3 text-gray-400" />;
      case 'delivered': return <CheckCheck className="h-3 w-3 text-gray-400" />;
      case 'read': return <CheckCheck className="h-3 w-3 text-blue-500" />;
      default: return <Clock className="h-3 w-3 text-gray-400" />;
    }
  };

  const ConversationItem: React.FC<{ conversation: Conversation }> = ({ conversation }) => {
    const otherParticipant = conversation.participants.find(p => p.id !== userId) || conversation.participants[0];
    const isSelected = state.selectedConversation?.id === conversation.id;

    return (
      <div
        onClick={() => setState(prev => ({ ...prev, selectedConversation: conversation }))}
        className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${
          isSelected ? 'bg-blue-50 border-blue-200' : ''
        }`}
      >
        <div className="flex items-center space-x-3">
          {/* Avatar */}
          <div className="relative">
            <img
              src={otherParticipant.avatar || 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20avatar%20placeholder&image_size=square'}
              alt={otherParticipant.name}
              className="w-12 h-12 rounded-full"
            />
            <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
              getStatusColor(otherParticipant.status)
            }`} />
            {otherParticipant.isVerified && (
              <div className="absolute -top-1 -right-1 bg-blue-500 text-white rounded-full p-1">
                <Check className="h-2 w-2" />
              </div>
            )}
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <h3 className="font-medium text-gray-900 truncate">{otherParticipant.name}</h3>
                {conversation.isPinned && <Pin className="h-3 w-3 text-blue-500" />}
                {conversation.isMuted && <VolumeX className="h-3 w-3 text-gray-400" />}
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-xs text-gray-500">{formatTime(conversation.lastMessage.timestamp)}</span>
                {conversation.unreadCount > 0 && (
                  <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                    {conversation.unreadCount}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-1">
              <p className="text-sm text-gray-600 truncate">
                {conversation.lastMessage.type === 'property' ? (
                  <span className="flex items-center">
                    <Home className="h-3 w-3 mr-1" />
                    Property shared
                  </span>
                ) : (
                  conversation.lastMessage.content
                )}
              </p>
              {conversation.lastMessage.isImportant && (
                <Star className="h-3 w-3 text-yellow-500 fill-current" />
              )}
            </div>
            
            {/* Tags */}
            {conversation.tags.length > 0 && (
              <div className="flex space-x-1 mt-2">
                {conversation.tags.slice(0, 2).map((tag) => (
                  <span key={tag} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                    {tag}
                  </span>
                ))}
                {conversation.tags.length > 2 && (
                  <span className="text-gray-400 text-xs">+{conversation.tags.length - 2}</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`h-full flex ${className || ''}`}>
      {/* Conversations List */}
      <div className="w-1/3 border-r border-gray-200 bg-white">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
            <Button size="sm" onClick={() => setState(prev => ({ ...prev, showNewMessageModal: true }))}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={state.searchQuery}
              onChange={(e) => setState(prev => ({ ...prev, searchQuery: e.target.value }))}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        {/* Conversations */}
        <div className="overflow-y-auto h-full">
          {state.conversations.map((conversation) => (
            <ConversationItem key={conversation.id} conversation={conversation} />
          ))}
        </div>
      </div>
      
      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {state.selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img
                    src={state.selectedConversation.participants[0].avatar || 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20avatar%20placeholder&image_size=square'}
                    alt={state.selectedConversation.participants[0].name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <h3 className="font-medium text-gray-900">{state.selectedConversation.participants[0].name}</h3>
                    <p className="text-sm text-gray-500">{state.selectedConversation.participants[0].status}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => initiateCall(state.selectedConversation!.participants[0], 'voice')}
                  >
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => initiateCall(state.selectedConversation!.participants[0], 'video')}
                  >
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {state.messages.map((message) => (
                <div key={message.id} className={`flex ${message.senderId === userId ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.senderId === userId
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    <p>{message.content}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs opacity-75">{formatTime(message.timestamp)}</span>
                      {message.senderId === userId && getStatusIcon(message.status)}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            
            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" onClick={handleFileUpload}>
                  <Paperclip className="h-4 w-4" />
                </Button>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={state.messageInput}
                    onChange={(e) => setState(prev => ({ ...prev, messageInput: e.target.value }))}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <Button onClick={handleSendMessage} disabled={!state.messageInput.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
              <p className="text-gray-500">Choose a conversation from the list to start messaging</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileSelect}
      />
    </div>
  );
};

export default CommunicationTools;