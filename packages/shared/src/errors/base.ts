import createError from 'http-errors';

interface IErrorOptions {
  httpStatus: number;
  meta: unknown;
}

export class DomainError extends Error {
  http: createError.HttpError;

  constructor(
    public message: string,
    protected options?: Partial<IErrorOptions>
  ) {
    super(message);

    // Ensure the name of this error is the same as the class name
    this.name = this.constructor.name;

    // This clips the constructor invocation from the stack trace.
    // It's not absolutely essential, but it does make the stack trace a little nicer.
    Error.captureStackTrace(this, this.constructor);

    // Prepare a HTTP version of this error
    if (!this.options.httpStatus) this.options.httpStatus = 500;
    this.http = createError(this.options.httpStatus, this.message);
  }
}
