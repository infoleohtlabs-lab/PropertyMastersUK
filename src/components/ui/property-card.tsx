import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { Button } from './button';
import { cn } from '../../utils/cn';
import {
  MapPin,
  Bed,
  Bath,
  Square,
  Heart,
  Share2,
  Eye,
  Calendar,
  PoundSterling,
} from 'lucide-react';

interface PropertyCardProps {
  property: {
    id: string;
    title: string;
    price: number;
    location: string;
    bedrooms: number;
    bathrooms: number;
    area: number;
    type: string;
    status: 'FOR_SALE' | 'FOR_RENT' | 'SOLD' | 'RENTED';
    images: string[];
    featured?: boolean;
    dateAdded: string;
  };
  variant?: 'grid' | 'list' | 'featured';
  onView?: (id: string) => void;
  onFavorite?: (id: string) => void;
  onShare?: (id: string) => void;
  className?: string;
}

const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  variant = 'grid',
  onView,
  onFavorite,
  onShare,
  className,
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'FOR_SALE':
        return 'badge-primary';
      case 'FOR_RENT':
        return 'badge-success';
      case 'SOLD':
        return 'badge-danger';
      case 'RENTED':
        return 'badge-warning';
      default:
        return 'badge-primary';
    }
  };

  const getCardVariant = () => {
    switch (variant) {
      case 'featured':
        return 'elevated';
      case 'list':
        return 'compact';
      default:
        return 'interactive';
    }
  };

  const isHorizontal = variant === 'list';

  return (
    <Card
      variant={getCardVariant()}
      className={cn(
        'group overflow-hidden',
        variant === 'featured' && 'ring-2 ring-primary-200',
        isHorizontal && 'flex flex-row',
        className
      )}
      onClick={() => onView?.(property.id)}
    >
      {/* Image Section */}
      <div
        className={cn(
          'relative overflow-hidden bg-gray-200',
          isHorizontal ? 'w-1/3 min-h-[200px]' : 'aspect-[4/3] w-full'
        )}
      >
        {property.images.length > 0 ? (
          <img
            src={property.images[0]}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <Square className="w-12 h-12" />
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <Badge className={getStatusColor(property.status)}>
            {property.status.replace('_', ' ')}
          </Badge>
        </div>
        
        {/* Featured Badge */}
        {property.featured && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-yellow-100 text-yellow-800">
              Featured
            </Badge>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="absolute top-3 right-3 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <Button
            size="sm"
            variant="secondary"
            className="p-2 bg-white/90 hover:bg-white"
            onClick={(e) => {
              e.stopPropagation();
              onFavorite?.(property.id);
            }}
          >
            <Heart className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="p-2 bg-white/90 hover:bg-white"
            onClick={(e) => {
              e.stopPropagation();
              onShare?.(property.id);
            }}
          >
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Content Section */}
      <div className={cn('flex flex-col', isHorizontal ? 'flex-1 p-4' : 'p-0')}>
        {!isHorizontal && (
          <CardHeader className="border-none pb-2 mb-0">
            <div className="flex items-start justify-between">
              <CardTitle size="sm" className="line-clamp-2 group-hover:text-primary-600 transition-colors">
                {property.title}
              </CardTitle>
            </div>
          </CardHeader>
        )}

        <CardContent className={cn('flex-1', isHorizontal ? 'p-0' : 'px-6 pb-4')}>
          {isHorizontal && (
            <h3 className="text-heading-4 text-gray-900 font-semibold mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
              {property.title}
            </h3>
          )}
          
          {/* Price */}
          <div className="flex items-center space-x-2 mb-3">
            <PoundSterling className="w-4 h-4 text-primary-600" />
            <span className="text-heading-3 font-bold text-primary-600">
              {formatPrice(property.price)}
            </span>
            {property.status === 'FOR_RENT' && (
              <span className="text-body-sm text-gray-500">per month</span>
            )}
          </div>
          
          {/* Location */}
          <div className="flex items-center space-x-2 mb-3 text-gray-600">
            <MapPin className="w-4 h-4" />
            <span className="text-body-sm">{property.location}</span>
          </div>
          
          {/* Property Details */}
          <div className="flex items-center space-x-4 text-gray-600 mb-3">
            <div className="flex items-center space-x-1">
              <Bed className="w-4 h-4" />
              <span className="text-body-sm">{property.bedrooms}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Bath className="w-4 h-4" />
              <span className="text-body-sm">{property.bathrooms}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Square className="w-4 h-4" />
              <span className="text-body-sm">{property.area} sq ft</span>
            </div>
          </div>
          
          {/* Property Type */}
          <div className="mb-3">
            <Badge variant="secondary" className="text-xs">
              {property.type}
            </Badge>
          </div>
        </CardContent>

        <CardFooter className={cn('border-none mt-0 pt-0', isHorizontal ? 'px-0' : 'px-6 pb-6')}>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-1 text-gray-500">
              <Calendar className="w-3 h-3" />
              <span className="text-caption">
                Added {new Date(property.dateAdded).toLocaleDateString()}
              </span>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="flex items-center space-x-1"
              onClick={(e) => {
                e.stopPropagation();
                onView?.(property.id);
              }}
            >
              <Eye className="w-3 h-3" />
              <span>View</span>
            </Button>
          </div>
        </CardFooter>
      </div>
    </Card>
  );
};

export { PropertyCard };
export type { PropertyCardProps };