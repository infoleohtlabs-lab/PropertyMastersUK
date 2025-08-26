import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  SkipBack,
  SkipForward,
  RotateCcw,
  Settings,
  Camera,
  Eye,
  Layout,
  Info,
  Download,
  Share2,
  Bookmark,
  Clock,
  MapPin,
  Home,
  Bed,
  Bath,
  ChefHat,
  Car,
  TreePine,
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Monitor,
  Smartphone,
  Tablet
} from 'lucide-react';
import { Button } from './ui/Button';
import { Card, CardContent } from './ui/Card';
import { showToast } from './ui/Toast';

interface VideoPlayerProps {
  propertyId: string;
  propertyTitle: string;
  videos: PropertyVideo[];
  onClose?: () => void;
  className?: string;
  autoplay?: boolean;
  showControls?: boolean;
}

interface PropertyVideo {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  duration: number; // in seconds
  type: 'walkthrough' | 'drone' | 'room_focus' | 'virtual_staging' | 'neighborhood' | 'agent_intro';
  room?: string;
  description?: string;
  cameraAngles?: CameraAngle[];
  chapters?: VideoChapter[];
  quality: VideoQuality[];
}

interface CameraAngle {
  id: string;
  name: string;
  timestamp: number;
  thumbnail: string;
  description?: string;
}

interface VideoChapter {
  id: string;
  title: string;
  startTime: number;
  endTime: number;
  thumbnail: string;
  description?: string;
  room?: string;
}

interface VideoQuality {
  label: string;
  value: string;
  url: string;
  bitrate?: number;
}

interface PlayerState {
  currentVideo: string;
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  isFullscreen: boolean;
  quality: string;
  playbackRate: number;
  showControls: boolean;
  showChapters: boolean;
  showAngles: boolean;
  showSettings: boolean;
  showInfo: boolean;
  buffered: number;
  isLoading: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  propertyId,
  propertyTitle,
  videos,
  onClose,
  className = '',
  autoplay = false,
  showControls = true
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<PlayerState>({
    currentVideo: videos.length > 0 ? videos[0].id : '',
    isPlaying: false,
    isMuted: false,
    volume: 1,
    currentTime: 0,
    duration: 0,
    isFullscreen: false,
    quality: 'auto',
    playbackRate: 1,
    showControls: true,
    showChapters: false,
    showAngles: false,
    showSettings: false,
    showInfo: false,
    buffered: 0,
    isLoading: true
  });
  const [controlsTimeout, setControlsTimeout] = useState<NodeJS.Timeout | null>(null);

