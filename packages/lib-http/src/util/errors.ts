export class TakaroError extends Error {
  public http: number;
  constructor(message: string) {
    super(message);
    this.http = 80;
    this.name = this.constructor.name;
  }
}

export class BadRequestError extends TakaroError {
  constructor(message: string) {
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
