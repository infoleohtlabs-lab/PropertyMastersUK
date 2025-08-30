import { apiService } from './api';

export interface BookingSlot {
  id: string;
  propertyId: string;
  agentId: string;
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  bookingType: 'viewing' | 'inspection' | 'valuation' | 'virtual_tour';
  maxAttendees?: number;
  currentAttendees?: number;
}

export interface Booking {
  id: string;
  propertyId: string;
  agentId: string;
  clientId: string;
  slotId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  bookingType: 'viewing' | 'inspection' | 'valuation' | 'virtual_tour';
  attendees: BookingAttendee[];
  notes?: string;
  specialRequirements?: string;
  reminderSent: boolean;
  confirmationSent: boolean;
  createdAt: string;
  updatedAt: string;
  property?: {
    id: string;
    title: string;
    address: string;
    images: string[];
  };
  agent?: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  client?: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
}

export interface BookingAttendee {
  id: string;
  name: string;
  email: string;
  phone?: string;
  relationship: 'primary' | 'partner' | 'family' | 'advisor';
}

export interface BookingRequest {
  propertyId: string;
  slotId: string;
  attendees: Omit<BookingAttendee, 'id'>[];
  notes?: string;
  specialRequirements?: string;
}

export interface BookingFilters {
  status?: string[];
  bookingType?: string[];
  dateFrom?: string;
  dateTo?: string;
  agentId?: string;
  propertyId?: string;
  clientId?: string;
}

export interface AvailabilityRequest {
  agentId: string;
  date: string;
  duration: number; // in minutes
  bookingType: 'viewing' | 'inspection' | 'valuation' | 'virtual_tour';
}

export interface BookingStats {
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  noShowRate: number;
  averageBookingsPerDay: number;
  popularTimeSlots: { time: string; count: number }[];
  bookingsByType: { type: string; count: number }[];
}

export interface RescheduleRequest {
  bookingId: string;
  newSlotId: string;
  reason?: string;
}

class BookingService {
  // Get available slots for a property
  async getAvailableSlots(
    propertyId: string,
    agentId: string,
    dateFrom: string,
    dateTo: string,
    bookingType?: string
  ): Promise<BookingSlot[]> {
    const params = new URLSearchParams();
    params.append('propertyId', propertyId);
    params.append('agentId', agentId);
    params.append('dateFrom', dateFrom);
    params.append('dateTo', dateTo);
    if (bookingType) {
      params.append('bookingType', bookingType);
    }
    
    const response = await apiService.get(`/bookings/slots/available?${params}`);
    return (response as any).data;
  }

  // Create a new booking
  async createBooking(bookingData: BookingRequest): Promise<Booking> {
    const response = await apiService.post('/bookings', bookingData);
    return (response as any).data;
  }

  // Get bookings with filters
  async getBookings(
    filters?: BookingFilters,
    page = 1,
    limit = 20
  ): Promise<{ bookings: Booking[]; total: number; pages: number }> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(item => params.append(key, item.toString()));
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }
    
    const response = await apiService.get(`/bookings?${params}`);
    return (response as any).data;
  }

  // Get booking by ID
  async getBooking(id: string): Promise<Booking> {
    const response = await apiService.get(`/bookings/${id}`);
    return (response as any).data;
  }

  // Update booking status
  async updateBookingStatus(
    id: string,
    status: Booking['status'],
    notes?: string
  ): Promise<Booking> {
    const response = await apiService.patch(`/bookings/${id}/status`, {
      status,
      notes
    });
    return (response as any).data;
  }

  // Reschedule booking
  async rescheduleBooking(rescheduleData: RescheduleRequest): Promise<Booking> {
    const response = await apiService.patch(
      `/bookings/${rescheduleData.bookingId}/reschedule`,
      rescheduleData
    );
    return (response as any).data;
  }

  // Cancel booking
  async cancelBooking(id: string, reason?: string): Promise<Booking> {
    const response = await apiService.patch(`/bookings/${id}/cancel`, { reason });
    return (response as any).data;
  }

  // Get agent availability
  async getAgentAvailability(
    agentId: string,
    date: string
  ): Promise<BookingSlot[]> {
    const response = await apiService.get(`/bookings/agents/${agentId}/availability`, {
      params: { date }
    });
    return (response as any).data;
  }

  // Set agent availability
  async setAgentAvailability(
    agentId: string,
    slots: Omit<BookingSlot, 'id' | 'agentId'>[]
  ): Promise<BookingSlot[]> {
    const response = await apiService.post(`/bookings/agents/${agentId}/availability`, {
      slots
    });
    return (response as any).data;
  }

  // Get booking statistics
  async getBookingStats(
    agentId?: string,
    dateFrom?: string,
    dateTo?: string
  ): Promise<BookingStats> {
    const params = new URLSearchParams();
    if (agentId) params.append('agentId', agentId);
    if (dateFrom) params.append('dateFrom', dateFrom);
    if (dateTo) params.append('dateTo', dateTo);
    
    const response = await apiService.get(`/bookings/stats?${params}`);
    return (response as any).data;
  }

  // Send booking reminder
  async sendBookingReminder(id: string): Promise<void> {
    await apiService.post(`/bookings/${id}/reminder`);
  }

  // Send booking confirmation
  async sendBookingConfirmation(id: string): Promise<void> {
    await apiService.post(`/bookings/${id}/confirmation`);
  }

  // Get upcoming bookings
  async getUpcomingBookings(
    userId: string,
    userType: 'agent' | 'client',
    limit = 10
  ): Promise<Booking[]> {
    const response = await apiService.get(`/bookings/upcoming`, {
      params: { userId, userType, limit }
    });
    return (response as any).data;
  }

  // Check for booking conflicts
  async checkBookingConflicts(
    agentId: string,
    date: string,
    startTime: string,
    endTime: string,
    excludeBookingId?: string
  ): Promise<{ hasConflict: boolean; conflictingBookings: Booking[] }> {
    const response = await apiService.post('/bookings/check-conflicts', {
      agentId,
      date,
      startTime,
      endTime,
      excludeBookingId
    });
    return (response as any).data;
  }

  // Bulk update bookings
  async bulkUpdateBookings(
    bookingIds: string[],
    updates: Partial<Pick<Booking, 'status' | 'notes'>>
  ): Promise<Booking[]> {
    const response = await apiService.patch('/bookings/bulk-update', {
      bookingIds,
      updates
    });
    return (response as any).data;
  }

  // Get booking history for a property
  async getPropertyBookingHistory(
    propertyId: string,
    limit = 50
  ): Promise<Booking[]> {
    const response = await apiService.get(`/bookings/property/${propertyId}/history`, {
      params: { limit }
    });
    return (response as any).data;
  }

  // Get booking analytics
  async getBookingAnalytics(
    agentId?: string,
    dateFrom?: string,
    dateTo?: string
  ): Promise<{
    totalBookings: number;
    conversionRate: number;
    averageBookingDuration: number;
    peakBookingHours: { hour: number; count: number }[];
    bookingTrends: { date: string; count: number }[];
    cancellationReasons: { reason: string; count: number }[];
  }> {
    const params = new URLSearchParams();
    if (agentId) params.append('agentId', agentId);
    if (dateFrom) params.append('dateFrom', dateFrom);
    if (dateTo) params.append('dateTo', dateTo);
    
    const response = await apiService.get(`/bookings/analytics?${params}`);
    return (response as any).data;
  }
}

export const bookingService = new BookingService();
export default bookingService;