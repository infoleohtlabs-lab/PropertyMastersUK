import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  Building2,
  Users,
  Calendar,
  MessageSquare,
  FileText,
  TrendingUp,
  Settings,
  Bell,
  Search,
  CreditCard,
  Wrench,
  Shield,
  BarChart3,
  Video,
  Eye,
  UserCheck,
  MapPin,
  Receipt,
  Archive,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Target
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { UserRole } from '../../types';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
  roles: UserRole[];
  children?: NavigationItem[];
}

const navigationItems: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    roles: [UserRole.ADMIN, UserRole.AGENT, UserRole.LANDLORD, UserRole.TENANT, UserRole.BUYER]
  },
  {
    name: 'Properties',
    href: '/properties',
    icon: Building2,
    roles: [UserRole.ADMIN, UserRole.AGENT, UserRole.LANDLORD, UserRole.BUYER],
    children: [
      {
        name: 'All Properties',
        href: '/properties',
        icon: Building2,
        roles: [UserRole.ADMIN, UserRole.AGENT, UserRole.LANDLORD, UserRole.BUYER]
      },
      {
        name: 'Add Property',
        href: '/properties/add',
        icon: Building2,
        roles: [UserRole.ADMIN, UserRole.AGENT, UserRole.LANDLORD]
      },
      {
        name: 'Property Search',
        href: '/properties/search',
        icon: Search,
        roles: [UserRole.ADMIN, UserRole.AGENT, UserRole.BUYER, UserRole.TENANT]
      },
      {
        name: 'Market Analysis',
        href: '/market-analysis',
        icon: TrendingUp,
        roles: [UserRole.ADMIN, UserRole.AGENT, UserRole.LANDLORD]
      }
    ]
  },
  {
    name: 'Clients',
    href: '/clients',
    icon: Users,
    roles: [UserRole.ADMIN, UserRole.AGENT],
    children: [
      {
        name: 'All Clients',
        href: '/clients',
        icon: Users,
        roles: [UserRole.ADMIN, UserRole.AGENT]
      },
      {
        name: 'Add Client',
        href: '/clients/add',
        icon: Users,
        roles: [UserRole.ADMIN, UserRole.AGENT]
      }
    ]
  },
  {
    name: 'Tenants',
    href: '/tenants',
    icon: UserCheck,
    roles: [UserRole.ADMIN, UserRole.LANDLORD],
    children: [
      {
        name: 'All Tenants',
        href: '/tenants',
        icon: UserCheck,
        roles: [UserRole.ADMIN, UserRole.LANDLORD]
      },
      {
        name: 'Tenant Applications',
        href: '/tenants/applications',
        icon: FileText,
        roles: [UserRole.ADMIN, UserRole.LANDLORD]
      },
      {
        name: 'Referencing',
        href: '/tenants/referencing',
        icon: Shield,
        roles: [UserRole.ADMIN, UserRole.LANDLORD]
      }
    ]
  },
  {
    name: 'Bookings',
    href: '/bookings',
    icon: Calendar,
    roles: [UserRole.ADMIN, UserRole.AGENT, UserRole.LANDLORD, UserRole.BUYER, UserRole.TENANT],
    children: [
      {
        name: 'All Bookings',
        href: '/bookings',
        icon: Calendar,
        roles: [UserRole.ADMIN, UserRole.AGENT, UserRole.LANDLORD]
      },
      {
        name: 'My Bookings',
        href: '/bookings/my',
        icon: Calendar,
        roles: [UserRole.BUYER, UserRole.TENANT]
      },
      {
        name: 'Calendar',
        href: '/bookings/calendar',
        icon: Calendar,
        roles: [UserRole.ADMIN, UserRole.AGENT, UserRole.LANDLORD]
      }
    ]
  },
  {
    name: 'Maintenance',
    href: '/maintenance',
    icon: Wrench,
    roles: [UserRole.ADMIN, UserRole.LANDLORD, UserRole.TENANT],
    children: [
      {
        name: 'All Requests',
        href: '/maintenance',
        icon: Wrench,
        roles: [UserRole.ADMIN, UserRole.LANDLORD]
      },
      {
        name: 'Submit Request',
        href: '/maintenance/submit',
        icon: Wrench,
        roles: [UserRole.TENANT]
      },
      {
        name: 'My Requests',
        href: '/maintenance/my',
        icon: Wrench,
        roles: [UserRole.TENANT]
      }
    ]
  },
  {
    name: 'Finances',
    href: '/finances',
    icon: CreditCard,
    roles: [UserRole.ADMIN, UserRole.LANDLORD, UserRole.TENANT],
    children: [
      {
        name: 'Overview',
        href: '/finances',
        icon: CreditCard,
        roles: [UserRole.ADMIN, UserRole.LANDLORD]
      },
      {
        name: 'Rent Payments',
        href: '/finances/rent',
        icon: Receipt,
        roles: [UserRole.ADMIN, UserRole.LANDLORD, UserRole.TENANT]
      },
      {
        name: 'Reports',
        href: '/finances/reports',
        icon: BarChart3,
        roles: [UserRole.ADMIN, UserRole.LANDLORD]
      },
      {
        name: 'Invoices',
        href: '/finances/invoices',
        icon: FileText,
        roles: [UserRole.ADMIN, UserRole.LANDLORD]
      }
    ]
  },
  {
    name: 'Communications',
    href: '/communications',
    icon: MessageSquare,
    roles: [UserRole.ADMIN, UserRole.AGENT, UserRole.LANDLORD, UserRole.TENANT, UserRole.BUYER],
    children: [
      {
        name: 'Messages',
        href: '/communications/messages',
        icon: MessageSquare,
        roles: [UserRole.ADMIN, UserRole.AGENT, UserRole.LANDLORD, UserRole.TENANT, UserRole.BUYER]
      },
      {
        name: 'Notifications',
        href: '/communications/notifications',
        icon: Bell,
        roles: [UserRole.ADMIN, UserRole.AGENT, UserRole.LANDLORD, UserRole.TENANT, UserRole.BUYER]
      }
    ]
  },
  {
    name: 'CRM',
    href: '/crm',
    icon: Target,
    roles: [UserRole.ADMIN, UserRole.AGENT, UserRole.LANDLORD]
  },
  {
    name: 'Documents',
    href: '/documents',
    icon: FileText,
    roles: [UserRole.ADMIN, UserRole.AGENT, UserRole.LANDLORD, UserRole.TENANT],
    children: [
      {
        name: 'All Documents',
        href: '/documents',
        icon: FileText,
        roles: [UserRole.ADMIN, UserRole.AGENT, UserRole.LANDLORD]
      },
      {
        name: 'My Documents',
        href: '/documents/my',
        icon: FileText,
        roles: [UserRole.TENANT]
      },
      {
        name: 'Templates',
        href: '/documents/templates',
        icon: Archive,
        roles: [UserRole.ADMIN, UserRole.AGENT, UserRole.LANDLORD]
      }
    ]
  },
  {
    name: 'Virtual Tours',
    href: '/virtual-tours',
    icon: Video,
    roles: [UserRole.ADMIN, UserRole.AGENT, UserRole.LANDLORD, UserRole.BUYER, UserRole.TENANT]
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    roles: [UserRole.ADMIN, UserRole.AGENT, UserRole.LANDLORD]
  },
  {
    name: 'GDPR Compliance',
    href: '/gdpr',
    icon: Shield,
    roles: [UserRole.ADMIN]
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
    roles: [UserRole.ADMIN, UserRole.AGENT, UserRole.LANDLORD, UserRole.TENANT, UserRole.BUYER]
  }
];

