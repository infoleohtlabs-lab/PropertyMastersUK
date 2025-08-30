import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { FormField, FormSection, FormActions, FormMessage, FormGrid } from '../ui/form';
import { Search, PropertySearch } from '../ui/search';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import {
  User,
  Mail,
  Phone,
  Lock,
  MapPin,
  DollarSign,
  Calendar,
  Home,
  Building,
  Search as SearchIcon,
  Filter,
  Plus,
} from 'lucide-react';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  address: string;
  budget: string;
  moveInDate: string;
  propertyType: string;
  searchQuery: string;
}

interface FormErrors {
  [key: string]: string;
}

export default function EnhancedFormExample() {
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    address: '',
    budget: '',
    moveInDate: '',
    propertyType: '',
    searchQuery: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleInputChange = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setShowSuccess(true);
    
    // Reset form after success
    setTimeout(() => {
      setShowSuccess(false);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        address: '',
        budget: '',
        moveInDate: '',
        propertyType: '',
        searchQuery: '',
      });
    }, 3000);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Enhanced Form Components</h1>
        <p className="text-gray-600">Showcase of all enhanced input and form styling features</p>
      </div>

      {/* Search Components Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <SearchIcon className="w-5 h-5" />
            <span>Search Components</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Basic Search</label>
              <Search 
                placeholder="Search anything..."
                onSearch={(query) => console.log('Search:', query)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Property Search</label>
              <PropertySearch 
                onSearch={(query, filters) => console.log('Property search:', query, filters)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Input Variants Section */}
      <Card>
        <CardHeader>
          <CardTitle>Input Variants & States</CardTitle>
        </CardHeader>
        <CardContent>
          <FormGrid>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Default Input</label>
              <Input placeholder="Default input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Input</label>
              <Input 
                variant="search" 
                placeholder="Search input"
                leftIcon={<SearchIcon className="w-4 h-4" />}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Error State</label>
              <Input 
                variant="error" 
                placeholder="Error input"
                error="This field has an error"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Success State</label>
              <Input 
                variant="success" 
                placeholder="Success input"
                success="This field is valid"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">With Left Icon</label>
              <Input 
                placeholder="Email address"
                leftIcon={<Mail className="w-4 h-4" />}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password with Toggle</label>
              <Input 
                type="password"
                placeholder="Password"
                showPasswordToggle
                leftIcon={<Lock className="w-4 h-4" />}
              />
            </div>
          </FormGrid>
        </CardContent>
      </Card>

      {/* Complete Form Example */}
      <Card>
        <CardHeader>
          <CardTitle>Complete Form Example</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <FormSection title="Personal Information" description="Enter your basic details">
              <FormGrid>
                <FormField>
                  <Input
                    label="First Name"
                    placeholder="Enter your first name"
                    value={formData.firstName}
                    onChange={handleInputChange('firstName')}
                    leftIcon={<User className="w-4 h-4" />}
                    error={errors.firstName}
                    variant={errors.firstName ? 'error' : 'default'}
                  />
                </FormField>
                <FormField>
                  <Input
                    label="Last Name"
                    placeholder="Enter your last name"
                    value={formData.lastName}
                    onChange={handleInputChange('lastName')}
                    leftIcon={<User className="w-4 h-4" />}
                    error={errors.lastName}
                    variant={errors.lastName ? 'error' : 'default'}
                  />
                </FormField>
              </FormGrid>
            </FormSection>

            <FormSection title="Contact Information" description="How can we reach you?">
              <FormGrid>
                <FormField>
                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange('email')}
                    leftIcon={<Mail className="w-4 h-4" />}
                    error={errors.email}
                    variant={errors.email ? 'error' : formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) ? 'error' : formData.email ? 'success' : 'default'}
                    success={formData.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) ? 'Valid email address' : undefined}
                  />
                </FormField>
                <FormField>
                  <Input
                    label="Phone Number"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={handleInputChange('phone')}
                    leftIcon={<Phone className="w-4 h-4" />}
                    error={errors.phone}
                    variant={errors.phone ? 'error' : 'default'}
                  />
                </FormField>
              </FormGrid>
            </FormSection>

            <FormSection title="Security" description="Create a secure password">
              <FormGrid>
                <FormField>
                  <Input
                    label="Password"
                    type="password"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleInputChange('password')}
                    leftIcon={<Lock className="w-4 h-4" />}
                    showPasswordToggle
                    error={errors.password}
                    variant={errors.password ? 'error' : 'default'}
                    helperText="Password must be at least 8 characters long"
                  />
                </FormField>
                <FormField>
                  <Input
                    label="Confirm Password"
                    type="password"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange('confirmPassword')}
                    leftIcon={<Lock className="w-4 h-4" />}
                    showPasswordToggle
                    error={errors.confirmPassword}
                    variant={errors.confirmPassword ? 'error' : formData.confirmPassword && formData.password === formData.confirmPassword ? 'success' : 'default'}
                    success={formData.confirmPassword && formData.password === formData.confirmPassword ? 'Passwords match' : undefined}
                  />
                </FormField>
              </FormGrid>
            </FormSection>

            <FormSection title="Property Preferences" description="Tell us about your property needs">
              <FormGrid>
                <FormField>
                  <Input
                    label="Preferred Address"
                    placeholder="Enter preferred location"
                    value={formData.address}
                    onChange={handleInputChange('address')}
                    leftIcon={<MapPin className="w-4 h-4" />}
                  />
                </FormField>
                <FormField>
                  <Input
                    label="Budget Range"
                    placeholder="Enter your budget"
                    value={formData.budget}
                    onChange={handleInputChange('budget')}
                    leftIcon={<DollarSign className="w-4 h-4" />}
                  />
                </FormField>
                <FormField>
                  <Input
                    label="Move-in Date"
                    type="date"
                    value={formData.moveInDate}
                    onChange={handleInputChange('moveInDate')}
                    leftIcon={<Calendar className="w-4 h-4" />}
                  />
                </FormField>
                <FormField>
                  <Input
                    label="Property Type"
                    placeholder="e.g., Apartment, House, Condo"
                    value={formData.propertyType}
                    onChange={handleInputChange('propertyType')}
                    leftIcon={<Home className="w-4 h-4" />}
                  />
                </FormField>
              </FormGrid>
            </FormSection>

            {showSuccess && (
              <FormMessage type="success">
                Form submitted successfully! Thank you for your information.
              </FormMessage>
            )}

            <FormActions>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setFormData({
                  firstName: '',
                  lastName: '',
                  email: '',
                  phone: '',
                  password: '',
                  confirmPassword: '',
                  address: '',
                  budget: '',
                  moveInDate: '',
                  propertyType: '',
                  searchQuery: '',
                })}
              >
                Reset Form
              </Button>
              <Button 
                type="submit" 
                loading={isSubmitting}
                disabled={isSubmitting}
                className="btn-primary"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Form'}
              </Button>
            </FormActions>
          </form>
        </CardContent>
      </Card>

      {/* Button Variants Section */}
      <Card>
        <CardHeader>
          <CardTitle>Button Variants & States</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Button Variants</h4>
              <div className="flex flex-wrap gap-3">
                <Button variant="default">Default</Button>
                <Button variant="primary" className="btn-primary">Primary</Button>
                <Button variant="secondary" className="btn-secondary">Secondary</Button>
                <Button variant="danger" className="btn-danger">Danger</Button>
                <Button variant="success">Success</Button>
                <Button variant="warning">Warning</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Button Sizes</h4>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="xs">Extra Small</Button>
                <Button size="sm">Small</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large</Button>
                <Button size="xl">Extra Large</Button>
                <Button size="icon" variant="outline">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Button States</h4>
              <div className="flex flex-wrap gap-3">
                <Button loading>Loading</Button>
                <Button disabled>Disabled</Button>
                <Button leftIcon={<Plus className="w-4 h-4" />}>With Left Icon</Button>
                <Button rightIcon={<Filter className="w-4 h-4" />}>With Right Icon</Button>
                <Button fullWidth className="btn-primary">Full Width Button</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}