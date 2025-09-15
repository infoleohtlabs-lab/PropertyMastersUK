import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Sentry } from './sentry.config';
import { getCorrelationId } from './correlation-id.middleware';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const correlationId = getCorrelationId();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let details: any = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        message = (exceptionResponse as any).message || exception.message;
        details = exceptionResponse;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      details = {
        name: exception.name,
        stack: exception.stack,
      };
    }

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      correlationId,
      message,
      ...(process.env.NODE_ENV === 'development' && details && { details }),
    };

    // Log the error
    this.logger.error({
      ...errorResponse,
      userAgent: request.get('User-Agent'),
      ip: request.ip,
      body: request.body,
      query: request.query,
      params: request.params,
    });

    // Send to Sentry for non-HTTP exceptions or 5xx errors
    if (!(exception instanceof HttpException) || status >= 500) {
      Sentry.withScope((scope) => {
        scope.setTag('correlationId', correlationId);
        scope.setContext('request', {
          method: request.method,
          url: request.url,
          headers: {
            ...request.headers,
            authorization: '[REDACTED]',
            cookie: '[REDACTED]',
          },
          body: request.body,
          query: request.query,
          params: request.params,
        });
        scope.setLevel('error');
        Sentry.captureException(exception);
      });
    }

    response.status(status).json(errorResponse);
  }
}