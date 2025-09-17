import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FileText,
  DollarSign,
  Building,
  Shield,
  FileCheck,
  Wrench,
  MessageSquare,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';

interface AdminNavigationItem {
  id: string;
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

interface AdminSidebarProps {
  className?: string;
}

const adminNavigationItems: AdminNavigationItem[] = [
  {
    id: 'system-overview',
    name: 'System Overview',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
    description: 'Dashboard and system metrics'
  },
  {
    id: 'user-management',
    name: 'User Management',
    href: '/admin/users',
    icon: Users,
    description: 'Manage users, roles, and permissions'
  },
  {
    id: 'land-registry',
    name: 'Land Registry Import',
    href: '/admin/land-registry',
    icon: FileText,
    description: 'Import and manage Land Registry data'
  },
  {
    id: 'financial-management',
    name: 'Financial Management',
    href: '/admin/financial',
    icon: DollarSign,
    description: 'Financial reports and transactions'
  },
  {
    id: 'property-management',
    name: 'Property Management',
    href: '/admin/properties',
    icon: Building,
    description: 'Oversee all property operations'
  },
  {
    id: 'security-monitoring',
    name: 'Security Monitoring',
    href: '/admin/security',
    icon: Shield,
    description: 'Security logs and monitoring'
  },
  {
    id: 'gdpr-compliance',
    name: 'GDPR Compliance',
    href: '/admin/gdpr',
    icon: FileCheck,
    description: 'Data protection and compliance'
  },
  {
    id: 'maintenance-oversight',
    name: 'Maintenance Oversight',
    href: '/admin/maintenance',
    icon: Wrench,
    description: 'Maintenance requests and scheduling'
  },
  {
    id: 'communication-center',
    name: 'Communication Center',
    href: '/admin/communications',
    icon: MessageSquare,
    description: 'Messages and notifications'
  },
  {
    id: 'analytics-reporting',
    name: 'Analytics & Reporting',
    href: '/admin/analytics',
    icon: BarChart3,
    description: 'Reports and data analytics'
  }
];

const AdminSidebar: React.FC<AdminSidebarProps> = ({ className = '' }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  const isActiveItem = (href: string): boolean => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleMobile = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMobile}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        aria-label="Toggle navigation menu"
      >
        {isMobileOpen ? (
          <X className="h-5 w-5 text-gray-600" />
        ) : (
          <Menu className="h-5 w-5 text-gray-600" />
        )}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleMobile}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          ${isCollapsed ? 'w-16' : 'w-64'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          bg-white border-r border-gray-200 transition-all duration-300 ease-in-out
          flex flex-col h-screen
          ${className}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <span className="font-semibold text-gray-900">Admin Panel</span>
            </div>
          )}
          
          {/* Desktop Collapse Button */}
          <button
            onClick={toggleCollapse}
            className="hidden lg:flex p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4 text-gray-600" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-gray-600" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {adminNavigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActiveItem(item.href);
            
            return (
              <Link
                key={item.id}
                to={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={`
                  flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200
                  ${isActive
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }
                  ${isCollapsed ? 'justify-center' : ''}
                  group relative
                `}
                title={isCollapsed ? item.name : ''}
              >
                <Icon className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'}`} />
                
                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{item.name}</div>
                    <div className="text-xs text-gray-500 truncate">{item.description}</div>
                  </div>
                )}

                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                    {item.name}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          {!isCollapsed ? (
            <div className="text-xs text-gray-500 text-center">
              PropertyMasters UK Admin
              <br />
              Version 1.0.0
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-2 h-2 bg-green-500 rounded-full" title="System Online" />
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
export type { AdminNavigationItem, AdminSidebarProps };