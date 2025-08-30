import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  User, 
  AuthResponse, 
  LoginCredentials, 
  RegisterData,
  PasswordResetRequest,
  PasswordReset,
  PasswordChange,
  EmailVerification,
  UserRole,
  Permission
} from '../types';
import { authService } from '../services/authService';
import { supabase } from '../lib/supabase';
import { messagingService } from '../services/messaging.service';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isEmailVerified: boolean;
  twoFactorEnabled: boolean;
  permissions: Permission[];
  
  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  setUser: (user: User) => void;
  refreshTokens: () => Promise<void>;
  forgotPassword: (data: PasswordResetRequest) => Promise<void>;
  resetPassword: (data: PasswordReset) => Promise<void>;
  changePassword: (data: PasswordChange) => Promise<void>;
  verifyEmail: (data: EmailVerification) => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
  getCurrentUser: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  hasPermission: (permission: Permission) => boolean;
  hasRole: (role: UserRole) => boolean;
  canAccessRoute: (route: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      isEmailVerified: false,
      twoFactorEnabled: false,
      permissions: [],

      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null });
        try {
          const response: AuthResponse = await authService.login(credentials);
          set({
            user: response.user,
            token: response.token,
            refreshToken: response.refreshToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
            isEmailVerified: response.user.emailVerified || false,
            twoFactorEnabled: response.user.twoFactorEnabled || false,
            permissions: response.user.permissions || []
          });
          
          // Initialize messaging service with auth
          try {
            await messagingService.reinitializeWithAuth();
          } catch (error) {
            console.error('Failed to initialize messaging service:', error);
          }
        } catch (error: any) {
          set({
            error: error.message || 'Login failed',
            isLoading: false,
            isAuthenticated: false
          });
          throw error;
        }
      },

      register: async (data: RegisterData) => {
        set({ isLoading: true, error: null });
        try {
          const response: AuthResponse = await authService.register(data);
          set({
            user: response.user,
            token: response.token,
            refreshToken: response.refreshToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
            isEmailVerified: response.user.emailVerified || false,
            twoFactorEnabled: response.user.twoFactorEnabled || false,
            permissions: response.user.permissions || []
          });
        } catch (error: any) {
          set({
            error: error.message || 'Registration failed',
            isLoading: false,
            isAuthenticated: false
          });
          throw error;
        }
      },

      logout: async () => {
        try {
          await authService.logout();
        } catch (error) {
          // Continue with logout even if server call fails
        }
        
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          error: null,
          isEmailVerified: false,
          twoFactorEnabled: false,
          permissions: []
        });
        
        // Disconnect messaging service
        try {
          messagingService.disconnectWebSocket();
        } catch (error) {
          console.error('Failed to disconnect messaging service:', error);
        }
        
        // Clear any stored tokens
        localStorage.removeItem('auth-storage');
      },

      clearError: () => {
        set({ error: null });
      },

      setUser: (user: User) => {
        set({ 
          user,
          isEmailVerified: user?.emailVerified || false,
          twoFactorEnabled: user?.twoFactorEnabled || false,
          permissions: user?.permissions || []
        });
      },

      refreshTokens: async () => {
        const { refreshToken } = get();
        if (!refreshToken) return;
        
        try {
          const response = await authService.refreshToken(refreshToken);
          set({
            token: response.token,
            refreshToken: response.refreshToken,
            user: response.user
          });
        } catch (error) {
          // If refresh fails, logout user
          await get().logout();
        }
      },

      forgotPassword: async (data: PasswordResetRequest) => {
        set({ isLoading: true, error: null });
        try {
          await authService.forgotPassword(data.email);
          set({ isLoading: false });
        } catch (error: any) {
          set({
            error: error.message || 'Password reset request failed',
            isLoading: false
          });
          throw error;
        }
      },

      resetPassword: async (data: PasswordReset) => {
        set({ isLoading: true, error: null });
        try {
          await authService.resetPassword(data.token, data.password);
          set({ isLoading: false });
        } catch (error: any) {
          set({
            error: error.message || 'Password reset failed',
            isLoading: false
          });
          throw error;
        }
      },

      changePassword: async (data: PasswordChange) => {
        set({ isLoading: true, error: null });
        try {
          await authService.changePassword(data.currentPassword, data.newPassword);
          set({ isLoading: false });
        } catch (error: any) {
          set({
            error: error.message || 'Password change failed',
            isLoading: false
          });
          throw error;
        }
      },

      verifyEmail: async (data: EmailVerification) => {
        set({ isLoading: true, error: null });
        try {
          await authService.verifyEmail(data.token);
          set({ 
            isLoading: false,
            isEmailVerified: true
          });
        } catch (error: any) {
          set({
            error: error.message || 'Email verification failed',
            isLoading: false
          });
          throw error;
        }
      },

      resendVerification: async (email: string) => {
        set({ isLoading: true, error: null });
        try {
          await authService.resendVerificationEmail(email);
          set({ isLoading: false });
        } catch (error: any) {
          set({
            error: error.message || 'Resend verification failed',
            isLoading: false
          });
          throw error;
        }
      },

      getCurrentUser: async () => {
        try {
          const user = await authService.getCurrentUser();
          if (user) {
            set({ 
              user,
              isAuthenticated: true,
              isEmailVerified: user?.emailVerified || false,
              twoFactorEnabled: user?.twoFactorEnabled || false,
              permissions: user?.permissions || []
            });
          } else {
            await get().logout();
          }
        } catch (error) {
          // If getting current user fails, logout
          await get().logout();
        }
      },

      // Initialize Supabase auth listener
      initializeAuth: async () => {
        // Get initial session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const user = await authService.getCurrentUser();
          if (user) {
            set({
              user,
              token: session.access_token,
              refreshToken: session.refresh_token,
              isAuthenticated: true,
              isEmailVerified: user.emailVerified || false,
              twoFactorEnabled: user.twoFactorEnabled || false,
              permissions: user.permissions || []
            });
            
            // Initialize messaging service with auth
            try {
              await messagingService.reinitializeWithAuth();
            } catch (error) {
              console.error('Failed to initialize messaging service:', error);
            }
          }
        }

        // Listen for auth changes
        supabase.auth.onAuthStateChange(async (event: string, session: any) => {
          if (event === 'SIGNED_IN' && session?.user) {
            const user = await authService.getCurrentUser();
            if (user) {
              set({
                user,
                token: session.access_token,
                refreshToken: session.refresh_token,
                isAuthenticated: true,
                isEmailVerified: user.emailVerified || false,
                twoFactorEnabled: user.twoFactorEnabled || false,
                permissions: user.permissions || []
              });
              
              // Initialize messaging service with auth
              try {
                await messagingService.reinitializeWithAuth();
              } catch (error) {
                console.error('Failed to initialize messaging service:', error);
              }
            }
          } else if (event === 'SIGNED_OUT') {
            set({
              user: null,
              token: null,
              refreshToken: null,
              isAuthenticated: false,
              isEmailVerified: false,
              twoFactorEnabled: false,
              permissions: []
            });
            
            // Disconnect messaging service
            try {
              messagingService.disconnectWebSocket();
            } catch (error) {
              console.error('Failed to disconnect messaging service:', error);
            }
          } else if (event === 'TOKEN_REFRESHED' && session) {
            set({
              token: session.access_token,
              refreshToken: session.refresh_token
            });
          }
        });
      },

      hasPermission: (permission: Permission) => {
        const { permissions } = get();
        return permissions.includes(permission);
      },

      hasRole: (role: UserRole) => {
        const { user } = get();
        return user?.role === role;
      },

      canAccessRoute: (route: string) => {
        const { user } = get();
        if (!user) return false;
        return authService.canAccessRoute(user.role, route);
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        isEmailVerified: state.isEmailVerified,
        twoFactorEnabled: state.twoFactorEnabled,
        permissions: state.permissions
      })
    }
  )
);