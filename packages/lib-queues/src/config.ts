import { Config, IBaseConfig } from '@takaro/config';

export interface IRedisConfig extends IBaseConfig {
  redis: {
    host: string;
    port: number;
    username: string;
    password: string;
  };
}

export const redisConfigSchema = {
  redis: {
    host: {
      doc: 'The host of the redis server',
      format: String,
      default: 'localhost',
      env: 'REDIS_HOST',
    },
    port: {
      doc: 'The port of the redis server',
      format: Number,
      default: 6379,
      env: 'REDIS_PORT',
    },
    username: {
      doc: 'The username of the redis server',
      format: String,
      default: '',
      env: 'REDIS_USERNAME',
    },
    password: {
      doc: 'The password of the redis server',
      format: String,
      default: '',
      env: 'REDIS_PASSWORD',
    },
  },
};

export const config = new Config<IRedisConfig>([redisConfigSchema]);