interface NavigationProps {
  isMobile?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ isMobile = false, isOpen = true, onClose }) => {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    );
  };

  const isItemActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  const hasPermission = (roles: UserRole[]) => {
    return user && roles.includes(user.role as UserRole);
  };

  const filteredItems = navigationItems.filter(item => hasPermission(item.roles));

  if (!user) return null;

  const navigationContent = (
    <div className={`h-full flex flex-col ${
      isMobile ? 'bg-white' : 'bg-gray-900'
    }`}>
      {/* Header */}
      <div className={`flex-between h-16 container-responsive border-b ${
        isMobile ? 'border-gray-200' : 'border-gray-700'
      }`}>
        <div className="flex items-center space-x-3">
          <Building2 className={`h-8 w-8 ${
            isMobile ? 'text-blue-600' : 'text-white'
          }`} />
          <span className={`text-heading-4 ${
            isMobile ? 'text-gray-900' : 'text-white'
          }`}>
            PropertyMasters
          </span>
        </div>
        {isMobile && onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-md text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        )}
      </div>

      {/* User Info */}
      <div className={`component-spacing border-b ${
        isMobile ? 'border-gray-200' : 'border-gray-700'
      }`}>
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-full flex-center ${
            isMobile ? 'bg-blue-100 text-blue-600' : 'bg-gray-700 text-white'
          }`}>
            {user.firstName.charAt(0)}{user.lastName.charAt(0)}
          </div>
          <div>
            <p className={`text-label ${
              isMobile ? 'text-gray-900' : 'text-white'
            }`}>
              {user.firstName} {user.lastName}
            </p>
            <p className={`text-caption ${
              isMobile ? 'text-gray-500' : 'text-gray-400'
            }`}>
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 container-responsive py-4 stack-sm overflow-y-auto">
        {filteredItems.map((item) => {
          const isExpanded = expandedItems.includes(item.name);
          const hasChildren = item.children && item.children.length > 0;
          const filteredChildren = item.children?.filter(child => hasPermission(child.roles));
          
          return (
            <div key={item.name}>
              {hasChildren ? (
                <button
                  onClick={() => toggleExpanded(item.name)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-label transition-colors ${
                    isMobile
                      ? 'text-gray-700 hover:bg-gray-100'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </div>
                  <span className="text-caption ml-auto">
                    {isExpanded ? '−' : '+'}
                  </span>
                </button>
              ) : (
                <Link
                  to={item.href}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-md text-label transition-colors ${
                    isItemActive(item.href)
                      ? isMobile
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-700 text-white'
                      : isMobile
                        ? 'text-gray-700 hover:bg-gray-100'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              )}
              
              {/* Children */}
              {hasChildren && isExpanded && filteredChildren && (
                <div className="ml-6 mt-2 space-y-1">
                  {filteredChildren.map((child) => (
                    <Link
                      key={child.name}
                      to={child.href}
                      className={`flex items-center space-x-3 px-3 py-2 rounded-md text-body-sm transition-colors ${
                        isItemActive(child.href)
                          ? isMobile
                            ? 'bg-blue-50 text-blue-600'
                            : 'bg-gray-800 text-white'
                          : isMobile
                            ? 'text-gray-600 hover:bg-gray-50'
                            : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                      }`}
                    >
                      <child.icon className="h-4 w-4" />
                      <span>{child.name}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Logout */}
      <div className={`component-spacing border-t ${
        isMobile ? 'border-gray-200' : 'border-gray-700'
      }`}>
        <button
          onClick={handleLogout}
          className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-label transition-colors ${
            isMobile
              ? 'text-red-600 hover:bg-red-50'
              : 'text-red-400 hover:bg-red-900 hover:text-red-300'
          }`}
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/50 transition-opacity duration-300 animate-fade-in" onClick={onClose} />
          <nav className={`relative flex-1 flex flex-col max-w-xs w-full ${
            isMobile ? 'bg-white' : 'bg-gray-900'
          } component-spacing overflow-y-auto transform transition-transform duration-300 ease-in-out`}>
            {navigationContent}
          </nav>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:z-50">
        <div className={`flex-1 flex flex-col min-h-0 ${
          isMobile ? 'bg-white border-r border-gray-200' : 'bg-gray-900'
        } shadow-lg`}>
          {navigationContent}
        </div>
      </div>
    </>
  );
};

export default Navigation;