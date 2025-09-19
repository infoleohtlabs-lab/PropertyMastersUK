import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,

  getSchemaPath,} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';
import {
  BookingService,
  CreateBookingDto,
  UpdateBookingDto,
  CreateAvailabilityDto,
  BookingFilters,
  AvailabilityFilters,
} from '../services/booking.service';
import {
  BookingType,
  BookingStatus,
  BookingPriority,
} from '../entities/booking.entity';
import {
  AvailabilityType,
  RecurrenceType,
} from '../entities/availability.entity';

class CreateBookingRequestDto {
  type?: BookingType;
  priority?: BookingPriority;
  title: string;
  description?: string;
  scheduledAt: Date;
  durationMinutes?: number;
  propertyId: string;
  assignedToId?: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  attendeeCount?: number;
  specialRequirements?: string;
  internalNotes?: string;
  metadata?: Record<string, any>;
  recurrencePattern?: string;
  recurrenceEndDate?: Date;
}

class UpdateBookingRequestDto {
  type?: BookingType;
  status?: BookingStatus;
  priority?: BookingPriority;
  title?: string;
  description?: string;
  scheduledAt?: Date;
  durationMinutes?: number;
  assignedToId?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  attendeeCount?: number;
  specialRequirements?: string;
  internalNotes?: string;
  outcome?: string;
  rating?: number;
  metadata?: Record<string, any>;
}

class CreateAvailabilityRequestDto {
  type?: AvailabilityType;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  isAllDay?: boolean;
  userId?: string;
  propertyId?: string;
  recurrenceType?: RecurrenceType;
  recurrenceInterval?: number;
  recurrenceDays?: number[];
  recurrenceEndDate?: Date;
  recurrenceCount?: number;
  minBookingDuration?: number;
  maxBookingDuration?: number;
  slotInterval?: number;
  bufferBefore?: number;
  bufferAfter?: number;
  maxConcurrentBookings?: number;
  minAdvanceHours?: number;
  maxAdvanceDays?: number;
  hourlyRate?: number;
  fixedCost?: number;
  requiresApproval?: boolean;
  isHoliday?: boolean;
  metadata?: Record<string, any>;
  tags?: string[];
  enableNotifications?: boolean;
  notificationTemplate?: string;
}

class CancelBookingDto {
  cancellationReason?: string;
}

class CompleteBookingDto {
  outcome?: string;
  rating?: number;
}

class BookingQueryDto {
  type?: BookingType;
  status?: BookingStatus;
  priority?: BookingPriority;
  propertyId?: string;
  bookedById?: string;
  assignedToId?: string;
  fromDate?: string;
  toDate?: string;
  contactEmail?: string;
  rating?: number;
  page?: number;
  limit?: number;
}

class AvailabilityQueryDto {
  type?: AvailabilityType;
  userId?: string;
  propertyId?: string;
  fromDate?: string;
  toDate?: string;
  isActive?: boolean;
  isPublished?: boolean;
  tags?: string;
  page?: number;
  limit?: number;
}

class AvailabilityCheckDto {
  propertyId: string;
  startTime: Date;
  durationMinutes: number;
  userId?: string;
}

class TimeSlotsQueryDto {
  propertyId: string;
  date: string;
  durationMinutes?: number;
  userId?: string;
}

