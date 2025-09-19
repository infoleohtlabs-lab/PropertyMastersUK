import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {}

  async create(createNotificationDto: CreateNotificationDto): Promise<Notification> {
    const notification = this.notificationRepository.create({
      ...createNotificationDto,
      createdAt: new Date(),
    });
    return this.notificationRepository.save(notification);
  }

  async findAll(): Promise<Notification[]> {
    return this.notificationRepository.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }
    return notification;
  }

  async findByUser(userId: string): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: { userId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findUnread(userId: string): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: {
        userId,
        readAt: null,
      },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async markAsRead(id: string): Promise<Notification> {
    const notification = await this.findOne(id);
    notification.readAt = new Date();
    return this.notificationRepository.save(notification);
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepository.update(
      { userId, readAt: null },
      { readAt: new Date() },
    );
  }

  async update(id: string, updateNotificationDto: UpdateNotificationDto): Promise<Notification> {
    const notification = await this.findOne(id);
    Object.assign(notification, updateNotificationDto);
    return this.notificationRepository.save(notification);
  }

  async remove(id: string): Promise<void> {
    const notification = await this.findOne(id);
    await this.notificationRepository.remove(notification);
  }

  async removeAllForUser(userId: string): Promise<void> {
    await this.notificationRepository.delete({ userId });
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepository.count({
      where: {
        userId,
        readAt: null,
      },
    });
  }

  async createBulkNotifications(notifications: CreateNotificationDto[]): Promise<Notification[]> {
    const notificationEntities = notifications.map(dto => 
      this.notificationRepository.create({
        ...dto,
        createdAt: new Date(),
      })
    );
    return this.notificationRepository.save(notificationEntities);
  }

  async findByType(userId: string, type: NotificationType): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: { userId, type },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async deleteOldNotifications(daysOld: number = 30): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    await this.notificationRepository.delete({
      createdAt: { $lt: cutoffDate } as any,
      readAt: { $not: null } as any,
    });
  }

  async getNotificationStats(userId: string): Promise<any> {
    const total = await this.notificationRepository.count({ where: { userId } });
    const unread = await this.getUnreadCount(userId);
    const read = total - unread;

    const typeStats = await this.notificationRepository
      .createQueryBuilder('notification')
      .select('notification.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .where('notification.userId = :userId', { userId })
      .groupBy('notification.type')
      .getRawMany();

    return {
      total,
      read,
      unread,
      byType: typeStats,
    };
  }
}
