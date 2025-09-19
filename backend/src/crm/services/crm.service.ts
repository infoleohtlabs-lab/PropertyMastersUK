import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, Like, In } from 'typeorm';
import { CrmContact, ContactStatus, ContactType } from '../entities/crm-contact.entity';
import { CrmDeal, DealStage } from '../entities/crm-deal.entity';
import { CrmTask, TaskStatus } from '../entities/crm-task.entity';
import { CrmNote } from '../entities/crm-note.entity';
import { Lead } from '../entities/lead.entity';
import { LeadActivity } from '../entities/lead-activity.entity';

@Injectable()
export class CrmService {
  constructor(
    @InjectRepository(CrmContact)
    private contactRepository: Repository<CrmContact>,
    @InjectRepository(CrmDeal)
    private dealRepository: Repository<CrmDeal>,
    @InjectRepository(CrmTask)
    private taskRepository: Repository<CrmTask>,
    @InjectRepository(CrmNote)
    private noteRepository: Repository<CrmNote>,
    @InjectRepository(Lead)
    private leadRepository: Repository<Lead>,
    @InjectRepository(LeadActivity)
    private leadActivityRepository: Repository<LeadActivity>,
  ) {}

  // Dashboard and Analytics
  async getDashboardData(userId: string, period?: string) {
    const startDate = this.getStartDateForPeriod(period);
    const endDate = new Date();

    const [totalContacts, totalDeals, totalTasks, recentActivities] = await Promise.all([
      this.contactRepository.count({
        where: { assignedToId: userId, status: ContactStatus.ACTIVE },
      }),
      this.dealRepository.count({
        where: { assignedToId: userId, isActive: true },
      }),
      this.taskRepository.count({
        where: { assignedToId: userId, status: In([TaskStatus.PENDING, TaskStatus.IN_PROGRESS]) },
      }),
      this.getRecentActivities(userId, 10),
    ]);

    const dealsByStage = await this.dealRepository
      .createQueryBuilder('deal')
      .select('deal.stage', 'stage')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(deal.value)', 'totalValue')
      .where('deal.assignedToId = :userId', { userId })
      .andWhere('deal.isActive = :isActive', { isActive: true })
      .groupBy('deal.stage')
      .getRawMany();

    const tasksByStatus = await this.taskRepository
      .createQueryBuilder('task')
      .select('task.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('task.assignedToId = :userId', { userId })
      .andWhere('task.isActive = :isActive', { isActive: true })
      .groupBy('task.status')
      .getRawMany();

    const monthlyPerformance = await this.getMonthlyPerformance(userId, startDate, endDate);

    return {
      summary: {
        totalContacts,
        totalDeals,
        totalTasks,
        totalValue: dealsByStage.reduce((sum, stage) => sum + (parseFloat(stage.totalValue) || 0), 0),
      },
      dealsByStage,
      tasksByStatus,
      monthlyPerformance,
      recentActivities,
    };
  }

  async getAnalytics(userId: string, options: { startDate?: Date; endDate?: Date; type?: string }) {
    const { startDate, endDate, type } = options;

    const baseQuery = {
      assignedToId: userId,
      ...(startDate && endDate && {
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
      }),
    };

    const analytics = {
      contacts: await this.getContactAnalytics(baseQuery),
      deals: await this.getDealAnalytics(baseQuery),
      tasks: await this.getTaskAnalytics(baseQuery),
      leads: await this.getLeadAnalytics(baseQuery),
    };

    return analytics;
  }

  // Contact Management
  async getContacts(userId: string, options: any) {
    const { page, limit, search, type, status } = options;
    const skip = (page - 1) * limit;

    const whereConditions: any = {
      assignedToId: userId,
    };

    if (search) {
      whereConditions.firstName = Like(`%${search}%`);
    }
    if (type) {
      whereConditions.type = type;
    }
    if (status) {
      whereConditions.status = status;
    }

    const [contacts, total] = await this.contactRepository.findAndCount({
      where: whereConditions,
      relations: ['assignedTo', 'lead', 'deals', 'tasks'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data: contacts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getContactById(id: string, userId: string) {
    const contact = await this.contactRepository.findOne({
      where: { id, assignedToId: userId },
      relations: ['assignedTo', 'lead', 'deals', 'tasks', 'notes_relation'],
    });

    if (!contact) {
      throw new NotFoundException('Contact not found');
    }

    return contact;
  }

  async createContact(contactData: Partial<CrmContact>, userId: string) {
    const contact = this.contactRepository.create({
      ...contactData,
      assignedToId: userId,
    });

    return this.contactRepository.save(contact);
  }

  async updateContact(id: string, contactData: Partial<CrmContact>, userId: string) {
    const contact = await this.getContactById(id, userId);
    
    Object.assign(contact, contactData);
    return this.contactRepository.save(contact);
  }

  async deleteContact(id: string, userId: string) {
    const contact = await this.getContactById(id, userId);
    
    contact.status = ContactStatus.INACTIVE;
    await this.contactRepository.save(contact);
    
    return { message: 'Contact deleted successfully' };
  }

  // Deal Management
  async getDeals(userId: string, options: any) {
    const { page, limit, stage, type } = options;
    const skip = (page - 1) * limit;

    const whereConditions: any = {
      assignedToId: userId,
      isActive: true,
    };

    if (stage) {
      whereConditions.stage = stage;
    }
    if (type) {
      whereConditions.type = type;
    }

    const [deals, total] = await this.dealRepository.findAndCount({
      where: whereConditions,
      relations: ['assignedTo', 'contact', 'lead', 'property', 'tasks', 'notes'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data: deals,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getDealById(id: string, userId: string) {
    const deal = await this.dealRepository.findOne({
      where: { id, assignedToId: userId },
      relations: ['assignedTo', 'contact', 'lead', 'property', 'tasks', 'notes'],
    });

    if (!deal) {
      throw new NotFoundException('Deal not found');
    }

    return deal;
  }

  async createDeal(dealData: Partial<CrmDeal>, userId: string) {
    const deal = this.dealRepository.create({
      ...dealData,
      assignedToId: userId,
      weightedValue: dealData.value * (dealData.probability || 50) / 100,
    });

    return this.dealRepository.save(deal);
  }

  async updateDeal(id: string, dealData: Partial<CrmDeal>, userId: string) {
    const deal = await this.getDealById(id, userId);
    
    Object.assign(deal, dealData);
    
    if (dealData.value || dealData.probability) {
      deal.weightedValue = (dealData.value || deal.value) * (dealData.probability || deal.probability) / 100;
    }
    
    return this.dealRepository.save(deal);
  }

  async updateDealStage(id: string, stage: string, notes: string, userId: string) {
    const deal = await this.getDealById(id, userId);
    
    const stageHistory = deal.stageHistory || [];
    stageHistory.push({
      stage: deal.stage,
      changedAt: new Date(),
      changedBy: userId,
      notes,
    });
    
    deal.stage = stage as DealStage;
    deal.stageHistory = stageHistory;
    
    if (stage === DealStage.CLOSED_WON || stage === DealStage.CLOSED_LOST) {
      deal.actualCloseDate = new Date();
    }
    
    return this.dealRepository.save(deal);
  }

  // Task Management
  async getTasks(userId: string, options: any) {
    const { page, limit, status, type, dueDate } = options;
    const skip = (page - 1) * limit;

    const whereConditions: any = {
      assignedToId: userId,
      isActive: true,
    };

    if (status) {
      whereConditions.status = status;
    }
    if (type) {
      whereConditions.type = type;
    }
    if (dueDate) {
      whereConditions.dueDate = dueDate;
    }

    const [tasks, total] = await this.taskRepository.findAndCount({
      where: whereConditions,
      relations: ['assignedTo', 'createdBy', 'contact', 'lead', 'deal', 'property'],
      skip,
      take: limit,
      order: { dueDate: 'ASC', priority: 'DESC' },
    });

    return {
      data: tasks,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async createTask(taskData: Partial<CrmTask>, userId: string) {
    const task = this.taskRepository.create({
      ...taskData,
      assignedToId: taskData.assignedToId || userId,
      createdById: userId,
    });

    return this.taskRepository.save(task);
  }

  async updateTask(id: string, taskData: Partial<CrmTask>, userId: string) {
    const task = await this.taskRepository.findOne({
      where: { id, assignedToId: userId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    Object.assign(task, taskData);
    return this.taskRepository.save(task);
  }

  async completeTask(id: string, completionData: any, userId: string) {
    const task = await this.taskRepository.findOne({
      where: { id, assignedToId: userId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    task.status = TaskStatus.COMPLETED;
    task.completedDate = new Date();
    task.outcome = completionData.outcome;
    
    if (completionData.actualDuration) {
      task.actualDuration = completionData.actualDuration;
    }

    return this.taskRepository.save(task);
  }

  // Notes Management
  async getNotes(userId: string, options: any) {
    const { entityType, entityId } = options;
    
    const whereConditions: any = {
      createdById: userId,
      isActive: true,
    };

    if (entityType && entityId) {
      whereConditions[`${entityType}Id`] = entityId;
    }

    return this.noteRepository.find({
      where: whereConditions,
      relations: ['createdBy', 'contact', 'lead', 'deal', 'task', 'property'],
      order: { createdAt: 'DESC' },
    });
  }

  async createNote(noteData: Partial<CrmNote>, userId: string) {
    const note = this.noteRepository.create({
      ...noteData,
      createdById: userId,
    });

    return this.noteRepository.save(note);
  }

  async updateNote(id: string, noteData: Partial<CrmNote>, userId: string) {
    const note = await this.noteRepository.findOne({
      where: { id, createdById: userId },
    });

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    // Track edit history
    const editHistory = note.editHistory || [];
    editHistory.push({
      editedAt: new Date(),
      editedBy: userId,
      previousContent: note.content,
      reason: noteData.content ? 'Content updated' : 'Note updated',
    });

    Object.assign(note, noteData);
    note.editHistory = editHistory;

    return this.noteRepository.save(note);
  }

  // Helper Methods
  private getStartDateForPeriod(period?: string): Date {
    const now = new Date();
    switch (period) {
      case 'week':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case 'month':
        return new Date(now.getFullYear(), now.getMonth(), 1);
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        return new Date(now.getFullYear(), quarter * 3, 1);
      case 'year':
        return new Date(now.getFullYear(), 0, 1);
      default:
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // Default to 30 days
    }
  }

  private async getRecentActivities(userId: string, limit: number) {
    return this.leadActivityRepository.find({
      where: { performedById: userId },
      relations: ['performedBy', 'lead', 'relatedProperty'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  private async getMonthlyPerformance(userId: string, startDate: Date, endDate: Date) {
    const deals = await this.dealRepository
      .createQueryBuilder('deal')
      .select('EXTRACT(MONTH FROM deal.createdAt)', 'month')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(deal.value)', 'totalValue')
      .addSelect('AVG(deal.value)', 'averageValue')
      .where('deal.assignedToId = :userId', { userId })
      .andWhere('deal.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
      .groupBy('EXTRACT(MONTH FROM deal.createdAt)')
      .getRawMany();

    return deals;
  }

  private async getContactAnalytics(baseQuery: any) {
    const total = await this.contactRepository.count({ where: baseQuery });
    const byType = await this.contactRepository
      .createQueryBuilder('contact')
      .select('contact.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .where(baseQuery)
      .groupBy('contact.type')
      .getRawMany();

    return { total, byType };
  }

  private async getDealAnalytics(baseQuery: any) {
    const total = await this.dealRepository.count({ where: baseQuery });
    const totalValue = await this.dealRepository
      .createQueryBuilder('deal')
      .select('SUM(deal.value)', 'sum')
      .where(baseQuery)
      .getRawOne();

    const byStage = await this.dealRepository
      .createQueryBuilder('deal')
      .select('deal.stage', 'stage')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(deal.value)', 'totalValue')
      .where(baseQuery)
      .groupBy('deal.stage')
      .getRawMany();

    return { total, totalValue: totalValue.sum || 0, byStage };
  }

  private async getTaskAnalytics(baseQuery: any) {
    const total = await this.taskRepository.count({ where: baseQuery });
    const byStatus = await this.taskRepository
      .createQueryBuilder('task')
      .select('task.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where(baseQuery)
      .groupBy('task.status')
      .getRawMany();

    return { total, byStatus };
  }

  private async getLeadAnalytics(baseQuery: any) {
    const total = await this.leadRepository.count({ where: baseQuery });
    const byStatus = await this.leadRepository
      .createQueryBuilder('lead')
      .select('lead.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where(baseQuery)
      .groupBy('lead.status')
      .getRawMany();

    return { total, byStatus };
  }
}
