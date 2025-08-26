import { create } from 'zustand';
import { Notification, NotificationType } from '../types';

interface AppState {
  // UI State
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  notifications: Notification[];
  isOnline: boolean;
  
  // Loading states
  globalLoading: boolean;
  
  // Actions
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  removeNotification: (id: string) => void;
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;
  setOnlineStatus: (isOnline: boolean) => void;
  setGlobalLoading: (loading: boolean) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  sidebarOpen: false,
  theme: 'light',
  notifications: [],
  isOnline: navigator.onLine,
  globalLoading: false,

  // Actions
  setSidebarOpen: (open: boolean) => {
    set({ sidebarOpen: open });
  },

  toggleSidebar: () => {
    set((state) => ({ sidebarOpen: !state.sidebarOpen }));
  },

  setTheme: (theme: 'light' | 'dark') => {
    set({ theme });
    // Apply theme to document
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  },

  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => {
    const newNotification: Notification = {
      ...notification,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      isRead: false
    };
    
    set((state) => ({
      notifications: [newNotification, ...state.notifications]
    }));

    // Auto-remove success and info notifications after 5 seconds
    if (notification.type === NotificationType.SUCCESS || notification.type === NotificationType.INFO) {
      setTimeout(() => {
        get().removeNotification(newNotification.id);
      }, 5000);
    }
  },

  removeNotification: (id: string) => {
    set((state) => ({
      notifications: state.notifications.filter(n => n.id !== id)
    }));
  },

  markNotificationAsRead: (id: string) => {
    set((state) => ({
      notifications: state.notifications.map(n => 
        n.id === id ? { ...n, isRead: true } : n
      )
    }));
  },

  clearAllNotifications: () => {
    set({ notifications: [] });
  },

  setOnlineStatus: (isOnline: boolean) => {
    set({ isOnline });
  },

  setGlobalLoading: (loading: boolean) => {
    set({ globalLoading: loading });
  }
}));

// Initialize theme from localStorage
const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
if (savedTheme) {
  useAppStore.getState().setTheme(savedTheme);
} else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
  useAppStore.getState().setTheme('dark');
}

// Listen for online/offline events
window.addEventListener('online', () => {
  useAppStore.getState().setOnlineStatus(true);
  useAppStore.getState().addNotification({
    title: 'Connection Restored',
    message: 'You are back online',
    type: NotificationType.SUCCESS,
    isRead: false
  });
});

window.addEventListener('offline', () => {
  useAppStore.getState().setOnlineStatus(false);
  useAppStore.getState().addNotification({
    title: 'Connection Lost',
    message: 'You are currently offline',
    type: NotificationType.WARNING,
    isRead: false
  });
});