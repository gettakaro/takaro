import { BuiltinModule } from './BuiltinModule.js';
import { ChatBridge } from './modules/chatBridge/index.js';
import { DailyRewards } from './modules/dailyRewards/index.js';
import { EconomyUtils } from './modules/economyUtils/index.js';
import { GeoBlock } from './modules/geoBlock/index.js';
import { Gimme } from './modules/gimme/index.js';
import { HighPingKicker } from './modules/highPingKicker/index.js';
import { Lottery } from './modules/lottery/index.js';
import { PlayerOnboarding } from './modules/playerOnboarding/index.js';
import { ServerMessages } from './modules/serverMessages/index.js';
import { Teleports } from './modules/teleports/index.js';
import { TimedShutdown } from './modules/timedShutdown/index.js';
import { Utils } from './modules/utils/index.js';

export { BuiltinModule, ICommand, ICommandArgument, ICronJob, IHook, IFunction } from './BuiltinModule.js';
export * from './dto/index.js';

let cached: Array<BuiltinModule<unknown>> | null = null;

export function getModules(): Array<BuiltinModule<unknown>> {
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
      new TimedShutdown(),
      new DailyRewards(),
    ];
  }

  return cached;
}
