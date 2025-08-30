import * as React from 'react';
import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, User, Phone, Mail, Eye, Edit, Trash2, CheckCircle, XCircle, AlertCircle, Video, Home, Bell, Filter, Search, ChevronLeft, ChevronRight, ChevronDown, Plus, Download, Upload, Settings, RefreshCw, Zap, Award, Target, FileText } from 'lucide-react';
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
                <div className="flex border border-gray-300 rounded-md shadow-inner">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-2 text-sm transition-all duration-200 ${viewMode === 'list' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                  >
                    List
                  </button>
                  <button
                    onClick={() => setViewMode('calendar')}
                    className={`px-3 py-2 text-sm transition-all duration-200 ${viewMode === 'calendar' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                  >
                    Calendar
                  </button>
                </div>
                <Button onClick={() => setShowBookingModal(true)} className="transition-all duration-200 hover:scale-105 shadow-lg">
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
          <Card className="p-6 hover:shadow-lg transition-all duration-200 hover:scale-105 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-blue-600">Today's Bookings</p>
                <p className="text-2xl font-bold text-blue-700">{todayBookings.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-all duration-200 hover:scale-105 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-green-600">Upcoming</p>
                <p className="text-2xl font-bold text-green-700">{upcomingBookings.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-all duration-200 hover:scale-105 bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertCircle className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-yellow-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-700">{pendingBookings.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-all duration-200 hover:scale-105 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-purple-600">Total Bookings</p>
                <p className="text-2xl font-bold text-purple-700">{bookings.length}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Enhanced Search and Filters */}
        <Card className="mb-6 shadow-lg border-0 bg-gradient-to-r from-gray-50 to-white">
          <div className="p-6">
            <div className="form-group">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Filter className="w-5 h-5 mr-2 text-blue-600" />
                Filter Bookings
              </h3>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search bookings, clients, properties..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full input-field focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
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
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                >
                  <option value="all">All Types</option>
                  <option value="viewing">Viewing</option>
                  <option value="virtual_viewing">Virtual Viewing</option>
                  <option value="valuation">Valuation</option>
                  <option value="inspection">Inspection</option>
                </select>
                
                <button
                  onClick={() => setShowConflicts(!showConflicts)}
                  className={`px-4 py-2 rounded-lg border transition-all duration-200 hover:scale-105 ${
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
                  className={`px-4 py-2 rounded-lg border transition-all duration-200 hover:scale-105 ${
                    autoRefresh 
                      ? 'bg-green-50 border-green-200 text-green-700' 
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <RefreshCw className={`h-4 w-4 inline mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
                  Auto Refresh
                </button>
              </div>
              <div className="flex justify-end mt-4 space-x-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setStatusFilter('all');
                    setTypeFilter('all');
                    setSelectedDate('');
                    setSearchTerm('');
                  }}
                  className="btn-secondary transition-all duration-200 hover:scale-105"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>
        </Card>

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
            <Card key={booking.id} className={`overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border-0 bg-gradient-to-r from-white to-gray-50 ${booking.conflictDetected ? 'border-red-200 bg-gradient-to-r from-red-50 to-red-100' : ''}`}>
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
                
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-start gap-4">
                    <div className="relative group">
                      <img
                        src={booking.propertyImage}
                        alt={booking.propertyTitle}
                        className="w-24 h-24 object-cover rounded-xl shadow-md transition-transform duration-200 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-xl transition-all duration-200"></div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-blue-100 rounded-lg transition-transform duration-200 hover:scale-110">
                            {getTypeIcon(booking.type)}
                          </div>
                          <h3 className="text-xl font-bold text-gray-900">
                            {booking.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </h3>
                        </div>
                        <Badge className={`${getStatusColor(booking.status)} px-3 py-1 font-semibold shadow-sm`}>
                          {booking.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                        <Badge className={`${getPriorityColor(booking.priority)} px-3 py-1 font-semibold shadow-sm`}>
                          {booking.priority.toUpperCase()}
                        </Badge>
                        {booking.autoReminder && (
                          <Badge className="bg-blue-100 text-blue-800 px-3 py-1 font-semibold shadow-sm">
                            <Bell className="h-3 w-3 inline mr-1" />
                            Auto Reminder
                          </Badge>
                        )}
                      </div>
                      <h4 className="text-lg font-bold text-gray-900 mb-2">
                        {booking.propertyTitle}
                      </h4>
                      <div className="flex items-center text-gray-600 text-sm mb-3">
                        <MapPin className="h-4 w-4 mr-2 text-blue-500" />
                        <span className="font-medium">{booking.propertyAddress}</span>
                      </div>
                      <div className="flex items-center gap-6 text-sm">
                        <div className="flex items-center bg-gray-100 px-3 py-2 rounded-lg">
                          <Calendar className="h-4 w-4 mr-2 text-green-500" />
                          <span className="font-semibold text-gray-800">{new Date(booking.scheduledDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center bg-gray-100 px-3 py-2 rounded-lg">
                          <Clock className="h-4 w-4 mr-2 text-purple-500" />
                          <span className="font-semibold text-gray-800">{booking.scheduledTime} ({booking.duration} min)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-3">
                    {!booking.reminderSent && booking.autoReminder && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => sendAutomatedReminder(booking.id)}
                        className="btn-secondary transition-all duration-200 hover:scale-105 shadow-md"
                      >
                        <Bell className="h-4 w-4 mr-2" />
                        Send Reminder
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="btn-secondary transition-all duration-200 hover:scale-105 shadow-md"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => handleDeleteBooking(booking.id)}
                      className="transition-all duration-200 hover:scale-105 shadow-md"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>

                {/* Client Information */}
                <div className="bg-gray-50 p-4 rounded-lg border mb-6">
                  <h5 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <User className="h-4 w-4 mr-2 text-blue-500" />
                    Client Information
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="form-group">
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg border hover:shadow-md transition-shadow duration-200">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <User className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{booking.clientName}</p>
                          <p className="text-xs text-gray-500 font-medium">Client</p>
                        </div>
                      </div>
                    </div>
                    <div className="form-group">
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg border hover:shadow-md transition-shadow duration-200">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Mail className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{booking.clientEmail}</p>
                          <p className="text-xs text-gray-500 font-medium">Email</p>
                        </div>
                      </div>
                    </div>
                    <div className="form-group">
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg border hover:shadow-md transition-shadow duration-200">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Phone className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{booking.clientPhone}</p>
                          <p className="text-xs text-gray-500 font-medium">Phone</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes and Special Requirements */}
                {(booking.notes || booking.specialRequirements) && (
                  <div className="mb-6">
                    {booking.notes && (
                      <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm font-semibold text-blue-700 mb-2 flex items-center">
                          <FileText className="h-4 w-4 mr-2" />
                          Notes:
                        </p>
                        <p className="text-sm text-blue-800 leading-relaxed">{booking.notes}</p>
                      </div>
                    )}
                    {booking.specialRequirements && (
                      <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                        <p className="text-sm font-semibold text-amber-700 mb-2 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-2" />
                          Special Requirements:
                        </p>
                        <p className="text-sm text-amber-800 leading-relaxed">{booking.specialRequirements}</p>
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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-6 border-t border-gray-200 gap-4">
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <span className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      booking.reminderSent 
                        ? 'bg-green-100 text-green-700 border border-green-200' 
                        : 'bg-gray-100 text-gray-500 border border-gray-200'
                    }`}>
                      <CheckCircle className="h-3.5 w-3.5" />
                      Reminder {booking.reminderSent ? 'Sent' : 'Pending'}
                    </span>
                    <span className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      booking.confirmationSent 
                        ? 'bg-green-100 text-green-700 border border-green-200' 
                        : 'bg-gray-100 text-gray-500 border border-gray-200'
                    }`}>
                      <CheckCircle className="h-3.5 w-3.5" />
                      Confirmation {booking.confirmationSent ? 'Sent' : 'Pending'}
                    </span>
                  </div>
                  
                  <div className="flex gap-2 flex-wrap">
                    {booking.status === 'pending' && (
                      <Button 
                        size="sm" 
                        onClick={() => handleStatusChange(booking.id, 'confirmed')}
                        className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                      >
                        <CheckCircle className="h-4 w-4 mr-1.5" />
                        Confirm
                      </Button>
                    )}
                    {booking.status === 'confirmed' && (
                      <Button 
                        size="sm" 
                        onClick={() => handleStatusChange(booking.id, 'completed')}
                        className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                      >
                        <CheckCircle className="h-4 w-4 mr-1.5" />
                        Complete
                      </Button>
                    )}
                    {(booking.status === 'pending' || booking.status === 'confirmed') && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleStatusChange(booking.id, 'cancelled')}
                        className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 hover:text-red-700 shadow-sm hover:shadow-md transform hover:scale-105 transition-all duration-200"
                      >
                        <XCircle className="h-4 w-4 mr-1.5" />
                        Cancel
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        setSelectedBookingForReminder(booking)
                        setShowReminderModal(true)
                      }}
                      className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 shadow-sm hover:shadow-md transform hover:scale-105 transition-all duration-200"
                    >
                      <Bell className="h-4 w-4 mr-1.5" />
                      Remind
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setEditingBooking(booking)}
                      className="border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 shadow-sm hover:shadow-md transform hover:scale-105 transition-all duration-200"
                    >
                      <Edit className="h-4 w-4 mr-1.5" />
                      Edit
                    </Button>
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

          {/* Booking Details Section */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-blue-600" />
              Booking Details
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="form-group">
                <label className="flex items-center text-sm font-medium text-gray-700 mb-3">
                  <Home className="h-4 w-4 mr-2 text-blue-600" />
                  Booking Type
                </label>
                <div className="relative">
                  <select
                    value={bookingForm.type}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, type: e.target.value }))}
                    className="input-field pl-10 appearance-none bg-white transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400"
                  >
                    <option value="viewing">Property Viewing</option>
                    <option value="virtual_viewing">Virtual Viewing</option>
                    <option value="valuation">Property Valuation</option>
                    <option value="inspection">Property Inspection</option>
                  </select>
                  <Eye className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>
              <div className="form-group">
                <label className="flex items-center text-sm font-medium text-gray-700 mb-3">
                  <Clock className="h-4 w-4 mr-2 text-blue-600" />
                  Duration (minutes)
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    value={bookingForm.duration}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                    min="15"
                    step="15"
                    className="input-field pl-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400"
                    placeholder="60"
                  />
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Client Information Section */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="h-5 w-5 mr-2 text-green-600" />
              Client Information
            </h3>
            <div className="space-y-4">
              <div className="form-group">
                <label className="flex items-center text-sm font-medium text-gray-700 mb-3">
                  <User className="h-4 w-4 mr-2 text-green-600" />
                  Client Name
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    value={bookingForm.clientName}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, clientName: e.target.value }))}
                    placeholder="Enter client full name"
                    className="input-field pl-10 transition-all duration-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 hover:border-gray-400"
                  />
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="form-group">
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-3">
                    <Mail className="h-4 w-4 mr-2 text-green-600" />
                    Email Address
                  </label>
                  <div className="relative">
                    <Input
                      type="email"
                      value={bookingForm.clientEmail}
                      onChange={(e) => setBookingForm(prev => ({ ...prev, clientEmail: e.target.value }))}
                      placeholder="client@email.com"
                      className="input-field pl-10 transition-all duration-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 hover:border-gray-400"
                    />
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-3">
                    <Phone className="h-4 w-4 mr-2 text-green-600" />
                    Phone Number
                  </label>
                  <div className="relative">
                    <Input
                      type="tel"
                      value={bookingForm.clientPhone}
                      onChange={(e) => setBookingForm(prev => ({ ...prev, clientPhone: e.target.value }))}
                      placeholder="+44 7xxx xxx xxx"
                      className="input-field pl-10 transition-all duration-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 hover:border-gray-400"
                    />
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Scheduling Section */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-blue-600" />
              Scheduling
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="form-group">
                <label className="flex items-center text-sm font-medium text-gray-700 mb-3">
                  <Calendar className="h-4 w-4 mr-2 text-blue-600" />
                  Date
                </label>
                <div className="relative">
                  <Input
                    type="date"
                    value={bookingForm.scheduledDate}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, scheduledDate: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                    className="input-field pl-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400"
                  />
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>
              <div className="form-group">
                <label className="flex items-center text-sm font-medium text-gray-700 mb-3">
                  <Clock className="h-4 w-4 mr-2 text-blue-600" />
                  Time
                </label>
                <div className="relative">
                  <Input
                    type="time"
                    value={bookingForm.scheduledTime}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, scheduledTime: e.target.value }))}
                    className="input-field pl-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400"
                  />
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information Section */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-purple-600" />
              Additional Information
            </h3>
            <div className="space-y-4">
              <div className="form-group">
                <label className="flex items-center text-sm font-medium text-gray-700 mb-3">
                  <FileText className="h-4 w-4 mr-2 text-purple-600" />
                  Notes
                </label>
                <div className="relative">
                  <textarea
                    value={bookingForm.notes}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                    className="input-field pl-10 pt-3 transition-all duration-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 hover:border-gray-400 resize-none"
                    placeholder="Additional notes about the booking, client preferences, or important details"
                  />
                  <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                </div>
              </div>

              <div className="form-group">
                <label className="flex items-center text-sm font-medium text-gray-700 mb-3">
                  <AlertCircle className="h-4 w-4 mr-2 text-purple-600" />
                  Special Requirements
                </label>
                <div className="relative">
                  <textarea
                    value={bookingForm.specialRequirements}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, specialRequirements: e.target.value }))}
                    rows={2}
                    className="input-field pl-10 pt-3 transition-all duration-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 hover:border-gray-400 resize-none"
                    placeholder="Any special requirements, accessibility needs, or specific instructions"
                  />
                  <AlertCircle className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Priority & Settings Section */}
          <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-xl border border-orange-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Target className="h-5 w-5 mr-2 text-orange-600" />
              Priority & Settings
            </h3>
            <div className="space-y-4">
              <div className="form-group">
                <label className="flex items-center text-sm font-medium text-gray-700 mb-3">
                  <Target className="h-4 w-4 mr-2 text-orange-600" />
                  Priority Level
                </label>
                <div className="relative">
                  <select
                    value={bookingForm.priority || 'medium'}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, priority: e.target.value as any }))}
                    className="input-field pl-10 transition-all duration-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 hover:border-gray-400 appearance-none bg-white"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                    <option value="urgent">Urgent</option>
                  </select>
                  <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700 flex items-center">
                  <Settings className="h-4 w-4 mr-2 text-orange-600" />
                  Automated Settings
                </h4>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-orange-100 hover:border-orange-200 transition-colors">
                    <input
                      type="checkbox"
                      id="autoReminder"
                      checked={bookingForm.autoReminder !== false}
                      onChange={(e) => setBookingForm(prev => ({ ...prev, autoReminder: e.target.checked }))}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 h-4 w-4"
                    />
                    <label htmlFor="autoReminder" className="text-sm text-gray-700 flex items-center cursor-pointer">
                      <Bell className="h-4 w-4 mr-2 text-orange-600" />
                      Enable automated reminders
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-orange-100 hover:border-orange-200 transition-colors">
                    <input
                      type="checkbox"
                      id="followUpRequired"
                      checked={bookingForm.followUpRequired === true}
                      onChange={(e) => setBookingForm(prev => ({ ...prev, followUpRequired: e.target.checked }))}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 h-4 w-4"
                    />
                    <label htmlFor="followUpRequired" className="text-sm text-gray-700 flex items-center cursor-pointer">
                      <CheckCircle className="h-4 w-4 mr-2 text-orange-600" />
                      Require follow-up after completion
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setShowBookingModal(false)}
              className="btn-secondary flex-1 flex items-center justify-center gap-2 py-3 text-base font-medium transition-all duration-200 hover:scale-105"
            >
              <XCircle className="h-5 w-5" />
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmitBooking}
              disabled={!bookingForm.clientName || !bookingForm.clientEmail || !bookingForm.scheduledDate || !bookingForm.scheduledTime}
              className="btn-primary flex-1 flex items-center justify-center gap-2 py-3 text-base font-medium transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <Calendar className="h-5 w-5" />
              Create Booking
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default BookingManagement;