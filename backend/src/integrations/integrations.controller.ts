import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth ,
  getSchemaPath,} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { VrService } from './vr/vr.service';
import { VideoService } from './video/video.service';
import { BookingService } from './booking/booking.service';
import { GdprService } from './gdpr/gdpr.service';
import { CreateVrTourDto } from './vr/dto/create-vr-tour.dto';
import { UpdateVrTourDto } from './vr/dto/update-vr-tour.dto';
import { CreateVideoDto } from './video/dto/create-video.dto';
import { UpdateVideoDto } from './video/dto/update-video.dto';
import { CreateBookingDto } from './booking/dto/create-booking.dto';
import { UpdateBookingDto } from './booking/dto/update-booking.dto';
import { CreateGdprRequestDto } from './gdpr/dto/create-gdpr-request.dto';
import { CreateConsentDto } from './gdpr/dto/create-consent.dto';
import { UpdateConsentDto } from './gdpr/dto/update-consent.dto';

@ApiTags('integrations')
@Controller('integrations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class IntegrationsController {
  constructor(
    private readonly vrService: VrService,
    private readonly videoService: VideoService,
    private readonly bookingService: BookingService,
    private readonly gdprService: GdprService,
  ) {}

  // VR Tours endpoints
  @Post('vr-tours')
  @ApiOperation({ summary: 'Create a new VR tour' })
  @ApiResponse({ status: 201, description: 'VR tour created successfully' })
  createVrTour(@Body() createVrTourDto: CreateVrTourDto) {
    return this.vrService.create(createVrTourDto);
  }

  @Get('vr-tours')
  @ApiOperation({ summary: 'Get all VR tours' })
  @ApiResponse({ status: 200, description: 'VR tours retrieved successfully' })
  findAllVrTours() {
    return this.vrService.findAll();
  }

  @Get('vr-tours/:id')
  @ApiOperation({ summary: 'Get a VR tour by ID' })
  @ApiResponse({ status: 200, description: 'VR tour retrieved successfully' })
  findOneVrTour(@Param('id') id: string) {
    return this.vrService.findOne(id);
  }

  @Get('vr-tours/property/:propertyId')
  @ApiOperation({ summary: 'Get VR tours for a property' })
  @ApiResponse({ status: 200, description: 'VR tours retrieved successfully' })
  findVrToursByProperty(@Param('propertyId') propertyId: string) {
    return this.vrService.findByProperty(propertyId);
  }

  @Patch('vr-tours/:id')
  @ApiOperation({ summary: 'Update a VR tour' })
  @ApiResponse({ status: 200, description: 'VR tour updated successfully' })
  updateVrTour(@Param('id') id: string, @Body() updateVrTourDto: UpdateVrTourDto) {
    return this.vrService.update(id, updateVrTourDto);
  }

  @Delete('vr-tours/:id')
  @ApiOperation({ summary: 'Delete a VR tour' })
  @ApiResponse({ status: 200, description: 'VR tour deleted successfully' })
  removeVrTour(@Param('id') id: string) {
    return this.vrService.remove(id);
  }

  @Post('vr-tours/:id/view')
  @ApiOperation({ summary: 'Increment VR tour view count' })
  @ApiResponse({ status: 200, description: 'View count incremented' })
  incrementVrTourViews(@Param('id') id: string) {
    return this.vrService.incrementViews(id);
  }

  @Get('vr-tours/:id/stats')
  @ApiOperation({ summary: 'Get VR tour statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  getVrTourStats(@Param('id') id: string) {
    return this.vrService.getVrTourStats(id);
  }

  // Video endpoints
  @Post('videos')
  @ApiOperation({ summary: 'Create a new property video' })
  @ApiResponse({ status: 201, description: 'Video created successfully' })
  createVideo(@Body() createVideoDto: CreateVideoDto) {
    return this.videoService.create(createVideoDto);
  }

  @Get('videos')
  @ApiOperation({ summary: 'Get all property videos' })
  @ApiResponse({ status: 200, description: 'Videos retrieved successfully' })
  findAllVideos() {
    return this.videoService.findAll();
  }

  @Get('videos/:id')
  @ApiOperation({ summary: 'Get a video by ID' })
  @ApiResponse({ status: 200, description: 'Video retrieved successfully' })
  findOneVideo(@Param('id') id: string) {
    return this.videoService.findOne(id);
  }

  @Get('videos/property/:propertyId')
  @ApiOperation({ summary: 'Get videos for a property' })
  @ApiResponse({ status: 200, description: 'Videos retrieved successfully' })
  findVideosByProperty(@Param('propertyId') propertyId: string) {
    return this.videoService.findByProperty(propertyId);
  }

  @Patch('videos/:id')
  @ApiOperation({ summary: 'Update a video' })
  @ApiResponse({ status: 200, description: 'Video updated successfully' })
  updateVideo(@Param('id') id: string, @Body() updateVideoDto: UpdateVideoDto) {
    return this.videoService.update(id, updateVideoDto);
  }

  @Delete('videos/:id')
  @ApiOperation({ summary: 'Delete a video' })
  @ApiResponse({ status: 200, description: 'Video deleted successfully' })
  removeVideo(@Param('id') id: string) {
    return this.videoService.remove(id);
  }

  @Post('videos/:id/view')
  @ApiOperation({ summary: 'Increment video view count' })
  @ApiResponse({ status: 200, description: 'View count incremented' })
  incrementVideoViews(@Param('id') id: string) {
    return this.videoService.incrementViews(id);
  }

  @Post('videos/:id/watch-time')
  @ApiOperation({ summary: 'Update video watch time' })
  @ApiResponse({ status: 200, description: 'Watch time updated' })
  updateWatchTime(@Param('id') id: string, @Body('watchTime') watchTime: number) {
    return this.videoService.updateWatchTime(id, watchTime);
  }

  @Get('videos/:id/stats')
  @ApiOperation({ summary: 'Get video statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  getVideoStats(@Param('id') id: string) {
    return this.videoService.getVideoStats(id);
  }

  // Booking endpoints
  @Post('bookings')
  @ApiOperation({ summary: 'Create a new booking' })
  @ApiResponse({ status: 201, description: 'Booking created successfully' })
  createBooking(@Body() createBookingDto: CreateBookingDto) {
    return this.bookingService.create(createBookingDto);
  }

  @Get('bookings')
  @ApiOperation({ summary: 'Get all bookings' })
  @ApiResponse({ status: 200, description: 'Bookings retrieved successfully' })
  findAllBookings() {
    return this.bookingService.findAll();
  }

  @Get('bookings/:id')
  @ApiOperation({ summary: 'Get a booking by ID' })
  @ApiResponse({ status: 200, description: 'Booking retrieved successfully' })
  findOneBooking(@Param('id') id: string) {
    return this.bookingService.findOne(id);
  }

  @Get('bookings/agent/:agentId')
  @ApiOperation({ summary: 'Get bookings for an agent' })
  @ApiResponse({ status: 200, description: 'Bookings retrieved successfully' })
  findBookingsByAgent(@Param('agentId') agentId: string) {
    return this.bookingService.findByAgent(agentId);
  }

  @Get('bookings/client/:clientId')
  @ApiOperation({ summary: 'Get bookings for a client' })
  @ApiResponse({ status: 200, description: 'Bookings retrieved successfully' })
  findBookingsByClient(@Param('clientId') clientId: string) {
    return this.bookingService.findByClient(clientId);
  }

  @Get('bookings/property/:propertyId')
  @ApiOperation({ summary: 'Get bookings for a property' })
  @ApiResponse({ status: 200, description: 'Bookings retrieved successfully' })
  findBookingsByProperty(@Param('propertyId') propertyId: string) {
    return this.bookingService.findByProperty(propertyId);
  }

  @Patch('bookings/:id')
  @ApiOperation({ summary: 'Update a booking' })
  @ApiResponse({ status: 200, description: 'Booking updated successfully' })
  updateBooking(@Param('id') id: string, @Body() updateBookingDto: UpdateBookingDto) {
    return this.bookingService.update(id, updateBookingDto);
  }

  @Delete('bookings/:id')
  @ApiOperation({ summary: 'Cancel a booking' })
  @ApiResponse({ status: 200, description: 'Booking cancelled successfully' })
  cancelBooking(@Param('id') id: string, @Body('reason') reason?: string) {
    return this.bookingService.cancel(id, reason);
  }

  @Post('bookings/:id/confirm')
  @ApiOperation({ summary: 'Confirm a booking' })
  @ApiResponse({ status: 200, description: 'Booking confirmed successfully' })
  confirmBooking(@Param('id') id: string) {
    return this.bookingService.confirm(id);
  }

  @Post('bookings/:id/complete')
  @ApiOperation({ summary: 'Complete a booking' })
  @ApiResponse({ status: 200, description: 'Booking completed successfully' })
  completeBooking(@Param('id') id: string, @Body('notes') notes?: string) {
    return this.bookingService.complete(id, notes);
  }

  @Post('bookings/:id/reschedule')
  @ApiOperation({ summary: 'Reschedule a booking' })
  @ApiResponse({ status: 200, description: 'Booking rescheduled successfully' })
  rescheduleBooking(
    @Param('id') id: string,
    @Body('newDateTime') newDateTime: Date,
    @Body('reason') reason?: string,
  ) {
    return this.bookingService.reschedule(id, newDateTime, reason);
  }

  @Get('bookings/upcoming/:userId')
  @ApiOperation({ summary: 'Get upcoming bookings for a user' })
  @ApiResponse({ status: 200, description: 'Upcoming bookings retrieved successfully' })
  getUpcomingBookings(@Param('userId') userId: string) {
    return this.bookingService.getUpcomingBookings(userId);
  }

  @Get('bookings/stats/:userId')
  @ApiOperation({ summary: 'Get booking statistics for a user' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  getBookingStats(@Param('userId') userId: string) {
    return this.bookingService.getBookingStats(userId);
  }

  // GDPR endpoints
  @Post('gdpr/requests')
  @ApiOperation({ summary: 'Create a GDPR request' })
  @ApiResponse({ status: 201, description: 'GDPR request created successfully' })
  createGdprRequest(@Body() createGdprRequestDto: CreateGdprRequestDto) {
    return this.gdprService.createGdprRequest(createGdprRequestDto);
  }

  @Get('gdpr/requests')
  @ApiOperation({ summary: 'Get all GDPR requests' })
  @ApiResponse({ status: 200, description: 'GDPR requests retrieved successfully' })
  findAllGdprRequests() {
    return this.gdprService.findAllGdprRequests();
  }

  @Get('gdpr/requests/:id')
  @ApiOperation({ summary: 'Get a GDPR request by ID' })
  @ApiResponse({ status: 200, description: 'GDPR request retrieved successfully' })
  findOneGdprRequest(@Param('id') id: string) {
    return this.gdprService.findGdprRequest(id);
  }

  @Post('gdpr/requests/:id/process')
  @ApiOperation({ summary: 'Process a GDPR request' })
  @ApiResponse({ status: 200, description: 'GDPR request processed successfully' })
  processGdprRequest(@Param('id') id: string, @Body('notes') notes?: string) {
    return this.gdprService.processGdprRequest(id, notes);
  }

  @Post('gdpr/requests/:id/complete')
  @ApiOperation({ summary: 'Complete a GDPR request' })
  @ApiResponse({ status: 200, description: 'GDPR request completed successfully' })
  completeGdprRequest(@Param('id') id: string, @Body('responseData') responseData?: any) {
    return this.gdprService.completeGdprRequest(id, responseData);
  }

  @Post('gdpr/requests/:id/reject')
  @ApiOperation({ summary: 'Reject a GDPR request' })
  @ApiResponse({ status: 200, description: 'GDPR request rejected successfully' })
  rejectGdprRequest(@Param('id') id: string, @Body('reason') reason: string) {
    return this.gdprService.rejectGdprRequest(id, reason);
  }

  @Post('gdpr/consents')
  @ApiOperation({ summary: 'Create a data consent' })
  @ApiResponse({ status: 201, description: 'Consent created successfully' })
  createConsent(@Body() createConsentDto: CreateConsentDto) {
    return this.gdprService.createConsent(createConsentDto);
  }

  @Get('gdpr/consents/user/:userId')
  @ApiOperation({ summary: 'Get consents for a user' })
  @ApiResponse({ status: 200, description: 'Consents retrieved successfully' })
  findConsentsByUser(@Param('userId') userId: string) {
    return this.gdprService.findUserConsents(userId);
  }

  @Patch('gdpr/consents/:id')
  @ApiOperation({ summary: 'Update a consent' })
  @ApiResponse({ status: 200, description: 'Consent updated successfully' })
  updateConsent(@Param('id') id: string, @Body() updateConsentDto: UpdateConsentDto) {
    return this.gdprService.updateConsent(updateConsentDto.userId, updateConsentDto.consentType, updateConsentDto.granted);
  }

  @Post('gdpr/consents/:id/withdraw')
  @ApiOperation({ summary: 'Withdraw a consent' })
  @ApiResponse({ status: 200, description: 'Consent withdrawn successfully' })
  withdrawConsent(@Param('id') id: string, @Body('reason') reason?: string) {
    return this.gdprService.withdrawConsent(id, reason as any);
  }

  @Get('gdpr/consents/check/:userId/:type')
  @ApiOperation({ summary: 'Check if user has given consent for a specific type' })
  @ApiResponse({ status: 200, description: 'Consent status retrieved successfully' })
  checkConsent(@Param('userId') userId: string, @Param('type') type: string) {
    return this.gdprService.checkConsent(userId, type as any);
  }
}
