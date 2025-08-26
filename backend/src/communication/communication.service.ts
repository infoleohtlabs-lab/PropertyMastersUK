import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Communication } from './entities/communication.entity';
import { CreateCommunicationDto } from './dto/create-communication.dto';
import { UpdateCommunicationDto } from './dto/update-communication.dto';

@Injectable()
export class CommunicationService {
  constructor(
    @InjectRepository(Communication)
    private communicationRepository: Repository<Communication>,
  ) {}

  async create(createCommunicationDto: CreateCommunicationDto): Promise<Communication> {
    const communication = this.communicationRepository.create({
      ...createCommunicationDto,
      sentAt: new Date(),
    });
    return this.communicationRepository.save(communication);
  }

  async findAll(): Promise<Communication[]> {
    return this.communicationRepository.find({
      relations: ['sender', 'recipient', 'property'],
      order: { sentAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Communication> {
    const communication = await this.communicationRepository.findOne({
      where: { id },
      relations: ['sender', 'recipient', 'property'],
    });
    if (!communication) {
      throw new NotFoundException(`Communication with ID ${id} not found`);
    }
    return communication;
  }

  async findByUser(userId: string): Promise<Communication[]> {
    return this.communicationRepository.find({
      where: [
        { senderId: userId },
        { recipientId: userId },
      ],
      relations: ['sender', 'recipient', 'property'],
      order: { sentAt: 'DESC' },
    });
  }

  async findByProperty(propertyId: string): Promise<Communication[]> {
    return this.communicationRepository.find({
      where: { propertyId },
      relations: ['sender', 'recipient', 'property'],
      order: { sentAt: 'DESC' },
    });
  }

  async findUnread(userId: string): Promise<Communication[]> {
    return this.communicationRepository.find({
      where: {
        recipientId: userId,
        readAt: null,
      },
      relations: ['sender', 'recipient', 'property'],
      order: { sentAt: 'DESC' },
    });
  }

  async markAsRead(id: string): Promise<Communication> {
    const communication = await this.findOne(id);
    communication.readAt = new Date();
    return this.communicationRepository.save(communication);
  }

  async markAsReplied(id: string): Promise<Communication> {
    const communication = await this.findOne(id);
    communication.repliedAt = new Date();
    return this.communicationRepository.save(communication);
  }

  async update(id: string, updateCommunicationDto: UpdateCommunicationDto): Promise<Communication> {
    const communication = await this.findOne(id);
    Object.assign(communication, updateCommunicationDto);
    return this.communicationRepository.save(communication);
  }

  async remove(id: string): Promise<void> {
    const communication = await this.findOne(id);
    await this.communicationRepository.remove(communication);
  }

  async getConversation(user1Id: string, user2Id: string): Promise<Communication[]> {
    return this.communicationRepository.find({
      where: [
        { senderId: user1Id, recipientId: user2Id },
        { senderId: user2Id, recipientId: user1Id },
      ],
      relations: ['sender', 'recipient', 'property'],
      order: { sentAt: 'ASC' },
    });
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.communicationRepository.count({
      where: {
        recipientId: userId,
        readAt: null,
      },
    });
  }

  async searchCommunications(query: string, userId?: string): Promise<Communication[]> {
    const queryBuilder = this.communicationRepository.createQueryBuilder('communication')
      .leftJoinAndSelect('communication.sender', 'sender')
      .leftJoinAndSelect('communication.recipient', 'recipient')
      .leftJoinAndSelect('communication.property', 'property')
      .where('communication.subject ILIKE :query OR communication.message ILIKE :query', {
        query: `%${query}%`,
      });

    if (userId) {
      queryBuilder.andWhere(
        '(communication.senderId = :userId OR communication.recipientId = :userId)',
        { userId },
      );
    }

    return queryBuilder
      .orderBy('communication.sentAt', 'DESC')
      .getMany();
  }
}