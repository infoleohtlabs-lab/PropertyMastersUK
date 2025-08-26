import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Building2, Eye, EyeOff, Mail, Lock, Users, BarChart3, Settings, ArrowLeft, Shield } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { showToast } from '../../components/ui/Toast';
import { useAuthStore } from '../../stores/authStore';
import { useFormValidation } from '../../hooks';
import { validateEmail } from '../../utils';
import type { LoginCredentials } from '../../types';

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'admin' | 'agent' | 'landlord'>('admin');

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
    email: '',
    password: '',
    rememberMe: false
  }, {
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
      showToast.success(`Welcome to the ${selectedRole} portal!`);
      navigate(from, { replace: true });
    } catch (error: any) {
      showToast.error(error.message || 'Login failed. Please try again.');
    }
  };

  const handleDemoLogin = async (role: 'admin' | 'agent' | 'landlord') => {
    const demoCredentials = {
      admin: { email: 'demo.admin@propertymastersuk.com', password: 'demo123' },
      agent: { email: 'demo.agent@propertymastersuk.com', password: 'demo123' },
      landlord: { email: 'demo.landlord@propertymastersuk.com', password: 'demo123' }
    };

    try {
      await login(demoCredentials[role]);
      showToast.success(`Welcome to the demo ${role} account!`);
      navigate(from, { replace: true });
    } catch (error: any) {
      showToast.error(error.message || 'Demo login failed.');
    }
  };

  const professionalFeatures = [
    {
      icon: Users,
      title: 'Client Management',
      description: 'Manage tenants, landlords, and property portfolios efficiently'
    },
    {
      icon: BarChart3,
      title: 'Analytics & Reports',
      description: 'Access comprehensive business insights and performance metrics'
    },
    {
      icon: Settings,
      title: 'System Administration',
      description: 'Configure system settings and manage user permissions'
    }
  ];

  const roleOptions = [
    {
      id: 'admin',
      title: 'System Administrator',
      description: 'Full system access and management',
      icon: Shield,
      color: 'from-red-600 to-pink-600'
    },
    {
      id: 'agent',
      title: 'Property Agent',
      description: 'Manage properties and client relationships',
      icon: Building2,
      color: 'from-blue-600 to-indigo-600'
    },
    {
      id: 'landlord',
      title: 'Landlord',
      description: 'Manage your property portfolio',
      icon: Users,
      color: 'from-green-600 to-emerald-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex">
      {/* Left Side - Professional Features */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-800 to-blue-900 p-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 flex flex-col justify-center max-w-md">
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-6">
              <Building2 className="h-10 w-10" />
              <span className="text-2xl font-bold">PropertyMasters UK</span>
            </div>
            <h1 className="text-4xl font-bold mb-4">Professional Portal</h1>
            <p className="text-xl text-blue-100 leading-relaxed">
              Advanced tools for property professionals. Manage portfolios, 
              analyze performance, and deliver exceptional service.
            </p>
          </div>

          <div className="space-y-6">
            {professionalFeatures.map((feature, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="bg-white/20 p-3 rounded-lg">
                  <feature.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">{feature.title}</h3>
                  <p className="text-blue-100">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 p-6 bg-white/10 rounded-lg backdrop-blur-sm">
            <h3 className="font-semibold mb-2">Enterprise Support</h3>
            <p className="text-sm text-blue-100 mb-4">
              Dedicated support for property professionals with priority assistance.
            </p>
            <Button variant="outline" className="border-white text-white hover:bg-white hover:text-blue-900">
              Contact Enterprise Support
            </Button>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
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
              <Building2 className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">
                PropertyMasters UK
              </span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Professional Login
            </h2>
            <p className="text-gray-600">
              Access your professional dashboard and management tools
            </p>
          </div>

          {/* Role Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select your role
            </label>
            <div className="grid grid-cols-1 gap-3">
              {roleOptions.map((role) => (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => setSelectedRole(role.id as any)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    selectedRole === role.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${role.color}`}>
                      <role.icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{role.title}</h3>
                      <p className="text-sm text-gray-500">{role.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Input
                id="email"
                name="email"
                type="email"
                label="Email address"
                placeholder="Enter your professional email"
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.email ? errors.email : ''}
                leftIcon={<Mail className="h-4 w-4" />}
                required
              />
            </div>

            <div>
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                label="Password"
                placeholder="Enter your password"
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.password ? errors.password : ''}
                leftIcon={<Lock className="h-4 w-4" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link
                  to="/auth/forgot-password"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Forgot your password?
                </Link>
              </div>
            </div>

            <div>
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                loading={isLoading}
                disabled={!isValid || isLoading}
              >
                Sign in to Professional Portal
              </Button>
            </div>
          </form>

          {/* Demo Accounts */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 text-gray-500">Try demo accounts</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3">
              <Button
                variant="outline"
                onClick={() => handleDemoLogin('admin')}
                disabled={isLoading}
                className="w-full border-red-300 text-red-700 hover:bg-red-50"
              >
                Demo Admin Account
              </Button>
              <Button
                variant="outline"
                onClick={() => handleDemoLogin('agent')}
                disabled={isLoading}
                className="w-full border-blue-300 text-blue-700 hover:bg-blue-50"
              >
                Demo Agent Account
              </Button>
              <Button
                variant="outline"
                onClick={() => handleDemoLogin('landlord')}
                disabled={isLoading}
                className="w-full border-green-300 text-green-700 hover:bg-green-50"
              >
                Demo Landlord Account
              </Button>
            </div>
          </div>

          {/* Register Link */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Need a professional account?{' '}
              <Link
                to="/auth/register"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Register as Professional
              </Link>
            </p>
          </div>

          {/* Tenant Login */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Are you a tenant?{' '}
              <Link
                to="/auth/tenant-login"
                className="font-medium text-green-600 hover:text-green-500"
              >
                Tenant Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;