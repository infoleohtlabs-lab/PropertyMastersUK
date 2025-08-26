import { User, AuthResponse, LoginCredentials, RegisterData, UserRole } from '../types';

class AuthService {
  private baseURL = (import.meta.env.VITE_API_URL || 'http://localhost:3001') + '/api';

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseURL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const data = await response.json();
      
      // Store token in localStorage
      if (data.access_token) {
        localStorage.setItem('auth_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
      }

      return {
        token: data.access_token,
        refreshToken: data.refresh_token,
        user: data.user
      };
    } catch (error: any) {
      throw new Error(error.message || 'Network error occurred');
    }
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseURL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }

      const result = await response.json();
      
      // Store token in localStorage
      if (result.access_token) {
        localStorage.setItem('auth_token', result.access_token);
        localStorage.setItem('refresh_token', result.refresh_token);
      }

      return {
        token: result.access_token,
        refreshToken: result.refresh_token,
        user: result.user
      };
    } catch (error: any) {
      throw new Error(error.message || 'Network error occurred');
    }
  }

  async refreshToken(token: string): Promise<AuthResponse> {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      
      // Update stored tokens
      if (data.token) {
        localStorage.setItem('auth_token', data.token);
        if (data.refreshToken) {
          localStorage.setItem('refresh_token', data.refreshToken);
        }
      }

      return data;
    } catch (error: any) {
      throw new Error(error.message || 'Token refresh failed');
    }
  }

  async logout(): Promise<void> {
    try {
      const token = localStorage.getItem('auth_token');
      
      if (token) {
        await fetch(`${this.baseURL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
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
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        return null;
      }

      const response = await fetch(`${this.baseURL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get current user');
      }

      const user = await response.json();
      return user;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  async forgotPassword(email: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseURL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send reset email');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Network error occurred');
    }
  }

  async resetPassword(token: string, password: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseURL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to reset password');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Network error occurred');
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch(`${this.baseURL}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to change password');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Network error occurred');
    }
  }

  async verifyEmail(token: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseURL}/auth/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Email verification failed');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Network error occurred');
    }
  }

  async resendVerificationEmail(email: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseURL}/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to resend verification email');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Network error occurred');
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
    } catch (error) {
      return true;
    }
  }

  async ensureValidToken(): Promise<string | null> {
    const token = this.getToken();
    
    if (!token) {
      return null;
    }

    if (this.isTokenExpired(token)) {
      try {
        const response = await this.refreshToken(token);
        return response.token;
      } catch (error) {
        await this.logout();
        return null;
      }
    }

    return token;
  }
}

export const authService = new AuthService();
export default authService;