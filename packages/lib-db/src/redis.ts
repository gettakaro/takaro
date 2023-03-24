import { createClient, RedisClientOptions } from 'redis';
import { config } from './config.js';
import { logger } from '@takaro/util';

type RedisClient = ReturnType<typeof createClient>;

class RedisClass {
  private log = logger('redis');

  private clients = new Map<string, RedisClient>();

  async getClient(
    name: string,
    extra: RedisClientOptions = {}
  ): Promise<RedisClient> {
    const cachedClient = this.clients.get(name);

    if (cachedClient) return cachedClient;

    this.log.debug(`Creating new Redis client for ${name}`);
    const client = createClient({
      name,
      username: config.get('redis.username'),
      password: config.get('redis.password'),
      socket: {
        host: config.get('redis.host'),
        port: config.get('redis.port'),
      },
      ...extra,
    });

    await client.connect();
    this.clients.set(name, client);
    return client;
  }
}

export const Redis = new RedisClass();
