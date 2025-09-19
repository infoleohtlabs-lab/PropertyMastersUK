import { UserRole } from '@/types/auth';

// Define granular permissions
export enum Permission {
  // System Administration
  SYSTEM_ADMIN = 'system:admin',
  SYSTEM_CONFIG = 'system:config',
  SYSTEM_MONITORING = 'system:monitoring',
  SYSTEM_BACKUP = 'system:backup',
  SYSTEM_LOGS = 'system:logs',
  
  // User Management
  USER_CREATE = 'user:create',
  USER_READ = 'user:read',
  USER_UPDATE = 'user:update',
  USER_DELETE = 'user:delete',
  USER_ROLES = 'user:roles',
  USER_PERMISSIONS = 'user:permissions',
  
  // Property Management
  PROPERTY_CREATE = 'property:create',
  PROPERTY_READ = 'property:read',
  PROPERTY_UPDATE = 'property:update',
  PROPERTY_DELETE = 'property:delete',
  PROPERTY_PUBLISH = 'property:publish',
  PROPERTY_ANALYTICS = 'property:analytics',
  PROPERTY_BULK_OPERATIONS = 'property:bulk_operations',
  
  // Financial Management
  FINANCE_READ = 'finance:read',
  FINANCE_CREATE = 'finance:create',
  FINANCE_UPDATE = 'finance:update',
  FINANCE_DELETE = 'finance:delete',
  FINANCE_REPORTS = 'finance:reports',
  FINANCE_TRANSACTIONS = 'finance:transactions',
  
  // Booking Management
  BOOKING_CREATE = 'booking:create',
  BOOKING_READ = 'booking:read',
  BOOKING_UPDATE = 'booking:update',
  BOOKING_DELETE = 'booking:delete',
  BOOKING_APPROVE = 'booking:approve',
  BOOKING_CANCEL = 'booking:cancel',
  
  // Communication
  MESSAGE_SEND = 'message:send',
  MESSAGE_READ = 'message:read',
  MESSAGE_DELETE = 'message:delete',
  NOTIFICATION_SEND = 'notification:send',
  NOTIFICATION_MANAGE = 'notification:manage',
  
  // Maintenance & Work Orders
  MAINTENANCE_CREATE = 'maintenance:create',
  MAINTENANCE_READ = 'maintenance:read',
  MAINTENANCE_UPDATE = 'maintenance:update',
  MAINTENANCE_DELETE = 'maintenance:delete',
  MAINTENANCE_ASSIGN = 'maintenance:assign',
  MAINTENANCE_COMPLETE = 'maintenance:complete',
  
  // Document Management
  DOCUMENT_CREATE = 'document:create',
  DOCUMENT_READ = 'document:read',
  DOCUMENT_UPDATE = 'document:update',
  DOCUMENT_DELETE = 'document:delete',
  DOCUMENT_SIGN = 'document:sign',
  
  // Analytics & Reporting
  ANALYTICS_VIEW = 'analytics:view',
  ANALYTICS_EXPORT = 'analytics:export',
  REPORTS_GENERATE = 'reports:generate',
  REPORTS_SCHEDULE = 'reports:schedule',
  
  // Staff Management
  STAFF_CREATE = 'staff:create',
  STAFF_READ = 'staff:read',
  STAFF_UPDATE = 'staff:update',
  STAFF_DELETE = 'staff:delete',
  STAFF_ASSIGN = 'staff:assign',
  
  // Contractor Management
  CONTRACTOR_CREATE = 'contractor:create',
  CONTRACTOR_READ = 'contractor:read',
  CONTRACTOR_UPDATE = 'contractor:update',
  CONTRACTOR_DELETE = 'contractor:delete',
  CONTRACTOR_RATE = 'contractor:rate',
  
