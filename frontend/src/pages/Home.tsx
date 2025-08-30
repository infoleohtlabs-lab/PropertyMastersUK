import React, { useState } from 'react';
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
  CheckCircle
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { showToast } from '../components/ui/Toast';
import { usePropertyStore } from '../stores/propertyStore';
import { formatCurrency } from '../utils';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { setSearchFilters } = usePropertyStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLocation, setSearchLocation] = useState('');

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

  const features = [
    {
      icon: Search,
      title: 'Smart Property Search',
      description: 'Advanced filters and AI-powered recommendations to find your perfect property'
    },
    {
      icon: Users,
      title: 'Multi-Tenant Platform',
      description: 'Seamlessly connects agents, landlords, tenants, buyers, and sellers'
    },
    {
      icon: TrendingUp,
      title: 'Market Analytics',
      description: 'Real-time market data and insights to make informed decisions'
    },
    {
      icon: Shield,
      title: 'Secure & Trusted',
      description: 'Bank-level security with verified listings and trusted agents'
    },
    {
      icon: Clock,
      title: '24/7 Support',
      description: 'Round-the-clock customer support for all your property needs'
    },
    {
      icon: Building2,
      title: 'VR Property Tours',
      description: 'Immersive 3D virtual tours to explore properties from anywhere'
    }
  ];

  const stats = [
    { label: 'Active Properties', value: '50,000+' },
    { label: 'Registered Users', value: '100,000+' },
    { label: 'Successful Transactions', value: '25,000+' },
    { label: 'Partner Agents', value: '2,500+' }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'First-time Buyer',
      content: 'PropertyMasters UK made finding my first home incredibly easy. The VR tours saved me so much time!',
      rating: 5
    },
    {
      name: 'Michael Chen',
      role: 'Property Investor',
      content: 'The market analytics feature is outstanding. It helped me identify the best investment opportunities.',
      rating: 5
    },
    {
      name: 'Emma Williams',
      role: 'Estate Agent',
      content: 'As an agent, this platform has transformed how I work with clients. The tools are professional and efficient.',
      rating: 5
    }
  ];

  const featuredProperties = [
    {
      id: '1',
      title: 'Modern 2-Bed Apartment',
      location: 'Canary Wharf, London',
      price: 650000,
      type: 'sale',
      bedrooms: 2,
      bathrooms: 2,
      image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20luxury%20apartment%20interior%20with%20floor%20to%20ceiling%20windows%20overlooking%20london%20skyline%2C%20contemporary%20furniture%2C%20bright%20natural%20lighting&image_size=landscape_4_3'
    },
    {
      id: '2',
      title: 'Victorian Townhouse',
      location: 'Kensington, London',
      price: 2500,
      type: 'rent',
      bedrooms: 4,
      bathrooms: 3,
      image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=elegant%20victorian%20townhouse%20exterior%20with%20white%20facade%2C%20black%20railings%2C%20traditional%20london%20architecture%2C%20tree%20lined%20street&image_size=landscape_4_3'
    },
    {
      id: '3',
      title: 'Contemporary Studio',
      location: 'Shoreditch, London',
      price: 1800,
      type: 'rent',
      bedrooms: 1,
      bathrooms: 1,
      image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=stylish%20studio%20apartment%20with%20exposed%20brick%20walls%2C%20industrial%20design%2C%20modern%20kitchen%2C%20urban%20loft%20style&image_size=landscape_4_3'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative container-responsive py-24 lg:py-32">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Find Your Perfect
              <span className="block text-blue-300">Property in the UK</span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-3xl mx-auto">
              The UK's leading multi-tenant property platform connecting agents, landlords, 
              tenants, buyers, and sellers with cutting-edge technology.
            </p>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="max-w-4xl mx-auto">
              <div className="bg-white rounded-lg p-6 shadow-2xl">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-1">
                    <Input
                      placeholder="Property type, area, or keyword"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      leftIcon={<Search className="h-4 w-4" />}
                      className="border-gray-300"
                    />
                  </div>
                  <div className="md:col-span-1">
                    <Input
                      placeholder="Location (e.g., London, Manchester)"
                      value={searchLocation}
                      onChange={(e) => setSearchLocation(e.target.value)}
                      leftIcon={<MapPin className="h-4 w-4" />}
                      className="border-gray-300"
                      required
                    />
                  </div>
                  <div className="md:col-span-1">
                    <Button type="submit" className="w-full h-12">
                      Search Properties
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </form>

            {/* Quick Actions */}
            <div className="mt-12 flex flex-wrap justify-center gap-4">
              <Link to="/properties?type=sale">
                <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                  Buy Property
                </Button>
              </Link>
              <Link to="/properties?type=rent">
                <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                  Rent Property
                </Button>
              </Link>
              <Link to="/agents">
                <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                  Find Agents
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="container-responsive">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container-responsive">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose PropertyMasters UK?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're revolutionizing the UK property market with innovative technology 
              and comprehensive services for all your property needs.
            </p>
          </div>

          <div className="grid-responsive gap-responsive">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-20 bg-gray-50">
        <div className="container-responsive">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Featured Properties
            </h2>
            <p className="text-xl text-gray-600">
              Discover some of our most popular properties across the UK
            </p>
          </div>

          <div className="grid-responsive gap-responsive">
            {featuredProperties.map((property) => (
              <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-w-16 aspect-h-9">
                  <img
                    src={property.image}
                    alt={property.title}
                    className="w-full h-48 object-cover"
                  />
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{property.title}</h3>
                  <p className="text-gray-600 mb-4 flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {property.location}
                  </p>
                  <div className="flex justify-between items-center mb-4">
                    <div className="text-2xl font-bold text-blue-600">
                      {property.type === 'sale' 
                        ? formatCurrency(property.price)
                        : `${formatCurrency(property.price)}/month`
                      }
                    </div>
                    <div className="text-sm text-gray-500">
                      {property.bedrooms} bed • {property.bathrooms} bath
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/properties">
              <Button size="lg">
                View All Properties
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container-responsive">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Users Say
            </h2>
            <p className="text-xl text-gray-600">
              Join thousands of satisfied users who trust PropertyMasters UK
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-6">
                  <div className="flex justify-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-6 italic">
                    "{testimonial.content}"
                  </p>
                  <div>
                    <div className="font-semibold text-gray-900">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {testimonial.role}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join PropertyMasters UK today and experience the future of property search and management.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth/register">
              <Button size="lg" variant="outline" className="bg-white text-blue-600 hover:bg-gray-100">
                Create Free Account
              </Button>
            </Link>
            <Link to="/properties">
              <Button size="lg" className="bg-blue-700 hover:bg-blue-800">
                Browse Properties
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;