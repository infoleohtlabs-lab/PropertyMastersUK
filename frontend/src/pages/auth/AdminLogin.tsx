import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Shield, Mail, Lock, Eye, EyeOff } from 'lucide-react';
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
  const from = location.state?.from?.pathname || '/admin/dashboard';

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
        const credentials: LoginCredentials = {
          email: formValues.email,
          password: formValues.password,
          rememberMe: formValues.rememberMe
        };
        await login(credentials);
        showToast.success('Welcome back, Admin!');
        navigate(from, { replace: true });
      } catch (error: any) {
        showToast.error(error.message || 'Login failed. Please try again.');
      }
    }
  });

  const handleDemoLogin = async (role: string) => {
    const credentials = {
      admin: { email: 'admin.propertymastersuk@gmail.com', password: 'PropertyTest2024!' },
      agent: { email: 'agent.propertymastersuk@gmail.com', password: 'PropertyTest2024!' },
      landlord: { email: 'landlord.propertymastersuk@gmail.com', password: 'PropertyTest2024!' },
      tenant: { email: 'tenant.propertymastersuk@gmail.com', password: 'PropertyTest2024!' },
      buyer: { email: 'buyer.propertymastersuk@gmail.com', password: 'PropertyTest2024!' },
      solicitor: { email: 'solicitor.propertymastersuk@gmail.com', password: 'PropertyTest2024!' }
    };

    const creds = credentials[role as keyof typeof credentials];
    if (creds) {
      try {
        const loginCredentials: LoginCredentials = {
          email: creds.email,
          password: creds.password,
          rememberMe: false
        };
        await login(loginCredentials);
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
      admin: { email: 'admin.propertymastersuk@gmail.com', password: 'PropertyTest2024!' },
      agent: { email: 'agent.propertymastersuk@gmail.com', password: 'PropertyTest2024!' },
      landlord: { email: 'landlord.propertymastersuk@gmail.com', password: 'PropertyTest2024!' },
      tenant: { email: 'tenant.propertymastersuk@gmail.com', password: 'PropertyTest2024!' },
      buyer: { email: 'buyer.propertymastersuk@gmail.com', password: 'PropertyTest2024!' },
      solicitor: { email: 'solicitor.propertymastersuk@gmail.com', password: 'PropertyTest2024!' }
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full animate-fade-in">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-red-100">
            <Shield className="h-6 w-6 text-red-600" />
          </div>
          <h2 className="mt-6 text-heading-2 text-gray-900">
            Admin Portal
          </h2>
          <p className="mt-2 text-body-sm text-gray-600">
            Secure administrative access
          </p>
        </div>

        <form className="form-section" onSubmit={handleSubmit}>
          <div className="form-group">
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="Email address"
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.email && errors.email}
              className={`input-field ${
                touched.email && errors.email
                  ? 'border-red-500 animate-shake'
                  : touched.email
                  ? 'border-green-500'
                  : ''
              }`}
              icon={<Mail className="h-4 w-4" />}
            />
          </div>
          
          <div className="form-group">
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                placeholder="Password"
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.password && errors.password}
                className={`input-field pr-10 ${
                  touched.password && errors.password
                    ? 'border-red-500 animate-shake'
                    : touched.password
                    ? 'border-green-500'
                    : ''
                }`}
                icon={<Lock className="h-4 w-4" />}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                )}
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
                onChange={handleChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-label text-gray-900">
                Remember me
              </label>
            </div>

            <div className="text-label">
              <Link to="/auth/forgot-password" className="font-medium text-red-600 hover:text-red-500 transition-colors">
                Forgot your password?
              </Link>
            </div>
          </div>

          <div>
            <Button
              type="submit"
              className="btn-primary w-full bg-red-600 hover:bg-red-700 focus:ring-red-500 hover:animate-scale-in transition-all"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign in to Admin Portal'}
            </Button>
          </div>

          {/* Demo Login */}
          <div className="component-spacing">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-caption">
                <span className="px-2 bg-white text-gray-500">Quick demo access</span>
              </div>
            </div>

            {/* Demo Accounts Section */}
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
                    className="btn-primary text-xs py-2 bg-red-600 hover:bg-red-700"
                    disabled={isLoading}
                  >
                    Admin
                  </Button>
                  <Button
                    type="button"
                    onClick={() => handleDemoLogin('agent')}
                    className="btn-secondary text-xs py-2"
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
          </div>

          {/* Footer Links */}
          <div className="component-spacing">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-caption">
                <span className="px-2 bg-white text-gray-500">Other options</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Link
                to="/auth/login"
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-label font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-all"
              >
                General Login
              </Link>
              <Link
                to="/auth/register"
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-label font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-all"
              >
                Register
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;