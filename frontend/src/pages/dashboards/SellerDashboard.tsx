import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Home,
  DollarSign,
  Eye,
  Calendar,
  TrendingUp,
  TrendingDown,
  MapPin,
  Camera,
  FileText,
  Users,
  Clock,
  Star,
  Plus,
  Edit,
  BarChart3,
  PieChart,
  Activity,
  Phone,
  Mail,
  MessageSquare
} from 'lucide-react';

interface SellerStats {
  activeListings: number;
  totalViews: number;
  totalOffers: number;
  averagePrice: number;
  soldProperties: number;
  averageDaysOnMarket: number;
}

interface Property {
  id: string;
  title: string;
  address: string;
  price: number;
  type: 'house' | 'apartment' | 'commercial' | 'land';
  bedrooms?: number;
  bathrooms?: number;
  sqft: number;
  status: 'active' | 'under_offer' | 'sold' | 'withdrawn';
  views: number;
  offers: number;
  daysOnMarket: number;
  images: string[];
  description: string;
  features: string[];
  listedDate: string;
}

interface Offer {
  id: string;
  propertyId: string;
  propertyTitle: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  offerAmount: number;
  status: 'pending' | 'accepted' | 'rejected' | 'countered';
  submittedDate: string;
  message?: string;
  conditions?: string[];
}

interface MarketData {
  averagePrice: number;
  priceChange: number;
  averageDaysOnMarket: number;
  totalSales: number;
  marketTrend: 'up' | 'down' | 'stable';
  competitorListings: number;
}

interface ViewingRequest {
  id: string;
  propertyId: string;
  propertyTitle: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  requestedDate: string;
  requestedTime: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  message?: string;
}

