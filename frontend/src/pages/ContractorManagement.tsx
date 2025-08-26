import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { showToast } from '../utils/toast';
import {
  Users,
  UserPlus,
  Star,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Wrench,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Award,
  Banknote,
  FileText
} from 'lucide-react';

interface Contractor {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialties: string[];
  rating: number;
  reviewCount: number;
  location: string;
  hourlyRate: number;
  availability: 'available' | 'busy' | 'unavailable';
  joinDate: string;
  completedJobs: number;
  certifications: string[];
  insurance: {
    liability: boolean;
    publicLiability: boolean;
    expiryDate: string;
  };
  profileImage?: string;
}

interface Job {
  id: string;
  contractorId: string;
  propertyAddress: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  scheduledDate: string;
  estimatedHours: number;
  actualHours?: number;
  cost: number;
  createdDate: string;
}

const ContractorManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'contractors' | 'jobs' | 'add-contractor' | 'analytics'>('contractors');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpecialty, setFilterSpecialty] = useState('');
  
  const [contractors, setContractors] = useState<Contractor[]>([
    {
      id: '1',
      name: 'John Smith',
      email: 'john.smith@contractors.co.uk',
      phone: '+44 7700 900123',
      specialties: ['Plumbing', 'Heating'],
      rating: 4.8,
      reviewCount: 127,
      location: 'London, SW1',
      hourlyRate: 45,
      availability: 'available',
      joinDate: '2023-01-15',
      completedJobs: 89,
      certifications: ['Gas Safe', 'City & Guilds Level 3'],
      insurance: {
        liability: true,
        publicLiability: true,
        expiryDate: '2024-12-31'
      }
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@electrical.co.uk',
      phone: '+44 7700 900124',
      specialties: ['Electrical', 'Security Systems'],
      rating: 4.9,
      reviewCount: 203,
      location: 'Manchester, M1',
      hourlyRate: 50,
      availability: 'busy',
      joinDate: '2022-08-20',
      completedJobs: 156,
      certifications: ['NICEIC Approved', '18th Edition'],
      insurance: {
        liability: true,
        publicLiability: true,
        expiryDate: '2024-11-30'
      }
    },
    {
      id: '3',
      name: 'Mike Wilson',
      email: 'mike.wilson@carpentry.co.uk',
      phone: '+44 7700 900125',
      specialties: ['Carpentry', 'Flooring', 'Kitchen Fitting'],
      rating: 4.6,
      reviewCount: 78,
      location: 'Birmingham, B1',
      hourlyRate: 40,
      availability: 'available',
      joinDate: '2023-03-10',
      completedJobs: 45,
      certifications: ['NVQ Level 3 Carpentry'],
      insurance: {
        liability: true,
        publicLiability: false,
        expiryDate: '2024-09-15'
      }
    }
  ]);

  const [jobs, setJobs] = useState<Job[]>([
    {
      id: '1',
      contractorId: '1',
      propertyAddress: '123 High Street, London SW1A 1AA',
      description: 'Fix leaking kitchen tap and replace bathroom radiator',
      status: 'in_progress',
      priority: 'medium',
      scheduledDate: '2024-01-20',
      estimatedHours: 4,
      cost: 180,
      createdDate: '2024-01-15'
    },
    {
      id: '2',
      contractorId: '2',
      propertyAddress: '456 Queen Street, Manchester M1 1AA',
      description: 'Install new electrical sockets in living room',
      status: 'completed',
      priority: 'low',
      scheduledDate: '2024-01-18',
      estimatedHours: 3,
      actualHours: 2.5,
      cost: 125,
      createdDate: '2024-01-12'
    },
    {
      id: '3',
      contractorId: '3',
      propertyAddress: '789 King Street, Birmingham B1 1AA',
      description: 'Replace damaged floorboards in bedroom',
      status: 'pending',
      priority: 'high',
      scheduledDate: '2024-01-25',
      estimatedHours: 6,
      cost: 240,
      createdDate: '2024-01-18'
    }
  ]);

  const [newContractor, setNewContractor] = useState({
    name: '',
    email: '',
    phone: '',
    specialties: [],
    location: '',
    hourlyRate: 0
  });

  const specialtyOptions = [
    'Plumbing', 'Electrical', 'Carpentry', 'Painting', 'Heating',
    'Roofing', 'Flooring', 'Kitchen Fitting', 'Bathroom Fitting',
    'Security Systems', 'Gardening', 'Cleaning'
  ];

  const filteredContractors = contractors.filter(contractor => {
    const matchesSearch = contractor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contractor.specialties.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSpecialty = !filterSpecialty || contractor.specialties.includes(filterSpecialty);
    return matchesSearch && matchesSpecialty;
  });

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available': return 'text-green-600 bg-green-100';
      case 'busy': return 'text-yellow-600 bg-yellow-100';
      case 'unavailable': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'in_progress': return 'text-blue-600 bg-blue-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleAddContractor = () => {
    if (!newContractor.name || !newContractor.email || !newContractor.phone) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    const contractor: Contractor = {
      id: Date.now().toString(),
      ...newContractor,
      specialties: newContractor.specialties,
      rating: 0,
      reviewCount: 0,
      availability: 'available',
      joinDate: new Date().toISOString().split('T')[0],
      completedJobs: 0,
      certifications: [],
      insurance: {
        liability: false,
        publicLiability: false,
        expiryDate: ''
      }
    };

    setContractors(prev => [...prev, contractor]);
    setNewContractor({
      name: '',
      email: '',
      phone: '',
      specialties: [],
      location: '',
      hourlyRate: 0
    });
    showToast('Contractor added successfully', 'success');
    setActiveTab('contractors');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Contractor Management</h1>
        <p className="text-gray-600">Manage your network of trusted contractors and maintenance professionals</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'contractors', label: 'Contractors', icon: Users },
            { id: 'jobs', label: 'Jobs', icon: Wrench },
            { id: 'add-contractor', label: 'Add Contractor', icon: UserPlus },
            { id: 'analytics', label: 'Analytics', icon: Award }
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

      {/* Contractors Tab */}
      {activeTab === 'contractors' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-900">Contractors ({contractors.length})</h2>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search contractors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              <select
                value={filterSpecialty}
                onChange={(e) => setFilterSpecialty(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Specialties</option>
                {specialtyOptions.map(specialty => (
                  <option key={specialty} value={specialty}>{specialty}</option>
                ))}
              </select>
              <Button onClick={() => setActiveTab('add-contractor')}>
                <UserPlus className="w-4 h-4 mr-2" />
                Add Contractor
              </Button>
            </div>
          </div>

          <div className="grid gap-6">
            {filteredContractors.map((contractor) => (
              <Card key={contractor.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-start space-x-4">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="w-8 h-8 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{contractor.name}</CardTitle>
                        <div className="flex items-center space-x-2 mt-1">
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-sm font-medium ml-1">{contractor.rating}</span>
                            <span className="text-sm text-gray-500 ml-1">({contractor.reviewCount} reviews)</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {contractor.specialties.map((specialty) => (
                            <span
                              key={specialty}
                              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                            >
                              {specialty}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${
                      getAvailabilityColor(contractor.availability)
                    }`}>
                      <span className="capitalize">{contractor.availability}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{contractor.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{contractor.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{contractor.location}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Banknote className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">£{contractor.hourlyRate}/hour</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <div className="text-2xl font-bold text-blue-600">{contractor.completedJobs}</div>
                      <div className="text-sm text-gray-600">Completed Jobs</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <div className="text-2xl font-bold text-green-600">{contractor.certifications.length}</div>
                      <div className="text-sm text-gray-600">Certifications</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <div className={`text-2xl font-bold ${
                        contractor.insurance.liability && contractor.insurance.publicLiability
                          ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {contractor.insurance.liability && contractor.insurance.publicLiability ? '✓' : '✗'}
                      </div>
                      <div className="text-sm text-gray-600">Fully Insured</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      View Profile
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm">
                      <Wrench className="w-4 h-4 mr-2" />
                      Assign Job
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 border-red-600 hover:bg-red-50">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Jobs Tab */}
      {activeTab === 'jobs' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Active Jobs ({jobs.length})</h2>
            <Button>
              <Wrench className="w-4 h-4 mr-2" />
              Create Job
            </Button>
          </div>

          <div className="grid gap-6">
            {jobs.map((job) => {
              const contractor = contractors.find(c => c.id === job.contractorId);
              return (
                <Card key={job.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">Job #{job.id}</CardTitle>
                        <p className="text-gray-600 mt-1">{job.propertyAddress}</p>
                      </div>
                      <div className="flex space-x-2">
                        <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${
                          getPriorityColor(job.priority)
                        }`}>
                          <span className="capitalize">{job.priority}</span>
                        </div>
                        <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${
                          getStatusColor(job.status)
                        }`}>
                          <span className="capitalize">{job.status.replace('_', ' ')}</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-4">{job.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{contractor?.name || 'Unassigned'}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{job.scheduledDate}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{job.estimatedHours}h estimated</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Banknote className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">£{job.cost}</span>
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Job
                      </Button>
                      {job.status === 'pending' && (
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Start Job
                        </Button>
                      )}
                      {job.status === 'in_progress' && (
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Complete Job
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Contractor Tab */}
      {activeTab === 'add-contractor' && (
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Add New Contractor</CardTitle>
              <p className="text-gray-600">Register a new contractor to your network</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                  <Input
                    value={newContractor.name}
                    onChange={(e) => setNewContractor(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter contractor name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <Input
                    type="email"
                    value={newContractor.email}
                    onChange={(e) => setNewContractor(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter email address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                  <Input
                    value={newContractor.phone}
                    onChange={(e) => setNewContractor(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <Input
                    value={newContractor.location}
                    onChange={(e) => setNewContractor(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Enter location/area"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hourly Rate (£)</label>
                  <Input
                    type="number"
                    value={newContractor.hourlyRate || ''}
                    onChange={(e) => setNewContractor(prev => ({ ...prev, hourlyRate: parseInt(e.target.value) || 0 }))}
                    placeholder="Enter hourly rate"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Specialties</label>
                  <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                    {specialtyOptions.map(specialty => (
                      <label key={specialty} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={newContractor.specialties.includes(specialty)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewContractor(prev => ({
                                ...prev,
                                specialties: [...prev.specialties, specialty]
                              }));
                            } else {
                              setNewContractor(prev => ({
                                ...prev,
                                specialties: prev.specialties.filter(s => s !== specialty)
                              }));
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm">{specialty}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8 flex space-x-4">
                <Button onClick={handleAddContractor} className="bg-blue-600 hover:bg-blue-700">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Contractor
                </Button>
                <Button variant="outline" onClick={() => setActiveTab('contractors')}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Contractor Analytics</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Contractors</p>
                    <p className="text-2xl font-bold text-gray-900">{contractors.length}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Available Now</p>
                    <p className="text-2xl font-bold text-green-600">
                      {contractors.filter(c => c.availability === 'available').length}
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Jobs</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {jobs.filter(j => j.status === 'in_progress').length}
                    </p>
                  </div>
                  <Wrench className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {(contractors.reduce((sum, c) => sum + c.rating, 0) / contractors.length).toFixed(1)}
                    </p>
                  </div>
                  <Star className="w-8 h-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Contractors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {contractors
                    .sort((a, b) => b.rating - a.rating)
                    .slice(0, 5)
                    .map((contractor) => (
                      <div key={contractor.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium">{contractor.name}</p>
                          <p className="text-sm text-gray-600">{contractor.specialties.join(', ')}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="font-medium">{contractor.rating}</span>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Specialty Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {specialtyOptions.map(specialty => {
                    const count = contractors.filter(c => c.specialties.includes(specialty)).length;
                    const percentage = contractors.length > 0 ? (count / contractors.length) * 100 : 0;
                    return (
                      <div key={specialty}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{specialty}</span>
                          <span>{count} contractors</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractorManagement;