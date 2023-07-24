import { AxiosError } from 'axios';
import { BaseError } from './base';
import * as Sentry from '@sentry/react';
import { ValidationError } from 'class-validator';

export function defineErrorType(apiError: AxiosError<any>) {
  const error = apiError.response?.data.meta.error;

  if (!error) {
    Sentry.captureException(apiError);
  }
  if (error.code === 'ForbiddenError') {
    return new NotAuthorizedError('Not authorized');
  }

  if (error.code === 'ConflictError') {
    return new UniqueConstraintError('Unique constraint error');
  }

  if (error.code === 'ValidationError') {
    return new ResponseValidationError('Validation error', error.details);
  }
}

export class ResponseValidationError extends BaseError {
  constructor(message: string, public validationErrors: ValidationError[]) {
    super(message, { meta: { validationErrors } });
  }

  parseValidationError(): string[] {
    const errorMessages: string[] = [];
    function extractErrors(validationError: ValidationError) {
      if (validationError.constraints) {
        for (const constraint in validationError.constraints) {
          errorMessages.push(validationError.constraints[constraint]);
        }
      }

      if (validationError.children) {
        for (const child of validationError.children) {
          extractErrors(child);
        }
      }
    }

    for (const detail of this.validationErrors) {
      extractErrors(detail);
    }

    return errorMessages;
  }
}

export class InternalServerError extends BaseError {
  constructor() {
    super('Internal server error');
  }
}

export class UniqueConstraintError extends BaseError {
  constructor(message: string) {
    super(message);
  }
}

export class ResponseClientError extends BaseError {}
export class FailedLogOutError extends BaseError {}
export class NotAuthorizedError extends BaseError {}
