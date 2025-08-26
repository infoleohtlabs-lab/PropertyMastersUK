import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  Building2,
  Users,
  TrendingUp,
  Shield,
  Clock,
  Star,
  ArrowRight,
  Play,
  CheckCircle,
  Phone,
  Mail,
  ChevronRight,
  Bed,
  Bath,
  Square,
  Home,
  Eye,
  Calculator,
  FileText,
  Award,
  BarChart3,
  PoundSterling,
  Calendar,
  ChevronDown,
  Filter,
  Heart,
  Share2,
  Key,
  Building,
  UserCheck,
  Target,
  Settings,
  Database,
  Globe,
  Brain,
  Bell
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { showToast } from '../components/ui/Toast';
import { usePropertyStore } from '../stores/propertyStore';
import { formatCurrency } from '../utils';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { setSearchFilters } = usePropertyStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [email, setEmail] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [searchType, setSearchType] = useState('sale');
  const [postcodeResults, setPostcodeResults] = useState<string[]>([]);
  const [showPostcodeDropdown, setShowPostcodeDropdown] = useState(false);
  const [marketStats, setMarketStats] = useState({
    averagePrice: 425000,
    priceChange: 5.2,
    averageRent: 1850,
    rentYield: 5.1,
    propertiesSold: 12450,
    daysOnMarket: 28
  });

  // Mock UK postcode autocomplete
  const ukPostcodes = [
    'SW1A 1AA', 'W1A 0AX', 'M1 1AA', 'B33 8TH', 'LS1 1UR',
    'E1 6AN', 'SE1 9SG', 'N1 9GU', 'EC1A 1BB', 'WC2N 5DU'
  ];

  useEffect(() => {
    if (searchLocation.length > 2) {
      const filtered = ukPostcodes.filter(postcode => 
        postcode.toLowerCase().includes(searchLocation.toLowerCase())
      );
      setPostcodeResults(filtered.slice(0, 5));
      setShowPostcodeDropdown(filtered.length > 0);
    } else {
      setShowPostcodeDropdown(false);
    }
  }, [searchLocation]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchLocation.trim()) {
      showToast.error('Please enter a location to search');
      return;
    }

    setSearchFilters({
      location: searchLocation
    });
    navigate('/properties');
  };

  const selectPostcode = (postcode: string) => {
    setSearchLocation(postcode);
    setShowPostcodeDropdown(false);
  };

  const handleNewsletterSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      showToast.error('Please enter your email address');
      return;
    }
    showToast.success('Thank you for subscribing to our newsletter!');
    setEmail('');
  };

  const features = [
    {
      icon: Search,
      title: 'Smart Property Search',
      description: 'Advanced AI-powered search with intelligent filters to find your perfect property match'
    },
    {
      icon: Users,
      title: 'Multi-Tenant Platform',
      description: 'Seamlessly connects agents, landlords, tenants, buyers, and sellers in one ecosystem'
    },
    {
      icon: TrendingUp,
      title: 'Market Analytics',
      description: 'Real-time market data, price trends, and investment insights powered by big data'
    },
    {
      icon: Shield,
      title: 'Secure & Trusted',
      description: 'Bank-level security with verified listings, background checks, and trusted agents'
    },
    {
      icon: Clock,
      title: '24/7 Support',
      description: 'Round-the-clock customer support with dedicated account managers'
    },
    {
      icon: Building2,
      title: 'VR Property Tours',
      description: 'Immersive 3D virtual reality tours to explore properties from anywhere in the world'
    }
  ];

  const stats = [
    { label: 'Active Properties', value: '50,000+', description: 'Verified listings across the UK' },
    { label: 'Happy Customers', value: '100,000+', description: 'Satisfied users and growing' },
    { label: 'Successful Deals', value: '25,000+', description: 'Properties sold and rented' },
    { label: 'Partner Agents', value: '2,500+', description: 'Certified estate agents' }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'First-time Buyer, London',
      content: 'PropertyMasters UK made finding my first home in London so easy. The virtual tours and postcode search saved me countless hours of travel. The market analysis helped me understand if I was getting a fair price.',
      rating: 5,
      image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20headshot%20of%20young%20british%20woman%20smiling%20business%20attire%20modern%20office&image_size=square',
      verified: true,
      propertyType: 'Flat Purchase'
    },
    {
      name: 'David Chen',
      role: 'Property Investor, Manchester',
      content: 'The market analysis tools are incredible. I\'ve made better investment decisions thanks to the detailed insights and Land Registry integration. ROI calculations are spot-on.',
      rating: 5,
      image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20headshot%20of%20middle%20aged%20asian%20man%20business%20suit%20confident&image_size=square',
      verified: true,
      propertyType: 'Investment Portfolio'
    },
    {
      name: 'Emma Thompson',
      role: 'Landlord, Birmingham',
      content: 'Managing my 12-property portfolio has never been easier. The tenant management, maintenance tracking, and financial reporting features are outstanding. GDPR compliance gives me peace of mind.',
      rating: 5,
      image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20headshot%20of%20mature%20british%20woman%20confident%20smile%20business%20attire&image_size=square',
      verified: true,
      propertyType: 'Rental Portfolio'
    },
    {
      name: 'James Mitchell',
      role: 'Estate Agent, Edinburgh',
      content: 'As an estate agent, this platform has revolutionized how I work with clients. The booking system, virtual tours, and client management tools have increased my efficiency by 40%.',
      rating: 5,
      image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20headshot%20of%20scottish%20man%20suit%20tie%20estate%20agent%20friendly&image_size=square',
      verified: true,
      propertyType: 'Professional Services'
    }
  ];

  const featuredProperties = [
    {
      id: '1',
      title: 'Luxury Penthouse with Thames Views',
      location: 'Canary Wharf, London',
      postcode: 'E14 5AB',
      price: 1250000,
      type: 'sale',
      bedrooms: 3,
      bathrooms: 2,
      sqft: 1800,
      epcRating: 'A',
      tenure: 'Leasehold',
      yearBuilt: 2020,
      councilTax: 'Band H',
      image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=luxury%20penthouse%20interior%20with%20floor%20to%20ceiling%20windows%20overlooking%20thames%20river%2C%20modern%20furniture%2C%20marble%20finishes&image_size=landscape_4_3',
      features: ['Thames Views', 'Concierge', 'Gym', 'Roof Terrace', 'Parking']
    },
    {
      id: '2',
      title: 'Victorian Townhouse',
      location: 'Kensington, London',
      postcode: 'SW7 2AZ',
      price: 3500,
      type: 'rent',
      bedrooms: 4,
      bathrooms: 3,
      sqft: 2200,
      epcRating: 'C',
      tenure: 'Freehold',
      yearBuilt: 1890,
      councilTax: 'Band G',
      image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=elegant%20victorian%20townhouse%20exterior%20with%20white%20facade%2C%20black%20railings%2C%20traditional%20london%20architecture&image_size=landscape_4_3',
      features: ['Period Features', 'Garden', 'High Ceilings', 'Original Features']
    },
    {
      id: '3',
      title: 'Modern Riverside Apartment',
      location: 'Shoreditch, London',
      postcode: 'E2 8HD',
      price: 2200,
      type: 'rent',
      bedrooms: 2,
      bathrooms: 2,
      sqft: 950,
      epcRating: 'B',
      tenure: 'Leasehold',
      yearBuilt: 2018,
      councilTax: 'Band E',
      image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20apartment%20with%20exposed%20brick%20walls%2C%20industrial%20design%2C%20river%20views%2C%20contemporary%20kitchen&image_size=landscape_4_3',
      features: ['River Views', 'Balcony', 'Modern Kitchen', 'Near Transport']
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Ocean Breeze Theme */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Ocean Breeze Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#5ab1d8] via-[#4a9bc7] to-[#3a85b6]" />
          <div className="absolute inset-0 opacity-20">
            <img
              src="https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=beautiful%20modern%20UK%20properties%20waterfront%20homes%20ocean%20breeze%20style%20clean%20architecture%20blue%20sky&image_size=landscape_16_9"
              alt="Beautiful UK Properties"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#5ab1d8]/30 to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center text-white max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Find Your Dream
            <span className="block text-white drop-shadow-lg">Property in the UK</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed drop-shadow-md">
            The UK's most advanced property platform powered by AI, featuring virtual tours, 
            real-time market analytics, and seamless connections between all property stakeholders.
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-2xl max-w-6xl mx-auto mb-12">
            <div className="mb-6">
              <h3 className="text-2xl font-semibold text-gray-900 mb-2 text-center">
                Find Your Perfect Property
              </h3>
              <p className="text-gray-600 text-center">
                Search thousands of properties across the UK with advanced filters
              </p>
            </div>
            
            {/* Rent/Sale Toggle */}
            <div className="mb-6">
              <div className="flex justify-center">
                <div className="bg-gray-100 p-1 rounded-xl inline-flex">
                  <button
                    type="button"
                    onClick={() => setSearchType('sale')}
                    className={`px-8 py-3 rounded-lg font-semibold transition-all ${
                      searchType === 'sale'
                        ? 'bg-[#5ab1d8] text-white shadow-md'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Home className="h-5 w-5 mr-2 inline" />
                    Buy
                  </button>
                  <button
                    type="button"
                    onClick={() => setSearchType('rent')}
                    className={`px-8 py-3 rounded-lg font-semibold transition-all ${
                      searchType === 'rent'
                        ? 'bg-[#5ab1d8] text-white shadow-md'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Key className="h-5 w-5 mr-2 inline" />
                    Rent
                  </button>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="lg:col-span-1">
                  <Input
                    placeholder="Keywords, area..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    leftIcon={<Search className="h-5 w-5" />}
                    className="border-gray-300 h-12 text-base"
                  />
                </div>
                <div className="lg:col-span-1 relative">
                  <Input
                    placeholder="Postcode or area"
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    leftIcon={<MapPin className="h-5 w-5" />}
                    className="border-gray-300 h-12 text-base"
                    required
                  />
                  {showPostcodeDropdown && (
                    <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-md shadow-lg z-10 mt-1">
                      {postcodeResults.map((postcode, index) => (
                        <button
                          key={index}
                          type="button"
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                          onClick={() => selectPostcode(postcode)}
                        >
                          {postcode}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="lg:col-span-1">
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="w-full h-12 px-3 border border-gray-300 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Property Type</option>
                    <option value="house">House</option>
                    <option value="flat">Flat/Apartment</option>
                    <option value="bungalow">Bungalow</option>
                    <option value="commercial">Commercial</option>
                  </select>
                </div>
                <div className="lg:col-span-1">
                  <select
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value)}
                    className="w-full h-12 px-3 border border-gray-300 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Price Range</option>
                    <option value="0-200000">Up to £200k</option>
                    <option value="200000-400000">£200k - £400k</option>
                    <option value="400000-600000">£400k - £600k</option>
                    <option value="600000-1000000">£600k - £1M</option>
                    <option value="1000000+">£1M+</option>
                  </select>
                </div>
                <div className="lg:col-span-1">
                  <Button type="submit" className="w-full h-12 text-base font-semibold bg-[#5ab1d8] hover:bg-[#4a9bc7] border-[#5ab1d8]">
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </div>
              </div>
            </div>
          </form>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8 py-4 bg-white text-[#5ab1d8] hover:bg-gray-50 border-white">
              <Play className="h-5 w-5 mr-2" />
              Take Virtual Tour
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-4 bg-white/10 border-white/50 text-white hover:bg-white/20">
              <TrendingUp className="h-5 w-5 mr-2" />
              View Market Data
            </Button>
          </div>
        </div>
      </section>

      {/* UK Market Statistics Dashboard */}
      <section className="py-16 bg-gradient-to-r from-[#5ab1d8]/10 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              UK Property Market Insights
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Real-time data from across the UK property market, powered by Land Registry and market analysis
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow border-l-4 border-[#5ab1d8]">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-[#5ab1d8]/10 rounded-lg p-3">
                  <PoundSterling className="h-8 w-8 text-[#5ab1d8]" />
                </div>
                <span className="text-sm font-medium text-[#5ab1d8] bg-[#5ab1d8]/10 px-2 py-1 rounded-full">
                  +{marketStats.priceChange}%
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Average Property Price</h3>
              <p className="text-3xl font-bold text-gray-900 mb-1">£{marketStats.averagePrice.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Year-on-year growth</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow border-l-4 border-[#5ab1d8]">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-[#5ab1d8]/10 rounded-lg p-3">
                  <Home className="h-8 w-8 text-[#5ab1d8]" />
                </div>
                <span className="text-sm font-medium text-[#5ab1d8] bg-[#5ab1d8]/10 px-2 py-1 rounded-full">
                  {marketStats.rentYield}%
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Average Monthly Rent</h3>
              <p className="text-3xl font-bold text-gray-900 mb-1">£{marketStats.averageRent.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Rental yield average</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow border-l-4 border-[#5ab1d8]">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-[#5ab1d8]/10 rounded-lg p-3">
                  <BarChart3 className="h-8 w-8 text-[#5ab1d8]" />
                </div>
                <span className="text-sm font-medium text-[#5ab1d8] bg-[#5ab1d8]/10 px-2 py-1 rounded-full">
                  {marketStats.daysOnMarket} days
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Properties Sold</h3>
              <p className="text-3xl font-bold text-gray-900 mb-1">{marketStats.propertiesSold.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Average time on market</p>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <Button size="lg" variant="outline" className="text-lg px-8 py-4 border-[#5ab1d8] text-[#5ab1d8] hover:bg-[#5ab1d8] hover:text-white">
              <BarChart3 className="h-5 w-5 mr-2" />
              View Detailed Market Analysis
            </Button>
          </div>
        </div>
      </section>

      {/* Comprehensive Services Showcase */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Complete Property Management Platform
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to manage, market, and grow your property business in one powerful platform
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Multi-tenant Property Management */}
            <div className="group bg-gradient-to-br from-[#5ab1d8]/5 to-white rounded-2xl p-8 hover:shadow-xl transition-all duration-300 border border-[#5ab1d8]/10">
              <div className="bg-[#5ab1d8] rounded-xl p-4 w-16 h-16 mb-6 group-hover:scale-110 transition-transform">
                <Building className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Multi-Tenant Management</h3>
              <p className="text-gray-600 mb-4">Comprehensive property portfolio management with tenant screening, lease management, and automated rent collection.</p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Tenant screening & verification</li>
                <li>• Automated rent collection</li>
                <li>• Lease management & renewals</li>
              </ul>
            </div>

            {/* CRM and Lead Management */}
            <div className="group bg-gradient-to-br from-[#5ab1d8]/5 to-white rounded-2xl p-8 hover:shadow-xl transition-all duration-300 border border-[#5ab1d8]/10">
              <div className="bg-[#5ab1d8] rounded-xl p-4 w-16 h-16 mb-6 group-hover:scale-110 transition-transform">
                <UserCheck className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">CRM & Lead Management</h3>
              <p className="text-gray-600 mb-4">Advanced customer relationship management with lead tracking, automated follow-ups, and conversion analytics.</p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Lead capture & scoring</li>
                <li>• Automated follow-up sequences</li>
                <li>• Customer journey tracking</li>
              </ul>
            </div>

            {/* Campaign Management */}
            <div className="group bg-gradient-to-br from-[#5ab1d8]/5 to-white rounded-2xl p-8 hover:shadow-xl transition-all duration-300 border border-[#5ab1d8]/10">
              <div className="bg-[#5ab1d8] rounded-xl p-4 w-16 h-16 mb-6 group-hover:scale-110 transition-transform">
                <Target className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Campaign Management</h3>
              <p className="text-gray-600 mb-4">Targeted marketing campaigns with email automation, social media integration, and performance tracking.</p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Email marketing automation</li>
                <li>• Social media campaigns</li>
                <li>• ROI tracking & analytics</li>
              </ul>
            </div>

            {/* Booking & Scheduling */}
            <div className="group bg-gradient-to-br from-[#5ab1d8]/5 to-white rounded-2xl p-8 hover:shadow-xl transition-all duration-300 border border-[#5ab1d8]/10">
              <div className="bg-[#5ab1d8] rounded-xl p-4 w-16 h-16 mb-6 group-hover:scale-110 transition-transform">
                <Calendar className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Booking & Scheduling</h3>
              <p className="text-gray-600 mb-4">Seamless appointment booking for viewings, inspections, and maintenance with automated reminders.</p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Online booking system</li>
                <li>• Automated reminders</li>
                <li>• Calendar synchronization</li>
              </ul>
            </div>

            {/* Financial Analytics */}
            <div className="group bg-gradient-to-br from-[#5ab1d8]/5 to-white rounded-2xl p-8 hover:shadow-xl transition-all duration-300 border border-[#5ab1d8]/10">
              <div className="bg-[#5ab1d8] rounded-xl p-4 w-16 h-16 mb-6 group-hover:scale-110 transition-transform">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Financial Analytics</h3>
              <p className="text-gray-600 mb-4">Comprehensive financial reporting with profit analysis, expense tracking, and tax preparation tools.</p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Profit & loss reporting</li>
                <li>• Expense categorization</li>
                <li>• Tax preparation assistance</li>
              </ul>
            </div>

            {/* Maintenance Management */}
            <div className="group bg-gradient-to-br from-[#5ab1d8]/5 to-white rounded-2xl p-8 hover:shadow-xl transition-all duration-300 border border-[#5ab1d8]/10">
              <div className="bg-[#5ab1d8] rounded-xl p-4 w-16 h-16 mb-6 group-hover:scale-110 transition-transform">
                <Settings className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Maintenance Management</h3>
              <p className="text-gray-600 mb-4">Streamlined maintenance requests, contractor management, and preventive maintenance scheduling.</p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Work order management</li>
                <li>• Contractor network</li>
                <li>• Preventive maintenance</li>
              </ul>
            </div>

            {/* GDPR Compliance */}
            <div className="group bg-gradient-to-br from-[#5ab1d8]/5 to-white rounded-2xl p-8 hover:shadow-xl transition-all duration-300 border border-[#5ab1d8]/10">
              <div className="bg-[#5ab1d8] rounded-xl p-4 w-16 h-16 mb-6 group-hover:scale-110 transition-transform">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">GDPR Compliance</h3>
              <p className="text-gray-600 mb-4">Built-in GDPR compliance tools with data protection, consent management, and audit trails.</p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Data protection controls</li>
                <li>• Consent management</li>
                <li>• Compliance reporting</li>
              </ul>
            </div>

            {/* UK Integrations */}
            <div className="group bg-gradient-to-br from-[#5ab1d8]/5 to-white rounded-2xl p-8 hover:shadow-xl transition-all duration-300 border border-[#5ab1d8]/10">
              <div className="bg-[#5ab1d8] rounded-xl p-4 w-16 h-16 mb-6 group-hover:scale-110 transition-transform">
                <Globe className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">UK-Specific Integrations</h3>
              <p className="text-gray-600 mb-4">Direct integration with Land Registry, Rightmove, Zoopla, and other UK property platforms.</p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Land Registry integration</li>
                <li>• Property portal sync</li>
                <li>• Market data feeds</li>
              </ul>
            </div>

            {/* AI-Powered Features */}
            <div className="group bg-gradient-to-br from-[#5ab1d8]/5 to-white rounded-2xl p-8 hover:shadow-xl transition-all duration-300 border border-[#5ab1d8]/10">
              <div className="bg-[#5ab1d8] rounded-xl p-4 w-16 h-16 mb-6 group-hover:scale-110 transition-transform">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">AI-Powered Features</h3>
              <p className="text-gray-600 mb-4">Advanced AI for property valuation, market predictions, and automated virtual tours.</p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• AI property valuation</li>
                <li>• Market trend analysis</li>
                <li>• Virtual tour generation</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-16 text-center">
            <Button size="lg" className="text-lg px-12 py-4 bg-[#5ab1d8] hover:bg-[#4a9bc7] border-[#5ab1d8]">
              <ArrowRight className="h-5 w-5 mr-2" />
              Explore All Features
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose PropertyMasters UK?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the future of property search with our cutting-edge technology and comprehensive platform.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                <div className="bg-blue-100 rounded-lg p-3 w-fit mb-6">
                  <feature.icon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Trusted by Thousands
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Join the growing community of property professionals and clients who trust PropertyMasters UK.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-xl font-semibold text-blue-100 mb-1">
                  {stat.label}
                </div>
                <div className="text-blue-200">
                  {stat.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              What Our Clients Say
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Real stories from real people who found their perfect property with PropertyMasters UK.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  {testimonial.verified && (
                    <div className="flex items-center text-green-600 text-xs font-medium">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Verified
                    </div>
                  )}
                </div>
                <p className="text-gray-700 mb-4 leading-relaxed text-sm">
                  "{testimonial.content}"
                </p>
                <div className="border-t pt-4">
                  <div className="flex items-center mb-2">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-10 h-10 rounded-full mr-3"
                    />
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">
                        {testimonial.name}
                      </div>
                      <div className="text-gray-600 text-xs">
                        {testimonial.role}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full inline-block">
                    {testimonial.propertyType}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Featured Properties
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover some of our most popular and exclusive properties available right now.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredProperties.map((property) => (
              <div key={property.id} className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                <div className="relative">
                  <img
                    src={property.image}
                    alt={property.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      property.type === 'sale' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      For {property.type === 'sale' ? 'Sale' : 'Rent'}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4 flex space-x-2">
                    <button className="bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors">
                      <Heart className="h-4 w-4 text-gray-600" />
                    </button>
                    <button className="bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors">
                      <Share2 className="h-4 w-4 text-gray-600" />
                    </button>
                  </div>
                  <div className="absolute bottom-4 left-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium text-white ${
                      property.epcRating === 'A' ? 'bg-green-600' :
                      property.epcRating === 'B' ? 'bg-green-500' :
                      property.epcRating === 'C' ? 'bg-yellow-500' : 'bg-orange-500'
                    }`}>
                      EPC {property.epcRating}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl font-bold text-gray-900">
                      £{property.price.toLocaleString()}
                      {property.type === 'rent' && <span className="text-sm text-gray-600">/month</span>}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {property.title}
                  </h3>
                  <p className="text-gray-600 mb-2 flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {property.location}
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    {property.postcode} • {property.tenure} • Built {property.yearBuilt}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <span className="flex items-center">
                      <Bed className="h-4 w-4 mr-1" />
                      {property.bedrooms} beds
                    </span>
                    <span className="flex items-center">
                      <Bath className="h-4 w-4 mr-1" />
                      {property.bathrooms} baths
                    </span>
                    <span className="flex items-center">
                      <Square className="h-4 w-4 mr-1" />
                      {property.sqft} sqft
                    </span>
                  </div>
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {property.features.slice(0, 3).map((feature, index) => (
                        <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          {feature}
                        </span>
                      ))}
                      {property.features.length > 3 && (
                        <span className="text-xs text-gray-500">+{property.features.length - 3} more</span>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button className="flex-1">
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                    <Button variant="outline" size="sm">
                      <Calculator className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Find Your Perfect Property?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who found their dream homes through PropertyMasters UK.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="outline" className="text-lg px-8 py-4 bg-white text-blue-600 hover:bg-gray-100">
              Browse Properties
            </Button>
            <Button size="lg" className="text-lg px-8 py-4 bg-white text-blue-600 hover:bg-gray-100">
              Get Started Today
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                <Building2 className="h-8 w-8 text-blue-400" />
                <span className="text-xl font-bold">PropertyMasters UK</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                The UK's most advanced property platform, connecting all stakeholders in the property ecosystem.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">For Buyers &amp; Tenants</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/properties" className="hover:text-white transition-colors">Search Properties</Link></li>
                <li><Link to="/virtual-tours" className="hover:text-white transition-colors">Virtual Tours</Link></li>
                <li><Link to="/market-analysis" className="hover:text-white transition-colors">Market Analysis</Link></li>
                <li><Link to="/auth/tenant-login" className="hover:text-white transition-colors">Tenant Portal</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">For Professionals</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/auth/admin-login" className="hover:text-white transition-colors">Professional Login</Link></li>
                <li><Link to="/list-property" className="hover:text-white transition-colors">List Property</Link></li>
                <li><Link to="/agent-tools" className="hover:text-white transition-colors">Agent Tools</Link></li>
                <li><Link to="/analytics" className="hover:text-white transition-colors">Analytics Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 PropertyMasters UK. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;