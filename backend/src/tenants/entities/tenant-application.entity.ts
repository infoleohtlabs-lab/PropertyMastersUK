import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Tenant } from './tenant.entity';
import { Property } from '../../properties/entities/property.entity';

export enum ApplicationStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  PENDING_DOCUMENTS = 'pending_documents',
  PENDING_REFERENCES = 'pending_references',
  PENDING_CREDIT_CHECK = 'pending_credit_check',
  APPROVED = 'approved',
  CONDITIONALLY_APPROVED = 'conditionally_approved',
  REJECTED = 'rejected',
  WITHDRAWN = 'withdrawn',
  EXPIRED = 'expired',
}

export enum ApplicationType {
  INDIVIDUAL = 'individual',
  JOINT = 'joint',
  CORPORATE = 'corporate',
  GUARANTOR_BACKED = 'guarantor_backed',
}

export enum ApplicationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum RejectionReason {
  INSUFFICIENT_INCOME = 'insufficient_income',
  POOR_CREDIT_HISTORY = 'poor_credit_history',
  INADEQUATE_REFERENCES = 'inadequate_references',
  FAILED_RIGHT_TO_RENT = 'failed_right_to_rent',
  INCOMPLETE_APPLICATION = 'incomplete_application',
  PROPERTY_NO_LONGER_AVAILABLE = 'property_no_longer_available',
  BETTER_APPLICANT_SELECTED = 'better_applicant_selected',
  LANDLORD_DECISION = 'landlord_decision',
  OTHER = 'other',
}

@Entity('tenant_applications')
@Index(['tenantId'])
@Index(['propertyId'])
@Index(['status'])
@Index(['submittedDate'])
export class TenantApplication {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @ManyToOne(() => Tenant, (tenant) => tenant.applications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ name: 'property_id' })
  propertyId: string;

  @ManyToOne(() => Property, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'property_id' })
  property: Property;

  // Application Basic Information
  @Column({
    type: 'varchar',
    
    default: ApplicationStatus.DRAFT,
  })
  status: ApplicationStatus;

  @Column({
    type: 'varchar',
    
    default: ApplicationType.INDIVIDUAL,
  })
  applicationType: ApplicationType;

  @Column({
    type: 'varchar',
    
    default: ApplicationPriority.NORMAL,
  })
  priority: ApplicationPriority;

  @Column({ length: 100, nullable: true })
  applicationReference?: string;

  // Application Dates
  @Column({ type: 'datetime', nullable: true })
  submittedDate?: Date;

  @Column({ type: 'datetime', nullable: true })
  reviewStartDate?: Date;

  @Column({ type: 'datetime', nullable: true })
  reviewCompletedDate?: Date;

  @Column({ type: 'datetime', nullable: true })
  approvalDate?: Date;

  @Column({ type: 'datetime', nullable: true })
  rejectionDate?: Date;

  @Column({ type: 'datetime', nullable: true })
  withdrawalDate?: Date;

  @Column({ type: 'datetime', nullable: true })
  expiryDate?: Date;

  // Tenancy Details
  @Column({ type: 'date' })
  proposedStartDate: Date;

  @Column({ type: 'date', nullable: true })
  proposedEndDate?: Date;

  @Column({ type: 'int', default: 12 })
  proposedTenancyLengthMonths: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  proposedRentAmount: number;

  @Column({ length: 20, default: 'monthly' })
  rentFrequency: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  proposedDepositAmount?: number;

  @Column({ type: 'boolean', default: false })
  isPetFriendly: boolean;

  @Column({ type: 'boolean', default: false })
  isFurnished: boolean;

  // Applicant Details
  @Column({ type: 'int', default: 1 })
  numberOfApplicants: number;

  @Column({ type: 'int', default: 0 })
  numberOfDependents: number;

  @Column({ type: 'int', default: 0 })
  numberOfPets: number;

  @Column({ length: 500, nullable: true })
  petDetails?: string;

  @Column({ type: 'int', default: 0 })
  numberOfVehicles: number;

  @Column({ length: 500, nullable: true })
  vehicleDetails?: string;

  // Financial Information
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalHouseholdIncome: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  totalMonthlyExpenses?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  availableDeposit?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  creditScore?: number;

  @Column({ type: 'boolean', default: false })
  hasGuarantor: boolean;

  @Column({ length: 500, nullable: true })
  guarantorDetails?: string;

  // Employment Information
  @Column({ length: 100, nullable: true })
  primaryEmploymentStatus?: string;

  @Column({ length: 255, nullable: true })
  primaryEmployerName?: string;

  @Column({ length: 100, nullable: true })
  primaryJobTitle?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  primaryIncome?: number;

  @Column({ type: 'date', nullable: true })
  primaryEmploymentStartDate?: Date;

  // Previous Rental History
  @Column({ type: 'boolean', default: false })
  isFirstTimeRenter: boolean;

  @Column({ length: 255, nullable: true })
  currentLandlordName?: string;

  @Column({ length: 20, nullable: true })
  currentLandlordPhone?: string;

  @Column({ length: 255, nullable: true })
  currentLandlordEmail?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  currentRentAmount?: number;

  @Column({ type: 'date', nullable: true })
  currentTenancyStartDate?: Date;

  @Column({ length: 500, nullable: true })
  reasonForMoving?: string;

  // References
  @Column({ type: 'int', default: 0 })
  numberOfReferences: number;

  @Column({ type: 'boolean', default: false })
  hasEmployerReference: boolean;

  @Column({ type: 'boolean', default: false })
  hasLandlordReference: boolean;

  @Column({ type: 'boolean', default: false })
  hasPersonalReference: boolean;

  @Column({ type: 'boolean', default: false })
  hasCharacterReference: boolean;

  // Document Checklist
  @Column({ type: 'boolean', default: false })
  hasIdentityDocument: boolean;

  @Column({ type: 'boolean', default: false })
  hasProofOfIncome: boolean;

  @Column({ type: 'boolean', default: false })
  hasBankStatements: boolean;

  @Column({ type: 'boolean', default: false })
  hasEmploymentContract: boolean;

  @Column({ type: 'boolean', default: false })
  hasRightToRentDocument: boolean;

  @Column({ type: 'boolean', default: false })
  hasPreviousLandlordReference: boolean;

  @Column({ type: 'boolean', default: false })
  hasGuarantorDocuments: boolean;

  // Verification Status
  @Column({ type: 'boolean', default: false })
  isIdentityVerified: boolean;

  @Column({ type: 'boolean', default: false })
  isIncomeVerified: boolean;

  @Column({ type: 'boolean', default: false })
  isEmploymentVerified: boolean;

  @Column({ type: 'boolean', default: false })
  isCreditCheckCompleted: boolean;

  @Column({ type: 'boolean', default: false })
  areReferencesVerified: boolean;

  @Column({ type: 'boolean', default: false })
  isRightToRentVerified: boolean;

  @Column({ type: 'datetime', nullable: true })
  identityVerifiedDate?: Date;

  @Column({ type: 'datetime', nullable: true })
  incomeVerifiedDate?: Date;

  @Column({ type: 'datetime', nullable: true })
  employmentVerifiedDate?: Date;

  @Column({ type: 'datetime', nullable: true })
  creditCheckDate?: Date;

  @Column({ type: 'datetime', nullable: true })
  referencesVerifiedDate?: Date;

  @Column({ type: 'datetime', nullable: true })
  rightToRentVerifiedDate?: Date;

  // Decision Information
  @Column({ length: 100, nullable: true })
  reviewedBy?: string;

  @Column({ length: 100, nullable: true })
  approvedBy?: string;

  @Column({ length: 100, nullable: true })
  rejectedBy?: string;

  @Column({
    type: 'varchar',
    
    nullable: true,
  })
  rejectionReason?: RejectionReason;

  @Column({ length: 1000, nullable: true })
  rejectionNotes?: string;

  @Column({ length: 1000, nullable: true })
  approvalConditions?: string;

  @Column({ length: 1000, nullable: true })
  internalNotes?: string;

  // Communication
  @Column({ type: 'boolean', default: false })
  applicantNotified: boolean;

  @Column({ type: 'datetime', nullable: true })
  applicantNotifiedDate?: Date;

  @Column({ length: 50, nullable: true })
  notificationMethod?: string;

  @Column({ type: 'boolean', default: false })
  landlordNotified: boolean;

  @Column({ type: 'datetime', nullable: true })
  landlordNotifiedDate?: Date;

  // Scoring and Ranking
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  applicationScore?: number;

  @Column({ type: 'int', nullable: true })
  applicationRank?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  incomeToRentRatio?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  affordabilityScore?: number;



  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  referenceScore?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  overallRiskScore?: number;

  // Fees and Costs
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  applicationFee?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  creditCheckFee?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  referenceFee?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  adminFee?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  totalFees?: number;

  @Column({ type: 'boolean', default: false })
  feesReceived: boolean;

  @Column({ type: 'datetime', nullable: true })
  feesReceivedDate?: Date;

  // Special Circumstances
  @Column({ type: 'boolean', default: false })
  hasSpecialCircumstances: boolean;

  @Column({ length: 1000, nullable: true })
  specialCircumstancesDetails?: string;

  @Column({ type: 'boolean', default: false })
  requiresAccessibilityFeatures: boolean;

  @Column({ length: 500, nullable: true })
  accessibilityRequirements?: string;

  @Column({ type: 'boolean', default: false })
  hasLegalRestrictions: boolean;

  @Column({ length: 500, nullable: true })
  legalRestrictionsDetails?: string;

  // Competitive Information
  @Column({ type: 'int', nullable: true })
  numberOfCompetingApplications?: number;

  @Column({ type: 'boolean', default: false })
  isPreferredApplicant: boolean;

  @Column({ length: 500, nullable: true })
  preferredApplicantReason?: string;

  @Column({ type: 'boolean', default: false })
  hasViewedProperty: boolean;

  @Column({ type: 'datetime', nullable: true })
  propertyViewedDate?: Date;

  @Column({ type: 'int', nullable: true, default: 0 })
  numberOfPropertyViews: number;

  // Follow-up and Actions
  @Column({ type: 'datetime', nullable: true })
  nextFollowUpDate?: Date;

  @Column({ length: 500, nullable: true })
  nextFollowUpAction?: string;

  @Column({ length: 100, nullable: true })
  assignedTo?: string;

  @Column({ type: 'boolean', default: false })
  requiresManagerApproval: boolean;

  @Column({ type: 'boolean', default: false })
  managerApprovalReceived: boolean;

  @Column({ type: 'datetime', nullable: true })
  managerApprovalDate?: Date;

  @Column({ length: 100, nullable: true })
  managerApprovedBy?: string;

  // System and Metadata
  @Column({ type: 'json', nullable: true })
  applicationData?: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  verificationResults?: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  scoringBreakdown?: Record<string, any>;

  @Column({ length: 100, nullable: true })
  sourceSystem?: string;

  @Column({ length: 255, nullable: true })
  externalReference?: string;

  @Column({ length: 100, nullable: true })
  createdBy?: string;

  @Column({ length: 100, nullable: true })
  updatedBy?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
