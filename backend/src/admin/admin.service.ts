import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../users/entities/user.entity';
import { Property, PropertyStatus } from '../properties/entities/property.entity';
import { AdminActivityLog } from './entities/admin-activity-log.entity';
import { SystemConfig } from './entities/system-config.entity';
import * as os from 'os';
import * as process from 'process';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Property)
    private readonly propertyRepository: Repository<Property>,
    @InjectRepository(AdminActivityLog)
    private readonly activityLogRepository: Repository<AdminActivityLog>,
    @InjectRepository(SystemConfig)
    private readonly systemConfigRepository: Repository<SystemConfig>,
  ) {}

  async getDashboardData(period: string = 'month') {
    const stats = await this.getStatistics(period);
    const recentActivity = await this.getRecentActivity(10, 0);
    const systemHealth = await this.getSystemHealth();
    const alerts = await this.getSystemAlerts();

    return {
      stats,
      recentActivity: recentActivity.activities,
      systemHealth,
      alerts: alerts.slice(0, 5), // Top 5 alerts for dashboard
    };
  }

  async getStatistics(period: string = 'month') {
    const dateRange = this.getDateRange(period);
    
    // User statistics
    const totalUsers = await this.userRepository.count();
    const activeUsers = await this.userRepository.count({
      where: {
        lastLoginAt: dateRange.gte,
      },
    });
    const newUsers = await this.userRepository.count({
      where: {
        createdAt: dateRange.gte,
      },
    });
    const pendingVerifications = await this.userRepository.count({
      where: {
        isEmailVerified: false,
      },
    });

    // Property statistics
    const totalProperties = await this.propertyRepository.count();
    const newProperties = await this.propertyRepository.count({
      where: {
        createdAt: dateRange.gte,
      },
    });
    const activeProperties = await this.propertyRepository.count({
      where: {
        status: PropertyStatus.AVAILABLE,
      },
    });

    // Revenue calculation (mock for now - would integrate with payment system)
    const totalRevenue = await this.calculateRevenue(period);
    const revenueGrowth = await this.calculateRevenueGrowth(period);

    // User role distribution
    const usersByRole = await this.userRepository
      .createQueryBuilder('user')
      .select('user.role', 'role')
      .addSelect('COUNT(*)', 'count')
      .groupBy('user.role')
      .getRawMany();

    // Property type distribution
    const propertiesByType = await this.propertyRepository
      .createQueryBuilder('property')
      .select('property.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('property.type')
      .getRawMany();

    return {
      users: {
        total: totalUsers,
        active: activeUsers,
        new: newUsers,
        pendingVerifications,
        byRole: usersByRole,
      },
      properties: {
        total: totalProperties,
        active: activeProperties,
        new: newProperties,
        byType: propertiesByType,
      },
      revenue: {
        total: totalRevenue,
        growth: revenueGrowth,
        period,
      },
      period,
      dateRange: {
        from: dateRange.gte,
        to: dateRange.lte || new Date(),
      },
    };
  }

  async getRecentActivity(limit: number = 50, offset: number = 0) {
    const [activities, total] = await this.activityLogRepository.findAndCount({
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
      relations: ['user'],
    });

    return {
      activities: activities.map(activity => ({
        id: activity.id,
        action: activity.action,
        user: activity.user ? `${activity.user.firstName} ${activity.user.lastName}` : 'System',
        userId: activity.user?.id,
        timestamp: activity.createdAt,
        details: activity.details,
        ipAddress: activity.ipAddress,
        userAgent: activity.userAgent,
      })),
      total,
      limit,
      offset,
    };
  }

  async getSystemAlerts(severity?: string) {
    // Mock system alerts - in production, these would come from monitoring systems
    const alerts = [
      {
        id: '1',
        type: 'security',
        severity: 'high',
        title: 'Multiple failed login attempts detected',
        message: 'User account admin@example.com has 5 failed login attempts in the last hour',
        timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        resolved: false,
      },
      {
        id: '2',
        type: 'system',
        severity: 'medium',
        title: 'High memory usage',
        message: 'Server memory usage is at 85%. Consider scaling or optimization.',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        resolved: false,
      },
      {
        id: '3',
        type: 'payment',
        severity: 'low',
        title: 'Payment gateway latency',
        message: 'Payment processing is experiencing slight delays (avg 3.2s)',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        resolved: false,
      },
      {
        id: '4',
        type: 'database',
        severity: 'critical',
        title: 'Database connection pool exhausted',
        message: 'Database connection pool is at maximum capacity',
        timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
        resolved: true,
      },
    ];

    let filteredAlerts = alerts;
    if (severity) {
      filteredAlerts = alerts.filter(alert => alert.severity === severity);
    }

    return filteredAlerts.sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  }

  async getSystemHealth() {
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    const loadAverage = os.loadavg();
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();

    // Database health check
    let databaseStatus = 'healthy';
    let databaseResponseTime = 0;
    try {
      const start = Date.now();
      await this.userRepository.query('SELECT 1');
      databaseResponseTime = Date.now() - start;
      if (databaseResponseTime > 1000) {
        databaseStatus = 'warning';
      }
    } catch (error) {
      databaseStatus = 'critical';
      this.logger.error('Database health check failed', error);
    }

    const memoryPercentage = ((totalMemory - freeMemory) / totalMemory) * 100;
    const heapPercentage = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;

    // Determine overall system status
    let overallStatus = 'healthy';
    if (memoryPercentage > 90 || heapPercentage > 90 || databaseStatus === 'critical') {
      overallStatus = 'critical';
    } else if (memoryPercentage > 80 || heapPercentage > 80 || databaseStatus === 'warning') {
      overallStatus = 'warning';
    }

    return {
      status: overallStatus,
      uptime: Math.floor(uptime),
      memory: {
        used: totalMemory - freeMemory,
        total: totalMemory,
        percentage: Math.round(memoryPercentage * 100) / 100,
        heap: {
          used: memoryUsage.heapUsed,
          total: memoryUsage.heapTotal,
          percentage: Math.round(heapPercentage * 100) / 100,
        },
      },
      cpu: {
        usage: Math.round((cpuUsage.user + cpuUsage.system) / 1000000), // Convert to milliseconds
        load: loadAverage,
      },
      database: {
        status: databaseStatus,
        responseTime: databaseResponseTime,
        connections: await this.getDatabaseConnections(),
      },
      storage: await this.getStorageInfo(),
    };
  }

  async logActivity(
    userId: string,
    action: string,
    details: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const activity = this.activityLogRepository.create({
      userId,
      action,
      details,
      ipAddress,
      userAgent,
    });

    return this.activityLogRepository.save(activity);
  }

  private getDateRange(period: string) {
    const now = new Date();
    const ranges = {
      today: {
        gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
        lte: now,
      },
      week: {
        gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        lte: now,
      },
      month: {
        gte: new Date(now.getFullYear(), now.getMonth(), 1),
        lte: now,
      },
      quarter: {
        gte: new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1),
        lte: now,
      },
      year: {
        gte: new Date(now.getFullYear(), 0, 1),
        lte: now,
      },
    };

    return ranges[period] || ranges.month;
  }

  private async calculateRevenue(period: string): Promise<number> {
    // Mock revenue calculation - would integrate with actual payment system
    const baseRevenue = {
      today: 1250,
      week: 8750,
      month: 35000,
      quarter: 105000,
      year: 420000,
    };

    return baseRevenue[period] || baseRevenue.month;
  }

  private async calculateRevenueGrowth(period: string): Promise<number> {
    // Mock revenue growth calculation
    const growthRates = {
      today: 5.2,
      week: 12.8,
      month: 18.5,
      quarter: 22.3,
      year: 15.7,
    };

    return growthRates[period] || growthRates.month;
  }

  private async getDatabaseConnections(): Promise<number> {
    try {
      const result = await this.userRepository.query(
        "SELECT count(*) as connections FROM pg_stat_activity WHERE state = 'active'"
      );
      return parseInt(result[0]?.connections || '0');
    } catch (error) {
      this.logger.warn('Could not get database connections count', error);
      return 0;
    }
  }

  private async getStorageInfo() {
    // Mock storage info - would integrate with actual storage monitoring
    return {
      used: 45 * 1024 * 1024 * 1024, // 45GB
      total: 100 * 1024 * 1024 * 1024, // 100GB
      percentage: 45,
    };
  }
}
