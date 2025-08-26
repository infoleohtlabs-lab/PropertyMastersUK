import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { showToast } from '../utils/toast';
import {
  User,
  FileText,
  CreditCard,
  Building,
  Phone,
  Mail,
  Calendar,
  CheckCircle,
  AlertCircle,
  Clock,
  Download,
  Upload,
  Search
} from 'lucide-react';

interface TenantApplication {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  currentAddress: string;
  employmentStatus: string;
  employer: string;
  annualIncome: number;
  applicationDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'under_review';
  creditScore?: number;
  references: Reference[];
}

interface Reference {
  id: string;
  type: 'employer' | 'previous_landlord' | 'personal';
  name: string;
  email: string;
  phone: string;
  relationship: string;
  status: 'pending' | 'completed' | 'failed';
}

const TenantReferencing: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'applications' | 'new-application' | 'reports'>('applications');
  const [applications, setApplications] = useState<TenantApplication[]>([
    {
      id: '1',
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith@email.com',
      phone: '+44 7700 900123',
      dateOfBirth: '1990-05-15',
      currentAddress: '123 High Street, London, SW1A 1AA',
      employmentStatus: 'Full-time',
      employer: 'Tech Solutions Ltd',
      annualIncome: 45000,
      applicationDate: '2024-01-15',
      status: 'under_review',
      creditScore: 720,
      references: [
        {
          id: '1',
          type: 'employer',
          name: 'Sarah Johnson',
          email: 'sarah.j@techsolutions.com',
          phone: '+44 20 7946 0958',
          relationship: 'Line Manager',
          status: 'completed'
        },
        {
          id: '2',
          type: 'previous_landlord',
          name: 'David Wilson',
          email: 'david@propertymanagement.co.uk',
          phone: '+44 20 7946 0959',
          relationship: 'Previous Landlord',
          status: 'pending'
        }
      ]
    },
    {
      id: '2',
      firstName: 'Emma',
      lastName: 'Davis',
      email: 'emma.davis@email.com',
      phone: '+44 7700 900124',
      dateOfBirth: '1988-08-22',
      currentAddress: '456 Queen Street, Manchester, M1 1AA',
      employmentStatus: 'Self-employed',
      employer: 'Freelance Designer',
      annualIncome: 38000,
      applicationDate: '2024-01-10',
      status: 'approved',
      creditScore: 680,
      references: [
        {
          id: '3',
          type: 'personal',
          name: 'Michael Brown',
          email: 'michael.brown@email.com',
          phone: '+44 7700 900125',
          relationship: 'Friend',
          status: 'completed'
        }
      ]
    }
  ]);

  const [newApplication, setNewApplication] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    currentAddress: '',
    employmentStatus: '',
    employer: '',
    annualIncome: 0
  });

  const handleInputChange = (field: string, value: string | number) => {
    setNewApplication(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmitApplication = () => {
    if (!newApplication.firstName || !newApplication.lastName || !newApplication.email) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    const application: TenantApplication = {
      id: Date.now().toString(),
      ...newApplication,
      applicationDate: new Date().toISOString().split('T')[0],
      status: 'pending',
      references: []
    };

    setApplications(prev => [...prev, application]);
    setNewApplication({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      currentAddress: '',
      employmentStatus: '',
      employer: '',
      annualIncome: 0
    });
    showToast('Application submitted successfully', 'success');
    setActiveTab('applications');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      case 'under_review': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <AlertCircle className="w-4 h-4" />;
      case 'under_review': return <Clock className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Tenant Referencing</h1>
        <p className="text-gray-600">Comprehensive tenant screening and reference checking system</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'applications', label: 'Applications', icon: FileText },
            { id: 'new-application', label: 'New Application', icon: User },
            { id: 'reports', label: 'Reports', icon: CreditCard }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Applications Tab */}
      {activeTab === 'applications' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Tenant Applications</h2>
            <div className="flex space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search applications..."
                  className="pl-10 w-64"
                />
              </div>
              <Button onClick={() => setActiveTab('new-application')}>
                <User className="w-4 h-4 mr-2" />
                New Application
              </Button>
            </div>
          </div>

          <div className="grid gap-6">
            {applications.map((application) => (
              <Card key={application.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        {application.firstName} {application.lastName}
                      </CardTitle>
                      <p className="text-gray-600 mt-1">{application.email}</p>
                    </div>
                    <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${
                      getStatusColor(application.status)
                    }`}>
                      {getStatusIcon(application.status)}
                      <span className="capitalize">{application.status.replace('_', ' ')}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{application.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Building className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{application.employer}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CreditCard className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">£{application.annualIncome.toLocaleString()}/year</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{application.applicationDate}</span>
                    </div>
                  </div>

                  {application.creditScore && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Credit Score</span>
                        <span className={`text-sm font-bold ${
                          application.creditScore >= 700 ? 'text-green-600' :
                          application.creditScore >= 600 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {application.creditScore}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            application.creditScore >= 700 ? 'bg-green-500' :
                            application.creditScore >= 600 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${(application.creditScore / 850) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  <div className="mb-4">
                    <h4 className="text-sm font-medium mb-2">References ({application.references.length})</h4>
                    <div className="space-y-2">
                      {application.references.map((ref) => (
                        <div key={ref.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div>
                            <span className="text-sm font-medium">{ref.name}</span>
                            <span className="text-xs text-gray-500 ml-2">({ref.type.replace('_', ' ')})</span>
                          </div>
                          <div className={`flex items-center space-x-1 px-2 py-1 rounded text-xs ${
                            getStatusColor(ref.status)
                          }`}>
                            {getStatusIcon(ref.status)}
                            <span>{ref.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <Button variant="outline" size="sm">
                      <FileText className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Download Report
                    </Button>
                    {application.status === 'under_review' && (
                      <>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600 border-red-600 hover:bg-red-50">
                          <AlertCircle className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* New Application Tab */}
      {activeTab === 'new-application' && (
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>New Tenant Application</CardTitle>
              <p className="text-gray-600">Submit a new tenant application for referencing</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                  <Input
                    value={newApplication.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    placeholder="Enter first name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                  <Input
                    value={newApplication.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    placeholder="Enter last name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <Input
                    type="email"
                    value={newApplication.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter email address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <Input
                    value={newApplication.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                  <Input
                    type="date"
                    value={newApplication.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Employment Status</label>
                  <select
                    value={newApplication.employmentStatus}
                    onChange={(e) => handleInputChange('employmentStatus', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select employment status</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Self-employed">Self-employed</option>
                    <option value="Contract">Contract</option>
                    <option value="Unemployed">Unemployed</option>
                    <option value="Student">Student</option>
                    <option value="Retired">Retired</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Employer</label>
                  <Input
                    value={newApplication.employer}
                    onChange={(e) => handleInputChange('employer', e.target.value)}
                    placeholder="Enter employer name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Annual Income (£)</label>
                  <Input
                    type="number"
                    value={newApplication.annualIncome || ''}
                    onChange={(e) => handleInputChange('annualIncome', parseInt(e.target.value) || 0)}
                    placeholder="Enter annual income"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Address</label>
                  <Input
                    value={newApplication.currentAddress}
                    onChange={(e) => handleInputChange('currentAddress', e.target.value)}
                    placeholder="Enter current address"
                  />
                </div>
              </div>

              <div className="mt-8 flex space-x-4">
                <Button onClick={handleSubmitApplication} className="bg-blue-600 hover:bg-blue-700">
                  <Upload className="w-4 h-4 mr-2" />
                  Submit Application
                </Button>
                <Button variant="outline" onClick={() => setActiveTab('applications')}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Reference Reports</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Credit Check Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Comprehensive credit history and score analysis</p>
                <Button className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Generate Report
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Employment Verification</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Employment status and income verification</p>
                <Button className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Generate Report
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Reference Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Complete reference check summary</p>
                <Button className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Generate Report
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default TenantReferencing;