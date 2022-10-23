import { TakaroDTO } from '@takaro/http';
import { IsString } from 'class-validator';
import { SettingsModel, SettingsRepo } from '../db/settings';
import { TakaroService } from './Base';

export enum SETTINGS_KEYS {
  commandPrefix = 'commandPrefix',
  serverChatName = 'serverChatName',
}
export class Settings extends TakaroDTO<Settings> {
  @IsString()
  commandPrefix: string;

  @IsString()
  serverChatName: string;
}

export const DEFAULT_SETTINGS: Settings = new Settings({
  commandPrefix: '/',
  serverChatName: 'Takaro',
});

export class SettingsService extends TakaroService<SettingsModel> {
  constructor(
    public readonly domainId: string,
    public readonly gameServerId?: string
  ) {
    super(domainId);
  }

  get repo() {
    return new SettingsRepo(this.domainId, this.gameServerId);
  }

  init() {
    return this.repo.create();
  }

  async get(key: SETTINGS_KEYS): Promise<Settings[SETTINGS_KEYS]> {
    const value = await this.repo.get(key);
    return value;
  }

  async set(
    key: SETTINGS_KEYS,
    value: Settings[SETTINGS_KEYS]
  ): Promise<Settings[SETTINGS_KEYS]> {
    await this.repo.set(key, value);
    return value;
  }

  async getMany(keys: Array<SETTINGS_KEYS>): Promise<Partial<Settings>> {
    const all = await this.repo.getAll();
    const result: Partial<Settings> = {};

    for (const key of keys) {
      result[key] = all[key];
    }

    return result;
  }

  async getAll() {
    const all = await this.repo.getAll();
    return new Settings(all);
  }
}
