interface IErrorOptions {
  meta: unknown;
}

export class DomainError extends Error {
  constructor(
    public message: string,
    protected options?: Partial<IErrorOptions>
  ) {
    super(message);
    // Ensure the name of this error is the same as the class name
    this.name = this.constructor.name;
  }
}
