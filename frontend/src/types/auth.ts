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
  TENANT = 'tenant',
  BUYER = 'buyer',
  LANDLORD = 'landlord',
  SOLICITOR = 'solicitor'
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
  admin: [
    { id: '1', name: 'manage_users', description: 'Manage all users', resource: 'users', action: 'manage' },
    { id: '2', name: 'manage_properties', description: 'Manage all properties', resource: 'properties', action: 'manage' },
    { id: '3', name: 'view_analytics', description: 'View system analytics', resource: 'analytics', action: 'view' },
    { id: '4', name: 'manage_system', description: 'Manage system settings', resource: 'system', action: 'manage' },
  ],
  agent: [
    { id: '5', name: 'manage_own_properties', description: 'Manage own properties', resource: 'properties', action: 'manage_own' },
    { id: '6', name: 'view_client_data', description: 'View client information', resource: 'clients', action: 'view' },
    { id: '7', name: 'schedule_viewings', description: 'Schedule property viewings', resource: 'viewings', action: 'create' },
  ],
  landlord: [
    { id: '8', name: 'manage_own_properties', description: 'Manage own properties', resource: 'properties', action: 'manage_own' },
    { id: '9', name: 'view_tenant_applications', description: 'View tenant applications', resource: 'applications', action: 'view' },
    { id: '10', name: 'manage_tenancies', description: 'Manage tenancy agreements', resource: 'tenancies', action: 'manage' },
  ],
  tenant: [
    { id: '11', name: 'view_properties', description: 'View available properties', resource: 'properties', action: 'view' },
    { id: '12', name: 'submit_applications', description: 'Submit rental applications', resource: 'applications', action: 'create' },
    { id: '13', name: 'view_own_tenancy', description: 'View own tenancy details', resource: 'tenancies', action: 'view_own' },
  ],
  buyer: [
    { id: '14', name: 'view_properties', description: 'View properties for sale', resource: 'properties', action: 'view' },
    { id: '15', name: 'save_searches', description: 'Save property searches', resource: 'searches', action: 'create' },
    { id: '16', name: 'schedule_viewings', description: 'Schedule property viewings', resource: 'viewings', action: 'create' },
  ],
  solicitor: [
    { id: '17', name: 'view_legal_documents', description: 'View legal documents', resource: 'documents', action: 'view' },
    { id: '18', name: 'manage_conveyancing', description: 'Manage conveyancing process', resource: 'conveyancing', action: 'manage' },
    { id: '19', name: 'generate_contracts', description: 'Generate legal contracts', resource: 'contracts', action: 'create' },
  ],
};