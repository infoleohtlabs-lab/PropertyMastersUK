import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpStatus,
  ParseUUIDPipe,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
  ApiProperty,
} from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsDateString, IsBoolean, IsNumber, IsArray, ValidateNested, IsUUID } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { BookingService } from '../services/booking.service';
import { Booking, BookingType, BookingStatus } from '../entities/booking.entity';
import { Availability, AvailabilityType, AvailabilityStatus } from '../entities/availability.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';

// Booking DTOs
export class CreateBookingRequestDto {
  @ApiProperty({ description: 'Tenant organization ID' })
  @IsUUID()
  tenantOrganizationId: string;

  @ApiProperty({ description: 'Property ID', required: false })
  @IsOptional()
  @IsUUID()
  propertyId?: string;

  @ApiProperty({ description: 'Availability ID', required: false })
  @IsOptional()
  @IsUUID()
  availabilityId?: string;

  @ApiProperty({ description: 'User ID', required: false })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiProperty({ description: 'Guest user ID', required: false })
  @IsOptional()
  @IsUUID()
  guestUserId?: string;

  @ApiProperty({ enum: BookingType, description: 'Booking type' })
  @IsEnum(BookingType)
  type: BookingType;

  @ApiProperty({ description: 'Booking title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Booking description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Start date and time' })
  @IsDateString()
  startDateTime: Date;

  @ApiProperty({ description: 'End date and time' })
  @IsDateString()
  endDateTime: Date;

  @ApiProperty({ description: 'Timezone', required: false })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiProperty({ description: 'All day booking', required: false })
  @IsOptional()
  @IsBoolean()
  isAllDay?: boolean;

  @ApiProperty({ description: 'Number of attendees', required: false })
  @IsOptional()
  @IsNumber()
  attendeeCount?: number;

  @ApiProperty({ description: 'Contact name', required: false })
  @IsOptional()
  @IsString()
  contactName?: string;

  @ApiProperty({ description: 'Contact email', required: false })
  @IsOptional()
  @IsString()
  contactEmail?: string;

  @ApiProperty({ description: 'Contact phone', required: false })
  @IsOptional()
  @IsString()
  contactPhone?: string;

  @ApiProperty({ description: 'Emergency contact', required: false })
  @IsOptional()
  @IsString()
  emergencyContact?: string;

  @ApiProperty({ description: 'Emergency phone', required: false })
  @IsOptional()
  @IsString()
  emergencyPhone?: string;

  @ApiProperty({ description: 'Access instructions', required: false })
  @IsOptional()
  @IsString()
  accessInstructions?: string;

  @ApiProperty({ description: 'Special requirements', required: false })
  @IsOptional()
  @IsString()
  specialRequirements?: string;

  @ApiProperty({ description: 'Equipment needed', type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  equipmentNeeded?: string[];

  @ApiProperty({ description: 'Catering required', required: false })
  @IsOptional()
  @IsBoolean()
  cateringRequired?: boolean;

  @ApiProperty({ description: 'Catering details', required: false })
  @IsOptional()
  @IsString()
  cateringDetails?: string;

  @ApiProperty({ description: 'Setup requirements', required: false })
  @IsOptional()
  @IsString()
  setupRequirements?: string;

  @ApiProperty({ description: 'Cleanup requirements', required: false })
  @IsOptional()
  @IsString()
  cleanupRequirements?: string;

  @ApiProperty({ description: 'Security requirements', required: false })
  @IsOptional()
  @IsString()
  securityRequirements?: string;

  @ApiProperty({ description: 'Insurance required', required: false })
  @IsOptional()
  @IsBoolean()
  insuranceRequired?: boolean;

  @ApiProperty({ description: 'Insurance details', required: false })
  @IsOptional()
  @IsString()
  insuranceDetails?: string;

  @ApiProperty({ description: 'Deposit required', required: false })
  @IsOptional()
  @IsBoolean()
  depositRequired?: boolean;

  @ApiProperty({ description: 'Deposit amount', required: false })
  @IsOptional()
  @IsNumber()
  depositAmount?: number;

  @ApiProperty({ description: 'Total cost', required: false })
  @IsOptional()
  @IsNumber()
  totalCost?: number;

  @ApiProperty({ description: 'Currency', required: false })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ description: 'Payment status', required: false })
  @IsOptional()
  @IsString()
  paymentStatus?: string;

