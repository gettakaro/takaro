import { Config, IBaseConfig } from '@takaro/config';

interface IHttpConfig extends IBaseConfig {
  http: {
    port: number;
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
      default: 3000,
      env: 'PORT',
    },
  },
};

export const config = new Config<IHttpConfig>([configSchema]);