  // Mock videos data if not provided
  const mockVideos: PropertyVideo[] = [
    {
      id: 'walkthrough',
      title: 'Property Walkthrough',
      url: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=property%20walkthrough%20video%20thumbnail%20modern%20house%20interior&image_size=landscape_16_9',
      thumbnail: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=property%20walkthrough%20video%20thumbnail%20modern%20house%20interior&image_size=landscape_16_9',
      duration: 180,
      type: 'walkthrough',
      description: 'Complete walkthrough of the property showcasing all rooms and features',
      quality: [
        { label: 'Auto', value: 'auto', url: '#' },
        { label: '1080p', value: '1080p', url: '#', bitrate: 5000 },
        { label: '720p', value: '720p', url: '#', bitrate: 2500 },
        { label: '480p', value: '480p', url: '#', bitrate: 1000 }
      ],
      chapters: [
        {
          id: 'entrance',
          title: 'Entrance & Hallway',
          startTime: 0,
          endTime: 30,
          thumbnail: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20house%20entrance%20hallway%20interior&image_size=square',
          description: 'Welcome area and main hallway',
          room: 'hallway'
        },
        {
          id: 'living',
          title: 'Living Room',
          startTime: 30,
          endTime: 75,
          thumbnail: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20living%20room%20interior%20spacious&image_size=square',
          description: 'Spacious living area with modern furnishings',
          room: 'living_room'
        },
        {
          id: 'kitchen',
          title: 'Kitchen & Dining',
          startTime: 75,
          endTime: 120,
          thumbnail: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20kitchen%20granite%20countertops%20stainless%20appliances&image_size=square',
          description: 'Modern kitchen with granite countertops',
          room: 'kitchen'
        },
        {
          id: 'bedrooms',
          title: 'Bedrooms',
          startTime: 120,
          endTime: 165,
          thumbnail: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=master%20bedroom%20interior%20king%20bed%20modern&image_size=square',
          description: 'Master bedroom and additional bedrooms',
          room: 'bedroom'
        },
        {
          id: 'outdoor',
          title: 'Outdoor Spaces',
          startTime: 165,
          endTime: 180,
          thumbnail: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20house%20backyard%20garden%20patio&image_size=square',
          description: 'Garden, patio, and outdoor amenities',
          room: 'garden'
        }
      ],
      cameraAngles: [
        {
          id: 'wide',
          name: 'Wide Angle',
          timestamp: 45,
          thumbnail: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=wide%20angle%20living%20room%20view&image_size=square',
          description: 'Wide view of the living space'
        },
        {
          id: 'detail',
          name: 'Detail Shot',
          timestamp: 90,
          thumbnail: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=kitchen%20detail%20granite%20countertop%20close%20up&image_size=square',
          description: 'Close-up of kitchen features'
        }
      ]
    },
    {
      id: 'drone',
      title: 'Aerial View',
      url: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=aerial%20drone%20view%20modern%20house%20neighborhood&image_size=landscape_16_9',
      thumbnail: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=aerial%20drone%20view%20modern%20house%20neighborhood&image_size=landscape_16_9',
      duration: 90,
      type: 'drone',
      description: 'Aerial footage showcasing the property and surrounding area',
      quality: [
        { label: 'Auto', value: 'auto', url: '#' },
        { label: '4K', value: '4k', url: '#', bitrate: 15000 },
        { label: '1080p', value: '1080p', url: '#', bitrate: 5000 },
        { label: '720p', value: '720p', url: '#', bitrate: 2500 }
      ]
    },
    {
      id: 'virtual_staging',
      title: 'Virtual Staging',
      url: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=virtual%20staging%20before%20after%20empty%20furnished%20room&image_size=landscape_16_9',
      thumbnail: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=virtual%20staging%20before%20after%20empty%20furnished%20room&image_size=landscape_16_9',
      duration: 60,
      type: 'virtual_staging',
      description: 'See how the property looks with different furniture arrangements',
      quality: [
        { label: 'Auto', value: 'auto', url: '#' },
        { label: '1080p', value: '1080p', url: '#', bitrate: 5000 },
        { label: '720p', value: '720p', url: '#', bitrate: 2500 }
      ]
    }
  ];

  const currentVideos = videos.length > 0 ? videos : mockVideos;
  const currentVideo = currentVideos.find(video => video.id === state.currentVideo) || currentVideos[0];

  useEffect(() => {
    if (autoplay && videoRef.current) {
      videoRef.current.play();
      setState(prev => ({ ...prev, isPlaying: true }));
    }
  }, [autoplay]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setState(prev => ({ 
        ...prev, 
        duration: video.duration,
        isLoading: false
      }));
    };

    const handleTimeUpdate = () => {
      setState(prev => ({ 
        ...prev, 
        currentTime: video.currentTime,
        buffered: video.buffered.length > 0 ? video.buffered.end(0) : 0
      }));
    };

