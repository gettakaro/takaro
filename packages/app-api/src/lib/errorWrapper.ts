import { errors } from '@takaro/logger';

/**
 * Executes an arbitrary function, if the result is null/undefined, it throws a Takaro NotFound error
 * @param fn Function to execute
 * @param message Optional message to fill in the Error
 * @returns
 */
export function throwIfNull(
  fn: (...args: any[]) => Promise<any>,
  message = 'Not found'
) {
  return async (...args: any[]) => {
    const result = await fn(...args);
    if (result === null || result === undefined) {
      throw new errors.NotFoundError(message);
    }
    return result;
  };
}
