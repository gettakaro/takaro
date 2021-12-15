import { Config, config } from '@takaro/shared';
import dotenv from 'dotenv';

import { CoordinatorModes, modeMapper } from './services/coordinator';

dotenv.config({ path: '.env' });

export interface CoreConfig extends Config {
  coordinator: {
    mode: CoordinatorModes
  };
}


const coreConfig: CoreConfig = {
  ...config,
  coordinator: {
    mode: modeMapper[process.env.COORDINATOR_MODE.toLowerCase() || 'simple']
  }
};

export { coreConfig as config };
