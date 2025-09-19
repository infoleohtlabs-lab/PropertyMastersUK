import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth ,
  getSchemaPath,} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { Notification, NotificationType } from './entities/notification.entity';

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new notification' })
  @ApiResponse({ status: 201, description: 'Notification created successfully', schema: { $ref: getSchemaPath(Notification) } })
  create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationService.create(createNotificationDto);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Create multiple notifications' })
  @ApiResponse({ status: 201, description: 'Notifications created successfully', schema: { type: 'array', items: { $ref: getSchemaPath(Notification) } } })
  createBulk(@Body() notifications: CreateNotificationDto[]) {
    return this.notificationService.createBulkNotifications(notifications);
  }

  @Get()
  @ApiOperation({ summary: 'Get all notifications' })
  @ApiResponse({ status: 200, description: 'Notifications retrieved successfully', schema: { type: 'array', items: { $ref: getSchemaPath(Notification) } } })
  findAll() {
    return this.notificationService.findAll();
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get notifications for a user' })
  @ApiResponse({ status: 200, description: 'User notifications retrieved successfully', schema: { type: 'array', items: { $ref: getSchemaPath(Notification) } } })
  findByUser(@Param('userId') userId: string) {
    return this.notificationService.findByUser(userId);
  }

  @Get('user/:userId/unread')
  @ApiOperation({ summary: 'Get unread notifications for a user' })
  @ApiResponse({ status: 200, description: 'Unread notifications retrieved successfully', schema: { type: 'array', items: { $ref: getSchemaPath(Notification) } } })
  findUnread(@Param('userId') userId: string) {
    return this.notificationService.findUnread(userId);
  }

  @Get('user/:userId/unread-count')
  @ApiOperation({ summary: 'Get unread notification count for a user' })
  @ApiResponse({ status: 200, description: 'Unread count retrieved successfully' })
  getUnreadCount(@Param('userId') userId: string) {
    return this.notificationService.getUnreadCount(userId);
  }

  @Get('user/:userId/type/:type')
  @ApiOperation({ summary: 'Get notifications by type for a user' })
  @ApiResponse({ status: 200, description: 'Notifications retrieved successfully', schema: { type: 'array', items: { $ref: getSchemaPath(Notification) } } })
  findByType(
    @Param('userId') userId: string,
    @Param('type') type: string,
  ) {
    return this.notificationService.findByType(userId, type as NotificationType);
  }

  @Get('user/:userId/stats')
  @ApiOperation({ summary: 'Get notification statistics for a user' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  getStats(@Param('userId') userId: string) {
    return this.notificationService.getNotificationStats(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get notification by ID' })
  @ApiResponse({ status: 200, description: 'Notification retrieved successfully', schema: { $ref: getSchemaPath(Notification) } })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  findOne(@Param('id') id: string) {
    return this.notificationService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update notification' })
  @ApiResponse({ status: 200, description: 'Notification updated successfully', schema: { $ref: getSchemaPath(Notification) } })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  update(@Param('id') id: string, @Body() updateNotificationDto: UpdateNotificationDto) {
    return this.notificationService.update(id, updateNotificationDto);
  }

  @Post(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiResponse({ status: 200, description: 'Notification marked as read', schema: { $ref: getSchemaPath(Notification) } })
  markAsRead(@Param('id') id: string) {
    return this.notificationService.markAsRead(id);
  }

  @Post('user/:userId/read-all')
  @ApiOperation({ summary: 'Mark all notifications as read for a user' })
  @ApiResponse({ status: 200, description: 'All notifications marked as read' })
  markAllAsRead(@Param('userId') userId: string) {
    return this.notificationService.markAllAsRead(userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete notification' })
  @ApiResponse({ status: 200, description: 'Notification deleted successfully' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  remove(@Param('id') id: string) {
    return this.notificationService.remove(id);
  }

  @Delete('user/:userId/all')
  @ApiOperation({ summary: 'Delete all notifications for a user' })
  @ApiResponse({ status: 200, description: 'All notifications deleted successfully' })
  removeAllForUser(@Param('userId') userId: string) {
    return this.notificationService.removeAllForUser(userId);
  }

  @Delete('cleanup/:daysOld')
  @ApiOperation({ summary: 'Delete old read notifications' })
  @ApiResponse({ status: 200, description: 'Old notifications cleaned up successfully' })
  cleanupOldNotifications(@Param('daysOld') daysOld: number) {
    return this.notificationService.deleteOldNotifications(daysOld);
  }
}
