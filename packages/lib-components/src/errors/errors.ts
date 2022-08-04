import { DomainError } from './base';
import { ValidationError } from 'yup';

export class ResponseValidationError extends DomainError {
  constructor(message: string, public validationErrors: ValidationError[]) {
    super(message, { meta: { validationErrors } });
  }
}

export class InternalServerError extends DomainError {
  constructor() {
    super('Internal server error');
  }
}

export class ResponseClientError extends DomainError {}
export class FailedLogOutError extends DomainError {}
export class NotAuthorizedError extends DomainError {}
