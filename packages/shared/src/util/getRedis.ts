import IORedis from 'ioredis';

import { config } from '.';

export function getRedis(options?: IORedis.RedisOptions) {
  return new IORedis(config.cache.url, options);
}
