import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Lead } from './entities/lead.entity';
import { Campaign } from './entities/campaign.entity';
import { CampaignEmail } from './entities/campaign-email.entity';
import { LeadActivity } from './entities/lead-activity.entity';
import { CrmContact } from './entities/crm-contact.entity';
import { CrmDeal } from './entities/crm-deal.entity';
import { CrmTask } from './entities/crm-task.entity';
import { CrmNote } from './entities/crm-note.entity';
import { EmailTemplate } from './entities/email-template.entity';
import { CrmController } from './controllers/crm.controller';
import { CampaignController } from './controllers/campaign.controller';
import { LeadController } from './controllers/lead.controller';
import { EmailController } from './controllers/email.controller';
import { CrmService } from './services/crm.service';
import { CampaignService } from './services/campaign.service';
import { LeadService } from './services/lead.service';
import { EmailService } from './services/email.service';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([
      Lead,
      Campaign,
      CampaignEmail,
      LeadActivity,
      CrmContact,
      CrmDeal,
      CrmTask,
      CrmNote,
      EmailTemplate,
    ]),
  ],
  controllers: [
    CrmController,
    CampaignController,
    LeadController,
    EmailController,
  ],
  providers: [
    CrmService,
    CampaignService,
    LeadService,
    EmailService,
  ],
  exports: [
    CrmService,
    CampaignService,
    LeadService,
    EmailService,
  ],
})
export class CrmModule {}
