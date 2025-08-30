import React, { useState, useEffect } from 'react';
import {
  Home,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  MapPin,
  Bed,
  Bath,
  Square,
  Car,
  Calendar,
  Camera,
  Video,
  Upload,
  Download,
  Star,
  Heart,
  Share2,
  TrendingUp,
  TrendingDown,
  Calculator,
  Map,
  Navigation,
  Building,
  Building2,
  TreePine,
  Wifi,
  Zap,
  Droplets,
  Thermometer,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  Phone,
  Mail,
  Globe,
  Tag,
  Bookmark,
  BarChart3,
  PieChart,
  LineChart,
  Target,
  Percent,
  PoundSterling,
  Users,
  FileText,
  Image,
  Play,
  Maximize,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Layers,
  Compass,
  Route,
  MapPin as LocationPin,
  Settings,
  RefreshCw,
  ExternalLink,
  Copy,
  QrCode,
  Printer,
  Send,
  Archive,
  Flag,
  Award,
  Crown,
  Gem
} from 'lucide-react';
import { formatCurrency } from '../utils';

interface Property {
  id: string;
  title: string;
  description: string;
  type: 'house' | 'apartment' | 'commercial' | 'land';
  status: 'available' | 'sold' | 'rented' | 'pending' | 'draft';
  price: number;
  priceType: 'sale' | 'rent';
  address: {
    street: string;
    city: string;
    postcode: string;
    county: string;
    country: string;
    coordinates: { lat: number; lng: number };
  };
  features: {
    bedrooms: number;
    bathrooms: number;
    receptions: number;
    squareFootage: number;
    parking: number;
    garden: boolean;
    balcony: boolean;
    garage: boolean;
  };
  amenities: string[];
  images: PropertyImage[];
  videos: PropertyVideo[];
  virtualTour?: string;
  floorPlan?: string;
  energyRating: string;
  councilTax: string;
  yearBuilt: number;
  tenure: 'freehold' | 'leasehold';
  leaseYears?: number;
  serviceCharge?: number;
  groundRent?: number;
  agent: {
    id: string;
    name: string;
    email: string;
    phone: string;
    avatar?: string;
  };
  landlord?: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  valuation: {
    estimated: number;
    confidence: number;
    lastUpdated: string;
    comparables: PropertyComparable[];
  };
  analytics: {
    views: number;
    enquiries: number;
    viewings: number;
    favorites: number;
    daysOnMarket: number;
  };
  createdAt: string;
  updatedAt: string;
  featured: boolean;
  premium: boolean;
}

interface PropertyImage {
  id: string;
  url: string;
  caption?: string;
  isPrimary: boolean;
  room?: string;
  order: number;
}

interface PropertyVideo {
  id: string;
  url: string;
  thumbnail: string;
  title: string;
  duration: number;
  type: 'walkthrough' | 'drone' | 'neighborhood';
}

interface PropertyComparable {
  id: string;
  address: string;
  price: number;
  soldDate: string;
  distance: number;
  similarity: number;
  features: {
    bedrooms: number;
    bathrooms: number;
    squareFootage: number;
  };
}

