import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { ToastProvider } from '../ui/Toast';
// Utility function for combining class names
const cn = (...classes: (string | undefined | null | false)[]) => {
  return classes.filter(Boolean).join(' ');
};

interface LayoutProps {
  children?: React.ReactNode;
  className?: string;
  showHeader?: boolean;
  showFooter?: boolean;
  fullHeight?: boolean;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  className,
  showHeader = true,
  showFooter = true,
  fullHeight = false
}) => {
  return (
    <div className={cn(
      'min-h-screen flex flex-col',
      fullHeight && 'h-screen',
      className
    )}>
      {/* Toast Provider */}
      <ToastProvider />
      
      {/* Header */}
      {showHeader && <Header />}
      
      {/* Main Content */}
      <main className="flex-1">
        {children || <Outlet />}
      </main>
      
      {/* Footer */}
      {showFooter && <Footer />}
    </div>
  );
};

// Dashboard Layout with Sidebar
interface DashboardLayoutProps {
  children?: React.ReactNode;
  sidebar: React.ReactNode;
  className?: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  sidebar,
  className
}) => {
  return (
    <div className={cn('min-h-screen flex flex-col', className)}>
      {/* Toast Provider */}
      <ToastProvider />
      
      {/* Header */}
      <Header />
      
      {/* Dashboard Content */}
      <div className="flex-1 flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
          {sidebar}
        </aside>
        
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};

// Auth Layout (for login/register pages)
interface AuthLayoutProps {
  children?: React.ReactNode;
  className?: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  className
}) => {
  return (
    <div className={cn(
      'min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8',
      className
    )}>
      {/* Toast Provider */}
      <ToastProvider />
      
      {/* Auth Content */}
      <div className="max-w-md w-full space-y-8">
        {children || <Outlet />}
      </div>
    </div>
  );
};

// Property Layout (for property listing/details pages)
interface PropertyLayoutProps {
  children?: React.ReactNode;
  className?: string;
  showFilters?: boolean;
  filters?: React.ReactNode;
}

const PropertyLayout: React.FC<PropertyLayoutProps> = ({
  children,
  className,
  showFilters = false,
  filters
}) => {
  return (
    <div className={cn('min-h-screen flex flex-col', className)}>
      {/* Toast Provider */}
      <ToastProvider />
      
      {/* Header */}
      <Header />
      
      {/* Property Content */}
      <div className="flex-1">
        {showFilters && filters && (
          <div className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              {filters}
            </div>
          </div>
        )}
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children || <Outlet />}
        </main>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

// Error Layout (for error pages)
interface ErrorLayoutProps {
  children?: React.ReactNode;
  className?: string;
}

const ErrorLayout: React.FC<ErrorLayoutProps> = ({
  children,
  className
}) => {
  return (
    <div className={cn(
      'min-h-screen flex items-center justify-center bg-gray-50',
      className
    )}>
      {/* Toast Provider */}
      <ToastProvider />
      
      {/* Error Content */}
      <div className="text-center">
        {children || <Outlet />}
      </div>
    </div>
  );
};

export {
  Layout,
  DashboardLayout,
  AuthLayout,
  PropertyLayout,
  ErrorLayout
};
export type {
  LayoutProps,
  DashboardLayoutProps,
  AuthLayoutProps,
  PropertyLayoutProps,
  ErrorLayoutProps
};