import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/Textarea';
import {
  Calculator,
  TrendingUp,
  MapPin,
  Home,
  Calendar,
  PoundSterling,
  BarChart3,
  FileText,
  Download,
  Share2,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface PropertyDetails {
  address: string;
  postcode: string;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  yearBuilt: number;
  condition: string;
  features: string[];
  description: string;
}

interface ValuationResult {
  estimatedValue: number;
  confidence: number;
  priceRange: {
    min: number;
    max: number;
  };
  marketTrend: 'up' | 'down' | 'stable';
  comparableProperties: Array<{
    address: string;
    price: number;
    sqft: number;
    bedrooms: number;
    soldDate: string;
  }>;
  factors: Array<{
    factor: string;
    impact: 'positive' | 'negative' | 'neutral';
    description: string;
  }>;
}

const PropertyValuation: React.FC = () => {
  const [propertyDetails, setPropertyDetails] = useState<PropertyDetails>({
    address: '',
    postcode: '',
    propertyType: '',
    bedrooms: 0,
    bathrooms: 0,
    sqft: 0,
    yearBuilt: 0,
    condition: '',
    features: [],
    description: ''
  });

  const [valuationResult, setValuationResult] = useState<ValuationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'results' | 'comparables' | 'report'>('details');

  // Mock market trend data
  const marketTrendData = [
    { month: 'Jan', value: 285000 },
    { month: 'Feb', value: 290000 },
    { month: 'Mar', value: 295000 },
    { month: 'Apr', value: 298000 },
    { month: 'May', value: 302000 },
    { month: 'Jun', value: 305000 }
  ];

  const priceDistributionData = [
    { range: '£200-250k', count: 12 },
    { range: '£250-300k', count: 28 },
    { range: '£300-350k', count: 35 },
    { range: '£350-400k', count: 22 },
    { range: '£400-450k', count: 15 },
    { range: '£450k+', count: 8 }
  ];

  const handleInputChange = (field: keyof PropertyDetails, value: any) => {
    setPropertyDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleValuation = async () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const mockResult: ValuationResult = {
        estimatedValue: 325000,
        confidence: 85,
        priceRange: {
          min: 310000,
          max: 340000
        },
        marketTrend: 'up',
        comparableProperties: [
          {
            address: '15 Oak Street, Manchester',
            price: 320000,
            sqft: 1200,
            bedrooms: 3,
            soldDate: '2024-01-15'
          },
          {
            address: '22 Elm Avenue, Manchester',
            price: 335000,
            sqft: 1350,
            bedrooms: 3,
            soldDate: '2024-02-03'
          },
          {
            address: '8 Pine Close, Manchester',
            price: 315000,
            sqft: 1150,
            bedrooms: 3,
            soldDate: '2024-01-28'
          }
        ],
        factors: [
          {
            factor: 'Location',
            impact: 'positive',
            description: 'Desirable area with good transport links'
          },
          {
            factor: 'Property Condition',
            impact: 'positive',
            description: 'Well-maintained property in excellent condition'
          },
          {
            factor: 'Market Trend',
            impact: 'positive',
            description: 'Local market showing 3.2% growth year-on-year'
          },
          {
            factor: 'Property Age',
            impact: 'neutral',
            description: 'Built in 1995, typical for the area'
          }
        ]
      };
      
      setValuationResult(mockResult);
      setActiveTab('results');
      setIsLoading(false);
    }, 2000);
  };

  const renderPropertyDetailsForm = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="address">Property Address</Label>
          <Input
            id="address"
            placeholder="Enter full address"
            value={propertyDetails.address}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('address', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="postcode">Postcode</Label>
          <Input
            id="postcode"
            placeholder="M1 1AA"
            value={propertyDetails.postcode}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('postcode', e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label htmlFor="propertyType">Property Type</Label>
          <Select onValueChange={(value: string) => handleInputChange('propertyType', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="terraced">Terraced House</SelectItem>
              <SelectItem value="semi-detached">Semi-Detached</SelectItem>
              <SelectItem value="detached">Detached House</SelectItem>
              <SelectItem value="flat">Flat/Apartment</SelectItem>
              <SelectItem value="bungalow">Bungalow</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="bedrooms">Bedrooms</Label>
          <Input
            id="bedrooms"
            type="number"
            min="1"
            max="10"
            value={propertyDetails.bedrooms || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('bedrooms', parseInt(e.target.value) || 0)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bathrooms">Bathrooms</Label>
          <Input
            id="bathrooms"
            type="number"
            min="1"
            max="10"
            value={propertyDetails.bathrooms || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('bathrooms', parseInt(e.target.value) || 0)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label htmlFor="sqft">Floor Area (sq ft)</Label>
          <Input
            id="sqft"
            type="number"
            placeholder="1200"
            value={propertyDetails.sqft || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('sqft', parseInt(e.target.value) || 0)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="yearBuilt">Year Built</Label>
          <Input
            id="yearBuilt"
            type="number"
            placeholder="1995"
            value={propertyDetails.yearBuilt || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('yearBuilt', parseInt(e.target.value) || 0)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="condition">Property Condition</Label>
          <Select onValueChange={(value: string) => handleInputChange('condition', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select condition" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="excellent">Excellent</SelectItem>
              <SelectItem value="good">Good</SelectItem>
              <SelectItem value="fair">Fair</SelectItem>
              <SelectItem value="poor">Poor</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Additional Details</Label>
        <Textarea
          id="description"
          placeholder="Any additional information about the property (recent renovations, unique features, etc.)"
          value={propertyDetails.description}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('description', e.target.value)}
          rows={4}
        />
      </div>

      <Button 
        onClick={handleValuation}
        disabled={!propertyDetails.address || !propertyDetails.postcode || isLoading}
        className="w-full bg-[#1E40AF] hover:bg-[#1E3A8A]"
        size="lg"
      >
        {isLoading ? (
          <>
            <Clock className="h-5 w-5 mr-2 animate-spin" />
            Calculating Valuation...
          </>
        ) : (
          <>
            <Calculator className="h-5 w-5 mr-2" />
            Get Property Valuation
          </>
        )}
      </Button>
    </div>
  );

  const renderValuationResults = () => {
    if (!valuationResult) return null;

    return (
      <div className="space-y-6">
        {/* Main Valuation Result */}
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-[#1E40AF] mb-2">
                £{valuationResult.estimatedValue.toLocaleString()}
              </div>
              <div className="text-lg text-gray-600 mb-4">
                Estimated Market Value
              </div>
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
                <span>Range: £{valuationResult.priceRange.min.toLocaleString()} - £{valuationResult.priceRange.max.toLocaleString()}</span>
                <span>•</span>
                <span className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-1 text-green-600" />
                  {valuationResult.confidence}% Confidence
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Market Trend */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Market Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={marketTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`£${Number(value).toLocaleString()}`, 'Average Price']} />
                  <Line type="monotone" dataKey="value" stroke="#1E40AF" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Price Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={priceDistributionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#1E40AF" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Valuation Factors */}
        <Card>
          <CardHeader>
            <CardTitle>Valuation Factors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {valuationResult.factors.map((factor, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50">
                  <div className={`p-1 rounded-full ${
                    factor.impact === 'positive' ? 'bg-green-100' :
                    factor.impact === 'negative' ? 'bg-red-100' : 'bg-gray-100'
                  }`}>
                    {factor.impact === 'positive' ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : factor.impact === 'negative' ? (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    ) : (
                      <CheckCircle className="h-4 w-4 text-gray-600" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{factor.factor}</div>
                    <div className="text-sm text-gray-600">{factor.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderComparableProperties = () => {
    if (!valuationResult) return null;

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Comparable Properties</CardTitle>
            <p className="text-sm text-gray-600">
              Recent sales of similar properties in the area
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {valuationResult.comparableProperties.map((property, index) => (
                <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-medium text-gray-900">{property.address}</div>
                      <div className="text-sm text-gray-600 flex items-center mt-1">
                        <MapPin className="h-4 w-4 mr-1" />
                        {property.bedrooms} bed • {property.sqft} sq ft
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-[#1E40AF]">
                        £{property.price.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">
                        Sold {new Date(property.soldDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    £{Math.round(property.price / property.sqft)} per sq ft
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderValuationReport = () => {
    if (!valuationResult) return null;

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Valuation Report
              </span>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <Button size="sm" className="bg-[#1E40AF] hover:bg-[#1E3A8A]">
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Report Summary */}
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold text-lg mb-2">Executive Summary</h3>
                <p className="text-gray-600 leading-relaxed">
                  Based on our comprehensive analysis of comparable properties, market trends, and property-specific factors, 
                  we estimate the current market value of {propertyDetails.address} to be £{valuationResult.estimatedValue.toLocaleString()}. 
                  This valuation has a confidence level of {valuationResult.confidence}% and falls within the range of 
                  £{valuationResult.priceRange.min.toLocaleString()} to £{valuationResult.priceRange.max.toLocaleString()}.
                </p>
              </div>

              {/* Property Details Summary */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Property Details</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Address:</span>
                    <div className="font-medium">{propertyDetails.address}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Type:</span>
                    <div className="font-medium capitalize">{propertyDetails.propertyType}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Bedrooms:</span>
                    <div className="font-medium">{propertyDetails.bedrooms}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Floor Area:</span>
                    <div className="font-medium">{propertyDetails.sqft} sq ft</div>
                  </div>
                </div>
              </div>

              {/* Methodology */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Valuation Methodology</h3>
                <div className="text-sm text-gray-600 space-y-2">
                  <p>• Comparative Market Analysis (CMA) of recent sales within 0.5 miles</p>
                  <p>• Adjustment for property-specific features and condition</p>
                  <p>• Local market trend analysis and price per square foot calculations</p>
                  <p>• Integration of Land Registry data and local market intelligence</p>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="bg-gray-50 p-4 rounded-lg text-xs text-gray-600">
                <p className="font-medium mb-2">Important Disclaimer:</p>
                <p>
                  This valuation is provided for guidance purposes only and should not be relied upon for mortgage, 
                  insurance, or legal purposes. For official valuations, please consult a RICS qualified surveyor. 
                  Property values can fluctuate based on market conditions and individual property characteristics.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Property Valuation</h1>
          <p className="text-gray-600">
            Get an instant property valuation using our AI-powered analysis and market data
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'details', label: 'Property Details', icon: Home },
                { id: 'results', label: 'Valuation Results', icon: Calculator },
                { id: 'comparables', label: 'Comparable Properties', icon: BarChart3 },
                { id: 'report', label: 'Full Report', icon: FileText }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-[#1E40AF] text-[#1E40AF]'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                    disabled={tab.id !== 'details' && !valuationResult}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content */}
        <Card>
          <CardContent className="p-6">
            {activeTab === 'details' && renderPropertyDetailsForm()}
            {activeTab === 'results' && renderValuationResults()}
            {activeTab === 'comparables' && renderComparableProperties()}
            {activeTab === 'report' && renderValuationReport()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PropertyValuation;