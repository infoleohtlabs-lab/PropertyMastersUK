import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import * as cls from 'cls-hooked';

export const CORRELATION_ID_HEADER = 'x-correlation-id';
export const CLS_NAMESPACE = 'correlation-context';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const correlationId = req.headers[CORRELATION_ID_HEADER] as string || uuidv4();
    
    // Set correlation ID in response header
    res.set(CORRELATION_ID_HEADER, correlationId);
    
    // Create or get CLS namespace
    const namespace = cls.getNamespace(CLS_NAMESPACE) || cls.createNamespace(CLS_NAMESPACE);
    
    // Run the request in the context of the namespace
    namespace.run(() => {
      namespace.set('correlationId', correlationId);
      next();
    });
  }
}

export function getCorrelationId(): string {
  const namespace = cls.getNamespace(CLS_NAMESPACE);
  return namespace?.get('correlationId') || 'unknown';
}
