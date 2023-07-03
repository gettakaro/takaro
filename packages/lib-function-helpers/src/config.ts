import { Config, IBaseConfig, baseConfigConvict } from '@takaro/config';

interface IHelpersConfig extends IBaseConfig {
  apiClient: {
    token: string;
    url: string;
  };
  data: string;
}

const configSchema = {
  apiClient: {
    token: {
      doc: 'The token to use for the API',
      format: String,
      default: null,
      env: 'API_TOKEN',
    },
    url: {
      doc: 'The URL of the API',
      format: String,
      default: 'https://api.takaro.io',
      env: 'API_URL',
    },
  },
  data: {
    doc: 'JSON encoded object containing data about the triggered event',
    format: String,
    default: '"{}"',
    env: 'DATA',
  },
};

export const config = new Config<IHelpersConfig>([configSchema, baseConfigConvict]);
