import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Not, IsNull } from 'typeorm';
import { Message, MessageType, MessageStatus, MessagePriority } from '../entities/message.entity';
import { Conversation, ConversationStatus } from '../entities/conversation.entity';
import { ConversationType } from '../entities/message.entity';
import { ConversationPrivacy } from '../entities/conversation.entity';
import { Notification, NotificationType, NotificationPriority, NotificationStatus, NotificationChannel } from '../entities/notification.entity';
import { User } from '../../users/entities/user.entity';

export interface CreateMessageDto {
  conversationId?: string;
  recipientId: string;
  type?: MessageType;
  priority?: MessagePriority;
  subject?: string;
  content: string;
  metadata?: Record<string, any>;
  propertyId?: string;
  parentMessageId?: string;
  scheduledAt?: Date;
}

export interface CreateConversationDto {
  title: string;
  description?: string;
  type?: ConversationType;
  privacy?: ConversationPrivacy;
  participantIds: string[];
  adminIds?: string[];
  propertyId?: string;
  maintenanceRequestId?: string;
  bookingId?: string;
  maxParticipants?: number;
  allowParticipantInvites?: boolean;
  allowParticipantLeave?: boolean;
  requireApprovalForNewParticipants?: boolean;
  allowFileSharing?: boolean;
  allowImageSharing?: boolean;
  allowVoiceMessages?: boolean;
  messageRetentionDays?: number;
  autoDeleteMessages?: boolean;
  sendEmailNotifications?: boolean;
  sendSmsNotifications?: boolean;
  sendPushNotifications?: boolean;
  avatarUrl?: string;
  color?: string;
  emoji?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface UpdateConversationDto {
  title?: string;
  description?: string;
  status?: ConversationStatus;
  privacy?: ConversationPrivacy;
  maxParticipants?: number;
  allowParticipantInvites?: boolean;
  allowParticipantLeave?: boolean;
  requireApprovalForNewParticipants?: boolean;
  allowFileSharing?: boolean;
  allowImageSharing?: boolean;
  allowVoiceMessages?: boolean;
  messageRetentionDays?: number;
  autoDeleteMessages?: boolean;
  sendEmailNotifications?: boolean;
  sendSmsNotifications?: boolean;
  sendPushNotifications?: boolean;
  avatarUrl?: string;
  color?: string;
  emoji?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface UpdateMessageDto {
  content?: string;
  subject?: string;
  priority?: MessagePriority;
  status?: MessageStatus;
  scheduledAt?: Date;
  expiresAt?: Date;
  requiresResponse?: boolean;
  isUrgent?: boolean;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface CommunicationDashboardStats {
  totalMessages: number;
  unreadMessages: number;
  totalConversations: number;
  activeConversations: number;
  messagesByType: Record<string, number>;
  messagesByStatus: Record<string, number>;
  messagesByPriority: Record<string, number>;
  conversationsByType: Record<string, number>;
  conversationsByStatus: Record<string, number>;
  recentActivity: Record<string, any>;
  topSenders: any[];
  responseTimeStats: Record<string, any>;
}

export interface CreateNotificationDto {
  type: NotificationType;
  priority?: NotificationPriority;
  channels?: NotificationChannel[];
  userId: string;
  title: string;
  message: string;
  description?: string;
  iconUrl?: string;
  actionUrl?: string;
  actionText?: string;
  entityType?: string;
  entityId?: string;
  propertyId?: string;
  metadata?: Record<string, any>;
  scheduledAt?: Date;
  expiresAt?: Date;
}

export interface MessageFilters {
  conversationId?: string;
  senderId?: string;
  recipientId?: string;
  type?: MessageType;
  status?: MessageStatus;
  priority?: MessagePriority;
  propertyId?: string;
  isArchived?: boolean;
  isDeleted?: boolean;
  fromDate?: Date;
  toDate?: Date;
}

export interface ConversationFilters {
  type?: ConversationType;
  status?: ConversationStatus;
  createdById?: string;
  participantId?: string;
  propertyId?: string;
  isPinned?: boolean;
  isPrivate?: boolean;
  fromDate?: Date;
  toDate?: Date;
}

export interface NotificationFilters {
  type?: NotificationType;
  priority?: NotificationPriority;
  status?: NotificationStatus;
  userId?: string;
  entityType?: string;
  entityId?: string;
  propertyId?: string;
  isRead?: boolean;
  isDismissed?: boolean;
  fromDate?: Date;
  toDate?: Date;
}

@Injectable()
export class CommunicationService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // Message Management
  async createMessage(
    tenantOrganizationId: string,
    senderId: string,
    createMessageDto: CreateMessageDto,
  ): Promise<Message> {
    const { conversationId, recipientId, ...messageData } = createMessageDto;

    // Verify sender and recipient exist
    const [sender, recipient] = await Promise.all([
      this.userRepository.findOne({ where: { id: senderId, tenantOrganizationId } }),
      this.userRepository.findOne({ where: { id: recipientId, tenantOrganizationId } }),
    ]);

    if (!sender || !recipient) {
      throw new NotFoundException('Sender or recipient not found');
    }

    let conversation: Conversation;

    if (conversationId) {
      conversation = await this.conversationRepository.findOne({
        where: { id: conversationId, tenantOrganizationId },
        relations: ['participants'],
      });

      if (!conversation) {
        throw new NotFoundException('Conversation not found');
      }

      // Verify sender is a participant
      const isParticipant = conversation.participants.some(p => p.id === senderId);
      if (!isParticipant) {
        throw new BadRequestException('Sender is not a participant in this conversation');
      }
    } else {
      // Create or find direct conversation
      conversation = await this.findOrCreateDirectConversation(
        tenantOrganizationId,
        senderId,
        recipientId,
      );
    }

    const message = this.messageRepository.create({
      ...messageData,
      tenantOrganizationId,
      conversationId: conversation.id,
      senderId,
      recipientId,
      type: messageData.type || MessageType.TEXT,
      priority: messageData.priority || MessagePriority.NORMAL,
      status: MessageStatus.SENT,
    });

    const savedMessage = await this.messageRepository.save(message);

    // Update conversation
    await this.updateConversationLastMessage(conversation.id, savedMessage.id);

    return this.messageRepository.findOne({
      where: { id: savedMessage.id },
      relations: ['sender', 'recipient', 'property'],
    });
  }

  async getMessages(
    tenantOrganizationId: string,
    userId: string,
    filters: MessageFilters = {},
    page = 1,
    limit = 50,
  ): Promise<{ messages: Message[]; total: number }> {
    const queryBuilder = this.messageRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.sender', 'sender')
      .leftJoinAndSelect('message.recipient', 'recipient')
      .leftJoinAndSelect('message.property', 'property')
      .where('message.tenantOrganizationId = :tenantOrganizationId', { tenantOrganizationId })
      .andWhere('(message.senderId = :userId OR message.recipientId = :userId)', { userId });

    if (filters.conversationId) {
      queryBuilder.andWhere('message.conversationId = :conversationId', {
        conversationId: filters.conversationId,
      });
    }

    if (filters.type) {
      queryBuilder.andWhere('message.type = :type', { type: filters.type });
    }

    if (filters.status) {
      queryBuilder.andWhere('message.status = :status', { status: filters.status });
    }

    if (filters.priority) {
      queryBuilder.andWhere('message.priority = :priority', { priority: filters.priority });
    }

    if (filters.propertyId) {
      queryBuilder.andWhere('message.propertyId = :propertyId', {
        propertyId: filters.propertyId,
      });
    }

    if (filters.isArchived !== undefined) {
      queryBuilder.andWhere('message.isArchived = :isArchived', {
        isArchived: filters.isArchived,
      });
    }

    if (filters.isDeleted !== undefined) {
      queryBuilder.andWhere('message.isDeleted = :isDeleted', {
        isDeleted: filters.isDeleted,
      });
    }

    if (filters.fromDate) {
      queryBuilder.andWhere('message.createdAt >= :fromDate', { fromDate: filters.fromDate });
    }

    if (filters.toDate) {
      queryBuilder.andWhere('message.createdAt <= :toDate', { toDate: filters.toDate });
    }

    queryBuilder
      .orderBy('message.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [messages, total] = await queryBuilder.getManyAndCount();

    return { messages, total };
  }

  async markMessageAsRead(messageId: string, userId: string): Promise<Message> {
    const message = await this.messageRepository.findOne({
      where: { id: messageId, recipientId: userId },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    message.status = MessageStatus.READ;
    message.readAt = new Date();

    return this.messageRepository.save(message);
  }

  // Conversation Management
  async createConversation(
    tenantOrganizationId: string,
    createdById: string,
    createConversationDto: CreateConversationDto,
  ): Promise<Conversation> {
    const { participantIds, ...conversationData } = createConversationDto;

    // Verify all participants exist
    const participants = await this.userRepository.find({
      where: { id: In(participantIds), tenantOrganizationId },
    });

    if (participants.length !== participantIds.length) {
      throw new BadRequestException('Some participants not found');
    }

    // Ensure creator is included in participants
    if (!participantIds.includes(createdById)) {
      participantIds.push(createdById);
    }

    const conversation = this.conversationRepository.create({
      ...conversationData,
      tenantOrganizationId,
      createdById,
      type: conversationData.type || ConversationType.DIRECT,
      status: ConversationStatus.ACTIVE,
      participants,
    });

    return this.conversationRepository.save(conversation);
  }

  async getConversations(
    tenantOrganizationId: string,
    userId: string,
    filters: ConversationFilters = {},
    page = 1,
    limit = 20,
  ): Promise<{ conversations: Conversation[]; total: number }> {
    const queryBuilder = this.conversationRepository
      .createQueryBuilder('conversation')
      .leftJoinAndSelect('conversation.participants', 'participants')
      .leftJoinAndSelect('conversation.lastMessage', 'lastMessage')
      .leftJoinAndSelect('conversation.property', 'property')
      .leftJoinAndSelect('conversation.createdBy', 'createdBy')
      .where('conversation.tenantOrganizationId = :tenantOrganizationId', { tenantOrganizationId })
      .andWhere('participants.id = :userId', { userId });

    if (filters.type) {
      queryBuilder.andWhere('conversation.type = :type', { type: filters.type });
    }

    if (filters.status) {
      queryBuilder.andWhere('conversation.status = :status', { status: filters.status });
    }

    if (filters.propertyId) {
      queryBuilder.andWhere('conversation.propertyId = :propertyId', {
        propertyId: filters.propertyId,
      });
    }

    if (filters.isPinned !== undefined) {
      queryBuilder.andWhere('conversation.isPinned = :isPinned', {
        isPinned: filters.isPinned,
      });
    }

    if (filters.isPrivate !== undefined) {
      queryBuilder.andWhere('conversation.isPrivate = :isPrivate', {
        isPrivate: filters.isPrivate,
      });
    }

    queryBuilder
      .orderBy('conversation.lastActivityAt', 'DESC')
      .addOrderBy('conversation.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [conversations, total] = await queryBuilder.getManyAndCount();

    return { conversations, total };
  }

  // Notification Management
  async createNotification(
    tenantOrganizationId: string,
    createNotificationDto: CreateNotificationDto,
  ): Promise<Notification> {
    const notification = this.notificationRepository.create({
      ...createNotificationDto,
      tenantOrganizationId,
      priority: createNotificationDto.priority || NotificationPriority.NORMAL,
      channels: createNotificationDto.channels || [NotificationChannel.IN_APP],
      status: NotificationStatus.PENDING,
    });

    return this.notificationRepository.save(notification);
  }

  async getNotifications(
    tenantOrganizationId: string,
    userId: string,
    filters: NotificationFilters = {},
    page = 1,
    limit = 50,
  ): Promise<{ notifications: Notification[]; total: number }> {
    const queryBuilder = this.notificationRepository
      .createQueryBuilder('notification')
      .leftJoinAndSelect('notification.user', 'user')
      .leftJoinAndSelect('notification.property', 'property')
      .where('notification.tenantOrganizationId = :tenantOrganizationId', { tenantOrganizationId })
      .andWhere('notification.userId = :userId', { userId });

    if (filters.type) {
      queryBuilder.andWhere('notification.type = :type', { type: filters.type });
    }

    if (filters.status) {
      queryBuilder.andWhere('notification.status = :status', { status: filters.status });
    }

    if (filters.priority) {
      queryBuilder.andWhere('notification.priority = :priority', { priority: filters.priority });
    }

    if (filters.isRead !== undefined) {
      if (filters.isRead) {
        queryBuilder.andWhere('notification.readAt IS NOT NULL');
      } else {
        queryBuilder.andWhere('notification.readAt IS NULL');
      }
    }

    if (filters.isDismissed !== undefined) {
      if (filters.isDismissed) {
        queryBuilder.andWhere('notification.dismissedAt IS NOT NULL');
      } else {
        queryBuilder.andWhere('notification.dismissedAt IS NULL');
      }
    }

    queryBuilder
      .orderBy('notification.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [notifications, total] = await queryBuilder.getManyAndCount();

    return { notifications, total };
  }

  async markNotificationAsRead(notificationId: string, userId: string): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    notification.status = NotificationStatus.READ;
    notification.readAt = new Date();

    return this.notificationRepository.save(notification);
  }

  async dismissNotification(notificationId: string, userId: string): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    notification.status = NotificationStatus.DISMISSED;
    notification.dismissedAt = new Date();

    return this.notificationRepository.save(notification);
  }

  // Helper Methods
  private async findOrCreateDirectConversation(
    tenantOrganizationId: string,
    user1Id: string,
    user2Id: string,
  ): Promise<Conversation> {
    // Try to find existing direct conversation
    const existingConversation = await this.conversationRepository
      .createQueryBuilder('conversation')
      .leftJoinAndSelect('conversation.participants', 'participants')
      .where('conversation.tenantOrganizationId = :tenantOrganizationId', { tenantOrganizationId })
      .andWhere('conversation.type = :type', { type: ConversationType.DIRECT })
      .andWhere('participants.id IN (:...userIds)', { userIds: [user1Id, user2Id] })
      .groupBy('conversation.id')
      .having('COUNT(participants.id) = 2')
      .getOne();

    if (existingConversation) {
      return existingConversation;
    }

    // Create new direct conversation
    const participants = await this.userRepository.find({
      where: { id: In([user1Id, user2Id]), tenantOrganizationId },
    });

    const conversation = this.conversationRepository.create({
      tenantOrganizationId,
      type: ConversationType.DIRECT,
      status: ConversationStatus.ACTIVE,
      createdById: user1Id,
      participants,
    });

    return this.conversationRepository.save(conversation);
  }

  private async updateConversationLastMessage(
    conversationId: string,
    messageId: string,
  ): Promise<void> {
    await this.conversationRepository.update(conversationId, {
      lastActivityAt: new Date(),
    });

    // Increment message count
    await this.conversationRepository.increment(
      { id: conversationId },
      'messageCount',
      1,
    );
  }

  async getUnreadMessageCount(
    tenantOrganizationId: string,
    userId: string,
  ): Promise<number> {
    return this.messageRepository.count({
      where: {
        tenantOrganizationId,
        recipientId: userId,
        status: Not(MessageStatus.READ),
        isDeleted: false,
      },
    });
  }

  async getUnreadNotificationCount(
    tenantOrganizationId: string,
    userId: string,
  ): Promise<number> {
    return this.notificationRepository.count({
      where: {
        tenantOrganizationId,
        userId,
        readAt: IsNull(),
        dismissedAt: IsNull(),
      },
    });
  }

  async getConversationById(
    conversationId: string,
    tenantOrganizationId: string,
  ): Promise<Conversation> {
    return this.conversationRepository.findOne({
      where: { id: conversationId, tenantOrganizationId },
      relations: ['participants', 'createdBy', 'messages'],
    });
  }

  async updateConversation(
    conversationId: string,
    tenantOrganizationId: string,
    userId: string,
    updateData: any,
  ): Promise<Conversation> {
    await this.conversationRepository.update(
      { id: conversationId, tenantOrganizationId },
      updateData,
    );
    return this.conversationRepository.findOne({
      where: { id: conversationId },
      relations: ['participants', 'createdBy'],
    });
  }

  async deleteConversation(
    conversationId: string,
    tenantOrganizationId: string,
    userId: string,
  ): Promise<void> {
    await this.conversationRepository.delete({
      id: conversationId,
      tenantOrganizationId,
    });
  }

  async getCommunicationDashboardStats(
    tenantOrganizationId: string,
    userId: string,
  ): Promise<any> {
    const totalConversations = await this.conversationRepository.count({
      where: { tenantOrganizationId },
    });

    const totalMessages = await this.messageRepository.count({
      where: { tenantOrganizationId },
    });

    const totalNotifications = await this.notificationRepository.count({
      where: { tenantOrganizationId },
    });

    return {
      totalConversations,
      totalMessages,
      totalNotifications,
    };
  }

  async getMessageById(
    tenantOrganizationId: string,
    messageId: string,
    userId: string,
  ): Promise<Message> {
    return await this.messageRepository.findOne({
      where: { id: messageId, tenantOrganizationId },
      relations: ['sender', 'conversation', 'parentMessage'],
    });
  }

  async updateMessage(
    messageId: string,
    updateMessageDto: UpdateMessageDto,
    tenantOrganizationId: string,
    userId: string,
  ): Promise<Message> {
    await this.messageRepository.update(
      { id: messageId, tenantOrganizationId },
      updateMessageDto,
    );
    return await this.getMessageById(tenantOrganizationId, messageId, userId);
  }

  async deleteMessage(
    messageId: string,
    tenantOrganizationId: string,
    userId: string,
  ): Promise<void> {
    await this.messageRepository.delete({
      id: messageId,
      tenantOrganizationId,
    });
  }
}