  // Listing Management
  LISTING_CREATE = 'listing:create',
  LISTING_READ = 'listing:read',
  LISTING_UPDATE = 'listing:update',
  LISTING_DELETE = 'listing:delete',
  LISTING_FEATURE = 'listing:feature',
  LISTING_MARKET_ANALYSIS = 'listing:market_analysis',
  
  // Offer Management
  OFFER_CREATE = 'offer:create',
  OFFER_READ = 'offer:read',
  OFFER_UPDATE = 'offer:update',
  OFFER_DELETE = 'offer:delete',
  OFFER_ACCEPT = 'offer:accept',
  OFFER_COUNTER = 'offer:counter',
  
  // Viewing Management
  VIEWING_CREATE = 'viewing:create',
  VIEWING_READ = 'viewing:read',
  VIEWING_UPDATE = 'viewing:update',
  VIEWING_DELETE = 'viewing:delete',
  VIEWING_SCHEDULE = 'viewing:schedule',
  
  // Profile Management
  PROFILE_READ = 'profile:read',
  PROFILE_UPDATE = 'profile:update',
  PROFILE_DELETE = 'profile:delete'
}

// Define role hierarchy levels
export enum RoleLevel {
  SUPER_ADMIN = 10,
  ADMIN = 9,
  MANAGER = 8,
  PROPERTY_MANAGER = 7,
  AGENT = 6,
  LANDLORD = 5,
  CONTRACTOR = 4,
  SELLER = 3,
  SOLICITOR = 3,
  BUYER = 2,
  TENANT = 2,
  VIEWER = 1,
  USER = 0
}

// Map roles to their hierarchy levels
export const ROLE_HIERARCHY: Record<UserRole, RoleLevel> = {
  [UserRole.SUPER_ADMIN]: RoleLevel.SUPER_ADMIN,
  [UserRole.ADMIN]: RoleLevel.ADMIN,
  [UserRole.MANAGER]: RoleLevel.MANAGER,
  [UserRole.PROPERTY_MANAGER]: RoleLevel.PROPERTY_MANAGER,
  [UserRole.AGENT]: RoleLevel.AGENT,
  [UserRole.LANDLORD]: RoleLevel.LANDLORD,
  [UserRole.CONTRACTOR]: RoleLevel.CONTRACTOR,
  [UserRole.SELLER]: RoleLevel.SELLER,
  [UserRole.SOLICITOR]: RoleLevel.SOLICITOR,
  [UserRole.BUYER]: RoleLevel.BUYER,
  [UserRole.TENANT]: RoleLevel.TENANT,
  [UserRole.VIEWER]: RoleLevel.VIEWER,
  [UserRole.USER]: RoleLevel.USER
};

