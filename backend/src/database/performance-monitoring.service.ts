import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { ConfigService } from '@nestjs/config';

export interface QueryPerformanceMetrics {
  query: string;
  executionTime: number;
  timestamp: Date;
  parameters?: any[];
  affectedRows?: number;
  error?: string;
}

export interface DatabaseMetrics {
  activeConnections: number;
  idleConnections: number;
  totalConnections: number;
  slowQueries: QueryPerformanceMetrics[];
  averageQueryTime: number;
  totalQueries: number;
}

@Injectable()
export class PerformanceMonitoringService {
  private readonly logger = new Logger(PerformanceMonitoringService.name);
  private queryMetrics: QueryPerformanceMetrics[] = [];
  private readonly slowQueryThreshold: number;
  private readonly maxMetricsHistory: number;

  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
    private readonly configService: ConfigService,
  ) {
    this.slowQueryThreshold = this.configService.get<number>(
      'DATABASE_SLOW_QUERY_THRESHOLD',
      1000, // Default 1 second
    );
    this.maxMetricsHistory = this.configService.get<number>(
      'DATABASE_METRICS_HISTORY_SIZE',
      1000, // Keep last 1000 queries
    );
  }

  /**
   * Monitor query execution time and log slow queries
   */
  async monitorQuery<T>(
    queryFn: () => Promise<T>,
    queryDescription: string,
    parameters?: any[],
  ): Promise<T> {
    const startTime = Date.now();
    let result: T;
    let error: string | undefined;

    try {
      result = await queryFn();
    } catch (err) {
      error = err instanceof Error ? err.message : String(err);
      throw err;
    } finally {
      const executionTime = Date.now() - startTime;
      const metrics: QueryPerformanceMetrics = {
        query: queryDescription,
        executionTime,
        timestamp: new Date(),
        parameters,
        error,
      };

      this.recordQueryMetrics(metrics);

      if (executionTime > this.slowQueryThreshold) {
        this.logger.warn(
          `Slow query detected: ${queryDescription} took ${executionTime}ms`,
          {
            executionTime,
            parameters,
            error,
          },
        );
      }
    }

    return result!;
  }

  /**
   * Record query metrics for analysis
   */
  private recordQueryMetrics(metrics: QueryPerformanceMetrics): void {
    this.queryMetrics.push(metrics);

    // Keep only the most recent metrics to prevent memory leaks
    if (this.queryMetrics.length > this.maxMetricsHistory) {
      this.queryMetrics = this.queryMetrics.slice(-this.maxMetricsHistory);
    }
  }

  /**
   * Get database performance metrics
   */
  async getDatabaseMetrics(): Promise<DatabaseMetrics> {
    const connectionMetrics = await this.getConnectionMetrics();
    const slowQueries = this.getSlowQueries();
    const averageQueryTime = this.getAverageQueryTime();

    return {
      ...connectionMetrics,
      slowQueries,
      averageQueryTime,
      totalQueries: this.queryMetrics.length,
    };
  }

  /**
   * Get connection pool metrics
   */
  private async getConnectionMetrics(): Promise<{
    activeConnections: number;
    idleConnections: number;
    totalConnections: number;
  }> {
    try {
      // Get connection pool information from TypeORM
      const driver = this.entityManager.connection.driver;
      
      // For PostgreSQL driver
      if ('pool' in driver && driver.pool) {
        const pool = driver.pool as any;
        return {
          activeConnections: pool.totalCount - pool.idleCount,
          idleConnections: pool.idleCount,
          totalConnections: pool.totalCount,
        };
      }
    } catch (error) {
      this.logger.error('Failed to get connection metrics', error);
    }

    return {
      activeConnections: 0,
      idleConnections: 0,
      totalConnections: 0,
    };
  }

  /**
   * Get slow queries from recent history
   */
  private getSlowQueries(): QueryPerformanceMetrics[] {
    return this.queryMetrics
      .filter(metric => metric.executionTime > this.slowQueryThreshold)
      .sort((a, b) => b.executionTime - a.executionTime)
      .slice(0, 50); // Return top 50 slowest queries
  }

  /**
   * Calculate average query execution time
   */
  private getAverageQueryTime(): number {
    if (this.queryMetrics.length === 0) return 0;

    const totalTime = this.queryMetrics.reduce(
      (sum, metric) => sum + metric.executionTime,
      0,
    );

    return Math.round(totalTime / this.queryMetrics.length);
  }

  /**
   * Get query performance statistics
   */
  getQueryStatistics(): {
    totalQueries: number;
    slowQueries: number;
    averageTime: number;
    maxTime: number;
    minTime: number;
  } {
    if (this.queryMetrics.length === 0) {
      return {
        totalQueries: 0,
        slowQueries: 0,
        averageTime: 0,
        maxTime: 0,
        minTime: 0,
      };
    }

    const executionTimes = this.queryMetrics.map(m => m.executionTime);
    const slowQueries = this.queryMetrics.filter(
      m => m.executionTime > this.slowQueryThreshold,
    ).length;

    return {
      totalQueries: this.queryMetrics.length,
      slowQueries,
      averageTime: this.getAverageQueryTime(),
      maxTime: Math.max(...executionTimes),
      minTime: Math.min(...executionTimes),
    };
  }

  /**
   * Clear metrics history
   */
  clearMetrics(): void {
    this.queryMetrics = [];
    this.logger.log('Query metrics history cleared');
  }

  /**
   * Get database health status
   */
  async getDatabaseHealth(): Promise<{
    status: string;
    connections: any;
    uptime: number;
  }> {
    const startTime = Date.now();
    
    try {
      // Test database connection
      await this.entityManager.query('SELECT 1');
      const responseTime = Date.now() - startTime;
      
      return {
        status: 'healthy',
        connections: {
          active: 1,
          idle: 0,
          responseTime,
        },
        uptime: process.uptime(),
      };
    } catch (error) {
      this.logger.error('Database health check failed', error);
      return {
        status: 'unhealthy',
        connections: {
          active: 0,
          idle: 0,
          responseTime: Date.now() - startTime,
        },
        uptime: process.uptime(),
      };
    }
  }

  /**
   * Get query performance statistics
   */
  async getQueryStats(): Promise<{
    slowQueries: any[];
    queryMetrics: any;
  }> {
    const metricsObject: Record<string, any> = {};
    this.queryMetrics.forEach((value, key) => {
      metricsObject[key] = value;
    });

    return {
      slowQueries: [],
      queryMetrics: metricsObject,
    };
  }
}
