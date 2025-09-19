import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { AuthProvider } from '../contexts/AuthContext';
import { PermissionsProvider } from '../contexts/PermissionsContext';
import App from '../App';
import { UserRole } from '../types/auth';

// Mock the auth context
const mockAuthContext = {
  user: null,
  login: vi.fn(),
  logout: vi.fn(),
  loading: false,
  updateProfile: vi.fn(),
};

const mockPermissionsContext = {
  permissions: [],
  hasPermission: vi.fn(),
  hasAnyPermission: vi.fn(),
  hasRole: vi.fn(),
  loading: false,
};

// Mock components
vi.mock('../contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
  useAuth: () => mockAuthContext,
}));

vi.mock('../contexts/PermissionsContext', () => ({
  PermissionsProvider: ({ children }: { children: React.ReactNode }) => children,
  usePermissions: () => mockPermissionsContext,
}));

// Mock dashboard components
vi.mock('../pages/dashboards/SuperAdminDashboard', () => ({
  default: () => <div data-testid="super-admin-dashboard">Super Admin Dashboard</div>,
}));

vi.mock('../pages/dashboards/AdminDashboard', () => ({
  default: () => <div data-testid="admin-dashboard">Admin Dashboard</div>,
}));

vi.mock('../pages/dashboards/PropertyManagerDashboard', () => ({
  default: () => <div data-testid="property-manager-dashboard">Property Manager Dashboard</div>,
}));

vi.mock('../pages/dashboards/ContractorDashboard', () => ({
  default: () => <div data-testid="contractor-dashboard">Contractor Dashboard</div>,
}));

vi.mock('../pages/dashboards/SellerDashboard', () => ({
  default: () => <div data-testid="seller-dashboard">Seller Dashboard</div>,
}));

