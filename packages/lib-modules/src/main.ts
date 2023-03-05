import { BuiltinModule } from './BuiltinModule.js';
export { BuiltinModule } from './BuiltinModule.js';

import { Ping } from './modules/ping/index.js';

let cached: Array<BuiltinModule> | null = null;

export async function getModules(): Promise<Array<BuiltinModule>> {
  if (!cached) {
    cached = [new Ping()];
    await Promise.all(cached.map((mod) => mod.construct()));
  }

  return cached;
}
