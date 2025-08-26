import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize,
  Minimize,
  Volume2,
  VolumeX,
  Settings,
  Info,
  Camera,
  Move,
  Eye,
  Navigation2,
  Home,
  Bed,
  Bath,
  ChefHat,
  Car,
  TreePine,
  X,
  Maximize2,
  Compass,
  Map,
  Layout,
  MousePointer,
  Hand
} from 'lucide-react';
import { Button } from './ui/Button';
import { Card, CardContent } from './ui/Card';
import { showToast } from './ui/Toast';

interface VrViewerProps {
  propertyId: string;
  propertyTitle: string;
  vrTourUrl?: string;
  images: string[];
  rooms?: Room[];
  onClose?: () => void;
  className?: string;
}

interface Room {
  id: string;
  name: string;
  type: 'living_room' | 'bedroom' | 'bathroom' | 'kitchen' | 'dining_room' | 'garden' | 'garage' | 'hallway';
  panoramaUrl: string;
  hotspots?: Hotspot[];
  description?: string;
  features?: string[];
}

interface Hotspot {
  id: string;
  x: number; // percentage from left
  y: number; // percentage from top
  type: 'room_transition' | 'info' | 'feature' | 'measurement';
  targetRoomId?: string;
  title: string;
  description?: string;
  icon?: string;
}

interface ViewerState {
  currentRoom: string;
  isPlaying: boolean;
  isFullscreen: boolean;
  isMuted: boolean;
  zoom: number;
  rotation: { x: number; y: number; z: number };
  showControls: boolean;
  showRoomList: boolean;
  showInfo: boolean;
  viewMode: 'vr' | 'panorama' | 'dollhouse';
  quality: 'low' | 'medium' | 'high' | 'ultra';
}

