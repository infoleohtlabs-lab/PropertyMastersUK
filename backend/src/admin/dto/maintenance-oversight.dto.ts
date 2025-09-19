import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsOptional,
  IsDateString,
  IsNumber,
  IsBoolean,
  IsArray,
  IsObject,
  ValidateNested,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

// Enums
export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  ON_HOLD = 'on_hold',
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum ScheduleFrequency {
  HOURLY = 'hourly',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
}

export enum HealthStatus {
  HEALTHY = 'healthy',
  WARNING = 'warning',
  CRITICAL = 'critical',
  UNKNOWN = 'unknown',
}

export enum AlertSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum AlertStatus {
  ACTIVE = 'active',
  ACKNOWLEDGED = 'acknowledged',
  RESOLVED = 'resolved',
  SUPPRESSED = 'suppressed',
}

export enum UpdateStatus {
  PENDING = 'pending',
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  APPLIED = 'applied',
  FAILED = 'failed',
  ROLLED_BACK = 'rolled_back',
}

// DTOs
export class MaintenanceTaskDto {
  @ApiProperty({ description: 'Task title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Task description' })
  @IsString()
  description: string;

  @ApiProperty({ enum: TaskPriority, description: 'Task priority' })
  @IsEnum(TaskPriority)
  priority: TaskPriority;

  @ApiProperty({ description: 'Assigned user ID' })
  @IsString()
  assignedTo: string;

  @ApiProperty({ description: 'Due date' })
  @IsDateString()
  dueDate: Date;

  @ApiProperty({ description: 'Estimated duration in minutes' })
  @IsNumber()
  @Min(1)
  estimatedDuration: number;

  @ApiPropertyOptional({ description: 'Actual duration in minutes' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  actualDuration?: number;

  @ApiProperty({ description: 'Task category' })
  @IsString()
  category: string;

  @ApiPropertyOptional({ description: 'Task tags', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Task dependencies', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  dependencies?: string[];

  @ApiPropertyOptional({ description: 'File attachments', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[];

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class MaintenanceTaskResponseDto extends MaintenanceTaskDto {
  @ApiProperty({ description: 'Task ID' })
  id: string;

  @ApiProperty({ enum: TaskStatus, description: 'Task status' })
  status: TaskStatus;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  updatedAt: Date;
}

export class MaintenanceScheduleDto {
  @ApiProperty({ description: 'Schedule name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Schedule description' })
  @IsString()
  description: string;

  @ApiProperty({ enum: ScheduleFrequency, description: 'Schedule frequency' })
  @IsEnum(ScheduleFrequency)
  frequency: ScheduleFrequency;

  @ApiProperty({ description: 'Next run date' })
  @IsDateString()
  nextRun: Date;

  @ApiPropertyOptional({ description: 'Last run date' })
  @IsOptional()
  @IsDateString()
  lastRun?: Date;

  @ApiProperty({ description: 'Task template configuration' })
  @IsObject()
  taskTemplate: any;

  @ApiProperty({ description: 'Assigned user ID' })
  @IsString()
  assignedTo: string;

  @ApiPropertyOptional({ description: 'Notification recipients', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  notifications?: string[];
}

export class MaintenanceScheduleResponseDto extends MaintenanceScheduleDto {
  @ApiProperty({ description: 'Schedule ID' })
  id: string;

  @ApiProperty({ description: 'Whether schedule is active' })
  isActive: boolean;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  updatedAt: Date;
}

export class SystemHealthDto {
  @ApiProperty({ description: 'System name' })
  @IsString()
  systemName: string;

  @ApiProperty({ description: 'Component name' })
  @IsString()
  component: string;

  @ApiProperty({ enum: HealthStatus, description: 'Health status' })
  @IsEnum(HealthStatus)
  status: HealthStatus;

  @ApiProperty({ description: 'Health metrics' })
  @IsObject()
  metrics: any;

  @ApiProperty({ description: 'Alert thresholds' })
  @IsObject()
  thresholds: any;
}

export class SystemHealthResponseDto extends SystemHealthDto {
  @ApiProperty({ description: 'Health check ID' })
  id: string;

  @ApiProperty({ description: 'Last check date' })
  lastCheck: Date;

  @ApiProperty({ description: 'Active alerts', type: [String] })
  alerts: string[];

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  updatedAt: Date;
}

export class BackupConfigDto {
  @ApiProperty({ description: 'Backup configuration name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Backup type' })
  @IsString()
  type: string;

  @ApiProperty({ description: 'Backup schedule (cron format)' })
  @IsString()
  schedule: string;

  @ApiProperty({ description: 'Retention period in days' })
  @IsNumber()
  @Min(1)
  retention: number;

  @ApiProperty({ description: 'Backup destination' })
  @IsString()
  destination: string;

  @ApiProperty({ description: 'Enable encryption' })
  @IsBoolean()
  encryption: boolean;

  @ApiProperty({ description: 'Enable compression' })
  @IsBoolean()
  compression: boolean;

  @ApiProperty({ description: 'Whether backup is active' })
  @IsBoolean()
  isActive: boolean;

  @ApiPropertyOptional({ description: 'Next backup date' })
  @IsOptional()
  @IsDateString()
  nextBackup?: Date;
}

export class BackupConfigResponseDto extends BackupConfigDto {
  @ApiProperty({ description: 'Backup configuration ID' })
  id: string;

  @ApiPropertyOptional({ description: 'Last backup date' })
  lastBackup?: Date;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  updatedAt: Date;
}

export class MaintenanceAlertDto {
  @ApiProperty({ description: 'Alert type' })
  @IsString()
  type: string;

  @ApiProperty({ enum: AlertSeverity, description: 'Alert severity' })
  @IsEnum(AlertSeverity)
  severity: AlertSeverity;

  @ApiProperty({ description: 'Alert title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Alert message' })
  @IsString()
  message: string;

  @ApiProperty({ description: 'Alert source' })
  @IsString()
  source: string;

  @ApiPropertyOptional({ description: 'Alert metadata' })
  @IsOptional()
  @IsObject()
  metadata?: any;
}

export class MaintenanceAlertResponseDto extends MaintenanceAlertDto {
  @ApiProperty({ description: 'Alert ID' })
  id: string;

  @ApiProperty({ enum: AlertStatus, description: 'Alert status' })
  status: AlertStatus;

  @ApiProperty({ description: 'Alert triggered date' })
  triggeredAt: Date;

  @ApiPropertyOptional({ description: 'Alert acknowledged date' })
  acknowledgedAt?: Date;

  @ApiPropertyOptional({ description: 'Alert resolved date' })
  resolvedAt?: Date;

  @ApiPropertyOptional({ description: 'User who acknowledged alert' })
  acknowledgedBy?: string;

  @ApiPropertyOptional({ description: 'User who resolved alert' })
  resolvedBy?: string;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  updatedAt: Date;
}

export class SystemUpdateDto {
  @ApiProperty({ description: 'Update name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Update version' })
  @IsString()
  version: string;

  @ApiProperty({ description: 'Update description' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Update type' })
  @IsString()
  type: string;

  @ApiPropertyOptional({ description: 'Scheduled date' })
  @IsOptional()
  @IsDateString()
  scheduledAt?: Date;

  @ApiPropertyOptional({ description: 'Prerequisites', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  prerequisites?: string[];

  @ApiPropertyOptional({ description: 'Affected systems', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  affectedSystems?: string[];

  @ApiProperty({ description: 'Expected downtime in minutes' })
  @IsNumber()
  @Min(0)
  downtime: number;
}

export class SystemUpdateResponseDto extends SystemUpdateDto {
  @ApiProperty({ description: 'Update ID' })
  id: string;

  @ApiProperty({ enum: UpdateStatus, description: 'Update status' })
  status: UpdateStatus;

  @ApiPropertyOptional({ description: 'Applied date' })
  appliedAt?: Date;

  @ApiProperty({ description: 'Whether rollback is available' })
  rollbackAvailable: boolean;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  updatedAt: Date;
}

export class MaintenanceQueryDto {
  @ApiPropertyOptional({ description: 'Start date for filtering' })
  @IsOptional()
  @IsDateString()
  startDate?: Date;

  @ApiPropertyOptional({ description: 'End date for filtering' })
  @IsOptional()
  @IsDateString()
  endDate?: Date;

  @ApiPropertyOptional({ enum: TaskStatus, description: 'Filter by status' })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @ApiPropertyOptional({ enum: TaskPriority, description: 'Filter by priority' })
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @ApiPropertyOptional({ description: 'Filter by category' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Filter by assigned user' })
  @IsOptional()
  @IsString()
  assignedTo?: string;

  @ApiPropertyOptional({ description: 'Page number', minimum: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page', minimum: 1, maximum: 100 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({ description: 'Search term' })
  @IsOptional()
  @IsString()
  search?: string;
}

// Response DTOs
export class PerformanceMetricsResponseDto {
  @ApiProperty({ description: 'Metrics period' })
  period: string;

  @ApiProperty({ description: 'System metrics' })
  systemMetrics: {
    cpu: {
      average: number;
      peak: number;
      minimum: number;
      trend: string;
    };
    memory: {
      average: number;
      peak: number;
      minimum: number;
      trend: string;
    };
    disk: {
      average: number;
      peak: number;
      minimum: number;
      trend: string;
    };
    network: {
      average: number;
      peak: number;
      minimum: number;
      trend: string;
    };
  };

  @ApiProperty({ description: 'Application metrics' })
  applicationMetrics: {
    responseTime: {
      average: number;
      p95: number;
      p99: number;
    };
    throughput: {
      requestsPerSecond: number;
      peakRps: number;
    };
    errorRate: {
      percentage: number;
      total: number;
    };
  };

  @ApiProperty({ description: 'Database metrics' })
  databaseMetrics: {
    connections: {
      active: number;
      peak: number;
      average: number;
    };
    queryPerformance: {
      averageTime: number;
      slowQueries: number;
    };
    locks: {
      waiting: number;
      deadlocks: number;
    };
  };

  @ApiProperty({ description: 'Performance trends' })
  trends: {
    cpu: number[];
    memory: number[];
    responseTime: number[];
  };

  @ApiProperty({ description: 'Report generation date' })
  generatedAt: Date;
}

export class SystemMonitoringResponseDto {
  @ApiProperty({ description: 'System uptime statistics' })
  uptime: {
    system: number;
    application: number;
    database: number;
    lastDowntime: Date;
  };

  @ApiProperty({ description: 'Service status' })
  services: {
    name: string;
    status: string;
    uptime: number;
    lastRestart: Date;
  }[];

  @ApiProperty({ description: 'Active alerts' })
  alerts: {
    id: string;
    type: string;
    severity: AlertSeverity;
    message: string;
    timestamp: Date;
  }[];

  @ApiProperty({ description: 'Current system metrics' })
  metrics: {
    cpu: number;
    memory: number;
    disk: number;
    network: number;
  };

  @ApiProperty({ description: 'Last update timestamp' })
  lastUpdated: Date;
}

export class ResourceUsageResponseDto {
  @ApiProperty({ description: 'Usage period' })
  period: string;

  @ApiProperty({ description: 'CPU usage details' })
  cpu: {
    current: number;
    average: number;
    peak: number;
    cores: number;
    utilization: { time: string; value: number }[];
  };

  @ApiProperty({ description: 'Memory usage details' })
  memory: {
    current: number;
    average: number;
    peak: number;
    total: number;
    available: number;
    utilization: { time: string; value: number }[];
  };

  @ApiProperty({ description: 'Disk usage details' })
  disk: {
    current: number;
    total: number;
    used: number;
    available: number;
    iops: {
      read: number;
      write: number;
    };
    partitions: {
      name: string;
      usage: number;
      size: number;
    }[];
  };

  @ApiProperty({ description: 'Network usage details' })
  network: {
    current: number;
    bandwidth: number;
    inbound: number;
    outbound: number;
    packets: {
      inbound: number;
      outbound: number;
      dropped: number;
    };
    interfaces: {
      name: string;
      status: string;
      speed: number;
    }[];
  };

  @ApiProperty({ description: 'Process information' })
  processes: {
    total: number;
    running: number;
    sleeping: number;
    zombie: number;
    topProcesses: {
      name: string;
      cpu: number;
      memory: number;
    }[];
  };

  @ApiProperty({ description: 'Report generation date' })
  generatedAt: Date;
}

export class MaintenanceReportResponseDto {
  @ApiProperty({ description: 'Report ID' })
  id: string;

  @ApiProperty({ description: 'Report title' })
  title: string;

  @ApiProperty({ description: 'Report type' })
  type: string;

  @ApiProperty({ description: 'Report period' })
  period: {
    start: Date;
    end: Date;
  };

  @ApiProperty({ description: 'Report summary' })
  summary: {
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
    averageCompletionTime: number;
  };

  @ApiProperty({ description: 'Detailed report data' })
  details: {
    tasksByCategory: Record<string, number>;
    systemHealth: {
      average: number;
      incidents: number;
    };
    alerts: {
      total: number;
      resolved: number;
      pending: number;
    };
  };

  @ApiProperty({ description: 'Report recommendations', type: [String] })
  recommendations: string[];

  @ApiProperty({ description: 'Report generation date' })
  generatedAt: Date;

  @ApiProperty({ description: 'Report generated by' })
  generatedBy: string;
}

export class MaintenanceDashboardResponseDto {
  @ApiProperty({ description: 'Dashboard overview' })
  overview: {
    totalTasks: number;
    pendingTasks: number;
    inProgressTasks: number;
    completedTasks: number;
    overdueTasks: number;
    criticalAlerts: number;
    systemHealth: number;
    uptime: number;
  };

  @ApiProperty({ description: 'Recent tasks' })
  recentTasks: {
    id: string;
    title: string;
    status: TaskStatus;
    priority: TaskPriority;
    assignedTo: string;
    dueDate: Date;
  }[];

  @ApiProperty({ description: 'Recent alerts' })
  recentAlerts: {
    id: string;
    type: string;
    severity: AlertSeverity;
    title: string;
    message: string;
    triggeredAt: Date;
  }[];

  @ApiProperty({ description: 'System metrics' })
  systemMetrics: {
    cpu: { usage: number; trend: string };
    memory: { usage: number; trend: string };
    disk: { usage: number; trend: string };
    network: { usage: number; trend: string };
  };

  @ApiProperty({ description: 'Upcoming maintenance' })
  upcomingMaintenance: {
    id: string;
    name: string;
    scheduledAt: Date;
    estimatedDuration: number;
  }[];

  @ApiProperty({ description: 'Last update timestamp' })
  lastUpdated: Date;
}
