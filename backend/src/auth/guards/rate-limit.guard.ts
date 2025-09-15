import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

@Injectable()
export class RateLimitGuard implements CanActivate {
  private store: RateLimitStore = {};
  private readonly defaultLimit = 5; // 5 attempts
  private readonly defaultWindow = 15 * 60 * 1000; // 15 minutes

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const key = this.generateKey(request);
    
    // Get rate limit configuration from decorator or use defaults
    const limit = this.reflector.get<number>('rateLimit', context.getHandler()) || this.defaultLimit;
    const windowMs = this.reflector.get<number>('rateLimitWindow', context.getHandler()) || this.defaultWindow;
    
    const now = Date.now();
    const record = this.store[key];
    
    // Clean up expired records
    this.cleanupExpiredRecords(now);
    
    if (!record || now > record.resetTime) {
      // First request or window expired, reset counter
      this.store[key] = {
        count: 1,
        resetTime: now + windowMs,
      };
      return true;
    }
    
    if (record.count >= limit) {
      const resetTimeInSeconds = Math.ceil((record.resetTime - now) / 1000);
      throw new HttpException(
        {
          message: 'Too many requests',
          error: 'Rate limit exceeded',
          retryAfter: resetTimeInSeconds,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    
    // Increment counter
    record.count++;
    return true;
  }
  
  private generateKey(request: Request): string {
    // Use IP address and endpoint for rate limiting key
    const ip = request.ip || request.connection.remoteAddress || 'unknown';
    const endpoint = request.route?.path || request.url;
    return `${ip}:${endpoint}`;
  }
  
  private cleanupExpiredRecords(now: number): void {
    Object.keys(this.store).forEach(key => {
      if (this.store[key].resetTime < now) {
        delete this.store[key];
      }
    });
  }
}

// Decorators for configuring rate limits
export const RateLimit = (limit: number) => {
  return (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) => {
    if (descriptor) {
      Reflect.defineMetadata('rateLimit', limit, descriptor.value);
    }
  };
};

export const RateLimitWindow = (windowMs: number) => {
  return (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) => {
    if (descriptor) {
      Reflect.defineMetadata('rateLimitWindow', windowMs, descriptor.value);
    }
  };
};