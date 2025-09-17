import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, MapPin, Calendar, Search, AlertCircle, CheckCircle } from 'lucide-react';
import { Property, OwnershipRecord, OwnershipType } from '@/types/land-registry';
import { formatDate } from '@/types/land-registry';

interface PropertyOwnershipProps {
  titleNumber?: string;
  onOwnershipFound?: (property: Property, ownership: OwnershipRecord[]) => void;
}

interface OwnershipData {
  property: Property;
  ownership: OwnershipRecord[];
}

export const PropertyOwnership: React.FC<PropertyOwnershipProps> = ({
  titleNumber: initialTitleNumber,
  onOwnershipFound
}) => {
  const [titleNumber, setTitleNumber] = useState(initialTitleNumber || '');
  const [ownershipData, setOwnershipData] = useState<OwnershipData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchOwnership = async () => {
    if (!titleNumber.trim()) {
      setError('Please enter a title number');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/land-registry/ownership/${encodeURIComponent(titleNumber)}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch ownership data: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setOwnershipData(result.data);
        onOwnershipFound?.(result.data.property, result.data.ownership);
      } else {
        throw new Error(result.error?.message || 'Failed to fetch ownership data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setOwnershipData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchOwnership();
    }
  };

  useEffect(() => {
    if (initialTitleNumber) {
      searchOwnership();
    }
  }, [initialTitleNumber]);

  const getOwnershipTypeColor = (type: OwnershipType): string => {
    switch (type) {
      case OwnershipType.SOLE:
        return 'bg-blue-100 text-blue-800';
      case OwnershipType.JOINT:
        return 'bg-green-100 text-green-800';
      case OwnershipType.TENANTS_IN_COMMON:
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Property Ownership Lookup
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="titleNumber">Title Number</Label>
              <Input
                id="titleNumber"
                placeholder="Enter title number (e.g., ABC123456)"
                value={titleNumber}
                onChange={(e) => setTitleNumber(e.target.value.toUpperCase())}
                onKeyPress={handleKeyPress}
                disabled={loading}
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={searchOwnership} 
                disabled={loading || !titleNumber.trim()}
                className="min-w-[100px]"
              >
                {loading ? 'Searching...' : 'Search'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-20 w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {ownershipData && !loading && (
        <div className="space-y-6">
          {/* Property Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Property Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Title Number</Label>
                  <p className="font-mono text-lg">{ownershipData.property.title_number}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Tenure</Label>
                  <Badge variant="outline" className="ml-2">
                    {ownershipData.property.tenure}
                  </Badge>
                </div>
                <div className="md:col-span-2">
                  <Label className="text-sm font-medium text-gray-600">Address</Label>
                  <p className="text-lg">
                    {ownershipData.property.address.line1}
                    {ownershipData.property.address.line2 && `, ${ownershipData.property.address.line2}`}
                    <br />
                    {ownershipData.property.address.town}, {ownershipData.property.address.county}
                    <br />
                    <span className="font-mono">{ownershipData.property.address.postcode}</span>
                  </p>
                </div>
                <div className="md:col-span-2">
                  <Label className="text-sm font-medium text-gray-600">Property Description</Label>
                  <p>{ownershipData.property.property_description}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ownership Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Ownership Information
                <Badge variant="secondary" className="ml-2">
                  {ownershipData.ownership.length} Owner{ownershipData.ownership.length !== 1 ? 's' : ''}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {ownershipData.ownership.map((owner, index) => (
                  <div key={owner.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-semibold text-lg">{owner.proprietor_name}</h4>
                      <Badge className={getOwnershipTypeColor(owner.ownership_type as OwnershipType)}>
                        {owner.ownership_type}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Proprietor Address</Label>
                        <p className="text-sm">
                          {owner.proprietor_address.line1}
                          {owner.proprietor_address.line2 && `, ${owner.proprietor_address.line2}`}
                          <br />
                          {owner.proprietor_address.town}, {owner.proprietor_address.county}
                          <br />
                          <span className="font-mono">{owner.proprietor_address.postcode}</span>
                        </p>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Date Added</Label>
                        <p className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4" />
                          {formatDate(owner.date_proprietor_added)}
                        </p>
                        
                        {owner.additional_proprietor_indicator && (
                          <div className="mt-2">
                            <Badge variant="outline" className="text-xs">
                              Additional Proprietor
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Success Message */}
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Successfully retrieved ownership information for title number {ownershipData.property.title_number}.
              Last updated: {formatDate(ownershipData.property.updated_at)}
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
};

export default PropertyOwnership;