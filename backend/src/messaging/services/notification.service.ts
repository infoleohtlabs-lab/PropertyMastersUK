import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Message } from '../entities/message.entity';
import { Conversation } from '../entities/conversation.entity';
import { MessagingGateway } from '../gateways/messaging.gateway';

export enum NotificationType {
  NEW_MESSAGE = 'new_message',
  MESSAGE_REACTION = 'message_reaction',
  CONVERSATION_INVITE = 'conversation_invite',
  MENTION = 'mention',
  TYPING_INDICATOR = 'typing_indicator',
  MESSAGE_READ = 'message_read',
  MESSAGE_DELIVERED = 'message_delivered',
}

export interface NotificationPayload {
  type: NotificationType;
  userId: string;
  data: any;
  metadata?: Record<string, any>;
}

export interface MessageNotificationData {
  messageId: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  messageType: string;
  timestamp: Date;
  conversationTitle?: string;
  conversationType: string;
}

export interface ReactionNotificationData {
  messageId: string;
  conversationId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  emoji: string;
  timestamp: Date;
}

export interface ConversationInviteData {
  conversationId: string;
  conversationTitle: string;
  conversationType: string;
  invitedBy: string;
  inviterName: string;
  inviterAvatar?: string;
  timestamp: Date;
}

export interface MentionNotificationData {
  messageId: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  mentionText: string;
  timestamp: Date;
}

export interface TypingIndicatorData {
  conversationId: string;
  userId: string;
  userName: string;
  isTyping: boolean;
}

