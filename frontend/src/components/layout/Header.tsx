import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Building2, Menu, X, User, LogOut, Settings, Bell, Search, ChevronDown, LayoutDashboard } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../ui/Button';
import { showToast } from '../ui/Toast';

interface HeaderProps {
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ className = '' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    logout();
    showToast.success('Logged out successfully');
    navigate('/');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/properties?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsSearchOpen(false);
    }
  };

  const getDashboardLink = () => {
    if (!user) return '/auth/login';
    
    switch (user.role) {
      case 'admin':
        return '/dashboard/admin';
      case 'agent':
        return '/dashboard/agent';
      case 'landlord':
        return '/dashboard/landlord';
      case 'tenant':
        return '/dashboard/tenant';
      case 'buyer':
        return '/dashboard/buyer';
      case 'solicitor':
        return '/dashboard/solicitor';
      default:
        return '/dashboard';
    }
  };

  const getNavigationItems = () => {
    const baseItems = [
      { name: 'Home', href: '/', current: location.pathname === '/' },
      { name: 'Properties', href: '/properties', current: location.pathname.startsWith('/properties') },
      { name: 'Search', href: '/search', current: location.pathname === '/search' },
    ];

    if (user) {
      baseItems.push(
        { name: 'Dashboard', href: getDashboardLink(), current: location.pathname.startsWith('/dashboard') }
      );

      // Role-specific navigation items
      switch (user.role) {
        case 'agent':
          baseItems.push(
            { name: 'My Listings', href: '/agent/listings', current: location.pathname === '/agent/listings' },
            { name: 'Leads', href: '/agent/leads', current: location.pathname === '/agent/leads' }
          );
          break;
        case 'landlord':
          baseItems.push(
            { name: 'My Properties', href: '/landlord/properties', current: location.pathname === '/landlord/properties' },
            { name: 'Tenants', href: '/landlord/tenants', current: location.pathname === '/landlord/tenants' }
          );
          break;
        case 'tenant':
          baseItems.push(
            { name: 'My Rentals', href: '/tenant/rentals', current: location.pathname === '/tenant/rentals' },
            { name: 'Maintenance', href: '/tenant/maintenance', current: location.pathname === '/tenant/maintenance' }
          );
          break;
        case 'buyer':
          baseItems.push(
            { name: 'Saved Properties', href: '/buyer/saved', current: location.pathname === '/buyer/saved' },
            { name: 'Viewings', href: '/buyer/viewings', current: location.pathname === '/buyer/viewings' }
          );
          break;
        case 'solicitor':
          baseItems.push(
            { name: 'Cases', href: '/solicitor/cases', current: location.pathname === '/solicitor/cases' },
            { name: 'Documents', href: '/solicitor/documents', current: location.pathname === '/solicitor/documents' }
          );
          break;
        case 'admin':
          baseItems.push(
            { name: 'Users', href: '/admin/users', current: location.pathname === '/admin/users' },
            { name: 'Reports', href: '/admin/reports', current: location.pathname === '/admin/reports' }
          );
          break;
      }
    }

    return baseItems;
  };

  const navigationItems = getNavigationItems();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto container-responsive">
        <div className="flex-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Building2 className="h-8 w-8 text-primary-600" />
            <span className="text-heading-4">PropertyMasters</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`text-label transition-colors duration-200 ${
                  location.pathname === item.href
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-gray-700 hover:text-primary-600'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-3">
          {/* Search Bar */}
          <div className="hidden lg:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search properties..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleSearch}
                className="input-field pl-10"
              />
            </div>
          </div>

            {user ? (
              <>
                {/* Notifications */}
                <div className="relative">
                  <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200 hover:bg-gray-50 rounded-md">
                    <Bell className="h-5 w-5" />
                    {/* Notification badge */}
                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white" />
                  </button>
                </div>

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200"
                  >
                    <div className="w-8 h-8 bg-primary-600 rounded-full flex-center">
                      <span className="text-label text-white">
                        {user.firstName?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <ChevronDown className="h-4 w-4" />
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200 animate-slide-down">
                      <div className="px-4 py-2 border-b border-gray-200">
                        <p className="text-label">{user.firstName} {user.lastName}</p>
                        <p className="text-caption">{user.email}</p>
                      </div>
                      <Link
                        to="/dashboard"
                        className="block px-4 py-2 text-body-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <div className="flex items-center space-x-2">
                          <LayoutDashboard className="h-4 w-4" />
                          <span>Dashboard</span>
                        </div>
                      </Link>
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-body-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4" />
                          <span>Profile Settings</span>
                        </div>
                      </Link>
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          handleLogout();
                        }}
                        className="flex items-center w-full component-spacing text-body-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/auth/login">
                  <Button variant="outline" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/auth/register">
                  <Button size="sm">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="component-spacing rounded-md text-gray-600 hover:text-primary-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 transition-all duration-200"
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden animate-slide-down">
            <div className="container-responsive py-2 stack-sm bg-white border-t border-gray-200 shadow-md">
              {/* Mobile Search */}
              <div className="py-2">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search properties..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleSearch}
                    className="input-field pl-10"
                  />
                </div>
              </div>
              
              {/* Mobile Navigation Items */}
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`block px-3 py-2 rounded-md text-body transition-colors duration-200 ${
                    location.pathname === item.href
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-gray-700 hover:text-primary-600 hover:bg-gray-100'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}

              {user ? (
                <div className="pt-4 pb-3 border-t border-gray-200">
                  <div className="flex items-center px-3">
                    <div className="w-10 h-10 bg-primary-600 rounded-full flex-center">
                      <span className="text-label text-white">
                        {user.firstName?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div className="ml-3">
                      <div className="text-body font-medium text-gray-800">{user.firstName} {user.lastName}</div>
                      <div className="text-caption">{user.email}</div>
                    </div>
                  </div>
                  <div className="mt-3 stack-sm">
                    <Link
                      to="/dashboard"
                      className="block px-3 py-2 rounded-md text-body text-gray-700 hover:text-primary-600 hover:bg-gray-100 transition-colors duration-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/profile"
                      className="block px-3 py-2 rounded-md text-body text-gray-700 hover:text-primary-600 hover:bg-gray-100 transition-colors duration-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="block w-full text-left px-3 py-2 rounded-md text-body text-red-600 hover:bg-red-50 transition-colors duration-200"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              ) : (
                <div className="pt-4 pb-3 border-t border-gray-200 stack-sm">
                  <Link
                    to="/auth/login"
                    className="block px-3 py-2 rounded-md text-body text-gray-700 hover:text-primary-600 hover:bg-gray-100 transition-colors duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/auth/register"
                    className="block px-3 py-2 rounded-md text-body text-primary-600 hover:bg-primary-50 transition-colors duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;