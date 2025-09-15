# PropertyMasters UK - Production Implementation Plan

**Implementation Date:** January 2025  
**Project:** PropertyMasters UK Multi-tenant SaaS Property Platform  
**Based on:** Production Readiness Assessment Report  
**Implementation Timeline:** 6 weeks (3 phases)

## Overview

This document provides a comprehensive implementation plan for all recommendations from the Production Readiness Assessment Report. The plan is organized into 3 phases with specific tasks, code examples, and implementation steps.

**Current Readiness Score:** 65/100  
**Target Readiness Score:** 95/100

---

## Phase 1: Critical Infrastructure (Week 1-2)

### Task 1.1: Implement Health Check Endpoints (Priority 1)
**Timeline:** 2 days  
**Effort:** 8 hours

#### Implementation Steps:

1. **Create Health Module**
```bash
# Navigate to backend
cd backend/src
mkdir health
cd health
```

2. **Create Health Controller**
```typescript
// backend/src/health/health.controller.ts
import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Basic health check' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  async getHealth() {
    return this.healthService.getHealth();
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness check with dependencies' })
  @ApiResponse({ status: 200, description: 'Service is ready' })
  async getReadiness() {
    return this.healthService.getReadiness();
  }

  @Get('live')
  @ApiOperation({ summary: 'Liveness check' })
  @ApiResponse({ status: 200, description: 'Service is alive' })
  async getLiveness() {
    return this.healthService.getLiveness();
  }
}
```

3. **Create Health Service**
```typescript
// backend/src/health/health.service.ts
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
```

4. **Create Health Module**
```typescript
// backend/src/health/health.module.ts
import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

@Module({
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}
```

5. **Update App Module**
```typescript
// backend/src/app.module.ts
// Add to imports array
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    // ... existing imports
    HealthModule,
  ],
  // ... rest of module
})
export class AppModule {}
```

### Task 1.2: Add Centralized Logging (Priority 1)
**Timeline:** 3 days  
**Effort:** 12 hours

#### Implementation Steps:

1. **Install Dependencies**
```bash
cd backend
npm install winston nest-winston uuid
npm install --save-dev @types/uuid
```

2. **Create Logger Configuration**
```typescript
// backend/src/common/config/logger.config.ts
import { WinstonModuleOptions } from 'nest-winston';
import * as winston from 'winston';

const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json(),
);

export const loggerConfig: WinstonModuleOptions = {
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: {
    service: 'property-masters-api',
    environment: process.env.NODE_ENV,
  },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
      ),
    }),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
    }),
  ],
};
```

3. **Create Correlation ID Middleware**
```typescript
// backend/src/common/middleware/correlation-id.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const correlationId = req.headers['x-correlation-id'] as string || uuidv4();
    req['correlationId'] = correlationId;
    res.setHeader('x-correlation-id', correlationId);
    next();
  }
}
```

4. **Create Logging Interceptor**
```typescript
// backend/src/common/interceptors/logging.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const { method, url, body, query, params } = request;
    const correlationId = request.correlationId;
    const startTime = Date.now();

    this.logger.info('Incoming request', {
      correlationId,
      method,
      url,
      body: this.sanitizeBody(body),
      query,
      params,
      userAgent: request.get('User-Agent'),
      ip: request.ip,
    });

    return next.handle().pipe(
      tap({
        next: (data) => {
          const duration = Date.now() - startTime;
          this.logger.info('Request completed', {
            correlationId,
            method,
            url,
            statusCode: response.statusCode,
            duration,
            responseSize: JSON.stringify(data).length,
          });
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          this.logger.error('Request failed', {
            correlationId,
            method,
            url,
            duration,
            error: error.message,
            stack: error.stack,
          });
        },
      }),
    );
  }

  private sanitizeBody(body: any): any {
    if (!body) return body;
    const sanitized = { ...body };
    const sensitiveFields = ['password', 'token', 'secret', 'key'];
    
    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });
    
    return sanitized;
  }
}
```

5. **Update Main.ts**
```typescript
// backend/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WinstonModule } from 'nest-winston';
import { loggerConfig } from './common/config/logger.config';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(loggerConfig),
  });

  app.useGlobalInterceptors(new LoggingInterceptor(app.get('winston')));
  
  // ... rest of bootstrap
}
bootstrap();
```

### Task 1.3: Error Handling & Monitoring (Priority 1)
**Timeline:** 2 days  
**Effort:** 10 hours

#### Implementation Steps:

1. **Install Sentry**
```bash
cd backend
npm install @sentry/node @sentry/tracing
```

2. **Create Sentry Configuration**
```typescript
// backend/src/common/config/sentry.config.ts
import * as Sentry from '@sentry/node';
import * as Tracing from '@sentry/tracing';

export function initSentry() {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Tracing.Integrations.Express(),
    ],
  });
}
```

3. **Create Global Exception Filter**
```typescript
// backend/src/common/filters/http-exception.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import * as Sentry from '@sentry/node';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const correlationId = request['correlationId'];

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let details: any = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message = typeof exceptionResponse === 'string' 
        ? exceptionResponse 
        : (exceptionResponse as any).message || message;
      details = typeof exceptionResponse === 'object' ? exceptionResponse : null;
    }

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
      correlationId,
      ...(details && { details }),
    };

    // Log error
    this.logger.error('Exception occurred', {
      ...errorResponse,
      stack: exception instanceof Error ? exception.stack : undefined,
      userAgent: request.get('User-Agent'),
      ip: request.ip,
    });

    // Send to Sentry for 5xx errors
    if (status >= 500) {
      Sentry.captureException(exception, {
        tags: {
          correlationId,
          path: request.url,
          method: request.method,
        },
        user: {
          id: request['user']?.id,
          email: request['user']?.email,
        },
      });
    }

    response.status(status).json(errorResponse);
  }
}
```

4. **Update Main.ts for Error Handling**
```typescript
// backend/src/main.ts (additions)
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { initSentry } from './common/config/sentry.config';

async function bootstrap() {
  // Initialize Sentry
  initSentry();
  
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(loggerConfig),
  });

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter(app.get('winston')));
  
  // ... rest of bootstrap
}
```

### Task 1.4: Environment Configuration (Priority 1)
**Timeline:** 2 days  
**Effort:** 8 hours

#### Implementation Steps:

1. **Create Environment Schema**
```typescript
// backend/src/common/config/env.validation.ts
import { plainToClass, Transform } from 'class-transformer';
import { IsEnum, IsNumber, IsString, validateSync, IsOptional, IsBoolean } from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  PORT: number;

  @IsString()
  DATABASE_URL: string;

  @IsString()
  JWT_SECRET: string;

  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  JWT_EXPIRATION: number;

  @IsString()
  @IsOptional()
  REDIS_URL?: string;

  @IsString()
  @IsOptional()
  SENTRY_DSN?: string;

  @IsString()
  @IsOptional()
  LOG_LEVEL?: string;

  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  @IsOptional()
  ENABLE_SWAGGER?: boolean;

  @IsString()
  @IsOptional()
  CORS_ORIGIN?: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToClass(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  
  return validatedConfig;
}
```

2. **Create Configuration Service**
```typescript
// backend/src/common/config/configuration.ts
export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  database: {
    url: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production',
    logging: process.env.NODE_ENV === 'development',
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRATION || 3600,
  },
  redis: {
    url: process.env.REDIS_URL,
  },
  sentry: {
    dsn: process.env.SENTRY_DSN,
  },
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
  },
  swagger: {
    enabled: process.env.ENABLE_SWAGGER === 'true',
  },
});
```

3. **Update App Module**
```typescript
// backend/src/app.module.ts
import { ConfigModule } from '@nestjs/config';
import configuration from './common/config/configuration';
import { validate } from './common/config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate,
      envFilePath: ['.env.local', '.env'],
    }),
    // ... other imports
  ],
})
export class AppModule {}
```

4. **Create Production Environment File**
```bash
# backend/.env.production
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/propertymastersuk
JWT_SECRET=your-super-secure-jwt-secret-key
JWT_EXPIRATION=3600
REDIS_URL=redis://localhost:6379
SENTRY_DSN=your-sentry-dsn
LOG_LEVEL=info
ENABLE_SWAGGER=false
CORS_ORIGIN=https://yourdomain.com
```

### Task 1.5: Security Headers (Priority 2)
**Timeline:** 1 day  
**Effort:** 4 hours

#### Implementation Steps:

1. **Install Security Packages**
```bash
cd backend
npm install helmet express-rate-limit
```

2. **Create Security Configuration**
```typescript
// backend/src/common/config/security.config.ts
import { ConfigService } from '@nestjs/config';

export const getSecurityConfig = (configService: ConfigService) => ({
  helmet: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'https:'],
        scriptSrc: ["'self'"],
        connectSrc: ["'self'", configService.get('cors.origin')],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
  },
});
```

3. **Update Main.ts**
```typescript
// backend/src/main.ts (additions)
import * as helmet from 'helmet';
import * as rateLimit from 'express-rate-limit';
import { getSecurityConfig } from './common/config/security.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const securityConfig = getSecurityConfig(configService);

  // Security middleware
  app.use(helmet(securityConfig.helmet));
  app.use(rateLimit(securityConfig.rateLimit));
  
  // ... rest of bootstrap
}
```

### Task 1.6: Enhanced Authentication (Priority 2)
**Timeline:** 3 days  
**Effort:** 12 hours

#### Implementation Steps:

1. **Create Refresh Token Entity**
```typescript
// backend/src/auth/entities/refresh-token.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('refresh_tokens')
export class RefreshToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  token: string;

  @ManyToOne(() => User, user => user.refreshTokens)
  user: User;

  @Column()
  userId: string;

  @Column()
  expiresAt: Date;

  @Column({ default: false })
  isRevoked: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
```

2. **Update User Entity**
```typescript
// backend/src/users/entities/user.entity.ts (additions)
import { RefreshToken } from '../../auth/entities/refresh-token.entity';

@Entity('users')
export class User {
  // ... existing fields

  @OneToMany(() => RefreshToken, refreshToken => refreshToken.user)
  refreshTokens: RefreshToken[];

  @Column({ default: 0 })
  failedLoginAttempts: number;

  @Column({ nullable: true })
  lockedUntil: Date;

  @Column({ default: true })
  isActive: boolean;
}
```

3. **Create Account Lockout Service**
```typescript
// backend/src/auth/services/account-lockout.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class AccountLockoutService {
  private readonly MAX_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATION = 30 * 60 * 1000; // 30 minutes

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async recordFailedAttempt(userId: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) return;

    user.failedLoginAttempts += 1;

    if (user.failedLoginAttempts >= this.MAX_ATTEMPTS) {
      user.lockedUntil = new Date(Date.now() + this.LOCKOUT_DURATION);
    }

    await this.userRepository.save(user);
  }

  async resetFailedAttempts(userId: string): Promise<void> {
    await this.userRepository.update(userId, {
      failedLoginAttempts: 0,
      lockedUntil: null,
    });
  }

  async isAccountLocked(userId: string): Promise<boolean> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) return false;

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      return true;
    }

    // Auto-unlock if lockout period has passed
    if (user.lockedUntil && user.lockedUntil <= new Date()) {
      await this.resetFailedAttempts(userId);
    }

    return false;
  }
}
```