const VrViewer: React.FC<VrViewerProps> = ({
  propertyId,
  propertyTitle,
  vrTourUrl,
  images,
  rooms = [],
  onClose,
  className = ''
}) => {
  const viewerRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<ViewerState>({
    currentRoom: rooms.length > 0 ? rooms[0].id : '',
    isPlaying: false,
    isFullscreen: false,
    isMuted: false,
    zoom: 1,
    rotation: { x: 0, y: 0, z: 0 },
    showControls: true,
    showRoomList: false,
    showInfo: false,
    viewMode: 'panorama',
    quality: 'high'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Mock rooms data if not provided
  const mockRooms: Room[] = [
    {
      id: 'living_room',
      name: 'Living Room',
      type: 'living_room',
      panoramaUrl: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=360%20degree%20panoramic%20view%20modern%20living%20room%20interior%20spacious%20contemporary%20furniture&image_size=landscape_16_9',
      description: 'Spacious living room with modern furnishings and large windows',
      features: ['Large windows', 'Modern fireplace', 'Hardwood floors'],
      hotspots: [
        {
          id: 'to_kitchen',
          x: 75,
          y: 45,
          type: 'room_transition',
          targetRoomId: 'kitchen',
          title: 'Go to Kitchen',
          description: 'Navigate to the kitchen area'
        },
        {
          id: 'fireplace_info',
          x: 30,
          y: 60,
          type: 'feature',
          title: 'Modern Fireplace',
          description: 'Gas fireplace with remote control and safety features'
        }
      ]
    },
    {
      id: 'kitchen',
      name: 'Kitchen',
      type: 'kitchen',
      panoramaUrl: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=360%20degree%20panoramic%20view%20modern%20kitchen%20interior%20granite%20countertops%20stainless%20steel%20appliances&image_size=landscape_16_9',
      description: 'Modern kitchen with granite countertops and stainless steel appliances',
      features: ['Granite countertops', 'Stainless steel appliances', 'Island with breakfast bar'],
      hotspots: [
        {
          id: 'to_living',
          x: 25,
          y: 45,
          type: 'room_transition',
          targetRoomId: 'living_room',
          title: 'Back to Living Room',
          description: 'Return to the living room'
        },
        {
          id: 'to_bedroom',
          x: 85,
          y: 40,
          type: 'room_transition',
          targetRoomId: 'master_bedroom',
          title: 'Go to Master Bedroom',
          description: 'Navigate to the master bedroom'
        }
      ]
    },
    {
      id: 'master_bedroom',
      name: 'Master Bedroom',
      type: 'bedroom',
      panoramaUrl: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=360%20degree%20panoramic%20view%20master%20bedroom%20interior%20king%20size%20bed%20walk%20in%20closet&image_size=landscape_16_9',
      description: 'Spacious master bedroom with en-suite bathroom and walk-in closet',
      features: ['King size bed', 'Walk-in closet', 'En-suite bathroom', 'Large windows'],
      hotspots: [
        {
          id: 'to_kitchen',
          x: 15,
          y: 45,
          type: 'room_transition',
          targetRoomId: 'kitchen',
          title: 'Back to Kitchen',
          description: 'Return to the kitchen'
        },
        {
          id: 'closet_info',
          x: 70,
          y: 35,
          type: 'feature',
          title: 'Walk-in Closet',
          description: 'Spacious walk-in closet with built-in storage'
        }
      ]
    }
  ];

  const currentRooms = rooms.length > 0 ? rooms : mockRooms;
  const currentRoom = currentRooms.find(room => room.id === state.currentRoom) || currentRooms[0];

  useEffect(() => {
    // Simulate loading VR content
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Auto-hide controls after 3 seconds of inactivity
    let hideTimer: NodeJS.Timeout;
    
    if (state.showControls) {
      hideTimer = setTimeout(() => {
        setState(prev => ({ ...prev, showControls: false }));
      }, 3000);
    }

    return () => {
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, [state.showControls, mousePosition]);

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
    setState(prev => ({ ...prev, showControls: true }));

    if (isDragging) {
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      
      setState(prev => ({
        ...prev,
        rotation: {
          ...prev.rotation,
          y: prev.rotation.y + deltaX * 0.5,
          x: Math.max(-90, Math.min(90, prev.rotation.x - deltaY * 0.5))
        }
      }));
      
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleRoomChange = (roomId: string) => {
    setState(prev => ({ ...prev, currentRoom: roomId }));
    showToast.success(`Navigated to ${currentRooms.find(r => r.id === roomId)?.name}`);
  };

  const handleHotspotClick = (hotspot: Hotspot) => {
    if (hotspot.type === 'room_transition' && hotspot.targetRoomId) {
      handleRoomChange(hotspot.targetRoomId);
    } else {
      showToast.info(hotspot.description || hotspot.title);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      viewerRef.current?.requestFullscreen();
      setState(prev => ({ ...prev, isFullscreen: true }));
    } else {
      document.exitFullscreen();
      setState(prev => ({ ...prev, isFullscreen: false }));
    }
  };

  const handleZoom = (direction: 'in' | 'out') => {
    setState(prev => ({
      ...prev,
      zoom: direction === 'in' 
        ? Math.min(3, prev.zoom + 0.2)
        : Math.max(0.5, prev.zoom - 0.2)
    }));
  };

  const resetView = () => {
    setState(prev => ({
      ...prev,
      zoom: 1,
      rotation: { x: 0, y: 0, z: 0 }
    }));
  };

  const getRoomIcon = (type: Room['type']) => {
    switch (type) {
      case 'living_room': return <Home className="h-4 w-4" />;
      case 'bedroom': return <Bed className="h-4 w-4" />;
      case 'bathroom': return <Bath className="h-4 w-4" />;
      case 'kitchen': return <ChefHat className="h-4 w-4" />;
      case 'garage': return <Car className="h-4 w-4" />;
      case 'garden': return <TreePine className="h-4 w-4" />;
      default: return <Home className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className={`relative bg-black rounded-lg overflow-hidden ${className}`}>
        <div className="flex items-center justify-center h-96">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-lg font-medium">Loading VR Experience...</p>
            <p className="text-sm text-gray-300">Preparing immersive tour</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`relative bg-gray-900 rounded-lg overflow-hidden ${className}`}>
        <div className="flex items-center justify-center h-96">
          <div className="text-center text-white">
            <div className="text-red-500 mb-4">
              <X className="h-12 w-12 mx-auto" />
            </div>
            <p className="text-lg font-medium">VR Tour Unavailable</p>
            <p className="text-sm text-gray-300 mb-4">{error}</p>
            <Button variant="outline" onClick={() => setError(null)}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={viewerRef}
      className={`relative bg-black rounded-lg overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Main VR Viewer */}
      <div 
        className="relative h-96 bg-cover bg-center transition-transform duration-300"
        style={{
          backgroundImage: `url(${currentRoom?.panoramaUrl})`,
          transform: `scale(${state.zoom}) rotateX(${state.rotation.x}deg) rotateY(${state.rotation.y}deg)`,
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
      >
        {/* Hotspots */}
        {currentRoom?.hotspots?.map((hotspot) => (
          <button
            key={hotspot.id}
            className="absolute w-8 h-8 bg-blue-500 bg-opacity-80 rounded-full flex items-center justify-center text-white hover:bg-opacity-100 transition-all duration-200 transform hover:scale-110 animate-pulse"
            style={{
              left: `${hotspot.x}%`,
              top: `${hotspot.y}%`,
              transform: 'translate(-50%, -50%)'
            }}
            onClick={() => handleHotspotClick(hotspot)}
            title={hotspot.title}
          >
            {hotspot.type === 'room_transition' ? (
              <Navigation2 className="h-4 w-4" />
            ) : (
              <Info className="h-4 w-4" />
            )}
          </button>
        ))}

        {/* Loading overlay for room transitions */}
        {state.currentRoom !== currentRoom?.id && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
              <p>Loading room...</p>
            </div>
          </div>
        )}
      </div>

      {/* Controls Overlay */}
      {state.showControls && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Top Controls */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-auto">
            <div className="flex items-center space-x-2">
              <div className="bg-black bg-opacity-70 rounded-lg px-3 py-2 text-white">
                <h3 className="font-medium">{propertyTitle}</h3>
                <p className="text-sm text-gray-300">{currentRoom?.name}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                className="bg-black bg-opacity-70 text-white hover:bg-opacity-90"
                onClick={() => setState(prev => ({ ...prev, showInfo: !prev.showInfo }))}
              >
                <Info className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="bg-black bg-opacity-70 text-white hover:bg-opacity-90"
                onClick={toggleFullscreen}
              >
                {state.isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
              </Button>
              
              {onClose && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="bg-black bg-opacity-70 text-white hover:bg-opacity-90"
                  onClick={onClose}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Bottom Controls */}
          <div className="absolute bottom-4 left-4 right-4 pointer-events-auto">
            <div className="flex items-center justify-between">
              {/* Room Navigation */}
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="bg-black bg-opacity-70 text-white hover:bg-opacity-90"
                  onClick={() => setState(prev => ({ ...prev, showRoomList: !prev.showRoomList }))}
                >
                  <Map className="h-4 w-4 mr-2" />
                  Rooms
                </Button>
                
                {state.showRoomList && (
                  <div className="bg-black bg-opacity-90 rounded-lg p-2 flex space-x-2">
                    {currentRooms.map((room) => (
                      <Button
                        key={room.id}
                        variant={room.id === state.currentRoom ? "default" : "ghost"}
                        size="sm"
                        className={room.id === state.currentRoom ? "" : "text-white hover:bg-white hover:bg-opacity-20"}
                        onClick={() => handleRoomChange(room.id)}
                      >
                        {getRoomIcon(room.type)}
                        <span className="ml-2">{room.name}</span>
                      </Button>
                    ))}
                  </div>
                )}
              </div>

              {/* View Controls */}
              <div className="flex items-center space-x-2">
                <div className="bg-black bg-opacity-70 rounded-lg p-2 flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white hover:bg-opacity-20"
                    onClick={() => handleZoom('out')}
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  
                  <span className="text-white text-sm px-2">{Math.round(state.zoom * 100)}%</span>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white hover:bg-opacity-20"
                    onClick={() => handleZoom('in')}
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  
                  <div className="w-px h-6 bg-gray-600 mx-2"></div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white hover:bg-opacity-20"
                    onClick={resetView}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>

                {/* View Mode Selector */}
                <div className="bg-black bg-opacity-70 rounded-lg p-2 flex items-center space-x-1">
                  {(['panorama', 'vr', 'dollhouse'] as const).map((mode) => (
                    <Button
                      key={mode}
                      variant={state.viewMode === mode ? "default" : "ghost"}
                      size="sm"
                      className={state.viewMode === mode ? "" : "text-white hover:bg-white hover:bg-opacity-20"}
                      onClick={() => setState(prev => ({ ...prev, viewMode: mode }))}
                    >
                      {mode === 'panorama' && <Eye className="h-4 w-4" />}
                      {mode === 'vr' && <Move className="h-4 w-4" />}
                      {mode === 'dollhouse' && <Layout className="h-4 w-4" />}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Cursor indicator */}
          <div 
            className="absolute pointer-events-none"
            style={{
              left: mousePosition.x - (viewerRef.current?.getBoundingClientRect().left || 0),
              top: mousePosition.y - (viewerRef.current?.getBoundingClientRect().top || 0)
            }}
          >
            {isDragging ? (
              <Hand className="h-6 w-6 text-white drop-shadow-lg" />
            ) : (
              <MousePointer className="h-6 w-6 text-white drop-shadow-lg" />
            )}
          </div>
        </div>
      )}

      {/* Room Information Panel */}
      {state.showInfo && currentRoom && (
        <div className="absolute top-16 right-4 w-80 pointer-events-auto">
          <Card className="bg-black bg-opacity-90 text-white border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-lg">{currentRoom.name}</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white hover:bg-opacity-20"
                  onClick={() => setState(prev => ({ ...prev, showInfo: false }))}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              {currentRoom.description && (
                <p className="text-gray-300 text-sm mb-3">{currentRoom.description}</p>
              )}
              
              {currentRoom.features && currentRoom.features.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Features:</h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    {currentRoom.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {currentRoom.hotspots && currentRoom.hotspots.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Interactive Points:</h4>
                  <div className="space-y-2">
                    {currentRoom.hotspots.map((hotspot) => (
                      <button
                        key={hotspot.id}
                        className="w-full text-left p-2 rounded bg-gray-800 hover:bg-gray-700 transition-colors"
                        onClick={() => handleHotspotClick(hotspot)}
                      >
                        <div className="flex items-center">
                          {hotspot.type === 'room_transition' ? (
                            <Navigation2 className="h-4 w-4 text-blue-400 mr-2" />
                          ) : (
                            <Info className="h-4 w-4 text-yellow-400 mr-2" />
                          )}
                          <span className="text-sm font-medium">{hotspot.title}</span>
                        </div>
                        {hotspot.description && (
                          <p className="text-xs text-gray-400 mt-1 ml-6">{hotspot.description}</p>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Instructions overlay for first-time users */}
      {!isDragging && state.zoom === 1 && (
        <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 pointer-events-none">
          <div className="bg-black bg-opacity-70 rounded-lg px-4 py-2 text-white text-sm">
            <p className="flex items-center">
              <MousePointer className="h-4 w-4 mr-2" />
              Click and drag to look around • Click hotspots to navigate
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VrViewer;