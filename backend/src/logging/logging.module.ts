import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { CorrelationIdMiddleware } from './correlation-id.middleware';
import { RequestLoggingMiddleware } from './request-logging.middleware';
import { winstonConfig } from './winston.config';

@Module({
  imports: [
    WinstonModule.forRoot(winstonConfig),
  ],
  providers: [
    CorrelationIdMiddleware,
    RequestLoggingMiddleware,
  ],
  exports: [
    WinstonModule,
  ],
})
export class LoggingModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CorrelationIdMiddleware, RequestLoggingMiddleware)
      .forRoutes('*');
  }
}