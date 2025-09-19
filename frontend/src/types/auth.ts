export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  isEmailVerified: boolean;
  emailVerified?: boolean;
  isActive: boolean;
  twoFactorEnabled?: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  profile?: UserProfile;
  preferences?: UserPreferences;
  permissions?: Permission[];
  emergencyContact?: EmergencyContact;
  verification?: UserVerification;
  properties?: string[];
  notes?: string;
}

export enum UserRole {
  ADMIN = 'admin',
  AGENT = 'agent',
  LANDLORD = 'landlord',
  TENANT = 'tenant',
  BUYER = 'buyer',
  SELLER = 'seller',
  SOLICITOR = 'solicitor',
  PROPERTY_MANAGER = 'property_manager',
  CONTRACTOR = 'contractor',
  VIEWER = 'viewer',
  SUPER_ADMIN = 'super_admin',
  MANAGER = 'manager',
  USER = 'user'
}

export interface UserProfile {
  bio?: string;
  company?: string;
  website?: string;
  address?: Address;
  socialLinks?: SocialLinks;
  licenseNumber?: string; // For agents and solicitors
  specializations?: string[]; // For agents and solicitors
  yearsOfExperience?: number;
}

export interface Address {
  street: string;
  city: string;
  county: string;
  postcode: string;
  country: string;
}

export interface SocialLinks {
  linkedin?: string;
  twitter?: string;
  facebook?: string;
  instagram?: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

export interface UserVerification {
  email: boolean;
  phone: boolean;
  identity: boolean;
  address: boolean;
}

export interface UserPreferences {
  notifications: NotificationPreferences;
  privacy: PrivacyPreferences;
  searchPreferences: SearchPreferences;
}

export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
  marketing: boolean;
  propertyAlerts: boolean;
  messageAlerts: boolean;
  appointmentReminders: boolean;
}

export interface PrivacyPreferences {
  profileVisibility: 'public' | 'private' | 'contacts';
  showEmail: boolean;
  showPhone: boolean;
  allowMessages: boolean;
}

export interface SearchPreferences {
  defaultLocation?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  propertyTypes?: string[];
  savedSearches?: SavedSearch[];
}

export interface SavedSearch {
  id: string;
  name: string;
  criteria: SearchCriteria;
  alertsEnabled: boolean;
  createdAt: string;
}

