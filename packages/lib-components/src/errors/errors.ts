import { AxiosError } from 'axios';
import { BaseError } from './base';
import * as Sentry from '@sentry/react';
import { ValidationError } from 'class-validator';

// Define a type for the error message mapping
export interface ErrorMessageMapping {
  UniqueConstraintError: string;
  ResponseValidationError: string;
}

export function getErrorUserMessage(
  apiError: AxiosError<any> | null,
  errorMessages: Partial<ErrorMessageMapping>,
): string | string[] | null {
  const defaultMesssage = 'An error occurred. Please try again later.';

  // If there is no error, return null
  if (apiError === null) {
    return null;
  }

  const err = transformError(apiError);

  if (!err) {
    Sentry.captureException(apiError);
    return defaultMesssage;
  }

  if (err instanceof NotAuthorizedError) {
    return 'You are not authorized to perform this action';
  }
  if (err instanceof ResponseValidationError) {
    return err.parseValidationError();
  }
  if (err instanceof BadRequestError) {
    return err.message;
  }

  if (err instanceof UniqueConstraintError) {
    if (err.message === 'Unique constraint violation') {
      const messageType = err.constructor.name as keyof ErrorMessageMapping;
      return errorMessages[messageType] || defaultMesssage;
    } else {
      return err.message;
    }
  }
  return defaultMesssage;
}

export function transformError(apiError: AxiosError<any>) {
  const error = apiError.response?.data.meta.error;

  if (!error) {
    Sentry.captureException(apiError);
  }
  if (error.code === 'ForbiddenError') {
    return new NotAuthorizedError('Not authorized');
  }

  if (error.code === 'ConflictError') {
    return new UniqueConstraintError(error.message);
  }

  if (error.code === 'BadRequestError') {
    return new BadRequestError(error.message);
  }

  if (error.code === 'ValidationError') {
    return new ResponseValidationError('Validation error', error.details);
  }
}

export class ResponseValidationError extends BaseError {
  constructor(
    message: string,
    public validationErrors: ValidationError[],
  ) {
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

export class BadRequestError extends BaseError {
  constructor(message: string) {
    super(message);
  }
}

export class ResponseClientError extends BaseError {}
export class FailedLogOutError extends BaseError {}
export class NotAuthorizedError extends BaseError {}
