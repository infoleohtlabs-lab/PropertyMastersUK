import React from 'react';
import { Permission, UserRole } from '@/utils/permissions';
import { usePermissions } from '@/hooks/usePermissions';

interface PermissionGuardProps {
  children: React.ReactNode;
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean; // If true, requires all permissions; if false, requires any permission
  role?: UserRole;
  roles?: UserRole[];
  requireExactRole?: boolean; // If true, requires exact role match; if false, allows higher roles
  dashboardAccess?: string;
  fallback?: React.ReactNode;
  inverse?: boolean; // If true, shows content when permission is NOT granted
  loading?: React.ReactNode;
}

/**
 * PermissionGuard component for conditional rendering based on user permissions and roles
 * 
 * Usage examples:
 * 
 * // Check single permission
 * <PermissionGuard permission={Permission.PROPERTY_CREATE}>
 *   <CreatePropertyButton />
 * </PermissionGuard>
 * 
 * // Check multiple permissions (any)
 * <PermissionGuard permissions={[Permission.PROPERTY_READ, Permission.PROPERTY_UPDATE]}>
 *   <PropertyActions />
 * </PermissionGuard>
 * 
 * // Check multiple permissions (all required)
 * <PermissionGuard permissions={[Permission.PROPERTY_CREATE, Permission.PROPERTY_PUBLISH]} requireAll>
 *   <PublishPropertyButton />
 * </PermissionGuard>
 * 
 * // Check specific role
 * <PermissionGuard role={UserRole.ADMIN}>
 *   <AdminPanel />
 * </PermissionGuard>
 * 
 * // Check multiple roles
 * <PermissionGuard roles={[UserRole.ADMIN, UserRole.MANAGER]}>
 *   <ManagementTools />
 * </PermissionGuard>
 * 
 * // Check dashboard access
 * <PermissionGuard dashboardAccess="admin">
 *   <AdminDashboard />
 * </PermissionGuard>
 * 
 * // Show fallback content
 * <PermissionGuard permission={Permission.PROPERTY_CREATE} fallback={<div>Access Denied</div>}>
 *   <CreatePropertyForm />
 * </PermissionGuard>
 * 
 * // Inverse logic (show when permission is NOT granted)
 * <PermissionGuard permission={Permission.SYSTEM_ADMIN} inverse>
 *   <LimitedFeatureNotice />
 * </PermissionGuard>
 */
export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  permission,
  permissions,
  requireAll = false,
  role,
  roles,
  requireExactRole = false,
  dashboardAccess,
  fallback = null,
  inverse = false,
  loading = null
}) => {
  const {
    userRole,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccessDashboard,
    isEqualOrHigherRole
  } = usePermissions();

  // Show loading state if user role is not yet loaded
  if (!userRole) {
    return <>{loading}</>;
  }

  let hasAccess = true;

  // Check single permission
  if (permission) {
    hasAccess = hasAccess && hasPermission(permission);
  }

  // Check multiple permissions
  if (permissions && permissions.length > 0) {
    if (requireAll) {
      hasAccess = hasAccess && hasAllPermissions(permissions);
    } else {
      hasAccess = hasAccess && hasAnyPermission(permissions);
    }
  }

  // Check single role
  if (role) {
    if (requireExactRole) {
      hasAccess = hasAccess && userRole === role;
    } else {
      hasAccess = hasAccess && isEqualOrHigherRole(userRole, role);
    }
  }

  // Check multiple roles
  if (roles && roles.length > 0) {
    if (requireExactRole) {
      hasAccess = hasAccess && roles.includes(userRole);
    } else {
      hasAccess = hasAccess && roles.some(r => isEqualOrHigherRole(userRole, r));
    }
  }

  // Check dashboard access
  if (dashboardAccess) {
    hasAccess = hasAccess && canAccessDashboard(dashboardAccess);
  }

  // Apply inverse logic if specified
  if (inverse) {
    hasAccess = !hasAccess;
  }

  // Render based on access
  if (hasAccess) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};

/**
 * Higher-order component version of PermissionGuard
 */
export const withPermissionGuard = <P extends object>(
  Component: React.ComponentType<P>,
  guardProps: Omit<PermissionGuardProps, 'children'>
) => {
  return (props: P) => (
    <PermissionGuard {...guardProps}>
      <Component {...props} />
    </PermissionGuard>
  );
};

/**
 * Specialized guards for common use cases
 */

// Admin-only guard
export const AdminGuard: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback
}) => (
  <PermissionGuard roles={[UserRole.ADMIN, UserRole.SUPER_ADMIN]} fallback={fallback}>
    {children}
  </PermissionGuard>
);

// Super Admin-only guard
export const SuperAdminGuard: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback
}) => (
  <PermissionGuard role={UserRole.SUPER_ADMIN} requireExactRole fallback={fallback}>
    {children}
  </PermissionGuard>
);

// Manager and above guard
export const ManagerGuard: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback
}) => (
  <PermissionGuard roles={[UserRole.MANAGER, UserRole.ADMIN, UserRole.SUPER_ADMIN]} fallback={fallback}>
    {children}
  </PermissionGuard>
);

// Property management guard
export const PropertyManagerGuard: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback
}) => (
  <PermissionGuard 
    permissions={[Permission.PROPERTY_READ, Permission.PROPERTY_UPDATE]} 
    fallback={fallback}
  >
    {children}
  </PermissionGuard>
);

// Financial access guard
export const FinancialGuard: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback
}) => (
  <PermissionGuard permission={Permission.FINANCE_READ} fallback={fallback}>
    {children}
  </PermissionGuard>
);

// System administration guard
export const SystemAdminGuard: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback
}) => (
  <PermissionGuard permission={Permission.SYSTEM_ADMIN} fallback={fallback}>
    {children}
  </PermissionGuard>
);

// User management guard
export const UserManagementGuard: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback
}) => (
  <PermissionGuard 
    permissions={[Permission.USER_READ, Permission.USER_UPDATE]} 
    fallback={fallback}
  >
    {children}
  </PermissionGuard>
);

// Maintenance management guard
export const MaintenanceGuard: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback
}) => (
  <PermissionGuard 
    permissions={[Permission.MAINTENANCE_READ, Permission.MAINTENANCE_UPDATE]} 
    fallback={fallback}
  >
    {children}
  </PermissionGuard>
);

// Document management guard
export const DocumentGuard: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback
}) => (
  <PermissionGuard 
    permissions={[Permission.DOCUMENT_READ, Permission.DOCUMENT_UPDATE]} 
    fallback={fallback}
  >
    {children}
  </PermissionGuard>
);

// Analytics access guard
export const AnalyticsGuard: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback
}) => (
  <PermissionGuard permission={Permission.ANALYTICS_VIEW} fallback={fallback}>
    {children}
  </PermissionGuard>
);

export default PermissionGuard;