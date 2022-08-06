import { Request, Response, NextFunction } from 'express';
import {
  Middleware,
  ExpressErrorMiddlewareInterface,
} from 'routing-controllers';
import { logger } from '@takaro/logger';

const log = logger('http');

@Middleware({ type: 'after' })
export class ErrorHandler implements ExpressErrorMiddlewareInterface {
  error(error: Error, req: Request, res: Response, next: NextFunction) {
    log.error(`🔴 FAIL ${req.method} ${req.originalUrl}`, { error });
    next();
  }
}
