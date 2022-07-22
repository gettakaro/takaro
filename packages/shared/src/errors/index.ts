import { DomainError } from './base';

export class InternalError extends DomainError {
  constructor(originalError?: Error) {
    super('Internal error', { httpStatus: 500, meta: { originalError } });
  }
}

export class NotAuthorized extends DomainError {
  constructor(originalError?: Error) {
    super('Not authorized', { httpStatus: 401, meta: { originalError } });
  }
}
