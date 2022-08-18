import { Config, IBaseConfig } from '@takaro/config';

interface IAgentConfig extends IBaseConfig {
  http: {
    port: number;
  };
  queue: {
    name: string;
  };
  redis: {
    host: string;
    port: number;
    username: string;
    password: string;
    tlsCa: string;
  };
  containerd: {
    socketPath: string;
    namespace: string;
  };
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
      default: 3001,
      env: 'PORT',
    },
  },
  queue: {
    name: {
      doc: 'The name of the queue to use',
      format: String,
      default: 'functions',
      env: 'QUEUE_NAME',
    },
  },
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
    tlsCa: {
      doc: 'Optional TLS certificate, if the redis server is using TLS',
      format: String,
      default: '',
      env: 'REDIS_TLS_CA',
    },
  },
  containerd: {
    socketPath: {
      doc: 'The path to the Docker unix socket',
      format: String,
      default: 'unix:///run/containerd/containerd.sock',
      env: 'CONTAINERD_SOCKET_PATH',
    },
    namespace: {
      doc: 'The namespace to use for containerd',
      format: String,
      default: 'takaro',
      env: 'CONTAINERD_NAMESPACE',
    },
  },
};

export const config = new Config<IAgentConfig>([configSchema]);
