import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Building2, Menu, X, User, LogOut, Settings, Bell, Search, ChevronDown } from 'lucide-react';
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
    <header className={`bg-white shadow-lg border-b border-gray-200 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Building2 className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900 hidden sm:block">
                PropertyMasters UK
              </span>
              <span className="text-xl font-bold text-gray-900 sm:hidden">
                PM UK
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  item.current
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative hidden sm:block">
              {isSearchOpen ? (
                <form onSubmit={handleSearch} className="flex items-center">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search properties..."
                    className="w-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setIsSearchOpen(false)}
                    className="ml-2 p-2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <Search className="h-5 w-5" />
                </button>
              )}
            </div>

            {user ? (
              <>
                {/* Notifications */}
                <button className="p-2 text-gray-400 hover:text-gray-600 relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white"></span>
                </button>

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 p-2 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {(user.firstName?.charAt(0) || user.lastName?.charAt(0) || 'U').toUpperCase()}
                      </span>
                    </div>
                    <span className="hidden sm:block text-sm font-medium">{`${user.firstName || ''} ${user.lastName || ''}`.trim()}</span>
                    <ChevronDown className="h-4 w-4" />
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{`${user.firstName || ''} ${user.lastName || ''}`.trim()}</p>
                        <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                      </div>
                      <Link
                        to={getDashboardLink()}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <User className="h-4 w-4 mr-2" />
                        Dashboard
                      </Link>
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Profile Settings
                      </Link>
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          handleLogout();
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
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
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
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
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    item.current
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              {/* Mobile Search */}
              <div className="px-3 py-2">
                <form onSubmit={handleSearch} className="flex items-center">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search properties..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="submit"
                    className="ml-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <Search className="h-4 w-4" />
                  </button>
                </form>
              </div>

              {!user && (
                <div className="px-3 py-2 space-y-2">
                  <Link
                    to="/auth/login"
                    className="block w-full text-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/auth/register"
                    className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign Up
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