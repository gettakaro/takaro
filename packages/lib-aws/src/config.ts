import { Config, IBaseConfig } from '@takaro/config';

interface IAwsConfig extends IBaseConfig {
  aws: {
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
  };
}

const configSchema = {
  aws: {
    region: {
      doc: 'The AWS region to use',
      format: String,
      default: 'eu-west-3',
      env: 'AWS_REGION',
    },
    accessKeyId: {
      doc: 'The AWS access key id to use',
      format: String,
      default: '',
      env: 'AWS_ACCESS_KEY_ID',
    },
    secretAccessKey: {
      doc: 'The AWS secret access key to use',
      format: String,
      default: '',
      env: 'AWS_SECRET_ACCESS_KEY',
    },
  },
};

export const config = new Config<IAwsConfig>([configSchema]);
