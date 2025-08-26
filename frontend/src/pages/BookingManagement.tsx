import * as React from 'react';
import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, User, Phone, Mail, Eye, Edit, Trash2, CheckCircle, XCircle, AlertCircle, Video, Home, Bell, Filter, Search, ChevronLeft, ChevronRight, Plus, Download, Upload, Settings, RefreshCw, Zap, Award, Target } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';

interface Booking {
  id: string;
  type: 'viewing' | 'virtual_viewing' | 'valuation' | 'inspection';
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show' | 'rescheduled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  scheduledDate: string;
  scheduledTime: string;
  duration: number; // in minutes
  propertyTitle: string;
  propertyAddress: string;
  propertyImage: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  agentName: string;
  notes?: string;
  specialRequirements?: string;
  reminderSent: boolean;
  confirmationSent: boolean;
  meetingLink?: string;
  createdAt: string;
  rating?: number;
  feedback?: string;
  conflictDetected?: boolean;
  autoReminder?: boolean;
  followUpRequired?: boolean;
}

interface BookingFormData {
  type: string;
  propertyId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  scheduledDate: string;
  scheduledTime: string;
  duration: number;
  notes: string;
  specialRequirements: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  autoReminder?: boolean;
  followUpRequired?: boolean;
}

const BookingManagement: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [viewMode, setViewMode] = useState<'calendar' | 'list' | 'timeline'>('list');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [showConflicts, setShowConflicts] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [selectedBookingForReminder, setSelectedBookingForReminder] = useState<Booking | null>(null);
  
  const [bookingForm, setBookingForm] = useState<BookingFormData>({
    type: 'viewing',
    propertyId: '',
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    scheduledDate: '',
    scheduledTime: '',
    duration: 30,
    notes: '',
    specialRequirements: '',
  });

  // Mock data - replace with API calls
  useEffect(() => {
    const mockBookings: Booking[] = [
      {
        id: '1',
        type: 'viewing',
        status: 'confirmed',
        priority: 'medium',
        scheduledDate: '2024-02-01',
        scheduledTime: '10:00',
        duration: 30,
        propertyTitle: '3-Bedroom House in Central London',
        propertyAddress: '123 High Street, London, SW1A 1AA',
        propertyImage: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20three%20bedroom%20house%20exterior%20london%20brick%20facade&image_size=landscape_4_3',
        clientName: 'John Smith',
        clientEmail: 'john.smith@email.com',
        clientPhone: '+44 7123 456789',
        agentName: 'Sarah Johnson',
        notes: 'Client is very interested, looking to move quickly',
        reminderSent: true,
        confirmationSent: true,
        createdAt: '2024-01-25T10:00:00Z',
        rating: 5,
        autoReminder: true,
        followUpRequired: false,
      },
      {
        id: '2',
        type: 'virtual_viewing',
        status: 'pending',
        priority: 'high',
        scheduledDate: '2024-02-01',
        scheduledTime: '14:00',
        duration: 45,
        propertyTitle: '2-Bedroom Apartment in Canary Wharf',
        propertyAddress: '456 Park Lane, London, W1K 1AA',
        propertyImage: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=luxury%20apartment%20exterior%20modern%20glass%20building%20canary%20wharf&image_size=landscape_4_3',
        clientName: 'Emma Wilson',
        clientEmail: 'emma.wilson@email.com',
        clientPhone: '+44 7987 654321',
        agentName: 'Michael Brown',
        specialRequirements: 'Client is overseas, needs virtual tour',
        meetingLink: 'https://meet.google.com/abc-defg-hij',
        reminderSent: false,
        confirmationSent: false,
        createdAt: '2024-01-26T14:30:00Z',
        autoReminder: true,
        followUpRequired: true,
      },
      {
        id: '3',
        type: 'valuation',
        status: 'completed',
        priority: 'medium',
        scheduledDate: '2024-01-30',
        scheduledTime: '11:00',
        duration: 60,
        propertyTitle: '4-Bedroom Victorian House',
        propertyAddress: '789 Victoria Road, London, SW19 2AA',
        propertyImage: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=victorian%20house%20exterior%20london%20red%20brick%20bay%20windows&image_size=landscape_4_3',
        clientName: 'David Thompson',
        clientEmail: 'david.thompson@email.com',
        clientPhone: '+44 7555 123456',
        agentName: 'Sarah Johnson',
        notes: 'Property valuation for mortgage purposes',
        reminderSent: true,
        confirmationSent: true,
        createdAt: '2024-01-20T09:00:00Z',
        rating: 4,
        feedback: 'Professional and thorough valuation service',
        autoReminder: false,
        followUpRequired: false,
      },
      {
        id: '4',
        type: 'inspection',
        status: 'rescheduled',
        priority: 'urgent',
        scheduledDate: '2024-02-02',
        scheduledTime: '09:00',
        duration: 90,
        propertyTitle: '1-Bedroom Studio Apartment',
        propertyAddress: '321 Oxford Street, London, W1C 1AA',
        propertyImage: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20studio%20apartment%20exterior%20oxford%20street%20london&image_size=landscape_4_3',
        clientName: 'Lisa Anderson',
        clientEmail: 'lisa.anderson@email.com',
        clientPhone: '+44 7777 888999',
        agentName: 'Michael Brown',
        notes: 'Routine inspection - tenant present required',
        specialRequirements: 'Access to all rooms including storage',
        reminderSent: true,
        confirmationSent: false,
        createdAt: '2024-01-28T16:00:00Z',
        autoReminder: true,
        followUpRequired: true,
      },
      {
        id: '5',
        type: 'viewing',
        status: 'pending',
        priority: 'high',
        scheduledDate: '2024-02-01',
        scheduledTime: '10:30',
        duration: 30,
        propertyTitle: 'Modern Penthouse',
        propertyAddress: '555 Thames View, London, SE1 9AA',
        propertyImage: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=luxury%20penthouse%20exterior%20thames%20view%20london&image_size=landscape_4_3',
        clientName: 'Robert Chen',
        clientEmail: 'robert.chen@email.com',
        clientPhone: '+44 7444 555666',
        agentName: 'Sarah Johnson',
        notes: 'Potential conflict with booking #1',
        reminderSent: false,
        confirmationSent: false,
        createdAt: '2024-01-29T11:00:00Z',
        conflictDetected: true,
        autoReminder: true,
        followUpRequired: false,
      },
    ];

    setTimeout(() => {
      setBookings(mockBookings);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredBookings = bookings.filter(booking => {
    const matchesDate = !selectedDate || booking.scheduledDate === selectedDate;
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    const matchesType = typeFilter === 'all' || booking.type === typeFilter;
    return matchesDate && matchesStatus && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'no_show': return 'bg-gray-100 text-gray-800';
      case 'rescheduled': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Conflict detection
  const detectConflicts = (newBooking: Booking, existingBookings: Booking[]) => {
    return existingBookings.some(booking => {
      if (booking.id === newBooking.id) return false
      if (booking.scheduledDate !== newBooking.scheduledDate) return false
      
      const newStart = new Date(`${newBooking.scheduledDate}T${newBooking.scheduledTime}:00`)
      const newEnd = new Date(newStart.getTime() + newBooking.duration * 60000)
      const existingStart = new Date(`${booking.scheduledDate}T${booking.scheduledTime}:00`)
      const existingEnd = new Date(existingStart.getTime() + booking.duration * 60000)
      
      return (newStart < existingEnd && newEnd > existingStart)
    })
  }

  // Calendar navigation
  const navigateCalendar = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setCurrentDate(newDate)
  }

  // Get calendar days
  const getCalendarDays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    
    const days = []
    for (let i = 0; i < 42; i++) {
      const day = new Date(startDate)
      day.setDate(startDate.getDate() + i)
      days.push(day)
    }
    return days
  }

  // Get bookings for a specific date
  const getBookingsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return filteredBookings.filter(booking => booking.scheduledDate === dateStr)
  }

  // Send automated reminder
  const sendAutomatedReminder = async (bookingId: string) => {
    try {
      // Mock API call - replace with actual implementation
      console.log(`Sending reminder for booking ${bookingId}`)
      setBookings(prev => prev.map(booking => 
        booking.id === bookingId 
          ? { ...booking, reminderSent: true }
          : booking
      ))
    } catch (error) {
      console.error('Failed to send reminder:', error)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'viewing': return <Eye className="h-4 w-4" />;
      case 'virtual_viewing': return <Video className="h-4 w-4" />;
      case 'valuation': return <Home className="h-4 w-4" />;
      case 'inspection': return <CheckCircle className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  const handleStatusChange = (bookingId: string, newStatus: string) => {
    setBookings(prev => prev.map(booking => 
      booking.id === bookingId 
        ? { ...booking, status: newStatus as any }
        : booking
    ));
  };

  const handleDeleteBooking = (bookingId: string) => {
    setBookings(prev => prev.filter(booking => booking.id !== bookingId));
  };

  const handleSubmitBooking = () => {
    const newBooking: Booking = {
      id: Date.now().toString(),
      type: bookingForm.type as any,
      status: 'pending',
      priority: 'medium',
      scheduledDate: bookingForm.scheduledDate,
      scheduledTime: bookingForm.scheduledTime,
      duration: bookingForm.duration,
      propertyTitle: 'Selected Property', // This would come from property selection
      propertyAddress: 'Property Address',
      propertyImage: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20house%20exterior%20property%20listing&image_size=landscape_4_3',
      clientName: bookingForm.clientName,
      clientEmail: bookingForm.clientEmail,
      clientPhone: bookingForm.clientPhone,
      agentName: 'Current Agent',
      notes: bookingForm.notes,
      specialRequirements: bookingForm.specialRequirements,
      reminderSent: false,
      confirmationSent: false,
      createdAt: new Date().toISOString(),
    };

    setBookings(prev => [newBooking, ...prev]);
    setBookingForm({
      type: 'viewing',
      propertyId: '',
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      scheduledDate: '',
      scheduledTime: '',
      duration: 30,
      notes: '',
      specialRequirements: '',
    });
    setShowBookingModal(false);
  };

  const todayBookings = bookings.filter(b => b.scheduledDate === new Date().toISOString().split('T')[0]);
  const upcomingBookings = bookings.filter(b => new Date(b.scheduledDate) > new Date());
  const pendingBookings = bookings.filter(b => b.status === 'pending');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Booking Management</h1>
              <p className="text-gray-600 mt-1">Manage property viewings and appointments</p>
            </div>
            <div className="flex gap-3 mt-4 lg:mt-0">
              <div className="flex border border-gray-300 rounded-md">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 text-sm ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
                >
                  List
                </button>
                <button
                  onClick={() => setViewMode('calendar')}
                  className={`px-3 py-2 text-sm ${viewMode === 'calendar' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
                >
                  Calendar
                </button>
              </div>
              <Button onClick={() => setShowBookingModal(true)}>
                <Calendar className="h-4 w-4 mr-2" />
                New Booking
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Today's Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{todayBookings.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Upcoming</p>
                <p className="text-2xl font-bold text-gray-900">{upcomingBookings.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertCircle className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{pendingBookings.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Enhanced Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search bookings, clients, properties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex-1">
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="rescheduled">Rescheduled</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="viewing">Viewing</option>
            <option value="virtual_viewing">Virtual Viewing</option>
            <option value="valuation">Valuation</option>
            <option value="inspection">Inspection</option>
          </select>
          
          <button
            onClick={() => setShowConflicts(!showConflicts)}
            className={`px-4 py-2 rounded-lg border transition-colors ${
              showConflicts 
                ? 'bg-red-50 border-red-200 text-red-700' 
                : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Filter className="h-4 w-4 inline mr-2" />
            {showConflicts ? 'Hide Conflicts' : 'Show Conflicts'}
          </button>
          
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-4 py-2 rounded-lg border transition-colors ${
              autoRefresh 
                ? 'bg-green-50 border-green-200 text-green-700' 
                : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
            }`}
          >
            <RefreshCw className={`h-4 w-4 inline mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            Auto Refresh
          </button>
        </div>

        {/* Calendar/List View */}
        {viewMode === 'calendar' ? (
          <div className="bg-white rounded-lg shadow">
            {/* Calendar Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <button
                onClick={() => navigateCalendar('prev')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              
              <h2 className="text-lg font-semibold">
                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h2>
              
              <button
                onClick={() => navigateCalendar('next')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
            
            {/* Calendar Grid */}
            <div className="p-4">
              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1">
                {getCalendarDays().map((day, index) => {
                  const dayBookings = getBookingsForDate(day)
                  const isCurrentMonth = day.getMonth() === currentDate.getMonth()
                  const isToday = day.toDateString() === new Date().toDateString()
                  
                  return (
                    <div
                      key={index}
                      className={`min-h-24 p-1 border border-gray-100 ${
                        isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                      } ${isToday ? 'bg-blue-50 border-blue-200' : ''}`}
                    >
                      <div className={`text-sm font-medium mb-1 ${
                        isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                      } ${isToday ? 'text-blue-600' : ''}`}>
                        {day.getDate()}
                      </div>
                      
                      <div className="space-y-1">
                        {dayBookings.slice(0, 3).map(booking => (
                          <div
                            key={booking.id}
                            className={`text-xs p-1 rounded truncate cursor-pointer ${
                              getStatusColor(booking.status)
                            } ${booking.conflictDetected ? 'border border-red-300' : ''}`}
                          >
                            {booking.scheduledTime} - {booking.clientName}
                          </div>
                        ))}
                        {dayBookings.length > 3 && (
                          <div className="text-xs text-gray-500 text-center">
                            +{dayBookings.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        ) : (
          /* Bookings List */
          <div className="space-y-6">
            {filteredBookings.map((booking) => (
            <Card key={booking.id} className={`overflow-hidden ${booking.conflictDetected ? 'border-red-200 bg-red-50' : ''}`}>
              <div className="p-6">
                {/* Conflict Alert */}
                {booking.conflictDetected && (
                  <div className="mb-4 p-3 bg-red-100 border border-red-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Zap className="h-4 w-4 text-red-600" />
                      <span className="text-sm font-medium text-red-800">Scheduling Conflict Detected</span>
                    </div>
                    <p className="text-sm text-red-700 mt-1">
                      This booking may overlap with another appointment. Please review and reschedule if necessary.
                    </p>
                  </div>
                )}
                
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <img
                      src={booking.propertyImage}
                      alt={booking.propertyTitle}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(booking.type)}
                          <h3 className="text-lg font-semibold text-gray-900">
                            {booking.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </h3>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                          {booking.status.replace('_', ' ').toUpperCase()}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(booking.priority)}`}>
                          {booking.priority.toUpperCase()}
                        </span>
                        {booking.autoReminder && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            <Bell className="h-3 w-3 inline mr-1" />
                            Auto Reminder
                          </span>
                        )}
                      </div>
                      <h4 className="text-md font-medium text-gray-900 mb-1">
                        {booking.propertyTitle}
                      </h4>
                      <div className="flex items-center text-gray-600 text-sm mb-2">
                        <MapPin className="h-4 w-4 mr-1" />
                        {booking.propertyAddress}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(booking.scheduledDate).toLocaleDateString()}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {booking.scheduledTime} ({booking.duration} min)
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {!booking.reminderSent && booking.autoReminder && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => sendAutomatedReminder(booking.id)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Bell className="h-4 w-4 mr-1" />
                        Send Reminder
                      </Button>
                    )}
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDeleteBooking(booking.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Client Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{booking.clientName}</p>
                      <p className="text-xs text-gray-600">Client</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-900">{booking.clientEmail}</p>
                      <p className="text-xs text-gray-600">Email</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-900">{booking.clientPhone}</p>
                      <p className="text-xs text-gray-600">Phone</p>
                    </div>
                  </div>
                </div>

                {/* Notes and Special Requirements */}
                {(booking.notes || booking.specialRequirements) && (
                  <div className="mb-4">
                    {booking.notes && (
                      <div className="mb-2">
                        <p className="text-sm font-medium text-gray-700">Notes:</p>
                        <p className="text-sm text-gray-600">{booking.notes}</p>
                      </div>
                    )}
                    {booking.specialRequirements && (
                      <div>
                        <p className="text-sm font-medium text-gray-700">Special Requirements:</p>
                        <p className="text-sm text-gray-600">{booking.specialRequirements}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Meeting Link for Virtual Viewings */}
                {booking.type === 'virtual_viewing' && booking.meetingLink && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-1">Meeting Link:</p>
                    <a 
                      href={booking.meetingLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 underline"
                    >
                      {booking.meetingLink}
                    </a>
                  </div>
                )}

                {/* Rating and Feedback */}
                {booking.status === 'completed' && booking.rating && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-sm font-medium text-gray-700">Rating:</span>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Award
                            key={i}
                            className={`h-4 w-4 ${
                              i < booking.rating! ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">({booking.rating}/5)</span>
                    </div>
                    {booking.feedback && (
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Feedback:</span> {booking.feedback}
                      </p>
                    )}
                  </div>
                )}
                
                {/* Follow-up Required */}
                {booking.followUpRequired && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Target className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm font-medium text-yellow-800">Follow-up Required</span>
                    </div>
                    <p className="text-sm text-yellow-700 mt-1">
                      This booking requires additional follow-up action.
                    </p>
                  </div>
                )}

                {/* Status Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className={`flex items-center gap-1 ${
                      booking.reminderSent ? 'text-green-600' : 'text-gray-400'
                    }`}>
                      <CheckCircle className="h-4 w-4" />
                      Reminder {booking.reminderSent ? 'Sent' : 'Pending'}
                    </span>
                    <span className={`flex items-center gap-1 ${
                      booking.confirmationSent ? 'text-green-600' : 'text-gray-400'
                    }`}>
                      <CheckCircle className="h-4 w-4" />
                      Confirmation {booking.confirmationSent ? 'Sent' : 'Pending'}
                    </span>
                  </div>
                  
                  <div className="flex gap-2">
                    {booking.status === 'pending' && (
                      <Button 
                        size="sm" 
                        onClick={() => handleStatusChange(booking.id, 'confirmed')}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Confirm
                      </Button>
                    )}
                    {booking.status === 'confirmed' && (
                      <Button 
                        size="sm" 
                        onClick={() => handleStatusChange(booking.id, 'completed')}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Complete
                      </Button>
                    )}
                    {(booking.status === 'pending' || booking.status === 'confirmed') && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleStatusChange(booking.id, 'cancelled')}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
            ))}
            
            {filteredBookings.length === 0 && (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No bookings found
                </h3>
                <p className="text-gray-600 mb-4">
                  No bookings match your current filters
                </p>
                <Button onClick={() => setShowBookingModal(true)}>
                  Create New Booking
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Reminder Modal */}
      {showReminderModal && selectedBookingForReminder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Send Reminder</h2>
                <button
                  onClick={() => {
                    setShowReminderModal(false)
                    setSelectedBookingForReminder(null)
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900">{selectedBookingForReminder.propertyTitle}</h3>
                  <p className="text-sm text-gray-600">{selectedBookingForReminder.clientName}</p>
                  <p className="text-sm text-gray-600">
                    {selectedBookingForReminder.scheduledDate} at {selectedBookingForReminder.scheduledTime}
                  </p>
                </div>
                
                <div className="flex space-x-3">
                  <Button
                    onClick={() => {
                      sendAutomatedReminder(selectedBookingForReminder.id)
                      setShowReminderModal(false)
                      setSelectedBookingForReminder(null)
                    }}
                    className="flex-1"
                  >
                    <Bell className="h-4 w-4 mr-2" />
                    Send Reminder
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowReminderModal(false)
                      setSelectedBookingForReminder(null)
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Booking Modal */}
      <Modal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        title="Create New Booking"
      >
        <div className="space-y-6">
          {/* Conflict Detection Alert */}
          {bookingForm.scheduledDate && bookingForm.scheduledTime && (() => {
            const tempBooking: Booking = {
              id: 'temp',
              type: bookingForm.type as any,
              status: 'pending',
              priority: 'medium',
              scheduledDate: bookingForm.scheduledDate,
              scheduledTime: bookingForm.scheduledTime,
              duration: bookingForm.duration,
              propertyTitle: 'New Property',
              propertyAddress: 'New Address',
              propertyImage: '',
              clientName: bookingForm.clientName || 'New Client',
              clientEmail: bookingForm.clientEmail || '',
              clientPhone: bookingForm.clientPhone || '',
              agentName: 'Current Agent',
              notes: bookingForm.notes || '',
              specialRequirements: bookingForm.specialRequirements || '',
              reminderSent: false,
              confirmationSent: false,
              createdAt: new Date().toISOString(),
              autoReminder: true,
              followUpRequired: false
            };
            const hasConflicts = detectConflicts(tempBooking, bookings);
            return hasConflicts && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                  <span className="text-sm font-medium text-red-800">
                    Scheduling Conflict Detected
                  </span>
                </div>
                <p className="text-sm text-red-700 mt-1">
                  A conflicting booking exists for this time slot. Please choose a different time.
                </p>
              </div>
            );
          })()}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Booking Type
              </label>
              <select
                value={bookingForm.type}
                onChange={(e) => setBookingForm(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="viewing">Property Viewing</option>
                <option value="virtual_viewing">Virtual Viewing</option>
                <option value="valuation">Property Valuation</option>
                <option value="inspection">Property Inspection</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration (minutes)
              </label>
              <Input
                type="number"
                value={bookingForm.duration}
                onChange={(e) => setBookingForm(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                min="15"
                step="15"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Client Name
            </label>
            <Input
              type="text"
              value={bookingForm.clientName}
              onChange={(e) => setBookingForm(prev => ({ ...prev, clientName: e.target.value }))}
              placeholder="Enter client name"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <Input
                type="email"
                value={bookingForm.clientEmail}
                onChange={(e) => setBookingForm(prev => ({ ...prev, clientEmail: e.target.value }))}
                placeholder="client@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone
              </label>
              <Input
                type="tel"
                value={bookingForm.clientPhone}
                onChange={(e) => setBookingForm(prev => ({ ...prev, clientPhone: e.target.value }))}
                placeholder="+44 7xxx xxx xxx"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <Input
                type="date"
                value={bookingForm.scheduledDate}
                onChange={(e) => setBookingForm(prev => ({ ...prev, scheduledDate: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time
              </label>
              <Input
                type="time"
                value={bookingForm.scheduledTime}
                onChange={(e) => setBookingForm(prev => ({ ...prev, scheduledTime: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={bookingForm.notes}
              onChange={(e) => setBookingForm(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Additional notes about the booking"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Special Requirements
            </label>
            <textarea
              value={bookingForm.specialRequirements}
              onChange={(e) => setBookingForm(prev => ({ ...prev, specialRequirements: e.target.value }))}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Any special requirements or accessibility needs"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority Level
            </label>
            <select
              value={bookingForm.priority || 'medium'}
              onChange={(e) => setBookingForm(prev => ({ ...prev, priority: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">Automated Settings</h4>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="autoReminder"
                checked={bookingForm.autoReminder !== false}
                onChange={(e) => setBookingForm(prev => ({ ...prev, autoReminder: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="autoReminder" className="text-sm text-gray-700">
                Enable automated reminders
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="followUpRequired"
                checked={bookingForm.followUpRequired === true}
                onChange={(e) => setBookingForm(prev => ({ ...prev, followUpRequired: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="followUpRequired" className="text-sm text-gray-700">
                Require follow-up after completion
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowBookingModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitBooking}
              className="flex-1"
              disabled={!bookingForm.clientName || !bookingForm.clientEmail || !bookingForm.scheduledDate || !bookingForm.scheduledTime}
            >
              Create Booking
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default BookingManagement;