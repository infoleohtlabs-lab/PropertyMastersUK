import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Building2, Eye, EyeOff, Mail, Lock } from 'lucide-react';
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
      showToast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch (error: any) {
      showToast.error(error.message || 'Login failed. Please try again.');
    }
  };

  const handleDemoLogin = async (role: 'agent' | 'landlord' | 'tenant' | 'admin' | 'solicitor' | 'buyer') => {
    const demoCredentials = {
      agent: { email: 'john.agent@propertymastersuk.com', password: 'password123' },
      landlord: { email: 'sarah.landlord@gmail.com', password: 'password123' },
      tenant: { email: 'mike.tenant@gmail.com', password: 'password123' },
      admin: { email: 'admin@propertymastersuk.com', password: 'password123' },
      solicitor: { email: 'solicitor@propertymastersuk.com', password: 'password123' },
      buyer: { email: 'emma.buyer@gmail.com', password: 'password123' }
    };

    try {
      await login(demoCredentials[role]);
      showToast.success(`Welcome back, demo ${role}!`);
      navigate(from, { replace: true });
    } catch (error: any) {
      showToast.error(error.message || 'Demo login failed.');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Logo and Title */}
      <div className="text-center mb-8">
        <div className="flex justify-center items-center space-x-2 mb-4">
          <Building2 className="h-10 w-10 text-blue-600" />
          <span className="text-2xl font-bold text-gray-900">
            PropertyMasters UK
          </span>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back
        </h2>
        <p className="text-gray-600">
          Sign in to your account to continue
        </p>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
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
            className="w-full"
            loading={isLoading}
            disabled={!isValid || isLoading}
          >
            Sign in
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