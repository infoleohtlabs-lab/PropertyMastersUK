import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConversationService } from '../services/conversation.service';
import { MessageService } from '../services/message.service';
import { CreateMessageDto } from '../dto/create-message.dto';
import { AddReactionDto } from '../dto/add-reaction.dto';
import { MarkAsReadDto } from '../dto/mark-as-read.dto';
import { JoinConversationDto } from '../dto/join-conversation.dto';
import { TypingIndicatorDto } from '../dto/typing-indicator.dto';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/messaging',
})
@UsePipes(new ValidationPipe())
export class MessagingGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('MessagingGateway');
  private connectedUsers = new Map<string, string>(); // userId -> socketId
  private userSockets = new Map<string, AuthenticatedSocket>(); // socketId -> socket
  private conversationRooms = new Map<string, Set<string>>(); // conversationId -> Set of socketIds

  constructor(
    private jwtService: JwtService,
    private conversationService: ConversationService,
    private messageService: MessageService,
  ) {}

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');
  }

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.replace('Bearer ', '');
      
      if (!token) {
        this.logger.warn(`Client ${client.id} attempted to connect without token`);
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      client.userId = payload.sub;
      client.userRole = payload.role;

      this.connectedUsers.set(client.userId, client.id);
      this.userSockets.set(client.id, client);

      // Join user to their conversations
      const userConversations = await this.conversationService.getUserConversations(client.userId);
      for (const conversation of userConversations) {
        client.join(conversation.id);
        
        if (!this.conversationRooms.has(conversation.id)) {
          this.conversationRooms.set(conversation.id, new Set());
        }
        this.conversationRooms.get(conversation.id).add(client.id);
      }

      // Notify user is online
      client.broadcast.emit('user_online', {
        userId: client.userId,
        timestamp: new Date(),
      });

      this.logger.log(`Client ${client.id} connected as user ${client.userId}`);
    } catch (error) {
      this.logger.error(`Connection failed for client ${client.id}:`, error.message);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      this.connectedUsers.delete(client.userId);
      
      // Remove from conversation rooms
      for (const [conversationId, socketIds] of this.conversationRooms.entries()) {
        socketIds.delete(client.id);
        if (socketIds.size === 0) {
          this.conversationRooms.delete(conversationId);
        }
      }

      // Notify user is offline
      client.broadcast.emit('user_offline', {
        userId: client.userId,
        timestamp: new Date(),
      });

      this.logger.log(`Client ${client.id} disconnected (user ${client.userId})`);
    }
    
    this.userSockets.delete(client.id);
  }

  @SubscribeMessage('join_conversation')
  async handleJoinConversation(
    @MessageBody() data: JoinConversationDto,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      const { conversationId } = data;
      
      // Verify user has access to this conversation
      const hasAccess = await this.conversationService.userHasAccess(conversationId, client.userId);
      if (!hasAccess) {
        client.emit('error', { message: 'Access denied to conversation' });
        return;
      }

      client.join(conversationId);
      
      if (!this.conversationRooms.has(conversationId)) {
        this.conversationRooms.set(conversationId, new Set());
      }
      this.conversationRooms.get(conversationId).add(client.id);

      client.emit('joined_conversation', { conversationId });
      
      // Notify others in the conversation
      client.to(conversationId).emit('user_joined_conversation', {
        conversationId,
        userId: client.userId,
        timestamp: new Date(),
      });
    } catch (error) {
      this.logger.error('Error joining conversation:', error);
      client.emit('error', { message: 'Failed to join conversation' });
    }
  }

  @SubscribeMessage('leave_conversation')
  async handleLeaveConversation(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    const { conversationId } = data;
    
    client.leave(conversationId);
    
    if (this.conversationRooms.has(conversationId)) {
      this.conversationRooms.get(conversationId).delete(client.id);
    }

    // Notify others in the conversation
    client.to(conversationId).emit('user_left_conversation', {
      conversationId,
      userId: client.userId,
      timestamp: new Date(),
    });
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @MessageBody() data: CreateMessageDto,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      const message = await this.messageService.createMessage({
        ...data,
        senderId: client.userId,
      });

      // Broadcast message to conversation participants
      this.server.to(data.conversationId).emit('new_message', message);
      
      // Send delivery confirmations to online users
      const conversationParticipants = await this.conversationService.getConversationParticipants(data.conversationId);
      for (const participant of conversationParticipants) {
        if (participant.userId !== client.userId && this.connectedUsers.has(participant.userId)) {
          const socketId = this.connectedUsers.get(participant.userId);
          const socket = this.userSockets.get(socketId);
          if (socket) {
            socket.emit('message_delivered', {
              messageId: message.id,
              userId: participant.userId,
              timestamp: new Date(),
            });
          }
        }
      }

      this.logger.log(`Message sent in conversation ${data.conversationId} by user ${client.userId}`);
    } catch (error) {
      this.logger.error('Error sending message:', error);
      client.emit('error', { message: 'Failed to send message' });
    }
  }

  @SubscribeMessage('add_reaction')
  async handleAddReaction(
    @MessageBody() data: AddReactionDto,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      const reaction = await this.messageService.addReaction({
        ...data,
        userId: client.userId,
      });

      const message = await this.messageService.findById(data.messageId);
      
      // Broadcast reaction to conversation participants
      this.server.to(message.conversationId).emit('reaction_added', {
        messageId: data.messageId,
        reaction,
        timestamp: new Date(),
      });
    } catch (error) {
      this.logger.error('Error adding reaction:', error);
      client.emit('error', { message: 'Failed to add reaction' });
    }
  }

  @SubscribeMessage('remove_reaction')
  async handleRemoveReaction(
    @MessageBody() data: { messageId: string; emoji: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      await this.messageService.removeReaction(data.messageId, client.userId, data.emoji);

      const message = await this.messageService.findById(data.messageId);
      
      // Broadcast reaction removal to conversation participants
      this.server.to(message.conversationId).emit('reaction_removed', {
        messageId: data.messageId,
        emoji: data.emoji,
        userId: client.userId,
        timestamp: new Date(),
      });
    } catch (error) {
      this.logger.error('Error removing reaction:', error);
      client.emit('error', { message: 'Failed to remove reaction' });
    }
  }

  @SubscribeMessage('mark_as_read')
  async handleMarkAsRead(
    @MessageBody() data: MarkAsReadDto,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      await this.messageService.markAsRead(data.messageId, client.userId);

      const message = await this.messageService.findById(data.messageId);
      
      // Notify message sender about read receipt
      if (this.connectedUsers.has(message.senderId)) {
        const senderSocketId = this.connectedUsers.get(message.senderId);
        const senderSocket = this.userSockets.get(senderSocketId);
        if (senderSocket) {
          senderSocket.emit('message_read', {
            messageId: data.messageId,
            readBy: client.userId,
            timestamp: new Date(),
          });
        }
      }
    } catch (error) {
      this.logger.error('Error marking message as read:', error);
      client.emit('error', { message: 'Failed to mark message as read' });
    }
  }

  @SubscribeMessage('typing_start')
  async handleTypingStart(
    @MessageBody() data: TypingIndicatorDto,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    client.to(data.conversationId).emit('user_typing', {
      conversationId: data.conversationId,
      userId: client.userId,
      isTyping: true,
      timestamp: new Date(),
    });
  }

  @SubscribeMessage('typing_stop')
  async handleTypingStop(
    @MessageBody() data: TypingIndicatorDto,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    client.to(data.conversationId).emit('user_typing', {
      conversationId: data.conversationId,
      userId: client.userId,
      isTyping: false,
      timestamp: new Date(),
    });
  }

  // Utility method to send message to specific user
  async sendToUser(userId: string, event: string, data: any) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      const socket = this.userSockets.get(socketId);
      if (socket) {
        socket.emit(event, data);
        return true;
      }
    }
    return false;
  }

  // Utility method to broadcast to conversation
  async broadcastToConversation(conversationId: string, event: string, data: any, excludeUserId?: string) {
    const socketIds = this.conversationRooms.get(conversationId);
    if (socketIds) {
      for (const socketId of socketIds) {
        const socket = this.userSockets.get(socketId);
        if (socket && socket.userId !== excludeUserId) {
          socket.emit(event, data);
        }
      }
    }
  }
}
