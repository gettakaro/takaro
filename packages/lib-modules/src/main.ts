import { BuiltinModule } from './BuiltinModule.js';
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
    cached = [new Utils()];
    await Promise.all(cached.map((mod) => mod.construct()));
  }

  return cached;
}
