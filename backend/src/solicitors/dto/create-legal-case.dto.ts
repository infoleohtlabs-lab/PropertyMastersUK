import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsArray,
  IsNumber,
  IsEnum,
  IsBoolean,
  IsUUID,
  IsDateString,
  MinLength,
  MaxLength,
  Min,
  Max,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CaseType, CaseStatus, CasePriority } from '../entities/legal-case.entity';

export class CaseTaskDto {
  @ApiProperty({ description: 'Task title' })
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  title: string;

  @ApiProperty({ description: 'Task description', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({ description: 'Due date' })
  @IsDateString()
  dueDate: string;

  @ApiProperty({ description: 'Task priority' })
  @IsEnum(CasePriority)
  priority: CasePriority;

  @ApiProperty({ description: 'Assigned to user ID', required: false })
  @IsOptional()
  @IsUUID()
  assignedToId?: string;

  @ApiProperty({ description: 'Estimated hours', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  estimatedHours?: number;
}

export class CaseDocumentDto {
  @ApiProperty({ description: 'Document name' })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name: string;

  @ApiProperty({ description: 'Document category' })
  @IsEnum(['pleading', 'evidence', 'correspondence', 'court_order', 'contract', 'witness_statement', 'expert_report', 'other'])
  category: 'pleading' | 'evidence' | 'correspondence' | 'court_order' | 'contract' | 'witness_statement' | 'expert_report' | 'other';

  @ApiProperty({ description: 'Document description', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ description: 'Whether document is confidential' })
  @IsBoolean()
  isConfidential: boolean;

  @ApiProperty({ description: 'File path or URL', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  filePath?: string;

  @ApiProperty({ description: 'File size in bytes', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  fileSize?: number;

  @ApiProperty({ description: 'MIME type', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  mimeType?: string;
}

export class CommunicationLogDto {
  @ApiProperty({ description: 'Communication type' })
  @IsEnum(['email', 'phone', 'meeting', 'letter', 'video_call'])
  type: 'email' | 'phone' | 'meeting' | 'letter' | 'video_call';

  @ApiProperty({ description: 'Communication summary' })
  @IsString()
  @MinLength(5)
  @MaxLength(1000)
  summary: string;

  @ApiProperty({ description: 'Participants', isArray: true })
  @IsArray()
  @IsString({ each: true })
  participants: string[];

  @ApiProperty({ description: 'Duration in minutes', required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(600)
  durationMinutes?: number;

  @ApiProperty({ description: 'Follow-up required', required: false })
  @IsOptional()
  @IsBoolean()
  followUpRequired?: boolean;

  @ApiProperty({ description: 'Follow-up date', required: false })
  @IsOptional()
  @IsDateString()
  followUpDate?: string;
}

export class CreateLegalCaseDto {
  @ApiProperty({ description: 'Case title' })
  @IsString()
  @MinLength(5)
  @MaxLength(255)
  title: string;

  @ApiProperty({ description: 'Case description' })
  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  description: string;

  @ApiProperty({ description: 'Type of case', enum: CaseType })
  @IsEnum(CaseType)
  caseType: CaseType;

  @ApiProperty({ description: 'Case priority', enum: CasePriority })
  @IsEnum(CasePriority)
  priority: CasePriority;

  @ApiProperty({ description: 'Client user ID' })
  @IsUUID()
  clientId: string;

  @ApiProperty({ description: 'Assigned solicitor ID' })
  @IsUUID()
  solicitorId: string;

  @ApiProperty({ description: 'Opposing party name', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  opposingParty?: string;

  @ApiProperty({ description: 'Opposing party solicitor', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  opposingPartySolicitor?: string;

  @ApiProperty({ description: 'Court or tribunal name', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  court?: string;

  @ApiProperty({ description: 'Case number assigned by court', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  courtCaseNumber?: string;

  @ApiProperty({ description: 'Judge assigned to case', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  judge?: string;

  @ApiProperty({ description: 'Estimated case value', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  estimatedValue?: number;

  @ApiProperty({ description: 'Claim amount', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  claimAmount?: number;

  @ApiProperty({ description: 'Settlement amount', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  settlementAmount?: number;

  @ApiProperty({ description: 'Legal costs budget', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  legalCostsBudget?: number;

  @ApiProperty({ description: 'Hourly rate for this case', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(2000)
  hourlyRate?: number;

  @ApiProperty({ description: 'Estimated hours to complete', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1000)
  estimatedHours?: number;

  @ApiProperty({ description: 'Billing arrangement', required: false })
  @IsOptional()
  @IsEnum(['hourly', 'fixed_fee', 'conditional_fee', 'damages_based', 'legal_aid'])
  billingArrangement?: 'hourly' | 'fixed_fee' | 'conditional_fee' | 'damages_based' | 'legal_aid';

  @ApiProperty({ description: 'Target resolution date', required: false })
  @IsOptional()
  @IsDateString()
  targetResolutionDate?: string;

  @ApiProperty({ description: 'Statute of limitations date', required: false })
  @IsOptional()
  @IsDateString()
  statuteOfLimitationsDate?: string;

  @ApiProperty({ description: 'Next court date', required: false })
  @IsOptional()
  @IsDateString()
  nextCourtDate?: string;

  @ApiProperty({ description: 'Key milestones', required: false })
  @IsOptional()
  @IsArray()
  milestones?: {
    name: string;
    description?: string;
    targetDate?: string;
    priority: CasePriority;
  }[];

  @ApiProperty({ description: 'Risk factors', isArray: true, required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  riskFactors?: string[];

  @ApiProperty({ description: 'Success probability percentage', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  successProbability?: number;

  @ApiProperty({ description: 'Case strategy', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  strategy?: string;

  @ApiProperty({ description: 'Client objectives', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  clientObjectives?: string;

  @ApiProperty({ description: 'Legal precedents', isArray: true, required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  legalPrecedents?: string[];

  @ApiProperty({ description: 'Expert witnesses required', isArray: true, required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  expertWitnesses?: string[];

  @ApiProperty({ description: 'Key evidence', isArray: true, required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keyEvidence?: string[];

  @ApiProperty({ description: 'Disclosure requirements', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  disclosureRequirements?: string;

  @ApiProperty({ description: 'Settlement prospects', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  settlementProspects?: string;

  @ApiProperty({ description: 'Funding arrangements', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  fundingArrangements?: string;

  @ApiProperty({ description: 'Insurance coverage details', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  insuranceCoverage?: string;

  @ApiProperty({ description: 'Conflict of interest check completed' })
  @IsBoolean()
  conflictCheckCompleted: boolean;

  @ApiProperty({ description: 'Client care letter sent' })
  @IsBoolean()
  clientCareLetterSent: boolean;

  @ApiProperty({ description: 'Terms of business accepted' })
  @IsBoolean()
  termsOfBusinessAccepted: boolean;

  @ApiProperty({ description: 'Initial tasks', type: [CaseTaskDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CaseTaskDto)
  initialTasks?: CaseTaskDto[];

  @ApiProperty({ description: 'Initial documents', type: [CaseDocumentDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CaseDocumentDto)
  initialDocuments?: CaseDocumentDto[];

  @ApiProperty({ description: 'Initial communication log', type: [CommunicationLogDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CommunicationLogDto)
  initialCommunications?: CommunicationLogDto[];

  @ApiProperty({ description: 'Special instructions', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  specialInstructions?: string;

  @ApiProperty({ description: 'Urgency level', required: false })
  @IsOptional()
  @IsEnum(['standard', 'urgent', 'emergency'])
  urgencyLevel?: 'standard' | 'urgent' | 'emergency';

  @ApiProperty({ description: 'Client communication preferences', required: false })
  @IsOptional()
  @IsArray()
  @IsEnum(['email', 'phone', 'letter', 'video_call'], { each: true })
  clientCommunicationPreferences?: ('email' | 'phone' | 'letter' | 'video_call')[];

  @ApiProperty({ description: 'Case tags for categorization', isArray: true, required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ description: 'Related cases', isArray: true, required: false })
  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  relatedCases?: string[];

  @ApiProperty({ description: 'Case notes', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}
