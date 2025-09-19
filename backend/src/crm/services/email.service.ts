import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { EmailTemplate } from '../entities/email-template.entity';
import { Campaign } from '../entities/campaign.entity';
import { CampaignEmail, EmailStatus } from '../entities/campaign-email.entity';

@Injectable()
export class EmailService {
  constructor(
    @InjectRepository(EmailTemplate)
    private emailTemplateRepository: Repository<EmailTemplate>,
    @InjectRepository(Campaign)
    private campaignRepository: Repository<Campaign>,
    @InjectRepository(CampaignEmail)
    private campaignEmailRepository: Repository<CampaignEmail>,
    private configService: ConfigService,
  ) {}

  // Email Template Management
  async createEmailTemplate(templateData: Partial<EmailTemplate>, userId: string) {
    this.validateTemplateContent(templateData);

    const template = this.emailTemplateRepository.create({
      ...templateData,
      createdById: userId,
      currentVersion: 1,
      isActive: true,
    });

    return await this.emailTemplateRepository.save(template);
  }

  async getEmailTemplates(userId: string, filters?: {
    category?: string;
    isActive?: boolean;
    search?: string;
  }) {
    const query = this.emailTemplateRepository.createQueryBuilder('template')
      .where('template.createdById = :userId', { userId });

    if (filters?.category) {
      query.andWhere('template.category = :category', { category: filters.category });
    }

    if (filters?.isActive !== undefined) {
      query.andWhere('template.isActive = :isActive', { isActive: filters.isActive });
    }

    if (filters?.search) {
      query.andWhere(
        '(template.name ILIKE :search OR template.subject ILIKE :search)',
        { search: `%${filters.search}%` }
      );
    }

    return await query.orderBy('template.updatedAt', 'DESC').getMany();
  }

  async getEmailTemplateById(templateId: string, userId: string) {
    const template = await this.emailTemplateRepository.findOne({
      where: { id: templateId, createdById: userId },
    });

    if (!template) {
      throw new NotFoundException('Email template not found');
    }

    return template;
  }

  async updateEmailTemplate(
    templateId: string,
    updateData: Partial<EmailTemplate>,
    userId: string
  ) {
    const template = await this.getEmailTemplateById(templateId, userId);
    
    this.validateTemplateContent(updateData);

    Object.assign(template, updateData);
    return await this.emailTemplateRepository.save(template);
  }

  async deleteEmailTemplate(templateId: string, userId: string) {
    const template = await this.getEmailTemplateById(templateId, userId);
    
    await this.emailTemplateRepository.remove(template);
    return { message: 'Email template deleted successfully' };
  }

  async duplicateEmailTemplate(templateId: string, userId: string) {
    const originalTemplate = await this.getEmailTemplateById(templateId, userId);
    
    const { id, createdAt, updatedAt, ...templateData } = originalTemplate;
    
    const duplicatedTemplate = this.emailTemplateRepository.create({
      ...templateData,
      name: `${originalTemplate.name} (Copy)`,
      currentVersion: 1,
      createdById: userId,
    });

    return await this.emailTemplateRepository.save(duplicatedTemplate);
  }

  // Email Sending
  async sendTemplateEmail(
    templateId: string,
    recipientData: {
      email: string;
      personalData?: any;
    },
    userId: string,
    campaignId?: string
  ) {
    const template = await this.getEmailTemplateById(templateId, userId);
    
    // Personalize content
    const personalizedSubject = this.personalizeContent(
      template.subject,
      recipientData.personalData
    );
    const personalizedContent = this.personalizeContent(
      template.htmlContent,
      recipientData.personalData
    );

    let finalContent = personalizedContent;
    let campaignEmailId: string | undefined;

    // Add tracking if part of campaign
    if (campaignId) {
      const campaignEmail = this.campaignEmailRepository.create({
        campaignId,
        recipientEmail: recipientData.email,
        status: EmailStatus.SENT,
        subject: personalizedSubject,
        htmlContent: personalizedContent,
        textContent: template.textContent,
        sentAt: new Date(),
      });
      const savedCampaignEmail = await this.campaignEmailRepository.save(campaignEmail);
      campaignEmailId = savedCampaignEmail.id;
      
      finalContent = this.addEmailTracking(personalizedContent, campaignEmailId);
    }

    // Send email
    const result = await this.sendEmail({
      to: recipientData.email,
      subject: personalizedSubject,
      html: finalContent,
      text: template.textContent,
    });

    return {
      success: result.success,
      messageId: result.messageId,
      campaignEmailId,
    };
  }

