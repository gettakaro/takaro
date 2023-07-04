import { BaseError } from './base';

export function defineErrorType(error: unknown) {
  console.log(error, typeof error);

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
