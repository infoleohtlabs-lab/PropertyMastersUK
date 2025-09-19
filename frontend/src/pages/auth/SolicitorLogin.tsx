import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Building2, Eye, EyeOff, Mail, Lock, Scale } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { showToast } from '../../components/ui/Toast';
import { useAuthStore } from '../../stores/authStore';
import { useFormValidation } from '../../hooks';
import { validateEmail } from '../../utils';
import type { LoginCredentials } from '../../types';

const SolicitorLogin: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/dashboard/solicitor';

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
    
    const emailError = validateField('email', values.email);
    const passwordError = validateField('password', values.password);
    
    if (emailError || passwordError || !isValid) {
      showToast.error('Please fix the errors before submitting');
      return;
    }

    try {
      await login(values);
      showToast.success('Welcome back, Solicitor!');
      navigate(from, { replace: true });
    } catch (error: any) {
      showToast.error(error.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-lg shadow-xl p-8 animate-fade-in">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center items-center space-x-2 mb-4">
              <Building2 className="h-10 w-10 text-purple-600" />
              <span className="text-heading-2 text-gray-900">
                PropertyMasters UK
              </span>
            </div>
            <div className="flex justify-center items-center space-x-2 mb-4">
              <Scale className="h-6 w-6 text-purple-600" />
              <h2 className="text-heading-1 text-gray-900">
                Solicitor Portal
              </h2>
            </div>
            <p className="text-body-sm text-gray-600">
              Manage legal cases and property transactions
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
                  placeholder="solicitor@lawfirm.com"
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
                  Solicitor Email
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
                  className="font-medium text-purple-600 hover:text-purple-500 transition-colors"
                >
                  Forgot password?
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
                {isLoading ? 'Signing in...' : 'Sign in to Solicitor Portal'}
              </button>
            </div>
          </form>

          {/* Professional Notice */}
          <div className="component-spacing p-4 bg-purple-50 rounded-lg">
            <div className="flex items-start space-x-2">
              <Scale className="h-5 w-5 text-purple-600 mt-0.5" />
              <div className="text-caption text-purple-800">
                <p className="font-medium">Professional Access</p>
                <p className="mt-1">
                  This portal is exclusively for qualified solicitors and legal professionals.
                  All activities are logged for compliance purposes.
                </p>
              </div>
            </div>
          </div>

          {/* Footer Links */}
          <div className="component-spacing">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-caption">
                <span className="px-2 bg-white text-gray-500">Other login options</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Link
                to="/auth/login"
                className="btn-secondary text-center hover:animate-scale-in transition-all duration-200"
              >
                General Login
              </Link>
              <Link
                to="/contact"
                className="btn-secondary text-center hover:animate-scale-in transition-all duration-200"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SolicitorLogin;