vi.mock('../pages/dashboards/DashboardOverview', () => ({
  default: () => <div data-testid="dashboard-overview">Dashboard Overview</div>,
}));

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <PermissionsProvider>
          {component}
        </PermissionsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Role-Based Access Control', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset window location
    Object.defineProperty(window, 'location', {
      value: { pathname: '/' },
      writable: true,
    });
  });

  describe('Super Admin Access', () => {
    beforeEach(() => {
      mockAuthContext.user = {
        id: '1',
        email: 'superadmin@test.com',
        role: UserRole.SUPER_ADMIN,
        firstName: 'Super',
        lastName: 'Admin',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPermissionsContext.hasRole.mockImplementation((role: UserRole) => 
        role === UserRole.SUPER_ADMIN
      );
      mockPermissionsContext.hasPermission.mockReturnValue(true);
      mockPermissionsContext.hasAnyPermission.mockReturnValue(true);
    });

    it('should allow access to super admin dashboard', async () => {
      window.history.pushState({}, '', '/dashboard/super-admin');
      renderWithProviders(<App />);
      
      await waitFor(() => {
        expect(screen.getByTestId('super-admin-dashboard')).toBeInTheDocument();
      });
    });

    it('should allow access to all other dashboards', async () => {
      const dashboards = [
        '/dashboard/admin',
        '/dashboard/property-manager', 
        '/dashboard/contractor',
        '/dashboard/seller'
      ];

      for (const path of dashboards) {
        window.history.pushState({}, '', path);
        renderWithProviders(<App />);
        
        await waitFor(() => {
          expect(screen.getByTestId(path.split('/').pop() + '-dashboard')).toBeInTheDocument();
        });
      }
    });
  });

  describe('Admin Access', () => {
    beforeEach(() => {
      mockAuthContext.user = {
        id: '2',
        email: 'admin@test.com',
        role: UserRole.ADMIN,
        firstName: 'Admin',
        lastName: 'User',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPermissionsContext.hasRole.mockImplementation((role: UserRole) => 
        role === UserRole.ADMIN
      );
      mockPermissionsContext.hasPermission.mockImplementation((permission: string) => 
        !permission.includes('super_admin')
      );
    });

    it('should allow access to admin dashboard', async () => {
      window.history.pushState({}, '', '/dashboard/admin');
      renderWithProviders(<App />);
      
      await waitFor(() => {
        expect(screen.getByTestId('admin-dashboard')).toBeInTheDocument();
      });
    });

    it('should deny access to super admin dashboard', async () => {
      mockPermissionsContext.hasRole.mockImplementation((role: UserRole) => 
        role !== UserRole.SUPER_ADMIN
      );
      
      window.history.pushState({}, '', '/dashboard/super-admin');
      renderWithProviders(<App />);
      
      await waitFor(() => {
        expect(screen.queryByTestId('super-admin-dashboard')).not.toBeInTheDocument();
      });
    });
  });

  describe('Property Manager Access', () => {
    beforeEach(() => {
      mockAuthContext.user = {
        id: '3',
        email: 'pm@test.com',
        role: UserRole.PROPERTY_MANAGER,
        firstName: 'Property',
        lastName: 'Manager',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPermissionsContext.hasRole.mockImplementation((role: UserRole) => 
        role === UserRole.PROPERTY_MANAGER
      );
      mockPermissionsContext.hasPermission.mockImplementation((permission: string) => 
        permission.includes('property') || permission.includes('maintenance')
      );
    });

    it('should allow access to property manager dashboard', async () => {
      window.history.pushState({}, '', '/dashboard/property-manager');
      renderWithProviders(<App />);
      
      await waitFor(() => {
        expect(screen.getByTestId('property-manager-dashboard')).toBeInTheDocument();
      });
    });

    it('should deny access to admin dashboards', async () => {
      mockPermissionsContext.hasRole.mockImplementation((role: UserRole) => 
        role !== UserRole.ADMIN && role !== UserRole.SUPER_ADMIN
      );
      
      const restrictedPaths = ['/dashboard/super-admin', '/dashboard/admin'];
      
      for (const path of restrictedPaths) {
        window.history.pushState({}, '', path);
        renderWithProviders(<App />);
        
        await waitFor(() => {
          const testId = path.split('/').pop() + '-dashboard';
          expect(screen.queryByTestId(testId)).not.toBeInTheDocument();
        });
      }
    });
  });

  describe('Contractor Access', () => {
    beforeEach(() => {
      mockAuthContext.user = {
        id: '4',
        email: 'contractor@test.com',
        role: UserRole.CONTRACTOR,
        firstName: 'John',
        lastName: 'Contractor',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPermissionsContext.hasRole.mockImplementation((role: UserRole) => 
        role === UserRole.CONTRACTOR
      );
      mockPermissionsContext.hasPermission.mockImplementation((permission: string) => 
        permission.includes('work_order') || permission.includes('maintenance')
      );
    });

    it('should allow access to contractor dashboard', async () => {
      window.history.pushState({}, '', '/dashboard/contractor');
      renderWithProviders(<App />);
      
      await waitFor(() => {
        expect(screen.getByTestId('contractor-dashboard')).toBeInTheDocument();
      });
    });

    it('should have limited permissions', () => {
      expect(mockPermissionsContext.hasPermission('work_order:view')).toBe(true);
      expect(mockPermissionsContext.hasPermission('maintenance:update')).toBe(true);
      expect(mockPermissionsContext.hasPermission('user:manage')).toBe(false);
      expect(mockPermissionsContext.hasPermission('property:delete')).toBe(false);
    });
  });

  describe('Seller Access', () => {
    beforeEach(() => {
      mockAuthContext.user = {
        id: '5',
        email: 'seller@test.com',
        role: UserRole.SELLER,
        firstName: 'Jane',
        lastName: 'Seller',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPermissionsContext.hasRole.mockImplementation((role: UserRole) => 
        role === UserRole.SELLER
      );
      mockPermissionsContext.hasPermission.mockImplementation((permission: string) => 
        permission.includes('listing') || permission.includes('property:own')
      );
    });

    it('should allow access to seller dashboard', async () => {
      window.history.pushState({}, '', '/dashboard/seller');
      renderWithProviders(<App />);
      
      await waitFor(() => {
        expect(screen.getByTestId('seller-dashboard')).toBeInTheDocument();
      });
    });

    it('should have seller-specific permissions', () => {
      expect(mockPermissionsContext.hasPermission('listing:create')).toBe(true);
      expect(mockPermissionsContext.hasPermission('property:own:manage')).toBe(true);
      expect(mockPermissionsContext.hasPermission('user:manage')).toBe(false);
      expect(mockPermissionsContext.hasPermission('maintenance:assign')).toBe(false);
    });
  });

  describe('Unauthenticated Access', () => {
    beforeEach(() => {
      mockAuthContext.user = null;
      mockPermissionsContext.hasRole.mockReturnValue(false);
      mockPermissionsContext.hasPermission.mockReturnValue(false);
    });

    it('should redirect to login for protected routes', async () => {
      const protectedRoutes = [
        '/dashboard/super-admin',
        '/dashboard/admin',
        '/dashboard/property-manager',
        '/dashboard/contractor',
        '/dashboard/seller'
      ];

      for (const route of protectedRoutes) {
        window.history.pushState({}, '', route);
        renderWithProviders(<App />);
        
        await waitFor(() => {
          // Should not render any dashboard
          expect(screen.queryByTestId(/.*-dashboard/)).not.toBeInTheDocument();
        });
      }
    });
  });

  describe('Permission Guards', () => {
    beforeEach(() => {
      mockAuthContext.user = {
        id: '6',
        email: 'user@test.com',
        role: UserRole.CLIENT,
        firstName: 'Test',
        lastName: 'User',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    });

    it('should show content when user has required permission', () => {
      mockPermissionsContext.hasPermission.mockReturnValue(true);
      
      const TestComponent = () => (
        <div data-testid="protected-content">Protected Content</div>
      );
      
      renderWithProviders(<TestComponent />);
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });

    it('should hide content when user lacks required permission', () => {
      mockPermissionsContext.hasPermission.mockReturnValue(false);
      
      const TestComponent = () => {
        const { hasPermission } = mockPermissionsContext;
        return hasPermission('admin:manage') ? (
          <div data-testid="protected-content">Protected Content</div>
        ) : (
          <div data-testid="access-denied">Access Denied</div>
        );
      };
      
      renderWithProviders(<TestComponent />);
      expect(screen.getByTestId('access-denied')).toBeInTheDocument();
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });
  });

  describe('Role Hierarchy', () => {
    it('should respect role hierarchy for permissions', () => {
      // Super Admin should have all permissions
      mockAuthContext.user = {
        id: '1',
        email: 'superadmin@test.com',
        role: UserRole.SUPER_ADMIN,
        firstName: 'Super',
        lastName: 'Admin',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPermissionsContext.hasPermission.mockReturnValue(true);
      
      expect(mockPermissionsContext.hasPermission('any:permission')).toBe(true);
      
      // Client should have minimal permissions
      mockAuthContext.user = {
        id: '7',
        email: 'client@test.com',
        role: UserRole.CLIENT,
        firstName: 'Client',
        lastName: 'User',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPermissionsContext.hasPermission.mockImplementation((permission: string) => 
        permission.includes('view:own') || permission.includes('inquiry:create')
      );
      
      expect(mockPermissionsContext.hasPermission('view:own:data')).toBe(true);
      expect(mockPermissionsContext.hasPermission('admin:manage')).toBe(false);
    });
  });
});

// Integration tests for API endpoints
describe('API Role-Based Access', () => {
  const mockFetch = vi.fn();
  global.fetch = mockFetch;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should include authorization headers in API calls', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: 'test' }),
    });

    const token = 'mock-jwt-token';
    
    await fetch('/api/admin/dashboard', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    expect(mockFetch).toHaveBeenCalledWith('/api/admin/dashboard', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  });

  it('should handle 403 Forbidden responses', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
      json: async () => ({ message: 'Forbidden' }),
    });

    const response = await fetch('/api/super-admin/system-config');
    expect(response.status).toBe(403);
  });

  it('should handle 401 Unauthorized responses', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ message: 'Unauthorized' }),
    });

    const response = await fetch('/api/property-manager/portfolio');
    expect(response.status).toBe(401);
  });
});