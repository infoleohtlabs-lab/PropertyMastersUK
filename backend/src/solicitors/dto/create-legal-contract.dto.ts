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
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  ContractType,
  ContractStatus,
  PartyType,
  ClauseType,
  TerminationReason,
  RenewalType,
} from '../entities/legal-contract.entity';

export class ContractPartyDto {
  @ApiProperty({ description: 'Party type', enum: PartyType })
  @IsEnum(PartyType)
  partyType: PartyType;

  @ApiProperty({ description: 'Party name' })
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  name: string;

  @ApiProperty({ description: 'Party address' })
  @IsString()
  @MinLength(10)
  @MaxLength(500)
  address: string;

  @ApiProperty({ description: 'Contact person', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  contactPerson?: string;

  @ApiProperty({ description: 'Phone number', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;

  @ApiProperty({ description: 'Email address', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  email?: string;

  @ApiProperty({ description: 'Company registration number', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  companyRegistrationNumber?: string;

  @ApiProperty({ description: 'VAT number', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  vatNumber?: string;

  @ApiProperty({ description: 'Legal representative', required: false })
  @IsOptional()
  @IsObject()
  legalRepresentative?: {
    name: string;
    firm: string;
    address: string;
    phone?: string;
    email?: string;
  };

  @ApiProperty({ description: 'Signing authority', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  signingAuthority?: string;

  @ApiProperty({ description: 'Additional notes', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}

export class ContractClauseDto {
  @ApiProperty({ description: 'Clause type', enum: ClauseType })
  @IsEnum(ClauseType)
  clauseType: ClauseType;

  @ApiProperty({ description: 'Clause title' })
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  title: string;

  @ApiProperty({ description: 'Clause content' })
  @IsString()
  @MinLength(10)
  @MaxLength(5000)
  content: string;

  @ApiProperty({ description: 'Clause order/position' })
  @IsNumber()
  @Min(1)
  @Max(1000)
  order: number;

  @ApiProperty({ description: 'Is mandatory clause', required: false })
  @IsOptional()
  @IsBoolean()
  isMandatory?: boolean;

  @ApiProperty({ description: 'Is negotiable', required: false })
  @IsOptional()
  @IsBoolean()
  isNegotiable?: boolean;

  @ApiProperty({ description: 'Legal references', required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  legalReferences?: string[];

  @ApiProperty({ description: 'Cross-references to other clauses', required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  crossReferences?: string[];

  @ApiProperty({ description: 'Clause notes', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}

export class ContractAmendmentDto {
  @ApiProperty({ description: 'Amendment description' })
  @IsString()
  @MinLength(5)
  @MaxLength(1000)
  description: string;

  @ApiProperty({ description: 'Amendment reason' })
  @IsString()
  @MinLength(5)
  @MaxLength(500)
  reason: string;

  @ApiProperty({ description: 'Amended by user ID' })
  @IsUUID()
  amendedBy: string;

  @ApiProperty({ description: 'Amendment date' })
  @IsDateString()
  amendmentDate: string;

  @ApiProperty({ description: 'Effective date', required: false })
  @IsOptional()
  @IsDateString()
  effectiveDate?: string;

  @ApiProperty({ description: 'Approval required', required: false })
  @IsOptional()
  @IsBoolean()
  approvalRequired?: boolean;

  @ApiProperty({ description: 'Approved by', required: false })
  @IsOptional()
  @IsUUID()
  approvedBy?: string;

  @ApiProperty({ description: 'Approval date', required: false })
  @IsOptional()
  @IsDateString()
  approvalDate?: string;
}

export class ContractObligationDto {
  @ApiProperty({ description: 'Obligation description' })
  @IsString()
  @MinLength(5)
  @MaxLength(1000)
  description: string;

  @ApiProperty({ description: 'Responsible party' })
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  responsibleParty: string;

  @ApiProperty({ description: 'Due date', required: false })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiProperty({ description: 'Priority level' })
  @IsEnum(['low', 'medium', 'high', 'critical'])
  priority: 'low' | 'medium' | 'high' | 'critical';

  @ApiProperty({ description: 'Status' })
  @IsEnum(['pending', 'in_progress', 'completed', 'overdue', 'waived'])
  status: 'pending' | 'in_progress' | 'completed' | 'overdue' | 'waived';

  @ApiProperty({ description: 'Completion date', required: false })
  @IsOptional()
  @IsDateString()
  completionDate?: string;

  @ApiProperty({ description: 'Evidence of completion', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  evidenceOfCompletion?: string;

  @ApiProperty({ description: 'Penalty for non-compliance', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  penaltyForNonCompliance?: string;

  @ApiProperty({ description: 'Notes', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}

export class CreateLegalContractDto {
  @ApiProperty({ description: 'Contract type', enum: ContractType })
  @IsEnum(ContractType)
  contractType: ContractType;

  @ApiProperty({ description: 'Contract title' })
  @IsString()
  @MinLength(5)
  @MaxLength(255)
  title: string;

  @ApiProperty({ description: 'Contract description', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({ description: 'Client user ID' })
  @IsUUID()
  clientId: string;

  @ApiProperty({ description: 'Assigned solicitor ID' })
  @IsUUID()
  solicitorId: string;

  @ApiProperty({ description: 'Contract parties', type: [ContractPartyDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContractPartyDto)
  parties: ContractPartyDto[];

  @ApiProperty({ description: 'Contract value', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1000000000)
  contractValue?: number;

  @ApiProperty({ description: 'Currency', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(3)
  currency?: string;

  @ApiProperty({ description: 'Start date' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ description: 'End date', required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ description: 'Duration in months', required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(1200)
  durationMonths?: number;

  @ApiProperty({ description: 'Notice period in days', required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(365)
  noticePeriodDays?: number;

  @ApiProperty({ description: 'Auto-renewal', required: false })
  @IsOptional()
  @IsBoolean()
  autoRenewal?: boolean;

  @ApiProperty({ description: 'Renewal type', enum: RenewalType, required: false })
  @IsOptional()
  @IsEnum(RenewalType)
  renewalType?: RenewalType;

  @ApiProperty({ description: 'Renewal terms', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  renewalTerms?: string;

  @ApiProperty({ description: 'Contract clauses', type: [ContractClauseDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContractClauseDto)
  clauses?: ContractClauseDto[];

  @ApiProperty({ description: 'Contract obligations', type: [ContractObligationDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContractObligationDto)
  obligations?: ContractObligationDto[];

  @ApiProperty({ description: 'Governing law', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  governingLaw?: string;

  @ApiProperty({ description: 'Jurisdiction', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  jurisdiction?: string;

  @ApiProperty({ description: 'Dispute resolution method', required: false })
  @IsOptional()
  @IsEnum(['litigation', 'arbitration', 'mediation', 'expert_determination'])
  disputeResolutionMethod?: 'litigation' | 'arbitration' | 'mediation' | 'expert_determination';

  @ApiProperty({ description: 'Arbitration rules', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  arbitrationRules?: string;

  @ApiProperty({ description: 'Confidentiality required', required: false })
  @IsOptional()
  @IsBoolean()
  confidentialityRequired?: boolean;

  @ApiProperty({ description: 'Confidentiality terms', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  confidentialityTerms?: string;

  @ApiProperty({ description: 'Intellectual property terms', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  intellectualPropertyTerms?: string;

  @ApiProperty({ description: 'Data protection terms', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  dataProtectionTerms?: string;

  @ApiProperty({ description: 'Force majeure clause', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  forceMajeureClause?: string;

  @ApiProperty({ description: 'Limitation of liability', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  limitationOfLiability?: string;

  @ApiProperty({ description: 'Indemnity provisions', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  indemnityProvisions?: string;

  @ApiProperty({ description: 'Insurance requirements', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  insuranceRequirements?: string;

  @ApiProperty({ description: 'Compliance requirements', required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  complianceRequirements?: string[];

  @ApiProperty({ description: 'Regulatory approvals required', required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  regulatoryApprovalsRequired?: string[];

  @ApiProperty({ description: 'Key performance indicators', required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keyPerformanceIndicators?: string[];

  @ApiProperty({ description: 'Service level agreements', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  serviceLevelAgreements?: string;

  @ApiProperty({ description: 'Payment terms', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  paymentTerms?: string;

  @ApiProperty({ description: 'Delivery terms', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  deliveryTerms?: string;

  @ApiProperty({ description: 'Acceptance criteria', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  acceptanceCriteria?: string;

  @ApiProperty({ description: 'Warranty provisions', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  warrantyProvisions?: string;

  @ApiProperty({ description: 'Support and maintenance terms', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  supportMaintenanceTerms?: string;

  @ApiProperty({ description: 'Change management process', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  changeManagementProcess?: string;

  @ApiProperty({ description: 'Risk allocation', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  riskAllocation?: string;

  @ApiProperty({ description: 'Escalation procedures', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  escalationProcedures?: string;

  @ApiProperty({ description: 'Communication protocols', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  communicationProtocols?: string;

  @ApiProperty({ description: 'Reporting requirements', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  reportingRequirements?: string;

  @ApiProperty({ description: 'Audit rights', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  auditRights?: string;

  @ApiProperty({ description: 'Subcontracting terms', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  subcontractingTerms?: string;

  @ApiProperty({ description: 'Assignment and novation terms', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  assignmentNovationTerms?: string;

  @ApiProperty({ description: 'Entire agreement clause', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  entireAgreementClause?: string;

  @ApiProperty({ description: 'Severability clause', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  severabilityClause?: string;

  @ApiProperty({ description: 'Waiver provisions', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  waiverProvisions?: string;

  @ApiProperty({ description: 'Amendment procedures', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  amendmentProcedures?: string;

  @ApiProperty({ description: 'Execution requirements', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  executionRequirements?: string;

  @ApiProperty({ description: 'Counterpart execution allowed', required: false })
  @IsOptional()
  @IsBoolean()
  counterpartExecutionAllowed?: boolean;

  @ApiProperty({ description: 'Electronic signature allowed', required: false })
  @IsOptional()
  @IsBoolean()
  electronicSignatureAllowed?: boolean;

  @ApiProperty({ description: 'Witness requirements', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  witnessRequirements?: string;

  @ApiProperty({ description: 'Notarization required', required: false })
  @IsOptional()
  @IsBoolean()
  notarizationRequired?: boolean;

  @ApiProperty({ description: 'Registration requirements', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  registrationRequirements?: string;

  @ApiProperty({ description: 'Special conditions', required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specialConditions?: string[];

  @ApiProperty({ description: 'Precedent conditions', required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  precedentConditions?: string[];

  @ApiProperty({ description: 'Subsequent conditions', required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  subsequentConditions?: string[];

  @ApiProperty({ description: 'Suspensive conditions', required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  suspensiveConditions?: string[];

  @ApiProperty({ description: 'Resolutive conditions', required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  resolutiveConditions?: string[];

  @ApiProperty({ description: 'Priority level' })
  @IsEnum(['low', 'medium', 'high', 'critical'])
  priority: 'low' | 'medium' | 'high' | 'critical';

  @ApiProperty({ description: 'Urgency level' })
  @IsEnum(['standard', 'urgent', 'emergency'])
  urgency: 'standard' | 'urgent' | 'emergency';

  @ApiProperty({ description: 'Complexity level' })
  @IsEnum(['simple', 'moderate', 'complex', 'highly_complex'])
  complexity: 'simple' | 'moderate' | 'complex' | 'highly_complex';

  @ApiProperty({ description: 'Risk level' })
  @IsEnum(['low', 'medium', 'high', 'critical'])
  riskLevel: 'low' | 'medium' | 'high' | 'critical';

  @ApiProperty({ description: 'Internal notes', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;

  @ApiProperty({ description: 'Client instructions', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  clientInstructions?: string;

  @ApiProperty({ description: 'Legal advice provided', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  legalAdviceProvided?: string;

  @ApiProperty({ description: 'Recommendations', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  recommendations?: string;

  @ApiProperty({ description: 'Next steps', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  nextSteps?: string;

  @ApiProperty({ description: 'Follow-up required', required: false })
  @IsOptional()
  @IsBoolean()
  followUpRequired?: boolean;

  @ApiProperty({ description: 'Follow-up date', required: false })
  @IsOptional()
  @IsDateString()
  followUpDate?: string;

  @ApiProperty({ description: 'Review date', required: false })
  @IsOptional()
  @IsDateString()
  reviewDate?: string;

  @ApiProperty({ description: 'Billing arrangement', required: false })
  @IsOptional()
  @IsEnum(['hourly', 'fixed_fee', 'contingency', 'retainer', 'capped_fee'])
  billingArrangement?: 'hourly' | 'fixed_fee' | 'contingency' | 'retainer' | 'capped_fee';

  @ApiProperty({ description: 'Estimated legal costs', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  estimatedLegalCosts?: number;

  @ApiProperty({ description: 'Cost cap', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  costCap?: number;

  @ApiProperty({ description: 'Disbursements estimate', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  disbursementsEstimate?: number;

  @ApiProperty({ description: 'VAT applicable', required: false })
  @IsOptional()
  @IsBoolean()
  vatApplicable?: boolean;

  @ApiProperty({ description: 'Client care letter sent', required: false })
  @IsOptional()
  @IsBoolean()
  clientCareLetterSent?: boolean;

  @ApiProperty({ description: 'Terms of business accepted', required: false })
  @IsOptional()
  @IsBoolean()
  termsOfBusinessAccepted?: boolean;

  @ApiProperty({ description: 'Conflict check completed', required: false })
  @IsOptional()
  @IsBoolean()
  conflictCheckCompleted?: boolean;

  @ApiProperty({ description: 'Money laundering checks completed', required: false })
  @IsOptional()
  @IsBoolean()
  moneyLaunderingChecksCompleted?: boolean;

  @ApiProperty({ description: 'Source of funds verified', required: false })
  @IsOptional()
  @IsBoolean()
  sourceOfFundsVerified?: boolean;

  @ApiProperty({ description: 'Client identity verified', required: false })
  @IsOptional()
  @IsBoolean()
  clientIdentityVerified?: boolean;

  @ApiProperty({ description: 'Professional indemnity insurance confirmed', required: false })
  @IsOptional()
  @IsBoolean()
  professionalIndemnityInsuranceConfirmed?: boolean;

  @ApiProperty({ description: 'File opened date' })
  @IsDateString()
  fileOpenedDate: string;

  @ApiProperty({ description: 'Target completion date', required: false })
  @IsOptional()
  @IsDateString()
  targetCompletionDate?: string;

  @ApiProperty({ description: 'Matter reference', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  matterReference?: string;

  @ApiProperty({ description: 'Client reference', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  clientReference?: string;

  @ApiProperty({ description: 'Third party references', required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  thirdPartyReferences?: string[];
}
