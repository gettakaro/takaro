import { Config, IBaseConfig } from '@takaro/config';

enum CLUSTER_MODE {
  SINGLE = 'single',
  CLUSTER = 'cluster',
}

interface IHttpConfig extends IBaseConfig {
  http: {
    port: number;
  };
  auth: {
    adminSecret: string;
    saltRounds: number;
    jwtSecret: string;
    jwtExpiresIn: string;
  };
  clusterMode: CLUSTER_MODE;
}

const configSchema = {
  http: {
    port: {
      doc: 'The port to bind.',
      // This value can be ANYTHING because it is user provided
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      format: (value: any) => {
        if (process.env.NODE_ENV === 'test') {
          // This allows us to pass 'undefined' as the port
          // Which lets the tests run without needed to open an actual port
          return value;
        }
        value = parseInt(value, 10);

        if (value < 0 || value > 65535) {
          throw new Error('ports must be within range 0 - 65535');
        }
      },
      default: 3000,
      env: 'PORT',
    },
  },
  auth: {
    adminSecret: {
      doc: 'The secret used to authenticate admin requests',
      format: String,
      default: null,
      env: 'ADMIN_SECRET',
    },
    saltRounds: {
      doc: 'The number of rounds to use when salting passwords',
      format: Number,
      default: 10,
      env: 'SALT_ROUNDS',
    },
    jwtSecret: {
      doc: 'The secret used to sign JWTs',
      format: String,
      default: null,
      env: 'JWT_SECRET',
    },
    jwtExpiresIn: {
      doc: 'The time until a JWT expires',
      format: String,
      default: '1 day',
      env: 'JWT_EXPIRES_IN',
    },
  },
  clusterMode: {
    doc: 'The mode to run the app in',
    format: ['single', 'cluster'],
    default: CLUSTER_MODE.SINGLE,
    env: 'CLUSTER_MODE',
  },
};

export const config = new Config<IHttpConfig>([configSchema]);
