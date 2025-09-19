import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In, Between } from 'typeorm';
import { Campaign, CampaignStatus, CampaignType } from '../entities/campaign.entity';
import { CampaignEmail, EmailStatus } from '../entities/campaign-email.entity';
import { EmailTemplate } from '../entities/email-template.entity';
import { Lead } from '../entities/lead.entity';
import { CrmContact, ContactStatus } from '../entities/crm-contact.entity';
import { EmailService } from './email.service';

@Injectable()
export class CampaignService {
  constructor(
    @InjectRepository(Campaign)
    private campaignRepository: Repository<Campaign>,
    @InjectRepository(CampaignEmail)
    private campaignEmailRepository: Repository<CampaignEmail>,
    @InjectRepository(EmailTemplate)
    private emailTemplateRepository: Repository<EmailTemplate>,
    @InjectRepository(Lead)
    private leadRepository: Repository<Lead>,
    @InjectRepository(CrmContact)
    private contactRepository: Repository<CrmContact>,
    private emailService: EmailService,
  ) {}

  async getCampaigns(userId: string, options: any) {
    const { page, limit, status, type } = options;
    const skip = (page - 1) * limit;

    const whereConditions: any = {
      createdById: userId,
    };

    if (status) {
      whereConditions.status = status;
    }
    if (type) {
      whereConditions.type = type;
    }

    const [campaigns, total] = await this.campaignRepository.findAndCount({
      where: whereConditions,
      relations: ['createdBy', 'emailTemplate'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data: campaigns,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getCampaignById(id: string, userId: string) {
    const campaign = await this.campaignRepository.findOne({
      where: { id, createdById: userId },
      relations: ['createdBy', 'emailTemplate', 'emails'],
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    return campaign;
  }

  async createCampaign(campaignData: Partial<Campaign>, userId: string) {
    // Validate email template exists
    if (campaignData.emailTemplateId) {
      const template = await this.emailTemplateRepository.findOne({
        where: { id: campaignData.emailTemplateId },
      });
      if (!template) {
        throw new BadRequestException('Email template not found');
      }
    }

    const campaign = this.campaignRepository.create({
      ...campaignData,
      createdById: userId,
      status: CampaignStatus.DRAFT,
    });

    return this.campaignRepository.save(campaign);
  }

  async updateCampaign(id: string, campaignData: Partial<Campaign>, userId: string) {
    const campaign = await this.getCampaignById(id, userId);
    
    // Prevent updates to running campaigns
    if (campaign.status === CampaignStatus.RUNNING && campaignData.status !== CampaignStatus.PAUSED) {
      throw new BadRequestException('Cannot update running campaign. Pause it first.');
    }

    Object.assign(campaign, campaignData);
    return this.campaignRepository.save(campaign);
  }

  async deleteCampaign(id: string, userId: string) {
    const campaign = await this.getCampaignById(id, userId);
    
    if (campaign.status === CampaignStatus.RUNNING) {
      throw new BadRequestException('Cannot delete running campaign. Stop it first.');
    }

    await this.campaignRepository.remove(campaign);
    return { message: 'Campaign deleted successfully' };
  }

  async launchCampaign(id: string, userId: string) {
    const campaign = await this.getCampaignById(id, userId);
    
    if (campaign.status !== CampaignStatus.DRAFT && campaign.status !== CampaignStatus.PAUSED) {
      throw new BadRequestException('Campaign can only be launched from draft or paused status');
    }

    // Validate campaign is ready to launch
    await this.validateCampaignForLaunch(campaign);

    campaign.status = CampaignStatus.RUNNING;
    campaign.startDate = new Date();
    
    const updatedCampaign = await this.campaignRepository.save(campaign);

    // Start sending emails
    await this.processCampaignEmails(updatedCampaign);

    return updatedCampaign;
  }

  async pauseCampaign(id: string, userId: string) {
    const campaign = await this.getCampaignById(id, userId);
    
    if (campaign.status !== CampaignStatus.RUNNING) {
      throw new BadRequestException('Only running campaigns can be paused');
    }

    campaign.status = CampaignStatus.PAUSED;
    return this.campaignRepository.save(campaign);
  }

  async resumeCampaign(id: string, userId: string) {
    const campaign = await this.getCampaignById(id, userId);
    
    if (campaign.status !== CampaignStatus.PAUSED) {
      throw new BadRequestException('Only paused campaigns can be resumed');
    }

    campaign.status = CampaignStatus.RUNNING;
    return this.campaignRepository.save(campaign);
  }

  async stopCampaign(id: string, userId: string) {
    const campaign = await this.getCampaignById(id, userId);
    
    campaign.status = CampaignStatus.COMPLETED;
    campaign.endDate = new Date();
    
    return this.campaignRepository.save(campaign);
  }

  async getCampaignAnalytics(id: string, userId: string) {
    const campaign = await this.getCampaignById(id, userId);
    
    const analytics = await this.campaignEmailRepository
      .createQueryBuilder('email')
      .select([
        'COUNT(*) as totalSent',
        'SUM(CASE WHEN email.status = \'OPENED\' THEN 1 ELSE 0 END) as totalOpened',
        'SUM(CASE WHEN email.status = \'CLICKED\' THEN 1 ELSE 0 END) as totalClicked',
        'SUM(CASE WHEN email.bounced = true THEN 1 ELSE 0 END) as totalBounced',
        'SUM(CASE WHEN email.complained = true THEN 1 ELSE 0 END) as totalComplaints',
        'AVG(email.openCount) as avgOpenCount',
        'AVG(email.clickCount) as avgClickCount',
      ])
      .where('email.campaignId = :campaignId', { campaignId: id })
      .getRawOne();

    const openRate = analytics.totalSent > 0 ? (analytics.totalOpened / analytics.totalSent) * 100 : 0;
    const clickRate = analytics.totalSent > 0 ? (analytics.totalClicked / analytics.totalSent) * 100 : 0;
    const bounceRate = analytics.totalSent > 0 ? (analytics.totalBounced / analytics.totalSent) * 100 : 0;
    const complaintRate = analytics.totalSent > 0 ? (analytics.totalComplaints / analytics.totalSent) * 100 : 0;

    return {
      campaign,
      analytics: {
        ...analytics,
        openRate,
        clickRate,
        bounceRate,
        complaintRate,
      },
    };
  }

  async getCampaignPerformance(id: string, userId: string) {
    const campaign = await this.getCampaignById(id, userId);
    
    // Get daily performance data
    const dailyStats = await this.campaignEmailRepository
      .createQueryBuilder('email')
      .select([
        'DATE(email.sentAt) as date',
        'COUNT(*) as sent',
        'SUM(CASE WHEN email.status = \'OPENED\' THEN 1 ELSE 0 END) as opened',
        'SUM(CASE WHEN email.status = \'CLICKED\' THEN 1 ELSE 0 END) as clicked',
      ])
      .where('email.campaignId = :campaignId', { campaignId: id })
      .andWhere('email.sentAt IS NOT NULL')
      .groupBy('DATE(email.sentAt)')
      .orderBy('DATE(email.sentAt)', 'ASC')
      .getRawMany();

    return {
      campaign,
      dailyStats,
    };
  }

  async getCampaignEmails(id: string, userId: string, options: any) {
    const campaign = await this.getCampaignById(id, userId);
    
    const { page, limit, status } = options;
    const skip = (page - 1) * limit;

    const whereConditions: any = {
      campaignId: id,
    };

    if (status) {
      whereConditions.status = status;
    }

    const [emails, total] = await this.campaignEmailRepository.findAndCount({
      where: whereConditions,
      relations: ['campaign', 'lead', 'user'],
      skip,
      take: limit,
      order: { sentAt: 'DESC' },
    });

    return {
      data: emails,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async sendTestEmail(id: string, testEmail: string, personalizeData: any, userId: string) {
    const campaign = await this.getCampaignById(id, userId);
    
    if (!campaign.emailTemplate) {
      throw new BadRequestException('Campaign must have an email template');
    }

    // Send test email using email service
    return this.emailService.sendTestEmail({
      testEmail,
      templateId: campaign.emailTemplateId,
      personalData: personalizeData,
    });
  }

  async createABTest(id: string, abTestData: any, userId: string) {
    const campaign = await this.getCampaignById(id, userId);
    
    if (campaign.status !== CampaignStatus.DRAFT) {
      throw new BadRequestException('A/B tests can only be created for draft campaigns');
    }

    campaign.abTestSettings = {
      enabled: true,
      variants: abTestData.variants,
      winnerCriteria: abTestData.winnerCriteria,
      testDuration: abTestData.testDuration,
    };

    return this.campaignRepository.save(campaign);
  }

  async getABTestResults(id: string, userId: string) {
    const campaign = await this.getCampaignById(id, userId);
    
    if (!campaign.abTestSettings?.enabled) {
      throw new BadRequestException('Campaign does not have A/B testing enabled');
    }

    // Get results for each variant
    const variantResults = await Promise.all(
      campaign.abTestSettings.variants.map(async (variant) => {
        const stats = await this.campaignEmailRepository
          .createQueryBuilder('email')
          .select([
            'COUNT(*) as sent',
            'SUM(CASE WHEN email.status = \'OPENED\' THEN 1 ELSE 0 END) as opened',
            'SUM(CASE WHEN email.status = \'CLICKED\' THEN 1 ELSE 0 END) as clicked',
          ])
          .where('email.campaignId = :campaignId', { campaignId: id })
          .andWhere('email.variant = :variant', { variant: variant.name })
          .getRawOne();

        const openRate = stats.sent > 0 ? (stats.opened / stats.sent) * 100 : 0;
        const clickRate = stats.sent > 0 ? (stats.clicked / stats.sent) * 100 : 0;

        return {
          variant: variant.name,
          ...stats,
          openRate,
          clickRate,
        };
      })
    );

    // Determine winner based on criteria
    const winner = this.determineABTestWinner(variantResults, campaign.abTestSettings.winnerCriteria);

    return {
      campaign,
      variantResults,
      winner,
    };
  }

  async getAutomationRules(userId: string) {
    // This would typically be stored in a separate table
    // For now, return some example automation rules
    return [
      {
        id: '1',
        name: 'Welcome Series',
        trigger: 'lead_created',
        conditions: [{ field: 'source', operator: 'equals', value: 'website' }],
        actions: [
          { type: 'send_email', templateId: 'welcome-template', delay: 0 },
          { type: 'send_email', templateId: 'follow-up-template', delay: 3 },
        ],
        isActive: true,
      },
      {
        id: '2',
        name: 'Property Alert',
        trigger: 'property_match',
        conditions: [{ field: 'lead.requirements', operator: 'matches', value: 'property' }],
        actions: [
          { type: 'send_email', templateId: 'property-alert-template', delay: 0 },
        ],
        isActive: true,
      },
    ];
  }

  async createAutomationRule(ruleData: any, userId: string) {
    // Implementation would save to automation rules table
    return {
      id: Date.now().toString(),
      ...ruleData,
      createdBy: userId,
      createdAt: new Date(),
    };
  }

  async importContacts(importData: any, userId: string) {
    const { source, data, mapping, campaignId } = importData;
    
    const importResults = {
      total: data.length,
      imported: 0,
      skipped: 0,
      errors: [],
    };

    for (const row of data) {
      try {
        const contactData = this.mapImportData(row, mapping);
        
        // Check if contact already exists
        const existingContact = await this.contactRepository.findOne({
          where: { email: contactData.email },
        });

        if (existingContact) {
          importResults.skipped++;
          continue;
        }

        // Create new contact
        await this.contactRepository.save({
          ...contactData,
          assignedToId: userId,
          source: source,
        });

        importResults.imported++;
      } catch (error) {
        importResults.errors.push({
          row,
          error: error.message,
        });
      }
    }

    return importResults;
  }

  // Private helper methods
  private async validateCampaignForLaunch(campaign: Campaign) {
    if (!campaign.emailTemplateId) {
      throw new BadRequestException('Campaign must have an email template');
    }

    if (!campaign.targetAudience || Object.keys(campaign.targetAudience).length === 0) {
      throw new BadRequestException('Campaign must have target audience defined');
    }

    // Additional validation logic
  }

  private async processCampaignEmails(campaign: Campaign) {
    // Get target audience based on campaign criteria
    const recipients = await this.getTargetAudience(campaign);
    
    // Create campaign emails for each recipient
    const campaignEmails = recipients.map(recipient => ({
      campaignId: campaign.id,
      recipientEmail: recipient.email,
      recipientName: `${recipient.firstName} ${recipient.lastName}`,
      leadId: recipient.type === 'lead' ? recipient.id : null,
      userId: recipient.id,
      status: EmailStatus.PENDING,
    }));

    await this.campaignEmailRepository.save(campaignEmails);

    // Process emails (this would typically be done by a queue/worker)
    await this.sendCampaignEmails(campaign.id);
  }

  private async getTargetAudience(campaign: Campaign) {
    // Implementation would build query based on campaign.targetAudience criteria
    // For now, return all active contacts/leads
    const contacts = await this.contactRepository.find({
      where: { status: ContactStatus.ACTIVE },
      select: ['id', 'email', 'firstName', 'lastName'],
    });

    const leads = await this.leadRepository.find({
      where: { isActive: true },
      select: ['id', 'email', 'firstName', 'lastName'],
    });

    return [
      ...contacts.map(c => ({ ...c, type: 'contact' })),
      ...leads.map(l => ({ ...l, type: 'lead', leadId: l.id })),
    ];
  }

  private async sendCampaignEmails(campaignId: string) {
    const pendingEmails = await this.campaignEmailRepository.find({
      where: { campaignId, status: EmailStatus.PENDING },
      relations: ['campaign', 'campaign.emailTemplate'],
    });

    for (const email of pendingEmails) {
      try {
        await this.emailService.sendCampaignEmail(email);
        
        email.status = EmailStatus.SENT;
        email.sentAt = new Date();
        await this.campaignEmailRepository.save(email);
      } catch (error) {
        email.status = EmailStatus.FAILED;
        email.failureReason = error.message;
        await this.campaignEmailRepository.save(email);
      }
    }
  }

  private determineABTestWinner(variantResults: any[], criteria: string) {
    let winner = variantResults[0];
    
    for (const result of variantResults) {
      switch (criteria) {
        case 'open_rate':
          if (result.openRate > winner.openRate) winner = result;
          break;
        case 'click_rate':
          if (result.clickRate > winner.clickRate) winner = result;
          break;
        case 'conversion_rate':
          // Would need conversion tracking
          break;
      }
    }
    
    return winner;
  }

  private mapImportData(row: any, mapping: Record<string, string>) {
    const mapped: any = {};
    
    Object.keys(mapping).forEach(field => {
      const sourceField = mapping[field];
      if (row[sourceField] !== undefined) {
        mapped[field] = row[sourceField];
      }
    });
    
    return mapped;
  }
}
