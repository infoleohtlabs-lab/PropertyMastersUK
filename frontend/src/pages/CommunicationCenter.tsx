import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  Search,
  Filter,
  Phone,
  Video,
  Paperclip,
  MoreHorizontal,
  Bell,
  BellOff,
  Star,
  Archive,
  Trash2,
  Users,
  Settings,
  Circle,
  CheckCircle2,
  Clock,
  Image,
  File,
  Download,
  Eye,
  Plus,
  X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { useAuthStore } from '../stores/authStore';
import { showToast } from '../components/ui/Toast';

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: string;
  type: 'text' | 'image' | 'file' | 'system';
  attachments?: Attachment[];
  status: 'sent' | 'delivered' | 'read';
  replyTo?: string;
}

interface Conversation {
  id: string;
  participants: Participant[];
  lastMessage: Message;
  unreadCount: number;
  type: 'direct' | 'group' | 'support';
  title?: string;
  isArchived: boolean;
  isPinned: boolean;
  isMuted: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Participant {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  isOnline: boolean;
  lastSeen?: string;
}

interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  thumbnail?: string;
}

interface Notification {
  id: string;
  type: 'message' | 'mention' | 'system' | 'email';
  title: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
  priority: 'low' | 'medium' | 'high';
}

const CommunicationCenter: React.FC = () => {
  const { user } = useAuthStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'messages' | 'notifications' | 'contacts'>('messages');
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadCommunicationData();
    // Simulate real-time updates
    const interval = setInterval(() => {
      updateOnlineStatus();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadCommunicationData = async () => {
    try {
      // Mock data - replace with actual API calls
      const mockConversations: Conversation[] = [
        {
          id: 'conv1',
          participants: [
            {
              id: 'user1',
              name: 'Sarah Johnson',
              email: 'sarah.johnson@email.com',
              role: 'Client',
              isOnline: true
            },
            {
              id: user?.id || 'current',
              name: user?.name || 'You',
              email: user?.email || '',
              role: user?.role || 'Agent',
              isOnline: true
            }
          ],
          lastMessage: {
            id: 'msg1',
            conversationId: 'conv1',
            senderId: 'user1',
            senderName: 'Sarah Johnson',
            content: 'Hi, I have some questions about the property viewing tomorrow.',
            timestamp: new Date(Date.now() - 300000).toISOString(),
            type: 'text',
            status: 'delivered'
          },
          unreadCount: 2,
          type: 'direct',
          isArchived: false,
          isPinned: true,
          isMuted: false,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 300000).toISOString()
        },
        {
          id: 'conv2',
          participants: [
            {
              id: 'user2',
              name: 'Michael Brown',
              email: 'michael.brown@email.com',
              role: 'Landlord',
              isOnline: false,
              lastSeen: new Date(Date.now() - 3600000).toISOString()
            },
            {
              id: user?.id || 'current',
              name: user?.name || 'You',
              email: user?.email || '',
              role: user?.role || 'Agent',
              isOnline: true
            }
          ],
          lastMessage: {
            id: 'msg2',
            conversationId: 'conv2',
            senderId: user?.id || 'current',
            senderName: user?.name || 'You',
            content: 'I\'ll send you the maintenance report by end of day.',
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            type: 'text',
            status: 'read'
          },
          unreadCount: 0,
          type: 'direct',
          isArchived: false,
          isPinned: false,
          isMuted: false,
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          updatedAt: new Date(Date.now() - 7200000).toISOString()
        }
      ];

      const mockNotifications: Notification[] = [
        {
          id: 'notif1',
          type: 'message',
          title: 'New message from Sarah Johnson',
          content: 'Hi, I have some questions about the property viewing tomorrow.',
          timestamp: new Date(Date.now() - 300000).toISOString(),
          isRead: false,
          priority: 'medium'
        },
        {
          id: 'notif2',
          type: 'system',
          title: 'Property viewing scheduled',
          content: 'A new viewing has been scheduled for 15 Oak Street tomorrow at 2:00 PM.',
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          isRead: true,
          priority: 'high'
        }
      ];

      setConversations(mockConversations);
      setNotifications(mockNotifications);
      
      if (mockConversations.length > 0) {
        setSelectedConversation(mockConversations[0]);
        loadMessages(mockConversations[0].id);
      }
    } catch (error) {
      console.error('Error loading communication data:', error);
      showToast('Failed to load messages', 'error');
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      // Mock messages - replace with actual API call
      const mockMessages: Message[] = [
        {
          id: 'msg1',
          conversationId,
          senderId: 'user1',
          senderName: 'Sarah Johnson',
          content: 'Hi there! I\'m interested in viewing the property at 15 Oak Street.',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          type: 'text',
          status: 'read'
        },
        {
          id: 'msg2',
          conversationId,
          senderId: user?.id || 'current',
          senderName: user?.name || 'You',
          content: 'Hello Sarah! I\'d be happy to arrange a viewing for you. When would be convenient?',
          timestamp: new Date(Date.now() - 3300000).toISOString(),
          type: 'text',
          status: 'read'
        },
        {
          id: 'msg3',
          conversationId,
          senderId: 'user1',
          senderName: 'Sarah Johnson',
          content: 'Tomorrow afternoon would work well for me. Around 2 PM?',
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          type: 'text',
          status: 'read'
        },
        {
          id: 'msg4',
          conversationId,
          senderId: 'user1',
          senderName: 'Sarah Johnson',
          content: 'Hi, I have some questions about the property viewing tomorrow.',
          timestamp: new Date(Date.now() - 300000).toISOString(),
          type: 'text',
          status: 'delivered'
        }
      ];
      setMessages(mockMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
      showToast('Failed to load messages', 'error');
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const message: Message = {
        id: `msg_${Date.now()}`,
        conversationId: selectedConversation.id,
        senderId: user?.id || 'current',
        senderName: user?.name || 'You',
        content: newMessage,
        timestamp: new Date().toISOString(),
        type: 'text',
        status: 'sent'
      };

      setMessages(prev => [...prev, message]);
      setNewMessage('');
      
      // Update conversation last message
      setConversations(prev => prev.map(conv => 
        conv.id === selectedConversation.id 
          ? { ...conv, lastMessage: message, updatedAt: new Date().toISOString() }
          : conv
      ));

      showToast('Message sent', 'success');
    } catch (error) {
      console.error('Error sending message:', error);
      showToast('Failed to send message', 'error');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !selectedConversation) return;

    try {
      for (const file of Array.from(files)) {
        const attachment: Attachment = {
          id: `att_${Date.now()}`,
          name: file.name,
          type: file.type,
          size: file.size,
          url: URL.createObjectURL(file)
        };

        const message: Message = {
          id: `msg_${Date.now()}`,
          conversationId: selectedConversation.id,
          senderId: user?.id || 'current',
          senderName: user?.name || 'You',
          content: `Shared ${file.name}`,
          timestamp: new Date().toISOString(),
          type: file.type.startsWith('image/') ? 'image' : 'file',
          attachments: [attachment],
          status: 'sent'
        };

        setMessages(prev => [...prev, message]);
      }
      showToast('Files uploaded', 'success');
    } catch (error) {
      console.error('Error uploading files:', error);
      showToast('Failed to upload files', 'error');
    }
  };

  const markAsRead = (conversationId: string) => {
    setConversations(prev => prev.map(conv => 
      conv.id === conversationId 
        ? { ...conv, unreadCount: 0 }
        : conv
    ));
  };

  const updateOnlineStatus = () => {
    // Simulate online status updates
    const randomUsers = ['user1', 'user2', 'user3'];
    setOnlineUsers(randomUsers.filter(() => Math.random() > 0.5));
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
      return date.toLocaleDateString('en-GB');
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.participants.some(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase())
    ) || conv.lastMessage.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const unreadNotifications = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Communication Center</h1>
          <p className="text-gray-600">Manage all your conversations and notifications in one place</p>
        </div>

        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-200px)]">
          {/* Sidebar */}
          <div className="col-span-4 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col">
            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('messages')}
                className={`flex-1 px-4 py-3 text-sm font-medium ${
                  activeTab === 'messages'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <MessageSquare className="w-4 h-4 inline mr-2" />
                Messages
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`flex-1 px-4 py-3 text-sm font-medium relative ${
                  activeTab === 'notifications'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Bell className="w-4 h-4 inline mr-2" />
                Notifications
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadNotifications}
                  </span>
                )}
              </button>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder={activeTab === 'messages' ? 'Search conversations...' : 'Search notifications...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {activeTab === 'messages' && (
                <div className="space-y-1 p-2">
                  {filteredConversations.map((conversation) => {
                    const otherParticipant = conversation.participants.find(p => p.id !== user?.id);
                    return (
                      <div
                        key={conversation.id}
                        onClick={() => {
                          setSelectedConversation(conversation);
                          loadMessages(conversation.id);
                          markAsRead(conversation.id);
                        }}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedConversation?.id === conversation.id
                            ? 'bg-blue-50 border border-blue-200'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="relative">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 font-medium">
                                {otherParticipant?.name.charAt(0) || '?'}
                              </span>
                            </div>
                            {otherParticipant?.isOnline && (
                              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h3 className="text-sm font-medium text-gray-900 truncate">
                                {otherParticipant?.name || 'Unknown'}
                              </h3>
                              <span className="text-xs text-gray-500">
                                {formatTime(conversation.lastMessage.timestamp)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 truncate mt-1">
                              {conversation.lastMessage.content}
                            </p>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-xs text-gray-500">
                                {otherParticipant?.role}
                              </span>
                              {conversation.unreadCount > 0 && (
                                <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1">
                                  {conversation.unreadCount}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-1 p-2">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        notification.isRead ? 'bg-gray-50' : 'bg-blue-50 border border-blue-200'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          notification.isRead ? 'bg-gray-300' : 'bg-blue-500'
                        }`}></div>
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.content}
                          </p>
                          <span className="text-xs text-gray-500 mt-1 block">
                            {formatDate(notification.timestamp)} at {formatTime(notification.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* New Conversation Button */}
            {activeTab === 'messages' && (
              <div className="p-4 border-t border-gray-200">
                <Button
                  onClick={() => setShowNewConversation(true)}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Conversation
                </Button>
              </div>
            )}
          </div>

          {/* Main Chat Area */}
          <div className="col-span-8 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium">
                            {selectedConversation.participants.find(p => p.id !== user?.id)?.name.charAt(0) || '?'}
                          </span>
                        </div>
                        {selectedConversation.participants.find(p => p.id !== user?.id)?.isOnline && (
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                          {selectedConversation.participants.find(p => p.id !== user?.id)?.name || 'Unknown'}
                        </h2>
                        <p className="text-sm text-gray-500">
                          {selectedConversation.participants.find(p => p.id !== user?.id)?.isOnline 
                            ? 'Online' 
                            : `Last seen ${formatDate(selectedConversation.participants.find(p => p.id !== user?.id)?.lastSeen || '')}`
                          }
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Phone className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Video className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => {
                    const isOwn = message.senderId === user?.id;
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          isOwn 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-100 text-gray-900'
                        }`}>
                          {message.type === 'text' && (
                            <p className="text-sm">{message.content}</p>
                          )}
                          {message.type === 'image' && message.attachments && (
                            <div className="space-y-2">
                              <p className="text-sm">{message.content}</p>
                              {message.attachments.map((attachment) => (
                                <img
                                  key={attachment.id}
                                  src={attachment.url}
                                  alt={attachment.name}
                                  className="max-w-full h-auto rounded"
                                />
                              ))}
                            </div>
                          )}
                          {message.type === 'file' && message.attachments && (
                            <div className="space-y-2">
                              <p className="text-sm">{message.content}</p>
                              {message.attachments.map((attachment) => (
                                <div key={attachment.id} className="flex items-center space-x-2 p-2 bg-white bg-opacity-20 rounded">
                                  <File className="w-4 h-4" />
                                  <span className="text-sm truncate">{attachment.name}</span>
                                  <Button size="sm" variant="ghost">
                                    <Download className="w-3 h-3" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                          <div className="flex items-center justify-between mt-1">
                            <span className={`text-xs ${
                              isOwn ? 'text-blue-100' : 'text-gray-500'
                            }`}>
                              {formatTime(message.timestamp)}
                            </span>
                            {isOwn && (
                              <div className="flex items-center space-x-1">
                                {message.status === 'sent' && <Circle className="w-3 h-3 text-blue-100" />}
                                {message.status === 'delivered' && <CheckCircle2 className="w-3 h-3 text-blue-100" />}
                                {message.status === 'read' && <CheckCircle2 className="w-3 h-3 text-blue-100 fill-current" />}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 px-4 py-2 rounded-lg">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200">
                  <div className="flex items-center space-x-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      multiple
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Paperclip className="w-4 h-4" />
                    </Button>
                    <div className="flex-1 relative">
                      <Input
                        type="text"
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        className="pr-12"
                      />
                    </div>
                    <Button
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      className="px-4"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No conversation selected</h3>
                  <p className="text-gray-500">Choose a conversation from the sidebar to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Conversation Modal */}
      {showNewConversation && (
        <Modal
          isOpen={showNewConversation}
          onClose={() => setShowNewConversation(false)}
          title="Start New Conversation"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Users
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search by name or email..."
                  className="pl-10"
                />
              </div>
            </div>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {/* Mock user list */}
              {[
                { id: 'u1', name: 'John Smith', email: 'john.smith@email.com', role: 'Client' },
                { id: 'u2', name: 'Emma Wilson', email: 'emma.wilson@email.com', role: 'Landlord' },
                { id: 'u3', name: 'David Brown', email: 'david.brown@email.com', role: 'Tenant' }
              ].map((user) => (
                <div
                  key={user.id}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-medium">{user.name.charAt(0)}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900">{user.name}</h3>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    <span className="text-xs text-gray-400">{user.role}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowNewConversation(false)}
              >
                Cancel
              </Button>
              <Button onClick={() => setShowNewConversation(false)}>
                Start Conversation
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default CommunicationCenter;