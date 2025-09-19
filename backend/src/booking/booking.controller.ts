import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../users/entities/user.entity';

@Controller('bookings')
@UseGuards(JwtAuthGuard)
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.BUYER, UserRole.TENANT, UserRole.AGENT)
  create(@Body() createBookingDto: CreateBookingDto, @GetUser() user: User) {
    return this.bookingService.create(createBookingDto);
  }

  @Get()
  findAll(
    @GetUser() user: User,
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10,
    @Query('status') status?: string,
    @Query('propertyId') propertyId?: string,
  ) {
    return this.bookingService.findAll();
  }

  @Get('my-bookings')
  findMyBookings(
    @GetUser() user: User,
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10,
    @Query('status') status?: string,
  ) {
    return this.bookingService.findByUser(user.id, {
      page,
      limit,
      status,
    });
  }

  @Get('property/:propertyId')
  findByProperty(
    @Param('propertyId') propertyId: string,
    @GetUser() user: User,
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10,
    @Query('status') status?: string,
  ) {
    return this.bookingService.findByProperty(propertyId);
  }

  @Get('available-slots/:propertyId')
  getAvailableSlots(
    @Param('propertyId') propertyId: string,
    @Query('date') date: string,
    @Query('duration', ParseIntPipe) duration: number = 60,
  ) {
    // This method needs to be implemented in the service
    // For now, return empty array
    return [];
  }

  @Get(':id')
  findOne(@Param('id') id: string, @GetUser() user: User) {
    return this.bookingService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.AGENT, UserRole.LANDLORD, UserRole.ADMIN)
  update(
    @Param('id') id: string,
    @Body() updateBookingDto: UpdateBookingDto,
    @GetUser() user: User,
  ) {
    return this.bookingService.update(id, updateBookingDto);
  }

  @Patch(':id/confirm')
  @UseGuards(RolesGuard)
  @Roles(UserRole.AGENT, UserRole.LANDLORD)
  confirm(@Param('id') id: string, @GetUser() user: User) {
    return this.bookingService.confirm(id);
  }

  @Patch(':id/cancel')
  cancel(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @GetUser() user: User,
  ) {
    return this.bookingService.cancel(id, reason);
  }

  @Patch(':id/reschedule')
  reschedule(
    @Param('id') id: string,
    @Body('newDate') newDate: string,
    @Body('newTime') newTime: string,
    @GetUser() user: User,
  ) {
    const date = new Date(newDate);
    return this.bookingService.reschedule(id, date, newTime);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string, @GetUser() user: User) {
    return this.bookingService.remove(id);
  }

  @Get('analytics/summary')
  @UseGuards(RolesGuard)
  @Roles(UserRole.AGENT, UserRole.LANDLORD, UserRole.ADMIN)
  getBookingAnalytics(
    @GetUser() user: User,
    @Query('agentId') agentId?: string,
  ) {
    return this.bookingService.getBookingAnalytics(agentId);
  }
}
