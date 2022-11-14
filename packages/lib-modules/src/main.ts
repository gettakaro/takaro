import { BuiltinModule } from './BuiltinModule';

import { Ping } from './modules/ping';

let cached: Map<string, BuiltinModule> | null = null;

async function getModules(): Promise<Map<string, BuiltinModule>> {
  if (!cached) {
    cached = new Map<string, BuiltinModule>([['ping', new Ping()]]);
  }

  return cached;
}

export default getModules;