// Define permissions for each role
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.SUPER_ADMIN]: [
    // Full system access
    Permission.SYSTEM_ADMIN,
    Permission.SYSTEM_CONFIG,
    Permission.SYSTEM_MONITORING,
    Permission.SYSTEM_BACKUP,
    Permission.SYSTEM_LOGS,
    // Full user management
    Permission.USER_CREATE,
    Permission.USER_READ,
    Permission.USER_UPDATE,
    Permission.USER_DELETE,
    Permission.USER_ROLES,
    Permission.USER_PERMISSIONS,
    // Full property management
    Permission.PROPERTY_CREATE,
    Permission.PROPERTY_READ,
    Permission.PROPERTY_UPDATE,
    Permission.PROPERTY_DELETE,
    Permission.PROPERTY_PUBLISH,
    Permission.PROPERTY_ANALYTICS,
    Permission.PROPERTY_BULK_OPERATIONS,
    // Full financial access
    Permission.FINANCE_READ,
    Permission.FINANCE_CREATE,
    Permission.FINANCE_UPDATE,
    Permission.FINANCE_DELETE,
    Permission.FINANCE_REPORTS,
    Permission.FINANCE_TRANSACTIONS,
    // All other permissions
    Permission.BOOKING_CREATE,
    Permission.BOOKING_READ,
    Permission.BOOKING_UPDATE,
    Permission.BOOKING_DELETE,
    Permission.BOOKING_APPROVE,
    Permission.BOOKING_CANCEL,
    Permission.MESSAGE_SEND,
    Permission.MESSAGE_READ,
    Permission.MESSAGE_DELETE,
    Permission.NOTIFICATION_SEND,
    Permission.NOTIFICATION_MANAGE,
    Permission.MAINTENANCE_CREATE,
    Permission.MAINTENANCE_READ,
    Permission.MAINTENANCE_UPDATE,
    Permission.MAINTENANCE_DELETE,
    Permission.MAINTENANCE_ASSIGN,
    Permission.MAINTENANCE_COMPLETE,
    Permission.DOCUMENT_CREATE,
    Permission.DOCUMENT_READ,
    Permission.DOCUMENT_UPDATE,
    Permission.DOCUMENT_DELETE,
    Permission.DOCUMENT_SIGN,
    Permission.ANALYTICS_VIEW,
    Permission.ANALYTICS_EXPORT,
    Permission.REPORTS_GENERATE,
    Permission.REPORTS_SCHEDULE,
    Permission.STAFF_CREATE,
    Permission.STAFF_READ,
    Permission.STAFF_UPDATE,
    Permission.STAFF_DELETE,
    Permission.STAFF_ASSIGN,
    Permission.CONTRACTOR_CREATE,
    Permission.CONTRACTOR_READ,
    Permission.CONTRACTOR_UPDATE,
    Permission.CONTRACTOR_DELETE,
    Permission.CONTRACTOR_RATE,
    Permission.LISTING_CREATE,
    Permission.LISTING_READ,
    Permission.LISTING_UPDATE,
    Permission.LISTING_DELETE,
    Permission.LISTING_FEATURE,
    Permission.LISTING_MARKET_ANALYSIS,
    Permission.OFFER_CREATE,
    Permission.OFFER_READ,
    Permission.OFFER_UPDATE,
    Permission.OFFER_DELETE,
    Permission.OFFER_ACCEPT,
    Permission.OFFER_COUNTER,
    Permission.VIEWING_CREATE,
    Permission.VIEWING_READ,
    Permission.VIEWING_UPDATE,
    Permission.VIEWING_DELETE,
    Permission.VIEWING_SCHEDULE,
    Permission.PROFILE_READ,
    Permission.PROFILE_UPDATE,
    Permission.PROFILE_DELETE
  ],
  
  [UserRole.ADMIN]: [
    // User management (limited)
    Permission.USER_READ,
    Permission.USER_UPDATE,
    Permission.USER_ROLES,
    // Property management
    Permission.PROPERTY_CREATE,
    Permission.PROPERTY_READ,
    Permission.PROPERTY_UPDATE,
    Permission.PROPERTY_DELETE,
    Permission.PROPERTY_PUBLISH,
    Permission.PROPERTY_ANALYTICS,
    Permission.PROPERTY_BULK_OPERATIONS,
    // Financial management
    Permission.FINANCE_READ,
    Permission.FINANCE_CREATE,
    Permission.FINANCE_UPDATE,
    Permission.FINANCE_REPORTS,
    Permission.FINANCE_TRANSACTIONS,
    // Booking management
    Permission.BOOKING_CREATE,
    Permission.BOOKING_READ,
    Permission.BOOKING_UPDATE,
    Permission.BOOKING_DELETE,
    Permission.BOOKING_APPROVE,
    Permission.BOOKING_CANCEL,
    // Communication
    Permission.MESSAGE_SEND,
    Permission.MESSAGE_READ,
    Permission.MESSAGE_DELETE,
    Permission.NOTIFICATION_SEND,
    Permission.NOTIFICATION_MANAGE,
    // Maintenance
    Permission.MAINTENANCE_CREATE,
    Permission.MAINTENANCE_READ,
    Permission.MAINTENANCE_UPDATE,
    Permission.MAINTENANCE_DELETE,
    Permission.MAINTENANCE_ASSIGN,
    Permission.MAINTENANCE_COMPLETE,
    // Documents
    Permission.DOCUMENT_CREATE,
    Permission.DOCUMENT_READ,
    Permission.DOCUMENT_UPDATE,
    Permission.DOCUMENT_DELETE,
    Permission.DOCUMENT_SIGN,
    // Analytics
    Permission.ANALYTICS_VIEW,
    Permission.ANALYTICS_EXPORT,
    Permission.REPORTS_GENERATE,
    Permission.REPORTS_SCHEDULE,
    // Staff management
    Permission.STAFF_CREATE,
    Permission.STAFF_READ,
    Permission.STAFF_UPDATE,
    Permission.STAFF_DELETE,
    Permission.STAFF_ASSIGN,
    // Contractor management
    Permission.CONTRACTOR_READ,
    Permission.CONTRACTOR_UPDATE,
    Permission.CONTRACTOR_RATE,
    // Profile
    Permission.PROFILE_READ,
    Permission.PROFILE_UPDATE
  ],
  
  [UserRole.MANAGER]: [
    // Limited user management
    Permission.USER_READ,
    Permission.USER_UPDATE,
    // Property management
    Permission.PROPERTY_CREATE,
    Permission.PROPERTY_READ,
    Permission.PROPERTY_UPDATE,
    Permission.PROPERTY_PUBLISH,
    Permission.PROPERTY_ANALYTICS,
    // Financial management (limited)
    Permission.FINANCE_READ,
    Permission.FINANCE_REPORTS,
    // Booking management
    Permission.BOOKING_CREATE,
    Permission.BOOKING_READ,
    Permission.BOOKING_UPDATE,
    Permission.BOOKING_APPROVE,
    Permission.BOOKING_CANCEL,
    // Communication
    Permission.MESSAGE_SEND,
    Permission.MESSAGE_READ,
    Permission.NOTIFICATION_SEND,
    // Maintenance
    Permission.MAINTENANCE_CREATE,
    Permission.MAINTENANCE_READ,
    Permission.MAINTENANCE_UPDATE,
    Permission.MAINTENANCE_ASSIGN,
    // Documents
    Permission.DOCUMENT_CREATE,
    Permission.DOCUMENT_READ,
    Permission.DOCUMENT_UPDATE,
    Permission.DOCUMENT_SIGN,
    // Analytics
    Permission.ANALYTICS_VIEW,
    Permission.REPORTS_GENERATE,
    // Staff management
    Permission.STAFF_READ,
    Permission.STAFF_UPDATE,
    Permission.STAFF_ASSIGN,
    // Profile
    Permission.PROFILE_READ,
    Permission.PROFILE_UPDATE
  ],
  
  [UserRole.PROPERTY_MANAGER]: [
    // Property management
    Permission.PROPERTY_CREATE,
    Permission.PROPERTY_READ,
    Permission.PROPERTY_UPDATE,
    Permission.PROPERTY_ANALYTICS,
    // Booking management
    Permission.BOOKING_CREATE,
    Permission.BOOKING_READ,
    Permission.BOOKING_UPDATE,
    Permission.BOOKING_APPROVE,
    // Communication
    Permission.MESSAGE_SEND,
    Permission.MESSAGE_READ,
    // Maintenance
    Permission.MAINTENANCE_CREATE,
    Permission.MAINTENANCE_READ,
    Permission.MAINTENANCE_UPDATE,
    Permission.MAINTENANCE_ASSIGN,
    Permission.MAINTENANCE_COMPLETE,
    // Documents
    Permission.DOCUMENT_CREATE,
    Permission.DOCUMENT_READ,
    Permission.DOCUMENT_UPDATE,
    // Analytics
    Permission.ANALYTICS_VIEW,
    // Staff management (limited)
    Permission.STAFF_READ,
    Permission.STAFF_ASSIGN,
    // Contractor management
    Permission.CONTRACTOR_READ,
    Permission.CONTRACTOR_UPDATE,
    Permission.CONTRACTOR_RATE,
    // Profile
    Permission.PROFILE_READ,
    Permission.PROFILE_UPDATE
  ],
  
  [UserRole.AGENT]: [
    // Property management
    Permission.PROPERTY_CREATE,
    Permission.PROPERTY_READ,
    Permission.PROPERTY_UPDATE,
    Permission.PROPERTY_PUBLISH,
    // Booking management
    Permission.BOOKING_CREATE,
    Permission.BOOKING_READ,
    Permission.BOOKING_UPDATE,
    // Communication
    Permission.MESSAGE_SEND,
    Permission.MESSAGE_READ,
    // Documents
    Permission.DOCUMENT_CREATE,
    Permission.DOCUMENT_READ,
    Permission.DOCUMENT_UPDATE,
    Permission.DOCUMENT_SIGN,
    // Viewing management
    Permission.VIEWING_CREATE,
    Permission.VIEWING_READ,
    Permission.VIEWING_UPDATE,
    Permission.VIEWING_SCHEDULE,
    // Profile
    Permission.PROFILE_READ,
    Permission.PROFILE_UPDATE
  ],
  
  [UserRole.LANDLORD]: [
    // Property management (own properties)
    Permission.PROPERTY_READ,
    Permission.PROPERTY_UPDATE,
    // Booking management
    Permission.BOOKING_READ,
    Permission.BOOKING_UPDATE,
    Permission.BOOKING_APPROVE,
    // Communication
    Permission.MESSAGE_SEND,
    Permission.MESSAGE_READ,
    // Maintenance
    Permission.MAINTENANCE_CREATE,
    Permission.MAINTENANCE_READ,
    Permission.MAINTENANCE_UPDATE,
    // Documents
    Permission.DOCUMENT_READ,
    Permission.DOCUMENT_SIGN,
    // Financial (own properties)
    Permission.FINANCE_READ,
    // Profile
    Permission.PROFILE_READ,
    Permission.PROFILE_UPDATE
  ],
  
  [UserRole.CONTRACTOR]: [
    // Maintenance
    Permission.MAINTENANCE_READ,
    Permission.MAINTENANCE_UPDATE,
    Permission.MAINTENANCE_COMPLETE,
    // Communication
    Permission.MESSAGE_SEND,
    Permission.MESSAGE_READ,
    // Documents
    Permission.DOCUMENT_READ,
    Permission.DOCUMENT_CREATE,
    // Profile
    Permission.PROFILE_READ,
    Permission.PROFILE_UPDATE
  ],
  
  [UserRole.SELLER]: [
    // Listing management
    Permission.LISTING_CREATE,
    Permission.LISTING_READ,
    Permission.LISTING_UPDATE,
    Permission.LISTING_DELETE,
    Permission.LISTING_MARKET_ANALYSIS,
    // Offer management
    Permission.OFFER_READ,
    Permission.OFFER_ACCEPT,
    Permission.OFFER_COUNTER,
    // Viewing management
    Permission.VIEWING_READ,
    Permission.VIEWING_SCHEDULE,
    // Communication
    Permission.MESSAGE_SEND,
    Permission.MESSAGE_READ,
    // Documents
    Permission.DOCUMENT_READ,
    Permission.DOCUMENT_SIGN,
    // Profile
    Permission.PROFILE_READ,
    Permission.PROFILE_UPDATE
  ],
  
  [UserRole.SOLICITOR]: [
    // Documents
    Permission.DOCUMENT_CREATE,
    Permission.DOCUMENT_READ,
    Permission.DOCUMENT_UPDATE,
    Permission.DOCUMENT_SIGN,
    // Communication
    Permission.MESSAGE_SEND,
    Permission.MESSAGE_READ,
    // Profile
    Permission.PROFILE_READ,
    Permission.PROFILE_UPDATE
  ],
  
  [UserRole.BUYER]: [
    // Property viewing
    Permission.PROPERTY_READ,
    // Offer management
    Permission.OFFER_CREATE,
    Permission.OFFER_READ,
    Permission.OFFER_UPDATE,
    // Viewing management
    Permission.VIEWING_CREATE,
    Permission.VIEWING_READ,
    Permission.VIEWING_UPDATE,
    // Communication
    Permission.MESSAGE_SEND,
    Permission.MESSAGE_READ,
    // Documents
    Permission.DOCUMENT_READ,
    Permission.DOCUMENT_SIGN,
    // Profile
    Permission.PROFILE_READ,
    Permission.PROFILE_UPDATE
  ],
  
  [UserRole.TENANT]: [
    // Property viewing (assigned properties)
    Permission.PROPERTY_READ,
    // Booking management
    Permission.BOOKING_READ,
    // Communication
    Permission.MESSAGE_SEND,
    Permission.MESSAGE_READ,
    // Maintenance requests
    Permission.MAINTENANCE_CREATE,
    Permission.MAINTENANCE_READ,
    // Documents
    Permission.DOCUMENT_READ,
    Permission.DOCUMENT_SIGN,
    // Profile
    Permission.PROFILE_READ,
    Permission.PROFILE_UPDATE
  ],
  
  [UserRole.VIEWER]: [
    // Basic property viewing
    Permission.PROPERTY_READ,
    // Profile
    Permission.PROFILE_READ,
    Permission.PROFILE_UPDATE
  ],
  
  [UserRole.USER]: [
    // Basic profile access
    Permission.PROFILE_READ,
    Permission.PROFILE_UPDATE
  ]
};

