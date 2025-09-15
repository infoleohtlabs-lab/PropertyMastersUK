import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Building2, Eye, EyeOff, Mail, Lock, Users } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { showToast } from '../../components/ui/Toast';
import { useAuthStore } from '../../stores/authStore';
import { useFormValidation } from '../../hooks';
import { validateEmail } from '../../utils';
import type { LoginCredentials } from '../../types';

const AgentLogin: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/dashboard/agent';

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
    
    const emailError = validateField('email', values.email);
    const passwordError = validateField('password', values.password);
    
    if (emailError || passwordError || !isValid) {
      showToast.error('Please fix the errors before submitting');
      return;
    }

    try {
      await login(values);
      showToast.success('Welcome back, Agent!');
      navigate(from, { replace: true });
    } catch (error: any) {
      showToast.error(error.message || 'Login failed. Please check your credentials.');
    }
  };

  const handleDemoLogin = async (role: string) => {
    const credentials = {
      admin: { email: 'admin@propertymasters.com', password: 'PropertyTest2024!' },
      agent: { email: 'agent@propertymasters.com', password: 'PropertyTest2024!' },
      landlord: { email: 'landlord@propertymasters.com', password: 'PropertyTest2024!' },
      tenant: { email: 'tenant@propertymasters.com', password: 'PropertyTest2024!' },
      buyer: { email: 'buyer@propertymasters.com', password: 'PropertyTest2024!' },
      solicitor: { email: 'solicitor@propertymasters.com', password: 'PropertyTest2024!' }
    };

    const creds = credentials[role as keyof typeof credentials];
    if (creds) {
      try {
        await login({ email: creds.email, password: creds.password, rememberMe: false });
        showToast.success(`Welcome back, ${role.charAt(0).toUpperCase() + role.slice(1)}!`);
        
        // Redirect based on role
        const redirectPaths = {
          admin: '/dashboard/admin',
          agent: '/dashboard/agent',
          landlord: '/dashboard/landlord',
          tenant: '/dashboard/tenant',
          buyer: '/dashboard/buyer',
          solicitor: '/dashboard/solicitor'
        };
        
        navigate(redirectPaths[role as keyof typeof redirectPaths] || '/dashboard', { replace: true });
      } catch (error: any) {
        showToast.error(error.message || `${role} login failed. Please check credentials.`);
      }
    }
  };

  const handleAutoFill = (role: string) => {
    const credentials = {
      admin: { email: 'admin@propertymasters.com', password: 'PropertyTest2024!' },
      agent: { email: 'agent@propertymasters.com', password: 'PropertyTest2024!' },
      landlord: { email: 'landlord@propertymasters.com', password: 'PropertyTest2024!' },
      tenant: { email: 'tenant@propertymasters.com', password: 'PropertyTest2024!' },
      buyer: { email: 'buyer@propertymasters.com', password: 'PropertyTest2024!' },
      solicitor: { email: 'solicitor@propertymasters.com', password: 'PropertyTest2024!' }
    };

    const creds = credentials[role as keyof typeof credentials];
    if (creds) {
      // Update form values using the form validation hook
      handleChange({ target: { name: 'email', value: creds.email } } as any);
      handleChange({ target: { name: 'password', value: creds.password } } as any);
      showToast.success(`${role.charAt(0).toUpperCase() + role.slice(1)} credentials filled`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-lg shadow-xl p-8 animate-fade-in">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center items-center space-x-2 mb-4">
              <Building2 className="h-10 w-10 text-blue-600" />
              <span className="text-heading-2 text-gray-900">
                PropertyMasters UK
              </span>
            </div>
            <div className="flex justify-center items-center space-x-2 mb-4">
              <Users className="h-6 w-6 text-blue-600" />
              <h2 className="text-heading-2 text-gray-900">
                Agent Portal
              </h2>
            </div>
            <p className="text-body-sm text-gray-600">
              Access your agent dashboard and manage properties
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="form-section">
            <div className="form-group">
              <Input
                id="email"
                name="email"
                type="email"
                label="Agent Email"
                placeholder="agent@propertymastersuk.com"
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.email ? errors.email : ''}
                className={`input-field ${
                  touched.email && errors.email 
                    ? 'border-red-500 animate-shake' 
                    : touched.email && !errors.email 
                    ? 'border-green-500' 
                    : ''
                }`}
                leftIcon={<Mail className="h-4 w-4" />}
                required
              />
            </div>

            <div className="form-group">
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
                className={`input-field ${
                  touched.password && errors.password 
                    ? 'border-red-500 animate-shake' 
                    : touched.password && !errors.password 
                    ? 'border-green-500' 
                    : ''
                }`}
                leftIcon={<Lock className="h-4 w-4" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-blue-600 transition-colors"
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
                  name="rememberMe"
                  type="checkbox"
                  checked={values.rememberMe}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors"
                />
                <label htmlFor="remember-me" className="ml-2 block text-label text-gray-900">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link
                  to="/auth/forgot-password"
                  className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <div>
              <Button
                type="submit"
                className={`btn-primary w-full ${
                  isLoading ? 'animate-pulse' : 'hover:animate-scale-in'
                }`}
                loading={isLoading}
                disabled={!isValid || isLoading}
              >
                Sign in to Agent Portal
              </Button>
            </div>
          </form>

          {/* Demo Login Section */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Demo Accounts</span>
              </div>
            </div>

            {/* Auto Login Buttons */}
            <div className="mt-4">
              <p className="text-xs text-gray-600 mb-3 text-center">Quick Login (Auto-login)</p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  onClick={() => handleDemoLogin('admin')}
                  className="btn-secondary text-xs py-2"
                  disabled={isLoading}
                >
                  Admin
                </Button>
                <Button
                  type="button"
                  onClick={() => handleDemoLogin('agent')}
                  className="btn-primary text-xs py-2"
                  disabled={isLoading}
                >
                  Agent
                </Button>
                <Button
                  type="button"
                  onClick={() => handleDemoLogin('landlord')}
                  className="btn-secondary text-xs py-2"
                  disabled={isLoading}
                >
                  Landlord
                </Button>
                <Button
                  type="button"
                  onClick={() => handleDemoLogin('tenant')}
                  className="btn-secondary text-xs py-2"
                  disabled={isLoading}
                >
                  Tenant
                </Button>
                <Button
                  type="button"
                  onClick={() => handleDemoLogin('buyer')}
                  className="btn-secondary text-xs py-2"
                  disabled={isLoading}
                >
                  Buyer
                </Button>
                <Button
                  type="button"
                  onClick={() => handleDemoLogin('solicitor')}
                  className="btn-secondary text-xs py-2"
                  disabled={isLoading}
                >
                  Solicitor
                </Button>
              </div>
            </div>

            {/* Auto Fill Buttons */}
            <div className="mt-4">
              <p className="text-xs text-gray-600 mb-3 text-center">Auto-fill Credentials</p>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  type="button"
                  onClick={() => handleAutoFill('admin')}
                  className="btn-outline text-xs py-1"
                  disabled={isLoading}
                >
                  Admin
                </Button>
                <Button
                  type="button"
                  onClick={() => handleAutoFill('agent')}
                  className="btn-outline text-xs py-1"
                  disabled={isLoading}
                >
                  Agent
                </Button>
                <Button
                  type="button"
                  onClick={() => handleAutoFill('landlord')}
                  className="btn-outline text-xs py-1"
                  disabled={isLoading}
                >
                  Landlord
                </Button>
                <Button
                  type="button"
                  onClick={() => handleAutoFill('tenant')}
                  className="btn-outline text-xs py-1"
                  disabled={isLoading}
                >
                  Tenant
                </Button>
                <Button
                  type="button"
                  onClick={() => handleAutoFill('buyer')}
                  className="btn-outline text-xs py-1"
                  disabled={isLoading}
                >
                  Buyer
                </Button>
                <Button
                  type="button"
                  onClick={() => handleAutoFill('solicitor')}
                  className="btn-outline text-xs py-1"
                  disabled={isLoading}
                >
                  Solicitor
                </Button>
              </div>
            </div>
          </div>

          {/* Footer Links */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Other login options</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Link
                to="/auth/login"
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                General Login
              </Link>
              <Link
                to="/auth/register"
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentLogin;