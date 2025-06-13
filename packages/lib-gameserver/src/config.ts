import { Config, IBaseConfig } from '@takaro/config';

interface IGameServerLibConfig extends IBaseConfig {
  connector: {
    host: string;
  };
}

const configSchema = {
  connector: {
    host: {
      doc: 'The host of the connector',
      format: String,
      default: 'http://localhost:3003',
      env: 'CONNECTOR_HOST',
    },
  },
};

export const config = new Config<IGameServerLibConfig>([configSchema]);