// Permission checking utilities
export class PermissionManager {
  /**
   * Check if a user role has a specific permission
   */
  static hasPermission(userRole: UserRole, permission: Permission): boolean {
    const rolePermissions = ROLE_PERMISSIONS[userRole] || [];
    return rolePermissions.includes(permission);
  }

  /**
   * Check if a user role has any of the specified permissions
   */
  static hasAnyPermission(userRole: UserRole, permissions: Permission[]): boolean {
    return permissions.some(permission => this.hasPermission(userRole, permission));
  }

  /**
   * Check if a user role has all of the specified permissions
   */
  static hasAllPermissions(userRole: UserRole, permissions: Permission[]): boolean {
    return permissions.every(permission => this.hasPermission(userRole, permission));
  }

  /**
   * Get all permissions for a user role
   */
  static getRolePermissions(userRole: UserRole): Permission[] {
    return ROLE_PERMISSIONS[userRole] || [];
  }

  /**
   * Check if one role has higher hierarchy level than another
   */
  static isHigherRole(role1: UserRole, role2: UserRole): boolean {
    const level1 = ROLE_HIERARCHY[role1] || 0;
    const level2 = ROLE_HIERARCHY[role2] || 0;
    return level1 > level2;
  }

  /**
   * Check if one role has equal or higher hierarchy level than another
   */
  static isEqualOrHigherRole(role1: UserRole, role2: UserRole): boolean {
    const level1 = ROLE_HIERARCHY[role1] || 0;
    const level2 = ROLE_HIERARCHY[role2] || 0;
    return level1 >= level2;
  }

