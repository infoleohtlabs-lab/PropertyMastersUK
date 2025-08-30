import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, User, Mail, Phone, Lock, Eye, EyeOff, MapPin } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { showToast } from '../../components/ui/Toast';
import { useAuthStore } from '../../stores/authStore';
import { useFormValidation } from '../../hooks';
import { validateEmail, validateUKPhone, validateUKPostcode } from '../../utils';
import { RegisterData, UserRole, Address } from '../../types';

interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  role: UserRole;
  companyName?: string;
  address?: Address;
  agreeToTerms: boolean;
  subscribeToNewsletter?: boolean;
}

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.TENANT);

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    isValid,
    validateField,
    setValue
  } = useFormValidation<RegisterFormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: UserRole.TENANT,
    companyName: '',
    address: {
      street: '',
      city: '',
      county: '',
      postcode: '',
      country: 'UK'
    },
    agreeToTerms: false,
    subscribeToNewsletter: false
  }, {
    firstName: (value) => {
      if (!value) return 'First name is required';
      if (value.length < 2) return 'First name must be at least 2 characters';
      return '';
    },
    lastName: (value) => {
      if (!value) return 'Last name is required';
      if (value.length < 2) return 'Last name must be at least 2 characters';
      return '';
    },
    email: (value) => {
      if (!value) return 'Email is required';
      if (!validateEmail(value)) return 'Please enter a valid email address';
      return '';
    },
    password: (value) => {
      if (!value) return 'Password is required';
      if (value.length < 8) return 'Password must be at least 8 characters';
      if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
        return 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
      }
      return '';
    },
    confirmPassword: (value) => {
      if (!value) return 'Please confirm your password';
      if (value !== values.password) return 'Passwords do not match';
      return '';
    },
    phone: (value) => {
      if (!value) return 'Phone number is required';
      if (!validateUKPhone(value)) return 'Please enter a valid UK phone number';
      return '';
    },
    companyName: (value: string) => {
      if (selectedRole === UserRole.AGENT && !value) return 'Company name is required for agents';
      return '';
    },
    address: (value: RegisterData['address']) => {
      if (!value) return 'Address is required';
      if (!value.street) return 'Street address is required';
      if (!value.city) return 'City is required';
      if (!value.county) return 'County is required';
      if (!value.postcode) return 'Postcode is required';
      if (!validateUKPostcode(value.postcode)) return 'Please enter a valid UK postcode';
      return '';
    },
    role: (value: UserRole) => {
      if (!value) return 'Role is required';
      return '';
    },
    agreeToTerms: (value: boolean) => {
      if (!value) return 'You must agree to the terms and conditions';
      return '';
    },
    subscribeToNewsletter: (value: boolean) => {
      return '';
    }
  });

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    setValue('role', role);
  };

  const handleAddressChange = (field: string, value: string) => {
    setValue('address', {
      ...values.address!,
      [field]: value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all required fields
    const requiredFields = [
      'firstName', 'lastName', 'email', 'password', 'confirmPassword', 
      'phone', 'address'
    ];
    
    if (selectedRole === UserRole.AGENT) {
      requiredFields.push('companyName');
    }

    let hasErrors = false;
    requiredFields.forEach(field => {
      const fieldValue = (values as any)[field];
      const error = validateField(field as keyof RegisterFormData, fieldValue);
      if (error) hasErrors = true;
    });

    if (hasErrors || !isValid) {
      showToast.error('Please fix the errors before submitting');
      return;
    }

    try {
      const { confirmPassword, subscribeToNewsletter, agreeToTerms, ...registerData } = values;
      const finalRegisterData: RegisterData = {
        ...registerData,
        confirmPassword,
        agreeToTerms,
        subscribeToNewsletter
      };
      await register(finalRegisterData);
      showToast.success('Account created successfully! Please check your email to verify your account.');
      navigate('/auth/login');
    } catch (error: any) {
      showToast.error(error.message || 'Registration failed. Please try again.');
    }
  };

  const roleOptions = [
    {
      value: UserRole.TENANT,
      label: 'Tenant',
      description: 'Looking for properties to rent'
    },
    {
      value: UserRole.LANDLORD,
      label: 'Landlord',
      description: 'Property owner looking to rent out'
    },
    {
      value: UserRole.AGENT,
      label: 'Estate Agent',
      description: 'Professional property agent'
    }
  ];

  return (
    <div className="w-full max-w-2xl mx-auto animate-fade-in">
      {/* Logo and Title */}
      <div className="text-center mb-8">
        <div className="flex justify-center items-center space-x-2 mb-4">
          <Building2 className="h-10 w-10 text-blue-600" />
          <span className="text-2xl font-bold text-gray-900">
            PropertyMasters UK
          </span>
        </div>
        <h2 className="text-heading-2 mb-2">
          Create your account
        </h2>
        <p className="text-body-sm">
          Join PropertyMasters UK and start your property journey
        </p>
      </div>

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="form-section">
        {/* Role Selection */}
        <div className="form-group">
          <label className="block text-label mb-3">
            I am a...
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {roleOptions.map((option) => (
              <div
                key={option.value}
                className={`relative rounded-lg border p-4 cursor-pointer transition-all transform hover:scale-105 ${
                  selectedRole === option.value
                    ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-500 shadow-md'
                    : 'border-gray-300 hover:border-gray-400 hover:shadow-sm'
                }`}
                onClick={() => handleRoleChange(option.value)}
              >
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="role"
                    value={option.value}
                    checked={selectedRole === option.value}
                    onChange={() => handleRoleChange(option.value)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 transition-colors duration-200"
                  />
                  <div className="ml-3">
                    <label className="block text-sm font-medium text-gray-900">
                      {option.label}
                    </label>
                    <p className="text-xs text-gray-500">
                      {option.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Personal Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="form-group">
            <Input
              id="firstName"
              name="firstName"
              type="text"
              label="First Name"
              placeholder="Enter your first name"
              value={values.firstName}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.firstName ? errors.firstName : ''}
              leftIcon={<User className="h-4 w-4" />}
              required
              className={`input-field transition-all duration-300 ${touched.firstName && errors.firstName ? 'animate-shake border-danger-300 focus:border-danger-500 focus:ring-danger-500' : 'hover:border-primary-400 focus:border-primary-500'}`}
            />
          </div>

          <div className="form-group">
            <Input
              id="lastName"
              name="lastName"
              type="text"
              label="Last Name"
              placeholder="Enter your last name"
              value={values.lastName}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.lastName ? errors.lastName : ''}
              leftIcon={<User className="h-4 w-4" />}
              required
              className={`input-field transition-all duration-300 ${touched.lastName && errors.lastName ? 'animate-shake border-danger-300 focus:border-danger-500 focus:ring-danger-500' : 'hover:border-primary-400 focus:border-primary-500'}`}
            />
          </div>
        </div>

        <div className="form-group">
          <Input
            id="email"
            name="email"
            type="email"
            label="Email Address"
            placeholder="Enter your email address"
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
          <Input
            id="phone"
            name="phone"
            type="tel"
            label="Phone Number"
            placeholder="Enter your UK phone number"
            value={values.phone}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.phone ? errors.phone : ''}
            leftIcon={<Phone className="h-4 w-4" />}
            required
            className={`input-field transition-all duration-300 ${touched.phone && errors.phone ? 'animate-shake border-danger-300 focus:border-danger-500 focus:ring-danger-500' : 'hover:border-primary-400 focus:border-primary-500'}`}
          />
        </div>

        {/* Company Name (for agents) */}
        {selectedRole === UserRole.AGENT && (
          <div className="form-group">
            <Input
              id="companyName"
              name="companyName"
              type="text"
              label="Company Name"
              placeholder="Enter your company name"
              value={values.companyName}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.companyName ? errors.companyName : ''}
              leftIcon={<Building2 className="h-4 w-4" />}
              required
              className={`input-field transition-all duration-300 ${touched.companyName && errors.companyName ? 'animate-shake border-danger-300 focus:border-danger-500 focus:ring-danger-500' : 'hover:border-primary-400 focus:border-primary-500'}`}
            />
          </div>
        )}

        {/* Password Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="form-group">
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                label="Password"
                placeholder="Create a password"
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

          <div className="form-group">
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                label="Confirm Password"
                placeholder="Confirm your password"
                value={values.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.confirmPassword ? errors.confirmPassword : ''}
                leftIcon={<Lock className="h-4 w-4" />}
                required
                className={`input-field transition-all duration-300 ${touched.confirmPassword && errors.confirmPassword ? 'animate-shake border-danger-300 focus:border-danger-500 focus:ring-danger-500' : 'hover:border-primary-400 focus:border-primary-500'}`}
              />
              <button
                type="button"
                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Address Information</h3>
          
          <div className="form-group">
            <Input
              id="address.street"
              name="address.street"
              type="text"
              label="Street Address"
              placeholder="Enter your street address"
              value={values.address?.street || ''}
              onChange={(e) => handleAddressChange('street', e.target.value)}
              onBlur={handleBlur}
              error={touched.address ? errors.address : ''}
              leftIcon={<MapPin className="h-4 w-4" />}
              required
              className={`input-field transition-all duration-300 ${touched.address && errors.address ? 'animate-shake border-danger-300 focus:border-danger-500 focus:ring-danger-500' : 'hover:border-primary-400 focus:border-primary-500'}`}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="form-group">
              <Input
                id="address.city"
                name="address.city"
                type="text"
                label="City"
                placeholder="Enter your city"
                value={values.address?.city || ''}
                onChange={(e) => handleAddressChange('city', e.target.value)}
                onBlur={handleBlur}
                error={touched.address ? errors.address : ''}
                required
                className={`input-field transition-all duration-300 ${touched.address && errors.address ? 'animate-shake border-danger-300 focus:border-danger-500 focus:ring-danger-500' : 'hover:border-primary-400 focus:border-primary-500'}`}
              />
            </div>

            <div className="form-group">
              <Input
                id="address.county"
                name="address.county"
                type="text"
                label="County"
                placeholder="Enter your county"
                value={values.address?.county || ''}
                onChange={(e) => handleAddressChange('county', e.target.value)}
                onBlur={handleBlur}
                error={touched.address ? errors.address : ''}
                required
                className={`input-field transition-all duration-300 ${touched.address && errors.address ? 'animate-shake border-danger-300 focus:border-danger-500 focus:ring-danger-500' : 'hover:border-primary-400 focus:border-primary-500'}`}
              />
            </div>

            <div className="form-group">
              <Input
                id="address.postcode"
                name="address.postcode"
                type="text"
                label="Postcode"
                placeholder="Enter your postcode"
                value={values.address?.postcode || ''}
                onChange={(e) => handleAddressChange('postcode', e.target.value)}
                onBlur={handleBlur}
                error={touched.address ? errors.address : ''}
                required
                className={`input-field transition-all duration-300 ${touched.address && errors.address ? 'animate-shake border-danger-300 focus:border-danger-500 focus:ring-danger-500' : 'hover:border-primary-400 focus:border-primary-500'}`}
              />
            </div>
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="form-group">
          <div className="flex items-center">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              required
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded transition-colors duration-200"
            />
            <label htmlFor="terms" className="ml-2 block text-label">
              I agree to the{' '}
              <Link to="/terms" className="text-primary-600 hover:text-primary-500 transition-colors duration-200">
                Terms of Service
              </Link>
              {' '}and{' '}
              <Link to="/privacy" className="text-primary-600 hover:text-primary-500 transition-colors duration-200">
                Privacy Policy
              </Link>
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <div>
          <Button
            type="submit"
            className={`w-full btn-primary transform transition-all duration-200 ${isLoading ? 'scale-95' : 'hover:scale-105'} ${!isValid || isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            loading={isLoading}
            disabled={!isValid || isLoading}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </div>
      </form>

      {/* Sign In Link */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <Link
            to="/auth/login"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;