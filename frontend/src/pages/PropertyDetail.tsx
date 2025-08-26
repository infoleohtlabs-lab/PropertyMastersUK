import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Bed,
  Bath,
  Square,
  Heart,
  Share2,
  Calendar,
  Phone,
  Mail,
  User,
  Building,
  Car,
  Wifi,
  Shield,
  Star,
  ChevronLeft,
  ChevronRight,
  Play,
  Eye,
  TrendingUp,
  Calculator,
  Clock,
  CheckCircle,
  MessageSquare,
  Check
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { showToast } from '../components/ui/Toast';
import VrViewer from '../components/VrViewer';
import VideoPlayer from '../components/VideoPlayer';
import MarketAnalysis from '../components/MarketAnalysis';
import BookingManagement from '../components/BookingManagement';
import { usePropertyStore } from '../stores/propertyStore';
import { useAuthStore } from '../stores/authStore';
import { formatCurrency, formatDate } from '../utils';
import type { Property } from '../types';
import { PropertyStatus, PropertyType, PriceType } from '../types';

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

  // Mock property data
  const mockProperty: Property = {
    id: id || '1',
    title: 'Luxury Penthouse with Thames Views',
    description: 'Stunning luxury penthouse apartment featuring floor-to-ceiling windows with breathtaking views of the Thames River and London skyline. This exceptional property offers the finest in contemporary living with premium finishes throughout, a private terrace, and access to world-class amenities including a 24-hour concierge, fitness center, and rooftop garden.',
    price: { amount: 1250000, period: undefined },
    type: PropertyType.APARTMENT,
    status: PropertyStatus.AVAILABLE,
    priceType: PriceType.SALE,
    bedrooms: 3,
    bathrooms: 2,
    area: 1800,
    address: {
      street: '25 Marsh Wall',
      city: 'London',
      county: 'Greater London',
      postcode: 'E14 9FW',
      country: 'UK'
    },
    location: 'Canary Wharf, London',
    images: [
      {
        id: '1',
        url: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=luxury%20penthouse%20interior%20with%20floor%20to%20ceiling%20windows%20overlooking%20thames%20river%2C%20modern%20furniture%2C%20marble%20finishes%2C%20high%20end%20design&image_size=landscape_4_3',
        alt: 'Luxury penthouse living room',
        isPrimary: true,
        order: 1
      },
      {
        id: '2',
        url: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20luxury%20kitchen%20with%20marble%20countertops%2C%20high%20end%20appliances%2C%20island%2C%20pendant%20lighting%2C%20contemporary%20design&image_size=landscape_4_3',
        alt: 'Modern kitchen',
        isPrimary: false,
        order: 2
      },
      {
        id: '3',
        url: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=luxury%20master%20bedroom%20with%20king%20size%20bed%2C%20city%20views%2C%20modern%20furniture%2C%20elegant%20design%2C%20natural%20lighting&image_size=landscape_4_3',
        alt: 'Master bedroom',
        isPrimary: false,
        order: 3
      },
      {
        id: '4',
        url: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=luxury%20bathroom%20with%20marble%20finishes%2C%20freestanding%20bathtub%2C%20walk%20in%20shower%2C%20modern%20fixtures%2C%20spa%20like%20design&image_size=landscape_4_3',
        alt: 'Luxury bathroom',
        isPrimary: false,
        order: 4
      },
      {
        id: '5',
        url: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=private%20terrace%20with%20outdoor%20furniture%2C%20city%20skyline%20views%2C%20plants%2C%20modern%20outdoor%20design%2C%20evening%20lighting&image_size=landscape_4_3',
        alt: 'Private terrace',
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
      email: 'sarah.johnson@propertymasters.co.uk',
      phone: '+44 20 7123 4567',
      companyName: 'PropertyMasters UK',
      licenseNumber: 'LIC-12345',
      address: {
        street: '123 Business Street',
        city: 'London',
        county: 'Greater London',
        postcode: 'SW1A 1AA',
        country: 'United Kingdom'
      },
      specializations: ['Luxury Properties', 'Residential Sales'],
      rating: 4.8,
      reviewCount: 127,
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z'
    },
    features: [
      'Thames Views',
      'Private Terrace',
      '24-Hour Concierge',
      'Gym & Spa',
      'Parking Space',
      'Storage Unit',
      'High-Speed Internet',
      'Air Conditioning',
      'Underfloor Heating',
      'Smart Home System'
    ],
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
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
    if (navigator.share) {
      navigator.share({
        title: property?.title,
        text: property?.description,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast.success('Property link copied to clipboard');
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
                <Eye className="h-5 w-5 text-gray-800" />
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
              <button
                onClick={handleShare}
                className="bg-white/90 hover:bg-white rounded-full p-3 transition-colors"
                title="Share Property"
              >
                <Share2 className="h-5 w-5 text-gray-800" />
              </button>
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

            {/* Location */}
            <Card>
              <CardHeader>
                <CardTitle>Location</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                  <MapPin className="h-8 w-8 text-gray-400" />
                  <span className="ml-2 text-gray-600">Map View</span>
                </div>
                <div className="space-y-2">
                  <p className="font-medium text-gray-900">Address</p>
                  <p className="text-gray-600">{property.location}</p>
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
    </div>
  );
};

export default PropertyDetail;