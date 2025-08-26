import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/badge';
import { Textarea } from '../components/ui/Textarea';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { ScrollArea } from '../components/ui/scroll-area';
import { Separator } from '../components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  MessageCircle,
  Send,
  Paperclip,
  Smile,
  Phone,
  Video,
  MoreVertical,
  Search,
  Plus,
  Users,
  Archive,
  Pin,
  VolumeX,
  Trash2,
  Edit,
  Reply,
  Forward,
  Heart,
  ThumbsUp,
  Laugh,
  Angry,
  Frown,
  CheckCheck,
  Clock,
  AlertCircle,
  X,
} from 'lucide-react';
import { useMessaging } from '../hooks/useMessaging';
import { useNotifications } from '../hooks/useNotifications';
import { useTypingIndicator, useInputTyping, formatTypingUsers } from '../hooks/useTypingIndicator';
import { Conversation, Message, MessageReaction } from '../services/messaging.service';
import { toast } from 'sonner';

interface ConversationListProps {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  onSelectConversation: (conversation: Conversation) => void;
  onCreateConversation: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

function ConversationList({
  conversations,
  activeConversation,
  onSelectConversation,
  onCreateConversation,
  searchQuery,
  onSearchChange,
}: ConversationListProps) {
  const filteredConversations = conversations.filter(conv =>
    conv.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.participants.some(p => 
      p.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.lastName.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const formatLastMessage = (message: Message | undefined) => {
    if (!message) return 'No messages yet';
    
    if (message.attachments?.length > 0) {
      return `📎 ${message.attachments[0].originalName}`;
    }
    
    return message.content || 'Message';
  };

  const formatTime = (date: Date | string) => {
    const messageDate = new Date(date);
    const now = new Date();
    const diffInHours = (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return messageDate.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
    }
    
    return messageDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="w-80 border-r bg-gray-50 flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Messages</h2>
          <Button size="sm" onClick={onCreateConversation}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2">
          {filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => onSelectConversation(conversation)}
              className={`p-3 rounded-lg cursor-pointer transition-colors mb-1 ${
                activeConversation?.id === conversation.id
                  ? 'bg-blue-100 border border-blue-200'
                  : 'hover:bg-gray-100'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="relative">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={conversation.avatar} />
                    <AvatarFallback>
                      {conversation.type === 'group' ? (
                        <Users className="w-5 h-5" />
                      ) : (
                        conversation.participants[0]?.firstName[0] || 'U'
                      )}
                    </AvatarFallback>
                  </Avatar>
                  {conversation.participants.some(p => p.isActive) && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-sm truncate">
                      {conversation.title || 
                        conversation.participants
                          .map(p => `${p.firstName} ${p.lastName}`)
                          .join(', ')
                      }
                    </h3>
                    <div className="flex items-center space-x-1">
                      {conversation.isPinned && (
                        <Pin className="w-3 h-3 text-gray-400" />
                      )}
                      {conversation.isMuted && (
                        <VolumeX className="w-3 h-3 text-gray-400" />
                      )}
                      <span className="text-xs text-gray-500">
                        {formatTime(conversation.lastActivityAt)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-sm text-gray-600 truncate">
                      {formatLastMessage(conversation.lastMessage)}
                    </p>
                    {conversation.unreadCount > 0 && (
                      <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                        {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  onReaction: (messageId: string, emoji: string) => void;
  onReply: (message: Message) => void;
  onForward: (message: Message) => void;
  onEdit: (message: Message) => void;
  onDelete: (messageId: string) => void;
}

function MessageList({
  messages,
  currentUserId,
  onReaction,
  onReply,
  onForward,
  onEdit,
  onDelete,
}: MessageListProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const formatMessageTime = (date: Date | string) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const getMessageStatus = (message: Message) => {
    if (message.senderId !== currentUserId) return null;
    
    switch (message.status) {
      case 'sent':
        return <Clock className="w-3 h-3 text-gray-400" />;
      case 'delivered':
        return <CheckCheck className="w-3 h-3 text-gray-400" />;
      case 'read':
        return <CheckCheck className="w-3 h-3 text-blue-500" />;
      case 'failed':
        return <AlertCircle className="w-3 h-3 text-red-500" />;
      default:
        return null;
    }
  };

  const reactionEmojis = ['👍', '❤️', '😂', '😮', '😢', '😡'];

  return (
    <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
      <div className="space-y-4">
        {messages.map((message, index) => {
          const isOwn = message.senderId === currentUserId;
          const showAvatar = !isOwn && (
            index === 0 || 
            messages[index - 1].senderId !== message.senderId
          );
          
          return (
            <div
              key={message.id}
              className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group`}
            >
              <div className={`flex max-w-[70%] ${isOwn ? 'flex-row-reverse' : 'flex-row'} items-end space-x-2`}>
                {showAvatar && !isOwn && (
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={message.sender.avatar} />
                    <AvatarFallback>
                      {message.sender.firstName[0]}
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div className={`${showAvatar ? '' : 'ml-10'} ${isOwn ? 'mr-0' : ''}`}>
                  <div
                    className={`relative px-4 py-2 rounded-lg ${
                      isOwn
                        ? 'bg-blue-500 text-white'
                        : 'bg-white border border-gray-200'
                    }`}
                    onMouseEnter={() => setSelectedMessage(message.id)}
                    onMouseLeave={() => setSelectedMessage(null)}
                  >
                    {!isOwn && showAvatar && (
                      <p className="text-xs font-medium mb-1 text-gray-600">
                        {message.sender.firstName} {message.sender.lastName}
                      </p>
                    )}
                    
                    {message.replyTo && (
                      <div className={`text-xs p-2 rounded mb-2 border-l-2 ${
                        isOwn 
                          ? 'bg-blue-400 border-blue-300' 
                          : 'bg-gray-50 border-gray-300'
                      }`}>
                        <p className="font-medium">
                          {message.replyTo.sender.firstName} {message.replyTo.sender.lastName}
                        </p>
                        <p className="truncate">{message.replyTo.content}</p>
                      </div>
                    )}
                    
                    <p className="text-sm">{message.content}</p>
                    
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {message.attachments.map((attachment) => (
                          <div
                            key={attachment.id}
                            className={`flex items-center space-x-2 p-2 rounded ${
                              isOwn ? 'bg-blue-400' : 'bg-gray-100'
                            }`}
                          >
                            <Paperclip className="w-4 h-4" />
                            <span className="text-sm truncate">
                              {attachment.originalName}
                            </span>
                            <span className="text-xs opacity-75">
                              ({Math.round(attachment.size / 1024)}KB)
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {message.reactions && message.reactions.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {Object.entries(
                          message.reactions.reduce((acc, reaction) => {
                            acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
                            return acc;
                          }, {} as Record<string, number>)
                        ).map(([emoji, count]) => (
                          <button
                            key={emoji}
                            onClick={() => onReaction(message.id, emoji)}
                            className={`text-xs px-2 py-1 rounded-full border ${
                              message.reactions.some(r => r.emoji === emoji && r.userId === currentUserId)
                                ? 'bg-blue-100 border-blue-300'
                                : 'bg-gray-100 border-gray-300'
                            }`}
                          >
                            {emoji} {count}
                          </button>
                        ))}
                      </div>
                    )}
                    
                    <div className={`flex items-center justify-between mt-1 text-xs ${
                      isOwn ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      <span>{formatMessageTime(message.createdAt)}</span>
                      <div className="flex items-center space-x-1">
                        {message.isImportant && (
                          <span className="text-red-500">!</span>
                        )}
                        {getMessageStatus(message)}
                      </div>
                    </div>
                    
                    {/* Message actions */}
                    {selectedMessage === message.id && (
                      <div className={`absolute top-0 ${isOwn ? 'left-0' : 'right-0'} transform ${
                        isOwn ? '-translate-x-full' : 'translate-x-full'
                      } flex items-center space-x-1 bg-white border rounded-lg shadow-lg p-1`}>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onReply(message)}
                          className="p-1 h-6 w-6"
                        >
                          <Reply className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onForward(message)}
                          className="p-1 h-6 w-6"
                        >
                          <Forward className="w-3 h-3" />
                        </Button>
                        {reactionEmojis.map((emoji) => (
                          <Button
                            key={emoji}
                            size="sm"
                            variant="ghost"
                            onClick={() => onReaction(message.id, emoji)}
                            className="p-1 h-6 w-6 text-xs"
                          >
                            {emoji}
                          </Button>
                        ))}
                        {isOwn && (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onEdit(message)}
                              className="p-1 h-6 w-6"
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onDelete(message.id)}
                              className="p-1 h-6 w-6 text-red-500"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}

interface MessageInputProps {
  conversationId: string;
  onSendMessage: (content: string, attachments?: File[]) => void;
  replyTo?: Message | null;
  onCancelReply?: () => void;
  editingMessage?: Message | null;
  onCancelEdit?: () => void;
  onUpdateMessage?: (messageId: string, content: string) => void;
}

function MessageInput({
  conversationId,
  onSendMessage,
  replyTo,
  onCancelReply,
  editingMessage,
  onCancelEdit,
  onUpdateMessage,
}: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const { handleInputChange, handleInputBlur, handleSubmit } = useInputTyping(conversationId);

  useEffect(() => {
    if (editingMessage) {
      setMessage(editingMessage.content || '');
    }
  }, [editingMessage]);

  const handleSend = () => {
    if (!message.trim() && attachments.length === 0) return;
    
    if (editingMessage && onUpdateMessage) {
      onUpdateMessage(editingMessage.id, message);
      onCancelEdit?.();
    } else {
      onSendMessage(message, attachments);
    }
    
    setMessage('');
    setAttachments([]);
    handleSubmit();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="border-t bg-white p-4">
      {(replyTo || editingMessage) && (
        <div className="mb-3 p-3 bg-gray-50 rounded-lg border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">
                {editingMessage ? 'Editing message' : `Replying to ${replyTo?.sender.firstName}`}
              </p>
              <p className="text-sm text-gray-600 truncate">
                {(editingMessage || replyTo)?.content}
              </p>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={editingMessage ? onCancelEdit : onCancelReply}
              className="p-1 h-6 w-6"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
      
      {attachments.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {attachments.map((file, index) => (
            <div key={index} className="flex items-center space-x-2 bg-gray-100 rounded-lg p-2">
              <Paperclip className="w-4 h-4 text-gray-500" />
              <span className="text-sm truncate max-w-32">{file.name}</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => removeAttachment(index)}
                className="p-1 h-5 w-5"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
      
      <div className="flex items-end space-x-2">
        <div className="flex-1">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              handleInputChange(e.target.value);
            }}
            onBlur={handleInputBlur}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="min-h-[40px] max-h-32 resize-none"
            rows={1}
          />
        </div>
        
        <div className="flex items-center space-x-1">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            size="sm"
            variant="ghost"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 h-10 w-10"
          >
            <Paperclip className="w-4 h-4" />
          </Button>
          
          <Button
            size="sm"
            onClick={handleSend}
            disabled={!message.trim() && attachments.length === 0}
            className="p-2 h-10 w-10"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function Communications() {
  const [searchQuery, setSearchQuery] = useState('');
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [showCreateConversation, setShowCreateConversation] = useState(false);
  
  const {
    conversations,
    activeConversation,
    messages,
    isLoading,
    isConnected,
    connectionState,
    error,
    unreadCount,
    connect,
    disconnect,
    loadConversations,
    selectConversation,
    sendMessage,
    updateMessage,
    deleteMessage,
    addReaction,
    removeReaction,
    uploadFiles,
  } = useMessaging();
  
  const { typingUsers } = useTypingIndicator(activeConversation?.id);
  
  const {
    notifications,
    unreadCount: notificationCount,
    requestPermission,
  } = useNotifications();

  // Initialize connection
  useEffect(() => {
    const initializeMessaging = async () => {
      try {
        // Get auth token and user ID from your auth system
        const token = localStorage.getItem('auth_token');
        const userId = localStorage.getItem('user_id');
        
        if (token && userId) {
          await connect(token, userId);
          await loadConversations();
        }
      } catch (error) {
        console.error('Failed to initialize messaging:', error);
        toast.error('Failed to connect to messaging service');
      }
    };

    initializeMessaging();
    
    // Request notification permission
    requestPermission();
    
    return () => {
      disconnect();
    };
  }, []);

  const handleSelectConversation = async (conversation: Conversation) => {
    try {
      await selectConversation(conversation.id);
      setReplyTo(null);
      setEditingMessage(null);
    } catch (error) {
      toast.error('Failed to load conversation');
    }
  };

  const handleSendMessage = async (content: string, attachments?: File[]) => {
    if (!activeConversation) return;
    
    try {
      let attachmentIds: string[] = [];
      
      if (attachments && attachments.length > 0) {
        const uploadedFiles = await uploadFiles(attachments);
        attachmentIds = uploadedFiles.map(file => file.id);
      }
      
      await sendMessage({
        conversationId: activeConversation.id,
        content,
        attachmentIds,
        replyToId: replyTo?.id,
      });
      
      setReplyTo(null);
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const handleUpdateMessage = async (messageId: string, content: string) => {
    try {
      await updateMessage(messageId, { content });
      setEditingMessage(null);
      toast.success('Message updated');
    } catch (error) {
      toast.error('Failed to update message');
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await deleteMessage(messageId);
      toast.success('Message deleted');
    } catch (error) {
      toast.error('Failed to delete message');
    }
  };

  const handleReaction = (messageId: string, emoji: string) => {
    const message = messages.find(m => m.id === messageId);
    const currentUserId = localStorage.getItem('user_id');
    
    if (!message || !currentUserId) return;
    
    const existingReaction = message.reactions.find(
      r => r.userId === currentUserId && r.emoji === emoji
    );
    
    if (existingReaction) {
      removeReaction(messageId, emoji);
    } else {
      addReaction(messageId, emoji);
    }
  };

  const handleReply = (message: Message) => {
    setReplyTo(message);
    setEditingMessage(null);
  };

  const handleEdit = (message: Message) => {
    setEditingMessage(message);
    setReplyTo(null);
  };

  const handleForward = (message: Message) => {
    // TODO: Implement forward functionality
    toast.info('Forward functionality coming soon');
  };

  const handleCreateConversation = () => {
    setShowCreateConversation(true);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              <span>Connection Error</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} className="w-full">
              Retry Connection
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">Communications</h1>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                connectionState === 'connected' ? 'bg-green-500' : 
                connectionState === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
              }`} />
              <span className="text-sm text-gray-600 capitalize">
                {connectionState}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {unreadCount > 0 && (
              <Badge variant="destructive">
                {unreadCount} unread
              </Badge>
            )}
            {notificationCount > 0 && (
              <Badge variant="secondary">
                {notificationCount} notifications
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Conversation List */}
        <ConversationList
          conversations={conversations}
          activeConversation={activeConversation}
          onSelectConversation={handleSelectConversation}
          onCreateConversation={handleCreateConversation}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {activeConversation ? (
            <>
              {/* Chat Header */}
              <div className="bg-white border-b px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={activeConversation.avatar} />
                      <AvatarFallback>
                        {activeConversation.type === 'group' ? (
                          <Users className="w-5 h-5" />
                        ) : (
                          activeConversation.participants[0]?.firstName[0] || 'U'
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="font-semibold">
                        {activeConversation.title || 
                          activeConversation.participants
                            .map(p => `${p.firstName} ${p.lastName}`)
                            .join(', ')
                        }
                      </h2>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        {activeConversation.participants.some(p => p.isActive) && (
                          <span className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                            <span>Online</span>
                          </span>
                        )}
                        {typingUsers.length > 0 && (
                          <span className="text-blue-600">
                            {formatTypingUsers(typingUsers)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="ghost">
                      <Phone className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Video className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <MessageList
                messages={messages}
                currentUserId={localStorage.getItem('user_id') || ''}
                onReaction={handleReaction}
                onReply={handleReply}
                onForward={handleForward}
                onEdit={handleEdit}
                onDelete={handleDeleteMessage}
              />

              {/* Message Input */}
              <MessageInput
                conversationId={activeConversation.id}
                onSendMessage={handleSendMessage}
                replyTo={replyTo}
                onCancelReply={() => setReplyTo(null)}
                editingMessage={editingMessage}
                onCancelEdit={() => setEditingMessage(null)}
                onUpdateMessage={handleUpdateMessage}
              />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Select a conversation
                </h3>
                <p className="text-gray-500">
                  Choose a conversation from the list to start messaging
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}