  /**
   * Get roles that are lower in hierarchy than the given role
   */
  static getLowerRoles(userRole: UserRole): UserRole[] {
    const userLevel = ROLE_HIERARCHY[userRole] || 0;
    return Object.entries(ROLE_HIERARCHY)
      .filter(([_, level]) => level < userLevel)
      .map(([role, _]) => role as UserRole);
  }

  /**
   * Get roles that are equal or lower in hierarchy than the given role
   */
  static getEqualOrLowerRoles(userRole: UserRole): UserRole[] {
    const userLevel = ROLE_HIERARCHY[userRole] || 0;
    return Object.entries(ROLE_HIERARCHY)
      .filter(([_, level]) => level <= userLevel)
      .map(([role, _]) => role as UserRole);
  }

  /**
   * Check if a user can manage another user based on role hierarchy
   */
  static canManageUser(managerRole: UserRole, targetRole: UserRole): boolean {
    return this.isHigherRole(managerRole, targetRole);
  }

  /**
   * Filter permissions based on context (e.g., own resources vs all resources)
   */
  static getContextualPermissions(
    userRole: UserRole,
    context: 'own' | 'all' | 'assigned'
  ): Permission[] {
    const basePermissions = this.getRolePermissions(userRole);
    
    // For now, return all permissions - this can be extended for more granular control
    // In a real implementation, you might filter based on context
    return basePermissions;
  }

  /**
   * Check if a role can access a specific dashboard
   */
  static canAccessDashboard(userRole: UserRole, dashboardType: string): boolean {
    const dashboardPermissions: Record<string, Permission[]> = {
      'super-admin': [Permission.SYSTEM_ADMIN],
      'admin': [Permission.USER_READ, Permission.PROPERTY_READ],
      'property-manager': [Permission.PROPERTY_READ, Permission.MAINTENANCE_READ],
      'agent': [Permission.PROPERTY_READ, Permission.BOOKING_READ],
      'landlord': [Permission.PROPERTY_READ, Permission.BOOKING_READ],
      'contractor': [Permission.MAINTENANCE_READ],
      'seller': [Permission.LISTING_READ],
      'solicitor': [Permission.DOCUMENT_READ],
      'buyer': [Permission.PROPERTY_READ, Permission.OFFER_READ],
      'tenant': [Permission.PROPERTY_READ, Permission.BOOKING_READ],
      'viewer': [Permission.PROPERTY_READ],
      'user': [Permission.PROFILE_READ]
    };

    const requiredPermissions = dashboardPermissions[dashboardType] || [];
    return requiredPermissions.length === 0 || this.hasAnyPermission(userRole, requiredPermissions);
  }
}

// Export permission groups for easier management
export const PERMISSION_GROUPS = {
  SYSTEM: [
    Permission.SYSTEM_ADMIN,
    Permission.SYSTEM_CONFIG,
    Permission.SYSTEM_MONITORING,
    Permission.SYSTEM_BACKUP,
    Permission.SYSTEM_LOGS
  ],
  USER_MANAGEMENT: [
    Permission.USER_CREATE,
    Permission.USER_READ,
    Permission.USER_UPDATE,
    Permission.USER_DELETE,
    Permission.USER_ROLES,
    Permission.USER_PERMISSIONS
  ],
  PROPERTY_MANAGEMENT: [
    Permission.PROPERTY_CREATE,
    Permission.PROPERTY_READ,
    Permission.PROPERTY_UPDATE,
    Permission.PROPERTY_DELETE,
    Permission.PROPERTY_PUBLISH,
    Permission.PROPERTY_ANALYTICS,
    Permission.PROPERTY_BULK_OPERATIONS
  ],
  FINANCIAL: [
    Permission.FINANCE_READ,
    Permission.FINANCE_CREATE,
    Permission.FINANCE_UPDATE,
    Permission.FINANCE_DELETE,
    Permission.FINANCE_REPORTS,
    Permission.FINANCE_TRANSACTIONS
  ],
  MAINTENANCE: [
    Permission.MAINTENANCE_CREATE,
    Permission.MAINTENANCE_READ,
    Permission.MAINTENANCE_UPDATE,
    Permission.MAINTENANCE_DELETE,
    Permission.MAINTENANCE_ASSIGN,
    Permission.MAINTENANCE_COMPLETE
  ]
};

export default PermissionManager;