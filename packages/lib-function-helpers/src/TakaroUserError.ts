export class TakaroUserError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TakaroUserError';
  }
}
