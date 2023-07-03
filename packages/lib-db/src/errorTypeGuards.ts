import { errors } from '@takaro/util';

export function parseCheckViolationError(error: unknown, constraintName: string): errors.BadRequestError | null {
  if (!(error instanceof Error)) {
    return null;
  }
  if (error.name === 'CheckViolationError') {
    return new errors.BadRequestError(`Check constraint "${constraintName}" failed`);
  }
  return null;
}
