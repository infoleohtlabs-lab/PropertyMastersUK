import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, MapPin, Phone, Mail, AlertCircle, CheckCircle, X, Edit, Trash2, Filter, Download, Send, Eye, MessageSquare } from 'lucide-react';
import { bookingService, Booking, BookingFilters, BookingStats } from '../services/bookingService';
import { toast } from 'sonner';
import BookingCalendar from './BookingCalendar';

interface BookingManagementProps {
  agentId?: string;
  userRole: 'admin' | 'agent' | 'client';
}

type ViewMode = 'list' | 'calendar' | 'analytics';

const BookingManagement: React.FC<BookingManagementProps> = ({
  agentId,
  userRole
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<BookingStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showBookingDetails, setShowBookingDetails] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<BookingFilters>({
    status: ['pending', 'confirmed'],
    agentId
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  // Load bookings
  const loadBookings = async () => {
    setLoading(true);
    try {
      const response = await bookingService.getBookings(
        filters,
        pagination.page,
        pagination.limit
      );
      setBookings(response.bookings);
      setPagination(prev => ({
        ...prev,
        total: response.total,
        pages: response.pages
      }));
    } catch (error) {
      console.error('Error loading bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  // Load booking statistics
  const loadStats = async () => {
    try {
      const statsData = await bookingService.getBookingStats(
        agentId,
        filters.dateFrom,
        filters.dateTo
      );
      setStats(statsData);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  // Handle booking status update
  const handleStatusUpdate = async (bookingId: string, status: Booking['status'], notes?: string) => {
    try {
      const updatedBooking = await bookingService.updateBookingStatus(bookingId, status, notes);
      setBookings(prev => prev.map(booking => 
        booking.id === bookingId ? updatedBooking : booking
      ));
      
      // Send notifications based on status
      if (status === 'confirmed') {
        await bookingService.sendBookingConfirmation(bookingId);
        toast.success('Booking confirmed and confirmation sent');
      } else {
        toast.success(`Booking ${status} successfully`);
      }
      
      loadStats(); // Refresh stats
    } catch (error) {
      console.error('Error updating booking status:', error);
      toast.error('Failed to update booking status');
    }
  };

  // Handle booking reschedule
  const handleReschedule = async (bookingId: string, newSlotId: string, reason?: string) => {
    try {
      const updatedBooking = await bookingService.rescheduleBooking({
        bookingId,
        newSlotId,
        reason
      });
      setBookings(prev => prev.map(booking => 
        booking.id === bookingId ? updatedBooking : booking
      ));
      toast.success('Booking rescheduled successfully');
    } catch (error) {
      console.error('Error rescheduling booking:', error);
      toast.error('Failed to reschedule booking');
    }
  };

  // Send reminder
  const handleSendReminder = async (bookingId: string) => {
    try {
      await bookingService.sendBookingReminder(bookingId);
      setBookings(prev => prev.map(booking => 
        booking.id === bookingId ? { ...booking, reminderSent: true } : booking
      ));
      toast.success('Reminder sent successfully');
    } catch (error) {
      console.error('Error sending reminder:', error);
      toast.error('Failed to send reminder');
    }
  };

  // Export bookings
  const handleExport = async () => {
    try {
      // This would typically generate and download a CSV/Excel file
      const bookingsData = bookings.map(booking => ({
        Date: booking.date,
        Time: `${booking.startTime} - ${booking.endTime}`,
        Client: booking.client?.name,
        Property: booking.property?.address,
        Status: booking.status,
        Type: booking.bookingType,
        Agent: booking.agent?.name
      }));
      
      const csv = [
        Object.keys(bookingsData[0]).join(','),
        ...bookingsData.map(row => Object.values(row).join(','))
      ].join('\n');
      
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bookings-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast.success('Bookings exported successfully');
    } catch (error) {
      console.error('Error exporting bookings:', error);
      toast.error('Failed to export bookings');
    }
  };

  useEffect(() => {
    loadBookings();
    loadStats();
  }, [filters, pagination.page]);

  const getStatusColor = (status: Booking['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'no_show': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: Booking['status']) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'confirmed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <X className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'no_show': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Booking Management</h1>
          
          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                List
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'calendar' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Calendar
              </button>
              <button
                onClick={() => setViewMode('analytics')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'analytics' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Analytics
              </button>
            </div>
            
            {/* Action Buttons */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="h-4 w-4" />
              Filters
            </button>
            
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>
        
        {/* Quick Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.totalBookings}</div>
              <div className="text-sm text-blue-600">Total Bookings</div>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{stats.pendingBookings}</div>
              <div className="text-sm text-yellow-600">Pending</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.confirmedBookings}</div>
              <div className="text-sm text-green-600">Confirmed</div>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{stats.completedBookings}</div>
              <div className="text-sm text-purple-600">Completed</div>
            </div>
            <div className="bg-red-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{stats.noShowRate.toFixed(1)}%</div>
              <div className="text-sm text-red-600">No Show Rate</div>
            </div>
          </div>
        )}
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.status?.join(',') || ''}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  status: e.target.value ? e.target.value.split(',') : undefined
                }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="no_show">No Show</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Booking Type</label>
              <select
                value={filters.bookingType?.join(',') || ''}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  bookingType: e.target.value ? e.target.value.split(',') : undefined
                }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="">All Types</option>
                <option value="viewing">Viewing</option>
                <option value="inspection">Inspection</option>
                <option value="valuation">Valuation</option>
                <option value="virtual_tour">Virtual Tour</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date From</label>
              <input
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date To</label>
              <input
                type="date"
                value={filters.dateTo || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
          </div>
          
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => setFilters({ agentId })}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Clear Filters
            </button>
            <button
              onClick={loadBookings}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* Content based on view mode */}
      {viewMode === 'calendar' && (
        <BookingCalendar
          agentId={agentId}
          clientView={userRole === 'client'}
          onBookingSelect={(booking) => {
            setSelectedBooking(booking);
            setShowBookingDetails(true);
          }}
        />
      )}

      {viewMode === 'list' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Bookings List</h3>
            
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No bookings found
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map(booking => (
                  <div key={booking.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${
                            getStatusColor(booking.status)
                          }`}>
                            {getStatusIcon(booking.status)}
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </span>
                          <span className="text-sm text-gray-500 capitalize">{booking.bookingType}</span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                              <Calendar className="h-4 w-4" />
                              {booking.date}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Clock className="h-4 w-4" />
                              {booking.startTime} - {booking.endTime}
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                              <Users className="h-4 w-4" />
                              {booking.client?.name}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Mail className="h-4 w-4" />
                              {booking.client?.email}
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                              <MapPin className="h-4 w-4" />
                              {booking.property?.address}
                            </div>
                            <div className="text-sm text-gray-500">
                              Agent: {booking.agent?.name}
                            </div>
                          </div>
                        </div>
                        
                        {booking.notes && (
                          <div className="mt-2 text-sm text-gray-600">
                            <strong>Notes:</strong> {booking.notes}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => {
                            setSelectedBooking(booking);
                            setShowBookingDetails(true);
                          }}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        
                        {userRole !== 'client' && booking.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Confirm Booking"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Cancel Booking"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        
                        {userRole !== 'client' && booking.status === 'confirmed' && !booking.reminderSent && (
                          <button
                            onClick={() => handleSendReminder(booking.id)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Send Reminder"
                          >
                            <Send className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-600">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} bookings
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page === 1}
                    className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1 bg-blue-600 text-white rounded-lg">
                    {pagination.page}
                  </span>
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page === pagination.pages}
                    className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {viewMode === 'analytics' && stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Booking Types Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Bookings by Type</h3>
            <div className="space-y-3">
              {stats.bookingsByType.map(item => (
                <div key={item.type} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 capitalize">{item.type}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(item.count / stats.totalBookings) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Popular Time Slots */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Time Slots</h3>
            <div className="space-y-3">
              {stats.popularTimeSlots.map(slot => (
                <div key={slot.time} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{slot.time}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${(slot.count / Math.max(...stats.popularTimeSlots.map(s => s.count))) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{slot.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Booking Details Modal */}
      {showBookingDetails && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Booking Details
                </h3>
                <button
                  onClick={() => setShowBookingDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Status and Type */}
                <div className="flex items-center gap-4">
                  <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${
                    getStatusColor(selectedBooking.status)
                  }`}>
                    {getStatusIcon(selectedBooking.status)}
                    {selectedBooking.status.charAt(0).toUpperCase() + selectedBooking.status.slice(1)}
                  </span>
                  <span className="text-sm text-gray-500 capitalize bg-gray-100 px-3 py-1 rounded-full">
                    {selectedBooking.bookingType}
                  </span>
                </div>
                
                {/* Date and Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <div className="flex items-center gap-2 text-gray-900">
                      <Calendar className="h-4 w-4" />
                      {selectedBooking.date}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                    <div className="flex items-center gap-2 text-gray-900">
                      <Clock className="h-4 w-4" />
                      {selectedBooking.startTime} - {selectedBooking.endTime}
                    </div>
                  </div>
                </div>
                
                {/* Property Details */}
                {selectedBooking.property && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Property</label>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="font-medium text-gray-900">{selectedBooking.property.title}</div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                        <MapPin className="h-4 w-4" />
                        {selectedBooking.property.address}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Client Details */}
                {selectedBooking.client && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Client</label>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="font-medium text-gray-900">{selectedBooking.client.name}</div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <div className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          {selectedBooking.client.email}
                        </div>
                        {selectedBooking.client.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-4 w-4" />
                            {selectedBooking.client.phone}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Attendees */}
                {selectedBooking.attendees && selectedBooking.attendees.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Attendees</label>
                    <div className="space-y-2">
                      {selectedBooking.attendees.map((attendee, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <Users className="h-4 w-4 text-gray-400" />
                          <div>
                            <div className="font-medium text-gray-900">{attendee.name}</div>
                            <div className="text-sm text-gray-600">{attendee.email}</div>
                          </div>
                          <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full capitalize">
                            {attendee.relationship}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Notes */}
                {selectedBooking.notes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                    <div className="bg-gray-50 p-4 rounded-lg text-gray-900">
                      {selectedBooking.notes}
                    </div>
                  </div>
                )}
                
                {/* Special Requirements */}
                {selectedBooking.specialRequirements && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Special Requirements</label>
                    <div className="bg-yellow-50 p-4 rounded-lg text-yellow-800">
                      {selectedBooking.specialRequirements}
                    </div>
                  </div>
                )}
                
                {/* Actions */}
                {userRole !== 'client' && (
                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    {selectedBooking.status === 'pending' && (
                      <>
                        <button
                          onClick={() => {
                            handleStatusUpdate(selectedBooking.id, 'confirmed');
                            setShowBookingDetails(false);
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Confirm
                        </button>
                        <button
                          onClick={() => {
                            handleStatusUpdate(selectedBooking.id, 'cancelled');
                            setShowBookingDetails(false);
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <X className="h-4 w-4" />
                          Cancel
                        </button>
                      </>
                    )}
                    
                    {selectedBooking.status === 'confirmed' && !selectedBooking.reminderSent && (
                      <button
                        onClick={() => {
                          handleSendReminder(selectedBooking.id);
                          setShowBookingDetails(false);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Send className="h-4 w-4" />
                        Send Reminder
                      </button>
                    )}
                    
                    <button
                      onClick={() => setShowBookingDetails(false)}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <MessageSquare className="h-4 w-4" />
                      Contact Client
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingManagement;