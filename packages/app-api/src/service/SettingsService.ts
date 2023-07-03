import { TakaroModelDTO } from '@takaro/util';
import { IsString } from 'class-validator';
import { errors } from '@takaro/util';
import { PaginatedOutput } from '../db/base.js';
import { SettingsModel, SettingsRepo } from '../db/settings.js';
import { TakaroService } from './Base.js';

export enum SETTINGS_KEYS {
  commandPrefix = 'commandPrefix',
  serverChatName = 'serverChatName',
}
export class Settings extends TakaroModelDTO<Settings> {
  @IsString()
  commandPrefix: string;

  @IsString()
  serverChatName: string;
}

export const DEFAULT_SETTINGS: Partial<Settings> = {
  commandPrefix: '/',
  serverChatName: 'Takaro',
};

export class SettingsService extends TakaroService<SettingsModel, Settings, never, never> {
  constructor(public readonly domainId: string, public readonly gameServerId?: string) {
    super(domainId);
  }

  get repo() {
    return new SettingsRepo(this.domainId, this.gameServerId);
  }

  async find(): Promise<PaginatedOutput<never>> {
    // Use the "getAll" method instead
    throw new errors.NotImplementedError();
  }

  async findOne(): Promise<never> {
    // Use the "get" method instead
    throw new errors.NotImplementedError();
  }

  create(): Promise<never> {
    // Use the "init" (created DB record) or "set" (changing a settings value) method instead
    throw new errors.NotImplementedError();
  }

  async delete(): Promise<string> {
    // This will cascade when a domain or gameserver is deleted
    throw new errors.NotImplementedError();
  }

  async update(): Promise<never> {
    // Use the "set" method instead
    throw new errors.NotImplementedError();
  }

  init(): Promise<Settings> {
    return this.repo.create();
  }

  async get(key: SETTINGS_KEYS): Promise<Settings[SETTINGS_KEYS]> {
    const value = await this.repo.get(key);
    return value;
  }

  async set(key: SETTINGS_KEYS, value: Settings[SETTINGS_KEYS]): Promise<Settings[SETTINGS_KEYS]> {
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
    return new Settings().construct(all);
  }
}
