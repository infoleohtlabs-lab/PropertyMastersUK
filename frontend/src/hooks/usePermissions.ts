import { useContext, useMemo } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { Permission, PermissionManager, UserRole } from '@/utils/permissions';

/**
 * Custom hook for permission checking and role-based access control
 */
export const usePermissions = () => {
  const { user } = useContext(AuthContext);
  
  const userRole = user?.role as UserRole;

  // Memoize permission checks for performance
  const permissionUtils = useMemo(() => {
    if (!userRole) {
      return {
        hasPermission: () => false,
        hasAnyPermission: () => false,
        hasAllPermissions: () => false,
        canAccessDashboard: () => false,
        canManageUser: () => false,
        isHigherRole: () => false,
        isEqualOrHigherRole: () => false,
        getRolePermissions: () => [],
        getLowerRoles: () => [],
        getEqualOrLowerRoles: () => []
      };
    }

    return {
      /**
       * Check if the current user has a specific permission
       */
      hasPermission: (permission: Permission): boolean => {
        return PermissionManager.hasPermission(userRole, permission);
      },

      /**
       * Check if the current user has any of the specified permissions
       */
      hasAnyPermission: (permissions: Permission[]): boolean => {
        return PermissionManager.hasAnyPermission(userRole, permissions);
      },

      /**
       * Check if the current user has all of the specified permissions
       */
      hasAllPermissions: (permissions: Permission[]): boolean => {
        return PermissionManager.hasAllPermissions(userRole, permissions);
      },

      /**
       * Check if the current user can access a specific dashboard
       */
      canAccessDashboard: (dashboardType: string): boolean => {
        return PermissionManager.canAccessDashboard(userRole, dashboardType);
      },

      /**
       * Check if the current user can manage another user
       */
      canManageUser: (targetRole: UserRole): boolean => {
        return PermissionManager.canManageUser(userRole, targetRole);
      },

      /**
       * Check if the current user has a higher role than the specified role
       */
      isHigherRole: (targetRole: UserRole): boolean => {
        return PermissionManager.isHigherRole(userRole, targetRole);
      },

      /**
       * Check if the current user has an equal or higher role than the specified role
       */
      isEqualOrHigherRole: (targetRole: UserRole): boolean => {
        return PermissionManager.isEqualOrHigherRole(userRole, targetRole);
      },

      /**
       * Get all permissions for the current user's role
       */
      getRolePermissions: (): Permission[] => {
        return PermissionManager.getRolePermissions(userRole);
      },

      /**
       * Get roles that are lower in hierarchy than the current user's role
       */
      getLowerRoles: (): UserRole[] => {
        return PermissionManager.getLowerRoles(userRole);
      },

      /**
       * Get roles that are equal or lower in hierarchy than the current user's role
       */
      getEqualOrLowerRoles: (): UserRole[] => {
        return PermissionManager.getEqualOrLowerRoles(userRole);
      }
    };
  }, [userRole]);

  return {
    userRole,
    user,
    isAuthenticated: !!user,
    ...permissionUtils
  };
};

/**
 * Hook for checking specific permissions with loading states
 */
export const usePermissionCheck = (permission: Permission) => {
  const { hasPermission, userRole } = usePermissions();
  
  return {
    hasPermission: hasPermission(permission),
    isLoading: !userRole,
    userRole
  };
};

/**
 * Hook for checking multiple permissions
 */
export const useMultiplePermissions = (permissions: Permission[]) => {
  const { hasAnyPermission, hasAllPermissions, userRole } = usePermissions();
  
  return {
    hasAnyPermission: hasAnyPermission(permissions),
    hasAllPermissions: hasAllPermissions(permissions),
    isLoading: !userRole,
    userRole
  };
};

/**
 * Hook for dashboard access checking
 */
export const useDashboardAccess = (dashboardType: string) => {
  const { canAccessDashboard, userRole } = usePermissions();
  
  return {
    canAccess: canAccessDashboard(dashboardType),
    isLoading: !userRole,
    userRole
  };
};

/**
 * Hook for role hierarchy checking
 */
export const useRoleHierarchy = () => {
  const { 
    userRole, 
    isHigherRole, 
    isEqualOrHigherRole, 
    canManageUser,
    getLowerRoles,
    getEqualOrLowerRoles
  } = usePermissions();
  
  return {
    userRole,
    isHigherRole,
    isEqualOrHigherRole,
    canManageUser,
    getLowerRoles,
    getEqualOrLowerRoles,
    isLoading: !userRole
  };
};

export default usePermissions;