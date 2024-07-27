import { logger } from './logger.js';
import { sleep } from './sleep.js';

const log = logger('retry');

export const retry = <T>(
  operation: () => Promise<T>,
  delay: number,
  retries: number,
  cleanup: () => Promise<void>,
): Promise<T> => {
  return new Promise((resolve, reject) => {
    return operation()
      .then(resolve)
      .catch((reason) => {
        if (retries > 0) {
          return cleanup()
            .then(() =>
              sleep(delay)
                .then(() => {
                  log.debug(`Retrying operation ${operation.name}...`);
                  return retry(operation, delay, retries - 1, cleanup);
                })
                .then(resolve)
                .catch(reject),
            )
            .catch(reject);
        }
        log.verbose(`Exhausted all retries for ${operation.name}. Rejecting with reason:`, reason);
        return reject(reason);
      });
  });
};
