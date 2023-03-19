import { logger } from './logger.js';

export async function sleep(ms: number) {
  const log = logger('sleep');

  log.debug(`sleeping for ${ms}ms`);
  return new Promise((resolve) => setTimeout(resolve, ms));
}
