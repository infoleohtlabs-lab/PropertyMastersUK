import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'PropertyMasters UK API is running!';
  }

  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'PropertyMasters UK Backend',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    };
  }
}