4. **Update Auth Service**
```typescript
// backend/src/auth/auth.service.ts (additions)
import { AccountLockoutService } from './services/account-lockout.service';
import { RefreshToken } from './entities/refresh-token.entity';

@Injectable()
export class AuthService {
  constructor(
    // ... existing dependencies
    private accountLockoutService: AccountLockoutService,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if account is locked
    const isLocked = await this.accountLockoutService.isAccountLocked(user.id);
    if (isLocked) {
      throw new UnauthorizedException('Account is temporarily locked');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    
    if (!isPasswordValid) {
      await this.accountLockoutService.recordFailedAttempt(user.id);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Reset failed attempts on successful login
    await this.accountLockoutService.resetFailedAttempts(user.id);

    const tokens = await this.generateTokens(user);
    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async generateTokens(user: User) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '15m',
    });
    
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
    });

    // Store refresh token
    await this.storeRefreshToken(user.id, refreshToken);

    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshTokens(refreshToken: string) {
    const storedToken = await this.refreshTokenRepository.findOne({
      where: { token: refreshToken, isRevoked: false },
      relations: ['user'],
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Revoke old token
    storedToken.isRevoked = true;
    await this.refreshTokenRepository.save(storedToken);

    // Generate new tokens
    return this.generateTokens(storedToken.user);
  }

  private async storeRefreshToken(userId: string, token: string) {
    const refreshToken = this.refreshTokenRepository.create({
      token,
      userId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    await this.refreshTokenRepository.save(refreshToken);
  }
}
```

---

## Phase 2: Performance & Scalability (Week 3-4)

### Task 2.1: Database Performance Optimization
**Timeline:** 4 days  
**Effort:** 16 hours

#### Implementation Steps:

1. **Create Database Indexes Migration**
```sql
-- Create migration file: backend/src/database/migrations/add-performance-indexes.sql

-- Properties table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_properties_type ON properties(property_type);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_properties_price ON properties(price);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_properties_location ON properties(city, postcode);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_properties_agent ON properties(agent_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_properties_created ON properties(created_at DESC);

-- Users table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_active ON users(is_active);

-- Bookings table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_property ON bookings(property_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_user ON bookings(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_date ON bookings(booking_date);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_status ON bookings(status);

-- Composite indexes for common queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_properties_search ON properties(status, property_type, price);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_user_date ON bookings(user_id, booking_date DESC);
```

2. **Update Database Configuration**
```typescript
// backend/src/database/database.config.ts
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const getDatabaseConfig = (configService: ConfigService): TypeOrmModuleOptions => ({
  type: 'postgres',
  url: configService.get('database.url'),
  ssl: configService.get('database.ssl') ? { rejectUnauthorized: false } : false,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: false, // Always false in production
  logging: configService.get('database.logging'),
  
  // Connection pool configuration
  extra: {
    max: 20, // Maximum number of connections
    min: 5,  // Minimum number of connections
    acquire: 30000, // Maximum time to get connection
    idle: 10000, // Maximum time connection can be idle
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
    
    // Performance optimizations
    statement_timeout: 30000,
    query_timeout: 30000,
    
    // Connection pool settings
    application_name: 'PropertyMasters-API',
  },
  
  // Query result caching
  cache: {
    type: 'redis',
    options: {
      host: configService.get('redis.host'),
      port: configService.get('redis.port'),
      password: configService.get('redis.password'),
    },
    duration: 60000, // 1 minute default cache
  },
});
```

3. **Create Query Performance Monitor**
```typescript
// backend/src/common/interceptors/query-performance.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Inject } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class QueryPerformanceInterceptor implements NestInterceptor {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const startTime = Date.now();
    
    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startTime;
        
        // Log slow queries (> 1 second)
        if (duration > 1000) {
          const request = context.switchToHttp().getRequest();
          this.logger.warn('Slow query detected', {
            duration,
            method: request.method,
            url: request.url,
            correlationId: request.correlationId,
          });
        }
      }),
    );
  }
}
```

### Task 2.2: Redis Caching Implementation
**Timeline:** 3 days  
**Effort:** 12 hours

#### Implementation Steps:

1. **Install Redis Dependencies**
```bash
cd backend
npm install redis cache-manager cache-manager-redis-store
npm install --save-dev @types/cache-manager
```

2. **Create Cache Module**
```typescript
// backend/src/common/cache/cache.module.ts
import { Module, CacheModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as redisStore from 'cache-manager-redis-store';
import { CacheService } from './cache.service';

@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get('redis.host'),
        port: configService.get('redis.port'),
        password: configService.get('redis.password'),
        ttl: 300, // 5 minutes default
        max: 1000, // Maximum number of items in cache
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [CacheService],
  exports: [CacheService],
})
export class CacheModule {}
```

3. **Create Cache Service**
```typescript
// backend/src/common/cache/cache.service.ts
import { Injectable, Inject, CACHE_MANAGER } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async get<T>(key: string): Promise<T | undefined> {
    return this.cacheManager.get<T>(key);
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    await this.cacheManager.set(key, value, { ttl });
  }

  async del(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  async reset(): Promise<void> {
    await this.cacheManager.reset();
  }

  // Helper methods for common cache patterns
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttl?: number,
  ): Promise<T> {
    let value = await this.get<T>(key);
    
    if (value === undefined) {
      value = await factory();
      await this.set(key, value, ttl);
    }
    
    return value;
  }

  generateKey(...parts: string[]): string {
    return parts.join(':');
  }
}
```

4. **Create Cache Decorator**
```typescript
// backend/src/common/decorators/cache.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const CACHE_KEY_METADATA = 'cache_key';
export const CACHE_TTL_METADATA = 'cache_ttl';

export const CacheKey = (key: string) => SetMetadata(CACHE_KEY_METADATA, key);
export const CacheTTL = (ttl: number) => SetMetadata(CACHE_TTL_METADATA, ttl);
```