  @ApiProperty({ description: 'Payment due date', required: false })
  @IsOptional()
  @IsDateString()
  paymentDueDate?: Date;

  @ApiProperty({ description: 'Cancellation policy', required: false })
  @IsOptional()
  @IsString()
  cancellationPolicy?: string;

  @ApiProperty({ description: 'Refund policy', required: false })
  @IsOptional()
  @IsString()
  refundPolicy?: string;

  @ApiProperty({ description: 'Confirmation required', required: false })
  @IsOptional()
  @IsBoolean()
  confirmationRequired?: boolean;

  @ApiProperty({ description: 'Check-in instructions', required: false })
  @IsOptional()
  @IsString()
  checkInInstructions?: string;

  @ApiProperty({ description: 'Check-out instructions', required: false })
  @IsOptional()
  @IsString()
  checkOutInstructions?: string;

  @ApiProperty({ description: 'Key handover details', required: false })
  @IsOptional()
  @IsString()
  keyHandoverDetails?: string;

  @ApiProperty({ description: 'Access codes', required: false })
  @IsOptional()
  @IsString()
  accessCodes?: string;

  @ApiProperty({ description: 'WiFi details', required: false })
  @IsOptional()
  @IsString()
  wifiDetails?: string;

  @ApiProperty({ description: 'Parking instructions', required: false })
  @IsOptional()
  @IsString()
  parkingInstructions?: string;

  @ApiProperty({ description: 'Local area info', required: false })
  @IsOptional()
  @IsString()
  localAreaInfo?: string;

  @ApiProperty({ description: 'Emergency procedures', required: false })
  @IsOptional()
  @IsString()
  emergencyProcedures?: string;
}

export class UpdateBookingRequestDto {
  @ApiProperty({ description: 'Booking title', required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ description: 'Booking description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Start date and time', required: false })
  @IsOptional()
  @IsDateString()
  startDateTime?: Date;

  @ApiProperty({ description: 'End date and time', required: false })
  @IsOptional()
  @IsDateString()
  endDateTime?: Date;

  @ApiProperty({ description: 'Timezone', required: false })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiProperty({ description: 'All day booking', required: false })
  @IsOptional()
  @IsBoolean()
  isAllDay?: boolean;

  @ApiProperty({ description: 'Number of attendees', required: false })
  @IsOptional()
  @IsNumber()
  attendeeCount?: number;

  @ApiProperty({ description: 'Contact name', required: false })
  @IsOptional()
  @IsString()
  contactName?: string;

  @ApiProperty({ description: 'Contact email', required: false })
  @IsOptional()
  @IsString()
  contactEmail?: string;

  @ApiProperty({ description: 'Contact phone', required: false })
  @IsOptional()
  @IsString()
  contactPhone?: string;

  @ApiProperty({ description: 'Total cost', required: false })
  @IsOptional()
  @IsNumber()
  totalCost?: number;

  @ApiProperty({ description: 'Special requirements', required: false })
  @IsOptional()
  @IsString()
  specialRequirements?: string;
}

export class CancelBookingRequestDto {
  @ApiProperty({ description: 'Cancellation reason' })
  @IsString()
  cancellationReason: string;
}

// Availability DTOs
export class CreateAvailabilityRequestDto {
  @ApiProperty({ description: 'Tenant organization ID' })
  @IsUUID()
  tenantOrganizationId: string;

  @ApiProperty({ description: 'Property ID', required: false })
  @IsOptional()
  @IsUUID()
  propertyId?: string;

