import { GameEvents } from '@takaro/gameserver';

interface IModuleItem {
  name: string;
  function: string;
}

interface ICommand extends IModuleItem {
  trigger: string;
  helpText: string;
}

interface IHook extends IModuleItem {
  eventType: GameEvents;
}

interface ICronJob extends IModuleItem {
  temporalValue: string;
}

export abstract class BuiltinModule {
  constructor(public name: string) {}

  public commands: Array<ICommand> = [];
  public hooks: Array<IHook> = [];
  public cronJobs: Array<ICronJob> = [];
}