5. **Create Cache Interceptor**
```typescript
// backend/src/common/interceptors/cache.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CacheService } from '../cache/cache.service';
import { CACHE_KEY_METADATA, CACHE_TTL_METADATA } from '../decorators/cache.decorator';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  constructor(
    private cacheService: CacheService,
    private reflector: Reflector,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const cacheKey = this.reflector.get<string>(
      CACHE_KEY_METADATA,
      context.getHandler(),
    );
    
    if (!cacheKey) {
      return next.handle();
    }

    const ttl = this.reflector.get<number>(
      CACHE_TTL_METADATA,
      context.getHandler(),
    );

    const request = context.switchToHttp().getRequest();
    const fullCacheKey = this.buildCacheKey(cacheKey, request);

    // Try to get from cache
    const cachedResult = await this.cacheService.get(fullCacheKey);
    if (cachedResult !== undefined) {
      return of(cachedResult);
    }

    // Execute handler and cache result
    return next.handle().pipe(
      tap(async (result) => {
        await this.cacheService.set(fullCacheKey, result, ttl);
      }),
    );
  }

  private buildCacheKey(baseKey: string, request: any): string {
    const userId = request.user?.id || 'anonymous';
    const queryParams = JSON.stringify(request.query || {});
    return this.cacheService.generateKey(baseKey, userId, queryParams);
  }
}
```

6. **Update Properties Service with Caching**
```typescript
// backend/src/properties/properties.service.ts (additions)
import { CacheService } from '../common/cache/cache.service';
import { CacheKey, CacheTTL } from '../common/decorators/cache.decorator';

@Injectable()
export class PropertiesService {
  constructor(
    // ... existing dependencies
    private cacheService: CacheService,
  ) {}

  @CacheKey('properties:search')
  @CacheTTL(300) // 5 minutes
  async searchProperties(searchDto: SearchPropertiesDto) {
    // Implementation with caching
    return this.propertyRepository.find({
      where: this.buildSearchCriteria(searchDto),
      relations: ['agent', 'images'],
      order: { createdAt: 'DESC' },
      cache: true,
    });
  }

  async invalidatePropertyCache(propertyId: string) {
    const patterns = [
      `properties:search:*`,
      `properties:${propertyId}:*`,
      `properties:featured:*`,
    ];
    
    for (const pattern of patterns) {
      // Note: This requires Redis SCAN command implementation
      await this.cacheService.del(pattern);
    }
  }
}
```

### Task 2.3: Container Orchestration (Kubernetes)
**Timeline:** 5 days  
**Effort:** 20 hours

#### Implementation Steps:

1. **Create Kubernetes Namespace**
```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: property-masters
  labels:
    name: property-masters
```

2. **Create ConfigMap**
```yaml
# k8s/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: property-masters-config
  namespace: property-masters
data:
  NODE_ENV: "production"
  PORT: "3000"
  LOG_LEVEL: "info"
  ENABLE_SWAGGER: "false"
  CORS_ORIGIN: "https://propertymastersuk.com"
```

3. **Create Secrets**
```yaml
# k8s/secrets.yaml
apiVersion: v1
kind: Secret
metadata:
  name: property-masters-secrets
  namespace: property-masters
type: Opaque
data:
  DATABASE_URL: <base64-encoded-database-url>
  JWT_SECRET: <base64-encoded-jwt-secret>
  REDIS_URL: <base64-encoded-redis-url>
  SENTRY_DSN: <base64-encoded-sentry-dsn>
```

4. **Create Backend Deployment**
```yaml
# k8s/backend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: property-masters-backend
  namespace: property-masters
spec:
  replicas: 3
  selector:
    matchLabels:
      app: property-masters-backend
  template:
    metadata:
      labels:
        app: property-masters-backend
    spec:
      containers:
      - name: backend
        image: property-masters/backend:latest
        ports:
        - containerPort: 3000
        envFrom:
        - configMapRef:
            name: property-masters-config
        - secretRef:
            name: property-masters-secrets
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health/live
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health/ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
```

5. **Create Service**
```yaml
# k8s/backend-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: property-masters-backend-service
  namespace: property-masters
spec:
  selector:
    app: property-masters-backend
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: ClusterIP
```

6. **Create Horizontal Pod Autoscaler**
```yaml
# k8s/hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: property-masters-backend-hpa
  namespace: property-masters
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: property-masters-backend
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

7. **Create Ingress**
```yaml
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: property-masters-ingress
  namespace: property-masters
  annotations:
    kubernetes.io/ingress.class: "nginx"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/rate-limit: "100"
    nginx.ingress.kubernetes.io/rate-limit-window: "1m"
spec:
  tls:
  - hosts:
    - api.propertymastersuk.com
    secretName: property-masters-tls
  rules:
  - host: api.propertymastersuk.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: property-masters-backend-service
            port:
              number: 80
```

### Task 2.4: CI/CD Pipeline
**Timeline:** 4 days  
**Effort:** 16 hours

#### Implementation Steps:

1. **Create GitHub Actions Workflow**
```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
      
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        cache-dependency-path: backend/package-lock.json
    
    - name: Install backend dependencies
      run: |
        cd backend
        npm ci
    
    - name: Run backend tests
      run: |
        cd backend
        npm run test
        npm run test:e2e
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
        REDIS_URL: redis://localhost:6379
        JWT_SECRET: test-secret
    
    - name: Install frontend dependencies
      run: |
        cd frontend
        npm ci
    
    - name: Run frontend tests
      run: |
        cd frontend
        npm run test
    
    - name: Build frontend
      run: |
        cd frontend
        npm run build

  security-scan:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Run Trivy vulnerability scanner
      uses: aquasecurity/trivy-action@master
      with:
        scan-type: 'fs'
        scan-ref: '.'
        format: 'sarif'
        output: 'trivy-results.sarif'
    
    - name: Upload Trivy scan results
      uses: github/codeql-action/upload-sarif@v2
      with:
        sarif_file: 'trivy-results.sarif'

  build-and-push:
    needs: [test, security-scan]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Log in to Container Registry
      uses: docker/login-action@v2
      with:
        registry: ${{ env.REGISTRY }}
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}
    
    - name: Extract metadata
      id: meta
      uses: docker/metadata-action@v4
      with:
        images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
        tags: |
          type=ref,event=branch
          type=ref,event=pr
          type=sha,prefix={{branch}}-
          type=raw,value=latest,enable={{is_default_branch}}
    
    - name: Build and push backend image
      uses: docker/build-push-action@v4
      with:
        context: ./backend
        push: true
        tags: ${{ steps.meta.outputs.tags }}-backend
        labels: ${{ steps.meta.outputs.labels }}
    
    - name: Build and push frontend image
      uses: docker/build-push-action@v4
      with:
        context: ./frontend
        push: true
        tags: ${{ steps.meta.outputs.tags }}-frontend
        labels: ${{ steps.meta.outputs.labels }}

  deploy:
    needs: build-and-push
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Deploy to Kubernetes
      run: |
        # Update image tags in k8s manifests
        sed -i "s|image: property-masters/backend:latest|image: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }}-backend|g" k8s/backend-deployment.yaml
        sed -i "s|image: property-masters/frontend:latest|image: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }}-frontend|g" k8s/frontend-deployment.yaml
        
        # Apply manifests
        kubectl apply -f k8s/
      env:
        KUBECONFIG: ${{ secrets.KUBECONFIG }}
```

2. **Create Docker Compose for Testing**
```yaml
# docker-compose.test.yml
version: '3.8'

services:
  postgres-test:
    image: postgres:14
    environment:
      POSTGRES_DB: test_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5433:5432"
    volumes:
      - postgres_test_data:/var/lib/postgresql/data
  
  redis-test:
    image: redis:7
    ports:
      - "6380:6379"
  
  backend-test:
    build:
      context: ./backend
      target: test
    environment:
      NODE_ENV: test
      DATABASE_URL: postgresql://postgres:postgres@postgres-test:5432/test_db
      REDIS_URL: redis://redis-test:6379
      JWT_SECRET: test-secret
    depends_on:
      - postgres-test
      - redis-test
    volumes:
      - ./backend:/app
      - /app/node_modules
    command: npm run test:watch

volumes:
  postgres_test_data:
```

---

## Phase 3: Feature Completion (Week 5-6)

### Task 3.1: Complete Ordnance Survey Integration
**Timeline:** 3 days  
**Effort:** 12 hours

#### Implementation Steps:

1. **Update Ordnance Survey Service**
```typescript
// backend/src/integrations/ordnance-survey/ordnance-survey.service.ts
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { CacheService } from '../../common/cache/cache.service';

@Injectable()
export class OrdnanceSurveyService {
  private readonly baseUrl = 'https://api.os.uk';
  private readonly apiKey: string;

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
    private cacheService: CacheService,
  ) {
    this.apiKey = this.configService.get('ORDNANCE_SURVEY_API_KEY');
  }

  async getMapData(postcode: string, zoom: number = 16) {
    const cacheKey = this.cacheService.generateKey('os', 'map', postcode, zoom.toString());
    
    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        try {
          const response = await firstValueFrom(
            this.httpService.get(`${this.baseUrl}/maps/raster/v1/zxy/Light_3857/{z}/{x}/{y}.png`, {
              params: {
                key: this.apiKey,
                postcode,
                zoom,
              },
            })
          );
          
          return {
            mapUrl: response.data.url,
            bounds: response.data.bounds,
            center: response.data.center,
          };
        } catch (error) {
          throw new HttpException(
            'Failed to fetch map data from Ordnance Survey',
            HttpStatus.BAD_GATEWAY
          );
        }
      },
      3600 // Cache for 1 hour
    );
  }

  async getAddressData(uprn: string) {
    const cacheKey = this.cacheService.generateKey('os', 'address', uprn);
    
    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        try {
          const response = await firstValueFrom(
            this.httpService.get(`${this.baseUrl}/search/places/v1/uprn`, {
              params: {
                uprn,
                key: this.apiKey,
                dataset: 'LPI',
                lr: 'EN',
              },
            })
          );
          
          return this.transformAddressData(response.data);
        } catch (error) {
          throw new HttpException(
            'Failed to fetch address data from Ordnance Survey',
            HttpStatus.BAD_GATEWAY
          );
        }
      },
      86400 // Cache for 24 hours
    );
  }

  async getNearbyAmenities(lat: number, lng: number, radius: number = 1000) {
    const cacheKey = this.cacheService.generateKey('os', 'amenities', lat.toString(), lng.toString(), radius.toString());
    
    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        try {
          const response = await firstValueFrom(
            this.httpService.get(`${this.baseUrl}/search/places/v1/radius`, {
              params: {
                point: `${lat},${lng}`,
                radius,
                key: this.apiKey,
                fq: 'classification_code:06* OR classification_code:07* OR classification_code:08*', // Schools, healthcare, retail
              },
            })
          );
          
          return this.transformAmenitiesData(response.data);
        } catch (error) {
          throw new HttpException(
            'Failed to fetch amenities data from Ordnance Survey',
            HttpStatus.BAD_GATEWAY
          );
        }
      },
      1800 // Cache for 30 minutes
    );
  }

  async getTransportLinks(lat: number, lng: number, radius: number = 2000) {
    const cacheKey = this.cacheService.generateKey('os', 'transport', lat.toString(), lng.toString(), radius.toString());
    
    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        try {
          const response = await firstValueFrom(
            this.httpService.get(`${this.baseUrl}/search/places/v1/radius`, {
              params: {
                point: `${lat},${lng}`,
                radius,
                key: this.apiKey,
                fq: 'classification_code:09*', // Transport
              },
            })
          );
          
          return this.transformTransportData(response.data);
        } catch (error) {
          throw new HttpException(
            'Failed to fetch transport data from Ordnance Survey',
            HttpStatus.BAD_GATEWAY
          );
        }
      },
      3600 // Cache for 1 hour
    );
  }

  private transformAddressData(data: any) {
    return {
      uprn: data.results[0]?.LPI?.UPRN,
      address: data.results[0]?.LPI?.ADDRESS,
      postcode: data.results[0]?.LPI?.POSTCODE_LOCATOR,
      coordinates: {
        lat: parseFloat(data.results[0]?.LPI?.LAT),
        lng: parseFloat(data.results[0]?.LPI?.LNG),
      },
      localAuthority: data.results[0]?.LPI?.LOCAL_CUSTODIAN_CODE_DESCRIPTION,
    };
  }

  private transformAmenitiesData(data: any) {
    return data.results?.map((result: any) => ({
      name: result.GAZETTEER_ENTRY?.NAME1,
      type: result.GAZETTEER_ENTRY?.CLASSIFICATION_CODE_DESCRIPTION,
      address: result.GAZETTEER_ENTRY?.ADDRESS,
      coordinates: {
        lat: parseFloat(result.GAZETTEER_ENTRY?.GEOMETRY_Y),
        lng: parseFloat(result.GAZETTEER_ENTRY?.GEOMETRY_X),
      },
      distance: result.DISTANCE,
    })) || [];
  }

  private transformTransportData(data: any) {
    return data.results?.map((result: any) => ({
      name: result.GAZETTEER_ENTRY?.NAME1,
      type: result.GAZETTEER_ENTRY?.CLASSIFICATION_CODE_DESCRIPTION,
      coordinates: {
        lat: parseFloat(result.GAZETTEER_ENTRY?.GEOMETRY_Y),
        lng: parseFloat(result.GAZETTEER_ENTRY?.GEOMETRY_X),
      },
      distance: result.DISTANCE,
    })) || [];
  }
}
```

2. **Update Property Entity with Location Data**
```typescript
// backend/src/properties/entities/property.entity.ts (additions)
@Column('jsonb', { nullable: true })
locationData: {
  uprn?: string;
  coordinates: { lat: number; lng: number };
  nearbyAmenities?: any[];
  transportLinks?: any[];
  mapUrl?: string;
};

@Column({ nullable: true })
walkScore: number;

@Column({ nullable: true })
transitScore: number;
```

3. **Create Location Enhancement Job**
```typescript
// backend/src/properties/jobs/location-enhancement.job.ts
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Property } from '../entities/property.entity';
import { OrdnanceSurveyService } from '../../integrations/ordnance-survey/ordnance-survey.service';

@Injectable()
export class LocationEnhancementJob {
  constructor(
    @InjectRepository(Property)
    private propertyRepository: Repository<Property>,
    private ordnanceSurveyService: OrdnanceSurveyService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async enhancePropertyLocations() {
    const properties = await this.propertyRepository.find({
      where: { locationData: null },
      take: 50, // Process 50 properties per day
    });

    for (const property of properties) {
      try {
        const addressData = await this.ordnanceSurveyService.getAddressData(property.uprn);
        const amenities = await this.ordnanceSurveyService.getNearbyAmenities(
          addressData.coordinates.lat,
          addressData.coordinates.lng
        );
        const transport = await this.ordnanceSurveyService.getTransportLinks(
          addressData.coordinates.lat,
          addressData.coordinates.lng
        );

        property.locationData = {
          uprn: addressData.uprn,
          coordinates: addressData.coordinates,
          nearbyAmenities: amenities,
          transportLinks: transport,
        };

        await this.propertyRepository.save(property);
      } catch (error) {
        console.error(`Failed to enhance location for property ${property.id}:`, error);
      }
    }
  }
}
```

### Task 3.2: Complete Rightmove Integration
**Timeline:** 3 days  
**Effort:** 12 hours

#### Implementation Steps:

1. **Create Rightmove Service**
```typescript
// backend/src/integrations/rightmove/rightmove.service.ts
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { CacheService } from '../../common/cache/cache.service';

@Injectable()
export class RightmoveService {
  private readonly baseUrl = 'https://adf.rightmove.co.uk';
  private readonly apiKey: string;
  private readonly branchId: string;

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
    private cacheService: CacheService,
  ) {
    this.apiKey = this.configService.get('RIGHTMOVE_API_KEY');
    this.branchId = this.configService.get('RIGHTMOVE_BRANCH_ID');
  }

  async sendProperty(property: any) {
    try {
      const rightmoveProperty = this.transformToRightmoveFormat(property);
      
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.baseUrl}/v1/property/sendpropertydetails`,
          rightmoveProperty,
          {
            headers: {
              'Authorization': `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json',
            },
          }
        )
      );

      return {
        success: true,
        rightmoveId: response.data.property_id,
        message: 'Property successfully sent to Rightmove',
      };
    } catch (error) {
      throw new HttpException(
        `Failed to send property to Rightmove: ${error.message}`,
        HttpStatus.BAD_GATEWAY
      );
    }
  }

  async updateProperty(rightmoveId: string, property: any) {
    try {
      const rightmoveProperty = this.transformToRightmoveFormat(property);
      
      const response = await firstValueFrom(
        this.httpService.put(
          `${this.baseUrl}/v1/property/${rightmoveId}`,
          rightmoveProperty,
          {
            headers: {
              'Authorization': `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json',
            },
          }
        )
      );

      return {
        success: true,
        message: 'Property successfully updated on Rightmove',
      };
    } catch (error) {
      throw new HttpException(
        `Failed to update property on Rightmove: ${error.message}`,
        HttpStatus.BAD_GATEWAY
      );
    }
  }

  async removeProperty(rightmoveId: string) {
    try {
      await firstValueFrom(
        this.httpService.delete(
          `${this.baseUrl}/v1/property/${rightmoveId}`,
          {
            headers: {
              'Authorization': `Bearer ${this.apiKey}`,
            },
          }
        )
      );

      return {
        success: true,
        message: 'Property successfully removed from Rightmove',
      };
    } catch (error) {
      throw new HttpException(
        `Failed to remove property from Rightmove: ${error.message}`,
        HttpStatus.BAD_GATEWAY
      );
    }
  }

  private transformToRightmoveFormat(property: any) {
    return {
      branch: {
        branch_id: this.branchId,
      },
      property: {
        agent_ref: property.id,
        published: property.status === 'active',
        property_type: this.mapPropertyType(property.propertyType),
        status: this.mapPropertyStatus(property.status),
        new_home: property.isNewBuild || false,
        price_information: {
          price: property.price,
          price_qualifier: property.priceQualifier || 'guide_price',
        },
        details: {
          summary: property.description,
          description: property.fullDescription,
          features: property.features || [],
        },
        address: {
          house_name_number: property.address.houseNumber,
          street_name: property.address.street,
          locality: property.address.locality,
          town: property.address.town,
          county: property.address.county,
          postcode: property.address.postcode,
        },
        media: property.images?.map((image: any) => ({
          media_type: 'image',
          media_url: image.url,
          caption: image.caption || '',
          sort_order: image.order || 0,
        })) || [],
      },
    };
  }

  private mapPropertyType(type: string): string {
    const typeMap = {
      'house': 'house',
      'flat': 'flat_apartment',
      'bungalow': 'bungalow',
      'cottage': 'cottage',
      'terraced': 'terraced',
      'semi-detached': 'semi_detached',
      'detached': 'detached',
    };
    return typeMap[type] || 'house';
  }

  private mapPropertyStatus(status: string): string {
     const statusMap = {
       'active': 'available',
       'sold': 'sold',
       'let': 'let',
       'withdrawn': 'withdrawn',
     };
     return statusMap[status] || 'available';
   }
 }
 ```

2. **Create Property Sync Job**
```typescript
// backend/src/properties/jobs/rightmove-sync.job.ts
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Property } from '../entities/property.entity';
import { RightmoveService } from '../../integrations/rightmove/rightmove.service';

@Injectable()
export class RightmoveSyncJob {
  constructor(
    @InjectRepository(Property)
    private propertyRepository: Repository<Property>,
    private rightmoveService: RightmoveService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async syncPropertiesToRightmove() {
    const properties = await this.propertyRepository.find({
      where: {
        status: 'active',
        rightmoveId: null,
      },
      take: 10, // Sync 10 properties per hour
    });

    for (const property of properties) {
      try {
        const result = await this.rightmoveService.sendProperty(property);
        if (result.success) {
          property.rightmoveId = result.rightmoveId;
          await this.propertyRepository.save(property);
        }
      } catch (error) {
        console.error(`Failed to sync property ${property.id} to Rightmove:`, error);
      }
    }
  }

  @Cron(CronExpression.EVERY_6_HOURS)
  async updateExistingProperties() {
    const properties = await this.propertyRepository.find({
      where: {
        rightmoveId: Not(IsNull()),
        updatedAt: MoreThan(new Date(Date.now() - 6 * 60 * 60 * 1000)),
      },
    });

    for (const property of properties) {
      try {
        await this.rightmoveService.updateProperty(property.rightmoveId, property);
      } catch (error) {
        console.error(`Failed to update property ${property.id} on Rightmove:`, error);
      }
    }
  }
}
```

### Task 3.3: Complete GDPR Compliance
**Timeline:** 4 days  
**Effort:** 16 hours

#### Implementation Steps:

1. **Create Data Processing Service**
```typescript
// backend/src/gdpr/data-processing.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Property } from '../properties/entities/property.entity';
import { Booking } from '../bookings/entities/booking.entity';

@Injectable()
export class DataProcessingService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Property)
    private propertyRepository: Repository<Property>,
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
  ) {}

  async exportUserData(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['properties', 'bookings'],
    });

    if (!user) {
      throw new Error('User not found');
    }

    return {
      personalData: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      properties: user.properties?.map(property => ({
        id: property.id,
        title: property.title,
        address: property.address,
        price: property.price,
        status: property.status,
        createdAt: property.createdAt,
      })) || [],
      bookings: user.bookings?.map(booking => ({
        id: booking.id,
        propertyId: booking.propertyId,
        bookingDate: booking.bookingDate,
        status: booking.status,
        createdAt: booking.createdAt,
      })) || [],
    };
  }

  async deleteUserData(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['properties', 'bookings'],
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Anonymize bookings instead of deleting (for business records)
    await this.bookingRepository.update(
      { userId },
      {
        userId: null,
        anonymizedAt: new Date(),
        personalData: null,
      }
    );

    // Transfer properties to system account or delete if no bookings
    for (const property of user.properties || []) {
      const hasBookings = await this.bookingRepository.count({
        where: { propertyId: property.id },
      });

      if (hasBookings > 0) {
        // Transfer to system account
        property.agentId = 'system';
        await this.propertyRepository.save(property);
      } else {
        // Safe to delete
        await this.propertyRepository.remove(property);
      }
    }

    // Delete user account
    await this.userRepository.remove(user);

    return {
      success: true,
      message: 'User data successfully deleted',
      deletedAt: new Date(),
    };
  }

  async anonymizeOldData() {
    const cutoffDate = new Date();
    cutoffDate.setFullYear(cutoffDate.getFullYear() - 7); // 7 years retention

    // Anonymize old bookings
    await this.bookingRepository.update(
      {
        createdAt: LessThan(cutoffDate),
        anonymizedAt: IsNull(),
      },
      {
        personalData: null,
        anonymizedAt: new Date(),
      }
    );

    // Delete old inactive users
    const inactiveUsers = await this.userRepository.find({
      where: {
        lastLoginAt: LessThan(cutoffDate),
        isActive: false,
      },
    });

    for (const user of inactiveUsers) {
      await this.deleteUserData(user.id);
    }
  }
}
```

2. **Create GDPR Controller**
```typescript
// backend/src/gdpr/gdpr.controller.ts
import { Controller, Get, Delete, Post, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DataProcessingService } from './data-processing.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('GDPR')
@Controller('gdpr')
@UseGuards(JwtAuthGuard)
export class GdprController {
  constructor(private dataProcessingService: DataProcessingService) {}

  @Get('export')
  @ApiOperation({ summary: 'Export user data (GDPR Article 20)' })
  @ApiResponse({ status: 200, description: 'User data exported successfully' })
  async exportData(@Req() req) {
    return this.dataProcessingService.exportUserData(req.user.id);
  }

  @Delete('delete')
  @ApiOperation({ summary: 'Delete user data (GDPR Article 17)' })
  @ApiResponse({ status: 200, description: 'User data deleted successfully' })
  async deleteData(@Req() req) {
    return this.dataProcessingService.deleteUserData(req.user.id);
  }
}
```

3. **Create Consent Management**
```typescript
// backend/src/gdpr/entities/consent.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('user_consents')
export class UserConsent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, user => user.consents)
  user: User;

  @Column()
  userId: string;

  @Column()
  consentType: string; // 'marketing', 'analytics', 'functional'

  @Column()
  granted: boolean;

  @Column({ nullable: true })
  purpose: string;

  @Column({ nullable: true })
  legalBasis: string;

  @CreateDateColumn()
  grantedAt: Date;

  @Column({ nullable: true })
  revokedAt: Date;

  @Column({ nullable: true })
  ipAddress: string;

  @Column({ nullable: true })
  userAgent: string;
}
```

---

## Deployment Checklist

### Pre-Deployment Verification

- [ ] **Environment Configuration**
  - [ ] Production environment variables configured
  - [ ] SSL certificates installed and valid
  - [ ] Database connection strings updated
  - [ ] API keys and secrets properly secured

- [ ] **Security Verification**
  - [ ] Security headers implemented
  - [ ] Rate limiting configured
  - [ ] CORS policies set correctly
  - [ ] Authentication flows tested
  - [ ] GDPR compliance verified

- [ ] **Performance Testing**
  - [ ] Load testing completed
  - [ ] Database queries optimized
  - [ ] Caching implemented and tested
  - [ ] CDN configured for static assets

- [ ] **Monitoring Setup**
  - [ ] Health check endpoints responding
  - [ ] Logging configured and tested
  - [ ] Error tracking (Sentry) configured
  - [ ] Performance monitoring enabled
  - [ ] Alerting rules configured

### Post-Deployment Monitoring

1. **Application Metrics**
   - Response times < 200ms for 95% of requests
   - Error rate < 1%
   - Uptime > 99.9%
   - Memory usage < 80%
   - CPU usage < 70%

2. **Business Metrics**
   - Property listing success rate
   - User registration completion rate
   - Search performance metrics
   - Integration sync success rates

3. **Security Monitoring**
   - Failed authentication attempts
   - Unusual traffic patterns
   - API rate limit violations
   - Security header compliance

---

## Success Criteria

### Technical Criteria
- [ ] All health checks passing
- [ ] 99.9% uptime achieved
- [ ] Response times under 200ms
- [ ] Zero critical security vulnerabilities
- [ ] All integrations functioning correctly

### Business Criteria
- [ ] Property listings sync to Rightmove successfully
- [ ] User registration and authentication working
- [ ] Search functionality performing well
- [ ] GDPR compliance verified
- [ ] UK-specific features operational

### Compliance Criteria
- [ ] GDPR data processing documented
- [ ] Privacy policy updated and accessible
- [ ] Cookie consent implemented
- [ ] Data retention policies enforced
- [ ] User rights (export/delete) functional

---

## Timeline Summary

**Phase 1 (Weeks 1-2): Critical Infrastructure**
- Health checks and monitoring
- Centralized logging
- Error tracking
- Environment configuration
- Security hardening

**Phase 2 (Weeks 3-4): Performance & Scalability**
- Database optimization
- Redis caching
- Container orchestration
- CI/CD pipeline

**Phase 3 (Weeks 5-6): Feature Completion**
- Ordnance Survey integration
- Rightmove integration
- GDPR compliance
- Final testing and deployment

**Total Estimated Effort:** 120 hours across 6 weeks
**Team Size:** 2-3 developers
**Target Production Date:** 6 weeks from start

---

## Risk Mitigation

### High-Risk Items
1. **Third-party API Dependencies**
   - Implement circuit breakers
   - Add fallback mechanisms
   - Monitor API quotas and limits

2. **Database Performance**
   - Implement query monitoring
   - Set up read replicas if needed
   - Plan for horizontal scaling

3. **Security Vulnerabilities**
   - Regular security audits
   - Automated vulnerability scanning
   - Penetration testing before go-live

### Contingency Plans
- Rollback procedures documented
- Database backup and restore tested
- Emergency contact procedures established
- Incident response plan activated

---

*This implementation plan provides a comprehensive roadmap for bringing PropertyMasters UK to production readiness. Each task includes specific code examples, configuration details, and verification steps to ensure successful deployment.*