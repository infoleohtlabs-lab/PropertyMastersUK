import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Home, Eye, EyeOff, Mail, Lock, Search, Wrench, FileText, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { showToast } from '../../components/ui/Toast';
import { useAuthStore } from '../../stores/authStore';
import { useFormValidation } from '../../hooks';
import { validateEmail } from '../../utils';
import type { LoginCredentials } from '../../types';

const TenantLogin: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    isValid,
    validateField
  } = useFormValidation<LoginCredentials>({
    initialValues: {
      email: '',
      password: '',
      rememberMe: false
    },
    validationRules: {
      email: (value) => {
        if (!value) return 'Email is required';
        if (!validateEmail(value)) return 'Please enter a valid email address';
        return '';
      },
      password: (value) => {
        if (!value) return 'Password is required';
        if (value.length < 6) return 'Password must be at least 6 characters';
        return '';
      },
      rememberMe: () => ''
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const emailError = validateField('email', values.email);
    const passwordError = validateField('password', values.password);
    
    if (emailError || passwordError || !isValid) {
      showToast.error('Please fix the errors before submitting');
      return;
    }

    try {
      await login(values);
      showToast.success('Welcome to your tenant portal!');
      navigate(from, { replace: true });
    } catch (error: any) {
      showToast.error(error.message || 'Login failed. Please try again.');
    }
  };

  const handleDemoLogin = async () => {
    try {
      await login({ email: 'tenant@example.com', password: 'PropertyTest2024!' });
      showToast.success('Welcome to the demo tenant account!');
      navigate(from, { replace: true });
    } catch (error: any) {
      showToast.error(error.message || 'Demo login failed.');
    }
  };

  const tenantFeatures = [
    {
      icon: Search,
      title: 'Property Search',
      description: 'Find your perfect rental property with advanced filters'
    },
    {
      icon: FileText,
      title: 'Rental Applications',
      description: 'Submit and track your rental applications online'
    },
    {
      icon: Wrench,
      title: 'Maintenance Requests',
      description: 'Report and track maintenance issues quickly'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex">
      {/* Left Side - Tenant Features */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-600 to-blue-600 p-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative z-10 flex flex-col justify-center max-w-md">
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-6">
              <Home className="h-10 w-10" />
              <span className="text-2xl font-bold">PropertyMasters UK</span>
            </div>
            <h1 className="text-4xl font-bold mb-4">Tenant Portal</h1>
            <p className="text-xl text-green-100 leading-relaxed">
              Your gateway to seamless rental living. Manage your tenancy, 
              submit maintenance requests, and find your next home.
            </p>
          </div>

          <div className="space-y-6">
            {tenantFeatures.map((feature, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="bg-white/20 p-3 rounded-lg">
                  <feature.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">{feature.title}</h3>
                  <p className="text-green-100">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 p-6 bg-white/10 rounded-lg backdrop-blur-sm">
            <h3 className="font-semibold mb-2">Need Help?</h3>
            <p className="text-sm text-green-100 mb-4">
              Our tenant support team is available 24/7 to assist you.
            </p>
            <Button variant="outline" className="border-white text-white hover:bg-white hover:text-green-600">
              Contact Support
            </Button>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md animate-fade-in">
          {/* Back to Home */}
          <div className="mb-6">
            <Link 
              to="/" 
              className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </div>

          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="flex justify-center items-center space-x-2 mb-4 lg:hidden">
              <Home className="h-8 w-8 text-green-600" />
              <span className="text-heading-2 text-gray-900">
                PropertyMasters UK
              </span>
            </div>
            <h2 className="text-heading-1 text-gray-900 mb-2">
              Tenant Login
            </h2>
            <p className="text-body-sm text-gray-600">
              Access your tenant portal to manage your rental experience
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="form-section">
            <div className="form-group">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`input-field pl-10 ${
                    touched.email && errors.email
                      ? 'border-red-500 animate-shake'
                      : touched.email && !errors.email
                      ? 'border-green-500'
                      : ''
                  }`}
                  required
                />
                <label htmlFor="email" className="text-label text-gray-700 mb-1 block">
                  Email address
                </label>
                {touched.email && errors.email && (
                  <p className="text-caption text-red-600 mt-1 animate-fade-in">{errors.email}</p>
                )}
              </div>
            </div>

            <div className="form-group">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={values.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`input-field pl-10 pr-10 ${
                    touched.password && errors.password
                      ? 'border-red-500 animate-shake'
                      : touched.password && !errors.password
                      ? 'border-green-500'
                      : ''
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors z-10"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                <label htmlFor="password" className="text-label text-gray-700 mb-1 block">
                  Password
                </label>
                {touched.password && errors.password && (
                  <p className="text-caption text-red-600 mt-1 animate-fade-in">{errors.password}</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="rememberMe"
                  type="checkbox"
                  checked={values.rememberMe}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-label text-gray-900">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link
                  to="/auth/forgot-password"
                  className="font-medium text-green-600 hover:text-green-500 transition-colors"
                >
                  Forgot your password?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={!isValid || isLoading}
                className={`btn-primary w-full ${
                  isLoading ? 'animate-pulse' : 'hover:animate-scale-in'
                } transition-all duration-200`}
              >
                {isLoading ? 'Signing in...' : 'Sign in to Tenant Portal'}
              </button>
            </div>
          </form>

          {/* Demo Account */}
          <div className="component-spacing">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-caption">
                <span className="px-2 bg-gray-50 text-gray-500">Try demo account</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={handleDemoLogin}
                disabled={isLoading}
                className="btn-secondary w-full hover:animate-scale-in transition-all duration-200"
              >
                Demo Tenant Account
              </button>
            </div>
          </div>

          {/* Register Link */}
          <div className="component-spacing text-center">
            <p className="text-caption text-gray-600">
              Don't have an account?{' '}
              <Link
                to="/auth/register"
                className="font-medium text-green-600 hover:text-green-500 transition-colors"
              >
                Create tenant account
              </Link>
            </p>
          </div>

          {/* Professional Login */}
          <div className="mt-6 text-center">
            <p className="text-caption text-gray-500">
              Are you a property professional?{' '}
              <Link
                to="/auth/admin-login"
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
              >
                Professional Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantLogin;