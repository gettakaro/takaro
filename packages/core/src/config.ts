import { Config, config } from '@takaro/shared';

import { CoordinatorModes, modeMapper } from './services/coordinator';

export interface CoreConfig extends Config {
  coordinator: {
    mode: CoordinatorModes;
  };
}

const coreConfig: CoreConfig = {
  ...config,
  coordinator: {
    mode: modeMapper[process.env.COORDINATOR_MODE.toLowerCase() || 'simple'],
  },
};

export { coreConfig as config };
