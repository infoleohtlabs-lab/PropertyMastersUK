import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CommunicationService } from './communication.service';
import { CreateCommunicationDto } from './dto/create-communication.dto';
import { UpdateCommunicationDto } from './dto/update-communication.dto';
import { Communication } from './entities/communication.entity';

@ApiTags('communication')
@Controller('communication')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CommunicationController {
  constructor(private readonly communicationService: CommunicationService) {}

  @Post()
  @ApiOperation({ summary: 'Send a new message' })
  @ApiResponse({ status: 201, description: 'Message sent successfully', type: Communication })
  create(@Body() createCommunicationDto: CreateCommunicationDto) {
    return this.communicationService.create(createCommunicationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all communications' })
  @ApiResponse({ status: 200, description: 'Communications retrieved successfully', type: [Communication] })
  findAll() {
    return this.communicationService.findAll();
  }

  @Get('search')
  @ApiOperation({ summary: 'Search communications' })
  @ApiResponse({ status: 200, description: 'Communications found successfully', type: [Communication] })
  search(
    @Query('query') query: string,
    @Query('userId') userId?: string,
  ) {
    return this.communicationService.searchCommunications(query, userId);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get communications for a user' })
  @ApiResponse({ status: 200, description: 'User communications retrieved successfully', type: [Communication] })
  findByUser(@Param('userId') userId: string) {
    return this.communicationService.findByUser(userId);
  }

  @Get('property/:propertyId')
  @ApiOperation({ summary: 'Get communications for a property' })
  @ApiResponse({ status: 200, description: 'Property communications retrieved successfully', type: [Communication] })
  findByProperty(@Param('propertyId') propertyId: string) {
    return this.communicationService.findByProperty(propertyId);
  }

  @Get('unread/:userId')
  @ApiOperation({ summary: 'Get unread communications for a user' })
  @ApiResponse({ status: 200, description: 'Unread communications retrieved successfully', type: [Communication] })
  findUnread(@Param('userId') userId: string) {
    return this.communicationService.findUnread(userId);
  }

  @Get('unread-count/:userId')
  @ApiOperation({ summary: 'Get unread message count for a user' })
  @ApiResponse({ status: 200, description: 'Unread count retrieved successfully' })
  getUnreadCount(@Param('userId') userId: string) {
    return this.communicationService.getUnreadCount(userId);
  }

  @Get('conversation/:user1Id/:user2Id')
  @ApiOperation({ summary: 'Get conversation between two users' })
  @ApiResponse({ status: 200, description: 'Conversation retrieved successfully', type: [Communication] })
  getConversation(
    @Param('user1Id') user1Id: string,
    @Param('user2Id') user2Id: string,
  ) {
    return this.communicationService.getConversation(user1Id, user2Id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get communication by ID' })
  @ApiResponse({ status: 200, description: 'Communication retrieved successfully', type: Communication })
  @ApiResponse({ status: 404, description: 'Communication not found' })
  findOne(@Param('id') id: string) {
    return this.communicationService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update communication' })
  @ApiResponse({ status: 200, description: 'Communication updated successfully', type: Communication })
  @ApiResponse({ status: 404, description: 'Communication not found' })
  update(@Param('id') id: string, @Body() updateCommunicationDto: UpdateCommunicationDto) {
    return this.communicationService.update(id, updateCommunicationDto);
  }

  @Post(':id/read')
  @ApiOperation({ summary: 'Mark communication as read' })
  @ApiResponse({ status: 200, description: 'Communication marked as read', type: Communication })
  markAsRead(@Param('id') id: string) {
    return this.communicationService.markAsRead(id);
  }

  @Post(':id/replied')
  @ApiOperation({ summary: 'Mark communication as replied' })
  @ApiResponse({ status: 200, description: 'Communication marked as replied', type: Communication })
  markAsReplied(@Param('id') id: string) {
    return this.communicationService.markAsReplied(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete communication' })
  @ApiResponse({ status: 200, description: 'Communication deleted successfully' })
  @ApiResponse({ status: 404, description: 'Communication not found' })
  remove(@Param('id') id: string) {
    return this.communicationService.remove(id);
  }
}