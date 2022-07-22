import { Config, config } from '@takaro/shared';

export interface IdpConfig extends Config {
  jwt: {
    secret: string;
  };
}

const coreConfig: IdpConfig = {
  ...config,
  jwt: {
    secret: process.env.JWT_SECRET,
  },
};

export { coreConfig as config };