export interface SearchCriteria {
  location?: string;
  propertyType?: string;
  listingType?: 'sale' | 'rent';
  priceMin?: number;
  priceMax?: number;
  bedrooms?: number;
  bathrooms?: number;
  features?: string[];
  keywords?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
  companyName?: string;
  address?: Address;
  agreeToTerms: boolean;
  subscribeToNewsletter?: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordReset {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface PasswordChange {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface EmailVerification {
  token: string;
}

export interface TwoFactorAuth {
  enabled: boolean;
  secret?: string;
  backupCodes?: string[];
}

export interface LoginAttempt {
  id: string;
  userId: string;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  timestamp: string;
  location?: string;
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  ipAddress: string;
  userAgent: string;
  isActive: boolean;
  createdAt: string;
  lastActivity: string;
  expiresAt: string;
}

// Role-based permissions
export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
}

export interface RolePermissions {
  [key: string]: Permission[];
}

export const DEFAULT_ROLE_PERMISSIONS: RolePermissions = {
  super_admin: [
    { id: '1', name: 'manage_all', description: 'Full system access', resource: '*', action: 'manage' },
    { id: '2', name: 'manage_users', description: 'Manage all users', resource: 'users', action: 'manage' },
    { id: '3', name: 'manage_properties', description: 'Manage all properties', resource: 'properties', action: 'manage' },
    { id: '4', name: 'view_analytics', description: 'View system analytics', resource: 'analytics', action: 'view' },
    { id: '5', name: 'manage_system', description: 'Manage system settings', resource: 'system', action: 'manage' },
    { id: '6', name: 'security_monitoring', description: 'Monitor security events', resource: 'security', action: 'monitor' },
  ],
  admin: [
    { id: '7', name: 'manage_users', description: 'Manage all users', resource: 'users', action: 'manage' },
    { id: '8', name: 'manage_properties', description: 'Manage all properties', resource: 'properties', action: 'manage' },
    { id: '9', name: 'view_analytics', description: 'View system analytics', resource: 'analytics', action: 'view' },
    { id: '10', name: 'manage_system', description: 'Manage system settings', resource: 'system', action: 'manage' },
  ],
  property_manager: [
    { id: '11', name: 'manage_portfolio', description: 'Manage property portfolio', resource: 'portfolio', action: 'manage' },
    { id: '12', name: 'manage_staff', description: 'Manage staff members', resource: 'staff', action: 'manage' },
    { id: '13', name: 'view_operations', description: 'View operational data', resource: 'operations', action: 'view' },
    { id: '14', name: 'manage_maintenance', description: 'Manage maintenance requests', resource: 'maintenance', action: 'manage' },
  ],
  agent: [
    { id: '15', name: 'manage_own_properties', description: 'Manage own properties', resource: 'properties', action: 'manage_own' },
    { id: '16', name: 'view_client_data', description: 'View client information', resource: 'clients', action: 'view' },
    { id: '17', name: 'schedule_viewings', description: 'Schedule property viewings', resource: 'viewings', action: 'create' },
  ],
  landlord: [
    { id: '18', name: 'manage_own_properties', description: 'Manage own properties', resource: 'properties', action: 'manage_own' },
    { id: '19', name: 'view_tenant_applications', description: 'View tenant applications', resource: 'applications', action: 'view' },
    { id: '20', name: 'manage_tenancies', description: 'Manage tenancy agreements', resource: 'tenancies', action: 'manage' },
  ],
  seller: [
    { id: '21', name: 'manage_listings', description: 'Manage property listings', resource: 'listings', action: 'manage' },
    { id: '22', name: 'view_offers', description: 'View property offers', resource: 'offers', action: 'view' },
    { id: '23', name: 'market_analysis', description: 'Access market analysis', resource: 'market', action: 'view' },
  ],
  contractor: [
    { id: '24', name: 'view_work_orders', description: 'View assigned work orders', resource: 'work_orders', action: 'view' },
    { id: '25', name: 'update_work_status', description: 'Update work order status', resource: 'work_orders', action: 'update' },
    { id: '26', name: 'manage_schedule', description: 'Manage work schedule', resource: 'schedule', action: 'manage' },
    { id: '27', name: 'submit_invoices', description: 'Submit invoices', resource: 'invoices', action: 'create' },
  ],
  tenant: [
    { id: '28', name: 'view_properties', description: 'View available properties', resource: 'properties', action: 'view' },
    { id: '29', name: 'submit_applications', description: 'Submit rental applications', resource: 'applications', action: 'create' },
    { id: '30', name: 'view_own_tenancy', description: 'View own tenancy details', resource: 'tenancies', action: 'view_own' },
  ],
  buyer: [
    { id: '31', name: 'view_properties', description: 'View properties for sale', resource: 'properties', action: 'view' },
    { id: '32', name: 'save_searches', description: 'Save property searches', resource: 'searches', action: 'create' },
    { id: '33', name: 'schedule_viewings', description: 'Schedule property viewings', resource: 'viewings', action: 'create' },
  ],
  solicitor: [
    { id: '34', name: 'view_legal_documents', description: 'View legal documents', resource: 'documents', action: 'view' },
    { id: '35', name: 'manage_conveyancing', description: 'Manage conveyancing process', resource: 'conveyancing', action: 'manage' },
    { id: '36', name: 'generate_contracts', description: 'Generate legal contracts', resource: 'contracts', action: 'create' },
  ],
  viewer: [
    { id: '37', name: 'view_properties', description: 'View properties', resource: 'properties', action: 'view' },
  ],
  manager: [
    { id: '38', name: 'manage_team', description: 'Manage team members', resource: 'team', action: 'manage' },
    { id: '39', name: 'view_reports', description: 'View reports', resource: 'reports', action: 'view' },
  ],
  user: [
    { id: '40', name: 'basic_access', description: 'Basic system access', resource: 'basic', action: 'view' },
  ],
};