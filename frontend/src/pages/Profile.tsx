import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Settings,
  Bell,
  CreditCard,
  FileText,
  Shield,
  Camera,
  Save,
  ArrowLeft
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuthStore } from '../stores/authStore';

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  position: string;
  address: string;
  city: string;
  postcode: string;
}

interface SecuritySettings {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  twoFactorEnabled: boolean;
}

interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  marketingEmails: boolean;
}

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'billing' | 'documents'>('profile');
  const [loading, setLoading] = useState(false);
  
  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: '+44 7700 900123',
    company: 'PropertyMasters UK',
    position: user?.role || '',
    address: '123 Main Street',
    city: 'London',
    postcode: 'SW1A 1AA'
  });

  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: false
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    marketingEmails: false
  });

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      // Show success message
    }, 1000);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (securitySettings.newPassword !== securitySettings.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSecuritySettings({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        twoFactorEnabled: securitySettings.twoFactorEnabled
      });
      // Show success message
    }, 1000);
  };

  const handleNotificationUpdate = async () => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      // Show success message
    }, 500);
  };

  const tabs = [
    { id: 'profile', label: 'Profile Information', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'documents', label: 'Documents', icon: FileText }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account settings and preferences</p>
        </div>

        <div className="bg-white shadow rounded-lg">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'profile' && (
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <div className="h-24 w-24 rounded-full bg-blue-600 flex items-center justify-center">
                      <span className="text-white text-2xl font-bold">
                        {profileData.firstName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center hover:bg-gray-50"
                    >
                      <Camera className="h-4 w-4 text-gray-600" />
                    </button>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {profileData.firstName} {profileData.lastName}
                    </h3>
                    <p className="text-sm text-gray-500 capitalize">{user?.role}</p>
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label required">
                      First Name
                    </label>
                    <Input
                      type="text"
                      value={profileData.firstName}
                      onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                      required
                      className="form-input focus-ring"
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label required">
                      Last Name
                    </label>
                    <Input
                      type="text"
                      value={profileData.lastName}
                      onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                      required
                      className="form-input focus-ring"
                      placeholder="Enter your last name"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label required">
                      Email
                    </label>
                    <Input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      required
                      className="form-input focus-ring"
                      placeholder="Enter your email address"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">
                      Phone
                    </label>
                    <Input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      className="form-input focus-ring"
                      placeholder="Enter your phone number"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">
                      Company
                    </label>
                    <Input
                      type="text"
                      value={profileData.company}
                      onChange={(e) => setProfileData({ ...profileData, company: e.target.value })}
                      className="form-input focus-ring"
                      placeholder="Enter your company name"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">
                      Position
                    </label>
                    <Input
                      type="text"
                      value={profileData.position}
                      onChange={(e) => setProfileData({ ...profileData, position: e.target.value })}
                      className="form-input focus-ring"
                      placeholder="Enter your position"
                    />
                  </div>
                  <div className="form-group md:col-span-2">
                    <label className="form-label">
                      Address
                    </label>
                    <Input
                      type="text"
                      value={profileData.address}
                      onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                      className="form-input focus-ring"
                      placeholder="Enter your full address"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">
                      City
                    </label>
                    <Input
                      type="text"
                      value={profileData.city}
                      onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                      className="form-input focus-ring"
                      placeholder="Enter your city"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">
                      Postcode
                    </label>
                    <Input
                      type="text"
                      value={profileData.postcode}
                      onChange={(e) => setProfileData({ ...profileData, postcode: e.target.value })}
                      className="form-input focus-ring"
                      placeholder="Enter your postcode"
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="btn-primary btn-loading"
                    size="lg"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            )}

            {activeTab === 'security' && (
              <div className="form-section">
                <div className="section-header">
                  <h3 className="section-title">Change Password</h3>
                  <p className="section-description">Update your password to keep your account secure</p>
                </div>
                
                <form onSubmit={handlePasswordChange} className="form-container">
                  <div className="form-grid-single">
                    <div className="form-group">
                      <label className="form-label required">
                        Current Password
                      </label>
                      <Input
                        type="password"
                        value={securitySettings.currentPassword}
                        onChange={(e) => setSecuritySettings({ ...securitySettings, currentPassword: e.target.value })}
                        required
                        className="form-input focus-ring"
                        placeholder="Enter your current password"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label required">
                        New Password
                      </label>
                      <Input
                        type="password"
                        value={securitySettings.newPassword}
                        onChange={(e) => setSecuritySettings({ ...securitySettings, newPassword: e.target.value })}
                        required
                        className="form-input focus-ring"
                        placeholder="Enter your new password"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label required">
                        Confirm New Password
                      </label>
                      <Input
                        type="password"
                        value={securitySettings.confirmPassword}
                        onChange={(e) => setSecuritySettings({ ...securitySettings, confirmPassword: e.target.value })}
                        required
                        className="form-input focus-ring"
                        placeholder="Confirm your new password"
                      />
                    </div>
                  </div>

                  <div className="form-actions">
                    <Button 
                      type="submit" 
                      disabled={loading}
                      className="btn-primary btn-loading"
                      size="lg"
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      {loading ? 'Updating...' : 'Update Password'}
                    </Button>
                  </div>
                </form>

                <div className="section-divider">
                  <div className="section-header">
                    <h3 className="section-title">Two-Factor Authentication</h3>
                    <p className="section-description">Add an extra layer of security to your account</p>
                  </div>
                  <div className="setting-toggle">
                    <div className="setting-info">
                      <p className="setting-label">Enable 2FA</p>
                      <p className="setting-description">
                        Protect your account with an additional verification step
                      </p>
                    </div>
                    <Button
                      variant={securitySettings.twoFactorEnabled ? 'outline' : 'primary'}
                      onClick={() => setSecuritySettings({ ...securitySettings, twoFactorEnabled: !securitySettings.twoFactorEnabled })}
                      className="btn-toggle"
                    >
                      {securitySettings.twoFactorEnabled ? 'Disable' : 'Enable'}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="form-section">
                <div className="section-header">
                  <h3 className="section-title">Notification Preferences</h3>
                  <p className="section-description">Choose how you want to receive notifications</p>
                </div>
                
                <div className="settings-list">
                  <div className="setting-item">
                    <div className="setting-info">
                      <p className="setting-label">Email Notifications</p>
                      <p className="setting-description">Receive notifications via email</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationSettings.emailNotifications}
                      onChange={(e) => setNotificationSettings({ ...notificationSettings, emailNotifications: e.target.checked })}
                      className="form-checkbox focus-ring"
                    />
                  </div>
                  
                  <div className="setting-item">
                    <div className="setting-info">
                      <p className="setting-label">SMS Notifications</p>
                      <p className="setting-description">Receive notifications via SMS</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationSettings.smsNotifications}
                      onChange={(e) => setNotificationSettings({ ...notificationSettings, smsNotifications: e.target.checked })}
                      className="form-checkbox focus-ring"
                    />
                  </div>
                  
                  <div className="setting-item">
                    <div className="setting-info">
                      <p className="setting-label">Push Notifications</p>
                      <p className="setting-description">Receive push notifications in your browser</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationSettings.pushNotifications}
                      onChange={(e) => setNotificationSettings({ ...notificationSettings, pushNotifications: e.target.checked })}
                      className="form-checkbox focus-ring"
                    />
                  </div>
                  
                  <div className="setting-item">
                    <div className="setting-info">
                      <p className="setting-label">Marketing Communications</p>
                      <p className="setting-description">Receive updates about new features and offers</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationSettings.marketingEmails}
                      onChange={(e) => setNotificationSettings({ ...notificationSettings, marketingEmails: e.target.checked })}
                      className="form-checkbox focus-ring"
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <Button
                    onClick={handleNotificationUpdate}
                    disabled={loading}
                    className="btn-primary btn-loading"
                    size="lg"
                  >
                    <Bell className="h-4 w-4 mr-2" />
                    {loading ? 'Saving...' : 'Save Preferences'}
                  </Button>
                </div>
              </div>
            )}

            {activeTab === 'billing' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Billing Information</h3>
                <div className="text-center py-12">
                  <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Billing features coming soon</p>
                </div>
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Documents</h3>
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Document management coming soon</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;