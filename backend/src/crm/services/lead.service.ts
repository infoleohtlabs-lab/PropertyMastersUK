import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In, Between } from 'typeorm';
import { Lead, LeadStatus, LeadSource } from '../entities/lead.entity';
import { LeadActivity, ActivityType, ActivityDirection } from '../entities/lead-activity.entity';
import { CrmContact } from '../entities/crm-contact.entity';
import { CrmDeal } from '../entities/crm-deal.entity';
import { CrmTask, TaskType, TaskPriority } from '../entities/crm-task.entity';
import { NoteType } from '../entities/crm-note.entity';
import { CrmNote } from '../entities/crm-note.entity';

@Injectable()
export class LeadService {
  constructor(
    @InjectRepository(Lead)
    private leadRepository: Repository<Lead>,
    @InjectRepository(LeadActivity)
    private leadActivityRepository: Repository<LeadActivity>,
    @InjectRepository(CrmContact)
    private contactRepository: Repository<CrmContact>,
    @InjectRepository(CrmDeal)
    private dealRepository: Repository<CrmDeal>,
    @InjectRepository(CrmTask)
    private taskRepository: Repository<CrmTask>,
    @InjectRepository(CrmNote)
    private noteRepository: Repository<CrmNote>,
  ) {}

  async getLeads(userId: string, options: any) {
    const { page, limit, search, status, source, type, priority } = options;
    const skip = (page - 1) * limit;

    const whereConditions: any = {
      assignedAgentId: userId,
      isActive: true,
    };

    if (search) {
      whereConditions.firstName = Like(`%${search}%`);
    }
    if (status) {
      whereConditions.status = status;
    }
    if (source) {
      whereConditions.source = source;
    }
    if (type) {
      whereConditions.type = type;
    }
    if (priority) {
      whereConditions.priority = priority;
    }

    const [leads, total] = await this.leadRepository.findAndCount({
      where: whereConditions,
      relations: ['assignedTo', 'interestedProperty', 'activities', 'notes', 'tasks'],
      skip,
      take: limit,
      order: { score: 'DESC', createdAt: 'DESC' },
    });

    return {
      data: leads,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getLeadById(id: string, userId: string) {
    const lead = await this.leadRepository.findOne({
      where: { id, assignedAgentId: userId },
      relations: [
        'assignedTo',
        'interestedProperty',
        'activities',
        'notes',
        'tasks',
      ],
    });

    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    return lead;
  }

  async createLead(leadData: Partial<Lead>, userId: string) {
    // Check for duplicate leads
    const existingLead = await this.leadRepository.findOne({
      where: {
        email: leadData.email,
        isActive: true,
      },
    });

    if (existingLead) {
      throw new BadRequestException('Lead with this email already exists');
    }

    const lead = this.leadRepository.create({
      ...leadData,
      assignedAgentId: userId,
      score: this.calculateLeadScore(leadData),
    });

    const savedLead = await this.leadRepository.save(lead);

    // Create initial activity
    await this.createLeadActivity({
      leadId: savedLead.id,
      performedById: userId,
      type: ActivityType.STATUS_CHANGED,
      direction: ActivityDirection.INTERNAL,
      title: 'Lead Created',
      description: `New lead created from ${leadData.source || 'unknown'} source`,
      details: {
        source: leadData.source,
        initialData: leadData,
      },
    });

    return savedLead;
  }

  async updateLead(id: string, leadData: Partial<Lead>, userId: string) {
    const lead = await this.getLeadById(id, userId);
    
    const previousData = { ...lead };
    Object.assign(lead, leadData);
    
    // Recalculate score if relevant data changed
    if (leadData.budget || leadData.requirements || leadData.contactPreferences) {
      lead.score = this.calculateLeadScore(lead);
    }
    
    const updatedLead = await this.leadRepository.save(lead);

    // Create activity for significant updates
    await this.createLeadActivity({
      leadId: id,
      performedById: userId,
      type: ActivityType.STATUS_CHANGED,
      direction: ActivityDirection.INTERNAL,
      title: 'Lead Updated',
      description: 'Lead information updated',
      details: {
        previousData,
        newData: leadData,
        changes: this.getChanges(previousData, leadData),
      },
    });

    return updatedLead;
  }

  async qualifyLead(id: string, qualificationData: { score: number; notes?: string }, userId: string) {
    const lead = await this.getLeadById(id, userId);
    
    lead.score = qualificationData.score;
    lead.isQualified = qualificationData.score >= 70; // Threshold for qualified leads
    
    const updatedLead = await this.leadRepository.save(lead);

    // Create qualification activity
    await this.createLeadActivity({
      leadId: id,
      performedById: userId,
      type: ActivityType.STATUS_CHANGED,
      direction: ActivityDirection.INTERNAL,
      title: 'Lead Qualified',
      description: `Lead scored ${qualificationData.score}/100`,
      details: {
        score: qualificationData.score,
        isQualified: lead.isQualified,
        notes: qualificationData.notes,
      },
    });

    // Create follow-up task if qualified
    if (lead.isQualified) {
      await this.createFollowUpTask(lead, userId);
    }

    return updatedLead;
  }

  async convertLead(id: string, conversionData: any, userId: string) {
    const lead = await this.getLeadById(id, userId);
    
    if (lead.status === LeadStatus.CLOSED_WON) {
      throw new BadRequestException('Lead is already converted');
    }

    const results: any = {};

    // Create contact if requested
    if (conversionData.createContact) {
      const contact = await this.contactRepository.save({
        firstName: lead.firstName,
        lastName: lead.lastName,
        email: lead.email,
        phone: lead.phone,
        company: lead.company,
        jobTitle: lead.jobTitle,
        address: lead.address,
        socialMedia: lead.socialMedia,
        preferences: lead.contactPreferences,
        customFields: lead.customFields,
        tags: lead.tags,
        leadScore: lead.score,
        assignedToId: userId,
        leadId: id,
        source: lead.source,
      });
      results.contact = contact;
    }

    // Create deal if requested
    if (conversionData.createDeal && conversionData.dealData) {
      const deal = await this.dealRepository.save({
        ...conversionData.dealData,
        contactId: results.contact?.id,
        leadId: id,
        assignedToId: userId,
        propertyId: lead.interestedPropertyId,
        value: lead.budget || conversionData.dealData.value,
        requirements: lead.requirements,
      });
      results.deal = deal;
    }

    // Update lead status
    lead.status = LeadStatus.CLOSED_WON;
    lead.convertedDate = new Date();
    await this.leadRepository.save(lead);

    // Create conversion activity
    await this.createLeadActivity({
      leadId: id,
      performedById: userId,
      type: ActivityType.STATUS_CHANGED,
      direction: ActivityDirection.INTERNAL,
      title: 'Lead Converted',
      description: 'Lead successfully converted to contact/deal',
      details: {
        conversionData,
        results,
      },
    });

    return {
      lead,
      ...results,
    };
  }

  async assignLead(id: string, assignToUserId: string, userId: string, notes?: string) {
    const lead = await this.getLeadById(id, userId);
    
    const previousAssignee = lead.assignedAgentId;
    lead.assignedAgentId = assignToUserId;
    
    const updatedLead = await this.leadRepository.save(lead);

    // Create assignment activity
    await this.createLeadActivity({
      leadId: id,
      performedById: userId,
      type: ActivityType.STATUS_CHANGED,
      direction: ActivityDirection.INTERNAL,
      title: 'Lead Reassigned',
      description: `Lead assigned to new agent`,
      details: {
        previousAssignee,
        newAssignee: assignToUserId,
        notes,
      },
    });

    return updatedLead;
  }

  async addLeadNote(id: string, noteData: { content: string; type?: string }, userId: string) {
    const lead = await this.getLeadById(id, userId);
    
    const note = this.noteRepository.create({
      content: noteData.content,
      type: (noteData.type as NoteType) || NoteType.GENERAL,
      leadId: id,
      createdById: userId,
    });
    
    await this.noteRepository.save(note);

    // Create note activity
    await this.createLeadActivity({
      leadId: id,
      userId,
      type: 'note_added',
      direction: 'internal',
      title: 'Note Added',
      description: 'New note added to lead',
      details: {
        noteId: note.id,
        noteType: noteData.type,
        preview: noteData.content.substring(0, 100),
      },
    });

    return note;
  }

  async scheduleFollowUp(id: string, followUpData: any, userId: string) {
    const lead = await this.getLeadById(id, userId);
    
    const task = this.taskRepository.create({
      title: `Follow up with ${lead.firstName} ${lead.lastName}`,
      description: followUpData.notes,
      type: TaskType.FOLLOW_UP,
      dueDate: followUpData.dueDate,
      priority: TaskPriority.MEDIUM,
      leadId: id,
      assignedToId: userId,
      createdById: userId,
    });
    
    await this.taskRepository.save(task);

    // Update lead's next follow-up date
    lead.nextFollowUpDate = followUpData.dueDate;
    await this.leadRepository.save(lead);

    // Create follow-up activity
    await this.createLeadActivity({
      leadId: id,
      userId,
      type: 'follow_up_scheduled',
      direction: 'internal',
      title: 'Follow-up Scheduled',
      description: `Follow-up scheduled for ${followUpData.dueDate}`,
      details: {
        taskId: task.id,
        dueDate: followUpData.dueDate,
        notes: followUpData.notes,
      },
    });

    return task;
  }

  async trackLeadActivity(leadId: string, activityData: any, userId: string) {
    return this.createLeadActivity({
      leadId,
      performedById: userId,
      ...activityData,
    });
  }

  async getLeadActivities(leadId: string, userId: string, options?: any) {
    const lead = await this.getLeadById(leadId, userId);
    
    const { page = 1, limit = 20 } = options || {};
    const skip = (page - 1) * limit;
    
    const [activities, total] = await this.leadActivityRepository.findAndCount({
      where: { leadId },
      relations: ['performedBy', 'lead', 'relatedProperty'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });
    
    return {
      data: activities,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getLeadAnalytics(userId: string, period?: string) {
    const startDate = this.getStartDateForPeriod(period);
    const endDate = new Date();

    const [totalLeads, qualifiedLeads, convertedLeads, leadsBySource] = await Promise.all([
      this.leadRepository.count({
        where: {
          assignedAgentId: userId,
          createdAt: Between(startDate, endDate),
        },
      }),
      this.leadRepository.count({
        where: {
          assignedAgentId: userId,
          isQualified: true,
          createdAt: Between(startDate, endDate),
        },
      }),
      this.leadRepository.count({
        where: {
          assignedAgentId: userId,
          status: LeadStatus.CLOSED_WON,
          createdAt: Between(startDate, endDate),
        },
      }),
      this.getLeadsBySource(userId, startDate, endDate),
    ]);

    const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;
    const qualificationRate = totalLeads > 0 ? (qualifiedLeads / totalLeads) * 100 : 0;

    return {
      totalLeads,
      qualifiedLeads,
      convertedLeads,
      conversionRate,
      qualificationRate,
      leadsBySource,
    };
  }

  // Private helper methods
  private calculateLeadScore(leadData: Partial<Lead>): number {
    let score = 0;

    // Budget scoring (30 points max)
    if (leadData.budget) {
      if (leadData.budget >= 1000000) score += 30;
      else if (leadData.budget >= 500000) score += 25;
      else if (leadData.budget >= 250000) score += 20;
      else if (leadData.budget >= 100000) score += 15;
      else score += 10;
    }

    // Contact preferences (20 points max)
    if (leadData.contactPreferences) {
      if (leadData.contactPreferences.bestTimeToCall) score += 10;
      if (leadData.contactPreferences.preferredMethod) score += 10;
    }

    // Requirements specificity (20 points max)
    if (leadData.requirements) {
      const reqCount = Object.keys(leadData.requirements).length;
      score += Math.min(reqCount * 3, 20);
    }

    // Source quality (15 points max)
    const sourceScores = {
      [LeadSource.REFERRAL]: 15,
      [LeadSource.WEBSITE]: 12,
      [LeadSource.SOCIAL_MEDIA]: 10,
      [LeadSource.EMAIL_CAMPAIGN]: 8,
      [LeadSource.ADVERTISEMENT]: 6,
      [LeadSource.PHONE_CALL]: 3,
    };
    score += sourceScores[leadData.source as LeadSource] || 5;

    // Company/job title (15 points max)
    if (leadData.company) score += 8;
    if (leadData.jobTitle) score += 7;

    return Math.min(score, 100);
  }

  private async createLeadActivity(activityData: any) {
    const activity = this.leadActivityRepository.create(activityData);
    return this.leadActivityRepository.save(activity);
  }

  private async createFollowUpTask(lead: Lead, userId: string) {
    const followUpDate = new Date();
    followUpDate.setDate(followUpDate.getDate() + 3); // Follow up in 3 days

    const task = this.taskRepository.create({
      title: `Follow up with qualified lead: ${lead.firstName} ${lead.lastName}`,
      description: `High-priority follow-up for qualified lead (Score: ${lead.score})`,
      type: TaskType.FOLLOW_UP,
      priority: TaskPriority.HIGH,
      dueDate: followUpDate,
      leadId: lead.id,
      assignedToId: userId,
      createdById: userId,
    });
    
    return this.taskRepository.save(task);
  }

  private getChanges(oldData: any, newData: any): string[] {
    const changes: string[] = [];
    
    Object.keys(newData).forEach(key => {
      if (oldData[key] !== newData[key]) {
        changes.push(`${key}: ${oldData[key]} → ${newData[key]}`);
      }
    });
    
    return changes;
  }

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
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
  }

  private async getLeadsBySource(userId: string, startDate: Date, endDate: Date) {
    return this.leadRepository
      .createQueryBuilder('lead')
      .select('lead.source', 'source')
      .addSelect('COUNT(*)', 'count')
      .addSelect('AVG(lead.score)', 'averageScore')
      .where('lead.assignedAgentId = :userId', { userId })
      .andWhere('lead.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
      .groupBy('lead.source')
      .getRawMany();
  }

  async bulkUpdateStatus(bulkData: { leadIds: string[]; status: LeadStatus }, userId: string) {
    const leads = await this.leadRepository.find({
      where: {
        id: In(bulkData.leadIds),
        assignedAgentId: userId,
      },
    });

    if (leads.length !== bulkData.leadIds.length) {
      throw new NotFoundException('Some leads not found or not accessible');
    }

    await this.leadRepository.update(
      { id: In(bulkData.leadIds) },
      { status: bulkData.status, updatedAt: new Date() }
    );

    // Create bulk activity
    const activities = leads.map(lead => ({
      leadId: lead.id,
      performedById: userId,
      type: ActivityType.STATUS_CHANGED,
      direction: ActivityDirection.INTERNAL,
      title: 'Status Updated (Bulk)',
      description: `Status changed to ${bulkData.status}`,
      details: {
        previousStatus: lead.status,
        newStatus: bulkData.status,
        bulkOperation: true,
      },
    }));

    await this.leadActivityRepository.save(activities);

    return { updated: leads.length };
  }

  async bulkDeleteLeads(bulkData: { leadIds: string[] }, userId: string) {
    const leads = await this.leadRepository.find({
      where: {
        id: In(bulkData.leadIds),
        assignedAgentId: userId,
      },
    });

    if (leads.length !== bulkData.leadIds.length) {
      throw new NotFoundException('Some leads not found or not accessible');
    }

    // Delete related activities first
    await this.leadActivityRepository.delete({ leadId: In(bulkData.leadIds) });
    
    // Delete related notes
    await this.noteRepository.delete({ leadId: In(bulkData.leadIds) });
    
    // Delete related tasks
    await this.taskRepository.delete({ leadId: In(bulkData.leadIds) });
    
    // Finally delete the leads
    await this.leadRepository.delete({ id: In(bulkData.leadIds) });

    return { deleted: leads.length };
  }

  async getLeadDashboard(userId: string) {
    const [totalLeads, qualifiedLeads, convertedLeads, recentActivities] = await Promise.all([
      this.leadRepository.count({ where: { assignedAgentId: userId, isActive: true } }),
      this.leadRepository.count({ where: { assignedAgentId: userId, isQualified: true, isActive: true } }),
      this.leadRepository.count({ where: { assignedAgentId: userId, status: LeadStatus.CLOSED_WON, isActive: true } }),
      this.leadActivityRepository.find({
        where: { performedById: userId },
        order: { createdAt: 'DESC' },
        take: 10,
        relations: ['lead'],
      }),
    ]);

    const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

    return {
      totalLeads,
      qualifiedLeads,
      convertedLeads,
      conversionRate,
      recentActivities,
    };
  }

  async getLeadSources(userId: string) {
    return this.leadRepository
      .createQueryBuilder('lead')
      .select('lead.source', 'source')
      .addSelect('COUNT(*)', 'count')
      .addSelect('AVG(lead.score)', 'averageScore')
      .where('lead.assignedAgentId = :userId', { userId })
      .andWhere('lead.isActive = :isActive', { isActive: true })
      .groupBy('lead.source')
      .getRawMany();
  }

  async getConversionFunnel(userId: string, options: any) {
    const { period } = options;
    const startDate = this.getStartDateForPeriod(period);
    const endDate = new Date();

    const [newLeads, qualifiedLeads, proposalSent, closedWon] = await Promise.all([
      this.leadRepository.count({
        where: {
          assignedAgentId: userId,
          createdAt: Between(startDate, endDate),
          isActive: true,
        },
      }),
      this.leadRepository.count({
        where: {
          assignedAgentId: userId,
          isQualified: true,
          createdAt: Between(startDate, endDate),
          isActive: true,
        },
      }),
      this.leadRepository.count({
        where: {
          assignedAgentId: userId,
          status: LeadStatus.PROPOSAL,
          createdAt: Between(startDate, endDate),
          isActive: true,
        },
      }),
      this.leadRepository.count({
        where: {
          assignedAgentId: userId,
          status: LeadStatus.CLOSED_WON,
          createdAt: Between(startDate, endDate),
          isActive: true,
        },
      }),
    ]);

    return {
      newLeads,
      qualifiedLeads,
      proposalSent,
      closedWon,
      stages: [
        { name: 'New Leads', count: newLeads, percentage: 100 },
        { name: 'Qualified', count: qualifiedLeads, percentage: newLeads > 0 ? (qualifiedLeads / newLeads) * 100 : 0 },
        { name: 'Proposal Sent', count: proposalSent, percentage: newLeads > 0 ? (proposalSent / newLeads) * 100 : 0 },
        { name: 'Closed Won', count: closedWon, percentage: newLeads > 0 ? (closedWon / newLeads) * 100 : 0 },
      ],
    };
  }

  async getLeadNotes(leadId: string, userId: string) {
    const lead = await this.getLeadById(leadId, userId);
    return this.noteRepository.find({
      where: { leadId },
      relations: ['createdBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async getLeadTasks(leadId: string, userId: string) {
    const lead = await this.getLeadById(leadId, userId);
    return this.taskRepository.find({
      where: { leadId },
      relations: ['assignedTo', 'createdBy'],
      order: { dueDate: 'ASC' },
    });
  }

  async importLeads(leadsData: any[], userId: string) {
    const importedLeads = [];
    const errors = [];

    for (const leadData of leadsData) {
      try {
        // Check for duplicate
        const existingLead = await this.leadRepository.findOne({
          where: { email: leadData.email, isActive: true },
        });

        if (existingLead) {
          errors.push({ email: leadData.email, error: 'Lead already exists' });
          continue;
        }

        const lead = await this.createLead(leadData, userId);
        importedLeads.push(lead);
      } catch (error) {
        errors.push({ email: leadData.email, error: error.message });
      }
    }

    return {
      imported: importedLeads.length,
      errors: errors.length,
      details: { importedLeads, errors },
    };
  }

  async exportLeads(userId: string, options: any) {
    const { format, filters } = options;
    const whereConditions: any = {
      assignedAgentId: userId,
      isActive: true,
    };

    if (filters?.status) whereConditions.status = filters.status;
    if (filters?.source) whereConditions.source = filters.source;
    if (filters?.isQualified !== undefined) whereConditions.isQualified = filters.isQualified;

    const leads = await this.leadRepository.find({
      where: whereConditions,
      relations: ['assignedTo', 'interestedProperty'],
      order: { createdAt: 'DESC' },
    });

    return {
      format,
      data: leads,
      count: leads.length,
      exportedAt: new Date(),
    };
  }

  async updateLeadScore(id: string, scoreData: { score: number; notes?: string }, userId: string) {
    const lead = await this.getLeadById(id, userId);
    
    lead.score = scoreData.score;
    lead.isQualified = scoreData.score >= 70; // Threshold for qualification
    
    await this.leadRepository.save(lead);
    
    // Create activity
    await this.createLeadActivity({
      leadId: id,
      performedById: userId,
      type: ActivityType.STATUS_CHANGED,
      direction: ActivityDirection.INTERNAL,
      title: 'Lead Score Updated',
      description: `Lead score updated to ${scoreData.score}`,
      details: {
        score: scoreData.score,
        notes: scoreData.notes,
      },
    });
    
    return lead;
  }

  async deleteLead(id: string, userId: string) {
    const lead = await this.getLeadById(id, userId);
    
    // Delete related activities, notes, and tasks
    await this.leadActivityRepository.delete({ leadId: id });
    await this.noteRepository.delete({ leadId: id });
    await this.taskRepository.delete({ leadId: id });
    
    // Soft delete the lead
    lead.isActive = false;
    
    await this.leadRepository.save(lead);
    
    // Create deletion activity
    await this.createLeadActivity({
      leadId: id,
      performedById: userId,
      type: ActivityType.STATUS_CHANGED,
      direction: ActivityDirection.INTERNAL,
      title: 'Lead Deleted',
      description: 'Lead was deleted',
      details: {
        deletedAt: new Date(),
        deletedBy: userId,
      },
    });
    
    return { success: true, message: 'Lead deleted successfully' };
  }

  async archiveLead(id: string, userId: string, reason?: string) {
    const lead = await this.getLeadById(id, userId);
    
    lead.status = LeadStatus.CLOSED_LOST;
    
    await this.leadRepository.save(lead);
    
    // Create archive activity
    await this.createLeadActivity({
      leadId: id,
      performedById: userId,
      type: ActivityType.STATUS_CHANGED,
      direction: ActivityDirection.INTERNAL,
      title: 'Lead Archived',
      description: `Lead archived${reason ? `: ${reason}` : ''}`,
      details: {
        archivedAt: new Date(),
        reason,
      },
    });
    
    return lead;
  }

  async updateLeadStatus(id: string, statusData: { status: string; notes?: string }, userId: string) {
    const lead = await this.getLeadById(id, userId);
    
    const previousStatus = lead.status;
    lead.status = statusData.status as LeadStatus;
    
    await this.leadRepository.save(lead);
    
    // Create activity
    await this.createLeadActivity({
      leadId: id,
      performedById: userId,
      type: ActivityType.STATUS_CHANGED,
      direction: ActivityDirection.INTERNAL,
      title: 'Status Updated',
      description: `Status changed from ${previousStatus} to ${statusData.status}`,
      details: {
        previousStatus,
        newStatus: statusData.status,
        notes: statusData.notes,
      },
    });
    
    return lead;
  }

  async createLeadTask(leadId: string, taskData: any, userId: string) {
    const lead = await this.getLeadById(leadId, userId);
    
    const task = this.taskRepository.create({
      ...taskData,
      leadId,
      assignedToId: userId,
      createdById: userId,
    });
    
    const savedTask = await this.taskRepository.save(task);
    const taskResult = Array.isArray(savedTask) ? savedTask[0] : savedTask;
    
    // Create activity
    await this.createLeadActivity({
      leadId,
      performedById: userId,
      type: ActivityType.TASK_CREATED,
      direction: ActivityDirection.INTERNAL,
      title: 'Task Created',
      description: `Task created: ${taskData.title}`,
      details: {
        taskId: taskResult.id,
        taskTitle: taskData.title,
        taskDescription: taskData.description,
      },
    });
    
    return taskResult;
  }

  async bulkAssignLeads(bulkData: { leadIds: string[]; assignToUserId: string }, userId: string) {
    const leads = await this.leadRepository.find({
      where: {
        id: In(bulkData.leadIds),
        assignedAgentId: userId,
      },
    });
    
    if (leads.length === 0) {
      throw new NotFoundException('No leads found with provided IDs');
    }
    
    // Update all leads
    await this.leadRepository.update(
      { id: In(bulkData.leadIds) },
      { assignedAgentId: bulkData.assignToUserId }
    );
    
    // Create bulk activity
    const activities = leads.map(lead => ({
      leadId: lead.id,
      performedById: userId,
      type: ActivityType.STATUS_CHANGED,
      direction: ActivityDirection.INTERNAL,
      title: 'Lead Assigned (Bulk)',
      description: `Lead assigned to new agent`,
      details: {
        previousAgent: lead.assignedAgentId,
        newAgent: bulkData.assignToUserId,
        bulkOperation: true,
      },
    }));
    
    await this.leadActivityRepository.save(activities);
    
    return {
      success: true,
      message: `${leads.length} leads assigned successfully`,
      updatedCount: leads.length,
    };
  }
}
