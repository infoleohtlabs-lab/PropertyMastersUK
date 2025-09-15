import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SecurityConfig } from '../config/configuration';

@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const securityConfig = configService.get<SecurityConfig>('security');
        return {
          throttlers: [
            {
              name: 'short',
              ttl: securityConfig.rateLimitTtl * 1000, // Convert to milliseconds
              limit: securityConfig.rateLimitMax,
            },
            {
              name: 'medium',
              ttl: 60 * 60 * 1000, // 1 hour
              limit: 1000,
            },
            {
              name: 'long',
              ttl: 24 * 60 * 60 * 1000, // 24 hours
              limit: 10000,
            },
          ],
        };
      },
    }),
  ],
  exports: [ThrottlerModule],
})
export class SecurityModule {}