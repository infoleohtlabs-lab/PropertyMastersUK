import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { showToast } from '../../components/ui/Toast';
import { useFormValidation } from '../../hooks';
import { validateEmail } from '../../utils';

interface ForgotPasswordForm {
  email: string;
}

const ForgotPassword: React.FC = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    isValid,
    validateField
  } = useFormValidation<ForgotPasswordForm>({
    email: ''
  }, {
    email: (value) => {
      if (!value) return 'Email is required';
      if (!validateEmail(value)) return 'Please enter a valid email address';
      return '';
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const emailError = validateField('email', values.email);
    
    if (emailError || !isValid) {
      showToast.error('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIsSubmitted(true);
      showToast.success('Password reset instructions sent to your email');
    } catch (error: any) {
      showToast.error(error.message || 'Failed to send reset instructions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
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
              <div className="flex justify-center mb-4">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Check Your Email
              </h2>
              <p className="text-gray-600">
                We've sent password reset instructions to:
              </p>
              <p className="text-blue-600 font-medium mt-2">
                {values.email}
              </p>
            </div>

            {/* Instructions */}
            <div className="space-y-4 mb-8">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">Next Steps:</h3>
                <ol className="text-sm text-blue-800 space-y-1">
                  <li>1. Check your email inbox (and spam folder)</li>
                  <li>2. Click the reset link in the email</li>
                  <li>3. Create a new secure password</li>
                  <li>4. Sign in with your new password</li>
                </ol>
              </div>

              <div className="text-sm text-gray-600">
                <p>Didn't receive the email? Check your spam folder or try again in a few minutes.</p>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-4">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => {
                  setIsSubmitted(false);
                  handleChange({ target: { name: 'email', value: '' } } as any);
                }}
              >
                Try Different Email
              </Button>

              <Link
                to="/auth/login"
                className="w-full inline-flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 animate-fade-in">
        <div className="bg-white rounded-lg shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center items-center space-x-2 mb-4">
              <Building2 className="h-10 w-10 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">
                PropertyMasters UK
              </span>
            </div>
            <h2 className="text-heading-2 mb-2">
              Reset your password
            </h2>
            <p className="text-body-sm">
              Enter your email address and we'll send you a link to reset your password
            </p>
          </div>

          {/* Form */}
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

            <div>
              <Button
                type="submit"
                className={`w-full btn-primary transform transition-all duration-200 ${isLoading ? 'scale-95' : 'hover:scale-105'} ${!isValid || isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                loading={isLoading}
                disabled={!isValid || isLoading}
              >
                {isLoading ? 'Sending reset link...' : 'Send reset link'}
              </Button>
            </div>
          </form>

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">
              <p className="font-medium text-gray-900 mb-1">Security Notice:</p>
              <p>
                For your security, password reset links expire after 1 hour. 
                If you don't receive an email, please check your spam folder.
              </p>
            </div>
          </div>

          {/* Footer Links */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Remember your password?</span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="/auth/login"
                className="w-full inline-flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;