interface SearchFilters {
  type: string;
  priceMin: number;
  priceMax: number;
  bedrooms: number;
  bathrooms: number;
  location: string;
  radius: number;
  features: string[];
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

interface MarketData {
  averagePrice: number;
  priceChange: number;
  averageDaysOnMarket: number;
  totalListings: number;
  soldThisMonth: number;
  pricePerSqFt: number;
  demandIndex: number;
  supplyIndex: number;
}

const PropertyManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'properties' | 'search' | 'valuation' | 'analytics' | 'market'>('properties');
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    type: '',
    priceMin: 0,
    priceMax: 0,
    bedrooms: 0,
    bathrooms: 0,
    location: '',
    radius: 5,
    features: [],
    sortBy: 'price',
    sortOrder: 'desc'
  });
  
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [showValuationModal, setShowValuationModal] = useState(false);
  const [showVirtualTourModal, setShowVirtualTourModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  // Mock data initialization
  useEffect(() => {
    const mockProperties: Property[] = [
      {
        id: '1',
        title: 'Modern 3-Bedroom House in Hampstead',
        description: 'Beautiful Victorian terrace house with modern renovations, featuring spacious rooms, original period features, and a lovely garden. Located in the heart of Hampstead with excellent transport links.',
        type: 'house',
        status: 'available',
        price: 1250000,
        priceType: 'sale',
        address: {
          street: '123 Hampstead High Street',
          city: 'London',
          postcode: 'NW3 1QG',
          county: 'Greater London',
          country: 'United Kingdom',
          coordinates: { lat: 51.5557, lng: -0.1778 }
        },
        features: {
          bedrooms: 3,
          bathrooms: 2,
          receptions: 2,
          squareFootage: 1850,
          parking: 1,
          garden: true,
          balcony: false,
          garage: true
        },
        amenities: ['Central Heating', 'Double Glazing', 'Fitted Kitchen', 'Garden', 'Parking', 'Period Features'],
        images: [
          {
            id: '1',
            url: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20victorian%20house%20exterior%20hampstead%20london%20brick%20facade%20garden&image_size=landscape_4_3',
            isPrimary: true,
            room: 'Exterior',
            order: 1
          },
          {
            id: '2',
            url: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20living%20room%20victorian%20house%20period%20features%20fireplace&image_size=landscape_4_3',
            isPrimary: false,
            room: 'Living Room',
            order: 2
          }
        ],
        videos: [],
        energyRating: 'C',
        councilTax: 'Band F',
        yearBuilt: 1890,
        tenure: 'freehold',
        agent: {
          id: 'agent1',
          name: 'Sarah Johnson',
          email: 'sarah@propertymastersuk.com',
          phone: '+44 20 7123 4567'
        },
        valuation: {
          estimated: 1250000,
          confidence: 85,
          lastUpdated: '2024-01-15T00:00:00Z',
          comparables: [
            {
              id: '1',
              address: '125 Hampstead High Street',
              price: 1200000,
              soldDate: '2023-12-15T00:00:00Z',
              distance: 0.1,
              similarity: 92,
              features: { bedrooms: 3, bathrooms: 2, squareFootage: 1800 }
            }
          ]
        },
        analytics: {
          views: 245,
          enquiries: 12,
          viewings: 8,
          favorites: 23,
          daysOnMarket: 15
        },
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-15T00:00:00Z',
        featured: true,
        premium: true
      },
      {
        id: '2',
        title: 'Luxury 2-Bedroom Apartment in Canary Wharf',
        description: 'Stunning modern apartment with floor-to-ceiling windows, offering panoramic views of London skyline. High-end finishes throughout with access to premium building amenities.',
        type: 'apartment',
        status: 'available',
        price: 3500,
        priceType: 'rent',
        address: {
          street: '1 Canada Square',
          city: 'London',
          postcode: 'E14 5AB',
          county: 'Greater London',
          country: 'United Kingdom',
          coordinates: { lat: 51.5045, lng: -0.0197 }
        },
        features: {
          bedrooms: 2,
          bathrooms: 2,
          receptions: 1,
          squareFootage: 1200,
          parking: 1,
          garden: false,
          balcony: true,
          garage: false
        },
        amenities: ['Concierge', 'Gym', 'Swimming Pool', 'Balcony', 'Air Conditioning', 'Underground Parking'],
        images: [
          {
            id: '1',
            url: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=luxury%20apartment%20canary%20wharf%20london%20skyline%20view%20modern%20glass%20building&image_size=landscape_4_3',
            isPrimary: true,
            room: 'Living Room',
            order: 1
          }
        ],
        videos: [],
        energyRating: 'B',
        councilTax: 'Band G',
        yearBuilt: 2018,
        tenure: 'leasehold',
        leaseYears: 999,
        serviceCharge: 2400,
        agent: {
          id: 'agent2',
          name: 'Michael Chen',
          email: 'michael@propertymastersuk.com',
          phone: '+44 20 7234 5678'
        },
        valuation: {
          estimated: 850000,
          confidence: 78,
          lastUpdated: '2024-01-10T00:00:00Z',
          comparables: []
        },
        analytics: {
          views: 189,
          enquiries: 18,
          viewings: 12,
          favorites: 31,
          daysOnMarket: 8
        },
        createdAt: '2024-01-08T00:00:00Z',
        updatedAt: '2024-01-12T00:00:00Z',
        featured: false,
        premium: true
      },
      {
        id: '3',
        title: 'Commercial Office Space in Shoreditch',
        description: 'Prime commercial space in the heart of Shoreditch, perfect for creative businesses. Open plan layout with high ceilings, exposed brick walls, and excellent natural light.',
        type: 'commercial',
        status: 'available',
        price: 4500,
        priceType: 'rent',
        address: {
          street: '45 Shoreditch High Street',
          city: 'London',
          postcode: 'E1 6PN',
          county: 'Greater London',
          country: 'United Kingdom',
          coordinates: { lat: 51.5255, lng: -0.0754 }
        },
        features: {
          bedrooms: 0,
          bathrooms: 2,
          receptions: 0,
          squareFootage: 2500,
          parking: 0,
          garden: false,
          balcony: false,
          garage: false
        },
        amenities: ['High Speed Internet', 'Meeting Rooms', 'Kitchen Facilities', 'Air Conditioning', '24/7 Access'],
        images: [
          {
            id: '1',
            url: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20office%20space%20shoreditch%20exposed%20brick%20open%20plan%20creative%20workspace&image_size=landscape_4_3',
            isPrimary: true,
            room: 'Office Space',
            order: 1
          }
        ],
        videos: [],
        energyRating: 'C',
        councilTax: 'Business Rates',
        yearBuilt: 1920,
        tenure: 'leasehold',
        leaseYears: 15,
        agent: {
          id: 'agent3',
          name: 'Emma Thompson',
          email: 'emma@propertymastersuk.com',
          phone: '+44 20 7345 6789'
        },
        valuation: {
          estimated: 0,
          confidence: 0,
          lastUpdated: '2024-01-05T00:00:00Z',
          comparables: []
        },
        analytics: {
          views: 156,
          enquiries: 9,
          viewings: 6,
          favorites: 14,
          daysOnMarket: 22
        },
        createdAt: '2023-12-20T00:00:00Z',
        updatedAt: '2024-01-05T00:00:00Z',
        featured: false,
        premium: false
      }
    ];

    const mockMarketData: MarketData = {
      averagePrice: 875000,
      priceChange: 3.2,
      averageDaysOnMarket: 28,
      totalListings: 1247,
      soldThisMonth: 89,
      pricePerSqFt: 650,
      demandIndex: 78,
      supplyIndex: 65
    };

    setProperties(mockProperties);
    setFilteredProperties(mockProperties);
    setMarketData(mockMarketData);
  }, []);

  // Filter properties based on search and filters
  useEffect(() => {
    let filtered = properties;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(property =>
        property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.address.street.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.address.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.address.postcode.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (filters.type) {
      filtered = filtered.filter(property => property.type === filters.type);
    }

    // Price filter
    if (filters.priceMin > 0) {
      filtered = filtered.filter(property => property.price >= filters.priceMin);
    }
    if (filters.priceMax > 0) {
      filtered = filtered.filter(property => property.price <= filters.priceMax);
    }

    // Bedrooms filter
    if (filters.bedrooms > 0) {
      filtered = filtered.filter(property => property.features.bedrooms >= filters.bedrooms);
    }

    // Bathrooms filter
    if (filters.bathrooms > 0) {
      filtered = filtered.filter(property => property.features.bathrooms >= filters.bathrooms);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue, bValue;
      switch (filters.sortBy) {
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        case 'date':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case 'size':
          aValue = a.features.squareFootage;
          bValue = b.features.squareFootage;
          break;
        default:
          aValue = a.price;
          bValue = b.price;
      }
      
      return filters.sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });

    setFilteredProperties(filtered);
  }, [properties, searchTerm, filters]);

  

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-GB').format(num);
  };

  const getPropertyTypeIcon = (type: string) => {
    switch (type) {
      case 'house': return <Home className="h-4 w-4" />;
      case 'apartment': return <Building className="h-4 w-4" />;
      case 'commercial': return <Building2 className="h-4 w-4" />;
      case 'land': return <TreePine className="h-4 w-4" />;
      default: return <Home className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'sold': return 'bg-blue-100 text-blue-800';
      case 'rented': return 'bg-purple-100 text-purple-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const PropertyCard = ({ property }: { property: Property }) => (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
      {/* Image */}
      <div className="relative h-48">
        <img
          src={property.images[0]?.url || '/placeholder-property.jpg'}
          alt={property.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 left-2 flex gap-2">
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(property.status)}`}>
            {property.status}
          </span>
          {property.featured && (
            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
              Featured
            </span>
          )}
          {property.premium && (
            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
              Premium
            </span>
          )}
        </div>
        <div className="absolute top-2 right-2 flex gap-1">
          <button className="p-1 bg-white/80 rounded-full hover:bg-white transition-colors">
            <Heart className="h-4 w-4 text-gray-600" />
          </button>
          <button className="p-1 bg-white/80 rounded-full hover:bg-white transition-colors">
            <Share2 className="h-4 w-4 text-gray-600" />
          </button>
        </div>
        <div className="absolute bottom-2 left-2">
          <span className="px-2 py-1 text-xs font-semibold rounded bg-black/70 text-white">
            {property.images.length} photos
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Price */}
        <div className="flex items-center justify-between mb-2">
          <div className="text-xl font-bold text-gray-900">
            {formatCurrency(property.price)}
            {property.priceType === 'rent' && <span className="text-sm font-normal text-gray-500">/month</span>}
          </div>
          <div className="flex items-center text-sm text-gray-500">
            {getPropertyTypeIcon(property.type)}
            <span className="ml-1 capitalize">{property.type}</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{property.title}</h3>

        {/* Address */}
        <div className="flex items-center text-sm text-gray-600 mb-3">
          <MapPin className="h-4 w-4 mr-1" />
          <span className="line-clamp-1">{property.address.street}, {property.address.city}</span>
        </div>

        {/* Features */}
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
          {property.features.bedrooms > 0 && (
            <div className="flex items-center">
              <Bed className="h-4 w-4 mr-1" />
              <span>{property.features.bedrooms}</span>
            </div>
          )}
          <div className="flex items-center">
            <Bath className="h-4 w-4 mr-1" />
            <span>{property.features.bathrooms}</span>
          </div>
          <div className="flex items-center">
            <Square className="h-4 w-4 mr-1" />
            <span>{formatNumber(property.features.squareFootage)} sq ft</span>
          </div>
          {property.features.parking > 0 && (
            <div className="flex items-center">
              <Car className="h-4 w-4 mr-1" />
              <span>{property.features.parking}</span>
            </div>
          )}
        </div>

        {/* Analytics */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <span>{property.analytics.views} views</span>
          <span>{property.analytics.enquiries} enquiries</span>
          <span>{property.analytics.daysOnMarket} days on market</span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedProperty(property)}
            className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            View Details
          </button>
          <button className="px-3 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
            <Edit className="h-4 w-4" />
          </button>
          <button className="px-3 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  const PropertyList = ({ property }: { property: Property }) => (
    <div className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow">
      <div className="flex gap-4">
        {/* Image */}
        <div className="relative w-48 h-32 flex-shrink-0">
          <img
            src={property.images[0]?.url || '/placeholder-property.jpg'}
            alt={property.title}
            className="w-full h-full object-cover rounded-lg"
          />
          <div className="absolute top-2 left-2">
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(property.status)}`}>
              {property.status}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{property.title}</h3>
              <div className="flex items-center text-sm text-gray-600 mb-2">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{property.address.street}, {property.address.city}, {property.address.postcode}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-gray-900">
                {formatCurrency(property.price)}
                {property.priceType === 'rent' && <span className="text-sm font-normal text-gray-500">/month</span>}
              </div>
              <div className="text-sm text-gray-500">
                {formatCurrency(Math.round(property.price / property.features.squareFootage))}/sq ft
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{property.description}</p>

          <div className="flex items-center gap-6 text-sm text-gray-600 mb-3">
            {property.features.bedrooms > 0 && (
              <div className="flex items-center">
                <Bed className="h-4 w-4 mr-1" />
                <span>{property.features.bedrooms} beds</span>
              </div>
            )}
            <div className="flex items-center">
              <Bath className="h-4 w-4 mr-1" />
              <span>{property.features.bathrooms} baths</span>
            </div>
            <div className="flex items-center">
              <Square className="h-4 w-4 mr-1" />
              <span>{formatNumber(property.features.squareFootage)} sq ft</span>
            </div>
            {property.features.parking > 0 && (
              <div className="flex items-center">
                <Car className="h-4 w-4 mr-1" />
                <span>{property.features.parking} parking</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>{property.analytics.views} views</span>
              <span>{property.analytics.enquiries} enquiries</span>
              <span>{property.analytics.daysOnMarket} days on market</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedProperty(property)}
                className="px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors"
              >
                View Details
              </button>
              <button className="px-3 py-1 border border-gray-300 text-gray-700 text-sm font-medium rounded hover:bg-gray-50 transition-colors">
                Edit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const PropertiesTab = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Properties</h2>
          <p className="text-gray-600">Manage your property listings</p>
        </div>
        <button
          onClick={() => setShowPropertyModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Property
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search properties..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Filter className="h-4 w-4" />
          Filters
        </button>
        <div className="flex border border-gray-300 rounded-lg overflow-hidden">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
          >
            <div className="grid grid-cols-2 gap-1 w-4 h-4">
              <div className="bg-current rounded-sm" />
              <div className="bg-current rounded-sm" />
              <div className="bg-current rounded-sm" />
              <div className="bg-current rounded-sm" />
            </div>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
          >
            <div className="space-y-1 w-4 h-4">
              <div className="bg-current h-1 rounded" />
              <div className="bg-current h-1 rounded" />
              <div className="bg-current h-1 rounded" />
            </div>
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`px-3 py-2 ${viewMode === 'map' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
          >
            <Map className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white p-4 rounded-lg border">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Types</option>
                <option value="house">House</option>
                <option value="apartment">Apartment</option>
                <option value="commercial">Commercial</option>
                <option value="land">Land</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Price</label>
              <input
                type="number"
                value={filters.priceMin || ''}
                onChange={(e) => setFilters({ ...filters, priceMin: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Price</label>
              <input
                type="number"
                value={filters.priceMax || ''}
                onChange={(e) => setFilters({ ...filters, priceMax: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="No limit"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
              <select
                value={filters.bedrooms}
                onChange={(e) => setFilters({ ...filters, bedrooms: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={0}>Any</option>
                <option value={1}>1+</option>
                <option value={2}>2+</option>
                <option value={3}>3+</option>
                <option value={4}>4+</option>
                <option value={5}>5+</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
              <select
                value={filters.bathrooms}
                onChange={(e) => setFilters({ ...filters, bathrooms: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={0}>Any</option>
                <option value={1}>1+</option>
                <option value={2}>2+</option>
                <option value={3}>3+</option>
                <option value={4}>4+</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="price">Price</option>
                <option value="date">Date Added</option>
                <option value="size">Size</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {filteredProperties.length} of {properties.length} properties
        </p>
        <select
          value={`${filters.sortBy}-${filters.sortOrder}`}
          onChange={(e) => {
            const [sortBy, sortOrder] = e.target.value.split('-');
            setFilters({ ...filters, sortBy, sortOrder: sortOrder as 'asc' | 'desc' });
          }}
          className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="price-desc">Price: High to Low</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="date-desc">Newest First</option>
          <option value="date-asc">Oldest First</option>
          <option value="size-desc">Largest First</option>
          <option value="size-asc">Smallest First</option>
        </select>
      </div>

      {/* Properties Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      ) : viewMode === 'list' ? (
        <div className="space-y-4">
          {filteredProperties.map((property) => (
            <PropertyList key={property.id} property={property} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg border h-96 flex items-center justify-center">
          <div className="text-center">
            <Map className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">Interactive map view coming soon</p>
          </div>
        </div>
      )}
    </div>
  );

  const SearchTab = () => (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">Advanced Search</h2>
        <p className="text-gray-600">Find properties with detailed search criteria</p>
      </div>

      {/* Search Form */}
      <div className="bg-white p-6 rounded-lg border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Location Search */}
          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Enter postcode, area, or address..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Property Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
            <select className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="">All Types</option>
              <option value="house">Houses</option>
              <option value="apartment">Apartments</option>
              <option value="commercial">Commercial</option>
              <option value="land">Land</option>
            </select>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                className="flex-1 px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <input
                type="number"
                placeholder="Max"
                className="flex-1 px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Bedrooms */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Bedrooms</label>
            <select className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="">Any</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
              <option value="5">5+</option>
            </select>
          </div>

          {/* Features */}
          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">Features</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                'Garden', 'Parking', 'Garage', 'Balcony',
                'Central Heating', 'Double Glazing', 'Fireplace', 'Swimming Pool',
                'Gym', 'Concierge', 'Lift', 'Air Conditioning'
              ].map((feature) => (
                <label key={feature} className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">{feature}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Search Button */}
          <div className="md:col-span-3">
            <button className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
              Search Properties
            </button>
          </div>
        </div>
      </div>

      {/* Saved Searches */}
      <div className="bg-white rounded-lg border">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Saved Searches</h3>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            {[
              { name: '3-bed houses in Hampstead under £1.5M', count: 12, alerts: true },
              { name: '2-bed apartments in Canary Wharf', count: 8, alerts: false },
              { name: 'Commercial spaces in Shoreditch', count: 5, alerts: true }
            ].map((search, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{search.name}</p>
                  <p className="text-sm text-gray-500">{search.count} properties found</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    search.alerts ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {search.alerts ? 'Alerts On' : 'Alerts Off'}
                  </span>
                  <button className="text-blue-600 hover:text-blue-700">
                    <Eye className="h-4 w-4" />
                  </button>
                  <button className="text-gray-600 hover:text-gray-700">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button className="text-red-600 hover:text-red-700">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const ValuationTab = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Property Valuation</h2>
          <p className="text-gray-600">Get automated property valuations using market data</p>
        </div>
        <button
          onClick={() => setShowValuationModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Calculator className="h-4 w-4" />
          New Valuation
        </button>
      </div>

      {/* Valuation Tool */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Valuation Tool</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Property Address</label>
              <input
                type="text"
                placeholder="Enter full address..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5+</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4+</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Square Footage</label>
              <input
                type="number"
                placeholder="e.g. 1200"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
              Get Valuation
            </button>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-3">Estimated Value</h4>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">£875,000</div>
              <div className="text-sm text-gray-600 mb-4">Confidence: 85%</div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Lower estimate:</span>
                  <span className="font-medium">£825,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Upper estimate:</span>
                  <span className="font-medium">£925,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Price per sq ft:</span>
                  <span className="font-medium">£729</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Valuations */}
      <div className="bg-white rounded-lg border">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Valuations</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estimated Value</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Confidence</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {properties.map((property) => (
                <tr key={property.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{property.title}</div>
                      <div className="text-sm text-gray-500">{property.address.street}, {property.address.city}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{formatCurrency(property.valuation.estimated)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`text-sm font-medium ${
                        property.valuation.confidence >= 80 ? 'text-green-600' :
                        property.valuation.confidence >= 60 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {property.valuation.confidence}%
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(property.valuation.lastUpdated).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="text-green-600 hover:text-green-900">
                        <RefreshCw className="h-4 w-4" />
                      </button>
                      <button className="text-gray-600 hover:text-gray-900">
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const AnalyticsTab = () => (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">Property Analytics</h2>
        <p className="text-gray-600">Track performance and insights for your properties</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Properties</p>
              <p className="text-2xl font-bold text-gray-900">{properties.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Home className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-600 font-medium">+2</span>
            <span className="text-gray-500 ml-1">this month</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Views</p>
              <p className="text-2xl font-bold text-gray-900">
                {properties.reduce((sum, p) => sum + p.analytics.views, 0)}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Eye className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-600 font-medium">+15%</span>
            <span className="text-gray-500 ml-1">this week</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Enquiries</p>
              <p className="text-2xl font-bold text-gray-900">
                {properties.reduce((sum, p) => sum + p.analytics.enquiries, 0)}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <Mail className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-600 font-medium">+8%</span>
            <span className="text-gray-500 ml-1">this week</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg. Days on Market</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(properties.reduce((sum, p) => sum + p.analytics.daysOnMarket, 0) / properties.length)}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
            <span className="text-red-600 font-medium">-3 days</span>
            <span className="text-gray-500 ml-1">this month</span>
          </div>
        </div>
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Views Over Time</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Chart visualization coming soon</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Performance</h3>
          <div className="space-y-4">
            {properties.slice(0, 3).map((property) => (
              <div key={property.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium text-gray-900">{property.title}</p>
                  <p className="text-sm text-gray-500">{property.analytics.views} views</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{property.analytics.enquiries} enquiries</p>
                  <p className="text-xs text-gray-500">{((property.analytics.enquiries / property.analytics.views) * 100).toFixed(1)}% conversion</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const MarketTab = () => (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">Market Analysis</h2>
        <p className="text-gray-600">Local market trends and insights</p>
      </div>

      {/* Market Overview */}
      {marketData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Price</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(marketData.averagePrice)}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <PoundSterling className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600 font-medium">+{marketData.priceChange}%</span>
              <span className="text-gray-500 ml-1">this year</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Price per Sq Ft</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(marketData.pricePerSqFt)}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Square className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Demand Index</p>
                <p className="text-2xl font-bold text-gray-900">{marketData.demandIndex}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Supply Index</p>
                <p className="text-2xl font-bold text-gray-900">{marketData.supplyIndex}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Market Trends */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Price Trends</h3>
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
          <div className="text-center">
            <LineChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">Market trend chart coming soon</p>
          </div>
        </div>
      </div>

      {/* Area Comparison */}
      <div className="bg-white rounded-lg border">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Area Comparison</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Area</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price/Sq Ft</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Change</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Listings</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[
                { area: 'Hampstead', avgPrice: 1250000, pricePerSqFt: 675, change: 3.2, listings: 45 },
                { area: 'Canary Wharf', avgPrice: 850000, pricePerSqFt: 708, change: 1.8, listings: 78 },
                { area: 'Shoreditch', avgPrice: 650000, pricePerSqFt: 520, change: 4.1, listings: 92 },
                { area: 'Kensington', avgPrice: 1850000, pricePerSqFt: 925, change: 2.5, listings: 23 }
              ].map((area, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{area.area}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(area.avgPrice)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(area.pricePerSqFt)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-sm font-medium text-green-600">+{area.change}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{area.listings}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Home className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Property Management</h1>
                <p className="text-sm text-gray-600">Manage properties, search, valuations & analytics</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-1.5"></div>
                System Active
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'properties', label: 'Properties', icon: Home },
              { id: 'search', label: 'Advanced Search', icon: Search },
              { id: 'valuation', label: 'Valuation', icon: Calculator },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
              { id: 'market', label: 'Market Analysis', icon: TrendingUp }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'properties' && <PropertiesTab />}
        {activeTab === 'search' && <SearchTab />}
        {activeTab === 'valuation' && <ValuationTab />}
        {activeTab === 'analytics' && <AnalyticsTab />}
        {activeTab === 'market' && <MarketTab />}
      </div>

      {/* Property Details Modal */}
      {selectedProperty && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">{selectedProperty.title}</h2>
                <button
                  onClick={() => setSelectedProperty(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <img
                    src={selectedProperty.images[0]?.url || '/placeholder-property.jpg'}
                    alt={selectedProperty.title}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Property Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Price:</span>
                        <span className="font-medium">{formatCurrency(selectedProperty.price)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Type:</span>
                        <span className="font-medium capitalize">{selectedProperty.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedProperty.status)}`}>
                          {selectedProperty.status}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Bedrooms:</span>
                        <span className="font-medium">{selectedProperty.features.bedrooms}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Bathrooms:</span>
                        <span className="font-medium">{selectedProperty.features.bathrooms}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Square Footage:</span>
                        <span className="font-medium">{formatNumber(selectedProperty.features.squareFootage)} sq ft</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Performance</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Views:</span>
                        <span className="font-medium">{selectedProperty.analytics.views}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Enquiries:</span>
                        <span className="font-medium">{selectedProperty.analytics.enquiries}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Days on Market:</span>
                        <span className="font-medium">{selectedProperty.analytics.daysOnMarket}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600">{selectedProperty.description}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyManagement;