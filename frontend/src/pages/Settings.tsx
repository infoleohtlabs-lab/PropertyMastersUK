import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, User, Bell, Shield, Database, Mail, Globe, Palette, Key, Download, Upload, RefreshCw, Save, AlertTriangle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { showToast } from '../components/ui/Toast';

interface UserSettings {
  profile: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    avatar?: string;
    timezone: string;
    language: string;
    dateFormat: string;
    currency: string;
  };
  notifications: {
    email: {
      enabled: boolean;
      marketing: boolean;
      updates: boolean;
      maintenance: boolean;
      payments: boolean;
      viewings: boolean;
    };
    sms: {
      enabled: boolean;
      urgent: boolean;
      reminders: boolean;
      confirmations: boolean;
    };
    push: {
      enabled: boolean;
      desktop: boolean;
      mobile: boolean;
      browser: boolean;
    };
  };
  privacy: {
    profileVisible: boolean;
    contactVisible: boolean;
    activityVisible: boolean;
    searchable: boolean;
    dataSharing: boolean;
  };
  security: {
    twoFactorEnabled: boolean;
    loginAlerts: boolean;
    sessionTimeout: number;
    passwordExpiry: number;
  };
}

interface SystemSettings {
  general: {
    siteName: string;
    siteDescription: string;
    contactEmail: string;
    supportPhone: string;
    address: string;
    timezone: string;
    language: string;
    currency: string;
    dateFormat: string;
    maintenanceMode: boolean;
  };
  email: {
    provider: string;
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPassword: string;
    fromEmail: string;
    fromName: string;
    encryption: string;
  };
  sms: {
    provider: string;
    apiKey: string;
    apiSecret: string;
    fromNumber: string;
    enabled: boolean;
  };
  payment: {
    stripeEnabled: boolean;
    stripePublicKey: string;
    stripeSecretKey: string;
    paypalEnabled: boolean;
    paypalClientId: string;
    paypalClientSecret: string;
    currency: string;
    testMode: boolean;
  };
  integrations: {
    googleMapsApiKey: string;
    rightmoveEnabled: boolean;
    rightmoveApiKey: string;
    zooplaPremiumEnabled: boolean;
    zooplaApiKey: string;
    analyticsEnabled: boolean;
    analyticsTrackingId: string;
  };
  backup: {
    enabled: boolean;
    frequency: string;
    retention: number;
    location: string;
    lastBackup?: string;
  };
}

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'privacy' | 'security' | 'system' | 'integrations' | 'backup'>('profile');
  const [userSettings, setUserSettings] = useState<UserSettings>({
    profile: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@email.com',
      phone: '+44 7123 456789',
      timezone: 'Europe/London',
      language: 'en',
      dateFormat: 'DD/MM/YYYY',
      currency: 'GBP',
    },
    notifications: {
      email: {
        enabled: true,
        marketing: false,
        updates: true,
        maintenance: true,
        payments: true,
        viewings: true,
      },
      sms: {
        enabled: true,
        urgent: true,
        reminders: true,
        confirmations: false,
      },
      push: {
        enabled: true,
        desktop: true,
        mobile: true,
        browser: false,
      },
    },
    privacy: {
      profileVisible: true,
      contactVisible: false,
      activityVisible: false,
      searchable: true,
      dataSharing: false,
    },
    security: {
      twoFactorEnabled: false,
      loginAlerts: true,
      sessionTimeout: 30,
      passwordExpiry: 90,
    },
  });

  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    general: {
      siteName: 'Property Masters UK',
      siteDescription: 'Professional Property Management Platform',
      contactEmail: 'contact@propertymastersuk.com',
      supportPhone: '+44 20 7123 4567',
      address: '123 Property Street, London, UK',
      timezone: 'Europe/London',
      language: 'en',
      currency: 'GBP',
      dateFormat: 'DD/MM/YYYY',
      maintenanceMode: false,
    },
    email: {
      provider: 'smtp',
      smtpHost: 'smtp.gmail.com',
      smtpPort: 587,
      smtpUser: '',
      smtpPassword: '',
      fromEmail: 'noreply@propertymastersuk.com',
      fromName: 'Property Masters UK',
      encryption: 'tls',
    },
    sms: {
      provider: 'twilio',
      apiKey: '',
      apiSecret: '',
      fromNumber: '',
      enabled: false,
    },
    payment: {
      stripeEnabled: true,
      stripePublicKey: '',
      stripeSecretKey: '',
      paypalEnabled: false,
      paypalClientId: '',
      paypalClientSecret: '',
      currency: 'GBP',
      testMode: true,
    },
    integrations: {
      googleMapsApiKey: '',
      rightmoveEnabled: false,
      rightmoveApiKey: '',
      zooplaPremiumEnabled: false,
      zooplaApiKey: '',
      analyticsEnabled: true,
      analyticsTrackingId: '',
    },
    backup: {
      enabled: true,
      frequency: 'daily',
      retention: 30,
      location: 'cloud',
      lastBackup: '2024-01-16T02:00:00Z',
    },
  });

  const [loading, setLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setToast({ message: 'Settings saved successfully!', type: 'success' });
    } catch (error) {
      setToast({ message: 'Failed to save settings. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setToast({ message: 'New passwords do not match!', type: 'error' });
      return;
    }
    
    if (passwordForm.newPassword.length < 8) {
      setToast({ message: 'Password must be at least 8 characters long!', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setToast({ message: 'Password changed successfully!', type: 'success' });
      setShowPasswordModal(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      setToast({ message: 'Failed to change password. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleBackupNow = async () => {
    setLoading(true);
    try {
      // Simulate backup process
      await new Promise(resolve => setTimeout(resolve, 3000));
      setSystemSettings(prev => ({
        ...prev,
        backup: {
          ...prev.backup,
          lastBackup: new Date().toISOString(),
        },
      }));
      setToast({ message: 'Backup completed successfully!', type: 'success' });
    } catch (error) {
      setToast({ message: 'Backup failed. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async (format: 'json' | 'csv' | 'excel') => {
    setLoading(true);
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));
      setToast({ message: `Data exported successfully as ${format.toUpperCase()}!`, type: 'success' });
      setShowExportModal(false);
    } catch (error) {
      setToast({ message: 'Export failed. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'security', label: 'Security', icon: Key },
    { id: 'system', label: 'System', icon: SettingsIcon },
    { id: 'integrations', label: 'Integrations', icon: Globe },
    { id: 'backup', label: 'Backup', icon: Database },
  ];

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-content">
          <div className="page-header-main">
            <div className="page-title-section">
              <h1 className="page-title">Settings</h1>
              <p className="page-description">Manage your account and system preferences</p>
            </div>
            <div className="page-actions">
              <Button
                variant="outline"
                onClick={() => setShowExportModal(true)}
                className="btn-secondary"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
              <Button
                onClick={handleSaveSettings}
                disabled={loading}
                className={`btn-primary ${loading ? 'btn-loading' : ''}`}
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="page-content">
        <div className="settings-layout">
          {/* Sidebar Navigation */}
          <div className="settings-sidebar">
            <nav className="settings-nav">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`nav-item ${activeTab === tab.id ? 'nav-item-active' : ''}`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className="settings-main">
            {/* Profile Settings */}
            {activeTab === 'profile' && (
              <Card className="form-container">
                <div className="section-header">
                  <h2 className="section-title">Profile Information</h2>
                  <p className="section-description">Update your personal information and preferences</p>
                </div>
                
                <div className="form-section">
                  <div className="profile-header">
                    <div className="avatar-container">
                      <img
                        src={userSettings.profile.avatar || `https://ui-avatars.com/api/?name=${userSettings.profile.firstName}+${userSettings.profile.lastName}&background=random`}
                        alt="Profile"
                        className="avatar-image"
                      />
                      <button className="avatar-upload-btn focus-ring">
                        <Upload className="h-3 w-3" />
                      </button>
                    </div>
                    <div className="profile-info">
                      <h3 className="profile-name">
                        {userSettings.profile.firstName} {userSettings.profile.lastName}
                      </h3>
                      <p className="profile-email">{userSettings.profile.email}</p>
                    </div>
                  </div>

                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label required">
                        First Name
                      </label>
                      <Input
                        type="text"
                        value={userSettings.profile.firstName}
                        onChange={(e) => setUserSettings(prev => ({
                          ...prev,
                          profile: { ...prev.profile, firstName: e.target.value }
                        }))}
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
                        value={userSettings.profile.lastName}
                        onChange={(e) => setUserSettings(prev => ({
                          ...prev,
                          profile: { ...prev.profile, lastName: e.target.value }
                        }))}
                        className="form-input focus-ring"
                        placeholder="Enter your last name"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label required">
                        Email Address
                      </label>
                      <Input
                        type="email"
                        value={userSettings.profile.email}
                        onChange={(e) => setUserSettings(prev => ({
                          ...prev,
                          profile: { ...prev.profile, email: e.target.value }
                        }))}
                        className="form-input focus-ring"
                        placeholder="Enter your email address"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">
                        Phone Number
                      </label>
                      <Input
                        type="tel"
                        value={userSettings.profile.phone}
                        onChange={(e) => setUserSettings(prev => ({
                          ...prev,
                          profile: { ...prev.profile, phone: e.target.value }
                        }))}
                        className="form-input focus-ring"
                        placeholder="Enter your phone number"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">
                        Timezone
                      </label>
                      <select
                        value={userSettings.profile.timezone}
                        onChange={(e) => setUserSettings(prev => ({
                          ...prev,
                          profile: { ...prev.profile, timezone: e.target.value }
                        }))}
                        className="form-select focus-ring"
                      >
                        <option value="Europe/London">London (GMT)</option>
                        <option value="Europe/Paris">Paris (CET)</option>
                        <option value="America/New_York">New York (EST)</option>
                        <option value="America/Los_Angeles">Los Angeles (PST)</option>
                        <option value="Asia/Tokyo">Tokyo (JST)</option>
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">
                        Language
                      </label>
                      <select
                        value={userSettings.profile.language}
                        onChange={(e) => setUserSettings(prev => ({
                          ...prev,
                          profile: { ...prev.profile, language: e.target.value }
                        }))}
                        className="form-select focus-ring"
                      >
                        <option value="en">English</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                        <option value="es">Spanish</option>
                        <option value="it">Italian</option>
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">
                        Date Format
                      </label>
                      <select
                        value={userSettings.profile.dateFormat}
                        onChange={(e) => setUserSettings(prev => ({
                          ...prev,
                          profile: { ...prev.profile, dateFormat: e.target.value }
                        }))}
                        className="form-select focus-ring"
                      >
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">
                        Currency
                      </label>
                      <select
                        value={userSettings.profile.currency}
                        onChange={(e) => setUserSettings(prev => ({
                          ...prev,
                          profile: { ...prev.profile, currency: e.target.value }
                        }))}
                        className="form-select focus-ring"
                      >
                        <option value="GBP">British Pound (£)</option>
                        <option value="EUR">Euro (€)</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-actions">
                    <Button
                      variant="outline"
                      onClick={() => setShowPasswordModal(true)}
                      className="btn-secondary focus-ring"
                    >
                      <Key className="h-4 w-4 mr-2" />
                      Change Password
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Notification Settings */}
            {activeTab === 'notifications' && (
              <Card className="form-container">
                <div className="section-header">
                  <h2 className="section-title">Notification Preferences</h2>
                  <p className="section-description">Manage how you receive notifications and updates</p>
                </div>
                
                <div className="form-section">
                  {/* Email Notifications */}
                  <div className="settings-group">
                    <h3 className="settings-group-title">Email Notifications</h3>
                    <div className="settings-list">
                      <div className="setting-item">
                        <div className="setting-info">
                          <p className="setting-label">Enable Email Notifications</p>
                          <p className="setting-description">Receive notifications via email</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={userSettings.notifications.email.enabled}
                          onChange={(e) => setUserSettings(prev => ({
                            ...prev,
                            notifications: {
                              ...prev.notifications,
                              email: { ...prev.notifications.email, enabled: e.target.checked }
                            }
                          }))}
                          className="form-checkbox focus-ring"
                        />
                      </div>
                      
                      {userSettings.notifications.email.enabled && (
                        <div className="settings-sub-list">
                          {[
                            { key: 'marketing', label: 'Marketing emails', desc: 'Promotional content and updates' },
                            { key: 'updates', label: 'System updates', desc: 'Important system announcements' },
                            { key: 'maintenance', label: 'Maintenance requests', desc: 'New maintenance requests and updates' },
                            { key: 'payments', label: 'Payment notifications', desc: 'Payment confirmations and reminders' },
                            { key: 'viewings', label: 'Viewing notifications', desc: 'Property viewing confirmations and reminders' },
                          ].map((item) => (
                            <div key={item.key} className="setting-item">
                              <div className="setting-info">
                                <p className="setting-label">{item.label}</p>
                                <p className="setting-description">{item.desc}</p>
                              </div>
                              <input
                                type="checkbox"
                                checked={userSettings.notifications.email[item.key as keyof typeof userSettings.notifications.email] as boolean}
                                onChange={(e) => setUserSettings(prev => ({
                                  ...prev,
                                  notifications: {
                                    ...prev.notifications,
                                    email: { 
                                      ...prev.notifications.email, 
                                      [item.key]: e.target.checked 
                                    }
                                  }
                                }))}
                                className="form-checkbox focus-ring"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* SMS Notifications */}
                  <div className="settings-group">
                    <h3 className="settings-group-title">SMS Notifications</h3>
                    <div className="settings-list">
                      <div className="setting-item">
                        <div className="setting-info">
                          <p className="setting-label">Enable SMS Notifications</p>
                          <p className="setting-description">Receive notifications via SMS</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={userSettings.notifications.sms.enabled}
                          onChange={(e) => setUserSettings(prev => ({
                            ...prev,
                            notifications: {
                              ...prev.notifications,
                              sms: { ...prev.notifications.sms, enabled: e.target.checked }
                            }
                          }))}
                          className="form-checkbox focus-ring"
                        />
                      </div>
                      
                      {userSettings.notifications.sms.enabled && (
                        <div className="settings-sub-list">
                          {[
                            { key: 'urgent', label: 'Urgent notifications', desc: 'Emergency and urgent matters' },
                            { key: 'reminders', label: 'Reminders', desc: 'Appointment and payment reminders' },
                            { key: 'confirmations', label: 'Confirmations', desc: 'Booking and payment confirmations' },
                          ].map((item) => (
                            <div key={item.key} className="setting-item">
                              <div className="setting-info">
                                <p className="setting-label">{item.label}</p>
                                <p className="setting-description">{item.desc}</p>
                              </div>
                              <input
                                type="checkbox"
                                checked={userSettings.notifications.sms[item.key as keyof typeof userSettings.notifications.sms] as boolean}
                                onChange={(e) => setUserSettings(prev => ({
                                  ...prev,
                                  notifications: {
                                    ...prev.notifications,
                                    sms: { 
                                      ...prev.notifications.sms, 
                                      [item.key]: e.target.checked 
                                    }
                                  }
                                }))}
                                className="form-checkbox focus-ring"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Push Notifications */}
                  <div className="settings-group">
                    <h3 className="settings-group-title">Push Notifications</h3>
                    <div className="settings-list">
                      <div className="setting-item">
                        <div className="setting-info">
                          <p className="setting-label">Enable Push Notifications</p>
                          <p className="setting-description">Receive push notifications on your devices</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={userSettings.notifications.push.enabled}
                          onChange={(e) => setUserSettings(prev => ({
                            ...prev,
                            notifications: {
                              ...prev.notifications,
                              push: { ...prev.notifications.push, enabled: e.target.checked }
                            }
                          }))}
                          className="form-checkbox focus-ring"
                        />
                      </div>
                      
                      {userSettings.notifications.push.enabled && (
                        <div className="settings-sub-list">
                          {[
                            { key: 'desktop', label: 'Desktop notifications', desc: 'Show notifications on desktop' },
                            { key: 'mobile', label: 'Mobile notifications', desc: 'Show notifications on mobile app' },
                            { key: 'browser', label: 'Browser notifications', desc: 'Show notifications in browser' },
                          ].map((item) => (
                            <div key={item.key} className="setting-item">
                              <div className="setting-info">
                                <p className="setting-label">{item.label}</p>
                                <p className="setting-description">{item.desc}</p>
                              </div>
                              <input
                                type="checkbox"
                                checked={userSettings.notifications.push[item.key as keyof typeof userSettings.notifications.push] as boolean}
                                onChange={(e) => setUserSettings(prev => ({
                                  ...prev,
                                  notifications: {
                                    ...prev.notifications,
                                    push: { 
                                      ...prev.notifications.push, 
                                      [item.key]: e.target.checked 
                                    }
                                  }
                                }))}
                                className="form-checkbox focus-ring"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Privacy Settings */}
            {activeTab === 'privacy' && (
              <Card className="form-container">
                <div className="section-header">
                  <h2 className="section-title">Privacy Settings</h2>
                </div>
                
                <div className="settings-list">
                  {[
                    { 
                      key: 'profileVisible', 
                      label: 'Profile Visibility', 
                      desc: 'Allow others to see your profile information' 
                    },
                    { 
                      key: 'contactVisible', 
                      label: 'Contact Information Visibility', 
                      desc: 'Allow others to see your contact details' 
                    },
                    { 
                      key: 'activityVisible', 
                      label: 'Activity Visibility', 
                      desc: 'Allow others to see your activity status' 
                    },
                    { 
                      key: 'searchable', 
                      label: 'Searchable Profile', 
                      desc: 'Allow your profile to appear in search results' 
                    },
                    { 
                      key: 'dataSharing', 
                      label: 'Data Sharing', 
                      desc: 'Allow sharing of anonymized data for analytics' 
                    },
                  ].map((item) => (
                    <div key={item.key} className="setting-item">
                      <div className="setting-info">
                        <p className="setting-label">{item.label}</p>
                        <p className="setting-description">{item.desc}</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={userSettings.privacy[item.key as keyof typeof userSettings.privacy]}
                        onChange={(e) => setUserSettings(prev => ({
                          ...prev,
                          privacy: { 
                            ...prev.privacy, 
                            [item.key]: e.target.checked 
                          }
                        }))}
                        className="form-checkbox focus-ring"
                      />
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
              <Card className="form-container">
                <div className="section-header">
                  <h2 className="section-title">Security Settings</h2>
                </div>
                
                <div className="settings-list">
                  <div className="setting-item">
                    <div className="setting-info">
                      <p className="setting-label">Two-Factor Authentication</p>
                      <p className="setting-description">Add an extra layer of security to your account</p>
                    </div>
                    <div className="setting-actions">
                      <span className={`setting-status ${
                        userSettings.security.twoFactorEnabled ? 'status-enabled' : 'status-disabled'
                      }`}>
                        {userSettings.security.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                      </span>
                      <Button
                        size="sm"
                        variant={userSettings.security.twoFactorEnabled ? 'outline' : 'primary'}
                        onClick={() => setUserSettings(prev => ({
                          ...prev,
                          security: { 
                            ...prev.security, 
                            twoFactorEnabled: !prev.security.twoFactorEnabled 
                          }
                        }))}
                        className="focus-ring"
                      >
                        {userSettings.security.twoFactorEnabled ? 'Disable' : 'Enable'}
                      </Button>
                    </div>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <p className="setting-label">Login Alerts</p>
                      <p className="setting-description">Get notified when someone logs into your account</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={userSettings.security.loginAlerts}
                      onChange={(e) => setUserSettings(prev => ({
                        ...prev,
                        security: { 
                          ...prev.security, 
                          loginAlerts: e.target.checked 
                        }
                      }))}
                      className="form-checkbox focus-ring"
                    />
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <p className="setting-label">Session Timeout</p>
                      <p className="setting-description">Automatically log out after inactivity</p>
                    </div>
                    <select
                      value={userSettings.security.sessionTimeout}
                      onChange={(e) => setUserSettings(prev => ({
                        ...prev,
                        security: { 
                          ...prev.security, 
                          sessionTimeout: parseInt(e.target.value) 
                        }
                      }))}
                      className="form-select focus-ring"
                    >
                      <option value={15}>15 minutes</option>
                      <option value={30}>30 minutes</option>
                      <option value={60}>1 hour</option>
                      <option value={120}>2 hours</option>
                      <option value={480}>8 hours</option>
                    </select>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <p className="setting-label">Password Expiry</p>
                      <p className="setting-description">Require password change after specified days</p>
                    </div>
                    <select
                      value={userSettings.security.passwordExpiry}
                      onChange={(e) => setUserSettings(prev => ({
                        ...prev,
                        security: { 
                          ...prev.security, 
                          passwordExpiry: parseInt(e.target.value) 
                        }
                      }))}
                      className="form-select focus-ring"
                    >
                      <option value={30}>30 days</option>
                      <option value={60}>60 days</option>
                      <option value={90}>90 days</option>
                      <option value={180}>180 days</option>
                      <option value={365}>1 year</option>
                      <option value={0}>Never</option>
                    </select>
                  </div>
                </div>
              </Card>
            )}

            {/* System Settings */}
            {activeTab === 'system' && (
              <div className="space-y-6">
                {/* General Settings */}
                <Card className="form-container">
                  <div className="section-header">
                    <h2 className="section-title">General System Settings</h2>
                  </div>
                  
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">
                        Site Name
                      </label>
                      <Input
                        type="text"
                        value={systemSettings.general.siteName}
                        onChange={(e) => setSystemSettings(prev => ({
                          ...prev,
                          general: { ...prev.general, siteName: e.target.value }
                        }))}
                        className="form-input focus-ring"
                        placeholder="Enter site name"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">
                        Contact Email
                      </label>
                      <Input
                        type="email"
                        value={systemSettings.general.contactEmail}
                        onChange={(e) => setSystemSettings(prev => ({
                          ...prev,
                          general: { ...prev.general, contactEmail: e.target.value }
                        }))}
                        className="form-input focus-ring"
                        placeholder="Enter contact email"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">
                        Support Phone
                      </label>
                      <Input
                        type="tel"
                        value={systemSettings.general.supportPhone}
                        onChange={(e) => setSystemSettings(prev => ({
                          ...prev,
                          general: { ...prev.general, supportPhone: e.target.value }
                        }))}
                        className="form-input focus-ring"
                        placeholder="Enter support phone"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">
                        Default Currency
                      </label>
                      <select
                        value={systemSettings.general.currency}
                        onChange={(e) => setSystemSettings(prev => ({
                          ...prev,
                          general: { ...prev.general, currency: e.target.value }
                        }))}
                        className="form-select focus-ring"
                      >
                        <option value="GBP">British Pound (£)</option>
                        <option value="EUR">Euro (€)</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Site Description
                    </label>
                    <textarea
                      rows={3}
                      value={systemSettings.general.siteDescription}
                      onChange={(e) => setSystemSettings(prev => ({
                        ...prev,
                        general: { ...prev.general, siteDescription: e.target.value }
                      }))}
                      className="form-textarea focus-ring"
                      placeholder="Enter site description"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Address
                    </label>
                    <textarea
                      rows={2}
                      value={systemSettings.general.address}
                      onChange={(e) => setSystemSettings(prev => ({
                        ...prev,
                        general: { ...prev.general, address: e.target.value }
                      }))}
                      className="form-textarea focus-ring"
                      placeholder="Enter address"
                    />
                  </div>

                  <div className="setting-item border-t">
                    <div className="setting-info">
                      <p className="setting-label">Maintenance Mode</p>
                      <p className="setting-description">Temporarily disable public access to the site</p>
                    </div>
                    <div className="setting-actions">
                      <span className={`setting-status ${
                        systemSettings.general.maintenanceMode ? 'status-error' : 'status-success'
                      }`}>
                        {systemSettings.general.maintenanceMode ? 'Enabled' : 'Disabled'}
                      </span>
                      <input
                        type="checkbox"
                        checked={systemSettings.general.maintenanceMode}
                        onChange={(e) => setSystemSettings(prev => ({
                          ...prev,
                          general: { ...prev.general, maintenanceMode: e.target.checked }
                        }))}
                        className="form-checkbox focus-ring"
                      />
                    </div>
                  </div>
                </Card>

                {/* Email Settings */}
                <Card className="form-container">
                  <div className="section-header">
                    <h2 className="section-title">Email Configuration</h2>
                  </div>
                  
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">
                        SMTP Host
                      </label>
                      <Input
                        type="text"
                        value={systemSettings.email.smtpHost}
                        onChange={(e) => setSystemSettings(prev => ({
                          ...prev,
                          email: { ...prev.email, smtpHost: e.target.value }
                        }))}
                        placeholder="smtp.gmail.com"
                        className="form-input focus-ring"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">
                        SMTP Port
                      </label>
                      <Input
                        type="number"
                        value={systemSettings.email.smtpPort}
                        onChange={(e) => setSystemSettings(prev => ({
                          ...prev,
                          email: { ...prev.email, smtpPort: parseInt(e.target.value) }
                        }))}
                        placeholder="587"
                        className="form-input focus-ring"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">
                        SMTP Username
                      </label>
                      <Input
                        type="text"
                        value={systemSettings.email.smtpUser}
                        onChange={(e) => setSystemSettings(prev => ({
                          ...prev,
                          email: { ...prev.email, smtpUser: e.target.value }
                        }))}
                        placeholder="your-email@gmail.com"
                        className="form-input focus-ring"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">
                        SMTP Password
                      </label>
                      <Input
                        type="password"
                        value={systemSettings.email.smtpPassword}
                        onChange={(e) => setSystemSettings(prev => ({
                          ...prev,
                          email: { ...prev.email, smtpPassword: e.target.value }
                        }))}
                        placeholder="••••••••"
                        className="form-input focus-ring"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">
                        From Email
                      </label>
                      <Input
                        type="email"
                        value={systemSettings.email.fromEmail}
                        onChange={(e) => setSystemSettings(prev => ({
                          ...prev,
                          email: { ...prev.email, fromEmail: e.target.value }
                        }))}
                        placeholder="noreply@propertymastersuk.com"
                        className="form-input focus-ring"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">
                        From Name
                      </label>
                      <Input
                        type="text"
                        value={systemSettings.email.fromName}
                        onChange={(e) => setSystemSettings(prev => ({
                          ...prev,
                          email: { ...prev.email, fromName: e.target.value }
                        }))}
                        placeholder="Property Masters UK"
                        className="form-input focus-ring"
                      />
                    </div>
                  </div>
                </Card>

                {/* Payment Settings */}
                <Card className="form-container">
                  <div className="section-header">
                    <h2 className="section-title">Payment Configuration</h2>
                  </div>
                  
                  <div className="settings-list">
                    {/* Stripe Settings */}
                    <div className="settings-group">
                      <div className="setting-item">
                        <div className="setting-info">
                          <h3 className="settings-group-title">Stripe</h3>
                        </div>
                        <div className="setting-actions">
                          <input
                            type="checkbox"
                            checked={systemSettings.payment.stripeEnabled}
                            onChange={(e) => setSystemSettings(prev => ({
                              ...prev,
                              payment: { ...prev.payment, stripeEnabled: e.target.checked }
                            }))}
                            className="form-checkbox focus-ring"
                          />
                        </div>
                      </div>
                      
                      {systemSettings.payment.stripeEnabled && (
                        <div className="form-grid mt-4">
                          <div className="form-group">
                            <label className="form-label">
                              Public Key
                            </label>
                            <Input
                              type="text"
                              value={systemSettings.payment.stripePublicKey}
                              onChange={(e) => setSystemSettings(prev => ({
                                ...prev,
                                payment: { ...prev.payment, stripePublicKey: e.target.value }
                              }))}
                              placeholder="pk_test_..."
                              className="form-input focus-ring"
                            />
                          </div>
                          
                          <div className="form-group">
                            <label className="form-label">
                              Secret Key
                            </label>
                            <Input
                              type="password"
                              value={systemSettings.payment.stripeSecretKey}
                              onChange={(e) => setSystemSettings(prev => ({
                                ...prev,
                                payment: { ...prev.payment, stripeSecretKey: e.target.value }
                              }))}
                              placeholder="sk_test_..."
                              className="form-input focus-ring"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* PayPal Settings */}
                    <div className="settings-group">
                      <div className="setting-item">
                        <div className="setting-info">
                          <h3 className="settings-group-title">PayPal</h3>
                        </div>
                        <div className="setting-actions">
                          <input
                            type="checkbox"
                            checked={systemSettings.payment.paypalEnabled}
                            onChange={(e) => setSystemSettings(prev => ({
                              ...prev,
                              payment: { ...prev.payment, paypalEnabled: e.target.checked }
                            }))}
                            className="form-checkbox focus-ring"
                          />
                        </div>
                      </div>
                      
                      {systemSettings.payment.paypalEnabled && (
                        <div className="form-grid mt-4">
                          <div className="form-group">
                            <label className="form-label">
                              Client ID
                            </label>
                            <Input
                              type="text"
                              value={systemSettings.payment.paypalClientId}
                              onChange={(e) => setSystemSettings(prev => ({
                                ...prev,
                                payment: { ...prev.payment, paypalClientId: e.target.value }
                              }))}
                              placeholder="PayPal Client ID"
                              className="form-input focus-ring"
                            />
                          </div>
                          
                          <div className="form-group">
                            <label className="form-label">
                              Client Secret
                            </label>
                            <Input
                              type="password"
                              value={systemSettings.payment.paypalClientSecret}
                              onChange={(e) => setSystemSettings(prev => ({
                                ...prev,
                                payment: { ...prev.payment, paypalClientSecret: e.target.value }
                              }))}
                              placeholder="PayPal Client Secret"
                              className="form-input focus-ring"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="setting-item border-t">
                      <div className="setting-info">
                        <p className="setting-label">Test Mode</p>
                        <p className="setting-description">Use sandbox/test environment for payments</p>
                      </div>
                      <div className="setting-actions">
                        <input
                          type="checkbox"
                          checked={systemSettings.payment.testMode}
                          onChange={(e) => setSystemSettings(prev => ({
                            ...prev,
                            payment: { ...prev.payment, testMode: e.target.checked }
                          }))}
                          className="form-checkbox focus-ring"
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Integrations Settings */}
            {activeTab === 'integrations' && (
              <div className="form-container">
                <div className="section-header">
                  <h2 className="section-title">Third-Party Integrations</h2>
                </div>
                
                <div className="settings-list">
                  <div className="form-group">
                    <label className="form-label">
                      Google Maps API Key
                    </label>
                    <Input
                      type="text"
                      value={systemSettings.integrations.googleMapsApiKey}
                      onChange={(e) => setSystemSettings(prev => ({
                        ...prev,
                        integrations: { ...prev.integrations, googleMapsApiKey: e.target.value }
                      }))}
                      placeholder="Enter Google Maps API key"
                      className="form-input focus-ring"
                    />
                    <p className="setting-description">Required for map functionality and location services</p>
                  </div>

                  <div className="flex items-center justify-between py-4 border-t border-gray-200">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Rightmove Integration</p>
                      <p className="text-sm text-gray-500">Sync properties with Rightmove</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={systemSettings.integrations.rightmoveEnabled}
                      onChange={(e) => setSystemSettings(prev => ({
                        ...prev,
                        integrations: { ...prev.integrations, rightmoveEnabled: e.target.checked }
                      }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>

                  {systemSettings.integrations.rightmoveEnabled && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rightmove API Key
                      </label>
                      <Input
                        type="text"
                        value={systemSettings.integrations.rightmoveApiKey}
                        onChange={(e) => setSystemSettings(prev => ({
                          ...prev,
                          integrations: { ...prev.integrations, rightmoveApiKey: e.target.value }
                        }))}
                        placeholder="Enter Rightmove API key"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between py-4 border-t border-gray-200">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Zoopla Premium</p>
                      <p className="text-sm text-gray-500">Enhanced property data and analytics</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={systemSettings.integrations.zooplaPremiumEnabled}
                      onChange={(e) => setSystemSettings(prev => ({
                        ...prev,
                        integrations: { ...prev.integrations, zooplaPremiumEnabled: e.target.checked }
                      }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>

                  {systemSettings.integrations.zooplaPremiumEnabled && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Zoopla API Key
                      </label>
                      <Input
                        type="text"
                        value={systemSettings.integrations.zooplaApiKey}
                        onChange={(e) => setSystemSettings(prev => ({
                          ...prev,
                          integrations: { ...prev.integrations, zooplaApiKey: e.target.value }
                        }))}
                        placeholder="Enter Zoopla API key"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between py-4 border-t border-gray-200">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Google Analytics</p>
                      <p className="text-sm text-gray-500">Track website usage and performance</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={systemSettings.integrations.analyticsEnabled}
                      onChange={(e) => setSystemSettings(prev => ({
                        ...prev,
                        integrations: { ...prev.integrations, analyticsEnabled: e.target.checked }
                      }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>

                  {systemSettings.integrations.analyticsEnabled && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Google Analytics Tracking ID
                      </label>
                      <Input
                        type="text"
                        value={systemSettings.integrations.analyticsTrackingId}
                        onChange={(e) => setSystemSettings(prev => ({
                          ...prev,
                          integrations: { ...prev.integrations, analyticsTrackingId: e.target.value }
                        }))}
                        placeholder="GA-XXXXXXXXX-X"
                      />
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Backup Settings */}
            {activeTab === 'backup' && (
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Backup &amp; Data Management</h2>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between py-4 border-b border-gray-200">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Automatic Backups</p>
                      <p className="text-sm text-gray-500">Enable scheduled automatic backups</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={systemSettings.backup.enabled}
                      onChange={(e) => setSystemSettings(prev => ({
                        ...prev,
                        backup: { ...prev.backup, enabled: e.target.checked }
                      }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>

                  {systemSettings.backup.enabled && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Backup Frequency
                          </label>
                          <select
                            value={systemSettings.backup.frequency}
                            onChange={(e) => setSystemSettings(prev => ({
                              ...prev,
                              backup: { ...prev.backup, frequency: e.target.value }
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="hourly">Hourly</option>
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Retention Period (days)
                          </label>
                          <Input
                            type="number"
                            value={systemSettings.backup.retention}
                            onChange={(e) => setSystemSettings(prev => ({
                              ...prev,
                              backup: { ...prev.backup, retention: parseInt(e.target.value) }
                            }))}
                            placeholder="30"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Storage Location
                          </label>
                          <select
                            value={systemSettings.backup.location}
                            onChange={(e) => setSystemSettings(prev => ({
                              ...prev,
                              backup: { ...prev.backup, location: e.target.value }
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="local">Local Storage</option>
                            <option value="cloud">Cloud Storage</option>
                            <option value="both">Both Local and Cloud</option>
                          </select>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="text-sm font-medium text-gray-700">Last Backup</p>
                            <p className="text-sm text-gray-500">
                              {systemSettings.backup.lastBackup 
                                ? new Date(systemSettings.backup.lastBackup).toLocaleString()
                                : 'Never'
                              }
                            </p>
                          </div>
                          <Button
                            onClick={handleBackupNow}
                            disabled={loading}
                            size="sm"
                          >
                            {loading ? (
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <Database className="h-4 w-4 mr-2" />
                            )}
                            Backup Now
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title="Change Password"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Password
            </label>
            <div className="relative">
              <Input
                type={showPasswords.current ? 'text' : 'password'}
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                placeholder="Enter current password"
              />
              <button
                type="button"
                onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <div className="relative">
              <Input
                type={showPasswords.new ? 'text' : 'password'}
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <Input
                type={showPasswords.confirm ? 'text' : 'password'}
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="Confirm new password"
              />
              <button
                type="button"
                onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowPasswordModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePasswordChange}
              disabled={loading || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
              className="flex-1"
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Key className="h-4 w-4 mr-2" />
              )}
              Change Password
            </Button>
          </div>
        </div>
      </Modal>

      {/* Export Data Modal */}
      <Modal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        title="Export Data"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Choose the format for exporting your data. This will include all your account information, settings, and associated data.
          </p>
          
          <div className="space-y-3">
            <Button
              variant="outline"
              onClick={() => handleExportData('json')}
              disabled={loading}
              className="w-full justify-start"
            >
              <Download className="h-4 w-4 mr-2" />
              Export as JSON
            </Button>
            
            <Button
              variant="outline"
              onClick={() => handleExportData('csv')}
              disabled={loading}
              className="w-full justify-start"
            >
              <Download className="h-4 w-4 mr-2" />
              Export as CSV
            </Button>
            
            <Button
              variant="outline"
              onClick={() => handleExportData('excel')}
              disabled={loading}
              className="w-full justify-start"
            >
              <Download className="h-4 w-4 mr-2" />
              Export as Excel
            </Button>
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowExportModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>


    </div>
  );
};

export default Settings;