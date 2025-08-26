import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, MapPin, Phone, Mail, AlertCircle, CheckCircle, X, Edit, Trash2 } from 'lucide-react';
import { bookingService, Booking, BookingSlot, BookingRequest, BookingFilters } from '../services/bookingService';
import { toast } from 'sonner';

interface BookingCalendarProps {
  agentId?: string;
  propertyId?: string;
  clientView?: boolean;
  onBookingSelect?: (booking: Booking) => void;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  bookings: Booking[];
  availableSlots: BookingSlot[];
}

const BookingCalendar: React.FC<BookingCalendarProps> = ({
  agentId,
  propertyId,
  clientView = false,
  onBookingSelect
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [availableSlots, setAvailableSlots] = useState<BookingSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<BookingSlot | null>(null);
  const [bookingForm, setBookingForm] = useState<BookingRequest>({
    propertyId: propertyId || '',
    slotId: '',
    attendees: [{ name: '', email: '', relationship: 'primary' }],
    notes: '',
    specialRequirements: ''
  });
  const [filters, setFilters] = useState<BookingFilters>({
    status: ['pending', 'confirmed'],
    agentId,
    propertyId
  });

  // Generate calendar days for the current month
  const generateCalendarDays = (): CalendarDay[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days: CalendarDay[] = [];
    const currentDateObj = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      const dateStr = currentDateObj.toISOString().split('T')[0];
      const dayBookings = bookings.filter(booking => 
        booking.date === dateStr
      );
      const daySlots = availableSlots.filter(slot => 
        slot.date === dateStr
      );
      
      days.push({
        date: new Date(currentDateObj),
        isCurrentMonth: currentDateObj.getMonth() === month,
        bookings: dayBookings,
        availableSlots: daySlots
      });
      
      currentDateObj.setDate(currentDateObj.getDate() + 1);
    }
    
    return days;
  };

  // Load bookings and availability
  const loadCalendarData = async () => {
    setLoading(true);
    try {
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const [bookingsResponse, slotsResponse] = await Promise.all([
        bookingService.getBookings({
          ...filters,
          dateFrom: startOfMonth.toISOString().split('T')[0],
          dateTo: endOfMonth.toISOString().split('T')[0]
        }),
        agentId ? bookingService.getAvailableSlots(
          propertyId || '',
          agentId,
          startOfMonth.toISOString().split('T')[0],
          endOfMonth.toISOString().split('T')[0]
        ) : Promise.resolve([])
      ]);
      
      setBookings(bookingsResponse.bookings);
      setAvailableSlots(slotsResponse);
    } catch (error) {
      console.error('Error loading calendar data:', error);
      toast.error('Failed to load calendar data');
    } finally {
      setLoading(false);
    }
  };

  // Handle booking creation
  const handleCreateBooking = async () => {
    if (!selectedSlot) return;
    
    try {
      setLoading(true);
      const newBooking = await bookingService.createBooking({
        ...bookingForm,
        slotId: selectedSlot.id
      });
      
      setBookings(prev => [...prev, newBooking]);
      setShowBookingModal(false);
      setSelectedSlot(null);
      setBookingForm({
        propertyId: propertyId || '',
        slotId: '',
        attendees: [{ name: '', email: '', relationship: 'primary' }],
        notes: '',
        specialRequirements: ''
      });
      
      toast.success('Booking created successfully');
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error('Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  // Handle booking status update
  const handleBookingStatusUpdate = async (bookingId: string, status: Booking['status']) => {
    try {
      const updatedBooking = await bookingService.updateBookingStatus(bookingId, status);
      setBookings(prev => prev.map(booking => 
        booking.id === bookingId ? updatedBooking : booking
      ));
      toast.success(`Booking ${status} successfully`);
    } catch (error) {
      console.error('Error updating booking status:', error);
      toast.error('Failed to update booking status');
    }
  };

  // Handle slot selection
  const handleSlotSelect = (slot: BookingSlot) => {
    if (clientView) {
      setSelectedSlot(slot);
      setBookingForm(prev => ({ ...prev, slotId: slot.id }));
      setShowBookingModal(true);
    }
  };

  // Add attendee to booking form
  const addAttendee = () => {
    setBookingForm(prev => ({
      ...prev,
      attendees: [...prev.attendees, { name: '', email: '', relationship: 'family' }]
    }));
  };

  // Remove attendee from booking form
  const removeAttendee = (index: number) => {
    setBookingForm(prev => ({
      ...prev,
      attendees: prev.attendees.filter((_, i) => i !== index)
    }));
  };

  useEffect(() => {
    loadCalendarData();
  }, [currentDate, filters]);

  const calendarDays = generateCalendarDays();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getStatusColor = (status: Booking['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'no_show': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Calendar Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Booking Calendar
          </h2>
          
          <div className="flex items-center gap-4">
            {/* Month Navigation */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ←
              </button>
              <span className="text-lg font-medium min-w-[200px] text-center">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </span>
              <button
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                →
              </button>
            </div>
            
            {/* View Toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Today
              </button>
            </div>
          </div>
        </div>
        
        {/* Filters */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Status:</span>
            <select
              value={filters.status?.join(',') || ''}
              onChange={(e) => setFilters(prev => ({
                ...prev,
                status: e.target.value ? e.target.value.split(',') : undefined
              }))}
              className="border border-gray-300 rounded-lg px-2 py-1"
            >
              <option value="">All</option>
              <option value="pending,confirmed">Active</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-1">
            {/* Day Headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                {day}
              </div>
            ))}
            
            {/* Calendar Days */}
            {calendarDays.map((day, index) => (
              <div
                key={index}
                className={`min-h-[120px] p-1 border border-gray-100 ${
                  !day.isCurrentMonth ? 'bg-gray-50' : 'bg-white'
                } ${
                  selectedDate?.toDateString() === day.date.toDateString() ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setSelectedDate(day.date)}
              >
                <div className={`text-sm font-medium mb-1 ${
                  !day.isCurrentMonth ? 'text-gray-400' : 'text-gray-900'
                }`}>
                  {day.date.getDate()}
                </div>
                
                {/* Available Slots */}
                {day.availableSlots.map(slot => (
                  <div
                    key={slot.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSlotSelect(slot);
                    }}
                    className="mb-1 p-1 bg-green-100 text-green-800 text-xs rounded cursor-pointer hover:bg-green-200 transition-colors"
                  >
                    {slot.startTime} - {slot.endTime}
                  </div>
                ))}
                
                {/* Bookings */}
                {day.bookings.map(booking => (
                  <div
                    key={booking.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onBookingSelect?.(booking);
                    }}
                    className={`mb-1 p-1 text-xs rounded cursor-pointer transition-colors ${
                      getStatusColor(booking.status)
                    }`}
                  >
                    <div className="font-medium truncate">
                      {booking.startTime} - {booking.client?.name}
                    </div>
                    <div className="text-xs opacity-75 truncate">
                      {booking.bookingType}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {showBookingModal && selectedSlot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Book Viewing
                </h3>
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                {/* Slot Details */}
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <Calendar className="h-4 w-4" />
                    {selectedSlot.date}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    {selectedSlot.startTime} - {selectedSlot.endTime}
                  </div>
                </div>
                
                {/* Attendees */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Attendees
                  </label>
                  {bookingForm.attendees.map((attendee, index) => (
                    <div key={index} className="grid grid-cols-2 gap-2 mb-2">
                      <input
                        type="text"
                        placeholder="Name"
                        value={attendee.name}
                        onChange={(e) => setBookingForm(prev => ({
                          ...prev,
                          attendees: prev.attendees.map((a, i) => 
                            i === index ? { ...a, name: e.target.value } : a
                          )
                        }))}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      />
                      <div className="flex gap-1">
                        <input
                          type="email"
                          placeholder="Email"
                          value={attendee.email}
                          onChange={(e) => setBookingForm(prev => ({
                            ...prev,
                            attendees: prev.attendees.map((a, i) => 
                              i === index ? { ...a, email: e.target.value } : a
                            )
                          }))}
                          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        />
                        {index > 0 && (
                          <button
                            onClick={() => removeAttendee(index)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={addAttendee}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    + Add Attendee
                  </button>
                </div>
                
                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={bookingForm.notes}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    rows={3}
                    placeholder="Any additional notes or requirements..."
                  />
                </div>
                
                {/* Special Requirements */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Special Requirements
                  </label>
                  <input
                    type="text"
                    value={bookingForm.specialRequirements}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, specialRequirements: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    placeholder="Accessibility needs, parking, etc."
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateBooking}
                  disabled={loading || !bookingForm.attendees[0].name || !bookingForm.attendees[0].email}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Booking...' : 'Book Viewing'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingCalendar;