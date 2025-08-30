import { supabase } from '../lib/supabase';
import { 
  User, 
  UserRole, 
  LoginCredentials, 
  RegisterData, 
  AuthResponse,
  PasswordResetRequest,
  PasswordReset,
  PasswordChange,
  Permission,
  DEFAULT_ROLE_PERMISSIONS
} from '../types/auth';
import { getUserProfile, createUserProfile } from './userService';
import type { AuthError } from '@supabase/supabase-js';

class AuthService {
  // Convert Supabase user to our User type
  private async convertSupabaseUser(supabaseUser: any, userProfile?: any): Promise<User> {
    const profile = userProfile || await getUserProfile(supabaseUser.id);
    
    return {
      id: supabaseUser.id,
      email: supabaseUser.email,
      firstName: profile?.first_name || '',
      lastName: profile?.last_name || '',
      role: profile?.role || UserRole.BUYER,
      avatar: supabaseUser.user_metadata?.avatar_url,
      phone: profile?.phone || supabaseUser.phone,
      isEmailVerified: supabaseUser.email_confirmed_at !== null,
      emailVerified: supabaseUser.email_confirmed_at !== null,
      isActive: true,
      createdAt: supabaseUser.created_at,
      updatedAt: supabaseUser.updated_at || supabaseUser.created_at,
      lastLogin: supabaseUser.last_sign_in_at,
      permissions: this.getRolePermissions(profile?.role || UserRole.BUYER)
    };
  }

  private getRolePermissions(role: UserRole): Permission[] {
    return DEFAULT_ROLE_PERMISSIONS[role] || [];
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.user || !data.session) {
        throw new Error('Login failed - no user data received');
      }

      // Get user profile from our users table
      const userProfile = await getUserProfile(data.user.id);
      const user = await this.convertSupabaseUser(data.user, userProfile);

      // Store tokens in localStorage for compatibility
      localStorage.setItem('auth_token', data.session.access_token);
      localStorage.setItem('refresh_token', data.session.refresh_token);

      return {
        token: data.session.access_token,
        refreshToken: data.session.refresh_token,
        user,
        expiresIn: data.session.expires_in || 3600
      };
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    }
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
            role: data.role,
            phone: data.phone
          }
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!authData.user) {
        throw new Error('Registration failed - no user data received');
      }

      // Create user profile in our users table
      const userProfile = await createUserProfile({
        id: authData.user.id,
        email: data.email,
        role: data.role,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone
      });

      const user = await this.convertSupabaseUser(authData.user, userProfile);

      // Store tokens if session exists
      if (authData.session) {
        localStorage.setItem('auth_token', authData.session.access_token);
        localStorage.setItem('refresh_token', authData.session.refresh_token);
      }

      return {
        token: authData.session?.access_token || '',
        refreshToken: authData.session?.refresh_token || '',
        user,
        expiresIn: authData.session?.expires_in || 3600
      };
    } catch (error: any) {
      throw new Error(error.message || 'Registration failed');
    }
  }

  async refreshToken(token: string): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.refreshSession();

      if (error) {
        throw new Error('Token refresh failed');
      }

      if (!data.session || !data.user) {
        throw new Error('Token refresh failed - no session data');
      }

      const userProfile = await getUserProfile(data.user.id);
      const user = await this.convertSupabaseUser(data.user, userProfile);

      // Update stored tokens
      localStorage.setItem('auth_token', data.session.access_token);
      localStorage.setItem('refresh_token', data.session.refresh_token);

      return {
        token: data.session.access_token,
        refreshToken: data.session.refresh_token,
        user,
        expiresIn: data.session.expires_in || 3600
      };
    } catch (error: any) {
      throw new Error(error.message || 'Token refresh failed');
    }
  }

  async logout(): Promise<void> {
    try {
      await supabase.auth.signOut();
    } catch (error: any) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local storage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('auth-storage');
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        return null;
      }

      const userProfile = await getUserProfile(user.id);
      return await this.convertSupabaseUser(user, userProfile);
    } catch (error: any) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  async forgotPassword(email: string): Promise<void> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        throw new Error(error.message);
      }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to send reset email');
    }
  }

  async resetPassword(token: string, password: string): Promise<void> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        throw new Error(error.message);
      }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to reset password');
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        throw new Error(error.message);
      }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to change password');
    }
  }

  async verifyEmail(token: string): Promise<void> {
    try {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'email'
      });

      if (error) {
        throw new Error(error.message);
      }
    } catch (error: any) {
      throw new Error(error.message || 'Email verification failed');
    }
  }

  async resendVerificationEmail(email: string): Promise<void> {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email
      });

      if (error) {
        throw new Error(error.message);
      }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to resend verification email');
    }
  }

  // Role-based access control helpers
  hasRole(user: User | null, role: UserRole): boolean {
    return user?.role === role;
  }

  hasAnyRole(user: User | null, roles: UserRole[]): boolean {
    return user ? roles.includes(user.role) : false;
  }

  canAccessRoute(userRole: UserRole, route: string): boolean {
    // Define route permissions mapping
    const routePermissions: Record<string, UserRole[]> = {
      '/market-analysis': [UserRole.ADMIN, UserRole.AGENT, UserRole.LANDLORD, UserRole.BUYER],
      '/property-management': [UserRole.ADMIN, UserRole.AGENT, UserRole.LANDLORD],
      '/property-listing': [UserRole.ADMIN, UserRole.AGENT, UserRole.LANDLORD],
      '/user-management': [UserRole.ADMIN],
      '/documents': [UserRole.ADMIN, UserRole.AGENT, UserRole.LANDLORD, UserRole.SOLICITOR],
      '/tenant-portal': [UserRole.ADMIN, UserRole.AGENT, UserRole.TENANT],
      '/reports': [UserRole.ADMIN, UserRole.AGENT, UserRole.LANDLORD],
      '/bookings': [UserRole.ADMIN, UserRole.AGENT, UserRole.LANDLORD, UserRole.TENANT],
      '/communications': [UserRole.ADMIN, UserRole.AGENT, UserRole.LANDLORD, UserRole.TENANT, UserRole.BUYER, UserRole.SOLICITOR],
      '/maintenance': [UserRole.ADMIN, UserRole.AGENT, UserRole.LANDLORD, UserRole.TENANT],
      '/finances': [UserRole.ADMIN, UserRole.AGENT, UserRole.LANDLORD],
      '/crm': [UserRole.ADMIN, UserRole.AGENT]
    };
    
    const allowedRoles = routePermissions[route];
    return allowedRoles ? allowedRoles.includes(userRole) : false;
  }

  // Token management
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error: any) {
      return true;
    }
  }

  async ensureValidToken(): Promise<string | null> {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return null;
    }

    // Check if token is expired
    if (session.expires_at && session.expires_at * 1000 < Date.now()) {
      try {
        const response = await this.refreshToken(session.access_token);
        return response.token;
      } catch (error: any) {
        await this.logout();
        return null;
      }
    }

    return session.access_token;
  }
}

export const authService = new AuthService();
export default authService;