const SellerDashboard: React.FC = () => {
  const [stats, setStats] = useState<SellerStats>({
    activeListings: 0,
    totalViews: 0,
    totalOffers: 0,
    averagePrice: 0,
    soldProperties: 0,
    averageDaysOnMarket: 0
  });

  const [properties, setProperties] = useState<Property[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [marketData, setMarketData] = useState<MarketData>({
    averagePrice: 0,
    priceChange: 0,
    averageDaysOnMarket: 0,
    totalSales: 0,
    marketTrend: 'stable',
    competitorListings: 0
  });
  const [viewingRequests, setViewingRequests] = useState<ViewingRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadStats(),
        loadProperties(),
        loadOffers(),
        loadMarketData(),
        loadViewingRequests()
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    // Mock data - replace with actual API call
    setStats({
      activeListings: 3,
      totalViews: 1247,
      totalOffers: 8,
      averagePrice: 485000,
      soldProperties: 2,
      averageDaysOnMarket: 45
    });
  };

  const loadProperties = async () => {
    // Mock data - replace with actual API call
    setProperties([
      {
        id: 'PROP001',
        title: 'Modern 3-Bedroom House in Hampstead',
        address: '123 Elm Street, Hampstead, London NW3',
        price: 750000,
        type: 'house',
        bedrooms: 3,
        bathrooms: 2,
        sqft: 1850,
        status: 'active',
        views: 456,
        offers: 3,
        daysOnMarket: 28,
        images: ['image1.jpg', 'image2.jpg', 'image3.jpg'],
        description: 'Beautiful Victorian house with modern renovations',
        features: ['Garden', 'Parking', 'Modern Kitchen', 'Original Features'],
        listedDate: '2024-01-01T00:00:00Z'
      },
      {
        id: 'PROP002',
        title: 'Luxury 2-Bedroom Apartment',
        address: '456 River View, Canary Wharf, London E14',
        price: 650000,
        type: 'apartment',
        bedrooms: 2,
        bathrooms: 2,
        sqft: 1200,
        status: 'under_offer',
        views: 523,
        offers: 5,
        daysOnMarket: 35,
        images: ['image4.jpg', 'image5.jpg'],
        description: 'Stunning apartment with river views',
        features: ['River View', 'Concierge', 'Gym', 'Balcony'],
        listedDate: '2023-12-15T00:00:00Z'
      },
      {
        id: 'PROP003',
        title: 'Commercial Office Space',
        address: '789 Business Park, Manchester M1',
        price: 320000,
        type: 'commercial',
        sqft: 2500,
        status: 'active',
        views: 268,
        offers: 0,
        daysOnMarket: 62,
        images: ['image6.jpg'],
        description: 'Prime commercial space in city center',
        features: ['Parking', 'Air Conditioning', 'Meeting Rooms'],
        listedDate: '2023-11-20T00:00:00Z'
      }
    ]);
  };

  const loadOffers = async () => {
    // Mock data - replace with actual API call
    setOffers([
      {
        id: 'OFFER001',
        propertyId: 'PROP001',
        propertyTitle: 'Modern 3-Bedroom House in Hampstead',
        buyerName: 'John Smith',
        buyerEmail: 'john.smith@email.com',
        buyerPhone: '+44 20 1234 5678',
        offerAmount: 720000,
        status: 'pending',
        submittedDate: '2024-01-15T10:30:00Z',
        message: 'Very interested in the property. Can we arrange a viewing?',
        conditions: ['Subject to survey', 'Subject to mortgage approval']
      },
      {
        id: 'OFFER002',
        propertyId: 'PROP002',
        propertyTitle: 'Luxury 2-Bedroom Apartment',
        buyerName: 'Sarah Johnson',
        buyerEmail: 'sarah.johnson@email.com',
        buyerPhone: '+44 20 9876 5432',
        offerAmount: 640000,
        status: 'accepted',
        submittedDate: '2024-01-12T14:20:00Z',
        message: 'Cash buyer, no chain',
        conditions: ['Subject to survey only']
      },
      {
        id: 'OFFER003',
        propertyId: 'PROP001',
        propertyTitle: 'Modern 3-Bedroom House in Hampstead',
        buyerName: 'Mike Wilson',
        buyerEmail: 'mike.wilson@email.com',
        buyerPhone: '+44 20 5555 0123',
        offerAmount: 700000,
        status: 'countered',
        submittedDate: '2024-01-10T09:15:00Z',
        message: 'Looking for a quick completion',
        conditions: ['Subject to survey', 'Subject to mortgage approval']
      }
    ]);
  };

  const loadMarketData = async () => {
    // Mock data - replace with actual API call
    setMarketData({
      averagePrice: 485000,
      priceChange: 3.2,
      averageDaysOnMarket: 52,
      totalSales: 156,
      marketTrend: 'up',
      competitorListings: 23
    });
  };

  const loadViewingRequests = async () => {
    // Mock data - replace with actual API call
    setViewingRequests([
      {
        id: 'VIEW001',
        propertyId: 'PROP001',
        propertyTitle: 'Modern 3-Bedroom House in Hampstead',
        buyerName: 'Emma Davis',
        buyerEmail: 'emma.davis@email.com',
        buyerPhone: '+44 20 7777 8888',
        requestedDate: '2024-01-18',
        requestedTime: '14:00',
        status: 'pending',
        message: 'Would like to view this weekend if possible'
      },
      {
        id: 'VIEW002',
        propertyId: 'PROP003',
        propertyTitle: 'Commercial Office Space',
        buyerName: 'Business Solutions Ltd',
        buyerEmail: 'contact@business-solutions.com',
        buyerPhone: '+44 161 123 4567',
        requestedDate: '2024-01-19',
        requestedTime: '10:00',
        status: 'confirmed',
        message: 'Looking to relocate our office'
      }
    ]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600';
      case 'under_offer': return 'text-blue-600';
      case 'sold': return 'text-purple-600';
      case 'withdrawn': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getOfferStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'text-green-600';
      case 'pending': return 'text-orange-600';
      case 'rejected': return 'text-red-600';
      case 'countered': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getViewingStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-green-600';
      case 'pending': return 'text-orange-600';
      case 'completed': return 'text-blue-600';
      case 'cancelled': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Seller Dashboard</h1>
          <p className="text-gray-600">Manage your property listings and track performance</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={loadDashboardData}>
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Listing
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeListings}</div>
            <p className="text-xs text-muted-foreground">
              {stats.soldProperties} sold this year
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Offers</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOffers}</div>
            <p className="text-xs text-muted-foreground">
              3 pending review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Days on Market</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageDaysOnMarket}</div>
            <p className="text-xs text-muted-foreground">
              7 days below market avg
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="listings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="listings">My Listings</TabsTrigger>
          <TabsTrigger value="offers">Offers</TabsTrigger>
          <TabsTrigger value="viewings">Viewings</TabsTrigger>
          <TabsTrigger value="market">Market Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="listings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Home className="h-5 w-5 mr-2" />
                Property Listings
              </CardTitle>
              <CardDescription>
                Manage and track your property listings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {properties.map((property) => (
                  <div key={property.id} className="border rounded-lg p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="p-3 bg-blue-100 rounded-lg">
                          <Home className="h-8 w-8 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="text-lg font-semibold">{property.title}</h3>
                            <Badge variant="outline">{property.id}</Badge>
                          </div>
                          <p className="text-muted-foreground flex items-center mt-1">
                            <MapPin className="h-4 w-4 mr-1" />
                            {property.address}
                          </p>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                            {property.bedrooms && (
                              <span>{property.bedrooms} bed</span>
                            )}
                            {property.bathrooms && (
                              <span>{property.bathrooms} bath</span>
                            )}
                            <span>{property.sqft.toLocaleString()} sqft</span>
                            <span className="capitalize">{property.type}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">£{property.price.toLocaleString()}</div>
                        <Badge className={getStatusColor(property.status)}>
                          {property.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                      <div className="flex items-center space-x-2">
                        <Eye className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{property.views} views</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{property.offers} offers</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{property.daysOnMarket} days listed</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button size="sm" variant="outline">
                          <Camera className="h-3 w-3 mr-1" />
                          Photos
                        </Button>
                      </div>
                      <Button size="sm">
                        <BarChart3 className="h-3 w-3 mr-1" />
                        Analytics
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="offers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Offers Received
              </CardTitle>
              <CardDescription>
                Review and manage offers on your properties
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {offers.map((offer) => (
                  <div key={offer.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">{offer.propertyTitle}</h4>
                          <Badge variant="outline">{offer.id}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Offer from {offer.buyerName}
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center">
                            <Phone className="h-3 w-3 mr-1" />
                            {offer.buyerPhone}
                          </span>
                          <span className="flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            {offer.buyerEmail}
                          </span>
                          <span>Submitted: {new Date(offer.submittedDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold">£{offer.offerAmount.toLocaleString()}</div>
                        <Badge className={getOfferStatusColor(offer.status)}>
                          {offer.status}
                        </Badge>
                      </div>
                    </div>
                    
                    {offer.message && (
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-sm">{offer.message}</p>
                      </div>
                    )}
                    
                    {offer.conditions && offer.conditions.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-1">Conditions:</p>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          {offer.conditions.map((condition, index) => (
                            <li key={index}>• {condition}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div className="flex space-x-2 pt-3 border-t">
                      {offer.status === 'pending' && (
                        <>
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            Accept
                          </Button>
                          <Button size="sm" variant="outline">
                            Counter
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-600">
                            Reject
                          </Button>
                        </>
                      )}
                      <Button size="sm" variant="outline">
                        <MessageSquare className="h-3 w-3 mr-1" />
                        Message
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="viewings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Viewing Requests
              </CardTitle>
              <CardDescription>
                Manage property viewing appointments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {viewingRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <Calendar className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">{request.propertyTitle}</h4>
                        <p className="text-sm text-muted-foreground">
                          Requested by {request.buyerName}
                        </p>
                        <div className="flex items-center space-x-4 mt-1 text-xs text-muted-foreground">
                          <span>{new Date(request.requestedDate).toLocaleDateString()}</span>
                          <span>{request.requestedTime}</span>
                          <span className="flex items-center">
                            <Phone className="h-3 w-3 mr-1" />
                            {request.buyerPhone}
                          </span>
                        </div>
                        {request.message && (
                          <p className="text-xs text-muted-foreground mt-1">
                            "{request.message}"
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getViewingStatusColor(request.status)}>
                        {request.status}
                      </Badge>
                      <div className="flex space-x-2 mt-2">
                        {request.status === 'pending' && (
                          <>
                            <Button size="sm">
                              Confirm
                            </Button>
                            <Button size="sm" variant="outline">
                              Reschedule
                            </Button>
                          </>
                        )}
                        <Button size="sm" variant="outline">
                          <MessageSquare className="h-3 w-3 mr-1" />
                          Contact
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="market" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Market Overview
                </CardTitle>
                <CardDescription>
                  Current market conditions in your area
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Average Price</span>
                    <span className="font-semibold">£{marketData.averagePrice.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Price Change (YoY)</span>
                    <span className={`font-semibold flex items-center ${
                      marketData.priceChange > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {marketData.priceChange > 0 ? (
                        <TrendingUp className="h-4 w-4 mr-1" />
                      ) : (
                        <TrendingDown className="h-4 w-4 mr-1" />
                      )}
                      {Math.abs(marketData.priceChange)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Avg. Days on Market</span>
                    <span className="font-semibold">{marketData.averageDaysOnMarket} days</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Sales (Last 30 days)</span>
                    <span className="font-semibold">{marketData.totalSales}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Competitor Listings</span>
                    <span className="font-semibold">{marketData.competitorListings}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Insights</CardTitle>
                <CardDescription>
                  How your listings compare to the market
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Listing Views vs Market Avg</span>
                      <span>+23%</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Time to First Offer</span>
                      <span>-15%</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Price vs Market Value</span>
                      <span>+2%</span>
                    </div>
                    <Progress value={60} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Conversion Rate</span>
                      <span>12%</span>
                    </div>
                    <Progress value={70} className="h-2" />
                  </div>
                  <div className="pt-4 border-t">
                    <Button className="w-full" variant="outline">
                      <PieChart className="h-4 w-4 mr-2" />
                      Detailed Market Report
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SellerDashboard;