import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Message, MessageStatus } from '../entities/message.entity';
import { MessageReaction } from '../entities/message-reaction.entity';
import { MessageAttachment } from '../entities/message-attachment.entity';
import { Conversation } from '../entities/conversation.entity';
import { User } from '../../users/entities/user.entity';
import { CreateMessageDto } from '../dto/create-message.dto';
import { UpdateMessageDto } from '../dto/update-message.dto';
import { ConversationService } from './conversation.service';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRepository(MessageReaction)
    private reactionRepository: Repository<MessageReaction>,
    @InjectRepository(MessageAttachment)
    private attachmentRepository: Repository<MessageAttachment>,
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private conversationService: ConversationService,
  ) {}

  async createMessage(createMessageDto: CreateMessageDto & { senderId: string }): Promise<Message> {
    const { conversationId, senderId, attachmentIds, ...messageData } = createMessageDto;

    // Verify user has access to the conversation
    const hasAccess = await this.conversationService.userHasAccess(conversationId, senderId);
    if (!hasAccess) {
      throw new ForbiddenException('Access denied to this conversation');
    }

    // Create the message
    const message = this.messageRepository.create({
      ...messageData,
      conversationId,
      senderId,
      status: MessageStatus.SENT,
    });

    const savedMessage = await this.messageRepository.save(message);

    // Handle attachments if provided
    if (attachmentIds && attachmentIds.length > 0) {
      await this.attachmentRepository.update(
        { id: In(attachmentIds) },
        { messageId: savedMessage.id },
      );
    }

    // Update conversation's last message and activity
    await this.conversationRepository.update(conversationId, {
      lastMessageId: savedMessage.id,
      lastActivityAt: new Date(),
    });

    // Return message with relations
    return this.findById(savedMessage.id);
  }

  async findById(id: string): Promise<Message> {
    const message = await this.messageRepository.findOne({
      where: { id, isDeleted: false },
      relations: [
        'sender',
        'conversation',
        'attachments',
        'reactions',
        'reactions.user',
        'replyTo',
        'forwardedFrom',
      ],
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    return message;
  }

  async findConversationMessages(
    conversationId: string,
    userId: string,
    page = 1,
    limit = 50,
  ): Promise<{ messages: Message[]; total: number }> {
    // Verify user has access to the conversation
    const hasAccess = await this.conversationService.userHasAccess(conversationId, userId);
    if (!hasAccess) {
      throw new ForbiddenException('Access denied to this conversation');
    }

    const [messages, total] = await this.messageRepository.findAndCount({
      where: {
        conversationId,
        isDeleted: false,
      },
      relations: [
        'sender',
        'attachments',
        'reactions',
        'reactions.user',
        'replyTo',
        'forwardedFrom',
      ],
      order: {
        createdAt: 'DESC',
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { messages: messages.reverse(), total };
  }

  async updateMessage(id: string, updateMessageDto: UpdateMessageDto, userId: string): Promise<Message> {
    const message = await this.findById(id);

    // Only sender can edit their own messages
    if (message.senderId !== userId) {
      throw new ForbiddenException('You can only edit your own messages');
    }

    // Update message
    Object.assign(message, updateMessageDto, {
      isEdited: true,
      editedAt: new Date(),
    });

    return this.messageRepository.save(message);
  }

  async deleteMessage(id: string, userId: string): Promise<void> {
    const message = await this.findById(id);

    // Only sender can delete their own messages
    if (message.senderId !== userId) {
      throw new ForbiddenException('You can only delete your own messages');
    }

    // Soft delete
    message.isDeleted = true;
    message.deletedAt = new Date();
    await this.messageRepository.save(message);
  }

  async addReaction(data: { messageId: string; userId: string; emoji: string }): Promise<MessageReaction> {
    const { messageId, userId, emoji } = data;

    const message = await this.findById(messageId);

    // Verify user has access to the conversation
    const hasAccess = await this.conversationService.userHasAccess(message.conversationId, userId);
    if (!hasAccess) {
      throw new ForbiddenException('Access denied to this conversation');
    }

    // Check if reaction already exists
    const existingReaction = await this.reactionRepository.findOne({
      where: { messageId, userId, emoji },
    });

    if (existingReaction) {
      throw new BadRequestException('Reaction already exists');
    }

    // Create reaction
    const reaction = this.reactionRepository.create({
      messageId,
      userId,
      emoji,
    });

    return this.reactionRepository.save(reaction);
  }

  async removeReaction(messageId: string, userId: string, emoji: string): Promise<void> {
    const message = await this.findById(messageId);

    // Verify user has access to the conversation
    const hasAccess = await this.conversationService.userHasAccess(message.conversationId, userId);
    if (!hasAccess) {
      throw new ForbiddenException('Access denied to this conversation');
    }

    const reaction = await this.reactionRepository.findOne({
      where: { messageId, userId, emoji },
    });

    if (!reaction) {
      throw new NotFoundException('Reaction not found');
    }

    await this.reactionRepository.remove(reaction);
  }

  async markAsRead(messageId: string, userId: string): Promise<void> {
    const message = await this.findById(messageId);

    // Verify user has access to the conversation
    const hasAccess = await this.conversationService.userHasAccess(message.conversationId, userId);
    if (!hasAccess) {
      throw new ForbiddenException('Access denied to this conversation');
    }

    // Don't mark own messages as read
    if (message.senderId === userId) {
      return;
    }

    // Check if already marked as read
    const readBy = message.readBy || [];
    const alreadyRead = readBy.some((read: any) => read.userId === userId);

    if (!alreadyRead) {
      readBy.push({ userId, readAt: new Date() });
      message.readBy = readBy;
      await this.messageRepository.save(message);
    }
  }

  async markAsDelivered(messageId: string, userId: string): Promise<void> {
    const message = await this.findById(messageId);

    // Don't mark own messages as delivered
    if (message.senderId === userId) {
      return;
    }

    // Check if already marked as delivered
    const deliveredTo = message.deliveredTo || [];
    const alreadyDelivered = deliveredTo.some((delivery: any) => delivery.userId === userId);

    if (!alreadyDelivered) {
      deliveredTo.push({ userId, deliveredAt: new Date() });
      message.deliveredTo = deliveredTo;
      await this.messageRepository.save(message);
    }
  }

  async markConversationAsRead(conversationId: string, userId: string): Promise<void> {
    // Verify user has access to the conversation
    const hasAccess = await this.conversationService.userHasAccess(conversationId, userId);
    if (!hasAccess) {
      throw new ForbiddenException('Access denied to this conversation');
    }

    // Get all unread messages in the conversation
    const messages = await this.messageRepository.find({
      where: {
        conversationId,
        isDeleted: false,
      },
    });

    // Mark all messages as read
    for (const message of messages) {
      if (message.senderId !== userId) {
        const readBy = message.readBy || [];
        const alreadyRead = readBy.some((read: any) => read.userId === userId);
        
        if (!alreadyRead) {
          readBy.push({ userId, readAt: new Date() });
          message.readBy = readBy;
        }
      }
    }

    await this.messageRepository.save(messages);
  }

  async getUnreadCount(conversationId: string, userId: string): Promise<number> {
    // Verify user has access to the conversation
    const hasAccess = await this.conversationService.userHasAccess(conversationId, userId);
    if (!hasAccess) {
      return 0;
    }

    const messages = await this.messageRepository.find({
      where: {
        conversationId,
        isDeleted: false,
      },
      select: ['id', 'senderId', 'readBy'],
    });

    return messages.filter(message => {
      if (message.senderId === userId) return false;
      const readBy = message.readBy || [];
      return !readBy.some((read: any) => read.userId === userId);
    }).length;
  }

  async searchMessages(
    conversationId: string,
    userId: string,
    query: string,
    page = 1,
    limit = 20,
  ): Promise<{ messages: Message[]; total: number }> {
    // Verify user has access to the conversation
    const hasAccess = await this.conversationService.userHasAccess(conversationId, userId);
    if (!hasAccess) {
      throw new ForbiddenException('Access denied to this conversation');
    }

    const [messages, total] = await this.messageRepository.findAndCount({
      where: {
        conversationId,
        isDeleted: false,
      },
      relations: ['sender', 'attachments'],
      order: {
        createdAt: 'DESC',
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Filter messages by content (simple text search)
    const filteredMessages = messages.filter(message =>
      message.content.toLowerCase().includes(query.toLowerCase()),
    );

    return { messages: filteredMessages, total: filteredMessages.length };
  }

  async forwardMessage(
    messageId: string,
    targetConversationId: string,
    userId: string,
  ): Promise<Message> {
    const originalMessage = await this.findById(messageId);

    // Verify user has access to both conversations
    const hasAccessToSource = await this.conversationService.userHasAccess(
      originalMessage.conversationId,
      userId,
    );
    const hasAccessToTarget = await this.conversationService.userHasAccess(
      targetConversationId,
      userId,
    );

    if (!hasAccessToSource || !hasAccessToTarget) {
      throw new ForbiddenException('Access denied to one or both conversations');
    }

    // Create forwarded message
    const forwardedMessage = this.messageRepository.create({
      conversationId: targetConversationId,
      senderId: userId,
      type: originalMessage.type,
      content: originalMessage.content,
      forwardedFromId: originalMessage.id,
      metadata: originalMessage.metadata,
      status: MessageStatus.SENT,
    });

    const savedMessage = await this.messageRepository.save(forwardedMessage);

    // Update target conversation's last message and activity
    await this.conversationRepository.update(targetConversationId, {
      lastMessageId: savedMessage.id,
      lastActivityAt: new Date(),
    });

    return this.findById(savedMessage.id);
  }

  async getMessageReactions(messageId: string): Promise<MessageReaction[]> {
    return this.reactionRepository.find({
      where: { messageId },
      relations: ['user'],
      order: { createdAt: 'ASC' },
    });
  }

  async getMessageAttachments(messageId: string): Promise<MessageAttachment[]> {
    return this.attachmentRepository.find({
      where: { messageId },
      order: { createdAt: 'ASC' },
    });
  }
}