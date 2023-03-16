import { logger } from './logger.js';

const log = logger('sleep');

export async function sleep(ms: number) {
  log.debug(`sleeping for ${ms}ms`);
  return new Promise((resolve) => setTimeout(resolve, ms));
}
