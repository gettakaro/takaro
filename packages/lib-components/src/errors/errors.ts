import { AxiosError } from 'axios';
import { BaseError } from './base';

export function defineErrorType(apiError: AxiosError<any>) {
  const error = apiError.response?.data.meta.error;

  if (error.code === 'ForbiddenError') {
    return new NotAuthorizedError('Not authorized');
  }

  if (error.code === 'ConflictError') {
    return new UniqueConstraintError('Unique constraint error');
  }

  return new UniqueConstraintError('Unique constraint error');
}

export class ResponseValidationError extends BaseError {
  constructor(message: string, public validationErrors: string[]) {
    super(message, { meta: { validationErrors } });
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
