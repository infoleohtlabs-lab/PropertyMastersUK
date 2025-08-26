import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { showToast } from '../utils/toast';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  Mail,
  Building,
  Home,
  ChevronLeft,
  ChevronRight,
  Plus,
  Edit,
  Trash2,
  Eye,
  Filter,
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
  Users,
  Video,
  Car,
  Key,
  FileText,
  Bell,
  MessageSquare,
  Star,
  Download,
  Upload,
  RefreshCw,
  Settings,
  MoreHorizontal,
  CalendarDays,
  CalendarCheck,
  CalendarX
} from 'lucide-react';

interface Booking {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyAddress: string;
  propertyType: 'residential' | 'commercial' | 'land';
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  agentName: string;
  agentEmail: string;
  date: string;
  time: string;
  duration: number; // in minutes
  type: 'viewing' | 'valuation' | 'inspection' | 'virtual-tour' | 'key-handover';
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  priority: 'low' | 'medium' | 'high';
  notes: string;
  requirements: string[];
  createdAt: string;
  updatedAt: string;
  reminderSent: boolean;
  followUpRequired: boolean;
  rating?: number;
  feedback?: string;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  bookings: Booking[];
}

const BookingCalendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [activeTab, setActiveTab] = useState<'calendar' | 'bookings' | 'analytics'>('calendar');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);

  const [bookings, setBookings] = useState<Booking[]>([
    {
      id: '1',
      propertyId: 'prop-001',
      propertyTitle: 'Modern 2-Bed Apartment',
      propertyAddress: '123 High Street, London, SW1A 1AA',
      propertyType: 'residential',
      clientName: 'John Smith',
      clientEmail: 'john.smith@email.com',
      clientPhone: '+44 7700 900123',
      agentName: 'Sarah Johnson',
      agentEmail: 'sarah.johnson@propertymastersuk.com',
      date: '2024-01-25',
      time: '14:00',
      duration: 60,
      type: 'viewing',
      status: 'confirmed',
      priority: 'medium',
      notes: 'Client interested in immediate move-in. Prefers ground floor.',
      requirements: ['parking', 'pet-friendly', 'furnished'],
      createdAt: '2024-01-20',
      updatedAt: '2024-01-22',
      reminderSent: true,
      followUpRequired: false
    },
    {
      id: '2',
      propertyId: 'prop-002',
      propertyTitle: 'Commercial Office Space',
      propertyAddress: '456 Queen Street, Manchester, M1 1AA',
      propertyType: 'commercial',
      clientName: 'Mike Wilson',
      clientEmail: 'mike.wilson@business.com',
      clientPhone: '+44 7700 900456',
      agentName: 'David Brown',
      agentEmail: 'david.brown@propertymastersuk.com',
      date: '2024-01-26',
      time: '10:30',
      duration: 90,
      type: 'valuation',
      status: 'scheduled',
      priority: 'high',
      notes: 'Property valuation for potential purchase. Client has specific requirements for tech infrastructure.',
      requirements: ['high-speed-internet', 'parking', 'accessibility'],
      createdAt: '2024-01-18',
      updatedAt: '2024-01-20',
      reminderSent: false,
      followUpRequired: true
    },
    {
      id: '3',
      propertyId: 'prop-003',
      propertyTitle: 'Victorian Townhouse',
      propertyAddress: '789 King Street, Birmingham, B1 1AA',
      propertyType: 'residential',
      clientName: 'Emma Davis',
      clientEmail: 'emma.davis@email.com',
      clientPhone: '+44 7700 900789',
      agentName: 'Lisa White',
      agentEmail: 'lisa.white@propertymastersuk.com',
      date: '2024-01-27',
      time: '16:00',
      duration: 45,
      type: 'virtual-tour',
      status: 'confirmed',
      priority: 'medium',
      notes: 'Virtual tour for overseas client. Requires detailed video walkthrough.',
      requirements: ['virtual-tour', 'detailed-photos'],
      createdAt: '2024-01-15',
      updatedAt: '2024-01-18',
      reminderSent: true,
      followUpRequired: false,
      rating: 5,
      feedback: 'Excellent virtual tour, very detailed and professional.'
    },
    {
      id: '4',
      propertyId: 'prop-004',
      propertyTitle: 'Luxury Penthouse',
      propertyAddress: '321 Market Street, Leeds, LS1 1AA',
      propertyType: 'residential',
      clientName: 'Robert Taylor',
      clientEmail: 'robert.taylor@email.com',
      clientPhone: '+44 7700 900321',
      agentName: 'Michael Green',
      agentEmail: 'michael.green@propertymastersuk.com',
      date: '2024-01-24',
      time: '11:00',
      duration: 120,
      type: 'viewing',
      status: 'completed',
      priority: 'high',
      notes: 'High-value property viewing. Client very interested, follow-up required.',
      requirements: ['luxury-features', 'concierge', 'parking'],
      createdAt: '2024-01-10',
      updatedAt: '2024-01-24',
      reminderSent: true,
      followUpRequired: true,
      rating: 4,
      feedback: 'Great property, considering making an offer.'
    }
  ]);

  // Calendar generation logic
  const generateCalendarDays = (): CalendarDay[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days: CalendarDay[] = [];
    const today = new Date();
    
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const dayBookings = bookings.filter(booking => {
        const bookingDate = new Date(booking.date);
        return bookingDate.toDateString() === date.toDateString();
      });
      
      days.push({
        date,
        isCurrentMonth: date.getMonth() === month,
        isToday: date.toDateString() === today.toDateString(),
        bookings: dayBookings
      });
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays();

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.propertyTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.propertyAddress.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || booking.status === statusFilter;
    const matchesType = !typeFilter || booking.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-green-600 bg-green-100';
      case 'scheduled': return 'text-blue-600 bg-blue-100';
      case 'completed': return 'text-purple-600 bg-purple-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      case 'no-show': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'viewing': return Eye;
      case 'valuation': return FileText;
      case 'inspection': return Search;
      case 'virtual-tour': return Video;
      case 'key-handover': return Key;
      default: return Calendar;
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    const dayBookings = bookings.filter(booking => {
      const bookingDate = new Date(booking.date);
      return bookingDate.toDateString() === date.toDateString();
    });
    if (dayBookings.length > 0) {
      setSelectedBooking(dayBookings[0]);
    }
  };

  const handleCreateBooking = () => {
    setShowBookingForm(true);
    showToast('Booking creation form coming soon', 'info');
  };

  const handleUpdateBooking = (booking: Booking, status: string) => {
    const updatedBookings = bookings.map(b => 
      b.id === booking.id ? { ...b, status: status as any, updatedAt: new Date().toISOString().split('T')[0] } : b
    );
    setBookings(updatedBookings);
    showToast(`Booking ${status}`, 'success');
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Calendar</h1>
        <p className="text-gray-600">Manage property viewings, valuations, and appointments</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'calendar', label: 'Calendar', icon: Calendar },
            { id: 'bookings', label: 'Bookings', icon: CalendarCheck },
            { id: 'analytics', label: 'Analytics', icon: CalendarDays }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Calendar Tab */}
      {activeTab === 'calendar' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl">
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
                      Today
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                    <Button onClick={handleCreateBooking}>
                      <Plus className="w-4 h-4 mr-2" />
                      New Booking
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-1 mb-4">
                  {dayNames.map(day => (
                    <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((day, index) => (
                    <div
                      key={index}
                      onClick={() => handleDateClick(day.date)}
                      className={`min-h-[100px] p-2 border border-gray-200 cursor-pointer hover:bg-gray-50 ${
                        !day.isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''
                      } ${
                        day.isToday ? 'bg-blue-50 border-blue-200' : ''
                      } ${
                        selectedDate && selectedDate.toDateString() === day.date.toDateString()
                          ? 'bg-blue-100 border-blue-300'
                          : ''
                      }`}
                    >
                      <div className="text-sm font-medium mb-1">{day.date.getDate()}</div>
                      <div className="space-y-1">
                        {day.bookings.slice(0, 3).map((booking) => {
                          const TypeIcon = getTypeIcon(booking.type);
                          return (
                            <div
                              key={booking.id}
                              className={`text-xs p-1 rounded truncate ${
                                getStatusColor(booking.status)
                              }`}
                              title={`${booking.time} - ${booking.propertyTitle}`}
                            >
                              <div className="flex items-center space-x-1">
                                <TypeIcon className="w-3 h-3" />
                                <span>{booking.time}</span>
                              </div>
                            </div>
                          );
                        })}
                        {day.bookings.length > 3 && (
                          <div className="text-xs text-gray-500 text-center">
                            +{day.bookings.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Selected Day Details */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedDate
                    ? `${selectedDate.toLocaleDateString('en-GB', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}`
                    : 'Select a Date'
                  }
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedDate ? (
                  <div className="space-y-4">
                    {bookings
                      .filter(booking => {
                        const bookingDate = new Date(booking.date);
                        return bookingDate.toDateString() === selectedDate.toDateString();
                      })
                      .sort((a, b) => a.time.localeCompare(b.time))
                      .map((booking) => {
                        const TypeIcon = getTypeIcon(booking.type);
                        return (
                          <div
                            key={booking.id}
                            className="p-3 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => setSelectedBooking(booking)}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <TypeIcon className="w-4 h-4 text-blue-600" />
                                <span className="font-medium">{booking.time}</span>
                              </div>
                              <div className={`px-2 py-1 rounded-full text-xs ${
                                getStatusColor(booking.status)
                              }`}>
                                {booking.status}
                              </div>
                            </div>
                            <div className="text-sm text-gray-600 mb-1">
                              {booking.propertyTitle}
                            </div>
                            <div className="text-xs text-gray-500">
                              {booking.clientName} • {booking.duration}min
                            </div>
                          </div>
                        );
                      })
                    }
                    {bookings.filter(booking => {
                      const bookingDate = new Date(booking.date);
                      return bookingDate.toDateString() === selectedDate.toDateString();
                    }).length === 0 && (
                      <div className="text-center text-gray-500 py-8">
                        <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>No bookings for this date</p>
                        <Button onClick={handleCreateBooking} className="mt-4" size="sm">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Booking
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Click on a date to view bookings</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Booking Details */}
            {selectedBooking && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">Booking Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">{selectedBooking.propertyTitle}</h4>
                      <div className="flex items-center space-x-2 text-sm text-gray-600 mb-1">
                        <MapPin className="w-4 h-4" />
                        <span>{selectedBooking.propertyAddress}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>{selectedBooking.date} at {selectedBooking.time} ({selectedBooking.duration}min)</span>
                      </div>
                    </div>

                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Client Information</h5>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4" />
                          <span>{selectedBooking.clientName}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4" />
                          <span>{selectedBooking.clientEmail}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4" />
                          <span>{selectedBooking.clientPhone}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Agent</h5>
                      <div className="text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4" />
                          <span>{selectedBooking.agentName}</span>
                        </div>
                      </div>
                    </div>

                    {selectedBooking.notes && (
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Notes</h5>
                        <p className="text-sm text-gray-600">{selectedBooking.notes}</p>
                      </div>
                    )}

                    {selectedBooking.requirements.length > 0 && (
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Requirements</h5>
                        <div className="flex flex-wrap gap-2">
                          {selectedBooking.requirements.map((req, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                            >
                              {req}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex space-x-2">
                      {selectedBooking.status === 'scheduled' && (
                        <Button
                          onClick={() => handleUpdateBooking(selectedBooking, 'confirmed')}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Confirm
                        </Button>
                      )}
                      {(selectedBooking.status === 'scheduled' || selectedBooking.status === 'confirmed') && (
                        <Button
                          onClick={() => handleUpdateBooking(selectedBooking, 'completed')}
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <CalendarCheck className="w-4 h-4 mr-2" />
                          Complete
                        </Button>
                      )}
                      <Button
                        onClick={() => handleUpdateBooking(selectedBooking, 'cancelled')}
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-600 hover:bg-red-50"
                      >
                        <CalendarX className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Bookings Tab */}
      {activeTab === 'bookings' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-900">All Bookings ({bookings.length})</h2>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search bookings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="no-show">No Show</option>
              </select>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                <option value="viewing">Viewing</option>
                <option value="valuation">Valuation</option>
                <option value="inspection">Inspection</option>
                <option value="virtual-tour">Virtual Tour</option>
                <option value="key-handover">Key Handover</option>
              </select>
              <Button onClick={handleCreateBooking}>
                <Plus className="w-4 h-4 mr-2" />
                New Booking
              </Button>
            </div>
          </div>

          <div className="grid gap-6">
            {filteredBookings.map((booking) => {
              const TypeIcon = getTypeIcon(booking.type);
              return (
                <Card key={booking.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <TypeIcon className="w-5 h-5 text-blue-600" />
                          <CardTitle className="text-lg">{booking.propertyTitle}</CardTitle>
                          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                            getStatusColor(booking.status)
                          }`}>
                            {booking.status}
                          </div>
                          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                            getPriorityColor(booking.priority)
                          }`}>
                            {booking.priority}
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>{booking.propertyAddress}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <User className="w-4 h-4" />
                            <span>{booking.clientName}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{booking.date} at {booking.time}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">Agent: {booking.agentName}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">Duration: {booking.duration}min</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Building className="w-4 h-4 text-gray-400" />
                        <span className="text-sm capitalize">Type: {booking.propertyType}</span>
                      </div>
                    </div>

                    {booking.notes && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-600">{booking.notes}</p>
                      </div>
                    )}

                    {booking.requirements.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {booking.requirements.map((req, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                          >
                            {req}
                          </span>
                        ))}
                      </div>
                    )}

                    {booking.rating && (
                      <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm font-medium">Rating: {booking.rating}/5</span>
                        </div>
                        {booking.feedback && (
                          <p className="text-sm text-gray-600">{booking.feedback}</p>
                        )}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-3">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Contact Client
                      </Button>
                      {booking.status === 'scheduled' && (
                        <Button
                          onClick={() => handleUpdateBooking(booking, 'confirmed')}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Confirm
                        </Button>
                      )}
                      {(booking.status === 'scheduled' || booking.status === 'confirmed') && (
                        <Button
                          onClick={() => handleUpdateBooking(booking, 'completed')}
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <CalendarCheck className="w-4 h-4 mr-2" />
                          Complete
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Booking Analytics</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                    <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Confirmed</p>
                    <p className="text-2xl font-bold text-green-600">
                      {bookings.filter(b => b.status === 'confirmed').length}
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Completed</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {bookings.filter(b => b.status === 'completed').length}
                    </p>
                  </div>
                  <CalendarCheck className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Cancelled</p>
                    <p className="text-2xl font-bold text-red-600">
                      {bookings.filter(b => b.status === 'cancelled').length}
                    </p>
                  </div>
                  <CalendarX className="w-8 h-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Booking Types Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['viewing', 'valuation', 'inspection', 'virtual-tour', 'key-handover'].map(type => {
                    const count = bookings.filter(b => b.type === type).length;
                    const percentage = bookings.length > 0 ? (count / bookings.length) * 100 : 0;
                    return (
                      <div key={type}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="capitalize">{type.replace('-', ' ')}</span>
                          <span>{count} bookings</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full bg-blue-600"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bookings
                    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                    .slice(0, 5)
                    .map((booking) => {
                      const TypeIcon = getTypeIcon(booking.type);
                      return (
                        <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                          <div className="flex items-center space-x-3">
                            <TypeIcon className="w-4 h-4 text-blue-600" />
                            <div>
                              <p className="font-medium">{booking.propertyTitle}</p>
                              <p className="text-sm text-gray-600">{booking.clientName}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm">{booking.date}</p>
                            <p className={`text-xs px-2 py-1 rounded-full ${getStatusColor(booking.status)}`}>
                              {booking.status}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  }
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingCalendar;