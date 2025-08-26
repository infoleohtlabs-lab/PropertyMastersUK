import { useState, useEffect, useCallback, useRef } from 'react';
import { messagingService, Conversation, Message, MessageReaction, TypingIndicator, NotificationPayload } from '../services/messaging.service';

export interface MessagingState {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  messages: Message[];
  isLoading: boolean;
  isConnected: boolean;
  connectionState: 'connected' | 'connecting' | 'disconnected';
  error: string | null;
  typingUsers: TypingIndicator[];
  unreadCount: number;
}

export interface MessagingActions {
  // Connection
  connect: (token: string, userId: string) => Promise<void>;
  disconnect: () => void;
  
  // Conversations
  loadConversations: () => Promise<void>;
  selectConversation: (conversationId: string) => Promise<void>;
  createConversation: (data: any) => Promise<Conversation>;
  updateConversation: (id: string, data: any) => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;
  archiveConversation: (id: string) => Promise<void>;
  muteConversation: (id: string) => Promise<void>;
  pinConversation: (id: string) => Promise<void>;
  
  // Messages
  loadMessages: (conversationId: string, page?: number) => Promise<void>;
  sendMessage: (data: any) => Promise<void>;
  updateMessage: (id: string, data: any) => Promise<void>;
  deleteMessage: (id: string) => Promise<void>;
  forwardMessage: (messageId: string, conversationIds: string[]) => Promise<void>;
  
  // Interactions
  addReaction: (messageId: string, emoji: string) => void;
  removeReaction: (messageId: string, emoji: string) => void;
  markAsRead: (messageId: string) => void;
  startTyping: (conversationId: string) => void;
  stopTyping: (conversationId: string) => void;
  
  // File upload
  uploadFiles: (files: File[]) => Promise<any[]>;
  
  // Search
  searchMessages: (params: any) => Promise<{ messages: Message[]; total: number }>;
  
  // Utility
  clearError: () => void;
  refreshConversation: (id: string) => Promise<void>;
}

export function useMessaging(): MessagingState & MessagingActions {
  const [state, setState] = useState<MessagingState>({
    conversations: [],
    activeConversation: null,
    messages: [],
    isLoading: false,
    isConnected: false,
    connectionState: 'disconnected',
    error: null,
    typingUsers: [],
    unreadCount: 0,
  });

  const unsubscribeRefs = useRef<(() => void)[]>([]);
  const messagesCache = useRef<Map<string, Message[]>>(new Map());
  const typingTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Update connection state
  const updateConnectionState = useCallback(() => {
    const connectionState = messagingService.getWebSocketState();
    const isConnected = messagingService.isWebSocketConnected();
    
    setState(prev => ({
      ...prev,
      isConnected,
      connectionState,
    }));
  }, []);

  // Setup WebSocket event listeners
  const setupEventListeners = useCallback(() => {
    // Clear existing listeners
    unsubscribeRefs.current.forEach(unsubscribe => unsubscribe());
    unsubscribeRefs.current = [];

    // Message events
    const unsubscribeMessage = messagingService.onMessage((message: Message) => {
      setState(prev => {
        // Add to messages if it's for the active conversation
        const newMessages = prev.activeConversation?.id === message.conversationId
          ? [...prev.messages, message]
          : prev.messages;

        // Update conversation's last message
        const updatedConversations = prev.conversations.map(conv => {
          if (conv.id === message.conversationId) {
            return {
              ...conv,
              lastMessage: message,
              lastActivityAt: message.createdAt,
              unreadCount: conv.id === prev.activeConversation?.id ? 0 : conv.unreadCount + 1,
            };
          }
          return conv;
        });

        return {
          ...prev,
          messages: newMessages,
          conversations: updatedConversations,
          unreadCount: prev.unreadCount + (prev.activeConversation?.id === message.conversationId ? 0 : 1),
        };
      });
    });

    const unsubscribeMessageUpdate = messagingService.onMessageUpdate((message: Message) => {
      setState(prev => ({
        ...prev,
        messages: prev.messages.map(msg => msg.id === message.id ? message : msg),
      }));
    });

    const unsubscribeMessageDelete = messagingService.onMessageDelete((messageId: string) => {
      setState(prev => ({
        ...prev,
        messages: prev.messages.filter(msg => msg.id !== messageId),
      }));
    });

    // Reaction events
    const unsubscribeReaction = messagingService.onReaction((reaction: MessageReaction) => {
      setState(prev => ({
        ...prev,
        messages: prev.messages.map(msg => {
          if (msg.id === reaction.messageId) {
            const existingReactionIndex = msg.reactions.findIndex(
              r => r.userId === reaction.userId && r.emoji === reaction.emoji
            );
            
            if (existingReactionIndex === -1) {
              return {
                ...msg,
                reactions: [...msg.reactions, reaction],
              };
            }
          }
          return msg;
        }),
      }));
    });

    const unsubscribeReactionRemove = messagingService.onReactionRemove(
      ({ messageId, userId, emoji }) => {
        setState(prev => ({
          ...prev,
          messages: prev.messages.map(msg => {
            if (msg.id === messageId) {
              return {
                ...msg,
                reactions: msg.reactions.filter(
                  r => !(r.userId === userId && r.emoji === emoji)
                ),
              };
            }
            return msg;
          }),
        }));
      }
    );

    // Typing events
    const unsubscribeTyping = messagingService.onTyping((typingData: TypingIndicator) => {
      setState(prev => {
        if (typingData.conversationId !== prev.activeConversation?.id) {
          return prev;
        }

        const existingIndex = prev.typingUsers.findIndex(
          t => t.userId === typingData.userId && t.conversationId === typingData.conversationId
        );

        let newTypingUsers = [...prev.typingUsers];

        if (typingData.isTyping) {
          if (existingIndex === -1) {
            newTypingUsers.push(typingData);
          } else {
            newTypingUsers[existingIndex] = typingData;
          }

          // Clear typing indicator after 5 seconds
          const timeoutKey = `${typingData.conversationId}-${typingData.userId}`;
          const existingTimeout = typingTimeouts.current.get(timeoutKey);
          if (existingTimeout) {
            clearTimeout(existingTimeout);
          }

          const timeout = setTimeout(() => {
            setState(prevState => ({
              ...prevState,
              typingUsers: prevState.typingUsers.filter(
                t => !(t.userId === typingData.userId && t.conversationId === typingData.conversationId)
              ),
            }));
            typingTimeouts.current.delete(timeoutKey);
          }, 5000);

          typingTimeouts.current.set(timeoutKey, timeout);
        } else {
          newTypingUsers = newTypingUsers.filter(
            t => !(t.userId === typingData.userId && t.conversationId === typingData.conversationId)
          );
        }

        return {
          ...prev,
          typingUsers: newTypingUsers,
        };
      });
    });

    // Conversation events
    const unsubscribeConversationUpdate = messagingService.onConversationUpdate(
      (conversation: Conversation) => {
        setState(prev => ({
          ...prev,
          conversations: prev.conversations.map(conv =>
            conv.id === conversation.id ? conversation : conv
          ),
          activeConversation: prev.activeConversation?.id === conversation.id
            ? conversation
            : prev.activeConversation,
        }));
      }
    );

    // Message read events
    const unsubscribeMessageRead = messagingService.onMessageRead(
      ({ messageId, userId, readAt }) => {
        setState(prev => ({
          ...prev,
          messages: prev.messages.map(msg => {
            if (msg.id === messageId && !msg.readBy.includes(userId)) {
              return {
                ...msg,
                readBy: [...msg.readBy, userId],
                status: msg.senderId === messagingService.getCurrentUserId() ? 'read' : msg.status,
              };
            }
            return msg;
          }),
        }));
      }
    );

    // Store unsubscribe functions
    unsubscribeRefs.current = [
      unsubscribeMessage,
      unsubscribeMessageUpdate,
      unsubscribeMessageDelete,
      unsubscribeReaction,
      unsubscribeReactionRemove,
      unsubscribeTyping,
      unsubscribeConversationUpdate,
      unsubscribeMessageRead,
    ];
  }, []);

  // Actions
  const connect = useCallback(async (token: string, userId: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      await messagingService.connectWebSocket(token, userId);
      setupEventListeners();
      updateConnectionState();
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Connection failed',
      }));
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [setupEventListeners, updateConnectionState]);

  const disconnect = useCallback(() => {
    messagingService.disconnectWebSocket();
    unsubscribeRefs.current.forEach(unsubscribe => unsubscribe());
    unsubscribeRefs.current = [];
    
    // Clear timeouts
    typingTimeouts.current.forEach(timeout => clearTimeout(timeout));
    typingTimeouts.current.clear();
    
    setState({
      conversations: [],
      activeConversation: null,
      messages: [],
      isLoading: false,
      isConnected: false,
      connectionState: 'disconnected',
      error: null,
      typingUsers: [],
      unreadCount: 0,
    });
  }, []);

  const loadConversations = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const { conversations } = await messagingService.getConversations();
      const totalUnread = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);
      
      setState(prev => ({
        ...prev,
        conversations,
        unreadCount: totalUnread,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load conversations',
      }));
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const selectConversation = useCallback(async (conversationId: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Get conversation details
      const conversation = await messagingService.getConversation(conversationId);
      
      // Load messages (check cache first)
      let messages = messagesCache.current.get(conversationId);
      if (!messages) {
        const { messages: loadedMessages } = await messagingService.getMessages(conversationId);
        messages = loadedMessages;
        messagesCache.current.set(conversationId, messages);
      }
      
      // Join conversation for real-time updates
      messagingService.joinConversation(conversationId);
      
      setState(prev => ({
        ...prev,
        activeConversation: conversation,
        messages,
        typingUsers: [], // Clear typing indicators when switching conversations
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load conversation',
      }));
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const sendMessage = useCallback(async (data: any) => {
    try {
      const message = await messagingService.sendMessage(data);
      
      // Update cache
      if (messagesCache.current.has(data.conversationId)) {
        const cachedMessages = messagesCache.current.get(data.conversationId)!;
        messagesCache.current.set(data.conversationId, [...cachedMessages, message]);
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to send message',
      }));
    }
  }, []);

  const loadMessages = useCallback(async (conversationId: string, page = 1) => {
    try {
      const { messages } = await messagingService.getMessages(conversationId, page);
      
      if (page === 1) {
        messagesCache.current.set(conversationId, messages);
        setState(prev => ({ ...prev, messages }));
      } else {
        // Append to existing messages (for pagination)
        const existingMessages = messagesCache.current.get(conversationId) || [];
        const updatedMessages = [...messages, ...existingMessages];
        messagesCache.current.set(conversationId, updatedMessages);
        setState(prev => ({ ...prev, messages: updatedMessages }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load messages',
      }));
    }
  }, []);

  // Other actions
  const createConversation = useCallback(async (data: any) => {
    const conversation = await messagingService.createConversation(data);
    setState(prev => ({
      ...prev,
      conversations: [conversation, ...prev.conversations],
    }));
    return conversation;
  }, []);

  const updateConversation = useCallback(async (id: string, data: any) => {
    await messagingService.updateConversation(id, data);
    // The conversation will be updated via WebSocket event
  }, []);

  const deleteConversation = useCallback(async (id: string) => {
    await messagingService.deleteConversation(id);
    setState(prev => ({
      ...prev,
      conversations: prev.conversations.filter(conv => conv.id !== id),
      activeConversation: prev.activeConversation?.id === id ? null : prev.activeConversation,
      messages: prev.activeConversation?.id === id ? [] : prev.messages,
    }));
    messagesCache.current.delete(id);
  }, []);

  const archiveConversation = useCallback(async (id: string) => {
    await messagingService.archiveConversation(id);
  }, []);

  const muteConversation = useCallback(async (id: string) => {
    await messagingService.muteConversation(id);
  }, []);

  const pinConversation = useCallback(async (id: string) => {
    await messagingService.pinConversation(id);
  }, []);

  const updateMessage = useCallback(async (id: string, data: any) => {
    await messagingService.updateMessage(id, data);
  }, []);

  const deleteMessage = useCallback(async (id: string) => {
    await messagingService.deleteMessage(id);
  }, []);

  const forwardMessage = useCallback(async (messageId: string, conversationIds: string[]) => {
    await messagingService.forwardMessage(messageId, conversationIds);
  }, []);

  const addReaction = useCallback((messageId: string, emoji: string) => {
    messagingService.addReaction(messageId, emoji);
  }, []);

  const removeReaction = useCallback((messageId: string, emoji: string) => {
    messagingService.removeReaction(messageId, emoji);
  }, []);

  const markAsRead = useCallback((messageId: string) => {
    messagingService.markMessageAsRead(messageId);
  }, []);

  const startTyping = useCallback((conversationId: string) => {
    messagingService.sendTypingIndicator(conversationId, true);
  }, []);

  const stopTyping = useCallback((conversationId: string) => {
    messagingService.sendTypingIndicator(conversationId, false);
  }, []);

  const uploadFiles = useCallback(async (files: File[]) => {
    return messagingService.uploadFiles(files);
  }, []);

  const searchMessages = useCallback(async (params: any) => {
    return messagingService.searchMessages(params);
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const refreshConversation = useCallback(async (id: string) => {
    try {
      const conversation = await messagingService.getConversation(id);
      setState(prev => ({
        ...prev,
        conversations: prev.conversations.map(conv => conv.id === id ? conversation : conv),
        activeConversation: prev.activeConversation?.id === id ? conversation : prev.activeConversation,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to refresh conversation',
      }));
    }
  }, []);

  // Monitor connection state
  useEffect(() => {
    const interval = setInterval(updateConnectionState, 1000);
    return () => clearInterval(interval);
  }, [updateConnectionState]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      unsubscribeRefs.current.forEach(unsubscribe => unsubscribe());
      typingTimeouts.current.forEach(timeout => clearTimeout(timeout));
    };
  }, []);

  return {
    ...state,
    connect,
    disconnect,
    loadConversations,
    selectConversation,
    createConversation,
    updateConversation,
    deleteConversation,
    archiveConversation,
    muteConversation,
    pinConversation,
    loadMessages,
    sendMessage,
    updateMessage,
    deleteMessage,
    forwardMessage,
    addReaction,
    removeReaction,
    markAsRead,
    startTyping,
    stopTyping,
    uploadFiles,
    searchMessages,
    clearError,
    refreshConversation,
  };
}