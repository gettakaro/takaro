import { config } from '../config.js';

export function getRedisConnectionOptions() {
  return {
    host: config.get('redis.host'),
    port: config.get('redis.port'),
    username: config.get('redis.username'),
    password: config.get('redis.password'),
    /*     tls: {
          ca: config.get('redis.tlsCa') ? [config.get('redis.tlsCa')] : undefined,
        }, */
  };
}
