import { ValidationError as CValidationError } from 'class-validator';
import { ZodError as ZValidationError } from 'zod';

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

export class ConfigError extends TakaroError {
  constructor(message: string) {
    super(`ConfigError: ${message}`);
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
    public details?: CValidationError[] | ZValidationError[],
  ) {
    super(message);

    if (details?.length) {
      if (details[0] instanceof ZValidationError) {
        this.message = `${message}: ${details[0].message}`;
      }
    }

    this.http = 400;
  }
}

export class GameServerError extends TakaroError {
  constructor(message: string = 'Game server error') {
    super(message);
    this.http = 500;
  }
}
export class WsTimeOutError extends TakaroError {
  constructor(message: string = 'Websocket timeout Error') {
    super(message);
    this.http = 500;
  }
}

export class BadRequestError extends TakaroError {
  constructor(
    message: string = 'Bad request',
    public details: Record<string, string | number> | undefined = undefined,
  ) {
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

export class TooManyRequestsError extends TakaroError {
  constructor(message = 'Too many requests') {
    super(message);
    this.http = 429;
  }
}
