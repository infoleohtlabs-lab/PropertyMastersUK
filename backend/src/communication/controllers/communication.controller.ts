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

  getSchemaPath,} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';
import {
  CommunicationService,
  CreateMessageDto,
  UpdateMessageDto,
  CreateConversationDto,
  UpdateConversationDto,
  MessageFilters,
  ConversationFilters,
  CommunicationDashboardStats,
} from '../services/communication.service';
import { Message, MessageType, MessageStatus, MessagePriority, ConversationType } from '../entities/message.entity';
import { Conversation, ConversationStatus, ConversationPrivacy } from '../entities/conversation.entity';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsUUID,
  IsArray,
  IsBoolean,
  IsDateString,
  IsInt,
  Min,
  Max,
  Length,
  ArrayMinSize,
  ValidateNested,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

// Request DTOs
class CreateMessageRequestDto {
  @ApiProperty({ description: 'Conversation ID', required: false })
  @IsOptional()
  @IsUUID()
  conversationId?: string;

  @ApiProperty({ description: 'Recipient user ID' })
  @IsUUID()
  recipientId: string;

  @ApiProperty({ description: 'Message subject', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  subject?: string;

  @ApiProperty({ description: 'Message content' })
  @IsString()
  @Length(1, 10000)
  content: string;

  @ApiProperty({ enum: MessageType, description: 'Message type', required: false })
  @IsOptional()
  @IsEnum(MessageType)
  type?: MessageType;

  @ApiProperty({ enum: MessagePriority, description: 'Message priority', required: false })
  @IsOptional()
  @IsEnum(MessagePriority)
  priority?: MessagePriority;

  @ApiProperty({ description: 'Related property ID', required: false })
  @IsOptional()
  @IsUUID()
  propertyId?: string;

  @ApiProperty({ description: 'Related maintenance request ID', required: false })
  @IsOptional()
  @IsUUID()
  maintenanceRequestId?: string;

  @ApiProperty({ description: 'Related booking ID', required: false })
  @IsOptional()
  @IsUUID()
  bookingId?: string;

  @ApiProperty({ description: 'Parent message ID for threading', required: false })
  @IsOptional()
  @IsUUID()
  parentMessageId?: string;

  @ApiProperty({ description: 'Message attachments', type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[];

  @ApiProperty({ description: 'Scheduled send time', required: false })
  @IsOptional()
  @IsDateString()
  scheduledAt?: Date;

  @ApiProperty({ description: 'Message expiration time', required: false })
  @IsOptional()
  @IsDateString()
  expiresAt?: Date;

  @ApiProperty({ description: 'Requires response', required: false })
  @IsOptional()
  @IsBoolean()
  requiresResponse?: boolean;

  @ApiProperty({ description: 'Is urgent message', required: false })
  @IsOptional()
  @IsBoolean()
  isUrgent?: boolean;

  @ApiProperty({ description: 'Message tags', type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ description: 'Message metadata', required: false })
  @IsOptional()
  metadata?: Record<string, any>;
}

class UpdateMessageRequestDto {
  @ApiProperty({ description: 'Message content', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 10000)
  content?: string;

  @ApiProperty({ description: 'Message subject', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  subject?: string;

  @ApiProperty({ enum: MessagePriority, description: 'Message priority', required: false })
  @IsOptional()
  @IsEnum(MessagePriority)
  priority?: MessagePriority;

  @ApiProperty({ enum: MessageStatus, description: 'Message status', required: false })
  @IsOptional()
  @IsEnum(MessageStatus)
  status?: MessageStatus;

  @ApiProperty({ description: 'Message attachments', type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[];

  @ApiProperty({ description: 'Scheduled send time', required: false })
  @IsOptional()
  @IsDateString()
  scheduledAt?: Date;

  @ApiProperty({ description: 'Message expiration time', required: false })
  @IsOptional()
  @IsDateString()
  expiresAt?: Date;

  @ApiProperty({ description: 'Requires response', required: false })
  @IsOptional()
  @IsBoolean()
  requiresResponse?: boolean;

  @ApiProperty({ description: 'Is urgent message', required: false })
  @IsOptional()
  @IsBoolean()
  isUrgent?: boolean;

  @ApiProperty({ description: 'Message tags', type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ description: 'Message metadata', required: false })
  @IsOptional()
  metadata?: Record<string, any>;
}

class CreateConversationRequestDto {
  @ApiProperty({ description: 'Conversation title' })
  @IsString()
  @Length(1, 255)
  title: string;

  @ApiProperty({ description: 'Conversation description', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 1000)
  description?: string;

  @ApiProperty({ enum: ConversationType, description: 'Conversation type', required: false })
  @IsOptional()
  @IsEnum(ConversationType)
  type?: ConversationType;

  @ApiProperty({ enum: ConversationPrivacy, description: 'Conversation privacy', required: false })
  @IsOptional()
  @IsEnum(ConversationPrivacy)
  privacy?: ConversationPrivacy;

  @ApiProperty({ description: 'Participant user IDs', type: [String] })
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID(4, { each: true })
  participantIds: string[];

  @ApiProperty({ description: 'Admin user IDs', type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsUUID(4, { each: true })
  adminIds?: string[];

  @ApiProperty({ description: 'Related property ID', required: false })
  @IsOptional()
  @IsUUID()
  propertyId?: string;

  @ApiProperty({ description: 'Related maintenance request ID', required: false })
  @IsOptional()
  @IsUUID()
  maintenanceRequestId?: string;

  @ApiProperty({ description: 'Related booking ID', required: false })
  @IsOptional()
  @IsUUID()
  bookingId?: string;

  @ApiProperty({ description: 'Maximum participants allowed', required: false })
  @IsOptional()
  @IsInt()
  @Min(2)
  @Max(1000)
  maxParticipants?: number;

  @ApiProperty({ description: 'Allow participants to add others', required: false })
  @IsOptional()
  @IsBoolean()
  allowParticipantInvites?: boolean;

  @ApiProperty({ description: 'Allow participants to leave', required: false })
  @IsOptional()
  @IsBoolean()
  allowParticipantLeave?: boolean;

  @ApiProperty({ description: 'Require approval for new participants', required: false })
  @IsOptional()
  @IsBoolean()
  requireApprovalForNewParticipants?: boolean;

  @ApiProperty({ description: 'Allow file sharing', required: false })
  @IsOptional()
  @IsBoolean()
  allowFileSharing?: boolean;

  @ApiProperty({ description: 'Allow image sharing', required: false })
  @IsOptional()
  @IsBoolean()
  allowImageSharing?: boolean;

  @ApiProperty({ description: 'Allow voice messages', required: false })
  @IsOptional()
  @IsBoolean()
  allowVoiceMessages?: boolean;

  @ApiProperty({ description: 'Message retention days', required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(3650)
  messageRetentionDays?: number;

  @ApiProperty({ description: 'Auto delete messages', required: false })
  @IsOptional()
  @IsBoolean()
  autoDeleteMessages?: boolean;

  @ApiProperty({ description: 'Send email notifications', required: false })
  @IsOptional()
  @IsBoolean()
  sendEmailNotifications?: boolean;

  @ApiProperty({ description: 'Send SMS notifications', required: false })
  @IsOptional()
  @IsBoolean()
  sendSmsNotifications?: boolean;

  @ApiProperty({ description: 'Send push notifications', required: false })
  @IsOptional()
  @IsBoolean()
  sendPushNotifications?: boolean;

  @ApiProperty({ description: 'Conversation avatar URL', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 500)
  avatarUrl?: string;

  @ApiProperty({ description: 'Conversation color', required: false })
  @IsOptional()
  @IsString()
  @Length(7, 7)
  color?: string;

  @ApiProperty({ description: 'Conversation emoji', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 10)
  emoji?: string;

  @ApiProperty({ description: 'Conversation tags', type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ description: 'Conversation metadata', required: false })
  @IsOptional()
  metadata?: Record<string, any>;
}

class UpdateConversationRequestDto {
  @ApiProperty({ description: 'Conversation title', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  title?: string;

  @ApiProperty({ description: 'Conversation description', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 1000)
  description?: string;

  @ApiProperty({ enum: ConversationStatus, description: 'Conversation status', required: false })
  @IsOptional()
  @IsEnum(ConversationStatus)
  status?: ConversationStatus;

  @ApiProperty({ enum: ConversationPrivacy, description: 'Conversation privacy', required: false })
  @IsOptional()
  @IsEnum(ConversationPrivacy)
  privacy?: ConversationPrivacy;

  @ApiProperty({ description: 'Maximum participants allowed', required: false })
  @IsOptional()
  @IsInt()
  @Min(2)
  @Max(1000)
  maxParticipants?: number;

  @ApiProperty({ description: 'Allow participants to add others', required: false })
  @IsOptional()
  @IsBoolean()
  allowParticipantInvites?: boolean;

  @ApiProperty({ description: 'Allow participants to leave', required: false })
  @IsOptional()
  @IsBoolean()
  allowParticipantLeave?: boolean;

  @ApiProperty({ description: 'Require approval for new participants', required: false })
  @IsOptional()
  @IsBoolean()
  requireApprovalForNewParticipants?: boolean;

  @ApiProperty({ description: 'Allow file sharing', required: false })
  @IsOptional()
  @IsBoolean()
  allowFileSharing?: boolean;

  @ApiProperty({ description: 'Allow image sharing', required: false })
  @IsOptional()
  @IsBoolean()
  allowImageSharing?: boolean;

  @ApiProperty({ description: 'Allow voice messages', required: false })
  @IsOptional()
  @IsBoolean()
  allowVoiceMessages?: boolean;

  @ApiProperty({ description: 'Message retention days', required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(3650)
  messageRetentionDays?: number;

  @ApiProperty({ description: 'Auto delete messages', required: false })
  @IsOptional()
  @IsBoolean()
  autoDeleteMessages?: boolean;

  @ApiProperty({ description: 'Send email notifications', required: false })
  @IsOptional()
  @IsBoolean()
  sendEmailNotifications?: boolean;

  @ApiProperty({ description: 'Send SMS notifications', required: false })
  @IsOptional()
  @IsBoolean()
  sendSmsNotifications?: boolean;

  @ApiProperty({ description: 'Send push notifications', required: false })
  @IsOptional()
  @IsBoolean()
  sendPushNotifications?: boolean;

  @ApiProperty({ description: 'Conversation avatar URL', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 500)
  avatarUrl?: string;

  @ApiProperty({ description: 'Conversation color', required: false })
  @IsOptional()
  @IsString()
  @Length(7, 7)
  color?: string;

  @ApiProperty({ description: 'Conversation emoji', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 10)
  emoji?: string;

  @ApiProperty({ description: 'Conversation tags', type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ description: 'Conversation metadata', required: false })
  @IsOptional()
  metadata?: Record<string, any>;
}

@ApiTags('Communication')
@Controller('communication')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CommunicationController {
  constructor(private readonly communicationService: CommunicationService) {}

  // Message Endpoints
  @Post('messages')
  @ApiOperation({ summary: 'Create a new message' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Message created successfully',
    type: Message,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Conversation or recipient not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Access denied',
  })
  @ApiBody({ type: CreateMessageRequestDto })
  @UsePipes(new ValidationPipe({ transform: true }))
  async createMessage(
    @Request() req: any,
    @Body() createMessageDto: CreateMessageRequestDto,
  ): Promise<Message> {
    const { tenantOrganizationId, userId } = req.user;
    return await this.communicationService.createMessage(
      tenantOrganizationId,
      userId,
      createMessageDto,
    );
  }

  @Get('messages/:id')
  @ApiOperation({ summary: 'Get message by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Message retrieved successfully',
    type: Message,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Message not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Access denied',
  })
  @ApiParam({ name: 'id', description: 'Message ID' })
  async getMessageById(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) messageId: string,
  ): Promise<Message> {
    const { tenantOrganizationId, userId } = req.user;
    return await this.communicationService.getMessageById(
      tenantOrganizationId,
      messageId,
      userId,
    );
  }

  @Get('messages')
  @ApiOperation({ summary: 'Get messages with filters and pagination' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Messages retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        messages: {
          type: 'array',
          items: { $ref: '#/components/schemas/Message' },
        },
        total: { type: 'number' },
      },
    },
  })
  @ApiQuery({ name: 'conversationId', required: false, description: 'Filter by conversation ID' })
  @ApiQuery({ name: 'senderId', required: false, description: 'Filter by sender ID' })
  @ApiQuery({ name: 'recipientId', required: false, description: 'Filter by recipient ID' })
  @ApiQuery({ name: 'type', required: false, enum: MessageType, description: 'Filter by message type' })
  @ApiQuery({ name: 'status', required: false, enum: MessageStatus, description: 'Filter by message status' })
  @ApiQuery({ name: 'priority', required: false, enum: MessagePriority, description: 'Filter by message priority' })
  @ApiQuery({ name: 'propertyId', required: false, description: 'Filter by property ID' })
  @ApiQuery({ name: 'maintenanceRequestId', required: false, description: 'Filter by maintenance request ID' })
  @ApiQuery({ name: 'bookingId', required: false, description: 'Filter by booking ID' })
  @ApiQuery({ name: 'isRead', required: false, type: Boolean, description: 'Filter by read status' })
  @ApiQuery({ name: 'isUrgent', required: false, type: Boolean, description: 'Filter by urgent status' })
  @ApiQuery({ name: 'hasAttachments', required: false, type: Boolean, description: 'Filter by attachment presence' })
  @ApiQuery({ name: 'search', required: false, description: 'Search in subject and content' })
  @ApiQuery({ name: 'tags', required: false, description: 'Filter by tags (comma-separated)' })
  @ApiQuery({ name: 'dateFrom', required: false, description: 'Filter from date (ISO string)' })
  @ApiQuery({ name: 'dateTo', required: false, description: 'Filter to date (ISO string)' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 20)' })
  @ApiQuery({ name: 'sortBy', required: false, description: 'Sort field (default: createdAt)' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'], description: 'Sort order (default: DESC)' })
  async getMessages(
    @Request() req: any,
    @Query() query: any,
  ): Promise<{ messages: Message[]; total: number }> {
    const { tenantOrganizationId, userId } = req.user;
    
    const filters: MessageFilters = {
      ...query,
      tags: query.tags ? query.tags.split(',') : undefined,
      dateFrom: query.dateFrom ? new Date(query.dateFrom) : undefined,
      dateTo: query.dateTo ? new Date(query.dateTo) : undefined,
      page: query.page ? parseInt(query.page) : undefined,
      limit: query.limit ? parseInt(query.limit) : undefined,
      isRead: query.isRead !== undefined ? query.isRead === 'true' : undefined,
      isUrgent: query.isUrgent !== undefined ? query.isUrgent === 'true' : undefined,
      hasAttachments: query.hasAttachments !== undefined ? query.hasAttachments === 'true' : undefined,
    };

    return await this.communicationService.getMessages(
      tenantOrganizationId,
      userId,
      filters,
    );
  }

  @Put('messages/:id')
  @ApiOperation({ summary: 'Update message' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Message updated successfully',
    type: Message,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Message not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Access denied',
  })
  @ApiParam({ name: 'id', description: 'Message ID' })
  @ApiBody({ type: UpdateMessageRequestDto })
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateMessage(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) messageId: string,
    @Body() updateMessageDto: UpdateMessageRequestDto,
  ): Promise<Message> {
    const { tenantOrganizationId, userId } = req.user;
    return await this.communicationService.updateMessage(
      messageId,
      updateMessageDto,
      tenantOrganizationId,
      userId,
    );
  }

  @Delete('messages/:id')
  @ApiOperation({ summary: 'Delete message' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Message deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Message not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Access denied',
  })
  @ApiParam({ name: 'id', description: 'Message ID' })
  async deleteMessage(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) messageId: string,
  ): Promise<void> {
    const { tenantOrganizationId, userId } = req.user;
    await this.communicationService.deleteMessage(
      messageId,
      tenantOrganizationId,
      userId,
    );
  }

  @Put('messages/:id/read')
  @ApiOperation({ summary: 'Mark message as read' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Message marked as read successfully',
    type: Message,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Message not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Access denied',
  })
  @ApiParam({ name: 'id', description: 'Message ID' })
  async markMessageAsRead(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) messageId: string,
  ): Promise<Message> {
    const { tenantOrganizationId, userId } = req.user;
    return await this.communicationService.markMessageAsRead(
      messageId,
      userId,
    );
  }

  // Conversation Endpoints
  @Post('conversations')
  @ApiOperation({ summary: 'Create a new conversation' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Conversation created successfully',
    type: Conversation,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'One or more participants not found',
  })
  @ApiBody({ type: CreateConversationRequestDto })
  @UsePipes(new ValidationPipe({ transform: true }))
  async createConversation(
    @Request() req: any,
    @Body() createConversationDto: CreateConversationRequestDto,
  ): Promise<Conversation> {
    const { tenantOrganizationId, userId } = req.user;
    return await this.communicationService.createConversation(
      tenantOrganizationId,
      userId,
      createConversationDto,
    );
  }

  @Get('conversations/:id')
  @ApiOperation({ summary: 'Get conversation by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Conversation retrieved successfully',
    type: Conversation,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Conversation not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Access denied',
  })
  @ApiParam({ name: 'id', description: 'Conversation ID' })
  async getConversationById(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) conversationId: string,
  ): Promise<Conversation> {
    const { tenantOrganizationId, userId } = req.user;
    return await this.communicationService.getConversationById(
      conversationId,
      tenantOrganizationId,
    );
  }

  @Get('conversations')
  @ApiOperation({ summary: 'Get conversations with filters and pagination' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Conversations retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        conversations: {
          type: 'array',
          items: { $ref: '#/components/schemas/Conversation' },
        },
        total: { type: 'number' },
      },
    },
  })
  @ApiQuery({ name: 'type', required: false, description: 'Filter by conversation type' })
  @ApiQuery({ name: 'status', required: false, enum: ConversationStatus, description: 'Filter by conversation status' })
  @ApiQuery({ name: 'privacy', required: false, enum: ConversationPrivacy, description: 'Filter by conversation privacy' })
  @ApiQuery({ name: 'createdById', required: false, description: 'Filter by creator ID' })
  @ApiQuery({ name: 'participantId', required: false, description: 'Filter by participant ID' })
  @ApiQuery({ name: 'propertyId', required: false, description: 'Filter by property ID' })
  @ApiQuery({ name: 'maintenanceRequestId', required: false, description: 'Filter by maintenance request ID' })
  @ApiQuery({ name: 'bookingId', required: false, description: 'Filter by booking ID' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean, description: 'Filter by active status' })
  @ApiQuery({ name: 'isArchived', required: false, type: Boolean, description: 'Filter by archived status' })
  @ApiQuery({ name: 'isPinned', required: false, type: Boolean, description: 'Filter by pinned status' })
  @ApiQuery({ name: 'search', required: false, description: 'Search in title and description' })
  @ApiQuery({ name: 'tags', required: false, description: 'Filter by tags (comma-separated)' })
  @ApiQuery({ name: 'dateFrom', required: false, description: 'Filter from date (ISO string)' })
  @ApiQuery({ name: 'dateTo', required: false, description: 'Filter to date (ISO string)' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 20)' })
  @ApiQuery({ name: 'sortBy', required: false, description: 'Sort field (default: updatedAt)' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'], description: 'Sort order (default: DESC)' })
  async getConversations(
    @Request() req: any,
    @Query() query: any,
  ): Promise<{ conversations: Conversation[]; total: number }> {
    const { tenantOrganizationId, userId } = req.user;
    
    const filters: ConversationFilters = {
      ...query,
      tags: query.tags ? query.tags.split(',') : undefined,
      dateFrom: query.dateFrom ? new Date(query.dateFrom) : undefined,
      dateTo: query.dateTo ? new Date(query.dateTo) : undefined,
      page: query.page ? parseInt(query.page) : undefined,
      limit: query.limit ? parseInt(query.limit) : undefined,
      isActive: query.isActive !== undefined ? query.isActive === 'true' : undefined,
      isArchived: query.isArchived !== undefined ? query.isArchived === 'true' : undefined,
      isPinned: query.isPinned !== undefined ? query.isPinned === 'true' : undefined,
    };

    return await this.communicationService.getConversations(
      tenantOrganizationId,
      userId,
      filters,
    );
  }

  @Put('conversations/:id')
  @ApiOperation({ summary: 'Update conversation' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Conversation updated successfully',
    type: Conversation,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Conversation not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Access denied',
  })
  @ApiParam({ name: 'id', description: 'Conversation ID' })
  @ApiBody({ type: UpdateConversationRequestDto })
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateConversation(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) conversationId: string,
    @Body() updateConversationDto: UpdateConversationRequestDto,
  ): Promise<Conversation> {
    const { tenantOrganizationId, userId } = req.user;
    return await this.communicationService.updateConversation(
      conversationId,
      tenantOrganizationId,
      userId,
      updateConversationDto,
    );
  }

  @Delete('conversations/:id')
  @ApiOperation({ summary: 'Delete conversation' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Conversation deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Conversation not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Access denied',
  })
  @ApiParam({ name: 'id', description: 'Conversation ID' })
  async deleteConversation(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) conversationId: string,
  ): Promise<void> {
    const { tenantOrganizationId, userId } = req.user;
    await this.communicationService.deleteConversation(
      conversationId,
      tenantOrganizationId,
      userId,
    );
  }

  // Dashboard Endpoint
  @Get('dashboard/stats')
  @ApiOperation({ summary: 'Get communication dashboard statistics' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Dashboard statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        totalMessages: { type: 'number' },
        unreadMessages: { type: 'number' },
        totalConversations: { type: 'number' },
        activeConversations: { type: 'number' },
        messagesByType: { type: 'object' },
        messagesByStatus: { type: 'object' },
        messagesByPriority: { type: 'object' },
        conversationsByType: { type: 'object' },
        conversationsByStatus: { type: 'object' },
        recentActivity: { type: 'object' },
        topSenders: { type: 'array' },
        responseTimeStats: { type: 'object' },
      },
    },
  })
  @Roles(UserRole.ADMIN, UserRole.PROPERTY_MANAGER, UserRole.LANDLORD)
  async getCommunicationDashboardStats(
    @Request() req: any,
  ): Promise<CommunicationDashboardStats> {
    const { tenantOrganizationId, userId } = req.user;
    return await this.communicationService.getCommunicationDashboardStats(
      tenantOrganizationId,
      userId,
    );
  }
}
