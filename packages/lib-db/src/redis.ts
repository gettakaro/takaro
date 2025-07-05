import { createClient, RedisClientOptions } from 'redis';
import { config } from './config.js';
import { logger, health } from '@takaro/util';

export type RedisClient = ReturnType<typeof createClient>;

class RedisClass {
  private log = logger('redis');

  private clients = new Map<string, RedisClient>();

  /**
   * Get a Redis client from the cache, or create a new one.
   * The client will already be connected.
   * @param name Name for the client, used to cache the client.
   * @param extra Any extra Redis options to pass to the client.
   * @returns
   */
  async getClient(name: string, extra: RedisClientOptions = {}): Promise<RedisClient> {
    const normalizedName = name.toLowerCase().replaceAll(/[^a-z0-9]/g, '_');
    const cachedClient = this.clients.get(normalizedName);

    if (cachedClient) return cachedClient;

    this.log.debug(`Creating new Redis client for ${normalizedName}`);

    const client = createClient({
      name: normalizedName,
      username: config.get('redis.username'),
      password: config.get('redis.password'),
      socket: {
        host: config.get('redis.host'),
        port: config.get('redis.port'),
      },
      ...extra,
    });

    await client.connect();
    this.clients.set(normalizedName, client);

    health.registerHook(normalizedName, async () => {
      await client.ping();
    });

    return client;
  }

  /**
   * Disconnect all clients and clear the cache.
   */
  async destroy() {
    for (const [name, client] of this.clients.entries()) {
      this.log.debug(`Disconnecting Redis client ${name}`);
      await client.disconnect();
    }
  }
}

export const Redis = new RedisClass();