  @ApiProperty({ description: 'User ID', required: false })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiProperty({ description: 'Availability title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Availability description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: AvailabilityType, description: 'Availability type' })
  @IsEnum(AvailabilityType)
  type: AvailabilityType;

  @ApiProperty({ description: 'Start date and time' })
  @IsDateString()
  startDateTime: Date;

  @ApiProperty({ description: 'End date and time' })
  @IsDateString()
  endDateTime: Date;

  @ApiProperty({ description: 'Timezone', required: false })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiProperty({ description: 'All day availability', required: false })
  @IsOptional()
  @IsBoolean()
  isAllDay?: boolean;

  @ApiProperty({ description: 'Is recurring', required: false })
  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean;

  @ApiProperty({ description: 'Maximum bookings allowed', required: false })
  @IsOptional()
  @IsNumber()
  maxBookings?: number;

  @ApiProperty({ description: 'Minimum booking duration in minutes', required: false })
  @IsOptional()
  @IsNumber()
  minBookingDuration?: number;

  @ApiProperty({ description: 'Maximum booking duration in minutes', required: false })
  @IsOptional()
  @IsNumber()
  maxBookingDuration?: number;

  @ApiProperty({ description: 'Base price', required: false })
  @IsOptional()
  @IsNumber()
  basePrice?: number;

  @ApiProperty({ description: 'Price per hour', required: false })
  @IsOptional()
  @IsNumber()
  pricePerHour?: number;

  @ApiProperty({ description: 'Currency', required: false })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ description: 'Access requirements', required: false })
  @IsOptional()
  @IsString()
  accessRequirements?: string;

