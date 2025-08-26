import React, { useState } from 'react';
import { Video, Play, Pause, RotateCcw, ZoomIn, ZoomOut, Maximize, Eye } from 'lucide-react';

interface VirtualTour {
  id: string;
  propertyId: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  tourUrl: string;
  duration: string;
  views: number;
  createdAt: string;
  status: 'active' | 'processing' | 'draft';
}

const VirtualTours: React.FC = () => {
  const [selectedTour, setSelectedTour] = useState<VirtualTour | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const mockTours: VirtualTour[] = [
    {
      id: '1',
      propertyId: 'prop-1',
      title: 'Luxury 3-Bed Apartment - Central London',
      description: 'Complete 360° virtual tour of this stunning apartment',
      thumbnailUrl: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20luxury%20apartment%20living%20room%20interior%20design%20with%20large%20windows%20and%20city%20view&image_size=landscape_16_9',
      tourUrl: '#',
      duration: '8:45',
      views: 1247,
      createdAt: '2024-01-15',
      status: 'active'
    },
    {
      id: '2',
      propertyId: 'prop-2',
      title: 'Victorian House - Kensington',
      description: 'Historic property with modern renovations',
      thumbnailUrl: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=victorian%20house%20interior%20elegant%20living%20room%20with%20period%20features%20and%20modern%20touches&image_size=landscape_16_9',
      tourUrl: '#',
      duration: '12:30',
      views: 892,
      createdAt: '2024-01-10',
      status: 'active'
    },
    {
      id: '3',
      propertyId: 'prop-3',
      title: 'Modern Penthouse - Canary Wharf',
      description: 'Stunning penthouse with panoramic city views',
      thumbnailUrl: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20penthouse%20living%20room%20with%20floor%20to%20ceiling%20windows%20city%20skyline%20view&image_size=landscape_16_9',
      tourUrl: '#',
      duration: '15:20',
      views: 2156,
      createdAt: '2024-01-20',
      status: 'processing'
    }
  ];

  const handlePlayTour = (tour: VirtualTour) => {
    setSelectedTour(tour);
    setIsPlaying(true);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Virtual Tours</h1>
          <p className="text-gray-600">Manage and view property virtual tours</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
          <Video className="h-4 w-4" />
          <span>Create New Tour</span>
        </button>
      </div>

      {/* Tour Player */}
      {selectedTour && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">{selectedTour.title}</h2>
            <button
              onClick={() => setSelectedTour(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
          
          <div className="relative bg-gray-900 rounded-lg overflow-hidden">
            <img
              src={selectedTour.thumbnailUrl}
              alt={selectedTour.title}
              className="w-full h-96 object-cover"
            />
            
            {/* Tour Controls */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={togglePlayPause}
                    className="bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors"
                  >
                    {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                  </button>
                  <span className="text-sm">{selectedTour.duration}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button className="bg-white/20 hover:bg-white/30 rounded p-1">
                    <RotateCcw className="h-4 w-4" />
                  </button>
                  <button className="bg-white/20 hover:bg-white/30 rounded p-1">
                    <ZoomIn className="h-4 w-4" />
                  </button>
                  <button className="bg-white/20 hover:bg-white/30 rounded p-1">
                    <ZoomOut className="h-4 w-4" />
                  </button>
                  <button className="bg-white/20 hover:bg-white/30 rounded p-1">
                    <Maximize className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <p className="text-gray-600 mt-4">{selectedTour.description}</p>
        </div>
      )}

      {/* Tours Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockTours.map((tour) => (
          <div key={tour.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative">
              <img
                src={tour.thumbnailUrl}
                alt={tour.title}
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-2 right-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(tour.status)}`}>
                  {tour.status.charAt(0).toUpperCase() + tour.status.slice(1)}
                </span>
              </div>
              <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
                {tour.duration}
              </div>
            </div>
            
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-2">{tour.title}</h3>
              <p className="text-gray-600 text-sm mb-3">{tour.description}</p>
              
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <div className="flex items-center space-x-1">
                  <Eye className="h-4 w-4" />
                  <span>{tour.views.toLocaleString()} views</span>
                </div>
                <span>{new Date(tour.createdAt).toLocaleDateString()}</span>
              </div>
              
              <button
                onClick={() => handlePlayTour(tour)}
                disabled={tour.status === 'processing'}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <Play className="h-4 w-4" />
                <span>{tour.status === 'processing' ? 'Processing...' : 'View Tour'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Tours</p>
              <p className="text-2xl font-bold text-gray-900">{mockTours.length}</p>
            </div>
            <Video className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Views</p>
              <p className="text-2xl font-bold text-gray-900">
                {mockTours.reduce((sum, tour) => sum + tour.views, 0).toLocaleString()}
              </p>
            </div>
            <Eye className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Tours</p>
              <p className="text-2xl font-bold text-gray-900">
                {mockTours.filter(tour => tour.status === 'active').length}
              </p>
            </div>
            <Play className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Processing</p>
              <p className="text-2xl font-bold text-gray-900">
                {mockTours.filter(tour => tour.status === 'processing').length}
              </p>
            </div>
            <RotateCcw className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VirtualTours;