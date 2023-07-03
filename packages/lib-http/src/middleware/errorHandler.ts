import { Request, Response, NextFunction } from 'express';
import { HttpError } from 'routing-controllers';
import { logger, errors } from '@takaro/util';
import { apiResponse } from '../util/apiResponse.js';
import { ValidationError } from 'class-validator';

const log = logger('errorHandler');

export async function ErrorHandler(
  originalError: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
) {
  let status = 500;
  let parsedError = new errors.InternalServerError();

  if (originalError.name === 'BadRequestError') {
    if (originalError.hasOwnProperty('errors')) {
      // @ts-expect-error Error typing is weird in ts... but we validate during runtime so should be OK
      const validationErrors = originalError['errors'] as ValidationError[];
      parsedError = new errors.ValidationError('Validation error', validationErrors);
    }
  }

  if (originalError instanceof HttpError) {
    status = originalError.httpCode;
  }

  if (originalError.name === 'UniqueViolationError') {
    status = 409;
    parsedError = new errors.ConflictError('Unique constraint violation');
  }

  if (originalError.name === 'NotNullViolationError') {
    status = 400;
    parsedError = new errors.BadRequestError('Missing required field');
  }

  if (originalError instanceof errors.TakaroError) {
    status = originalError.http;
    parsedError = originalError;
  }

  log.error(originalError);
  if (status >= 500) {
    log.error(`🔴 FAIL ${req.method} ${req.originalUrl}`, parsedError);
  } else {
    log.warn(`⚠️ FAIL ${req.method} ${req.originalUrl}`, parsedError);
  }

  res.status(status).json(apiResponse({}, { error: parsedError, req, res }));
  return res.end();
}
