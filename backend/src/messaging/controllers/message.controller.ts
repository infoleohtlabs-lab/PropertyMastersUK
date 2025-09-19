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
  ParseUUIDPipe,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth ,
  getSchemaPath,} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { MessageService } from '../services/message.service';
import { CreateMessageDto } from '../dto/create-message.dto';
import { UpdateMessageDto } from '../dto/update-message.dto';
import { AddReactionDto } from '../dto/add-reaction.dto';
import { MarkAsReadDto } from '../dto/mark-as-read.dto';
import { Message } from '../entities/message.entity';
import { MessageReaction } from '../entities/message-reaction.entity';
import { MessageAttachment } from '../entities/message-attachment.entity';

@ApiTags('Messages')
@Controller('messages')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new message' })
  @ApiResponse({ status: 201, description: 'Message created successfully', schema: { $ref: getSchemaPath(Message) } })
  @ApiResponse({ status: 403, description: 'Access denied to conversation' })
  async createMessage(
    @Body() createMessageDto: CreateMessageDto,
    @Request() req: any,
  ): Promise<Message> {
    return this.messageService.createMessage({
      ...createMessageDto,
      senderId: req.user.id,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get message by ID' })
  @ApiResponse({ status: 200, description: 'Message found', schema: { $ref: getSchemaPath(Message) } })
  @ApiResponse({ status: 404, description: 'Message not found' })
  async findById(@Param('id', ParseUUIDPipe) id: string): Promise<Message> {
    return this.messageService.findById(id);
  }

  @Get('conversation/:conversationId')
  @ApiOperation({ summary: 'Get messages for a conversation' })
  @ApiResponse({ status: 200, description: 'Messages retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Access denied to conversation' })
  async getConversationMessages(
    @Param('conversationId', ParseUUIDPipe) conversationId: string,
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 50,
    @Request() req: any,
  ): Promise<{ messages: Message[]; total: number }> {
    return this.messageService.findConversationMessages(
      conversationId,
      req.user.id,
      page,
      limit,
    );
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a message' })
  @ApiResponse({ status: 200, description: 'Message updated successfully', schema: { $ref: getSchemaPath(Message) } })
  @ApiResponse({ status: 403, description: 'Can only edit your own messages' })
  @ApiResponse({ status: 404, description: 'Message not found' })
  async updateMessage(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateMessageDto: UpdateMessageDto,
    @Request() req: any,
  ): Promise<Message> {
    return this.messageService.updateMessage(id, updateMessageDto, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a message' })
  @ApiResponse({ status: 200, description: 'Message deleted successfully' })
  @ApiResponse({ status: 403, description: 'Can only delete your own messages' })
  @ApiResponse({ status: 404, description: 'Message not found' })
  async deleteMessage(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any,
  ): Promise<{ message: string }> {
    await this.messageService.deleteMessage(id, req.user.id);
    return { message: 'Message deleted successfully' };
  }

  @Post(':id/reactions')
  @ApiOperation({ summary: 'Add reaction to a message' })
  @ApiResponse({ status: 201, description: 'Reaction added successfully', schema: { $ref: getSchemaPath(MessageReaction) } })
  @ApiResponse({ status: 400, description: 'Reaction already exists' })
  @ApiResponse({ status: 403, description: 'Access denied to conversation' })
  async addReaction(
    @Param('id', ParseUUIDPipe) messageId: string,
    @Body() addReactionDto: AddReactionDto,
    @Request() req: any,
  ): Promise<MessageReaction> {
    return this.messageService.addReaction({
      messageId,
      userId: req.user.id,
      emoji: addReactionDto.emoji,
    });
  }

  @Delete(':id/reactions/:emoji')
  @ApiOperation({ summary: 'Remove reaction from a message' })
  @ApiResponse({ status: 200, description: 'Reaction removed successfully' })
  @ApiResponse({ status: 404, description: 'Reaction not found' })
  @ApiResponse({ status: 403, description: 'Access denied to conversation' })
  async removeReaction(
    @Param('id', ParseUUIDPipe) messageId: string,
    @Param('emoji') emoji: string,
    @Request() req: any,
  ): Promise<{ message: string }> {
    await this.messageService.removeReaction(messageId, req.user.id, emoji);
    return { message: 'Reaction removed successfully' };
  }

  @Post(':id/read')
  @ApiOperation({ summary: 'Mark message as read' })
  @ApiResponse({ status: 200, description: 'Message marked as read' })
  @ApiResponse({ status: 403, description: 'Access denied to conversation' })
  async markAsRead(
    @Param('id', ParseUUIDPipe) messageId: string,
    @Request() req: any,
  ): Promise<{ message: string }> {
    await this.messageService.markAsRead(messageId, req.user.id);
    return { message: 'Message marked as read' };
  }

  @Post('conversation/:conversationId/read-all')
  @ApiOperation({ summary: 'Mark all messages in conversation as read' })
  @ApiResponse({ status: 200, description: 'All messages marked as read' })
  @ApiResponse({ status: 403, description: 'Access denied to conversation' })
  async markConversationAsRead(
    @Param('conversationId', ParseUUIDPipe) conversationId: string,
    @Request() req: any,
  ): Promise<{ message: string }> {
    await this.messageService.markConversationAsRead(conversationId, req.user.id);
    return { message: 'All messages marked as read' };
  }

  @Get('conversation/:conversationId/unread-count')
  @ApiOperation({ summary: 'Get unread message count for conversation' })
  @ApiResponse({ status: 200, description: 'Unread count retrieved successfully' })
  async getUnreadCount(
    @Param('conversationId', ParseUUIDPipe) conversationId: string,
    @Request() req: any,
  ): Promise<{ count: number }> {
    const count = await this.messageService.getUnreadCount(conversationId, req.user.id);
    return { count };
  }

  @Get('conversation/:conversationId/search')
  @ApiOperation({ summary: 'Search messages in conversation' })
  @ApiResponse({ status: 200, description: 'Search results retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Access denied to conversation' })
  async searchMessages(
    @Param('conversationId', ParseUUIDPipe) conversationId: string,
    @Query('q') query: string,
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 20,
    @Request() req: any,
  ): Promise<{ messages: Message[]; total: number }> {
    return this.messageService.searchMessages(
      conversationId,
      req.user.id,
      query,
      page,
      limit,
    );
  }

  @Post(':id/forward')
  @ApiOperation({ summary: 'Forward a message to another conversation' })
  @ApiResponse({ status: 201, description: 'Message forwarded successfully', schema: { $ref: getSchemaPath(Message) } })
  @ApiResponse({ status: 403, description: 'Access denied to one or both conversations' })
  async forwardMessage(
    @Param('id', ParseUUIDPipe) messageId: string,
    @Body('targetConversationId', ParseUUIDPipe) targetConversationId: string,
    @Request() req: any,
  ): Promise<Message> {
    return this.messageService.forwardMessage(
      messageId,
      targetConversationId,
      req.user.id,
    );
  }

  @Get(':id/reactions')
  @ApiOperation({ summary: 'Get all reactions for a message' })
  @ApiResponse({ status: 200, description: 'Reactions retrieved successfully', schema: { type: 'array', items: { $ref: getSchemaPath(MessageReaction) } } })
  async getMessageReactions(
    @Param('id', ParseUUIDPipe) messageId: string,
  ): Promise<MessageReaction[]> {
    return this.messageService.getMessageReactions(messageId);
  }

  @Get(':id/attachments')
  @ApiOperation({ summary: 'Get all attachments for a message' })
  @ApiResponse({ status: 200, description: 'Attachments retrieved successfully', schema: { type: 'array', items: { $ref: getSchemaPath(MessageAttachment) } } })
  async getMessageAttachments(
    @Param('id', ParseUUIDPipe) messageId: string,
  ): Promise<MessageAttachment[]> {
    return this.messageService.getMessageAttachments(messageId);
  }
}
