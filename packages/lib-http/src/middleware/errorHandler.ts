import { Request, Response, NextFunction } from 'express';
import {
  Middleware,
  ExpressErrorMiddlewareInterface,
} from 'routing-controllers';
import { logger, errors } from '@takaro/logger';
import { apiResponse } from '../main';
import { ValidationError } from 'class-validator';

const log = logger('errorHandler');

@Middleware({ type: 'after' })
export class ErrorHandler implements ExpressErrorMiddlewareInterface {
  // This next parameter is not used but it's needed for express to recognize this function as an error handler
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  error(error: Error, req: Request, res: Response, next: NextFunction) {
    let status = 500;
    let err = new errors.InternalServerError();

    if (error.name === 'BadRequestError') {
      if (error.hasOwnProperty('errors')) {
        // @ts-expect-error Error typing is weird in ts... but we validate during runtime so should be OK
        const validationErrors = error['errors'] as ValidationError[];
        err = new errors.ValidationError('Validation error', validationErrors);
      }
    }

    if (error instanceof errors.TakaroError) {
      status = error.http;
      err = error;
    }

    if (err instanceof errors.TakaroError) {
      status = err.http;
    }

    if (status >= 500) {
      log.error(error);
      log.error(`🔴 FAIL ${req.method} ${req.originalUrl}`, err);
    } else {
      log.warn(`⚠️ FAIL ${req.method} ${req.originalUrl}`, err);
    }

    res.status(status).json(apiResponse({}, err));
    return res.end();
  }
}
