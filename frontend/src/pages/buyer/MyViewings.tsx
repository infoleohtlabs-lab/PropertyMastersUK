import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Phone, Mail, User, CheckCircle, XCircle, AlertCircle, Plus } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

interface PropertyViewing {
  id: string;
  property: {
    id: string;
    title: string;
    address: string;
    price: number;
    images: string[];
    propertyType: string;
  };
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  agent: {
    name: string;
    company: string;
    phone: string;
    email: string;
    avatar?: string;
  };
  notes?: string;
  feedback?: {
    rating: number;
    comments: string;
    interested: boolean;
  };
  createdAt: string;
}

const MyViewings: React.FC = () => {
  const { user } = useAuthStore();
  const [viewings, setViewings] = useState<PropertyViewing[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'all'>('upcoming');
  const [showFeedbackModal, setShowFeedbackModal] = useState<string | null>(null);
  const [feedback, setFeedback] = useState({ rating: 5, comments: '', interested: false });

  useEffect(() => {
    loadViewings();
  }, []);

  const loadViewings = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API call
      const mockData: PropertyViewing[] = [
        {
          id: '1',
          property: {
            id: 'prop1',
            title: 'Modern 2-Bed Apartment in City Centre',
            address: '123 High Street, Birmingham, B1 1AA',
            price: 250000,
            images: ['https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20apartment%20living%20room%20city%20centre&image_size=landscape_4_3'],
            propertyType: 'Apartment'
          },
          date: '2024-01-25',
          time: '14:00',
          status: 'scheduled',
          agent: {
            name: 'Sarah Johnson',
            company: 'PropertyMasters UK',
            phone: '+44 121 123 4567',
            email: 'sarah.johnson@propertymasters.co.uk'
          },
          notes: 'Please bring ID and proof of income',
          createdAt: '2024-01-20'
        },
        {
          id: '2',
          property: {
            id: 'prop2',
            title: 'Victorian Terrace House',
            address: '45 Oak Avenue, Manchester, M1 2BB',
            price: 320000,
            images: ['https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=victorian%20terrace%20house%20exterior%20brick&image_size=landscape_4_3'],
            propertyType: 'House'
          },
          date: '2024-01-18',
          time: '11:00',
          status: 'completed',
          agent: {
            name: 'Michael Brown',
            company: 'Heritage Homes',
            phone: '+44 161 234 5678',
            email: 'michael.brown@heritagehomes.co.uk'
          },
          feedback: {
            rating: 4,
            comments: 'Beautiful property but needs some modernization',
            interested: true
          },
          createdAt: '2024-01-15'
        },
        {
          id: '3',
          property: {
            id: 'prop3',
            title: 'Contemporary Studio Flat',
            address: '78 Park Lane, London, W1K 7TN',
            price: 180000,
            images: ['https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=contemporary%20studio%20flat%20london&image_size=landscape_4_3'],
            propertyType: 'Studio'
          },
          date: '2024-01-30',
          time: '16:30',
          status: 'scheduled',
          agent: {
            name: 'Emma Wilson',
            company: 'London Properties Ltd',
            phone: '+44 207 123 4567',
            email: 'emma.wilson@londonproperties.co.uk'
          },
          createdAt: '2024-01-22'
        }
      ];
      setViewings(mockData);
    } catch (error) {
      console.error('Error loading viewings:', error);
    } finally {
      setLoading(false);
    }
  };

  const cancelViewing = async (viewingId: string) => {
    try {
      setViewings(prev => prev.map(v => 
        v.id === viewingId ? { ...v, status: 'cancelled' } : v
      ));
      // API call to cancel viewing
    } catch (error) {
      console.error('Error cancelling viewing:', error);
    }
  };

  const submitFeedback = async (viewingId: string) => {
    try {
      setViewings(prev => prev.map(v => 
        v.id === viewingId ? { ...v, feedback } : v
      ));
      setShowFeedbackModal(null);
      setFeedback({ rating: 5, comments: '', interested: false });
      // API call to submit feedback
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  const getFilteredViewings = () => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    switch (activeTab) {
      case 'upcoming':
        return viewings.filter(v => 
          v.status === 'scheduled' && 
          (v.date > today || (v.date === today && v.time > now.toTimeString().slice(0, 5)))
        );
      case 'past':
        return viewings.filter(v => 
          v.status === 'completed' || v.status === 'cancelled' ||
          (v.date < today || (v.date === today && v.time <= now.toTimeString().slice(0, 5)))
        );
      case 'all':
      default:
        return viewings;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'rescheduled':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'rescheduled':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your viewings...</p>
        </div>
      </div>
    );
  }

  const filteredViewings = getFilteredViewings();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Viewings</h1>
              <p className="mt-2 text-gray-600">
                Manage your property viewing appointments
              </p>
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Schedule Viewing
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { key: 'upcoming', label: 'Upcoming', count: viewings.filter(v => v.status === 'scheduled').length },
                { key: 'past', label: 'Past', count: viewings.filter(v => v.status === 'completed' || v.status === 'cancelled').length },
                { key: 'all', label: 'All', count: viewings.length }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Viewings List */}
        {filteredViewings.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No viewings found</h3>
            <p className="text-gray-600">Schedule your first property viewing to get started!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredViewings.map((viewing) => (
              <div key={viewing.id} className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-start space-x-4">
                  {/* Property Image */}
                  <div className="flex-shrink-0">
                    <img
                      src={viewing.property.images[0]}
                      alt={viewing.property.title}
                      className="w-24 h-24 rounded-lg object-cover"
                    />
                  </div>

                  {/* Viewing Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {viewing.property.title}
                        </h3>
                        <div className="flex items-center text-gray-600 mb-2">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span className="text-sm">{viewing.property.address}</span>
                        </div>
                        <div className="text-xl font-bold text-blue-600 mb-3">
                          {formatPrice(viewing.property.price)}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(viewing.status)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(viewing.status)}`}>
                          {viewing.status.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* Viewing Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="flex items-center text-sm text-gray-600 mb-2">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>{new Date(viewing.date).toLocaleDateString()} at {viewing.time}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <User className="h-4 w-4 mr-2" />
                          <span>{viewing.agent.name} - {viewing.agent.company}</span>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center text-sm text-gray-600 mb-2">
                          <Phone className="h-4 w-4 mr-2" />
                          <span>{viewing.agent.phone}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="h-4 w-4 mr-2" />
                          <span>{viewing.agent.email}</span>
                        </div>
                      </div>
                    </div>

                    {/* Notes */}
                    {viewing.notes && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
                        <p className="text-sm text-yellow-800">
                          <strong>Note:</strong> {viewing.notes}
                        </p>
                      </div>
                    )}

                    {/* Feedback */}
                    {viewing.feedback && (
                      <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-green-800">Your Feedback</span>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className={`text-sm ${
                                i < viewing.feedback!.rating ? 'text-yellow-400' : 'text-gray-300'
                              }`}>
                                ★
                              </span>
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-green-700">{viewing.feedback.comments}</p>
                        <p className="text-xs text-green-600 mt-1">
                          Interested: {viewing.feedback.interested ? 'Yes' : 'No'}
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center space-x-3">
                      {viewing.status === 'scheduled' && (
                        <>
                          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                            Reschedule
                          </button>
                          <button 
                            onClick={() => cancelViewing(viewing.id)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      {viewing.status === 'completed' && !viewing.feedback && (
                        <button 
                          onClick={() => setShowFeedbackModal(viewing.id)}
                          className="text-green-600 hover:text-green-800 text-sm font-medium"
                        >
                          Leave Feedback
                        </button>
                      )}
                      <button className="text-gray-600 hover:text-gray-800 text-sm font-medium">
                        View Property Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Feedback Modal */}
        {showFeedbackModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Leave Feedback</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setFeedback(prev => ({ ...prev, rating: star }))}
                      className={`text-2xl ${
                        star <= feedback.rating ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Comments</label>
                <textarea
                  value={feedback.comments}
                  onChange={(e) => setFeedback(prev => ({ ...prev, comments: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Share your thoughts about this property..."
                />
              </div>

              <div className="mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={feedback.interested}
                    onChange={(e) => setFeedback(prev => ({ ...prev, interested: e.target.checked }))}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">I'm interested in this property</span>
                </label>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowFeedbackModal(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => submitFeedback(showFeedbackModal)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Submit Feedback
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyViewings;