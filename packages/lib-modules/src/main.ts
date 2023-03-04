import { BuiltinModule } from './BuiltinModule';
export { BuiltinModule } from './BuiltinModule';

import { Ping } from './modules/ping';

let cached: Array<BuiltinModule> | null = null;

export async function getModules(): Promise<Array<BuiltinModule>> {
  if (!cached) {
    cached = [new Ping()];
    await Promise.all(cached.map((mod) => mod.construct()));
  }

  return cached;
}
