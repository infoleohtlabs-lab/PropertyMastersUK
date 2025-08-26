import * as React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { UserRole } from '../../types';
import { authService } from '../../services/authService';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
  requireAuth?: boolean;
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles = [],
  requireAuth = true,
  redirectTo = '/auth/login'
}) => {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return (
      <Navigate 
        to={redirectTo} 
        state={{ from: location.pathname }} 
        replace 
      />
    );
  }

  // If specific roles are required, check if user has the required role
  if (requiredRoles.length > 0 && user) {
    const hasRequiredRole = authService.hasAnyRole(user, requiredRoles);
    
    if (!hasRequiredRole) {
      return (
        <Navigate 
          to="/unauthorized" 
          state={{ 
            from: location.pathname,
            requiredRoles,
            userRole: user.role 
          }} 
          replace 
        />
      );
    }
  }

  // If user is authenticated but trying to access auth pages (and not logging out), redirect to dashboard
  if (isAuthenticated && !requireAuth && (location.pathname.includes('/login') || location.pathname.includes('/register'))) {
    const dashboardPath = getDashboardPath(user?.role);
    return <Navigate to={dashboardPath} replace />;
  }

  return <>{children}</>;
};

// Helper function to get dashboard path based on user role
const getDashboardPath = (role?: UserRole): string => {
  switch (role) {
    case UserRole.ADMIN:
      return '/admin/dashboard';
    case UserRole.AGENT:
      return '/agent/dashboard';
    case UserRole.LANDLORD:
      return '/landlord/dashboard';
    case UserRole.TENANT:
      return '/tenant/dashboard';
    case UserRole.BUYER:
      return '/buyer/dashboard';
    case UserRole.SOLICITOR:
      return '/solicitor/dashboard';
    default:
      return '/dashboard';
  }
};

export default ProtectedRoute;

// Higher-order component for role-based access
export const withRoleAccess = (allowedRoles: UserRole[]) => {
  return (Component: React.ComponentType<any>) => {
    return (props: any) => (
      <ProtectedRoute requiredRoles={allowedRoles}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
};

// Specific role-based HOCs
export const withAdminAccess = withRoleAccess([UserRole.ADMIN]);
export const withAgentAccess = withRoleAccess([UserRole.ADMIN, UserRole.AGENT]);
export const withLandlordAccess = withRoleAccess([UserRole.ADMIN, UserRole.AGENT, UserRole.LANDLORD]);
export const withTenantAccess = withRoleAccess([UserRole.ADMIN, UserRole.AGENT, UserRole.TENANT]);
export const withBuyerAccess = withRoleAccess([UserRole.ADMIN, UserRole.AGENT, UserRole.BUYER]);
export const withSolicitorAccess = withRoleAccess([UserRole.ADMIN, UserRole.SOLICITOR]);

// Component to check permissions within components
export const PermissionGate: React.FC<{
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallback?: React.ReactNode;
}> = ({ children, allowedRoles, fallback = null }) => {
  const { user } = useAuthStore();
  
  if (!user || !authService.hasAnyRole(user, allowedRoles)) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
};

// Hook for checking permissions
export const usePermissions = () => {
  const { user } = useAuthStore();
  
  const hasRole = (role: UserRole) => {
    return authService.hasRole(user, role);
  };
  
  const hasAnyRole = (roles: UserRole[]) => {
    return authService.hasAnyRole(user, roles);
  };
  
  const canAccess = (requiredRoles: UserRole[]) => {
    return authService.hasAnyRole(user, requiredRoles);
  };
  
  return {
    user,
    hasRole,
    hasAnyRole,
    canAccess,
    isAdmin: hasRole(UserRole.ADMIN),
    isAgent: hasRole(UserRole.AGENT),
    isLandlord: hasRole(UserRole.LANDLORD),
    isTenant: hasRole(UserRole.TENANT),
    isBuyer: hasRole(UserRole.BUYER),
    isSolicitor: hasRole(UserRole.SOLICITOR),
  };
};