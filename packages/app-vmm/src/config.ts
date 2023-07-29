import { Config, IBaseConfig } from '@takaro/config';
import { IAuthConfig, authConfigSchema } from '@takaro/auth';
import { errors } from '@takaro/util';
import { queuesConfigSchema, IQueuesConfig } from '@takaro/queues';

interface IAgentConfig extends IBaseConfig {
  http: {
    port: number;
    allowedOrigins: string[];
  };
  firecracker: {
    binary: string;
    kernelImage: string;
    rootfs: string;
    sockets: string;
    logPath: string;
  };
}

const configSchema = {
  http: {
    port: {
      doc: 'The port to bind.',
      // This value can be ANYTHING because it is user provided
      format: (value: unknown) => {
        if (process.env.NODE_ENV === 'test') {
          // This allows us to pass 'undefined' as the port
          // Which lets the tests run without needed to open an actual port
          return value;
        }

        if (typeof value !== 'string' && typeof value !== 'number') {
          throw new errors.ConfigError('Value must be a string or number');
        }

        const parsed = parseInt(value.toString(), 10);

        if (parsed < 0 || parsed > 65535) {
          throw new errors.ConfigError('ports must be within range 0 - 65535');
        }
      },
      default: 3001,
      env: 'PORT',
    },
    allowedOrigins: {
      doc: 'The origins that are allowed to access the API',
      format: Array,
      default: [],
      env: 'CORS_ALLOWED_ORIGINS',
    },
  },
  firecracker: {
    binary: {
      doc: 'Path to Firecracker binary',
      format: String,
      default: '/usr/local/bin/firecracker',
      env: 'FIRECRACKER_BINARY',
    },
    kernelImage: {
      doc: 'Path to the kernel image used by the microVM',
      format: String,
      default: '/app/firecracker/vmlinux.bin',
      env: 'FIRECRACKER_KERNEL_IMAGE',
    },
    rootfs: {
      doc: 'Path to the rootfs used by the microVM',
      format: String,
      default: '/app/firecracker/rootfs.ext4',
      env: 'FIRECRACKER_ROOTFS',
    },
    sockets: {
      doc: 'Path to the socket directory used by Firecracker',
      format: String,
      default: '/tmp/takaro/sockets/',
      env: 'FIRECRACKER_SOCKET',
    },
    logPath: {
      doc: 'Path to the log file used by Firecracker',
      format: String,
      default: '/app/firecracker/',
      env: 'FIRECRACKER_LOG_PATH',
    },
  },
};

export const config = new Config<IAgentConfig & IQueuesConfig & IAuthConfig>([
  configSchema,
  queuesConfigSchema,
  authConfigSchema,
]);
