import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { ToastProvider } from '../ui/Toast';
import Header from './Header';
import Navigation from './Navigation';
import Footer from './Footer';

interface LayoutProps {
  children?: React.ReactNode;
}

export interface DashboardLayoutProps extends LayoutProps {}
export interface AuthLayoutProps extends LayoutProps {}
export interface PropertyLayoutProps extends LayoutProps {}
export interface ErrorLayoutProps extends LayoutProps {}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  console.log('Layout component rendering with children:', children);
  return (
    <ToastProvider>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          {children || <Outlet />}
        </main>
        <Footer />
      </div>
    </ToastProvider>
  );
};

export const DashboardLayout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ToastProvider>
      <div className="min-h-screen bg-gray-50">
        <Navigation 
          isOpen={sidebarOpen} 
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          isMobile={false}
        />
        
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-40 lg:hidden bg-black bg-opacity-50 transition-opacity duration-300" 
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* Main content */}
        <div className="lg:pl-64 transition-all duration-300">
          <div className="container-responsive section-spacing">
            {children || <Outlet />}
          </div>
        </div>
        
        {/* Mobile menu button */}
        <button
          type="button"
          className="lg:hidden fixed top-4 left-4 z-50 btn-primary p-2 rounded-md shadow-lg transition-all duration-200 hover:scale-105"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <span className="sr-only">Open sidebar</span>
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </ToastProvider>
  );
};

export const AuthLayout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <ToastProvider>
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center section-spacing">
        <div className="container-responsive max-w-md mx-auto">
          {children || <Outlet />}
        </div>
      </div>
    </ToastProvider>
  );
};

export const PropertyLayout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <ToastProvider>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 bg-gray-50">
          <div className="container-responsive section-spacing">
            {children || <Outlet />}
          </div>
        </main>
        <Footer />
      </div>
    </ToastProvider>
  );
};

export const ErrorLayout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <ToastProvider>
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
        <div className="container-responsive max-w-lg mx-auto text-center section-spacing">
          {children || <Outlet />}
        </div>
      </div>
    </ToastProvider>
  );
};

export default Layout;