  // Email Tracking
  async trackEmailOpen(campaignEmailId: string) {
    const campaignEmail = await this.campaignEmailRepository.findOne({
      where: { id: campaignEmailId },
    });

    if (campaignEmail && campaignEmail.status !== EmailStatus.OPENED) {
      campaignEmail.status = EmailStatus.OPENED;
      campaignEmail.openCount = (campaignEmail.openCount || 0) + 1;
      campaignEmail.firstOpenedAt = campaignEmail.firstOpenedAt || new Date();
      campaignEmail.openedAt = new Date();
      
      await this.campaignEmailRepository.save(campaignEmail);
    } else if (campaignEmail) {
      campaignEmail.openCount = (campaignEmail.openCount || 0) + 1;
      campaignEmail.openedAt = new Date();
      
      await this.campaignEmailRepository.save(campaignEmail);
    }

    // Return 1x1 transparent pixel
    return Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      'base64'
    );
  }

  async trackEmailClick(campaignEmailId: string, url: string) {
    const campaignEmail = await this.campaignEmailRepository.findOne({
      where: { id: campaignEmailId },
    });

    if (campaignEmail) {
      if (campaignEmail.status !== EmailStatus.CLICKED) {
        campaignEmail.status = EmailStatus.CLICKED;
        campaignEmail.firstClickedAt = campaignEmail.firstClickedAt || new Date();
      }
      campaignEmail.clickCount = (campaignEmail.clickCount || 0) + 1;
      campaignEmail.clickedAt = new Date();
      
      await this.campaignEmailRepository.save(campaignEmail);
    }

    // Redirect to original URL
    return { redirectUrl: url };
  }

  // Private helper methods
  private validateTemplateContent(templateData: Partial<EmailTemplate>) {
    if (!templateData.subject || templateData.subject.trim().length === 0) {
      throw new BadRequestException('Email subject is required');
    }

    if (!templateData.htmlContent || templateData.htmlContent.trim().length === 0) {
      throw new BadRequestException('Email content is required');
    }
  }

  private personalizeContent(content: string, data: any = {}): string {
    if (!content || !data) return content;
    
    let personalizedContent = content;
    
    // Replace variables in format {{variableName}}
    Object.keys(data).forEach(key => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      personalizedContent = personalizedContent.replace(regex, data[key] || '');
    });
    
    return personalizedContent;
  }

  private addEmailTracking(content: string, campaignEmailId: string): string {
    const baseUrl = this.configService.get('APP_URL') || 'http://localhost:3000';
    
    // Add open tracking pixel
    const trackingPixel = `<img src="${baseUrl}/api/crm/email/track/open/${campaignEmailId}" width="1" height="1" style="display:none;" />`;
    
    // Add tracking pixel before closing body tag
    return content.replace(/<\/body>/i, `${trackingPixel}</body>`);
  }

  // Missing methods for controller
  async previewEmailTemplate(templateId: string, personalData: any = {}, userId: string) {
    const template = await this.getEmailTemplateById(templateId, userId);
    
    const personalizedSubject = this.personalizeContent(template.subject, personalData);
    const personalizedContent = this.personalizeContent(template.htmlContent, personalData);
    
    return {
      subject: personalizedSubject,
      htmlContent: personalizedContent,
      textContent: template.textContent,
    };
  }

  async sendTestEmail(emailData: {
    templateId: string;
    testEmail: string;
    personalData?: any;
  }) {
    const template = await this.emailTemplateRepository.findOne({
      where: { id: emailData.templateId },
    });

    if (!template) {
      throw new NotFoundException('Email template not found');
    }

    const personalizedSubject = this.personalizeContent(template.subject, emailData.personalData);
    const personalizedContent = this.personalizeContent(template.htmlContent, emailData.personalData);

    return await this.sendEmail({
      to: emailData.testEmail,
      subject: `[TEST] ${personalizedSubject}`,
      html: personalizedContent,
      text: template.textContent,
    });
  }

  async sendBulkEmail(bulkEmailData: {
    templateId: string;
    recipients: Array<{ email: string; personalData?: any }>;
    campaignId?: string;
  }, userId: string) {
    const template = await this.getEmailTemplateById(bulkEmailData.templateId, userId);
    const results = [];

    for (const recipient of bulkEmailData.recipients) {
      try {
        const result = await this.sendTemplateEmail(
          bulkEmailData.templateId,
          recipient,
          userId,
          bulkEmailData.campaignId
        );
        results.push({ email: recipient.email, success: true, result });
      } catch (error) {
        results.push({ email: recipient.email, success: false, error: error.message });
      }
    }

    return {
      totalSent: results.filter(r => r.success).length,
      totalFailed: results.filter(r => !r.success).length,
      results,
    };
  }

  async getTemplateAnalytics(templateId: string, userId: string) {
    const template = await this.getEmailTemplateById(templateId, userId);
    
    // Get campaign emails for this template
    const campaignEmails = await this.campaignEmailRepository
      .createQueryBuilder('ce')
      .leftJoin('ce.campaign', 'c')
      .where('c.emailTemplateId = :templateId', { templateId })
      .getMany();

    const totalSent = campaignEmails.length;
    const totalOpened = campaignEmails.filter(ce => ce.openCount > 0).length;
    const totalClicked = campaignEmails.filter(ce => ce.clickCount > 0).length;

    return {
      templateId,
      templateName: template.name,
      totalSent,
      totalOpened,
      totalClicked,
      openRate: totalSent > 0 ? (totalOpened / totalSent) * 100 : 0,
      clickRate: totalSent > 0 ? (totalClicked / totalSent) * 100 : 0,
      clickThroughRate: totalOpened > 0 ? (totalClicked / totalOpened) * 100 : 0,
    };
  }

  private async sendEmail(emailData: {
    to: string;
    subject: string;
    html: string;
    text?: string;
  }): Promise<{ messageId: string; success: boolean }> {
    // Mock implementation
    console.log('Sending email to:', emailData.to);
    
    return {
      messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      success: true,
    };
  }

  async sendCampaignEmail(campaignEmail: any) {
    // Mock implementation for sending campaign emails
    console.log(`Sending campaign email to ${campaignEmail.recipientEmail}`);
    
    // In a real implementation, this would integrate with an email service provider
    // For now, we'll just simulate the email sending
    return {
      success: true,
      messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  }
}
