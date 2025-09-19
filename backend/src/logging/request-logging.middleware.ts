import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { getCorrelationId } from './correlation-id.middleware';

@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger(RequestLoggingMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();
    const correlationId = getCorrelationId();
    
    // Log incoming request
    this.logger.log({
      message: 'Incoming request',
      correlationId,
      method: req.method,
      url: req.url,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      timestamp: new Date().toISOString(),
    });

    // Override res.end to log response
    const originalEnd = res.end.bind(res);
    res.end = function(chunk?: any, encoding?: BufferEncoding | (() => void), cb?: () => void) {
      const duration = Date.now() - startTime;
      
      const responseLog = {
        message: 'Outgoing response',
        correlationId,
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString(),
      };

      if (res.statusCode >= 400) {
        Logger.error(responseLog, RequestLoggingMiddleware.name);
      } else {
        Logger.log(responseLog, RequestLoggingMiddleware.name);
      }

      return originalEnd(chunk, encoding as any, cb);
    } as any;

    next();
  }
}
