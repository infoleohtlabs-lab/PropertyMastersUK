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
import { ConversationService } from '../services/conversation.service';
import { CreateConversationDto } from '../dto/create-conversation.dto';
import { UpdateConversationDto } from '../dto/update-conversation.dto';
import { AddParticipantDto } from '../dto/add-participant.dto';
import { Conversation } from '../entities/conversation.entity';

@ApiTags('Conversations')
@Controller('conversations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new conversation' })
  @ApiResponse({ status: 201, description: 'Conversation created successfully', schema: { $ref: getSchemaPath(Conversation) } })
  async createConversation(
    @Body() createConversationDto: CreateConversationDto,
    @Request() req: any,
  ): Promise<Conversation> {
    return this.conversationService.create(
      createConversationDto,
      req.user.id,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get user conversations' })
  @ApiResponse({ status: 200, description: 'Conversations retrieved successfully' })
  async getUserConversations(
    @Request() req: any,
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 20,
    @Query('type') type?: string,
    @Query('archived') archived?: boolean,
  ): Promise<{ conversations: Conversation[]; total: number }> {
    return this.conversationService.findAll(
      req.user.id,
      page,
      limit,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get conversation by ID' })
  @ApiResponse({ status: 200, description: 'Conversation found', schema: { $ref: getSchemaPath(Conversation) } })
  @ApiResponse({ status: 404, description: 'Conversation not found' })
  @ApiResponse({ status: 403, description: 'Access denied to conversation' })
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any,
  ): Promise<Conversation> {
    return this.conversationService.findById(id, req.user.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update conversation' })
  @ApiResponse({ status: 200, description: 'Conversation updated successfully', schema: { $ref: getSchemaPath(Conversation) } })
  @ApiResponse({ status: 403, description: 'Access denied to conversation' })
  @ApiResponse({ status: 404, description: 'Conversation not found' })
  async updateConversation(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateConversationDto: UpdateConversationDto,
    @Request() req: any,
  ): Promise<Conversation> {
    return this.conversationService.update(
      id,
      updateConversationDto,
      req.user.id,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete conversation' })
  @ApiResponse({ status: 200, description: 'Conversation deleted successfully' })
  @ApiResponse({ status: 403, description: 'Access denied to conversation' })
  @ApiResponse({ status: 404, description: 'Conversation not found' })
  async deleteConversation(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any,
  ): Promise<{ message: string }> {
    await this.conversationService.delete(id, req.user.id);
    return { message: 'Conversation deleted successfully' };
  }

  @Post(':id/participants')
  @ApiOperation({ summary: 'Add participant to conversation' })
  @ApiResponse({ status: 200, description: 'Participant added successfully', schema: { $ref: getSchemaPath(Conversation) } })
  @ApiResponse({ status: 403, description: 'Access denied to conversation' })
  @ApiResponse({ status: 404, description: 'Conversation not found' })
  async addParticipant(
    @Param('id', ParseUUIDPipe) conversationId: string,
    @Body() addParticipantDto: AddParticipantDto,
    @Request() req: any,
  ): Promise<Conversation> {
    return this.conversationService.addParticipant(
      conversationId,
      addParticipantDto,
      req.user.id,
    );
  }

  @Delete(':id/participants/:userId')
  @ApiOperation({ summary: 'Remove participant from conversation' })
  @ApiResponse({ status: 200, description: 'Participant removed successfully', schema: { $ref: getSchemaPath(Conversation) } })
  @ApiResponse({ status: 403, description: 'Access denied to conversation' })
  @ApiResponse({ status: 404, description: 'Conversation not found' })
  async removeParticipant(
    @Param('id', ParseUUIDPipe) conversationId: string,
    @Param('userId', ParseUUIDPipe) userId: string,
    @Request() req: any,
  ): Promise<Conversation> {
    return this.conversationService.removeParticipant(
      conversationId,
      userId,
      req.user.id,
    );
  }

  @Post(':id/archive')
  @ApiOperation({ summary: 'Archive conversation' })
  @ApiResponse({ status: 200, description: 'Conversation archived successfully' })
  @ApiResponse({ status: 403, description: 'Access denied to conversation' })
  async archiveConversation(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any,
  ): Promise<{ message: string }> {
    await this.conversationService.archiveConversation(id, req.user.id);
    return { message: 'Conversation archived successfully' };
  }

  @Post(':id/unarchive')
  @ApiOperation({ summary: 'Unarchive conversation' })
  @ApiResponse({ status: 200, description: 'Conversation unarchived successfully' })
  @ApiResponse({ status: 403, description: 'Access denied to conversation' })
  async unarchiveConversation(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any,
  ): Promise<{ message: string }> {
    await this.conversationService.unarchiveConversation(id, req.user.id);
    return { message: 'Conversation unarchived successfully' };
  }

  @Post(':id/mute')
  @ApiOperation({ summary: 'Mute conversation' })
  @ApiResponse({ status: 200, description: 'Conversation muted successfully' })
  @ApiResponse({ status: 403, description: 'Access denied to conversation' })
  async muteConversation(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any,
  ): Promise<{ message: string }> {
    await this.conversationService.muteConversation(id, req.user.id);
    return { message: 'Conversation muted successfully' };
  }

  @Post(':id/unmute')
  @ApiOperation({ summary: 'Unmute conversation' })
  @ApiResponse({ status: 200, description: 'Conversation unmuted successfully' })
  @ApiResponse({ status: 403, description: 'Access denied to conversation' })
  async unmuteConversation(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any,
  ): Promise<{ message: string }> {
    await this.conversationService.unmuteConversation(id, req.user.id);
    return { message: 'Conversation unmuted successfully' };
  }

  @Post(':id/pin')
  @ApiOperation({ summary: 'Pin conversation' })
  @ApiResponse({ status: 200, description: 'Conversation pinned successfully' })
  @ApiResponse({ status: 403, description: 'Access denied to conversation' })
  async pinConversation(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any,
  ): Promise<{ message: string }> {
    await this.conversationService.pinConversation(id, req.user.id);
    return { message: 'Conversation pinned successfully' };
  }

  @Post(':id/unpin')
  @ApiOperation({ summary: 'Unpin conversation' })
  @ApiResponse({ status: 200, description: 'Conversation unpinned successfully' })
  @ApiResponse({ status: 403, description: 'Access denied to conversation' })
  async unpinConversation(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any,
  ): Promise<{ message: string }> {
    await this.conversationService.unpinConversation(id, req.user.id);
    return { message: 'Conversation unpinned successfully' };
  }

  @Get('search')
  @ApiOperation({ summary: 'Search conversations' })
  @ApiResponse({ status: 200, description: 'Search results retrieved successfully' })
  async searchConversations(
    @Query('q') query: string,
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 20,
    @Request() req: any,
  ): Promise<{ conversations: Conversation[]; total: number }> {
    const conversations = await this.conversationService.searchConversations(
      req.user.id,
      query,
    );
    
    // Apply pagination manually
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedConversations = conversations.slice(startIndex, endIndex);
    
    return {
      conversations: paginatedConversations,
      total: conversations.length,
    };
  }

  @Get(':id/participants')
  @ApiOperation({ summary: 'Get conversation participants' })
  @ApiResponse({ status: 200, description: 'Participants retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Access denied to conversation' })
  async getParticipants(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any,
  ): Promise<any[]> {
    return this.conversationService.getParticipants(id, req.user.id);
  }

  @Get('direct/:userId')
  @ApiOperation({ summary: 'Get or create direct conversation with user' })
  @ApiResponse({ status: 200, description: 'Direct conversation retrieved or created', schema: { $ref: getSchemaPath(Conversation) } })
  async getOrCreateDirectConversation(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Request() req: any,
  ): Promise<Conversation> {
    return this.conversationService.getOrCreateDirectConversation(
      req.user.id,
      userId,
    );
  }
}