  @ApiProperty({ description: 'Available resources', type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  availableResources?: string[];

  @ApiProperty({ description: 'Require approval', required: false })
  @IsOptional()
  @IsBoolean()
  requireApproval?: boolean;

  @ApiProperty({ description: 'Auto approve', required: false })
  @IsOptional()
  @IsBoolean()
  autoApprove?: boolean;

  @ApiProperty({ description: 'Is active', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ description: 'Is public', required: false })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}

export class UpdateAvailabilityRequestDto {
  @ApiProperty({ description: 'Availability title', required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ description: 'Availability description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: AvailabilityType, description: 'Availability type', required: false })
  @IsOptional()
  @IsEnum(AvailabilityType)
  type?: AvailabilityType;

  @ApiProperty({ description: 'Start date and time', required: false })
  @IsOptional()
  @IsDateString()
  startDateTime?: Date;

  @ApiProperty({ description: 'End date and time', required: false })
  @IsOptional()
  @IsDateString()
  endDateTime?: Date;

  @ApiProperty({ description: 'Maximum bookings allowed', required: false })
  @IsOptional()
  @IsNumber()
  maxBookings?: number;

  @ApiProperty({ description: 'Base price', required: false })
  @IsOptional()
  @IsNumber()
  basePrice?: number;

  @ApiProperty({ description: 'Is active', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ description: 'Is public', required: false })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}

// Query DTOs
export class BookingQueryDto {
  @ApiProperty({ description: 'Property ID', required: false })
  @IsOptional()
  @IsUUID()
  propertyId?: string;

  @ApiProperty({ description: 'User ID', required: false })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiProperty({ enum: BookingType, description: 'Booking type', required: false })
  @IsOptional()
  @IsEnum(BookingType)
  type?: BookingType;

  @ApiProperty({ enum: BookingStatus, description: 'Booking status', required: false })
  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;

  @ApiProperty({ description: 'Start date filter', required: false })
  @IsOptional()
  @IsDateString()
  startDate?: Date;

  @ApiProperty({ description: 'End date filter', required: false })
  @IsOptional()
  @IsDateString()
  endDate?: Date;

  @ApiProperty({ description: 'Contact email filter', required: false })
  @IsOptional()
  @IsString()
  contactEmail?: string;

  @ApiProperty({ description: 'Is confirmed filter', required: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isConfirmed?: boolean;

  @ApiProperty({ description: 'Is paid filter', required: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isPaid?: boolean;

  @ApiProperty({ description: 'Search term', required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ description: 'Page number', required: false, default: 1 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  page?: number = 1;

  @ApiProperty({ description: 'Items per page', required: false, default: 10 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  limit?: number = 10;

  @ApiProperty({ description: 'Sort by field', required: false, default: 'createdAt' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiProperty({ description: 'Sort order', required: false, default: 'DESC' })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}

export class AvailabilityQueryDto {
  @ApiProperty({ description: 'Property ID', required: false })
  @IsOptional()
  @IsUUID()
  propertyId?: string;

  @ApiProperty({ description: 'User ID', required: false })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiProperty({ enum: AvailabilityType, description: 'Availability type', required: false })
  @IsOptional()
  @IsEnum(AvailabilityType)
  type?: AvailabilityType;

  @ApiProperty({ enum: AvailabilityStatus, description: 'Availability status', required: false })
  @IsOptional()
  @IsEnum(AvailabilityStatus)
  status?: AvailabilityStatus;

  @ApiProperty({ description: 'Start date filter', required: false })
  @IsOptional()
  @IsDateString()
  startDate?: Date;

  @ApiProperty({ description: 'End date filter', required: false })
  @IsOptional()
  @IsDateString()
  endDate?: Date;

  @ApiProperty({ description: 'Is active filter', required: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ description: 'Is public filter', required: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isPublic?: boolean;

  @ApiProperty({ description: 'Search term', required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ description: 'Page number', required: false, default: 1 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  page?: number = 1;

  @ApiProperty({ description: 'Items per page', required: false, default: 10 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  limit?: number = 10;

  @ApiProperty({ description: 'Sort by field', required: false, default: 'startDateTime' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'startDateTime';

  @ApiProperty({ description: 'Sort order', required: false, default: 'ASC' })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'ASC';
}

@ApiTags('Bookings')
@Controller('bookings')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  // Booking Endpoints
  @Post()
  @ApiOperation({ summary: 'Create a new booking' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Booking created successfully', type: Booking })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid booking data' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Booking conflict detected' })
  @ApiBody({ type: CreateBookingRequestDto })
  @Roles(UserRole.ADMIN, UserRole.PROPERTY_MANAGER, UserRole.AGENT, UserRole.TENANT)
  @UsePipes(new ValidationPipe({ transform: true }))
  async createBooking(
    @Body() createBookingDto: CreateBookingRequestDto,
    @Request() req: any,
  ) {
    const booking = await this.bookingService.createBooking(createBookingDto, req.user.id);
    return {
      status: 'success',
      message: 'Booking created successfully',
      data: booking,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get booking by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Booking retrieved successfully', type: Booking })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Booking not found' })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  @Roles(UserRole.ADMIN, UserRole.PROPERTY_MANAGER, UserRole.AGENT, UserRole.TENANT)
  async getBookingById(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('tenantOrganizationId', ParseUUIDPipe) tenantOrganizationId: string,
  ) {
    const booking = await this.bookingService.findBookingById(id, tenantOrganizationId);
    return {
      status: 'success',
      message: 'Booking retrieved successfully',
      data: booking,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all bookings with filters and pagination' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Bookings retrieved successfully' })
  @ApiQuery({ name: 'tenantOrganizationId', description: 'Tenant organization ID' })
  @Roles(UserRole.ADMIN, UserRole.PROPERTY_MANAGER, UserRole.AGENT, UserRole.TENANT)
  @UsePipes(new ValidationPipe({ transform: true }))
  async getBookings(
    @Query('tenantOrganizationId', ParseUUIDPipe) tenantOrganizationId: string,
    @Query() query: BookingQueryDto,
  ) {
    const filters = {
      tenantOrganizationId,
      ...query,
    };

    const pagination = {
      page: query.page,
      limit: query.limit,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    };

    const result = await this.bookingService.findBookings(filters, pagination);
    return {
      status: 'success',
      message: 'Bookings retrieved successfully',
      data: result.bookings,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / result.limit),
      },
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update booking' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Booking updated successfully', type: Booking })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Booking not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid update data' })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  @ApiBody({ type: UpdateBookingRequestDto })
  @Roles(UserRole.ADMIN, UserRole.PROPERTY_MANAGER, UserRole.AGENT, UserRole.TENANT)
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateBooking(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('tenantOrganizationId', ParseUUIDPipe) tenantOrganizationId: string,
    @Body() updateBookingDto: UpdateBookingRequestDto,
    @Request() req: any,
  ) {
    const booking = await this.bookingService.updateBooking(
      id,
      tenantOrganizationId,
      updateBookingDto,
      req.user.id,
    );
    return {
      status: 'success',
      message: 'Booking updated successfully',
      data: booking,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete booking' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Booking deleted successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Booking not found' })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  @Roles(UserRole.ADMIN, UserRole.PROPERTY_MANAGER, UserRole.AGENT)
  async deleteBooking(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('tenantOrganizationId', ParseUUIDPipe) tenantOrganizationId: string,
    @Request() req: any,
  ) {
    await this.bookingService.deleteBooking(id, tenantOrganizationId, req.user.id);
    return {
      status: 'success',
      message: 'Booking deleted successfully',
    };
  }

  @Patch(':id/confirm')
  @ApiOperation({ summary: 'Confirm booking' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Booking confirmed successfully', type: Booking })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Booking not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Booking cannot be confirmed' })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  @Roles(UserRole.ADMIN, UserRole.PROPERTY_MANAGER, UserRole.AGENT)
  async confirmBooking(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('tenantOrganizationId', ParseUUIDPipe) tenantOrganizationId: string,
    @Request() req: any,
  ) {
    const booking = await this.bookingService.confirmBooking(id, tenantOrganizationId, req.user.id);
    return {
      status: 'success',
      message: 'Booking confirmed successfully',
      data: booking,
    };
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel booking' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Booking cancelled successfully', type: Booking })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Booking not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Booking cannot be cancelled' })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  @ApiBody({ type: CancelBookingRequestDto })
  @Roles(UserRole.ADMIN, UserRole.PROPERTY_MANAGER, UserRole.AGENT, UserRole.TENANT)
  @UsePipes(new ValidationPipe({ transform: true }))
  async cancelBooking(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('tenantOrganizationId', ParseUUIDPipe) tenantOrganizationId: string,
    @Body() cancelBookingDto: CancelBookingRequestDto,
    @Request() req: any,
  ) {
    const booking = await this.bookingService.cancelBooking(
      id,
      tenantOrganizationId,
      cancelBookingDto.cancellationReason,
      req.user.id,
    );
    return {
      status: 'success',
      message: 'Booking cancelled successfully',
      data: booking,
    };
  }

  @Patch(':id/check-in')
  @ApiOperation({ summary: 'Check in booking' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Booking checked in successfully', type: Booking })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Booking not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Booking cannot be checked in' })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  @Roles(UserRole.ADMIN, UserRole.PROPERTY_MANAGER, UserRole.AGENT)
  async checkInBooking(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('tenantOrganizationId', ParseUUIDPipe) tenantOrganizationId: string,
    @Request() req: any,
  ) {
    const booking = await this.bookingService.checkInBooking(id, tenantOrganizationId, req.user.id);
    return {
      status: 'success',
      message: 'Booking checked in successfully',
      data: booking,
    };
  }

  @Patch(':id/check-out')
  @ApiOperation({ summary: 'Check out booking' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Booking checked out successfully', type: Booking })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Booking not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Booking cannot be checked out' })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  @Roles(UserRole.ADMIN, UserRole.PROPERTY_MANAGER, UserRole.AGENT)
  async checkOutBooking(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('tenantOrganizationId', ParseUUIDPipe) tenantOrganizationId: string,
    @Request() req: any,
  ) {
    const booking = await this.bookingService.checkOutBooking(id, tenantOrganizationId, req.user.id);
    return {
      status: 'success',
      message: 'Booking checked out successfully',
      data: booking,
    };
  }

  // Availability Endpoints
  @Post('availability')
  @ApiOperation({ summary: 'Create availability slot' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Availability created successfully', type: Availability })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid availability data' })
  @ApiBody({ type: CreateAvailabilityRequestDto })
  @Roles(UserRole.ADMIN, UserRole.PROPERTY_MANAGER, UserRole.AGENT)
  @UsePipes(new ValidationPipe({ transform: true }))
  async createAvailability(
    @Body() createAvailabilityDto: CreateAvailabilityRequestDto,
    @Request() req: any,
  ) {
    const availability = await this.bookingService.createAvailability(createAvailabilityDto, req.user.id);
    return {
      status: 'success',
      message: 'Availability created successfully',
      data: availability,
    };
  }

  @Get('availability/:id')
  @ApiOperation({ summary: 'Get availability by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Availability retrieved successfully', type: Availability })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Availability not found' })
  @ApiParam({ name: 'id', description: 'Availability ID' })
  @Roles(UserRole.ADMIN, UserRole.PROPERTY_MANAGER, UserRole.AGENT, UserRole.TENANT)
  async getAvailabilityById(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('tenantOrganizationId', ParseUUIDPipe) tenantOrganizationId: string,
  ) {
    const availability = await this.bookingService.findAvailabilityById(id, tenantOrganizationId);
    return {
      status: 'success',
      message: 'Availability retrieved successfully',
      data: availability,
    };
  }

  @Get('availability')
  @ApiOperation({ summary: 'Get all availability slots with filters and pagination' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Availability slots retrieved successfully' })
  @ApiQuery({ name: 'tenantOrganizationId', description: 'Tenant organization ID' })
  @Roles(UserRole.ADMIN, UserRole.PROPERTY_MANAGER, UserRole.AGENT, UserRole.TENANT)
  @UsePipes(new ValidationPipe({ transform: true }))
  async getAvailabilities(
    @Query('tenantOrganizationId', ParseUUIDPipe) tenantOrganizationId: string,
    @Query() query: AvailabilityQueryDto,
  ) {
    const filters = {
      tenantOrganizationId,
      ...query,
    };

    const pagination = {
      page: query.page,
      limit: query.limit,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    };

    const result = await this.bookingService.findAvailabilities(filters, pagination);
    return {
      status: 'success',
      message: 'Availability slots retrieved successfully',
      data: result.availabilities,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / result.limit),
      },
    };
  }

  @Put('availability/:id')
  @ApiOperation({ summary: 'Update availability slot' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Availability updated successfully', type: Availability })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Availability not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid update data' })
  @ApiParam({ name: 'id', description: 'Availability ID' })
  @ApiBody({ type: UpdateAvailabilityRequestDto })
  @Roles(UserRole.ADMIN, UserRole.PROPERTY_MANAGER, UserRole.AGENT)
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateAvailability(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('tenantOrganizationId', ParseUUIDPipe) tenantOrganizationId: string,
    @Body() updateAvailabilityDto: UpdateAvailabilityRequestDto,
    @Request() req: any,
  ) {
    const availability = await this.bookingService.updateAvailability(
      id,
      tenantOrganizationId,
      updateAvailabilityDto,
      req.user.id,
    );
    return {
      status: 'success',
      message: 'Availability updated successfully',
      data: availability,
    };
  }

  @Delete('availability/:id')
  @ApiOperation({ summary: 'Delete availability slot' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Availability deleted successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Availability not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Cannot delete availability with active bookings' })
  @ApiParam({ name: 'id', description: 'Availability ID' })
  @Roles(UserRole.ADMIN, UserRole.PROPERTY_MANAGER, UserRole.AGENT)
  async deleteAvailability(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('tenantOrganizationId', ParseUUIDPipe) tenantOrganizationId: string,
    @Request() req: any,
  ) {
    await this.bookingService.deleteAvailability(id, tenantOrganizationId, req.user.id);
    return {
      status: 'success',
      message: 'Availability deleted successfully',
    };
  }

  // Dashboard Endpoints
  @Get('dashboard/stats')
  @ApiOperation({ summary: 'Get booking dashboard statistics' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Dashboard statistics retrieved successfully' })
  @ApiQuery({ name: 'tenantOrganizationId', description: 'Tenant organization ID' })
  @Roles(UserRole.ADMIN, UserRole.PROPERTY_MANAGER, UserRole.AGENT)
  async getBookingDashboardStats(
    @Query('tenantOrganizationId', ParseUUIDPipe) tenantOrganizationId: string,
  ) {
    const stats = await this.bookingService.getBookingDashboardStats(tenantOrganizationId);
    return {
      status: 'success',
      message: 'Dashboard statistics retrieved successfully',
      data: stats,
    };
  }
}