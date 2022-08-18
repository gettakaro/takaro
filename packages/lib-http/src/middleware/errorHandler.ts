import { Request, Response, NextFunction } from 'express';
import {
  Middleware,
  ExpressErrorMiddlewareInterface,
} from 'routing-controllers';
import { logger } from '@takaro/logger';
import { TakaroError } from '../util/errors';

const log = logger('middleware:errorHandler');

@Middleware({ type: 'after' })
export class ErrorHandler implements ExpressErrorMiddlewareInterface {
  // This next parameter is not used but it's needed for express to recognize this function as an error handler
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  error(error: Error, req: Request, res: Response, next: NextFunction) {
    log.error(`🔴 FAIL ${req.method} ${req.originalUrl}`, { error });

    if (error instanceof TakaroError) {
      res.status(error.http).json({
        error: error.message,
      });
      return res.end();
    }

    log.warn('Unknown error, this should be a Takaro error...', { error });
    res.status(500).json({
      error: 'Internal server error',
    });
    res.end();
  }
}
