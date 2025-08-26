import { useState, useEffect, useCallback, useRef } from 'react';
import { messagingService, NotificationPayload } from '../services/messaging.service';

// Frontend notification interface that extends the base NotificationPayload
export interface FrontendNotification extends NotificationPayload {
  id: string;
  read: boolean;
  message?: string;
  title?: string;
  timestamp: Date;
}

export interface NotificationSettings {
  enabled: boolean;
  sound: boolean;
  desktop: boolean;
  email: boolean;
  mentions: boolean;
  directMessages: boolean;
  groupMessages: boolean;
  reactions: boolean;
  doNotDisturb: boolean;
  quietHours: {
    enabled: boolean;
    start: string; // HH:mm format
    end: string; // HH:mm format
  };
}

export interface NotificationState {
  notifications: FrontendNotification[];
  unreadCount: number;
  settings: NotificationSettings;
  permission: NotificationPermission;
  isLoading: boolean;
  error: string | null;
}

export interface NotificationActions {
  requestPermission: () => Promise<NotificationPermission>;
  showNotification: (notification: FrontendNotification) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  clearNotification: (notificationId: string) => void;
  clearAllNotifications: () => void;
  updateSettings: (settings: Partial<NotificationSettings>) => Promise<void>;
  loadSettings: () => Promise<void>;
  playNotificationSound: () => void;
  isInQuietHours: () => boolean;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: true,
  sound: true,
  desktop: true,
  email: false,
  mentions: true,
  directMessages: true,
  groupMessages: true,
  reactions: false,
  doNotDisturb: false,
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '08:00',
  },
};

export function useNotifications(): NotificationState & NotificationActions {
  const [state, setState] = useState<NotificationState>({
    notifications: [],
    unreadCount: 0,
    settings: DEFAULT_SETTINGS,
    permission: 'default',
    isLoading: false,
    error: null,
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Initialize audio for notification sounds
  useEffect(() => {
    audioRef.current = new Audio('/sounds/notification.mp3');
    audioRef.current.volume = 0.5;
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Check notification permission on mount
  useEffect(() => {
    if ('Notification' in window) {
      setState(prev => ({ ...prev, permission: Notification.permission }));
    }
  }, []);

  // Setup notification listeners
  const setupNotificationListeners = useCallback(() => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
    }

    const unsubscribe = messagingService.onNotification((notification: NotificationPayload) => {
      // Convert NotificationPayload to FrontendNotification
      const frontendNotification: FrontendNotification = {
        ...notification,
        id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        read: false,
        message: notification.data?.message || notification.data?.content || 'New notification',
        title: notification.data?.title || getNotificationTitle(notification),
        timestamp: new Date(),
      };

      setState(prev => {
        const newNotifications = [frontendNotification, ...prev.notifications];
        return {
          ...prev,
          notifications: newNotifications,
          unreadCount: prev.unreadCount + 1,
        };
      });

      // Show notification if conditions are met
      showNotification(frontendNotification);
    });

    unsubscribeRef.current = unsubscribe;
  }, []);

  // Check if current time is within quiet hours
  const isInQuietHours = useCallback((): boolean => {
    if (!state.settings.quietHours.enabled) {
      return false;
    }

    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const { start, end } = state.settings.quietHours;

    // Handle overnight quiet hours (e.g., 22:00 to 08:00)
    if (start > end) {
      return currentTime >= start || currentTime <= end;
    }
    
    // Handle same-day quiet hours (e.g., 12:00 to 14:00)
    return currentTime >= start && currentTime <= end;
  }, [state.settings.quietHours]);

  // Request notification permission
  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (!('Notification' in window)) {
      throw new Error('This browser does not support notifications');
    }

    const permission = await Notification.requestPermission();
    setState(prev => ({ ...prev, permission }));
    return permission;
  }, []);

  // Show notification
  const showNotification = useCallback((notification: FrontendNotification) => {
    const { settings } = state;

    // Check if notifications are enabled
    if (!settings.enabled || settings.doNotDisturb || isInQuietHours()) {
      return;
    }

    // Check notification type settings
    const shouldShow = (() => {
      switch (notification.type) {
        case 'NEW_MESSAGE':
          return notification.data.conversationType === 'direct' 
            ? settings.directMessages 
            : settings.groupMessages;
        case 'MENTION':
          return settings.mentions;
        case 'MESSAGE_REACTION':
          return settings.reactions;
        default:
          return true;
      }
    })();

    if (!shouldShow) {
      return;
    }

    // Play sound
    if (settings.sound) {
      playNotificationSound();
    }

    // Show desktop notification
    if (settings.desktop && state.permission === 'granted') {
      const title = getNotificationTitle(notification);
      const body = getNotificationBody(notification);
      const icon = '/icons/notification-icon.png';

      const desktopNotification = new Notification(title, {
        body,
        icon,
        tag: notification.id,
        requireInteraction: false,
        silent: !settings.sound,
      });

      // Auto-close after 5 seconds
      setTimeout(() => {
        desktopNotification.close();
      }, 5000);

      // Handle click
      desktopNotification.onclick = () => {
        window.focus();
        // Navigate to conversation if applicable
        if (notification.data.conversationId) {
          // This would typically trigger navigation in your app
          console.log('Navigate to conversation:', notification.data.conversationId);
        }
        desktopNotification.close();
      };
    }
  }, [state.settings, state.permission, isInQuietHours]);

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    if (audioRef.current && state.settings.sound) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(error => {
        console.warn('Failed to play notification sound:', error);
      });
    }
  }, [state.settings.sound]);

  // Mark notification as read
  const markAsRead = useCallback((notificationId: string) => {
    setState(prev => {
      const notification = prev.notifications.find(n => n.id === notificationId);
      if (!notification || notification.read) {
        return prev;
      }

      return {
        ...prev,
        notifications: prev.notifications.map(n => 
          n.id === notificationId ? { ...n, read: true } : n
        ),
        unreadCount: Math.max(0, prev.unreadCount - 1),
      };
    });
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.map(n => ({ ...n, read: true })),
      unreadCount: 0,
    }));
  }, []);

  // Clear single notification
  const clearNotification = useCallback((notificationId: string) => {
    setState(prev => {
      const notification = prev.notifications.find(n => n.id === notificationId);
      const wasUnread = notification && !notification.read;

      return {
        ...prev,
        notifications: prev.notifications.filter(n => n.id !== notificationId),
        unreadCount: wasUnread ? Math.max(0, prev.unreadCount - 1) : prev.unreadCount,
      };
    });
  }, []);

  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    setState(prev => ({
      ...prev,
      notifications: [],
      unreadCount: 0,
    }));
  }, []);

  // Update notification settings
  const updateSettings = useCallback(async (newSettings: Partial<NotificationSettings>) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const updatedSettings = { ...state.settings, ...newSettings };
      
      // Save to localStorage
      localStorage.setItem('notification-settings', JSON.stringify(updatedSettings));
      
      // TODO: Save to backend if needed
      // await api.updateNotificationSettings(updatedSettings);
      
      setState(prev => ({
        ...prev,
        settings: updatedSettings,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to update settings',
      }));
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [state.settings]);

  // Load notification settings
  const loadSettings = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Load from localStorage
      const savedSettings = localStorage.getItem('notification-settings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        setState(prev => ({ ...prev, settings: { ...DEFAULT_SETTINGS, ...settings } }));
      }
      
      // TODO: Load from backend if needed
      // const settings = await api.getNotificationSettings();
      // setState(prev => ({ ...prev, settings }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load settings',
      }));
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  // Setup listeners when messaging service is available
  useEffect(() => {
    if (messagingService.isWebSocketConnected()) {
      setupNotificationListeners();
    }

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [setupNotificationListeners]);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return {
    ...state,
    requestPermission,
    showNotification,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAllNotifications,
    updateSettings,
    loadSettings,
    playNotificationSound,
    isInQuietHours,
  };
}

// Helper functions
function getNotificationTitle(notification: NotificationPayload): string {
  switch (notification.type) {
    case 'NEW_MESSAGE':
      return `New message from ${notification.data.senderName}`;
    case 'MENTION':
      return `You were mentioned by ${notification.data.senderName}`;
    case 'MESSAGE_REACTION':
      return `${notification.data.senderName} reacted to your message`;
    case 'CONVERSATION_INVITE':
      return `You were invited to a conversation`;
    case 'TYPING_INDICATOR':
      return `${notification.data.senderName} is typing...`;
    case 'MESSAGE_READ':
      return 'Message read';
    case 'MESSAGE_DELIVERED':
      return 'Message delivered';
    default:
      return 'New notification';
  }
}

function getNotificationBody(notification: FrontendNotification): string {
  switch (notification.type) {
    case 'NEW_MESSAGE':
      return notification.data.content || 'New message';
    case 'MENTION':
      return notification.data.content || 'You were mentioned in a message';
    case 'MESSAGE_REACTION':
      return `Reacted with ${notification.data.emoji || '👍'}`;
    case 'CONVERSATION_INVITE':
      return `Invited to: ${notification.data.conversationTitle || 'Conversation'}`;
    case 'TYPING_INDICATOR':
      return 'Someone is typing...';
    case 'MESSAGE_READ':
      return 'Your message has been read';
    case 'MESSAGE_DELIVERED':
      return 'Your message has been delivered';
    default:
      return notification.message || 'You have a new notification';
  }
}