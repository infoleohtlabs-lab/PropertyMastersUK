import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Conversation, ConversationType } from '../entities/conversation.entity';
import { User } from '../../users/entities/user.entity';
import { Property } from '../../properties/entities/property.entity';
import { CreateConversationDto } from '../dto/create-conversation.dto';
import { UpdateConversationDto } from '../dto/update-conversation.dto';
import { AddParticipantDto } from '../dto/add-participant.dto';

@Injectable()
export class ConversationService {
  constructor(
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Property)
    private propertyRepository: Repository<Property>,
  ) {}

  async create(createConversationDto: CreateConversationDto, createdBy: string): Promise<Conversation> {
    const { participantIds, propertyId, ...conversationData } = createConversationDto;

    // Validate participants exist
    const participants = await this.userRepository.findBy({
      id: In([...participantIds, createdBy]),
    });

    if (participants.length !== participantIds.length + 1) {
      throw new BadRequestException('One or more participants not found');
    }

    // Validate property if provided
    let property = null;
    if (propertyId) {
      property = await this.propertyRepository.findOne({ where: { id: propertyId } });
      if (!property) {
        throw new NotFoundException('Property not found');
      }
    }

    // For direct conversations, check if one already exists
    if (conversationData.type === ConversationType.DIRECT && participantIds.length === 1) {
      const existingConversation = await this.findDirectConversation(createdBy, participantIds[0]);
      if (existingConversation) {
        return existingConversation;
      }
    }

    const conversation = this.conversationRepository.create({
      ...conversationData,
      createdBy,
      propertyId,
      participants: participants,
      lastActivityAt: new Date(),
    });

    return this.conversationRepository.save(conversation);
  }

  async findAll(userId: string, page = 1, limit = 20): Promise<{ conversations: Conversation[]; total: number }> {
    const [conversations, total] = await this.conversationRepository.findAndCount({
      where: {
        participants: {
          userId,
        } as any,
        isArchived: false,
      },
      relations: ['property', 'lastMessage', 'lastMessage.sender'],
      order: {
        lastActivityAt: 'DESC',
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { conversations, total };
  }

  async findById(id: string, userId: string): Promise<Conversation> {
    const conversation = await this.conversationRepository.findOne({
      where: { id },
      relations: ['property', 'messages', 'messages.sender', 'messages.attachments', 'messages.reactions'],
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    // Check if user is a participant
    const isParticipant = conversation.participants.some(
      (p: User) => p.id === userId,
    );

    if (!isParticipant) {
      throw new ForbiddenException('Access denied to this conversation');
    }

    return conversation;
  }

  async update(id: string, updateConversationDto: UpdateConversationDto, userId: string): Promise<Conversation> {
    const conversation = await this.findById(id, userId);

    // Check if user has permission to update (creator or admin)
    if (conversation.createdBy !== userId) {
      throw new ForbiddenException('Only the conversation creator can update it');
    }

    Object.assign(conversation, updateConversationDto);
    return this.conversationRepository.save(conversation);
  }

  async delete(id: string, userId: string): Promise<void> {
    const conversation = await this.findById(id, userId);

    // Check if user has permission to delete (creator only)
    if (conversation.createdBy !== userId) {
      throw new ForbiddenException('Only the conversation creator can delete it');
    }

    await this.conversationRepository.remove(conversation);
  }

  async addParticipant(conversationId: string, addParticipantDto: AddParticipantDto, requesterId: string): Promise<Conversation> {
    const conversation = await this.findById(conversationId, requesterId);
    const { userId } = addParticipantDto;

    // Check if user is already a participant
    const isAlreadyParticipant = conversation.participants.some(
      (p: User) => p.id === userId,
    );

    if (isAlreadyParticipant) {
      throw new BadRequestException('User is already a participant');
    }

    // Validate the user exists
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Add participant
    conversation.participants.push(user);
    conversation.lastActivityAt = new Date();

    return this.conversationRepository.save(conversation);
  }

  async removeParticipant(conversationId: string, userId: string, requesterId: string): Promise<Conversation> {
    const conversation = await this.findById(conversationId, requesterId);

    // Check if requester has permission (creator or removing themselves)
    if (conversation.createdBy !== requesterId && userId !== requesterId) {
      throw new ForbiddenException('Permission denied');
    }

    // Remove participant
    conversation.participants = conversation.participants.filter(
      (p: User) => p.id !== userId,
    );
    conversation.lastActivityAt = new Date();

    return this.conversationRepository.save(conversation);
  }

  async archiveConversation(id: string, userId: string): Promise<Conversation> {
    const conversation = await this.findById(id, userId);
    conversation.isArchived = true;
    return this.conversationRepository.save(conversation);
  }

  async unarchiveConversation(id: string, userId: string): Promise<Conversation> {
    const conversation = await this.conversationRepository.findOne({
      where: { id, isArchived: true },
    });

    if (!conversation) {
      throw new NotFoundException('Archived conversation not found');
    }

    // Check if user is a participant
    const isParticipant = conversation.participants.some(
      (p: User) => p.id === userId,
    );

    if (!isParticipant) {
      throw new ForbiddenException('Access denied to this conversation');
    }

    conversation.isArchived = false;
    return this.conversationRepository.save(conversation);
  }

  async muteConversation(id: string, userId: string): Promise<void> {
    const conversation = await this.findById(id, userId);
    
    // Update participant's mute status
    const participant = conversation.participants.find((p: User) => p.id === userId);
    if (participant) {
      (participant as any).isMuted = true;
      await this.conversationRepository.save(conversation);
    }
  }

  async unmuteConversation(id: string, userId: string): Promise<void> {
    const conversation = await this.findById(id, userId);
    
    // Update participant's mute status
    const participant = conversation.participants.find((p: User) => p.id === userId);
    if (participant) {
      (participant as any).isMuted = false;
      await this.conversationRepository.save(conversation);
    }
  }

  async pinConversation(id: string, userId: string): Promise<Conversation> {
    const conversation = await this.findById(id, userId);
    conversation.isPinned = true;
    return this.conversationRepository.save(conversation);
  }

  async unpinConversation(id: string, userId: string): Promise<Conversation> {
    const conversation = await this.findById(id, userId);
    conversation.isPinned = false;
    return this.conversationRepository.save(conversation);
  }

  async getUserConversations(userId: string): Promise<Conversation[]> {
    return this.conversationRepository.find({
      where: {
        participants: {
          userId,
        } as any,
        isArchived: false,
      },
      relations: ['property'],
      order: {
        isPinned: 'DESC',
        lastActivityAt: 'DESC',
      },
    });
  }

  async getConversationParticipants(conversationId: string): Promise<any[]> {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
      select: ['participants'],
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    return conversation.participants;
  }

  async userHasAccess(conversationId: string, userId: string): Promise<boolean> {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
      select: ['participants'],
    });

    if (!conversation) {
      return false;
    }

    return conversation.participants.some((p: User) => p.id === userId);
  }

  async getParticipants(conversationId: string, userId: string): Promise<User[]> {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
      relations: ['participants'],
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    // Check if user has access to this conversation
    if (!conversation.participants.some((p: User) => p.id === userId)) {
      throw new ForbiddenException('Access denied to conversation');
    }

    return conversation.participants;
  }

  async getOrCreateDirectConversation(userId1: string, userId2: string): Promise<Conversation> {
    // Try to find existing direct conversation
    const existingConversation = await this.findDirectConversation(userId1, userId2);
    
    if (existingConversation) {
      return existingConversation;
    }

    // Create new direct conversation
    const user1 = await this.userRepository.findOne({ where: { id: userId1 } });
    const user2 = await this.userRepository.findOne({ where: { id: userId2 } });

    if (!user1 || !user2) {
      throw new NotFoundException('One or both users not found');
    }

    const conversation = this.conversationRepository.create({
      type: ConversationType.DIRECT,
      createdBy: userId1,
      participants: [user1, user2],
    });

    return this.conversationRepository.save(conversation);
  }

  async updateLastActivity(conversationId: string): Promise<void> {
    await this.conversationRepository.update(conversationId, {
      lastActivityAt: new Date(),
    });
  }

  async findDirectConversation(user1Id: string, user2Id: string): Promise<Conversation | null> {
    const conversation = await this.conversationRepository
      .createQueryBuilder('conversation')
      .where('conversation.type = :type', { type: ConversationType.DIRECT })
      .andWhere(
        `JSON_CONTAINS(conversation.participants, JSON_OBJECT('userId', :user1Id)) AND 
         JSON_CONTAINS(conversation.participants, JSON_OBJECT('userId', :user2Id))`,
        { user1Id, user2Id },
      )
      .getOne();

    return conversation;
  }

  async searchConversations(userId: string, query: string): Promise<Conversation[]> {
    return this.conversationRepository
      .createQueryBuilder('conversation')
      .where(
        `JSON_CONTAINS(conversation.participants, JSON_OBJECT('userId', :userId))`,
        { userId },
      )
      .andWhere(
        '(conversation.title LIKE :query OR conversation.description LIKE :query)',
        { query: `%${query}%` },
      )
      .andWhere('conversation.isArchived = false')
      .orderBy('conversation.lastActivityAt', 'DESC')
      .getMany();
  }
}