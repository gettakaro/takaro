import { readdir, readFile } from 'fs/promises';
import path from 'path';
import * as url from 'url';
import { EventTypes } from './dto/index.js';
import { PermissionCreateDTO } from '@takaro/apiclient';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

interface IModuleItem {
  name: string;
  function: string;
}

export interface ICommandArgument {
  name: string;
  type: string;
  helpText?: string;
  defaultValue?: string;
  position?: number;
}

export interface ICommand extends IModuleItem {
  trigger: string;
  helpText?: string;
  arguments?: ICommandArgument[];
}

export interface IHook extends IModuleItem {
  eventType: EventTypes;
}

export interface ICronJob extends IModuleItem {
  temporalValue: string;
}

export abstract class BuiltinModule {
  constructor(
    public name: string,
    public description: string,
    public configSchema: string,
    public uiSchema: string = JSON.stringify({})
  ) {}

  public commands: Array<ICommand> = [];
  public hooks: Array<IHook> = [];
  public cronJobs: Array<ICronJob> = [];
  public permissions: PermissionCreateDTO[] = [];

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
