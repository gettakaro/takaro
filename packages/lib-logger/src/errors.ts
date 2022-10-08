import { ValidationError as CValidationError } from 'class-validator';
import { ValidationError as YValidationError } from 'yup';

export class TakaroError extends Error {
  public http: number;
  constructor(message: string) {
    super(message);
    this.http = 500;
    this.name = this.constructor.name;
  }
}

export class InternalServerError extends TakaroError {
  constructor() {
    super('Internal server error');
    this.http = 500;
  }
}

export class NotImplementedError extends TakaroError {
  constructor() {
    super('Not implemented');
    this.http = 500;
  }
}

export class ValidationError extends TakaroError {
  constructor(
    message: string,
    public details?: CValidationError[] | YValidationError[]
  ) {
    super(message);

    if (details?.length) {
      if (details[0] instanceof YValidationError) {
        this.message = `${message}: ${details[0].message}`;
      }
    }

    this.http = 400;
  }
}

export class BadRequestError extends TakaroError {
  constructor(message: string = 'Bad request') {
    super(message);
    this.http = 400;
  }
}

/**
 * Intentionally does not accept metadata.
 * log additional info and do not leak info to the client
 */
export class UnauthorizedError extends TakaroError {
  constructor() {
    super('Not authorized');
    this.http = 401;
  }
}

/**
 * Intentionally does not accept metadata.
 * log additional info and do not leak info to the client
 */
export class ForbiddenError extends TakaroError {
  constructor() {
    super('Forbidden');
    this.http = 403;
  }
}

export class NotFoundError extends TakaroError {
  constructor(message = 'Not found') {
    super(message);
    this.http = 404;
  }
}

export class ConflictError extends TakaroError {
  constructor(message = 'Conflict') {
    super(message);
    this.http = 409;
  }
}
