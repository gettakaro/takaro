import { BuiltinModule } from './BuiltinModule.js';
import { PlayerGreeter } from './modules/playerGreeter/index.js';
import { Teleports } from './modules/teleports/index.js';
export {
  BuiltinModule,
  ICommand,
  ICommandArgument,
  ICronJob,
  IHook,
} from './BuiltinModule.js';

import { Utils } from './modules/utils/index.js';

let cached: Array<BuiltinModule> | null = null;

export async function getModules(): Promise<Array<BuiltinModule>> {
  if (!cached) {
    cached = [new Utils(), new Teleports(), new PlayerGreeter()];
    await Promise.all(cached.map((mod) => mod.construct()));
  }

  return cached;
}
