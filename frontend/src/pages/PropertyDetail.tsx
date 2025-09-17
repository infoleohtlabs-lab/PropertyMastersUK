import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Heart,
  Share2,
  MapPin,
  Bed,
  Bath,
  Square,
  Calendar,
  Phone,
  MessageSquare,
  User,
  Check,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Play,
  Glasses,
  Mail,
  TrendingUp,
  Calculator,
  BarChart3,
  Building,
  Zap,
  PoundSterling,
  Train,
  GraduationCap,
  ShoppingCart,
  Clock,
  Star,
  Scale,
  History,
  Copy,
  FileText,
  Users
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import VrViewer from '../components/VrViewer';
import VideoPlayer from '../components/VideoPlayer';
import BookingManagement from '../components/BookingManagement';
import MarketAnalysis from '../components/MarketAnalysis';
import { showToast } from '../utils/toast';
import { formatCurrency } from '../utils';
import { useAuthStore } from '../stores/authStore';
import { usePropertyStore } from '../stores/propertyStore';
import { Property, PropertyType, PropertyStatus, PriceType } from '../types';
import { PropertyOwnership } from '../components/land-registry/PropertyOwnership';
import { PriceHistoryChart } from '../components/land-registry/PriceHistoryChart';
import landRegistryService from '../services/land-registry.service';
import { PropertyOwnershipData, PricePaidData } from '../types/land-registry';

const PropertyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { getProperty, selectedProperty, isLoading } = usePropertyStore();
  
  const [property, setProperty] = useState<Property | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showVrModal, setShowVrModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showMarketAnalysis, setShowMarketAnalysis] = useState(false);
  const [showMortgageCalculator, setShowMortgageCalculator] = useState(false);
  const [showPropertyComparison, setShowPropertyComparison] = useState(false);
  const [showPropertyHistory, setShowPropertyHistory] = useState(false);
  const [showShareDropdown, setShowShareDropdown] = useState(false);
  const [landRegistryData, setLandRegistryData] = useState<PropertyOwnershipData | null>(null);
  const [priceHistoryData, setPriceHistoryData] = useState<PricePaidData[]>([]);
  const [landRegistryLoading, setLandRegistryLoading] = useState(false);
  const [landRegistryError, setLandRegistryError] = useState<string | null>(null);
  
  // landRegistryService is imported as singleton

  // Mock property data with UK-specific features
  const mockProperty: Property = {
    id: id || '1',
    title: 'Beautiful 3-Bedroom Victorian House in Central London',
    description: 'A stunning Victorian terrace house located in the heart of London. This property features original period details combined with modern amenities, making it perfect for families or professionals.',
    price: { amount: 750000 },
    type: PropertyType.HOUSE,
    status: PropertyStatus.AVAILABLE,
    priceType: PriceType.SALE,
    bedrooms: 3,
    bathrooms: 2,
    area: 1200,
    address: {
      street: '123 Victoria Street',
      city: 'London',
      county: 'Greater London',
      postcode: 'SW1A 1AA',
      country: 'United Kingdom'
    },
    location: '123 Victoria Street, Westminster, London SW1A 1AA',
    images: [
      {
        id: '1',
        url: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=600&fit=crop',
        alt: 'Living Room',
        isPrimary: true,
        order: 1
      },
      {
        id: '2',
        url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop',
        alt: 'Kitchen',
        isPrimary: false,
        order: 2
      },
      {
        id: '3',
        url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop',
        alt: 'Bedroom',
        isPrimary: false,
        order: 3
      },
      {
        id: '4',
        url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop',
        alt: 'Bathroom',
        isPrimary: false,
        order: 4
      },
      {
        id: '5',
        url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop',
        alt: 'Garden',
        isPrimary: false,
        order: 5
      }
    ],
    agentId: '1',
    agent: {
      id: '1',
      userId: 'user-1',
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@primeproperties.co.uk',
      phone: '+44 20 7123 4567',
      companyName: 'Prime Properties London',
      licenseNumber: 'ARLA12345',
      address: {
        street: '123 Business Street',
        city: 'London',
        county: 'Greater London',
        postcode: 'SW1A 1AA',
        country: 'United Kingdom'
      },
      specializations: ['Victorian Properties', 'Residential Sales'],
      rating: 4.8,
      reviewCount: 127,
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z'
    },
    features: [
      'Private Garden',
      'Off-Street Parking',
      'Gas Central Heating',
      'Double Glazing',
      'Fitted Kitchen',
      'Period Features',
      'High Ceilings',
      'Original Fireplaces'
    ],
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-20T14:30:00Z'
  };

  useEffect(() => {
    if (id) {
      getProperty(id);
    }
  }, [id, getProperty]);

  useEffect(() => {
    if (selectedProperty) {
      setProperty(selectedProperty);
    } else {
      // Fallback to mock data if no property from store
      setProperty(mockProperty);
    }
  }, [selectedProperty]);

  // Fetch Land Registry data when property is loaded
  useEffect(() => {
    const fetchLandRegistryData = async () => {
      if (!property?.address?.postcode) return;
      
      setLandRegistryLoading(true);
      setLandRegistryError(null);
      
      try {
        // Fetch ownership data
        const ownershipData = await landRegistryService.getOwnershipLookup({
          postcode: property.address.postcode,
          propertyNumber: property.address.street.split(' ')[0]
        });
        setLandRegistryData(ownershipData);
        
        // Fetch price history
        const priceHistory = await landRegistryService.getPricePaidData({
          postcode: property.address.postcode,
          fromDate: new Date(Date.now() - 10 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Last 10 years
          toDate: new Date().toISOString().split('T')[0]
        });
        setPriceHistoryData(priceHistory.data || []);
      } catch (error) {
        console.error('Failed to fetch Land Registry data:', error);
        setLandRegistryError('Failed to load Land Registry data');
      } finally {
        setLandRegistryLoading(false);
      }
    };
    
    if (property) {
      fetchLandRegistryData();
    }
  }, [property]);

  // Close share dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showShareDropdown) {
        const target = event.target as Element;
        if (!target.closest('.share-dropdown-container')) {
          setShowShareDropdown(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showShareDropdown]);

  const handlePrevImage = () => {
    if (property?.images) {
      setCurrentImageIndex(prev => 
        prev === 0 ? property.images.length - 1 : prev - 1
      );
    }
  };

  const handleNextImage = () => {
    if (property?.images) {
      setCurrentImageIndex(prev => 
        prev === property.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const handleFavorite = () => {
    if (!isAuthenticated) {
      showToast.error('Please login to save properties');
      return;
    }
    setIsFavorited(!isFavorited);
    showToast.success(isFavorited ? 'Removed from favorites' : 'Added to favorites');
  };

  const handleShare = () => {
    setShowShareDropdown(!showShareDropdown);
  };

  const shareToSocial = (platform: string) => {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(property?.title || '');
    const description = encodeURIComponent(property?.description || '');
    
    let shareUrl = '';
    
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${title}%20${url}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(window.location.href);
        showToast.success('Property link copied to clipboard');
        setShowShareDropdown(false);
        return;
      default:
        return;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
      setShowShareDropdown(false);
    }
  };

  const handleBookViewing = () => {
    if (!isAuthenticated) {
      showToast.error('Please login to book a viewing');
      navigate('/auth/login');
      return;
    }
    setShowBookingModal(true);
  };

  const handleContact = () => {
    setShowContactModal(true);
  };

  if (isLoading || !property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading property details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Image Gallery */}
      <div className="relative h-96 md:h-[500px] bg-gray-900">
        {property.images && property.images.length > 0 && (
          <>
            <img
              src={property.images[currentImageIndex].url}
              alt={property.images[currentImageIndex].alt}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/20" />
            
            {/* Navigation Arrows */}
            {property.images.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 transition-colors"
                >
                  <ChevronLeft className="h-6 w-6 text-gray-800" />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 transition-colors"
                >
                  <ChevronRight className="h-6 w-6 text-gray-800" />
                </button>
              </>
            )}
            
            {/* Image Counter */}
            <div className="absolute bottom-4 left-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
              {currentImageIndex + 1} / {property.images.length}
            </div>
            
            {/* Action Buttons */}
            <div className="absolute top-4 right-4 flex space-x-2">
              <button
                onClick={() => setShowVrModal(true)}
                className="bg-white/90 hover:bg-white rounded-full p-3 transition-colors"
                title="Virtual Tour"
              >
                <Glasses className="h-5 w-5 text-gray-800" />
              </button>
              <button
                onClick={() => setShowVideoModal(true)}
                className="bg-white/90 hover:bg-white rounded-full p-3 transition-colors"
                title="Video Tour"
              >
                <Play className="h-5 w-5 text-gray-800" />
              </button>
              <button
                onClick={handleFavorite}
                className="bg-white/90 hover:bg-white rounded-full p-3 transition-colors"
                title="Add to Favorites"
              >
                <Heart className={`h-5 w-5 ${isFavorited ? 'text-red-500 fill-current' : 'text-gray-800'}`} />
              </button>
              <div className="relative share-dropdown-container">
                <button
                  onClick={handleShare}
                  className="bg-white/90 hover:bg-white rounded-full p-3 transition-colors"
                  title="Share Property"
                >
                  <Share2 className="h-5 w-5 text-gray-800" />
                </button>
                
                {/* Share Dropdown */}
                {showShareDropdown && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <button
                      onClick={() => shareToSocial('facebook')}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-3"
                    >
                      <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center">
                        <span className="text-white text-xs font-bold">f</span>
                      </div>
                      <span>Facebook</span>
                    </button>
                    <button
                      onClick={() => shareToSocial('twitter')}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-3"
                    >
                      <div className="w-5 h-5 bg-blue-400 rounded flex items-center justify-center">
                        <span className="text-white text-xs font-bold">𝕏</span>
                      </div>
                      <span>Twitter</span>
                    </button>
                    <button
                      onClick={() => shareToSocial('linkedin')}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-3"
                    >
                      <div className="w-5 h-5 bg-blue-700 rounded flex items-center justify-center">
                        <span className="text-white text-xs font-bold">in</span>
                      </div>
                      <span>LinkedIn</span>
                    </button>
                    <button
                      onClick={() => shareToSocial('whatsapp')}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-3"
                    >
                      <div className="w-5 h-5 bg-green-500 rounded flex items-center justify-center">
                        <span className="text-white text-xs font-bold">W</span>
                      </div>
                      <span>WhatsApp</span>
                    </button>
                    <button
                      onClick={() => shareToSocial('copy')}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-3"
                    >
                      <Copy className="w-5 h-5 text-gray-600" />
                      <span>Copy Link</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Property Header */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {property.title}
                    </h1>
                    <p className="text-gray-600 flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {property.location}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-blue-600">
                      {formatCurrency(property.price.amount)}
                      {property.price.period && (
                        <span className="text-lg text-gray-600">/{property.price.period}</span>
                      )}
                    </div>
                    <div className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                      property.status === 'available' ? 'bg-green-100 text-green-800' :
                      property.status === 'under_offer' ? 'bg-orange-100 text-orange-800' :
                      property.status === 'sold' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {property.status.replace('_', ' ').toUpperCase()}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{property.bedrooms}</div>
                    <div className="text-sm text-gray-600">Bedrooms</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{property.bathrooms}</div>
                    <div className="text-sm text-gray-600">Bathrooms</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{property.area}</div>
                    <div className="text-sm text-gray-600">sq ft</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{property.type}</div>
                    <div className="text-sm text-gray-600">Type</div>
                  </div>
                </div>

                <p className="text-gray-700 leading-relaxed">
                  {property.description}
                </p>
                
                <div className="flex flex-wrap items-center gap-3 mt-6">
                  <Button
                    onClick={() => setShowMarketAnalysis(true)}
                    variant="outline"
                    className="flex items-center space-x-2"
                  >
                    <TrendingUp className="h-4 w-4" />
                    <span>Market Analysis</span>
                  </Button>
                  <Button
                    onClick={() => setShowMortgageCalculator(true)}
                    variant="outline"
                    className="flex items-center space-x-2"
                  >
                    <Calculator className="h-4 w-4" />
                    <span>Mortgage Calculator</span>
                  </Button>
                  <Button
                    onClick={() => setShowPropertyComparison(true)}
                    variant="outline"
                    className="flex items-center space-x-2"
                  >
                    <Scale className="h-4 w-4" />
                    <span>Compare Properties</span>
                  </Button>
                  <Button
                    onClick={() => setShowPropertyHistory(true)}
                    variant="outline"
                    className="flex items-center space-x-2"
                  >
                    <History className="h-4 w-4" />
                    <span>Property History</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Features */}
            {property.features && property.features.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Features & Amenities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {property.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* UK-Specific Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Energy Performance Certificate */}
              {property.energyRating && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Zap className="h-5 w-5 text-green-600" />
                      <span>Energy Performance</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Current Rating</span>
                        <div className="flex items-center space-x-2">
                          <div className={`w-8 h-8 rounded flex items-center justify-center text-white font-bold ${
                            property.energyRating.current === 'A' ? 'bg-green-600' :
                            property.energyRating.current === 'B' ? 'bg-green-500' :
                            property.energyRating.current === 'C' ? 'bg-yellow-500' :
                            property.energyRating.current === 'D' ? 'bg-orange-500' :
                            property.energyRating.current === 'E' ? 'bg-red-500' :
                            property.energyRating.current === 'F' ? 'bg-red-600' : 'bg-red-700'
                          }`}>
                            {property.energyRating.current}
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Potential Rating</span>
                        <div className="flex items-center space-x-2">
                          <div className={`w-8 h-8 rounded flex items-center justify-center text-white font-bold ${
                            property.energyRating.potential === 'A' ? 'bg-green-600' :
                            property.energyRating.potential === 'B' ? 'bg-green-500' :
                            property.energyRating.potential === 'C' ? 'bg-yellow-500' :
                            property.energyRating.potential === 'D' ? 'bg-orange-500' :
                            property.energyRating.potential === 'E' ? 'bg-red-500' :
                            property.energyRating.potential === 'F' ? 'bg-red-600' : 'bg-red-700'
                          }`}>
                            {property.energyRating.potential}
                          </div>
                        </div>
                      </div>
                      {property.energyRating.epcUrl && (
                        <Button variant="outline" size="sm" className="w-full mt-2">
                          View EPC Certificate
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Council Tax */}
              {property.council && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Building className="h-5 w-5 text-blue-600" />
                      <span>Council Tax</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Council</span>
                        <span className="font-medium">{property.council.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tax Band</span>
                        <span className="font-bold text-lg">{property.council.taxBand}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Annual Amount</span>
                        <span className="font-medium">{formatCurrency(property.council.taxAmount)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Land Registry Information */}
            <div className="grid grid-cols-1 gap-6">
              {/* Property Ownership */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-purple-600" />
                    <span>Property Ownership</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {landRegistryLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                      <span className="ml-2 text-gray-600">Loading ownership data...</span>
                    </div>
                  ) : landRegistryError ? (
                    <div className="text-center py-8">
                      <p className="text-red-600 mb-2">{landRegistryError}</p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          if (property) {
                            const fetchData = async () => {
                              setLandRegistryLoading(true);
                              setLandRegistryError(null);
                              try {
                                const ownershipData = await landRegistryService.getOwnershipLookup({
                                  postcode: property.address.postcode,
                                  propertyNumber: property.address.street.split(' ')[0]
                                });
                                setLandRegistryData(ownershipData);
                              } catch (error) {
                                setLandRegistryError('Failed to load Land Registry data');
                              } finally {
                                setLandRegistryLoading(false);
                              }
                            };
                            fetchData();
                          }
                        }}
                      >
                        Retry
                      </Button>
                    </div>
                  ) : landRegistryData ? (
                    <PropertyOwnership 
                      data={landRegistryData}
                      loading={false}
                      error={null}
                    />
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p>No ownership data available</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Price History Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <PoundSterling className="h-5 w-5 text-green-600" />
                    <span>Price History</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {landRegistryLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                      <span className="ml-2 text-gray-600">Loading price history...</span>
                    </div>
                  ) : priceHistoryData.length > 0 ? (
                    <PriceHistoryChart 
                      data={priceHistoryData}
                      loading={false}
                      error={null}
                    />
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <BarChart3 className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p>No price history data available</p>
                      <p className="text-sm text-gray-400 mt-1">Price data may not be available for all properties</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Location & Transport */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  <span>Location & Transport</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                  <MapPin className="h-8 w-8 text-gray-400" />
                  <span className="ml-2 text-gray-600">Interactive Map View</span>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <p className="font-medium text-gray-900 mb-2">Address</p>
                    <p className="text-gray-600">{property.address.displayAddress}</p>
                  </div>

                  {/* Transport Information */}
                  {property.transport && (
                    <div>
                      <p className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
                        <Train className="h-4 w-4 text-blue-600" />
                        <span>Transport Links</span>
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Nearest Station</span>
                            <span className="font-medium">{property.transport.nearestStation}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Distance</span>
                            <span className="font-medium">{property.transport.stationDistance} miles</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Walk Score</span>
                            <span className="font-medium">{property.transport.walkScore}/100</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Transit Score</span>
                            <span className="font-medium">{property.transport.transitScore}/100</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {property.transport.transportLinks.map((link, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            {link}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Schools */}
                  {property.schools && property.schools.length > 0 && (
                    <div>
                      <p className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
                        <GraduationCap className="h-4 w-4 text-green-600" />
                        <span>Nearby Schools</span>
                      </p>
                      <div className="space-y-3">
                        {property.schools.map((school, index) => (
                          <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900">{school.name}</p>
                              <p className="text-sm text-gray-600 capitalize">{school.type} • {school.distance} miles</p>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center space-x-1">
                                <Star className="h-4 w-4 text-yellow-500" />
                                <span className="text-sm font-medium">{school.rating}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Local Amenities */}
                  {property.amenities && property.amenities.length > 0 && (
                    <div>
                      <p className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
                        <ShoppingCart className="h-4 w-4 text-purple-600" />
                        <span>Local Amenities</span>
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {property.amenities.map((amenity, index) => (
                          <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <div>
                              <p className="font-medium text-sm">{amenity.name}</p>
                              <p className="text-xs text-gray-600">{amenity.type} • {amenity.distance} miles</p>
                            </div>
                            {amenity.rating && (
                              <div className="flex items-center space-x-1">
                                <Star className="h-3 w-3 text-yellow-500" />
                                <span className="text-xs">{amenity.rating}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Agent */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Agent</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {property.agent?.firstName} {property.agent?.lastName}
                    </p>
                    <p className="text-sm text-gray-600">{property.agent?.companyName}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <Button onClick={handleContact} className="w-full">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Phone className="h-4 w-4 mr-2" />
                    {property.agent?.phone || 'Contact for phone'}
                  </Button>
                  <Button onClick={handleBookViewing} variant="outline" className="w-full">
                    <Calendar className="h-4 w-4 mr-2" />
                    Book Viewing
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Property Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Property Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Property ID</span>
                    <span className="font-medium">{property.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Listed</span>
                    <span className="font-medium">{formatDate(property.createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Updated</span>
                    <span className="font-medium">{formatDate(property.updatedAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Views</span>
                    <span className="font-medium">1,234</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* VR Modal */}
      <Modal
        isOpen={showVrModal}
        onClose={() => setShowVrModal(false)}
        title="Virtual Tour"
        size="lg"
      >
        <VrViewer 
          propertyId={property.id}
          propertyTitle={property.title}
          images={property.images.map(img => img.url)}
        />
      </Modal>

      {/* Video Modal */}
      <Modal
        isOpen={showVideoModal}
        onClose={() => setShowVideoModal(false)}
        title="Video Tour"
        size="lg"
      >
        <VideoPlayer
          propertyId={property.id}
          propertyTitle={property.title}
          videos={[]}
        />
      </Modal>

      {/* Booking Modal */}
      <Modal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        title="Book a Viewing"
      >
        <BookingManagement
          userRole="buyer"
          userId="current-user-id"
          onBookingUpdate={() => {
            setShowBookingModal(false);
            showToast.success('Viewing booked successfully!');
          }}
        />
      </Modal>

      {/* Contact Modal */}
      <Modal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        title="Contact Agent"
      >
        <div className="space-y-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-8 w-8 text-gray-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">
              {property.agent?.firstName} {property.agent?.lastName}
            </h3>
            <p className="text-gray-600">{property.agent?.companyName}</p>
          </div>
          <div className="space-y-3">
            <Button className="w-full">
              <Phone className="h-4 w-4 mr-2" />
              Call {property.agent?.phone}
            </Button>
            <Button variant="outline" className="w-full">
              <Mail className="h-4 w-4 mr-2" />
              Email {property.agent?.email}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Market Analysis Modal */}
      <Modal
        isOpen={showMarketAnalysis}
        onClose={() => setShowMarketAnalysis(false)}
        title="Market Analysis"
        size="lg"
      >
        <MarketAnalysis 
           propertyId={property.id}
           address={property.address.street + ', ' + property.address.city}
           postcode={property.address.postcode}
           propertyType={property.type.toLowerCase() as 'house' | 'flat' | 'bungalow' | 'terraced' | 'semi_detached' | 'detached'}
           bedrooms={property.bedrooms}
           bathrooms={property.bathrooms}
         />
      </Modal>

      {/* Mortgage Calculator Modal */}
      <Modal
        isOpen={showMortgageCalculator}
        onClose={() => setShowMortgageCalculator(false)}
        title="Mortgage Calculator"
        size="lg"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Price
              </label>
              <input
                type="text"
                value={formatCurrency(property.price.amount)}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deposit Amount
              </label>
              <input
                type="number"
                placeholder="Enter deposit amount"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Interest Rate (%)
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="e.g., 4.5"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mortgage Term (years)
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="25">25 years</option>
                <option value="30">30 years</option>
                <option value="35">35 years</option>
              </select>
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-3">Monthly Payment Breakdown</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Principal & Interest</span>
                <span className="font-medium">£1,850</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Property Insurance</span>
                <span className="font-medium">£120</span>
              </div>
              {property.council && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Council Tax</span>
                  <span className="font-medium">{formatCurrency(property.council.taxAmount)}</span>
                </div>
              )}
              <hr className="my-2" />
              <div className="flex justify-between text-lg font-semibold">
                <span>Total Monthly Payment</span>
                <span className="text-blue-600">£2,170</span>
              </div>
            </div>
          </div>
          
          <div className="text-sm text-gray-600">
             <p>* This is an estimate only. Actual rates may vary based on your credit score, deposit amount, and lender requirements.</p>
           </div>
         </div>
       </Modal>

       {/* Property Comparison Modal */}
       <Modal
         isOpen={showPropertyComparison}
         onClose={() => setShowPropertyComparison(false)}
         title="Property Comparison"
         size="xl"
       >
         <div className="space-y-6">
           <div className="text-center">
             <p className="text-gray-600 mb-4">Compare this property with similar properties in the area</p>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               {/* Current Property */}
               <div className="border-2 border-blue-500 rounded-lg p-4 bg-blue-50">
                 <div className="text-center mb-3">
                   <span className="bg-blue-500 text-white px-2 py-1 rounded text-sm font-medium">Current Property</span>
                 </div>
                 <img src={property.images[0]} alt="Property" className="w-full h-32 object-cover rounded mb-3" />
                 <h4 className="font-semibold text-sm mb-2">{property.title}</h4>
                 <div className="space-y-1 text-sm">
                   <div className="flex justify-between">
                     <span>Price:</span>
                     <span className="font-medium">{formatCurrency(property.price.amount)}</span>
                   </div>
                   <div className="flex justify-between">
                     <span>Bedrooms:</span>
                     <span>{property.bedrooms}</span>
                   </div>
                   <div className="flex justify-between">
                     <span>Bathrooms:</span>
                     <span>{property.bathrooms}</span>
                   </div>
                   <div className="flex justify-between">
                     <span>Area:</span>
                     <span>{property.area} sq ft</span>
                   </div>
                   <div className="flex justify-between">
                     <span>Price/sq ft:</span>
                     <span>£{Math.round(property.price.amount / property.area)}</span>
                   </div>
                 </div>
               </div>

               {/* Similar Property 1 */}
               <div className="border rounded-lg p-4">
                 <img src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=300&h=200" alt="Similar Property" className="w-full h-32 object-cover rounded mb-3" />
                 <h4 className="font-semibold text-sm mb-2">Victorian Terrace House</h4>
                 <div className="space-y-1 text-sm">
                   <div className="flex justify-between">
                     <span>Price:</span>
                     <span className="font-medium">£485,000</span>
                   </div>
                   <div className="flex justify-between">
                     <span>Bedrooms:</span>
                     <span>3</span>
                   </div>
                   <div className="flex justify-between">
                     <span>Bathrooms:</span>
                     <span>2</span>
                   </div>
                   <div className="flex justify-between">
                     <span>Area:</span>
                     <span>1,100 sq ft</span>
                   </div>
                   <div className="flex justify-between">
                     <span>Price/sq ft:</span>
                     <span>£441</span>
                   </div>
                 </div>
                 <div className="mt-2 text-xs text-green-600">£15,000 less</div>
               </div>

               {/* Similar Property 2 */}
               <div className="border rounded-lg p-4">
                 <img src="https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=300&h=200" alt="Similar Property" className="w-full h-32 object-cover rounded mb-3" />
                 <h4 className="font-semibold text-sm mb-2">Modern Family Home</h4>
                 <div className="space-y-1 text-sm">
                   <div className="flex justify-between">
                     <span>Price:</span>
                     <span className="font-medium">£525,000</span>
                   </div>
                   <div className="flex justify-between">
                     <span>Bedrooms:</span>
                     <span>4</span>
                   </div>
                   <div className="flex justify-between">
                     <span>Bathrooms:</span>
                     <span>3</span>
                   </div>
                   <div className="flex justify-between">
                     <span>Area:</span>
                     <span>1,300 sq ft</span>
                   </div>
                   <div className="flex justify-between">
                     <span>Price/sq ft:</span>
                     <span>£404</span>
                   </div>
                 </div>
                 <div className="mt-2 text-xs text-red-600">£25,000 more</div>
               </div>
             </div>
           </div>

           <div className="bg-gray-50 p-4 rounded-lg">
             <h4 className="font-semibold mb-3">Market Comparison Summary</h4>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
               <div className="text-center">
                 <div className="text-2xl font-bold text-green-600">£15K</div>
                 <div className="text-gray-600">Below Average</div>
               </div>
               <div className="text-center">
                 <div className="text-2xl font-bold text-blue-600">£425</div>
                 <div className="text-gray-600">Price per sq ft</div>
               </div>
               <div className="text-center">
                 <div className="text-2xl font-bold text-purple-600">92%</div>
                 <div className="text-gray-600">Market Value</div>
               </div>
             </div>
           </div>
         </div>
       </Modal>

       {/* Property History Modal */}
       <Modal
         isOpen={showPropertyHistory}
         onClose={() => setShowPropertyHistory(false)}
         title="Property History"
         size="lg"
       >
         <div className="space-y-6">
           <div className="border-l-4 border-blue-500 pl-4">
             <h4 className="font-semibold text-gray-900 mb-2">Price History</h4>
             <div className="space-y-3">
               {property.marketData?.priceHistory?.map((entry, index) => (
                 <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                   <div>
                     <p className="font-medium">{entry.date}</p>
                     <p className="text-sm text-gray-600">{entry.event}</p>
                   </div>
                   <div className="text-right">
                     <p className="font-semibold">{formatCurrency(entry.price)}</p>
                     {entry.change && (
                       <p className={`text-sm ${
                         entry.change > 0 ? 'text-green-600' : 'text-red-600'
                       }`}>
                         {entry.change > 0 ? '+' : ''}{entry.change}%
                       </p>
                     )}
                   </div>
                 </div>
               )) || (
                 <div className="text-gray-500 text-center py-4">
                   No price history available
                 </div>
               )}
             </div>
           </div>

           <div className="border-l-4 border-green-500 pl-4">
             <h4 className="font-semibold text-gray-900 mb-2">Property Details</h4>
             <div className="space-y-2 text-sm">
               <div className="flex justify-between">
                 <span className="text-gray-600">Property Type:</span>
                 <span>{property.propertyType}</span>
               </div>
               <div className="flex justify-between">
                 <span className="text-gray-600">Year Built:</span>
                 <span>1995</span>
               </div>
               <div className="flex justify-between">
                 <span className="text-gray-600">Tenure:</span>
                 <span>Freehold</span>
               </div>
               <div className="flex justify-between">
                 <span className="text-gray-600">Council Tax Band:</span>
                 <span>{property.council?.taxBand}</span>
               </div>
               <div className="flex justify-between">
                 <span className="text-gray-600">EPC Rating:</span>
                 <span>{property.energyRating?.current}</span>
               </div>
             </div>
           </div>

           {property.legalInfo && (
             <div className="border-l-4 border-purple-500 pl-4">
               <h4 className="font-semibold text-gray-900 mb-2">Legal Information</h4>
               <div className="space-y-2 text-sm">
                 <div className="flex justify-between">
                   <span className="text-gray-600">Tenure:</span>
                   <span>{property.legalInfo.tenure}</span>
                 </div>
                 <div className="flex justify-between">
                   <span className="text-gray-600">Ground Rent:</span>
                   <span>{property.legalInfo.groundRent ? formatCurrency(property.legalInfo.groundRent) : 'N/A'}</span>
                 </div>
                 <div className="flex justify-between">
                   <span className="text-gray-600">Service Charge:</span>
                   <span>{property.legalInfo.serviceCharge ? formatCurrency(property.legalInfo.serviceCharge) : 'N/A'}</span>
                 </div>
                 <div className="flex justify-between">
                   <span className="text-gray-600">Lease Remaining:</span>
                   <span>{property.legalInfo.leaseYearsRemaining || 'N/A'} years</span>
                 </div>
               </div>
             </div>
           )}
         </div>
       </Modal>
     </div>
   );
};

export default PropertyDetail;