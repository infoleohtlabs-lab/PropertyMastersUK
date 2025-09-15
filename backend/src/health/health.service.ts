import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class HealthService {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  async getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0',
    };
  }

  async getReadiness() {
    const checks = await Promise.allSettled([
      this.checkDatabase(),
      this.checkRedis(),
    ]);

    const dbCheck = checks[0];
    const redisCheck = checks[1];

    const isReady = dbCheck.status === 'fulfilled' && redisCheck.status === 'fulfilled';

    return {
      status: isReady ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
      checks: {
        database: dbCheck.status === 'fulfilled' ? 'ok' : 'error',
        redis: redisCheck.status === 'fulfilled' ? 'ok' : 'error',
      },
    };
  }

  async getLiveness() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
    };
  }

  private async checkDatabase(): Promise<void> {
    await this.dataSource.query('SELECT 1');
  }

  private async checkRedis(): Promise<void> {
    // Add Redis check when implemented
    return Promise.resolve();
  }
}