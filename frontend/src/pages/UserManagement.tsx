import * as React from 'react';
import { useState, useEffect } from 'react';
import { Users, UserPlus, Edit, Trash2, Search, Filter, Shield, Mail, Phone, MapPin, Calendar, Eye, Lock, Unlock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { User, UserRole, Permission, Address } from '../types';
import { EmergencyContact, UserVerification, UserPreferences } from '../types/auth';

interface UserFormData {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: UserRole;
  status: string;
  street: string;
  city: string;
  postcode: string;
  country: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelationship: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  profileVisible: boolean;
  contactVisible: boolean;
  notes: string;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showUserModal, setShowUserModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [sortBy, setSortBy] = useState<'name' | 'email' | 'role' | 'created' | 'lastLogin'>('created');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  const [userForm, setUserForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'TENANT' as UserRole,
    isActive: true,
    isEmailVerified: true,
    street: '',
    city: '',
    postcode: '',
    country: 'United Kingdom',

    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelationship: '',
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    profileVisible: true,
    contactVisible: false,
    notes: '',
  });

  // Mock data - replace with API calls
  useEffect(() => {
    const mockUsers: User[] = [
      {
        id: '1',
        email: 'admin@propertymastersuk.com',
        firstName: 'System',
        lastName: 'Administrator',
        phone: '+44 20 7123 4567',
        role: UserRole.ADMIN,
        isActive: true,
        isEmailVerified: true,
        avatar: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20business%20person%20avatar%20portrait&image_size=square',
        profile: {
          address: {
            street: '1 Property House, Business District',
            city: 'London',
            postcode: 'EC1A 1BB',
            country: 'United Kingdom',
            county: 'Greater London'
          }
        },
        preferences: {
          notifications: { 
            email: true, 
            sms: true, 
            push: true,
            marketing: false,
            propertyAlerts: true,
            messageAlerts: true,
            appointmentReminders: true
          },
          privacy: { 
            profileVisibility: 'private' as const,
            showEmail: false,
            showPhone: false,
            allowMessages: true
          },
          searchPreferences: {
            savedSearches: []
          }
        },
        verification: {
          email: true,
          phone: true,
          identity: true,
          address: true,
        },
        lastLogin: '2024-01-16T08:30:00Z',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2024-01-16T08:30:00Z',
        permissions: [
          { id: 'all', name: 'ALL_PERMISSIONS', description: 'All system permissions', resource: 'system', action: 'all' }
        ],
        notes: 'System administrator with full access',
      },
      {
        id: '2',
        email: 'sarah.johnson@email.com',
        firstName: 'Sarah',
        lastName: 'Johnson',
        phone: '+44 7123 456789',
        role: UserRole.AGENT,
        isActive: true,
        isEmailVerified: true,
        avatar: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20female%20real%20estate%20agent%20portrait&image_size=square',
        profile: {
          address: {
            street: '45 Agent Street',
            city: 'London',
            postcode: 'SW1A 2BB',
            country: 'United Kingdom',
            county: 'Greater London'
          }
        },
        preferences: {
          notifications: { 
            email: true, 
            sms: true, 
            push: true,
            marketing: true,
            propertyAlerts: true,
            messageAlerts: true,
            appointmentReminders: true
          },
          privacy: { 
            profileVisibility: 'public' as const,
            showEmail: true,
            showPhone: true,
            allowMessages: true
          },
          searchPreferences: {
            savedSearches: []
          }
        },
        verification: {
          email: true,
          phone: true,
          identity: true,
          address: true,
        },
        lastLogin: '2024-01-16T09:15:00Z',
        createdAt: '2023-03-15T10:00:00Z',
        updatedAt: '2024-01-16T09:15:00Z',
        properties: ['prop1', 'prop2', 'prop3'],
        permissions: [
          { id: 'vp', name: 'VIEW_PROPERTIES', description: 'View properties', resource: 'properties', action: 'view' },
          { id: 'mv', name: 'MANAGE_VIEWINGS', description: 'Manage viewings', resource: 'viewings', action: 'manage' },
          { id: 'mt', name: 'MANAGE_TENANTS', description: 'Manage tenants', resource: 'tenants', action: 'manage' }
        ],
        notes: 'Senior agent specializing in central London properties',
      },
      {
        id: '3',
        email: 'michael.brown@email.com',
        firstName: 'Michael',
        lastName: 'Brown',
        phone: '+44 7987 654321',
        role: UserRole.LANDLORD,
        isActive: true,
        isEmailVerified: true,
        avatar: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20male%20property%20owner%20portrait&image_size=square',
        profile: {
          address: {
            street: '123 Landlord Avenue',
            city: 'London',
            postcode: 'W1K 3CC',
            country: 'United Kingdom',
            county: 'Greater London'
          }
        },

        emergencyContact: {
          name: 'Emma Brown',
          phone: '+44 7555 123456',
          relationship: 'Spouse',
          email: 'emma.brown@email.com'
        },
        preferences: {
          notifications: { 
            email: true, 
            sms: false, 
            push: true,
            marketing: false,
            propertyAlerts: true,
            messageAlerts: true,
            appointmentReminders: true
          },
          privacy: { 
            profileVisibility: 'public' as const,
            showEmail: true,
            showPhone: false,
            allowMessages: true
          },
          searchPreferences: {
            savedSearches: []
          }
        },
        verification: {
          email: true,
          phone: true,
          identity: true,
          address: true,
        },
        lastLogin: '2024-01-15T18:45:00Z',
        createdAt: '2023-02-10T14:30:00Z',
        updatedAt: '2024-01-15T18:45:00Z',
        properties: ['prop4', 'prop5'],
        permissions: [
          { id: 'p1', name: 'VIEW_OWN_PROPERTIES', description: 'View own properties', resource: 'properties', action: 'view_own' },
          { id: 'p2', name: 'MANAGE_TENANTS', description: 'Manage tenants', resource: 'tenants', action: 'manage' },
          { id: 'p3', name: 'VIEW_FINANCIALS', description: 'View financial data', resource: 'financials', action: 'view' }
        ],
        notes: 'Portfolio landlord with 5 properties in London',
      },
      {
        id: '4',
        email: 'john.smith@email.com',
        firstName: 'John',
        lastName: 'Smith',
        phone: '+44 7111 222333',
        role: UserRole.TENANT,
        isActive: true,
        isEmailVerified: true,
        avatar: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=young%20professional%20male%20tenant%20portrait&image_size=square',
        profile: {
          address: {
            street: '789 Tenant Road',
            city: 'London',
            postcode: 'SW19 4DD',
            country: 'United Kingdom',
            county: 'Greater London'
          }
        },

        emergencyContact: {
          name: 'Mary Smith',
          phone: '+44 7444 555666',
          relationship: 'Mother',
          email: 'mary.smith@email.com'
        },
        preferences: {
          notifications: { 
            email: true, 
            sms: true, 
            push: true,
            marketing: false,
            propertyAlerts: true,
            messageAlerts: true,
            appointmentReminders: true
          },
          privacy: { 
            profileVisibility: 'private' as const,
            showEmail: false,
            showPhone: false,
            allowMessages: true
          },
          searchPreferences: {
            savedSearches: []
          }
        },
        verification: {
          email: true,
          phone: true,
          identity: false,
          address: true,
        },
        lastLogin: '2024-01-16T07:20:00Z',
        createdAt: '2023-09-01T12:00:00Z',
        updatedAt: '2024-01-16T07:20:00Z',
        permissions: [
          { id: 'p4', name: 'VIEW_OWN_TENANCY', description: 'View own tenancy', resource: 'tenancy', action: 'view_own' },
          { id: 'p5', name: 'SUBMIT_MAINTENANCE', description: 'Submit maintenance requests', resource: 'maintenance', action: 'submit' },
          { id: 'p6', name: 'VIEW_DOCUMENTS', description: 'View documents', resource: 'documents', action: 'view' }
        ],
        notes: 'Young professional, reliable tenant',
      },
      {
        id: '5',
        email: 'emma.wilson@email.com',
        firstName: 'Emma',
        lastName: 'Wilson',
        phone: '+44 7777 888999',
        role: UserRole.AGENT,
        isActive: true,
        isEmailVerified: true,
        avatar: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20female%20property%20manager%20portrait&image_size=square',
        profile: {
          address: {
            street: '321 Manager Close',
            city: 'London',
            postcode: 'E14 5EE',
            country: 'United Kingdom',
            county: 'Greater London'
          }
        },
        preferences: {
          notifications: { 
            email: true, 
            sms: true, 
            push: true,
            marketing: true,
            propertyAlerts: true,
            messageAlerts: true,
            appointmentReminders: true
          },
          privacy: { 
            profileVisibility: 'public' as const,
            showEmail: true,
            showPhone: true,
            allowMessages: true
          },
          searchPreferences: {
            savedSearches: []
          }
        },
        verification: {
          email: true,
          phone: true,
          identity: true,
          address: true,
        },
        lastLogin: '2024-01-16T10:00:00Z',
        createdAt: '2023-06-20T09:00:00Z',
        updatedAt: '2024-01-16T10:00:00Z',
        properties: ['prop6', 'prop7', 'prop8', 'prop9'],
        permissions: [
          { id: 'p7', name: 'MANAGE_PROPERTIES', description: 'Manage properties', resource: 'properties', action: 'manage' },
          { id: 'p8', name: 'MANAGE_TENANTS', description: 'Manage tenants', resource: 'tenants', action: 'manage' },
          { id: 'p9', name: 'MANAGE_MAINTENANCE', description: 'Manage maintenance', resource: 'maintenance', action: 'manage' },
          { id: 'p10', name: 'VIEW_FINANCIALS', description: 'View financial data', resource: 'financials', action: 'view' }
        ],
        notes: 'Experienced property manager handling multiple portfolios',
      },
      {
        id: '6',
        email: 'david.contractor@email.com',
        firstName: 'David',
        lastName: 'Thompson',
        phone: '+44 7333 444555',
        role: UserRole.AGENT,
        isActive: false,
        isEmailVerified: true,
        avatar: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20male%20contractor%20worker%20portrait&image_size=square',
        profile: {
          address: {
            street: '654 Contractor Way',
            city: 'London',
            postcode: 'SE1 6FF',
            country: 'United Kingdom',
            county: 'Greater London'
          }
        },
        preferences: {
          notifications: { 
            email: true, 
            sms: true, 
            push: false,
            marketing: false,
            propertyAlerts: false,
            messageAlerts: true,
            appointmentReminders: true
          },
          privacy: { 
            profileVisibility: 'public' as const,
            showEmail: true,
            showPhone: true,
            allowMessages: true
          },
          searchPreferences: {
            savedSearches: []
          }
        },
        verification: {
          email: true,
          phone: false,
          identity: false,
          address: false,
        },
        lastLogin: '2024-01-14T16:30:00Z',
        createdAt: '2024-01-10T11:00:00Z',
        updatedAt: '2024-01-14T16:30:00Z',
        permissions: [
          { id: 'p11', name: 'VIEW_ASSIGNED_JOBS', description: 'View assigned jobs', resource: 'jobs', action: 'view_assigned' },
          { id: 'p12', name: 'UPDATE_JOB_STATUS', description: 'Update job status', resource: 'jobs', action: 'update_status' }
        ],
        notes: 'New contractor - pending verification of credentials',
      },
    ];

    setTimeout(() => {
      setUsers(mockUsers);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.phone?.includes(searchTerm);
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const userStatus = user.isActive ? 'ACTIVE' : (user.isEmailVerified ? 'INACTIVE' : 'PENDING_VERIFICATION');
    const matchesStatus = statusFilter === 'all' || userStatus === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let aValue: any, bValue: any;
    
    switch (sortBy) {
      case 'name':
        aValue = `${a.firstName} ${a.lastName}`.toLowerCase();
        bValue = `${b.firstName} ${b.lastName}`.toLowerCase();
        break;
      case 'email':
        aValue = a.email.toLowerCase();
        bValue = b.email.toLowerCase();
        break;
      case 'role':
        aValue = a.role;
        bValue = b.role;
        break;
      case 'created':
        aValue = new Date(a.createdAt);
        bValue = new Date(b.createdAt);
        break;
      case 'lastLogin':
        aValue = a.lastLogin ? new Date(a.lastLogin) : new Date(0);
        bValue = b.lastLogin ? new Date(b.lastLogin) : new Date(0);
        break;
      default:
        return 0;
    }
    
    if (sortOrder === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  const getStatusColor = (user: User) => {
    if (user.isActive) return 'bg-green-100 text-green-800';
    if (!user.isEmailVerified) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (user: User) => {
    if (user.isActive) return <CheckCircle className="h-4 w-4" />;
    if (!user.isEmailVerified) return <AlertTriangle className="h-4 w-4" />;
    return <XCircle className="h-4 w-4" />;
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-purple-100 text-purple-800';
      case 'AGENT': return 'bg-blue-100 text-blue-800';
      case 'LANDLORD': return 'bg-green-100 text-green-800';
      case 'TENANT': return 'bg-orange-100 text-orange-800';
      case 'PROPERTY_MANAGER': return 'bg-indigo-100 text-indigo-800';
      case 'CONTRACTOR': return 'bg-yellow-100 text-yellow-800';
      case 'VIEWER': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStatusChange = (userId: string, newStatus: string) => {
    setUsers(prev => prev.map(user => 
      user.id === userId 
        ? { 
            ...user, 
            isActive: newStatus === 'ACTIVE',
            isEmailVerified: newStatus !== 'PENDING_VERIFICATION',
            updatedAt: new Date().toISOString() 
          }
        : user
    ));
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(prev => prev.filter(user => user.id !== userId));
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setUserForm({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone || '',
      role: user.role,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
      street: user.profile?.address?.street || '',
      city: user.profile?.address?.city || '',
      postcode: user.profile?.address?.postcode || '',
      country: user.profile?.address?.country || 'United Kingdom',

      emergencyContactName: user.emergencyContact?.name || '',
      emergencyContactPhone: user.emergencyContact?.phone || '',
      emergencyContactRelationship: user.emergencyContact?.relationship || '',
      emailNotifications: user.preferences?.notifications.email ?? true,
      smsNotifications: user.preferences?.notifications.sms ?? false,
      pushNotifications: user.preferences?.notifications.push ?? true,
      profileVisible: user.preferences?.privacy.profileVisibility === 'public' || true,
      contactVisible: user.preferences?.privacy.showEmail ?? false,
      notes: user.notes || '',
    });
    setShowCreateModal(true);
  };

  const handleSubmitUser = () => {
    if (editingUser) {
      // Update existing user
      setUsers(prev => prev.map(user => 
        user.id === editingUser.id 
          ? {
              ...user,
              email: userForm.email,
              firstName: userForm.firstName,
              lastName: userForm.lastName,
              phone: userForm.phone,
              role: userForm.role as UserRole,
              isActive: userForm.isActive,
              isEmailVerified: userForm.isEmailVerified,
              profile: {
                ...user.profile,
                address: {
                  street: userForm.street,
                  city: userForm.city,
                  postcode: userForm.postcode,
                  country: userForm.country,
                  county: user.profile?.address?.county || ''
                }
              },

              emergencyContact: userForm.emergencyContactName ? {
                name: userForm.emergencyContactName,
                phone: userForm.emergencyContactPhone,
                relationship: userForm.emergencyContactRelationship,
              } : undefined,
              preferences: {
                notifications: {
                  email: userForm.emailNotifications,
                  sms: userForm.smsNotifications,
                  push: userForm.pushNotifications,
                  marketing: user.preferences?.notifications?.marketing ?? false,
                  propertyAlerts: user.preferences?.notifications?.propertyAlerts ?? true,
                  messageAlerts: user.preferences?.notifications?.messageAlerts ?? true,
                  appointmentReminders: user.preferences?.notifications?.appointmentReminders ?? true,
                },
                privacy: {
                  profileVisibility: userForm.profileVisible ? 'public' : 'private',
                  showEmail: userForm.contactVisible,
                  showPhone: userForm.contactVisible,
                  allowMessages: user.preferences?.privacy?.allowMessages ?? true,
                },
                searchPreferences: {
                  ...user.preferences?.searchPreferences,
                  savedSearches: user.preferences?.searchPreferences?.savedSearches ?? [],
                },
              },
              notes: userForm.notes,
              updatedAt: new Date().toISOString(),
            }
          : user
      ));
    } else {
      // Create new user
      const newUser: User = {
        id: Date.now().toString(),
        email: userForm.email,
        firstName: userForm.firstName,
        lastName: userForm.lastName,
        phone: userForm.phone,
        role: userForm.role as UserRole,
        isActive: userForm.isActive,
        isEmailVerified: userForm.isEmailVerified,
        profile: {
          address: {
            street: userForm.street,
            city: userForm.city,
            postcode: userForm.postcode,
            country: userForm.country,
            county: ''
          }
        },

        emergencyContact: userForm.emergencyContactName ? {
          name: userForm.emergencyContactName,
          phone: userForm.emergencyContactPhone,
          relationship: userForm.emergencyContactRelationship,
        } : undefined,
        preferences: {
          notifications: {
            email: userForm.emailNotifications,
            sms: userForm.smsNotifications,
            push: userForm.pushNotifications,
            marketing: false,
            propertyAlerts: true,
            messageAlerts: true,
            appointmentReminders: true,
          },
          privacy: {
            profileVisibility: userForm.profileVisible ? 'public' : 'private',
            showEmail: userForm.contactVisible,
            showPhone: userForm.contactVisible,
            allowMessages: true,
          },
          searchPreferences: {
            savedSearches: [],
          },
        },
        verification: {
          email: false,
          phone: false,
          identity: false,
          address: false,
        },
        notes: userForm.notes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        permissions: [],
      };

      setUsers(prev => [newUser, ...prev]);
    }

    // Reset form
    setUserForm({
      email: '',
      firstName: '',
      lastName: '',
      phone: '',
      role: 'TENANT' as UserRole,
      isActive: true,
      isEmailVerified: true,
      street: '',
      city: '',
      postcode: '',
      country: 'United Kingdom',
  
      emergencyContactName: '',
      emergencyContactPhone: '',
      emergencyContactRelationship: '',
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      profileVisible: true,
      contactVisible: false,
      notes: '',
    });
    setEditingUser(null);
    setShowCreateModal(false);
  };

  const activeUsers = users.filter(u => u.isActive);
  const pendingUsers = users.filter(u => !u.isEmailVerified);
  const suspendedUsers = users.filter(u => !u.isActive && u.isEmailVerified);
  const totalProperties = users.reduce((sum, u) => sum + (u.properties?.length || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
              <p className="text-gray-600 mt-1">Manage users, roles, and permissions</p>
            </div>
            <div className="flex gap-3 mt-4 lg:mt-0">
              <div className="flex border border-gray-300 rounded-md">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 text-sm ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
                >
                  List
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 text-sm ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
                >
                  Grid
                </button>
              </div>
              <Button onClick={() => {
                setEditingUser(null);
                setShowCreateModal(true);
              }}>
                <UserPlus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">{activeUsers.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Verification</p>
                <p className="text-2xl font-bold text-gray-900">{pendingUsers.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <Lock className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Suspended/Banned</p>
                <p className="text-2xl font-bold text-gray-900">{suspendedUsers.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search users by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex gap-3">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Roles</option>
              <option value="ADMIN">Admin</option>
              <option value="AGENT">Agent</option>
              <option value="LANDLORD">Landlord</option>
              <option value="TENANT">Tenant</option>
              <option value="PROPERTY_MANAGER">Property Manager</option>
              <option value="CONTRACTOR">Contractor</option>
              <option value="VIEWER">Viewer</option>
            </select>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="PENDING_VERIFICATION">Pending Verification</option>
              <option value="BANNED">Banned</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="created">Sort by Created</option>
              <option value="name">Sort by Name</option>
              <option value="email">Sort by Email</option>
              <option value="role">Sort by Role</option>
              <option value="lastLogin">Sort by Last Login</option>
            </select>
            
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>

        {/* Users List/Grid */}
        {viewMode === 'list' ? (
          <div className="space-y-4">
            {sortedUsers.map((user) => (
              <Card key={user.id} className="overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <img
                        src={user.avatar || `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=random`}
                        alt={`${user.firstName} ${user.lastName}`}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {user.firstName} {user.lastName}
                          </h3>
                          <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user)}`}>
                            {getStatusIcon(user)}
                            {user.isActive ? 'Active' : (!user.isEmailVerified ? 'Pending Verification' : 'Inactive')}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                            {user.role.replace('_', ' ')}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-3">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="h-4 w-4" />
                            {user.email}
                          </div>
                          {user.phone && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Phone className="h-4 w-4" />
                              {user.phone}
                            </div>
                          )}
                          {user.profile?.address && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <MapPin className="h-4 w-4" />
                              {user.profile.address.city}, {user.profile.address.postcode}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Joined: {new Date(user.createdAt).toLocaleDateString()}
                          </div>
                          {user.lastLogin && (
                            <div>
                              Last login: {new Date(user.lastLogin).toLocaleDateString()}
                            </div>
                          )}
                          {user.properties && user.properties.length > 0 && (
                            <div>
                              Properties: {user.properties.length}
                            </div>
                          )}
                        </div>
                        
                        {/* Verification Status */}
                        {user.verification && (
                          <div className="flex items-center gap-4 mt-3">
                            <div className="flex items-center gap-1 text-xs">
                              <span className={`w-2 h-2 rounded-full ${
                                user.verification.email ? 'bg-green-500' : 'bg-red-500'
                              }`}></span>
                              Email
                            </div>
                            <div className="flex items-center gap-1 text-xs">
                              <span className={`w-2 h-2 rounded-full ${
                                user.verification.phone ? 'bg-green-500' : 'bg-red-500'
                              }`}></span>
                              Phone
                            </div>
                            <div className="flex items-center gap-1 text-xs">
                              <span className={`w-2 h-2 rounded-full ${
                                user.verification.identity ? 'bg-green-500' : 'bg-red-500'
                              }`}></span>
                              Identity
                            </div>
                            <div className="flex items-center gap-1 text-xs">
                              <span className={`w-2 h-2 rounded-full ${
                                user.verification.address ? 'bg-green-500' : 'bg-red-500'
                              }`}></span>
                              Address
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewUser(user)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditUser(user)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {user.isActive ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusChange(user.id, 'SUSPENDED')}
                        >
                          <Lock className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusChange(user.id, 'ACTIVE')}
                        >
                          <Unlock className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedUsers.map((user) => (
              <Card key={user.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <img
                      src={user.avatar || `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=random`}
                      alt={`${user.firstName} ${user.lastName}`}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex gap-1">
                      <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user)}`}>
                        {getStatusIcon(user)}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                        {user.role.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {user.firstName} {user.lastName}
                  </h3>
                  
                  <p className="text-sm text-gray-600 mb-2">{user.email}</p>
                  
                  {user.phone && (
                    <p className="text-sm text-gray-600 mb-2">{user.phone}</p>
                  )}
                  
                  <div className="text-xs text-gray-500 mb-3">
                    <div>Joined: {new Date(user.createdAt).toLocaleDateString()}</div>
                    {user.lastLogin && (
                      <div>Last login: {new Date(user.lastLogin).toLocaleDateString()}</div>
                    )}
                  </div>
                  
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewUser(user)}
                      className="flex-1"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditUser(user)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {sortedUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No users found
            </h3>
            <p className="text-gray-600 mb-4">
              No users match your current filters
            </p>
            <Button onClick={() => {
              setEditingUser(null);
              setShowCreateModal(true);
            }}>
              Add First User
            </Button>
          </div>
        )}
      </div>

      {/* Create/Edit User Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setEditingUser(null);
        }}
        title={editingUser ? 'Edit User' : 'Create New User'}
      >
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name *
              </label>
              <Input
                type="text"
                value={userForm.firstName}
                onChange={(e) => setUserForm(prev => ({ ...prev, firstName: e.target.value }))}
                placeholder="Enter first name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name *
              </label>
              <Input
                type="text"
                value={userForm.lastName}
                onChange={(e) => setUserForm(prev => ({ ...prev, lastName: e.target.value }))}
                placeholder="Enter last name"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <Input
              type="email"
              value={userForm.email}
              onChange={(e) => setUserForm(prev => ({ ...prev, email: e.target.value }))}
              placeholder="user@email.com"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <Input
                type="tel"
                value={userForm.phone}
                onChange={(e) => setUserForm(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+44 7xxx xxx xxx"
              />
            </div>
            

          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role *
              </label>
              <select
                value={userForm.role}
                onChange={(e) => setUserForm(prev => ({ ...prev, role: e.target.value as UserRole }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="TENANT">Tenant</option>
                <option value="LANDLORD">Landlord</option>
                <option value="AGENT">Agent</option>
                <option value="BUYER">Buyer</option>
                <option value="SOLICITOR">Solicitor</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Account Status
              </label>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={userForm.isActive}
                    onChange={(e) => setUserForm(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="mr-2"
                  />
                  <label htmlFor="isActive" className="text-sm text-gray-700">
                    Account Active
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isEmailVerified"
                    checked={userForm.isEmailVerified}
                    onChange={(e) => setUserForm(prev => ({ ...prev, isEmailVerified: e.target.checked }))}
                    className="mr-2"
                  />
                  <label htmlFor="isEmailVerified" className="text-sm text-gray-700">
                    Email Verified
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            <div className="space-y-3">
              <Input
                type="text"
                value={userForm.street}
                onChange={(e) => setUserForm(prev => ({ ...prev, street: e.target.value }))}
                placeholder="Street address"
              />
              <div className="grid grid-cols-3 gap-3">
                <Input
                  type="text"
                  value={userForm.city}
                  onChange={(e) => setUserForm(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="City"
                />
                <Input
                  type="text"
                  value={userForm.postcode}
                  onChange={(e) => setUserForm(prev => ({ ...prev, postcode: e.target.value.toUpperCase() }))}
                  placeholder="Postcode"
                />
                <Input
                  type="text"
                  value={userForm.country}
                  onChange={(e) => setUserForm(prev => ({ ...prev, country: e.target.value }))}
                  placeholder="Country"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Emergency Contact
            </label>
            <div className="space-y-3">
              <Input
                type="text"
                value={userForm.emergencyContactName}
                onChange={(e) => setUserForm(prev => ({ ...prev, emergencyContactName: e.target.value }))}
                placeholder="Contact name"
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  type="tel"
                  value={userForm.emergencyContactPhone}
                  onChange={(e) => setUserForm(prev => ({ ...prev, emergencyContactPhone: e.target.value }))}
                  placeholder="Contact phone"
                />
                <Input
                  type="text"
                  value={userForm.emergencyContactRelationship}
                  onChange={(e) => setUserForm(prev => ({ ...prev, emergencyContactRelationship: e.target.value }))}
                  placeholder="Relationship"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Notification Preferences
            </label>
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="emailNotifications"
                  checked={userForm.emailNotifications}
                  onChange={(e) => setUserForm(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                  className="mr-2"
                />
                <label htmlFor="emailNotifications" className="text-sm text-gray-700">
                  Email Notifications
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="smsNotifications"
                  checked={userForm.smsNotifications}
                  onChange={(e) => setUserForm(prev => ({ ...prev, smsNotifications: e.target.checked }))}
                  className="mr-2"
                />
                <label htmlFor="smsNotifications" className="text-sm text-gray-700">
                  SMS Notifications
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="pushNotifications"
                  checked={userForm.pushNotifications}
                  onChange={(e) => setUserForm(prev => ({ ...prev, pushNotifications: e.target.checked }))}
                  className="mr-2"
                />
                <label htmlFor="pushNotifications" className="text-sm text-gray-700">
                  Push Notifications
                </label>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Privacy Settings
            </label>
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="profileVisible"
                  checked={userForm.profileVisible}
                  onChange={(e) => setUserForm(prev => ({ ...prev, profileVisible: e.target.checked }))}
                  className="mr-2"
                />
                <label htmlFor="profileVisible" className="text-sm text-gray-700">
                  Profile Visible to Others
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="contactVisible"
                  checked={userForm.contactVisible}
                  onChange={(e) => setUserForm(prev => ({ ...prev, contactVisible: e.target.checked }))}
                  className="mr-2"
                />
                <label htmlFor="contactVisible" className="text-sm text-gray-700">
                  Contact Information Visible
                </label>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={userForm.notes}
              onChange={(e) => setUserForm(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Additional notes about this user"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateModal(false);
                setEditingUser(null);
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitUser}
              className="flex-1"
              disabled={!userForm.firstName || !userForm.lastName || !userForm.email}
            >
              {editingUser ? 'Update User' : 'Create User'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* User Details Modal */}
      <Modal
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        title={selectedUser ? `${selectedUser.firstName} ${selectedUser.lastName}` : 'User Details'}
      >
        {selectedUser && (
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <img
                src={selectedUser.avatar || `https://ui-avatars.com/api/?name=${selectedUser.firstName}+${selectedUser.lastName}&background=random`}
                alt={`${selectedUser.firstName} ${selectedUser.lastName}`}
                className="w-20 h-20 rounded-full object-cover"
              />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {selectedUser.firstName} {selectedUser.lastName}
                </h3>
                <div className="flex items-center gap-3 mb-3">
                  <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedUser)}`}>
                    {getStatusIcon(selectedUser)}
                    {selectedUser.isActive ? (selectedUser.isEmailVerified ? 'Active' : 'Pending Verification') : 'Suspended'}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(selectedUser.role)}`}>
                    {selectedUser.role.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Email</p>
                <p className="text-sm text-gray-900">{selectedUser.email}</p>
              </div>
              {selectedUser.phone && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Phone</p>
                  <p className="text-sm text-gray-900">{selectedUser.phone}</p>
                </div>
              )}

              <div>
                <p className="text-sm font-medium text-gray-700">Member Since</p>
                <p className="text-sm text-gray-900">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            {selectedUser.profile?.address && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Address</p>
                <p className="text-sm text-gray-900">
                  {selectedUser.profile.address.street}<br />
                  {selectedUser.profile.address.city}, {selectedUser.profile.address.postcode}<br />
                  {selectedUser.profile.address.country}
                </p>
              </div>
            )}

            {selectedUser.emergencyContact && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Emergency Contact</p>
                <p className="text-sm text-gray-900">
                  {selectedUser.emergencyContact.name} ({selectedUser.emergencyContact.relationship})<br />
                  {selectedUser.emergencyContact.phone}
                </p>
              </div>
            )}

            {selectedUser.verification && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Verification Status</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${
                      selectedUser.verification.email ? 'bg-green-500' : 'bg-red-500'
                    }`}></span>
                    <span className="text-sm text-gray-900">Email Verified</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${
                      selectedUser.verification.phone ? 'bg-green-500' : 'bg-red-500'
                    }`}></span>
                    <span className="text-sm text-gray-900">Phone Verified</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${
                      selectedUser.verification.identity ? 'bg-green-500' : 'bg-red-500'
                    }`}></span>
                    <span className="text-sm text-gray-900">Identity Verified</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${
                      selectedUser.verification.address ? 'bg-green-500' : 'bg-red-500'
                    }`}></span>
                    <span className="text-sm text-gray-900">Address Verified</span>
                  </div>
                </div>
              </div>
            )}

            {selectedUser.properties && selectedUser.properties.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Associated Properties</p>
                <p className="text-sm text-gray-900">{selectedUser.properties.length} properties</p>
              </div>
            )}

            {selectedUser.permissions && selectedUser.permissions.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Permissions</p>
                <div className="flex flex-wrap gap-1">
                  {selectedUser.permissions.map((permission, index) => (
                    <span
                      key={permission.id || index}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      title={permission.description}
                    >
                      {permission.name.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {selectedUser.notes && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Notes</p>
                <p className="text-sm text-gray-900">{selectedUser.notes}</p>
              </div>
            )}

            {selectedUser.lastLogin && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Last Activity</p>
                <p className="text-sm text-gray-900">
                  Last login: {new Date(selectedUser.lastLogin).toLocaleString()}
                </p>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => handleEditUser(selectedUser)}
                className="flex-1"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit User
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowUserModal(false)}
                className="flex-1"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default UserManagement;