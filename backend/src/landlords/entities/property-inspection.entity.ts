import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Landlord } from './landlord.entity';
import { LandlordProperty } from './landlord-property.entity';
import { User } from '../../users/entities/user.entity';

export enum InspectionType {
  ROUTINE = 'routine',
  MOVE_IN = 'move_in',
  MOVE_OUT = 'move_out',
  MID_TENANCY = 'mid_tenancy',
  MAINTENANCE = 'maintenance',
  COMPLIANCE = 'compliance',
  INSURANCE = 'insurance',
  SAFETY = 'safety',
  INVENTORY = 'inventory',
  DAMAGE_ASSESSMENT = 'damage_assessment',
}

export enum InspectionStatus {
  SCHEDULED = 'scheduled',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  RESCHEDULED = 'rescheduled',
  NO_ACCESS = 'no_access',
  POSTPONED = 'postponed',
}

export enum InspectionOutcome {
  SATISFACTORY = 'satisfactory',
  MINOR_ISSUES = 'minor_issues',
  MAJOR_ISSUES = 'major_issues',
  URGENT_ACTION_REQUIRED = 'urgent_action_required',
  BREACH_OF_TENANCY = 'breach_of_tenancy',
  EXCELLENT_CONDITION = 'excellent_condition',
}

export enum RoomCondition {
  EXCELLENT = 'excellent',
  GOOD = 'good',
  FAIR = 'fair',
  POOR = 'poor',
  DAMAGED = 'damaged',
  REQUIRES_ATTENTION = 'requires_attention',
}

@Entity('property_inspections')
export class PropertyInspection {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column('uuid')
  landlordId: string;

  @ManyToOne(() => Landlord, landlord => landlord.inspections)
  @JoinColumn({ name: 'landlordId' })
  landlord: Landlord;

  @ApiProperty()
  @Column('uuid')
  propertyId: string;

  @ManyToOne(() => LandlordProperty, property => property.inspections)
  @JoinColumn({ name: 'propertyId' })
  property: LandlordProperty;

  @ApiProperty()
  @Column('uuid', { nullable: true })
  inspectorId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'inspectorId' })
  inspector: User;

  @ApiProperty()
  @Column({ nullable: true })
  inspectionReference: string;

  @ApiProperty({ enum: InspectionType })
  @Column({
    type: 'varchar',
    
  })
  inspectionType: InspectionType;

  @ApiProperty({ enum: InspectionStatus })
  @Column({
    type: 'varchar',
    
    default: InspectionStatus.SCHEDULED,
  })
  status: InspectionStatus;

  @ApiProperty({ enum: InspectionOutcome })
  @Column({
    type: 'varchar',
    
    nullable: true,
  })
  outcome: InspectionOutcome;

  // Scheduling Information
  @ApiProperty()
  @Column()
  scheduledDate: Date;

  @ApiProperty()
  @Column({ nullable: true })
  scheduledTime: string;

  @ApiProperty()
  @Column({ nullable: true })
  actualDate: Date;

  @ApiProperty()
  @Column({ nullable: true })
  actualStartTime: string;

  @ApiProperty()
  @Column({ nullable: true })
  actualEndTime: string;

  @ApiProperty()
  @Column({ nullable: true })
  duration: number; // Minutes

  // Access and Attendance
  @ApiProperty()
  @Column({ default: false })
  tenantPresent: boolean;

  @ApiProperty()
  @Column('simple-array', { nullable: true })
  attendees: string[]; // Names of people present

  @ApiProperty()
  @Column({ nullable: true })
  accessMethod: string; // Key, tenant let in, etc.

  @ApiProperty()
  @Column({ default: false })
  accessIssues: boolean;

  @ApiProperty()
  @Column('text', { nullable: true })
  accessNotes: string;

  // Inspector Information
  @ApiProperty()
  @Column({ nullable: true })
  inspectorName: string;

  @ApiProperty()
  @Column({ nullable: true })
  inspectorCompany: string;

  @ApiProperty()
  @Column({ nullable: true })
  inspectorPhone: string;

  @ApiProperty()
  @Column({ nullable: true })
  inspectorEmail: string;

  @ApiProperty()
  @Column({ default: false })
  isExternalInspector: boolean;

  // Overall Assessment
  @ApiProperty()
  @Column({ nullable: true })
  overallConditionRating: number; // 1-10 scale

  @ApiProperty()
  @Column({ nullable: true })
  cleanlinessRating: number; // 1-10 scale

  @ApiProperty()
  @Column({ nullable: true })
  maintenanceRating: number; // 1-10 scale

  @ApiProperty()
  @Column('text', { nullable: true })
  generalComments: string;

  @ApiProperty()
  @Column('text', { nullable: true })
  improvementsNeeded: string;

  @ApiProperty()
  @Column('text', { nullable: true })
  positiveObservations: string;

  // Room-by-Room Assessment
  @ApiProperty()
  @Column('json', { nullable: true })
  roomAssessments: {
    roomName: string;
    condition: RoomCondition;
    rating: number;
    issues: string[];
    photos: string[];
    notes: string;
  }[];

  // Specific Checks
  @ApiProperty()
  @Column('json', { nullable: true })
  safetyChecks: {
    smokeAlarms: boolean;
    carbonMonoxideAlarms: boolean;
    fireExtinguisher: boolean;
    emergencyLighting: boolean;
    gasAppliances: boolean;
    electricalSafety: boolean;
    windowLocks: boolean;
    doorLocks: boolean;
    notes: string;
  };

  @ApiProperty()
  @Column('json', { nullable: true })
  applianceChecks: {
    applianceName: string;
    working: boolean;
    condition: RoomCondition;
    lastServiced: Date;
    issues: string;
    requiresService: boolean;
  }[];

  @ApiProperty()
  @Column('json', { nullable: true })
  utilityChecks: {
    heating: boolean;
    hotWater: boolean;
    coldWater: boolean;
    electricity: boolean;
    gas: boolean;
    internet: boolean;
    notes: string;
  };

  // Issues and Actions
  @ApiProperty()
  @Column('json', { nullable: true })
  issuesFound: {
    category: string;
    severity: 'low' | 'medium' | 'high' | 'urgent';
    description: string;
    location: string;
    photos: string[];
    actionRequired: string;
    estimatedCost: number;
    priority: number;
    targetDate: Date;
  }[];

  @ApiProperty()
  @Column('json', { nullable: true })
  maintenanceRequired: {
    item: string;
    urgency: 'immediate' | 'within_week' | 'within_month' | 'routine';
    description: string;
    estimatedCost: number;
    contractorRequired: boolean;
    scheduledDate: Date;
  }[];

  @ApiProperty()
  @Column('json', { nullable: true })
  complianceIssues: {
    requirement: string;
    compliant: boolean;
    expiryDate: Date;
    actionRequired: string;
    deadline: Date;
  }[];

  // Inventory and Condition
  @ApiProperty()
  @Column('json', { nullable: true })
  inventoryCheck: {
    item: string;
    present: boolean;
    condition: RoomCondition;
    notes: string;
    replacementNeeded: boolean;
  }[];

  @ApiProperty()
  @Column('json', { nullable: true })
  damageAssessment: {
    location: string;
    damageType: string;
    severity: 'minor' | 'moderate' | 'major' | 'severe';
    cause: string;
    tenantResponsible: boolean;
    repairCost: number;
    photos: string[];
    notes: string;
  }[];

  // Documentation
  @ApiProperty()
  @Column('simple-array', { nullable: true })
  photos: string[];

  @ApiProperty()
  @Column('simple-array', { nullable: true })
  documents: string[];

  @ApiProperty()
  @Column({ nullable: true })
  reportUrl: string;

  @ApiProperty()
  @Column({ nullable: true })
  certificateUrl: string;

  @ApiProperty()
  @Column({ default: false })
  reportGenerated: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  reportGeneratedDate: Date;

  // Follow-up and Actions
  @ApiProperty()
  @Column({ default: false })
  requiresFollowUp: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  followUpDate: Date;

  @ApiProperty()
  @Column({ nullable: true })
  followUpReason: string;

  @ApiProperty()
  @Column({ default: false })
  actionPlanCreated: boolean;

  @ApiProperty()
  @Column('simple-array', { nullable: true })
  actionItems: string[];

  @ApiProperty()
  @Column({ nullable: true })
  nextInspectionDate: Date;

  // Communication
  @ApiProperty()
  @Column({ default: false })
  tenantNotified: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  tenantNotificationDate: Date;

  @ApiProperty()
  @Column({ default: false })
  landlordNotified: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  landlordNotificationDate: Date;

  @ApiProperty()
  @Column({ default: false })
  reportShared: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  reportSharedDate: Date;

  // Weather and External Factors
  @ApiProperty()
  @Column({ nullable: true })
  weatherConditions: string;

  @ApiProperty()
  @Column({ nullable: true })
  temperature: number;

  @ApiProperty()
  @Column('text', { nullable: true })
  externalFactors: string;

  // Quality and Satisfaction
  @ApiProperty()
  @Column({ nullable: true })
  tenantSatisfaction: number; // 1-5 rating

  @ApiProperty()
  @Column({ nullable: true })
  landlordSatisfaction: number; // 1-5 rating

  @ApiProperty()
  @Column('text', { nullable: true })
  tenantFeedback: string;

  @ApiProperty()
  @Column('text', { nullable: true })
  landlordFeedback: string;

  // Legal and Compliance
  @ApiProperty()
  @Column({ default: false })
  legalIssuesFound: boolean;

  @ApiProperty()
  @Column('text', { nullable: true })
  legalIssueDetails: string;

  @ApiProperty()
  @Column({ default: false })
  breachOfTenancy: boolean;

  @ApiProperty()
  @Column('text', { nullable: true })
  breachDetails: string;

  @ApiProperty()
  @Column({ default: false })
  authoritiesNotified: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  authorityReference: string;

  // Costs and Billing
  @ApiProperty()
  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  inspectionCost: number;

  @ApiProperty()
  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  estimatedRepairCosts: number;

  @ApiProperty()
  @Column({ default: false })
  chargeableTenant: boolean;

  @ApiProperty()
  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  tenantCharges: number;

  @ApiProperty()
  @Column({ nullable: true })
  invoiceReference: string;

  // Cancellation and Rescheduling
  @ApiProperty()
  @Column({ nullable: true })
  cancellationReason: string;

  @ApiProperty()
  @Column({ nullable: true })
  cancellationDate: Date;

  @ApiProperty()
  @Column({ nullable: true })
  rescheduledFrom: Date;

  @ApiProperty()
  @Column({ nullable: true })
  rescheduledReason: string;

  @ApiProperty()
  @Column({ default: 0 })
  rescheduledCount: number;

  @ApiProperty()
  @Column('text', { nullable: true })
  internalNotes: string;

  @ApiProperty()
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