@ApiTags('Booking')
@Controller('booking')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  // Booking Endpoints
  @Post('bookings')
  @ApiOperation({ summary: 'Create a new booking' })
  @ApiResponse({ status: 201, description: 'Booking created successfully' })
  @Roles(UserRole.TENANT, UserRole.LANDLORD, UserRole.AGENT, UserRole.ADMIN)
  async createBooking(
    @Request() req: any,
    @Body() createBookingDto: CreateBookingRequestDto,
  ) {
    try {
      return await this.bookingService.createBooking(
        req.user.tenantOrganizationId,
        req.user.sub,
        createBookingDto,
      );
    } catch (error) {
      throw new HttpException(
        `Failed to create booking: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('bookings')
  @ApiOperation({ summary: 'Get bookings with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'Bookings retrieved successfully' })
  @Roles(UserRole.TENANT, UserRole.LANDLORD, UserRole.AGENT, UserRole.ADMIN)
  async getBookings(
    @Request() req: any,
    @Query() query: BookingQueryDto,
  ) {
    try {
      const filters: BookingFilters = {
        type: query.type,
        status: query.status,
        priority: query.priority,
        propertyId: query.propertyId,
        bookedById: query.bookedById,
        assignedToId: query.assignedToId,
        fromDate: query.fromDate ? new Date(query.fromDate) : undefined,
        toDate: query.toDate ? new Date(query.toDate) : undefined,
        contactEmail: query.contactEmail,
        rating: query.rating,
      };

      return await this.bookingService.getBookings(
        req.user.tenantOrganizationId,
        filters,
        query.page || 1,
        query.limit || 50,
      );
    } catch (error) {
      throw new HttpException(
        `Failed to retrieve bookings: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('bookings/:bookingId')
  @ApiOperation({ summary: 'Get a specific booking by ID' })
  @ApiResponse({ status: 200, description: 'Booking retrieved successfully' })
  @ApiParam({ name: 'bookingId', description: 'Booking ID' })
  @Roles(UserRole.TENANT, UserRole.LANDLORD, UserRole.AGENT, UserRole.ADMIN)
  async getBooking(
    @Request() req: any,
    @Param('bookingId') bookingId: string,
  ) {
    try {
      return await this.bookingService.getBookingById(
        req.user.tenantOrganizationId,
        bookingId,
      );
    } catch (error) {
      throw new HttpException(
        `Failed to retrieve booking: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Put('bookings/:bookingId')
  @ApiOperation({ summary: 'Update a booking' })
  @ApiResponse({ status: 200, description: 'Booking updated successfully' })
  @ApiParam({ name: 'bookingId', description: 'Booking ID' })
  @Roles(UserRole.TENANT, UserRole.LANDLORD, UserRole.AGENT, UserRole.ADMIN)
  async updateBooking(
    @Request() req: any,
    @Param('bookingId') bookingId: string,
    @Body() updateBookingDto: UpdateBookingRequestDto,
  ) {
    try {
      return await this.bookingService.updateBooking(
        req.user.tenantOrganizationId,
        bookingId,
        updateBookingDto,
      );
    } catch (error) {
      throw new HttpException(
        `Failed to update booking: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Put('bookings/:bookingId/cancel')
  @ApiOperation({ summary: 'Cancel a booking' })
  @ApiResponse({ status: 200, description: 'Booking cancelled successfully' })
  @ApiParam({ name: 'bookingId', description: 'Booking ID' })
  @Roles(UserRole.TENANT, UserRole.LANDLORD, UserRole.AGENT, UserRole.ADMIN)
  async cancelBooking(
    @Request() req: any,
    @Param('bookingId') bookingId: string,
    @Body() cancelBookingDto: CancelBookingDto,
  ) {
    try {
      return await this.bookingService.cancelBooking(
        req.user.tenantOrganizationId,
        bookingId,
        req.user.sub,
        cancelBookingDto.cancellationReason,
      );
    } catch (error) {
      throw new HttpException(
        `Failed to cancel booking: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Put('bookings/:bookingId/confirm')
  @ApiOperation({ summary: 'Confirm a booking' })
  @ApiResponse({ status: 200, description: 'Booking confirmed successfully' })
  @ApiParam({ name: 'bookingId', description: 'Booking ID' })
  @Roles(UserRole.LANDLORD, UserRole.AGENT, UserRole.ADMIN)
  async confirmBooking(
    @Request() req: any,
    @Param('bookingId') bookingId: string,
  ) {
    try {
      return await this.bookingService.confirmBooking(
        req.user.tenantOrganizationId,
        bookingId,
      );
    } catch (error) {
      throw new HttpException(
        `Failed to confirm booking: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Put('bookings/:bookingId/complete')
  @ApiOperation({ summary: 'Mark a booking as completed' })
  @ApiResponse({ status: 200, description: 'Booking completed successfully' })
  @ApiParam({ name: 'bookingId', description: 'Booking ID' })
  @Roles(UserRole.LANDLORD, UserRole.AGENT, UserRole.ADMIN)
  async completeBooking(
    @Request() req: any,
    @Param('bookingId') bookingId: string,
    @Body() completeBookingDto: CompleteBookingDto,
  ) {
    try {
      return await this.bookingService.completeBooking(
        req.user.tenantOrganizationId,
        bookingId,
        completeBookingDto.outcome,
        completeBookingDto.rating,
      );
    } catch (error) {
      throw new HttpException(
        `Failed to complete booking: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete('bookings/:bookingId')
  @ApiOperation({ summary: 'Delete a booking' })
  @ApiResponse({ status: 200, description: 'Booking deleted successfully' })
  @ApiParam({ name: 'bookingId', description: 'Booking ID' })
  @Roles(UserRole.LANDLORD, UserRole.AGENT, UserRole.ADMIN)
  async deleteBooking(
    @Request() req: any,
    @Param('bookingId') bookingId: string,
  ) {
    try {
      await this.bookingService.deleteBooking(
        req.user.tenantOrganizationId,
        bookingId,
      );
      return { message: 'Booking deleted successfully' };
    } catch (error) {
      throw new HttpException(
        `Failed to delete booking: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Availability Endpoints
  @Post('availability')
  @ApiOperation({ summary: 'Create availability slot' })
  @ApiResponse({ status: 201, description: 'Availability created successfully' })
  @Roles(UserRole.LANDLORD, UserRole.AGENT, UserRole.ADMIN)
  async createAvailability(
    @Request() req: any,
    @Body() createAvailabilityDto: CreateAvailabilityRequestDto,
  ) {
    try {
      return await this.bookingService.createAvailability(
        req.user.tenantOrganizationId,
        req.user.sub,
        createAvailabilityDto,
      );
    } catch (error) {
      throw new HttpException(
        `Failed to create availability: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('availability')
  @ApiOperation({ summary: 'Get availability slots with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'Availability retrieved successfully' })
  @Roles(UserRole.TENANT, UserRole.LANDLORD, UserRole.AGENT, UserRole.ADMIN)
  async getAvailability(
    @Request() req: any,
    @Query() query: AvailabilityQueryDto,
  ) {
    try {
      const filters: AvailabilityFilters = {
        type: query.type,
        userId: query.userId,
        propertyId: query.propertyId,
        fromDate: query.fromDate ? new Date(query.fromDate) : undefined,
        toDate: query.toDate ? new Date(query.toDate) : undefined,
        isActive: query.isActive,
        isPublished: query.isPublished,
        tags: query.tags ? query.tags.split(',') : undefined,
      };

      return await this.bookingService.getAvailability(
        req.user.tenantOrganizationId,
        filters,
        query.page || 1,
        query.limit || 50,
      );
    } catch (error) {
      throw new HttpException(
        `Failed to retrieve availability: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete('availability/:availabilityId')
  @ApiOperation({ summary: 'Delete an availability slot' })
  @ApiResponse({ status: 200, description: 'Availability deleted successfully' })
  @ApiParam({ name: 'availabilityId', description: 'Availability ID' })
  @Roles(UserRole.LANDLORD, UserRole.AGENT, UserRole.ADMIN)
  async deleteAvailability(
    @Request() req: any,
    @Param('availabilityId') availabilityId: string,
  ) {
    try {
      await this.bookingService.deleteAvailability(
        req.user.tenantOrganizationId,
        availabilityId,
      );
      return { message: 'Availability deleted successfully' };
    } catch (error) {
      throw new HttpException(
        `Failed to delete availability: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Availability Check and Time Slots
  @Post('check-availability')
  @ApiOperation({ summary: 'Check if a time slot is available' })
  @ApiResponse({ status: 200, description: 'Availability checked successfully' })
  @Roles(UserRole.TENANT, UserRole.LANDLORD, UserRole.AGENT, UserRole.ADMIN)
  async checkAvailability(
    @Request() req: any,
    @Body() checkDto: AvailabilityCheckDto,
  ) {
    try {
      const isAvailable = await this.bookingService.checkAvailability(
        req.user.tenantOrganizationId,
        checkDto.propertyId,
        checkDto.startTime,
        checkDto.durationMinutes,
        checkDto.userId,
      );

      return { isAvailable };
    } catch (error) {
      throw new HttpException(
        `Failed to check availability: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('time-slots')
  @ApiOperation({ summary: 'Get available time slots for a specific date' })
  @ApiResponse({ status: 200, description: 'Time slots retrieved successfully' })
  @ApiQuery({ name: 'propertyId', description: 'Property ID', required: true })
  @ApiQuery({ name: 'date', description: 'Date (YYYY-MM-DD)', required: true })
  @ApiQuery({ name: 'durationMinutes', description: 'Duration in minutes', required: false })
  @ApiQuery({ name: 'userId', description: 'User ID', required: false })
  @Roles(UserRole.TENANT, UserRole.LANDLORD, UserRole.AGENT, UserRole.ADMIN)
  async getAvailableTimeSlots(
    @Request() req: any,
    @Query() query: TimeSlotsQueryDto,
  ) {
    try {
      const date = new Date(query.date);
      const timeSlots = await this.bookingService.getAvailableTimeSlots(
        req.user.tenantOrganizationId,
        query.propertyId,
        date,
        query.durationMinutes || 60,
        query.userId,
      );

      return { timeSlots };
    } catch (error) {
      throw new HttpException(
        `Failed to get time slots: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // My Bookings (for current user)
  @Get('my-bookings')
  @ApiOperation({ summary: 'Get bookings for the current user' })
  @ApiResponse({ status: 200, description: 'User bookings retrieved successfully' })
  @Roles(UserRole.TENANT, UserRole.LANDLORD, UserRole.AGENT, UserRole.ADMIN)
  async getMyBookings(
    @Request() req: any,
    @Query() query: BookingQueryDto,
  ) {
    try {
      const filters: BookingFilters = {
        bookedById: req.user.sub,
        type: query.type,
        status: query.status,
        priority: query.priority,
        propertyId: query.propertyId,
        fromDate: query.fromDate ? new Date(query.fromDate) : undefined,
        toDate: query.toDate ? new Date(query.toDate) : undefined,
      };

      return await this.bookingService.getBookings(
        req.user.tenantOrganizationId,
        filters,
        query.page || 1,
        query.limit || 50,
      );
    } catch (error) {
      throw new HttpException(
        `Failed to retrieve user bookings: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Assigned Bookings (for agents/staff)
  @Get('assigned-bookings')
  @ApiOperation({ summary: 'Get bookings assigned to the current user' })
  @ApiResponse({ status: 200, description: 'Assigned bookings retrieved successfully' })
  @Roles(UserRole.LANDLORD, UserRole.AGENT, UserRole.ADMIN)
  async getAssignedBookings(
    @Request() req: any,
    @Query() query: BookingQueryDto,
  ) {
    try {
      const filters: BookingFilters = {
        assignedToId: req.user.sub,
        type: query.type,
        status: query.status,
        priority: query.priority,
        propertyId: query.propertyId,
        fromDate: query.fromDate ? new Date(query.fromDate) : undefined,
        toDate: query.toDate ? new Date(query.toDate) : undefined,
      };

      return await this.bookingService.getBookings(
        req.user.tenantOrganizationId,
        filters,
        query.page || 1,
        query.limit || 50,
      );
    } catch (error) {
      throw new HttpException(
        `Failed to retrieve assigned bookings: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
