import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Building2, Mail, Lock, Eye, EyeOff, Edit3, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { showToast } from '../../components/ui/Toast';
import { useAuthStore } from '../../stores/authStore';
import { useFormValidation } from '../../hooks';
import { validateEmail } from '../../utils';
import type { LoginCredentials } from '../../types';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const {
    values,
    errors,
    touched,
    isValid,
    handleChange,
    handleBlur,
    handleSubmit,
  } = useFormValidation({
    initialValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
    validationRules: {
      email: (value) => {
        if (!value) return 'Email is required';
        return validateEmail(value);
      },
      password: (value) => {
        if (!value) return 'Password is required';
        if (value.length < 6) return 'Password must be at least 6 characters';
        return '';
      },
      rememberMe: () => ''
    },
    onSubmit: async (formValues) => {
      try {
        await login(formValues);
        showToast.success('Welcome back!');
        navigate(from, { replace: true });
      } catch (error: any) {
        showToast.error(error.message || 'Login failed. Please try again.');
      }
    },
  });



  const credentials = {
    agent: { email: 'agent@propertymastersuk.com', password: 'agent123' },
    landlord: { email: 'landlord@propertymastersuk.com', password: 'landlord123' },
    tenant: { email: 'tenant@propertymastersuk.com', password: 'tenant123' },
    admin: { email: 'admin@propertymastersuk.com', password: 'admin123' },
    solicitor: { email: 'solicitor@propertymastersuk.com', password: 'solicitor123' },
    buyer: { email: 'buyer@propertymastersuk.com', password: 'buyer123' }
  };

  const handleAutofill = (role: 'agent' | 'landlord' | 'tenant' | 'admin' | 'solicitor' | 'buyer') => {
    const creds = credentials[role];
    handleChange({ target: { name: 'email', value: creds.email } } as any);
    handleChange({ target: { name: 'password', value: creds.password } } as any);
    showToast.success(`Form filled with ${role} credentials`);
  };

  const handleClearForm = () => {
    handleChange({ target: { name: 'email', value: '' } } as any);
    handleChange({ target: { name: 'password', value: '' } } as any);
    handleChange({ target: { name: 'rememberMe', value: false } } as any);
    showToast.success('Form cleared');
  };

  const handleDemoLogin = async (role: 'agent' | 'landlord' | 'tenant' | 'admin' | 'solicitor' | 'buyer') => {
    try {
      await login(credentials[role]);
      showToast.success(`Welcome back, demo ${role}!`);
      navigate(from, { replace: true });
    } catch (error: any) {
      showToast.error(error.message || 'Demo login failed.');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto animate-fade-in">
      {/* Logo and Title */}
      <div className="text-center mb-8">
        <div className="flex justify-center items-center space-x-2 mb-4">
          <Building2 className="h-10 w-10 text-blue-600" />
          <span className="text-2xl font-bold text-gray-900">
            PropertyMasters UK
          </span>
        </div>
        <h2 className="text-heading-2 mb-2">
          Welcome back
        </h2>
        <p className="text-body-sm">
          Sign in to your account to continue
        </p>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="form-section">
        <div className="form-group">
          <Input
            id="email"
            name="email"
            type="email"
            label="Email address"
            placeholder="Enter your email"
            value={values.email}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.email ? errors.email : ''}
            leftIcon={<Mail className="h-4 w-4" />}
            required
            className={`input-field transition-all duration-300 ${touched.email && errors.email ? 'animate-shake border-danger-300 focus:border-danger-500 focus:ring-danger-500' : 'hover:border-primary-400 focus:border-primary-500'}`}
          />
        </div>

        <div className="form-group">
          <div className="relative">
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
              required
              className={`input-field transition-all duration-300 ${touched.password && errors.password ? 'animate-shake border-danger-300 focus:border-danger-500 focus:ring-danger-500' : 'hover:border-primary-400 focus:border-primary-500'}`}
            />
            <button
              type="button"
              className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="rememberMe"
              type="checkbox"
              checked={values.rememberMe}
              onChange={(e) => handleChange({ target: { name: 'rememberMe', value: e.target.checked } } as any)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded transition-colors duration-200"
            />
            <label htmlFor="remember-me" className="ml-2 block text-label">
              Remember me
            </label>
          </div>

          <div className="text-sm">
            <Link
              to="/auth/forgot-password"
              className="font-medium text-primary-600 hover:text-primary-500 transition-colors duration-200"
            >
              Forgot your password?
            </Link>
          </div>
        </div>

        <div>
          <Button
            type="submit"
            className={`w-full btn-primary transform transition-all duration-200 ${isLoading ? 'scale-95' : 'hover:scale-105'} ${!isValid || isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            loading={isLoading}
            disabled={!isValid || isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </Button>
        </div>
      </form>

      {/* Quick Fill Section */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-blue-700 flex items-center gap-2">
            <Edit3 className="h-4 w-4" />
            Quick Fill Credentials
          </h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClearForm}
            className="text-red-600 border-red-300 hover:bg-red-50 flex items-center gap-1"
          >
            <Trash2 className="h-3 w-3" />
            Clear
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleAutofill('admin')}
            className="text-blue-600 border-blue-300 hover:bg-blue-100"
          >
            Admin
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleAutofill('agent')}
            className="text-blue-600 border-blue-300 hover:bg-blue-100"
          >
            Agent
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleAutofill('landlord')}
            className="text-blue-600 border-blue-300 hover:bg-blue-100"
          >
            Landlord
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleAutofill('tenant')}
            className="text-blue-600 border-blue-300 hover:bg-blue-100"
          >
            Tenant
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleAutofill('solicitor')}
            className="text-blue-600 border-blue-300 hover:bg-blue-100"
          >
            Solicitor
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleAutofill('buyer')}
            className="text-blue-600 border-blue-300 hover:bg-blue-100"
          >
            Buyer
          </Button>
        </div>
        <p className="text-xs text-blue-600 mt-2 text-center">
          Click to fill form fields, then manually click "Sign in"
        </p>
      </div>

      {/* Demo Accounts */}
      <div className="mt-6">
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
            className="w-full"
          >
            Demo Admin Account
          </Button>
          <Button
            variant="outline"
            onClick={() => handleDemoLogin('agent')}
            disabled={isLoading}
            className="w-full"
          >
            Demo Agent Account
          </Button>
          <Button
            variant="outline"
            onClick={() => handleDemoLogin('landlord')}
            disabled={isLoading}
            className="w-full"
          >
            Demo Landlord Account
          </Button>
          <Button
            variant="outline"
            onClick={() => handleDemoLogin('tenant')}
            disabled={isLoading}
            className="w-full"
          >
            Demo Tenant Account
          </Button>
          <Button
            variant="outline"
            onClick={() => handleDemoLogin('solicitor')}
            disabled={isLoading}
            className="w-full"
          >
            Demo Solicitor Account
          </Button>
          <Button
            variant="outline"
            onClick={() => handleDemoLogin('buyer')}
            disabled={isLoading}
            className="w-full"
          >
            Demo Buyer Account
          </Button>
        </div>
      </div>

      {/* Sign Up Link */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-600">
          Don't have an account?{' '}
          <Link
            to="/auth/register"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Sign up here
          </Link>
        </p>
      </div>

      {/* Terms and Privacy */}
      <div className="mt-8 text-center">
        <p className="text-xs text-gray-500">
          By signing in, you agree to our{' '}
          <Link to="/terms" className="text-blue-600 hover:text-blue-500">
            Terms of Service
          </Link>
          {' '}and{' '}
          <Link to="/privacy" className="text-blue-600 hover:text-blue-500">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;