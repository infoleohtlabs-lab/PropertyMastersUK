import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PerformanceMonitoringService } from './performance-monitoring.service';

@Injectable()
export class QueryPerformanceInterceptor implements NestInterceptor {
  private readonly logger = new Logger(QueryPerformanceInterceptor.name);

  constructor(
    private readonly performanceMonitoringService: PerformanceMonitoringService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const executionTime = Date.now() - startTime;
          
          // Log slow API requests that might indicate database performance issues
          if (executionTime > 2000) { // 2 seconds threshold for API requests
            this.logger.warn(
              `Slow API request detected: ${method} ${url} took ${executionTime}ms`,
              {
                method,
                url,
                executionTime,
                timestamp: new Date().toISOString(),
              },
            );
          }
        },
        error: (error) => {
          const executionTime = Date.now() - startTime;
          this.logger.error(
            `API request failed: ${method} ${url} after ${executionTime}ms`,
            {
              method,
              url,
              executionTime,
              error: error.message,
              timestamp: new Date().toISOString(),
            },
          );
        },
      }),
    );
  }
}