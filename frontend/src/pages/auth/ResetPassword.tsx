import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Building2, Eye, EyeOff, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { showToast } from '../../components/ui/Toast';
import { useFormValidation } from '../../hooks';

interface ResetPasswordForm {
  password: string;
  confirmPassword: string;
}

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    isValid,
    validateField
  } = useFormValidation<ResetPasswordForm>({
    initialValues: {
      password: '',
      confirmPassword: ''
    },
    validationRules: {
      password: (value) => {
        if (!value) return 'Password is required';
        if (value.length < 8) return 'Password must be at least 8 characters';
        if (!/(?=.*[a-z])/.test(value)) return 'Password must contain at least one lowercase letter';
        if (!/(?=.*[A-Z])/.test(value)) return 'Password must contain at least one uppercase letter';
        if (!/(?=.*\d)/.test(value)) return 'Password must contain at least one number';
        if (!/(?=.*[@$!%*?&])/.test(value)) return 'Password must contain at least one special character';
        return '';
      },
      confirmPassword: (value) => {
        if (!value) return 'Please confirm your password';
        if (value !== values.password) return 'Passwords do not match';
        return '';
      }
    }
  });

  useEffect(() => {
    // Validate token on component mount
    const validateToken = async () => {
      if (!token || !email) {
        setTokenValid(false);
        return;
      }

      try {
        // Simulate token validation API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setTokenValid(true);
      } catch (error) {
        setTokenValid(false);
        showToast.error('Invalid or expired reset link');
      }
    };

    validateToken();
  }, [token, email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const passwordError = validateField('password', values.password);
    const confirmPasswordError = validateField('confirmPassword', values.confirmPassword);
    
    if (passwordError || confirmPasswordError || !isValid) {
      showToast.error('Please fix the errors before submitting');
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call to reset password
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIsSuccess(true);
      showToast.success('Password reset successfully!');
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/auth/login');
      }, 3000);
    } catch (error: any) {
      showToast.error(error.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state while validating token
  if (tokenValid === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <div className="text-center">
              <div className="flex justify-center items-center space-x-2 mb-4">
                <Building2 className="h-10 w-10 text-blue-600" />
                <span className="text-2xl font-bold text-gray-900">
                  PropertyMasters UK
                </span>
              </div>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Validating reset link...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Invalid token state
  if (tokenValid === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="flex justify-center items-center space-x-2 mb-4">
                <Building2 className="h-10 w-10 text-red-600" />
                <span className="text-2xl font-bold text-gray-900">
                  PropertyMasters UK
                </span>
              </div>
              <div className="flex justify-center mb-4">
                <AlertCircle className="h-16 w-16 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Invalid Reset Link
              </h2>
              <p className="text-gray-600">
                This password reset link is invalid or has expired.
              </p>
            </div>

            <div className="space-y-4">
              <Link
                to="/auth/forgot-password"
                className="w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Request New Reset Link
              </Link>
              
              <Link
                to="/auth/login"
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="flex justify-center items-center space-x-2 mb-4">
                <Building2 className="h-10 w-10 text-green-600" />
                <span className="text-2xl font-bold text-gray-900">
                  PropertyMasters UK
                </span>
              </div>
              <div className="flex justify-center mb-4">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Password Reset Successful!
              </h2>
              <p className="text-gray-600">
                Your password has been successfully reset. You can now sign in with your new password.
              </p>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-500 mb-4">
                Redirecting to login page in 3 seconds...
              </p>
              <Link
                to="/auth/login"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                Sign In Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Reset password form
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-lg shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center items-center space-x-2 mb-4">
              <Building2 className="h-10 w-10 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">
                PropertyMasters UK
              </span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Reset Your Password
            </h2>
            <p className="text-gray-600">
              Enter your new password below.
            </p>
            {email && (
              <p className="text-sm text-blue-600 mt-2">
                Resetting password for: {email}
              </p>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                label="New Password"
                placeholder="Enter your new password"
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

            <div>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                label="Confirm New Password"
                placeholder="Confirm your new password"
                value={values.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.confirmPassword ? errors.confirmPassword : ''}
                leftIcon={<Lock className="h-4 w-4" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
                required
              />
            </div>

            <div>
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                loading={isLoading}
                disabled={!isValid || isLoading}
              >
                Reset Password
              </Button>
            </div>
          </form>

          {/* Password Requirements */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Password Requirements:</h3>
            <ul className="text-xs text-gray-600 space-y-1">
              <li className={values.password.length >= 8 ? 'text-green-600' : ''}>
                • At least 8 characters
              </li>
              <li className={/(?=.*[a-z])/.test(values.password) ? 'text-green-600' : ''}>
                • One lowercase letter
              </li>
              <li className={/(?=.*[A-Z])/.test(values.password) ? 'text-green-600' : ''}>
                • One uppercase letter
              </li>
              <li className={/(?=.*\d)/.test(values.password) ? 'text-green-600' : ''}>
                • One number
              </li>
              <li className={/(?=.*[@$!%*?&])/.test(values.password) ? 'text-green-600' : ''}>
                • One special character (@$!%*?&)
              </li>
            </ul>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <Link
              to="/auth/login"
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;