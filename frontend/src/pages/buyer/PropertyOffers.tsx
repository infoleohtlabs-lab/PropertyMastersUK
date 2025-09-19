import React, { useState, useEffect } from 'react';
import { FileText, Clock, CheckCircle, XCircle, AlertTriangle, TrendingUp, TrendingDown, Plus, Eye, Edit } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

interface PropertyOffer {
  id: string;
  property: {
    id: string;
    title: string;
    address: string;
    askingPrice: number;
    images: string[];
    propertyType: string;
    agent: {
      name: string;
      company: string;
      phone: string;
    };
  };
  offerAmount: number;
  status: 'pending' | 'accepted' | 'rejected' | 'countered' | 'withdrawn';
  submittedDate: string;
  responseDate?: string;
  counterOffer?: {
    amount: number;
    date: string;
    message?: string;
  };
  conditions: string[];
  notes?: string;
  expiryDate?: string;
  solicitor?: {
    name: string;
    firm: string;
    phone: string;
    email: string;
  };
  mortgage?: {
    approved: boolean;
    amount: number;
    lender: string;
    rate: number;
  };
}

const PropertyOffers: React.FC = () => {
  const { user } = useAuthStore();
  const [offers, setOffers] = useState<PropertyOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'all'>('active');
  const [showOfferModal, setShowOfferModal] = useState<string | null>(null);
  const [newOffer, setNewOffer] = useState({
    amount: '',
    conditions: [] as string[],
    notes: '',
    expiryDays: '7'
  });

  useEffect(() => {
    loadOffers();
  }, []);

  const loadOffers = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API call
      const mockData: PropertyOffer[] = [
        {
          id: '1',
          property: {
            id: 'prop1',
            title: 'Modern 2-Bed Apartment in City Centre',
            address: '123 High Street, Birmingham, B1 1AA',
            askingPrice: 250000,
            images: ['https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20apartment%20living%20room%20city%20centre&image_size=landscape_4_3'],
            propertyType: 'Apartment',
            agent: {
              name: 'Sarah Johnson',
              company: 'PropertyMasters UK',
              phone: '+44 121 123 4567'
            }
          },
          offerAmount: 240000,
          status: 'countered',
          submittedDate: '2024-01-20',
          responseDate: '2024-01-22',
          counterOffer: {
            amount: 245000,
            date: '2024-01-22',
            message: 'We can accept £245,000 for a quick completion'
          },
          conditions: ['Subject to survey', 'Subject to mortgage approval'],
          notes: 'Keen to complete within 8 weeks',
          expiryDate: '2024-01-27',
          solicitor: {
            name: 'James Mitchell',
            firm: 'Mitchell & Associates',
            phone: '+44 121 987 6543',
            email: 'james@mitchell-law.co.uk'
          },
          mortgage: {
            approved: true,
            amount: 200000,
            lender: 'Halifax',
            rate: 4.5
          }
        },
        {
          id: '2',
          property: {
            id: 'prop2',
            title: 'Victorian Terrace House',
            address: '45 Oak Avenue, Manchester, M1 2BB',
            askingPrice: 320000,
            images: ['https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=victorian%20terrace%20house%20exterior%20brick&image_size=landscape_4_3'],
            propertyType: 'House',
            agent: {
              name: 'Michael Brown',
              company: 'Heritage Homes',
              phone: '+44 161 234 5678'
            }
          },
          offerAmount: 310000,
          status: 'pending',
          submittedDate: '2024-01-23',
          conditions: ['Subject to survey', 'Subject to mortgage approval', 'Subject to chain'],
          notes: 'First time buyer, no chain',
          expiryDate: '2024-01-30'
        },
        {
          id: '3',
          property: {
            id: 'prop3',
            title: 'Luxury Penthouse',
            address: '100 Skyline Tower, London, E14 5AB',
            askingPrice: 850000,
            images: ['https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=luxury%20penthouse%20london%20skyline&image_size=landscape_4_3'],
            propertyType: 'Penthouse',
            agent: {
              name: 'Emma Wilson',
              company: 'London Properties Ltd',
              phone: '+44 207 123 4567'
            }
          },
          offerAmount: 800000,
          status: 'rejected',
          submittedDate: '2024-01-15',
          responseDate: '2024-01-17',
          conditions: ['Subject to survey'],
          notes: 'Cash buyer'
        }
      ];
      setOffers(mockData);
    } catch (error) {
      console.error('Error loading offers:', error);
    } finally {
      setLoading(false);
    }
  };

  const withdrawOffer = async (offerId: string) => {
    try {
      setOffers(prev => prev.map(o => 
        o.id === offerId ? { ...o, status: 'withdrawn' } : o
      ));
      // API call to withdraw offer
    } catch (error) {
      console.error('Error withdrawing offer:', error);
    }
  };

  const respondToCounter = async (offerId: string, accept: boolean, newAmount?: number) => {
    try {
      if (accept) {
        setOffers(prev => prev.map(o => 
          o.id === offerId ? { ...o, status: 'accepted', offerAmount: o.counterOffer?.amount || o.offerAmount } : o
        ));
      } else if (newAmount) {
        setOffers(prev => prev.map(o => 
          o.id === offerId ? { ...o, offerAmount: newAmount, status: 'pending' } : o
        ));
      }
      // API call to respond to counter offer
    } catch (error) {
      console.error('Error responding to counter offer:', error);
    }
  };

  const getFilteredOffers = () => {
    switch (activeTab) {
      case 'active':
        return offers.filter(o => ['pending', 'countered'].includes(o.status));
      case 'completed':
        return offers.filter(o => ['accepted', 'rejected', 'withdrawn'].includes(o.status));
      case 'all':
      default:
        return offers;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'accepted':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'countered':
        return <AlertTriangle className="h-4 w-4 text-blue-600" />;
      case 'withdrawn':
        return <XCircle className="h-4 w-4 text-gray-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'countered':
        return 'bg-blue-100 text-blue-800';
      case 'withdrawn':
        return 'bg-gray-100 text-gray-800';
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

  const calculateOfferPercentage = (offer: number, asking: number) => {
    return ((offer / asking) * 100).toFixed(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your offers...</p>
        </div>
      </div>
    );
  }

  const filteredOffers = getFilteredOffers();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Property Offers</h1>
              <p className="mt-2 text-gray-600">
                Track and manage your property offers
              </p>
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Make New Offer
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Offers</p>
                <p className="text-2xl font-bold text-gray-900">{offers.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {offers.filter(o => o.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Accepted</p>
                <p className="text-2xl font-bold text-gray-900">
                  {offers.filter(o => o.status === 'accepted').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Countered</p>
                <p className="text-2xl font-bold text-gray-900">
                  {offers.filter(o => o.status === 'countered').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { key: 'active', label: 'Active Offers', count: offers.filter(o => ['pending', 'countered'].includes(o.status)).length },
                { key: 'completed', label: 'Completed', count: offers.filter(o => ['accepted', 'rejected', 'withdrawn'].includes(o.status)).length },
                { key: 'all', label: 'All Offers', count: offers.length }
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

        {/* Offers List */}
        {filteredOffers.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No offers found</h3>
            <p className="text-gray-600">Make your first property offer to get started!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOffers.map((offer) => (
              <div key={offer.id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start space-x-4">
                    {/* Property Image */}
                    <div className="flex-shrink-0">
                      <img
                        src={offer.property.images[0]}
                        alt={offer.property.title}
                        className="w-32 h-24 rounded-lg object-cover"
                      />
                    </div>

                    {/* Offer Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {offer.property.title}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">{offer.property.address}</p>
                          <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-500">
                              Asking: {formatPrice(offer.property.askingPrice)}
                            </span>
                            <span className="text-sm text-gray-500">
                              Agent: {offer.property.agent.name}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(offer.status)}
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(offer.status)}`}>
                            {offer.status.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      {/* Offer Amount */}
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Your Offer</p>
                            <p className="text-xl font-bold text-blue-600">{formatPrice(offer.offerAmount)}</p>
                            <p className="text-xs text-gray-500">
                              {calculateOfferPercentage(offer.offerAmount, offer.property.askingPrice)}% of asking
                            </p>
                          </div>
                          {offer.counterOffer && (
                            <div>
                              <p className="text-sm text-gray-600">Counter Offer</p>
                              <p className="text-xl font-bold text-orange-600">{formatPrice(offer.counterOffer.amount)}</p>
                              <p className="text-xs text-gray-500">
                                {calculateOfferPercentage(offer.counterOffer.amount, offer.property.askingPrice)}% of asking
                              </p>
                            </div>
                          )}
                          <div>
                            <p className="text-sm text-gray-600">Difference</p>
                            <div className="flex items-center">
                              {offer.offerAmount < offer.property.askingPrice ? (
                                <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                              ) : (
                                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                              )}
                              <span className={`font-medium ${
                                offer.offerAmount < offer.property.askingPrice ? 'text-red-600' : 'text-green-600'
                              }`}>
                                {formatPrice(Math.abs(offer.offerAmount - offer.property.askingPrice))}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Counter Offer Message */}
                      {offer.counterOffer?.message && (
                        <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
                          <p className="text-sm text-blue-800">
                            <strong>Counter Offer Message:</strong> {offer.counterOffer.message}
                          </p>
                        </div>
                      )}

                      {/* Conditions */}
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Conditions:</p>
                        <div className="flex flex-wrap gap-2">
                          {offer.conditions.map((condition, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
                              {condition}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Mortgage Info */}
                      {offer.mortgage && (
                        <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-4">
                          <p className="text-sm text-green-800">
                            <strong>Mortgage:</strong> {offer.mortgage.approved ? 'Approved' : 'Pending'} - 
                            {formatPrice(offer.mortgage.amount)} at {offer.mortgage.rate}% with {offer.mortgage.lender}
                          </p>
                        </div>
                      )}

                      {/* Timeline */}
                      <div className="text-xs text-gray-500 mb-4">
                        <span>Submitted: {new Date(offer.submittedDate).toLocaleDateString()}</span>
                        {offer.responseDate && (
                          <span className="ml-4">Response: {new Date(offer.responseDate).toLocaleDateString()}</span>
                        )}
                        {offer.expiryDate && (
                          <span className="ml-4">Expires: {new Date(offer.expiryDate).toLocaleDateString()}</span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-3">
                        {offer.status === 'pending' && (
                          <>
                            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center">
                              <Edit className="h-4 w-4 mr-1" />
                              Edit Offer
                            </button>
                            <button 
                              onClick={() => withdrawOffer(offer.id)}
                              className="text-red-600 hover:text-red-800 text-sm font-medium"
                            >
                              Withdraw
                            </button>
                          </>
                        )}
                        {offer.status === 'countered' && (
                          <>
                            <button 
                              onClick={() => respondToCounter(offer.id, true)}
                              className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                            >
                              Accept Counter
                            </button>
                            <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                              Make New Offer
                            </button>
                            <button 
                              onClick={() => withdrawOffer(offer.id)}
                              className="text-red-600 hover:text-red-800 text-sm font-medium"
                            >
                              Decline
                            </button>
                          </>
                        )}
                        <button className="text-gray-600 hover:text-gray-800 text-sm font-medium flex items-center">
                          <Eye className="h-4 w-4 mr-1" />
                          View Property
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyOffers;