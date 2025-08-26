import { useState, useEffect, useCallback, useRef } from 'react';
import { messagingService, TypingIndicator } from '../services/messaging.service';

export interface TypingState {
  isTyping: boolean;
  typingUsers: TypingIndicator[];
  currentUserTyping: boolean;
}

export interface TypingActions {
  startTyping: (conversationId: string) => void;
  stopTyping: (conversationId: string) => void;
  setTyping: (conversationId: string, isTyping: boolean) => void;
  clearTypingUsers: () => void;
}

export function useTypingIndicator(conversationId?: string): TypingState & TypingActions {
  const [state, setState] = useState<TypingState>({
    isTyping: false,
    typingUsers: [],
    currentUserTyping: false,
  });

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastTypingTimeRef = useRef<number>(0);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const currentConversationRef = useRef<string | undefined>(conversationId);

  // Update conversation reference
  useEffect(() => {
    currentConversationRef.current = conversationId;
  }, [conversationId]);

  // Setup typing event listeners
  const setupTypingListeners = useCallback(() => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
    }

    const unsubscribe = messagingService.onTyping((typingData: TypingIndicator) => {
      // Only handle typing for the current conversation
      if (typingData.conversationId !== currentConversationRef.current) {
        return;
      }

      // Don't show typing indicator for current user
      const currentUserId = messagingService.getCurrentUserId();
      if (typingData.userId === currentUserId) {
        return;
      }

      setState(prev => {
        const existingIndex = prev.typingUsers.findIndex(
          user => user.userId === typingData.userId
        );

        let newTypingUsers = [...prev.typingUsers];

        if (typingData.isTyping) {
          if (existingIndex === -1) {
            newTypingUsers.push(typingData);
          } else {
            newTypingUsers[existingIndex] = typingData;
          }
        } else {
          newTypingUsers = newTypingUsers.filter(
            user => user.userId !== typingData.userId
          );
        }

        return {
          ...prev,
          typingUsers: newTypingUsers,
          isTyping: newTypingUsers.length > 0,
        };
      });
    });

    unsubscribeRef.current = unsubscribe;
  }, []);

  // Start typing indicator
  const startTyping = useCallback((targetConversationId: string) => {
    if (!messagingService.isWebSocketConnected()) {
      return;
    }

    const now = Date.now();
    const timeSinceLastTyping = now - lastTypingTimeRef.current;

    // Only send typing indicator if enough time has passed (throttle)
    if (timeSinceLastTyping > 1000) {
      messagingService.sendTypingIndicator(targetConversationId, true);
      lastTypingTimeRef.current = now;
    }

    setState(prev => ({ ...prev, currentUserTyping: true }));

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Auto-stop typing after 3 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping(targetConversationId);
    }, 3000);
  }, []);

  // Stop typing indicator
  const stopTyping = useCallback((targetConversationId: string) => {
    if (!messagingService.isWebSocketConnected()) {
      return;
    }

    messagingService.sendTypingIndicator(targetConversationId, false);
    setState(prev => ({ ...prev, currentUserTyping: false }));

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  }, []);

  // Set typing state (convenience method)
  const setTyping = useCallback((targetConversationId: string, isTyping: boolean) => {
    if (isTyping) {
      startTyping(targetConversationId);
    } else {
      stopTyping(targetConversationId);
    }
  }, [startTyping, stopTyping]);

  // Clear all typing users
  const clearTypingUsers = useCallback(() => {
    setState(prev => ({
      ...prev,
      typingUsers: [],
      isTyping: false,
    }));
  }, []);

  // Setup listeners when WebSocket is connected
  useEffect(() => {
    if (messagingService.isWebSocketConnected()) {
      setupTypingListeners();
    }

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [setupTypingListeners]);

  // Clear typing state when conversation changes
  useEffect(() => {
    setState({
      isTyping: false,
      typingUsers: [],
      currentUserTyping: false,
    });

    // Stop typing for previous conversation if user was typing
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  }, [conversationId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
      // Stop typing when component unmounts
      if (state.currentUserTyping && conversationId) {
        messagingService.sendTypingIndicator(conversationId, false);
      }
    };
  }, []);

  return {
    ...state,
    startTyping,
    stopTyping,
    setTyping,
    clearTypingUsers,
  };
}

// Hook for managing typing in input fields
export function useInputTyping(conversationId?: string, debounceMs: number = 1000) {
  const { startTyping, stopTyping, currentUserTyping } = useTypingIndicator(conversationId);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);

  const handleInputChange = useCallback((value: string) => {
    if (!conversationId) return;

    const hasContent = value.trim().length > 0;

    if (hasContent && !isTypingRef.current) {
      // Start typing
      startTyping(conversationId);
      isTypingRef.current = true;
    }

    // Clear existing debounce timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Set new timeout to stop typing
    debounceTimeoutRef.current = setTimeout(() => {
      if (isTypingRef.current) {
        stopTyping(conversationId);
        isTypingRef.current = false;
      }
    }, debounceMs);
  }, [conversationId, startTyping, stopTyping, debounceMs]);

  const handleInputBlur = useCallback(() => {
    if (!conversationId) return;

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    if (isTypingRef.current) {
      stopTyping(conversationId);
      isTypingRef.current = false;
    }
  }, [conversationId, stopTyping]);

  const handleSubmit = useCallback(() => {
    if (!conversationId) return;

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    if (isTypingRef.current) {
      stopTyping(conversationId);
      isTypingRef.current = false;
    }
  }, [conversationId, stopTyping]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      if (isTypingRef.current && conversationId) {
        stopTyping(conversationId);
      }
    };
  }, [conversationId, stopTyping]);

  return {
    currentUserTyping,
    handleInputChange,
    handleInputBlur,
    handleSubmit,
  };
}

// Utility function to format typing users display
export function formatTypingUsers(typingUsers: TypingIndicator[]): string {
  const userNames = typingUsers.map(user => user.userName || 'Someone');
  
  if (userNames.length === 0) {
    return '';
  }
  
  if (userNames.length === 1) {
    return `${userNames[0]} is typing...`;
  }
  
  if (userNames.length === 2) {
    return `${userNames[0]} and ${userNames[1]} are typing...`;
  }
  
  if (userNames.length === 3) {
    return `${userNames[0]}, ${userNames[1]} and ${userNames[2]} are typing...`;
  }
  
  return `${userNames[0]}, ${userNames[1]} and ${userNames.length - 2} others are typing...`;
}