    const handlePlay = () => setState(prev => ({ ...prev, isPlaying: true }));
    const handlePause = () => setState(prev => ({ ...prev, isPlaying: false }));
    const handleVolumeChange = () => {
      setState(prev => ({ 
        ...prev, 
        volume: video.volume,
        isMuted: video.muted
      }));
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('volumechange', handleVolumeChange);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('volumechange', handleVolumeChange);
    };
  }, [currentVideo]);

  useEffect(() => {
    if (controlsTimeout) {
      clearTimeout(controlsTimeout);
    }

    if (state.showControls && state.isPlaying) {
      const timeout = setTimeout(() => {
        setState(prev => ({ ...prev, showControls: false }));
      }, 3000);
      setControlsTimeout(timeout);
    }

    return () => {
      if (controlsTimeout) {
        clearTimeout(controlsTimeout);
      }
    };
  }, [state.showControls, state.isPlaying]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (state.isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
    }
  };

  const handleVolumeChange = (volume: number) => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
    }
  };

  const handleSeek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const handleVideoChange = (videoId: string) => {
    setState(prev => ({ 
      ...prev, 
      currentVideo: videoId,
      currentTime: 0,
      isLoading: true
    }));
    showToast.success(`Switched to ${currentVideos.find(v => v.id === videoId)?.title}`);
  };

  const handleChapterClick = (chapter: VideoChapter) => {
    handleSeek(chapter.startTime);
    showToast.success(`Jumped to ${chapter.title}`);
  };

  const handleAngleClick = (angle: CameraAngle) => {
    handleSeek(angle.timestamp);
    showToast.success(`Switched to ${angle.name}`);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setState(prev => ({ ...prev, isFullscreen: true }));
    } else {
      document.exitFullscreen();
      setState(prev => ({ ...prev, isFullscreen: false }));
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getVideoTypeIcon = (type: PropertyVideo['type']) => {
    switch (type) {
      case 'walkthrough': return <Home className="h-4 w-4" />;
      case 'drone': return <Camera className="h-4 w-4" />;
      case 'room_focus': return <Eye className="h-4 w-4" />;
      case 'virtual_staging': return <Layout className="h-4 w-4" />;
      case 'neighborhood': return <MapPin className="h-4 w-4" />;
      case 'agent_intro': return <Info className="h-4 w-4" />;
      default: return <Play className="h-4 w-4" />;
    }
  };

  const getRoomIcon = (room?: string) => {
    switch (room) {
      case 'living_room': return <Home className="h-3 w-3" />;
      case 'bedroom': return <Bed className="h-3 w-3" />;
      case 'bathroom': return <Bath className="h-3 w-3" />;
      case 'kitchen': return <ChefHat className="h-3 w-3" />;
      case 'garage': return <Car className="h-3 w-3" />;
      case 'garden': return <TreePine className="h-3 w-3" />;
      default: return <Home className="h-3 w-3" />;
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`relative bg-black rounded-lg overflow-hidden ${className}`}
      onMouseMove={() => setState(prev => ({ ...prev, showControls: true }))}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        poster={currentVideo?.thumbnail}
        preload="metadata"
        onClick={togglePlay}
      >
        <source src={currentVideo?.url} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Loading Overlay */}
      {state.isLoading && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-lg font-medium">Loading Video...</p>
          </div>
        </div>
      )}

      {/* Controls Overlay */}
      {(state.showControls || !state.isPlaying) && showControls && (
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black pointer-events-none">
          {/* Top Controls */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-auto">
            <div className="flex items-center space-x-3">
              <div className="bg-black bg-opacity-70 rounded-lg px-3 py-2 text-white">
                <h3 className="font-medium">{propertyTitle}</h3>
                <p className="text-sm text-gray-300">{currentVideo?.title}</p>
              </div>
              
              {currentVideo?.type && (
                <div className="bg-black bg-opacity-70 rounded-lg px-2 py-1 text-white flex items-center">
                  {getVideoTypeIcon(currentVideo.type)}
                  <span className="ml-1 text-sm capitalize">{currentVideo.type.replace('_', ' ')}</span>
                </div>
              )}
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
                onClick={() => setState(prev => ({ ...prev, showSettings: !prev.showSettings }))}
              >
                <Settings className="h-4 w-4" />
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

          {/* Center Play Button */}
          {!state.isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
              <Button
                variant="ghost"
                size="lg"
                className="bg-black bg-opacity-70 text-white hover:bg-opacity-90 rounded-full p-6"
                onClick={togglePlay}
              >
                <Play className="h-12 w-12" />
              </Button>
            </div>
          )}

          {/* Bottom Controls */}
          <div className="absolute bottom-4 left-4 right-4 pointer-events-auto">
            {/* Progress Bar */}
            <div className="mb-4">
              <div className="relative">
                <div className="h-1 bg-gray-600 rounded-full">
                  <div 
                    className="h-1 bg-gray-400 rounded-full"
                    style={{ width: `${(state.buffered / state.duration) * 100}%` }}
                  ></div>
                  <div 
                    className="h-1 bg-blue-500 rounded-full absolute top-0"
                    style={{ width: `${(state.currentTime / state.duration) * 100}%` }}
                  ></div>
                </div>
                <input
                  type="range"
                  min="0"
                  max={state.duration}
                  value={state.currentTime}
                  onChange={(e) => handleSeek(Number(e.target.value))}
                  className="absolute inset-0 w-full h-1 opacity-0 cursor-pointer"
                />
              </div>
              
              {/* Chapter Markers */}
              {currentVideo?.chapters && (
                <div className="relative mt-1">
                  {currentVideo.chapters.map((chapter) => (
                    <div
                      key={chapter.id}
                      className="absolute w-2 h-2 bg-yellow-400 rounded-full transform -translate-x-1/2 cursor-pointer hover:scale-125 transition-transform"
                      style={{ left: `${(chapter.startTime / state.duration) * 100}%` }}
                      onClick={() => handleChapterClick(chapter)}
                      title={chapter.title}
                    ></div>
                  ))}
                </div>
              )}
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white hover:bg-opacity-20"
                  onClick={togglePlay}
                >
                  {state.isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white hover:bg-opacity-20"
                  onClick={() => handleSeek(Math.max(0, state.currentTime - 10))}
                >
                  <SkipBack className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white hover:bg-opacity-20"
                  onClick={() => handleSeek(Math.min(state.duration, state.currentTime + 10))}
                >
                  <SkipForward className="h-4 w-4" />
                </Button>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white hover:bg-opacity-20"
                    onClick={toggleMute}
                  >
                    {state.isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </Button>
                  
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={state.isMuted ? 0 : state.volume}
                    onChange={(e) => handleVolumeChange(Number(e.target.value))}
                    className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                
                <div className="text-white text-sm">
                  {formatTime(state.currentTime)} / {formatTime(state.duration)}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {/* Video Selection */}
                {currentVideos.length > 1 && (
                  <div className="relative">
                    <select
                      value={state.currentVideo}
                      onChange={(e) => handleVideoChange(e.target.value)}
                      className="bg-black bg-opacity-70 text-white rounded px-3 py-1 text-sm border border-gray-600 focus:border-blue-500 focus:outline-none"
                    >
                      {currentVideos.map((video) => (
                        <option key={video.id} value={video.id}>
                          {video.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                
                {/* Chapters Button */}
                {currentVideo?.chapters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white hover:bg-opacity-20"
                    onClick={() => setState(prev => ({ ...prev, showChapters: !prev.showChapters }))}
                  >
                    <Clock className="h-4 w-4" />
                  </Button>
                )}
                
                {/* Camera Angles Button */}
                {currentVideo?.cameraAngles && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white hover:bg-opacity-20"
                    onClick={() => setState(prev => ({ ...prev, showAngles: !prev.showAngles }))}
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chapters Panel */}
      {state.showChapters && currentVideo?.chapters && (
        <div className="absolute top-16 right-4 w-80 pointer-events-auto">
          <Card className="bg-black bg-opacity-90 text-white border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Chapters</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white hover:bg-opacity-20"
                  onClick={() => setState(prev => ({ ...prev, showChapters: false }))}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {currentVideo.chapters.map((chapter) => (
                  <button
                    key={chapter.id}
                    className="w-full text-left p-2 rounded bg-gray-800 hover:bg-gray-700 transition-colors flex items-center space-x-3"
                    onClick={() => handleChapterClick(chapter)}
                  >
                    <img 
                      src={chapter.thumbnail} 
                      alt={chapter.title}
                      className="w-12 h-8 object-cover rounded"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        {chapter.room && getRoomIcon(chapter.room)}
                        <span className="text-sm font-medium">{chapter.title}</span>
                      </div>
                      <p className="text-xs text-gray-400">
                        {formatTime(chapter.startTime)} - {formatTime(chapter.endTime)}
                      </p>
                      {chapter.description && (
                        <p className="text-xs text-gray-400 mt-1">{chapter.description}</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Camera Angles Panel */}
      {state.showAngles && currentVideo?.cameraAngles && (
        <div className="absolute top-16 left-4 w-80 pointer-events-auto">
          <Card className="bg-black bg-opacity-90 text-white border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Camera Angles</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white hover:bg-opacity-20"
                  onClick={() => setState(prev => ({ ...prev, showAngles: false }))}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                {currentVideo.cameraAngles.map((angle) => (
                  <button
                    key={angle.id}
                    className="text-left p-2 rounded bg-gray-800 hover:bg-gray-700 transition-colors"
                    onClick={() => handleAngleClick(angle)}
                  >
                    <img 
                      src={angle.thumbnail} 
                      alt={angle.name}
                      className="w-full h-20 object-cover rounded mb-2"
                    />
                    <div>
                      <span className="text-sm font-medium">{angle.name}</span>
                      <p className="text-xs text-gray-400">
                        {formatTime(angle.timestamp)}
                      </p>
                      {angle.description && (
                        <p className="text-xs text-gray-400 mt-1">{angle.description}</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Settings Panel */}
      {state.showSettings && (
        <div className="absolute top-16 right-4 w-64 pointer-events-auto">
          <Card className="bg-black bg-opacity-90 text-white border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Settings</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white hover:bg-opacity-20"
                  onClick={() => setState(prev => ({ ...prev, showSettings: false }))}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                {/* Quality Selection */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Quality</label>
                  <select
                    value={state.quality}
                    onChange={(e) => setState(prev => ({ ...prev, quality: e.target.value }))}
                    className="w-full bg-gray-800 text-white rounded px-3 py-2 text-sm border border-gray-600 focus:border-blue-500 focus:outline-none"
                  >
                    {currentVideo?.quality.map((q) => (
                      <option key={q.value} value={q.value}>
                        {q.label} {q.bitrate && `(${q.bitrate}kbps)`}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Playback Speed */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Playback Speed</label>
                  <select
                    value={state.playbackRate}
                    onChange={(e) => {
                      const rate = Number(e.target.value);
                      setState(prev => ({ ...prev, playbackRate: rate }));
                      if (videoRef.current) {
                        videoRef.current.playbackRate = rate;
                      }
                    }}
                    className="w-full bg-gray-800 text-white rounded px-3 py-2 text-sm border border-gray-600 focus:border-blue-500 focus:outline-none"
                  >
                    <option value={0.5}>0.5x</option>
                    <option value={0.75}>0.75x</option>
                    <option value={1}>Normal</option>
                    <option value={1.25}>1.25x</option>
                    <option value={1.5}>1.5x</option>
                    <option value={2}>2x</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Info Panel */}
      {state.showInfo && currentVideo && (
        <div className="absolute top-16 left-4 w-80 pointer-events-auto">
          <Card className="bg-black bg-opacity-90 text-white border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">{currentVideo.title}</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white hover:bg-opacity-20"
                  onClick={() => setState(prev => ({ ...prev, showInfo: false }))}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              {currentVideo.description && (
                <p className="text-gray-300 text-sm mb-3">{currentVideo.description}</p>
              )}
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Duration:</span>
                  <span>{formatTime(currentVideo.duration)}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Type:</span>
                  <span className="capitalize">{currentVideo.type.replace('_', ' ')}</span>
                </div>
                
                {currentVideo.room && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Room:</span>
                    <span className="flex items-center">
                      {getRoomIcon(currentVideo.room)}
                      <span className="ml-1 capitalize">{currentVideo.room.replace('_', ' ')}</span>
                    </span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-white border-gray-600 hover:bg-white hover:bg-opacity-20"
                  onClick={() => showToast.info('Download feature coming soon')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-white border-gray-600 hover:bg-white hover:bg-opacity-20"
                  onClick={() => showToast.info('Share feature coming soon')}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;