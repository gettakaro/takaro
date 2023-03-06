import { GameEvents } from '@takaro/gameserver';
import { readdir, readFile } from 'fs/promises';
import path from 'path';
import * as url from 'url';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
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

  async construct() {
    await this.loadType('commands');
    await this.loadType('hooks');
    await this.loadType('cronJobs');
  }

  async loadType(type: 'commands' | 'hooks' | 'cronJobs') {
    const items = this[type] as IModuleItem[];
    if (!items.length) return;

    const folderPath = path.join(__dirname, 'modules', this.name, type);
    const files = await readdir(folderPath);

    for (const item of items) {
      const file = files.find((file) => file.replace('.js', '') === item.name);
      if (!file) {
        throw new Error(
          `Could not find ${item.name} in ${this.name}'s ${type}. Did you provide a function implementation?`
        );
      }

      const fileContents = await readFile(path.join(folderPath, file), 'utf-8');

      item.function = fileContents;
    }
  }
}
