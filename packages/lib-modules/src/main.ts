import { BuiltinModule } from './BuiltinModule.js';
import { ChatBridge } from './modules/chatBridge/index.js';
import { EconomyUtils } from './modules/economyUtils/index.js';
import { GeoBlock } from './modules/geoBlock/index.js';
import { Gimme } from './modules/gimme/index.js';
import { HighPingKicker } from './modules/highPingKicker/index.js';
import { Lottery } from './modules/lottery/index.js';
import { PlayerOnboarding } from './modules/playerOnboarding/index.js';
import { ServerMessages } from './modules/serverMessages/index.js';
import { Teleports } from './modules/teleports/index.js';
export { BuiltinModule, ICommand, ICommandArgument, ICronJob, IHook } from './BuiltinModule.js';

export * from './dto/index.js';

import { Utils } from './modules/utils/index.js';

let cached: Array<BuiltinModule> | null = null;

export async function getModules(): Promise<Array<BuiltinModule>> {
  if (!cached) {
    cached = [
      new Utils(),
      new Teleports(),
      new PlayerOnboarding(),
      new ServerMessages(),
      new ChatBridge(),
      new Gimme(),
      new HighPingKicker(),
      new EconomyUtils(),
      new Lottery(),
      new GeoBlock(),
    ];
    await Promise.all(cached.map((mod) => mod.construct()));
  }

  return cached;
}
