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

  _next: NextFunction,
) {
  let status = 500;
  let parsedError = new errors.InternalServerError();

  if (originalError.name === 'BadRequestError') {
    if (Object.prototype.hasOwnProperty.call(originalError, 'errors')) {
      // @ts-expect-error Error typing is weird in ts... but we validate during runtime so should be OK
      const validationErrors = originalError['errors'] as ValidationError[];
      parsedError = new errors.ValidationError('Validation error', validationErrors);
      log.warn('⚠️ Validation errror', { details: validationErrors.map((e) => JSON.stringify(e.target, null, 2)) });
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

  if (originalError.name === 'CheckViolationError') {
    status = 400;
    parsedError = new errors.BadRequestError('Invalid data provided');
  }

  if ('constraint' in originalError && originalError['constraint'] === 'currency_positive') {
    status = 400;
    parsedError = new errors.BadRequestError('Not enough currency');
  }

  if (originalError instanceof errors.TakaroError) {
    status = originalError.http;
    parsedError = originalError;
  }

  // If error is a JSON.parse error
  if (originalError instanceof SyntaxError) {
    if (
      originalError.message.includes('Unexpected token') ||
      originalError.message.includes('Unexpected end of JSON input')
    ) {
      status = 400;
      parsedError = new errors.BadRequestError('Invalid JSON');
    }
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
