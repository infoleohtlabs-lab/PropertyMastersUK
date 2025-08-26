import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import {
  ArrowLeft,
  Heart,
  Share2,
  Phone,
  Mail,
  Calendar,
  MapPin,
  Bed,
  Bath,
  Square,
  Car,
  Wifi,
  Shield,
  Home,
  Building2,
  TrendingUp,
  Calculator,
  Eye,
  Camera,
  Video,
  Download,
  Printer,
  Star,
  ChevronLeft,
  ChevronRight,
  Play,
  Maximize,
  Info,
  CheckCircle,
  AlertCircle,
  Clock,
  Users,
  PoundSterling,
  FileText,
  Zap,
  TreePine,
  Train,
  ShoppingBag,
  GraduationCap
} from 'lucide-react';

interface Property {
  id: number;
  title: string;
  location: string;
  postcode: string;
  price: number;
  type: 'sale' | 'rent';
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  epcRating: string;
  tenure: string;
  yearBuilt: number;
  councilTax: string;
  images: string[];
  features: string[];
  description: string;
  fullDescription: string;
  agent: {
    name: string;
    company: string;
    phone: string;
    email: string;
    image: string;
    rating: number;
    reviewCount: number;
  };
  pricePerSqft: number;
  daysOnMarket: number;
  viewingCount: number;
  saved: boolean;
  floorPlan: string;
  virtualTour: string;
  videoTour: string;
  nearbyAmenities: {
    transport: Array<{ name: string; distance: string; type: string }>;
    schools: Array<{ name: string; distance: string; rating: string }>;
    shopping: Array<{ name: string; distance: string; type: string }>;
    healthcare: Array<{ name: string; distance: string; type: string }>;
  };
  priceHistory: Array<{ date: string; price: number; event: string }>;
  marketAnalysis: {
    averagePrice: number;
    priceChange: number;
    daysOnMarket: number;
    demandLevel: 'Low' | 'Medium' | 'High';
  };
}

interface MortgageCalculation {
  monthlyPayment: number;
  totalInterest: number;
  totalAmount: number;
}

const PropertyDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [saved, setSaved] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showMortgageCalculator, setShowMortgageCalculator] = useState(false);
  
  // Mortgage calculator states
  const [mortgageInputs, setMortgageInputs] = useState({
    purchasePrice: '',
    deposit: '',
    interestRate: '4.5',
    term: '25'
  });
  const [mortgageResult, setMortgageResult] = useState<MortgageCalculation | null>(null);
  
  // Booking states
  const [bookingData, setBookingData] = useState({
    date: '',
    time: '',
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  // Mock property data
  const mockProperty: Property = {
    id: 1,
    title: 'Modern 2-Bed Apartment with River Views',
    location: 'Canary Wharf, London',
    postcode: 'E14 5AB',
    price: 650000,
    type: 'sale',
    bedrooms: 2,
    bathrooms: 2,
    sqft: 950,
    epcRating: 'B',
    tenure: 'Leasehold',
    yearBuilt: 2019,
    councilTax: 'Band E',
    images: [
      'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20luxury%20apartment%20living%20room%20london%20canary%20wharf%20floor%20to%20ceiling%20windows%20river%20views&image_size=landscape_4_3',
      'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20apartment%20kitchen%20london%20luxury%20marble%20countertops%20stainless%20steel%20appliances&image_size=landscape_4_3',
      'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20apartment%20bedroom%20london%20luxury%20minimalist%20design%20large%20windows&image_size=landscape_4_3',
      'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20apartment%20bathroom%20london%20luxury%20marble%20tiles%20rainfall%20shower&image_size=landscape_4_3',
      'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=apartment%20balcony%20london%20canary%20wharf%20river%20thames%20views%20outdoor%20furniture&image_size=landscape_4_3'
    ],
    features: ['Balcony', 'Concierge', 'Gym', 'River Views', 'Parking', 'Lift', 'Security', 'Storage'],
    description: 'Stunning modern apartment with panoramic river views in the heart of Canary Wharf.',
    fullDescription: 'This exceptional 2-bedroom apartment offers contemporary living at its finest in the prestigious Canary Wharf district. The property features floor-to-ceiling windows throughout, providing breathtaking views of the River Thames and London skyline. The open-plan living area seamlessly connects to a modern kitchen equipped with high-end appliances and marble countertops. Both bedrooms are generously sized with built-in wardrobes, while the master bedroom includes an en-suite bathroom. The property benefits from a private balcony, perfect for entertaining or relaxing while enjoying the stunning views. Residents have access to excellent amenities including a 24-hour concierge, gymnasium, and secure underground parking.',
    agent: {
      name: 'Sarah Johnson',
      company: 'Prime London Properties',
      phone: '+44 20 7123 4567',
      email: 'sarah@primelondon.co.uk',
      image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20female%20estate%20agent%20headshot%20business%20attire&image_size=square',
      rating: 4.8,
      reviewCount: 127
    },
    pricePerSqft: 684,
    daysOnMarket: 15,
    viewingCount: 23,
    saved: false,
    floorPlan: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=apartment%20floor%20plan%20architectural%20drawing%202%20bedroom%20modern%20layout&image_size=landscape_4_3',
    virtualTour: 'https://example.com/virtual-tour',
    videoTour: 'https://example.com/video-tour',
    nearbyAmenities: {
      transport: [
        { name: 'Canary Wharf Station', distance: '0.2 miles', type: 'Underground' },
        { name: 'West India Quay DLR', distance: '0.3 miles', type: 'DLR' },
        { name: 'Canary Wharf Pier', distance: '0.4 miles', type: 'River Bus' }
      ],
      schools: [
        { name: 'Canary Wharf College', distance: '0.5 miles', rating: 'Outstanding' },
        { name: 'St. Paul\'s Way Trust School', distance: '1.2 miles', rating: 'Good' },
        { name: 'George Green\'s School', distance: '1.5 miles', rating: 'Good' }
      ],
      shopping: [
        { name: 'Canary Wharf Shopping Centre', distance: '0.1 miles', type: 'Shopping Centre' },
        { name: 'Waitrose', distance: '0.2 miles', type: 'Supermarket' },
        { name: 'Crossrail Place Roof Garden', distance: '0.3 miles', type: 'Retail & Dining' }
      ],
      healthcare: [
        { name: 'Canary Wharf Medical Centre', distance: '0.3 miles', type: 'GP Surgery' },
        { name: 'The London Hospital', distance: '2.1 miles', type: 'Hospital' },
        { name: 'Boots Pharmacy', distance: '0.1 miles', type: 'Pharmacy' }
      ]
    },
    priceHistory: [
      { date: '2024-01-15', price: 650000, event: 'Listed' },
      { date: '2023-11-20', price: 635000, event: 'Previous Sale' },
      { date: '2022-08-10', price: 620000, event: 'Previous Sale' }
    ],
    marketAnalysis: {
      averagePrice: 675000,
      priceChange: 5.2,
      daysOnMarket: 28,
      demandLevel: 'High'
    }
  };

  useEffect(() => {
    // In a real app, fetch property data based on ID
    setProperty(mockProperty);
    setSaved(mockProperty.saved);
    setMortgageInputs(prev => ({ ...prev, purchasePrice: mockProperty.price.toString() }));
  }, [id]);

  const calculateMortgage = () => {
    const purchasePrice = parseFloat(mortgageInputs.purchasePrice);
    const deposit = parseFloat(mortgageInputs.deposit);
    const interestRate = parseFloat(mortgageInputs.interestRate) / 100 / 12;
    const termMonths = parseInt(mortgageInputs.term) * 12;
    const loanAmount = purchasePrice - deposit;

    if (loanAmount <= 0 || interestRate <= 0 || termMonths <= 0) return;

    const monthlyPayment = (loanAmount * interestRate * Math.pow(1 + interestRate, termMonths)) / 
                          (Math.pow(1 + interestRate, termMonths) - 1);
    const totalAmount = monthlyPayment * termMonths;
    const totalInterest = totalAmount - loanAmount;

    setMortgageResult({
      monthlyPayment,
      totalInterest,
      totalAmount
    });
  };

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, submit booking data to API
    console.log('Booking submitted:', bookingData);
    setShowBookingModal(false);
    // Show success message
  };

  const toggleSave = () => {
    setSaved(!saved);
    // In a real app, update saved status via API
  };

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading property details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/properties" className="flex items-center text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Search
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={toggleSave}>
                <Heart className={`h-4 w-4 mr-2 ${saved ? 'text-red-500 fill-current' : ''}`} />
                {saved ? 'Saved' : 'Save'}
              </Button>
              <Button variant="outline">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="outline">
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="relative">
                <img
                  src={property.images[currentImageIndex]}
                  alt={property.title}
                  className="w-full h-96 object-cover cursor-pointer"
                  onClick={() => setShowImageModal(true)}
                />
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium text-white ${
                    property.type === 'sale' ? 'bg-green-600' : 'bg-blue-600'
                  }`}>
                    For {property.type === 'sale' ? 'Sale' : 'Rent'}
                  </span>
                </div>
                <div className="absolute top-4 right-4 flex space-x-2">
                  <Button size="sm" variant="outline" className="bg-white/90 backdrop-blur-sm">
                    <Camera className="h-4 w-4 mr-2" />
                    {property.images.length}
                  </Button>
                  <Button size="sm" variant="outline" className="bg-white/90 backdrop-blur-sm">
                    <Video className="h-4 w-4 mr-2" />
                    Video Tour
                  </Button>
                  <Button size="sm" variant="outline" className="bg-white/90 backdrop-blur-sm">
                    <Eye className="h-4 w-4 mr-2" />
                    VR Tour
                  </Button>
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex space-x-2 overflow-x-auto">
                    {property.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`View ${index + 1}`}
                        className={`w-16 h-12 object-cover rounded cursor-pointer border-2 ${
                          index === currentImageIndex ? 'border-white' : 'border-transparent'
                        }`}
                        onClick={() => setCurrentImageIndex(index)}
                      />
                    ))}
                  </div>
                </div>
                {property.images.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImageIndex(currentImageIndex > 0 ? currentImageIndex - 1 : property.images.length - 1)}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setCurrentImageIndex(currentImageIndex < property.images.length - 1 ? currentImageIndex + 1 : 0)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Property Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.title}</h1>
                  <p className="text-lg text-gray-600 flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    {property.location} • {property.postcode}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-gray-900">
                    £{property.price.toLocaleString()}
                    {property.type === 'rent' && <span className="text-lg text-gray-600">/month</span>}
                  </div>
                  <div className="text-gray-600">£{property.pricePerSqft}/sqft</div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Bed className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                  <div className="font-semibold">{property.bedrooms}</div>
                  <div className="text-sm text-gray-600">Bedrooms</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Bath className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                  <div className="font-semibold">{property.bathrooms}</div>
                  <div className="text-sm text-gray-600">Bathrooms</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Square className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                  <div className="font-semibold">{property.sqft}</div>
                  <div className="text-sm text-gray-600">Sq Ft</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Zap className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                  <div className="font-semibold">{property.epcRating}</div>
                  <div className="text-sm text-gray-600">EPC Rating</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                <div><span className="font-medium">Tenure:</span> {property.tenure}</div>
                <div><span className="font-medium">Built:</span> {property.yearBuilt}</div>
                <div><span className="font-medium">Council Tax:</span> {property.councilTax}</div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  {[
                    { id: 'overview', label: 'Overview' },
                    { id: 'features', label: 'Features' },
                    { id: 'floorplan', label: 'Floor Plan' },
                    { id: 'location', label: 'Location' },
                    { id: 'market', label: 'Market Analysis' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Description</h3>
                      <p className="text-gray-700 leading-relaxed">{property.fullDescription}</p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Key Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600">Days on Market</span>
                          <span className="font-medium">{property.daysOnMarket} days</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600">Viewings</span>
                          <span className="font-medium">{property.viewingCount} viewings</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600">Property Type</span>
                          <span className="font-medium">Apartment</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600">Lease Length</span>
                          <span className="font-medium">999 years remaining</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'features' && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Property Features</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {property.features.map((feature, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          <span className="text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'floorplan' && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Floor Plan</h3>
                    <div className="bg-gray-100 rounded-lg p-8 text-center">
                      <img
                        src={property.floorPlan}
                        alt="Floor Plan"
                        className="max-w-full h-auto mx-auto rounded-lg"
                      />
                      <div className="mt-4">
                        <Button variant="outline">
                          <Download className="h-4 w-4 mr-2" />
                          Download Floor Plan
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'location' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Nearby Amenities</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium mb-3 flex items-center">
                            <Train className="h-5 w-5 mr-2 text-blue-600" />
                            Transport
                          </h4>
                          <div className="space-y-2">
                            {property.nearbyAmenities.transport.map((item, index) => (
                              <div key={index} className="flex justify-between text-sm">
                                <span>{item.name}</span>
                                <span className="text-gray-600">{item.distance}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium mb-3 flex items-center">
                            <GraduationCap className="h-5 w-5 mr-2 text-green-600" />
                            Schools
                          </h4>
                          <div className="space-y-2">
                            {property.nearbyAmenities.schools.map((item, index) => (
                              <div key={index} className="flex justify-between text-sm">
                                <span>{item.name}</span>
                                <span className="text-gray-600">{item.distance}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium mb-3 flex items-center">
                            <ShoppingBag className="h-5 w-5 mr-2 text-purple-600" />
                            Shopping
                          </h4>
                          <div className="space-y-2">
                            {property.nearbyAmenities.shopping.map((item, index) => (
                              <div key={index} className="flex justify-between text-sm">
                                <span>{item.name}</span>
                                <span className="text-gray-600">{item.distance}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium mb-3 flex items-center">
                            <Building2 className="h-5 w-5 mr-2 text-red-600" />
                            Healthcare
                          </h4>
                          <div className="space-y-2">
                            {property.nearbyAmenities.healthcare.map((item, index) => (
                              <div key={index} className="flex justify-between text-sm">
                                <span>{item.name}</span>
                                <span className="text-gray-600">{item.distance}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-100 rounded-lg p-6">
                      <h4 className="font-medium mb-3">Interactive Map</h4>
                      <div className="h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                        <div className="text-center text-gray-600">
                          <MapPin className="h-8 w-8 mx-auto mb-2" />
                          <p>Interactive map integration</p>
                          <p className="text-sm">Powered by Ordnance Survey</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'market' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Market Analysis</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">£{property.marketAnalysis.averagePrice.toLocaleString()}</div>
                          <div className="text-sm text-gray-600">Average Area Price</div>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">+{property.marketAnalysis.priceChange}%</div>
                          <div className="text-sm text-gray-600">Price Change (1 year)</div>
                        </div>
                        <div className="bg-orange-50 p-4 rounded-lg">
                          <div className="text-2xl font-bold text-orange-600">{property.marketAnalysis.daysOnMarket}</div>
                          <div className="text-sm text-gray-600">Avg. Days on Market</div>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg">
                          <div className="text-2xl font-bold text-purple-600">{property.marketAnalysis.demandLevel}</div>
                          <div className="text-sm text-gray-600">Demand Level</div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-3">Price History</h4>
                      <div className="space-y-3">
                        {property.priceHistory.map((entry, index) => (
                          <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100">
                            <div>
                              <span className="font-medium">{entry.event}</span>
                              <span className="text-gray-600 ml-2">{new Date(entry.date).toLocaleDateString()}</span>
                            </div>
                            <span className="font-semibold">£{entry.price.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Agent Card */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Contact Agent</h3>
              <div className="flex items-center space-x-4 mb-4">
                <img
                  src={property.agent.image}
                  alt={property.agent.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-semibold">{property.agent.name}</h4>
                  <p className="text-gray-600 text-sm">{property.agent.company}</p>
                  <div className="flex items-center mt-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600 ml-1">
                      {property.agent.rating} ({property.agent.reviewCount} reviews)
                    </span>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <Button className="w-full">
                  <Phone className="h-4 w-4 mr-2" />
                  Call {property.agent.phone}
                </Button>
                <Button variant="outline" className="w-full">
                  <Mail className="h-4 w-4 mr-2" />
                  Email Agent
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setShowBookingModal(true)}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Book Viewing
                </Button>
              </div>
            </div>

            {/* Mortgage Calculator */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Calculator className="h-5 w-5 mr-2" />
                Mortgage Calculator
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Purchase Price
                  </label>
                  <Input
                    type="number"
                    value={mortgageInputs.purchasePrice}
                    onChange={(e) => setMortgageInputs(prev => ({ ...prev, purchasePrice: e.target.value }))}
                    placeholder="650000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deposit
                  </label>
                  <Input
                    type="number"
                    value={mortgageInputs.deposit}
                    onChange={(e) => setMortgageInputs(prev => ({ ...prev, deposit: e.target.value }))}
                    placeholder="65000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Interest Rate (%)
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    value={mortgageInputs.interestRate}
                    onChange={(e) => setMortgageInputs(prev => ({ ...prev, interestRate: e.target.value }))}
                    placeholder="4.5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Term (years)
                  </label>
                  <Input
                    type="number"
                    value={mortgageInputs.term}
                    onChange={(e) => setMortgageInputs(prev => ({ ...prev, term: e.target.value }))}
                    placeholder="25"
                  />
                </div>
                <Button onClick={calculateMortgage} className="w-full">
                  Calculate
                </Button>
                {mortgageResult && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Monthly Payment:</span>
                        <span className="font-semibold">£{mortgageResult.monthlyPayment.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Interest:</span>
                        <span className="font-semibold">£{mortgageResult.totalInterest.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Amount:</span>
                        <span className="font-semibold">£{mortgageResult.totalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button variant="outline" className="w-full">
                  <FileText className="h-4 w-4 mr-2" />
                  Request Brochure
                </Button>
                <Button variant="outline" className="w-full">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Market Valuation
                </Button>
                <Button variant="outline" className="w-full">
                  <Info className="h-4 w-4 mr-2" />
                  Property Report
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Book a Viewing</h3>
            <form onSubmit={handleBooking} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Date
                  </label>
                  <Input
                    type="date"
                    value={bookingData.date}
                    onChange={(e) => setBookingData(prev => ({ ...prev, date: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Time
                  </label>
                  <select
                    value={bookingData.time}
                    onChange={(e) => setBookingData(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select time</option>
                    <option value="09:00">9:00 AM</option>
                    <option value="10:00">10:00 AM</option>
                    <option value="11:00">11:00 AM</option>
                    <option value="14:00">2:00 PM</option>
                    <option value="15:00">3:00 PM</option>
                    <option value="16:00">4:00 PM</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <Input
                  value={bookingData.name}
                  onChange={(e) => setBookingData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <Input
                  type="email"
                  value={bookingData.email}
                  onChange={(e) => setBookingData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <Input
                  type="tel"
                  value={bookingData.phone}
                  onChange={(e) => setBookingData(prev => ({ ...prev, phone: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message (Optional)
                </label>
                <textarea
                  value={bookingData.message}
                  onChange={(e) => setBookingData(prev => ({ ...prev, message: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Any specific requirements or questions..."
                />
              </div>
              <div className="flex space-x-3">
                <Button type="submit" className="flex-1">
                  Book Viewing
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowBookingModal(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl w-full">
            <img
              src={property.images[currentImageIndex]}
              alt={property.title}
              className="w-full h-auto max-h-[80vh] object-contain"
            />
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full p-2 text-white hover:bg-white/30 transition-colors"
            >
              ✕
            </button>
            {property.images.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentImageIndex(currentImageIndex > 0 ? currentImageIndex - 1 : property.images.length - 1)}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm rounded-full p-3 text-white hover:bg-white/30 transition-colors"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={() => setCurrentImageIndex(currentImageIndex < property.images.length - 1 ? currentImageIndex + 1 : 0)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm rounded-full p-3 text-white hover:bg-white/30 transition-colors"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm">
              {currentImageIndex + 1} / {property.images.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyDetails;