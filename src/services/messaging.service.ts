import { WebSocketService } from './websocket.service';
import { apiClient } from './api';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  role: string;
  isOnline?: boolean;
  lastSeen?: Date;
}

export interface Conversation {
  id: string;
  type: 'direct' | 'group' | 'property_inquiry' | 'support';
  title?: string;
  description?: string;
  avatar?: string;
  propertyId?: string;
  createdBy: string;
  participants: User[];
  lastMessage?: Message;
  lastActivityAt: Date;
  isArchived: boolean;
  isMuted: boolean;
  isPinned: boolean;
  unreadCount: number;
  tags?: string[];
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  sender: User;
  type: 'text' | 'image' | 'file' | 'audio' | 'video' | 'system';
  content: string;
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  replyToId?: string;
  replyTo?: Message;
  forwardedFromId?: string;
  forwardedFrom?: Message;
  isImportant: boolean;
  isEdited: boolean;
  editedAt?: Date;
  isDeleted: boolean;
  deletedAt?: Date;
  readBy: string[];
  deliveredTo: string[];
  reactions: MessageReaction[];
  attachments: MessageAttachment[];
  metadata?: Record<string, any>;
  scheduledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface MessageReaction {
  id: string;
  messageId: string;
  userId: string;
  user: User;
  emoji: string;
  createdAt: Date;
}

export interface MessageAttachment {
  id: string;
  messageId: string;
  fileName: string;
  originalName: string;
  type: 'image' | 'video' | 'audio' | 'document' | 'archive' | 'other';
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
  duration?: number;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface CreateConversationDto {
  type: 'direct' | 'group' | 'property_inquiry' | 'support';
  title?: string;
  description?: string;
  avatar?: string;
  propertyId?: string;
  participantIds: string[];
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface CreateMessageDto {
  conversationId: string;
  type: 'text' | 'image' | 'file' | 'audio' | 'video';
  content: string;
  replyToId?: string;
  forwardedFromId?: string;
  isImportant?: boolean;
  metadata?: Record<string, any>;
  scheduledAt?: Date;
  attachmentIds?: string[];
}

export interface UpdateMessageDto {
  content?: string;
  isImportant?: boolean;
  metadata?: Record<string, any>;
}

export interface SearchMessagesDto {
  conversationId?: string;
  query?: string;
  senderId?: string;
  type?: string;
  startDate?: Date;
  endDate?: Date;
  hasAttachments?: boolean;
  isImportant?: boolean;
  page?: number;
  limit?: number;
}

export interface TypingIndicator {
  conversationId: string;
  userId: string;
  userName: string;
  isTyping: boolean;
}

export interface NotificationPayload {
  type: string;
  userId: string;
  data: any;
  metadata?: Record<string, any>;
}

class MessagingService {
  private wsService: WebSocketService | null = null;
  private currentUserId: string | null = null;
  private typingTimeouts: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    this.initializeWebSocket();
  }

  private async initializeWebSocket(): Promise<void> {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.warn('No auth token found, WebSocket not initialized');
        return;
      }

      this.wsService = new WebSocketService({
        url: process.env.REACT_APP_WS_URL || 'ws://localhost:3001',
        token,
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      await this.wsService.connect();
      console.log('WebSocket initialized successfully');
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
    }
  }

  // WebSocket connection management
  async connectWebSocket(token: string, userId: string): Promise<void> {
    this.currentUserId = userId;
    
    if (this.wsService) {
      this.wsService.updateToken(token);
    } else {
      this.wsService = new WebSocketService({
        url: process.env.REACT_APP_WS_URL || 'ws://localhost:3001',
        token,
        autoConnect: true,
      });
    }

    await this.wsService.connect();
  }

  disconnectWebSocket(): void {
    this.wsService?.disconnect();
    this.currentUserId = null;
  }

  isWebSocketConnected(): boolean {
    return this.wsService?.isConnected() || false;
  }

  getWebSocketState(): 'connected' | 'connecting' | 'disconnected' {
    return this.wsService?.getConnectionState() || 'disconnected';
  }

  // Event listeners
  onMessage(handler: (message: Message) => void): () => void {
    return this.wsService?.on('new_message', handler) || (() => {});
  }

  onMessageUpdate(handler: (message: Message) => void): () => void {
    return this.wsService?.on('message_updated', handler) || (() => {});
  }

  onMessageDelete(handler: (messageId: string) => void): () => void {
    return this.wsService?.on('message_deleted', handler) || (() => {});
  }

  onReaction(handler: (reaction: MessageReaction) => void): () => void {
    return this.wsService?.on('reaction_added', handler) || (() => {});
  }

  onReactionRemove(handler: (data: { messageId: string; userId: string; emoji: string }) => void): () => void {
    return this.wsService?.on('reaction_removed', handler) || (() => {});
  }

  onTyping(handler: (data: TypingIndicator) => void): () => void {
    return this.wsService?.on('typing_indicator', handler) || (() => {});
  }

  onUserOnline(handler: (userId: string) => void): () => void {
    return this.wsService?.on('user_online', handler) || (() => {});
  }

  onUserOffline(handler: (userId: string) => void): () => void {
    return this.wsService?.on('user_offline', handler) || (() => {});
  }

  onNotification(handler: (notification: NotificationPayload) => void): () => void {
    return this.wsService?.on('notification', handler) || (() => {});
  }

  onConversationUpdate(handler: (conversation: Conversation) => void): () => void {
    return this.wsService?.on('conversation_updated', handler) || (() => {});
  }

  onMessageRead(handler: (data: { messageId: string; userId: string; readAt: Date }) => void): () => void {
    return this.wsService?.on('message_read', handler) || (() => {});
  }

  // WebSocket actions
  joinConversation(conversationId: string): void {
    this.wsService?.emit('join_conversation', { conversationId });
  }

  leaveConversation(conversationId: string): void {
    this.wsService?.emit('leave_conversation', { conversationId });
  }

  sendTypingIndicator(conversationId: string, isTyping: boolean): void {
    if (isTyping) {
      this.wsService?.emit('typing_start', { conversationId });
      
      // Clear existing timeout
      const existingTimeout = this.typingTimeouts.get(conversationId);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }
      
      // Set new timeout to stop typing after 3 seconds
      const timeout = setTimeout(() => {
        this.sendTypingIndicator(conversationId, false);
        this.typingTimeouts.delete(conversationId);
      }, 3000);
      
      this.typingTimeouts.set(conversationId, timeout);
    } else {
      this.wsService?.emit('typing_stop', { conversationId });
      
      const timeout = this.typingTimeouts.get(conversationId);
      if (timeout) {
        clearTimeout(timeout);
        this.typingTimeouts.delete(conversationId);
      }
    }
  }