export interface ReadReceiptData {
  messageId: string;
  conversationId: string;
  userId: string;
  userName: string;
  readAt: Date;
}

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
    private messagingGateway: MessagingGateway,
  ) {}

  async notifyNewMessage(
    message: Message,
    conversation: Conversation,
    sender: User,
  ): Promise<void> {
    const participants = conversation.participants.filter(
      participant => participant.id !== sender.id,
    );

    const notificationData: MessageNotificationData = {
      messageId: message.id,
      conversationId: conversation.id,
      senderId: sender.id,
      senderName: `${sender.firstName} ${sender.lastName}`,
      senderAvatar: sender.avatar,
      content: this.truncateContent(message.content),
      messageType: message.type,
      timestamp: message.createdAt,
      conversationTitle: conversation.title,
      conversationType: conversation.type,
    };

    for (const participant of participants) {
      await this.sendNotification({
        type: NotificationType.NEW_MESSAGE,
        userId: participant.id,
        data: notificationData,
        metadata: {
          priority: message.isImportant ? 'high' : 'normal',
          sound: true,
          badge: true,
        },
      });
    }
  }

  async notifyMessageReaction(
    messageId: string,
    conversationId: string,
    reactor: User,
    emoji: string,
  ): Promise<void> {
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
      relations: ['sender'],
    });

    if (!message || message.sender.id === reactor.id) {
      return; // Don't notify if message not found or user reacted to their own message
    }

    const notificationData: ReactionNotificationData = {
      messageId,
      conversationId,
      userId: reactor.id,
      userName: `${reactor.firstName} ${reactor.lastName}`,
      userAvatar: reactor.avatar,
      emoji,
      timestamp: new Date(),
    };

    await this.sendNotification({
      type: NotificationType.MESSAGE_REACTION,
      userId: message.sender.id,
      data: notificationData,
      metadata: {
        priority: 'low',
        sound: false,
        badge: false,
      },
    });
  }

  async notifyConversationInvite(
    conversationId: string,
    invitedUsers: User[],
    inviter: User,
  ): Promise<void> {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
    });

    if (!conversation) {
      return;
    }

    const notificationData: ConversationInviteData = {
      conversationId,
      conversationTitle: conversation.title || 'New Conversation',
      conversationType: conversation.type,
      invitedBy: inviter.id,
      inviterName: `${inviter.firstName} ${inviter.lastName}`,
      inviterAvatar: inviter.avatar,
      timestamp: new Date(),
    };

    for (const user of invitedUsers) {
      await this.sendNotification({
        type: NotificationType.CONVERSATION_INVITE,
        userId: user.id,
        data: notificationData,
        metadata: {
          priority: 'normal',
          sound: true,
          badge: true,
        },
      });
    }
  }

  async notifyMention(
    message: Message,
    conversation: Conversation,
    sender: User,
    mentionedUsers: User[],
  ): Promise<void> {
    const mentionText = this.extractMentionText(message.content, mentionedUsers);

    const notificationData: MentionNotificationData = {
      messageId: message.id,
      conversationId: conversation.id,
      senderId: sender.id,
      senderName: `${sender.firstName} ${sender.lastName}`,
      senderAvatar: sender.avatar,
      content: this.truncateContent(message.content),
      mentionText,
      timestamp: message.createdAt,
    };

    for (const user of mentionedUsers) {
      if (user.id !== sender.id) {
        await this.sendNotification({
          type: NotificationType.MENTION,
          userId: user.id,
          data: notificationData,
          metadata: {
            priority: 'high',
            sound: true,
            badge: true,
          },
        });
      }
    }
  }

  async notifyTypingIndicator(
    conversationId: string,
    user: User,
    isTyping: boolean,
  ): Promise<void> {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
      relations: ['participants'],
    });

    if (!conversation) {
      return;
    }

    const notificationData: TypingIndicatorData = {
      conversationId,
      userId: user.id,
      userName: `${user.firstName} ${user.lastName}`,
      isTyping,
    };

    const participants = conversation.participants.filter(
      participant => participant.id !== user.id,
    );

    for (const participant of participants) {
      await this.sendNotification({
        type: NotificationType.TYPING_INDICATOR,
        userId: participant.id,
        data: notificationData,
        metadata: {
          priority: 'low',
          sound: false,
          badge: false,
          ephemeral: true, // This notification should not be persisted
        },
      });
    }
  }

  async notifyMessageRead(
    messageId: string,
    conversationId: string,
    reader: User,
  ): Promise<void> {
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
      relations: ['sender'],
    });

    if (!message || message.sender.id === reader.id) {
      return; // Don't notify if message not found or user read their own message
    }

    const notificationData: ReadReceiptData = {
      messageId,
      conversationId,
      userId: reader.id,
      userName: `${reader.firstName} ${reader.lastName}`,
      readAt: new Date(),
    };

    await this.sendNotification({
      type: NotificationType.MESSAGE_READ,
      userId: message.sender.id,
      data: notificationData,
      metadata: {
        priority: 'low',
        sound: false,
        badge: false,
      },
    });
  }

  async notifyMessageDelivered(
    messageId: string,
    conversationId: string,
    recipient: User,
  ): Promise<void> {
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
      relations: ['sender'],
    });

    if (!message || message.sender.id === recipient.id) {
      return;
    }

    const notificationData = {
      messageId,
      conversationId,
      userId: recipient.id,
      userName: `${recipient.firstName} ${recipient.lastName}`,
      deliveredAt: new Date(),
    };

    await this.sendNotification({
      type: NotificationType.MESSAGE_DELIVERED,
      userId: message.sender.id,
      data: notificationData,
      metadata: {
        priority: 'low',
        sound: false,
        badge: false,
      },
    });
  }

  private async sendNotification(payload: NotificationPayload): Promise<void> {
    try {
      // Send real-time notification via WebSocket
      this.messagingGateway.sendToUser(payload.userId, 'notification', payload);

      // Here you could also:
      // 1. Store notification in database for offline users
      // 2. Send push notifications to mobile devices
      // 3. Send email notifications based on user preferences
      // 4. Update unread counters

      console.log(`Notification sent to user ${payload.userId}:`, payload.type);
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  }

  private truncateContent(content: string, maxLength: number = 100): string {
    if (content.length <= maxLength) {
      return content;
    }
    return content.substring(0, maxLength) + '...';
  }

  private extractMentionText(
    content: string,
    mentionedUsers: User[],
  ): string {
    // Extract the specific mention text from the message
    // This is a simple implementation - you might want to make it more sophisticated
    const mentions = mentionedUsers.map(
      user => `@${user.firstName} ${user.lastName}`,
    );
    return mentions.join(', ');
  }

  async getUserNotificationPreferences(userId: string): Promise<{
    email: boolean;
    push: boolean;
    inApp: boolean;
    sound: boolean;
    mentions: boolean;
    reactions: boolean;
  }> {
    // This would typically come from a user preferences table
    // For now, return default preferences
    return {
      email: true,
      push: true,
      inApp: true,
      sound: true,
      mentions: true,
      reactions: false,
    };
  }

  async updateNotificationPreferences(
    userId: string,
    preferences: Partial<{
      email: boolean;
      push: boolean;
      inApp: boolean;
      sound: boolean;
      mentions: boolean;
      reactions: boolean;
    }>,
  ): Promise<void> {
    // Implementation would update user preferences in database
    console.log(`Updated notification preferences for user ${userId}:`, preferences);
  }
}