  markMessageAsRead(messageId: string): void {
    this.wsService?.emit('mark_as_read', { messageId });
  }

  addReaction(messageId: string, emoji: string): void {
    this.wsService?.emit('add_reaction', { messageId, emoji });
  }

  removeReaction(messageId: string, emoji: string): void {
    this.wsService?.emit('remove_reaction', { messageId, emoji });
  }

  // API calls
  async getConversations(page = 1, limit = 20): Promise<{ conversations: Conversation[]; total: number }> {
    const response = await apiClient.get('/conversations', {
      params: { page, limit },
    });
    return response.data;
  }

  async getConversation(id: string): Promise<Conversation> {
    const response = await apiClient.get(`/conversations/${id}`);
    return response.data;
  }

  async createConversation(data: CreateConversationDto): Promise<Conversation> {
    const response = await apiClient.post('/conversations', data);
    return response.data;
  }

  async updateConversation(id: string, data: Partial<CreateConversationDto>): Promise<Conversation> {
    const response = await apiClient.patch(`/conversations/${id}`, data);
    return response.data;
  }

  async deleteConversation(id: string): Promise<void> {
    await apiClient.delete(`/conversations/${id}`);
  }

  async addParticipant(conversationId: string, userId: string): Promise<void> {
    await apiClient.post(`/conversations/${conversationId}/participants`, { userId });
  }

  async removeParticipant(conversationId: string, userId: string): Promise<void> {
    await apiClient.delete(`/conversations/${conversationId}/participants/${userId}`);
  }

  async archiveConversation(id: string): Promise<void> {
    await apiClient.patch(`/conversations/${id}/archive`);
  }

  async unarchiveConversation(id: string): Promise<void> {
    await apiClient.patch(`/conversations/${id}/unarchive`);
  }

  async muteConversation(id: string): Promise<void> {
    await apiClient.patch(`/conversations/${id}/mute`);
  }

  async unmuteConversation(id: string): Promise<void> {
    await apiClient.patch(`/conversations/${id}/unmute`);
  }

  async pinConversation(id: string): Promise<void> {
    await apiClient.patch(`/conversations/${id}/pin`);
  }

  async unpinConversation(id: string): Promise<void> {
    await apiClient.patch(`/conversations/${id}/unpin`);
  }

  async getMessages(conversationId: string, page = 1, limit = 50): Promise<{ messages: Message[]; total: number }> {
    const response = await apiClient.get(`/messages`, {
      params: { conversationId, page, limit },
    });
    return response.data;
  }

  async getMessage(id: string): Promise<Message> {
    const response = await apiClient.get(`/messages/${id}`);
    return response.data;
  }

  async sendMessage(data: CreateMessageDto): Promise<Message> {
    const response = await apiClient.post('/messages', data);
    return response.data;
  }

  async updateMessage(id: string, data: UpdateMessageDto): Promise<Message> {
    const response = await apiClient.patch(`/messages/${id}`, data);
    return response.data;
  }

  async deleteMessage(id: string): Promise<void> {
    await apiClient.delete(`/messages/${id}`);
  }

  async forwardMessage(messageId: string, conversationIds: string[]): Promise<Message[]> {
    const response = await apiClient.post(`/messages/${messageId}/forward`, {
      conversationIds,
    });
    return response.data;
  }

  async searchMessages(params: SearchMessagesDto): Promise<{ messages: Message[]; total: number }> {
    const response = await apiClient.get('/messages/search', { params });
    return response.data;
  }

  async uploadFiles(files: File[]): Promise<MessageAttachment[]> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    const response = await apiClient.post('/messages/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async getDirectConversation(userId: string): Promise<Conversation> {
    const response = await apiClient.get(`/conversations/direct/${userId}`);
    return response.data;
  }

  async createDirectConversation(userId: string): Promise<Conversation> {
    const response = await apiClient.post('/conversations/direct', { userId });
    return response.data;
  }

  // Utility methods
  getCurrentUserId(): string | null {
    return this.currentUserId;
  }

  async ping(): Promise<number> {
    if (!this.wsService) {
      throw new Error('WebSocket not initialized');
    }
    return this.wsService.ping();
  }

  cleanup(): void {
    this.typingTimeouts.forEach(timeout => clearTimeout(timeout));
    this.typingTimeouts.clear();
    this.disconnectWebSocket();
  }
}

export const messagingService = new MessagingService();
export default messagingService;